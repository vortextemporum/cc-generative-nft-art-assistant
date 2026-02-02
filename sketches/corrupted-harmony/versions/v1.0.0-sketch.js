/**
 * CORRUPTED HARMONY
 * An isometric dreamscape where buildings from different realities coexist
 * Each structure processed through different visual filters - dithered, liquified,
 * stenciled, glitched - yet forming a harmonious whole
 *
 * v1.0.0
 */

// =============================================================================
// HASH-BASED RANDOMNESS (Art Blocks / fxhash compatible)
// =============================================================================

let hash = "0x" + Array(64).fill(0).map(() =>
  "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

// Art Blocks
if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}
// fxhash
if (typeof fxhash !== "undefined") {
  hash = fxhash;
}

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
  const a = parseInt(h.substr(0, 8), 16);
  const b = parseInt(h.substr(8, 8), 16);
  const c = parseInt(h.substr(16, 8), 16);
  const d = parseInt(h.substr(24, 8), 16);
  return sfc32(a, b, c, d);
}

let R;
function rnd(min = 0, max = 1) {
  if (max === undefined) { max = min; min = 0; }
  return min + R() * (max - min);
}
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rndChoice(arr) { return arr[Math.floor(R() * arr.length)]; }
function rndBool(p = 0.5) { return R() < p; }
function rndGaussian() {
  let u = 0, v = 0;
  while (u === 0) u = R();
  while (v === 0) v = R();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function rollRarity() {
  const r = R();
  if (r < 0.05) return 'legendary';
  if (r < 0.15) return 'rare';
  if (r < 0.40) return 'uncommon';
  return 'common';
}

// =============================================================================
// FEATURES & CONFIGURATION
// =============================================================================

let features = {};
let originalFeatures = {};
let hasOverrides = false;

const EFFECT_TYPES = ['dither', 'liquify', 'stencil', 'glitch', 'corrupt', 'clean'];
const DITHER_MODES = ['floyd-steinberg', 'bayer', 'stipple', 'halftone'];
const ARCH_STYLES = ['brutalist', 'deco', 'modernist', 'gothic', 'retro-futurist', 'geometric', 'organic'];
const WEIRD_TYPES = ['melt', 'float', 'invert', 'window-swap', 'shadow-mismatch', 'scale-shift', 'time-echo', 'none'];

const PALETTES = {
  muted: ['#2d2d2d', '#4a4a4a', '#6b6b6b', '#8c8c8c', '#adadad', '#d4d4d4'],
  sepia: ['#2c2416', '#4a3c28', '#6b5a42', '#8c7a5c', '#ad9a7c', '#d4c4a4'],
  cool: ['#1a2a3a', '#2a3a4a', '#3a4a5a', '#5a6a7a', '#7a8a9a', '#9aabba'],
  warm: ['#3a2a1a', '#4a3a2a', '#5a4a3a', '#7a5a4a', '#9a7a6a', '#baa090'],
  twilight: ['#1a1a2e', '#2a2a4e', '#3a3a6e', '#5a5a8e', '#8a8aae', '#babace'],
  fog: ['#e8e8e8', '#d0d0d0', '#b8b8b8', '#a0a0a0', '#888888', '#707070'],
  inverted: ['#f0f0f0', '#d0d0d0', '#909090', '#505050', '#303030', '#101010'],
  neonBleed: ['#0a0a0a', '#1a0a2a', '#2a1a3a', '#ff2a6d', '#05d9e8', '#d1f7ff']
};

function generateFeatures() {
  R = initRandom(hash);

  // Core generation parameters
  const buildingCount = rndInt(15, 25);
  const rarity = rollRarity();

  // Palette selection based on rarity
  let paletteKey;
  if (rarity === 'legendary') {
    paletteKey = rndChoice(['inverted', 'neonBleed']);
  } else if (rarity === 'rare') {
    paletteKey = rndChoice(['twilight', 'warm', 'cool']);
  } else if (rarity === 'uncommon') {
    paletteKey = rndChoice(['sepia', 'cool', 'fog']);
  } else {
    paletteKey = rndChoice(['muted', 'fog', 'sepia']);
  }

  // Weirdness level
  let weirdnessLevel;
  if (rarity === 'legendary') weirdnessLevel = 'reality-collapse';
  else if (rarity === 'rare') weirdnessLevel = 'chaotic';
  else if (rarity === 'uncommon') weirdnessLevel = 'moderate';
  else weirdnessLevel = 'subtle';

  // Dominant effect
  let dominantEffect;
  if (rarity === 'legendary') dominantEffect = 'all-blend';
  else if (rarity === 'rare') dominantEffect = rndChoice(['corrupt', 'liquify']);
  else if (rarity === 'uncommon') dominantEffect = rndChoice(['glitch', 'liquify']);
  else dominantEffect = rndChoice(['dither', 'stencil', 'clean']);

  // Special feature
  let special = 'none';
  if (rarity === 'legendary') special = 'the-anomaly';
  else if (rarity === 'rare') special = rndChoice(['inverted-building', 'portal']);
  else if (rarity === 'uncommon') special = rndChoice(['floating-chunk', 'time-echo']);

  // Sky mood
  const skyMood = rndChoice(['gradient', 'flat', 'textured', 'void']);

  // Ground style
  const groundStyle = rndChoice(['solid', 'reflection', 'fade', 'none']);

  features = {
    buildingCount,
    rarity,
    palette: paletteKey,
    weirdnessLevel,
    dominantEffect,
    special,
    skyMood,
    groundStyle,
    seed: hash.slice(0, 10)
  };

  originalFeatures = { ...features };
  return features;
}

// =============================================================================
// ISOMETRIC HELPERS
// =============================================================================

const ISO_ANGLE = Math.PI / 6; // 30 degrees
const COS_ISO = Math.cos(ISO_ANGLE);
const SIN_ISO = Math.sin(ISO_ANGLE);

function isoProject(x, y, z) {
  return {
    x: (x - y) * COS_ISO,
    y: (x + y) * SIN_ISO - z
  };
}

function drawIsoBox(pg, x, y, z, w, d, h, colTop, colLeft, colRight) {
  const p1 = isoProject(x, y, z + h);
  const p2 = isoProject(x + w, y, z + h);
  const p3 = isoProject(x + w, y + d, z + h);
  const p4 = isoProject(x, y + d, z + h);
  const p5 = isoProject(x, y + d, z);
  const p6 = isoProject(x + w, y + d, z);
  const p7 = isoProject(x + w, y, z);

  // Top face
  pg.fill(colTop);
  pg.beginShape();
  pg.vertex(p1.x, p1.y);
  pg.vertex(p2.x, p2.y);
  pg.vertex(p3.x, p3.y);
  pg.vertex(p4.x, p4.y);
  pg.endShape(CLOSE);

  // Left face
  pg.fill(colLeft);
  pg.beginShape();
  pg.vertex(p1.x, p1.y);
  pg.vertex(p4.x, p4.y);
  pg.vertex(p5.x, p5.y);
  pg.vertex(isoProject(x, y, z).x, isoProject(x, y, z).y);
  pg.endShape(CLOSE);

  // Right face
  pg.fill(colRight);
  pg.beginShape();
  pg.vertex(p2.x, p2.y);
  pg.vertex(p7.x, p7.y);
  pg.vertex(p6.x, p6.y);
  pg.vertex(p3.x, p3.y);
  pg.endShape(CLOSE);
}

// =============================================================================
// BUILDING GENERATORS
// =============================================================================

class Building {
  constructor(gridX, gridY, style, effect) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.style = style;
    this.effect = effect;
    this.weirdness = [];

    // Base dimensions vary by style
    this.generateDimensions();
    this.generateDetails();
    this.generateWeirdness();

    // Create off-screen buffer for this building
    this.buffer = null;
  }

  generateDimensions() {
    const baseUnit = 15;

    switch(this.style) {
      case 'brutalist':
        this.width = rndInt(3, 5) * baseUnit;
        this.depth = rndInt(3, 5) * baseUnit;
        this.height = rndInt(4, 8) * baseUnit;
        break;
      case 'deco':
        this.width = rndInt(2, 4) * baseUnit;
        this.depth = rndInt(2, 4) * baseUnit;
        this.height = rndInt(6, 12) * baseUnit;
        this.hasSpire = rndBool(0.7);
        break;
      case 'modernist':
        this.width = rndInt(2, 5) * baseUnit;
        this.depth = rndInt(2, 3) * baseUnit;
        this.height = rndInt(5, 15) * baseUnit;
        break;
      case 'gothic':
        this.width = rndInt(3, 5) * baseUnit;
        this.depth = rndInt(4, 6) * baseUnit;
        this.height = rndInt(5, 10) * baseUnit;
        this.hasPinnacles = rndBool(0.8);
        break;
      case 'retro-futurist':
        this.width = rndInt(3, 5) * baseUnit;
        this.depth = rndInt(3, 5) * baseUnit;
        this.height = rndInt(4, 9) * baseUnit;
        this.hasDome = rndBool(0.6);
        break;
      case 'geometric':
        this.width = rndInt(2, 4) * baseUnit;
        this.depth = rndInt(2, 4) * baseUnit;
        this.height = rndInt(3, 8) * baseUnit;
        this.shape = rndChoice(['cube', 'pyramid', 'cylinder', 'prism']);
        break;
      case 'organic':
        this.width = rndInt(2, 5) * baseUnit;
        this.depth = rndInt(2, 5) * baseUnit;
        this.height = rndInt(4, 10) * baseUnit;
        this.bulges = rndInt(2, 5);
        break;
      default:
        this.width = rndInt(2, 4) * baseUnit;
        this.depth = rndInt(2, 4) * baseUnit;
        this.height = rndInt(4, 8) * baseUnit;
    }
  }

  generateDetails() {
    this.windowRows = Math.floor(this.height / 20);
    this.windowCols = Math.floor(this.width / 15);
    this.windowPattern = rndChoice(['grid', 'random', 'vertical-stripe', 'horizontal-stripe', 'checker']);
    this.hasAntenna = rndBool(0.2);
    this.ledgeCount = rndInt(0, 3);
  }

  generateWeirdness() {
    const level = features.weirdnessLevel;
    const weirdChance = level === 'reality-collapse' ? 0.8 :
                        level === 'chaotic' ? 0.5 :
                        level === 'moderate' ? 0.3 : 0.1;

    if (rndBool(weirdChance)) {
      this.weirdness.push({
        type: 'melt',
        intensity: rnd(0.2, 0.8),
        direction: rndChoice(['down', 'left', 'right'])
      });
    }

    if (rndBool(weirdChance * 0.7)) {
      this.weirdness.push({
        type: 'float',
        offset: rnd(10, 50),
        chunks: rndInt(1, 3)
      });
    }

    if (rndBool(weirdChance * 0.5)) {
      this.weirdness.push({
        type: 'scale-shift',
        factor: rnd(0.5, 1.5),
        section: rndChoice(['top', 'middle', 'bottom'])
      });
    }

    if (rndBool(weirdChance * 0.4)) {
      this.weirdness.push({
        type: 'time-echo',
        opacity: rnd(0.2, 0.5),
        offset: { x: rnd(-20, 20), y: rnd(-30, 10) }
      });
    }

    if (level === 'reality-collapse' && rndBool(0.3)) {
      this.weirdness.push({
        type: 'invert',
        full: rndBool(0.5)
      });
    }
  }

  getBasePosition(canvasWidth, canvasHeight) {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight * 0.6;
    const gridSpacing = 80;

    const iso = isoProject(
      this.gridX * gridSpacing,
      this.gridY * gridSpacing,
      0
    );

    return {
      x: centerX + iso.x,
      y: centerY + iso.y
    };
  }

  getSortDepth() {
    return this.gridX + this.gridY;
  }
}

