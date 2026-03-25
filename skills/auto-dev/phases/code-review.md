---
id: code-review
name: Code Review
inputs: [implementation files or diffs]
outputs: [review findings, addressed issues]
optional: false
---

# Phase: Code Review

## Purpose
Review code for long-term maintainability concerns. Focus on structural and design quality — not bugs, correctness, or style. Mandatory before marking any implementation complete.

## Complexity Framing

Complexity is anything about the structure of a software system that makes it hard to understand and modify. It is the central enemy of maintainability. It shows up in three ways:

- **Change amplification** — A simple change requires edits in many places. Example: a background color is hardcoded in every page template instead of defined once in a shared config. Changing the color means touching every file.

- **Cognitive load** — A developer must hold too much context to work safely. Example: a function allocates memory and returns a pointer, expecting the caller to free it. Every caller must remember this invisible contract or leak memory. Note: more lines of code does not always mean more complexity — a longer but clearer approach can have lower cognitive load than a terse but opaque one.

- **Unknown unknowns** — It is not obvious what must change or what the developer needs to know. This is the worst symptom. Example: a site uses a shared `bannerBg` variable, but a few pages also compute a darker accent from it with a hardcoded formula. Changing `bannerBg` silently breaks those pages, and nothing tells the developer they exist.

These symptoms arise from two root causes:

- **Dependencies** — Code that cannot be understood or modified in isolation. A method signature creates a dependency between its implementation and every caller. Dependencies are unavoidable, but good design minimizes their number and makes the remaining ones simple and obvious.

- **Obscurity** — Important information is not apparent. A variable named `time` with no documented unit, or an error table that must be updated whenever a new status code is added but has no visible link to the status enum. Obscurity often combines with dependencies to create unknown unknowns.

Complexity is incremental — it accumulates from many small decisions, not a single catastrophic error. Review with this in mind: each piece of code either adds a small amount of complexity or reduces it.

## Input Resolution

Determine what to review:

1. **No argument** (empty) — Review staged + unstaged + untracked git changes. Use `git diff HEAD` and `git ls-files --others --exclude-standard` to gather the changes.
2. **File or directory path** (valid path) — Review that file or recursively review files in that directory.
3. **Commit hash** (matches a git commit) — Review that commit's diff using `git show`.
4. **Branch range** (contains `..`, e.g. `main..feature`) — Review the branch diff using `git diff`.
5. **PR number** (starts with `#`) — Fetch the PR diff using `gh pr diff` (strip the `#`).

Read the resolved code before reviewing. For diffs, focus the review on the changed code but use surrounding context to evaluate design decisions.

## Review Process

1. Resolve the input and read the code to review.
2. Load all principle files from `principles/` to inform the review.
3. Analyze the code through each review dimension, looking for the red flags described in the principle files.
4. Rank findings by severity — how much complexity they introduce or will introduce over time.
5. Select the most impactful issues. Limit output to roughly 5 issues; for very large diffs, focus on the top issues by complexity impact.
6. Format the output following the example in `examples/code-review-output.md`.

**Prioritization order:** change amplification > cognitive load > obscurity.

**Addressing issues:** All identified issues must be addressed before delivery. If you disagree with a finding, document why in the commit message — but do not skip the review.

## Pre-Delivery Checklist

Use this before marking any implementation complete:

- [ ] **Change amplification:** Can I make common changes in one place?
- [ ] **Cognitive load:** Can I understand each module without holding the entire system in my head?
- [ ] **Unknown unknowns:** Is it obvious what needs to change when requirements change?
- [ ] **Dependencies:** Can each module be understood in isolation?
- [ ] **Obscurity:** Is important information apparent without digging?
- [ ] **Deep modules:** Do interfaces hide complexity?
- [ ] **Information hiding:** Are implementation details encapsulated?
- [ ] **Abstraction layers:** Does each layer provide a clear, distinct abstraction?
- [ ] **Strategic design:** Did I invest in design rather than take shortcuts?

## Lessons from Experience

Agents should consult their own memory or pattern files for project-specific lessons. Common anti-patterns to watch for during review:

- **Mixed abstraction levels** — e.g., using filesystem path APIs to generate web URLs. Always test the actual generated output, not just the build process.
- **Implicit contracts** — caller must "just know" something about the callee's behavior that isn't encoded in the interface.
- **Stringly-typed data** — using raw strings where structured types would prevent bugs.
- **Copy-paste with slight variation** — signals a missing abstraction or parameterization opportunity.

## Output Format

Start with a header stating what was reviewed, then list issues ranked by severity.

**Format each issue as a bold-prefixed paragraph (NOT a markdown list item):**
```
**N. [Tag]** Short title — `file:path:SymbolOrLine`
Description of the problem and its impact (1-2 sentences).
**Suggestion:** Specific suggestion for this codebase.
```

Separate each issue with a blank line.

**Key rules:**
- Use `**N. [Tag]**` bold prefix — do NOT use markdown numbered list syntax (`1.` at line start)
- No indentation — all lines start at column 0
- Use predefined tags from principle files or create custom tags (e.g., [Hardcoded Dependency])
- Do NOT add summary statistics or section dividers

If there are nearly no issues, give brief positive feedback.

See `examples/code-review-output.md` for reference.

## Review Dimensions

Load these principle files for the full set of red flags and issue tags:

- `principles/module-depth.md` — Deep vs shallow modules, interface simplicity, over-decomposition
- `principles/information-hiding.md` — Encapsulation, information leakage, temporal decomposition
- `principles/abstraction-layers.md` — Layer separation, pass-through methods, complexity placement
- `principles/cohesion-separation.md` — Together-or-apart decisions, code repetition, general-special mixing
- `principles/error-handling.md` — Exception proliferation, defining errors out of existence
- `principles/naming-obviousness.md` — Name precision, code clarity, consistency
- `principles/documentation.md` — Comment quality, abstraction documentation
- `principles/strategic-design.md` — Tactical vs strategic thinking, modification quality

## Principles

All principle files in `principles/` apply to this phase.

## Outputs
- Review findings with ranked issues
- All issues addressed before moving to next phase

## Quality Gate
- Review has been performed
- All identified issues are addressed (or documented justification for disagreement)
- Pre-delivery checklist passes

## Skip Conditions
This phase is never skipped. Code quality review is mandatory before delivery.
