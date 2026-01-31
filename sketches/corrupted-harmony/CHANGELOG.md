# Changelog

All notable changes to Corrupted Harmony will be documented in this file.

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
