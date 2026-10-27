#!/usr/bin/env python3
"""Copy lesson titles, durations and Mux playback IDs from lessons.json into the site.

Usage: python3 tools/course-video/apply.py

Lesson metadata is duplicated across the site (the server library, and the client
copies on the dashboard, watch page and kids library). This keeps them in step: for
every lesson in lessons.json it rewrites the matching `{ id: '...' }` line in each file.
A null title leaves the existing title alone (the kids lessons keep theirs). A playback
ID is only written once the lesson has one, so running this before the Mux upload
updates titles and durations everywhere except the server library.
"""
import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
LESSONS = json.load(open(os.path.join(ROOT, "tools/course-video/lessons.json")))
FILES = ["api/video-library.js", "course/watch.html", "course/dashboard.html", "course/kids-library.js"]
STR = r"'((?:[^'\\]|\\.)*)'"


def js(s):
    return s.replace("\\", "\\\\").replace("'", "\\'")


def set_field(line, field, value):
    return re.sub(rf"\b{field}:\s*{STR}", lambda m: f"{field}: '{js(value)}'", line, count=1)


def main():
    by_id = {l["id"]: l for l in LESSONS}
    for rel in FILES:
        path = os.path.join(ROOT, rel)
        lines = open(path).read().split("\n")
        hits = 0
        for i, line in enumerate(lines):
            m = re.search(rf"\bid:\s*{STR}", line)
            lesson = by_id.get(m.group(1)) if m else None
            if not lesson:
                continue
            new = set_field(line, "duration", lesson["duration"])
            if lesson.get("title"):
                new = set_field(new, "title", lesson["title"])
            if rel == "api/video-library.js" and lesson.get("playbackId"):
                new = set_field(new, "playbackId", lesson["playbackId"])
            if new != line:
                lines[i], hits = new, hits + 1
        open(path, "w").write("\n".join(lines))
        print(f"{rel}: {hits} lessons updated")


if __name__ == "__main__":
    main()
