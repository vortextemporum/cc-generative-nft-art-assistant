/**
 * Graphical Score
 * A generative graphical score inspired by Ligeti and Xenakis
 *
 * Creates semi-performable manuscripts with archival aesthetics,
 * combining architectural grandeur with micropolyphonic density.
 *
 * @version 1.0.0
 */

// ============================================================
// HASH-BASED RANDOMNESS (Art Blocks Compatible)
// ============================================================

let hash = "0x" + Array(64).fill(0).map(() =>
  "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}

// sfc32 PRNG - fast, high-quality randomness
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

// ============================================================
// ARCHIVAL COLOR PALETTES
// ============================================================

const PALETTES = {
  sepia: {
    paper: "#f4efe4",
    paperDark: "#e8e0cf",
    ink: "#2a1f14",
    inkLight: "#5c4a3a",
    accent: "#8b4513",
    faded: "#9c8b7a"
  },
  blueprintFaded: {
    paper: "#e8eef4",
    paperDark: "#d4dde8",
    ink: "#1a2f4a",
    inkLight: "#4a6080",
    accent: "#2f5070",
    faded: "#8090a0"
  },
  manuscript: {
    paper: "#f5f0e1",
    paperDark: "#e5dcc8",
    ink: "#1a1a1a",
    inkLight: "#4a4a4a",
    accent: "#6b3a3a",
    faded: "#8a8070"
  },
  parchment: {
    paper: "#f2e8d5",
    paperDark: "#e0d4be",
    ink: "#3a2a1a",
    inkLight: "#6a5a4a",
    accent: "#7a4a2a",
    faded: "#a09080"
  },
  aged: {
    paper: "#ebe3d3",
    paperDark: "#d8ccb8",
    ink: "#2f2218",
    inkLight: "#5f5040",
    accent: "#704820",
    faded: "#907860"
  }
};

// ============================================================
// FEATURES SYSTEM
// ============================================================

let features = {};
let originalFeatures = {};
let hasOverrides = false;

const RARITY_CURVES = {
  style: {
    probabilities: [0.50, 0.25, 0.15, 0.10],
    labels: ["hybrid", "ligeti-leaning", "xenakis-leaning", "pure"]
  },
  pureStyle: {
    probabilities: [0.50, 0.50],
    labels: ["ligeti", "xenakis"]
  },
  voiceCount: {
    probabilities: [0.55, 0.25, 0.12, 0.08],
    labels: ["ensemble (3-5)", "chamber (6-8)", "solo (1-2)", "orchestra (9-12)"]
  },
  structure: {
    probabilities: [0.45, 0.30, 0.17, 0.08],
    labels: ["flowing", "sectioned", "mathematical", "palindrome"]
  },
  density: {
    probabilities: [0.50, 0.25, 0.15, 0.10],
    labels: ["balanced", "dense", "sparse", "extreme"]
  },
  contrast: {
    probabilities: [0.45, 0.30, 0.18, 0.07],
    labels: ["moderate", "high", "low", "extreme"]
  },
  palette: {
    probabilities: [0.30, 0.25, 0.20, 0.15, 0.10],
    labels: ["sepia", "manuscript", "parchment", "aged", "blueprint"]
  }
};

function generateFeatures() {
  R = initRandom(hash);

  // Style (determines visual language)
  const styleRarity = rollRarity(0.50, 0.25, 0.15, 0.10);
  let style, pureStyleType = null;
  if (styleRarity === "common") style = "hybrid";
  else if (styleRarity === "uncommon") style = "ligeti-leaning";
  else if (styleRarity === "rare") style = "xenakis-leaning";
  else {
    style = "pure";
    pureStyleType = rndBool(0.5) ? "ligeti" : "xenakis";
  }

  // Voice count
  const voiceRarity = rollRarity(0.55, 0.25, 0.12, 0.08);
  let voiceCount;
  if (voiceRarity === "common") voiceCount = rndInt(3, 5);
  else if (voiceRarity === "uncommon") voiceCount = rndInt(6, 8);
  else if (voiceRarity === "rare") voiceCount = rndInt(1, 2);
  else voiceCount = rndInt(9, 12);

  // Structure
  const structureRarity = rollRarity(0.45, 0.30, 0.17, 0.08);
  let structure, sectionCount = 1;
  if (structureRarity === "common") {
    structure = "flowing";
    sectionCount = 1;
  } else if (structureRarity === "uncommon") {
    structure = "sectioned";
    sectionCount = rndInt(2, 4);
  } else if (structureRarity === "rare") {
    structure = "mathematical";
    sectionCount = rndInt(3, 5);
  } else {
    structure = "palindrome";
    sectionCount = rndInt(3, 7);
  }

  // Density
  const densityRarity = rollRarity(0.50, 0.25, 0.15, 0.10);
  let density, densityValue;
  if (densityRarity === "common") {
    density = "balanced";
    densityValue = rnd(0.4, 0.6);
  } else if (densityRarity === "uncommon") {
    density = "dense";
    densityValue = rnd(0.7, 0.85);
  } else if (densityRarity === "rare") {
    density = "sparse";
    densityValue = rnd(0.15, 0.3);
  } else {
    density = "extreme";
    densityValue = rndBool(0.5) ? rnd(0.05, 0.15) : rnd(0.85, 0.95);
  }

  // Contrast (variation in density across the score)
  const contrastRarity = rollRarity(0.45, 0.30, 0.18, 0.07);
  let contrast, contrastValue;
  if (contrastRarity === "common") {
    contrast = "moderate";
    contrastValue = rnd(0.3, 0.5);
  } else if (contrastRarity === "uncommon") {
    contrast = "high";
    contrastValue = rnd(0.6, 0.8);
  } else if (contrastRarity === "rare") {
    contrast = "low";
    contrastValue = rnd(0.1, 0.2);
  } else {
    contrast = "extreme";
    contrastValue = rnd(0.85, 1.0);
  }

  // Palette
  const paletteNames = ["sepia", "manuscript", "parchment", "aged", "blueprintFaded"];
  const paletteName = rndChoice(paletteNames);

  // Visual element weights (influenced by style)
  let elementWeights = {
    lines: 0.25,
    clouds: 0.25,
    dots: 0.25,
    shapes: 0.25
  };

  if (style === "ligeti-leaning" || (style === "pure" && pureStyleType === "ligeti")) {
    elementWeights = { lines: 0.15, clouds: 0.40, dots: 0.35, shapes: 0.10 };
  } else if (style === "xenakis-leaning" || (style === "pure" && pureStyleType === "xenakis")) {
    elementWeights = { lines: 0.35, clouds: 0.15, dots: 0.15, shapes: 0.35 };
  }

  // Time signature and tempo indication (aesthetic)
  const timeSignatures = ["4/4", "3/4", "5/4", "6/8", "7/8", "free"];
  const tempoMarkings = [
    "Lento", "Adagio", "Andante", "Moderato", "Allegro",
    "Presto", "Senza tempo", "Liberamente"
  ];

  features = {
    // Core features
    style,
    styleRarity,
    pureStyleType,
    voiceCount,
    voiceRarity,
    structure,
    structureRarity,
    sectionCount,
    density,
    densityRarity,
    densityValue,
    contrast,
    contrastRarity,
    contrastValue,
    paletteName,
    palette: PALETTES[paletteName],

    // Visual weights
    elementWeights,

    // Musical notation aesthetics
    timeSignature: rndChoice(timeSignatures),
    tempo: rndChoice(tempoMarkings),

    // Technical parameters
    seed: hash.slice(2, 10),
    gridResolution: rndInt(40, 80),
    noiseScale: rnd(0.002, 0.008),
    lineWeight: rnd(0.5, 2.0),

    // Special features
    hasSymmetry: structure === "palindrome",
    hasMicropolyphony: style === "ligeti-leaning" || (style === "pure" && pureStyleType === "ligeti") || rndBool(0.3),
    hasGlissandi: style === "xenakis-leaning" || (style === "pure" && pureStyleType === "xenakis") || rndBool(0.4)
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

function hasModifications() {
  return hasOverrides;
}

function getRarityCurves() {
  return RARITY_CURVES;
}

// ============================================================
// DRAWING SYSTEM
// ============================================================

let canvas;
const WIDTH = 1280;
const HEIGHT = 720;
const MARGIN = 60;

// Voice class - represents one "instrument" layer
class Voice {
  constructor(index, total, yStart, yEnd) {
    this.index = index;
    this.yStart = yStart;
    this.yEnd = yEnd;
    this.yCenter = (yStart + yEnd) / 2;
    this.height = yEnd - yStart;

    // Voice character
    this.register = rnd(); // 0 = low, 1 = high
    this.activity = rnd(0.3, 1.0);
    this.density = rnd() * features.densityValue;

    // Drawing style preference for this voice
    const roll = R();
    if (roll < features.elementWeights.lines) this.preferredElement = "lines";
    else if (roll < features.elementWeights.lines + features.elementWeights.clouds) this.preferredElement = "clouds";
    else if (roll < features.elementWeights.lines + features.elementWeights.clouds + features.elementWeights.dots) this.preferredElement = "dots";
    else this.preferredElement = "shapes";
  }
}

// Section class - represents a temporal segment
class Section {
  constructor(index, total, xStart, xEnd) {
    this.index = index;
    this.xStart = xStart;
    this.xEnd = xEnd;
    this.width = xEnd - xStart;
    this.xCenter = (xStart + xEnd) / 2;

    // Section character
    this.intensity = rnd();
    this.densityMod = rnd(0.5, 1.5);

    // For palindrome structure
    this.mirrorIndex = total - 1 - index;
  }
}

let voices = [];
let sections = [];

function setupComposition() {
  voices = [];
  sections = [];

  // Create voices with vertical distribution
  const voiceHeight = (HEIGHT - MARGIN * 2) / features.voiceCount;
  for (let i = 0; i < features.voiceCount; i++) {
    const yStart = MARGIN + i * voiceHeight;
    const yEnd = yStart + voiceHeight;
    voices.push(new Voice(i, features.voiceCount, yStart, yEnd));
  }

  // Create sections with horizontal distribution
  const scoreWidth = WIDTH - MARGIN * 2;

  if (features.structure === "mathematical") {
    // Golden ratio divisions
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
    // Equal or varied divisions
    for (let i = 0; i < features.sectionCount; i++) {
      const variance = features.structure === "flowing" ? 0 : rnd(-0.1, 0.1);
      const xStart = MARGIN + (i / features.sectionCount + variance) * scoreWidth;
      const xEnd = MARGIN + ((i + 1) / features.sectionCount + variance) * scoreWidth;
      sections.push(new Section(i, features.sectionCount,
        Math.max(MARGIN, xStart),
        Math.min(WIDTH - MARGIN, xEnd)));
    }
  }
}

// ============================================================
// DRAWING ELEMENTS
// ============================================================

function drawPaper() {
  // Base paper color
  background(features.palette.paper);

  // Paper texture
  noStroke();
  for (let i = 0; i < 5000; i++) {
    const x = rnd(0, WIDTH);
    const y = rnd(0, HEIGHT);
    const size = rnd(0.5, 2);
    fill(features.palette.paperDark + "20");
    ellipse(x, y, size, size);
  }

  // Aged edges
  for (let i = 0; i < 100; i++) {
    const edge = rndInt(0, 3);
    let x, y;
    if (edge === 0) { x = rnd(0, WIDTH); y = rnd(0, 30); }
    else if (edge === 1) { x = rnd(0, WIDTH); y = rnd(HEIGHT - 30, HEIGHT); }
    else if (edge === 2) { x = rnd(0, 30); y = rnd(0, HEIGHT); }
    else { x = rnd(WIDTH - 30, WIDTH); y = rnd(0, HEIGHT); }

    fill(features.palette.faded + "30");
    ellipse(x, y, rnd(10, 40), rnd(10, 40));
  }
}

function drawStaves() {
  // Draw subtle horizontal guidelines for each voice
  stroke(features.palette.faded + "40");
  strokeWeight(0.5);

  for (const voice of voices) {
    // Staff lines (5 lines like traditional music notation, but subtle)
    const staffSpacing = voice.height / 6;
    for (let i = 1; i <= 5; i++) {
      const y = voice.yStart + i * staffSpacing;
      line(MARGIN, y, WIDTH - MARGIN, y);
    }
  }

  // Section dividers
  if (features.structure !== "flowing" && sections.length > 1) {
    stroke(features.palette.ink + "30");
    strokeWeight(1);
    for (let i = 1; i < sections.length; i++) {
      const x = sections[i].xStart;
      // Dashed line
      for (let y = MARGIN; y < HEIGHT - MARGIN; y += 10) {
        line(x, y, x, y + 5);
      }
    }
  }
}

function drawRuledLines(voice, section) {
  // Xenakis-style glissandi and ruled lines
  const numLines = Math.floor(rnd(2, 8) * features.densityValue * section.densityMod);

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight);

  for (let i = 0; i < numLines; i++) {
    const startX = rnd(section.xStart, section.xEnd - 50);
    const endX = rnd(startX + 20, Math.min(startX + 200, section.xEnd));
    const startY = rnd(voice.yStart + 10, voice.yEnd - 10);
    const endY = rnd(voice.yStart + 10, voice.yEnd - 10);

    // Straight or curved
    if (rndBool(0.6)) {
      line(startX, startY, endX, endY);
    } else {
      // Bezier curve
      noFill();
      const cx1 = rnd(startX, endX);
      const cy1 = rnd(voice.yStart, voice.yEnd);
      const cx2 = rnd(startX, endX);
      const cy2 = rnd(voice.yStart, voice.yEnd);
      bezier(startX, startY, cx1, cy1, cx2, cy2, endX, endY);
    }

    // Parallel lines (common in Xenakis)
    if (rndBool(0.3)) {
      const offset = rnd(3, 8);
      if (rndBool(0.6)) {
        line(startX, startY + offset, endX, endY + offset);
      }
    }
  }
}

function drawDensityClouds(voice, section) {
  // Ligeti-style micropolyphonic clusters
  const numClouds = Math.floor(rnd(1, 4) * features.densityValue * section.densityMod);

  for (let c = 0; c < numClouds; c++) {
    const cloudX = rnd(section.xStart + 20, section.xEnd - 20);
    const cloudY = rnd(voice.yStart + 20, voice.yEnd - 20);
    const cloudW = rnd(30, 120) * features.densityValue;
    const cloudH = rnd(20, voice.height * 0.6);

    // Cloud made of many small marks
    const numMarks = Math.floor(rnd(20, 100) * features.densityValue);

    for (let i = 0; i < numMarks; i++) {
      const mx = cloudX + rndGaussian(0, cloudW / 3);
      const my = cloudY + rndGaussian(0, cloudH / 3);

      // Various mark types
      const markType = rndInt(0, 3);
      const alpha = Math.floor(rnd(40, 180));

      if (markType === 0) {
        // Small dot
        fill(features.palette.ink + alpha.toString(16).padStart(2, '0'));
        noStroke();
        ellipse(mx, my, rnd(1, 4), rnd(1, 4));
      } else if (markType === 1) {
        // Short line
        stroke(features.palette.ink + alpha.toString(16).padStart(2, '0'));
        strokeWeight(rnd(0.3, 1.2));
        const angle = rnd(0, TWO_PI);
        const len = rnd(2, 8);
        line(mx, my, mx + cos(angle) * len, my + sin(angle) * len);
      } else if (markType === 2) {
        // Tiny squiggle
        stroke(features.palette.ink + alpha.toString(16).padStart(2, '0'));
        strokeWeight(rnd(0.3, 0.8));
        noFill();
        beginShape();
        for (let j = 0; j < 4; j++) {
          vertex(mx + j * 2, my + rndGaussian(0, 2));
        }
        endShape();
      } else {
        // Small rectangle
        fill(features.palette.ink + alpha.toString(16).padStart(2, '0'));
        noStroke();
        rect(mx, my, rnd(2, 6), rnd(1, 3));
      }
    }
  }
}

function drawPointillistDots(voice, section) {
  // Individual note events as dots
  const numDots = Math.floor(rnd(10, 50) * features.densityValue * section.densityMod);

  for (let i = 0; i < numDots; i++) {
    const x = rnd(section.xStart + 5, section.xEnd - 5);
    const y = rnd(voice.yStart + 5, voice.yEnd - 5);
    const size = rnd(2, 8);

    // Dot style variations
    const style = rndInt(0, 4);

    if (style === 0) {
      // Filled circle
      fill(features.palette.ink);
      noStroke();
      ellipse(x, y, size, size);
    } else if (style === 1) {
      // Open circle
      noFill();
      stroke(features.palette.ink);
      strokeWeight(features.lineWeight * 0.5);
      ellipse(x, y, size, size);
    } else if (style === 2) {
      // Diamond
      fill(features.palette.ink);
      noStroke();
      push();
      translate(x, y);
      rotate(QUARTER_PI);
      rect(-size/3, -size/3, size/1.5, size/1.5);
      pop();
    } else if (style === 3) {
      // Note head with stem
      fill(features.palette.ink);
      noStroke();
      ellipse(x, y, size, size * 0.7);
      stroke(features.palette.ink);
      strokeWeight(features.lineWeight * 0.5);
      line(x + size/2, y, x + size/2, y - size * 2);
    } else {
      // X mark
      stroke(features.palette.ink);
      strokeWeight(features.lineWeight * 0.5);
      const s = size / 2;
      line(x - s, y - s, x + s, y + s);
      line(x - s, y + s, x + s, y - s);
    }
  }
}

function drawGeometricShapes(voice, section) {
  // Architectural/geometric forms
  const numShapes = Math.floor(rnd(1, 5) * features.densityValue * section.densityMod);

  for (let i = 0; i < numShapes; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const w = rnd(20, 80);
    const h = rnd(10, Math.min(40, voice.height * 0.4));

    const shapeType = rndInt(0, 5);
    const filled = rndBool(0.3);

    if (filled) {
      fill(features.palette.ink + "40");
    } else {
      noFill();
    }
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight);

    if (shapeType === 0) {
      // Rectangle
      rect(x, y, w, h);
    } else if (shapeType === 1) {
      // Triangle
      triangle(x, y + h, x + w/2, y, x + w, y + h);
    } else if (shapeType === 2) {
      // Trapezoid
      quad(x + w*0.2, y, x + w*0.8, y, x + w, y + h, x, y + h);
    } else if (shapeType === 3) {
      // Arc/wedge
      arc(x + w/2, y + h, w, h * 2, PI, TWO_PI);
    } else if (shapeType === 4) {
      // Polygon
      beginShape();
      const sides = rndInt(5, 8);
      for (let j = 0; j < sides; j++) {
        const angle = (j / sides) * TWO_PI - HALF_PI;
        const px = x + w/2 + cos(angle) * w/2;
        const py = y + h/2 + sin(angle) * h/2;
        vertex(px, py);
      }
      endShape(CLOSE);
    } else {
      // Bracket/brace
      noFill();
      beginShape();
      vertex(x, y);
      bezierVertex(x + w*0.3, y, x + w*0.3, y + h/2, x + w*0.5, y + h/2);
      endShape();
      beginShape();
      vertex(x + w*0.5, y + h/2);
      bezierVertex(x + w*0.7, y + h/2, x + w*0.7, y + h, x + w, y + h);
      endShape();
    }
  }
}

function drawVoice(voice, section) {
  // Determine what to draw based on voice preference and style
  const roll = R();

  // Always draw the preferred element
  if (voice.preferredElement === "lines" || (features.hasGlissandi && rndBool(0.4))) {
    drawRuledLines(voice, section);
  }
  if (voice.preferredElement === "clouds" || (features.hasMicropolyphony && rndBool(0.5))) {
    drawDensityClouds(voice, section);
  }
  if (voice.preferredElement === "dots") {
    drawPointillistDots(voice, section);
  }
  if (voice.preferredElement === "shapes") {
    drawGeometricShapes(voice, section);
  }

  // Sometimes add secondary elements
  if (rndBool(0.3 * features.densityValue)) {
    const secondary = rndChoice(["lines", "clouds", "dots", "shapes"]);
    if (secondary === "lines") drawRuledLines(voice, section);
    else if (secondary === "clouds") drawDensityClouds(voice, section);
    else if (secondary === "dots") drawPointillistDots(voice, section);
    else drawGeometricShapes(voice, section);
  }
}

function drawNotationMarks() {
  // Musical notation aesthetic elements

  // Time signature
  fill(features.palette.ink);
  noStroke();
  textFont("serif");
  textSize(14);
  textAlign(LEFT, TOP);
  text(features.timeSignature, MARGIN + 5, MARGIN - 25);

  // Tempo marking
  textFont("serif");
  textStyle(ITALIC);
  textSize(12);
  text(features.tempo, MARGIN + 40, MARGIN - 25);
  textStyle(NORMAL);

  // Dynamic markings scattered
  const dynamics = ["pp", "p", "mp", "mf", "f", "ff", "sfz", "cresc.", "dim."];
  textSize(10);
  textStyle(ITALIC);

  for (let i = 0; i < rndInt(3, 8); i++) {
    const x = rnd(MARGIN + 50, WIDTH - MARGIN - 30);
    const y = rnd(MARGIN, HEIGHT - MARGIN);
    fill(features.palette.inkLight);
    text(rndChoice(dynamics), x, y);
  }
  textStyle(NORMAL);

  // Rehearsal marks (boxed letters)
  if (features.sectionCount > 1) {
    for (let i = 0; i < sections.length; i++) {
      const letter = String.fromCharCode(65 + i); // A, B, C...
      const x = sections[i].xStart + 10;
      const y = MARGIN - 15;

      stroke(features.palette.ink);
      strokeWeight(1);
      noFill();
      rect(x - 3, y - 2, 14, 14);

      fill(features.palette.ink);
      noStroke();
      textSize(10);
      textAlign(LEFT, TOP);
      text(letter, x, y);
    }
  }
}

function applyPalindromeSymmetry() {
  if (!features.hasSymmetry) return;

  // Mirror the right half of the canvas
  const img = get(WIDTH/2, 0, WIDTH/2, HEIGHT);
  push();
  translate(WIDTH/2, 0);
  scale(-1, 1);
  image(img, 0, 0);
  pop();

  // Add center axis mark
  stroke(features.palette.accent + "60");
  strokeWeight(2);
  for (let y = MARGIN; y < HEIGHT - MARGIN; y += 20) {
    line(WIDTH/2, y, WIDTH/2, y + 10);
  }
}

// ============================================================
// MAIN SETUP AND DRAW
// ============================================================

function setup() {
  canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("sketch-holder");

  generateFeatures();
  setupComposition();

  // Draw once (static)
  noLoop();
  drawScore();

  // Expose features for viewer
  if (typeof window !== "undefined") {
    window.getFeatures = () => features;
    window.getHash = () => hash;
    window.regenerate = regenerate;
    window.setParameter = setParameter;
    window.resetToOriginal = resetToOriginal;
    window.hasModifications = hasModifications;
    window.getRarityCurves = getRarityCurves;
  }
}

function drawScore() {
  // Reset random seed for consistent drawing
  R = initRandom(hash);

  // 1. Paper background with texture
  drawPaper();

  // 2. Staff lines and section dividers
  drawStaves();

  // 3. Draw each voice in each section
  for (const section of sections) {
    for (const voice of voices) {
      drawVoice(voice, section);
    }
  }

  // 4. Apply palindrome symmetry if needed
  if (features.hasSymmetry) {
    applyPalindromeSymmetry();
  }

  // 5. Add notation marks (dynamics, time signature, etc.)
  drawNotationMarks();

  // 6. Subtle vignette
  drawVignette();
}

function drawVignette() {
  // Subtle darkening at edges
  noStroke();
  const vignetteColor = color(features.palette.paperDark);
  vignetteColor.setAlpha(0);

  for (let i = 0; i < 50; i++) {
    const alpha = map(i, 0, 50, 30, 0);
    fill(red(vignetteColor), green(vignetteColor), blue(vignetteColor), alpha);

    // Top edge
    rect(0, i, WIDTH, 1);
    // Bottom edge
    rect(0, HEIGHT - i - 1, WIDTH, 1);
    // Left edge
    rect(i, 0, 1, HEIGHT);
    // Right edge
    rect(WIDTH - i - 1, 0, 1, HEIGHT);
  }
}

function regenerate() {
  // Generate new hash
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

  hasOverrides = false;
  generateFeatures();
  setupComposition();
  drawScore();

  // Dispatch event for viewer to update
  window.dispatchEvent(new CustomEvent("featuresUpdated", { detail: features }));
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas(`graphical-score-${features.seed}`, "png");
  }
  if (key === "r" || key === "R") {
    regenerate();
  }
}

// Export for module usage
if (typeof module !== "undefined") {
  module.exports = { generateFeatures, features, hash };
}
