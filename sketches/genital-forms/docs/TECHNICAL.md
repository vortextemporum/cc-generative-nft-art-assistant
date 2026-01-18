# Genital Forms - Technical Documentation

## Architecture

```
┌─────────────────────────────────────────────┐
│                 sketch.js                    │
│                                              │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │    PRNG     │  │  Geometry Generators │   │
│  │   (sfc32)   │  │  (6 form types)      │   │
│  └─────────────┘  └─────────────────────┘   │
│         │                   │                │
│         ▼                   ▼                │
│  ┌─────────────────────────────────────┐    │
│  │         Feature Generation           │    │
│  │  (form, material, style, bg, etc.)  │    │
│  └─────────────────────────────────────┘    │
│                     │                        │
│                     ▼                        │
│  ┌─────────────────────────────────────┐    │
│  │         Three.js Rendering           │    │
│  │   + Soft-Body Physics Simulation    │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

## Geometry Generation

### Parametric Surface Method

All forms use a ring-and-segment approach:
```javascript
for (ring = 0; ring <= rings; ring++) {
  t = ring / rings;  // 0 to 1 along length

  for (seg = 0; seg <= segments; seg++) {
    theta = (seg / segments) * PI * 2;  // Around circumference

    radius = profileFunction(t, theta);
    x = cos(theta) * radius;
    z = sin(theta) * radius;
    y = t * height;

    positions.push(x, y, z);
  }
}
```

### Phallic Form Profile

```
radius(t) = {
  t < 0.7:  baseRadius * (1 + 0.1 * sin(t * 2π))     // Shaft
  t < 0.85: baseRadius * (1.1 - (t-0.7)/0.15 * 0.3)  // Glans ridge
  t >= 0.85: tipRadius * (1 - (t-0.85)/0.15 * 0.5)   // Tip
}
```

Additional modifiers:
- Curve: `curveOffset = curve * sin(t * π)`
- Twist: `theta += twist * t * 2π`
- Veins: `radius += max(0, sin(theta*3 + t*5)) * 0.03`

### Vulvic Form Profile

Figure-8 cross section:
```
radius(theta) = width * (0.8 + 0.2 * cos(theta * 2))
cleft = max(0, cos(theta)) * depth * labiaSize
z = sin(theta) * radius * 0.5 - cleft
```

Taper: `taper = 1 - pow(abs(t - 0.5) * 2, 2) * 0.5`

### Noise Displacement

FBM (Fractional Brownian Motion) adds organic detail:
```javascript
function fbm3D(x, y, z, seed, octaves) {
  value = 0, amplitude = 0.5, frequency = 1;
  for (i = 0; i < octaves; i++) {
    value += amplitude * noise3D(x*freq, y*freq, z*freq, seed+i);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}
```

## Physics Simulation

### Spring-Mass System

Each vertex acts as a mass connected to its original position by a spring:

```javascript
// Forces
springForce = (originalPos - currentPos) * stiffness
gravityForce = -0.0005

// Integration
velocity += force
velocity *= damping  // 0.95
position += velocity
```

### Wave Motion

Subtle animation adds life:
```javascript
wave = sin(time * 2 + vertexIndex * 0.1) * 0.001
velocity.y += wave
```

### Performance

- Only main mesh has physics (not extras)
- Runs every frame (~60fps target)
- Vertex normals recomputed after position updates

## Materials

### MeshStandardMaterial Properties

| Property | Range | Effect |
|----------|-------|--------|
| color | hex | Base color |
| metalness | 0-1 | Metal vs dielectric |
| roughness | 0-1 | Glossy vs matte |
| transparent | bool | Enable alpha |
| opacity | 0-1 | Transparency level |
| emissive | hex | Glow color |
| emissiveIntensity | 0-1 | Glow strength |
| flatShading | bool | Faceted look |
| wireframe | bool | Lines only |

### Lighting Setup

```
Ambient: 0.4 intensity (soft fill)
Key Light: 0.8 intensity from (2, 3, 2)
Fill Light: 0.3 intensity from (-2, 1, -1)
Rim Light: 0.2 intensity from (0, -2, -2)
```

Special materials (neon, galaxy) add a colored point light.

## Index Buffer Generation

Standard quad-to-triangle conversion:
```javascript
for (ring = 0; ring < rings; ring++) {
  for (seg = 0; seg < segments; seg++) {
    a = ring * (segments + 1) + seg;
    b = a + segments + 1;
    c = a + 1;
    d = b + 1;

    indices.push(a, b, c);  // First triangle
    indices.push(b, d, c);  // Second triangle
  }
}
```

## Extra Parts (Testicles, etc.)

Returned as array of descriptors:
```javascript
{
  position: [x, y, z],
  scale: [sx, sy, sz],
  type: 'sphere' | 'box'
}
```

Created as separate meshes with cloned material.

## Browser Compatibility

- Requires WebGL
- ES6+ JavaScript
- Touch events supported
- Tested: Chrome, Firefox, Safari

## Memory Management

On regenerate:
1. Dispose all geometries
2. Dispose all materials
3. Remove from scene
4. Reset transform
5. Generate fresh
