#!/usr/bin/env bash
# ============================================================================
# install.sh — Universal Linux installer for BeyondAgtest
# ============================================================================
# Detects your distro, installs Node.js if needed, installs BeyondAgtest
# via npm, and runs a health check.
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
GITHUB_REPO="beyondkitter/beyondagtest"
REPO_URL="https://github.com/${GITHUB_REPO}"

# --- Helpers ---
info()    { printf "\033[1;34m[INFO]\033[0m  %s\n" "$1"; }
success() { printf "\033[1;32m[OK]\033[0m    %s\n" "$1"; }
warn()    { printf "\033[1;33m[WARN]\033[0m  %s\n" "$1"; }
error()   { printf "\033[1;31m[ERROR]\033[0m %s\n" "$1" >&2; }
die()     { error "$1"; exit 1; }

command_exists() {
  command -v "$1" &>/dev/null
}

# --- Distro Detection ---
detect_distro() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO_ID="${ID:-unknown}"
    DISTRO_LIKE="${ID_LIKE:-}"
  elif [ -f /etc/lsb-release ]; then
    . /etc/lsb-release
    DISTRO_ID=$(echo "${DISTRIB_ID:-unknown}" | tr '[:upper:]' '[:lower:]')
    DISTRO_LIKE=""
  elif command_exists lsb_release; then
    DISTRO_ID=$(lsb_release -is 2>/dev/null | tr '[:upper:]' '[:lower:]')
    DISTRO_LIKE=""
  else
    DISTRO_ID="unknown"
    DISTRO_LIKE=""
  fi
}

# --- Check if running as root ---
is_root() {
  [ "$(id -u)" -eq 0 ]
}

# --- Detect package manager ---
detect_pkg_manager() {
  if command_exists apt-get && [[ "${DISTRO_ID}" =~ ^(debian|ubuntu|linuxmint|pop)$ || "${DISTRO_LIKE}" =~ debian ]]; then
    PKG_MANAGER="apt"
  elif command_exists dnf && [[ "${DISTRO_ID}" =~ ^(fedora|rhel|centos|rocky|alma)$ || "${DISTRO_LIKE}" =~ rhel ]]; then
    PKG_MANAGER="dnf"
  elif command_exists yum; then
    PKG_MANAGER="yum"
  elif command_exists pacman && [[ "${DISTRO_ID}" =~ ^(arch|manjaro|endeavouros)$ || "${DISTRO_LIKE}" =~ arch ]]; then
    PKG_MANAGER="pacman"
  elif command_exists zypper; then
    PKG_MANAGER="zypper"
  elif command_exists apk; then
    PKG_MANAGER="apk"
  else
    PKG_MANAGER="unknown"
  fi
}

# --- Install Node.js if missing ---
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
      warn "Node.js v${node_version} found but >=${MIN_NODE_MAJOR} required"
    fi
  fi

  info "Installing Node.js ${MIN_NODE_MAJOR}+..."

  if command_exists curl; then
    # Use NodeSource for deb/rpm distros
    case "${PKG_MANAGER}" in
      apt)
        if is_root; then
          curl -fsSL https://deb.nodesource.com/setup_${MIN_NODE_MAJOR}.x | bash -
          apt-get install -y nodejs
        else
          warn "Please run as root (sudo) to install Node.js, or install manually."
          curl -fsSL https://deb.nodesource.com/setup_${MIN_NODE_MAJOR}.x | sudo -E bash -
          sudo apt-get install -y nodejs
        fi
        ;;
      dnf|yum)
        if is_root; then
          curl -fsSL https://rpm.nodesource.com/setup_${MIN_NODE_MAJOR}.x | bash -
          ${PKG_MANAGER} install -y nodejs
        else
          curl -fsSL https://rpm.nodesource.com/setup_${MIN_NODE_MAJOR}.x | sudo -E bash -
          sudo ${PKG_MANAGER} install -y nodejs
        fi
        ;;
      pacman)
        if is_root; then
          pacman -S --noconfirm nodejs npm
        else
          sudo pacman -S --noconfirm nodejs npm
        fi
        ;;
      *)
        # Fallback: use nvm
        warn "Unsupported package manager. Installing Node.js via nvm..."
        curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        # shellcheck source=/dev/null
        [ -s "${NVM_DIR}/nvm.sh" ] && . "${NVM_DIR}/nvm.sh"
        nvm install "$MIN_NODE_MAJOR"
        nvm use "$MIN_NODE_MAJOR"
        ;;
    esac
  else
    die "curl is required but not found. Please install curl and try again."
  fi

  # Verify installation
  if ! command_exists node; then
    die "Node.js installation failed. Please install Node.js ${MIN_NODE_MAJOR}+ manually."
  fi
  success "Node.js $(node -v) installed"
}

# --- Install npm globally ---
ensure_npm_global_dir() {
  if ! npm config get prefix &>/dev/null; then
    mkdir -p "$HOME/.npm-global"
    npm config set prefix "$HOME/.npm-global"
    export PATH="$HOME/.npm-global/bin:$PATH"
  fi
}

# --- Install BeyondAgtest ---
install_beyondagtest() {
  info "Installing BeyondAgtest..."

  ensure_npm_global_dir

  if is_root; then
    npm install -g "${PACKAGE_NAME}"
  else
    npm install -g "${PACKAGE_NAME}" 2>/dev/null || {
      warn "Global install failed without sudo. Trying with sudo..."
      sudo npm install -g "${PACKAGE_NAME}"
    }
  fi

  if ! command_exists beyondagtest; then
    die "Installation failed. beyondagtest command not found."
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
  echo "  BeyondAgtest Installer"
  echo "  ======================"
  echo ""

  detect_distro
  detect_pkg_manager
  info "Detected distro: ${DISTRO_ID} (${PKG_MANAGER})"

  install_nodejs
  install_beyondagtest
  run_doctor
  print_success
}

main "$@"