// =============================================================================
// EFFECT PROCESSORS
// =============================================================================

function applyDitherEffect(pg, mode) {
  pg.loadPixels();
  const d = pg.pixelDensity();
  const w = pg.width * d;
  const h = pg.height * d;

  if (mode === 'bayer') {
    // Bayer matrix 4x4
    const bayer = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const gray = (pg.pixels[i] + pg.pixels[i+1] + pg.pixels[i+2]) / 3;
        const threshold = (bayer[y % 4][x % 4] / 16) * 255;
        const val = gray > threshold ? 255 : 0;
        pg.pixels[i] = pg.pixels[i+1] = pg.pixels[i+2] = val;
      }
    }
  } else if (mode === 'floyd-steinberg') {
    // Floyd-Steinberg error diffusion
    const errors = new Float32Array(w * h);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
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
  } else if (mode === 'stipple') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const gray = (pg.pixels[i] + pg.pixels[i+1] + pg.pixels[i+2]) / 3;
        const threshold = R() * 255;
        const val = gray > threshold ? 255 : 0;
        pg.pixels[i] = pg.pixels[i+1] = pg.pixels[i+2] = val;
      }
    }
  } else { // halftone
    const dotSize = 4;
    for (let y = 0; y < h; y += dotSize) {
      for (let x = 0; x < w; x += dotSize) {
        let sum = 0;
        let count = 0;
        for (let dy = 0; dy < dotSize && y + dy < h; dy++) {
          for (let dx = 0; dx < dotSize && x + dx < w; dx++) {
            const i = ((y + dy) * w + (x + dx)) * 4;
            sum += (pg.pixels[i] + pg.pixels[i+1] + pg.pixels[i+2]) / 3;
            count++;
          }
        }
        const avg = sum / count;
        const val = avg > 127 ? 255 : 0;
        for (let dy = 0; dy < dotSize && y + dy < h; dy++) {
          for (let dx = 0; dx < dotSize && x + dx < w; dx++) {
            const i = ((y + dy) * w + (x + dx)) * 4;
            pg.pixels[i] = pg.pixels[i+1] = pg.pixels[i+2] = val;
          }
        }
      }
    }
  }

  pg.updatePixels();
}

