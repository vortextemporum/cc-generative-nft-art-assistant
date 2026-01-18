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
├── README.md                    # Project documentation
├── package.json                 # Node.js dependencies
│
├── scripts/
│   ├── artblocks-fetcher.js     # Fetch all Art Blocks projects
│   ├── fxhash-fetcher.js        # Fetch all fxhash projects
│   ├── highlight-fetcher.js     # Fetch Highlight.xyz generative collections
│   ├── dwitter-fetcher.js       # Fetch Dwitter 140-char demos
│   ├── shadertoy-fetcher.js     # Fetch Shadertoy GLSL shaders
│   ├── process-dataset.js       # Process into training formats
│   └── art-assistant.js         # RAG-based assistant CLI
│
├── data/                        # All datasets (see data/README.md)
│   ├── artblocks-dataset.json   # Art Blocks (~31MB, 908 projects)
│   ├── fxhash-dataset.json      # fxhash (~465MB, 27k projects)
│   ├── highlight-dataset.json   # Highlight.xyz generative collections
│   └── dwitter-dataset.json     # Dwitter 140-char JS demos
│
├── processed/                   # Generated after processing
│   ├── training-examples.json   # Instruction-response pairs
│   ├── rag-documents.json       # Searchable document chunks
│   ├── system-knowledge.json    # Aggregated statistics
│   ├── code-examples.json       # Curated code samples
│   └── system-prompt.md         # Ready-to-use prompt
│
├── tools/
│   └── html-explorer.html       # Browser-based Art Blocks explorer
│
├── sketches/                    # Original generative art sketches
│   ├── molecular-watercolor/    # Physics-based watercolor simulation
│   └── stick-arena/             # Stick figure combat game
│
├── services/                    # Backend services
│   ├── embeddings/              # Semantic search with vector embeddings
│   │   └── embed.js             # Generate & search embeddings
│   └── renderer/                # Visual analysis & screenshots
│       └── render.js            # Puppeteer-based renderer
│
├── mcp-server/                  # MCP server for Claude Desktop
│   ├── src/index.js             # MCP server implementation
│   ├── package.json
│   └── README.md                # Setup instructions
│
├── platform/                    # NFT platform builder components
│   ├── CLAUDE.md                # Platform builder guide
│   ├── contracts/               # Smart contracts (Solidity)
│   │   └── src/GenerativeNFT.sol
│   ├── services/                # Backend services (metadata, renderer)
│   ├── frontend/                # Web application
│   └── scripts/                 # Deployment utilities
│
├── .claude/
│   └── commands/
│       ├── new_sketch.md        # /new_sketch - Create artwork
│       ├── fxhash_project.md    # /fxhash_project - fxhash-ready project
│       ├── analyze_artwork.md   # /analyze_artwork - Code analysis
│       ├── art_inspiration.md   # /art_inspiration - Ideas from dataset
│       └── platform_research.md # /platform_research - Platform building
│
└── docs/
    ├── TRAINING-GUIDE.md        # How to use data with Claude
    ├── ARTBLOCKS-RESEARCH.md    # Platform technical details
    └── PLATFORM-FETCHERS.md     # Research on additional data sources
```

## Quick Commands

```bash
# Fetch Art Blocks dataset (metadata only, fast)
node scripts/artblocks-fetcher.js

# Fetch with full scripts (slow, ~100MB)
node scripts/artblocks-fetcher.js --with-scripts

# Fetch fxhash dataset (metadata only, ~27k projects)
node scripts/fxhash-fetcher.js

# Fetch fxhash with scripts from IPFS (very slow)
node scripts/fxhash-fetcher.js --with-scripts

# Fetch limited fxhash sample
node scripts/fxhash-fetcher.js --limit 500

# Process both datasets into training formats (token-efficient)
node scripts/process-dataset.js data/artblocks-dataset.json data/fxhash-dataset.json

# Or process single dataset
node scripts/process-dataset.js data/artblocks-dataset.json

# Run the assistant
export ANTHROPIC_API_KEY=your-key
node scripts/art-assistant.js "your question"

