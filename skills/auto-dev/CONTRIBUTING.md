# Contributing to Auto-Dev Skill

## How to Add a New Paradigm

1. If new phases are needed: copy `phases/_template.md` (or use existing phases as reference), fill in
2. Copy `paradigms/_template.md` to `paradigms/{task-type}/{name}.md`
3. List the phase sequence and any overrides/composition rules
4. Add a row to the Paradigms table in `SKILL.md`
5. Add the task type mapping to `config/defaults.json`

## How to Compose Paradigms

When combining two paradigms (e.g., architecture-first + TDD):
1. Read both paradigm files
2. If a `Composition Rules` section exists for the combination, use the explicit merged sequence
3. Otherwise: union of phases, validate-requirements first, deliver last, others ordered by input/output dependencies
4. Phase overrides from both apply; conflicts flagged to coordinator

## Output Locations

> `{output_root}` defaults to `.dev-output/` at the project root. Override it in `config/defaults.json` if needed.

**Note:** For S/M complexity tasks, in-context design (structured markdown in the conversation or plan-mode file) is preferred over file-based artifacts. File-based output in `.dev-output/` is recommended only for L/XL complexity tasks that need persistent design artifacts.

**Setup:** Add `.dev-output/` to your project's `.gitignore` — skill outputs should not be committed.

- **Architecture Docs:** `{output_root}/designs/arch_{YYYYMMDD}_{slug}.md`
- **Impact Analysis Docs:** `{output_root}/designs/impact_{YYYYMMDD}_{slug}.md`
- **Diagnosis Docs:** `{output_root}/designs/diagnosis_{YYYYMMDD}_{slug}.md`
- **TestPlans:** `{output_root}/designs/testplan_{YYYYMMDD}_{slug}.md`
- **Contracts:** `{output_root}/contracts/{module}.{ext}`
- **Implementations:** `{output_root}/implementations/{slug}/`
