/**
 * data-stomp
 * Generative noise pedals with Ikeda/Noto/bytebeat audio
 * v1.1.0 - Grid-based layout, distinct knob types, single pedal
 */

// ============================================================================
// HASH-BASED RANDOMNESS (Art Blocks / fxhash compatible)
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
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}

function initRandom(hashStr) {
  const seed = hashStr.slice(2);
  const seeds = [];
  for (let i = 0; i < 4; i++) {
    seeds.push(parseInt(seed.slice(i * 8, (i + 1) * 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

let R;
function rnd(min = 0, max = 1) {
  return R() * (max - min) + min;
}

// Polyfill for roundRect (not supported in all browsers)
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (typeof r === 'number') r = [r, r, r, r];
    this.moveTo(x + r[0], y);
    this.lineTo(x + w - r[1], y);
    this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
    this.lineTo(x + w, y + h - r[2]);
    this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
    this.lineTo(x + r[3], y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
    this.lineTo(x, y + r[0]);
    this.quadraticCurveTo(x, y, x + r[0], y);
    this.closePath();
  };
}
function rndInt(min, max) {
  return Math.floor(rnd(min, max + 1));
}
function rndChoice(arr) {
  return arr[Math.floor(R() * arr.length)];
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

// ============================================================================
// FEATURES & TRAITS
// ============================================================================

let features = {};
let originalFeatures = {};
let hasOverrides = false;

// Color palettes for each scheme
const COLOR_SCHEMES = {
  'black-white': {
    bg: '#0a0a0a',
    pedalboard: '#1a1a1a',
    enclosure: ['#0d0d0d', '#141414', '#1a1a1a'],
    accent: '#ffffff',
    led: '#ffffff',
    knob: '#2a2a2a',
    text: '#ffffff'
  },
  'dark-brass': {
    bg: '#0d0b08',
    pedalboard: '#1a1510',
    enclosure: ['#1a1510', '#252015', '#2a2218'],
    accent: '#c9a227',
    led: '#ffcc00',
    knob: '#8b7355',
    text: '#c9a227'
  },
  'industrial': {
    bg: '#121416',
    pedalboard: '#1e2124',
    enclosure: ['#2a2d31', '#3a3d41', '#454850'],
    accent: '#7a8288',
    led: '#00ff88',
    knob: '#555960',
    text: '#9aa0a6'
  },
  'colorful-vintage': {
    bg: '#1a1612',
    pedalboard: '#2a2420',
    enclosure: ['#8b4513', '#2e5a1c', '#c35500', '#1a3a5c'],
    accent: '#ffd700',
    led: '#ff3333',
    knob: '#3a3530',
    text: '#f5f0e6'
  }
};

// Knob types
const KNOB_TYPES = {
  'chicken-head': { style: 'pointer', size: 1.0 },
  'davies-skirted': { style: 'skirted', size: 1.2 },
  'mxr-hex': { style: 'hex', size: 0.9 },
  'moog-bakelite': { style: 'bakelite', size: 1.1 },
  'backlit-ring': { style: 'led-ring', size: 1.0 },
  '7-segment': { style: 'digital', size: 0.8 }
};

// Sound characters
const SOUND_CHARACTERS = {
  'ikeda-minimal': {
    description: 'Stark sine tones with silence',
    voices: ['pure-sine', 'short-burst'],
    density: 0.3,
    fx: ['none', 'slight-reverb']
  },
  'alva-noto': {
    description: 'Micro-clicks and granular textures',
    voices: ['click', 'pop', 'micro-tone'],
    density: 0.5,
    fx: ['bitcrush-light', 'delay']
  },
  'bytebeat-glitch': {
    description: 'Crunchy 8-bit formulas',
    voices: ['bytebeat', 'square-glitch'],
    density: 0.7,
    fx: ['bitcrush-heavy', 'distortion']
  },
  'fm-noise': {
    description: 'FM synthesis with noise bursts',
    voices: ['fm-bell', 'noise-burst', 'fm-bass'],
    density: 0.6,
    fx: ['filter-sweep', 'reverb']
  }
};

// Shape generators
const SHAPE_TYPES = ['organic', 'geometric', 'brutalist', 'mixed'];

function generateFeatures() {
  R = initRandom(hash);

  // Visual traits
  const colorRarity = rollRarity(0.40, 0.30, 0.20, 0.10);
  const colorSchemes = {
    'common': 'black-white',
    'uncommon': 'industrial',
    'rare': 'dark-brass',
    'legendary': 'colorful-vintage'
  };

  const shapeRarity = rollRarity(0.35, 0.30, 0.25, 0.10);
  const shapes = {
    'common': 'geometric',
    'uncommon': 'brutalist',
    'rare': 'organic',
    'legendary': 'mixed'
  };

  // Always 1 pedal
  const pedalCount = 1;

  const knobRarity = rollRarity(0.50, 0.25, 0.15, 0.10);
  const knobSets = {
    'common': ['chicken-head', 'davies-skirted'],
    'uncommon': ['mxr-hex', 'moog-bakelite'],
    'rare': ['davies-skirted', 'moog-bakelite', 'backlit-ring'],
    'legendary': ['backlit-ring', '7-segment', 'moog-bakelite']
  };

  // Audio traits
  const soundRarity = rollRarity(0.30, 0.30, 0.25, 0.15);
  const sounds = {
    'common': 'ikeda-minimal',
    'uncommon': 'alva-noto',
    'rare': 'fm-noise',
    'legendary': 'bytebeat-glitch'
  };

  // Musical parameters
  const tempoBase = rndChoice([60, 72, 80, 90, 100, 110, 120, 140]);
  const scaleType = rndChoice(['chromatic', 'pentatonic', 'whole-tone', 'diminished', 'microtonal']);
  const rootNote = rndChoice(['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']);
  const octaveRange = rndChoice([[2, 4], [3, 5], [1, 6], [4, 7]]);

  // Sequence parameters
  const patternLength = rndChoice([8, 12, 16, 24, 32, 64]);
  const restProbability = rnd(0.1, 0.5);
  const accentProbability = rnd(0.1, 0.3);

  // Effects parameters
  const reverbAmount = rnd(0, 0.4);
  const delayTime = rndChoice([0, '8n', '8n.', '4n', '16n']);
  const filterFreq = rndInt(200, 8000);

  features = {
    // Visual
    colorScheme: colorSchemes[colorRarity],
    colorRarity,
    shape: shapes[shapeRarity],
    shapeRarity,
    pedalCount,
    knobSet: knobSets[knobRarity],
    knobRarity,

    // Audio
    soundCharacter: sounds[soundRarity],
    soundRarity,
    tempo: tempoBase,
    scale: scaleType,
    rootNote,
    octaveRange,
    patternLength,
    restProbability,
    accentProbability,

    // Effects
    reverbAmount,
    delayTime,
    filterFreq,

    // Generate unique pedal configs
    pedals: []
  };

  // Generate individual pedal configurations
  for (let i = 0; i < features.pedalCount; i++) {
    features.pedals.push(generatePedalConfig(i));
  }

  originalFeatures = JSON.parse(JSON.stringify(features));
  return features;
}

function generatePedalConfig(index) {
  const colors = COLOR_SCHEMES[features.colorScheme];
  const enclosureColor = rndChoice(colors.enclosure);

  // Determine layout configuration
  const hasScope = rndBool(0.6);
  const has7Seg = features.knobRarity === 'legendary' && rndBool(0.5);

  // Shape parameters based on type
  let shapeParams = {};
  const shapeType = features.shape === 'mixed' ? rndChoice(['organic', 'geometric', 'brutalist']) : features.shape;

  if (shapeType === 'organic') {
    shapeParams = {
      type: 'organic',
      blobiness: rnd(0.2, 0.4),
      points: rndInt(8, 14),
      smoothing: rnd(0.6, 0.9)
    };
  } else if (shapeType === 'geometric') {
    shapeParams = {
      type: 'geometric',
      sides: rndChoice([4, 5, 6, 8]),
      skew: rnd(-0.15, 0.15),
      rotation: rnd(-Math.PI / 12, Math.PI / 12)
    };
  } else {
    shapeParams = {
      type: 'brutalist',
      chunks: rndInt(2, 4),
      offsetRange: rnd(0.05, 0.15)
    };
  }

  // GRID-BASED KNOB LAYOUT
  // Define layout zones (normalized 0-1 coordinates relative to pedal)
  const layout = {
    titleY: 0.06,
    displayY: hasScope ? 0.18 : 0.12,
    displayH: hasScope ? 0.15 : 0,
    knobsStartY: hasScope ? 0.38 : 0.18,
    knobsEndY: 0.72,
    ledsY: 0.78,
    footswitchY: 0.88
  };

  // Generate knobs in a structured grid
  const knobLabels = ['FREQ', 'TONE', 'GAIN', 'RATE', 'DEPTH', 'MIX', 'DECAY', 'DRIVE'];
  const shuffledLabels = knobLabels.sort(() => R() - 0.5);

  // Choose grid layout: 2x2, 2x3, or 3x2 based on random
  const gridLayouts = [
    { cols: 2, rows: 2 }, // 4 knobs
    { cols: 3, rows: 2 }, // 6 knobs
    { cols: 2, rows: 3 }, // 6 knobs
    { cols: 4, rows: 2 }, // 8 knobs
  ];
  const grid = rndChoice(gridLayouts);
  const knobCount = grid.cols * grid.rows;

  const knobs = [];
  const knobAreaHeight = layout.knobsEndY - layout.knobsStartY;
  const marginX = 0.15;
  const marginY = 0.05;

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const knobIndex = row * grid.cols + col;
      if (knobIndex >= knobCount) break;

      // Calculate grid position with margins
      const cellWidth = (1 - marginX * 2) / grid.cols;
      const cellHeight = knobAreaHeight / grid.rows;

      const x = marginX + cellWidth * (col + 0.5);
      const y = layout.knobsStartY + cellHeight * (row + 0.5);

      // Assign knob type from the set, cycling through
      const knobType = features.knobSet[knobIndex % features.knobSet.length];

      knobs.push({
        x,
        y,
        type: knobType,
        value: rnd(0.2, 0.8),
        label: shuffledLabels[knobIndex % shuffledLabels.length]
      });
    }
  }

  // LED positions - evenly spaced row
  const ledCount = rndInt(2, 4);
  const leds = [];
  for (let l = 0; l < ledCount; l++) {
    leds.push({
      x: 0.2 + (0.6 / (ledCount - 1 || 1)) * l,
      y: layout.ledsY,
      color: rndBool(0.7) ? colors.led : (rndBool(0.5) ? '#ff3333' : '#00ff00')
    });
  }

  return {
    index,
    name: generatePedalName(),
    enclosureColor,
    shapeParams,
    knobs,
    leds,
    hasScope,
    has7Seg,
    layout,
    footswitchY: layout.footswitchY,
    active: true
  };
}

function generatePedalName() {
  const prefixes = ['DT-', 'NX-', 'SIG-', 'VX-', 'μ', 'Σ', 'Ω', 'π', 'DATA.', 'FLUX-'];
  const numbers = ['01', '23', '47', '88', '99', '∞', 'X', 'II', 'III'];
  return rndChoice(prefixes) + rndChoice(numbers);
}

// ============================================================================
// CANVAS & RENDERING
// ============================================================================

let canvas, ctx;
let width = 700;
let height = 700;
let pedals = [];
let audioEngine = null;
let isPlaying = false;
let animationId = null;
let mouseX = 0, mouseY = 0;
let draggedKnob = null;
let hoveredElement = null;
let scopeData = new Float32Array(128);
let time = 0;

function init() {
  generateFeatures();

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  resize();
  window.addEventListener('resize', resize);

  // Mouse events
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseUp);

  // Touch events
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);

  // Keyboard
  document.addEventListener('keydown', onKeyDown);

  // Build pedal objects
  buildPedals();

  // Start render loop
  render();

  // Update UI
  updateFeaturesDisplay();
}

function resize() {
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth, container.clientHeight, 700);
  width = size;
  height = size;
  canvas.width = size;
  canvas.height = size;
}

