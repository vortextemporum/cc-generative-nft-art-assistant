# Genital Forms - AI Assistant Guide

## Project Overview

**Genital Forms** is a procedural 3D generative art piece exploring human anatomical forms across a full spectrum - phallic, vulvic, intersex, ambiguous, and abstract interpretations. Built with Three.js, it combines procedural geometry generation with soft-body physics simulation.

**Current Version:** 2.1.0

## File Structure

```
genital-forms/
├── index.html          # Viewer with content warning
├── sketch.js           # Main sketch (Three.js, geometry generators)
├── CLAUDE.md           # This file
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
│   └── .gitkeep
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation details
```

## Key Concepts

### 1. Form Types (12 categories!)

**Anatomical:**
- **Phallic** (common) - Classic Shaft with glans, testicles
- **Vulvic** (common) - Bloom Fold with labia, clitoris
- **Intersex** (rare) - Spectrum Blend of characteristics
- **Ambiguous** (rare) - Suggestive Blob with organic forms

**Surreal:**
- **Abstract** (legendary) - Twisted Dream parametric forms
- **Morphic** (legendary) - Shapeshifter between types

**Fantasy:**
- **Draconic** (rare) - Dragon's Pride with scales, ridges, knot
- **Tentacular** (rare) - Kraken's Kiss with suckers
- **Hydra** (legendary) - Many-Headed Beast branching form
- **Knotted** (uncommon) - Love Knot at base
- **Alien** (legendary) - Xenomorph Delight bio-organic

**Humorous:**
- **Emoji** (legendary) - Happy Ending with face expressions

### 2. Procedural Geometry
Each form is generated from scratch using parametric equations:
- `generatePhallicForm()` - Radial profile with tip, ridge, veins
- `generateVulvicForm()` - Figure-8 cross sections with folds
- `generateIntersexForm()` - Blended profiles
- `generateAmbiguousForm()` - Displaced icosphere with bulges
- `generateAbstractForm()` - Twisted parametric surface
- `generateMorphicForm()` - Runtime interpolation

### 3. Materials (25 types)
Organized by category:
- **Natural:** Clay, Ceramic, Terracotta, Marble, Bronze, Jade, Obsidian
- **Synthetic:** Bubblegum Pink, Midnight Rubber, Body Safe Silicone, Chrome Stallion, Rave Ready
- **Fantasy:** Dragon Scale, Deep Sea Purple, Xenomorph Slime, Molten Core, Frost Giant
- **Surreal:** Glass Dildo, Mercury Dreams, Cosmic Void, Unicorn Horn, Realistic Flesh
- **Humorous:** Pride Parade (rainbow), 24K Gold Member, Gummy Goodness

### 4. Soft-Body Physics
Simple spring-mass system:
- Vertices spring back to original positions
- Gravity pulls downward
- Subtle wave motion adds life
- Auto-enabled for soft materials (silicone, rubber, flesh, liquid)

### 5. Special Traits
Random chance for additional features:
- **Googly Eyes** (8%) - Comical googly eyes, toggle with G
- **Glitter Bomb** (10%) - Sparkly metallic surface
- **Rainbow Mode** (5%) - Full spectrum coloring
- **Extra Veiny** (15%) - Pronounced surface veins
- **Ribbed** (12%) - Pleasure ridges texture
- **Glow in Dark** (7%) - Emissive glow effect
- **Comically Large** (5%) - 50-100% oversized

### 6. Rarity System
Multi-factor scoring:
- Form type rarity
- Material rarity
- Render style rarity
- Composition (Paired = rare, Triple Threat = legendary)
- Special traits (+2 each)

## Controls

| Key | Action |
|-----|--------|
| R | Regenerate |
| S | Save PNG |
| P | Toggle physics |
| A | Toggle auto-rotate |
| G | Toggle googly eyes |
| Drag | Rotate view |
| Scroll | Zoom |

## Quick Commands

```bash
# View in browser
open index.html

# With local server
python3 -m http.server 8000
```

## Making Changes

### Adding a New Form Type
1. Add entry to `FORM_TYPES` object
2. Create `generateYourForm(params, rng)` function
3. Return `{ main: BufferGeometry, extras: [] }`
4. Update weights in `generateFeatures()`

### Adding a New Material
```javascript
myMaterial: {
  name: 'My Material',
  rarity: 'uncommon',
  props: {
    color: '#hexcolor',
    metalness: 0-1,
    roughness: 0-1,
    // optional: transparent, opacity, emissive
  }
}
```

### Modifying Physics
Key parameters in `updatePhysics()`:
- `gravity` - Downward force
- `damping` - Velocity decay (0.95 = slow, 0.8 = fast)
- `stiffness` - Spring strength

## Content Warning

The index.html includes a dismissable content warning modal. This is intentional for web display contexts.

## Dependencies

- Three.js r128 (CDN)
