/**
 * CORRUPTED HARMONY v2.7.0
 * A fully populated isometric city where different visual realities coexist
 * Buildings, parks, plazas, roads, and urban infrastructure - all corrupted together
 */

// =============================================================================
// HASH-BASED RANDOMNESS
// =============================================================================

let hash = "0x" + Array(64).fill(0).map(() =>
  "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

if (typeof tokenData !== "undefined" && tokenData.hash) hash = tokenData.hash;
if (typeof fxhash !== "undefined") hash = fxhash;

function sfc32(a, b, c, d) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}

function initRandom(hashStr) {
  const h = hashStr.startsWith("0x") ? hashStr.slice(2) : hashStr;
  return sfc32(
    parseInt(h.substr(0, 8), 16),
    parseInt(h.substr(8, 8), 16),
    parseInt(h.substr(16, 8), 16),
    parseInt(h.substr(24, 8), 16)
  );
}

let R;
function rnd(min = 0, max = 1) { return min + R() * (max - min); }
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rndChoice(arr) { return arr[Math.floor(R() * arr.length)]; }
function rndBool(p = 0.5) { return R() < p; }
function rndShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(R() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Helper to create color with alpha (0-255)
function colorAlpha(c, a) {
  const col = color(c);
  col.setAlpha(a);
  return col;
}

function rollRarity() {
  const r = R();
  if (r < 0.05) return 'legendary';
  if (r < 0.15) return 'rare';
  if (r < 0.40) return 'uncommon';
  return 'common';
}

// =============================================================================
// CONFIGURATION
// =============================================================================

let features = {};
const GRID_SIZE = 6; // 6x6 city blocks - more buildings!
const BLOCK_SIZE = 280; // pixels per block in iso space
const ROAD_WIDTH = 25; // narrower roads = more building space
const PROP_SCALE = 4; // Scale factor for props/furniture

const EFFECT_TYPES = ['dither', 'liquify', 'stencil', 'glitch', 'corrupt', 'clean'];
const DITHER_MODES = ['floyd-steinberg', 'bayer', 'stipple', 'halftone'];
const ARCH_STYLES = ['brutalist', 'deco', 'modernist', 'gothic', 'retro', 'geometric', 'organic'];
const BLOCK_TYPES = ['buildings', 'park', 'plaza', 'parking', 'construction', 'water', 'market'];

const PALETTES = {
  muted: { bg: '#3a3a42', ground: '#2d2d35', road: '#1f1f25', building: ['#4a4a52', '#5a5a62', '#6a6a72', '#7a7a82', '#8a8a92'], accent: '#9a9aa2', grass: '#3d4a3d', water: '#2a3a4a', tree: '#2d3d2d' },
  sepia: { bg: '#4a3c30', ground: '#3a2c20', road: '#2a1c10', building: ['#5a4c40', '#6a5c50', '#7a6c60', '#8a7c70', '#9a8c80'], accent: '#baa080', grass: '#4a5040', water: '#3a4a50', tree: '#3a4030' },
  cool: { bg: '#2a3a4a', ground: '#1a2a3a', road: '#0a1a2a', building: ['#3a4a5a', '#4a5a6a', '#5a6a7a', '#6a7a8a', '#7a8a9a'], accent: '#8aaacc', grass: '#2a4a4a', water: '#1a3a5a', tree: '#1a3a3a' },
  warm: { bg: '#4a3a2a', ground: '#3a2a1a', road: '#2a1a0a', building: ['#5a4a3a', '#6a5a4a', '#7a6a5a', '#8a7a6a', '#9a8a7a'], accent: '#ccaa88', grass: '#4a4a2a', water: '#3a4a4a', tree: '#3a3a1a' },
  twilight: { bg: '#2a2a4e', ground: '#1a1a3e', road: '#0a0a2e', building: ['#3a3a5e', '#4a4a6e', '#5a5a7e', '#6a6a8e', '#8a8aae'], accent: '#aa8acc', grass: '#2a3a4a', water: '#1a2a5a', tree: '#1a2a3a' },
  fog: { bg: '#c8c8c8', ground: '#a0a0a0', road: '#707070', building: ['#909090', '#a0a0a0', '#b0b0b0', '#c0c0c0', '#d0d0d0'], accent: '#e8e8e8', grass: '#8a9a8a', water: '#7a8a9a', tree: '#6a7a6a' },
  neonBleed: { bg: '#0a0a1a', ground: '#050510', road: '#020208', building: ['#1a0a2a', '#2a1a3a', '#0a1a2a', '#1a1a3a', '#2a2a4a'], accent: '#ff2a6d', grass: '#0a2a1a', water: '#0a1a3a', tree: '#0a1a0a', neon: ['#ff2a6d', '#05d9e8', '#d1f7ff'] }
};

// =============================================================================
// ISOMETRIC HELPERS
// =============================================================================

const ISO_ANGLE = Math.PI / 6;
const COS_ISO = Math.cos(ISO_ANGLE);
const SIN_ISO = Math.sin(ISO_ANGLE);

function iso(x, y, z = 0) {
  return {
    x: (x - y) * COS_ISO,
    y: (x + y) * SIN_ISO - z
  };
}

function isoRect(pg, x, y, w, d, col) {
  const p1 = iso(x, y);
  const p2 = iso(x + w, y);
  const p3 = iso(x + w, y + d);
  const p4 = iso(x, y + d);
  pg.fill(col);
  pg.beginShape();
  pg.vertex(p1.x, p1.y);
  pg.vertex(p2.x, p2.y);
  pg.vertex(p3.x, p3.y);
  pg.vertex(p4.x, p4.y);
  pg.endShape(CLOSE);
}

function isoBox(pg, x, y, z, w, d, h, colTop, colLeft, colRight) {
  const p1 = iso(x, y, z + h);
  const p2 = iso(x + w, y, z + h);
  const p3 = iso(x + w, y + d, z + h);
  const p4 = iso(x, y + d, z + h);
  const p5 = iso(x, y + d, z);
  const p6 = iso(x + w, y + d, z);
  const p7 = iso(x + w, y, z);
  const p0 = iso(x, y, z);

  pg.fill(colTop);
  pg.beginShape();
  pg.vertex(p1.x, p1.y); pg.vertex(p2.x, p2.y);
  pg.vertex(p3.x, p3.y); pg.vertex(p4.x, p4.y);
  pg.endShape(CLOSE);

  pg.fill(colLeft);
  pg.beginShape();
  pg.vertex(p1.x, p1.y); pg.vertex(p4.x, p4.y);
  pg.vertex(p5.x, p5.y); pg.vertex(p0.x, p0.y);
  pg.endShape(CLOSE);

  pg.fill(colRight);
  pg.beginShape();
  pg.vertex(p2.x, p2.y); pg.vertex(p7.x, p7.y);
  pg.vertex(p6.x, p6.y); pg.vertex(p3.x, p3.y);
  pg.endShape(CLOSE);
}

// =============================================================================
// FEATURE GENERATION
// =============================================================================

function generateFeatures() {
  R = initRandom(hash);

  const rarity = rollRarity();
  let paletteKey = rarity === 'legendary' ? rndChoice(['neonBleed', 'twilight']) :
                   rarity === 'rare' ? rndChoice(['twilight', 'cool', 'warm']) :
                   rarity === 'uncommon' ? rndChoice(['sepia', 'cool', 'fog']) :
                   rndChoice(['muted', 'fog', 'sepia']);

  const weirdnessLevel = rarity === 'legendary' ? 'reality-collapse' :
                         rarity === 'rare' ? 'chaotic' :
                         rarity === 'uncommon' ? 'moderate' : 'subtle';

  const dominantEffect = rarity === 'legendary' ? 'all-blend' :
                         rarity === 'rare' ? rndChoice(['corrupt', 'liquify']) :
                         rarity === 'uncommon' ? rndChoice(['glitch', 'liquify']) :
                         rndChoice(['dither', 'stencil', 'clean']);

  const density = rndChoice(['sparse', 'normal', 'dense', 'packed']);
  const parkRatio = rnd(0.05, 0.15); // Less parks = more buildings!
  const hasRiver = rndBool(0.2);
  const timeOfDay = rndChoice(['day', 'dusk', 'night', 'dawn']);

  features = {
    rarity, palette: paletteKey, weirdnessLevel, dominantEffect,
    density, parkRatio, hasRiver, timeOfDay,
    seed: hash.slice(0, 10)
  };

  return features;
}

// =============================================================================
// CITY GRID
// =============================================================================

let cityGrid = [];
let cityElements = [];

function generateCityGrid() {
  cityGrid = [];

  // Initialize grid
  for (let gx = 0; gx < GRID_SIZE; gx++) {
    cityGrid[gx] = [];
    for (let gy = 0; gy < GRID_SIZE; gy++) {
      cityGrid[gx][gy] = { type: 'buildings', buildings: [], props: [] };
    }
  }

  // Place river if feature enabled
  if (features.hasRiver) {
    const riverCol = rndInt(1, GRID_SIZE - 2);
    for (let gy = 0; gy < GRID_SIZE; gy++) {
      cityGrid[riverCol][gy].type = 'water';
      if (rndBool(0.3)) cityGrid[riverCol + (rndBool() ? 1 : -1)][gy].type = 'water';
    }
  }

  // Distribute parks and plazas
  const parkCount = Math.floor(GRID_SIZE * GRID_SIZE * features.parkRatio);
  for (let i = 0; i < parkCount; i++) {
    let gx, gy, attempts = 0;
    do {
      gx = rndInt(0, GRID_SIZE - 1);
      gy = rndInt(0, GRID_SIZE - 1);
      attempts++;
    } while (cityGrid[gx][gy].type !== 'buildings' && attempts < 50);

    if (attempts < 50) {
      cityGrid[gx][gy].type = rndChoice(['park', 'park', 'plaza', 'market', 'construction']);
    }
  }

  // Generate content for each block
  for (let gx = 0; gx < GRID_SIZE; gx++) {
    for (let gy = 0; gy < GRID_SIZE; gy++) {
      generateBlockContent(gx, gy);
    }
  }
}

function generateBlockContent(gx, gy) {
  const block = cityGrid[gx][gy];
  const blockX = gx * (BLOCK_SIZE + ROAD_WIDTH);
  const blockY = gy * (BLOCK_SIZE + ROAD_WIDTH);

  switch (block.type) {
    case 'buildings':
      generateBuildingBlock(block, blockX, blockY);
      break;
    case 'park':
      generatePark(block, blockX, blockY);
      break;
    case 'plaza':
      generatePlaza(block, blockX, blockY);
      break;
    case 'water':
      generateWater(block, blockX, blockY);
      break;
    case 'market':
      generateMarket(block, blockX, blockY);
      break;
    case 'construction':
      generateConstruction(block, blockX, blockY);
      break;
  }
}

function generateBuildingBlock(block, bx, by) {
  // How many buildings fit in this block?
  const density = features.density === 'packed' ? rndInt(4, 7) :
                  features.density === 'dense' ? rndInt(3, 6) :
                  features.density === 'normal' ? rndInt(2, 4) : rndInt(2, 3);

  const subdivisions = subdividePlot(BLOCK_SIZE, BLOCK_SIZE, density);

  for (const sub of subdivisions) {
    const style = rndChoice(ARCH_STYLES);
    const effect = getEffect();
    const height = rndInt(180, 550);

    block.buildings.push({
      x: bx + sub.x,
      y: by + sub.y,
      w: sub.w - 2,
      d: sub.d - 2,
      h: height,
      style,
      effect,
      weirdness: generateWeirdness()
    });
  }

  // Add street furniture around block
  addStreetFurniture(block, bx, by);
}

function subdividePlot(w, d, count) {
  if (count <= 1) return [{ x: 0, y: 0, w, d }];

  const plots = [];
  const horizontal = rndBool();

  if (horizontal && count >= 2) {
    const split = rnd(0.3, 0.7);
    const h1 = Math.floor(d * split);
    plots.push(...subdividePlot(w, h1, Math.ceil(count / 2)).map(p => ({ ...p })));
    plots.push(...subdividePlot(w, d - h1, Math.floor(count / 2)).map(p => ({ ...p, y: p.y + h1 })));
  } else {
    const split = rnd(0.3, 0.7);
    const w1 = Math.floor(w * split);
    plots.push(...subdividePlot(w1, d, Math.ceil(count / 2)).map(p => ({ ...p })));
    plots.push(...subdividePlot(w - w1, d, Math.floor(count / 2)).map(p => ({ ...p, x: p.x + w1 })));
  }

  return plots;
}

function generatePark(block, bx, by) {
  // Grass base
  block.isGrass = true;

  // Paths
  const pathStyle = rndChoice(['cross', 'diagonal', 'winding', 'border']);
  block.pathStyle = pathStyle;

  // Trees
  const treeCount = rndInt(4, 12);
  for (let i = 0; i < treeCount; i++) {
    const tx = bx + rnd(5, BLOCK_SIZE - 5);
    const ty = by + rnd(5, BLOCK_SIZE - 5);
    block.props.push({ type: 'tree', x: tx, y: ty, size: rnd(8, 20), variant: rndInt(0, 3) });
  }

  // Benches
  const benchCount = rndInt(2, 5);
  for (let i = 0; i < benchCount; i++) {
    block.props.push({
      type: 'bench',
      x: bx + rnd(10, BLOCK_SIZE - 10),
      y: by + rnd(10, BLOCK_SIZE - 10),
      rotation: rndInt(0, 3)
    });
  }

  // Maybe a pond
  if (rndBool(0.3)) {
    block.props.push({
      type: 'pond',
      x: bx + BLOCK_SIZE / 2,
      y: by + BLOCK_SIZE / 2,
      w: rnd(15, 25),
      d: rnd(10, 20)
    });
  }

  // Maybe a gazebo
  if (rndBool(0.2)) {
    block.props.push({
      type: 'gazebo',
      x: bx + BLOCK_SIZE / 2,
      y: by + BLOCK_SIZE / 2
    });
  }
}

function generatePlaza(block, bx, by) {
  block.isPaved = true;

  // Central fountain or statue
  if (rndBool(0.7)) {
    block.props.push({
      type: rndChoice(['fountain', 'statue', 'obelisk']),
      x: bx + BLOCK_SIZE / 2,
      y: by + BLOCK_SIZE / 2
    });
  }

  // Benches around perimeter
  const benchCount = rndInt(4, 8);
  for (let i = 0; i < benchCount; i++) {
    const angle = (i / benchCount) * Math.PI * 2;
    const dist = BLOCK_SIZE * 0.35;
    block.props.push({
      type: 'bench',
      x: bx + BLOCK_SIZE / 2 + Math.cos(angle) * dist,
      y: by + BLOCK_SIZE / 2 + Math.sin(angle) * dist,
      rotation: Math.floor(angle / (Math.PI / 2))
    });
  }

  // Lamp posts
  block.props.push({ type: 'lamp', x: bx + 8, y: by + 8 });
  block.props.push({ type: 'lamp', x: bx + BLOCK_SIZE - 8, y: by + 8 });
  block.props.push({ type: 'lamp', x: bx + 8, y: by + BLOCK_SIZE - 8 });
  block.props.push({ type: 'lamp', x: bx + BLOCK_SIZE - 8, y: by + BLOCK_SIZE - 8 });

  // Maybe some market stalls
  if (rndBool(0.3)) {
    for (let i = 0; i < rndInt(2, 5); i++) {
      block.props.push({
        type: 'stall',
        x: bx + rnd(10, BLOCK_SIZE - 15),
        y: by + rnd(10, BLOCK_SIZE - 15)
      });
    }
  }
}

function generateWater(block, bx, by) {
  block.isWater = true;

  // Bridge across?
  if (rndBool(0.4)) {
    block.props.push({
      type: 'bridge',
      x: bx,
      y: by + BLOCK_SIZE / 2 - 5,
      w: BLOCK_SIZE,
      d: 10
    });
  }

  // Boats
  if (rndBool(0.3)) {
    block.props.push({
      type: 'boat',
      x: bx + rnd(10, BLOCK_SIZE - 10),
      y: by + rnd(10, BLOCK_SIZE - 10)
    });
  }
}

function generateMarket(block, bx, by) {
  block.isPaved = true;

  // Market stalls in rows
  const rows = rndInt(2, 3);
  const cols = rndInt(3, 5);
  const stallW = (BLOCK_SIZE - 10) / cols;
  const stallD = (BLOCK_SIZE - 10) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rndBool(0.8)) {
        block.props.push({
          type: 'stall',
          x: bx + 5 + c * stallW,
          y: by + 5 + r * stallD,
          w: stallW - 3,
          d: stallD - 3,
          color: rndInt(0, 3)
        });
      }
    }
  }
}

