#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ ESLint..."
npx eslint src --max-warnings 0
echo "✓ No lint issues"
