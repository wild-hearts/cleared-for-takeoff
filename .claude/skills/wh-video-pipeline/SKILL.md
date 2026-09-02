---
name: wh-video-pipeline
description: Entry point and router for all Wild Hearts video work. Run the environment preflight, identify which stage of the pipeline the job is at, and route to the right sub-skill. Use when a video request arrives and it is not obvious which single skill covers it, when a job spans several stages (transcribe then translate then burn), or before promising any video work at all. Triggers - "make a video", "video for the course", "localise this video", "the audio is bad", "add subtitles", "vertical cut", "what do I need to make video work".
---

# wh-video-pipeline

The map. Nothing here does work; it tells you which skill does, and stops you promising
things this machine cannot do.

## Step 1 - Preflight. Always. Before you say yes to anything.

```bash
bash .claude/skills/wh-video-pipeline/preflight.sh
```

If that script is missing, run the checks by hand:

```bash
ffmpeg -version | head -1                       # need ffmpeg, any 5.x/6.x/7.x
ffmpeg -hide_banner -filters | grep -c ' subtitles '   # 1 = libass present, burn-in works
ffmpeg -hide_banner -filters | grep -cE ' (loudnorm|arnndn|afftdn) '  # 3 = audio repair works
python3 -c "import sys; print(sys.version.split()[0])"
command -v edge-tts || echo "no edge-tts (free TTS unavailable)"
[ -n "$OPENAI_API_KEY" ] && echo "whisper API: key present" || echo "whisper API: NO KEY"
[ -n "$ELEVENLABS_API_KEY" ] && echo "elevenlabs: key present" || echo "elevenlabs: NO KEY"
```

### Installing what is missing

| Missing | Fix |
|---|---|
| ffmpeg (Linux/CI) | `apt-get update && apt-get install -y ffmpeg` |
| ffmpeg (macOS) | `brew install ffmpeg`. Homebrew's build is sometimes stripped of libass - check the filter count above. If it is 0, grab a static build: `curl -fsSL -o /tmp/ff.zip https://evermeet.cx/ffmpeg/getrelease/zip && unzip -o /tmp/ff.zip -d /tmp/ff_bin` and use `/tmp/ff_bin/ffmpeg`. |
| edge-tts (free TTS) | `pip install edge-tts` |
| local Whisper | `pip install openai-whisper` - slow on CPU, no API key needed |
| faster local Whisper | `pip install faster-whisper` - several times quicker, same models |

### What to say when something is missing

Say it immediately and specifically. "I can transcribe and subtitle this, but burn-in
needs libass and this ffmpeg build does not have it - two minutes to fix" is useful.
Silently producing a soft-muxed file when Naomi asked for burned-in captions is not.

## Step 2 - Where is this job on the map

```
                        SOURCE MATERIAL
                              |
        +---------------------+---------------------+
        |                                           |
   no footage yet                            footage exists
        |                                           |
  wh-assemble-video                        does the audio sound bad?
  (script/slides + TTS                             |
   + stills -> MP4)                    yes --> wh-audio-repair
        |                                           |
        +---------------------+---------------------+
                              |
                     need words on screen?
                              |
                  wh-transcribe-audio  (media -> SRT, source language)
                              |
                     another language?
                              |
                yes --> wh-translate-subtitles  (SRT -> target SRT)
                              |
                     spoken in that language too?
                              |
                yes --> wh-dub-video  (target SRT -> aligned TTS track)
                              |
                  wh-burn-subtitles  (ONE final encode: subs + dub + video)
                              |
                     posting to socials?
                              |
                yes --> wh-reframe-video  (16:9 -> 9:16 / 1:1)
                              |
                          final/
```

## Step 3 - Routing table

| What Naomi said | Skill |
|---|---|
| "make a video of module 3" | `wh-assemble-video` |
| "turn this chapter into a video" | `wh-assemble-video` |
| "the audio is muddy / hissy / too quiet / clipping" | `wh-audio-repair` |
| "the sound is out of sync with the picture" | `wh-audio-repair` |
| "make subtitles / captions / an SRT" | `wh-transcribe-audio` |
| "translate the subtitles into Spanish" | `wh-translate-subtitles` |
| "bilingual subtitles" | `wh-translate-subtitles` |
| "burn the captions in" / "hardcode the subs" | `wh-burn-subtitles` |
| "make it speak French" / "dub it" | `wh-dub-video` |
| "vertical version for Reels" | `wh-reframe-video` |
| "localise this video" (the whole lot) | all four localisation skills, in order |
| "generate footage of a plane taking off" | none - see the hard limit below |

## The hard limit

There is no video generation model wired into this toolkit. Nothing here turns a text
prompt into photoreal footage. If that is what is wanted, the honest answer is: it needs
an account and an API key with a video model provider (Runway, Google Veo, Kling,
OpenAI Sora, or fal.ai as a broker), and then a small script to call it. Say that, offer
to write the script once a key exists, and do not substitute stock footage and hope
nobody notices.

What this toolkit does instead - narrated slides, Ken Burns over stills, screen capture,
talking head with captions - is what most course and book-marketing video actually is.

## Golden rules for every stage

1. **Probe first.** `ffprobe -v error -show_format -show_streams -of json in.mp4`.
   Duration, resolution, fps, sample rate, channel layout. Assume nothing.
2. **One encode.** Every re-encode is generation loss. Chain filters inside a single
   ffmpeg invocation; use `-c copy` when only the container changes.
3. **Preview 20 seconds.** `-t 20` plus a frame grab, and look at it, before a full render.
4. **Deterministic filenames.** `<slug>.<lang>.srt`, `<slug>.<lang>.dub.m4a`,
   `final/<slug>.<lang>.mp4`. The pipeline chains on these names.
5. **Never commit media to git.** Scripts, SRTs and build recipes go in the repo.
   MP4s do not.

## Attribution

The transcription, translation, subtitle burn-in, dubbing and reframing skills in this
toolkit are adapted from Jianshuo Wang's MIT-licensed skill collection at
https://github.com/jianshuo/claude-skills - rewired for English-source, Australian-English
Wild Hearts work and for Linux/macOS without the Chinese-platform dependencies. The audio
repair and video assembly skills are original to this repo.
