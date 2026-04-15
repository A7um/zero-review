# Observation Protocol

What to capture at each step of the perception-action loop, determined by project type and persona.

## By Project Type

### Web Application

| Signal | Method | When |
|---|---|---|
| Page structure | `page.accessibility.snapshot()` or DOM query | Every step |
| Screenshot | `page.screenshot()` | After navigation, state change, or unexpected behavior |
| Console errors | `page.on('pageerror')`, `page.on('console')` | Continuous (filtered by persona permissions) |
| Network failures | `page.on('requestfailed')` | Continuous (filtered by persona permissions) |
| Response time | Timestamp delta: action → page idle | Every step |
| URL changes | `page.url()` | Every step |

### CLI Tool

| Signal | Method | When |
|---|---|---|
| Command output | stdout capture | After every command |
| Error output | stderr capture | After every command |
| Exit code | Process exit status | After every command |
| Response time | Command start → completion | Every command |

### REST/GraphQL API

| Signal | Method | When |
|---|---|---|
| Response body | HTTP response content | Every request |
| Status code | HTTP status | Every request |
| Headers | Response headers (auth, rate-limit, content-type) | Every request |
| Response time | Request sent → response received | Every request |
| Error format | Error response structure | On non-2xx responses |

### Desktop Application (Experimental)

| Signal | Method | When |
|---|---|---|
| Accessibility tree | AT-SPI snapshot | Every step |
| Screenshot | `scrot` or `import` (ImageMagick) | After interactions and state changes |
| Window state | `xdotool` window queries | Every step |
| Response time | Action → UI settled | Every step |

## By Persona

Personas filter what the agent is *allowed to use* when reporting issues. The agent may capture everything internally for session logging, but only includes persona-permitted signals in filed issues.

| Signal | Novice | Power User | Adversarial |
|---|---|---|---|
| What's on screen (DOM/a11y/screenshot) | Yes | Yes | Yes |
| Console errors | No | Sometimes | Yes |
| Network failures | No | No | Yes |
| Response times | Implicit ("it felt slow") | Yes (quantified) | Yes (quantified) |
| Headers / status codes | No | Sometimes | Yes |

"Sometimes" means: include only if the persona would plausibly check (e.g., a power user opening devtools after repeated failures).
