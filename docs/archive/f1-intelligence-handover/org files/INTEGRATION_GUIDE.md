# Integration Guide: Adding F1 Intelligence to f1betting Repo

This guide will help you integrate the F1 RAG system into your existing Paddock Picks (f1betting) repository.

## Current Structure (Before)

```
f1betting/
├── public/
│   ├── index.php
│   ├── api/
│   ├── lib/
│   └── ...
├── CLAUDE.md
└── README.md
```

## Target Structure (After)

```
f1betting/
├── public/                         # Main Paddock Picks app (simply.com)
│   ├── index.php
│   ├── api/
│   ├── f1-intelligence/
│   │   └── F1Intelligence.php      # NEW: RAG client
│   └── ...
│
├── f1-intelligence/                # NEW: RAG system
│   ├── api/                        # Vercel deployment
│   │   ├── api/
│   │   │   └── intelligence.js
│   │   ├── data/
│   │   │   ├── f1-knowledge-base.json
│   │   │   └── f1-vector-index.json (generated)
│   │   ├── build-index.js
│   │   ├── query.js
│   │   ├── package.json
│   │   └── vercel.json
│   │
│   ├── docs/
│   │   ├── ARCHITECTURE.md
│   │   ├── DEPLOYMENT.md
│   │   └── LOCAL_TESTING.md
│   │
│   └── README.md                   # F1 Intelligence specific docs
│
├── CLAUDE.md                       # Updated with F1 Intelligence context
└── README.md
```

## Step-by-Step Integration

### Step 1: Navigate to Your f1betting Repo

```bash
cd /path/to/f1betting
```

### Step 2: Create f1-intelligence Directory

```bash
mkdir -p f1-intelligence
```

### Step 3: Copy RAG System Files

From the downloaded f1-rag-repo:

```bash
# Copy API (for Vercel deployment)
cp -r /path/to/f1-rag-repo/api f1-intelligence/

# Copy documentation
cp -r /path/to/f1-rag-repo/docs f1-intelligence/

# Copy F1 Intelligence README
cp /path/to/f1-rag-repo/README.md f1-intelligence/

# Copy HANDOVER docs for reference
cp /path/to/f1-rag-repo/HANDOVER.md f1-intelligence/
```

### Step 4: Copy PHP Integration to Main App

```bash
# Copy F1Intelligence class to f1-intelligence folder
mkdir -p public/f1-intelligence
cp /path/to/f1-rag-repo/paddock-picks-frontend/lib/F1Intelligence.php public/f1-intelligence/

# Optional: Copy test page if you want a standalone demo
mkdir -p public/f1-intelligence-demo
cp /path/to/f1-rag-repo/paddock-picks-frontend/index.php public/f1-intelligence-demo/
cp /path/to/f1-rag-repo/paddock-picks-frontend/config.php public/f1-intelligence-demo/
cp -r /path/to/f1-rag-repo/paddock-picks-frontend/css public/f1-intelligence-demo/
cp -r /path/to/f1-rag-repo/paddock-picks-frontend/js public/f1-intelligence-demo/
```

### Step 5: Update .gitignore

Add to your existing `.gitignore`:

```bash
# F1 Intelligence
f1-intelligence/api/node_modules/
f1-intelligence/api/data/f1-vector-index.json
f1-intelligence/api/.vercel
```

### Step 6: Update CLAUDE.md

Add this section to your existing `CLAUDE.md`:

```markdown
## F1 Intelligence RAG System

**Location:** `f1-intelligence/`

### What It Does

Provides AI-powered F1 racing insights to help users make better podium predictions. Uses Retrieval-Augmented Generation (RAG) with historical F1 data.

### Architecture

- **API:** Node.js serverless functions on Vercel (`f1-intelligence/api/`)
- **Frontend Integration:** PHP client class in `public/f1-intelligence/F1Intelligence.php`
- **Data:** Historical F1 statistics and race results

### How It Works

1. User asks F1 question via Paddock Picks UI
2. PHP makes HTTP request to Vercel API
3. API converts question to embedding (OpenAI)
4. API searches F1 knowledge base using vector similarity
5. API sends context to Claude for answer generation
6. Answer returned to user with sources

### Cost

~$0.01 per query (mostly Claude API)
~$10/month for 1000 queries

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

**PHP Integration:**
Already included in `public/f1-intelligence/F1Intelligence.php` - deployed with main app to simply.com.

### Usage in Paddock Picks

```php
require_once 'f1-intelligence/F1Intelligence.php';

