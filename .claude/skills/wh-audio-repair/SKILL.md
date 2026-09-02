---
name: wh-audio-repair
description: Diagnose and fix sound problems on video and audio files - background noise, hiss, mains hum, room rumble, clipping and distortion, harsh sibilance, plosive pops, uneven or wrong loudness, one channel dead, mono recorded as stereo, and audio drifting out of sync with the picture. Measures before it treats, and fixes the picture-sync case without touching the video stream. Triggers - "the audio sounds bad", "too quiet", "too loud", "hissy", "noisy", "buzzing", "echoey", "distorted", "clipping", "out of sync", "lips don't match", "one side is silent", "normalise the audio", "fix the sound on this video".
---

# wh-audio-repair

Bad audio kills a video faster than bad picture. Viewers forgive a soft focus; they close
the tab on a hiss.

The rule that matters: **measure, then treat, then measure again.** Every filter here is
destructive. Guessing at parameters and stacking six of them turns a noisy recording into
a noisy recording that also sounds like a robot underwater.

## Step 1 - Diagnose

```bash
python3 .claude/skills/wh-audio-repair/scripts/audio_doctor.py input.mp4
```

It probes the stream, measures EBU R128 loudness, true peak, and DC offset, samples the
noise floor from the quietest second, checks channel correlation, and prints a ranked
list of what is actually wrong with a suggested filter chain. Run it before you touch
anything.

By hand, if you must:

```bash
# Stream facts
ffprobe -v error -select_streams a:0 \
  -show_entries stream=codec_name,channels,channel_layout,sample_rate,bit_rate \
  -of default=nw=1 input.mp4

# Loudness and true peak (EBU R128)
ffmpeg -hide_banner -nostats -i input.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -20

# Peak / RMS / DC offset
ffmpeg -hide_banner -nostats -i input.mp4 -af astats=metadata=1 -f null - 2>&1 \
  | grep -E "DC offset|Peak level|RMS level|Flat factor|Noise floor"
```

Read the numbers like this:

| Reading | Means | Do |
|---|---|---|
| Integrated loudness quieter than -20 LUFS | Too quiet for anywhere | `loudnorm` to target |
| Integrated loudness louder than -12 LUFS | Squashed, will be turned down by the platform anyway | `loudnorm` to target |
| True peak above -1.0 dBTP | Will clip on lossy transcode | `loudnorm` with `TP=-1.5` |
| Flat factor above 0 | Samples pinned at full scale - real clipping | `adeclip` **before** anything else |
| Noise floor above -50 dB | Audible hiss/room | `afftdn` or `arnndn` |
| DC offset above 0.001 | Bad ADC, wastes headroom | `highpass=f=20` |
| One channel RMS far below the other | Dead channel or a badly wired lav | Collapse to mono from the good channel |

## Step 2 - Target loudness

Do not "make it louder". Normalise to the platform's target, once, at the end.

| Destination | Integrated | True peak |
|---|---|---|
| YouTube, Vimeo | **-14 LUFS** | -1.0 dBTP |
| Course platform / self-hosted lesson | **-16 LUFS** | -1.0 dBTP |
| Podcast (Apple/Spotify) | -16 LUFS mono, -16 LUFS stereo | -1.0 dBTP |
| Instagram, TikTok, Reels | -14 LUFS | -1.0 dBTP |
| Broadcast (AU, OP-59) | -24 LKFS | -2.0 dBTP |

Wild Hearts default for course video: **-16 LUFS, -1.0 dBTP**. Spoken word, headphones,
someone learning something. Loud enough to hear on a laptop speaker, not so loud it
fatigues over a 40-minute module.

## Step 3 - Order of operations

Order is not a matter of taste. Get it wrong and each stage amplifies the last one's damage.

