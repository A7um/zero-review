---
id: impact-analysis
name: Impact Analysis (Delta Design)
inputs: [validated requirements, existing codebase]
outputs: [impact doc with change summary, affected modules, interface changes, integration points, risk]
optional: false
---

# Phase: Impact Analysis (Delta Design)

## Purpose

Replace full architecture design for tasks that modify an existing codebase. Map what exists, design the delta, and document the impact — no more, no less.

## Process

### Step 1 — Map Existing Structure

Read relevant modules, interfaces, and data flows. Understand:
- What modules exist and what they own
- Current interfaces and contracts
- Data flow through the affected area
- Test coverage of the affected area

**Check experience first:** Review your agent's memory or pattern files for prior work on these modules.

### Step 2 — Design the Delta

For each change:
- What module does it affect?
- What interface changes are needed (if any)?
- What existing behavior must be preserved?
- What new behavior is introduced?

### Step 3 — Write Impact Doc

Write to: `{output_root}/designs/impact_{YYYYMMDD}_{slug}.md`

**Required sections:**
1. Change summary (one paragraph)
2. Affected modules/files
3. Interface changes (list each change; "none" is valid)
4. Integration points (where new code touches existing code)
5. Risk assessment (what could break)
6. Complexity estimate (S / M)

If complexity is L or above → escalate to `dev/architecture-first` paradigm.

## Principles

- `principles/information-hiding.md` — Don't break existing encapsulation
- `principles/cohesion-separation.md` — New code goes in the right module
- `principles/module-depth.md` — Don't make interfaces wider than necessary

## Outputs
- `{output_root}/designs/impact_{YYYYMMDD}_{slug}.md`

## Quality Gate
- All affected modules identified
- Interface changes are explicit (or explicitly "none")
- Integration points documented
- Risk assessment present
- Complexity is S or M (otherwise escalate)

## Skip Conditions
Used in the `enhancement/delta-design` paradigm. For greenfield projects use `architecture`; for bugfixes and small additions this phase is not in the sequence.
