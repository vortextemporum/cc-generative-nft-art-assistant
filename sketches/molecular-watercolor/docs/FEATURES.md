# Features & Rarity Documentation

## Overview

Each artwork is determined by a 64-character hexadecimal hash. Features are derived deterministically from this hash using a seeded PRNG.

## Rarity Tiers

| Tier | Probability | Visual Indicator |
|------|-------------|------------------|
| Common | ~55-60% | Gray badge |
| Uncommon | ~25-30% | Green badge |
| Rare | ~10-15% | Blue badge |
| Legendary | ~3-5% | Gold badge (animated) |

---

## Feature Categories

### 1. Palette

Controls the color scheme of molecules and effects.

| Value | Rarity | Colors |
|-------|--------|--------|
| Watercolor | Common | Prussian blue, burnt sienna, viridian, yellow ochre, alizarin crimson |
| Ocean | Common/Uncommon | Deep sea, teal, aqua, foam, abyss |
| Autumn | Common/Uncommon | Rust, amber, crimson, umber, gold |
| Forest | Common/Uncommon | Deep forest, moss, fern, pine, bark |
| Sunset | Common/Uncommon | Coral, peach, mauve, plum, apricot |
| Monochrome | Rare | Grayscale tones |
| Neon | Legendary | Hot pink, mint, purple, yellow, cyan |

### 2. Density

Number of molecules in the simulation.

| Value | Rarity | Count Range |
|-------|--------|-------------|
| Normal | Common | 40-100 |
| Dense | Uncommon | 100-150 |
| Swarm | Rare | 150-250 |
| Sparse | Legendary | 8-15 |

### 3. Physics

The force model applied to molecules.

| Value | Rarity | Behavior |
|-------|--------|----------|
| Molecular | Common | Lennard-Jones potential - attracts at medium range, repels at close range |
| Brownian | Common | Random walk with weak inter-particle forces |
| Flocking | Uncommon | Boids algorithm: separation, alignment, cohesion |
| Waves | Uncommon | Sinusoidal motion based on position |
| Orbital | Rare | Gravitational pull with tangential velocity |
| Magnetic | Rare | Similar colors attract, different colors repel |
| Vortex | Legendary | Spiral motion toward center |
| Explosion | Legendary | Continuous outward force from center |

### 4. Trail

Length of the path history rendered behind each molecule.

| Value | Rarity | Length Range |
|-------|--------|--------------|
| Medium | Common | 30-80 points |
| Long | Uncommon | 100-150 points |
| Dots | Rare | 5-15 points |
| Infinite | Legendary | 200-300 points |

### 5. Wetness

Controls the spread and transparency of watercolor effects.

| Value | Rarity | Multiplier |
|-------|--------|------------|
| Normal | Common | 0.5-0.9x |
| Wet | Uncommon | 1.0-1.3x |
| Dry | Rare | 0.2-0.4x |
| Flooded | Legendary | 1.5-2.0x |

### 6. Drops

Frequency of water drop splatter effects.

| Value | Rarity | Frequency |
|-------|--------|-----------|
| Occasional | Common | 1-3% per frame |
| Frequent | Uncommon | 5% per frame |
| None | Rare | 0% |
| Rain | Legendary | 15% per frame |

### 7. Pencil

Intensity of colored pencil hatching texture.

| Value | Rarity | Lines per draw |
|-------|--------|----------------|
| Light | Common | 3-8 lines |
| Detailed | Uncommon | 6-16 lines |
| None | Rare | 0 lines |
| Heavy Sketch | Legendary | 9-24 lines |

### 8. Paper

Background tone of the paper texture.

| Value | Rarity | RGB Base |
|-------|--------|----------|
| Warm | Common | (252, 248, 240) |
| Cool | Common | (245, 248, 252) |
| Aged | Common | (245, 235, 220) |
| Bright | Common | (255, 253, 250) |

*Note: Paper has no rarity variation - all tones are equally common.*

### 9. Composition

Initial positioning of molecules.

| Value | Rarity | Pattern |
|-------|--------|---------|
| Centered | Common | Clustered near center |
| Scattered | Common | Random across canvas |
| Diagonal | Common | Along diagonal axis |
| Circular | Common | Ring formation |

*Note: Composition has no rarity variation - all modes are equally common.*

### 10. Special FX

Rare visual effects applied on top of base rendering.

| Value | Rarity | Effect |
|-------|--------|--------|
| None | Common | No special effect |
| Chromatic | Legendary (~8%) | RGB color separation |
| Glow | Legendary (~8%) | Soft light bloom |
| Scatter | Legendary (~8%) | Tiny dot sprinkles |

---

## Probability Calculations

For a single feature to be legendary: ~3-5%
For ANY feature to be legendary: ~35-40% (at least one)
For multiple legendary features: Very rare

### Example Rarity Combinations

| Combination | Approximate Odds |
|-------------|------------------|
| All common | ~1-2% |
| At least one legendary | ~35-40% |
| Two legendary features | ~5-8% |
| Three+ legendary features | <1% |
| Neon + Vortex + Rain | ~0.0004% (1 in 250,000) |

---

## Adding New Features

When adding a new feature:

1. Define the feature values and their visual effect
2. Assign rarity tiers with probabilities
3. Add to `generateFeatures()` function
4. Update the HTML features table
5. Document in this file
6. Update CHANGELOG.md
