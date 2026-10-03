# F1 Intelligence Setup Guide
## Simple, Step-by-Step

Everything you need to install F1 Intelligence into your existing f1betting repo and deploy it.

---

## 📦 What's in This Handover

```
handover/
├── README.md                    ← Start here (you're reading SETUP_GUIDE.md)
├── SETUP_GUIDE.md               ← This file
├── install.sh                   ← Safe install script (no overwrites)
├── CLAUDE_MD_APPEND.md          ← Append to your existing CLAUDE.md
├── PREREQUISITES.md             ← Account setup (Vercel, OpenAI, Anthropic)
│
└── files-to-copy/               ← Files that go into your repo
    ├── f1-intelligence/         ← Goes to f1betting/f1-intelligence/
    │   ├── api/                 (Node.js RAG API for Vercel)
    │   ├── docs/                (Documentation)
    │   └── README.md
    │
    └── public/                  ← Goes to f1betting/public/
        └── f1-intelligence/
            ├── F1Intelligence.php  (PHP client class)
            └── test.php            (Test page)
```

---

## 🚀 Installation: 3 Simple Steps

### Step 1: Copy Files Safely (Won't Overwrite Anything)

**In VS Code:**
1. Open your f1betting folder: **File → Open Folder** → select your f1betting repo
2. Open integrated terminal: **Ctrl+`** (or **Terminal → New Terminal**)
3. Run the install script:

```bash
# You're already in the f1betting folder (VS Code's terminal opens in project root)
bash /path/to/handover/install.sh
```

**What it does:**
- ✅ Copies new files into your repo
- ✅ SKIPS any files that already exist (you'll see them listed)
- ✅ Shows you a summary of what was copied
- ✅ Tells you what to do next

**Result:**
```
f1betting/
├── (your existing files - untouched)
├── f1-intelligence/           ← NEW
│   ├── api/
│   ├── docs/
│   └── README.md
└── public/
    └── f1-intelligence/       ← NEW
        ├── F1Intelligence.php
        └── test.php
```

### Step 2: Update Your CLAUDE.md

The install script does NOT modify your `CLAUDE.md` (to protect your existing content).

**In VS Code:**
1. Open `CLAUDE.md` from your f1betting repo (in the file explorer)
2. Open `CLAUDE_MD_APPEND.md` from the handover folder (drag into VS Code or use File → Open)
3. Copy the entire contents of `CLAUDE_MD_APPEND.md`
4. Paste at the end of your `CLAUDE.md`
5. Save (**Ctrl+S**)

### Step 3: Update Your .gitignore

**In VS Code:**
1. Open `.gitignore` from your f1betting repo (or create if missing)
2. Add at the end:

```
# F1 Intelligence
f1-intelligence/api/node_modules/
f1-intelligence/api/.vercel
```

3. Save

---

## ✅ Verify Installation

**In VS Code:**
1. Look at the file explorer (left sidebar)
2. Verify you see new folders:
   - `f1-intelligence/`
   - `public/f1-intelligence/`
3. Open VS Code's Source Control panel (**Ctrl+Shift+G**)
4. You should see new untracked files (with "U" badge)

**Or in integrated terminal (Ctrl+`):**
```bash
# Check files exist
ls f1-intelligence/api/
ls public/f1-intelligence/

# Check git status
git status
```

You should see new untracked files in:
- `f1-intelligence/`
- `public/f1-intelligence/`

**Don't commit yet** - first decide if you want to commit before testing, or after.

---

## 🎯 Next: Use Claude Code in VS Code

Since you have Claude Code as a VS Code extension:

1. **Make sure the f1betting folder is open in VS Code** (the one with the new f1-intelligence folder)

2. **Open the Claude Code panel:**
   - Click the Claude Code icon in the sidebar
   - OR use Command Palette: **Ctrl+Shift+P** → "Claude Code"
   - OR keyboard shortcut (varies by setup)

3. **First message to Claude Code in the chat panel:**

```
I've installed F1 Intelligence files into this repo.

Please:
1. Read CLAUDE.md (the new F1 Intelligence section I just added)
2. Read f1-intelligence/README.md
3. Read f1-intelligence/docs/DEPLOYMENT.md
4. Read the handover/PREREQUISITES.md (if accessible)

Then give me a step-by-step plan for:
- Setting up accounts (Vercel, OpenAI, Anthropic)
- Building the vector index locally
- Deploying API to Vercel
- Uploading PHP to hpovslen.dk
- Testing the integration

Wait for my OK before doing any implementation.
```

Claude Code will:
1. Read all the docs (using the file tools in VS Code)
2. Give you a detailed plan in the chat
3. **Wait for your approval** (per your CLAUDE.md preference)
4. Execute step-by-step when you say OK
5. Use VS Code's integrated terminal for shell commands

**Note:** Claude Code in VS Code has access to:
- Your project files (read/edit)
- The integrated terminal (run commands)
- Git operations (via VS Code)

So it can run `npm install`, `vercel deploy`, etc. directly in the integrated terminal when you approve.

---

## 📋 What You Need Before Starting Deployment

Before deploying, you'll need:

### Accounts (15 min to set up)
- [ ] Vercel account (FREE) - https://vercel.com/signup
- [ ] OpenAI API key (~$5 credit) - https://platform.openai.com/api-keys
- [ ] Anthropic API key (~$20 credit) - https://console.anthropic.com/

### Software (on your Ubuntu machine)
- [ ] Node.js installed (`node --version` to check)
- [ ] Vercel CLI: `npm install -g vercel`
- [ ] FTP client (FileZilla or command line)

### Access
- [ ] FTP credentials for hpovslen.dk
- [ ] FTP credentials for formula-1.dk

See `PREREQUISITES.md` for detailed account setup.

---

## 💰 Cost

**One-time setup:** ~$25 (initial API credits)  
**Monthly:** ~$10 for 1000 queries  
**Vercel hosting:** $0 (free tier)

---

## 🆘 Troubleshooting

### Install script says "no public/ directory"
You're not in the f1betting repo root. `cd` into it first.

### Files already exist warning
Normal - the script skips existing files. Review what was skipped and merge manually if needed.

### "command not found: bash"
You're already in bash. Try: `./install.sh` instead.

### Permission denied
Make script executable: `chmod +x install.sh`

---

## 📚 What to Read Next

1. **PREREQUISITES.md** - Set up accounts and API keys
2. **f1-intelligence/docs/DEPLOYMENT.md** - Detailed deployment steps
3. **f1-intelligence/docs/ARCHITECTURE.md** - Understand the system
4. **f1-intelligence/docs/TESTING.md** - Testing strategy

---

## ❓ Common Questions

**Q: Will this break my existing Paddock Picks site?**  
A: No. The install script doesn't overwrite anything. All new files are in new folders (`f1-intelligence/` and `public/f1-intelligence/`).

**Q: Do I need to install Node.js on hpovslen.dk?**  
A: No. Node.js runs on Vercel (free). simply.com only needs PHP (which you have).

**Q: Can I test before deploying?**  
A: Yes. Always deploy to hpovslen.dk first, test, then upload to formula-1.dk.

**Q: Can I update the F1 data later?**  
A: Yes. Edit `f1-intelligence/api/data/f1-knowledge-base.json`, rebuild index, redeploy.

**Q: What if I don't like it and want to remove it?**  
A: Just delete the two folders (`f1-intelligence/` and `public/f1-intelligence/`) and the config constants from `config.php`.

---

## 🎬 You're Ready!

Run the install script and let's get started:

```bash
cd /path/to/your/f1betting
bash /path/to/handover/install.sh
```

🏁 Happy racing!
