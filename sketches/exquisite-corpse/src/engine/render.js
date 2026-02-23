import { createRng, initRandom } from './prng.js';
import { createNoise2D, fbm } from './noise.js';

export const SIZE = 1024;
const PAPER = '#f5f0e8';
const INK = '#1a1612';
const SEAM = 180;
const NOISE_SCALE = 0.003;
const DEFAULT_HASH = '0x' + '0'.repeat(64);

function smoothstep(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) { return a + t * (b - a); }

// ─── Edge Constraint ───
// 1D function of y, deterministic from hash.
// Defines the "signature" of a boundary between two pieces.
// Both pieces evaluate the same function → identical values at the seam.
function createEdgeConstraint(hash) {
  const rng = initRandom(hash);
  const noise = createNoise2D(rng);
  return (y) => fbm(noise, 7.0, y * 0.004, 5, 2.0, 0.5);
}

// ─── Unified Field ───
// Uses narrow transition zones at edges, pure interior noise in the middle.
// Left edge (x=0): matches rightConstraint of previous piece
// Right edge (x=SIZE): defines constraint for next piece
function createField(ownHash, leftHash) {
  const lHash = leftHash || DEFAULT_HASH;
  const leftConstraint = createEdgeConstraint(lHash);
  const rightConstraint = createEdgeConstraint(ownHash);
  const interiorNoise = createNoise2D(initRandom(ownHash));

  // Secondary noise for flow angle
  const aHash = ownHash.slice(0, 2) + ownHash.slice(2).split('').reverse().join('');
  const angleNoise = createNoise2D(initRandom(aHash));

  return function (x, y) {
    const nx = x * NOISE_SCALE;
    const ny = y * NOISE_SCALE;
    const leftVal = leftConstraint(y);
    const rightVal = rightConstraint(y);
    const interior = fbm(interiorNoise, nx, ny, 5, 2.0, 0.5);

    let value;
    if (x < SEAM) {
      value = lerp(leftVal, interior, smoothstep(x / SEAM));
    } else if (x > SIZE - SEAM) {
      value = lerp(interior, rightVal, smoothstep((x - (SIZE - SEAM)) / SEAM));
    } else {
      value = interior;
    }

    const angle = fbm(angleNoise, nx, ny, 3) * Math.PI * 2;
    const density = 0.2 + Math.abs(value) * 0.6;
    return { value, angle, density };
  };
}

// ─── Seam Rendering ───
// Marks generated from the shared boundary hash.
// Both adjacent pieces call this with the same hash → same RNG sequence.
// Piece A renders with boundaryX=SIZE (marks at bx<0 visible).
// Piece B renders with boundaryX=0 (marks at bx>0 visible).
// The canvas clips automatically → marks physically continue across pieces.

function renderSeamFlowThreads(ctx, hash, boundaryX) {
  const rng = createRng(hash);
  const noise = createNoise2D(initRandom(hash));
  const numThreads = 70 + Math.floor(rng.rnd(0, 50));

  for (let i = 0; i < numThreads; i++) {
    let bx = rng.rnd(-SEAM * 0.9, SEAM * 0.9);
    let by = rng.rnd(-20, SIZE + 20);
    const weight = 0.3 + rng.rnd(0, 1.4);
    const maxSteps = 120 + Math.floor(rng.rnd(0, 180));

    ctx.beginPath();
    ctx.lineWidth = weight;
    ctx.moveTo(boundaryX + bx, by);

    for (let s = 0; s < maxSteps; s++) {
      const n = fbm(noise, bx * 0.003, by * 0.003, 3);
      const angle = n * Math.PI * 2;
      bx += Math.cos(angle) * 2.5;
      by += Math.sin(angle) * 2.5;
      const fade = Math.max(0, 1 - Math.abs(bx) / (SEAM * 1.3));
      ctx.globalAlpha = fade * (0.06 + weight * 0.1);
      ctx.lineTo(boundaryX + bx, by);
      if (Math.abs(bx) > SEAM * 1.8 || by < -80 || by > SIZE + 80) break;
    }
    ctx.stroke();
  }
}

function renderSeamContours(ctx, hash, boundaryX) {
  const cHash = hash.slice(0, 2) + 'cc' + hash.slice(4);
  const rng = createRng(cHash);
  const noise = createNoise2D(initRandom(cHash));
  const numLevels = 6;
  const step = 7;

  for (let level = 0; level < numLevels; level++) {
    const threshold = -0.5 + (level / numLevels) * 1.0;
    ctx.beginPath();
    ctx.lineWidth = 0.4 + rng.rnd(0, 0.7);

    for (let by = 0; by < SIZE; by += step) {
      let prev = false;
      for (let bx = -SEAM; bx < SEAM; bx += 3) {
        const n = fbm(noise, bx * 0.004, by * 0.004, 4);
        const hit = Math.abs(n - threshold) < 0.045;
        const fade = Math.max(0, 1 - Math.abs(bx) / SEAM);
        ctx.globalAlpha = fade * 0.35;
        if (hit) {
          if (!prev) ctx.moveTo(boundaryX + bx, by);
          else ctx.lineTo(boundaryX + bx, by);
        }
        prev = hit;
      }
    }
    ctx.stroke();
  }
}

