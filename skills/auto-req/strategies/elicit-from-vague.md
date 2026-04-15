# Strategy: Elicit from Vague Input

Use when the starting material is conversational, incomplete, or hand-wavy — "make it better," "I need a feature for X," a few sentences in a chat message.

## Process

### 1. Extract the seed

Read the raw input. Identify:
- **Who** is this for? (user type, persona, audience)
- **What** do they want to happen? (observable outcome, not mechanism)
- **Why** does it matter? (business value, user pain, opportunity)

If any of these are missing, that's your first clarification.

### 2. Generate candidate goals

From the seed, draft 2-5 candidate goals. Each should be:
- Outcome-oriented ("users can X" not "build a Y")
- Independent (one goal per statement)
- Testable or demonstrable

Present these to the sponsor: "Here's what I think you're asking for. Which of these are right? What's missing?"

### 3. Define the boundary

For each confirmed goal, establish:
- **In scope**: what this goal includes
- **Out of scope**: what it explicitly does not include (non-goals)
- **Constraints**: technical, timeline, budget, regulatory

If the sponsor hasn't mentioned constraints, ask: "Are there any technical requirements, deadlines, or limitations I should know about?"

### 4. Write acceptance criteria

For each goal, write 1-3 acceptance criteria. Each criterion must be verifiable — describe how you'd check it. If you can't write a criterion, the goal is still too vague. Go back to step 2.

### 5. Draft usage scenarios

Write 1-2 usage scenarios per goal. These describe how a specific persona would experience the feature. Keep them grounded in the goals — don't expand scope through scenarios.

### 6. Assess and deliver

Run the confidence assessment from SKILL.md. If MEDIUM or HIGH, structure the output using `templates/requirements-doc.md`. If LOW, compile your specific questions and escalate.

## Quality Check

Before delivering, verify:
- [ ] Every goal came from the sponsor, not from your imagination
- [ ] No implementation decisions leaked into requirements
- [ ] Every acceptance criterion is verifiable
- [ ] Non-goals are stated, not just implied
- [ ] Usage scenarios illustrate goals without expanding them