# Fetch Highlight.xyz generative collections (requires Alchemy key)
ALCHEMY_API_KEY=xxx node scripts/highlight-fetcher.js --chain base --contract 0x...

# Fetch Dwitter 140-char demos (no key required)
node scripts/dwitter-fetcher.js --limit 1000

# Fetch Shadertoy shaders (requires Shadertoy API key)
SHADERTOY_API_KEY=xxx node scripts/shadertoy-fetcher.js --limit 500
```

## Sketch Commands

```bash
# Create a new standardized sketch
/new_sketch

# Open a sketch in browser
open sketches/{sketch-name}/index.html

# Or with local server
cd sketches/{sketch-name} && python3 -m http.server 8000
```

## Sketch Standards

All sketches in `sketches/` follow this structure:
```
{sketch-name}/
├── index.html          # Viewer with controls
├── sketch.js           # Main p5.js sketch
├── CLAUDE.md           # AI assistant guide
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions (v1.0.0.js, etc.)
└── docs/
    ├── FEATURES.md     # Feature/rarity docs
    └── TECHNICAL.md    # Technical details
```

**Requirements:**
- 700x700 responsive canvas (configurable)
- Any framework: p5.js, three.js, regl, vanilla JS, GLSL shaders, tone.js
- Hash-based sfc32 PRNG (Art Blocks compatible)
- Feature/rarity system (common/uncommon/rare/legendary)
- SemVer versioning with archived versions
- Dark theme viewer with features table
- R = regenerate, S = save (minimum controls)

## Key Technologies

- **Art Blocks**: Ethereum-based generative art platform
- **fxhash**: Tezos-based generative art platform (~27k projects)
- **Hasura API**: `https://data.artblocks.io/v1/graphql` (free, no auth)
- **fxhash API**: `https://api.fxhash.xyz/graphql` (free, no auth)
- **p5.js / Three.js**: Common frameworks in generative art
- **Hash-based randomness**: Projects use `tokenData.hash` (Art Blocks) or `fxhash` (fxhash) for determinism

## Slash Commands

| Command | Description |
|---------|-------------|
| `/new_sketch` | Create new generative art sketch with full project structure |
| `/fxhash_project` | Create fxhash-compatible project with boilerplate |
| `/analyze_artwork` | Analyze code for techniques, patterns, aesthetics |
| `/art_inspiration` | Get ideas from 28k+ project dataset |
| `/platform_research` | Research NFT platform components |

## Current State

### Data & Knowledge
- [x] Art Blocks dataset (908 projects)
- [x] fxhash dataset (27,430 projects)
- [x] Combined knowledge base (28,338 projects, 5,040 artists)
- [x] Token-efficient processing pipeline

### Artwork Creation
- [x] `/new_sketch` command with full project scaffolding
- [x] `/fxhash_project` command for fxhash-ready projects
- [x] `/analyze_artwork` for code analysis
- [x] `/art_inspiration` for dataset-driven ideas

### Platform Builder
- [x] Platform research command
- [x] Base GenerativeNFT contract (ERC-721, on-chain hash)
- [ ] Minter contract with allowlists/auctions
- [ ] Metadata API service
- [ ] Server-side renderer
- [ ] Frontend gallery template

### Advanced Features
- [x] Embedding-based semantic search (`services/embeddings/`)
- [x] MCP server for Claude Desktop (`mcp-server/`)
- [x] Visual/rendered output analysis (`services/renderer/`)

### Future
- [ ] Multi-chain contract deployments
- [ ] Real-time collaboration features
- [ ] Gallery/marketplace frontend

## Common Tasks

### Adding new data sources
1. Create fetcher in `scripts/`
2. Normalize to same schema as Art Blocks
3. Merge into `data/combined-dataset.json`
4. Re-run processing

### Improving retrieval
- Current: Simple TF-IDF (no dependencies)
- Better: Use `sentence-transformers` for embeddings
- See `docs/TRAINING-GUIDE.md` for Python examples

### Testing the assistant
```bash
node scripts/art-assistant.js "How do flow fields work?"
node scripts/art-assistant.js "Write p5.js code for a particle system"
node scripts/art-assistant.js "Explain Fidenza's technique"
```

