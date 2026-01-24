/**
 * GENITAL FORMS v2.0.0 - Fantasy Variety Edition
 * Procedural generation of abstract anatomical & fantasy sculptures
 * Now with dragon scales, tentacles, multi-forms, and humorous touches!
 *
 * Controls:
 *   Drag - Rotate view
 *   Scroll - Zoom
 *   R - Regenerate
 *   S - Save PNG
 *   P - Toggle physics
 *   A - Toggle auto-rotate
 *   G - Toggle googly eyes
 */

// ============ HASH & RANDOM ============
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
  const h = hashStr.slice(2);
  const seeds = [];
  for (let i = 0; i < 4; i++) {
    seeds.push(parseInt(h.slice(i * 8, (i + 1) * 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

let R;
function rnd(min = 0, max = 1) { return R() * (max - min) + min; }
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rndChoice(arr) { return arr[Math.floor(R() * arr.length)]; }
function rndBool(p = 0.5) { return R() < p; }

// ============ IMPROVED NOISE ============
// Simplex-inspired noise for better organic shapes
function noise3D(x, y, z, seed) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 43.1234) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

function smoothNoise3D(x, y, z, seed) {
  const x0 = Math.floor(x), y0 = Math.floor(y), z0 = Math.floor(z);
  const fx = x - x0, fy = y - y0, fz = z - z0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const sz = fz * fz * (3 - 2 * fz);

  const n000 = noise3D(x0, y0, z0, seed);
  const n100 = noise3D(x0+1, y0, z0, seed);
  const n010 = noise3D(x0, y0+1, z0, seed);
  const n110 = noise3D(x0+1, y0+1, z0, seed);
  const n001 = noise3D(x0, y0, z0+1, seed);
  const n101 = noise3D(x0+1, y0, z0+1, seed);
  const n011 = noise3D(x0, y0+1, z0+1, seed);
  const n111 = noise3D(x0+1, y0+1, z0+1, seed);

  const nx00 = n000 + sx * (n100 - n000);
  const nx10 = n010 + sx * (n110 - n010);
  const nx01 = n001 + sx * (n101 - n001);
  const nx11 = n011 + sx * (n111 - n011);

  const nxy0 = nx00 + sy * (nx10 - nx00);
  const nxy1 = nx01 + sy * (nx11 - nx01);

  return nxy0 + sz * (nxy1 - nxy0);
}

function fbm3D(x, y, z, seed, octaves = 4) {
  let value = 0, amplitude = 0.5, frequency = 1, maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise3D(x * frequency, y * frequency, z * frequency, seed + i * 100);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / maxValue;
}

// Worley/cellular noise for scales
function worleyNoise(x, y, z, seed, scale = 1) {
  x *= scale; y *= scale; z *= scale;
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  let minDist = 999;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        const cx = xi + dx, cy = yi + dy, cz = zi + dz;
        const px = cx + noise3D(cx, cy, cz, seed) * 0.5 + 0.5;
        const py = cy + noise3D(cx + 100, cy, cz, seed) * 0.5 + 0.5;
        const pz = cz + noise3D(cx, cy + 100, cz, seed) * 0.5 + 0.5;
        const dist = Math.sqrt((x-px)**2 + (y-py)**2 + (z-pz)**2);
        minDist = Math.min(minDist, dist);
      }
    }
  }
  return minDist;
}

// ============ FORM TYPES (12 total!) ============
const FORM_TYPES = {
  // Original forms
  phallic: {
    name: 'Classic Shaft',
    rarity: 'common',
    category: 'anatomical',
    generate: (params, rng) => generatePhallicForm(params, rng)
  },
  vulvic: {
    name: 'Bloom Fold',
    rarity: 'common',
    category: 'anatomical',
    generate: (params, rng) => generateVulvicForm(params, rng)
  },
  intersex: {
    name: 'Spectrum Blend',
    rarity: 'rare',
    category: 'anatomical',
    generate: (params, rng) => generateIntersexForm(params, rng)
  },
  ambiguous: {
    name: 'Suggestive Blob',
    rarity: 'rare',
    category: 'anatomical',
    generate: (params, rng) => generateAmbiguousForm(params, rng)
  },
  abstract: {
    name: 'Twisted Dream',
    rarity: 'legendary',
    category: 'surreal',
    generate: (params, rng) => generateAbstractForm(params, rng)
  },
  morphic: {
    name: 'Shapeshifter',
    rarity: 'legendary',
    category: 'surreal',
    generate: (params, rng) => generateMorphicForm(params, rng)
  },

  // NEW Fantasy forms!
  draconic: {
    name: 'Dragon\'s Pride',
    rarity: 'rare',
    category: 'fantasy',
    generate: (params, rng) => generateDraconicForm(params, rng)
  },
  tentacular: {
    name: 'Kraken\'s Kiss',
    rarity: 'rare',
    category: 'fantasy',
    generate: (params, rng) => generateTentacularForm(params, rng)
  },
  hydra: {
    name: 'Many-Headed Beast',
    rarity: 'legendary',
    category: 'fantasy',
    generate: (params, rng) => generateHydraForm(params, rng)
  },
  knotted: {
    name: 'Love Knot',
    rarity: 'uncommon',
    category: 'fantasy',
    generate: (params, rng) => generateKnottedForm(params, rng)
  },
  alien: {
    name: 'Xenomorph Delight',
    rarity: 'legendary',
    category: 'fantasy',
    generate: (params, rng) => generateAlienForm(params, rng)
  },
  emoji: {
    name: 'Happy Ending',
    rarity: 'legendary',
    category: 'humorous',
    generate: (params, rng) => generateEmojiForm(params, rng)
  }
};

