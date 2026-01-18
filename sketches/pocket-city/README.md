# Pocket City

An isometric city block generator featuring procedurally generated Pokemon-like creatures. A fusion of city-builder aesthetics and creature collection mechanics.

## Preview

Open `index.html` in a browser to view the sketch.

```bash
open index.html
# or
python3 -m http.server 8000
```

## Concept

Pocket City combines:
- **Isometric city building** - Procedural buildings on an isometric grid
- **Creature collection** - 8 unique Pokemon-inspired creatures with rarity tiers
- **Day/night cycle** - 4 times of day with different lighting and creature visibility
- **Pixel art style** - Retro 8-bit/16-bit aesthetic

### Creature Themes
- **Urban Ecology** - Trash Pandas, Neon Pigeons, Sewer Slimes
- **Mythical Spirits** - Kitsune, Yokai, Dragons, Ancient Guardians

## Controls

| Key | Action |
|-----|--------|
| **R** | Regenerate with new hash |
| **S** | Save as PNG |
| **Space** | Pause/Resume animation |
| **T** | Cycle time of day |

## Features

### Time of Day
- **Dawn** - Pink/purple sky, warm lighting
- **Day** - Bright blue sky, full visibility
- **Dusk** - Orange/red sunset
- **Night** - Dark sky, lit windows, neon signs

### Rarity Tiers
- **Common** - Trash Panda, Neon Pigeon
- **Uncommon** - Sewer Slime, Vent Spirit
- **Rare** (15%) - Rooftop Kitsune, Alley Yokai
- **Legendary** (5%) - Sky Dragon, Ancient Guardian

### Weather Effects
- None, Rain, Fog, Fireflies

### Building Palettes
- Tokyo Neon, Earthy, Cyberpunk, Pastel Dream, Concrete Jungle, Sunset Strip

## Technical

- **Framework**: Vanilla JavaScript + Canvas 2D
- **Dependencies**: None
- **Canvas**: 700x700 pixels
- **Randomness**: sfc32 PRNG, hash-seeded
- **Compatible**: Art Blocks, fxhash

## Files

```
pocket-city/
├── index.html          # Viewer
├── sketch.js           # Main code
├── CLAUDE.md           # AI guide
├── README.md           # This file
├── CHANGELOG.md        # Version history
└── docs/
    ├── FEATURES.md     # Rarity system
    └── TECHNICAL.md    # Implementation
```

## Inspiration

This project was inspired by research from the generative-art-assistant dataset:
- **HexaCity** by Uinges - Isometric urban facades
- **Isometric City Block** by Robert S. Robbins - Grid-based building placement
- **Playtime** by nclslbrn - Extruded isometric blocks
- **Littlecube Villagers** by doogyhatts - Voxel-art characters with pets

## License

MIT License

## Version

1.0.0
