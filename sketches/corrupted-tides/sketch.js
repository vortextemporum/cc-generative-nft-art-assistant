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
    x: Math.cos(k1 * y) + Math.sin(k2 * x) * Math.tan(t * 0.01 + 0.1),
    y: Math.sin(k2 * y) - Math.cos(k1 * x) / (Math.abs(Math.sin(t * 0.02)) + 0.1)
  }),

  // Coordinates fed back into themselves wrongly
  'recursive-error': (x, y, t, k1, k2) => ({
    x: Math.sin(x * k1 + Math.cos(y * k2)) * Math.cos(x + y),
    y: Math.cos(y * k2 + Math.sin(x * k1)) * Math.sin(x - y + t * 0.005)
  }),

  // Modulo artifacts - wrapping at wrong intervals
  'modulo-glitch': (x, y, t, k1, k2) => ({
    x: ((x * k1) % (Math.abs(y) + 0.1)) * 0.5,
    y: ((y * k2) % (Math.abs(x) + 0.1)) * 0.5
  }),

  // Integer truncation creating stepping
  'quantized-flow': (x, y, t, k1, k2) => ({
    x: Math.floor(Math.sin(k1 * y) * 8) / 8 + Math.floor(Math.cos(k2 * x) * 4) / 4,
    y: Math.floor(Math.cos(k1 * x) * 8) / 8 - Math.floor(Math.sin(k2 * y) * 4) / 4
  }),

  // Type coercion errors - treating floats as if they were ints
  'coercion-drift': (x, y, t, k1, k2) => ({
    x: (((x * 1000) | 0) ^ ((y * 1000) | 0)) / 1000 * Math.sin(k1),
    y: (((x * 1000) | 0) & ((y * 1000) | 0)) / 1000 * Math.cos(k2)
  }),

  // Polar coordinate confusion - mixing cartesian and polar
  'polar-melt': (x, y, t, k1, k2) => {
    const r = Math.sqrt(x * x + y * y);
    const theta = Math.atan2(y, x);
    // Use polar as cartesian, cartesian as polar
    return {
      x: Math.cos(r * k1) * theta,
      y: Math.sin(theta * k2) * r * 0.3
    };
  },

  // Overflow simulation - values wrap around like integer overflow
  'overflow-wrap': (x, y, t, k1, k2) => {
    const scale = 127;
    const ox = ((x * k1 * scale) % 256) - 128;
    const oy = ((y * k2 * scale) % 256) - 128;
    return {
      x: Math.sin(ox / 64) + Math.cos(oy / 32),
      y: Math.cos(ox / 32) - Math.sin(oy / 64)
    };
  },

  // Signed/unsigned confusion
  'sign-corrupt': (x, y, t, k1, k2) => {
    // Treat negative as large positive (like unsigned interpretation)
    const ux = x < 0 ? x + 10 : x;
    const uy = y < 0 ? y + 10 : y;
    return {
      x: Math.sin(ux * k1) - Math.sin(x * k1),
      y: Math.cos(uy * k2) - Math.cos(y * k2)
    };
  },

  // Bitwise rotation patterns
  'bit-rotate': (x, y, t, k1, k2) => {
    const ix = Math.floor(Math.abs(x * 100)) & 0xFF;
    const iy = Math.floor(Math.abs(y * 100)) & 0xFF;
    // Simulate bit rotation
    const rx = ((ix << 3) | (ix >> 5)) & 0xFF;
    const ry = ((iy << 5) | (iy >> 3)) & 0xFF;
    return {
      x: (rx / 128 - 1) * Math.sin(k1),
      y: (ry / 128 - 1) * Math.cos(k2)
    };
  },

  // Frequency modulation errors (FM synthesis gone wrong)
  'fm-distort': (x, y, t, k1, k2) => {
    const carrier = Math.sin(x * k1 + y * k2);
    const modulator = Math.sin(y * k1 * 3.14159);
    // FM with wrong modulation index
    return {
      x: Math.sin(x * k1 + modulator * k2 * 5),
      y: Math.cos(y * k2 + carrier * k1 * 5)
    };
  },

  // Phase cancellation artifacts
  'phase-cancel': (x, y, t, k1, k2) => {
    const p1 = Math.sin(x * k1 + y * k2);
    const p2 = Math.sin(x * k1 + y * k2 + Math.PI * 0.99); // Almost cancelled
    const p3 = Math.cos(x * k2 - y * k1);
    const p4 = Math.cos(x * k2 - y * k1 + Math.PI * 0.99);
    return {
      x: (p1 + p2) * 10, // Amplify the residual
      y: (p3 + p4) * 10
    };
  },

  // Feedback loop simulation
  'feedback-loop': (x, y, t, k1, k2) => {
    let fx = x, fy = y;
    // Simulate 3 iterations of feedback
    for (let i = 0; i < 3; i++) {
      const nx = Math.sin(fy * k1) * 0.8 + fx * 0.2;
      const ny = Math.cos(fx * k2) * 0.8 + fy * 0.2;
      fx = nx; fy = ny;
    }
    return { x: fx, y: fy };
  },

  // Denormal number artifacts (simulated floating point errors)
  'denormal-drift': (x, y, t, k1, k2) => {
    // Simulate denormalized floating point behavior
    const epsilon = 1e-10;
    const dx = x < epsilon && x > -epsilon ? x * 1e10 : x;
    const dy = y < epsilon && y > -epsilon ? y * 1e10 : y;
    return {
      x: Math.sin(dx * k1) + (Math.abs(x) < 0.1 ? Math.sin(k1 * 100 * x) : 0),
      y: Math.cos(dy * k2) + (Math.abs(y) < 0.1 ? Math.cos(k2 * 100 * y) : 0)
    };
  },

  // Catastrophic cancellation
  'catastrophic': (x, y, t, k1, k2) => {
    const big = 1e6;
    // Subtract nearly equal large numbers
    const cx = (big + x * k1) - (big + x * k1 * 0.9999);
    const cy = (big + y * k2) - (big + y * k2 * 0.9999);
    return {
      x: cx * 10000,
      y: cy * 10000
    };
  }
};

