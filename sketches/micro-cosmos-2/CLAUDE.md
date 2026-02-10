# Micro-Cosmos II

## Overview

Emergent Particle Life simulation — simple attraction/repulsion rules between colored particle types create self-organizing structures across 5 zoom scales. No meshes, no predefined shapes. Just luminous dots whose collective behavior produces spinning clusters, flowing chains, orbiting satellites, and pulsing colonies.

**Version:** 2.1.0
**Framework:** Three.js (v0.160.0)

## File Structure

```
micro-cosmos-2/
├── index.html          # Viewer with microscope UI (~660 lines)
├── sketch.js           # Particle Life simulation (~1600 lines)
├── CLAUDE.md           # This file
├── CHANGELOG.md        # Version history
└── versions/           # Archived versions
```

## Architecture

### Core Concept: Particle Life

N particle types, each a colored dot. An NxN attraction matrix defines how each type responds to every other (attract, repel, or ignore). Complex emergent structures self-organize from these simple local rules.

### Force Law

For particle `a` (type `i`) affected by particle `b` (type `j`) at distance `d`:
- `d < rMin`: Hard-core repulsion `F = rMin/d - 1`
- `rMin < d < rMax`: Bell-shaped `F = matrix[i][j] * (1 - |2d - rMin - rMax| / (rMax - rMin))`
- `d > rMax`: No effect

### Multi-Scale Particle Layers

| Layer | Zoom Range | Count | Point Size | Types | Spawn | rMin | rMax |
|-------|-----------|-------|------------|-------|-------|------|------|
| Macro | 0.5x-5x | 600 | 3.5-9px | 6 | ±160 | 3 | 45 |
| Cellular | 2x-15x | 800 | 1.5-4.5px | 6 | ±48 | 1.2 | 10 |
| Organelle | 8x-40x | 500 | 1.2-3px | 6 | ±13 | 0.5 | 4 |
| Molecular | 20x-100x | 300 | 0.8-2px | 6 | ±5 | 0.2 | 1.8 |
| Atomic | 40x-200x | 200 | 0.5-1.5px | 6 | ±1.6 | 0.08 | 0.7 |

**Total: ~2400 base particles** (modified by Density feature). All layers use 6 types.

### Key Classes

- **`SpatialHashGrid`** — O(n) neighbor queries per layer
- **`ParticleLayer`** — owns particles (flat typed arrays), grid, matrix, THREE.Points geometry, connection/repulsion/velocity line geometries
- Each layer has its own attraction matrix, color set, and simulation parameters

### Rendering

- `THREE.Points` with `BufferGeometry` per layer (5 draw calls)
- Custom `ShaderMaterial` with additive blending for glow
- Fragment shader supports multiple shape modes (soft, stars, rings, halos)
- Zoom-based opacity fading between layers
- Only visible layers are simulated and rendered
- Trail accumulation via fade quad with `preserveDrawingBuffer: true`
- Connection/repulsion/velocity `LineSegments` overlays per layer

### Structure Archetypes (12)

Each archetype defines a 6x6 attraction matrix template:

| Archetype | Character |
|-----------|-----------|
| Cellular | Tight clusters with membrane-like boundaries |
| Bacterial | Chain-forming with polar adhesion |
| Colonial | Dense same-type colonies |
| Vesicular | Hollow shell structures |
| Spiral | Rotational flow patterns |
| Lattice | Regular grid-like spacing |
| Filament | Long filamentous chains |
| Swarm | Collective aligned motion |
| Symbiotic | Strong cross-type dependencies |
| Nebula | Diffuse clouds with density waves |
| Predator | Pursuit/evasion dynamics |
| Mitotic | Division-like splitting clusters |

### Hash-Driven Features (9 dimensions)

| Feature | Range | Effect |
|---------|-------|--------|
| Palette | 27 palettes | Color theme for all layers |
| Structure | 12 archetypes | Base attraction matrix template |
| Viscosity | 0.02-0.08 | Fluid / Balanced / Viscous |
| Force | 0.6-1.8 | Gentle / Moderate / Intense |
| Mutation | 0.05-0.25 | Faithful / Varied / Mutant (noise on archetype) |
| Density | 0.5-1.8 | Sparse / Normal / Dense / Packed (particle count multiplier) |
| Activity | 0.4-2.0 | Dormant / Active / Hyperactive (speed multiplier) |
| Symmetry | 0.0-1.0 | Asymmetric / Mixed / Symmetric (matrix symmetrization) |
| Interaction | 0.3-1.5 | Isolated / Cooperative / Entangled (off-diagonal scaling) |

Each layer also gets a unique attraction matrix (archetype + hash variation + symmetry + interaction).

### Visual Overlay System

14 toggle effects + 4 slider adjustments, all applied via shader uniforms or separate geometry:

**Network:** Connections (C), Repulsion Web (W), Velocity Lines (V), Trails (T)
**Shape:** Halos (H), Soft (G), Stars (J), Rings (O)
**Color:** Mono (M), Rainbow (N), Invert (I), X-Ray (X)
**Animation:** Pulse (P), Flicker (K)
**Sliders:** Size multiplier, Connection radius, Trail fade, Hue shift

## Performance

- Spatial hash grid per layer (cell size = rMax)
- Only visible layers simulated (zoom-based culling)
- Flat typed arrays (Float32Array, Uint8Array)
- ~2400 base particles, spatial hash keeps force computation O(n*k) where k ~ neighbors
- Connection line cap at 8000 per layer
- Target: 30+ FPS

## Controls

| Key | Action |
|-----|--------|
| Scroll | Zoom in/out |
| Drag | Pan |
| R | Regenerate with new hash |
| D | Dev randomize (uniform, no rarity) |
| S | Save PNG |
| Space | Pause/resume |
| F | Fullscreen |
| 1-5 | Zoom presets (1x, 4x, 15x, 40x, 120x) |
| C/W/V/T | Toggle connections/repulsion/velocity/trails |
| H/G/J/O | Toggle halos/soft/stars/rings |
| M/N/I/X | Toggle mono/rainbow/invert/xray |
| P/K | Toggle pulse/flicker |


<claude-mem-context>
# Recent Activity

<!-- This section is auto-generated by claude-mem. Edit content outside the tags. -->

*No recent activity*
</claude-mem-context>
