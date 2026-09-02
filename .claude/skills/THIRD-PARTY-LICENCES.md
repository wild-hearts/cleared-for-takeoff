# Third-party licences

## jianshuo/claude-skills

Source: https://github.com/jianshuo/claude-skills

The following skills in this repository are adapted from that collection:

| This repo | Adapted from |
|---|---|
| `wh-transcribe-audio` | `wjs-transcribing-audio` |
| `wh-translate-subtitles` | `wjs-translating-subtitles` |
| `wh-burn-subtitles` | `wjs-burning-subtitles` |
| `wh-dub-video` | `wjs-dubbing-video` |
| `wh-reframe-video` | `wjs-reframing-video` |
| `wh-video-pipeline` (routing structure) | `wjs-localizing-video` |

Adaptations: rewritten for English-source, Australian-English output; Chinese-platform
dependencies removed (Volcano/豆包 ASR and TTS, WeChat and 视频号 publishing, HyperFrames,
VoiceDrop MCP); macOS-only ffmpeg assumptions replaced with cross-platform detection;
per-language subtitle limits and glossary rules specific to Wild Hearts added.

`wh-audio-repair`, `wh-assemble-video`, and the scripts `audio_doctor.py`,
`build_video.py` and `preflight.sh` are original work in this repository.

---

MIT License

Copyright (c) 2026 Jianshuo Wang (王建硕)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
