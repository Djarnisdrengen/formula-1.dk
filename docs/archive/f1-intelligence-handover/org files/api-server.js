/**
 * F1 Intelligence API Server
 * 
 * Simple REST API that wraps the RAG query engine
 * Can be called from PHP, JavaScript, or any HTTP client
 */

import express from 'express';
import { queryF1Intelligence } from './query.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

/**
 * POST /api/f1-intelligence
 * 
 * Body: { "question": "How does Verstappen perform at Monaco?" }
 * Response: { "answer": "...", "sources": [...] }
 */
app.post('/api/f1-intelligence', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({
        error: 'Missing required field: question'
      });
    }
    
    console.log(`📥 Query received: ${question}`);
    
    const result = await queryF1Intelligence(question);
    
    console.log(`✅ Answer generated (${result.answer.length} chars)`);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error processing query:', error);
    res.status(500).json({
      error: 'Failed to process query',
      message: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'F1 Intelligence API',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 F1 Intelligence API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Query endpoint: POST http://localhost:${PORT}/api/f1-intelligence`);
});