```
1. adeclip / adeclick    repair damaged samples BEFORE anything reads their level
2. highpass=f=80         cut rumble, HVAC, handling noise, DC offset
3. lowpass=f=12000       (only if there is hiss above the voice; often unnecessary)
4. denoise               arnndn (speech, best) OR afftdn (general) - never both
5. deesser               only if sibilance survives denoise
6. compression           acompressor - gentle, and only for wildly uneven delivery
7. loudnorm              LAST. Two-pass. Always.
```

`loudnorm` last is non-negotiable: it measures the whole programme, so anything you
change afterwards invalidates its measurement.

## The fixes

### Clipping / distortion

```bash
ffmpeg -i input.mp4 -c:v copy -af "adeclip=window=55:overlap=75" -c:a aac -b:a 192k out.mp4
```

Honest caveat: `adeclip` reconstructs the missing waveform by interpolation. Mild clipping
recovers well. Audio recorded 10 dB into the red is destroyed and no filter brings it back.
Say so rather than shipping something that still sounds fried.

### Hiss, air conditioning, room tone

`arnndn` is a recurrent neural net trained on speech and it is markedly better than
spectral subtraction for talking humans. It needs a model file:

```bash
curl -fsSL -o /tmp/std.rnnn \
  https://raw.githubusercontent.com/GregorR/rnnoise-models/master/somnolent-hogwash-2018-09-01/sh.rnnn
ffmpeg -i input.mp4 -c:v copy -af "arnndn=m=/tmp/std.rnnn" -c:a aac -b:a 192k out.mp4
```

No model file, or non-speech content? Use FFT denoise instead, and start gentle:

```bash
# nr = noise reduction in dB. Start at 12. 25+ produces underwater artefacts.
ffmpeg -i input.mp4 -c:v copy -af "afftdn=nr=12:nf=-40:tn=1" -c:a aac -b:a 192k out.mp4
```

`tn=1` tracks the noise profile over time, which matters when the aircon cycles.

### Mains hum (50 Hz in Australia, 60 Hz in the US) and its harmonics

```bash
ffmpeg -i input.mp4 -c:v copy \
  -af "highpass=f=40,anequalizer=c0 f=50 w=3 g=-30 t=1|c0 f=100 w=4 g=-25 t=1|c0 f=150 w=5 g=-20 t=1" \
  -c:a aac -b:a 192k out.mp4
```

Australian mains is 50 Hz. If the recording came from US equipment or a US-shot interview,
retune to 60/120/180.

### Rumble, handling noise, plosives

```bash
ffmpeg -i input.mp4 -c:v copy -af "highpass=f=80:poles=2" -c:a aac -b:a 192k out.mp4
```

80 Hz is safe for every adult speaking voice. Below 80 Hz there is nothing in speech worth
keeping and a great deal worth losing. For a very deep voice, drop to 60 Hz.

### Harsh S sounds

```bash
ffmpeg -i input.mp4 -c:v copy -af "deesser=i=0.4:m=0.5:f=0.5" -c:a aac -b:a 192k out.mp4
```

`i` is intensity. Above 0.6 the speaker starts to lisp. Use sparingly and listen.

### Uneven delivery (leans in and out of the mic)

```bash
ffmpeg -i input.mp4 -c:v copy \
  -af "acompressor=threshold=-20dB:ratio=3:attack=20:release=250:makeup=2" \
  -c:a aac -b:a 192k out.mp4
```

`dynaudnorm` is the lazier alternative and it pumps on speech. Prefer `acompressor`.

### Loudness normalisation - two pass, always

Single-pass `loudnorm` is a live limiter and it will not hit the target. Two pass measures
first, then corrects with known values.

```bash
# Pass 1 - measure. Capture the JSON block at the end.
ffmpeg -hide_banner -nostats -i input.mp4 \
  -af loudnorm=I=-16:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | tail -14

# Pass 2 - correct, substituting the five measured_* values from pass 1.
ffmpeg -i input.mp4 -c:v copy -af \
"loudnorm=I=-16:TP=-1.0:LRA=11:measured_I=-23.4:measured_TP=-5.2:measured_LRA=7.8:measured_thresh=-33.6:offset=-0.1:linear=true" \
  -c:a aac -b:a 192k -ar 48000 out.mp4
```