// ============ EXPANDED MATERIALS ============
const MATERIALS = {
  // Natural
  clay: { name: 'Clay', rarity: 'common', category: 'natural', props: { color: '#c4a882', metalness: 0.0, roughness: 0.9 } },
  ceramic: { name: 'Ceramic', rarity: 'common', category: 'natural', props: { color: '#f5f0e6', metalness: 0.1, roughness: 0.3 } },
  terracotta: { name: 'Terracotta', rarity: 'common', category: 'natural', props: { color: '#c45c3e', metalness: 0.0, roughness: 0.8 } },
  marble: { name: 'Marble', rarity: 'uncommon', category: 'natural', props: { color: '#f0ebe3', metalness: 0.1, roughness: 0.2 } },
  bronze: { name: 'Bronze', rarity: 'uncommon', category: 'natural', props: { color: '#cd7f32', metalness: 0.9, roughness: 0.4 } },
  jade: { name: 'Jade', rarity: 'uncommon', category: 'natural', props: { color: '#00a86b', metalness: 0.2, roughness: 0.3, transparent: true, opacity: 0.85 } },
  obsidian: { name: 'Obsidian', rarity: 'rare', category: 'natural', props: { color: '#1a1a1a', metalness: 0.3, roughness: 0.1 } },

  // Synthetic
  plastic: { name: 'Bubblegum Pink', rarity: 'common', category: 'synthetic', props: { color: '#ff69b4', metalness: 0.0, roughness: 0.4 } },
  rubber: { name: 'Midnight Rubber', rarity: 'common', category: 'synthetic', props: { color: '#2d2d2d', metalness: 0.0, roughness: 0.95 } },
  silicone: { name: 'Body Safe Silicone', rarity: 'uncommon', category: 'synthetic', props: { color: '#ffdbac', metalness: 0.0, roughness: 0.6 } },
  chrome: { name: 'Chrome Stallion', rarity: 'rare', category: 'synthetic', props: { color: '#c0c0c0', metalness: 1.0, roughness: 0.05 } },
  neon: { name: 'Rave Ready', rarity: 'rare', category: 'synthetic', props: { color: '#ff00ff', metalness: 0.0, roughness: 0.2, emissive: '#ff00ff', emissiveIntensity: 0.5 } },

  // Fantasy
  dragonScale: { name: 'Dragon Scale', rarity: 'rare', category: 'fantasy', props: { color: '#2d5a27', metalness: 0.6, roughness: 0.3 } },
  tentaclePurple: { name: 'Deep Sea Purple', rarity: 'rare', category: 'fantasy', props: { color: '#4a1a6b', metalness: 0.2, roughness: 0.5 } },
  alienGreen: { name: 'Xenomorph Slime', rarity: 'legendary', category: 'fantasy', props: { color: '#7fff00', metalness: 0.3, roughness: 0.4, emissive: '#2f5f00', emissiveIntensity: 0.3 } },
  lavaCore: { name: 'Molten Core', rarity: 'legendary', category: 'fantasy', props: { color: '#ff4500', metalness: 0.4, roughness: 0.6, emissive: '#ff2200', emissiveIntensity: 0.6 } },
  iceBlue: { name: 'Frost Giant', rarity: 'rare', category: 'fantasy', props: { color: '#a0d8ef', metalness: 0.1, roughness: 0.2, transparent: true, opacity: 0.8 } },

  // Surreal
  glass: { name: 'Glass Dildo', rarity: 'rare', category: 'surreal', props: { color: '#ffffff', metalness: 0.0, roughness: 0.0, transparent: true, opacity: 0.4 } },
  liquid: { name: 'Mercury Dreams', rarity: 'legendary', category: 'surreal', props: { color: '#4169e1', metalness: 0.3, roughness: 0.0, transparent: true, opacity: 0.7 } },
  galaxy: { name: 'Cosmic Void', rarity: 'legendary', category: 'surreal', props: { color: '#1a0033', metalness: 0.5, roughness: 0.3 } },
  iridescent: { name: 'Unicorn Horn', rarity: 'legendary', category: 'surreal', props: { color: '#e0b0ff', metalness: 0.8, roughness: 0.2 } },
  flesh: { name: 'Realistic Flesh', rarity: 'uncommon', category: 'surreal', props: { color: '#e8beac', metalness: 0.0, roughness: 0.7 } },

  // Humorous
  rainbow: { name: 'Pride Parade', rarity: 'rare', category: 'humorous', props: { color: '#ff69b4', metalness: 0.3, roughness: 0.3, isRainbow: true } },
  goldDildo: { name: '24K Gold Member', rarity: 'legendary', category: 'humorous', props: { color: '#ffd700', metalness: 1.0, roughness: 0.2 } },
  gummyBear: { name: 'Gummy Goodness', rarity: 'rare', category: 'humorous', props: { color: '#ff6b6b', metalness: 0.0, roughness: 0.4, transparent: true, opacity: 0.7 } }
};

// ============ RENDER STYLES ============
const RENDER_STYLES = {
  smooth: { name: 'Smooth Operator', rarity: 'common', flatShading: false, wireframe: false },
  lowPoly: { name: 'PS1 Aesthetic', rarity: 'common', flatShading: true, wireframe: false },
  wireframe: { name: 'Blueprint', rarity: 'uncommon', flatShading: false, wireframe: true },
  faceted: { name: 'Crystalline', rarity: 'uncommon', flatShading: true, wireframe: false, segments: 12 },
  organic: { name: 'Organic Flow', rarity: 'rare', flatShading: false, wireframe: false, displacement: true },
  subsurface: { name: 'Skin Deep', rarity: 'rare', flatShading: false, wireframe: false, subsurface: true }
};

// ============ BACKGROUND PALETTES ============
const BACKGROUNDS = {
  void: { name: 'The Void', colors: ['#0a0a0f', '#1a1a2e'], rarity: 'common' },
  flesh: { name: 'Flesh Tone', colors: ['#2d1f1f', '#4a3333'], rarity: 'common' },
  clinical: { name: 'Clinical White', colors: ['#1a2a2a', '#2a3a3a'], rarity: 'common' },
  warm: { name: 'Warm Embrace', colors: ['#2d1a0a', '#4a2d1a'], rarity: 'uncommon' },
  cool: { name: 'Cool Reception', colors: ['#0a1a2d', '#1a2d4a'], rarity: 'uncommon' },
  surreal: { name: 'Dream State', colors: ['#1a0a2d', '#2d1a4a'], rarity: 'rare' },
  neon: { name: 'Neon Nights', colors: ['#0a0a1a', '#1a0a2a'], rarity: 'rare' },
  cosmic: { name: 'Cosmic Background', colors: ['#000011', '#110022'], rarity: 'legendary' },
  dungeon: { name: 'Dungeon Vibes', colors: ['#1a0a0a', '#2a1010'], rarity: 'rare' },
  underwater: { name: 'Deep Sea', colors: ['#001a2a', '#002a3a'], rarity: 'rare' }
};

// ============ SPECIAL TRAITS ============
const SPECIAL_TRAITS = {
  googlyEyes: { name: 'Googly Eyes', probability: 0.08, description: 'Comically googly eyes added' },
  glitter: { name: 'Glitter Bomb', probability: 0.1, description: 'Sparkles everywhere' },
  rainbow: { name: 'Rainbow Mode', probability: 0.05, description: 'Full spectrum coloring' },
  veiny: { name: 'Extra Veiny', probability: 0.15, description: 'Pronounced surface veins' },
  ribbed: { name: 'Ribbed', probability: 0.12, description: 'Pleasure ridges' },
  glow: { name: 'Glow in Dark', probability: 0.07, description: 'Luminescent in low light' },
  size: { name: 'Comically Large', probability: 0.05, description: 'Absurdly oversized' }
};

// ============ GEOMETRY GENERATORS ============

function generatePhallicForm(params, rng) {
  const geometry = new THREE.BufferGeometry();
  const segments = params.segments || 32;
  const rings = params.rings || 24;

  const length = 1.0 + rng() * 0.6;
  const baseRadius = 0.15 + rng() * 0.1;
  const tipRadius = baseRadius * (0.3 + rng() * 0.4);
  const curve = (rng() - 0.5) * 0.3;
  const twist = rng() * 0.2;
  const veininess = params.traits?.veiny ? 1 : rng();
  const circumcised = rng() > 0.5;
  const ribbed = params.traits?.ribbed;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const y = t * length - length * 0.3;

    let radius;
    if (t < 0.7) {
      radius = baseRadius * (1 + 0.1 * Math.sin(t * Math.PI * 2));
      if (ribbed) {
        radius += Math.sin(t * Math.PI * 12) * 0.015;
      }
    } else if (t < 0.85) {
      const glansT = (t - 0.7) / 0.15;
      radius = baseRadius * (1.1 - glansT * 0.3);
      if (!circumcised && glansT < 0.3) {
        radius *= 1.1;
      }
    } else {
      const tipT = (t - 0.85) / 0.15;
      radius = tipRadius + (baseRadius * 0.8 - tipRadius) * (1 - tipT);
      radius *= 1 - tipT * 0.5;
    }

    const curveOffset = curve * Math.sin(t * Math.PI);
    const twistAngle = twist * t * Math.PI * 2;

    for (let seg = 0; seg <= segments; seg++) {
      const theta = (seg / segments) * Math.PI * 2 + twistAngle;

      let localRadius = radius;
      if (veininess > 0.3 && t < 0.7) {
        const vein1 = Math.max(0, Math.sin(theta * 3 + t * 5) * 0.03 * veininess);
        const vein2 = Math.max(0, Math.sin(theta * 5 - t * 3) * 0.02 * veininess);
        localRadius += vein1 + vein2;
      }

      if (params.displacement) {
        localRadius += fbm3D(theta, t * 3, params.seed, params.seed, 3) * 0.02;
      }

      const x = Math.cos(theta) * localRadius + curveOffset;
      const z = Math.sin(theta) * localRadius;

      positions.push(x, y, z);

      const nx = Math.cos(theta);
      const ny = 0.1;
      const nz = Math.sin(theta);
      const nl = Math.sqrt(nx*nx + ny*ny + nz*nz);
      normals.push(nx/nl, ny/nl, nz/nl);

      uvs.push(seg / segments, t);
    }
  }

  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const a = ring * (segments + 1) + seg;
      const b = a + segments + 1;
      const c = a + 1;
      const d = b + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const testiclePositions = generateTesticles(baseRadius, length, rng, params);

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return { main: geometry, extras: testiclePositions };
}

