# Crew portraits

Faces for the Wild Hearts AI crew. Supplied by Naomi, 2 September 2026.

```
crew/
├── portraits/   full frame, 928 x 1232, for anything that needs the whole image
└── avatars/     512 x 512 square, cropped to the face, for rosters and cards
```

Avatars are generated from the portraits, so the portrait is the master. To
regenerate after replacing one:

```bash
ffmpeg -y -i portraits/<name>.jpg -vf "crop=928:928:0:250,scale=512:512:flags=lanczos" \
  -q:v 3 avatars/<name>.jpg
```

JPEG rather than PNG on purpose: these are photographs, there is no transparency
to preserve, and the PNG originals were 1.9 MB each. The whole folder is now
under a megabyte.

This directory sits under `marketing/`, which `.vercelignore` excludes, so none
of it deploys to the live site.

## Who is who

| File | Crew member | Role | Agent defined? |
|---|---|---|---|
| `polly` | Polly | Head of Marketing | Yes - `.claude/agents/polly.md` |
| `petal` | Petal | **not yet specified** | No |
| `marlow` | Marlow | **not yet specified** | No |

## Two things to confirm before this is trusted

1. **The file naming follows the order the images were sent in** (Polly, Petal,
   Marlow). Worth a second look: the image currently saved as `marlow` is the
   one covered in cherry blossom petals, which reads more like Petal than
   Marlow does. If they are the wrong way round, swapping is two `mv` commands
   and a regenerate.

2. **Petal and Marlow have faces but no jobs.** Neither has an agent definition,
   a remit, or a row in [CREW.md](../CREW.md). A crew member with an unclear
   remit will find one, which is precisely the failure mode the authority limits
   in `CREW.md` exist to prevent. Roles first, then definitions, then roster
   rows - in that order.
