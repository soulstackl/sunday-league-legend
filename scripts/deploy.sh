#!/usr/bin/env bash
# Pre-deploy: typecheck → lint → build → audit.
# Hosting is Firebase Hosting (site: sunday-league-legend, project:
# soapy-saxons-fc-frontend). Deploys are manual: run `npm run deploy:hosting`.
# Run this first to confirm the branch is ship-ready.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Sunday League Legend , pre-deploy checks ==="
echo ""

bash scripts/typecheck.sh
bash scripts/lint.sh
bash scripts/build.sh
bash scripts/audit.sh

echo ""
echo "=== All checks passed ==="
echo "    dist/ size: $(du -sh dist/ 2>/dev/null | cut -f1 || echo '?')"
echo "    Deploy with: npm run deploy:hosting"
