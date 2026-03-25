---
id: diagnose
name: Bug Diagnosis
inputs: [validated requirements (bug report), reproduction steps if available]
outputs: [diagnosis doc with hypotheses tested, root cause, proposed fix, affected files, risk]
optional: false
---

# Phase: Bug Diagnosis

## Purpose

Identify the root cause of a defect through structured, hypothesis-driven debugging. No guessing — every investigation step starts with an explicit hypothesis and ends with evidence.

## Process

### Step 1 — Hypothesize

Based on the bug report and reproduction steps, estimate where the problem likely originates. Form a specific, testable hypothesis before touching code.

**Good hypothesis:** "The session token is not refreshed after password change, so old tokens remain valid."
**Bad hypothesis:** "Something is wrong with auth."

### Step 2 — Verify

Test the hypothesis. Read the suspected code, add logging, or run a targeted test. Confirm or refute with evidence.

- If confirmed → proceed to Step 5
- If refuted → proceed to Step 3

### Step 3 — Build Observability

If the hypothesis is wrong and no further clues exist, add instrumentation (logs, debug output, tracing) to gather data for new hypotheses. Do not guess blindly.

### Step 4 — Iterate

Repeat hypothesize → verify until root cause is found. Distinguish:
- **Proximate cause** — this line is wrong
- **Root cause** — the data model doesn't account for this case

### Step 5 — Propose Fix

Describe the minimal change that fixes the root cause. List affected files, assess regression risk.

**Escalation:** If the fix requires 3+ module changes or interface changes → escalate to `enhancement/delta-design` paradigm.

## Efficiency Rules

- If a test involves slow steps (builds, network calls, large data), stub them with dummy returns to speed up the feedback loop.
- If you catch yourself doing aimless testing with no clear hypothesis, **stop immediately** and think. Formulate an explicit hypothesis before running the next test.

## Output Format

Write diagnosis to: `{output_root}/designs/diagnosis_{YYYYMMDD}_{slug}.md`

**Required sections:**
1. Bug summary (one paragraph)
2. Hypotheses tested (for each: hypothesis, evidence, result)
3. Root cause (with evidence)
4. Proposed fix (minimal change description)
5. Affected files
6. Regression risk assessment

## Outputs
- `{output_root}/designs/diagnosis_{YYYYMMDD}_{slug}.md`

## Quality Gate
- Root cause identified with evidence (not just a guess)
- Fix scoped to minimal change
- Regression risk assessed
- Affected files listed
- Proximate vs root cause distinction is clear

## Skip Conditions
This phase is never skipped in the `bugfix/hypothesis-driven` paradigm.
