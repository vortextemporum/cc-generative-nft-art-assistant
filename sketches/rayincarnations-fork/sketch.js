/**
 * Rayincarnations Fork
 * Inspired by Volatile Moods' "Rayincarnations"
 *
 * Version: 1.1.0 (Dev Mode)
 *
 * "Explores form as the result of interaction between
 * visible processes and underlying, unseen structures"
 *
 * Controls:
 *   T - Toggle paper texture
 *   W - Toggle black/white vs sepia
 *   S - Save PNG
 *   0-8 - Save hi-res PNG (4k-20k)
 *   R - Regenerate with new hash
 *   Space - Pause/resume (if animated)
 *   L - Like current output
 *   D - Dislike current output
 */

// ============================================================================
// HASH & PRNG (fxhash compatible)
// ============================================================================

let alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
let fxhash = new URLSearchParams(window.location.search).get('fxhash');
if (!fxhash) {
  fxhash = "oo" + Array(49).fill(0).map(() => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

let b58dec = str => [...str].reduce((p, c) => p * alphabet.length + alphabet.indexOf(c) | 0, 0);
let matcher = (str, start) => str.slice(start).match(new RegExp(".{" + ((str.length - start) >> 2) + "}", "g")).map(b58dec);

function sfc32(a, b, c, d) {
  return () => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}

let fxrand = sfc32(...matcher(fxhash, 2));

function resetRand() {
  fxrand = sfc32(...matcher(fxhash, 2));
}

// Convenience functions
function rnd(min = 0, max = 1) {
  if (arguments.length === 1) { max = min; min = 0; }
  return fxrand() * (max - min) + min;
}
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rndChoice(arr) { return arr[Math.floor(fxrand() * arr.length)]; }
function rndBool(p = 0.5) { return fxrand() < p; }

// ============================================================================
// FEATURES & DEV MODE STATE
// ============================================================================

let features = {};
let originalFeatures = {};
let hasOverrides = false;

// Rarity curves for visualization
const RARITY_CURVES = {
  structureType: {
    options: ['radial', 'flow', 'grid', 'spiral', 'voronoi'],
    probabilities: [0.2, 0.2, 0.2, 0.2, 0.2]
  },
  processType: {
    options: ['organic', 'linear', 'dots', 'waves', 'tendrils'],
    probabilities: [0.2, 0.2, 0.2, 0.2, 0.2]
  },
  interactionMode: {
    options: ['reveal', 'distort', 'attract', 'repel', 'layer'],
    probabilities: [0.2, 0.2, 0.2, 0.2, 0.2]
  },
  colorMode: {
    options: ['monochrome', 'sepia', 'tinted'],
    probabilities: [0.5, 0.33, 0.17]
  },
  density: {
    options: ['sparse', 'balanced', 'dense'],
    probabilities: [0.2, 0.4, 0.4]
  },
  complexity: {
    options: ['minimal', 'moderate', 'complex'],
    probabilities: [0.25, 0.35, 0.4]
  }
};

// Feedback storage
const FEEDBACK_KEY = 'rayincarnations-fork-feedback';

function loadFeedback() {
  try {
    const stored = localStorage.getItem(FEEDBACK_KEY);
    return stored ? JSON.parse(stored) : { liked: [], disliked: [] };
  } catch (e) {
    return { liked: [], disliked: [] };
  }
}

function saveFeedback(feedback) {
  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
  } catch (e) {
    console.warn('Could not save feedback:', e);
  }
}

function recordFeedback(isLike) {
  const feedback = loadFeedback();
  const entry = {
    timestamp: Date.now(),
    hash: fxhash,
    features: { ...features },
    hadOverrides: hasOverrides,
    currentState: {
      structureType: features.structureType,
      processType: features.processType,
      interactionMode: features.interactionMode,
      colorMode: features.colorMode,
      density: features.density,
      complexity: features.complexity,
      tintHue: features.tintHue,
      tintSat: features.tintSat,
      strokeWeight: features.strokeWeight,
      dotSize: features.dotSize,
      structureCount: features.structureCount
    }
  };

  if (isLike) {
    feedback.liked.push(entry);
    console.log('LIKED:', entry);
  } else {
    feedback.disliked.push(entry);
    console.log('DISLIKED:', entry);
  }

  saveFeedback(feedback);
  return entry;
}

function getFeedbackStats() {
  const feedback = loadFeedback();
  const stats = {
    totalLiked: feedback.liked.length,
    totalDisliked: feedback.disliked.length,
    likedStructures: {},
    dislikedStructures: {},
    likedProcesses: {},
    dislikedProcesses: {}
  };

  for (const entry of feedback.liked) {
    const s = entry.features?.structureType || 'unknown';
    const p = entry.features?.processType || 'unknown';
    stats.likedStructures[s] = (stats.likedStructures[s] || 0) + 1;
    stats.likedProcesses[p] = (stats.likedProcesses[p] || 0) + 1;
  }

  for (const entry of feedback.disliked) {
    const s = entry.features?.structureType || 'unknown';
    const p = entry.features?.processType || 'unknown';
    stats.dislikedStructures[s] = (stats.dislikedStructures[s] || 0) + 1;
    stats.dislikedProcesses[p] = (stats.dislikedProcesses[p] || 0) + 1;
  }

  return stats;
}

function exportFeedback() {
  return loadFeedback();
}

function clearFeedback() {
  localStorage.removeItem(FEEDBACK_KEY);
  console.log('Feedback cleared');
}

// Parameter management
function setParameter(name, value) {
  hasOverrides = true;
  features[name] = value;
  return features;
}

function resetToOriginal() {
  features = JSON.parse(JSON.stringify(originalFeatures));
  hasOverrides = false;
  return features;
}

function hasModifications() {
  return hasOverrides;
}

function generateFeatures() {
  resetRand();

  // Canvas orientation
  const orientRoll = rnd();
  let canvasW, canvasH;
  if (orientRoll < 0.5) {
    canvasW = 360; canvasH = 480; // Portrait
  } else if (orientRoll < 0.85) {
    canvasW = 480; canvasH = 360; // Landscape
  } else {
    canvasW = 400; canvasH = 400; // Square
  }

  // Hidden structure type
  const structureType = rndChoice([
    'radial', 'flow', 'grid', 'spiral', 'voronoi'
  ]);

  // Visible process type
  const processType = rndChoice([
    'organic', 'linear', 'dots', 'waves', 'tendrils'
  ]);

  // Interaction mode
  const interactionMode = rndChoice([
    'reveal', 'distort', 'attract', 'repel', 'layer'
  ]);

  // Color mode
  const colorMode = rndChoice(['monochrome', 'monochrome', 'monochrome', 'sepia', 'sepia', 'tinted']);
  let tintHue = rnd(360);
  let tintSat = rnd(5, 15);

  // Density
  const density = rndChoice(['sparse', 'balanced', 'dense', 'dense']);

  // Complexity
  const complexity = rndChoice(['minimal', 'moderate', 'complex', 'complex']);

  // Paper texture
  const paperTexture = rndBool(0.85);

  // Number of hidden structure points/elements
  const structureCount = complexity === 'minimal' ? rndInt(2, 4) :
                        complexity === 'moderate' ? rndInt(4, 8) :
                        rndInt(8, 16);

  // Stroke characteristics
  const strokeWeight = rnd(0.5, 2.5);
  const dotSize = rnd(1, 4);

  features = {
    canvasW,
    canvasH,
    structureType,
    processType,
    interactionMode,
    colorMode,
    tintHue,
    tintSat,
    density,
    complexity,
    paperTexture,
    structureCount,
    strokeWeight,
    dotSize
  };

  // Store original for reset
  originalFeatures = JSON.parse(JSON.stringify(features));
  hasOverrides = false;

  return features;
}

// ============================================================================
// GLOBALS
// ============================================================================

let W, H;
let scale = 1;
let margin;

// Layers
let mainCanvas;
let textureCanvas;
let structureCanvas;

// State
let hiddenStructure = [];
let visibleForms = [];
let renderPhase = 0;
let isHiRes = false;
let hiResScale = 1;
let isPaused = false;

// Settings
let showTexture = true;
let useSepia = false;

// P5 instance reference for external access
let p5Instance = null;

// ============================================================================
// HIDDEN STRUCTURES
// ============================================================================

function generateHiddenStructure(p) {
  hiddenStructure = [];

  const type = features.structureType;
  const count = features.structureCount;

  if (type === 'radial') {
    for (let i = 0; i < count; i++) {
      hiddenStructure.push({
        type: 'radial',
        x: rnd(margin, W - margin),
        y: rnd(margin, H - margin),
        strength: rnd(50, 200),
        rings: rndInt(3, 8)
      });
    }
  }
  else if (type === 'flow') {
    const flowSeed = rnd(10000);
    hiddenStructure.push({
      type: 'flow',
      seed: flowSeed,
      scale: rnd(50, 150),
      strength: rnd(0.5, 2)
    });
  }
  else if (type === 'grid') {
    const gridSize = rnd(30, 80);
    hiddenStructure.push({
      type: 'grid',
      size: gridSize,
      offset: { x: rnd(gridSize), y: rnd(gridSize) },
      rotation: rnd(-15, 15)
    });
  }
  else if (type === 'spiral') {
    for (let i = 0; i < Math.min(count, 5); i++) {
      hiddenStructure.push({
        type: 'spiral',
        x: rnd(margin, W - margin),
        y: rnd(margin, H - margin),
        direction: rndChoice([-1, 1]),
        tightness: rnd(0.05, 0.2),
        strength: rnd(100, 300)
      });
    }
  }
  else if (type === 'voronoi') {
    for (let i = 0; i < count; i++) {
      hiddenStructure.push({
        type: 'voronoi',
        x: rnd(margin, W - margin),
        y: rnd(margin, H - margin)
      });
    }
  }
}

function getStructureInfluence(p, x, y) {
  let influence = { dx: 0, dy: 0, strength: 0, nearest: null, dist: Infinity };

  for (const struct of hiddenStructure) {
    if (struct.type === 'radial') {
      const d = p.dist(x, y, struct.x, struct.y);
      const angle = p.atan2(y - struct.y, x - struct.x);
      const ringDist = d % (struct.strength / struct.rings);
      const ringInfluence = p.sin(ringDist / (struct.strength / struct.rings) * p.PI);
      influence.dx += p.cos(angle + 90) * ringInfluence * 0.5;
      influence.dy += p.sin(angle + 90) * ringInfluence * 0.5;
      influence.strength += Math.abs(ringInfluence);
    }
    else if (struct.type === 'flow') {
      const noiseVal = p.noise(x / struct.scale + struct.seed, y / struct.scale);
      const angle = noiseVal * p.TWO_PI * 2;
      influence.dx += p.cos(angle) * struct.strength;
      influence.dy += p.sin(angle) * struct.strength;
      influence.strength += noiseVal;
    }
    else if (struct.type === 'grid') {
      const gx = (x - struct.offset.x) % struct.size;
      const gy = (y - struct.offset.y) % struct.size;
      const distToLine = Math.min(gx, struct.size - gx, gy, struct.size - gy);
      influence.strength += 1 - distToLine / (struct.size / 2);
    }
    else if (struct.type === 'spiral') {
      const d = p.dist(x, y, struct.x, struct.y);
      if (d < struct.strength && d > 0) {
        const angle = p.atan2(y - struct.y, x - struct.x);
        const spiralAngle = angle + d * struct.tightness * struct.direction;
        influence.dx += p.cos(spiralAngle + 90) * (1 - d / struct.strength);
        influence.dy += p.sin(spiralAngle + 90) * (1 - d / struct.strength);
        influence.strength += 1 - d / struct.strength;
      }
    }
    else if (struct.type === 'voronoi') {
      const d = p.dist(x, y, struct.x, struct.y);
      if (d < influence.dist) {
        influence.dist = d;
        influence.nearest = struct;
      }
    }
  }

  return influence;
}

// ============================================================================
// VISIBLE FORMS
// ============================================================================

function generateVisibleForms(p) {
  visibleForms = [];

  const type = features.processType;
  const density = features.density;

  const countMultiplier = density === 'sparse' ? 0.5 :
                          density === 'balanced' ? 1 :
                          density === 'dense' ? 2 : 1;

  if (type === 'organic') {
    const blobCount = Math.floor(rndInt(3, 8) * countMultiplier);
    for (let i = 0; i < blobCount; i++) {
      const cx = rnd(margin * 2, W - margin * 2);
      const cy = rnd(margin * 2, H - margin * 2);
      const size = rnd(30, 100);

      visibleForms.push({
        type: 'organic',
        cx, cy, size,
        points: generateBlobPoints(p, cx, cy, size),
        fill: true
      });
    }
  }
  else if (type === 'linear') {
    const lineCount = Math.floor(rndInt(20, 60) * countMultiplier);
    for (let i = 0; i < lineCount; i++) {
      const x1 = rnd(W);
      const y1 = rnd(H);
      const length = rnd(50, 200);
      const angle = rnd(p.TWO_PI);

      visibleForms.push({
        type: 'linear',
        x1, y1,
        x2: x1 + p.cos(angle) * length,
        y2: y1 + p.sin(angle) * length,
        segments: []
      });
    }
  }
  else if (type === 'dots') {
    const clusterCount = Math.floor(rndInt(5, 15) * countMultiplier);
    for (let i = 0; i < clusterCount; i++) {
      const cx = rnd(margin, W - margin);
      const cy = rnd(margin, H - margin);
      const radius = rnd(30, 100);
      const dotCount = Math.floor(rnd(50, 200) * countMultiplier);

      const dots = [];
      for (let j = 0; j < dotCount; j++) {
        const angle = rnd(p.TWO_PI);
        const dist = rnd(radius) * rnd();
        dots.push({
          x: cx + p.cos(angle) * dist,
          y: cy + p.sin(angle) * dist,
          size: rnd(features.dotSize * 0.5, features.dotSize * 1.5)
        });
      }

      visibleForms.push({ type: 'dots', cx, cy, radius, dots });
    }
  }
  else if (type === 'waves') {
    const waveCount = Math.floor(rndInt(10, 30) * countMultiplier);
    for (let i = 0; i < waveCount; i++) {
      const y = margin + (H - margin * 2) * (i / waveCount);
      const amplitude = rnd(10, 40);
      const frequency = rnd(0.01, 0.05);
      const phase = rnd(p.TWO_PI);

      visibleForms.push({
        type: 'wave',
        y, amplitude, frequency, phase,
        points: []
      });
    }
  }
  else if (type === 'tendrils') {
    const tendrilCount = Math.floor(rndInt(5, 15) * countMultiplier);
    for (let i = 0; i < tendrilCount; i++) {
      const startX = rnd(W);
      const startY = rnd(H);

      visibleForms.push({
        type: 'tendril',
        x: startX,
        y: startY,
        angle: rnd(p.TWO_PI),
        length: rnd(100, 400),
        points: []
      });
    }
  }

  applyInteraction(p);
}

function generateBlobPoints(p, cx, cy, size) {
  const points = [];
  const numPoints = rndInt(8, 16);

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * p.TWO_PI;
    const r = size * rnd(0.6, 1.4);
    const noiseVal = p.noise(p.cos(angle) * 2, p.sin(angle) * 2, rnd(100));
    const finalR = r * (0.7 + noiseVal * 0.6);

    points.push({
      x: cx + p.cos(angle) * finalR,
      y: cy + p.sin(angle) * finalR
    });
  }

  return points;
}