function buildPedals() {
  pedals = [];
  const colors = COLOR_SCHEMES[features.colorScheme];

  if (features.pedalCount === 1) {
    // Single large pedal centered
    pedals.push({
      ...features.pedals[0],
      x: width * 0.15,
      y: height * 0.1,
      w: width * 0.7,
      h: height * 0.8
    });
  } else {
    // Multiple pedals arranged horizontally
    const pedalWidth = (width * 0.85) / features.pedalCount;
    const margin = width * 0.05;

    for (let i = 0; i < features.pedalCount; i++) {
      pedals.push({
        ...features.pedals[i],
        x: margin + i * pedalWidth + (pedalWidth * 0.05),
        y: height * 0.15,
        w: pedalWidth * 0.9,
        h: height * 0.7
      });
    }
  }
}

// ============================================================================
// RENDERING
// ============================================================================

function render() {
  time += 0.016;

  const colors = COLOR_SCHEMES[features.colorScheme];

  // Clear
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  // Draw pedalboard
  drawPedalboard(colors);

  // Draw pedals
  for (const pedal of pedals) {
    drawPedal(pedal, colors);
  }

  // Draw cables (decorative)
  drawCables(colors);

  animationId = requestAnimationFrame(render);
}

function drawPedalboard(colors) {
  // Wood/metal texture background
  ctx.fillStyle = colors.pedalboard;
  ctx.fillRect(0, 0, width, height);

  // Add subtle texture
  ctx.save();
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 50; i++) {
    const x = (hash.charCodeAt(i % hash.length) * 17) % width;
    const y = (hash.charCodeAt((i + 10) % hash.length) * 23) % height;
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.restore();

  // Screws in corners
  const screwPositions = [[20, 20], [width - 20, 20], [20, height - 20], [width - 20, height - 20]];
  for (const [sx, sy] of screwPositions) {
    drawScrew(sx, sy, colors);
  }
}

