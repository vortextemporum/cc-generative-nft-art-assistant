/**
 * HYPERGEOMETRY
 * 4D polytope visualization with morphing, CSG operations, and solid rendering
 *
 * Version: 2.2.0
 * Framework: Three.js
 *
 * Based on research from:
 * - Tesseract Explorer (tsherif.github.io/tesseract-explorer)
 * - Pardesco 4D Viewer (4d.pardesco.com)
 * - Uniform 4-polytope Wikipedia articles
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

// ============================================================================
// GLOBAL DISPLAY SETTINGS (persist across regenerations)
// ============================================================================

const displaySettings = {
  showFaces: true,
  showWireframe: true,
  showVertices: true,
  projectionType: 'perspective', // 'perspective' or 'stereographic'
  bloomEnabled: true,
  depthCueing: true, // W-based edge thickness
  pulseEnabled: false
};

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
    colors: [0xffffff, 0xcccccc, 0x999999, 0x666666, 0x444444]
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
    colors: [0x0466c8, 0x0353a4, 0x023e7d, 0x33bbff, 0x001845]
  },
  neon: {
    name: 'Neon',
    background: 0x0a0010,
    grid: 0x150020,
    colors: [0xff00ff, 0x00ffff, 0xff0080, 0x80ff00, 0xffff00]
  },
  monochrome: {
    name: 'Monochrome',
    background: 0x000000,
    grid: 0x111111,
    colors: [0xffffff, 0xdddddd, 0xaaaaaa, 0x888888, 0x666666]
  }
};

const PALETTE_NAMES = Object.keys(PALETTES);

// ============================================================================
// GEOMETRY HELPERS
// ============================================================================

function orderQuad(vertices, indices) {
  const center = [0, 0, 0, 0];
  for (const idx of indices) {
    for (let d = 0; d < 4; d++) center[d] += vertices[idx][d] / 4;
  }
  const withAngles = indices.map(idx => ({
    idx,
    angle: Math.atan2(vertices[idx][1] - center[1], vertices[idx][0] - center[0])
  }));
  withAngles.sort((a, b) => a.angle - b.angle);
  return withAngles.map(w => w.idx);
}

function permutations(arr) {
  const result = [];
  const used = new Set();
  function permute(current, remaining) {
    if (!remaining.length) {
      const key = current.join(',');
      if (!used.has(key)) {
        used.add(key);
        result.push([...current]);
      }
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      permute([...current, remaining[i]], [...remaining.slice(0, i), ...remaining.slice(i + 1)]);
    }
  }
  permute([], arr);
  return result;
}

function allSigns(n) {
  const result = [];
  for (let i = 0; i < Math.pow(2, n); i++) {
    result.push(Array.from({ length: n }, (_, d) => (i >> d) & 1 ? 1 : -1));
  }
  return result;
}

function normalize(vertices, targetRadius = 1) {
  let maxDist = 0;
  for (const v of vertices) {
    maxDist = Math.max(maxDist, Math.sqrt(v.reduce((s, x) => s + x * x, 0)));
  }
  if (maxDist > 0) {
    for (const v of vertices) {
      for (let d = 0; d < 4; d++) v[d] = (v[d] / maxDist) * targetRadius;
    }
  }
}

function findEdgesByDistance(vertices, tolerance = 1.1) {
  const distances = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dist = Math.sqrt(vertices[i].reduce((s, v, d) =>
        s + Math.pow(v - vertices[j][d], 2), 0));
      distances.push({ i, j, dist });
    }
  }
  distances.sort((a, b) => a.dist - b.dist);
  const minDist = distances[0].dist;
  return distances.filter(d => d.dist < minDist * tolerance).map(d => [d.i, d.j]);
}

function findTriangularFaces(vertices, edges) {
  const faces = [];
  const edgeSet = new Set(edges.map(([a, b]) => a < b ? `${a},${b}` : `${b},${a}`));
  const hasEdge = (a, b) => edgeSet.has(a < b ? `${a},${b}` : `${b},${a}`);

  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      if (!hasEdge(i, j)) continue;
      for (let k = j + 1; k < vertices.length; k++) {
        if (hasEdge(j, k) && hasEdge(i, k)) {
          faces.push([i, j, k]);
        }
      }
    }
  }
  return faces;
}

function findSquareFaces(vertices, edges) {
  const faces = [];
  const faceSet = new Set();
  const edgeSet = new Set(edges.map(([a, b]) => a < b ? `${a},${b}` : `${b},${a}`));
  const hasEdge = (a, b) => edgeSet.has(a < b ? `${a},${b}` : `${b},${a}`);

  // Build adjacency list
  const adj = new Map();
  for (const [a, b] of edges) {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push(b);
    adj.get(b).push(a);
  }

  for (let i = 0; i < vertices.length; i++) {
    const neighbors = adj.get(i) || [];
    for (let ni = 0; ni < neighbors.length; ni++) {
      for (let nj = ni + 1; nj < neighbors.length; nj++) {
        const j = neighbors[ni];
        const k = neighbors[nj];
        // Find vertex l that connects to both j and k but not to i
        const jNeighbors = adj.get(j) || [];
        const kNeighbors = adj.get(k) || [];
        for (const l of jNeighbors) {
          if (l !== i && l !== k && kNeighbors.includes(l) && !hasEdge(i, l)) {
            const key = [i, j, k, l].sort().join(',');
            if (!faceSet.has(key)) {
              faceSet.add(key);
              faces.push(orderQuad(vertices, [i, j, l, k]));
            }
          }
        }
      }
    }
  }
  return faces;
}

// ============================================================================
// 4D GEOMETRY GENERATORS - REGULAR POLYTOPES
// ============================================================================

/**
 * Generate tesseract (4D hypercube) - 16 vertices, 32 edges, 24 faces
 */
function generateHypercube() {
  const vertices = [];
  for (let i = 0; i < 16; i++) {
    vertices.push([
      (i & 1) ? 1 : -1,
      (i & 2) ? 1 : -1,
      (i & 4) ? 1 : -1,
      (i & 8) ? 1 : -1
    ]);
  }

  const edges = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      let diff = 0;
      for (let d = 0; d < 4; d++) {
        if (vertices[i][d] !== vertices[j][d]) diff++;
      }
      if (diff === 1) edges.push([i, j]);
    }
  }

  // Square faces (24 total)
  const faces = [];
  const faceSet = new Set();
  for (let i = 0; i < 16; i++) {
    for (let d1 = 0; d1 < 4; d1++) {
      for (let d2 = d1 + 1; d2 < 4; d2++) {
        const faceVerts = [i];
        for (let j = 0; j < 16; j++) {
          if (j === i) continue;
          let diffs = [];
          for (let d = 0; d < 4; d++) {
            if (vertices[i][d] !== vertices[j][d]) diffs.push(d);
          }
          if ((diffs.length === 1 && (diffs[0] === d1 || diffs[0] === d2)) ||
              (diffs.length === 2 && diffs[0] === d1 && diffs[1] === d2)) {
            faceVerts.push(j);
          }
        }
        if (faceVerts.length === 4) {
          const key = faceVerts.slice().sort().join(',');
          if (!faceSet.has(key)) {
            faceSet.add(key);
            faces.push(orderQuad(vertices, faceVerts));
          }
        }
      }
    }
  }

  return { vertices, edges, faces, faceType: 'quad' };
}

