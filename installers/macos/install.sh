#!/usr/bin/env bash
# ============================================================================
# install.sh — macOS installer for BeyondAgtest
# ============================================================================
# Detects your environment, installs Homebrew if needed, installs Node.js,
# installs BeyondAgtest via npm, and runs a health check.
#
# Usage:
#   curl -fsSL https://get.beyondagtest.dev | bash
#   or
#   ./install.sh
# ============================================================================
set -euo pipefail

# --- Configuration ---
PACKAGE_NAME="@beyondkitter/beyondagtest"
MIN_NODE_MAJOR=18
REPO_URL="https://github.com/beyondkitter/beyondagtest"

# --- Helpers ---
info()    { printf "\033[1;34m[INFO]\033[0m  %s\n" "$1"; }
success() { printf "\033[1;32m[OK]\033[0m    %s\n" "$1"; }
warn()    { printf "\033[1;33m[WARN]\033[0m  %s\n" "$1"; }
error()   { printf "\033[1;31m[ERROR]\033[0m %s\n" "$1" >&2; }
die()     { error "$1"; exit 1; }

command_exists() {
  command -v "$1" &>/dev/null
}

# --- Detect architecture ---
detect_arch() {
  ARCH=$(uname -m)
  case "${ARCH}" in
    arm64|aarch64) ARCH_LABEL="apple_silicon" ;;
    x86_64)        ARCH_LABEL="intel" ;;
    *)             ARCH_LABEL="unknown" ;;
  esac
  info "Detected architecture: ${ARCH} (${ARCH_LABEL})"
}

# --- Install Homebrew if needed ---
ensure_homebrew() {
  if command_exists brew; then
    success "Homebrew found"
    return 0
  fi

  info "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Add brew to PATH for the current session
  if [ -x /opt/homebrew/bin/brew ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [ -x /usr/local/bin/brew ]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi

  if ! command_exists brew; then
    die "Homebrew installation failed."
  fi
  success "Homebrew installed"
}

# --- Install Node.js ---
install_nodejs() {
  if command_exists node; then
    local node_version
    node_version=$(node -v | sed 's/v//')
    local node_major
    node_major=$(echo "$node_version" | cut -d. -f1)
    if [ "$node_major" -ge "$MIN_NODE_MAJOR" ]; then
      success "Node.js v${node_version} found"
      return 0
    else
      warn "Node.js v${node_version} found but >=${MIN_NODE_MAJOR} required. Upgrading..."
    fi
  fi

  info "Installing Node.js via Homebrew..."
  brew install node@${MIN_NODE_MAJOR} || brew install node

  # Link if formula is keg-only
  if [ -d "/opt/homebrew/opt/node@${MIN_NODE_MAJOR}" ]; then
    brew link --force --overwrite "node@${MIN_NODE_MAJOR}" 2>/dev/null || true
  fi

  if ! command_exists node; then
    die "Node.js installation failed."
  fi
  success "Node.js $(node -v) installed"
}

# --- Install BeyondAgtest ---
install_beyondagtest() {
  info "Installing BeyondAgtest..."

  # Ensure npm global prefix is writable
  local npm_prefix
  npm_prefix=$(npm config get prefix 2>/dev/null || echo "")
  if [ -z "$npm_prefix" ] || [ ! -w "${npm_prefix}" ] 2>/dev/null; then
    mkdir -p "${HOME}/.npm-global"
    npm config set prefix "${HOME}/.npm-global"
    export PATH="${HOME}/.npm-global/bin:${PATH}"
  fi

  npm install -g "${PACKAGE_NAME}"

  if ! command_exists beyondagtest; then
    # Try adding common npm global paths
    export PATH="${HOME}/.npm-global/bin:/usr/local/bin:${PATH}"
    if ! command_exists beyondagtest; then
      die "Installation failed. beyondagtest command not found."
    fi
  fi
  success "BeyondAgtest $(beyondagtest --version 2>/dev/null || echo 'installed') installed"
}

# --- Run health check ---
run_doctor() {
  info "Running BeyondAgtest doctor..."
  beyondagtest doctor || warn "Some checks failed. Run 'beyondagtest doctor' for details."
}

# --- Print success ---
print_success() {
  echo ""
  echo "============================================================"
  echo "  BeyondAgtest installed successfully!"
  echo "============================================================"
  echo ""
  echo "  Quick start:"
  echo "    beyondagtest --help          Show available commands"
  echo "    beyondagtest init            Initialize a new project"
  echo "    beyondagtest doctor          Verify your environment"
  echo "    beyondagtest dashboard       Launch the web dashboard"
  echo ""
  echo "  Docs:  https://docs.beyondagtest.dev"
  echo "  Repo:  ${REPO_URL}"
  echo "  Issues: ${REPO_URL}/issues"
  echo "============================================================"
}

# --- Main ---
main() {
  echo ""
  echo "  BeyondAgtest Installer (macOS)"
  echo "  ==============================="
  echo ""

  detect_arch
  ensure_homebrew
  install_nodejs
  install_beyondagtest
  run_doctor
  print_success
}

main "$@"