function drawScrew(x, y, colors) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#3a3a3a';
  ctx.fill();
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cross slot
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 3, y);
  ctx.lineTo(x + 3, y);
  ctx.moveTo(x, y - 3);
  ctx.lineTo(x, y + 3);
  ctx.stroke();
  ctx.restore();
}

function drawPedal(pedal, colors) {
  ctx.save();

  const { x, y, w, h, shapeParams, enclosureColor, layout } = pedal;

  // Draw enclosure shape
  ctx.beginPath();
  drawEnclosureShape(x, y, w, h, shapeParams);

  // Fill with gradient
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, lightenColor(enclosureColor, 20));
  grad.addColorStop(0.5, enclosureColor);
  grad.addColorStop(1, darkenColor(enclosureColor, 30));
  ctx.fillStyle = grad;
  ctx.fill();

  // Edge highlight
  ctx.strokeStyle = lightenColor(enclosureColor, 40);
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner bevel
  ctx.strokeStyle = darkenColor(enclosureColor, 20);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Pedal name
  ctx.fillStyle = colors.text;
  ctx.font = `bold ${Math.max(14, w * 0.07)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  ctx.fillText(pedal.name, x + w / 2, y + h * layout.titleY + 15);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Draw scope if present (before knobs so they can overlap slightly)
  if (pedal.hasScope) {
    const scopeX = x + w * 0.15;
    const scopeY = y + h * layout.displayY;
    const scopeW = w * 0.7;
    const scopeH = h * layout.displayH;
    drawScope(scopeX, scopeY, scopeW, scopeH, colors, pedal.active && isPlaying);
  }

  // Draw 7-segment display if present (next to scope or alone)
  if (pedal.has7Seg) {
    const segX = pedal.hasScope ? x + w * 0.72 : x + w * 0.35;
    const segY = y + h * layout.displayY;
    const segW = pedal.hasScope ? w * 0.2 : w * 0.3;
    draw7Segment(segX, segY, segW, features.tempo.toString(), colors);
  }

  // Draw knobs with proper sizing
  const baseKnobSize = Math.min(w, h) * 0.09;
  for (const knob of pedal.knobs) {
    const kx = x + knob.x * w;
    const ky = y + knob.y * h;
    const size = baseKnobSize * KNOB_TYPES[knob.type].size;
    drawKnob(kx, ky, size, knob, colors, pedal);
  }

  // Draw LEDs
  for (let i = 0; i < pedal.leds.length; i++) {
    const led = pedal.leds[i];
    const lx = x + led.x * w;
    const ly = y + led.y * h;
    const isOn = pedal.active && (isPlaying || Math.sin(time * 3 + i) > 0.5);
    drawLED(lx, ly, led.color, isOn, 8);
  }

  // Draw footswitch
  const fsX = x + w / 2;
  const fsY = y + pedal.footswitchY * h;
  drawFootswitch(fsX, fsY, Math.min(w, h) * 0.1, pedal, colors);

  ctx.restore();
}

function drawEnclosureShape(x, y, w, h, params) {
  if (params.type === 'organic') {
    drawOrganicShape(x, y, w, h, params);
  } else if (params.type === 'geometric') {
    drawGeometricShape(x, y, w, h, params);
  } else {
    drawBrutalistShape(x, y, w, h, params);
  }
}

function drawOrganicShape(x, y, w, h, params) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const points = [];

  for (let i = 0; i < params.points; i++) {
    const angle = (i / params.points) * Math.PI * 2 - Math.PI / 2;
    const radiusX = w / 2 * (0.85 + Math.sin(angle * 3 + hash.charCodeAt(i % 64) * 0.01) * params.blobiness * 0.3);
    const radiusY = h / 2 * (0.85 + Math.cos(angle * 2 + hash.charCodeAt((i + 10) % 64) * 0.01) * params.blobiness * 0.3);
    points.push({
      x: cx + Math.cos(angle) * radiusX,
      y: cy + Math.sin(angle) * radiusY
    });
  }

  // Draw smooth curve through points
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length; i++) {
    const p0 = points[(i - 1 + points.length) % points.length];
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];

    const cp1x = p1.x + (p2.x - p0.x) * params.smoothing * 0.2;
    const cp1y = p1.y + (p2.y - p0.y) * params.smoothing * 0.2;
    const cp2x = p2.x - (p3.x - p1.x) * params.smoothing * 0.2;
    const cp2y = p2.y - (p3.y - p1.y) * params.smoothing * 0.2;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  ctx.closePath();
}

function drawGeometricShape(x, y, w, h, params) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const sides = params.sides;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(params.rotation);
  ctx.scale(1 + params.skew, 1 - params.skew * 0.5);

  ctx.moveTo(0, -h / 2 * 0.9);
  for (let i = 1; i <= sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const rx = w / 2 * 0.9;
    const ry = h / 2 * 0.9;
    ctx.lineTo(Math.cos(angle) * rx, Math.sin(angle) * ry);
  }
  ctx.closePath();
  ctx.restore();
}

function drawBrutalistShape(x, y, w, h, params) {
  // Chunky asymmetric rectangles
  const chunks = params.chunks;
  const offset = params.offsetRange;

  ctx.moveTo(x + w * offset * (hash.charCodeAt(0) % 10) / 10, y);
  ctx.lineTo(x + w - w * offset * (hash.charCodeAt(1) % 10) / 10, y + h * 0.05);
  ctx.lineTo(x + w + w * offset * (hash.charCodeAt(2) % 10) / 20, y + h * 0.4);
  ctx.lineTo(x + w - w * offset * (hash.charCodeAt(3) % 10) / 15, y + h);
  ctx.lineTo(x + w * offset * (hash.charCodeAt(4) % 10) / 10, y + h - h * 0.03);
  ctx.lineTo(x - w * offset * (hash.charCodeAt(5) % 10) / 20, y + h * 0.5);
  ctx.closePath();
}

function drawKnob(x, y, size, knob, colors, pedal) {
  const type = KNOB_TYPES[knob.type];
  const isHovered = hoveredElement && hoveredElement.type === 'knob' && hoveredElement.knob === knob;
  const isDragging = draggedKnob && draggedKnob.knob === knob;

  ctx.save();
  ctx.translate(x, y);

  // Draw based on knob type
  switch (knob.type) {
    case 'chicken-head':
      drawChickenHeadKnob(size, knob.value, colors, isHovered || isDragging);
      break;
    case 'davies-skirted':
      drawDaviesSkirted(size, knob.value, colors, isHovered || isDragging);
      break;
    case 'mxr-hex':
      drawMXRHexKnob(size, knob.value, colors, isHovered || isDragging);
      break;
    case 'moog-bakelite':
      drawMoogBakelite(size, knob.value, colors, isHovered || isDragging);
      break;
    case 'backlit-ring':
      drawLEDRingKnob(size, knob.value, colors, isHovered || isDragging);
      break;
    case '7-segment':
      drawDigitalKnob(size, knob.value, colors, isHovered || isDragging);
      break;
    default:
      drawChickenHeadKnob(size, knob.value, colors, isHovered || isDragging);
  }

  // Label below knob
  ctx.fillStyle = colors.text;
  ctx.font = `bold ${Math.max(9, size * 0.35)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 2;
  ctx.fillText(knob.label, 0, size + 14);
  ctx.shadowBlur = 0;

  ctx.restore();
}

