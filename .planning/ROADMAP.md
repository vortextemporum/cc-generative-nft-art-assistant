# Roadmap: Generative Art Platform

## Overview

Build a comprehensive generative art platform from foundation to deployment. Start with semantic search and developer tools, then build smart contracts and frontend, ending with production deployment. Each phase delivers working functionality that builds on previous work.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Semantic Search** - Embedding-based search across 28k+ projects
- [ ] **Phase 2: Developer Tools** - MCP server and visual renderer integration
- [ ] **Phase 3: Smart Contracts** - Minter contract and metadata API
- [ ] **Phase 4: Frontend Core** - Gallery, mint page, and artwork viewer
- [ ] **Phase 5: Artist Dashboard** - Project management and server-side rendering
- [ ] **Phase 6: Deployment** - Contract deployment, storage, and infrastructure

## Phase Details

### Phase 1: Semantic Search
**Goal**: Enable semantic search across the combined 28k+ project knowledge base using bge-small-en-v1.5 embeddings with filtering and multiple output formats
**Depends on**: Nothing (first phase)
**Requirements**: REQ-01
**Success Criteria** (what must be TRUE):
  1. User can search projects by natural language query
  2. Search returns relevant results ranked by similarity
  3. Embeddings persist between sessions (no regeneration needed)
  4. Search works offline (no external API calls)
**Plans**: 2 plans in 2 waves

Plans:
- [ ] 01-01-PLAN.md - Generate embeddings for all 28k projects (model, chunker, storage, generator)
- [ ] 01-02-PLAN.md - Implement search CLI and API (search service, CLI with formats, incremental updates)

### Phase 2: Developer Tools
**Goal**: Provide Claude Desktop integration and visual analysis capabilities
**Depends on**: Phase 1
**Requirements**: REQ-02, REQ-03
**Success Criteria** (what must be TRUE):
  1. MCP server connects to Claude Desktop
  2. Developer can search dataset from within Claude
  3. Sketches can be rendered to screenshots
  4. Visual analysis extracts color and composition data
**Plans**: TBD

Plans:
- [ ] 02-01: Complete MCP server with all tools
- [ ] 02-02: Enhance renderer with batch processing

### Phase 3: Smart Contracts
**Goal**: Deploy minter contract and serve token metadata
**Depends on**: Phase 2
**Requirements**: REQ-04, REQ-05
**Success Criteria** (what must be TRUE):
  1. Minter contract supports allowlist and auction modes
  2. Metadata API returns valid JSON for any token ID
  3. Metadata includes image URLs and attributes
  4. Contracts pass security review (Slither/manual)
**Plans**: TBD

Plans:
- [ ] 03-01: Implement minter contract with auction logic
- [ ] 03-02: Build metadata API service

### Phase 4: Frontend Core
**Goal**: Build gallery, minting, and artwork viewing experiences
**Depends on**: Phase 3
**Requirements**: REQ-07, REQ-08, REQ-09
**Success Criteria** (what must be TRUE):
  1. Gallery displays all collections with filtering
  2. Mint page connects wallet and executes mints
  3. Live viewer renders artwork with hash injection
  4. All pages are responsive and performant
**Plans**: TBD

Plans:
- [ ] 04-01: Gallery and explorer components
- [ ] 04-02: Mint page with wallet integration
- [ ] 04-03: Live artwork viewer

### Phase 5: Artist Dashboard
**Goal**: Enable artists to manage projects and generate previews
**Depends on**: Phase 4
**Requirements**: REQ-10, REQ-06
**Success Criteria** (what must be TRUE):
  1. Artists can create and edit projects
  2. Artists can upload scripts and preview outputs
  3. Server-side rendering generates thumbnails
  4. Projects can be submitted for minting
**Plans**: TBD

Plans:
- [ ] 05-01: Project management CRUD
- [ ] 05-02: Server-side rendering service

### Phase 6: Deployment
**Goal**: Deploy contracts and launch production infrastructure
**Depends on**: Phase 5
**Requirements**: REQ-11, REQ-12, REQ-13
**Success Criteria** (what must be TRUE):
  1. Contracts deployed to testnet and mainnet
  2. Scripts stored on IPFS/Arweave with verified hashes
  3. Frontend deployed with CDN
  4. All services healthy and monitored
**Plans**: TBD

Plans:
- [ ] 06-01: Contract deployment scripts
- [ ] 06-02: IPFS/Arweave integration
- [ ] 06-03: Production infrastructure setup

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Semantic Search | 0/2 | Planned | - |
| 2. Developer Tools | 0/2 | Not started | - |
| 3. Smart Contracts | 0/2 | Not started | - |
| 4. Frontend Core | 0/3 | Not started | - |
| 5. Artist Dashboard | 0/2 | Not started | - |
| 6. Deployment | 0/3 | Not started | - |
