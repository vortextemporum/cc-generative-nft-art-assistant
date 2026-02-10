# Changelog

All notable changes to Micro-Cosmos II will be documented in this file.

## [2.1.0] - 2026-02-10

### Added — Visual Overlay System

14 real-time visual effects applied via shader uniforms and line geometry:

- **Network overlays**: Connection lines (spatial-hash neighbor links), repulsion web, velocity lines, trails (frame accumulation with fade quad)
- **Shape modes**: Halos (glow ring), soft (gaussian falloff), stars (5-point), rings (hollow circle)
- **Color effects**: Mono (grayscale), rainbow (position-based hue), invert, x-ray (edge-detect inversion)
- **Animation**: Pulse (time-based size oscillation), flicker (random intensity)
- **Sliders**: Size multiplier, connection radius, trail fade strength, hue shift

### Added — Expanded Generative Features (9 dimensions)

- **12 structure archetypes** (up from 4): Cellular, Bacterial, Colonial, Vesicular, Spiral, Lattice, Filament, Swarm, Symbiotic, Nebula, Predator, Mitotic
- **Density** feature: Sparse/Normal/Dense/Packed — multiplies particle counts per layer (0.5x-1.8x)
- **Activity** feature: Dormant/Active/Hyperactive — multiplies simulation speed (0.4x-2.0x)
- **Symmetry** feature: Asymmetric/Mixed/Symmetric — blends matrix[i][j] with matrix[j][i]
- **Interaction** feature: Isolated/Cooperative/Entangled — scales off-diagonal matrix values (0.3x-1.5x)

### Added — 27 Color Palettes

Expanded from 8 to 27 palettes: Bioluminescent, Deep Sea, Ember, Frost, Neon, Mineral, Plasma, Algae, Coral, Fungal, Aurora, Twilight, Poison, Crystal, Lava, Plankton, Spectral, Moss, Copper, Tide Pool, Blood Moon, Electric, Pollen, Obsidian, Abyssal, Prism, Lichen.

### Added — UI Enhancements

- Dev Randomize (D) — regenerate with uniform distribution, no rarity weighting
- Speed slider with fine control
- Fullscreen toggle (F)
- Visual overlay panel with categorized buttons and sliders

### Fixed — Rendering

- Trail accumulation now works (`preserveDrawingBuffer: true`, proper fade camera setup)
- Connection lines visible on dark backgrounds (increased opacity and color multiplier)
- Connection radius slider responsive (increased line cap from 1500 to 8000)
- Shader comma declaration split for WebGL compatibility

### Changed — Layer Tuning

- Retuned particle counts and spawn ranges for better neighbor density (~25-37 neighbors)
- All layers now use 6 types (previously varied 4-6)
- Sketch grew from ~775 to ~1600 lines

## [2.0.0] - 2026-02-09

### Complete Rewrite — Emergent Particle Life

Replaced the physics-heavy mesh organism simulation with a Particle Life system where simple attraction/repulsion rules between particle types create emergent, artistic structures.

### Changed — Philosophy
- **Emergent over designed**: No pre-defined organism shapes; structures emerge from rules
- **Minimal aesthetic**: Just luminous dots with additive blending — beauty is in collective behavior
- **Artistic harmony**: Attraction matrices tuned to produce smooth flowing patterns

### Changed — Architecture
- Rewrote sketch.js from scratch (~775 lines, down from ~1700)
- Removed all mesh-based organisms (Bacteria, Amoeba, Paramecium, Virus, Cell, Diatom, etc.)
- Removed fluid field (Stam Stable Fluids), chemical gradient field, metabolism, binding systems
- Removed Lennard-Jones, Coulomb, Velocity Verlet, bond springs
- Replaced 11-step update pipeline with simple: rebuild grid → compute forces → integrate → wrap

### Added — Particle Life System
- **5 particle layers** at different zoom scales (Macro, Cellular, Organelle, Molecular, Atomic)
- **NxN attraction matrices** per layer: each particle type attracts/repels every other type
- **Bell-shaped force law**: hard-core repulsion at close range, attraction/repulsion at medium range, no effect beyond cutoff
- **Spatial hash grid** per layer for O(n*k) neighbor queries
- **Toroidal wrapping** within each layer's spawn boundaries

### Added — Rendering
- `THREE.Points` with custom `ShaderMaterial` per layer (5 draw calls total)
- Additive blending for glow effect
- Soft circle fragment shader
- Zoom-based opacity fading between layers
- Only visible layers simulated (performance optimization)

### Added — Features
- Color palettes, hash-driven attraction matrices
- Viscosity (Fluid/Balanced/Viscous)
- Force strength (Gentle/Moderate/Intense)
- `window.getFeatures()` for platform integration

### Removed
- Ecosystem stats panel from UI
- All organism behavior classes
- Fluid dynamics, chemical fields, metabolism, binding systems
- Population management (Lotka-Volterra)
- ~925 lines of physics simulation code

## [1.0.0] - 2026-02-09

### Added — Initial physics-based simulation (superseded by v2.0.0)
