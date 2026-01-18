#!/usr/bin/env node

/**
 * Embedding Service for Generative Art Dataset
 *
 * Uses @xenova/transformers for local embeddings (no API costs)
 * Generates and stores embeddings for RAG documents
 *
 * Usage:
 *   node services/embeddings/embed.js generate    # Generate embeddings
 *   node services/embeddings/embed.js search "query"  # Search
 */

const fs = require('fs');
const path = require('path');

// Lazy load transformers (heavy import)
let pipeline = null;
let extractor = null;

const EMBEDDINGS_PATH = './processed/embeddings.json';
const RAG_DOCS_PATH = './processed/rag-documents.json';
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2'; // Fast, good quality, 384 dims

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

async function initModel() {
  if (extractor) return extractor;

  console.log('Loading embedding model (first run downloads ~23MB)...');
  const { pipeline: pipelineFn } = await import('@xenova/transformers');
  pipeline = pipelineFn;
  extractor = await pipeline('feature-extraction', MODEL_NAME);
  console.log('Model loaded.');
  return extractor;
}

async function embed(text) {
  const model = await initModel();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

async function embedBatch(texts, batchSize = 32) {
  const model = await initModel();
  const embeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const outputs = await Promise.all(
      batch.map(t => model(t, { pooling: 'mean', normalize: true }))
    );
    embeddings.push(...outputs.map(o => Array.from(o.data)));

    if ((i + batchSize) % 500 === 0 || i + batchSize >= texts.length) {
      console.log(`  Embedded ${Math.min(i + batchSize, texts.length)}/${texts.length}`);
    }
  }

  return embeddings;
}

// ============================================================================
// VECTOR OPERATIONS
// ============================================================================

function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot; // Vectors are already normalized
}

function search(queryEmbedding, documents, topK = 10) {
  const scored = documents.map((doc, idx) => ({
    idx,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
    ...doc
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

async function generateEmbeddings() {
  console.log('Loading RAG documents...');
  const ragDocs = JSON.parse(fs.readFileSync(RAG_DOCS_PATH, 'utf8'));
  console.log(`Loaded ${ragDocs.length} documents`);

  // Create condensed text for embedding (metadata only, not full scripts)
  const texts = ragDocs.map(doc => doc.content);

  console.log('Generating embeddings (this may take a few minutes)...');
  const embeddings = await embedBatch(texts);

  // Store embeddings with minimal metadata
  const embeddedDocs = ragDocs.map((doc, i) => ({
    id: doc.id,
    content: doc.content.slice(0, 500), // Truncate for storage
    metadata: {
      source: doc.metadata.source,
      project_id: doc.metadata.project_id,
      artist: doc.metadata.artist,
      script_type: doc.metadata.script_type,
      patterns: doc.metadata.patterns || [],
    },
    embedding: embeddings[i]
  }));

  console.log('Saving embeddings...');
  fs.writeFileSync(EMBEDDINGS_PATH, JSON.stringify(embeddedDocs));

  const sizeMB = (fs.statSync(EMBEDDINGS_PATH).size / 1024 / 1024).toFixed(1);
  console.log(`Saved ${embeddedDocs.length} embeddings to ${EMBEDDINGS_PATH} (${sizeMB} MB)`);
}

async function searchDocuments(query, topK = 10) {
  if (!fs.existsSync(EMBEDDINGS_PATH)) {
    console.error('Embeddings not found. Run: node services/embeddings/embed.js generate');
    process.exit(1);
  }

  console.log('Loading embeddings...');
  const docs = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf8'));

  console.log(`Searching for: "${query}"`);
  const queryEmbedding = await embed(query);

  const results = search(queryEmbedding, docs, topK);

  console.log(`\nTop ${topK} results:\n`);
  results.forEach((r, i) => {
    console.log(`${i + 1}. [${r.metadata.source}] Score: ${r.score.toFixed(4)}`);
    console.log(`   ${r.content.split('\n')[0]}`);
    console.log(`   Patterns: ${r.metadata.patterns.slice(0, 5).join(', ')}`);
    console.log('');
  });

  return results;
}

// ============================================================================
// EXPORTS FOR MCP SERVER
// ============================================================================

module.exports = {
  initModel,
  embed,
  embedBatch,
  search,
  cosineSimilarity,
  generateEmbeddings,
  searchDocuments,
  EMBEDDINGS_PATH,
};

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const command = process.argv[2];

  if (command === 'generate') {
    await generateEmbeddings();
  } else if (command === 'search') {
    const query = process.argv.slice(3).join(' ');
    if (!query) {
      console.error('Usage: node embed.js search "your query"');
      process.exit(1);
    }
    await searchDocuments(query);
  } else {
    console.log(`
Embedding Service for Generative Art Dataset

Commands:
  generate           Generate embeddings for all RAG documents
  search "query"     Search documents by semantic similarity

Examples:
  node embed.js generate
  node embed.js search "flow fields with particles"
  node embed.js search "minimalist geometric patterns"
`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
