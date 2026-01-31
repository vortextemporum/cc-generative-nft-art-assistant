/**
 * HYPERGEOMETRY
 * N-dimensional polytope visualization with morphing, boolean operations, and nested structures
 *
 * Version: 1.0.0
 * Framework: Three.js
 */

// ============================================================================
// HASH-BASED RANDOMNESS (Art Blocks Compatible)
// ============================================================================

let hash = "0x" + Array(64).fill(0).map(() =>
  "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}

function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

function initRandom(hashStr) {
  const seeds = [];
  for (let i = 0; i < 4; i++) {
    seeds.push(parseInt(hashStr.slice(2 + i * 8, 10 + i * 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

let R;
function rnd(min = 0, max = 1) {
  return R() * (max - min) + min;
}

function rndInt(min, max) {
  return Math.floor(rnd(min, max + 1));
}

function rndChoice(arr) {
  return arr[Math.floor(R() * arr.length)];
}

function rndBool(p = 0.5) {
  return R() < p;
}

function rollRarity(common, uncommon, rare, legendary) {
  const roll = R();
  if (roll < legendary) return 'legendary';
  if (roll < legendary + rare) return 'rare';
  if (roll < legendary + rare + uncommon) return 'uncommon';
  return 'common';
}

// ============================================================================
// COLOR PALETTES
// ============================================================================

const PALETTES = {
  cosmic: {
    name: 'Cosmic',
    background: 0x0a0a12,
    grid: 0x1a1a2e,
    colors: [0x7b2cbf, 0x9d4edd, 0xc77dff, 0xe0aaff, 0x3c096c]
  },
  glacier: {
    name: 'Glacier',
    background: 0x0d1117,
    grid: 0x1a2332,
    colors: [0x48cae4, 0x90e0ef, 0xade8f4, 0xcaf0f8, 0x0077b6]
  },
  ember: {
    name: 'Ember',
    background: 0x140c08,
    grid: 0x2a1810,
    colors: [0xff6b35, 0xf7931e, 0xffcc02, 0xff4d6d, 0xc9184a]
  },
  void: {
    name: 'Void',
    background: 0x050505,
    grid: 0x151515,
    colors: [0xffffff, 0xcccccc, 0x999999, 0x666666, 0x333333]
  },
  aurora: {
    name: 'Aurora',
    background: 0x0a0f14,
    grid: 0x152028,
    colors: [0x00ff87, 0x60efff, 0xff00ff, 0xffff00, 0x00ffff]
  },
  matrix: {
    name: 'Matrix',
    background: 0x000800,
    grid: 0x001a00,
    colors: [0x00ff00, 0x00cc00, 0x009900, 0x00ff66, 0x33ff33]
  },
  sunset: {
    name: 'Sunset',
    background: 0x1a0a14,
    grid: 0x2a1424,
    colors: [0xff6b6b, 0xfeca57, 0xff9ff3, 0x54a0ff, 0x5f27cd]
  },
  ocean: {
    name: 'Ocean',
    background: 0x0a1628,
    grid: 0x142238,
    colors: [0x0466c8, 0x0353a4, 0x023e7d, 0x002855, 0x001845]
  }
};

const PALETTE_NAMES = Object.keys(PALETTES);

// ============================================================================
// N-DIMENSIONAL GEOMETRY
// ============================================================================

/**
 * Generate vertices of an N-dimensional hypercube (N-cube)
 * @param {number} n - Number of dimensions
 * @returns {number[][]} Array of vertex coordinates
 */
function generateHypercube(n) {
  const vertices = [];
  const numVertices = Math.pow(2, n);

  for (let i = 0; i < numVertices; i++) {
    const vertex = [];
    for (let d = 0; d < n; d++) {
      vertex.push((i >> d) & 1 ? 1 : -1);
    }
    vertices.push(vertex);
  }

  return vertices;
}

/**
 * Generate edges of an N-dimensional hypercube
 * Two vertices are connected if they differ in exactly one coordinate
 */
function generateHypercubeEdges(n) {
  const vertices = generateHypercube(n);
  const edges = [];

  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      let diffCount = 0;
      for (let d = 0; d < n; d++) {
        if (vertices[i][d] !== vertices[j][d]) diffCount++;
      }
      if (diffCount === 1) {
        edges.push([i, j]);
      }
    }
  }

  return { vertices, edges };
}

/**
 * Generate N-dimensional simplex (N+1 vertices in N dimensions)
 */
function generateSimplex(n) {
  const vertices = [];

  // Standard construction of regular simplex
  for (let i = 0; i <= n; i++) {
    const vertex = new Array(n).fill(0);
    if (i < n) {
      vertex[i] = 1;
    } else {
      // Last vertex at center-ish position
      const val = (1 - Math.sqrt(n + 1)) / n;
      for (let d = 0; d < n; d++) {
        vertex[d] = val;
      }
    }
    vertices.push(vertex);
  }

  // Center the simplex
  const center = new Array(n).fill(0);
  for (const v of vertices) {
    for (let d = 0; d < n; d++) {
      center[d] += v[d] / vertices.length;
    }
  }
  for (const v of vertices) {
    for (let d = 0; d < n; d++) {
      v[d] -= center[d];
    }
  }

  // Normalize scale
  let maxDist = 0;
  for (const v of vertices) {
    const dist = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
    maxDist = Math.max(maxDist, dist);
  }
  for (const v of vertices) {
    for (let d = 0; d < n; d++) {
      v[d] /= maxDist;
    }
  }

  // All vertices connected in a simplex
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      edges.push([i, j]);
    }
  }

  return { vertices, edges };
}

/**
 * Generate N-dimensional cross-polytope (orthoplex / hyperoctahedron)
 * Has 2N vertices (±1 on each axis)
 */
function generateCrossPolytope(n) {
  const vertices = [];

  for (let d = 0; d < n; d++) {
    const pos = new Array(n).fill(0);
    const neg = new Array(n).fill(0);
    pos[d] = 1;
    neg[d] = -1;
    vertices.push(pos, neg);
  }

  // Edges connect vertices that are not antipodal (not on same axis)
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      // Check if on same axis (would be antipodal)
      const axisI = Math.floor(i / 2);
      const axisJ = Math.floor(j / 2);
      if (axisI !== axisJ) {
        edges.push([i, j]);
      }
    }
  }

  return { vertices, edges };
}

