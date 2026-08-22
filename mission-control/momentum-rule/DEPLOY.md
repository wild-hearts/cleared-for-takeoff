# Deploying this into Mission Control

This folder is the payload. It was authored in a remote container that cannot
reach `168.144.175.96` (no SSH client, no key, port 22 unreachable through the
agent proxy), so the last step has to run from the Mac Mini.

## What's here

| File | What it is |
|---|---|
| `00_INDEX.md` | Brain Vault entry for The Momentum Series. Brand, voice, rules, integrations, decision log. Every agent reads this before any task. |
| `tasks.json` | All 40 tasks with owner, phase, priority, due date and status, plus the twelve pre-existing tasks and what each one maps to. |
| `campaign-90-day.md` | The campaign brief. Phase gates, content pillars, the twenty hooks, what Ember should run and when. |

## Before you run anything

Two things I could not verify from here, so check them first:

1. **The live brand layout.** I know from your notes that brands live at
   `/opt/crewible-engine/brands/<slug>/` and that runs log to
   `<slug>/.crewible/runs/*.log`, because that is the path in the `mmp` command.
   I could not inspect the inside of a brand directory. Look at how `mmp` is laid
   out and match it. If `mmp` keeps its vault somewhere other than
   `Brain Vault/00_INDEX.md`, put `00_INDEX.md` where `mmp` keeps its.

2. **Whether the engine runs one shared vault or one per brand.** The crew-setup
   skill describes a single `Brain Vault/` per project. If yours is shared, merge
   the Brand, Brand voice, Rules and Integrations sections of `00_INDEX.md` into
   the existing index rather than dropping a second one in.

## Deploy

From the Mac Mini, in the directory that holds this folder:

```bash
# 1. Look at how an existing brand is laid out before copying anything in
ssh -i ~/.ssh/wildhearts_server root@168.144.175.96 \
  'find /opt/crewible-engine/brands/mmp -maxdepth 3 -not -path "*/runs/*" | head -40'

# 2. Create the brand directory (adjust the slug and layout to match step 1)
ssh -i ~/.ssh/wildhearts_server root@168.144.175.96 \
  'mkdir -p "/opt/crewible-engine/brands/momentum/Brain Vault"'

# 3. Copy the payload up
scp -i ~/.ssh/wildhearts_server 00_INDEX.md \
  root@168.144.175.96:"/opt/crewible-engine/brands/momentum/Brain Vault/00_INDEX.md"
scp -i ~/.ssh/wildhearts_server tasks.json campaign-90-day.md \
  root@168.144.175.96:/opt/crewible-engine/brands/momentum/

# 4. Confirm it landed
ssh -i ~/.ssh/wildhearts_server root@168.144.175.96 \
  'ls -la /opt/crewible-engine/brands/momentum/ "/opt/crewible-engine/brands/momentum/Brain Vault/"'
```

## Then add it to the schedule

The engine currently runs **MMP only**, at 6 am, 1 pm and 7 pm Sydney time. Adding
a second brand means adding it to whatever drives that schedule. Check the crontab
first:

```bash
ssh -i ~/.ssh/wildhearts_server root@168.144.175.96 'crontab -l'
```

Then mirror the MMP line for `momentum`. Start it at **one run a day, not three**.
Week zero has nothing to post, so a three-a-day cadence would just burn tokens
producing drafts nobody wants yet. Move it to three when P1 starts on 28 August.

## First run

Ask Ember to read the vault and confirm before it does anything:

```
Ember, read Brain Vault/00_INDEX.md and tasks.json for the momentum brand.
Tell me which tasks you believe are yours, and which you think belong to a human.
Do not execute anything yet.
```

If Ember claims the account warming or the comment replies, correct it. Those are
human-only and the vault says so, but it is worth confirming the vault is being
read before the engine runs unattended.

## The OpenClaw question

Four tasks are assigned to `openclaw`: caption burn-in, daily cross-posting, the
weekly metrics pull, and next quarter's hook harvest. That lane was assumed, not
confirmed, because OpenClaw appears nowhere in the repos, the Command Centre or
the crew definitions.

If OpenClaw and Ember are the same runner, reassign all four to `ember` in
`tasks.json` before deploying. If OpenClaw cannot drive a logged-in browser,
reassign the cross-posting and captions to `knomes`, which costs about ten minutes
a day.
