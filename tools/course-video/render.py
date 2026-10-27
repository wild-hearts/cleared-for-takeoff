#!/usr/bin/env python3
"""Render lesson videos from slide PDFs and per-slide narration MP3s.

Usage:
    python3 tools/course-video/render.py --pdfs DIR --audio DIR --out DIR [lesson-id ...]

--pdfs   folder holding the deck PDFs named as in lessons.json "deckPdf"
--audio  folder holding the narration audio, laid out as in lessons.json "audio"
         (for example junior-ai-navigators/week-02/slide-01.mp3)
--out    where <lesson-id>.mp4 and <lesson-id>.json (chapter times) are written

With no lesson IDs, renders every lesson. Each slide is held for its narration plus
a short lead-in and tail; [pause] and [long pause] tags in the narration add extra
hold time, because the voice itself adds little silence for them. 1920x1080, 15 fps,
H.264 tuned for still images, AAC 128k stereo.
"""
import argparse, json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def duration(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f],
                                capture_output=True, text=True).stdout)


def hold(text):
    return (0.9 + 2.5 * len(re.findall(r"\[pause\]", text)) + 5 * len(re.findall(r"\[long pause\]", text))
            + 1 * len(re.findall(r"\[short pause\]", text)))


def render(lesson, a):
    work = os.path.join(a.out, "work", lesson["id"])
    img = os.path.join(a.out, "work", "img-" + lesson["deckPdf"].removesuffix(".pdf"))
    os.makedirs(work, exist_ok=True); os.makedirs(img, exist_ok=True)
    if not os.path.exists(os.path.join(img, "done")):
        run(["pdftoppm", "-png", "-scale-to-x", "1920", "-scale-to-y", "1080", os.path.join(a.pdfs, lesson["deckPdf"]), os.path.join(img, "p")])
        open(os.path.join(img, "done"), "w").close()
    pages = sorted(p for p in os.listdir(img) if p.startswith("p-"))
    slides = json.load(open(os.path.join(ROOT, lesson["narration"])))["slides"]
    width = 3 if len(slides) >= 100 else 2
    segs, chapters, total = [], [], 0.0
    for s in slides[lesson["slides"][0] - 1:lesson["slides"][1]]:
        n = s["slide"]
        mp3 = os.path.join(a.audio, lesson["audio"], f"slide-{n:0{width}d}.mp3")
        t = 0.4 + duration(mp3) + hold(s["narration"])
        seg = os.path.join(work, f"s{n:03d}.mp4")
        if not os.path.exists(seg):
            run(["ffmpeg", "-y", "-loop", "1", "-framerate", "15", "-t", f"{t:.3f}", "-i", os.path.join(img, pages[n - 1]), "-i", mp3,
                 "-filter_complex", "[1:a]adelay=400|400,aresample=48000,apad[a]", "-map", "0:v", "-map", "[a]", "-t", f"{t:.3f}",
                 "-c:v", "libx264", "-tune", "stillimage", "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p", "-r", "15", "-g", "150",
                 "-c:a", "aac", "-b:a", "128k", "-ac", "2", "-ar", "48000", seg])
        segs.append(seg); chapters.append((round(total, 3), s["heading"])); total += t
    lst = os.path.join(work, "list.txt")
    open(lst, "w").write("".join(f"file '{x}'\n" for x in segs))
    out = os.path.join(a.out, lesson["id"] + ".mp4")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", out])
    json.dump({"id": lesson["id"], "duration": duration(out), "chapters": chapters}, open(os.path.join(a.out, lesson["id"] + ".json"), "w"))
    print(lesson["id"], f"{duration(out) / 60:.1f} min", flush=True)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--pdfs", required=True); p.add_argument("--audio", required=True); p.add_argument("--out", required=True)
    p.add_argument("ids", nargs="*")
    a = p.parse_args()
    lessons = json.load(open(os.path.join(HERE, "lessons.json")))
    for lesson in lessons:
        if not a.ids or lesson["id"] in a.ids:
            render(lesson, a)


if __name__ == "__main__":
    main()
