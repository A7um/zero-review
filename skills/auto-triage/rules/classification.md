# Classification Rules

Map each issue to a work type and dev-agent paradigm.

## Type Mapping

| Issue signals | Work type | Paradigm |
|---|---|---|
| Something worked before and now doesn't | `bugfix` | `bugfix/hypothesis-driven` |
| Something doesn't work as documented or expected | `bugfix` | `bugfix/hypothesis-driven` |
| Crash, data loss, security vulnerability | `bugfix` | `bugfix/hypothesis-driven` |
| User wants capability that doesn't exist | `enhancement` | `enhancement/delta-design` |
| User wants existing capability to work differently | `enhancement` | `enhancement/delta-design` |
| Small, isolated addition that fits existing architecture | `addition` | `addition/lightweight` |
| Request implies a new system or major new subsystem | `greenfield` | `dev/architecture-first` |

## Ambiguous Cases

**Bug or feature?** If the software does something the user didn't expect, lean toward bug — unmet expectations are defects even if the code is "working as implemented." If the software explicitly doesn't support the requested behavior and never claimed to, it's a feature request.

**Enhancement or addition?** If it touches multiple existing modules or changes interfaces, it's an enhancement. If it adds one new thing without changing existing behavior, it's an addition.

**Enhancement or greenfield?** If more than 70% of the work is new code with new architecture decisions, treat it as greenfield even if it lives in an existing repo.

## Classification Output

For each issue, record:
```yaml
issue_id: string
type: bugfix | enhancement | addition | greenfield
paradigm: string
rationale: string           # One sentence: why this type and paradigm
```

## When to Escalate Instead of Classifying

- The issue describes a fundamental design disagreement, not a defect
- The issue requires domain expertise the agent doesn't have
- The issue is really a question, not a bug or feature request
- Multiple valid classifications exist and the choice affects priority significantly
