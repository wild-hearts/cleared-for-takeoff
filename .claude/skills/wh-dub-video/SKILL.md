---
name: wh-dub-video
description: Turn a target-language SRT into a time-aligned spoken dub over an existing video - synthesise each cue, fit it to its slot, and hand a mixed audio track to wh-burn-subtitles for the final composite. Covers voice selection per language, the timing-fit problem when a translation runs longer than its cue, single versus multi-speaker, and when subtitles are honestly the better answer. Triggers - "dub this video", "make it speak Spanish", "voiceover in French", "AI voice for the translated version", "localise the audio".
---

# wh-dub-video

Target-language SRT in, a time-aligned voice track out. The final mix and burn happen in
`wh-burn-subtitles`, in one encode, not here.

Adapted from Jianshuo Wang's MIT-licensed `wjs-dubbing-video`
(https://github.com/jianshuo/claude-skills).

## Before you dub, ask whether you should

Dubbing is expensive in effort and it is the option viewers complain about. Subtitles are
cheaper, faster, and preferred by most audiences for talking-head and instructional
content. Dub when:

- The audience genuinely cannot read fast enough - young children, low-literacy, or
  accessibility.
- The picture demands full attention (a screen walkthrough where the viewer must watch
  a cursor, not a caption).
- The platform's audience expects it - dubbed content materially outperforms subtitled
  content in some markets.

Otherwise, subtitle it and spend the saved time on something else. Say this out loud
rather than quietly doing the expensive thing.

## Prerequisites

A target-language SRT from `wh-translate-subtitles`. Not a source SRT. Not a rough
translation you did in your head while synthesising.

## Voices

```bash
edge-tts --list-voices | grep -E "^Name.*(es|fr|de|pt|it|ja|ko|zh)-"
```

| Language | edge-tts voice | Notes |
|---|---|---|
| English (AU) | `en-AU-NatashaNeural` | Wild Hearts default |
| Spanish (ES) | `es-ES-ElviraNeural` | Castilian. For Latin America use `es-MX-DaliaNeural`. |
| French | `fr-FR-DeniseNeural` | |
| German | `de-DE-KatjaNeural` | |
| Portuguese (BR) | `pt-BR-FranciscaNeural` | |
| Italian | `it-IT-ElsaNeural` | |
| Japanese | `ja-JP-NanamiNeural` | |
| Korean | `ko-KR-SunHiNeural` | |
| Chinese (Simplified) | `zh-CN-XiaoxiaoNeural` | |

ElevenLabs multilingual gives better prosody and can keep one voice identity across
languages, at a per-character cost. For anything with Naomi's name on the front, use it.
For an internal draft, edge-tts is fine.

**Voice cloning needs written consent from the person whose voice it is.** No exceptions,
including Naomi's own voice on a project someone else commissioned.

## The timing problem, which is the whole job

A cue holds 2.4 seconds. The Spanish translation, spoken naturally, takes 3.1 seconds. You
have four options and they are not equally good:

1. **Shorten the translation.** Best. Go back to `wh-translate-subtitles` and ask for a
   tighter line. A dub is a rewrite, not a transcription.
2. **Speed the synthesis up.** Acceptable to about **1.15x**. Beyond that it sounds
   hurried and the listener notices before they can say why.
3. **Let it run into the gap.** Fine if the next cue starts more than 300 ms later.
   Check before you assume.
4. **Extend the video.** Only for slide-based content where a still can hold longer.
   Never on a talking head - the lips will disagree with the voice.

Do them in that order. A dub built entirely on option 2 sounds like a hostage tape.

## The loop

For each cue:

```bash
edge-tts --voice es-ES-ElviraNeural --rate=+0% \
  --text "Antes de tocar una sola herramienta..." --write-media cue_0042.mp3

# measure what you actually got, do not assume
ffprobe -v error -show_entries format=duration -of csv=p=0 cue_0042.mp3
```

Then, per cue, compute `ratio = synthesised_duration / cue_duration`:

| ratio | Action |
|---|---|
| <= 1.0 | Place at the cue start. Pad with silence to the cue end. |
| 1.0 - 1.15 | `atempo` to fit. Inaudible at this range; `atempo` preserves pitch. |
| 1.15 - 1.35 | Check the gap to the next cue. Room? Let it run. No room? Flag for a shorter translation. |
| > 1.35 | Stop. Go back and shorten the translation. Do not compress your way out of this. |

Assemble with `adelay` per cue onto one timeline, or build a silent bed of the full
duration and overlay each clip at its offset:

```bash
# one cue placed at 42.180 s on a silent 1800 s bed
ffmpeg -f lavfi -i anullsrc=r=48000:cl=stereo -t 1800 -i cue_0042.mp3 \
  -filter_complex "[1:a]adelay=42180|42180[c];[0:a][c]amix=inputs=2:duration=first" \
  -c:a aac -b:a 192k dub_partial.m4a
```

For hundreds of cues, build the whole `filter_complex` programmatically and run it once.
Do not chain hundreds of ffmpeg calls; each one is a decode and re-encode.

## Handing off

Output: `<slug>.<lang>.dub.m4a`, AAC, 48 kHz, the exact duration of the source video.

Then, and only then:

```bash
python3 .claude/skills/wh-burn-subtitles/scripts/render.py \
  --video source.mp4 --srt source.es.srt --dub source.es.dub.m4a \
  --bed-volume 0.08 --out final/lesson.es.mp4
```

`--bed-volume 0.08` keeps the original audio faintly under the dub. This is not
sentiment: it preserves room tone, music, and laughter, and it stops the video sounding
like it was recorded in a vacuum. Set it to 0 only when the original is pure speech with
no atmosphere worth keeping.

## Verify

1. Dub track duration equals the source video duration, to within 100 ms.
2. No cue's audio overlaps the next cue's start by more than 300 ms.
3. Count how many cues needed `atempo` above 1.15. More than about 10% means the
   translation is too long and should go back, not forward.
4. Play the first 30 seconds and one passage from the middle. Actually play it.

Report the numbers, including the compression count. "Dubbed 218 cues, 9 needed tempo
adjustment above 1.15x, longest overrun 240 ms into a 400 ms gap" is a report.
