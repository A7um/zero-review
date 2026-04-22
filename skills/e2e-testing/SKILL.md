---
name: e2e-testing
description: Run sandboxed end-to-end verification for a repository in Docker using an autonomous testing agent that installs minimal dependencies, can include extra local codebases, and always writes structured evidence artifacts. Use when the user asks to verify a workflow end to end, test a repo from scratch, validate integration behavior, or produce evidence-backed E2E reports.
---

# E2E Testing

Use this skill when you need fresh-environment, evidence-backed verification of a concrete user-facing goal. The skill owns both the testing heuristics and the artifact scaffolding.

## Operating Rules

1. Start from the user-visible goal, not from the repo's test suite. Rewrite vague asks into a concrete verification target before you run anything.
2. Read the primary repo's README, package manifest, compose files, and obvious build entrypoints first. Inspect extra codebases only when the goal depends on them.
3. Prefer the minimal setup path that can actually verify the goal. Do not over-provision the sandbox.
4. Never claim success without concrete evidence from commands, logs, HTTP responses, screenshots, or artifacts.
5. Always leave behind final `report.md`, `report.json`, `demo.md`, and `artifacts/command-log.txt` in the output directory you create for the run.

## Verification Heuristics

### Environment Strategy

- Use a fresh Docker sandbox when repo-level isolation is practical.
- Prefer lightweight local dev or test startup paths over production deployment paths.
- Use browser automation or screenshots for UI flows when the goal depends on rendered behavior.
- If Dockerized dependencies are the simplest route, use them, but keep the setup narrow and document what you started.

### Mock vs Prompt

- `mock` means do not assume the user will provide new secrets. Prefer local fakes, fixtures, stubs, test config, or temporary wiring that stays narrowly scoped to verification.
- `prompt` means identify the minimal set of env vars needed for the specific goal, ask for only those, and prefer the real path once they are supplied.
- If the real path is required but the minimal env set is still missing, stop with `inconclusive` and name the exact blocker.
- If you use mocks in `mock` mode, document every verification-specific change in the report.

### Environment Variable Discovery

- Be fast and targeted. Do not exhaustively grep the whole repo first.
- Check `.env.example`, `.env.sample`, `.env.local.example`, `docker-compose.yml`, README setup sections, and the main config entrypoints.
- Only scan source files when those obvious surfaces are insufficient.
- In `prompt` mode, ask for the minimum env vars needed for this goal, not every env var in the repo.

### Evidence Standard

- Log the commands you ran and the important output in `artifacts/command-log.txt`.
- `report.md` should explain setup, assertions, evidence, and verdict.
- `report.json` should contain machine-readable status, summary, evidence, artifacts, and next steps.
- `demo.md` should be a concise walkthrough of the verified flow.

## Workflow

1. Confirm the goal is concrete and user-facing.
2. Choose `mock` or `prompt` based on whether real credentials are essential.
3. Create an output directory for the run, usually `.dev-output/e2e/<repo>-<timestamp>/`.
4. Create these files yourself before or during verification:
   - `report.md`
   - `report.json`
   - `demo.md`
   - `artifacts/command-log.txt`
5. Perform the verification yourself in a fresh Docker sandbox, following the heuristics above.
6. Fill those artifacts with the final evidence-backed results.
7. Summarize the verdict from those artifacts.

Default conventions:

- repo `.` means the current workspace
- `mock` means avoid new credentials unless they are already available
- output should usually go under `.dev-output/e2e/<repo>-<timestamp>/`
- artifact paths should be chosen deterministically and then used consistently throughout the run

Good goal: `"Verify the settings page saves theme changes"`
Bad goal: `"run tests"`

## Commands

Use the current workspace:

```bash
repo="."
goal="Verify the CLI prints help"
output=".dev-output/e2e/$(basename "$PWD")-$(date +%Y%m%d-%H%M%S)"
```

Use extra local code:

```bash
repo="."
extra_paths=(../plugin)
goal="Verify the plugin loads and registers commands"
```

Use minimal env-var prompting:

```bash
repo="."
mode="prompt"
goal="Verify OAuth login completes against the real provider"
```

## Artifacts

Every completed verification should leave:

- `report.md`
- `report.json`
- `demo.md`
- `artifacts/command-log.txt`

Use these as the source of truth for pass/fail status, blockers, and evidence.

## Execution Notes

- There is no required wrapper script.
- The agent should create the output directory and artifact files directly.
- Required host tooling: Docker.

## More Detail

See [reference.md](reference.md) for flags, output contract, and maintainer notes.
