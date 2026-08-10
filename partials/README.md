# partials/ — the site chrome, in one place

Every page on this site is standalone hand-written HTML. There is no framework
and no runtime include, so the header, footer and audience directory used to be
physically copied into all 29 pages. They drifted: six different navigations
were live at once, `/about/` was linked from almost nowhere, and ten audience
pages had replaced the site nav with page anchors, so a visitor arriving from
search had no route into the rest of the site.

These files are now the only source of that markup.

| File | What it is |
|---|---|
| `site-head.html` | The one site header. Edit a nav link here and nowhere else. |
| `site-footer.html` | The one site footer. |
| `audience-directory.html` | The "One course, many doors" block above every footer. |
| `site-chrome.css` | All CSS for the three above, plus the secondary sub-nav. |
| `subnav.json` | Per-page anchor navigation, rendered *beneath* the site header. |

The behaviour that goes with them lives in `../assets/site-chrome.js` — the
mobile menu and the scrolled header state. That used to be inline on the
homepage only, which is why the hamburger did nothing on every other page.

## Making a change

```bash
npm run site
```

This rewrites the chrome in place across every page. It is idempotent: run it
twice and the second run writes nothing.

To check without writing anything (useful before a deploy):

```bash
npm run check
```

Exits non-zero and names the files if any page has drifted from `partials/`.

## How it works

On the first pass over a page the script wraps the existing header, footer and
audience-directory blocks in marker comments:

```html
<!-- @chrome:header — DO NOT EDIT BELOW ... -->
...generated...
<!-- @endchrome:header -->
```

After that it replaces whatever sits between the markers. Anything outside them
is untouched, so page-specific markup and styling are safe.

The chrome CSS is injected as the last `<style>` in `<head>`. That is
deliberate: the older `.head` / `.site-head` rules are still inlined in the
page files, and source order is what lets the canonical block win without
having to surgically strip CSS out of 29 files.

**One trap worth knowing.** Because the canonical rules are scoped
(`.site-head .btn`), any rule meant to override them must be scoped to match.
A bare `.head-cta { display: none }` loses to `.site-head .btn` on specificity
and the mobile CTA stays on screen, pushing the nav off the page.

## Scope

Not touched: `course/**` (the gated member area has its own shell and is
`noindex`), `.vercel/`, and the Google Search Console verification file, which
must stay byte-exact.
