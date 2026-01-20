// Molecular Brush - Watercolor with p5.brush accents
// Uses fast custom rendering + p5.brush for static texture elements

// ============================================================================
// HASH-BASED RANDOM (Art Blocks style)
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
  if (max === undefined) { max = min; min = 0; }
  return min + R() * (max - min);
}

function rndInt(min, max) {
  return Math.floor(rnd(min, max + 1));
}

function rndChoice(arr) {
  return arr[Math.floor(R() * arr.length)];
}

function rndBool(probability = 0.5) {
  return R() < probability;
}

function rollRarity(common = 0.6, uncommon = 0.25, rare = 0.12, legendary = 0.03) {
  const roll = R();
  if (roll < legendary) return "legendary";
  if (roll < legendary + rare) return "rare";
  if (roll < legendary + rare + uncommon) return "uncommon";
  return "common";
}

// ============================================================================
// FEATURE GENERATION
// ============================================================================

let features = {};

function generateFeatures() {
  R = initRandom(hash);

  // === PALETTE ===
  const paletteRarity = rollRarity(0.55, 0.28, 0.14, 0.03);
  const palettes = {
    watercolor: [
      [45, 85, 150],
      [180, 60, 50],
      [65, 130, 110],
      [200, 140, 60],
      [130, 50, 80],
    ],
    ocean: [
      [20, 60, 100],
      [40, 120, 140],
      [80, 160, 180],
      [150, 200, 210],
      [30, 80, 90],
    ],
    autumn: [
      [180, 70, 40],
      [200, 120, 50],
      [150, 50, 50],
      [100, 80, 50],
      [220, 160, 80],
    ],
    forest: [
      [40, 80, 50],
      [70, 120, 60],
      [90, 140, 80],
      [50, 90, 70],
      [110, 100, 60],
    ],
    sunset: [
      [220, 100, 80],
      [240, 150, 100],
      [180, 80, 100],
      [140, 60, 90],
      [250, 180, 120],
    ],
    monochrome: [
      [40, 40, 50],
      [70, 70, 80],
      [100, 100, 110],
      [130, 130, 140],
      [60, 55, 65],
    ],
    neon: [
      [255, 50, 100],
      [50, 255, 150],
      [100, 50, 255],
      [255, 200, 50],
      [50, 200, 255],
    ],
  };

  let paletteName;
  if (paletteRarity === "legendary") {
    paletteName = "neon";
  } else if (paletteRarity === "rare") {
    paletteName = "monochrome";
  } else if (paletteRarity === "uncommon") {
    paletteName = rndChoice(["ocean", "autumn", "forest", "sunset"]);
  } else {
    paletteName = rndChoice(["watercolor", "ocean", "autumn", "forest", "sunset"]);
  }

  // === MOLECULE COUNT ===
  const densityRarity = rollRarity(0.60, 0.25, 0.10, 0.05);
  let moleculeCount, densityName;
  if (densityRarity === "legendary") {
    moleculeCount = rndInt(8, 15);
    densityName = "Sparse";
  } else if (densityRarity === "rare") {
    moleculeCount = rndInt(150, 250);
    densityName = "Swarm";
  } else if (densityRarity === "uncommon") {
    moleculeCount = rndInt(100, 150);
    densityName = "Dense";
  } else {
    moleculeCount = rndInt(40, 100);
    densityName = "Normal";
  }

  // === PHYSICS MODE ===
  const physicsRarity = rollRarity(0.50, 0.30, 0.15, 0.05);
  let physicsMode;
  if (physicsRarity === "legendary") {
    physicsMode = rndChoice(["vortex", "explosion"]);
  } else if (physicsRarity === "rare") {
    physicsMode = rndChoice(["orbital", "magnetic"]);
  } else if (physicsRarity === "uncommon") {
    physicsMode = rndChoice(["flocking", "waves"]);
  } else {
    physicsMode = rndChoice(["molecular", "brownian"]);
  }

  // === TRAIL LENGTH ===
  const trailRarity = rollRarity(0.55, 0.30, 0.12, 0.03);
  let trailLength, trailName;
  if (trailRarity === "legendary") {
    trailLength = rndInt(200, 300);
    trailName = "Infinite";
  } else if (trailRarity === "rare") {
    trailLength = rndInt(5, 15);
    trailName = "Dots";
  } else if (trailRarity === "uncommon") {
    trailLength = rndInt(100, 150);
    trailName = "Long";
  } else {
    trailLength = rndInt(30, 80);
    trailName = "Medium";
  }

  // === WETNESS (watercolor intensity) ===
  const wetnessRarity = rollRarity(0.50, 0.30, 0.15, 0.05);
  let wetness, wetnessName;
  if (wetnessRarity === "legendary") {
    wetness = rnd(1.5, 2.0);
    wetnessName = "Flooded";
  } else if (wetnessRarity === "rare") {
    wetness = rnd(0.2, 0.4);
    wetnessName = "Dry";
  } else if (wetnessRarity === "uncommon") {
    wetness = rnd(1.0, 1.3);
    wetnessName = "Wet";
  } else {
    wetness = rnd(0.5, 0.9);
    wetnessName = "Normal";
  }

  // === BRUSH TEXTURE (p5.brush-inspired) ===
  const brushRarity = rollRarity(0.50, 0.30, 0.15, 0.05);
  let brushStyle, brushName;
  if (brushRarity === "legendary") {
    brushStyle = "heavy";
    brushName = "Heavy";
  } else if (brushRarity === "rare") {
    brushStyle = "clean";
    brushName = "Clean";
  } else if (brushRarity === "uncommon") {
    brushStyle = "textured";
    brushName = "Textured";
  } else {
    brushStyle = "normal";
    brushName = "Normal";
  }

  // === PAPER TONE ===
  const paperTone = rndChoice(["warm", "cool", "aged", "bright"]);

  // === SPECIAL EFFECTS ===
  const hasSpecialEffect = rndBool(0.08);
  const specialEffect = hasSpecialEffect ? rndChoice(["chromatic", "glow", "scatter"]) : "none";

  // === COMPOSITION ===
  const composition = rndChoice(["centered", "scattered", "diagonal", "circular"]);

  // === SIZE VARIANCE ===
  const sizeVariance = rnd(0.3, 1.5);

  features = {
    hash: hash,
    palette: { name: paletteName, colors: palettes[paletteName], rarity: paletteRarity },
    density: { count: moleculeCount, name: densityName, rarity: densityRarity },
    physics: { mode: physicsMode, rarity: physicsRarity },
    trail: { length: trailLength, name: trailName, rarity: trailRarity },
    wetness: { value: wetness, name: wetnessName, rarity: wetnessRarity },
    brushStyle: { style: brushStyle, name: brushName, rarity: brushRarity },
    paper: { tone: paperTone },
    special: { effect: specialEffect, active: hasSpecialEffect },
    composition: composition,
    sizeVariance: sizeVariance,
  };

  if (typeof tokenData !== "undefined") {
    tokenData.features = {
      "Palette": paletteName.charAt(0).toUpperCase() + paletteName.slice(1),
      "Density": densityName,
      "Physics": physicsMode.charAt(0).toUpperCase() + physicsMode.slice(1),
      "Trail": trailName,
      "Wetness": wetnessName,
      "Brush": brushName,
      "Paper": paperTone.charAt(0).toUpperCase() + paperTone.slice(1),
      "Special": specialEffect === "none" ? "None" : specialEffect.charAt(0).toUpperCase() + specialEffect.slice(1),
      "Composition": composition.charAt(0).toUpperCase() + composition.slice(1),
    };
  }

  return features;
}

