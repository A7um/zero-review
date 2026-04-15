# Prioritization Rules

Assign priority based on user impact and technical severity. Priority has two components: the agent assesses severity; the sponsor confirms business priority for P0/P1.

## Priority Levels

| Priority | Meaning | SLA expectation | Sponsor approval |
|---|---|---|---|
| **P0** | Production broken for many users, data loss, security breach | Immediate — next work item | Required |
| **P1** | Significant user impact, major feature broken, no workaround | Next cycle | Required |
| **P2** | Real problem with workaround, or meaningful feature gap | Scheduled | Not required |
| **P3** | Cosmetic, minor friction, nice-to-have improvement | Backlog | Not required |

## Severity Assessment Matrix

| | Many users affected | Few users affected |
|---|---|---|
| **No workaround** | P0 (if data loss/security) or P1 | P1 or P2 |
| **Workaround exists** | P2 | P2 or P3 |
| **Cosmetic only** | P3 | P3 |

## Adjustments

- **Regression**: bump up one level — something that used to work is worse than something that never worked
- **Security**: always P0 or P1 regardless of user count
- **Data loss**: always P0
- **Blocks other work**: bump up one level if other work items depend on this fix
- **Sponsor-flagged**: if the sponsor explicitly cares, respect their priority even if the matrix says otherwise

## Priority Rationale

Every priority assignment must include a one-sentence rationale:

```
P1 — Login fails for all users on mobile, no workaround. Regression from v2.3.
P3 — Footer alignment is off by 2px on wide screens. Cosmetic.
```

## When to Escalate

- Any P0 — always notify sponsor immediately
- P1 when conflicting with another P1 — sponsor decides ordering
- When severity assessment and business impact disagree — e.g., technically minor but sponsor's top customer is affected
