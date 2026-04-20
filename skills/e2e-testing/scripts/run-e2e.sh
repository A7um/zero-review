#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
RUNTIME_DIR="${SKILL_ROOT}/runtime/autoenv"
BIN_DIR="${SKILL_ROOT}/bin"

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
  --mode <mock|prompt>         Verification strategy (default: mock)
  --extra-path <path>          Extra local tree to copy into the sandbox
  --output <path>              Output directory for artifacts
  --env KEY=value              Environment variable to inject (repeatable)
  --timeout <seconds>          Agent time budget
  --tag <tag>                  Branch or tag for remote GitHub repos
  --setup-base-image <image>   Override sandbox base image
  --verbose                    Stream runtime progress
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

uname_s="$(uname -s | tr '[:upper:]' '[:lower:]')"
uname_m="$(uname -m)"
case "${uname_m}" in
  arm64|aarch64) arch="arm64" ;;
  x86_64|amd64) arch="x64" ;;
  *)
    arch="${uname_m}"
    ;;
esac
platform="${uname_s}-${arch}"
binary_path="${BIN_DIR}/autoenv-${platform}"

if [[ -x "${binary_path}" ]]; then
  runner=("${binary_path}")
else
  if ! command -v bun >/dev/null 2>&1; then
    echo "No bundled binary found for ${platform} and Bun is not installed." >&2
    echo "Build one with skills/e2e-testing/scripts/build-binary.sh or install Bun." >&2
    exit 1
  fi

  if [[ ! -d "${RUNTIME_DIR}/node_modules" ]]; then
    (
      cd "${RUNTIME_DIR}"
      bun install
    )
  fi

  runner=(bun "${RUNTIME_DIR}/cli.ts")
fi

args=("test")

if [[ "${verbose}" -eq 1 ]]; then
  args+=("--verbose")
fi

args+=("--test-mode" "${mode}" "--test-output" "${output}")

if [[ -n "${timeout}" ]]; then
  args+=("--test-timeout" "${timeout}")
fi

if [[ -n "${tag}" ]]; then
  args+=("--tag" "${tag}")
fi

if [[ -n "${setup_base_image}" ]]; then
  args+=("--setup-base-image" "${setup_base_image}")
fi

if ((${#extra_paths[@]:-0})); then
  for extra_path in "${extra_paths[@]}"; do
    args+=("--test-path" "${extra_path}")
  done
fi

if ((${#env_vars[@]:-0})); then
  for env_var in "${env_vars[@]}"; do
    args+=("-e" "${env_var}")
  done
fi

args+=("${repo}" "${goal}")

exec "${runner[@]}" "${args[@]}"
