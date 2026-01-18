# Art Blocks Deep Dive: Thumbnails, Contract Structure, and Code Analysis

## 1. How Art Blocks Creates Thumbnails

Art Blocks uses a **server-side rendering system** that executes the generative code and captures the output:

### The Rendering Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Art Blocks Media Server                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Generator API runs the script with tokenData injected            │
│                     ↓                                                │
│  2. Headless browser renders the HTML/Canvas                        │
│                     ↓                                                │
│  3. Screenshot captured at initial frame (deterministic)            │
│                     ↓                                                │
│  4. Images saved in multiple sizes                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Media API Endpoints

| Type | URL Pattern | Size |
|------|-------------|------|
| **Standard** | `https://media.artblocks.io/{tokenID}.png` | ~2000px |
| **HD** | `https://media.artblocks.io/hd/{tokenID}.png` | Higher resolution |
| **Thumbnail** | `https://media.artblocks.io/thumb/{tokenID}.png` | Small preview |

### Key Technical Details

- **Deterministic Rendering**: The first frame MUST always be identical given the same hash. This is why animated pieces still have consistent thumbnails.
- **Headless Browser Capture**: Art Blocks runs a headless Chrome/Puppeteer to execute the JavaScript and capture the canvas.
- **Backfill Process**: HD and thumbnail renders are progressively backfilled for older projects.

---

## 2. Contract Structure: Single vs Multiple Collections

### YES - All Projects Live in SHARED Contracts

Art Blocks uses a **shared contract architecture** where multiple projects exist within the same smart contract:

```
┌────────────────────────────────────────────────────────────────────┐
│           GenArt721CoreV1 (0xa7d8d9ef...)                          │
│                                                                    │
│   Project 4: Dynamic Slices                                        │
│   Project 5: Variant Plan                                          │
│   Project 6: View Card                                             │
│   Project 7: Elevated Deconstructions                              │
│   ...                                                              │
│   Project 78: Fidenza (Tyler Hobbs)                                │
│   Project 79: Ringers (Dmitri Cherniak)                            │
│   ...                                                              │
│   Project 400+: (many more)                                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Token ID Formula

```
tokenId = (projectId × 1,000,000) + invocation

Example: Fidenza #553 = (78 × 1,000,000) + 553 = 78000553
```

### Main Flagship Contracts

| Contract | Address | Projects |
|----------|---------|----------|
| **V0** | `0x059edd72cd353df5106d2b9cc5ab83a52287ac3a` | Projects 0-3 (Chromie Squiggle, Genesis, etc.) |
| **V1** | `0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270` | Projects 4+ (Fidenza, Ringers, etc.) |
| **V3 Studio** | `0x99a9b7c1116f9ceeb1652de04d5969cce509b069` | Newer projects |

### Why Shared Contracts?

1. **Gas Efficiency**: Deploying one contract for many projects is cheaper
2. **Unified Infrastructure**: Same rendering, indexing, and API for all
3. **On-chain Storage**: Scripts stored per-project within the contract

---

## 3. OpenSea Display: One Collection or Separate?

### Two Display Options Available

OpenSea provides **two organizational methods** for Art Blocks:

#### Option 1: Single Collection (Default)
- All projects grouped in one large collection
- Individual projects shown as **filter traits** on sidebar
- URL: `opensea.io/collection/art-blocks`

#### Option 2: Separate Collections per Project
- Each project displayed as its **own verified collection**
- Project traits become collection properties
- More intuitive for collectors

### Current Art Blocks Flagship Structure

Art Blocks flagship now displays projects as separate verified collections:
- `opensea.io/collection/art-blocks` (umbrella)
- Individual projects like Fidenza, Ringers, etc. have their own verified pages
- Traits/features are accurately shown per-project (not mixed)

### Engine Partners

For Art Blocks Engine partners, they can choose:
- **Default**: All projects in one collection (projects as traits)
- **Request**: Each project as separate collection (contact account manager)

---

## 4. Fetching and Emulating Generative Art Code

### Method 1: Using the `node-artblocks` NPM Package

```javascript
import ArtBlocks from 'artblocks';

const artblocks = new ArtBlocks("thegraph", "mainnet");

// Get project details including script
const project = await artblocks.project(78); // Fidenza
console.log(project.script);           // The actual JavaScript code
console.log(project.dependency);       // e.g., "p5js"
console.log(project.dependency_version);
console.log(project.instructions);     // Interactive instructions

// Get token data
const token = await artblocks.token(78000553);
console.log(token.token_hash);         // The unique hash for this output

