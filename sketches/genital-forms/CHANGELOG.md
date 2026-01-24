# Changelog

## [2.1.0] - 2025-01-24

### Fixed
- **Vulvic form completely redesigned** - Now anatomically accurate with:
  - Proper labia majora (outer lips) with bilateral bulges
  - Labia minora (inner folds) with natural ruffled appearance
  - Clitoral hood at top with proper positioning
  - Vestibule depth and central cleft
  - Natural asymmetry variation
  - Diamond/almond vertical profile
- **Googly eyes improved** - Now smaller, better proportioned, with:
  - Intelligent positioning based on form bounds
  - Cartoon-style highlights for shine
  - Reduced probability (3% instead of 8%)
- **Emoji form expressions improved** - Better proportioned eyes with:
  - 5 expression types (happy, surprised, wink, sleepy, neutral)
  - Blush effect for winking expression
  - Proper highlight dots for cartoon look

## [2.0.0] - 2025-01-24 - Fantasy Variety Edition

### Added
- **6 NEW form types** (12 total!):
  - Dragon's Pride (draconic) - Scaled texture with ridges and knot
  - Kraken's Kiss (tentacular) - Octopus-inspired with suckers
  - Many-Headed Beast (hydra) - Multi-headed branching form
  - Love Knot (knotted) - Pronounced knot at base
  - Xenomorph Delight (alien) - Bio-organic twisted form
  - Happy Ending (emoji) - Humorous face with expressions
- **8 NEW materials** (25 total):
  - Fantasy: Dragon Scale, Deep Sea Purple, Xenomorph Slime, Molten Core, Frost Giant
  - Humorous: Pride Parade (rainbow), 24K Gold Member, Gummy Goodness
  - Natural: Obsidian
- **7 special traits system**:
  - Googly Eyes (8%) - Comical eyes added
  - Glitter Bomb (10%) - Sparkly surface
  - Rainbow Mode (5%) - Full spectrum coloring
  - Extra Veiny (15%) - Pronounced surface veins
  - Ribbed (12%) - Pleasure ridges
  - Glow in Dark (7%) - Luminescent
  - Comically Large (5%) - Oversized scaling
- **Triple Threat composition** (3% chance) - Three forms
- **New backgrounds**: Dungeon Vibes, Deep Sea
- **New render style**: Skin Deep (subsurface approximation)
- Toggle googly eyes with `G` key

### Improved
- **Render quality**: ACES Filmic tone mapping, environment reflections
- **Lighting**: 4-point lighting with shadows, material-specific colored lights
- **Noise functions**: Smooth interpolated noise, Worley/cellular noise for scales
- **Performance**: High-performance WebGL preference, optimized shadow maps
- Humorous feature names throughout

### Changed
- Form/material names now more playful (e.g., "Classic Shaft", "Chrome Stallion")
- Rarity weights rebalanced for new content
- Physics now includes gummyBear material

## [1.0.0] - 2025-01-17

### Added
- Initial release
- 6 form types: phallic, vulvic, intersex, ambiguous, abstract, morphic
- 20 material presets across natural, synthetic, and surreal categories
- 5 render styles: smooth, low-poly, wireframe, faceted, organic
- Soft-body physics simulation with spring-mass system
- Procedural background color generation
- Rare paired composition feature
- Content warning modal
- Full keyboard and mouse/touch controls
