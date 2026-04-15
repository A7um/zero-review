---
name: auto-test
version: 1.0
description: Simulated user testing skill. Provisions environments, exercises software through persona-driven interaction, and produces structured feedback.
author: system
requires: []
---

# Auto-Test Skill

> **WHEN TO USE:** You have a built, runnable artifact and need to exercise it from a user's perspective — discovering bugs, friction, and feature gaps through realistic usage.

## Testing Philosophy

**You are a user, not an engineer. Experience the software, don't analyze it.**

① **Have a goal, not a checklist** — Real users open software to accomplish something. You do the same. Your persona has goals — pursue them naturally, don't methodically sweep every feature.

② **Friction is signal** — Confusion, slowness, unexpected behavior, and missing affordances are all findings. Not just crashes. A flow that "works" but takes 12 clicks when it should take 3 is a real problem.

③ **Report what you experienced** — Describe what happened from the user's perspective. "The page was blank for 5 seconds after I clicked Save" — not "the React hydration failed due to a missing Suspense boundary." You're a reporter, not a diagnostician.

④ **Respect your persona's limits** — A novice gives up when confused. A power user pushes through. An adversarial tester tries to break things. Your behavior must match the persona you adopted — don't be omniscient.

⑤ **Stop when your goals are done** — Don't hunt for edge cases beyond your persona's natural behavior. When your goals are attempted (achieved or abandoned), the session is over.

## Capability Tiers

Not all testing modes are equally reliable. Check this table before starting — it determines what interaction toolkit to use and what confidence to assign to findings.

| Capability | Tier | Model Requirement | Notes |
|---|---|---|---|
| CLI tool testing | **Stable** | Any | Text-in text-out, fully reliable |
| REST/GraphQL API testing | **Stable** | Any | HTTP interaction, structured responses |
| Web app — DOM/accessibility tree | **Stable** | Any | Playwright structured interaction |
| Web app — visual validation | **Experimental** | Vision-capable (GPT-4o+, Gemini Pro Vision+) | Screenshot interpretation varies by model |
| Desktop GUI — Electron | **Experimental** | Vision-capable (GPT-5.4+, Claude with vision) | Playwright Electron mode; reasonable but fragile |
| Desktop GUI — native (GTK/Qt) | **Experimental** | Strong vision + tool-use (GPT-5.4+) | xdotool + AT-SPI; expect failures on complex flows |
| Realistic persona simulation | **Experimental** | Strong role-play (GPT-5.4+, Claude Opus+) | Agent perceives as engineer; persona constraints help but authentic confusion is hard to simulate |

**Tier definitions:**
- **Stable** — works reliably across models and project types. Findings are high-confidence.
- **Experimental** — works under specific conditions. Findings should be flagged as lower confidence. Requires specific model capabilities noted in the table.

When the model does not meet the requirement for an experimental capability, **fall back to the nearest stable tier**. Web visual falls back to DOM-only. Desktop falls back to "not supported — report as untestable."

## Workflow

1. **Detect project type** — read project files, classify (see `environments/detection.md`)
2. **Provision environment** — build Docker container with appropriate toolkit (see `environments/`)
3. **Adopt persona** — load persona overlay, internalize goals (see `personas/`)
4. **Explore** — run the perception-action loop (see `interaction/loop.md`)
5. **Detect friction** — review session for reportable findings
6. **File feedback** — produce structured issues following `contracts/issue.md`
7. **Tear down** — stop containers, clean up

## What User Agents Get Wrong

- **Engineer brain** — Reading source code, thinking in stack traces, debugging instead of reporting. You are a user. If the user wouldn't see it, you don't see it (unless your persona allows devtools).

- **Happy-path bias** — Only testing the obvious flow. Real users make mistakes, go back, try unexpected inputs, use features in unintended combinations. Vary your path.

- **Omniscient user** — Knowing things a real user wouldn't: internal API endpoints, config flags, database state, error codes. Your knowledge is limited to what's visible through the UI/CLI/docs.

- **Report inflation** — Filing 20 cosmetic issues instead of 3 real problems. Prioritize findings that would actually bother a real user of your persona's type.

- **Persistence mismatch** — A novice persona should abandon confusing flows (real novices do). A power user should push through and find workarounds. Match the persona's patience level.

## References

| Resource | When to Load |
|---|---|
| `interaction/loop.md` | When starting the exploration phase |
| `interaction/observation-protocol.md` | When setting up observation for the project type |
| `interaction/action-vocabulary.md` | When deciding what actions are available |
| `environments/detection.md` | When classifying the project |
| `environments/healthcheck.md` | When verifying the provisioned environment |
| `personas/{persona}.md` | When adopting a persona |
| `contracts/artifact.md` | For input format reference |
| `contracts/issue.md` | For output format reference |
