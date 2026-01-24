#!/usr/bin/env node

/**
 * EditArt Dataset Fetcher
 *
 * Fetches generative art projects from EditArt (editart.xyz) via Objkt GraphQL API.
 * EditArt is a Tezos-based platform where collectors co-create art using 5 parameter sliders.
 *
 * Usage:
 *   node editart-fetcher.js                      # Fetch all collections (metadata only)
 *   node editart-fetcher.js --with-scripts       # Include IPFS script content (slow)
 *   node editart-fetcher.js --output data.json   # Custom output file
 *   node editart-fetcher.js --limit 50           # Fetch only first N collections
 *   node editart-fetcher.js --since 2025-01-01   # Fetch collections created after date
 *   node editart-fetcher.js --update             # Incremental update (fetch new since last run)
 */

import fs from 'fs';
import https from 'https';
import http from 'http';

const OBJKT_ENDPOINT = "https://data.objkt.com/v3/graphql";
const DEFAULT_OUTPUT = "data/editart-dataset.json";

// IPFS gateways to try (in order of preference)
const IPFS_GATEWAYS = [
  "https://dweb.link/ipfs/",
  "https://w3s.link/ipfs/",
  "https://nftstorage.link/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/"
];

// ============================================================================
// HTTP HELPERS
// ============================================================================

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 30000
    };

    const req = lib.request(reqOptions, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = `${parsedUrl.protocol}//${parsedUrl.host}${redirectUrl}`;
        }
        return httpRequest(redirectUrl, options).then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function queryGraphQL(query, variables = {}) {
  const body = JSON.stringify({ query, variables });

  const response = await httpRequest(OBJKT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    body,
    timeout: 60000
  });

  try {
    const json = JSON.parse(response.data);
    if (json.errors) {
      throw new Error(JSON.stringify(json.errors, null, 2));
    }
    return json.data;
  } catch (e) {
    throw new Error(`Parse error: ${e.message}\nResponse: ${response.data.slice(0, 500)}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// IPFS FETCHING
// ============================================================================

function extractIpfsHash(uri) {
  if (!uri) return null;
  // Handle ipfs:// protocol
  if (uri.startsWith('ipfs://')) {
    // Remove query params for the hash
    const hashPart = uri.slice(7).split('?')[0];
    return hashPart;
  }
  // Handle gateway URLs
  const match = uri.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

function extractSliderParams(uri) {
  if (!uri) return null;
  try {
    const url = new URL(uri.replace('ipfs://', 'https://ipfs.io/ipfs/'));
    const params = {};
    for (let i = 0; i <= 4; i++) {
      const val = url.searchParams.get(`m${i}`);
      if (val !== null) {
        params[`m${i}`] = parseFloat(val);
      }
    }
    return Object.keys(params).length > 0 ? params : null;
  } catch {
    return null;
  }
}

async function fetchFromIPFS(ipfsHash, timeout = 30000) {
  if (!ipfsHash) return null;

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = gateway + ipfsHash;
      const response = await httpRequest(url, { timeout });

      if (response.status === 200 && response.data) {
        return response.data;
      }
    } catch (e) {
      // Try next gateway
      continue;
    }
  }

  return null;
}

// ============================================================================
// GRAPHQL QUERIES
// ============================================================================

const COLLECTIONS_QUERY = `
  query GetEditArtCollections($limit: Int!, $offset: Int!) {
    fa(
      where: { path: { _ilike: "editart-%" } }
      limit: $limit
      offset: $offset
      order_by: { contract: asc }
    ) {
      contract
      name
      type
      path
      creator_address
      description
      website
      logo
      floor_price
      volume_total
      items
      editions
      live
      category
      twitter
    }
  }
`;

const TOKENS_QUERY = `
  query GetTokens($contract: String!, $limit: Int!, $offset: Int!) {
    token(
      where: { fa: { contract: { _eq: $contract } } }
      limit: $limit
      offset: $offset
      order_by: { token_id: asc }
    ) {
      pk
      token_id
      name
      description
      artifact_uri
      display_uri
      thumbnail_uri
      metadata
      royalties {
        decimals
        amount
      }
      creators {
        holder {
          address
          alias
        }
      }
    }
  }
`;

// ============================================================================
// MAIN FETCH
// ============================================================================

async function fetchAllCollections(options = {}) {
  const { limit = null, sinceDate = null } = options;

  console.log("=".repeat(60));
  console.log("EDITART DATASET FETCHER");
  console.log("=".repeat(60));
  console.log(`Endpoint: ${OBJKT_ENDPOINT}`);
  console.log(`Platform: editart.xyz (Tezos)`);
  if (limit) console.log(`Limit: ${limit} collections`);
  if (sinceDate) console.log(`Since: ${sinceDate}`);
  console.log("");

  const allCollections = [];
  const batchSize = 100;
  let offset = 0;

  console.log("Fetching EditArt collections...\n");

  while (true) {
    if (limit && allCollections.length >= limit) {
      console.log(`\nReached limit of ${limit} collections`);
      break;
    }

    const take = limit ? Math.min(batchSize, limit - allCollections.length) : batchSize;
    process.stdout.write(`  Batch at offset ${offset}... `);

    try {
      const result = await queryGraphQL(COLLECTIONS_QUERY, { limit: take, offset });
      const collections = result.fa || [];

      if (collections.length === 0) {
        console.log("done (no more collections)");
        break;
      }

      allCollections.push(...collections);
      console.log(`got ${collections.length} (total: ${allCollections.length})`);

      offset += collections.length;
      await sleep(200); // Rate limiting

    } catch (e) {
      console.log(`ERROR: ${e.message.slice(0, 200)}`);

      if (allCollections.length > 0) {
        console.log("Continuing with partial data...");
        break;
      } else {
        throw e;
      }
    }
  }

  console.log(`\n✓ Fetched ${allCollections.length} EditArt collections\n`);
  return allCollections;
}

async function fetchTokensForCollection(contract, options = {}) {
  const { limit = 100 } = options;
  const tokens = [];
  let offset = 0;

  while (true) {
    try {
      const result = await queryGraphQL(TOKENS_QUERY, {
        contract,
        limit: Math.min(50, limit - tokens.length),
        offset
      });

      const batch = result.token || [];
      if (batch.length === 0) break;

      tokens.push(...batch);
      offset += batch.length;

      if (tokens.length >= limit) break;
      await sleep(100);

    } catch (e) {
      break;
    }
  }

  return tokens;
}

// ============================================================================
// DATA NORMALIZATION
// ============================================================================

function normalizeCollection(collection, tokens = []) {
  // Get unique IPFS hash from first token's artifact_uri (this is the project code)
  const firstToken = tokens[0];
  const ipfsHash = firstToken ? extractIpfsHash(firstToken.artifact_uri) : null;

  // Extract artist info
  const artistAddress = collection.creator_address;
  const artistAlias = tokens[0]?.creators?.[0]?.holder?.alias;

  return {
    // IDs
    id: `editart-${collection.contract}`,
    project_id: collection.contract,
    slug: collection.path,

    // Basic info
    name: collection.name,
    artist_name: artistAlias || artistAddress || 'Unknown',
    artist_address: artistAddress,

    // Description
    description: collection.description || '',

    // Supply/editions
    invocations: collection.items || 0,
    max_invocations: collection.editions || collection.items || 0,
    editions: collection.editions || 0,

    // Status
    live: collection.live,

    // Pricing
    floor_price: collection.floor_price,
    volume_total: collection.volume_total,

    // URIs
    generative_uri: ipfsHash ? `ipfs://${ipfsHash}` : null,
    ipfs_hash: ipfsHash,
    logo: collection.logo,

    // Code/script (populated if --with-scripts)
    script: null,
    script_type: detectScriptType(collection),

    // Metadata
    category: collection.category,
    twitter: collection.twitter,
    website: collection.website || 'https://editart.xyz',

    // Contract info
    contract_address: collection.contract,
    contract_type: collection.type,

    // Slider parameters (EditArt uses 5 sliders: m0-m4)
    slider_params: firstToken ? extractSliderParams(firstToken.artifact_uri) : null,

    // Sample tokens
    sample_tokens: tokens.slice(0, 3).map(t => ({
      token_id: t.token_id,
      name: t.name,
      artifact_uri: t.artifact_uri,
      display_uri: t.display_uri,
      slider_params: extractSliderParams(t.artifact_uri)
    })),

    // Source
    source: 'editart',
    source_url: `https://editart.xyz/collection/${collection.contract}`,
    objkt_url: `https://objkt.com/collection/${collection.path || collection.contract}`
  };
}

