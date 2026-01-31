# Molecular Brush - Claude Guide

## Project Overview

A p5.brush-powered generative art piece featuring Fidenza-inspired flow fields combined with molecular physics simulation. Produces high-quality static renders using the p5.brush library for authentic brush strokes, watercolor bleed, and hatching effects.

**Current Version:** v2.8.1

## File Structure

```
molecular-brush/
├── index.html          # Viewer with sliders, version switcher, features table
├── sketch.js           # Main v2.7.0 variable aspect ratios + batch export
├── CLAUDE.md           # This file - AI assistant guide
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
│   ├── v1.0.0.js       # Initial release (p5.brush WEBGL)
│   ├── v1.0.1-animated.js  # Fast animated version (2D canvas)
│   ├── v2.0.0-static.js    # Static p5.brush (basic palettes)
│   └── v2.2.0-fast.js      # Backup of current
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation details
```

## Version History

| Version | Type | Description |
|---------|------|-------------|
| v2.8.0 | Static | New palettes: neon, retro, desert, arctic, midnight (current) |
| v2.7.0 | Static | Variable aspect ratios + batch export 20 PNGs |
| v2.6.x | Static | Thin palette-derived frames, artwork scaled inside |
| v2.2.0 | Static | Fast p5.brush with 14 palettes, drops, bleeds |
| v2.0.0 | Static | Fidenza-inspired flow fields + p5.brush (basic palettes) |
| v1.0.1 | Animated | Fast 2D rendering, no p5.brush |
| v1.0.0 | Static | Initial p5.brush attempt (slow) |

**Note:** v2.1.0 was lost (not saved before overwrite). v2.2.0 contains all its features.

## Key Concepts

### v2.0.0 Rendering Pipeline

1. **Simulation Phase** - Molecules follow flow fields with physics
2. **Rendering Phase** - Paths drawn with p5.brush strokes
3. **Details Phase** - Watercolor blobs and hatching added

### Flow Field Styles (8 types)

| Style | Description | Rarity |
|-------|-------------|--------|
| linear | Basic noise flow | Common |
| gentle | Smooth, slow curves | Common |
| curved | Wave-influenced | Uncommon |
| wave | Sinusoidal | Uncommon |
| radial | Outward from center | Rare |
| converge | Inward to center | Rare |
| spiral | Swirling vortex | Legendary |
| turbulent | Chaotic, high-frequency | Legendary |

### p5.brush Methods Used

```javascript
brush.seed(n)              // Deterministic randomness
brush.load()               // Initialize (after WEBGL canvas)
brush.set("2B")            // Select brush type
brush.stroke(hexColor, alpha)  // Note: hex string, not RGB!
brush.strokeWeight(w)      // Stroke thickness
brush.fill(hexColor, alpha)
brush.bleed(amount)        // Watercolor edge bleeding
brush.fillTexture(a, i)    // Paper grain
brush.hatch(density, angle) // Cross-hatching
brush.noHatch()
brush.line(x1, y1, x2, y2)
brush.circle(x, y, d)
brush.rect(x, y, w, h)
brush.reDraw()             // Force buffer update
```

### Color Format

p5.brush requires hex color strings, not RGB values:
```javascript
// WRONG: brush.stroke(255, 100, 50, 200);
// RIGHT: brush.stroke("#ff6432", 200);

function rgbToHex(rgb) {
  return '#' + rgb.map(c => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
```

### Available Brushes

| Brush | Type | Effect |
|-------|------|--------|
| 2B | pencil | Soft graphite |
| HB | pencil | Standard pencil |
| 2H | pencil | Hard pencil |
| cpencil | colored pencil | Waxy texture |
| pen | ink | Clean lines |
| marker | felt tip | Bold strokes |
| charcoal | charcoal | Rough texture |

### Feature System

Features derived from hash with rarity tiers:
- **Common** (~50-60%): Default behaviors
- **Uncommon** (~25-30%): Interesting variations
- **Rare** (~12-15%): Unusual combinations
- **Legendary** (~3-5%): Striking/unique outputs

### Exposed API

```javascript
// Hash control
window.setHash(newHash)     // Set new hash and re-render
window.regenerate()         // Generate random hash

// Parameters
window.setParameter(name, value)  // Update single param
window.resetParams()        // Reset to hash defaults
window.getParams()          // Get current params
window.rerender()           // Re-render with current params

// Info
window.getFeatures()        // Get feature object
window.isRendering()        // Check if rendering
window.getRenderProgress()  // Get progress 0-1

// UI Callbacks
window.onFeaturesGenerated(features)
window.onRenderStart()
window.onRenderProgress(progress)
window.onRenderComplete()
window.onParamsChanged(params)
```

## Quick Commands

```bash
# Open in browser
open index.html

# With local server (recommended)
python3 -m http.server 8000
# Visit http://localhost:8000

# Open specific version
open "index.html?version=v1.0.1-animated"
```

## UI Features

### Parameter Sliders (v2.0.0 only)
- Molecules (10-200)
- Trail Length (20-400)
- Flow Influence (0.1-1.0)
- Physics Strength (0-3)
- Brush Weight (0.5-6)
- Bleed Amount (0-0.5)
- Noise Scale (0.001-0.01)

### Version Switching
Dropdown selector loads different versions via URL param.

## Making Changes

### Before editing sketch.js:
1. Copy current version to `versions/`
2. Note changes in CHANGELOG.md

### After editing:
1. Bump version number in sketch.js header
2. Update CHANGELOG.md
3. Archive to versions folder

### Version Numbering
- **Major** (2.0.0 → 3.0.0): Breaking changes, new rendering approach
- **Minor** (2.0.0 → 2.1.0): New features, brushes
- **Patch** (2.0.0 → 2.0.1): Bug fixes, tweaks

## p5.brush Resources

- [GitHub repo](https://github.com/acamposuribe/p5.brush)
- [Official site](https://p5-brush.cargo.site/)
- [CDN](https://cdn.jsdelivr.net/npm/p5.brush)

## Performance Notes

- **Preview mode** (default): `pixelDensity(1)` - renders ~75% faster
- **High-quality export**: Press `H` or call `exportHQ()` for 2x resolution export
- `brush.colorCache(true)` enabled for WebGL shader optimization
- WEBGL mode required for p5.brush
- Coordinates centered (0,0 at canvas center)
- Use v1.0.1-animated for real-time preview

### p5.brush Performance Tips
- `brush.bleed()` is computationally expensive - use sparingly
- `brush.fillTexture()` adds texture calculations
- `brush.reDraw()` forces buffer commit - call once at end
- Reduce molecule count for faster iteration
