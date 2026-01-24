# Graphical Score v3.1.1 - AI Assistant Guide

## Project Overview

A generative graphical score featuring **14 distinct modes** inspired by 20th century avant-garde composers. The system uses a layered hybrid blending approach where modes can combine in various ways.

**Framework:** p5.js
**Current Version:** 3.1.1
**Canvas:** 1587×1122 (A3 landscape) / 4961×3508 (A3 at 300 DPI)

## The 14 Modes

### Original Modes (v2.0)

| Mode | Composer | Key Elements |
|------|----------|--------------|
| **Artikulation** | Ligeti/Wehinger | Color-coded timbral blocks, dense clusters, call/response |
| **UPIC** | Xenakis | Freehand arcs, glissandi, siren sweeps, ruled lines |
| **Cluster** | Penderecki | Dense wedge shapes, cluster bands, extended technique symbols |
| **Graph** | Feldman | Grid boxes, sparse pointillist, circuit-diagram aesthetic |
| **Chance** | Cage | Overlapping curves and dots, intersection derivation |
| **Spectral** | Murail/Grisey | Frequency bands, harmonic stacks, spectral envelopes |
| **Spiral** | Crumb | Circular patterns, spiral notation, numerological structure |

### New Modes (v3.0)

| Mode | Composer | Key Elements |
|------|----------|--------------|
| **Treatise** | Cardew | Abstract geometric shapes, thick lines, number sequences |
| **OpenForm** | Earle Brown | Floating rectangles, mobile-like spatial arrangement |
| **Bussotti** | Sylvano Bussotti | Calligraphic gestures, theatrical flourishes, ink splatters |
| **TextScore** | Stockhausen/Eno | Verbal instructions, cryptic phrases, typographic layout |
| **Stripsody** | Cathy Berberian | Comic onomatopoeia, speech bubbles, action lines |
| **Ankhrasmation** | Wadada Leo Smith | Colored duration bars, symbolic marks, rhythmic cells |
| **Braxton** | Anthony Braxton | Diagrammatic notation, schematic symbols, language types |

## Blending System

Three blending approaches (hash-determined):

1. **Dominant** (40%) - Primary mode with secondary accents
2. **Sectional** (35%) - Different sections use different modes
3. **Voice-based** (25%) - Each voice has its own mode

## File Structure

```
graphical-score/
├── index.html          # Viewer with mode display
├── sketch.js           # Main sketch (v2.0.0)
├── CLAUDE.md           # This file
├── README.md           # User documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
│   ├── v1.0.0-initial.js
│   └── v1.0.0-initial.html
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Implementation details
```

## Palettes (17 total)

### Archival (5)
- `sepia`, `manuscript`, `parchment`, `aged`, `blueprint`

### Original Mode-Authentic (5)
- `wehinger` - Artikulation colors (7-color array)
- `upicBlue` - UPIC system blue plotting paper
- `spectralHeat` - Dark with heat-map gradient (8-color array)
- `crumbRitual` - Mystical dark tones
- `cageTransparent` - Clean overlay aesthetic

### New Mode-Authentic (7, v3.0)
- `treatiseBlack` - Stark black-on-white geometric
- `brownMobile` - Earle Brown's warm paper aesthetic
- `bussottiInk` - Theatrical calligraphic with red accent
- `textMinimal` - Clean minimal for text scores
- `stripsodyPop` - Comic-inspired primary colors (6-color array)
- `ankhrasmationColor` - Full spectrum (7-color array)
- `braxtonDiagram` - Technical blueprint aesthetic

## Key Functions

### Mode Drawing (Original)
- `drawArtikulationColorBlocks()`, `drawArtikulationClusters()`
- `drawUpicArcs()`, `drawUpicRuledLines()`
- `drawClusterWedges()`, `drawClusterBands()`, `drawExtendedSymbols()`
- `drawGraphBoxes()`, `drawSparsePoints()`
- `drawChanceCurves()`, `drawChanceDots()`, `drawChanceIntersections()`
- `drawSpectralBands()`, `drawSpectralWaterfall()`, `drawFormantContours()`, `drawAttackTransients()`, `drawResonanceBells()`, `drawHarmonicStacks()`
- `drawSpiralPaths()`, `drawCircularNotation()`, `drawRitualSymbols()`

### Enhanced Spiral Mode (v3.1.0)
- `drawSpiralVariants()` - Logarithmic, double, arm, and Fermat spirals
- `drawSpiralText()` - Text along spiral path (Crumb-style poetic fragments)
- `drawSegmentedSpiral()` - Broken spirals with rest gaps
- `drawSpiralNoteheads()` - Musical noteheads (filled, open, diamond, X, triangle)
- `drawMysticalSymbols()` - Zodiac, planetary, alchemical symbols
- `drawMandalaPattern()` - Layered circular structures with rotational symmetry
- `drawFibonacciSpiral()` - Golden ratio spiral with boxes
- `drawSpiralWedges()` - Spirals within wedge sections
- `drawCrumbEye()` - "Eye of the Whale" circular imagery
- `drawSpiralBeaming()` - Beamed note groups along spiral curves