/**
 * Generate 5-cell (4D simplex) - 5 vertices, 10 edges, 10 triangular faces
 */
function generateSimplex() {
  const a = 1 / Math.sqrt(10);
  const b = 1 / Math.sqrt(6);
  const c = 1 / Math.sqrt(3);
  const vertices = [
    [a * 4, 0, 0, 0],
    [-a, b * 3, 0, 0],
    [-a, -b, c * 2, 0],
    [-a, -b, -c, 1],
    [-a, -b, -c, -1]
  ];

  // Center and normalize
  const center = [0, 0, 0, 0];
  for (const v of vertices) {
    for (let d = 0; d < 4; d++) center[d] += v[d] / 5;
  }
  for (const v of vertices) {
    for (let d = 0; d < 4; d++) v[d] -= center[d];
  }
  normalize(vertices);

  const edges = [];
  const faces = [];
  for (let i = 0; i < 5; i++) {
    for (let j = i + 1; j < 5; j++) {
      edges.push([i, j]);
      for (let k = j + 1; k < 5; k++) {
        faces.push([i, j, k]);
      }
    }
  }

  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate 16-cell (4D cross-polytope) - 8 vertices, 24 edges, 32 triangular faces
 */
function generateCrossPolytope() {
  const vertices = [];
  for (let d = 0; d < 4; d++) {
    const pos = [0, 0, 0, 0];
    const neg = [0, 0, 0, 0];
    pos[d] = 1;
    neg[d] = -1;
    vertices.push(pos, neg);
  }

  const edges = [];
  const faces = [];
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      if (Math.floor(i / 2) !== Math.floor(j / 2)) {
        edges.push([i, j]);
        for (let k = j + 1; k < 8; k++) {
          if (Math.floor(i / 2) !== Math.floor(k / 2) && Math.floor(j / 2) !== Math.floor(k / 2)) {
            faces.push([i, j, k]);
          }
        }
      }
    }
  }

  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate 24-cell - 24 vertices, 96 edges, 96 triangular faces
 */
