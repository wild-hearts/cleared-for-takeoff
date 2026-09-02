---
name: wh-burn-subtitles
description: Put an SRT onto a video - either burned into the pixels with libass so they are always visible, or soft-muxed as a track the viewer can toggle. Also the final composite stage of the localisation pipeline - burns subtitles, mixes a dub track over the original as a low bed, and produces the upload-ready MP4 in one encode rather than a cascade. Verifies libass is present before promising burn-in. Triggers - "burn the subtitles in", "hardcode the captions", "embed the SRT", "add subtitles to this video", "soft mux the subs", "final render with captions".
---

# wh-burn-subtitles

Video plus SRT, out comes video with subtitles. Also the last stage of localisation: takes
the video, an optional dub track from `wh-dub-video`, and an SRT to burn, and produces the
deliverable in **one** ffmpeg pass.

Adapted from Jianshuo Wang's MIT-licensed `wjs-burning-subtitles`
(https://github.com/jianshuo/claude-skills).

## Burn or soft-mux

| | Burned in (libass) | Soft-muxed (`mov_text`) |
|---|---|---|
| Always visible | yes | no, viewer toggles |
| Survives re-upload and re-encode | yes | often stripped |
| Instagram, TikTok, Reels, LinkedIn native | **required** | ignored by the player |
| YouTube, Vimeo | works, but blocks their own caption UI | **preferred** - searchable, translatable |
| Course platform | depends on the player - test it | |
| Cost | full re-encode, minutes of CPU | stream copy, seconds |
| Reversible | no | yes |

Default for Wild Hearts: **soft-mux for YouTube and the course platform, burn for socials.**
Deliver both from the same SRT; the burn is the only one that costs time.

## Verify libass before you promise burn-in

```bash
ffmpeg -hide_banner -filters | grep -E ' (subtitles|ass) '
```

Nothing back means the build has no libass and burn-in will fail with
`No such filter: 'subtitles'` no matter how you quote the shell. Do not spend an hour
fighting comma escaping inside `force_style`; it is not the escaping.

macOS fix, no system changes:

```bash
curl -fsSL -o /tmp/ff.zip https://evermeet.cx/ffmpeg/getrelease/zip
unzip -o /tmp/ff.zip -d /tmp/ff_bin >/dev/null
/tmp/ff_bin/ffmpeg -version | grep -oE -- "--enable-(libass|libfreetype)"
```

Linux: `apt-get install -y ffmpeg` ships with libass. `render.py` falls back to
`/tmp/ff_bin/ffmpeg` automatically when the default build lacks it.

## The script

```bash
# Soft-mux, seconds, no quality loss
python3 .claude/skills/wh-burn-subtitles/scripts/render.py \
  --video in.mp4 --srt in.en.srt --soft-mux --out final/lesson.en.mp4

# Burn in, 9:16 social styling
python3 .claude/skills/wh-burn-subtitles/scripts/render.py \
  --video in.mp4 --srt in.en.srt --style social --out final/lesson.en.vertical.mp4

# Preview the first 20 seconds and grab a frame before committing
python3 .claude/skills/wh-burn-subtitles/scripts/render.py \
  --video in.mp4 --srt in.en.srt --preview --out /tmp/preview.mp4

# Full localised cut: burn target subs, mix the dub over the original as a bed
python3 .claude/skills/wh-burn-subtitles/scripts/render.py \
  --video in.mp4 --srt in.es.srt --dub in.es.dub.m4a --bed-volume 0.08 \
  --out final/lesson.es.mp4
```

## Styling

`force_style` uses ASS style names. The commas inside it must be escaped for the filter
parser; `render.py` handles that. By hand, the escaping is: escape the colon and the
commas, and wrap the whole filter argument in single quotes.

```bash
ffmpeg -i in.mp4 -vf "subtitles=in.en.srt:force_style='FontName=DejaVu Sans,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0,MarginV=40,Alignment=2'" -c:v libx264 -crf 20 -preset medium -c:a copy out.mp4
```

Wild Hearts presets, built into `render.py`:

| `--style` | Font size | Margin | Use |
|---|---|---|---|
| `lesson` (default) | 24 | 40 | 16:9 course video. Bottom centred, white on black outline. |
| `social` | 30 | 260 | 9:16. Raised well clear of the platform's UI chrome at the bottom. |
| `cinema` | 22 | 60 | 16:9, smaller, for footage where the picture matters more than the words. |

**Font size is resolution-relative in libass.** `FontSize=24` on a 1080p render is not
`FontSize=24` on a 4K render. `render.py` scales by height against a 1080p baseline. If
you write the ffmpeg command by hand, do that scaling yourself or the 4K version will
have subtitles you need a magnifying glass for.

`PrimaryColour` is ASS format: `&HAABBGGRR` - alpha first, then **blue green red**, not
RGB. `&H00FFFFFF` is opaque white. `&H0000FFFF` is yellow, not cyan.

## Checkpoint before a full render

A burn-in re-encodes every frame. On a 40-minute lesson that is real time on real CPU.
Before you start it:

1. Render 20 seconds: `--preview`.
2. Extract a frame from the cue with the longest line and actually look at it.
3. Check: does the text fit? Is it clear of the speaker's mouth? Legible against the
   brightest part of the frame? Clear of the platform's UI if it is going vertical?

Then commit to the full render.

## Quality settings

```
-c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p
-c:a aac -b:a 192k -ar 48000
-movflags +faststart
```

- `crf 20` is visually transparent for talking-head and slide content. Use 18 for footage
  with motion or fine detail; 23 if the file size matters more than the picture.
- `pix_fmt yuv420p` is not optional. Without it, some players and every social platform
  show a green screen or refuse the file.
- `+faststart` moves the index to the front so the video begins playing before it has
  finished downloading. Leave it off and a web viewer stares at a blank player.
- `-c:a copy` when only the picture changes. Re-encoding untouched audio is free quality loss.

## Verify

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,pix_fmt -of default=nw=1 out.mp4
ffprobe -v error -select_streams s -show_entries stream=index,codec_name:stream_tags=language \
  -of default=nw=1 out.mp4      # soft-muxed track present?
ffmpeg -hide_banner -ss 00:01:30 -i out.mp4 -frames:v 1 -y /tmp/check.png   # then Read it
```

Look at the extracted frame. Do not report a burn-in as done without having looked at a
frame that has subtitles on it.