// CHICKEN HEAD KNOB - classic pointer knob
function drawChickenHeadKnob(size, value, colors, isActive) {
  const angle = -Math.PI * 0.75 + value * Math.PI * 1.5;

  // Shadow
  ctx.beginPath();
  ctx.arc(2, 3, size, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fill();

  // Base plate / skirt
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.1, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Main knob body - dark with lighter top
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  const knobGrad = ctx.createRadialGradient(-size * 0.2, -size * 0.3, 0, 0, 0, size);
  knobGrad.addColorStop(0, '#4a4a4a');
  knobGrad.addColorStop(0.5, '#2a2a2a');
  knobGrad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = knobGrad;
  ctx.fill();

  if (isActive) {
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Pointer (chicken head shape)
  ctx.save();
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.9);
  ctx.lineTo(-size * 0.25, -size * 0.1);
  ctx.lineTo(-size * 0.15, size * 0.3);
  ctx.lineTo(size * 0.15, size * 0.3);
  ctx.lineTo(size * 0.25, -size * 0.1);
  ctx.closePath();
  ctx.fillStyle = '#e8e8e8';
  ctx.fill();
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

// DAVIES SKIRTED - large skirted knob with white line
function drawDaviesSkirted(size, value, colors, isActive) {
  const angle = -Math.PI * 0.75 + value * Math.PI * 1.5;

  // Shadow
  ctx.beginPath();
  ctx.arc(3, 4, size * 1.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();

  // Large outer skirt
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.15, 0, Math.PI * 2);
  const skirtGrad = ctx.createLinearGradient(-size, -size, size, size);
  skirtGrad.addColorStop(0, '#3a3a3a');
  skirtGrad.addColorStop(0.5, '#252525');
  skirtGrad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = skirtGrad;
  ctx.fill();

  // Grooves on skirt (radial lines)
  ctx.save();
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * size * 0.85, Math.sin(a) * size * 0.85);
    ctx.lineTo(Math.cos(a) * size * 1.1, Math.sin(a) * size * 1.1);
    ctx.stroke();
  }
  ctx.restore();

  // Inner cap
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
  const capGrad = ctx.createRadialGradient(-size * 0.1, -size * 0.2, 0, 0, 0, size * 0.6);
  capGrad.addColorStop(0, '#555');
  capGrad.addColorStop(1, '#222');
  ctx.fillStyle = capGrad;
  ctx.fill();

  if (isActive) {
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // White indicator line
  ctx.save();
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.3);
  ctx.lineTo(0, -size * 1.05);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

// MXR HEX KNOB - hexagonal shape with notches
function drawMXRHexKnob(size, value, colors, isActive) {
  const angle = -Math.PI * 0.75 + value * Math.PI * 1.5;

  // Shadow
  ctx.save();
  ctx.translate(2, 3);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * size;
    const py = Math.sin(a) * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fill();
  ctx.restore();

  // Hexagonal body
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * size;
    const py = Math.sin(a) * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  const hexGrad = ctx.createLinearGradient(-size, -size, size, size);
  hexGrad.addColorStop(0, '#4a4a4a');
  hexGrad.addColorStop(0.5, '#2a2a2a');
  hexGrad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = hexGrad;
  ctx.fill();

  if (isActive) {
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
  } else {
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
  }
  ctx.stroke();

  // Notches on each edge
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * size * 0.7, Math.sin(a) * size * 0.7);
    ctx.lineTo(Math.cos(a) * size * 0.95, Math.sin(a) * size * 0.95);
    ctx.stroke();
  }

  // Center dot
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();

  // Indicator line
  ctx.save();
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.25);
  ctx.lineTo(0, -size * 0.85);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 3;
  ctx.lineCap = 'butt';
  ctx.stroke();
  ctx.restore();
}

