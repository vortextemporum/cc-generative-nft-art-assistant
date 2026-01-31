# Corrupted Harmony - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      sketch.js                          │
├─────────────────────────────────────────────────────────┤
│  PRNG System     │  Feature Gen    │  Building Class   │
│  - sfc32         │  - rarity roll  │  - dimensions     │
│  - initRandom    │  - palette      │  - style          │
│  - rnd helpers   │  - effects      │  - effect         │
│                  │  - weirdness    │  - weirdness[]    │
├─────────────────────────────────────────────────────────┤
│  Isometric       │  Style          │  Effect           │
│  - isoProject    │  - brutalist    │  - dither         │
│  - drawIsoBox    │  - deco         │  - liquify        │
│                  │  - modernist    │  - stencil        │
│                  │  - gothic       │  - glitch         │
│                  │  - retro-fut    │  - corrupt        │
│                  │  - geometric    │  - clean          │
│                  │  - organic      │                   │
├─────────────────────────────────────────────────────────┤
│  Rendering Pipeline                                     │
│  setup() → generateCity() → draw() → renderBuilding()  │
└─────────────────────────────────────────────────────────┘
```

## PRNG System

### sfc32 (Small Fast Chaotic)
32-bit PRNG with 128-bit state. Passes BigCrush statistical tests.

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

### Initialization
Hash string (64 hex chars) split into 4 × 32-bit integers:
```javascript
const a = parseInt(hash.substr(0, 8), 16);   // bytes 0-3
const b = parseInt(hash.substr(8, 8), 16);   // bytes 4-7
const c = parseInt(hash.substr(16, 8), 16);  // bytes 8-11
const d = parseInt(hash.substr(24, 8), 16);  // bytes 12-15
```

### Helper Functions
```javascript
rnd(min, max)      // Float in [min, max)
rndInt(min, max)   // Integer in [min, max] inclusive
rndChoice(arr)     // Random array element
rndBool(p)         // Boolean with probability p
rndGaussian()      // Normal distribution (Box-Muller)
rollRarity()       // Returns 'common'|'uncommon'|'rare'|'legendary'
```

## Isometric Projection

### Mathematics
Standard isometric uses 30° angle from horizontal:
```
ISO_ANGLE = π/6 = 30°
COS_ISO = cos(30°) ≈ 0.866
SIN_ISO = sin(30°) = 0.5
```

### Projection Function
```javascript
function isoProject(x, y, z) {
  return {
    x: (x - y) * COS_ISO,
    y: (x + y) * SIN_ISO - z
  };
}
```

This maps 3D coordinates to 2D screen space where:
- X axis points right-down
- Y axis points left-down
- Z axis points up

### Drawing Order
Buildings sorted by `gridX + gridY` (isometric depth) to render back-to-front.

## Building Generation

### Building Class Structure
```javascript
class Building {
  gridX, gridY      // Grid position
  style             // Architectural style
  effect            // Visual effect to apply
  width, depth, height  // Dimensions
  weirdness[]       // Array of weirdness effects

  // Style-specific properties
  hasSpire, hasPinnacles, hasDome, shape, bulges

  // Window properties
  windowRows, windowCols, windowPattern
}
```

### Dimension Generation
Each style has characteristic proportions:
```javascript
switch(style) {
  case 'brutalist':
    width: 3-5 units, depth: 3-5 units, height: 4-8 units
  case 'deco':
    width: 2-4 units, depth: 2-4 units, height: 6-12 units
  // etc.
}
// baseUnit = 15 pixels
```

### Grid Placement
Buildings placed on integer grid positions with collision detection:
```javascript
const occupied = new Set();
// Try random positions until finding empty cell
do {
  gridX = rndInt(-gridSize/2, gridSize/2);
  gridY = rndInt(-gridSize/2, gridSize/2);
  key = `${gridX},${gridY}`;
} while (occupied.has(key));
```

## Effect Pipeline

### Render Flow
```
1. Create off-screen buffer (createGraphics)
2. Draw building geometry to buffer
3. Apply visual effect to buffer pixels
4. Draw buffer to main canvas at building position
```

### Dithering Implementation

**Floyd-Steinberg Error Diffusion:**
```
For each pixel (x, y):
  gray = average of RGB
  new_value = gray > 127 ? 255 : 0
  error = gray - new_value

  Distribute error to neighbors:
  (x+1, y  ) += error × 7/16
  (x-1, y+1) += error × 3/16
  (x  , y+1) += error × 5/16
  (x+1, y+1) += error × 1/16
