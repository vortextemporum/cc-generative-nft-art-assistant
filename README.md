# Generative Art AI Assistant

A comprehensive generative art toolkit featuring a 33,000+ project knowledge base, AI-assisted sketch creation, semantic search, visual analysis, and NFT platform building infrastructure.

## What's Inside

- **Massive Dataset** — 33,344 generative art projects from Art Blocks, fxhash, Dwitter, and Highlight
- **Semantic Search** — Vector embeddings for finding similar projects by concept, not just keywords
- **11 Original Sketches** — From graphical music scores to molecular watercolors
- **Visual Renderer** — Automated screenshot capture and visual analysis via Puppeteer
- **Platform Builder** — Smart contracts and infrastructure for launching NFT platforms
- **AI Agents** — Specialized agents for sketch creation, code analysis, and platform building

## Quick Start

```bash
# Install dependencies
npm install

# Fetch datasets (if not present)
node scripts/artblocks-fetcher.js
node scripts/fxhash-fetcher.js

# Generate semantic embeddings (~5 min)
npm run embeddings

# Search the dataset
npm run search "flow fields with organic movement"

# Run a local server to view sketches
cd sketches/graphical-score && python -m http.server 8000
```

## Dataset

The knowledge base spans 33,344 projects across four platforms:

| Platform | Projects | Artists | Primary Framework |
|----------|----------|---------|-------------------|
| fxhash | 27,430 | 4,593 | p5.js, custom |
| Art Blocks | 908 | 447 | p5.js, Three.js |
| Dwitter | 5,000 | 372 | Vanilla JS (140 chars) |
| Highlight | 6 | 6 | p5.js, Three.js |

### Fetching Data

```bash
# Art Blocks (Ethereum)
node scripts/artblocks-fetcher.js              # Metadata only
node scripts/artblocks-fetcher.js --with-scripts   # With code

# fxhash (Tezos)
node scripts/fxhash-fetcher.js
node scripts/fxhash-fetcher.js --with-scripts  # Slow, fetches from IPFS

# Dwitter (code golf)
node scripts/dwitter-fetcher.js --limit 5000

# Highlight (multi-chain)
ALCHEMY_API_KEY=xxx node scripts/highlight-fetcher.js
```

### Processing for AI Training

```bash
node scripts/process-dataset.js data/artblocks-dataset.json data/fxhash-dataset.json
```

Generates:
- `processed/training-examples.json` — Instruction-response pairs
- `processed/rag-documents.json` — Searchable chunks
- `processed/code-examples.json` — Curated code samples
- `processed/system-prompt.md` — Ready-to-use system prompt

## Services

### Semantic Search (`services/embeddings/`)

Vector-based search across all 33k+ projects using transformer embeddings.

```bash
npm run embeddings                              # Generate vectors (~5 min)
npm run search "particle systems with physics"  # Search
npm run search "minimalist geometric patterns"
```

Programmatic usage:
```javascript
const { search } = require('./services/embeddings');
const results = await search("flow fields with noise", { limit: 10 });
```

### Visual Renderer (`services/renderer/`)

Puppeteer-based screenshot capture and visual analysis.

```bash
npm run render capture sketches/graphical-score output.png
npm run render capture sketches/graphical-score output.png --hash "0x1234..."
npm run render analyze sketches/graphical-score
npm run render variations sketches/graphical-score 10
```

Analysis output includes dominant colors, palette type, complexity metrics, and composition balance.

## Sketches

11 original generative art projects in `sketches/`:

| Sketch | Description |
|--------|-------------|
| **graphical-score** | 21-mode avant-garde music notation system (Ligeti, Xenakis, Cage, Crumb...) |
| **molecular-brush** | Molecular dynamics-based brush strokes |
| **molecular-watercolor** | Physics-based watercolor simulation |
| **magnetic-chains** | Magnetic field line visualizations |
| **benjolin-rungler** | Chaotic oscillator patterns (Benjolin synth) |
| **wavelet-mosh** | Wavelet transform glitch effects |
| **pocket-city** | Procedural city generation |
| **stick-arena** | Stick figure combat scenes |
| **data-stomp** | Data visualization art |
| **glix-wavetable** | Wavetable synthesis visualization |
| **genital-forms** | Organic form generation |

Each sketch includes:
- `index.html` — Viewer with controls
- `sketch.js` — Main generative code
- `CLAUDE.md` — AI assistant context
- `docs/` — Features and technical documentation
- `versions/` — Version history

### Viewing Sketches

```bash
cd sketches/graphical-score
python -m http.server 8000
# Open http://localhost:8000
```

