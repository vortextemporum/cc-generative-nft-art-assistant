# Changelog

All notable changes to Feynman Strings will be documented in this file.

## [1.4.0] - 2025-01-31

### Added
- **Advanced physics visualizations**:
  - `drawPenroseDiagram()` - Spacetime causal structure (conformal diagram)
  - `drawSpinFoam()` - 4D evolution of spin networks (quantum gravity)
  - `drawPathIntegralSum()` - Sum over histories visualization
  - `drawVacuumBubble()` - Closed loop vacuum diagrams
  - `drawFeynmanHistory()` - Time-ordered interaction sequences

### Changed
- **QED mode** now includes path integrals and Feynman history graphs
- **Vacuum mode** now includes vacuum bubbles and path integrals
- **Spin Network mode** now includes spin foams and Penrose diagrams
- All Phase 3 elements integrated into appropriate physics modes
- Expanded element arrays in MODES configuration

## [1.3.0] - 2025-01-31

### Added
- **String theory interaction topologies**:
  - `drawPantsDiagram()` - String splitting/joining "pants" topology
  - `drawStringSplitting()` - One string dividing into two
  - `drawStringJoining()` - Two strings merging into one
  - `drawTorusWorldsheet()` - Detailed torus with meridians
  - `drawDBraneAttachment()` - Open strings ending on D-branes

### Changed
- **String mode** now uses expanded element vocabulary
- String composition randomly selects from 6 worldsheet/interaction types
- Added D-brane attachment rendering with multiple attached strings
- Pants diagrams added at higher densities

## [1.2.0] - 2025-01-31

### Added
- **2 new physics modes** (total of 6):
  - **Bubble Chamber**: Particle detector tracks in magnetic field
    - Spiral tracks (charged particles curving)
    - V-decay patterns (neutral particle decays)
    - Pair production (photon → e⁺e⁻)
    - Kink tracks (scattering events)
  - **Spin Network**: Loop quantum gravity visualizations
    - Nodes (quanta of volume with spin labels)
    - Edges (quanta of area connecting nodes)
    - Complete spin network graphs
- **Penguin diagrams** added to QCD mode (CP violation diagrams)
- **Tadpole diagrams** added to QED mode (one-loop vacuum corrections)
- **New drawing primitives**:
  - `drawPenguinDiagram()` - classic CP violation topology
  - `drawTadpoleDiagram()` - vacuum loop correction
  - `drawSpiralTrack()` - charged particle in B-field
  - `drawVDecay()` - neutral particle decay vertex
  - `drawPairProduction()` - γ → e⁺e⁻ conversion
  - `drawKinkTrack()` - track with scattering vertex
  - `drawSpinNetworkNode()` - volume quantum
  - `drawSpinNetworkEdge()` - area quantum
  - `drawSpinNetwork()` - complete graph
  - `drawBubbleChamberTracks()` - composite track region

### Changed
- Mode weights redistributed: QED 22%, QCD 20%, String 18%, Vacuum 15%, Bubble 13%, SpinNet 12%
- QED now includes tadpole diagrams at vertices
- QCD now includes penguin diagrams

## [1.1.0] - 2025-01-31

### Added
- **14 new palettes** (total of 14):
  - Dark: blackboard, cosmic, void, midnight, matrix
  - Light: paper, parchment, minimal, lewitt, lewittColor
  - Colored: blueprint, infrared, plasma, quantum
- **2 new compositions**: Grid (Sol LeWitt style), Radial (explosion from center)
- **2 new styles**: Geometric (systematic), Maximalist (everything at once)
- **Background patterns** (Sol LeWitt inspired): grid, lines, dots, arcs, diagonal
- **Symmetry system**: bilateral, radial4, radial6, radial8
- **Connection density slider** for controlling vertex interconnection
- **Background pattern selector** in dev mode
- `hasBackgroundDiagrams` feature for layered complexity
- `hasOverlappingLayers` feature for extra depth

### Changed
- **Dramatically increased complexity** - more vertices, denser connections
- **Extended density range** from 0.2-1.3 to 0.2-4.0 (up to 3x more dense)
- **Extended loop probability range** from 0-1 to 0-1.5
- **Extended line weight range** from 0.5-5 to 0.5-6
- **Vertex counts** dramatically increased (was 3-15, now 5-40+)
- All compositions now create much more complex diagrams
- `drawPropagatorNetwork` now creates denser, more interconnected graphs
- `drawMiniDiagram` accepts complexity parameter
- Centered composition uses multiple rings of vertices
- Scattered composition connects nearby regions
- Flowing composition supports multiple parallel streams
- Layered composition adds extra random connections for maximalist/chaotic styles

### Fixed
- **R key no longer causes browser zoom/reload** - returns false to prevent default
- Style and composition changes now properly affect rendering
- Palette changes now work correctly with new palette definitions

## [1.0.0] - 2025-01-31

### Added
- Initial release
- **4 Physics Modes**: QED, QCD, String, Vacuum
- **Propagator Types**: Fermion, photon (wavy), gluon (curly), massive boson
- **4 Compositions**: Centered, scattered, flowing, layered
- **4 Palettes**: Blackboard, paper, cosmic, blueprint
- **Rarity System**: Mode blend, density, style, special features
- **Dev Mode**: Parameter sliders, rarity curves, feedback system
- **Special Elements**: Calabi-Yau manifold, quantum foam, Casimir plates
- Hash-based sfc32 PRNG (Art Blocks compatible)