function applyInteraction(p) {
  const mode = features.interactionMode;

  for (const form of visibleForms) {
    if (form.type === 'organic' && form.points) {
      for (const pt of form.points) {
        const inf = getStructureInfluence(p, pt.x, pt.y);

        if (mode === 'distort') {
          pt.x += inf.dx * 20;
          pt.y += inf.dy * 20;
        } else if (mode === 'attract') {
          if (inf.nearest) {
            const angle = p.atan2(inf.nearest.y - pt.y, inf.nearest.x - pt.x);
            pt.x += p.cos(angle) * inf.strength * 10;
            pt.y += p.sin(angle) * inf.strength * 10;
          }
        } else if (mode === 'repel') {
          pt.x -= inf.dx * 15;
          pt.y -= inf.dy * 15;
        }
      }
    }
    else if (form.type === 'tendril') {
      let x = form.x;
      let y = form.y;
      let angle = form.angle;
      const step = 3;

      for (let i = 0; i < form.length / step; i++) {
        const inf = getStructureInfluence(p, x, y);

        if (mode === 'distort' || mode === 'attract') {
          angle += p.atan2(inf.dy, inf.dx) * 0.1;
        } else if (mode === 'repel') {
          angle -= p.atan2(inf.dy, inf.dx) * 0.1;
        }

        angle += rnd(-0.2, 0.2);
        x += p.cos(angle) * step;
        y += p.sin(angle) * step;

        form.points.push({ x, y, strength: inf.strength });
      }
    }
    else if (form.type === 'wave') {
      for (let x = margin; x < W - margin; x += 2) {
        const baseY = form.y + p.sin(x * form.frequency + form.phase) * form.amplitude;
        const inf = getStructureInfluence(p, x, baseY);

        let finalY = baseY;
        if (mode === 'distort') {
          finalY += inf.dy * 10;
        } else if (mode === 'reveal') {
          finalY += inf.strength * 20 - 10;
        }

        form.points.push({ x, y: finalY, strength: inf.strength });
      }
    }
    else if (form.type === 'linear') {
      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        let x = p.lerp(form.x1, form.x2, t);
        let y = p.lerp(form.y1, form.y2, t);

        const inf = getStructureInfluence(p, x, y);

        if (mode === 'distort') {
          x += inf.dx * 10;
          y += inf.dy * 10;
        }

        form.segments.push({ x, y, strength: inf.strength });
      }
    }
  }
}

