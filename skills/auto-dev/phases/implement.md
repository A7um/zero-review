---
id: implement
name: Implement
inputs: [architecture doc, contracts, TestPlan]
outputs: [working implementation]
optional: false
---

# Phase: Implement

## Purpose
Build the implementation incrementally against the architecture doc and contracts. The designing agent delegates implementation to coding tools or sub-agents.

## Process

### Delegation Threshold

**Parallel sessions** (for agents with parallel session capability)**:**
- M/L/XL complexity
- >=2 independent submodules

**Delegate to sub-agent or coding tool:**
- S complexity
- Single submodule
- <50 lines, 1-2 files

**Direct implementation (no delegation):**
- <50 lines
- 1-2 files
- Clear, well-defined solution

**Why:** Spawning agents has overhead. For tiny, well-defined changes, direct implementation is faster.

### Parallel Session Protocol

When the delegation threshold calls for parallel sessions, follow the [Parallel Execution Protocol](../paradigms/parallel-execution.md) for session contracts, dependency ordering, branch strategy, and integration.

### Implementation Rules

- Build in small, verifiable chunks
- Update task status at each milestone
- Write to: `{output_root}/implementations/{slug}/`
- Prefer delegating implementation to sub-agents or coding tools when available

## Principles

- `principles/strategic-design.md` — Working code is not enough; invest in design quality
- `principles/module-depth.md` — Build deep modules, not shallow wrappers
- `principles/information-hiding.md` — Keep implementation details inside modules

## Outputs
- `{output_root}/implementations/{slug}/`
- Task status updated to "in_progress"

## Quality Gate
- Implementation matches contracts
- Code compiles/runs without errors
- All submodules implement their assigned contracts

## Skip Conditions
This phase is never skipped.
