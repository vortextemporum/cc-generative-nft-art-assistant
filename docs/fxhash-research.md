# fx(hash) Deep Dive: API, Architecture, and Code Analysis

## Overview

**fx(hash)** is an open generative art platform supporting **Ethereum**, **Tezos**, and **Base** blockchains. Unlike Art Blocks which stores scripts on-chain, fxhash stores complete project files on **IPFS** or **ONCHFS** (on-chain file system).

### Platform Evolution
- **fxhash 1.0**: Tezos-only, basic PRNG snippet
- **fxhash 2.0** (late 2023): Added Ethereum support, fx(params), mint tickets
- **Current**: Multichain (Tezos + Ethereum + Base), `@fxhash/project-sdk`, ONCHFS, open-form genart, Art Coins

## Key Differences from Art Blocks

| Aspect | Art Blocks | fx(hash) |
|--------|------------|----------|
| **Blockchain** | Ethereum | Tezos + Ethereum + Base |
| **Script Storage** | On-chain (contract) | IPFS or ONCHFS |
| **Hash Format** | 0x + 64 hex chars | Base58 (starts with "oo", ~51 chars) |
| **PRNG** | Custom per project | SFC32 via `$fx.rand()` (provided by SDK) |
| **Features** | `tokenData.features = {}` | `$fx.features({})` |
| **Preview** | Automatic | `$fx.preview()` call required |
| **Params** | N/A | `$fx.params([])` for collector customization |
| **Curation** | Curated/Playground/Factory | Open platform |
| **Platform Fee** | 10% | 2.5% (Tezos), 10% (Ethereum/Base) |
| **SDK** | N/A | `@fxhash/project-sdk` npm package |
| **CLI** | N/A | `@fxhash/cli` (`npx fxhash create/dev/build`) |

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
https://gateway.fxhash2.xyz/ipfs/{CID}
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

---

## The $fx API (Complete Reference)

### Core Properties & Methods

| API | Type | Description |
|-----|------|-------------|
| `$fx.hash` | string | 51-char Base58 hash (starts with "oo") |
| `$fx.rand()` | () => number | SFC32 PRNG seeded from hash, returns [0, 1) |
| `$fx.rand.reset()` | () => void | Reset PRNG to initial state |
| `$fx.minter` | string | Collector's wallet address |
| `$fx.randminter()` | () => number | PRNG seeded from minter address |
| `$fx.randminter.reset()` | () => void | Reset minter PRNG |
| `$fx.context` | string | `"standalone"`, `"capture"`, `"fast-capture"`, `"minting"` |
| `$fx.iteration` | number | Iteration number of collected token |
| `$fx.isPreview` | boolean | True during capture execution |
| `$fx.preview()` | () => void | Trigger preview/thumbnail capture |
| `$fx.features(obj)` | (obj) => void | Register features (call once) |
| `$fx.getFeature(name)` | (string) => any | Get single feature value |
| `$fx.getFeatures()` | () => object | Get all features |
| `$fx.params(defs)` | (array) => void | Define collector parameters |
| `$fx.getParam(id)` | (string) => any | Get parameter value |
| `$fx.getParams()` | () => object | Get all parameter values |
| `$fx.getRawParam(id)` | (string) => string | Get raw parameter bytes |
| `$fx.getRawParams()` | () => object | Get all raw values |
| `$fx.getDefinitions()` | () => array | Get parameter definitions |
| `$fx.on(event, handler)` | (string, fn) => fn | Register event listener (returns unsubscribe) |
| `$fx.emit(event, data)` | (string, any) => void | Emit event |
| `$fx.stringifyParams(defs)` | (defs) => string | JSON.stringify with bigint support |

### Open-Form API

| API | Type | Description |
|-----|------|-------------|
| `$fx.lineage` | string[] | Parent hashes + current hash |
| `$fx.depth` | number | Number of parents |
| `$fx.randAt(depth)` | (number) => number | PRNG at specific lineage depth |
| `$fx.createFxRandom(hash)` | (string) => fn | Create custom PRNG from hash |

### fx(params) Parameter Types

| Type | JS Type | Options | Controller |
|------|---------|---------|------------|
| `number` | float64 | `min`, `max`, `step` | Slider + text |
| `bigint` | BigInt | `min`, `max` | Slider + text |
| `boolean` | boolean | none | Checkbox |
| `color` | object | none | Color picker |
| `string` | string | `minLength`, `maxLength` (max 64) | Text input |
| `select` | string | `options: string[]` (max 256) | Dropdown |
| `bytes` | Uint8Array | `length` (required) | Code-driven only |

### Parameter Update Modes

