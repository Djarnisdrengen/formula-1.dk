# Prerequisites & Setup Guide
## F1 Intelligence RAG System - Starting from Scratch

This guide assumes:
- ✅ You have access to hpovslen.dk (test server)
- ✅ You have access to formula-1.dk (live server)
- ❌ No local development environment needed
- ✅ Using Claude Code to work with the repository

## Phase 1: Create Accounts & Get API Keys

### 1.1 Create Vercel Account (API Hosting - FREE)

**What it is:** Vercel will host your RAG API (the Node.js part)

**Steps:**
1. Go to https://vercel.com/signup
2. Click "Continue with GitHub" (recommended) or use email
3. Complete signup
4. **Important:** Note your account email - you'll need it later

**Cost:** $0 (free tier is enough)

---

### 1.2 Get OpenAI API Key (for Embeddings)

**What it is:** Converts text to vector embeddings for search

**Steps:**
1. Go to https://platform.openai.com/signup
2. Create account (or login if you have ChatGPT account)
3. Add payment method:
   - Go to https://platform.openai.com/account/billing/overview
   - Click "Add payment method"
   - Add credit card (they'll charge ~$5 minimum)
4. Create API key:
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name it: "F1 Intelligence RAG"
   - Click "Create secret key"
   - **IMPORTANT:** Copy the key immediately (starts with `sk-proj-...`)
   - Save it somewhere safe - you can't see it again!

**Expected cost:** 
- Initial setup (build index): ~$0.0002
- Per query: ~$0.00002
- Monthly (1000 queries): ~$0.02

---

### 1.3 Get Anthropic API Key (for Claude)

**What it is:** Claude generates the actual answers

**Steps:**
1. Go to https://console.anthropic.com/
2. Sign up with email
3. Go to "Settings" → "API Keys"
4. Click "Create Key"
5. Name it: "F1 Intelligence"
6. Click "Create Key"
7. **IMPORTANT:** Copy the key (starts with `sk-ant-...`)
8. Save it somewhere safe

**Add credits:**
1. Go to "Settings" → "Billing"
2. Click "Purchase Credits"
3. Add $20-50 (recommended starting amount)

**Expected cost:**
- Per query: ~$0.01
- Monthly (1000 queries): ~$10

---

### 1.4 Install Vercel CLI (on your computer)

**What it is:** Command-line tool to deploy to Vercel

**Steps:**

**Option A - If you have Node.js installed:**
```bash
npm install -g vercel
```

**Option B - If you don't have Node.js:**
1. Download Node.js: https://nodejs.org/en/download/
2. Install it (use all default options)
3. Open terminal/command prompt
4. Run: `npm install -g vercel`

**Verify installation:**
```bash
vercel --version
# Should show: Vercel CLI 33.x.x (or similar)
```

---

## Phase 2: Prepare Your Repository

### 2.1 Download f1-rag-repo

Download the files from our conversation above:
- `f1-rag-repo/` (entire folder)
- `integrate-f1-intelligence.sh`
- `INTEGRATION_GUIDE.md`

Save them to: `/Users/yourname/f1-projects/f1-rag-repo/`

---

### 2.2 Integrate into f1betting Repository

**If you have f1betting repo locally:**

```bash
cd /path/to/f1betting

# Run integration script
chmod +x /path/to/integrate-f1-intelligence.sh
./path/to/integrate-f1-intelligence.sh /path/to/f1-rag-repo
```

**If f1betting is only on servers:**

You'll manually create the structure on the test server (we'll do this in Phase 4).

---

## Phase 3: Build the Vector Index

This creates the searchable F1 knowledge base.

### 3.1 Navigate to API Folder

```bash
cd f1-rag-repo/api
# or if integrated: cd f1betting/f1-intelligence/api
```

### 3.2 Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 15 packages in 3s
```

### 3.3 Set API Keys (Temporary)

**On Mac/Linux:**
```bash
export OPENAI_API_KEY="sk-proj-xxxxx"  # Your OpenAI key
export ANTHROPIC_API_KEY="sk-ant-xxxxx"  # Your Anthropic key
```

**On Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=sk-proj-xxxxx
set ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**On Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="sk-proj-xxxxx"
$env:ANTHROPIC_API_KEY="sk-ant-xxxxx"
```

### 3.4 Build the Vector Index

```bash
npm run build-index
```

**Expected output:**
```
📚 Loading F1 knowledge base...
📊 Found 10 documents to index
🔄 Processing [1/10]: Monaco Grand Prix 2023 - Race Results
🔄 Processing [2/10]: Max Verstappen's Monaco Track Record
...
💾 Saving vector index...
✅ Index built successfully!
   Documents indexed: 10
   Embedding dimension: 1536
   Estimated cost: $0.0002
```

**This creates:** `data/f1-vector-index.json` (~500KB file)

**If you get errors:**
- "OPENAI_API_KEY not set" → Re-export the keys (step 3.3)
- "Invalid API key" → Double-check your OpenAI key
- "Rate limit" → Wait 1 minute and try again

---

## Phase 4: Deploy API to Vercel

