# Graphical Score v3.15.0 - AI Assistant Guide

## Project Overview

A generative graphical score featuring **14 distinct modes** inspired by 20th century avant-garde composers. The system uses a layered hybrid blending approach where modes can combine in various ways.

**Framework:** p5.js
**Current Version:** 3.9.0
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

### Enhanced UPIC Mode (v3.5.0 - Xenakis)
- `drawUpicGlissandiBands()` - Multiple parallel glissandi (Metastaseis style)
- `drawUpicDensityMass()` - Dense stochastic texture masses
- `drawUpicGraphPaper()` - Grid overlay like original UPIC screen
- `drawUpicPressureStrokes()` - Variable pressure/thickness strokes
- `drawUpicStochasticPoints()` - Probabilistically distributed points
- `drawUpicMathCurves()` - Parabolas, exponentials, logarithms, hyperbolas
- `drawUpicArborescences()` - Tree-like branching structures
- `drawUpicPolytopes()` - Geometric spatial structures (Polytopes)
- `drawUpicGranularCloud()` - Dense granular synthesis representation
- `drawUpicProbabilityBands()` - Probability distribution envelope bands
- `drawUpicAngularTransforms()` - Angular line transformations
- `drawUpicWavePages()` - UPIC "page" segments with waveforms
- `drawUpicRotations()` - Rotational shape transformations
- `drawUpicParallelStreams()` - Multiple parallel voice streams
- `drawUpicSifted()` - "Sifted" patterns (Xenakis sieves theory)
- `drawUpicArchitectural()` - Architectural structures (Polytope influence)
- `drawUpicLogisticMap()` - Chaos theory logistic map curves
- `drawUpicHarmonicSeries()` - Overtone series visualization

### Enhanced Artikulation Mode (v3.4.0 - Ligeti/Wehinger)
- `drawArtikulationCallResponse()` - Call/response patterns between timbral groups
- `drawArtikulationTimbralStripes()` - Horizontal gradient stripes for sustained timbres
- `drawArtikulationGlitchPatterns()` - Short stuttering electronic bursts
- `drawArtikulationSpeechFragments()` - Speech-like contour lines
- `drawArtikulationDensityClouds()` - Gaussian density clouds with color mixing
- `drawArtikulationAttackDecay()` - Attack/decay envelope shapes
- `drawArtikulationConnectors()` - Curved lines connecting related events
- `drawArtikulationWedges()` - Crescendo/diminuendo wedge shapes
- `drawArtikulationInterrupted()` - Fragmented/interrupted elements
- `drawArtikulationOverlaps()` - Overlapping transparent colored regions
- `drawArtikulationTextureGradient()` - Textural density gradients
- `drawArtikulationPulsation()` - Rhythmic pulsing elements
- `drawArtikulationMorphing()` - Shapes that morph across time
- `drawArtikulationStaticBursts()` - Radio static / white noise bursts
- `drawArtikulationTimbreLegend()` - Legend-like timbre labels (I, II, α, β)
- `drawArtikulationVerticalSync()` - Vertical alignment markers
- `drawArtikulationElectronicMotifs()` - Sine, square, sawtooth waveforms
- `drawArtikulationSpatialPanning()` - L/R spatial panning indicators
- `drawClusterWedges()`, `drawClusterBands()`, `drawExtendedSymbols()`

### Enhanced Cluster Mode (v3.6.0 - Penderecki)
- `drawClusterGlissandi()` - Sliding pitch bands (Threnody style)
- `drawClusterMicropolyphony()` - Dense micropolyphonic texture
- `drawClusterStringEffects()` - Sul pont, col legno, tremolo symbols
- `drawClusterQuarterTones()` - Quarter-tone accidental marks
- `drawClusterAleatoryBox()` - Boxed aleatory sections
- `drawClusterBlackNotation()` - Dense filled "black notation" areas
- `drawClusterVibratoWiggle()` - Vibrato indication wiggles
- `drawClusterSustainedTones()` - Long sustained cluster tones
- `drawClusterPercussive()` - Percussive effect marks
- `drawClusterDynamicHairpin()` - Hairpin dynamics for clusters
- `drawClusterTremoloSlashes()` - Tremolo slashes
- `drawClusterHarmonicDiamond()` - Diamond harmonics notation
- `drawClusterSulTasto()` - Sul tasto bracket indication
- `drawClusterColLegnoBatt()` - Col legno battuto marks
- `drawClusterFlautando()` - Flautando wavy line
- `drawClusterSpiccato()` - Spiccato dot patterns
- `drawClusterBariolage()` - Alternating strings zigzag
- `drawClusterRicochet()` - Ricochet bouncing bow pattern
- `drawGraphBoxes()`, `drawSparsePoints()`
- `drawChanceCurves()`, `drawChanceDots()`, `drawChanceIntersections()`
- `drawSpectralBands()`, `drawSpectralWaterfall()`, `drawFormantContours()`, `drawAttackTransients()`, `drawResonanceBells()`, `drawHarmonicStacks()`

