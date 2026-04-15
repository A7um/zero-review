---
name: auto-dev
version: 4.0
description: Composable development workflow system. Phases define reusable steps; paradigms compose them into ordered sequences. Four paradigms cover greenfield, enhancement, bugfix, and addition task types.
author: system
requires: []
---

# Auto-Dev Skill

> **WHEN TO USE:** Task requires building, modifying, or fixing software, tools, or systems and requirements are clear (confidence: MEDIUM or HIGH).

## Development Philosophy

**Think like an engineer, not a code generator. Quality comes from understanding, not speed.**

① **Define done** — Before touching code, articulate what success looks like. What should work? What must not break? What is out of scope? This is your anchor for every decision that follows. Without it, scope drifts silently.

② **Understand before you change** — Read the code you're about to modify. Read its callers, its callees, its tests. Map the blast radius. Your change quality is bounded by your understanding quality — when things go wrong, it's almost always because you understood too little, not because you coded too little.

③ **Present, then act** — After understanding, describe what you found and what you plan to do before doing it. The most productive sessions are those where design is discussed before code is written. The worst sessions are those where the agent reads files and immediately starts editing.

④ **One correct change** — Re-read the file before each edit. Make one comprehensive change, not ten incremental patches. If you find yourself editing the same file a third time, stop — you don't understand it well enough yet.

⑤ **Every result is evidence** — A test failure is not "retry with a tweak." Read the assertion. What does it actually say? A passing test suite is not "done" — does it exercise the behavior you changed? An error message is not "try something else" — what specifically went wrong?

⑥ **Check against ①, stop** — When the success criteria from ① are met, deliver. Don't improve what wasn't asked for. Don't refactor adjacent code. Don't absorb new scope mid-task. If a new request arrives, explicitly decide: defer, replace, or acknowledge the expansion.

## Task Classification

| Signal | Paradigm |
|--------|----------|
| New project/system, no existing codebase | `dev/architecture-first` |
| Defect, regression, incorrect behavior | `bugfix/hypothesis-driven` |
| Single function/component, fits existing architecture unchanged | `addition/lightweight` |
| Everything else (feature addition, behavior extension) | `enhancement/delta-design` |

**When in doubt** → `enhancement/delta-design`. If a paradigm's quality gates reveal mismatch → escalate.

## Paradigm System

Development workflows are composed from **phases** (reusable steps) organized into **paradigms** (ordered sequences).

### Phases

Each phase is a self-contained markdown file in `phases/` with defined inputs, outputs, and quality gates:

| Phase | Purpose |
|-------|---------|
| [validate-requirements](phases/validate-requirements.md) | Ensure requirements are clear and actionable |
| [test-plan](phases/test-plan.md) | Define boundaries, forbidden zones, and Must Have checkpoints (TPDD) |
| [architecture](phases/architecture.md) | Design system structure with complexity analysis |
| [impact-analysis](phases/impact-analysis.md) | Map existing structure and design the delta for enhancements |
| [diagnose](phases/diagnose.md) | Hypothesis-driven bug diagnosis to find root cause |
| [extract-contracts](phases/extract-contracts.md) | Extract interface stubs for parallel sessions |
| [implement](phases/implement.md) | Build against architecture, impact doc, or diagnosis doc |
| [code-review](phases/code-review.md) | Review for structural and design quality |
| [verify](phases/verify.md) | Verify against TestPlan checkpoints — capability, integration, and E2E (environment-aware) |
| [provision-environment](phases/provision-environment.md) | Auto-provision Docker environment for real E2E verification (optional) |
| [deliver](phases/deliver.md) | Report completion with structured output |

### Paradigms

| Task Type | Paradigm | Description |
|-----------|----------|-------------|
| Greenfield | [dev/architecture-first](paradigms/dev/architecture-first.md) | Full TestPlan + architecture design before implementation |
| Enhancement | [enhancement/delta-design](paradigms/enhancement/delta-design.md) | Impact-analysis-driven workflow for existing codebases |
| Bugfix | [bugfix/hypothesis-driven](paradigms/bugfix/hypothesis-driven.md) | Hypothesis-driven diagnosis, minimal surgical fix |
| Addition | [addition/lightweight](paradigms/addition/lightweight.md) | Lightweight workflow for single well-scoped additions |

### Shared Protocols

| Protocol | Purpose |
|----------|---------|
| [parallel-execution](paradigms/parallel-execution.md) | Cross-cutting execution strategy for parallel submodule implementation (M/L/XL, >=2 independent modules) |

### How to Use

