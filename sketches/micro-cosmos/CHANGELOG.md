# Changelog

All notable changes to Micro-Cosmos will be documented in this file.

## [3.2.0] - 2026-01-31

### Changed
- **Rectangular Canvas**: Changed from circular to rectangular layout with subtle corner rounding
- **Reduced Macro Population**: Balanced organism counts at lowest zoom level
  - Amoebae: 8 → 4
  - Paramecia: 15 → 8
  - Rotifers: 6 → 3
  - Bacteria: 80 → 50
  - Cells: 12 → 8
- **Spatial Distribution by Scale**: Each zoom level's content now spawns in appropriately sized areas
  - Macro organisms spread across full visible area
  - Cellular-level in medium range
  - Organelles in tighter central area
  - Molecular objects in small central region
  - Atoms/water molecules in tiny central area (visible at 40x+)

### Fixed
- **Atoms Now Visible**: Atoms and water molecules now spawn in small central area (±8 units) so they're visible at high zoom levels
- Atom minZoom lowered from 50 to 40 for earlier visibility
- Water molecule minZoom lowered from 55 to 50

### Technical
- Added scale-appropriate spawn ranges based on zoom visibility calculations
- Updated boundary constraints for atomic objects to keep them in viewable area
- Softer microscope vignette effect for rectangular canvas

## [3.1.0] - 2026-01-31

### Added
- **Fixed Square Canvas**: 800x800 circular viewport centered on page
- **Atomic Scale Level**: New deepest zoom level (60x+) featuring:
  - Individual atoms (C, N, O, H, P, S) with electron orbits
  - Water molecules (H2O) with 104.5° bond angle
  - Animated electrons orbiting nuclei
- **Zoom Level Navigation Buttons**: Clickable buttons for Macro/Cellular/Organelle/Molecular/Atomic
- **Mitochondria Class**: Standalone organelle visible at 8x-30x zoom
- **Scale indicator updates**: Now shows nanometer scale (nm) at atomic level

### Changed
- **No Panning**: Removed mouse drag to pan - zoom only navigation
- **Smaller World Size**: 400 units (down from 2000) - all content in visible area
- **Zoom Scale Hierarchy Adjusted**:
  - Macro: 0.5x-2x (amoebae, paramecia, rotifers)
  - Cellular: 2x-8x (bacteria, diatoms, cells)
  - Organelle: 8x-25x (viruses, mitochondria)
  - Molecular: 25x-60x (DNA, proteins, ATP, ribosomes)
  - Atomic: 60x+ (atoms, water molecules)
- **Soft Boundaries**: Organisms stay within visible area with soft boundary repulsion
- **Starting Zoom**: Now starts at 1x (macro view)

### Technical
- Added `Atom` class with electron orbital animation
- Added `WaterMolecule` class with proper bond geometry
- Added `Mitochondria` class with cristae visualization
- Added `atomicObjects` array for atomic-level entities
- Fixed canvas size at 800x800 pixels with circular mask
- Removed click-to-follow organism functionality

## [3.0.0] - 2026-01-31

### Added
- **Liquid Glass Aesthetics**:
  - Additive blending for all organisms creating luminous, translucent effects
  - `createGlassMaterial()` factory for consistent glass appearance
  - `createGlowMesh()` for pulsing outer glow effects on all organisms
  - 4 glass color palettes: bioluminescent, deepSea, plasma, aurora
- **Dense Populations at Every Zoom Level**:
  - Massively increased organism counts (bacteria: 300, viruses: 200, cells: 40)
  - Background particle systems: MicroParticle (600), NanoParticle (1000), Molecule (1500)
  - Each particle class visible at different zoom ranges for constant visual density
  - Dynamic molecular spawning near camera at high zoom
- **Organic Movement System**:
  - `smoothNoise()` function for organic, flowing movement
  - All organisms affected by ambient noise-based drift
  - More active Brownian motion and faster flagella animation
- **Enhanced Organism Interactions**:
  - More aggressive amoeba hunting (faster, larger range)
  - Increased bacteria division rate and virus seeking behavior
  - Giant amoeba hunts paramecia and rotifers
