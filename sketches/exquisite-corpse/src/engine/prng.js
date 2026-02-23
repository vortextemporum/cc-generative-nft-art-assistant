// sfc32 PRNG - deterministic random from hash
export function sfc32(a, b, c, d) {
  return function () {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export function initRandom(hashStr) {
  const seeds = [];
  for (let i = 0; i < 4; i++) {
    seeds.push(parseInt(hashStr.slice(2 + i * 8, 10 + i * 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

export function createRng(hashStr) {
  const next = initRandom(hashStr);
  return {
    next,
    rnd(min = 0, max = 1) { return min + next() * (max - min); },
    rndInt(min, max) { return Math.floor(min + next() * (max - min + 1)); },
    rndBool(p = 0.5) { return next() < p; },
    rndChoice(arr) { return arr[Math.floor(next() * arr.length)]; },
    rndGaussian(mean = 0, sd = 1) {
      const u1 = next(), u2 = next();
      return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    },
    shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
}

export function generateHash() {
  return '0x' + Array(64).fill(0).map(() =>
    '0123456789abcdef'[Math.floor(Math.random() * 16)]
  ).join('');
}
