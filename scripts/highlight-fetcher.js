#!/usr/bin/env node

/**
 * Highlight.xyz Dataset Fetcher
 *
 * Fetches generative art projects from Highlight.xyz collections.
 * Uses Alchemy NFT API to enumerate tokens, then fetches code from Arweave.
 *
 * Usage:
 *   node highlight-fetcher.js --contract 0x... --chain base    # Fetch specific collection
 *   node highlight-fetcher.js --collections collections.json    # Fetch from list
 *   node highlight-fetcher.js --output data.json               # Custom output
 *
 * Environment:
 *   ALCHEMY_API_KEY - Your Alchemy API key
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

// Configuration
const DEFAULT_OUTPUT = "highlight-dataset.json";
const ALCHEMY_BASE_URLS = {
  ethereum: "https://eth-mainnet.g.alchemy.com",
  base: "https://base-mainnet.g.alchemy.com",
  arbitrum: "https://arb-mainnet.g.alchemy.com",
  optimism: "https://opt-mainnet.g.alchemy.com",
  polygon: "https://polygon-mainnet.g.alchemy.com",
  zora: "https://zora-mainnet.g.alchemy.com"
};

// Known Highlight generative collections (can be expanded)
const KNOWN_COLLECTIONS = [
  // Base - Onchain Summer 2023
  { chain: "base", address: "0xc111b1033DC8f32d85c152D7ac89C4311344D77D", name: "Crypto-Native by Melissa Wiederrecht" },

  // Ethereum - AGH Collective (Dec 2023)
  { chain: "ethereum", address: "0xc1739be27821fa207ba62a52d31b851013e2cb7f", name: "Heatsink by Leander Herzog" },
  { chain: "ethereum", address: "0x8bd8eab9655573165fdafa404e72dc5e769a83fa", name: "Alternate by Kim Asendorf" },
  { chain: "ethereum", address: "0xf4f7CDe685F409E4373cF0C5DC8b818046860d77", name: "Crush by Andreas Gysin" },

  // Additional Base collections
  { chain: "base", address: "0xB8F3c136b511211607f2A5b4568D7cf590bC98EE", name: "Semiograph by Paul Prudence" },
  { chain: "base", address: "0x21c3a69ead9b81863b83757ff2645803ff7c7690", name: "Fractal Tapestries by Holger Lippmann" },
  { chain: "base", address: "0xdE64E3A2CC948E9C4Df8EDF8083DCabdc9dCE285", name: "RUNAWAY by James Merrill" },
  { chain: "base", address: "0x36a47d92848ac5620b9c4937a267E8C21Fa68505", name: "Finnish Coloring" },

  // Additional Ethereum collections
  { chain: "ethereum", address: "0xaE55B142f1cA580B3F67E519eB0F0585F88063a7", name: "ES: by mchx" },

  // Note: Cargo (0x99a9B7c1116f9ceEB1652de04d5969CcE509B069) uses Art Blocks Engine
  // Code is stored in contract, fetched via generator.artblocks.io - use artblocks-fetcher instead
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// ALCHEMY API
// ============================================================================

async function fetchNFTsForContract(apiKey, chain, contractAddress, limit = 100) {
  const baseUrl = ALCHEMY_BASE_URLS[chain];
  if (!baseUrl) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  const allNfts = [];
  let pageKey = null;
  let page = 0;

  console.log(`  Fetching NFTs from ${chain}:${contractAddress}...`);

  do {
    let url = `${baseUrl}/nft/v3/${apiKey}/getNFTsForContract?contractAddress=${contractAddress}&withMetadata=true&limit=${limit}`;
    if (pageKey) {
      url += `&pageKey=${pageKey}`;
    }

    try {
      const response = await httpRequest(url);
      const data = JSON.parse(response.data);

      if (data.error) {
        throw new Error(data.error.message || JSON.stringify(data.error));
      }

      const nfts = data.nfts || [];
      allNfts.push(...nfts);
      pageKey = data.pageKey;
      page++;

      console.log(`    Page ${page}: ${nfts.length} NFTs (total: ${allNfts.length})`);

      // Rate limiting
      await sleep(200);
    } catch (e) {
      console.error(`    Error fetching page ${page + 1}: ${e.message}`);
      break;
    }
  } while (pageKey);

  return allNfts;
}

// ============================================================================
// ARWEAVE FETCHER
// ============================================================================

async function fetchFromArweave(url) {
  try {
    const response = await httpRequest(url, { timeout: 60000 });
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (e) {
    console.error(`    Failed to fetch from Arweave: ${e.message}`);
    return null;
  }
}

function extractArweaveBase(animationUrl) {
  // Extract base Arweave URL without query params
  // e.g., https://arweave.net/L-Eauqr4OxkXOU8M1JKlr0Tj4Em2PSfcd1uFeY5YdVQ/index.html?...
  // -> https://arweave.net/L-Eauqr4OxkXOU8M1JKlr0Tj4Em2PSfcd1uFeY5YdVQ/
  if (!animationUrl) return null;

  const match = animationUrl.match(/(https:\/\/arweave\.net\/[^\/]+\/)/);
  return match ? match[1] : null;
}

function isOnChainCode(animationUrl) {
  // Check if animation_url is a base64-encoded data URI
  return animationUrl && animationUrl.startsWith('data:text/html;base64,');
}

function decodeOnChainCode(animationUrl) {
  // Decode base64 on-chain code
  if (!isOnChainCode(animationUrl)) return null;

  try {
    const base64Data = animationUrl.replace('data:text/html;base64,', '');
    return Buffer.from(base64Data, 'base64').toString('utf-8');
  } catch (e) {
    console.error(`    Failed to decode on-chain code: ${e.message}`);
    return null;
  }
}

async function fetchGenerativeCode(arweaveBase) {
  const files = {};

  // Fetch index.html
  const indexHtml = await fetchFromArweave(arweaveBase + 'index.html');
  if (indexHtml) {
    files['index.html'] = indexHtml;

    // Parse for script references
    const scriptMatches = indexHtml.matchAll(/<script[^>]+src=["']([^"']+)["']/g);
    for (const match of scriptMatches) {
      const scriptName = match[1];
      if (!scriptName.startsWith('http')) {
        const scriptContent = await fetchFromArweave(arweaveBase + scriptName);
        if (scriptContent) {
          files[scriptName] = scriptContent;
        }
        await sleep(100);
      }
    }
  }

  return files;
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

function processNFT(nft, chain) {
  const metadata = nft.raw?.metadata || {};
  const animationUrl = metadata.animation_url || nft.animation?.originalUrl;

  return {
    id: `${chain}:${nft.contract.address}:${nft.tokenId}`,
    chain,
    contract_address: nft.contract.address,
    contract_name: nft.contract.name,
    token_id: nft.tokenId,
    name: nft.name || metadata.name,
    description: nft.description || metadata.description,
    image_url: metadata.image || nft.image?.originalUrl,
    animation_url: animationUrl,
    arweave_base: extractArweaveBase(animationUrl),
    attributes: metadata.attributes || [],
    mint: nft.mint || null
  };
}

async function processCollection(apiKey, chain, contractAddress, fetchCode = false) {
  console.log(`\nProcessing collection: ${chain}:${contractAddress}`);

  // Fetch all NFTs
  const nfts = await fetchNFTsForContract(apiKey, chain, contractAddress);

  if (nfts.length === 0) {
    console.log("  No NFTs found");
    return null;
  }

  // Process NFTs
  const processedNfts = nfts.map(nft => processNFT(nft, chain));

  // Get unique Arweave base (should be same for all tokens in a generative collection)
  const arweaveBases = [...new Set(processedNfts.map(n => n.arweave_base).filter(Boolean))];

  let code = null;
  let codeType = null;

  if (fetchCode) {
    // Check for Arweave-hosted code
    if (arweaveBases.length > 0) {
      console.log(`  Fetching generative code from Arweave...`);
      code = await fetchGenerativeCode(arweaveBases[0]);
      codeType = 'arweave';
      console.log(`    Found ${Object.keys(code).length} files`);
    }
    // Check for on-chain base64-encoded code
    else if (processedNfts.length > 0) {
      const sampleUrl = processedNfts[0].animation_url;
      if (isOnChainCode(sampleUrl)) {
        console.log(`  Decoding on-chain generative code...`);
        const decoded = decodeOnChainCode(sampleUrl);
        if (decoded) {
          code = { 'index.html': decoded };
          codeType = 'onchain';
          console.log(`    Decoded ${decoded.length} chars of on-chain code`);
        }
      }
    }
  }

  // Get contract info from first NFT
  const firstNft = nfts[0];

  return {
    id: `${chain}:${contractAddress}`,
    chain,
    contract_address: contractAddress,
    contract_name: firstNft.contract?.name || "Unknown",
    token_type: firstNft.tokenType,
    total_supply: processedNfts.length,
    arweave_base: arweaveBases[0] || null,
    code_type: codeType,
    code: code,
    sample_tokens: processedNfts.slice(0, 5),
    all_attributes: aggregateAttributes(processedNfts),
    fetched_at: new Date().toISOString()
  };
}

function aggregateAttributes(nfts) {
  const attributeMap = {};

  for (const nft of nfts) {
    for (const attr of nft.attributes || []) {
      const key = attr.trait_type;
      if (!attributeMap[key]) {
        attributeMap[key] = new Set();
      }
      attributeMap[key].add(String(attr.value));
    }
  }

  // Convert sets to arrays and count
  return Object.entries(attributeMap).map(([trait, values]) => ({
    trait_type: trait,
    value_count: values.size,
    sample_values: Array.from(values).slice(0, 5)
  }));
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let outputFile = DEFAULT_OUTPUT;
  let contract = null;
  let chain = "ethereum";
  let collectionsFile = null;
  let fetchCode = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) {
      outputFile = args[++i];
    } else if (args[i] === '--contract' && args[i + 1]) {
      contract = args[++i];
    } else if (args[i] === '--chain' && args[i + 1]) {
      chain = args[++i];
    } else if (args[i] === '--collections' && args[i + 1]) {
      collectionsFile = args[++i];
    } else if (args[i] === '--no-code') {
      fetchCode = false;
    }
  }

  // Get API key
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    console.error("Error: ALCHEMY_API_KEY environment variable not set");
    console.error("Usage: ALCHEMY_API_KEY=xxx node highlight-fetcher.js --contract 0x... --chain base");
    process.exit(1);
  }

  // Determine collections to fetch
  let collections = [];

  if (contract) {
    collections = [{ chain, address: contract, name: "Custom" }];
  } else if (collectionsFile) {
    const data = fs.readFileSync(collectionsFile, 'utf8');
    collections = JSON.parse(data);
  } else {
    console.log("Using known Highlight collections:");
    collections = KNOWN_COLLECTIONS;
    collections.forEach(c => console.log(`  - ${c.name} (${c.chain}:${c.address})`));
  }

  console.log(`\nFetching ${collections.length} collection(s)...`);

  const results = [];

  for (const col of collections) {
    try {
      const result = await processCollection(apiKey, col.chain, col.address, fetchCode);
      if (result) {
        result.collection_name = col.name;
        results.push(result);
      }
    } catch (e) {
      console.error(`  Error processing ${col.name}: ${e.message}`);
    }

    // Rate limiting between collections
    await sleep(500);
  }

  // Save results
  const output = {
    platform: "highlight.xyz",
    fetched_at: new Date().toISOString(),
    collections_count: results.length,
    collections: results
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\n✓ Saved ${results.length} collection(s) to ${outputFile}`);

  // Print summary
  console.log("\n=== Summary ===");
  for (const col of results) {
    console.log(`${col.collection_name || col.contract_name}:`);
    console.log(`  Chain: ${col.chain}`);
    console.log(`  Tokens: ${col.total_supply}`);
    console.log(`  Code files: ${col.code ? Object.keys(col.code).length : 0}`);
    console.log(`  Traits: ${col.all_attributes.length}`);
  }
}

main().catch(e => {
  console.error("Fatal error:", e.message);
  process.exit(1);
});
