#!/usr/bin/env node

/**
 * Dwitter Dataset Fetcher
 *
 * Fetches 140-character JavaScript demos from dwitter.net.
 * Public API, no authentication required.
 *
 * Usage:
 *   node dwitter-fetcher.js                    # Fetch all (paginated)
 *   node dwitter-fetcher.js --limit 1000       # Limit total dweets
 *   node dwitter-fetcher.js --author username  # Fetch by author
 *   node dwitter-fetcher.js --top              # Fetch by popularity
 *   node dwitter-fetcher.js --output data.json # Custom output
 */

const fs = require('fs');
const https = require('https');

const API_BASE = "https://www.dwitter.net/api";
const DEFAULT_OUTPUT = "dwitter-dataset.json";
const PAGE_SIZE = 100; // Max allowed by API

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
// DWITTER API
// ============================================================================

async function fetchDweets(options = {}) {
  const { limit = Infinity, author = null, sort = 'new', offset = 0 } = options;

  const allDweets = [];
  let currentOffset = offset;
  let page = 0;

  console.log(`Fetching dweets (${sort} sort)${author ? ` by ${author}` : ''}...`);

  while (allDweets.length < limit) {
    let url = `${API_BASE}/dweets/?limit=${PAGE_SIZE}&offset=${currentOffset}`;

    if (author) {
      url += `&author=${encodeURIComponent(author)}`;
    }

    // Note: Dwitter API sorts by posted date by default
    // For top dweets, we'd need to fetch all and sort client-side

    try {
      const response = await httpGet(url);

      if (response.status !== 200) {
        console.error(`  API error: ${response.status}`);
        break;
      }

      const dweets = response.data.results || response.data;

      if (!Array.isArray(dweets) || dweets.length === 0) {
        console.log("  No more dweets available");
        break;
      }

      allDweets.push(...dweets);
      currentOffset += dweets.length;
      page++;

      console.log(`  Page ${page}: ${dweets.length} dweets (total: ${allDweets.length})`);

      // Check if we've reached the limit
      if (allDweets.length >= limit) {
        allDweets.length = limit;
        break;
      }

      // Check if there are more pages
      if (!response.data.next && dweets.length < PAGE_SIZE) {
        break;
      }

      // Rate limiting - be nice to the API
      await sleep(500);
    } catch (e) {
      console.error(`  Error on page ${page + 1}: ${e.message}`);
      break;
    }
  }

  return allDweets;
}

async function fetchDweetById(id) {
  const url = `${API_BASE}/dweets/${id}`;
  try {
    const response = await httpGet(url);
    return response.data;
  } catch (e) {
    console.error(`Error fetching dweet ${id}: ${e.message}`);
    return null;
  }
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

function processDweet(dweet) {
  return {
    id: dweet.id,
    code: dweet.code,
    author: dweet.author?.username || dweet.author,
    posted: dweet.posted,
    link: `https://www.dwitter.net/d/${dweet.id}`,
    likes: dweet.awesome_count || 0,
    comments_count: dweet.comments?.length || 0,
    remix_of: dweet.remix_of || null,
    has_remix: dweet.has_remix || false,
    // Code stats
    code_length: dweet.code?.length || 0,
    uses_canvas: /\bc\b/.test(dweet.code || ''),
    uses_context: /\bx\b/.test(dweet.code || ''),
    uses_time: /\bt\b/.test(dweet.code || ''),
    uses_sin_cos: /Math\.(sin|cos)/.test(dweet.code || '') || /[SC]\(/.test(dweet.code || ''),
    uses_loop: /for\s*\(/.test(dweet.code || '')
  };
}

function analyzeDataset(dweets) {
  const stats = {
    total: dweets.length,
    unique_authors: new Set(dweets.map(d => d.author)).size,
    total_likes: dweets.reduce((sum, d) => sum + (d.likes || 0), 0),
    avg_code_length: dweets.reduce((sum, d) => sum + d.code_length, 0) / dweets.length,
    remixes: dweets.filter(d => d.remix_of).length,
    technique_usage: {
      canvas_manipulation: dweets.filter(d => d.uses_canvas).length,
      uses_time: dweets.filter(d => d.uses_time).length,
      uses_trig: dweets.filter(d => d.uses_sin_cos).length,
      uses_loops: dweets.filter(d => d.uses_loop).length
    }
  };

  // Top authors by count
  const authorCounts = {};
  dweets.forEach(d => {
    authorCounts[d.author] = (authorCounts[d.author] || 0) + 1;
  });
  stats.top_authors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([author, count]) => ({ author, count }));

  // Most liked
  stats.most_liked = dweets
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10)
    .map(d => ({
      id: d.id,
      author: d.author,
      likes: d.likes,
      code_preview: d.code.slice(0, 50) + '...'
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
  let limit = 5000; // Default reasonable limit
  let author = null;
  let sort = 'new';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) {
      outputFile = args[++i];
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[++i], 10);
    } else if (args[i] === '--author' && args[i + 1]) {
      author = args[++i];
    } else if (args[i] === '--top') {
      sort = 'top';
    } else if (args[i] === '--all') {
      limit = Infinity;
    }
  }

  console.log("=== Dwitter Dataset Fetcher ===\n");
  console.log(`Output: ${outputFile}`);
  console.log(`Limit: ${limit === Infinity ? 'unlimited' : limit}`);
  if (author) console.log(`Author: ${author}`);
  console.log();

  // Fetch dweets
  const rawDweets = await fetchDweets({ limit, author, sort });

  if (rawDweets.length === 0) {
    console.log("No dweets fetched.");
    process.exit(1);
  }

  // Process dweets
  console.log("\nProcessing dweets...");
  const dweets = rawDweets.map(processDweet);

  // Sort by likes if requested
  if (sort === 'top') {
    dweets.sort((a, b) => b.likes - a.likes);
  }

  // Analyze dataset
  const stats = analyzeDataset(dweets);

  // Build output
  const output = {
    platform: "dwitter.net",
    fetched_at: new Date().toISOString(),
    stats,
    dweets
  };

  // Save to file
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\n✓ Saved ${dweets.length} dweets to ${outputFile}`);

  // Print summary
  console.log("\n=== Summary ===");
  console.log(`Total dweets: ${stats.total}`);
  console.log(`Unique authors: ${stats.unique_authors}`);
  console.log(`Total likes: ${stats.total_likes}`);
  console.log(`Average code length: ${stats.avg_code_length.toFixed(1)} chars`);
  console.log(`Remixes: ${stats.remixes}`);
  console.log("\nTechnique usage:");
  Object.entries(stats.technique_usage).forEach(([tech, count]) => {
    console.log(`  ${tech}: ${count} (${(count / stats.total * 100).toFixed(1)}%)`);
  });
  console.log("\nTop 5 most liked:");
  stats.most_liked.slice(0, 5).forEach((d, i) => {
    console.log(`  ${i + 1}. d/${d.id} by ${d.author} (${d.likes} likes)`);
  });
}

main().catch(e => {
  console.error("Fatal error:", e.message);
  process.exit(1);
});
