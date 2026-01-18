#!/usr/bin/env node

/**
 * Shadertoy Dataset Downloader
 *
 * Downloads Shadertoy shader datasets from multiple sources:
 * 1. Hugging Face (Vipitis/Shadertoys) - 44k+ shaders, requires HF token
 * 2. Kaggle (autumnawrange/shadertoy-top1000) - Top 1000, requires Kaggle CLI
 * 3. Local API fetch - requires Shadertoy API key
 *
 * Usage:
 *   node shadertoy-dataset-downloader.js --source huggingface
 *   node shadertoy-dataset-downloader.js --source kaggle
 *   node shadertoy-dataset-downloader.js --source api --limit 100
 *
 * Environment:
 *   HF_TOKEN - Hugging Face access token (for huggingface source)
 *   SHADERTOY_API_KEY - Shadertoy API key (for api source)
 */

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

const DEFAULT_OUTPUT = "data/shadertoy-dataset.json";

// ============================================================================
// HTTP HELPERS
// ============================================================================

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);

    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GenerativeArtAssistant/1.0',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, headers).then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data, headers: res.headers });
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
// HUGGING FACE SOURCE
// ============================================================================

async function downloadFromHuggingFace(token, outputFile) {
  console.log("=== Downloading from Hugging Face ===\n");
  console.log("Dataset: Vipitis/Shadertoys (44k+ shaders)\n");

  if (!token) {
    console.error("Error: HF_TOKEN environment variable required");
    console.error("\nTo get a token:");
    console.error("1. Create account at huggingface.co");
    console.error("2. Go to Settings > Access Tokens");
    console.error("3. Create a token with 'read' permission");
    console.error("\nUsage: HF_TOKEN=xxx node shadertoy-dataset-downloader.js --source huggingface");
    process.exit(1);
  }

  // Try to use Python datasets library
  console.log("Checking for Python datasets library...");

  try {
    const pythonScript = `
import os
os.environ['HF_TOKEN'] = '${token}'
from datasets import load_dataset
import json

print("Loading dataset from Hugging Face...")
dataset = load_dataset("Vipitis/Shadertoys", split="train")
print(f"Loaded {len(dataset)} shaders")

# Convert to list of dicts
shaders = []
for item in dataset:
    shaders.append(dict(item))

# Save
output = {
    "platform": "shadertoy.com",
    "source": "huggingface/Vipitis/Shadertoys",
    "total": len(shaders),
    "shaders": shaders
}

with open('${outputFile}', 'w') as f:
    json.dump(output, f, indent=2, default=str)

print(f"Saved {len(shaders)} shaders to ${outputFile}")
`;

    fs.writeFileSync('/tmp/hf_download.py', pythonScript);
    execSync('python3 /tmp/hf_download.py', { stdio: 'inherit' });
    fs.unlinkSync('/tmp/hf_download.py');

    return true;
  } catch (e) {
    console.error("\nPython datasets library not available or error occurred.");
    console.error("Install with: pip install datasets huggingface_hub");
    console.error(`Error: ${e.message}`);
    return false;
  }
}

// ============================================================================
// KAGGLE SOURCE
// ============================================================================

async function downloadFromKaggle(outputFile) {
  console.log("=== Downloading from Kaggle ===\n");
  console.log("Dataset: autumnawrange/shadertoy-top1000 (Top 1000 shaders)\n");

  // Check if Kaggle CLI is available
  try {
    execSync('which kaggle', { stdio: 'pipe' });
  } catch (e) {
    console.error("Kaggle CLI not installed.");
    console.error("\nTo install:");
    console.error("  pip install kaggle");
    console.error("\nThen configure:");
    console.error("  1. Create account at kaggle.com");
    console.error("  2. Go to Settings > API > Create New Token");
    console.error("  3. Place kaggle.json in ~/.kaggle/");
    process.exit(1);
  }

  try {
    console.log("Downloading dataset...");
    execSync('kaggle datasets download -d autumnawrange/shadertoy-top1000 -p /tmp/shadertoy-kaggle --unzip', { stdio: 'inherit' });

    // Find and read the CSV/JSON file
    const files = fs.readdirSync('/tmp/shadertoy-kaggle');
    console.log("Downloaded files:", files);

    // Process the data
    let shaders = [];
    for (const file of files) {
      const filepath = `/tmp/shadertoy-kaggle/${file}`;
      if (file.endsWith('.json')) {
        shaders = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      } else if (file.endsWith('.csv')) {
        // Simple CSV parsing
        const lines = fs.readFileSync(filepath, 'utf8').split('\n');
        const headers = lines[0].split(',');
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(',');
          const obj = {};
          headers.forEach((h, idx) => obj[h.trim()] = values[idx]);
          shaders.push(obj);
        }
      }
    }

    const output = {
      platform: "shadertoy.com",
      source: "kaggle/autumnawrange/shadertoy-top1000",
      total: shaders.length,
      shaders
    };

    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`\nSaved ${shaders.length} shaders to ${outputFile}`);

    // Cleanup
    execSync('rm -rf /tmp/shadertoy-kaggle');

    return true;
  } catch (e) {
    console.error(`Error: ${e.message}`);
    return false;
  }
}

