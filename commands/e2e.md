---
description: "Run sandboxed end-to-end verification for the current repo or a specified repo using the bundled E2E skill"
argument-hint: <goal description>
---

# Sandboxed E2E Verification

You are executing the bundled E2E testing skill.

## User Request

$ARGUMENTS

## Steps

1. Read `${CLAUDE_PLUGIN_ROOT}/skills/e2e-testing/SKILL.md`.
2. If the user did not explicitly name another repo path or URL, use the current workspace as repo `.`.
3. Create an output directory for the run, usually under `.dev-output/e2e/`.
4. Create `report.md`, `report.json`, `demo.md`, and `artifacts/command-log.txt` in that directory.
5. Perform the verification yourself in a fresh Docker sandbox, following the heuristics in `SKILL.md`.
6. Fill those artifact files with the final evidence and verdict.
7. Return the final verdict, evidence summary, output path, and any blockers.

## Rules

- Keep the goal concrete and user-facing.
- If the user already gave a repo path or GitHub URL, pass it through with `--repo`.
- If Docker prerequisites are missing, report that clearly instead of improvising.
