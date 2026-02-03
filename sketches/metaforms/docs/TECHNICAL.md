# METAFORMS - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         index.html                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Canvas    │  │  Controls   │  │   Rarity Curves     │ │
│  │  (Three.js) │  │   Panel     │  │   (Visualization)   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        sketch.js                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │     PRNG     │  │   Features   │  │    Feedback      │  │
│  │   (sfc32)    │  │   System     │  │    Storage       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Three.js Scene                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │  │
│  │  │ Metaball   │  │ Materials  │  │   Lighting     │  │  │
│  │  │   Field    │  │  Factory   │  │   (Studio)     │  │  │
│  │  └────────────┘  └────────────┘  └────────────────┘  │  │
│  │                                                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │  │
│  │  │ Marching   │  │ Distortion │  │   Growths      │  │  │
│  │  │   Cubes    │  │  Modifiers │  │  Generator     │  │  │
│  │  └────────────┘  └────────────┘  └────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Metaball System

### MetaballField Class

```javascript
class MetaballField {
  constructor() {
    this.balls = []; // Array of { x, y, z, radius, strength }
  }

  addBall(x, y, z, radius, strength = 1) {
    this.balls.push({ x, y, z, radius, strength });
  }

  // Scalar field function
  sample(x, y, z) {
    let sum = 0;
    for (const ball of this.balls) {
      const d2 = (x - ball.x)² + (y - ball.y)² + (z - ball.z)²;
      sum += strength * radius² / d²;
    }
    return sum;
  }
}
```

The field function is: `f(p) = Σ (s_i * r_i²) / |p - c_i|²`

Where:
- `s_i` = strength of ball i
- `r_i` = radius of ball i
- `c_i` = center of ball i
- `p` = sample point

Isosurface extracted at `f(p) = 1.0`.

### Marching Cubes Implementation

Resolution: 64x64x64 voxels in [-2, 2]³ bounds.

1. **Sampling**: Sample scalar field at each voxel corner
2. **Classification**: Build 8-bit cube index from corner inside/outside
3. **Edge Interpolation**: Find surface intersection on active edges
4. **Triangle Generation**: Look up triangle configuration from edge table

The implementation uses a simplified triangle lookup rather than the full 256-entry table. Edge table (MC_EDGE_TABLE) indicates which edges are crossed for each cube configuration.

### Performance Considerations

- Grid sampling: O(n³) where n = resolution
- Triangle generation: O(n³) worst case
- Total vertices: Typically 10,000-50,000

## Distortion System

Distortions operate on vertex positions after marching cubes extraction.

### Twist
```javascript
const angle = y * strength * 2;
x' = x * cos(angle) - z * sin(angle);
z' = x * sin(angle) + z * cos(angle);
```

### Taper
```javascript
const factor = 1 + y * strength * 0.5;
x' = x * factor;
z' = z * factor;
```

### Bend
```javascript
const angle = x * strength;
y' = y * cos(angle) - z * sin(angle);
z' = y * sin(angle) + z * cos(angle);
```

### Bulge
```javascript
const dist = sqrt(x² + z²);
const bulge = 1 + exp(-dist * 2) * strength;
x' = x * bulge;
z' = z * bulge;
```

### Wave
```javascript
x' = x + sin(y * 4) * strength * 0.2;
z' = z + cos(y * 4) * strength * 0.2;
```

## Boolean Operations

True CSG would require computing mesh intersections. Instead, we simulate cuts by displacing vertices inside the cut volume outward:

```javascript
if (insideCutVolume) {
  const dist = distanceToCenter;
  const push = (cutRadius - dist) * 0.5;
  position += normalize(position - cutCenter) * push;
}
```

This creates a visual "pushed out" effect that approximates a cut without mesh surgery.

## Material System

Using Three.js material classes:

| Material | Three.js Class | Key Properties |
|----------|----------------|----------------|
| Matte | MeshStandardMaterial | roughness: 0.9, metalness: 0 |
| Glossy | MeshStandardMaterial | roughness: 0.2, metalness: 0.1 |
| Chrome | MeshStandardMaterial | roughness: 0.05, metalness: 1.0 |
| Iridescent | MeshPhysicalMaterial | iridescence: 1.0, iridescenceIOR: 1.5 |
| Glass | MeshPhysicalMaterial | transmission: 0.9, ior: 1.5 |
| Emissive | MeshStandardMaterial | emissive + emissiveIntensity |
| Holographic | MeshPhysicalMaterial | iridescence + clearcoat |

## Lighting Setup

Studio 3-point lighting with additions:

```javascript
AmbientLight(0xffffff, 0.3)           // Base fill
DirectionalLight(5, 5, 5, 1.0)        // Key light
DirectionalLight(-5, 0, 5, 0.5)       // Fill light
DirectionalLight(0, -5, -5, 0.3)      // Rim light
DirectionalLight(0, 10, 0, 0.4)       // Top light
```

## Growth System

Growths are separate meshes positioned on the metaform surface.

### Surface Position Estimation
```javascript
const theta = random(0, 2π);
const phi = random(-π/2, π/2);
const r = 1.0 + random(-0.3, 0.3);
const position = sphericalToCartesian(r, theta, phi);
```

### Growth Geometries

| Type | Geometry | Orientation |
|------|----------|-------------|
| Spikes | ConeGeometry | lookAt(position * 2) |
| Tendrils | TubeGeometry(CatmullRomCurve3) | lookAt(position * 2) |
| Bumps | SphereGeometry | No rotation needed |
| Crystals | OctahedronGeometry | lookAt(position * 2) |

## PRNG System

Uses sfc32 (Small Fast Counter) for deterministic randomness:

```javascript
function sfc32(a, b, c, d) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
```

Seeded from 64-character hash split into 4 x 32-bit integers.

## Feedback System

Uses localStorage for persistence:

```javascript
{
  "liked": [
    {
      "timestamp": 1706990400000,
      "hash": "0x...",
      "features": { ... },
      "hadOverrides": false
    }
  ],
  "disliked": [ ... ]
}
```

Key: `metaforms-feedback`

## Global API

```javascript
window.metaforms = {
  regenerate()          // New hash, regenerate
  saveImage()           // Download PNG
  recordFeedback(bool)  // Store like/dislike
  setParameter(k, v)    // Override feature
  resetToOriginal()     // Restore hash defaults
  getFeatures()         // Current features object
  getHash()             // Current 0x... hash
  getRarityCurves()     // Probability data
  VERSION               // "1.0.0"
}
```

## Dependencies

- **three.js r128**: Core 3D engine
- **OrbitControls**: Camera manipulation
- No build step required (CDN imports)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

Requires WebGL 2 for:
- MeshPhysicalMaterial transmission (Glass)
- Iridescence effects
