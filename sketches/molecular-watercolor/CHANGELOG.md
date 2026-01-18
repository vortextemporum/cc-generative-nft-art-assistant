# Changelog

All notable changes to Molecular Watercolor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-01-17

### Fixed
- Canvas now properly renders inside `#sketch-holder` container
- Canvas size adapts to container width instead of fixed 900px
- Added `pixelDensity` optimization for retina displays

### Changed
- Complete UI overhaul with cleaner layout
- Flexbox-based responsive design (stacks on mobile)
- CSS custom properties for consistent theming
- Improved panel styling with proper hierarchy
- Smaller, more compact feature table
- Better color contrast for accessibility

---

## [1.0.0] - 2025-01-17

### Added

#### Core Features
- Hash-based deterministic randomness using sfc32 PRNG
- Art Blocks `tokenData.hash` compatibility
- Feature extraction for `tokenData.features`

#### Physics Modes (8 total)
- `molecular` - Lennard-Jones potential (common)
- `brownian` - Random walk motion (common)
- `flocking` - Boids algorithm (uncommon)
- `waves` - Sinusoidal motion (uncommon)
- `orbital` - Gravitational orbit (rare)
- `magnetic` - Color-based forces (rare)
- `vortex` - Spiral convergence (legendary)
- `explosion` - Outward burst (legendary)

#### Palettes (7 total)
- `watercolor` - Classic pigments: Prussian blue, burnt sienna, viridian, yellow ochre, alizarin crimson
- `ocean` - Deep sea, teal, aqua, foam, abyss
- `autumn` - Rust, amber, crimson, umber, gold
- `forest` - Deep forest, moss, fern, pine, bark
- `sunset` - Coral, peach, mauve, plum, apricot
- `monochrome` - Grayscale tones (rare)
- `neon` - Hot pink, mint, purple, yellow, cyan (legendary)

#### Visual Features
- Multi-layer watercolor trail rendering
- Pigment blob with granulation effect
- Paper texture with warm/cool/aged/bright tones
- Colored pencil hatching overlay
- Water drop splatter effects
- Special effects: chromatic aberration, glow, scatter

#### Rarity System
- 4-tier rarity: common, uncommon, rare, legendary
- 10 feature categories with independent rarity rolls
- Configurable probabilities per feature

#### Composition Modes
- `centered` - Particles start near center
- `scattered` - Random distribution
- `diagonal` - Along diagonal axis
- `circular` - Ring formation

#### UI/Viewer
- Responsive HTML viewer
- Live features table with rarity badges
- Color swatches for palette preview
- Hash display
- Generate/Save buttons
- Keyboard shortcuts (R, S)

### Technical
- 900x900 canvas
- p5.js 1.9.0
- Class-based Molecule and WaterDrop systems
- Trail length configurable per rarity
- Wetness evaporation simulation

---

## Version Template

```markdown
## [X.X.X] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing features

### Fixed
- Bug fixes

### Removed
- Removed features

### Technical
- Implementation details
```
