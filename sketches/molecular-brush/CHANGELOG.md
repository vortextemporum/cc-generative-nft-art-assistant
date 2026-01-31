# Changelog

All notable changes to Molecular Brush will be documented in this file.

## [2.8.1] - 2026-01-26

### Changed
- **Performance optimization**: Reduced `pixelDensity` from 2 to 1 for ~75% faster rendering
- Preview mode now renders at 1x resolution (fast)
- Added explicit `brush.colorCache(true)` for WebGL shader optimization

### Added
- **High-quality export** (`H` key or `exportHQ()` API): Temporarily renders at 2x resolution for crisp PNG export
- New keyboard shortcut: `H` for high-quality export (renders at pixelDensity 2, then saves, then returns to fast mode)

### Technical
- Normal preview: pixelDensity(1) - fast, good for iteration
- HQ export: pixelDensity(2) - slower, but 4x the pixels for print-quality output
- Color caching enabled by default to boost WebGL performance

## [2.8.0] - 2026-01-24

### Added
- **10 New Palettes** with diverse aesthetics:
  - **neonCity** (legendary) - Vibrant magenta, cyan, electric colors for cyberpunk feel
  - **electricDream** (rare) - Bright neon mix of teal, magenta, purple, orange
  - **retroSunset** (rare) - 80s synthwave sunset with coral, peach, pink tones
  - **synthwave** (uncommon) - Softer retro wave colors, purple and pink dominant
  - **desertDusk** (uncommon) - Warm southwestern terracotta, sand, rust
  - **terracotta** (common) - Earthy clay reds and oranges
  - **arcticFrost** (uncommon) - Icy light blues and pale whites
  - **frozenBerry** (rare) - Cool lavender and purple winter tones
  - **midnightGarden** (rare) - Deep jewel tones, dark and moody
  - **jewelBox** (legendary) - Rich saturated jewel colors: ruby, sapphire, emerald

### Changed
- Total palette count: 14 → 24 palettes
- Rebalanced rarity distribution for better gameplay:
  - electricDream: rare → uncommon
  - retroSunset: rare → uncommon
  - synthwave: uncommon → common
  - desertDusk: uncommon → common
  - midnightGarden: rare → legendary
  - jewelBox: legendary → rare
- Final distribution: 2 legendary / 6 rare / 7 uncommon / 9 common

## [2.7.1] - 2026-01-24

### Added
- **Rarity Curves** - Visual distribution bars showing probability of each rarity tier per trait
- **Link to Molecular Watercolor** - Note pointing to v1.x versions in their own project

### Changed
- **Moved v1.x versions** to `/sketches/molecular-watercolor/` (they use 2D canvas, not p5.brush)
- Simplified p5.brush loading (no longer conditional, all v2.x versions need it)
- Frame thickness now based on `Math.min(width, height)` for consistent proportions across aspect ratios
- Canvas now centered in container

### Removed
- v1.x version options from dropdown (see Molecular Watercolor instead)

## [2.7.0] - 2026-01-24

### Added
- **Variable Aspect Ratios** - Each render now has a hash-derived aspect ratio:
  - **Square** (1:1) - common, classic format
  - **Portrait 4:5** - common, Instagram feed
  - **Portrait 3:4** - uncommon, traditional photo
  - **Portrait 2:3** - uncommon, elegant tall format
  - **Story 9:16** - rare, mobile stories format
  - **Landscape 5:4** - common, slight horizontal
  - **Landscape 4:3** - uncommon, classic monitor
  - **Landscape 3:2** - uncommon, DSLR photo format
  - **Cinematic 16:9** - rare, widescreen HD
  - **Ultra-wide 21:9** - legendary, cinematic ultra-wide

- **Batch Export** - Export 20 unique PNGs with one click:
  - Press `B` key or click "Export 20" button
  - Each image gets unique hash and aspect ratio
  - Progress bar shows export status
  - Files named: `molecular-brush-{n}-{aspect}-{hash}.png`

### Technical
- Canvas dimensions calculated from aspect ratio at setup
- Base dimension (700px) applied to longer side
- Shorter side calculated proportionally
- Batch export uses async/await with delays to prevent browser issues
- New exposed APIs: `batchExport()`, `getBatchProgress()`, `isBatchExporting()`

## [2.6.0] - 2026-01-20