function applyLiquifyEffect(pg, intensity) {
  pg.loadPixels();
  const d = pg.pixelDensity();
  const w = pg.width * d;
  const h = pg.height * d;
  const original = new Uint8ClampedArray(pg.pixels);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Displacement based on position and noise
      const noiseVal = noise(x * 0.02, y * 0.02) * 2 - 1;
      const displaceX = Math.floor(noiseVal * intensity * 30);
      const displaceY = Math.floor(Math.sin(y * 0.05) * intensity * 20 + noiseVal * intensity * 10);

      let srcX = x + displaceX;
      let srcY = y + displaceY;

      // Add dripping effect at bottom
      if (y > h * 0.7) {
        const drip = Math.sin(x * 0.1) * (y - h * 0.7) * intensity * 0.5;
        srcY -= drip;
      }

      srcX = constrain(srcX, 0, w - 1);
      srcY = constrain(srcY, 0, h - 1);

      const srcI = (Math.floor(srcY) * w + Math.floor(srcX)) * 4;
      const dstI = (y * w + x) * 4;

      pg.pixels[dstI] = original[srcI];
      pg.pixels[dstI + 1] = original[srcI + 1];
      pg.pixels[dstI + 2] = original[srcI + 2];
      pg.pixels[dstI + 3] = original[srcI + 3];
    }
  }

  pg.updatePixels();
}

