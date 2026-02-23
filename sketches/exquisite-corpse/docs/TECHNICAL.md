# Exquisite Corpse - Technical Documentation

## Edge Matching Algorithm

### Edge Profile
A hash produces 24 anchor points along the right edge:
```
anchor[i] = { y: i/23, density, angle, contourVal }
```

Values are interpolated for any y-position via linear interpolation between nearest anchors.

### Field Construction
For a piece with `(ownHash, leftHash)`:

1. `leftProfile = deriveEdgeProfile(leftHash)` (or default)
2. `rightProfile = deriveEdgeProfile(ownHash)`
3. At any `(x, y)`:
   - `blend = smoothstep(x / SIZE)` → 0 at left, 1 at right
   - All values interpolate: `lerp(leftVal, rightVal, blend)`
   - Angles use `lerpAngle()` to handle wraparound

### Noise Continuity
Three noise generators per piece:
- **Left noise**: seeded from left profile → dominant at x=0
- **Right noise**: seeded from right profile → dominant at x=SIZE
- **Detail noise**: seeded from own hash → peaks at center, zero at edges

The blended noise ensures visual continuity at seams.

## PRNG
- **sfc32** (Small Fast Chaotic): 128-bit state, 32-bit output
- Hash string → 4x 32-bit seeds via hex parsing
- Separate RNG instances for field construction vs drawing

## Rendering Pipeline
Order matters for layering depth:
1. Ink wash (background tonal areas)
2. Contour lines (structural iso-lines)
3. Hatching (directional tone)
4. Flow threads (dynamic curves)
5. Stipple (fine detail dots)

## Performance
- Static rendering (no animation loop)
- 1024x1024 canvas, renders in ~200-500ms per piece
- Gallery creates one canvas per piece (DOM elements)
- Merged export composites all canvases to a temporary canvas
