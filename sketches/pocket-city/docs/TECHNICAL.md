# Pocket City - Technical Documentation

## Architecture Overview

Pocket City is built with vanilla JavaScript and the HTML5 Canvas 2D API. It uses no external dependencies, making it suitable for Art Blocks and fxhash deployment.

## Core Systems

### 1. Random Number Generation

Uses the sfc32 (Simple Fast Counter) PRNG algorithm for deterministic randomness:

```javascript
function sfc32(a, b, c, d) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
```

**Seed Derivation:**
- Hash is 66 characters (0x + 64 hex digits)
- Extract 4 x 32-bit integers from positions 2-34
- Feed to sfc32 for reproducible sequence

### 2. Isometric Projection

Standard 2:1 isometric projection with 30° angle:

```javascript
const ISO_ANGLE = Math.PI / 6;  // 30 degrees
const TILE_WIDTH = 32;
const TILE_HEIGHT = 16;

function toIso(x, y, z = 0) {
  const isoX = (x - y) * (TILE_WIDTH / 2);
  const isoY = (x + y) * (TILE_HEIGHT / 2) - z * TILE_HEIGHT;
  return { x: isoX, y: isoY };
}
```

**Coordinate System:**
- Grid coordinates: (0,0) to (gridSize, gridSize)
- Z coordinate: height in tile units
- Screen origin: canvas center offset by `(width/2, height/3)`

### 3. Depth Sorting

Objects are sorted by their depth value for correct draw order:

```javascript
const drawables = [...buildings, ...creatures];
drawables.sort((a, b) => {
  const depthA = a.gridX + a.gridY + (a.z || 0) * 0.1;
  const depthB = b.gridX + b.gridY + (b.z || 0) * 0.1;
  return depthA - depthB;
});
```

Objects with lower (x+y) draw first (back), higher values draw last (front).

---

## Class Structure

### Building Class

```javascript
class Building {
  constructor(gridX, gridY, type, palette, features)

  // Properties
  gridX, gridY      // Grid position
  type              // Building type object
  height            // Number of floors
  width             // Tile width (1 or 2)
  palette           // Color palette
  baseColor         // Main building color
  roofStyle         // flat/peaked/dome/antenna
  hasNeon           // Neon sign enabled
  windowPattern     // Window arrangement variant
  details           // AC units, balconies, signs

  // Methods
  draw(ctx, offsetX, offsetY, time, timePalette)
  drawIsoFace(ctx, x, y, w, h, buildingH, face, color, intensity, timePalette)
  drawWindows(ctx, x, y, w, buildingH, time, timePalette)
  drawRoof(ctx, x, y, w, h, timePalette)
  drawNeonSign(ctx, x, y, time)
  adjustColor(hexColor, factor)
}
```

**Isometric Box Drawing:**
- Left face: darker shade (intensity * 0.7)
- Right face: medium shade (intensity * 0.9)
- Top face: brightest (intensity * 1.0)

### Creature Class

```javascript
class Creature {
  constructor(type, gridX, gridY, z = 0)

  // Properties
  type              // Creature type key
  data              // CREATURE_TYPES[type] reference
  gridX, gridY, z   // Position
  frame             // Animation frame
  direction         // left/right facing
  state             // idle/moving
  targetX, targetY  // Movement target
  animTimer         // Frame counter
  moveTimer         // Time until next movement decision
  bobOffset         // Vertical bob phase offset

  // Methods
  update(time, bounds)       // AI and animation
  draw(ctx, offsetX, offsetY, time, timePalette)
  drawPixelSprite(ctx, x, y, time, timePalette)
  getSpriteSize()            // Size by rarity

  // Creature-specific draw methods
  drawTrashPanda(ctx, x, y, size, colors, time)
  drawNeonPigeon(ctx, x, y, size, colors, time)
  drawSewerSlime(ctx, x, y, size, colors, time)
  drawVentSpirit(ctx, x, y, size, colors, time, timePalette)
  drawKitsune(ctx, x, y, size, colors, time)
  drawYokai(ctx, x, y, size, colors, time, timePalette)
  drawSkyDragon(ctx, x, y, size, colors, time)
  drawAncientGuardian(ctx, x, y, size, colors, time)
}
```

**Creature AI:**
- Move timer triggers new target selection
- Lerp toward target at 2% speed per frame
- Bounded to grid limits
- Direction updates based on movement