// MOOG BAKELITE - vintage brown knob with white pointer dot
function drawMoogBakelite(size, value, colors, isActive) {
  const angle = -Math.PI * 0.75 + value * Math.PI * 1.5;

  // Shadow
  ctx.beginPath();
  ctx.arc(2, 3, size, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fill();

  // Main body - brown bakelite color
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  const bakeGrad = ctx.createRadialGradient(-size * 0.3, -size * 0.3, 0, 0, 0, size);
  bakeGrad.addColorStop(0, '#6b4423');
  bakeGrad.addColorStop(0.6, '#4a2f17');
  bakeGrad.addColorStop(1, '#3a2010');
  ctx.fillStyle = bakeGrad;
  ctx.fill();

  if (isActive) {
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Ribbed texture (concentric circles)
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  for (let r = size * 0.3; r < size; r += size * 0.12) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // White pointer dot
  ctx.save();
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.arc(0, -size * 0.65, size * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = '#f5f5f5';
  ctx.fill();
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Center indent
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#2a1a0a';
  ctx.fill();
}

// LED RING KNOB - modern encoder with LED segments
function drawLEDRingKnob(size, value, colors, isActive) {
  // Shadow
  ctx.beginPath();
  ctx.arc(2, 3, size * 1.1, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();

  // Outer ring
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.1, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.stroke();

  // LED segments
  const segments = 11;
  const activeSegments = Math.floor(value * segments);
  const startAngle = -Math.PI * 0.75;
  const totalAngle = Math.PI * 1.5;
  const segmentAngle = totalAngle / segments;
  const gap = 0.03;

  for (let i = 0; i < segments; i++) {
    const a1 = startAngle + i * segmentAngle + gap;
    const a2 = startAngle + (i + 1) * segmentAngle - gap;

    ctx.beginPath();
    ctx.arc(0, 0, size * 1.0, a1, a2);
    ctx.arc(0, 0, size * 0.75, a2, a1, true);
    ctx.closePath();

    if (i <= activeSegments) {
      // Gradient from green to yellow to red
      const hue = 120 - (i / segments) * 120;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = '#1a1a1a';
      ctx.shadowBlur = 0;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Center knob
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
  const centerGrad = ctx.createRadialGradient(0, -size * 0.1, 0, 0, 0, size * 0.55);
  centerGrad.addColorStop(0, '#3a3a3a');
  centerGrad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = centerGrad;
  ctx.fill();

  if (isActive) {
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Center dot
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();
}

// DIGITAL KNOB - 7-segment style display
function drawDigitalKnob(size, value, colors, isActive) {
  const displayVal = Math.floor(value * 99).toString().padStart(2, '0');

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(-size * 1.1 + 2, -size * 0.6 + 3, size * 2.2, size * 1.2);

  // Display housing
  ctx.fillStyle = '#0a0a0a';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-size * 1.1, -size * 0.6, size * 2.2, size * 1.2, 4);
  ctx.fill();
  ctx.stroke();

  // Inner display area
  ctx.fillStyle = '#050505';
  ctx.fillRect(-size * 0.95, -size * 0.45, size * 1.9, size * 0.9);

  // Display value with glow
  ctx.fillStyle = colors.led;
  ctx.font = `bold ${size * 1.0}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = colors.led;
  ctx.shadowBlur = 10;
  ctx.fillText(displayVal, 0, 0);
  ctx.shadowBlur = 0;

  // Small indicator LEDs
  const ledColors = ['#ff0000', '#00ff00'];
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.arc(-size * 0.7 + i * size * 1.4, size * 0.35, 3, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? (value < 0.5 ? ledColors[0] : '#300') : (value >= 0.5 ? ledColors[1] : '#030');
    if ((i === 0 && value < 0.5) || (i === 1 && value >= 0.5)) {
      ctx.shadowColor = ledColors[i];
      ctx.shadowBlur = 5;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  if (isActive) {
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-size * 1.1, -size * 0.6, size * 2.2, size * 1.2, 4);
    ctx.stroke();
  }
}

function drawLED(x, y, color, isOn, size = 6) {
  ctx.save();

  // LED bezel
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.stroke();

  // LED lens
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);

  if (isOn) {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
  } else {
    ctx.fillStyle = darkenColor(color, 70);
    ctx.shadowBlur = 0;
  }
  ctx.fill();
  ctx.shadowBlur = 0;

  // Highlight
  ctx.beginPath();
  ctx.arc(x - size * 0.15, y - size * 0.15, size * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();

  ctx.restore();
}

function drawScope(x, y, w, h, colors, isActive) {
  ctx.save();

  // Screen bezel
  ctx.fillStyle = '#0a0a0a';
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 2;
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.strokeRect(x - 4, y - 4, w + 8, h + 8);

  // Screen background
  ctx.fillStyle = '#050a05';
  ctx.fillRect(x, y, w, h);

  // Grid lines
  ctx.strokeStyle = '#0a2a0a';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + (h / 4) * i);
    ctx.lineTo(x + w, y + (h / 4) * i);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + (w / 4) * i, y);
    ctx.lineTo(x + (w / 4) * i, y + h);
    ctx.stroke();
  }

  // Waveform
  if (isActive) {
    ctx.beginPath();
    ctx.strokeStyle = colors.led;
    ctx.shadowColor = colors.led;
    ctx.shadowBlur = 3;
    ctx.lineWidth = 1.5;

    for (let i = 0; i < w; i++) {
      const dataIndex = Math.floor((i / w) * scopeData.length);
      const val = scopeData[dataIndex] || Math.sin(time * 10 + i * 0.1) * 0.5;
      const py = y + h / 2 - val * h * 0.4;

      if (i === 0) ctx.moveTo(x + i, py);
      else ctx.lineTo(x + i, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function draw7Segment(x, y, w, value, colors) {
  ctx.save();

  // Display background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(x - 4, y - 4, w + 8, w * 0.6 + 8);

  // Display value
  ctx.fillStyle = colors.led;
  ctx.shadowColor = colors.led;
  ctx.shadowBlur = 3;
  ctx.font = `bold ${w * 0.4}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(value, x + w / 2, y + w * 0.35);
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawFootswitch(x, y, size, pedal, colors) {
  const isHovered = hoveredElement && hoveredElement.type === 'footswitch' && hoveredElement.pedal === pedal;

  ctx.save();

  // Shadow
  ctx.beginPath();
  ctx.arc(x + 2, y + 2, size, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fill();

  // Button housing
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  const fsGrad = ctx.createRadialGradient(x, y - size * 0.3, 0, x, y, size);
  fsGrad.addColorStop(0, '#5a5a5a');
  fsGrad.addColorStop(0.5, '#3a3a3a');
  fsGrad.addColorStop(1, '#2a2a2a');
  ctx.fillStyle = fsGrad;
  ctx.fill();

  // Button top
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  const topGrad = ctx.createRadialGradient(x, y - size * 0.2, 0, x, y, size * 0.7);

  if (pedal.active) {
    topGrad.addColorStop(0, lightenColor(colors.accent, 20));
    topGrad.addColorStop(1, colors.accent);
  } else {
    topGrad.addColorStop(0, '#4a4a4a');
    topGrad.addColorStop(1, '#2a2a2a');
  }
  ctx.fillStyle = topGrad;
  ctx.fill();

  if (isHovered) {
    ctx.strokeStyle = colors.led;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

function drawCables(colors) {
  // Decorative patch cables between pedals
  if (pedals.length < 2) return;

  ctx.save();
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  for (let i = 0; i < pedals.length - 1; i++) {
    const p1 = pedals[i];
    const p2 = pedals[i + 1];

    const x1 = p1.x + p1.w;
    const y1 = p1.y + p1.h * 0.5;
    const x2 = p2.x;
    const y2 = p2.y + p2.h * 0.5;

    // Cable sag
    const midX = (x1 + x2) / 2;
    const midY = Math.max(y1, y2) + 30;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(midX, midY, x2, y2);
    ctx.stroke();

    // Jack plugs
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(x1, y1, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x2, y2, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// ============================================================================
// AUDIO ENGINE (Tone.js)
// ============================================================================

async function initAudio() {
  if (audioEngine) return;

  await Tone.start();

  const soundConfig = SOUND_CHARACTERS[features.soundCharacter];

  // Master chain
  const masterGain = new Tone.Gain(0.7).toDestination();
  const reverb = new Tone.Reverb({ decay: 2, wet: features.reverbAmount }).connect(masterGain);
  const delay = new Tone.FeedbackDelay({ delayTime: features.delayTime || 0.01, feedback: 0.2, wet: 0.15 }).connect(reverb);
  const filter = new Tone.Filter({ frequency: features.filterFreq, type: 'lowpass' }).connect(delay);
  const analyser = new Tone.Analyser('waveform', 128);
  filter.connect(analyser);

  // Create voices based on sound character
  const voices = [];

  if (features.soundCharacter === 'ikeda-minimal') {
    // Pure sine oscillators
    const sine = new Tone.Oscillator({ type: 'sine', volume: -12 }).connect(filter);
    voices.push({ type: 'sine', synth: sine });

    const noiseBurst = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0 }, volume: -20 }).connect(filter);
    voices.push({ type: 'noise', synth: noiseBurst });
  }
  else if (features.soundCharacter === 'alva-noto') {
    // Click synth
    const click = new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 2, envelope: { attack: 0.001, decay: 0.05, sustain: 0 }, volume: -15 }).connect(filter);
    voices.push({ type: 'click', synth: click });

    // Micro tone
    const micro = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }, volume: -18 }).connect(filter);
    voices.push({ type: 'micro', synth: micro });
  }
  else if (features.soundCharacter === 'bytebeat-glitch') {
    // Bitcrushed square
    const bitcrusher = new Tone.BitCrusher(4).connect(filter);
    const square = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.1 }, volume: -15 }).connect(bitcrusher);
    voices.push({ type: 'square', synth: square });

    // Glitch noise
    const glitchNoise = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0 }, volume: -18 }).connect(bitcrusher);
    voices.push({ type: 'glitch', synth: glitchNoise });
  }
  else if (features.soundCharacter === 'fm-noise') {
    // FM synth
    const fm = new Tone.FMSynth({ harmonicity: 3, modulationIndex: 10, envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 }, volume: -12 }).connect(filter);
    voices.push({ type: 'fm', synth: fm });

    // Noise burst
    const noise = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.15, sustain: 0 }, volume: -18 }).connect(filter);
    voices.push({ type: 'noise', synth: noise });
  }

  // Generate pattern from hash
  const pattern = generatePattern();

  // Sequencer
  let stepIndex = 0;
  const seq = new Tone.Loop((time) => {
    const step = pattern[stepIndex % pattern.length];

    if (step && step.note !== null) {
      const voice = voices.find(v => v.type === step.voice) || voices[0];

      if (voice.synth.triggerAttackRelease) {
        voice.synth.triggerAttackRelease(step.note, step.duration, time, step.velocity);
      } else if (voice.synth.start) {
        voice.synth.start(time);
        voice.synth.stop(time + Tone.Time(step.duration).toSeconds());
      }
    }

    stepIndex++;
  }, '16n');

  // Update scope data
  Tone.Transport.scheduleRepeat((time) => {
    scopeData = analyser.getValue();
  }, 0.05);

  audioEngine = {
    masterGain,
    reverb,
    delay,
    filter,
    analyser,
    voices,
    seq,
    pattern
  };

  Tone.Transport.bpm.value = features.tempo;
}

