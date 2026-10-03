# F1 Intelligence - Handover Package

Complete handover for integrating F1 RAG Intelligence into Paddock Picks (f1betting repo).

## 👉 Start Here

**Read these in order:**

1. **SETUP_GUIDE.md** ← Start here for installation steps
2. **PREREQUISITES.md** ← Account setup (Vercel, OpenAI, Anthropic)
3. **f1-intelligence/docs/DEPLOYMENT.md** ← Full deployment guide

## 📦 What's in This Package

```
handover/
├── README.md                    ← You are here
├── SETUP_GUIDE.md               ← How to install (read first!)
├── PREREQUISITES.md             ← Account setup
├── install.sh                   ← Safe install script
├── CLAUDE_MD_APPEND.md          ← Content to add to your CLAUDE.md
│
└── files-to-copy/               ← The actual files
    ├── f1-intelligence/         ← Goes to: f1betting/f1-intelligence/
    │   ├── api/                 (Vercel API - Node.js)
    │   │   ├── api/intelligence.js
    │   │   ├── data/f1-knowledge-base.json
    │   │   ├── build-index.js
    │   │   ├── query.js
    │   │   ├── package.json
    │   │   └── vercel.json
    │   ├── docs/
    │   │   ├── DEPLOYMENT.md
    │   │   ├── TESTING.md
    │   │   └── ARCHITECTURE.md
    │   └── README.md
    │
    └── public/                  ← Goes to: f1betting/public/
        └── f1-intelligence/
            ├── F1Intelligence.php  (PHP client class)
            └── test.php            (Test page)
```

## ⚡ Quick Start (3 commands)

```bash
# 1. Go to your f1betting repo
cd /path/to/f1betting

# 2. Run the safe install (won't overwrite anything)
bash /path/to/handover/install.sh

# 3. Open with Claude Code to deploy
claude-code .
```

## 🎯 What This Adds to Paddock Picks

Users can ask F1 questions like:
- "How does Verstappen perform at Monaco?"
- "Best overtaking opportunities at Spa?"
- "Red Bull's reliability at street circuits?"

And get data-driven AI answers based on historical F1 statistics.

## 🏗️ Architecture (Why It's Set Up This Way)

**Problem:** simply.com only supports PHP/MySQL (no Node.js).

**Solution:** Split into two parts:
- **Computation (Node.js)** → Free on Vercel
- **UI (PHP)** → simply.com (existing)
- **They talk via HTTP** (standard, always works)

```
hpovslen.dk → HTTPS → Vercel API → OpenAI + Claude
(your PHP)             (Node.js)
```

## 📋 Installation Approach

The install script (`install.sh`):

✅ **Safe** - Never overwrites existing files  
✅ **Clear** - Shows you exactly what was copied  
✅ **Reversible** - Easy to remove if needed  
✅ **Smart** - Tells you what to do next  

After running it, you'll have:
- New `f1-intelligence/` folder in your repo root
- New `public/f1-intelligence/` folder
- Untouched: All your existing files

## 🤖 Working with Claude Code

After installation, hand to Claude Code:

```bash
cd /path/to/f1betting
claude-code .
```

**First message:**
```
I've installed F1 Intelligence handover. Read:
- CLAUDE.md (new F1 Intelligence section)
- f1-intelligence/README.md
- f1-intelligence/docs/DEPLOYMENT.md

Plan the deployment, then ask for my OK before implementing.
```

Claude Code will respect your rule: **plan first, then wait for OK before implementing**.

## 💰 Cost

- **Setup:** ~$25 (initial API credits)
- **Monthly:** ~$10 for 1000 queries
- **Vercel:** Free

## 🔒 Safety

This installation:
- ✅ Doesn't modify any existing files
- ✅ Doesn't change your simply.com deployment process
- ✅ Doesn't break Paddock Picks if F1 Intelligence is down
- ✅ Can be removed by deleting two folders

## 📞 Need Help?

All documentation is included:
- General questions → `SETUP_GUIDE.md`
- Account setup → `PREREQUISITES.md`
- Deployment → `f1-intelligence/docs/DEPLOYMENT.md`
- Testing → `f1-intelligence/docs/TESTING.md`
- How it works → `f1-intelligence/docs/ARCHITECTURE.md`

Or ask Claude Code - it has all the context after you append CLAUDE_MD_APPEND.md.

## 🏁 Ready?

Open **SETUP_GUIDE.md** and follow the 3 simple steps!
