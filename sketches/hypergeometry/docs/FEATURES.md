# HYPERGEOMETRY - Features & Rarity

## Feature Categories

### 1. Polytope Type

| Type | Rarity | Probability | Description |
|------|--------|-------------|-------------|
| Hypercube | Common | 50% | N-dimensional cube, the most recognizable higher-dimensional shape |
| Simplex | Uncommon | 15% | N-dimensional tetrahedron, minimal vertices |
| Cross-Polytope | Uncommon | 15% | N-dimensional octahedron, dual to hypercube |
| 24-Cell | Rare | 7.5% | Unique 4D self-dual polytope with no 3D analog |
| Clifford Torus | Rare | 7.5% | 4D torus with fascinating topology |
| 120-Cell | Legendary | 2.5% | 4D polytope with 120 dodecahedral cells |
| 600-Cell | Legendary | 2.5% | 4D polytope with 600 tetrahedral cells |

### 2. Dimension

| Dimension | Probability | Visual Complexity |
|-----------|-------------|-------------------|
| 4D | 40% | Classic higher-dimensional visualization |
| 5D | 35% | More complex, denser projections |
| 6D | 25% | Highly complex, many overlapping edges |

Note: 24-Cell, 120-Cell, 600-Cell, and Clifford Torus are always 4D.

### 3. Rotation Type

| Type | Probability | Description |
|------|-------------|-------------|
| Simple | 33% | Single plane rotation (e.g., XW plane only) |
| Compound | 33% | Multiple planes rotating at different speeds |
| Isoclinic | 34% | Clifford rotation - unique 4D double rotation |

### 4. Morphing Mode

| Mode | Probability | Description |
|------|-------------|-------------|
| Static | 33% | Pure rotation, no shape transformation |
| Interpolate | 33% | Smooth blending between two polytopes |
| Nested | 34% | Secondary polytope rendered inside the primary |

### 5. Color Palette

| Palette | Description |
|---------|-------------|
| Cosmic | Purple/violet tones, deep space feeling |
| Glacier | Cool blues and cyans, icy clarity |
| Ember | Warm oranges and reds, energetic fire |
| Void | Monochrome grayscale, minimal distraction |
| Aurora | Neon rainbow, vibrant northern lights |
| Matrix | Green hues, digital/cyberpunk aesthetic |
| Sunset | Pinks and oranges, warm twilight |
| Ocean | Deep blues, underwater depth |

## Rarity Combinations

### Legendary Combinations (< 1%)
- 600-Cell + Isoclinic rotation + Interpolate morph
- 120-Cell + 6D + Compound rotation
- Any legendary polytope + nested morph with another legendary

### Rare Combinations (1-5%)
- 24-Cell + Isoclinic + Aurora palette
- Clifford Torus + Interpolate + any 4D polytope
- 6D Hypercube + Compound rotation

### Uncommon Combinations (5-15%)
- Cross-Polytope + Simplex nested
- 5D anything + Compound rotation
- Any polytope + Interpolate morph

### Common Combinations (> 15%)
- Hypercube + Simple rotation
- 4D + Static morph
- Any common polytope with Void palette

## Feature Interactions

### Dimension Constraints
- Polytopes marked "4D only" ignore the dimension feature
- Higher dimensions create denser visual output
- Rotation plane count scales with dimension

### Morph Constraints
- Interpolate requires two compatible polytopes
- Nested scales secondary polytope to 50%
- Static has fastest rendering (no morph calculation)

### Visual Impact by Feature

| Feature | Visual Weight |
|---------|---------------|
| Polytope Type | High - determines overall shape |
| Dimension | Medium - affects complexity |
| Rotation Type | High - determines motion quality |
| Morphing Mode | High - changes animation character |
| Palette | Medium - sets mood and atmosphere |