function generateTesticles(baseRadius, shaftLength, rng, params) {
  const testicles = [];
  const size1 = baseRadius * (1.5 + rng() * 0.5);
  const size2 = baseRadius * (1.4 + rng() * 0.6);
  const spread = baseRadius * (1.5 + rng() * 0.5);
  const drop = shaftLength * 0.3 + rng() * 0.1;

  testicles.push({
    position: [-spread * 0.5, -drop, 0],
    scale: [size1, size1 * (1.1 + rng() * 0.2), size1],
    type: 'sphere'
  });

  testicles.push({
    position: [spread * 0.5, -drop - rng() * 0.1, 0],
    scale: [size2, size2 * (1.1 + rng() * 0.2), size2],
    type: 'sphere'
  });

  return testicles;
}

function generateVulvicForm(params, rng) {
  const geometry = new THREE.BufferGeometry();
  const segments = params.segments || 32;
  const rings = params.rings || 20;

  const height = 0.8 + rng() * 0.4;
  const width = 0.3 + rng() * 0.2;
  const depth = 0.15 + rng() * 0.1;
  const labiaSize = 0.5 + rng() * 0.5;
  const clitSize = 0.05 + rng() * 0.05;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const y = (t - 0.5) * height;

    for (let seg = 0; seg <= segments; seg++) {
      const s = seg / segments;
      const theta = s * Math.PI * 2;

      let radius = width * (0.8 + 0.2 * Math.cos(theta * 2));
      const taper = 1 - Math.pow(Math.abs(t - 0.5) * 2, 2) * 0.5;
      radius *= taper;

      const cleft = Math.max(0, Math.cos(theta)) * depth * labiaSize;

      if (params.displacement) {
        radius += fbm3D(theta, t * 2, params.seed, params.seed, 3) * 0.03;
      }

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius * 0.5 - cleft;

      positions.push(x, y, z);

      const nx = Math.cos(theta);
      const nz = Math.sin(theta);
      normals.push(nx, 0, nz);

      uvs.push(s, t);
    }
  }

  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const a = ring * (segments + 1) + seg;
      const b = a + segments + 1;
      const c = a + 1;
      const d = b + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const extras = [];
  extras.push({
    position: [0, height * 0.35, -depth * 0.5],
    scale: [clitSize, clitSize * 0.8, clitSize],
    type: 'sphere'
  });

  extras.push({
    position: [width * 0.15, 0, -depth * 0.3],
    scale: [0.02, height * 0.3, 0.03],
    type: 'box'
  });
  extras.push({
    position: [-width * 0.15, 0, -depth * 0.3],
    scale: [0.02, height * 0.3, 0.03],
    type: 'box'
  });

  return { main: geometry, extras };
}

function generateIntersexForm(params, rng) {
  const blend = 0.3 + rng() * 0.4;
  const geometry = new THREE.BufferGeometry();
  const segments = params.segments || 32;
  const rings = params.rings || 24;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const length = 0.3 + blend * 0.7;
  const width = 0.25 - blend * 0.1;
  const baseRadius = 0.12 + blend * 0.08;

  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const y = t * length - length * 0.2;

    for (let seg = 0; seg <= segments; seg++) {
      const theta = (seg / segments) * Math.PI * 2;

      const phallicRadius = baseRadius * (1 - t * 0.3);
      const vulvicRadius = width * (0.8 + 0.2 * Math.cos(theta * 2)) * (1 - Math.pow(t - 0.5, 2));

      let radius = phallicRadius * blend + vulvicRadius * (1 - blend);

      if (params.displacement) {
        radius += fbm3D(theta, t * 2, params.seed, params.seed, 3) * 0.02;
      }

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius * (0.7 + blend * 0.3);

      positions.push(x, y, z);
      normals.push(Math.cos(theta), 0.1, Math.sin(theta));
      uvs.push(seg / segments, t);
    }
  }

  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const a = ring * (segments + 1) + seg;
      const b = a + segments + 1;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return { main: geometry, extras: [] };
}

function generateAmbiguousForm(params, rng) {
  const geometry = new THREE.BufferGeometry();
  const detail = params.segments || 32;

  const positions = [];
  const normals = [];
  const indices = [];

  const phi = (1 + Math.sqrt(5)) / 2;
  const baseVerts = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
  ];

  baseVerts.forEach((v, i) => {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    v[0] /= len; v[1] /= len; v[2] /= len;

    const disp = 0.3 + fbm3D(v[0]*2, v[1]*2, v[2]*2, params.seed, 4) * 0.4;

    const bulge1 = Math.max(0, 1 - Math.sqrt((v[0]-0.3)**2 + (v[1]-0.5)**2 + v[2]**2) * 2) * 0.3;
    const bulge2 = Math.max(0, 1 - Math.sqrt((v[0]+0.3)**2 + (v[1]-0.5)**2 + v[2]**2) * 2) * 0.2;
    const bulge3 = Math.max(0, 1 - Math.sqrt(v[0]**2 + (v[1]+0.5)**2 + v[2]**2) * 1.5) * 0.4;

    const scale = 0.5 + disp + bulge1 + bulge2 + bulge3;
    positions.push(v[0] * scale, v[1] * scale, v[2] * scale);
    normals.push(v[0], v[1], v[2]);
  });

  const faces = [
    [0,11,5], [0,5,1], [0,1,7], [0,7,10], [0,10,11],
    [1,5,9], [5,11,4], [11,10,2], [10,7,6], [7,1,8],
    [3,9,4], [3,4,2], [3,2,6], [3,6,8], [3,8,9],
    [4,9,5], [2,4,11], [6,2,10], [8,6,7], [9,8,1]
  ];

  faces.forEach(f => indices.push(...f));

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions.flat(), 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals.flat(), 3));
  geometry.setIndex(indices);

  return { main: geometry, extras: [] };
}

function generateAbstractForm(params, rng) {
  const geometry = new THREE.BufferGeometry();
  const segments = params.segments || 24;
  const rings = params.rings || 16;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const height = 1.5;
  const baseScale = 0.4;

  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const y = (t - 0.5) * height;

    const twist = t * Math.PI * 2 * (1 + rng());
    const morph = Math.sin(t * Math.PI);

    for (let seg = 0; seg <= segments; seg++) {
      const theta = (seg / segments) * Math.PI * 2 + twist;

      let radius = baseScale * morph;
      radius *= 1 + 0.3 * Math.sin(theta * 2 + t * 4);
      radius *= 1 + 0.2 * Math.cos(theta * 3 - t * 2);

      radius += fbm3D(theta, t * 3, params.seed, params.seed, 5) * 0.15;

      radius = Math.max(0.02, radius);

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      positions.push(x, y, z);
      normals.push(Math.cos(theta), 0, Math.sin(theta));
      uvs.push(seg / segments, t);
    }
  }

  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const a = ring * (segments + 1) + seg;
      const b = a + segments + 1;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return { main: geometry, extras: [] };
}

