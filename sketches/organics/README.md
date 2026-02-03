# ORGANICS

Generative 3D blob sculptures using deformed spheres with noise displacement.

## Overview

Organics creates weird, organic 3D blob objects by applying the logic of a 2D bezier blob generator to 3D:

**Original 2D concept:**
- Points around a ring with randomized radii
- Bezier curves with wobbling control points
- Smooth organic shapes

**3D extension:**
- Subdivided icosphere as base geometry
- Multi-octave simplex noise for radial displacement
- Noise perturbation for "wobble" effect
- Additional distortions, growths, and boolean cuts

## Controls

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save PNG |
| Space | Pause/resume rotation |
| L | Like current output |
| D | Dislike current output |

Mouse drag to orbit, scroll to zoom.

## Parameters (from 2D concept)

| Parameter | Effect |
|-----------|--------|
| Num Points | Controls noise complexity (more = bumpier) |
| Radius Randomness | How much the surface varies from a sphere |
| CP Offset Angle | "Wobble" - adds extra organic variation |
| Noise Scale | Frequency of the displacement pattern |
| Subdivisions | Mesh detail level (higher = smoother) |

## Features

### Materials (7 types)
- Matte, Glossy, Chrome, Iridescent, Glass, Emissive, Holographic

### Distortions (6 types)
- None, Twist, Taper, Bend, Bulge, Wave

### Growths (5 types)
- None, Spikes, Tendrils, Bumps, Crystals

### Boolean Operations (5 types)
- None, Sphere Cut, Box Cut, Cylinder Cut, Multi Cut

## Technical

Built with Three.js using:
- Subdivided IcosahedronGeometry
- Custom simplex noise (3D)
- Vertex displacement in spherical coordinates
- Studio 3-point lighting

## Files

```
organics/
├── index.html
├── sketch.js
├── CLAUDE.md
├── README.md
├── CHANGELOG.md
├── versions/
└── docs/
    ├── FEATURES.md
    └── TECHNICAL.md
```

## License

MIT