function generateConstruction(block, bx, by) {
  block.isDirt = true;

  // Crane
  if (rndBool(0.6)) {
    block.props.push({
      type: 'crane',
      x: bx + BLOCK_SIZE / 2,
      y: by + BLOCK_SIZE / 2,
      height: rndInt(60, 100)
    });
  }

  // Scaffolding / partial building
  if (rndBool(0.5)) {
    block.buildings.push({
      x: bx + rnd(5, 15),
      y: by + rnd(5, 15),
      w: rnd(25, 40),
      d: rnd(25, 40),
      h: rndInt(20, 50),
      style: 'scaffolding',
      effect: 'clean',
      weirdness: []
    });
  }

  // Debris piles
  for (let i = 0; i < rndInt(2, 5); i++) {
    block.props.push({
      type: 'debris',
      x: bx + rnd(5, BLOCK_SIZE - 5),
      y: by + rnd(5, BLOCK_SIZE - 5)
    });
  }
}

function addStreetFurniture(block, bx, by) {
  // Corner lamps
  if (rndBool(0.7)) {
    block.props.push({ type: 'lamp', x: bx - 4, y: by - 4 });
  }
  if (rndBool(0.7)) {
    block.props.push({ type: 'lamp', x: bx + BLOCK_SIZE + 4, y: by - 4 });
  }

  // Trees along street
  if (rndBool(0.5)) {
    const treeCount = rndInt(1, 3);
    for (let i = 0; i < treeCount; i++) {
      block.props.push({
        type: 'street-tree',
        x: bx - 4,
        y: by + (i + 1) * (BLOCK_SIZE / (treeCount + 1)),
        size: rnd(6, 10)
      });
    }
  }

  // Trash cans
  if (rndBool(0.4)) {
    block.props.push({ type: 'trashcan', x: bx + BLOCK_SIZE + 3, y: by + rnd(10, BLOCK_SIZE - 10) });
  }

  // Fire hydrant
  if (rndBool(0.2)) {
    block.props.push({ type: 'hydrant', x: bx - 3, y: by + rnd(20, BLOCK_SIZE - 20) });
  }

  // Mailbox
  if (rndBool(0.15)) {
    block.props.push({ type: 'mailbox', x: bx + BLOCK_SIZE + 3, y: by + rnd(10, 30) });
  }
}

