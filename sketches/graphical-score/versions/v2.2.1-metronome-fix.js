/**
 * Graphical Score v2.2.1
 * A generative graphical score with 7 distinct modes inspired by
 * 20th century avant-garde composers
 *
 * Modes: Artikulation, UPIC, Cluster, Graph, Chance, Spectral, Spiral
 * Features layered hybrid blending system
 *
 * v2.2.1: Fixed section markers, ASCII note values, expanded durations
 * v2.2.0: Refined paper aesthetics, fixed header layout, musical metadata
 * v2.1.0: Enhanced Spectral mode with engraved hatching, stippling,
 *         waterfall, formants, transients, and resonance bells
 *
 * @version 2.2.1
 */

// ============================================================
// HASH-BASED RANDOMNESS (Art Blocks Compatible)
// ============================================================

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
  for (let i = 2; i < 66; i += 8) {
    seeds.push(parseInt(hashStr.slice(i, i + 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

let R;

function rnd(min = 0, max = 1) {
  return R() * (max - min) + min;
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

function rndGaussian(mean = 0, stdDev = 1) {
  const u1 = R();
  const u2 = R();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z * stdDev + mean;
}

function rollRarity(common, uncommon, rare, legendary) {
  const roll = R();
  if (roll < legendary) return "legendary";
  if (roll < legendary + rare) return "rare";
  if (roll < legendary + rare + uncommon) return "uncommon";
  return "common";
}

function rndWeighted(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = R() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

// ============================================================
// COLOR PALETTES
// ============================================================

const PALETTES = {
  // Archival palettes
  sepia: {
    paper: "#f4efe4", paperDark: "#e8e0cf",
    ink: "#2a1f14", inkLight: "#5c4a3a",
    accent: "#8b4513", faded: "#9c8b7a",
    type: "archival"
  },
  manuscript: {
    paper: "#f5f0e1", paperDark: "#e5dcc8",
    ink: "#1a1a1a", inkLight: "#4a4a4a",
    accent: "#6b3a3a", faded: "#8a8070",
    type: "archival"
  },
  parchment: {
    paper: "#f2e8d5", paperDark: "#e0d4be",
    ink: "#3a2a1a", inkLight: "#6a5a4a",
    accent: "#7a4a2a", faded: "#a09080",
    type: "archival"
  },
  aged: {
    paper: "#ebe3d3", paperDark: "#d8ccb8",
    ink: "#2f2218", inkLight: "#5f5040",
    accent: "#704820", faded: "#907860",
    type: "archival"
  },
  blueprint: {
    paper: "#e8eef4", paperDark: "#d4dde8",
    ink: "#1a2f4a", inkLight: "#4a6080",
    accent: "#2f5070", faded: "#8090a0",
    type: "archival"
  },

  // Mode-authentic palettes
  wehinger: {
    // Artikulation colors from Wehinger's score
    paper: "#f8f6f0", paperDark: "#e8e4d8",
    ink: "#1a1a1a", inkLight: "#4a4a4a",
    accent: "#cc3333", faded: "#888888",
    colors: ["#cc3333", "#3366cc", "#33aa55", "#ffaa00", "#9944aa", "#ff6644", "#44aacc"],
    type: "authentic"
  },
  upicBlue: {
    // UPIC system blue plotting paper
    paper: "#d8e4f0", paperDark: "#c0d0e0",
    ink: "#0a1a3a", inkLight: "#2a4a6a",
    accent: "#1a4488", faded: "#6080a0",
    type: "authentic"
  },
  spectralHeat: {
    // Spectrogram heat colors
    paper: "#0a0a14", paperDark: "#050508",
    ink: "#ffffff", inkLight: "#aaaaaa",
    accent: "#ff4400", faded: "#444455",
    gradient: ["#000022", "#220044", "#440066", "#880044", "#cc2200", "#ff4400", "#ffaa00", "#ffff88"],
    type: "authentic"
  },
  crumbRitual: {
    // George Crumb's mystical scores
    paper: "#1a1820", paperDark: "#100e14",
    ink: "#d4c4a8", inkLight: "#8a7a5a",
    accent: "#8b0000", faded: "#5a4a3a",
    type: "authentic"
  },
  cageTransparent: {
    // Cage's transparent overlay aesthetic
    paper: "#fafafa", paperDark: "#e8e8e8",
    ink: "#1a1a1a", inkLight: "#6a6a6a",
    accent: "#333333", faded: "#aaaaaa",
    type: "authentic"
  }
};

// ============================================================
// MODE DEFINITIONS
// ============================================================

const MODES = {
  artikulation: {
    name: "Artikulation",
    composer: "Ligeti/Wehinger",
    description: "Color-coded timbral blocks, dense clusters, call/response",
    weight: 0.15,
    elements: ["colorBlocks", "timbralClusters", "callResponse", "denseClouds"],
    prefersPalette: ["wehinger", "manuscript"]
  },
  upic: {
    name: "UPIC",
    composer: "Xenakis",
    description: "Freehand arcs, glissandi, architectural ruled lines",
    weight: 0.15,
    elements: ["arcs", "glissandi", "ruledLines", "sirenSweeps"],
    prefersPalette: ["upicBlue", "blueprint"]
  },
  cluster: {
    name: "Cluster",
    composer: "Penderecki",
    description: "Dense wedge shapes, time-space notation, extended techniques",
    weight: 0.15,
    elements: ["wedges", "clusterBands", "extendedSymbols", "quarterTones"],
    prefersPalette: ["manuscript", "sepia"]
  },
  graph: {
    name: "Graph",
    composer: "Feldman",
    description: "Grid boxes, sparse pointillist, circuit-diagram aesthetic",
    weight: 0.15,
    elements: ["gridBoxes", "sparsePoints", "registerLevels", "circuitLines"],
    prefersPalette: ["aged", "manuscript"]
  },
  chance: {
    name: "Chance",
    composer: "Cage",
    description: "Overlapping curves and dots, intersection derivation, layers",
    weight: 0.15,
    elements: ["curvedLines", "dotFields", "intersections", "transparentLayers"],
    prefersPalette: ["cageTransparent", "blueprint"]
  },
  spectral: {
    name: "Spectral",
    composer: "Murail/Grisey",
    description: "Frequency bands, overtone stacks, horizontal strata",
    weight: 0.15,
    elements: ["frequencyBands", "harmonicStacks", "spectralEnvelopes", "partials"],
    prefersPalette: ["spectralHeat", "blueprint"]
  },
  spiral: {
    name: "Spiral",
    composer: "Crumb",
    description: "Circular patterns, numerological structure, ritualistic symbols",
    weight: 0.10,
    elements: ["spiralPaths", "circularNotation", "numerology", "ritualSymbols"],
    prefersPalette: ["crumbRitual", "parchment"]
  }
};

const MODE_NAMES = Object.keys(MODES);

// ============================================================
// FEATURES SYSTEM
// ============================================================

let features = {};
let originalFeatures = {};
let hasOverrides = false;

const RARITY_CURVES = {
  blendType: {
    probabilities: [0.40, 0.35, 0.25],
    labels: ["dominant", "sectional", "voiceBased"]
  },
  modeCount: {
    probabilities: [0.35, 0.40, 0.20, 0.05],
    labels: ["single", "dual", "triple", "quad"]
  },
  voiceCount: {
    probabilities: [0.50, 0.28, 0.14, 0.08],
    labels: ["ensemble (3-5)", "chamber (6-8)", "solo (1-2)", "orchestra (9-12)"]
  },
  structure: {
    probabilities: [0.40, 0.30, 0.20, 0.10],
    labels: ["flowing", "sectioned", "mathematical", "palindrome"]
  },
  density: {
    probabilities: [0.45, 0.28, 0.18, 0.09],
    labels: ["balanced", "dense", "sparse", "extreme"]
  },
  paletteType: {
    probabilities: [0.55, 0.45],
    labels: ["archival", "authentic"]
  }
};

function generateFeatures() {
  R = initRandom(hash);

  // Determine active modes
  const modeCountRarity = rollRarity(0.35, 0.40, 0.20, 0.05);
  let modeCount;
  if (modeCountRarity === "common") modeCount = 1;
  else if (modeCountRarity === "uncommon") modeCount = 2;
  else if (modeCountRarity === "rare") modeCount = 3;
  else modeCount = 4;

  // Select modes based on weights
  const modeWeights = MODE_NAMES.map(m => MODES[m].weight);
  let activeModes = [];
  let usedIndices = new Set();

  for (let i = 0; i < modeCount; i++) {
    let attempts = 0;
    let idx;
    do {
      idx = rndWeighted(modeWeights);
      attempts++;
    } while (usedIndices.has(idx) && attempts < 20);
    usedIndices.add(idx);
    activeModes.push(MODE_NAMES[idx]);
  }

  const primaryMode = activeModes[0];
  const secondaryModes = activeModes.slice(1);

  // Blending type
  const blendTypeRarity = rollRarity(0.40, 0.35, 0.25, 0);
  let blendType;
  if (blendTypeRarity === "common") blendType = "dominant";
  else if (blendTypeRarity === "uncommon") blendType = "sectional";
  else blendType = "voiceBased";

  // If single mode, force dominant blend
  if (modeCount === 1) blendType = "dominant";

  // Voice count
  const voiceRarity = rollRarity(0.50, 0.28, 0.14, 0.08);
  let voiceCount;
  if (voiceRarity === "common") voiceCount = rndInt(3, 5);
  else if (voiceRarity === "uncommon") voiceCount = rndInt(6, 8);
  else if (voiceRarity === "rare") voiceCount = rndInt(1, 2);
  else voiceCount = rndInt(9, 12);

  // Structure
  const structureRarity = rollRarity(0.40, 0.30, 0.20, 0.10);
  let structure, sectionCount = 1;
  if (structureRarity === "common") {
    structure = "flowing";
    sectionCount = 1;
  } else if (structureRarity === "uncommon") {
    structure = "sectioned";
    sectionCount = rndInt(2, 5);
  } else if (structureRarity === "rare") {
    structure = "mathematical";
    sectionCount = rndInt(3, 6);
  } else {
    structure = "palindrome";
    sectionCount = rndInt(3, 7);
  }

  // Density
  const densityRarity = rollRarity(0.45, 0.28, 0.18, 0.09);
  let density, densityValue;
  if (densityRarity === "common") {
    density = "balanced";
    densityValue = rnd(0.4, 0.6);
  } else if (densityRarity === "uncommon") {
    density = "dense";
    densityValue = rnd(0.7, 0.88);
  } else if (densityRarity === "rare") {
    density = "sparse";
    densityValue = rnd(0.12, 0.28);
  } else {
    density = "extreme";
    densityValue = rndBool(0.5) ? rnd(0.03, 0.1) : rnd(0.88, 0.98);
  }

  // Palette selection
  const useAuthentic = rndBool(0.45);
  let paletteName;

  if (useAuthentic) {
    // Use mode-preferred authentic palette
    const preferredPalettes = MODES[primaryMode].prefersPalette;
    paletteName = rndChoice(preferredPalettes);
  } else {
    // Use archival palette
    const archivalPalettes = ["sepia", "manuscript", "parchment", "aged", "blueprint"];
    paletteName = rndChoice(archivalPalettes);
  }

  // Time and tempo aesthetics
  const timeSignatures = ["4/4", "3/4", "5/4", "6/8", "7/8", "free", "aleatoric"];
  const tempoMarkings = [
    "Lento", "Adagio", "Andante", "Moderato", "Allegro",
    "Presto", "Senza tempo", "Liberamente", "Rubato"
  ];

  // Contrast
  const contrastValue = rnd(0.2, 0.9);

  features = {
    // Mode system
    primaryMode,
    secondaryModes,
    activeModes,
    modeCount,
    modeCountRarity,
    blendType,
    blendTypeLabel: blendType,

    // Composition
    voiceCount,
    voiceRarity,
    structure,
    structureRarity,
    sectionCount,
    density,
    densityRarity,
    densityValue,
    contrastValue,

    // Visuals
    paletteName,
    palette: PALETTES[paletteName],
    paletteType: PALETTES[paletteName].type,

    // Musical aesthetics
    timeSignature: rndChoice(timeSignatures),
    tempo: rndChoice(tempoMarkings),

    // Technical
    seed: hash.slice(2, 10),
    lineWeight: rnd(0.5, 2.5),
    hasSymmetry: structure === "palindrome",

    // Mode-specific flags
    hasSpiral: activeModes.includes("spiral"),
    hasSpectral: activeModes.includes("spectral"),
    hasChance: activeModes.includes("chance")
  };

  originalFeatures = { ...features };
  return features;
}

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
function getRarityCurves() { return RARITY_CURVES; }

// ============================================================
// COMPOSITION CLASSES
// ============================================================

let canvas;
let WIDTH = 1280;
let HEIGHT = 720;
const MARGIN = 60;
let hiResMode = false;
let scaleFactor = 1;

class Voice {
  constructor(index, total, yStart, yEnd) {
    this.index = index;
    this.yStart = yStart;
    this.yEnd = yEnd;
    this.yCenter = (yStart + yEnd) / 2;
    this.height = yEnd - yStart;
    this.register = rnd();
    this.activity = rnd(0.3, 1.0);
    this.density = rnd() * features.densityValue;

    // For voice-based blending, assign a mode
    if (features.blendType === "voiceBased" && features.activeModes.length > 1) {
      this.assignedMode = rndChoice(features.activeModes);
    } else {
      this.assignedMode = features.primaryMode;
    }
  }
}

class Section {
  constructor(index, total, xStart, xEnd) {
    this.index = index;
    this.xStart = xStart;
    this.xEnd = xEnd;
    this.width = xEnd - xStart;
    this.xCenter = (xStart + xEnd) / 2;
    this.intensity = rnd();
    this.densityMod = rnd(0.5, 1.5);
    this.mirrorIndex = total - 1 - index;

    // For sectional blending, assign modes to sections
    if (features.blendType === "sectional" && features.activeModes.length > 1) {
      this.assignedMode = features.activeModes[index % features.activeModes.length];
    } else {
      this.assignedMode = features.primaryMode;
    }
  }
}

let voices = [];
let sections = [];

function setupComposition() {
  voices = [];
  sections = [];

  const voiceHeight = (HEIGHT - MARGIN * 2) / features.voiceCount;
  for (let i = 0; i < features.voiceCount; i++) {
    const yStart = MARGIN + i * voiceHeight;
    const yEnd = yStart + voiceHeight;
    voices.push(new Voice(i, features.voiceCount, yStart, yEnd));
  }

  const scoreWidth = WIDTH - MARGIN * 2;

  if (features.structure === "mathematical") {
    const phi = 1.618033988749;
    let divisions = [0];
    let remaining = 1;
    for (let i = 0; i < features.sectionCount - 1; i++) {
      remaining /= phi;
      divisions.push(1 - remaining);
    }
    divisions.push(1);

    for (let i = 0; i < divisions.length - 1; i++) {
      const xStart = MARGIN + divisions[i] * scoreWidth;
      const xEnd = MARGIN + divisions[i + 1] * scoreWidth;
      sections.push(new Section(i, divisions.length - 1, xStart, xEnd));
    }
  } else {
    for (let i = 0; i < features.sectionCount; i++) {
      const variance = features.structure === "flowing" ? 0 : rnd(-0.08, 0.08);
      const xStart = MARGIN + (i / features.sectionCount + variance) * scoreWidth;
      const xEnd = MARGIN + ((i + 1) / features.sectionCount + variance) * scoreWidth;
      sections.push(new Section(i, features.sectionCount,
        Math.max(MARGIN, xStart),
        Math.min(WIDTH - MARGIN, xEnd)));
    }
  }
}

// ============================================================
// DRAWING: COMMON ELEMENTS
// ============================================================

function drawPaper() {
  background(features.palette.paper);

  // Fine fiber texture - horizontal fibers like real paper
  stroke(features.palette.paperDark + "08");
  strokeWeight(0.3 * scaleFactor);
  const fiberCount = hiResMode ? 800 : 300;
  for (let i = 0; i < fiberCount; i++) {
    const y = rnd(0, HEIGHT);
    const x1 = rnd(0, WIDTH * 0.7);
    const len = rnd(20, 120) * scaleFactor;
    // Slight waviness
    const midY = y + rnd(-1, 1) * scaleFactor;
    line(x1, y, x1 + len * 0.5, midY);
    line(x1 + len * 0.5, midY, x1 + len, y + rnd(-0.5, 0.5) * scaleFactor);
  }

  // Subtle grain noise - very fine dots
  noStroke();
  const grainCount = hiResMode ? 6000 : 2000;
  for (let i = 0; i < grainCount; i++) {
    const x = rnd(0, WIDTH);
    const y = rnd(0, HEIGHT);
    fill(features.palette.paperDark + "0a");
    rect(x, y, 0.5 * scaleFactor, 0.5 * scaleFactor);
  }

  // Decorative border frame
  drawDecorativeBorder();

  // Corner ornaments
  drawCornerOrnaments();

  // Subtle foxing (age spots) - more organic shapes
  if (rndBool(0.6)) {
    drawFoxingSpots();
  }
}

function drawDecorativeBorder() {
  const borderStyle = rndInt(0, 3);
  const inset = 15 * scaleFactor;
  const innerInset = 20 * scaleFactor;

  stroke(features.palette.ink + "20");
  strokeWeight(0.5 * scaleFactor);
  noFill();

  switch (borderStyle) {
    case 0: // Double-line frame (classic engraved score)
      rect(inset, inset, WIDTH - inset * 2, HEIGHT - inset * 2);
      rect(innerInset, innerInset, WIDTH - innerInset * 2, HEIGHT - innerInset * 2);
      break;

    case 1: // Ruled margin lines
      // Top rule
      line(inset, inset, WIDTH - inset, inset);
      line(inset, inset + 3 * scaleFactor, WIDTH - inset, inset + 3 * scaleFactor);
      // Bottom rule
      line(inset, HEIGHT - inset, WIDTH - inset, HEIGHT - inset);
      line(inset, HEIGHT - inset - 3 * scaleFactor, WIDTH - inset, HEIGHT - inset - 3 * scaleFactor);
      // Side margins (dashed)
      for (let y = inset; y < HEIGHT - inset; y += 8 * scaleFactor) {
        line(inset, y, inset, min(y + 4 * scaleFactor, HEIGHT - inset));
        line(WIDTH - inset, y, WIDTH - inset, min(y + 4 * scaleFactor, HEIGHT - inset));
      }
      break;

    case 2: // Art nouveau subtle curves
      // Top ornamental line
      beginShape();
      for (let x = inset; x <= WIDTH - inset; x += 5 * scaleFactor) {
        const progress = (x - inset) / (WIDTH - inset * 2);
        const wave = sin(progress * PI * 4) * 2 * scaleFactor;
        vertex(x, inset + wave);
      }
      endShape();
      // Bottom mirror
      beginShape();
      for (let x = inset; x <= WIDTH - inset; x += 5 * scaleFactor) {
        const progress = (x - inset) / (WIDTH - inset * 2);
        const wave = sin(progress * PI * 4) * 2 * scaleFactor;
        vertex(x, HEIGHT - inset - wave);
      }
      endShape();
      break;

    case 3: // Minimal corner brackets
      const bracketLen = 40 * scaleFactor;
      // Top-left
      line(inset, inset, inset + bracketLen, inset);
      line(inset, inset, inset, inset + bracketLen);
      // Top-right
      line(WIDTH - inset, inset, WIDTH - inset - bracketLen, inset);
      line(WIDTH - inset, inset, WIDTH - inset, inset + bracketLen);
      // Bottom-left
      line(inset, HEIGHT - inset, inset + bracketLen, HEIGHT - inset);
      line(inset, HEIGHT - inset, inset, HEIGHT - inset - bracketLen);
      // Bottom-right
      line(WIDTH - inset, HEIGHT - inset, WIDTH - inset - bracketLen, HEIGHT - inset);
      line(WIDTH - inset, HEIGHT - inset, WIDTH - inset, HEIGHT - inset - bracketLen);
      break;
  }
}

function drawCornerOrnaments() {
  if (!rndBool(0.4)) return;

  const ornamentStyle = rndInt(0, 2);
  const corners = [
    { x: 8 * scaleFactor, y: 8 * scaleFactor, rot: 0 },
    { x: WIDTH - 8 * scaleFactor, y: 8 * scaleFactor, rot: HALF_PI },
    { x: WIDTH - 8 * scaleFactor, y: HEIGHT - 8 * scaleFactor, rot: PI },
    { x: 8 * scaleFactor, y: HEIGHT - 8 * scaleFactor, rot: PI + HALF_PI }
  ];

  stroke(features.palette.ink + "18");
  strokeWeight(0.6 * scaleFactor);
  noFill();

  for (const corner of corners) {
    push();
    translate(corner.x, corner.y);
    rotate(corner.rot);

    switch (ornamentStyle) {
      case 0: // Fleuron / leaf
        beginShape();
        vertex(0, 0);
        bezierVertex(4 * scaleFactor, -2 * scaleFactor, 8 * scaleFactor, -4 * scaleFactor, 10 * scaleFactor, 0);
        bezierVertex(8 * scaleFactor, 4 * scaleFactor, 4 * scaleFactor, 2 * scaleFactor, 0, 0);
        endShape();
        break;

      case 1: // Simple crosshatch
        for (let i = 0; i < 3; i++) {
          line(i * 3 * scaleFactor, 0, 0, i * 3 * scaleFactor);
        }
        break;

      case 2: // Spiral flourish
        noFill();
        beginShape();
        for (let a = 0; a < PI; a += 0.2) {
          const r = a * 3 * scaleFactor;
          vertex(cos(a) * r, sin(a) * r);
        }
        endShape();
        break;
    }

    pop();
  }
}

function drawFoxingSpots() {
  // Organic-looking age spots, not cheap circles
  const numSpots = rndInt(3, 12);

  for (let i = 0; i < numSpots; i++) {
    // Spots tend to appear near edges
    const edge = rndBool(0.7);
    let cx, cy;
    if (edge) {
      const side = rndInt(0, 3);
      const edgeDist = rnd(10, 50) * scaleFactor;
      if (side === 0) { cx = rnd(0, WIDTH); cy = edgeDist; }
      else if (side === 1) { cx = rnd(0, WIDTH); cy = HEIGHT - edgeDist; }
      else if (side === 2) { cx = edgeDist; cy = rnd(0, HEIGHT); }
      else { cx = WIDTH - edgeDist; cy = rnd(0, HEIGHT); }
    } else {
      cx = rnd(MARGIN, WIDTH - MARGIN);
      cy = rnd(MARGIN, HEIGHT - MARGIN);
    }

    // Irregular organic shape using multiple overlapping forms
    const baseSize = rnd(4, 15) * scaleFactor;
    const alpha = rnd(8, 18);

    noStroke();
    fill(features.palette.faded + Math.floor(alpha).toString(16).padStart(2, '0'));

    // Main spot with slight irregularity
    push();
    translate(cx, cy);
    rotate(rnd(0, TWO_PI));

    beginShape();
    for (let a = 0; a < TWO_PI; a += 0.3) {
      const r = baseSize * (0.7 + rnd(0, 0.5) + sin(a * 3) * 0.2);
      vertex(cos(a) * r, sin(a) * r);
    }
    endShape(CLOSE);
    pop();

    // Satellite micro-spots
    if (rndBool(0.5)) {
      for (let j = 0; j < rndInt(1, 4); j++) {
        const angle = rnd(0, TWO_PI);
        const dist = rnd(baseSize, baseSize * 2);
        const sx = cx + cos(angle) * dist;
        const sy = cy + sin(angle) * dist;
        const ss = rnd(1, 3) * scaleFactor;
        ellipse(sx, sy, ss, ss * rnd(0.8, 1.2));
      }
    }
  }
}

function drawStaves() {
  stroke(features.palette.faded + "35");
  strokeWeight(0.5 * scaleFactor);

  for (const voice of voices) {
    const staffSpacing = voice.height / 6;
    for (let i = 1; i <= 5; i++) {
      const y = voice.yStart + i * staffSpacing;
      line(MARGIN, y, WIDTH - MARGIN, y);
    }
  }

  if (features.structure !== "flowing" && sections.length > 1) {
    stroke(features.palette.ink + "25");
    strokeWeight(1 * scaleFactor);
    for (let i = 1; i < sections.length; i++) {
      const x = sections[i].xStart;
      for (let y = MARGIN; y < HEIGHT - MARGIN; y += 10 * scaleFactor) {
        line(x, y, x, y + 5 * scaleFactor);
      }
    }
  }
}

function drawVignette() {
  noStroke();
  const vignetteColor = color(features.palette.paperDark);

  for (let i = 0; i < 40; i++) {
    const alpha = map(i, 0, 40, 25, 0);
    fill(red(vignetteColor), green(vignetteColor), blue(vignetteColor), alpha);
    const thickness = scaleFactor;
    rect(0, i * thickness, WIDTH, thickness);
    rect(0, HEIGHT - (i + 1) * thickness, WIDTH, thickness);
    rect(i * thickness, 0, thickness, HEIGHT);
    rect(WIDTH - (i + 1) * thickness, 0, thickness, HEIGHT);
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: ARTIKULATION
// ============================================================

function drawArtikulationColorBlocks(voice, section) {
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55", "#ffaa00", "#9944aa", "#ff6644"];
  const numBlocks = Math.floor(rnd(3, 10) * features.densityValue * section.densityMod);

  for (let i = 0; i < numBlocks; i++) {
    const c = rndChoice(colors);
    const x = rnd(section.xStart + 5, section.xEnd - 30);
    const y = rnd(voice.yStart + 5, voice.yEnd - 15);
    const w = rnd(15, 60) * scaleFactor;
    const h = rnd(8, 25) * scaleFactor;

    const blockType = rndInt(0, 4);

    fill(c + "cc");
    noStroke();

    if (blockType === 0) {
      // Rectangle
      rect(x, y, w, h, 2 * scaleFactor);
    } else if (blockType === 1) {
      // Rounded blob
      ellipse(x + w/2, y + h/2, w, h);
    } else if (blockType === 2) {
      // Tapered shape
      beginShape();
      vertex(x, y + h/2);
      vertex(x + w * 0.3, y);
      vertex(x + w, y + h * 0.3);
      vertex(x + w, y + h * 0.7);
      vertex(x + w * 0.3, y + h);
      endShape(CLOSE);
    } else if (blockType === 3) {
      // Jagged cluster
      beginShape();
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * TWO_PI;
        const r = (w/3 + rnd(-5, 5)) * scaleFactor;
        vertex(x + w/2 + cos(angle) * r, y + h/2 + sin(angle) * r * 0.6);
      }
      endShape(CLOSE);
    } else {
      // Stacked rectangles
      for (let j = 0; j < 3; j++) {
        rect(x + j * 3, y + j * (h/3), w * 0.7, h/3, 1);
      }
    }
  }
}

function drawArtikulationClusters(voice, section) {
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55", "#ffaa00"];
  const numClusters = Math.floor(rnd(1, 3) * features.densityValue);

  for (let c = 0; c < numClusters; c++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 15, voice.yEnd - 15);
    const numMarks = Math.floor(rnd(15, 50) * features.densityValue);

    for (let i = 0; i < numMarks; i++) {
      const col = rndChoice(colors);
      const mx = cx + rndGaussian(0, 25 * scaleFactor);
      const my = cy + rndGaussian(0, 12 * scaleFactor);
      const size = rnd(2, 8) * scaleFactor;

      fill(col + "aa");
      noStroke();

      if (rndBool(0.5)) {
        ellipse(mx, my, size, size * 0.7);
      } else {
        rect(mx, my, size, size * 0.5);
      }
    }
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: UPIC
// ============================================================

function drawUpicArcs(voice, section) {
  const numArcs = Math.floor(rnd(3, 12) * features.densityValue * section.densityMod);

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  for (let i = 0; i < numArcs; i++) {
    const startX = rnd(section.xStart, section.xEnd - 80);
    const endX = rnd(startX + 40, Math.min(startX + 200, section.xEnd));
    const startY = rnd(voice.yStart + 10, voice.yEnd - 10);
    const endY = rnd(voice.yStart + 10, voice.yEnd - 10);

    const arcType = rndInt(0, 3);

    if (arcType === 0) {
      // Horizontal (steady pitch)
      const wobble = rnd(2, 8) * scaleFactor;
      beginShape();
      for (let x = startX; x <= endX; x += 5 * scaleFactor) {
        vertex(x, startY + rndGaussian(0, wobble * 0.3));
      }
      endShape();
    } else if (arcType === 1) {
      // Oblique (glissando)
      line(startX, startY, endX, endY);
    } else if (arcType === 2) {
      // Curved glissando
      const cx1 = rnd(startX, endX);
      const cy1 = rnd(voice.yStart, voice.yEnd);
      const cx2 = rnd(startX, endX);
      const cy2 = rnd(voice.yStart, voice.yEnd);
      bezier(startX, startY, cx1, cy1, cx2, cy2, endX, endY);
    } else {
      // Siren sweep (rapid oscillation)
      beginShape();
      for (let x = startX; x <= endX; x += 3 * scaleFactor) {
        const progress = (x - startX) / (endX - startX);
        const baseY = lerp(startY, endY, progress);
        const osc = sin(progress * TWO_PI * rnd(2, 6)) * 15 * scaleFactor;
        vertex(x, baseY + osc);
      }
      endShape();
    }

    // Parallel lines (Xenakis signature)
    if (rndBool(0.25)) {
      const offset = rnd(4, 10) * scaleFactor;
      stroke(features.palette.ink + "88");
      if (arcType === 1) {
        line(startX, startY + offset, endX, endY + offset);
      }
      stroke(features.palette.ink);
    }
  }
}

function drawUpicRuledLines(voice, section) {
  const numLines = Math.floor(rnd(2, 6) * features.densityValue);

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 1.5 * scaleFactor);

  for (let i = 0; i < numLines; i++) {
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const startX = rnd(section.xStart, section.xStart + section.width * 0.3);
    const endX = rnd(section.xEnd - section.width * 0.3, section.xEnd);

    line(startX, y, endX, y);

    // Add termination marks
    strokeWeight(features.lineWeight * 0.5 * scaleFactor);
    line(startX, y - 5 * scaleFactor, startX, y + 5 * scaleFactor);
    line(endX, y - 5 * scaleFactor, endX, y + 5 * scaleFactor);
    strokeWeight(features.lineWeight * 1.5 * scaleFactor);
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: CLUSTER (Penderecki)
// ============================================================

function drawClusterWedges(voice, section) {
  const numWedges = Math.floor(rnd(1, 4) * features.densityValue * section.densityMod);

  for (let i = 0; i < numWedges; i++) {
    const startX = rnd(section.xStart + 10, section.xEnd - 100);
    const endX = rnd(startX + 50, Math.min(startX + 180, section.xEnd - 10));
    const centerY = rnd(voice.yStart + voice.height * 0.3, voice.yEnd - voice.height * 0.3);

    const expanding = rndBool(0.5);
    const startHeight = expanding ? rnd(5, 15) : rnd(30, 60);
    const endHeight = expanding ? rnd(30, 60) : rnd(5, 15);

    fill(features.palette.ink + "70");
    noStroke();

    beginShape();
    vertex(startX, centerY - startHeight * scaleFactor / 2);
    vertex(endX, centerY - endHeight * scaleFactor / 2);
    vertex(endX, centerY + endHeight * scaleFactor / 2);
    vertex(startX, centerY + startHeight * scaleFactor / 2);
    endShape(CLOSE);

    // Quarter-tone lines within wedge
    stroke(features.palette.paper + "60");
    strokeWeight(0.5 * scaleFactor);
    const steps = Math.floor((endX - startX) / (8 * scaleFactor));
    for (let j = 0; j < steps; j++) {
      const x = startX + (j / steps) * (endX - startX);
      const progress = j / steps;
      const h = lerp(startHeight, endHeight, progress) * scaleFactor;
      for (let k = 0; k < 4; k++) {
        const y = centerY - h/2 + (k / 4) * h;
        line(x, y, x + 3 * scaleFactor, y);
      }
    }
  }
}

function drawClusterBands(voice, section) {
  const numBands = Math.floor(rnd(2, 6) * features.densityValue);

  for (let i = 0; i < numBands; i++) {
    const startX = rnd(section.xStart, section.xEnd - 60);
    const bandWidth = rnd(30, 100) * scaleFactor;
    const y = rnd(voice.yStart + 8, voice.yEnd - 20);
    const bandHeight = rnd(10, 30) * scaleFactor;

    // Dense horizontal lines
    stroke(features.palette.ink);
    strokeWeight(0.4 * scaleFactor);

    const lineCount = Math.floor(bandHeight / (2 * scaleFactor));
    for (let j = 0; j < lineCount; j++) {
      const ly = y + (j / lineCount) * bandHeight;
      const offset = rndGaussian(0, 3 * scaleFactor);
      line(startX + offset, ly, startX + bandWidth + offset, ly);
    }
  }
}

function drawExtendedSymbols(voice, section) {
  const symbols = ["sul pont.", "col legno", "pizz.", "arco", "trem.", "harm."];
  const numSymbols = Math.floor(rnd(1, 4) * features.densityValue);

  fill(features.palette.inkLight);
  noStroke();
  textSize(8 * scaleFactor);
  textStyle(ITALIC);

  for (let i = 0; i < numSymbols; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 40);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    text(rndChoice(symbols), x, y);
  }
  textStyle(NORMAL);
}

// ============================================================
// MODE-SPECIFIC DRAWING: GRAPH (Feldman)
// ============================================================

function drawGraphBoxes(voice, section) {
  const gridWidth = 20 * scaleFactor;
  const numColumns = Math.floor(section.width / gridWidth);
  const levels = 3; // high, mid, low
  const levelHeight = voice.height / levels;

  stroke(features.palette.ink + "40");
  strokeWeight(0.5 * scaleFactor);
  noFill();

  // Draw grid
  for (let col = 0; col < numColumns; col++) {
    const x = section.xStart + col * gridWidth;
    for (let level = 0; level < levels; level++) {
      const y = voice.yStart + level * levelHeight;
      rect(x, y, gridWidth, levelHeight);
    }
  }

  // Fill some boxes (sparse)
  const fillCount = Math.floor(rnd(2, 8) * features.densityValue * (numColumns / 10));
  fill(features.palette.ink + "60");
  noStroke();

  for (let i = 0; i < fillCount; i++) {
    const col = rndInt(0, numColumns - 1);
    const level = rndInt(0, levels - 1);
    const x = section.xStart + col * gridWidth;
    const y = voice.yStart + level * levelHeight;

    // Different fill styles
    if (rndBool(0.4)) {
      // Filled
      rect(x + 2 * scaleFactor, y + 2 * scaleFactor,
           gridWidth - 4 * scaleFactor, levelHeight - 4 * scaleFactor);
    } else if (rndBool(0.5)) {
      // Dot
      ellipse(x + gridWidth/2, y + levelHeight/2,
              gridWidth * 0.4, levelHeight * 0.4);
    } else {
      // Number (Feldman's numbered cells)
      fill(features.palette.ink);
      textSize(8 * scaleFactor);
      textAlign(CENTER, CENTER);
      text(rndInt(1, 4), x + gridWidth/2, y + levelHeight/2);
      textAlign(LEFT, TOP);
      fill(features.palette.ink + "60");
    }
  }
}

function drawSparsePoints(voice, section) {
  const numPoints = Math.floor(rnd(3, 10) * features.densityValue * 0.5);

  for (let i = 0; i < numPoints; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const size = rnd(3, 8) * scaleFactor;

    fill(features.palette.ink);
    noStroke();
    ellipse(x, y, size, size);

    // Duration line (Feldman style)
    if (rndBool(0.4)) {
      stroke(features.palette.ink + "60");
      strokeWeight(0.5 * scaleFactor);
      const duration = rnd(15, 50) * scaleFactor;
      line(x + size/2, y, x + size/2 + duration, y);
    }
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: CHANCE (Cage)
// ============================================================

function drawChanceCurves(voice, section) {
  const numCurves = Math.floor(rnd(4, 12) * features.densityValue);

  for (let i = 0; i < numCurves; i++) {
    stroke(features.palette.ink + "50");
    strokeWeight(rnd(0.5, 1.5) * scaleFactor);
    noFill();

    const startX = rnd(section.xStart, section.xEnd);
    const startY = rnd(voice.yStart, voice.yEnd);

    beginShape();
    curveVertex(startX, startY);
    curveVertex(startX, startY);

    let x = startX;
    let y = startY;
    const segments = rndInt(4, 10);

    for (let j = 0; j < segments; j++) {
      x += rnd(-40, 80) * scaleFactor;
      y += rnd(-30, 30) * scaleFactor;
      x = constrain(x, section.xStart, section.xEnd);
      y = constrain(y, voice.yStart, voice.yEnd);
      curveVertex(x, y);
    }

    curveVertex(x, y);
    endShape();
  }
}

function drawChanceDots(voice, section) {
  const numDots = Math.floor(rnd(15, 50) * features.densityValue);

  for (let i = 0; i < numDots; i++) {
    const x = rnd(section.xStart, section.xEnd);
    const y = rnd(voice.yStart, voice.yEnd);
    const size = rnd(1, 4) * scaleFactor;

    fill(features.palette.ink + "70");
    noStroke();
    ellipse(x, y, size, size);
  }
}

function drawChanceIntersections(voice, section) {
  // Draw intersection markers where imaginary curves cross
  const numMarkers = Math.floor(rnd(2, 6) * features.densityValue);

  stroke(features.palette.accent);
  strokeWeight(1 * scaleFactor);

  for (let i = 0; i < numMarkers; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const size = 6 * scaleFactor;

    // Cross mark
    line(x - size, y, x + size, y);
    line(x, y - size, x, y + size);

    // Small circle
    noFill();
    ellipse(x, y, size * 2, size * 2);
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: SPECTRAL (Murail/Grisey) - Enhanced
// ============================================================

// Engraving helper: Draw hatching lines within a shape
function drawHatching(x, y, w, h, angle, spacing, intensity) {
  const s = spacing * scaleFactor;
  const len = Math.sqrt(w * w + h * h);
  const cos_a = cos(angle);
  const sin_a = sin(angle);

  stroke(features.palette.ink);
  strokeWeight(0.3 * scaleFactor * intensity);

  for (let i = -len; i < len; i += s) {
    const x1 = x + w/2 + cos_a * i - sin_a * len;
    const y1 = y + h/2 + sin_a * i + cos_a * len;
    const x2 = x + w/2 + cos_a * i + sin_a * len;
    const y2 = y + h/2 + sin_a * i - cos_a * len;

    // Clip to bounding box
    if (x1 >= x - w && x1 <= x + w * 2 && x2 >= x - w && x2 <= x + w * 2) {
      line(
        constrain(x1, x, x + w), constrain(y1, y, y + h),
        constrain(x2, x, x + w), constrain(y2, y, y + h)
      );
    }
  }
}

// Engraving helper: Draw cross-hatching
function drawCrossHatching(x, y, w, h, spacing, intensity) {
  drawHatching(x, y, w, h, PI/4, spacing, intensity);
  drawHatching(x, y, w, h, -PI/4, spacing * 1.2, intensity * 0.7);
}

// Engraving helper: Draw stippling (dots)
function drawStippling(x, y, w, h, density, intensity) {
  const numDots = Math.floor(w * h * density * 0.01 * intensity);
  fill(features.palette.ink);
  noStroke();

  for (let i = 0; i < numDots; i++) {
    const dx = x + rnd(0, w);
    const dy = y + rnd(0, h);
    const size = rnd(0.3, 1.2) * scaleFactor * intensity;
    ellipse(dx, dy, size, size);
  }
}

// Spectral Waterfall - detailed frequency-time spectrogram
function drawSpectralWaterfall(voice, section) {
  const numBins = Math.floor(rnd(20, 40) * features.densityValue);
  const timeSteps = Math.floor(section.width / (4 * scaleFactor));
  const binHeight = voice.height / numBins;

  stroke(features.palette.ink);

  for (let t = 0; t < timeSteps; t++) {
    const x = section.xStart + (t / timeSteps) * section.width;

    for (let f = 0; f < numBins; f++) {
      const y = voice.yStart + f * binHeight;

      // Simulate spectral energy with noise
      const energy = noise(t * 0.1, f * 0.15) * rnd(0.3, 1);

      if (energy > 0.3) {
        // Fine horizontal lines for each bin
        const lineCount = Math.floor(energy * 4);
        strokeWeight(0.2 * scaleFactor);

        for (let l = 0; l < lineCount; l++) {
          const ly = y + (l / lineCount) * binHeight * 0.8;
          const lineLen = energy * 8 * scaleFactor;
          stroke(features.palette.ink + Math.floor(energy * 200).toString(16).padStart(2, '0'));
          line(x, ly, x + lineLen, ly);
        }
      }
    }
  }
}

// Formant Contours - smooth resonance curves with hatching
function drawFormantContours(voice, section) {
  const numFormants = rndInt(2, 5);

  for (let f = 0; f < numFormants; f++) {
    const centerFreq = rnd(0.2, 0.8); // Normalized frequency
    const bandwidth = rnd(0.05, 0.15);
    const startX = section.xStart + rnd(0, section.width * 0.3);
    const endX = section.xEnd - rnd(0, section.width * 0.3);

    // Draw formant envelope
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * scaleFactor);
    noFill();

    beginShape();
    const points = [];
    for (let t = 0; t <= 30; t++) {
      const progress = t / 30;
      const x = startX + progress * (endX - startX);

      // Formant frequency modulation
      const freqMod = sin(progress * PI * rnd(1, 3)) * 0.1;
      const freq = centerFreq + freqMod;
      const y = voice.yStart + freq * voice.height;

      vertex(x, y);
      points.push({x, y});
    }
    endShape();

    // Add cross-hatching inside formant region
    if (points.length > 2 && rndBool(0.6)) {
      const midIdx = Math.floor(points.length / 2);
      const midX = points[midIdx].x;
      const midY = points[midIdx].y;
      const hatchWidth = rnd(30, 60) * scaleFactor;
      const hatchHeight = bandwidth * voice.height;

      push();
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.ellipse(midX, midY, hatchWidth, hatchHeight, 0, 0, TWO_PI);
      drawingContext.clip();
      drawCrossHatching(midX - hatchWidth, midY - hatchHeight, hatchWidth * 2, hatchHeight * 2, 3, 0.8);
      drawingContext.restore();
      pop();
    }

    // Formant label
    if (rndBool(0.5)) {
      fill(features.palette.inkLight);
      noStroke();
      textSize(7 * scaleFactor);
      text(`F${f + 1}`, startX + 5 * scaleFactor, voice.yStart + centerFreq * voice.height - 5 * scaleFactor);
    }
  }
}

// Attack Transients - sharp vertical spikes with stippling
function drawAttackTransients(voice, section) {
  const numTransients = Math.floor(rnd(3, 10) * features.densityValue);

  for (let i = 0; i < numTransients; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const attackHeight = rnd(0.4, 0.9) * voice.height;
    const attackWidth = rnd(8, 20) * scaleFactor;
    const baseY = voice.yEnd - 5 * scaleFactor;

    // Sharp attack envelope
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * 0.8 * scaleFactor);
    noFill();

    // Attack spike shape
    beginShape();
    vertex(x - attackWidth/2, baseY);
    vertex(x - attackWidth/4, baseY - attackHeight * 0.3);
    vertex(x, baseY - attackHeight); // Peak
    vertex(x + attackWidth/4, baseY - attackHeight * 0.5);
    vertex(x + attackWidth/2, baseY - attackHeight * 0.2);
    vertex(x + attackWidth, baseY);
    endShape();

    // Stippling for energy density
    const intensity = rnd(0.5, 1);
    drawStippling(
      x - attackWidth/2,
      baseY - attackHeight,
      attackWidth * 1.5,
      attackHeight,
      features.densityValue * 2,
      intensity
    );

    // Vertical onset line
    stroke(features.palette.ink + "60");
    strokeWeight(0.5 * scaleFactor);
    for (let y = baseY; y > baseY - attackHeight; y -= 3 * scaleFactor) {
      line(x, y, x, y - 1.5 * scaleFactor);
    }
  }
}

// Resonance Bells - bell-curve frequency response with hatching
function drawResonanceBells(voice, section) {
  const numBells = Math.floor(rnd(2, 6) * features.densityValue);

  for (let b = 0; b < numBells; b++) {
    const centerX = rnd(section.xStart + 40, section.xEnd - 40);
    const centerFreq = rnd(0.2, 0.8);
    const centerY = voice.yStart + centerFreq * voice.height;
    const bellWidth = rnd(40, 100) * scaleFactor;
    const bellHeight = rnd(20, 50) * scaleFactor;
    const q = rnd(0.5, 2); // Q factor affects sharpness

    // Draw bell curve outline
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * scaleFactor);
    noFill();

    beginShape();
    for (let i = -20; i <= 20; i++) {
      const t = i / 20;
      const x = centerX + t * bellWidth;
      // Gaussian/bell curve
      const amplitude = exp(-pow(t * q * 2, 2));
      const y = centerY - amplitude * bellHeight;
      vertex(x, y);
    }
    endShape();

    // Hatching fill based on Q
    const hatchAngle = rnd(0, PI);
    const hatchSpacing = map(q, 0.5, 2, 5, 2);

    push();
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.ellipse(centerX, centerY - bellHeight/2, bellWidth, bellHeight, 0, 0, TWO_PI);
    drawingContext.clip();
    drawHatching(centerX - bellWidth, centerY - bellHeight, bellWidth * 2, bellHeight, hatchAngle, hatchSpacing, 0.6);
    drawingContext.restore();
    pop();

    // Q factor annotation
    if (rndBool(0.4)) {
      fill(features.palette.inkLight);
      noStroke();
      textSize(6 * scaleFactor);
      text(`Q=${q.toFixed(1)}`, centerX + bellWidth/2 + 3 * scaleFactor, centerY);
    }

    // Center frequency marker
    stroke(features.palette.ink + "80");
    strokeWeight(0.5 * scaleFactor);
    line(centerX, centerY, centerX, centerY - bellHeight - 5 * scaleFactor);
  }
}

// Enhanced Harmonic Stacks with engraving
function drawHarmonicStacks(voice, section) {
  const numStacks = Math.floor(rnd(1, 3) * features.densityValue);

  for (let s = 0; s < numStacks; s++) {
    const baseX = rnd(section.xStart + 40, section.xEnd - 40);
    const baseY = voice.yEnd - 10 * scaleFactor;
    const numPartials = rndInt(6, 16);

    // Vertical axis line
    stroke(features.palette.ink + "40");
    strokeWeight(0.5 * scaleFactor);
    line(baseX, baseY, baseX, voice.yStart + 10 * scaleFactor);

    // Draw harmonic partials with varying techniques
    for (let i = 1; i <= numPartials; i++) {
      const y = baseY - (Math.log(i) / Math.log(numPartials + 1)) * voice.height * 0.85;
      const amplitude = rnd(0.3, 1) / sqrt(i); // Decreasing amplitude
      const width = amplitude * 60 * scaleFactor;

      // Main partial line
      stroke(features.palette.ink);
      strokeWeight(features.lineWeight * scaleFactor * (1 - i/numPartials * 0.5));
      line(baseX - width/2, y, baseX + width/2, y);

      // Hatching for strong partials
      if (amplitude > 0.5 && rndBool(0.6)) {
        const hatchH = 6 * scaleFactor;
        drawHatching(baseX - width/2, y - hatchH/2, width, hatchH, 0, 2, amplitude);
      }

      // Stippling for resonance
      if (i <= 4 && rndBool(0.4)) {
        drawStippling(baseX - width/2, y - 4 * scaleFactor, width, 8 * scaleFactor, 0.5, amplitude);
      }

      // Partial number
      if (i <= 8 || i === numPartials) {
        fill(features.palette.inkLight);
        noStroke();
        textSize(5 * scaleFactor);
        textAlign(RIGHT, CENTER);
        text(i.toString(), baseX - width/2 - 3 * scaleFactor, y);
        textAlign(LEFT, TOP);
      }
    }

    // Fundamental marker
    fill(features.palette.ink);
    noStroke();
    ellipse(baseX, baseY, 4 * scaleFactor, 4 * scaleFactor);
  }
}

// Original spectral bands with engraving enhancement
function drawSpectralBands(voice, section) {
  const numBands = Math.floor(rnd(8, 20) * features.densityValue);

  for (let i = 0; i < numBands; i++) {
    const bandY = voice.yStart + (i / numBands) * voice.height;
    const bandHeight = (voice.height / numBands) * rnd(0.5, 0.9);
    const startX = rnd(section.xStart, section.xStart + section.width * 0.15);
    const endX = rnd(section.xEnd - section.width * 0.15, section.xEnd);
    const intensity = rnd(0.2, 1);

    // Envelope outline
    stroke(features.palette.ink);
    strokeWeight(0.5 * scaleFactor);
    noFill();

    beginShape();
    const topPoints = [];
    const steps = 25;

    for (let j = 0; j <= steps; j++) {
      const x = startX + (j / steps) * (endX - startX);
      const envelope = sin((j / steps) * PI) * intensity;
      const y = bandY + bandHeight * (1 - envelope);
      vertex(x, y);
      topPoints.push({x, y});
    }
    endShape();

    // Bottom line
    line(startX, bandY + bandHeight, endX, bandY + bandHeight);

    // Fill with technique based on intensity
    if (intensity > 0.7) {
      // Dense cross-hatching for high intensity
      drawCrossHatching(startX, bandY, endX - startX, bandHeight, 2.5, intensity);
    } else if (intensity > 0.4) {
      // Regular hatching for medium
      drawHatching(startX, bandY, endX - startX, bandHeight, PI/6, 3, intensity);
    } else {
      // Stippling for low intensity
      drawStippling(startX, bandY, endX - startX, bandHeight, features.densityValue, intensity);
    }
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: SPIRAL (Crumb)
// ============================================================

function drawSpiralPaths(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const maxRadius = Math.min(section.width, voice.height) * 0.4;

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  // Spiral
  beginShape();
  const turns = rnd(1.5, 4);
  const points = 100;

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * turns * TWO_PI;
    const radius = (i / points) * maxRadius;
    const x = centerX + cos(angle) * radius;
    const y = centerY + sin(angle) * radius;
    vertex(x, y);
  }
  endShape();

  // Add note marks along spiral
  const numNotes = Math.floor(rnd(5, 15) * features.densityValue);
  fill(features.palette.ink);
  noStroke();

  for (let i = 0; i < numNotes; i++) {
    const t = rnd(0, 1);
    const angle = t * turns * TWO_PI;
    const radius = t * maxRadius;
    const x = centerX + cos(angle) * radius;
    const y = centerY + sin(angle) * radius;
    const size = rnd(2, 5) * scaleFactor;

    ellipse(x, y, size, size);
  }
}

function drawCircularNotation(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const radius = Math.min(section.width, voice.height) * 0.35;

  // Concentric circles
  stroke(features.palette.ink + "40");
  strokeWeight(0.5 * scaleFactor);
  noFill();

  for (let i = 1; i <= 5; i++) {
    ellipse(centerX, centerY, radius * 2 * (i / 5), radius * 2 * (i / 5));
  }

  // Radial divisions (numerological)
  const divisions = rndChoice([7, 13, 12, 8]); // Crumb's numbers
  for (let i = 0; i < divisions; i++) {
    const angle = (i / divisions) * TWO_PI - HALF_PI;
    const x2 = centerX + cos(angle) * radius;
    const y2 = centerY + sin(angle) * radius;
    line(centerX, centerY, x2, y2);
  }

  // Notes on circle
  fill(features.palette.ink);
  noStroke();
  const numNotes = Math.floor(rnd(5, 12) * features.densityValue);

  for (let i = 0; i < numNotes; i++) {
    const angle = rnd(0, TWO_PI);
    const r = radius * rnd(0.3, 1);
    const x = centerX + cos(angle) * r;
    const y = centerY + sin(angle) * r;
    ellipse(x, y, rnd(3, 7) * scaleFactor, rnd(3, 7) * scaleFactor);
  }
}

function drawRitualSymbols(voice, section) {
  const symbols = ["\u2605", "\u2606", "\u25CB", "\u25CF", "\u2022", "\u2218", "\u2219"];
  const numSymbols = Math.floor(rnd(2, 6) * features.densityValue);

  fill(features.palette.accent || features.palette.ink);
  noStroke();
  textSize(12 * scaleFactor);
  textAlign(CENTER, CENTER);

  for (let i = 0; i < numSymbols; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    text(rndChoice(symbols), x, y);
  }
  textAlign(LEFT, TOP);
}

// ============================================================
// MODE DISPATCHER
// ============================================================

function drawModeElements(mode, voice, section) {
  switch (mode) {
    case "artikulation":
      drawArtikulationColorBlocks(voice, section);
      if (rndBool(0.6)) drawArtikulationClusters(voice, section);
      break;

    case "upic":
      drawUpicArcs(voice, section);
      if (rndBool(0.4)) drawUpicRuledLines(voice, section);
      break;

    case "cluster":
      drawClusterWedges(voice, section);
      if (rndBool(0.5)) drawClusterBands(voice, section);
      if (rndBool(0.4)) drawExtendedSymbols(voice, section);
      break;

    case "graph":
      drawGraphBoxes(voice, section);
      drawSparsePoints(voice, section);
      break;

    case "chance":
      drawChanceCurves(voice, section);
      drawChanceDots(voice, section);
      if (rndBool(0.5)) drawChanceIntersections(voice, section);
      break;

    case "spectral":
      // Primary spectral element (varied based on hash)
      const spectralVariant = rnd();
      if (spectralVariant < 0.3) {
        drawSpectralWaterfall(voice, section);
      } else if (spectralVariant < 0.5) {
        drawFormantContours(voice, section);
      } else {
        drawSpectralBands(voice, section);
      }
      // Secondary elements
      if (rndBool(0.5)) drawHarmonicStacks(voice, section);
      if (rndBool(0.4)) drawAttackTransients(voice, section);
      if (rndBool(0.35)) drawResonanceBells(voice, section);
      break;

    case "spiral":
      if (rndBool(0.5)) {
        drawSpiralPaths(voice, section);
      } else {
        drawCircularNotation(voice, section);
      }
      if (rndBool(0.4)) drawRitualSymbols(voice, section);
      break;
  }
}

function drawVoice(voice, section) {
  let activeMode;

  if (features.blendType === "voiceBased") {
    activeMode = voice.assignedMode;
  } else if (features.blendType === "sectional") {
    activeMode = section.assignedMode;
  } else {
    // Dominant blend: primary mode with secondary accents
    activeMode = features.primaryMode;
  }

  // Draw primary mode
  drawModeElements(activeMode, voice, section);

  // Add secondary mode accents (for dominant blend)
  if (features.blendType === "dominant" && features.secondaryModes.length > 0) {
    const accentChance = 0.3;
    for (const secondaryMode of features.secondaryModes) {
      if (rndBool(accentChance * features.densityValue)) {
        drawModeElements(secondaryMode, voice, section);
      }
    }
  }
}

// ============================================================
// NOTATION MARKS
// ============================================================

function drawNotationMarks() {
  textFont("serif");
  textAlign(LEFT, TOP);

  // === TOP LEFT: Title area (above the score) ===
  // Opus/work number or dedication - more musical than "mode names"
  const titleY = 12 * scaleFactor;
  fill(features.palette.ink);
  noStroke();

  // Generate musical title
  const opusNum = rndInt(1, 99);
  const workTitles = [
    `Op. ${opusNum}`,
    `No. ${rndInt(1, 12)}`,
    `Study ${rndChoice(["I", "II", "III", "IV", "V"])}`,
    `Fragment ${rndInt(1, 7)}`,
    `Étude`,
    `Notation ${rndChoice(["α", "β", "γ", "δ"])}`,
    `Score ${rndInt(1, 50)}`
  ];
  textSize(11 * scaleFactor);
  text(rndChoice(workTitles), MARGIN, titleY);

  // Dedication or instrumentation (right side, top)
  const dedications = [
    "for ensemble",
    "for any instruments",
    "for variable forces",
    `for ${rndInt(2, 8)} players`,
    "für Orchester",
    "pour orchestre",
    "per ensemble",
    ""  // sometimes none
  ];
  const dedication = rndChoice(dedications);
  if (dedication) {
    textStyle(ITALIC);
    textSize(9 * scaleFactor);
    fill(features.palette.inkLight);
    textAlign(RIGHT, TOP);
    text(dedication, WIDTH - MARGIN, titleY);
    textAlign(LEFT, TOP);
    textStyle(NORMAL);
  }

  // === TEMPO AND TIME SIGNATURE: Just above the staff ===
  const headerY = MARGIN - 22 * scaleFactor;

  // Time signature - positioned at far left margin
  fill(features.palette.ink);
  textSize(13 * scaleFactor);
  textStyle(BOLD);
  text(features.timeSignature, MARGIN, headerY);
  textStyle(NORMAL);

  // Tempo marking - offset to the right of time signature
  textStyle(ITALIC);
  textSize(11 * scaleFactor);
  // Measure time signature width and add gap
  const timeWidth = textWidth(features.timeSignature);
  text(features.tempo, MARGIN + timeWidth + 15 * scaleFactor, headerY);
  textStyle(NORMAL);

  // === SECTION MARKERS: Always show, positioned in score margin area ===
  if (features.sectionCount > 1) {
    const boxSize = 14 * scaleFactor;
    const markerY = MARGIN + 8 * scaleFactor;  // Just inside top of score area

    for (let i = 0; i < sections.length; i++) {
      const letter = String.fromCharCode(65 + i);
      const x = sections[i].xStart + 5 * scaleFactor;

      // Draw box
      stroke(features.palette.ink);
      strokeWeight(1 * scaleFactor);
      noFill();
      rect(x, markerY, boxSize, boxSize);

      // Draw centered letter
      fill(features.palette.ink);
      noStroke();
      textSize(10 * scaleFactor);
      textAlign(CENTER, CENTER);
      text(letter, x + boxSize / 2, markerY + boxSize / 2);
      textAlign(LEFT, TOP);  // Reset
    }
  }

  // === DYNAMIC MARKINGS: Scattered in score area ===
  const dynamics = [
    "ppp", "pp", "p", "mp", "mf", "f", "ff", "fff",
    "sfz", "sfp", "sfpp", "fp", "fz", "rf", "rfz",
    "cresc.", "decresc.", "dim.", "morendo", "smorzando",
    "più f", "più p", "poco f", "poco p", "sub. p", "sub. f"
  ];
  textStyle(ITALIC);

  const numDynamics = Math.floor(rndInt(5, 12) * features.densityValue);
  for (let i = 0; i < numDynamics; i++) {
    const x = rnd(MARGIN + 40, WIDTH - MARGIN - 40);
    const y = rnd(MARGIN + 30, HEIGHT - MARGIN - 20);
    const size = rnd(8, 16) * scaleFactor;
    textSize(size);
    fill(features.palette.inkLight + (size > 12 ? "" : "bb"));
    text(rndChoice(dynamics), x, y);
  }
  textStyle(NORMAL);

  // Expression/technique markings
  drawExpressionMarks();

  // Articulation symbols
  drawArticulationSymbols();

  // Performance instructions
  drawPerformanceInstructions();

  // Metronome marks (bottom right)
  if (rndBool(0.5)) {
    drawMetronomeMarks();
  }

  // Footer: copyright/date style notation
  drawFooter();
}

function drawExpressionMarks() {
  const expressions = [
    // Italian expression terms
    "dolce", "cantabile", "espressivo", "con moto", "con fuoco",
    "agitato", "tranquillo", "appassionato", "brillante", "grazioso",
    "maestoso", "misterioso", "pesante", "leggiero", "marcato",
    "sostenuto", "tenuto", "staccato", "legato", "portato",
    // Character
    "con anima", "con brio", "con forza", "con spirito", "senza vibrato",
    "molto vibrato", "sul tasto", "sul ponticello", "ordinario",
    // Avant-garde terms
    "aleatorio", "cluster", "indeterminato", "spaziale", "timbrico"
  ];

  textStyle(ITALIC);
  const numExpressions = Math.floor(rndInt(2, 6) * features.densityValue);

  for (let i = 0; i < numExpressions; i++) {
    const x = rnd(MARGIN + 30, WIDTH - MARGIN - 80);
    const y = rnd(MARGIN, HEIGHT - MARGIN);
    const size = rnd(7, 12) * scaleFactor;
    textSize(size);
    fill(features.palette.inkLight);
    text(rndChoice(expressions), x, y);
  }
  textStyle(NORMAL);
}

function drawArticulationSymbols() {
  // Draw various articulation marks as symbols
  const numSymbols = Math.floor(rndInt(8, 20) * features.densityValue);

  for (let i = 0; i < numSymbols; i++) {
    const x = rnd(MARGIN + 20, WIDTH - MARGIN - 20);
    const y = rnd(MARGIN + 30, HEIGHT - MARGIN - 30);
    const size = rnd(4, 12) * scaleFactor;
    const symbolType = rndInt(0, 9);

    stroke(features.palette.ink);
    strokeWeight(0.8 * scaleFactor);
    noFill();

    push();
    translate(x, y);

    switch (symbolType) {
      case 0: // Accent (>)
        line(-size/2, 0, size/2, -size/3);
        line(-size/2, 0, size/2, size/3);
        break;
      case 1: // Staccato (dot)
        fill(features.palette.ink);
        noStroke();
        ellipse(0, 0, size/2, size/2);
        break;
      case 2: // Tenuto (line)
        line(-size/2, 0, size/2, 0);
        break;
      case 3: // Fermata
        arc(0, 0, size, size * 0.7, PI, TWO_PI);
        fill(features.palette.ink);
        ellipse(0, -size * 0.1, size * 0.2, size * 0.2);
        break;
      case 4: // Marcato (^)
        line(-size/3, size/4, 0, -size/3);
        line(0, -size/3, size/3, size/4);
        break;
      case 5: // Trill (tr with wavy)
        textSize(size);
        fill(features.palette.ink);
        noStroke();
        text("tr", 0, 0);
        stroke(features.palette.ink);
        for (let w = 0; w < 4; w++) {
          const wx = size/2 + w * 3 * scaleFactor;
          arc(wx, 0, 3 * scaleFactor, 2 * scaleFactor, 0, PI);
          arc(wx + 1.5 * scaleFactor, 0, 3 * scaleFactor, 2 * scaleFactor, PI, TWO_PI);
        }
        break;
      case 6: // Caesura (//)
        strokeWeight(1.2 * scaleFactor);
        line(-size/4, -size/2, size/4, size/2);
        line(0, -size/2, size/2, size/2);
        break;
      case 7: // Breath mark (')
        strokeWeight(1.5 * scaleFactor);
        arc(0, 0, size/2, size, -PI/2, PI/2);
        break;
      case 8: // Glissando wavy
        beginShape();
        for (let g = 0; g < 6; g++) {
          const gx = g * size/3;
          const gy = sin(g * PI) * size/4;
          vertex(gx, gy);
        }
        endShape();
        break;
      case 9: // Harmonic (diamond)
        beginShape();
        vertex(0, -size/2);
        vertex(size/3, 0);
        vertex(0, size/2);
        vertex(-size/3, 0);
        endShape(CLOSE);
        break;
    }

    pop();
  }
}

function drawPerformanceInstructions() {
  const instructions = [
    // Playing techniques
    "arco", "pizz.", "col legno", "col legno battuto", "col legno tratto",
    "spiccato", "sautillé", "ricochet", "jeté", "tremolo",
    "flautando", "harmonics", "sul G", "sul D", "sul A", "sul E",
    "mute", "senza sord.", "con sord.",
    // Woodwind/brass
    "flutter", "slap tongue", "multiphonic", "whistle tone", "key clicks",
    "half-valve", "stopped", "open", "cuivré", "bouché",
    // Extended techniques
    "overpressure", "scratch tone", "circular bowing", "behind the bridge",
    "on the bridge", "on the tailpiece", "bisbigliando",
    // Spatial/temporal
    "ad lib.", "a piacere", "senza misura", "freely", "attacca",
    "tacet", "G.P.", "lunga", "l.v.", "laissez vibrer"
  ];

  textFont("serif");
  const numInstructions = Math.floor(rndInt(2, 5) * features.densityValue);

  for (let i = 0; i < numInstructions; i++) {
    const x = rnd(MARGIN + 20, WIDTH - MARGIN - 100);
    const y = rnd(MARGIN, HEIGHT - MARGIN);
    const size = rnd(6, 11) * scaleFactor;
    textSize(size);
    textStyle(rndBool(0.5) ? ITALIC : NORMAL);
    fill(features.palette.ink + "bb");
    text(rndChoice(instructions), x, y);
  }
  textStyle(NORMAL);
}

function drawMetronomeMarks() {
  // Metronome marking - hand-drawn note symbol
  const noteTypes = ["quarter", "half", "eighth", "dotted"];
  const bpm = rndInt(40, 180);
  const noteType = rndChoice(noteTypes);

  // Calculate position after tempo
  textSize(10 * scaleFactor);
  const timeWidth = textWidth(features.timeSignature);
  const tempoWidth = textWidth(features.tempo);
  const metroX = MARGIN + timeWidth + 15 * scaleFactor + tempoWidth + 25 * scaleFactor;

  // Note positioning - head at bottom, stem goes up
  const noteHeadY = MARGIN - 12 * scaleFactor;  // Note head position (lower)
  const noteSize = 4 * scaleFactor;
  const stemHeight = 14 * scaleFactor;

  // Note head (filled oval, tilted)
  fill(features.palette.ink);
  noStroke();
  push();
  translate(metroX, noteHeadY);
  rotate(-0.35);  // Slight tilt like engraved notes
  if (noteType === "half") {
    // Half note: hollow
    stroke(features.palette.ink);
    strokeWeight(1 * scaleFactor);
    noFill();
    ellipse(0, 0, noteSize * 1.5, noteSize);
  } else {
    // Quarter/eighth: filled
    ellipse(0, 0, noteSize * 1.5, noteSize);
  }
  pop();

  // Stem (goes up from right side of note head)
  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  const stemX = metroX + noteSize * 0.5;
  line(stemX, noteHeadY - noteSize * 0.3, stemX, noteHeadY - stemHeight);

  // Flag for eighth note
  if (noteType === "eighth") {
    noFill();
    stroke(features.palette.ink);
    strokeWeight(1 * scaleFactor);
    beginShape();
    vertex(stemX, noteHeadY - stemHeight);
    bezierVertex(
      stemX + noteSize * 1.5, noteHeadY - stemHeight + noteSize,
      stemX + noteSize * 1.5, noteHeadY - stemHeight + noteSize * 2.5,
      stemX + noteSize * 0.5, noteHeadY - stemHeight + noteSize * 3.5
    );
    endShape();
  }

  // Dot for dotted notes
  if (noteType === "dotted") {
    fill(features.palette.ink);
    noStroke();
    ellipse(metroX + noteSize * 1.3, noteHeadY, noteSize * 0.4, noteSize * 0.4);
  }

  // "= BPM" text aligned with note head
  noStroke();
  fill(features.palette.ink);
  textSize(11 * scaleFactor);
  textAlign(LEFT, CENTER);
  text(` = ${bpm}`, metroX + noteSize * 2, noteHeadY);
  textAlign(LEFT, TOP);  // Reset
}

function drawFooter() {
  // Musical score footer - duration and year
  const footerY = HEIGHT - 8 * scaleFactor;

  textSize(9 * scaleFactor);
  fill(features.palette.inkLight);

  // Right side: year
  textAlign(RIGHT, BOTTOM);
  const year = rndInt(1950, 2024);
  text(year.toString(), WIDTH - MARGIN, footerY);

  // Center/Left: duration indication - more variants
  textAlign(CENTER, BOTTOM);
  const durations = [
    "ca. 2'",
    "ca. 3'",
    "ca. 4'",
    "ca. 5'",
    "ca. 6'",
    "ca. 7–10'",
    "ca. 8–12'",
    "ca. 10–15'",
    "ca. 12'",
    "~2'30\"",
    "~3'45\"",
    "~4'30\"",
    "~5'00\"",
    "~6'20\"",
    "~8'00\"",
    "duration: variable",
    "duration: indeterminate",
    "duration: open",
    "duration: flexible",
    "approx. 4 min.",
    "approx. 6 min.",
    "approx. 8 min.",
    "3–5 minutes",
    "5–8 minutes",
    "7–12 minutes",
    "performance duration varies"
  ];
  const duration = rndChoice(durations);
  text(duration, WIDTH / 2, footerY);

  textAlign(LEFT, TOP);  // Reset
}

function applyPalindromeSymmetry() {
  if (!features.hasSymmetry) return;

  const img = get(Math.floor(WIDTH/2), 0, Math.floor(WIDTH/2), HEIGHT);
  push();
  translate(WIDTH/2, 0);
  scale(-1, 1);
  image(img, 0, 0);
  pop();

  stroke(features.palette.accent + "50");
  strokeWeight(2 * scaleFactor);
  for (let y = MARGIN; y < HEIGHT - MARGIN; y += 18 * scaleFactor) {
    line(WIDTH/2, y, WIDTH/2, y + 9 * scaleFactor);
  }
}

// ============================================================
// MAIN
// ============================================================

function setup() {
  canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("sketch-holder");

  generateFeatures();
  setupComposition();
  noLoop();
  drawScore();

  if (typeof window !== "undefined") {
    window.getFeatures = () => features;
    window.getHash = () => hash;
    window.regenerate = regenerate;
    window.setParameter = setParameter;
    window.resetToOriginal = resetToOriginal;
    window.hasModifications = hasModifications;
    window.getRarityCurves = getRarityCurves;
    window.setHiRes = setHiRes;
    window.getModes = () => MODES;
  }
}

function drawScore() {
  R = initRandom(hash);

  drawPaper();
  drawStaves();

  for (const section of sections) {
    for (const voice of voices) {
      drawVoice(voice, section);
    }
  }

  if (features.hasSymmetry) {
    applyPalindromeSymmetry();
  }

  drawNotationMarks();
  drawVignette();
}

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

  hasOverrides = false;
  generateFeatures();
  setupComposition();
  drawScore();

  window.dispatchEvent(new CustomEvent("featuresUpdated", { detail: features }));
}

function setHiRes(enabled) {
  hiResMode = enabled;
  scaleFactor = enabled ? 3 : 1;
  WIDTH = enabled ? 3840 : 1280;
  HEIGHT = enabled ? 2160 : 720;

  resizeCanvas(WIDTH, HEIGHT);
  setupComposition();
  drawScore();
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas(`graphical-score-${features.seed}`, "png");
  }
  if (key === "r" || key === "R") {
    regenerate();
  }
  if (key === "h" || key === "H") {
    setHiRes(!hiResMode);
  }
}

if (typeof module !== "undefined") {
  module.exports = { generateFeatures, features, hash, MODES };
}
