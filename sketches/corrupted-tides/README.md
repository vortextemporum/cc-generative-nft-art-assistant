# Corrupted Tides

A generative glitch art piece exploring digital decay through compression artifacts, pseudomath, and data bending.

## Concept

Corrupted Tides captures the moment when digital signals fail—when compression algorithms produce artifacts more beautiful than their intended output, when mathematical formulas break in unexpected ways, and when data bends into new forms.

Each piece is built from:
- **Corrupted flow fields**: Mathematical functions with intentional errors
- **Compression blocks**: JPEG-style macro-blocking as visual language
- **Channel displacement**: RGB separation creating chromatic aberration
- **Data bending**: Values interpreted in wrong contexts

The work features subtle animation—a slow drift and occasional glitch events that remind us this is living decay, not frozen damage.

## Features

| Feature | Description |
|---------|-------------|
| Signal Source | The underlying color palette (13 variants) |
| Corruption Level | Intensity of decay: minimal → catastrophic |
| Palette Corruption | How colors are transformed: quantized, shifted, inverted, rotated |
| Block Size | Compression artifact scale: 4×4 to 32×32 |
| Glitch Type | Primary artifact style: block, scanline, channel, mixed |
| Drift Speed | Animation intensity: still → restless |
| Algorithm | The pseudomath function driving the flow |

## Controls

| Key | Action |
|-----|--------|
| R | Generate new piece |
| S | Save as PNG |
| Space | Pause/resume |
| L / D | Like/Dislike (dev feedback) |

## Running

Open `index.html` in a modern browser, or serve locally:

```bash
npx http-server -p 8080
# Then visit http://localhost:8080
```

## Technical

- **Framework**: p5.js
- **Resolution**: 700×700
- **Randomness**: Hash-based sfc32 PRNG (Art Blocks compatible)

## License

All rights reserved.