function applyStencilEffect(pg, levels = 4) {
  pg.loadPixels();
  const d = pg.pixelDensity();
  const w = pg.width * d;
  const h = pg.height * d;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;

      // Posterize each channel
      for (let c = 0; c < 3; c++) {
        const val = pg.pixels[i + c];
        const step = 255 / (levels - 1);
        pg.pixels[i + c] = Math.round(val / step) * step;
      }
    }
  }

  pg.updatePixels();
}

function applyGlitchEffect(pg, intensity) {
  pg.loadPixels();
  const d = pg.pixelDensity();
  const w = pg.width * d;
  const h = pg.height * d;
  const original = new Uint8ClampedArray(pg.pixels);

  // RGB shift
  const shiftR = Math.floor(intensity * 10);
  const shiftB = -Math.floor(intensity * 8);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;

      // Shift red channel
      const srcXR = constrain(x + shiftR, 0, w - 1);
      const srcIR = (y * w + srcXR) * 4;
      pg.pixels[i] = original[srcIR];

      // Green stays
      pg.pixels[i + 1] = original[i + 1];

      // Shift blue channel
      const srcXB = constrain(x + shiftB, 0, w - 1);
      const srcIB = (y * w + srcXB) * 4;
      pg.pixels[i + 2] = original[srcIB + 2];
    }
  }

  // Scanlines
  for (let y = 0; y < h; y += 3) {
    if (R() < intensity * 0.3) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        pg.pixels[i] = pg.pixels[i] * 0.7;
        pg.pixels[i + 1] = pg.pixels[i + 1] * 0.7;
        pg.pixels[i + 2] = pg.pixels[i + 2] * 0.7;
      }
    }
  }

  // Random horizontal displacement lines
  for (let i = 0; i < intensity * 10; i++) {
    const y = Math.floor(R() * h);
    const shift = Math.floor((R() - 0.5) * intensity * 40);
    const lineHeight = Math.floor(R() * 5) + 1;

    for (let dy = 0; dy < lineHeight && y + dy < h; dy++) {
      for (let x = 0; x < w; x++) {
        const srcX = constrain(x + shift, 0, w - 1);
        const srcI = ((y + dy) * w + srcX) * 4;
        const dstI = ((y + dy) * w + x) * 4;

        pg.pixels[dstI] = original[srcI];
        pg.pixels[dstI + 1] = original[srcI + 1];
        pg.pixels[dstI + 2] = original[srcI + 2];
      }
    }
  }

  pg.updatePixels();
}

function applyCorruptEffect(pg, intensity) {
  pg.loadPixels();
  const d = pg.pixelDensity();
  const w = pg.width * d;
  const h = pg.height * d;

  // Block corruption
  const blockSize = 8;
  for (let by = 0; by < h; by += blockSize) {
    for (let bx = 0; bx < w; bx += blockSize) {
      if (R() < intensity * 0.3) {
        // Corrupt this block
        const mode = Math.floor(R() * 4);

        for (let y = by; y < by + blockSize && y < h; y++) {
          for (let x = bx; x < bx + blockSize && x < w; x++) {
            const i = (y * w + x) * 4;

            if (mode === 0) {
              // Color shift
              pg.pixels[i] = (pg.pixels[i] + 128) % 256;
            } else if (mode === 1) {
              // Invert
              pg.pixels[i] = 255 - pg.pixels[i];
              pg.pixels[i + 1] = 255 - pg.pixels[i + 1];
              pg.pixels[i + 2] = 255 - pg.pixels[i + 2];
            } else if (mode === 2) {
              // Solid color
              pg.pixels[i] = pg.pixels[i + 1] = pg.pixels[i + 2] = R() > 0.5 ? 255 : 0;
            } else {
              // Channel swap
              const temp = pg.pixels[i];
              pg.pixels[i] = pg.pixels[i + 2];
              pg.pixels[i + 2] = temp;
            }
          }
        }
      }
    }
  }

  // Data moshing streaks
  for (let i = 0; i < intensity * 5; i++) {
    const startY = Math.floor(R() * h);
    const length = Math.floor(R() * h * 0.3);
    const x = Math.floor(R() * w);

    let lastColor = [0, 0, 0];
    for (let y = startY; y < startY + length && y < h; y++) {
      const idx = (y * w + x) * 4;
      if (R() < 0.1) {
        lastColor = [pg.pixels[idx], pg.pixels[idx + 1], pg.pixels[idx + 2]];
      }
      pg.pixels[idx] = lastColor[0];
      pg.pixels[idx + 1] = lastColor[1];
      pg.pixels[idx + 2] = lastColor[2];
    }
  }

  pg.updatePixels();
}

