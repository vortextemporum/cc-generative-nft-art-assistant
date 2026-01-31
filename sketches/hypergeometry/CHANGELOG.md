# Changelog

All notable changes to HYPERGEOMETRY will be documented in this file.

## [2.2.0] - 2026-01-30

### Added
- **12 New Polytopes** bringing total to 31:
  - Truncated: Truncated Tesseract (64v), Bitruncated Tesseract (96v), Truncated 5-Cell, Cantellated Tesseract
  - Prisms: Tetrahedral Prism, Octahedral Prism, Icosahedral Prism, Cube Antiprism
  - Compounds: Tesseract-16Cell Compound, 2-Tesseract Compound, 5-24Cell Compound
  - Duoprisms: 4,6-Duoprism, 5,8-Duoprism
- **Polytope categories**: regular, truncated, prism, duoprism, torus, compound, other
- **Bloom/glow effect** using Three.js UnrealBloomPass post-processing
  - Toggle with B key or UI switch
  - Per-mint bloom strength and radius parameters
- **Depth cueing** - W-coordinate affects edge opacity and vertex size
  - Toggle with D key or UI switch
  - Provides better 4D depth perception
- **Pulsing/breathing animation** - subtle scale oscillation
  - Toggle with U key or UI switch
  - Configurable pulse speed and amount
- **Tumbling rotation type** - oscillating multi-plane rotation
- **2 new palettes**: Neon and Monochrome

### Changed
- Polytope registry now includes category metadata
- Improved tone mapping for bloom compatibility (Reinhard, exposure 1.5)
- Post-processing pipeline with EffectComposer

### Research Sources
- [Uniform 4-polytope - Wikipedia](https://en.wikipedia.org/wiki/Uniform_4-polytope)
- [Polytope Wiki - Truncated Tesseract](https://polytope.miraheze.org/wiki/Truncated_tesseract)
- [qfbox.info - Bitruncated Tesseract](https://www.qfbox.info/4d/bitrunc8cell)
- [Three.js UnrealBloomPass](https://threejs.org/docs/pages/UnrealBloomPass.html)
- [Compound of tesseract and 16-cell](https://handwiki.org/wiki/Compound_of_tesseract_and_16-cell)

## [2.1.0] - 2026-01-30

### Added
- **Stereographic projection** as alternative to perspective projection
  - Toggle with P key or UI selector
  - Preserves angles, creates curved edge appearance
- **Feature selection UI** - all features now choosable via dropdowns
  - Polytope type, secondary polytope, rotation, morph, CSG, palette
  - Changes apply without full regeneration where possible
- **Extracted rarity system** to `rarity-system.js` for future use
  - Rarity tiers (common/uncommon/rare/legendary)
  - Weighted selection functions
  - Currently unused - sketch uses uniform random

### Changed
- **4D only** - removed 5D/6D support to prevent browser crashes
- **Global display settings** - visibility toggles now persist across regenerations
  - Separate `displaySettings` object from per-mint `features`
  - Toggles no longer reset when changing hash
- **Uniform random selection** - all polytopes equally likely (was rarity-weighted)
- Palette changes now only update colors without regenerating geometry
- `setFeature()` function for efficient individual feature updates

### Fixed
- Toggles resetting on regeneration while UI stayed intact
- Palette selection regenerating entire scene instead of just colors

### Note
Minor version bump - adds features but maintains compatibility with v2.0.x hashes (same random selection now uniform).

## [2.0.1] - 2026-01-30

### Added
- **Visibility toggles** for faces, wireframe, and vertices
  - Toggle switches in UI sidebar
  - Keyboard shortcuts: F (faces), W (wireframe), V (vertices)
- CSG operation fallback - returns primary shape if result is empty

### Fixed
- Empty render bug when CSG operations produce no vertices
  - Adjusted intersection threshold from 0.8 to 1.2
  - Adjusted difference threshold from 0.6 to 0.4
  - Added fallback to primary shape if CSG result has < 3 vertices

## [2.0.0] - 2026-01-30

### Added
- **Face rendering** with semi-transparent solid fills using additive blending
  - Triangular, quad, and pentagon face support
  - W-coordinate based vertex coloring on faces
  - Adjustable face opacity parameter
- **CSG (Boolean) operations**
  - Union: combine two polytopes
  - Intersection: keep overlapping regions
  - Difference: subtract one shape from another
- **New polytopes** (9 new shapes):
  - 3,3-Duoprism (triangular prism product)
  - 4,4-Duoprism (square prism product)
  - 5,5-Duoprism (pentagonal prism product)
  - 6,6-Duoprism (hexagonal prism product)
  - 3,4-Duoprism (mixed)
  - 3,5-Duoprism (mixed)
  - Grand Antiprism (unique 4D uniform polytope)
  - Rectified Tesseract
  - Runcinated Tesseract
- CSG Operation display in features panel

### Changed
- **Rotation speeds reduced 3-5x** for slower, more meditative animation
  - Simple: 0.001-0.004 (was 0.005-0.02)
  - Compound: -0.003 to 0.003 (was -0.015 to 0.015)
  - Isoclinic: 0.001-0.003 (was 0.005-0.015)
- Morph speed reduced to 0.0005-0.002 (was 0.001-0.005)
- Render order: faces (0) → edges (1) → vertices (2) for proper layering
- Clifford torus segments increased to 20 (was 16) for smoother appearance

### Note
Major version bump due to visual output changes - same hash will produce different visuals.

## [1.0.0] - 2026-01-30

### Added
- Initial release
- N-dimensional polytope generation (4D, 5D, 6D)
  - Hypercube (N-cube)
  - Simplex (N-dimensional tetrahedron)
  - Cross-polytope (N-dimensional octahedron)
  - 24-cell (4D only)
  - 120-cell simplified (4D only)
  - 600-cell simplified (4D only)
  - Clifford torus (4D only)
- Three rotation types
  - Simple (single plane)
  - Compound (multiple planes)
  - Isoclinic (Clifford rotation, 4D only)
- Three morphing modes
  - Static (no morphing)
  - Interpolate (vertex blending between shapes)
  - Nested (shape inside shape)
- 8 color palettes
  - Cosmic, Glacier, Ember, Void, Aurora, Matrix, Sunset, Ocean
- Perspective projection from N-D to 3D
- OrbitControls for camera interaction
- Dev mode UI
  - Feature display with rarity badges
  - Parameter sliders (view distance, opacity, morph speed)
  - Palette selector
  - Rarity curve visualization
  - Like/Dislike feedback system with localStorage
- Keyboard shortcuts (R, S, Space, L, D)
- Hash-based sfc32 PRNG for deterministic output
- Art Blocks compatible tokenData.hash support