```

**Bayer Ordered Dithering:**
```javascript
const bayer4x4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];
threshold = (bayer[y % 4][x % 4] / 16) * 255;
output = gray > threshold ? 255 : 0;
```

### Liquify Implementation
Displacement based on Perlin noise + sine wave dripping:
```javascript
noiseVal = noise(x * 0.02, y * 0.02) * 2 - 1;
displaceX = noiseVal * intensity * 30;
displaceY = sin(y * 0.05) * intensity * 20;

// Extra drip at bottom
if (y > height * 0.7) {
  drip = sin(x * 0.1) * (y - height * 0.7) * intensity * 0.5;
  displaceY -= drip;
}
```

### Glitch Implementation
1. **RGB Shift**: Red channel shifted right, blue shifted left
2. **Scanlines**: Every 3rd row darkened with probability
3. **Displacement**: Random horizontal line segments shifted

### Corruption Implementation
1. **Block Corruption**: 8×8 blocks randomly affected
2. **Modes**: Color shift, invert, solid color, channel swap
3. **Data Moshing**: Vertical streaks repeating single color

## Weirdness System

### Generation
Each building rolls for weirdness based on `weirdnessLevel`:
```javascript
const weirdChance = {
  'reality-collapse': 0.8,
  'chaotic': 0.5,
  'moderate': 0.3,
  'subtle': 0.1
}[level];
```

### Types
```javascript
{
  type: 'melt',
  intensity: 0.2-0.8,
  direction: 'down'|'left'|'right'
}

{
  type: 'float',
  offset: 10-50 pixels,
  chunks: 1-3
}

{
  type: 'time-echo',
  opacity: 0.2-0.5,
  offset: {x: -20 to 20, y: -30 to 10}
}
```

### Application
Weirdness applied during render phase:
- `melt`: Handled by liquify effect on buffer
- `float`: Renders chunk at offset position
- `time-echo`: Draws semi-transparent duplicate
- `scale-shift`: Modifies building dimensions
- `invert`: Flips buffer vertically

## Performance Considerations

### Buffer Management
- Each building creates its own off-screen buffer
- Buffers sized to building dimensions + padding
- `pixelDensity(1)` for consistent pixel manipulation

### Pixel Access
```javascript
pg.loadPixels();
// Direct array access for performance
for (let i = 0; i < pg.pixels.length; i += 4) {
  pg.pixels[i]     // Red
  pg.pixels[i + 1] // Green
  pg.pixels[i + 2] // Blue
  pg.pixels[i + 3] // Alpha
}
pg.updatePixels();
```

### Optimization Notes
- Effects operate on single-density buffers
- Building sorting done once in `generateCity()`
- Noise function called per-pixel in liquify (could be optimized with lookup table)

## Platform Compatibility

### Art Blocks
```javascript
if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}
```

### fxhash
```javascript
if (typeof fxhash !== "undefined") {
  hash = fxhash;
}

// Feature registration
if (typeof $fx !== 'undefined') {
  $fx.features({ ... });
}

// Preview trigger
if (typeof fxpreview === 'function') {
  fxpreview();
}
```

## Future Enhancements

Potential improvements:
1. **WebGL Shaders**: Move effects to GPU for real-time animation
2. **3D Mode**: Three.js version with camera controls
3. **Animation**: Slow drift, glitch triggers, breathing
4. **Higher Resolution**: 2048×2048 with progressive render
5. **Sound Reactive**: Building heights respond to audio
6. **Interactive**: Click buildings to change effects
