# Corrupted Tides - AI Assistant Guide

## Project Overview

**Corrupted Tides** is a glitch art generative piece that transforms organic flow field aesthetics into digital decay through compression artifacts, pseudomath, and data bending. It is a derivative work with hidden DNA from another oceanic-themed project - the connection should be invisible to outside observers but recognizable to the creator.

**Current Version**: 1.0.0

## File Structure

```
corrupted-tides/
├── index.html          # Viewer with dev mode controls
├── sketch.js           # Main p5.js sketch
├── CLAUDE.md           # This file
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
│   └── .gitkeep
├── shaders/            # GLSL shaders (future)
│   └── .gitkeep
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation
```

## Key Concepts

### The Hidden Inheritance

This project secretly transforms elements from its source material:

| Original Concept | Corrupted Form |
|-----------------|----------------|
| Flow field (sin/cos) | Pseudomath functions with "wrong" formulas |
| Bezier coral clusters | Block clusters with quantized positions |
| Layered compositing | Channel displacement (RGB separation) |
| 13 named palettes | "Signal sources" with corruption filters |
| Organic borders | Blocky corrupted edges |

### Core Systems

1. **Pseudomath Functions** (`PSEUDO_FUNCTIONS` object)
   - `broken-trig`: Wrong trigonometric operations
   - `recursive-error`: Self-referential coordinate errors
   - `modulo-glitch`: Wrapping at wrong intervals
   - `quantized-flow`: Integer truncation stepping
   - `coercion-drift`: Type coercion artifacts

2. **Palette Corruption** (`corruptPalette()`)
   - Quantization (bit depth reduction)
   - Channel shifting (RGB swap/offset)
   - Inversion
   - Hue rotation

3. **Block Clusters** (`BlockCluster` class)
   - Replace bezier curves with rectangular blocks
   - Position quantized to block grid
   - Data bending: sometimes uses "wrong" values for position

4. **Channel Displacement**
   - RGB channels rendered with spatial offset
   - Creates chromatic aberration effect
   - Amplified during glitch events

5. **Animation System**
   - Drift speed controls subtle movement
   - Glitch events: random sudden shifts that decay

### Feature System

Rarity-driving features:
- **corruptionLevel**: minimal (45%) → moderate (30%) → heavy (18%) → catastrophic (7%)
- **driftSpeed**: still (30%) → glacial (35%) → slow (25%) → restless (10%)
- **blockSize**: 4 (15%), 8 (40%), 16 (30%), 32 (15%)

## Quick Commands

```bash
# Open in browser
open index.html

# Or serve locally
npx http-server -p 8080
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save PNG |
| Space | Pause/resume animation |
| L | Like (feedback) |
| D | Dislike (feedback) |

## Making Changes

### Adding a New Pseudomath Function

1. Add to `PSEUDO_FUNCTIONS` object in sketch.js:
```javascript
'new-function': (x, y, t, k1, k2) => ({
  x: /* your broken math */,
  y: /* more broken math */
})
```

2. It will automatically be available in the feature system

### Adding a New Signal Source (Palette)

1. Add to `SIGNAL_SOURCES` object:
```javascript
'signal-name': ["#color1", "#color2", "#color3", "#color4", "#color5"]
```

2. Update `SIGNAL_NAMES` array reference

### Modifying Rarity Distributions

Edit the `rollRarity()` calls in `generateFeatures()` or adjust `RARITY_CURVES` for UI display.

## Version Numbering

- **Major** (2.0.0): Changes that alter hash→output mapping
- **Minor** (1.1.0): New features, backward compatible
- **Patch** (1.0.1): Bug fixes, no visual changes

### Before Making Changes

```bash
# Archive current version
cp sketch.js versions/v1.0.0-sketch.js
```

## Architecture Notes

### Rendering Pipeline

1. Generate features from hash
2. Create corrupted palette from signal source
3. Generate block clusters
4. Per-frame:
   - Clear buffers
   - Draw corrupted flow field (quantized particles)
   - Draw block clusters
   - Draw block artifacts
   - Composite with scanlines
   - Apply channel displacement
   - Draw corrupted border

### Performance Considerations

- Channel displacement is pixel-by-pixel (expensive)
- Flow field draws 500-1000 particles per frame
- Consider reducing particle count for performance mode
- `still` drift mode skips re-rendering (most efficient)

## The Secret

The 13 "Signal Sources" are the exact palettes from the source material, renamed:
- static-white, void-grey, ember-pulse, aqua-signal, sand-drift
- foam-noise, primary-bleed, deep-current, cold-surge, neon-depths
- candy-reef, warm-static, moss-signal

The flow field parameters k1 and k2 use similar ranges to the original.
The cluster count range (12-36) maps to the original's coral range (24-47) halved.
