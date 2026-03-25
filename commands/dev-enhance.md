---
description: "Enhance existing code — impact-analysis-driven workflow"
argument-hint: <what to enhance>
---

# Software Development — Enhancement (Delta Design)

You are executing the **delta-design** paradigm for enhancing existing code.

## User Request

$ARGUMENTS

## Paradigm: `enhancement/delta-design`

**Best for**: Adding features to existing code, extending behavior, modifying existing workflows.

Read the full paradigm definition:
- `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/paradigms/enhancement/delta-design.md`

And the shared skill context:
- `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/SKILL.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/config/defaults.json`

## Phase Sequence

Execute these phases **in order**. For each phase, read the phase file from `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/phases/`, execute its instructions, and verify the quality gate before advancing.

1. **validate-requirements** → `phases/validate-requirements.md`
   - Ensure requirements are clear (MEDIUM or HIGH confidence)
   - If LOW → stop and ask the user for clarification
2. **impact-analysis** → `phases/impact-analysis.md`
   - Map existing structure, design the delta (what changes, what stays, what could break)
   - Output: `.dev-output/designs/impact_{YYYYMMDD}_{slug}.md`
3. **test-plan** → `phases/test-plan.md`
   - Scoped to the enhancement only, not the entire system
   - Feature-level acceptance criteria
4. **extract-contracts** → `phases/extract-contracts.md` *(optional)*
   - Only for L/XL with >=2 independent affected modules
   - Skip for S/M or single-module enhancements
5. **implement** → `phases/implement.md`
   - Receives the impact doc (not an architecture doc)
   - Must preserve all existing behavior identified in impact analysis
   - Implement interface changes first if any
6. **code-review** → `phases/code-review.md`
   - Review for structural and design quality
   - Reference principles in `${CLAUDE_PLUGIN_ROOT}/skills/auto-dev/principles/`
7. **verify** → `phases/verify.md`
   - Verify against TestPlan checkpoints
8. **deliver** → `phases/deliver.md`
   - Report completion with structured output

## Key Rules

- Impact analysis before implementation — understand what exists before changing it
- Preserve existing behavior — break nothing that currently works
- Code quality is mandatory — no delivery without passing code-review
