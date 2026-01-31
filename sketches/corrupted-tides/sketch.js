/**
 * CORRUPTED TIDES
 * A glitch art piece - digital decay expressed through compression artifacts,
 * pseudomath, and data bending. Living corruption with subtle animation.
 *
 * v1.0.0
 */

// =============================================================================
// HASH-BASED RANDOMNESS (Art Blocks Compatible)
// =============================================================================

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
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}

function initRandom(hashStr) {
  const seeds = [];
  for (let i = 0; i < 4; i++) {
    seeds.push(parseInt(hashStr.slice(2 + i * 8, 10 + i * 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

let R;
function rnd(min = 0, max = 1) {
  return min + R() * (max - min);
}
function rndInt(min, max) {
  return Math.floor(rnd(min, max + 1));
}
function rndChoice(arr) {
  return arr[rndInt(0, arr.length - 1)];
}
function rndBool(p = 0.5) {
  return R() < p;
}
function rollRarity(common, uncommon, rare, legendary) {
  const roll = R();
  if (roll < legendary) return 'legendary';
  if (roll < legendary + rare) return 'rare';
  if (roll < legendary + rare + uncommon) return 'uncommon';
  return 'common';
}

// =============================================================================
// SECRET PALETTES (Transformed from source material)
// =============================================================================

// Signal sources - these are the original palettes, corrupted
const SIGNAL_SOURCES = {
  // Original names mapped to abstract signal names
  'static-white':   ["#F4F4F4", "#E9E9E9", "#E4E4E4", "#D9D9D9", "#D4D4D4"],
  'void-grey':      ["#3A4039", "#535951", "#8C8979", "#BFBDB0", "#454545"],
  'ember-pulse':    ["#744f2a", "#C3431C", "#D1B412", "#5E8B7F", "#FFFCC9"],
  'aqua-signal':    ["#D4EAEC", "#43A9D1", "#726092", "#F1BB2D", "#E7BD4A"],
  'sand-drift':     ["#F4E3A9", "#D28F34", "#69CAE6", "#BC9F32", "#677B68"],
  'foam-noise':     ["#787878", "#70C1B3", "#E1C3B3", "#FFE066", "#D8EECF"],
  'primary-bleed':  ["#454545", "#1D88E5", "#F44336", "#FCDA07", "#FAFAF9"],
  'deep-current':   ["#2E5F63", "#7FB7AD", "#E8C9A8", "#D86C5A", "#5A4636"],
  'cold-surge':     ["#F1FAEE", "#E63946", "#A8DADC", "#457B9D", "#1D3557"],
  'neon-depths':    ["#19181C", "#F49B01", "#02A77C", "#408FCF", "#7F619B"],
  'candy-reef':     ["#73D8D9", "#F8DB37", "#FF8893", "#81A261", "#4B6D8A"],
  'warm-static':    ["#f7efe8", "#FF9845", "#b7f4d8", "#f3e16b", "#282828"],
  'moss-signal':    ["#BAD7DF", "#EAC6D2", "#FAF0CA", "#AAAC20", "#46660F"]
};

const SIGNAL_NAMES = Object.keys(SIGNAL_SOURCES);

// =============================================================================
// PALETTE CORRUPTION FUNCTIONS
// =============================================================================

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function quantizePalette(palette, bits = 4) {
  const levels = Math.pow(2, bits);
  const step = 256 / levels;
  return palette.map(hex => {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(
      Math.floor(r / step) * step + step / 2,
      Math.floor(g / step) * step + step / 2,
      Math.floor(b / step) * step + step / 2
    );
  });
}

function channelShiftPalette(palette, rShift = 0, gShift = 1, bShift = 2) {
  return palette.map((hex, i) => {
    const colors = palette.map(h => hexToRgb(h));
    const r = colors[(i + rShift) % palette.length].r;
    const g = colors[(i + gShift) % palette.length].g;
    const b = colors[(i + bShift) % palette.length].b;
    return rgbToHex(r, g, b);
  });
}

function invertPalette(palette) {
  return palette.map(hex => {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(255 - r, 255 - g, 255 - b);
  });
}

function hueRotatePalette(palette, degrees) {
  return palette.map(hex => {
    const { r, g, b } = hexToRgb(hex);
    // Convert to HSL, rotate, convert back
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const l = (max + min) / 2;
    let h = 0, s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      const rN = r / 255, gN = g / 255, bN = b / 255;
      if (max === rN) h = ((gN - bN) / d + (gN < bN ? 6 : 0)) / 6;
      else if (max === gN) h = ((bN - rN) / d + 2) / 6;
      else h = ((rN - gN) / d + 4) / 6;
    }

    h = (h + degrees / 360) % 1;
    if (h < 0) h += 1;

    // HSL to RGB
    let rOut, gOut, bOut;
    if (s === 0) {
      rOut = gOut = bOut = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      rOut = hue2rgb(p, q, h + 1/3);
      gOut = hue2rgb(p, q, h);
      bOut = hue2rgb(p, q, h - 1/3);
    }

    return rgbToHex(rOut * 255, gOut * 255, bOut * 255);
  });
}

function corruptPalette(palette, corruptionType, intensity) {
  switch (corruptionType) {
    case 'quantized':
      return quantizePalette(palette, Math.max(2, 6 - Math.floor(intensity * 4)));
    case 'channel-shifted':
      const shifts = [
        [0, 1, 2], [1, 2, 0], [2, 0, 1],
        [0, 2, 1], [2, 1, 0], [1, 0, 2]
      ];
      const shift = shifts[Math.floor(intensity * shifts.length)];
      return channelShiftPalette(palette, ...shift);
    case 'inverted':
      return invertPalette(palette);
    case 'rotated':
      return hueRotatePalette(palette, intensity * 360);
    default:
      return palette;
  }
}

// =============================================================================
// PSEUDOMATH - Intentionally Wrong Formulas
// =============================================================================

// These look mathematical but produce "wrong" beautiful results
const PSEUDO_FUNCTIONS = {
  // Normal would be: cos(x) + sin(y)
  // Wrong: treating coordinates as if they were different things
  'broken-trig': (x, y, t, k1, k2) => ({
    // Divide by wrong values, use wrong operations
    x: Math.cos(k1 * y) + Math.sin(k2 * x) * Math.tan(t * 0.01),
    y: Math.sin(k2 * y) - Math.cos(k1 * x) / (Math.abs(Math.sin(t * 0.02)) + 0.1)
  }),

  // Coordinates fed back into themselves wrongly
  'recursive-error': (x, y, t, k1, k2) => ({
    x: Math.sin(x * k1 + Math.cos(y * k2)) * Math.cos(x + y),
    y: Math.cos(y * k2 + Math.sin(x * k1)) * Math.sin(x - y + t * 0.005)
  }),

  // Modulo artifacts - wrapping at wrong intervals
  'modulo-glitch': (x, y, t, k1, k2) => ({
    x: ((x * k1) % (y + 0.001)) * Math.sin(t * 0.01),
    y: ((y * k2) % (x + 0.001)) * Math.cos(t * 0.01)
  }),

  // Integer truncation creating stepping
  'quantized-flow': (x, y, t, k1, k2) => ({
    x: Math.floor(Math.sin(k1 * y) * 8) / 8 + Math.floor(Math.cos(k2 * x) * 4) / 4,
    y: Math.floor(Math.cos(k1 * x) * 8) / 8 - Math.floor(Math.sin(k2 * y) * 4) / 4
  }),

  // Type coercion errors - treating floats as if they were ints
  'coercion-drift': (x, y, t, k1, k2) => ({
    x: (((x * 1000) | 0) ^ ((y * 1000) | 0)) / 1000 * Math.sin(k1 + t * 0.001),
    y: (((x * 1000) | 0) & ((y * 1000) | 0)) / 1000 * Math.cos(k2 + t * 0.001)
  })
};

const PSEUDO_NAMES = Object.keys(PSEUDO_FUNCTIONS);

// =============================================================================
// FEATURE SYSTEM
// =============================================================================

let features = {};
let originalFeatures = {};
let hasOverrides = false;

function generateFeatures() {
  R = initRandom(hash);

  // Signal source (secretly the palette)
  const signalSource = rndChoice(SIGNAL_NAMES);

  // Corruption level - the main rarity driver
  const corruptionRarity = rollRarity(0.45, 0.30, 0.18, 0.07);
  const corruptionLevels = {
    'common': 'minimal',
    'uncommon': 'moderate',
    'rare': 'heavy',
    'legendary': 'catastrophic'
  };
  const corruptionLevel = corruptionLevels[corruptionRarity];

  // Corruption intensity (0-1 scale)
  const intensityRanges = {
    'minimal': [0.1, 0.3],
    'moderate': [0.3, 0.55],
    'heavy': [0.55, 0.8],
    'catastrophic': [0.8, 1.0]
  };
  const [minI, maxI] = intensityRanges[corruptionLevel];
  const corruptionIntensity = rnd(minI, maxI);

  // Palette corruption type
  const paletteCorruption = rndChoice(['quantized', 'channel-shifted', 'inverted', 'rotated']);

  // Block size for compression artifacts
  const blockSizes = [4, 8, 16, 32];
  const blockSizeWeights = [0.15, 0.40, 0.30, 0.15]; // 8x8 most common (like JPEG)
  let blockRoll = R();
  let blockIdx = 0;
  let cumulative = 0;
  for (let i = 0; i < blockSizeWeights.length; i++) {
    cumulative += blockSizeWeights[i];
    if (blockRoll < cumulative) { blockIdx = i; break; }
  }
  const blockSize = blockSizes[blockIdx];

  // Glitch type
  const glitchType = rndChoice(['block', 'scanline', 'channel', 'mixed']);

  // Drift speed for animation
  const driftRarity = rollRarity(0.30, 0.35, 0.25, 0.10);
  const driftSpeeds = {
    'common': 'still',
    'uncommon': 'glacial',
    'rare': 'slow',
    'legendary': 'restless'
  };
  const driftSpeed = driftSpeeds[driftRarity];

  // Pseudomath function
  const pseudoMath = rndChoice(PSEUDO_NAMES);

  // Data bend intensity
  const dataBendIntensity = rnd(0.2, 0.8) * corruptionIntensity;

  // Block cluster count (replaces coral count)
  const clusterCount = rndInt(12, 36);

  // Channel displacement amount
  const channelDisplacement = rnd(2, 12) * corruptionIntensity;

  // Scanline density
  const scanlineDensity = rndChoice(['sparse', 'medium', 'dense']);

  // Flow field parameters (transformed from original k1, k2)
  const k1 = rnd(5, 15);
  const k2 = rnd(1, 8);
  const fieldScale = rnd(0.5, 3.0);

  // Glitch event frequency
  const glitchEventFreq = rnd(0.001, 0.02) * (driftSpeed === 'restless' ? 2 : 1);

  features = {
    signalSource,
    corruptionLevel,
    corruptionIntensity,
    paletteCorruption,
    blockSize,
    glitchType,
    driftSpeed,
    pseudoMath,
    dataBendIntensity,
    clusterCount,
    channelDisplacement,
    scanlineDensity,
    k1,
    k2,
    fieldScale,
    glitchEventFreq
  };

  originalFeatures = { ...features };
  return features;
}

// Dev mode helpers
function setParameter(name, value) {
  hasOverrides = true;
  features[name] = value;
  return features;
}

function resetToOriginal() {
  features = { ...originalFeatures };
  hasOverrides = false;
  return features;
}

function hasModifications() { return hasOverrides; }

// =============================================================================
// GLOBALS
// =============================================================================

let canvas;
let corruptionShader;
let blockBuffer;
let flowBuffer;
let channelBuffers = { r: null, g: null, b: null };
let palette;
let time = 0;
let glitchEvent = 0;
let glitchOffset = { x: 0, y: 0 };
let isPaused = false;

const SIZE = 700;

// =============================================================================
// CORRUPTED FLOW FIELD
// =============================================================================

function corruptedVectorField(x, y, t) {
  const { k1, k2, fieldScale, pseudoMath } = features;

  // Normalize coordinates
  const nx = (x / SIZE) * 2 * fieldScale - fieldScale;
  const ny = (y / SIZE) * 2 * fieldScale - fieldScale;

  // Apply pseudomath function
  const pseudoFn = PSEUDO_FUNCTIONS[pseudoMath];
  return pseudoFn(nx, ny, t, k1, k2);
}

// =============================================================================
// BLOCK CLUSTER SYSTEM (Replaces Bezier Corals)
// =============================================================================

class BlockCluster {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.baseSize = size;
    this.blocks = [];
    this.generateBlocks();
  }

  generateBlocks() {
    const count = rndInt(8, 32);
    const { blockSize, corruptionIntensity } = features;

    for (let i = 0; i < count; i++) {
      // Spread blocks in a cluster pattern
      const angle = rnd(0, TWO_PI);
      const dist = rnd(0, this.baseSize);

      // Data bend: sometimes use wrong values
      const bendX = rndBool(features.dataBendIntensity) ?
        (rnd() * 255) : // Use a "color" as position
        Math.cos(angle) * dist;
      const bendY = rndBool(features.dataBendIntensity) ?
        (rnd() * 255) :
        Math.sin(angle) * dist;

      this.blocks.push({
        x: this.x + bendX,
        y: this.y + bendY,
        size: blockSize * rnd(0.5, 2),
        colorIdx: rndInt(0, 4),
        corruption: rnd(0, 1),
        phase: rnd(0, TWO_PI)
      });
    }
  }

  draw(pg, t) {
    const { corruptionIntensity } = features;

    for (const block of this.blocks) {
      // Animate block with drift
      const drift = getDriftAmount(t);
      const ox = Math.sin(t * 0.001 + block.phase) * drift;
      const oy = Math.cos(t * 0.001 + block.phase * 1.3) * drift;

      // Quantize position (compression artifact)
      const qx = Math.floor((block.x + ox) / features.blockSize) * features.blockSize;
      const qy = Math.floor((block.y + oy) / features.blockSize) * features.blockSize;

      // Color with potential corruption
      let col = palette[block.colorIdx];
      if (block.corruption < corruptionIntensity) {
        // Corrupt the color - wrong channel mixing
        const rgb = hexToRgb(col);
        col = rgbToHex(rgb.g, rgb.b, rgb.r); // Rotate channels
      }

      pg.fill(col);
      pg.noStroke();
      pg.rect(qx, qy, block.size, block.size);

      // Add block artifacts
      if (rndBool(corruptionIntensity * 0.3)) {
        pg.fill(palette[rndInt(0, 4)]);
        pg.rect(qx + block.size, qy, block.size * 0.5, block.size * 0.5);
      }
    }
  }
}

let clusters = [];

// =============================================================================
// DRIFT & GLITCH EVENTS
// =============================================================================

function getDriftAmount(t) {
  const driftMultipliers = {
    'still': 0,
    'glacial': 2,
    'slow': 5,
    'restless': 12
  };
  return driftMultipliers[features.driftSpeed] || 0;
}

function updateGlitchEvent(t) {
  // Random glitch events
  if (rndBool(features.glitchEventFreq)) {
    glitchEvent = 1.0;
    glitchOffset = {
      x: rnd(-20, 20) * features.corruptionIntensity,
      y: rnd(-10, 10) * features.corruptionIntensity
    };
  }

  // Decay glitch event
  glitchEvent *= 0.95;
  if (glitchEvent < 0.01) {
    glitchEvent = 0;
    glitchOffset = { x: 0, y: 0 };
  }
}

// =============================================================================
// RENDERING SYSTEMS
// =============================================================================

function drawCorruptedFlowField(pg, t) {
  const { corruptionIntensity, blockSize } = features;
  const particleCount = Math.floor(500 + corruptionIntensity * 500);

  pg.strokeWeight(1);

  for (let i = 0; i < particleCount; i++) {
    let x = rnd(0, SIZE);
    let y = rnd(0, SIZE);

    // Trace flow line
    const steps = rndInt(10, 40);
    pg.stroke(palette[rndInt(0, 4)] + "88"); // Semi-transparent
    pg.noFill();
    pg.beginShape();

    for (let s = 0; s < steps; s++) {
      // Quantize to block grid
      const qx = Math.floor(x / blockSize) * blockSize + blockSize / 2;
      const qy = Math.floor(y / blockSize) * blockSize + blockSize / 2;

      pg.vertex(qx, qy);

      // Get corrupted flow direction
      const v = corruptedVectorField(x, y, t);
      x += v.x * 5;
      y += v.y * 5;

      // Bounds with wrapping (data bend style)
      if (x < 0) x = SIZE;
      if (x > SIZE) x = 0;
      if (y < 0) y = SIZE;
      if (y > SIZE) y = 0;
    }

    pg.endShape();
  }
}

function drawScanlines(pg, t) {
  const { scanlineDensity, corruptionIntensity } = features;
  const densities = { 'sparse': 8, 'medium': 4, 'dense': 2 };
  const gap = densities[scanlineDensity];

  pg.stroke(0, 30 + corruptionIntensity * 50);
  pg.strokeWeight(1);

  for (let y = 0; y < SIZE; y += gap) {
    // Occasional scanline displacement
    const displaced = rndBool(0.05 * corruptionIntensity);
    const offset = displaced ? rnd(-10, 10) : 0;

    pg.line(offset, y, SIZE + offset, y);
  }
}

function drawBlockArtifacts(pg, t) {
  const { blockSize, corruptionIntensity, glitchType } = features;
  const artifactCount = Math.floor(20 + corruptionIntensity * 80);

  for (let i = 0; i < artifactCount; i++) {
    const x = Math.floor(rnd(0, SIZE) / blockSize) * blockSize;
    const y = Math.floor(rnd(0, SIZE) / blockSize) * blockSize;

    // Color from palette with possible corruption
    let col = palette[rndInt(0, 4)];
    const alpha = Math.floor(50 + rnd() * 150);

    pg.fill(col + alpha.toString(16).padStart(2, '0'));
    pg.noStroke();

    if (glitchType === 'block' || glitchType === 'mixed') {
      pg.rect(x, y, blockSize * rnd(1, 3), blockSize * rnd(1, 3));
    }

    if (glitchType === 'scanline' || glitchType === 'mixed') {
      pg.rect(0, y, SIZE, blockSize * 0.5);
    }
  }
}

function drawChannelDisplacement(destPg, srcPg, t) {
  const { channelDisplacement } = features;
  const glitchMod = 1 + glitchEvent * 3;

  // Load pixels
  srcPg.loadPixels();
  destPg.loadPixels();

  const disp = channelDisplacement * glitchMod;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;

      // Red channel - shifted left
      const rX = Math.floor(x - disp + glitchOffset.x);
      const rI = (y * SIZE + Math.max(0, Math.min(SIZE - 1, rX))) * 4;

      // Green channel - center (with slight vertical shift)
      const gY = Math.floor(y + disp * 0.3 + glitchOffset.y);
      const gI = (Math.max(0, Math.min(SIZE - 1, gY)) * SIZE + x) * 4;

      // Blue channel - shifted right
      const bX = Math.floor(x + disp);
      const bI = (y * SIZE + Math.max(0, Math.min(SIZE - 1, bX))) * 4;

      destPg.pixels[i] = srcPg.pixels[rI];         // R
      destPg.pixels[i + 1] = srcPg.pixels[gI + 1]; // G
      destPg.pixels[i + 2] = srcPg.pixels[bI + 2]; // B
      destPg.pixels[i + 3] = 255;                   // A
    }
  }

  destPg.updatePixels();
}

function drawCorruptedBorder(pg) {
  const { corruptionIntensity, blockSize } = features;
  const borderSize = 12;

  // Get background color (darkest from palette)
  const bgCol = getBgColor();
  pg.fill(bgCol);
  pg.noStroke();

  // Top
  for (let x = 0; x < SIZE; x += blockSize) {
    const h = borderSize + (rndBool(corruptionIntensity) ? rnd(-4, 8) : 0);
    pg.rect(x, 0, blockSize, h);
  }

  // Bottom
  for (let x = 0; x < SIZE; x += blockSize) {
    const h = borderSize + (rndBool(corruptionIntensity) ? rnd(-4, 8) : 0);
    pg.rect(x, SIZE - h, blockSize, h);
  }

  // Left
  for (let y = 0; y < SIZE; y += blockSize) {
    const w = borderSize + (rndBool(corruptionIntensity) ? rnd(-4, 8) : 0);
    pg.rect(0, y, w, blockSize);
  }

  // Right
  for (let y = 0; y < SIZE; y += blockSize) {
    const w = borderSize + (rndBool(corruptionIntensity) ? rnd(-4, 8) : 0);
    pg.rect(SIZE - w, y, blockSize, w);
  }
}

function getBgColor() {
  // Derive background from palette - use darkest or create corrupted version
  const { corruptionIntensity, signalSource } = features;
  const basePalette = SIGNAL_SOURCES[signalSource];

  // Find darkest color
  let darkest = basePalette[0];
  let minBrightness = 999;

  for (const hex of basePalette) {
    const { r, g, b } = hexToRgb(hex);
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    if (brightness < minBrightness) {
      minBrightness = brightness;
      darkest = hex;
    }
  }

  // Corrupt it slightly
  const { r, g, b } = hexToRgb(darkest);
  return rgbToHex(
    Math.max(0, r - 20),
    Math.max(0, g - 20),
    Math.max(0, b - 20)
  );
}

// =============================================================================
// P5.JS SETUP & DRAW
// =============================================================================

function setup() {
  // Generate features from hash
  generateFeatures();

  // Create corrupted palette
  const basePalette = SIGNAL_SOURCES[features.signalSource];
  palette = corruptPalette(basePalette, features.paletteCorruption, features.corruptionIntensity);

  // Create canvas
  canvas = createCanvas(SIZE, SIZE);
  canvas.id('sketch-canvas');

  // Create buffers
  blockBuffer = createGraphics(SIZE, SIZE);
  flowBuffer = createGraphics(SIZE, SIZE);

  // Generate clusters (replaces coral generation)
  R = initRandom(hash); // Reset for consistent cluster generation
  // Burn some random calls to match feature generation
  for (let i = 0; i < 50; i++) R();

  clusters = [];
  for (let i = 0; i < features.clusterCount; i++) {
    clusters.push(new BlockCluster(
      rnd(50, SIZE - 50),
      rnd(50, SIZE - 50),
      rnd(30, 100)
    ));
  }

  // Set pixel density
  pixelDensity(1);

  // Initial render
  renderFrame();
}

function renderFrame() {
  // Clear buffers
  const bgCol = getBgColor();
  blockBuffer.background(bgCol);
  flowBuffer.background(0, 0);

  // Draw corrupted flow field
  drawCorruptedFlowField(flowBuffer, time);

  // Draw block clusters
  for (const cluster of clusters) {
    cluster.draw(blockBuffer, time);
  }

  // Draw block artifacts
  drawBlockArtifacts(blockBuffer, time);

  // Composite flow onto blocks
  blockBuffer.image(flowBuffer, 0, 0);

  // Draw scanlines
  drawScanlines(blockBuffer, time);

  // Apply channel displacement to main canvas
  image(blockBuffer, 0, 0);
  loadPixels();
  blockBuffer.loadPixels();

  const disp = features.channelDisplacement * (1 + glitchEvent * 3);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;

      // Red - shifted
      const rX = Math.floor(x - disp + glitchOffset.x);
      const rI = (y * SIZE + Math.max(0, Math.min(SIZE - 1, rX))) * 4;

      // Green - slight vertical
      const gY = Math.floor(y + disp * 0.2 + glitchOffset.y);
      const gI = (Math.max(0, Math.min(SIZE - 1, gY)) * SIZE + x) * 4;

      // Blue - shifted opposite
      const bX = Math.floor(x + disp);
      const bI = (y * SIZE + Math.max(0, Math.min(SIZE - 1, bX))) * 4;

      pixels[i] = blockBuffer.pixels[rI];
      pixels[i + 1] = blockBuffer.pixels[gI + 1];
      pixels[i + 2] = blockBuffer.pixels[bI + 2];
      pixels[i + 3] = 255;
    }
  }

  updatePixels();

  // Draw border
  drawCorruptedBorder(this);
}

