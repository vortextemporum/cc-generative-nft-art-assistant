# Feynman Strings - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Sketch View │  │ Features UI │  │ Dev Mode Controls   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        sketch.js                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 Hash → PRNG → Features               │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                              │
│  ┌────────────┐  ┌───────────┴───────────┐  ┌───────────┐ │
│  │ Colors &   │  │    Drawing Engine      │  │ Feedback  │ │
│  │ Palettes   │  │  ┌─────┐ ┌─────────┐  │  │ System    │ │
│  └────────────┘  │  │Modes│ │Composers│  │  └───────────┘ │
│                  │  └─────┘ └─────────┘  │                 │
│                  │  ┌─────────────────┐  │                 │
│                  │  │  Propagators    │  │                 │
│                  │  │  Vertices       │  │                 │
│                  │  │  Loops          │  │                 │
│                  │  │  Special FX     │  │                 │
│                  │  └─────────────────┘  │                 │
│                  └───────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## Hash-Based Randomness

### PRNG Implementation (sfc32)

The sketch uses the **sfc32** (Small Fast Chaotic) algorithm for deterministic randomness:

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

**Properties:**
- Period: ~2^128
- State: 128 bits (4 × 32-bit integers)
- Output: 32-bit float (0-1)
- Speed: Very fast (no division in main loop)

### Hash Parsing

The 64-character hex hash is parsed into 4 seed values:

```javascript
function initRandom(hashStr) {
  const seeds = [];
  for (let i = 2; i < 66; i += 8) {
    seeds.push(parseInt(hashStr.slice(i, i + 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}
```

**Seed extraction:**
- Bytes 0-7: seed[0]
- Bytes 8-15: seed[1]
- Bytes 16-23: seed[2]
- Bytes 24-31: seed[3]

## Feature Generation Pipeline

```
Hash (64 hex chars)
        │
        ▼
    initRandom()
        │
        ▼
    sfc32 PRNG
        │
        ▼
┌───────┴───────┐
│ generateFeatures()
│   ├─ modeBlend roll (40/30/20/10)
│   ├─ mode selection (weighted)
│   ├─ density roll (20/30/30/15/5)
│   ├─ palette selection (uniform)
│   ├─ style roll (30/30/25/15)
│   ├─ composition roll (35/25/20/20)
│   ├─ special features (5/3/2/4%)
│   └─ derived values (vertices, loops)
└───────────────┘
        │
        ▼
    features {}
```

## Drawing Pipeline

### Main Flow

```javascript
setup()
  └─> generateFeatures()
      └─> drawScene()
          ├─> Set background from palette
          ├─> Switch on composition type
          │     ├─> drawCenteredComposition()
          │     ├─> drawScatteredComposition()
          │     ├─> drawFlowingComposition()
          │     └─> drawLayeredComposition()
          ├─> Draw special features (if present)
          │     └─> drawCalabiYau() (3% chance)
          └─> Draw labels (if technical style)
```

### Composition Algorithms

#### Centered Composition

1. Create vertices in radial pattern around center
2. Connect vertices based on density
3. Add loops at vertex positions
4. Draw vertex markers

```
        ○───○
       /│   │\
      ○ │   │ ○
       \│   │/
        ○───○
```

#### Scattered Composition

1. Create N regions across canvas
2. Draw mini-diagram in each region
3. Optionally connect regions with virtual propagators

```
  ┌───┐         ┌───┐
  │ ◇ │- - - - -│ ◇ │
  └───┘         └───┘
          ┌───┐
          │ ◇ │
          └───┘
```

#### Flowing Composition

1. Define incoming particles (left edge)
2. Create main interaction vertex (center)
3. Define outgoing particles (right edge)
4. Optionally add intermediate vertices

```
  ─────┐
       ├────○────┬─────
  ─────┘    │    └─────
            │
          loop
```

#### Layered Composition

1. Create N depth layers
2. Each layer uses different mode
3. Layers overlap with varying opacity

```
  Layer 3 (front): ████░░░░
  Layer 2 (mid):   ░░████░░
  Layer 1 (back):  ░░░░████
```

## Propagator Rendering

### Fermion Line (Straight)

```javascript
line(x1, y1, x2, y2);
// Arrow at midpoint
drawArrow(mx, my, angle, size);
```

### Photon Propagator (Wavy)

Sine wave along path:

```javascript
for (t = 0 to 1) {
  x = lerp(x1, x2, t)
  y = lerp(y1, y2, t)
  wave = sin(t * waveCount * TWO_PI) * amplitude
  // Perpendicular offset
  vertex(x + perpX * wave, y + perpY * wave)
}
```

**Parameters:**
- `waveCount`: dist / 15 (auto-scales)
- `amplitude`: 8px

### Gluon Propagator (Curly/Spring)

3D coil projected to 2D:

```javascript
for (t = 0 to 1) {
  baseX = lerp(x1, x2, t)
  baseY = lerp(y1, y2, t)
  coilAngle = t * coilCount * TWO_PI

  // Perpendicular coil
  perpX = cos(angle + HALF_PI) * sin(coilAngle) * radius
  perpY = sin(angle + HALF_PI) * sin(coilAngle) * radius

  // Depth effect (makes it look 3D)
  depth = cos(coilAngle) * radius * 0.3

  vertex(baseX + perpX + cos(angle) * depth,
         baseY + perpY + sin(angle) * depth)
}
```

## String Theory Elements

### Worldsheet Algorithm

The worldsheet represents the 2D surface traced by a 1D string through spacetime:

```javascript
// Four edges:
// 1. Top: string at time t1 (with curvature)
// 2. Right: endpoint trajectory
// 3. Bottom: string at time t2
// 4. Left: other endpoint

beginShape();
// Top edge with sine deformation
for (i = 0 to 20) {
  py = y - h/2 + sin(t * PI) * 10
}
// ... other edges
endShape(CLOSE);
```

### Calabi-Yau Visualization

Simplified 2D projection of 6D compactified space:

```javascript
// 5 overlapping tori representing extra dimensions
for (i = 0 to 5) {
  angle = i * TWO_PI / 5
  // Each torus drawn as ellipse with oscillation
  for (j = 0 to 30) {
    r = size * 0.25 + sin(t * 3) * size * 0.08
    vertex(cos(t) * r, sin(t) * r * 0.5)
  }
}
```

## Vacuum/Quantum Foam

### Foam Generation

Dense field of tiny loops representing virtual particle activity:

```javascript
for (i = 0 to density * 200) {
  x = random(width)
  y = random(height)
  size = random(2, 8)
  alpha = random(0.3, 0.8)
  ellipse(x, y, size, size * random(0.5, 1))
}
```

### Virtual Pair Rendering

Particle-antiparticle bubble:

```javascript
// Two bezier curves emerging and meeting
// Represents pair creation and annihilation

// Left curve (particle)
bezierVertex(x - spread, y - size*0.5,
             x - spread, y + size*0.5,
             x, y + size)

// Right curve (antiparticle)
bezierVertex(x + spread, y - size*0.5,
             x + spread, y + size*0.5,
             x, y + size)
```

## Performance Considerations

### Optimization Strategies

1. **No animation loop**: Static output, `noLoop()` called
2. **Density-based element counts**: Higher density = more elements
3. **Minimal state**: Only hash and features stored
4. **Canvas-based rendering**: No DOM manipulation during draw

### Memory Usage

- Hash: 66 bytes (string)
- Features: ~500 bytes (object)
- Feedback: localStorage (grows with usage)
- Canvas: 700×700×4 = ~2MB (RGBA)

## Dev Mode Architecture

### Parameter Override System

```javascript
let features = {};        // Current (possibly modified)
let originalFeatures = {}; // Hash-derived original
let hasOverrides = false;  // Track modifications

function setParameter(name, value) {
  hasOverrides = true;
  features[name] = value;
  return features;
}

function resetToOriginal() {
  features = { ...originalFeatures };
  hasOverrides = false;
}
```

### Feedback Storage

localStorage structure:

```json
{
  "liked": [
    {
      "timestamp": 1706745600000,
      "hash": "0x...",
      "features": { ... },
      "hadOverrides": false
    }
  ],
  "disliked": [ ... ]
}
```

## Art Blocks Compatibility

### tokenData Interface

```javascript
// Art Blocks injects:
// tokenData.hash = "0x..." (64 hex chars)

if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}
```

### Determinism Guarantee

- Same hash always produces same output
- No external dependencies (time, mouse, etc.)
- All randomness derived from hash via PRNG
- Feature generation uses fixed number of random calls

## Color Science

### Quark Color Charge

QCD uses "color charge" (unrelated to visible color). We map:

| QCD Color | Display Color | Hex |
|-----------|---------------|-----|
| Red | Warm red | #e63946 |
| Green | Teal | #2a9d8f |
| Blue | Steel blue | #457b9d |
| Anti-red | Pink/Cyan | #ff9f9f |
| Anti-green | Violet | #d4a5ff |
| Anti-blue | Yellow | #ffd166 |

### Gluon Colors

8 gluon types represented by varied colors:
```javascript
gluon: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4",
        "#ffeaa7", "#dfe6e9", "#fd79a8", "#a29bfe"]
```

## Future Enhancements

Potential additions for future versions:

1. **Higgs vertex visualization** - Special marker for Higgs interactions
2. **Graviton propagator** - Hypothetical tensor boson line style
3. **SUSY partner particles** - Mirrored/dashed versions of standard particles
4. **Animation mode** - Particles flowing along propagators
5. **Higher resolution** - 4K output option
6. **Additional modes** - Electroweak unification, Grand Unified Theory
