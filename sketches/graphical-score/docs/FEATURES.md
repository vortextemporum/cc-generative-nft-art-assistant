# Graphical Score - Features Documentation

## Overview

Each generated score derives all features deterministically from a 64-character hash. This ensures the same hash always produces the same visual output while different hashes create unique variations.

## Feature Categories

### 1. Style

Determines the overall visual vocabulary and which elements are emphasized.

| Tier | Name | Probability | Description |
|------|------|-------------|-------------|
| Common | Hybrid | 50% | Balanced mix of Ligeti and Xenakis elements |
| Uncommon | Ligeti-leaning | 25% | Emphasis on clouds, dots, micropolyphonic texture |
| Rare | Xenakis-leaning | 15% | Emphasis on ruled lines, geometric shapes |
| Legendary | Pure | 10% | Exclusively one composer's vocabulary (50/50 Ligeti or Xenakis) |

**Visual Impact:**
- Hybrid: All element types appear with equal probability
- Ligeti-leaning: 40% clouds, 35% dots, 15% lines, 10% shapes
- Xenakis-leaning: 35% lines, 35% shapes, 15% clouds, 15% dots
- Pure Ligeti: Only clouds and dots
- Pure Xenakis: Only lines and shapes

### 2. Voice Count

Determines vertical layering (number of "instruments" or pitch registers).

| Tier | Name | Probability | Voice Count | Description |
|------|------|-------------|-------------|-------------|
| Common | Ensemble | 55% | 3-5 | Standard chamber texture |
| Uncommon | Chamber | 25% | 6-8 | Richer vertical space |
| Rare | Solo | 12% | 1-2 | Intimate, focused |
| Legendary | Orchestra | 8% | 9-12 | Maximum density, full canvas |

**Visual Impact:**
- Solo: Large vertical space per voice, sparse layout
- Ensemble: Balanced, readable layers
- Orchestra: Densely stacked, complex interactions

### 3. Structure

Determines horizontal (temporal) organization.

| Tier | Name | Probability | Description |
|------|------|-------------|-------------|
| Common | Flowing | 45% | No section divisions, continuous evolution |
| Uncommon | Sectioned | 30% | 2-4 distinct sections with dividers |
| Rare | Mathematical | 17% | Golden ratio proportions (φ = 1.618) |
| Legendary | Palindrome | 8% | Score mirrors itself at center axis |

**Visual Impact:**
- Flowing: Seamless left-to-right narrative
- Sectioned: Clear breaks, contrasting characters
- Mathematical: Decreasing section widths following phi
- Palindrome: Perfect bilateral symmetry (marked with dashed center line)

### 4. Density

Controls overall mark density across the score.

| Tier | Name | Probability | Density Value | Description |
|------|------|-------------|---------------|-------------|
| Common | Balanced | 50% | 0.4-0.6 | Readable, breathing room |
| Uncommon | Dense | 25% | 0.7-0.85 | Full, active texture |
| Rare | Sparse | 15% | 0.15-0.3 | Minimal, contemplative |
| Legendary | Extreme | 10% | 0.05-0.15 or 0.85-0.95 | Near-empty or overwhelming |

**Visual Impact:**
- Sparse: Few marks, maximum white space, meditative
- Balanced: Clear structure, comfortable reading
- Dense: Active, energetic, complex
- Extreme sparse: Nearly blank, Feldman-esque
- Extreme dense: Barely readable, total saturation

### 5. Contrast

Controls variation in density across sections/time.

| Tier | Name | Probability | Contrast Value | Description |
|------|------|-------------|----------------|-------------|
| Common | Moderate | 45% | 0.3-0.5 | Gentle variation |
| Uncommon | High | 30% | 0.6-0.8 | Clear dynamic arc |
| Rare | Low | 18% | 0.1-0.2 | Uniform throughout |
| Legendary | Extreme | 7% | 0.85-1.0 | Dramatic shifts |

**Visual Impact:**
- Low: Consistent texture, no climaxes
- Moderate: Subtle ebb and flow
- High: Clear tension/release cycles
- Extreme: Jarring juxtapositions, silence to tutti

### 6. Palette

Visual color scheme (archival manuscript aesthetic).

| Name | Probability | Paper | Ink | Character |
|------|-------------|-------|-----|-----------|
| Sepia | 30% | Cream #f4efe4 | Brown #2a1f14 | Classic aged |
| Manuscript | 25% | Off-white #f5f0e1 | Black #1a1a1a | Scholarly |
| Parchment | 20% | Warm cream #f2e8d5 | Dark brown #3a2a1a | Medieval |
| Aged | 15% | Tan #ebe3d3 | Umber #2f2218 | Weathered |
| Blueprint | 10% | Blue-gray #e8eef4 | Navy #1a2f4a | Technical |

## Compound Rarity

The probability of specific combinations:

| Combination | Probability | Description |
|-------------|-------------|-------------|
| Pure Ligeti + Palindrome | 0.4% | Mirrored micropolyphony |
| Pure Xenakis + Mathematical | 0.85% | Architectural perfection |
| Solo + Extreme sparse | 0.12% | Near-empty solo line |
| Orchestra + Extreme dense | 0.08% | Maximum chaos |
| Palindrome + Extreme contrast | 0.056% | Dramatic mirror |

## Special Flags

These boolean features add additional variation:

| Feature | Trigger | Effect |
|---------|---------|--------|
| hasMicropolyphony | Ligeti style or 30% chance | Extra density clouds |
| hasGlissandi | Xenakis style or 40% chance | Extra ruled lines |
| hasSymmetry | Palindrome structure | Canvas mirrored at center |

## Musical Notation Aesthetics

These features add authenticity but don't affect rarity:

| Feature | Options |
|---------|---------|
| Time Signature | 4/4, 3/4, 5/4, 6/8, 7/8, free |
| Tempo | Lento, Adagio, Andante, Moderato, Allegro, Presto, Senza tempo, Liberamente |
| Dynamics | pp, p, mp, mf, f, ff, sfz, cresc., dim. (scattered) |
| Rehearsal Marks | A, B, C... for sectioned structures |

## Rarity Calculation Example

For a specific output:
- Style: Pure Xenakis (10% × 50% = 5% legendary)
- Voices: 4 (55% common)
- Structure: Mathematical (17% rare)
- Density: Balanced (50% common)
- Contrast: High (30% uncommon)

Combined base rarity: 5% × 55% × 17% × 50% × 30% = **0.07%**

This represents a unique combination appearing roughly 1 in 1,400 generations.
