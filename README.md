# Zero Review Plugin

This plugin uses **software engineering discipline and test-driven verification** to make coding agents produce high-quality code **in one go, without human review or intervention**.

It achieves this through structured engineering practice: every task goes through a mandatory design-thinking phase (architecture for greenfield, impact analysis for enhancements, hypothesis-driven diagnosis for bugs) before any code is written. This forces the agent to understand the problem deeply enough to get it right the first time. Then, test-plan-driven development (TPDD) defines what "correct" means *before* implementation — Must Have checkpoints, integration boundaries, and Forbidden Zone redlines give the agent concrete, verifiable success criteria it can check autonomously. Quality gates at every phase boundary replace the human reviewer: the agent self-assesses against objective criteria, and escalates only when something doesn't fit. The result is code that passes its own review — designed, implemented, reviewed, and verified — delivered without the human ever needing to read a line.

---

## Installation

This plugin works on **Claude Code, CodeBuddy, OpenClaw, Codex CLI, and Gemini CLI** from a single repository.

### Claude Code

```
/plugin marketplace add https://github.com/A7um/zero-review
/plugin install zero-review@atum-marketplace
/reload-plugins
```

### CodeBuddy

```
/plugin marketplace add https://github.com/A7um/zero-review
/plugin install zero-review@atum-marketplace
/reload-plugins
```

### OpenClaw

OpenClaw reads Claude-compatible plugin bundles natively:

```bash
openclaw plugins install https://github.com/A7um/zero-review
```

### Codex CLI

Clone the repo into your project — Codex auto-discovers `.agents/skills/`:

```bash
git clone https://github.com/A7um/zero-review.git
```

Then invoke the skill with `$zero-review` in Codex.

### Gemini CLI

```bash
gemini extensions install https://github.com/A7um/zero-review
```

Commands become available as `/zero-review:dev`, `/zero-review:dev-new`, etc.

### Local Development

To test the plugin locally:

```bash
claude --plugin-dir /path/to/zero-review
/reload-plugins
```

After installation, the slash commands (`/zero-review:dev`, `/zero-review:dev-new`, `/zero-review:dev-fix`, `/zero-review:dev-enhance`, `/zero-review:dev-add`) become available, and the SubagentStart hook automatically injects skill context into subagents.

## Capabilities

| What | How |
|---|---|
| **Autonomous delivery** | Design → implement → self-review → verify → deliver, no human gates |
| **Test-driven quality** | TPDD defines success criteria before code is written; verification runs against real environments |
| **Task-type workflows** | 4 paradigms (greenfield, enhancement, bugfix, addition) composed from 11 reusable phases |
| **Parallel execution** | Contract-based session isolation lets independent modules build in parallel |
| **Anti-inertia design** | Development philosophy + 8 named failure traps counter predictable agent mistakes |
| **Cross-session learning** | Per-project experience accumulation — conventions, pitfalls, patterns carry across sessions |


## Slash Commands

| Command | Paradigm | When to Use |
|---------|----------|-------------|
| `/zero-review:dev <task>` | Auto-classify | Let the agent pick the right paradigm |
| `/zero-review:dev-new <task>` | `dev/architecture-first` | Greenfield — new project or system |
| `/zero-review:dev-enhance <task>` | `enhancement/delta-design` | Feature addition, behavior extension |
| `/zero-review:dev-fix <task>` | `bugfix/hypothesis-driven` | Defect, regression, incorrect behavior |
| `/zero-review:dev-add <task>` | `addition/lightweight` | Single function/component, fits existing architecture |

## Plugin Structure

```
zero-review/
├── .claude-plugin/               # Claude Code + OpenClaw (bundle mode)
├── .codebuddy-plugin/            # CodeBuddy
├── .agents/skills/zero-review/   # Codex CLI (thin wrapper → skills/auto-dev/)
├── .gemini/commands/zero-review/ # Gemini CLI (TOML commands)
├── commands/                     # Slash commands (Claude + CodeBuddy)
│   ├── dev.md                    #   /zero-review:dev — auto-classify
│   ├── dev-new.md                #   /zero-review:dev-new — greenfield
│   ├── dev-enhance.md            #   /zero-review:dev-enhance — enhancement
│   ├── dev-fix.md                #   /zero-review:dev-fix — bugfix
│   └── dev-add.md                #   /zero-review:dev-add — addition
├── hooks/hooks.json              # SubagentStart hook
├── scripts/inject-dev-skill.sh   # Hook script
└── skills/auto-dev/              # Canonical skill (shared by all platforms)
    ├── SKILL.md                  # Entry point — philosophy, classification, traps
    ├── phases/                   # 11 reusable workflow steps + template
    ├── paradigms/                # 4 task-type workflows + parallel protocol
    │   ├── dev/                  #   architecture-first
    │   ├── enhancement/          #   delta-design
    │   ├── bugfix/               #   hypothesis-driven
    │   └── addition/             #   lightweight
    ├── principles/               # 8 design principles
    ├── references/               # Per-project experience (dynamic, gitignored)
    ├── config/defaults.json      # Configuration
    ├── examples/                 # Output format references
    └── CONTRIBUTING.md           # How to extend
```

## How It Works

**For the user:** Type `/zero-review:dev fix the login timeout bug` or just describe the task. The plugin classifies it, loads the right paradigm, and the agent follows the phase sequence autonomously.

## Design Principles

The skill embeds 8 software design principles (drawn from *A Philosophy of Software Design*) that are loaded selectively during architecture and code-review phases:

`module-depth` · `information-hiding` · `abstraction-layers` · `cohesion-separation` · `error-handling` · `naming-obviousness` · `documentation` · `strategic-design`

## Contributing

See [CONTRIBUTING.md](./skills/auto-dev/CONTRIBUTING.md) for how to add new paradigms, compose existing ones, and configure output locations.
