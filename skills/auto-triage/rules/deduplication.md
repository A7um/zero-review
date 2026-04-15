# Deduplication Rules

Identify issues that describe the same underlying problem or overlap in scope. Merge them into a single work item with all source issues referenced.

## Duplicate Signals

**Strong indicators (likely duplicate):**
- Same reproduction steps with minor wording differences
- Same error message or behavior described from different user perspectives
- Same page/endpoint/command mentioned with the same failure mode
- One issue is a subset of another (e.g., "button doesn't work" vs. "entire form is broken" when the button is in that form)

**Weak indicators (possibly related, not duplicate):**
- Same area of the product but different symptoms
- Same error type but in different contexts
- Similar feature requests with different scope

## Process

1. **Group by area** — cluster issues by the part of the product they affect (page, endpoint, command, module)
2. **Compare within clusters** — look for strong duplicate signals
3. **Merge confirmed duplicates** — pick the most complete report as primary, reference others in `source_issue_ids`
4. **Flag uncertain cases** — mark as "possible duplicate" and let the dev agent or sponsor confirm

## Merge Rules

When merging duplicates into a single work item:
- **Title**: use the clearest description from any of the duplicates
- **Reproduction steps**: use the most detailed and complete set
- **Severity**: use the highest severity from any duplicate
- **Context**: combine unique context from all duplicates — different reporters may have observed different symptoms of the same cause
- **Traceability**: list all original issue IDs in `source_issue_ids`

## What Is NOT a Duplicate

- Two bugs in the same feature with different root causes
- A bug report and a feature request about the same area (the bug is "it's broken," the feature is "it should also do X")
- Issues that happen to have similar titles but describe different behavior
