import { createRng, initRandom } from './prng.js';
import { createNoise2D, fbm } from './noise.js';

const SIZE = 1024;
const PAPER = '#f5f0e8';
const INK = '#1a1612';
const NUM_EDGE_ANCHORS = 24;
const NOISE_SCALE = 0.004;

function smoothstep(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) { return a + t * (b - a); }

function lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return a + diff * t;
}

// Derive a deterministic edge profile from a hash
// This defines what the RIGHT edge of a piece looks like
function deriveEdgeProfile(hash) {
  const rng = createRng(hash);
  const anchors = [];
  for (let i = 0; i < NUM_EDGE_ANCHORS; i++) {
    anchors.push({
      y: i / (NUM_EDGE_ANCHORS - 1),
      density: rng.rnd(0.15, 0.85),
      angle: rng.rnd(-Math.PI, Math.PI),
      contourVal: rng.rnd(-1, 1),
    });
  }
  const noiseSeed = hash;
  const techniques = {
    contours: rng.rnd(0.2, 1),
    flowThreads: rng.rnd(0.2, 1),
    hatching: rng.rnd(0, 0.8),
    stipple: rng.rnd(0.1, 0.7),
    inkWash: rng.rnd(0, 0.5),
  };
  return { anchors, noiseSeed, techniques };
}

// Sample an edge profile at a given normalized y (0..1) via interpolation
function sampleEdge(profile, yNorm) {
  const { anchors } = profile;
  const clamped = Math.max(0, Math.min(1, yNorm));
  const yIdx = clamped * (anchors.length - 1);
  const lo = Math.max(0, Math.min(Math.floor(yIdx), anchors.length - 2));
  const hi = lo + 1;
  const t = yIdx - lo;
  return {
    density: lerp(anchors[lo].density, anchors[hi].density, t),
    angle: lerpAngle(anchors[lo].angle, anchors[hi].angle, t),
    contourVal: lerp(anchors[lo].contourVal, anchors[hi].contourVal, t),
  };
}

// Build the blended field for a piece
function buildField(leftProfile, rightProfile, ownHash) {
  const ownRng = initRandom(ownHash);
  // Derive distinct noise seeds by flipping nibbles in the hash
  const flipHash = (h, offset) => {
    const chars = h.split('');
    for (let i = 2; i < chars.length; i += 3) {
      const c = parseInt(chars[i], 16);
      chars[i] = ((c + offset) & 0xf).toString(16);
    }
    return chars.join('');
  };
  const leftNoise = createNoise2D(initRandom(flipHash(leftProfile.noiseSeed, 3)));
  const rightNoise = createNoise2D(initRandom(flipHash(rightProfile.noiseSeed, 7)));
  const detailNoise = createNoise2D(ownRng);

  return function sample(x, y) {
    const xNorm = x / SIZE;
    const yNorm = y / SIZE;
    const blend = smoothstep(xNorm);

    const leftEdge = sampleEdge(leftProfile, yNorm);
    const rightEdge = sampleEdge(rightProfile, yNorm);

    const density = lerp(leftEdge.density, rightEdge.density, blend);
    const angle = lerpAngle(leftEdge.angle, rightEdge.angle, blend);
    const contourBase = lerp(leftEdge.contourVal, rightEdge.contourVal, blend);

    // Noise field: blend between left-seeded and right-seeded noise
    const nx = x * NOISE_SCALE;
    const ny = y * NOISE_SCALE;
    const leftN = fbm(leftNoise, nx, ny, 4);
    const rightN = fbm(rightNoise, nx, ny, 4);
    const blendedNoise = lerp(leftN, rightN, blend);

    // Interior detail: peaks at center, zero at edges
    const interiorStrength = 4 * xNorm * (1 - xNorm);
    const detail = fbm(detailNoise, nx * 2, ny * 2, 3) * interiorStrength;

    const noiseVal = blendedNoise + detail * 0.25;

    // Technique weights: blend between edge profiles
    const techniques = {};
    for (const key of Object.keys(leftProfile.techniques)) {
      techniques[key] = lerp(
        leftProfile.techniques[key],
        rightProfile.techniques[key],
        blend
      );
    }

    return { density, angle, noiseVal, contourBase, techniques, xNorm, yNorm };
  };
}

