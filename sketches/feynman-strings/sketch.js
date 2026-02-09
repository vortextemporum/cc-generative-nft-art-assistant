/**
 * Feynman Strings v1.8.0
 *
 * Generative art inspired by Feynman diagrams and string theory.
 * From technical particle physics notation to abstract quantum chaos.
 *
 * Modes:
 * - QED: Photons (wavy), electrons (straight), simple vertices
 * - QCD: Quarks (colored), gluons (curly), color charge dynamics
 * - String: Worldsheets, vibrating strings, dimensional membranes
 * - Vacuum: Virtual pairs, quantum foam, spacetime bubbles
 * - Bubble: Particle tracks in detector
 * - SpinNetwork: Loop quantum gravity
 * - Electroweak: W/Z bosons, Higgs, muon, tau
 * - Cosmic: High-energy particle showers
 * - Nuclear: Decay chains, fission/fusion
 * - Topological: Anyons, braiding, knots
 *
 * @version 1.8.0
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
    weight: 0.22,
    particles: ["electron", "positron", "photon"],
    elements: ["fermionLine", "photonPropagator", "vertex", "loop", "annihilation", "scattering", "tadpole", "feynmanHistory", "pathIntegral"]
  },
  qcd: {
    name: "QCD",
    fullName: "Quantum Chromodynamics",
    description: "Quarks and gluons - color charge dynamics, penguin diagrams",
    weight: 0.20,
    particles: ["quark", "antiquark", "gluon"],
    elements: ["quarkLine", "gluonPropagator", "threeGluonVertex", "quarkGluonVertex", "colorLoop", "confinementTube", "penguin"]
  },
  string: {
    name: "String",
    fullName: "String Theory",
    description: "Worldsheets, vibrating strings, extra dimensions, string interactions",
    weight: 0.18,
    particles: ["string", "closedString", "brane"],
    elements: ["worldsheet", "torusWorldsheet", "stringMode", "braneIntersection", "dBraneAttachment", "pantsDiagram", "stringSplitting", "stringJoining", "calabiYau"]
  },
  vacuum: {
    name: "Vacuum",
    fullName: "Quantum Vacuum",
    description: "Virtual particles, quantum foam, fluctuations, vacuum bubbles",
    weight: 0.15,
    particles: ["virtualPair", "fluctuation"],
    elements: ["virtualLoop", "foamBubble", "uncertaintyCloud", "pairCreation", "casimirPlates", "vacuumEnergy", "vacuumBubble", "pathIntegral"]
  },
  bubble: {
    name: "Bubble",
    fullName: "Bubble Chamber",
    description: "Particle tracks in detector - spirals, V-decays, pair production",
    weight: 0.13,
    particles: ["track", "spiral", "decay"],
    elements: ["spiralTrack", "vDecay", "pairProduction", "kinkTrack", "straightTrack"]
  },
  spinNetwork: {
    name: "SpinNet",
    fullName: "Spin Network",
    description: "Loop quantum gravity - discrete spacetime structure, spin foams",
    weight: 0.08,
    particles: ["node", "edge"],
    elements: ["spinNode", "spinEdge", "spinGraph", "spinFoam", "penroseDiagram"]
  },
  electroweak: {
    name: "EWeak",
    fullName: "Electroweak",
    description: "W/Z bosons, Higgs mechanism, weak decays, symmetry breaking",
    weight: 0.08,
    particles: ["wBoson", "zBoson", "higgs", "neutrino", "muon", "tau"],
    elements: ["wPropagator", "zPropagator", "higgsVertex", "weakDecay", "neutrinoLine"]
  },
  cosmic: {
    name: "Cosmic",
    fullName: "Cosmic Rays",
    description: "High-energy particle showers, cascades, atmospheric interactions",
    weight: 0.08,
    particles: ["primaryCosmic", "secondary", "shower"],
    elements: ["showerCascade", "airShower", "cosmicTrack", "hadronic", "electromagnetic"]
  },
  nuclear: {
    name: "Nuclear",
    fullName: "Nuclear Physics",
    description: "Decay chains, shell model, fission/fusion, nuclear structure",
    weight: 0.07,
    particles: ["nucleus", "proton", "neutron", "alpha", "beta"],
    elements: ["decayChain", "nuclearShell", "fissionEvent", "fusionReaction", "alphaDecay"]
  },
  topological: {
    name: "Topo",
    fullName: "Topological",
    description: "Anyons, braiding, knots, topological quantum states",
    weight: 0.07,
    particles: ["anyon", "braid", "knot"],
    elements: ["braidPattern", "anyonExchange", "knotDiagram", "linkingNumber", "writhe"]
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

  // Composition (15 layouts including symmetry variants)
  const compositionRoll = R();
  let composition;
  if (compositionRoll < 0.10) {
    composition = "centered";
  } else if (compositionRoll < 0.20) {
    composition = "scattered";
  } else if (compositionRoll < 0.29) {
    composition = "flowing";
  } else if (compositionRoll < 0.37) {
    composition = "layered";
  } else if (compositionRoll < 0.44) {
    composition = "grid";
  } else if (compositionRoll < 0.51) {
    composition = "radial";
  } else if (compositionRoll < 0.58) {
    composition = "collision";
  } else if (compositionRoll < 0.64) {
    composition = "feynman";
  } else if (compositionRoll < 0.69) {
    composition = "detector";
  } else if (compositionRoll < 0.73) {
    composition = "chalkboard";
  } else if (compositionRoll < 0.77) {
    composition = "symmetryBreaking";
  } else if (compositionRoll < 0.83) {
    composition = "bilateral";
  } else if (compositionRoll < 0.89) {
    composition = "radial4";
  } else if (compositionRoll < 0.94) {
    composition = "radial6";
  } else {
    composition = "radial8";
  }

  // Line weight
  const lineWeight = rnd(0.5, 4);

  // Special features (rare)
  const hasHiggs = rndBool(0.05);
  const hasCalabiYau = rndBool(0.03);
  const hasGraviton = rndBool(0.02);
  const hasSupersymmetry = rndBool(0.04);

  // Background pattern (Sol LeWitt influence)
  const backgroundPattern = rndChoice([
    "none", "grid", "lines", "dots", "arcs", "diagonal",
    "crosshatch", "concentric", "concentricSquares", "radialLines",
    "wavyLines", "bands", "isometric", "randomArcs", "nestedArcs", "allFour"
  ]);
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

  // Physics label overlays (particle notation, coupling constants, etc.)
  const showLabels = rndBool(0.20);

  // Reaction diagrams - 25% chance
  const showReactions = rndBool(0.25);

  // Momentum flow chevrons
  const showMomentumFlow = rndBool(0.10);

  // Color charge flow on gluons
  const showColorFlow = rndBool(0.15);

  // Vertex glow
  const showVertexGlow = rndBool(0.4);

  // Arrow style
  const arrowStyle = rndChoice(["standard", "bold", "subtle", "none"]);

  // Extra complexity features
  const hasBackgroundDiagrams = rndBool(0.4 * density);
  const hasOverlappingLayers = rndBool(0.5 * density);

  features = {
    modes: selectedModes,
    modeCount,
    modeBlend,
    density,
    densityName,
    palette,
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
    showReactions,
    showMomentumFlow,
    showColorFlow,
    showVertexGlow,
    arrowStyle,
    hasBackgroundDiagrams,
    hasOverlappingLayers
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
    case "collision":
      drawCollisionComposition();
      break;
    case "feynman":
      drawFeynmanDiagramComposition();
      break;
    case "detector":
      drawDetectorComposition();
      break;
    case "chalkboard":
      drawChalkboardComposition();
      break;
    case "symmetryBreaking":
      drawSymmetryBreakingComposition();
      break;
    case "bilateral":
    case "radial4":
    case "radial6":
    case "radial8":
      drawWithSymmetry();
      break;
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

  // Time axis indicator (flowing composition + labels)
  if (features.showLabels && features.composition === "flowing") {
    drawTimeAxis();
  }

  // Cross-section formula for collision/feynman compositions
  if (features.showLabels &&
      (features.composition === "collision" || features.composition === "feynman")) {
    drawCrossSectionFormula();
  }
}

// ============================================================
// BACKGROUND PATTERNS (Sol LeWitt inspired)
// ============================================================

function drawBackgroundPattern() {
  // Determine if background is light or dark for contrast
  const bg = color(pal.background);
  const bgBrightness = brightness(bg);

  let gridCol;
  if (bgBrightness < 30) {
    // Dark background - use lighter color
    gridCol = color(255, 255, 255);
    gridCol.setAlpha(40);
  } else if (bgBrightness > 70) {
    // Light background - use darker color
    gridCol = color(0, 0, 0);
    gridCol.setAlpha(30);
  } else {
    // Medium - use dim color
    gridCol = color(pal.dim);
    gridCol.setAlpha(100);
  }

  stroke(gridCol);
  strokeWeight(0.75);
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
      // Diagonal lines (one direction)
      for (let i = -height; i < width + height; i += spacing) {
        line(i, 0, i + height, height);
      }
      break;

    case "crosshatch":
      // Sol LeWitt - two directions of diagonal lines
      for (let i = -height; i < width + height; i += spacing) {
        line(i, 0, i + height, height);
        line(i, height, i + height, 0);
      }
      break;

    case "concentric":
      // Concentric circles from center
      noFill();
      for (let r = spacing; r < max(width, height); r += spacing) {
        ellipse(width/2, height/2, r * 2, r * 2);
      }
      break;

    case "concentricSquares":
      // Sol LeWitt - nested squares from center
      noFill();
      rectMode(CENTER);
      for (let s = spacing; s < max(width, height); s += spacing) {
        rect(width/2, height/2, s * 2, s * 2);
      }
      rectMode(CORNER);
      break;

    case "radialLines":
      // Lines radiating from center (Sol LeWitt Wall Drawing 51)
      const numRays = Math.floor(map(features.patternDensity, 0.3, 1.0, 12, 36));
      for (let i = 0; i < numRays; i++) {
        const angle = (TWO_PI / numRays) * i;
        const length = max(width, height);
        line(width/2, height/2,
             width/2 + cos(angle) * length,
             height/2 + sin(angle) * length);
      }
      break;

    case "wavyLines":
      // Wavy horizontal lines
      noFill();
      const waveAmp = spacing * 0.4;
      const waveFreq = 0.02;
      for (let y = spacing; y < height; y += spacing) {
        beginShape();
        for (let x = 0; x <= width; x += 5) {
          const yOff = sin(x * waveFreq + y * 0.01) * waveAmp;
          vertex(x, y + yOff);
        }
        endShape();
      }
      break;

    case "bands":
      // Alternating bands (Sol LeWitt style)
      noStroke();
      fill(gridCol);
      const bandWidth = spacing * 1.5;
      for (let y = 0; y < height; y += bandWidth * 2) {
        rect(0, y, width, bandWidth);
      }
      break;

    case "isometric":
      // Isometric grid (three directions at 60 degrees)
      // Direction 1: vertical
      for (let x = spacing; x < width; x += spacing) {
        line(x, 0, x, height);
      }
      // Direction 2: 60 degrees
      for (let i = -height * 2; i < width + height * 2; i += spacing) {
        const x1 = i;
        const y1 = 0;
        const x2 = i + height * tan(PI/6);
        const y2 = height;
        line(x1, y1, x2, y2);
      }
      // Direction 3: -60 degrees
      for (let i = -height * 2; i < width + height * 2; i += spacing) {
        const x1 = i;
        const y1 = 0;
        const x2 = i - height * tan(PI/6);
        const y2 = height;
        line(x1, y1, x2, y2);
      }
      break;

    case "randomArcs":
      // Sol LeWitt Wall Drawing 260 style - random arcs
      noFill();
      const arcCount = Math.floor(map(features.patternDensity, 0.3, 1.0, 15, 50));
      for (let i = 0; i < arcCount; i++) {
        const cx = rnd(0, width);
        const cy = rnd(0, height);
        const r = rnd(spacing, spacing * 4);
        const startAngle = rnd(0, TWO_PI);
        const arcLength = rnd(QUARTER_PI, PI);
        arc(cx, cy, r, r, startAngle, startAngle + arcLength);
      }
      break;

    case "nestedArcs":
      // Sol LeWitt - arcs from corners
      noFill();
      // From each corner
      const corners = [[0, 0], [width, 0], [width, height], [0, height]];
      for (const [cx, cy] of corners) {
        for (let r = spacing; r < max(width, height) * 1.5; r += spacing * 2) {
          const startAngle = atan2(height/2 - cy, width/2 - cx);
          arc(cx, cy, r * 2, r * 2, startAngle - QUARTER_PI, startAngle + QUARTER_PI);
        }
      }
      break;

    case "allFour":
      // Sol LeWitt Wall Drawing 422 - all four directions superimposed
      strokeWeight(0.5);
      // Vertical
      for (let x = spacing * 2; x < width; x += spacing * 2) {
        line(x, 0, x, height);
      }
      // Horizontal
      for (let y = spacing * 2; y < height; y += spacing * 2) {
        line(0, y, width, y);
      }
      // Diagonal right
      for (let i = -height; i < width + height; i += spacing * 2) {
        line(i, 0, i + height, height);
      }
      // Diagonal left
      for (let i = -height; i < width + height; i += spacing * 2) {
        line(i, height, i + height, 0);
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
  switch (features.composition) {
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
      const loopSize = rnd(15, 45);
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

    // Add extra connections at high density
    if (features.density > 1.5) {
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

function drawCollisionComposition() {
  // LHC-style collision: two beams colliding at center
  const cx = width / 2;
  const cy = height / 2;

  // Beam lines from left and right
  const leftBeamCount = rndInt(2, 4);
  const rightBeamCount = rndInt(2, 4);
  const leftBeam = [];
  const rightBeam = [];

  for (let i = 0; i < leftBeamCount; i++) {
    leftBeam.push({ x: 20, y: cy + (i - (leftBeamCount - 1) / 2) * 30 });
  }
  for (let i = 0; i < rightBeamCount; i++) {
    rightBeam.push({ x: width - 20, y: cy + (i - (rightBeamCount - 1) / 2) * 30 });
  }

  // Central collision vertex cluster
  const clusterSize = Math.floor(4 + features.density * 4);
  const cluster = [];
  for (let i = 0; i < clusterSize; i++) {
    cluster.push({
      x: cx + rnd(-40, 40),
      y: cy + rnd(-40, 40),
      type: rndChoice(["interaction", "qcd", "creation"])
    });
  }

  // Connect beams to cluster
  leftBeam.forEach(b => {
    const target = rndChoice(cluster);
    drawPropagator(b.x, b.y, target.x, target.y, getRandomParticleType());
  });
  rightBeam.forEach(b => {
    const target = rndChoice(cluster);
    drawPropagator(b.x, b.y, target.x, target.y, getRandomParticleType());
  });

  // Interconnect cluster
  drawPropagatorNetwork(cluster);
  cluster.forEach(v => drawVertex(v.x, v.y, v.type));

  // Outgoing products radiating from cluster
  const productCount = Math.floor(6 + features.density * 8);
  for (let i = 0; i < productCount; i++) {
    const angle = (i / productCount) * TWO_PI + rnd(-0.15, 0.15);
    const origin = rndChoice(cluster);
    const rayLen = rnd(120, 300);
    const ex = origin.x + cos(angle) * rayLen;
    const ey = origin.y + sin(angle) * rayLen;

    drawPropagator(origin.x, origin.y, ex, ey, getRandomParticleType());

    // Secondary decay branches at 30% probability
    if (rndBool(0.3)) {
      const splitT = 0.6;
      const sx = origin.x + (ex - origin.x) * splitT;
      const sy = origin.y + (ey - origin.y) * splitT;
      const branchAngle = angle + rnd(-0.6, 0.6);
      const branchLen = rnd(40, 100);
      drawPropagator(sx, sy, sx + cos(branchAngle) * branchLen, sy + sin(branchAngle) * branchLen, getRandomParticleType());
      drawVertex(sx, sy, "decay");
    }

    // Loops at collision vertices
    if (rndBool(features.loopProbability * 0.4)) {
      drawLoop(origin.x + rnd(-20, 20), origin.y + rnd(-20, 20), rnd(15, 30));
    }
  }
}

function drawFeynmanDiagramComposition() {
  // Proper Feynman diagram: incoming legs → interaction layers → outgoing legs
  const inCount = rndInt(2, 3);
  const outCount = rndInt(3, 5);
  const layerCount = rndInt(2, 3);
  const leftX = 80;
  const rightX = width - 80;
  const layerSpacing = (rightX - leftX) / (layerCount + 1);

  // Create interaction vertex layers
  const layers = [];
  for (let l = 0; l < layerCount; l++) {
    const layer = [];
    const verticesInLayer = rndInt(2, 4);
    const lx = leftX + (l + 1) * layerSpacing + rnd(-20, 20);
    for (let v = 0; v < verticesInLayer; v++) {
      layer.push({
        x: lx + rnd(-15, 15),
        y: height * (0.2 + (v / (verticesInLayer - 1 || 1)) * 0.6) + rnd(-20, 20),
        type: rndChoice(["interaction", "qcd"])
      });
    }
    layers.push(layer);
  }

  // Incoming external legs
  const incoming = [];
  for (let i = 0; i < inCount; i++) {
    const iy = height * (0.25 + (i / (inCount - 1 || 1)) * 0.5);
    incoming.push({ x: leftX, y: iy });
    const target = rndChoice(layers[0]);
    drawPropagator(leftX, iy, target.x, target.y, getRandomParticleType());
    if (features.showLabels) {
      drawMomentumLabel(leftX - 15, iy, true, i);
    }
  }

  // Connect layers
  for (let l = 0; l < layerCount - 1; l++) {
    layers[l].forEach(v1 => {
      const targets = rndInt(1, 2);
      for (let t = 0; t < targets; t++) {
        const v2 = rndChoice(layers[l + 1]);
        drawPropagator(v1.x, v1.y, v2.x, v2.y, getRandomParticleType());
      }
    });
  }

  // Outgoing external legs
  const lastLayer = layers[layerCount - 1];
  for (let i = 0; i < outCount; i++) {
    const oy = height * (0.15 + (i / (outCount - 1 || 1)) * 0.7);
    const source = rndChoice(lastLayer);
    drawPropagator(source.x, source.y, rightX, oy, getRandomParticleType());
    if (features.showLabels) {
      drawMomentumLabel(rightX + 15, oy, false, i);
    }
  }

  // Draw vertices and loop insertions
  layers.forEach(layer => {
    layer.forEach(v => {
      drawVertex(v.x, v.y, v.type);
      if (rndBool(features.loopProbability * 0.7)) {
        drawLoop(v.x + rnd(-15, 15), v.y + rnd(-15, 15), rnd(15, 30));
      }
    });
  });
}

function drawDetectorComposition() {
  // Detector cross-section: concentric rings from collision point
  const cx = width / 2;
  const cy = height / 2;
  const innerR = 140;
  const middleR = 220;
  const outerR = 300;

  // Subtle ring guides
  push();
  noFill();
  stroke(pal.dim || pal.line);
  strokeWeight(0.5);
  drawingContext.setLineDash([4, 6]);
  ellipse(cx, cy, innerR * 2, innerR * 2);
  ellipse(cx, cy, middleR * 2, middleR * 2);
  ellipse(cx, cy, outerR * 2, outerR * 2);
  drawingContext.setLineDash([]);
  pop();

  // Central collision vertex
  drawVertex(cx, cy, "interaction");

  // Inner ring: tracking - straight fermion lines
  const trackCount = Math.floor(12 + features.density * 8);
  for (let i = 0; i < trackCount; i++) {
    const angle = (i / trackCount) * TWO_PI + rnd(-0.05, 0.05);
    const r = innerR + rnd(-20, 20);
    const ex = cx + cos(angle) * r;
    const ey = cy + sin(angle) * r;
    drawFermionLine(cx, cy, ex, ey, 1);
  }

  // Middle ring: calorimeter - shower clusters
  const showerCount = Math.floor(6 + features.density * 4);
  for (let i = 0; i < showerCount; i++) {
    const angle = (i / showerCount) * TWO_PI + rnd(-0.2, 0.2);
    const r = innerR + rnd(10, 30);
    const sx = cx + cos(angle) * r;
    const sy = cy + sin(angle) * r;
    drawVertex(sx, sy, rndChoice(["creation", "decay"]));

    // Shower particles spreading outward
    const showerParticles = rndInt(3, 5);
    for (let j = 0; j < showerParticles; j++) {
      const spread = angle + rnd(-0.3, 0.3);
      const sLen = rnd(40, middleR - innerR);
      drawPropagator(sx, sy, sx + cos(spread) * sLen, sy + sin(spread) * sLen, getRandomParticleType());
    }
  }

  // Outer ring: muon chamber - long tracks piercing all layers
  const muonCount = Math.floor(2 + features.density * 2);
  for (let i = 0; i < muonCount; i++) {
    const angle = rnd(0, TWO_PI);
    const ex = cx + cos(angle) * (outerR + rnd(0, 30));
    const ey = cy + sin(angle) * (outerR + rnd(0, 30));
    drawPropagator(cx, cy, ex, ey, "muon");
  }

  // Labels
  if (features.showLabels) {
    drawPhysicsLabel(cx, cy - innerR - 12, "Tracking", 7, 0.7);
    drawPhysicsLabel(cx, cy - middleR - 12, "Calorimeter", 7, 0.7);
    drawPhysicsLabel(cx, cy - outerR - 12, "Muon", 7, 0.7);
  }
}

function drawChalkboardComposition() {
  // Lecture notes: grid of cells with different diagram types
  const cols = rndInt(2, 3);
  const rows = rndInt(2, 3);
  const cellW = (width - 80) / cols;
  const cellH = (height - 80) / rows;
  const margin = 40;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = margin + c * cellW + cellW / 2;
      const cy = margin + r * cellH + cellH / 2;
      const cellSize = Math.min(cellW, cellH) * 0.35;

      push();
      translate(cx, cy);

      // Each cell gets a different diagram type
      const cellType = rndChoice(["reaction", "loop", "penguin", "network", "vertices"]);

      switch (cellType) {
        case "reaction":
          drawMiniDiagram(0, 0, cellSize / 60, 1.5);
          break;
        case "loop": {
          const topology = rndChoice(["sunset", "box", "triangle"]);
          if (topology === "sunset") drawSunsetDiagram(0, 0, cellSize);
          else if (topology === "box") drawBoxDiagram(0, 0, cellSize);
          else drawTriangleDiagram(0, 0, cellSize);
          break;
        }
        case "penguin":
          drawPenguinDiagram(0, 0, cellSize);
          break;
        case "network": {
          const verts = [];
          const nv = rndInt(4, 7);
          for (let i = 0; i < nv; i++) {
            verts.push({
              x: rnd(-cellSize, cellSize),
              y: rnd(-cellSize, cellSize),
              type: rndChoice(["interaction", "decay"])
            });
          }
          drawPropagatorNetwork(verts);
          verts.forEach(v => drawVertex(v.x, v.y, v.type));
          break;
        }
        case "vertices": {
          const mode = rndChoice(features.modes);
          const vCount = rndInt(3, 6);
          for (let i = 0; i < vCount; i++) {
            const vx = rnd(-cellSize * 0.8, cellSize * 0.8);
            const vy = rnd(-cellSize * 0.8, cellSize * 0.8);
            drawVertex(vx, vy, rndChoice(["interaction", "qcd", "creation"]));
            if (rndBool(features.loopProbability)) {
              drawLoop(vx, vy, rnd(10, 25));
            }
          }
          break;
        }
      }

      pop();
    }
  }

  // Decorative equation text between cells when labels are on
  if (features.showLabels) {
    const equations = [
      "\u2202F = j", "L = -\u00BC F\u00B2",
      "S = \u222BL d\u2074x", "\u0393 = \u2211 diagrams",
      "\u27E8\u03C6\u27E9 \u2260 0", "Z = \u222B D\u03C6 e^{iS}"
    ];
    const eqIdx = rndInt(0, equations.length - 1);
    drawPhysicsLabel(width / 2, height - 25, equations[eqIdx], 9, 0.7);
  }
}

function drawSymmetryBreakingComposition() {
  // Phase transition: ordered → chaotic across canvas
  const gridRows = Math.floor(5 + features.density * 2);
  const gridCols = gridRows * 2;
  const spacingX = (width - 80) / (gridCols - 1);
  const spacingY = (height - 80) / (gridRows - 1);
  const marginX = 40;
  const marginY = 40;

  const vertices = [];
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const progress = c / (gridCols - 1);
      const disorder = pow(progress, 2) * 60;
      vertices.push({
        r, c,
        x: marginX + c * spacingX + rnd(-disorder, disorder),
        y: marginY + r * spacingY + rnd(-disorder, disorder),
        type: progress > 0.6 ? rndChoice(["interaction", "decay", "creation", "qcd"]) : "interaction"
      });
    }
  }

  // Grid connections with decreasing probability
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const idx = r * gridCols + c;
      const v = vertices[idx];
      const progress = c / (gridCols - 1);
      const connectProb = 0.8 - progress * 0.3;

      // Right neighbor
      if (c < gridCols - 1 && rndBool(connectProb)) {
        const right = vertices[idx + 1];
        drawPropagator(v.x, v.y, right.x, right.y, getRandomParticleType());
      }
      // Down neighbor
      if (r < gridRows - 1 && rndBool(connectProb)) {
        const down = vertices[idx + gridCols];
        drawPropagator(v.x, v.y, down.x, down.y, getRandomParticleType());
      }
      // Random cross-connections in broken phase
      if (progress > 0.5 && rndBool(0.15 * features.density)) {
        const target = vertices[rndInt(0, vertices.length - 1)];
        const dist = sqrt(pow(v.x - target.x, 2) + pow(v.y - target.y, 2));
        if (dist < 150 && dist > 20) {
          drawPropagator(v.x, v.y, target.x, target.y, getRandomParticleType());
        }
      }

      drawVertex(v.x, v.y, v.type);
    }
  }

  // Dashed vertical line at transition zone
  if (features.showLabels) {
    const transX = marginX + 0.5 * (width - 80);
    push();
    stroke(pal.dim || pal.line);
    strokeWeight(0.8);
    drawingContext.setLineDash([6, 4]);
    line(transX, 20, transX, height - 20);
    drawingContext.setLineDash([]);
    pop();
    drawPhysicsLabel(transX, 15, "\u27E8\u03C6\u27E9 = 0 \u2192 \u27E8\u03C6\u27E9 \u2260 0", 8, 0.8);
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
    case "bubble":
      drawBubbleElements(vertices, alpha);
      break;
    case "spinNetwork":
      drawSpinNetworkElements(vertices, alpha);
      break;
    case "electroweak":
      drawElectroweakElements(vertices, alpha);
      break;
    case "cosmic":
      drawCosmicElements(vertices, alpha);
      break;
    case "nuclear":
      drawNuclearElements(vertices, alpha);
      break;
    case "topological":
      drawTopologicalElements(vertices, alpha);
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

  // Add tadpole diagrams (vacuum corrections)
  if (rndBool(features.loopProbability * 0.5)) {
    const v = rndChoice(vertices);
    drawTadpoleDiagram(v.x + rnd(-30, 30), v.y + rnd(-30, 30), rnd(30, 50), alpha);
  }

  // Compton scattering diagrams
  if (rndBool(0.2 * features.density)) {
    const x = rnd(120, width - 120);
    const y = rnd(120, height - 120);
    drawComptonDiagram(x, y, rnd(40, 70), alpha);
  }

  // Bremsstrahlung (radiation emission)
  if (rndBool(0.18 * features.density)) {
    const x = rnd(100, width - 100);
    const y = rnd(100, height - 100);
    drawBremsstrahlungDiagram(x, y, rnd(45, 75), alpha);
  }

  // Sunset diagram (two-loop self-energy)
  if (rndBool(0.15 * features.density)) {
    const x = rnd(100, width - 100);
    const y = rnd(100, height - 100);
    drawSunsetDiagram(x, y, rnd(40, 65), alpha);
  }

  // Triangle diagram
  if (rndBool(0.15 * features.density)) {
    const x = rnd(100, width - 100);
    const y = rnd(100, height - 100);
    drawTriangleDiagram(x, y, rnd(45, 70), alpha);
  }

  // Vertex correction
  if (rndBool(0.12 * features.density)) {
    const x = rnd(120, width - 120);
    const y = rnd(120, height - 120);
    drawVertexCorrection(x, y, rnd(40, 60), alpha);
  }

  // Self-energy insertions on propagators
  if (rndBool(0.2 * features.density) && vertices.length >= 2) {
    const v1 = vertices[rndInt(0, vertices.length - 1)];
    const v2 = vertices[(vertices.indexOf(v1) + 1) % vertices.length];
    drawSelfEnergyBlob(v1.x, v1.y, v2.x, v2.y, alpha);
  }

  // Reaction diagrams
  if (features.showReactions && rndBool(0.4 * features.density)) {
    const rx = rnd(150, width - 150);
    const ry = rnd(150, height - 150);
    if (rndBool(0.5)) {
      drawAnnihilationReaction(rx, ry, rnd(80, 120), alpha);
    } else {
      drawPairProductionReaction(rx, ry, rnd(80, 120), alpha);
    }
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

  // Add penguin diagrams (CP violation)
  if (rndBool(0.25 * features.density)) {
    const v = rndChoice(vertices);
    drawPenguinDiagram(v.x, v.y, rnd(50, 80), alpha);
  }

  // Box diagram (four-point loop)
  if (rndBool(0.18 * features.density)) {
    const x = rnd(100, width - 100);
    const y = rnd(100, height - 100);
    drawBoxDiagram(x, y, rnd(40, 65), alpha);
  }

  // Ladder diagram
  if (rndBool(0.15 * features.density)) {
    const x = rnd(120, width - 120);
    const y = rnd(100, height - 100);
    drawLadderDiagram(x, y, rnd(70, 110), rndInt(2, 4), alpha);
  }

  // Crossed diagram (exchange topology)
  if (rndBool(0.15 * features.density)) {
    const x = rnd(100, width - 100);
    const y = rnd(100, height - 100);
    drawCrossedDiagram(x, y, rnd(40, 60), alpha);
  }

  // Sunset diagram
  if (rndBool(0.12 * features.density)) {
    const x = rnd(100, width - 100);
    const y = rnd(100, height - 100);
    drawSunsetDiagram(x, y, rnd(40, 60), alpha);
  }

  // Higgs production reaction
  if (features.showReactions && rndBool(0.25 * features.density)) {
    const rx = rnd(150, width - 150);
    const ry = rnd(150, height - 150);
    drawHiggsProductionReaction(rx, ry, rnd(100, 140), alpha);
  }
}

function drawStringElements(vertices, alpha) {
  // Wave-based string visualizations (cleaner, line-based approach)

  // Vibrating open strings (standing waves)
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i];
    const elementType = rnd();

    if (elementType < 0.35) {
      // Single vibrating string
      const angle = rnd(TWO_PI);
      drawVibratingString(v.x, v.y, rnd(60, 120), angle, rndInt(1, 4), alpha);
    } else if (elementType < 0.55) {
      // Closed string loop (circular wave)
      drawClosedStringLoop(v.x, v.y, rnd(25, 50), rndInt(2, 6), alpha);
    } else if (elementType < 0.75) {
      // String harmonics display
      drawStringHarmonics(v.x, v.y, rnd(50, 90), rndInt(3, 5), alpha);
    } else if (elementType < 0.88) {
      // Wave interference (two strings meeting)
      drawWaveInterference(v.x, v.y, rnd(40, 70), alpha);
    } else {
      // Traveling wave packet
      drawWavePacket(v.x, v.y, rnd(50, 100), rnd(TWO_PI), alpha);
    }
  }

  // Connect some vertices with string propagators
  for (let i = 0; i < vertices.length - 1; i++) {
    if (rndBool(features.connectionDensity * 0.4)) {
      const j = (i + rndInt(1, 3)) % vertices.length;
      drawStringPropagator(vertices[i].x, vertices[i].y, vertices[j].x, vertices[j].y, alpha);
    }
  }

  // Additional harmonics at higher density
  const harmonicCount = Math.floor(features.density * 2);
  for (let i = 0; i < harmonicCount; i++) {
    const x = rnd(100, width - 100);
    const y = rnd(100, height - 100);
    drawVibratingString(x, y, rnd(40, 80), rnd(TWO_PI), rndInt(1, 5), alpha * 0.7);
  }
}

function drawVacuumElements(vertices, alpha) {
  // Quantum foam, virtual pairs, vacuum bubbles

  // Dense foam background
  drawQuantumFoam(alpha * 0.5);

  // Virtual particle pairs
  const pairCount = Math.floor(features.density * 8);
  for (let i = 0; i < pairCount; i++) {
    const x = rnd(50, width - 50);
    const y = rnd(50, height - 50);
    drawVirtualPair(x, y, rnd(15, 35), alpha);
  }

  // Vacuum bubbles (closed loop diagrams)
  const bubbleCount = Math.floor(features.density * 2);
  for (let i = 0; i < bubbleCount; i++) {
    const x = rnd(100, width - 100);
    const y = rnd(100, height - 100);
    drawVacuumBubble(x, y, rnd(25, 50), alpha * 0.8);
  }

  // Uncertainty clouds
  vertices.forEach(v => {
    if (rndBool(0.3)) {
      drawUncertaintyCloud(v.x, v.y, rnd(30, 60), alpha);
    }
  });

  // Path integral visualization (sum over histories)
  if (rndBool(0.25 * features.density)) {
    const x1 = rnd(80, width * 0.4);
    const y1 = rnd(150, height - 150);
    const x2 = rnd(width * 0.6, width - 80);
    const y2 = y1 + rnd(-80, 80);
    drawPathIntegralSum(x1, y1, x2, y2, alpha * 0.7);
  }

  // Casimir plates (rare)
  if (rndBool(0.15)) {
    drawCasimirPlates(width/2, height/2, alpha);
  }
}

function drawBubbleElements(vertices, alpha) {
  // Bubble chamber style - particle tracks in magnetic field

  // Main event region with multiple tracks
  const regionCount = Math.floor(features.density * 3) + 1;
  for (let r = 0; r < regionCount; r++) {
    const cx = rnd(100, width - 100);
    const cy = rnd(100, height - 100);
    const trackCount = rndInt(4, 12);
    drawBubbleChamberTracks(cx, cy, rnd(80, 180), trackCount, alpha);
  }

  // Additional spiral tracks (charged particles in B-field)
  const spiralCount = Math.floor(features.density * 5);
  for (let i = 0; i < spiralCount; i++) {
    const x = rnd(50, width - 50);
    const y = rnd(50, height - 50);
    drawSpiralTrack(x, y, rnd(15, 45), rnd(1.5, 4), rndChoice([-1, 1]), alpha);
  }

  // V-decay events
  const vDecayCount = Math.floor(features.density * 3);
  for (let i = 0; i < vDecayCount; i++) {
    const v = vertices[i % vertices.length];
    drawVDecay(v.x, v.y, rnd(40, 90), rnd(TWO_PI), alpha);
  }

  // Pair production events
  const pairCount = Math.floor(features.density * 2);
  for (let i = 0; i < pairCount; i++) {
    const x = rnd(80, width - 80);
    const y = rnd(80, height - 80);
    drawPairProduction(x, y, rnd(35, 70), rnd(TWO_PI), alpha);
  }

  // Kink tracks (scattering events)
  vertices.forEach(v => {
    if (rndBool(0.4)) {
      drawKinkTrack(v.x, v.y, rnd(50, 100), rnd(TWO_PI), rnd(-0.8, 0.8), alpha);
    }
  });
}

function drawSpinNetworkElements(vertices, alpha) {
  // Loop quantum gravity spin networks - quantized spacetime

  // Main spin networks
  const networkCount = Math.max(1, Math.floor(features.density * 2));
  for (let n = 0; n < networkCount; n++) {
    const cx = rnd(120, width - 120);
    const cy = rnd(120, height - 120);
    const size = rnd(80, 160);
    const nodeCount = rndInt(5, 12);
    drawSpinNetwork(cx, cy, size, nodeCount, alpha);
  }

  // Additional isolated nodes (volume quanta)
  const nodeCount = Math.floor(features.density * 8);
  const halfSpins = ["1/2", "1", "3/2", "2", "5/2"];
  for (let i = 0; i < nodeCount; i++) {
    const x = rnd(50, width - 50);
    const y = rnd(50, height - 50);
    drawSpinNetworkNode(x, y, rnd(5, 12), rndChoice(halfSpins), alpha);
  }

  // Connect some vertices with spin network edges
  for (let i = 0; i < vertices.length - 1; i++) {
    if (rndBool(features.connectionDensity * 0.5)) {
      const j = (i + rndInt(1, 3)) % vertices.length;
      drawSpinNetworkEdge(
        vertices[i].x, vertices[i].y,
        vertices[j].x, vertices[j].y,
        rndChoice(halfSpins),
        alpha
      );
    }
  }

  // Draw nodes at vertices
  vertices.forEach(v => {
    if (rndBool(0.6)) {
      drawSpinNetworkNode(v.x, v.y, rnd(8, 16), rndChoice(halfSpins), alpha);
    }
  });

  // Spin foam (4D evolution of spin network)
  if (rndBool(0.3 * features.density)) {
    const x = rnd(150, width - 150);
    const y = rnd(150, height - 150);
    drawSpinFoam(x, y, rnd(80, 140), alpha * 0.7);
  }

  // Penrose diagram (spacetime causal structure)
  if (rndBool(0.2 * features.density)) {
    const x = rnd(120, width - 120);
    const y = rnd(120, height - 120);
    drawPenroseDiagram(x, y, rnd(60, 100), alpha * 0.8);
  }
}

function drawElectroweakElements(vertices, alpha) {
  // W/Z bosons, Higgs, weak interactions

  // W boson exchanges (dashed wavy)
  for (let i = 0; i < vertices.length - 1; i++) {
    const v1 = vertices[i];
    const v2 = vertices[i + 1];

    if (rndBool(0.4)) {
      drawWBosonPropagator(v1.x, v1.y, v2.x, v2.y, alpha);
    } else if (rndBool(0.5)) {
      drawZBosonPropagator(v1.x, v1.y, v2.x, v2.y, alpha);
    } else {
      // Neutrino line (dashed)
      drawNeutrinoLine(v1.x, v1.y, v2.x, v2.y, alpha);
    }

    drawVertex(v1.x, v1.y, "weak");
  }

  // Higgs vertices (symmetry breaking)
  if (rndBool(0.3 * features.density)) {
    const v = rndChoice(vertices);
    drawHiggsVertex(v.x, v.y, rnd(40, 70), alpha);
  }

  // Weak decay diagrams
  const decayCount = Math.floor(features.density * 2);
  for (let i = 0; i < decayCount; i++) {
    const x = rnd(100, width - 100);
    const y = rnd(100, height - 100);
    drawWeakDecay(x, y, rnd(50, 80), alpha);
  }

  // W/Z/γ mixing
  if (rndBool(0.25 * features.density)) {
    const x = rnd(120, width - 120);
    const y = rnd(120, height - 120);
    drawElectroweakMixing(x, y, rnd(60, 90), alpha);
  }

  // Reaction diagrams
  if (features.showReactions && rndBool(0.35 * features.density)) {
    const rx = rnd(150, width - 150);
    const ry = rnd(150, height - 150);
    const roll = rnd();
    if (roll < 0.33) {
      drawBetaDecayReaction(rx, ry, rnd(90, 130), alpha);
    } else if (roll < 0.66) {
      drawMuonDecayReaction(rx, ry, rnd(90, 130), alpha);
    } else {
      drawAnnihilationReaction(rx, ry, rnd(80, 120), alpha);
    }
  }
}

function drawCosmicElements(vertices, alpha) {
  // Cosmic ray showers and cascades

  // Primary cosmic ray entering
  const primaryCount = Math.max(1, Math.floor(features.density));
  for (let p = 0; p < primaryCount; p++) {
    const startX = rnd(100, width - 100);
    drawCosmicShower(startX, 30, rnd(150, 300), alpha);
  }

  // Individual high-energy tracks
  vertices.forEach(v => {
    if (rndBool(0.5)) {
      drawCosmicTrack(v.x, v.y, rnd(60, 120), rnd(PI * 0.3, PI * 0.7), alpha);
    }
  });

  // Hadronic cascades
  if (rndBool(0.4 * features.density)) {
    const x = rnd(150, width - 150);
    const y = rnd(100, height - 200);
    drawHadronicCascade(x, y, rnd(80, 150), alpha);
  }

  // Electromagnetic showers
  if (rndBool(0.35 * features.density)) {
    const x = rnd(150, width - 150);
    const y = rnd(100, height - 200);
    drawEMShower(x, y, rnd(60, 120), alpha);
  }

  // Cherenkov rings
  const ringCount = Math.floor(features.density * 2);
  for (let i = 0; i < ringCount; i++) {
    const x = rnd(80, width - 80);
    const y = rnd(80, height - 80);
    drawCherenkovRing(x, y, rnd(20, 50), alpha * 0.6);
  }
}

function drawNuclearElements(vertices, alpha) {
  // Nuclear physics - decay chains, shells, reactions

  // Decay chains
  const chainCount = Math.max(1, Math.floor(features.density * 1.5));
  for (let c = 0; c < chainCount; c++) {
    const x = rnd(100, width - 150);
    const y = rnd(80, height - 150);
    drawDecayChain(x, y, rndInt(3, 6), alpha);
  }

  // Nuclear shell structures
  if (rndBool(0.3 * features.density)) {
    const v = rndChoice(vertices);
    drawNuclearShell(v.x, v.y, rnd(40, 70), alpha);
  }

  // Alpha decay events
  vertices.forEach(v => {
    if (rndBool(0.3)) {
      drawAlphaDecay(v.x, v.y, rnd(40, 70), alpha);
    }
  });

  // Beta decay
  if (rndBool(0.25 * features.density)) {
    const x = rnd(100, width - 100);
    const y = rnd(100, height - 100);
    drawBetaDecay(x, y, rnd(50, 80), alpha);
  }

  // Fission event
  if (rndBool(0.2 * features.density)) {
    const x = rnd(150, width - 150);
    const y = rnd(150, height - 150);
    drawFissionEvent(x, y, rnd(60, 100), alpha);
  }

  // Fusion reaction
  if (rndBool(0.2 * features.density)) {
    const x = rnd(150, width - 150);
    const y = rnd(150, height - 150);
    drawFusionReaction(x, y, rnd(50, 80), alpha);
  }

  // Beta decay reaction diagram
  if (features.showReactions && rndBool(0.3 * features.density)) {
    const rx = rnd(150, width - 150);
    const ry = rnd(150, height - 150);
    drawBetaDecayReaction(rx, ry, rnd(90, 130), alpha);
  }
}

function drawTopologicalElements(vertices, alpha) {
  // Topological quantum states - braiding, anyons, knots

  // Braid patterns
  const braidCount = Math.max(1, Math.floor(features.density * 1.5));
  for (let b = 0; b < braidCount; b++) {
    const x = rnd(80, width - 80);
    const y = rnd(80, height - 150);
    drawBraidPattern(x, y, rnd(60, 120), rndInt(2, 4), alpha);
  }

  // Anyon exchanges
  if (rndBool(0.4 * features.density)) {
    const x = rnd(100, width - 100);
    const y = rnd(100, height - 100);
    drawAnyonExchange(x, y, rnd(50, 90), alpha);
  }

  // Knot diagrams
  vertices.forEach(v => {
    if (rndBool(0.25)) {
      const knotType = rndChoice(["trefoil", "figure8", "unknot"]);
      drawKnotDiagram(v.x, v.y, rnd(30, 55), knotType, alpha);
    }
  });

  // Linking patterns
  if (rndBool(0.3 * features.density)) {
    const x = rnd(100, width - 100);
    const y = rnd(100, height - 100);
    drawLinkingPattern(x, y, rnd(40, 70), alpha);
  }

  // Topological defects
  const defectCount = Math.floor(features.density * 3);
  for (let i = 0; i < defectCount; i++) {
    const x = rnd(60, width - 60);
    const y = rnd(60, height - 60);
    drawTopologicalDefect(x, y, rnd(15, 30), alpha);
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
    case "muon":
      drawMuonLine(x1, y1, x2, y2, 1);
      break;
    case "tau":
      drawTauLine(x1, y1, x2, y2, 1);
      break;
    case "wBoson":
      drawWBosonPropagator(x1, y1, x2, y2, 1);
      break;
    case "zBoson":
      drawZBosonPropagator(x1, y1, x2, y2, 1);
      break;
    case "higgs":
      drawHiggsPropagator(x1, y1, x2, y2, 1);
      break;
    case "graviton":
      drawGravitonPropagator(x1, y1, x2, y2, 1);
      break;
    case "neutrino":
      drawNeutrinoLine(x1, y1, x2, y2, 1);
      break;
    case "neutrino_e":
      drawNeutrinoFlavored(x1, y1, x2, y2, "electron", 1);
      break;
    case "neutrino_mu":
      drawNeutrinoFlavored(x1, y1, x2, y2, "muon", 1);
      break;
    case "neutrino_tau":
      drawNeutrinoFlavored(x1, y1, x2, y2, "tau", 1);
      break;
    default:
      drawFermionLine(x1, y1, x2, y2, 1);
  }

  // Momentum flow chevrons
  if (features.showMomentumFlow) {
    drawMomentumFlow(x1, y1, x2, y2, 1);
  }

  // Color charge flow on gluons
  if (features.showColorFlow && particleType === "gluon") {
    drawColorChargeFlow(x1, y1, x2, y2, 1);
  }

  // Particle label overlay
  if (features.showLabels) {
    drawPropagatorLabel(x1, y1, x2, y2, particleType);
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

  // Vertex glow for interaction and qcd types
  if (features.showVertexGlow && (type === "interaction" || type === "qcd")) {
    drawVertexGlow(x, y, size * 2, type === "qcd" ? COLORS.quarkRed : pal.accent);
  }

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

  // Coupling constant annotation
  if (features.showLabels && (type === "interaction" || type === "qcd") && rndBool(0.15)) {
    drawCouplingConstant(x, y, type);
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
// ADVANCED FEYNMAN DIAGRAM TOPOLOGIES
// ============================================================

/**
 * Sunset/Sunrise Diagram - Two-loop self-energy
 * Three propagators forming a "sunset" shape
 */