### Added
- **Frame feature** - Gallery-quality presentation frames with rarity tiers:
  - **None** (common): Full bleed, no frame
  - **Thin** (common): Minimal 4% margin border
  - **Gallery** (uncommon): Classic 8% frame with 2% inner mat
  - **Museum** (uncommon): 6% frame with wide 4% mat
  - **Floating** (rare): 5% frame with shadow gap effect
  - **Ornate** (rare): Wide 12% frame with decorative corner accents
  - **Dramatic** (legendary): Bold 10% black/charcoal frame
- **9 frame colors** with wood texture support:
  - Plain: white, cream, black, charcoal
  - Textured wood: gold, walnut, oak, natural (with grain and knots)
  - **Palette** (20% chance): Derives frame colors from artwork palette for cohesive look
- **Wood grain texture** - Realistic wood effect for gold/walnut/oak/natural frames:
  - Noise-based wavy grain lines with color variation
  - Random knots/darker spots for authenticity
  - Horizontal grain on top/bottom, vertical on sides
- Frame color automatically selected based on paper tone (warm/cool/aged/bright)
- Inner shadow detail for depth on non-thin frames
- Ornate frames include L-shaped corner decorations

### Technical
- Frame drawn FIRST - artwork renders inside frame, not overlaid
- Molecules, splatters, and compositions constrained to content area
- `getContentBounds()` calculates inner artwork area
- `isInBounds()` respects frame margins
- Proportional margin system (`width * fraction`) for responsive sizing
- `drawWoodGrain()` function for procedural wood texture

## [2.5.0] - 2026-01-20

### Changed
- **Thinner cpencil** - Applied 0.4-0.7 weight multiplier to cpencil brush for cleaner, more delicate strokes
- cpencil now renders noticeably thinner than other brush types

## [1.1.0] - 2026-01-20

### Added
- **Boundary Return Styles** - New trait controls how molecules return when going off-canvas:
  - **Common**: Wrap (instant wrap), Teleport (gap in trail), Fade (fades out then reappears)
  - **Uncommon**: Angle (returns at an angle), Bounce (reflects off edge), Wander (random walk back)
  - **Rare**: Spiral (spirals to target), Retrace (follows trail backwards), Arc (curved bezier path)
  - **Legendary**: Chaotic (each molecule picks its own random style)
- **8 New Physics Modes**:
  - Legendary: Blackhole (strong pull to center), Tornado (outward spiral)
  - Rare: Pulse (periodic expansion/contraction), Gravity (molecules attract each other)
  - Uncommon: Drift (noise-based directional flow), Swirl (multiple rotating centers)
  - Common: Gentle (soft noise movement), Chaos (high-frequency random forces)
- Physics modes expanded from 8 to 16 total options

### Changed
- Return style now displayed in features table

## [2.4.1] - 2026-01-20

### Fixed
- **Gray strokes fix** - Always call `brush.set(brushStyle, col, weight)` before stroke visibility check
- Moved brush.set() outside conditional block to ensure color is always set for the molecule
- v2.4.0 only called brush.set() when strokes were visible, causing color state issues

## [2.4.0] - 2026-01-20

### Added
- **Strokes trait** - Controls visibility of brush stroke lines:
  - Hidden (common): 0-15% visible, very low alpha - mostly blobs only
  - Subtle (uncommon): 20-50% visible, low alpha
  - Visible (rare): 50-80% visible, medium alpha
  - Bold (legendary): 100% visible, high alpha
- **More flow styles**: horizontal, vertical, diagonal, sweep, diverge, ripple, blackhole, tornado
- **More drop options**: Flooded/Drenched/Overflowing, Dripping/Splattered/Pooling, Scattered/Spotted/Dotted, Sparse/Minimal/Delicate
- **Drop size multiplier** - Varies blob sizes based on drop rarity
- **Start blobs** - 50% chance to add blob at path start

### Changed
- Increased drop frequency variety
- More accent drops based on dropFrequency
- Larger end blobs for better visual balance

## [2.3.1] - 2026-01-20

### Fixed
- **Actually fixed gray strokes** - `brush.set(type, color, weight)` must include color as 2nd param
- Previous `brush.stroke(color)` didn't work for `brush.line()` calls

## [2.3.0] - 2026-01-20

### Fixed
- **No more gray stains** - Removed pencil brushes (HB, 2H, 2B, charcoal) that render gray regardless of color
- **Better canvas coverage** - Compositions now spread across more of the canvas:
  - "centered" uses larger radius (50-300px vs 30-200px)
  - "clustered" uses 4 cluster points with larger spread
  - "flowing" now starts from all 4 edges, not just left

