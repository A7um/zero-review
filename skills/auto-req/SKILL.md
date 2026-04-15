---
name: auto-req
version: 1.1
description: Requirements elicitation skill. Turns vague human intent into structured, actionable specifications that downstream skills can consume.
author: system
requires: []
---

# Auto-Req Skill

> **WHEN TO USE:** You have raw human input (conversation, issue, brief, vague request) and need to produce a structured requirements document before development or testing can begin.

## Elicitation Philosophy

**Understand what people mean, not just what they say. Clarity comes from asking, not assuming.**

① **Capture intent, not words** — The sponsor's phrasing is a starting point, not a spec. Your job is to extract the underlying goal. "Make the dashboard faster" might mean "reduce load time," "simplify the layout," or "remove features I don't use." Ask which.

② **Separate problem from solution** — Requirements describe *what* and *why*, never *how*. If the sponsor says "add a Redis cache," the requirement is "reduce API response time below 200ms." The implementation choice belongs to the dev agent.

③ **Every requirement must be verifiable** — If you can't describe how to check whether a requirement is met, it isn't a requirement yet. "Improve UX" fails. "User can complete checkout in under 3 clicks" passes.

④ **Silence is ambiguity** — What the sponsor *didn't* say matters as much as what they did. Missing constraints, unmentioned users, omitted error cases — these are gaps, not implicit "don't cares." Surface them.

⑤ **Done means actionable** — A requirements doc is complete when a dev agent can read it and begin work without asking for clarification. Not when every conceivable detail is specified — when every *necessary* detail is.

## Strategy Selection

| Starting material | Strategy |
|---|---|
| Vague or conversational request, sponsor available for back-and-forth | `strategies/elicit-from-vague.md` |
| Vague or conversational request, prefer minimal interaction | `strategies/propose-from-assumptions.md` |
| Existing written spec, PRD, or detailed description that needs sharpening | `strategies/refine-existing.md` |
| GitHub issue, bug report, or user feedback that needs requirements extraction | `strategies/extract-from-issue.md` |

Read the selected strategy when starting work.

### When the strategy is ambiguous

If the input clearly fits one row in the table, select it and proceed. If it's ambiguous — typically vague input where either `elicit-from-vague` or `propose-from-assumptions` could work — **ask the sponsor to choose**. Present the viable strategies with a one-line description:

> I can approach this two ways:
>
> **A. Propose from assumptions** — I'll analyze your request, identify what's uncertain, and generate several complete requirement proposals for you to pick from. Lower effort on your side.
>
> **B. Elicit through questions** — I'll ask you targeted questions to build the spec interactively. Best if you have strong opinions about the details.
>
> Which do you prefer?

Only ask when the choice genuinely matters. If one strategy is clearly better for the input, just use it.

## Community Research (--research)

When the `--research` flag is passed with the command, research the broader open-source community for similar features, common complaints, real-world edge cases, and established patterns before structuring requirements. This grounds the requirements in how real users across many projects experience the problem — not just what the sponsor thought to mention.

**What to research:**
- How other projects implemented similar features — what worked, what users complained about
- Common edge cases and failure modes that real users surfaced
- Acceptance criteria that real users cared about (accessibility, performance thresholds, platform quirks)
- Non-obvious scope boundaries that projects learned the hard way

**Tools:** Use the best available tools — web search, browsing, or any accessible data source. If the user specifies a particular tool for community access (e.g. a CLI, an API, a search service), use that tool and follow the user's setup instructions. Otherwise, choose the most effective tool available to you on your own.

**How to apply findings:** Community research enriches — it doesn't override. Findings inform better goals, surface edge cases the sponsor didn't mention, and produce more realistic acceptance criteria. Always attribute community-sourced insights in the requirements doc (e.g. "common complaint in similar implementations: ..."). Do not silently inflate scope — if research suggests additional goals beyond what the sponsor asked for, present them as recommendations, clearly separated from the sponsor's original intent.

This step is available to any strategy. It is most valuable with `propose-from-assumptions` (where it sharpens the assumption space) and `refine-existing` (where it validates the spec against real-world expectations).

## Confidence Assessment

After structuring requirements, assess confidence:

| Level | Criteria | Action |
|---|---|---|
| **HIGH** | All goals have acceptance criteria. No open questions. Scope boundary is clear. | Pass downstream. |
| **MEDIUM** | Goals are clear but some acceptance criteria are soft. Minor open questions deferred. | Pass downstream with caveats noted. |
| **LOW** | Goals are ambiguous, acceptance criteria are missing, or scope is undefined. | **Block.** Escalate to sponsor with specific questions. Do not pass downstream. |

## What Requirements Agents Get Wrong

- **Solution leakage** — Embedding implementation decisions ("use Redis," "add a modal dialog") in what should be a problem statement. Requirements describe outcomes, not mechanisms.

- **Gold-plating** — Adding requirements the sponsor didn't ask for because they seem useful. If the sponsor said "login," don't add "password recovery, 2FA, and social login" unless they asked.

- **Ambiguity avoidance** — Marking confidence as HIGH to skip the discomfort of going back to the sponsor with questions. LOW confidence is not a failure — it's the correct call when information is missing.

- **Sponsor parroting** — Copying the sponsor's words verbatim without extracting structure. "I want users to have a good experience" restated as a requirement is useless. Translate into specifics.

- **Scope creep through scenarios** — Writing usage scenarios that imply features not in the goals. Scenarios illustrate goals, they don't expand them.

## Output

The final output follows `contracts/requirements-doc.md`. Every field in that contract must be addressed — populated or explicitly noted as not applicable.

## References

| Resource | When to Load |
|---|---|
| `strategies/elicit-from-vague.md` | Vague input, interactive sponsor |
| `strategies/propose-from-assumptions.md` | Vague input, minimal interaction preferred |
| `strategies/refine-existing.md` | Existing spec needs sharpening |
| `strategies/extract-from-issue.md` | Issue or feedback needs requirements extraction |
| `templates/requirements-doc.md` | When structuring final output |
| `templates/usage-scenarios.md` | When writing scenarios for auto-test consumption |
| `contracts/requirements-doc.md` | For the authoritative output schema |
| `USER.md` (project root) | Always — understand who you're eliciting from |