| Mode | Source | Behavior |
|------|--------|----------|
| `page-reload` | fxhash UI | Full page refresh |
| `sync` | fxhash UI | Sends event, no refresh |
| `code-driven` | Code only | Via `$fx.emit()` |

---

## SFC32 PRNG Implementation

```javascript
// How fxhash seeds SFC32 from Base58 hash
const alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const b58dec = (str) => [...str].reduce((acc, c) =>
    acc * 58n + BigInt(alphabet.indexOf(c)), 0n);
const fxhashDec = b58dec(fxhash);

const sfc32 = (a, b, c, d) => {
  return () => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
};

const fxrand = sfc32(
  Number(fxhashDec & 0xFFFFFFFFn),
  Number((fxhashDec >> 32n) & 0xFFFFFFFFn),
  Number((fxhashDec >> 64n) & 0xFFFFFFFFn),
  Number((fxhashDec >> 96n) & 0xFFFFFFFFn)
);
```

---

## Project Setup

### CLI Workflow
```bash
npm i -g fxhash          # Install CLI globally
npx fxhash create        # Create new project (prompts for template)
npx fxhash dev           # Start fxlens dev environment
npx fxhash build         # Build upload.zip for publishing
npx fxhash eject         # Convert to webpack project (irreversible)
```

### Project Structure
```
project/
├── index.html          # Entry point (REQUIRED)
├── index.js            # Artwork script
├── fxhash.min.js       # @fxhash/project-sdk (DO NOT MODIFY)
├── style.css           # Optional styling
└── libraries/          # Local libraries (p5.js, Three.js, etc.)
```

### Critical Rules
- ZIP file must be under **15 MB**
- All resource paths must be **relative** (`./path/to/file`)
- **No CDN links** or external network requests
- Must be **responsive** to viewport resize
- Must be **deterministic**: same hash = same output always
- **Do not modify** `fxhash.min.js`

---

## Capture & Preview

### Capture Modes
- **CANVAS**: Capture specific `<canvas>` element (via CSS selector)
- **VIEWPORT**: Capture entire browser window

### Trigger Methods
- **FX_PREVIEW**: Wait for `$fx.preview()` call (programmatic)
- **DELAY**: Auto-capture after specified duration (max 300 seconds)

### Execution Contexts
```javascript
// $fx.context values:
"standalone"   // Normal browser viewing
"capture"      // Backend generating preview image/GIF
"fast-capture" // Quick preliminary preview (max 1 sec, no GPU/GIF)
"minting"      // Running inside fxparams minting interface
```

### Advanced
- **GPU acceleration**: For GPU-intensive projects (slow startup)
- **GIF captures**: Multi-frame recording at specified intervals
- **Fast-capture**: Quick placeholder before full capture

---

## Metadata Structure

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

---

## Marketplace & Economics

### Primary Market
- **Fixed price**: Constant throughout sale
- **Dutch auction**: Decreasing price to minimum
- **Dutch auction with rebates**: Early buyers refunded difference

### Platform Fees
- **Tezos**: 2.5% primary split
- **Ethereum/Base**: 10% primary split
- **Royalties**: 0-25% on secondary (artist-determined)

### Mint Tickets (fx(params) projects)
- Collectors receive transferable tickets instead of immediate artwork
- Grace period for exploration before Harberger tax applies
- Yearly tax ~51% of ticket price
- Unpaid taxes lead to foreclosure auction

### Payment Methods
- Wallet minting (primary method)
- Credit card via Wert (5% processing fee + gas)

---

## ONCHFS (On-Chain File System)

ONCHFS is a permissionless content-addressable file system fully stored on-chain:
- Alternative to IPFS for true on-chain permanence
- Files chunked and stored in smart contract storage
- Higher cost but fully decentralized

---

## Key Tezos Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| Issuer V2 | `KT1BJC12dG17CVvPKJ1VYaNnaT5mzfnUTwXv` | Current issuer |

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

function ipfsToHttp(uri) {
  if (uri?.startsWith('ipfs://')) {
    return `https://gateway.fxhash.xyz/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

function generateFxhash() {
  const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let hash = 'oo';
  for (let i = 0; i < 49; i++) {
    hash += base58chars[Math.floor(Math.random() * base58chars.length)];
  }
  return hash;
}

module.exports = { queryFxhash, ipfsToHttp, generateFxhash };
```

---

## Resources

- **Website**: https://www.fxhash.xyz
- **Documentation**: https://docs.fxhash.xyz
- **API Playground**: https://api.fxhash.xyz/graphql
- **GitHub**: https://github.com/fxhash
- **Boilerplate**: https://github.com/fxhash/fxhash-boilerplate
- **SDK (npm)**: `@fxhash/project-sdk`
- **CLI (npm)**: `@fxhash/cli`
- **Discord**: https://discord.gg/fxhash