// Generate complete HTML to render locally
const html = await artblocks.token_generator(78000553);
// Returns complete HTML with script + dependencies + tokenData
```

### Method 2: Direct GraphQL Query for Script

```graphql
{
  project(id: "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270-78") {
    name
    artistName
    script
    scriptTypeAndVersion
    aspectRatio
    description
    license
    website
  }
}
```

### Method 3: On-Chain Generator Contract

Art Blocks has deployed a **fully on-chain generator** that assembles HTML from blockchain data:

```javascript
// On-Chain Generator Contract: 0x953D288708bB771F969FCfD9BA0819eF506Ac718

// Using ethers.js
const generatorABI = [
  "function getTokenHtml(address coreContract, uint256 tokenId) view returns (string)"
];

const generator = new ethers.Contract(
  "0x953D288708bB771F969FCfD9BA0819eF506Ac718",
  generatorABI,
  provider
);

// Get complete HTML for any token
const html = await generator.getTokenHtml(
  "0x059edd72cd353df5106d2b9cc5ab83a52287ac3a", // Core contract
  0  // Token ID (Chromie Squiggle #0)
);
```

**Demo Site**: https://www.artblocks.io/onchain/generator

### Method 4: Manual Local Emulation

#### Step 1: Get the Script from Subgraph/Contract

```javascript
// Query the project script
const query = `{
  project(id: "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270-78") {
    script
    scriptTypeAndVersion
  }
}`;
```

#### Step 2: Get Token Hash

```javascript
// From subgraph
const tokenQuery = `{
  token(id: "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270-78000553") {
    hash
    tokenId
  }
}`;

// Or directly from contract
const hash = await coreContract.tokenIdToHash(78000553);
```

#### Step 3: Create Local HTML

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Load dependency based on scriptTypeAndVersion -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js"></script>
  
  <!-- Inject tokenData -->
  <script>
    let tokenData = {
      hash: "0x8b2...(the token's unique hash)",
      tokenId: "78000553"
    };
  </script>
  
  <!-- Artist's script -->
  <script>
    // Paste the project script here
    // The script uses tokenData.hash for randomness
  </script>
</head>
<body></body>
</html>
```

#### Step 4: For Local Testing with Random Hashes

```javascript
// Generate random test hash
function random_hash() {
  let chars = "0123456789abcdef";
  let result = "0x";
  for (let i = 64; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Test tokenData
let tokenData = {
  hash: random_hash(),
  tokenId: "78000001"
};
```

---

## 5. Analyzing Generative Art Code

### Understanding the Code Structure

Most Art Blocks scripts follow this pattern:

```javascript
// 1. Extract randomness from hash
let seed = parseInt(tokenData.hash.slice(0, 16), 16);

// 2. Create PRNG (Pseudo-Random Number Generator)
class Random {
  constructor(seed) {
    this.seed = seed;
  }
  random() {
    // Deterministic random based on seed
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}
const rng = new Random(seed);

// 3. Extract features from hash bytes
let hashPairs = [];
for (let j = 0; j < 32; j++) {
  hashPairs.push(tokenData.hash.slice(2 + (j * 2), 4 + (j * 2)));
}

// 4. Map hash pairs to features
let palette = parseInt(hashPairs[0], 16) % 10;  // Color palette 0-9
let density = parseInt(hashPairs[1], 16) / 255; // Density 0-1
let style = parseInt(hashPairs[2], 16) > 128 ? "bold" : "soft";

// 5. Generate artwork using p5.js/three.js
function setup() {
  createCanvas(windowWidth, windowHeight);
  // Use rng.random() for all randomness
}

function draw() {
  // Render based on extracted features
}
```

### Feature Extraction Analysis

```javascript
// Tool to analyze what features a hash produces
function analyzeHash(hash) {
  const pairs = [];
  for (let i = 0; i < 32; i++) {
    pairs.push(parseInt(hash.slice(2 + i*2, 4 + i*2), 16));
  }
  
  return {
    raw: pairs,
    normalized: pairs.map(p => p / 255),  // 0-1 values
    binary: pairs.map(p => p > 127),       // Boolean choices
    modular: (mod) => pairs.map(p => p % mod)  // Categorical
  };
}

// Example: Analyze Fidenza #553
const features = analyzeHash("0x8b2a...");
console.log("Color palette:", features.modular(10)[0]);
console.log("Density factor:", features.normalized[1]);
```

### Interactive/Animation Detection

Check project metadata for:

```javascript
// From project query
const project = await getProject(78);

console.log(project.interactive);        // true/false
console.log(project.animation_length_sec); // null for static, number for animated
console.log(project.instructions);       // "click to animate | space changes color"
```

---

## 6. Complete Analysis Script