function generate24Cell() {
  const vertices = [];

  // 8 vertices: permutations of (±1, 0, 0, 0)
  for (let d = 0; d < 4; d++) {
    for (const s of [-1, 1]) {
      const v = [0, 0, 0, 0];
      v[d] = s;
      vertices.push(v);
    }
  }

  // 16 vertices: (±1/2, ±1/2, ±1/2, ±1/2) scaled to same radius
  const scale = Math.sqrt(2);
  for (let i = 0; i < 16; i++) {
    vertices.push([
      ((i & 1) ? 0.5 : -0.5) * scale,
      ((i & 2) ? 0.5 : -0.5) * scale,
      ((i & 4) ? 0.5 : -0.5) * scale,
      ((i & 8) ? 0.5 : -0.5) * scale
    ]);
  }

  const edges = [];
  const targetDist = Math.sqrt(2);
  for (let i = 0; i < 24; i++) {
    for (let j = i + 1; j < 24; j++) {
      const dist = Math.sqrt(vertices[i].reduce((s, v, d) =>
        s + Math.pow(v - vertices[j][d], 2), 0));
      if (Math.abs(dist - targetDist) < 0.01) {
        edges.push([i, j]);
      }
    }
  }

  const faces = findTriangularFaces(vertices, edges);
  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate 120-cell (simplified)
 */
function generate120Cell() {
  const vertices = [];
  const phi = (1 + Math.sqrt(5)) / 2;

  const coords = [
    [2, 2, 0, 0],
    [phi * phi, phi, phi, 1 / phi],
    [phi + 2, 1, phi, 0],
  ];

  for (const base of coords) {
    for (const perm of permutations(base)) {
      for (const signs of allSigns(4)) {
        const v = perm.map((val, i) => val * signs[i]);
        if (!vertices.some(e => e.every((val, i) => Math.abs(val - v[i]) < 0.001))) {
          vertices.push(v);
        }
      }
    }
  }

  normalize(vertices);
  const edges = findEdgesByDistance(vertices);
  const faces = findTriangularFaces(vertices, edges);

  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate 600-cell (simplified)
 */
function generate600Cell() {
  const vertices = [];
  const phi = (1 + Math.sqrt(5)) / 2;

  for (let d = 0; d < 4; d++) {
    for (const s of [-1, 1]) {
      const v = [0, 0, 0, 0];
      v[d] = s;
      vertices.push(v);
    }
  }

  for (const perm of permutations([0.5, phi / 2, 1 / (2 * phi), 0])) {
    for (const signs of allSigns(4)) {
      const v = perm.map((val, i) => val * signs[i]);
      if (!vertices.some(e => e.every((val, i) => Math.abs(val - v[i]) < 0.001))) {
        vertices.push(v);
      }
    }
  }

  normalize(vertices);
  const edges = findEdgesByDistance(vertices);
  const faces = findTriangularFaces(vertices, edges);

  return { vertices, edges, faces, faceType: 'triangle' };
}

// ============================================================================
// 4D GEOMETRY GENERATORS - TRUNCATED/MODIFIED POLYTOPES
// ============================================================================

/**
 * Generate truncated tesseract - 64 vertices
 * Vertices: all permutations of (±1, ±(1+√2), ±(1+√2), ±(1+√2))
 */
function generateTruncatedTesseract() {
  const vertices = [];
  const a = 1;
  const b = 1 + Math.sqrt(2);

  // All permutations of having one coordinate be ±a and three be ±b
  for (let onePos = 0; onePos < 4; onePos++) {
    for (const signs of allSigns(4)) {
      const v = [0, 0, 0, 0];
      for (let d = 0; d < 4; d++) {
        v[d] = (d === onePos ? a : b) * signs[d];
      }
      vertices.push(v);
    }
  }

  normalize(vertices);
  const edges = findEdgesByDistance(vertices, 1.05);
  const faces = findTriangularFaces(vertices, edges);

  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate bitruncated tesseract - 96 vertices
 * Vertices: all permutations of (0, √2, 2√2, 2√2)
 */
function generateBitruncatedTesseract() {
  const vertices = [];
  const s2 = Math.sqrt(2);

  const baseCoords = [0, s2, 2 * s2, 2 * s2];

  for (const perm of permutations(baseCoords)) {
    for (const signs of allSigns(4)) {
      const v = perm.map((val, i) => val * signs[i]);
      // Skip if first non-zero coordinate is negative (to avoid duplicates with 0)
      let firstNonZero = -1;
      for (let i = 0; i < 4; i++) {
        if (Math.abs(v[i]) > 0.001) {
          firstNonZero = i;
          break;
        }
      }
      if (firstNonZero === -1 || v[firstNonZero] > 0 ||
          !vertices.some(e => e.every((val, i) => Math.abs(val - v[i]) < 0.001))) {
        if (!vertices.some(e => e.every((val, i) => Math.abs(val - v[i]) < 0.001))) {
          vertices.push(v);
        }
      }
    }
  }

  normalize(vertices);
  const edges = findEdgesByDistance(vertices, 1.05);
  const faces = findTriangularFaces(vertices, edges);

  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate truncated 5-cell - 20 vertices
 */
function generateTruncated5Cell() {
  // Start with 5-cell vertices
  const base = generateSimplex();
  const vertices = [];

  // Truncate: for each edge, add vertices at 1/3 and 2/3
  for (const [a, b] of base.edges) {
    const v1 = base.vertices[a];
    const v2 = base.vertices[b];
    vertices.push(v1.map((c, i) => c * 2/3 + v2[i] * 1/3));
    vertices.push(v1.map((c, i) => c * 1/3 + v2[i] * 2/3));
  }

  // Remove near-duplicates
  const unique = [];
  for (const v of vertices) {
    if (!unique.some(u => u.every((val, i) => Math.abs(val - v[i]) < 0.01))) {
      unique.push(v);
    }
  }

  normalize(unique);
  const edges = findEdgesByDistance(unique, 1.1);
  const faces = findTriangularFaces(unique, edges);

  return { vertices: unique, edges, faces, faceType: 'triangle' };
}

/**
 * Generate cantellated tesseract - expanded/rhombicuboctahedral cells
 */
function generateCantellatedTesseract() {
  const vertices = [];
  const a = 1;
  const b = 1 + Math.sqrt(2);

  // Permutations of (±1, ±1, ±(1+√2), ±(1+√2))
  for (let d1 = 0; d1 < 4; d1++) {
    for (let d2 = d1 + 1; d2 < 4; d2++) {
      for (const signs of allSigns(4)) {
        const v = [0, 0, 0, 0];
        for (let d = 0; d < 4; d++) {
          if (d === d1 || d === d2) {
            v[d] = a * signs[d];
          } else {
            v[d] = b * signs[d];
          }
        }
        if (!vertices.some(e => e.every((val, i) => Math.abs(val - v[i]) < 0.001))) {
          vertices.push(v);
        }
      }
    }
  }

  normalize(vertices);
  const edges = findEdgesByDistance(vertices, 1.05);
  const faces = findTriangularFaces(vertices, edges);

  return { vertices, edges, faces, faceType: 'triangle' };
}

// ============================================================================
// 4D GEOMETRY GENERATORS - PRISMS AND ANTIPRISMS
// ============================================================================

/**
 * Generate polyhedral prism (extrude a 3D polyhedron into 4D)
 */
function generatePolyhedralPrism(polyhedron3D) {
  const vertices = [];
  const edges = [];
  const faces = [];

  // Duplicate polyhedron at w = -1 and w = +1
  const n = polyhedron3D.vertices.length;
  for (const v of polyhedron3D.vertices) {
    vertices.push([v[0], v[1], v[2], -1]);
    vertices.push([v[0], v[1], v[2], 1]);
  }

  // Original polyhedron edges at w = -1 and w = +1
  for (const [a, b] of polyhedron3D.edges) {
    edges.push([a * 2, b * 2]);       // w = -1
    edges.push([a * 2 + 1, b * 2 + 1]); // w = +1
  }

  // Connect corresponding vertices between the two copies
  for (let i = 0; i < n; i++) {
    edges.push([i * 2, i * 2 + 1]);
  }

  // Faces from original polyhedron
  for (const face of polyhedron3D.faces || []) {
    faces.push(face.map(i => i * 2));
    faces.push(face.map(i => i * 2 + 1));
  }

  // Prism faces (quads connecting edges)
  for (const [a, b] of polyhedron3D.edges) {
    faces.push([a * 2, b * 2, b * 2 + 1, a * 2 + 1]);
  }

  normalize(vertices);
  return { vertices, edges, faces, faceType: 'mixed' };
}

/**
 * Generate tetrahedral prism - 8 vertices
 */
function generateTetrahedralPrism() {
  const tetrahedron = {
    vertices: [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1]
    ],
    edges: [[0,1], [0,2], [0,3], [1,2], [1,3], [2,3]],
    faces: [[0,1,2], [0,1,3], [0,2,3], [1,2,3]]
  };
  return generatePolyhedralPrism(tetrahedron);
}

/**
 * Generate octahedral prism - 12 vertices
 */
function generateOctahedralPrism() {
  const octahedron = {
    vertices: [
      [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0],
      [0, 0, 1], [0, 0, -1]
    ],
    edges: [
      [0,2], [0,3], [0,4], [0,5],
      [1,2], [1,3], [1,4], [1,5],
      [2,4], [2,5], [3,4], [3,5]
    ],
    faces: [
      [0,2,4], [0,4,3], [0,3,5], [0,5,2],
      [1,2,4], [1,4,3], [1,3,5], [1,5,2]
    ]
  };
  return generatePolyhedralPrism(octahedron);
}

/**
 * Generate icosahedral prism - 24 vertices
 */
function generateIcosahedralPrism() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const icosahedron = {
    vertices: [
      [0, 1, phi], [0, 1, -phi], [0, -1, phi], [0, -1, -phi],
      [1, phi, 0], [1, -phi, 0], [-1, phi, 0], [-1, -phi, 0],
      [phi, 0, 1], [phi, 0, -1], [-phi, 0, 1], [-phi, 0, -1]
    ],
    edges: [],
    faces: []
  };

  // Find edges (distance = 2)
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      const dist = Math.sqrt(
        icosahedron.vertices[i].reduce((s, v, d) =>
          s + Math.pow(v - icosahedron.vertices[j][d], 2), 0)
      );
      if (Math.abs(dist - 2) < 0.01) {
        icosahedron.edges.push([i, j]);
      }
    }
  }

  // Find triangular faces
  const edgeSet = new Set(icosahedron.edges.map(([a, b]) => a < b ? `${a},${b}` : `${b},${a}`));
  const hasEdge = (a, b) => edgeSet.has(a < b ? `${a},${b}` : `${b},${a}`);
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      if (!hasEdge(i, j)) continue;
      for (let k = j + 1; k < 12; k++) {
        if (hasEdge(j, k) && hasEdge(i, k)) {
          icosahedron.faces.push([i, j, k]);
        }
      }
    }
  }

  return generatePolyhedralPrism(icosahedron);
}

/**
 * Generate cube antiprism - octahedron and cube connected by pyramids
 * 14 vertices (8 cube + 6 octahedron)
 */
