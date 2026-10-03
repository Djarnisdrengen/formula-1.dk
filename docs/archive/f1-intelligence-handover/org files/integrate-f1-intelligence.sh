#!/bin/bash

# F1 Intelligence Integration Script
# Automatically integrates the RAG system into your f1betting repository

set -e  # Exit on error

echo "🏁 F1 Intelligence Integration Script"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "CLAUDE.md" ]; then
    echo "❌ Error: CLAUDE.md not found. Are you in the f1betting directory?"
    echo "   Run this script from your f1betting repo root."
    exit 1
fi

# Check if f1-rag-repo path is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide the path to f1-rag-repo"
    echo ""
    echo "Usage: ./integrate-f1-intelligence.sh /path/to/f1-rag-repo"
    echo ""
    echo "Example: ./integrate-f1-intelligence.sh ~/Downloads/f1-rag-repo"
    exit 1
fi

F1_RAG_PATH="$1"

# Verify f1-rag-repo exists
if [ ! -d "$F1_RAG_PATH" ]; then
    echo "❌ Error: Directory not found: $F1_RAG_PATH"
    exit 1
fi

echo "📂 Source: $F1_RAG_PATH"
echo "📂 Target: $(pwd)"
echo ""

# Ask for confirmation
read -p "Continue with integration? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Integration cancelled."
    exit 1
fi

echo ""
echo "🔧 Starting integration..."
echo ""

# Step 1: Create f1-intelligence directory
echo "1️⃣  Creating f1-intelligence directory..."
mkdir -p f1-intelligence

# Step 2: Copy API
echo "2️⃣  Copying API files..."
cp -r "$F1_RAG_PATH/api" f1-intelligence/

# Step 3: Copy documentation
echo "3️⃣  Copying documentation..."
cp -r "$F1_RAG_PATH/docs" f1-intelligence/

# Step 4: Copy README
echo "4️⃣  Copying F1 Intelligence README..."
cp "$F1_RAG_PATH/README.md" f1-intelligence/
cp "$F1_RAG_PATH/HANDOVER.md" f1-intelligence/

# Step 5: Copy PHP integration
echo "5️⃣  Copying PHP integration..."
mkdir -p public/f1-intelligence
cp "$F1_RAG_PATH/paddock-picks-frontend/lib/F1Intelligence.php" public/f1-intelligence/

# Step 6: Optional - copy demo page
read -p "Copy standalone demo page? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "6️⃣  Copying demo page..."
    mkdir -p public/f1-intelligence-demo
    cp "$F1_RAG_PATH/paddock-picks-frontend/index.php" public/f1-intelligence-demo/
    cp "$F1_RAG_PATH/paddock-picks-frontend/config.php" public/f1-intelligence-demo/
    cp -r "$F1_RAG_PATH/paddock-picks-frontend/css" public/f1-intelligence-demo/
    cp -r "$F1_RAG_PATH/paddock-picks-frontend/js" public/f1-intelligence-demo/
    echo "   ✅ Demo page installed at public/f1-intelligence-demo/"
else
    echo "6️⃣  Skipping demo page..."
fi

# Step 7: Update .gitignore
echo "7️⃣  Updating .gitignore..."
if [ -f ".gitignore" ]; then
    if ! grep -q "f1-intelligence" .gitignore; then
        echo "" >> .gitignore
        echo "# F1 Intelligence" >> .gitignore
        echo "f1-intelligence/api/node_modules/" >> .gitignore
        echo "f1-intelligence/api/data/f1-vector-index.json" >> .gitignore
        echo "f1-intelligence/api/.vercel" >> .gitignore
    fi
else
    echo "# F1 Intelligence" > .gitignore
    echo "f1-intelligence/api/node_modules/" >> .gitignore
    echo "f1-intelligence/api/data/f1-vector-index.json" >> .gitignore
    echo "f1-intelligence/api/.vercel" >> .gitignore
fi

# Step 8: Update CLAUDE.md
echo "8️⃣  Updating CLAUDE.md..."
if [ -f "CLAUDE.md" ]; then
    if ! grep -q "F1 Intelligence RAG System" CLAUDE.md; then
        cat >> CLAUDE.md << 'EOF'

## F1 Intelligence RAG System

**Location:** `f1-intelligence/`

### What It Does

Provides AI-powered F1 racing insights to help users make better podium predictions. Uses Retrieval-Augmented Generation (RAG) with historical F1 data.

### Architecture

- **API:** Node.js serverless functions on Vercel (`f1-intelligence/api/`)
- **Frontend Integration:** PHP client class in `public/f1-intelligence/F1Intelligence.php`
- **Data:** Historical F1 statistics and race results

### Deployment

**API to Vercel:**
```bash
cd f1-intelligence/api
npm install
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
npm run build-index  # One time
vercel deploy --prod
```

**PHP Integration:** Already included in `public/lib/F1Intelligence.php`.

### Usage

```php
require_once 'f1-intelligence/F1Intelligence.php';
$intelligence = new F1Intelligence('https://your-vercel-app.vercel.app');
$result = $intelligence->query("How has {$driver} performed at {$circuit}?");
```

### Documentation

- `f1-intelligence/README.md` - Overview
- `f1-intelligence/docs/DEPLOYMENT.md` - Deployment guide
- `f1-intelligence/docs/LOCAL_TESTING.md` - Testing procedures
EOF
    fi
fi

echo ""
echo "✅ Integration complete!"
echo ""
echo "📋 Summary:"
echo "   ✅ f1-intelligence/ created with API and docs"
echo "   ✅ public/f1-intelligence/F1Intelligence.php added"
echo "   ✅ .gitignore updated"
echo "   ✅ CLAUDE.md updated"
echo ""
echo "📦 Files added:"
echo "   - f1-intelligence/api/ (Vercel deployment)"
echo "   - f1-intelligence/docs/ (Documentation)"
echo "   - public/f1-intelligence/F1Intelligence.php (PHP client)"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Review changes:"
echo "   git status"
echo ""
echo "2. Test locally (see f1-intelligence/docs/LOCAL_TESTING.md):"
echo "   cd f1-intelligence/api"
echo "   npm install"
echo "   npm run build-index"
echo "   node query.js \"How does Verstappen perform at Monaco?\""
echo ""
echo "3. Commit changes:"
echo "   git add f1-intelligence/ public/f1-intelligence/ .gitignore CLAUDE.md"
echo "   git commit -m \"Add F1 Intelligence RAG system\""
echo ""
echo "4. Deploy API to Vercel:"
echo "   cd f1-intelligence/api"
echo "   vercel deploy --prod"
echo ""
echo "5. Or use Claude Code:"
echo "   claude-code ."
echo "   Then: 'Read CLAUDE.md, help me deploy F1 Intelligence'"
echo ""
echo "🏁 Happy racing!"