## Platform Builder

The `platform/` directory contains infrastructure for building a custom NFT platform.

### Quick Start
```bash
# Research platform components
/platform_research architecture

# Research specific topics
/platform_research contracts
/platform_research storage
/platform_research minting
/platform_research rendering
```

### Components

| Component | Location | Status |
|-----------|----------|--------|
| NFT Contract | `platform/contracts/src/GenerativeNFT.sol` | Base ready |
| Minter Contract | `platform/contracts/src/Minter.sol` | Planned |
| Metadata API | `platform/services/metadata/` | Planned |
| Renderer | `platform/services/renderer/` | Planned |
| Frontend | `platform/frontend/` | Planned |

### Contract Features
- ERC-721 with deterministic hash generation
- On-chain or IPFS script storage
- Project-based organization
- ERC-2981 royalties
- Batch minting support

See `platform/CLAUDE.md` for detailed platform builder documentation.

## Advanced Features

### Semantic Search (Embeddings)

Uses local transformer model for semantic similarity search across 28k+ projects.

```bash
# Generate embeddings (first time, ~5 min)
npm run embeddings

# Search semantically
npm run search "flow fields with organic movement"
npm run search "minimalist geometric patterns"
```

### MCP Server (Claude Desktop)

Gives Claude Desktop direct access to the dataset with these tools:
- `search_projects` - Semantic search
- `search_by_pattern` - Find by code pattern
- `get_code_example` - Get full code
- `get_dataset_stats` - Statistics

```bash
# Install MCP dependencies
cd mcp-server && npm install

# Add to Claude Desktop config
# ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "generative-art": {
      "command": "node",
      "args": ["/path/to/mcp-server/src/index.js"]
    }
  }
}
```

### Visual Renderer

Renders sketches and analyzes visual properties using Puppeteer.

```bash
# Install puppeteer (optional)
npm install puppeteer

# Capture screenshot
npm run render capture sketches/my-sketch output.png

# Analyze visual properties
npm run render analyze sketches/my-sketch

# Generate variations with different hashes
npm run render variations sketches/my-sketch 6
```

## API Reference

### Art Blocks Hasura
```graphql
query {
  projects_metadata(limit: 10) {
    id
    project_id
    name
    artist_name
    description
    script
    invocations
    max_invocations
  }
}
```

### Dataset Schema
```javascript
{
  id: "0x...-123",           // contract-projectId
  project_id: "123",
  name: "Project Name",
  artist_name: "Artist",
  description: "...",
  script: "// full code...",
  script_type_and_version: "p5js@1.0.0",
  invocations: 500,
  max_invocations: 1000,
  // ... more fields
}
```

## Notes for Claude

- The Art Blocks Hasura API schema changes occasionally - use introspection
- fxhash GraphQL API works but some fields return null for certain tokens
- fxhash scripts are stored on IPFS - use `generativeUri` field for the IPFS hash
- Scripts can be large (some 50KB+) - consider chunking for context
- Hash derivation is critical: `tokenData.hash` (Art Blocks) or `fxhash`/`fxrand()` (fxhash)
- Most projects use p5.js, some use Three.js, vanilla JS, or custom

---

# Generative Art Knowledge Base

> Auto-generated from Art Blocks + fxhash datasets (28,338 projects, 5,040 artists)

## Platform Statistics

### Overview
- **Art Blocks (Ethereum)**: 908 projects by 447 artists
- **fxhash (Tezos)**: 27,430 projects by 4,593 artists
- **Total**: 28,338 projects with 27,966 having scripts

### Script Technologies
- **p5js**: 9,407 projects (33%)
- **unknown/custom**: 17,028 projects (60%)
- **threejs**: 814 projects
- **svg**: 460 projects
- **webgl**: 288 projects
- **js**: 253 projects
- **regl**: 30 projects

