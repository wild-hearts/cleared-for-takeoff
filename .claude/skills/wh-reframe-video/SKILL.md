---
name: wh-reframe-video
description: Convert video between aspect ratios for different platforms - 16:9 to 9:16 for Reels, Shorts and TikTok, 16:9 to 1:1 for feed posts, or vertical back to horizontal. Covers crop versus blurred-pad versus letterbox, keeping the speaker in frame, safe zones for platform UI, and caption placement that survives the crop. Triggers - "vertical version", "make it for Reels", "9:16", "square version for the feed", "crop this for TikTok", "Shorts cut".
---

# wh-reframe-video

Same content, different shaped hole.

Adapted from Jianshuo Wang's MIT-licensed `wjs-reframing-video`
(https://github.com/jianshuo/claude-skills).

## Target sizes

| Platform | Ratio | Pixels | Max length |
|---|---|---|---|
| YouTube Shorts | 9:16 | 1080x1920 | 60 s |
| Instagram Reels | 9:16 | 1080x1920 | 90 s |
| TikTok | 9:16 | 1080x1920 | 10 min |
| Instagram feed | 4:5 | 1080x1350 | 60 s |
| LinkedIn feed | 1:1 or 4:5 | 1080x1080 | 10 min |
| YouTube, course | 16:9 | 1920x1080 | - |

**Verify these before you rely on them.** Platform specs change quarterly and this table
is a snapshot, not a source of truth.

## Three ways to fill the frame

### 1. Crop - the good one, when the subject cooperates

```bash
# 16:9 -> 9:16, centred crop
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920,setsar=1" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a copy out.mp4

# off-centre: x is the left edge of the crop window
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih:(iw-ih*9/16)*0.35:0,scale=1080:1920,setsar=1" \
  -c:v libx264 -crf 20 -c:a copy out.mp4
```

A 16:9 to 9:16 crop throws away **68% of the horizontal frame**. That is not a small
adjustment. Anything at the edges - a slide's bullet points, a second speaker, a lower
third - is gone. Check what you are cutting before you cut it.

### 2. Blurred pad - the safe one, for slides and screen recordings

Full frame in the middle, a blurred enlargement of itself filling the space above and
below. Nothing is lost and it reads as deliberate.

```bash
ffmpeg -i in.mp4 -filter_complex \
"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,\
 boxblur=luma_radius=40:luma_power=2[bg];\
 [0:v]scale=1080:1920:force_original_aspect_ratio=decrease[fg];\
 [bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a copy out.mp4
```

The background must be scaled to **cover** the target frame
(`force_original_aspect_ratio=increase`) before it is cropped. Scaling it to width alone
(`scale=1080:-2`) leaves it shorter than 1920 and the crop fails with
"Invalid too big or non positive size". Verified against ffmpeg 6.1.

Use this for anything where the whole frame matters: slides, charts, screen capture,
two people in shot.

### 3. Solid letterbox - when the brand demands it

```bash
ffmpeg -i in.mp4 -vf "scale=1080:-2,pad=1080:1920:0:(1920-ih)/2:color=0x1a3a5c,setsar=1" \
  -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a copy out.mp4
```

Honest but wasteful - a third of the screen is a coloured rectangle. Better than a bad
crop; worse than a blurred pad. The bars are also usable space: put a title in the top
band and the logo in the bottom.

## Keeping the speaker in frame

For a static shot, crop once and be done. For a speaker who moves, or a two-hander where
the active speaker changes, a fixed crop will lose someone.

Options, cheapest first:

1. **Find the best static crop.** Sample frames across the video, find the horizontal band
   that contains the face in most of them, crop there. Right most of the time, and free.
2. **Segment and crop per shot.** Split at the visual cuts, choose a crop per segment,
   rejoin. Manual but reliable.
3. **Track the face.** MediaPipe FaceLandmarker or an OpenCV Haar cascade per second,
   smooth the x-positions with a moving average, feed the result as a time-varying crop
   expression. Real work; only worth it on long footage. Smooth aggressively - unsmoothed
   tracking produces a crop that jitters and it is unwatchable.

Sample a frame every ten seconds and look at them before committing to a static crop.
Twelve thumbnails takes a minute and catches the shot where she stands up.

## Safe zones

Every vertical platform covers parts of the frame with its own interface. Keep anything
that must be read inside these margins on a 1080x1920 frame:

| Edge | Reserve |
|---|---|
| Top | 220 px - platform header, account name |
| Bottom | 320 px - caption, sound attribution, CTA button |
| Right | 180 px - like, comment, share, follow column |
| Left | 60 px |

That leaves roughly 840x1380 of genuinely safe area. Captions belong at `MarginV=260` -
which is why `wh-burn-subtitles --style social` uses exactly that.

## Order of operations

Reframe **after** the edit and colour, **before** the caption burn. Captions burned at
16:9 and then cropped to 9:16 lose their edges; captions burned at 9:16 are placed for
9:16. This is the single most common way a vertical cut ends up with half a word on screen.

```
edit -> audio repair -> reframe -> burn captions -> deliver
```

## Verify

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,sample_aspect_ratio \
  -of default=nw=1 out.mp4
ffmpeg -hide_banner -y -ss 5 -i out.mp4 -frames:v 1 /tmp/frame.png   # then Read it
```

`sample_aspect_ratio` must be `1:1`. Anything else means the file will display stretched
on some players, and `setsar=1` was left out of the filter chain.

Look at the frame. Check the subject is in it, the captions are inside the safe zone, and
nothing important is sitting under where the like button will be.
