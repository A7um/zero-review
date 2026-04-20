#!/bin/bash
# Hook: SubagentStart — inject auto-dev skill context
# Triggered for: Bash, general-purpose, Plan subagents
set -euo pipefail

SKILL_ROOT="${CLAUDE_PLUGIN_ROOT}/skills/auto-dev"

if [[ ! -f "$SKILL_ROOT/SKILL.md" ]]; then
  exit 0  # Fail-open: skill not found, allow agent to proceed
fi

cat <<EOF
{
  "systemMessage": "Auto-Dev Platform available (zero-review plugin). Skills: auto-dev (build/fix software), auto-req (elicit requirements), auto-test (simulated user testing), e2e-testing (sandboxed Docker verification), auto-triage (issue classification and dispatch). Roles: dev-agent, req-agent, user-agent, triage-agent — see roles/ for SOUL.md and AGENTS.md. Each slash command activates the matching role or workflow before executing its skill. Contracts in contracts/ define cross-skill interfaces. Commands: /dev, /dev-new, /dev-fix, /dev-enhance, /dev-add, /e2e, /req, /test, /triage."
}
EOF

exit 0
