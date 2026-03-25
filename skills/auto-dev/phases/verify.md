---
id: verify
name: Verify
inputs: [implementation, TestPlan]
outputs: [verification results, Must Have pass/fail status]
optional: false
---

# Phase: Verify

## Purpose
Verify the implementation against the TestPlan Must Have checkpoints. Build success does not mean it works — verification catches issues before the user sees them.

Verification follows the testing hierarchy: capability → integration → E2E. Each level gates the next.

## Process

### Step 1: Capability Verification (Level 1)

**Run all submodule Must Have checkpoints.** If any fail, do not proceed to integration.

- For each submodule in the TestPlan, verify every Must Have checkpoint
- Run all automated tests (if they exist)
- Manual verification at multiple levels:
  - Build succeeds (no errors)
  - Files are in the right place
  - Generated output has correct structure
  - Visual/functional verification — **don't skip this**

**If a submodule Must Have fails:** identify which submodule is responsible and re-open that session with the failing test case. Do not proceed to integration verification until all submodule Must Haves pass.

### Step 2: Integration Verification (Level 2)

> Skip if single submodule.

- Run all Integration Test Must Haves from the TestPlan
- For each cross-submodule data flow: confirm A's actual output matches B's expected input
- For each error propagation case: trigger the failure and confirm the fallback behavior
- **Coverage check:** every pair of communicating submodules tested, every data type crossing boundaries tested

**If an integration Must Have fails:** identify which submodule boundary is broken. Re-open the responsible session(s) with the failing cross-module test case and actual vs expected output.

### Step 3: Environment Resolution

Before running E2E tests, determine the execution environment.

**Check the TestPlan for an Environment Spec:**

**A) Environment available** (user-provided or auto-provisioned):
   - All E2E tests will run inside the real environment via the exec command
   - This is the preferred path — real user-facing verification

**B) No environment available:**
   - Ask the user: *"A real environment would enable full E2E testing. Options:"*
     1. *"Provide one — give me a way to run commands (docker exec, SSH, local shell)"*
     2. *"I can set one up — I'll run the provision-environment phase"*
     3. *"Skip — proceed with local verification only"*
   - If user provides → record in Environment Spec, proceed as path A
   - If user wants auto-setup → run `provision-environment` phase, proceed as path A
   - If user declines → proceed to Step 4 without environment (local methods only)

### Step 4: E2E Verification (Level 3)

Execute every E2E User Flow from the TestPlan. This is the highest and most critical verification level — it tests what the user actually experiences.

#### Pre-flight: Coverage Check

Before executing, review the TestPlan's E2E coverage matrix:
- Confirm every user-facing capability has at least one E2E goal
- If gaps exist, flag them now — do not proceed with known coverage gaps unless they were explicitly justified in the TestPlan

#### With Environment

For each E2E User Flow in the TestPlan:
1. Execute the full user journey inside the environment via the exec command
2. **At each step, verify the outcome** — not just the final result. If step 3 of 5 produces wrong output, catch it at step 3.
3. Record per scenario: name, pass/fail per step, actual vs expected, observations

#### Without Environment

For each E2E User Flow in the TestPlan:
1. Execute using available local methods (CLI execution, file checks, HTTP calls to localhost, etc.)
2. Same step-by-step verification as above
3. Document limitations: what couldn't be verified without a real environment

#### Coverage Enforcement

- **Execute ALL E2E scenarios.** Do not cherry-pick or skip.
- After execution, update the coverage matrix with results (pass/fail per goal)
- If any scenario cannot be executed, document exactly why and flag it as a gap
- **Final coverage check:** if any user-facing capability has 0 passing E2E goals, verification fails

#### On E2E Failure

- Trace backward through the steps to identify where actual behavior diverged from expected
- Fix at the submodule level (re-enter implement → code-review if needed)
- Re-run **ALL** E2E scenarios after the fix — not just the failing one
- If environment was auto-provisioned: re-provision fresh before re-running (no stale state from the failed run)

#### Teardown

After all E2E tests complete (pass or fail):
- If environment was auto-provisioned (`auto_provisioned: true`): run teardown (stop/remove containers, clean up)
- If environment was user-provided: **do not touch it** — the user manages their own environment
- Teardown runs always, even on failure

### Pre-Delivery Checklist (Frontend Changes)

For any frontend work (UI, styling, routing, components), complete ALL 4 verification levels **in addition to the steps above**:

1. **Build succeeds** — No compilation errors
   ```bash
   npm run build
   ```

2. **Files in right place** — Check output directory
   ```bash
   ls -la dist/  # or out/ for Next.js export
   ```

3. **Generated HTML correct** — Verify paths and structure
   ```bash
   grep -r "href=" dist/  # Check links
   cat dist/index.html    # Spot check HTML
   ```

4. **Visual verification** — **MANDATORY - DO NOT SKIP**
   - Open built site in browser (localhost or file://)
   - Click through all interactive elements (tabs, buttons, links)
   - Verify styling (colors, spacing, hover effects)
   - Check responsive behavior (resize window)
   - Test all routes/pages
   - Document what you verified

When a real environment is available, visual verification can run inside the environment (e.g., headless browser in a container, screenshot capture via Puppeteer).

**Example documentation:**
```markdown
**Visual verification:**
- Opened http://localhost:3000
- Clicked all 7 tabs — content switches correctly
- Verified blog posts at /{slug} (not /blog/{slug})
- Checked hover effects on cards — gray border appears
- Tested responsive layout — works on mobile width
```

**Why this matters:** Build success doesn't mean it works. HTML can be correct but still broken in browser. Visual verification catches 80% of bugs before user sees them.

## Principles

- `principles/strategic-design.md` — Verification is an investment, not overhead

## Outputs
- Verification results per Must Have checkpoint
- E2E coverage matrix with pass/fail results
- Documentation of what was verified and how

## Quality Gate
- All submodule Must Have checkpoints pass (Level 1)
- All Integration Test Must Haves pass, if 2+ submodules (Level 2)
- All E2E scenarios from TestPlan executed — coverage matrix shows every user-facing capability has at least one passing E2E goal (Level 3)
- Every E2E scenario verified at each step, not just final outcome
- If environment was available: E2E ran inside real environment, not locally/mocked
- If environment was auto-provisioned: teardown completed
- Frontend changes pass all 4 verification levels
- Verification documented

## Skip Conditions
This phase is never skipped.