// ============================================================================
// SKETCH
// ============================================================================

let molecules = [];
let drops = [];
let paperTexture;
let brushTexture;

function setup() {
  const holder = document.getElementById('sketch-holder');
  const size = holder ? holder.offsetWidth : 700;

  let cnv = createCanvas(size, size);
  pixelDensity(min(2, window.devicePixelRatio || 1));

  if (holder) {
    cnv.parent('sketch-holder');
  }

  generateFeatures();

  if (window.onFeaturesGenerated) {
    window.onFeaturesGenerated(features);
  }

  initializeSketch();
}

function initializeSketch() {
  R = initRandom(hash);
  for (let i = 0; i < 100; i++) R();

  molecules = [];
  drops = [];

  // Create paper texture
  paperTexture = createGraphics(width, height);
  generatePaperTexture();

  // Create brush texture overlay
  brushTexture = createGraphics(width, height);
  generateBrushTexture();

  // Initialize molecules
  const startPositions = getStartPositions(features.density.count);

  for (let i = 0; i < features.density.count; i++) {
    molecules.push(new Molecule(
      startPositions[i].x,
      startPositions[i].y,
      rndChoice(features.palette.colors)
    ));
  }

  // Draw background
  const bg = getPaperBackground();
  background(bg.r, bg.g, bg.b);
  image(paperTexture, 0, 0);
}

