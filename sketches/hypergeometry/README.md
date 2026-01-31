# HYPERGEOMETRY

N-dimensional polytope visualization with continuous transformation, morphing, and nested structures.

## Concept

Explore the geometry beyond our 3D perception. This sketch renders polytopes (geometric objects) from 4D, 5D, and 6D space, projecting them down to 3D where we can observe their hypnotic rotations and transformations.

## Features

### Polytopes
- **Hypercube** (N-cube) - The familiar cube extended to N dimensions
- **Simplex** - N-dimensional tetrahedron
- **Cross-Polytope** - N-dimensional octahedron
- **24-Cell** - Unique self-dual 4D polytope
- **120-Cell** - 4D polytope with 120 dodecahedral cells
- **600-Cell** - 4D polytope with 600 tetrahedral cells
- **Clifford Torus** - 4D torus with interesting topology

### Rotations
- **Simple** - Rotation in a single plane (e.g., XW)
- **Compound** - Multiple planes rotating simultaneously
- **Isoclinic** - Clifford rotation, unique to 4D

### Morphing
- **Static** - Pure rotation, no shape change
- **Interpolate** - Smooth blending between two polytopes
- **Nested** - One polytope inside another

### Color Palettes
Cosmic, Glacier, Ember, Void, Aurora, Matrix, Sunset, Ocean

## Controls

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save as PNG |
| Space | Pause/resume animation |
| L | Like current output |
| D | Dislike current output |
| Mouse drag | Rotate camera view |
| Scroll | Zoom in/out |

## Technical

Built with Three.js. All geometry is computed mathematically and projected from N dimensions to 3D using perspective projection.

The randomness is derived from a hash (Art Blocks compatible), making each output deterministic and reproducible.

## Development

Open `index.html` in a browser. Use the sidebar panels to:
- View current features
- Adjust parameters in real-time
- See rarity distributions
- Record feedback for analysis

## Version

1.0.0 - Initial release
