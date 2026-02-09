# Changelog

All notable changes to Feynman Strings will be documented in this file.

## [1.8.0] - 2026-02-09

### Added
- **5 new composition layouts** (total of 11):
  - `drawCollisionComposition()` - LHC-style beam collision with central vertex cluster, outgoing products, and secondary decay branches
  - `drawFeynmanDiagramComposition()` - Proper Feynman diagram with incoming/outgoing external legs and interaction vertex layers
  - `drawDetectorComposition()` - Detector cross-section with concentric rings (tracking, calorimeter, muon chamber)
  - `drawChalkboardComposition()` - Lecture notes grid with mixed diagram types per cell
  - `drawSymmetryBreakingComposition()` - Phase transition visualization from ordered to chaotic across canvas
- **Physics annotations**:
  - `drawCouplingConstant()` - Shows coupling constants (α, αs, gw, g) at vertices when labels enabled
  - `drawCrossSectionFormula()` - Renders "σ = ∫|M|²dΦ" for collision/feynman + technical style
  - `drawMomentumLabel()` - Labels external legs with p₁, p₂... (incoming) and k₁, k₂... (outgoing)
  - Loop order labels on all 10 Feynman diagram topologies (tree, 1-loop, 2-loop, N-loop)
  - VEV notation "⟨H⟩=v" on Higgs vertices when labels enabled

### Changed
- Composition distribution updated for 11 layouts (centered 12%, scattered 12%, flowing 11%, layered 11%, grid 10%, radial 10%, collision 10%, feynman 9%, detector 7%, chalkboard 4%, symmetryBreaking 4%)
- `drawVertex()` now shows coupling constants at interaction/qcd vertices (15% probability when labels on)
- `drawHiggsVertex()` now shows VEV notation when labels enabled
- Dev Random mode and composition dropdown include all 11 compositions
- Rarity curves updated to display 11 composition options

## [1.7.0] - 2026-02-09

