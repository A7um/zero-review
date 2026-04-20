---
name: e2e-testing
description: Run sandboxed end-to-end verification for a repository in Docker using an autonomous testing agent that installs minimal dependencies, can include extra local codebases, and always writes structured evidence artifacts. Use when the user asks to verify a workflow end to end, test a repo from scratch, validate integration behavior, or produce evidence-backed E2E reports.
---

# E2E Testing

## Quick Start

Use the wrapper in this skill instead of calling the vendored runtime directly:

```bash
${CLAUDE_PLUGIN_ROOT}/skills/e2e-testing/scripts/run-e2e.sh --repo . --goal "Verify the login flow works"
```

Default behavior:

- `--repo .` tests the current workspace
- `--mode mock` prefers self-contained verification without external credentials
- output goes to `.dev-output/e2e/<repo>-<timestamp>/`

## Workflow

1. Confirm the goal is concrete and user-facing. Good: `"Verify the settings page saves theme changes"`. Bad: `"run tests"`.
2. Prefer the current workspace unless the user explicitly names another repo path or GitHub URL.
3. Use `--mode prompt` only when real credentials are likely required and the user wants the runtime to ask for the minimal env vars.
4. Add `--extra-path <path>` for companion repos, plugins, fixtures, or local integrations that should be copied into the sandbox under `/workspace/test-inputs`.
5. After the run, read `report.md` and `report.json` from the output directory and summarize the verdict with evidence.

## Commands

Current workspace:

```bash
${CLAUDE_PLUGIN_ROOT}/skills/e2e-testing/scripts/run-e2e.sh --repo . --goal "Verify the CLI prints help"
```

Current workspace plus extra local code:

```bash
${CLAUDE_PLUGIN_ROOT}/skills/e2e-testing/scripts/run-e2e.sh \
  --repo . \
  --extra-path ../plugin \
  --goal "Verify the plugin loads and registers commands"
```

Real verification with env prompting:

```bash
${CLAUDE_PLUGIN_ROOT}/skills/e2e-testing/scripts/run-e2e.sh \
  --repo . \
  --mode prompt \
  --goal "Verify OAuth login completes against the real provider"
```

## Artifacts

Every successful invocation should leave:

- `report.md`
- `report.json`
- `demo.md`
- `artifacts/command-log.txt`

Use these as the source of truth for pass/fail status, blockers, and evidence.

## Runtime Notes

- The wrapper prefers a compiled binary in `bin/` when present.
- Otherwise it boots the vendored Bun runtime in `runtime/autoenv/` and runs `bun install` on first use.
- Required host tooling: Docker. Bun is only required when no compiled binary is bundled.

## More Detail

See [reference.md](reference.md) for flags, output contract, and maintainer notes.
