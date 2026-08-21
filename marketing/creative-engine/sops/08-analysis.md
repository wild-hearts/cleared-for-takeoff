# SOP 08: Analysis

**Purpose:** validate hypotheses (true or false) and memorialise findings.
What worked, what didn't, and why becomes an index of components that goes
back into Research and gets fed into Ideation. This stage is why the engine is
a flywheel and not a hamster wheel: the wheel spins either way, but only one of
them goes anywhere.

## Review windows

| Format | Review at |
|---|---|
| Pinterest pin | 14 days, then 60 days (pins are slow burners) |
| Facebook/Instagram organic | 7 days |
| Vertical video | 7 days |
| Email | 4 days |
| Paid ad | when spend clears roughly 20x the target cost per action, not before |

Reviews happen at the window, on the date logged at launch. Not before. An ad
judged early is an ad judged on noise.

## The pass

For each asset due for review:

1. Pull the numbers for its `utm_content` string (and the channel's native
   stats where links don't apply: saves, watch-through, replies).
2. Answer the hypothesis with **TRUE**, **FALSE**, or **UNDERPOWERED** (not
   enough volume to say; that verdict is allowed here, unlike QA).
3. Ask what specifically did the work or the damage. The naming convention
   makes this readable across assets: if every `pain-behind` name beats every
   `desire-grandkids` name across formats, that is a finding about the anchor,
   not about any one pin.

## Memorialise

Append to `../research/findings.md`:

```
## F-2026-014
date: 2026-09-07
assets: [the full asset names covered]
hypothesis: We believed [micropersona] would [action] because [anchor].
verdict: TRUE | FALSE | UNDERPOWERED
evidence: [the numbers, actual ones]
finding: [one or two sentences, written so it is usable in a year]
feeds: [what to do next: new concept, kill the angle, promote hook to other segments]
```

Findings are numbered and never deleted, including the embarrassing ones.
A FALSE verdict that saves us from re-testing a dud angle next quarter is worth
as much as a TRUE one. The findings file is the third shelf of the research
vault; Ideation reads it before every session.

## Component index

Once a component (a hook, an anchor, a mechanic, a format) has two or more
TRUE verdicts behind it, add it to a `## Proven components` list at the top of
`findings.md`, with the finding numbers as receipts. Proven components are the
first thing a new concept reaches for, and the list doubles as an honest answer
to "what do we actually know about our marketing?" at any given moment.

## Done when

Every asset due for review has a verdict, every verdict has a finding, and at
least one line in `feeds:` is an instruction someone could act on next session.
Then the loop closes: the findings land in Research, and the next Ideation
session starts richer than the last one did.
