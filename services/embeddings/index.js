/**
 * Embeddings Service - Main Exports
 *
 * Unified interface for embedding generation, storage, and search.
 *
 * Usage:
 *   import { search, embed, EmbeddingModel } from './services/embeddings/index.js';
 *
 *   // Search
 *   const results = await search('flow fields with particles', { topK: 5 });
 *
 *   // Embed custom text
 *   const vector = await embed('particle systems');
 *
 *   // Check if index exists
 *   if (indexExists()) { ... }
 */

// Version for API compatibility tracking
export const VERSION = '1.0.0';

// Model exports
export {
  EmbeddingModel,
  embed,
  embedBatch,
  getInstance
} from './model.js';

// Search exports
export {
  search,
  searchWithFilters,
  cosineSimilarity,
  ensureIndex,
  getIndexStats,
  clearCache
} from './search.js';

// Storage exports
export {
  loadIndex,
  indexExists,
  saveIndex,
  getMetadata,
  INDEX_DIR,
  VECTORS_PATH,
  METADATA_PATH
} from './storage.js';

// Chunker exports
export {
  chunkProject,
  chunkProjects,
  getChunkingStats
} from './chunker.js';