function generateCubeAntiprism() {
  const vertices = [];

  // Cube vertices at w = -0.5
  const cubeScale = 0.8;
  for (let i = 0; i < 8; i++) {
    vertices.push([
      ((i & 1) ? 1 : -1) * cubeScale,
      ((i & 2) ? 1 : -1) * cubeScale,
      ((i & 4) ? 1 : -1) * cubeScale,
      -0.5
    ]);
  }

  // Octahedron vertices at w = +0.5
  const octScale = 1.2;
  vertices.push([octScale, 0, 0, 0.5]);
  vertices.push([-octScale, 0, 0, 0.5]);
  vertices.push([0, octScale, 0, 0.5]);
  vertices.push([0, -octScale, 0, 0.5]);
  vertices.push([0, 0, octScale, 0.5]);
  vertices.push([0, 0, -octScale, 0.5]);

  const edges = [];
  const faces = [];

  // Cube edges
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      let diff = 0;
      for (let d = 0; d < 3; d++) {
        if (Math.abs(vertices[i][d] - vertices[j][d]) > 0.1) diff++;
      }
      if (diff === 1) edges.push([i, j]);
    }
  }

  // Octahedron edges
  for (let i = 8; i < 14; i++) {
    for (let j = i + 1; j < 14; j++) {
      if (Math.floor((i - 8) / 2) !== Math.floor((j - 8) / 2)) {
        edges.push([i, j]);
      }
    }
  }

  // Connect cube faces to octahedron vertices
  // Each cube face center is closest to one octahedron vertex
  const cubeFaces = [
    [0, 1, 3, 2], [4, 5, 7, 6], // x faces
    [0, 1, 5, 4], [2, 3, 7, 6], // y faces
    [0, 2, 6, 4], [1, 3, 7, 5]  // z faces
  ];

  for (const cf of cubeFaces) {
    const center = [0, 0, 0];
    for (const idx of cf) {
      for (let d = 0; d < 3; d++) center[d] += vertices[idx][d] / 4;
    }

    // Find closest octahedron vertex
    let minDist = Infinity;
    let closestOct = 8;
    for (let i = 8; i < 14; i++) {
      const dist = Math.sqrt(
        center.reduce((s, c, d) => s + Math.pow(c - vertices[i][d], 2), 0)
      );
      if (dist < minDist) {
        minDist = dist;
        closestOct = i;
      }
    }

    // Connect cube face vertices to octahedron vertex
    for (const idx of cf) {
      edges.push([idx, closestOct]);
    }

    // Create triangular faces
    for (let i = 0; i < 4; i++) {
      faces.push([cf[i], cf[(i + 1) % 4], closestOct]);
    }
  }

  normalize(vertices);
  return { vertices, edges, faces, faceType: 'triangle' };
}

// ============================================================================
// 4D GEOMETRY GENERATORS - OTHER POLYTOPES
// ============================================================================

/**
 * Generate Clifford torus
 */
function generateCliffordTorus(segments = 24) {
  const vertices = [];
  const edges = [];
  const faces = [];
  const r = 1 / Math.sqrt(2);

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const theta = (i / segments) * Math.PI * 2;
      const phi = (j / segments) * Math.PI * 2;
      vertices.push([r * Math.cos(theta), r * Math.sin(theta), r * Math.cos(phi), r * Math.sin(phi)]);

      const idx = i * segments + j;
      const nextI = ((i + 1) % segments) * segments + j;
      const nextJ = i * segments + ((j + 1) % segments);
      const nextIJ = ((i + 1) % segments) * segments + ((j + 1) % segments);

      edges.push([idx, nextI], [idx, nextJ]);
      faces.push([idx, nextI, nextIJ, nextJ]);
    }
  }

  return { vertices, edges, faces, faceType: 'quad' };
}

/**
 * Generate duoprism (p,q-duoprism)
 */
function generateDuoprism(p, q) {
  const vertices = [];
  const edges = [];
  const faces = [];

  for (let i = 0; i < p; i++) {
    const theta = (i / p) * Math.PI * 2;
    for (let j = 0; j < q; j++) {
      const phi = (j / q) * Math.PI * 2;
      vertices.push([Math.cos(theta), Math.sin(theta), Math.cos(phi), Math.sin(phi)]);
    }
  }

  for (let j = 0; j < q; j++) {
    for (let i = 0; i < p; i++) {
      edges.push([i * q + j, ((i + 1) % p) * q + j]);
    }
  }
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < q; j++) {
      edges.push([i * q + j, i * q + ((j + 1) % q)]);
    }
  }

  for (let i = 0; i < p; i++) {
    for (let j = 0; j < q; j++) {
      faces.push([
        i * q + j,
        ((i + 1) % p) * q + j,
        ((i + 1) % p) * q + ((j + 1) % q),
        i * q + ((j + 1) % q)
      ]);
    }
  }

  return { vertices, edges, faces, faceType: 'quad' };
}

/**
 * Generate grand antiprism
 */
function generateGrandAntiprism() {
  const vertices = [];
  const phi = (1 + Math.sqrt(5)) / 2;

  const baseVerts = [
    [1, 1, 1, 0], [1, 1, -1, 0], [1, -1, 1, 0], [1, -1, -1, 0],
    [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0],
    [0, phi, 1/phi, 0.5], [0, phi, -1/phi, 0.5], [0, -phi, 1/phi, 0.5], [0, -phi, -1/phi, 0.5],
    [0, phi, 1/phi, -0.5], [0, phi, -1/phi, -0.5], [0, -phi, 1/phi, -0.5], [0, -phi, -1/phi, -0.5],
    [1/phi, 0, phi, 0.5], [1/phi, 0, -phi, 0.5], [-1/phi, 0, phi, 0.5], [-1/phi, 0, -phi, 0.5],
    [1/phi, 0, phi, -0.5], [1/phi, 0, -phi, -0.5], [-1/phi, 0, phi, -0.5], [-1/phi, 0, -phi, -0.5],
    [phi, 1/phi, 0, 0.5], [phi, -1/phi, 0, 0.5], [-phi, 1/phi, 0, 0.5], [-phi, -1/phi, 0, 0.5],
    [phi, 1/phi, 0, -0.5], [phi, -1/phi, 0, -0.5], [-phi, 1/phi, 0, -0.5], [-phi, -1/phi, 0, -0.5],
  ];

  for (const v of baseVerts) vertices.push([...v]);
  normalize(vertices);

  const edges = findEdgesByDistance(vertices, 1.3);
  const faces = findTriangularFaces(vertices, edges);

  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate rectified tesseract
 */
function generateRectifiedTesseract() {
  const vertices = [];

  for (let zeroPos = 0; zeroPos < 4; zeroPos++) {
    for (let signs = 0; signs < 8; signs++) {
      const v = [0, 0, 0, 0];
      let signIdx = 0;
      for (let d = 0; d < 4; d++) {
        if (d !== zeroPos) {
          v[d] = (signs >> signIdx) & 1 ? 1 : -1;
          signIdx++;
        }
      }
      vertices.push(v);
    }
  }

  const edges = [];
  const targetDist = Math.sqrt(2);
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dist = Math.sqrt(vertices[i].reduce((s, v, d) =>
        s + Math.pow(v - vertices[j][d], 2), 0));
      if (Math.abs(dist - targetDist) < 0.01) edges.push([i, j]);
    }
  }

  const faces = findTriangularFaces(vertices, edges);
  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate runcinated tesseract
 */
function generateRuncinatedTesseract() {
  const vertices = [];
  const a = 1 + Math.sqrt(2);

  for (let aPos = 0; aPos < 4; aPos++) {
    for (const aSign of [-1, 1]) {
      for (let signs = 0; signs < 8; signs++) {
        const v = [0, 0, 0, 0];
        let signIdx = 0;
        for (let d = 0; d < 4; d++) {
          if (d === aPos) {
            v[d] = aSign * a;
          } else {
            v[d] = (signs >> signIdx) & 1 ? 1 : -1;
            signIdx++;
          }
        }
        vertices.push(v);
      }
    }
  }

  normalize(vertices);
  const edges = findEdgesByDistance(vertices);
  const faces = findTriangularFaces(vertices, edges);

  return { vertices, edges, faces, faceType: 'triangle' };
}

