#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

repo="."
goal=""
mode="mock"
output=""
timeout=""
tag=""
setup_base_image=""
verbose=0

extra_paths=()
env_vars=()

usage() {
  cat <<'EOF'
Usage: run-e2e.sh --goal "<goal>" [options]

Options:
  --repo <path-or-url>         Repo to test (default: .)
  --goal "<goal>"              Concrete verification request
  --mode <mock|prompt>         Verification strategy for the agent (default: mock)
  --extra-path <path>          Extra local tree to copy into the sandbox
  --output <path>              Output directory for artifacts and run context
  --env KEY=value              Environment variable already supplied by the user
  --timeout <seconds>          Suggested agent time budget
  --tag <tag>                  Branch or tag for remote GitHub repos
  --setup-base-image <image>   Suggested sandbox base image
  --verbose                    Emit extra preparation details
EOF
}

require_value() {
  local flag="$1"
  local value="${2:-}"
  if [[ -z "${value}" ]]; then
    echo "Missing value for ${flag}" >&2
    usage >&2
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      require_value "$1" "${2:-}"
      repo="$2"
      shift 2
      ;;
    --goal)
      require_value "$1" "${2:-}"
      goal="$2"
      shift 2
      ;;
    --mode)
      require_value "$1" "${2:-}"
      mode="$2"
      shift 2
      ;;
    --extra-path)
      require_value "$1" "${2:-}"
      extra_paths+=("$2")
      shift 2
      ;;
    --output)
      require_value "$1" "${2:-}"
      output="$2"
      shift 2
      ;;
    --env)
      require_value "$1" "${2:-}"
      env_vars+=("$2")
      shift 2
      ;;
    --timeout)
      require_value "$1" "${2:-}"
      timeout="$2"
      shift 2
      ;;
    --tag)
      require_value "$1" "${2:-}"
      tag="$2"
      shift 2
      ;;
    --setup-base-image)
      require_value "$1" "${2:-}"
      setup_base_image="$2"
      shift 2
      ;;
    --verbose)
      verbose=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "${goal}" ]]; then
  echo "--goal is required" >&2
  usage >&2
  exit 1
fi

if [[ "${mode}" != "mock" && "${mode}" != "prompt" ]]; then
  echo "--mode must be mock or prompt" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for e2e-testing." >&2
  exit 1
fi

json_escape() {
  local value="${1:-}"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//$'\n'/\\n}"
  value="${value//$'\r'/\\r}"
  value="${value//$'\t'/\\t}"
  printf '%s' "${value}"
}

