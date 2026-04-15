# Template: Usage Scenarios

Standalone scenario format for direct consumption by auto-test personas. Use when scenarios need to be passed to user agents independently of the full requirements doc.

---

```yaml
scenarios:
  - id: S-001
    title: string
    persona: novice | power-user | adversarial | custom
    context: string               # What the user already knows or has done before this scenario
    goal: string                  # What the user is trying to accomplish
    entry_point: string           # Where the user starts (URL, command, screen)
    steps:
      - action: string            # What the user does
        expected: string          # What the user expects to happen
    success_condition: string     # How the user knows they're done
    failure_signals:              # What would make this user give up or report a problem
      - string
```

## Guidelines

- Steps describe **user actions**, not system behavior. "Click the Submit button" not "POST request is sent to /api/submit."
- Expected outcomes describe **what the user sees**, not what the system does. "A confirmation message appears" not "a 200 response is returned."
- Failure signals help auto-test recognize when friction has occurred, even if the flow technically "works."
- Persona choice affects how the scenario plays out — a novice may abandon at a confusing step; a power user may work around it.