function draw() {
  if (isPaused) return;

  // Update time and glitch events
  time = millis();
  updateGlitchEvent(time);

  // Only re-render if animating
  if (features.driftSpeed !== 'still' || glitchEvent > 0) {
    renderFrame();
  }
}

// =============================================================================
// CONTROLS
// =============================================================================

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas(`corrupted-tides-${hash.slice(2, 10)}`, 'png');
  }

  if (key === 'r' || key === 'R') {
    // Regenerate with new hash
    hash = "0x" + Array(64).fill(0).map(() =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

    generateFeatures();
    palette = corruptPalette(
      SIGNAL_SOURCES[features.signalSource],
      features.paletteCorruption,
      features.corruptionIntensity
    );

    // Regenerate clusters
    R = initRandom(hash);
    for (let i = 0; i < 50; i++) R();
    clusters = [];
    for (let i = 0; i < features.clusterCount; i++) {
      clusters.push(new BlockCluster(
        rnd(50, SIZE - 50),
        rnd(50, SIZE - 50),
        rnd(30, 100)
      ));
    }

    renderFrame();

    // Dispatch event for UI update
    window.dispatchEvent(new CustomEvent('hashChanged', { detail: { hash, features } }));
  }

  if (key === ' ') {
    isPaused = !isPaused;
  }

  if (key === 'l' || key === 'L') {
    recordFeedback(true);
  }

  if (key === 'd' || key === 'D') {
    recordFeedback(false);
  }
}

