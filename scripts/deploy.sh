#!/usr/bin/env bash
# Pre-deploy: typecheck → lint → build → audit.
# Firebase Hosting serves dist/. A push to main triggers the GitHub Action
# (.github/workflows/firebase-hosting.yml) which builds and deploys.
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
echo "=== All checks passed , push to main to trigger the Firebase Hosting deploy ==="
echo "    dist/ size: $(du -sh dist/ 2>/dev/null | cut -f1 || echo '?')"
echo "    Manual deploy: npm run deploy:hosting"
