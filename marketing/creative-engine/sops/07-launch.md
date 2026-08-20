# SOP 07: Launch

**Purpose:** get cleared assets renamed per the naming convention SOP, then
launched, tracked, and logged so Analysis has something to analyse. Launch is
clerical on purpose. All the thinking happened upstream; this stage just
refuses to let good work ship untracked.

## Pre-flight

An asset may launch only if:

1. It appears in `../qa-log.md` with verdict **CLEARED** (SOP 05).
2. Its filename conforms to the naming convention (SOP 06).
3. Its brief's hypothesis is written down. Launching an asset with no
   hypothesis is spending effort to learn nothing.

Any of the three missing: back it goes. No exceptions for "it's just a pin".

## Links and tracking

Every link in every asset gets UTM parameters:

```
utm_source    = pinterest | facebook | instagram | tiktok | email | blog
utm_medium    = organic | paid
utm_campaign  = the goal slug from the concept card (e.g. later-life-module1)
utm_content   = the full asset name from SOP 06
```

`utm_content` carrying the full asset name is what stitches analytics back to
the experiment. Test the final URL after adding parameters; a mangled UTM
string on a working link is the most common launch defect we have.

## Channel notes

- **Pinterest:** pin to the matching board, keyword-rich description, link to
  the specific landing page, never the bare homepage.
- **Facebook/Instagram:** post at the times the automation engine already uses
  (6am, 1pm, 7pm Sydney) unless the brief says otherwise.
- **Email:** send to the matching segment only. The trades list does not get
  the later-life ad, however cleared it is.
- **Paid (when we get there):** start at the minimum viable spend, one ad set
  per experiment, and never edit a live ad (edits reset learning; kill and
  relaunch as `v2` instead).

## The launch log

Append to the brief, under a `## Launched` heading:

```
- 20260824 | pinterest/organic | [full asset name] | [final URL with UTMs]
  hypothesis: [copied from the concept card]
  review on: [date, per the windows in SOP 08]
```

Setting the review date at launch matters. Results are checked when scheduled,
not whenever anxiety strikes; day-two numbers have ruined more good ads than
day-two numbers have ever saved.

## Done when

The asset is live, the link is tested, the log entry exists, and the review
date is in the calendar. Then leave it alone until that date.
