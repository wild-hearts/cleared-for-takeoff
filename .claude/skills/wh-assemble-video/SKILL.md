---
name: wh-assemble-video
description: Build a finished narrated MP4 from things that already exist - a script, a chapter, a slide deck, stills, screen recordings, charts - plus a text-to-speech or recorded voice track. Handles storyboarding, TTS narration, Ken Burns motion on stills, crossfades, title and end cards, background music ducked under the voice, and burned captions. This is the skill for "make me a video". Triggers - "make a video of this", "turn this lesson into a video", "video for module 3", "book trailer", "narrated slides", "text to video", "make a video from this chapter".
---

# wh-assemble-video

Words and pictures that already exist, assembled into a video that did not.

**Read this first.** Nothing here generates footage from a text prompt. There is no video
model wired into this toolkit. What this does is what most course and book-marketing video
actually is: a voice, some stills or slides with motion on them, captions, and a title
card. If Naomi wants a generated shot of a Cessna banking over the coast, that needs an
API key with Runway, Veo, Kling, Sora or fal.ai, and that is a different conversation -
have it early rather than after she has approved a storyboard you cannot shoot.

## The pipeline

```
source text  ->  script  ->  storyboard.json  ->  narration  ->  visuals  ->  render  ->  captions
(chapter,      (naomi-      (scene list      (TTS or a     (stills,      (build_    (transcribe
 lesson,        voice)       with timings)    recording)    slides,       video.py)   the render,
 deck)                                                      charts)                   burn)
```

## Step 1 - Script

Invoke the `naomi-voice` skill. Always. Narration is the most exposed prose there is:
it is read aloud, slowly, by a voice claiming to be hers.

Spoken script rules that differ from page prose:

- **Short sentences.** A clause that works on the page runs out of breath aloud.
- **No parentheses.** They have no sound. Recast as a separate sentence.
- **Numbers as spoken.** "Nineteen eighty-four", not "1984", unless it is a year you want
  read as digits. TTS engines guess, and they guess wrong on prices, times and ranges.
- **Say the acronym you want heard.** "A I" reads as "ay eye" in some voices and "Ai" in
  others. Write "A.I." or spell it phonetically and test it.
- **150 words per minute** is the planning rate for clear instructional narration.
  A 6-minute lesson is roughly 900 words. Anything faster and older learners lose it,
  which for the Cleared for Takeoff audience is the whole point.
- **Write the pause in.** A full stop and a paragraph break both produce a pause in most
  TTS engines. Use them deliberately.

## Step 2 - Storyboard

One JSON file drives the render. `build_video.py` reads it.

```json
{
  "title": "Module 3 - What A.I. Actually Is",
  "resolution": "1920x1080",
  "fps": 30,
  "voice": "en-AU-NatashaNeural",
  "music": "assets/bed-soft.mp3",
  "music_volume": 0.06,
  "scenes": [
    {
      "id": "01-title",
      "image": "assets/title-card.png",
      "narration": "Right. Before we touch a single tool, we need to agree on what this thing actually is.",
      "motion": "none",
      "hold": 1.5
    },
    {
      "id": "02-what-it-is",
      "image": "assets/prediction-machine.png",
      "narration": "It is a prediction machine. That is not a metaphor and it is not me being modest on its behalf.",
      "motion": "kenburns-in"
    },
    {
      "id": "03-chart",
      "image": "assets/chart-usage.png",
      "narration": "Here is what people actually use it for, which is not what the headlines suggest.",
      "motion": "kenburns-left",
      "hold": 2.0
    }
  ]
}
```

Fields:

| Field | Meaning |
|---|---|
| `image` | still, slide export, screenshot, or chart. Any size; it is scaled and padded. |
| `video` | a clip instead of a still. Trimmed to the narration length, or looped if shorter. |
| `narration` | text to speak. Omit for a silent scene. |
| `audio` | a pre-recorded narration file, used instead of TTS. |
| `motion` | `none`, `kenburns-in`, `kenburns-out`, `kenburns-left`, `kenburns-right` |
| `hold` | extra seconds after the narration ends, for a beat |
| `transition` | `fade` (default), `cut`, `dissolve` |

**Scene length comes from the narration, not the other way round.** Write the words,
synthesise them, measure them, then fit the picture. Storyboards built from guessed
durations always end with a scene that is three seconds short.

## Step 3 - Narration

```bash
pip install edge-tts
edge-tts --list-voices | grep en-AU        # Australian voices
```

Wild Hearts default: **`en-AU-NatashaNeural`**. Australian, warm, clear at slow rates,
handles Naomi's long sentences without going robotic. `en-AU-WilliamNeural` is the male
counterpart if a second voice is needed.

