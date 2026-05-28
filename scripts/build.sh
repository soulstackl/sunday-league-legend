#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Building for production..."
npm run build
echo ""
echo "✓ Build complete"
echo "  Output: dist/ ($(du -sh dist/ 2>/dev/null | cut -f1 || echo '?'))"
