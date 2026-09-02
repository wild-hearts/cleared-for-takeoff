#!/usr/bin/env python3
"""
audio_doctor.py - diagnose sound problems on a video or audio file, and optionally
fix the loudness with a correct two-pass loudnorm.

    python3 audio_doctor.py input.mp4
    python3 audio_doctor.py input.mp4 --target -14          # YouTube
    python3 audio_doctor.py input.mp4 --normalise out.mp4   # two-pass loudnorm
    python3 audio_doctor.py input.mp4 --json                # machine readable

Measures rather than guesses. Every number printed came out of ffmpeg.
Part of the Wild Hearts video toolkit.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

FFMPEG = shutil.which("ffmpeg") or "/tmp/ff_bin/ffmpeg"
FFPROBE = shutil.which("ffprobe") or "/tmp/ff_bin/ffprobe"

# Loudness targets by destination, in LUFS.
TARGETS = {
    "youtube": -14.0,
    "course": -16.0,
    "podcast": -16.0,
    "social": -14.0,
    "broadcast-au": -24.0,
}


def run(cmd: list[str]) -> str:
    """Run a command, return stdout+stderr as text. ffmpeg reports on stderr."""
    p = subprocess.run(cmd, capture_output=True, text=True)
    return (p.stdout or "") + (p.stderr or "")


def require_tools() -> None:
    missing = [n for n, p in (("ffmpeg", FFMPEG), ("ffprobe", FFPROBE))
               if not Path(p).exists() and not shutil.which(n)]
    if missing:
        sys.exit(f"error: {', '.join(missing)} not found. "
                 f"Install with: apt-get install -y ffmpeg  |  brew install ffmpeg")


def probe(path: str) -> dict:
    """Container and stream facts."""
    out = run([FFPROBE, "-v", "error", "-show_format", "-show_streams",
               "-of", "json", path])
    try:
        data = json.loads(out)
    except json.JSONDecodeError:
        sys.exit(f"error: ffprobe could not read {path}\n{out.strip()[:400]}")

    audio = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
    video = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
    if audio is None:
        sys.exit(f"error: {path} has no audio stream. Nothing to repair.")

    fmt = data.get("format", {})
    return {
        "duration": float(fmt.get("duration") or audio.get("duration") or 0.0),
        "codec": audio.get("codec_name", "?"),
        "channels": int(audio.get("channels") or 0),
        "layout": audio.get("channel_layout", "?"),
        "sample_rate": int(audio.get("sample_rate") or 0),
        "bit_rate": int(audio.get("bit_rate") or 0),
        "has_video": video is not None,
        "video_codec": (video or {}).get("codec_name"),
        "resolution": (f"{video['width']}x{video['height']}"
                       if video and video.get("width") else None),
        "fps": (video or {}).get("r_frame_rate"),
    }


def measure_loudness(path: str, target: float) -> dict:
    """Pass 1 of two-pass loudnorm. Returns the measured_* values."""
    out = run([FFMPEG, "-hide_banner", "-nostats", "-i", path, "-af",
               f"loudnorm=I={target}:TP=-1.0:LRA=11:print_format=json",
               "-f", "null", "-"])
    # loudnorm prints a JSON object as the last brace-delimited block.
    blocks = re.findall(r"\{[^{}]*\}", out, re.S)
    for block in reversed(blocks):
        try:
            j = json.loads(block)
        except json.JSONDecodeError:
            continue
        if "input_i" in j:
            def num(key: str) -> float:
                v = j.get(key, "0")
                try:
                    return float(v)
                except (TypeError, ValueError):
                    return float("-inf")  # loudnorm emits "-inf" on silence
            return {
                "input_i": num("input_i"),
                "input_tp": num("input_tp"),
                "input_lra": num("input_lra"),
                "input_thresh": num("input_thresh"),
                "target_offset": num("target_offset"),
            }
    return {}


def measure_stats(path: str) -> dict:
    """astats: per-channel peak, RMS, DC offset, flat factor, noise floor."""
    out = run([FFMPEG, "-hide_banner", "-nostats", "-i", path,
               "-af", "astats=measure_perchannel=all:measure_overall=all",
               "-f", "null", "-"])

    overall: dict[str, float] = {}
    channels: list[dict[str, float]] = []
    current: dict[str, float] | None = None

    for line in out.splitlines():
        line = line.strip()
        if re.match(r"^\[Parsed_astats.*Channel:\s*\d+", line) or line.endswith("Channel: 1") \
                or re.search(r"Channel:\s*\d+$", line):
            current = {}
            channels.append(current)
            continue
        if "Overall" in line and line.rstrip().endswith("Overall"):
            current = overall
            continue
        m = re.search(r"(DC offset|Peak level dB|RMS level dB|Flat factor|Noise floor dB|"
                      r"Dynamic range|Peak count):\s*(-?[\d.]+|-?inf|nan)", line)
        if m and current is not None:
            key, raw = m.group(1), m.group(2)
            try:
                current[key] = float(raw)
            except ValueError:
                current[key] = float("-inf") if "inf" in raw else float("nan")

    return {"overall": overall, "channels": [c for c in channels if c]}


def diagnose(info: dict, loud: dict, stats: dict, target: float) -> list[tuple[str, str, str]]:
    """Return [(severity, problem, suggested filter), ...] worst first."""
    found: list[tuple[str, str, str]] = []
    ov = stats.get("overall", {})

    flat = ov.get("Flat factor")
    if flat is not None and flat > 0:
        found.append(("HIGH", f"Clipping - flat factor {flat:.2f} (samples pinned at full scale)",
                      "adeclip=window=55:overlap=75   # run FIRST, before anything else"))

    tp = loud.get("input_tp")
    if tp is not None and tp > -0.5:
        found.append(("HIGH", f"True peak {tp:.1f} dBTP - will clip on lossy transcode",
                      "loudnorm with TP=-1.0"))

    ii = loud.get("input_i")
    if ii is not None and ii != float("-inf"):
        delta = ii - target
        if delta < -4:
            found.append(("HIGH", f"Too quiet - {ii:.1f} LUFS against a {target:.0f} LUFS target "
                                  f"({abs(delta):.1f} dB under)",
                          f"two-pass loudnorm I={target:.0f}:TP=-1.0:LRA=11"))
        elif delta > 3:
            found.append(("MED", f"Too loud - {ii:.1f} LUFS against a {target:.0f} LUFS target "
                                 f"({delta:.1f} dB over)",
                          f"two-pass loudnorm I={target:.0f}:TP=-1.0:LRA=11"))
        elif abs(delta) > 1:
            found.append(("LOW", f"Loudness {ii:.1f} LUFS, target {target:.0f} LUFS "
                                 f"({delta:+.1f} dB)",
                          f"two-pass loudnorm I={target:.0f}:TP=-1.0:LRA=11"))

    lra = loud.get("input_lra")
    if lra is not None and lra > 15:
        found.append(("MED", f"Very wide loudness range ({lra:.1f} LU) - quiet parts will be "
                             f"lost on a laptop speaker",
                      "acompressor=threshold=-20dB:ratio=3:attack=20:release=250:makeup=2"))

    nf = ov.get("Noise floor dB")
    if nf is not None and nf != float("-inf"):
        if nf > -40:
            found.append(("HIGH", f"Loud noise floor ({nf:.1f} dB) - audible hiss or room tone",
                          "arnndn=m=/tmp/std.rnnn   # or afftdn=nr=16:nf=-35:tn=1"))
        elif nf > -50:
            found.append(("MED", f"Noise floor {nf:.1f} dB - hiss audible in the gaps",
                          "afftdn=nr=12:nf=-40:tn=1"))

    dc = ov.get("DC offset")
    if dc is not None and abs(dc) > 0.001:
        found.append(("MED", f"DC offset {dc:.4f} - wastes headroom, ADC or cabling fault",
                      "highpass=f=20"))

    chans = stats.get("channels", [])
    if len(chans) >= 2:
        rms = [c.get("RMS level dB") for c in chans[:2]]
        if all(r is not None and r != float("-inf") for r in rms):
            gap = abs(rms[0] - rms[1])
            if gap > 12:
                good = 0 if rms[0] > rms[1] else 1
                found.append(("HIGH", f"Channel imbalance {gap:.1f} dB "
                                      f"(L {rms[0]:.1f} / R {rms[1]:.1f}) - likely a dead channel",
                              f"pan=stereo|c0=c{good}|c1=c{good}"))
            elif gap < 0.05 and info["channels"] == 2:
                found.append(("LOW", "Both channels identical - mono content in a stereo container, "
                                     "doubling the bitrate for nothing",
                              "-ac 1 -b:a 96k"))

    if info["sample_rate"] and info["sample_rate"] < 44100:
        found.append(("MED", f"Sample rate {info['sample_rate']} Hz - below CD quality",
                      "aresample=48000   # cannot add detail, but stops further degradation"))

    if info["bit_rate"] and 0 < info["bit_rate"] < 96000:
        found.append(("LOW", f"Audio bitrate {info['bit_rate'] // 1000} kbps - lossy artefacts baked in",
                      "re-export from the original recording if it still exists"))

    order = {"HIGH": 0, "MED": 1, "LOW": 2}
    found.sort(key=lambda f: order[f[0]])
    return found


def normalise(path: str, out_path: str, target: float, loud: dict, has_video: bool) -> int:
    """Pass 2: apply loudnorm with the measured values from pass 1."""
    if not loud or loud.get("input_i") == float("-inf"):
        sys.exit("error: could not measure loudness - the file may be silent.")

    af = (f"loudnorm=I={target}:TP=-1.0:LRA=11"
          f":measured_I={loud['input_i']}"
          f":measured_TP={loud['input_tp']}"
          f":measured_LRA={loud['input_lra']}"
          f":measured_thresh={loud['input_thresh']}"
          f":offset={loud['target_offset']}"
          f":linear=true:print_format=summary")

    cmd = [FFMPEG, "-hide_banner", "-y", "-i", path]
    if has_video:
        cmd += ["-c:v", "copy"]
    cmd += ["-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
            "-movflags", "+faststart", out_path]

    print(f"\n  rendering -> {out_path}")
    print(f"  {' '.join(cmd[:6])} ... -af loudnorm(...)\n")
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        print(p.stderr[-2000:], file=sys.stderr)
        return p.returncode

    verify = measure_loudness(out_path, target)
    if verify:
        print(f"  verified: {verify['input_i']:.1f} LUFS integrated, "
              f"{verify['input_tp']:.1f} dBTP true peak")
        if abs(verify["input_i"] - target) > 1.0:
            print(f"  WARNING: landed {verify['input_i'] - target:+.1f} dB off target. "
                  f"Source may be heavily limited already.")
    print("\n  Nothing here has been listened to. Play 30 seconds of the loudest passage "
          "before this goes anywhere public.")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Diagnose and fix audio problems on video/audio files.")
    ap.add_argument("input", help="video or audio file")
    ap.add_argument("--target", type=float, default=None,
                    help="target integrated loudness in LUFS (default -16, course video)")
    ap.add_argument("--for", dest="dest", choices=sorted(TARGETS),
                    help="preset target: " + ", ".join(f"{k}={v:g}" for k, v in TARGETS.items()))
    ap.add_argument("--normalise", "--normalize", dest="normalise", metavar="OUT",
                    help="apply two-pass loudnorm and write to OUT")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    args = ap.parse_args()

    require_tools()
    src = Path(args.input)
    if not src.exists():
        sys.exit(f"error: {src} does not exist")

    target = args.target if args.target is not None else TARGETS.get(args.dest or "", -16.0)

    info = probe(str(src))
    loud = measure_loudness(str(src), target)
    stats = measure_stats(str(src))
    problems = diagnose(info, loud, stats, target)

    if args.json:
        print(json.dumps({"file": str(src), "target_lufs": target, "stream": info,
                          "loudness": loud, "stats": stats,
                          "problems": [{"severity": s, "problem": p, "fix": f}
                                       for s, p, f in problems]}, indent=2, default=str))
        return 0

    mins, secs = divmod(info["duration"], 60)
    print(f"\n  {src.name}")
    print(f"  {'=' * (len(src.name) + 2)}\n")
    print(f"  duration      {int(mins)}m {secs:04.1f}s")
    if info["has_video"]:
        print(f"  video         {info['video_codec']} {info['resolution']} @ {info['fps']}")
    print(f"  audio         {info['codec']} {info['channels']}ch ({info['layout']}) "
          f"{info['sample_rate']} Hz"
          + (f" {info['bit_rate'] // 1000} kbps" if info["bit_rate"] else ""))

    if loud:
        print(f"\n  integrated    {loud['input_i']:.1f} LUFS   (target {target:.0f})")
        print(f"  true peak     {loud['input_tp']:.1f} dBTP")
        print(f"  range         {loud['input_lra']:.1f} LU")
    ov = stats.get("overall", {})
    if "Noise floor dB" in ov:
        print(f"  noise floor   {ov['Noise floor dB']:.1f} dB")
    if "Flat factor" in ov:
        print(f"  flat factor   {ov['Flat factor']:.2f}"
              + ("   <- clipped samples present" if ov["Flat factor"] > 0 else ""))

    print()
    if not problems:
        print("  No problems found. Loudness, peaks, noise floor and channels all read clean.")
        print("  This is a measurement, not a listening test. Play it before you publish it.\n")
        return 0

    print(f"  {len(problems)} problem(s), worst first:\n")
    for sev, problem, fix in problems:
        mark = {"HIGH": "!!", "MED": " !", "LOW": "  "}[sev]
        print(f"  {mark} [{sev:4}] {problem}")
        print(f"          fix: {fix}\n")

    # Canonical filter order. Getting this wrong makes each stage amplify the last
    # one's damage - repair damaged samples first, normalise loudness last.
    ORDER = ["pan=", "adeclip", "adeclick", "highpass", "lowpass", "arnndn", "afftdn",
             "deesser", "acompressor", "aresample", "loudnorm"]

    def rank(f: str) -> int:
        for i, prefix in enumerate(ORDER):
            if f.startswith(prefix):
                return i
        return len(ORDER)

    chain = sorted(
        (f.split("   #")[0].strip()
         for _, _, f in problems
         if not f.startswith(("-", "re-export", "two-pass"))),
        key=rank,
    )
    if chain:
        print("  Suggested chain (one encode, canonical order - see SKILL.md):\n")
        print(f'    ffmpeg -i "{src.name}" -c:v copy -af "\\')
        print("      " + ",\\\n      ".join(chain) + "\" \\")
        print('      -c:a aac -b:a 192k -ar 48000 -movflags +faststart out.mp4\n')
        if any("loudnorm" in f for _, _, f in problems):
            print("  loudnorm is NOT in that chain on purpose - it needs measured values from\n"
                  "  a first pass. Run the chain above, then --normalise the result.\n")
    if any("loudnorm" in f for _, _, f in problems):
        print(f"  For the loudness alone, correctly two-passed:\n")
        print(f'    python3 {Path(__file__).name} "{src.name}" --target {target:.0f} '
              f'--normalise fixed.mp4\n')

    if args.normalise:
        return normalise(str(src), args.normalise, target, loud, info["has_video"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
