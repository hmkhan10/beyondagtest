#!/usr/bin/env bash
# ============================================================================
# installs.sh — Universal install script for BeyondAgtest
# ============================================================================
# Detects your OS, architecture, and package manager. Shows the appropriate
# install command or downloads the correct binary.
#
# Usage:
#   curl -fsSL https://beyondagtest.dev/install.sh | bash
#
# This script is intended for the website and covers:
#   - Linux (deb, rpm, arch, alpine, generic)
#   - macOS (arm64, x86_64)
#   - Windows/WSL (npm, .exe download)
# ============================================================================
set -euo pipefail

# --- Configuration ---
REPO="beyondkitter/beyondagtest"
REPO_URL="https://github.com/${REPO}"
VERSION="0.1.0"
PACKAGE_NAME="@beyondkitter/beyondagtest"
MIN_NODE_MAJOR=18
DOWNLOAD_BASE="https://github.com/${REPO}/releases/download/v${VERSION}"

# --- Helpers ---
info()    { printf "\033[1;34m==>\033[0m  %s\n" "$1"; }
success() { printf "\033[1;32m ✓\033[0m  %s\n" "$1"; }
warn()    { printf "\033[1;33m ⚠\033[0m  %s\n" "$1"; }
error()   { printf "\033[1;31m ✗\033[0m  %s\n" "$1" >&2; }
divider() { printf "%0.s─" $(seq 1 60); echo; }

command_exists() {
  command -v "$1" &>/dev/null
}

# --- OS Detection ---
detect_os() {
  OS_TYPE="unknown"
  SUB_TYPE=""

  case "$(uname -s)" in
    Linux*)
      OS_TYPE="linux"
      # Detect if running under WSL
      if grep -qi microsoft /proc/version 2>/dev/null || [ -n "${WSL_DISTRO_NAME:-}" ]; then
        SUB_TYPE="wsl"
      fi
      ;;
    Darwin*)
      OS_TYPE="macos"
      ;;
    MINGW*|MSYS*|CYGWIN*|Windows_NT*)
      OS_TYPE="windows"
      ;;
    *)
      OS_TYPE="unknown"
      ;;
  esac
}

# --- Architecture Detection ---
detect_arch() {
  ARCH_RAW=$(uname -m)
  case "${ARCH_RAW}" in
    x86_64|amd64)
      ARCH="x86_64"
      DEB_ARCH="amd64"
      ;;
    aarch64|arm64)
      ARCH="arm64"
      DEB_ARCH="arm64"
      ;;
    armv7l|armhf)
      ARCH="armv7"
      DEB_ARCH="armhf"
      ;;
    i686|i386)
      ARCH="i686"
      DEB_ARCH="i386"
      ;;
    *)
      ARCH="${ARCH_RAW}"
      DEB_ARCH="${ARCH_RAW}"
      ;;
  esac
}

# --- Distro Detection (Linux) ---
detect_distro() {
  DISTRO_ID="unknown"
  DISTRO_LIKE=""

  if [ -f /etc/os-release ]; then
    # shellcheck source=/dev/null
    . /etc/os-release
    DISTRO_ID="${ID:-unknown}"
    DISTRO_LIKE="${ID_LIKE:-}"
  elif [ -f /etc/lsb-release ]; then
    # shellcheck source=/dev/null
    . /etc/lsb-release
    DISTRO_ID=$(echo "${DISTRIB_ID:-unknown}" | tr '[:upper:]' '[:lower:]')
  fi
}

# --- Package Manager Detection ---
detect_pkg_manager() {
  PKG_MGR="unknown"

  if command_exists apt-get; then
    PKG_MGR="apt"
  elif command_exists dnf; then
    PKG_MGR="dnf"
  elif command_exists yum; then
    PKG_MGR="yum"
  elif command_exists pacman; then
    PKG_MGR="pacman"
  elif command_exists apk; then
    PKG_MGR="apk"
  elif command_exists brew; then
    PKG_MGR="brew"
  fi
}

# --- Node.js Check ---
node_version_check() {
  if command_exists node; then
    local ver
    ver=$(node -v 2>/dev/null | sed 's/v//')
    local major
    major=$(echo "$ver" | cut -d. -f1)
    if [ "$major" -ge "$MIN_NODE_MAJOR" ]; then
      return 0
    fi
  fi
  return 1
}