function generateMorphicForm(params, rng) {
  const phase = rng() * Math.PI * 2;
  const formA = generatePhallicForm(params, () => rng());
  const formB = generateVulvicForm(params, () => rng());

  const blend = (Math.sin(phase) + 1) / 2;

  if (blend > 0.5) {
    return formA;
  } else {
    return formB;
  }
}

// ============ NEW FANTASY FORM GENERATORS ============

function generateDraconicForm(params, rng) {
  // Dragon-textured phallic form with scales, ridges, and a knot
  const geometry = new THREE.BufferGeometry();
  const segments = params.segments || 36;
  const rings = params.rings || 32;

  const length = 1.2 + rng() * 0.4;
  const baseRadius = 0.12 + rng() * 0.08;
  const tipRadius = baseRadius * 0.4;
  const knotPosition = 0.15 + rng() * 0.1; // Position of the knot from base
  const knotSize = 1.3 + rng() * 0.4; // How much bigger the knot is
  const ridgeCount = 3 + Math.floor(rng() * 3);
  const scaleIntensity = 0.3 + rng() * 0.4;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const y = t * length - length * 0.2;

    // Base radius profile
    let radius = baseRadius;

    // Tapered shaft with tip
    if (t < 0.1) {
      // Base
      radius = baseRadius * (0.9 + t * 1);
    } else if (t < knotPosition + 0.1) {
      // Knot bulge
      const knotT = (t - 0.1) / knotPosition;
      const knotBulge = Math.sin(knotT * Math.PI) * (knotSize - 1);
      radius = baseRadius * (1 + knotBulge);
    } else if (t < 0.85) {
      // Main shaft with slight taper
      const shaftT = (t - knotPosition - 0.1) / (0.85 - knotPosition - 0.1);
      radius = baseRadius * (1 - shaftT * 0.15);
    } else {
      // Pointed tip
      const tipT = (t - 0.85) / 0.15;
      radius = baseRadius * 0.85 * (1 - tipT * 0.7);
    }

    // Add ridges along the length
    const ridgeEffect = Math.sin(t * Math.PI * ridgeCount * 2) * 0.02 * (1 - t);

    for (let seg = 0; seg <= segments; seg++) {
      const theta = (seg / segments) * Math.PI * 2;

      let localRadius = radius + ridgeEffect;

      // Scale texture using Worley noise
      const scalePattern = worleyNoise(theta / Math.PI, t * 4, params.seed, params.seed, 3);
      localRadius += scalePattern * scaleIntensity * 0.03 * (1 - t * 0.5);

      // Add some organic variation
      localRadius += fbm3D(theta, t * 3, params.seed, params.seed, 3) * 0.015;

      // Slight curve
      const curve = Math.sin(t * Math.PI) * 0.1 * (rng() - 0.5);

      const x = Math.cos(theta) * localRadius + curve;
      const z = Math.sin(theta) * localRadius;

      positions.push(x, y, z);

      const nx = Math.cos(theta);
      const ny = 0.1;
      const nz = Math.sin(theta);
      const nl = Math.sqrt(nx*nx + ny*ny + nz*nz);
      normals.push(nx/nl, ny/nl, nz/nl);

      uvs.push(seg / segments, t);
    }
  }

  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const a = ring * (segments + 1) + seg;
      const b = a + segments + 1;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Optional: Add spines/ridges as extras
  const extras = [];
  const spineCount = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < spineCount; i++) {
    const spineT = 0.3 + rng() * 0.4;
    const spineAngle = rng() * Math.PI * 2;
    extras.push({
      position: [
        Math.cos(spineAngle) * baseRadius * 1.1,
        spineT * length - length * 0.2,
        Math.sin(spineAngle) * baseRadius * 1.1
      ],
      scale: [0.02, 0.08, 0.02],
      type: 'box',
      rotation: [0, 0, Math.PI * 0.1]
    });
  }

  return { main: geometry, extras };
}

function generateTentacularForm(params, rng) {
  // Octopus-inspired tentacle with suckers
  const geometry = new THREE.BufferGeometry();
  const segments = params.segments || 32;
  const rings = params.rings || 40;

  const length = 1.5 + rng() * 0.5;
  const baseRadius = 0.18 + rng() * 0.08;
  const tipRadius = 0.02;
  const taperPower = 1.5 + rng() * 0.5;
  const waveFreq = 2 + rng() * 2;
  const waveAmp = 0.15 + rng() * 0.1;
  const suckerSide = rng() > 0.5 ? 1 : -1; // Which side has suckers

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const y = t * length - length * 0.3;

    // Tapered radius
    const taper = Math.pow(1 - t, 1 / taperPower);
    let radius = tipRadius + (baseRadius - tipRadius) * taper;

    // Wavy motion
    const waveX = Math.sin(t * Math.PI * waveFreq) * waveAmp * t;
    const waveZ = Math.cos(t * Math.PI * waveFreq * 0.7) * waveAmp * 0.5 * t;

    for (let seg = 0; seg <= segments; seg++) {
      const theta = (seg / segments) * Math.PI * 2;

      let localRadius = radius;

      // Sucker indentations on one side
      const suckerT = Math.sin(theta - Math.PI * 0.5 * suckerSide);
      if (suckerT > 0.7 && t > 0.1 && t < 0.9) {
        const suckerDepth = Math.sin(t * Math.PI * 15) * 0.02 * suckerT;
        localRadius -= Math.max(0, suckerDepth);
      }

      // Organic variation
      localRadius += fbm3D(theta, t * 5, params.seed, params.seed, 3) * 0.01;

      const x = Math.cos(theta) * localRadius + waveX;
      const z = Math.sin(theta) * localRadius + waveZ;

      positions.push(x, y, z);

      const nx = Math.cos(theta);
      const nz = Math.sin(theta);
      normals.push(nx, 0.1, nz);

      uvs.push(seg / segments, t);
    }
  }

  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const a = ring * (segments + 1) + seg;
      const b = a + segments + 1;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Add sucker spheres as extras
  const extras = [];
  const suckerCount = 8 + Math.floor(rng() * 6);
  for (let i = 0; i < suckerCount; i++) {
    const suckerT = 0.15 + (i / suckerCount) * 0.7;
    const taper = Math.pow(1 - suckerT, 1 / taperPower);
    const r = tipRadius + (baseRadius - tipRadius) * taper;
    const suckerSize = r * (0.3 + rng() * 0.2);

    const waveX = Math.sin(suckerT * Math.PI * waveFreq) * waveAmp * suckerT;
    const waveZ = Math.cos(suckerT * Math.PI * waveFreq * 0.7) * waveAmp * 0.5 * suckerT;

    extras.push({
      position: [
        waveX + Math.cos(Math.PI * 0.5 * suckerSide) * r * 0.9,
        suckerT * length - length * 0.3,
        waveZ + Math.sin(Math.PI * 0.5 * suckerSide) * r * 0.9
      ],
      scale: [suckerSize, suckerSize * 0.5, suckerSize],
      type: 'sphere'
    });
  }

  return { main: geometry, extras };
}

