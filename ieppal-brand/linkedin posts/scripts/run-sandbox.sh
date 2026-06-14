#!/usr/bin/env bash
# run-sandbox.sh
# Post a LinkedIn draft from the Claude sandbox.
#
# Usage:
#   bash "ieppal-brand/linkedin posts/scripts/run-sandbox.sh" \
#        "ieppal-brand/linkedin posts/01-drafts/your-post.md"
#
# The script:
#   1. Resolves paths relative to the repo root (works from any cwd)
#   2. Checks that auth.json is present
#   3. Runs linkedin-draft.js with the correct NODE_PATH so require('playwright') resolves
#   4. Passes the .md file directly — frontmatter stripping is handled inside the JS

set -e

# ── Resolve repo root ────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"   # scripts/ → linkedin posts/ → ieppal-brand/ → ieppal-overview/

# ── Args ─────────────────────────────────────────────────────────────────────
DRAFT_FILE="${1:-}"
if [ -z "$DRAFT_FILE" ]; then
  echo "Usage: bash run-sandbox.sh \"ieppal-brand/linkedin posts/01-drafts/your-post.md\""
  exit 1
fi

# Resolve to absolute path (support both absolute and repo-relative)
if [[ "$DRAFT_FILE" != /* ]]; then
  DRAFT_FILE="$REPO_ROOT/$DRAFT_FILE"
fi

if [ ! -f "$DRAFT_FILE" ]; then
  echo "❌ Draft file not found: $DRAFT_FILE"
  exit 1
fi

# ── Auth check ───────────────────────────────────────────────────────────────
AUTH_FILE="$SCRIPT_DIR/auth.json"
if [ ! -f "$AUTH_FILE" ]; then
  echo ""
  echo "❌ No auth.json found at: $AUTH_FILE"
  echo "   Run on your Mac first:"
  echo "     bash \"ieppal-brand/linkedin posts/scripts/auth-export.sh\""
  echo ""
  exit 1
fi

echo ""
echo "=== LinkedIn draft runner (sandbox) ==="
echo "Draft : $DRAFT_FILE"
echo "Auth  : $AUTH_FILE"
echo ""

# ── Run ──────────────────────────────────────────────────────────────────────
NODE_PATH="$SCRIPT_DIR/node_modules" \
PLAYWRIGHT_BROWSERS_PATH="$SCRIPT_DIR/.playwright-browsers" \
  node "$SCRIPT_DIR/linkedin-draft.js" "$DRAFT_FILE"
