# Magnetic Chains - Feature & Rarity Documentation

## Overview

Features are derived deterministically from a 64-character hex hash. Each feature category has weighted probabilities that favor common traits while making rare combinations special.

## Feature Categories

### 1. Topology (11 types)

The shape of the chain path through 3D space.

| Type | Rarity | Weight | Description |
|------|--------|--------|-------------|
| Circle | Common | 65% | Simple closed loop in XY plane |
| Helix | Common | 65% | Spiral coil extending in Z |
| Wave | Common | 65% | Sinusoidal wave in 3D |
| Chain | Common | 65% | Catenary curve with sag |
| Trefoil Knot | Uncommon | 20% | Classic 3-crossing mathematical knot |
| Lissajous | Uncommon | 20% | 3D parametric curve from sine waves |
| Random Walk | Uncommon | 20% | Brownian motion path |
| Torus Knot | Rare | 10% | Knot wound around a torus surface |
| Figure-8 Knot | Rare | 10% | Four-crossing knot |
| Tangle | Legendary | 5% | Chaotic coiled mess with FBM noise |
| Lorenz | Legendary | 5% | Lorenz attractor butterfly |

### 2. Bead Geometry (9 types)

The 3D shape of each bead in the chain.

| Geometry | Rarity | Magnetic Mult | Description |
|----------|--------|---------------|-------------|
| Sphere | Common | 1.0x | Smooth ball |
| Cube | Common | 0.9x | Six-faced box |
| Octahedron | Uncommon | 1.1x | Eight triangular faces |
| Cylinder | Uncommon | 1.2x | Rod shape |
| Cone | Uncommon | 0.8x | Pointed shape |
| Tetrahedron | Uncommon | 0.85x | Four triangular faces |
| Icosahedron | Uncommon | 1.0x | Twenty triangular faces |
| Dodecahedron | Rare | 1.0x | Twelve pentagonal faces |
| Torus | Rare | 0.7x | Donut shape |

### 3. Material (10 types)

Determines both visual appearance and magnetic properties.

| Material | Rarity | Magnetic | Visual Properties |
|----------|--------|----------|-------------------|
| Iron | Common | 1.5x | High metalness, medium roughness |
| Ferrite | Common | 0.5x | Low metalness, high roughness (ceramic) |
| Plastic | Common | 0x | Non-metallic, medium roughness |
| Rubber | Common | 0x | Non-metallic, matte |
| Neodymium | Uncommon | 3.0x | High metalness, smooth (strongest magnet) |
| Chrome | Uncommon | 0.8x | Mirror finish |
| Cobalt | Rare | 2.0x | Blue-tinted metal |
| Copper | Rare | 0x | Orange-gold metal |
| Gold | Legendary | 0x | Yellow metal, non-magnetic |
| Glass | Legendary | 0x | Transparent, smooth |

**Magnetic materials** create active physics simulations with dipole forces.
**Non-magnetic materials** result in static chains (physics runs but no magnetic effects).

### 4. Color Palette (10 options)

The base color scheme for the beads.

| Palette | Rarity | Colors | Mood |
|---------|--------|--------|------|
| Sunset | Common | Pink, crimson, coral | Warm, romantic |
| Ocean | Common | Blue, indigo, navy | Cool, deep |
| Forest | Common | Green, teal, emerald | Natural, fresh |
| Cosmic | Uncommon | Purple, blue, magenta | Mystical, space |
| Fire | Uncommon | Red, yellow, orange | Hot, energetic |
| Ice | Uncommon | Cyan, sky blue, powder | Cold, clean |
| Monochrome | Rare | White, gray, charcoal | Minimal, stark |
| Neon | Rare | Lime, magenta, cyan | Electric, vibrant |
| Aurora | Legendary | Green, purple, pink | Northern lights |
| Void | Legendary | Dark purples, near-black | Mysterious, deep |

### 5. Visual Options

Additional boolean/numeric features:

| Feature | Probability | Effect |
|---------|-------------|--------|
| Gradient Color | 70% | Colors shift along chain length |
| Show Connections | 60% | Visible lines between beads |
| Colored Lights | 50% | Tinted point lights from palette |
| Bead Count | 40-120 | Number of beads in chain |
| Bead Size | 0.05-0.15 | Radius of each bead |

### 6. Background Color (Dynamic)

Each generation creates a harmonious background color that:
- Contrasts with particle colors for visibility
- Uses complementary (~50%) or analogous (~50%) hues
- Has soft, muted saturation (0.15-0.45)
- Is dark but tinted (lightness 0.05-0.11), never pure black

**Special Cases:**
- Very dark palettes (void): Uses lighter complementary tones
- Very bright palettes: Uses darker muted versions

The background ensures particles "pop" while maintaining visual harmony.

### 7. Physics Parameters

| Parameter | Range | Effect |
|-----------|-------|--------|
| Magnetic Strength | 0.2-1.5 | Base force multiplier |
| Temperature | 0.005-0.05 | Thermal noise level |

Effective magnetic = Material magnetic × Geometry magnetic × Strength slider

## Rarity Calculation

Overall rarity is computed from the sum of individual feature scores:

| Feature Tier | Score |
|--------------|-------|
| Legendary | 4 |
| Rare | 3 |
| Uncommon | 2 |
| Common | 1 |

**Total Score (4 categories: topology + geometry + material + palette):**

| Score Range | Overall Rarity |
|-------------|----------------|
| 12-16 | Legendary |
| 9-11 | Rare |
| 6-8 | Uncommon |
| 4-5 | Common |

## Probability Examples

**Legendary Combination (very rare):**
- Lorenz (5%) + Torus (10%) + Glass (3%) + Aurora (3%)
- Probability: 0.05 × 0.10 × 0.03 × 0.03 = 0.000045%

**Common Combination (most frequent):**
- Circle (65%) + Sphere (65%) + Iron (69%) + Sunset (69%)
- Probability: 0.65 × 0.65 × 0.69 × 0.69 = 20%

## Feature Interactions

Some combinations create notable visual effects:

- **Non-magnetic + Physics ON:** Chain falls limp, only spring forces active
- **High temp + Strong magnetic:** Chaotic, jittery motion
- **Lorenz + Neodymium:** Beautiful chaos with magnetic clustering
- **Torus geometry + Torus Knot:** Meta-torus visual
- **Glass + Void palette:** Nearly invisible, mysterious
- **Gradient + Long chain:** Smooth rainbow effect
