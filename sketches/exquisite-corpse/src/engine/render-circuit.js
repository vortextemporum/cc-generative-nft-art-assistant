import { createRng, initRandom } from './prng.js';
import { createNoise2D, fbm } from './noise.js';

export const SIZE = 1024;
const BG = '#08080f';
const SEAM = 180;
const NOISE_SCALE = 0.003;
const DEFAULT_HASH = '0x' + '0'.repeat(64);

const PALETTES = [
  ['#00f0ff', '#00bbdd', '#0088aa'],  // cyan
  ['#ff3388', '#cc1166', '#ff55aa'],  // magenta
  ['#00ff88', '#00cc66', '#33ffaa'],  // mint
  ['#ffaa00', '#ff8800', '#ffcc44'],  // amber
  ['#8855ff', '#6633cc', '#aa77ff'],  // violet
  ['#ff4444', '#cc2222', '#ff6666'],  // red
];

function smoothstep(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}
function lerp(a, b, t) { return a + t * (b - a); }

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbStr(r, g, b, a = 1) {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
}

// Derive palette from hash
function derivePalette(hash) {
  const rng = createRng(hash);
  const idx1 = rng.rndInt(0, PALETTES.length - 1);
  let idx2 = rng.rndInt(0, PALETTES.length - 2);
  if (idx2 >= idx1) idx2++;
  return { primary: PALETTES[idx1], secondary: PALETTES[idx2], rng };
}

function createEdgeConstraint(hash) {
  const rng = initRandom(hash);
  const noise = createNoise2D(rng);
  return (y) => fbm(noise, 7.0, y * 0.004, 5, 2.0, 0.5);
}

function createField(ownHash, leftHash) {
  const lHash = leftHash || DEFAULT_HASH;
  const leftConstraint = createEdgeConstraint(lHash);
  const rightConstraint = createEdgeConstraint(ownHash);
  const interiorNoise = createNoise2D(initRandom(ownHash));
  const aHash = ownHash.slice(0, 2) + ownHash.slice(2).split('').reverse().join('');
  const angleNoise = createNoise2D(initRandom(aHash));

  return function (x, y) {
    const nx = x * NOISE_SCALE, ny = y * NOISE_SCALE;
    const leftVal = leftConstraint(y);
    const rightVal = rightConstraint(y);
    const interior = fbm(interiorNoise, nx, ny, 5, 2.0, 0.5);

    let value;
    if (x < SEAM) value = lerp(leftVal, interior, smoothstep(x / SEAM));
    else if (x > SIZE - SEAM) value = lerp(interior, rightVal, smoothstep((x - (SIZE - SEAM)) / SEAM));
    else value = interior;

    const angle = fbm(angleNoise, nx, ny, 3) * Math.PI * 2;
    const density = 0.15 + Math.abs(value) * 0.7;
    return { value, angle, density };
  };
}

// ─── Core Drawing ───

function coreAlpha(x, base) {
  let fade = 1;
  if (x < SEAM) fade = smoothstep(x / SEAM);
  else if (x > SIZE - SEAM) fade = smoothstep((SIZE - x) / SEAM);
  return base * (0.3 + fade * 0.7);
}

function drawNodes(ctx, field, rng, palette) {
  const num = 300 + Math.floor(rng.rnd(0, 200));
  const nodes = [];

  for (let i = 0; i < num; i++) {
    const x = rng.rnd(0, SIZE);
    const y = rng.rnd(0, SIZE);
    const f = field(x, y);
    if (rng.next() > f.density) continue;

    const r = 1 + rng.rnd(0, 3) * f.density;
    const color = rng.rndChoice(rng.next() < 0.65 ? palette.primary : palette.secondary);
    const rgb = hexToRgb(color);

    // Glow
    ctx.globalAlpha = coreAlpha(x, 0.06 + f.density * 0.08);
    ctx.fillStyle = rgbStr(rgb[0], rgb[1], rgb[2], 1);
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.globalAlpha = coreAlpha(x, 0.6 + f.density * 0.35);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    nodes.push({ x, y, r, color, rgb, density: f.density });
  }
  return nodes;
}

function drawTraces(ctx, field, rng, palette, nodes) {
  const maxDist = 80 + rng.rnd(0, 60);

  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    let connections = 0;

    for (let j = i + 1; j < nodes.length && connections < 3; j++) {
      const b = nodes[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) continue;
      if (rng.next() > 0.5) continue;

      const alpha = coreAlpha((a.x + b.x) / 2, (1 - dist / maxDist) * 0.25);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 0.4 + (1 - dist / maxDist) * 0.8;

      // Circuit-style: right-angle traces
      if (rng.next() < 0.6) {
        const midX = rng.next() < 0.5 ? b.x : a.x;
        const midY = rng.next() < 0.5 ? a.y : b.y;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(midX, midY);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      connections++;
    }
  }
}

