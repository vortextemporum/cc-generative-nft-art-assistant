# Feynman Strings v1.8.0 - AI Assistant Guide

## Project Overview

Generative art inspired by **Feynman diagrams** and **string theory**. The piece ranges from technical physics notation to abstract quantum chaos, featuring particle interactions, worldsheets, and vacuum fluctuations.

**Framework:** p5.js
**Current Version:** 1.8.0
**Canvas:** 700x700

## The 10 Physics Modes

| Mode | Full Name | Key Elements |
|------|-----------|--------------|
| **QED** | Quantum Electrodynamics | Photon propagators (wavy), electron lines (straight), vertices, self-energy loops |
| **QCD** | Quantum Chromodynamics | Colored quark lines (RGB), gluon springs (curly), color confinement tubes |
| **String** | String Theory | Vibrating string modes, wave interference, string propagators |
| **Vacuum** | Quantum Vacuum | Virtual particle pairs, quantum foam, uncertainty clouds, Casimir effect |
| **Bubble** | Bubble Chamber | Spiral tracks, V-decays, pair production |
| **SpinNet** | Spin Network | Loop quantum gravity, spin foams, Penrose diagrams |
| **EWeak** | Electroweak | W/Z bosons, Higgs, muon/tau leptons, weak decays |
| **Cosmic** | Cosmic Rays | Particle showers, cascades, Cherenkov rings |
| **Nuclear** | Nuclear Physics | Decay chains, fission/fusion, alpha/beta decay |
| **Topo** | Topological | Anyons, braiding, knot diagrams |

## File Structure

```
feynman-strings/
├── index.html          # Viewer with dev mode UI
├── sketch.js           # Main sketch
├── CLAUDE.md           # This file
├── README.md           # User documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
│   └── .gitkeep
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Implementation details
```

## Color System

### Particle Physics Palette

| Category | Colors | Hex |
|----------|--------|-----|
| **Quarks** | Red, Green, Blue | `#e63946`, `#2a9d8f`, `#457b9d` |
| **Anti-quarks** | Anti-R, Anti-G, Anti-B | `#ff9f9f`, `#d4a5ff`, `#ffd166` |
| **Gluons** | 8 color variations | Array of 8 colors |
| **Leptons** | Electron, Positron, etc. | `#1d3557`, `#a8dadc` |
| **Bosons** | Photon (gold), W/Z, Higgs | `#f1c40f`, `#e17055`, `#fd79a8` |
| **Strings** | String, Worldsheet, Brane | `#74b9ff`, `#81ecec`, `#a29bfe` |

### Background Palettes

- `blackboard` - Dark academia (default)
- `paper` - Light manuscript
- `cosmic` - Deep space
- `blueprint` - Technical drawing

## Key Functions

### Propagators

| Function | Particle Type | Visual |
|----------|---------------|--------|
| `drawFermionLine()` | Electrons, quarks | Straight line with arrow |
| `drawPhotonPropagator()` | Photons | Wavy sine curve |
| `drawGluonPropagator()` | Gluons | Curly/spring coil |
| `drawMassiveBosonPropagator()` | W/Z bosons | Dashed wavy line |
| `drawQuarkLine()` | Colored quarks | Colored line with arrow |
| `drawMuonLine()` | Muons | Thick straight line (1.1x) with arrow |
| `drawTauLine()` | Taus | Thickest straight line (1.3x) with arrow |
| `drawHiggsPropagator()` | Higgs boson | Dashed line (scalar convention) |
| `drawGravitonPropagator()` | Gravitons | Double wavy line (theoretical) |
| `drawNeutrinoFlavored()` | νₑ, νμ, ντ | Dashed + ghostly, flavor-colored |

### Vertices

| Function | Type | Visual |
|----------|------|--------|
| `drawVertex(x, y, "interaction")` | Standard | Filled dot |
| `drawVertex(x, y, "qcd")` | QCD 3-gluon | RGB tri-colored dot |
| `drawVertex(x, y, "decay")` | Decay point | Smaller dot |
| `drawVertex(x, y, "creation")` | Pair creation | Outlined circle |

### String Theory Elements

| Function | Description |
|----------|-------------|
| `drawWorldsheet()` | Open string swept surface |
| `drawClosedStringWorldsheet()` | Closed string torus |
| `drawStringModes()` | Vibration harmonics |
| `drawBraneIntersection()` | D-brane crossing |
| `drawCalabiYau()` | Compactified dimension (rare) |

### Vacuum Elements

| Function | Description |
|----------|-------------|
| `drawQuantumFoam()` | Dense tiny loops |
| `drawVirtualPair()` | Particle-antiparticle bubble |
| `drawUncertaintyCloud()` | Fuzzy position cloud |
| `drawCasimirPlates()` | Casimir effect plates |

### Compositions