$intelligence = new F1Intelligence('https://your-vercel-app.vercel.app');

$result = $intelligence->query(
    "How has {$driver} performed at {$circuit} historically?"
);

if ($result) {
    echo $result['answer'];
}
```

### Documentation

- `f1-intelligence/README.md` - Overview
- `f1-intelligence/docs/DEPLOYMENT.md` - Deployment guide
- `f1-intelligence/docs/LOCAL_TESTING.md` - Testing procedures
- `f1-intelligence/docs/ARCHITECTURE.md` - System design

### Updating F1 Knowledge Base

1. Edit `f1-intelligence/api/data/f1-knowledge-base.json`
2. Rebuild index: `cd f1-intelligence/api && npm run build-index`
3. Redeploy: `vercel deploy --prod`
```

### Step 7: Git Commit

```bash
git add f1-intelligence/
git add public/f1-intelligence/F1Intelligence.php
git add CLAUDE.md
git add .gitignore

git commit -m "Add F1 Intelligence RAG system

- Added Vercel API in f1-intelligence/api/
- Added PHP client in public/f1-intelligence/F1Intelligence.php
- Updated CLAUDE.md with integration docs
- Includes 10 F1 knowledge documents
- Ready to deploy API to Vercel"
```

## Testing the Integration

### Test 1: Verify Files Are in Place

```bash
# Check API files
ls f1-intelligence/api/

# Check PHP integration
ls public/lib/F1Intelligence.php

# Check documentation
ls f1-intelligence/docs/
```

### Test 2: Test API Locally

```bash
cd f1-intelligence/api
npm install

export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."

npm run build-index
node query.js "How does Verstappen perform at Monaco?"
```

### Test 3: Test PHP Integration

Create a test file `public/test-f1-intelligence.php`:

```php
<?php
require_once 'f1-intelligence/F1Intelligence.php';

// Test with local API (if running vercel dev)
$intelligence = new F1Intelligence('http://localhost:3000', 30, true);

echo "Testing F1 Intelligence integration...\n\n";

// Health check
if ($intelligence->healthCheck()) {
    echo "✅ API connection: OK\n\n";
} else {
    echo "❌ API connection: FAILED\n";
    exit(1);
}

// Test query
$result = $intelligence->query("How does Verstappen perform at Monaco?");

if ($result) {
    echo "✅ Query test: PASS\n";
    echo "Answer: " . substr($result['answer'], 0, 200) . "...\n";
} else {
    echo "❌ Query test: FAILED\n";
}
?>
```

Run it:
```bash
php public/test-f1-intelligence.php
```

## Deployment After Integration

### Deploy API to Vercel

```bash
cd f1-intelligence/api
vercel deploy --prod
```

Note the URL: `https://your-app.vercel.app`

### Update Configuration

In your Paddock Picks code where you use F1Intelligence:

```php
// In production code
$intelligence = new F1Intelligence('https://your-vercel-app.vercel.app');
```

### Deploy to simply.com

Upload `public/` as usual - `F1Intelligence.php` is now included automatically.

## Using F1 Intelligence in Paddock Picks

### Example 1: Race Prediction Form

```php
<?php
// In your race prediction page
require_once 'f1-intelligence/F1Intelligence.php';

if (isset($_GET['circuit']) && isset($_GET['driver'])) {
    $circuit = htmlspecialchars($_GET['circuit']);
    $driver = htmlspecialchars($_GET['driver']);
    
    $intelligence = new F1Intelligence(F1_INTELLIGENCE_API_URL);
    $insight = $intelligence->query(
        "What should I know about {$driver} at {$circuit} for making a podium prediction?"
    );
    
    if ($insight) {
        echo "<div class='ai-insight'>";
        echo "<h3>💡 F1 Intelligence</h3>";
        echo "<p>{$insight['answer']}</p>";
        echo "<div class='sources'>";
        echo "<small>Based on: ";
        foreach ($insight['sources'] as $i => $source) {
            echo $source['title'];
            if ($i < count($insight['sources']) - 1) echo ", ";
        }
        echo "</small></div>";
        echo "</div>";
    }
}
?>
```

