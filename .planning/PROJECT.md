# Generative Art Platform

## What This Is

A comprehensive toolkit for generative art creation and NFT platform development. Combines AI knowledge from 28,000+ Art Blocks/fxhash projects with tools for creating artwork and building custom NFT platforms.

## Core Value

Enable rapid creation and deployment of high-quality generative art on a custom NFT platform — from concept to minted collection with minimal friction.

## Requirements

### Validated

<!-- Shipped and confirmed valuable -->

- ✓ Art Blocks dataset fetcher and processor — Phase 0
- ✓ fxhash dataset fetcher and processor — Phase 0
- ✓ Combined knowledge base (28,338 projects) — Phase 0
- ✓ Slash commands for artwork creation (/new_sketch, /analyze_artwork, /art_inspiration) — Phase 0
- ✓ Base NFT smart contract (GenerativeNFT.sol) — Phase 0

### Active

<!-- Current scope. Building toward these. -->

**Platform Infrastructure**
- [ ] REQ-01: Embedding-based semantic search operational
- [ ] REQ-02: MCP server integrated with Claude Desktop
- [ ] REQ-03: Visual renderer producing screenshots/analysis
- [ ] REQ-04: Minter contract with allowlist/auction support
- [ ] REQ-05: Metadata API serving token data
- [ ] REQ-06: Server-side rendering service

**Frontend**
- [ ] REQ-07: Gallery/explorer showing collections
- [ ] REQ-08: Mint page with wallet connection
- [ ] REQ-09: Live artwork viewer with hash injection
- [ ] REQ-10: Artist dashboard for project management

**Deployment**
- [ ] REQ-11: Contract deployment scripts (testnet + mainnet)
- [ ] REQ-12: IPFS/Arweave integration for storage
- [ ] REQ-13: Production infrastructure (hosting, CDN)

### Out of Scope

<!-- Explicit boundaries -->

- Multi-chain support (v1 is single chain) — complexity, defer to v2
- Marketplace/secondary sales — use existing marketplaces initially
- Social features (comments, follows) — not core to art creation
- Mobile app — web-first approach

## Context

**Technical Environment:**
- Node.js 18+ with ES modules
- Solidity 0.8.20+ for contracts (OpenZeppelin base)
- p5.js/Three.js as primary art frameworks
- Next.js likely for frontend (TBD)

**Prior Work:**
- Art Blocks and fxhash provide proven patterns for generative NFTs
- Hash-based determinism is well-understood
- On-chain vs IPFS storage trade-offs documented

**Data Assets:**
- 28,338 projects indexed (908 Art Blocks, 27,430 fxhash)
- 300 curated code examples with patterns detected
- Comprehensive technique/aesthetic taxonomy

## Constraints

- **Blockchain**: TBD (Ethereum mainnet expensive, consider L2 or testnet first)
- **Storage**: Prefer IPFS for cost, Arweave for permanence
- **Budget**: Solo developer, minimize infrastructure costs
- **Timeline**: No fixed deadline, ship incrementally

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use existing GSD methodology | Proven workflow, avoid reinventing | ✓ Adapted |
| Local embeddings (Xenova) | No API costs, privacy, works offline | ✓ Implemented |
| ERC-721 over ERC-1155 | Simpler, most gen art is 1/1 editions | ✓ Base contract done |
| Puppeteer for rendering | Reliable, headless Chrome, GPU support | ✓ Implemented |
| 6-phase roadmap | Logical progression: search → tools → contracts → frontend → dashboard → deploy | ✓ Planned |

---
*Last updated: 2026-01-18 after GSD adaptation*