// ============================================================================
// RENDERING
// ============================================================================

function renderStructureLayer(p, canvas) {
  canvas.push();
  canvas.background(0, 0, 0, 0);
  canvas.strokeWeight(0.5 * scale);

  const alpha = features.interactionMode === 'reveal' ? 0.15 : 0.05;

  for (const struct of hiddenStructure) {
    if (struct.type === 'radial') {
      canvas.noFill();
      canvas.stroke(0, 0, 50, alpha);
      for (let r = 0; r < struct.strength; r += struct.strength / struct.rings) {
        canvas.ellipse(struct.x * scale, struct.y * scale, r * 2 * scale, r * 2 * scale);
      }
    }
    else if (struct.type === 'spiral') {
      canvas.noFill();
      canvas.stroke(0, 0, 50, alpha);
      canvas.beginShape();
      for (let a = 0; a < p.TWO_PI * 5; a += 0.1) {
        const r = a * struct.tightness * 50;
        const x = struct.x + p.cos(a * struct.direction) * r;
        const y = struct.y + p.sin(a * struct.direction) * r;
        canvas.vertex(x * scale, y * scale);
      }
      canvas.endShape();
    }
    else if (struct.type === 'voronoi') {
      canvas.noStroke();
      canvas.fill(0, 0, 50, alpha);
      canvas.ellipse(struct.x * scale, struct.y * scale, 4 * scale, 4 * scale);
    }
  }

  canvas.pop();
}