/**
 * Generate 24-cell (4D only)
 * Unique self-dual regular polytope
 */
function generate24Cell() {
  const vertices = [];

  // 8 vertices from tesseract at (±1, 0, 0, 0) permutations
  for (let d = 0; d < 4; d++) {
    for (const sign of [-1, 1]) {
      const v = [0, 0, 0, 0];
      v[d] = sign;
      vertices.push(v);
    }
  }

  // 16 vertices at (±0.5, ±0.5, ±0.5, ±0.5)
  for (let i = 0; i < 16; i++) {
    const v = [];
    for (let d = 0; d < 4; d++) {
      v.push((i >> d) & 1 ? 0.5 : -0.5);
    }
    vertices.push(v);
  }

  // Normalize
  const scale = 1 / Math.sqrt(0.5);
  for (const v of vertices.slice(8)) {
    for (let d = 0; d < 4; d++) {
      v[d] *= scale;
    }
  }

  // Edges connect vertices at distance sqrt(2)
  const edges = [];
  const targetDist = Math.sqrt(2);
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      let distSq = 0;
      for (let d = 0; d < 4; d++) {
        distSq += Math.pow(vertices[i][d] - vertices[j][d], 2);
      }
      if (Math.abs(Math.sqrt(distSq) - targetDist) < 0.01) {
        edges.push([i, j]);
      }
    }
  }

  return { vertices, edges };
}

/**
 * Generate 120-cell (4D) - simplified approximation
 * Full 120-cell has 600 vertices - we use a subset for performance
 */
