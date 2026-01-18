/**
 * Code Retrieval Tool for MCP Server
 *
 * Returns full source code for a specific project.
 * Use after search when you want to study implementation details.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatCodeResult } from '../lib/response.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

// Cache for loaded data
let codeExamples = null;
let artblocksDataset = null;
let fxhashDataset = null;

/**
 * Load code examples (curated subset with full scripts)
 */
function loadCodeExamples() {
  if (codeExamples) return codeExamples;

  const codePath = path.join(ROOT, 'processed/code-examples.json');
  if (fs.existsSync(codePath)) {
    codeExamples = JSON.parse(fs.readFileSync(codePath, 'utf8'));
    console.error(`Loaded ${codeExamples.length} code examples`);
  } else {
    console.error('Code examples not found at:', codePath);
    codeExamples = [];
  }

  return codeExamples;
}

/**
 * Load Art Blocks dataset (full scripts available)
 */
function loadArtblocksDataset() {
  if (artblocksDataset) return artblocksDataset;

  const dataPath = path.join(ROOT, 'data/artblocks-dataset.json');
  if (fs.existsSync(dataPath)) {
    artblocksDataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.error(`Loaded ${artblocksDataset.length} Art Blocks projects`);
  } else {
    console.error('Art Blocks dataset not found at:', dataPath);
    artblocksDataset = [];
  }

  return artblocksDataset;
}

/**
 * Load fxhash dataset (scripts may or may not be included)
 */
function loadFxhashDataset() {
  if (fxhashDataset) return fxhashDataset;

  const dataPath = path.join(ROOT, 'data/fxhash-dataset.json');
  if (fs.existsSync(dataPath)) {
    fxhashDataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.error(`Loaded ${fxhashDataset.length} fxhash projects`);
  } else {
    console.error('fxhash dataset not found at:', dataPath);
    fxhashDataset = [];
  }

  return fxhashDataset;
}

/**
 * Parse project ID from various formats
 * Supports: "artblocks_123", "fxhash_456", "123" (defaults to artblocks)
 */
function parseProjectId(projectId) {
  const str = String(projectId).trim();

  // Format: "artblocks_123" or "fxhash_456"
  if (str.includes('_')) {
    const [source, id] = str.split('_');
    return { source: source.toLowerCase(), id };
  }

  // Just a number - assume artblocks
  return { source: 'artblocks', id: str };
}

/**
 * Find project by ID in a dataset
 */
function findInDataset(dataset, projectId, source) {
  if (!dataset || dataset.length === 0) return null;

  // Try exact project_id match
  let project = dataset.find(p =>
    String(p.project_id) === String(projectId)
  );

  // Try name match if no ID match
  if (!project && typeof projectId === 'string') {
    const nameLower = projectId.toLowerCase();
    project = dataset.find(p =>
      p.name?.toLowerCase().includes(nameLower)
    );
  }

  if (project) {
    return {
      ...project,
      source
    };
  }

  return null;
}

/**
 * Get full source code for a specific project
 *
 * @param {Object} args - Arguments
 * @param {string} args.project_id - Project ID to look up
 * @returns {Promise<Object>} Full project with script
 */
export async function getProjectCode(args) {
  const { project_id } = args;

  if (!project_id) {
    return { error: 'project_id is required' };
  }

  const { source, id } = parseProjectId(project_id);

  // First, check code examples (curated, always have scripts)
  const examples = loadCodeExamples();
  const exampleMatch = examples.find(e =>
    String(e.project_id) === id ||
    e.name?.toLowerCase().includes(id.toLowerCase())
  );

  if (exampleMatch) {
    return formatCodeResult({
      ...exampleMatch,
      source: exampleMatch.source || source
    });
  }

  // Try loading from source dataset
  if (source === 'artblocks') {
    const dataset = loadArtblocksDataset();
    const project = findInDataset(dataset, id, 'artblocks');
    if (project) {
      return formatCodeResult(project);
    }
  } else if (source === 'fxhash') {
    const dataset = loadFxhashDataset();
    const project = findInDataset(dataset, id, 'fxhash');
    if (project) {
      if (!project.script) {
        return {
          projectId: id,
          name: project.name,
          artist: project.artist_name || project.author?.name,
          platform: 'fxhash',
          framework: project.script_type_and_version || 'unknown',
          description: project.description,
          error: 'Script not available for this fxhash project. Scripts are stored on IPFS and need to be fetched separately.',
          hint: 'Run `node scripts/fxhash-fetcher.js --with-scripts` to fetch scripts'
        };
      }
      return formatCodeResult(project);
    }
  }

  // Try searching in both datasets
  const artblocks = loadArtblocksDataset();
  const fxhash = loadFxhashDataset();

  // Try Art Blocks first
  let project = findInDataset(artblocks, id, 'artblocks');
  if (project) {
    return formatCodeResult(project);
  }

  // Try fxhash
  project = findInDataset(fxhash, id, 'fxhash');
  if (project) {
    if (!project.script) {
      return {
        projectId: id,
        name: project.name,
        artist: project.artist_name || project.author?.name,
        platform: 'fxhash',
        framework: project.script_type_and_version || 'unknown',
        description: project.description,
        error: 'Script not available for this fxhash project.',
        hint: 'fxhash scripts are stored on IPFS. Use generativeUri to fetch from IPFS.'
      };
    }
    return formatCodeResult(project);
  }

  return {
    error: `Project "${project_id}" not found`,
    hint: 'Try searching first with search_projects to find valid project IDs'
  };
}
