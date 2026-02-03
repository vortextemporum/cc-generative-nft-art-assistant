# Changelog

All notable changes to ORGANICS will be documented in this file.

## [1.0.0] - 2026-02-03

### Added
- Initial release
- Deformed sphere blob generation using subdivided icosphere
- Multi-octave simplex noise displacement (inspired by 2D bezier blob generator)
- Parameters from original 2D concept: numPoints, radiusRandomness, cpOffsetAngle
- 7 material types: Matte, Glossy, Chrome, Iridescent, Glass, Emissive, Holographic
- 6 distortion types: None, Twist, Taper, Bend, Bulge, Wave
- 5 growth types: None, Spikes, Tendrils, Bumps, Crystals
- 5 boolean operations: None, Sphere Cut, Box Cut, Cylinder Cut, Multi Cut
- 8 procedural color families
- Hash-based sfc32 PRNG for deterministic generation
- Full dev mode UI with parameter sliders
- Like/Dislike feedback system
- Rarity curve visualization
- Orbit controls for camera manipulation
- Studio 3-point lighting

### Technical
- Custom SimplexNoise implementation (inline)
- Three.js IcosahedronGeometry with configurable subdivisions
- Spherical coordinate displacement algorithm
- Noise perturbation for organic wobble effect
