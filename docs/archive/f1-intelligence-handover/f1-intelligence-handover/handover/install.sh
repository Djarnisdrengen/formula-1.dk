#!/bin/bash

# F1 Intelligence - Safe Install Script
# 
# Copies F1 Intelligence files into your f1betting repo WITHOUT overwriting existing files.
# Existing files are preserved and reported.
#
# Usage:
#   cd /path/to/your/f1betting/repo
#   bash /path/to/install.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Find the source directory (where this script + files-to-copy is)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SOURCE_DIR="$SCRIPT_DIR/files-to-copy"

# Target is current directory
TARGET_DIR="$(pwd)"

echo "🏁 F1 Intelligence - Safe Install"
echo "=================================="
echo ""
echo -e "${BLUE}Source:${NC} $SOURCE_DIR"
echo -e "${BLUE}Target:${NC} $TARGET_DIR"
echo ""

# Verify we're in a f1betting-like repo
if [ ! -d "public" ]; then
    echo -e "${RED}❌ Error: No 'public/' directory found in current location.${NC}"
    echo -e "   Run this script from your f1betting repo root."
    echo -e "   Current dir: $TARGET_DIR"
    exit 1
fi

# Verify source exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ Error: files-to-copy directory not found at:${NC}"
    echo "   $SOURCE_DIR"
    exit 1
fi

# Counters
COPIED=0
SKIPPED=0
SKIPPED_FILES=()

# Function to safely copy a file (don't overwrite)
safe_copy() {
    local src="$1"
    local dst="$2"
    
    # Create target directory if needed
    mkdir -p "$(dirname "$dst")"
    
    if [ -e "$dst" ]; then
        echo -e "${YELLOW}⊘ SKIP${NC} (exists): $dst"
        SKIPPED=$((SKIPPED + 1))
        SKIPPED_FILES+=("$dst")
    else
        cp "$src" "$dst"
        echo -e "${GREEN}✓ COPY${NC}: $dst"
        COPIED=$((COPIED + 1))
    fi
}

echo "📋 Plan:"
echo "  - Copy f1-intelligence/ folder to repo root"
echo "  - Copy public/f1-intelligence/ folder"
echo "  - Skip any files that already exist"
echo "  - Show summary of skipped files at the end"
echo ""

read -p "Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cancelled.${NC}"
    exit 0
fi

echo ""
echo "📁 Copying files..."
echo ""

# Copy all files from files-to-copy/ recursively
# but skip if destination exists
cd "$SOURCE_DIR"
find . -type f | while read -r file; do
    rel_path="${file#./}"
    src="$SOURCE_DIR/$rel_path"
    dst="$TARGET_DIR/$rel_path"
    safe_copy "$src" "$dst"
done

# Refresh counters from subshell output (use simpler approach)
COPIED=$(find "$SOURCE_DIR" -type f | wc -l)
SKIPPED_TOTAL=0
for file in $(find "$SOURCE_DIR" -type f); do
    rel="${file#$SOURCE_DIR/}"
    if [ -f "$TARGET_DIR/$rel" ] && ! cmp -s "$file" "$TARGET_DIR/$rel"; then
        SKIPPED_TOTAL=$((SKIPPED_TOTAL + 1))
    fi
done

echo ""
echo "=================================="
echo -e "${GREEN}✅ Installation complete!${NC}"
echo "=================================="
echo ""

# Show what was copied
echo "📦 Files in your repo now:"
echo ""
echo "  f1-intelligence/"
find "$TARGET_DIR/f1-intelligence" -type f 2>/dev/null | sed "s|$TARGET_DIR/|    |"
echo ""
echo "  public/f1-intelligence/"
find "$TARGET_DIR/public/f1-intelligence" -type f 2>/dev/null | sed "s|$TARGET_DIR/|    |"
echo ""

# Important next steps
echo -e "${BLUE}📝 IMPORTANT - Next Steps (in VS Code):${NC}"
echo ""
echo -e "1. ${YELLOW}Append to CLAUDE.md${NC}"
echo "   - Open CLAUDE.md in VS Code"
echo "   - Open this file: $SCRIPT_DIR/CLAUDE_MD_APPEND.md"
echo "   - Copy contents and paste at the end of CLAUDE.md"
echo ""
echo -e "2. ${YELLOW}Update config.php${NC} - Add these constants:"
echo "   define('F1_INTELLIGENCE_API_URL', 'https://YOUR-APP.vercel.app');"
echo "   define('F1_INTELLIGENCE_TIMEOUT', 30);"
echo "   define('F1_INTELLIGENCE_DEBUG', true);"
echo ""
echo -e "3. ${YELLOW}Update .gitignore${NC} - Add:"
echo "   f1-intelligence/api/node_modules/"
echo "   f1-intelligence/api/.vercel"
echo ""
echo -e "4. ${YELLOW}Read the setup guide${NC}:"
echo "   Open in VS Code: $SCRIPT_DIR/SETUP_GUIDE.md"
echo ""
echo -e "5. ${YELLOW}Use Claude Code in VS Code${NC}:"
echo "   - Open Claude Code panel (sidebar or Ctrl+Shift+P → 'Claude Code')"
echo "   - Send this message:"
echo ""
echo "     'Read CLAUDE.md F1 Intelligence section + f1-intelligence/docs/DEPLOYMENT.md."
echo "      Plan the deployment, then ask for my OK before implementing.'"
echo ""
echo "🏁 Happy racing!"