function generateHydraForm(params, rng) {
  // Multi-headed form - branches into 2-4 tips
  const geometry = new THREE.BufferGeometry();
  const segments = params.segments || 28;
  const rings = params.rings || 24;

  const headCount = 2 + Math.floor(rng() * 3); // 2-4 heads
  const length = 0.8 + rng() * 0.3;
  const baseRadius = 0.2 + rng() * 0.1;
  const splitPoint = 0.4 + rng() * 0.2; // Where it splits

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Generate main trunk
  for (let ring = 0; ring <= rings * splitPoint; ring++) {
    const t = ring / (rings * splitPoint);
    const y = t * length * splitPoint - length * 0.2;

    const radius = baseRadius * (1 + 0.1 * Math.sin(t * Math.PI));

    for (let seg = 0; seg <= segments; seg++) {
      const theta = (seg / segments) * Math.PI * 2;

      let localRadius = radius;
      localRadius += fbm3D(theta, t * 2, params.seed, params.seed, 3) * 0.02;

      const x = Math.cos(theta) * localRadius;
      const z = Math.sin(theta) * localRadius;

      positions.push(x, y, z);
      normals.push(Math.cos(theta), 0.1, Math.sin(theta));
      uvs.push(seg / segments, t * splitPoint);
    }
  }

  const trunkRings = Math.floor(rings * splitPoint) + 1;

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  // Generate indices for trunk
  for (let ring = 0; ring < trunkRings - 1; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const a = ring * (segments + 1) + seg;
      const b = a + segments + 1;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Generate heads as separate geometries in extras
  const extras = [];
  const headLength = length * (1 - splitPoint) * 0.8;
  const headRadius = baseRadius * 0.5;

  for (let h = 0; h < headCount; h++) {
    const angle = (h / headCount) * Math.PI * 2 + rng() * 0.3;
    const spread = 0.15 + rng() * 0.1;

    const headGeom = new THREE.CylinderGeometry(
      headRadius * 0.3, // top
      headRadius,       // bottom
      headLength,
      16,
      8
    );

    // Create a tapered cylinder for each head
    extras.push({
      position: [
        Math.cos(angle) * spread,
        length * splitPoint - length * 0.2 + headLength * 0.5,
        Math.sin(angle) * spread
      ],
      scale: [1, 1, 1],
      type: 'cylinder',
      customGeometry: headGeom,
      rotation: [
        Math.sin(angle) * 0.3,
        0,
        -Math.cos(angle) * 0.3
      ]
    });

    // Add a tip/glans to each head
    extras.push({
      position: [
        Math.cos(angle) * (spread + 0.05),
        length * splitPoint - length * 0.2 + headLength + headRadius * 0.3,
        Math.sin(angle) * (spread + 0.05)
      ],
      scale: [headRadius * 0.5, headRadius * 0.4, headRadius * 0.5],
      type: 'sphere'
    });
  }

  return { main: geometry, extras };
}

function generateKnottedForm(params, rng) {
  // Dog/wolf style with pronounced knot at base
  const geometry = new THREE.BufferGeometry();
  const segments = params.segments || 32;
  const rings = params.rings || 28;

  const length = 1.0 + rng() * 0.4;
  const baseRadius = 0.1 + rng() * 0.05;
  const knotRadius = baseRadius * (2.0 + rng() * 1.0);
  const knotLength = 0.15 + rng() * 0.1;
  const tipTaper = 0.5 + rng() * 0.3;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const y = t * length - length * 0.15;

    let radius;

    if (t < knotLength) {
      // Knot at base - smooth bulge
      const knotT = t / knotLength;
      const knotProfile = Math.sin(knotT * Math.PI);
      radius = baseRadius + (knotRadius - baseRadius) * knotProfile;
    } else if (t < knotLength + 0.1) {
      // Transition from knot to shaft
      const transT = (t - knotLength) / 0.1;
      radius = baseRadius * (1.5 - transT * 0.5);
    } else if (t < 0.85) {
      // Main shaft
      radius = baseRadius;
    } else {
      // Tapered pointed tip
      const tipT = (t - 0.85) / 0.15;
      radius = baseRadius * (1 - tipT * tipTaper);
    }

    // Add subtle ridges
    if (t > knotLength && t < 0.85) {
      radius += Math.sin(t * Math.PI * 8) * 0.008;
    }

    for (let seg = 0; seg <= segments; seg++) {
      const theta = (seg / segments) * Math.PI * 2;

      let localRadius = radius;
      localRadius += fbm3D(theta, t * 3, params.seed, params.seed, 3) * 0.01;

      const x = Math.cos(theta) * localRadius;
      const z = Math.sin(theta) * localRadius;

      positions.push(x, y, z);
      normals.push(Math.cos(theta), 0.1, Math.sin(theta));
      uvs.push(seg / segments, t);
    }
  }

  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const a = ring * (segments + 1) + seg;
      const b = a + segments + 1;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return { main: geometry, extras: [] };
}

function generateAlienForm(params, rng) {
  // Truly weird bio-organic alien form
  const geometry = new THREE.BufferGeometry();
  const segments = params.segments || 32;
  const rings = params.rings || 32;

  const length = 1.2 + rng() * 0.5;
  const baseRadius = 0.15 + rng() * 0.1;
  const bulgeCount = 2 + Math.floor(rng() * 4);
  const spiralTwist = 1 + rng() * 2;
  const weirdness = 0.5 + rng() * 0.5;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const y = t * length - length * 0.3;

    // Irregular profile with multiple bulges
    let radius = baseRadius;
    for (let b = 0; b < bulgeCount; b++) {
      const bulgePos = (b + 0.5) / bulgeCount;
      const bulgeDist = Math.abs(t - bulgePos);
      if (bulgeDist < 0.15) {
        radius += (0.15 - bulgeDist) * baseRadius * weirdness;
      }
    }

    // Spiral twist increases along length
    const twist = t * Math.PI * spiralTwist;

    for (let seg = 0; seg <= segments; seg++) {
      const theta = (seg / segments) * Math.PI * 2 + twist;

      let localRadius = radius;

      // Asymmetric cross-section
      localRadius *= 1 + 0.2 * Math.sin(theta * 3) * weirdness;
      localRadius *= 1 + 0.15 * Math.cos(theta * 2 + t * 4) * weirdness;

      // Noise displacement
      localRadius += fbm3D(theta, t * 4, params.seed, params.seed, 4) * 0.04 * weirdness;

      // Bio-mechanical ridges
      const ridges = Math.max(0, Math.sin(theta * 6 + t * 8)) * 0.02;
      localRadius += ridges;

      const x = Math.cos(theta) * localRadius;
      const z = Math.sin(theta) * localRadius;

      positions.push(x, y, z);
      normals.push(Math.cos(theta), 0.1, Math.sin(theta));
      uvs.push(seg / segments, t);
    }
  }

  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const a = ring * (segments + 1) + seg;
      const b = a + segments + 1;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Add alien appendages
  const extras = [];
  const appendageCount = 1 + Math.floor(rng() * 3);
  for (let i = 0; i < appendageCount; i++) {
    const appT = 0.3 + rng() * 0.4;
    const appAngle = rng() * Math.PI * 2;
    extras.push({
      position: [
        Math.cos(appAngle) * baseRadius * 1.5,
        appT * length - length * 0.3,
        Math.sin(appAngle) * baseRadius * 1.5
      ],
      scale: [0.03, 0.15 + rng() * 0.1, 0.03],
      type: 'sphere'
    });
  }

  return { main: geometry, extras };
}

