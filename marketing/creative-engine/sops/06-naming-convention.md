# SOP 06: Naming Convention

**Purpose:** the asset's name carries its entire experiment, so Analysis can
read what was tested from a performance report without opening a single file.
Six months from now, "final_v2_USE-THIS-ONE.png" tells us nothing. The name
below tells us everything.

## The format

```
YYYYMMDD_segment_micropersona_awareness_anchor_format_hook#_v#
```

All lowercase, underscores between fields, hyphens inside a field. No spaces,
ever, in anything.

| Field | Values | Example |
|---|---|---|
| date | launch date, YYYYMMDD | `20260824` |
| segment | matches the site's audience pages | `later-life`, `trades`, `smallbiz`, `parents` |
| micropersona | short slug from the concept card | `retired-teacher`, `sparkie-9pm` |
| awareness | `unaware` `problem` `solution` `product` `most` | `problem` |
| anchor | `pain` or `desire` plus a one-word slug | `pain-behind`, `desire-grandkids` |
| format | `pin` `fbimg` `vvid` `card` `email` | `pin` |
| hook | `h1`, `h2`, `h3` per the brief's variant list | `h2` |
| version | `v1` bumps only on a QA fix | `v1` |

## Examples

```
20260824_later-life_retired-teacher_problem_pain-behind_pin_h1_v1
20260824_later-life_retired-teacher_problem_pain-behind_pin_h2_v1
20260901_trades_sparkie-9pm_solution_desire-evenings_vvid_h1_v2
```

Those first two are the same experiment with the hook as the only variable,
and the name says so at a glance. That is the whole point.

## Where the name goes

- The exported file itself, at Production time.
- The post/pin/ad title or internal label wherever the channel allows one.
- The UTM `utm_content` parameter (see Launch SOP), so analytics rows carry
  the same string as the file.
- The QA log entry and the findings log entry.

One string, four places, zero joins to do by hand later.

## Rules

1. A hook variant is a new `h#`, not a new version. `v#` bumps only when QA
   sends an asset back and it returns fixed.
2. New micropersona slugs get added to the concept card first, then reused
   verbatim forever. `retired-teacher` and `retiredteacher` are, as far as
   Analysis is concerned, strangers.
3. If a field genuinely does not apply, write `na`, do not drop the field.
   Every name has exactly eight fields so they can be split and sorted.
