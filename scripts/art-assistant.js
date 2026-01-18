#!/usr/bin/env node

/**
 * Generative Art RAG Assistant
 * 
 * Simple retrieval-augmented generation system for generative art queries.
 * Uses TF-IDF for retrieval (no external dependencies) + Claude API.
 * 
 * Setup:
 *   1. Run process-artblocks-dataset.js first to create processed/ folder
 *   2. Set ANTHROPIC_API_KEY environment variable
 *   3. node art-assistant.js "your question here"
 * 
 * Examples:
 *   node art-assistant.js "How do I create a flow field in p5.js?"
 *   node art-assistant.js "Explain how Fidenza uses noise"
 *   node art-assistant.js "Write code for a generative grid pattern"
 */

const fs = require('fs');
const https = require('https');

// ============================================================================
// CONFIG
// ============================================================================

const PROCESSED_DIR = './processed';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const MAX_CONTEXT_TOKENS = 8000; // Leave room for response

// ============================================================================
// SIMPLE TF-IDF RETRIEVAL (no dependencies)
// ============================================================================

class SimpleRetriever {
  constructor() {
    this.documents = [];
    this.vocabulary = new Map();
    this.idf = new Map();
    this.tfidf = [];
  }

  // Tokenize and normalize text
  tokenize(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }

  // Build index from documents
  index(documents) {
    this.documents = documents;
    const docCount = documents.length;
    const termDocFreq = new Map();

    // Calculate document frequencies
    for (const doc of documents) {
      const tokens = new Set(this.tokenize(doc.content));
      for (const token of tokens) {
        termDocFreq.set(token, (termDocFreq.get(token) || 0) + 1);
      }
    }

    // Calculate IDF
    for (const [term, freq] of termDocFreq) {
      this.idf.set(term, Math.log(docCount / freq));
    }

    // Calculate TF-IDF vectors
    this.tfidf = documents.map(doc => {
      const tokens = this.tokenize(doc.content);
      const tf = new Map();
      for (const token of tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
      }
      
      const vector = new Map();
      for (const [term, count] of tf) {
        const tfidf = (count / tokens.length) * (this.idf.get(term) || 0);
        if (tfidf > 0) vector.set(term, tfidf);
      }
      return vector;
    });

    console.log(`Indexed ${documents.length} documents`);
  }

  // Search for relevant documents
  search(query, topK = 5) {
    const queryTokens = this.tokenize(query);
    const queryVector = new Map();
    
    for (const token of queryTokens) {
      queryVector.set(token, (queryVector.get(token) || 0) + 1);
    }
    for (const [term, count] of queryVector) {
      queryVector.set(term, (count / queryTokens.length) * (this.idf.get(term) || 0));
    }

    // Calculate cosine similarity
    const scores = this.tfidf.map((docVector, idx) => {
      let dotProduct = 0;
      let docNorm = 0;
      let queryNorm = 0;

      for (const [term, weight] of docVector) {
        docNorm += weight * weight;
        if (queryVector.has(term)) {
          dotProduct += weight * queryVector.get(term);
        }
      }
      for (const [term, weight] of queryVector) {
        queryNorm += weight * weight;
      }

      const similarity = dotProduct / (Math.sqrt(docNorm) * Math.sqrt(queryNorm) || 1);
      return { idx, similarity };
    });

    return scores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .filter(s => s.similarity > 0.01)
      .map(s => ({
        document: this.documents[s.idx],
        score: s.similarity
      }));
  }
}

// ============================================================================
// CLAUDE API
// ============================================================================

async function callClaude(systemPrompt, userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set');
  }

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error.message));
          } else {
            resolve(json.content[0].text);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const query = process.argv.slice(2).join(' ');
  
  if (!query) {
    console.log('Usage: node art-assistant.js "your question about generative art"');
    console.log('');
    console.log('Examples:');
    console.log('  node art-assistant.js "How do I create a flow field?"');
    console.log('  node art-assistant.js "Explain perlin noise in generative art"');
    console.log('  node art-assistant.js "Write p5.js code for a particle system"');
    process.exit(0);
  }

  // Load processed data
  console.log('Loading knowledge base...');
  
  let systemKnowledge, ragDocs, codeExamples;
  
  try {
    systemKnowledge = JSON.parse(fs.readFileSync(`${PROCESSED_DIR}/system-knowledge.json`, 'utf8'));
    ragDocs = JSON.parse(fs.readFileSync(`${PROCESSED_DIR}/rag-documents.json`, 'utf8'));
    codeExamples = JSON.parse(fs.readFileSync(`${PROCESSED_DIR}/code-examples.json`, 'utf8'));
  } catch (e) {
    console.error('Error: Processed data not found. Run process-artblocks-dataset.js first.');
    process.exit(1);
  }

  // Build retriever
  console.log('Building search index...');
  const retriever = new SimpleRetriever();
  retriever.index(ragDocs);

  // Search for relevant context
  console.log(`Searching for: "${query}"`);
  const results = retriever.search(query, 5);
  
  console.log(`Found ${results.length} relevant documents`);

  // Build context from retrieved documents
  let context = '';
  for (const result of results) {
    const doc = result.document;
    context += `\n---\n[${doc.type}] ${doc.id}\n${doc.content.slice(0, 2000)}\n`;
  }

  // Build system prompt
  const systemPrompt = `You are an expert generative art assistant with deep knowledge of Art Blocks, p5.js, Three.js, and algorithmic art techniques.

## Your Knowledge Base

### Platform Stats
${systemKnowledge.overview}

### Common Techniques
${systemKnowledge.common_patterns.slice(0, 10).map(p => `- ${p.pattern}`).join('\n')}

### Key Techniques Reference
- Hash-based randomness: Use tokenData.hash to seed deterministic PRNG
- p5.js: setup() + draw() pattern, createCanvas, 2D primitives
- Three.js: Scene + Camera + Renderer + Meshes pattern
- Noise: Perlin/Simplex noise for organic randomness
- Flow fields: Vector fields that guide particle movement

## Retrieved Context (from Art Blocks database)
${context}

## Instructions
1. Answer questions about generative art techniques, code, and aesthetics
2. Provide working code examples when asked
3. Reference specific Art Blocks projects when relevant
4. Explain both the technical and artistic aspects
5. Be precise about p5.js, Three.js, or vanilla JS syntax`;

  // Call Claude
  console.log('\nAsking Claude...\n');
  console.log('─'.repeat(60));
  
  try {
    const response = await callClaude(systemPrompt, query);
    console.log(response);
  } catch (e) {
    console.error('Error calling Claude:', e.message);
    
    if (e.message.includes('API key')) {
      console.log('\nSet your API key:');
      console.log('  export ANTHROPIC_API_KEY=your-key-here');
    }
  }
  
  console.log('─'.repeat(60));
}

main().catch(console.error);
