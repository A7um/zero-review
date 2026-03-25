---
name: architecture-first
description: TestPlan-driven design with architecture before implementation. The default workflow for greenfield projects.
best_for: [new projects, new systems, no existing codebase, M/L/XL complexity, tasks requiring parallel sessions]
avoid_when: [pure spikes or throwaway prototypes, enhancements to existing code, bugfixes, small additions]
composable_with: [tdd]
---

# Architecture-First

The standard development paradigm for greenfield projects. Design the system structure before writing any implementation code. Validated through TestPlan-Driven Development (TPDD).

## When to Use

- New project or system with no existing codebase
- Tasks with MEDIUM or HIGH confidence requirements
- M/L/XL complexity where parallel sessions may be needed
- Any greenfield task where structural decisions matter

## Phase Sequence

1. [validate-requirements](../../phases/validate-requirements.md)
2. [test-plan](../../phases/test-plan.md)
3. [architecture](../../phases/architecture.md)
4. [extract-contracts](../../phases/extract-contracts.md)
5. [implement](../../phases/implement.md)
6. [code-review](../../phases/code-review.md)
7. [verify](../../phases/verify.md)
8. [deliver](../../phases/deliver.md)

## Phase Overrides

### extract-contracts
- Skip for S complexity tasks with a single submodule
- For XL designs, delegate contract extraction to a separate session

### implement
- S complexity / single submodule: delegate to sub-agent or coding tool directly
- M/L/XL with >=2 independent submodules: follow [Parallel Execution Protocol](../parallel-execution.md)
- <50 lines, 1-2 files, clear solution: implement directly (no delegation)

## Composition Rules

### + tdd
When composing with a TDD paradigm:
1. validate-requirements
2. test-plan
3. architecture
4. extract-contracts
5. write-tests (from TDD paradigm)
6. implement (with tests as verification during development)
7. code-review
8. verify
9. deliver

The TDD `write-tests` phase slots in after contracts are extracted and before implementation begins. Tests are written against contracts, not implementations.