1. **Classify the task** — use the Task Classification table above
2. **Select the paradigm** — the table maps signals to paradigms
3. **Announce your phase sequence** — state which phases you will follow before starting. This announcement is your commitment. In the best-performing sessions, this step alone ensured full adherence.
4. **Follow the phase sequence** — read each phase file when you enter that phase, not all upfront
5. **Check for parallel execution** — if M/L/XL with >=2 independent modules, see [parallel-execution](paradigms/parallel-execution.md)
6. **Respect quality gates** — each phase defines what must be true before proceeding
7. **Escalate if needed** — if quality gates reveal the paradigm doesn't fit, switch to the appropriate one
8. **Re-evaluate complexity** — if during implementation you discover 3+ files need changes or >50 lines of modification beyond initial estimate, stop and re-classify

### Key Constraints

- Don't start coding from LOW confidence requirements
- Don't skip design thinking — use the appropriate paradigm for the task type
- Don't mark complete without runnable, verifiable result
- Don't run destructive commands without asking

## What Coding Agents Get Wrong

Coding agents have predictable failure patterns that undermine autonomous delivery. Naming them helps resist them.

- **Code-first impulse.** The default is to start editing immediately. Even when told to follow a process, agents revert to inline coding within minutes. In sessions where the agent announced its phase sequence upfront, outcomes were measurably better. The phases exist to prevent this — skipping them is the single largest source of rework.

- **Patch-and-pray.** Instead of reading a file completely and making one correct change, agents make small local edits, test, find a secondary issue, patch that, test again — each fix shifting the bug elsewhere. A file edited 10+ times usually needed 1-2 edits with proper upfront understanding. Before editing, re-read the file — your in-context memory drifts from reality after each change.

- **First-diagnosis anchoring.** The agent commits to its first interpretation and filters subsequent evidence to confirm it. When evidence contradicts, it patches within the same mental frame rather than re-examining the frame itself. Wrong architectural layer, wrong hook point, wrong root cause — all from committing too early. State your assumptions explicitly and check each one.

- **Test theater.** Two forms: (a) running the same failing test repeatedly with speculative micro-fixes instead of deeply reading the assertion failure; (b) tests that pass but don't verify actual user-facing behavior. Unit tests passing while the deployed feature returns 500s. "Tests pass" ≠ "it works."

- **Complexity ratchet.** When a simple approach would work, agents reach for a sophisticated one — more abstraction, more indirection, more configuration. Timestamp comparison becomes git-stash SHA diffing. The result is harder to debug and often doesn't work on the first attempt. Ask: what is the simplest thing that solves this correctly?

- **Scope absorption.** Agents never say "that's a separate task." Every request gets folded into the current work. A bugfix becomes a bugfix + refactor + new feature + test rewrite. One task at a time — finish before starting the next.

- **Environment amnesia.** Agents run commands without verifying environment assumptions: wrong working directory, missing dependencies, wrong paths, wrong API endpoints. They also guess instead of reading — when a config file would give the answer immediately, agents probe blindly. Read configs and docs before running commands in unfamiliar environments.

- **Reasoning over reading.** After reading a file once, agents prefer to reason from stale in-context memory rather than re-reading the current state. Files change between edits. Error messages contain the answer if you actually read them. Re-read, don't theorize.

## Project Experience

Working knowledge accumulated during development, stored per project. Experience entries are dated — treat as hints, not guarantees.

When starting work on a project, check if a project experience file exists and load it. If following a pattern leads to failures, fall back to first-principles and update the entry.

After completing a task, if you discovered reusable project knowledge (codebase conventions, build/test patterns, architecture decisions, recurring pitfalls), write or update the project experience file. Only write verified facts.

Storage location is determined by the project or orchestrator, not by this skill. The recommended format:

```markdown
---
project: project-name
aliases: [alt-name-1, alt-name-2]
updated: YYYY-MM-DD
---
## Codebase Conventions
Naming, directory structure, error handling, import patterns

## Build & Test
Commands, frameworks, runners, what works

## Architecture Decisions
Key design choices and rationale

## Known Pitfalls
What breaks and why — environment quirks, platform issues, recurring review findings
```

## Design Principles

Principles in `principles/` are loaded selectively — not all at once. Load when the current phase requires quality evaluation:

| When | Load |
|------|------|
| architecture phase | All principles |
| impact-analysis phase | cohesion-separation, information-hiding, abstraction-layers |
| code-review phase | Principles relevant to the changes made |
| implement phase | naming-obviousness, error-handling |
| diagnose phase | error-handling |
| Other phases | None required |

Principles: module-depth, information-hiding, abstraction-layers, cohesion-separation, error-handling, naming-obviousness, documentation, strategic-design

## References

| Resource | When to Load |
|----------|-------------|
| `phases/{phase}.md` | When entering that phase (not all upfront) |
| `paradigms/{type}/{name}.md` | After task classification |
| `principles/{name}.md` | During architecture or code-review (see table above) |
| `paradigms/parallel-execution.md` | M/L/XL tasks with >=2 independent modules |
| Project experience file (external) | When starting work on a known project |
| `config/defaults.json` | When output path configuration is needed |
| `examples/` | When you need format reference for design docs or code reviews |
