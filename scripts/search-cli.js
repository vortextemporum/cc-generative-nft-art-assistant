#!/usr/bin/env node

/**
 * Semantic Search CLI
 *
 * Search generative art projects using natural language queries.
 *
 * Usage:
 *   node scripts/search-cli.js "flow fields with particles"
 *   node scripts/search-cli.js --format json "noise patterns"
 *   node scripts/search-cli.js --framework p5js --top 20 "recursive grids"
 *   node scripts/search-cli.js --artist "Tyler Hobbs" "flow"
 *
 * Options:
 *   --top, -n        Number of results (default: 10)
 *   --format, -f     Output format: table, json, markdown (default: table)
 *   --platform       Filter by platform: artblocks, fxhash
 *   --framework      Filter by framework: p5js, threejs, js, regl, tone
 *   --artist         Filter by artist name (partial match)
 *   --verbose, -v    Show debug information
 *   --help, -h       Show this help message
 */

import { readFileSync } from 'fs';
import { search, indexExists, getIndexStats } from '../services/embeddings/index.js';

// ============================================================================
// ARGUMENT PARSING
// ============================================================================

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    query: null,
    topK: 10,
    format: 'table',
    platform: null,
    framework: null,
    artist: null,
    verbose: false,
    help: false
  };

  let i = 0;
  const queryParts = [];

  while (i < args.length) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      i++;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
      i++;
    } else if (arg === '--top' || arg === '-n') {
      options.topK = parseInt(args[i + 1], 10) || 10;
      i += 2;
    } else if (arg === '--format' || arg === '-f') {
      options.format = args[i + 1] || 'table';
      i += 2;
    } else if (arg === '--platform') {
      options.platform = args[i + 1];
      i += 2;
    } else if (arg === '--framework') {
      options.framework = args[i + 1];
      i += 2;
    } else if (arg === '--artist') {
      options.artist = args[i + 1];
      i += 2;
    } else if (!arg.startsWith('-')) {
      queryParts.push(arg);
      i++;
    } else {
      // Unknown flag, skip
      i++;
    }
  }

  options.query = queryParts.join(' ').trim();
  return options;
}

// ============================================================================
// RAG DOCUMENT LOOKUP
// ============================================================================

let ragDocuments = null;

function loadRagDocuments() {
  if (ragDocuments) return ragDocuments;

  try {
    ragDocuments = JSON.parse(readFileSync('./processed/rag-documents.json', 'utf8'));
    // Create lookup map by ID
    const lookup = new Map();
    for (const doc of ragDocuments) {
      lookup.set(doc.id, doc);
    }
    ragDocuments = lookup;
    return ragDocuments;
  } catch (error) {
    console.error('Warning: Could not load rag-documents.json for enrichment');
    return new Map();
  }
}

function enrichResult(result) {
  const docs = loadRagDocuments();
  const doc = docs.get(result.projectId);

  if (!doc) {
    return {
      ...result,
      name: 'Unknown Project',
      description: '',
      aesthetics: [],
      link: null
    };
  }

  // Extract name from content (first line after "Project: ")
  const content = doc.content || '';
  const nameMatch = content.match(/^Project:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : result.projectId;

  // Extract description snippet
  const descMatch = content.match(/Description:\s*(.+)/);
  const description = descMatch
    ? descMatch[1].slice(0, 100) + (descMatch[1].length > 100 ? '...' : '')
    : '';

  // Get aesthetics
  const aesthetics = doc.metadata?.aesthetics || [];

  // Generate link
  let link = null;
  const source = result.source || doc.metadata?.source;
  const projectNum = doc.metadata?.project_id || result.projectId.replace(/\D+/g, '');

  if (source === 'artblocks') {
    link = `https://artblocks.io/collections/curated/projects/${projectNum}`;
  } else if (source === 'fxhash') {
    link = `https://www.fxhash.xyz/generative/${projectNum}`;
  }

  return {
    ...result,
    name,
    description,
    aesthetics,
    link
  };
}

// ============================================================================
// OUTPUT FORMATTERS
// ============================================================================

function formatTable(results) {
  if (results.length === 0) {
    console.log('No results found.');
    return;
  }

  // Calculate column widths
  const headers = ['Rank', 'Score', 'Project', 'Artist', 'Framework', 'Platform'];
  const rows = results.map((r, idx) => [
    String(idx + 1),
    r.score.toFixed(3),
    (r.name || r.projectId).slice(0, 30),
    (r.artist || 'Unknown').slice(0, 20),
    (r.scriptType || 'unknown').slice(0, 10),
    (r.source || 'unknown').slice(0, 10)
  ]);

  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => r[i].length))
  );

  // Print header
  const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join(' | ');
  const separator = widths.map(w => '-'.repeat(w)).join('-+-');

  console.log();
  console.log(headerLine);
  console.log(separator);

  // Print rows
  for (const row of rows) {
    console.log(row.map((cell, i) => cell.padEnd(widths[i])).join(' | '));
  }

  console.log();
  console.log(`Found ${results.length} results.`);
}