function generateEmojiForm(params, rng) {
  // Humorous form with a face!
  // Start with a basic phallic form
  const base = generatePhallicForm(params, rng);

  // The eyes and smile will be added as extras
  const extras = [...(base.extras || [])];

  // Add googly eyes near the top
  const eyeSize = 0.05 + rng() * 0.03;
  const eyeSpread = 0.08;
  const eyeHeight = 0.3; // Near the "head"

  // Left eye white
  extras.push({
    position: [-eyeSpread, eyeHeight, 0.12],
    scale: [eyeSize, eyeSize, eyeSize * 0.5],
    type: 'sphere',
    isEyeWhite: true
  });
  // Left pupil
  extras.push({
    position: [-eyeSpread + rng() * 0.02, eyeHeight + rng() * 0.02, 0.14],
    scale: [eyeSize * 0.5, eyeSize * 0.5, eyeSize * 0.3],
    type: 'sphere',
    isPupil: true
  });

  // Right eye white
  extras.push({
    position: [eyeSpread, eyeHeight, 0.12],
    scale: [eyeSize, eyeSize, eyeSize * 0.5],
    type: 'sphere',
    isEyeWhite: true
  });
  // Right pupil
  extras.push({
    position: [eyeSpread + rng() * 0.02, eyeHeight + rng() * 0.02, 0.14],
    scale: [eyeSize * 0.5, eyeSize * 0.5, eyeSize * 0.3],
    type: 'sphere',
    isPupil: true
  });

  // Smile/expression
  const smileType = Math.floor(rng() * 4);
  if (smileType === 0) {
    // Happy smile - curved line represented by small boxes
    for (let i = -2; i <= 2; i++) {
      extras.push({
        position: [i * 0.025, 0.15 - Math.abs(i) * 0.01, 0.13],
        scale: [0.015, 0.008, 0.008],
        type: 'box',
        isSmile: true
      });
    }
  } else if (smileType === 1) {
    // Surprised O
    extras.push({
      position: [0, 0.12, 0.13],
      scale: [0.03, 0.04, 0.02],
      type: 'sphere',
      isSmile: true
    });
  } else if (smileType === 2) {
    // Wink - one eye closed
    extras[0].scale[1] *= 0.3; // Squish left eye
    extras[1].position[1] -= 0.02; // Move pupil
  }
  // Type 3: neutral/no mouth

  return { main: base.main, extras, isEmoji: true };
}

// ============ BACKGROUND GENERATOR ============
function generateBackground(palette, rng) {
  const colors = BACKGROUNDS[palette].colors;
  const baseColor = new THREE.Color(colors[0]);
  const accentColor = new THREE.Color(colors[1]);

  const h = { h: 0, s: 0, l: 0 };
  baseColor.getHSL(h);
  h.h += (rng() - 0.5) * 0.05;
  h.s += (rng() - 0.5) * 0.1;
  baseColor.setHSL(h.h, Math.max(0, Math.min(1, h.s)), h.l);

  return baseColor;
}

// ============ FEATURES ============
let features = {};

function generateFeatures() {
  R = initRandom(hash);

  // Form type selection with new categories
  const formTypes = Object.keys(FORM_TYPES);
  const formWeights = formTypes.map(f => {
    const rarity = FORM_TYPES[f].rarity;
    return rarity === 'legendary' ? 0.04 : rarity === 'rare' ? 0.10 : rarity === 'uncommon' ? 0.18 : 0.34;
  });
  const formTotal = formWeights.reduce((a, b) => a + b, 0);
  let roll = R() * formTotal;
  let formType = formTypes[0];
  for (let i = 0; i < formTypes.length; i++) {
    roll -= formWeights[i];
    if (roll <= 0) { formType = formTypes[i]; break; }
  }

  // Material selection
  const materialTypes = Object.keys(MATERIALS);
  const matWeights = materialTypes.map(m => {
    const rarity = MATERIALS[m].rarity;
    return rarity === 'legendary' ? 0.02 : rarity === 'rare' ? 0.06 : rarity === 'uncommon' ? 0.12 : 0.30;
  });
  const matTotal = matWeights.reduce((a, b) => a + b, 0);
  roll = R() * matTotal;
  let materialType = materialTypes[0];
  for (let i = 0; i < materialTypes.length; i++) {
    roll -= matWeights[i];
    if (roll <= 0) { materialType = materialTypes[i]; break; }
  }

  // Render style
  const styleTypes = Object.keys(RENDER_STYLES);
  const styleWeights = styleTypes.map(s => {
    const rarity = RENDER_STYLES[s].rarity;
    return rarity === 'rare' ? 0.1 : rarity === 'uncommon' ? 0.2 : 0.35;
  });
  const styleTotal = styleWeights.reduce((a, b) => a + b, 0);
  roll = R() * styleTotal;
  let renderStyle = styleTypes[0];
  for (let i = 0; i < styleTypes.length; i++) {
    roll -= styleWeights[i];
    if (roll <= 0) { renderStyle = styleTypes[i]; break; }
  }

  // Background
  const bgTypes = Object.keys(BACKGROUNDS);
  const bgWeights = bgTypes.map(b => {
    const rarity = BACKGROUNDS[b].rarity;
    return rarity === 'legendary' ? 0.04 : rarity === 'rare' ? 0.08 : rarity === 'uncommon' ? 0.16 : 0.26;
  });
  const bgTotal = bgWeights.reduce((a, b) => a + b, 0);
  roll = R() * bgTotal;
  let background = bgTypes[0];
  for (let i = 0; i < bgTypes.length; i++) {
    roll -= bgWeights[i];
    if (roll <= 0) { background = bgTypes[i]; break; }
  }

  // Composition
  const compositionRoll = R();
  let composition = 'Single';
  if (compositionRoll < 0.03) {
    composition = 'Triple Threat';
  } else if (compositionRoll < 0.08) {
    composition = 'Paired';
  }

  // Special traits
  const traits = {};
  Object.keys(SPECIAL_TRAITS).forEach(trait => {
    if (R() < SPECIAL_TRAITS[trait].probability) {
      traits[trait] = true;
    }
  });

  // Size variation - can be comically large
  let scale = 0.7 + R() * 0.6;
  if (traits.size) {
    scale *= 1.5 + R() * 0.5; // 50-100% larger!
  }

  // Physics enabled by default for some materials
  const physicsDefault = ['silicone', 'rubber', 'flesh', 'liquid', 'gummyBear'].includes(materialType);

  // Calculate rarity score
  const rarityPoints = {
    legendary: 4,
    rare: 3,
    uncommon: 2,
    common: 1
  };

  const rarityScore = (
    (rarityPoints[FORM_TYPES[formType].rarity] || 1) +
    (rarityPoints[MATERIALS[materialType].rarity] || 1) +
    (rarityPoints[RENDER_STYLES[renderStyle].rarity] || 1) +
    (composition === 'Triple Threat' ? 5 : composition === 'Paired' ? 3 : 0) +
    Object.keys(traits).length * 2
  );

  const overallRarity = rarityScore >= 12 ? 'Legendary' : rarityScore >= 8 ? 'Rare' : rarityScore >= 5 ? 'Uncommon' : 'Common';

  const bgColor = generateBackground(background, R);

  features = {
    formType,
    formName: FORM_TYPES[formType].name,
    formCategory: FORM_TYPES[formType].category,
    materialType,
    materialName: MATERIALS[materialType].name,
    materialCategory: MATERIALS[materialType].category,
    renderStyle,
    renderStyleName: RENDER_STYLES[renderStyle].name,
    background,
    backgroundName: BACKGROUNDS[background].name,
    backgroundColor: '#' + bgColor.getHexString(),
    composition,
    scale,
    traits,
    traitNames: Object.keys(traits).map(t => SPECIAL_TRAITS[t].name),
    physicsDefault,
    seed: Math.floor(R() * 1000000),
    overallRarity,
    rarityScore
  };

  return features;
}

// ============ GLOBALS ============
let scene, camera, renderer;
let formGroup;
let physicsEnabled = false;
let autoRotate = false;
let googlyEyesEnabled = true;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Improved physics
let vertices = [];
let velocities = [];
let originalPositions = [];

// Environment map for better reflections
let envMap = null;

// ============ INITIALIZATION ============
function init() {
  generateFeatures();

  const container = document.getElementById('sketch-holder');
  const width = container.clientWidth;
  const height = container.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(features.backgroundColor);
  document.body.style.background = features.backgroundColor;

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 3;

  // Improved renderer settings
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Improved tone mapping
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Enable shadows
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  // Create a simple environment map for reflections
  createEnvironmentMap();

  // Improved lighting setup
  setupLighting();

  formGroup = new THREE.Group();
  scene.add(formGroup);

  generateForm();

  physicsEnabled = features.physicsDefault;

  setupEventListeners();
  updateFeaturesDisplay();
  animate();
}

