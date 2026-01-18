# Pocket City - AI Assistant Guide

## Project Overview

**Pocket City** is an isometric city block generator featuring procedurally generated Pokemon-like creatures. It combines:
- Isometric city building aesthetics (inspired by projects like HexaCity, Playtime)
- Pokemon/creature collection mechanics with rarity tiers
- Urban ecology and mythical spirit creature themes
- Pixel art visual style with animated day/night cycle

**Current Version:** 1.0.0

## File Structure

```
pocket-city/
├── index.html          # Dark theme viewer with controls
├── sketch.js           # Main sketch (vanilla JS + Canvas)
├── CLAUDE.md           # This file - AI assistant guide
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
│   └── .gitkeep
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation
```

## Key Concepts

### Isometric System
- Uses 30° isometric projection
- Grid-based building placement
- Depth sorting for proper rendering order
- `toIso(x, y, z)` converts grid coords to screen coords

### Buildings
- 5 building types: apartment, shop, tower, warehouse, temple
- Variable heights based on type
- Procedural windows, roofs, neon signs
- 6 color palettes (Tokyo Neon, Cyberpunk, Pastel Dream, etc.)

### Creatures
8 creature types across 4 rarity tiers:

| Creature | Rarity | Theme | Active Times |
|----------|--------|-------|--------------|
| Trash Panda | Common | Urban | Dusk/Night |
| Neon Pigeon | Common | Urban | Dawn/Day |
| Sewer Slime | Uncommon | Urban | Night |
| Vent Spirit | Uncommon | Mythical | Dawn/Dusk |
| Rooftop Kitsune | Rare | Mythical | Dusk/Night |
| Alley Yokai | Rare | Mythical | Night |
| Sky Dragon | Legendary | Mythical | All Times |
| Ancient Guardian | Legendary | Mythical | Dawn/Dusk |

### Time System
- 4 times of day: dawn, day, dusk, night
- Each has unique sky gradient, ambient lighting, shadow color
- Creatures are only visible during their active times
- Windows light up at night, neon signs flicker

### Weather Effects
- None (default)
- Rain (falling streaks)
- Fog (floating clouds)
- Fireflies (glowing particles at night)

## Quick Commands

```bash
# Open in browser
open index.html

# Or with local server
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Making Changes

### Adding a New Creature

1. Add creature definition to `CREATURE_TYPES`:
```javascript
newCreature: {
  name: 'New Creature',
  rarity: 'uncommon',  // common/uncommon/rare/legendary
  colors: ['#primary', '#accent', '#highlight'],
  habitat: 'ground',   // ground/roof/sky/alley/building
  timeActive: ['dawn', 'dusk'],
  frames: 6
}
```

2. Add drawing method to `Creature` class:
```javascript
drawNewCreature(ctx, x, y, size, colors, time) {
  // Pixel art drawing code
}
```

3. Add case to `drawPixelSprite` switch statement.

### Adding a New Building Type

1. Add to `BUILDING_TYPES` array:
```javascript
{ name: 'newType', minHeight: 2, maxHeight: 5, width: 1, special: false }
```

2. Optionally add special roof style in `Building.drawRoof()`.

### Adding a New Weather Effect

1. Add initialization in `WeatherSystem.init()`:
```javascript
else if (this.type === 'newEffect') {
  // Initialize particles
}
```

2. Add update logic in `WeatherSystem.update()`.
3. Add drawing in `WeatherSystem.draw()`.

## Version Numbering

- **Major (2.0.0)**: Changes that affect hash→output mapping
- **Minor (1.1.0)**: New features, backward compatible
- **Patch (1.0.1)**: Bug fixes, no visual changes

### Before Making Changes
```bash
# Archive current version
cp sketch.js versions/v1.0.0-sketch.js
```

## Key Functions

| Function | Purpose |
|----------|---------|
| `generateFeatures()` | Derives all features from hash |
| `initWorld()` | Creates buildings and creatures |
| `toIso(x, y, z)` | Grid to isometric conversion |
| `animate()` | Main animation loop |
| `draw()` | Renders entire scene |
| `regenerate()` | New hash + reinitialize |

## Controls

| Key | Action |
|-----|--------|
| R | Regenerate (new hash) |
| S | Save PNG |
| Space | Pause/Resume |
| T | Cycle time of day |

## Exposed API

```javascript
window.pocketCity = {
  regenerate(),        // New hash
  saveImage(),         // Download PNG
  togglePause(),       // Pause animation
  cycleTime(),         // Switch time of day
  getFeatures(),       // Current feature object
  setParameter(n, v),  // Override a feature
  resetToOriginal(),   // Clear overrides
  hasModifications()   // Check for overrides
};
```

## Dependencies

- None (vanilla JavaScript + Canvas 2D)
- Art Blocks / fxhash hash-compatible

## Notes

- Canvas uses `image-rendering: pixelated` for crisp pixel art
- Buildings and creatures are depth-sorted each frame
- Creature visibility depends on time of day
- Neon signs only visible at dusk/night
- Stars drawn only at night
- Weather particles update independently of scene