// =============================================================================
// DRAWING FUNCTIONS
// =============================================================================

function drawBuildingToBuffer(building, palette) {
  const padding = 50;
  const bufferW = building.width + padding * 2 + 100;
  const bufferH = building.height + padding * 2 + 100;

  const pg = createGraphics(bufferW, bufferH);
  pg.pixelDensity(1);
  pg.clear();
  pg.translate(bufferW / 2, bufferH - padding);
  pg.noStroke();

  const colors = PALETTES[palette];
  const colTop = color(colors[4]);
  const colLeft = color(colors[2]);
  const colRight = color(colors[3]);

  // Draw base building
  drawBuildingShape(pg, building, colTop, colLeft, colRight, colors);

  return pg;
}

function drawBuildingShape(pg, b, colTop, colLeft, colRight, palette) {
  const hw = b.width / 2;
  const hd = b.depth / 2;

  switch(b.style) {
    case 'brutalist':
      drawBrutalist(pg, b, colTop, colLeft, colRight, palette);
      break;
    case 'deco':
      drawDeco(pg, b, colTop, colLeft, colRight, palette);
      break;
    case 'modernist':
      drawModernist(pg, b, colTop, colLeft, colRight, palette);
      break;
    case 'gothic':
      drawGothic(pg, b, colTop, colLeft, colRight, palette);
      break;
    case 'retro-futurist':
      drawRetroFuturist(pg, b, colTop, colLeft, colRight, palette);
      break;
    case 'geometric':
      drawGeometric(pg, b, colTop, colLeft, colRight, palette);
      break;
    case 'organic':
      drawOrganic(pg, b, colTop, colLeft, colRight, palette);
      break;
    default:
      drawIsoBox(pg, -hw, -hd, 0, b.width, b.depth, b.height, colTop, colLeft, colRight);
  }

  // Draw windows
  drawWindows(pg, b, palette);
}

function drawBrutalist(pg, b, colTop, colLeft, colRight, palette) {
  const hw = b.width / 2;
  const hd = b.depth / 2;

  // Main block
  drawIsoBox(pg, -hw, -hd, 0, b.width, b.depth, b.height, colTop, colLeft, colRight);

  // Ledges
  for (let i = 0; i < b.ledgeCount; i++) {
    const ledgeH = (i + 1) * (b.height / (b.ledgeCount + 1));
    const ledgeDepth = 5;
    const darker = color(palette[1]);
    drawIsoBox(pg, -hw - ledgeDepth, -hd - ledgeDepth, ledgeH - 3,
               b.width + ledgeDepth * 2, b.depth + ledgeDepth * 2, 3,
               colTop, darker, darker);
  }
}

function drawDeco(pg, b, colTop, colLeft, colRight, palette) {
  const hw = b.width / 2;
  const hd = b.depth / 2;

  // Main tower with setbacks
  const setbacks = 3;
  let currentH = 0;
  let currentW = b.width;
  let currentD = b.depth;

  for (let i = 0; i < setbacks; i++) {
    const sectionH = b.height / setbacks;
    const offsetW = (b.width - currentW) / 2;
    const offsetD = (b.depth - currentD) / 2;

    drawIsoBox(pg, -hw + offsetW, -hd + offsetD, currentH,
               currentW, currentD, sectionH, colTop, colLeft, colRight);

    currentH += sectionH;
    currentW *= 0.8;
    currentD *= 0.8;
  }

  // Spire
  if (b.hasSpire) {
    const spireH = b.height * 0.3;
    const spireW = b.width * 0.15;
    const accent = color(palette[5]);
    drawIsoBox(pg, -spireW/2, -spireW/2, b.height, spireW, spireW, spireH, accent, colLeft, colRight);
  }
}

