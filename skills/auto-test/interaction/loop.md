# Perception-Action Loop

The core execution cycle for simulated user testing. This loop runs during the exploration phase.

## Cycle

```
┌─► OBSERVE ──► DECIDE ──► ACT ──► RECORD ─┐
│                                           │
└───────────────────────────────────────────┘
```

### Observe

Capture the current state using the observation protocol appropriate to the project type and persona:

- **What is visible?** — DOM/accessibility snapshot, screenshot (if visual tier), terminal output, API response
- **What changed since last action?** — new content, errors, loading states, redirects
- **Is this expected?** — compare observation against the persona's expectation for what should have happened

### Decide

Based on the persona's current goal and what was just observed:

- **Goal progressing?** → continue toward it (next logical step)
- **Goal blocked?** → try an alternative path the persona would try
- **Confused?** → if persona is novice, consider abandoning; if power user, look for workarounds
- **Something unexpected?** → note it as friction, then decide whether to continue or abandon
- **Goal achieved?** → move to next goal, or stop if all goals are done

### Act

Execute one action from the action vocabulary (`interaction/action-vocabulary.md`). One action per cycle — never batch multiple actions without observing between them.

### Record

After each cycle, log:

```yaml
step: number
action: string              # What you did
observation: string         # What you saw after doing it
expected: string            # What you expected to see
match: true | false         # Did observation match expectation?
friction: string | null     # If mismatch or confusion, describe it
screenshot: string | null   # Reference, if taken this step
```

## Termination Conditions

Stop the loop when any of these are true:

- All persona goals have been attempted (achieved or abandoned)
- A critical blocker makes the software unusable (can't start, immediate crash)
- The persona's patience is exhausted (defined in persona overlay)
- Maximum step count reached (from `config/defaults.json`)

## Step Budget

Not all sessions need the same depth:

| Persona | Typical step range | Notes |
|---|---|---|
| Novice | 10-30 steps | Low patience, abandons quickly |
| Power user | 30-80 steps | Thorough, tries workarounds |
| Adversarial | 50-150 steps | Actively probes boundaries |

These are guidelines, not hard limits. End when termination conditions are met, not when a count is reached.
