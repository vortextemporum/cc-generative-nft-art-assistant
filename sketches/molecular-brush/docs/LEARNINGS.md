# Learnings & Knowledge Base

## Techniques Discovered

### [2025-01-20] Frame Rendering Order in p5.brush
When using p5.brush with frames, the rendering order matters:
- `brush.reDraw()` commits all brush operations to the canvas
- Any native p5 drawing (like frames) done BEFORE `brush.reDraw()` will be covered by brush strokes
- **Solution**: Draw frames AFTER `brush.reDraw()` so they mask any artwork that extends past bounds

```javascript
// WRONG - frame gets covered by brush strokes
drawFrame();
renderArtwork();
brush.reDraw();

// CORRECT - frame masks brush strokes
renderArtwork();
brush.reDraw();
drawFrame();
```

### [2025-01-20] Palette-Derived Frame Colors
Generate cohesive frame colors from the artwork palette:
```javascript
function getPaletteFrameColors(paletteColors) {
  // Sort by luminance
  const sorted = [...paletteColors].sort((a, b) => {
    const lumA = a[0] * 0.299 + a[1] * 0.587 + a[2] * 0.114;
    const lumB = b[0] * 0.299 + b[1] * 0.587 + b[2] * 0.114;
    return lumA - lumB;
  });

  // Frame: darkened darkest color
  const frame = sorted[0].map(c => Math.floor(c * 0.6));
  // Mat: lightened lightest color
  const mat = sorted[sorted.length-1].map(c => Math.min(255, c + (255-c) * 0.85));

  return { frame, mat, shadow: sorted[0].map(c => c * 0.3) };
}
```

### [2025-01-20] Inner Padding for Artwork Containment
To ensure artwork stays visually inside frame (not just molecularly constrained):
- Add `innerPadding` property to frame styles
- Content bounds = frame margin + inner padding
- Molecules and splatters respect the total inset

```javascript
const frameStyles = {
  thin: { margin: 0.035, mat: 0, innerPadding: 0.015 },
  gallery: { margin: 0.05, mat: 0.015, innerPadding: 0.02 },
};
```

## Mistakes & Fixes

### [2025-01-20] Variable Scope Error with featureOverrides
**Problem**: Referenced `featureOverrides` variable before it was defined, causing sketch to break.
```javascript
// Line 277 - used before defined
const ovr = featureOverrides || {};

// Line 1107 - defined too late
let featureOverrides = {};
```

**Fix**: Either move variable declaration to top, or remove override system entirely if not needed.

**Lesson**: When adding new features that require global state, define variables at the top of the file with other globals.

### [2025-01-20] JavaScript Variable Conflict
**Problem**: Used `const params` in two different script blocks in index.html:
```javascript
// First script block
const params = new URLSearchParams(window.location.search);

// Second script block - ERROR: already declared
const params = new URLSearchParams(window.location.search);
```

**Fix**: Wrap one in an IIFE or use different variable names:
```javascript
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  // ...
})();
```

### [2025-01-20] Frame Overlay Issue
**Problem**: User reported "artwork renders on top of frame" - frame was being covered.
**Root cause**: Drawing frame before `brush.reDraw()` meant brush operations painted over it.
**Fix**: Moved `drawFrame()` call to after `brush.reDraw()`.

## Performance Optimizations

### [2025-01-20] Reduced Frame Complexity
- Removed wood grain texture function for thin frames (not needed)
- Simplified drawFrame() from ~100 lines to ~50 lines
- Removed ornate corner decorations for cleaner look

## p5.brush / Framework Notes

### [2025-01-20] p5.brush Requires WEBGL - Conditional Loading
p5.brush requires WEBGL mode. If loaded on a 2D canvas sketch, it throws:
```
TypeError: Cannot read properties of undefined (reading 'mat4')
```

**Solution**: Conditionally load p5.brush based on version:
```javascript
const needsBrush = !version.includes('v1.');
if (needsBrush) {
  document.write('<script src="p5.brush.min.js"><\/script>');
}
```

v1.x versions use 2D canvas with custom brush simulation.
v2.x versions use WEBGL with p5.brush library.

### [2025-01-20] p5.brush Coordinate System
- WEBGL mode centers origin at canvas center
- All brush operations use centered coordinates: `(-width/2, -height/2)` to `(width/2, height/2)`
- Native p5 rect() in WEBGL also uses centered coords

### [2025-01-20] p5.brush Render Timing
- p5.brush needs time to complete rendering
- For automated screenshots: wait at least 3-4 seconds after page load
- Use `brush.reDraw()` to force buffer update before screenshots

## MCP Research

### [2025-01-20] Frame Techniques from Dataset
Research found 6,481+ projects implementing frames in Art Blocks/fxhash datasets:
- Most common: Proportional margin system (`margin = width * fraction`)
- Nested rectangles for multi-layer frames
- Perlin noise for wood grain texture
- Shadow/depth effects with offset rectangles

## Version Compatibility

### [2025-01-20] v1.x vs v2.x Feature Differences
v1.x and v2.x versions have different feature structures. The features table must handle both:

**v1.x Features:**
- `palette` (name, colors, rarity)
- `density` (count, name, rarity)
- `physics` (mode, rarity) - e.g., "vortex", "orbital", "flocking", "molecular"
- `returnStyle` (style, name, rarity) - boundary behavior: "wrap", "spiral", "bounce"
- `trail` (length, name, rarity)
- `wetness` (value, name, rarity) - watercolor intensity
- `brushStyle` (style, name, rarity) - "heavy", "clean", "textured", "normal"
- `paper` (tone)
- `special` (effect, active) - rare effects: "chromatic", "glow", "scatter"
- `composition`

**v2.x Features:**
- `palette`, `flow`, `density`, `brush`, `strokes`, `trail`, `bleed`, `drops`, `frame`, `paper`, `composition`

### [2025-01-20] Local Library Storage
CDN libraries downloaded to `lib/` folder to avoid external dependencies:
- `lib/p5.min.js` - p5.js 1.9.0 (1MB)
- `lib/p5.brush.min.js` - p5.brush 1.1.2 (37KB)

Conditional loading preserved: p5.brush only loads for v2.x versions (requires WEBGL).
