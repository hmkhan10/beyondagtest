#!/usr/bin/env bash
# ============================================================================
# build-appimage.sh — Build an AppImage for BeyondAgtest
# ============================================================================
# Usage: ./build-appimage.sh
# Output: BeyondAgtest-0.1.0-x86_64.AppImage
#
# This script creates an AppImage using the linuxdeploy pattern.
# If linuxdeploy is not installed, it will be downloaded automatically.
# ============================================================================
set -euo pipefail

APP_NAME="BeyondAgtest"
APP_ID="dev.beyondagtest"
VERSION="0.1.0"
ARCH="x86_64"
DEPLOY="linuxdeploy"
DEPLOY_PLUGIN_APPIMAGE="linuxdeploy-plugin-appimage"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${SCRIPT_DIR}/../../.build-appimage"
APPDIR="${BUILD_DIR}/AppDir"
OUTPUT_DIR="${SCRIPT_DIR}/../.."

echo "==> Building ${APP_NAME}-${VERSION}-${ARCH}.AppImage"

# --- Clean previous build ---
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# --- Fetch linuxdeploy if not present ---
if ! command -v "${DEPLOY}" &>/dev/null; then
  echo "    Downloading linuxdeploy..."
  curl -fsSL -o "${BUILD_DIR}/${DEPLOY}" \
    "https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-x86_64.AppImage"
  chmod +x "${BUILD_DIR}/${DEPLOY}"
  DEPLOY="${BUILD_DIR}/${DEPLOY}"
fi

# --- Create AppDir structure ---
mkdir -p "${APPDIR}/usr/bin"
mkdir -p "${APPDIR}/usr/share/applications"
mkdir -p "${APPDIR}/usr/share/icons/hicolor/128x128/apps"

# Main executable
cat > "${APPDIR}/usr/bin/beyondagtest" <<'INNER'
#!/usr/bin/env bash
# BeyondAgtest AppImage entry point
APPDIR="$(dirname "$(readlink -f "$0")")/../.."
exec node "${APPDIR}/opt/beyondagtest/bin/cli.js" "$@"
INNER
chmod +x "${APPDIR}/usr/bin/beyondagtest"

# Copy npm-installed app into opt/
mkdir -p "${APPDIR}/opt/beyondagtest"
if command -v npm &>/dev/null; then
  NPM_GLOBAL="$(npm root -g 2>/dev/null || echo "/usr/lib/node_modules")"
  if [ -d "${NPM_GLOBAL}/@beyondkitter/beyondagtest" ]; then
    cp -r "${NPM_GLOBAL}/@beyondkitter/beyondagtest" "${APPDIR}/opt/beyondagtest/"
  else
    echo "    WARNING: @beyondkitter/beyondagtest not found globally."
    echo "    Run 'npm install -g @beyondkitter/beyondagtest' first, then re-run."
    echo "    Creating a stub so the AppDir can still be assembled."
    mkdir -p "${APPDIR}/opt/beyondagtest/bin"
    echo '#!/usr/bin/env node\nconsole.error("beyondagtest not installed. Run: npm install -g @beyondkitter/beyondagtest");' \
      > "${APPDIR}/opt/beyondagtest/bin/cli.js"
    chmod +x "${APPDIR}/opt/beyondagtest/bin/cli.js"
  fi
fi

# Desktop file
cat > "${APPDIR}/usr/share/applications/${APP_ID}.desktop" <<EOF
[Desktop Entry]
Name=${APP_NAME}
Comment=Agentic Mobile App Testing
Exec=beyondagtest
Icon=${APP_ID}
Terminal=false
Type=Application
Categories=Development;Testing;
StartupWMClass=beyondagtest
EOF

# Symlink desktop file into AppDir root (required by AppImage spec)
ln -sf "usr/share/applications/${APP_ID}.desktop" "${APPDIR}/${APP_ID}.desktop"

# Icon
if command -v convert &>/dev/null; then
  convert -size 128x128 xc:"#6366f1" \
    -gravity center -pointsize 32 -fill white \
    -annotate 0 "BA" \
    "${APPDIR}/usr/share/icons/hicolor/128x128/apps/${APP_ID}.png"
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
" "${APPDIR}/usr/share/icons/hicolor/128x128/apps/${APP_ID}.png"
else
  touch "${APPDIR}/usr/share/icons/hicolor/128x128/apps/${APP_ID}.png"
fi
# Symlink icon into AppDir root
ln -sf "usr/share/icons/hicolor/128x128/apps/${APP_ID}.png" "${APPDIR}/${APP_ID}.png"

# --- Build AppImage ---
OUTPUT_FILE="${OUTPUT_DIR}/${APP_NAME}-${VERSION}-${ARCH}.AppImage"

echo "    Running linuxdeploy..."
"${DEPLOY}" \
  --appdir "${APPDIR}" \
  --desktop-file "${APPDIR}/usr/share/applications/${APP_ID}.desktop" \
  --icon-file "${APPDIR}/usr/share/icons/hicolor/128x128/apps/${APP_ID}.png" \
  --output appimage \
  --dest "${BUILD_DIR}"

# Move the generated AppImage to the output directory
GENERATED=$(ls "${BUILD_DIR}"/*.AppImage 2>/dev/null | head -1)
if [ -n "${GENERATED}" ]; then
  mv "${GENERATED}" "${OUTPUT_FILE}"
  echo ""
  echo "==> Built: ${OUTPUT_FILE}"
  echo "    Run: chmod +x ${OUTPUT_FILE} && ./${APP_NAME}-${VERSION}-${ARCH}.AppImage"
else
  echo "ERROR: AppImage was not created."
  exit 1
fi