function renderVisibleForms(p, canvas) {
  canvas.push();

  const baseColor = useSepia ?
    p.color(features.tintHue, features.tintSat, 15) :
    p.color(0, 0, 15);

  const lightColor = useSepia ?
    p.color(features.tintHue, features.tintSat * 0.5, 95) :
    p.color(0, 0, 95);

  for (const form of visibleForms) {
    if (form.type === 'organic') {
      renderOrganicForm(p, canvas, form, baseColor, lightColor);
    }
    else if (form.type === 'dots') {
      renderDotCluster(p, canvas, form, baseColor);
    }
    else if (form.type === 'tendril') {
      renderTendril(p, canvas, form, baseColor);
    }
    else if (form.type === 'wave') {
      renderWave(p, canvas, form, baseColor);
    }
    else if (form.type === 'linear') {
      renderLinear(p, canvas, form, baseColor);
    }
  }

  canvas.pop();
}

function renderOrganicForm(p, canvas, form, baseColor, lightColor) {
  if (!form.points || form.points.length < 3) return;

  canvas.noStroke();
  canvas.fill(p.hue(baseColor), p.saturation(baseColor), p.brightness(baseColor), 0.1);

  canvas.beginShape();
  for (const pt of form.points) {
    canvas.curveVertex(pt.x * scale, pt.y * scale);
  }
  canvas.curveVertex(form.points[0].x * scale, form.points[0].y * scale);
  canvas.curveVertex(form.points[1].x * scale, form.points[1].y * scale);
  canvas.endShape(p.CLOSE);

  canvas.noFill();
  canvas.strokeWeight(features.strokeWeight * scale);

  for (let pass = 0; pass < 3; pass++) {
    canvas.stroke(p.hue(baseColor), p.saturation(baseColor),
                  p.brightness(baseColor) + rnd(-5, 5), rnd(0.3, 0.6));

    canvas.beginShape();
    for (let i = 0; i < form.points.length; i++) {
      const pt = form.points[i];
      const jitter = 2 * scale;
      canvas.curveVertex(
        pt.x * scale + rnd(-jitter, jitter),
        pt.y * scale + rnd(-jitter, jitter)
      );
    }
    canvas.curveVertex(form.points[0].x * scale, form.points[0].y * scale);
    canvas.curveVertex(form.points[1].x * scale, form.points[1].y * scale);
    canvas.endShape();
  }

  const dotCount = Math.floor(form.size * 2 * (features.density === 'dense' ? 2 : 1));
  for (let i = 0; i < dotCount; i++) {
    const angle = rnd(p.TWO_PI);
    const dist = rnd(form.size * 0.8) * rnd();
    const x = form.cx + p.cos(angle) * dist;
    const y = form.cy + p.sin(angle) * dist;

    if (pointInPolygon(x, y, form.points)) {
      const inf = getStructureInfluence(p, x, y);
      const brightness = p.map(inf.strength, 0, 2, 20, 60);

      canvas.noStroke();
      canvas.fill(p.hue(baseColor), p.saturation(baseColor), brightness, rnd(0.3, 0.8));
      canvas.ellipse(x * scale, y * scale, features.dotSize * scale * rnd(0.5, 1.5));
    }
  }
}

