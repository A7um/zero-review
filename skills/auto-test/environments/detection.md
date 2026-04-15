# Project Type Detection

How to classify what kind of artifact you're testing, based on project files.

## Detection Order

Check in this order — first match wins:

### 1. Explicit artifact contract

If a `contracts/artifact.md`-format document is provided, use its `project_type` field directly. Skip detection.

### 2. Docker/Compose files

| File present | Infer |
|---|---|
| `docker-compose.yml` / `docker-compose.yaml` / `compose.yml` | Read the compose file — services with exposed ports suggest `web` or `api`; services with only entrypoints suggest `cli` |
| `Dockerfile` | Read it — `EXPOSE` suggests `web` or `api`; `ENTRYPOINT` with no ports suggests `cli` |

### 3. Package manager and framework signals

| Signal | Project type |
|---|---|
| `package.json` with `react`, `vue`, `next`, `nuxt`, `svelte`, `angular` | `web` |
| `package.json` with `express`, `fastify`, `hono`, `koa` and no frontend framework | `api` |
| `package.json` with `electron` | `desktop` (Electron) |
| `package.json` with `bin` field | `cli` |
| `requirements.txt` / `pyproject.toml` with `django`, `flask`, `fastapi` | `web` or `api` (check for templates/static dirs → `web`, otherwise `api`) |
| `Cargo.toml` with `clap`, `structopt` | `cli` |
| `Cargo.toml` with `actix-web`, `axum`, `rocket` | `api` or `web` |
| `go.mod` with `net/http`, `gin`, `echo`, `fiber` | `api` or `web` |
| `Gemfile` with `rails` | `web` |
| `*.desktop` file or `CMakeLists.txt` with Qt/GTK | `desktop` (native) |

### 4. README hints

If no framework signals are found, scan README for:
- "web app", "frontend", "UI" → `web`
- "API", "REST", "GraphQL", "endpoint" → `api`
- "CLI", "command-line", "terminal" → `cli`
- "desktop", "GUI", "application" → `desktop`

### 5. Fallback

If detection fails, default to `cli` (safest — can always run commands against the project) and log a warning that detection was inconclusive.

## Output

```yaml
project_type: web | cli | api | desktop
framework: string | null          # e.g., "next", "fastapi", "electron"
confidence: high | medium | low   # How sure the detection is
environment: string               # Which dockerfile to use: web, cli, api, desktop
capability_tier: stable | experimental
```