function generatePattern() {
  // Re-seed for pattern generation
  const patternR = initRandom(hash);
  const pattern = [];

  const notes = generateScale(features.rootNote, features.scale, features.octaveRange);
  const soundConfig = SOUND_CHARACTERS[features.soundCharacter];
  const voiceTypes = soundConfig.voices.map(v => {
    if (v.includes('sine') || v.includes('tone')) return 'sine';
    if (v.includes('click') || v.includes('pop')) return 'click';
    if (v.includes('micro')) return 'micro';
    if (v.includes('square') || v.includes('byte')) return 'square';
    if (v.includes('glitch')) return 'glitch';
    if (v.includes('fm')) return 'fm';
    return 'noise';
  });

  // Generate very long pattern (hash-locked, deterministic)
  const totalSteps = features.patternLength * 64; // Long cycle

  for (let i = 0; i < totalSteps; i++) {
    const roll = patternR();

    if (roll < features.restProbability) {
      pattern.push({ note: null });
    } else {
      const noteIndex = Math.floor(patternR() * notes.length);
      const voiceIndex = Math.floor(patternR() * voiceTypes.length);
      const isAccent = patternR() < features.accentProbability;

      pattern.push({
        note: notes[noteIndex],
        voice: voiceTypes[voiceIndex],
        duration: ['32n', '16n', '8n'][Math.floor(patternR() * 3)],
        velocity: isAccent ? 0.9 : 0.5 + patternR() * 0.3
      });
    }
  }

  return pattern;
}