function renderDotCluster(p, canvas, form, baseColor) {
  canvas.noStroke();

  for (const dot of form.dots) {
    const inf = getStructureInfluence(p, dot.x, dot.y);
    const brightness = p.map(inf.strength, 0, 2, 15, 70);

    canvas.fill(p.hue(baseColor), p.saturation(baseColor), brightness, rnd(0.4, 0.9));
    canvas.ellipse(dot.x * scale, dot.y * scale, dot.size * scale);
  }
}

function renderTendril(p, canvas, form, baseColor) {
  if (!form.points || form.points.length < 2) return;

  canvas.noFill();

  for (let pass = 0; pass < 4; pass++) {
    canvas.strokeWeight((features.strokeWeight * (1 - pass * 0.2)) * scale);
    canvas.stroke(p.hue(baseColor), p.saturation(baseColor),
                  p.brightness(baseColor) + rnd(-10, 10), rnd(0.2, 0.5));

    canvas.beginShape();
    for (let i = 0; i < form.points.length; i++) {
      const pt = form.points[i];
      const jitter = (2 - pass * 0.5) * scale;
      canvas.curveVertex(
        pt.x * scale + rnd(-jitter, jitter),
        pt.y * scale + rnd(-jitter, jitter)
      );
    }
    canvas.endShape();
  }

  for (let i = 0; i < form.points.length; i += 5) {
    const pt = form.points[i];
    const brightness = p.map(pt.strength || 0, 0, 2, 20, 60);

    canvas.noStroke();
    canvas.fill(p.hue(baseColor), p.saturation(baseColor), brightness, rnd(0.3, 0.7));
    canvas.ellipse(pt.x * scale, pt.y * scale, features.dotSize * scale * rnd(0.5, 1.5));
  }
}