// Default edge for first piece (no left neighbor)
function defaultEdgeProfile() {
  return {
    anchors: Array.from({ length: NUM_EDGE_ANCHORS }, (_, i) => ({
      y: i / (NUM_EDGE_ANCHORS - 1),
      density: 0.3,
      angle: 0,
      contourVal: 0,
    })),
    noiseSeed: '0x' + '0'.repeat(64),
    techniques: { contours: 0.6, flowThreads: 0.5, hatching: 0.3, stipple: 0.3, inkWash: 0.2 },
  };
}

// ─── Drawing Techniques ───

function drawContours(ctx, field, rng) {
  const step = 12 + Math.floor(rng.rnd(0, 12));
  const levels = 8 + Math.floor(rng.rnd(0, 6));

  for (let level = 0; level < levels; level++) {
    const threshold = -0.8 + (level / levels) * 1.6;
    ctx.beginPath();
    let drawing = false;

    for (let x = 0; x < SIZE; x += 3) {
      for (let y = 0; y < SIZE; y += step) {
        const f = field(x, y);
        if (f.techniques.contours < 0.3) continue;

        const val = f.noiseVal + f.contourBase * 0.3;
        const diff = Math.abs(val - threshold);

        if (diff < 0.04) {
          const weight = f.techniques.contours * f.density;
          if (weight < 0.15) continue;
          ctx.globalAlpha = Math.min(0.9, weight);
          ctx.lineWidth = 0.5 + weight * 1.5;

          if (!drawing) {
            ctx.moveTo(x, y + (val - threshold) * 80);
            drawing = true;
          } else {
            ctx.lineTo(x, y + (val - threshold) * 80);
          }
        } else {
          drawing = false;
        }
      }
      drawing = false;
    }
    ctx.stroke();
  }
}