### Example 2: Pre-Race Briefing

```php
<?php
// Generate race briefing
require_once 'f1-intelligence/F1Intelligence.php';

function generateRaceBriefing($raceName) {
    $intelligence = new F1Intelligence(F1_INTELLIGENCE_API_URL);
    
    $questions = [
        "What are the key statistics for {$raceName}?",
        "What's the pole position conversion rate at {$raceName}?",
        "What weather should I expect at {$raceName}?"
    ];
    
    $briefing = [];
    foreach ($questions as $question) {
        $result = $intelligence->query($question);
        if ($result) {
            $briefing[] = $result['answer'];
        }
    }
    
    return implode("\n\n", $briefing);
}
?>
```

### Example 3: Contextual Help Tooltip

```javascript
// In your frontend JS
async function showDriverInsight(driver, circuit) {
    const response = await fetch('/api/f1-intelligence-proxy.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            question: `Quick stat about ${driver} at ${circuit}?`
        })
    });
    
    const data = await response.json();
    showTooltip(data.answer);
}
```

## Configuration

### Add to Your Config File

If you have a `config.php` or similar:

```php
// F1 Intelligence API Configuration
define('F1_INTELLIGENCE_API_URL', getenv('F1_INTELLIGENCE_API_URL') ?: 'http://localhost:3000');
define('F1_INTELLIGENCE_TIMEOUT', 30);
define('F1_INTELLIGENCE_DEBUG', false); // Set to true for development
```

### Environment Variables

For production on simply.com, you can set environment variables or just hardcode:

```php
define('F1_INTELLIGENCE_API_URL', 'https://your-vercel-app.vercel.app');
```

## Maintenance

### Updating F1 Knowledge Base

1. Edit `f1-intelligence/api/data/f1-knowledge-base.json`
2. Add new race results, driver stats, circuit info
3. Rebuild index:
   ```bash
   cd f1-intelligence/api
   npm run build-index
   ```
4. Commit and redeploy:
   ```bash
   git add f1-intelligence/api/data/
   git commit -m "Update F1 knowledge base"
   vercel deploy --prod
   ```

### Monitoring Costs

- OpenAI: https://platform.openai.com/usage
- Anthropic: https://console.anthropic.com/settings/billing

## Troubleshooting

### "Class 'F1Intelligence' not found"

Make sure you're including the file:
```php
require_once __DIR__ . '/f1-intelligence/F1Intelligence.php';
```

### "API unavailable"

Check:
1. Vercel deployment is live
2. API URL is correct in your config
3. Test directly: `curl https://your-app.vercel.app/api/intelligence`

### Different directory structure?

Adjust paths as needed. The key files are:
- `f1-intelligence/api/` - Must stay together for Vercel
- `public/f1-intelligence/F1Intelligence.php` - Can go anywhere, just update require paths

## Next Steps After Integration

1. ✅ Test locally: `f1-intelligence/docs/LOCAL_TESTING.md`
2. ✅ Deploy API: `f1-intelligence/docs/DEPLOYMENT.md`
3. ✅ Integrate into Paddock Picks UI
4. ✅ Add caching if query volume is high
5. ✅ Expand F1 knowledge base with more data

## Questions for Claude Code

Once integrated, you can ask Claude Code:

```
I've integrated F1 Intelligence into f1betting/. 
Read f1-intelligence/CLAUDE.md section in CLAUDE.md.

Help me:
1. Test the API locally
2. Deploy to Vercel
3. Add an F1 Intelligence feature to the race prediction form
```

🏁 **Integration complete! Your f1betting repo now includes AI-powered F1 insights.**