function generateScale(root, scaleType, octaveRange) {
  const rootMidi = Tone.Frequency(root + '4').toMidi();
  const notes = [];

  let intervals;
  switch (scaleType) {
    case 'pentatonic': intervals = [0, 2, 4, 7, 9]; break;
    case 'whole-tone': intervals = [0, 2, 4, 6, 8, 10]; break;
    case 'diminished': intervals = [0, 2, 3, 5, 6, 8, 9, 11]; break;
    case 'microtonal': intervals = [0, 1, 3, 4, 6, 7, 9, 10]; break;
    default: intervals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // chromatic
  }

  for (let oct = octaveRange[0]; oct <= octaveRange[1]; oct++) {
    for (const interval of intervals) {
      const midi = rootMidi + (oct - 4) * 12 + interval;
      notes.push(Tone.Frequency(midi, 'midi').toNote());
    }
  }

  return notes;
}

async function togglePlay() {
  if (!audioEngine) {
    await initAudio();
  }

  if (isPlaying) {
    Tone.Transport.stop();
    audioEngine.seq.stop();
    isPlaying = false;
  } else {
    audioEngine.seq.start(0);
    Tone.Transport.start();
    isPlaying = true;
  }

  updatePlayButton();
}

function updatePlayButton() {
  const btn = document.getElementById('btn-play');
  if (btn) {
    btn.textContent = isPlaying ? 'Stop' : 'Play';
  }
}

