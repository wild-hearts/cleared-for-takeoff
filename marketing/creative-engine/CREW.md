# The crew

**Updated 2 September 2026.** Who runs which stage of the engine, and what each of them
is and is not allowed to do. The SOPs say *how* the work is done. This file says *who*
does it and *where their authority stops*.

One person (Naomi) and an AI crew. The crew does the work; the person holds the pen on
anything that cannot be taken back.

## Roster

| Role | Who | Remit |
|---|---|---|
| Publisher, and the only signature that counts | Naomi | Approves concepts, writes QA verdicts, publishes, owns every claim |
| Head of Marketing | **Polly** (`.claude/agents/polly.md`) | Runs the flywheel end to end and builds what it calls for, including all video |

Polly is an agent definition living in this repository. She is invoked from Claude Code
in a session on this repo (`Polly, ...`), or by name in Cowork once the repo is attached.
The eight `wh-*` video skills she runs on are also loaded account-wide, so the video work
is available outside the repo; the marketing remit is not, because it lives here.

## Who does what, per stage

| Stage | SOP | Polly | Naomi |
|---|---|---|---|
| 1 Research | `sops/01-research.md` | Gathers verbatims, one file per source; keeps the product vault current | Approves additions to product facts |
| 2 Ideation | `sops/02-ideation.md` | Runs the chain, produces concept cards | **Approves the concept** |
| 3 Briefing | `sops/03-briefing.md` | Writes one brief per approved concept | Signs off |
| 4 Production | `sops/04-production.md` | Builds every deliverable to spec, named per SOP 06 | - |
| 5 QA | `sops/05-ad-qa.md` | Runs the checklist, writes a **proposed** verdict with evidence | **Writes the verdict in `qa-log.md`** |
| 6 Launch | `sops/07-launch.md` | Builds the launch package, tests the UTMs, records the hypothesis | **Publishes** |
| 7 Analysis | `sops/08-analysis.md` | Pulls the numbers at the window, answers the hypothesis, memorialises | Approves findings back into Research |

## Where Polly's authority stops

Six limits. They are the controls that make the engine trustworthy, and routing around
them quietly is worse than not having an agent at all.

1. **She never clears her own work.** She may run the SOP 05 checklist and propose a
   verdict with her reasoning. The word CLEARED in `qa-log.md` is Naomi's. Produce and
   self-approve in one motion and the control has evaporated.
2. **She never launches.** She prepares; Naomi presses publish. Per SOP 04: "Production
   never launches anything directly, including, and especially, when it is confident."
3. **She never invents a claim.** Every factual statement traces to
   `research/product-facts.md`, current version.
4. **She never advertises what does not exist.** The ⚠ items in the product facts file
   are hard blocks. Kids and Teens is waitlist-only.
5. **She never invents a customer.** Every anchor is a verbatim from
   `research/customer-voice/`, or traceable to one.
6. **She never skips a stage**, including at 11pm, and especially at 11pm.

## Why the separation exists

The QA gate and the launch gate are the same control appearing twice: the thing that made
the asset does not get to decide the asset is fine. That holds whether the maker is an
agent, a freelancer, or Naomi at midnight with a deadline. SOP 05 protects the brand and
occasionally the company from the ACCC; a gate that the producer can open from the inside
is a door.

Everything upstream of QA is delegable, and Polly should be trusted with it - research,
ideation, briefing, production, and the whole of video craft. The two gates are not.

## Not yet on the crew

Naomi has supplied faces for two further crew members, **Petal** and **Marlow**
(`crew/portraits/`). Neither has a role, an agent definition, or a row in the roster
above, so neither is on the crew yet. Faces are not remits.

See [crew/README.md](crew/README.md) for what is outstanding, including a naming check
worth doing before anyone relies on the filenames.

## Adding to the crew

A new role gets: a row in the roster, a column in the stage table, and its authority
limits written down before it runs anything. An agent with an unclear remit will find one.
