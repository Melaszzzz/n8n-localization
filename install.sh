#!/bin/sh
set -eu

project_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if ! command -v node >/dev/null 2>&1; then
  echo "未找到 Node.js。npm 方式安装的 n8n 通常已经附带 Node.js，请确认 node 命令可用。" >&2
  exit 1
fi

exec node "$project_directory/scripts/install-existing-n8n.mjs" "$@"
