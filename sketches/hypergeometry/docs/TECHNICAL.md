# HYPERGEOMETRY - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Hash Input                               │
│              (tokenData.hash or random)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    sfc32 PRNG                                │
│           Deterministic random number generation             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Feature Generation                          │
│   - Polytope type (rarity-weighted)                         │
│   - Dimension (4-6D)                                        │
│   - Rotation type & speeds                                  │
│   - Morphing mode & speed                                   │
│   - Color palette                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Polytope Generation                          │
│   Generate vertices and edges for selected shape             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Animation Loop                            │
│   ┌───────────────────────────────────────────────────────┐ │
│   │ 1. Update rotation angles (per plane)                 │ │
│   │ 2. Update morph progress (if applicable)              │ │
│   │ 3. Apply rotation matrix to vertices                  │ │
│   │ 4. Project N-D → 3D                                   │ │
│   │ 5. Update Three.js geometry                           │ │
│   │ 6. Render frame                                       │ │
│   └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## N-Dimensional Geometry

### Vertex Generation

#### Hypercube (N-cube)
```javascript
// 2^n vertices, each coordinate is ±1
for (let i = 0; i < Math.pow(2, n); i++) {
  vertex[d] = (i >> d) & 1 ? 1 : -1;
}
```

**Vertex count**: 2^n (4D: 16, 5D: 32, 6D: 64)
**Edge count**: n × 2^(n-1) (4D: 32, 5D: 80, 6D: 192)

#### Simplex (N-simplex)
- N+1 vertices in N dimensions
- Uses standard simplex construction
- Centered and normalized

**Vertex count**: n+1 (4D: 5, 5D: 6, 6D: 7)
**Edge count**: n(n+1)/2 (4D: 10, 5D: 15, 6D: 21)

#### Cross-Polytope (Orthoplex)
- 2n vertices (±1 on each axis)
- Dual to hypercube

**Vertex count**: 2n (4D: 8, 5D: 10, 6D: 12)
**Edge count**: 2n(n-1) (4D: 24, 5D: 40, 6D: 60)

#### 24-Cell (4D only)
- 24 vertices combining:
  - 8 from permutations of (±1, 0, 0, 0)
  - 16 from (±0.5, ±0.5, ±0.5, ±0.5) scaled

**Vertex count**: 24
**Edge count**: 96

### Edge Generation

Edges are determined by distance relationships:
- Hypercube: vertices differing in exactly 1 coordinate
- Simplex: all vertices connected
- Cross-polytope: non-antipodal vertices connected
- 24-cell, 120-cell, 600-cell: nearest neighbor distance threshold

## Rotation System

### Plane Rotation Matrix

For rotation in the plane defined by axes i and j:

```
[1 0 ... cos(θ) -sin(θ) ... 0]
[0 1 ...  0       0     ... 0]
[    ...                   ...]
[0 0 ... sin(θ)  cos(θ) ... 0]
[    ...                   ...]
[0 0 ...  0       0     ... 1]
```

### Rotation Planes in N Dimensions

Number of rotation planes: n(n-1)/2

| Dimension | Planes |
|-----------|--------|
| 4D | 6 (XY, XZ, XW, YZ, YW, ZW) |
| 5D | 10 |
| 6D | 15 |

### Isoclinic (Clifford) Rotation

Unique to 4D: simultaneous rotation in two orthogonal planes (XY and ZW) at equal angular velocities.

```javascript
// Equivalent to:
R = R_XY(θ) × R_ZW(θ)
```

Results in motion where every point traces a circle, creating a distinctive "flowing" appearance.

## Projection Pipeline

### Perspective Projection (N-D to 3D)

Projects one dimension at a time:

```javascript
while (dim > 3) {
  w = point[dim - 1];          // Coordinate being projected
  scale = viewDist / (viewDist - w);
  for (i = 0; i < dim - 1; i++) {
    point[i] *= scale;
  }
  dim--;
}
```

**View Distance**: Controls perspective strength
- Smaller = more dramatic perspective
- Larger = more orthographic appearance

## Morphing System

### Vertex Interpolation

```javascript
result[d] = p1[d] * (1 - t) + p2[d] * t;
```

**Handling Different Vertex Counts**:
- Vertices are repeated cyclically
- Edges merged from both shapes
- Smooth transition despite topology differences

### Morph Progress

```javascript
morphProgress += morphSpeed * morphDirection;
if (morphProgress >= 1 || morphProgress <= 0) {
  morphDirection *= -1;  // Ping-pong
}
```

## Three.js Integration

### Scene Setup
- PerspectiveCamera at z=5
- OrbitControls with damping
- GridHelper at y=-2
- Ambient + Directional lighting

### Geometry Updates

Per frame:
1. Dispose previous geometry/materials
2. Create new BufferGeometry for edges
3. Create Points geometry for vertices
4. Apply colors based on W-coordinate

### Color Mapping

```javascript
// Map W coordinate (-1 to 1) to palette index
colorIndex = Math.floor(((w + 1) / 2) * (paletteLength - 1));
```

## Performance Considerations

### Optimizations Applied
- Simplified 120-cell/600-cell (subset of vertices)
- Geometry disposal on each frame (prevents memory leak)
- Pixel ratio capped at 2x
- Line segments instead of continuous paths

### Potential Improvements
- Instanced geometry for vertices
- Shader-based color computation
- Level-of-detail based on dimension
- Web Worker for vertex computation

## Hash Compatibility

### Art Blocks Format
```javascript
if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}
```

### sfc32 PRNG Seeding
- Hash split into 4 × 8-character segments
- Each segment parsed as hex integer
- Seeds the sfc32 generator

```javascript
seeds[i] = parseInt(hash.slice(2 + i * 8, 10 + i * 8), 16);
```