function getEffect() {
  if (features.dominantEffect === 'all-blend') {
    return rndChoice(EFFECT_TYPES);
  } else if (rndBool(0.6)) {
    return features.dominantEffect;
  }
  return rndChoice(EFFECT_TYPES);
}

function generateWeirdness() {
  const weirdness = [];
  const level = features.weirdnessLevel;
  const chance = level === 'reality-collapse' ? 0.85 :
                 level === 'chaotic' ? 0.6 :
                 level === 'moderate' ? 0.35 : 0.1;

  // Melt - buildings dripping/fusing
  if (rndBool(chance)) {
    weirdness.push({
      type: 'melt',
      intensity: rnd(0.3, 0.9),
      direction: rndChoice(['down', 'left', 'right'])
    });
  }

  // Float - buildings hovering with detached chunks
  if (rndBool(chance * 0.7)) {
    weirdness.push({
      type: 'float',
      offset: rnd(8, 35),
      chunks: rndInt(1, 4)
    });
  }

  // Time echo - ghostly duplicate offset
  if (rndBool(chance * 0.5)) {
    weirdness.push({
      type: 'echo',
      opacity: rnd(0.15, 0.45),
      dx: rnd(-20, 20),
      dy: rnd(-25, 10)
    });
  }

  // Scale shift - part of building scaled differently
  if (rndBool(chance * 0.4)) {
    weirdness.push({
      type: 'scale-shift',
      factor: rnd(0.6, 1.6),
      section: rndChoice(['top', 'middle', 'bottom'])
    });
  }

  // Invert - upside down (rare/legendary only)
  if ((level === 'reality-collapse' || level === 'chaotic') && rndBool(0.15)) {
    weirdness.push({ type: 'invert', full: rndBool(0.5) });
  }

  return weirdness;
}

// =============================================================================
// EFFECT PROCESSORS
// =============================================================================

function applyEffect(pg, effect) {
  if (effect === 'clean') return;

  pg.loadPixels();
  const w = pg.width;
  const h = pg.height;

  if (effect === 'dither') {
    const mode = rndChoice(DITHER_MODES);
    applyDither(pg, w, h, mode);
  } else if (effect === 'liquify') {
    applyLiquify(pg, w, h, rnd(0.3, 0.7));
  } else if (effect === 'stencil') {
    applyStencil(pg, w, h, rndInt(3, 5));
  } else if (effect === 'glitch') {
    applyGlitch(pg, w, h, rnd(0.3, 0.7));
  } else if (effect === 'corrupt') {
    applyCorrupt(pg, w, h, rnd(0.2, 0.5));
  }

  pg.updatePixels();
}

