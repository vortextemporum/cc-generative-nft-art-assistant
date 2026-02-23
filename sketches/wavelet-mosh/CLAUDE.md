# wavelet-mosh - AI Assistant Guide

## Project Overview

A hash-driven datamosh piece using GLSL wavelet transforms on procedural patterns. Inspired by the GLIC codec library, it implements simplified wavelet transforms and glitch effects in WebGL shaders for real-time animated outputs.

**Current Version**: 2.0.0

## v2.0.0 Expansion

- **10 Base Patterns**: blocks, noise_layers, circles, stripes, voronoi, plasma, checkerboard, radial_burst, gradient_bands, interference
- **24 Wavelets**: 10 mathematical (haar, daubechies2, etc.) + 14 glitch effects (pixel_sort, vhs, data_bend, etc.)
- **24 Color Palettes**: 12 hard-transition (like neon_glitch) + 12 gradient styles
- **8 Decomposition Levels** (was 4)
- **6 Animation Speeds**: glacial, slow, medium, fast, chaotic, insane
- **Rarity curves visualization** in UI
- **Sub-collection potential** for themed drops

## File Structure

```
wavelet-mosh/
├── index.html          # Viewer with controls + rarity curves
├── sketch.js           # WebGL setup, hash/features, API
├── shaders/
│   ├── wavelet.vert    # Vertex shader (passthrough)
│   └── wavelet.frag    # Fragment shader (all effects)
├── CLAUDE.md           # This file
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
│   └── v2.0.0-sketch.js
└── docs/
    ├── FEATURES.md     # Feature/rarity docs
    └── TECHNICAL.md    # Technical details
```

## Key Concepts

### Hash-Based Determinism
- All features derived from 64-char hex hash
- Uses sfc32 PRNG seeded from hash
- Art Blocks compatible (`tokenData.hash`)

### Feature System
| Feature | Range | Count |
|---------|-------|-------|
| Pattern | 0-9 | 10 types |
| Wavelet | 0-23 | 24 types |
| Palette | 0-23 | 24 palettes |
| Speed | 6 levels | glacial → insane |
| Decomp Levels | 1-8 | 8 levels |
| Glitch Amount | 10-100% | continuous |

### Wavelet Categories

**Mathematical (0-9)**:
haar, daubechies2, biorthogonal, coiflet, symlet, mexican_hat, morlet, shannon, dct, gabor

**Glitch Effects (10-23)**:
pixel_sort, glitch_blocks, scanline, vhs, chromatic, displacement, fractal, kaleidoscope, posterize, ripple, edge_detect, smear, tile_shift, data_bend

### Palette Categories

**Hard Transition (0-11)**:
neon_glitch, binary, rgb_bars, cyber_bars, hot_steps, electric, matrix, vapor_bars, sunset_bands, ice_blocks, fire_steps, toxic

**Gradient (12-23)**:
thermal, ocean, vaporwave, cyber, corrupted_film, digital_rot, monochrome, infrared, neon_rainbow, blood_moon, phosphor, synthwave

## Quick Commands

```bash
# Open in browser
open index.html

# Or with local server (recommended)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Controls

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| Space | Pause/resume animation |
| S | Save PNG |
| L | Like current output |
| D | Dislike current output |

## API (window.WaveletMosh)

```javascript
// Setup - returns features
await WaveletMosh.setup(container, size);

// Regenerate with new hash
WaveletMosh.regenerate();

// Toggle pause
WaveletMosh.togglePause();

// Save image
WaveletMosh.save(filename);

// Resize canvas
WaveletMosh.resize(newSize);

// Get/set hash
WaveletMosh.getHash();
WaveletMosh.setHash("0x...");

// Get/set features
WaveletMosh.getFeatures();
WaveletMosh.setParameter(name, value);
WaveletMosh.resetToOriginal();
WaveletMosh.hasModifications();

// Feedback system
WaveletMosh.recordFeedback(isLike);
WaveletMosh.getFeedbackStats();
WaveletMosh.exportFeedback();
WaveletMosh.clearFeedback();

// Constants
WaveletMosh.getConstants();
WaveletMosh.getRarityCurves();
```

## Making Changes

### Modifying Visuals
1. Edit `shaders/wavelet.frag`
2. Patterns: `pattern0` through `pattern9`
3. Wavelets: `wav0` through `wav23`
4. Palettes: `pal0` through `pal23`

### Adding Features
1. Add uniform in `wavelet.frag`
2. Add to `cacheUniforms()` in `sketch.js`
3. Add to `setUniforms()` in `sketch.js`
4. Generate value in `generateFeatures()`
5. Add to `RARITY_CURVES` if needed

### Performance Tips
- Avoid branching in shaders (use mix/step)
- Keep loop iterations fixed
- Limit texture lookups
- Use `mediump` where `highp` not needed

## Feedback System

Like/dislike data is stored in localStorage with full parameter state:
- Pattern, wavelet, palette indices
- Speed, decomp levels, glitch amount
- Seed value
- Whether values were modified from hash defaults

Export stats to console to analyze preferences.

## Sub-Collection Ideas

The expanded feature set enables themed sub-collections:
- **Mathematical**: Pure wavelet transforms only
- **Glitch Art**: pixel_sort, vhs, data_bend effects
- **Retro**: scanline, phosphor, matrix combinations
- **Neon**: Hard transition palettes only
- **Minimal**: Binary palette, posterize, low decomp
- **Chaos**: Insane speed, level 8 decomp, high glitch

## Version Numbering

- **Major** (2.x.x): Breaking changes to hash→output mapping
- **Minor** (x.1.x): New features, backward compatible
- **Patch** (x.x.1): Bug fixes, optimizations

## Browser Compatibility

- WebGL 1.0 (no WebGL 2.0 features)
- Tested: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Chrome Android
- DPR capped at 2x for performance