### WeatherSystem Class

```javascript
class WeatherSystem {
  constructor(type)

  // Properties
  type              // rain/fog/fireflies
  particles         // Array of particle objects

  // Methods
  init()            // Create initial particles
  update()          // Move particles
  draw(ctx, time)   // Render particles
}
```

**Particle Types:**
- Rain: `{ x, y, speed, length }` - falls diagonally
- Fireflies: `{ x, y, vx, vy, phase, size }` - floats with sine wave
- Fog: `{ x, y, width, height, speed, opacity }` - drifts horizontally

---

## Animation Loop

```javascript
function animate(timestamp) {
  if (!isPaused) {
    time++;
    update();
    draw();
  }
  requestAnimationFrame(animate);
}

function update() {
  creatures.forEach(c => c.update(time, bounds));
  if (weather) weather.update();
}

function draw() {
  drawSky(timePalette);
  drawGround(offsetX, offsetY, timePalette);

  // Sort and draw all objects
  drawables.sort((a, b) => a.depth - b.depth);
  drawables.forEach(d => d.draw(...));

  if (weather) weather.draw(ctx, time);
  if (features.timeOfDay === 'night') drawStars(time);
}
```

---

## Pixel Art Rendering

### Pixel Grid Alignment

```javascript
const PIXEL_SIZE = 2;

function drawPixelRect(ctx, x, y, w, h, color) {
  const px = Math.floor(x / PIXEL_SIZE) * PIXEL_SIZE;
  const py = Math.floor(y / PIXEL_SIZE) * PIXEL_SIZE;
  const pw = Math.ceil(w / PIXEL_SIZE) * PIXEL_SIZE;
  const ph = Math.ceil(h / PIXEL_SIZE) * PIXEL_SIZE;
  ctx.fillRect(px, py, pw, ph);
}
```

### CSS Rendering Mode

```css
#sketch-canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
```

---

## Time-Based Effects

### Sky Gradients

```javascript
const TIME_PALETTES = {
  dawn: {
    sky: ['#2d1b4e', '#6b4984', '#e8a4c4', '#ffd4a3'],
    ambient: '#ffb088',
    shadowColor: '#4a2060',
    lightIntensity: 0.7
  },
  // ... other times
};

function drawSky(timePalette) {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  timePalette.sky.forEach((color, i) => {
    gradient.addColorStop(i / (timePalette.sky.length - 1), color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

### Window Lighting

Windows light up at night based on position and time:

```javascript
const isNight = features.timeOfDay === 'night' || features.timeOfDay === 'dusk';
const isLit = isNight && ((row + col + Math.floor(time / 60)) % 3 !== 0);
```

### Neon Sign Flicker

```javascript
const flicker = Math.sin(time * 0.1) > 0.3 ? 1 : 0.6;
ctx.globalAlpha = flicker;
ctx.shadowBlur = 15;
```

---

## Performance Considerations

### Current Approach
- All rendering is immediate mode (no buffering)
- Objects recreated on regenerate, not every frame
- Weather particles are simple primitives
- No offscreen canvases

### Potential Optimizations
1. **Tile caching**: Pre-render ground tiles to offscreen canvas
2. **Building sprites**: Cache building renders when not animating
3. **Spatial partitioning**: Only update/draw visible objects
4. **RequestAnimationFrame throttling**: Cap at 30fps if needed

### Memory Usage
- Buildings: ~8 objects × ~500 bytes = ~4KB
- Creatures: ~8 objects × ~300 bytes = ~2.4KB
- Weather particles: ~100 × ~50 bytes = ~5KB
- Total estimated: <15KB runtime

---

## Platform Compatibility

### Art Blocks
```javascript
if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}
```

### fxhash
Would need wrapper to convert:
```javascript
if (typeof fxhash !== "undefined") {
  hash = "0x" + fxhash.slice(2);  // Adjust format
}
```

### Standalone
Generates random hash if no platform detected.

---

## Testing Checklist

- [ ] All 4 times of day render correctly
- [ ] All 8 creature types draw properly
- [ ] All 6 building palettes look good
- [ ] Creatures appear/disappear based on time
- [ ] Weather effects don't overlap badly with buildings
- [ ] Depth sorting works with overlapping objects
- [ ] R/S/Space/T controls all functional
- [ ] Same hash produces identical output
- [ ] No memory leaks on repeated regeneration