function detectScriptType(collection) {
  const desc = (collection.description || '').toLowerCase();
  const name = (collection.name || '').toLowerCase();

  if (desc.includes('p5.js') || desc.includes('p5js')) return 'p5js';
  if (desc.includes('three.js') || desc.includes('threejs') || desc.includes('3d')) return 'threejs';
  if (desc.includes('webgl') || desc.includes('shader') || desc.includes('glsl')) return 'webgl';
  if (desc.includes('svg')) return 'svg';
  if (desc.includes('canvas')) return 'canvas';

  // Most EditArt projects use p5.js
  return 'p5js';
}

// ============================================================================
// INCREMENTAL UPDATE
// ============================================================================

function loadExistingDataset(outputFile) {
  try {
    if (fs.existsSync(outputFile)) {
      const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      return data;
    }
  } catch (e) {
    console.log(`Could not load existing dataset: ${e.message}`);
  }
  return null;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const includeScripts = args.includes('--with-scripts') || args.includes('-s');
  const updateMode = args.includes('--update') || args.includes('-u');

  let outputFile = DEFAULT_OUTPUT;
  const outputIdx = args.findIndex(a => a === '--output' || a === '-o');
  if (outputIdx !== -1 && args[outputIdx + 1]) {
    outputFile = args[outputIdx + 1];
  }

  let limit = null;
  const limitIdx = args.findIndex(a => a === '--limit' || a === '-l');
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    limit = parseInt(args[limitIdx + 1], 10);
  }

  let sinceDate = null;
  const sinceIdx = args.findIndex(a => a === '--since');
  if (sinceIdx !== -1 && args[sinceIdx + 1]) {
    sinceDate = args[sinceIdx + 1];
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
EditArt Dataset Fetcher

Fetches generative art from EditArt (editart.xyz) via Objkt GraphQL API.
EditArt is a Tezos platform where collectors co-create using 5 parameter sliders.

Usage:
  node editart-fetcher.js [options]

Options:
  --with-scripts, -s    Fetch full script content from IPFS (slow)
  --output, -o FILE     Output file (default: ${DEFAULT_OUTPUT})
  --limit, -l N         Fetch only first N collections
  --since DATE          Fetch collections created after DATE (YYYY-MM-DD)
  --update, -u          Incremental update (merge with existing dataset)
  --help, -h            Show this help

Examples:
  # Fetch all collections (fast, metadata only)
  node editart-fetcher.js

  # Fetch with scripts (slower, includes code)
  node editart-fetcher.js --with-scripts

  # Incremental update (only new collections)
  node editart-fetcher.js --update

  # Fetch latest 50 collections
  node editart-fetcher.js --limit 50
    `);
    process.exit(0);
  }

  try {
    // Load existing dataset for update mode
    let existingData = null;
    let existingContracts = new Set();

    if (updateMode) {
      existingData = loadExistingDataset(outputFile);
      if (existingData) {
        existingContracts = new Set(existingData.projects.map(p => p.contract_address));
        console.log(`Update mode: ${existingContracts.size} existing collections loaded\n`);
      }
    }

    // Fetch collections
    const collections = await fetchAllCollections({ limit, sinceDate });

    if (collections.length === 0) {
      console.error("No collections fetched!");
      process.exit(1);
    }

    // Filter to only new collections in update mode
    let collectionsToProcess = collections;
    if (updateMode && existingContracts.size > 0) {
      collectionsToProcess = collections.filter(c => !existingContracts.has(c.contract));
      console.log(`Found ${collectionsToProcess.length} new collections to process\n`);

      if (collectionsToProcess.length === 0) {
        console.log("No new collections found. Dataset is up to date.");
        process.exit(0);
      }
    }

    // Fetch tokens and normalize
    console.log("Fetching tokens and normalizing data...\n");
    const normalizedProjects = [];

    for (let i = 0; i < collectionsToProcess.length; i++) {
      const collection = collectionsToProcess[i];
      process.stdout.write(`  [${i + 1}/${collectionsToProcess.length}] ${collection.name?.slice(0, 40) || collection.contract}... `);

      try {
        // Fetch sample tokens to get IPFS hash
        const tokens = await fetchTokensForCollection(collection.contract, { limit: 5 });
        const normalized = normalizeCollection(collection, tokens);

        // Optionally fetch script content
        if (includeScripts && normalized.ipfs_hash) {
          const script = await fetchFromIPFS(normalized.ipfs_hash);
          if (script) {
            normalized.script = script;
            process.stdout.write(`script loaded (${(script.length / 1024).toFixed(1)}KB) `);
          }
        }

        normalizedProjects.push(normalized);
        console.log("done");

      } catch (e) {
        console.log(`error: ${e.message.slice(0, 50)}`);
        // Still add with basic info
        normalizedProjects.push(normalizeCollection(collection, []));
      }

      await sleep(150);
    }

    // Merge with existing data if in update mode
    let finalProjects = normalizedProjects;
    if (updateMode && existingData) {
      finalProjects = [...existingData.projects, ...normalizedProjects];
      console.log(`\nMerged: ${existingData.projects.length} existing + ${normalizedProjects.length} new = ${finalProjects.length} total`);
    }

    // Build dataset
    const dataset = {
      metadata: {
        source: "editart",
        platform_url: "https://editart.xyz",
        api: OBJKT_ENDPOINT,
        fetched_at: new Date().toISOString(),
        total_collections: finalProjects.length,
        collections_with_scripts: finalProjects.filter(p => p.script).length,
        new_collections: normalizedProjects.length,
        fields: Object.keys(finalProjects[0] || {})
      },
      projects: finalProjects
    };

    console.log(`\nSaving to ${outputFile}...`);

    const json = JSON.stringify(dataset, null, 2);
    fs.writeFileSync(outputFile, json);

    const sizeMB = (Buffer.byteLength(json) / 1024 / 1024).toFixed(2);

    console.log("");
    console.log("=".repeat(60));
    console.log("COMPLETE");
    console.log("=".repeat(60));
    console.log(`Output: ${outputFile}`);
    console.log(`Size: ${sizeMB} MB`);
    console.log(`Collections: ${finalProjects.length}`);
    console.log(`With scripts: ${finalProjects.filter(p => p.script).length}`);
    console.log(`New this run: ${normalizedProjects.length}`);
    console.log("");

    // Show sample
    if (normalizedProjects.length > 0) {
      console.log("Sample new collection:");
      const sample = normalizedProjects[0];
      console.log(`  Name: ${sample.name}`);
      console.log(`  Artist: ${sample.artist_name}`);
      console.log(`  Contract: ${sample.contract_address}`);
      console.log(`  Editions: ${sample.editions}`);
      console.log(`  Script type: ${sample.script_type}`);
      console.log(`  IPFS: ${sample.ipfs_hash || 'N/A'}`);
    }

    // Stats by script type
    const byType = {};
    for (const p of finalProjects) {
      byType[p.script_type] = (byType[p.script_type] || 0) + 1;
    }
    console.log("\nCollections by script type:");
    for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${type}: ${count}`);
    }

  } catch (e) {
    console.error("\nFatal error:", e.message);
    process.exit(1);
  }
}

main();
