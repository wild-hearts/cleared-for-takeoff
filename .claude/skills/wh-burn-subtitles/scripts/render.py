#!/usr/bin/env python3
"""
render.py - put an SRT onto a video, and optionally mix in a dub track, in ONE encode.

    # soft-mux (fast, reversible, toggleable)
    render.py --video in.mp4 --srt in.en.srt --soft-mux --out final/out.mp4

    # burn in (always visible; required for socials)
    render.py --video in.mp4 --srt in.en.srt --style social --out final/out.mp4

    # 20-second preview plus a frame grab, before committing to a full render
    render.py --video in.mp4 --srt in.en.srt --preview --out /tmp/preview.mp4

    # full localised cut: burn target subs + dub over the original as a low bed
    render.py --video in.mp4 --srt in.es.srt --dub in.es.m4a --bed-volume 0.08 --out out.mp4

Part of the Wild Hearts video toolkit.
Adapted from Jianshuo Wang's MIT-licensed wjs-burning-subtitles.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

# FontSize and MarginV are quoted against a 1080-high frame and scaled from there.
STYLES = {
    "lesson": {"FontSize": 24, "MarginV": 40, "Outline": 2, "Alignment": 2},
    "social": {"FontSize": 30, "MarginV": 260, "Outline": 3, "Alignment": 2},
    "cinema": {"FontSize": 22, "MarginV": 60, "Outline": 2, "Alignment": 2},
}
BASELINE_HEIGHT = 1080


def find_ffmpeg(need_libass: bool) -> str:
    """Return an ffmpeg that can do the job, preferring the one on PATH."""
    candidates = [p for p in (shutil.which("ffmpeg"), "/tmp/ff_bin/ffmpeg") if p]
    if not candidates:
        sys.exit("error: ffmpeg not found. apt-get install -y ffmpeg  |  brew install ffmpeg")

    for path in candidates:
        if not Path(path).exists() and not shutil.which(Path(path).name):
            continue
        if not need_libass:
            return path
        out = subprocess.run([path, "-hide_banner", "-filters"],
                             capture_output=True, text=True).stdout
        if any(f" {f} " in out for f in ("subtitles", "ass")):
            return path

    sys.exit(
        "error: no ffmpeg build with libass - burn-in is impossible with this binary.\n"
        "  Linux: apt-get install -y ffmpeg\n"
        "  macOS: curl -fsSL -o /tmp/ff.zip https://evermeet.cx/ffmpeg/getrelease/zip && \\\n"
        "         unzip -o /tmp/ff.zip -d /tmp/ff_bin\n"
        "  Or use --soft-mux, which needs no libass."
    )


def probe_height(ffmpeg: str, video: str) -> int:
    ffprobe = shutil.which("ffprobe") or str(Path(ffmpeg).with_name("ffprobe"))
    out = subprocess.run(
        [ffprobe, "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=height", "-of", "json", video],
        capture_output=True, text=True).stdout
    try:
        return int(json.loads(out)["streams"][0]["height"])
    except (KeyError, IndexError, ValueError, json.JSONDecodeError):
        return BASELINE_HEIGHT


def escape_for_filter(path: str) -> str:
    r"""Escape a path for use inside an ffmpeg filter argument.

    The filter parser eats ':' and '\', and the graph parser eats ','.
    Order matters: backslashes first, or you escape your own escapes.
    """
    return path.replace("\\", "\\\\").replace(":", r"\:").replace(",", r"\,").replace("'", r"\'")


def build_style(name: str, height: int, font: str | None) -> str:
    """force_style string, scaled from the 1080p baseline."""
    base = dict(STYLES[name])
    scale = max(height, 1) / BASELINE_HEIGHT
    parts = [
        f"FontSize={max(10, round(base['FontSize'] * scale))}",
        f"MarginV={max(8, round(base['MarginV'] * scale))}",
        f"Outline={max(1, round(base['Outline'] * scale))}",
        f"Alignment={base['Alignment']}",
        "PrimaryColour=&H00FFFFFF",   # ASS is &HAABBGGRR - alpha, blue, green, red
        "OutlineColour=&H00000000",
        "BorderStyle=1",
        "Shadow=0",
        "Bold=0",
    ]
    if font:
        parts.insert(0, f"FontName={font}")
    # Commas inside force_style must not terminate the filter argument.
    return ",".join(parts).replace(",", r"\,")


def main() -> int:
    ap = argparse.ArgumentParser(description="Burn or mux subtitles, and mix a dub, in one encode.")
    ap.add_argument("--video", required=True)
    ap.add_argument("--srt")
    ap.add_argument("--dub", help="dub audio track to mix over the original")
    ap.add_argument("--out", required=True)
    ap.add_argument("--soft-mux", action="store_true",
                    help="embed as a toggleable mov_text track instead of burning")
    ap.add_argument("--style", choices=sorted(STYLES), default="lesson")
    ap.add_argument("--font", help="font family name, e.g. 'DejaVu Sans'")
    ap.add_argument("--lang", default="eng", help="ISO 639-2 code for the muxed track (default eng)")
    ap.add_argument("--bed-volume", type=float, default=0.10,
                    help="original audio level under the dub, 0 to drop it (default 0.10)")
    ap.add_argument("--crf", type=int, default=20)
    ap.add_argument("--preset", default="medium")
    ap.add_argument("--preview", action="store_true",
                    help="render only the first 20 s and grab a frame at 10 s")
    ap.add_argument("--dry-run", action="store_true", help="print the command, render nothing")
    args = ap.parse_args()

    video = Path(args.video)
    if not video.exists():
        sys.exit(f"error: {video} does not exist")
    if args.srt and not Path(args.srt).exists():
        sys.exit(f"error: {args.srt} does not exist")
    if args.dub and not Path(args.dub).exists():
        sys.exit(f"error: {args.dub} does not exist")
    if not args.srt and not args.dub:
        sys.exit("error: nothing to do - pass --srt, --dub, or both")

    burning = bool(args.srt) and not args.soft_mux
    ffmpeg = find_ffmpeg(need_libass=burning)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    cmd = [ffmpeg, "-hide_banner", "-y", "-i", str(video)]
    if args.dub:
        cmd += ["-i", args.dub]
    if args.soft_mux and args.srt:
        cmd += ["-i", args.srt]
    if args.preview:
        cmd += ["-t", "20"]

    # --- audio ---------------------------------------------------------------
    audio_filter = None
    if args.dub:
        if args.bed_volume > 0:
            # Keep the original under the dub so room tone and music survive.
            audio_filter = (f"[0:a]volume={args.bed_volume}[bed];"
                            f"[bed][1:a]amix=inputs=2:duration=longest:dropout_transition=0,"
                            f"dynaudnorm=f=200:g=5[aout]")
        else:
            audio_filter = "[1:a]anull[aout]"

    # --- video ---------------------------------------------------------------
    if burning:
        height = probe_height(ffmpeg, str(video))
        style = build_style(args.style, height, args.font)
        vf = f"subtitles='{escape_for_filter(str(Path(args.srt).resolve()))}':force_style='{style}'"

        if audio_filter:
            cmd += ["-filter_complex", f"[0:v]{vf}[vout];{audio_filter}",
                    "-map", "[vout]", "-map", "[aout]"]
        else:
            cmd += ["-vf", vf, "-map", "0:v", "-map", "0:a?"]
        cmd += ["-c:v", "libx264", "-crf", str(args.crf), "-preset", args.preset,
                "-pix_fmt", "yuv420p"]
    else:
        # No burn: the video stream is untouched.
        if audio_filter:
            cmd += ["-filter_complex", audio_filter, "-map", "0:v", "-map", "[aout]"]
        else:
            cmd += ["-map", "0:v", "-map", "0:a?"]
        if args.soft_mux and args.srt:
            cmd += ["-map", f"{2 if args.dub else 1}:0",
                    "-c:s", "mov_text",
                    "-metadata:s:s:0", f"language={args.lang}"]
        cmd += ["-c:v", "copy"]

    if audio_filter or burning or args.dub:
        cmd += ["-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
    else:
        cmd += ["-c:a", "copy"]

    cmd += ["-movflags", "+faststart", str(out)]

    print("\n  " + " ".join(f'"{c}"' if " " in c else c for c in cmd) + "\n")
    if args.dry_run:
        return 0

    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        print(p.stderr[-3000:], file=sys.stderr)
        return p.returncode

    size_mb = out.stat().st_size / 1_000_000
    print(f"  wrote {out}  ({size_mb:.1f} MB)")

    if args.preview:
        frame = out.with_suffix(".frame.png")
        subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
                        "-ss", "10", "-i", str(out), "-frames:v", "1", str(frame)],
                       capture_output=True)
        if frame.exists():
            print(f"  frame  {frame}")
            print("  LOOK AT THAT FRAME before you commit to the full render.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
