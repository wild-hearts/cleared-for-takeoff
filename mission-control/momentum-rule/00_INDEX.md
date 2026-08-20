# Brain Vault — The Momentum Series

Brain Vault entry for Mission Control (crewible engine). Every agent reads this
before any task on this brand.

Drop into the brand's vault at `/opt/crewible-engine/brands/momentum/Brain Vault/00_INDEX.md`,
or merge the sections below into the operation-wide `00_INDEX.md` if the engine
runs one shared vault. See `DEPLOY.md`.

## Business

- **Operation:** Wild Hearts Publishing Pty Ltd. Books, songs and courses, mostly
  written and released from inside the thing they are about.
- **Operator:** Knomes. The crew reports to her, and Bench can veto anything before
  it ships.

## Brand

| Brand | One-line description | Notes |
|---|---|---|
| The Momentum Series | Anti-guru self-help built on one rule: you act your way into becoming. | Three books. Book 1 live on Amazon, Book 2 published, Book 3 in the series. |

**Book 1:** *The Momentum Rule: Stop Waiting. Start Moving. Even Like That.*
ASIN B0GRXTKDD3 (Kindle). Also sold direct at themomentumrule.com.
**Book 2:** *The But I Will Era.* Published.
**Book 3:** *Your Body Is Not Your Soul.*

**Attached assets:** fifteen chapter conversations, fifty original songs by The
Winks on Spotify mapped to a sixty-day programme, and the Momentum 60 app
(tracker, daily prompts, five daily rules).

## Brand voice (for Red)

Knomes's core strategic voice at full volume. Hard-edged, direct, earned. Written
from the middle of things, not from a calm summit. Dark humour that carries weight
because the stakes are real. The reader feels deeply, thinks deeply, and
occasionally freezes: validate the freeze without coddling it, then get them moving.

**Do:** be specific. A brand name, a dollar amount, a dog doing something
inconvenient. Jokes that carry the point rather than jokes for their own sake.

**Don't:** preach, coddle, hedge, apologise, reach for self-help platitudes, vague
inspiration, toxic positivity, or anything that implies her load is too heavy.

**Language:** Australian English throughout (colour, honour, recognise, practise,
organise, behaviour). Never use em dashes, restructure the sentence instead. No
anaphora, so do not start consecutive sentences or clauses with the same word.
Always a space between number and am/pm, so "2 am" not "2am". Oxford comma is fine.

**Example lines:**
- Motivation is a con artist. It turns up in week one with champagne and sends a postcard from Bali in week three.
- Confidence is not a personality type. It is evidence your body collected while you were not looking.
- The running shoes have been in the hallway so long the dog has started sleeping on them.

## Rules & constraints (for everyone)

- Never confuse the brother with the son. The brother is dead. The son is an
  international volunteer soldier in Ukraine. They are separate people.
- "Two legs and a heartbeat is enough" is the through-line.
- Copy the structure of a proven hook, never the sentence. This brand is explicitly
  anti-guru, so recycled guru phrasing contradicts the book on sight.
- Never buy or trade Amazon reviews. It gets listings pulled.
- Account warming and comment replies are human-only. A bot reply in this niche
  does more harm than no reply.
- Bench reviews anything that ships in Knomes's name.

## Integrations & IDs

- **Amazon KDP:** Book 1 ASIN B0GRXTKDD3. Amazon Attribution to be set up (W0-11).
- **Direct sales:** themomentumrule.com, with `/start` as the single landing page.
- **Email:** MailerLite. Welcome and launch sequence in progress.
- **Spotify:** The Winks catalogue, fifty tracks mapped to the sixty-day programme.
- **Short links:** `/tt` `/ig` `/yt` `/fb` on themomentumrule.com, one per platform,
  all landing on `/start` with a different tag. This is how platform attribution works.
- **Not connected:** TikTok and YouTube have no adapter in the publishing engine.
  Short-form posting is manual or OpenClaw's, not the engine's.

## Decisions & history

- 2026-08-20 — 90-day short-form plus Amazon launch briefed. Built on the 95/5
  hook-modelling method, with a conversion path and the Amazon listing work added,
  because the source method covers views and says nothing about sales.
- 2026-08-20 — Link policy: `/start` by default so the email is captured, Amazon
  direct only during the five-day rank push and for anyone already on the list.
- 2026-08-20 — Decided not to build TikTok/YouTube video upload into the publishing
  engine. Weeks of work to save ten minutes a day.
- 2026-08-20 — Mirror only. The Notion Command Centre keeps its copy of the 40
  tasks; Mission Control is the source of truth.
