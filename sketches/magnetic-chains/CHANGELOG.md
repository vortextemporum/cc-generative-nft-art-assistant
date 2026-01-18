# Changelog

All notable changes to Magnetic Chains will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-17

### Added
- Dynamic background color generation based on palette
- Harmonious backgrounds that contrast with particle colors (no more pure black)
- Background uses complementary or analogous hues with soft, muted tones
- Bounding box color now matches palette theme

### Changed
- Body background transitions smoothly when regenerating

## [1.0.0] - 2025-01-17

### Added
- Initial release
- 11 topology generators: circle, helix, trefoil, torus knot, lissajous, wave, chain, random walk, figure-8, tangle, lorenz
- Magnetic dipole physics simulation with spring-connected beads
- 9 bead geometries with different magnetic multipliers
- 10 material presets (magnetic and non-magnetic)
- 10 color palettes with rarity tiers
- Toggleable bounding box for physics containment
- Camera controls: drag rotate, scroll zoom, arrow pan, preset views
- Keyboard shortcuts: R (regenerate), S (save), P (physics), B (box), Space (reset)
- Multi-factor rarity system (topology + geometry + material + palette)
- Dark theme viewer with features table
- Hash-based deterministic generation (Art Blocks compatible)
