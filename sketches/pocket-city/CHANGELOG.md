# Changelog

All notable changes to Pocket City will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-18

### Changed
- Increased tile size from 32x16 to 80x40 (2.5x larger)
- Increased creature scale by 1.5x
- Improved depth sorting algorithm - creatures now properly render in front of/behind buildings based on position
- Enhanced pixel art quality for all 8 creatures with more detail
- Better color palettes for time-of-day lighting
- Improved building window rendering with proper isometric positioning
- Better ground tile rendering with larger coverage

### Fixed
- Creatures no longer render behind buildings incorrectly
- City now fills ~80% of canvas instead of being tiny
- Depth sorting uses combined (gridX + gridY) * 1000 + z for proper layering

## [1.0.0] - 2025-01-18

### Added
- Initial release
- Isometric city block generation with 5 building types
  - Apartment (3-6 floors)
  - Shop (1-2 floors)
  - Tower (5-8 floors)
  - Warehouse (2-3 floors)
  - Temple (2-4 floors, rare)
- 8 procedurally animated pixel art creatures
  - Common: Trash Panda, Neon Pigeon
  - Uncommon: Sewer Slime, Vent Spirit
  - Rare: Rooftop Kitsune, Alley Yokai
  - Legendary: Sky Dragon, Ancient Guardian
- 4 time-of-day variations (dawn, day, dusk, night)
  - Dynamic sky gradients
  - Time-based creature visibility
  - Window lighting at night
  - Neon sign effects
- 6 building color palettes
  - Tokyo Neon, Earthy, Cyberpunk, Pastel Dream, Concrete Jungle, Sunset Strip
- 4 weather effects
  - None, Rain, Fog, Fireflies
- Hash-based deterministic generation (Art Blocks/fxhash compatible)
- Dark theme viewer with feature display
- Keyboard controls (R, S, Space, T)
- Creature compendium in UI
- Complete documentation (CLAUDE.md, FEATURES.md, TECHNICAL.md)

### Technical
- Vanilla JavaScript + Canvas 2D (no dependencies)
- sfc32 PRNG for deterministic randomness
- Depth-sorted isometric rendering
- Pixel-aligned rendering for crisp pixel art
- Animation loop with pause support
