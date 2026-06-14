#!/bin/bash
# =============================================================================
# IEP Pal — Local Dev Launcher
# Run this from Terminal whenever you want to start a fresh dev session.
# Usage: bash start-dev.sh
# =============================================================================

set -e

# ─── Load Node / npm ─────────────────────────────────────────────────────────
# Shell scripts don't inherit your interactive shell's PATH, so we manually
# source nvm and add Homebrew so npm is available.

# Homebrew (Intel and Apple Silicon)
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && source "$NVM_DIR/bash_completion"

# Verify npm is now available — if not, try to install via Homebrew
if ! command -v npm &>/dev/null; then
  if command -v brew &>/dev/null; then
    echo "   Node.js not found — installing via Homebrew..."
    brew install node
    # Re-add Homebrew bin to PATH after install
    export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
  fi
fi

if ! command -v npm &>/dev/null; then
  echo ""
  echo "❌  Node.js / npm not found."
  echo ""
  echo "   Install it (one-click, no Terminal needed):"
  echo "   → https://nodejs.org  (download the LTS version)"
  echo ""
  echo "   Then re-run this script."
  echo ""
  exit 1
fi

echo "   Using Node $(node --version), npm $(npm --version)"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FE_DIR="$SCRIPT_DIR/IEPPAL-RASA-FE"
BE_DIR="$SCRIPT_DIR/IEPPAL-RASA-BE"
FE_REPO="git@github.com:IEPPAL-SG/IEPPAL-RASA-FE.git"
BE_REPO="git@github.com:IEPPAL-SG/IEPPAL-RASA-BE.git"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════╗"
echo "║      IEP Pal — Dev Environment       ║"
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
  # Start ssh-agent and add key if not already loaded
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
  echo "     access to the IEPPAL-SG organisation"
  exit 1
fi

echo ""

# ─── STEP 2: Clone or pull FE ────────────────────────────────────────────────
echo "📦 Frontend repo..."
if [ -d "$FE_DIR/.git" ]; then
  echo "   Pulling latest from main..."
  git -C "$FE_DIR" fetch origin
  git -C "$FE_DIR" pull origin main 2>/dev/null || git -C "$FE_DIR" pull origin master 2>/dev/null || true
  echo -e "${GREEN}   ✅ FE up to date${NC}"
else
  echo "   Cloning IEPPAL-RASA-FE..."
  # Remove old manually-downloaded folder if it exists and is not a git repo
  if [ -d "$SCRIPT_DIR/IEPPAL-RASA-FE-mvp" ] && [ ! -d "$SCRIPT_DIR/IEPPAL-RASA-FE-mvp/.git" ]; then
    echo "   (Archiving old zip-based folder to IEPPAL-RASA-FE-mvp-backup)"
    mv "$SCRIPT_DIR/IEPPAL-RASA-FE-mvp" "$SCRIPT_DIR/IEPPAL-RASA-FE-mvp-backup"
  fi
  git clone "$FE_REPO" "$FE_DIR"
  echo -e "${GREEN}   ✅ FE cloned${NC}"
fi

echo ""

# ─── STEP 3: Clone or pull BE ────────────────────────────────────────────────
echo "📦 Backend repo..."
if [ -d "$BE_DIR/.git" ]; then
  echo "   Pulling latest from main..."
  git -C "$BE_DIR" fetch origin
  git -C "$BE_DIR" pull origin main 2>/dev/null || git -C "$BE_DIR" pull origin master 2>/dev/null || true
  echo -e "${GREEN}   ✅ BE up to date${NC}"
else
  echo "   Cloning IEPPAL-RASA-BE..."
  git clone "$BE_REPO" "$BE_DIR"
  echo -e "${GREEN}   ✅ BE cloned${NC}"
fi

echo ""

# ─── STEP 4: Install FE dependencies ─────────────────────────────────────────
echo "📦 Installing FE dependencies..."
if [ ! -d "$FE_DIR/node_modules" ]; then
  npm install --prefix "$FE_DIR"
  echo -e "${GREEN}   ✅ FE node_modules installed${NC}"
else
  echo "   node_modules exists — running npm install to catch any new deps..."
  npm install --prefix "$FE_DIR" --silent
  echo -e "${GREEN}   ✅ FE dependencies up to date${NC}"
fi

echo ""

# ─── STEP 5: Install BE dependencies ─────────────────────────────────────────
echo "📦 Installing BE dependencies..."
if [ -f "$BE_DIR/package.json" ]; then
  if [ ! -d "$BE_DIR/node_modules" ]; then
    npm install --prefix "$BE_DIR"
    echo -e "${GREEN}   ✅ BE node_modules installed${NC}"
  else
    npm install --prefix "$BE_DIR" --silent
    echo -e "${GREEN}   ✅ BE dependencies up to date${NC}"
  fi
