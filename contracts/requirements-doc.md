# Contract: Requirements Document

The structured output of requirements elicitation. Every downstream skill depends on this format.

**Producer:** `auto-req`
**Consumers:** `auto-dev`, `auto-test`

## Schema

```yaml
title: string                     # Short name for the requirement set
version: string                   # Semver or date-based
confidence: HIGH | MEDIUM         # LOW blocks — never passed downstream
sponsor: string                   # Who requested this

goals:
  - id: string                    # G-001, G-002, ...
    description: string           # What the user wants to achieve
    acceptance_criteria:           # Each criterion must be testable or demonstrable
      - string

constraints:
  - string                        # Technical, business, regulatory, timeline

non_goals:
  - string                        # Explicitly out of scope

scope_boundary: string            # One paragraph: what is in, what is out

usage_scenarios:                   # Feed directly into auto-test personas
  - id: string                    # S-001, S-002, ...
    persona: string               # novice | power-user | adversarial | custom name
    goal: string                  # What this user is trying to do
    steps:                        # Expected user journey
      - string
    success_condition: string     # How the user knows they succeeded

open_questions:                    # Resolved before passing downstream
  - question: string
    status: resolved | deferred
    resolution: string            # Answer, if resolved
```

## Rules

- A requirements doc with `confidence: LOW` must never be passed to `auto-dev` or `auto-test`.
- Every goal must have at least one acceptance criterion.
- Every acceptance criterion must be verifiable — either by automated test or by observable behavior.
- `usage_scenarios` are optional but strongly recommended. Without them, `auto-test` must infer usage from goals alone.
- `open_questions` with `status: deferred` are acceptable only if they don't block any goal's acceptance criteria.
