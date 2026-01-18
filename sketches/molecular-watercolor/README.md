# Molecular Watercolor

A hash-based generative art piece combining chaotic molecular physics with traditional watercolor painting aesthetics.

## Preview

Each unique hash generates a different artwork with varying:
- Color palettes (watercolor pigments, ocean, autumn, forest, sunset, monochrome, neon)
- Particle counts and densities
- Physics behaviors (molecular, brownian, flocking, orbital, vortex, etc.)
- Trail lengths and wetness levels
- Paper textures and compositions

## Features

### Physics Simulation
- **Molecular**: Lennard-Jones potential creating realistic particle interactions
- **Brownian**: Random walk motion with subtle forces
- **Flocking**: Boids-like emergent behavior
- **Waves**: Sinusoidal flow patterns
- **Orbital**: Gravitational orbit around center
- **Magnetic**: Color-based attraction/repulsion
- **Vortex**: Spiral convergence (legendary)
- **Explosion**: Outward burst (legendary)

### Watercolor Rendering
- Multi-layer transparent strokes
- Pigment bleeding and color separation
- Cauliflower edge effects
- Paper texture with grain
- Water drops with spreading rings

### Pencil Texture
- Hatching marks overlaid on trails
- Sketchy line quality with wobble
- Variable intensity levels

## Running Locally

```bash
# Simple (may have CORS issues)
open index.html

# Recommended
cd sketches/molecular-watercolor
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Controls

| Key/Button | Action |
|------------|--------|
| **Generate New Hash** | Create new random artwork |
| **Save PNG** | Download current frame |
| `R` | Regenerate with new hash |
| `S` | Save image |

## Art Blocks Compatibility

This sketch is compatible with Art Blocks. It uses:
- `tokenData.hash` for deterministic randomness
- `tokenData.features` for trait display
- `sfc32` PRNG (standard in Art Blocks projects)

## Rarity System

| Tier | Probability | Examples |
|------|-------------|----------|
| Common | ~55-60% | Standard palettes, medium trails |
| Uncommon | ~25-30% | Dense particles, detailed pencil |
| Rare | ~10-15% | Monochrome, swarm density, orbital physics |
| Legendary | ~3-5% | Neon palette, vortex physics, special FX |

## Technical Details

- **Framework**: p5.js 1.9.0
- **Canvas**: 900x900px
- **PRNG**: sfc32 seeded from hash
- **Particle System**: Class-based with trails
- **Rendering**: Layered transparency for watercolor effect

## Version

Current: **v1.0.1**

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT
