# METAFORMS

Generative 3D blob sculptures using metaballs and marching cubes.

## Overview

Metaforms creates weird, organic 3D objects by combining:
- **Metaball isosurfaces** - Smooth blobby shapes from implicit fields
- **Multiple materials** - From matte clay to holographic glass
- **Geometric distortions** - Twist, taper, bend, bulge, wave
- **Surface growths** - Spikes, tendrils, bumps, crystals
- **Boolean cuts** - Sphere, box, cylinder subtractions

Each piece is deterministically generated from a 64-character hash, ensuring reproducibility across sessions.

## Controls

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save PNG |
| Space | Pause/resume rotation |
| L | Like current output |
| D | Dislike current output |

Mouse drag to orbit, scroll to zoom.

## Dev Mode UI

The viewer includes full development tools:
- **Parameter sliders** - Adjust blob count, radius, distortion strength, hue
- **Dropdown selects** - Change material, distortion type, growth type
- **Rarity curves** - Visualize probability distributions
- **Feedback system** - Track likes/dislikes for iteration

## Features

### Materials (7 types)
- Matte (30%) - Soft, diffuse surface
- Glossy (25%) - Shiny reflections
- Chrome (15%) - Full metallic mirror
- Iridescent (12%) - Color-shifting rainbow
- Glass (10%) - Transparent with refraction
- Emissive (5%) - Self-illuminating
- Holographic (3%) - Rainbow metallic

### Distortions (6 types)
- None (20%) - Pure metaball shape
- Twist (25%) - Spiral deformation
- Taper (20%) - Scale along axis
- Bend (15%) - Curved deformation
- Bulge (10%) - Center expansion
- Wave (10%) - Sinusoidal ripple

### Growths (5 types)
- None (40%) - Clean surface
- Spikes (20%) - Conical protrusions
- Tendrils (15%) - Curved tubes
- Bumps (15%) - Spherical bulges
- Crystals (10%) - Octahedral gems

### Boolean Operations (5 types)
- None (50%) - Solid form
- Sphere Cut (20%) - Spherical void
- Box Cut (15%) - Cubic void
- Cylinder Cut (10%) - Tubular void
- Multi Cut (5%) - Multiple voids

## Technical

Built with Three.js using:
- Custom metaball field sampling
- Marching cubes isosurface extraction
- Vertex-based distortion modifiers
- Procedural growth geometry
- Studio 3-point lighting

## Files

```
metaforms/
├── index.html      # Viewer with dev UI
├── sketch.js       # Main sketch code
├── CLAUDE.md       # AI assistant guide
├── README.md       # This file
├── CHANGELOG.md    # Version history
├── versions/       # Archived versions
└── docs/
    ├── FEATURES.md # Detailed feature docs
    └── TECHNICAL.md # Implementation details
```

## License

MIT