### Added
- **New particle propagators**:
  - `drawMuonLine()` - Heavier lepton, thicker line with muon color (#6c5ce7)
  - `drawTauLine()` - Heaviest lepton, thickest line with tau color (#00b894)
  - `drawHiggsPropagator()` - Scalar particle dashed line convention
  - `drawGravitonPropagator()` - Theoretical double wavy line
  - `drawNeutrinoFlavored()` - Flavor-specific neutrino lines (electron/muon/tau colored)
- **Particle label system** (Unicode physics notation):
  - `getParticleLabel()` - Maps particle types to symbols (γ, e⁻, μ⁻, τ⁻, νₑ, W±, Z⁰, H, g, G, q, ψ)
  - `drawPhysicsLabel()` - Renders labels with serif font and background pill
  - `drawPropagatorLabel()` - Labels at propagator midpoints with perpendicular offset
  - Labels appear automatically on all `drawPropagator()` calls when enabled
- **5 reaction diagram functions**:
  - `drawAnnihilationReaction()` - e⁻e⁺ → γγ (QED)
  - `drawBetaDecayReaction()` - n → p + e⁻ + ν̄ₑ (Nuclear, Electroweak)
  - `drawHiggsProductionReaction()` - gg → H → γγ (QCD, Electroweak)
  - `drawPairProductionReaction()` - γ → e⁻e⁺ (QED, Bubble)
  - `drawMuonDecayReaction()` - μ⁻ → e⁻ + ν̄ₑ + νμ (Electroweak)
- **Visual polish effects**:
  - `drawMomentumFlow()` - Chevron indicators along propagator paths
  - `drawColorChargeFlow()` - RGB dots cycling along gluon lines
  - `drawVertexGlow()` - Concentric fading circles behind vertices
  - `drawTimeAxis()` - Dashed vertical arrow labeled "t" for flowing compositions
- **Animation system** (non-deterministic overlay):
  - `FlowParticle` class with colored dot + trail
  - Toggle with `A` key - does NOT affect hash→output mapping
  - 20 flowing particles with randomized colors and trajectories
- **5 new feature flags**:
  - `showLabels` - Particle notation (always on for technical, 15% otherwise)
  - `showReactions` - Reaction diagrams (25% chance)
  - `showMomentumFlow` - Chevrons (technical style, 70% chance)
  - `showColorFlow` - Gluon color dots (technical/geometric, 60% chance)
  - `showVertexGlow` - Vertex glow (not minimal, 40% chance)
- **Dev UI enhancements**:
  - 5 new toggles in Parameters panel (Labels, Reactions, Momentum, Color Flow, Glow)
  - Animation button with active state indicator
  - `A` key shortcut hint
  - Enhancements display in Features panel

### Changed
- `showLabels` feature flag changed from hardcoded `false` to conditional generation
- `drawPropagator()` dispatcher expanded with 8 new particle type cases (muon, tau, higgs, graviton, neutrino, neutrino_e/mu/tau)
- `drawPropagator()` now integrates momentum flow, color charge flow, and label overlays
- `drawVertex()` now renders glow effect for interaction and QCD vertex types
- `getRandomParticleType()` expanded from 4 modes to all 10 modes
- Electroweak mode particles array expanded to include muon and tau
- Labels overlay condition relaxed from requiring technical style
- Dev Random mode now randomizes all 5 new physics enhancement features

## [1.6.0] - 2025-01-31

### Added
- **4 new physics modes** (total of 10):
  - **Electroweak**: Unified electroweak interaction visualizations
    - W/Z boson propagators (dashed wavy lines)
    - Neutrino lines (dashed fermion lines)
    - Higgs vertex coupling
    - Weak decay diagrams (beta decay, etc.)
    - Electroweak mixing patterns
  - **Cosmic**: Cosmic ray and particle shower physics
    - Cosmic ray showers (extensive air shower cascades)
    - Cosmic tracks (high-energy particle trajectories)
    - Hadronic cascades (nuclear interaction showers)
    - EM showers (electromagnetic cascades)
    - Cherenkov rings (faster-than-light-in-medium radiation)
  - **Nuclear**: Nuclear physics reactions and decays
    - Decay chains (radioactive decay sequences)
    - Nuclear shells (energy level structures)
    - Alpha decay (helium nucleus emission)
    - Beta decay (electron/positron emission)
    - Fission events (heavy nucleus splitting)
    - Fusion reactions (light nuclei combining)
  - **Topological**: Topological quantum phenomena
    - Braid patterns (worldline braiding)
    - Anyon exchange (anyonic particle statistics)
    - Knot diagrams (topological invariants)
    - Linking patterns (chain links, Hopf links)
    - Topological defects (vortices, monopoles)

### Changed
- Mode weights redistributed across 10 modes
- UI updated with checkboxes for all 10 modes
- Dev Random mode now includes all 10 physics modes

## [1.5.0] - 2025-01-31

### Added
- **New Feynman diagram topologies**:
  - `drawSunsetDiagram()` - Two-loop self-energy (sunrise/sunset)
  - `drawBoxDiagram()` - Four-point one-loop
  - `drawTriangleDiagram()` - Three-point one-loop
  - `drawLadderDiagram()` - Iterative rung structure
  - `drawSelfEnergyBlob()` - Propagator with blob correction
  - `drawComptonDiagram()` - Photon-electron scattering
  - `drawBremsstrahlungDiagram()` - Radiation emission
  - `drawVertexCorrection()` - Loop correction at vertex
  - `drawCrossedDiagram()` - Exchange/crossing topology
- **Wave-based string visualizations** (replaces worldsheets):
  - `drawVibratingString()` - Standing wave harmonics
  - `drawClosedStringLoop()` - Circular wave pattern
  - `drawStringHarmonics()` - Multiple modes displayed
  - `drawWaveInterference()` - Two waves meeting
  - `drawWavePacket()` - Localized traveling wave
  - `drawStringPropagator()` - Wavy line connecting points

### Changed
- **String mode completely redesigned** - Now uses clean line-based wave visualizations instead of filled worldsheet surfaces
- **QED mode** now includes Compton scattering, bremsstrahlung, sunset, triangle, vertex corrections
- **QCD mode** now includes box diagrams, ladder diagrams, crossed diagrams
- Removed pants diagrams, worldsheets, and other filled surface visualizations from String mode

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
