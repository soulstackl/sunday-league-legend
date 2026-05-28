#!/usr/bin/env bash
# Pre-deploy: typecheck → lint → build → audit.
# AWS Amplify reads from dist/ on push to main.
# Run locally to confirm the branch is ship-ready before pushing.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Sunday League Legend , pre-deploy checks ==="
echo ""

bash scripts/typecheck.sh
bash scripts/lint.sh
bash scripts/build.sh
bash scripts/audit.sh

echo ""
echo "=== All checks passed , push to main to trigger Amplify CI ==="
echo "    dist/ size: $(du -sh dist/ 2>/dev/null | cut -f1 || echo '?')"