function applyDither(pg, w, h, mode) {
  if (mode === 'bayer') {
    const bayer = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (pg.pixels[i + 3] < 10) continue;
        const gray = (pg.pixels[i] + pg.pixels[i+1] + pg.pixels[i+2]) / 3;
        const threshold = (bayer[y % 4][x % 4] / 16) * 255;
        const val = gray > threshold ? 255 : 0;
        pg.pixels[i] = pg.pixels[i+1] = pg.pixels[i+2] = val;
      }
    }
  } else if (mode === 'stipple') {
    // PURE NOISE - random threshold per pixel creates static/noise look
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (pg.pixels[i + 3] < 10) continue;
        const gray = (pg.pixels[i] + pg.pixels[i+1] + pg.pixels[i+2]) / 3;
        const threshold = R() * 255; // Random threshold = noise!
        const val = gray > threshold ? 255 : 0;
        pg.pixels[i] = pg.pixels[i+1] = pg.pixels[i+2] = val;
      }
    }
  } else if (mode === 'halftone') {
    // Halftone dots pattern
    const dotSize = 4;
    for (let by = 0; by < h; by += dotSize) {
      for (let bx = 0; bx < w; bx += dotSize) {
        let sum = 0, count = 0;
        for (let dy = 0; dy < dotSize && by + dy < h; dy++) {
          for (let dx = 0; dx < dotSize && bx + dx < w; dx++) {
            const i = ((by + dy) * w + (bx + dx)) * 4;
            if (pg.pixels[i + 3] > 10) {
              sum += (pg.pixels[i] + pg.pixels[i+1] + pg.pixels[i+2]) / 3;
              count++;
            }
          }
        }
        const avg = count > 0 ? sum / count : 0;
        const radius = (1 - avg / 255) * dotSize / 2;
        for (let dy = 0; dy < dotSize && by + dy < h; dy++) {
          for (let dx = 0; dx < dotSize && bx + dx < w; dx++) {
            const i = ((by + dy) * w + (bx + dx)) * 4;
            if (pg.pixels[i + 3] < 10) continue;
            const dist = Math.sqrt((dx - dotSize/2)**2 + (dy - dotSize/2)**2);
            const val = dist < radius ? 0 : 255;
            pg.pixels[i] = pg.pixels[i+1] = pg.pixels[i+2] = val;
          }
        }
      }
    }
  } else {
    // Floyd-Steinberg
    const errors = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (pg.pixels[i + 3] < 10) continue;
        const idx = y * w + x;
        let gray = (pg.pixels[i] + pg.pixels[i+1] + pg.pixels[i+2]) / 3 + errors[idx];
        const newVal = gray > 127 ? 255 : 0;
        const error = gray - newVal;
        if (x + 1 < w) errors[idx + 1] += error * 7/16;
        if (y + 1 < h) {
          if (x > 0) errors[idx + w - 1] += error * 3/16;
          errors[idx + w] += error * 5/16;
          if (x + 1 < w) errors[idx + w + 1] += error * 1/16;
        }
        pg.pixels[i] = pg.pixels[i+1] = pg.pixels[i+2] = newVal;
      }
    }
  }
}

function applyLiquify(pg, w, h, intensity) {
  const original = new Uint8ClampedArray(pg.pixels);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (original[i + 3] < 10) continue;

      const noiseVal = noise(x * 0.03, y * 0.03) * 2 - 1;
      let srcX = x + Math.floor(noiseVal * intensity * 20);
      let srcY = y + Math.floor(Math.sin(y * 0.08) * intensity * 15);

      if (y > h * 0.6) {
        srcY -= Math.sin(x * 0.15) * (y - h * 0.6) * intensity * 0.4;
      }

      srcX = constrain(srcX, 0, w - 1);
      srcY = constrain(srcY, 0, h - 1);
      const srcI = (Math.floor(srcY) * w + Math.floor(srcX)) * 4;

      pg.pixels[i] = original[srcI];
      pg.pixels[i+1] = original[srcI+1];
      pg.pixels[i+2] = original[srcI+2];
      pg.pixels[i+3] = original[srcI+3];
    }
  }
}

function applyStencil(pg, w, h, levels) {
  for (let i = 0; i < pg.pixels.length; i += 4) {
    if (pg.pixels[i + 3] < 10) continue;
    for (let c = 0; c < 3; c++) {
      const val = pg.pixels[i + c];
      const step = 255 / (levels - 1);
      pg.pixels[i + c] = Math.round(val / step) * step;
    }
  }
}

function applyGlitch(pg, w, h, intensity) {
  const original = new Uint8ClampedArray(pg.pixels);
  const shiftR = Math.floor(intensity * 8);
  const shiftB = -Math.floor(intensity * 6);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (original[i + 3] < 10) continue;

      const srcXR = constrain(x + shiftR, 0, w - 1);
      const srcXB = constrain(x + shiftB, 0, w - 1);
      pg.pixels[i] = original[(y * w + srcXR) * 4];
      pg.pixels[i + 2] = original[(y * w + srcXB) * 4 + 2];
    }
  }

  // Scanlines
  for (let y = 0; y < h; y += 3) {
    if (R() < intensity * 0.2) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        pg.pixels[i] *= 0.7;
        pg.pixels[i+1] *= 0.7;
        pg.pixels[i+2] *= 0.7;
      }
    }
  }
}

function applyCorrupt(pg, w, h, intensity) {
  const blockSize = 6;
  for (let by = 0; by < h; by += blockSize) {
    for (let bx = 0; bx < w; bx += blockSize) {
      if (R() < intensity * 0.25) {
        const mode = Math.floor(R() * 3);
        for (let y = by; y < by + blockSize && y < h; y++) {
          for (let x = bx; x < bx + blockSize && x < w; x++) {
            const i = (y * w + x) * 4;
            if (pg.pixels[i + 3] < 10) continue;
            if (mode === 0) {
              pg.pixels[i] = 255 - pg.pixels[i];
              pg.pixels[i+1] = 255 - pg.pixels[i+1];
              pg.pixels[i+2] = 255 - pg.pixels[i+2];
            } else if (mode === 1) {
              const t = pg.pixels[i];
              pg.pixels[i] = pg.pixels[i+2];
              pg.pixels[i+2] = t;
            } else {
              pg.pixels[i] = pg.pixels[i+1] = pg.pixels[i+2] = R() > 0.5 ? 255 : 0;
            }
          }
        }
      }
    }
  }
}

// =============================================================================
// DRAWING FUNCTIONS
// =============================================================================

