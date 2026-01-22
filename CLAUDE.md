# Generative Art AI Assistant

## Project Overview

This project is a comprehensive generative art toolkit and NFT platform builder:
1. **AI Assistant** - Trained on 28,000+ Art Blocks/fxhash projects
2. **Artwork Creation** - Tools for creating generative art sketches
3. **Platform Builder** - Infrastructure for building custom NFT platforms

## Directory Structure

```
generative-art-assistant/
├── CLAUDE.md                    # This file - project context
├── scripts/                     # Data fetchers and processing
├── data/                        # Datasets (see data/README.md)
├── processed/                   # Generated training data
├── sketches/                    # Original generative art sketches
├── services/
│   ├── embeddings/              # Semantic search
│   └── renderer/                # Visual analysis
├── mcp-server/                  # MCP server for Claude Desktop
├── platform/                    # NFT platform builder (see platform/CLAUDE.md)
├── .claude/
│   ├── commands/                # Slash commands
│   │   ├── art/                 # Art creation commands
│   │   ├── platform/            # Platform building commands
│   │   └── util/                # Utility commands
│   ├── agents/                  # Specialized agents
│   ├── expertise/               # Domain knowledge
│   └── state/                   # Session tracking
└── docs/                        # Documentation
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/art:new-sketch` | Create new generative art sketch with full project structure |
| `/art:edit-sketch [name]` | Edit existing sketch with versioning & knowledge capture |
| `/art:analyze` | Analyze code for techniques, patterns, aesthetics |
| `/art:inspiration` | Get ideas from 28k+ project dataset |
| `/platform:fxhash` | Create fxhash-compatible project with boilerplate |
| `/platform:research` | Research NFT platform components |
| `/util:dataset-query` | Query the dataset directly |

## Quick Commands

```bash
# Fetch datasets
node scripts/artblocks-fetcher.js
node scripts/fxhash-fetcher.js

# Process into training formats
node scripts/process-dataset.js data/artblocks-dataset.json data/fxhash-dataset.json

# Run the assistant
ANTHROPIC_API_KEY=xxx node scripts/art-assistant.js "your question"

# Semantic search
npm run embeddings    # Generate embeddings
npm run search "flow fields"

# Visual renderer
npm run render capture sketches/my-sketch output.png
npm run render analyze sketches/my-sketch
```

## Current State

### Data & Knowledge
- [x] Art Blocks dataset (908 projects)
- [x] fxhash dataset (27,430 projects)
- [x] Combined knowledge base (28,338 projects, 5,040 artists)
- [x] Token-efficient processing pipeline

### Artwork Creation
- [x] Sketch creation commands
- [x] fxhash project scaffolding
- [x] Code analysis
- [x] Dataset-driven inspiration

### Platform Builder
- [x] Platform research command
- [x] Base GenerativeNFT contract (ERC-721, on-chain hash)
- [ ] Minter contract with allowlists/auctions
- [ ] Metadata API service
- [ ] Server-side renderer
- [ ] Frontend gallery template

### Advanced Features
- [x] Embedding-based semantic search
- [x] MCP server for Claude Desktop
- [x] Visual/rendered output analysis

## Key Technologies

- **Art Blocks**: Ethereum generative art, `tokenData.hash` for randomness
- **fxhash**: Tezos generative art, `fxrand()` for randomness
- **Hasura API**: `https://data.artblocks.io/v1/graphql`
- **fxhash API**: `https://api.fxhash.xyz/graphql`

## Domain Knowledge

Detailed knowledge is in `.claude/expertise/`:
- `generative-art-knowledge.md` - Platform stats, notable projects, techniques
- `sketch-standards.md` - Sketch structure and requirements
- `hash-randomness.md` - PRNG implementations for Art Blocks/fxhash
- `p5-brush-techniques.md` - p5.brush library reference

## Notes for Claude

- Hash derivation is critical: `tokenData.hash` (Art Blocks) or `fxhash`/`fxrand()` (fxhash)
- Most projects use p5.js, some use Three.js, vanilla JS, or custom
- Scripts can be large (some 50KB+) - consider chunking for context
- See `platform/CLAUDE.md` for NFT platform builder details