function drawSunsetDiagram(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // External lines (in and out)
  line(x - size, y, x - size * 0.5, y);
  line(x + size * 0.5, y, x + size, y);

  // Three internal propagators forming the "sunset"
  // Top arc
  beginShape();
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const angle = PI + t * PI;
    const px = x + cos(angle) * size * 0.5;
    const py = y + sin(angle) * size * 0.4;
    vertex(px, py);
  }
  endShape();

  // Middle line
  line(x - size * 0.5, y, x + size * 0.5, y);

  // Bottom arc
  beginShape();
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const angle = t * PI;
    const px = x + cos(angle) * size * 0.5;
    const py = y + sin(angle) * size * 0.4;
    vertex(px, py);
  }
  endShape();

  // Vertices
  fill(pal.accent);
  noStroke();
  circle(x - size * 0.5, y, 5);
  circle(x + size * 0.5, y, 5);

  if (features.showLabels) drawPhysicsLabel(x, y - size * 0.8, "2-loop", 8, alpha * 0.9);
}

/**
 * Box Diagram - Four-point one-loop
 * Square loop with four external legs
 */
function drawBoxDiagram(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  const half = size * 0.4;

  // Box (internal loop)
  beginShape();
  vertex(x - half, y - half);
  vertex(x + half, y - half);
  vertex(x + half, y + half);
  vertex(x - half, y + half);
  endShape(CLOSE);

  // Four external legs
  line(x - half, y - half, x - size, y - size);  // top-left
  line(x + half, y - half, x + size, y - size);  // top-right
  line(x + half, y + half, x + size, y + size);  // bottom-right
  line(x - half, y + half, x - size, y + size);  // bottom-left

  // Vertices
  fill(pal.accent);
  noStroke();
  circle(x - half, y - half, 5);
  circle(x + half, y - half, 5);
  circle(x + half, y + half, 5);
  circle(x - half, y + half, 5);

  if (features.showLabels) drawPhysicsLabel(x, y - size * 0.8, "1-loop", 8, alpha * 0.9);
}

