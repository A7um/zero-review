# Auto-Dev Skill

## Mission

Make coding agents produce **high-quality code in one go, without human review or intervention**.

This skill uses software engineering discipline and test-driven verification to achieve autonomous delivery. The core mechanism: every task goes through a mandatory design-thinking phase before any code is written — architecture for greenfield, impact analysis for enhancements, hypothesis-driven diagnosis for bugs. This forces the agent to understand the problem deeply enough to get it right the first time, rather than patch-and-retry.

Test-plan-driven development (TPDD) then defines what "correct" means *before* implementation. Must Have checkpoints, integration boundaries, and Forbidden Zone redlines give the agent concrete, verifiable criteria it can check without human judgment. Quality gates at every phase boundary act as the reviewer: the agent self-assesses against objective criteria, escalates only when something doesn't fit. The result is code that is designed, implemented, reviewed, and verified — delivered without the human ever needing to read a line.

## Design Philosophy

> **Skill = Agent Strategy Philosophy + Minimum Complete Toolset + Necessary Factual Statements**

Every line in this skill exists because it counters a specific, evidence-backed agent failure mode.

**Strategy Philosophy** — A 6-step development thinking loop that teaches agents *how to think about software tasks*, not just what steps to follow. Counters the default "read file → start editing" impulse.

**Minimum Complete Toolset** — 11 reusable phases composed into 4 paradigms (greenfield, enhancement, bugfix, addition), each with quality gates that replace human review. The paradigm prescribes the sequence; the gates enforce quality.

**Necessary Factual Statements** — 8 named inertia traps (code-first impulse, patch-and-pray, first-diagnosis anchoring, test theater, complexity ratchet, scope absorption, environment amnesia, reasoning over reading) that call out exactly how coding agents fail. Not rules — observations that create in-context awareness.

## Why These Three Layers

**Philosophy (Development Philosophy section):** Coding agents default to "produce artifacts." They treat every input as a signal to write code. The 6-step loop — define done, understand before changing, present then act, one correct change, every result is evidence, check and stop — recalibrates this. In sessions where agents followed this thinking pattern, outcomes were measurably better.

**Toolset (Phases + Paradigms):** The phases *are* the minimum complete toolset for software development. Like web-access provides search/fetch/browser to cover all web behaviors, this skill provides validate → design → implement → review → verify → deliver to cover all development behaviors. Paradigms compose these into task-appropriate sequences.

**Facts (Inertia Traps):** Models know how to code well, but don't always activate that knowledge at the right moment. A file edited 10+ times usually needed 1-2 edits with proper understanding upfront. Tests pass but don't verify actual behavior. The agent commits to its first diagnosis and filters contradicting evidence. Naming these patterns — like web-access names "fetch can't load JS-heavy sites" — creates an anchor that activates when the pattern is about to occur.

## Building Blocks

### Phases — Reusable Workflow Steps

Each phase is an atomic, self-contained step with declared inputs, outputs, and a quality gate:

```
┌─────────────────────────────┐
│  phase: validate-requirements│
│  inputs:  raw task brief     │
│  outputs: validated reqs doc │
│  gate:    confidence >= MED  │
└─────────────────────────────┘
```

Eleven phases in `phases/`. Each is a markdown file an agent reads and follows when entering that phase — not all upfront.

### Paradigms — Ordered Phase Sequences

A paradigm composes phases into an ordered workflow for a specific task type:

- **`dev/architecture-first`**: validate-requirements → test-plan → architecture → extract-contracts → implement → code-review → verify → deliver
- **`bugfix/hypothesis-driven`**: validate-requirements → diagnose → implement → code-review → verify → deliver

Same core phases reused across paradigms. The paradigm only adds what's unique.

Four paradigms in `paradigms/` plus a cross-cutting `parallel-execution` protocol.

### Project Experience — Cross-Session Learning

Like web-access stores per-domain site patterns, this skill stores per-project patterns in `references/project-patterns/`. Codebase conventions, build commands, architecture decisions, recurring pitfalls — all accumulated during development and loaded on the next session.

Experience is dated and treated as hints, not guarantees. If a pattern leads to failure, fall back to first-principles and update the entry.

## Design Decisions

**Quality gates replace human review.** Every phase has pass/fail criteria. The agent self-assesses; escalation is the exception. This is what makes autonomy safe.

**Phase announcement as enforcement.** The best-performing sessions were those where the agent stated its phase sequence upfront. That public commitment was the enforcement mechanism. This is now a required step.

**Compose, don't fork.** When a new task type needs a different sequence, compose existing phases — don't copy and modify. Improve a phase once, every paradigm benefits.

**Selective principle loading.** Eight design principles exist but load per-phase, not all at once. A bugfix doesn't need `abstraction-layers.md`. Context budget is preserved.

**Complexity re-evaluation.** The "S complexity → skip most phases" escape hatch was being abused. Now: if during implementation you discover 3+ files or >50 lines beyond estimate, stop and re-classify.

**In-context design over file artifacts.** `.dev-output/` had zero usage across 50+ sessions. For S/M tasks, design happens in-context. File-based artifacts are reserved for L/XL.

## Quick Reference

```
skills/auto-dev/
├── SKILL.md                   # Entry point — start here
├── phases/                    # 11 reusable workflow steps + _template.md
├── paradigms/                 # 4 task-type workflows + parallel-execution
│   ├── dev/                   #   Greenfield: architecture-first
│   ├── enhancement/           #   Existing code: delta-design
│   ├── bugfix/                #   Defects: hypothesis-driven
│   └── addition/              #   Single component: lightweight
├── principles/                # 8 shared design principles
├── references/                # Lazy-loaded resources
│   └── project-patterns/      #   Per-project experience (dynamic)
├── scripts/match-project.sh   # Project experience matcher
├── config/                    # Defaults and configuration
├── examples/                  # Output format references
└── CONTRIBUTING.md            # How to extend the skill
```

## Extending the Skill

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add new paradigms, compose existing ones, and configure output locations.
