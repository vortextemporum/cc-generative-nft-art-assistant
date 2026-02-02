# Changelog

All notable changes to Corrupted Harmony will be documented in this file.

## [4.5.0] - 2026-02-02

### Added
- **Building Effects panel** displays which effect each building uses
- Shows noise type for corrupt-effect buildings (voronoi, perlin, worley, etc.)
- Summary counts of each effect type
- getBuildingStats() added to sketchAPI

## [4.4.0] - 2026-02-02

### Changed
- **Corrupt shader now uses SCREEN-SPACE** - patterns stay fixed as camera rotates
- Dramatically increased effect visibility with stronger color shifts
- Larger noise scale (0.02-0.06) for visible patterns

### Noise Effects (all screen-space):
- **voronoi**: Large cellular regions with inverted/tinted cells, bright edge lines
- **perlin**: Smooth organic color bleeding between cyan and magenta
- **worley**: Cracked glass effect with dark/bright crack lines and edge glow
- **value**: Posterized color bands with distinct palette colors
- **ridged**: Glowing orange/yellow circuit veins on darkened background
- **turbulence**: Chaotic data corruption with RGB splitting and block artifacts

## [4.3.1] - 2026-02-02

### Fixed
- Windows no longer extend above building tops
- Added roof margin (1.5 units) to leave room for spires, domes, antennas
- endY now accounts for window height (was only checking center position)
- Skip window generation entirely for buildings too short to fit windows

## [4.3.0] - 2026-02-02

### Changed
- **Complete rewrite of corrupt shader** with 6 noise algorithms replacing the old blocky pixel effect:
  - **voronoi**: Cellular patterns with colored cell edges and inverted centers
  - **perlin**: Smooth gradient noise with organic color shifts
  - **worley**: Crack-like patterns along cell boundaries (F2-F1 distance)
  - **value**: Smooth interpolated noise with stepped color bands
  - **ridged**: Sharp glowing veins using absolute value of noise
  - **turbulence**: Layered FBM noise for chaotic distortion
- Noise patterns now use world-space coordinates (consistent across geometry, moves with camera)
- Larger scale patterns instead of tiny 6x6 pixel blocks
- Each building randomly assigned a noise type for variety

### Added
- NOISE_TYPES constant for corrupt shader selection
- Scale uniform for controlling pattern size (0.008-0.025)
- Height-based noise coordinate variation for vertical interest

## [4.2.0] - 2026-02-02

### Added
- Enhanced voronoi building style with 7 distinct panel types:
  - hexGrid, diamonds, triangles, circles, fins, louvers, mixed
- Diagonal structural bracing lines on voronoi facades
- Corner mullions on voronoi buildings

## [4.1.0] - 2026-02-02

### Added
- Three new Grasshopper/Rhino-inspired parametric building styles:
  - **parametric**: Attractor-influenced floor plates with lofted profiles, panel dividers
  - **twisted**: Turning Torso-style towers with progressive floor rotation, structural cores, edge beams
  - **voronoi**: Buildings with voronoi-pattern facade panels, structural frames
- Parametric canopy and crown elements for new building types

### Fixed
- Fixed grass/park/water alignment with city grid (was shifted from proper positions)
- Corrected road positioning to align with block boundaries
- Fixed ground and cityGroup centering calculations

## [4.0.2] - 2026-02-02

### Fixed
- Removed duplicate canvas rendering (was showing two canvases)
- Removed all post-processing canvas overlay code
- Fixed canvas sizing issues (was showing only quarter of canvas)
- Save now uses renderer canvas directly

### Removed
- All pixel-based post-processing (grain, vignette, etc.)
- Post-processing canvas overlay
- Unused noise2D and DITHER_MODES

## [4.0.1] - 2026-02-02

### Fixed
- Buildings now properly fit within their plot parcels
- Removed heavy global post-processing that caused slowdown and ugly appearance
- Restored per-building shader effects (dither, glitch, corrupt, liquify, stencil)
- Re-enabled antialiasing for cleaner 3D look
- Increased block size for better spacing

### Changed
- Post-processing now only applies subtle film grain and vignette
- Effects are applied per-building via shaders (much faster)
- Post-process interval increased to 200ms for performance

## [4.0.0] - 2026-02-02

### Added
- Pixel-based post-processing effects applied to 3D render:
  - Floyd-Steinberg dithering with error diffusion
  - Bayer matrix dithering (4x4 ordered)
  - Stipple (random threshold) dithering
  - Halftone pattern dithering
  - Liquify effect with displacement and dripping
  - Glitch effect with RGB shift, scanlines, displacement lines
  - Corrupt effect with block artifacts and data mosh streaks
  - Stencil/posterization effect
- Film grain overlay for artsy texture (always applied)
- Vignette effect for depth
- Special features restored: the-anomaly, portal, floating-chunk, time-echo
- Road markings (dashed center lines)
- Enhanced building details: ledges, spires, pinnacles, mullions, domes
- Sky and ground style features (gradient, flat, textured, void)
- Inverted palette option for legendary rarity

### Changed
- Effects now applied via pixel manipulation to rendered canvas (like v1.0.0)
- Post-processing happens at intervals for performance (100ms)
- Disabled antialiasing for crispier pixel effects
- Pixel ratio forced to 1 for authentic pixel aesthetic
- Slower auto-rotation (0.3 speed) for contemplative viewing
- Added post-processing canvas overlay

### Fixed
- Visual output now has handcrafted, artsy feel from v1.0.0
- Combined the best of 3D rotation with 2D pixel effects

## [3.2.0] - 2026-02-01

