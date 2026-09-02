#!/usr/bin/env bash
# Package each wh-* skill as a zip for upload to claude.ai
# (Settings -> Capabilities -> Skills -> Upload skill), which makes it available
# in Cowork, claude.ai chat, and every Claude Code session on the account.
#
# Repo-level skills already work in this repository without any of this.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/.claude/skills"
OUT="$ROOT/dist/skills"

command -v zip >/dev/null 2>&1 || {
  echo "error: zip not installed. apt-get install -y zip  |  brew install zip" >&2
  exit 1
}

rm -rf "$OUT"
mkdir -p "$OUT"

count=0
for dir in "$SRC"/wh-*/; do
  [ -d "$dir" ] || continue
  name="$(basename "$dir")"
  [ -f "$dir/SKILL.md" ] || { echo "skip $name - no SKILL.md"; continue; }

  # claude.ai expects the skill folder at the root of the zip.
  (cd "$SRC" && zip -q -r "$OUT/$name.zip" "$name" \
      -x '*.DS_Store' '*/__pycache__/*' '*.pyc')
  size=$(du -h "$OUT/$name.zip" | cut -f1)
  printf '  %-26s %s\n' "$name.zip" "$size"
  count=$((count + 1))
done

echo
echo "  $count skill(s) -> dist/skills/"
echo
echo "  Upload at: claude.ai -> Settings -> Capabilities -> Skills -> Upload skill"
echo "  Repo-level skills already work here without uploading anything."
