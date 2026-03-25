---
id: architecture
name: Architecture Design
inputs: [validated requirements, TestPlan document]
outputs: [architecture doc with component breakdown, data flow, complexity analysis]
optional: false
---

# Phase: Architecture Design

## Purpose
Design the system structure before any implementation. This is the developer's core job. Architecture docs prevent expensive rework by making structural decisions explicit before code is written.

## Design Framing

Complexity is the enemy of maintainable software. Every design decision should minimize:

- **Change amplification** — A simple change requires edits in many places. Good design localizes change: one decision, one place.
- **Cognitive load** — A developer must hold too much context to work safely. Deep modules hide complexity behind simple interfaces so callers need to know as little as possible.
- **Unknown unknowns** — It is not obvious what must change or what a developer needs to know. This is the worst symptom. Good design makes dependencies visible and contracts explicit.

**Design mindset:** Pull complexity down into modules — don't push it to callers. The right interface is the simplest one that lets callers accomplish their goals without knowing how. Make the right structural decisions before writing implementation details.

"Design it right the first time" — not because redesign is impossible, but because structural mistakes compound. Every new caller written against a leaky interface is one more place to fix later.

## Process

### Step 1 — Design Skeleton

1. **Identify modules and responsibilities** — What are the key components? What does each own? What is each module's one job?
2. **Define interfaces** — What is the minimal interface each module exposes? What does it hide? Apply the principle: interfaces should be simple, implementations can be complex.
3. **Load principle files** — Read all files in `principles/` and validate the skeleton against each dimension: Are modules deep? Is information hidden? Are layers clean? Is coupling minimized?
4. **Output skeleton** — Stubs, interfaces, type signatures, and module structure with inline comments explaining key design choices (what is hidden and why, what each interface encodes).

### Step 2 — Architecture Document

Write to: `{output_root}/designs/arch_{YYYYMMDD}_{slug}.md`

**Required sections:**
1. Problem statement (one paragraph)
2. Component breakdown — what are the pieces? (prefer plugin/microservice structure for parallelizability)
3. Data flow (ASCII diagram)
4. Technology choices + rationale (why these tools?)
5. Complexity estimate: S (hours) / M (day) / L (days) / XL (week+)
6. **TestPlan mapping** — for each submodule, list its Must Have checkpoints from the TestPlan
7. **Complexity analysis:**
   - Identify potential sources of complexity (dependencies, obscurity)
   - How the design minimizes change amplification
   - How the design reduces cognitive load
   - How the design avoids unknown unknowns
8. Test strategy

### Step 3 — Validate Design

For each module, check against the principle checklist:
- Does it leak internal details?
- Does it push complexity to callers?
- Are names precise and consistent?
- Are layers providing distinct abstractions?

**Check experience first:** Review your agent's memory or pattern files for reusable patterns before designing from scratch.

## Output Format

Start with a **Design Intent** block: 3-5 bullets covering the key modules, their interfaces, and major hiding decisions. Then output the architecture document.

**Design Intent format:**
```
## Design Intent

- [Module/component]: [what it owns and what its interface hides]
- [Key interface decision]: [why this shape, what caller is spared knowing]
- [Major hiding decision]: [what implementation detail is buried and why]
```

For **redesigns**: after the Design Intent block, include a brief **What Changed** note listing the specific design issues found in the original and how the redesign addresses each one.

**Key rules:**
- Language-agnostic output — match the language of the input file if redesigning, or use the most natural language for the description
- No placeholder comments like `# TODO: implement` — output working stubs
- If the description or existing code is too vague to design confidently, ask one clarifying question before proceeding

See `examples/code-design-output.md` for reference.

## Principles

All principle files inform architecture decisions:

- `principles/module-depth.md` — Deep vs shallow modules, interface simplicity, over-decomposition
- `principles/information-hiding.md` — Encapsulation, information leakage, temporal decomposition
- `principles/abstraction-layers.md` — Layer separation, pass-through methods, complexity placement
- `principles/cohesion-separation.md` — Together-or-apart decisions, code repetition, general-special mixing
- `principles/error-handling.md` — Exception proliferation, defining errors out of existence
- `principles/naming-obviousness.md` — Name precision, code clarity, consistency
- `principles/documentation.md` — Comment quality, abstraction documentation
- `principles/strategic-design.md` — Tactical vs strategic thinking, modification quality

## Outputs
- `{output_root}/designs/arch_{YYYYMMDD}_{slug}.md`

## Quality Gate
- Architecture doc contains all required sections
- Design Intent block is present with 3-5 bullets
- Complexity analysis addresses change amplification, cognitive load, and unknown unknowns
- TestPlan Must Haves are mapped to submodules
- Modules pass principle checklist validation

## Skip Conditions
Used in the `dev/architecture-first` paradigm. For enhancements use `impact-analysis`; for bugfixes and small additions this phase is not in the sequence.