function drawFlowThreads(ctx, field, rng) {
  const numThreads = 200 + Math.floor(rng.rnd(0, 300));
  const maxLen = 150 + Math.floor(rng.rnd(0, 250));

  for (let i = 0; i < numThreads; i++) {
    let x = rng.rnd(0, SIZE);
    let y = rng.rnd(0, SIZE);
    const f0 = field(x, y);
    if (f0.techniques.flowThreads < 0.25) continue;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.globalAlpha = 0.15 + f0.density * 0.5;
    ctx.lineWidth = 0.3 + rng.rnd(0, 1.5);

    const steps = Math.floor(maxLen * f0.techniques.flowThreads);
    for (let s = 0; s < steps; s++) {
      const f = field(x, y);
      const angle = f.angle + f.noiseVal * Math.PI;
      x += Math.cos(angle) * 2;
      y += Math.sin(angle) * 2;
      if (x < -10 || x > SIZE + 10 || y < -10 || y > SIZE + 10) break;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawHatching(ctx, field, rng) {
  const numGroups = 40 + Math.floor(rng.rnd(0, 60));
  const groupSize = SIZE / 6;

  for (let g = 0; g < numGroups; g++) {
    const cx = rng.rnd(0, SIZE);
    const cy = rng.rnd(0, SIZE);
    const f = field(cx, cy);
    if (f.techniques.hatching < 0.2) continue;

    const angle = f.angle;
    const spacing = 3 + (1 - f.density) * 8;
    const numLines = Math.floor(groupSize / spacing);
    const lineLen = groupSize * (0.5 + f.techniques.hatching * 0.5);
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const perpCos = Math.cos(angle + Math.PI / 2);
    const perpSin = Math.sin(angle + Math.PI / 2);

    ctx.globalAlpha = 0.1 + f.density * 0.4;
    ctx.lineWidth = 0.4 + rng.rnd(0, 0.6);

    ctx.beginPath();
    for (let l = 0; l < numLines; l++) {
      const offset = (l - numLines / 2) * spacing;
      const ox = cx + perpCos * offset;
      const oy = cy + perpSin * offset;
      const halfLen = lineLen / 2 + rng.rndGaussian(0, lineLen * 0.1);
      ctx.moveTo(ox - cos * halfLen, oy - sin * halfLen);
      ctx.lineTo(ox + cos * halfLen, oy + sin * halfLen);
    }
    ctx.stroke();
  }
}

function drawStipple(ctx, field, rng) {
  const numDots = 8000 + Math.floor(rng.rnd(0, 12000));

  for (let i = 0; i < numDots; i++) {
    const x = rng.rnd(0, SIZE);
    const y = rng.rnd(0, SIZE);
    const f = field(x, y);
    if (f.techniques.stipple < 0.2) continue;

    const prob = f.density * f.techniques.stipple;
    if (rng.next() > prob) continue;

    const r = 0.4 + rng.rnd(0, 1.2) * f.density;
    ctx.globalAlpha = 0.3 + f.density * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawInkWash(ctx, field, rng) {
  const numWashes = 5 + Math.floor(rng.rnd(0, 10));

  for (let i = 0; i < numWashes; i++) {
    const cx = rng.rnd(SIZE * 0.1, SIZE * 0.9);
    const cy = rng.rnd(SIZE * 0.1, SIZE * 0.9);
    const f = field(cx, cy);
    if (f.techniques.inkWash < 0.15) continue;

    const radius = 40 + rng.rnd(0, 150) * f.techniques.inkWash;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    const alpha = 0.02 + f.density * f.techniques.inkWash * 0.06;
    gradient.addColorStop(0, `rgba(26, 22, 18, ${alpha})`);
    gradient.addColorStop(1, 'rgba(26, 22, 18, 0)');

    ctx.globalAlpha = 1;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = INK;
}

// ─── Main Render ───

export function renderPiece(canvas, ownHash, leftHash) {
  const ctx = canvas.getContext('2d');
  canvas.width = SIZE;
  canvas.height = SIZE;

  // Background
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Edge profiles
  const leftProfile = leftHash ? deriveEdgeProfile(leftHash) : defaultEdgeProfile();
  const rightProfile = deriveEdgeProfile(ownHash);

  // Build continuous field
  const field = buildField(leftProfile, rightProfile, ownHash);

  // Rendering RNG (separate from field, for drawing randomness)
  const drawRng = createRng(ownHash.slice(0, 34) + ownHash.slice(34).split('').reverse().join(''));

  // Setup ink style
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Layer order matters for depth
  drawInkWash(ctx, field, drawRng);
  drawContours(ctx, field, drawRng);
  drawHatching(ctx, field, drawRng);
  drawFlowThreads(ctx, field, drawRng);
  drawStipple(ctx, field, drawRng);

  // Reset alpha
  ctx.globalAlpha = 1;
}

export function generateFeatures(ownHash, leftHash) {
  const profile = deriveEdgeProfile(ownHash);
  const rng = createRng(ownHash);

  const dominant = Object.entries(profile.techniques)
    .sort((a, b) => b[1] - a[1])[0][0];

  const densityAvg = profile.anchors.reduce((s, a) => s + a.density, 0) / profile.anchors.length;
  const densityTier = densityAvg < 0.35 ? 'sparse' : densityAvg < 0.55 ? 'balanced' : densityAvg < 0.72 ? 'dense' : 'saturated';

  const hasLeftNeighbor = !!leftHash;
  const position = hasLeftNeighbor ? 'continuation' : 'origin';

  return {
    dominantTechnique: dominant,
    density: densityTier,
    position,
    contourWeight: Math.round(profile.techniques.contours * 100),
    flowWeight: Math.round(profile.techniques.flowThreads * 100),
    hatchWeight: Math.round(profile.techniques.hatching * 100),
    stippleWeight: Math.round(profile.techniques.stipple * 100),
    washWeight: Math.round(profile.techniques.inkWash * 100),
  };
}

export { SIZE };
