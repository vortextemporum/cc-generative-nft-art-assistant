# Exquisite Corpse - AI Assistant Guide

## Overview
Generative art project inspired by the surrealist exquisite corpse game. Each piece seamlessly continues from the previous one via hash-pair edge matching. Monochrome ink aesthetic with mixed techniques.

## Version: 2.1.0

## Architecture

```
sketches/exquisite-corpse/
├── src/
│   ├── engine/
│   │   ├── prng.js            # sfc32 PRNG + utilities
│   │   ├── noise.js           # Seeded 2D Perlin noise + FBM
│   │   ├── render-ink.js      # Ink style: contours, flow, hatching, stipple, wash
│   │   ├── render-circuit.js  # Circuit style: nodes, traces, grids, nebula
│   │   └── styles.js          # Style registry and dispatch
│   ├── components/
│   │   ├── PieceCanvas.jsx  # Single canvas renderer
│   │   ├── Gallery.jsx      # Horizontal scroll gallery
│   │   ├── SingleView.jsx   # Single piece inspector
│   │   └── Controls.jsx     # Chain management UI
│   ├── App.jsx              # Main app with view routing
│   ├── main.jsx             # React entry
│   └── index.css            # Tailwind + custom scrollbar
├── package.json             # Vite + React + Tailwind
├── vite.config.js
├── tailwind.config.js
└── index.html
```

## Core Concepts

### Edge Matching System
- Each hash produces an **edge profile**: 24 anchor points with density, angle, contour value
- `deriveEdgeProfile(hash)` → defines the RIGHT edge of a piece
- Piece rendering takes `(ownHash, leftHash)`:
  - Left edge = `deriveEdgeProfile(leftHash)` (or default if first piece)
  - Right edge = `deriveEdgeProfile(ownHash)`
  - Interior = smooth blend via `smoothstep(x/width)`

### Blended Noise Field
- Two seeded Perlin noise generators (from left and right edge profiles)
- Blended with smoothstep across width
- Interior detail noise adds variation at center, fades to zero at edges
- Field returns: density, angle, noiseVal, contourBase, technique weights

### Drawing Techniques
1. **Contour lines** - Iso-lines of the noise field at multiple thresholds
2. **Flow threads** - Curves following angle + noise gradient
3. **Hatching** - Parallel line groups in tonal areas
4. **Stipple** - Dot patterns with density-driven probability
5. **Ink wash** - Radial gradient soft tonal areas

### Feature System
- `dominantTechnique` - highest-weighted technique
- `density` - sparse/balanced/dense/saturated
- `position` - origin (first) or continuation
- Per-technique weight percentages

## Quick Commands
```bash
npm install    # Install dependencies
npm run dev    # Start dev server
npm run build  # Production build
```

## Key Constants (render.js)
- `SIZE = 1024` - Canvas dimensions
- `NUM_EDGE_ANCHORS = 24` - Edge profile resolution
- `NOISE_SCALE = 0.004` - Base noise frequency
- `PAPER = '#f5f0e8'` - Background color
- `INK = '#1a1612'` - Ink color

## Making Changes
1. Archive current: `cp src/engine/render.js versions/v{VER}-render.js`
2. Make changes
3. Test with `npm run dev`
4. Update CHANGELOG.md
5. Bump version in CLAUDE.md, App.jsx footer, package.json
