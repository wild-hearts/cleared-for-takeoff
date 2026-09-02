#!/usr/bin/env bash
# Wild Hearts video toolkit - environment preflight.
# Reports what works, what does not, and how to fix it. Never exits non-zero
# on a missing optional dependency; the point is the report, not the gate.
set -uo pipefail

ok()   { printf '  \033[32m ok \033[0m %s\n' "$1"; }
bad()  { printf '  \033[31mMISS\033[0m %s\n' "$1"; }
warn() { printf '  \033[33mwarn\033[0m %s\n' "$1"; }

echo
echo "Wild Hearts video toolkit - preflight"
echo "======================================"
echo
echo "Core"

FF=""
if command -v ffmpeg >/dev/null 2>&1; then
  FF=$(command -v ffmpeg)
  ok "ffmpeg   $(ffmpeg -version 2>/dev/null | head -1 | cut -d' ' -f3)  ($FF)"
elif [ -x /tmp/ff_bin/ffmpeg ]; then
  FF=/tmp/ff_bin/ffmpeg
  warn "ffmpeg   static build at /tmp/ff_bin/ffmpeg (not on PATH)"
else
  bad "ffmpeg   NOT FOUND -> apt-get install -y ffmpeg  |  brew install ffmpeg"
fi

if command -v ffprobe >/dev/null 2>&1; then
  ok "ffprobe  present"
else
  bad "ffprobe  NOT FOUND (ships with ffmpeg)"
fi

if [ -n "$FF" ]; then
  FILTERS=$("$FF" -hide_banner -filters 2>/dev/null)

  if grep -qE '^ *[.TSC]+ +subtitles +' <<<"$FILTERS"; then
    ok "libass   burn-in available (subtitles/ass filters)"
  else
    bad "libass   MISSING - burn-in will fail, soft-mux still works"
    echo "         macOS fix: curl -fsSL -o /tmp/ff.zip https://evermeet.cx/ffmpeg/getrelease/zip"
    echo "                    unzip -o /tmp/ff.zip -d /tmp/ff_bin && export FF=/tmp/ff_bin/ffmpeg"
  fi

  for f in loudnorm afftdn arnndn deesser adeclip dynaudnorm highpass; do
    if grep -qE "^ *[.TSC]+ +$f +" <<<"$FILTERS"; then
      ok "filter   $f"
    else
      bad "filter   $f  (wh-audio-repair loses a repair mode)"
    fi
  done

  ENC=$("$FF" -hide_banner -encoders 2>/dev/null)
  grep -q libx264 <<<"$ENC" && ok "encoder  libx264" || bad "encoder  libx264 MISSING - cannot render H.264"
  grep -qE ' aac ' <<<"$ENC" && ok "encoder  aac" || bad "encoder  aac MISSING"
fi

echo
echo "Python"
if command -v python3 >/dev/null 2>&1; then
  ok "python3  $(python3 -c 'import sys;print(sys.version.split()[0])')"
else
  bad "python3  NOT FOUND"
fi

echo
echo "Speech to text (pick one - needed by wh-transcribe-audio)"
[ -n "${OPENAI_API_KEY:-}" ] && ok "OPENAI_API_KEY set  (Whisper API - fastest, best quality)" \
                             || bad "OPENAI_API_KEY unset  (Whisper API unavailable)"
python3 -c "import whisper" 2>/dev/null && ok "openai-whisper installed (local, no key, slow on CPU)" \
                                        || bad "openai-whisper not installed -> pip install openai-whisper"
python3 -c "import faster_whisper" 2>/dev/null && ok "faster-whisper installed (local, no key, quicker)" \
                                               || bad "faster-whisper not installed -> pip install faster-whisper"

echo
echo "Text to speech (pick one - needed by wh-assemble-video and wh-dub-video)"
command -v edge-tts >/dev/null 2>&1 && ok "edge-tts installed (free, many voices, en-AU available)" \
                                    || bad "edge-tts not installed -> pip install edge-tts"
[ -n "${ELEVENLABS_API_KEY:-}" ] && ok "ELEVENLABS_API_KEY set (paid, best quality, voice cloning)" \
                                 || bad "ELEVENLABS_API_KEY unset"
command -v say >/dev/null 2>&1 && ok "macOS 'say' available (offline fallback)" || true

echo
echo "Video generation from a text prompt"
bad "NOT AVAILABLE by design - no video model is wired into this toolkit."
echo "         Needs an API key for Runway / Veo / Kling / Sora / fal.ai plus a caller script."
echo
echo "Fonts (burn-in styling)"
if command -v fc-list >/dev/null 2>&1; then
  N=$(fc-list 2>/dev/null | wc -l | tr -d ' ')
  [ "$N" -gt 0 ] && ok "fontconfig: $N fonts available" || bad "fontconfig present but no fonts installed"
else
  warn "fc-list not found - cannot enumerate fonts; burn-in will fall back to ffmpeg's default"
fi
echo