function renderWave(p, canvas, form, baseColor) {
  if (!form.points || form.points.length < 2) return;

  canvas.noFill();
  canvas.strokeWeight(features.strokeWeight * scale);
  canvas.stroke(p.hue(baseColor), p.saturation(baseColor), p.brightness(baseColor), 0.4);

  canvas.beginShape();
  for (const pt of form.points) {
    canvas.curveVertex(pt.x * scale, pt.y * scale);
  }
  canvas.endShape();

  for (const pt of form.points) {
    if (pt.strength > 0.7) {
      canvas.noStroke();
      canvas.fill(p.hue(baseColor), p.saturation(baseColor), 30, 0.5);
      canvas.ellipse(pt.x * scale, pt.y * scale, features.dotSize * scale);
    }
  }
}

function renderLinear(p, canvas, form, baseColor) {
  if (!form.segments || form.segments.length < 2) return;

  canvas.noFill();
  canvas.strokeWeight(features.strokeWeight * scale);
  canvas.stroke(p.hue(baseColor), p.saturation(baseColor), p.brightness(baseColor), 0.3);

  canvas.beginShape();
  for (const seg of form.segments) {
    canvas.vertex(seg.x * scale, seg.y * scale);
  }
  canvas.endShape();
}

function renderPaperTexture(p, canvas) {
  canvas.loadPixels();

  const grainAmount = 6 * Math.sqrt(scale);

  for (let i = 0; i < canvas.pixels.length; i += 4) {
    const grain = Math.floor(-grainAmount + fxrand() * grainAmount * 2);
    canvas.pixels[i] += grain;
    canvas.pixels[i + 1] += grain;
    canvas.pixels[i + 2] += grain;
  }

  canvas.updatePixels();
}

