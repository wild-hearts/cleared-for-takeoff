# SOP 04: Production

**Purpose:** build what the brief describes, to our specs: ratios, safe zones,
naming. Craft happens here; ambiguity gets fixed upstream. Production is the
only stage with no strategic decisions in it, which is exactly what makes it
fast.

## The prime rule

**If the brief is unclear, stop and send it back.** Do not improvise, do not
"interpret", do not fill a gap with taste. An improvised asset cannot be tested,
because nobody knows what it was testing. Return the brief with the specific
question, Briefing fixes it, and the Briefing SOP gets a line added so the gap
never opens again.

## Specs

| Format | Size | Safe zone |
|---|---|---|
| Pinterest pin | 1000 x 1500 | Text inside the middle 80%; Pinterest overlays chrome top and bottom |
| Facebook/Instagram image | 1080 x 1080 | Nothing important in the outer 60px |
| Vertical video | 1080 x 1920, 60s max | Captions in the middle band; UI covers the right edge and bottom quarter |
| Blog share card | 1200 x 630 | Title readable at thumbnail size, test at 300px wide |
| Email | plain text preferred | First 90 characters do the work; that is all the preview shows |

- Colours and type come from the site (`styles.css`), not from whatever the
  tool defaults to. The brand already has a look; use it.
- Every image gets alt text written at production time, not retrofitted.
- Video gets burned-in captions. A large share of our audience watches muted,
  and a share of it does not hear well. Both matter.

## Variants

Produce exactly the variants the brief asks for, varying only what the brief
says varies. If the brief says three hooks over one image, do not also change
the image on variant two. One variable per variant or the test is soup.

## Working files

Masters (Canva links, project files, raw video) get logged at the bottom of the
brief so the asset can be regenerated or resized later without archaeology.
Exports are named per the naming convention SOP (06) **before** they leave this
stage; an asset with a wrong name does not exist as far as Launch and Analysis
are concerned.

## Done when

Every deliverable in the brief exists, named correctly, alt-texted or
captioned, with masters logged. Set the brief's status to `produced` and hand
the lot to QA (SOP 05). Production never launches anything directly, including,
and especially, when it is confident.