### 4.1 Login to Vercel CLI

```bash
vercel login
```

This opens your browser. Click "Confirm" to authorize.

### 4.2 Deploy

```bash
# Make sure you're still in the api/ directory
vercel deploy --prod
```

**Follow the prompts:**

```
? Set up and deploy "~/f1betting/f1-intelligence/api"? [Y/n] Y
? Which scope do you want to deploy to? [Your account name]
? Link to existing project? [y/N] N
? What's your project's name? f1-intelligence-api
? In which directory is your code located? ./
```

**Expected output:**
```
🔗 Deploying to production...
✅ Deployment ready
https://f1-intelligence-api-xxxxx.vercel.app
```

**IMPORTANT:** Copy this URL! You'll need it for configuration.

Example: `https://f1-intelligence-api-abc123.vercel.app`

### 4.3 Set Environment Variables in Vercel

**Option A - Via Dashboard (Recommended):**
1. Go to https://vercel.com/dashboard
2. Click your project: "f1-intelligence-api"
3. Go to "Settings" tab
4. Click "Environment Variables" in left sidebar
5. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `OPENAI_API_KEY` | `sk-proj-xxxxx` | Production |
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxx` | Production |

6. Click "Save"
7. Go to "Deployments" tab
8. Click "⋯" next to latest deployment
9. Click "Redeploy"

**Option B - Via CLI:**
```bash
vercel env add OPENAI_API_KEY
# Paste your OpenAI key when prompted
# Select "Production"

vercel env add ANTHROPIC_API_KEY
# Paste your Anthropic key when prompted
# Select "Production"

# Redeploy to apply
vercel deploy --prod
```

### 4.4 Test the Deployed API

```bash
curl -X POST https://your-vercel-url.vercel.app/api/intelligence \
  -H "Content-Type: application/json" \
  -d '{"question": "How does Verstappen perform at Monaco?"}'
```

**Expected response (abbreviated):**
```json
{
  "answer": "Max Verstappen has a solid track record at Monaco...",
  "sources": [...]
}
```

**If you get an error:**
- Check that environment variables are set
- Wait 30 seconds and try again (deployment takes time)
- Check Vercel logs: `vercel logs`

---

## Phase 5: Configure PHP Integration

### 5.1 Update Configuration File

**If you have a config.php in your f1betting repo:**

Add this section:

```php
// F1 Intelligence Configuration
define('F1_INTELLIGENCE_API_URL', 'https://f1-intelligence-api-xxxxx.vercel.app');
define('F1_INTELLIGENCE_TIMEOUT', 30);
define('F1_INTELLIGENCE_DEBUG', true); // Set to false in production
```

**Replace** `https://f1-intelligence-api-xxxxx.vercel.app` with your actual Vercel URL from step 4.2.

**If you don't have a config.php:**

Create `public/config.php`:

```php
<?php
/**
 * Paddock Picks Configuration
 */

// Database (existing settings)
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database');
define('DB_USER', 'your_user');
define('DB_PASS', 'your_password');

// F1 Intelligence RAG System
define('F1_INTELLIGENCE_API_URL', 'https://f1-intelligence-api-xxxxx.vercel.app');
define('F1_INTELLIGENCE_TIMEOUT', 30);
define('F1_INTELLIGENCE_DEBUG', true); // Set false on formula-1.dk
?>
```

### 5.2 Create F1Intelligence Class

If you integrated using the script, this is already done.

If doing manually, create `public/f1-intelligence/F1Intelligence.php`:

```bash
# Copy from f1-rag-repo
mkdir -p public/f1-intelligence
cp /path/to/f1-rag-repo/paddock-picks-frontend/lib/F1Intelligence.php \
   public/f1-intelligence/
```

---

## Phase 6: Upload to Test Server (hpovslen.dk)

### 6.1 Files to Upload via FTP

Upload these files to hpovslen.dk:

```
Upload to hpovslen.dk:
├── public/f1-intelligence/
│   └── F1Intelligence.php          # PHP client class
├── public/config.php                # Updated with API URL
└── public/test-f1-intelligence.php  # Test page (create below)
```

### 6.2 Create Test Page

Create `public/test-f1-intelligence.php`:

```php
<?php
require_once 'config.php';
require_once 'f1-intelligence/F1Intelligence.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>F1 Intelligence Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        pre { background: #f5f5f5; padding: 15px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🏁 F1 Intelligence Test Page</h1>
    
    <?php
    echo "<p><strong>API URL:</strong> " . F1_INTELLIGENCE_API_URL . "</p>";
    
    $intelligence = new F1Intelligence(F1_INTELLIGENCE_API_URL, 30, true);
    
    // Test 1: Health Check
    echo "<h2>Test 1: API Health Check</h2>";
    if ($intelligence->healthCheck()) {
        echo "<p class='success'>✅ API is reachable!</p>";
    } else {
        echo "<p class='error'>❌ Cannot reach API</p>";
        echo "<p>Check that:</p>";
        echo "<ul>";
        echo "<li>Vercel deployment is live</li>";
        echo "<li>API URL in config.php is correct</li>";
        echo "<li>Environment variables are set in Vercel</li>";
        echo "</ul>";
        exit;
    }
    
    // Test 2: Query Test
    echo "<h2>Test 2: Query Test</h2>";
    echo "<p>Asking: <em>How does Verstappen perform at Monaco?</em></p>";
    
    $result = $intelligence->query("How does Verstappen perform at Monaco?");
    
    if ($result) {
        echo "<p class='success'>✅ Query successful!</p>";
        echo "<h3>Answer:</h3>";
        echo "<p>" . nl2br(htmlspecialchars($result['answer'])) . "</p>";
        
        echo "<h3>Sources:</h3>";
        echo "<ul>";
        foreach ($result['sources'] as $source) {
            echo "<li>" . htmlspecialchars($source['title']) . "</li>";
        }
        echo "</ul>";
        
        echo "<h3>Raw Response:</h3>";
        echo "<pre>" . htmlspecialchars(json_encode($result, JSON_PRETTY_PRINT)) . "</pre>";
    } else {
        echo "<p class='error'>❌ Query failed</p>";
    }
    ?>
    
    <hr>
    <p><small>Test page: test-f1-intelligence.php</small></p>
</body>
</html>
```

### 6.3 Upload via FTP

**Using FileZilla:**
1. Connect to hpovslen.dk FTP
2. Navigate to `public_html/`
3. Upload:
   - `f1-intelligence/` folder
   - `config.php` (or update existing)
   - `test-f1-intelligence.php`

**Using command line:**
```bash
# If you have lftp installed
lftp ftp://hpovslen.dk
> login your_username
> cd public_html
> mirror -R public/f1-intelligence f1-intelligence
> put public/config.php
> put public/test-f1-intelligence.php
> quit
```

### 6.4 Test on hpovslen.dk

Visit: `https://hpovslen.dk/test-f1-intelligence.php`

**Expected result:**
- ✅ Test 1: API Health Check → Green
- ✅ Test 2: Query Test → Shows answer about Verstappen at Monaco

**If you see errors:**
- Check that `config.php` has the correct Vercel URL
- Check that files uploaded correctly
- Check PHP error logs on server

---

## Phase 7: Deploy to Live (formula-1.dk)

### 7.1 Update config.php for Production

```php
// In config.php - set debug to false
define('F1_INTELLIGENCE_DEBUG', false);
```

### 7.2 Upload Same Files to formula-1.dk

Upload via FTP:
- `public/f1-intelligence/F1Intelligence.php`
- `public/config.php` (with debug=false)
- Optionally: `test-f1-intelligence.php` (to verify)

### 7.3 Verify on Live

Visit: `https://formula-1.dk/test-f1-intelligence.php`

Should work the same as test server.

---

## Summary Checklist

**Accounts & Keys:**
- [ ] Vercel account created
- [ ] OpenAI API key obtained (starts with `sk-proj-`)
- [ ] Anthropic API key obtained (starts with `sk-ant-`)
- [ ] Vercel CLI installed on computer

**API Deployment:**
- [ ] Vector index built (`f1-vector-index.json` exists)
- [ ] API deployed to Vercel
- [ ] Vercel URL noted: `https://________.vercel.app`
- [ ] Environment variables set in Vercel dashboard
- [ ] API tested with curl (returns JSON response)

**PHP Integration:**
- [ ] `F1Intelligence.php` uploaded to test server
- [ ] `config.php` updated with Vercel URL
- [ ] Test page works on hpovslen.dk
- [ ] Deployed to formula-1.dk (when ready)

---

## Cost Summary

**One-time:**
- Vercel account: $0
- OpenAI initial credit: $5
- Anthropic initial credit: $20
- **Total: $25**

**Monthly (1000 queries):**
- Vercel hosting: $0
- OpenAI: $0.02
- Anthropic: $10
- **Total: ~$10/month**

**Per query:** ~$0.01

---

## Next Steps

Once everything is working:
1. Integrate into your Paddock Picks prediction forms
2. Add F1 Intelligence insights to race pages
3. Expand the knowledge base with more F1 data
4. Consider adding caching to reduce API costs

---

## Troubleshooting

### "Module not found" during npm install
- Make sure you're in the `api/` directory
- Try deleting `node_modules/` and running `npm install` again

### "Invalid API key" from OpenAI
- Double-check the key starts with `sk-proj-`
- Make sure there are no extra spaces
- Create a new key if needed

### "Cannot reach API" on test server
- Verify Vercel URL in `config.php` is correct
- Test the Vercel API directly with curl
- Check Vercel deployment logs: https://vercel.com/dashboard

### PHP shows blank page
- Check PHP error logs on hpovslen.dk
- Make sure `require_once` paths are correct
- Verify `F1Intelligence.php` uploaded correctly

### Queries are slow (>10 seconds)
- Normal for first query (cold start)
- Subsequent queries should be 2-4 seconds
- If always slow, check network connection

---

Ready to start? Begin with **Phase 1: Create Accounts & Get API Keys**!