function drawBuilding(pg, b, pal) {
  const cols = pal.building;
  // Strong contrast between faces for readable shapes
  const colTop = color(cols[4]);      // Brightest - top face catches light
  const colRight = color(cols[3]);    // Medium - right face (lit side)
  const colLeft = color(cols[1]);     // Darkest - left face (shadow side)
  const colDark = color(cols[0]);     // Very dark for accents
  const colAccent = color(pal.accent);

  pg.noStroke(); // No outlines - let shading define shape

  // Process weirdness effects
  let zOffset = 0;
  let meltIntensity = 0;
  let meltDir = 'down';
  let scaleShift = null;
  let isInverted = false;

  for (const w of b.weirdness) {
    if (w.type === 'float') zOffset = w.offset * PROP_SCALE;
    if (w.type === 'melt') { meltIntensity = w.intensity || 0.5; meltDir = w.direction || 'down'; }
    if (w.type === 'scale-shift') scaleShift = w;
    if (w.type === 'invert') isInverted = true;
  }

  // Draw time echo ghost first (behind building)
  for (const weird of b.weirdness) {
    if (weird.type === 'echo') {
      const echoX = weird.dx * PROP_SCALE || rnd(-15, 15) * PROP_SCALE;
      const echoY = weird.dy * PROP_SCALE || rnd(-20, 5) * PROP_SCALE;
      pg.push();
      isoBox(pg, b.x + echoX, b.y + echoY, zOffset, b.w, b.d, b.h,
             colorAlpha(cols[4], 60), colorAlpha(cols[2], 60), colorAlpha(cols[3], 60));
      pg.pop();
    }
  }

  if (b.style === 'scaffolding') {
    pg.stroke(cols[1]);
    pg.strokeWeight(PROP_SCALE);
    pg.noFill();
    for (let z = 0; z < b.h; z += 12 * PROP_SCALE) {
      const p1 = iso(b.x, b.y, z + zOffset);
      const p2 = iso(b.x + b.w, b.y, z + zOffset);
      const p3 = iso(b.x + b.w, b.y + b.d, z + zOffset);
      const p4 = iso(b.x, b.y + b.d, z + zOffset);
      pg.line(p1.x, p1.y, p2.x, p2.y);
      pg.line(p2.x, p2.y, p3.x, p3.y);
      pg.line(p3.x, p3.y, p4.x, p4.y);
      pg.line(p4.x, p4.y, p1.x, p1.y);
    }
    pg.noStroke();
    return;
  }

  pg.noStroke();

  // BRUTALIST - concrete slabs with heavy ledges
  if (b.style === 'brutalist') {
    isoBox(pg, b.x, b.y, zOffset, b.w, b.d, b.h, colTop, colLeft, colRight);
    // Heavy ledges at intervals
    const ledgeCount = Math.floor(b.h / (40 * PROP_SCALE)) + 1;
    for (let i = 1; i <= ledgeCount; i++) {
      const ledgeH = i * (b.h / (ledgeCount + 1));
      const ledgeD = 6 * PROP_SCALE;
      isoBox(pg, b.x - ledgeD, b.y - ledgeD, zOffset + ledgeH - 3*PROP_SCALE,
                     b.w + ledgeD*2, b.d + ledgeD*2, 4*PROP_SCALE, colTop, colDark, colDark);
    }
    // Rooftop mechanical
    const mechW = b.w * 0.25, mechD = b.d * 0.25;
    isoBox(pg, b.x + b.w*0.1, b.y + b.d*0.1, zOffset + b.h, mechW, mechD, b.h*0.08, colDark, colDark, colDark);

  // DECO - setbacks with ornate spire
  } else if (b.style === 'deco') {
    let curH = zOffset, curW = b.w, curD = b.d;
    const setbacks = 4;
    for (let i = 0; i < setbacks; i++) {
      const secH = b.h / setbacks;
      const offW = (b.w - curW) / 2;
      const offD = (b.d - curD) / 2;
      isoBox(pg, b.x + offW, b.y + offD, curH, curW, curD, secH, colTop, colLeft, colRight);
      curH += secH;
      curW *= 0.78;
      curD *= 0.78;
    }
    // Ornate spire
    const spireH = b.h * 0.25;
    const spireW = curW * 0.4;
    isoBox(pg, b.x + b.w/2 - spireW/2, b.y + b.d/2 - spireW/2, curH, spireW, spireW, spireH, colAccent, colLeft, colRight);
    // Antenna tip
    const tipP1 = iso(b.x + b.w/2, b.y + b.d/2, curH + spireH);
    const tipP2 = iso(b.x + b.w/2, b.y + b.d/2, curH + spireH + spireH*0.5);
    pg.strokeWeight(2);
    pg.line(tipP1.x, tipP1.y, tipP2.x, tipP2.y);

  // GOTHIC - pointed roof with pinnacles
  } else if (b.style === 'gothic') {
    isoBox(pg, b.x, b.y, zOffset, b.w, b.d, b.h * 0.65, colTop, colLeft, colRight);
    // Pointed roof
    const roofBase = zOffset + b.h * 0.65;
    const apex = iso(b.x + b.w/2, b.y + b.d/2, zOffset + b.h * 1.1);
    const c1 = iso(b.x, b.y, roofBase);
    const c2 = iso(b.x + b.w, b.y, roofBase);
    const c3 = iso(b.x + b.w, b.y + b.d, roofBase);
    const c4 = iso(b.x, b.y + b.d, roofBase);
    pg.fill(colDark); pg.beginShape(); pg.vertex(apex.x, apex.y); pg.vertex(c1.x, c1.y); pg.vertex(c4.x, c4.y); pg.endShape(CLOSE);
    pg.fill(colLeft); pg.beginShape(); pg.vertex(apex.x, apex.y); pg.vertex(c1.x, c1.y); pg.vertex(c2.x, c2.y); pg.endShape(CLOSE);
    pg.fill(colRight); pg.beginShape(); pg.vertex(apex.x, apex.y); pg.vertex(c2.x, c2.y); pg.vertex(c3.x, c3.y); pg.endShape(CLOSE);
    // Pinnacles at corners
    const pinH = b.h * 0.15, pinW = 5 * PROP_SCALE;
    isoBox(pg, b.x + 2*PROP_SCALE, b.y + 2*PROP_SCALE, roofBase, pinW, pinW, pinH, colAccent, colDark, colDark);
    isoBox(pg, b.x + b.w - pinW - 2*PROP_SCALE, b.y + 2*PROP_SCALE, roofBase, pinW, pinW, pinH, colAccent, colDark, colDark);

  // MODERNIST - glass tower with frame lines
  } else if (b.style === 'modernist') {
    const glassTop = color(cols[5] || cols[4]);
    const glassLeft = colorAlpha(cols[4], 200);
    const glassRight = colorAlpha(cols[4], 180);
    isoBox(pg, b.x, b.y, zOffset, b.w, b.d, b.h, glassTop, glassLeft, glassRight);
    // Vertical frame lines
    pg.stroke(colDark);
    pg.strokeWeight(1);
    for (let i = 1; i < 5; i++) {
      const xOff = b.x + (i / 5) * b.w;
      const p1 = iso(xOff, b.y, zOffset);
      const p2 = iso(xOff, b.y, zOffset + b.h);
      pg.line(p1.x, p1.y, p2.x, p2.y);
    }
    // Horizontal bands
    for (let z = zOffset; z < zOffset + b.h; z += b.h / 6) {
      const p1 = iso(b.x, b.y, z);
      const p2 = iso(b.x + b.w, b.y, z);
      pg.line(p1.x, p1.y, p2.x, p2.y);
    }
    // Rooftop antenna
    const antP1 = iso(b.x + b.w/2, b.y + b.d/2, zOffset + b.h);
    const antP2 = iso(b.x + b.w/2, b.y + b.d/2, zOffset + b.h * 1.15);
    pg.strokeWeight(2);
    pg.line(antP1.x, antP1.y, antP2.x, antP2.y);

  // RETRO - bulging sci-fi with dome
  } else if (b.style === 'retro') {
    const segs = 6;
    for (let i = 0; i < segs; i++) {
      const t = i / (segs - 1);
      const bulge = 1 + Math.sin(t * Math.PI) * 0.25;
      const segW = b.w * bulge, segD = b.d * bulge;
      const offW = (b.w - segW) / 2, offD = (b.d - segD) / 2;
      isoBox(pg, b.x + offW, b.y + offD, zOffset + i * b.h/segs, segW, segD, b.h/segs + 1, colTop, colLeft, colRight);
    }
    // Dome on top
    pg.noStroke();
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const r = b.w * 0.4 * Math.cos(t * Math.PI / 2);
      const domeZ = zOffset + b.h + b.w * 0.2 * Math.sin(t * Math.PI / 2);
      const dP = iso(b.x + b.w/2, b.y + b.d/2, domeZ);
      pg.fill(i % 2 === 0 ? colAccent : colTop);
      pg.ellipse(dP.x, dP.y, r, r * 0.5);
    }

  // GEOMETRIC - pyramid or crystal shape
  } else if (b.style === 'geometric') {
    isoBox(pg, b.x, b.y, zOffset, b.w, b.d, b.h * 0.6, colTop, colLeft, colRight);
    // Pyramid top
    const pyBase = zOffset + b.h * 0.6;
    const apex = iso(b.x + b.w/2, b.y + b.d/2, zOffset + b.h * 1.2);
    const c1 = iso(b.x, b.y, pyBase);
    const c2 = iso(b.x + b.w, b.y, pyBase);
    const c3 = iso(b.x + b.w, b.y + b.d, pyBase);
    const c4 = iso(b.x, b.y + b.d, pyBase);
    pg.fill(colDark); pg.beginShape(); pg.vertex(apex.x, apex.y); pg.vertex(c1.x, c1.y); pg.vertex(c4.x, c4.y); pg.endShape(CLOSE);
    pg.fill(colTop); pg.beginShape(); pg.vertex(apex.x, apex.y); pg.vertex(c1.x, c1.y); pg.vertex(c2.x, c2.y); pg.endShape(CLOSE);
    pg.fill(colRight); pg.beginShape(); pg.vertex(apex.x, apex.y); pg.vertex(c2.x, c2.y); pg.vertex(c3.x, c3.y); pg.endShape(CLOSE);

  // ORGANIC - twisted bio-form
  } else if (b.style === 'organic') {
    const segs = 8;
    for (let i = 0; i < segs; i++) {
      const t = i / segs;
      const twist = Math.sin(t * Math.PI * 3) * 8 * PROP_SCALE;
      const bulge = 1 + Math.sin(t * Math.PI * 2) * 0.15;
      const segW = b.w * bulge, segD = b.d * bulge;
      const offW = (b.w - segW) / 2 + twist, offD = (b.d - segD) / 2;
      isoBox(pg, b.x + offW, b.y + offD, zOffset + i * b.h/segs, segW, segD, b.h/segs + 1, colTop, colLeft, colRight);
    }
    // Organic blob top
    const blobP = iso(b.x + b.w/2, b.y + b.d/2, zOffset + b.h);
    pg.fill(colAccent);
    pg.noStroke();
    pg.ellipse(blobP.x, blobP.y - b.h*0.05, b.w * 0.5, b.d * 0.25);

  // DEFAULT
  } else {
    isoBox(pg, b.x, b.y, zOffset, b.w, b.d, b.h, colTop, colLeft, colRight);
  }

  pg.noStroke();

  // Apply melt effect - dripping edges
  if (meltIntensity > 0) {
    pg.fill(colorAlpha(cols[2], 150));
    const dripCount = Math.floor(meltIntensity * 8);
    for (let i = 0; i < dripCount; i++) {
      const dx = b.x + rnd(0, b.w);
      const dy = meltDir === 'down' ? b.y + b.d : b.y;
      const dripH = rnd(10, 40) * PROP_SCALE * meltIntensity;
      const dripW = rnd(3, 8) * PROP_SCALE;
      const p = iso(dx, dy, zOffset + b.h - rnd(0, b.h * 0.3));
      pg.ellipse(p.x, p.y + dripH/2, dripW, dripH);
    }
  }

  // Windows
  drawWindows(pg, b, pal, zOffset);

  // Floating chunks for float weirdness
  for (const w of b.weirdness) {
    if (w.type === 'float' && w.chunks) {
      for (let c = 0; c < w.chunks; c++) {
        const chunkW = b.w * rnd(0.15, 0.3);
        const chunkD = b.d * rnd(0.15, 0.3);
        const chunkH = rnd(10, 25) * PROP_SCALE;
        const chunkX = b.x + rnd(-b.w*0.3, b.w);
        const chunkY = b.y + rnd(-b.d*0.3, b.d);
        const chunkZ = zOffset + b.h + rnd(20, 60) * PROP_SCALE;
        isoBox(pg, chunkX, chunkY, chunkZ, chunkW, chunkD, chunkH, colTop, colLeft, colRight);
      }
    }
  }
}