function getStartPositions(count) {
  const positions = [];
  const comp = features.composition;

  for (let i = 0; i < count; i++) {
    let x, y;

    if (comp === "centered") {
      const angle = rnd(TWO_PI);
      const radius = rnd(50, 200);
      x = width/2 + cos(angle) * radius;
      y = height/2 + sin(angle) * radius;
    } else if (comp === "circular") {
      const angle = (i / count) * TWO_PI + rnd(-0.2, 0.2);
      const radius = rnd(150, 350);
      x = width/2 + cos(angle) * radius;
      y = height/2 + sin(angle) * radius;
    } else if (comp === "diagonal") {
      const t = rnd();
      x = t * width + rnd(-100, 100);
      y = t * height + rnd(-100, 100);
    } else {
      x = rnd(width);
      y = rnd(height);
    }

    positions.push({ x, y });
  }

  return positions;
}

function getPaperBackground() {
  const tone = features.paper.tone;
  if (tone === "warm") return { r: 252, g: 248, b: 240 };
  if (tone === "cool") return { r: 245, g: 248, b: 252 };
  if (tone === "aged") return { r: 245, g: 235, b: 220 };
  return { r: 255, g: 253, b: 250 };
}

function generatePaperTexture() {
  const tone = features.paper.tone;
  let tint = { r: 0, g: -4, b: -8 };
  if (tone === "cool") tint = { r: -5, g: 0, b: 5 };
  if (tone === "aged") tint = { r: 5, g: -5, b: -15 };

  paperTexture.loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let n = noise(x * 0.05, y * 0.05) * 20;
      let grain = (R() - 0.5) * 16;
      let v = 250 + n + grain;
      let idx = (x + y * width) * 4;
      paperTexture.pixels[idx] = v + tint.r;
      paperTexture.pixels[idx + 1] = v + tint.g;
      paperTexture.pixels[idx + 2] = v + tint.b;
      paperTexture.pixels[idx + 3] = 30;
    }
  }
  paperTexture.updatePixels();
}

function generateBrushTexture() {
  // p5.brush-inspired hatching/texture overlay
  const style = features.brushStyle.style;

  brushTexture.clear();

  if (style === "clean") return;

  let density = style === "heavy" ? 800 : style === "textured" ? 400 : 200;
  let alpha = style === "heavy" ? 25 : style === "textured" ? 15 : 8;

  brushTexture.stroke(80, 70, 60, alpha);
  brushTexture.strokeWeight(0.5);

  for (let i = 0; i < density; i++) {
    let x = rnd(width);
    let y = rnd(height);
    let angle = rnd(TWO_PI);
    let len = rnd(5, 25);

    // Hatching lines
    brushTexture.line(
      x, y,
      x + cos(angle) * len,
      y + sin(angle) * len
    );
  }
}

function draw() {
  // Subtle paper texture fade
  if (frameCount % 30 === 0) {
    push();
    blendMode(SOFT_LIGHT);
    image(paperTexture, 0, 0);
    pop();
  }

  // Update and render molecules
  for (let mol of molecules) {
    mol.applyForces(molecules);
    mol.update();
    mol.render();
  }

  // Water drops
  if (R() < 0.02) {
    drops.push(new WaterDrop(rnd(width), rnd(height), rndChoice(features.palette.colors)));
  }

  for (let i = drops.length - 1; i >= 0; i--) {
    drops[i].update();
    drops[i].render();
    if (drops[i].isDead()) {
      drops.splice(i, 1);
    }
  }

  // Brush texture overlay (occasional)
  if (frameCount % 60 === 0 && features.brushStyle.style !== "clean") {
    push();
    blendMode(MULTIPLY);
    tint(255, 3);
    image(brushTexture, 0, 0);
    pop();
  }

  // Special effects
  if (features.special.active) {
    applySpecialEffect();
  }
}

