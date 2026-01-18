/**
 * Vector Storage Layer
 *
 * Handles persistence of embeddings and metadata to JSON files.
 * Stores in processed/embeddings/ directory.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

// Storage paths
export const INDEX_DIR = './processed/embeddings';
export const VECTORS_PATH = './processed/embeddings/vectors.json';
export const METADATA_PATH = './processed/embeddings/metadata.json';

/**
 * Ensure the embeddings directory exists
 */
export function ensureDir() {
  if (!existsSync(INDEX_DIR)) {
    mkdirSync(INDEX_DIR, { recursive: true });
    console.log(`Created directory: ${INDEX_DIR}`);
  }
}

/**
 * Save index to disk (vectors and metadata separately)
 * @param {Object} data - Index data with vectors and metadata
 * @param {Object[]} data.vectors - Array of vector objects
 * @param {Object} data.metadata - Index metadata
 */
export function saveIndex({ vectors, metadata }) {
  ensureDir();

  // Save vectors
  writeFileSync(VECTORS_PATH, JSON.stringify(vectors));
  console.log(`Saved ${vectors.length} vectors to ${VECTORS_PATH}`);

  // Save metadata
  writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));
  console.log(`Saved metadata to ${METADATA_PATH}`);
}

/**
 * Save checkpoint during generation (for resumability)
 * @param {Object[]} vectors - Current vectors
 * @param {Object} metadata - Current metadata
 * @param {number} processed - Number of chunks processed
 */
export function saveCheckpoint(vectors, metadata, processed) {
  ensureDir();

  const checkpointMeta = {
    ...metadata,
    checkpoint: true,
    processedChunks: processed,
    lastCheckpoint: new Date().toISOString()
  };

  writeFileSync(VECTORS_PATH, JSON.stringify(vectors));
  writeFileSync(METADATA_PATH, JSON.stringify(checkpointMeta, null, 2));
  console.log(`Checkpoint saved: ${processed} chunks processed`);
}

/**
 * Load index from disk
 * @returns {Object|null} Index data or null if not found
 */
export function loadIndex() {
  if (!indexExists()) {
    return null;
  }

  try {
    const vectors = JSON.parse(readFileSync(VECTORS_PATH, 'utf8'));
    const metadata = JSON.parse(readFileSync(METADATA_PATH, 'utf8'));

    return { vectors, metadata };
  } catch (error) {
    console.error('Error loading index:', error.message);
    return null;
  }
}

/**
 * Check if index exists on disk
 * @returns {boolean}
 */
export function indexExists() {
  return existsSync(VECTORS_PATH) && existsSync(METADATA_PATH);
}

/**
 * Get index metadata without loading vectors
 * @returns {Object|null} Metadata or null if not found
 */
export function getMetadata() {
  if (!existsSync(METADATA_PATH)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(METADATA_PATH, 'utf8'));
  } catch (error) {
    console.error('Error loading metadata:', error.message);
    return null;
  }
}

/**
 * Create metadata object for new index
 * @param {number} projectCount - Number of projects
 * @param {number} chunkCount - Number of chunks
 * @returns {Object} Metadata object
 */
export function createMetadata(projectCount, chunkCount) {
  return {
    model: 'Xenova/bge-small-en-v1.5',
    dimensions: 384,
    created: new Date().toISOString(),
    projectCount,
    chunkCount,
    version: '1.0.0'
  };
}
