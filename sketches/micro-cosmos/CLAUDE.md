# Micro-Cosmos

## Overview

A multi-scale microscopic ecosystem simulation featuring bacteria, viruses, cells, and molecular structures with realistic interactions. View through adaptive microscopy styles that change with zoom level.

**Version:** 3.2.0
**Framework:** Three.js (v0.160.0)
**Status:** Feature complete - rectangular canvas, balanced populations, spatial distribution by zoom level

## File Structure

```
micro-cosmos/
├── index.html          # Viewer with microscope UI
├── sketch.js           # Main simulation (Three.js)
├── CLAUDE.md           # This file
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation
```

## Key Concepts

### Scale Hierarchy

| Level | Zoom | Contents | Spawn Range |
|-------|------|----------|-------------|
| Macro | 0.5x-2x | Amoebae, paramecia, rotifers | Wide (±160 units) |
| Cellular | 2x-8x | Cells, bacteria, diatoms | Medium (±100 units) |
| Organelle | 8x-25x | Viruses, mitochondria | Tighter (±48 units) |
| Molecular | 25x-60x | DNA, proteins, ATP, ribosomes | Central (±20 units) |
| Atomic | 40x+ | Atoms, water molecules | Tiny (±8 units) |

### Organism Classes

- **Bacteria** - Rod, cocci, spiral, vibrio shapes with flagella
- **Amoeba** - Predators with pseudopod hunting behavior
- **Paramecium** - Cilia-driven movement, oral groove
- **Diatom** - Geometric silica shells (pennate, centric)
- **Virus** - Icosahedral, helical, bacteriophage, corona types
- **Cell** - Eukaryotic with organelles (nucleus, mitochondria, ER, Golgi)
- **Rotifer** - Wheel organ animation, complex body

### Ecosystem Interactions

- Amoebae hunt and engulf bacteria (phagocytosis)
- Viruses seek and attach to cells/bacteria
- Population dynamics with respawning
- Brownian motion at all scales

## Quick Commands

```bash
# Open in browser
open index.html

# Archive current version
cp sketch.js versions/v1.0.0-sketch.js
```

## Controls

| Key | Action |
|-----|--------|
| Scroll | Zoom in/out |
| R | Regenerate with new hash |
| S | Save PNG |
| Space | Pause/resume |
| 1 | 1x zoom (macro) |
| 2 | 4x zoom (cellular) |
| 3 | 15x zoom (organelle) |
| 4 | 40x zoom (molecular) |
| 5 | 80x zoom (atomic) |

## Making Changes

### Before editing:
1. Check current version in CHANGELOG.md
2. Archive if making significant changes: `cp sketch.js versions/vX.Y.Z-sketch.js`
3. Update version number in both files

### Version numbering:
- **Major** (2.0.0): Breaking changes to hash→output mapping
- **Minor** (1.1.0): New features, backward compatible
- **Patch** (1.0.1): Bug fixes, no visual changes

## Glass Palettes

The sketch features 4 distinct color palettes selected by hash:

| Palette | Primary Colors | Glow | Background |
|---------|---------------|------|------------|
| Bioluminescent | Cyan, blue, magenta, pink | Mint | Near black |
| Deep Sea | Blues, teals | Light blue | Dark blue |
| Plasma | Pinks, oranges, yellows | Warm orange | Dark purple |
| Aurora | Greens, lime, teal | Soft green | Dark green |

## Current Limitations

1. **Post-processing** - EffectComposer bloom would enhance the glow (currently using additive blending)
2. **Instanced rendering** - Not yet implemented for bacteria/viruses (would improve performance)
3. **Protein synthesis animation** - Ribosomes visible but not animating mRNA translation
4. **Virus injection** - Viruses attach but don't show genetic injection animation

## Development Priorities

1. Add EffectComposer bloom for true glow post-processing
2. Implement instanced rendering for bacteria/viruses
3. Add protein synthesis animation at ribosomes
4. Add virus injection/lysis animation
5. Performance optimization for very large populations

## Technical Notes

- Uses Three.js OrthographicCamera for 2D-like rendering with zoom
- Organisms have `minZoomVisible` and `maxZoomVisible` for LOD
- sfc32 PRNG for deterministic hash-based randomness
- World size: 400 units, soft boundaries (no wrapping)
- No panning - camera stays centered at origin
- Delta time capped at 0.1s to prevent physics explosions
- Organisms spawn at scale-appropriate distances from center
