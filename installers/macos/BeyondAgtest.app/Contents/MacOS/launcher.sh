#!/usr/bin/env bash
# ============================================================================
# launcher.sh — macOS .app bundle launcher for BeyondAgtest
# ============================================================================
# This script is the main executable for BeyondAgtest.app. It finds Node.js,
# locates the globally installed beyondagtest package, and launches the
# dashboard.
# ============================================================================
set -euo pipefail

# --- Locate Node.js ---
# Check common Homebrew and system paths
NODE_PATHS=(
  "/opt/homebrew/bin/node"
  "/usr/local/bin/node"
  "$HOME/.nvm/versions/node/$(ls "$HOME/.nvm/versions/node/" 2>/dev/null | tail -1)/bin/node"
  "/usr/bin/node"
)

NODE=""
for path in "${NODE_PATHS[@]}"; do
  if [ -x "$path" ]; then
    NODE="$path"
    break
  fi
done

# Fallback to PATH
if [ -z "$NODE" ]; then
  NODE=$(command -v node 2>/dev/null || true)
fi

if [ -z "$NODE" ]; then
  osascript -e 'display dialog "Node.js is required but not found.\n\nPlease install Node.js 18+ from:\nhttps://nodejs.org/\n\nOr install via Homebrew:\nbrew install node" buttons {"OK"} default button "OK" with title "BeyondAgtest" with icon caution'
  exit 1
fi

# --- Locate BeyondAgtest ---
# Check npm global install paths
NPM_ROOTS=(
  "$HOME/.npm-global/lib/node_modules"
  "/opt/homebrew/lib/node_modules"
  "/usr/local/lib/node_modules"
  "$("$NODE" -e 'console.log(require("path").resolve(process.execPath, "..", "..", "lib", "node_modules"))' 2>/dev/null || true)"
)

BEYONDAGTEST_DIR=""
BPKG="@beyondkitter/beyondagtest"
for root in "${NPM_ROOTS[@]}"; do
  if [ -d "${root}/${BPKG}" ]; then
    BEYONDAGTEST_DIR="${root}/${BPKG}"
    break
  fi
done

# Fallback: use npm to find the package
if [ -z "$BEYONDAGTEST_DIR" ]; then
  NPM_BIN=$(command -v npm 2>/dev/null || true)
  if [ -n "$NPM_BIN" ]; then
    RESOLVED=$("$NPM_BIN" root -g 2>/dev/null || true)
    if [ -d "${RESOLVED}/${BPKG}" ]; then
      BEYONDAGTEST_DIR="${RESOLVED}/${BPKG}"
    fi
  fi
fi

# --- Launch ---
# If BeyondAgtest is installed, run the dashboard.
# Otherwise, show an error dialog.
if [ -n "$BEYONDAGTEST_DIR" ] && [ -f "${BEYONDAGTEST_DIR}/bin/cli.js" ]; then
  exec "$NODE" "${BEYONDAGTEST_DIR}/bin/cli.js" dashboard "$@"
elif command -v beyondagtest &>/dev/null; then
  exec beyondagtest dashboard "$@"
else
  osascript -e 'display dialog "BeyondAgtest is not installed.\n\nPlease install it with:\nnpm install -g @beyondkitter/beyondagtest" buttons {"OK"} default button "OK" with title "BeyondAgtest" with icon stop'
  exit 1
fi
