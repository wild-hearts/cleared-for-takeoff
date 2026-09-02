---
name: wh-translate-subtitles
description: Translate an SRT or transcript from one language into another, or into a bilingual pair, re-segmenting so cues end at real sentence boundaries in the target language rather than inheriting the source language's breaks. Handles reading-rate limits per language, name and brand preservation, and Australian English conventions on the English side. Text only - burning it onto the picture is wh-burn-subtitles, speaking it is wh-dub-video. Triggers - "translate the subtitles", "Spanish subtitles", "bilingual subs", "translate this SRT", "make an English version of the captions", "subtitle this for the French market".
---

# wh-translate-subtitles

Source SRT in, target SRT out. Text only. No audio, no burn-in, no re-encoding.

Adapted from Jianshuo Wang's MIT-licensed `wjs-translating-subtitles`
(https://github.com/jianshuo/claude-skills).

## Before you start

- No source SRT yet? Run `wh-transcribe-audio` first.
- Naomi is the author. Invoke the `naomi-voice` skill for the English side of any
  bilingual pair, and for any English source you are tidying as you go. Subtitles are
  prose that happens to have timestamps.

## The re-segmentation problem

The naive approach translates each cue in place and keeps its timings. It produces
subtitles that break where the *source* language broke, which in the target language
lands mid-phrase. German verbs end up alone on a line. Spanish subordinate clauses get
guillotined.

Do this instead:

1. **Join** the source cues back into continuous sentences, keeping each sentence's
   start and end timestamps.
2. **Translate** whole sentences, with two sentences either side as context. Cue-by-cue
   translation loses the referent of every pronoun.
3. **Re-split** the translated sentence into cues at target-language boundaries.
4. **Redistribute** the sentence's time span across its new cues in proportion to
   character count, respecting the reading-rate cap below.

## Per-language limits

| Target | Chars per line | Lines | Max chars/sec | Notes |
|---|---|---|---|---|
| English (en-AU) | 42 | 2 | 17 | Australian and UK spelling. ASCII punctuation only - curly quotes break some players. |
| Spanish (es) | 42 | 2 | 17 | Runs about 20% longer than English. Budget for it or trim. |
| French (fr) | 42 | 2 | 17 | Runs 15-20% longer than English. |
| German (de) | 42 | 2 | 16 | Longest of the European set. Compound nouns will blow the line limit - break them or paraphrase. |
| Portuguese (pt-BR) | 42 | 2 | 17 | |
| Italian (it) | 42 | 2 | 17 | |
| Japanese (ja) | 16 | 2 | 8 | Character-dense; the low rate is correct, not a typo. |
| Simplified Chinese (zh-CN) | 15 | 2 | 9 | Chinese punctuation only. Never mix ASCII commas in. |
| Korean (ko) | 20 | 2 | 12 | |
| Indonesian (id) | 42 | 2 | 17 | |

If a translation cannot fit the rate cap, shorten the translation. Do not extend the cue
past the moment the speaker moved on - subtitles that lag behind the picture are worse
than subtitles that paraphrase.

## Translation principles

- **Meaning over literalism.** A subtitle has under three seconds to land. "It is
  precisely by means of entering into the body" is a translation. "It's by getting into
  your body" is a subtitle.
- **Register follows the speaker.** Casual source, casual target. Naomi is dry and
  conversational; a translation that sounds like a user manual has lost the point.
- **Do not translate:** names, brand names, book titles, aviation terminology with a
  standard local form, product names, or anything in the glossary below.
- **Do translate carefully:** idiom, humour, and anything aviation-metaphorical. Wild
  Hearts material is full of "cleared for takeoff", "holding pattern", "final approach".
  Most languages have aviation phrasing; use theirs rather than calquing English.
- **Numbers, dates, units:** convert format, never value. 3 September 2026 becomes
  3 septembre 2026, not September 3.
- **No machine-translation tells.** Stiff subordinate clauses, retained English word
  order, over-explicit pronouns. Read the target aloud in your head; if it sounds
  translated, it is not finished.

## Fixed glossary - never translated

```
Wild Hearts Publishing   Naomi Shiels   Cleared for Takeoff
Claude   Anthropic   ChatGPT   Midjourney   Suno   Perplexity   Canva
```

Module and lesson titles: translate the words but keep the aviation metaphor intact.
"Pre-Flight Checks" should land as the target language's actual pre-flight terminology,
not a literal rendering of "checks before flight".

## Bilingual output

Two files, both derived from the same re-segmentation, so the cue boundaries line up:

```
module-03-intro.en.srt      source
module-03-intro.es.srt      target
module-03-intro.en-es.srt   combined - source on line 1, target on line 2
```

For the combined file, line 1 in the source language, line 2 in the target, no more than
one line each. Two languages at two lines apiece is four lines of text over a person's
face; nobody reads it.

## Verify

1. Cue count matches between source and target after re-segmentation, or you can explain
   the difference.
2. No cue exceeds its language's chars-per-second cap. Compute it: `len(text) / duration`.
3. No cue is shorter than 1.0 s or longer than 7.0 s.
4. Timestamps are monotonic and non-overlapping.
5. Glossary terms survived untranslated - grep for them.
6. Round-trip spot check: back-translate five random cues and see whether the meaning
   survived.

Report the numbers. "218 cues, longest reads at 15.8 cps against a 17 cap, no overlaps,
glossary intact" is a report.
