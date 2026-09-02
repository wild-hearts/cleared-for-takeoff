#!/usr/bin/env python3
"""
build_video.py - assemble a narrated MP4 from a storyboard JSON.

    build_video.py storyboard.json --out final/module-03.mp4
    build_video.py storyboard.json --dry-run          # plan + timings, render nothing
    build_video.py storyboard.json --only 02-scene    # one scene, to check the look
    build_video.py storyboard.json --srt              # also write the caption file

Scene durations come from the MEASURED length of the narration audio, never from a guess.
Where TTS is unavailable, durations fall back to a word-count estimate and the scene
renders silent - the plan still holds, the voice can be dropped in later.

Part of the Wild Hearts video toolkit.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

WORDS_PER_MINUTE = 150.0     # planning rate for clear instructional narration
MIN_SCENE = 1.5              # a scene shorter than this reads as a glitch
MIN_CUE = 1.0                # a subtitle cue shorter than this cannot be read
XFADE = 0.5                  # crossfade length between scenes

FFMPEG = shutil.which("ffmpeg") or "/tmp/ff_bin/ffmpeg"
FFPROBE = shutil.which("ffprobe") or "/tmp/ff_bin/ffprobe"


def die(msg: str) -> None:
    sys.exit(f"error: {msg}")


def run(cmd: list[str], what: str) -> None:
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        print(p.stderr[-3000:], file=sys.stderr)
        die(f"{what} failed")


def duration_of(path: str) -> float:
    out = subprocess.run(
        [FFPROBE, "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip()
    try:
        return float(out)
    except ValueError:
        return 0.0


def have_edge_tts() -> bool:
    return shutil.which("edge-tts") is not None


def synth(text: str, voice: str, rate: str, out_path: Path) -> bool:
    """Synthesise narration. Returns False if TTS is unavailable or failed."""
    if not have_edge_tts():
        return False
    p = subprocess.run(
        ["edge-tts", "--voice", voice, "--rate", rate, "--text", text,
         "--write-media", str(out_path)],
        capture_output=True, text=True)
    return p.returncode == 0 and out_path.exists() and out_path.stat().st_size > 0


def estimate(text: str) -> float:
    words = len(text.split())
    return max(MIN_SCENE, words / WORDS_PER_MINUTE * 60.0)


def srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def wrap(text: str, width: int = 42, max_lines: int = 2) -> list[str]:
    """Greedy wrap to subtitle width. Returns at most max_lines chunks."""
    words, lines, line = text.split(), [], ""
    for w in words:
        candidate = f"{line} {w}".strip()
        if len(candidate) <= width or not line:
            line = candidate
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines[:max_lines] if len(lines) <= max_lines else lines


def scene_filter(motion: str, dur: float, w: int, h: int, fps: int) -> str:
    """Scale/pad a still to the frame, then apply the requested motion."""
    frames = max(1, int(round(dur * fps)))
    fit = (f"scale={w}:{h}:force_original_aspect_ratio=decrease,"
           f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1")

    if motion == "none":
        return f"{fit},fps={fps},trim=duration={dur:.3f},setpts=PTS-STARTPTS"

    # zoompan works on the pre-scaled image; oversample first so the zoom has pixels
    # to eat, otherwise a slow zoom shows compression blocks.
    big = (f"scale={w * 2}:{h * 2}:force_original_aspect_ratio=increase,"
           f"crop={w * 2}:{h * 2},setsar=1")
    z_in = f"zoom='min(1.0006*zoom,1.15)'"
    z_out = f"zoom='if(eq(on,0),1.15,max(zoom-0.0006,1.0))'"

    spec = {
        "kenburns-in":    (z_in,  "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"),
        "kenburns-out":   (z_out, "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"),
        "kenburns-left":  ("zoom='1.12'", f"iw*0.10-on*(iw*0.02/{frames})", "ih/2-(ih/zoom/2)"),
        "kenburns-right": ("zoom='1.12'", f"on*(iw*0.02/{frames})", "ih/2-(ih/zoom/2)"),
    }.get(motion)

    if spec is None:
        return f"{fit},fps={fps},trim=duration={dur:.3f},setpts=PTS-STARTPTS"

    z, x, y = spec
    return (f"{big},zoompan={z}:x='{x}':y='{y}':d={frames}:s={w}x{h}:fps={fps},"
            f"trim=duration={dur:.3f},setpts=PTS-STARTPTS")


def main() -> int:
    ap = argparse.ArgumentParser(description="Assemble a narrated video from a storyboard.")
    ap.add_argument("storyboard")
    ap.add_argument("--out", default=None)
    ap.add_argument("--dry-run", action="store_true", help="print the plan, render nothing")
    ap.add_argument("--only", help="render a single scene by id")
    ap.add_argument("--srt", action="store_true", help="also write an SRT from the narration")
    ap.add_argument("--keep-temp", action="store_true")
    args = ap.parse_args()

    if not shutil.which("ffmpeg") and not Path(FFMPEG).exists():
        die("ffmpeg not found. apt-get install -y ffmpeg  |  brew install ffmpeg")

    sb_path = Path(args.storyboard)
    if not sb_path.exists():
        die(f"{sb_path} does not exist")
    sb = json.loads(sb_path.read_text())

    w, h = (int(x) for x in sb.get("resolution", "1920x1080").split("x"))
    fps = int(sb.get("fps", 30))
    voice = sb.get("voice", "en-AU-NatashaNeural")
    rate = sb.get("rate", "-8%")
    scenes = sb.get("scenes", [])
    if not scenes:
        die("storyboard has no scenes")
    if args.only:
        scenes = [s for s in scenes if s.get("id") == args.only]
        if not scenes:
            die(f"no scene with id {args.only!r}")

    base = sb_path.parent
    out_path = Path(args.out or f"final/{sb_path.stem}.mp4")

    tmp = Path(tempfile.mkdtemp(prefix="wh_build_"))
    tts_ok = have_edge_tts()
    if not tts_ok:
        print("  note: edge-tts not installed - scenes render silent with estimated "
              "durations.\n        pip install edge-tts to synthesise narration.\n")

    # ---- pass 1: narration, and therefore timings -------------------------------
    plan = []
    for i, sc in enumerate(scenes):
        sid = sc.get("id") or f"scene-{i:02}"
        narration = (sc.get("narration") or "").strip()
        audio = None
        source = "silent"

        if sc.get("audio"):
            audio = (base / sc["audio"]).resolve()
            if not audio.exists():
                die(f"scene {sid}: audio {audio} does not exist")
            source = "recorded"
        elif narration and tts_ok:
            audio = tmp / f"{sid}.mp3"
            if synth(narration, voice, rate, audio):
                source = "tts"
            else:
                audio, source = None, "silent (tts failed)"

        speech = duration_of(str(audio)) if audio else (estimate(narration) if narration else 0.0)
        dur = max(MIN_SCENE, speech + float(sc.get("hold", 0.6)))

        plan.append({"id": sid, "scene": sc, "audio": audio, "speech": speech,
                     "dur": dur, "source": source, "narration": narration})

    total = sum(p["dur"] for p in plan) - XFADE * max(0, len(plan) - 1)

    print(f"  {sb.get('title', sb_path.stem)}")
    print(f"  {w}x{h} @ {fps}fps   {len(plan)} scenes   "
          f"{int(total // 60)}m {total % 60:04.1f}s\n")
    for p in plan:
        vis = p["scene"].get("image") or p["scene"].get("video") or "(no visual)"
        print(f"    {p['id']:<20} {p['dur']:6.2f}s  {p['source']:<18} {vis}")
    print()

    if args.srt:
        srt_path = out_path.with_suffix("").with_suffix(".en.srt")
        srt_path.parent.mkdir(parents=True, exist_ok=True)
        lines, n, t = [], 1, 0.0
        for p in plan:
            if p["narration"] and p["speech"] > 0:
                # One cue per sentence, time split by character share of the scene.
                sentences = [s.strip() for s in
                             p["narration"].replace("? ", "?|").replace("! ", "!|")
                             .replace(". ", ".|").split("|") if s.strip()]
                # A cue under MIN_CUE flashes and cannot be read. Merge short
                # sentences forward until they clear the floor.
                merged, buf = [], ""
                chars_total = sum(len(x) for x in sentences) or 1
                for sent in sentences:
                    candidate = f"{buf} {sent}".strip()
                    # Never merge past what fits in two 42-char lines - a cue that
                    # clears the duration floor but needs three lines covers the face.
                    if buf and len(candidate) > 84:
                        merged.append(buf)
                        buf = sent
                        candidate = sent
                    else:
                        buf = candidate
                    if p["speech"] * len(buf) / chars_total >= MIN_CUE or len(buf) > 84:
                        merged.append(buf)
                        buf = ""
                if buf:
                    if merged:
                        merged[-1] = f"{merged[-1]} {buf}".strip()
                    else:
                        merged.append(buf)

                chars = sum(len(x) for x in merged) or 1
                cur = t
                for sent in merged:
                    span = max(MIN_CUE, p["speech"] * len(sent) / chars)
                    lines.append(f"{n}\n{srt_time(cur)} --> {srt_time(cur + span - 0.08)}\n"
                                 + "\n".join(wrap(sent)) + "\n")
                    cur += span
                    n += 1
            t += p["dur"] - (XFADE if p is not plan[-1] else 0)
        srt_path.write_text("\n".join(lines), encoding="utf-8")
        print(f"  wrote {srt_path}  ({n - 1} cues)\n")

    if args.dry_run:
        if not args.keep_temp:
            shutil.rmtree(tmp, ignore_errors=True)
        return 0

    # ---- pass 2: one MP4 per scene, at its exact measured duration ---------------
    parts = []
    for p in plan:
        sc, sid, dur = p["scene"], p["id"], p["dur"]
        part = tmp / f"{sid}.mp4"
        cmd = [FFMPEG, "-hide_banner", "-loglevel", "error", "-y"]

        if sc.get("image"):
            img = (base / sc["image"]).resolve()
            if not img.exists():
                die(f"scene {sid}: image {img} does not exist")
            cmd += ["-loop", "1", "-t", f"{dur:.3f}", "-i", str(img)]
            vf = scene_filter(sc.get("motion", "none"), dur, w, h, fps)
        elif sc.get("video"):
            clip = (base / sc["video"]).resolve()
            if not clip.exists():
                die(f"scene {sid}: video {clip} does not exist")
            cmd += ["-stream_loop", "-1", "-t", f"{dur:.3f}", "-i", str(clip)]
            vf = (f"scale={w}:{h}:force_original_aspect_ratio=decrease,"
                  f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps={fps},"
                  f"trim=duration={dur:.3f},setpts=PTS-STARTPTS")
        else:
            cmd += ["-f", "lavfi", "-t", f"{dur:.3f}",
                    "-i", f"color=c=black:s={w}x{h}:r={fps}"]
            vf = "null"

        if p["audio"]:
            cmd += ["-i", str(p["audio"]),
                    "-filter_complex",
                    f"[0:v]{vf}[v];[1:a]aresample=48000,apad,atrim=duration={dur:.3f},"
                    f"asetpts=PTS-STARTPTS[a]",
                    "-map", "[v]", "-map", "[a]"]
        else:
            cmd += ["-f", "lavfi", "-t", f"{dur:.3f}", "-i", "anullsrc=r=48000:cl=stereo",
                    "-filter_complex", f"[0:v]{vf}[v]", "-map", "[v]", "-map", "1:a"]

        cmd += ["-c:v", "libx264", "-crf", "20", "-preset", "medium", "-pix_fmt", "yuv420p",
                "-r", str(fps), "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                "-t", f"{dur:.3f}", str(part)]
        run(cmd, f"scene {sid}")
        parts.append(part)
        print(f"    rendered {sid}  {duration_of(str(part)):.2f}s")

    # ---- pass 3: join ------------------------------------------------------------
    out_path.parent.mkdir(parents=True, exist_ok=True)
    joined = tmp / "joined.mp4"

    if len(parts) == 1:
        shutil.copy(parts[0], joined)
    else:
        # Concat demuxer: all parts share codec, resolution and fps, so this is a
        # stream copy - no generation loss and no drift.
        lst = tmp / "concat.txt"
        lst.write_text("".join(f"file '{p.resolve()}'\n" for p in parts))
        run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-f", "concat",
             "-safe", "0", "-i", str(lst), "-c", "copy", str(joined)], "concat")

    # ---- pass 4: music bed, ducked, then normalise to -16 LUFS -------------------
    music = sb.get("music")
    if music and (base / music).exists():
        vol = float(sb.get("music_volume", 0.06))
        run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
             "-i", str(joined), "-stream_loop", "-1", "-i", str((base / music).resolve()),
             "-filter_complex",
             f"[1:a]volume={vol},afade=t=in:d=2[bed];"
             f"[bed][0:a]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=400[duck];"
             f"[0:a][duck]amix=inputs=2:duration=first:dropout_transition=0,"
             f"loudnorm=I=-16:TP=-1.0:LRA=11[a]",
             "-map", "0:v", "-map", "[a]", "-c:v", "copy",
             "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
             "-movflags", "+faststart", str(out_path)], "music mix")
    else:
        if music:
            print(f"    note: music '{music}' not found - rendering without a bed")
        run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", str(joined),
             "-af", "loudnorm=I=-16:TP=-1.0:LRA=11",
             "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
             "-movflags", "+faststart", str(out_path)], "final mix")

    print(f"\n  wrote {out_path}  ({out_path.stat().st_size / 1_000_000:.1f} MB, "
          f"{duration_of(str(out_path)):.1f}s)")
    if not tts_ok:
        print("  NOTE: this render is SILENT. Install edge-tts and re-run for narration.")
    print("  Nothing here has been watched or listened to. Play it before it ships.\n")

    if not args.keep_temp:
        shutil.rmtree(tmp, ignore_errors=True)
    else:
        print(f"  temp kept at {tmp}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