function applySpecialEffect() {
  const effect = features.special.effect;

  if (effect === "chromatic" && frameCount % 10 === 0) {
    let mol = rndChoice(molecules);
    if (mol) {
      push();
      blendMode(ADD);
      noStroke();
      fill(255, 0, 0, 5);
      ellipse(mol.pos.x - 3, mol.pos.y, mol.size * 4);
      fill(0, 0, 255, 5);
      ellipse(mol.pos.x + 3, mol.pos.y, mol.size * 4);
      pop();
    }
  } else if (effect === "glow" && frameCount % 5 === 0) {
    push();
    blendMode(SCREEN);
    for (let mol of molecules) {
      fill(mol.baseColor[0], mol.baseColor[1], mol.baseColor[2], 3);
      noStroke();
      ellipse(mol.pos.x, mol.pos.y, mol.size * 8);
    }
    pop();
  } else if (effect === "scatter" && frameCount % 15 === 0) {
    for (let i = 0; i < 20; i++) {
      let col = rndChoice(features.palette.colors);
      fill(col[0], col[1], col[2], 30);
      noStroke();
      ellipse(rnd(width), rnd(height), rnd(1, 3));
    }
  }
}

// ============================================================================
// MOLECULE CLASS
// ============================================================================

class Molecule {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.vel = createVector(rnd(-2, 2), rnd(-2, 2));
    this.acc = createVector(0, 0);
    this.baseColor = col;
    this.trail = [];
    this.size = rnd(3, 8) * features.sizeVariance;
    this.mass = this.size * 0.5;
    this.wetness = rnd(0.5, 1) * features.wetness.value;
    this.pigmentDensity = rnd(0.3, 0.8);
    this.phase = rnd(TWO_PI);

