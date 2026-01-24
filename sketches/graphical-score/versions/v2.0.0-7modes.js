/**
 * Graphical Score v2.0.0
 * A generative graphical score with 7 distinct modes inspired by
 * 20th century avant-garde composers
 *
 * Modes: Artikulation, UPIC, Cluster, Graph, Chance, Spectral, Spiral
 * Features layered hybrid blending system
 *
 * @version 2.0.0
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

  // Paper texture
  noStroke();
  const textureCount = hiResMode ? 12000 : 4000;
  for (let i = 0; i < textureCount; i++) {
    const x = rnd(0, WIDTH);
    const y = rnd(0, HEIGHT);
    const size = rnd(0.5, 2) * scaleFactor;
    fill(features.palette.paperDark + "18");
    ellipse(x, y, size, size);
  }

  // Aged edges
  for (let i = 0; i < 80; i++) {
    const edge = rndInt(0, 3);
    let x, y;
    const edgeWidth = 25 * scaleFactor;
    if (edge === 0) { x = rnd(0, WIDTH); y = rnd(0, edgeWidth); }
    else if (edge === 1) { x = rnd(0, WIDTH); y = rnd(HEIGHT - edgeWidth, HEIGHT); }
    else if (edge === 2) { x = rnd(0, edgeWidth); y = rnd(0, HEIGHT); }
    else { x = rnd(WIDTH - edgeWidth, WIDTH); y = rnd(0, HEIGHT); }

    fill(features.palette.faded + "25");
    ellipse(x, y, rnd(10, 35) * scaleFactor, rnd(10, 35) * scaleFactor);
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
// MODE-SPECIFIC DRAWING: SPECTRAL (Murail/Grisey)
// ============================================================

function drawSpectralBands(voice, section) {
  const numBands = Math.floor(rnd(5, 15) * features.densityValue);
  const gradient = features.palette.gradient ||
    ["#222244", "#444466", "#666688", "#8888aa", "#aaaacc"];

  for (let i = 0; i < numBands; i++) {
    const bandY = voice.yStart + (i / numBands) * voice.height;
    const bandHeight = (voice.height / numBands) * rnd(0.6, 1.2);
    const startX = rnd(section.xStart, section.xStart + section.width * 0.2);
    const endX = rnd(section.xEnd - section.width * 0.2, section.xEnd);

    // Frequency intensity varies
    const intensity = rnd(0.2, 1);
    const colorIdx = Math.floor(intensity * (gradient.length - 1));
    const bandColor = gradient[colorIdx] || features.palette.ink;

    fill(bandColor + Math.floor(intensity * 180).toString(16).padStart(2, '0'));
    noStroke();

    // Envelope shape
    beginShape();
    vertex(startX, bandY + bandHeight);

    const steps = 20;
    for (let j = 0; j <= steps; j++) {
      const x = startX + (j / steps) * (endX - startX);
      const envelope = sin((j / steps) * PI) * intensity;
      vertex(x, bandY + bandHeight * (1 - envelope));
    }

    vertex(endX, bandY + bandHeight);
    endShape(CLOSE);
  }
}

function drawHarmonicStacks(voice, section) {
  const numStacks = Math.floor(rnd(1, 4) * features.densityValue);

  for (let s = 0; s < numStacks; s++) {
    const baseX = rnd(section.xStart + 30, section.xEnd - 30);
    const baseY = voice.yEnd - 10;

    // Draw harmonic partials stacking upward
    const numPartials = rndInt(4, 12);
    stroke(features.palette.ink);

    for (let i = 1; i <= numPartials; i++) {
      const y = baseY - (Math.log(i) / Math.log(numPartials)) * voice.height * 0.8;
      const width = rnd(20, 50) * scaleFactor / i;
      const alpha = Math.floor(255 / i);

      strokeWeight((features.lineWeight / i) * scaleFactor);
      stroke(features.palette.ink + alpha.toString(16).padStart(2, '0'));
      line(baseX - width/2, y, baseX + width/2, y);

      // Partial number
      if (rndBool(0.3)) {
        noStroke();
        fill(features.palette.inkLight);
        textSize(6 * scaleFactor);
        text(i.toString(), baseX + width/2 + 3 * scaleFactor, y + 2 * scaleFactor);
      }
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
      drawSpectralBands(voice, section);
      if (rndBool(0.6)) drawHarmonicStacks(voice, section);
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
  fill(features.palette.ink);
  noStroke();
  textFont("serif");
  textSize(14 * scaleFactor);
  textAlign(LEFT, TOP);
  text(features.timeSignature, MARGIN + 5 * scaleFactor, MARGIN - 28 * scaleFactor);

  textStyle(ITALIC);
  textSize(12 * scaleFactor);
  text(features.tempo, MARGIN + 45 * scaleFactor, MARGIN - 28 * scaleFactor);
  textStyle(NORMAL);

  // Mode indicator
  textSize(10 * scaleFactor);
  fill(features.palette.inkLight);
  const modeText = features.activeModes.map(m => MODES[m].name).join(" + ");
  text(modeText, WIDTH - MARGIN - textWidth(modeText), MARGIN - 28 * scaleFactor);

  // Dynamic markings
  const dynamics = ["pp", "p", "mp", "mf", "f", "ff", "sfz", "cresc.", "dim."];
  textSize(9 * scaleFactor);
  textStyle(ITALIC);

  for (let i = 0; i < rndInt(3, 7); i++) {
    const x = rnd(MARGIN + 50, WIDTH - MARGIN - 30);
    const y = rnd(MARGIN, HEIGHT - MARGIN);
    fill(features.palette.inkLight);
    text(rndChoice(dynamics), x, y);
  }
  textStyle(NORMAL);

  // Section markers
  if (features.sectionCount > 1) {
    for (let i = 0; i < sections.length; i++) {
      const letter = String.fromCharCode(65 + i);
      const x = sections[i].xStart + 10 * scaleFactor;
      const y = MARGIN - 18 * scaleFactor;

      stroke(features.palette.ink);
      strokeWeight(1 * scaleFactor);
      noFill();
      rect(x - 3 * scaleFactor, y - 2 * scaleFactor, 14 * scaleFactor, 14 * scaleFactor);

      fill(features.palette.ink);
      noStroke();
      textSize(10 * scaleFactor);
      text(letter, x, y);
    }
  }
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
