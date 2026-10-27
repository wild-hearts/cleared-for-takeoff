#!/usr/bin/env python3
"""Upload the rendered lesson videos to Mux and record their playback IDs.

Usage:
    MUX_TOKEN_ID=... MUX_TOKEN_SECRET=... python3 tools/course-video/mux_upload.py /path/to/course-video

Reads tools/course-video/lessons.json, uploads <video-dir>/<lesson id>.mp4 for every
lesson that has no playbackId yet, waits for Mux to finish processing, and writes the
signed playback ID back into lessons.json after each one. Safe to re-run: lessons that
already have a playbackId are skipped, so an interrupted run carries on where it stopped.

Every asset gets a signed playback policy (the site streams with tokens from
api/video-token.js), basic video quality, English auto-generated captions, and the
lesson ID as passthrough so it can be found in the Mux dashboard.

Needs a Mux API access token with Video read/write permission (Mux dashboard,
Settings, Access Tokens). This is not the signing key the website uses.
"""
import base64
import json
import os
import subprocess
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
LESSONS = os.path.join(HERE, "lessons.json")
API = "https://api.mux.com/video/v1"


def auth():
    tid, secret = os.environ.get("MUX_TOKEN_ID"), os.environ.get("MUX_TOKEN_SECRET")
    if not tid or not secret:
        sys.exit("Set MUX_TOKEN_ID and MUX_TOKEN_SECRET first.")
    return "Basic " + base64.b64encode(f"{tid}:{secret}".encode()).decode()


def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": AUTH, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)["data"]


def upload(lesson, path):
    up = call("POST", "/uploads", {
        "cors_origin": "*",
        "new_asset_settings": {
            "playback_policy": ["signed"],
            "video_quality": "basic",
            "passthrough": lesson["id"],
            "meta": {"title": lesson["title"] or lesson["id"], "external_id": lesson["id"]},
            "inputs": [{"generated_subtitles": [{"language_code": "en", "name": "English (auto)"}]}],
        },
    })
    # curl streams the file and honours the session's proxy settings.
    subprocess.run(["curl", "-sS", "--fail", "-X", "PUT", "-T", path, "-H", "Content-Type: video/mp4", up["url"]],
                   check=True, stdout=subprocess.DEVNULL)
    while True:
        u = call("GET", f"/uploads/{up['id']}")
        if u.get("asset_id"):
            break
        if u["status"] in ("errored", "cancelled", "timed_out"):
            raise RuntimeError(f"upload {u['status']}: {u.get('error')}")
        time.sleep(5)
    while True:
        a = call("GET", f"/assets/{u['asset_id']}")
        if a["status"] == "ready":
            break
        if a["status"] == "errored":
            raise RuntimeError(f"asset errored: {a.get('errors')}")
        time.sleep(10)
    signed = [p["id"] for p in a.get("playback_ids", []) if p["policy"] == "signed"]
    if not signed:
        raise RuntimeError("asset has no signed playback ID")
    return a["id"], signed[0]


def main():
    global AUTH
    AUTH = auth()
    vdir = sys.argv[1] if len(sys.argv) > 1 else "."
    lessons = json.load(open(LESSONS))
    for lesson in lessons:
        if lesson.get("playbackId"):
            continue
        path = os.path.join(vdir, lesson["id"] + ".mp4")
        if not os.path.exists(path):
            print(f"{lesson['id']}: no video at {path}, skipped", flush=True)
            continue
        asset_id, playback_id = upload(lesson, path)
        lesson["assetId"], lesson["playbackId"] = asset_id, playback_id
        json.dump(lessons, open(LESSONS, "w"), indent=1)
        print(f"{lesson['id']}: ready, playback {playback_id}", flush=True)
    left = [l["id"] for l in lessons if not l.get("playbackId")]
    print("all uploaded" if not left else f"still missing: {', '.join(left)}")


if __name__ == "__main__":
    main()