### Common Aesthetic Themes
- generative (12,033 projects)
- line (6,389 projects)
- abstract (6,040 projects)
- particle (4,627 projects)
- palette (3,370 projects)
- 2d (3,253 projects)
- noise (3,208 projects)
- pattern (3,076 projects)
- composition (2,656 projects)
- circle (2,604 projects)
- 3d (2,384 projects)
- grid (2,127 projects)
- geometric (1,777 projects)
- minimalist (1,574 projects)
- gradient (1,513 projects)

### Technical Patterns Detected
- hash_derivation: 27,952 projects
- fxhash_derivation: 27,052 projects
- value_mapping: 26,202 projects
- math_functions: 4,943 projects
- color_manipulation: 4,381 projects
- nested_loops: 4,344 projects
- randomness: 3,653 projects
- fx_features: 2,917 projects
- transformations: 1,729 projects
- animation: 1,676 projects
- trigonometry: 1,405 projects
- vectors: 1,087 projects

### Popular Tags (fxhash)
- generative (6,047)
- p5js (5,043)
- abstract (4,333)
- art (3,604)
- color (1,707)
- generativeart (1,475)
- colors (1,452)
- colorful (1,312)
- noise (1,103)
- animation (1,058)

## Key Techniques

### Art Blocks Hash-Based Randomness
Art Blocks projects use tokenData.hash (a 64-char hex string) to seed deterministic randomness. Common approach: parse hex pairs as values 0-255, or use a seeded PRNG like sfc32.

### fxhash Randomness
fxhash projects use fxrand() for deterministic randomness, seeded from the fxhash string. The $fx object provides fxrand(), fxpreview(), and $fx.features() for feature declaration.

### Common PRNG Implementation
Both platforms commonly use mulberry32 or sfc32 algorithms. Art Blocks seeds from tokenData.hash, fxhash from the fxhash string.

### p5.js Structure
p5.js projects typically have setup() for initialization and draw() for rendering. Use createCanvas(), background(), fill(), stroke(), rect(), ellipse(), line(), etc.

### Three.js Structure
Three.js projects create a Scene, Camera, Renderer, and add Meshes with Geometries and Materials. Use requestAnimationFrame for animation.

### Feature Declaration
Art Blocks: tokenData.features object. fxhash: $fx.features({ name: value }) call. Features determine rarity and visual properties.

### fxhash Specifics
fxhash projects are stored on IPFS. Scripts may include HTML wrapper. Call fxpreview() when ready for thumbnail capture.

## Notable Projects

### Art Blocks
| Project | Artist | Type | Editions |
|---------|--------|------|----------|
| Friendship Bracelets | Alexis André | js | 38,965 |
| Chromie Squiggle | Snowfro | p5js | 10,000 |
| Trademark | Jack Butcher | p5js | 10,000 |
| send/receive | Snowfro | custom | 8,968 |
| Flowers | RVig | p5js | 6,158 |
| Fidenza | Tyler Hobbs | p5js | 999 |
| Ringers | Dmitri Cherniak | p5js | 1,000 |
| Archetype | Kjetil Golid | p5js | 600 |

### fxhash
| Project | Artist | Editions |
|---------|--------|----------|
| GEN XYZ Das Occult | GEN XYZ | 10,000 |
| Unicorn | Unknown | 10,000 |
| Annum | Landlines Art | 8,710 |
| fx_doughs | Butternut Deluxe | 8,008 |
| Mooncakes | Mooncakes | 4,647 |
| SynDevice | Synreal Labs | 3,366 |
| FX_D3M0NS | PIXELBUDDYJAM | 3,333 |

## Generative Art Capabilities

When helping with generative art:
1. **Analyze Code**: Explain what code does visually and technically
2. **Generate Code**: Write scripts in p5.js, Three.js, or vanilla JS
3. **Explain Techniques**: Teach noise, fractals, particle systems, etc.
4. **Debug**: Fix issues in generative art code
5. **Platform Integration**: Implement deterministic randomness for Art Blocks (tokenData.hash) or fxhash (fxrand)
6. **Feature Systems**: Design rarity/trait systems using platform-specific feature declarations

Use correct terminology (vertices, transforms, noise, etc.) and reference Art Blocks or fxhash projects when helpful.
