# E2E Testing Reference

## Skill Contract

This skill is skill-first, not runtime-first.

Prompt-based testing behavior lives in [SKILL.md](SKILL.md). The script surface under `scripts/` is intentionally limited to deterministic preparation:

- validate basic prerequisites
- normalize inputs
- create the output directory
- scaffold placeholder artifacts
- emit `run-context.json`

## Wrapper Flags

Primary flags:

- `--repo <path-or-url>`: local path or GitHub URL. Defaults to `.`
- `--goal "<goal>"`: concrete verification request. Required
- `--mode <mock|prompt>`: verification strategy. Default `mock`
- `--extra-path <path>`: extra local tree to copy into `/workspace/test-inputs`. Repeatable
- `--output <path>`: override output directory
- `--env KEY=value`: inject an environment variable. Repeatable
- `--timeout <seconds>`: agent time budget for the test run
- `--tag <tag>`: branch or tag when testing a remote GitHub repo
- `--setup-base-image <image>`: override the sandbox base image
- `--verbose`: stream runtime progress

The helper does not execute the verification. It prepares the run context that the agent then uses while following the skill instructions.

## Output Contract

The deterministic helper creates these files up front:

- `run-context.json`: normalized inputs and artifact paths
- `report.json`: placeholder result that must be overwritten by the agent
- `report.md`: placeholder report that must be overwritten by the agent
- `demo.md`: placeholder walkthrough that must be overwritten by the agent
- `artifacts/command-log.txt`: command log file the agent should append to during verification

The agent is responsible for replacing the placeholders with final content.

Final meanings:

- `report.json`: machine-readable status, summary, evidence, artifacts, next steps
- `report.md`: human-readable report with setup steps, commands, assertions, and verdict
- `demo.md`: concise walkthrough of the tested flow
- `artifacts/command-log.txt`: command history with important output

Status meanings:

- `passed`: requested behavior was verified with evidence
- `failed`: environment came up and the requested behavior did not work
- `inconclusive`: verification was blocked by missing prerequisites or ambiguity

## Choosing The Goal

Write goals from the user's perspective:

- Good: `Verify a user can create a project, reopen it, and see the saved config`
- Good: `Verify the plugin loads from ../plugin and registers the slash command`
- Bad: `run regression tests`
- Bad: `check app`

When the feature is UI-driven, explicitly mention the observable flow so the runtime can use browser automation or screenshots when needed.

## Heuristic Checklist

Use this checklist while following the skill:

- Start with repo docs and obvious config files before source-level scanning.
- Pick the minimal viable environment to test the goal.
- In `mock` mode, avoid asking for new credentials and prefer local doubles.
- In `prompt` mode, ask for only the minimal env vars required for this goal.
- Preserve evidence as you go instead of reconstructing it later.
- End with a concrete verdict, not just raw logs.

## Integration With Auto-Dev

Use this skill from `auto-dev`'s `verify` phase when:

- the user wants real E2E evidence
- Docker is available
- a fresh ephemeral environment is acceptable or preferred
- local verification alone would leave too much uncertainty

Prefer a user-provided environment only when the task depends on an existing long-lived system or credentials that should not be recreated in a fresh sandbox.

## Maintainer Notes

Useful paths:

- Deterministic helper: `skills/e2e-testing/scripts/run-e2e.sh`
- Skill heuristics: `skills/e2e-testing/SKILL.md`

If you expand the helper scripts, keep them deterministic. Any new prompt-based reasoning belongs in `SKILL.md` or another markdown reference loaded by the agent.
