/**
 * Statistics Tools for MCP Server
 *
 * Provides dataset statistics and notable project discovery.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

// Cache for loaded data
let knowledge = null;

/**
 * Load system knowledge (statistics and metadata)
 */
function loadKnowledge() {
  if (knowledge) return knowledge;

  const knowPath = path.join(ROOT, 'processed/system-knowledge.json');
  if (fs.existsSync(knowPath)) {
    knowledge = JSON.parse(fs.readFileSync(knowPath, 'utf8'));
    console.error('Loaded system knowledge');
  } else {
    console.error('System knowledge not found at:', knowPath);
    knowledge = null;
  }

  return knowledge;
}

/**
 * Get dataset statistics
 *
 * @returns {Object} Statistics about the dataset
 */
export function getStats() {
  const data = loadKnowledge();

  if (!data) {
    return {
      error: 'System knowledge not loaded',
      hint: 'Run: node scripts/process-dataset.js data/artblocks-dataset.json data/fxhash-dataset.json'
    };
  }

  return {
    overview: data.overview,

    // Platform breakdown
    platforms: data.platforms,

    // Framework usage
    frameworks: {
      summary: data.script_types,
      mostUsed: Object.entries(data.script_types || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
    },

    // Common aesthetics (themes)
    aesthetics: (data.common_aesthetics || []).slice(0, 15).map(a => ({
      term: a.term,
      count: a.count
    })),

    // Technical patterns
    patterns: (data.common_patterns || []).slice(0, 15).map(p => ({
      pattern: p.pattern,
      count: p.count
    })),

    // Popular tags
    tags: (data.top_tags || []).slice(0, 15).map(t => ({
      tag: t.tag,
      count: t.count
    })),

    // Technique guide
    techniqueGuide: data.techniques_guide
  };
}

/**
 * Get notable/popular projects
 *
 * @param {string} [source] - Filter by platform (artblocks, fxhash)
 * @param {number} [limit=20] - Max results
 * @returns {Object[]} Notable projects
 */
export function getNotableProjects(source = null, limit = 20) {
  const data = loadKnowledge();

  if (!data) {
    return {
      error: 'System knowledge not loaded',
      hint: 'Run: node scripts/process-dataset.js data/artblocks-dataset.json data/fxhash-dataset.json'
    };
  }

  let projects = data.notable_projects || [];

  // Filter by source if specified
  if (source) {
    const sourceLower = source.toLowerCase();
    projects = projects.filter(p => p.source === sourceLower);
  }

  // Limit results
  projects = projects.slice(0, limit);

  // Format for output
  return {
    filter: source || 'all',
    count: projects.length,
    projects: projects.map(p => ({
      name: p.name,
      artist: p.artist,
      platform: p.source,
      framework: p.script_type,
      editions: p.invocations,
      description: p.description ? p.description.slice(0, 200) + (p.description.length > 200 ? '...' : '') : null,
      hint: 'Use get_project_code to see full source'
    }))
  };
}
