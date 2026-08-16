#!/usr/bin/env bash
# Optimize static images for the landing page.
# Requires: cwebp (libwebp) and ImageMagick's `file` are optional for verification.
#
# This script converts landing PNG screenshots to WebP and downscales desktop
# theme assets to 2× their max display width. Mobile screenshots are already
# ~2× display size, so they are only converted.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$ROOT/public/images/landing"
QUALITY=85

if ! command -v cwebp >/dev/null 2>&1; then
  echo "Error: cwebp not found. Install libwebp: brew install webp"
  exit 1
fi

echo "Optimizing images in $SRC_DIR ..."

# Desktop theme screenshots are displayed at ~640px max; 1280px source is 2×.
for name in theme-ocean-desktop theme-sky-desktop theme-cloud-desktop; do
  src="$SRC_DIR/$name.png"
  dst="$SRC_DIR/$name.webp"
  if [[ -f "$src" ]]; then
    echo "  $name.png -> $name.webp (resize to 1280px)"
    cwebp -q "$QUALITY" -resize 1280 0 "$src" -o "$dst"
  fi
done

# Sheets screenshot is displayed at ~1024px max; 1440px source is already fine.
if [[ -f "$SRC_DIR/sheets-connect.png" ]]; then
  echo "  sheets-connect.png -> sheets-connect.webp"
  cwebp -q "$QUALITY" "$SRC_DIR/sheets-connect.png" -o "$SRC_DIR/sheets-connect.webp"
fi

# Mobile editor and question-type screenshots are 750px wide, displayed at
# ~340-390px, so no resize is needed.
for src in "$SRC_DIR"/mobile-editor-*.png "$SRC_DIR"/*.png; do
  [[ -f "$src" ]] || continue
  name=$(basename "$src" .png)
  # Skip assets handled above and unused legacy files.
  case "$name" in
    theme-ocean-desktop|theme-sky-desktop|theme-cloud-desktop|sheets-connect|step-1|step-2)
      continue
      ;;
  esac
  dst="$SRC_DIR/$name.webp"
  echo "  $name.png -> $name.webp"
  cwebp -q "$QUALITY" "$src" -o "$dst"
done

# Remove unused legacy step images if they exist.
for unused in step-1 step-2; do
  if [[ -f "$SRC_DIR/$unused.png" ]]; then
    echo "  removing unused $unused.png"
    rm "$SRC_DIR/$unused.png"
  fi
done

echo "Done."
echo ""
echo "Before committing, update image references from .png to .webp and run:"
echo "  pnpm build"
