#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3112}"
OUTPUT_PATH="${1:-$ROOT_DIR/docs/app-screenshot.png}"

cd "$ROOT_DIR"

SERVER_PID=""
cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

PORT="$PORT" node server.js >/tmp/pomodoro_screenshot.log 2>&1 &
SERVER_PID=$!
sleep 1

npx -y playwright@1.52.0 screenshot --device="Desktop Chrome" "http://127.0.0.1:${PORT}" "$OUTPUT_PATH"

echo "Updated screenshot: $OUTPUT_PATH"
