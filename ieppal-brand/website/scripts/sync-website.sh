#!/bin/bash
# =============================================================================
# IEP Pal — Website Sync Script
# Run this from Terminal at the start of any session involving the website.
# Usage: bash ~/Desktop/ieppal-overview/ieppal-brand/website/scripts/sync-website.sh
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBSITE_DIR="$(dirname "$SCRIPT_DIR")/Ian-ieppal-website"
WEBSITE_REPO="git@github.com:I-ala-Wilson/Ian-ieppal-website.git"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════╗"
echo "║    IEP Pal — Website Sync            ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ─── STEP 1: GitHub SSH Auth ─────────────────────────────────────────────────
echo "🔐 Checking GitHub SSH auth..."

if [ ! -f "$HOME/.ssh/id_ed25519" ] && [ ! -f "$HOME/.ssh/id_rsa" ]; then
  echo ""
  echo -e "${YELLOW}⚠️  No SSH key found. Generating one now...${NC}"
  ssh-keygen -t ed25519 -C "ansel.natarajan@gmail.com" -f "$HOME/.ssh/id_ed25519" -N ""
  eval "$(ssh-agent -s)" > /dev/null
  ssh-add "$HOME/.ssh/id_ed25519"
  echo ""
  echo -e "${GREEN}✅ SSH key generated!${NC}"
  echo ""
  echo "══════════════════════════════════════════════════"
  echo "  ACTION REQUIRED — Add this key to GitHub:"
  echo "══════════════════════════════════════════════════"
  echo ""
  cat "$HOME/.ssh/id_ed25519.pub"
  echo ""
  echo "  1. Copy the key above"
  echo "  2. Go to: https://github.com/settings/ssh/new"
  echo "  3. Paste it and save"
  echo ""
  read -p "  Press Enter once you've added the key to GitHub..."
  echo ""
else
  eval "$(ssh-agent -s)" > /dev/null 2>&1 || true
  ssh-add "$HOME/.ssh/id_ed25519" 2>/dev/null || ssh-add "$HOME/.ssh/id_rsa" 2>/dev/null || true
fi

# Test GitHub auth
echo "Testing GitHub connection..."
SSH_TEST=$(ssh -T git@github.com -o ConnectTimeout=10 2>&1 || true)
if echo "$SSH_TEST" | grep -q "successfully authenticated"; then
  echo -e "${GREEN}✅ GitHub SSH auth working${NC}"
else
  echo -e "${RED}❌ GitHub SSH auth failed.${NC}"
  echo "   Output: $SSH_TEST"
  echo ""
  echo "   Troubleshooting:"
  echo "   - Make sure you added the key at https://github.com/settings/ssh/new"
  echo "   - Make sure the key is associated with a GitHub account that has"
  echo "     access to the I-ala-Wilson/Ian-ieppal-website repository"
  exit 1
fi

echo ""

# ─── STEP 2: Clone or pull website repo ──────────────────────────────────────
echo "📦 Website repo..."
if [ -d "$WEBSITE_DIR/.git" ]; then
  echo "   Pulling latest from main..."
  git -C "$WEBSITE_DIR" fetch origin
  git -C "$WEBSITE_DIR" pull origin main 2>/dev/null || git -C "$WEBSITE_DIR" pull origin master 2>/dev/null || true
  echo -e "${GREEN}   ✅ Website repo up to date${NC}"
else
  echo "   Cloning Ian-ieppal-website..."
  git clone "$WEBSITE_REPO" "$WEBSITE_DIR"
  echo -e "${GREEN}   ✅ Website repo cloned${NC}"
fi

echo ""
echo "══════════════════════════════════════════════════"
echo -e "${GREEN}  ✅ Website sync complete!${NC}"
echo ""
echo "  Repo is at:"
echo "  $WEBSITE_DIR"
echo "══════════════════════════════════════════════════"
echo ""
