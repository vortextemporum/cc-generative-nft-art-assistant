# HYPERGEOMETRY - AI Assistant Guide

## Project Overview

N-dimensional polytope visualization with morphing, boolean operations, and nested structures. Slow, hypnotic animations that occasionally bend the mind.

**Framework**: Three.js
**Current Version**: 2.2.0

## File Structure

```
hypergeometry/
├── index.html          # Viewer with dev mode UI
├── sketch.js           # Main sketch (Three.js)
├── CLAUDE.md           # This file
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
│   └── .gitkeep
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation
```

## Key Concepts

### N-Dimensional Geometry
- `generateHypercube(n)` - N-dimensional hypercube vertices
- `generateSimplex(n)` - N-dimensional simplex
- `generateCrossPolytope(n)` - N-dimensional orthoplex
- `generate24Cell()` - 4D-only regular polytope
- `generate120CellSimplified()` - 4D 120-cell (simplified)
- `generate600CellSimplified()` - 4D 600-cell (simplified)
- `generateCliffordTorus()` - 4D torus

### Rotation System
- `createPlaneRotation(n, axis1, axis2, angle)` - Rotation matrix for plane
- `createIsoclinicRotation(angle1, angle2)` - 4D Clifford rotation
- `multiplyMatrices(a, b)` - Matrix multiplication
- `applyMatrix(matrix, vector)` - Apply transformation

### Projection Pipeline
- `projectToND(point, targetDim, viewDistances)` - Project N-D to 3D
- Uses perspective projection with configurable view distances

### Morphing System
- `morphShapes(shape1, shape2, t)` - Interpolate between shapes
- Handles different vertex counts by repeating vertices
- Merges edge sets from both shapes

### Features System
- `POLYTOPE_TYPES` - Available polytopes with generators
- `ROTATION_TYPES` - Simple, Compound, Isoclinic
- `MORPH_TYPES` - None, Interpolate, Nested
- `PALETTES` - 8 color palettes

## Quick Commands

```bash
# Open in browser
open index.html

# Archive version before changes
cp sketch.js versions/v1.0.0-sketch.js
```

## Making Changes

### Before Any Modification
1. Read this file completely
2. Read current sketch.js to understand existing code
3. Archive current version: `cp sketch.js versions/v{VERSION}-sketch.js`

### After Changes
1. Update version number in sketch.js comment
2. Update CHANGELOG.md with changes
3. Update this file if structure changed

## Version Numbering

- **Major** (2.0.0): Changes hash→output mapping
- **Minor** (1.1.0): New features, backward compatible
- **Patch** (1.0.1): Bug fixes, no visual changes

## Development Mode Features

### Parameter Adjustment
- View distance slider
- Wire/face opacity sliders
- Morph speed slider
- Palette selector

### Feedback System
- Like/Dislike buttons (L/D keys)
- localStorage persistence
- Export to console

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save PNG |
| Space | Pause/resume animation |
| L | Like current output |
| D | Dislike current output |
| Mouse | Orbit camera control |

## Common Tasks

### Adding a New Polytope
1. Create generator function: `function generateNewPolytope(n) { ... }`
2. Add to `POLYTOPE_TYPES` object
3. Update rarity distribution if needed
4. Test with all dimensions

### Adding a New Palette
1. Add palette object to `PALETTES`
2. Include: name, background, grid, colors array
3. Add key to `PALETTE_NAMES` array

### Adding a New Rotation Type
1. Add to `ROTATION_TYPES`
2. Update rotation speed generation in `generateFeatures()`
3. Test with various polytopes

## Performance Notes

- 600-cell and 120-cell are simplified for performance
- Clifford torus uses 16 segments (configurable)
- OrbitControls has damping enabled
- Pixel ratio capped at 2x
