---
name: autoenv
description: Configure runnable development environments for repositories using repo inspection, targeted environment-variable discovery, Docker or local setup, and smoke-test evidence. Use this skill whenever the user asks to set up a repo, make a project runnable, configure environment variables, prepare a Docker/dev environment, create a shell/run contract for another agent, or unblock downstream E2E verification.
---

# Autoenv

Use this skill when you need to turn a repository into a usable development or verification environment. The primary output is an environment contract that tells a human or downstream agent how to run commands in the configured environment. Smoke testing is required evidence that the environment works, but end-to-end product testing is a downstream consumer of this skill rather than the skill's core job.

## Operating Rules

1. Start from the environment goal: what command, service, CLI, or workflow needs to run after setup.
2. Read obvious setup surfaces before guessing: README, package manifests, lockfiles, Makefiles, language build files, Dockerfiles, compose files, and env templates.
3. Discover environment variables quickly and narrowly. Prefer authoritative templates and docs over broad source greps.
4. Prefer the minimal reproducible setup that leaves the repo usable for follow-up development. Do not over-provision services or delete build artifacts.
5. Use Docker when isolation, reproducibility, or dependency setup matters. Use an existing user-provided environment when the user already gave one.
6. Never claim the environment is ready without concrete smoke-test evidence from commands, logs, HTTP responses, screenshots, or generated artifacts.
7. Always leave behind `environment.md`, `environment.json`, and `artifacts/command-log.txt` in the output directory you create for the run.

## Workflow

1. Resolve the target repository. Default `repo` to the current workspace when no path or URL is named.
2. Create an output directory, usually `.dev-output/autoenv/<repo>-<timestamp>/`, with an `artifacts/` subdirectory.
3. Inspect setup surfaces in this order:
   - README or setup docs
   - `.env.example`, `.env.sample`, `.env.template`, or similar
   - `docker-compose.yml`, `compose.yml`, Dockerfiles, devcontainer files
   - package/build manifests such as `package.json`, `pyproject.toml`, `requirements.txt`, `Cargo.toml`, `go.mod`, `Makefile`, or `justfile`
   - targeted source/config search only when the above are insufficient
4. Build an env-var inventory:
   - Include required and optional variables that affect startup, external services, auth, providers, databases, or cloud resources.
   - Exclude ordinary runtime/tooling variables such as `PATH`, `HOME`, `TERM`, `CI`, `DEBUG`, `NODE_ENV`, and test-only variables unless the project explicitly requires them for startup.
   - If a required secret is missing, record it as a blocker or ask only for the minimal set needed for the requested environment goal.
5. Choose the setup strategy:
   - Existing Dockerfile or compose stack when it already models the app.
   - Minimal base container when the repo has no usable Docker setup but isolation is valuable.
   - Existing local shell only when the user requested local setup or the current host environment is the intended environment.
6. Configure the environment:
   - Install only needed system packages, language runtimes, and project dependencies.
   - Build or prepare the project enough for development and smoke testing.
   - Keep source, `.git`, dependency caches, and build artifacts that make the environment useful.
7. Define the run contract:
   - Record workdir, command template, env vars, ports, services, and how to open a shell.
   - If a Docker container or image was created, record its name and the exact `docker exec` or `docker run` command to reuse it.
   - If the project has a natural entrypoint, record the command that forwards user args to it.
8. Smoke-test the environment using the smallest command that proves it works, such as CLI `--help`, build/test startup, HTTP health check, or page load.
9. Fill the environment artifacts and summarize the readiness status from those artifacts.

## Environment Artifacts

Every completed Autoenv run should leave:

- `environment.md`
- `environment.json`
- `artifacts/command-log.txt`

Optional artifacts such as screenshots, server logs, compose logs, or generated outputs should go under `artifacts/` when they materially support the smoke-test result.

### `environment.md`

Use this structure:

```markdown
# Environment Report

Status: ready | partial | blocked
Repo: <path-or-url>
Goal: <environment goal>

## Summary
<short setup result>

## Setup
<commands, services, dependencies, images/containers, and workdir>

## Environment Variables
<required and optional variables, with missing values called out>

## Run Instructions
<shell command, exec command, service start command, ports, and entrypoint>

## Smoke Test
<command/evidence and result>

## Blockers
<missing prerequisites, credentials, ambiguity, or none>
```

### `environment.json`

Create a machine-readable object with these top-level fields:

- `status`: `ready`, `partial`, or `blocked`
- `repo`: path or URL plus any tag/ref used
- `environment`: setup strategy, workdir, services, image/container names, ports, and base image when relevant
- `envVars`: required, optional, supplied, and missing variables
- `commands`: setup commands, run commands, shell commands, and smoke-test commands
- `artifacts`: paths to logs, screenshots, or other evidence
- `smokeTest`: command, result, and evidence summary
- `runInstructions`: exact commands a human or downstream agent should use next
- `blockers`: unresolved prerequisites or limitations

Status meanings:

- `ready`: environment configured and smoke-tested.
- `partial`: environment mostly configured but named limitations remain.
- `blocked`: setup could not proceed because prerequisites, credentials, Docker, or key decisions are missing.

## Environment Variable Discovery

Be fast and targeted:

1. Parse env template files first. They are usually the source of truth.
2. Check compose files and deployment/dev config for `${VAR_NAME}` patterns.
3. Read setup docs for variables tied to the requested run target.
4. Use one or two targeted source searches only as a fallback.

In prompt-sensitive cases, ask for only the variables needed for the requested environment goal. Prefer local fakes or optional-service omission when that still yields a useful dev environment.

## Docker Guidance

For Docker-based setup:

- Prefer project-provided Dockerfiles and compose files when they are current.
- Use a minimal base image override only when the repo requires a specific runtime.
- Start only services needed by the requested run target.
- Keep networking narrow; publish only ports needed for the smoke test or user access.
- Record cleanup commands, but do not tear down a reusable environment unless the user asked for an ephemeral run.

For a reusable image modeled after the original `autoenv setup` flow:

1. Copy or mount the repo into `/workspace`.
2. Install dependencies and build in the container.
3. Create a useful shell/run contract.
4. Commit or name the image/container only when the run needs later reuse.
5. Preserve build artifacts so the user can develop inside the environment.

## Command Examples

Current workspace:

```bash
repo="."
goal="Configure this repo so I can run the CLI help"
output=".dev-output/autoenv/$(basename "$PWD")-$(date +%Y%m%d-%H%M%S)"
```

With injected env:

```bash
repo="."
env_vars=("DATABASE_URL=postgres://..." "OPENAI_API_KEY=...")
goal="Configure the web app and smoke-test startup"
```

With extra local code:

```bash
repo="."
extra_paths=(../plugin)
goal="Configure this app with the sibling plugin available"
```

## Execution Notes

- There is no required wrapper script.
- The agent should create the output directory and artifact files directly.
- Required host tooling depends on the chosen strategy. Docker is required only when the selected environment strategy uses Docker.

## More Detail

See [reference.md](reference.md) for run parameters, output contract details, and integration notes.