    // Brush style variations
    this.brushNoise = rnd(0.5, 1.5);
  }

  applyForces(others) {
    let totalForce = createVector(0, 0);
    const mode = features.physics.mode;

    if (mode === "molecular" || mode === "brownian") {
      for (let other of others) {
        if (other === this) continue;
        let diff = p5.Vector.sub(other.pos, this.pos);
        let dist = diff.mag();
        if (dist < 1) dist = 1;
        if (dist > 150) continue;

        let sigma = 30;
        let epsilon = mode === "brownian" ? 0.2 : 0.5;
        let r = dist / sigma;
        let force = 24 * epsilon * (2 * pow(r, -13) - pow(r, -7));

        diff.normalize();
        diff.mult(force);
        totalForce.add(diff);
      }

      let brownianStrength = mode === "brownian" ? 0.8 : 0.3;
      totalForce.add(createVector(rnd(-brownianStrength, brownianStrength), rnd(-brownianStrength, brownianStrength)));

    } else if (mode === "vortex") {
      let center = createVector(width/2, height/2);
      let toCenter = p5.Vector.sub(center, this.pos);
      toCenter.normalize();
      let tangent = createVector(-toCenter.y, toCenter.x);
      tangent.mult(0.5);
      toCenter.mult(0.01);
      totalForce.add(toCenter);
      totalForce.add(tangent);
      totalForce.add(createVector(rnd(-0.1, 0.1), rnd(-0.1, 0.1)));

    } else if (mode === "explosion") {
      let center = createVector(width/2, height/2);
      let fromCenter = p5.Vector.sub(this.pos, center);
      fromCenter.normalize();
      fromCenter.mult(0.05);
      totalForce.add(fromCenter);
      totalForce.add(createVector(rnd(-0.2, 0.2), rnd(-0.2, 0.2)));

    } else if (mode === "orbital") {
      let center = createVector(width/2, height/2);
      let toCenter = p5.Vector.sub(center, this.pos);
      let dist = toCenter.mag();
      let gravity = toCenter.copy();
      gravity.normalize();
      gravity.mult(50 / (dist + 10));
      let orbital = createVector(-toCenter.y, toCenter.x);
      orbital.normalize();
      orbital.mult(0.3);
      totalForce.add(gravity);
      totalForce.add(orbital);

    } else if (mode === "magnetic") {
      for (let other of others) {
        if (other === this) continue;
        let diff = p5.Vector.sub(other.pos, this.pos);
        let dist = diff.mag();
        if (dist < 1 || dist > 200) continue;

        let similarity = 1 - (
          abs(this.baseColor[0] - other.baseColor[0]) +
          abs(this.baseColor[1] - other.baseColor[1]) +
          abs(this.baseColor[2] - other.baseColor[2])
        ) / 765;

        let force = (similarity - 0.5) * 0.5 / dist;
        diff.normalize();
        diff.mult(force);
        totalForce.add(diff);
      }
      totalForce.add(createVector(rnd(-0.2, 0.2), rnd(-0.2, 0.2)));

    } else if (mode === "flocking") {
      let separation = createVector(0, 0);
      let alignment = createVector(0, 0);
      let cohesion = createVector(0, 0);
      let neighbors = 0;

      for (let other of others) {
        if (other === this) continue;
        let dist = p5.Vector.dist(this.pos, other.pos);

        if (dist < 30) {
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.div(dist);
          separation.add(diff);
        }

        if (dist < 80) {
          alignment.add(other.vel);
          cohesion.add(other.pos);
          neighbors++;
        }
      }

      if (neighbors > 0) {
        alignment.div(neighbors);
        alignment.sub(this.vel);
        alignment.limit(0.05);
        cohesion.div(neighbors);
        cohesion.sub(this.pos);
        cohesion.limit(0.03);
      }

      separation.limit(0.1);
      totalForce.add(separation);
      totalForce.add(alignment);
      totalForce.add(cohesion);

    } else if (mode === "waves") {
      let waveX = sin(this.pos.y * 0.02 + frameCount * 0.05 + this.phase) * 0.3;
      let waveY = cos(this.pos.x * 0.02 + frameCount * 0.03 + this.phase) * 0.2;
      totalForce.add(createVector(waveX, waveY));
    }

    // Gravity well
    let wellX = width/2 + sin(frameCount * 0.01) * 200;
    let wellY = height/2 + cos(frameCount * 0.013) * 200;
    let toWell = createVector(wellX - this.pos.x, wellY - this.pos.y);
    toWell.mult(0.00005);
    totalForce.add(toWell);

    this.acc = totalForce.div(this.mass);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(4);
    this.vel.mult(0.99);
    this.pos.add(this.vel);

    // Soft boundary
    if (this.pos.x < -50) this.pos.x = width + 50;
    if (this.pos.x > width + 50) this.pos.x = -50;
    if (this.pos.y < -50) this.pos.y = height + 50;
    if (this.pos.y > height + 50) this.pos.y = -50;

    // Store trail
    this.trail.push(this.pos.copy());
    if (this.trail.length > features.trail.length) {
      this.trail.shift();
    }

    // Wetness evaporates
    this.wetness *= 0.9995;
    if (this.wetness < 0.3) this.wetness = rnd(0.5, 1) * features.wetness.value;
  }

  render() {
    if (this.trail.length < 2) return;
    this.renderWatercolorTrail();
    this.renderPigmentBlob();
  }

  renderWatercolorTrail() {
    push();
    noFill();

    const brushStyle = features.brushStyle.style;
    const layers = brushStyle === "heavy" ? 4 : brushStyle === "textured" ? 3 : 3;

    for (let layer = 0; layer < layers; layer++) {
      let alpha = map(layer, 0, layers, 8, 3) * this.pigmentDensity;
      let weight = map(layer, 0, layers, this.size * 2, this.size * 4) * this.wetness;

      // Brush texture variation
      if (brushStyle === "heavy" || brushStyle === "textured") {
        weight *= this.brushNoise;
      }

      let r = this.baseColor[0] + layer * 5;
      let g = this.baseColor[1] - layer * 3;
      let b = this.baseColor[2] + layer * 8;

      stroke(r, g, b, alpha);
      strokeWeight(weight);

      beginShape();
      for (let i = 0; i < this.trail.length; i++) {
        let p = this.trail[i];
        let wobbleAmt = brushStyle === "heavy" ? 8 : brushStyle === "textured" ? 6 : 5;
        let wobbleX = noise(p.x * 0.01, p.y * 0.01, frameCount * 0.01) * wobbleAmt - wobbleAmt/2;
        let wobbleY = noise(p.y * 0.01, p.x * 0.01, frameCount * 0.01) * wobbleAmt - wobbleAmt/2;
        curveVertex(p.x + wobbleX * layer, p.y + wobbleY * layer);
      }
      endShape();
    }
    pop();
  }

  renderPigmentBlob() {
    push();
    noStroke();

    let x = this.pos.x;
    let y = this.pos.y;

    const brushStyle = features.brushStyle.style;
    const blobLayers = brushStyle === "heavy" ? 6 : 5;

    for (let i = blobLayers; i > 0; i--) {
      let size = this.size * i * this.wetness;
      let alpha = map(i, blobLayers, 1, 5, 20) * this.pigmentDensity;

      let r = this.baseColor[0] + rnd(-10, 10);
      let g = this.baseColor[1] + rnd(-10, 10);
      let b = this.baseColor[2] + rnd(-10, 10);

      fill(r, g, b, alpha);

      beginShape();
      let vertices = brushStyle === "heavy" ? 12 : 8;
      for (let a = 0; a < TWO_PI; a += TWO_PI / vertices) {
        let rad = size + noise(a * 2, frameCount * 0.02) * size * 0.5 * this.brushNoise;
        curveVertex(x + cos(a) * rad, y + sin(a) * rad);
      }
      endShape(CLOSE);
    }

    // Pigment settling (edge darkening)
    if (R() < 0.3) {
      let edgeAngle = rnd(TWO_PI);
      let edgeDist = this.size * this.wetness * 2;
      fill(this.baseColor[0] - 20, this.baseColor[1] - 20, this.baseColor[2] - 20, 30);
      ellipse(x + cos(edgeAngle) * edgeDist, y + sin(edgeAngle) * edgeDist, rnd(2, 5), rnd(2, 5));
    }
    pop();
  }
}

