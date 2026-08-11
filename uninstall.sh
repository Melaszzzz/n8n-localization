#!/bin/sh
set -eu

project_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found." >&2
  exit 1
fi

exec node "$project_directory/scripts/install-existing-n8n.mjs" --uninstall "$@"