function createEnvironmentMap() {
  // Create a simple gradient environment map
  const size = 256;
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const gradient = y / size;

      // Soft gradient from warm to cool
      data[i] = Math.floor(40 + gradient * 30);     // R
      data[i + 1] = Math.floor(35 + gradient * 40); // G
      data[i + 2] = Math.floor(50 + gradient * 60); // B
      data[i + 3] = 255;                            // A
    }
  }

  const texture = new THREE.DataTexture(data, size, size);
  texture.needsUpdate = true;
  texture.mapping = THREE.EquirectangularReflectionMapping;

  envMap = texture;
  scene.environment = envMap;
}

function setupLighting() {
  // Ambient for base illumination
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  // Key light with shadows
  const keyLight = new THREE.DirectionalLight(0xffeedd, 1.0);
  keyLight.position.set(3, 4, 2);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.bias = -0.0001;
  scene.add(keyLight);

  // Fill light - cooler
  const fillLight = new THREE.DirectionalLight(0xddeeff, 0.5);
  fillLight.position.set(-2, 2, -1);
  scene.add(fillLight);

  // Rim light for edge definition
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
  rimLight.position.set(0, -1, -3);
  scene.add(rimLight);

  // Bottom fill to reduce harsh shadows
  const bottomFill = new THREE.DirectionalLight(0x444455, 0.2);
  bottomFill.position.set(0, -3, 0);
  scene.add(bottomFill);

  // Special colored lights for certain materials
  if (features.materialType === 'neon' || features.materialType === 'lavaCore') {
    const colorLight = new THREE.PointLight(
      new THREE.Color(MATERIALS[features.materialType].props.emissive || MATERIALS[features.materialType].props.color),
      0.8,
      5
    );
    colorLight.position.set(0, 0, 2);
    scene.add(colorLight);
  }
}

function generateForm() {
  // Clear previous
  while (formGroup.children.length > 0) {
    const child = formGroup.children[0];
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
    formGroup.remove(child);
  }

  formGroup.position.set(0, 0, 0);
  formGroup.scale.set(1, 1, 1);
  formGroup.rotation.set(0, 0, 0);

  const style = RENDER_STYLES[features.renderStyle];
  const segments = style.segments || (style.flatShading ? 16 : 32);

  const params = {
    segments,
    rings: Math.floor(segments * 0.75),
    seed: features.seed,
    displacement: style.displacement || false,
    traits: features.traits
  };

  R = initRandom(hash);
  // Skip feature generation random calls
  for (let i = 0; i < 50; i++) R();

  const formGenerator = FORM_TYPES[features.formType];
  const formData = formGenerator.generate(params, R);

  // Create material with improvements
  const matConfig = MATERIALS[features.materialType];
  const matProps = { ...matConfig.props };
  matProps.flatShading = style.flatShading;
  matProps.wireframe = style.wireframe;

  // Add environment map for reflective materials
  if (matProps.metalness > 0.3 && envMap) {
    matProps.envMap = envMap;
    matProps.envMapIntensity = matProps.metalness;
  }

  if (matProps.emissive) {
    matProps.emissive = new THREE.Color(matProps.emissive);
  }

  // Handle rainbow material
  if (matConfig.props.isRainbow) {
    // We'll handle this with vertex colors
    matProps.vertexColors = true;
  }

  // Subsurface scattering approximation for skin-like materials
  if (style.subsurface && (features.materialType === 'flesh' || features.materialType === 'silicone')) {
    matProps.color = new THREE.Color(matProps.color).multiplyScalar(1.1);
    matProps.roughness = Math.max(0.4, matProps.roughness);
  }

  // Glitter effect
  if (features.traits.glitter) {
    matProps.roughness = Math.max(0.1, matProps.roughness - 0.3);
    matProps.metalness = Math.min(1, matProps.metalness + 0.3);
  }

  // Glow effect
  if (features.traits.glow && !matProps.emissive) {
    matProps.emissive = new THREE.Color(matProps.color).multiplyScalar(0.3);
    matProps.emissiveIntensity = 0.4;
  }

  const material = new THREE.MeshStandardMaterial(matProps);

  // Main form
  const mainMesh = new THREE.Mesh(formData.main, material);
  mainMesh.scale.setScalar(features.scale);
  mainMesh.castShadow = true;
  mainMesh.receiveShadow = true;
  formGroup.add(mainMesh);

  // Store for physics
  if (formData.main.attributes.position) {
    originalPositions = Array.from(formData.main.attributes.position.array);
    vertices = Array.from(formData.main.attributes.position.array);
    velocities = new Array(vertices.length).fill(0);
  }

  // Extra parts (testicles, eyes, etc.)
  if (formData.extras) {
    formData.extras.forEach(extra => {
      let geom;
      let extraMaterial = material.clone();

      // Handle eye parts differently
      if (extra.isEyeWhite) {
        extraMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0
        });
      } else if (extra.isPupil) {
        extraMaterial = new THREE.MeshStandardMaterial({
          color: 0x111111,
          roughness: 0.2,
          metalness: 0
        });
      } else if (extra.isSmile) {
        extraMaterial = new THREE.MeshStandardMaterial({
          color: 0x333333,
          roughness: 0.5,
          metalness: 0
        });
      }

      if (extra.customGeometry) {
        geom = extra.customGeometry;
      } else if (extra.type === 'sphere') {
        geom = new THREE.SphereGeometry(0.5, segments, segments);
      } else if (extra.type === 'box') {
        geom = new THREE.BoxGeometry(1, 1, 1);
      } else if (extra.type === 'cylinder') {
        geom = new THREE.CylinderGeometry(0.5, 0.5, 1, segments);
      }

      if (geom) {
        const mesh = new THREE.Mesh(geom, extraMaterial);
        mesh.position.set(...extra.position);
        mesh.scale.set(...extra.scale);
        mesh.scale.multiplyScalar(features.scale);

        if (extra.rotation) {
          mesh.rotation.set(...extra.rotation);
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Hide eyes if not emoji form or googly eyes disabled
        if ((extra.isEyeWhite || extra.isPupil || extra.isSmile) && !googlyEyesEnabled) {
          mesh.visible = false;
        }

        // Tag for toggling
        if (extra.isEyeWhite || extra.isPupil || extra.isSmile) {
          mesh.userData.isGoogly = true;
        }

        formGroup.add(mesh);
      }
    });
  }

  // Add googly eyes if trait is present and not already an emoji form
  if (features.traits.googlyEyes && !formData.isEmoji) {
    addGooglyEyes(formGroup, features.scale);
  }

  // Handle compositions
  if (features.composition === 'Paired') {
    const clone = formGroup.clone(true);
    clone.position.x = 0.8 * features.scale;
    clone.rotation.y = Math.PI * 0.1;
    formGroup.position.x = -0.4 * features.scale;
    scene.add(clone);
  } else if (features.composition === 'Triple Threat') {
    const clone1 = formGroup.clone(true);
    const clone2 = formGroup.clone(true);
    clone1.position.x = 0.9 * features.scale;
    clone1.rotation.y = Math.PI * 0.15;
    clone2.position.x = -0.9 * features.scale;
    clone2.rotation.y = -Math.PI * 0.15;
    formGroup.position.x = 0;
    scene.add(clone1);
    scene.add(clone2);
  }

  // Center
  const box = new THREE.Box3().setFromObject(formGroup);
  const center = box.getCenter(new THREE.Vector3());
  formGroup.position.sub(center);
}

