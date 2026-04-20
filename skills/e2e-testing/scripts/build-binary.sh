#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
RUNTIME_DIR="${SKILL_ROOT}/runtime/autoenv"
BIN_DIR="${SKILL_ROOT}/bin"

if ! command -v bun >/dev/null 2>&1; then
  echo "Bun is required to build a bundled binary." >&2
  exit 1
fi

uname_s="$(uname -s | tr '[:upper:]' '[:lower:]')"
uname_m="$(uname -m)"
case "${uname_m}" in
  arm64|aarch64) arch="arm64" ;;
  x86_64|amd64) arch="x64" ;;
  *)
    echo "Unsupported architecture: ${uname_m}" >&2
    exit 1
    ;;
esac

case "${uname_s}" in
  darwin) bun_target="bun-darwin-${arch}" ;;
  linux) bun_target="bun-linux-${arch}" ;;
  *)
    echo "Unsupported operating system: ${uname_s}" >&2
    exit 1
    ;;
esac

mkdir -p "${BIN_DIR}"

(
  cd "${RUNTIME_DIR}"
  bun install
  bun build ./cli.ts --compile --target="${bun_target}" --outfile="${BIN_DIR}/autoenv-${uname_s}-${arch}"
)

chmod +x "${BIN_DIR}/autoenv-${uname_s}-${arch}"
echo "Built ${BIN_DIR}/autoenv-${uname_s}-${arch}"
