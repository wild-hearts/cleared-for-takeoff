---
name: wh-transcribe-audio
description: Turn a video or audio file into a timestamped SRT in the language actually spoken, with cues that break at sentence boundaries and stay short enough to read on screen. Handles the Whisper API path (word-level timestamps, self-assembled cues), the local whisper/faster-whisper path when there is no API key, and chunking for files over the upload limit. Stops at the source-language SRT - translation is wh-translate-subtitles. Triggers - "transcribe this", "make an SRT", "captions for this video", "speech to text", "get me a transcript", "what did they say in this recording".
---

# wh-transcribe-audio

Spoken audio in, timestamped SRT out, in the language that was spoken. This skill stops
there. Translating it is `wh-translate-subtitles`; putting it on screen is
`wh-burn-subtitles`.

Adapted from Jianshuo Wang's MIT-licensed `wjs-transcribing-audio`
(https://github.com/jianshuo/claude-skills), rewired for English-source Wild Hearts work.

## Choosing an engine

| Situation | Engine | Notes |
|---|---|---|
| `OPENAI_API_KEY` set | Whisper API, `whisper-1`, word-level timestamps | Fastest, best quality, costs money by the minute |
| No key, need it now | `faster-whisper` (`pip install faster-whisper`) | Several times quicker than reference whisper on CPU |
| No key, no hurry | `openai-whisper` medium (`pip install openai-whisper`) | Reference implementation, slow on CPU |
| Confidential material | local only | Do not send a client's unreleased recording to an API |

Always pin the source language. Auto-detect misfires on the first few seconds of music,
room tone, or an accent, and then transcribes an entire lesson as though it were Welsh.

## The one thing that matters: do not ask Whisper for SRT

`response_format=srt` fails on long-form content in two specific ways:

1. **30-second blob cues.** On a monologue - which is what a course lesson is - Whisper
   emits one cue spanning its whole 30-second context window. The words are right. The
   timing is unusable for reading on screen.
2. **Loop hallucination on quiet passages.** Greedy decoding at `temperature=0` on
   low-energy audio repeats a phrase forty times. It looks like a transcript. It is not.

Both come from letting Whisper choose cue boundaries. Ask for word-level timestamps and
build the cues yourself. The assembly is deterministic, free, and better.

## Whisper API path

```bash
# 1. Compress for upload. 64 kbps mono MP3 is ample for speech and the API limit
#    is 25 MB per request. 10-minute chunks land around 4.5 MB, which survives
#    a flaky connection.
ffprobe -v error -show_entries format=duration -of csv=p=0 input.mp4   # get length first

ffmpeg -hide_banner -loglevel error -y \
  -ss 0 -t 600 -i input.mp4 \
  -vn -ac 1 -ar 16000 -c:a libmp3lame -b:a 64k chunk_000.mp3
```

```python
# 2. Word-level timestamps. Never response_format=srt.
import httpx, os

with open("chunk_000.mp3", "rb") as f:
    r = httpx.post(
        "https://api.openai.com/v1/audio/transcriptions",
        headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"},
        data={
            "model": "whisper-1",
            "language": "en",                     # pin it, never auto-detect
            "response_format": "verbose_json",
            "timestamp_granularities[]": "word",  # the critical flag
            "temperature": "0.2",                 # enables the fallback chain, kills loops
        },
        files={"file": ("chunk_000.mp3", f, "audio/mpeg")},
        timeout=600.0,
    )
r.raise_for_status()
j = r.json()
words = j["words"]        # [{"word": "right", "start": 0.12, "end": 0.34}, ...]
segments = j["segments"]  # has punctuation; words[] does not
```

**The catch:** `words[]` carries no punctuation and `segments[]` carries punctuation but
unreliable boundaries. To break cues at real sentence ends, align the punctuated segment
text back onto the word timings - walk the segment text, match tokens to words in order,
and mark a word as sentence-final when the matched token ends in `.`, `?`, `!`, or a
long dash.

**Chunk offsets:** every chunk's timestamps start at zero. Add the chunk's start offset
to every word before merging, or every cue after the first ten minutes will be wrong.

## Local path (no API key)

```bash
pip install faster-whisper
python3 - <<'PY'
from faster_whisper import WhisperModel
model = WhisperModel("medium", device="cpu", compute_type="int8")
segments, info = model.transcribe(
    "input.mp4",
    language="en",
    word_timestamps=True,           # same trick, same reason
    vad_filter=True,                # voice activity detection kills the loop hallucinations
    vad_parameters={"min_silence_duration_ms": 500},
)
for seg in segments:
    for w in seg.words:
        print(f"{w.start:.2f} {w.end:.2f} {w.word}")
PY
```

`vad_filter=True` is the local equivalent of the anti-loop defence. Turn it on.

## Cue assembly rules

Cues that follow these read cleanly on a phone. Cues that do not, do not.

| Rule | Value | Why |
|---|---|---|
| Break at sentence end | always | A cue that ends mid-clause reads as a stumble |
| Break at a clause comma | if the cue is already near max | Better than a hard wrap mid-phrase |
| Max characters per line | **42** (English) | Roughly 7 words; fits 16:9 and 9:16 both |
| Max lines per cue | **2** | Three lines covers the speaker's face |
| Min cue duration | **1.0 s** | Anything shorter flashes and cannot be read |
| Max cue duration | **7.0 s** | Longer and the viewer's eye leaves the text |
| Reading rate | **max 17 characters per second** | Above that, the cue is gone before it is read |
| Gap between cues | 80 ms minimum | Back-to-back cues look like a rendering glitch |
| Extend last word | +150 ms | Whisper clips word ends slightly |

When a sentence is too long for one cue, split at the latest comma, conjunction, or
preposition before the character limit. Never split a name, a number, or a unit from
its value.

## Output

```
<slug>.<lang>.srt        e.g. module-03-intro.en.srt
```

SRT format, UTF-8, no BOM, CRLF or LF both fine, blank line between cues:

```
1
00:00:00,120 --> 00:00:03,480
Right, so this is the bit everyone

2
00:00:03,560 --> 00:00:06,900
gets wrong on their first flight.
```

## Verify before handing off

1. `wc -l` the SRT and eyeball the first, middle and last three cues.
2. Check the last cue's end timestamp against the file duration from ffprobe. If the
   transcript stops at 9:58 on a 47-minute file, a chunk was dropped.
3. Grep for repeated lines - `sort | uniq -c | sort -rn | head` - which is what a loop
   hallucination looks like from the outside.
4. Spot-check three timestamps by seeking the video there.

Then say what you checked. "Transcribed, 412 cues, last cue ends 46:51 against a 46:53
file, no repeated lines" is a report.
