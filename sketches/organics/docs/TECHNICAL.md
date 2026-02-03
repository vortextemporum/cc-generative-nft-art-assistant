# ORGANICS - Technical Documentation

## Algorithm Overview

The blob generation translates 2D bezier blob concepts to 3D:

### Original 2D Algorithm
```
for each point p around ring:
  angle = p * TWO_PI / numPoints
  radius = baseRadius + random(-randomness, randomness)
  x = cos(angle) * radius
  y = sin(angle) * radius

for each point:
  wobble = random(-cpOffsetAngle, cpOffsetAngle)
  cp1 = point + perpendicular(angle - 90 + wobble) * cpDist
  cp2 = point + perpendicular(angle + 90 - wobble) * cpDist
```

### 3D Translation

```javascript
function applyBlobDisplacement(geometry) {
  for each vertex:
    // Get spherical coordinates
    theta = atan2(y, x)     // azimuthal (like angle in 2D)
    phi = acos(z / r)       // polar

    // Multi-octave noise (replaces discrete point randomness)
    displacement = 0
    for octave in octaves:
      // Wobble offset (like cpOffsetAngle)
      wobbleOffset = noise(theta, phi, octave) * wobble

      // Sample displacement
      n = noise(
        cos(theta + wobbleOffset) * frequency,
        sin(theta + wobbleOffset) * frequency,
        cos(phi) * frequency
      )
      displacement += n * amplitude
      amplitude *= 0.5
      frequency *= 2

    // Apply radial displacement
    vertex = normalize(vertex) * (baseRadius + displacement)
}
```

## Simplex Noise

Custom implementation seeded from hash for determinism:

```javascript
const noise = new SimplexNoise(R);  // R is hash-seeded PRNG
noise.noise3D(x, y, z);  // Returns -1 to 1
```

The noise uses:
- F3 = 1/3, G3 = 1/6 (simplex skew factors)
- 12 gradient vectors
- Permutation table shuffled by hash

## Geometry Pipeline

```
IcosahedronGeometry(radius, subdivisions)
        │
        ▼
applyBlobDisplacement()  ← Noise-based radial offset
        │
        ▼
applyDistortion()  ← Twist/Taper/Bend/etc.
        │
        ▼
applyBooleanEffect()  ← Vertex displacement cuts
        │
        ▼
computeVertexNormals()
        │
        ▼
Create Mesh with Material
```

## Subdivision Levels

| Level | Vertices | Triangles | Visual Quality |
|-------|----------|-----------|----------------|
| 2 | 42 | 80 | Blocky |
| 3 | 162 | 320 | Low poly |
| 4 | 642 | 1280 | Smooth |
| 5 | 2562 | 5120 | High detail |
| 6 | 10242 | 20480 | Very smooth |

## Performance Notes

- Subdivision 4 is default (good balance)
- Noise sampling is O(vertices)
- Higher subdivisions may slow mobile devices
- SimplexNoise is faster than Perlin for 3D

## Parameter Effects

| Parameter | Low Value | High Value |
|-----------|-----------|------------|
| numPoints | Smooth blobs | Complex, bumpy |
| radiusRandomness | Subtle deformation | Wild shapes |
| cpOffsetAngle | Uniform noise | Irregular wobble |
| noiseScale | Large features | Fine detail |
| noiseOctaves | Simple | Complex detail |
| subdivisions | Angular | Smooth |