/**
 * Triangle Diagram - Three-point one-loop
 */
function drawTriangleDiagram(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Triangle vertices positions
  const v1 = { x: x, y: y - size * 0.5 };
  const v2 = { x: x - size * 0.45, y: y + size * 0.35 };
  const v3 = { x: x + size * 0.45, y: y + size * 0.35 };

  // Triangle (internal loop)
  beginShape();
  vertex(v1.x, v1.y);
  vertex(v2.x, v2.y);
  vertex(v3.x, v3.y);
  endShape(CLOSE);

  // Three external legs
  line(v1.x, v1.y, v1.x, v1.y - size * 0.4);
  line(v2.x, v2.y, v2.x - size * 0.35, v2.y + size * 0.25);
  line(v3.x, v3.y, v3.x + size * 0.35, v3.y + size * 0.25);

  // Vertices
  fill(pal.accent);
  noStroke();
  circle(v1.x, v1.y, 5);
  circle(v2.x, v2.y, 5);
  circle(v3.x, v3.y, 5);

  if (features.showLabels) drawPhysicsLabel(x, y - size * 0.8, "1-loop", 8, alpha * 0.9);
}

/**
 * Ladder Diagram - Iterative box structure
 */
function drawLadderDiagram(x, y, size, rungs = 3, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  const rungSpacing = size / (rungs + 1);
  const halfHeight = size * 0.25;

  // Top rail
  line(x - size/2, y - halfHeight, x + size/2, y - halfHeight);
  // Bottom rail
  line(x - size/2, y + halfHeight, x + size/2, y + halfHeight);

  // Rungs (internal propagators)
  for (let i = 1; i <= rungs; i++) {
    const rx = x - size/2 + i * rungSpacing;
    line(rx, y - halfHeight, rx, y + halfHeight);

    // Vertices at intersections
    fill(pal.accent);
    noStroke();
    circle(rx, y - halfHeight, 4);
    circle(rx, y + halfHeight, 4);
    stroke(col);
    strokeWeight(features.lineWeight);
    noFill();
  }

  // External legs
  line(x - size/2 - size * 0.2, y - halfHeight, x - size/2, y - halfHeight);
  line(x - size/2 - size * 0.2, y + halfHeight, x - size/2, y + halfHeight);
  line(x + size/2, y - halfHeight, x + size/2 + size * 0.2, y - halfHeight);
  line(x + size/2, y + halfHeight, x + size/2 + size * 0.2, y + halfHeight);

  if (features.showLabels) drawPhysicsLabel(x, y - halfHeight - 12, rungs + "-loop", 8, alpha * 0.9);
}

