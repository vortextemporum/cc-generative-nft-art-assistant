#!/usr/bin/env node

/**
 * fxhash Complete Dataset Fetcher
 *
 * Fetches ALL fxhash generative tokens with full metadata.
 * Scripts are stored on IPFS - this fetches metadata and optionally script content.
 *
 * Usage:
 *   node fxhash-fetcher.js                     # Metadata only (fast)
 *   node fxhash-fetcher.js --with-scripts      # Include IPFS script content (slow)
 *   node fxhash-fetcher.js --output data.json  # Custom output file
 *   node fxhash-fetcher.js --limit 100         # Fetch only first N projects
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

const FXHASH_ENDPOINT = "https://api.fxhash.xyz/graphql";
const DEFAULT_OUTPUT = "fxhash-dataset.json";

// IPFS gateways to try (in order of preference)
const IPFS_GATEWAYS = [
  "https://gateway.fxhash.xyz/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
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

  const response = await httpRequest(FXHASH_ENDPOINT, {
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
    return uri.slice(7);
  }
  // Handle gateway URLs
  const match = uri.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function fetchFromIPFS(ipfsHash, timeout = 15000) {
  if (!ipfsHash) return null;

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = gateway + ipfsHash + '/';
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
// SCHEMA INTROSPECTION
// ============================================================================

async function introspectSchema() {
  console.log("Introspecting GraphQL schema...");

  const query = `
    query {
      __type(name: "GenerativeToken") {
        fields {
          name
          type { name kind ofType { name } }
        }
      }
    }
  `;

  try {
    const result = await queryGraphQL(query);
    const fields = result.__type?.fields || [];
    console.log(`Found ${fields.length} fields in GenerativeToken type`);
    return fields.map(f => f.name);
  } catch (e) {
    console.log("Introspection failed:", e.message.slice(0, 100));
    return null;
  }
}

// ============================================================================
// MAIN FETCH
// ============================================================================

async function fetchAllTokens(options = {}) {
  const { includeScripts = false, limit = null } = options;

  console.log("=".repeat(60));
  console.log("FXHASH DATASET FETCHER");
  console.log("=".repeat(60));
  console.log(`Endpoint: ${FXHASH_ENDPOINT}`);
  console.log(`Include scripts: ${includeScripts}`);
  if (limit) console.log(`Limit: ${limit} projects`);
  console.log("");

  // Introspect schema
  await introspectSchema();

  // Core fields to fetch - using only reliably available fields
  // The fxhash API has some tokens with null values in non-nullable fields,
  // so we keep this minimal and robust
  const TOKENS_QUERY = `
    query GetTokens($take: Int!, $skip: Int!) {
      generativeTokens(take: $take, skip: $skip) {
        id
        slug
        name
        createdAt
        supply
        originalSupply
        balance
        enabled
        royalties
        tags
        labels
        generativeUri
        thumbnailUri
        displayUri
        metadataUri
        metadata
        issuerContractAddress
        gentkContractAddress
        author {
          id
          name
          description
        }
      }
    }
  `;

  const allTokens = [];
  const batchSize = 50; // fxhash seems to handle 50 well
  let skip = 0;

  console.log("Fetching generative tokens...\n");

  while (true) {
    if (limit && allTokens.length >= limit) {
      console.log(`\nReached limit of ${limit} projects`);
      break;
    }

    const take = limit ? Math.min(batchSize, limit - allTokens.length) : batchSize;
    process.stdout.write(`  Batch at offset ${skip}... `);

    try {
      const result = await queryGraphQL(TOKENS_QUERY, { take, skip });
      const tokens = result.generativeTokens || [];

      if (tokens.length === 0) {
        console.log("done (no more tokens)");
        break;
      }

      allTokens.push(...tokens);
      console.log(`got ${tokens.length} (total: ${allTokens.length})`);

      skip += tokens.length;
      await sleep(150); // Rate limiting

    } catch (e) {
      console.log(`ERROR: ${e.message.slice(0, 200)}`);

      if (allTokens.length > 0) {
        console.log("Continuing with partial data...");
        break;
      } else {
        throw e;
      }
    }
  }

  console.log(`\n✓ Fetched ${allTokens.length} generative tokens\n`);

  // Note: The codex field is often null for newer tokens due to API issues
  // We use generativeUri directly which contains the IPFS hash for the script

  // Optionally fetch actual script content from IPFS
  if (includeScripts) {
    console.log("Fetching scripts from IPFS (this may take a while)...\n");

    let scriptsLoaded = 0;
    let scriptErrors = 0;

    for (let i = 0; i < allTokens.length; i++) {
      const token = allTokens[i];
      const ipfsHash = extractIpfsHash(token.generativeUri || token.codex?.value);

      if (ipfsHash) {
        try {
          const content = await fetchFromIPFS(ipfsHash, 20000);
          if (content) {
            token.scriptContent = content;
            scriptsLoaded++;
          }
        } catch (e) {
          scriptErrors++;
        }
      }

      if ((i + 1) % 20 === 0) {
        process.stdout.write(`  Progress: ${i + 1}/${allTokens.length} (${scriptsLoaded} scripts loaded)\r`);
      }

      await sleep(200); // Be nice to IPFS gateways
    }

    console.log(`\n✓ Loaded ${scriptsLoaded} scripts from IPFS (${scriptErrors} errors)\n`);
  }

  return allTokens;
}

// ============================================================================
// DATA NORMALIZATION
// ============================================================================

function normalizeToken(token) {
  // Convert to schema similar to Art Blocks for consistency
  return {
    // IDs
    id: `fxhash-${token.id}`,
    project_id: String(token.id),
    slug: token.slug,

    // Basic info
    name: token.name,
    artist_name: token.author?.name || 'Unknown',
    artist_id: token.author?.id,
    artist_description: token.author?.description,

    // Description from metadata
    description: token.metadata?.description || '',

    // Supply/editions
    invocations: token.supply - token.balance,
    max_invocations: token.originalSupply,
    supply: token.supply,
    balance: token.balance,

    // Status
    enabled: token.enabled,

    // Dates
    created_at: token.createdAt,

    // Pricing
    royalty_percentage: token.royalties ? token.royalties / 10 : null, // Convert from basis points

    // URIs
    generative_uri: token.generativeUri,
    thumbnail_uri: token.thumbnailUri,
    display_uri: token.displayUri,
    metadata_uri: token.metadataUri,

    // Code/script
    codex_type: token.codex?.type,
    codex_value: token.codex?.value,
    codex_locked: token.codex?.locked,
    script: token.scriptContent || null, // Full HTML/JS if fetched
    script_type: extractScriptType(token),

    // Metadata
    tags: token.tags || [],
    labels: token.labels || [],
    metadata: token.metadata,

    // Contract info
    issuer_contract_address: token.issuerContractAddress,
    gentk_contract_address: token.gentkContractAddress,

    // Source
    source: 'fxhash',
    source_url: `https://www.fxhash.xyz/generative/${token.id}`
  };
}

function extractScriptType(token) {
  // Try to determine script type from tags or metadata
  const tags = (token.tags || []).map(t => t.toLowerCase());

  if (tags.includes('p5js') || tags.includes('p5')) return 'p5js';
  if (tags.includes('three.js') || tags.includes('threejs')) return 'threejs';
  if (tags.includes('webgl')) return 'webgl';
  if (tags.includes('svg')) return 'svg';
  if (tags.includes('canvas')) return 'canvas';

  // Check metadata
  const desc = (token.metadata?.description || '').toLowerCase();
  if (desc.includes('p5.js') || desc.includes('p5js')) return 'p5js';
  if (desc.includes('three.js') || desc.includes('threejs')) return 'threejs';

  return 'unknown';
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const includeScripts = args.includes('--with-scripts') || args.includes('-s');

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

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
fxhash Dataset Fetcher

Usage:
  node fxhash-fetcher.js [options]

Options:
  --with-scripts, -s    Fetch full script content from IPFS (slow)
  --output, -o FILE     Output file (default: ${DEFAULT_OUTPUT})
  --limit, -l N         Fetch only first N projects
  --help, -h            Show this help
    `);
    process.exit(0);
  }

  try {
    const tokens = await fetchAllTokens({ includeScripts, limit });

    if (tokens.length === 0) {
      console.error("No tokens fetched!");
      process.exit(1);
    }

    // Normalize all tokens
    console.log("Normalizing data...");
    const normalizedTokens = tokens.map(normalizeToken);

    const dataset = {
      metadata: {
        source: "fxhash",
        api: FXHASH_ENDPOINT,
        fetched_at: new Date().toISOString(),
        total_projects: normalizedTokens.length,
        projects_with_scripts: normalizedTokens.filter(p => p.script).length,
        projects_with_codex: normalizedTokens.filter(p => p.codex_value).length,
        fields: Object.keys(normalizedTokens[0] || {})
      },
      projects: normalizedTokens
    };

    console.log(`Saving to ${outputFile}...`);

    const json = JSON.stringify(dataset, null, 2);
    fs.writeFileSync(outputFile, json);

    const sizeMB = (Buffer.byteLength(json) / 1024 / 1024).toFixed(2);

    console.log("");
    console.log("=".repeat(60));
    console.log("COMPLETE");
    console.log("=".repeat(60));
    console.log(`Output: ${outputFile}`);
    console.log(`Size: ${sizeMB} MB`);
    console.log(`Projects: ${normalizedTokens.length}`);
    console.log(`With codex: ${normalizedTokens.filter(p => p.codex_value).length}`);
    console.log(`With scripts: ${normalizedTokens.filter(p => p.script).length}`);
    console.log(`Fields: ${Object.keys(normalizedTokens[0] || {}).length}`);
    console.log("");

    // Show sample
    console.log("Sample project:");
    const sample = normalizedTokens[0];
    console.log(`  Name: ${sample.name}`);
    console.log(`  Artist: ${sample.artist_name}`);
    console.log(`  ID: ${sample.project_id}`);
    console.log(`  Tags: ${sample.tags.slice(0, 5).join(', ')}`);
    console.log(`  Script type: ${sample.script_type}`);

    // Show stats by script type
    const byType = {};
    for (const t of normalizedTokens) {
      byType[t.script_type] = (byType[t.script_type] || 0) + 1;
    }
    console.log("\nProjects by script type:");
    for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${type}: ${count}`);
    }

  } catch (e) {
    console.error("\nFatal error:", e.message);
    process.exit(1);
  }
}

main();