### Changed
- Brush types now only include color-respecting brushes: marker, pen, cpencil, spray
- Reduced margin from 100px to 60px for better edge coverage

## [1.0.2] - 2026-01-20

### Fixed
- **No more brightness at top** - Removed SOFT_LIGHT blend mode that caused uneven brightness accumulation over time

## [2.2.0] - 2026-01-20

### Changed
- **Near-instant rendering** - Optimized for speed
- Synchronous render (no async yields)
- Reduced molecule count (25-60 vs 50-250)
- Shorter trails (25-100 vs 40-400)
- Draw every 3rd path point
- Capped simulation steps
- Single layer rendering
- Simplified physics (check 15 nearest neighbors)
- Single bleed blob per molecule
- Fewer splatters

### Kept from v2.1.0
- All 14 nature-inspired palettes
- Accent color system
- 10 flow field styles
- Rich visual variety

## [2.1.0] - 2026-01-20

### Added
- **14 Nature-inspired palettes**: sakura, springMeadow, wildflower, autumnLeaves, goldenHour, oceanDepth, coralReef, deepForest, mossAndStone, twilightSky, cloudySky, rainbowMist, inkWash, vermillion, wisteria
- **Accent colors**: Each palette has a highlight accent color for extra detail
- **Drops feature**: Random watercolor drops along paths with rarity tiers
- **Multi-layer rendering**: 1-3 layers with varying opacity for depth
- **Splatters & spray**: Random accent splatters and spray effects
- **New flow styles**: drift, vortex, explosion added
- **Watercolor bleeds throughout paths**
- **Clustered composition** mode

### Changed
- Richer color system with 6 colors per palette
- Better flow field variety (10 styles total)
- More frequent bleeds and drops

## [2.0.0] - 2026-01-19

### Added
- **Static p5.brush rendering** - Full quality p5.brush output as static image
- **Fidenza-inspired flow fields** - 8 flow styles: linear, gentle, curved, wave, radial, converge, spiral, turbulent
- **Parameter sliders UI** - Interactive control over 7 parameters (molecules, trail, flow, physics, brush, bleed, noise)
- **Version switching** - Dropdown to switch between v2.0.0, v1.0.1, and v1.0.0
- **Progress indicator** - Shows rendering progress during static generation
- **Composition modes** - 4 layout options: full, centered, margins, scattered
- **Paper tone variations** - warm, cool, aged, bright paper backgrounds
- **Enhanced feature system** - Expanded rarity tiers for all features

### Changed
- Complete rewrite for static rendering workflow
- Async rendering with progress callbacks
- Simulation runs first, then paths rendered with p5.brush
- Watercolor blobs at trail endpoints
- Hatching applied along flow paths
- New UI layout with left params panel, center canvas, right features panel

### Note
- Breaking change: v2.0.0 produces static images, not real-time animation
- Use v1.0.1-animated for real-time rendering (faster but no p5.brush quality)

## [1.0.1] - 2026-01-19

### Changed
- Reverted to 2D canvas (removed WEBGL/p5.brush real-time rendering - too slow)
- Uses same performant algorithm as molecular-watercolor
- Added brushStyle feature (Normal/Textured/Heavy/Clean) for rendering variation
- Added pre-generated hatching texture overlay

### Note
- p5.brush WEBGL version was not saved before overwrite (lesson learned)

## [1.0.0] - 2026-01-19

### Added
- Initial release based on molecular-watercolor
- p5.brush integration for natural media rendering
- WEBGL-based canvas for p5.brush compatibility
- 10+ brush types with rarity-based selection
- Watercolor bleed effect system (brush.bleed)
- Paper texture rendering (brush.fillTexture)
- Optional hatching patterns (brush.hatch)
- 8 physics simulation modes from original
- 7 color palettes
- Feature rarity system (common/uncommon/rare/legendary)
- Hash-based deterministic randomness (Art Blocks compatible)
- Keyboard controls (R = regenerate, S = save)
- Dark theme viewer with features table

### Changed (from molecular-watercolor)
- Replaced custom watercolor rendering with p5.brush
- Switched from 2D to WEBGL rendering mode
- Simplified trail system (direct line drawing vs position history)
- Removed water drops (not compatible with p5.brush approach)
- Replaced pencil texture with p5.brush hatching
- Reduced default molecule count for performance
