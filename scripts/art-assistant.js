#!/usr/bin/env node

/**
 * Generative Art RAG Assistant
 *
 * Retrieval-augmented generation system for generative art queries.
 * Uses semantic search (bge-small-en-v1.5 embeddings) + Claude API.
 *
 * Setup:
 *   1. Run `node services/embeddings/generate.js` to create embeddings
 *   2. Set ANTHROPIC_API_KEY environment variable
 *   3. node scripts/art-assistant.js "your question here"
 *
 * Examples:
 *   node scripts/art-assistant.js "How do I create a flow field in p5.js?"
 *   node scripts/art-assistant.js "Explain how Fidenza uses noise"
 *   node scripts/art-assistant.js "Write code for a generative grid pattern"
 */

import { readFileSync, existsSync } from 'fs';
import https from 'https';

// ============================================================================
// CONFIG
// ============================================================================

const PROCESSED_DIR = './processed';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const TOP_K_RESULTS = 5;

// ============================================================================
// SEMANTIC SEARCH (using embeddings service)
// ============================================================================

let searchFn = null;
let indexExistsFn = null;
let useSemanticSearch = false;

/**
 * Initialize semantic search if embeddings are available
 */
async function initSearch() {
  try {
    // Dynamic import to handle case where embeddings don't exist
    const embeddings = await import('../services/embeddings/index.js');
    searchFn = embeddings.search;
    indexExistsFn = embeddings.indexExists;

    if (indexExistsFn()) {
      useSemanticSearch = true;
      return true;
    }
  } catch (error) {
    // Fall through to TF-IDF
  }
  return false;
}

/**
 * Perform semantic search
 */
async function semanticSearch(query, topK = TOP_K_RESULTS) {
  const results = await searchFn(query, { topK, includeScores: true });
  return results;
}

// ============================================================================
// FALLBACK TF-IDF RETRIEVAL (when embeddings don't exist)
// ============================================================================

class SimpleRetriever {
  constructor() {
    this.documents = [];
    this.idf = new Map();
    this.tfidf = [];
  }

  tokenize(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }

  index(documents) {
    this.documents = documents;
    const docCount = documents.length;
    const termDocFreq = new Map();

    for (const doc of documents) {
      const tokens = new Set(this.tokenize(doc.content));
      for (const token of tokens) {
        termDocFreq.set(token, (termDocFreq.get(token) || 0) + 1);
      }
    }

    for (const [term, freq] of termDocFreq) {
      this.idf.set(term, Math.log(docCount / freq));
    }

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
  }

  search(query, topK = 5) {
    const queryTokens = this.tokenize(query);
    const queryVector = new Map();

    for (const token of queryTokens) {
      queryVector.set(token, (queryVector.get(token) || 0) + 1);
    }
    for (const [term, count] of queryVector) {
      queryVector.set(term, (count / queryTokens.length) * (this.idf.get(term) || 0));
    }

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
    console.log('Usage: node scripts/art-assistant.js "your question about generative art"');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/art-assistant.js "How do I create a flow field?"');
    console.log('  node scripts/art-assistant.js "Explain perlin noise in generative art"');
    console.log('  node scripts/art-assistant.js "Write p5.js code for a particle system"');
    process.exit(0);
  }

  // Load processed data
  console.log('Loading knowledge base...');

  let systemKnowledge, ragDocs;

  try {
    systemKnowledge = JSON.parse(readFileSync(`${PROCESSED_DIR}/system-knowledge.json`, 'utf8'));
    ragDocs = JSON.parse(readFileSync(`${PROCESSED_DIR}/rag-documents.json`, 'utf8'));
  } catch (e) {
    console.error('Error: Processed data not found. Run the processing script first.');
    process.exit(1);
  }

  // Try to use semantic search
  const hasEmbeddings = await initSearch();
  let results = [];
  let context = '';

  if (hasEmbeddings) {
    console.log('Using semantic search (embeddings)...');
    console.log(`Searching for: "${query}"`);

    const searchResults = await semanticSearch(query, TOP_K_RESULTS);
    console.log(`Found ${searchResults.length} relevant projects`);

    // Create a map for looking up full document content
    const docMap = new Map(ragDocs.map(d => [d.id, d]));

    // Build context from semantic search results
    for (const result of searchResults) {
      const doc = docMap.get(result.projectId);
      if (doc) {
        context += `\n---\n[${result.type}] ${result.projectId} (score: ${result.score.toFixed(3)})\n`;
        context += `Artist: ${result.artist}\n`;
        context += `Framework: ${result.scriptType}\n`;
        context += `${doc.content.slice(0, 1500)}\n`;
      }
    }
  } else {
    console.log('Embeddings not found. Using TF-IDF search (slower, less accurate).');
    console.log('Run `node services/embeddings/generate.js` to enable semantic search.');
    console.log('');
    console.log('Building TF-IDF index...');

    const retriever = new SimpleRetriever();
    retriever.index(ragDocs);

    console.log(`Searching for: "${query}"`);
    const tfidfResults = retriever.search(query, TOP_K_RESULTS);
    console.log(`Found ${tfidfResults.length} relevant documents`);

    // Build context from TF-IDF results
    for (const result of tfidfResults) {
      const doc = result.document;
      context += `\n---\n[${doc.type}] ${doc.id}\n${doc.content.slice(0, 2000)}\n`;
    }
  }

  // Build system prompt
  const systemPrompt = `You are an expert generative art assistant with deep knowledge of Art Blocks, fxhash, p5.js, Three.js, and algorithmic art techniques.

## Your Knowledge Base

### Platform Stats
${systemKnowledge.overview}

### Common Techniques
${systemKnowledge.common_patterns.slice(0, 10).map(p => `- ${p.pattern}`).join('\n')}

### Key Techniques Reference
- Hash-based randomness: Use tokenData.hash (Art Blocks) or fxhash (fxhash) to seed deterministic PRNG
- p5.js: setup() + draw() pattern, createCanvas, 2D primitives
- Three.js: Scene + Camera + Renderer + Meshes pattern
- Noise: Perlin/Simplex noise for organic randomness
- Flow fields: Vector fields that guide particle movement

## Retrieved Context (from generative art database)
${context}

## Instructions
1. Answer questions about generative art techniques, code, and aesthetics
2. Provide working code examples when asked
3. Reference specific projects from Art Blocks or fxhash when relevant
4. Explain both the technical and artistic aspects
5. Be precise about p5.js, Three.js, or vanilla JS syntax`;

  // Call Claude
  console.log('\nAsking Claude...\n');
  console.log('-'.repeat(60));

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

  console.log('-'.repeat(60));
}

main().catch(console.error);