function drawWindows(pg, b, pal, zOffset) {
  const S = PROP_SCALE;
  const winCol = color(pal.building[0]);
  const litCol = color(pal.accent);
  const winSpacingH = 15 * S;
  const winSpacingW = 10 * S;
  const winW = 4 * S;
  const winH = 5 * S;

  const rows = Math.max(1, Math.floor(b.h / winSpacingH));
  const colsX = Math.max(1, Math.floor(b.w / winSpacingW));
  const colsY = Math.max(1, Math.floor(b.d / winSpacingW));

  // Windows on RIGHT face (front-facing, along x-axis at y=b.y+b.d edge)
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c <= colsX; c++) {
      if (rndBool(0.7)) {
        const wx = b.x + (c / (colsX + 1)) * b.w;
        const wy = b.y + b.d; // Right face edge
        const wz = zOffset + (r / rows) * b.h;
        const lit = features.timeOfDay === 'night' ? rndBool(0.6) : rndBool(0.1);
        pg.fill(lit ? litCol : winCol);
        // Draw as small isometric quad on the face
        const p1 = iso(wx - winW/2, wy, wz - winH/2);
        const p2 = iso(wx + winW/2, wy, wz - winH/2);
        const p3 = iso(wx + winW/2, wy, wz + winH/2);
        const p4 = iso(wx - winW/2, wy, wz + winH/2);
        pg.quad(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
      }
    }
  }

  // Windows on LEFT face (front-facing, along y-axis at x=b.x edge)
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c <= colsY; c++) {
      if (rndBool(0.7)) {
        const wx = b.x; // Left face edge
        const wy = b.y + (c / (colsY + 1)) * b.d;
        const wz = zOffset + (r / rows) * b.h;
        const lit = features.timeOfDay === 'night' ? rndBool(0.6) : rndBool(0.1);
        pg.fill(lit ? litCol : winCol);
        // Draw as small isometric quad on the face
        const p1 = iso(wx, wy - winW/2, wz - winH/2);
        const p2 = iso(wx, wy + winW/2, wz - winH/2);
        const p3 = iso(wx, wy + winW/2, wz + winH/2);
        const p4 = iso(wx, wy - winW/2, wz + winH/2);
        pg.quad(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
      }
    }
  }
}

function drawTree(pg, t, pal) {
  const S = PROP_SCALE;
  const trunk = color(pal.building[1]);
  const leaves = color(pal.tree);
  const sz = t.size * S;

  // Trunk
  isoBox(pg, t.x - 1*S, t.y - 1*S, 0, 2*S, 2*S, sz * 0.4, trunk, trunk, trunk);

  // Foliage - layered circles
  const p = iso(t.x, t.y, sz * 0.5);
  pg.fill(leaves);
  pg.noStroke();
  for (let i = 3; i > 0; i--) {
    pg.ellipse(p.x, p.y - i * 3 * S, sz * (0.5 + i * 0.15), sz * (0.3 + i * 0.1));
  }
}

function drawLamp(pg, l, pal) {
  const S = PROP_SCALE;
  const post = color(pal.building[1]);
  const light = color(pal.accent);

  isoBox(pg, l.x - 0.5*S, l.y - 0.5*S, 0, 1*S, 1*S, 12*S, post, post, post);
  const top = iso(l.x, l.y, 12*S);
  pg.fill(light);
  pg.ellipse(top.x, top.y - 2*S, 4*S, 3*S);

  // Light glow at night
  if (features.timeOfDay === 'night') {
    pg.fill(colorAlpha(pal.accent, 48));
    pg.ellipse(top.x, top.y, 15*S, 10*S);
  }
}

function drawBench(pg, b, pal) {
  const S = PROP_SCALE;
  const wood = color(pal.building[2]);
  const metal = color(pal.building[1]);

  isoBox(pg, b.x, b.y, 0, 6*S, 2*S, 3*S, wood, wood, metal);
}

