# Strategy: Extract from Issue or Feedback

Use when the starting material is a GitHub issue, a bug report, a feature request from a user agent, or any structured feedback that needs to be elevated into actionable requirements.

## Process

### 1. Read the issue as-is

Understand what was reported. For bug reports: what broke, what was expected, reproduction steps. For feature requests: what's wanted, why, what's the current workaround.

Don't correct or reinterpret yet — absorb the reporter's perspective first.

### 2. Separate observation from requirement

A bug report says "the page is blank after login." That's an observation. The requirement is: "After successful login, the user must see the dashboard within 2 seconds."

A feature request says "add dark mode." The requirement is: "Users can switch between light and dark color themes. The preference persists across sessions."

Extract the underlying requirement from the surface-level report.

### 3. Check completeness

Does the extracted requirement have:
- A clear goal (what should be true)?
- Acceptance criteria (how to verify)?
- Scope (just this, or does it imply related changes)?

If not, formulate specific questions. Check if the original issue or related issues contain the answers before escalating to the sponsor.

### 4. Assess scope

A single issue may imply:
- **One requirement**: straightforward — extract and structure
- **Multiple requirements**: split into separate goals with independent acceptance criteria
- **A requirement that's already covered**: check existing requirements docs — this might be a duplicate or a regression

### 5. Write usage scenarios

Derive a scenario from the issue's reproduction steps (for bugs) or desired workflow (for features). This becomes input for auto-test to verify the fix or feature later.

### 6. Structure the output

Format using `templates/requirements-doc.md`. Link back to the original issue in the document — traceability matters.

## Quality Check

Before delivering, verify:
- [ ] The requirement is a goal, not a bug description restated
- [ ] Acceptance criteria would catch a regression if the bug returned
- [ ] Scope is bounded — you extracted what was reported, not what you think should also be done
- [ ] The original issue is referenced for traceability