abspath_if_local() {
  local candidate="$1"
  if [[ "${candidate}" =~ ^https?:// ]] || [[ "${candidate}" =~ ^git@ ]]; then
    printf '%s' "${candidate}"
    return
  fi

  if [[ -d "${candidate}" ]]; then
    (
      cd "${candidate}"
      pwd
    )
    return
  fi

  if [[ -e "${candidate}" ]]; then
    (
      cd "$(dirname "${candidate}")"
      printf '%s/%s\n' "$(pwd)" "$(basename "${candidate}")"
    )
    return
  fi

  printf '%s' "${candidate}"
}

slug_source="${repo}"
if [[ "${repo}" == "." ]]; then
  slug_source="$(basename "$(pwd)")"
elif [[ "${repo}" == */* ]]; then
  slug_source="$(basename "${repo}")"
fi
slug="$(printf '%s' "${slug_source}" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9._-]+/-/g; s/^-+|-+$//g')"
if [[ -z "${slug}" ]]; then
  slug="repo"
fi

if [[ -z "${output}" ]]; then
  output="$(pwd)/.dev-output/e2e/${slug}-$(date +%Y%m%d-%H%M%S)"
fi

repo_resolved="$(abspath_if_local "${repo}")"
if [[ "${repo_resolved}" =~ ^https?:// ]] || [[ "${repo_resolved}" =~ ^git@ ]]; then
  repo_kind="remote"
else
  repo_kind="local"
fi

mkdir -p "${output}/artifacts"

report_json="${output}/report.json"
report_md="${output}/report.md"
demo_md="${output}/demo.md"
command_log="${output}/artifacts/command-log.txt"
run_context="${output}/run-context.json"

: > "${command_log}"

{
  printf '# E2E Verification Report\n\n'
  printf 'Status: `pending`\n\n'
  printf 'Goal: %s\n\n' "${goal}"
  printf 'The agent should replace this placeholder with the final evidence-backed report.\n'
} > "${report_md}"

{
  printf '# Demo\n\n'
  printf 'Replace this placeholder with the concise verification walkthrough.\n'
} > "${demo_md}"

{
  printf '{\n'
  printf '  "status": "pending",\n'
  printf '  "summary": "Run prepared. Agent must replace this placeholder with final results.",\n'
  printf '  "request": {\n'
  printf '    "goal": "%s",\n' "$(json_escape "${goal}")"
  printf '    "mode": "%s",\n' "$(json_escape "${mode}")"
  printf '    "repo": "%s"\n' "$(json_escape "${repo_resolved}")"
  printf '  },\n'
  printf '  "artifacts": {\n'
  printf '    "reportMd": "%s",\n' "$(json_escape "${report_md}")"
  printf '    "demoMd": "%s",\n' "$(json_escape "${demo_md}")"
  printf '    "commandLog": "%s"\n' "$(json_escape "${command_log}")"
  printf '  },\n'
  printf '  "nextSteps": [\n'
  printf '    "Read skills/e2e-testing/SKILL.md",\n'
  printf '    "Run the verification manually in a fresh Docker sandbox",\n'
  printf '    "Overwrite the placeholder artifacts with final evidence"\n'
  printf '  ]\n'
  printf '}\n'
} > "${report_json}"

{
  printf '{\n'
  printf '  "goal": "%s",\n' "$(json_escape "${goal}")"
  printf '  "mode": "%s",\n' "$(json_escape "${mode}")"
  printf '  "repo": "%s",\n' "$(json_escape "${repo_resolved}")"
  printf '  "repoKind": "%s",\n' "$(json_escape "${repo_kind}")"
  printf '  "outputDir": "%s",\n' "$(json_escape "${output}")"
  printf '  "reportJson": "%s",\n' "$(json_escape "${report_json}")"
  printf '  "reportMd": "%s",\n' "$(json_escape "${report_md}")"
  printf '  "demoMd": "%s",\n' "$(json_escape "${demo_md}")"
  printf '  "commandLog": "%s",\n' "$(json_escape "${command_log}")"
  printf '  "tag": "%s",\n' "$(json_escape "${tag}")"
  printf '  "timeoutSeconds": "%s",\n' "$(json_escape "${timeout}")"
  printf '  "setupBaseImage": "%s",\n' "$(json_escape "${setup_base_image}")"
  printf '  "verbose": %s,\n' "$([[ "${verbose}" -eq 1 ]] && printf 'true' || printf 'false')"
  printf '  "createdAt": "%s",\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  printf '  "extraPaths": [\n'
  for i in "${!extra_paths[@]}"; do
    resolved_path="$(abspath_if_local "${extra_paths[$i]}")"
    suffix=","
    if [[ "$i" -eq "$((${#extra_paths[@]} - 1))" ]]; then
      suffix=""
    fi
    printf '    "%s"%s\n' "$(json_escape "${resolved_path}")" "${suffix}"
  done
  printf '  ],\n'
  printf '  "envVars": [\n'
  for i in "${!env_vars[@]}"; do
    suffix=","
    if [[ "$i" -eq "$((${#env_vars[@]} - 1))" ]]; then
      suffix=""
    fi
    printf '    "%s"%s\n' "$(json_escape "${env_vars[$i]}")" "${suffix}"
  done
  printf '  ]\n'
  printf '}\n'
} > "${run_context}"

if [[ "${verbose}" -eq 1 ]]; then
  echo "Prepared run context at ${run_context}" >&2
fi

cat <<EOF
Prepared e2e run context.
OUTPUT_DIR=${output}
RUN_CONTEXT=${run_context}
REPORT_JSON=${report_json}
REPORT_MD=${report_md}
DEMO_MD=${demo_md}
COMMAND_LOG=${command_log}
EOF