// ============================================================================
// INTERACTION
// ============================================================================

function onMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  // Check footswitches first
  for (const pedal of pedals) {
    const fsX = pedal.x + pedal.w / 2;
    const fsY = pedal.y + pedal.footswitchY * pedal.h;
    const fsSize = Math.min(pedal.w, pedal.h) * 0.1;

    if (Math.hypot(x - fsX, y - fsY) < fsSize) {
      pedal.active = !pedal.active;
      return;
    }
  }

  // Check knobs (separate loop to prioritize knobs over footswitch area)
  for (const pedal of pedals) {
    const baseKnobSize = Math.min(pedal.w, pedal.h) * 0.09;

    for (const knob of pedal.knobs) {
      const kx = pedal.x + knob.x * pedal.w;
      const ky = pedal.y + knob.y * pedal.h;
      const kSize = baseKnobSize * KNOB_TYPES[knob.type].size * 1.2; // Slightly larger hit area

      if (Math.hypot(x - kx, y - ky) < kSize) {
        draggedKnob = { pedal, knob, startY: y, startValue: knob.value };
        canvas.style.cursor = 'ns-resize';
        return;
      }
    }
  }
}

function onMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  mouseX = x;
  mouseY = y;

  // Handle dragging
  if (draggedKnob) {
    const delta = (draggedKnob.startY - y) / 100; // More sensitive
    draggedKnob.knob.value = Math.max(0, Math.min(1, draggedKnob.startValue + delta));
    hasOverrides = true;
    return;
  }

  // Update hover state
  hoveredElement = null;

  for (const pedal of pedals) {
    const baseKnobSize = Math.min(pedal.w, pedal.h) * 0.09;

    // Check knobs first (higher priority)
    for (const knob of pedal.knobs) {
      const kx = pedal.x + knob.x * pedal.w;
      const ky = pedal.y + knob.y * pedal.h;
      const kSize = baseKnobSize * KNOB_TYPES[knob.type].size * 1.2;

      if (Math.hypot(x - kx, y - ky) < kSize) {
        hoveredElement = { type: 'knob', pedal, knob };
        canvas.style.cursor = 'ns-resize';
        return;
      }
    }

    // Check footswitch
    const fsX = pedal.x + pedal.w / 2;
    const fsY = pedal.y + pedal.footswitchY * pedal.h;
    const fsSize = Math.min(pedal.w, pedal.h) * 0.1;

    if (Math.hypot(x - fsX, y - fsY) < fsSize) {
      hoveredElement = { type: 'footswitch', pedal };
      canvas.style.cursor = 'pointer';
      return;
    }
  }

  canvas.style.cursor = 'default';
}

function onMouseUp() {
  draggedKnob = null;
}

function onTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  onMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
}

function onTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
}

function onTouchEnd() {
  onMouseUp();
}

function onKeyDown(e) {
  if (e.key === 'r' || e.key === 'R') {
    regenerate();
  } else if (e.key === 's' || e.key === 'S') {
    saveImage();
  } else if (e.key === ' ') {
    e.preventDefault();
    togglePlay();
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

  // Stop audio
  if (isPlaying) {
    Tone.Transport.stop();
    if (audioEngine) audioEngine.seq.stop();
    isPlaying = false;
  }
  audioEngine = null;

  generateFeatures();
  buildPedals();
  updateFeaturesDisplay();
  updatePlayButton();
}

function saveImage() {
  const link = document.createElement('a');
  link.download = `data-stomp-${hash.slice(2, 10)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function updateFeaturesDisplay() {
  const table = document.getElementById('features-table');
  if (!table) return;

  const rarityClass = (rarity) => `rarity-${rarity}`;

  table.innerHTML = `
    <tr><td>Color Scheme</td><td><span class="${rarityClass(features.colorRarity)}">${features.colorScheme}</span></td></tr>
    <tr><td>Shape</td><td><span class="${rarityClass(features.shapeRarity)}">${features.shape}</span></td></tr>
    <tr><td>Knob Style</td><td><span class="${rarityClass(features.knobRarity)}">${features.knobSet.join(', ')}</span></td></tr>
    <tr><td>Sound</td><td><span class="${rarityClass(features.soundRarity)}">${features.soundCharacter}</span></td></tr>
    <tr><td>Tempo</td><td>${features.tempo} BPM</td></tr>
    <tr><td>Scale</td><td>${features.rootNote} ${features.scale}</td></tr>
    <tr><td>Pattern</td><td>${features.patternLength * 64} steps</td></tr>
  `;

  const hashDisplay = document.getElementById('hash-display');
  if (hashDisplay) {
    hashDisplay.textContent = hash.slice(0, 18) + '...';
  }
}

// ============================================================================
// EXPORTS FOR DEV MODE
// ============================================================================

window.dataStompSketch = {
  features: () => features,
  originalFeatures: () => originalFeatures,
  setParameter: (name, value) => {
    hasOverrides = true;
    features[name] = value;
    return features;
  },
  resetToOriginal: () => {
    features = JSON.parse(JSON.stringify(originalFeatures));
    hasOverrides = false;
    buildPedals();
    return features;
  },
  hasModifications: () => hasOverrides,
  regenerate,
  togglePlay,
  isPlaying: () => isPlaying
};

// Initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
