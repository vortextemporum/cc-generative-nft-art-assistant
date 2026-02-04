# Rayincarnations Fork - Technical Documentation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      sketch.js                          │
├─────────────────────────────────────────────────────────┤
│  PRNG Layer           │  Features Layer                 │
│  ├── sfc32()          │  ├── generateFeatures()         │
│  ├── fxrand           │  └── $fxhashFeatures            │
│  └── rnd/rndInt/etc   │                                 │
├─────────────────────────────────────────────────────────┤
│  Hidden Structure     │  Visible Forms                  │
│  ├── generateHidden() │  ├── generateVisibleForms()     │
│  ├── radial/flow/etc  │  ├── organic/dots/etc           │
│  └── getInfluence()   │  └── applyInteraction()         │
├─────────────────────────────────────────────────────────┤
│  Rendering            │  Utilities                      │
│  ├── renderStructure()│  ├── pointInPolygon()           │
│  ├── renderForms()    │  └── Paper texture              │
│  └── renderTexture()  │                                 │
└─────────────────────────────────────────────────────────┘
```

## Random Number Generation

### fxhash Compatible PRNG

Uses the standard fxhash sfc32 implementation:

```javascript
function sfc32(a, b, c, d) {
  return () => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
```

The hash is parsed using base58 decoding and split into four 32-bit seeds.

## Hidden Structure Algorithms

### Radial Emanation

For each query point (x, y):
1. Calculate distance from each radial center
2. Compute ring position: `ringDist = d % (strength / rings)`
3. Apply sinusoidal influence: `sin(ringDist / spacing * PI)`
4. Return perpendicular vector component

### Flow Field

Uses Perlin noise with configurable scale:
```javascript
const noiseVal = p.noise(x / scale + seed, y / scale);
const angle = noiseVal * TWO_PI * 2;
influence.dx = cos(angle) * strength;
influence.dy = sin(angle) * strength;
```

### Spiral Attractor

```javascript
const angle = atan2(y - center.y, x - center.x);
const spiralAngle = angle + d * tightness * direction;
// Return perpendicular to spiral direction
```

### Grid Influence

Measures minimum distance to nearest grid line:
```javascript
const gx = (x - offset.x) % size;
const gy = (y - offset.y) % size;
const distToLine = min(gx, size - gx, gy, size - gy);
```

## Visible Form Generation

### Organic Blobs

1. Generate N random points around center
2. Apply noise-based radius variation
3. Connect with curve vertices
4. Fill interior with structure-influenced dots

### Tendrils

1. Start at random position
2. Step forward, adjusting angle based on:
   - Structure influence vector
   - Random wandering
3. Store points with influence strength

### Wave Lines

1. Generate horizontal baseline
2. Apply sine wave displacement
3. Add structure-based vertical offset

## Interaction Application

```javascript
switch (mode) {
  case 'distort':
    point.x += influence.dx * factor;
    point.y += influence.dy * factor;
    break;
  case 'attract':
    // Move toward nearest structure point
    break;
  case 'repel':
    point.x -= influence.dx * factor;
    point.y -= influence.dy * factor;
    break;
}
```

## Rendering Pipeline

1. **Clear** - Background color (white/cream/tinted)
2. **Structure Layer** - Subtle hints of hidden patterns
3. **Form Layer** - Main visual elements
4. **Texture Layer** - Paper grain overlay

### Paper Texture

Applies per-pixel noise:
```javascript
canvas.loadPixels();
for (let i = 0; i < pixels.length; i += 4) {
  const grain = random(-amount, amount);
  pixels[i] += grain;     // R
  pixels[i+1] += grain;   // G
  pixels[i+2] += grain;   // B
}
canvas.updatePixels();
```

## Hi-Res Export

1. Calculate new scale based on target size
2. Create temporary high-resolution canvas
3. Re-render all layers at new scale
4. Save and restore original scale

Maximum tested: 20,000 pixels (browser dependent)

## Performance Notes

- Structure influence queried per-point (can be expensive for dense forms)
- Paper texture uses pixel manipulation (slow but essential for aesthetic)
- Complexity setting limits structure element count
- Tendrils pre-calculate full path during generation

## Color Handling

All colors in HSB mode (0-360, 0-100, 0-100, 0-1):
- Monochrome: H=0, S=0
- Sepia: H=tintHue, S=tintSat
- Brightness varies based on structure influence

## Scaling System

Canvas maintains aspect ratio while fitting viewport:
```javascript
scale = min(windowWidth / W, windowHeight / H) * 0.9;
```

All rendering multiplies positions by `scale` for resolution independence.