/**
 * Self-Energy Insertion - Propagator with blob correction
 */
function drawSelfEnergyBlob(x1, y1, x2, y2, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const blobSize = 12;

  // Line to blob
  line(x1, y1, midX - blobSize, midY);

  // Blob (self-energy correction)
  fill(pal.accent);
  stroke(col);
  ellipse(midX, midY, blobSize * 2, blobSize * 1.5);

  // Line from blob
  noFill();
  line(midX + blobSize, midY, x2, y2);

  // Arrows
  const angle = atan2(y2 - y1, x2 - x1);
  drawArrow(x1 + (midX - blobSize - x1) * 0.5, y1 + (midY - y1) * 0.5, angle, 4);
  drawArrow(midX + blobSize + (x2 - midX - blobSize) * 0.5, midY + (y2 - midY) * 0.5, angle, 4);
}

/**
 * Compton Scattering - Photon-electron scattering
 */
function drawComptonDiagram(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);
  const photonCol = color(COLORS.photon);
  photonCol.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Electron line (horizontal with kink)
  line(x - size, y, x - size * 0.3, y);
  line(x - size * 0.3, y, x + size * 0.3, y);
  line(x + size * 0.3, y, x + size, y);

  // Vertices
  fill(pal.accent);
  noStroke();
  circle(x - size * 0.3, y, 5);
  circle(x + size * 0.3, y, 5);

  // Incoming photon (wavy)
  stroke(photonCol);
  strokeWeight(features.lineWeight);
  noFill();
  drawPhotonPropagator(x - size * 0.7, y - size * 0.6, x - size * 0.3, y, alpha);

  // Outgoing photon (wavy)
  drawPhotonPropagator(x + size * 0.3, y, x + size * 0.7, y - size * 0.6, alpha);

  // Arrows on electron line
  stroke(col);
  drawArrow(x - size * 0.65, y, 0, 4);
  drawArrow(x, y, 0, 4);
  drawArrow(x + size * 0.65, y, 0, 4);

  if (features.showLabels) drawPhysicsLabel(x, y - size * 0.8, "tree", 8, alpha * 0.9);
}

/**
 * Bremsstrahlung - Radiation emission from accelerating particle
 */
function drawBremsstrahlungDiagram(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);
  const photonCol = color(COLORS.photon);
  photonCol.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Incoming electron
  line(x - size, y + size * 0.3, x, y);

  // Outgoing electron (deflected)
  line(x, y, x + size, y + size * 0.3);

  // Emitted photon
  drawPhotonPropagator(x, y, x + size * 0.5, y - size * 0.7, alpha);

  // Vertex
  fill(pal.accent);
  noStroke();
  circle(x, y, 6);

  // Arrows
  stroke(col);
  const inAngle = atan2(-size * 0.3, size);
  const outAngle = atan2(size * 0.3, size);
  drawArrow(x - size * 0.5, y + size * 0.15, inAngle, 4);
  drawArrow(x + size * 0.5, y + size * 0.15, outAngle, 4);

  if (features.showLabels) drawPhysicsLabel(x, y - size * 0.8, "tree", 8, alpha * 0.9);
}

/**
 * Vertex Correction - Loop correction at interaction vertex
 */
function drawVertexCorrection(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);
  const photonCol = color(COLORS.photon);
  photonCol.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Incoming fermion
  line(x - size, y + size * 0.5, x - size * 0.2, y);

  // Outgoing fermion
  line(x + size * 0.2, y, x + size, y + size * 0.5);

  // Virtual photon loop at vertex
  stroke(photonCol);
  beginShape();
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const angle = -PI/2 + t * PI;
    const wave = sin(t * 8 * PI) * 3;
    const r = size * 0.3 + wave;
    vertex(x + cos(angle) * r, y - size * 0.1 + sin(angle) * r * 0.8);
  }
  endShape();

  // Photon going up
  drawPhotonPropagator(x, y, x, y - size * 0.8, alpha);

  // Vertices
  fill(pal.accent);
  noStroke();
  circle(x - size * 0.2, y, 5);
  circle(x + size * 0.2, y, 5);

  if (features.showLabels) drawPhysicsLabel(x, y + size * 0.7, "1-loop", 8, alpha * 0.9);
}

/**
 * Crossed Diagram - Exchange/crossing topology
 */
function drawCrossedDiagram(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Four external lines meeting at crossed center
  line(x - size, y - size * 0.5, x, y);
  line(x + size, y - size * 0.5, x, y);
  line(x - size, y + size * 0.5, x, y);
  line(x + size, y + size * 0.5, x, y);

  // Central vertex
  fill(pal.accent);
  noStroke();
  circle(x, y, 7);

  // Arrows showing particle flow
  stroke(col);
  drawArrow(x - size * 0.5, y - size * 0.25, atan2(size * 0.5, size), 4);
  drawArrow(x + size * 0.5, y - size * 0.25, atan2(size * 0.5, -size), 4);
  drawArrow(x - size * 0.5, y + size * 0.25, atan2(-size * 0.5, size), 4);
  drawArrow(x + size * 0.5, y + size * 0.25, atan2(-size * 0.5, -size), 4);

  if (features.showLabels) drawPhysicsLabel(x, y - size * 0.8, "tree", 8, alpha * 0.9);
}

// ============================================================
// STRING THEORY ELEMENTS
// ============================================================

// ============================================================
// WAVE-BASED STRING VISUALIZATIONS
// ============================================================

/**
 * Vibrating String - Standing wave on an open string
 * Clean line-based visualization of string harmonics
 */
function drawVibratingString(x, y, length, angle, harmonic = 1, alpha = 1) {
  const col = color(COLORS.string);
  col.setAlpha(alpha * 255);

  push();
  translate(x, y);
  rotate(angle);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Standing wave pattern
  const amplitude = 12 + harmonic * 2;
  beginShape();
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const px = -length/2 + t * length;
    const py = sin(t * PI * harmonic) * amplitude;
    vertex(px, py);
  }
  endShape();

  // Fixed endpoints
  fill(pal.accent);
  noStroke();
  circle(-length/2, 0, 5);
  circle(length/2, 0, 5);

  // Node points (where wave crosses zero)
  if (harmonic > 1) {
    fill(col);
    for (let n = 1; n < harmonic; n++) {
      const nodeX = -length/2 + (n / harmonic) * length;
      circle(nodeX, 0, 3);
    }
  }

  pop();
}

/**
 * Closed String Loop - Circular wave pattern
 */
function drawClosedStringLoop(x, y, radius, modes = 3, alpha = 1) {
  const col = color(COLORS.string);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Circular wave with oscillations
  beginShape();
  for (let i = 0; i <= 60; i++) {
    const angle = (i / 60) * TWO_PI;
    const wobble = sin(angle * modes) * radius * 0.2;
    const r = radius + wobble;
    vertex(x + cos(angle) * r, y + sin(angle) * r);
  }
  endShape(CLOSE);

  // Center point
  fill(pal.accent);
  noStroke();
  circle(x, y, 4);
}

/**
 * String Harmonics - Multiple modes displayed together
 */
function drawStringHarmonics(x, y, length, numModes = 4, alpha = 1) {
  const col = color(COLORS.string);

  noFill();
  strokeWeight(features.lineWeight * 0.8);

  // Draw multiple harmonics with decreasing opacity
  for (let m = 1; m <= numModes; m++) {
    const modeAlpha = alpha * (1 - (m - 1) * 0.15);
    col.setAlpha(modeAlpha * 255);
    stroke(col);

    const yOffset = (m - (numModes + 1) / 2) * 18;
    const amplitude = 10;

    beginShape();
    for (let i = 0; i <= 35; i++) {
      const t = i / 35;
      const px = x - length/2 + t * length;
      const py = y + yOffset + sin(t * PI * m) * amplitude;
      vertex(px, py);
    }
    endShape();
  }

  // Endpoints
  fill(pal.accent);
  noStroke();
  circle(x - length/2, y, 5);
  circle(x + length/2, y, 5);

  // Label
  if (features.showLabels) {
    fill(pal.dim);
    textSize(8);
    textAlign(CENTER);
    text("n=1..." + numModes, x, y + numModes * 10 + 15);
  }
}

/**
 * Wave Interference - Two waves meeting
 */
function drawWaveInterference(x, y, size, alpha = 1) {
  const col = color(COLORS.string);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  const freq1 = rndInt(2, 4);
  const freq2 = rndInt(2, 4);

  // Wave 1 (coming from left)
  beginShape();
  for (let i = 0; i <= 25; i++) {
    const t = i / 25;
    const px = x - size + t * size;
    const py = y + sin(t * PI * freq1) * 10;
    vertex(px, py);
  }
  endShape();

  // Wave 2 (coming from right)
  beginShape();
  for (let i = 0; i <= 25; i++) {
    const t = i / 25;
    const px = x + t * size;
    const py = y + sin(t * PI * freq2) * 10;
    vertex(px, py);
  }
  endShape();

  // Interference point
  fill(pal.accent);
  noStroke();
  circle(x, y, 6);
}

/**
 * Wave Packet - Localized traveling wave
 */
function drawWavePacket(x, y, length, angle, alpha = 1) {
  const col = color(COLORS.string);
  col.setAlpha(alpha * 255);

  push();
  translate(x, y);
  rotate(angle);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Gaussian-modulated wave
  beginShape();
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) - 0.5; // -0.5 to 0.5
    const px = t * length;
    const envelope = exp(-t * t * 20); // Gaussian envelope
    const py = sin(t * 25) * 12 * envelope;
    vertex(px, py);
  }
  endShape();

  // Direction indicator
  stroke(pal.dim);
  strokeWeight(1);
  drawArrow(length * 0.4, 0, 0, 5);

  pop();
}

/**
 * String Propagator - Wavy line connecting two points (string-like)
 */
function drawStringPropagator(x1, y1, x2, y2, alpha = 1) {
  const col = color(COLORS.string);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  noFill();

  const d = dist(x1, y1, x2, y2);
  const angle = atan2(y2 - y1, x2 - x1);
  const waveCount = Math.max(3, Math.floor(d / 20));
  const amplitude = 6;

  beginShape();
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const baseX = lerp(x1, x2, t);
    const baseY = lerp(y1, y2, t);
    const wave = sin(t * waveCount * TWO_PI) * amplitude;
    const perpX = cos(angle + HALF_PI) * wave;
    const perpY = sin(angle + HALF_PI) * wave;
    vertex(baseX + perpX, baseY + perpY);
  }
  endShape();
}

/**
 * Pants Diagram - String Splitting Topology
 * One closed string splitting into two (or reverse: joining)
 */
function drawPantsDiagram(x, y, size, alpha = 1, joining = false) {
  const col = color(COLORS.worldsheet);
  col.setAlpha(alpha * 80);
  const lineCol = color(COLORS.string);
  lineCol.setAlpha(alpha * 255);

  stroke(lineCol);
  strokeWeight(features.lineWeight * 0.8);
  fill(col);

  // The "pants" topology - one tube splitting into two
  if (joining) {
    // Two inputs merging (draw upside down)
    beginShape();
    // Left leg (top)
    vertex(x - size * 0.6, y - size);
    bezierVertex(
      x - size * 0.6, y - size * 0.4,
      x - size * 0.2, y - size * 0.2,
      x, y
    );
    // Right leg (top)
    bezierVertex(
      x + size * 0.2, y - size * 0.2,
      x + size * 0.6, y - size * 0.4,
      x + size * 0.6, y - size
    );
    // Connect across top
    bezierVertex(
      x + size * 0.3, y - size * 1.1,
      x - size * 0.3, y - size * 1.1,
      x - size * 0.6, y - size
    );
    endShape();

    // Single output (bottom)
    noFill();
    beginShape();
    vertex(x - size * 0.25, y);
    bezierVertex(
      x - size * 0.25, y + size * 0.3,
      x - size * 0.2, y + size * 0.5,
      x, y + size * 0.7
    );
    endShape();
    beginShape();
    vertex(x + size * 0.25, y);
    bezierVertex(
      x + size * 0.25, y + size * 0.3,
      x + size * 0.2, y + size * 0.5,
      x, y + size * 0.7
    );
    endShape();
  } else {
    // One input splitting into two
    // Top tube (incoming string)
    beginShape();
    vertex(x - size * 0.25, y - size * 0.7);
    bezierVertex(
      x - size * 0.25, y - size * 0.3,
      x - size * 0.2, y - size * 0.1,
      x, y
    );
    endShape();
    beginShape();
    vertex(x + size * 0.25, y - size * 0.7);
    bezierVertex(
      x + size * 0.25, y - size * 0.3,
      x + size * 0.2, y - size * 0.1,
      x, y
    );
    endShape();

    // Pants body (splitting)
    fill(col);
    beginShape();
    // Left leg
    vertex(x - size * 0.6, y + size);
    bezierVertex(
      x - size * 0.6, y + size * 0.4,
      x - size * 0.2, y + size * 0.2,
      x, y
    );
    // Right leg
    bezierVertex(
      x + size * 0.2, y + size * 0.2,
      x + size * 0.6, y + size * 0.4,
      x + size * 0.6, y + size
    );
    // Connect legs at bottom
    bezierVertex(
      x + size * 0.3, y + size * 1.1,
      x - size * 0.3, y + size * 1.1,
      x - size * 0.6, y + size
    );
    endShape();
  }

  // Interaction vertex
  fill(pal.accent);
  noStroke();
  circle(x, y, 6);
}

/**
 * Torus Worldsheet - Closed String Loop in Time
 * More detailed visualization with internal structure
 */
function drawTorusWorldsheet(x, y, size, alpha = 1) {
  const col = color(COLORS.worldsheet);
  col.setAlpha(alpha * 60);
  const lineCol = color(COLORS.string);
  lineCol.setAlpha(alpha * 200);

  // Outer torus
  fill(col);
  stroke(lineCol);
  strokeWeight(features.lineWeight * 0.6);

  // Main torus body
  beginShape();
  for (let i = 0; i <= 50; i++) {
    const angle = (i / 50) * TWO_PI;
    const wobble = sin(angle * 2) * size * 0.1;
    const r = size + wobble;
    vertex(x + cos(angle) * r, y + sin(angle) * r * 0.5);
  }
  endShape(CLOSE);

  // Inner hole (darker)
  const holeCol = color(pal.background);
  holeCol.setAlpha(200);
  fill(holeCol);
  stroke(lineCol);
  strokeWeight(features.lineWeight * 0.4);
  beginShape();
  for (let i = 0; i <= 30; i++) {
    const angle = (i / 30) * TWO_PI;
    const r = size * 0.35;
    vertex(x + cos(angle) * r, y + sin(angle) * r * 0.5);
  }
  endShape(CLOSE);

  // Meridian lines (showing 3D structure)
  noFill();
  stroke(lineCol);
  strokeWeight(features.lineWeight * 0.3);
  for (let m = 0; m < 4; m++) {
    const startAngle = m * HALF_PI;
    beginShape();
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const angle = startAngle + t * PI;
      const r = lerp(size * 0.35, size, sin(t * PI));
      vertex(x + cos(angle) * r, y + sin(angle) * r * 0.5);
    }
    endShape();
  }

  // Winding number label
  if (features.showLabels) {
    fill(pal.dim);
    noStroke();
    textSize(10);
    textAlign(CENTER, CENTER);
    text("T²", x, y);
  }
}

/**
 * D-Brane Attachment - Open String Ending on D-Brane
 * Shows open strings with endpoints fixed on dimensional branes
 */
function drawDBraneAttachment(x, y, size, alpha = 1) {
  const braneCol = color(COLORS.brane);
  braneCol.setAlpha(alpha * 100);
  const stringCol = color(COLORS.string);
  stringCol.setAlpha(alpha * 255);

  // D-brane (horizontal membrane)
  fill(braneCol);
  noStroke();
  beginShape();
  vertex(x - size, y + size * 0.4);
  vertex(x + size, y + size * 0.3);
  vertex(x + size * 0.9, y + size * 0.6);
  vertex(x - size * 0.9, y + size * 0.7);
  endShape(CLOSE);

  // Label
  if (features.showLabels) {
    fill(pal.dim);
    noStroke();
    textSize(10);
    textAlign(LEFT, CENTER);
    text("D-brane", x - size * 0.9, y + size * 0.85);
  }

  // Multiple open strings attached
  const stringCount = rndInt(2, 5);
  for (let s = 0; s < stringCount; s++) {
    const attachX = x - size * 0.6 + s * (size * 1.2 / (stringCount - 1 || 1));
    const attachY = y + size * 0.5;

    // String endpoint on brane
    fill(pal.accent);
    noStroke();
    circle(attachX, attachY, 5);

    // Vibrating open string extending upward
    stroke(stringCol);
    strokeWeight(features.lineWeight * 0.7);
    noFill();

    const stringLength = rnd(size * 0.5, size * 0.9);
    const harmonic = rndInt(1, 3);
    beginShape();
    for (let i = 0; i <= 25; i++) {
      const t = i / 25;
      const px = attachX + sin(t * PI * harmonic) * rnd(8, 15);
      const py = attachY - t * stringLength;
      vertex(px, py);
    }
    endShape();

    // Free endpoint (for open string)
    fill(stringCol);
    noStroke();
    circle(attachX + sin(PI * harmonic) * rnd(-5, 5), attachY - stringLength, 4);
  }
}

