# Template: Work Item

Use this structure when dispatching work to dev agents. The work item must be self-contained.

---

```markdown
# Work Item: [WI-XXX] [Action-oriented title]

**Type:** [bugfix | enhancement | addition | greenfield]
**Paradigm:** [bugfix/hypothesis-driven | enhancement/delta-design | addition/lightweight | dev/architecture-first]
**Priority:** [P0 | P1 | P2 | P3]
**Priority rationale:** [One sentence]
**Source issues:** [BUG-001, FEAT-002, ...]

## Description

[Enough context for a dev agent to understand the problem and begin work. Include relevant user reports, observed behavior, and business context. Do not assume the dev agent has read the original issues.]

## Acceptance Criteria

- [ ] [Verifiable criterion 1]
- [ ] [Verifiable criterion 2]
- [ ] [Criterion addressing the root cause, not just the symptom]

## Relevant Context

**Files likely involved:** [best guess, if known]
**Related work items:** [dependencies or conflicts]
**Sponsor input:** [any specific guidance from the human sponsor]

## Escalation Notes

[Why this was escalated, if it was. Empty if standard triage.]
```