# --- Linux Install Instructions ---
print_linux_instructions() {
  echo ""
  divider
  echo "  BeyondAgtest v${VERSION} — Linux (${ARCH})"
  divider
  echo ""

  local npm_available=false
  if node_version_check; then
    npm_available=true
  fi

  # Option 1: npm (preferred)
  echo "  OPTION 1: Install via npm (recommended)"
  echo "  ────────────────────────────────────────"
  if [ "$npm_available" = true ]; then
    echo "    sudo npm install -g ${PACKAGE_NAME}"
  else
    echo "    # First install Node.js ${MIN_NODE_MAJOR}+:"
    case "${PKG_MGR}" in
      apt)
        echo "    curl -fsSL https://deb.nodesource.com/setup_${MIN_NODE_MAJOR}.x | sudo -E bash -"
        echo "    sudo apt-get install -y nodejs"
        ;;
      dnf|yum)
        echo "    curl -fsSL https://rpm.nodesource.com/setup_${MIN_NODE_MAJOR}.x | sudo -E bash -"
        echo "    sudo ${PKG_MGR} install -y nodejs"
        ;;
      pacman)
        echo "    sudo pacman -S nodejs npm"
        ;;
      *)
        echo "    # Install Node.js ${MIN_NODE_MAJOR}+ from https://nodejs.org/"
        ;;
    esac
    echo "    sudo npm install -g ${PACKAGE_NAME}"
  fi
  echo ""

  # Option 2: .deb download
  if [ "${PKG_MGR}" = "apt" ] || [[ "${DISTRO_LIKE}" =~ debian ]]; then
    echo "  OPTION 2: Download .deb package"
    echo "  ────────────────────────────────"
    echo "    curl -LO ${DOWNLOAD_BASE}/beyondagtest_${VERSION}_${DEB_ARCH}.deb"
    echo "    sudo dpkg -i beyondagtest_${VERSION}_${DEB_ARCH}.deb"
    echo "    sudo apt-get install -f  # fix any missing dependencies"
    echo ""
  fi

  # Option 3: AppImage
  echo "  OPTION 3: Download AppImage (portable)"
  echo "  ────────────────────────────────────────"
  echo "    curl -LO ${DOWNLOAD_BASE}/BeyondAgtest-${VERSION}-${ARCH}.AppImage"
  echo "    chmod +x BeyondAgtest-${VERSION}-${ARCH}.AppImage"
  echo "    ./BeyondAgtest-${VERSION}-${ARCH}.AppImage"
  echo ""

  # One-liner
  echo "  QUICK INSTALL (npm):"
  echo "  ────────────────────"
  echo "    curl -fsSL https://get.beyondagtest.dev | bash"
  echo ""
}

# --- macOS Install Instructions ---
print_macos_instructions() {
  echo ""
  divider
  echo "  BeyondAgtest v${VERSION} — macOS (${ARCH})"
  divider
  echo ""

  local brew_available=false
  if command_exists brew; then
    brew_available=true
  fi

  # Option 1: npm
  echo "  OPTION 1: Install via npm (recommended)"
  echo "  ────────────────────────────────────────"
  if node_version_check; then
    echo "    npm install -g ${PACKAGE_NAME}"
  else
    if [ "$brew_available" = true ]; then
      echo "    brew install node"
    else
      echo "    # Install Node.js ${MIN_NODE_MAJOR}+ from https://nodejs.org/"
    fi
    echo "    npm install -g ${PACKAGE_NAME}"
  fi
  echo ""

  # Option 2: Homebrew
  if [ "$brew_available" = true ]; then
    echo "  OPTION 2: Install via Homebrew"
    echo "  ──────────────────────────────"
    echo "    brew tap beyondkitter/tap"
    echo "    brew install beyondagtest"
    echo ""
  fi

  # Option 3: .dmg
  if [ "${ARCH}" = "arm64" ]; then
    echo "  OPTION 3: Download .dmg (Apple Silicon)"
    echo "  ────────────────────────────────────────"
  else
    echo "  OPTION 3: Download .dmg (Intel)"
    echo "  ──────────────────────────────"
  fi
  echo "    curl -LO ${DOWNLOAD_BASE}/BeyondAgtest-${VERSION}-${ARCH}.dmg"
  echo "    open BeyondAgtest-${VERSION}-${ARCH}.dmg"
  echo "    # Drag BeyondAgtest to Applications"
  echo ""

  # One-liner
  echo "  QUICK INSTALL (npm):"
  echo "  ────────────────────"
  echo '    curl -fsSL https://get.beyondagtest.dev | bash'
  echo ""
}

