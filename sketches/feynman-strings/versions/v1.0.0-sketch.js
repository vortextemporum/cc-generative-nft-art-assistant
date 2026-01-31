/**
 * Feynman Strings v1.0.0
 *
 * Generative art inspired by Feynman diagrams and string theory.
 * From technical particle physics notation to abstract quantum chaos.
 *
 * Modes:
 * - QED: Photons (wavy), electrons (straight), simple vertices
 * - QCD: Quarks (colored), gluons (curly), color charge dynamics
 * - String: Worldsheets, vibrating strings, dimensional membranes
 * - Vacuum: Virtual pairs, quantum foam, spacetime bubbles
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
// PARTICLE PHYSICS COLOR PALETTE
// ============================================================

const COLORS = {
  // Quark colors (QCD color charge)
  quarkRed: "#e63946",
  quarkGreen: "#2a9d8f",
  quarkBlue: "#457b9d",

  // Anti-quark colors
  antiRed: "#ff9f9f",    // cyan-ish (anti-red)
  antiGreen: "#d4a5ff",  // magenta-ish (anti-green)
  antiBlue: "#ffd166",   // yellow-ish (anti-blue)

  // Gluons (8 types, simplified to key colors)
  gluon: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dfe6e9", "#fd79a8", "#a29bfe"],

  // Leptons
  electron: "#1d3557",
  positron: "#a8dadc",
  muon: "#6c5ce7",
  tau: "#00b894",
  neutrino: "#b2bec3",  // ghostly, hard to see

  // Bosons
  photon: "#f1c40f",      // golden yellow (light!)
  wBoson: "#e17055",      // heavy, warm
  zBoson: "#636e72",      // neutral, gray
  higgs: "#fd79a8",       // special pink (rare!)
  graviton: "#dfe6e9",    // theoretical, faint

  // String theory
  string: "#74b9ff",
  worldsheet: "#81ecec",
  brane: "#a29bfe",
  calabiYau: "#fd79a8",

  // Vacuum/quantum foam
  virtualPair: "#636e72",
  foam: "#2d3436",
  fluctuation: "#b2bec3",

  // Backgrounds
  blackboard: "#0d1117",
  paper: "#f5f5f0",
  spacetime: "#1a1a2e"
};

const PALETTES = {
  // Dark palettes
  blackboard: {
    background: "#0d1117",
    line: "#e6e6e6",
    accent: "#f1c40f",
    dim: "#4a5568",
    grid: "#1a1f2a"
  },
  cosmic: {
    background: "#0a0a12",
    line: "#7ec8e3",
    accent: "#ff6b6b",
    dim: "#2d3748",
    grid: "#12121f"
  },
  void: {
    background: "#000000",
    line: "#ffffff",
    accent: "#ff0055",
    dim: "#333333",
    grid: "#0a0a0a"
  },
  midnight: {
    background: "#0d0d1a",
    line: "#c4b5fd",
    accent: "#a78bfa",
    dim: "#4c1d95",
    grid: "#1e1b4b"
  },
  matrix: {
    background: "#0a0f0a",
    line: "#22c55e",
    accent: "#4ade80",
    dim: "#166534",
    grid: "#14532d"
  },

  // Light palettes
  paper: {
    background: "#f5f5f0",
    line: "#1a1a1a",
    accent: "#e63946",
    dim: "#a0a0a0",
    grid: "#e8e8e0"
  },
  parchment: {
    background: "#f4efe4",
    line: "#2a1f14",
    accent: "#8b4513",
    dim: "#9c8b7a",
    grid: "#e8e0cf"
  },
  minimal: {
    background: "#ffffff",
    line: "#000000",
    accent: "#000000",
    dim: "#cccccc",
    grid: "#f0f0f0"
  },

  // Colored palettes
  blueprint: {
    background: "#1e3a5f",
    line: "#a8d5ff",
    accent: "#ffffff",
    dim: "#2d5a87",
    grid: "#264a70"
  },
  infrared: {
    background: "#1a0a0a",
    line: "#ff6b6b",
    accent: "#ffd93d",
    dim: "#8b0000",
    grid: "#2d1515"
  },
  plasma: {
    background: "#0f0520",
    line: "#f472b6",
    accent: "#38bdf8",
    dim: "#7c3aed",
    grid: "#1e1040"
  },
  quantum: {
    background: "#0a1628",
    line: "#67e8f9",
    accent: "#fbbf24",
    dim: "#0e7490",
    grid: "#132f4c"
  },
  lewitt: {
    background: "#f8f8f8",
    line: "#1a1a1a",
    accent: "#e63946",
    dim: "#666666",
    grid: "#dddddd"
  },
  lewittColor: {
    background: "#ffffff",
    line: "#000000",
    accent: "#ff0000",
    dim: "#0000ff",
    grid: "#ffff00"
  }
};

// ============================================================
// MODE DEFINITIONS
// ============================================================

const MODES = {
  qed: {
    name: "QED",
    fullName: "Quantum Electrodynamics",
    description: "Photons and electrons - the simplest quantum field theory",
    weight: 0.30,
    particles: ["electron", "positron", "photon"],
    elements: ["fermionLine", "photonPropagator", "vertex", "loop", "annihilation", "scattering"]
  },
  qcd: {
    name: "QCD",
    fullName: "Quantum Chromodynamics",
    description: "Quarks and gluons - color charge dynamics",
    weight: 0.25,
    particles: ["quark", "antiquark", "gluon"],
    elements: ["quarkLine", "gluonPropagator", "threeGluonVertex", "quarkGluonVertex", "colorLoop", "confinementTube"]
  },
  string: {
    name: "String",
    fullName: "String Theory",
    description: "Worldsheets, vibrating strings, extra dimensions",
    weight: 0.25,
    particles: ["string", "closedString", "brane"],
    elements: ["worldsheet", "stringMode", "braneIntersection", "compactDimension", "duality", "calabiYau"]
  },
  vacuum: {
    name: "Vacuum",
    fullName: "Quantum Vacuum",
    description: "Virtual particles, quantum foam, fluctuations",
    weight: 0.20,
    particles: ["virtualPair", "fluctuation"],
    elements: ["virtualLoop", "foamBubble", "uncertaintyCloud", "pairCreation", "casimirPlates", "vacuumEnergy"]
  }
};

// ============================================================
// FEATURE GENERATION
// ============================================================

let features = {};
let originalFeatures = {};
let hasOverrides = false;

function generateFeatures() {
  R = initRandom(hash);

  // Mode selection (can be single or blended)
  const modeBlendRoll = R();
  let modeCount, modeBlend;
  if (modeBlendRoll < 0.40) {
    modeCount = 1;
    modeBlend = "single";
  } else if (modeBlendRoll < 0.70) {
    modeCount = 2;
    modeBlend = "dual";
  } else if (modeBlendRoll < 0.90) {
    modeCount = 3;
    modeBlend = "triple";
  } else {
    modeCount = 4;
    modeBlend = "chaos";
  }

  // Select modes based on weights
  const modeKeys = Object.keys(MODES);
  const selectedModes = [];
  const availableModes = [...modeKeys];

  for (let i = 0; i < modeCount; i++) {
    const weights = availableModes.map(m => MODES[m].weight);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = R() * total;
    let chosen = 0;
    for (let j = 0; j < weights.length; j++) {
      r -= weights[j];
      if (r <= 0) { chosen = j; break; }
    }
    selectedModes.push(availableModes[chosen]);
    availableModes.splice(chosen, 1);
  }

  // Density (affects number of elements) - EXTENDED RANGE
  const densityRoll = R();
  let density, densityName;
  if (densityRoll < 0.10) {
    density = rnd(0.3, 0.5);
    densityName = "minimal";
  } else if (densityRoll < 0.30) {
    density = rnd(0.5, 0.8);
    densityName = "sparse";
  } else if (densityRoll < 0.55) {
    density = rnd(0.8, 1.2);
    densityName = "moderate";
  } else if (densityRoll < 0.80) {
    density = rnd(1.2, 1.8);
    densityName = "dense";
  } else if (densityRoll < 0.95) {
    density = rnd(1.8, 2.5);
    densityName = "intense";
  } else {
    density = rnd(2.5, 3.5);
    densityName = "chaotic";
  }

  // Palette selection
  const paletteKeys = Object.keys(PALETTES);
  const palette = rndChoice(paletteKeys);

  // Style (affects visual treatment)
  const styleRoll = R();
  let style;
  if (styleRoll < 0.15) {
    style = "technical";  // Clean, labeled, diagram-like
  } else if (styleRoll < 0.35) {
    style = "geometric";  // Sol LeWitt - systematic, grid-based
  } else if (styleRoll < 0.55) {
    style = "artistic";   // Balanced
  } else if (styleRoll < 0.75) {
    style = "abstract";   // Loose, flowing, poetic
  } else if (styleRoll < 0.90) {
    style = "chaotic";    // Extreme abstraction
  } else {
    style = "maximalist"; // Everything at once
  }

  // Composition
  const compositionRoll = R();
  let composition;
  if (compositionRoll < 0.20) {
    composition = "centered";
  } else if (compositionRoll < 0.40) {
    composition = "scattered";
  } else if (compositionRoll < 0.55) {
    composition = "flowing";
  } else if (compositionRoll < 0.70) {
    composition = "layered";
  } else if (compositionRoll < 0.85) {
    composition = "grid";      // Sol LeWitt style systematic grid
  } else {
    composition = "radial";    // Exploding from center
  }

  // Line weight - style dependent
  let lineWeight;
  if (style === "technical") {
    lineWeight = rnd(0.5, 1.5);
  } else if (style === "geometric") {
    lineWeight = rnd(1.5, 3);
  } else if (style === "maximalist") {
    lineWeight = rnd(2, 5);
  } else {
    lineWeight = rnd(1, 4);
  }

  // Special features (rare)
  const hasHiggs = rndBool(0.05);
  const hasCalabiYau = rndBool(0.03);
  const hasGraviton = rndBool(0.02);
  const hasSupersymmetry = rndBool(0.04);

  // Background pattern (Sol LeWitt influence)
  const backgroundPattern = rndChoice(["none", "grid", "lines", "dots", "arcs", "diagonal"]);
  const patternDensity = rnd(0.3, 1.0);

  // Vertex count - DRAMATICALLY INCREASED
  const baseVertices = Math.floor(8 + density * 25);
  const vertexCount = Math.max(5, baseVertices + rndInt(-3, 5));

  // Loop probability - EXTENDED RANGE
  const loopProbability = rnd(0.2, 0.9) * Math.min(density, 1.5);

  // Layer count for complex compositions
  const layerCount = Math.floor(2 + density * 3);

  // Connection density (how interconnected vertices are)
  const connectionDensity = rnd(0.3, 0.8) * density;

  // Labels (only for technical)
  const showLabels = style === "technical";

  // Arrow style
  const arrowStyle = style === "technical" ? "standard" : rndChoice(["standard", "bold", "subtle", "none"]);

  // Extra complexity features
  const hasBackgroundDiagrams = rndBool(0.4 * density);
  const hasOverlappingLayers = rndBool(0.5 * density);
  const symmetry = rndChoice(["none", "bilateral", "radial4", "radial6", "radial8"]);

  features = {
    modes: selectedModes,
    modeCount,
    modeBlend,
    density,
    densityName,
    palette,
    style,
    composition,
    lineWeight,
    hasHiggs,
    hasCalabiYau,
    hasGraviton,
    hasSupersymmetry,
    backgroundPattern,
    patternDensity,
    vertexCount,
    loopProbability,
    layerCount,
    connectionDensity,
    showLabels,
    arrowStyle,
    hasBackgroundDiagrams,
    hasOverlappingLayers,
    symmetry
  };

  originalFeatures = { ...features };
  return features;
}

// Dev mode: parameter override
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

// ============================================================
// DRAWING UTILITIES
// ============================================================

let canvas;
const SIZE = 700;
let pal;

function setup() {
  canvas = createCanvas(SIZE, SIZE);
  canvas.parent('sketch-holder');
  pixelDensity(2);
  noLoop();

  generateFeatures();
  render();

  // Expose for UI
  window.regenerate = regenerate;
  window.render = render;
  window.getFeatures = () => features;
  window.getHash = () => hash;
  window.setParameter = setParameter;
  window.resetToOriginal = resetToOriginal;
}

function drawScene() {
  R = initRandom(hash);
  // Re-consume the random calls from feature generation to sync state
  for (let i = 0; i < 100; i++) R();

  pal = PALETTES[features.palette];
  background(pal.background);

  // Draw background pattern (Sol LeWitt style)
  if (features.backgroundPattern !== "none") {
    drawBackgroundPattern();
  }

  // Draw background diagrams layer (faint)
  if (features.hasBackgroundDiagrams) {
    push();
    drawingContext.globalAlpha = 0.15;
    drawRandomDiagrams(Math.floor(features.density * 3), 0.5);
    pop();
  }

  // Apply symmetry if needed
  if (features.symmetry !== "none") {
    drawWithSymmetry();
  } else {
    // Draw based on composition
    switch (features.composition) {
      case "centered":
        drawCenteredComposition();
        break;
      case "scattered":
        drawScatteredComposition();
        break;
      case "flowing":
        drawFlowingComposition();
        break;
      case "layered":
        drawLayeredComposition();
        break;
      case "grid":
        drawGridComposition();
        break;
      case "radial":
        drawRadialComposition();
        break;
    }
  }

  // Draw overlapping layers
  if (features.hasOverlappingLayers) {
    push();
    drawingContext.globalAlpha = 0.4;
    drawRandomDiagrams(Math.floor(features.density * 2), 0.7);
    pop();
  }

  // Draw special features
  if (features.hasCalabiYau) {
    drawCalabiYau(width/2 + rnd(-100, 100), height/2 + rnd(-100, 100), rnd(60, 120));
  }

  // Labels overlay (if technical style)
  if (features.showLabels && features.style === "technical") {
    drawParticleLabels();
  }
}

// ============================================================
// BACKGROUND PATTERNS (Sol LeWitt inspired)
// ============================================================

function drawBackgroundPattern() {
  const gridCol = color(pal.grid || pal.dim);
  gridCol.setAlpha(80);

  stroke(gridCol);
  strokeWeight(0.5);
  noFill();

  const spacing = map(features.patternDensity, 0.3, 1.0, 50, 15);

  switch (features.backgroundPattern) {
    case "grid":
      // Vertical lines
      for (let x = spacing; x < width; x += spacing) {
        line(x, 0, x, height);
      }
      // Horizontal lines
      for (let y = spacing; y < height; y += spacing) {
        line(0, y, width, y);
      }
      break;

    case "lines":
      // Horizontal lines only
      for (let y = spacing/2; y < height; y += spacing) {
        line(0, y, width, y);
      }
      break;

    case "dots":
      noStroke();
      fill(gridCol);
      for (let x = spacing; x < width; x += spacing) {
        for (let y = spacing; y < height; y += spacing) {
          circle(x, y, 2);
        }
      }
      break;

    case "arcs":
      // Sol LeWitt style arcs
      noFill();
      stroke(gridCol);
      const arcSpacing = spacing * 2;
      for (let x = 0; x < width + arcSpacing; x += arcSpacing) {
        for (let y = 0; y < height + arcSpacing; y += arcSpacing) {
          const quadrant = (Math.floor(x/arcSpacing) + Math.floor(y/arcSpacing)) % 4;
          push();
          translate(x, y);
          switch(quadrant) {
            case 0: arc(0, 0, arcSpacing, arcSpacing, 0, HALF_PI); break;
            case 1: arc(0, 0, arcSpacing, arcSpacing, HALF_PI, PI); break;
            case 2: arc(0, 0, arcSpacing, arcSpacing, PI, PI + HALF_PI); break;
            case 3: arc(0, 0, arcSpacing, arcSpacing, PI + HALF_PI, TWO_PI); break;
          }
          pop();
        }
      }
      break;

    case "diagonal":
      // Diagonal lines
      for (let i = -height; i < width + height; i += spacing) {
        line(i, 0, i + height, height);
      }
      break;
  }
}

function drawRandomDiagrams(count, scale) {
  for (let i = 0; i < count; i++) {
    const x = rnd(50, width - 50);
    const y = rnd(50, height - 50);
    drawMiniDiagram(x, y, scale);
  }
}

function drawWithSymmetry() {
  const cx = width / 2;
  const cy = height / 2;

  let folds;
  switch (features.symmetry) {
    case "bilateral": folds = 2; break;
    case "radial4": folds = 4; break;
    case "radial6": folds = 6; break;
    case "radial8": folds = 8; break;
    default: folds = 1;
  }

  for (let i = 0; i < folds; i++) {
    push();
    translate(cx, cy);
    rotate((TWO_PI / folds) * i);
    translate(-cx, -cy);

    // Draw a portion of the composition
    const vertices = [];
    const count = Math.floor(features.vertexCount / folds) + 2;
    for (let j = 0; j < count; j++) {
      vertices.push({
        x: cx + rnd(-200, 200),
        y: cy + rnd(-250, 50),
        type: rndChoice(["interaction", "decay", "creation"])
      });
    }
    drawPropagatorNetwork(vertices);
    vertices.forEach(v => {
      if (rndBool(features.loopProbability)) {
        drawLoop(v.x, v.y, rnd(15, 40));
      }
      drawVertex(v.x, v.y, v.type);
    });
    pop();
  }
}

// ============================================================
// COMPOSITION LAYOUTS
// ============================================================

function drawCenteredComposition() {
  const cx = width / 2;
  const cy = height / 2;
  const radius = min(width, height) * 0.42;

  // Multiple rings of vertices for complexity
  const rings = Math.floor(1 + features.density);
  const vertices = [];

  for (let ring = 0; ring < rings; ring++) {
    const ringRadius = radius * (0.3 + (ring / rings) * 0.7);
    const verticesInRing = Math.floor(features.vertexCount / rings) + rndInt(0, 3);

    for (let i = 0; i < verticesInRing; i++) {
      const angle = (i / verticesInRing) * TWO_PI + rnd(-0.3, 0.3);
      const r = ringRadius + rnd(-20, 20);
      vertices.push({
        x: cx + cos(angle) * r,
        y: cy + sin(angle) * r,
        type: rndChoice(["interaction", "decay", "creation", "qcd"]),
        ring: ring
      });
    }
  }

  // Add central vertex cluster
  for (let i = 0; i < Math.floor(features.density * 3); i++) {
    vertices.push({
      x: cx + rnd(-40, 40),
      y: cy + rnd(-40, 40),
      type: rndChoice(["interaction", "qcd"]),
      ring: -1
    });
  }

  // Draw propagators between vertices (denser connections)
  drawPropagatorNetwork(vertices);

  // Draw loops with varying sizes
  vertices.forEach(v => {
    if (rndBool(features.loopProbability)) {
      const loopSize = rnd(15, 45) * (features.style === "maximalist" ? 1.5 : 1);
      drawLoop(v.x, v.y, loopSize);
    }
    // Extra loops for dense/chaotic
    if (features.densityName === "chaotic" && rndBool(0.3)) {
      drawPhotonLoop(v.x + rnd(-20, 20), v.y + rnd(-20, 20), rnd(10, 25), 0.6);
    }
  });

  // Draw vertex points
  vertices.forEach(v => drawVertex(v.x, v.y, v.type));
}

function drawScatteredComposition() {
  const regionCount = Math.floor(4 + features.density * 8);
  const regions = [];

  // Create scattered diagram regions with varying sizes
  for (let i = 0; i < regionCount; i++) {
    const margin = 60;
    regions.push({
      x: rnd(margin, width - margin),
      y: rnd(margin, height - margin),
      scale: rnd(0.4, 1.4),
      complexity: rnd(0.5, 1.5)
    });
  }

  // Draw mini-diagrams in each region
  regions.forEach(region => {
    drawMiniDiagram(region.x, region.y, region.scale, region.complexity);
  });

  // Draw connecting propagators between nearby regions
  const connectionProb = features.connectionDensity;
  for (let i = 0; i < regions.length; i++) {
    for (let j = i + 1; j < regions.length; j++) {
      const dist = sqrt(pow(regions[i].x - regions[j].x, 2) + pow(regions[i].y - regions[j].y, 2));
      if (dist < 250 && rndBool(connectionProb)) {
        const particleType = getRandomParticleType();
        drawPropagator(regions[i].x, regions[i].y, regions[j].x, regions[j].y, particleType);
      }
    }
  }

  // Add floating loops between regions
  for (let i = 0; i < features.density * 5; i++) {
    if (rndBool(features.loopProbability)) {
      const x = rnd(80, width - 80);
      const y = rnd(80, height - 80);
      drawLoop(x, y, rnd(15, 35));
    }
  }
}

function drawFlowingComposition() {
  // Multiple parallel "reactions" flowing across canvas
  const streamCount = Math.floor(1 + features.density * 2);

  for (let stream = 0; stream < streamCount; stream++) {
    const streamY = height * (0.2 + (stream / streamCount) * 0.6);
    const streamAlpha = stream === Math.floor(streamCount / 2) ? 1.0 : 0.6;

    push();
    if (streamAlpha < 1) drawingContext.globalAlpha = streamAlpha;

    const incomingCount = rndInt(2, 4);
    const interactionCount = rndInt(2, 4);
    const outgoingCount = rndInt(3, 7);

    const startX = 30;
    const endX = width - 30;

    // Create interaction vertices along the stream
    const interactions = [];
    for (let i = 0; i < interactionCount; i++) {
      interactions.push({
        x: startX + ((i + 1) / (interactionCount + 1)) * (endX - startX) + rnd(-30, 30),
        y: streamY + rnd(-40, 40)
      });
    }

    // Incoming particles
    for (let i = 0; i < incomingCount; i++) {
      const y = streamY + (i - (incomingCount-1)/2) * 50;
      const target = interactions[0];
      drawPropagator(startX - 20, y, target.x, target.y, getRandomParticleType());
    }

    // Connect interactions
    for (let i = 0; i < interactions.length - 1; i++) {
      const v1 = interactions[i];
      const v2 = interactions[i + 1];
      // Multiple propagators between vertices
      const propCount = rndInt(1, 3);
      for (let p = 0; p < propCount; p++) {
        const offset = (p - (propCount-1)/2) * 15;
        drawPropagator(v1.x, v1.y + offset, v2.x, v2.y + offset, getRandomParticleType());
      }
      drawVertex(v1.x, v1.y, rndChoice(["interaction", "qcd"]));
    }
    drawVertex(interactions[interactions.length-1].x, interactions[interactions.length-1].y, "interaction");

    // Outgoing particles
    const lastVertex = interactions[interactions.length - 1];
    for (let i = 0; i < outgoingCount; i++) {
      const y = streamY + (i - (outgoingCount-1)/2) * 40;
      drawPropagator(lastVertex.x, lastVertex.y, endX + 20, y, getRandomParticleType());
    }

    // Add loops at interaction points
    interactions.forEach(v => {
      if (rndBool(features.loopProbability)) {
        drawLoop(v.x + rnd(-20, 20), v.y + rnd(-20, 20), rnd(20, 40));
      }
    });

    pop();
  }
}

function drawLayeredComposition() {
  const layerCount = features.layerCount + Math.floor(features.density);

  for (let layer = 0; layer < layerCount; layer++) {
    const alpha = map(layer, 0, layerCount - 1, 0.2, 1.0);
    const layerScale = map(layer, 0, layerCount - 1, 0.5, 1.0);

    push();
    translate(width/2, height/2);
    rotate(rnd(-0.3, 0.3));
    scale(layerScale);
    translate(-width/2, -height/2);

    drawingContext.globalAlpha = alpha;

    // Draw mode-specific elements for this layer
    const mode = features.modes[layer % features.modes.length];
    drawModeLayer(mode, 1.0);

    // Add extra connections for complexity
    if (features.style === "maximalist" || features.style === "chaotic") {
      for (let i = 0; i < features.density * 3; i++) {
        const x1 = rnd(100, width - 100);
        const y1 = rnd(100, height - 100);
        const x2 = x1 + rnd(-150, 150);
        const y2 = y1 + rnd(-150, 150);
        drawPropagator(x1, y1, x2, y2, getRandomParticleType());
      }
    }

    pop();
  }
}

function drawGridComposition() {
  // Sol LeWitt style systematic grid of diagrams
  const gridSize = Math.floor(2 + features.density * 1.5);
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  for (let gx = 0; gx < gridSize; gx++) {
    for (let gy = 0; gy < gridSize; gy++) {
      const cx = cellWidth * (gx + 0.5);
      const cy = cellHeight * (gy + 0.5);

      // Each cell gets a mini Feynman diagram
      const vertices = [];
      const vertCount = rndInt(3, 6);

      for (let i = 0; i < vertCount; i++) {
        vertices.push({
          x: cx + rnd(-cellWidth * 0.35, cellWidth * 0.35),
          y: cy + rnd(-cellHeight * 0.35, cellHeight * 0.35),
          type: rndChoice(["interaction", "decay", "qcd"])
        });
      }

      // Connect vertices within cell
      for (let i = 0; i < vertices.length - 1; i++) {
        drawPropagator(vertices[i].x, vertices[i].y,
                      vertices[i+1].x, vertices[i+1].y,
                      getRandomParticleType());
      }
      // Close the loop sometimes
      if (rndBool(0.5)) {
        drawPropagator(vertices[vertices.length-1].x, vertices[vertices.length-1].y,
                      vertices[0].x, vertices[0].y, getRandomParticleType());
      }

      // Draw vertices
      vertices.forEach(v => drawVertex(v.x, v.y, v.type));

      // Add loops
      if (rndBool(features.loopProbability)) {
        drawLoop(cx + rnd(-20, 20), cy + rnd(-20, 20), rnd(15, 30));
      }
    }
  }

  // Connect neighboring cells
  if (features.connectionDensity > 0.3) {
    for (let gx = 0; gx < gridSize - 1; gx++) {
      for (let gy = 0; gy < gridSize; gy++) {
        if (rndBool(features.connectionDensity)) {
          const x1 = cellWidth * (gx + 0.8);
          const y1 = cellHeight * (gy + 0.5) + rnd(-20, 20);
          const x2 = cellWidth * (gx + 1.2);
          const y2 = y1 + rnd(-20, 20);
          drawPropagator(x1, y1, x2, y2, getRandomParticleType());
        }
      }
    }
  }
}

function drawRadialComposition() {
  // Explosion of diagrams from center
  const cx = width / 2;
  const cy = height / 2;
  const rayCount = Math.floor(6 + features.density * 8);

  // Central vertex cluster
  const centralVertices = [];
  for (let i = 0; i < Math.floor(3 + features.density * 2); i++) {
    centralVertices.push({
      x: cx + rnd(-30, 30),
      y: cy + rnd(-30, 30),
      type: "interaction"
    });
  }

  // Connect central vertices
  for (let i = 0; i < centralVertices.length; i++) {
    for (let j = i + 1; j < centralVertices.length; j++) {
      if (rndBool(0.7)) {
        drawPropagator(centralVertices[i].x, centralVertices[i].y,
                      centralVertices[j].x, centralVertices[j].y,
                      getRandomParticleType());
      }
    }
    drawVertex(centralVertices[i].x, centralVertices[i].y, "qcd");
  }

  // Radiating rays
  for (let ray = 0; ray < rayCount; ray++) {
    const angle = (ray / rayCount) * TWO_PI + rnd(-0.1, 0.1);
    const rayLength = rnd(150, 320);
    const segments = rndInt(2, 5);

    let prevX = cx;
    let prevY = cy;

    for (let seg = 0; seg < segments; seg++) {
      const progress = (seg + 1) / segments;
      const r = rayLength * progress;
      const wobble = rnd(-20, 20);
      const x = cx + cos(angle) * r + cos(angle + HALF_PI) * wobble;
      const y = cy + sin(angle) * r + sin(angle + HALF_PI) * wobble;

      drawPropagator(prevX, prevY, x, y, getRandomParticleType());

      if (seg < segments - 1) {
        drawVertex(x, y, rndChoice(["decay", "interaction"]));
      }

      // Branch off
      if (rndBool(features.connectionDensity * 0.5) && seg > 0) {
        const branchAngle = angle + rnd(-0.5, 0.5);
        const branchLen = rnd(30, 80);
        const bx = x + cos(branchAngle) * branchLen;
        const by = y + sin(branchAngle) * branchLen;
        drawPropagator(x, y, bx, by, getRandomParticleType());
        drawVertex(bx, by, "decay");
      }

      // Add loops along rays
      if (rndBool(features.loopProbability * 0.5)) {
        drawLoop(x + rnd(-15, 15), y + rnd(-15, 15), rnd(12, 25));
      }

      prevX = x;
      prevY = y;
    }
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING
// ============================================================

function drawModeLayer(mode, alpha) {
  const vertCount = Math.floor(features.vertexCount * rnd(0.5, 1));
  const vertices = [];

  for (let i = 0; i < vertCount; i++) {
    vertices.push({
      x: rnd(100, width - 100),
      y: rnd(100, height - 100)
    });
  }

  switch (mode) {
    case "qed":
      drawQEDElements(vertices, alpha);
      break;
    case "qcd":
      drawQCDElements(vertices, alpha);
      break;
    case "string":
      drawStringElements(vertices, alpha);
      break;
    case "vacuum":
      drawVacuumElements(vertices, alpha);
      break;
  }
}

function drawQEDElements(vertices, alpha) {
  // Electron-positron annihilation, photon exchange
  for (let i = 0; i < vertices.length - 1; i++) {
    const v1 = vertices[i];
    const v2 = vertices[i + 1];

    if (rndBool(0.5)) {
      // Photon propagator (wavy)
      drawPhotonPropagator(v1.x, v1.y, v2.x, v2.y, alpha);
    } else {
      // Fermion line
      drawFermionLine(v1.x, v1.y, v2.x, v2.y, alpha);
    }

    drawVertex(v1.x, v1.y, "interaction");
  }

  // Add self-energy loop
  if (rndBool(features.loopProbability)) {
    const v = rndChoice(vertices);
    drawPhotonLoop(v.x, v.y, rnd(25, 40), alpha);
  }
}

function drawQCDElements(vertices, alpha) {
  // Quark lines with color, gluon exchanges
  const colors = [COLORS.quarkRed, COLORS.quarkGreen, COLORS.quarkBlue];

  for (let i = 0; i < vertices.length - 1; i++) {
    const v1 = vertices[i];
    const v2 = vertices[i + 1];
    const col = rndChoice(colors);

    if (rndBool(0.4)) {
      // Gluon propagator (curly)
      drawGluonPropagator(v1.x, v1.y, v2.x, v2.y, alpha);
    } else {
      // Colored quark line
      drawQuarkLine(v1.x, v1.y, v2.x, v2.y, col, alpha);
    }

    drawVertex(v1.x, v1.y, "qcd");
  }

  // Color confinement tube
  if (rndBool(0.3 * features.density)) {
    const v1 = rndChoice(vertices);
    const v2 = rndChoice(vertices);
    drawConfinementTube(v1.x, v1.y, v2.x, v2.y, alpha);
  }
}

function drawStringElements(vertices, alpha) {
  // Worldsheets, vibrating strings
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i];

    if (rndBool(0.5)) {
      // Open string worldsheet
      drawWorldsheet(v.x, v.y, rnd(40, 80), rnd(60, 120), alpha);
    } else {
      // Closed string (loop worldsheet)
      drawClosedStringWorldsheet(v.x, v.y, rnd(30, 60), alpha);
    }
  }

  // String vibration modes
  if (rndBool(0.4)) {
    const v = rndChoice(vertices);
    drawStringModes(v.x, v.y, rnd(50, 100), alpha);
  }

  // Brane intersection
  if (rndBool(0.2 * features.density)) {
    drawBraneIntersection(width/2 + rnd(-100, 100), height/2 + rnd(-100, 100), alpha);
  }
}

function drawVacuumElements(vertices, alpha) {
  // Quantum foam, virtual pairs

  // Dense foam background
  drawQuantumFoam(alpha * 0.5);

  // Virtual particle pairs
  const pairCount = Math.floor(features.density * 8);
  for (let i = 0; i < pairCount; i++) {
    const x = rnd(50, width - 50);
    const y = rnd(50, height - 50);
    drawVirtualPair(x, y, rnd(15, 35), alpha);
  }

  // Uncertainty clouds
  vertices.forEach(v => {
    if (rndBool(0.3)) {
      drawUncertaintyCloud(v.x, v.y, rnd(30, 60), alpha);
    }
  });

  // Casimir plates (rare)
  if (rndBool(0.15)) {
    drawCasimirPlates(width/2, height/2, alpha);
  }
}

// ============================================================
// PROPAGATOR DRAWING FUNCTIONS
// ============================================================

function drawPropagator(x1, y1, x2, y2, particleType) {
  switch (particleType) {
    case "photon":
      drawPhotonPropagator(x1, y1, x2, y2, 1);
      break;
    case "gluon":
      drawGluonPropagator(x1, y1, x2, y2, 1);
      break;
    case "fermion":
    case "electron":
    case "quark":
      drawFermionLine(x1, y1, x2, y2, 1);
      break;
    case "wBoson":
    case "zBoson":
      drawMassiveBosonPropagator(x1, y1, x2, y2, 1);
      break;
    default:
      drawFermionLine(x1, y1, x2, y2, 1);
  }
}

function drawFermionLine(x1, y1, x2, y2, alpha) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Straight line with arrow
  line(x1, y1, x2, y2);

  // Arrow in middle
  if (features.arrowStyle !== "none") {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const angle = atan2(y2 - y1, x2 - x1);
    drawArrow(mx, my, angle, features.lineWeight * 3);
  }
}

function drawPhotonPropagator(x1, y1, x2, y2, alpha) {
  const col = color(COLORS.photon);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Wavy line (sine wave along path)
  const dist = sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
  const angle = atan2(y2 - y1, x2 - x1);
  const waveCount = max(3, floor(dist / 15));
  const amplitude = 8;

  beginShape();
  for (let i = 0; i <= waveCount * 10; i++) {
    const t = i / (waveCount * 10);
    const x = lerp(x1, x2, t);
    const y = lerp(y1, y2, t);
    const wave = sin(t * waveCount * TWO_PI) * amplitude;
    const perpX = -sin(angle) * wave;
    const perpY = cos(angle) * wave;
    vertex(x + perpX, y + perpY);
  }
  endShape();
}

function drawGluonPropagator(x1, y1, x2, y2, alpha) {
  const col = color(rndChoice(COLORS.gluon));
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Curly line (coil/spring shape)
  const dist = sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
  const angle = atan2(y2 - y1, x2 - x1);
  const coilCount = max(4, floor(dist / 12));
  const radius = 6;

  beginShape();
  for (let i = 0; i <= coilCount * 20; i++) {
    const t = i / (coilCount * 20);
    const baseX = lerp(x1, x2, t);
    const baseY = lerp(y1, y2, t);
    const coilAngle = t * coilCount * TWO_PI;
    const perpX = cos(angle + HALF_PI) * sin(coilAngle) * radius;
    const perpY = sin(angle + HALF_PI) * sin(coilAngle) * radius;
    // Add depth effect
    const depth = cos(coilAngle) * radius * 0.3;
    vertex(baseX + perpX + cos(angle) * depth, baseY + perpY + sin(angle) * depth);
  }
  endShape();
}

function drawMassiveBosonPropagator(x1, y1, x2, y2, alpha) {
  const col = color(COLORS.wBoson);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight * 1.5);

  // Dashed wavy line (massive)
  const dist = sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
  const angle = atan2(y2 - y1, x2 - x1);
  const segments = floor(dist / 20);

  for (let i = 0; i < segments; i++) {
    if (i % 2 === 0) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;
      const sx = lerp(x1, x2, t1);
      const sy = lerp(y1, y2, t1);
      const ex = lerp(x1, x2, t2);
      const ey = lerp(y1, y2, t2);

      // Mini wavy segment
      beginShape();
      for (let j = 0; j <= 10; j++) {
        const t = j / 10;
        const x = lerp(sx, ex, t);
        const y = lerp(sy, ey, t);
        const wave = sin(t * TWO_PI) * 4;
        vertex(x - sin(angle) * wave, y + cos(angle) * wave);
      }
      endShape();
    }
  }
}

function drawQuarkLine(x1, y1, x2, y2, col, alpha) {
  const c = color(col);
  c.setAlpha(alpha * 255);

  stroke(c);
  strokeWeight(features.lineWeight * 1.2);
  line(x1, y1, x2, y2);

  // Arrow
  if (features.arrowStyle !== "none") {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const angle = atan2(y2 - y1, x2 - x1);

    fill(c);
    noStroke();
    drawArrow(mx, my, angle, features.lineWeight * 4);
  }
}

function drawVirtualPropagator(x1, y1, x2, y2) {
  const col = color(pal.dim);
  col.setAlpha(100);

  stroke(col);
  strokeWeight(1);
  drawingContext.setLineDash([5, 5]);
  line(x1, y1, x2, y2);
  drawingContext.setLineDash([]);
}

// ============================================================
// VERTEX DRAWING
// ============================================================

function drawVertex(x, y, type) {
  const size = features.lineWeight * 3;

  switch (type) {
    case "interaction":
      fill(pal.accent);
      noStroke();
      circle(x, y, size);
      break;
    case "decay":
      fill(pal.line);
      noStroke();
      circle(x, y, size * 0.8);
      break;
    case "creation":
      noFill();
      stroke(pal.accent);
      strokeWeight(1.5);
      circle(x, y, size * 1.2);
      break;
    case "qcd":
      // Three-color vertex
      noStroke();
      const colors = [COLORS.quarkRed, COLORS.quarkGreen, COLORS.quarkBlue];
      for (let i = 0; i < 3; i++) {
        fill(colors[i]);
        const angle = i * TWO_PI / 3 - HALF_PI;
        const px = x + cos(angle) * size * 0.4;
        const py = y + sin(angle) * size * 0.4;
        circle(px, py, size * 0.6);
      }
      break;
    default:
      fill(pal.line);
      noStroke();
      circle(x, y, size);
  }
}

function drawArrow(x, y, angle, size) {
  push();
  translate(x, y);
  rotate(angle);
  noStroke();
  triangle(size, 0, -size * 0.5, -size * 0.5, -size * 0.5, size * 0.5);
  pop();
}

// ============================================================
// LOOP DRAWING
// ============================================================

function drawLoop(x, y, radius) {
  stroke(pal.line);
  strokeWeight(features.lineWeight);
  noFill();

  // Simple loop
  ellipse(x, y, radius * 2, radius * 1.5);

  // Arrow on loop
  if (features.arrowStyle !== "none") {
    const arrowX = x + radius;
    const arrowY = y;
    fill(pal.line);
    noStroke();
    drawArrow(arrowX, arrowY, HALF_PI, features.lineWeight * 2.5);
  }
}

function drawPhotonLoop(x, y, radius, alpha) {
  const col = color(COLORS.photon);
  col.setAlpha(alpha * 200);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Wavy circle
  beginShape();
  const waveCount = 12;
  for (let i = 0; i <= 60; i++) {
    const angle = (i / 60) * TWO_PI;
    const wave = sin(angle * waveCount) * 4;
    const r = radius + wave;
    vertex(x + cos(angle) * r, y + sin(angle) * r);
  }
  endShape(CLOSE);
}

// ============================================================
// STRING THEORY ELEMENTS
// ============================================================

function drawWorldsheet(x, y, w, h, alpha) {
  const col = color(COLORS.worldsheet);
  col.setAlpha(alpha * 100);

  fill(col);
  stroke(COLORS.string);
  strokeWeight(features.lineWeight * 0.8);

  // Curved surface (worldsheet of open string)
  beginShape();
  // Top edge (string at t1)
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const px = x - w/2 + t * w;
    const py = y - h/2 + sin(t * PI) * 10;
    vertex(px, py);
  }
  // Right edge (endpoint trajectory)
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const px = x + w/2 + sin(t * PI) * 5;
    const py = y - h/2 + t * h;
    vertex(px, py);
  }
  // Bottom edge (string at t2)
  for (let i = 20; i >= 0; i--) {
    const t = i / 20;
    const px = x - w/2 + t * w;
    const py = y + h/2 + sin(t * PI) * 10;
    vertex(px, py);
  }
  // Left edge
  for (let i = 10; i >= 0; i--) {
    const t = i / 10;
    const px = x - w/2 - sin(t * PI) * 5;
    const py = y - h/2 + t * h;
    vertex(px, py);
  }
  endShape(CLOSE);

  // Time arrow
  if (features.showLabels) {
    stroke(pal.dim);
    strokeWeight(1);
    line(x - w/2 - 20, y - h/2, x - w/2 - 20, y + h/2);
    drawArrow(x - w/2 - 20, y + h/2, HALF_PI, 5);
  }
}

function drawClosedStringWorldsheet(x, y, radius, alpha) {
  const col = color(COLORS.worldsheet);
  col.setAlpha(alpha * 80);

  fill(col);
  stroke(COLORS.string);
  strokeWeight(features.lineWeight * 0.8);

  // Torus-like shape (closed string worldsheet)
  beginShape();
  for (let i = 0; i <= 40; i++) {
    const angle = (i / 40) * TWO_PI;
    const wobble = sin(angle * 3) * radius * 0.15;
    const r = radius + wobble;
    vertex(x + cos(angle) * r, y + sin(angle) * r * 0.6);
  }
  endShape(CLOSE);

  // Inner hole suggestion
  noFill();
  stroke(COLORS.string);
  strokeWeight(features.lineWeight * 0.5);
  ellipse(x, y, radius * 0.4, radius * 0.25);
}

function drawStringModes(x, y, length, alpha) {
  const col = color(COLORS.string);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Multiple vibration modes stacked
  const modes = rndInt(2, 5);
  for (let m = 0; m < modes; m++) {
    const yOff = (m - (modes-1)/2) * 25;
    const harmonic = m + 1;

    beginShape();
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const px = x - length/2 + t * length;
      const py = y + yOff + sin(t * PI * harmonic) * 12;
      vertex(px, py);
    }
    endShape();
  }

  // Fixed endpoints
  fill(pal.accent);
  noStroke();
  circle(x - length/2, y, 6);
  circle(x + length/2, y, 6);
}

function drawBraneIntersection(x, y, alpha) {
  const col1 = color(COLORS.brane);
  col1.setAlpha(alpha * 60);
  const col2 = color(COLORS.string);
  col2.setAlpha(alpha * 60);

  // Two intersecting planes (branes)
  const size = 100;

  // Brane 1 (horizontal-ish)
  fill(col1);
  noStroke();
  beginShape();
  vertex(x - size, y - 20);
  vertex(x + size, y - 30);
  vertex(x + size * 0.8, y + 40);
  vertex(x - size * 0.8, y + 30);
  endShape(CLOSE);

  // Brane 2 (vertical-ish)
  fill(col2);
  beginShape();
  vertex(x - 30, y - size * 0.8);
  vertex(x + 20, y - size * 0.7);
  vertex(x + 40, y + size * 0.7);
  vertex(x - 20, y + size * 0.8);
  endShape(CLOSE);

  // Intersection string
  stroke(COLORS.photon);
  strokeWeight(2);
  line(x - 10, y - 40, x + 10, y + 40);

  // Vertex at intersection
  fill(COLORS.photon);
  noStroke();
  circle(x, y, 8);
}

function drawCalabiYau(x, y, size) {
  // Simplified 2D projection of Calabi-Yau manifold
  // (6D compactified space - drawn as complex folded shape)

  const col = color(COLORS.calabiYau);
  col.setAlpha(150);

  noFill();
  stroke(col);
  strokeWeight(1.5);

  // Multiple overlapping tori suggesting higher dimensions
  for (let i = 0; i < 5; i++) {
    const angle = i * TWO_PI / 5;
    const ox = cos(angle) * size * 0.3;
    const oy = sin(angle) * size * 0.3;
    const rot = angle + rnd(-0.3, 0.3);

    push();
    translate(x + ox, y + oy);
    rotate(rot);

    // Torus cross-section
    beginShape();
    for (let j = 0; j <= 30; j++) {
      const t = (j / 30) * TWO_PI;
      const r = size * 0.25 + sin(t * 3) * size * 0.08;
      vertex(cos(t) * r, sin(t) * r * 0.5);
    }
    endShape(CLOSE);

    pop();
  }

  // Central singularity
  fill(COLORS.calabiYau);
  noStroke();
  circle(x, y, 6);

  // Label
  if (features.showLabels) {
    fill(pal.dim);
    noStroke();
    textSize(10);
    textAlign(CENTER);
    text("Calabi-Yau", x, y + size * 0.5 + 15);
  }
}

// ============================================================
// VACUUM/QUANTUM FOAM ELEMENTS
// ============================================================

function drawQuantumFoam(alpha) {
  // Dense field of tiny virtual loops
  const foamDensity = features.density * 200;

  for (let i = 0; i < foamDensity; i++) {
    const x = rnd(width);
    const y = rnd(height);
    const size = rnd(2, 8);
    const a = alpha * rnd(0.3, 0.8);

    const col = color(COLORS.foam);
    col.setAlpha(a * 255);

    noFill();
    stroke(col);
    strokeWeight(0.5);

    // Tiny loops
    ellipse(x, y, size, size * rnd(0.5, 1));
  }
}

function drawVirtualPair(x, y, size, alpha) {
  // Particle-antiparticle pair appearing and annihilating
  const col = color(COLORS.virtualPair);
  col.setAlpha(alpha * 180);

  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  noFill();

  // Two curved lines emerging and meeting
  const spread = size * 0.6;

  beginShape();
  vertex(x, y);
  bezierVertex(
    x - spread, y - size * 0.5,
    x - spread, y + size * 0.5,
    x, y + size
  );
  endShape();

  beginShape();
  vertex(x, y);
  bezierVertex(
    x + spread, y - size * 0.5,
    x + spread, y + size * 0.5,
    x, y + size
  );
  endShape();

  // Creation and annihilation points
  fill(col);
  noStroke();
  circle(x, y, 4);
  circle(x, y + size, 4);

  // Arrows showing opposite directions
  if (features.arrowStyle !== "none") {
    stroke(col);
    strokeWeight(1);
    // Left arrow (particle)
    drawArrow(x - spread * 0.7, y + size * 0.3, HALF_PI + 0.3, 4);
    // Right arrow (antiparticle) - opposite direction
    drawArrow(x + spread * 0.7, y + size * 0.3, -HALF_PI - 0.3, 4);
  }
}

function drawUncertaintyCloud(x, y, size, alpha) {
  // Fuzzy cloud representing position uncertainty
  const col = color(COLORS.fluctuation);

  noStroke();
  for (let i = 0; i < 30; i++) {
    const a = alpha * rnd(0.05, 0.2);
    col.setAlpha(a * 255);
    fill(col);

    const ox = rndGaussian(0, size * 0.3);
    const oy = rndGaussian(0, size * 0.3);
    const s = rnd(3, 10);

    ellipse(x + ox, y + oy, s, s);
  }
}

function drawCasimirPlates(x, y, alpha) {
  // Two parallel plates with vacuum energy between
  const plateHeight = 150;
  const plateGap = 60;
  const plateWidth = 4;

  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  fill(col);
  noStroke();

  // Left plate
  rect(x - plateGap/2 - plateWidth, y - plateHeight/2, plateWidth, plateHeight);
  // Right plate
  rect(x + plateGap/2, y - plateHeight/2, plateWidth, plateHeight);

  // Virtual photons between plates (fewer = Casimir effect)
  const vacuumCol = color(COLORS.photon);
  vacuumCol.setAlpha(alpha * 100);
  stroke(vacuumCol);
  strokeWeight(1);

  for (let i = 0; i < 5; i++) {
    const py = y - plateHeight/2 + (i + 0.5) * (plateHeight / 5);
    // Constrained wavelength between plates
    beginShape();
    for (let j = 0; j <= 20; j++) {
      const t = j / 20;
      const px = x - plateGap/2 + t * plateGap;
      const wave = sin(t * PI * (i % 3 + 1)) * 5;
      vertex(px, py + wave);
    }
    endShape();
  }

  // Outside - more virtual photons (longer wavelengths)
  const outerCol = color(COLORS.photon);
  outerCol.setAlpha(alpha * 50);
  stroke(outerCol);

  for (let i = 0; i < 8; i++) {
    const py = y - plateHeight/2 + rnd(plateHeight);
    const side = rndBool() ? -1 : 1;
    const startX = x + side * (plateGap/2 + plateWidth + 10);
    const len = rnd(30, 60);

    beginShape();
    for (let j = 0; j <= 15; j++) {
      const t = j / 15;
      const px = startX + side * t * len;
      const wave = sin(t * PI * 2) * 8;
      vertex(px, py + wave);
    }
    endShape();
  }

  // Label
  if (features.showLabels) {
    fill(pal.dim);
    noStroke();
    textSize(10);
    textAlign(CENTER);
    text("Casimir", x, y + plateHeight/2 + 15);
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function drawMiniDiagram(x, y, scale, complexity = 1) {
  push();
  translate(x, y);

  const mode = rndChoice(features.modes);
  const vertCount = rndInt(3, Math.floor(6 * complexity));
  const vertices = [];
  const spread = 60 * scale;

  for (let i = 0; i < vertCount; i++) {
    vertices.push({
      x: rnd(-spread, spread),
      y: rnd(-spread, spread),
      type: rndChoice(["interaction", "decay", "qcd"])
    });
  }

  // Draw propagators - more connections for complexity
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dist = sqrt(pow(vertices[i].x - vertices[j].x, 2) + pow(vertices[i].y - vertices[j].y, 2));
      // Connect if close enough or randomly
      if (dist < spread * 1.2 || rndBool(0.2 * complexity * features.connectionDensity)) {
        drawPropagator(vertices[i].x, vertices[i].y, vertices[j].x, vertices[j].y, getRandomParticleType());
      }
    }
  }

  // Draw vertices
  vertices.forEach(v => {
    drawVertex(v.x, v.y, v.type);
  });

  // Add loops - more for higher complexity
  const loopCount = Math.floor(complexity * features.loopProbability * 3);
  for (let i = 0; i < loopCount; i++) {
    if (rndBool(features.loopProbability)) {
      const v = rndChoice(vertices);
      drawLoop(v.x + rnd(-15, 15), v.y + rnd(-15, 15), rnd(12, 28) * scale);
    }
  }

  pop();
}

function drawPropagatorNetwork(vertices) {
  // Connect vertices with high density
  const connections = [];
  const maxDist = 200 / Math.sqrt(features.density);

  // Sort vertices for better connections
  const sortedByX = [...vertices].sort((a, b) => a.x - b.x);

  // Connect nearby vertices
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const v1 = vertices[i];
      const v2 = vertices[j];
      const dist = sqrt(pow(v1.x - v2.x, 2) + pow(v1.y - v2.y, 2));

      // Higher connection probability for closer vertices
      const connectProb = features.connectionDensity * (1 - dist / 400);
      if (dist < maxDist && rndBool(Math.max(0.1, connectProb))) {
        connections.push([i, j]);
      }
    }
  }

  // Ensure minimum connectivity - connect each vertex to at least one other
  for (let i = 0; i < vertices.length; i++) {
    const hasConnection = connections.some(([a, b]) => a === i || b === i);
    if (!hasConnection && vertices.length > 1) {
      // Connect to nearest vertex
      let nearest = i === 0 ? 1 : 0;
      let nearestDist = Infinity;
      for (let j = 0; j < vertices.length; j++) {
        if (j !== i) {
          const d = sqrt(pow(vertices[i].x - vertices[j].x, 2) + pow(vertices[i].y - vertices[j].y, 2));
          if (d < nearestDist) {
            nearestDist = d;
            nearest = j;
          }
        }
      }
      connections.push([Math.min(i, nearest), Math.max(i, nearest)]);
    }
  }

  // Draw all propagators
  connections.forEach(([i, j]) => {
    const v1 = vertices[i];
    const v2 = vertices[j];
    const particleType = getRandomParticleType();
    drawPropagator(v1.x, v1.y, v2.x, v2.y, particleType);
  });

  // For maximalist/chaotic styles, add extra random connections
  if (features.style === "maximalist" || features.style === "chaotic") {
    const extraConnections = Math.floor(features.density * 5);
    for (let i = 0; i < extraConnections; i++) {
      const v1 = rndChoice(vertices);
      const v2 = rndChoice(vertices);
      if (v1 !== v2) {
        drawPropagator(v1.x, v1.y, v2.x, v2.y, getRandomParticleType());
      }
    }
  }
}

function getRandomParticleType() {
  const mode = rndChoice(features.modes);

  switch (mode) {
    case "qed":
      return rndChoice(["photon", "electron", "fermion"]);
    case "qcd":
      return rndChoice(["gluon", "quark", "gluon", "gluon"]);
    case "string":
      return rndChoice(["fermion", "photon"]);
    case "vacuum":
      return rndChoice(["photon", "fermion"]);
    default:
      return "fermion";
  }
}

function drawConfinementTube(x1, y1, x2, y2, alpha) {
  // QCD flux tube between quarks
  const col = color(COLORS.quarkRed);
  col.setAlpha(alpha * 80);

  const dist = sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
  const angle = atan2(y2 - y1, x2 - x1);

  push();
  translate(x1, y1);
  rotate(angle);

  // Tube shape
  fill(col);
  noStroke();
  beginShape();
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const x = t * dist;
    const tubeWidth = 8 + sin(t * PI * 4) * 3;
    vertex(x, tubeWidth);
  }
  for (let i = 20; i >= 0; i--) {
    const t = i / 20;
    const x = t * dist;
    const tubeWidth = 8 + sin(t * PI * 4) * 3;
    vertex(x, -tubeWidth);
  }
  endShape(CLOSE);

  // Gluon lines inside tube
  stroke(rndChoice(COLORS.gluon));
  strokeWeight(1);
  for (let i = 0; i < 3; i++) {
    const yOff = (i - 1) * 4;
    beginShape();
    for (let j = 0; j <= 30; j++) {
      const t = j / 30;
      const x = t * dist;
      const wiggle = sin(t * PI * 8 + i) * 2;
      vertex(x, yOff + wiggle);
    }
    endShape();
  }

  pop();
}

function drawParticleLabels() {
  fill(pal.dim);
  noStroke();
  textSize(9);
  textAlign(CENTER);
  textFont('monospace');

  // Add labels near edges explaining the diagram type
  const modeNames = features.modes.map(m => MODES[m].name).join(" + ");
  text(modeNames, width/2, height - 20);
}

// ============================================================
// INTERACTION & CONTROLS
// ============================================================

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('feynman-strings-' + hash.slice(2, 10), 'png');
    return false; // Prevent default
  }
  if (key === 'r' || key === 'R') {
    regenerate();
    return false; // Prevent default browser behavior (reload)
  }
  return true;
}

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  hasOverrides = false;
  generateFeatures();
  render();

  // Update UI if available
  if (typeof window.updateUI === 'function') {
    window.updateUI();
  }
}

function render() {
  clear();
  drawScene();
}

// ============================================================
// FEEDBACK SYSTEM (Dev Mode)
// ============================================================

const FEEDBACK_KEY = 'feynman-strings-feedback';

function loadFeedback() {
  const stored = localStorage.getItem(FEEDBACK_KEY);
  return stored ? JSON.parse(stored) : { liked: [], disliked: [] };
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
  return feedback;
}

function getFeedbackStats() {
  const feedback = loadFeedback();
  return {
    totalLiked: feedback.liked.length,
    totalDisliked: feedback.disliked.length,
    likedModes: countByProperty(feedback.liked, 'modes'),
    dislikedModes: countByProperty(feedback.disliked, 'modes')
  };
}

function countByProperty(entries, prop) {
  const counts = {};
  entries.forEach(e => {
    const val = Array.isArray(e.features[prop]) ? e.features[prop].join('+') : e.features[prop];
    counts[val] = (counts[val] || 0) + 1;
  });
  return counts;
}

function exportFeedback() {
  return loadFeedback();
}

// Expose for dev UI
window.recordFeedback = recordFeedback;
window.getFeedbackStats = getFeedbackStats;
window.exportFeedback = exportFeedback;

// ============================================================
// RARITY CURVES (for UI display)
// ============================================================

const RARITY_CURVES = {
  modeBlend: {
    labels: ["single", "dual", "triple", "chaos"],
    probabilities: [0.40, 0.30, 0.20, 0.10]
  },
  density: {
    labels: ["minimal", "sparse", "moderate", "dense", "intense", "chaotic"],
    probabilities: [0.10, 0.20, 0.25, 0.25, 0.15, 0.05]
  },
  style: {
    labels: ["technical", "geometric", "artistic", "abstract", "chaotic", "maximalist"],
    probabilities: [0.15, 0.20, 0.20, 0.20, 0.15, 0.10]
  },
  composition: {
    labels: ["centered", "scattered", "flowing", "layered", "grid", "radial"],
    probabilities: [0.20, 0.20, 0.15, 0.15, 0.15, 0.15]
  }
};

window.getRarityCurves = () => RARITY_CURVES;
