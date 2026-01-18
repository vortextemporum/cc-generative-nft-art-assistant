/**
 * Vector Storage Layer
 *
 * Handles persistence of embeddings and metadata to JSON files.
 * Stores in processed/embeddings/ directory.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { createHash } from 'crypto';

// Storage paths
export const INDEX_DIR = './processed/embeddings';
export const VECTORS_PATH = './processed/embeddings/vectors.json';
export const METADATA_PATH = './processed/embeddings/metadata.json';
export const CHECKSUMS_PATH = './processed/embeddings/checksums.json';

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

// ============================================================================
// CHECKSUM TRACKING FOR INCREMENTAL UPDATES
// ============================================================================

/**
 * Generate checksum for a project document
 * Uses name + description + script_length for change detection
 * @param {Object} project - RAG document
 * @returns {string} MD5 hash hex string
 */
export function generateChecksum(project) {
  const content = project.content || '';
  const scriptLength = project.metadata?.script_length || 0;
  const data = `${content.slice(0, 500)}|${scriptLength}`;
  return createHash('md5').update(data).digest('hex');
}

/**
 * Load checksums from disk
 * @returns {Object} Map of projectId -> checksum
 */
export function loadChecksums() {
  if (!existsSync(CHECKSUMS_PATH)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(CHECKSUMS_PATH, 'utf8'));
  } catch (error) {
    console.error('Error loading checksums:', error.message);
    return {};
  }
}

/**
 * Save checksums to disk
 * @param {Object} checksums - Map of projectId -> checksum
 */
export function saveChecksums(checksums) {
  ensureDir();
  writeFileSync(CHECKSUMS_PATH, JSON.stringify(checksums, null, 2));
  console.log(`Saved checksums to ${CHECKSUMS_PATH}`);
}

/**
 * Get projects that have changed since last embedding
 * @param {Object[]} projects - Array of RAG documents
 * @param {Object} checksums - Existing checksums map
 * @returns {Object} { changed: [], unchanged: [], newChecksums: {} }
 */
export function getChangedProjects(projects, checksums) {
  const changed = [];
  const unchanged = [];
  const newChecksums = {};

  for (const project of projects) {
    const id = project.id;
    const newChecksum = generateChecksum(project);
    newChecksums[id] = newChecksum;

    if (checksums[id] === newChecksum) {
      unchanged.push(project);
    } else {
      changed.push(project);
    }
  }

  return { changed, unchanged, newChecksums };
}