function renderSeamHatching(ctx, hash, boundaryX) {
  const hHash = hash.slice(0, 2) + 'hh' + hash.slice(4);
  const rng = createRng(hHash);
  const noise = createNoise2D(initRandom(hHash));
  const numGroups = 15 + Math.floor(rng.rnd(0, 15));

  for (let g = 0; g < numGroups; g++) {
    const bx = rng.rnd(-SEAM * 0.6, SEAM * 0.6);
    const by = rng.rnd(SIZE * 0.05, SIZE * 0.95);
    const n = fbm(noise, bx * 0.005, by * 0.005, 3);
    const hAngle = n * Math.PI;
    const gSize = 25 + rng.rnd(0, 50);
    const spacing = 3 + rng.rnd(0, 3);
    const numLines = Math.floor(gSize / spacing);
    const cos = Math.cos(hAngle), sin = Math.sin(hAngle);
    const pc = Math.cos(hAngle + Math.PI / 2), ps = Math.sin(hAngle + Math.PI / 2);
    const fade = Math.max(0, 1 - Math.abs(bx) / SEAM);

    ctx.globalAlpha = fade * 0.22;
    ctx.lineWidth = 0.35;
    ctx.beginPath();
    for (let l = 0; l < numLines; l++) {
      const off = (l - numLines / 2) * spacing;
      const ox = bx + pc * off, oy = by + ps * off;
      const half = gSize / 2;
      ctx.moveTo(boundaryX + ox - cos * half, oy - sin * half);
      ctx.lineTo(boundaryX + ox + cos * half, oy + sin * half);
    }
    ctx.stroke();
  }
}

