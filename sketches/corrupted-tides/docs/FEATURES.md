# Corrupted Tides - Feature Documentation

## Rarity System

### Corruption Level
The primary rarity driver - determines overall intensity of decay.

| Value | Probability | Intensity Range | Visual Character |
|-------|-------------|-----------------|------------------|
| minimal | 45% (common) | 0.1 - 0.3 | Subtle artifacts, mostly recognizable structure |
| moderate | 30% (uncommon) | 0.3 - 0.55 | Clear corruption, structure visible |
| heavy | 18% (rare) | 0.55 - 0.8 | Significant decay, abstracted forms |
| catastrophic | 7% (legendary) | 0.8 - 1.0 | Extreme destruction, pure artifact |

### Drift Speed
Controls animation intensity.

| Value | Probability | Character |
|-------|-------------|-----------|
| still | 30% (common) | No animation, frozen decay |
| glacial | 35% (uncommon) | Barely perceptible movement |
| slow | 25% (rare) | Gentle drift visible |
| restless | 10% (legendary) | Active, living corruption |

### Block Size
Compression macro-block scale.

| Value | Probability | Visual Effect |
|-------|-------------|---------------|
| 4×4 | 15% | Fine grain, detailed corruption |
| 8×8 | 40% | Standard JPEG-style blocking |
| 16×16 | 30% | Chunky, obvious artifacts |
| 32×32 | 15% | Large brutal blocks |

### Glitch Type
Primary artifact style.

| Value | Probability | Description |
|-------|-------------|-------------|
| block | 25% | Rectangular artifacts, compression errors |
| scanline | 25% | Horizontal banding, video corruption |
| channel | 25% | RGB separation, chromatic aberration |
| mixed | 25% | Combination of all types |

### Palette Corruption
How the signal source colors are transformed.

| Value | Probability | Effect |
|-------|-------------|--------|
| quantized | 25% | Bit depth reduction, posterization |
| channel-shifted | 25% | RGB values swapped between colors |
| inverted | 25% | 255 - original values |
| rotated | 25% | Hue rotation around color wheel |

### Pseudomath Algorithm
The "broken" mathematical function driving the flow field.

| Value | Probability | Character |
|-------|-------------|-----------|
| broken-trig | 20% | Wrong trigonometric operations |
| recursive-error | 20% | Self-referential coordinate chaos |
| modulo-glitch | 20% | Wrapping artifacts, banding |
| quantized-flow | 20% | Stepped, integer truncation |
| coercion-drift | 20% | Bitwise operation artifacts |

### Signal Source
The underlying color palette (13 variants, equal probability ~7.7% each).

| Signal Name | Character | Secret Origin |
|-------------|-----------|---------------|
| static-white | Bright, minimal | Monochrome |
| void-grey | Dark, muted | Earthy greys |
| ember-pulse | Warm, fiery | Desert/ember |
| aqua-signal | Cool, oceanic | Sea glass |
| sand-drift | Earthy, coastal | Beach tones |
| foam-noise | Soft, pastel | Ocean foam |
| primary-bleed | Bold, primary | RGB primaries |
| deep-current | Teal, coral | Deep ocean |
| cold-surge | Cold, stark | Arctic |
| neon-depths | Vibrant, dark | Neon noir |
| candy-reef | Bright, playful | Candy colors |
| warm-static | Warm, organic | Sunset |
| moss-signal | Natural, green | Forest/moss |

### Scanline Density

| Value | Probability | Gap |
|-------|-------------|-----|
| sparse | 33% | 8px between lines |
| medium | 34% | 4px between lines |
| dense | 33% | 2px between lines |

## Derived Features

These are calculated from hash but not independently selectable:

- **corruptionIntensity**: Float 0-1, within corruptionLevel's range
- **channelDisplacement**: 2-12 pixels × corruption
- **k1, k2**: Flow field parameters (5-15, 1-8)
- **fieldScale**: Flow field zoom (0.5-3.0)
- **clusterCount**: Number of block clusters (12-36)
- **dataBendIntensity**: Probability of data errors
- **glitchEventFreq**: Frequency of sudden glitch events

## Combination Rarities

Approximate probabilities for notable combinations:

| Combination | Probability |
|-------------|-------------|
| Catastrophic + Restless | 0.7% |
| Catastrophic + Still | 2.1% |
| Minimal + 4×4 blocks | 6.75% |
| Any legendary corruption + 32×32 | 1.05% |

## Feature Independence

All features are derived independently from the hash, meaning any combination is theoretically possible. There are no impossible combinations or forced correlations.