/**
 * String Splitting Interaction
 * One string explicitly dividing into two
 */
function drawStringSplitting(x, y, size, angle, alpha = 1) {
  const col = color(COLORS.string);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  const cosA = cos(angle);
  const sinA = sin(angle);

  // Incoming string
  const inLength = size * 0.5;
  beginShape();
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    const wave = sin(t * PI * 2) * 5;
    const px = x - cosA * inLength * (1 - t);
    const py = y - sinA * inLength * (1 - t) + wave * cos(angle + HALF_PI);
    vertex(px, py);
  }
  endShape();

  // Splitting vertex
  fill(pal.accent);
  noStroke();
  circle(x, y, 8);

  // Two outgoing strings (diverging)
  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  const spread = 0.4;
  const outLength = size * 0.6;

  // String 1
  noFill();
  beginShape();
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    const wave = sin(t * PI * 1.5) * 4;
    const outAngle = angle + spread;
    const px = x + cos(outAngle) * t * outLength;
    const py = y + sin(outAngle) * t * outLength + wave * cos(outAngle + HALF_PI);
    vertex(px, py);
  }
  endShape();

  // String 2
  beginShape();
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    const wave = sin(t * PI * 2) * 4;
    const outAngle = angle - spread;
    const px = x + cos(outAngle) * t * outLength;
    const py = y + sin(outAngle) * t * outLength + wave * cos(outAngle + HALF_PI);
    vertex(px, py);
  }
  endShape();
}

/**
 * String Joining Interaction
 * Two strings merging into one
 */
function drawStringJoining(x, y, size, angle, alpha = 1) {
  const col = color(COLORS.string);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  noFill();

  const spread = 0.4;
  const inLength = size * 0.6;

  // Incoming string 1
  beginShape();
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    const wave = sin(t * PI * 1.5) * 4;
    const inAngle = angle + PI + spread;
    const px = x + cos(inAngle) * (1 - t) * inLength;
    const py = y + sin(inAngle) * (1 - t) * inLength + wave * cos(inAngle + HALF_PI);
    vertex(px, py);
  }
  endShape();

  // Incoming string 2
  beginShape();
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    const wave = sin(t * PI * 2) * 4;
    const inAngle = angle + PI - spread;
    const px = x + cos(inAngle) * (1 - t) * inLength;
    const py = y + sin(inAngle) * (1 - t) * inLength + wave * cos(inAngle + HALF_PI);
    vertex(px, py);
  }
  endShape();

  // Joining vertex
  fill(pal.accent);
  noStroke();
  circle(x, y, 8);

  // Outgoing merged string
  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();
  const outLength = size * 0.5;
  beginShape();
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    const wave = sin(t * PI * 2.5) * 6;
    const px = x + cos(angle) * t * outLength;
    const py = y + sin(angle) * t * outLength + wave * cos(angle + HALF_PI);
    vertex(px, py);
  }
  endShape();
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
// PHASE 3: ADVANCED PHYSICS ELEMENTS
// ============================================================

/**
 * Penrose Diagram - Spacetime Causal Structure
 * Conformal diagram showing light cones and causal boundaries
 */
function drawPenroseDiagram(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);
  const dimCol = color(pal.dim);
  dimCol.setAlpha(alpha * 150);

  // Diamond-shaped conformal boundary
  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Outer boundary (infinity)
  beginShape();
  vertex(x, y - size);         // i+ (future timelike infinity)
  vertex(x + size, y);         // i0 (spacelike infinity right)
  vertex(x, y + size);         // i- (past timelike infinity)
  vertex(x - size, y);         // i0 (spacelike infinity left)
  endShape(CLOSE);

  // Light cone lines (45 degree null geodesics)
  stroke(dimCol);
  strokeWeight(features.lineWeight * 0.5);
  const gridLines = 5;
  for (let i = 1; i < gridLines; i++) {
    const t = i / gridLines;
    // Diagonal lines (light rays)
    // Upper left to lower right
    line(x - size * (1 - t), y - size * t, x + size * t, y + size * (1 - t));
    // Upper right to lower left
    line(x + size * (1 - t), y - size * t, x - size * t, y + size * (1 - t));
  }

  // Central worldline (timelike observer)
  stroke(pal.accent);
  strokeWeight(features.lineWeight);
  line(x, y - size * 0.7, x, y + size * 0.7);

  // Event on worldline
  fill(pal.accent);
  noStroke();
  circle(x, y, 6);

  // Light cone from event
  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  line(x, y, x + size * 0.4, y + size * 0.4);  // Future right null
  line(x, y, x - size * 0.4, y + size * 0.4);  // Future left null
  line(x, y, x + size * 0.4, y - size * 0.4);  // Past right null
  line(x, y, x - size * 0.4, y - size * 0.4);  // Past left null

  // Labels
  if (features.showLabels) {
    fill(pal.dim);
    noStroke();
    textSize(8);
    textAlign(CENTER, CENTER);
    text("i⁺", x, y - size - 10);
    text("i⁻", x, y + size + 10);
    text("i⁰", x + size + 10, y);
    text("i⁰", x - size - 10, y);
  }
}

/**
 * Spin Foam - 4D Analog of Spin Networks
 * Foam-like structure representing quantum spacetime evolution
 */
function drawSpinFoam(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 200);
  const faceCol = color(COLORS.worldsheet);
  faceCol.setAlpha(alpha * 40);

  // Generate foam vertices
  const vertices = [];
  const vertCount = rndInt(8, 15);
  for (let i = 0; i < vertCount; i++) {
    const angle = rnd(TWO_PI);
    const radius = rnd(0.2, 1) * size;
    vertices.push({
      x: x + cos(angle) * radius,
      y: y + sin(angle) * radius,
      z: rnd(-0.5, 0.5) // Fake depth
    });
  }

  // Draw foam faces (triangulated)
  fill(faceCol);
  stroke(col);
  strokeWeight(features.lineWeight * 0.5);

  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const d = dist(vertices[i].x, vertices[i].y, vertices[j].x, vertices[j].y);
      if (d < size * 0.6 && rndBool(0.4)) {
        // Find third vertex for triangle
        for (let k = j + 1; k < vertices.length; k++) {
          const d2 = dist(vertices[j].x, vertices[j].y, vertices[k].x, vertices[k].y);
          const d3 = dist(vertices[i].x, vertices[i].y, vertices[k].x, vertices[k].y);
          if (d2 < size * 0.6 && d3 < size * 0.6 && rndBool(0.5)) {
            // Draw triangular face
            beginShape();
            vertex(vertices[i].x, vertices[i].y);
            vertex(vertices[j].x, vertices[j].y);
            vertex(vertices[k].x, vertices[k].y);
            endShape(CLOSE);
          }
        }
      }
    }
  }

  // Draw edges with spin labels
  stroke(col);
  strokeWeight(features.lineWeight * 0.6);
  for (let i = 0; i < vertices.length; i++) {
    const connections = rndInt(1, 3);
    for (let c = 0; c < connections; c++) {
      const j = (i + c + 1) % vertices.length;
      const d = dist(vertices[i].x, vertices[i].y, vertices[j].x, vertices[j].y);
      if (d < size * 0.7) {
        line(vertices[i].x, vertices[i].y, vertices[j].x, vertices[j].y);
      }
    }
  }

  // Draw vertices (intertwiner nodes)
  fill(pal.accent);
  noStroke();
  vertices.forEach(v => {
    const dotSize = 4 + v.z * 4; // Size varies with fake depth
    circle(v.x, v.y, dotSize);
  });
}

/**
 * Path Integral Sum - Sum Over Histories
 * Multiple overlapping paths representing quantum superposition
 */
function drawPathIntegralSum(x1, y1, x2, y2, alpha = 1) {
  const col = color(pal.line);
  const accentCol = color(pal.accent);

  // Draw multiple paths between two points
  const pathCount = rndInt(5, 12);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const pathDist = Math.sqrt(dx * dx + dy * dy);

  for (let p = 0; p < pathCount; p++) {
    const pathAlpha = alpha * (0.3 + 0.5 * (p === 0 ? 1 : 0.5)); // Classical path brighter
    col.setAlpha(pathAlpha * 255);
    stroke(col);
    strokeWeight(features.lineWeight * (p === 0 ? 1 : 0.5));
    noFill();

    beginShape();
    vertex(x1, y1);

    // Extra wiggles for non-classical paths
    if (p !== 0) {
      const segments = rndInt(3, 6);
      for (let s = 1; s < segments; s++) {
        const t = s / segments;
        const baseX = lerp(x1, x2, t);
        const baseY = lerp(y1, y2, t);
        const perpX = -dy / pathDist * rnd(-1, 1) * pathDist * 0.2;
        const perpY = dx / pathDist * rnd(-1, 1) * pathDist * 0.2;
        vertex(baseX + perpX, baseY + perpY);
      }
    }

    vertex(x2, y2);
    endShape();
  }

  // Endpoints (initial and final states)
  accentCol.setAlpha(alpha * 255);
  fill(accentCol);
  noStroke();
  circle(x1, y1, 8);
  circle(x2, y2, 8);

  // Sum symbol
  if (features.showLabels) {
    fill(pal.dim);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    const sumX = (x1 + x2) / 2;
    const sumY = (y1 + y2) / 2 - 30;
    text("∑", sumX, sumY);
    textSize(8);
    text("paths", sumX, sumY + 12);
  }
}

/**
 * Vacuum Bubble - Closed Loop Vacuum Diagram
 * Disconnected diagram representing vacuum fluctuation
 */
function drawVacuumBubble(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 200);
  const fillCol = color(COLORS.worldsheet);
  fillCol.setAlpha(alpha * 30);

  // Main bubble (closed loop)
  fill(fillCol);
  stroke(col);
  strokeWeight(features.lineWeight);

  // Irregular bubble shape
  beginShape();
  const points = 30;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * TWO_PI;
    const wobble = sin(angle * 3) * size * 0.15 + sin(angle * 5) * size * 0.08;
    const r = size + wobble;
    vertex(x + cos(angle) * r, y + sin(angle) * r);
  }
  endShape(CLOSE);

  // Internal structure (virtual particle propagators)
  stroke(col);
  strokeWeight(features.lineWeight * 0.6);
  const internalLines = rndInt(2, 5);
  for (let i = 0; i < internalLines; i++) {
    const angle1 = rnd(TWO_PI);
    const angle2 = angle1 + rnd(PI * 0.5, PI * 1.5);
    const r1 = size * rnd(0.3, 0.8);
    const r2 = size * rnd(0.3, 0.8);

    const px1 = x + cos(angle1) * r1;
    const py1 = y + sin(angle1) * r1;
    const px2 = x + cos(angle2) * r2;
    const py2 = y + sin(angle2) * r2;

    // Alternate between propagator types
    if (rndBool(0.5)) {
      drawPhotonPropagator(px1, py1, px2, py2, alpha * 0.7);
    } else {
      line(px1, py1, px2, py2);
      // Arrow for fermion
      const midX = (px1 + px2) / 2;
      const midY = (py1 + py2) / 2;
      const arrowAngle = atan2(py2 - py1, px2 - px1);
      drawArrow(midX, midY, arrowAngle, 4);
    }
  }

  // Central vertex (if any internal lines meet)
  if (internalLines > 2) {
    fill(pal.accent);
    noStroke();
    circle(x, y, 5);
  }

  // Label
  if (features.showLabels) {
    fill(pal.dim);
    noStroke();
    textSize(8);
    textAlign(CENTER, CENTER);
    text("vacuum", x, y + size + 12);
  }
}

/**
 * Feynman History Graph
 * Multiple time-ordered interaction sequences
 */
function drawFeynmanHistory(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  // Time axis (vertical)
  stroke(pal.dim);
  strokeWeight(1);
  if (features.showLabels) {
    line(x - size * 0.6, y - size, x - size * 0.6, y + size);
    drawArrow(x - size * 0.6, y - size, -HALF_PI, 5);
    fill(pal.dim);
    noStroke();
    textSize(8);
    textAlign(CENTER);
    text("t", x - size * 0.6, y - size - 10);
  }

  // Multiple particle worldlines
  stroke(col);
  strokeWeight(features.lineWeight);
  const particleCount = rndInt(2, 4);

  // Interaction vertices at random times
  const interactions = rndInt(1, 3);
  const interactionTimes = [];
  for (let i = 0; i < interactions; i++) {
    interactionTimes.push(y + size * rnd(-0.6, 0.6));
  }
  interactionTimes.sort((a, b) => b - a); // Sort from bottom to top (past to future)

  // Draw worldlines with interactions
  for (let i = 0; i < interactionTimes.length; i++) {
    const iy = interactionTimes[i];
    const ix = x + rnd(-size * 0.2, size * 0.2);

    // Draw vertex
    fill(pal.accent);
    noStroke();
    circle(ix, iy, 6);

    // Exchange particle (photon)
    if (rndBool(0.7)) {
      const exchLen = rnd(size * 0.15, size * 0.3);
      drawPhotonPropagator(ix - exchLen, iy, ix + exchLen, iy, alpha);
    }
  }

  // Draw particle paths
  noFill();
  stroke(col);
  for (let p = 0; p < particleCount; p++) {
    const startX = x - size * 0.3 + p * size * 0.25;
    beginShape();
    vertex(startX + rnd(-10, 10), y + size);
    for (let i = interactionTimes.length - 1; i >= 0; i--) {
      vertex(startX + rnd(-15, 15), interactionTimes[i]);
    }
    vertex(startX + rnd(-10, 10), y - size);
    endShape();
  }
}

// ============================================================
// ELECTROWEAK MODE ELEMENTS
// ============================================================

/**
 * W Boson Propagator - Dashed wavy line
 */
function drawWBosonPropagator(x1, y1, x2, y2, alpha = 1) {
  const col = color(COLORS.wBoson || "#e17055");
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  const d = dist(x1, y1, x2, y2);
  const angle = atan2(y2 - y1, x2 - x1);
  const waveCount = Math.max(4, Math.floor(d / 12));
  const amplitude = 6;

  // Dashed wavy line
  drawingContext.setLineDash([8, 4]);
  beginShape();
  for (let i = 0; i <= 35; i++) {
    const t = i / 35;
    const baseX = lerp(x1, x2, t);
    const baseY = lerp(y1, y2, t);
    const wave = sin(t * waveCount * TWO_PI) * amplitude;
    const perpX = cos(angle + HALF_PI) * wave;
    const perpY = sin(angle + HALF_PI) * wave;
    vertex(baseX + perpX, baseY + perpY);
  }
  endShape();
  drawingContext.setLineDash([]);
}

/**
 * Z Boson Propagator - Dotted wavy line
 */
function drawZBosonPropagator(x1, y1, x2, y2, alpha = 1) {
  const col = color(COLORS.zBoson || "#0984e3");
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  const d = dist(x1, y1, x2, y2);
  const angle = atan2(y2 - y1, x2 - x1);
  const waveCount = Math.max(4, Math.floor(d / 12));
  const amplitude = 5;

  drawingContext.setLineDash([3, 3]);
  beginShape();
  for (let i = 0; i <= 35; i++) {
    const t = i / 35;
    const baseX = lerp(x1, x2, t);
    const baseY = lerp(y1, y2, t);
    const wave = sin(t * waveCount * TWO_PI) * amplitude;
    const perpX = cos(angle + HALF_PI) * wave;
    const perpY = sin(angle + HALF_PI) * wave;
    vertex(baseX + perpX, baseY + perpY);
  }
  endShape();
  drawingContext.setLineDash([]);
}

/**
 * Neutrino Line - Dashed straight line
 */
function drawNeutrinoLine(x1, y1, x2, y2, alpha = 1) {
  const col = color(pal.dim);
  col.setAlpha(alpha * 200);

  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  drawingContext.setLineDash([6, 4]);
  line(x1, y1, x2, y2);
  drawingContext.setLineDash([]);

  // Arrow
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = atan2(y2 - y1, x2 - x1);
  drawArrow(midX, midY, angle, 4);
}

/**
 * Muon Line - Heavier lepton, thicker line
 */
function drawMuonLine(x1, y1, x2, y2, alpha = 1) {
  const col = color(COLORS.muon || "#6c5ce7");
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight * 1.1);
  line(x1, y1, x2, y2);

  // Arrow
  if (features.arrowStyle !== "none") {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const angle = atan2(y2 - y1, x2 - x1);
    fill(col);
    noStroke();
    drawArrow(mx, my, angle, features.lineWeight * 3.5);
  }
}

/**
 * Tau Line - Heaviest lepton, thickest line
 */