const PSEUDO_NAMES = Object.keys(PSEUDO_FUNCTIONS);
// ['broken-trig', 'recursive-error', 'modulo-glitch', 'quantized-flow', 'coercion-drift',
//  'polar-melt', 'overflow-wrap', 'sign-corrupt', 'bit-rotate', 'fm-distort',
//  'phase-cancel', 'feedback-loop', 'denormal-drift', 'catastrophic']

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

  // Block size for compression artifacts (scaled for high-res)
  const blockSizes = [4, 8, 16, 32].map(s => Math.round(s * SCALE));
  const blockSizeWeights = [0.15, 0.40, 0.30, 0.15]; // 8x8 most common (like JPEG)
  let blockRoll = R();
  let blockIdx = 0;
  let cumulative = 0;
  for (let i = 0; i < blockSizeWeights.length; i++) {
    cumulative += blockSizeWeights[i];
    if (blockRoll < cumulative) { blockIdx = i; break; }
  }
  const blockSize = blockSizes[blockIdx];

  // Glitch type - expanded with more visual modes
  const glitchType = rndChoice([
    'block', 'scanline', 'mixed',
    'interlace', 'pixel-sort', 'dither-error', 'bit-crush'
  ]);

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

  // Density - controls overall visual complexity
  const densityRarity = rollRarity(0.15, 0.55, 0.20, 0.10);
  const densityLevels = {
    'common': 'balanced',
    'uncommon': 'balanced',
    'rare': 'dense',
    'legendary': 'sparse'  // Minimalist is rare/special
  };
  const density = densityLevels[densityRarity];

  // Block cluster count - affected by density
  const clusterMultiplier = density === 'sparse' ? 0.3 : density === 'dense' ? 1.5 : 1.0;
  const clusterCount = Math.floor(rndInt(12, 36) * clusterMultiplier);


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
    density,
    pseudoMath,
    dataBendIntensity,
    clusterCount,
    scanlineDensity,
    k1,
    k2,
    fieldScale
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

const SIZE = 2000;
const DISPLAY_SIZE = 700;
const SCALE = SIZE / 700; // Scale factor for visual elements

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
        (rnd() * 255 * SCALE) : // Use a "color" as position (scaled)
        Math.cos(angle) * dist;
      const bendY = rndBool(features.dataBendIntensity) ?
        (rnd() * 255 * SCALE) :
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
      // Quantize position (compression artifact)
      const qx = Math.floor(block.x / features.blockSize) * features.blockSize;
      const qy = Math.floor(block.y / features.blockSize) * features.blockSize;

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



// =============================================================================
// RENDERING SYSTEMS
// =============================================================================

