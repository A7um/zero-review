# Template: Requirements Document

Use this structure for the final output. Every section must be addressed — populate or explicitly mark as N/A.

---

```markdown
# Requirements: [Title]

**Version:** [semver or date]
**Confidence:** [HIGH | MEDIUM]
**Sponsor:** [name or reference]
**Source:** [direct request | refined from existing doc | extracted from issue #X]

## Goals

### G-001: [Goal title]
[One paragraph describing what should be true when this goal is met.]

**Acceptance criteria:**
- [ ] [Verifiable criterion 1]
- [ ] [Verifiable criterion 2]

### G-002: [Goal title]
...

## Constraints
- [Technical, business, regulatory, or timeline constraints]

## Non-Goals
- [Explicitly out of scope — things that might seem related but are not part of this work]

## Scope Boundary
[One paragraph: what is in, what is out. Written so a dev agent can make scoping calls without asking.]

## Usage Scenarios

### S-001: [Scenario title]
- **Persona:** [novice | power-user | adversarial | custom]
- **Goal:** [What this user is trying to accomplish]
- **Steps:**
  1. [Step 1]
  2. [Step 2]
  3. ...
- **Success condition:** [How the user knows they succeeded]

## Open Questions

| Question | Status | Resolution |
|---|---|---|
| [Question text] | resolved / deferred | [Answer or rationale for deferral] |
```
