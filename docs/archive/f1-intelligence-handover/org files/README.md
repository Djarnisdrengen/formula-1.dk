# F1 RAG Intelligence for Paddock Picks

A hybrid serverless RAG system that provides F1 racing intelligence to help Paddock Picks users make better podium predictions.

## Architecture

**Hybrid Deployment for simply.com compatibility:**

```
┌────────────────────┐         HTTPS        ┌──────────────────────┐
│  simply.com        │ ────────────────────▶ │  Vercel (API)        │
│  ┌──────────────┐  │                      │  ┌────────────────┐  │
│  │ PHP Frontend │  │                      │  │ RAG API        │  │
│  │ MySQL DB     │  │                      │  │ Node.js        │  │
│  └──────────────┘  │                      │  └────────────────┘  │
└────────────────────┘                       └──────────────────────┘
                                                      │
                                                      ▼
                                             ┌──────────────────────┐
                                             │  OpenAI + Anthropic  │
                                             └──────────────────────┘
```

**Why this approach?**
- simply.com only supports PHP/MySQL (no Node.js)
- But PHP CAN make HTTP requests to external APIs
- Solution: Deploy computation to Vercel (free), UI to simply.com

## Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd f1-rag-repo
```

### 2. Setup API (Vercel)

```bash
cd api
npm install

# Set environment variables
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."

# Build vector index (one time)
npm run build-index

# Test locally
node query.js "How does Verstappen perform at Monaco?"
```

### 3. Deploy API to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod
# Note the URL: https://your-app.vercel.app
```

### 4. Configure PHP Frontend

Edit `paddock-picks-frontend/config.php`:

```php
define('F1_INTELLIGENCE_API_URL', 'https://your-app.vercel.app');
```

### 5. Test PHP Locally

```bash
cd paddock-picks-frontend
php -S localhost:8000

# Visit http://localhost:8000
```

### 6. Deploy to simply.com

Upload contents of `paddock-picks-frontend/` via FTP:
- Upload all files to `public_html/f1-intelligence/`
- Visit `https://your-domain.simply.site/f1-intelligence/`

## Repository Structure

```
f1-rag-repo/
├── api/                         # Vercel serverless API
│   ├── api/
│   │   └── intelligence.js     # Serverless function
│   ├── data/
│   │   ├── f1-knowledge-base.json
│   │   └── f1-vector-index.json
│   ├── build-index.js
│   ├── query.js
│   ├── package.json
│   └── vercel.json
│
├── paddock-picks-frontend/      # simply.com PHP app
│   ├── index.php               # Test page
│   ├── config.php              # Configuration
│   ├── lib/
│   │   └── F1Intelligence.php  # API client
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
│
├── docs/                        # Documentation
├── CLAUDE.md                    # Context for Claude Code
└── README.md                    # This file
```

## How It Works

**Query Flow:**

1. User enters question on PHP page
2. PHP makes HTTP POST to Vercel API
3. API converts question to embedding (OpenAI)
4. API searches vector index (cosine similarity)
5. API retrieves top 3 relevant F1 documents
6. API sends context to Claude for answer generation
7. API returns answer + sources to PHP
8. PHP displays result to user

**Cost per query:** ~$0.01 (mostly Claude API)

## Testing from Terminal

```bash
# Test API locally
cd api
node query.js "Your F1 question here"

# Test API endpoint (after deploying)
curl -X POST https://your-app.vercel.app/api/intelligence \
  -H "Content-Type: application/json" \
  -d '{"question": "How does Verstappen perform at Monaco?"}'

# Test PHP integration
cd paddock-picks-frontend
php -S localhost:8000
# Then open browser to http://localhost:8000
```

## Integration with Paddock Picks

Use anywhere in your Paddock Picks codebase:

```php
require_once 'lib/F1Intelligence.php';

$intelligence = new F1Intelligence('https://your-app.vercel.app');

// Get insights for race prediction
$result = $intelligence->query(
    "How has Verstappen performed at Monaco historically?"
);

if ($result) {
    echo "<div class='f1-insight'>";
    echo "<h3>F1 Intelligence</h3>";
    echo "<p>" . htmlspecialchars($result['answer']) . "</p>";
    echo "</div>";
}
```

## Updating F1 Knowledge Base

1. Edit `api/data/f1-knowledge-base.json`
2. Rebuild index: `cd api && npm run build-index`
3. Redeploy: `vercel deploy --prod`

## Environment Variables

**Vercel (set in dashboard: vercel.com/dashboard):**
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

**simply.com (in `config.php`):**
```php
define('F1_INTELLIGENCE_API_URL', 'https://your-app.vercel.app');
```

## Troubleshooting

**"API unavailable" error:**
- Check Vercel deployment status
- Verify API URL in `config.php`
- Test API directly: `curl https://your-app.vercel.app/api/intelligence`

**"CORS error":**
- Check Vercel logs
- CORS headers are set in `api/api/intelligence.js`

**"Timeout" error:**
- Increase timeout in `config.php`
- Check if Vercel function is cold-starting (first request is slower)

**"Empty response":**
- Verify vector index exists: `api/data/f1-vector-index.json`
- Rebuild index: `cd api && npm run build-index`

## Cost Breakdown

**Monthly (estimated for 1000 queries):**
- Vercel hosting: $0 (free tier)
- OpenAI embeddings: $0.02
- Anthropic API: $10
- **Total: ~$10/month**

**Ways to reduce costs:**
- Cache common questions in MySQL
- Use Claude Haiku for simpler queries
- Pre-generate FAQ answers

## Documentation

- `CLAUDE.md` - Persistent context for Claude Code
- `docs/DEPLOYMENT.md` - Detailed deployment guide
- `docs/LOCAL_TESTING.md` - Local testing procedures
- `docs/ARCHITECTURE.md` - System architecture details

## License

MIT

## Support

For issues, refer to documentation in `docs/` folder or check CLAUDE.md for technical context.
