# Corrupted Harmony - Feature System

## Rarity Distribution

### Base Rarity Tiers

| Tier | Probability | Roll Range |
|------|-------------|------------|
| Common | 60% | 0.40 - 1.00 |
| Uncommon | 25% | 0.15 - 0.40 |
| Rare | 10% | 0.05 - 0.15 |
| Legendary | 5% | 0.00 - 0.05 |

## Feature Categories

### 1. Building Count
- Range: 15-25 buildings
- Uniform distribution within range
- Affects density and visual complexity

### 2. Palette

| Rarity | Options |
|--------|---------|
| Common | muted, fog, sepia |
| Uncommon | sepia, cool, fog |
| Rare | twilight, warm, cool |
| Legendary | inverted, neonBleed |

**Palette Definitions:**
- `muted` - Grayscale: #2d2d2d → #d4d4d4
- `sepia` - Warm browns: #2c2416 → #d4c4a4
- `cool` - Blue-grays: #1a2a3a → #9aabba
- `warm` - Orange-browns: #3a2a1a → #baa090
- `twilight` - Purple-blues: #1a1a2e → #babace
- `fog` - Light grays: #e8e8e8 → #707070
- `inverted` - Inverted grays: #f0f0f0 → #101010
- `neonBleed` - Cyberpunk: #0a0a0a, #ff2a6d, #05d9e8

### 3. Weirdness Level

| Rarity | Level | Effect Chance |
|--------|-------|---------------|
| Common | subtle | 10% per building |
| Uncommon | moderate | 30% per building |
| Rare | chaotic | 50% per building |
| Legendary | reality-collapse | 80% per building |

### 4. Dominant Effect

| Rarity | Options |
|--------|---------|
| Common | dither, stencil, clean |
| Uncommon | glitch, liquify |
| Rare | corrupt, liquify |
| Legendary | all-blend (equal distribution) |

### 5. Special Features

| Rarity | Special |
|--------|---------|
| Common | none |
| Uncommon | floating-chunk, time-echo |
| Rare | inverted-building, portal |
| Legendary | the-anomaly |

**Special Descriptions:**
- `none` - No special feature
- `floating-chunk` - Architectural fragment floating in sky
- `time-echo` - Ghost building overlay
- `inverted-building` - Upside-down structure
- `portal` - Glowing void/gateway
- `the-anomaly` - Central void with radiating distortion

### 6. Sky Mood
- `gradient` - Vertical color gradient
- `flat` - Solid color
- `textured` - Noise/particle texture
- `void` - Deep black

### 7. Ground Style
- `solid` - Flat colored ground
- `reflection` - Gradient suggesting reflection
- `fade` - Semi-transparent overlay
- `none` - No ground (floating city)

## Architectural Styles (Uniform Distribution)

Each building randomly receives one of 7 styles:

| Style | Description | Unique Elements |
|-------|-------------|-----------------|
| brutalist | Concrete monoliths | Ledges (0-3) |
| deco | Art Deco towers | Setbacks, optional spire (70%) |
| modernist | Glass curtain walls | Frame lines |
| gothic | Medieval inspired | Pointed roof, pinnacles (80%) |
| retro-futurist | 50s-80s future | Bulging sections, dome (60%) |
| geometric | Pure shapes | cube/pyramid/cylinder/prism |
| organic | Biological | Bulging segments (2-5) |

## Visual Effects

### Dithering Modes (if effect=dither)
- `floyd-steinberg` - Error diffusion, smooth gradients
- `bayer` - Ordered 4x4 matrix, retro look
- `stipple` - Random threshold, noisy
- `halftone` - 4px blocks, print-like

### Effect Parameters

| Effect | Parameter | Range |
|--------|-----------|-------|
| liquify | intensity | 0.3 - 0.8 |
| stencil | levels | 3 - 6 |
| glitch | intensity | 0.3 - 0.8 |
| corrupt | intensity | 0.2 - 0.6 |

## Weirdness Types

| Type | Description | Probability Modifier |
|------|-------------|---------------------|
| melt | Building drips/fuses | base × 1.0 |
| float | Chunks float above | base × 0.7 |
| scale-shift | Size anomaly | base × 0.5 |
| time-echo | Ghost overlay | base × 0.4 |
| invert | Upside-down | base × 0.3 (legendary only) |

## Rarity Combinations

### Most Common Output (~35%)
- Rarity: common
- Palette: muted or fog
- Weirdness: subtle
- Effect: dither or stencil
- Special: none

### Rarest Output (~0.25%)
- Rarity: legendary
- Palette: neonBleed
- Weirdness: reality-collapse
- Effect: all-blend
- Special: the-anomaly

## Feature Probability Calculator

For a given hash, probability of specific combination:
```
P(combination) = P(rarity) × P(palette|rarity) × P(weirdness|rarity) × ...
```

Example - Legendary + neonBleed + the-anomaly:
```
0.05 × 0.5 × 1.0 × 1.0 = 2.5%
```
