# wavelet-mosh

A hash-driven datamosh piece using GLSL wavelet transforms on procedural patterns.

## Concept

Inspired by image compression artifacts and the GLIC codec library, this piece generates procedural patterns and applies real-time wavelet transforms to create evolving glitch aesthetics. Every aspect is determined by a single hash, making each output unique and deterministic.

## Features

- **Procedural Patterns**: Grid, noise, circles, or mixed compositions
- **Wavelet Transforms**: Haar, Daubechies, Biorthogonal, and Coiflet implementations
- **8 Color Palettes**: From vaporwave to thermal to monochrome
- **Animated Evolution**: Glitch parameters shift over time
- **Fully Hash-Driven**: Deterministic output from any hash

## Quick Start

```bash
# Option 1: Direct file
open index.html

# Option 2: Local server (recommended for shader loading)
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Controls

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| Space | Pause/resume animation |
| S | Save PNG |

## Technical Details

- **Framework**: Pure WebGL 1.0 (no dependencies)
- **Canvas**: 700x700 default, responsive
- **Performance**: Optimized for integrated GPUs, capped at 2x DPR

## Rarity System

| Tier | Probability | Characteristics |
|------|-------------|-----------------|
| Common | 50% | Single pattern, standard palette, normal speed |
| Uncommon | 30% | Some rare features |
| Rare | 15% | Multiple rare features combined |
| Legendary | 5% | Mixed pattern + chaotic speed + high decomp |

## Credits

Wavelet concepts inspired by:
- [GLIC Web Port](https://github.com/GlixStudio/glic-web-port) - Generalized image codec
- Art Blocks / fxhash generative art platforms

## License

MIT
