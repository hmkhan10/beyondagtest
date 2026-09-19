#!/usr/bin/env bash
# ============================================================================
# build-deb.sh — Build a .deb package for BeyondAgtest
# ============================================================================
# Usage: ./build-deb.sh
# Output: beyondagtest_0.1.0_amd64.deb
# Requires: dpkg-deb, fakeroot (apt install dpkg-dev fakeroot)
# ============================================================================
set -euo pipefail

PACKAGE="beyondagtest"
VERSION="0.1.0"
ARCH="amd64"
DEPS="nodejs (>= 18), npm"
VENDOR="BeyondKitter"
MAINTAINER="BeyondKitter <dev@beyondkitter.com>"
DESCRIPTION="Agentic Mobile App Testing — AI-powered test generation and execution"
HOMEPAGE="https://github.com/beyondkitter/beyondagtest"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/../.."
BUILD_DIR=$(mktemp -d)

echo "==> Building ${PACKAGE}_${VERSION}_${ARCH}.deb"
echo "    Build dir: ${BUILD_DIR}"

# --- Clean up on exit ---
cleanup() {
  rm -rf "${BUILD_DIR}"
}
trap cleanup EXIT

# --- DEBIAN/control ---
mkdir -p "${BUILD_DIR}/DEBIAN"
cat > "${BUILD_DIR}/DEBIAN/control" <<EOF
Package: ${PACKAGE}
Version: ${VERSION}
Section: devel
Priority: optional
Architecture: ${ARCH}
Depends: ${DEPS}
Maintainer: ${MAINTAINER}
Homepage: ${HOMEPAGE}
Description: ${DESCRIPTION}
 BeyondAgtest is an AI-driven agentic testing platform for mobile applications.
 It generates tests from natural language descriptions, runs them on real
 devices and emulators, and produces detailed reports with screenshots.
EOF

# --- Opt directory: app binary placeholder ---
mkdir -p "${BUILD_DIR}/opt/${PACKAGE}"
cat > "${BUILD_DIR}/opt/${PACKAGE}/beyondagtest" <<'INNER'
#!/usr/bin/env bash
# BeyondAgtest launcher — delegates to the globally installed npm package
exec "$(command -v node)" "$(npm root -g)/@beyondkitter/beyondagtest/bin/cli.js" "$@"
INNER
chmod +x "${BUILD_DIR}/opt/${PACKAGE}/beyondagtest"

# GUI wrapper (for .desktop file)
cat > "${BUILD_DIR}/opt/${PACKAGE}/beyondagtest-gui" <<'INNER'
#!/usr/bin/env bash
# BeyondAgtest GUI launcher
exec "$(command -v node)" "$(npm root -g)/@beyondkitter/beyondagtest/bin/cli.js" dashboard "$@"
INNER
chmod +x "${BUILD_DIR}/opt/${PACKAGE}/beyondagtest-gui"

# --- Symlinks in /usr/local/bin ---
mkdir -p "${BUILD_DIR}/usr/local/bin"
ln -sf /opt/beyondagtest/beyondagtest "${BUILD_DIR}/usr/local/bin/beyondagtest"

# --- Desktop file ---
mkdir -p "${BUILD_DIR}/usr/share/applications"
cp "${SCRIPT_DIR}/beyondagtest.desktop" "${BUILD_DIR}/usr/share/applications/"

# --- Icon placeholder (128x128 PNG) ---
mkdir -p "${BUILD_DIR}/usr/share/icons/hicolor/128x128/apps"
# Generate a minimal valid 128x128 PNG if ImageMagick is available,
# otherwise create a placeholder file.
if command -v convert &>/dev/null; then
  convert -size 128x128 xc:"#6366f1" \
    -gravity center -pointsize 32 -fill white \
    -annotate 0 "BA" \
    "${BUILD_DIR}/usr/share/icons/hicolor/128x128/apps/beyondagtest.png"
elif command -v python3 &>/dev/null; then
  python3 -c "
import struct, zlib, sys
def create_png(w, h, r, g, b):
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xFFFFFFFF)
    raw = b''
    for _ in range(h):
        raw += b'\x00' + bytes([r, g, b]) * w
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')
with open(sys.argv[1], 'wb') as f:
    f.write(create_png(128, 128, 99, 102, 241))
" "${BUILD_DIR}/usr/share/icons/hicolor/128x128/apps/beyondagtest.png"
else
  echo "WARNING: No image tool found — icon placeholder is empty."
  touch "${BUILD_DIR}/usr/share/icons/hicolor/128x128/apps/beyondagtest.png"
fi

# --- Post-install script: update icon cache ---
cat > "${BUILD_DIR}/DEBIAN/postinst" <<'POSTINST'
#!/bin/bash
set -e
if command -v update-icon-caches &>/dev/null; then
  update-icon-caches /usr/share/icons/hicolor || true
fi
if command -v update-desktop-database &>/dev/null; then
  update-desktop-database /usr/share/applications || true
fi
POSTINST
chmod 0755 "${BUILD_DIR}/DEBIAN/postinst"

# --- Build the .deb ---
DEB_OUT="${OUTPUT_DIR}/${PACKAGE}_${VERSION}_${ARCH}.deb"
dpkg-deb --root-owner-group --build "${BUILD_DIR}" "${DEB_OUT}"

echo ""
echo "==> Built: ${DEB_OUT}"
echo "    Install with: sudo dpkg -i ${DEB_OUT}"
echo "    Fix deps:     sudo apt-get install -f"
