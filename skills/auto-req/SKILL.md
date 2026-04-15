---
name: auto-req
version: 1.0
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
| Vague or conversational request ("make it better", "I need a feature for X") | `strategies/elicit-from-vague.md` |
| Existing written spec, PRD, or detailed description that needs sharpening | `strategies/refine-existing.md` |
| GitHub issue, bug report, or user feedback that needs requirements extraction | `strategies/extract-from-issue.md` |

Read the selected strategy when starting work. If the starting material doesn't fit any category, default to `elicit-from-vague`.

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
| `strategies/{strategy}.md` | After determining starting material type |
| `templates/requirements-doc.md` | When structuring final output |
| `templates/usage-scenarios.md` | When writing scenarios for auto-test consumption |
| `contracts/requirements-doc.md` | For the authoritative output schema |
| `USER.md` (project root) | Always — understand who you're eliciting from |
