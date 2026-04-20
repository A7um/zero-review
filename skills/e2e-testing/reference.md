# E2E Testing Reference

## What This Skill Bundles

This skill vendors the `autoenv` testing runtime under `runtime/autoenv/`.

The important behavior migrated from `autoenv` is:

- fresh Docker sandbox per run
- autonomous agent-driven verification against a concrete goal
- optional companion codebases copied into the sandbox
- optional env-var discovery and prompting for real verification
- structured report artifacts copied back to the host even on failure

The `setup` side of `autoenv` is kept only as implementation detail in the vendored runtime. The intended public entrypoint for `zero-review` is goal-driven testing.

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

Anything after `--` is forwarded to the vendored runtime unchanged.

## Output Contract

The runtime writes these artifacts:

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

## Integration With Auto-Dev

Use this skill from `auto-dev`'s `verify` phase when:

- the user wants real E2E evidence
- Docker is available
- a fresh ephemeral environment is acceptable or preferred
- local verification alone would leave too much uncertainty

Prefer a user-provided environment only when the task depends on an existing long-lived system or credentials that should not be recreated in a fresh sandbox.

## Maintainer Notes

Useful paths:

- Wrapper: `skills/e2e-testing/scripts/run-e2e.sh`
- Binary builder: `skills/e2e-testing/scripts/build-binary.sh`
- Vendored runtime: `skills/e2e-testing/runtime/autoenv/`

To attach a binary for the current platform:

```bash
./skills/e2e-testing/scripts/build-binary.sh
```

The wrapper auto-detects `darwin-arm64`, `darwin-x64`, `linux-arm64`, and `linux-x64` binaries named `autoenv-<platform>`.