```bash
edge-tts --voice en-AU-NatashaNeural --rate=-8% \
  --text "Right. Before we touch a single tool..." --write-media scene-01.mp3
```

`--rate=-8%` is deliberate. Default TTS pace is written for demos, not for someone
learning something unfamiliar. For the Cleared for Takeoff audience, slower.

| Engine | Cost | Quality | When |
|---|---|---|---|
| `edge-tts` | free | good, natural prosody | default for everything |
| ElevenLabs | paid, per character | best, and can clone Naomi's voice | anything with her name on the front |
| macOS `say` | free, offline | flat and obviously synthetic | last resort only |

**Voice cloning:** only with the written consent of the person whose voice it is. That is
not legal caution, it is the whole reason the technology is contentious.

## Step 4 - Visuals

Where the pictures come from, in order of preference:

1. **Existing slides.** Use the `pptx` skill to read the deck, then export each slide to
   PNG at the target resolution.
2. **Charts.** Use the `dataviz` skill. Read it before drawing anything - a chart built
   without it will not match the rest of the material.
3. **Title and end cards.** Build them as HTML with the `artifact-design` skill, then
   screenshot at 1920x1080 with Playwright. Chromium is already installed at
   `/opt/pw-browsers/chromium`; do not run `playwright install`.
4. **Screen recordings.** For tool walkthroughs, which is most of the course.
5. **Stills.** Licensed, or generated with an image model, or photographed. Check the
   licence on anything you did not make.

**Resolution:** author every visual at the render resolution or larger. Upscaling a
1280x720 screenshot to 1080p produces the soft, slightly-wrong look that reads as
"made on a phone in a hurry".

**Ken Burns needs headroom.** A slow zoom crops into the image. Source stills at 1.3x
the render resolution or the zoom will show you the pixels.

## Step 5 - Render

```bash
python3 .claude/skills/wh-assemble-video/scripts/build_video.py storyboard.json \
  --out final/module-03.mp4

# check the plan and the timings without rendering
python3 .claude/skills/wh-assemble-video/scripts/build_video.py storyboard.json --dry-run

# render one scene to check the look before committing 20 minutes of CPU
python3 .claude/skills/wh-assemble-video/scripts/build_video.py storyboard.json \
  --only 02-what-it-is --out /tmp/scene-check.mp4
```

The script synthesises narration per scene, measures each clip's real duration, builds
per-scene video at that exact length, concatenates with transitions, ducks the music bed
under the voice with a sidechain compressor, and normalises the final mix to -16 LUFS.

## Step 6 - Captions

Every Wild Hearts video ships with captions. Not optional: most social video plays muted,
and a meaningful part of the audience needs them.

```bash
python3 .claude/skills/wh-transcribe-audio/... # or, better, build the SRT from the
                                              # storyboard narration you already have
python3 .claude/skills/wh-burn-subtitles/scripts/render.py \
  --video final/module-03.mp4 --srt final/module-03.en.srt --soft-mux \
  --out final/module-03.captioned.mp4
```

`build_video.py --srt` writes the SRT directly from the storyboard using the measured TTS
durations. That is more accurate than transcribing your own synthetic voice back, and free.

## Music

- Under the voice at **0.05 to 0.08** linear volume. If you can hear it deciding to be
  music, it is too loud.
- Ducked with `sidechaincompress`, not a fixed level. `build_video.py` does this.
- Fade in over 2 s, out over 3 s.
- Check the licence. YouTube's Content ID does not care that it was on a "royalty free"
  aggregator.

## Common failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Green frame in some players | missing `-pix_fmt yuv420p` | it is in the script; do not remove it |
| Video plays, no sound on social | audio not AAC, or sample rate not 48 kHz | `-c:a aac -ar 48000` |
| Last scene cut short | scene durations guessed, not measured | measure the TTS output, always |
| Audio drifts later in the video | concat of clips with mismatched frame rates | normalise every scene to the same fps first |
| Ken Burns judders | zoompan output fps not matching the timeline | the script pins `fps` on every scene |
| Whole thing looks soft | source stills below render resolution | re-export the source at 1.3x |

## Deliverables

```
final/<slug>.mp4                 master, 1920x1080, captions soft-muxed
final/<slug>.vertical.mp4        9:16, captions burned in    (wh-reframe-video)
final/<slug>.en.srt              caption file
final/<slug>.storyboard.json     the recipe - commit this, not the MP4
```

Commit the storyboard, the script and the SRT. Never commit the MP4.
