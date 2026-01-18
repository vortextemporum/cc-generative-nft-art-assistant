#!/usr/bin/env node

/**
 * Shadertoy Dataset Fetcher
 *
 * Fetches GLSL shaders from shadertoy.com.
 * Requires API key (free with Silver/Gold account).
 *
 * Usage:
 *   node shadertoy-fetcher.js                       # Fetch all (paginated)
 *   node shadertoy-fetcher.js --query "raymarching" # Search query
 *   node shadertoy-fetcher.js --sort popular        # Sort: name,love,popular,newest,hot
 *   node shadertoy-fetcher.js --limit 1000          # Limit total shaders
 *   node shadertoy-fetcher.js --output data.json    # Custom output
 *
 * Environment:
 *   SHADERTOY_API_KEY - Your Shadertoy API key
 */

const fs = require('fs');
const https = require('https');

const API_BASE = "https://www.shadertoy.com/api/v1";
const DEFAULT_OUTPUT = "shadertoy-dataset.json";
const PAGE_SIZE = 25; // Shadertoy default, max is higher but be conservative

// ============================================================================
// HTTP HELPER
// ============================================================================

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);

    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GenerativeArtAssistant/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// SHADERTOY API
// ============================================================================

async function fetchAllShaderIds(apiKey) {
  const url = `${API_BASE}/shaders?key=${apiKey}`;
  console.log("Fetching all shader IDs...");

  try {
    const response = await httpGet(url);
    if (response.data.Error) {
      throw new Error(response.data.Error);
    }
    const ids = response.data.Results || [];
    console.log(`  Found ${ids.length} shader IDs`);
    return ids;
  } catch (e) {
    console.error(`  Error: ${e.message}`);
    return [];
  }
}

async function searchShaders(apiKey, query, options = {}) {
  const { sort = 'popular', from = 0, num = PAGE_SIZE } = options;

  let url = `${API_BASE}/shaders/query/${encodeURIComponent(query)}?key=${apiKey}&sort=${sort}&from=${from}&num=${num}`;

  try {
    const response = await httpGet(url);
    if (response.data.Error) {
      throw new Error(response.data.Error);
    }
    return {
      shaders: response.data.Results || [],
      total: response.data.Shaders || 0
    };
  } catch (e) {
    console.error(`  Search error: ${e.message}`);
    return { shaders: [], total: 0 };
  }
}

async function fetchShaderById(apiKey, shaderId) {
  const url = `${API_BASE}/shaders/${shaderId}?key=${apiKey}`;

  try {
    const response = await httpGet(url);
    if (response.data.Error) {
      return null;
    }
    return response.data.Shader;
  } catch (e) {
    return null;
  }
}