### Enhanced Spectral Mode (v3.7.0 - Murail/Grisey)
- `drawSpectralPartials()` - Individual harmonic partials with decay
- `drawSpectralInharmonicity()` - Inharmonic partial spreading
- `drawSpectralBeating()` - Beating/interference patterns
- `drawSpectralInterpolation()` - Interpolation between spectra
- `drawSpectralDifferenceTones()` - Combination/difference tones
- `drawSpectralRingMod()` - Ring modulation sidebands
- `drawSpectralCompression()` - Spectral compression/expansion
- `drawSpectralFiltering()` - Filter curves (LP, HP, BP)
- `drawSpectralEnvelopeTime()` - Time-varying amplitude envelopes
- `drawSpectralGesture()` - Time-varying spectral gesture
- `drawSpectralSonogram()` - Sonogram-like dense display
- `drawSpectralMorphing()` - Morphing between spectral states
- `drawSpectralFundamental()` - Fundamental with radiating overtones
- `drawSpectralGliss()` - Spectral glissando
- `drawSpectralDecay()` - Natural spectral decay curves
- `drawSpectralAdditive()` - Additive synthesis visualization
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

### Enhanced Graph Mode (v3.2.0 - Feldman)
- `drawIctusMarks()` - Attack indicators with accent marks
- `drawRegisterBands()` - H/M/L register zones with labels
- `drawTimeBrackets()` - Feldman-style [ ] time notation
- `drawProportionalGrid()` - Variable-width columns
- `drawDiamondNotes()` - Diamond noteheads for harmonics
- `drawClusterBrackets()` - Curly brackets grouping pitches
- `drawDynamicGradients()` - Hairpin crescendo/decrescendo
- `drawSustainLines()` - Long horizontal ties
- `drawTremoloMarks()` - Tremolo slashes on stems
- `drawInstrumentLabels()` - Instrument abbreviations with techniques
- `drawEmptyBoxes()` - Emphasized silence/tacet boxes
- `drawConnectingLines()` - Voice-leading curves between notes
- `drawSoftAttackMarks()` - Open circles for pianissimo
- `drawDecayTrails()` - Fading resonance with opacity gradient
- `drawDurationStacks()` - Vertical note stacks with numbers
- `drawPedalMarkings()` - Piano pedal brackets
- `drawBreathMarks()` - Commas, caesuras for pauses
- `drawHarmonicHalos()` - Concentric overtone rings