function drawTauLine(x1, y1, x2, y2, alpha = 1) {
  const col = color(COLORS.tau || "#00b894");
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight * 1.3);
  line(x1, y1, x2, y2);

  // Arrow
  if (features.arrowStyle !== "none") {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const angle = atan2(y2 - y1, x2 - x1);
    fill(col);
    noStroke();
    drawArrow(mx, my, angle, features.lineWeight * 4);
  }
}

/**
 * Higgs Propagator - Dashed line (scalar particle convention)
 */
function drawHiggsPropagator(x1, y1, x2, y2, alpha = 1) {
  const col = color(COLORS.higgs || "#fd79a8");
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight * 1.2);
  drawingContext.setLineDash([10, 5]);
  line(x1, y1, x2, y2);
  drawingContext.setLineDash([]);
}

/**
 * Graviton Propagator - Double wavy line (theoretical)
 */
function drawGravitonPropagator(x1, y1, x2, y2, alpha = 1) {
  const col = color(COLORS.graviton || "#dfe6e9");
  col.setAlpha(alpha * 200);

  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  noFill();

  const d = dist(x1, y1, x2, y2);
  const angle = atan2(y2 - y1, x2 - x1);
  const waveCount = Math.max(4, Math.floor(d / 14));
  const amplitude = 5;

  // Draw two parallel wavy lines
  for (let offset of [-2, 2]) {
    const offX = cos(angle + HALF_PI) * offset;
    const offY = sin(angle + HALF_PI) * offset;
    beginShape();
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const baseX = lerp(x1, x2, t) + offX;
      const baseY = lerp(y1, y2, t) + offY;
      const wave = sin(t * waveCount * TWO_PI) * amplitude;
      const perpX = cos(angle + HALF_PI) * wave;
      const perpY = sin(angle + HALF_PI) * wave;
      vertex(baseX + perpX, baseY + perpY);
    }
    endShape();
  }
}

/**
 * Flavored Neutrino Line - Dashed + ghostly, flavor-colored
 */
function drawNeutrinoFlavored(x1, y1, x2, y2, flavor, alpha = 1) {
  let col;
  switch (flavor) {
    case "electron": col = color(COLORS.electron || "#1d3557"); break;
    case "muon": col = color(COLORS.muon || "#6c5ce7"); break;
    case "tau": col = color(COLORS.tau || "#00b894"); break;
    default: col = color(COLORS.neutrino || "#b2bec3");
  }
  col.setAlpha(alpha * 150);

  stroke(col);
  strokeWeight(features.lineWeight * 0.7);
  drawingContext.setLineDash([5, 4]);
  line(x1, y1, x2, y2);
  drawingContext.setLineDash([]);

  // Ghostly arrow
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = atan2(y2 - y1, x2 - x1);
  col.setAlpha(alpha * 100);
  fill(col);
  noStroke();
  drawArrow(midX, midY, angle, 3);
}

/**
 * Higgs Vertex - Symmetry breaking point
 */
function drawHiggsVertex(x, y, size, alpha = 1) {
  const col = color(COLORS.higgs || "#fd79a8");
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Higgs field "Mexican hat" potential shape
  beginShape();
  for (let i = 0; i <= 30; i++) {
    const t = (i / 30 - 0.5) * 2;
    const px = x + t * size;
    const py = y - (t * t - 0.5) * (t * t - 0.5) * size * 0.8 + size * 0.2;
    vertex(px, py);
  }
  endShape();

  // Vacuum expectation value (minimum)
  fill(col);
  noStroke();
  circle(x - size * 0.5, y + size * 0.1, 6);
  circle(x + size * 0.5, y + size * 0.1, 6);

  // Central unstable point
  stroke(col);
  strokeWeight(1);
  noFill();
  circle(x, y - size * 0.3, 4);

  // VEV notation
  if (features.showLabels) {
    drawPhysicsLabel(x, y + size * 0.4, "\u27E8H\u27E9=v", 7, alpha * 0.8);
  }
}

/**
 * Weak Decay - Particle decaying via W boson
 */
function drawWeakDecay(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Incoming particle
  line(x - size, y, x - size * 0.3, y);

  // W boson (internal)
  drawWBosonPropagator(x - size * 0.3, y, x + size * 0.1, y - size * 0.4, alpha);

  // Decay products
  line(x + size * 0.1, y - size * 0.4, x + size, y - size * 0.6);
  drawNeutrinoLine(x + size * 0.1, y - size * 0.4, x + size, y - size * 0.1, alpha);
  line(x - size * 0.3, y, x + size * 0.5, y + size * 0.5);

  // Vertices
  fill(pal.accent);
  noStroke();
  circle(x - size * 0.3, y, 5);
  circle(x + size * 0.1, y - size * 0.4, 5);
}

/**
 * Electroweak Mixing - γ/Z mixing angle
 */
function drawElectroweakMixing(x, y, size, alpha = 1) {
  const photonCol = color(COLORS.photon);
  photonCol.setAlpha(alpha * 200);
  const zCol = color(COLORS.zBoson || "#0984e3");
  zCol.setAlpha(alpha * 200);

  noFill();
  strokeWeight(features.lineWeight * 0.8);

  // Mixing angle visualization
  const weinbergAngle = PI / 6; // ~30 degrees

  // Photon component
  stroke(photonCol);
  beginShape();
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const px = x - size/2 + t * size;
    const py = y - size * 0.3 + sin(t * 6 * PI) * 5 * cos(weinbergAngle);
    vertex(px, py);
  }
  endShape();

  // Z component
  stroke(zCol);
  drawingContext.setLineDash([4, 3]);
  beginShape();
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const px = x - size/2 + t * size;
    const py = y + size * 0.3 + sin(t * 6 * PI) * 5 * sin(weinbergAngle);
    vertex(px, py);
  }
  endShape();
  drawingContext.setLineDash([]);

  // Mixing vertex
  fill(pal.accent);
  noStroke();
  circle(x, y, 7);

  // Label
  if (features.showLabels) {
    fill(pal.dim);
    textSize(8);
    textAlign(CENTER);
    text("θW", x, y - size * 0.5);
  }
}

// ============================================================
// COSMIC RAY MODE ELEMENTS
// ============================================================

/**
 * Cosmic Shower - Particle cascade from primary
 */
function drawCosmicShower(x, y, depth, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  noFill();

  function drawBranch(bx, by, angle, length, generation) {
    if (generation > 5 || length < 10) return;

    const endX = bx + cos(angle) * length;
    const endY = by + sin(angle) * length;

    line(bx, by, endX, endY);

    // Interaction point
    if (generation > 0 && rndBool(0.7)) {
      fill(pal.accent);
      noStroke();
      circle(endX, endY, 3);
      stroke(col);
      strokeWeight(features.lineWeight * (0.8 - generation * 0.1));
    }

    // Branch into multiple secondaries
    const branches = rndInt(2, 4);
    for (let b = 0; b < branches; b++) {
      const spread = (b - (branches - 1) / 2) * 0.3;
      const newAngle = angle + spread + rnd(-0.1, 0.1);
      const newLength = length * rnd(0.5, 0.8);
      if (rndBool(0.7)) {
        drawBranch(endX, endY, newAngle, newLength, generation + 1);
      }
    }
  }

  drawBranch(x, y, HALF_PI, depth * 0.3, 0);
}

/**
 * Cosmic Track - High energy particle trace
 */
function drawCosmicTrack(x, y, length, angle, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  const endX = x + cos(angle) * length;
  const endY = y + sin(angle) * length;

  // Slightly irregular track
  beginShape();
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    const px = lerp(x, endX, t) + rnd(-2, 2);
    const py = lerp(y, endY, t) + rnd(-2, 2);
    vertex(px, py);
  }
  endShape();

  // Energy loss markers
  const markerCount = rndInt(2, 5);
  for (let m = 0; m < markerCount; m++) {
    const t = (m + 1) / (markerCount + 1);
    const mx = lerp(x, endX, t);
    const my = lerp(y, endY, t);
    fill(pal.accent);
    noStroke();
    circle(mx, my, 3);
  }
}

/**
 * Hadronic Cascade - Strongly interacting shower
 */
function drawHadronicCascade(x, y, size, alpha = 1) {
  const col = color(COLORS.quarkRed);
  col.setAlpha(alpha * 200);

  stroke(col);
  strokeWeight(features.lineWeight * 0.7);
  noFill();

  // Multiple dense tracks
  const trackCount = rndInt(8, 15);
  for (let t = 0; t < trackCount; t++) {
    const angle = HALF_PI + rnd(-0.5, 0.5);
    const length = size * rnd(0.5, 1);
    const startX = x + rnd(-size * 0.2, size * 0.2);

    beginShape();
    for (let i = 0; i <= 10; i++) {
      const s = i / 10;
      const px = startX + cos(angle) * length * s + rnd(-3, 3);
      const py = y + sin(angle) * length * s;
      vertex(px, py);
    }
    endShape();
  }

  // Interaction vertex
  fill(pal.accent);
  noStroke();
  circle(x, y, 8);
}

/**
 * Electromagnetic Shower - Photon/electron cascade
 */
function drawEMShower(x, y, size, alpha = 1) {
  const col = color(COLORS.photon);
  col.setAlpha(alpha * 200);

  stroke(col);
  strokeWeight(features.lineWeight * 0.6);
  noFill();

  // Alternating pair production and bremsstrahlung
  function drawEMBranch(bx, by, length, gen) {
    if (gen > 4 || length < 8) return;

    const leftAngle = HALF_PI - 0.2 - gen * 0.05;
    const rightAngle = HALF_PI + 0.2 + gen * 0.05;

    const leftEnd = { x: bx + cos(leftAngle) * length, y: by + sin(leftAngle) * length };
    const rightEnd = { x: bx + cos(rightAngle) * length, y: by + sin(rightAngle) * length };

    // Wavy for photon, straight for electron
    if (gen % 2 === 0) {
      drawPhotonPropagator(bx, by, leftEnd.x, leftEnd.y, alpha * 0.8);
      drawPhotonPropagator(bx, by, rightEnd.x, rightEnd.y, alpha * 0.8);
    } else {
      line(bx, by, leftEnd.x, leftEnd.y);
      line(bx, by, rightEnd.x, rightEnd.y);
    }

    drawEMBranch(leftEnd.x, leftEnd.y, length * 0.7, gen + 1);
    drawEMBranch(rightEnd.x, rightEnd.y, length * 0.7, gen + 1);
  }

  drawEMBranch(x, y, size * 0.4, 0);
}

/**
 * Cherenkov Ring - Faster-than-light-in-medium radiation
 */
function drawCherenkovRing(x, y, radius, alpha = 1) {
  const col = color("#74b9ff");
  col.setAlpha(alpha * 150);

  stroke(col);
  strokeWeight(features.lineWeight * 0.5);
  noFill();

  // Concentric rings with fade
  for (let r = 0; r < 3; r++) {
    const ringR = radius * (1 + r * 0.3);
    const ringAlpha = alpha * (1 - r * 0.3);
    col.setAlpha(ringAlpha * 150);
    stroke(col);
    ellipse(x, y, ringR * 2, ringR * 2);
  }
}

// ============================================================
// NUCLEAR MODE ELEMENTS
// ============================================================

/**
 * Decay Chain - Sequential nuclear decays
 */
function drawDecayChain(x, y, steps, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  let currentX = x;
  let currentY = y;
  const stepSize = 50;

  for (let s = 0; s < steps; s++) {
    // Nucleus
    const nucleusSize = 20 - s * 2;
    fill(pal.accent);
    stroke(col);
    strokeWeight(features.lineWeight * 0.8);
    circle(currentX, currentY, nucleusSize);

    // Decay arrow and product
    if (s < steps - 1) {
      const nextX = currentX + stepSize;
      const nextY = currentY + rnd(-20, 20);

      // Decay particle emission
      stroke(col);
      strokeWeight(features.lineWeight * 0.6);

      // Alpha or beta emission
      if (rndBool(0.5)) {
        // Alpha (helium nucleus)
        line(currentX + nucleusSize/2, currentY, currentX + stepSize * 0.4, currentY - 25);
        fill(COLORS.quarkRed);
        noStroke();
        circle(currentX + stepSize * 0.4, currentY - 25, 6);
      } else {
        // Beta (electron)
        stroke(COLORS.electron);
        line(currentX + nucleusSize/2, currentY, currentX + stepSize * 0.4, currentY - 20);
        // Neutrino (dashed)
        drawingContext.setLineDash([3, 3]);
        stroke(pal.dim);
        line(currentX + nucleusSize/2, currentY, currentX + stepSize * 0.4, currentY + 15);
        drawingContext.setLineDash([]);
      }

      // Arrow to next nucleus
      stroke(col);
      strokeWeight(features.lineWeight * 0.5);
      line(currentX + nucleusSize/2 + 5, currentY, nextX - nucleusSize/2 - 5, nextY);
      drawArrow(nextX - nucleusSize/2 - 5, nextY, atan2(nextY - currentY, stepSize), 4);

      currentX = nextX;
      currentY = nextY;
    }
  }
}

/**
 * Nuclear Shell - Shell model visualization
 */
function drawNuclearShell(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 200);

  noFill();
  stroke(col);
  strokeWeight(features.lineWeight * 0.6);

  // Concentric shells
  const shells = rndInt(3, 5);
  for (let s = 0; s < shells; s++) {
    const r = size * (0.3 + s * 0.2);
    ellipse(x, y, r * 2, r * 2);

    // Nucleons in shell
    const nucleonCount = (s + 1) * 2;
    for (let n = 0; n < nucleonCount; n++) {
      const angle = (n / nucleonCount) * TWO_PI + s * 0.3;
      const nx = x + cos(angle) * r;
      const ny = y + sin(angle) * r;

      fill(rndBool(0.5) ? COLORS.quarkRed : COLORS.quarkBlue);
      noStroke();
      circle(nx, ny, 5);
    }
  }
}

/**
 * Alpha Decay - Helium nucleus emission
 */
function drawAlphaDecay(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  // Parent nucleus
  fill(pal.accent);
  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  circle(x, y, size * 0.5);

  // Alpha particle trajectory
  stroke(COLORS.quarkRed);
  strokeWeight(features.lineWeight);
  const alphaAngle = rnd(-PI/4, PI/4);
  const alphaEnd = {
    x: x + cos(alphaAngle) * size,
    y: y + sin(alphaAngle) * size
  };
  line(x + size * 0.25, y, alphaEnd.x, alphaEnd.y);

  // Alpha particle (2p + 2n)
  fill(COLORS.quarkRed);
  noStroke();
  circle(alphaEnd.x, alphaEnd.y, 10);

  // Daughter nucleus (smaller)
  fill(pal.accent);
  stroke(col);
  strokeWeight(features.lineWeight * 0.6);
  const daughterAngle = alphaAngle + PI;
  circle(x + cos(daughterAngle) * size * 0.3, y + sin(daughterAngle) * size * 0.3, size * 0.4);
}

/**
 * Beta Decay - Electron/positron emission
 */
function drawBetaDecay(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  // Nucleus
  fill(pal.accent);
  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  circle(x, y, size * 0.4);

  // Electron
  stroke(COLORS.electron);
  strokeWeight(features.lineWeight);
  const eAngle = rnd(0, PI/3);
  line(x, y, x + cos(eAngle) * size, y - sin(eAngle) * size);
  fill(COLORS.electron);
  noStroke();
  circle(x + cos(eAngle) * size, y - sin(eAngle) * size, 5);

  // Antineutrino (dashed)
  stroke(pal.dim);
  strokeWeight(features.lineWeight * 0.6);
  drawingContext.setLineDash([4, 4]);
  const nuAngle = rnd(PI/3, 2*PI/3);
  line(x, y, x + cos(nuAngle) * size * 0.8, y - sin(nuAngle) * size * 0.8);
  drawingContext.setLineDash([]);
}

/**
 * Fission Event - Nucleus splitting
 */
function drawFissionEvent(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  // Incoming neutron
  stroke(COLORS.quarkBlue);
  strokeWeight(features.lineWeight);
  line(x - size, y, x - size * 0.3, y);
  fill(COLORS.quarkBlue);
  noStroke();
  circle(x - size, y, 5);

  // Parent nucleus (deformed)
  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  noFill();
  beginShape();
  for (let i = 0; i <= 20; i++) {
    const angle = (i / 20) * TWO_PI;
    const r = size * 0.25 * (1 + 0.3 * cos(2 * angle));
    vertex(x + cos(angle) * r, y + sin(angle) * r);
  }
  endShape(CLOSE);

  // Fission fragments
  fill(pal.accent);
  stroke(col);

  // Fragment 1
  push();
  translate(x + size * 0.5, y - size * 0.3);
  rotate(-PI/6);
  ellipse(0, 0, size * 0.3, size * 0.2);
  pop();

  // Fragment 2
  push();
  translate(x + size * 0.5, y + size * 0.3);
  rotate(PI/6);
  ellipse(0, 0, size * 0.3, size * 0.2);
  pop();

  // Emitted neutrons
  noFill();
  stroke(COLORS.quarkBlue);
  strokeWeight(features.lineWeight * 0.6);
  for (let n = 0; n < 3; n++) {
    const nAngle = rnd(-PI/2, PI/2);
    const nDist = size * rnd(0.6, 0.9);
    line(x, y, x + cos(nAngle) * nDist, y + sin(nAngle) * nDist);
  }
}

