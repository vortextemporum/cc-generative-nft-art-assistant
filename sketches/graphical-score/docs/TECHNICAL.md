# Graphical Score - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Hash Input                          │
│                    (64-char hex string)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    sfc32 PRNG Initialization                │
│              (4 × 32-bit seeds from hash)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Feature Generation                       │
│         (deterministic feature derivation)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Composition Setup                         │
│           (Voice and Section instantiation)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Drawing Pipeline                       │
│  Paper → Staves → Voices × Sections → Symmetry → Notation  │
└─────────────────────────────────────────────────────────────┘
```

## Random Number Generation

### sfc32 Algorithm

We use the sfc32 (Small Fast Chaotic) PRNG for its:
- Speed (single function, no external state)
- Quality (passes PractRand and TestU01)
- Determinism (same seeds = same sequence)

```javascript
function sfc32(a, b, c, d) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
```

### Seed Extraction

Four 32-bit seeds are extracted from the 64-character hash:

```javascript
function initRandom(hashStr) {
  const seeds = [];
  for (let i = 2; i < 66; i += 8) {
    seeds.push(parseInt(hashStr.slice(i, i + 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}
```

Positions: `hash[2:10]`, `hash[10:18]`, `hash[18:26]`, `hash[26:34]`

### Utility Functions

| Function | Description | Usage |
|----------|-------------|-------|
| `rnd(min, max)` | Uniform float | Positions, sizes |
| `rndInt(min, max)` | Uniform integer | Counts, indices |
| `rndChoice(arr)` | Random element | Palettes, types |
| `rndBool(p)` | Boolean with probability | Conditional features |
| `rndGaussian(μ, σ)` | Normal distribution | Cluster positions |
| `rollRarity(c, u, r, l)` | Tiered probability | Feature rarity |

## Class Definitions

### Voice

Represents a horizontal band for one "instrument":

```javascript
class Voice {
  constructor(index, total, yStart, yEnd) {
    this.index = index;
    this.yStart = yStart;        // Top boundary
    this.yEnd = yEnd;            // Bottom boundary
    this.yCenter = (yStart + yEnd) / 2;
    this.height = yEnd - yStart;

    // Derived properties
    this.register = rnd();       // 0=low, 1=high (affects Y positions)
    this.activity = rnd(0.3, 1); // How active this voice is
    this.density = rnd() * features.densityValue;
    this.preferredElement = /* weighted random from style */;
  }
}
```

### Section

Represents a vertical slice of time:

```javascript
class Section {
  constructor(index, total, xStart, xEnd) {
    this.index = index;
    this.xStart = xStart;        // Left boundary
    this.xEnd = xEnd;            // Right boundary
    this.width = xEnd - xStart;
    this.xCenter = (xStart + xEnd) / 2;

    // Derived properties
    this.intensity = rnd();      // Overall activity level
    this.densityMod = rnd(0.5, 1.5);  // Multiplier for density
    this.mirrorIndex = total - 1 - index;  // For palindrome
  }
}
```

## Drawing Pipeline

### 1. Paper Background

```
drawPaper()
├── Fill with palette.paper
├── Add 5000 texture particles (tiny dots)
└── Add edge aging (100 blurred spots at margins)
```

### 2. Staff Lines

```
drawStaves()
├── For each voice:
│   └── Draw 5 horizontal lines (like music staff)
└── For each section boundary:
    └── Draw dashed vertical divider
```

### 3. Element Drawing

Each `drawVoice(voice, section)` call:

```
1. Check voice.preferredElement
2. Draw primary element type
3. Check feature flags (hasMicropolyphony, hasGlissandi)
4. Possibly draw secondary element (30% × density chance)
```

### 4. Element Types

#### Ruled Lines (`drawRuledLines`)
- Count: 2-8 × density × sectionDensity
- Start/end points random within bounds
- 60% straight lines, 40% bezier curves
- 30% chance of parallel companion line

#### Density Clouds (`drawDensityClouds`)
- Count: 1-4 clouds per voice/section
- Gaussian distribution of marks around center
- Mark types: dots, short lines, squiggles, rectangles
- 20-100 marks per cloud × density

#### Pointillist Dots (`drawPointillistDots`)
- Count: 10-50 × density
- Styles: filled circle, open circle, diamond, note+stem, X mark
- Variable sizes (2-8 pixels)

#### Geometric Shapes (`drawGeometricShapes`)
- Count: 1-5 × density
- Types: rectangle, triangle, trapezoid, arc, polygon, bracket
- 30% filled, 70% outline only

### 5. Palindrome Symmetry

```javascript
function applyPalindromeSymmetry() {
  // Capture right half
  const img = get(WIDTH/2, 0, WIDTH/2, HEIGHT);

  // Mirror to left half
  push();
  translate(WIDTH/2, 0);
  scale(-1, 1);
  image(img, 0, 0);
  pop();

  // Draw center axis marker
}
```

### 6. Notation Marks

```
drawNotationMarks()
├── Time signature (top left)
├── Tempo marking (italic, near time sig)
├── Dynamic markings (3-8, scattered)
└── Rehearsal marks (boxed letters at section starts)
```

### 7. Vignette

Subtle edge darkening (50 iterations, decreasing alpha from edge to center).

## Performance Considerations

| Operation | Approximate Cost | Notes |
|-----------|------------------|-------|
| Paper texture | 5000 ellipses | One-time |
| Staff lines | voices × 5 lines | Minimal |
| Density clouds | Up to 400 marks/cloud | Most intensive |
| Pointillist dots | Up to 50/section | Light |
| Geometric shapes | Up to 5/section | Light |
| Palindrome | Full half-canvas copy | One-time |

### Optimization Opportunities

1. **Reduce texture particles** (5000 → 2000) for faster load
2. **Limit cloud marks** at extreme density
3. **Use `noSmooth()`** if jagged edges acceptable
4. **Pre-render to offscreen buffer** if implementing animation

## Dev Mode API

### Exposed Functions

```javascript
// Get current state
window.getFeatures()     // Returns features object
window.getHash()         // Returns current hash
window.getRarityCurves() // Returns probability distributions

// Modify state
window.setParameter(name, value)  // Override feature
window.resetToOriginal()          // Restore hash-derived features
window.regenerate()               // New hash, full redraw

// Query state
window.hasModifications()  // Check if overrides active
```

### Events

```javascript
// Fired after regenerate()
window.addEventListener('featuresUpdated', (e) => {
  console.log(e.detail);  // New features object
});
```

## Hash Compatibility

This sketch is compatible with:
- **Art Blocks**: `tokenData.hash` (0x-prefixed, 64 hex chars)
- **fxhash**: Convert `fxhash` to 0x format if needed
- **Development**: Auto-generates random hash if no tokenData

```javascript
// Art Blocks integration
if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}
```

## File Size

| File | Size | Purpose |
|------|------|---------|
| sketch.js | ~18KB | Main logic |
| index.html | ~10KB | Viewer + dev UI |
| Total | ~28KB | Full sketch |

No external dependencies except p5.js CDN.
