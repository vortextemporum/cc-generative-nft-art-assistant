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
  createMetadata,
  loadChecksums,
  saveChecksums,
  getChangedProjects
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
    full: false,
    limit: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--force') {
      options.force = true;
    } else if (args[i] === '--full') {
      options.full = true;
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
  const { force = false, full = false, limit = null } = options;
  const startTime = Date.now();

  console.log('='.repeat(60));
  console.log('Embedding Generator');
  console.log('='.repeat(60));
  console.log();

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

  // Check for incremental mode (default behavior)
  let existingVectors = [];
  let existingVectorMap = new Map();
  let projectsToEmbed = documents;
  let checksums = {};
  let newChecksums = {};

  if (!full && !force && indexExists()) {
    // Load existing index and checksums for incremental update
    const existing = loadIndex();
    checksums = loadChecksums();

    if (existing && !existing.metadata.checkpoint && Object.keys(checksums).length > 0) {
      console.log('Incremental mode: checking for changes...');

      // Find changed projects
      const result = getChangedProjects(documents, checksums);
      projectsToEmbed = result.changed;
      newChecksums = result.newChecksums;

      // Build map of existing vectors by projectId
      for (const v of existing.vectors) {
        existingVectorMap.set(v.id, v);
      }

      const cached = result.unchanged.length;
      console.log(`  ${projectsToEmbed.length.toLocaleString()} projects need embedding (${cached.toLocaleString()} cached)`);
      console.log();

      if (projectsToEmbed.length === 0) {
        console.log('All projects are up to date. Nothing to do.');
        console.log('Use --full to force complete regeneration.');
        return;
      }
    } else {
      console.log('No checksums found. Running full generation...');
    }
  } else if (full) {
    console.log('Full mode: regenerating all embeddings...');
  } else if (force) {
    console.log('Force mode: regenerating all embeddings...');
  }

  // Chunk projects to embed
  console.log('Chunking projects...');
  const chunks = chunkProjects(projectsToEmbed);
  const stats = getChunkingStats(projectsToEmbed);
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

  const newVectors = [];
  const totalChunks = chunks.length;

  for (let i = 0; i < totalChunks; i += BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + BATCH_SIZE);
    const batchTexts = batchChunks.map(c => c.content);

    // Embed batch
    const embeddings = await EmbeddingModel.embedBatch(batchTexts, BATCH_SIZE, () => {});

    // Create vector objects
    for (let j = 0; j < batchChunks.length; j++) {
      const chunk = batchChunks[j];
      newVectors.push({
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
      saveCheckpoint(newVectors, metadata, processed);
    }
  }

  console.log(); // New line after progress
  console.log();

  // Merge with existing vectors (for incremental mode)
  let finalVectors = [...newVectors]; // Copy to avoid reference issues
  const initialNewCount = newVectors.length;

  if (existingVectorMap.size > 0) {
    // Get IDs of new vectors
    const newVectorIds = new Set(newVectors.map(v => v.id));
    let keptCount = 0;

    // Keep existing vectors that weren't re-embedded
    for (const [id, vector] of existingVectorMap) {
      if (!newVectorIds.has(id)) {
        finalVectors.push(vector);
        keptCount++;
      }
    }

    console.log(`Merged ${initialNewCount} new + ${keptCount} existing = ${finalVectors.length} total vectors`);
  } else {
    console.log(`Generated ${finalVectors.length} vectors (no existing index to merge)`);
  }

  // Final save
  const metadata = createMetadata(documents.length, finalVectors.length);
  saveIndex({ vectors: finalVectors, metadata });

  // Save checksums for future incremental updates
  if (Object.keys(newChecksums).length > 0) {
    saveChecksums(newChecksums);
  } else {
    // Generate checksums for all documents if this was a full run
    const { changed, unchanged, newChecksums: allChecksums } = getChangedProjects(documents, {});
    saveChecksums(allChecksums);
  }

  // Summary
  const totalTime = Date.now() - startTime;
  const vectorsSize = JSON.stringify(finalVectors).length;

  console.log();
  console.log('='.repeat(60));
  console.log('Generation Complete');
  console.log('='.repeat(60));
  console.log(`  Projects: ${documents.length.toLocaleString()}`);
  console.log(`  Vectors: ${finalVectors.length.toLocaleString()}`);
  console.log(`  New/Updated: ${newVectors.length.toLocaleString()}`);
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
  --full       Force complete regeneration (ignore checksums)
  --help       Show this help message

By default, runs in incremental mode:
  - Checks checksums to detect changed projects
  - Only re-embeds projects that have changed
  - Fast for updates (seconds instead of minutes)

Examples:
  node services/embeddings/generate.js               # Incremental update (default)
  node services/embeddings/generate.js --full        # Full regeneration
  node services/embeddings/generate.js --limit 100   # Test with 100 projects
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