### Mode Drawing (v3.0.0 New Modes)
- **Treatise**: `drawTreatiseGeometric()`, `drawTreatiseNumbers()`, `drawTreatiseThickLines()`
- **OpenForm**: `drawOpenFormRects()`, `drawOpenFormSpatial()`
- **Bussotti**: `drawBussottiCalligraphic()`, `drawBussottiFlourishes()`, `drawBussottiSplatters()`
- **TextScore**: `drawTextInstructions()`, `drawTextCryptic()`
- **Stripsody**: `drawStripsodyOnomatopoeia()`, `drawStripsodyBubbles()`, `drawStripsodyActionLines()`
- **Ankhrasmation**: `drawAnkhrasmationDurations()`, `drawAnkhrasmationSymbols()`
- **Braxton**: `drawBraxtonDiagrams()`, `drawBraxtonLanguageTypes()`

### Engraving Helpers (v2.1.0)
- `drawHatching(x, y, w, h, angle, spacing, intensity)` - Line hatching
- `drawCrossHatching(x, y, w, h, spacing, intensity)` - Cross-hatch pattern
- `drawStippling(x, y, w, h, density, intensity)` - Stipple dots

### Notation Marks (v2.1.0)
- `drawNotationMarks()` - Main coordinator for all notation
- `drawExpressionMarks()` - Italian expression terms
- `drawArticulationSymbols()` - Accent, staccato, fermata, etc.
- `drawPerformanceInstructions()` - Extended techniques
- `drawMetronomeMarks()` - BPM and duration marks

### Mode Dispatcher
```javascript
function drawModeElements(mode, voice, section) {
  switch (mode) {
    case "artikulation": /* ... */
    case "upic": /* ... */
    // etc.
  }
}
```

### Hi-Res Support
```javascript
window.setHiRes(true)  // Switch to 3840x2160
window.setHiRes(false) // Switch to 1280x720
```

## Feature System

| Feature | Rarity Distribution |
|---------|---------------------|
| modeCount | single(35) / dual(40) / triple(20) / quad(5) |
| blendType | dominant(40) / sectional(35) / voiceBased(25) |
| voiceCount | ensemble(50) / chamber(28) / solo(14) / orchestra(8) |
| structure | flowing(40) / sectioned(30) / mathematical(20) / palindrome(10) |
| density | balanced(45) / dense(28) / sparse(18) / extreme(9) |

## Quick Commands

```bash
# Open in browser
open index.html

# Local server (recommended)
cd sketches/graphical-score && python -m http.server 8000
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save PNG |
| H | Toggle Hi-Res (4K) |
| L | Like |
| D | Dislike |

## Making Changes

### Adding a New Mode

1. Add mode definition to `MODES` object:
```javascript
newMode: {
  name: "New Mode",
  composer: "Composer Name",
  description: "Description",
  weight: 0.15,
  elements: ["element1", "element2"],
  prefersPalette: ["paletteName"]
}
```

2. Create drawing functions: `drawNewModeElement1()`, etc.

3. Add case to `drawModeElements()` switch

4. Add CSS for `.mode-tag.newMode` in index.html

### Adding a New Palette

1. Add to `PALETTES` object:
```javascript
newPalette: {
  paper: "#...", paperDark: "#...",
  ink: "#...", inkLight: "#...",
  accent: "#...", faded: "#...",
  colors: ["#...", "#..."], // optional array for multi-color modes
  gradient: ["#...", "#..."], // optional for spectral-like modes
  type: "authentic" // or "archival"
}
```

2. Add to mode's `prefersPalette` array

### Version Numbering

- **Major** (3.0.0): Changes to hash→visual mapping
- **Minor** (2.1.0): New modes or features (backward compatible)
- **Patch** (2.0.1): Bug fixes

## Testing Checklist

- [ ] All 7 modes render correctly
- [ ] All 3 blending types work
- [ ] All palettes display properly
- [ ] Hi-Res mode scales correctly
- [ ] Mode combinations produce variety
- [ ] Rare features (quad mode, palindrome) achievable
- [ ] Spectral mode renders on dark background
- [ ] Spiral mode circles don't overflow

## Research Sources

Mode designs informed by research on:
- [Ligeti Artikulation/Wehinger](https://en.wikipedia.org/wiki/Artikulation_(Ligeti))
- [Xenakis UPIC System](https://zkm.de/en/from-xenakiss-upic-to-graphic-notation-today)
- [Penderecki Threnody notation](https://sites.nd.edu/choral-lit/files/2018/09/Penderecki-and-notation.pdf)
- [Feldman Projections](https://www.cambridge.org/core/journals/journal-of-the-society-for-american-music/article/abs/morton-feldmans-graphic-notation-projections-and-trajectories/)
- [Cage Fontana Mix](https://peoplesgdarchive.org/item/10471/fontana-mix-1958-john-cage-3145720)
- [Spectral Music (Grisey/Murail)](https://en.wikipedia.org/wiki/Spectral_music)
- [George Crumb notation](https://en.wikipedia.org/wiki/George_Crumb)