# --- Windows Install Instructions ---
print_windows_instructions() {
  echo ""
  divider
  echo "  BeyondAgtest v${VERSION} — Windows"
  divider
  echo ""

  echo "  OPTION 1: Install via npm (recommended)"
  echo "  ────────────────────────────────────────"
  echo "    # Make sure Node.js ${MIN_NODE_MAJOR}+ is installed from https://nodejs.org/"
  echo "    npm install -g ${PACKAGE_NAME}"
  echo ""

  echo "  OPTION 2: Install via winget"
  echo "  ────────────────────────────"
  echo "    winget install BeyondKitter.BeyondAgtest"
  echo ""

  echo "  OPTION 3: Install via Chocolatey"
  echo "  ─────────────────────────────────"
  echo "    choco install beyondagtest"
  echo ""

  echo "  OPTION 4: Download .exe installer"
  echo "  ──────────────────────────────────"
  echo "    curl -LO ${DOWNLOAD_BASE}/BeyondAgtest-${VERSION}-Setup.exe"
  echo "    .\\BeyondAgtest-${VERSION}-Setup.exe"
  echo ""

  echo "  OPTION 5: PowerShell one-liner"
  echo "  ───────────────────────────────"
  echo "    irm https://get.beyondagtest.dev/install.ps1 | iex"
  echo ""
}

# --- WSL Instructions ---
print_wsl_instructions() {
  echo ""
  divider
  echo "  BeyondAgtest v${VERSION} — Windows Subsystem for Linux (WSL)"
  divider
  echo ""

  echo "  WSL behaves like Linux. Use the Linux install method:"
  echo ""
  echo "    curl -fsSL https://get.beyondagtest.dev | bash"
  echo ""
  echo "  Or install npm in your WSL distro:"
  echo "    sudo apt-get update && sudo apt-get install -y nodejs npm"
  echo "    npm install -g ${PACKAGE_NAME}"
  echo ""
}

# --- Print Next Steps ---
print_next_steps() {
  echo ""
  echo "  ─── After installation ───"
  echo ""
  echo "    beyondagtest --help          Show available commands"
  echo "    beyondagtest init            Initialize a new test project"
  echo "    beyondagtest doctor          Verify your environment"
  echo "    beyondagtest dashboard       Launch the web dashboard"
  echo "    beyondagtest scan ./app      Scan a mobile app for tests"
  echo ""
  echo "  Docs:   https://docs.beyondagtest.dev"
  echo "  Issues: ${REPO_URL}/issues"
  echo ""
}

# --- Main ---
main() {
  echo ""
  echo "  BeyondAgtest — Install Guide"
  echo "  ============================"

  detect_os
  detect_arch
  detect_distro
  detect_pkg_manager

  info "OS: ${OS_TYPE} | Arch: ${ARCH} | Pkg: ${PKG_MGR}"
  [ "${OS_TYPE}" = "linux" ] && info "Distro: ${DISTRO_ID}"

  case "${OS_TYPE}" in
    linux)
      if [ "${SUB_TYPE}" = "wsl" ]; then
        print_wsl_instructions
      else
        print_linux_instructions
      fi
      ;;
    macos)
      print_macos_instructions
      ;;
    windows)
      print_windows_instructions
      ;;
    *)
      error "Unsupported operating system: $(uname -s)"
      echo ""
      echo "  Please install Node.js ${MIN_NODE_MAJOR}+ and run:"
      echo "    npm install -g ${PACKAGE_NAME}"
      echo ""
      exit 1
      ;;
  esac

  print_next_steps
}

main "$@"