function drawCorruptedFlowField(pg, t) {
  const { corruptionIntensity, blockSize, density } = features;
  const densityMult = density === 'sparse' ? 0.25 : density === 'dense' ? 1.5 : 1.0;
  const particleCount = Math.floor((300 + corruptionIntensity * 400) * densityMult);

  pg.strokeWeight(1 * SCALE);

  for (let i = 0; i < particleCount; i++) {
    let x = rnd(0, SIZE);
    let y = rnd(0, SIZE);

    // Trace flow line
    const steps = rndInt(10, 40);
    pg.stroke(palette[rndInt(0, 4)] + "dd"); // More opaque for crisp lines
    pg.noFill();
    pg.beginShape();

    for (let s = 0; s < steps; s++) {
      // Quantize to block grid
      const qx = Math.floor(x / blockSize) * blockSize + blockSize / 2;
      const qy = Math.floor(y / blockSize) * blockSize + blockSize / 2;

      pg.vertex(qx, qy);

      // Get corrupted flow direction
      const v = corruptedVectorField(x, y, t);
      x += v.x * 5 * SCALE;
      y += v.y * 5 * SCALE;

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
  const gap = densities[scanlineDensity] * SCALE;

  pg.stroke(0, 30 + corruptionIntensity * 50);
  pg.strokeWeight(1 * SCALE);

  for (let y = 0; y < SIZE; y += gap) {
    // Occasional scanline displacement
    const displaced = rndBool(0.05 * corruptionIntensity);
    const offset = displaced ? rnd(-10, 10) * SCALE : 0;

    pg.line(offset, y, SIZE + offset, y);
  }
}

function drawBlockArtifacts(pg, t) {
  const { blockSize, corruptionIntensity, glitchType, density } = features;
  const densityMult = density === 'sparse' ? 0.2 : density === 'dense' ? 1.8 : 1.0;
  const artifactCount = Math.floor((15 + corruptionIntensity * 60) * densityMult);

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

    if (glitchType === 'interlace') {
      // Draw every other line with offset
      const lineY = Math.floor(rnd(0, SIZE / 2)) * 2;
      pg.rect(rnd(-20, 0) * SCALE, lineY, SIZE + 40 * SCALE, 1 * SCALE);
      pg.rect(rnd(0, 20) * SCALE, lineY + 1 * SCALE, SIZE + 40 * SCALE, 1 * SCALE);
    }

    if (glitchType === 'pixel-sort') {
      // Horizontal sorted-looking streaks
      const streakY = Math.floor(rnd(0, SIZE));
      const streakLen = rnd(50, 200) * SCALE * corruptionIntensity;
      const streakX = rnd(0, SIZE - streakLen);
      pg.strokeWeight(rnd(1, 3) * SCALE);
      pg.stroke(col + alpha.toString(16).padStart(2, '0'));
      pg.line(streakX, streakY, streakX + streakLen, streakY);
    }

    if (glitchType === 'dither-error') {
      // Scattered dither-like dots in clusters
      const cx = rnd(0, SIZE);
      const cy = rnd(0, SIZE);
      pg.noStroke();
      const dotSize = 2 * SCALE;
      for (let d = 0; d < 20; d++) {
        const dx = cx + rnd(-30, 30) * SCALE * corruptionIntensity;
        const dy = cy + rnd(-30, 30) * SCALE * corruptionIntensity;
        pg.fill(palette[rndInt(0, 4)]);
        pg.rect(Math.floor(dx / dotSize) * dotSize, Math.floor(dy / dotSize) * dotSize, dotSize, dotSize);
      }
    }

    if (glitchType === 'bit-crush') {
      // Large blocky regions with harsh color boundaries
      const bx = Math.floor(rnd(0, SIZE) / (blockSize * 2)) * blockSize * 2;
      const by = Math.floor(rnd(0, SIZE) / (blockSize * 2)) * blockSize * 2;
      pg.fill(palette[rndInt(0, 4)]);
      pg.rect(bx, by, blockSize * 2, blockSize * 2);
      // Add harsh edge
      pg.stroke(palette[(rndInt(0, 4) + 1) % 5]);
      pg.strokeWeight(2 * SCALE);
      pg.noFill();
      pg.rect(bx, by, blockSize * 2, blockSize * 2);
    }
  }
}

function drawCorruptedBorder(pg) {
  const { corruptionIntensity, blockSize } = features;
  const borderSize = 12 * SCALE;

  // Get background color (darkest from palette)
  const bgCol = getBgColor();
  pg.fill(bgCol);
  pg.noStroke();

  // Top
  for (let x = 0; x < SIZE; x += blockSize) {
    const h = borderSize + (rndBool(corruptionIntensity) ? rnd(-4, 8) * SCALE : 0);
    pg.rect(x, 0, blockSize, h);
  }

  // Bottom
  for (let x = 0; x < SIZE; x += blockSize) {
    const h = borderSize + (rndBool(corruptionIntensity) ? rnd(-4, 8) * SCALE : 0);
    pg.rect(x, SIZE - h, blockSize, h);
  }

  // Left
  for (let y = 0; y < SIZE; y += blockSize) {
    const w = borderSize + (rndBool(corruptionIntensity) ? rnd(-4, 8) * SCALE : 0);
    pg.rect(0, y, w, blockSize);
  }

  // Right
  for (let y = 0; y < SIZE; y += blockSize) {
    const w = borderSize + (rndBool(corruptionIntensity) ? rnd(-4, 8) * SCALE : 0);
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

  // Create high-res canvas, display at smaller size
  canvas = createCanvas(SIZE, SIZE);
  canvas.id('sketch-canvas');
  canvas.parent('sketch-holder');
  canvas.style('width', DISPLAY_SIZE + 'px');
  canvas.style('height', DISPLAY_SIZE + 'px');

  // Create buffers at full resolution
  blockBuffer = createGraphics(SIZE, SIZE);
  flowBuffer = createGraphics(SIZE, SIZE);

  // Generate clusters (replaces coral generation)
  R = initRandom(hash); // Reset for consistent cluster generation
  // Burn some random calls to match feature generation
  for (let i = 0; i < 50; i++) R();

  clusters = [];
  const margin = 50 * SCALE;
  for (let i = 0; i < features.clusterCount; i++) {
    clusters.push(new BlockCluster(
      rnd(margin, SIZE - margin),
      rnd(margin, SIZE - margin),
      rnd(30, 100) * SCALE
    ));
  }

  // Use pixelDensity 1 since we're manually handling high-res via larger canvas
  pixelDensity(1);

  // Disable image smoothing for crisp blocks
  drawingContext.imageSmoothingEnabled = false;
  blockBuffer.drawingContext.imageSmoothingEnabled = false;
  flowBuffer.drawingContext.imageSmoothingEnabled = false;

  // Initial render
  renderFrame();
}

function renderFrame() {
  // Clear everything first
  const bgCol = getBgColor();
  clear();
  background(bgCol);
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

  // Draw final composite to main canvas
  image(blockBuffer, 0, 0);

  // Draw border
  drawCorruptedBorder(this);
}

function draw() {
  // Static image - no animation loop
  noLoop();
}

// =============================================================================
// CONTROLS
// =============================================================================

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas(`corrupted-tides-${hash.slice(2, 10)}`, 'png');
  }

  if (key === 'r' || key === 'R') {
    doRegenerate();
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
  density: {
    probabilities: [0.15, 0.55, 0.20, 0.10],
    labels: ['sparse', 'balanced', 'balanced', 'dense']
  },
  blockSize: {
    probabilities: [0.15, 0.40, 0.30, 0.15],
    labels: ['4', '8', '16', '32']
  },
  glitchType: {
    probabilities: [0.143, 0.143, 0.143, 0.143, 0.143, 0.143, 0.142],
    labels: ['block', 'scanline', 'mixed', 'interlace', 'pixel-sort', 'dither-error', 'bit-crush']
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

function doRegenerate() {
  // Clear everything first
  clear();
  blockBuffer.clear();
  flowBuffer.clear();

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
  const margin = 50 * SCALE;
  for (let i = 0; i < features.clusterCount; i++) {
    clusters.push(new BlockCluster(
      rnd(margin, SIZE - margin),
      rnd(margin, SIZE - margin),
      rnd(30, 100) * SCALE
    ));
  }

  renderFrame();

  // Dispatch event for UI update
  window.dispatchEvent(new CustomEvent('hashChanged', { detail: { hash, features } }));
}

function doSave() {
  saveCanvas(`corrupted-tides-${hash.slice(2, 10)}`, 'png');
}

function doRender() {
  // Regenerate clusters with current features (needed when params change)
  R = initRandom(hash);
  for (let i = 0; i < 50; i++) R();
  clusters = [];
  const margin = 50 * SCALE;
  for (let i = 0; i < features.clusterCount; i++) {
    clusters.push(new BlockCluster(
      rnd(margin, SIZE - margin),
      rnd(margin, SIZE - margin),
      rnd(30, 100) * SCALE
    ));
  }

  // Update palette in case corruption params changed
  palette = corruptPalette(
    SIGNAL_SOURCES[features.signalSource],
    features.paletteCorruption,
    features.corruptionIntensity
  );

  renderFrame();
}

window.corruptedTides = {
  getFeatures: () => features,
  getHash: () => hash,
  setParameter,
  resetToOriginal,
  hasModifications,
  getRarityCurves,
  exportFeedback,
  recordFeedback,
  regenerate: doRegenerate,
  save: doSave,
  render: doRender
};
