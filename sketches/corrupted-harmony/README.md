# Corrupted Harmony

An isometric generative cityscape where buildings from different architectural eras and visual realities coexist in dreamlike harmony.

## Concept

Each building in Corrupted Harmony exists in its own visual dimension:
- **Dithered** buildings recall early computer graphics
- **Liquified** structures drip and melt into neighbors
- **Stenciled** facades appear posterized and stark
- **Glitched** towers shimmer with RGB displacement
- **Corrupted** blocks show data artifacts and moshing

Yet despite their different processing, they form a cohesive urban landscape - a city where multiple realities overlap.

## Features

### Rarity Tiers

| Tier | Probability | Characteristics |
|------|-------------|-----------------|
| Common | 60% | Subtle weirdness, muted/fog palette |
| Uncommon | 25% | Moderate chaos, sepia/cool tones |
| Rare | 10% | Chaotic, special features possible |
| Legendary | 5% | Reality collapse, inverted/neon palette |

### Architectural Styles
- Brutalist - Concrete monoliths with ledges
- Art Deco - Stepped towers with spires
- Modernist - Glass curtain walls
- Gothic - Pointed roofs and pinnacles
- Retro-Futurist - Bulging forms with domes
- Geometric - Pure mathematical shapes
- Organic - Biological, grown structures

### Visual Effects
- Dither (Floyd-Steinberg, Bayer, Stipple, Halftone)
- Liquify (Displacement, Dripping)
- Stencil (Posterization)
- Glitch (RGB Shift, Scanlines)
- Corrupt (Block Artifacts, Data Mosh)
- Clean (Untouched reference)

### Weirdness
- Buildings melting into neighbors
- Floating architectural chunks
- Scale anomalies
- Time echoes (ghost overlays)
- Gravity inversions (legendary)

## Controls

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save PNG |

## Technical

- **Framework**: p5.js
- **Resolution**: 700x700
- **Randomness**: sfc32 PRNG seeded from hash
- **Platform**: Art Blocks / fxhash compatible

## Version

1.0.0 - Initial release

## License

CC BY-NC 4.0
