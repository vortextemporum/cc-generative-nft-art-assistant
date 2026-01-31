# Micro-Cosmos Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                       index.html                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   UI Layer  │  │  Microscope │  │  Controls       │ │
│  │  (Features) │  │   Effect    │  │  (Buttons/Keys) │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                       sketch.js                          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │                 Three.js Scene                    │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │            Organism Manager                 │  │  │
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │  │  │
│  │  │  │Bact │ │Amoe │ │Para │ │Diat │ │Virus│ │  │  │
│  │  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ │  │  │
│  │  │  ┌─────┐ ┌─────┐                          │  │  │
│  │  │  │Cell │ │Roti │                          │  │  │
│  │  │  └─────┘ └─────┘                          │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │    PRNG     │  │   Camera    │  │    Features     │ │
│  │   (sfc32)   │  │   Control   │  │   Generation    │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. Hash-Based Randomness

Uses the sfc32 (Small Fast Counter) PRNG algorithm for deterministic randomness.

```javascript
function sfc32(a, b, c, d) {
    return function() {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        d = (d + 1) | 0;
        t = (t + d) | 0;
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    };
}
```

**Seeding:** The 64-character hex hash is split into four 32-bit integers to seed the PRNG.

**Helper Functions:**
- `rnd(min, max)` - Uniform random in range
- `rndInt(min, max)` - Random integer inclusive
- `rndChoice(arr)` - Random array element
- `rndBool(p)` - Boolean with probability p
- `rndGaussian(mean, std)` - Normal distribution

### 2. Three.js Rendering

**Camera:** OrthographicCamera provides 2D-like rendering with precise zoom control.

```javascript
camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2, frustumSize * aspect / 2,
    frustumSize / 2, frustumSize / -2,
    0.1, 10000
);
```

**Zoom:** Modifying the frustum size creates smooth zoom without perspective distortion.

**Coordinate System:**
- Origin at center of world
- World size: 2000 x 2000 units
- Z-axis used for layering (organisms at different depths)

### 3. Organism Class Hierarchy

```
Organism (base)
├── Bacteria
├── Amoeba
├── Paramecium
├── Diatom
├── Virus
├── Cell
└── Rotifer
```

**Base Organism Properties:**
- `x, y` - World position
- `vx, vy` - Velocity
- `angle, angularVel` - Rotation
- `size` - Base size
- `health` - 0 = dead
- `mesh` - Three.js Group
- `minZoomVisible, maxZoomVisible` - LOD thresholds

**Base Update Loop:**
1. Age increment
2. Apply velocity
3. World wrapping
4. Brownian motion
5. Damping
6. Update mesh position
7. LOD visibility check

### 4. Level of Detail (LOD) System

Each organism type has visibility thresholds:

| Organism | Min Zoom | Max Zoom |
|----------|----------|----------|
| Bacteria | 0 | 50 |
| Amoeba | 0 | 30 |
| Paramecium | 0 | 40 |
| Diatom | 0 | 40 |
| Virus | 3 | 80 |
| Cell | 0 | 20 |
| Rotifer | 0 | 25 |

**Implementation:**
```javascript
const zoomInRange = currentZoom >= this.minZoomVisible &&
                    currentZoom <= this.maxZoomVisible;
this.mesh.visible = zoomInRange && this.visible;
```

### 5. Ecosystem Dynamics

**Predation (Amoeba → Bacteria):**
1. Amoeba scans for nearby bacteria (< 200 units)
2. Extends pseudopod toward nearest target
3. Moves toward target
4. When close enough (< size * 0.8), engulfs
5. Target dies, food vacuole created

**Virus Attachment:**
1. Virus drifts randomly (Brownian motion dominant)
2. When near target (bacteria or cell), attaches
3. Velocity zeroed, position locked to target surface

**Population Management:**
- Dead organisms removed each frame
- Bacteria respawn when population < 30% of initial

### 6. Animation Systems

