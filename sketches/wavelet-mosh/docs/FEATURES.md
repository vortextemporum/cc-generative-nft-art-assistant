# Features & Rarity System

## Feature Overview

All features are derived deterministically from the hash using sfc32 PRNG.

**v2.0.0**: 10 patterns, 24 wavelets, 24 palettes, 8 decomp levels, 6 speeds

## Pattern Type

The base procedural pattern before wavelet transformation.

| Pattern | Probability | Description |
|---------|-------------|-------------|
| blocks | 12% | Grid of animated blocks with hash-varied timing |
| noise_layers | 12% | Multi-octave FBM noise with RGB separation |
| circles | 12% | Overlapping pulsing rings |
| stripes | 10% | Rotating line intersections |
| voronoi | 10% | Animated Voronoi cells |
| plasma | 10% | Classic plasma effect with sinusoidal mixing |
| checkerboard | 10% | Warped checkerboard with noise |
| radial_burst | 8% | Radial rays and rings |
| gradient_bands | 8% | Horizontal bands with hash-varied colors |
| interference | 8% | Wave interference from multiple sources |

## Wavelet Type

24 transform types - 10 mathematical wavelets + 14 glitch effects.

### Mathematical Wavelets
| Wavelet | Probability | Character |
|---------|-------------|-----------|
| haar | 4.17% | Blocky, pixelated artifacts |
| daubechies2 | 4.17% | Smoother, directional smearing |
| biorthogonal | 4.17% | Sharp block boundaries |
| coiflet | 4.17% | Warped, organic distortion |
| symlet | 4.17% | Radial symmetry effects |
| mexican_hat | 4.17% | Center-weighted distortion |
| morlet | 4.17% | Gaussian-windowed oscillation |
| shannon | 4.17% | Sinc-based banding |
| dct | 4.17% | Block-based DCT artifacts |
| gabor | 4.17% | Multi-directional filtering |

### Glitch Effects
| Effect | Probability | Character |
|--------|-------------|-----------|
| pixel_sort | 4.17% | Brightness-based sorting effect |
| glitch_blocks | 4.17% | Random block displacement |
| scanline | 4.17% | CRT-style scanlines |
| vhs | 4.17% | VHS tracking artifacts |
| chromatic | 4.17% | Color channel separation |
| displacement | 4.17% | Noise-based UV displacement |
| fractal | 4.17% | Mandelbrot-inspired distortion |
| kaleidoscope | 4.17% | Angular symmetry |
| posterize | 4.17% | Color quantization |
| ripple | 4.17% | Radial wave distortion |
| edge_detect | 4.17% | Edge-enhanced output |
| smear | 4.17% | Horizontal streak artifacts |
| tile_shift | 4.17% | Random tile offsetting |
| data_bend | 4.17% | Simulated data corruption |

## Color Palette

24 palettes divided into two categories.

### Hard Transition Palettes (12)
These use hard color steps, similar to neon_glitch.

| Palette | Probability | Colors |
|---------|-------------|--------|
| neon_glitch | 6% | Hard RGB steps |
| binary | 3% | Pure black/white |
| rgb_bars | 4% | RGB color bars |
| cyber_bars | 4% | Cyan/black steps |
| hot_steps | 4% | Orange/red steps |
| electric | 5% | Sharp cyan/magenta/blue |
| matrix | 4% | Green scanline style |
| vapor_bars | 5% | Pink/cyan/purple steps |
| sunset_bands | 4% | Orange to purple bands |
| ice_blocks | 4% | White/cyan blocks |
| fire_steps | 4% | Red/orange/yellow steps |
| toxic | 3% | Green/black toxic look |

### Gradient Palettes (12)
These use smooth color transitions.

| Palette | Probability | Colors |
|---------|-------------|--------|
| thermal | 5% | Heat map (blue→red→yellow) |
| ocean | 5% | Deep blue to cyan |
| vaporwave | 6% | Pink/cyan/purple gradients |
| cyber | 6% | Neon green/electric blue |
| corrupted_film | 5% | Sepia/cream/vintage |
| digital_rot | 4% | Dark greens/browns decay |
| monochrome | 5% | Pure grayscale |
| infrared | 4% | Red/purple thermal |
| neon_rainbow | 5% | Full spectrum neon |
| blood_moon | 3% | Dark red to bright red |
| phosphor | 4% | Green CRT glow |
| synthwave | 4% | Purple/pink/cyan gradient |

## Animation Speed

How fast the glitch evolves over time.

| Speed | Probability | Multiplier | Character |
|-------|-------------|------------|-----------|
| glacial | 10% | 0.15x | Barely perceptible drift |
| slow | 25% | 0.3x | Meditative, subtle drift |
| medium | 30% | 0.7x | Balanced, noticeable motion |
| fast | 20% | 1.2x | Active, dynamic changes |
| chaotic | 10% | 2.0x | Rapid, intense glitching |
| insane | 5% | 3.0x | Extremely fast, frantic |

## Decomposition Levels

How many wavelet transform levels are applied (1-8).

| Levels | Probability | Effect |
|--------|-------------|--------|
| 1 | 20% | Subtle, single-scale artifacts |
| 2 | 25% | Balanced multi-scale |
| 3 | 20% | Complex, layered glitching |
| 4 | 15% | Heavy artifact accumulation |
| 5 | 10% | Very deep decomposition |
| 6 | 5% | Extreme layering |
| 7 | 3% | Near-maximum complexity |
| 8 | 2% | Maximum decomposition |

## Glitch Amount

Intensity of the wavelet effect (10-100%).

| Range | Probability | Effect |
|-------|-------------|--------|
| 10-20% | 10% | Very subtle, textural |
| 20-30% | 15% | Light distortion |
| 30-40% | 20% | Moderate effect |
| 40-50% | 20% | Clearly visible |
| 50-60% | 15% | Strong distortion |
| 60-70% | 10% | Heavy corruption |
| 70-80% | 5% | Severe glitching |
| 80-90% | 3% | Extreme distortion |
| 90%+ | 2% | Maximum intensity |

## Overall Rarity Calculation

Rarity tiers are calculated by summing points:

| Condition | Points |
|-----------|--------|
| Rare pattern (radial_burst, gradient_bands, interference) | +1 |
| Binary or toxic palette | +2 |
| Insane speed | +2 |
| Decomp level 7+ | +2 |
| Glitch amount > 85% | +1 |
| Hard transition palette (any of 12) | +1 |

| Total Points | Rarity Tier |
|--------------|-------------|
| 0-1 | Common |
| 2-3 | Uncommon |
| 4-5 | Rare |
| 6+ | Legendary |

## Probability Estimates

| Tier | Approximate Probability |
|------|------------------------|
| Common | ~45% |
| Uncommon | ~35% |
| Rare | ~15% |
| Legendary | ~5% |

## Sub-Collection Potential

The expanded feature set enables creation of themed sub-collections:

- **Mathematical**: haar, daubechies2, coiflet, symlet wavelets
- **Glitch Art**: pixel_sort, glitch_blocks, vhs, data_bend effects
- **Retro**: scanline, vhs, phosphor, matrix combinations
- **Neon**: neon_glitch, electric, neon_rainbow palettes
- **Organic**: coiflet, morlet, displacement with gradient palettes
- **Minimal**: binary palette, posterize effect, low decomp
- **Chaos**: insane speed, level 8 decomp, high glitch amount
