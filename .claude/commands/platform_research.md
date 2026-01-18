# /platform_research - Research NFT platform architecture and components

Research and analyze NFT platform components, smart contracts, infrastructure, and best practices.

## Arguments

- `$ARGUMENTS` - Topic to research: contracts, storage, minting, marketplace, rendering, etc.

## Research Topics

### 1. Smart Contracts (`/platform_research contracts`)

Research NFT smart contract patterns:

**ERC Standards:**
- ERC-721: Basic NFTs
- ERC-721A: Gas-optimized batch minting
- ERC-1155: Multi-token (editions)
- ERC-2981: Royalty standard

**Generative Art Specific:**
- On-chain script storage
- Hash/seed generation mechanisms
- Randomness sources (block hash, Chainlink VRF)
- Provenance hash patterns
- Reveal mechanisms

**Contract Patterns to Analyze:**
- Art Blocks Engine contracts
- Manifold Creator contracts
- Zora drops contracts
- Foundation contracts
- Async Art layered NFT contracts

### 2. Storage (`/platform_research storage`)

Research decentralized storage options:

**IPFS:**
- Pinning services (Pinata, Infura, nft.storage)
- Content addressing
- Gateway strategies
- Persistence guarantees

**Arweave:**
- Permanent storage model
- Bundlr integration
- Cost considerations

**On-chain:**
- Base64 encoding
- SVG storage
- Contract data storage limits
- SSTORE2 pattern

**Hybrid Approaches:**
- Metadata on IPFS, script on-chain
- Lazy rendering with content hash verification

### 3. Minting Infrastructure (`/platform_research minting`)

Research minting mechanisms:

**Minting Patterns:**
- Open editions
- Limited editions with allowlists
- Dutch auctions
- Bonding curves
- Lazy minting

**Frontend Integration:**
- Wallet connections (wagmi, web3modal, rainbowkit)
- Transaction handling
- Gas estimation
- Error handling UX

**Backend Services:**
- Metadata servers
- Render queues
- Webhook handlers

### 4. Marketplace (`/platform_research marketplace`)

Research marketplace components:

**Protocols:**
- Seaport (OpenSea)
- LooksRare
- Blur
- Reservoir (aggregation)

**Features:**
- Listings/offers
- Auctions
- Collection offers
- Trait-based offers

**Integration:**
- API access
- Order book management
- Royalty enforcement

### 5. Rendering (`/platform_research rendering`)

Research generative art rendering:

**Client-side:**
- iframe sandboxing
- Hash injection
- Preview capture (html2canvas, puppeteer)
- Resolution scaling

**Server-side:**
- Puppeteer/Playwright rendering
- GPU-accelerated rendering (headless Chrome with GPU)
- Render queues
- Caching strategies

**Thumbnail Generation:**
- Capture timing
- Format optimization
- CDN distribution

### 6. Platform Architecture (`/platform_research architecture`)

Full platform component breakdown:

```
┌─────────────────────────────────────────────────────────────┐
│                      YOUR PLATFORM                          │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND                                                   │
│  ├── Gallery/Explorer                                       │
│  ├── Mint Page                                              │
│  ├── Artist Dashboard                                       │
│  ├── Collector Profile                                      │
│  └── Live Render Viewer                                     │
├─────────────────────────────────────────────────────────────┤
│  BACKEND SERVICES                                           │
│  ├── Metadata API                                           │
│  ├── Render Service                                         │
│  ├── Indexer (blockchain events)                            │
│  ├── Search/Discovery                                       │
│  └── Analytics                                              │
├─────────────────────────────────────────────────────────────┤
│  SMART CONTRACTS                                            │
│  ├── NFT Contract (ERC721/1155)                             │
│  ├── Minter Contract                                        │
│  ├── Royalty Splitter                                       │
│  └── Marketplace Integration                                │
├─────────────────────────────────────────────────────────────┤
│  STORAGE                                                    │
│  ├── Scripts (on-chain or IPFS)                             │
│  ├── Metadata (IPFS/Arweave)                                │
│  ├── Thumbnails (CDN)                                       │
│  └── High-res renders (on-demand)                           │
└─────────────────────────────────────────────────────────────┘
```

## Output Format

Research results include:
1. **Overview** - What the component does
2. **Options** - Available solutions/approaches
3. **Trade-offs** - Pros/cons of each
4. **Code Examples** - Implementation snippets
5. **References** - Links to docs, repos, examples
6. **Recommendations** - Based on your platform goals

## Examples

```bash
# Research smart contract patterns
/platform_research contracts

# Research storage solutions
/platform_research storage ipfs vs arweave

# Research minting UX
/platform_research minting allowlist

# Full architecture overview
/platform_research architecture

# Specific topic
/platform_research rendering puppeteer serverless
```

## Follow-up Actions

After research, offer:
1. **Generate code**: Create implementation for chosen approach
2. **Compare**: Deep comparison between options
3. **Prototype**: Build minimal working example
4. **Document**: Create technical specification
