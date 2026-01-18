# fx(hash) Deep Dive: API, Architecture, and Code Analysis

## Overview

**fx(hash)** is an open generative art platform originally built on **Tezos**, now multichain supporting **Ethereum** (as of fxhash 2.0). Unlike Art Blocks which stores scripts on-chain, fxhash stores complete project files on **IPFS**.

## Key Differences from Art Blocks

| Aspect | Art Blocks | fx(hash) |
|--------|------------|----------|
| **Blockchain** | Ethereum | Tezos + Ethereum (multichain) |
| **Script Storage** | On-chain (contract) | IPFS (complete HTML/JS) |
| **Hash Format** | 0x + 64 hex chars | Base58 (starts with "oo", ~51 chars) |
| **PRNG** | Custom per project | SFC32 via fxrand() |
| **Curation** | Curated/Playground/Factory | Open platform (anyone can mint) |
| **Gas Costs** | Higher (Ethereum) | Lower (Tezos) |

---

## API Endpoints

### GraphQL API (Primary)
```
https://api.fxhash.xyz/graphql
```
- Free, public access
- Supports introspection
- Interactive playground available

### IPFS Gateways
```
https://gateway.fxhash.xyz/ipfs/{CID}
https://gateway.fxhash2.xyz/ipfs/{CID}  (safe/alternate)
```

### Media & File APIs
```
https://media.fxhash.xyz
https://file-api.fxhash.xyz
```

---

## GraphQL Queries

### Get Generative Tokens (Projects)

```graphql
query GetProjects($take: Int, $skip: Int, $sort: GenerativeSortInput) {
  generativeTokens(take: $take, skip: $skip, sort: $sort) {
    id
    name
    slug
    supply
    balance
    originalSupply
    price
    royalties
    createdAt
    thumbnailUri
    displayUri
    generativeUri
    metadata
    metadataUri
    tags
    author {
      id
      name
      avatarUri
    }
  }
}
```

### Get Single Token by ID

```graphql
query GetToken($id: Float!) {
  generativeToken(id: $id) {
    id
    name
    slug
    supply
    balance
    price
    generativeUri
    metadata
    author {
      id
      name
    }
    objkts {
      id
      iteration
      generationHash
      owner {
        id
        name
      }
    }
  }
}
```

### Get Artist's Projects

```graphql
query GetArtistProjects($userId: String!) {
  user(id: $userId) {
    id
    name
    generativeTokens {
      id
      name
      supply
      balance
      price
      thumbnailUri
    }
  }
}
```

### Get Minted Iterations (objkts)

```graphql
query GetObjkts($tokenId: Float!, $take: Int) {
  generativeToken(id: $tokenId) {
    objkts(take: $take) {
      id
      iteration
      generationHash
      owner {
        id
        name
      }
      createdAt
    }
  }
}
```

---

## Understanding fxhash Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                        fx(hash) Flow                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Artist uploads project (ZIP) → Stored on IPFS                   │
│                     ↓                                                │
│  2. Project published as Generative Token on Tezos                  │
│                     ↓                                                │
│  3. Collector mints → Transaction hash generated                    │
│                     ↓                                                │
│  4. Hash passed to generator as URL parameter: ?fxhash=oo...        │
│                     ↓                                                │
│  5. fxhash snippet seeds PRNG → Deterministic output                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Metadata Structure

**Generative Token Metadata:**
```json
{
  "name": "Project Name",
  "description": "Description",
  "tags": ["generative", "abstract"],
  "artifactUri": "ipfs://Qm.../index.html?fxhash=ooPreviewHash",
  "displayUri": "ipfs://Qm.../preview.png",
  "thumbnailUri": "ipfs://Qm.../thumb.png",
  "generativeUri": "ipfs://Qm.../",
  "authenticityHash": "...",
  "previewHash": "ooPreviewHash...",
  "capture": {
    "mode": "viewport",
    "resolution": { "x": 800, "y": 800 }
  }
}
```

**Iteration (objkt) Metadata:**
```json
{
  "name": "Project Name #123",
  "iterationHash": "ooUniqueHash...",
  "description": "...",
  "generatorUri": "ipfs://Qm.../",
  "artifactUri": "ipfs://Qm.../?fxhash=ooUniqueHash",
  "displayUri": "ipfs://Qm.../preview.png",
  "thumbnailUri": "ipfs://Qm.../thumb.png",
  "attributes": [
    { "name": "Feature1", "value": "ValueA" }
  ]
}
```

---

## The fxhash Code Snippet

Every fxhash project must include the fxhash snippet which provides:

### Core Variables

```javascript
// Injected by fxhash at mint time
let fxhash = "ooXnGtQiUMfyKL2AHq6c13E3tg7fxUKx1eTD4UoxFdVWBR1YuE8";
let fxhashTrunc = fxhash.slice(0, 12);  // Short version
```

### PRNG Function (SFC32)

```javascript
// fxrand() - Seeded PRNG returning [0, 1)
let fxrand = (() => {
  let alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  let b58dec = (str) => [...str].reduce((acc, c) => acc * 58n + BigInt(alphabet.indexOf(c)), 0n);
  let fxhashDec = b58dec(fxhash);
  
  let sfc32 = (a, b, c, d) => {
    return () => {
      a |= 0; b |= 0; c |= 0; d |= 0;
      let t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = c << 21 | c >>> 11;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
  };
  
  return sfc32(
    Number(fxhashDec & 0xFFFFFFFFn),
    Number((fxhashDec >> 32n) & 0xFFFFFFFFn),
    Number((fxhashDec >> 64n) & 0xFFFFFFFFn),
    Number((fxhashDec >> 96n) & 0xFFFFFFFFn)
  );
})();
```

### Modern $fx API