/**
 * Fusion Reaction - Nuclei combining
 */
function drawFusionReaction(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  // Two incoming nuclei
  fill(COLORS.quarkRed);
  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  circle(x - size * 0.6, y - size * 0.2, size * 0.25);
  circle(x - size * 0.6, y + size * 0.2, size * 0.25);

  // Arrows showing approach
  stroke(col);
  strokeWeight(features.lineWeight * 0.5);
  line(x - size * 0.45, y - size * 0.15, x - size * 0.2, y - size * 0.05);
  line(x - size * 0.45, y + size * 0.15, x - size * 0.2, y + size * 0.05);

  // Fusion vertex (energy release)
  fill(COLORS.photon);
  noStroke();
  circle(x, y, 12);

  // Product nucleus
  fill(pal.accent);
  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  circle(x + size * 0.5, y, size * 0.35);

  // Energy release (gamma)
  drawPhotonPropagator(x, y, x + size * 0.3, y - size * 0.5, alpha);
}

// ============================================================
// TOPOLOGICAL MODE ELEMENTS
// ============================================================

/**
 * Braid Pattern - Anyonic worldlines braiding
 */
function drawBraidPattern(x, y, size, strands = 3, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  strokeWeight(features.lineWeight);
  noFill();

  const strandSpacing = size / (strands + 1);
  const crossings = rndInt(2, 5);
  const segmentHeight = size / (crossings + 1);

  // Track strand positions
  let positions = [];
  for (let s = 0; s < strands; s++) {
    positions.push(x - size/2 + (s + 1) * strandSpacing);
  }

  // Draw strands with crossings
  for (let c = 0; c <= crossings; c++) {
    const cy = y + c * segmentHeight;

    // Swap two adjacent strands at each crossing
    if (c < crossings) {
      const swapIdx = c % (strands - 1);

      for (let s = 0; s < strands; s++) {
        const hue = (s / strands) * 360;
        stroke(color(`hsl(${hue}, 60%, 60%)`));

        const startX = positions[s];
        let endX = positions[s];

        if (s === swapIdx) {
          endX = positions[s + 1];
          // Over crossing
          strokeWeight(features.lineWeight * 1.2);
        } else if (s === swapIdx + 1) {
          endX = positions[s - 1];
          // Under crossing (gap)
          strokeWeight(features.lineWeight * 0.6);
        }

        beginShape();
        vertex(startX, cy);
        vertex((startX + endX) / 2, cy + segmentHeight / 2);
        vertex(endX, cy + segmentHeight);
        endShape();
      }

      // Swap positions
      const temp = positions[swapIdx];
      positions[swapIdx] = positions[swapIdx + 1];
      positions[swapIdx + 1] = temp;
    }
  }
}

/**
 * Anyon Exchange - Particle exchange with phase
 */
function drawAnyonExchange(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Two anyons exchanging
  const leftX = x - size * 0.4;
  const rightX = x + size * 0.4;

  // Worldlines crossing
  beginShape();
  vertex(leftX, y - size * 0.5);
  bezierVertex(leftX, y, rightX, y, rightX, y + size * 0.5);
  endShape();

  beginShape();
  vertex(rightX, y - size * 0.5);
  bezierVertex(rightX, y - size * 0.1, leftX, y + size * 0.1, leftX, y + size * 0.5);
  endShape();

  // Anyons
  fill(pal.accent);
  noStroke();
  circle(leftX, y - size * 0.5, 8);
  circle(rightX, y - size * 0.5, 8);
  circle(rightX, y + size * 0.5, 8);
  circle(leftX, y + size * 0.5, 8);

  // Phase indicator
  if (features.showLabels) {
    fill(pal.dim);
    textSize(10);
    textAlign(CENTER);
    text("e^(iθ)", x, y);
  }
}

/**
 * Knot Diagram - Various knot types
 */
function drawKnotDiagram(x, y, size, knotType = "trefoil", alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  if (knotType === "trefoil") {
    // Trefoil knot (3-crossing)
    beginShape();
    for (let t = 0; t <= 100; t++) {
      const theta = (t / 100) * TWO_PI * 2;
      const r = size * (0.5 + 0.3 * cos(3 * theta / 2));
      const px = x + r * cos(theta);
      const py = y + r * sin(theta);
      vertex(px, py);
    }
    endShape(CLOSE);
  } else if (knotType === "figure8") {
    // Figure-8 knot
    beginShape();
    for (let t = 0; t <= 100; t++) {
      const theta = (t / 100) * TWO_PI;
      const r = size * 0.4;
      const px = x + r * sin(theta);
      const py = y + r * sin(theta) * cos(theta);
      vertex(px, py);
    }
    endShape(CLOSE);
  } else {
    // Unknot (simple loop)
    ellipse(x, y, size, size * 0.7);
  }

  // Crossing indicators
  fill(pal.accent);
  noStroke();
  if (knotType === "trefoil") {
    for (let i = 0; i < 3; i++) {
      const angle = i * TWO_PI / 3;
      circle(x + cos(angle) * size * 0.3, y + sin(angle) * size * 0.3, 4);
    }
  }
}

/**
 * Linking Pattern - Linked loops
 */
function drawLinkingPattern(x, y, size, alpha = 1) {
  const col1 = color(pal.line);
  col1.setAlpha(alpha * 255);
  const col2 = color(pal.accent);
  col2.setAlpha(alpha * 255);

  strokeWeight(features.lineWeight);
  noFill();

  // Two linked circles (Hopf link)
  stroke(col1);
  ellipse(x - size * 0.2, y, size * 0.6, size * 0.4);

  stroke(col2);
  push();
  translate(x + size * 0.2, y);
  rotate(HALF_PI);
  ellipse(0, 0, size * 0.6, size * 0.4);
  pop();

  // Linking number indicator
  fill(pal.dim);
  noStroke();
  circle(x, y, 5);
}

/**
 * Topological Defect - Vortex/monopole
 */
function drawTopologicalDefect(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 200);

  stroke(col);
  strokeWeight(features.lineWeight * 0.5);
  noFill();

  // Vortex field lines
  const lines = 6;
  for (let l = 0; l < lines; l++) {
    const angle = (l / lines) * TWO_PI;
    beginShape();
    for (let r = size * 0.3; r <= size; r += 3) {
      const spiral = angle + r * 0.05;
      vertex(x + cos(spiral) * r, y + sin(spiral) * r);
    }
    endShape();
  }

  // Defect core
  fill(pal.accent);
  noStroke();
  circle(x, y, 6);
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
// PHASE 1: PENGUIN, TADPOLE, BUBBLE CHAMBER, SPIN NETWORKS
// ============================================================

/**
 * Penguin Diagram - Named after a legendary bar bet
 * Loop with external legs forming penguin-like shape
 * Important for CP violation in QCD
 */
function drawPenguinDiagram(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);
  const accentCol = color(pal.accent);
  accentCol.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // Body (loop) - the "belly" of the penguin
  const bodyWidth = size * 0.6;
  const bodyHeight = size * 0.8;
  ellipse(x, y, bodyWidth, bodyHeight);

  // Head (smaller loop on top)
  const headSize = size * 0.3;
  ellipse(x, y - bodyHeight/2 - headSize/3, headSize, headSize);

  // Left leg (incoming quark)
  const legY = y + bodyHeight/2;
  line(x - size * 0.8, legY + size * 0.3, x - bodyWidth/4, legY);
  drawVertex(x - bodyWidth/4, legY, "interaction");

  // Right leg (outgoing quark)
  line(x + bodyWidth/4, legY, x + size * 0.8, legY + size * 0.3);
  drawVertex(x + bodyWidth/4, legY, "interaction");

  // Gluon emission from loop (the "beak")
  stroke(accentCol);
  drawGluonPropagator(x, y - bodyHeight/2 - headSize, x, y - size * 1.2, alpha);

  // W boson inside loop (wavy internal line)
  stroke(col);
  strokeWeight(features.lineWeight * 0.7);
  drawPhotonPropagator(x - bodyWidth/4, y - bodyHeight/4, x + bodyWidth/4, y - bodyHeight/4, alpha * 0.6);

  if (features.showLabels) drawPhysicsLabel(x, y + bodyHeight/2 + size * 0.5, "1-loop", 8, alpha * 0.9);
}

/**
 * Tadpole Diagram - One-loop with single external leg
 * Looks like a tadpole, used for vacuum expectation values
 */
function drawTadpoleDiagram(x, y, size, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);
  noFill();

  // The "body" - a loop
  const loopSize = size * 0.6;
  ellipse(x, y - loopSize/3, loopSize, loopSize);

  // The "tail" - single external propagator
  const tailLength = size * 0.8;
  line(x, y + loopSize/6, x, y + tailLength);

  // Vertex where tail meets loop
  drawVertex(x, y + loopSize/6, "interaction");

  // Optional: add wiggles to tail for boson
  if (rndBool(0.5)) {
    stroke(color(COLORS.photon));
    drawPhotonPropagator(x, y + loopSize/6, x, y + tailLength, alpha * 0.8);
  }

  if (features.showLabels) drawPhysicsLabel(x, y - loopSize, "1-loop", 8, alpha * 0.9);
}

/**
 * Bubble Chamber Spiral Track
 * Charged particle losing energy in magnetic field
 */
function drawSpiralTrack(x, y, startRadius, turns, direction = 1, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  noFill();

  beginShape();
  const points = turns * 30;
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const angle = t * turns * TWO_PI * direction;
    const radius = startRadius * (1 - t * 0.85); // Decreasing radius
    const px = x + cos(angle) * radius;
    const py = y + sin(angle) * radius;
    vertex(px, py);
  }
  endShape();

  // Endpoint (particle stopped)
  const endAngle = turns * TWO_PI * direction;
  const endRadius = startRadius * 0.15;
  fill(col);
  noStroke();
  circle(x + cos(endAngle) * endRadius, y + sin(endAngle) * endRadius, 3);
}

/**
 * V-Decay Pattern
 * Neutral particle decaying into two charged particles
 */
function drawVDecay(x, y, size, angle, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);
  const accentCol = color(pal.accent);
  accentCol.setAlpha(alpha * 200);

  // Invisible neutral particle path (dashed)
  stroke(col);
  strokeWeight(features.lineWeight * 0.5);
  drawingContext.setLineDash([4, 4]);
  const neutralLength = size * 0.4;
  line(x - cos(angle) * neutralLength, y - sin(angle) * neutralLength, x, y);
  drawingContext.setLineDash([]);

  // Decay vertex
  fill(accentCol);
  noStroke();
  circle(x, y, 5);

  // Two charged particle tracks diverging
  stroke(col);
  strokeWeight(features.lineWeight);
  const spread = 0.4; // Angle spread
  const trackLength = size * 0.8;

  // Track 1 (curves slightly)
  beginShape();
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    const curveAngle = angle + spread + t * 0.2;
    const px = x + cos(curveAngle) * t * trackLength;
    const py = y + sin(curveAngle) * t * trackLength;
    vertex(px, py);
  }
  endShape();

  // Track 2 (curves opposite)
  beginShape();
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    const curveAngle = angle - spread - t * 0.2;
    const px = x + cos(curveAngle) * t * trackLength;
    const py = y + sin(curveAngle) * t * trackLength;
    vertex(px, py);
  }
  endShape();
}

/**
 * Pair Production Fork
 * Photon converting to electron-positron pair
 */
function drawPairProduction(x, y, size, angle, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  // Incoming photon (wavy)
  stroke(color(COLORS.photon));
  strokeWeight(features.lineWeight);
  const photonStart = {
    x: x - cos(angle) * size * 0.5,
    y: y - sin(angle) * size * 0.5
  };
  drawPhotonPropagator(photonStart.x, photonStart.y, x, y, alpha);

  // Conversion vertex
  fill(pal.accent);
  noStroke();
  circle(x, y, 6);

  // Electron track (curves one way in magnetic field)
  stroke(color(COLORS.electron));
  strokeWeight(features.lineWeight);
  beginShape();
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const curveAngle = angle + HALF_PI * 0.3 + t * 0.5;
    const radius = t * size * 0.7;
    vertex(x + cos(curveAngle) * radius, y + sin(curveAngle) * radius);
  }
  endShape();

  // Positron track (curves opposite way)
  stroke(color(COLORS.positron));
  beginShape();
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const curveAngle = angle - HALF_PI * 0.3 - t * 0.5;
    const radius = t * size * 0.7;
    vertex(x + cos(curveAngle) * radius, y + sin(curveAngle) * radius);
  }
  endShape();
}

/**
 * Particle Track with Kink
 * Sudden direction change indicating decay or scattering
 */
function drawKinkTrack(x, y, length, angle, kinkAngle, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight);

  // First segment
  const kinkPoint = {
    x: x + cos(angle) * length * 0.5,
    y: y + sin(angle) * length * 0.5
  };
  line(x, y, kinkPoint.x, kinkPoint.y);

  // Kink vertex
  fill(pal.accent);
  noStroke();
  circle(kinkPoint.x, kinkPoint.y, 4);

  // Second segment (different angle)
  stroke(col);
  const newAngle = angle + kinkAngle;
  line(kinkPoint.x, kinkPoint.y,
       kinkPoint.x + cos(newAngle) * length * 0.5,
       kinkPoint.y + sin(newAngle) * length * 0.5);

  // Optional secondary particle from kink
  if (rndBool(0.5)) {
    strokeWeight(features.lineWeight * 0.6);
    const secondaryAngle = angle + kinkAngle * 2;
    line(kinkPoint.x, kinkPoint.y,
         kinkPoint.x + cos(secondaryAngle) * length * 0.3,
         kinkPoint.y + sin(secondaryAngle) * length * 0.3);
  }
}

/**
 * Spin Network Node
 * Quantum of volume in loop quantum gravity
 */
function drawSpinNetworkNode(x, y, size, spinValue, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  // Node (quantum of volume)
  fill(col);
  noStroke();
  circle(x, y, size);

  // Spin label inside node
  if (features.showLabels && size > 8) {
    fill(pal.background);
    textSize(size * 0.5);
    textAlign(CENTER, CENTER);
    text(spinValue, x, y);
  }
}

/**
 * Spin Network Edge
 * Quantum of area connecting volume quanta
 */
function drawSpinNetworkEdge(x1, y1, x2, y2, spinLabel, alpha = 1) {
  const col = color(pal.line);
  col.setAlpha(alpha * 255);

  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  line(x1, y1, x2, y2);

  // Spin label on edge
  if (features.showLabels) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    fill(pal.dim);
    noStroke();
    textSize(8);
    textAlign(CENTER, CENTER);
    text(spinLabel, midX, midY - 8);
  }
}

/**
 * Complete Spin Network
 * Graph of nodes (volume) and edges (area)
 */
function drawSpinNetwork(x, y, size, nodeCount, alpha = 1) {
  const nodes = [];
  const halfSpins = ["1/2", "1", "3/2", "2", "5/2", "3"];

  // Generate nodes in a roughly circular arrangement
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * TWO_PI + rnd(-0.3, 0.3);
    const radius = size * rnd(0.3, 0.9);
    nodes.push({
      x: x + cos(angle) * radius,
      y: y + sin(angle) * radius,
      spin: rndChoice(halfSpins),
      size: rnd(6, 14)
    });
  }

  // Draw edges (each node connects to 2-4 others)
  for (let i = 0; i < nodes.length; i++) {
    const connections = rndInt(2, Math.min(4, nodes.length - 1));
    for (let c = 0; c < connections; c++) {
      const j = (i + c + 1) % nodes.length;
      if (i < j) { // Avoid duplicate edges
        drawSpinNetworkEdge(
          nodes[i].x, nodes[i].y,
          nodes[j].x, nodes[j].y,
          rndChoice(halfSpins),
          alpha
        );
      }
    }
  }

  // Draw nodes on top
  nodes.forEach(node => {
    drawSpinNetworkNode(node.x, node.y, node.size, node.spin, alpha);
  });
}

/**
 * Bubble Chamber Composition
 * Multiple particle tracks like a real detector photograph
 */
