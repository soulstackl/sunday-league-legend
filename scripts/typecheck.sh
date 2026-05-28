#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ TypeScript check..."
npx tsc --noEmit
echo "✓ No type errors"
