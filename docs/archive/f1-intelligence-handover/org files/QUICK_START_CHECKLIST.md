# Quick Start Checklist
## Get F1 Intelligence Running in 30 Minutes

Use this checklist to track your progress. Follow PREREQUISITES_SETUP.md for detailed instructions.

## □ Phase 1: Accounts (15 minutes)

### □ 1.1 Vercel Account
- [ ] Go to https://vercel.com/signup
- [ ] Sign up with GitHub or email
- [ ] Verify email
- [ ] Note: This is FREE

### □ 1.2 OpenAI API Key
- [ ] Go to https://platform.openai.com/signup
- [ ] Create account
- [ ] Add payment method ($5 minimum)
- [ ] Go to https://platform.openai.com/api-keys
- [ ] Create new key: "F1 Intelligence RAG"
- [ ] **SAVE KEY:** `sk-proj-_____________________`
- [ ] Cost: ~$0.02/month for 1000 queries

### □ 1.3 Anthropic API Key
- [ ] Go to https://console.anthropic.com/
- [ ] Create account
- [ ] Go to Settings → Billing
- [ ] Purchase $20-50 credits
- [ ] Go to Settings → API Keys
- [ ] Create new key: "F1 Intelligence"
- [ ] **SAVE KEY:** `sk-ant-_____________________`
- [ ] Cost: ~$10/month for 1000 queries

### □ 1.4 Install Vercel CLI
- [ ] Download Node.js: https://nodejs.org/
- [ ] Install Node.js (if not already installed)
- [ ] Open terminal and run: `npm install -g vercel`
- [ ] Verify: `vercel --version`

**Your API Keys (fill in):**
```
OPENAI_API_KEY=sk-proj-_________________________________
ANTHROPIC_API_KEY=sk-ant-_______________________________
```

---

## □ Phase 2: Build Vector Index (5 minutes)

### □ 2.1 Navigate to API Folder
```bash
cd /path/to/f1-rag-repo/api
# or: cd /path/to/f1betting/f1-intelligence/api
```

### □ 2.2 Install Dependencies
```bash
npm install
```
- [ ] Completed without errors

### □ 2.3 Set Environment Variables

**Mac/Linux:**
```bash
export OPENAI_API_KEY="sk-proj-xxxxx"
export ANTHROPIC_API_KEY="sk-ant-xxxxx"
```

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="sk-proj-xxxxx"
$env:ANTHROPIC_API_KEY="sk-ant-xxxxx"
```

- [ ] Keys exported

### □ 2.4 Build Index
```bash
npm run build-index
```

- [ ] See: "✅ Index built successfully!"
- [ ] File created: `data/f1-vector-index.json`

---

## □ Phase 3: Deploy to Vercel (5 minutes)

### □ 3.1 Login to Vercel
```bash
vercel login
```
- [ ] Browser opened and confirmed

### □ 3.2 Deploy API
```bash
vercel deploy --prod
```

Answer prompts:
- [ ] Link to existing project? → **N**
- [ ] Project name? → **f1-intelligence-api**
- [ ] Directory? → **./

- [ ] Deployment successful
- [ ] **URL:** `https://________________________________.vercel.app`

### □ 3.3 Set Environment Variables

Go to: https://vercel.com/dashboard

- [ ] Click "f1-intelligence-api" project
- [ ] Go to Settings → Environment Variables
- [ ] Add `OPENAI_API_KEY` = `sk-proj-xxxxx` (Production)
- [ ] Add `ANTHROPIC_API_KEY` = `sk-ant-xxxxx` (Production)
- [ ] Click Save
- [ ] Go to Deployments → Click ⋯ → Redeploy

### □ 3.4 Test API

```bash
curl -X POST https://your-vercel-url.vercel.app/api/intelligence \
  -H "Content-Type: application/json" \
  -d '{"question": "How does Verstappen perform at Monaco?"}'
```

- [ ] Returns JSON with "answer" field
- [ ] Answer mentions Verstappen and Monaco

---

## □ Phase 4: Configure PHP (2 minutes)

### □ 4.1 Update config.php

Add to your `config.php`:

```php
// F1 Intelligence Configuration
define('F1_INTELLIGENCE_API_URL', 'https://your-vercel-url.vercel.app');
define('F1_INTELLIGENCE_TIMEOUT', 30);
define('F1_INTELLIGENCE_DEBUG', true);
```

- [ ] `F1_INTELLIGENCE_API_URL` set to your Vercel URL
- [ ] File saved

### □ 4.2 Ensure F1Intelligence.php Exists

```bash
ls public/f1-intelligence/F1Intelligence.php
```

- [ ] File exists (or copy from f1-rag-repo)

---

## □ Phase 5: Upload to Test Server (3 minutes)

### □ 5.1 Files to Upload to hpovslen.dk

Via FTP, upload:
- [ ] `public/f1-intelligence/F1Intelligence.php`
- [ ] `public/config.php`
- [ ] `public/test-f1-intelligence.php` (see PREREQUISITES_SETUP.md)

### □ 5.2 Test on hpovslen.dk

Visit: `https://hpovslen.dk/test-f1-intelligence.php`

- [ ] ✅ Test 1: API Health Check → Green
- [ ] ✅ Test 2: Query Test → Shows answer
- [ ] No errors displayed

---

## □ Phase 6: Deploy to Live (When Ready)

### □ 6.1 Update config.php for Production
```php
define('F1_INTELLIGENCE_DEBUG', false);
```

### □ 6.2 Upload to formula-1.dk
- [ ] Upload same files as test server
- [ ] Test at `https://formula-1.dk/test-f1-intelligence.php`
- [ ] Works correctly

---

## ✅ Success Criteria

You're done when:
- [x] Vercel API responds to curl requests
- [x] Test page on hpovslen.dk shows green checkmarks
- [x] Query returns relevant F1 answer
- [x] No PHP errors

---

## 🆘 Common Issues

**"OPENAI_API_KEY not set"**
→ Re-export keys (Phase 2.3)

**"Module not found" in npm install**
→ Make sure you're in `api/` directory

**"Cannot reach API" on test page**
→ Check `F1_INTELLIGENCE_API_URL` in config.php

**Test page shows blank**
→ Check PHP error logs on server

**Vercel deployment fails**
→ Check that `f1-vector-index.json` exists

---

## 📊 Time Estimate

- Phase 1 (Accounts): 15 min
- Phase 2 (Build Index): 5 min
- Phase 3 (Deploy Vercel): 5 min
- Phase 4 (Configure PHP): 2 min
- Phase 5 (Upload Test): 3 min

**Total: ~30 minutes**

---

## 💰 Total Cost

**One-time setup:**
- OpenAI initial: $5
- Anthropic initial: $20
- **Total: $25**

**Monthly (1000 queries):**
- Vercel: $0
- OpenAI: $0.02
- Anthropic: $10
- **Total: ~$10/month**

---

## 📝 Your Configuration

Fill this in as you go:

**API Keys:**
```
OPENAI_API_KEY=sk-proj-_________________________________
ANTHROPIC_API_KEY=sk-ant-_______________________________
```

**Vercel Deployment:**
```
URL: https://_________________________________________.vercel.app
```

**Servers:**
```
Test: hpovslen.dk
Live: formula-1.dk
```

---

## Next Step

Start with **Phase 1** in PREREQUISITES_SETUP.md!