// ============================================================================
// DIRECT API SOURCE (requires API key)
// ============================================================================

async function downloadFromAPI(apiKey, limit, outputFile) {
  console.log("=== Downloading from Shadertoy API ===\n");

  if (!apiKey) {
    console.error("Error: SHADERTOY_API_KEY environment variable required");
    console.error("\nTo get an API key:");
    console.error("1. Create a Shadertoy account");
    console.error("2. Request API access (free for most accounts)");
    console.error("3. Go to your profile settings");
    console.error("\nUsage: SHADERTOY_API_KEY=xxx node shadertoy-dataset-downloader.js --source api");
    process.exit(1);
  }

  console.log(`Fetching up to ${limit} shaders...\n`);

  // Get shader IDs
  const idsUrl = `https://www.shadertoy.com/api/v1/shaders?key=${apiKey}`;
  const idsResponse = await httpGet(idsUrl);

  if (idsResponse.status !== 200) {
    console.error(`API error: ${idsResponse.status}`);
    console.error(idsResponse.data);
    process.exit(1);
  }

  const idsData = JSON.parse(idsResponse.data);
  if (idsData.Error) {
    console.error(`API error: ${idsData.Error}`);
    process.exit(1);
  }

  let shaderIds = idsData.Results || [];
  console.log(`Found ${shaderIds.length} shader IDs`);

  // Limit
  if (limit < shaderIds.length) {
    shaderIds = shaderIds.slice(0, limit);
  }

  // Fetch each shader
  const shaders = [];
  for (let i = 0; i < shaderIds.length; i++) {
    const id = shaderIds[i];
    const url = `https://www.shadertoy.com/api/v1/shaders/${id}?key=${apiKey}`;

    try {
      const response = await httpGet(url);
      const data = JSON.parse(response.data);

      if (data.Shader) {
        shaders.push(processShader(data.Shader));
      }

      if ((i + 1) % 10 === 0) {
        process.stdout.write(`  Fetched ${i + 1}/${shaderIds.length}...\r`);
      }

      // Rate limiting
      await sleep(200);
    } catch (e) {
      console.error(`  Error fetching ${id}: ${e.message}`);
    }
  }

  console.log(`\nFetched ${shaders.length} shaders`);

  // Analyze and save
  const stats = analyzeShaders(shaders);
  const output = {
    platform: "shadertoy.com",
    source: "api",
    fetched_at: new Date().toISOString(),
    stats,
    shaders
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`Saved to ${outputFile}`);

  return true;
}

function processShader(shader) {
  const info = shader.info || {};
  const renderpass = shader.renderpass || [];

  const imagePass = renderpass.find(p => p.type === 'image') || renderpass[0];
  const code = imagePass?.code || '';

  return {
    id: info.id,
    name: info.name,
    description: info.description,
    author: info.username,
    date: info.date,
    views: info.viewed,
    likes: info.likes,
    tags: info.tags || [],
    link: `https://www.shadertoy.com/view/${info.id}`,
    code_length: code.length,
    pass_count: renderpass.length,
    main_code: code,
    all_passes: renderpass.map(p => ({
      name: p.name,
      type: p.type,
      code: p.code
    }))
  };
}

function analyzeShaders(shaders) {
  return {
    total: shaders.length,
    unique_authors: new Set(shaders.map(s => s.author)).size,
    total_views: shaders.reduce((sum, s) => sum + (s.views || 0), 0),
    total_likes: shaders.reduce((sum, s) => sum + (s.likes || 0), 0),
    avg_code_length: Math.round(shaders.reduce((sum, s) => sum + s.code_length, 0) / shaders.length)
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  let source = 'huggingface';
  let outputFile = DEFAULT_OUTPUT;
  let limit = 500;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) {
      source = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      outputFile = args[++i];
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[++i], 10);
    } else if (args[i] === '--help') {
      console.log(`
Shadertoy Dataset Downloader

Sources:
  huggingface  - Vipitis/Shadertoys (44k+ shaders, requires HF_TOKEN)
  kaggle       - Top 1000 shaders (requires Kaggle CLI)
  api          - Direct API (requires SHADERTOY_API_KEY)

Usage:
  node shadertoy-dataset-downloader.js --source huggingface
  node shadertoy-dataset-downloader.js --source kaggle
  node shadertoy-dataset-downloader.js --source api --limit 100

Environment Variables:
  HF_TOKEN           - Hugging Face access token
  SHADERTOY_API_KEY  - Shadertoy API key
`);
      process.exit(0);
    }
  }

  // Ensure output directory exists
  const dir = outputFile.substring(0, outputFile.lastIndexOf('/'));
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let success = false;

  switch (source) {
    case 'huggingface':
      success = await downloadFromHuggingFace(process.env.HF_TOKEN, outputFile);
      break;
    case 'kaggle':
      success = await downloadFromKaggle(outputFile);
      break;
    case 'api':
      success = await downloadFromAPI(process.env.SHADERTOY_API_KEY, limit, outputFile);
      break;
    default:
      console.error(`Unknown source: ${source}`);
      console.error("Valid sources: huggingface, kaggle, api");
      process.exit(1);
  }

  if (!success) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error("Fatal error:", e.message);
  process.exit(1);
});