function drawFountain(pg, f, pal) {
  const S = PROP_SCALE;
  const stone = color(pal.building[3]);
  const water = color(pal.water);

  // Base
  isoBox(pg, f.x - 8*S, f.y - 8*S, 0, 16*S, 16*S, 3*S, stone, stone, stone);
  // Water
  isoRect(pg, f.x - 6*S, f.y - 6*S, 12*S, 12*S, water);
  // Center spout
  isoBox(pg, f.x - 1*S, f.y - 1*S, 0, 2*S, 2*S, 8*S, stone, stone, stone);
  // Water spray (simplified)
  const top = iso(f.x, f.y, 10*S);
  pg.fill(colorAlpha(pal.water, 128));
  pg.ellipse(top.x, top.y - 3*S, 8*S, 6*S);
}

function drawStall(pg, s, pal) {
  const S = PROP_SCALE;
  const colors = [pal.accent, pal.building[4], pal.grass, pal.building[3]];
  const canopyCol = color(colors[s.color || 0]);
  const frame = color(pal.building[1]);

  const w = (s.w || 8) * S;
  const d = (s.d || 6) * S;

  // Table
  isoBox(pg, s.x, s.y, 0, w, d, 4*S, frame, frame, frame);
  // Canopy
  isoBox(pg, s.x - 1*S, s.y - 1*S, 8*S, w + 2*S, d + 2*S, 1*S, canopyCol, canopyCol, canopyCol);
  // Poles
  isoBox(pg, s.x, s.y, 4*S, 1*S, 1*S, 4*S, frame, frame, frame);
  isoBox(pg, s.x + w - 1*S, s.y, 4*S, 1*S, 1*S, 4*S, frame, frame, frame);
}

function drawCrane(pg, c, pal) {
  const S = PROP_SCALE;
  const metal = color(pal.building[2]);
  const accent = color(pal.accent);

  // Base
  isoBox(pg, c.x - 3*S, c.y - 3*S, 0, 6*S, 6*S, 5*S, metal, metal, metal);
  // Tower
  pg.stroke(metal);
  pg.strokeWeight(2*S);
  const base = iso(c.x, c.y, 5*S);
  const top = iso(c.x, c.y, c.height * S);
  pg.line(base.x, base.y, top.x, top.y);
  // Arm
  const armEnd = iso(c.x + 30*S, c.y, c.height * S - 5*S);
  pg.line(top.x, top.y, armEnd.x, armEnd.y);
  // Cable
  pg.stroke(accent);
  pg.strokeWeight(1*S);
  pg.line(armEnd.x, armEnd.y, armEnd.x, armEnd.y + 30*S);
  pg.noStroke();
}

function drawPond(pg, p, pal) {
  const S = PROP_SCALE;
  pg.fill(color(pal.water));
  const center = iso(p.x, p.y, 0);
  pg.ellipse(center.x, center.y, p.w * S, p.d * 0.6 * S);
}

function drawBoat(pg, b, pal) {
  const S = PROP_SCALE;
  const wood = color(pal.building[2]);
  const p = iso(b.x, b.y, 1*S);
  pg.fill(wood);
  pg.ellipse(p.x, p.y, 8*S, 4*S);
}

// =============================================================================
// MAIN RENDER
// =============================================================================

let mainBuffer;

function setup() {
  const canvas = createCanvas(2000, 2000);
  canvas.parent('sketch-container');
  pixelDensity(1);
  noLoop();

  generateFeatures();
  generateCityGrid();

  if (typeof $fx !== 'undefined') {
    $fx.features({
      "Rarity": features.rarity,
      "Palette": features.palette,
      "Weirdness": features.weirdnessLevel,
      "Effect": features.dominantEffect,
      "Density": features.density,
      "River": features.hasRiver,
      "Time": features.timeOfDay
    });
  }
}

