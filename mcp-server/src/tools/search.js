/**
 * Search Tools for MCP Server
 *
 * Uses Phase 1 embedding search API for semantic similarity.
 * Returns technique-focused results, not full code.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatSearchResult } from '../lib/response.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

// Lazy-load dependencies and cache
let searchFn = null;
let ragDocuments = null;
let ragDocumentsIndex = null;

/**
 * Lazy load the Phase 1 search function
 */
async function getSearchFn() {
  if (searchFn) return searchFn;

  try {
    const { search } = await import(path.join(ROOT, 'services/embeddings/index.js'));
    searchFn = search;
    return searchFn;
  } catch (error) {
    console.error('Failed to load embedding search:', error.message);
    throw new Error('Embedding search not available. Run `npm run embeddings` first.');
  }
}

/**
 * Load and index RAG documents for enrichment
 */
function loadRagDocuments() {
  if (ragDocuments) return ragDocuments;

  const ragPath = path.join(ROOT, 'processed/rag-documents.json');
  if (!fs.existsSync(ragPath)) {
    console.error('RAG documents not found at:', ragPath);
    return [];
  }

  ragDocuments = JSON.parse(fs.readFileSync(ragPath, 'utf8'));

  // Create an index by projectId for fast lookup
  ragDocumentsIndex = new Map();
  for (const doc of ragDocuments) {
    const key = `${doc.metadata?.source || 'unknown'}_${doc.metadata?.project_id}`;
    if (!ragDocumentsIndex.has(key)) {
      ragDocumentsIndex.set(key, doc);
    }
  }

  console.error(`Loaded ${ragDocuments.length} RAG documents`);
  return ragDocuments;
}

/**
 * Get enriched data for a project from RAG documents
 */
function getEnrichedData(projectId, source) {
  if (!ragDocumentsIndex) {
    loadRagDocuments();
  }

  // Try exact match first
  const key = `${source}_${projectId}`;
  if (ragDocumentsIndex.has(key)) {
    const doc = ragDocumentsIndex.get(key);
    return {
      name: extractProjectName(doc.content),
      patterns: doc.metadata?.patterns || [],
      aesthetics: doc.metadata?.aesthetics || [],
      description: extractDescription(doc.content)
    };
  }

  // Try just the projectId with different sources
  for (const s of ['artblocks', 'fxhash', 'dwitter', 'highlight']) {
    const altKey = `${s}_${projectId}`;
    if (ragDocumentsIndex.has(altKey)) {
      const doc = ragDocumentsIndex.get(altKey);
      return {
        name: extractProjectName(doc.content),
        patterns: doc.metadata?.patterns || [],
        aesthetics: doc.metadata?.aesthetics || [],
        description: extractDescription(doc.content)
      };
    }
  }

  return {};
}

/**
 * Extract project name from content string
 */
function extractProjectName(content) {
  if (!content) return null;
  const match = content.match(/^Project:\s*(.+?)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Extract description from content string
 */
function extractDescription(content) {
  if (!content) return null;
  const match = content.match(/Description:\s*(.+?)(?=\nScript Type:|$)/s);
  return match ? match[1].trim() : null;
}

/**
 * Search projects using semantic similarity
 *
 * @param {Object} args - Search arguments
 * @param {string} args.query - Natural language query
 * @param {number} [args.limit=5] - Max results
 * @param {string} [args.platform] - Filter by platform (artblocks, fxhash)
 * @param {string} [args.framework] - Filter by framework (p5js, threejs, etc.)
 * @returns {Promise<Object[]>} Array of technique-focused results
 */
export async function searchProjects(args) {
  const { query, limit = 5, platform, framework } = args;

  if (!query || query.trim().length === 0) {
    return { error: 'Query is required' };
  }

  const searchLimit = Math.min(limit, 20); // Cap at 20

  try {
    const search = await getSearchFn();

    // Build filters for Phase 1 search API
    const filters = {};
    if (platform) filters.platform = platform;
    if (framework) filters.framework = framework;

    // Call Phase 1 embedding search
    const results = await search(query, {
      topK: searchLimit,
      filters,
      includeScores: true
    });

    if (!results || results.length === 0) {
      return {
        query,
        results: [],
        message: 'No matching projects found. Try a different query or remove filters.'
      };
    }

    // Enrich results with RAG document data and format
    const enrichedResults = results.map(result => {
      const enriched = getEnrichedData(result.projectId, result.source);
      return formatSearchResult(result, enriched);
    });

    return {
      query,
      resultCount: enrichedResults.length,
      results: enrichedResults
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      error: error.message,
      hint: 'Make sure embeddings are generated. Run: npm run embeddings'
    };
  }
}

/**
 * Search projects by code pattern
 *
 * @param {Object} args - Search arguments
 * @param {string} args.pattern - Pattern to search for
 * @param {number} [args.limit=10] - Max results
 * @returns {Object[]} Array of matching projects
 */
export async function searchByPattern(args) {
  const { pattern, limit = 10 } = args;

  if (!pattern || pattern.trim().length === 0) {
    return { error: 'Pattern is required' };
  }

  // Load RAG documents
  loadRagDocuments();

  if (!ragDocuments || ragDocuments.length === 0) {
    return {
      error: 'RAG documents not loaded',
      hint: 'Run: node scripts/process-dataset.js data/artblocks-dataset.json data/fxhash-dataset.json'
    };
  }

  const patternLower = pattern.toLowerCase();

  // Filter documents by pattern
  const matches = ragDocuments.filter(doc => {
    const patterns = doc.metadata?.patterns || [];
    return patterns.some(p => p.toLowerCase().includes(patternLower));
  });

  // Deduplicate by project ID
  const seen = new Set();
  const unique = [];
  for (const doc of matches) {
    const key = `${doc.metadata?.source}_${doc.metadata?.project_id}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(doc);
    }
    if (unique.length >= limit) break;
  }

  // Format results
  const results = unique.map(doc => ({
    projectId: doc.metadata?.project_id,
    name: extractProjectName(doc.content),
    artist: doc.metadata?.artist || 'Unknown',
    platform: doc.metadata?.source,
    framework: doc.metadata?.script_type || 'unknown',
    patterns: doc.metadata?.patterns || [],
    aesthetics: doc.metadata?.aesthetics || [],
    hint: 'Use get_project_code to see full source'
  }));

  return {
    pattern,
    resultCount: results.length,
    totalMatches: matches.length,
    results
  };
}
