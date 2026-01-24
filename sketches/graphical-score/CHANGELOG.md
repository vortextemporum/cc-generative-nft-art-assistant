# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.7.0] - 2026-01-25

### Added

**Major Enhancement to Spectral (Murail/Grisey) Mode** - 16 new elements inspired by French spectral music and acoustic analysis:

| Function | Description |
|----------|-------------|
| `drawSpectralPartials()` | Individual harmonic partials with natural intensity decay |
| `drawSpectralInharmonicity()` | Inharmonic partial spreading (bell/piano string behavior) |
| `drawSpectralBeating()` | Beating/interference patterns between close frequencies |
| `drawSpectralInterpolation()` | Spectral interpolation between two different spectra |
| `drawSpectralDifferenceTones()` | Combination/difference tone visualization (f₁, f₂, f₂-f₁) |
| `drawSpectralRingMod()` | Ring modulation sidebands visualization |
| `drawSpectralCompression()` | Spectral compression/expansion band transformations |
| `drawSpectralFiltering()` | Spectral filter curves (low-pass, high-pass, band-pass) |
| `drawSpectralEnvelopeTime()` | Time-varying spectral amplitude envelopes |
| `drawSpectralGesture()` | Time-varying spectral gesture (Murail-style) |
| `drawSpectralSonogram()` | Sonogram-like dense time-frequency display |
| `drawSpectralMorphing()` | Smooth morphing between spectral states |
| `drawSpectralFundamental()` | Emphasized fundamental with radiating overtones |
| `drawSpectralGliss()` | Spectral glissando - all partials moving together |
| `drawSpectralDecay()` | Natural spectral decay (higher partials decay faster) |
| `drawSpectralAdditive()` | Additive synthesis visualization with component sum |

### Changed

- Spectral mode dispatcher now uses probabilistic layering with 8 primary structures
- Mode elements list expanded from 4 to 23
- Updated mode description to include "spectral transformations, sonograms"

### Technical

- Inharmonicity uses f_n = f_1 * n * sqrt(1 + B*n²) formula
- Beating patterns show amplitude modulation between close frequencies
- Spectral filtering supports LP, HP, and BP filter curves

---

## [3.6.0] - 2026-01-25

### Added

**Major Enhancement to Cluster (Penderecki) Mode** - 18 new elements inspired by Krzysztof Penderecki's string notation from *Threnody to the Victims of Hiroshima*:

| Function | Description |
|----------|-------------|
| `drawClusterGlissandi()` | Cluster glissandi - sliding pitch bands |
| `drawClusterMicropolyphony()` | Dense micropolyphonic texture (Ligeti/Penderecki crossover) |
| `drawClusterStringEffects()` | Visual string effect notation symbols (sul pont, col legno, tremolo) |
| `drawClusterQuarterTones()` | Quarter-tone accidental marks (quarter/three-quarter sharps/flats) |
| `drawClusterAleatoryBox()` | Boxed aleatory sections with "ad lib.", "accel." markings |
| `drawClusterBlackNotation()` | Dense filled "black notation" areas with rough edges |
| `drawClusterVibratoWiggle()` | Vibrato indication wavy lines |
| `drawClusterSustainedTones()` | Long sustained cluster tones with attack marks |
| `drawClusterPercussive()` | Percussive effect marks (X, accent, staccato, tenuto) |
| `drawClusterDynamicHairpin()` | Hairpin crescendo/diminuendo for clusters |
| `drawClusterTremoloSlashes()` | Tremolo slashes for sustained clusters |
| `drawClusterHarmonicDiamond()` | Diamond harmonics notation with "o" marker |
| `drawClusterSulTasto()` | Sul tasto (over fingerboard) bracket indication |
| `drawClusterColLegnoBatt()` | Col legno battuto (strike with wood) X marks |
| `drawClusterFlautando()` | Flautando (flute-like) wavy line with label |
| `drawClusterSpiccato()` | Spiccato bouncing bow dot patterns |
| `drawClusterBariolage()` | Rapid alternating strings zigzag pattern |
| `drawClusterRicochet()` | Ricochet bouncing bow arc pattern |