// ============================================================================
// 4D GEOMETRY GENERATORS - COMPOUND POLYTOPES
// ============================================================================

/**
 * Generate tesseract-16-cell compound (dual compound)
 * Convex hull is the 24-cell
 */
function generateTesseract16CellCompound() {
  const tesseract = generateHypercube();
  const cell16 = generateCrossPolytope();

  // Scale 16-cell to match tesseract edge length
  const scale = Math.sqrt(2);
  for (const v of cell16.vertices) {
    for (let d = 0; d < 4; d++) v[d] *= scale;
  }

  const vertices = [...tesseract.vertices, ...cell16.vertices];
  const offset = tesseract.vertices.length;
  const edges = [
    ...tesseract.edges,
    ...cell16.edges.map(([a, b]) => [a + offset, b + offset])
  ];
  const faces = [
    ...(tesseract.faces || []),
    ...(cell16.faces || []).map(f => f.map(i => i + offset))
  ];

  return { vertices, edges, faces, faceType: 'mixed' };
}

/**
 * Generate compound of two tesseracts (rotated 45 degrees in XW plane)
 */
function generate2TesseractCompound() {
  const t1 = generateHypercube();
  const t2 = generateHypercube();

  // Rotate second tesseract 45 degrees in XW plane
  const angle = Math.PI / 4;
  const c = Math.cos(angle), s = Math.sin(angle);
  for (const v of t2.vertices) {
    const x = v[0], w = v[3];
    v[0] = x * c - w * s;
    v[3] = x * s + w * c;
  }

  const vertices = [...t1.vertices, ...t2.vertices];
  const offset = t1.vertices.length;
  const edges = [
    ...t1.edges,
    ...t2.edges.map(([a, b]) => [a + offset, b + offset])
  ];
  const faces = [
    ...(t1.faces || []),
    ...(t2.faces || []).map(f => f.map(i => i + offset))
  ];

  normalize(vertices);
  return { vertices, edges, faces, faceType: 'quad' };
}

/**
 * Generate compound of five 24-cells
 */
function generate5_24CellCompound() {
  const cells = [];
  const baseCell = generate24Cell();

  for (let i = 0; i < 5; i++) {
    const cell = {
      vertices: baseCell.vertices.map(v => [...v]),
      edges: baseCell.edges.map(e => [...e]),
      faces: baseCell.faces.map(f => [...f])
    };

    // Rotate in different 4D planes
    const angle = (i * Math.PI * 2) / 5;
    const c = Math.cos(angle), s = Math.sin(angle);
    for (const v of cell.vertices) {
      // XW rotation
      const x = v[0], w = v[3];
      v[0] = x * c - w * s;
      v[3] = x * s + w * c;
      // YZ rotation (different angle)
      const angle2 = (i * Math.PI) / 5;
      const c2 = Math.cos(angle2), s2 = Math.sin(angle2);
      const y = v[1], z = v[2];
      v[1] = y * c2 - z * s2;
      v[2] = y * s2 + z * c2;
    }
    cells.push(cell);
  }

  const vertices = [];
  const edges = [];
  const faces = [];

  for (const cell of cells) {
    const offset = vertices.length;
    vertices.push(...cell.vertices);
    edges.push(...cell.edges.map(([a, b]) => [a + offset, b + offset]));
    faces.push(...cell.faces.map(f => f.map(i => i + offset)));
  }

  normalize(vertices);
  return { vertices, edges, faces, faceType: 'triangle' };
}

// ============================================================================
// 4D ROTATION
// ============================================================================

function createRotationMatrix(axis1, axis2, angle) {
  const m = [[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]];
  const c = Math.cos(angle), s = Math.sin(angle);
  m[axis1][axis1] = c; m[axis1][axis2] = -s;
  m[axis2][axis1] = s; m[axis2][axis2] = c;
  return m;
}

function multiplyMatrices(a, b) {
  const r = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        r[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return r;
}

function applyMatrix(m, v) {
  return [
    m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2] + m[0][3]*v[3],
    m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2] + m[1][3]*v[3],
    m[2][0]*v[0] + m[2][1]*v[1] + m[2][2]*v[2] + m[2][3]*v[3],
    m[3][0]*v[0] + m[3][1]*v[1] + m[3][2]*v[2] + m[3][3]*v[3]
  ];
}

// ============================================================================
// PROJECTION (4D -> 3D)
// ============================================================================

function projectPerspective(point4D, viewDistance) {
  const w = point4D[3];
  const scale = viewDistance / (viewDistance - w);
  return [point4D[0] * scale, point4D[1] * scale, point4D[2] * scale];
}

function projectStereographic(point4D) {
  const norm = Math.sqrt(point4D.reduce((s, x) => s + x * x, 0));
  const normalized = point4D.map(x => x / norm);
  const w = normalized[3];
  const denom = 1 - w + 0.001;
  return [normalized[0] / denom, normalized[1] / denom, normalized[2] / denom];
}

function project4Dto3D(point4D, viewDistance) {
  if (displaySettings.projectionType === 'stereographic') {
    return projectStereographic(point4D);
  }
  return projectPerspective(point4D, viewDistance);
}

// ============================================================================
// CSG OPERATIONS
// ============================================================================

function csgUnion(shape1, shape2, offset = [0, 0, 0, 0]) {
  const vertices = [...shape1.vertices];
  const vOffset = vertices.length;

  for (const v of shape2.vertices) {
    vertices.push(v.map((c, i) => c + (offset[i] || 0)));
  }

  const edges = [...shape1.edges, ...shape2.edges.map(([a, b]) => [a + vOffset, b + vOffset])];
  const faces = [...(shape1.faces || []), ...(shape2.faces || []).map(f => f.map(i => i + vOffset))];

  return { vertices, edges, faces, faceType: shape1.faceType };
}

function csgIntersection(shape1, shape2, threshold = 1.5) {
  const vertices = [];
  const vertexMap = new Map();

  for (let i = 0; i < shape1.vertices.length; i++) {
    const v1 = shape1.vertices[i];
    let minDist = Infinity;
    for (const v2 of shape2.vertices) {
      minDist = Math.min(minDist, Math.sqrt(v1.reduce((s, x, d) => s + Math.pow(x - v2[d], 2), 0)));
    }
    if (minDist < threshold) {
      vertexMap.set(i, vertices.length);
      vertices.push([...v1]);
    }
  }

  const edges = shape1.edges.filter(([a, b]) => vertexMap.has(a) && vertexMap.has(b))
    .map(([a, b]) => [vertexMap.get(a), vertexMap.get(b)]);
  const faces = (shape1.faces || []).filter(f => f.every(i => vertexMap.has(i)))
    .map(f => f.map(i => vertexMap.get(i)));

  return { vertices, edges, faces, faceType: shape1.faceType };
}

