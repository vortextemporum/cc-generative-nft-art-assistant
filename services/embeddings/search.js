/**
 * Semantic Search Service
 *
 * Provides vector similarity search over embedding index.
 * Uses cosine similarity (dot product with pre-normalized vectors).
 */

import { embed } from './model.js';
import { loadIndex, indexExists } from './storage.js';

// Cache loaded index in memory for fast searches
let cachedIndex = null;

/**
 * Compute cosine similarity between two vectors.
 * Since embeddings are normalized, this is just the dot product.
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} Similarity score between -1 and 1
 */
export function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

/**
 * Load and cache the embedding index
 * @returns {Promise<Object>} The loaded index with vectors and metadata
 * @throws {Error} If embeddings don't exist
 */
export async function ensureIndex() {
  if (cachedIndex) {
    return cachedIndex;
  }

  if (!indexExists()) {
    throw new Error(
      'Embeddings not found. Run `node services/embeddings/generate.js` first.'
    );
  }

  console.error('Loading embedding index...');
  const startTime = Date.now();
  cachedIndex = loadIndex();
  const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.error(`Loaded ${cachedIndex.vectors.length.toLocaleString()} vectors in ${loadTime}s`);

  return cachedIndex;
}

/**
 * Apply filters to a list of vectors
 * @param {Object[]} vectors - Array of vector objects
 * @param {Object} filters - Filter criteria
 * @returns {Object[]} Filtered vectors
 */
function applyFilters(vectors, filters) {
  let filtered = vectors;

  // Filter by platform (artblocks, fxhash, etc.)
  if (filters.platform) {
    const platform = filters.platform.toLowerCase();
    filtered = filtered.filter(v => v.source?.toLowerCase() === platform);
  }

  // Filter by framework (p5js, threejs, js, regl, tone)
  if (filters.framework) {
    const framework = filters.framework.toLowerCase();
    filtered = filtered.filter(v => v.scriptType?.toLowerCase() === framework);
  }

  // Filter by artist (case-insensitive partial match)
  if (filters.artist) {
    const artistQuery = filters.artist.toLowerCase();
    filtered = filtered.filter(v =>
      v.artist?.toLowerCase().includes(artistQuery)
    );
  }

  return filtered;
}

/**
 * Search for similar projects using semantic similarity
 * @param {string} query - Natural language query
 * @param {Object} options - Search options
 * @param {number} [options.topK=10] - Number of results to return
 * @param {Object} [options.filters={}] - Filter criteria
 * @param {string} [options.filters.platform] - Platform filter (artblocks, fxhash)
 * @param {string} [options.filters.framework] - Framework filter (p5js, threejs, js, regl, tone)
 * @param {string} [options.filters.artist] - Artist name filter (partial match)
 * @param {number} [options.filters.minScore=0.3] - Minimum similarity score
 * @param {boolean} [options.includeScores=true] - Include similarity scores in results
 * @returns {Promise<Object[]>} Array of search results
 */
export async function search(query, options = {}) {
  const {
    topK = 10,
    filters = {},
    includeScores = true
  } = options;

  const minScore = filters.minScore ?? 0.3;

  // Load index
  const index = await ensureIndex();

  // Embed the query
  const queryEmbedding = await embed(query);

  // Apply pre-filtering based on metadata
  let candidates = applyFilters(index.vectors, filters);

  // Score all candidates
  const scored = candidates.map(vector => ({
    projectId: vector.projectId,
    type: vector.type,
    source: vector.source,
    artist: vector.artist,
    scriptType: vector.scriptType,
    score: cosineSimilarity(queryEmbedding, vector.embedding)
  }));

  // Filter by minimum score
  const filtered = scored.filter(r => r.score >= minScore);

  // Sort by score descending
  filtered.sort((a, b) => b.score - a.score);

  // Deduplicate by projectId, keeping highest score
  const seenProjects = new Set();
  const deduped = [];

  for (const result of filtered) {
    if (!seenProjects.has(result.projectId)) {
      seenProjects.add(result.projectId);
      deduped.push(result);
    }
    if (deduped.length >= topK) break;
  }

  // Format results
  return deduped.map(r => {
    const result = {
      projectId: r.projectId,
      type: r.type,
      source: r.source,
      artist: r.artist,
      scriptType: r.scriptType
    };

    if (includeScores) {
      result.score = r.score;
    }

    return result;
  });
}

/**
 * Convenience wrapper for search with filters
 * @param {string} query - Natural language query
 * @param {Object} filters - Filter criteria
 * @param {number} [topK=10] - Number of results
 * @returns {Promise<Object[]>} Array of search results
 */
export async function searchWithFilters(query, filters, topK = 10) {
  return search(query, { topK, filters, includeScores: true });
}

/**
 * Get index statistics
 * @returns {Promise<Object>} Index metadata and stats
 */
export async function getIndexStats() {
  const index = await ensureIndex();
  return {
    ...index.metadata,
    vectorCount: index.vectors.length,
    indexLoaded: true
  };
}

/**
 * Clear cached index (useful for testing or memory management)
 */
export function clearCache() {
  cachedIndex = null;
}