// =============================================================================
// FEEDBACK SYSTEM
// =============================================================================

const FEEDBACK_KEY = 'corrupted-tides-feedback';

function loadFeedback() {
  try {
    const data = localStorage.getItem(FEEDBACK_KEY);
    return data ? JSON.parse(data) : { liked: [], disliked: [] };
  } catch {
    return { liked: [], disliked: [] };
  }
}

function saveFeedback(feedback) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
}

function recordFeedback(isLike) {
  const feedback = loadFeedback();
  const entry = {
    timestamp: Date.now(),
    hash,
    features: { ...features },
    hadOverrides: hasOverrides
  };

  if (isLike) {
    feedback.liked.push(entry);
    console.log('LIKED:', entry);
  } else {
    feedback.disliked.push(entry);
    console.log('DISLIKED:', entry);
  }

  saveFeedback(feedback);
}

function exportFeedback() {
  return loadFeedback();
}

// =============================================================================
// RARITY CURVES (for UI)
// =============================================================================

const RARITY_CURVES = {
  corruptionLevel: {
    probabilities: [0.45, 0.30, 0.18, 0.07],
    labels: ['minimal', 'moderate', 'heavy', 'catastrophic']
  },
  driftSpeed: {
    probabilities: [0.30, 0.35, 0.25, 0.10],
    labels: ['still', 'glacial', 'slow', 'restless']
  },
  blockSize: {
    probabilities: [0.15, 0.40, 0.30, 0.15],
    labels: ['4x4', '8x8', '16x16', '32x32']
  },
  glitchType: {
    probabilities: [0.25, 0.25, 0.25, 0.25],
    labels: ['block', 'scanline', 'channel', 'mixed']
  },
  paletteCorruption: {
    probabilities: [0.25, 0.25, 0.25, 0.25],
    labels: ['quantized', 'channel-shifted', 'inverted', 'rotated']
  }
};

function getRarityCurves() {
  return RARITY_CURVES;
}

// =============================================================================
// EXPORTS FOR UI
// =============================================================================

window.corruptedTides = {
  getFeatures: () => features,
  getHash: () => hash,
  setParameter,
  resetToOriginal,
  hasModifications,
  getRarityCurves,
  exportFeedback,
  regenerate: () => keyPressed.call({ key: 'r' })
};
