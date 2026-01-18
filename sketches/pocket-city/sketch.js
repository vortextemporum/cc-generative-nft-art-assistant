// Pocket City - Isometric City Block with Pokemon-like Creatures
// v1.1.0 - Improved scale, depth sorting, and pixel art quality

// ============================================================================
// HASH-BASED RANDOMNESS
// ============================================================================

let hash = "0x" + Array(64).fill(0).map(() =>
  "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}

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

function initRandom(hashStr) {
  const seed = [];
  for (let i = 2; i < 66; i += 8) {
    seed.push(parseInt(hashStr.slice(i, i + 8), 16));
  }
  return sfc32(seed[0], seed[1], seed[2], seed[3]);
}

let R;
function rnd(min = 0, max = 1) { return R() * (max - min) + min; }
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rndChoice(arr) { return arr[Math.floor(R() * arr.length)]; }
function rndBool(p = 0.5) { return R() < p; }

// ============================================================================
// CONFIGURATION - SCALED FOR FULL CANVAS
// ============================================================================

const CONFIG = {
  GRID_SIZE: 4,           // 4x4 grid
  TILE_WIDTH: 80,         // Much larger tiles
  TILE_HEIGHT: 40,
  FLOOR_HEIGHT: 32,       // Height per floor
  PIXEL: 2,               // Pixel size for retro look
  CREATURE_SCALE: 1.5     // Bigger creatures
};

// ============================================================================
// COLOR PALETTES
// ============================================================================

const TIME_PALETTES = {
  dawn: {
    sky: ['#1a0a2e', '#4a2060', '#e87090', '#ffb060'],
    ground: '#2a1a3a',
    groundLight: '#3a2a4a',
    shadow: 'rgba(74, 32, 96, 0.5)',
    ambient: 0.75,
    windowGlow: true
  },
  day: {
    sky: ['#4a90c0', '#70b0d8', '#a0d0f0', '#d0f0ff'],
    ground: '#3a5a4a',
    groundLight: '#4a6a5a',
    shadow: 'rgba(40, 60, 80, 0.4)',
    ambient: 1.0,
    windowGlow: false
  },
  dusk: {
    sky: ['#1a1030', '#602050', '#d05040', '#ffa030'],
    ground: '#2a2030',
    groundLight: '#3a3040',
    shadow: 'rgba(40, 16, 64, 0.5)',
    ambient: 0.65,
    windowGlow: true
  },
  night: {
    sky: ['#050510', '#101030', '#1a1a50', '#252560'],
    ground: '#101020',
    groundLight: '#181830',
    shadow: 'rgba(5, 5, 16, 0.6)',
    ambient: 0.35,
    windowGlow: true
  }
};

const BUILDING_PALETTES = [
  { name: 'Tokyo Neon', colors: ['#ff6090', '#c04070', '#5060e0', '#40c0d0', '#f0c060'] },
  { name: 'Earthy', colors: ['#d0a070', '#c0d0a0', '#e0e0c0', '#f0e0c0', '#b09060'] },
  { name: 'Cyberpunk', colors: ['#ff00ff', '#00ffff', '#ff0080', '#8000ff', '#00ff80'] },
  { name: 'Pastel', colors: ['#ffc0e0', '#ffb0d0', '#b0e0ff', '#a0d0ff', '#d0b0e0'] },
  { name: 'Concrete', colors: ['#606070', '#808090', '#a0a0b0', '#c0c0d0', '#909098'] },
  { name: 'Sunset', colors: ['#ff6030', '#f0c090', '#e0e0d0', '#004080', '#1060a0'] }
];

// ============================================================================
// CREATURE DEFINITIONS
// ============================================================================

const CREATURE_TYPES = {
  trashPanda: {
    name: 'Trash Panda', rarity: 'common',
    colors: { body: '#606060', mask: '#303030', tail: '#808080', eyes: '#ffffff' },
    habitat: 'ground', timeActive: ['dusk', 'night'], size: 24
  },
  neonPigeon: {
    name: 'Neon Pigeon', rarity: 'common',
    colors: { body: '#7080e0', wing: '#a090ff', accent: '#ff90d0', eye: '#ff4040' },
    habitat: 'roof', timeActive: ['dawn', 'day'], size: 20
  },
  sewerSlime: {
    name: 'Sewer Slime', rarity: 'uncommon',
    colors: { body: '#60ff40', inner: '#40d020', glow: '#80ff60', eyes: '#ffffff' },
    habitat: 'ground', timeActive: ['night'], size: 22, glow: true
  },
  ventSpirit: {
    name: 'Vent Spirit', rarity: 'uncommon',
    colors: { body: '#e0e0e0', fade: '#a0a0a0', eyes: '#404040' },
    habitat: 'building', timeActive: ['dawn', 'dusk'], size: 26, ethereal: true
  },
  rooftopKitsune: {
    name: 'Rooftop Kitsune', rarity: 'rare',
    colors: { body: '#ff8020', accent: '#ffd000', tips: '#fff8e0', eyes: '#ff2020' },
    habitat: 'roof', timeActive: ['dusk', 'night'], size: 32
  },
  alleyYokai: {
    name: 'Alley Yokai', rarity: 'rare',
    colors: { body: '#6020a0', aura: '#a040ff', mask: '#ffffff', eyes: '#000000' },
    habitat: 'alley', timeActive: ['night'], size: 30, ethereal: true
  },
  skyDragon: {
    name: 'Sky Dragon', rarity: 'legendary',
    colors: { body: '#20d0e0', scales: '#40b0b0', belly: '#80fff0', eyes: '#00ffff', horns: '#e0a020' },
    habitat: 'sky', timeActive: ['dawn', 'day', 'dusk', 'night'], size: 48
  },
  ancientGuardian: {
    name: 'Ancient Guardian', rarity: 'legendary',
    colors: { stone: '#807060', runes: '#ffd020', eyes: '#ffa000', cracks: '#504030' },
    habitat: 'ground', timeActive: ['dawn', 'dusk'], size: 44
  }
};

// ============================================================================
// FEATURES
// ============================================================================

let features = {};

function generateFeatures() {
  R = initRandom(hash);

  const timeOptions = ['dawn', 'day', 'dusk', 'night'];
  features = {
    timeOfDay: rndChoice(timeOptions),
    palette: BUILDING_PALETTES[rndInt(0, BUILDING_PALETTES.length - 1)],
    creatureCount: rndInt(4, 7),
    hasLegendary: rndBool(0.08),
    hasRare: rndBool(0.20),
    hasTemple: rndBool(0.25),
    weather: rndChoice(['none', 'none', 'none', 'rain', 'fireflies']),
    neonSigns: rndBool(0.7)
  };

  return features;
}

// ============================================================================
// ISOMETRIC HELPERS
// ============================================================================

function toIso(gridX, gridY, z = 0) {
  const x = (gridX - gridY) * (CONFIG.TILE_WIDTH / 2);
  const y = (gridX + gridY) * (CONFIG.TILE_HEIGHT / 2) - z;
  return { x, y };
}

function getDepth(gridX, gridY, z = 0) {
  return (gridX + gridY) * 1000 + z;
}

// ============================================================================
// BUILDING CLASS
// ============================================================================

class Building {
  constructor(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.floors = rndInt(2, 6);
    this.width = rndBool(0.3) ? 2 : 1;
    this.color = rndChoice(features.palette.colors);
    this.roofType = rndChoice(['flat', 'peaked', 'antenna', 'dome']);
    this.hasNeon = features.neonSigns && rndBool(0.5);
    this.neonColor = rndChoice(['#ff0080', '#00ffff', '#ffff00', '#ff00ff']);
    this.windowStyle = rndInt(0, 2);
    this.acUnits = rndBool(0.4) ? rndInt(1, 3) : 0;
  }

  getHeight() {
    return this.floors * CONFIG.FLOOR_HEIGHT;
  }

  draw(ctx, offsetX, offsetY, time, timePalette) {
    const pos = toIso(this.gridX, this.gridY, 0);
    const x = pos.x + offsetX;
    const y = pos.y + offsetY;
    const h = this.getHeight();
    const w = CONFIG.TILE_WIDTH * this.width;
    const d = CONFIG.TILE_HEIGHT * this.width;

    // Shadow on ground
    ctx.fillStyle = timePalette.shadow;
    this.drawIsoShape(ctx, x + 10, y + 5, w * 0.8, d * 0.8, 0, 'shadow');

    // Left face (darker)
    ctx.fillStyle = this.adjustBrightness(this.color, timePalette.ambient * 0.6);
    this.drawIsoFace(ctx, x, y, w, d, h, 'left');

    // Right face (medium)
    ctx.fillStyle = this.adjustBrightness(this.color, timePalette.ambient * 0.8);
    this.drawIsoFace(ctx, x, y, w, d, h, 'right');

    // Top face (brightest)
    ctx.fillStyle = this.adjustBrightness(this.color, timePalette.ambient * 1.0);
    this.drawIsoFace(ctx, x, y, w, d, h, 'top');

    // Windows
    this.drawWindows(ctx, x, y, w, d, h, time, timePalette);

    // Roof details
    this.drawRoof(ctx, x, y - h, w, d, timePalette);

    // AC units
    if (this.acUnits > 0) {
      this.drawACUnits(ctx, x, y, w, d, h, timePalette);
    }

    // Neon sign
    if (this.hasNeon && timePalette.windowGlow) {
      this.drawNeon(ctx, x, y - h * 0.4, time);
    }
  }

  drawIsoFace(ctx, x, y, w, d, h, face) {
    ctx.beginPath();
    if (face === 'left') {
      ctx.moveTo(x - w/2, y);
      ctx.lineTo(x - w/2, y - h);
      ctx.lineTo(x, y - d/2 - h);
      ctx.lineTo(x, y + d/2);
    } else if (face === 'right') {
      ctx.moveTo(x, y + d/2);
      ctx.lineTo(x, y - d/2 - h);
      ctx.lineTo(x + w/2, y - h);
      ctx.lineTo(x + w/2, y);
    } else if (face === 'top') {
      ctx.moveTo(x, y - d/2 - h);
      ctx.lineTo(x - w/2, y - h);
      ctx.lineTo(x, y + d/2 - h);
      ctx.lineTo(x + w/2, y - h);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawIsoShape(ctx, x, y, w, d, h, type) {
    ctx.beginPath();
    ctx.moveTo(x, y - d/2);
    ctx.lineTo(x - w/2, y);
    ctx.lineTo(x, y + d/2);
    ctx.lineTo(x + w/2, y);
    ctx.closePath();
    ctx.fill();
  }

  drawWindows(ctx, x, y, w, d, h, time, timePalette) {
    const rows = this.floors;
    const cols = this.width * 2;
    const winH = CONFIG.FLOOR_HEIGHT * 0.5;
    const winW = (w * 0.6) / cols;
    const startY = y - h + CONFIG.FLOOR_HEIGHT * 0.3;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const wy = startY + row * CONFIG.FLOOR_HEIGHT;

        // Left face windows
        const wxL = x - w/3 + col * winW * 0.4 - row * 2;
        const isLitL = timePalette.windowGlow && ((row + col + Math.floor(time/80)) % 4 !== 0);
        this.drawWindow(ctx, wxL, wy, winW * 0.7, winH, isLitL, timePalette);

        // Right face windows
        const wxR = x + w/8 + col * winW * 0.4 + row * 2;
        const isLitR = timePalette.windowGlow && ((row + col + Math.floor(time/60)) % 3 !== 0);
        this.drawWindow(ctx, wxR, wy, winW * 0.7, winH, isLitR, timePalette);
      }
    }
  }

  drawWindow(ctx, x, y, w, h, isLit, timePalette) {
    if (isLit) {
      ctx.fillStyle = '#fff8c0';
      ctx.shadowColor = '#ffd060';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = '#203040';
      ctx.shadowBlur = 0;
    }
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
  }

  drawRoof(ctx, x, y, w, d, timePalette) {
    const roofColor = this.adjustBrightness('#505060', timePalette.ambient);
    ctx.fillStyle = roofColor;

    if (this.roofType === 'peaked') {
      const peakH = 20;
      ctx.beginPath();
      ctx.moveTo(x - w/2, y);
      ctx.lineTo(x, y - peakH);
      ctx.lineTo(x + w/2, y);
      ctx.lineTo(x, y + d/2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.roofType === 'antenna') {
      ctx.fillStyle = '#404050';
      ctx.fillRect(x - 2, y - 30, 4, 30);
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(x, y - 32, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.roofType === 'dome') {
      ctx.beginPath();
      ctx.arc(x, y, w/5, Math.PI, 0);
      ctx.fill();
    }
  }

  drawACUnits(ctx, x, y, w, d, h, timePalette) {
    ctx.fillStyle = this.adjustBrightness('#a0a0a0', timePalette.ambient * 0.7);
    for (let i = 0; i < this.acUnits; i++) {
      const acY = y - h * 0.3 - i * 25;
      const acX = x + w/2 - 5;
      ctx.fillRect(acX, acY, 12, 10);
      ctx.fillStyle = this.adjustBrightness('#606060', timePalette.ambient * 0.5);
      ctx.fillRect(acX + 2, acY + 2, 8, 3);
    }
  }

  drawNeon(ctx, x, y, time) {
    const flicker = Math.sin(time * 0.15) > 0.2;
    if (!flicker) return;

    ctx.fillStyle = this.neonColor;
    ctx.shadowColor = this.neonColor;
    ctx.shadowBlur = 15;
    ctx.fillRect(x - 20, y, 40, 10);
    ctx.shadowBlur = 0;
  }

  adjustBrightness(hex, factor) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, Math.floor(r * factor));
    g = Math.min(255, Math.floor(g * factor));
    b = Math.min(255, Math.floor(b * factor));
    return `rgb(${r},${g},${b})`;
  }
}

// ============================================================================
// CREATURE CLASS
// ============================================================================

class Creature {
  constructor(type, gridX, gridY, zOffset = 0) {
    this.type = type;
    this.data = CREATURE_TYPES[type];
    this.gridX = gridX;
    this.gridY = gridY;
    this.zOffset = zOffset;
    this.frame = 0;
    this.direction = rndBool() ? 1 : -1;
    this.animPhase = rnd(0, Math.PI * 2);
    this.moveTimer = rndInt(60, 200);
    this.targetX = gridX;
    this.targetY = gridY;
  }

  isVisible() {
    return this.data.timeActive.includes(features.timeOfDay);
  }

  update(time, gridSize) {
    if (!this.isVisible()) return;

    this.frame++;
    this.moveTimer--;

    if (this.moveTimer <= 0) {
      this.moveTimer = rndInt(80, 200);
      if (this.data.habitat !== 'sky') {
        this.targetX = Math.max(0.5, Math.min(gridSize - 0.5, this.gridX + rnd(-0.8, 0.8)));
        this.targetY = Math.max(0.5, Math.min(gridSize - 0.5, this.gridY + rnd(-0.8, 0.8)));
      } else {
        this.targetX = rnd(0.5, gridSize - 0.5);
        this.targetY = rnd(0.5, gridSize - 0.5);
      }
      this.direction = this.targetX > this.gridX ? 1 : -1;
    }

    this.gridX += (this.targetX - this.gridX) * 0.02;
    this.gridY += (this.targetY - this.gridY) * 0.02;
  }

  draw(ctx, offsetX, offsetY, time, timePalette) {
    if (!this.isVisible()) return;

    const pos = toIso(this.gridX, this.gridY, this.zOffset);
    const x = pos.x + offsetX;
    const bob = Math.sin(time * 0.08 + this.animPhase) * 4;
    const y = pos.y + offsetY + bob;
    const size = this.data.size * CONFIG.CREATURE_SCALE;

    ctx.save();
    if (this.direction < 0) {
      ctx.translate(x, y);
      ctx.scale(-1, 1);
      ctx.translate(-x, -y);
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(x, y + size/2 + 5, size/2, size/6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw creature based on type
    this['draw' + this.type.charAt(0).toUpperCase() + this.type.slice(1)](ctx, x, y, size, time, timePalette);

    ctx.restore();
  }

  // CREATURE DRAWING METHODS - High quality pixel art

  drawTrashPanda(ctx, x, y, size, time, tp) {
    const c = this.data.colors;
    const p = CONFIG.PIXEL;
    const bounce = Math.floor(this.frame / 15) % 2;

    // Body
    ctx.fillStyle = c.body;
    ctx.fillRect(x - size/2, y - size + bounce * p, size, size * 0.7);

    // Head
    ctx.fillRect(x - size/2.5, y - size - p * 4, size * 0.8, size * 0.5);

    // Ears
    ctx.fillRect(x - size/2.5, y - size - p * 7, p * 3, p * 4);
    ctx.fillRect(x + size/4 - p, y - size - p * 7, p * 3, p * 4);

    // Mask
    ctx.fillStyle = c.mask;
    ctx.fillRect(x - size/3, y - size - p * 2, size * 0.25, p * 3);
    ctx.fillRect(x + size/10, y - size - p * 2, size * 0.25, p * 3);

    // Eyes
    ctx.fillStyle = c.eyes;
    ctx.fillRect(x - size/4, y - size, p * 3, p * 3);
    ctx.fillRect(x + size/8, y - size, p * 3, p * 3);
    ctx.fillStyle = '#000';
    ctx.fillRect(x - size/4 + p, y - size + p, p, p * 2);
    ctx.fillRect(x + size/8 + p, y - size + p, p, p * 2);

    // Nose
    ctx.fillRect(x - p, y - size + p * 4, p * 2, p * 2);

    // Striped tail
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 === 0 ? c.body : c.tail;
      ctx.fillRect(x + size/2 - p * 2, y - size/2 + i * p * 3, p * 4, p * 3);
    }
  }

  drawNeonPigeon(ctx, x, y, size, time, tp) {
    const c = this.data.colors;
    const p = CONFIG.PIXEL;
    const wingUp = Math.floor(this.frame / 10) % 2;

    // Body
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(x, y - size/3, size/2, size/3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(x - size/3, y - size/2, size/4, size/4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#ffa000';
    ctx.beginPath();
    ctx.moveTo(x - size/2, y - size/2);
    ctx.lineTo(x - size/2 - p * 4, y - size/2 + p);
    ctx.lineTo(x - size/2, y - size/2 + p * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = c.wing;
    const wingY = y - size/2 - (wingUp ? p * 6 : p * 2);
    ctx.beginPath();
    ctx.ellipse(x + p * 2, wingY, size/3, size/5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Neon glow eye
    ctx.fillStyle = c.eye;
    ctx.shadowColor = c.eye;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(x - size/3, y - size/2, p * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Tail feathers
    ctx.fillStyle = c.accent;
    ctx.fillRect(x + size/3, y - size/4, p * 6, p * 3);
    ctx.fillRect(x + size/3 + p * 2, y - size/4 + p * 2, p * 6, p * 2);
  }

  drawSewerSlime(ctx, x, y, size, time, tp) {
    const c = this.data.colors;
    const p = CONFIG.PIXEL;
    const wobble = Math.sin(time * 0.12 + this.animPhase) * 3;

    // Glow
    ctx.shadowColor = c.glow;
    ctx.shadowBlur = 20;

    // Main blob
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(x + wobble, y - size/3, size/2 + wobble/2, size/3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = c.inner;
    ctx.beginPath();
    ctx.ellipse(x - size/5 + wobble, y - size/2, size/4, size/5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Eyes (floating)
    const eyeY = y - size/3 + Math.sin(time * 0.1) * 2;
    ctx.fillStyle = c.eyes;
    ctx.beginPath();
    ctx.arc(x - size/5, eyeY, p * 3, 0, Math.PI * 2);
    ctx.arc(x + size/6, eyeY - p, p * 3, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - size/5 + p, eyeY + p, p * 1.5, 0, Math.PI * 2);
    ctx.arc(x + size/6 + p, eyeY - p + p, p * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Drips
    ctx.fillStyle = c.body;
    ctx.fillRect(x - size/3, y, p * 2, p * 4 + wobble);
    ctx.fillRect(x + size/5, y - p, p * 2, p * 3 + wobble/2);
  }

  drawVentSpirit(ctx, x, y, size, time, tp) {
    const c = this.data.colors;
    const p = CONFIG.PIXEL;
    const float = Math.sin(time * 0.06) * 6;

    // Wispy layers
    for (let i = 4; i >= 0; i--) {
      ctx.globalAlpha = 0.2 + i * 0.15;
      ctx.fillStyle = i % 2 === 0 ? c.body : c.fade;
      const layerY = y - size/2 + float + i * 5;
      ctx.beginPath();
      ctx.ellipse(x, layerY, size/2 - i * 3, size/3 - i * 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Face
    ctx.fillStyle = c.eyes;
    ctx.fillRect(x - size/4, y - size/2 + float + p * 2, p * 3, p * 2);
    ctx.fillRect(x + size/8, y - size/2 + float + p * 2, p * 3, p * 2);

    // Mouth
    const mouthOpen = Math.floor(this.frame / 30) % 2;
    if (mouthOpen) {
      ctx.fillRect(x - p * 2, y - size/3 + float, p * 4, p * 3);
    }
  }

  drawRooftopKitsune(ctx, x, y, size, time, tp) {
    const c = this.data.colors;
    const p = CONFIG.PIXEL;
    const tailWag = Math.sin(time * 0.1) * 5;

    // Body
    ctx.fillStyle = c.body;
    ctx.fillRect(x - size/2, y - size * 0.6, size, size * 0.4);

    // Head
    ctx.fillRect(x - size/2 - p * 2, y - size, size * 0.6, size * 0.45);

    // Pointed ears
    ctx.beginPath();
    ctx.moveTo(x - size/2 - p, y - size);
    ctx.lineTo(x - size/2 - p * 3, y - size - p * 8);
    ctx.lineTo(x - size/2 + p * 3, y - size);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - size/6, y - size);
    ctx.lineTo(x - size/6 + p, y - size - p * 8);
    ctx.lineTo(x - size/6 + p * 5, y - size);
    ctx.fill();

    // Ear tips
    ctx.fillStyle = c.tips;
    ctx.fillRect(x - size/2 - p * 2, y - size - p * 6, p * 2, p * 3);
    ctx.fillRect(x - size/6 + p, y - size - p * 6, p * 2, p * 3);

    // Multiple tails (3 for kitsune)
    ctx.fillStyle = c.accent;
    for (let t = 0; t < 3; t++) {
      const tx = x + size/3 + t * p * 2;
      const ty = y - size * 0.4 + tailWag + t * 3;
      ctx.fillRect(tx, ty, p * 3, p * 12);
      ctx.fillStyle = c.tips;
      ctx.fillRect(tx, ty + p * 9, p * 3, p * 3);
      ctx.fillStyle = c.accent;
    }

    // Glowing eyes
    ctx.fillStyle = c.eyes;
    ctx.shadowColor = c.eyes;
    ctx.shadowBlur = 8;
    ctx.fillRect(x - size/2 + p * 2, y - size + p * 4, p * 3, p * 2);
    ctx.fillRect(x - size/4, y - size + p * 4, p * 3, p * 2);
    ctx.shadowBlur = 0;

    // Muzzle
    ctx.fillStyle = c.tips;
    ctx.fillRect(x - size/2 + p, y - size + p * 7, p * 6, p * 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(x - size/2 + p * 3, y - size + p * 7, p * 2, p);
  }

  drawAlleyYokai(ctx, x, y, size, time, tp) {
    const c = this.data.colors;
    const p = CONFIG.PIXEL;
    const sway = Math.sin(time * 0.05) * 4;

    // Ethereal body layers
    for (let i = 2; i >= 0; i--) {
      ctx.globalAlpha = 0.3 + i * 0.2;
      ctx.fillStyle = i === 0 ? c.body : c.aura;
      const offset = sway * (1 - i * 0.3);
      ctx.beginPath();
      ctx.ellipse(x + offset, y - size/2, size/2 - i * 5, size/2 - i * 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Mask face
    ctx.fillStyle = c.mask;
    ctx.fillRect(x - size/3, y - size/2 - p * 4, size * 0.6, size * 0.4);

    // Eyes (slanted)
    ctx.fillStyle = c.eyes;
    ctx.fillRect(x - size/4, y - size/2 - p, p * 4, p * 2);
    ctx.fillRect(x + size/10, y - size/2 - p, p * 4, p * 2);

    // Mouth
    ctx.fillRect(x - size/6, y - size/3, size * 0.3, p * 2);

    // Floating orbs
    ctx.fillStyle = c.aura;
    ctx.shadowColor = c.aura;
    ctx.shadowBlur = 10;
    for (let i = 0; i < 3; i++) {
      const angle = time * 0.03 + i * Math.PI * 2 / 3;
      const orbX = x + Math.cos(angle) * size * 0.7;
      const orbY = y - size/2 + Math.sin(angle) * size * 0.4;
      ctx.beginPath();
      ctx.arc(orbX, orbY, p * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  drawSkyDragon(ctx, x, y, size, time, tp) {
    const c = this.data.colors;
    const p = CONFIG.PIXEL;

    // Serpentine body segments
    ctx.shadowColor = c.body;
    ctx.shadowBlur = 8;

    const segments = 10;
    for (let i = segments - 1; i >= 0; i--) {
      const segX = x + i * p * 5;
      const segY = y - size/3 + Math.sin(time * 0.08 + i * 0.6) * p * 4;
      const segSize = size * 0.4 - i * 2;

      ctx.fillStyle = i % 2 === 0 ? c.body : c.scales;
      ctx.beginPath();
      ctx.ellipse(segX, segY, segSize/2, segSize/3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Belly
      ctx.fillStyle = c.belly;
      ctx.beginPath();
      ctx.ellipse(segX, segY + segSize/6, segSize/3, segSize/5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // Head
    ctx.fillStyle = c.body;
    ctx.fillRect(x - size/3, y - size/2, size * 0.4, size * 0.35);

    // Horns
    ctx.fillStyle = c.horns;
    ctx.fillRect(x - size/3, y - size/2 - p * 6, p * 3, p * 7);
    ctx.fillRect(x - size/8, y - size/2 - p * 6, p * 3, p * 7);

    // Whiskers
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - size/3, y - size/3);
    ctx.lineTo(x - size/2, y - size/3 + Math.sin(time * 0.1) * 3);
    ctx.stroke();

    // Glowing eyes
    ctx.fillStyle = c.eyes;
    ctx.shadowColor = c.eyes;
    ctx.shadowBlur = 10;
    ctx.fillRect(x - size/4, y - size/2 + p * 3, p * 4, p * 3);
    ctx.fillRect(x - size/8, y - size/2 + p * 3, p * 4, p * 3);
    ctx.shadowBlur = 0;
  }

  drawAncientGuardian(ctx, x, y, size, time, tp) {
    const c = this.data.colors;
    const p = CONFIG.PIXEL;
    const pulse = (Math.sin(time * 0.04) + 1) / 2;

    // Stone body
    ctx.fillStyle = c.stone;
    ctx.fillRect(x - size/2, y - size, size, size);

    // Cracks texture
    ctx.strokeStyle = c.cracks;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - size/4, y - size);
    ctx.lineTo(x - size/3, y - size/2);
    ctx.moveTo(x + size/5, y - size * 0.8);
    ctx.lineTo(x + size/4, y - size/3);
    ctx.stroke();

    // Glowing runes
    ctx.fillStyle = c.runes;
    ctx.shadowColor = c.runes;
    ctx.shadowBlur = 12 * pulse;

    // Eye runes
    ctx.fillRect(x - size/3, y - size + p * 4, p * 5, p * 5);
    ctx.fillRect(x + size/8, y - size + p * 4, p * 5, p * 5);

    // Chest rune (diamond)
    ctx.beginPath();
    ctx.moveTo(x, y - size/2 - p * 4);
    ctx.lineTo(x - p * 4, y - size/2);
    ctx.lineTo(x, y - size/2 + p * 4);
    ctx.lineTo(x + p * 4, y - size/2);
    ctx.closePath();
    ctx.fill();

    // Arm runes
    ctx.fillRect(x - size/2 + p, y - size/2, p * 3, p * 6);
    ctx.fillRect(x + size/2 - p * 4, y - size/2, p * 3, p * 6);

    ctx.shadowBlur = 0;

    // Crown/horns
    ctx.fillStyle = c.stone;
    ctx.fillRect(x - size/2 + p * 2, y - size - p * 5, p * 4, p * 6);
    ctx.fillRect(x + size/2 - p * 6, y - size - p * 5, p * 4, p * 6);
    ctx.fillRect(x - p * 2, y - size - p * 7, p * 4, p * 8);
  }
}

// ============================================================================
// WEATHER SYSTEM
// ============================================================================

class Weather {
  constructor(type) {
    this.type = type;
    this.particles = [];
    this.init();
  }

  init() {
    if (this.type === 'rain') {
      for (let i = 0; i < 150; i++) {
        this.particles.push({
          x: rnd(0, 800), y: rnd(-100, 700),
          speed: rnd(8, 15), length: rnd(15, 30)
        });
      }
    } else if (this.type === 'fireflies') {
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: rnd(100, 600), y: rnd(100, 600),
          vx: rnd(-0.3, 0.3), vy: rnd(-0.3, 0.3),
          phase: rnd(0, Math.PI * 2), size: rnd(3, 6)
        });
      }
    }
  }

  update() {
    if (this.type === 'rain') {
      this.particles.forEach(p => {
        p.y += p.speed;
        p.x -= p.speed * 0.4;
        if (p.y > 750) { p.y = -30; p.x = rnd(0, 900); }
      });
    } else if (this.type === 'fireflies') {
      this.particles.forEach(p => {
        p.x += p.vx + Math.sin(p.phase) * 0.5;
        p.y += p.vy + Math.cos(p.phase) * 0.5;
        p.phase += 0.03;
        if (p.x < 50 || p.x > 650) p.vx *= -1;
        if (p.y < 50 || p.y > 650) p.vy *= -1;
      });
    }
  }

  draw(ctx, time) {
    if (this.type === 'rain') {
      ctx.strokeStyle = 'rgba(180, 200, 255, 0.4)';
      ctx.lineWidth = 1.5;
      this.particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.length * 0.4, p.y + p.length);
        ctx.stroke();
      });
    } else if (this.type === 'fireflies') {
      this.particles.forEach(p => {
        const glow = (Math.sin(time * 0.08 + p.phase) + 1) / 2;
        ctx.fillStyle = `rgba(255, 255, 120, ${glow * 0.9})`;
        ctx.shadowColor = '#ffff80';
        ctx.shadowBlur = 15 * glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * glow, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    }
  }
}

// ============================================================================
// MAIN SKETCH
// ============================================================================

let canvas, ctx;
let buildings = [];
let creatures = [];
let weather = null;
let time = 0;
let isPaused = false;

function setup() {
  generateFeatures();

  canvas = document.getElementById('sketch-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'sketch-canvas';
    document.getElementById('sketch-holder').appendChild(canvas);
  }

  canvas.width = 700;
  canvas.height = 700;
  ctx = canvas.getContext('2d');

  initWorld();
  requestAnimationFrame(animate);
}

function initWorld() {
  R = initRandom(hash);
  buildings = [];
  creatures = [];

  const gridSize = CONFIG.GRID_SIZE;

  // Place buildings - ensuring no overlap
  const occupied = new Set();
  const numBuildings = rndInt(5, 7);

  for (let i = 0; i < numBuildings; i++) {
    let gx, gy, attempts = 0;
    do {
      gx = rndInt(0, gridSize - 1);
      gy = rndInt(0, gridSize - 1);
      attempts++;
    } while (occupied.has(`${gx},${gy}`) && attempts < 20);

    occupied.add(`${gx},${gy}`);
    buildings.push(new Building(gx, gy));
  }

  // Create creatures
  const creatureTypes = Object.keys(CREATURE_TYPES);

  // Guaranteed legendary/rare
  if (features.hasLegendary) {
    const legendaryTypes = creatureTypes.filter(t => CREATURE_TYPES[t].rarity === 'legendary');
    const type = rndChoice(legendaryTypes);
    const zOffset = CREATURE_TYPES[type].habitat === 'sky' ? 120 : 0;
    creatures.push(new Creature(type, rnd(0.5, gridSize - 0.5), rnd(0.5, gridSize - 0.5), zOffset));
  }

  if (features.hasRare) {
    const rareTypes = creatureTypes.filter(t => CREATURE_TYPES[t].rarity === 'rare');
    const type = rndChoice(rareTypes);
    const zOffset = CREATURE_TYPES[type].habitat === 'roof' ? 80 : 0;
    creatures.push(new Creature(type, rnd(0.5, gridSize - 0.5), rnd(0.5, gridSize - 0.5), zOffset));
  }

  // Common/uncommon creatures
  const commonTypes = creatureTypes.filter(t =>
    CREATURE_TYPES[t].rarity === 'common' || CREATURE_TYPES[t].rarity === 'uncommon'
  );

  for (let i = creatures.length; i < features.creatureCount; i++) {
    const type = rndChoice(commonTypes);
    const data = CREATURE_TYPES[type];
    let zOffset = 0;
    if (data.habitat === 'roof') zOffset = rndInt(60, 100);
    else if (data.habitat === 'sky') zOffset = rndInt(100, 140);
    else if (data.habitat === 'building') zOffset = rndInt(30, 60);

    creatures.push(new Creature(type, rnd(0.5, gridSize - 0.5), rnd(0.5, gridSize - 0.5), zOffset));
  }

  // Weather
  if (features.weather !== 'none') {
    weather = new Weather(features.weather);
  }

  updateFeatureDisplay();
}

function animate() {
  if (!isPaused) {
    time++;
    update();
    draw();
  }
  requestAnimationFrame(animate);
}

function update() {
  creatures.forEach(c => c.update(time, CONFIG.GRID_SIZE));
  if (weather) weather.update();
}

function draw() {
  const tp = TIME_PALETTES[features.timeOfDay];

  // Sky
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  tp.sky.forEach((c, i) => gradient.addColorStop(i / (tp.sky.length - 1), c));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars at night
  if (features.timeOfDay === 'night') drawStars();

  // Calculate offset to center the city
  const offsetX = canvas.width / 2;
  const offsetY = canvas.height * 0.35;

  // Draw ground
  drawGround(ctx, offsetX, offsetY, tp);

  // Collect all drawable objects with their depth
  const drawList = [];

  buildings.forEach(b => {
    drawList.push({
      type: 'building',
      obj: b,
      depth: getDepth(b.gridX, b.gridY, 0)
    });
  });

  creatures.forEach(c => {
    if (c.isVisible()) {
      drawList.push({
        type: 'creature',
        obj: c,
        depth: getDepth(c.gridX, c.gridY, c.zOffset)
      });
    }
  });

  // Sort by depth (back to front)
  drawList.sort((a, b) => a.depth - b.depth);

  // Draw everything in order
  drawList.forEach(item => {
    if (item.type === 'building') {
      item.obj.draw(ctx, offsetX, offsetY, time, tp);
    } else {
      item.obj.draw(ctx, offsetX, offsetY, time, tp);
    }
  });

  // Weather on top
  if (weather) weather.draw(ctx, time);
}

function drawGround(ctx, offsetX, offsetY, tp) {
  const gridSize = CONFIG.GRID_SIZE + 1;

  for (let gx = -1; gx <= gridSize; gx++) {
    for (let gy = -1; gy <= gridSize; gy++) {
      const pos = toIso(gx, gy, 0);
      const x = pos.x + offsetX;
      const y = pos.y + offsetY;

      const isLight = (gx + gy) % 2 === 0;
      ctx.fillStyle = isLight ? tp.groundLight : tp.ground;

      ctx.beginPath();
      ctx.moveTo(x, y - CONFIG.TILE_HEIGHT/2);
      ctx.lineTo(x + CONFIG.TILE_WIDTH/2, y);
      ctx.lineTo(x, y + CONFIG.TILE_HEIGHT/2);
      ctx.lineTo(x - CONFIG.TILE_WIDTH/2, y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

function drawStars() {
  const starRng = initRandom(hash + 'stars');
  for (let i = 0; i < 60; i++) {
    const x = starRng() * canvas.width;
    const y = starRng() * canvas.height * 0.5;
    const twinkle = Math.sin(time * 0.04 + i * 0.5) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
    ctx.fillRect(x, y, 2, 2);
  }
}

// ============================================================================
// CONTROLS
// ============================================================================

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  generateFeatures();
  initWorld();
  updateHashDisplay();
}

function saveImage() {
  const link = document.createElement('a');
  link.download = `pocket-city-${hash.slice(2, 10)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function togglePause() { isPaused = !isPaused; }

function cycleTime() {
  const times = ['dawn', 'day', 'dusk', 'night'];
  const idx = times.indexOf(features.timeOfDay);
  features.timeOfDay = times[(idx + 1) % 4];
  updateFeatureDisplay();
}

function updateFeatureDisplay() {
  const el = document.getElementById('features-list');
  if (!el) return;

  const visible = creatures.filter(c => c.isVisible());
  const names = visible.map(c => {
    const d = c.data;
    return `<span class="rarity-${d.rarity}">${d.name}</span>`;
  }).join(', ');

  el.innerHTML = `
    <tr><td>Time</td><td>${features.timeOfDay}</td><td>-</td></tr>
    <tr><td>Palette</td><td>${features.palette.name}</td><td>-</td></tr>
    <tr><td>Weather</td><td>${features.weather}</td><td class="rarity-${features.weather !== 'none' ? 'uncommon' : 'common'}">${features.weather !== 'none' ? 'Special' : '-'}</td></tr>
    <tr><td>Creatures</td><td colspan="2">${names || 'None visible now'}</td></tr>
    <tr><td>Legendary</td><td>${features.hasLegendary ? 'Yes' : 'No'}</td><td class="rarity-${features.hasLegendary ? 'legendary' : 'common'}">${features.hasLegendary ? 'Legendary!' : '-'}</td></tr>
    <tr><td>Rare</td><td>${features.hasRare ? 'Yes' : 'No'}</td><td class="rarity-${features.hasRare ? 'rare' : 'common'}">${features.hasRare ? 'Rare' : '-'}</td></tr>
  `;
}

function updateHashDisplay() {
  const el = document.getElementById('hash-display');
  if (el) el.textContent = hash;
}

document.addEventListener('keydown', e => {
  switch (e.key.toLowerCase()) {
    case 'r': regenerate(); break;
    case 's': saveImage(); break;
    case ' ': e.preventDefault(); togglePause(); break;
    case 't': cycleTime(); break;
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setup);
} else {
  setup();
}

window.pocketCity = { regenerate, saveImage, togglePause, cycleTime, getFeatures: () => features };