function formatJSON(results) {
  const output = results.map(r => ({
    rank: results.indexOf(r) + 1,
    projectId: r.projectId,
    name: r.name,
    artist: r.artist,
    score: Number(r.score.toFixed(4)),
    framework: r.scriptType,
    platform: r.source,
    description: r.description,
    aesthetics: r.aesthetics,
    link: r.link
  }));

  console.log(JSON.stringify(output, null, 2));
}

function formatMarkdown(results) {
  if (results.length === 0) {
    console.log('No results found.');
    return;
  }

  console.log();
  console.log(`## Search Results (${results.length} found)`);
  console.log();

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const title = r.link
      ? `[${r.name || r.projectId}](${r.link})`
      : (r.name || r.projectId);

    console.log(`### ${i + 1}. ${title}`);
    console.log();
    console.log(`- **Artist:** ${r.artist || 'Unknown'}`);
    console.log(`- **Score:** ${r.score.toFixed(3)}`);
    console.log(`- **Framework:** ${r.scriptType || 'unknown'}`);
    console.log(`- **Platform:** ${r.source || 'unknown'}`);

    if (r.aesthetics && r.aesthetics.length > 0) {
      console.log(`- **Aesthetics:** ${r.aesthetics.join(', ')}`);
    }

    if (r.description) {
      console.log();
      console.log(`> ${r.description}`);
    }

    console.log();
  }
}

// ============================================================================
// HELP
// ============================================================================

function showHelp() {
  console.log(`
Semantic Search CLI - Search generative art projects

Usage:
  node scripts/search-cli.js [options] "<query>"
  npm run search -- [options] "<query>"

Options:
  --top, -n <N>       Number of results (default: 10)
  --format, -f <fmt>  Output format: table, json, markdown (default: table)
  --platform <name>   Filter by platform: artblocks, fxhash
  --framework <name>  Filter by framework: p5js, threejs, js, regl, tone
  --artist <name>     Filter by artist name (partial match)
  --verbose, -v       Show debug information
  --help, -h          Show this help message

Examples:
  node scripts/search-cli.js "flow fields with particles"
  node scripts/search-cli.js --format json "moody gradients"
  node scripts/search-cli.js --framework p5js -n 20 "generative grids"
  node scripts/search-cli.js --platform artblocks "minimalist geometric"
  node scripts/search-cli.js --artist "Tyler Hobbs" "curves"

  npm run search -- "organic flowing shapes"
  npm run search -- --format markdown "noise patterns" > results.md
`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const options = parseArgs(process.argv);

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (!options.query) {
    console.log('Semantic Search CLI');
    console.log('===================\n');
    console.log('No query provided. Use --help for usage information.\n');
    showHelp();
    process.exit(0);
  }

  // Check if embeddings exist
  if (!indexExists()) {
    console.error('Error: Embeddings not found.');
    console.error('Run `node services/embeddings/generate.js` first to generate embeddings.');
    process.exit(1);
  }

  // Build filters
  const filters = {};
  if (options.platform) filters.platform = options.platform;
  if (options.framework) filters.framework = options.framework;
  if (options.artist) filters.artist = options.artist;

  // Show search info
  if (options.verbose) {
    console.log('Search Configuration:');
    console.log(`  Query: "${options.query}"`);
    console.log(`  Top K: ${options.topK}`);
    console.log(`  Format: ${options.format}`);
    console.log(`  Filters: ${JSON.stringify(filters)}`);
    console.log();

    const stats = await getIndexStats();
    console.log('Index Stats:');
    console.log(`  Vectors: ${stats.vectorCount.toLocaleString()}`);
    console.log(`  Model: ${stats.model}`);
    console.log(`  Dimensions: ${stats.dimensions}`);
    console.log();
  }

  // Perform search
  const startTime = Date.now();
  const results = await search(options.query, {
    topK: options.topK,
    filters,
    includeScores: true
  });
  const searchTime = Date.now() - startTime;

  // Enrich results with full project data
  const enriched = results.map(r => enrichResult(r));

  if (options.verbose) {
    console.log(`Search completed in ${searchTime}ms`);
    console.log();
  }

  // Output results
  switch (options.format) {
    case 'json':
      formatJSON(enriched);
      break;
    case 'markdown':
    case 'md':
      formatMarkdown(enriched);
      break;
    case 'table':
    default:
      formatTable(enriched);
      break;
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
