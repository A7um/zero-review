#!/bin/bash
# Hook: SubagentStart — inject software development skill context
# Triggered for: Bash, general-purpose, Plan subagents
set -euo pipefail

SKILL_ROOT="${CLAUDE_PLUGIN_ROOT}/skills/auto-dev"

if [[ ! -f "$SKILL_ROOT/SKILL.md" ]]; then
  exit 0  # Fail-open: skill not found, allow agent to proceed
fi

cat <<EOF
{
  "systemMessage": "Auto-Dev Skill available (zero-review plugin). When the task involves building, modifying, or fixing software, follow the workflow in the auto-dev skill. Classify: greenfield → /dev-new, bugfix → /dev-fix, enhancement → /dev-enhance, small addition → /dev-add. Or use /dev to auto-classify."
}
EOF

exit 0
