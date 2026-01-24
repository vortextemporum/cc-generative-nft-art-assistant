# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
