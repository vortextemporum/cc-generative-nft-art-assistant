# Platform Data Fetchers - Research & Status

> Tracking document for fetching data from generative art platforms beyond Art Blocks and fxhash.

## Priority Platforms

### Tier 1: High Priority (Curated Generative Art)

| Platform | Chain | Status | API Method | Contract/Endpoint |
|----------|-------|--------|------------|-------------------|
| **EditArt** | Tezos | ✅ Working | Objkt GraphQL | 575+ collections, IPFS code, 5 sliders |
| **Highlight.xyz** | Multi-chain | ✅ Working | Alchemy + Arweave | 9 collections, Arweave/on-chain code |
| **Verse.works** | Ethereum | 🟡 Limited | Indexer API | Mostly static editions, few generative |
| **Prohibition** | Arbitrum | 🟢 Ready | Art Blocks Engine Hasura | `0x47a91457a3a1f700097199fd63c039c4784384ab` |
| **Plottables** | Ethereum | 🟢 Ready | Art Blocks Engine Hasura | `0xa319c382a702682129fcbf55d514e61a16f97f9c` |

### Tier 2: Code Examples & Tutorials

| Platform | Type | Status | API Method | Endpoint |
|----------|------|--------|------------|----------|
| **Shadertoy** | GLSL Shaders | ✅ Dataset | Hugging Face/Kaggle | 44k+ via Vipitis/Shadertoys dataset |
| **Dwitter** | 140-char JS | ✅ Working | REST API | 5,000 dweets fetched |
| **VertexShaderArt** | GLSL Vertex | 🟡 Research | No public API | Meteor backend, static site migration |
| **OpenProcessing** | p5.js | 🟡 Scraper | Third-party | [openprocessing-scraper](https://github.com/szymonkaliski/openprocessing-scraper) |
| **Hydra** | Video Synth | 🟢 Ready | GitHub | [hydra-synth/hydra-examples](https://github.com/hydra-synth/hydra-examples) |

### Tier 3: Additional Platforms

| Platform | Chain | Status | Notes |
|----------|-------|--------|-------|
| **Objkt** | Tezos | 🟢 Ready | GraphQL: `data.objkt.com/v3/graphql` |
| **Tender.art** | Ethereum | 🔴 Unknown | Needs research |
| **Vivid** | Unknown | 🔴 Unknown | Needs research |
| **Versum** | Tezos | 🔴 Inactive | Platform less active |

---

## EditArt Details

**URL**: https://editart.xyz
**Chain**: Tezos
**Creator**: Pifragile
**API**: Objkt GraphQL (`data.objkt.com/v3/graphql`)
**Storage**: IPFS for code and metadata

### How It Works

EditArt allows collectors to become co-creators by adjusting 5 parameter sliders (m0-m4) when minting:
- Artists upload parameterized artwork code to IPFS
- Each artwork has a custom smart contract (KT1... address)
- When minting, slider values are stored on-chain
- Code receives parameters via URL query string: `?m0=0.5&m1=0.3&m2=0.8&m3=0.2&m4=0.6`

### Data Structure

```javascript
// Artifact URI format
"ipfs://Qm...?m0=0.500&m1=0.500&m2=0.500&m3=0.500&m4=0.500"

// Collection metadata via Objkt API
{
  "contract": "KT1...",           // Unique contract per collection
  "name": "Collection Name",
  "path": "editart-collection-name",
  "creator_address": "tz1...",
  "description": "...",
  "items": 100,                   // Minted tokens
  "editions": 100                 // Total supply
}
```

### Fetching Strategy

1. Query Objkt GraphQL for all collections with path starting with `editart-`
2. For each collection, fetch sample tokens to get IPFS hash
3. Extract generative code from IPFS (HTML with embedded p5.js)
4. Use `--update` flag for incremental fetching of new collections

### Script Structure

EditArt projects are typically HTML files with embedded p5.js:
```html
<!DOCTYPE html>
<html>
<head>
  <script>/* p5.js library */</script>
</head>
<body>
<script>
// Read slider parameters from URL
const params = new URLSearchParams(window.location.search);
const m0 = parseFloat(params.get('m0') || 0.5);
const m1 = parseFloat(params.get('m1') || 0.5);
// ... m2, m3, m4

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Use m0-m4 to control artwork generation
}
</script>
</body>
</html>
```

---

## Indexing APIs for Verse & Highlight

Since these platforms don't expose public APIs, we can use blockchain indexing services:

### Option 1: Alchemy NFT API
- **Docs**: https://docs.alchemy.com/reference/nft-api-quickstart
- **Endpoints**:
  - `getNftsForContract` - Get all NFTs in a collection
  - `getNftMetadata` - Get metadata for specific token
- **Pros**: Free tier available, fast, includes raw metadata
- **Cons**: May not include animation_url/scripts directly

### Option 2: SimpleHash API
- **Docs**: https://docs.simplehash.com/reference/overview
- **Endpoints**:
  - `/nfts/collection/{collection_id}` - All NFTs in collection
  - `/nfts/traits/collection/{collection_id}` - Traits data
- **Pros**: Great metadata handling, supports Art Blocks style collections
- **Cons**: Paid tiers for high volume

### Option 3: Reservoir API
- **Docs**: https://nft.reservoir.tools/reference/overview
- **Features**: Token metadata, attributes, collection data
- **Pros**: Good for marketplace data
- **Cons**: Focused on trading, may lack generative-specific fields

### Option 4: Direct Contract + IPFS
- Query contract events via Etherscan API
- Extract tokenURI from contract
- Fetch metadata from IPFS/Arweave
- **Pros**: Complete data, no rate limits
- **Cons**: More complex, slower

---

## Verse.works Details

**Contract**: `0xec43E92046C1527586dFAF02031622C30AF9A1d6`
**Token Standard**: ERC-1155
**Storage**: IPFS for artwork and metadata
**Holders**: ~209
**Total Supply**: 97M+ token IDs (sparse)
**Docs**: https://docs.verse.works/docs/projects/generative-verse/

### Metadata Structure
```json
{
  "name": "Artwork Name",
  "image": "ipfs://Qm.../preview.png",
  "animation_url": "ipfs://Qm.../index.html",
  "generator_url": "ipfs://Qm.../index.html",
  "attributes": [{ "trait_type": "...", "value": "..." }],
  "hash": "0x...",
  "description": "..."
}
```

**Note**: `generator_url` links to the project code on IPFS for high-res output generation.
Not all Verse NFTs are generative - some are static editions.

### Payload Structure (passed to generative code)
```javascript
// Generative scripts receive this via URL param:
const params = new URLSearchParams(window.location.search);
const payload = JSON.parse(atob(params.get("payload") || "") || "{}");
// payload = { hash, editionNumber, totalEditions, input: {...} }
```

### Fetching Strategy
1. Use Alchemy/SimpleHash to get all tokens for contract
2. Filter for tokens with `generator_url` or `animation_url` (generative only)
3. Fetch HTML/JS from IPFS gateway: `https://ipfs.io/ipfs/{cid}`
4. Parse HTML to extract inline JS or linked script files
5. Store script + metadata in normalized format

### API Test Results
- Alchemy demo API returned metadata but `animation_url` was null for tested tokens
- This may be because those specific tokens were static editions
- Need to query tokens from known generative collections (exhibitions)

---

## Highlight.xyz Details

**Storage**: Arweave (permanent)
**Chains**: Ethereum, Base, Optimism, Arbitrum, Zora, Polygon, others
**Contract Pattern**: Factory-deployed contracts per collection
**GitHub**: https://github.com/highlightxyz/generative-art
**Docs**: https://support.highlight.xyz/knowledge-base/for-developers/

### Contract Types
- `ERC721GenerativeOnchain` - On-chain generative
- `ERC721GeneralSequence` - Sequential minting
- `ERC721EditionsDFS` - Editions with DFS metadata
- Multiple other patterns

### Generative Framework (hl-gen.js)
```javascript
// Highlight provides hl.tx object with:
hl.tx.hash          // Transaction hash (seed)
hl.tx.tokenId       // Token ID
hl.tx.walletAddress // Minter's address
hl.tx.timestamp     // Mint timestamp
hl.tx.blockNumber   // Block number

// Set traits for metadata:
hl.token.setTraits({ "Color": "Blue", "Style": "Minimal" });
hl.token.setName("My Token #1");
```

### Fetching Strategy
1. Find Highlight collections via:
   - Query Observability contract for deployed collections
   - OR use Alchemy/SimpleHash to search by known Highlight factory patterns
2. For each collection, enumerate tokens
3. Get `animation_url` from token metadata (points to Arweave)
4. Fetch ZIP/HTML from Arweave: `https://arweave.net/{txId}`
5. Parse for `index.html` + `hl-gen.js` + artist code

### Arweave Gateway
```
https://arweave.net/{transactionId}
```

### Challenges
- No single registry of all Highlight collections
- Multi-chain deployment requires querying multiple networks
- Need to identify Highlight contracts vs other NFTs

---

## API Endpoints Reference

### Shadertoy (needs API key)
```bash
# List all shader IDs
GET https://www.shadertoy.com/api/v1/shaders?key=API_KEY

# Search shaders
GET https://www.shadertoy.com/api/v1/shaders/query/{search}?key=API_KEY

# Get shader by ID
GET https://www.shadertoy.com/api/v1/shaders/{shaderID}?key=API_KEY
```

### Dwitter (public)
```bash
# List dweets (paginated)
GET https://www.dwitter.net/api/dweets/?limit=100&offset=0

# By author
GET https://www.dwitter.net/api/dweets/?author=username

# Single dweet
GET https://www.dwitter.net/api/dweets/{id}
```

### Objkt (GraphQL)
```graphql
# Endpoint: https://data.objkt.com/v3/graphql
query {
  token(limit: 100) {
    pk
    name
    description
    artifact_uri
    display_uri
    metadata
    fa { contract }
    creators { holder { address } }
  }
}
```

### Art Blocks Engine (Prohibition/Plottables)
```graphql
# Endpoint: https://data.artblocks.io/v1/graphql (Ethereum)
# Endpoint: https://ab-prod-arbitrum.hasura.app/v1/graphql (Arbitrum)

query {
  projects_metadata(
    where: { contract_address: { _eq: "0x..." } }
  ) {
    name
    artist_name
    description
    script
    script_type_and_version
  }
}
```

---

## Implementation Status

### Completed Fetchers

| Fetcher | Script | Status | Test Results |
|---------|--------|--------|--------------|
| **EditArt** | `scripts/editart-fetcher.js` | ✅ Working | 575+ collections via Objkt API, IPFS scripts |
| **Highlight.xyz** | `scripts/highlight-fetcher.js` | ✅ Working | 9 collections configured, 4 with code extracted |
| **Dwitter** | `scripts/dwitter-fetcher.js` | ✅ Working | 5,000 dweets, 372 authors |
| **Shadertoy** | `scripts/shadertoy-dataset-downloader.js` | ✅ Ready | Multi-source: HuggingFace (44k), Kaggle (1k), API |
| **Shadertoy** | `scripts/shadertoy-fetcher.js` | ✅ Ready | Direct API (needs Shadertoy API key) |

### Fetched Data

**Highlight Collections** (in `data/highlight-dataset.json`):

| Collection | Artist | Chain | Tokens | Code Type | Files |
|------------|--------|-------|--------|-----------|-------|
| Crypto-Native | Melissa Wiederrecht | Base | 3,833 | Arweave | index.html, main.min.js, hl-gen.js |
| Heatsink | Leander Herzog | Ethereum | 269 | Arweave | index.html, three.js, hl-gen.js |
| Alternate | Kim Asendorf | Ethereum | 200 | On-chain | index.html (7.5KB WebGL) |
| Crush | Andreas Gysin | Ethereum | 256 | Arweave | index.html (ASCII art) |
| Semiograph | Paul Prudence | Base | TBD | TBD | - |
| Fractal Tapestries | Holger Lippmann | Base | TBD | TBD | - |
| RUNAWAY | James Merrill | Base | TBD | TBD | - |
| Finnish Coloring | Unknown | Base | TBD | TBD | - |
| ES: | mchx | Ethereum | TBD | TBD | - |

**Dwitter** (in `data/dwitter-dataset.json`):
- 5,000 dweets
- 372 unique authors
- 42,257 total likes
- Average code length: ~95 chars

**EditArt** (in `data/editart-dataset.json`):
- 575+ generative art collections
- Tezos blockchain (via Objkt API)
- Each collection uses 5 parameter sliders (m0-m4)
- Code stored on IPFS (mostly p5.js)
- Supports incremental updates

### Usage

```bash
# EditArt - no API key required (uses Objkt GraphQL)
node scripts/editart-fetcher.js                    # All collections, metadata only
node scripts/editart-fetcher.js --with-scripts     # Include IPFS script content
node scripts/editart-fetcher.js --update           # Incremental update (new since last run)
node scripts/editart-fetcher.js --limit 50         # Fetch only first 50 collections

# Highlight - requires Alchemy API key
ALCHEMY_API_KEY=xxx node scripts/highlight-fetcher.js

# Fetch single Highlight collection
ALCHEMY_API_KEY=xxx node scripts/highlight-fetcher.js --chain base --contract 0x...

# Dwitter - no key required
node scripts/dwitter-fetcher.js --limit 5000

# Shadertoy - via pre-built datasets (no API key needed)
node scripts/shadertoy-dataset-downloader.js --source huggingface  # Needs HF_TOKEN
node scripts/shadertoy-dataset-downloader.js --source kaggle       # Needs Kaggle CLI

# Shadertoy - direct API (needs API key)
SHADERTOY_API_KEY=xxx node scripts/shadertoy-fetcher.js --limit 500
```

### Shadertoy Dataset Sources

| Source | Size | Requirements | Notes |
|--------|------|--------------|-------|
| [Vipitis/Shadertoys](https://huggingface.co/datasets/Vipitis/Shadertoys) | 44k+ shaders | HF_TOKEN | Most comprehensive, includes metadata |
| [Kaggle Top 1000](https://www.kaggle.com/datasets/autumnawrange/shadertoy-top1000) | 1,000 shaders | Kaggle CLI | Easy to download, popular shaders only |
| Direct API | Variable | SHADERTOY_API_KEY | Request from Shadertoy profile |

### Still To Do
- [x] More Highlight collections discovered and added
- [x] Shadertoy dataset options documented
- [x] EditArt fetcher via Objkt GraphQL (Tezos)
- [ ] Fetch remaining 5 Highlight collections
- [ ] OpenProcessing scraper
- [ ] VertexShaderArt (exploring options)

---

## VertexShaderArt Details

**URL**: https://www.vertexshaderart.com/
**GitHub**: https://github.com/greggman/vertexshaderart
**Type**: GLSL vertex shader art (visual music)

### Backend
- Originally Meteor-based with MongoDB storage
- Currently transitioning to static site
- No documented public API

### Data Access Options
1. **GitHub repo** - May contain example shaders in the codebase
2. **Scraping** - Would require browser automation (renders via WebGL)
3. **Direct contact** - The project maintainer (greggman) may provide dataset

### Code Structure
VertexShaderArt uses GLSL vertex shaders that respond to audio input:
```glsl
// Vertex shader receives:
// - vertexId: unique vertex identifier
// - time: audio time
// - resolution: canvas dimensions
// - background/foreground: colors
// - sound (texture): audio frequency data
```

### Status
- 🟡 Research needed
- No public API or dataset found
- Consider reaching out to maintainer for data dump

---

## Notes

- Shadertoy requires Silver/Gold account for API key (free to request)
- Dwitter API has 100 results max per page
- Art Blocks Engine partners share the same Hasura infrastructure
- IPFS gateways: `gateway.pinata.cloud`, `ipfs.io`, `dweb.link`
- Arweave gateway: `arweave.net/{txId}`

## Resources

- [Alchemy NFT API](https://docs.alchemy.com/reference/nft-api-quickstart)
- [SimpleHash Docs](https://docs.simplehash.com/reference/overview)
- [Reservoir API](https://nft.reservoir.tools/reference/overview)
- [The Graph Explorer](https://thegraph.com/explorer)
- [Objkt API Docs](https://data.objkt.com/docs/)
- [Art Blocks API Docs](https://docs.artblocks.io/creator-docs/art-blocks-api/api-overview/)
