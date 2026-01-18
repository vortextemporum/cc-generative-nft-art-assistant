# Magnetic Chains - AI Assistant Guide

## Project Overview

**Magnetic Chains** is a 3D generative art piece featuring chains of magnetic beads that form mathematical topologies and respond to simulated magnetic dipole physics. Built with Three.js, it's a standalone vanilla JS implementation inspired by a React prototype.

**Current Version:** 1.1.0

## File Structure

```
magnetic-chains/
├── index.html          # Viewer with controls and features display
├── sketch.js           # Main sketch (Three.js, physics, generators)
├── CLAUDE.md           # This file
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
│   └── .gitkeep
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation details
```

## Key Concepts

### 1. Hash-Based Randomness
All generative features are derived from a 64-character hex hash using sfc32 PRNG:
- `initRandom(hash)` - Creates seeded PRNG from hash
- `rnd(min, max)` - Random float in range
- `rndInt(min, max)` - Random integer in range
- `rndChoice(arr)` - Random array element
- `rollRarity()` - Weighted rarity selection

### 2. Topology Generators (11 types)
Located in `TOPOLOGY_TYPES` object:
- **Common:** circle, helix, wave, chain
- **Uncommon:** trefoil, lissajous, randomWalk
- **Rare:** torusKnot, figure8
- **Legendary:** tangle, lorenz

Each has: `name`, `rarity`, `generate(n, params, rng)`, `defaultParams`

### 3. Physics Engine (`MagneticPhysics` class)
Simulates magnetic bead chains with:
- Spring forces between adjacent beads (chain cohesion)
- Magnetic dipole-dipole forces (attraction/repulsion)
- Thermal noise (Brownian motion)
- Bounding box constraints (optional)
- Velocity damping and clamping

Key methods:
- `initFromPoints(points)` - Initialize from 3D point array
- `step(dt)` - Advance simulation by timestep
- `getPoints()` / `getOrientations()` - Get current state
- `setBoundingBox(box)` - Enable/disable containment

### 4. Materials & Magnetic Properties
Materials have different magnetic strengths affecting physics:
- **Neodymium (3.0x)** - Strongest
- **Cobalt (2.0x)** - Strong
- **Iron (1.5x)** - Medium
- **Chrome, Ferrite** - Weak
- **Gold, Copper, Glass, Plastic, Rubber** - Non-magnetic (0x)

### 5. Dynamic Background Color
`generateBackgroundColor(paletteColors, rng)` creates harmonious backgrounds:
- Parses primary palette color to HSL
- Shifts hue (complementary ~50% or analogous ~50%)
- Low saturation (0.15-0.45) for soft, muted tones
- Very low lightness (0.05-0.11) - dark but tinted, not pure black
- Special handling for dark palettes (void) and bright palettes
- Result: particles "pop" against harmonious backgrounds

### 6. Feature Generation
`generateFeatures()` selects all visual/physics parameters:
- Topology type and parameters
- Bead geometry (sphere, cube, octahedron, etc.)
- Material (affects both appearance and physics)
- Color palette (10 options with rarities)
- Visual options (gradient, connections, lights)
- Physics parameters (magnetic strength, temperature)

### 6. Rarity System
Multi-factor rarity combining:
- Topology rarity (4 tiers)
- Geometry rarity (3 tiers)
- Material rarity (4 tiers)
- Palette rarity (4 tiers)

Overall rarity calculated from sum of individual scores.

## Controls Reference

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save PNG |
| P | Toggle physics on/off |
| B | Toggle bounding box |
| Space | Reset physics simulation |
| 1-5 | Camera presets |
| Arrows | Pan camera |
| Drag | Rotate view |
| Scroll | Zoom in/out |

## Quick Commands

```bash
# View in browser
open index.html

# Or with local server
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Making Changes

### Adding a New Topology
1. Add entry to `TOPOLOGY_TYPES` object:
```javascript
myTopology: {
  name: 'My Topology',
  rarity: 'uncommon',
  generate: (n, p, rng) => {
    // Return array of [x, y, z] points
    return Array.from({length: n}, (_, i) => [x, y, z]);
  },
  defaultParams: { param1: 1.0 }
}
```
2. Update weight calculations in `generateFeatures()` if needed

### Adding a New Material
1. Add entry to `MATERIAL_PRESETS`:
```javascript
myMaterial: {
  name: 'My Material',
  props: { metalness: 0.8, roughness: 0.3 },
  magnetic: 1.5,  // 0 = non-magnetic
  color: '#aabbcc',
  rarity: 'uncommon'
}
```

### Adding a New Geometry
1. Add entry to `BEAD_GEOMETRIES`:
```javascript
myGeometry: { name: 'My Geometry', magnetic: 1.0, rarity: 'rare' }
```
2. Add case to `createGeometry()` function

### Modifying Physics
Key parameters in `MagneticPhysics`:
- `chainStiffness` - Spring constant (higher = stiffer chain)
- `damping` - Velocity damping (0.9-0.99)
- `temperature` - Thermal noise amplitude
- `dipoleStrength` - Magnetic interaction strength
- `restLength` - Ideal spring length

## Version Numbering

- **Major (X.0.0):** Breaking changes, new features
- **Minor (1.X.0):** New features, backward compatible
- **Patch (1.0.X):** Bug fixes, minor tweaks

When archiving: copy `sketch.js` to `versions/v{version}.js`

## Common Tasks

### Debug Physics
Set low temperature and watch chain settle:
```javascript
physics.temperature = 0;
physics.damping = 0.98;
```

### Test Specific Hash
In browser console:
```javascript
hash = "0x1234567890abcdef...";
regenerate();
```

### Check Feature Distribution
Run multiple times and log:
```javascript
for (let i = 0; i < 100; i++) {
  regenerate();
  console.log(features.topology, features.material, features.overallRarity);
}
```

## Dependencies

- Three.js r128 (loaded via CDN)
- No other external dependencies

## Performance Notes

- Physics simulation runs at ~60fps with up to 120 beads
- Magnetic forces limited to 10-bead range for performance
- Geometry instancing not used (each bead is separate mesh)
- For better performance, could implement InstancedMesh

## Known Limitations

- Non-closed topologies (wave, chain) have free ends
- Lorenz attractor sometimes produces disconnected points at low bead counts
- Random walk can be very spread out depending on seed
