---
description: "Composable development workflow — auto-classifies task type and follows the matching paradigm"
argument-hint: <task description>
---

# Auto-Dev — Auto-Classify

You are executing the **auto-dev skill**. Your job is to classify the task and follow the correct paradigm workflow.

## User Request

$ARGUMENTS

## Step 1: Load Skill Definition

Read these files to understand the workflow system:
- `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/SKILL.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/config/defaults.json`

## Step 2: Classify the Task

Determine the task type from the user's request using this decision tree:

| Signal | Paradigm | Command equivalent |
|--------|----------|--------------------|
| New project/system, no existing codebase | `dev/architecture-first` | `/dev-new` |
| Defect, regression, incorrect behavior | `bugfix/hypothesis-driven` | `/dev-fix` |
| Single function/component, fits existing architecture unchanged | `addition/lightweight` | `/dev-add` |
| Everything else (feature addition, behavior extension) | `enhancement/delta-design` | `/dev-enhance` |

**When in doubt** → `enhancement/delta-design`.

**IMPORTANT**: State your classification and reasoning before proceeding.

## Step 3: Load & Execute the Paradigm

Read the selected paradigm file from `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/paradigms/{task-type}/`:
- Greenfield → `paradigms/dev/architecture-first.md`
- Enhancement → `paradigms/enhancement/delta-design.md`
- Bugfix → `paradigms/bugfix/hypothesis-driven.md`
- Addition → `paradigms/addition/lightweight.md`

## Step 4: Execute Phase Sequence

Follow the paradigm's phase sequence. For **each phase**:
1. Read the phase file from `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/phases/{phase-name}.md`
2. Execute its instructions
3. Verify the quality gate is met before advancing

## Step 5: Reference Design Principles

When making design decisions during architecture, implementation, or code review, read the relevant principles from `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/principles/`.

## Key Rules

- **Think before build** — always design/analyze before implementing
- **Unclear requirements are blockers** — if confidence is LOW, ask the user
- **Code quality is mandatory** — no delivery without passing code-review
- **Respect quality gates** — each phase defines what must be true before proceeding
- **Real-environment verification** — E2E tests against real software, not mocks
