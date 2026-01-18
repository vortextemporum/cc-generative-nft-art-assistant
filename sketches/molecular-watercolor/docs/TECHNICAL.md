# Technical Documentation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Hash Input                          │
│                    (64-char hex string)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      sfc32 PRNG                             │
│              Seeded from first 32 bytes                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Feature Generation                         │
│         Rarity rolls → Feature values → Config              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Sketch Setup                             │
│        Initialize molecules, paper texture, drops           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Draw Loop                               │
│   Physics → Update → Render → Effects → Repeat              │
└─────────────────────────────────────────────────────────────┘
```

---

## PRNG Implementation

### sfc32 (Small Fast Chaotic)

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

**Why sfc32?**
- Fast execution
- Good statistical properties
- 128-bit state (4 x 32-bit integers)
- Standard in Art Blocks ecosystem

### Seeding from Hash

```javascript
function initRandom(hashStr) {
  const h = hashStr.slice(2); // Remove '0x'
  const seeds = [];
  for (let i = 0; i < 4; i++) {
    seeds.push(parseInt(h.slice(i * 8, (i + 1) * 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}
```

Uses first 32 hex characters (128 bits) for seed.

---

## Physics Models

### Lennard-Jones Potential (Molecular Mode)

Models van der Waals forces between neutral atoms.

```
F(r) = 24ε [ 2(σ/r)^13 - (σ/r)^7 ]
```

Where:
- `r` = distance between particles
- `σ` = equilibrium distance (30px)
- `ε` = well depth (0.5)

**Behavior:**
- Strong repulsion at close range (r < σ)
- Weak attraction at medium range (σ < r < 2.5σ)
- Negligible force beyond cutoff (150px)

### Boids Algorithm (Flocking Mode)

Three rules:
1. **Separation**: Steer away from nearby neighbors (< 30px)
2. **Alignment**: Match velocity of neighbors (< 80px)
3. **Cohesion**: Steer toward center of neighbors (< 80px)

### Orbital Mechanics

```javascript
// Gravitational pull
gravity = toCenter.normalize() * (50 / (dist + 10));

// Perpendicular orbital velocity
orbital = createVector(-toCenter.y, toCenter.x).normalize() * 0.3;
```

### Wave Function

```javascript
waveX = sin(pos.y * 0.02 + time * 0.05 + phase) * 0.3;
waveY = cos(pos.x * 0.02 + time * 0.03 + phase) * 0.2;
```

---

## Rendering Pipeline

### 1. Paper Texture

```javascript
for each pixel (x, y):
  noise_value = perlin(x * 0.05, y * 0.05) * 20
  grain = random(-8, 8)
  color = base_color + noise_value + grain + tone_tint
  alpha = 30  // Subtle overlay
```

### 2. Watercolor Trail

Three layers with increasing spread:

```javascript
for layer in [0, 1, 2]:
  alpha = lerp(8, 3, layer/3) * pigment_density
  weight = lerp(size*2, size*4, layer/3) * wetness
  color_shift = [+5*layer, -3*layer, +8*layer]  // Pigment separation

  draw curveVertex path with noise wobble
```

### 3. Pigment Blob

Five concentric irregular shapes:

```javascript
for i in [5, 4, 3, 2, 1]:
  size = base_size * i * wetness
  alpha = lerp(5, 20, (5-i)/4) * pigment_density

  // Organic shape with noise
  for angle in [0, PI/8, 2*PI/8, ...]:
    radius = size + noise(angle*2, time) * size * 0.5
    curveVertex(x + cos(angle)*radius, y + sin(angle)*radius)
```

### 4. Water Drops

Expanding rings with edge bloom:

```javascript
for ring in [5, 4, 3, 2, 1]:
  ring_size = base_size + spread * ring * 0.3
  alpha = lerp(2, 8, (5-ring)/4) * life

  // Wobbly ring
  for angle in [0, PI/16, 2*PI/16, ...]:
    wobble = noise(angle*3, spread*0.1) * ring_size * 0.3
    curveVertex(...)
```

### 5. Pencil Hatching

```javascript
// Near a random molecule
for i in [0..numLines]:
  start = molecule.pos + random_offset
  end = start + direction * length

  // Sketchy line with wobble
  for t in [0, 0.1, 0.2, ..., 1]:
    vertex(lerp(start, end, t) + random_jitter)
```

---

## Memory Management

### Trail Buffer

Each molecule stores a circular buffer of positions:

```javascript
this.trail.push(this.pos.copy());
if (this.trail.length > features.trail.length) {
  this.trail.shift();  // Remove oldest
}
```

**Memory per molecule:** ~trail_length * 16 bytes (two floats)
**Total for 100 molecules, 80-point trails:** ~128 KB

### Drop Lifecycle

Drops are removed when life reaches 0:

```javascript
for (let i = drops.length - 1; i >= 0; i--) {
  drops[i].update();
  if (drops[i].isDead()) {
    drops.splice(i, 1);
  }
}
```

---

## Performance Considerations

### O(n²) Physics

Molecular and magnetic modes check all pairs:

```javascript
for (let other of others) {  // O(n)
  if (other === this) continue;
  // Force calculation...
}
```

**Mitigation:** Distance cutoff (150px) reduces effective comparisons.

### Recommended Limits

| Density | Molecules | FPS Impact |
|---------|-----------|------------|
| Sparse | 8-15 | Minimal |
| Normal | 40-100 | Smooth |
| Dense | 100-150 | Moderate |
| Swarm | 150-250 | Noticeable |

### Optimization Opportunities

1. **Spatial hashing**: Divide canvas into grid, only check nearby cells
2. **Web Workers**: Offload physics to separate thread
3. **Canvas caching**: Pre-render paper texture once
4. **requestAnimationFrame throttling**: Cap at 30fps for complex scenes

---

## Art Blocks Integration

### tokenData Interface

```javascript
// Art Blocks provides:
tokenData = {
  hash: "0x...",      // 64-char hex
  tokenId: "123",     // Token number
  // ...
};

// We populate:
tokenData.features = {
  "Palette": "Neon",
  "Physics": "Vortex",
  // ...
};
```

### Deployment Checklist

1. [ ] Remove `window.onFeaturesGenerated` callback
2. [ ] Remove HTML-specific code
3. [ ] Minify JavaScript
4. [ ] Test with Art Blocks sandbox
5. [ ] Verify determinism with same hash
6. [ ] Check all features display correctly
