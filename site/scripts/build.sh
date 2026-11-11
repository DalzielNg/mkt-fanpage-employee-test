#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dist_root="$project_root/dist"

rm -rf "$dist_root"
mkdir -p "$dist_root/server" "$dist_root/.openai"

node "$project_root/scripts/build-worker.mjs" \
  "$project_root/worker/index.js" \
  "$project_root/site-assets" \
  "$dist_root/server/index.js"

cp "$project_root/.openai/hosting.json" "$dist_root/.openai/hosting.json"
