// Molecular Brush v2.4.0 - Fast p5.brush Render
// Nature-inspired palettes, drops, bleeds, and layered effects
// Art Blocks compatible with tokenData.hash

// ============================================================================
// HASH-BASED RANDOM
// ============================================================================

let hash = "0x" + Array(64).fill(0).map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

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
  const h = hashStr.slice(2);
  const seeds = [];
  for (let i = 0; i < 4; i++) {
    seeds.push(parseInt(h.slice(i * 8, (i + 1) * 8), 16));
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
  return arr[Math.floor(R() * arr.length)];
}

function rndBool(prob = 0.5) {
  return R() < prob;
}

function rollRarity(common = 0.5, uncommon = 0.3, rare = 0.15, legendary = 0.05) {
  const roll = R();
  if (roll < legendary) return "legendary";
  if (roll < legendary + rare) return "rare";
  if (roll < legendary + rare + uncommon) return "uncommon";
  return "common";
}

function rgbToHex(rgb) {
  return '#' + rgb.map(c => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function lerpColor(c1, c2, t) {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t
  ];
}

// ============================================================================
// PALETTES - Rich nature-inspired colors
// ============================================================================

const palettes = {
  // Spring & Floral
  sakura: {
    colors: [[255, 183, 197], [255, 209, 220], [255, 145, 175], [255, 240, 245], [230, 130, 160], [180, 100, 120]],
    accent: [255, 105, 140],
    paper: "warm",
    rarity: "rare"
  },
  springMeadow: {
    colors: [[144, 238, 144], [152, 251, 152], [124, 205, 124], [255, 250, 205], [255, 218, 185], [186, 255, 201]],
    accent: [50, 205, 50],
    paper: "bright",
    rarity: "uncommon"
  },
  wildflower: {
    colors: [[255, 182, 193], [221, 160, 221], [255, 218, 185], [176, 224, 230], [255, 250, 205], [216, 191, 216]],
    accent: [255, 105, 180],
    paper: "warm",
    rarity: "uncommon"
  },

  // Autumn & Warm
  autumnLeaves: {
    colors: [[205, 92, 52], [255, 140, 0], [178, 34, 34], [218, 165, 32], [184, 134, 11], [160, 82, 45]],
    accent: [255, 69, 0],
    paper: "aged",
    rarity: "common"
  },
  goldenHour: {
    colors: [[255, 200, 100], [255, 170, 80], [255, 140, 60], [255, 220, 150], [250, 180, 90], [230, 150, 70]],
    accent: [255, 215, 0],
    paper: "warm",
    rarity: "uncommon"
  },

  // Ocean & Water
  oceanDepth: {
    colors: [[0, 105, 148], [0, 139, 139], [32, 178, 170], [64, 224, 208], [72, 209, 204], [95, 158, 160]],
    accent: [0, 255, 255],
    paper: "cool",
    rarity: "common"
  },
  coralReef: {
    colors: [[255, 127, 80], [255, 160, 122], [255, 99, 71], [64, 224, 208], [255, 182, 193], [250, 128, 114]],
    accent: [255, 69, 0],
    paper: "bright",
    rarity: "rare"
  },

  // Forest & Earth
  deepForest: {
    colors: [[34, 85, 51], [46, 125, 50], [56, 142, 60], [76, 175, 80], [102, 187, 106], [129, 199, 132]],
    accent: [0, 100, 0],
    paper: "aged",
    rarity: "common"
  },
  mossAndStone: {
    colors: [[107, 142, 35], [128, 128, 0], [143, 151, 121], [169, 169, 169], [139, 137, 112], [85, 107, 47]],
    accent: [154, 205, 50],
    paper: "aged",
    rarity: "uncommon"
  },

  // Sky & Ethereal
  twilightSky: {
    colors: [[75, 0, 130], [138, 43, 226], [186, 85, 211], [218, 112, 214], [255, 182, 193], [255, 105, 180]],
    accent: [148, 0, 211],
    paper: "cool",
    rarity: "rare"
  },
  cloudySky: {
    colors: [[176, 196, 222], [176, 224, 230], [173, 216, 230], [135, 206, 235], [135, 206, 250], [240, 248, 255]],
    accent: [70, 130, 180],
    paper: "cool",
    rarity: "common"
  },

  // Special
  rainbowMist: {
    colors: [[255, 182, 193], [255, 218, 185], [255, 255, 224], [144, 238, 144], [173, 216, 230], [221, 160, 221]],
    accent: [255, 105, 180],
    paper: "bright",
    rarity: "legendary"
  },
  inkWash: {
    colors: [[40, 40, 50], [60, 60, 70], [80, 80, 90], [100, 100, 110], [120, 120, 130], [140, 140, 150]],
    accent: [20, 20, 30],
    paper: "bright",
    rarity: "rare"
  },
  vermillion: {
    colors: [[227, 66, 52], [255, 99, 71], [255, 127, 80], [205, 92, 92], [178, 34, 34], [220, 20, 60]],
    accent: [139, 0, 0],
    paper: "aged",
    rarity: "uncommon"
  },
  wisteria: {
    colors: [[200, 162, 200], [186, 85, 211], [218, 112, 214], [221, 160, 221], [238, 130, 238], [255, 182, 193]],
    accent: [148, 0, 211],
    paper: "warm",
    rarity: "rare"
  }
};

// ============================================================================
// PARAMETERS
// ============================================================================

let params = {
  moleculeCount: 30,
  simulationSteps: 80,
  trailLength: 50,
  physicsStrength: 1.2,
  noiseScale: 0.005,
  flowInfluence: 0.7,
  brushWeight: 3.0,
  bleedAmount: 0.25,
  dropFrequency: 0.15,
  splatterAmount: 0.2,
  layerCount: 1,
};

let originalParams = {};

// ============================================================================
// FEATURE GENERATION
// ============================================================================

let features = {};

function generateFeatures() {
  R = initRandom(hash);

  // Palette selection with rarity
  const paletteNames = Object.keys(palettes);
  const paletteRarity = rollRarity(0.40, 0.35, 0.20, 0.05);

  let availablePalettes = paletteNames.filter(name => {
    const p = palettes[name];
    if (paletteRarity === "legendary") return p.rarity === "legendary";
    if (paletteRarity === "rare") return p.rarity === "rare" || p.rarity === "legendary";
    if (paletteRarity === "uncommon") return p.rarity !== "legendary";
    return true;
  });

  if (availablePalettes.length === 0) availablePalettes = paletteNames;
  const paletteName = rndChoice(availablePalettes);
  const palette = palettes[paletteName];

  // Flow style - expanded options
  const flowRarity = rollRarity(0.40, 0.30, 0.20, 0.10);
  let flowStyle;
  if (flowRarity === "legendary") flowStyle = rndChoice(["vortex", "explosion", "blackhole", "tornado"]);
  else if (flowRarity === "rare") flowStyle = rndChoice(["spiral", "converge", "diverge", "ripple"]);
  else if (flowRarity === "uncommon") flowStyle = rndChoice(["wave", "radial", "curved", "diagonal", "sweep"]);
  else flowStyle = rndChoice(["gentle", "linear", "drift", "horizontal", "vertical"]);

  // Density - fast render counts
  const densityRarity = rollRarity(0.50, 0.30, 0.15, 0.05);
  let moleculeCount;
  if (densityRarity === "legendary") moleculeCount = rndInt(45, 60);
  else if (densityRarity === "rare") moleculeCount = rndInt(12, 20);
  else if (densityRarity === "uncommon") moleculeCount = rndInt(35, 45);
  else moleculeCount = rndInt(25, 35);

  // Brush style - only color-respecting brushes (no gray pencils)
  const brushRarity = rollRarity(0.40, 0.35, 0.18, 0.07);
  let brushStyle;
  if (brushRarity === "legendary") brushStyle = rndChoice(["spray", "marker"]);
  else if (brushRarity === "rare") brushStyle = rndChoice(["cpencil", "pen"]);
  else if (brushRarity === "uncommon") brushStyle = rndChoice(["marker", "cpencil"]);
  else brushStyle = rndChoice(["marker", "pen", "cpencil"]);

  // Bleed intensity
  const bleedRarity = rollRarity(0.40, 0.35, 0.18, 0.07);
  let bleedAmount, bleedName;
  if (bleedRarity === "legendary") { bleedAmount = rnd(0.4, 0.6); bleedName = "Flooded"; }
  else if (bleedRarity === "rare") { bleedAmount = rnd(0.25, 0.4); bleedName = "Wet"; }
  else if (bleedRarity === "uncommon") { bleedAmount = rnd(0.15, 0.25); bleedName = "Damp"; }
  else { bleedAmount = rnd(0.08, 0.15); bleedName = "Light"; }

  // Drops & splatters - expanded options
  const dropRarity = rollRarity(0.35, 0.30, 0.25, 0.10);
  let dropFrequency, dropName, dropSize;
  if (dropRarity === "legendary") {
    dropFrequency = rnd(0.5, 0.8);
    dropName = rndChoice(["Flooded", "Drenched", "Overflowing"]);
    dropSize = rnd(1.5, 2.5);
  } else if (dropRarity === "rare") {
    dropFrequency = rnd(0.3, 0.5);
    dropName = rndChoice(["Dripping", "Splattered", "Pooling"]);
    dropSize = rnd(1.2, 1.8);
  } else if (dropRarity === "uncommon") {
    dropFrequency = rnd(0.15, 0.3);
    dropName = rndChoice(["Scattered", "Spotted", "Dotted"]);
    dropSize = rnd(0.9, 1.3);
  } else {
    dropFrequency = rnd(0.05, 0.15);
    dropName = rndChoice(["Sparse", "Minimal", "Delicate"]);
    dropSize = rnd(0.6, 1.0);
  }

  // Stroke visibility - new trait
  const strokeRarity = rollRarity(0.30, 0.30, 0.25, 0.15);
  let strokeVisibility, strokeAlpha, strokeName;
  if (strokeRarity === "legendary") {
    strokeVisibility = 1.0;
    strokeAlpha = rnd(150, 220);
    strokeName = "Bold";
  } else if (strokeRarity === "rare") {
    strokeVisibility = rnd(0.5, 0.8);
    strokeAlpha = rnd(80, 140);
    strokeName = "Visible";
  } else if (strokeRarity === "uncommon") {
    strokeVisibility = rnd(0.2, 0.5);
    strokeAlpha = rnd(40, 90);
    strokeName = "Subtle";
  } else {
    strokeVisibility = rnd(0, 0.15);
    strokeAlpha = rnd(20, 50);
    strokeName = "Hidden";
  }

  // Trail length - fast render
  const trailRarity = rollRarity(0.45, 0.30, 0.18, 0.07);
  let trailLength, trailName;
  if (trailRarity === "legendary") { trailLength = rndInt(70, 100); trailName = "Flowing"; }
  else if (trailRarity === "rare") { trailLength = rndInt(50, 70); trailName = "Long"; }
  else if (trailRarity === "uncommon") { trailLength = rndInt(35, 50); trailName = "Medium"; }
  else { trailLength = rndInt(25, 35); trailName = "Short"; }

  // Layers - single layer for speed (visual depth from molecule overlap)
  const layerCount = 1;

  // Composition
  const composition = rndChoice(["full", "centered", "scattered", "flowing", "clustered"]);

  // Store params - optimized for speed
  params.moleculeCount = moleculeCount;
  params.trailLength = trailLength;
  params.bleedAmount = bleedAmount;
  params.dropFrequency = dropFrequency;
  params.dropSize = dropSize;
  params.strokeVisibility = strokeVisibility;
  params.strokeAlpha = strokeAlpha;
  params.noiseScale = rnd(0.003, 0.008);
  params.flowInfluence = rnd(0.5, 0.9);
  params.brushWeight = rnd(2.0, 4.5);
  params.simulationSteps = trailLength; // 1:1 ratio for speed
  params.layerCount = layerCount;
  params.splatterAmount = rnd(0.15, 0.35);

  originalParams = { ...params };

  features = {
    hash,
    palette: { name: paletteName, colors: palette.colors, accent: palette.accent, rarity: paletteRarity },
    flow: { style: flowStyle, rarity: flowRarity },
    density: { count: moleculeCount, rarity: densityRarity },
    brush: { style: brushStyle, rarity: brushRarity },
    strokes: { visibility: strokeVisibility, alpha: strokeAlpha, name: strokeName, rarity: strokeRarity },
    bleed: { amount: bleedAmount, name: bleedName, rarity: bleedRarity },
    drops: { frequency: dropFrequency, name: dropName, size: dropSize, rarity: dropRarity },
    trail: { length: trailLength, name: trailName, rarity: trailRarity },
    layers: layerCount,
    paper: { tone: palette.paper },
    composition,
  };

  return features;
}

// ============================================================================
// FLOW FIELD
// ============================================================================

function getFlowAngle(x, y, style, time = 0) {
  const nx = x * params.noiseScale;
  const ny = y * params.noiseScale;
  const cx = width / 2, cy = height / 2;

  switch (style) {
    // Common styles
    case "linear":
      return noise(nx, ny) * TWO_PI;
    case "gentle":
      return noise(nx * 0.5, ny * 0.5) * TWO_PI;
    case "drift":
      return noise(nx, ny) * PI + PI * 0.25;
    case "horizontal":
      return noise(nx * 0.3, ny * 0.3) * 0.4 - 0.2; // mostly horizontal
    case "vertical":
      return HALF_PI + noise(nx * 0.3, ny * 0.3) * 0.4 - 0.2; // mostly vertical

    // Uncommon styles
    case "curved":
      return noise(nx, ny) * TWO_PI + sin(ny * 0.008) * 0.8;
    case "wave":
      return sin(nx * 40 + time * 0.01) * 0.6 + noise(nx, ny) * TWO_PI * 0.6;
    case "radial":
      return atan2(y - cy, x - cx) + noise(nx, ny) * 0.6;
    case "diagonal":
      return PI * 0.25 + noise(nx, ny) * 0.5; // diagonal with noise
    case "sweep":
      return noise(nx * 0.3, ny * 0.1) * PI; // sweeping horizontal curves

    // Rare styles
    case "converge":
      return atan2(cy - y, cx - x) + noise(nx, ny) * 0.4;
    case "diverge":
      return atan2(y - cy, x - cx) + noise(nx, ny) * 0.3; // outward from center
    case "spiral": {
      const dist = sqrt((x - cx) ** 2 + (y - cy) ** 2);
      return atan2(y - cy, x - cx) + dist * 0.008 + noise(nx, ny) * 0.4;
    }
    case "ripple": {
      const dist = sqrt((x - cx) ** 2 + (y - cy) ** 2);
      return atan2(y - cy, x - cx) + sin(dist * 0.03) * PI + noise(nx, ny) * 0.3;
    }

    // Legendary styles
    case "vortex": {
      const dist = sqrt((x - cx) ** 2 + (y - cy) ** 2);
      return atan2(y - cy, x - cx) + dist * 0.015 + noise(nx * 2, ny * 2) * 0.3;
    }
    case "explosion": {
      const angle = atan2(y - cy, x - cx);
      return angle + noise(nx * 1.5, ny * 1.5) * 0.8;
    }
    case "blackhole": {
      const dist = sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const angle = atan2(cy - y, cx - x);
      return angle + dist * 0.02 + noise(nx * 2, ny * 2) * 0.2; // inward spiral
    }
    case "tornado": {
      const dist = sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const strength = map(dist, 0, width * 0.5, 0.03, 0.005);
      return atan2(y - cy, x - cx) + dist * strength + noise(nx * 3, ny * 3) * 0.5;
    }

    default:
      return noise(nx, ny) * TWO_PI;
  }
}

// ============================================================================
// MOLECULE CLASS
// ============================================================================

class FlowMolecule {
  constructor(x, y, col, size = 1) {
    this.pos = createVector(x, y);
    this.vel = createVector(rnd(-0.5, 0.5), rnd(-0.5, 0.5));
    this.path = [this.pos.copy()];
    this.color = col;
    this.size = size;
    this.weight = rnd(0.6, 1.4) * params.brushWeight * size;
    this.alpha = rnd(0.5, 1.0);
    this.dropPoints = [];
  }

  update(molecules, step) {
    // Flow field
    const flowAngle = getFlowAngle(this.pos.x, this.pos.y, features.flow.style, step);
    const flowForce = p5.Vector.fromAngle(flowAngle).mult(params.flowInfluence);

    // Simplified molecular repulsion (check fewer neighbors)
    let repulsion = createVector(0, 0);
    const checkCount = Math.min(molecules.length, 15);
    for (let i = 0; i < checkCount; i++) {
      const other = molecules[i];
      if (other === this) continue;
      const d = p5.Vector.dist(this.pos, other.pos);
      if (d < 35 && d > 0) {
        const diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize().mult(0.5 / d);
        repulsion.add(diff);
      }
    }

    this.vel.add(flowForce);
    this.vel.add(repulsion.mult(params.physicsStrength));
    this.vel.limit(5);
    this.vel.mult(0.92);

    this.pos.add(this.vel);
    this.path.push(this.pos.copy());

    if (this.path.length > params.trailLength) {
      this.path.shift();
    }
  }

  isInBounds() {
    const m = 60;
    return this.pos.x > -m && this.pos.x < width + m &&
           this.pos.y > -m && this.pos.y < height + m;
  }
}

// ============================================================================
// SKETCH
// ============================================================================

let molecules = [];
let isRendering = false;
let renderProgress = 0;

function setup() {
  const holder = document.getElementById('sketch-holder');
  const size = 700;

  let cnv = createCanvas(size, size, WEBGL);
  pixelDensity(2);

  if (holder) {
    cnv.parent('sketch-holder');
  }

  generateFeatures();

  brush.seed(parseInt(hash.slice(2, 10), 16));
  brush.load();

  if (window.onFeaturesGenerated) {
    window.onFeaturesGenerated(features);
  }

  noLoop();
  renderArtwork();
}

function getPaperBackground() {
  const tone = features.paper.tone;
  if (tone === "warm") return { r: 252, g: 247, b: 238 };
  if (tone === "cool") return { r: 242, g: 248, b: 252 };
  if (tone === "aged") return { r: 248, g: 240, b: 227 };
  return { r: 255, g: 252, b: 248 };
}

function getStartPositions(count) {
  const positions = [];
  const comp = features.composition;
  const margin = 60;

  for (let i = 0; i < count; i++) {
    let x, y;

    if (comp === "centered") {
      // Larger spread from center
      const angle = rnd(TWO_PI);
      const radius = rnd(50, 300);
      x = width / 2 + cos(angle) * radius;
      y = height / 2 + sin(angle) * radius;
    } else if (comp === "clustered") {
      // More clusters with larger spread
      const clusterX = rndChoice([width * 0.2, width * 0.4, width * 0.6, width * 0.8]);
      const clusterY = rndChoice([height * 0.2, height * 0.4, height * 0.6, height * 0.8]);
      x = clusterX + rnd(-120, 120);
      y = clusterY + rnd(-120, 120);
    } else if (comp === "flowing") {
      // Start from multiple edges, not just left
      const edge = rndChoice(["left", "top", "right", "bottom"]);
      if (edge === "left") {
        x = rnd(-20, width * 0.15);
        y = rnd(margin, height - margin);
      } else if (edge === "right") {
        x = rnd(width * 0.85, width + 20);
        y = rnd(margin, height - margin);
      } else if (edge === "top") {
        x = rnd(margin, width - margin);
        y = rnd(-20, height * 0.15);
      } else {
        x = rnd(margin, width - margin);
        y = rnd(height * 0.85, height + 20);
      }
    } else if (comp === "scattered") {
      x = rnd(width);
      y = rnd(height);
    } else { // full
      x = rnd(margin, width - margin);
      y = rnd(margin, height - margin);
    }

    positions.push({ x, y });
  }

  return positions;
}

function renderArtwork() {
  isRendering = true;
  if (window.onRenderStart) window.onRenderStart();

  R = initRandom(hash);
  for (let i = 0; i < 200; i++) R();

  // Background
  const bg = getPaperBackground();
  background(bg.r, bg.g, bg.b);

  // Light paper texture
  brush.noStroke();
  brush.fill(rgbToHex([bg.r - 6, bg.g - 4, bg.b - 2]), 20);
  brush.fillTexture(0.4, 0.2);
  brush.rect(-width/2, -height/2, width, height);

  // Create molecules
  const molecules = [];
  const startPositions = getStartPositions(params.moleculeCount);

  for (let i = 0; i < params.moleculeCount; i++) {
    const col = rndChoice(features.palette.colors);
    molecules.push(new FlowMolecule(startPositions[i].x, startPositions[i].y, col, 1));
  }

  // Fast simulation
  for (let step = 0; step < params.simulationSteps; step++) {
    for (let mol of molecules) {
      if (mol.isInBounds()) mol.update(molecules, step);
    }
  }

  // Render molecules
  renderFast(molecules);

  // Minimal splatters
  renderSplattersSync();

  brush.reDraw();

  isRendering = false;
  if (window.onRenderComplete) window.onRenderComplete();
}

function renderFast(molecules) {
  const brushStyle = features.brush.style;
  const strokeVis = params.strokeVisibility;
  const strokeAlpha = params.strokeAlpha;
  const dropSizeMult = params.dropSize;

  for (let mol of molecules) {
    if (mol.path.length < 4) continue;

    const col = rgbToHex(mol.color);
    const weight = mol.weight;

    // Draw stroke lines based on visibility trait
    if (rnd() < strokeVis) {
      // brush.set(name, color, weight) - all three params required for color to work
      brush.set(brushStyle, col, weight);

      // Draw every 3rd point for maximum speed
      const step = 3;
      for (let j = step; j < mol.path.length; j += step) {
        const p1 = mol.path[j - step];
        const p2 = mol.path[j];
        brush.line(p1.x - width/2, p1.y - height/2, p2.x - width/2, p2.y - height/2);
      }
    }

    // Bleed blobs along path (more frequent now)
    if (mol.path.length > 6 && rnd() < params.dropFrequency * 1.5) {
      const idx = floor(mol.path.length * rnd(0.2, 0.8));
      const pos = mol.path[idx];
      brush.noStroke();
      brush.bleed(params.bleedAmount);
      brush.fill(col, floor(mol.alpha * 100));
      brush.circle(pos.x - width/2, pos.y - height/2, weight * rnd(2, 5) * dropSizeMult);
    }

    // End blob - always draw this
    const endPos = mol.path[mol.path.length - 1];
    brush.noStroke();
    brush.bleed(params.bleedAmount * 0.8);
    brush.fill(col, floor(mol.alpha * 120));
    brush.circle(endPos.x - width/2, endPos.y - height/2, weight * rnd(2.5, 5) * dropSizeMult);

    // Start blob too (50% chance)
    if (rnd() < 0.5) {
      const startPos = mol.path[0];
      brush.fill(col, floor(mol.alpha * 80));
      brush.circle(startPos.x - width/2, startPos.y - height/2, weight * rnd(1.5, 3.5) * dropSizeMult);
    }
  }

  // Add some accent drops (separate pass for variety)
  const accentCount = floor(molecules.length * params.dropFrequency * 2);
  brush.bleed(params.bleedAmount * 1.2);
  for (let i = 0; i < accentCount; i++) {
    const mol = molecules[floor(rnd() * molecules.length)];
    if (mol.path.length < 5) continue;
    const idx = floor(rnd() * mol.path.length);
    const pos = mol.path[idx];
    brush.fill(rgbToHex(features.palette.accent), rnd(60, 140));
    brush.circle(pos.x - width/2 + rnd(-15, 15), pos.y - height/2 + rnd(-15, 15), rnd(2, 8) * dropSizeMult);
  }
}

function renderSplattersSync() {
  const splatterCount = floor(params.splatterAmount * 20);

  brush.noStroke();
  brush.bleed(0.2);
  for (let i = 0; i < splatterCount; i++) {
    const x = rnd(width) - width/2;
    const y = rnd(height) - height/2;
    const col = rndBool(0.6) ? rndChoice(features.palette.colors) : features.palette.accent;
    brush.fill(rgbToHex(col), rnd(40, 80));
    brush.circle(x, y, rnd(2, 7));
  }
}

// ============================================================================
// CONTROLS
// ============================================================================

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('molecular-brush-' + hash.slice(2, 10), 'png');
  }
  if (key === 'r' || key === 'R') {
    regenerate();
  }
}

function setHash(newHash) {
  hash = newHash;
  generateFeatures();
  brush.seed(parseInt(hash.slice(2, 10), 16));
  if (window.onFeaturesGenerated) {
    window.onFeaturesGenerated(features);
  }
  renderArtwork();
}

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  setHash(hash);
}

function setParameter(name, value) {
  if (params.hasOwnProperty(name)) {
    params[name] = value;
    if (window.onParamsChanged) window.onParamsChanged(params);
  }
}

function resetParams() {
  params = { ...originalParams };
  if (window.onParamsChanged) window.onParamsChanged(params);
}

function rerender() {
  if (!isRendering) {
    renderArtwork();
  }
}

// Expose API
window.setHash = setHash;
window.regenerate = regenerate;
window.getFeatures = () => features;
window.getParams = () => params;
window.setParameter = setParameter;
window.resetParams = resetParams;
window.rerender = rerender;
window.isRendering = () => isRendering;
window.getRenderProgress = () => renderProgress;