| Function | Layout |
|----------|--------|
| `drawCenteredComposition()` | Radial around center |
| `drawScatteredComposition()` | Multiple mini-diagrams |
| `drawFlowingComposition()` | Left-to-right reaction |
| `drawLayeredComposition()` | Overlapping depth layers |
| `drawGridComposition()` | Sol LeWitt style systematic grid |
| `drawRadialComposition()` | Explosion from center |
| `drawCollisionComposition()` | LHC-style beam collision |
| `drawFeynmanDiagramComposition()` | Proper Feynman diagram with external legs |
| `drawDetectorComposition()` | Detector cross-section (tracking/calorimeter/muon) |
| `drawChalkboardComposition()` | Lecture notes grid of diagrams |
| `drawSymmetryBreakingComposition()` | Phase transition ordered→chaotic |

### Annotations

| Function | Description |
|----------|-------------|
| `drawCouplingConstant()` | α, αs, gw at vertices |
| `drawCrossSectionFormula()` | σ = ∫|M|²dΦ for collision/feynman |
| `drawMomentumLabel()` | p₁, k₁ on external legs |
| Loop order labels | tree/1-loop/2-loop on all diagram topologies |

## Feature System

| Feature | Options | Rarity |
|---------|---------|--------|
| **modeBlend** | single / dual / triple / chaos | 40% / 30% / 20% / 10% |
| **density** | minimal / sparse / moderate / dense / chaotic | 20% / 30% / 30% / 15% / 5% |
| **composition** | 15 options: centered, scattered, flowing, layered, grid, radial, collision, feynman, detector, chalkboard, symmetryBreaking, bilateral, radial4, radial6, radial8 | see rarity curves |
| **hasHiggs** | true/false | 5% |
| **hasCalabiYau** | true/false | 3% |
| **hasGraviton** | true/false | 2% |
| **hasSupersymmetry** | true/false | 4% |
| **showLabels** | true/false | 20% |
| **showReactions** | true/false | 25% |
| **showMomentumFlow** | true/false | 10% |
| **showColorFlow** | true/false | 15% |
| **showVertexGlow** | true/false | 40% |

## Quick Commands

```bash
# Open in browser
open index.html

# Local server (recommended for dev)
cd sketches/feynman-strings && python -m http.server 8000
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save PNG |
| A | Toggle particle flow animation |
| L | Like current output |
| D | Dislike current output |

## Making Changes

### Adding a New Particle Type

1. Add color to `COLORS` object
2. Create propagator function `drawNewParticlePropagator()`
3. Add to `getRandomParticleType()` for relevant mode
4. Add to mode's `particles` array in `MODES`

### Adding a New Mode

1. Add mode definition to `MODES` object:
```javascript
newMode: {
  name: "Name",
  fullName: "Full Description",
  description: "What it represents",
  weight: 0.20,
  particles: ["particle1", "particle2"],
  elements: ["element1", "element2"]
}
```

2. Create `drawNewModeElements(vertices, alpha)` function
3. Add case to `drawModeLayer()` switch
4. Add CSS for `.mode-tag.newMode` in index.html

### Adding a New Composition

1. Create `drawNewComposition()` function
2. Add case to `drawScene()` switch
3. Add to `composition` options in features

### Version Numbering

- **Major** (2.0.0): Changes hash→visual mapping (breaking)
- **Minor** (1.1.0): New modes/features (backward compatible)
- **Patch** (1.0.1): Bug fixes, no visual changes

## Physics Accuracy Notes

This is **art inspired by physics**, not a physics simulator:

- Propagator styles are visually distinct but simplified
- Feynman rules (momentum conservation, etc.) not enforced
- Color charge flow is aesthetic, not mathematically correct
- String worldsheets are 2D projections of theoretical surfaces
- Calabi-Yau is a stylized artistic interpretation

## Dev Mode Features

The index.html includes:

1. **Parameter Sliders** - Real-time adjustment of density, line weight, loop probability
2. **Style/Palette/Composition Selects** - Override hash-derived choices
3. **Rarity Curves Display** - Shows probability distributions with current value highlighted
4. **Like/Dislike Feedback** - Stored in localStorage for analysis
5. **Reset Button** - Return to original hash-derived features

## Testing Checklist

- [ ] All 4 modes render correctly
- [ ] Mode blending (dual, triple, chaos) produces variety
- [ ] All 4 compositions work
- [ ] All 4 palettes display properly
- [ ] Special features (Higgs, Calabi-Yau) appear at correct rarity
- [ ] Parameter sliders update rendering
- [ ] Feedback system stores data
- [ ] Like/Dislike keyboard shortcuts work


<claude-mem-context>
# Recent Activity

<!-- This section is auto-generated by claude-mem. Edit content outside the tags. -->

*No recent activity*
</claude-mem-context>