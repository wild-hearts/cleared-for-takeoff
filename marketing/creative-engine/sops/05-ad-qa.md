# SOP 05: Ad QA

**Purpose:** nothing ships without a pass. Every asset gets checked against the
list below and gets a written verdict: **cleared**, or a **fix list**. There is
no third verdict, and there is no "cleared, mostly". This is the stage that
protects the brand and, occasionally, the company from the ACCC, so it is the
one SOP that never gets skipped for time.

## The checklist

Run every item against every asset. Verbatim answers, not vibes.

### Truth (fail any of these and the asset dies, not the wording)

1. Every factual claim appears in `../research/product-facts.md`, current
   version. Price, module count, hours, free Module 1, lifetime access: check
   each against the file, not memory.
2. Nothing advertised that does not exist today. If the videos are still
   pending, no ad says "6 to 8 hours of video" in a way that sells the course
   as deliverable now.
3. No income claims, no side-hustle framing, no productivity-multiplier
   numbers. The brand makes none of these promises anywhere, so no ad gets to
   be the first.
4. Any statistic has a source we could produce if a stranger asked.

### Brand and voice

5. Australian English throughout (organise, enrol, no "gotten").
6. No hype vocabulary: unlock, elevate, game-changer, revolutionary, seamless,
   journey (metaphorical), "in today's world".
7. No em dashes anywhere in the copy.
8. Nothing that condescends. Read it as the retired teacher; if any line makes
   her feel behind, it fails, because "there is no behind" is the entire brand.
9. The aviation motif is welcome and the Captain/crew framing is ours; check it
   is used correctly (the reader is the Captain, never the passenger).

### Mechanics

10. The one action matches the brief, appears once, and the link works. Click
    it. Actually click it.
11. Landing page delivers what the hook promised. A hook about scam-spotting
    that lands on the generic homepage fails here, not at the landing page.
12. Name conforms to the naming convention SOP (06). Analysis is blind without it.
13. Alt text present on images; captions burned into video.
14. Correct sizes and safe zones per the Production SOP table.
15. Legal footer bits where the channel requires them (sponsored disclosure if
    ever boosted, unsubscribe in email).

## The verdict

Append to `../qa-log.md`:

```
## [asset filename]
date: 2026-08-20
verdict: CLEARED | FIX LIST
fixes:
  - [numbered item that failed] + [what to change]
checked by: [Naomi | crew model + version]
```

A fix list goes back to Production (or to Briefing, if the defect was upstream),
gets fixed, and comes back through the **whole** checklist again, not just the
failed item. Fixes have a talent for breaking neighbouring items.

## Done when

The verdict is written in the log. Cleared assets move to Launch (SOP 07).
Nothing moves on a verbal "yeah it's fine", including from me.