```javascript
/**
 * Complete Art Blocks Project Analyzer
 * Fetches script, description, features, and allows local emulation
 */

const HASURA_URL = "https://data.artblocks.io/v1/graphql";

async function analyzeProject(contractAddress, projectId) {
  const fullId = `${contractAddress.toLowerCase()}-${projectId}`;
  
  // 1. Fetch project metadata
  const projectQuery = `
    query {
      projects_metadata(where: { id: { _eq: "${fullId}" }}) {
        id
        project_id
        name
        artist_name
        description
        script
        script_type_and_version
        aspect_ratio
        license
        website
        invocations
        max_invocations
        render_delay
        primary_render_type
      }
    }
  `;
  
  const response = await fetch(HASURA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: projectQuery })
  });
  
  const data = await response.json();
  const project = data.data.projects_metadata[0];
  
  // 2. Analyze the script
  const analysis = {
    // Basic info
    name: project.name,
    artist: project.artist_name,
    description: project.description,
    
    // Technical details
    dependency: project.script_type_and_version,
    aspectRatio: project.aspect_ratio,
    hasAnimation: project.render_delay > 0,
    
    // Script analysis
    scriptLength: project.script?.length || 0,
    usesP5: project.script?.includes('createCanvas') || project.script?.includes('setup()'),
    usesThreeJS: project.script?.includes('THREE.'),
    usesWebGL: project.script?.includes('WEBGL') || project.script?.includes('webgl'),
    
    // Feature detection in script
    likelyFeatures: detectFeatures(project.script),
    
    // The actual script
    script: project.script,
    
    // Generate local HTML
    localHtml: generateLocalHtml(project)
  };
  
  return analysis;
}

function detectFeatures(script) {
  if (!script) return [];
  
  const features = [];
  
  // Common feature patterns
  if (script.includes('palette') || script.includes('color')) {
    features.push('Color Palette Selection');
  }
  if (script.includes('density') || script.includes('count')) {
    features.push('Element Density');
  }
  if (script.match(/style|mode|type/i)) {
    features.push('Style Variations');
  }
  if (script.includes('scale') || script.includes('size')) {
    features.push('Size/Scale Variations');
  }
  if (script.includes('rotation') || script.includes('angle')) {
    features.push('Rotation Parameters');
  }
  
  return features;
}

function generateLocalHtml(project) {
  const dependency = getDependencyUrl(project.script_type_and_version);
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; overflow: hidden; }
    canvas { display: block; }
  </style>
  ${dependency ? `<script src="${dependency}"></script>` : ''}
  <script>
    // Generate random hash for testing
    function randomHash() {
      let chars = "0123456789abcdef";
      let result = "0x";
      for (let i = 64; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    }
    
    let tokenData = {
      hash: randomHash(),
      tokenId: "${project.project_id}000001"
    };
    
    console.log("Token Hash:", tokenData.hash);
  </script>
  <script>
${project.script}
  </script>
</head>
<body></body>
</html>`;
}

function getDependencyUrl(scriptType) {
  const deps = {
    'p5@1.0.0': 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js',
    'p5js@1.0.0': 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js',
    'three@0.124.0': 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.min.js',
    'threejs@0.124.0': 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.min.js',
  };
  return deps[scriptType] || null;
}

// Export for use
if (typeof module !== 'undefined') {
  module.exports = { analyzeProject, detectFeatures, generateLocalHtml };
}
```

---

## 7. Key Contract Addresses Reference

| Contract | Address | Purpose |
|----------|---------|---------|
| V0 Core | `0x059edd72cd353df5106d2b9cc5ab83a52287ac3a` | Projects 0-3 |
| V1 Core | `0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270` | Main flagship |
| V3 Core | `0x99a9b7c1116f9ceeb1652de04d5969cce509b069` | Studio projects |
| On-Chain Generator | `0x953D288708bB771F969FCfD9BA0819eF506Ac718` | Renders HTML from chain |
| Dependency Registry | `0x37861f95882ACDba2cCD84F5bFc4598e2ECDDdAF` | Stores p5.js, three.js |
| Shared Randomizer | `0x13178A7a8A1A9460dBE39f7eCcEbD91B31752b91` | Hash generation |
| MinterFilterV2 | `0xa2ccfE293bc2CDD78D8166a82D1e18cD2148122b` | Minting router |

---

## Summary

1. **Thumbnails**: Server-side headless browser captures the deterministic first frame
2. **Contract Structure**: Multiple projects share single contracts; tokens identified by `projectId × 1M + invocation`
3. **OpenSea Display**: Can show as one umbrella collection with project filters, or separate verified collections per project
4. **Code Analysis**: Fetch script via Subgraph/Hasura, create local HTML with tokenData injection, analyze feature extraction patterns
