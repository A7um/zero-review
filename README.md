# Zero Review — Auto-Dev Platform

An agent-majority software organization in a plugin. Humans supply requirements and intervene at key decision points. Agents handle everything else — building, testing, triaging — through structured skills that make each role produce high-quality output in one go, without standing human review.

## How the Loop Works

```
Human Sponsor
    │ requirements
    ▼
┌─────────┐    structured spec    ┌──────────┐
│ auto-req │ ──────────────────► │ auto-dev  │
└─────────┘                       └────┬─────┘
                                       │ artifact
                                       ▼
                                 ┌──────────┐
                                 │ auto-test│
                                 └────┬─────┘
                                      │ issues
                                      ▼
                                ┌───────────┐    work items    ┌──────────┐
                                │auto-triage│ ────────────────►│ auto-dev │
                                └───────────┘                  └──────────┘
                                                                    │
                                                                    ▼
                                                                 (loop)
```

1. The **human sponsor** states what they want. auto-req turns it into a structured spec.
2. A **dev agent** picks up the spec, classifies the task, follows the matching paradigm, and ships verified code.
3. A **user agent** provisions the built artifact in Docker, adopts a persona, uses the software, and files bugs and feature requests.
4. A **triage agent** deduplicates, classifies, and prioritizes those issues into work items.
5. Work items flow back to dev agents. The loop repeats.

The human re-enters at escalation points: ambiguous requirements, conflicting priorities, policy decisions, or repeated quality gate failures.

This plugin defines the skills and contracts for that loop. It does not orchestrate it — an external system (or a coordinator agent in a separate repo) handles spawning, polling, and state management.

## Roles

Each role is a directory with `SOUL.md` (identity and behavioral posture) and `AGENTS.md` (operational protocol and interfaces), following the Hermes/OpenClaw convention. `USER.md` at the repo root describes the human sponsor.

| Role | Skill | What they do | Defined in |
|---|---|---|---|
| **Human sponsor** | — | States requirements, answers escalations, sets priority | `USER.md` |
| **Req agent** | auto-req | Elicits, structures, and validates requirements from vague input | `roles/req-agent/` |
| **Dev agent** | auto-dev | Classifies tasks, follows paradigms, ships verified code | `roles/dev-agent/` |
| **User agent** | auto-test | Exercises software as a simulated end user, files feedback | `roles/user-agent/` |
| **Triage agent** | auto-triage | Deduplicates, classifies, prioritizes, dispatches work items | `roles/triage-agent/` |

## Skills

**auto-dev** uses software engineering discipline and test-driven verification to make coding agents produce high-quality code in one go, without human review or intervention. Every task goes through a mandatory design-thinking phase (architecture for greenfield, impact analysis for enhancements, hypothesis-driven diagnosis for bugs) before any code is written. This forces the agent to understand the problem deeply enough to get it right the first time. Test-plan-driven development (TPDD) defines what "correct" means *before* implementation — Must Have checkpoints, integration boundaries, and Forbidden Zone redlines give the agent concrete, verifiable success criteria it can check autonomously. Quality gates at every phase boundary replace the human reviewer: the agent self-assesses against objective criteria and escalates only when something doesn't fit. The result is code that passes its own review — designed, implemented, reviewed, and verified — delivered without the human ever needing to read a line.

**auto-test** makes user agents exercise software the way real people do, not the way engineers verify it. It provisions a Docker environment with the right interaction toolkit (Playwright for web, shell for CLI, HTTP client for APIs), assigns the agent a persona with specific goals and patience limits, and runs a perception-action loop — observe the screen, decide what to do, act, record what happened. Friction is signal: confusion, slowness, missing affordances, and broken flows all become structured bug reports and feature requests that a dev agent can act on without asking for clarification. The persona system prevents the agent from over-testing: a novice gives up when confused, a power user pushes through, an adversarial tester probes boundaries.

**auto-triage** turns a pile of incoming issues into a prioritized, deduplicated queue of self-contained work items. It classifies each issue by type (bug, enhancement, addition) and maps it to the right dev paradigm, assigns priority based on user impact with a stated rationale, merges duplicates so dev agents don't do the same work twice, and dispatches work items complete enough that a dev agent can start immediately. Business priority calls (P0/P1) escalate to the human sponsor — the triage agent suggests, it doesn't decide unilaterally.

**auto-req** bridges the gap between vague human intent and actionable specifications. It elicits goals, constraints, and acceptance criteria from raw input — whether that's a conversation, an existing spec, or a GitHub issue — and produces a structured requirements document with verifiable success criteria and usage scenarios. If confidence is low, it blocks and escalates with specific questions rather than guessing. The output feeds directly into both dev agents (who build against the spec) and user agents (who test against the scenarios).

## Contracts

Cross-skill interfaces — each defines a schema so producers and consumers agree on format:

| Contract | Flow | Purpose |
|---|---|---|
| `contracts/requirements-doc.md` | auto-req → auto-dev, auto-test | Goals, acceptance criteria, usage scenarios |
| `contracts/artifact.md` | auto-dev → auto-test | How to build, run, and health-check a deliverable |
| `contracts/issue.md` | auto-test → auto-triage | Bug reports and feature requests with reproduction steps |
| `contracts/work-item.md` | auto-triage → auto-dev | Classified, prioritized, self-contained work items |

## Capability Tiers (auto-test)

Not all testing modes are equally reliable. auto-test explicitly marks each capability so agents and orchestrators know what to trust:

| Capability | Tier | Model Requirement |
|---|---|---|
| CLI tool testing | **Stable** | Any |
| REST/GraphQL API testing | **Stable** | Any |
| Web app — DOM/accessibility | **Stable** | Any |
| Web app — visual validation | **Experimental** | Vision-capable (GPT-4o+, Gemini Pro Vision+) |
| Desktop GUI — Electron | **Experimental** | GPT-5.4+, Claude with vision |
| Desktop GUI — native | **Experimental** | GPT-5.4+ |
| Realistic persona simulation | **Experimental** | GPT-5.4+, Claude Opus+ |

**Stable** = works reliably, high-confidence findings. **Experimental** = works under specific conditions, requires specific model capabilities, findings flagged as lower confidence.

## Commands

| Command | Skill | When to Use |
|---|---|---|
| `/zero-review:dev <task>` | auto-dev | Auto-classify and build |
| `/zero-review:dev-new <task>` | auto-dev | Greenfield — new project |
| `/zero-review:dev-enhance <task>` | auto-dev | Feature addition, behavior extension |
| `/zero-review:dev-fix <task>` | auto-dev | Defect, regression, incorrect behavior |
| `/zero-review:dev-add <task>` | auto-dev | Single function/component |
| `/zero-review:req <input>` | auto-req | Elicit and structure requirements |
| `/zero-review:test <artifact>` | auto-test | Simulated user testing |
| `/zero-review:triage <issues>` | auto-triage | Classify and dispatch issues |

## Installation

This plugin works on **Cursor, Claude Code, CodeBuddy, OpenClaw, Codex CLI, and Gemini CLI** from a single repository.

### Cursor

Install from the marketplace, or test locally:

```bash
ln -s /path/to/zero-review ~/.cursor/plugins/local/zero-review
```

### Claude Code / CodeBuddy

```
/plugin marketplace add https://github.com/A7um/zero-review
/plugin install zero-review@atum-marketplace
/reload-plugins
```

### OpenClaw

```bash
openclaw plugins install https://github.com/A7um/zero-review
```

### Codex CLI

```bash
git clone https://github.com/A7um/zero-review.git
```

Then invoke the skill with `$zero-review` in Codex.

### Gemini CLI

```bash
gemini extensions install https://github.com/A7um/zero-review
```

### Local Development

```bash
claude --plugin-dir /path/to/zero-review
/reload-plugins
```

## Plugin Structure

```
zero-review/
├── USER.md                           # Human sponsor profile
├── roles/
│   ├── req-agent/                    # SOUL.md + AGENTS.md
│   ├── dev-agent/                    # SOUL.md + AGENTS.md
│   ├── user-agent/                   # SOUL.md + AGENTS.md
│   └── triage-agent/                 # SOUL.md + AGENTS.md
├── skills/
│   ├── auto-dev/                     # Software engineering (phases, paradigms, principles)
│   ├── auto-req/                     # Requirements elicitation (strategies, templates)
│   ├── auto-test/                    # Simulated user testing (interaction, personas, environments)
│   └── auto-triage/                  # Issue triage (rules, templates)
├── contracts/                        # Cross-skill interface definitions
├── commands/                         # Slash commands (Claude + CodeBuddy)
├── .gemini/commands/zero-review/     # Gemini CLI commands
├── .cursor-plugin/                   # Cursor metadata
├── .claude-plugin/                   # Claude Code + OpenClaw metadata
├── .codebuddy-plugin/                # CodeBuddy metadata
├── hooks/hooks.json                  # SubagentStart hook
└── scripts/inject-dev-skill.sh       # Hook script
```

Skills are **read-only definitions** — they never write to themselves, store state, or manage output locations. All mutable state lives in the project or orchestrator. The auto-dev skill embeds 8 software design principles (drawn from *A Philosophy of Software Design*) loaded selectively during architecture and code-review phases: `module-depth` · `information-hiding` · `abstraction-layers` · `cohesion-separation` · `error-handling` · `naming-obviousness` · `documentation` · `strategic-design`.

## Contributing

See [CONTRIBUTING.md](./skills/auto-dev/CONTRIBUTING.md) for how to add new paradigms, compose existing ones, and configure output locations.