function drawFlowTraces(ctx, field, rng, palette) {
  const num = 150 + Math.floor(rng.rnd(0, 120));
  const maxLen = 100 + Math.floor(rng.rnd(0, 150));

  for (let i = 0; i < num; i++) {
    let x = rng.rnd(0, SIZE), y = rng.rnd(0, SIZE);
    const f0 = field(x, y);
    if (f0.density < 0.2) continue;

    const color = rng.rndChoice(rng.next() < 0.5 ? palette.primary : palette.secondary);
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.3 + rng.rnd(0, 0.8);
    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let s = 0; s < maxLen; s++) {
      const f = field(x, y);
      x += Math.cos(f.angle) * 2;
      y += Math.sin(f.angle) * 2;
      if (x < -10 || x > SIZE + 10 || y < -10 || y > SIZE + 10) break;
      ctx.globalAlpha = coreAlpha(x, 0.03 + f.density * 0.1);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawGridLines(ctx, field, rng, palette) {
  const spacing = 40 + Math.floor(rng.rnd(0, 40));
  const color = rng.rndChoice(palette.primary);

  ctx.strokeStyle = color;
  ctx.lineWidth = 0.2;

  // Horizontal
  for (let y = spacing; y < SIZE; y += spacing) {
    ctx.beginPath();
    for (let x = 0; x < SIZE; x += 4) {
      const f = field(x, y);
      if (f.density < 0.3) continue;
      ctx.globalAlpha = coreAlpha(x, 0.015 + f.density * 0.03);
      if (x === 0 || f.density < 0.3) ctx.moveTo(x, y);
      else ctx.lineTo(x, y + f.value * 3);
    }
    ctx.stroke();
  }

  // Vertical
  ctx.strokeStyle = rng.rndChoice(palette.secondary);
  for (let x = spacing; x < SIZE; x += spacing) {
    ctx.beginPath();
    for (let y = 0; y < SIZE; y += 4) {
      const f = field(x, y);
      if (f.density < 0.3) continue;
      ctx.globalAlpha = coreAlpha(x, 0.015 + f.density * 0.03);
      if (y === 0 || f.density < 0.3) ctx.moveTo(x + f.value * 3, y);
      else ctx.lineTo(x + f.value * 3, y);
    }
    ctx.stroke();
  }
}

function drawNebula(ctx, field, rng, palette) {
  const num = 8 + Math.floor(rng.rnd(0, 8));
  for (let i = 0; i < num; i++) {
    const cx = rng.rnd(SEAM * 0.3, SIZE - SEAM * 0.3);
    const cy = rng.rnd(SIZE * 0.1, SIZE * 0.9);
    const f = field(cx, cy);
    const radius = 60 + rng.rnd(0, 140) * f.density;
    const color = rng.rndChoice(rng.next() < 0.5 ? palette.primary : palette.secondary);
    const rgb = hexToRgb(color);

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, rgbStr(rgb[0], rgb[1], rgb[2], 0.025 + f.density * 0.02));
    gradient.addColorStop(0.5, rgbStr(rgb[0], rgb[1], rgb[2], 0.008));
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.globalAlpha = 1;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Seam Rendering ───

function renderSeamNodes(ctx, hash, boundaryX) {
  const pal = derivePalette(hash);
  const rng = pal.rng;
  const noise = createNoise2D(initRandom(hash));
  const numNodes = 40 + Math.floor(rng.rnd(0, 30));
  const nodes = [];

  for (let i = 0; i < numNodes; i++) {
    const bx = rng.rnd(-SEAM * 0.8, SEAM * 0.8);
    const by = rng.rnd(20, SIZE - 20);
    const n = fbm(noise, bx * 0.004, by * 0.004, 3);
    const density = 0.2 + Math.abs(n) * 0.6;
    const r = 1 + rng.rnd(0, 2.5) * density;
    const color = rng.rndChoice(rng.next() < 0.6 ? pal.primary : pal.secondary);
    const rgb = hexToRgb(color);
    const fade = Math.max(0, 1 - Math.abs(bx) / (SEAM * 1.2));
    const cx = boundaryX + bx, cy = by;

    // Glow
    ctx.globalAlpha = fade * 0.07;
    ctx.fillStyle = rgbStr(rgb[0], rgb[1], rgb[2], 1);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 4, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.globalAlpha = fade * 0.7;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    nodes.push({ bx, by, cx, cy, r, color, rgb, density });
  }

  // Connect nearby seam nodes
  const maxDist = 70;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.bx - b.bx, dy = a.by - b.by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist || rng.next() > 0.4) continue;

      const fade = Math.max(0, 1 - (Math.abs(a.bx) + Math.abs(b.bx)) / (SEAM * 2.4));
      ctx.globalAlpha = fade * (1 - dist / maxDist) * 0.2;
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 0.4 + (1 - dist / maxDist) * 0.5;

      if (rng.next() < 0.5) {
        const mid = rng.next() < 0.5 ? { x: b.cx, y: a.cy } : { x: a.cx, y: b.cy };
        ctx.beginPath();
        ctx.moveTo(a.cx, a.cy);
        ctx.lineTo(mid.x, mid.y);
        ctx.lineTo(b.cx, b.cy);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(a.cx, a.cy);
        ctx.lineTo(b.cx, b.cy);
        ctx.stroke();
      }
    }
  }
}