function csgDifference(shape1, shape2, threshold = 0.3) {
  const vertices = [];
  const vertexMap = new Map();

  for (let i = 0; i < shape1.vertices.length; i++) {
    const v1 = shape1.vertices[i];
    let minDist = Infinity;
    for (const v2 of shape2.vertices) {
      minDist = Math.min(minDist, Math.sqrt(v1.reduce((s, x, d) => s + Math.pow(x - v2[d], 2), 0)));
    }
    if (minDist >= threshold) {
      vertexMap.set(i, vertices.length);
      vertices.push([...v1]);
    }
  }

  const edges = shape1.edges.filter(([a, b]) => vertexMap.has(a) && vertexMap.has(b))
    .map(([a, b]) => [vertexMap.get(a), vertexMap.get(b)]);
  const faces = (shape1.faces || []).filter(f => f.every(i => vertexMap.has(i)))
    .map(f => f.map(i => vertexMap.get(i)));

  return { vertices, edges, faces, faceType: shape1.faceType };
}

// ============================================================================
// MORPHING
// ============================================================================

function morphShapes(shape1, shape2, t) {
  const n = Math.max(shape1.vertices.length, shape2.vertices.length);
  const vertices = [];

  for (let i = 0; i < n; i++) {
    const p1 = shape1.vertices[i % shape1.vertices.length];
    const p2 = shape2.vertices[i % shape2.vertices.length];
    vertices.push(p1.map((v, d) => v * (1 - t) + p2[d] * t));
  }

  const faces = t < 0.5 ? shape1.faces : shape2.faces;
  const edges = [...shape1.edges];
  for (const [a, b] of shape2.edges) {
    if (!edges.some(e => (e[0] === a % n && e[1] === b % n) || (e[0] === b % n && e[1] === a % n))) {
      edges.push([a % n, b % n]);
    }
  }

  return { vertices, edges, faces, faceType: t < 0.5 ? shape1.faceType : shape2.faceType };
}

// ============================================================================
// POLYTOPE REGISTRY
// ============================================================================

const POLYTOPES = {
  // Regular polytopes
  hypercube: { name: 'Tesseract', generator: generateHypercube, category: 'regular' },
  simplex: { name: '5-Cell', generator: generateSimplex, category: 'regular' },
  crossPolytope: { name: '16-Cell', generator: generateCrossPolytope, category: 'regular' },
  cell24: { name: '24-Cell', generator: generate24Cell, category: 'regular' },
  cell120: { name: '120-Cell', generator: generate120Cell, category: 'regular' },
  cell600: { name: '600-Cell', generator: generate600Cell, category: 'regular' },

  // Truncated/modified
  truncatedTesseract: { name: 'Truncated Tesseract', generator: generateTruncatedTesseract, category: 'truncated' },
  bitruncatedTesseract: { name: 'Bitruncated Tesseract', generator: generateBitruncatedTesseract, category: 'truncated' },
  truncated5Cell: { name: 'Truncated 5-Cell', generator: generateTruncated5Cell, category: 'truncated' },
  cantellatedTesseract: { name: 'Cantellated Tesseract', generator: generateCantellatedTesseract, category: 'truncated' },
  rectifiedTesseract: { name: 'Rectified Tesseract', generator: generateRectifiedTesseract, category: 'truncated' },
  runcinatedTesseract: { name: 'Runcinated Tesseract', generator: generateRuncinatedTesseract, category: 'truncated' },

  // Prisms and antiprisms
  tetrahedralPrism: { name: 'Tetrahedral Prism', generator: generateTetrahedralPrism, category: 'prism' },
  octahedralPrism: { name: 'Octahedral Prism', generator: generateOctahedralPrism, category: 'prism' },
  icosahedralPrism: { name: 'Icosahedral Prism', generator: generateIcosahedralPrism, category: 'prism' },
  cubeAntiprism: { name: 'Cube Antiprism', generator: generateCubeAntiprism, category: 'prism' },

  // Duoprisms and tori
  cliffordTorus: { name: 'Clifford Torus', generator: () => generateCliffordTorus(24), category: 'torus' },
  duoprism33: { name: '3,3-Duoprism', generator: () => generateDuoprism(3, 3), category: 'duoprism' },
  duoprism44: { name: '4,4-Duoprism', generator: () => generateDuoprism(4, 4), category: 'duoprism' },
  duoprism55: { name: '5,5-Duoprism', generator: () => generateDuoprism(5, 5), category: 'duoprism' },
  duoprism66: { name: '6,6-Duoprism', generator: () => generateDuoprism(6, 6), category: 'duoprism' },
  duoprism34: { name: '3,4-Duoprism', generator: () => generateDuoprism(3, 4), category: 'duoprism' },
  duoprism35: { name: '3,5-Duoprism', generator: () => generateDuoprism(3, 5), category: 'duoprism' },
  duoprism46: { name: '4,6-Duoprism', generator: () => generateDuoprism(4, 6), category: 'duoprism' },
  duoprism58: { name: '5,8-Duoprism', generator: () => generateDuoprism(5, 8), category: 'duoprism' },

  // Compounds
  tesseract16CellCompound: { name: 'Tesseract-16Cell Compound', generator: generateTesseract16CellCompound, category: 'compound' },
  twoTesseractCompound: { name: '2-Tesseract Compound', generator: generate2TesseractCompound, category: 'compound' },
  five24CellCompound: { name: '5-24Cell Compound', generator: generate5_24CellCompound, category: 'compound' },

  // Other
  grandAntiprism: { name: 'Grand Antiprism', generator: generateGrandAntiprism, category: 'other' }
};

const POLYTOPE_KEYS = Object.keys(POLYTOPES);

const ROTATION_TYPES = {
  simple: { name: 'Simple', description: 'Single plane rotation' },
  compound: { name: 'Compound', description: 'Multiple planes simultaneously' },
  isoclinic: { name: 'Isoclinic', description: 'Clifford double rotation' },
  tumbling: { name: 'Tumbling', description: 'Oscillating multi-plane' }
};

const ROTATION_KEYS = Object.keys(ROTATION_TYPES);

const MORPH_TYPES = {
  none: { name: 'Static' },
  interpolate: { name: 'Interpolate' },
  nested: { name: 'Nested' }
};

const MORPH_KEYS = Object.keys(MORPH_TYPES);

const CSG_TYPES = {
  none: { name: 'None' },
  union: { name: 'Union' },
  intersection: { name: 'Intersection' },
  difference: { name: 'Difference' }
};

const CSG_KEYS = Object.keys(CSG_TYPES);

// ============================================================================
// FEATURES
// ============================================================================

let features = {};