function generate120CellSimplified() {
  const vertices = [];
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio

  // Use a subset of vertices based on permutations
  const coords = [
    [2, 2, 0, 0],
    [phi * phi, phi, phi, 1 / phi],
    [phi + 2, 1, phi, 0],
  ];

  // Generate permutations and sign changes
  for (const base of coords) {
    const perms = permutations4D(base);
    for (const p of perms) {
      const signs = generateSigns(4);
      for (const s of signs) {
        const v = p.map((val, i) => val * s[i]);
        // Check if already exists
        if (!vertices.some(existing =>
          existing.every((val, i) => Math.abs(val - v[i]) < 0.001)
        )) {
          vertices.push(v);
        }
      }
    }
  }

  // Normalize
  let maxDist = 0;
  for (const v of vertices) {
    const dist = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
    maxDist = Math.max(maxDist, dist);
  }
  for (const v of vertices) {
    for (let d = 0; d < 4; d++) {
      v[d] /= maxDist;
    }
  }

  // Find edges (nearest neighbors)
  const edges = [];
  const distances = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      let distSq = 0;
      for (let d = 0; d < 4; d++) {
        distSq += Math.pow(vertices[i][d] - vertices[j][d], 2);
      }
      distances.push({ i, j, dist: Math.sqrt(distSq) });
    }
  }

  distances.sort((a, b) => a.dist - b.dist);
  const edgeDist = distances[0].dist;
  for (const d of distances) {
    if (d.dist < edgeDist * 1.1) {
      edges.push([d.i, d.j]);
    }
  }

  return { vertices, edges };
}

/**
 * Generate 600-cell (4D) - simplified
 */
function generate600CellSimplified() {
  const vertices = [];
  const phi = (1 + Math.sqrt(5)) / 2;

  // 24-cell vertices
  for (let d = 0; d < 4; d++) {
    for (const sign of [-1, 1]) {
      const v = [0, 0, 0, 0];
      v[d] = sign;
      vertices.push(v);
    }
  }

  // Additional vertices using golden ratio
  const baseCoords = [
    [0.5, phi / 2, 1 / (2 * phi), 0],
  ];

  for (const base of baseCoords) {
    for (const perm of permutations4D(base)) {
      for (const signs of generateSigns(4)) {
        const v = perm.map((val, i) => val * signs[i]);
        if (!vertices.some(existing =>
          existing.every((val, i) => Math.abs(val - v[i]) < 0.001)
        )) {
          vertices.push(v);
        }
      }
    }
  }

  // Normalize
  let maxDist = 0;
  for (const v of vertices) {
    const dist = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
    maxDist = Math.max(maxDist, dist);
  }
  for (const v of vertices) {
    for (let d = 0; d < 4; d++) {
      v[d] /= maxDist;
    }
  }

  // Find edges
  const edges = [];
  const distances = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      let distSq = 0;
      for (let d = 0; d < 4; d++) {
        distSq += Math.pow(vertices[i][d] - vertices[j][d], 2);
      }
      distances.push({ i, j, dist: Math.sqrt(distSq) });
    }
  }

  distances.sort((a, b) => a.dist - b.dist);
  const edgeDist = distances[0].dist;
  for (const d of distances) {
    if (d.dist < edgeDist * 1.1) {
      edges.push([d.i, d.j]);
    }
  }

  return { vertices, edges };
}

/**
 * Generate Clifford torus (4D torus)
 */
function generateCliffordTorus(segments = 16) {
  const vertices = [];
  const edges = [];

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const theta = (i / segments) * Math.PI * 2;
      const phi = (j / segments) * Math.PI * 2;

      vertices.push([
        Math.cos(theta) / Math.sqrt(2),
        Math.sin(theta) / Math.sqrt(2),
        Math.cos(phi) / Math.sqrt(2),
        Math.sin(phi) / Math.sqrt(2)
      ]);

      const idx = i * segments + j;
      const nextI = ((i + 1) % segments) * segments + j;
      const nextJ = i * segments + ((j + 1) % segments);

      edges.push([idx, nextI]);
      edges.push([idx, nextJ]);
    }
  }

  return { vertices, edges };
}

