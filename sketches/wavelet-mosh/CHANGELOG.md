# Changelog

All notable changes to wavelet-mosh will be documented in this file.

## [2.0.0] - 2025-01-18

### Added
- **10 Base Patterns**: blocks, noise_layers, circles, stripes, voronoi, plasma, checkerboard, radial_burst, gradient_bands, interference
- **24 Wavelets**: Including haar, daubechies2, biorthogonal, coiflet, symlet, mexican_hat, morlet, shannon, dct, gabor, plus 14 glitch effects (pixel_sort, glitch_blocks, scanline, vhs, chromatic, displacement, fractal, kaleidoscope, posterize, ripple, edge_detect, smear, tile_shift, data_bend)
- **24 Color Palettes**: 12 hard-transition (like neon_glitch) and 12 gradient styles
- **8 Decomposition Levels** (was 4)
- **6 Animation Speeds**: glacial, slow, medium, fast, chaotic, insane
- **Rarity curves data** exposed via getRarityCurves() API
- **Rarity visualization** in UI showing probability distributions
- **Enhanced feedback system** storing complete parameter state with each like/dislike

### Changed
- Improved vaporwave and cyber palettes with better color transitions
- All palettes now categorized as "hard transition" or "gradient" types
- Feedback data now stored as v2 format with full currentState object
- Version number reflects major expansion

## [1.1.0] - 2025-01-18

### Added
- **Slider controls panel** for real-time parameter adjustment
- **Reset button** to return to original hash-derived values
- **Like/Dislike feedback system** with localStorage persistence
- **Feedback statistics** tracking preferred wavelets, palettes, patterns
- **Export to console** for feedback analysis
- Expanded to 12 wavelets (was 4)
- Keyboard shortcuts: L = like, D = dislike

### Changed
- UI layout now shows sliders panel beside canvas
- Hash display shows "modified" state when parameters changed

### Note
Version 1.1.0 was not properly archived to versions folder at time of release.

## [1.0.0] - 2025-01-18

### Added
- Initial release
- Hash-based deterministic feature generation (sfc32 PRNG)
- Four base pattern types: grid, noise, circles, mixed
- Four wavelet transform implementations in GLSL:
  - Haar (fastest, blocky)
  - Daubechies DB2 (4-tap approximation)
  - Biorthogonal (lifting scheme inspired)
  - Coiflet (near-symmetric warping)
- Eight color palettes:
  - Vaporwave, Cyber, Corrupted Film, Digital Rot
  - Neon Glitch, Thermal, Monochrome, RGB Separation
- Multi-level wavelet decomposition (1-4 levels)
- Animated glitch evolution with hash-determined speed
- Rarity system (common/uncommon/rare/legendary)
- Responsive canvas with 2x DPR cap
- Keyboard controls (R/Space/S)
- Art Blocks hash compatibility
- WebGL 1.0 for maximum browser support

### Note
Version 1.0.0 was not properly archived to versions folder at time of release.