function generateFeatures() {
  R = initRandom(hash);

  const polytopeType = rndChoice(POLYTOPE_KEYS);
  const rotationType = rndChoice(ROTATION_KEYS);
  const morphType = rndChoice(MORPH_KEYS);
  const csgType = rndChoice(CSG_KEYS);
  const palette = rndChoice(PALETTE_NAMES);

  // Rotation speeds (slow for meditative feel)
  const rotationSpeeds = {};
  const planes = ['01', '02', '03', '12', '13', '23'];

  if (rotationType === 'simple') {
    const activePlane = rndChoice(planes.filter(p => p.includes('3')));
    for (const p of planes) {
      rotationSpeeds[p] = p === activePlane ? rnd(0.001, 0.004) : 0;
    }
  } else if (rotationType === 'compound') {
    for (const p of planes) {
      rotationSpeeds[p] = rnd(-0.003, 0.003);
    }
  } else if (rotationType === 'isoclinic') {
    rotationSpeeds['01'] = rnd(0.001, 0.003);
    rotationSpeeds['23'] = rotationSpeeds['01'];
    for (const p of ['02', '03', '12', '13']) {
      rotationSpeeds[p] = 0;
    }
  } else { // tumbling
    const active1 = rndChoice(planes);
    const active2 = rndChoice(planes.filter(p => p !== active1));
    for (const p of planes) {
      if (p === active1) rotationSpeeds[p] = rnd(0.002, 0.005);
      else if (p === active2) rotationSpeeds[p] = rnd(-0.003, -0.001);
      else rotationSpeeds[p] = 0;
    }
  }

  let secondaryPolytope = null;
  if (morphType !== 'none' || csgType !== 'none') {
    secondaryPolytope = rndChoice(POLYTOPE_KEYS.filter(k => k !== polytopeType));
  }

  features = {
    polytopeType,
    polytopeName: POLYTOPES[polytopeType].name,
    polytopeCategory: POLYTOPES[polytopeType].category,
    rotationType,
    rotationTypeName: ROTATION_TYPES[rotationType].name,
    morphType,
    morphTypeName: MORPH_TYPES[morphType].name,
    csgType,
    csgTypeName: CSG_TYPES[csgType].name,
    secondaryPolytope,
    secondaryPolytopeName: secondaryPolytope ? POLYTOPES[secondaryPolytope].name : 'None',
    palette,
    paletteName: PALETTES[palette].name,
    rotationSpeeds,
    morphSpeed: rnd(0.0005, 0.002),
    viewDistance: rnd(2.5, 4),
    wireOpacity: rnd(0.5, 0.9),
    faceOpacity: rnd(0.08, 0.25),
    csgOffset: [rnd(-0.3, 0.3), rnd(-0.3, 0.3), rnd(-0.3, 0.3), rnd(-0.3, 0.3)],
    pulseSpeed: rnd(0.5, 1.5),
    pulseAmount: rnd(0.05, 0.15),
    bloomStrength: rnd(0.3, 0.8),
    bloomRadius: rnd(0.2, 0.6)
  };

  return features;
}

function setFeature(key, value) {
  features[key] = value;

  if (key === 'polytopeType') {
    features.polytopeName = POLYTOPES[value].name;
    features.polytopeCategory = POLYTOPES[value].category;
    initShapes();
  } else if (key === 'rotationType') {
    features.rotationTypeName = ROTATION_TYPES[value].name;
  } else if (key === 'morphType') {
    features.morphTypeName = MORPH_TYPES[value].name;
  } else if (key === 'csgType') {
    features.csgTypeName = CSG_TYPES[value].name;
    initShapes();
  } else if (key === 'secondaryPolytope') {
    features.secondaryPolytopeName = value ? POLYTOPES[value].name : 'None';
    initShapes();
  } else if (key === 'palette') {
    features.paletteName = PALETTES[value].name;
    updatePalette();
  }
}

// ============================================================================
// THREE.JS SCENE
// ============================================================================

let scene, camera, renderer, controls;
let geometryGroup, gridHelper;
let composer, bloomPass;
let rotationAngles = { '01': 0, '02': 0, '03': 0, '12': 0, '13': 0, '23': 0 };
let morphProgress = 0, morphDirection = 1;
let primaryShape, secondaryShape, currentShape;
let isPaused = false;
let pulseTime = 0;

function initScene() {
  const container = document.getElementById('sketch-holder');
  const width = container.clientWidth || 700;
  const height = container.clientHeight || 700;

  scene = new THREE.Scene();
  updatePalette();

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.sortObjects = true;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 1.5;
  container.appendChild(renderer.domElement);

  // Post-processing with bloom (graceful fallback if not available)
  try {
    if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') {
      composer = new THREE.EffectComposer(renderer);
      const renderPass = new THREE.RenderPass(scene, camera);
      composer.addPass(renderPass);

      bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(width, height),
        features.bloomStrength || 0.5,
        features.bloomRadius || 0.4,
        0.2
      );
      composer.addPass(bloomPass);
    }
  } catch (e) {
    console.warn('Bloom effect not available:', e);
    composer = null;
    bloomPass = null;
  }

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const pal = PALETTES[features.palette];
  gridHelper = new THREE.GridHelper(4, 10, pal.grid, pal.grid);
  gridHelper.position.y = -2;
  gridHelper.material.opacity = 0.3;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  geometryGroup = new THREE.Group();
  scene.add(geometryGroup);

  initShapes();
  window.addEventListener('resize', onWindowResize);
}

function updatePalette() {
  const pal = PALETTES[features.palette];
  scene.background = new THREE.Color(pal.background);
  if (gridHelper) {
    gridHelper.material.color = new THREE.Color(pal.grid);
  }
}

function updateBloom() {
  if (bloomPass) {
    bloomPass.strength = displaySettings.bloomEnabled ? (features.bloomStrength || 0.5) : 0;
    bloomPass.radius = features.bloomRadius || 0.4;
  }
}

function initShapes() {
  primaryShape = POLYTOPES[features.polytopeType].generator();

  if (features.secondaryPolytope) {
    secondaryShape = POLYTOPES[features.secondaryPolytope].generator();
  } else {
    secondaryShape = null;
  }

  if (features.csgType !== 'none' && secondaryShape) {
    let result;
    switch (features.csgType) {
      case 'union':
        result = csgUnion(primaryShape, secondaryShape, features.csgOffset);
        break;
      case 'intersection':
        result = csgIntersection(primaryShape, secondaryShape, 1.5);
        break;
      case 'difference':
        result = csgDifference(primaryShape, secondaryShape, 0.3);
        break;
    }
    currentShape = (result && result.vertices.length >= 3) ? result : primaryShape;
  } else {
    currentShape = primaryShape;
  }
}

function clearGeometry() {
  while (geometryGroup.children.length > 0) {
    const child = geometryGroup.children[0];
    geometryGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
      else child.material.dispose();
    }
  }
}

