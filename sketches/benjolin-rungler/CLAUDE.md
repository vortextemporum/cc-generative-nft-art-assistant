# Benjolin Rungler - AI Assistant Guide

## Overview

GLSL shader visualization inspired by Rob Hordijk's Benjolin synthesizer. Features dual chaotic oscillators, a simulated Rungler shift register, and framebuffer feedback - all translated into 4 distinct visual modes with RGB synthesis and edge-of-chaos aesthetics.

**Framework:** Pure WebGL + GLSL
**Version:** 2.0.0
**Canvas:** 700x700

## File Structure

```
benjolin-rungler/
├── index.html          # Viewer with dev controls
├── sketch.js           # WebGL setup, hash system, UI
├── CLAUDE.md           # This file
├── CHANGELOG.md        # Version history
├── shaders/
│   └── benjolin.frag   # Main GLSL fragment shader
├── versions/           # Archived versions
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation
```

## Core Concept

The Benjolin is a chaotic analog synthesizer with:
- **Two oscillators** that cross-modulate each other's frequency
- **A Rungler** - a shift register that samples one oscillator at the zero-crossings of the other, creating stepped semi-random CV

This sketch translates these concepts visually:
- Oscillators → wave patterns, Lissajous curves, modulated coordinates
- Rungler → stepped/quantized values, bit patterns, discrete color steps
- Cross-modulation → feedback loops, emergent complexity

## Visual Modes

| Mode | Description | Rarity |
|------|-------------|--------|
| **Waveform** | Multi-channel audio waveform visualization | Common |
| **Scope** | Oscilloscope Lissajous, waveforms, phosphor glow | Common |
| **Pixel** | Bitcrushed shift register, glitch rows | Uncommon |
| **Filter** | Filter resonance frequency response sweeps | Rare/Legendary |

## Key Features (Hash-Derived)

| Feature | Range | Description |
|---------|-------|-------------|
| `mode` | 0-3 | Visual mode selection |
| `oscRatio` | 0.2-4.0 | Frequency ratio between oscillators |
| `runglerBits` | 4-16 | Shift register bit length |
| `feedbackAmt` | 0.0-0.9 | Framebuffer feedback intensity |
| `rgbOffset` | 0.002-0.08 | RGB channel separation amount |
| `speed` | 0.02-0.25 | Animation speed multiplier |

## Rarity System

- **Common (45%):** Waveform or Scope mode, subtle RGB
- **Uncommon (30%):** Pixel mode or elevated settings
- **Rare (18%):** Filter mode with interesting oscillator ratios
- **Legendary (7%):** Filter + extreme feedback + golden ratio oscillators

Golden ratios: 1.618, 2.0, 1.5, 0.618, 1.414

## Quick Commands

```bash
# Serve locally (from sketch folder)
python -m http.server 8000
# Then open http://localhost:8000

# Or with Node
npx serve .
```

## Keyboard Controls

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save PNG |
| Space | Pause/resume |
| L | Like current output |
| D | Dislike current output |
| 1-4 | Force visual mode |

## Making Changes

### Before Editing
1. Archive current version: `cp sketch.js versions/v2.0.0-sketch.js`
2. Archive shader: `cp shaders/benjolin.frag versions/v2.0.0-benjolin.frag`

### After Editing
1. Update version in `sketch.js` comment header
2. Update version in `index.html` header
3. Update `CHANGELOG.md` with changes
4. Consider if change is Major/Minor/Patch

### Version Guidelines
- **Major (2.0.0):** Same hash produces different output
- **Minor (1.1.0):** New features, backward compatible
- **Patch (1.0.1):** Bug fixes, no visual change

## GLSL Shader Architecture

The fragment shader (`shaders/benjolin.frag`) contains:

### Oscillator System
```glsl
struct Oscillators {
    float osc1;    // First triangle-ish oscillator
    float osc2;    // Second oscillator at ratio frequency
    float rungler; // Stepped random value from shift register sim
};
```

### Mode Functions
- `modeWaveform()` - Multi-channel audio waveforms with glow
- `modeScope()` - Lissajous curves, waveform traces
- `modePixel()` - Bitcrushed patterns, glitch rows
- `modeFilter()` - Filter frequency response with resonance peaks

### Uniforms
```glsl
uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uFeedback;  // Previous frame for feedback
uniform int uMode;
uniform float uOscRatio;
uniform float uRunglerBits;
uniform float uFeedbackAmt;
uniform float uRgbOffset;
uniform float uSpeed;
```

## Console API

Access via browser console:
```javascript
benjolin.features()        // Current feature values
benjolin.regenerate()      // New hash
benjolin.setParameter('mode', 2)  // Override parameter
benjolin.resetToOriginal() // Clear overrides
benjolin.getFeedbackStats() // Like/dislike stats
benjolin.exportFeedback()  // Full feedback data
benjolin.getRarityCurves() // Probability distributions
```

## Common Modifications

### Add a new visual mode
1. Add mode function in `benjolin.frag`: `vec3 modeNewMode(vec2 uv, Oscillators osc, float t)`
2. Add case in main(): `else if (uMode == 4) { col = modeNewMode(...); }`
3. Update `MODE_NAMES` array in `sketch.js`
4. Update slider max value in `index.html`
5. Adjust rarity probabilities

### Adjust chaos level
- Increase `mod1`/`mod2` multipliers in `benjolin()` function
- Increase feedback multiplier in oscillator equations
- Adjust the `0.3 *` coefficients

### Change color palette
- RGB offset affects chromatic aberration
- Each mode has its own color logic
- Scope mode has phosphor-style green
- Waveform mode has green/cyan/pink channel colors
- Filter mode has green/cyan/orange/purple sweep colors

### Performance optimization
- Reduce loop iterations in `modeScope()` Lissajous sampling
- Lower `fbm()` octave count
- Reduce filter sweep count in `modeFilter()`