function drawModernist(pg, b, colTop, colLeft, colRight, palette) {
  const hw = b.width / 2;
  const hd = b.depth / 2;

  // Glass tower - lighter colors
  const glassTop = color(palette[5]);
  const glassLeft = color(palette[4]);
  const glassRight = color(palette[4]);

  drawIsoBox(pg, -hw, -hd, 0, b.width, b.depth, b.height, glassTop, glassLeft, glassRight);

  // Frame lines
  pg.stroke(palette[1]);
  pg.strokeWeight(1);

  // Vertical frame lines
  for (let i = 0; i <= 4; i++) {
    const xOff = (i / 4) * b.width - hw;
    const p1 = isoProject(xOff, -hd, 0);
    const p2 = isoProject(xOff, -hd, b.height);
    pg.line(p1.x, p1.y, p2.x, p2.y);
  }

  pg.noStroke();
}

function drawGothic(pg, b, colTop, colLeft, colRight, palette) {
  const hw = b.width / 2;
  const hd = b.depth / 2;

  // Main body
  drawIsoBox(pg, -hw, -hd, 0, b.width, b.depth, b.height * 0.7, colTop, colLeft, colRight);

  // Pointed roof
  const roofH = b.height * 0.3;
  const p1 = isoProject(0, 0, b.height);
  const p2 = isoProject(-hw, -hd, b.height * 0.7);
  const p3 = isoProject(hw, -hd, b.height * 0.7);
  const p4 = isoProject(hw, hd, b.height * 0.7);
  const p5 = isoProject(-hw, hd, b.height * 0.7);

  pg.fill(colLeft);
  pg.beginShape();
  pg.vertex(p1.x, p1.y);
  pg.vertex(p2.x, p2.y);
  pg.vertex(p3.x, p3.y);
  pg.endShape(CLOSE);

  pg.fill(colRight);
  pg.beginShape();
  pg.vertex(p1.x, p1.y);
  pg.vertex(p3.x, p3.y);
  pg.vertex(p4.x, p4.y);
  pg.endShape(CLOSE);

  // Pinnacles
  if (b.hasPinnacles) {
    const pinH = 15;
    const pinW = 5;
    const accent = color(palette[0]);

    drawIsoBox(pg, -hw + 2, -hd + 2, b.height * 0.7, pinW, pinW, pinH, accent, colLeft, colRight);
    drawIsoBox(pg, hw - pinW - 2, -hd + 2, b.height * 0.7, pinW, pinW, pinH, accent, colLeft, colRight);
  }
}

function drawRetroFuturist(pg, b, colTop, colLeft, colRight, palette) {
  const hw = b.width / 2;
  const hd = b.depth / 2;

  // Rounded main body (approximated with stacked sections)
  const sections = 5;
  for (let i = 0; i < sections; i++) {
    const t = i / (sections - 1);
    const bulge = Math.sin(t * Math.PI) * 0.2 + 1;
    const sectionW = b.width * bulge;
    const sectionD = b.depth * bulge;
    const sectionH = b.height / sections;

    drawIsoBox(pg, -sectionW/2, -sectionD/2, i * sectionH,
               sectionW, sectionD, sectionH, colTop, colLeft, colRight);
  }

  // Dome
  if (b.hasDome) {
    const domeR = b.width * 0.4;
    const domeH = domeR * 0.6;
    const accent = color(palette[5]);

    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const r = domeR * Math.cos(t * Math.PI / 2);
      const h = domeH * Math.sin(t * Math.PI / 2);
      drawIsoBox(pg, -r/2, -r/2, b.height + h - 2, r, r, 4, accent, colLeft, colRight);
    }
  }
}

function drawGeometric(pg, b, colTop, colLeft, colRight, palette) {
  const hw = b.width / 2;
  const hd = b.depth / 2;

  if (b.shape === 'pyramid') {
    // Pyramid
    const apex = isoProject(0, 0, b.height);
    const base1 = isoProject(-hw, -hd, 0);
    const base2 = isoProject(hw, -hd, 0);
    const base3 = isoProject(hw, hd, 0);
    const base4 = isoProject(-hw, hd, 0);

    pg.fill(colLeft);
    pg.beginShape();
    pg.vertex(apex.x, apex.y);
    pg.vertex(base1.x, base1.y);
    pg.vertex(base2.x, base2.y);
    pg.endShape(CLOSE);

    pg.fill(colRight);
    pg.beginShape();
    pg.vertex(apex.x, apex.y);
    pg.vertex(base2.x, base2.y);
    pg.vertex(base3.x, base3.y);
    pg.endShape(CLOSE);
  } else {
    // Default cube
    drawIsoBox(pg, -hw, -hd, 0, b.width, b.depth, b.height, colTop, colLeft, colRight);
  }
}

