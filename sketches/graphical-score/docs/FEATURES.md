# Graphical Score - Features & Parameters Documentation

This document provides a comprehensive explanation of all features, parameters, modes, and palettes in the Graphical Score generative art system.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Parameters](#core-parameters)
3. [Modes (21 Total)](#modes-21-total)
4. [Palettes (22 Total)](#palettes-22-total)
5. [Structures (9 Types)](#structures-9-types)
6. [Rarity System](#rarity-system)
7. [Technical Details](#technical-details)

---

## Overview

The Graphical Score is a generative system that creates visual music notation inspired by 20th/21st century avant-garde composers. Each output is deterministically generated from a hash value, ensuring reproducibility while maintaining artistic variety.

**Canvas Dimensions:**
- Normal: 1587 × 1122 pixels (A3 landscape ratio)
- Hi-Res: 4961 × 3508 pixels (A3 at 300 DPI)

---

## Core Parameters

### Mode Count
How many compositional modes are active simultaneously.

| Value | Probability | Description |
|-------|-------------|-------------|
| Single | 35% | One mode only |
| Dual | 40% | Two modes blended |
| Triple | 20% | Three modes blended |
| Quad | 5% | Four modes blended (rare) |

### Blend Type
How multiple modes are combined when more than one is active.

| Type | Probability | Description |
|------|-------------|-------------|
| Dominant | 40% | Primary mode dominates, secondary modes add accents |
| Sectional | 35% | Different sections of the score use different modes |
| Voice-Based | 25% | Each voice/instrument has its own assigned mode |

*Note: If only one mode is active, blend type is forced to "dominant".*

### Voice Count
Number of horizontal voice lanes in the score.

| Category | Probability | Range | Description |
|----------|-------------|-------|-------------|
| Ensemble | 50% | 3-5 voices | Standard chamber ensemble |
| Chamber | 28% | 6-8 voices | Larger chamber group |
| Solo | 14% | 1-2 voices | Solo or duo |
| Orchestra | 8% | 9-12 voices | Full orchestral texture |

### Density
How densely packed the notation elements are.

| Level | Probability | Value Range | Description |
|-------|-------------|-------------|-------------|
| Balanced | 45% | 0.4-0.6 | Moderate, readable density |
| Dense | 28% | 0.7-0.88 | Thick texture, many elements |
| Sparse | 18% | 0.12-0.28 | Minimal, spacious notation |
| Extreme | 9% | 0.15-0.25 or 0.88-0.98 | Very sparse or very dense |

### Tempo
Musical tempo indication displayed on the score.

| Marking | Character |
|---------|-----------|
| Lento | Very slow |
| Adagio | Slow |
| Andante | Walking pace |
| Moderato | Moderate |
| Allegro | Fast |
| Presto | Very fast |
| Senza tempo | Without tempo |
| Liberamente | Freely |
| Rubato | Flexible tempo |

### Time Signature
Rhythmic organization of the score.

| Signature | Type |
|-----------|------|
| 4/4 | Common time |
| 3/4 | Waltz time |
| 5/4 | Asymmetric |
| 6/8 | Compound duple |
| 7/8 | Asymmetric |
| 5/8 | Asymmetric |
| 9/8 | Compound triple |
| free | No fixed meter |
| aleatoric | Chance-determined |

---

## Modes (21 Total)

### Original Modes (v2.0)

#### 1. Artikulation
**Composer:** Ligeti/Wehinger
**Weight:** 15%
**Description:** Color-coded timbral blocks, dense clusters, call/response patterns, electronic music visualization

**Elements:**
- `colorBlocks` - Colored rectangular blocks representing timbres
- `timbralClusters` - Dense groupings of colored marks
- `callResponse` - Paired elements suggesting musical dialogue
- `densityClouds` - Gaussian density distributions
- `timbralStripes` - Horizontal gradient stripes
- `glitchPatterns` - Short stuttering electronic bursts
- `speechFragments` - Speech-like contour lines
- `attackDecay` - Envelope shapes showing attack/decay
- `connectors` - Curved lines connecting related events
- `wedges` - Crescendo/diminuendo wedge shapes
- `electronicMotifs` - Sine, square, sawtooth waveforms
- `spatialPanning` - L/R spatial indicators

**Preferred Palettes:** wehinger, manuscript

---

#### 2. UPIC
**Composer:** Xenakis
**Weight:** 15%
**Description:** Freehand arcs, glissandi, stochastic masses, mathematical curves, architectural structures

**Elements:**
- `arcs` - Freehand curved lines
- `glissandi` - Sliding pitch lines
- `glissandiBands` - Multiple parallel glissandi (Metastaseis style)
- `densityMass` - Dense stochastic texture masses
- `graphPaper` - Grid overlay like original UPIC screen
- `mathCurves` - Parabolas, exponentials, logarithms
- `arborescences` - Tree-like branching structures
- `polytopes` - Geometric spatial structures
- `granularCloud` - Dense granular synthesis representation
- `logisticMap` - Chaos theory curves
- `harmonicSeries` - Overtone series visualization

**Preferred Palettes:** upicBlue, blueprint

---

#### 3. Cluster
**Composer:** Penderecki
**Weight:** 15%
**Description:** Dense wedge shapes, micropolyphony, extended string techniques, black notation

**Elements:**
- `wedges` - Cluster wedges expanding/contracting
- `clusterBands` - Dense pitch bands
- `glissandi` - Sliding cluster glissando
- `micropolyphony` - Dense micropolyphonic texture
- `stringEffects` - Sul pont, col legno, tremolo symbols
- `quarterTones` - Microtonal accidentals
- `aleatoryBox` - Boxed aleatory sections
- `blackNotation` - Dense filled "black notation" areas
- `tremoloSlashes` - Tremolo indication marks
- `harmonicDiamond` - Diamond harmonic notation

**Preferred Palettes:** manuscript, sepia

---

#### 4. Graph
**Composer:** Feldman
**Weight:** 15%
**Description:** Sparse pointillist grid, time brackets, soft attacks, decay trails

**Elements:**
- `gridBoxes` - Grid-based notation boxes
- `sparsePoints` - Pointillist sparse notes
- `timeBrackets` - Feldman-style [ ] time notation
- `registerBands` - H/M/L register zones
- `diamondNotes` - Diamond noteheads for harmonics
- `dynamicGradients` - Hairpin crescendo/decrescendo
- `sustainLines` - Long horizontal ties
- `decayTrails` - Fading resonance with opacity
- `breathMarks` - Commas, caesuras for pauses
- `harmonicHalos` - Concentric overtone rings

**Preferred Palettes:** aged, manuscript, parchment

---

#### 5. Chance
**Composer:** Cage
**Weight:** 15%
**Description:** I Ching operations, star charts, prepared piano, silence, Zen circles

**Elements:**
- `iChingHexagrams` - The 64 I Ching symbols
- `starChartTracings` - Star dots with connections (Atlas Eclipticalis)
- `silenceBoxes` - Empty boxes with "TACET" (4'33")
- `mesosticText` - Vertical acrostic text patterns
- `ryoanjiTracings` - Rock-outline curves
- `preparedPianoSymbols` - Bolt, mute, screw notation
- `zenCircles` - Incomplete Ensō circles
- `anarchySymbols` - "free", "any", "∞" marks

**Preferred Palettes:** cageTransparent, blueprint, manuscript

---

#### 6. Spectral
**Composer:** Murail/Grisey
**Weight:** 15%
**Description:** Frequency bands, overtone analysis, spectral transformations, sonograms

**Elements:**
- `frequencyBands` - Horizontal frequency bands
- `harmonicStacks` - Overtone stacks
- `spectralEnvelopes` - Spectral envelope curves
- `partials` - Individual harmonic partials
- `sonogram` - Sonogram-like dense display
- `morphing` - Morphing between spectral states
- `differenceTones` - Combination/difference tones
- `ringMod` - Ring modulation sidebands

**Preferred Palettes:** spectralHeat (dark), blueprint

---

#### 7. Spiral
**Composer:** Crumb
**Weight:** 12%
**Description:** Circular/spiral notation, mandalas, eye imagery, mystical symbols

**Elements:**
- `spiralPaths` - Logarithmic spiral paths
- `spiralText` - Text along spiral path
- `spiralNoteheads` - Musical noteheads on spiral
- `circularNotation` - Circular arrangement
- `mysticalSymbols` - Zodiac, planetary, alchemical symbols
- `mandalaPattern` - Layered circular structures
- `fibonacciSpiral` - Golden ratio spiral
- `crumbEye` - "Eye of the Whale" imagery

**Preferred Palettes:** crumbRitual (dark), parchment, manuscript

---

### Expanded Modes (v3.0)

#### 8. Treatise
**Composer:** Cardew
**Weight:** 8%
**Description:** Abstract geometric shapes, lifeline, tree structures, grids

**Elements:**
- `lifeline` - Central horizontal lifeline
- `tree` - Tree/branching structures
- `parallelLines` - Groups of parallel lines
- `solids` - Solid filled shapes
- `nests` - Nested concentric circles
- `zigzag` - Zigzag patterns
- `scatteredDots` - Scattered dot patterns
- `mass` - Dense black irregular masses

**Preferred Palettes:** treatiseBlack, manuscript

---

#### 9. OpenForm
**Composer:** Earle Brown
**Weight:** 8%
**Description:** Floating rectangles, mobile arrangements, proportional notation

**Elements:**
- `floatingRects` - Floating rectangular elements
- `mobile` - Mobile-like arrangements
- `proportional` - Proportional time-space bars
- `balance` - Visual weight and balance
- `trajectory` - Curved arrows showing paths
- `verticalStacks` - Stacked vertical bars
- `diagonal` - Diagonal arrangements

**Preferred Palettes:** brownMobile, aged

---

#### 10. Bussotti
**Composer:** Sylvano Bussotti
**Weight:** 7%
**Description:** Ornate calligraphic gestures, theatrical flourishes, ink drips

**Elements:**
- `calligraphicLines` - Calligraphic flourish lines
- `inkSplatters` - Ink splatter effects
- `curvedStaff` - Curved musical staves
- `drips` - Ink drip effects
- `textFragments` - Italian poetic fragments
- `theatrical` - Theatrical direction marks
- `vines` - Vine-like decorative lines
- `crescendo` - Dramatic crescendo shapes

**Preferred Palettes:** bussottiInk, sepia

---

#### 11. TextScore
**Composer:** Stockhausen/Eno
**Weight:** 7%
**Description:** Verbal instructions, cryptic phrases, intuitive music

**Elements:**
- `textInstructions` - Text-based instructions
- `poetic` - Spaced poetic phrases
- `numbered` - Numbered instruction lists
- `stockhausen` - Intuitive music text
- `oblique` - Oblique Strategies prompts
- `conceptual` - Conceptual art instructions
- `questions` - Question-based instructions
- `whisper` - Small, quiet instructions

**Preferred Palettes:** textMinimal, manuscript

---

#### 12. Stripsody
**Composer:** Cathy Berberian
**Weight:** 6%
**Description:** Comic onomatopoeia, speech bubbles, cartoon visual elements

**Elements:**
- `onomatopoeia` - Comic sound words (BANG!, POW!)
- `speechBubbles` - Speech/thought bubbles
- `explosions` - Explosion burst shapes
- `stars` - Impact stars
- `speedLines` - Motion streaks
- `faces` - Simple expressive emoticons
- `lightning` - Lightning bolt shapes
- `spirals` - Dizzy spiral marks

**Preferred Palettes:** stripsodyPop, parchment

---

#### 13. Ankhrasmation
**Composer:** Wadada Leo Smith
**Weight:** 6%
**Description:** Colored duration symbols, rhythmic cells, improvisation zones

**Elements:**
- `colorBars` - Colored horizontal bars
- `diagonals` - Diagonal direction indicators
- `cells` - Rhythmic unit cells
- `arrows` - Direction arrows
- `gradients` - Color gradient intensity bars
- `improvisationZone` - Free improvisation zones
- `parallel` - Parallel color lines

**Preferred Palettes:** ankhrasmationColor, manuscript

---

#### 14. Braxton
**Composer:** Anthony Braxton
**Weight:** 6%
**Description:** Diagrammatic notation, schematic symbols, technical drawings

**Elements:**
- `diagramSymbols` - Diagrammatic notation
- `circuit` - Circuit-like schematic symbols
- `flowArrows` - Flow/direction arrows
- `zones` - Zone/region markers
- `pathways` - Pathway indicators
- `modular` - Modular building blocks
- `labels` - Text labels and identifiers

**Preferred Palettes:** braxtonDiagram, blueprint

---

### New Modes (v3.23+)

#### 15. Mobile
**Composer:** Haubenstock-Ramati
**Weight:** 5%
**Description:** Calder-inspired mobile scores, floating fragments, multi-directional reading

**Elements:**
- `floatingCells` - Floating musical fragment cells
- `dottedPaths` - Dotted connecting lines
- `mobileBranches` - Branching mobile arms
- `suspendedShapes` - Hanging shapes
- `pivotPoints` - Central pivot points
- `balancedArms` - Balanced arm structures

**Preferred Palettes:** mobileSilver, brownMobile, manuscript

---

#### 16. Polymorphic
**Composer:** Logothetis
**Weight:** 5%
**Description:** Invented symbol system, elastic time, gravity-influenced shapes

**Elements:**
- `logothetisGlyphs` - 12 types of invented symbols
- `elasticTime` - Variable-width time bands
- `gravityShapes` - Shapes heavier at bottom
- `soundMasses` - Dense klangmassen
- `transformChains` - Transformation chains
- `expandingForms` - Outward expanding forms

**Preferred Palettes:** polymorphicOrange, sepia, manuscript

---

#### 17. Theater
**Composer:** Kagel
**Weight:** 5%
**Description:** Instrumental theater, stage directions, absurdist actions

**Elements:**
- `stageDirections` - Stage direction text boxes
- `actionSymbols` - Hand, eye, mouth symbols
- `objectNotation` - Chair, table, prop symbols
- `movementArrows` - Performer movement arrows
- `entranceExits` - ENT/EXIT door markers
- `lightingCues` - LX cue markers
- `absurdistMarks` - Dada-inspired marks

**Preferred Palettes:** theaterRed, manuscript, blueprint

---

#### 18. Cues
**Composer:** Christian Wolff
**Weight:** 5%
**Description:** Participatory cueing, performer interdependence

**Elements:**
- `cueSymbols` - Cue circles with numbers
- `conditionalBrackets` - If/then/else brackets
- `listeningIndicators` - Ear symbols
- `waitSigns` - Wait indicators
- `coordinationLines` - Dashed coordination lines
- `playerNumbers` - Boxed player numbers
- `holdSymbols` - Fermata-like holds

**Preferred Palettes:** cuesGreen, manuscript, blueprint

---

#### 19. Indigenous
**Composer:** Raven Chacon
**Weight:** 5%
**Description:** Flag-scores, land-based symbols, Indigenous perspectives

**Elements:**
- `flagSymbols` - Flags as notation
- `landMarkers` - Location/place markers
- `windDirections` - Wind with wavy lines
- `celestialMarks` - Sun, moon, star symbols
- `waterSymbols` - Wavy water lines
- `fireSymbols` - Flame shapes
- `gatheringCircles` - Circles with people marks
- `cardinalPoints` - N/S/E/W directions

**Preferred Palettes:** indigenousTurquoise, sepia, manuscript

---

#### 20. DeepListening
**Composer:** Pauline Oliveros
**Weight:** 5%
**Description:** Meditation-based scores, mandala patterns, breath notation

**Elements:**
- `mandalaCircles` - Concentric mandala circles
- `breathCycles` - Inhale/exhale curves
- `awarenessFoci` - Target-like focus points
- `meditationText` - Meditation instruction words
- `radiatingLines` - Lines from center
- `pulseMarks` - Heartbeat-like pulses
- `silenceFields` - Areas of silence

**Preferred Palettes:** cageTransparent, manuscript, parchment

---

#### 21. SoundMap
**Composer:** Annea Lockwood
**Weight:** 5%
**Description:** Geographic notation, river maps, environmental sound mapping

**Elements:**
- `riverLines` - Meandering river lines
- `topographicContours` - Topographic contour lines
- `locationMarkers` - Recording location pins
- `soundSources` - Sound wave emanation points
- `flowArrows` - Water/sound flow arrows
- `confluencePoints` - Meeting points
- `fieldRecordingSymbols` - Microphone symbols
- `listeningPosts` - Headphone station markers

**Preferred Palettes:** blueprint, upicBlue, manuscript

---

## Palettes (22 Total)

### Archival Palettes (5)
Light, aged paper aesthetics for traditional score appearance.

| Name | Paper | Ink | Description |
|------|-------|-----|-------------|
| sepia | #f4efe4 | #2a1f14 | Warm sepia-toned aged paper |
| manuscript | #f5f0e1 | #1a1a1a | Classic manuscript paper |
| parchment | #f2e8d5 | #3a2a1a | Old parchment texture |
| aged | #ebe3d3 | #2f2218 | Heavily aged appearance |
| blueprint | #e8eef4 | #1a2f4a | Blue drafting paper |

### Mode-Authentic Palettes (17)
Colors matching the aesthetic of specific composers/works.

| Name | Paper | Ink | For Mode | Description |
|------|-------|-----|----------|-------------|
| wehinger | #f8f6f0 | #1a1a1a | Artikulation | 7-color timbre coding |
| upicBlue | #d8e4f0 | #0a1a3a | UPIC | Blue plotting paper |
| spectralHeat | #0a0a14 | #ffffff | Spectral | Dark with heat gradient |
| crumbRitual | #1a1820 | #d4c4a8 | Spiral | Dark mystical tones |
| cageTransparent | #fafafa | #1a1a1a | Chance | Clean overlay aesthetic |
| treatiseBlack | #ffffff | #000000 | Treatise | Stark black-on-white |
| brownMobile | #f5f0e6 | #1a1a1a | OpenForm | December 1952 aesthetic |
| bussottiInk | #faf8f0 | #0a0808 | Bussotti | Theatrical calligraphic |
| textMinimal | #f8f8f8 | #1a1a1a | TextScore | Clean minimal text |
| stripsodyPop | #fffef5 | #000000 | Stripsody | 6-color comic palette |
| ankhrasmationColor | #f5f5f5 | #1a1a1a | Ankhrasmation | 7-color duration bars |
| braxtonDiagram | #f8f6f0 | #0a1420 | Braxton | Technical schematic |
| mobileSilver | #f4f4f4 | #1a1a1a | Mobile | Clean modern silver |
| polymorphicOrange | #faf5e8 | #c45a20 | Polymorphic | Vienna 1960s orange |
| theaterRed | #f8f4f0 | #1a1a1a | Theater | Dramatic red accent |
| cuesGreen | #f5f8f5 | #1a2a1a | Cues | Green "go/cue" aesthetic |
| indigenousTurquoise | #faf8f0 | #2a2018 | Indigenous | Earth and sky tones |

### Dark Palettes
Two palettes use dark backgrounds (paper color luminance < 0.3):
- **spectralHeat** - Black background (#0a0a14) with white ink
- **crumbRitual** - Dark purple-black (#1a1820) with cream ink

*Print-friendly mode automatically uses dark background (#1a1a1a) for these palettes.*

---

## Structures (9 Types)

The structure determines how the horizontal canvas is divided into sections.

| Structure | Probability | Sections | Description |
|-----------|-------------|----------|-------------|
| Flowing | 24% | 1 | Single continuous flow, no divisions |
| Sectioned | 17% | 2-5 | Regular evenly-divided sections |
| Mathematical | 13% | 3-6 | Fibonacci-ratio section widths |
| Fragmentary | 10% | 5-9 | Many narrow, irregular sections |
| Gestural | 10% | 1-2 | Organic curves define sections |
| Modular | 8% | 4-8 | Independent modular blocks |
| Polyphonic | 7% | 2-4 | Overlapping voice streams |
| Stacked | 6% | 2-4 | Vertical layer stacking |
| Palindrome | 5% | 3-7 | Mirror structure at variable point |

### Structure Details

**Flowing:** No section boundaries. Elements flow freely across the entire score width.

**Sectioned:** Regular vertical divisions with optional boundary lines.

**Mathematical:** Section widths follow Fibonacci-derived ratios (1, 2, 3, 5...).

**Fragmentary:** Many narrow sections with irregular widths. Some sections marked with denser emphasis.

**Gestural:** Curved, organic boundaries between sections. No straight lines.

**Modular:** Independent rectangular modules that may overlap or have gaps.

**Polyphonic:** Multiple overlapping horizontal streams. Each stream may have its own mode assignment.

**Stacked:** Vertical layers stacked on top of each other rather than horizontal sections.

**Palindrome:** Mirrored structure around a variable point (30-70% from left). Second half mirrors first half.

---

## Rarity System

Features are assigned rarity labels based on their probability:

| Rarity | Probability Range | Color Badge |
|--------|-------------------|-------------|
| Common | > 30% | Gray |
| Uncommon | 15-30% | Green |
| Rare | 5-15% | Blue |
| Legendary | < 5% | Gold |

### Rarity by Feature

**Mode Count:**
- Single (35%) - Common
- Dual (40%) - Common
- Triple (20%) - Uncommon
- Quad (5%) - Legendary

**Voice Count:**
- Ensemble 3-5 (50%) - Common
- Chamber 6-8 (28%) - Uncommon
- Solo 1-2 (14%) - Rare
- Orchestra 9-12 (8%) - Legendary

**Structure:**
- Flowing (24%) - Common
- Sectioned (17%) - Uncommon
- Mathematical, Fragmentary (10-13%) - Rare
- Gestural, Modular, Polyphonic, Stacked, Palindrome (5-10%) - Legendary

---

## Technical Details

### PRNG (Pseudo-Random Number Generator)
The system uses the SFC32 algorithm seeded from the hash value. This ensures:
- Identical hash → identical output
- Deterministic generation across all modes (normal, hi-res, print-friendly)

### Rendering Modes

| Mode | Resolution | Background | Textures |
|------|------------|------------|----------|
| Normal | 1587×1122 | Palette paper | Full |
| Hi-Res | 4961×3508 | Palette paper | Full (scaled) |
| Print-Friendly | 4961×3508 | White or #1a1a1a | None |

*Print-friendly uses dark background for dark palettes (spectralHeat, crumbRitual).*

### Decorative Border
All outputs use a standardized double-line frame border:
- Outer frame: 15px inset (scaled)
- Inner frame: 20px inset (scaled)
- Color: Ink color at 20% opacity

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save PNG |
| H | Toggle Hi-Res mode |
| P | Toggle Print-Friendly mode |
| L | Like (feedback) |
| D | Dislike (feedback) |

---

## Version History

- **v3.35.x** - PRNG consistency fixes, panzoom viewer, dark palette print-friendly
- **v3.32.0** - Added SoundMap mode (Annea Lockwood)
- **v3.28.0** - Added DeepListening mode (Pauline Oliveros)
- **v3.27.0** - Added Indigenous mode (Raven Chacon)
- **v3.26.0** - Added Cues mode (Christian Wolff)
- **v3.25.0** - Added Theater mode (Kagel)
- **v3.24.0** - Added Polymorphic mode (Logothetis)
- **v3.23.0** - Added Mobile mode (Haubenstock-Ramati)
- **v3.0.0** - Added 7 new modes (Treatise through Braxton)
- **v2.0.0** - Original 7 modes with blending system
