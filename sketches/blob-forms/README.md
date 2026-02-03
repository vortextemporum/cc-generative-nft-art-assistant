# BLOB-FORMS

3D blob sculptures using exact 2D bezier blob algorithm + lathe revolution.

## Overview

This is a faithful 3D port of a 2D bezier blob generator. The original algorithm:
- Creates points around a ring with randomized radii
- Adds bezier control points perpendicular to radial direction
- Connects points with smooth bezier curves

The 3D extension uses THREE.LatheGeometry to revolve the profile, creating symmetric but exactly-shaped blobs.

## Controls

| Key | Action |
|-----|--------|
| R | Regenerate |
| S | Save PNG |
| Space | Pause rotation |
| L | Like |
| D | Dislike |

## Parameters

All original 2D blob parameters are exposed:
- **numPoints**: Points around the ring (4-20)
- **baseRadius**: Base size (0.5-2.0)
- **radiusRandomness**: Variation amount (0-0.5)
- **cpOffsetAngle**: Control point wobble in degrees (0-90)
- **cpDistance**: Control point distance (0.1-1.5)

Plus 3D settings:
- **latheSegments**: Smoothness of revolution (16-128)
- **material**: Surface material type
- **distortion**: Optional twist/taper/bend

## License

MIT