// Helper functions for polytope generation
function permutations4D(arr) {
  const result = [];
  const used = new Set();

  function permute(current, remaining) {
    if (remaining.length === 0) {
      const key = current.join(',');
      if (!used.has(key)) {
        used.add(key);
        result.push([...current]);
      }
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      const newRemaining = [...remaining.slice(0, i), ...remaining.slice(i + 1)];
      permute([...current, remaining[i]], newRemaining);
    }
  }

  permute([], arr);
  return result;
}

function generateSigns(n) {
  const result = [];
  const count = Math.pow(2, n);

  for (let i = 0; i < count; i++) {
    const signs = [];
    for (let d = 0; d < n; d++) {
      signs.push((i >> d) & 1 ? 1 : -1);
    }
    result.push(signs);
  }

  return result;
}

// ============================================================================
// N-DIMENSIONAL ROTATION
// ============================================================================

/**
 * Create rotation matrix for rotation in a plane defined by two axes
 * @param {number} n - Number of dimensions
 * @param {number} axis1 - First axis (0-indexed)
 * @param {number} axis2 - Second axis (0-indexed)
 * @param {number} angle - Rotation angle in radians
 */
function createPlaneRotation(n, axis1, axis2, angle) {
  // Start with identity matrix
  const matrix = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = new Array(n).fill(0);
    matrix[i][i] = 1;
  }

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  matrix[axis1][axis1] = cos;
  matrix[axis1][axis2] = -sin;
  matrix[axis2][axis1] = sin;
  matrix[axis2][axis2] = cos;

  return matrix;
}

/**
 * Multiply two matrices
 */
function multiplyMatrices(a, b) {
  const n = a.length;
  const result = [];

  for (let i = 0; i < n; i++) {
    result[i] = new Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }

  return result;
}

/**
 * Apply matrix to vector
 */
function applyMatrix(matrix, vector) {
  const result = new Array(vector.length).fill(0);

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < vector.length; j++) {
      result[i] += matrix[i][j] * vector[j];
    }
  }

  return result;
}

/**
 * Create isoclinic (Clifford) rotation - unique to 4D
 * Rotates in two orthogonal planes simultaneously
 */
function createIsoclinicRotation(angle1, angle2) {
  const m1 = createPlaneRotation(4, 0, 1, angle1);
  const m2 = createPlaneRotation(4, 2, 3, angle2);
  return multiplyMatrices(m1, m2);
}

// ============================================================================
// PROJECTION
// ============================================================================

/**
 * Project N-dimensional point to 3D using perspective projection
 */
function projectToND(point, targetDim, viewDistances) {
  let current = [...point];

  // Project down one dimension at a time
  while (current.length > targetDim) {
    const dim = current.length;
    const w = current[dim - 1];
    const viewDist = viewDistances[dim] || 3;
    const scale = viewDist / (viewDist - w);

    const projected = [];
    for (let i = 0; i < dim - 1; i++) {
      projected.push(current[i] * scale);
    }
    current = projected;
  }

  return current;
}

// ============================================================================
// MORPHING
// ============================================================================

/**
 * Interpolate between two shapes
 * Handles different vertex counts by repeating vertices
 */
function morphShapes(shape1, shape2, t) {
  const v1 = shape1.vertices;
  const v2 = shape2.vertices;
  const n = Math.max(v1.length, v2.length);
  const dim = Math.max(v1[0]?.length || 0, v2[0]?.length || 0);

  const result = [];

  for (let i = 0; i < n; i++) {
    const p1 = v1[i % v1.length] || new Array(dim).fill(0);
    const p2 = v2[i % v2.length] || new Array(dim).fill(0);

    // Pad to same dimension
    while (p1.length < dim) p1.push(0);
    while (p2.length < dim) p2.push(0);

    const interpolated = [];
    for (let d = 0; d < dim; d++) {
      interpolated.push(p1[d] * (1 - t) + p2[d] * t);
    }
    result.push(interpolated);
  }

  // Merge edges from both shapes
  const edges = [...shape1.edges];
  const offset = shape1.vertices.length;
  for (const [a, b] of shape2.edges) {
    const newEdge = [a % n, b % n];
    if (!edges.some(e => (e[0] === newEdge[0] && e[1] === newEdge[1]) ||
                          (e[0] === newEdge[1] && e[1] === newEdge[0]))) {
      edges.push(newEdge);
    }
  }

  return { vertices: result, edges };
}

