# SOP 02: Ideation

**Purpose:** come in with a goal, leave with ad concepts. This is where the
engine lives. Every step below narrows the last one, so by the time a hook gets
written it already knows who it is for, what it anchors on, and where it will
run. Hooks written before that point are guesses with good posture.

## Inputs

- A goal. One sentence, measurable. "Get more Module 1 starts from the
  later-life segment" is a goal. "Do some TikToks" is a mood.
- The two vaults from SOP 01. If the customer vault is thin for the segment the
  goal names, stop and run Research first. The engine consumes research; it
  does not run on fumes.

## The chain, in order

### 1. Product + Customer

Open both vaults side by side. Product: the catalogue, features, facts only.
Customer: reviews, comments, social verbatims for the target segment.

### 2. Pain OR Desire

Pick **one** anchor from the customer vault. One. An ad that speaks to a pain
and a desire at the same time speaks to neither. The anchor must be a verbatim
or traceable to one; if it cannot be traced, it goes back to Research.

### 3. Persona > Micropersona

Group the anchor by life context to generate personas, then go one level deeper
to identify micropersonas. Our personas mostly already exist as the site's
audience pages (trades, later-life, small business, and the rest). The
micropersona is the level ads actually work at:

- later-life → "retired teacher who wants to keep up with the grandkids"
- later-life → "recent retiree whose main AI exposure is scam warnings"
- trades → "sole-trader sparkie drowning in quoting admin at 9pm"
- parents → "mum of a 13-year-old who is already using AI for homework"

One micropersona per concept. The retired teacher and the sparkie do not stop
scrolling for the same sentence.

### 4. Messaging Angle

The offer told through a messaging strategy, matched to where the micropersona
sits on the awareness ladder:

| Level | They currently think | So the ad must |
|---|---|---|
| Unaware | "AI has nothing to do with me" | Name their day, not the product |
| Problem aware | "I feel behind and I hate it" | Say "you are not behind, there is no behind" and mean it |
| Solution aware | "Maybe I should learn this somehow" | Show why a calm structured course beats YouTube roulette |
| Product aware | "I've seen Cleared For Take-Off" | Remove the risk: Module 1 free, $49 once, no subscription |
| Most aware | Finished Module 1, went quiet | Give one concrete reason to start Module 2 tonight |

### 5. Visual Format

The container well suited to convey the message, chosen per channel we actually
use: Pinterest pin, Facebook image post, short vertical video, blog-post share
card, email. Format follows message. A five-step reassurance does not fit a
pin; a single quiet sentence does.

### 6. Hook/Headline + Creative Mechanic

- **Hook/Headline:** the opening expression that stops the scroll. Written in
  the customer's own words wherever possible; the vault is full of them.
- **Creative Mechanic:** the strategy deployed inside the ad to hold attention
  once the hook has done its job: a myth-busting list, a before/after of one
  real task, a screen recording of one prompt working, a reader quote read
  aloud.

### 7. Ad Concept(s)

Each surviving combination becomes a concept card in `../concepts/`:

```
# Concept: [short name]
goal:          [the goal this serves]
anchor:        [pain|desire] + the verbatim it traces to
micropersona:  [one]
awareness:     [unaware|problem|solution|product|most]
angle:         [one sentence: the offer told how]
format:        [pin|fb-image|vertical-video|share-card|email]
hook:          [the opening line]
mechanic:      [what holds attention after the hook]
hypothesis:    We believe [micropersona] will [action] because [anchor].
status:        proposed | approved | briefed | killed
```

## Done when

The session ends with 3 to 5 concept cards filed, each traceable to a verbatim,
each with a falsifiable hypothesis. Approved cards move to Briefing (SOP 03).
Killed cards stay in the folder with one line on why; a killed concept is a
finding too.
