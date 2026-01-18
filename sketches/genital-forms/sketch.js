/**
 * GENITAL FORMS
 * Procedural generation of abstract anatomical sculptures
 * Spanning the full spectrum of human genital forms
 *
 * Controls:
 *   Drag - Rotate view
 *   Scroll - Zoom
 *   R - Regenerate
 *   S - Save PNG
 *   P - Toggle physics
 *   A - Toggle auto-rotate
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

// ============ NOISE ============
function noise3D(x, y, z, seed) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed) * 43758.5453;
  return n - Math.floor(n);
}

function fbm3D(x, y, z, seed, octaves = 4) {
  let value = 0, amplitude = 0.5, frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * (noise3D(x * frequency, y * frequency, z * frequency, seed + i * 100) - 0.5);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

// ============ FORM TYPES ============
const FORM_TYPES = {
  phallic: {
    name: 'Phallic',
    rarity: 'common',
    generate: (params, rng) => generatePhallicForm(params, rng)
  },
  vulvic: {
    name: 'Vulvic',
    rarity: 'common',
    generate: (params, rng) => generateVulvicForm(params, rng)
  },
  intersex: {
    name: 'Intersex',
    rarity: 'rare',
    generate: (params, rng) => generateIntersexForm(params, rng)
  },
  ambiguous: {
    name: 'Ambiguous',
    rarity: 'rare',
    generate: (params, rng) => generateAmbiguousForm(params, rng)
  },
  abstract: {
    name: 'Abstract',
    rarity: 'legendary',
    generate: (params, rng) => generateAbstractForm(params, rng)
  },
  morphic: {
    name: 'Morphic',
    rarity: 'legendary',
    generate: (params, rng) => generateMorphicForm(params, rng)
  }
};

// ============ MATERIALS ============
const MATERIALS = {
  // Natural
  clay: { name: 'Clay', rarity: 'common', props: { color: '#c4a882', metalness: 0.0, roughness: 0.9 } },
  ceramic: { name: 'Ceramic', rarity: 'common', props: { color: '#f5f0e6', metalness: 0.1, roughness: 0.3 } },
  terracotta: { name: 'Terracotta', rarity: 'common', props: { color: '#c45c3e', metalness: 0.0, roughness: 0.8 } },
  marble: { name: 'Marble', rarity: 'uncommon', props: { color: '#f0ebe3', metalness: 0.1, roughness: 0.2 } },
  bronze: { name: 'Bronze', rarity: 'uncommon', props: { color: '#cd7f32', metalness: 0.9, roughness: 0.4 } },
  jade: { name: 'Jade', rarity: 'uncommon', props: { color: '#00a86b', metalness: 0.2, roughness: 0.3, transparent: true, opacity: 0.85 } },

  // Synthetic
  plastic: { name: 'Plastic', rarity: 'common', props: { color: '#ff69b4', metalness: 0.0, roughness: 0.4 } },
  rubber: { name: 'Rubber', rarity: 'common', props: { color: '#2d2d2d', metalness: 0.0, roughness: 0.95 } },
  silicone: { name: 'Silicone', rarity: 'uncommon', props: { color: '#ffdbac', metalness: 0.0, roughness: 0.6 } },
  chrome: { name: 'Chrome', rarity: 'rare', props: { color: '#c0c0c0', metalness: 1.0, roughness: 0.05 } },
  neon: { name: 'Neon', rarity: 'rare', props: { color: '#ff00ff', metalness: 0.0, roughness: 0.2, emissive: '#ff00ff', emissiveIntensity: 0.5 } },

  // Surreal
  glass: { name: 'Glass', rarity: 'rare', props: { color: '#ffffff', metalness: 0.0, roughness: 0.0, transparent: true, opacity: 0.4 } },
  liquid: { name: 'Liquid', rarity: 'legendary', props: { color: '#4169e1', metalness: 0.3, roughness: 0.0, transparent: true, opacity: 0.7 } },
  galaxy: { name: 'Galaxy', rarity: 'legendary', props: { color: '#1a0033', metalness: 0.5, roughness: 0.3 } },
  iridescent: { name: 'Iridescent', rarity: 'legendary', props: { color: '#e0b0ff', metalness: 0.8, roughness: 0.2 } },
  flesh: { name: 'Flesh', rarity: 'uncommon', props: { color: '#e8beac', metalness: 0.0, roughness: 0.7 } }
};

// ============ RENDER STYLES ============
const RENDER_STYLES = {
  smooth: { name: 'Smooth', rarity: 'common', flatShading: false, wireframe: false },
  lowPoly: { name: 'Low Poly', rarity: 'common', flatShading: true, wireframe: false },
  wireframe: { name: 'Wireframe', rarity: 'uncommon', flatShading: false, wireframe: true },
  faceted: { name: 'Faceted', rarity: 'uncommon', flatShading: true, wireframe: false, segments: 8 },
  organic: { name: 'Organic', rarity: 'rare', flatShading: false, wireframe: false, displacement: true }
};

// ============ BACKGROUND PALETTES ============
const BACKGROUNDS = {
  void: { name: 'Void', colors: ['#0a0a0f', '#1a1a2e'], rarity: 'common' },
  flesh: { name: 'Flesh', colors: ['#2d1f1f', '#4a3333'], rarity: 'common' },
  clinical: { name: 'Clinical', colors: ['#1a2a2a', '#2a3a3a'], rarity: 'common' },
  warm: { name: 'Warm', colors: ['#2d1a0a', '#4a2d1a'], rarity: 'uncommon' },
  cool: { name: 'Cool', colors: ['#0a1a2d', '#1a2d4a'], rarity: 'uncommon' },
  surreal: { name: 'Surreal', colors: ['#1a0a2d', '#2d1a4a'], rarity: 'rare' },
  neon: { name: 'Neon', colors: ['#0a0a1a', '#1a0a2a'], rarity: 'rare' },
  cosmic: { name: 'Cosmic', colors: ['#000011', '#110022'], rarity: 'legendary' }
};

// ============ GEOMETRY GENERATORS ============

function generatePhallicForm(params, rng) {
  const geometry = new THREE.BufferGeometry();
  const segments = params.segments || 32;
  const rings = params.rings || 24;

  // Base dimensions with variation
  const length = 1.0 + rng() * 0.6;
  const baseRadius = 0.15 + rng() * 0.1;
  const tipRadius = baseRadius * (0.3 + rng() * 0.4);
  const curve = (rng() - 0.5) * 0.3;
  const twist = rng() * 0.2;

  // Veins and surface detail
  const veininess = rng();
  const circumcised = rng() > 0.5;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const y = t * length - length * 0.3;

    // Radius profile - shaft to tip
    let radius;
    if (t < 0.7) {
      radius = baseRadius * (1 + 0.1 * Math.sin(t * Math.PI * 2));
    } else if (t < 0.85) {
      // Glans ridge
      const glansT = (t - 0.7) / 0.15;
      radius = baseRadius * (1.1 - glansT * 0.3);
      if (!circumcised && glansT < 0.3) {
        radius *= 1.1; // Foreskin
      }
    } else {
      // Tip
      const tipT = (t - 0.85) / 0.15;
      radius = tipRadius + (baseRadius * 0.8 - tipRadius) * (1 - tipT);
      radius *= 1 - tipT * 0.5;
    }

    // Curve and twist
    const curveOffset = curve * Math.sin(t * Math.PI);
    const twistAngle = twist * t * Math.PI * 2;

    for (let seg = 0; seg <= segments; seg++) {
      const theta = (seg / segments) * Math.PI * 2 + twistAngle;

      // Add surface variation (veins)
      let localRadius = radius;
      if (veininess > 0.3 && t < 0.7) {
        const vein1 = Math.max(0, Math.sin(theta * 3 + t * 5) * 0.03 * veininess);
        const vein2 = Math.max(0, Math.sin(theta * 5 - t * 3) * 0.02 * veininess);
        localRadius += vein1 + vein2;
      }

      // Add noise displacement
      if (params.displacement) {
        localRadius += fbm3D(theta, t * 3, params.seed, params.seed, 3) * 0.02;
      }

      const x = Math.cos(theta) * localRadius + curveOffset;
      const z = Math.sin(theta) * localRadius;

      positions.push(x, y, z);

      // Normal calculation
      const nx = Math.cos(theta);
      const ny = 0.1;
      const nz = Math.sin(theta);
      const nl = Math.sqrt(nx*nx + ny*ny + nz*nz);
      normals.push(nx/nl, ny/nl, nz/nl);

      uvs.push(seg / segments, t);
    }
  }

  // Generate indices
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

  // Add testicles
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

  // Dimensions
  const height = 0.8 + rng() * 0.4;
  const width = 0.3 + rng() * 0.2;
  const depth = 0.15 + rng() * 0.1;
  const labiaSize = 0.5 + rng() * 0.5;
  const clitSize = 0.05 + rng() * 0.05;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Generate labia majora base shape
  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const y = (t - 0.5) * height;

    for (let seg = 0; seg <= segments; seg++) {
      const s = seg / segments;
      const theta = s * Math.PI * 2;

      // Labia profile - figure-8 cross section
      let radius = width * (0.8 + 0.2 * Math.cos(theta * 2));

      // Taper at top and bottom
      const taper = 1 - Math.pow(Math.abs(t - 0.5) * 2, 2) * 0.5;
      radius *= taper;

      // Central cleft
      const cleft = Math.max(0, Math.cos(theta)) * depth * labiaSize;

      // Add organic variation
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

  // Generate indices
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

  // Extra details
  const extras = [];

  // Clitoris
  extras.push({
    position: [0, height * 0.35, -depth * 0.5],
    scale: [clitSize, clitSize * 0.8, clitSize],
    type: 'sphere'
  });

  // Inner labia hints
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
  // Blend between phallic and vulvic
  const blend = 0.3 + rng() * 0.4; // How phallic vs vulvic

  const geometry = new THREE.BufferGeometry();
  const segments = params.segments || 32;
  const rings = params.rings || 24;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Dimensions blend
  const length = 0.3 + blend * 0.7;
  const width = 0.25 - blend * 0.1;
  const baseRadius = 0.12 + blend * 0.08;

  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const y = t * length - length * 0.2;

    for (let seg = 0; seg <= segments; seg++) {
      const theta = (seg / segments) * Math.PI * 2;

      // Blend profiles
      const phallicRadius = baseRadius * (1 - t * 0.3);
      const vulvicRadius = width * (0.8 + 0.2 * Math.cos(theta * 2)) * (1 - Math.pow(t - 0.5, 2));

      let radius = phallicRadius * blend + vulvicRadius * (1 - blend);

      // Organic variation
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
  // Organic blob with suggestive forms
  const geometry = new THREE.BufferGeometry();
  const detail = params.segments || 32;

  // Use icosphere-like generation with displacement
  const positions = [];
  const normals = [];
  const indices = [];

  // Generate displaced sphere
  const phi = (1 + Math.sqrt(5)) / 2;
  const baseVerts = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
  ];

  // Normalize and displace
  baseVerts.forEach((v, i) => {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    v[0] /= len; v[1] /= len; v[2] /= len;

    // Organic displacement
    const disp = 0.3 + fbm3D(v[0]*2, v[1]*2, v[2]*2, params.seed, 4) * 0.4;

    // Add suggestive bulges
    const bulge1 = Math.max(0, 1 - Math.sqrt((v[0]-0.3)**2 + (v[1]-0.5)**2 + v[2]**2) * 2) * 0.3;
    const bulge2 = Math.max(0, 1 - Math.sqrt((v[0]+0.3)**2 + (v[1]-0.5)**2 + v[2]**2) * 2) * 0.2;
    const bulge3 = Math.max(0, 1 - Math.sqrt(v[0]**2 + (v[1]+0.5)**2 + v[2]**2) * 1.5) * 0.4;

    const scale = 0.5 + disp + bulge1 + bulge2 + bulge3;
    positions.push(v[0] * scale, v[1] * scale, v[2] * scale);
    normals.push(v[0], v[1], v[2]);
  });

  // Icosahedron faces
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
  // Highly abstract, surreal interpretation
  const geometry = new THREE.BufferGeometry();
  const segments = params.segments || 24;
  const rings = params.rings || 16;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Twisted organic form
  const height = 1.5;
  const baseScale = 0.4;

  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const y = (t - 0.5) * height;

    // Evolving cross-section
    const twist = t * Math.PI * 2 * (1 + rng());
    const morph = Math.sin(t * Math.PI);

    for (let seg = 0; seg <= segments; seg++) {
      const theta = (seg / segments) * Math.PI * 2 + twist;

      // Morphing radius with multiple harmonics
      let radius = baseScale * morph;
      radius *= 1 + 0.3 * Math.sin(theta * 2 + t * 4);
      radius *= 1 + 0.2 * Math.cos(theta * 3 - t * 2);

      // Fractal displacement
      radius += fbm3D(theta, t * 3, params.seed, params.seed, 5) * 0.15;

      // Ensure minimum radius
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
  // Continuously morphing between forms
  const phase = rng() * Math.PI * 2;
  const formA = generatePhallicForm(params, () => rng());
  const formB = generateVulvicForm(params, () => rng());

  // For now, return one of them with modifications
  const blend = (Math.sin(phase) + 1) / 2;

  if (blend > 0.5) {
    return formA;
  } else {
    return formB;
  }
}

// ============ BACKGROUND GENERATOR ============
function generateBackground(palette, rng) {
  const colors = BACKGROUNDS[palette].colors;
  const baseColor = new THREE.Color(colors[0]);
  const accentColor = new THREE.Color(colors[1]);

  // Slight variation
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

  // Form type selection
  const formTypes = Object.keys(FORM_TYPES);
  const formWeights = formTypes.map(f => {
    const rarity = FORM_TYPES[f].rarity;
    return rarity === 'legendary' ? 0.05 : rarity === 'rare' ? 0.15 : 0.40;
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
    return rarity === 'legendary' ? 0.03 : rarity === 'rare' ? 0.08 : rarity === 'uncommon' ? 0.15 : 0.37;
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
    return rarity === 'legendary' ? 0.05 : rarity === 'rare' ? 0.1 : rarity === 'uncommon' ? 0.2 : 0.325;
  });
  const bgTotal = bgWeights.reduce((a, b) => a + b, 0);
  roll = R() * bgTotal;
  let background = bgTypes[0];
  for (let i = 0; i < bgTypes.length; i++) {
    roll -= bgWeights[i];
    if (roll <= 0) { background = bgTypes[i]; break; }
  }

  // Composition - rare chance for paired
  const isPaired = R() < 0.05;
  const composition = isPaired ? 'Paired' : 'Single';

  // Size variation
  const scale = 0.7 + R() * 0.6;

  // Physics enabled by default for some materials
  const physicsDefault = ['silicone', 'rubber', 'flesh', 'liquid'].includes(materialType);

  // Calculate rarity score
  const rarityScore = (
    (FORM_TYPES[formType].rarity === 'legendary' ? 4 : FORM_TYPES[formType].rarity === 'rare' ? 3 : 1) +
    (MATERIALS[materialType].rarity === 'legendary' ? 4 : MATERIALS[materialType].rarity === 'rare' ? 3 : MATERIALS[materialType].rarity === 'uncommon' ? 2 : 1) +
    (RENDER_STYLES[renderStyle].rarity === 'rare' ? 3 : RENDER_STYLES[renderStyle].rarity === 'uncommon' ? 2 : 1) +
    (isPaired ? 4 : 0)
  );

  const overallRarity = rarityScore >= 10 ? 'Legendary' : rarityScore >= 7 ? 'Rare' : rarityScore >= 4 ? 'Uncommon' : 'Common';

  const bgColor = generateBackground(background, R);

  features = {
    formType,
    formName: FORM_TYPES[formType].name,
    materialType,
    materialName: MATERIALS[materialType].name,
    renderStyle,
    renderStyleName: RENDER_STYLES[renderStyle].name,
    background,
    backgroundName: BACKGROUNDS[background].name,
    backgroundColor: '#' + bgColor.getHexString(),
    composition,
    scale,
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
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Simple soft body physics
let vertices = [];
let velocities = [];
let originalPositions = [];

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

  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
  keyLight.position.set(2, 3, 2);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-2, 1, -1);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
  rimLight.position.set(0, -2, -2);
  scene.add(rimLight);

  // Special lighting for certain materials
  if (features.materialType === 'neon' || features.materialType === 'galaxy') {
    const colorLight = new THREE.PointLight(new THREE.Color(MATERIALS[features.materialType].props.color), 0.5);
    colorLight.position.set(0, 0, 2);
    scene.add(colorLight);
  }

  formGroup = new THREE.Group();
  scene.add(formGroup);

  generateForm();

  physicsEnabled = features.physicsDefault;

  setupEventListeners();
  updateFeaturesDisplay();
  animate();
}

function generateForm() {
  // Clear previous
  while (formGroup.children.length > 0) {
    const child = formGroup.children[0];
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
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
    displacement: style.displacement || false
  };

  R = initRandom(hash);
  // Skip feature generation random calls
  for (let i = 0; i < 30; i++) R();

  const formGenerator = FORM_TYPES[features.formType];
  const formData = formGenerator.generate(params, R);

  // Create material
  const matProps = { ...MATERIALS[features.materialType].props };
  matProps.flatShading = style.flatShading;
  matProps.wireframe = style.wireframe;

  if (matProps.emissive) {
    matProps.emissive = new THREE.Color(matProps.emissive);
  }

  const material = new THREE.MeshStandardMaterial(matProps);

  // Main form
  const mainMesh = new THREE.Mesh(formData.main, material);
  mainMesh.scale.setScalar(features.scale);
  formGroup.add(mainMesh);

  // Store for physics
  if (formData.main.attributes.position) {
    originalPositions = Array.from(formData.main.attributes.position.array);
    vertices = Array.from(formData.main.attributes.position.array);
    velocities = new Array(vertices.length).fill(0);
  }

  // Extra parts (testicles, etc.)
  if (formData.extras) {
    formData.extras.forEach(extra => {
      let geom;
      if (extra.type === 'sphere') {
        geom = new THREE.SphereGeometry(0.5, segments, segments);
      } else if (extra.type === 'box') {
        geom = new THREE.BoxGeometry(1, 1, 1);
      }

      if (geom) {
        const mesh = new THREE.Mesh(geom, material.clone());
        mesh.position.set(...extra.position);
        mesh.scale.set(...extra.scale);
        mesh.scale.multiplyScalar(features.scale);
        formGroup.add(mesh);
      }
    });
  }

  // Paired composition
  if (features.composition === 'Paired') {
    const clone = formGroup.clone();
    clone.position.x = 0.8;
    clone.rotation.y = Math.PI * 0.1;
    formGroup.position.x = -0.4;
    scene.add(clone);
  }

  // Center
  const box = new THREE.Box3().setFromObject(formGroup);
  const center = box.getCenter(new THREE.Vector3());
  formGroup.position.sub(center);
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

    // Spring back to original
    const dx = originalPositions[i3] - vertices[i3];
    const dy = originalPositions[i3 + 1] - vertices[i3 + 1];
    const dz = originalPositions[i3 + 2] - vertices[i3 + 2];

    velocities[i3] += dx * stiffness;
    velocities[i3 + 1] += dy * stiffness + gravity;
    velocities[i3 + 2] += dz * stiffness;

    // Add subtle wave motion
    const wave = Math.sin(time * 2 + i * 0.1) * 0.001;
    velocities[i3 + 1] += wave;

    // Damping
    velocities[i3] *= damping;
    velocities[i3 + 1] *= damping;
    velocities[i3 + 2] *= damping;

    // Update position
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
    el.textContent = status.length ? status.join(' | ') : 'Ready';
  }
}

function updateFeaturesDisplay() {
  const table = document.getElementById('features-table');
  if (!table) return;

  const rows = [
    ['Form', features.formName, FORM_TYPES[features.formType].rarity],
    ['Material', features.materialName, MATERIALS[features.materialType].rarity],
    ['Style', features.renderStyleName, RENDER_STYLES[features.renderStyle].rarity],
    ['Background', features.backgroundName, BACKGROUNDS[features.background].rarity],
    ['Composition', features.composition, features.composition === 'Paired' ? 'legendary' : 'common'],
    ['Overall', features.overallRarity, features.overallRarity.toLowerCase()]
  ];

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
}

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

  generateFeatures();
  scene.background = new THREE.Color(features.backgroundColor);
  document.body.style.background = features.backgroundColor;

  // Remove paired clone if exists
  while (scene.children.length > 5) {
    scene.remove(scene.children[scene.children.length - 1]);
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
window.getFeatures = () => features;
window.getHash = () => hash;

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