function drawOrganic(pg, b, colTop, colLeft, colRight, palette) {
  const hw = b.width / 2;
  const hd = b.depth / 2;

  // Organic bulging tower
  const segments = 8;
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const bulgePhase = t * Math.PI * b.bulges;
    const bulge = 1 + Math.sin(bulgePhase) * 0.3;
    const segW = b.width * bulge;
    const segD = b.depth * bulge;
    const segH = b.height / segments;

    const col = lerpColor(colLeft, colTop, t);
    drawIsoBox(pg, -segW/2, -segD/2, i * segH, segW, segD, segH + 1, colTop, col, colRight);
  }
}

function drawWindows(pg, b, palette) {
  if (b.style === 'geometric' && b.shape === 'pyramid') return;

  const windowColor = color(palette[0]);
  const litColor = color(palette[5]);

  const winW = 4;
  const winH = 6;
  const spacingX = b.width / (b.windowCols + 1);
  const spacingY = b.height / (b.windowRows + 1);

  for (let row = 1; row <= b.windowRows; row++) {
    for (let col = 1; col <= b.windowCols; col++) {
      let drawWindow = true;

      if (b.windowPattern === 'random') drawWindow = R() > 0.3;
      else if (b.windowPattern === 'checker') drawWindow = (row + col) % 2 === 0;
      else if (b.windowPattern === 'vertical-stripe') drawWindow = col % 2 === 0;
      else if (b.windowPattern === 'horizontal-stripe') drawWindow = row % 2 === 0;

      if (drawWindow) {
        const x = col * spacingX - b.width / 2;
        const z = row * spacingY;
        const isLit = R() > 0.7;

        pg.fill(isLit ? litColor : windowColor);

        // Front face windows
        const wp = isoProject(x, -b.depth/2, z);
        pg.rect(wp.x - winW/2, wp.y - winH/2, winW, winH);
      }
    }
  }
}

function applyEffectToBuffer(pg, effect, building) {
  switch(effect) {
    case 'dither':
      applyDitherEffect(pg, rndChoice(DITHER_MODES));
      break;
    case 'liquify':
      applyLiquifyEffect(pg, rnd(0.3, 0.8));
      break;
    case 'stencil':
      applyStencilEffect(pg, rndInt(3, 6));
      break;
    case 'glitch':
      applyGlitchEffect(pg, rnd(0.3, 0.8));
      break;
    case 'corrupt':
      applyCorruptEffect(pg, rnd(0.2, 0.6));
      break;
    case 'clean':
    default:
      // No effect
      break;
  }

  return pg;
}

// =============================================================================
// MAIN SKETCH
// =============================================================================

let buildings = [];
let canvas;

function setup() {
  generateFeatures();

  canvas = createCanvas(700, 700);
  canvas.parent('sketch-container');
  pixelDensity(1);
  noLoop();

  // Register features for platforms
  if (typeof $fx !== 'undefined') {
    $fx.features({
      "Rarity": features.rarity,
      "Palette": features.palette,
      "Weirdness": features.weirdnessLevel,
      "Dominant Effect": features.dominantEffect,
      "Special": features.special,
      "Buildings": features.buildingCount,
      "Sky": features.skyMood,
      "Ground": features.groundStyle
    });
  }

  // Generate buildings
  generateCity();
}

function generateCity() {
  buildings = [];
  R = initRandom(hash);

  // Skip some initial random calls to sync with feature generation
  for (let i = 0; i < 20; i++) R();

  const gridSize = Math.ceil(Math.sqrt(features.buildingCount * 2));
  const occupied = new Set();

  for (let i = 0; i < features.buildingCount; i++) {
    let gridX, gridY, key;
    let attempts = 0;

    do {
      gridX = rndInt(-gridSize/2, gridSize/2);
      gridY = rndInt(-gridSize/2, gridSize/2);
      key = `${gridX},${gridY}`;
      attempts++;
    } while (occupied.has(key) && attempts < 100);

    if (attempts < 100) {
      occupied.add(key);

      // Assign style and effect
      const style = rndChoice(ARCH_STYLES);
      let effect;

      if (features.dominantEffect === 'all-blend') {
        effect = rndChoice(EFFECT_TYPES);
      } else if (R() < 0.6) {
        effect = features.dominantEffect;
      } else {
        effect = rndChoice(EFFECT_TYPES);
      }

      const building = new Building(gridX, gridY, style, effect);
      buildings.push(building);
    }
  }

  // Sort by depth for proper rendering
  buildings.sort((a, b) => a.getSortDepth() - b.getSortDepth());
}

function draw() {
  // Background / Sky
  drawSky();

  // Draw ground plane
  if (features.groundStyle !== 'none') {
    drawGround();
  }

  // Render each building
  for (const building of buildings) {
    renderBuilding(building);
  }

  // Special features
  if (features.special !== 'none') {
    drawSpecialFeature();
  }

  // Trigger preview for fxhash
  if (typeof fxpreview === 'function') {
    fxpreview();
  }
}

