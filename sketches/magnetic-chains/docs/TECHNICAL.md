# Magnetic Chains - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      index.html                          │
│  - Three.js CDN                                          │
│  - UI overlays (title, status, features, controls)       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      sketch.js                           │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Random    │  │  Topology   │  │  Physics Engine │  │
│  │   (sfc32)   │  │  Generators │  │  (MagneticPhys) │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│          │               │                 │             │
│          ▼               ▼                 ▼             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Feature Generation                      │ │
│  │   (topology, geometry, material, palette, params)   │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Three.js Rendering                      │ │
│  │   (scene, camera, lights, meshes, animation loop)   │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Random Number Generation

### sfc32 (Small Fast Counting RNG)

High-quality 32-bit PRNG with 128-bit state, seeded from hash:

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

**Seeding:** Hash is split into four 32-bit integers:
```javascript
function initRandom(hashStr) {
  const h = hashStr.slice(2);  // Remove "0x"
  const seeds = [];
  for (let i = 0; i < 4; i++) {
    seeds.push(parseInt(h.slice(i * 8, (i + 1) * 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}
```

### Fractional Brownian Motion (FBM)

Used for organic noise in some topologies (tangle):

```javascript
function fbm(x, seed, octaves = 4) {
  // Sum of noise at multiple frequencies
  // Amplitude halves, frequency doubles each octave
}
```

## Physics Engine

### MagneticPhysics Class

Simulates a chain of magnetic dipoles connected by springs.

#### State

- `positions[]` - 3D position of each bead
- `velocities[]` - 3D velocity of each bead
- `orientations[]` - Unit vector for magnetic dipole direction

#### Forces

**1. Spring Forces (Chain Cohesion)**
```
F_spring = k * (|r| - rest_length) * r_hat
```
- Applied between adjacent beads (i and i+1)
- `chainStiffness` = spring constant k

**2. Magnetic Dipole-Dipole Forces**
Based on the dipole-dipole interaction formula:
```
F = (3μ₀/4πr⁵)[m₁·r̂)m₂ + (m₂·r̂)m₁ + (m₁·m₂)r̂ - 5(m₁·r̂)(m₂·r̂)r̂]
```
Simplified implementation considers:
- Only non-adjacent beads (skip i+1)
- Limited range (10 beads max) for performance
- Direction based on dipole orientation along chain

**3. Thermal Noise**
```
F_thermal = random(-0.5, 0.5) * temperature
```
Applied independently to each axis.

#### Integration

Semi-implicit Euler with damping:
```javascript
velocity = (velocity + force * dt) * damping
position = position + velocity * dt
```

Velocity clamping prevents explosion:
```javascript
if (|velocity| > 0.5) velocity *= 0.5 / |velocity|
```

#### Bounding Box

Optional containment with bounce:
```javascript
if (position.x < min.x) {
  position.x = min.x;
  velocity.x *= -bounce;  // bounce = 0.5
}
```

#### Orientation Update

Orientations blend toward chain tangent:
```javascript
tangent = normalize(position[i+1] - position[i])
orientation = lerp(orientation, tangent, 0.2)
orientation = normalize(orientation)
```

## Topology Generators

Each generator returns an array of `[x, y, z]` points.

### Parametric Curves

**Circle:**
```
x = cos(t) * radius
y = sin(t) * radius
z = 0
```

**Helix:**
```
x = cos(t * turns) * radius
y = sin(t * turns) * radius
z = t * pitch
```

**Trefoil Knot:**
```
x = (sin(t) + 2*sin(2t)) * scale
y = (cos(t) - 2*cos(2t)) * scale
z = -sin(3t) * scale * thickness
```

**Torus Knot (p,q):**
```
r = cos(q*t) + 2
x = r * cos(p*t) * scale
y = r * sin(p*t) * scale
z = -sin(q*t) * scale * 1.5
```

### Chaotic Systems

**Lorenz Attractor:**
```
dx/dt = σ(y - x)
dy/dt = x(ρ - z) - y
dz/dt = xy - βz
```
Default: σ=10, ρ=28, β=2.667

Points sampled every 60 iterations after 100 warmup steps.

**Random Walk:**
```
direction = random unit vector on sphere
step = stepSize * random(0.8, 1.2)
position += direction * step
```
Centered after generation.

## Rendering

### Scene Setup

- Background: #06060a (near-black)
- Ambient light: 0.4 intensity
- Directional light: 0.8 intensity from (5,5,5)
- Optional colored point lights from palette

### Geometry Creation

```javascript
function createGeometry(type, size) {
  switch(type) {
    case 'sphere': return new THREE.SphereGeometry(size, 24, 24);
    case 'cube': return new THREE.BoxGeometry(size * 1.6, ...);
    // etc.
  }
}
```

### Material Setup

```javascript
new THREE.MeshStandardMaterial({
  color,                              // From palette
  metalness: preset.props.metalness,  // 0-1
  roughness: preset.props.roughness,  // 0-1
  transparent: preset.props.transparent || false,
  opacity: preset.props.opacity ?? 1
});
```

### Chain Group

All beads are children of a single `THREE.Group`:
- Easier rotation/scaling
- Centered by bounding box
- Auto-scaled to fit view

### Animation Loop

```javascript
function animate() {
  requestAnimationFrame(animate);

  if (physicsEnabled) {
    physics.step(0.016);
    updateChainMeshes();
  }

  if (!isDragging && autoRotate) {
    chainGroup.rotation.y += 0.004;
  }

  camera.position.lerp(target, 0.1);
  renderer.render(scene, camera);
}
```

## Event Handling

### Mouse/Touch

- `mousedown/touchstart` - Begin drag, record position
- `mousemove/touchmove` - Update rotation based on delta
- `mouseup/touchend` - End drag
- `wheel` - Adjust camera Z position

### Keyboard

Event listener on `window` for global shortcuts.
Camera presets stored as position/target pairs.

## Performance Considerations

### Current Implementation

- Each bead is a separate mesh (no instancing)
- Physics runs on main thread
- Magnetic forces limited to 10-bead range
- Geometry shared between all beads

### Potential Optimizations

1. **InstancedMesh** - Single draw call for all beads
2. **Web Workers** - Offload physics to separate thread
3. **GPU Physics** - Use compute shaders for large chains
4. **LOD** - Reduce geometry detail when zoomed out

## Browser Compatibility

- Requires WebGL support
- ES6+ JavaScript features used
- Tested in Chrome, Firefox, Safari
- Mobile touch events supported

## Memory Management

Cleanup on regeneration:
```javascript
while (chainGroup.children.length > 0) {
  const child = chainGroup.children[0];
  if (child.geometry) child.geometry.dispose();
  if (child.material) child.material.dispose();
  chainGroup.remove(child);
}
```

Geometry is shared (created once per regeneration), materials are per-bead for gradient support.
