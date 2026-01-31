# Corrupted Tides - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Hash Input                         │
│                   (tokenData.hash)                      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Feature Generation                     │
│   sfc32 PRNG → All visual parameters derived            │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ Palette  │ │  Flow    │ │  Block   │
   │Corruption│ │  Field   │ │ Clusters │
   └────┬─────┘ └────┬─────┘ └────┬─────┘
        │            │            │
        └────────────┼────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Rendering Pipeline                     │
│                                                         │
│  1. Background (darkest palette color)                  │
│  2. Corrupted flow field (quantized particles)          │
│  3. Block clusters                                      │
│  4. Block artifacts                                     │
│  5. Scanline overlay                                    │
│  6. Channel displacement (RGB separation)               │
│  7. Corrupted border                                    │
└─────────────────────────────────────────────────────────┘
```

## Core Algorithms

### Pseudomath Flow Field

The flow field replaces standard sin/cos operations with intentionally broken formulas:

```javascript
// Normal flow field (what we're corrupting)
normal = {
  x: cos(k1 * y) + sin(k2 * y),
  y: sin(k2 * x) - cos(k1 * x)
}

// Broken-trig (example corruption)
corrupted = {
  x: cos(k1 * y) + sin(k2 * x) * tan(t * 0.01),  // Wrong: x instead of y, added tan
  y: sin(k2 * y) - cos(k1 * x) / (|sin(t)| + 0.1) // Wrong: division, y instead of x
}
```

Each pseudomath function introduces different types of mathematical errors:
- **broken-trig**: Wrong variable substitutions, unexpected operators
- **recursive-error**: Coordinates fed back into themselves
- **modulo-glitch**: Wrapping at dynamic intervals
- **quantized-flow**: Integer truncation mid-calculation
- **coercion-drift**: Bitwise operations on floats

### Palette Corruption

All palettes are derived from the same 13 base palettes, then corrupted:

```javascript
// Quantization (reduce color depth)
quantize(color, bits) {
  levels = 2^bits
  step = 256 / levels
  return floor(color / step) * step + step/2
}

// Channel shift (swap RGB between palette positions)
channelShift(palette, rShift, gShift, bShift) {
  return palette.map((_, i) => {
    r = palette[(i + rShift) % 5].r
    g = palette[(i + gShift) % 5].g
    b = palette[(i + bShift) % 5].b
    return rgb(r, g, b)
  })
}
```

### Block Clusters

Block clusters replace organic bezier curves with quantized rectangles:

```javascript
class BlockCluster {
  constructor(x, y, size) {
    // Generate 8-32 blocks per cluster
    for (i in range(count)) {
      // Position with potential data bending
      if (random() < dataBendIntensity) {
        // Use a "color value" as position (wrong context)
        position = random() * 255
      } else {
        // Normal polar distribution
        position = polar(randomAngle, randomDist)
      }

      // Quantize to block grid
      x = floor(x / blockSize) * blockSize
      y = floor(y / blockSize) * blockSize
    }
  }
}
```

### Channel Displacement

Per-pixel RGB channel separation:

```javascript
for each pixel (x, y):
  // Each channel reads from different position
  r = source[y, x - displacement].r
  g = source[y + displacement*0.2, x].g
  b = source[y, x + displacement].b

  dest[y, x] = rgb(r, g, b)
```

During glitch events, displacement is amplified 3-4x and offset randomly.

### Glitch Events

Probabilistic sudden disturbances:

```javascript
// Each frame, small chance of glitch event
if (random() < glitchEventFreq) {
  glitchEvent = 1.0
  glitchOffset = randomVector(-20, 20) * corruptionIntensity
}

// Decay over time
glitchEvent *= 0.95

// When below threshold, reset
if (glitchEvent < 0.01) {
  glitchEvent = 0
  glitchOffset = (0, 0)
}
```

## Rendering Buffers

| Buffer | Size | Purpose |
|--------|------|---------|
| blockBuffer | 700×700 | Main compositing, block clusters, artifacts |
| flowBuffer | 700×700 | Flow field particles (transparent) |
| main canvas | 700×700 | Final output after channel displacement |

## Performance Characteristics

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Feature generation | O(1) | Once per hash |
| Flow field | O(n) | n = particle count (500-1000) |
| Block clusters | O(c × b) | c = clusters, b = blocks/cluster |
| Channel displacement | O(w × h) | Per-pixel, expensive |
| Total frame | ~50-100ms | Depends on corruption level |

### Optimization Notes

1. **Still drift mode**: Skips re-rendering entirely after initial frame
2. **Glacial drift**: Could reduce particle count
3. **Channel displacement**: Most expensive operation; could use WebGL shader
4. **Block artifacts**: Count scales with corruption intensity

## Hash Determinism

The hash completely determines the output:

```
hash → sfc32 seed → feature values → visual output
```

Same hash always produces identical output (given same code version).

Random calls are made in fixed order:
1. Feature generation (all features)
2. Palette corruption parameters
3. Cluster generation (positions, block properties)
4. Per-frame rendering (flow particles, artifacts)

The per-frame random calls use the same seeded PRNG, ensuring animation is also deterministic.

## Browser Compatibility

- **Required**: ES6, Canvas 2D, requestAnimationFrame
- **Tested**: Chrome 90+, Firefox 88+, Safari 14+
- **Performance**: 60fps on modern hardware for minimal/moderate corruption

## Future Enhancements

### Planned
- [ ] WebGL shader for channel displacement (performance)
- [ ] GLSL post-processing for authentic DCT artifacts
- [ ] High-resolution export mode
- [ ] fxhash compatibility layer

### Potential
- Audio reactivity for glitch events
- VHS-style horizontal tearing
- Interlacing artifacts
- Temporal buffer for motion blur decay
