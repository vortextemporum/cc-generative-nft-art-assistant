# Benjolin Rungler - AI Assistant Guide

## Overview

Unified chaos field visualization of Rob Hordijk's Benjolin synthesizer. All signals (oscillators, runglers, resonator, comparator, S&H, clock) intersect and modulate each other across the entire canvas - no panels, pure visual interplay.

**Framework:** p5.js
**Version:** 4.0.1
**Canvas:** 700x700

## File Structure

```
benjolin-rungler/
├── index.html          # Viewer with color scheme controls
├── sketch.js           # p5.js ASCII renderer
├── CLAUDE.md           # This file
├── CHANGELOG.md        # Version history
├── shaders/
│   └── benjolin.frag   # Legacy GLSL shader (v2.0.0)
├── versions/           # Archived versions
│   ├── v1.0.0-sketch.js
│   ├── v2.0.0-webgl.js
│   └── v2.0.0-benjolin.frag
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation
```

## Core Concept

The Benjolin is a chaotic analog synthesizer with:
- **Two oscillators** that cross-modulate each other's frequency
- **Dual Runglers** - shift registers that sample oscillators at zero-crossings
- **Twin Peak Resonator**, Sample & Hold, and Comparator modules

This sketch renders all signals as overlapping visual layers:
- **OSC A**: Horizontal waves sweeping with vertical extensions (∿ ~ ≈)
- **OSC B**: Vertical waves with circle characters (○ ●)
- **Rungler A**: Diagonal bands from top-left with bit patterns (█ ░)
- **Rungler B**: Diagonal bands from top-right
- **Resonator**: Expanding spiral rings from center (◎ ○)
- **Comparator**: Grid of ┼ or ╳ based on XOR state
- **S&H**: Floating particles with trails
- **Clock**: Expanding rings and vertical pulse lines

### Intersection Styles (hash-derived)
- `additive` - signals accumulate brightness
- `xor` - signals cancel at intersections (creates ╳ patterns)
- `multiply` - overlapping signals boost each other
- `interference` - wave interference patterns using sin phase

## Color Schemes

| Scheme | Background | Foreground | Style |
|--------|------------|------------|-------|
| **Phosphor** | Dark green | Bright green | Classic CRT oscilloscope |
| **Amber** | Dark brown | Amber/orange | Vintage terminal |
| **Blue** | Dark blue | Cyan/blue | Modern scope |
| **Matrix** | Black | Green | Hacker aesthetic |
| **Thermal** | Dark purple | Pink/orange | Heat vision |

## Key Features (Hash-Derived)

| Feature | Range | Description |
|---------|-------|-------------|
| `colorScheme` | 0-5 | Visual color scheme (Phosphor, Amber, Blue, Matrix, Thermal, Cyan) |
| `intersectionStyle` | string | How layers blend: additive, xor, multiply, interference |
| `waveCount` | 3-7 | Parallel waves per oscillator |
| `rateA` | 0.3-1.2 | Oscillator A frequency |
| `rateB` | 0.2-0.9 | Oscillator B frequency |
| `fmAtoB` | 0.1-0.8 | Cross-modulation depth A→B |
| `fmBtoA` | 0.1-0.8 | Cross-modulation depth B→A |
| `runglerABits` | 6-12 | Rungler A shift register bits |
| `runglerBBits` | 6-12 | Rungler B shift register bits |
| `spiralTightness` | 0.3-0.8 | Resonator spiral shape |
| `density` | 15-40 | S&H particle count |
| `chaos` | 0.3-0.9 | Overall chaos level |

## Rarity System

- **Common:** Default parameter ranges
- **Uncommon:** modDepthA > 0.6
- **Rare:** runglerBits > 10
- **Legendary:** loopEnabled + filterResonance > 0.7

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

## Making Changes

### Before Editing
1. Archive current version: `cp sketch.js versions/v3.0.0-ascii.js`

### After Editing
1. Update version in `sketch.js` comment header
2. Update version in `index.html` header
3. Update `CHANGELOG.md` with changes
4. Consider if change is Major/Minor/Patch

### Version Guidelines
- **Major (3.0.0):** Same hash produces different output
- **Minor (3.1.0):** New features, backward compatible
- **Patch (3.0.1):** Bug fixes, no visual change

## ASCII Rendering Architecture

### Character Buffer
The sketch uses a 2D character buffer with layer info:
```javascript
charBuffer[y][x] = { char: '█', brightness: 1, hue: 0, layer: 1 };
```

### Blend Function
All layers use `blendChar()` for intersection handling:
```javascript
function blendChar(x, y, char, brightness, hue, layer) {
    // Handles additive, xor, multiply, interference styles
}
```

### Benjolin Class
Simulates the full Benjolin synthesizer:
```javascript
class Benjolin {
    oscA, oscB           // Oscillator outputs (-1 to 1)
    phaseA, phaseB       // Phase accumulators
    runglerA, runglerB   // Dual shift registers
    cvA, cvB             // Stepped CV outputs
    sampleHold           // S&H value
    comparator           // XOR comparator state
    resonator            // Twin peak filter state
}
```

### Visual Layer Functions
- `drawOscillatorWaves()` - Horizontal (A) and vertical (B) waves
- `drawRunglerBands()` - Diagonal bands with bit patterns
- `drawResonatorField()` - Expanding spiral rings from center
- `drawComparatorGrid()` - Grid of ┼ or ╳ based on XOR
- `drawSHParticles()` - Floating particles with trails
- `drawClockPulses()` - Expanding rings on clock ticks

## Console API

Access via browser console:
```javascript
benjolin.features()           // Current feature values
benjolin.regenerate()         // New hash
benjolin.setColorScheme(idx)  // Change color scheme (0-4)
```

## Common Modifications

### Add a new module to the diagram
1. Define position constants in `drawBenjolinDiagram()`
2. Use `drawBox()` for the module outline
3. Add internal visualization (waveform, bits, etc.)
4. Connect with signal flow using `drawArrow()` or particle animation

### Adjust chaos level
- Modify `modDepthA`/`modDepthB` ranges in `generateFeatures()`
- Change oscillator frequency multipliers in `BenjolinCore.update()`
- Adjust the `* 0.5` coefficients in cross-modulation

### Add a new color scheme
Add to `COLOR_SCHEMES` array:
```javascript
{ name: 'Name', bg: [r,g,b], fg: [r,g,b], accent: [r,g,b] }
```

### Modify the block diagram layout
- All positions are defined in `drawBenjolinDiagram()`
- `startX`, `startY` control overall offset
- Each module has its own position variables (oscAX, runglerX, vcfX, etc.)

### Performance optimization
- Reduce character buffer size via `charW`/`charH`
- Simplify waveform drawing loops
- Reduce signal flow particle count