function renderSeamStipple(ctx, hash, boundaryX) {
  const sHash = hash.slice(0, 2) + 'ss' + hash.slice(4);
  const rng = createRng(sHash);
  const num = 2000 + Math.floor(rng.rnd(0, 3000));

  for (let i = 0; i < num; i++) {
    const bx = rng.rnd(-SEAM, SEAM);
    const by = rng.rnd(0, SIZE);
    const fade = Math.max(0, 1 - Math.abs(bx) / SEAM);
    if (rng.next() > fade * 0.5) continue;
    const r = 0.3 + rng.rnd(0, 0.8);
    ctx.globalAlpha = fade * 0.3;
    ctx.beginPath();
    ctx.arc(boundaryX + bx, by, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderSeam(ctx, hash, boundaryX) {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineCap = 'round';
  renderSeamFlowThreads(ctx, hash, boundaryX);
  renderSeamContours(ctx, hash, boundaryX);
  renderSeamHatching(ctx, hash, boundaryX);
  renderSeamStipple(ctx, hash, boundaryX);
  ctx.restore();
}

// ─── Core Rendering ───
// Interior marks fade out near edges so seam marks dominate at boundaries.

function coreAlpha(x, baseAlpha) {
  let fade = 1;
  if (x < SEAM) fade = smoothstep(x / SEAM);
  else if (x > SIZE - SEAM) fade = smoothstep((SIZE - x) / SEAM);
  return baseAlpha * (0.3 + fade * 0.7);
}

function drawCoreContours(ctx, field, rng) {
  const levels = 10 + Math.floor(rng.rnd(0, 8));
  const step = 5 + Math.floor(rng.rnd(0, 5));

  for (let level = 0; level < levels; level++) {
    const threshold = -0.8 + (level / levels) * 1.6;
    ctx.beginPath();
    ctx.lineWidth = 0.4 + rng.rnd(0, 0.9);
    let drawing = false;

    for (let y = 0; y < SIZE; y += step) {
      drawing = false;
      for (let x = 2; x < SIZE - 2; x += 2) {
        const f = field(x, y);
        if (Math.abs(f.value - threshold) < 0.04) {
          ctx.globalAlpha = coreAlpha(x, 0.12 + f.density * 0.45);
          if (!drawing) { ctx.moveTo(x, y); drawing = true; }
          else ctx.lineTo(x, y + (f.value - threshold) * 40);
        } else {
          drawing = false;
        }
      }
    }
    ctx.stroke();
  }
}

function drawCoreFlowThreads(ctx, field, rng) {
  const num = 280 + Math.floor(rng.rnd(0, 220));
  const maxLen = 160 + Math.floor(rng.rnd(0, 200));

  for (let i = 0; i < num; i++) {
    let x = rng.rnd(0, SIZE);
    let y = rng.rnd(0, SIZE);
    const weight = 0.2 + rng.rnd(0, 1.4);

    ctx.beginPath();
    ctx.lineWidth = weight;
    ctx.moveTo(x, y);

    for (let s = 0; s < maxLen; s++) {
      const f = field(x, y);
      x += Math.cos(f.angle) * 2;
      y += Math.sin(f.angle) * 2;
      if (x < -10 || x > SIZE + 10 || y < -10 || y > SIZE + 10) break;
      ctx.globalAlpha = coreAlpha(x, 0.04 + f.density * 0.18);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawCoreHatching(ctx, field, rng) {
  const numGroups = 50 + Math.floor(rng.rnd(0, 50));
  const groupSize = SIZE / 8;

  for (let g = 0; g < numGroups; g++) {
    const cx = rng.rnd(SEAM * 0.3, SIZE - SEAM * 0.3);
    const cy = rng.rnd(0, SIZE);
    const f = field(cx, cy);
    const angle = f.angle;
    const spacing = 2.5 + (1 - f.density) * 5;
    const numLines = Math.floor(groupSize / spacing);
    const lineLen = groupSize * (0.3 + f.density * 0.5);
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const pc = Math.cos(angle + Math.PI / 2), ps = Math.sin(angle + Math.PI / 2);

    ctx.lineWidth = 0.3 + rng.rnd(0, 0.4);
    ctx.beginPath();
    for (let l = 0; l < numLines; l++) {
      const off = (l - numLines / 2) * spacing;
      const ox = cx + pc * off, oy = cy + ps * off;
      const half = lineLen / 2 + rng.rndGaussian(0, lineLen * 0.04);
      ctx.globalAlpha = coreAlpha(cx, 0.06 + f.density * 0.2);
      ctx.moveTo(ox - cos * half, oy - sin * half);
      ctx.lineTo(ox + cos * half, oy + sin * half);
    }
    ctx.stroke();

    // Cross-hatching in dense areas
    if (f.density > 0.5 && rng.rndBool(0.35)) {
      const ca = angle + Math.PI / 2 + rng.rnd(-0.2, 0.2);
      const cc = Math.cos(ca), cs = Math.sin(ca);
      const cpc = Math.cos(ca + Math.PI / 2), cps = Math.sin(ca + Math.PI / 2);
      const crossLines = Math.floor(numLines * 0.5);
      ctx.beginPath();
      for (let l = 0; l < crossLines; l++) {
        const off = (l - crossLines / 2) * spacing * 1.4;
        const ox = cx + cpc * off, oy = cy + cps * off;
        const half = lineLen * 0.35;
        ctx.globalAlpha = coreAlpha(cx, 0.04 + f.density * 0.12);
        ctx.moveTo(ox - cc * half, oy - cs * half);
        ctx.lineTo(ox + cc * half, oy + cs * half);
      }
      ctx.stroke();
    }
  }
}

function drawCoreStipple(ctx, field, rng) {
  const num = 12000 + Math.floor(rng.rnd(0, 12000));

  for (let i = 0; i < num; i++) {
    const x = rng.rnd(0, SIZE);
    const y = rng.rnd(0, SIZE);
    const f = field(x, y);
    if (rng.next() > f.density * 0.6) continue;
    const r = 0.3 + rng.rnd(0, 0.9) * f.density;
    ctx.globalAlpha = coreAlpha(x, 0.15 + f.density * 0.35);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCoreInkWash(ctx, field, rng) {
  const num = 6 + Math.floor(rng.rnd(0, 8));
  for (let i = 0; i < num; i++) {
    const cx = rng.rnd(SEAM * 0.5, SIZE - SEAM * 0.5);
    const cy = rng.rnd(SIZE * 0.1, SIZE * 0.9);
    const f = field(cx, cy);
    const radius = 50 + rng.rnd(0, 120);
    const alpha = 0.012 + f.density * 0.03;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
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

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const field = createField(ownHash, leftHash);
  const coreRng = createRng(ownHash);

  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Core layers (interior content, fades at edges)
  drawCoreInkWash(ctx, field, coreRng);
  drawCoreContours(ctx, field, coreRng);
  drawCoreHatching(ctx, field, coreRng);
  drawCoreFlowThreads(ctx, field, coreRng);
  drawCoreStipple(ctx, field, coreRng);

  // Seam layers (shared marks that physically cross boundaries)
  if (leftHash) {
    renderSeam(ctx, leftHash, 0);
  }
  renderSeam(ctx, ownHash, SIZE);

  ctx.globalAlpha = 1;
}

export function generateFeatures(ownHash, leftHash) {
  const constraint = createEdgeConstraint(ownHash);
  let total = 0;
  for (let y = 0; y < SIZE; y += SIZE / 10) {
    total += Math.abs(constraint(y));
  }
  const avg = total / 10;
  const tier = avg < 0.25 ? 'sparse' : avg < 0.4 ? 'balanced' : avg < 0.55 ? 'dense' : 'saturated';

  return {
    density: tier,
    position: leftHash ? 'continuation' : 'origin',
    edgeComplexity: Math.round(avg * 100),
  };
}