// ============================================================================
// FEATURES SYSTEM
// ============================================================================

const POLYTOPE_TYPES = {
  hypercube: { name: 'Hypercube', generator: (n) => generateHypercubeEdges(n), minDim: 4 },
  simplex: { name: 'Simplex', generator: (n) => generateSimplex(n), minDim: 4 },
  crossPolytope: { name: 'Cross-Polytope', generator: (n) => generateCrossPolytope(n), minDim: 4 },
  cell24: { name: '24-Cell', generator: () => generate24Cell(), fixedDim: 4 },
  cell120: { name: '120-Cell', generator: () => generate120CellSimplified(), fixedDim: 4 },
  cell600: { name: '600-Cell', generator: () => generate600CellSimplified(), fixedDim: 4 },
  cliffordTorus: { name: 'Clifford Torus', generator: () => generateCliffordTorus(16), fixedDim: 4 }
};

const ROTATION_TYPES = {
  simple: { name: 'Simple', description: 'Single plane rotation' },
  compound: { name: 'Compound', description: 'Multiple planes simultaneously' },
  isoclinic: { name: 'Isoclinic', description: 'Clifford rotation (4D only)' }
};

const MORPH_TYPES = {
  none: { name: 'Static', description: 'No morphing' },
  interpolate: { name: 'Interpolate', description: 'Smooth vertex interpolation' },
  nested: { name: 'Nested', description: 'Objects inside objects' }
};

let features = {};
let originalFeatures = {};
let hasOverrides = false;

function generateFeatures() {
  R = initRandom(hash);

  const dimension = rndInt(4, 6);
  const polytypeRarity = rollRarity(0.5, 0.3, 0.15, 0.05);

  let polytopeType;
  if (polytypeRarity === 'legendary') {
    polytopeType = rndChoice(['cell120', 'cell600']);
  } else if (polytypeRarity === 'rare') {
    polytopeType = rndChoice(['cell24', 'cliffordTorus']);
  } else if (polytypeRarity === 'uncommon') {
    polytopeType = rndChoice(['crossPolytope', 'simplex']);
  } else {
    polytopeType = 'hypercube';
  }

  // If polytope has fixed dimension, use it
  const effectiveDim = POLYTOPE_TYPES[polytopeType].fixedDim || dimension;

  const rotationType = rndChoice(Object.keys(ROTATION_TYPES));
  const morphType = rndChoice(Object.keys(MORPH_TYPES));
  const palette = rndChoice(PALETTE_NAMES);

  // Rotation speeds for each possible plane
  const rotationSpeeds = {};
  const planeCount = (effectiveDim * (effectiveDim - 1)) / 2;
  for (let i = 0; i < effectiveDim; i++) {
    for (let j = i + 1; j < effectiveDim; j++) {
      const planeName = `${i}${j}`;
      if (rotationType === 'simple') {
        rotationSpeeds[planeName] = i === 0 && j === effectiveDim - 1 ? rnd(0.005, 0.02) : 0;
      } else if (rotationType === 'compound') {
        rotationSpeeds[planeName] = rnd(-0.015, 0.015);
      } else { // isoclinic
        if ((i === 0 && j === 1) || (i === 2 && j === 3)) {
          rotationSpeeds[planeName] = rnd(0.005, 0.015);
        } else {
          rotationSpeeds[planeName] = 0;
        }
      }
    }
  }

  // Secondary polytope for morphing
  let secondaryPolytope = null;
  if (morphType === 'interpolate' || morphType === 'nested') {
    const options = Object.keys(POLYTOPE_TYPES).filter(t =>
      POLYTOPE_TYPES[t].fixedDim === effectiveDim ||
      (!POLYTOPE_TYPES[t].fixedDim && POLYTOPE_TYPES[t].minDim <= effectiveDim)
    );
    secondaryPolytope = rndChoice(options.filter(t => t !== polytopeType)) || polytopeType;
  }

  const morphSpeed = rnd(0.001, 0.005);
  const viewDistance = rnd(2.5, 4);
  const wireOpacity = rnd(0.6, 1);
  const faceOpacity = rnd(0.05, 0.2);
  const lineWidth = rnd(1, 3);

  features = {
    dimension: effectiveDim,
    polytopeType,
    polytypeName: POLYTOPE_TYPES[polytopeType].name,
    rotationType,
    rotationTypeName: ROTATION_TYPES[rotationType].name,
    morphType,
    morphTypeName: MORPH_TYPES[morphType].name,
    secondaryPolytope,
    secondaryPolytopeName: secondaryPolytope ? POLYTOPE_TYPES[secondaryPolytope].name : 'None',
    palette,
    paletteName: PALETTES[palette].name,
    rotationSpeeds,
    morphSpeed,
    viewDistance,
    wireOpacity,
    faceOpacity,
    lineWidth,
    polytypeRarity
  };

  originalFeatures = { ...features, rotationSpeeds: { ...features.rotationSpeeds } };

  return features;
}

