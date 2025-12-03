#!/bin/bash

# Generate PWA icons from logo.png
# This script uses ImageMagick to create all required icon sizes

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   PWA Icon Generator for Etags${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo -e "${YELLOW}⚠️  ImageMagick is not installed!${NC}"
    echo "Please install it first:"
    echo "  - Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  - macOS: brew install imagemagick"
    echo "  - Fedora: sudo dnf install imagemagick"
    exit 1
fi

# Check if logo.png exists
if [ ! -f "public/logo.png" ]; then
    echo -e "${YELLOW}⚠️  public/logo.png not found!${NC}"
    echo "Please ensure logo.png exists in the public directory."
    exit 1
fi

echo -e "${GREEN}✓${NC} ImageMagick found"
echo -e "${GREEN}✓${NC} Logo source: public/logo.png"
echo ""

# Get logo dimensions
LOGO_INFO=$(file public/logo.png)
echo "Logo info: $LOGO_INFO"
echo ""

echo "Generating icons..."
echo ""

# Generate favicon sizes
echo -e "${BLUE}→${NC} Generating favicon-16x16.png (16x16)"
convert public/logo.png -resize 16x16 public/favicon-16x16.png
echo -e "${GREEN}✓${NC} public/favicon-16x16.png"

echo -e "${BLUE}→${NC} Generating favicon-32x32.png (32x32)"
convert public/logo.png -resize 32x32 public/favicon-32x32.png
echo -e "${GREEN}✓${NC} public/favicon-32x32.png"

# Generate multi-size favicon.ico
echo -e "${BLUE}→${NC} Generating favicon.ico (multi-size: 16, 32, 48)"
convert public/logo.png -define icon:auto-resize=16,32,48 public/favicon.ico
echo -e "${GREEN}✓${NC} public/favicon.ico"

# Generate Apple touch icon
echo -e "${BLUE}→${NC} Generating apple-touch-icon.png (180x180)"
convert public/logo.png -resize 180x180 public/apple-touch-icon.png
echo -e "${GREEN}✓${NC} public/apple-touch-icon.png"

# Generate PWA icons
echo -e "${BLUE}→${NC} Generating icon-192.png (192x192)"
convert public/logo.png -resize 192x192 public/icon-192.png
echo -e "${GREEN}✓${NC} public/icon-192.png"

echo -e "${BLUE}→${NC} Generating icon-512.png (512x512)"
convert public/logo.png -resize 512x512 public/icon-512.png
echo -e "${GREEN}✓${NC} public/icon-512.png"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✓ All icons generated successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Generated files:"
echo "  • favicon-16x16.png    (16x16)"
echo "  • favicon-32x32.png    (32x32)"
echo "  • favicon.ico          (multi-size)"
echo "  • apple-touch-icon.png (180x180)"
echo "  • icon-192.png         (192x192)"
echo "  • icon-512.png         (512x512)"
echo ""
echo -e "${BLUE}ℹ${NC}  To regenerate icons after updating logo.png, run:"
echo "    npm run generate:icons"
echo ""