### Changed

- Cluster mode dispatcher now uses probabilistic layering with 6 primary structures
- Mode elements list expanded from 4 to 21
- Updated mode description to include "micropolyphony, black notation"

### Technical

- Extended techniques include authentic string notation symbols
- Quarter-tone marks support various microtonal notations
- Ricochet pattern uses diminishing bounce heights for realism

---

## [3.5.0] - 2026-01-25

### Added

**Major Enhancement to UPIC (Xenakis) Mode** - 18 new elements inspired by Iannis Xenakis's UPIC system and stochastic composition:

| Function | Description |
|----------|-------------|
| `drawUpicGlissandiBands()` | Multiple parallel glissandi (Metastaseis style) |
| `drawUpicDensityMass()` | Dense texture masses (stochastic clouds like Pithoprakta) |
| `drawUpicGraphPaper()` | Grid overlay like original UPIC screen |
| `drawUpicPressureStrokes()` | Variable pressure/thickness strokes |
| `drawUpicStochasticPoints()` | Probabilistically distributed points (uniform/gaussian/exponential) |
| `drawUpicMathCurves()` | Mathematical curves (parabolas, exponentials, logarithms, hyperbolas) |
| `drawUpicArborescences()` | Tree-like branching structures |
| `drawUpicPolytopes()` | Geometric spatial structures (inspired by Xenakis Polytopes) |
| `drawUpicGranularCloud()` | Dense granular synthesis representation |
| `drawUpicProbabilityBands()` | Probability distribution envelope bands |
| `drawUpicAngularTransforms()` | Angular line transformations |
| `drawUpicWavePages()` | UPIC "page" segments with waveforms |
| `drawUpicRotations()` | Rotational shape transformations |
| `drawUpicParallelStreams()` | Multiple parallel voice streams |
| `drawUpicSifted()` | "Sifted" patterns (Xenakis sieves theory) |
| `drawUpicArchitectural()` | Architectural structures (Polytope de Montréal influence) |
| `drawUpicLogisticMap()` | Chaos theory curves (logistic map visualization) |
| `drawUpicHarmonicSeries()` | Overtone series visualization with partial numbers |

### Changed

- UPIC mode dispatcher now uses probabilistic layering with 6 primary structures
- Mode elements list expanded from 4 to 22
- Updated mode description to include "stochastic masses, mathematical curves"

### Technical

- Arborescences use recursive branch drawing with depth limiting
- Stochastic points support three distribution types (uniform, gaussian, exponential)
- Logistic map uses r=3.5-3.9 for chaotic regime visualization

---

## [3.4.0] - 2026-01-25

### Added

**Major Enhancement to Artikulation (Ligeti/Wehinger) Mode** - 18 new elements inspired by Rainer Wehinger's visual listening score for György Ligeti's *Artikulation* (1958):

| Function | Description |
|----------|-------------|
| `drawArtikulationCallResponse()` | Call and response patterns between colored timbral groups with connecting lines |
| `drawArtikulationTimbralStripes()` | Horizontal gradient stripes for sustained electronic timbres |
| `drawArtikulationGlitchPatterns()` | Short stuttering electronic burst patterns (artifact aesthetics) |
| `drawArtikulationSpeechFragments()` | Speech-like contour lines reflecting Ligeti's phonetic influences |
| `drawArtikulationDensityClouds()` | Gaussian density clouds with two-color mixing |
| `drawArtikulationAttackDecay()` | Attack/decay envelope shapes with variable attack times |
| `drawArtikulationConnectors()` | Curved lines connecting related sound events |
| `drawArtikulationWedges()` | Crescendo/diminuendo wedge shapes |
| `drawArtikulationInterrupted()` | Fragmented/interrupted elements (electronic stuttering) |
| `drawArtikulationOverlaps()` | Overlapping colored transparent regions for simultaneous timbres |
| `drawArtikulationTextureGradient()` | Textural density gradients (dense in middle, sparse at edges) |
| `drawArtikulationPulsation()` | Rhythmic pulsing elements with accented beats |
| `drawArtikulationMorphing()` | Shapes that morph from angular to smooth across time |
| `drawArtikulationStaticBursts()` | Radio static / white noise burst patterns |
| `drawArtikulationTimbreLegend()` | Legend-like labels for timbres (I, II, III, IV, A, B, α, β) |
| `drawArtikulationVerticalSync()` | Vertical dashed alignment markers for simultaneous events |
| `drawArtikulationElectronicMotifs()` | Electronic waveform patterns (sine, square, sawtooth) |
| `drawArtikulationSpatialPanning()` | Left/right spatial panning indicators with L/R labels |

