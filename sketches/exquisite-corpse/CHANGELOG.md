# Changelog

## [2.0.0] - 2026-02-23

### Changed
- Complete rewrite of edge matching: narrow constraint-based transition zones (180px) replace full-width blend
- Seam rendering pass with shared seeds: flow threads, contours, hatching, and stipple physically cross piece boundaries
- Both adjacent pieces generate identical marks at their shared boundary via same RNG seed
- Core marks fade out near edges (coreAlpha) so seam marks dominate at boundaries
- Removed per-edge technique weights; all techniques render uniformly across pieces
- Added cross-hatching in dense areas for richer visual texture
- Increased mark counts for denser, more detailed output

### Note
Breaking change: same hash produces different output than v1. Archived v1 render.js.

## [1.0.0] - 2026-02-23

### Added
- Initial release
- Hash-pair edge matching system for pixel-perfect seam continuity
- Five ink techniques: contour lines, flow threads, hatching, stipple, ink wash
- Blended noise field with edge-profile interpolation
- React + Tailwind gallery with horizontal scroll
- Single piece view with feature inspector
- Chain management: add, remove, regenerate pieces
- Merged PNG export (full gallery)
- sfc32 PRNG with hash-based determinism
- Feature generation system with technique weights and density tiers
