#!/usr/bin/env node

/**
 * Embedding Generator CLI
 *
 * Generates embeddings for all RAG documents and persists them to disk.
 * Progress is visible during generation with periodic checkpoints.
 *
 * Usage:
 *   node services/embeddings/generate.js              # Generate all embeddings
 *   node services/embeddings/generate.js --limit 100  # Test with 100 projects
 *   node services/embeddings/generate.js --force      # Regenerate even if exists
 */

import { readFileSync } from 'fs';
import { EmbeddingModel } from './model.js';
import { chunkProjects, getChunkingStats } from './chunker.js';
import {
  saveIndex,
  saveCheckpoint,
  loadIndex,
  indexExists,
  createMetadata
} from './storage.js';

// Configuration
const RAG_DOCS_PATH = './processed/rag-documents.json';
const BATCH_SIZE = 50;
const CHECKPOINT_INTERVAL = 1000; // Save every N chunks

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    force: false,
    limit: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--force') {
      options.force = true;
    } else if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return options;
}

/**
 * Format time duration in human-readable format
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format file size
 */
function formatSize(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

/**
 * Main generation function
 */
async function generate(options = {}) {
  const { force = false, limit = null } = options;
  const startTime = Date.now();

  console.log('='.repeat(60));
  console.log('Embedding Generator');
  console.log('='.repeat(60));
  console.log();

  // Check if index already exists
  if (!force && indexExists()) {
    const existing = loadIndex();
    if (existing && !existing.metadata.checkpoint) {
      console.log('Embeddings already exist.');
      console.log(`  Vectors: ${existing.vectors.length}`);
      console.log(`  Projects: ${existing.metadata.projectCount}`);
      console.log(`  Created: ${existing.metadata.created}`);
      console.log();
      console.log('Use --force to regenerate.');
      return;
    }
    console.log('Found incomplete checkpoint. Regenerating...');
  }

  // Load RAG documents
  console.log(`Loading RAG documents from ${RAG_DOCS_PATH}...`);
  let documents;
  try {
    documents = JSON.parse(readFileSync(RAG_DOCS_PATH, 'utf8'));
  } catch (error) {
    console.error(`Error loading RAG documents: ${error.message}`);
    console.error('Run the processing script first to generate rag-documents.json');
    process.exit(1);
  }

  console.log(`Loaded ${documents.length.toLocaleString()} documents`);

  // Apply limit if specified
  if (limit) {
    documents = documents.slice(0, limit);
    console.log(`Limited to ${documents.length} documents (--limit ${limit})`);
  }
  console.log();

  // Chunk all projects
  console.log('Chunking projects...');
  const chunks = chunkProjects(documents);
  const stats = getChunkingStats(documents);
  console.log(`  Total chunks: ${chunks.length.toLocaleString()}`);
  console.log(`  Metadata chunks: ${stats.metadataChunks.toLocaleString()}`);
  console.log(`  Tag chunks: ${stats.tagChunks.toLocaleString()}`);
  console.log(`  Avg per project: ${stats.avgChunksPerProject}`);
  console.log();

  // Initialize model (triggers download on first run)
  console.log('Initializing embedding model...');
  await EmbeddingModel.getInstance();
  console.log();

  // Generate embeddings in batches
  console.log('Generating embeddings...');
  console.log(`  Batch size: ${BATCH_SIZE}`);
  console.log(`  Checkpoint every: ${CHECKPOINT_INTERVAL} chunks`);
  console.log();

  const vectors = [];
  const totalChunks = chunks.length;

  for (let i = 0; i < totalChunks; i += BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + BATCH_SIZE);
    const batchTexts = batchChunks.map(c => c.content);

    // Embed batch
    const embeddings = await EmbeddingModel.embedBatch(batchTexts, BATCH_SIZE, () => {});

    // Create vector objects
    for (let j = 0; j < batchChunks.length; j++) {
      const chunk = batchChunks[j];
      vectors.push({
        id: chunk.id,
        projectId: chunk.projectId,
        type: chunk.type,
        embedding: embeddings[j],
        source: chunk.source,
        artist: chunk.artist,
        scriptType: chunk.scriptType
      });
    }

    // Progress update
    const processed = Math.min(i + BATCH_SIZE, totalChunks);
    const pct = ((processed / totalChunks) * 100).toFixed(1);
    const elapsed = Date.now() - startTime;
    const rate = processed / (elapsed / 1000);
    const remaining = (totalChunks - processed) / rate;

    process.stdout.write(
      `\rEmbedding chunk ${processed.toLocaleString()}/${totalChunks.toLocaleString()} ` +
      `(${pct}%) - ETA: ${formatDuration(remaining * 1000)}    `
    );

    // Checkpoint save
    if (processed % CHECKPOINT_INTERVAL === 0 && processed < totalChunks) {
      const metadata = createMetadata(documents.length, processed);
      saveCheckpoint(vectors, metadata, processed);
    }
  }

  console.log(); // New line after progress
  console.log();

  // Final save
  const metadata = createMetadata(documents.length, vectors.length);
  saveIndex({ vectors, metadata });

  // Summary
  const totalTime = Date.now() - startTime;
  const vectorsSize = JSON.stringify(vectors).length;

  console.log();
  console.log('='.repeat(60));
  console.log('Generation Complete');
  console.log('='.repeat(60));
  console.log(`  Projects: ${documents.length.toLocaleString()}`);
  console.log(`  Vectors: ${vectors.length.toLocaleString()}`);
  console.log(`  Dimensions: ${EmbeddingModel.DIMENSIONS}`);
  console.log(`  Model: ${EmbeddingModel.MODEL_ID}`);
  console.log(`  Duration: ${formatDuration(totalTime)}`);
  console.log(`  Estimated file size: ${formatSize(vectorsSize)}`);
  console.log();
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
Embedding Generator CLI

Usage:
  node services/embeddings/generate.js [options]

Options:
  --limit N    Process only first N projects (for testing)
  --force      Regenerate embeddings even if they exist
  --help       Show this help message

Examples:
  node services/embeddings/generate.js --limit 100   # Test with 100 projects
  node services/embeddings/generate.js               # Generate all (~30-60 min)
  node services/embeddings/generate.js --force       # Force regeneration
`);
}

// Main entry point
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
} else {
  const options = parseArgs();
  generate(options).catch(error => {
    console.error('Generation failed:', error);
    process.exit(1);
  });
}
