# /new_sketch - Create a new generative art sketch

Create a new standardized sketch project in the `sketches/` directory.

## Process

### 1. Discovery Phase - Ask Questions

Before creating anything, have a thorough conversation with the user. Ask about:

**Concept & Vision:**
- What is the core concept or idea? (1-2 sentences)
- What inspired this piece? (artists, nature, mathematics, music, etc.)
- What emotion or feeling should it evoke?
- Is there a narrative or theme?

**Visual Aesthetics:**
- Color approach? (monochrome, complementary, analogous, palette-based, generative)
- Style? (minimal, chaotic, organic, geometric, glitchy, clean, textured)
- Density? (sparse, balanced, dense, variable)
- Motion quality? (static, slow/meditative, energetic, chaotic, rhythmic)
- Any specific visual references or inspirations?

**Technical Approach:**
- Framework preference?
  - **p5.js** - 2D canvas, beginner-friendly, great for particles/shapes
  - **three.js** - 3D, WebGL, shaders, complex geometry
  - **regl** - Low-level WebGL, high performance
  - **vanilla JS** - Pure canvas/WebGL, full control
  - **GLSL shaders** - GPU-based, mathematical patterns
  - **Other** - tone.js (audio), paper.js, etc.
- Primary technique? (particles, noise fields, cellular automata, physics, fractals, L-systems, flow fields, voronoi, recursive, grid-based, agent-based)
- Resolution/canvas size? (700x700 default, or custom)
- Performance priority? (quality vs. frame rate)

**Interactivity:**
- Mouse/touch interaction? (hover effects, click events, drag, drawing)
- Keyboard controls? (parameter tweaking, mode switching)
- Audio reactive?
- Should it animate continuously or be static?
- Any GUI controls for parameters?

**Generative Features & Rarity:**
- What aspects should vary between mints/generations?
- How many distinct "modes" or "types"?
- What makes a piece "rare" or "legendary"?
- Should certain combinations be impossible or guaranteed?

**Parameters to expose:**
- What numerical values should be tweakable?
- What ranges make sense for each?
- Which parameters should be hash-derived vs. fixed?

### 2. Summarize & Confirm

After gathering information, summarize the plan:
- Sketch name (kebab-case)
- One-line description
- Framework choice
- Key features list
- Rarity system outline
- Interactivity summary

Get user confirmation before proceeding.

### 3. Create Folder Structure

```
sketches/{sketch-name}/
├── index.html          # Viewer with controls
├── sketch.js           # Main sketch (or sketch.ts, main.js, etc.)
├── CLAUDE.md           # AI assistant guide
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
│   └── .gitkeep
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation details
```

### 4. File Templates

#### sketch.js - Must Include:

**Hash-based randomness (Art Blocks compatible):**
```javascript
let hash = "0x" + Array(64).fill(0).map(() =>
  "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}

// sfc32 PRNG implementation
function sfc32(a, b, c, d) { /* ... */ }
function initRandom(hashStr) { /* ... */ }

let R;
function rnd(min, max) { /* ... */ }
function rndInt(min, max) { /* ... */ }
function rndChoice(arr) { /* ... */ }
function rndBool(p) { /* ... */ }
function rollRarity(common, uncommon, rare, legendary) { /* ... */ }
```

**Feature system:**
```javascript
let features = {};
function generateFeatures() {
  R = initRandom(hash);
  // Derive all features from hash
  features = { /* ... */ };
  return features;
}
```

**Framework-specific setup** (p5.js, three.js, vanilla, etc.)

**Standard controls:**
- S key = save PNG
- R key = regenerate with new hash
- Any sketch-specific controls

#### index.html

Adapt based on framework:
- **p5.js**: Include p5.js CDN, sketch-holder div
- **three.js**: Include three.js CDN, handle WebGL context
- **vanilla**: Plain canvas setup
- **shaders**: Include shader loading utilities

Standard viewer features:
- Dark theme (#0d0d14 background)
- Responsive canvas (default 700x700)
- Features table with rarity badges
- Hash display
- Regenerate/Save buttons
- Keyboard shortcut hints
- Version display

#### CLAUDE.md

Must include:
- Project overview (concept + technical summary)
- File structure tree
- Current version
- Key concepts (algorithms, classes, features)
- Quick commands
- Making changes workflow
- Version numbering guide
- Framework-specific notes

#### CHANGELOG.md

```markdown
# Changelog

## [1.0.0] - {DATE}

### Added
- Initial release
- {List features based on discovery conversation}
```

#### docs/FEATURES.md

Document all generative features:
- Rarity tiers with percentages
- Feature categories
- Visual descriptions of each variant
- Probability calculations for combinations

#### docs/TECHNICAL.md

Document implementation:
- Core algorithms explained
- Class/module overview
- Performance notes
- Framework-specific details
- Shader explanations (if applicable)

### 5. After Creation

1. Confirm all files created
2. Provide the path: `sketches/{sketch-name}/`
3. List immediate TODOs based on discovery conversation
4. Suggest first implementation steps

## Standards (All Frameworks)

- **Randomness**: Always use hash-based sfc32 PRNG for determinism
- **Features**: Always include rarity system (common/uncommon/rare/legendary)
- **Versioning**: SemVer (major.minor.patch) with archived versions
- **Naming**: kebab-case for folders, camelCase for JS variables
- **Canvas**: 700x700 default (configurable)
- **Viewer**: Dark theme with features display
- **Controls**: R = regenerate, S = save (minimum)

## Framework CDNs

```html
<!-- p5.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>

<!-- three.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- regl -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/regl/2.1.0/regl.min.js"></script>

<!-- tone.js (audio) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js"></script>
```
