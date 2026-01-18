# Requirements: Generative Art Platform

## v1 Requirements

### Platform Infrastructure

- [x] **REQ-01**: User can search 33k+ projects using natural language queries → Phase 1 ✓
- [x] **REQ-02**: Developer can access dataset tools from Claude Desktop via MCP → Phase 2 ✓
- [x] **REQ-03**: System generates screenshots and visual analysis of sketches → Phase 2 ✓
- [ ] **REQ-04**: Minter contract supports allowlist and Dutch auction modes → Phase 3
- [ ] **REQ-05**: Metadata API returns valid ERC-721 metadata for any token → Phase 3
- [ ] **REQ-06**: Server renders artwork previews and thumbnails → Phase 5

### Frontend

- [ ] **REQ-07**: User can browse gallery with filtering by artist/style/technique → Phase 4
- [ ] **REQ-08**: User can connect wallet and mint from collection page → Phase 4
- [ ] **REQ-09**: User can view live artwork with hash-based regeneration → Phase 4
- [ ] **REQ-10**: Artist can manage projects, upload scripts, and preview outputs → Phase 5

### Deployment

- [ ] **REQ-11**: Contracts deployed to testnet and mainnet via scripts → Phase 6
- [ ] **REQ-12**: Scripts and metadata stored on IPFS/Arweave with verification → Phase 6
- [ ] **REQ-13**: Production infrastructure deployed with CDN and monitoring → Phase 6

## v2 Requirements (Deferred)

- [ ] Multi-chain support (Ethereum L2s, other chains)
- [ ] Marketplace integration for secondary sales
- [ ] Social features (follows, comments, likes)
- [ ] Mobile-optimized PWA

## Out of Scope

- Native mobile app — web-first approach, defer to v3+
- Secondary marketplace — leverage existing marketplaces (OpenSea, Blur)
- Social graph features — not core to art creation/minting
- Cross-chain bridging — complexity, single chain for v1

## Traceability Matrix

| Requirement | Phase | Status |
|-------------|-------|--------|
| REQ-01 | Phase 1: Semantic Search | Complete |
| REQ-02 | Phase 2: Developer Tools | Complete |
| REQ-03 | Phase 2: Developer Tools | Complete |
| REQ-04 | Phase 3: Smart Contracts | Not started |
| REQ-05 | Phase 3: Smart Contracts | Not started |
| REQ-06 | Phase 5: Artist Dashboard | Not started |
| REQ-07 | Phase 4: Frontend Core | Not started |
| REQ-08 | Phase 4: Frontend Core | Not started |
| REQ-09 | Phase 4: Frontend Core | Not started |
| REQ-10 | Phase 5: Artist Dashboard | Not started |
| REQ-11 | Phase 6: Deployment | Not started |
| REQ-12 | Phase 6: Deployment | Not started |
| REQ-13 | Phase 6: Deployment | Not started |

---
*Last updated: 2026-01-18 after Phase 2 completion*
