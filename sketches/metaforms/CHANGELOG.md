# Changelog

All notable changes to METAFORMS will be documented in this file.

## [1.0.0] - 2026-02-03

### Added
- Initial release
- Metaball field generation with configurable ball count (2-10)
- Marching cubes isosurface extraction (64x64x64 resolution)
- 7 material types: Matte, Glossy, Chrome, Iridescent, Glass, Emissive, Holographic
- 5 aesthetic categories: Sculptural, Organic, Alien, Playful, SciFi
- 6 distortion types: None, Twist, Taper, Bend, Bulge, Wave
- 5 growth types: None, Spikes, Tendrils, Bumps, Crystals
- 5 boolean operations: None, Sphere Cut, Box Cut, Cylinder Cut, Multi Cut
- 8 procedural color families: Warm, Cool, Neon, Earth, Ocean, Void, Fire, Forest
- Hash-based sfc32 PRNG for deterministic generation
- Full dev mode UI with parameter sliders
- Like/Dislike feedback system with localStorage persistence
- Rarity curve visualization
- Orbit controls for camera manipulation
- Studio 3-point lighting setup
- PNG export functionality
- Keyboard shortcuts (R, S, Space, L, D)

### Technical
- Three.js r128 with OrbitControls
- Custom MetaballField class
- Vertex-based distortion modifiers
- Procedural growth geometry (cones, tubes, spheres, octahedra)
- Simulated boolean operations via vertex displacement