async function fetchShaders(apiKey, shaderIds, batchSize = 10) {
  const shaders = [];
  const total = shaderIds.length;

  console.log(`Fetching ${total} shader details...`);

  for (let i = 0; i < total; i += batchSize) {
    const batch = shaderIds.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(total / batchSize);

    process.stdout.write(`  Batch ${batchNum}/${totalBatches} (${shaders.length}/${total})...\r`);

    const promises = batch.map(id => fetchShaderById(apiKey, id));
    const results = await Promise.all(promises);

    for (const shader of results) {
      if (shader) {
        shaders.push(shader);
      }
    }

    // Rate limiting - 1500 requests/month = ~50/day = ~2/hour conservative
    // But for bulk fetch, we can be more aggressive within a session
    await sleep(200);
  }

  console.log(`\n  Fetched ${shaders.length} shaders successfully`);
  return shaders;
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

function processShader(shader) {
  const info = shader.info || {};
  const renderpass = shader.renderpass || [];

  // Extract main image pass code
  const imagePass = renderpass.find(p => p.type === 'image') || renderpass[0];
  const code = imagePass?.code || '';

  // Extract all passes
  const passes = renderpass.map(pass => ({
    name: pass.name,
    type: pass.type,
    code: pass.code,
    inputs: (pass.inputs || []).map(input => ({
      channel: input.channel,
      type: input.ctype,
      src: input.src
    })),
    outputs: (pass.outputs || []).map(output => ({
      channel: output.channel,
      id: output.id
    }))
  }));

  return {
    id: info.id,
    name: info.name,
    description: info.description,
    author: info.username,
    date: info.date,
    views: info.viewed,
    likes: info.likes,
    published: info.published,
    flags: info.flags,
    tags: info.tags || [],
    has_sound: info.hasliked, // API quirk
    link: `https://www.shadertoy.com/view/${info.id}`,
    // Code
    code_length: code.length,
    pass_count: passes.length,
    main_code: code,
    all_passes: passes,
    // Analysis
    uses_raymarching: /raymarching|sdf|signed distance/i.test(code) || /\bmap\s*\(/.test(code),
    uses_noise: /noise|fbm|perlin|simplex/i.test(code),
    uses_texture: renderpass.some(p => p.inputs?.length > 0),
    uses_mouse: /iMouse/i.test(code),
    uses_time: /iTime|iDate/i.test(code),
    uses_audio: /iChannel.*fft|iChannelResolution/i.test(code)
  };
}

function analyzeDataset(shaders) {
  const stats = {
    total: shaders.length,
    unique_authors: new Set(shaders.map(s => s.author)).size,
    total_views: shaders.reduce((sum, s) => sum + (s.views || 0), 0),
    total_likes: shaders.reduce((sum, s) => sum + (s.likes || 0), 0),
    avg_code_length: shaders.reduce((sum, s) => sum + s.code_length, 0) / shaders.length,
    technique_usage: {
      raymarching: shaders.filter(s => s.uses_raymarching).length,
      noise: shaders.filter(s => s.uses_noise).length,
      texture: shaders.filter(s => s.uses_texture).length,
      mouse_input: shaders.filter(s => s.uses_mouse).length,
      time_based: shaders.filter(s => s.uses_time).length,
      audio_reactive: shaders.filter(s => s.uses_audio).length
    }
  };

  // Tag frequency
  const tagCounts = {};
  shaders.forEach(s => {
    (s.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  stats.top_tags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([tag, count]) => ({ tag, count }));

  // Top authors
  const authorCounts = {};
  shaders.forEach(s => {
    authorCounts[s.author] = (authorCounts[s.author] || 0) + 1;
  });
  stats.top_authors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([author, count]) => ({ author, count }));

  // Most viewed
  stats.most_viewed = shaders
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map(s => ({
      id: s.id,
      name: s.name,
      author: s.author,
      views: s.views,
      likes: s.likes
    }));

  return stats;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let outputFile = DEFAULT_OUTPUT;
  let limit = 500; // Conservative default for API limits
  let query = null;
  let sort = 'popular';
  let fetchAll = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) {
      outputFile = args[++i];
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[++i], 10);
    } else if (args[i] === '--query' && args[i + 1]) {
      query = args[++i];
    } else if (args[i] === '--sort' && args[i + 1]) {
      sort = args[++i];
    } else if (args[i] === '--all') {
      fetchAll = true;
    }
  }

  // Get API key
  const apiKey = process.env.SHADERTOY_API_KEY;
  if (!apiKey) {
    console.error("Error: SHADERTOY_API_KEY environment variable not set");
    console.error("\nTo get an API key:");
    console.error("1. Create a Shadertoy account");
    console.error("2. Upgrade to Silver or Gold (free to request)");
    console.error("3. Go to your profile and request an API key");
    console.error("\nUsage: SHADERTOY_API_KEY=xxx node shadertoy-fetcher.js");
    process.exit(1);
  }

  console.log("=== Shadertoy Dataset Fetcher ===\n");
  console.log(`Output: ${outputFile}`);
  console.log(`Limit: ${fetchAll ? 'all' : limit}`);
  console.log(`Sort: ${sort}`);
  if (query) console.log(`Query: ${query}`);
  console.log();

  let shaderIds = [];

  if (query) {
    // Search-based fetch
    console.log(`Searching for "${query}"...`);
    let from = 0;
    const maxResults = fetchAll ? Infinity : limit;

    while (shaderIds.length < maxResults) {
      const result = await searchShaders(apiKey, query, { sort, from, num: PAGE_SIZE });
      if (result.shaders.length === 0) break;

      shaderIds.push(...result.shaders);
      from += result.shaders.length;

      console.log(`  Found ${shaderIds.length}/${result.total} shaders`);

      if (from >= result.total) break;
      await sleep(300);
    }

    if (!fetchAll && shaderIds.length > limit) {
      shaderIds = shaderIds.slice(0, limit);
    }
  } else {
    // Fetch all shader IDs first
    const allIds = await fetchAllShaderIds(apiKey);

    if (fetchAll) {
      shaderIds = allIds;
    } else {
      // Shuffle and take a sample (since we can't sort the ID list)
      const shuffled = allIds.sort(() => Math.random() - 0.5);
      shaderIds = shuffled.slice(0, limit);
    }
  }

  if (shaderIds.length === 0) {
    console.log("No shaders found.");
    process.exit(1);
  }

  // Fetch full shader data
  const rawShaders = await fetchShaders(apiKey, shaderIds);

  // Process shaders
  console.log("\nProcessing shaders...");
  const shaders = rawShaders.map(processShader);

  // Analyze dataset
  const stats = analyzeDataset(shaders);

  // Build output
  const output = {
    platform: "shadertoy.com",
    fetched_at: new Date().toISOString(),
    query: query || null,
    sort,
    stats,
    shaders
  };

  // Save to file
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\n✓ Saved ${shaders.length} shaders to ${outputFile}`);

  // Print summary
  console.log("\n=== Summary ===");
  console.log(`Total shaders: ${stats.total}`);
  console.log(`Unique authors: ${stats.unique_authors}`);
  console.log(`Total views: ${stats.total_views.toLocaleString()}`);
  console.log(`Total likes: ${stats.total_likes.toLocaleString()}`);
  console.log(`Average code length: ${stats.avg_code_length.toFixed(0)} chars`);
  console.log("\nTechnique usage:");
  Object.entries(stats.technique_usage).forEach(([tech, count]) => {
    console.log(`  ${tech}: ${count} (${(count / stats.total * 100).toFixed(1)}%)`);
  });
  console.log("\nTop 10 tags:");
  stats.top_tags.slice(0, 10).forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.tag} (${t.count})`);
  });
}

main().catch(e => {
  console.error("Fatal error:", e.message);
  process.exit(1);
});
