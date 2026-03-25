---
id: validate-requirements
name: Validate Requirements
inputs: [requirements doc or task description]
outputs: [validated requirements with confidence level]
optional: false
---

# Phase: Validate Requirements

## Purpose
Ensure requirements are clear and actionable before any design or implementation work begins. Unclear requirements are blockers, not creative challenges.

## Process

1. **Read the requirements** from PM doc or task description
2. **Check confidence level:** HIGH / MEDIUM / LOW
3. **Look for open questions** flagged in the doc
4. **Verify understanding:** inputs, outputs, constraints, success criteria
5. **Check experience first:** Review your agent's memory or pattern files for prior patterns relevant to this task

**If confidence is LOW or open questions exist:**
Stop. Escalate to your coordinator: "Need PM clarification on [specific questions] before proceeding."

This is not a failure — it's the right call.

## Principles

- `principles/naming-obviousness.md` — Requirements should use precise language
- `principles/strategic-design.md` — Investment mindset starts at requirements

## Outputs
- Validated requirements with confidence level (HIGH / MEDIUM)
- List of any clarification requests sent to coordinator

## Quality Gate
- Confidence is MEDIUM or HIGH
- No unresolved open questions
- Inputs, outputs, constraints, and success criteria are understood

## Skip Conditions
This phase is never skipped.