### Added
- Per-building shader effects (restored from v1.0.0 approach):
  - Dither: Bayer matrix dithering applied per-building
  - Glitch: RGB shift, scanlines, block corruption with unique seed per building
  - Corrupt: Block artifacts, color shifts, data mosh streaks per building
  - Liquify: Wave distortion and drip effects in vertex shader per building
  - Stencil: Posterization to limited color levels per building
  - Noise: Film grain and static lines per building
- Each building gets its own effect material with unique seed
- Animated shader effects (time-based glitch, noise updates)

### Changed
- Removed global post-processing pipeline
- Effects now applied at material level, not screen-space
- Ground positioning fixed to align with buildings and roads

### Fixed
- Ground and building alignment issues
- Parks and water now properly positioned within city grid

## [3.1.0] - 2026-02-01

### Added
- Post-processing shader pipeline (global effects - superseded by v3.2.0)
- Weirdness system in 3D (float, tilt, scale, melt, echo, fragment, invert)

## [3.0.0] - 2026-02-01

### Changed
- Complete rewrite from p5.js to three.js for true 3D rotation
- Orthographic camera with orbit controls for isometric-style viewing

## [2.4.0] - 2026-02-01

### Added
- Restored detailed building styles from v1.0.0:
  - Brutalist: heavy concrete ledges at intervals, rooftop mechanical boxes
  - Deco: 4-tier setbacks with ornate spires and antenna tips
  - Gothic: pointed roofs with corner pinnacles
  - Modernist: glass towers with frame lines and rooftop antennas
  - Retro: bulging sci-fi forms with layered domes
  - Geometric: pyramid/crystal tops
  - Organic: twisted bio-forms with blob tops
- Enhanced weirdness system:
  - Melt effect with direction (down/left/right) and dripping visuals
  - Float effect with detached floating chunks
  - Time-echo with ghost duplicates
  - Scale-shift on building sections
  - Invert for legendary/chaotic rarity

### Fixed
- Ghosting on regenerate (added clear() and buffer cleanup)
- Moved city higher in canvas

## [2.3.0] - 2026-02-01

### Changed
- Removed excessive margins - city now fills the canvas
- Even more zoomed in: 4x4 grid with BLOCK_SIZE 350
- Scale factor increased to 1.15x to fill canvas edge-to-edge
- Adjusted buffer translation for better centering
- Building heights increased to 120-450
- PROP_SCALE increased to 5

## [2.2.0] - 2026-02-01

### Added
- Building outlines with dark edge strokes for better definition
- Roof variations for all architectural styles:
  - Deco: stepped setbacks with central spire
  - Gothic: pointed peaked roof
  - Organic: dome top
  - Brutalist: flat roof with mechanical rooftop structures
  - Modernist: flat roof with antenna
  - Retro: rounded cap top
  - Geometric: pyramid roof

### Changed
- More zoomed-in view (GRID_SIZE 7→5, BLOCK_SIZE 200→280)
- Increased PROP_SCALE to 4 for larger street details
- Larger building render buffers (800x1000)

## [2.1.0] - 2026-02-01

### Changed
- Scaled up city to fill canvas properly (BLOCK_SIZE 60→200, ROAD_WIDTH 12→40)
- Building heights increased to 100-400 (was 30-120)
- Building render buffers increased to 600x800 for larger buildings
- Auto-calculate scale factor to fit city in canvas
- Proportionally scaled all props (trees, lamps, benches, fountains, stalls, etc.)
- Scaled windows, scaffolding, road markings, and block ground details

### Fixed
- City now fills the canvas instead of appearing tiny
- Fixed stall color index out of bounds (0-4 → 0-3)
- Fixed p5.js color+alpha errors with colorAlpha helper
- Fixed canvas not being parented to container

## [2.0.0] - 2026-02-01

### Added
- Full city grid system with 7x7 blocks
- Road network with crosswalks and markings
- Block types: buildings, parks, plazas, markets, construction sites, water/rivers
- Parks with trees, benches, paths, ponds, gazebos
- Plazas with fountains, statues, obelisks, lamp posts
- Markets with colorful stalls
- Construction sites with cranes, scaffolding, debris
- Rivers with bridges and boats
- Street furniture: lamps, trash cans, fire hydrants, mailboxes, street trees
- Time of day feature: day, dusk, night, dawn (affects window lighting)
- Density feature: sparse, normal, dense, packed
- River feature (20% chance)
- 2000x2000 resolution output (displayed at 700x700)

### Changed
- Complete rewrite of city generation system
- Buildings now fill city blocks properly with subdivided plots
- Canvas increased from 700x700 to 2000x2000
- Improved UI with proper layout and loading state
- Effects now applied per-building with individual buffers

### Fixed
- Buildings no longer float in empty space
- Proper depth sorting for all city elements
- UI layout issues resolved

## [1.0.0] - 2026-02-01

### Added
- Initial release
- Isometric city generation with 15-25 buildings
- 7 architectural styles: brutalist, deco, modernist, gothic, retro-futurist, geometric, organic
- 6 visual effects: dither, liquify, stencil, glitch, corrupt, clean
- 4 dithering modes: Floyd-Steinberg, Bayer, stipple, halftone
- Weirdness system: melt, float, scale-shift, time-echo, invert
- 8 color palettes: muted, sepia, cool, warm, twilight, fog, inverted, neonBleed
- Rarity system: common (60%), uncommon (25%), rare (10%), legendary (5%)
- Special features: the-anomaly, portal, floating-chunk, inverted-building
- Sky moods: gradient, flat, textured, void
- Ground styles: solid, reflection, fade, none
- Window generation with patterns: grid, random, vertical-stripe, horizontal-stripe, checker
- Art Blocks / fxhash hash compatibility
- Keyboard controls: R (regenerate), S (save)
- Feature display panel in viewer
- API for programmatic control (window.sketchAPI)
