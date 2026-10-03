# VS Code Workflow Guide

Using Claude Code as a VS Code extension (not the terminal version).

## Key Differences

| Task | Terminal Claude Code | VS Code Claude Code |
|------|---------------------|---------------------|
| Open project | `claude-code .` | **File → Open Folder** in VS Code |
| Send message to Claude | Type in terminal | Type in Claude Code chat panel |
| Run shell commands | Direct terminal | Integrated terminal (**Ctrl+`**) |
| Edit files | Claude opens in $EDITOR | Claude edits directly in VS Code |
| Approve changes | Confirm in terminal | Confirm in chat panel |

## Your Workflow

### 1. Open Your Project

**File → Open Folder** → Select your `f1betting` repo

VS Code will:
- Load the file explorer (left sidebar)
- Start the language servers
- Initialize git status
- Auto-detect the Claude Code workspace

### 2. Open Claude Code Panel

**Three ways:**
- Click the Claude Code icon in the activity bar (left sidebar)
- **Ctrl+Shift+P** → type "Claude" → select Claude Code commands
- Custom keyboard shortcut (if configured)

### 3. Chat with Claude Code

Type messages in the Claude Code chat panel. Claude can:
- ✅ Read files in your project
- ✅ Edit files in your project (with your approval)
- ✅ Run commands in the integrated terminal
- ✅ Work with git
- ✅ Search across the project

### 4. Integrated Terminal

Open with **Ctrl+`** (backtick) - it opens in your project root.

Use it for:
- Running `npm install`
- Running `vercel deploy`
- FTP commands
- Any shell operations

You can have multiple terminals (+ button in terminal panel).

## Running the Install Script in VS Code

### Step-by-Step

1. **Download** the handover zip and extract somewhere (e.g., `~/Downloads/handover/`)

2. **Open f1betting in VS Code:**
   - File → Open Folder
   - Navigate to your f1betting repo
   - Click Open

3. **Open the integrated terminal:**
   - Press **Ctrl+`** (backtick, top-left of keyboard, below Esc)
   - Terminal opens at the bottom
   - You're automatically in the f1betting directory

4. **Run the install script:**
   ```bash
   bash ~/Downloads/handover/install.sh
   ```

5. **Watch the output** in the terminal - it'll show what was copied and what to do next.

## Manual Steps in VS Code

After running the install script, do these manually:

### Update CLAUDE.md

1. In VS Code's file explorer, click `CLAUDE.md` to open it
2. Open a new tab: File → Open File → select `handover/CLAUDE_MD_APPEND.md`
3. Select all in CLAUDE_MD_APPEND.md (**Ctrl+A**)
4. Copy (**Ctrl+C**)
5. Switch to CLAUDE.md tab
6. Click at the end of the file (**Ctrl+End**)
7. Paste (**Ctrl+V**)
8. Save (**Ctrl+S**)

### Update config.php

1. Open `public/config.php` (or create it)
2. Add at the bottom (before `?>` if present):

```php
// F1 Intelligence Configuration
define('F1_INTELLIGENCE_API_URL', 'https://YOUR-APP.vercel.app');
define('F1_INTELLIGENCE_TIMEOUT', 30);
define('F1_INTELLIGENCE_DEBUG', true);
```

3. Save (**Ctrl+S**)

### Update .gitignore

1. Open `.gitignore` in VS Code (or create if missing)
2. Add at the end:

```
# F1 Intelligence
f1-intelligence/api/node_modules/
f1-intelligence/api/.vercel
```

3. Save (**Ctrl+S**)

## Using Claude Code for Deployment

### First Message to Claude Code

Open the Claude Code chat panel and type:

```
I've installed F1 Intelligence files into this repo (Paddock Picks).

Please read these files first:
1. CLAUDE.md (look at the new "F1 Intelligence (RAG System)" section)
2. f1-intelligence/README.md
3. f1-intelligence/docs/DEPLOYMENT.md

Then provide a detailed step-by-step plan for:
- Setting up accounts (Vercel, OpenAI, Anthropic) - I'll do this manually
- Building the vector index (using integrated terminal)
- Deploying API to Vercel (using integrated terminal)
- Updating my config.php with the Vercel URL
- Uploading PHP to hpovslen.dk via FTP
- Testing the integration

Per my preference: plan first, wait for my OK before implementing.
```

### Claude Code Will Then:

1. **Read the docs** using its file tools
2. **Provide a plan** in the chat panel
3. **Wait for your "OK"** or "approved" message
4. **Execute steps** when approved, using the integrated terminal

### Example Interaction

```
You: [first message above]

Claude Code: I've read the documentation. Here's my plan:

Phase 1: Prerequisites (you do manually)
1. Create Vercel account
2. Get OpenAI API key
3. Get Anthropic API key

Phase 2: Build Index (I'll run in terminal)
- npm install in f1-intelligence/api
- export environment variables
- npm run build-index

Phase 3: Deploy to Vercel (I'll run in terminal)
- vercel login
- vercel deploy --prod
- Note the URL

[etc...]

Shall I proceed with Phase 2 once you have the API keys?

You: I have the API keys. Go ahead with Phase 2.

Claude Code: [executes commands in integrated terminal]
```

## VS Code Tips for This Project

### Useful Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+`** | Toggle integrated terminal |
| **Ctrl+Shift+E** | Focus file explorer |
| **Ctrl+Shift+G** | Source control (git) panel |
| **Ctrl+P** | Quick file search |
| **Ctrl+Shift+F** | Search across files |
| **Ctrl+Shift+P** | Command palette |

### Useful Extensions

If not already installed:
- **PHP Intelephense** - PHP autocomplete
- **GitLens** - Better git integration
- **dotenv** - .env file syntax highlighting

### Working with Multiple Folders

Since you have docs in different folders, you can use VS Code's split view:
- **Ctrl+\\** - Split editor
- Drag tabs to different splits

## Troubleshooting

### Claude Code panel not visible
- View → Extensions → Search "Claude Code" → Make sure it's enabled
- Or: Ctrl+Shift+P → "Claude Code: Open Panel"

### Terminal opens in wrong directory
- Right-click on f1betting folder in explorer → "Open in Integrated Terminal"

### Can't find files Claude mentions
- Use **Ctrl+P** to search by filename
- Or use the file explorer search

### Permission denied on install.sh
- In integrated terminal: `chmod +x ~/Downloads/handover/install.sh`

## Pro Tips

### 1. Use Workspaces

Save your f1betting setup as a workspace:
- File → Save Workspace As → `f1betting.code-workspace`

Then open with one click later.

### 2. Pin Important Files

Right-click on tabs you use often → Pin Tab

Suggested to pin:
- `CLAUDE.md`
- `public/config.php`
- `f1-intelligence/api/data/f1-knowledge-base.json`

### 3. Use the Source Control Panel

After installation:
- Ctrl+Shift+G to see all changed/new files
- Review changes before committing
- Stage and commit from within VS Code

### 4. Let Claude Code Use the Terminal

When Claude Code suggests running a command:
- Review the command first
- Approve it - Claude runs it in the integrated terminal
- You see the output in real-time
- Claude reads the output and continues

## Comparison: What Stays the Same

These work identically in both terminal and VS Code Claude Code:

- ✅ The `install.sh` script
- ✅ All the file contents
- ✅ The deployment process (npm, vercel CLI)
- ✅ FTP uploads
- ✅ Testing procedures
- ✅ The Vercel deployment workflow
- ✅ Your Claude Code preferences (plan first, then OK)

The only difference is **how you interact** with Claude Code (chat panel vs terminal) and **where commands run** (integrated terminal vs system terminal).

## Summary

You're using:
- ✅ VS Code as your editor
- ✅ Claude Code as a VS Code extension
- ✅ Integrated terminal for shell commands

**The workflow is essentially the same**, just in a unified interface. Everything in the documentation works - just substitute "open Claude Code panel" wherever it says "run claude-code ." and "use integrated terminal (Ctrl+`)" wherever it says "in terminal".

🏁 Ready to start? Open VS Code and let's go!
