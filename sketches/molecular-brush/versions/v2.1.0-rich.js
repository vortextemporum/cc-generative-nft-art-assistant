// Molecular Brush v2.0.0 - Static p5.brush Render
// Fidenza-inspired flow fields with molecular physics
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

function rollRarity(common = 0.6, uncommon = 0.25, rare = 0.12, legendary = 0.03) {
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

// ============================================================================
// PARAMETERS (can be modified via sliders)
// ============================================================================

let params = {
  moleculeCount: 60,
  simulationSteps: 400,
  trailLength: 80,
  physicsStrength: 1.0,
  noiseScale: 0.003,
  flowInfluence: 0.5,
  brushWeight: 2.0,
  bleedAmount: 0.15,
  hatchDensity: 30,
  hatchEnabled: true,
};

// Original params from hash (for reset)
let originalParams = {};

// ============================================================================
// FEATURE GENERATION
// ============================================================================

let features = {};

const palettes = {
  watercolor: [[45, 85, 150], [180, 60, 50], [65, 130, 110], [200, 140, 60], [130, 50, 80]],
  ocean: [[20, 60, 100], [40, 120, 140], [80, 160, 180], [150, 200, 210], [30, 80, 90]],
  autumn: [[180, 70, 40], [200, 120, 50], [150, 50, 50], [100, 80, 50], [220, 160, 80]],
  forest: [[40, 80, 50], [70, 120, 60], [90, 140, 80], [50, 90, 70], [110, 100, 60]],
  sunset: [[220, 100, 80], [240, 150, 100], [180, 80, 100], [140, 60, 90], [250, 180, 120]],
  monochrome: [[40, 40, 50], [70, 70, 80], [100, 100, 110], [130, 130, 140], [60, 55, 65]],
  neon: [[255, 50, 100], [50, 255, 150], [100, 50, 255], [255, 200, 50], [50, 200, 255]],
  earth: [[139, 90, 43], [160, 120, 60], [90, 70, 50], [180, 140, 80], [70, 55, 40]],
};

function generateFeatures() {
  R = initRandom(hash);

  // Palette
  const paletteRarity = rollRarity(0.55, 0.28, 0.14, 0.03);
  let paletteName;
  if (paletteRarity === "legendary") paletteName = "neon";
  else if (paletteRarity === "rare") paletteName = "monochrome";
  else if (paletteRarity === "uncommon") paletteName = rndChoice(["ocean", "autumn", "forest", "sunset"]);
  else paletteName = rndChoice(["watercolor", "ocean", "autumn", "forest", "sunset", "earth"]);

  // Flow style (Fidenza-inspired)
  const flowRarity = rollRarity(0.50, 0.30, 0.15, 0.05);
  let flowStyle;
  if (flowRarity === "legendary") flowStyle = rndChoice(["turbulent", "spiral"]);
  else if (flowRarity === "rare") flowStyle = rndChoice(["radial", "converge"]);
  else if (flowRarity === "uncommon") flowStyle = rndChoice(["curved", "wave"]);
  else flowStyle = rndChoice(["linear", "gentle"]);

  // Density
  const densityRarity = rollRarity(0.60, 0.25, 0.10, 0.05);
  let moleculeCount;
  if (densityRarity === "legendary") moleculeCount = rndInt(15, 30);
  else if (densityRarity === "rare") moleculeCount = rndInt(120, 180);
  else if (densityRarity === "uncommon") moleculeCount = rndInt(80, 120);
  else moleculeCount = rndInt(40, 80);

  // Brush style
  const brushRarity = rollRarity(0.50, 0.30, 0.15, 0.05);
  let brushStyle;
  if (brushRarity === "legendary") brushStyle = "charcoal";
  else if (brushRarity === "rare") brushStyle = "marker";
  else if (brushRarity === "uncommon") brushStyle = rndChoice(["cpencil", "pen"]);
  else brushStyle = rndChoice(["2B", "HB", "2H"]);

  // Bleed intensity
  const bleedRarity = rollRarity(0.50, 0.30, 0.15, 0.05);
  let bleedAmount, bleedName;
  if (bleedRarity === "legendary") { bleedAmount = rnd(0.35, 0.5); bleedName = "Flooded"; }
  else if (bleedRarity === "rare") { bleedAmount = rnd(0.02, 0.08); bleedName = "Dry"; }
  else if (bleedRarity === "uncommon") { bleedAmount = rnd(0.2, 0.3); bleedName = "Wet"; }
  else { bleedAmount = rnd(0.1, 0.18); bleedName = "Normal"; }

  // Hatching
  const hatchRarity = rollRarity(0.55, 0.30, 0.12, 0.03);
  let hatchEnabled, hatchDensity, hatchName;
  if (hatchRarity === "legendary") { hatchEnabled = true; hatchDensity = rnd(10, 18); hatchName = "Dense Cross"; }
  else if (hatchRarity === "rare") { hatchEnabled = false; hatchDensity = 0; hatchName = "None"; }
  else if (hatchRarity === "uncommon") { hatchEnabled = true; hatchDensity = rnd(25, 40); hatchName = "Medium"; }
  else { hatchEnabled = rndBool(0.5); hatchDensity = hatchEnabled ? rnd(45, 70) : 0; hatchName = hatchEnabled ? "Light" : "None"; }

  // Trail/stroke length
  const trailRarity = rollRarity(0.55, 0.30, 0.12, 0.03);
  let trailLength, trailName;
  if (trailRarity === "legendary") { trailLength = rndInt(200, 400); trailName = "Flowing"; }
  else if (trailRarity === "rare") { trailLength = rndInt(20, 40); trailName = "Short"; }
  else if (trailRarity === "uncommon") { trailLength = rndInt(120, 180); trailName = "Long"; }
  else { trailLength = rndInt(60, 100); trailName = "Medium"; }

  // Paper
  const paperTone = rndChoice(["warm", "cool", "aged", "bright"]);

  // Composition
  const composition = rndChoice(["full", "centered", "margins", "scattered"]);

  // Store params
  params.moleculeCount = moleculeCount;
  params.trailLength = trailLength;
  params.bleedAmount = bleedAmount;
  params.hatchEnabled = hatchEnabled;
  params.hatchDensity = hatchDensity;
  params.noiseScale = rnd(0.002, 0.006);
  params.flowInfluence = rnd(0.3, 0.7);
  params.brushWeight = rnd(1.5, 3.5);
  params.simulationSteps = trailLength * 5;

  // Save original
  originalParams = { ...params };

  features = {
    hash,
    palette: { name: paletteName, colors: palettes[paletteName], rarity: paletteRarity },
    flow: { style: flowStyle, rarity: flowRarity },
    density: { count: moleculeCount, rarity: densityRarity },
    brush: { style: brushStyle, rarity: brushRarity },
    bleed: { amount: bleedAmount, name: bleedName, rarity: bleedRarity },
    hatch: { enabled: hatchEnabled, density: hatchDensity, name: hatchName, rarity: hatchRarity },
    trail: { length: trailLength, name: trailName, rarity: trailRarity },
    paper: { tone: paperTone },
    composition,
  };

  return features;
}

// ============================================================================
// FLOW FIELD
// ============================================================================

function getFlowAngle(x, y, style) {
  const nx = x * params.noiseScale;
  const ny = y * params.noiseScale;

  switch (style) {
    case "linear":
      return noise(nx, ny) * TWO_PI;
    case "gentle":
      return noise(nx * 0.5, ny * 0.5) * TWO_PI;
    case "curved":
      return noise(nx, ny) * TWO_PI + sin(ny * 0.01) * 0.5;
    case "wave":
      return sin(nx * 50) * 0.5 + noise(nx, ny) * TWO_PI * 0.5;
    case "radial": {
      const cx = width / 2, cy = height / 2;
      return atan2(y - cy, x - cx) + noise(nx, ny) * 0.5;
    }
    case "converge": {
      const cx = width / 2, cy = height / 2;
      return atan2(cy - y, cx - x) + noise(nx, ny) * 0.3;
    }
    case "spiral": {
      const cx = width / 2, cy = height / 2;
      const dist = sqrt((x - cx) ** 2 + (y - cy) ** 2);
      return atan2(y - cy, x - cx) + dist * 0.01 + noise(nx, ny) * 0.3;
    }
    case "turbulent":
      return noise(nx * 2, ny * 2) * TWO_PI * 2;
    default:
      return noise(nx, ny) * TWO_PI;
  }
}

// ============================================================================
// MOLECULE SIMULATION
// ============================================================================

class FlowMolecule {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.path = [this.pos.copy()];
    this.color = col;
    this.weight = rnd(0.8, 1.2) * params.brushWeight;
    this.alpha = rnd(0.6, 1.0);
  }

  update(molecules) {
    // Flow field influence
    const flowAngle = getFlowAngle(this.pos.x, this.pos.y, features.flow.style);
    const flowForce = p5.Vector.fromAngle(flowAngle).mult(params.flowInfluence);

    // Molecular repulsion (simplified)
    let repulsion = createVector(0, 0);
    for (let other of molecules) {
      if (other === this) continue;
      const d = p5.Vector.dist(this.pos, other.pos);
      if (d < 30 && d > 0) {
        const diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize().mult(0.3 / d);
        repulsion.add(diff);
      }
    }

    // Combine forces
    this.vel.add(flowForce);
    this.vel.add(repulsion.mult(params.physicsStrength));
    this.vel.limit(3);
    this.vel.mult(0.95);

    this.pos.add(this.vel);

    // Store path
    this.path.push(this.pos.copy());
    if (this.path.length > params.trailLength) {
      this.path.shift();
    }
  }

  isInBounds() {
    const m = 50;
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

  // Initialize p5.brush
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
  if (tone === "warm") return { r: 252, g: 248, b: 240 };
  if (tone === "cool") return { r: 245, g: 248, b: 252 };
  if (tone === "aged") return { r: 245, g: 235, b: 220 };
  return { r: 255, g: 253, b: 250 };
}

function getStartPositions(count) {
  const positions = [];
  const comp = features.composition;
  const margin = 80;

  for (let i = 0; i < count; i++) {
    let x, y;

    if (comp === "centered") {
      const angle = rnd(TWO_PI);
      const radius = rnd(50, 250);
      x = width / 2 + cos(angle) * radius;
      y = height / 2 + sin(angle) * radius;
    } else if (comp === "margins") {
      // Start from edges
      const side = rndInt(0, 3);
      if (side === 0) { x = rnd(margin); y = rnd(height); }
      else if (side === 1) { x = rnd(width - margin, width); y = rnd(height); }
      else if (side === 2) { x = rnd(width); y = rnd(margin); }
      else { x = rnd(width); y = rnd(height - margin, height); }
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

async function renderArtwork() {
  isRendering = true;
  renderProgress = 0;

  if (window.onRenderStart) window.onRenderStart();

  // Reset random
  R = initRandom(hash);
  for (let i = 0; i < 200; i++) R();

  // Background
  const bg = getPaperBackground();
  background(bg.r, bg.g, bg.b);

  // Paper texture
  brush.noStroke();
  brush.fill(rgbToHex([bg.r - 5, bg.g - 5, bg.b - 5]), 30);
  brush.fillTexture(0.5, 0.2);
  brush.rect(-width/2, -height/2, width, height);

  // Initialize molecules
  molecules = [];
  const startPositions = getStartPositions(params.moleculeCount);
  for (let i = 0; i < params.moleculeCount; i++) {
    molecules.push(new FlowMolecule(
      startPositions[i].x,
      startPositions[i].y,
      rndChoice(features.palette.colors)
    ));
  }

  // Run simulation
  for (let step = 0; step < params.simulationSteps; step++) {
    for (let mol of molecules) {
      if (mol.isInBounds()) {
        mol.update(molecules);
      }
    }
    renderProgress = step / params.simulationSteps * 0.5;

    // Yield occasionally for UI responsiveness
    if (step % 50 === 0) {
      await new Promise(r => setTimeout(r, 0));
      if (window.onRenderProgress) window.onRenderProgress(renderProgress);
    }
  }

  // Render paths with p5.brush
  const brushStyle = features.brush.style;

  for (let i = 0; i < molecules.length; i++) {
    const mol = molecules[i];
    if (mol.path.length < 3) continue;

    const col = rgbToHex(mol.color);
    const alpha = map(mol.alpha, 0.6, 1.0, 100, 200);

    // Main stroke
    brush.set(brushStyle);
    brush.stroke(col, alpha);
    brush.strokeWeight(mol.weight);

    // Draw path as connected lines
    for (let j = 1; j < mol.path.length; j++) {
      const p1 = mol.path[j - 1];
      const p2 = mol.path[j];
      brush.line(p1.x - width/2, p1.y - height/2, p2.x - width/2, p2.y - height/2);
    }

    // Watercolor blob at end
    if (mol.path.length > 10) {
      const endPos = mol.path[mol.path.length - 1];
      brush.noStroke();
      brush.bleed(params.bleedAmount);
      brush.fill(col, alpha * 0.5);
      brush.circle(endPos.x - width/2, endPos.y - height/2, mol.weight * 4);
    }

    // Hatching along path (sparse)
    if (params.hatchEnabled && i % 3 === 0 && mol.path.length > 20) {
      const midIdx = floor(mol.path.length / 2);
      const midPos = mol.path[midIdx];

      brush.noFill();
      brush.set("HB");
      const darkCol = rgbToHex([mol.color[0] - 40, mol.color[1] - 40, mol.color[2] - 40]);
      brush.stroke(darkCol, 60);
      brush.strokeWeight(0.5);
      brush.hatch(params.hatchDensity, rnd(TWO_PI));
      brush.circle(midPos.x - width/2, midPos.y - height/2, mol.weight * 8);
      brush.noHatch();
    }

    renderProgress = 0.5 + (i / molecules.length) * 0.5;

    if (i % 10 === 0) {
      await new Promise(r => setTimeout(r, 0));
      if (window.onRenderProgress) window.onRenderProgress(renderProgress);
    }
  }

  // Final texture pass
  brush.reDraw();

  isRendering = false;
  renderProgress = 1;
  if (window.onRenderComplete) window.onRenderComplete();
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
