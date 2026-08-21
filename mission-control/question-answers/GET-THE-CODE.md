# Mission Control: adding a way to answer its questions

**The problem (Naomi, 21 Aug 2026):** the Mission Control web dashboard shows
tasks with only approve or reject. When the crew asks a question, there is no
way to type an answer.

**The blocker:** the dashboard and engine code live only on the DigitalOcean
server (`168.144.175.96:/opt/crewible-engine`). Remote Claude sessions cannot
reach it: no SSH client, no key, port 22 blocked by the agent proxy. Same
constraint the Momentum deploy hit (see `../momentum-rule/DEPLOY.md`).

**The plan, agreed with Naomi:** she runs one command from the Mac that holds
the `wildhearts_server` key. It copies the engine down (read-only, the server
is never written to), strips secrets, and pushes it to a **private** repo at
`github.com/wild-hearts/mission-control`. A Claude session then builds the fix
there and hands back a one-paste deploy, same shape as the Momentum payload.

## The command Naomi runs

Paste the whole block into Terminal on the Mac with the server key:

```bash
bash -c '
set -e
WORK="$HOME/mission-control-upload"
rm -rf "$WORK"; mkdir -p "$WORK"

echo "1/4 Copying the engine down from the server..."
ssh -i ~/.ssh/wildhearts_server root@168.144.175.96 \
  "tar czf - -C /opt --exclude-vcs --exclude=\"*node_modules*\" \
   --exclude=\"*.crewible/runs*\" --exclude=\"*.log\" \
   --exclude=\"*__pycache__*\" --exclude=\"*.venv*\" crewible-engine" \
  | tar xzf - -C "$WORK"
cd "$WORK/crewible-engine"

echo "2/4 Deleting key files and scrubbing tokens..."
find . \( -name ".env" -o -name ".env.*" -o -name "*.pem" -o -name "*.key" \
  -o -name "id_rsa*" -o -name "id_ed25519*" \) -print -delete
grep -RIl "sk-ant-" . 2>/dev/null | while read -r f; do
  sed -E -i "" "s/sk-ant-[A-Za-z0-9_-]+/REMOVED-TOKEN/g" "$f"
  echo "   scrubbed a token in: $f"
done

echo "3/4 Turning it into a git repository..."
git init -q -b main
git add -A
git -c user.name="Naomi Shiels" -c user.email="cryptotradingmom@gmail.com" \
  commit -qm "Mission Control engine snapshot, secrets removed"

echo "4/4 Pushing to GitHub (private)..."
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
   the same bug in a new place.
4. **Deploy payload.** The server stays untouched until Naomi runs a one-paste
   deploy from her Mac (scp + restart, mirroring `../momentum-rule/DEPLOY.md`).

Naomi's copy of these instructions is the "Mission Control Uplink" artifact
(published 21 Aug 2026).