// ============================================================================
// UTILITIES
// ============================================================================

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// ============================================================================
// MAIN SKETCH
// ============================================================================

new p5((p) => {
  p5Instance = p;

  p.setup = function() {
    generateFeatures();

    W = features.canvasW;
    H = features.canvasH;
    margin = Math.min(W, H) * 0.08;

    scale = Math.min(p.windowWidth / W, p.windowHeight / H) * 0.9;

    const canvasW = Math.floor(W * scale);
    const canvasH = Math.floor(H * scale);

    p.createCanvas(canvasW, canvasH);
    p.colorMode(p.HSB, 360, 100, 100, 1);
    p.pixelDensity(2);

    mainCanvas = p.createGraphics(canvasW, canvasH);
    mainCanvas.colorMode(p.HSB, 360, 100, 100, 1);

    textureCanvas = p.createGraphics(canvasW, canvasH);
    textureCanvas.colorMode(p.HSB, 360, 100, 100, 1);

    structureCanvas = p.createGraphics(canvasW, canvasH);
    structureCanvas.colorMode(p.HSB, 360, 100, 100, 1);

    useSepia = features.colorMode === 'sepia' || features.colorMode === 'tinted';
    showTexture = features.paperTexture;

    regenerate(p);

    // Notify UI
    if (typeof window.onSketchReady === 'function') {
      window.onSketchReady();
    }
  };

  function regenerate(p) {
    resetRand();
    generateHiddenStructure(p);
    generateVisibleForms(p);
    render(p);
  }

  function render(p) {
    const bgBrightness = useSepia ? 92 : 95;
    const bgHue = useSepia ? features.tintHue : 0;
    const bgSat = useSepia ? features.tintSat * 0.3 : 0;

    mainCanvas.background(bgHue, bgSat, bgBrightness);

    renderStructureLayer(p, structureCanvas);
    mainCanvas.image(structureCanvas, 0, 0);

    renderVisibleForms(p, mainCanvas);

    if (showTexture) {
      renderPaperTexture(p, mainCanvas);
    }

    p.image(mainCanvas, 0, 0);

    if (typeof fxpreview === 'function') {
      fxpreview();
    }
  }

  p.draw = function() {
    p.noLoop();
  };

  p.keyTyped = function() {
    if (p.key === 's' || p.key === 'S') {
      p.save(`rayincarnations-fork-${fxhash.slice(0, 10)}.png`);
    }
    else if (p.key === 'r' || p.key === 'R') {
      fxhash = "oo" + Array(49).fill(0).map(() => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
      generateFeatures();
      useSepia = features.colorMode === 'sepia' || features.colorMode === 'tinted';
      showTexture = features.paperTexture;
      regenerate(p);
      p.redraw();
      if (typeof window.syncUI === 'function') window.syncUI();
    }
    else if (p.key === 't' || p.key === 'T') {
      showTexture = !showTexture;
      render(p);
      p.redraw();
    }
    else if (p.key === 'w' || p.key === 'W') {
      useSepia = !useSepia;
      render(p);
      p.redraw();
    }
    else if (p.key === 'l' || p.key === 'L') {
      recordFeedback(true);
      if (typeof window.onFeedback === 'function') window.onFeedback(true);
    }
    else if (p.key === 'd' || p.key === 'D') {
      recordFeedback(false);
      if (typeof window.onFeedback === 'function') window.onFeedback(false);
    }
    else if (p.key === ' ') {
      isPaused = !isPaused;
    }
    else if (p.key >= '0' && p.key <= '8') {
      const sizes = [4000, 5000, 6000, 8000, 10000, 12000, 15000, 18000, 20000];
      const targetSize = sizes[parseInt(p.key)];
      exportHiRes(p, targetSize);
    }
  };

  function exportHiRes(p, targetSize) {
    const aspectRatio = W / H;
    let exportW, exportH;

    if (W > H) {
      exportW = targetSize;
      exportH = Math.floor(targetSize / aspectRatio);
    } else {
      exportH = targetSize;
      exportW = Math.floor(targetSize * aspectRatio);
    }

    const oldScale = scale;
    scale = exportW / W;

    const hiResCanvas = p.createGraphics(exportW, exportH);
    hiResCanvas.colorMode(p.HSB, 360, 100, 100, 1);
    hiResCanvas.pixelDensity(1);

    const bgBrightness = useSepia ? 92 : 95;
    const bgHue = useSepia ? features.tintHue : 0;
    const bgSat = useSepia ? features.tintSat * 0.3 : 0;

    hiResCanvas.background(bgHue, bgSat, bgBrightness);

    resetRand();
    renderStructureLayer(p, hiResCanvas);
    renderVisibleForms(p, hiResCanvas);

    if (showTexture) {
      renderPaperTexture(p, hiResCanvas);
    }

    hiResCanvas.save(`rayincarnations-fork-${fxhash.slice(0, 10)}-${exportW}px.png`);

    scale = oldScale;
  }

  p.windowResized = function() {
    scale = Math.min(p.windowWidth / W, p.windowHeight / H) * 0.9;

    const canvasW = Math.floor(W * scale);
    const canvasH = Math.floor(H * scale);

    p.resizeCanvas(canvasW, canvasH);

    mainCanvas = p.createGraphics(canvasW, canvasH);
    mainCanvas.colorMode(p.HSB, 360, 100, 100, 1);

    textureCanvas = p.createGraphics(canvasW, canvasH);
    textureCanvas.colorMode(p.HSB, 360, 100, 100, 1);

    structureCanvas = p.createGraphics(canvasW, canvasH);
    structureCanvas.colorMode(p.HSB, 360, 100, 100, 1);

    render(p);
    p.redraw();
  };

  // Expose regenerate for external use
  window.sketchRegenerate = () => {
    regenerate(p);
    p.redraw();
  };
});

// ============================================================================
// EXPORTS FOR DEV MODE UI
// ============================================================================

window.rayincarnationsFork = {
  getFeatures: () => features,
  getOriginalFeatures: () => originalFeatures,
  getHash: () => fxhash,
  setParameter,
  resetToOriginal,
  hasModifications,
  regenerate: () => {
    if (p5Instance) {
      resetRand();
      generateHiddenStructure(p5Instance);
      generateVisibleForms(p5Instance);
      if (typeof window.sketchRegenerate === 'function') {
        window.sketchRegenerate();
      }
    }
  },
  recordFeedback,
  getFeedbackStats,
  exportFeedback,
  clearFeedback,
  getRarityCurves: () => RARITY_CURVES,
  setShowTexture: (v) => { showTexture = v; },
  setUseSepia: (v) => { useSepia = v; },
  getShowTexture: () => showTexture,
  getUseSepia: () => useSepia
};

window.$fxhashFeatures = {
  "Structure": features.structureType,
  "Process": features.processType,
  "Interaction": features.interactionMode,
  "Color Mode": features.colorMode,
  "Density": features.density,
  "Complexity": features.complexity,
  "Orientation": features.canvasW > features.canvasH ? "Landscape" :
                 features.canvasH > features.canvasW ? "Portrait" : "Square"
};