function renderSeamFlowTraces(ctx, hash, boundaryX) {
  const sHash = hash.slice(0, 2) + 'ft' + hash.slice(4);
  const rng = createRng(sHash);
  const pal = derivePalette(sHash);
  const noise = createNoise2D(initRandom(sHash));
  const num = 40 + Math.floor(rng.rnd(0, 30));

  for (let i = 0; i < num; i++) {
    let bx = rng.rnd(-SEAM * 0.7, SEAM * 0.7);
    let by = rng.rnd(0, SIZE);
    const color = rng.rndChoice(rng.next() < 0.5 ? pal.primary : pal.secondary);
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.3 + rng.rnd(0, 0.6);
    ctx.beginPath();
    ctx.moveTo(boundaryX + bx, by);

    for (let s = 0; s < 140; s++) {
      const n = fbm(noise, bx * 0.003, by * 0.003, 3);
      bx += Math.cos(n * Math.PI * 2) * 2;
      by += Math.sin(n * Math.PI * 2) * 2;
      const fade = Math.max(0, 1 - Math.abs(bx) / (SEAM * 1.3));
      ctx.globalAlpha = fade * 0.06;
      ctx.lineTo(boundaryX + bx, by);
      if (Math.abs(bx) > SEAM * 1.8 || by < -50 || by > SIZE + 50) break;
    }
    ctx.stroke();
  }
}

function renderSeam(ctx, hash, boundaryX) {
  ctx.save();
  ctx.lineCap = 'round';
  renderSeamFlowTraces(ctx, hash, boundaryX);
  renderSeamNodes(ctx, hash, boundaryX);
  ctx.restore();
}

// ─── Main ───

export function renderPiece(canvas, ownHash, leftHash) {
  const ctx = canvas.getContext('2d');
  canvas.width = SIZE;
  canvas.height = SIZE;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const field = createField(ownHash, leftHash);
  const palette = derivePalette(ownHash);
  const coreRng = createRng(ownHash);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  drawNebula(ctx, field, coreRng, palette);
  drawGridLines(ctx, field, coreRng, palette);
  drawFlowTraces(ctx, field, coreRng, palette);
  const nodes = drawNodes(ctx, field, coreRng, palette);
  drawTraces(ctx, field, coreRng, palette, nodes);

  // Seam layers
  if (leftHash) renderSeam(ctx, leftHash, 0);
  renderSeam(ctx, ownHash, SIZE);

  ctx.globalAlpha = 1;
}

export function generateFeatures(ownHash, leftHash) {
  const pal = derivePalette(ownHash);
  const constraint = createEdgeConstraint(ownHash);
  let total = 0;
  for (let y = 0; y < SIZE; y += SIZE / 10) total += Math.abs(constraint(y));
  const avg = total / 10;
  const tier = avg < 0.25 ? 'sparse' : avg < 0.4 ? 'balanced' : avg < 0.55 ? 'dense' : 'saturated';

  const rng = createRng(ownHash);
  const idx1 = rng.rndInt(0, PALETTES.length - 1);
  let idx2 = rng.rndInt(0, PALETTES.length - 2);
  if (idx2 >= idx1) idx2++;
  const names = ['cyan', 'magenta', 'mint', 'amber', 'violet', 'red'];

  return {
    density: tier,
    position: leftHash ? 'continuation' : 'origin',
    primaryColor: names[idx1],
    secondaryColor: names[idx2],
    edgeComplexity: Math.round(avg * 100),
  };
}