function setParameter(name, value) {
  hasOverrides = true;
  features[name] = value;
  return features;
}

function resetToOriginal() {
  features = { ...originalFeatures, rotationSpeeds: { ...originalFeatures.rotationSpeeds } };
  hasOverrides = false;
  return features;
}

function hasModifications() {
  return hasOverrides;
}

// ============================================================================
// RARITY CURVES (for dev UI)
// ============================================================================

const RARITY_CURVES = {
  polytopeType: {
    probabilities: [0.5, 0.3, 0.15, 0.05],
    labels: ['Common (Hypercube)', 'Uncommon (Cross/Simplex)', 'Rare (24-Cell/Torus)', 'Legendary (120/600-Cell)']
  },
  dimension: {
    probabilities: [0.4, 0.35, 0.25],
    labels: ['4D', '5D', '6D']
  },
  rotationType: {
    probabilities: [0.33, 0.33, 0.34],
    labels: ['Simple', 'Compound', 'Isoclinic']
  },
  morphType: {
    probabilities: [0.33, 0.33, 0.34],
    labels: ['Static', 'Interpolate', 'Nested']
  }
};

function getRarityCurves() {
  return RARITY_CURVES;
}

// ============================================================================
// FEEDBACK SYSTEM
// ============================================================================

const FEEDBACK_KEY = 'hypergeometry-feedback';

function loadFeedback() {
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || { liked: [], disliked: [] };
  } catch {
    return { liked: [], disliked: [] };
  }
}

function saveFeedback(feedback) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
}

function recordFeedback(isLike) {
  const feedback = loadFeedback();
  const entry = {
    timestamp: Date.now(),
    hash,
    features: { ...features },
    hadOverrides: hasOverrides
  };

  if (isLike) {
    feedback.liked.push(entry);
    console.log('LIKED:', entry);
  } else {
    feedback.disliked.push(entry);
    console.log('DISLIKED:', entry);
  }

  saveFeedback(feedback);
}

function getFeedbackStats() {
  const feedback = loadFeedback();
  return {
    totalLiked: feedback.liked.length,
    totalDisliked: feedback.disliked.length,
    ratio: feedback.liked.length / (feedback.liked.length + feedback.disliked.length || 1)
  };
}

function exportFeedback() {
  return loadFeedback();
}

// ============================================================================
// THREE.JS SCENE
// ============================================================================

