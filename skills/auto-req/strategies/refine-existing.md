# Strategy: Refine Existing Specification

Use when the sponsor has already written something — a PRD, a design doc, a detailed description — but it needs structuring, gap-filling, or sharpening before dev agents can consume it.

## Process

### 1. Read the existing document completely

Don't skim. Read every section. Note:
- What's well-defined (clear goals, concrete criteria)
- What's vague (fuzzy language, unquantified expectations)
- What's missing (no success criteria, no scope boundary, no constraints)
- What's contradictory (conflicting requirements, incompatible constraints)

### 2. Map to contract structure

Walk through the `contracts/requirements-doc.md` schema field by field. For each field:
- **Present and clear**: extract directly
- **Present but vague**: flag for clarification
- **Missing**: flag as a gap

### 3. Compile clarification list

Group your questions by priority:
- **Blocking**: without this answer, confidence stays LOW
- **Important**: would raise confidence from MEDIUM to HIGH
- **Nice to have**: would improve the spec but work can proceed without

Present blocking questions first. Don't overwhelm with a list of 20 — batch into 3-5 targeted questions per round.

### 4. Resolve contradictions

If the existing doc contradicts itself, surface both sides explicitly: "Section A says X, but section B implies Y. Which is correct?" Don't silently pick one interpretation.

### 5. Structure the output

Rewrite into `templates/requirements-doc.md` format. Preserve the sponsor's original intent and language where it's clear. Replace vague language with specific criteria where you have enough information to do so.

### 6. Validate with sponsor

Present the structured version alongside the original. Highlight what you changed, what you added, and what you still need answers on.

## Quality Check

Before delivering, verify:
- [ ] Every change from the original is justified (gap-fill, clarification, or contradiction resolution)
- [ ] You didn't silently reinterpret ambiguous sections — you flagged them
- [ ] The structured output is traceable to the original document
- [ ] Contradictions are resolved, not hidden