Keyboard shortcuts (where implemented):
- `R` — Regenerate with new hash
- `S` — Save PNG
- `H` — Toggle hi-res mode

## Platform Builder

Infrastructure for building generative art NFT platforms in `platform/`:

### Smart Contracts (`platform/contracts/`)

- `GenerativeNFT.sol` — ERC-721 with on-chain scripting and hash-based randomness

Planned:
- Minter contract (allowlists, auctions)
- Royalty splitter
- Script storage (SSTORE2)

### Backend Services

- Metadata API — Token traits and descriptions
- Renderer — Server-side artwork rendering
- Indexer — Blockchain event syncing

### Development

```bash
cd platform/contracts
forge build    # Compile
forge test     # Test
forge script Deploy   # Deploy
```

## Slash Commands

Available commands for AI-assisted workflows:

| Command | Description |
|---------|-------------|
| `/art:new-sketch` | Create new generative art with full project structure |
| `/art:edit-sketch [name]` | Edit existing sketch with versioning |
| `/art:analyze` | Analyze code for techniques and patterns |
| `/art:inspiration` | Get ideas from the 28k+ project dataset |
| `/platform:fxhash` | Create fxhash-compatible project |
| `/platform:research` | Research NFT platform components |
| `/util:dataset-query` | Query the dataset directly |

## Agents

Specialized AI agents in `.claude/agents/`:

| Agent | Purpose |
|-------|---------|
| `art-sketch-creator` | Creates new sketches using dataset knowledge |
| `sketch-editor` | Safe editing with versioning and knowledge capture |
| `sketch-auditor` | Quality, determinism, and platform compatibility checks |
| `code-analyzer` | Deep technical analysis of generative code |
| `dataset-researcher` | Queries the 28k+ project knowledge base |
| `visual-reviewer` | Analyzes rendered outputs for quality |
| `sketch-playground-builder` | Builds interactive playgrounds for sketches |
| `platform-component-builder` | Builds NFT platform infrastructure |

## Directory Structure

```
generative-art-assistant/
├── data/                    # Raw datasets (465MB+ total)
│   ├── artblocks-dataset.json
│   ├── fxhash-dataset.json
│   ├── dwitter-dataset.json
│   └── highlight-dataset.json
├── processed/               # AI training data
│   ├── training-examples.json
│   ├── rag-documents.json
│   └── embeddings/
├── scripts/                 # Data fetchers and processors
│   ├── artblocks-fetcher.js
│   ├── fxhash-fetcher.js
│   ├── dwitter-fetcher.js
│   ├── highlight-fetcher.js
│   └── process-dataset.js
├── services/
│   ├── embeddings/          # Semantic search service
│   └── renderer/            # Visual capture & analysis
├── sketches/                # 11 original generative art projects
│   ├── graphical-score/
│   ├── molecular-brush/
│   └── ...
├── platform/                # NFT platform builder
│   ├── contracts/           # Solidity smart contracts
│   ├── services/            # Backend services
│   └── frontend/            # Web application
├── tools/                   # Browser-based explorers
│   ├── html-explorer.html
│   └── fxhash-explorer.html
├── .claude/
│   ├── commands/            # Slash commands
│   ├── agents/              # Specialized agents
│   └── expertise/           # Domain knowledge
└── docs/                    # Research and documentation
```

## Domain Knowledge

Reference documentation in `.claude/expertise/`:

- `generative-art-knowledge.md` — Platform stats, notable projects, common techniques
- `sketch-standards.md` — Sketch structure requirements
- `hash-randomness.md` — PRNG implementations for Art Blocks/fxhash
- `p5-brush-techniques.md` — p5.brush library reference

## Key Concepts

### Hash-Based Randomness

Art Blocks uses `tokenData.hash`, fxhash uses `fxrand()`:

```javascript
// Art Blocks
let seed = parseInt(tokenData.hash.slice(2, 18), 16);

// fxhash
let value = fxrand(); // 0-1 deterministic random
```

### Feature Declaration

```javascript
// Art Blocks
tokenData.features = { "Background": "Dark", "Complexity": "High" };

// fxhash
$fx.features({ "Background": "Dark", "Complexity": "High" });
```

### Common Techniques (by popularity)

1. Hash derivation (27,952 projects)
2. Value mapping (26,202 projects)
3. Math functions (4,943 projects)
4. Color manipulation (4,381 projects)
5. Nested loops (4,344 projects)
6. Animation (1,676 projects)
7. Trigonometry (1,405 projects)

## License

MIT