let scene, camera, renderer, controls;
let geometryGroup;
let rotationAngles = {};
let morphProgress = 0;
let morphDirection = 1;
let primaryShape, secondaryShape, currentShape;
let isPaused = false;

function initScene() {
  const container = document.getElementById('sketch-holder');
  const width = container.clientWidth || 700;
  const height = container.clientHeight || 700;

  scene = new THREE.Scene();
  const pal = PALETTES[features.palette];
  scene.background = new THREE.Color(pal.background);

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // OrbitControls for mouse interaction
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.autoRotate = false;

  // Grid helper
  const gridSize = 4;
  const gridDivisions = 10;
  const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, pal.grid, pal.grid);
  gridHelper.position.y = -2;
  gridHelper.material.opacity = 0.3;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  geometryGroup = new THREE.Group();
  scene.add(geometryGroup);

  // Initialize rotation angles
  const n = features.dimension;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      rotationAngles[`${i}${j}`] = 0;
    }
  }

  // Generate shapes
  initShapes();

  window.addEventListener('resize', onWindowResize);
}

function initShapes() {
  const polyConfig = POLYTOPE_TYPES[features.polytopeType];
  if (polyConfig.fixedDim) {
    primaryShape = polyConfig.generator();
  } else {
    primaryShape = polyConfig.generator(features.dimension);
  }

  if (features.secondaryPolytope) {
    const secConfig = POLYTOPE_TYPES[features.secondaryPolytope];
    if (secConfig.fixedDim) {
      secondaryShape = secConfig.generator();
    } else {
      secondaryShape = secConfig.generator(features.dimension);
    }
  }

  currentShape = primaryShape;
}

