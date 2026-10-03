<!--
APPEND THIS to your existing CLAUDE.md in the f1betting repo root.
Do NOT replace your existing CLAUDE.md - just add this section at the end.
-->

## F1 Intelligence (RAG System)

**Location:** `f1-intelligence/` (Node.js/Vercel API) + `public/f1-intelligence/` (PHP client)

### Purpose

AI-powered F1 racing insights to help users make better podium predictions. Uses Retrieval-Augmented Generation (RAG) with historical F1 data.

### Architecture

**Hybrid deployment** (because simply.com only supports PHP/MySQL):
- **RAG API:** Node.js serverless on Vercel (free tier)
- **PHP Client:** In `public/f1-intelligence/F1Intelligence.php`
- **Communication:** PHP makes HTTPS requests to Vercel API via cURL

### File Locations

```
f1betting/
├── f1-intelligence/                # RAG system (NOT deployed to simply.com)
│   ├── api/
│   │   ├── api/intelligence.js     # Vercel serverless function
│   │   ├── data/
│   │   │   ├── f1-knowledge-base.json   # Source F1 data
│   │   │   └── f1-vector-index.json     # Generated embeddings
│   │   ├── build-index.js          # Run locally to build index
│   │   ├── query.js                # CLI testing tool
│   │   ├── package.json
│   │   └── vercel.json
│   └── docs/
│       ├── DEPLOYMENT.md
│       ├── TESTING.md
│       └── ARCHITECTURE.md
│
└── public/f1-intelligence/         # PHP integration (deployed to simply.com)
    ├── F1Intelligence.php          # PHP client class
    └── test.php                    # Test page
```

### Deployment Workflow

**Servers:**
- Test: hpovslen.dk (PHP)
- Live: formula-1.dk (PHP)
- API: Vercel (Node.js)

**Steps:**
1. Build vector index locally: `cd f1-intelligence/api && npm run build-index`
2. Deploy API: `vercel deploy --prod`
3. Set Vercel env vars: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
4. Update `public/config.php` with Vercel URL
5. Upload `public/f1-intelligence/` to hpovslen.dk via FTP
6. Test at `https://hpovslen.dk/f1-intelligence/test.php`
7. Deploy to formula-1.dk when verified

### Configuration

In `public/config.php`:
```php
define('F1_INTELLIGENCE_API_URL', 'https://your-app.vercel.app');
define('F1_INTELLIGENCE_TIMEOUT', 30);
define('F1_INTELLIGENCE_DEBUG', false); // true only on hpovslen.dk
```

### Usage in Paddock Picks

```php
require_once __DIR__ . '/f1-intelligence/F1Intelligence.php';

$intel = new F1Intelligence(
    F1_INTELLIGENCE_API_URL,
    F1_INTELLIGENCE_TIMEOUT,
    F1_INTELLIGENCE_DEBUG
);

$result = $intel->query("How has {$driver} performed at {$circuit}?");

if ($result) {
    echo $result['answer'];
    // $result['sources'] = array of source documents
}
```

### Cost

~$0.01 per query (mostly Claude API).
Monthly: ~$10 for 1000 queries.

### Updating F1 Knowledge Base

1. Edit `f1-intelligence/api/data/f1-knowledge-base.json`
2. Run locally: `cd f1-intelligence/api && npm run build-index`
3. Commit: `git add f1-intelligence/api/data/`
4. Deploy: `vercel deploy --prod`

### Important Rules

- **The `f1-intelligence/` folder (Node.js stuff) is NOT uploaded to simply.com.** Only `public/f1-intelligence/` (PHP) goes to the servers.
- **`f1-vector-index.json` MUST be committed to git** - Vercel needs it during deployment.
- **`node_modules/` and `.vercel` should be gitignored** (see .gitignore).
- **API keys (OpenAI, Anthropic) live ONLY in Vercel environment variables** - never commit them.

### Documentation

- `f1-intelligence/README.md` - Component overview
- `f1-intelligence/docs/DEPLOYMENT.md` - Step-by-step deployment
- `f1-intelligence/docs/TESTING.md` - Testing strategy
- `f1-intelligence/docs/ARCHITECTURE.md` - System design
