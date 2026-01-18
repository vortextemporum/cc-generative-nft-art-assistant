# Molecular Watercolor - Claude Guide

## Project Overview

A hash-based generative art piece simulating chaotic molecular physics rendered with watercolor aesthetics. Art Blocks compatible.

## File Structure

```
molecular-watercolor/
├── index.html          # Viewer with controls and features table
├── sketch.js           # Main p5.js sketch (current version)
├── CLAUDE.md           # This file - AI assistant guide
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history with changes
├── versions/           # Archived versions
│   └── v1.0.0.js       # Initial release
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation details
```

## Current Version

**v1.0.0** - Initial release

## Key Concepts

### Hash-Based Randomness
- Uses `sfc32` PRNG seeded from 64-char hex hash
- All randomness derived deterministically from hash
- Same hash always produces identical output
- Compatible with Art Blocks `tokenData.hash`

### Feature System
Features are derived from hash with rarity tiers:
- **Common** (~55-60%): Default behaviors
- **Uncommon** (~25-30%): Interesting variations
- **Rare** (~10-15%): Unusual combinations
- **Legendary** (~3-5%): Striking/unique outputs

### Physics Modes
| Mode | Rarity | Behavior |
|------|--------|----------|
| molecular | common | Lennard-Jones potential |
| brownian | common | Random walk + weak forces |
| flocking | uncommon | Boids algorithm |
| waves | uncommon | Sinusoidal motion |
| orbital | rare | Gravitational orbit |
| magnetic | rare | Color-based attraction |
| vortex | legendary | Spiral toward center |
| explosion | legendary | Outward burst |

## Quick Commands

```bash
# Open in browser
open index.html

# Or with local server (recommended)
python3 -m http.server 8000
# Visit http://localhost:8000

# Create new version after changes
cp sketch.js versions/v1.x.x.js
```

## Making Changes

### Before editing sketch.js:
1. Note current version in CHANGELOG.md
2. Document what you're changing and why

### After editing:
1. Bump version number
2. Copy to `versions/vX.X.X.js`
3. Update CHANGELOG.md with:
   - Version number
   - Date
   - Summary of changes
   - Any new features/rarities

### Version Numbering
- **Major** (1.0.0 → 2.0.0): Breaking changes, new physics modes, major visual overhaul
- **Minor** (1.0.0 → 1.1.0): New features, new palettes, new rarities
- **Patch** (1.0.0 → 1.0.1): Bug fixes, performance, UI tweaks

## Common Tasks

### Add a new palette
1. Add to `palettes` object in `generateFeatures()`
2. Add to appropriate rarity tier selection
3. Update FEATURES.md
4. Bump minor version

### Add a new physics mode
1. Add case in `Molecule.applyForces()`
2. Add to `physicsRarity` selection in `generateFeatures()`
3. Update FEATURES.md and TECHNICAL.md
4. Bump minor version

### Adjust rarity percentages
1. Modify `rollRarity()` calls in `generateFeatures()`
2. Document in CHANGELOG.md
3. Bump patch version

### Fix a bug
1. Fix the issue
2. Document in CHANGELOG.md
3. Bump patch version

## Art Blocks Deployment

To deploy on Art Blocks:
1. Minify sketch.js
2. Remove HTML-specific code (`window.onFeaturesGenerated`, etc.)
3. Ensure `tokenData.hash` is used when available
4. Test with Art Blocks testnet

## Testing Hashes

Interesting test hashes:
```javascript
// Legendary palette (neon)
"0x03..."  // ~3% chance

// Sparse molecules
"0x05..."  // ~5% chance

// Try specific seeds
setHash("0x" + "a".repeat(64))  // Deterministic test
```