function draw() {
  // Clear canvas completely before redraw
  clear();

  const pal = PALETTES[features.palette];

  // Sky gradient
  for (let y = 0; y < height; y++) {
    const t = y / height;
    let c;
    if (features.timeOfDay === 'night') {
      c = lerpColor(color('#0a0a1a'), color(pal.bg), t);
    } else if (features.timeOfDay === 'dusk') {
      c = lerpColor(color('#4a2a3a'), color(pal.bg), t);
    } else {
      c = lerpColor(color(pal.building[4]), color(pal.bg), t);
    }
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();

  // Create main city buffer (dispose old one if exists)
  if (mainBuffer) mainBuffer.remove();
  const bufferSize = GRID_SIZE * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH;
  mainBuffer = createGraphics(bufferSize * 2, bufferSize * 2);
  mainBuffer.pixelDensity(1);

  // Center the isometric view
  mainBuffer.translate(mainBuffer.width / 2, mainBuffer.height * 0.5);

  // Draw ground first
  drawGround(mainBuffer, pal);

  // Draw roads
  drawRoads(mainBuffer, pal);

  // Collect all drawable elements with depth
  const elements = [];

  for (let gx = 0; gx < GRID_SIZE; gx++) {
    for (let gy = 0; gy < GRID_SIZE; gy++) {
      const block = cityGrid[gx][gy];
      const depth = gx + gy;

      // Block ground
      elements.push({ type: 'block-ground', block, gx, gy, depth: depth - 0.5 });

      // Buildings
      for (const b of block.buildings) {
        elements.push({ type: 'building', data: b, depth: depth + (b.x + b.y) / 200 });
      }

      // Props
      for (const p of block.props) {
        elements.push({ type: 'prop', data: p, propType: p.type, depth: depth + (p.x + p.y) / 200 });
      }
    }
  }

  // Sort by depth
  elements.sort((a, b) => a.depth - b.depth);

  // Draw all elements
  for (const el of elements) {
    if (el.type === 'block-ground') {
      drawBlockGround(mainBuffer, el.block, el.gx, el.gy, pal);
    } else if (el.type === 'building') {
      // Create dynamic buffer sized to building (MUCH faster than fixed large buffers)
      const b = el.data;
      const padding = 60;
      const bufW = Math.max(b.w, b.d) * 2 + padding * 2;
      const bufH = b.h + Math.max(b.w, b.d) + padding * 2;
      const bBuf = createGraphics(bufW, bufH);
      bBuf.pixelDensity(1);
      const originX = bufW / 2;
      const originY = bufH - padding - Math.max(b.w, b.d) * 0.5;
      bBuf.translate(originX, originY);
      drawBuilding(bBuf, { ...b, x: -b.w/2, y: -b.d/2 }, pal);

      // Apply effect
      applyEffect(bBuf, b.effect);

      // Draw to main buffer
      const pos = iso(b.x + b.w/2, b.y + b.d/2, 0);
      mainBuffer.image(bBuf, pos.x - originX, pos.y - originY);
      bBuf.remove(); // Clean up building buffer
    } else if (el.type === 'prop') {
      drawProp(mainBuffer, el.data, el.propType, pal);
    }
  }

  // Draw main buffer to canvas - FILL IT COMPLETELY WITH BUILDINGS
  const scale = Math.min(width / mainBuffer.width, height / mainBuffer.height) * 2.2;
  const scaledW = mainBuffer.width * scale;
  const scaledH = mainBuffer.height * scale;
  const offsetX = (width - scaledW) / 2;
  const offsetY = (height - scaledH) / 2 - height * 0.22; // Move up more
  image(mainBuffer, offsetX, offsetY, scaledW, scaledH);

  // Trigger preview
  if (typeof fxpreview === 'function') fxpreview();
}

function drawGround(pg, pal) {
  const totalSize = GRID_SIZE * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH;
  pg.noStroke();

  // Draw the entire ground plane
  isoRect(pg, -ROAD_WIDTH, -ROAD_WIDTH, totalSize + ROAD_WIDTH, totalSize + ROAD_WIDTH, color(pal.ground));
}

function drawRoads(pg, pal) {
  const roadCol = color(pal.road);
  const lineCol = colorAlpha(pal.building[3], 96);

  pg.noStroke();

  // Horizontal roads
  for (let gy = 0; gy <= GRID_SIZE; gy++) {
    const y = gy * (BLOCK_SIZE + ROAD_WIDTH) - ROAD_WIDTH / 2;
    isoRect(pg, -ROAD_WIDTH, y - ROAD_WIDTH/2, GRID_SIZE * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH * 2, ROAD_WIDTH, roadCol);
  }

  // Vertical roads
  for (let gx = 0; gx <= GRID_SIZE; gx++) {
    const x = gx * (BLOCK_SIZE + ROAD_WIDTH) - ROAD_WIDTH / 2;
    isoRect(pg, x - ROAD_WIDTH/2, -ROAD_WIDTH, ROAD_WIDTH, GRID_SIZE * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH * 2, roadCol);
  }

  // Road markings
  pg.stroke(lineCol);
  pg.strokeWeight(PROP_SCALE);
  for (let gx = 0; gx < GRID_SIZE; gx++) {
    for (let gy = 0; gy < GRID_SIZE; gy++) {
      // Crosswalk hints at intersections
      const ix = gx * (BLOCK_SIZE + ROAD_WIDTH);
      const iy = gy * (BLOCK_SIZE + ROAD_WIDTH);
      const p1 = iso(ix - 2 * PROP_SCALE, iy - ROAD_WIDTH/2, 0.1);
      const p2 = iso(ix - 2 * PROP_SCALE, iy - ROAD_WIDTH/2 - ROAD_WIDTH, 0.1);
      pg.line(p1.x, p1.y, p2.x, p2.y);
    }
  }
  pg.noStroke();
}

function drawBlockGround(pg, block, gx, gy, pal) {
  const S = PROP_SCALE;
  const bx = gx * (BLOCK_SIZE + ROAD_WIDTH);
  const by = gy * (BLOCK_SIZE + ROAD_WIDTH);
  const pathW = Math.max(4, BLOCK_SIZE * 0.03);

  if (block.isGrass) {
    isoRect(pg, bx, by, BLOCK_SIZE, BLOCK_SIZE, color(pal.grass));

    // Draw paths
    if (block.pathStyle === 'cross') {
      const pathCol = color(pal.building[2]);
      isoRect(pg, bx + BLOCK_SIZE/2 - pathW/2, by, pathW, BLOCK_SIZE, pathCol);
      isoRect(pg, bx, by + BLOCK_SIZE/2 - pathW/2, BLOCK_SIZE, pathW, pathCol);
    }
  } else if (block.isWater) {
    isoRect(pg, bx, by, BLOCK_SIZE, BLOCK_SIZE, color(pal.water));
    // Water ripples
    pg.stroke(colorAlpha(pal.building[4], 48));
    pg.strokeWeight(S);
    for (let i = 0; i < 3; i++) {
      const cx = bx + BLOCK_SIZE/2 + rnd(-10, 10) * S;
      const cy = by + BLOCK_SIZE/2 + rnd(-10, 10) * S;
      const p = iso(cx, cy, 0);
      pg.noFill();
      pg.ellipse(p.x, p.y, (10 + i * 5) * S, (6 + i * 3) * S);
    }
    pg.noStroke();
  } else if (block.isPaved) {
    isoRect(pg, bx, by, BLOCK_SIZE, BLOCK_SIZE, color(pal.building[1]));
    // Tile pattern
    pg.stroke(colorAlpha(pal.building[0], 64));
    pg.strokeWeight(S * 0.5);
    const tileSize = Math.max(8, BLOCK_SIZE * 0.04);
    for (let tx = 0; tx < BLOCK_SIZE; tx += tileSize) {
      const p1 = iso(bx + tx, by, 0.1);
      const p2 = iso(bx + tx, by + BLOCK_SIZE, 0.1);
      pg.line(p1.x, p1.y, p2.x, p2.y);
    }
    pg.noStroke();
  } else if (block.isDirt) {
    isoRect(pg, bx, by, BLOCK_SIZE, BLOCK_SIZE, colorAlpha(pal.building[1], 204));
  }
}

function drawProp(pg, p, type, pal) {
  const S = PROP_SCALE;
  switch (type) {
    case 'tree':
    case 'street-tree':
      drawTree(pg, p, pal);
      break;
    case 'lamp':
      drawLamp(pg, p, pal);
      break;
    case 'bench':
      drawBench(pg, p, pal);
      break;
    case 'fountain':
      drawFountain(pg, p, pal);
      break;
    case 'stall':
      drawStall(pg, p, pal);
      break;
    case 'crane':
      drawCrane(pg, p, pal);
      break;
    case 'pond':
      drawPond(pg, p, pal);
      break;
    case 'boat':
      drawBoat(pg, p, pal);
      break;
    case 'statue':
    case 'obelisk':
      isoBox(pg, p.x - 2*S, p.y - 2*S, 0, 4*S, 4*S, 15*S, color(pal.building[3]), color(pal.building[2]), color(pal.building[2]));
      break;
    case 'gazebo':
      isoBox(pg, p.x - 6*S, p.y - 6*S, 0, 12*S, 12*S, 2*S, color(pal.building[2]), color(pal.building[1]), color(pal.building[1]));
      isoBox(pg, p.x - 5*S, p.y - 5*S, 8*S, 10*S, 10*S, 1*S, color(pal.building[3]), color(pal.building[2]), color(pal.building[2]));
      break;
    case 'bridge':
      isoBox(pg, p.x, p.y, 2*S, p.w * S, p.d * S, 2*S, color(pal.building[2]), color(pal.building[1]), color(pal.building[1]));
      break;
    case 'trashcan':
      isoBox(pg, p.x, p.y, 0, 2*S, 2*S, 4*S, color(pal.building[1]), color(pal.building[0]), color(pal.building[0]));
      break;
    case 'hydrant':
      isoBox(pg, p.x, p.y, 0, 2*S, 2*S, 4*S, color('#aa3333'), color('#881111'), color('#991111'));
      break;
    case 'mailbox':
      isoBox(pg, p.x, p.y, 0, 1*S, 1*S, 5*S, color('#3333aa'), color('#111188'), color('#111199'));
      isoBox(pg, p.x - 1*S, p.y - 1*S, 5*S, 3*S, 3*S, 3*S, color('#3333aa'), color('#111188'), color('#111199'));
      break;
    case 'debris':
      pg.fill(color(pal.building[1]));
      const dp = iso(p.x, p.y, 0);
      pg.ellipse(dp.x, dp.y, rnd(3, 8) * S, rnd(2, 5) * S);
      break;
  }
}

// =============================================================================
// INTERACTION
// =============================================================================

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('corrupted-harmony-' + hash.slice(2, 10), 'png');
  }
  if (key === 'r' || key === 'R') {
    hash = "0x" + Array(64).fill(0).map(() =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    generateFeatures();
    generateCityGrid();
    redraw();
    if (typeof updateFeaturesDisplay === 'function') updateFeaturesDisplay();
  }
}

window.sketchAPI = {
  getFeatures: () => features,
  getHash: () => hash,
  regenerate: () => keyPressed({ key: 'r' })
};