### Enhanced Chance Mode (v3.3.0 - Cage)
- `drawFontanaMixGrid()` - Measurement grid overlay with numbers
- `drawTransparentOverlays()` - Layered translucent shapes (Variations)
- `drawIChingHexagrams()` - The 64 I Ching symbols (Music of Changes)
- `drawStarChartTracings()` - Star dots with connections (Atlas Eclipticalis)
- `drawSilenceBoxes()` - Empty boxes with "TACET" (4'33")
- `drawMesosticText()` - Vertical acrostic text patterns
- `drawRyoanjiTracings()` - Rock-outline curves with multiple tracings
- `drawPreparedPianoSymbols()` - Bolt, mute, screw notation
- `drawCageTimeBrackets()` - Flexible time brackets (Number Pieces)
- `drawChanceOperationMarks()` - Dice, trigrams, coins symbols
- `drawCircusOverlays()` - Independent overlapping parts
- `drawIndeterminacySymbols()` - "ad lib.", "?", "~" marks
- `drawEventNotation()` - Action/event boxes (Happenings)
- `drawNotationTypes()` - 8 symbol systems (Concert for Piano)
- `drawMycologicalForms()` - Mushroom shapes (Cage was a mycologist)
- `drawNumberPieceBrackets()` - Floating time windows
- `drawRadioStaticDots()` - Dense varying-opacity dots
- `drawWaterWalkSymbols()` - Object/action notation
- `drawZenCircles()` - Incomplete Ensō circles
- `drawAnarchySymbols()` - "free", "any", "∞" freedom marks

### Mode Drawing (v3.0.0 New Modes)
- **Treatise**: `drawTreatiseGeometric()`, `drawTreatiseNumbers()`, `drawTreatiseThickLines()`

### Enhanced Treatise Mode (v3.8.0 - Cardew)
- `drawTreatiseLifeline()` - Central horizontal lifeline with marks
- `drawTreatiseTree()` - Tree/branching structures
- `drawTreatiseClouds()` - Dense clusters of small marks
- `drawTreatiseParallelLines()` - Groups of parallel lines
- `drawTreatiseCurvedPath()` - Flowing bezier curved paths
- `drawTreatiseSolids()` - Solid filled shapes
- `drawTreatiseNests()` - Nested concentric circles
- `drawTreatiseZigzag()` - Zigzag patterns
- `drawTreatiseWedge()` - Triangular wedge shapes
- `drawTreatiseScatteredDots()` - Scattered dots
- `drawTreatiseGrid()` - Grid patterns with cell marks
- `drawTreatiseAngle()` - Angular constructions
- `drawTreatiseSymbols()` - Abstract symbols (plus, X, arc, asterisk)
- `drawTreatiseMass()` - Dense black irregular masses
- `drawTreatiseConnectors()` - Lines connecting elements
- `drawTreatiseBrackets()` - Bracket shapes [ and ]
- `drawTreatiseSmallSpiral()` - Small spiral elements
- `drawTreatiseBlocks()` - Rectangular blocks
- **OpenForm**: `drawOpenFormRects()`, `drawOpenFormSpatial()`

### Enhanced OpenForm Mode (v3.9.0 - Earle Brown)
- `drawOpenFormMobile()` - Mobile-like floating arrangement
- `drawOpenFormProportional()` - Proportional time-space bars
- `drawOpenFormBalance()` - Visual weight and balance composition
- `drawOpenFormTrajectory()` - Curved arrows showing paths
- `drawOpenFormClusters()` - Grouped rectangles
- `drawOpenFormVerticalStacks()` - Stacked vertical bars
- `drawOpenFormHorizontalStream()` - Horizontal bar streams
- `drawOpenFormEvent()` - Single prominent event
- `drawOpenFormGradient()` - Size gradient arrangements
- `drawOpenFormSparse()` - Minimal sparse arrangement
- `drawOpenFormDense()` - Dense accumulation
- `drawOpenFormOverlap()` - Overlapping transparent rectangles
- `drawOpenFormAsymmetric()` - Asymmetric balance
- `drawOpenFormContrapuntal()` - Two-voice contrapuntal
- `drawOpenFormLooseGrid()` - Loose grid arrangement
- `drawOpenFormDiagonal()` - Diagonal arrangement
### Enhanced Bussotti Mode (v3.10.0 - Sylvano Bussotti)
- `drawBussottiCalligraphic()` - Calligraphic flourish lines with variable weight
- `drawBussottiFlourishes()` - Ornate decorative flourishes
- `drawBussottiSplatters()` - Ink splatter effects
- `drawBussottiGestural()` - Large gestural marks with expressive strokes
- `drawBussottiCurvedStaff()` - Curved musical staves that bend and flow
- `drawBussottiDrips()` - Ink drip effects with gravity trails
- `drawBussottiDecorative()` - Decorative ornamental swashes and curls
- `drawBussottiTextFragments()` - Italian poetic text fragments
- `drawBussottiTheatrical()` - Theatrical performance direction marks
- `drawBussottiSwirls()` - Swirling ink patterns
- `drawBussottiClusters()` - Dense gestural clusters
- `drawBussottiLoops()` - Looping calligraphic lines
- `drawBussottiAccents()` - Dramatic accent marks
- `drawBussottiVines()` - Vine-like decorative lines with offshoots
- `drawBussottiStars()` - Star and asterisk decorations
- `drawBussottiConnected()` - Connected flowing gestures
- `drawBussottiDecorativeDots()` - Decorative dot patterns
- `drawBussottiWaves()` - Wavy gestural lines
- `drawBussottiCrescendo()` - Dramatic crescendo/decrescendo shapes
### Enhanced TextScore Mode (v3.11.0 - Stockhausen/Eno)
- `drawTextInstructions()` - Text-based verbal instructions
- `drawTextCryptic()` - Cryptic phrases and symbols
- `drawTextScorePoetic()` - Spaced poetic phrases (Stockhausen's intuitive music)
- `drawTextScoreNumbered()` - Numbered instruction lists
- `drawTextScoreTime()` - Time-based instructions with brackets
- `drawTextScoreStockhausen()` - Intuitive music text instructions
- `drawTextScoreOblique()` - Oblique Strategies style prompts in frames
- `drawTextScoreProsody()` - Prosodic stress marks
- `drawTextScoreConceptual()` - Conceptual art-style instructions (Fluxus)
- `drawTextScoreParenthetical()` - Parenthetical annotations (ad libitum)
- `drawTextScoreQuotes()` - Quoted single-word fragments
- `drawTextScoreVerbs()` - Scattered action verbs
- `drawTextScoreLayout()` - Typographic spatial layout
- `drawTextScoreMinimal()` - Minimal single words, large and sparse
- `drawTextScoreQuestions()` - Question-based instructions
- `drawTextScoreNegation()` - Negation-based conceptual instructions
- `drawTextScoreDuration()` - Duration indicator lines with text
- `drawTextScoreWhisper()` - Small, quiet whispered instructions
### Enhanced Stripsody Mode (v3.12.0 - Cathy Berberian)
- `drawStripsodyOnomatopoeia()` - Comic book sound words (BANG!, POW!)
- `drawStripsodyBubbles()` - Speech/thought bubbles with tails
- `drawStripsodyActionLines()` - Action/motion lines
- `drawStripsodyExplosions()` - Explosion burst shapes
- `drawStripsodyStars()` - Impact stars (4-8 pointed)
- `drawStripsodySpeedLines()` - Speed/motion horizontal streaks
- `drawStripsodySwoosh()` - Swoosh movement curves with arrows
- `drawStripsodyFaces()` - Simple expressive emoticon faces
- `drawStripsodyExclamations()` - Exclamation marks
- `drawStripsodyQuestionMarks()` - Question marks
- `drawStripsodyHearts()` - Heart shapes
- `drawStripsodyMusicNotes()` - Floating music notes
- `drawStripsodyLightning()` - Lightning bolt shapes
- `drawStripsodySpirals()` - Dizzy spiral marks
- `drawStripsodyDroplets()` - Sweat/water droplets
- `drawStripsodyPuffs()` - Smoke/cloud puffs
- `drawStripsodyImpact()` - Impact radiating lines
- `drawStripsodyWobble()` - Wobble/vibration marks
### Enhanced Ankhrasmation Mode (v3.13.0 - Wadada Leo Smith)
- `drawAnkhrasmationDurations()` - Duration symbols (colored bars)
- `drawAnkhrasmationSymbols()` - Symbolic marks from Ankhrasmation language
- `drawAnkhrasmationColorBars()` - Colored horizontal bar sequences
- `drawAnkhrasmationDiagonals()` - Diagonal direction indicators
- `drawAnkhrasmationCells()` - Rhythmic unit cells (boxed regions)
- `drawAnkhrasmationArrows()` - Direction arrows for movement
- `drawAnkhrasmationGradients()` - Color gradient intensity bars
- `drawAnkhrasmationVertical()` - Vertical accent marks
- `drawAnkhrasmationRests()` - Rest/silence indicators
- `drawAnkhrasmationConnected()` - Connected color sequences
- `drawAnkhrasmationCrescendo()` - Growing intensity wedges
- `drawAnkhrasmationClusters()` - Grouped multi-color mark clusters
- `drawAnkhrasmationWaves()` - Wave-form duration indicators
- `drawAnkhrasmationDots()` - Dot patterns (rhythmic accents)
- `drawAnkhrasmationBrackets()` - Grouping brackets
- `drawAnkhrasmationNumbers()` - Numerical unit indicators
- `drawAnkhrasmationParallel()` - Parallel color lines
- `drawAnkhrasmationImprovisationZone()` - Free improvisation zones
### Enhanced Braxton Mode (v3.14.0 - Anthony Braxton)
- `drawBraxtonDiagrams()` - Diagrammatic/schematic notation
- `drawBraxtonLanguageTypes()` - Language type symbols (sound lines)
- `drawBraxtonCompositionNumber()` - Composition number titles
- `drawBraxtonConnectors()` - Connection lines between elements
- `drawBraxtonTechnicalMarks()` - Technical drawing dimension marks
- `drawBraxtonFlowArrows()` - Flow/direction arrows
- `drawBraxtonCircuitElements()` - Circuit-like schematic symbols
- `drawBraxtonAngleBrackets()` - Angle bracket structures
- `drawBraxtonParallelStructures()` - Parallel structural lines
- `drawBraxtonContainment()` - Containment shapes (brackets, boxes)
- `drawBraxtonZones()` - Zone/region markers with labels
- `drawBraxtonPathways()` - Pathway/route indicators
- `drawBraxtonModular()` - Modular building block shapes
- `drawBraxtonVerticalStack()` - Vertical stack structures
- `drawBraxtonHorizontalSpread()` - Horizontal spread patterns
- `drawBraxtonIntersections()` - Intersection/crossing marks
- `drawBraxtonLabels()` - Text labels and identifiers
- `drawBraxtonRotational()` - Rotational symmetry elements

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
| structure | flowing(35) / sectioned(25) / mathematical(18) / fragmentary(12) / palindrome(10) |
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