**Bacteria Flagella:**
```javascript
// Sine wave animation
this.flagellaPhase += dt * 10;
positions[i * 3 + 1] = Math.sin(t * Math.PI * 3 + this.flagellaPhase) * size * 0.2;
```

**Paramecium Cilia:**
- 40 cilia around perimeter
- Metachronal wave pattern (phase offset between neighbors)

**Amoeba Blob:**
- 16 control points with independent oscillation
- Pseudopod extension toward targets
- Shape recalculated each frame

**Rotifer Wheel:**
- Two wheel organs with 12 cilia each
- Synchronized rotation creating propulsion

### 7. Visual Style System

Four palettes corresponding to microscopy techniques:

```javascript
const palettes = {
    phaseContrast: {
        background: '#0a1510',
        organisms: ['#8fa', '#9eb', '#adc', '#7c9'],
    },
    fluorescence: {
        background: '#050510',
        organisms: ['#0ff', '#f0f', '#0f0', '#ff0', '#f80'],
    },
    darkField: {
        background: '#000',
        organisms: ['#ffd', '#fec', '#edb', '#dca'],
    },
    electronMicroscopy: {
        background: '#111',
        organisms: ['#aaa', '#999', '#888', '#bbb'],
    }
};
```

Style transitions based on `currentZoom` thresholds.

## Geometry Generation

### Bacteria Shapes

**Rod (CapsuleGeometry):**
```javascript
new THREE.CapsuleGeometry(size * 0.4, size, 8, 4);
```

**Spiral (TubeGeometry along sine curve):**
```javascript
const points = [];
for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const x = (t - 0.5) * size * 2;
    const y = Math.sin(t * Math.PI * 4) * size * 0.3;
    points.push(new THREE.Vector3(x, y, 0));
}
const curve = new THREE.CatmullRomCurve3(points);
new THREE.TubeGeometry(curve, 20, size * 0.15, 8, false);
```

### Cell Organelles

**Endoplasmic Reticulum:**
- Random walk curve generation
- TubeGeometry along CatmullRomCurve3

**Golgi Apparatus:**
- Stack of 5 EllipseCurves
- Positioned randomly within cytoplasm

**Mitochondria:**
- CapsuleGeometry
- Slight animation (position wobble)

### Corona Virus Spikes

Fibonacci sphere point distribution:
```javascript
const numSpikes = 20;
for (let i = 0; i < numSpikes; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / numSpikes);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i; // Golden angle
    // Position spike at (phi, theta) on sphere surface
}
```

## Input Handling

### Zoom
- Mouse wheel: `targetZoom *= (deltaY > 0 ? 0.9 : 1.1)`
- Touch pinch: Distance ratio between frames
- Smooth interpolation: `currentZoom += (targetZoom - currentZoom) * 0.1`

### Pan
- Mouse drag: `viewX -= dx / currentZoom`, `viewY += dy / currentZoom`
- Touch drag: Same calculation

### Keyboard
- Event listener on `keydown`
- Switch statement for key mapping

## Performance Considerations

1. **Geometry reuse:** Organisms create geometry once at spawn
2. **LOD visibility:** Organisms outside zoom range have `mesh.visible = false`
3. **Delta time cap:** `Math.min(dt, 0.1)` prevents physics explosion on tab refocus
4. **Buffer updates:** Only flagella/cilia positions update each frame
5. **Population cap:** Fixed organism counts prevent unbounded growth

## Future Optimizations

1. **Instanced rendering:** For bacteria and viruses (many similar objects)
2. **Shader-based organisms:** Move blob/cilia animation to GPU
3. **Spatial hashing:** For efficient proximity queries
4. **Web Workers:** Offload physics to separate thread
5. **Post-processing:** Add bloom, DOF, chromatic aberration via EffectComposer

## File Size

- `sketch.js`: ~35KB (unminified)
- Three.js r128: ~600KB (CDN)
- Total load: ~650KB + HTML/CSS