```javascript
$fx.hash        // The full hash string
$fx.rand()      // PRNG function [0, 1)
$fx.minter      // Minter's wallet address
$fx.context     // "standalone" | "capture" | "minting"
$fx.isPreview   // true during capture

// Feature declaration
$fx.features({
  "Palette": "Warm",
  "Density": 0.75,
  "Mode": "Flow"
});

// fx(params) - collector-modifiable parameters
$fx.params([
  { id: "color", name: "Color", type: "color", default: "#ff0000" },
  { id: "count", name: "Count", type: "number", default: 50, options: { min: 1, max: 100 } }
]);

// Capture trigger
$fx.preview();  // Call when ready for capture
```

---

## Running fxhash Projects Locally

### Method 1: Direct IPFS Loading

```javascript
// Get the generator URI from API
const project = await fetchProject(tokenId);
const generatorUrl = `https://gateway.fxhash.xyz/ipfs/${project.generativeUri.slice(7)}`;

// Load with hash parameter
const hash = generateRandomFxhash();
const liveUrl = `${generatorUrl}?fxhash=${hash}`;

// Display in iframe
iframe.src = liveUrl;
```

### Method 2: Local Emulation

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script>
    // Simulate fxhash environment
    let fxhash = "ooRandomHash123456789...";
    
    // SFC32 PRNG implementation
    let alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
    let b58dec = (str) => [...str].reduce((acc, c) => acc * 58n + BigInt(alphabet.indexOf(c)), 0n);
    let fxhashDec = b58dec(fxhash);
    
    let sfc32 = (a, b, c, d) => () => {
      a |= 0; b |= 0; c |= 0; d |= 0;
      let t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = c << 21 | c >>> 11;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
    
    let fxrand = sfc32(
      Number(fxhashDec & 0xFFFFFFFFn),
      Number((fxhashDec >> 32n) & 0xFFFFFFFFn),
      Number((fxhashDec >> 64n) & 0xFFFFFFFFn),
      Number((fxhashDec >> 96n) & 0xFFFFFFFFn)
    );
    
    // $fx object
    let $fx = {
      hash: fxhash,
      rand: fxrand,
      minter: "tz1simulated...",
      isPreview: false,
      preview: () => {},
      features: (f) => { $fx._features = f; },
      getFeature: (n) => $fx._features?.[n],
      getFeatures: () => $fx._features
    };
  </script>
  
  <!-- Load p5.js or other dependencies -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js"></script>
  
  <script>
    // Artist's code goes here
    function setup() {
      createCanvas(800, 800);
      background(255);
      
      // Use fxrand() for randomness
      for (let i = 0; i < 100; i++) {
        fill(fxrand() * 255, fxrand() * 255, fxrand() * 255);
        ellipse(fxrand() * width, fxrand() * height, 20, 20);
      }
      
      // Declare features
      $fx.features({
        "Circle Count": 100
      });
    }
  </script>
</head>
<body></body>
</html>
```

### Generate Random fxhash

```javascript
function generateFxhash() {
  const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let hash = 'oo';
  for (let i = 0; i < 49; i++) {
    hash += base58chars[Math.floor(Math.random() * base58chars.length)];
  }
  return hash;
}
```

---

## Node.js Fetcher

```javascript
const FXHASH_API = "https://api.fxhash.xyz/graphql";

async function queryFxhash(query, variables = {}) {
  const response = await fetch(FXHASH_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return (await response.json()).data;
}

// Get recent projects
async function getProjects(take = 50) {
  const query = `
    query($take: Int) {
      generativeTokens(take: $take, sort: { createdAt: DESC }) {
        id
        name
        supply
        price
        generativeUri
        author { name }
      }
    }
  `;
  return queryFxhash(query, { take });
}

// Get specific token
async function getToken(id) {
  const query = `
    query($id: Float!) {
      generativeToken(id: $id) {
        id
        name
        generativeUri
        metadata
        objkts(take: 10) {
          generationHash
          iteration
        }
      }
    }
  `;
  return queryFxhash(query, { id: parseFloat(id) });
}

// Convert IPFS URI to HTTP
function ipfsToHttp(uri) {
  if (uri?.startsWith('ipfs://')) {
    return `https://gateway.fxhash.xyz/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

module.exports = { queryFxhash, getProjects, getToken, ipfsToHttp };
```

---

## Key Tezos Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| Issuer V1 | `KT1XCoGnfupWk7Sp8536EfrxcP73LmT68Nyr` | Original issuer (deprecated) |
| Issuer V2 | `KT1BJC12dG17CVvPKJ1VYaNnaT5mzfnUTwXv` | Current issuer contract |
| Gentk V1 | Multiple | Minted iterations |
| Gentk V2 | Multiple | Newer iterations |

---

## Multichain (fxhash 2.0)

Since late 2023, fxhash supports both Tezos and Ethereum:

- **Same tools** work across both chains
- **fx(params)** available on both
- **On-chain minting** supported on both
- **Artists choose** which chain per project

---

## Resources

- **Website**: https://www.fxhash.xyz
- **API Playground**: https://api.fxhash.xyz/graphql
- **Documentation**: https://www.fxhash.xyz/doc
- **GitHub**: https://github.com/fxhash
- **Boilerplate**: https://github.com/fxhash/fxhash-boilerplate
- **Discord**: https://discord.gg/fxhash

---

## Summary

1. **API**: Free GraphQL at `https://api.fxhash.xyz/graphql`
2. **Storage**: Complete generators on IPFS (not on-chain scripts)
3. **Hash**: Base58 starting with "oo" (~51 chars)
4. **PRNG**: SFC32 algorithm via `fxrand()` or `$fx.rand()`
5. **Preview**: Load generator URL with `?fxhash=` parameter
6. **Multichain**: Works on Tezos and Ethereum
