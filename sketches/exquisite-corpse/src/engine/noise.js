// Seeded 2D Perlin noise implementation
const PERM_SIZE = 256;

function buildPermutation(rngFn) {
  const p = Array.from({ length: PERM_SIZE }, (_, i) => i);
  for (let i = PERM_SIZE - 1; i > 0; i--) {
    const j = Math.floor(rngFn() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return [...p, ...p]; // double for overflow
}

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a, b, t) { return a + t * (b - a); }

function grad(hash, x, y) {
  const h = hash & 3;
  return ((h & 1) === 0 ? x : -x) + ((h & 2) === 0 ? y : -y);
}

export function createNoise2D(rngFn) {
  const perm = buildPermutation(rngFn);

  return function noise(x, y) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);

    const aa = perm[perm[xi] + yi];
    const ab = perm[perm[xi] + yi + 1];
    const ba = perm[perm[xi + 1] + yi];
    const bb = perm[perm[xi + 1] + yi + 1];

    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v
    );
  };
}

export function fbm(noiseFn, x, y, octaves = 4, lacunarity = 2, gain = 0.5) {
  let value = 0, amplitude = 1, frequency = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noiseFn(x * frequency, y * frequency);
    max += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return value / max;
}
