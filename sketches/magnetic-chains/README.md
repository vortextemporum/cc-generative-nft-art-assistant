# Magnetic Chains

3D generative art with magnetic bead physics. Chains of beads form mathematical topologies and respond to simulated magnetic dipole forces.

## Preview

Open `index.html` in a browser to view.

## Features

- **11 Topology Types:** From simple circles to complex Lorenz attractors
- **Magnetic Physics:** Real dipole-dipole force simulation with spring constraints
- **9 Bead Geometries:** Spheres, cubes, octahedra, and more
- **10 Materials:** Ranging from strong neodymium to non-magnetic glass
- **10 Color Palettes:** Each with rarity classification
- **Hash-Based Generation:** Deterministic output from blockchain-compatible hash
- **Bounding Box:** Optional containment to prevent chain overflow

## Controls

| Input | Action |
|-------|--------|
| Drag | Rotate view |
| Scroll | Zoom in/out |
| Arrow Keys | Pan camera |
| 1-5 | Camera presets (front, top, side, isometric, back) |
| R | Regenerate with new hash |
| S | Save PNG image |
| P | Toggle physics simulation |
| B | Toggle bounding box |
| Space | Reset physics |

## Rarity System

Features are selected with weighted probabilities across four tiers:

| Tier | Probability | Examples |
|------|-------------|----------|
| Legendary | ~3% | Lorenz, Tangle, Gold, Glass, Aurora, Void |
| Rare | ~8% | Torus Knot, Figure-8, Cobalt, Copper, Neon |
| Uncommon | ~20% | Trefoil, Lissajous, Neodymium, Chrome, Cosmic |
| Common | ~69% | Circle, Helix, Wave, Iron, Plastic, Sunset |

Overall rarity is computed from the combination of topology, geometry, material, and color palette.

## Technical Details

Built with:
- Three.js for 3D rendering
- Custom magnetic dipole physics engine
- sfc32 PRNG for deterministic randomness

See `docs/TECHNICAL.md` for implementation details.

## License

MIT