function updateGeometry() {
  // Clear previous geometry
  while (geometryGroup.children.length > 0) {
    const child = geometryGroup.children[0];
    geometryGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  }

  // Get current shape (with morphing if applicable)
  let shape = currentShape;
  if (features.morphType === 'interpolate' && secondaryShape) {
    shape = morphShapes(primaryShape, secondaryShape, morphProgress);
  }

  // Apply rotations
  const n = features.dimension;
  let rotationMatrix = null;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const planeName = `${i}${j}`;
      const angle = rotationAngles[planeName] || 0;
      if (Math.abs(angle) > 0.001) {
        const planeMatrix = createPlaneRotation(n, i, j, angle);
        if (rotationMatrix) {
          rotationMatrix = multiplyMatrices(rotationMatrix, planeMatrix);
        } else {
          rotationMatrix = planeMatrix;
        }
      }
    }
  }

  // Project vertices to 3D
  const viewDistances = {};
  for (let d = 4; d <= features.dimension; d++) {
    viewDistances[d] = features.viewDistance;
  }

  const projectedVertices = shape.vertices.map(v => {
    let rotated = v;
    if (rotationMatrix) {
      // Pad vertex to match matrix dimension
      while (rotated.length < n) rotated = [...rotated, 0];
      rotated = applyMatrix(rotationMatrix, rotated);
    }
    return projectToND(rotated, 3, viewDistances);
  });

  const pal = PALETTES[features.palette];

  // Create edges (lines)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: pal.colors[0],
    transparent: true,
    opacity: features.wireOpacity,
    linewidth: features.lineWidth
  });

  for (const [a, b] of shape.edges) {
    if (a < projectedVertices.length && b < projectedVertices.length) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([
        projectedVertices[a][0], projectedVertices[a][1], projectedVertices[a][2],
        projectedVertices[b][0], projectedVertices[b][1], projectedVertices[b][2]
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const line = new THREE.Line(geometry, lineMaterial.clone());

      // Color based on average W coordinate (4th dimension depth)
      const avgW = ((shape.vertices[a]?.[3] || 0) + (shape.vertices[b]?.[3] || 0)) / 2;
      const colorIndex = Math.floor(((avgW + 1) / 2) * (pal.colors.length - 1));
      line.material.color = new THREE.Color(pal.colors[Math.max(0, Math.min(colorIndex, pal.colors.length - 1))]);

      geometryGroup.add(line);
    }
  }

  // Create vertices (points)
  const pointsGeometry = new THREE.BufferGeometry();
  const pointPositions = new Float32Array(projectedVertices.length * 3);
  const pointColors = new Float32Array(projectedVertices.length * 3);

  for (let i = 0; i < projectedVertices.length; i++) {
    pointPositions[i * 3] = projectedVertices[i][0];
    pointPositions[i * 3 + 1] = projectedVertices[i][1];
    pointPositions[i * 3 + 2] = projectedVertices[i][2];

    const w = shape.vertices[i]?.[3] || 0;
    const colorIndex = Math.floor(((w + 1) / 2) * (pal.colors.length - 1));
    const color = new THREE.Color(pal.colors[Math.max(0, Math.min(colorIndex, pal.colors.length - 1))]);
    pointColors[i * 3] = color.r;
    pointColors[i * 3 + 1] = color.g;
    pointColors[i * 3 + 2] = color.b;
  }

  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
  pointsGeometry.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));

  const pointsMaterial = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.9
  });

  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  geometryGroup.add(points);

  // Nested shape
  if (features.morphType === 'nested' && secondaryShape) {
    const scale = 0.5;
    const nestedVertices = secondaryShape.vertices.map(v => {
      let rotated = [...v];
      while (rotated.length < n) rotated.push(0);
      if (rotationMatrix) {
        rotated = applyMatrix(rotationMatrix, rotated);
      }
      return projectToND(rotated, 3, viewDistances).map(c => c * scale);
    });

    const nestedMaterial = new THREE.LineBasicMaterial({
      color: pal.colors[2],
      transparent: true,
      opacity: features.wireOpacity * 0.7
    });

    for (const [a, b] of secondaryShape.edges) {
      if (a < nestedVertices.length && b < nestedVertices.length) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
          nestedVertices[a][0], nestedVertices[a][1], nestedVertices[a][2],
          nestedVertices[b][0], nestedVertices[b][1], nestedVertices[b][2]
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const line = new THREE.Line(geometry, nestedMaterial);
        geometryGroup.add(line);
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    // Update rotation angles
    const n = features.dimension;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const planeName = `${i}${j}`;
        const speed = features.rotationSpeeds[planeName] || 0;
        rotationAngles[planeName] = (rotationAngles[planeName] || 0) + speed;
      }
    }

    // Update morph progress
    if (features.morphType === 'interpolate') {
      morphProgress += features.morphSpeed * morphDirection;
      if (morphProgress >= 1) {
        morphProgress = 1;
        morphDirection = -1;
      } else if (morphProgress <= 0) {
        morphProgress = 0;
        morphDirection = 1;
      }
    }

    updateGeometry();
  }

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById('sketch-holder');
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// ============================================================================
// PUBLIC API
// ============================================================================

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

  generateFeatures();

  // Reset scene
  while (geometryGroup.children.length > 0) {
    const child = geometryGroup.children[0];
    geometryGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  }

  // Reset rotation angles
  rotationAngles = {};
  const n = features.dimension;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      rotationAngles[`${i}${j}`] = 0;
    }
  }

  morphProgress = 0;
  morphDirection = 1;

  // Update background
  const pal = PALETTES[features.palette];
  scene.background = new THREE.Color(pal.background);

  initShapes();

  // Notify UI
  if (typeof updateUI === 'function') updateUI();
}

function saveImage() {
  renderer.render(scene, camera);
  const link = document.createElement('a');
  link.download = `hypergeometry-${hash.slice(2, 10)}.png`;
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
}

function togglePause() {
  isPaused = !isPaused;
  return isPaused;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
  generateFeatures();
  initScene();
  animate();
}

// Export for HTML
window.hypergeometry = {
  init,
  regenerate,
  saveImage,
  togglePause,
  getFeatures: () => features,
  getHash: () => hash,
  setParameter,
  resetToOriginal,
  hasModifications,
  getRarityCurves,
  recordFeedback,
  getFeedbackStats,
  exportFeedback
};