### Changed

- Artikulation mode dispatcher now uses probabilistic layering with 5 primary structures
- Mode elements list expanded from 4 to 20
- Updated mode description to include "electronic patterns"

### Technical

- All functions use `Math.max(1, ...)` for minimum element counts
- Call/response patterns use dotted connector lines
- Timbral stripes use gradient fills for fade-in effect
- Electronic motifs support sine, square, and sawtooth waveforms

---

## [3.3.0] - 2026-01-25

### Added

**Major Enhancement to Chance (Cage) Mode** - 20 new elements inspired by John Cage's graphic scores:

| Function | Inspiration | Description |
|----------|-------------|-------------|
| `drawFontanaMixGrid()` | Fontana Mix | Measurement grid overlay with numbered axes |
| `drawTransparentOverlays()` | Variations | Layered translucent overlapping shapes |
| `drawIChingHexagrams()` | Music of Changes | The 64 I Ching hexagram symbols |
| `drawStarChartTracings()` | Atlas Eclipticalis | Star dots with constellation-like connections |
| `drawSilenceBoxes()` | 4'33" | Empty duration markers with "TACET" labels |
| `drawMesosticText()` | Mesostics | Vertical acrostic text with horizontal extensions |
| `drawRyoanjiTracings()` | Ryoanji | Organic rock-outline curves with multiple tracings |
| `drawPreparedPianoSymbols()` | Prepared Piano | Bolt, rubber, mute, screw notation symbols |
| `drawCageTimeBrackets()` | Number Pieces | Flexible time brackets with duration notation |
| `drawChanceOperationMarks()` | I Ching method | Dice, trigrams, coins, randomness symbols |
| `drawCircusOverlays()` | Circus (1979) | Independent overlapping parts with varied content |
| `drawIndeterminacySymbols()` | Indeterminacy | "ad lib.", "?", "~", "[optional]" marks |
| `drawEventNotation()` | Happenings | Action/event boxes ("open window", "pause") |
| `drawNotationTypes()` | Concert for Piano | 8 different symbol systems (clusters, arrows, etc.) |
| `drawMycologicalForms()` | Cage's mycology | Mushroom shapes (Cage was a mycologist) |
| `drawNumberPieceBrackets()` | Number Pieces | Floating time windows with sound indications |
| `drawRadioStaticDots()` | Imaginary Landscape | Dense varying-opacity dots like radio static |
| `drawWaterWalkSymbols()` | Water Walk | Object/action notation with timeline arrows |
| `drawZenCircles()` | Ensō/Zen | Incomplete brush-stroke circles |
| `drawAnarchySymbols()` | Cage's anarchism | "free", "any", "all", "∞" freedom marks |

### Changed

- Chance mode dispatcher now uses probabilistic layering with 7 primary structures
- Mode elements list expanded from 4 to 23
- Added `manuscript` to Chance's preferred palettes

### Technical

- All functions use `Math.max(1, ...)` for minimum element counts
- Mesostic text uses bold styling for spine letters
- Zen circles use incomplete arcs (PI * 1.4 to PI * 1.9) for authentic Ensō aesthetic

---

## [3.2.0] - 2026-01-25

### Added

