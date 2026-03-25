---
description: "Greenfield development — full architecture design before implementation"
argument-hint: <what to build>
---

# Auto-Dev — Greenfield (Architecture-First)

You are executing the **architecture-first** paradigm for greenfield development.

## User Request

$ARGUMENTS

## Paradigm: `dev/architecture-first`

**Best for**: New projects, new systems, no existing codebase, M/L/XL complexity.

Read the full paradigm definition:
- `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/paradigms/dev/architecture-first.md`

And the shared skill context:
- `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/SKILL.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/config/defaults.json`

## Phase Sequence

Execute these phases **in order**. For each phase, read the phase file from `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/phases/`, execute its instructions, and verify the quality gate before advancing.

1. **validate-requirements** → `phases/validate-requirements.md`
   - Ensure requirements are clear (MEDIUM or HIGH confidence)
   - If LOW → stop and ask the user for clarification
2. **test-plan** → `phases/test-plan.md`
   - Define boundaries, forbidden zones, Must Have checkpoints (TPDD)
3. **architecture** → `phases/architecture.md`
   - Design system structure with complexity analysis
   - Output: `.dev-output/designs/arch_{YYYYMMDD}_{slug}.md`
4. **extract-contracts** → `phases/extract-contracts.md`
   - Extract interface stubs for parallel sessions
   - Skip for S complexity / single submodule
5. **implement** → `phases/implement.md`
   - Build against architecture and contracts
   - For M/L/XL with >=2 independent modules, check `paradigms/parallel-execution.md`
6. **code-review** → `phases/code-review.md`
   - Review for structural and design quality
   - Reference principles in `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/principles/`
7. **verify** → `phases/verify.md`
   - Verify against TestPlan checkpoints
8. **deliver** → `phases/deliver.md`
   - Report completion with structured output

## Key Rules

- Think before build — architecture design is mandatory before implementation
- Code quality is mandatory — no delivery without passing code-review
- Respect quality gates — each phase defines what must be true before proceeding
