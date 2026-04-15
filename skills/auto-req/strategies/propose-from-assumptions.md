# Strategy: Propose from Assumptions

Use when the starting material is vague or conversational and you want to minimize back-and-forth with the sponsor. Instead of pulling answers through questions, push concrete proposals for the sponsor to select from.

## Process

### 1. Extract the seed

Read the raw input. Identify what is stated:
- **Who** is this for?
- **What** do they want to happen?
- **Why** does it matter?

Don't ask yet. Work with what you have.

### 2. Research the community (if --research)

If the `--research` flag was passed, search the broader community for similar features and requests across projects. Look for:
- Common implementations and what users liked or disliked
- Recurring complaints and edge cases
- Acceptance criteria that real users cared about
- Scope boundaries other projects learned the hard way

Use findings to inform steps 3–5. See the Community Research section in SKILL.md for tool guidance.

### 3. Identify uncertainties

List every dimension where the sponsor's input leaves room for interpretation. Common uncertainty dimensions:

- **Scope**: minimal viable vs. full-featured
- **Target users**: specific persona vs. all users
- **Behavior**: what happens at edges (errors, empty states, conflicts)
- **Constraints**: performance targets, platform support, accessibility level
- **Integration**: standalone vs. deeply integrated with existing features

For each uncertainty, state what is unknown and why it matters for the requirements.

### 4. Make assumptions

For each uncertainty, generate 2–3 plausible assumptions ranked by likelihood. Base these on:
- The sponsor's wording and context (strongest signal)
- Community research findings (if available)
- Your own knowledge of how similar features typically work
- Project context (existing codebase, tech stack, user base)

Label each assumption clearly: what you're assuming, and what changes if the assumption is wrong.

### 5. Generate Top-N proposals

Combine assumptions into distinct, coherent proposals. Each proposal is a **complete requirements draft** — not a fragment. Aim for the number specified by the `--proposals` parameter if provided, otherwise use the value in `config/defaults.json` (`max_proposals`, default 3).

Guidelines for proposal generation:
- **Proposal A** — the most likely interpretation. Conservative scope, mainstream assumptions.
- **Proposal B** — a plausible alternative. Different scope or different target audience.
- **Proposal C** (if warranted) — an ambitious interpretation. Broader scope, more edge cases covered.

Each proposal must include:
- A one-sentence summary of the key assumptions it makes
- Goals with acceptance criteria (following `contracts/requirements-doc.md`)
- Explicit non-goals (what this proposal intentionally excludes)
- At least one usage scenario

Proposals should differ meaningfully — not just in one minor detail. If two proposals would be nearly identical, merge them and reduce the count.

### 6. Present to sponsor

Deliver all proposals in a single response. Format:

1. **Assumption summary table** — one row per uncertainty, showing how each proposal resolves it
2. **Full proposals** — each one a complete requirements draft the sponsor could approve as-is
3. **Recommendation** — which proposal you'd pick and why (one sentence)

Ask the sponsor: "Which proposal is closest? What would you change?"

### 7. Refine and deliver

Take the sponsor's selection and feedback. Merge their adjustments into the chosen proposal. Run the confidence assessment from SKILL.md. Structure the final output using `templates/requirements-doc.md`.

## Quality Check

Before delivering proposals, verify:
- [ ] Every uncertainty is real — you didn't manufacture ambiguity to justify more proposals
- [ ] Assumptions are plausible and ranked, not random
- [ ] Proposals differ meaningfully from each other
- [ ] Each proposal is complete enough that a sponsor could approve it without further questions
- [ ] Community research findings (if used) are attributed, not silently woven in
- [ ] No proposal smuggles in requirements the sponsor didn't hint at
