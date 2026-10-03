# HANDOVER TO CLAUDE CODE

## Project: F1 RAG Intelligence System for Paddock Picks

### Challenge
Host RAG system on simply.com which only supports PHP/MySQL (no Node.js runtime).

### Solution Architecture
**Hybrid deployment:**
1. **RAG API** → Deploy to free serverless platform (Vercel/Railway/Render)
2. **PHP Frontend** → Deploy to simply.com
3. **Communication** → PHP makes HTTP requests to external RAG API

```
┌─────────────────────┐
│  simply.com         │
│  ┌───────────────┐  │      HTTPS        ┌─────────────────────┐
│  │ PHP Frontend  │──┼──────────────────▶│  RAG API (Vercel)   │
│  │ MySQL DB      │  │                   │  Node.js/Express    │
│  └───────────────┘  │                   └─────────────────────┘
└─────────────────────┘                             │
                                                    ▼
                                          ┌─────────────────────┐
                                          │  OpenAI + Anthropic │
                                          │  APIs               │
                                          └─────────────────────┘
```

### Repository Structure

```
f1-rag-paddock-picks/
├── README.md                    # Main documentation
├── CLAUDE.md                    # Context for Claude Code
├── .gitignore
│
├── api/                         # RAG API (deploy to Vercel)
│   ├── package.json
│   ├── vercel.json             # Vercel config
│   ├── build-index.js          # Indexing script
│   ├── query.js                # RAG engine
│   ├── api/
│   │   └── intelligence.js     # Serverless function
│   ├── data/
│   │   ├── f1-knowledge-base.json
│   │   └── f1-vector-index.json
│   └── README.md
│
├── paddock-picks-frontend/      # PHP app (deploy to simply.com)
│   ├── index.php               # Test page
│   ├── api/
│   │   └── f1-intelligence.php # PHP wrapper for RAG API
│   ├── lib/
│   │   └── F1Intelligence.php  # PHP client class
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── README.md
│
└── docs/
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    └── LOCAL_TESTING.md
```

### Tasks for Claude Code

#### Phase 1: Repository Setup
1. Create the repo structure above
2. Move existing code into proper locations
3. Add .gitignore for Node.js and PHP
4. Create CLAUDE.md with persistent context

#### Phase 2: API Separation (Vercel-ready)
1. Convert api-server.js to Vercel serverless function
2. Add vercel.json configuration
3. Ensure vector index is included in deployment
4. Add environment variable handling

#### Phase 3: PHP Frontend
1. Create standalone PHP test page
2. Build F1Intelligence.php class (cURL-based HTTP client)
3. Add error handling for when API is unavailable
4. Create simple UI matching Paddock Picks style

#### Phase 4: Local Testing
1. Set up local testing with both components
2. Create docker-compose.yml for local PHP testing
3. Add test scripts for CLI verification

#### Phase 5: Documentation
1. Deployment guide for Vercel API
2. Upload guide for simply.com
3. Environment variable setup instructions
4. Troubleshooting guide

### Critical Requirements

**For simply.com compatibility:**
- ✅ No Node.js dependencies in PHP code
- ✅ Pure PHP + MySQL only
- ✅ HTTP requests to external API (allowed on simply.com)
- ✅ Works without shell_exec or system calls

**For local testing:**
- ✅ Can test RAG API locally: `node api/query.js "question"`
- ✅ Can test PHP locally: `php -S localhost:8000`
- ✅ Can test full integration before deploying

**For production:**
- ✅ API deployed to free tier (Vercel/Railway)
- ✅ PHP + static files uploaded to simply.com via FTP
- ✅ No ongoing infrastructure costs (both free tiers)

### Environment Variables Needed

**RAG API (Vercel):**
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

**PHP Frontend (simply.com):**
```
F1_INTELLIGENCE_API_URL=https://your-vercel-app.vercel.app
```

### Expected Deliverables

1. **Git repository** with clean structure
2. **Vercel-deployable API** (one-click deploy button)
3. **simply.com-ready PHP files** (drag & drop FTP upload)
4. **Test page** accessible at `https://paddockpicks.simply.site/f1-intelligence-test.php`
5. **Documentation** for maintenance and updates

### Commands for Claude Code

```bash
# Initialize repo
git init f1-rag-paddock-picks
cd f1-rag-paddock-picks

# Create structure (Claude Code will do this)
mkdir -p api/api api/data
mkdir -p paddock-picks-frontend/{api,lib,css,js}
mkdir -p docs

# Test API locally
cd api
npm install
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
npm run build-index
node query.js "How does Verstappen perform at Monaco?"

# Test PHP locally
cd ../paddock-picks-frontend
php -S localhost:8000

# Deploy API
cd ../api
vercel deploy --prod

# Upload PHP to simply.com
# (FTP upload of paddock-picks-frontend/)
```

### Success Criteria

- [ ] Can query RAG system from terminal: `node api/query.js "question"`
- [ ] Can test PHP page locally: http://localhost:8000
- [ ] API deployed and accessible: https://your-app.vercel.app/api/intelligence
- [ ] PHP page works on simply.com with external API
- [ ] Full system costs $0/month on free tiers
- [ ] Takes <5 minutes to deploy updates

### Notes for Claude Code

This is a **hybrid serverless architecture** because:
- simply.com doesn't support Node.js
- But it DOES support outbound HTTP requests from PHP
- So we split: computation (Vercel) + presentation (simply.com)

The PHP code is just a thin client that:
1. Takes user input
2. Forwards to RAG API via cURL
3. Displays the response

All the heavy lifting (embeddings, vector search, Claude) happens in the external API.

### Ready for Handover?

Reply with: "Yes, start Phase 1" and I'll begin creating the repository structure.
