# Parallel Execution Protocol

A cross-cutting execution strategy that modifies how the `implement` phase runs when multiple independent submodules can be built concurrently. This is not a phase — it has no sequential position of its own.

---

## Decision Criteria

**Parallelize when:**
- M/L/XL complexity
- ≥2 submodules that can be built independently
- Submodules share interfaces but not implementation

**Do not parallelize when:**
- S complexity (overhead exceeds benefit)
- Submodules have circular dependencies (resolve dependency order first)
- Submodules share mutable state (sequential is safer)

---

## Prerequisites

Before spawning parallel sessions, all three must be true:

1. **Design doc exists** — architecture doc (greenfield) or impact doc (enhancement)
2. **`extract-contracts` phase is complete** — interface stubs for every submodule
3. **TestPlan exists** with per-submodule scoping (Must Have / Need Have / Forbidden Zone per module)

---

## Session Contract

Each parallel session receives exactly 7 inputs. Do not skip any.

| # | Input | Description |
|---|-------|-------------|
| 1 | `DESIGN_DOC_PATH` | Path to architecture doc or impact doc. Session reads this for overall context. |
| 2 | `OWN_CONTRACT` | Path to this session's contract stub. The session implements this interface. |
| 3 | `DEP_CONTRACTS` | Paths to contracts this session depends on (calls but does not implement). Read-only — session must not modify them. |
| 4 | `TESTPLAN_SCOPE` | The TestPlan sections for this submodule: Capability, Boundary, Must Have, Need Have, Failure & Edge Cases. |
| 5 | `FORBIDDEN_ZONE` | Redlines for this submodule. Must be stated explicitly in the session prompt so they cannot be missed. |
| 6 | `COMPLETION_SIGNAL` | The exact action the session must perform when done (agent-specific — see agent adapter). |
| 7 | `INTEGRATION_CONTEXT` | The TestPlan Integration Tests relevant to this submodule — what other submodules will send to it and expect from it. Read-only context so the session knows its cross-boundary obligations. |

---

## Session Prompt Template

```
You are implementing the {submodule-name} submodule.

Design doc: {design_doc_path}
Your contract (implement this): {own_contract_path}
Dependency contracts (read-only, do not modify): {dep_contract_paths}

TestPlan scope:
{paste Must Have, Need Have, Failure Cases for this submodule}

Forbidden Zone — you must not violate these:
{paste Forbidden Zone redlines}

Integration context (what other submodules expect from you):
{paste relevant Integration Test Must Haves involving this submodule}

Implementation requirements:
- Implement the interface defined in your contract
- All Must Have checkpoints must pass
- Run code-review phase before signaling completion
- When done: {completion_signal}
```

---

## Dependency Ordering

Not all sessions can start at the same time.

1. Read the design doc — identify which submodules call which
2. Submodules with no dependencies on other in-progress submodules → start immediately
3. Submodules that depend on another submodule's output → wait until that submodule's contract is stable

**Shared contracts:** If submodule A and B both implement parts of a shared interface, extract that interface to `contracts/shared.{ext}` before either session starts. Both sessions get it as a dep contract.

**Rule:** A session can start as soon as all its dep contracts exist and are stable. Implementation does not need to be complete — only the interface stubs.

---

## Branch Strategy

Each session works on its own git branch:

```
feature/{task-slug}/{submodule-name}
```

After all sessions complete:
1. Review each branch with the code-review phase
2. Follow the Integration Protocol below

---

## Integration Protocol

After all sessions signal completion:

1. **Merge branches** — sequentially, starting with foundational submodules. Resolve conflicts.
2. **Create entry point** — the top-level module that wires submodules together. Done by the coordinating agent (not delegated) because it requires understanding the full picture.
3. **Run Integration Test Must Haves** — execute every checkpoint from the TestPlan's "Integration Tests" section. Each cross-submodule data flow must produce the expected result.
4. **Run E2E User Flows** — execute each scenario from the TestPlan's "End-to-End User Flows" section using the specified verification method. E2E subsumes smoke tests — if E2E passes, the system is alive.
5. **If any integration/E2E test fails:**
   - Identify which submodule boundary or interaction is broken
   - Re-open the responsible session with the failing test case and actual vs expected output
   - After fix, re-run ALL integration and E2E tests (not just the failing one)
   - Do not proceed to code-review/deliver until all pass

**Never** merge submodule branches to main until all integration and E2E tests pass.

---

## Monitoring

Teams must provide their own monitoring mechanism (polling, event bus, dashboard, etc.). The mechanism must support:

- Listing active sessions
- Inspecting a session's current state
- Detecting stuck sessions (no progress after expected duration)

**Stuck session resolution:**
1. Inspect the session's last output
2. If blocked on a dep contract → provide the missing interface
3. If in a loop → kill and respawn with a more specific prompt
4. If completed but didn't signal → manually trigger the completion signal

---

## Failure Handling

| Failure | Response |
|---------|----------|
| Session stuck on missing dep contract | Provide the contract file, resume session |
| File conflict between sessions | Resolve in integration step; note which session caused it |
| Dependency timeout (dep session not done) | Check if dep session is blocked; unblock it first |
| Must Have fails in integration | Identify responsible session, re-open with failing test case |
| Session completes but code quality fails | Re-open session with review output, require re-review before re-signaling |
| Branch merge conflict | Resolve manually, run integration tests again |