`audio_doctor.py --normalise` runs both passes for you and substitutes the values.

### Dead channel / mono recorded as stereo

```bash
# Left channel is the good one - duplicate it to both sides
ffmpeg -i input.mp4 -c:v copy -af "pan=stereo|c0=c0|c1=c0" -c:a aac out.mp4

# Genuinely mono content in a stereo container - collapse and halve the bitrate
ffmpeg -i input.mp4 -c:v copy -ac 1 -c:a aac -b:a 96k out.mp4
```

### Audio out of sync with picture

Two different faults with two different fixes. Diagnose which one before you touch it:
find a hard transient with a visible cause (a clap, a door, a hand hitting a desk), note
its timecode at the start of the file and again near the end.

**Constant offset** - the gap is the same at both ends. Shift the audio:

```bash
# Audio is 250 ms LATE (sound arrives after the picture) - pull it earlier
ffmpeg -i input.mp4 -itsoffset -0.250 -i input.mp4 \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k out.mp4

# Audio is 250 ms EARLY - push it later: use +0.250
```

**Growing drift** - the gap widens across the file. That is a sample-rate mismatch, usually
a 48000 Hz recorder muxed as 47952 Hz or a variable-frame-rate phone capture. Resample by
the measured ratio:

```bash
# Drifted 1.2 s late over a 3600 s file -> ratio = 3600 / 3601.2 = 0.999667
ffmpeg -i input.mp4 -c:v copy -af "atempo=0.999667,aresample=48000" -c:a aac -b:a 192k out.mp4
```

`atempo` holds pitch, so a correction this small is inaudible. Corrections beyond about
1% are audible - at that point the source is broken and needs re-exporting from the
original recorder, not patching.

For a variable-frame-rate phone capture, fix the video timebase instead:

```bash
ffmpeg -i input.mp4 -vsync cfr -r 30 -c:v libx264 -crf 18 -preset slow -c:a aac -b:a 192k out.mp4
```

## Step 4 - Verify, then say what you verified

```bash
python3 .claude/skills/wh-audio-repair/scripts/audio_doctor.py out.mp4
```

Report the actual before-and-after numbers. "Integrated loudness moved from -26.3 to
-16.0 LUFS, true peak -1.0 dBTP, noise floor down 14 dB" is a report. "Sounds much
better now" is a hope, especially from something with no ears.

State plainly that nothing here has been listened to. Ask Naomi to play thirty seconds
of the loudest passage and thirty of the quietest before it goes anywhere public.

## The whole chain in one encode

Never cascade. Once diagnosis has told you what is wrong, build one command:

```bash
ffmpeg -i input.mp4 -c:v copy -af \
"adeclip,highpass=f=80,arnndn=m=/tmp/std.rnnn,deesser=i=0.3,\
loudnorm=I=-16:TP=-1.0:LRA=11:measured_I=-24.1:measured_TP=-3.2:measured_LRA=9.4:measured_thresh=-34.3:offset=-0.2:linear=true" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart out.mp4
```

`-c:v copy` means the video stream is untouched. Audio repair should never re-encode
picture. If you find yourself re-encoding video to fix sound, stop and work out why.

## When to give up and re-record

Say it early, because it saves days:

- Speech buried under music or crowd at a similar level. Source separation exists
  (Demucs, Spleeter) but on a voice that is genuinely masked it produces artefacts worse
  than the noise.
- Heavy clipping - flat factor high across most of the file.
- A room with a long reverb tail. De-reverberation on a recording is unreliable; a
  blanket, a wardrobe and a re-record take twenty minutes and sound right.
- Wind straight into an unshielded mic. That is not noise, that is missing signal.
