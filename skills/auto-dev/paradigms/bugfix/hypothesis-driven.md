---
name: hypothesis-driven
description: Hypothesis-driven debugging workflow for defects and regressions.
best_for: [bugs, defects, regressions, incorrect behavior]
avoid_when: [feature additions, greenfield development, enhancements]
composable_with: []
---

# Hypothesis-Driven

Bugfix paradigm built on structured, hypothesis-driven diagnosis. Every investigation step starts with an explicit hypothesis and ends with evidence. No test-plan phase — the diagnosis doc defines correctness criteria.

## When to Use

- Defect, regression, or incorrect behavior
- Bug report with (ideally) reproduction steps
- Behavior that used to work and no longer does

## Phase Sequence

1. [validate-requirements](../../phases/validate-requirements.md) *(requirements = bug report; confidence = can I reproduce?)*
2. [diagnose](../../phases/diagnose.md)
3. [implement](../../phases/implement.md) *(receives diagnosis doc; fix is minimal/surgical; agent adds regression test)*
4. [code-review](../../phases/code-review.md)
5. [verify](../../phases/verify.md) *(must include: reproduce-then-fix confirmed + existing tests pass)*
6. [deliver](../../phases/deliver.md)

## Phase Overrides

### validate-requirements
- Requirements = bug report
- Confidence = can I reproduce the bug?
- If cannot reproduce → ask for more information before proceeding

### implement
- Receives diagnosis doc (not arch doc or impact doc)
- Fix must be minimal and surgical — address root cause, don't refactor surroundings
- Agent must add a regression test that would have caught this bug

### verify
- Must confirm: bug is reproduced with old code, fixed with new code
- All existing tests must still pass
- Regression test added during implementation must pass
