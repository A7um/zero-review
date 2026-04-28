# Autoenv Reference

## Skill Contract

This skill is skill-first, not wrapper-first.

Environment setup heuristics and artifact setup both live in [SKILL.md](SKILL.md). There is no required shell wrapper, compiled runtime, or hidden prompt system. Helper scripts may be added later only for deterministic mechanics.

## Run Parameters

Treat these as parameters the agent tracks while following the skill. They do not imply a required CLI entrypoint.

- `--repo <path-or-url>`: local path or GitHub URL. Defaults to `.`
- `--tag <tag-or-ref>`: branch, tag, or ref when using a remote repo
- `--goal "<environment-goal>"`: command, service, or workflow the environment must support
- `--output <path>`: override output directory
- `--env KEY=value`: inject an environment variable. Repeatable
- `--extra-path <path>`: extra local tree made available during setup. Repeatable
- `--setup-base-image <image>`: override the Docker base image when using container setup
- `--timeout <seconds>`: setup time budget
- `--force` or `--rebuild`: ignore cached or existing environment state and configure fresh
- `--mount <src:dst>`: mount a host path into the environment when needed
- `--network <none|bridge|host>`: Docker network policy when using Docker
- `--command <cmd...>`: command to run after setup instead of only recording shell instructions
- `--verbose`: stream setup progress

## Output Contract

The agent should create these files during the run:

- `environment.json`: machine-readable environment status, setup, env vars, commands, artifacts, smoke test, run instructions, and blockers
- `environment.md`: human-readable environment report with setup summary, env vars, run instructions, smoke-test evidence, and blockers
- `artifacts/command-log.txt`: command history with important output

Optional supporting files belong under `artifacts/`.

Status meanings:

- `ready`: requested environment was configured and smoke-tested with evidence
- `partial`: environment is usable for some work, but named limitations remain
- `blocked`: setup could not proceed because prerequisites, credentials, Docker, or key decisions are missing

## Environment Goal Selection

Write goals as run targets, not broad testing requests:

- Good: `Configure the repo so a developer can run the CLI help command`
- Good: `Prepare the web app with Postgres and verify the home page responds`
- Good: `Set up this repo with ../plugin available and record the command to load the plugin`
- Bad: `run all tests`
- Bad: `check app`

If the user asks for end-to-end testing, use Autoenv first only when there is no reliable environment yet. The resulting `runInstructions` should feed the downstream E2E verification step.

## Heuristic Checklist

Use this checklist while following the skill:

- Start with repo docs and obvious config files before source-level scanning.
- Discover env vars from templates, compose files, and docs before targeted source search.
- Pick the minimal viable environment that supports the requested run target.
- Prefer existing Docker/compose setup when it exists and appears current.
- Keep setup artifacts that make the environment reusable.
- Preserve evidence as you go instead of reconstructing it later.
- End with a concrete environment status and exact next commands.

## Integration With Auto-Dev

Use this skill from `auto-dev` when:

- the user wants auto-setup for a runnable environment
- E2E verification needs a real environment and none was provided
- Docker-based or local setup uncertainty is the blocker
- another agent needs a stable command template, workdir, ports, or env-var contract

Downstream verification should consume `environment.json` and `environment.md` rather than rediscovering setup from scratch.

## Maintainer Notes

Useful paths:

- Skill heuristics: `skills/autoenv/SKILL.md`
- Reference contract: `skills/autoenv/reference.md`

If you add helper scripts later, keep them optional and deterministic. Prompt-based reasoning should stay in `SKILL.md` or another markdown reference loaded by the agent.
