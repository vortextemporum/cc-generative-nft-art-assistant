# NFT Platform Builder

This directory contains components for building a custom generative art NFT platform.

## Directory Structure

```
platform/
├── CLAUDE.md              # This file
├── contracts/             # Smart contracts (Solidity/Foundry)
│   ├── src/               # Contract source files
│   ├── test/              # Contract tests
│   └── script/            # Deployment scripts
├── services/              # Backend services
│   ├── metadata/          # Metadata API
│   ├── renderer/          # Server-side rendering
│   └── indexer/           # Blockchain event indexer
├── frontend/              # Web application
│   └── (Next.js/React app)
└── scripts/               # Utility scripts
    ├── deploy.js          # Deployment automation
    └── seed.js            # Test data seeding
```

## Platform Components

### 1. Smart Contracts (`contracts/`)

**Core Contracts:**
- `GenerativeNFT.sol` - ERC-721 with on-chain scripting
- `Minter.sol` - Minting logic, pricing, allowlists
- `RoyaltySplitter.sol` - Revenue distribution
- `ScriptStorage.sol` - On-chain script storage (SSTORE2)

**Key Features:**
- Hash-based deterministic randomness
- On-chain or IPFS script storage
- Flexible minting (open, limited, auction)
- ERC-2981 royalties
- Upgradeable (optional)

### 2. Backend Services (`services/`)

**Metadata API:**
- Serves token metadata (name, description, attributes)
- Dynamic trait generation from seed
- Caching layer

**Renderer:**
- Server-side artwork rendering (Puppeteer)
- Thumbnail generation
- High-res on-demand rendering
- Queue management

**Indexer:**
- Listens to blockchain events
- Syncs mint/transfer/sale data
- Populates database

### 3. Frontend (`frontend/`)

**Pages:**
- `/` - Gallery/home
- `/create` - Artist submission
- `/mint/{projectId}` - Minting page
- `/token/{id}` - Token detail with live render
- `/artist/{address}` - Artist profile
- `/collector/{address}` - Collection view

**Features:**
- Wallet connection (RainbowKit/wagmi)
- Live artwork rendering (iframe sandbox)
- Trait filtering/search
- Activity feed

## Development Workflow

### Contracts
```bash
cd platform/contracts
forge build           # Compile
forge test            # Run tests
forge script Deploy   # Deploy
```

### Services
```bash
cd platform/services/metadata
npm run dev          # Start metadata API

cd platform/services/renderer
npm run dev          # Start render service
```

### Frontend
```bash
cd platform/frontend
npm run dev          # Start Next.js dev server
```

## Configuration

Environment variables needed:
```env
# Blockchain
RPC_URL=https://...
PRIVATE_KEY=0x...
CHAIN_ID=1

# Storage
IPFS_API_KEY=...
ARWEAVE_KEY=...

# Services
DATABASE_URL=postgres://...
REDIS_URL=redis://...

# Frontend
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=1
```

## Commands

Available slash commands:
- `/platform_research {topic}` - Research platform components
- `/new_sketch` - Create new generative artwork
- `/analyze_artwork` - Analyze existing artwork code
- `/art_inspiration` - Get ideas from 28k+ project dataset

## Architecture Decisions

Document key decisions here as the platform evolves:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Blockchain | TBD | |
| NFT Standard | ERC-721A | Gas-efficient batch minting |
| Script Storage | TBD | On-chain vs IPFS trade-offs |
| Frontend | Next.js | SSR, React ecosystem |
| Rendering | Puppeteer | Reliable, headless Chrome |

## Roadmap

### Phase 1: Foundation
- [ ] Core NFT contract
- [ ] Basic minting flow
- [ ] Metadata API
- [ ] Simple gallery frontend

### Phase 2: Generative Features
- [ ] On-chain script storage
- [ ] Hash-based randomness
- [ ] Live rendering
- [ ] Trait system

### Phase 3: Marketplace
- [ ] Listing/offers
- [ ] Secondary sales
- [ ] Royalty enforcement

### Phase 4: Scale
- [ ] Multi-chain support
- [ ] Render optimization
- [ ] Analytics dashboard
