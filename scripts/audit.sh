#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Security audit..."
npm audit --audit-level moderate
echo "✓ No moderate+ vulnerabilities"
