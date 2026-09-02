# Polly - the Wild Hearts video agent

Polly is an agent that produces video: course lessons, book trailers, social cuts, and
localised versions of any of them. She lives at `.claude/agents/polly.md` and runs on the
eight `wh-*` skills in `.claude/skills/`.

## What she can actually do

| | |
|---|---|
| Build a narrated video from a script, slides, stills or screen recordings | yes |
| Generate the narration with text to speech | yes |
| Fix bad audio - noise, hum, clipping, loudness, out-of-sync sound | yes |
| Transcribe to SRT, translate subtitles, burn or mux them | yes |
| Dub into another language with a time-aligned synthetic voice | yes |
| Reframe 16:9 to 9:16 or 1:1 for Reels, Shorts, TikTok | yes |
| Cut a long recording into short clips | yes |
| **Generate photoreal footage from a text prompt** | **no** |

That last row is the one worth reading twice. There is no video generation model wired
into this toolkit. Turning "a Cessna banking over the coast at golden hour" into moving
pictures needs an account and an API key with Runway, Google Veo, Kling, OpenAI Sora, or
fal.ai as a broker. Once a key exists, wiring it in is an afternoon. Until then, Polly
tells you no rather than quietly substituting stock footage.

What she does instead - narrated slides with motion, screen capture, talking head with
captions, localised versions of all of it - is what most course and book-marketing video
actually is.

## Using her

In Claude Code, from this repo:

```
Ask Claude to use the polly agent, or just describe the job:
  "Polly, make a video of module 3"
  "the audio on this interview is hissy and too quiet"
  "give me a vertical cut with burned captions for Reels"
```

Skills also work on their own, without the agent:

```
/wh-video-pipeline      what is possible here, and which skill does what
/wh-assemble-video      script or slides -> finished MP4
/wh-audio-repair        diagnose and fix sound problems
/wh-transcribe-audio    media -> SRT
/wh-translate-subtitles SRT -> another language
/wh-burn-subtitles      SRT + video -> captions on screen
/wh-dub-video           SRT -> spoken dub
/wh-reframe-video       16:9 <-> 9:16 <-> 1:1
```

## Setup

Run the preflight first. It reports what works and what is missing:

```bash
bash .claude/skills/wh-video-pipeline/preflight.sh
```

Required:

```bash
# Linux / CI
apt-get update && apt-get install -y ffmpeg

# macOS - check libass survived; Homebrew's build is sometimes stripped
brew install ffmpeg
ffmpeg -hide_banner -filters | grep ' subtitles '   # no output = no burn-in
```

Optional, one from each group:

```bash
pip install edge-tts            # free text to speech, Australian voices
pip install faster-whisper      # local transcription, no API key
export OPENAI_API_KEY=...       # Whisper API - faster and better than local
export ELEVENLABS_API_KEY=...   # best-quality TTS, and voice cloning
```

## Loading the skills into Cowork and claude.ai

Repo-level skills (`.claude/skills/`) are picked up automatically by Claude Code and by
any Cowork session working in this repository. Nothing to do.

To make them available **everywhere** in Cowork and claude.ai, not just in this repo,
they have to be uploaded to the account:

```bash
bash tools/package-skills.sh          # writes dist/skills/*.zip, one per skill
```

Then at **claude.ai → Settings → Capabilities → Skills → Upload skill**, upload each zip.
They then appear in Cowork, claude.ai chat, and every Claude Code session on the account.

Polly herself is an agent, not a skill. Agents are repo-scoped: `.claude/agents/polly.md`
travels with the repository. In Cowork, ask for her by name once the repo is attached.

## What has actually been tested

Verified on ffmpeg 6.1.1 with libass, in a Linux container, on synthetic test media:

- `preflight.sh` - correctly reports present and missing dependencies.
- `audio_doctor.py` - detected all three injected faults on a test file (-42.7 LUFS,
  -37 dB noise floor, 25.9 dB channel imbalance) and normalised it to a verified
  -16.2 LUFS with a correct two-pass loudnorm.
- `render.py` - burn-in produced legible two-line captions (frame inspected); soft-mux
  produced a `mov_text` track tagged `language=eng` (ffprobe confirmed).
- `build_video.py` - three-scene storyboard rendered to 1280x720 @ 30fps, yuv420p,
  AAC 48 kHz, 24.7 s; Ken Burns motion confirmed on an extracted frame; generated SRT
  passes the 2-line / 42-char / 1.0-7.0 s / 17 cps rules.
- Reframe: all three chains (crop, blurred pad, letterbox) produce 1080x1920 at SAR 1:1.

Not tested, and honestly flagged:

- **Text to speech.** `edge-tts` installs fine but this container's network policy blocks
  `speech.platform.bing.com` with a 403 at the proxy, so no narration was synthesised.
  The code path is exercised (it falls back to silent scenes with word-count-estimated
  durations, correctly), but the synthesis itself is unproven here. It should work on a
  normal machine. Test it before relying on it.
- **Whisper transcription.** No API key in this environment and no local model installed.
- **Dubbing.** Depends on TTS, so likewise unproven.
- Nothing has been listened to. There are no ears in this container.

## Credit

The transcription, translation, subtitle, dubbing and reframing skills are adapted from
Jianshuo Wang's MIT-licensed skill collection at
https://github.com/jianshuo/claude-skills - rewired for English-source Australian work
and stripped of its Chinese-platform dependencies (Volcano ASR/TTS, WeChat publishing,
macOS-only assumptions). Full licence in `.claude/skills/THIRD-PARTY-LICENCES.md`.

`wh-audio-repair`, `wh-assemble-video` and `wh-video-pipeline` are original to this repo.
