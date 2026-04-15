---
name: auto-triage
version: 1.0
description: Issue intake and prioritization skill. Classifies, deduplicates, and dispatches work items from raw issues.
author: system
requires: []
---

# Auto-Triage Skill

> **WHEN TO USE:** You have incoming issues (from user agents, GitHub, or any external source) that need to be classified, deduplicated, prioritized, and turned into actionable work items for dev agents.

## Triage Philosophy

**Every issue deserves classification. Not every issue deserves action. Your job is to tell the difference.**

① **Intake first, react later** — Read all pending issues before acting on any one of them. Batch processing reveals duplicates and patterns that one-at-a-time processing misses.

② **Classify by impact, not by reporter** — A novice user's confused bug report may describe a critical usability failure. A power user's detailed feature request may be low priority. Assess the issue, not the source.

③ **Duplicates are the silent killer** — Two issues about the same root cause dispatched to two dev agents means double the work and potential conflicts. Deduplication is not optional housekeeping — it's a core function.

④ **Prioritize transparently** — Every priority assignment must have a stated rationale. "P1 because it blocks checkout for all users" is useful. "P1" alone is not. The sponsor and dev agents need to understand *why*, not just *what*.

⑤ **Dispatch self-contained work** — A dev agent receiving a work item should be able to start immediately. If they need to read five other issues to understand context, the work item is incomplete.

## Workflow

1. **Intake** — Normalize incoming issues to `contracts/issue.md` format (if not already)
2. **Deduplicate** — Group issues by likely root cause (see `rules/deduplication.md`)
3. **Classify** — Map each unique issue to a type and paradigm (see `rules/classification.md`)
4. **Prioritize** — Assign priority with rationale (see `rules/prioritization.md`)
5. **Dispatch** — Produce work items following `contracts/work-item.md`

Steps 2-4 may interleave — discovering a duplicate during classification is normal.

## What Triage Agents Get Wrong

- **Triage as implementation** — Starting to debug or fix the issue while triaging it. You're a dispatcher, not a developer. Classify and move on.

- **Priority by recency** — Newest issue gets highest priority regardless of impact. A week-old P1 still outranks today's P3.

- **Over-classification** — Spending more time categorizing an issue than it would take to fix it. If an issue is trivial and clear, classify quickly and dispatch.

- **Sponsor bypass** — Making business priority calls that should be escalated. Technical severity (how broken is it) is your domain. Business priority (how much do we care) involves the sponsor for anything P0 or P1.

- **Report embellishment** — Rewriting or "improving" the original issue. Preserve the reporter's voice and observations. Add classification metadata, don't edit the report itself.

## References

| Resource | When to Load |
|---|---|
| `rules/classification.md` | During classify step |
| `rules/prioritization.md` | During prioritize step |
| `rules/deduplication.md` | During deduplicate step |
| `templates/work-item.md` | When structuring dispatch output |
| `contracts/issue.md` | For input format reference |
| `contracts/work-item.md` | For output format reference |
