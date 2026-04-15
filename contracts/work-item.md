# Contract: Work Item

A triaged, prioritized unit of work ready for a dev agent to pick up.

**Producer:** `auto-triage`
**Consumer:** `auto-dev`

## Schema

```yaml
id: string                        # WI-001, WI-002, ...
source_issue_ids: [string]        # One or more issues this addresses (may be merged duplicates)
type: bugfix | enhancement | addition | greenfield
paradigm: string                  # bugfix/hypothesis-driven | enhancement/delta-design | addition/lightweight | dev/architecture-first

priority: P0 | P1 | P2 | P3
  # P0: production broken, immediate
  # P1: significant user impact, next cycle
  # P2: real but non-urgent, scheduled
  # P3: nice to have, backlog

title: string                     # Action-oriented: "Fix blank page after login" not "BUG-003"
description: string               # Enough context for a dev agent to start without reading the full issue history

acceptance_criteria:
  - string                        # Inherited from requirements or derived from issue

relevant_context:                 # Curated — not a dump of everything
  files_likely_involved: [string] # Best guess from triage analysis
  related_work_items: [string]    # Dependencies or conflicts
  sponsor_input: string           # Any human guidance specific to this item

escalation_notes: string          # Why this was escalated, if it was. Empty otherwise.
```

## Rules

- A work item must be **self-contained**: a dev agent should be able to load the paradigm, read this document, and start working without needing to separately read the original issue or requirements doc.
- `source_issue_ids` preserves traceability. Never discard the link to the original report.
- `type` determines `paradigm`. The mapping follows auto-dev's classification table.
- `acceptance_criteria` must be verifiable. If the original issue didn't have clear criteria, triage must synthesize them or escalate.
- `files_likely_involved` is best-effort. Dev agents verify independently during their analysis phase.