function drawSky() {
  const palette = PALETTES[features.palette];

  if (features.skyMood === 'gradient') {
    for (let y = 0; y < height; y++) {
      const t = y / height;
      const c = lerpColor(color(palette[5]), color(palette[2]), t);
      stroke(c);
      line(0, y, width, y);
    }
  } else if (features.skyMood === 'textured') {
    background(palette[4]);
    noStroke();
    for (let i = 0; i < 1000; i++) {
      fill(palette[rndInt(0, palette.length - 1)] + '40');
      const x = R() * width;
      const y = R() * height;
      ellipse(x, y, R() * 3, R() * 3);
    }
  } else if (features.skyMood === 'void') {
    background(palette[0]);
  } else {
    background(palette[3]);
  }
  noStroke();
}

function drawGround() {
  const palette = PALETTES[features.palette];
  const groundY = height * 0.75;

  if (features.groundStyle === 'reflection') {
    // Gradient fade
    for (let y = groundY; y < height; y++) {
      const t = (y - groundY) / (height - groundY);
      const c = lerpColor(color(palette[2]), color(palette[0]), t);
      stroke(c);
      line(0, y, width, y);
    }
  } else if (features.groundStyle === 'fade') {
    fill(palette[1] + '80');
    noStroke();
    rect(0, groundY, width, height - groundY);
  } else {
    fill(palette[1]);
    noStroke();
    rect(0, groundY, width, height - groundY);
  }
  noStroke();
}

function renderBuilding(building) {
  const pos = building.getBasePosition(width, height);

  // Create buffer and draw building
  const buffer = drawBuildingToBuffer(building, features.palette);

  // Apply effect
  applyEffectToBuffer(buffer, building.effect, building);

  // Apply weirdness transformations
  applyWeirdnessToRender(building, buffer, pos);

  // Draw to main canvas
  imageMode(CENTER);
  image(buffer, pos.x, pos.y - building.height / 2);
}

function applyWeirdnessToRender(building, buffer, pos) {
  for (const weird of building.weirdness) {
    if (weird.type === 'time-echo') {
      // Draw ghost echo
      tint(255, weird.opacity * 255);
      image(buffer, pos.x + weird.offset.x, pos.y - building.height / 2 + weird.offset.y);
      noTint();
    }
  }
}

function drawSpecialFeature() {
  const palette = PALETTES[features.palette];

  if (features.special === 'the-anomaly') {
    // A strange void/portal in the center
    push();
    translate(width/2, height/2);
    noFill();
    for (let i = 0; i < 20; i++) {
      stroke(palette[i % palette.length] + '60');
      strokeWeight(2);
      const r = 30 + i * 5;
      ellipse(0, 0, r, r * 0.6);
    }
    pop();
  } else if (features.special === 'portal') {
    // Glowing portal
    push();
    const px = width * 0.3;
    const py = height * 0.4;
    for (let i = 10; i > 0; i--) {
      fill(palette[5] + hex(i * 20, 2));
      noStroke();
      ellipse(px, py, i * 8, i * 12);
    }
    pop();
  } else if (features.special === 'floating-chunk') {
    // Random floating building piece
    push();
    translate(width * 0.7, height * 0.2);
    fill(PALETTES[features.palette][3]);
    const chunk = createGraphics(50, 50);
    chunk.background(PALETTES[features.palette][2]);
    chunk.fill(PALETTES[features.palette][4]);
    chunk.rect(10, 10, 30, 30);
    image(chunk, 0, 0);
    pop();
  }
}

// =============================================================================
// INTERACTION
// =============================================================================

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('corrupted-harmony-' + hash.slice(0, 8), 'png');
  }
  if (key === 'r' || key === 'R') {
    hash = "0x" + Array(64).fill(0).map(() =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    generateFeatures();
    generateCity();
    redraw();
    updateFeaturesDisplay();
  }
}

function updateFeaturesDisplay() {
  const container = document.getElementById('features-list');
  if (container) {
    container.innerHTML = Object.entries(features)
      .map(([k, v]) => `<div class="feature-row"><span class="feature-name">${k}</span><span class="feature-value ${v}">${v}</span></div>`)
      .join('');
  }
  const hashEl = document.getElementById('hash-display');
  if (hashEl) {
    hashEl.textContent = hash.slice(0, 18) + '...';
  }
}

// =============================================================================
// EXPORTS FOR DEV MODE
// =============================================================================

window.sketchAPI = {
  getFeatures: () => features,
  getHash: () => hash,
  regenerate: () => { keyPressed({ key: 'r' }); },
  setParameter: (name, value) => {
    hasOverrides = true;
    features[name] = value;
    generateCity();
    redraw();
    return features;
  },
  resetToOriginal: () => {
    features = { ...originalFeatures };
    hasOverrides = false;
    generateCity();
    redraw();
    return features;
  }
};
