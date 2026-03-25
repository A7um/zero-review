---
id: deliver
name: Deliver
inputs: [verified implementation, test results]
outputs: [delivery report to caller/coordinator]
optional: false
---

# Phase: Deliver

## Purpose
Report completed work to the caller or coordinator with structured output. Agents should use their own communication channel (e.g., inter-agent messaging, direct response, task system).

## Process

Produce a delivery report containing:
- File paths of what was built
- What was tested and how (including which Must Haves were verified)
- Any deviations from original requirements
- Any follow-up work needed

**Delivery report structure:**
```
[COMPLETE] Brief description

Files:
- path/to/file1
- path/to/file2

Test results:
- Must Have 1: PASS
- Must Have 2: PASS

Deviations: (none | list)
Follow-up: (none | list)
```

## Principles

- `principles/documentation.md` — Delivery reports should be precise and complete

## Outputs
- Delivery report with file paths, test results, and any deviations

## Quality Gate
- Report sent to caller/coordinator
- All file paths are included
- Test results are documented
- Deviations from requirements are noted

## Skip Conditions
This phase is never skipped.
