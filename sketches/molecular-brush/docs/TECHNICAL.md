# Technical Documentation

## Architecture

### Rendering Pipeline

```
Hash → PRNG (sfc32) → Features → Molecules → Physics → p5.brush Rendering
```

1. **Hash Parsing**: 64-char hex string split into 4 x 32-bit seeds
2. **Feature Generation**: Deterministic trait selection via seeded random
3. **Molecule Initialization**: Position, velocity, color from features
4. **Physics Loop**: Force calculation → acceleration → velocity → position
5. **Rendering**: p5.brush strokes and fills each frame

### p5.brush Integration

```javascript
// Setup (WEBGL required)
createCanvas(size, size, WEBGL);
brush.seed(hashSeed);  // Deterministic brush randomness
brush.load();          // Initialize library

// Rendering
brush.set("2B");                           // Select brush
brush.stroke(r, g, b, alpha);              // Set color
brush.strokeWeight(size);                  // Set weight
brush.line(x1, y1, x2, y2);               // Draw stroke

brush.bleed(0.2);                          // Enable watercolor bleed
brush.fill(r, g, b, alpha);               // Set fill
brush.fillTexture(0.2, 0.15);             // Add paper grain
brush.circle(x, y, diameter);             // Draw with effects

brush.hatch(density, angle);              // Enable hatching
brush.noHatch();                          // Disable hatching
```

### Coordinate System

p5.brush uses WEBGL mode, so coordinates are centered:
- Origin (0, 0) at canvas center
- X: -width/2 to width/2
- Y: -height/2 to height/2

Molecules store positions in WEBGL coordinates directly.

---

## Physics Modes

### Molecular (Lennard-Jones Potential)

```javascript
// Attractive at medium distance, repulsive at close range
let sigma = 30;    // Zero-force distance
let epsilon = 0.5; // Force strength
let r = dist / sigma;
let force = 24 * epsilon * (2 * pow(r, -13) - pow(r, -7));
```

### Brownian Motion

Same as molecular but with:
- Weaker forces (epsilon = 0.2)
- Stronger random perturbation (±0.8 per axis)

### Flocking (Boids)

Three rules weighted and summed:
1. **Separation**: Steer away from nearby molecules (< 30px)
2. **Alignment**: Match velocity of neighbors (< 80px)
3. **Cohesion**: Steer toward center of neighbors

### Waves

Sinusoidal forces based on position:
```javascript
let waveX = sin(pos.y * 0.02 + frameCount * 0.05 + phase) * 0.3;
let waveY = cos(pos.x * 0.02 + frameCount * 0.03 + phase) * 0.2;
```

### Orbital

Gravitational attraction + tangential velocity:
```javascript
let gravity = normalize(toCenter) * (50 / (dist + 10));
let orbital = normalize(perpendicular(toCenter)) * 0.3;
```

### Magnetic

Color-based attraction/repulsion:
```javascript
let similarity = 1 - colorDifference / 765;
let force = (similarity - 0.5) * 0.5 / dist;
// Similar colors attract, different colors repel
```

### Vortex

Inward spiral:
```javascript
let tangent = perpendicular(toCenter) * 0.5;  // Circular motion
let inward = toCenter * 0.01;                  // Slow pull to center
```

### Explosion

Radial expansion from center:
```javascript
let outward = fromCenter.normalize() * 0.05;
```

---

## PRNG Implementation

### sfc32 (Small Fast Chaotic)

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

- Period: ~2^128
- Quality: Passes PractRand tests
- Speed: Fast enough for real-time

### Hash to Seeds

```javascript
const h = hash.slice(2); // Remove "0x"
const seeds = [
  parseInt(h.slice(0, 8), 16),   // chars 0-7
  parseInt(h.slice(8, 16), 16),  // chars 8-15
  parseInt(h.slice(16, 24), 16), // chars 16-23
  parseInt(h.slice(24, 32), 16)  // chars 24-31
];
```

---

## Performance Considerations

### p5.brush Overhead

p5.brush creates high-quality textures which can be expensive:
- Use `brush.reDraw()` sparingly (every 30 frames)
- Limit molecule count (default 25-60 vs 100+ in original)
- Bleed effect is computationally expensive

### Recommended Limits

| Setting | Recommended | Maximum |
|---------|-------------|---------|
| Molecules | 25-60 | 150 |
| Canvas size | 700px | 1200px |
| Bleed amount | 0.1-0.3 | 0.6 |
| Hatch density | 20-60 | 8 (denser = more lines) |

### Buffer Management

```javascript
// Force buffer update when needed
if (frameCount % 30 === 0) {
  brush.reDraw();
}
```

---

## Molecule Class

```javascript
class Molecule {
  constructor(x, y, col) {
    this.pos = createVector(x, y);      // Current position (WEBGL coords)
    this.prevPos = createVector(x, y);  // Previous frame position
    this.vel = createVector(rx, ry);    // Velocity
    this.acc = createVector(0, 0);      // Acceleration (reset each frame)
    this.baseColor = col;               // RGB array [r, g, b]
    this.size = rnd(2, 6) * variance;   // Radius
    this.mass = this.size * 0.5;        // For force calculations
    this.pigmentDensity = rnd(0.4, 0.9);// Affects alpha
    this.phase = rnd(TWO_PI);           // For wave physics
    this.brushVariant = rndChoice([...]);// Selected brush
  }

  applyForces(others) { /* Physics calculation */ }
  update() { /* Integration + boundary wrapping */ }
  render() {
    this.renderWatercolorStroke();  // Line from prevPos to pos
    this.renderPigmentBlob();       // Bleed circle at pos
  }
}
```

---

## Feature Generation Flow

```javascript
function generateFeatures() {
  R = initRandom(hash);  // Reset PRNG

  // Each feature uses rollRarity() which consumes random values
  // Order matters for determinism!

  1. Palette rarity → palette selection
  2. Density rarity → molecule count
  3. Physics rarity → physics mode
  4. Brush rarity → brush type
  5. Bleed rarity → bleed amount
  6. Hatch rarity → hatch settings
  7. Paper tone (simple choice)
  8. Special effect (8% chance)
  9. Composition (simple choice)
  10. Size variance

  return features;
}
```

---

## Art Blocks Compatibility

The sketch automatically detects Art Blocks environment:

```javascript
// Check for tokenData
if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}

// Export features for Art Blocks
if (typeof tokenData !== "undefined") {
  tokenData.features = {
    "Palette": paletteName,
    "Physics": physicsMode,
    // ... etc
  };
}
```
