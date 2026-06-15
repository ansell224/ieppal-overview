#!/usr/bin/env bash
# git-sync.sh — auto-sync this repo at Claude Code session boundaries.
#   start : pull latest from origin (rebase, autostash)
#   end   : scan for secrets, then commit all changes and push
#
# Wired up in .claude/settings.json via SessionStart / SessionEnd hooks.
# Always exits 0 so it never blocks a session. All output is logged.

set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
cd "$PROJECT_DIR" 2>/dev/null || exit 0

LOG="$PROJECT_DIR/.claude/hooks/last-sync.log"
log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S %Z')" "$1" >>"$LOG"; }

# Bail quietly if this isn't a git repo with an origin remote.
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
git remote get-url origin >/dev/null 2>&1 || exit 0

# Credential-shaped patterns. Kept tight on purpose: this is a content-heavy
# repo where bare words like "secret"/"token" appear in prose, so we only flag
# things that look like an actual key/token or a quoted key=value assignment.
SECRET_PATTERN='-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{20,}|sk-ant-[0-9A-Za-z_-]{20,}|sk-[0-9A-Za-z]{20,}|gh[pousr]_[0-9A-Za-z]{20,}|github_pat_[0-9A-Za-z_]{20,}|xox[baprs]-[0-9A-Za-z-]{10,}|(api[_-]?key|secret|password|passwd|token|auth)["'"'"' ]*[:=] *["'"'"'][^"'"'"']{8,}["'"'"']'

MODE="${1:-}"

case "$MODE" in
  start)
    log "SessionStart: pulling from origin"
    git pull --rebase --autostash >>"$LOG" 2>&1 || log "pull failed (continuing)"
    ;;

  end)
    if [ -z "$(git status --porcelain)" ]; then
      log "SessionEnd: no changes to push"
      exit 0
    fi

    # Stage everything (respects .gitignore), then scan only the lines being
    # ADDED in the staged diff — far fewer false positives than whole files.
    git add -A >>"$LOG" 2>&1
    HITS="$(git diff --cached --no-color | grep -E '^\+' | grep -nEi -e "$SECRET_PATTERN" | head -10)"

    if [ -n "$HITS" ]; then
      git reset -q   # unstage; leave the working tree exactly as it was
      log "SessionEnd: ABORTED — possible secret in added lines, nothing committed/pushed:"
      printf '%s\n' "$HITS" | while IFS= read -r line; do log "  $line"; done
      echo "git-sync: ABORTED — possible secret detected, nothing pushed (see .claude/hooks/last-sync.log)"
      exit 0
    fi

    log "SessionEnd: committing and pushing"
    git commit -m "chore: auto-sync session $(date '+%Y-%m-%d %H:%M:%S %Z')" >>"$LOG" 2>&1 || log "commit failed (continuing)"
    git push >>"$LOG" 2>&1 && log "push ok" || log "push failed (continuing)"
    ;;

  *)
    log "git-sync.sh called with unknown mode: '$MODE'"
    ;;
esac

exit 0