- **Visual Improvements**:
  - Inner and outer glow meshes on all organisms
  - Pulsing opacity based on individual phase
  - Bezier curve smoothing on amoeba membrane for liquid appearance
  - Crystalline inner glow on diatoms

### Changed
- **Organism Counts**: bacteria 150→300, amoeba 12→18, paramecium 20→35, diatom 35→60, virus 100→200, cell 25→40, rotifer 8→15
- **Zoom Thresholds**: Adjusted for denser content at every level
- **Division Rates**: Faster bacteria fission and cell mitosis
- **Movement**: More active swimming, tumbling, and drift
- **Color System**: Features now include `glassPalette` selection from 4 options

### Technical
- Added `MicroParticle`, `NanoParticle`, `Molecule` classes for background depth
- Glass material factory with additive blending and depth write disabled
- Glow mesh helper function for consistent BackSide outer glow
- `smoothNoise()` for Perlin-like organic movement
- Global `time` variable for coordinated noise animation
- Particles array alongside organisms and molecularObjects

## [2.0.0] - 2026-01-31

### Added
- **Click-to-zoom**: Click any organism to follow it with smooth camera tracking
- **Molecular scale detail**:
  - DNA double helix with rotating animation and colored base pairs
  - Floating proteins with folded domain structures
  - Ribosomes visible inside cells at high zoom
  - All molecular objects visible at 40x+ zoom
- **Cell division (Mitosis)**:
  - Full 4-phase animation: prophase, metaphase, anaphase, telophase
  - Cells elongate, pinch, and spawn daughter cells
  - Cooldown system prevents runaway division
- **Bacteria binary fission**:
  - Elongation and pinch animation
  - Daughter cells spawn with division cooldown
  - Population limits prevent explosion
- **Rare organisms**:
  - Tardigrade ("water bear") with 8 animated legs and cute face
  - Giant Amoeba (2x size, hunts paramecia and rotifers)
  - Spawn in rare/legendary tier ecosystems
- **Floating molecular objects**: DNA helices and proteins drift in the environment
- **Key 5**: Jump to 1000x zoom (molecular level)
- **Escape key**: Stop following selected organism
- **Status notifications**: Visual feedback for actions

### Changed
- Upgraded Three.js to v0.160.0 (required for CapsuleGeometry)
- Increased organism counts (80 bacteria, 60 viruses)
- Maximum zoom increased from 100x to 150x
- Cells now have internal molecular detail (DNA, ribosomes, proteins) visible at high zoom
- Giant amoeba can hunt paramecia and rotifers (not just bacteria)

### Technical
- Added `FloatingDNA` and `FloatingProtein` classes for molecular objects
- Added `Tardigrade` class with walking leg animation
- Cell class now creates molecular detail groups with zoom-based visibility
- Click detection uses distance-based hit testing with `getBoundingRadius()`
- Camera follows selected organism with smooth interpolation

## [1.0.0] - 2026-01-31

### Added
- Initial release of Micro-Cosmos
- Multi-scale zoom system (macro → cellular → organelle → molecular)
- 7 organism types:
  - Bacteria (4 shape variants: rod, cocci, spiral, vibrio)
  - Amoeba with pseudopod hunting behavior
  - Paramecium with animated cilia
  - Diatom with geometric shell patterns
  - Virus (4 types: icosahedral, helical, bacteriophage, corona)
  - Eukaryotic Cell with organelles
  - Rotifer with wheel organ animation
- Adaptive microscopy visual styles based on zoom level
- Ecosystem interactions:
  - Amoeba predation on bacteria
  - Virus attachment to cells
  - Population dynamics with respawning
- Hash-based deterministic randomness (Art Blocks compatible)
- Feature system with rarity tiers
- Responsive UI with microscope aesthetic
- Touch support for mobile devices
- Keyboard controls (R, S, Space, 1-4)
- Save to PNG functionality
- Microscope vignette effect
- Scale bar indicator

### Technical
- Three.js WebGL rendering
- OrthographicCamera for 2D-like zoom
- LOD visibility system per organism
- sfc32 PRNG implementation
- World wrapping at boundaries