// ============================================================================
// WATER DROP CLASS
// ============================================================================

class WaterDrop {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.col = col;
    this.size = rnd(20, 60);
    this.life = 1;
    this.decay = rnd(0.005, 0.02);
    this.spread = 0;
  }

  update() {
    this.life -= this.decay;
    this.spread += 0.5;
  }

  render() {
    push();
    noStroke();

    let rings = 5;
    for (let i = rings; i > 0; i--) {
      let ringSize = this.size + this.spread * i * 0.3;
      let alpha = map(i, rings, 1, 2, 8) * this.life;

      fill(this.col[0], this.col[1], this.col[2], alpha);

      beginShape();
      for (let a = 0; a < TWO_PI; a += PI/16) {
        let wobble = noise(a * 3, this.spread * 0.1) * ringSize * 0.3;
        let r = ringSize + wobble;
        curveVertex(this.pos.x + cos(a) * r, this.pos.y + sin(a) * r);
      }
      endShape(CLOSE);
    }

    // Edge definition
    if (this.life > 0.5) {
      stroke(this.col[0] - 30, this.col[1] - 30, this.col[2] - 30, 10 * this.life);
      strokeWeight(1);
      noFill();
      let edgeSize = this.size + this.spread;
      beginShape();
      for (let a = 0; a < TWO_PI; a += PI/12) {
        let wobble = noise(a * 2, this.spread * 0.05) * edgeSize * 0.2;
        curveVertex(this.pos.x + cos(a) * (edgeSize + wobble), this.pos.y + sin(a) * (edgeSize + wobble));
      }
      endShape(CLOSE);
    }
    pop();
  }

  isDead() {
    return this.life <= 0;
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
  initializeSketch();
  if (window.onFeaturesGenerated) {
    window.onFeaturesGenerated(features);
  }
}

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  setHash(hash);
}

window.setHash = setHash;
window.regenerate = regenerate;
window.getFeatures = () => features;