function addGooglyEyes(group, scale) {
  const eyeSize = 0.06 * scale;
  const eyeSpread = 0.1 * scale;
  const eyeHeight = 0.25 * scale;

  // Get bounds to position eyes
  const box = new THREE.Box3().setFromObject(group);
  const frontZ = box.max.z;

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3
  });
  const pupilMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.2
  });

  // Left eye
  const leftWhite = new THREE.Mesh(
    new THREE.SphereGeometry(eyeSize, 16, 16),
    whiteMat
  );
  leftWhite.position.set(-eyeSpread, eyeHeight, frontZ);
  leftWhite.userData.isGoogly = true;
  group.add(leftWhite);

  const leftPupil = new THREE.Mesh(
    new THREE.SphereGeometry(eyeSize * 0.5, 12, 12),
    pupilMat
  );
  leftPupil.position.set(-eyeSpread + R() * 0.02, eyeHeight, frontZ + eyeSize * 0.7);
  leftPupil.userData.isGoogly = true;
  group.add(leftPupil);

  // Right eye
  const rightWhite = new THREE.Mesh(
    new THREE.SphereGeometry(eyeSize, 16, 16),
    whiteMat
  );
  rightWhite.position.set(eyeSpread, eyeHeight, frontZ);
  rightWhite.userData.isGoogly = true;
  group.add(rightWhite);

  const rightPupil = new THREE.Mesh(
    new THREE.SphereGeometry(eyeSize * 0.5, 12, 12),
    pupilMat
  );
  rightPupil.position.set(eyeSpread + R() * 0.02, eyeHeight, frontZ + eyeSize * 0.7);
  rightPupil.userData.isGoogly = true;
  group.add(rightPupil);
}

function setupEventListeners() {
  const canvas = renderer.domElement;

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => isDragging = false);

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    formGroup.rotation.y += (e.clientX - previousMousePosition.x) * 0.01;
    formGroup.rotation.x += (e.clientY - previousMousePosition.y) * 0.01;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('wheel', (e) => {
    camera.position.z = Math.max(1.5, Math.min(8, camera.position.z + e.deltaY * 0.005));
  });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDragging) return;
    formGroup.rotation.y += (e.touches[0].clientX - previousMousePosition.x) * 0.01;
    formGroup.rotation.x += (e.touches[0].clientY - previousMousePosition.y) * 0.01;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: false });

  canvas.addEventListener('touchend', () => isDragging = false);

  // Keyboard
  window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
      case 'r': regenerate(); break;
      case 's': saveImage(); break;
      case 'p': physicsEnabled = !physicsEnabled; updateStatusDisplay(); break;
      case 'a': autoRotate = !autoRotate; updateStatusDisplay(); break;
      case 'g': toggleGooglyEyes(); break;
    }
  });

  // Resize
  window.addEventListener('resize', () => {
    const container = document.getElementById('sketch-holder');
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

function toggleGooglyEyes() {
  googlyEyesEnabled = !googlyEyesEnabled;

  formGroup.traverse(child => {
    if (child.userData && child.userData.isGoogly) {
      child.visible = googlyEyesEnabled;
    }
  });

  updateStatusDisplay();
}

function updatePhysics() {
  if (!physicsEnabled || !formGroup.children[0]) return;

  const mesh = formGroup.children[0];
  const positions = mesh.geometry.attributes.position;
  if (!positions) return;

  const gravity = -0.0005;
  const damping = 0.95;
  const stiffness = 0.1;
  const time = Date.now() * 0.001;

  for (let i = 0; i < positions.count; i++) {
    const i3 = i * 3;

    const dx = originalPositions[i3] - vertices[i3];
    const dy = originalPositions[i3 + 1] - vertices[i3 + 1];
    const dz = originalPositions[i3 + 2] - vertices[i3 + 2];

    velocities[i3] += dx * stiffness;
    velocities[i3 + 1] += dy * stiffness + gravity;
    velocities[i3 + 2] += dz * stiffness;

    const wave = Math.sin(time * 2 + i * 0.1) * 0.001;
    velocities[i3 + 1] += wave;

    velocities[i3] *= damping;
    velocities[i3 + 1] *= damping;
    velocities[i3 + 2] *= damping;

    vertices[i3] += velocities[i3];
    vertices[i3 + 1] += velocities[i3 + 1];
    vertices[i3 + 2] += velocities[i3 + 2];

    positions.setXYZ(i, vertices[i3], vertices[i3 + 1], vertices[i3 + 2]);
  }

  positions.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

function updateStatusDisplay() {
  const el = document.getElementById('status');
  if (el) {
    const status = [];
    if (physicsEnabled) status.push('Physics ON');
    if (autoRotate) status.push('Rotate ON');
    if (googlyEyesEnabled && (features.traits.googlyEyes || features.formType === 'emoji')) {
      status.push('Googly ON');
    }
    el.textContent = status.length ? status.join(' | ') : 'Ready';
  }
}

function updateFeaturesDisplay() {
  const table = document.getElementById('features-table');
  if (!table) return;

  const rows = [
    ['Form', features.formName, FORM_TYPES[features.formType].rarity],
    ['Category', features.formCategory, 'common'],
    ['Material', features.materialName, MATERIALS[features.materialType].rarity],
    ['Style', features.renderStyleName, RENDER_STYLES[features.renderStyle].rarity],
    ['Background', features.backgroundName, BACKGROUNDS[features.background].rarity],
    ['Composition', features.composition, features.composition === 'Triple Threat' ? 'legendary' : features.composition === 'Paired' ? 'rare' : 'common']
  ];

  // Add traits
  if (features.traitNames.length > 0) {
    rows.push(['Traits', features.traitNames.join(', '), 'rare']);
  }

  rows.push(['Overall', features.overallRarity, features.overallRarity.toLowerCase()]);

  table.innerHTML = rows.map(([name, value, rarity]) => `
    <tr>
      <td>${name}</td>
      <td>${value}</td>
      <td><span class="rarity-badge rarity-${rarity}">${rarity}</span></td>
    </tr>
  `).join('');

  const hashEl = document.getElementById('hash-display');
  if (hashEl) {
    hashEl.textContent = hash.slice(0, 18) + '...';
    hashEl.title = hash;
  }

  updateStatusDisplay();

  // Update version display
  const versionEl = document.querySelector('.version');
  if (versionEl) {
    versionEl.textContent = 'v2.0.0';
  }
}

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

  generateFeatures();
  scene.background = new THREE.Color(features.backgroundColor);
  document.body.style.background = features.backgroundColor;

  // Remove clones
  while (scene.children.length > 6) {
    const child = scene.children[scene.children.length - 1];
    if (child.isGroup) {
      child.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
    scene.remove(child);
  }

  generateForm();
  physicsEnabled = features.physicsDefault;
  updateFeaturesDisplay();

  camera.position.z = 3;
  formGroup.rotation.set(0, 0, 0);
}

function saveImage() {
  const link = document.createElement('a');
  link.download = `genital-forms-${hash.slice(2, 10)}.png`;
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
}

function animate() {
  requestAnimationFrame(animate);

  updatePhysics();

  if (autoRotate && !isDragging) {
    formGroup.rotation.y += 0.005;
  }

  renderer.render(scene, camera);
}

// Expose functions
window.regenerate = regenerate;
window.saveImage = saveImage;
window.togglePhysics = () => { physicsEnabled = !physicsEnabled; updateStatusDisplay(); };
window.toggleAutoRotate = () => { autoRotate = !autoRotate; updateStatusDisplay(); };
window.toggleGooglyEyes = toggleGooglyEyes;
window.getFeatures = () => features;
window.getHash = () => hash;

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
