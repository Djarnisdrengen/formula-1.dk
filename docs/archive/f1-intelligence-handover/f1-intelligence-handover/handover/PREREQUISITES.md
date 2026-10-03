# Prerequisites

What you need before deploying F1 Intelligence.

## Account Setup (15 minutes)

### 1. Vercel (FREE) - Hosts the API

1. Go to https://vercel.com/signup
2. Sign up with GitHub (easiest) or email
3. Verify email
4. ✅ Done - free forever

### 2. OpenAI API Key (~$5 to start)

1. Go to https://platform.openai.com/signup
2. Create account
3. Go to **Settings → Billing** - Add payment method, deposit $5+
4. Go to **API keys** → Click "Create new secret key"
5. Name it: "F1 Intelligence RAG"
6. **COPY THE KEY** (starts with `sk-proj-...`) - You can't see it again!
7. Save somewhere safe (password manager)

**Cost:** ~$0.02/month for 1000 queries

### 3. Anthropic API Key (~$20 to start)

1. Go to https://console.anthropic.com/
2. Sign up
3. Go to **Settings → Billing** → Purchase $20-50 credits
4. Go to **Settings → API Keys** → Click "Create Key"
5. Name it: "F1 Intelligence"
6. **COPY THE KEY** (starts with `sk-ant-...`)
7. Save somewhere safe

**Cost:** ~$10/month for 1000 queries

## Software on Your Ubuntu Machine

### 1. Node.js

```bash
# Check if installed
node --version

# If not installed:
sudo apt update
sudo apt install nodejs npm

# Or use NodeSource for latest:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v18+ 
npm --version
```

### 2. Vercel CLI

```bash
npm install -g vercel

# Verify
vercel --version
```

If you get permission errors:
```bash
sudo npm install -g vercel
```

### 3. FTP Client

Either:
- **GUI:** FileZilla - https://filezilla-project.org/
- **CLI:** `lftp` - `sudo apt install lftp`

## Access You Need

### FTP Credentials

For uploading PHP files:

**Test server (hpovslen.dk):**
- Host: `ftp.hpovslen.dk` (or your server's FTP host)
- Username: _________________
- Password: _________________
- Path: usually `/public_html/`

**Live server (formula-1.dk):**
- Host: `ftp.formula-1.dk`
- Username: _________________
- Password: _________________
- Path: usually `/public_html/`

## API Keys Worksheet

Fill in as you go (keep this secure!):

```
┌─────────────────────────────────────────────────────────┐
│ OpenAI API Key:                                         │
│   sk-proj-______________________________________________│
│                                                          │
│ Anthropic API Key:                                      │
│   sk-ant-_______________________________________________│
│                                                          │
│ Vercel Deployment URL (after deployment):              │
│   https://_____________________________.vercel.app      │
└─────────────────────────────────────────────────────────┘
```

## Cost Summary

**One-time setup:**
- Vercel: $0
- OpenAI initial credit: $5
- Anthropic initial credit: $20
- **Total: $25**

**Monthly (1000 queries):**
- Vercel hosting: $0
- OpenAI embeddings: $0.02
- Anthropic Claude: ~$10
- **Total: ~$10/month**

## Verification Checklist

Before proceeding to deployment, verify:

- [ ] Vercel account created and verified
- [ ] OpenAI API key obtained and saved
- [ ] OpenAI billing set up with credit
- [ ] Anthropic API key obtained and saved
- [ ] Anthropic credits purchased
- [ ] Node.js installed (`node --version` works)
- [ ] Vercel CLI installed (`vercel --version` works)
- [ ] FTP credentials for hpovslen.dk
- [ ] FTP credentials for formula-1.dk

## Ready?

Once all checkboxes above are checked, proceed to:
- `SETUP_GUIDE.md` - To install files into your repo
- `f1-intelligence/docs/DEPLOYMENT.md` - To deploy
