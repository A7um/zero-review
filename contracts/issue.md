# Contract: Issue

Structured feedback from simulated user testing. Each issue represents one reportable finding — a bug or a feature gap.

**Producer:** `auto-test`
**Consumer:** `auto-triage`

## Schema

```yaml
id: string                        # Auto-generated: BUG-001, FEAT-001, ...
type: bug | feature-request
title: string                     # One line, from the user's perspective
severity: critical | major | minor | cosmetic   # Bugs only
priority_hint: string             # Suggestion, not authoritative — triage decides

persona: string                   # Which persona discovered this
session_id: string                # Links back to the full session log

description: string               # What happened or what's missing, in the persona's voice

reproduction:                     # Bugs only
  preconditions:
    - string                      # State before the issue (logged in, on page X, etc.)
  steps:
    - string                      # Exact actions taken
  expected: string                # What should have happened
  actual: string                  # What did happen
  frequency: always | sometimes | once

environment:                      # Captured automatically
  project_type: string            # web | cli | api | desktop
  docker_image: string            # Image used for testing
  toolkit: string                 # playwright | shell | http-client
  observation_tier: string        # stable | experimental

context:                          # Optional supporting evidence
  screenshots: [string]           # Paths or references
  console_errors: [string]        # Only if persona permits (adversarial, power-user)
  network_failures: [string]      # Only if persona permits
  response_times:                 # key: duration pairs
    endpoint_or_action: string
    duration_ms: number
```

## Rules

- Title must describe the user's experience, not a technical root cause. "Page is blank after login" not "React hydration error in AuthProvider."
- `reproduction.steps` must be concrete actions, not code. "Click the Sign Up button" not "call POST /api/signup."
- `console_errors` and `network_failures` are only populated when the persona's observation permissions allow it (see auto-test persona definitions).
- `severity` is the reporter's assessment. Triage may override.
- `priority_hint` is a suggestion based on persona impact. Triage makes the final call.