function updateGeometry() {
  clearGeometry();

  let shape = currentShape;
  if (features.morphType === 'interpolate' && secondaryShape && features.csgType === 'none') {
    shape = morphShapes(primaryShape, secondaryShape, morphProgress);
  }

  // Pulse scaling
  let pulseScale = 1;
  if (displaySettings.pulseEnabled) {
    pulseScale = 1 + Math.sin(pulseTime * features.pulseSpeed) * features.pulseAmount;
  }

  // Build rotation matrix
  let matrix = null;
  const planeMap = { '01': [0, 1], '02': [0, 2], '03': [0, 3], '12': [1, 2], '13': [1, 3], '23': [2, 3] };

  for (const [plane, [a1, a2]] of Object.entries(planeMap)) {
    const angle = rotationAngles[plane] || 0;
    if (Math.abs(angle) > 0.001) {
      const r = createRotationMatrix(a1, a2, angle);
      matrix = matrix ? multiplyMatrices(matrix, r) : r;
    }
  }

  // Project vertices
  const projected = shape.vertices.map(v => {
    const scaled = v.map(c => c * pulseScale);
    const rotated = matrix ? applyMatrix(matrix, scaled) : scaled;
    return project4Dto3D(rotated, features.viewDistance);
  });

  const wCoords = shape.vertices.map(v => {
    const scaled = v.map(c => c * pulseScale);
    const rotated = matrix ? applyMatrix(matrix, scaled) : scaled;
    return rotated[3];
  });

  const pal = PALETTES[features.palette];

  // Faces
  if (displaySettings.showFaces && shape.faces && shape.faces.length > 0) {
    const positions = [], colors = [];

    for (const face of shape.faces) {
      const triangles = face.length === 3 ? [[0, 1, 2]] :
                        face.length === 4 ? [[0, 1, 2], [0, 2, 3]] :
                        Array.from({ length: face.length - 2 }, (_, i) => [0, i + 1, i + 2]);

      for (const tri of triangles) {
        for (const i of tri) {
          const idx = face[i];
          if (idx < projected.length) {
            const v = projected[idx];
            positions.push(v[0], v[1], v[2]);
            const w = wCoords[idx];
            const ci = Math.floor(((w + 1) / 2) * (pal.colors.length - 1));
            const color = new THREE.Color(pal.colors[Math.max(0, Math.min(ci, pal.colors.length - 1))]);
            colors.push(color.r, color.g, color.b);
          }
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, opacity: features.faceOpacity,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 0;
    geometryGroup.add(mesh);
  }

  // Edges with depth cueing
  if (displaySettings.showWireframe) {
    for (const [a, b] of shape.edges) {
      if (a < projected.length && b < projected.length) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute([
          ...projected[a], ...projected[b]
        ], 3));

        const avgW = (wCoords[a] + wCoords[b]) / 2;
        const ci = Math.floor(((avgW + 1) / 2) * (pal.colors.length - 1));
        const color = pal.colors[Math.max(0, Math.min(ci, pal.colors.length - 1))];

        // Depth-based opacity
        let opacity = features.wireOpacity;
        if (displaySettings.depthCueing) {
          opacity = features.wireOpacity * (0.5 + 0.5 * ((avgW + 1) / 2));
        }

        const mat = new THREE.LineBasicMaterial({
          color, transparent: true, opacity
        });

        const line = new THREE.Line(geo, mat);
        line.renderOrder = 1;
        geometryGroup.add(line);
      }
    }
  }

  // Vertices
  if (displaySettings.showVertices) {
    const positions = new Float32Array(projected.length * 3);
    const colors = new Float32Array(projected.length * 3);
    const sizes = new Float32Array(projected.length);

    for (let i = 0; i < projected.length; i++) {
      positions[i * 3] = projected[i][0];
      positions[i * 3 + 1] = projected[i][1];
      positions[i * 3 + 2] = projected[i][2];

      const w = wCoords[i];
      const ci = Math.floor(((w + 1) / 2) * (pal.colors.length - 1));
      const color = new THREE.Color(pal.colors[Math.max(0, Math.min(ci, pal.colors.length - 1))]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Depth-based size
      sizes[i] = displaySettings.depthCueing ? 0.04 + 0.04 * ((w + 1) / 2) : 0.06;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });
    const points = new THREE.Points(geo, mat);
    points.renderOrder = 2;
    geometryGroup.add(points);
  }

  // Nested shape
  if (features.morphType === 'nested' && secondaryShape && features.csgType === 'none') {
    renderNestedShape(secondaryShape, matrix, 0.5 * pulseScale);
  }
}

function renderNestedShape(shape, matrix, scale) {
  const pal = PALETTES[features.palette];

  const projected = shape.vertices.map(v => {
    const rotated = matrix ? applyMatrix(matrix, v) : v;
    return project4Dto3D(rotated, features.viewDistance).map(c => c * scale);
  });

  if (displaySettings.showFaces && shape.faces) {
    const positions = [], colors = [];
    for (const face of shape.faces) {
      const triangles = face.length === 3 ? [[0, 1, 2]] :
                        face.length === 4 ? [[0, 1, 2], [0, 2, 3]] :
                        Array.from({ length: face.length - 2 }, (_, i) => [0, i + 1, i + 2]);

      for (const tri of triangles) {
        for (const i of tri) {
          const idx = face[i];
          if (idx < projected.length) {
            positions.push(...projected[idx]);
            const color = new THREE.Color(pal.colors[2]);
            colors.push(color.r, color.g, color.b);
          }
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, opacity: features.faceOpacity * 0.6,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
    });

    geometryGroup.add(new THREE.Mesh(geo, mat));
  }

  if (displaySettings.showWireframe) {
    const mat = new THREE.LineBasicMaterial({
      color: pal.colors[2], transparent: true, opacity: features.wireOpacity * 0.6
    });

    for (const [a, b] of shape.edges) {
      if (a < projected.length && b < projected.length) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute([...projected[a], ...projected[b]], 3));
        geometryGroup.add(new THREE.Line(geo, mat));
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    for (const plane of Object.keys(rotationAngles)) {
      rotationAngles[plane] += features.rotationSpeeds[plane] || 0;
    }

    if (features.morphType === 'interpolate' && features.csgType === 'none') {
      morphProgress += features.morphSpeed * morphDirection;
      if (morphProgress >= 1 || morphProgress <= 0) {
        morphDirection *= -1;
        morphProgress = Math.max(0, Math.min(1, morphProgress));
      }
    }

    pulseTime += 0.016; // ~60fps

    updateGeometry();
  }

  controls.update();

  if (composer && displaySettings.bloomEnabled) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

function onWindowResize() {
  const container = document.getElementById('sketch-holder');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  if (composer) {
    composer.setSize(container.clientWidth, container.clientHeight);
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

  generateFeatures();
  clearGeometry();

  for (const k of Object.keys(rotationAngles)) rotationAngles[k] = 0;
  morphProgress = 0;
  morphDirection = 1;
  pulseTime = 0;

  updatePalette();
  updateBloom();
  initShapes();

  if (typeof window.updateUI === 'function') window.updateUI();
}

function saveImage() {
  if (composer && displaySettings.bloomEnabled) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
  const link = document.createElement('a');
  link.download = `hypergeometry-${hash.slice(2, 10)}.png`;
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
}

function togglePause() {
  isPaused = !isPaused;
  return isPaused;
}

function init() {
  generateFeatures();
  initScene();
  updateBloom();
  animate();
}

window.hypergeometry = {
  init,
  regenerate,
  saveImage,
  togglePause,
  getFeatures: () => features,
  getHash: () => hash,
  setFeature,
  displaySettings,
  POLYTOPES,
  POLYTOPE_KEYS,
  ROTATION_TYPES,
  ROTATION_KEYS,
  MORPH_TYPES,
  MORPH_KEYS,
  CSG_TYPES,
  CSG_KEYS,
  PALETTES,
  PALETTE_NAMES,
  initShapes,
  updatePalette,
  updateBloom
};
