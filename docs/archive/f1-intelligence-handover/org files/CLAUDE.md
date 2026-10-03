# F1 RAG Intelligence for Paddock Picks

## Project Context

This is a Retrieval-Augmented Generation (RAG) system that provides F1 racing intelligence to help users of the Paddock Picks betting app make better podium predictions.

## Architecture

**Hybrid Serverless Deployment:**
- **RAG API**: Node.js serverless functions on Vercel (free tier)
- **PHP Frontend**: Static PHP pages on simply.com (shared hosting)
- **Communication**: PHP makes HTTP requests to external RAG API

## Why This Architecture?

simply.com only supports PHP/MySQL (no Node.js runtime), but DOES allow outbound HTTP requests. So we:
1. Deploy the compute-intensive RAG system to Vercel (free, serverless)
2. Deploy the simple PHP UI to simply.com
3. PHP calls the external API via cURL

## Repository Structure

```
f1-rag-repo/
├── api/                        # RAG API (Vercel deployment)
│   ├── api/
│   │   └── intelligence.js    # Serverless function endpoint
│   ├── data/
│   │   ├── f1-knowledge-base.json
│   │   └── f1-vector-index.json (generated)
│   ├── build-index.js         # Creates vector embeddings
│   ├── query.js               # RAG query engine
│   ├── package.json
│   └── vercel.json            # Vercel config
│
└── paddock-picks-frontend/    # PHP app (simply.com deployment)
    ├── index.php              # Test page UI
    ├── api/
    │   └── f1-intelligence.php # PHP API wrapper
    ├── lib/
    │   └── F1Intelligence.php  # HTTP client class
    ├── css/
    │   └── styles.css
    └── js/
        └── app.js
```

## Key Technologies

- **Embeddings**: OpenAI text-embedding-3-small (~$0.00002/query)
- **Vector Search**: Cosine similarity (in-memory, no vector DB needed)
- **Answer Generation**: Anthropic Claude Sonnet 4 (~$0.01/query)
- **API Framework**: Vercel serverless functions
- **Frontend**: Vanilla PHP (no frameworks)

## Development Workflow

### Local Testing

**Test RAG API:**
```bash
cd api
npm install
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."

# Build index (one time)
npm run build-index

# Test query
node query.js "How does Verstappen perform at Monaco?"
```

**Test PHP Frontend:**
```bash
cd paddock-picks-frontend
php -S localhost:8000
# Visit http://localhost:8000
```

### Deployment

**Deploy API to Vercel:**
```bash
cd api
vercel deploy --prod
# Note the deployment URL: https://xxx.vercel.app
```

**Deploy PHP to simply.com:**
```bash
# FTP upload contents of paddock-picks-frontend/
# to public_html/f1-intelligence/
```

## Environment Variables

**Vercel (set in dashboard):**
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key

**simply.com (in PHP config file):**
- `F1_INTELLIGENCE_API_URL`: Your Vercel deployment URL

## How RAG Works (Technical)

1. **Indexing** (one-time):
   - Load F1 knowledge base (JSON documents)
   - Create embeddings for each document (OpenAI API)
   - Store embeddings in vector index file

2. **Query** (each request):
   - User asks question
   - Convert question to embedding (OpenAI API)
   - Search vector index using cosine similarity
   - Retrieve top 3 most relevant documents
   - Send question + context to Claude
   - Claude generates data-driven answer

## API Endpoints

**Vercel API:**
```
POST https://your-app.vercel.app/api/intelligence
Body: { "question": "How does Verstappen perform at Monaco?" }
Response: { "answer": "...", "sources": [...] }
```

**simply.com PHP wrapper:**
```
POST /api/f1-intelligence.php
Body: { "question": "..." }
Response: { "answer": "...", "sources": [...] }
```

## Cost Structure

**Monthly costs (estimated):**
- Vercel hosting: $0 (free tier)
- OpenAI embeddings: $0.20 (for 10,000 queries)
- Anthropic API: $100 (for 10,000 queries)
- simply.com hosting: Already paid by user

**Per query:** ~$0.01 (mostly Claude API)

## Maintenance Tasks

**Update F1 knowledge base:**
1. Edit `api/data/f1-knowledge-base.json`
2. Run `npm run build-index`
3. Deploy: `vercel deploy --prod`

**Update PHP frontend:**
1. Edit files in `paddock-picks-frontend/`
2. Upload via FTP to simply.com

## Integration with Paddock Picks

The PHP class `F1Intelligence` can be used anywhere in Paddock Picks:

```php
require_once 'lib/F1Intelligence.php';

$intelligence = new F1Intelligence();
$result = $intelligence->query(
    "How has Verstappen performed at Monaco?"
);

echo $result['answer'];
```

## Testing Checklist

Before deploying:
- [ ] API builds index successfully
- [ ] CLI query works: `node query.js "test question"`
- [ ] Vercel deployment successful
- [ ] PHP page loads locally
- [ ] PHP can reach Vercel API
- [ ] Error handling works (when API is down)
- [ ] Response time < 5 seconds

## Common Issues

**"CORS error":**
- Vercel function needs CORS headers (already added)

**"API timeout":**
- Increase timeout in PHP cURL (already set to 30s)
- Check Vercel function timeout (max 10s on free tier)

**"Empty response":**
- Check vector index exists in Vercel deployment
- Verify environment variables are set

**"Cost too high":**
- Add caching in PHP for repeated questions
- Consider using Claude Haiku for simpler queries

## Next Features (Roadmap)

- [ ] Cache frequent queries in MySQL
- [ ] Add more F1 data sources
- [ ] Integrate with live F1 API for current season
- [ ] Add user feedback (thumbs up/down)
- [ ] Track which questions are most popular
- [ ] A/B test different prompt strategies

## Security Notes

- API keys stored as environment variables (never in code)
- CORS configured for simply.com domain only (in production)
- No user data stored in RAG system
- All queries are stateless

## Performance

- Average query time: 2-4 seconds
- API cold start: ~1 second (Vercel free tier)
- PHP response time: <100ms (just HTTP proxy)
- Vector search: <50ms (in-memory, 10 docs)

## Contact & Support

For questions about this codebase, refer to:
- `docs/ARCHITECTURE.md` - System design
- `docs/DEPLOYMENT.md` - Deployment guides  
- `docs/LOCAL_TESTING.md` - Testing procedures
- Original handover: `HANDOVER.md`
