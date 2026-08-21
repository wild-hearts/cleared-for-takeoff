# Mission Control: adding a way to answer its questions

**The problem (Naomi, 21 Aug 2026):** the Mission Control web dashboard shows
tasks with only approve or reject. When the crew asks a question, there is no
way to type an answer.

**Where the code lives:** Naomi confirmed Mission Control runs on **her
laptop**, not the Mac Mini and not the DigitalOcean server. Remote Claude
sessions cannot see the laptop, so the agreed path is: she runs one command
on the laptop that finds the Mission Control folder, makes a secret-stripped
copy, and pushes it to a **private** repo at
`github.com/wild-hearts/mission-control`. A Claude session builds the fix
there and hands back a one-paste update for the laptop.

(An earlier revision of this file assumed the code sat on the DigitalOcean
server at `168.144.175.96:/opt/crewible-engine`, next to the crewible engine
that the Momentum payload in `../momentum-rule/DEPLOY.md` targets. The server
copy may still matter for the crew side of the fix; the dashboard is on the
laptop.)

## The command Naomi runs (Terminal, on the laptop)

```bash
bash -c '
set -e
echo "1/5 Finding Mission Control on this Mac..."
SRC=""
for d in "$HOME/Documents/mission-control" "$HOME/mission-control" \
         "$HOME/Desktop/mission-control" "$HOME/Documents/crewible-engine" \
         "$HOME/crewible-engine"; do
  [ -d "$d" ] && SRC="$d" && break
done
if [ -z "$SRC" ]; then
  SRC=$(find "$HOME" -maxdepth 4 -type d \( -iname "mission-control" -o -iname "*crewible*engine*" \) \
    -not -path "*/Library/*" -not -path "*/.Trash/*" 2>/dev/null | head -1)
fi
if [ -z "$SRC" ]; then
  echo "STOP: could not find a Mission Control folder. Paste everything below back to Claude:"
  find "$HOME" -maxdepth 3 -type d -iname "*mission*" -not -path "*/Library/*" 2>/dev/null
  exit 1
fi
echo "   found: $SRC"

WORK="$HOME/mission-control-upload"
rm -rf "$WORK"; mkdir -p "$WORK/src"
echo "2/5 Making a clean copy (the original is not touched)..."
rsync -a --exclude node_modules --exclude .git --exclude .venv \
  --exclude __pycache__ --exclude "*.log" --exclude ".crewible/runs" \
  "$SRC/" "$WORK/src/"
cd "$WORK/src"

echo "3/5 Deleting key files and scrubbing tokens..."
find . \( -name ".env" -o -name ".env.*" -o -name "*.pem" -o -name "*.key" \
  -o -name "id_rsa*" -o -name "id_ed25519*" \) -print -delete
grep -RIl "sk-ant-" . 2>/dev/null | while read -r f; do
  sed -E -i "" "s/sk-ant-[A-Za-z0-9_-]+/REMOVED-TOKEN/g" "$f"
  echo "   scrubbed a token in: $f"
done

echo "4/5 Turning the copy into a git repository..."
git init -q -b main
git add -A
git -c user.name="Naomi Shiels" -c user.email="cryptotradingmom@gmail.com" \
  commit -qm "Mission Control snapshot from the laptop, secrets removed"

echo "5/5 Pushing to GitHub (private)..."
if ! command -v gh >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then brew install gh; else
    echo "STOP: no GitHub tool and no Homebrew. Paste this whole screen back to Claude."
    exit 1
  fi
fi
gh auth status -h github.com >/dev/null 2>&1 || gh auth login -h github.com -p https -w
gh repo create wild-hearts/mission-control --private --source=. --remote=origin --push \
  || { git remote add origin https://github.com/wild-hearts/mission-control.git 2>/dev/null || true
       git push -u origin main; }

echo ""
echo "ALL DONE. The code is at github.com/wild-hearts/mission-control (private)."
echo "Go back to Claude and say: the mission-control repo is up."
'
```

Alternative: the laptop also runs Claude Code locally. A local session can do
the same job directly ("push the Mission Control folder to a private GitHub
repo called wild-hearts/mission-control, strip secrets first").

## For the session that picks this up once the repo exists

Work in `wild-hearts/mission-control`, not here. In order:

1. **Secret sweep first.** The scrub above deletes `.env*`, key files and
   `sk-ant` tokens, but config files may still carry other credentials
   (Notion, Vercel, platform keys). Find and purge before anything else, and
   tell Naomi which credentials to rotate if any were committed.
2. **Find the task feed.** Locate where the dashboard renders a task and where
   approve/reject post back to.
3. **Add answers.** Question-type items get a free-text reply; every task gets
   an optional note alongside approve/reject. Store answers where the crew's
   next run reads them, and make the run consume them — an unread answer is
   the same bug in a new place. If the crew runs on the DigitalOcean server
   rather than the laptop, the answers must reach the server side too; check
   how the dashboard and the engine share state before deciding where answers
   live.
4. **Update payload.** Mission Control on the laptop stays untouched until
   Naomi runs a one-paste update in Terminal (or her local Claude Code applies
   it), mirroring the shape of `../momentum-rule/DEPLOY.md`.

Naomi's copy of these instructions is the "Mission Control Uplink" artifact
(revised 21 Aug 2026, laptop edition).