elif [ -f "$BE_DIR/requirements.txt" ]; then
  echo "   Python BE detected — installing pip dependencies..."
  pip3 install -r "$BE_DIR/requirements.txt" -q
  echo -e "${GREEN}   ✅ BE Python deps installed${NC}"
else
  echo -e "${YELLOW}   ⚠️  No package.json or requirements.txt found in BE. Skipping.${NC}"
fi

echo ""

# ─── STEP 6: Check / scaffold .env files ─────────────────────────────────────
echo "⚙️  Environment files..."

# FE .env
if [ ! -f "$FE_DIR/.env" ]; then
  if [ -f "$FE_DIR/.env.example" ]; then
    cp "$FE_DIR/.env.example" "$FE_DIR/.env"
    echo -e "${YELLOW}   ⚠️  Created FE .env from .env.example — review it before running${NC}"
  else
    cat > "$FE_DIR/.env" << 'EOF'
# IEP Pal FE — Local Dev
# VITE_API_BASE_URL defaults to http://localhost:3001/api if not set.
# Uncomment and edit if your BE runs on a different port or URL.
# VITE_API_BASE_URL=http://localhost:3001/api
EOF
    echo "   Created minimal FE .env (defaults are fine for local dev)"
  fi
else
  echo "   FE .env already exists — skipping"
fi

# BE .env
if [ -f "$BE_DIR/package.json" ] || [ -f "$BE_DIR/requirements.txt" ]; then
  if [ ! -f "$BE_DIR/.env" ]; then
    if [ -f "$BE_DIR/.env.example" ]; then
      cp "$BE_DIR/.env.example" "$BE_DIR/.env"
      echo -e "${YELLOW}   ⚠️  Created BE .env from .env.example — fill in any secrets before starting${NC}"
    else
      echo -e "${YELLOW}   ⚠️  No BE .env found and no .env.example to copy. You may need to create one.${NC}"
    fi
  else
    echo "   BE .env already exists — skipping"
  fi
fi

echo ""

# ─── STEP 7: Start BE server ─────────────────────────────────────────────────
echo "🚀 Starting BE server..."
BE_STARTED=false

if [ -f "$BE_DIR/package.json" ]; then
  # Detect start script
  if grep -q '"dev"' "$BE_DIR/package.json"; then
    START_CMD="npm run dev"
  elif grep -q '"start"' "$BE_DIR/package.json"; then
    START_CMD="npm start"
  else
    START_CMD="node index.js"
  fi

  osascript -e "tell application \"Terminal\" to do script \"echo '─── IEP Pal BE ───' && cd \\\"$BE_DIR\\\" && $START_CMD\"" 2>/dev/null || \
  (cd "$BE_DIR" && $START_CMD &)

  echo -e "${GREEN}   ✅ BE starting on http://localhost:3001${NC}"
  BE_STARTED=true
  sleep 2
elif [ -f "$BE_DIR/requirements.txt" ]; then
  osascript -e "tell application \"Terminal\" to do script \"echo '─── IEP Pal BE ───' && cd \\\"$BE_DIR\\\" && python3 -m uvicorn main:app --reload --port 3001\"" 2>/dev/null || \
  (cd "$BE_DIR" && python3 -m uvicorn main:app --reload --port 3001 &)
  echo -e "${GREEN}   ✅ BE starting on http://localhost:3001${NC}"
  BE_STARTED=true
  sleep 2
fi

if [ "$BE_STARTED" = false ]; then
  echo -e "${YELLOW}   ⚠️  Could not detect how to start BE. Start it manually.${NC}"
fi

echo ""

# ─── STEP 8: Start FE dev server ─────────────────────────────────────────────
echo "🚀 Starting FE dev server on http://127.0.0.1:5173..."
osascript -e "tell application \"Terminal\" to do script \"echo '─── IEP Pal FE ───' && cd \\\"$FE_DIR\\\" && npm run dev\"" 2>/dev/null || \
(cd "$FE_DIR" && npm run dev &)

sleep 3

echo ""

# ─── STEP 9: Open in VSCode ──────────────────────────────────────────────────
echo "💻 Opening in VSCode..."
if command -v code &>/dev/null; then
  code "$SCRIPT_DIR"
  echo -e "${GREEN}   ✅ VSCode opened${NC}"
else
  echo -e "${YELLOW}   ⚠️  'code' command not found.${NC}"
  echo "   To enable it: open VSCode → Cmd+Shift+P → 'Shell Command: Install code in PATH'"
fi

echo ""
echo "══════════════════════════════════════════════════"
echo -e "${GREEN}  ✅ Dev environment ready!${NC}"
echo ""
echo "  FE:  http://127.0.0.1:5173"
echo "  BE:  http://localhost:3001"
echo ""
echo "  Both repos are in:"
echo "  $SCRIPT_DIR"
echo "══════════════════════════════════════════════════"
echo ""
