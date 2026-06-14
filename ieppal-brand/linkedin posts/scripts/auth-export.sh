#!/usr/bin/env bash
# auth-export.sh
# Run this ONCE on your Mac to export your LinkedIn Playwright session into the
# workspace folder so the Claude sandbox can use it.
#
# Usage (from the repo root):
#   bash "ieppal-brand/linkedin posts/scripts/auth-export.sh"
#
# What it does:
#   1. Checks whether a session already exists at ~/.linkedin-playwright-state/auth.json
#   2. If not, launches a visible Chromium window so you can log in to LinkedIn
#   3. Saves the session to ~/.linkedin-playwright-state/auth.json (Mac home)
#   4. Copies it to this scripts/ folder as auth.json (sandbox-readable)
#
# After this runs you never need to touch auth.json again — just re-run this
# script if your session expires (~2 weeks).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAC_STATE="$HOME/.linkedin-playwright-state/auth.json"
WORKSPACE_STATE="$SCRIPT_DIR/auth.json"

echo ""
echo "=== LinkedIn auth-export ==="
echo ""

# ── Step 1: generate session if missing ─────────────────────────────────────
if [ ! -f "$MAC_STATE" ]; then
  echo "No session found at $MAC_STATE"
  echo "Launching browser for first-time LinkedIn login..."
  echo ""

  mkdir -p "$(dirname "$MAC_STATE")"

  # Run the original headful script to do the login interactively
  node "$SCRIPT_DIR/linkedin-draft.js" --login-only 2>&1 || true
  # Note: linkedin-draft.js handles the login flow when --login-only is passed;
  # if it doesn't exist yet, fall through to the manual instructions below.

  if [ ! -f "$MAC_STATE" ]; then
    echo ""
    echo "⚠️  Could not auto-generate session."
    echo "   Run the full script on your Mac once with a visible browser:"
    echo "     node \"$SCRIPT_DIR/linkedin-draft.js\" --text \"test\""
    echo "   Follow the login prompt, then re-run auth-export.sh."
    exit 1
  fi
fi

echo "✅ Session exists at: $MAC_STATE"

# ── Step 2: copy to workspace (sandbox-readable) ────────────────────────────
cp "$MAC_STATE" "$WORKSPACE_STATE"
echo "✅ Copied to workspace:  $WORKSPACE_STATE"
echo ""
echo "The Claude sandbox will now find auth.json automatically."
echo "Re-run this script if your LinkedIn session expires (~2 weeks)."
echo ""