function drawBubbleChamberTracks(x, y, size, trackCount, alpha = 1) {
  for (let i = 0; i < trackCount; i++) {
    const trackType = rndChoice(["spiral", "vdecay", "pair", "kink", "straight"]);
    const tx = x + rnd(-size/2, size/2);
    const ty = y + rnd(-size/2, size/2);
    const angle = rnd(TWO_PI);

    switch(trackType) {
      case "spiral":
        drawSpiralTrack(tx, ty, rnd(20, 50), rnd(2, 5), rndChoice([-1, 1]), alpha);
        break;
      case "vdecay":
        drawVDecay(tx, ty, rnd(40, 80), angle, alpha);
        break;
      case "pair":
        drawPairProduction(tx, ty, rnd(30, 60), angle, alpha);
        break;
      case "kink":
        drawKinkTrack(tx, ty, rnd(40, 80), angle, rnd(-1, 1), alpha);
        break;
      case "straight":
        // Simple straight track
        stroke(pal.line);
        strokeWeight(features.lineWeight * 0.7);
        const len = rnd(50, 120);
        line(tx, ty, tx + cos(angle) * len, ty + sin(angle) * len);
        break;
    }
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

  // Add extra random connections at high density
  if (features.density > 1.5) {
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
      return rndChoice(["fermion", "photon", "graviton"]);
    case "vacuum":
      return rndChoice(["photon", "fermion"]);
    case "electroweak":
      return rndChoice(["wBoson", "zBoson", "neutrino", "muon", "tau", "higgs", "electron"]);
    case "cosmic":
      return rndChoice(["muon", "electron", "photon", "muon", "fermion"]);
    case "nuclear":
      return rndChoice(["fermion", "electron", "neutrino_e", "photon"]);
    case "bubble":
      return rndChoice(["electron", "photon", "muon", "fermion"]);
    case "spinNetwork":
      return rndChoice(["fermion", "photon"]);
    case "topological":
      return rndChoice(["fermion", "photon"]);
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

// ============================================================
// PARTICLE LABEL SYSTEM
// ============================================================

/**
 * Get Unicode physics notation for a particle type
 */
function getParticleLabel(particleType) {
  const labels = {
    photon: "\u03B3",          // γ
    electron: "e\u207B",       // e⁻
    positron: "e\u207A",       // e⁺
    fermion: "\u03C8",         // ψ
    muon: "\u03BC\u207B",      // μ⁻
    tau: "\u03C4\u207B",       // τ⁻
    neutrino: "\u03BD",        // ν
    neutrino_e: "\u03BD\u2091",// νₑ
    neutrino_mu: "\u03BD\u03BC",// νμ
    neutrino_tau: "\u03BD\u03C4",// ντ
    wBoson: "W\u00B1",         // W±
    zBoson: "Z\u2070",         // Z⁰
    higgs: "H",
    gluon: "g",
    graviton: "G",
    quark: "q"
  };
  return labels[particleType] || particleType;
}

/**
 * Render a physics label with proper styling
 */
function drawPhysicsLabel(x, y, label, size, alpha = 1) {
  push();
  const bg = color(pal.background);
  bg.setAlpha(180);

  // Background pill for readability
  textFont('serif');
  textSize(size);
  textAlign(CENTER, CENTER);
  const tw = textWidth(label) + 6;
  const th = size + 4;
  noStroke();
  fill(bg);
  rectMode(CENTER);
  rect(x, y, tw, th, 3);

  // Label text
  const col = color(pal.line);
  col.setAlpha(alpha * 220);
  fill(col);
  noStroke();
  text(label, x, y);
  pop();
}

/**
 * Draw a label at the midpoint of a propagator, offset perpendicular
 */
function drawPropagatorLabel(x1, y1, x2, y2, particleType) {
  const label = getParticleLabel(particleType);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const angle = atan2(y2 - y1, x2 - x1);

  // Offset perpendicular to the line
  const offsetDist = 12;
  const ox = cos(angle + HALF_PI) * offsetDist;
  const oy = sin(angle + HALF_PI) * offsetDist;

  drawPhysicsLabel(mx + ox, my + oy, label, 9);
}

function drawCouplingConstant(x, y, vertexType) {
  const hasQED = features.modes.some(m => m === "qed");
  const hasQCD = features.modes.some(m => m === "qcd");
  const hasEW = features.modes.some(m => m === "electroweak");

  let label;
  if (vertexType === "qcd") {
    label = "\u03B1s";
  } else if (hasEW && vertexType === "interaction") {
    label = "gw";
  } else if (hasQED) {
    label = "\u03B1";
  } else {
    label = "g";
  }
  drawPhysicsLabel(x + 10, y - 8, label, 7, 0.85);
}

function drawCrossSectionFormula() {
  drawPhysicsLabel(55, height - 30, "\u03C3 = \u222B|\u2133|\u00B2 d\u03A6", 10, 0.8);
}

function drawMomentumLabel(x, y, isIncoming, index) {
  const base = isIncoming ? "p" : "k";
  const subscripts = ["\u2081", "\u2082", "\u2083", "\u2084", "\u2085"];
  const label = base + (subscripts[index] || (index + 1));
  drawPhysicsLabel(x, y, label, 8, 0.85);
}

// ============================================================
// REACTION DIAGRAMS
// ============================================================

/**
 * e⁻e⁺ → γγ  (Electron-positron annihilation to two photons)
 */
function drawAnnihilationReaction(x, y, size, alpha = 1) {
  const s = size * 0.5;

  // Incoming electron (left-top)
  drawFermionLine(x - s, y - s * 0.6, x, y, alpha);
  // Incoming positron (left-bottom)
  drawFermionLine(x - s, y + s * 0.6, x, y, alpha);

  // Outgoing photons
  drawPhotonPropagator(x, y, x + s, y - s * 0.6, alpha);
  drawPhotonPropagator(x, y, x + s, y + s * 0.6, alpha);

  // Vertex
  drawVertex(x, y, "interaction");

  // Labels
  if (features.showLabels) {
    drawPhysicsLabel(x - s - 8, y - s * 0.6, "e\u207B", 8, alpha);
    drawPhysicsLabel(x - s - 8, y + s * 0.6, "e\u207A", 8, alpha);
    drawPhysicsLabel(x + s + 8, y - s * 0.6, "\u03B3", 8, alpha);
    drawPhysicsLabel(x + s + 8, y + s * 0.6, "\u03B3", 8, alpha);
  }
}

/**
 * n → p + e⁻ + ν̄ₑ  (Beta decay)
 */
function drawBetaDecayReaction(x, y, size, alpha = 1) {
  const s = size * 0.5;

  // Incoming neutron
  drawFermionLine(x - s, y, x - s * 0.2, y, alpha);

  // W boson (internal)
  drawWBosonPropagator(x - s * 0.2, y, x + s * 0.2, y - s * 0.5, alpha);

  // Outgoing proton
  drawFermionLine(x - s * 0.2, y, x + s, y + s * 0.3, alpha);

  // Decay products from W vertex
  drawFermionLine(x + s * 0.2, y - s * 0.5, x + s, y - s * 0.8, alpha);
  drawNeutrinoLine(x + s * 0.2, y - s * 0.5, x + s, y - s * 0.2, alpha);

  // Vertices
  drawVertex(x - s * 0.2, y, "decay");
  drawVertex(x + s * 0.2, y - s * 0.5, "decay");

  if (features.showLabels) {
    drawPhysicsLabel(x - s - 6, y, "n", 8, alpha);
    drawPhysicsLabel(x + s + 6, y + s * 0.3, "p", 8, alpha);
    drawPhysicsLabel(x + s + 8, y - s * 0.8, "e\u207B", 8, alpha);
    drawPhysicsLabel(x + s + 8, y - s * 0.2, "\u03BD\u0304\u2091", 8, alpha);
  }
}

/**
 * gg → H → γγ  (Higgs production via gluon fusion)
 */
function drawHiggsProductionReaction(x, y, size, alpha = 1) {
  const s = size * 0.5;

  // Incoming gluons
  drawGluonPropagator(x - s, y - s * 0.4, x - s * 0.15, y, alpha);
  drawGluonPropagator(x - s, y + s * 0.4, x - s * 0.15, y, alpha);

  // Top quark loop (triangle connecting gluon vertices to Higgs)
  const col = color(pal.line);
  col.setAlpha(alpha * 180);
  stroke(col);
  strokeWeight(features.lineWeight * 0.8);
  noFill();
  triangle(x - s * 0.15, y, x - s * 0.15, y - s * 0.25, x + s * 0.1, y);

  // Higgs propagator
  drawHiggsPropagator(x - s * 0.15, y, x + s * 0.15, y, alpha);

  // Outgoing photons
  drawPhotonPropagator(x + s * 0.15, y, x + s, y - s * 0.4, alpha);
  drawPhotonPropagator(x + s * 0.15, y, x + s, y + s * 0.4, alpha);

  // Vertices
  drawVertex(x - s * 0.15, y, "interaction");
  drawVertex(x + s * 0.15, y, "interaction");

  if (features.showLabels) {
    drawPhysicsLabel(x - s - 6, y - s * 0.4, "g", 8, alpha);
    drawPhysicsLabel(x - s - 6, y + s * 0.4, "g", 8, alpha);
    drawPhysicsLabel(x, y - 12, "H", 9, alpha);
    drawPhysicsLabel(x + s + 6, y - s * 0.4, "\u03B3", 8, alpha);
    drawPhysicsLabel(x + s + 6, y + s * 0.4, "\u03B3", 8, alpha);
  }
}

/**
 * γ → e⁻e⁺  (Pair production)
 */
function drawPairProductionReaction(x, y, size, alpha = 1) {
  const s = size * 0.5;

  // Incoming photon
  drawPhotonPropagator(x - s, y, x, y, alpha);

  // Nucleus (needed for momentum conservation)
  const col = color(pal.dim);
  col.setAlpha(alpha * 120);
  stroke(col);
  strokeWeight(features.lineWeight * 2);
  drawingContext.setLineDash([3, 3]);
  line(x, y + s * 0.6, x, y);
  drawingContext.setLineDash([]);

  // Outgoing pair
  drawFermionLine(x, y, x + s, y - s * 0.5, alpha);
  drawFermionLine(x, y, x + s, y + s * 0.3, alpha);

  // Vertex
  drawVertex(x, y, "creation");

  if (features.showLabels) {
    drawPhysicsLabel(x - s - 6, y, "\u03B3", 8, alpha);
    drawPhysicsLabel(x + s + 8, y - s * 0.5, "e\u207B", 8, alpha);
    drawPhysicsLabel(x + s + 8, y + s * 0.3, "e\u207A", 8, alpha);
  }
}

/**
 * μ⁻ → e⁻ + ν̄ₑ + νμ  (Muon decay)
 */
function drawMuonDecayReaction(x, y, size, alpha = 1) {
  const s = size * 0.5;

  // Incoming muon
  drawMuonLine(x - s, y, x - s * 0.15, y, alpha);

  // W boson (virtual, internal)
  drawWBosonPropagator(x - s * 0.15, y, x + s * 0.2, y - s * 0.4, alpha);

  // Outgoing muon neutrino
  drawNeutrinoFlavored(x - s * 0.15, y, x + s, y + s * 0.4, "muon", alpha);

  // Decay products from W vertex
  drawFermionLine(x + s * 0.2, y - s * 0.4, x + s, y - s * 0.7, alpha);
  drawNeutrinoFlavored(x + s * 0.2, y - s * 0.4, x + s, y - s * 0.1, "electron", alpha);

  // Vertices
  drawVertex(x - s * 0.15, y, "decay");
  drawVertex(x + s * 0.2, y - s * 0.4, "decay");

  if (features.showLabels) {
    drawPhysicsLabel(x - s - 8, y, "\u03BC\u207B", 8, alpha);
    drawPhysicsLabel(x + s + 8, y + s * 0.4, "\u03BD\u03BC", 8, alpha);
    drawPhysicsLabel(x + s + 8, y - s * 0.7, "e\u207B", 8, alpha);
    drawPhysicsLabel(x + s + 8, y - s * 0.1, "\u03BD\u0304\u2091", 8, alpha);
  }
}

// ============================================================
// MOMENTUM FLOW & VISUAL POLISH
// ============================================================

/**
 * Draw momentum flow chevrons along a propagator path
 */
function drawMomentumFlow(x1, y1, x2, y2, alpha = 1) {
  const d = dist(x1, y1, x2, y2);
  const angle = atan2(y2 - y1, x2 - x1);
  const spacing = 40;
  const count = Math.floor(d / spacing);

  const col = color(pal.dim);
  col.setAlpha(alpha * 100);
  stroke(col);
  strokeWeight(features.lineWeight * 0.5);
  noFill();

  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const cx = lerp(x1, x2, t);
    const cy = lerp(y1, y2, t);
    const chevSize = 4;

    push();
    translate(cx, cy);
    rotate(angle);
    line(-chevSize, -chevSize * 0.6, 0, 0);
    line(-chevSize, chevSize * 0.6, 0, 0);
    pop();
  }
}

/**
 * Draw color charge flow dots along gluon lines
 */
function drawColorChargeFlow(x1, y1, x2, y2, alpha = 1) {
  const d = dist(x1, y1, x2, y2);
  const count = Math.floor(d / 15);
  const rgbColors = ["#e63946", "#2a9d8f", "#457b9d"]; // RGB color charge

  noStroke();
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const cx = lerp(x1, x2, t);
    const cy = lerp(y1, y2, t);
    const dotCol = color(rgbColors[i % 3]);
    dotCol.setAlpha(alpha * 160);
    fill(dotCol);
    circle(cx, cy, 3);
  }
}

/**
 * Draw a glow effect behind a vertex
 */
function drawVertexGlow(x, y, size, glowColor, alpha = 1) {
  noStroke();
  for (let r = 3; r >= 0; r--) {
    const col = color(glowColor);
    col.setAlpha(alpha * (20 - r * 5));
    fill(col);
    circle(x, y, size * (1 + r * 0.8));
  }
}

/**
 * Draw time axis indicator on right edge
 */
function drawTimeAxis() {
  const x = width - 25;
  const y1 = 60;
  const y2 = height - 60;

  const col = color(pal.dim);
  col.setAlpha(120);
  stroke(col);
  strokeWeight(1);
  drawingContext.setLineDash([5, 5]);
  line(x, y1, x, y2);
  drawingContext.setLineDash([]);

  // Arrow at top
  fill(col);
  noStroke();
  triangle(x, y1 - 5, x - 4, y1 + 3, x + 4, y1 + 3);

  // Label
  textFont('serif');
  textSize(10);
  textAlign(CENTER);
  fill(col);
  text("t", x, y1 - 10);
}

// ============================================================
// ANIMATION SYSTEM (Non-deterministic overlay)
// ============================================================

let animationActive = false;
let flowParticles = [];

class FlowParticle {
  constructor() {
    this.reset();
  }

  // Use Math.random() to avoid consuming hash-based R state
  _rnd(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
  }

  reset() {
    this.x = this._rnd(0, width * 0.3);
    this.y = this._rnd(50, height - 50);
    this.vx = this._rnd(0.5, 2.5);
    this.vy = this._rnd(-0.5, 0.5);
    this.life = 1;
    this.decay = this._rnd(0.003, 0.008);
    this.size = this._rnd(2, 5);
    this.trail = [];
    const particleColors = [COLORS.photon, COLORS.electron, COLORS.muon, COLORS.quarkRed, COLORS.quarkGreen, COLORS.quarkBlue];
    this.col = particleColors[Math.floor(Math.random() * particleColors.length)];
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 15) this.trail.shift();

    this.x += this.vx;
    this.y += this.vy;
    this.vy += this._rnd(-0.1, 0.1);
    this.life -= this.decay;

    if (this.life <= 0 || this.x > width || this.y < 0 || this.y > height) {
      this.reset();
    }
  }

  draw() {
    // Trail
    noFill();
    const c = color(this.col);
    for (let i = 0; i < this.trail.length - 1; i++) {
      const alpha = (i / this.trail.length) * this.life * 100;
      c.setAlpha(alpha);
      stroke(c);
      strokeWeight(this.size * (i / this.trail.length));
      line(this.trail[i].x, this.trail[i].y, this.trail[i + 1].x, this.trail[i + 1].y);
    }

    // Head
    c.setAlpha(this.life * 255);
    noStroke();
    fill(c);
    circle(this.x, this.y, this.size);
  }
}

function initAnimation() {
  flowParticles = [];
  for (let i = 0; i < 20; i++) {
    flowParticles.push(new FlowParticle());
  }
}

function drawAnimationLayer() {
  for (const p of flowParticles) {
    p.update();
    p.draw();
  }
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
  if (key === 'a' || key === 'A') {
    toggleAnimation();
    return false;
  }
  return true;
}

function toggleAnimation() {
  animationActive = !animationActive;
  if (animationActive) {
    initAnimation();
    loop();
  } else {
    noLoop();
    render(); // Redraw static scene
  }
  if (typeof window.updateAnimationButton === 'function') {
    window.updateAnimationButton();
  }
}

function draw() {
  if (animationActive) {
    drawScene();
    drawAnimationLayer();
  }
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
window.toggleAnimation = toggleAnimation;
window.isAnimating = function() { return animationActive; };

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
  composition: {
    labels: ["centered", "scattered", "flowing", "layered", "grid", "radial", "collision", "feynman", "detector", "chalk", "symBreak", "bilateral", "rad4", "rad6", "rad8"],
    probabilities: [0.10, 0.10, 0.09, 0.08, 0.07, 0.07, 0.07, 0.06, 0.05, 0.04, 0.04, 0.06, 0.06, 0.05, 0.06]
  }
};

window.getRarityCurves = () => RARITY_CURVES;