**Major Enhancement to Graph (Feldman) Mode** - 18 new elements inspired by Morton Feldman's Projections & Intersections:

| Function | Description |
|----------|-------------|
| `drawIctusMarks()` | Attack indicators with optional accent marks |
| `drawRegisterBands()` | H/M/L register zones with dashed dividers and labels |
| `drawTimeBrackets()` | Feldman-style [ ] time brackets with duration text |
| `drawProportionalGrid()` | Variable-width columns (proportional notation) |
| `drawDiamondNotes()` | Diamond noteheads for harmonics with stems |
| `drawClusterBrackets()` | Curly brackets grouping vertical pitch clusters |
| `drawDynamicGradients()` | Hairpin crescendo/decrescendo with dynamics |
| `drawSustainLines()` | Long horizontal ties (straight or wavy) |
| `drawTremoloMarks()` | Notes with tremolo slashes on stems |
| `drawInstrumentLabels()` | Abbreviated instrument names with techniques |
| `drawEmptyBoxes()` | Emphasized silence boxes with tacet markers |
| `drawConnectingLines()` | Curved voice-leading lines between notes |
| `drawSoftAttackMarks()` | Open circles for Feldman's pianissimo attacks |
| `drawDecayTrails()` | Fading resonance trails with opacity gradient |
| `drawDurationStacks()` | Vertical note stacks with duration numbers |
| `drawPedalMarkings()` | Piano pedal brackets (Ped. ———— *) |
| `drawBreathMarks()` | Commas, apostrophes, caesuras for pauses |
| `drawHarmonicHalos()` | Concentric rings showing overtone resonance |

### Changed

- Graph mode dispatcher now uses probabilistic layering with 5 primary structures
- Mode elements list expanded from 4 to 20
- Added `parchment` to Graph's preferred palettes

### Technical

- All functions use `Math.max(1, ...)` for minimum element counts
- Opacity gradients in decay trails use hex string formatting
- Register bands render dashed lines via loop segments

---

## [3.1.1] - 2026-01-24

### Fixed

**Empty Score Bug** - Prevented scores from rendering with no visual elements:

- Raised "extreme sparse" density floor from 0.03-0.1 to 0.15-0.25
- Added `Math.max(1, ...)` safety minimums to all primary drawing functions:
  - `drawArtikulationColorBlocks()` - min 1 block
  - `drawUpicArcs()` - min 1 arc
  - `drawClusterWedges()` - min 1 wedge
  - `drawChanceCurves()` - min 1 curve
  - `drawSpectralWaterfall()` - min 5 bins
  - `drawSpectralBands()` - min 3 bands
  - `drawTreatiseGeometric()` - min 1 shape
  - `drawOpenFormRects()` - min 1 rect
  - `drawBussottiCalligraphic()` - min 1 stroke
  - `drawTextInstructions()` - min 1 text
  - `drawStripsodyOnomatopoeia()` - min 1 sound
  - `drawAnkhrasmationDurations()` - min 1 unit
  - `drawBraxtonDiagrams()` - min 1 diagram

This ensures every score has visible content while preserving the "sparse" aesthetic for low-density variations.

---

## [3.1.0] - 2026-01-24

### Added

**Major Enhancement to Spiral Mode** - 10 new Crumb-inspired elements:

| Function | Description |
|----------|-------------|
| `drawSpiralVariants()` | Multiple spiral types: logarithmic, double, arms, Fermat/sunflower |
| `drawSpiralText()` | Text along spiral path (poetic fragments like "vox balaenae") |
| `drawSegmentedSpiral()` | Broken spirals with gaps representing rests |
| `drawSpiralNoteheads()` | Musical noteheads (filled, open, diamond, X, triangle) along spiral |
| `drawMysticalSymbols()` | Zodiac, planetary, and alchemical symbols arranged in circles |
| `drawMandalaPattern()` | Layered circular structures with rotational symmetry |
| `drawFibonacciSpiral()` | Golden ratio spiral with optional boxes (Crumb's numerology) |
| `drawSpiralWedges()` | Spirals contained within pie-wedge sections |
| `drawCrumbEye()` | "Eye of the Whale" imagery with iris, pupil, and notation |
| `drawSpiralBeaming()` | Note groups connected by beams following spiral curves |

### Changed

- Spiral mode now uses probabilistic layering of primary + secondary elements
- Updated mode dispatcher with enhanced selection logic
- Mode weight increased from 0.10 to 0.12
- Added `manuscript` to spiral's preferred palettes

### Technical

- All new functions respect `scaleFactor` for hi-res rendering
- Text elements use proper `push()`/`pop()` for rotation transforms
- Fibonacci spiral draws actual golden ratio boxes when enabled

---

## [3.0.1] - 2026-01-24

### Changed

**Canvas Size - A3 Landscape Format:**
- Standard: 1587×1122 pixels (√2 aspect ratio, ~1.414:1)
- Hi-res: 4961×3508 pixels (A3 at 300 DPI, print-ready)
- Previous: 1280×720 / 3840×2160 (16:9)

The A3 format better suits the traditional music score aesthetic and provides more vertical space for multi-voice compositions.

**Updated index.html:**
- Container max-width increased to 1950px
- Canvas uses `aspect-ratio: 1587/1122` for proper scaling
- Canvas uses `object-fit: contain` to prevent stretching
- Sidebar now sticky-positioned with proper height
- Added CSS for 7 new mode tags (treatise, openform, bussotti, textscore, stripsody, ankhrasmation, braxton)
- Responsive breakpoint adjusted to 1400px
- Version updated to v3.0.1

---

## [3.0.0] - 2026-01-24

### Added

**7 New Modes** - Based on extensive research into graphic notation composers:

| Mode | Composer | Visual Characteristics |
|------|----------|------------------------|
| **Treatise** | Cornelius Cardew | Abstract geometric shapes, thick lines, number sequences, circles |
| **OpenForm** | Earle Brown | Floating rectangles, mobile-like spatial arrangement (December 1952) |
| **Bussotti** | Sylvano Bussotti | Ornate calligraphic gestures, theatrical flourishes, ink splatters |
| **TextScore** | Stockhausen/Eno | Verbal instructions, cryptic phrases, typographic layout |
| **Stripsody** | Cathy Berberian | Comic onomatopoeia (BANG!, POW!), speech bubbles, action lines |
| **Ankhrasmation** | Wadada Leo Smith | Colored duration bars, symbolic marks, rhythmic cells |
| **Braxton** | Anthony Braxton | Diagrammatic notation, schematic symbols, language types |

**7 New Palettes:**
- `treatiseBlack` - Stark black-on-white geometric
- `brownMobile` - Earle Brown's warm paper aesthetic
- `bussottiInk` - Theatrical calligraphic with red accent
- `textMinimal` - Clean minimal for text scores
- `stripsodyPop` - Comic-inspired primary colors
- `ankhrasmationColor` - Full spectrum for duration language
- `braxtonDiagram` - Technical blueprint aesthetic

**New Drawing Functions:**
- Treatise: `drawTreatiseGeometric()`, `drawTreatiseNumbers()`, `drawTreatiseThickLines()`
- OpenForm: `drawOpenFormRects()`, `drawOpenFormSpatial()`
- Bussotti: `drawBussottiCalligraphic()`, `drawBussottiFlourishes()`, `drawBussottiSplatters()`
- TextScore: `drawTextInstructions()`, `drawTextCryptic()`
- Stripsody: `drawStripsodyOnomatopoeia()`, `drawStripsodyBubbles()`, `drawStripsodyActionLines()`
- Ankhrasmation: `drawAnkhrasmationDurations()`, `drawAnkhrasmationSymbols()`
- Braxton: `drawBraxtonDiagrams()`, `drawBraxtonLanguageTypes()`

### Research Sources

- [Cardew's Treatise](https://davidhall.io/treatise-score-graphic-notation/) - 193-page abstract score
- [Earle Brown December 1952](https://simpleharmonicmotion.org/december-1952-and-graphic-notation/) - Calder mobile inspiration
- [Sylvano Bussotti](https://en.wikipedia.org/wiki/Sylvano_Bussotti) - Graphic scores as visual art
- [Stockhausen Plus-Minus](https://en.wikipedia.org/wiki/Plus-Minus_(Stockhausen)) - Process composition
- [Eno's Oblique Strategies](https://en.wikipedia.org/wiki/Oblique_Strategies) - Text-based creativity
- [Berberian's Stripsody](https://interdisciplinaryitaly.org/stripsody-transforming-comics-into-vanguard-art/) - Comic notation
- [Wadada Leo Smith Ankhrasmation](https://newmusicusa.org/nmbx/wadada-leo-smith-decoding-ankhrasmation/) - Language scores
- [Anthony Braxton Language Music](https://tricentricfoundation.org/carl-testa-essay) - Diagrammatic system

### Technical

- Total modes: 14 (7 original + 7 new)
- Total palettes: 17 (10 original + 7 new)
- Mode weights adjusted to accommodate new modes
- Full backward compatibility maintained for existing hashes

---

## [2.2.1] - 2026-01-24

### Fixed

**Section Markers:**
- Section [A] now always shows (was being skipped to avoid overflow)
- Moved markers inside score area (just below top margin)
- Letters now centered inside boxes
- Box size increased slightly for better visibility

**Metronome Marks:**
- Replaced Unicode note symbols (♩, 𝅗𝅥) with hand-drawn note graphics
- Draws actual note head, stem, and flag - works in all browsers

**Footer:**
- Removed city names from bottom left
- Increased text size (7px → 9px)
- Expanded duration variants (26 options including "ca. 5'", "~4'30\"", "duration: variable", "approx. 6 min.", etc.)

---

## [2.2.0] - 2026-01-24

### Fixed

**Header Layout** - No more overlapping elements:
- Time signature at far left margin (bold)
- Tempo marking offset to the right with proper spacing
- Section markers [A] [B] positioned just above staff, not in header row
- First section marker skipped if it would overlap with time/tempo

**Paper Aesthetics** - Replaced cheap ellipses with sophisticated treatments:
- Fine horizontal fiber texture (like real paper grain)
- Subtle grain noise with tiny rectangles
- Decorative border frames (4 styles: double-line, ruled margins, art nouveau, corner brackets)
- Optional corner ornaments (fleurons, crosshatch, spiral flourishes)
- Organic foxing spots with irregular shapes and satellite micro-spots

### Changed

- Removed mode names from top right (was "Artikulation + UPIC" etc.)
- Added musical metadata instead: opus numbers, work titles, dedications
- Added proper footer with year, location, and duration
- Metronome marks now positioned after tempo text
- More authentic musical score typography

---

## [2.1.0] - 2026-01-24

### Added

**Enhanced Spectral Mode** - Complete overhaul with engraved aesthetic:
- **Engraving helpers:** `drawHatching()`, `drawCrossHatching()`, `drawStippling()`
- **Spectrogram waterfall** - Flowing time-frequency representation with gradient fills
- **Formant contours** - Smooth frequency envelopes with cross-hatched peaks
- **Attack transients** - Sharp onset spikes with stippled energy density
- **Resonance bells** - Gaussian frequency response curves with hatched fills
- **Enhanced harmonic stacks** - Now with partial-specific hatching and stippling

**Expanded Musical Symbols and Terminology:**
- **26 dynamic markings** - From ppp to fff, including sfz, fp, rfz, subito, più, poco
- **35+ expression terms** - Italian directions (dolce, cantabile, espressivo, etc.)
- **10 articulation symbols** - Accent, staccato, tenuto, fermata, marcato, trill, caesura, breath, glissando, harmonic
- **40+ performance instructions** - Extended techniques for strings, winds, brass
- **Metronome marks** - With unicode note symbols and duration estimates

**Dynamic Size Variation:**
- All notation marks now vary in size (8-18px range)
- Larger symbols get full opacity, smaller ones slightly faded

### Changed

- Spectral mode dispatcher now randomly selects from waterfall, formants, or bands as primary
- Secondary elements (stacks, transients, bells) added probabilistically
- More musical symbols distributed across the score

### Technical

- Helper functions for engraved drawing techniques
- Canvas clipping for hatching within curves
- Unicode musical symbols for metronome marks

---

## [2.0.0] - 2025-01-24

### Added

**7 Distinct Modes** - Each with unique visual vocabulary:
- **Artikulation** (Ligeti/Wehinger) - Color-coded timbral blocks, dense clusters
- **UPIC** (Xenakis) - Freehand arcs, glissandi, siren sweeps, ruled lines
- **Cluster** (Penderecki) - Dense wedge shapes, cluster bands, extended technique symbols
- **Graph** (Feldman) - Grid boxes, sparse pointillist, circuit-diagram aesthetic
- **Chance** (Cage) - Overlapping curves and dots, intersection derivation
- **Spectral** (Murail/Grisey) - Frequency bands, harmonic stacks, spectral envelopes
- **Spiral** (Crumb) - Circular patterns, spiral notation, numerological structure

**Layered Hybrid Blending System:**
- **Dominant blend** - Primary mode (70%) with secondary accents (30%)
- **Sectional blend** - Different sections use different modes
- **Voice-based blend** - Each voice/layer has its own assigned mode

**Mode-Authentic Palettes:**
- `wehinger` - Artikulation's color-coded scheme (red, blue, green, orange, etc.)
- `upicBlue` - UPIC system blue plotting paper aesthetic
- `spectralHeat` - Dark spectrogram with heat-map gradients
- `crumbRitual` - George Crumb's mystical dark scores
- `cageTransparent` - Cage's clean overlay aesthetic

**New Features:**
- Hi-Res mode (H key) - 4K output (3840x2160) for print quality
- Mode count rarity - Single mode common, quad mode legendary
- Mode display in viewer with color-coded tags
- Palette preview swatches in UI

### Changed

- Complete restructuring of feature generation for multi-mode support
- Drawing pipeline now dispatches to mode-specific drawing functions
- Voice and Section classes now track assigned modes for blending
- Expanded rarity curves for new feature dimensions

### Technical

- scaleFactor system for resolution-independent drawing
- Mode dispatcher pattern for extensibility
- Weighted random mode selection

---

## [1.0.0] - 2025-01-24

### Added

- Initial release of Graphical Score generative artwork
- Hash-based sfc32 PRNG for deterministic generation (Art Blocks compatible)
- Multi-voice system (1-12 voices with rarity-based distribution)
- Four visual element types:
  - Ruled lines and glissandi (Xenakis-style)
  - Density clouds (Ligeti-style micropolyphony)
  - Pointillist dots (various note head styles)
  - Geometric shapes (architectural forms)
- Five archival color palettes (sepia, manuscript, parchment, aged, blueprint)
- Four structure types: flowing, sectioned, mathematical (golden ratio), palindrome
- Feature rarity system with common/uncommon/rare/legendary tiers
- Style variation: hybrid, Ligeti-leaning, Xenakis-leaning, pure
- Musical notation aesthetics (time signature, tempo marking, dynamics, rehearsal marks)
- Palindrome symmetry for legendary structure type
- Dev mode viewer with:
  - Feature display with rarity badges
  - Parameter sliders for live adjustment
  - Rarity curve visualization
  - Like/Dislike feedback system with localStorage persistence
  - Export feedback to console
- Keyboard shortcuts (R=regenerate, S=save, L=like, D=dislike)
- Paper texture and vignette effects
- Staff line guidelines for each voice
- Section dividers with dashed lines

### Technical

- p5.js framework
- 1280x720 canvas (16:9 landscape)
- Static rendering (no animation loop)
- Modular drawing functions for each element type
