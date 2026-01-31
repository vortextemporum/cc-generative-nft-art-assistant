/**
 * HYPERGEOMETRY
 * N-dimensional polytope visualization with morphing, CSG operations, and solid rendering
 *
 * Version: 2.0.1
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
    colors: [0x7b2cbf, 0x9d4edd, 0xc77dff, 0xe0aaff, 0x3c096c],
    faceAlpha: 0.15
  },
  glacier: {
    name: 'Glacier',
    background: 0x0d1117,
    grid: 0x1a2332,
    colors: [0x48cae4, 0x90e0ef, 0xade8f4, 0xcaf0f8, 0x0077b6],
    faceAlpha: 0.12
  },
  ember: {
    name: 'Ember',
    background: 0x140c08,
    grid: 0x2a1810,
    colors: [0xff6b35, 0xf7931e, 0xffcc02, 0xff4d6d, 0xc9184a],
    faceAlpha: 0.18
  },
  void: {
    name: 'Void',
    background: 0x050505,
    grid: 0x151515,
    colors: [0xffffff, 0xcccccc, 0x999999, 0x666666, 0x444444],
    faceAlpha: 0.1
  },
  aurora: {
    name: 'Aurora',
    background: 0x0a0f14,
    grid: 0x152028,
    colors: [0x00ff87, 0x60efff, 0xff00ff, 0xffff00, 0x00ffff],
    faceAlpha: 0.12
  },
  matrix: {
    name: 'Matrix',
    background: 0x000800,
    grid: 0x001a00,
    colors: [0x00ff00, 0x00cc00, 0x009900, 0x00ff66, 0x33ff33],
    faceAlpha: 0.15
  },
  sunset: {
    name: 'Sunset',
    background: 0x1a0a14,
    grid: 0x2a1424,
    colors: [0xff6b6b, 0xfeca57, 0xff9ff3, 0x54a0ff, 0x5f27cd],
    faceAlpha: 0.14
  },
  ocean: {
    name: 'Ocean',
    background: 0x0a1628,
    grid: 0x142238,
    colors: [0x0466c8, 0x0353a4, 0x023e7d, 0x33bbff, 0x001845],
    faceAlpha: 0.16
  }
};

const PALETTE_NAMES = Object.keys(PALETTES);

// ============================================================================
// N-DIMENSIONAL GEOMETRY WITH FACES
// ============================================================================

/**
 * Generate vertices, edges, and faces of an N-dimensional hypercube
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

  // Edges: vertices differing in exactly one coordinate
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

  // Faces: 2D faces are squares defined by 4 vertices differing in exactly 2 coordinates
  const faces = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let d1 = 0; d1 < n; d1++) {
      for (let d2 = d1 + 1; d2 < n; d2++) {
        // Find the 4 vertices of this square face
        const faceVerts = [i];
        for (let j = 0; j < vertices.length; j++) {
          if (j === i) continue;
          let diffDims = [];
          for (let d = 0; d < n; d++) {
            if (vertices[i][d] !== vertices[j][d]) diffDims.push(d);
          }
          if (diffDims.length === 1 && (diffDims[0] === d1 || diffDims[0] === d2)) {
            faceVerts.push(j);
          } else if (diffDims.length === 2 && diffDims[0] === d1 && diffDims[1] === d2) {
            faceVerts.push(j);
          }
        }
        if (faceVerts.length === 4) {
          // Order vertices for proper winding
          const ordered = orderQuadVertices(vertices, faceVerts);
          // Avoid duplicates
          const key = ordered.slice().sort().join(',');
          if (!faces.some(f => f.slice().sort().join(',') === key)) {
            faces.push(ordered);
          }
        }
      }
    }
  }

  return { vertices, edges, faces, faceType: 'quad' };
}

/**
 * Order quad vertices for proper rendering
 */
function orderQuadVertices(vertices, indices) {
  const center = [0, 0, 0, 0, 0, 0].slice(0, vertices[0].length);
  for (const idx of indices) {
    for (let d = 0; d < vertices[0].length; d++) {
      center[d] += vertices[idx][d] / 4;
    }
  }

  // Sort by angle around center
  const withAngles = indices.map(idx => {
    const v = vertices[idx];
    const dx = v[0] - center[0];
    const dy = v[1] - center[1];
    return { idx, angle: Math.atan2(dy, dx) };
  });
  withAngles.sort((a, b) => a.angle - b.angle);
  return withAngles.map(w => w.idx);
}

/**
 * Generate N-dimensional simplex with faces
 */
function generateSimplex(n) {
  const vertices = [];

  // Standard construction
  for (let i = 0; i <= n; i++) {
    const vertex = new Array(n).fill(0);
    if (i < n) {
      vertex[i] = 1;
    } else {
      const val = (1 - Math.sqrt(n + 1)) / n;
      for (let d = 0; d < n; d++) {
        vertex[d] = val;
      }
    }
    vertices.push(vertex);
  }

  // Center and normalize
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

  // All vertices connected
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      edges.push([i, j]);
    }
  }

  // Triangular faces (all combinations of 3 vertices)
  const faces = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      for (let k = j + 1; k < vertices.length; k++) {
        faces.push([i, j, k]);
      }
    }
  }

  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate N-dimensional cross-polytope with faces
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

  // Edges connect non-antipodal vertices
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const axisI = Math.floor(i / 2);
      const axisJ = Math.floor(j / 2);
      if (axisI !== axisJ) {
        edges.push([i, j]);
      }
    }
  }

  // Triangular faces
  const faces = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      for (let k = j + 1; k < vertices.length; k++) {
        const axisI = Math.floor(i / 2);
        const axisJ = Math.floor(j / 2);
        const axisK = Math.floor(k / 2);
        // All three must be on different axes
        if (axisI !== axisJ && axisJ !== axisK && axisI !== axisK) {
          faces.push([i, j, k]);
        }
      }
    }
  }

  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate 24-cell (4D only) with faces
 */
function generate24Cell() {
  const vertices = [];

  // 8 vertices from permutations of (±1, 0, 0, 0)
  for (let d = 0; d < 4; d++) {
    for (const sign of [-1, 1]) {
      const v = [0, 0, 0, 0];
      v[d] = sign;
      vertices.push(v);
    }
  }

  // 16 vertices at (±0.5, ±0.5, ±0.5, ±0.5) scaled
  const scale = 1 / Math.sqrt(0.5);
  for (let i = 0; i < 16; i++) {
    const v = [];
    for (let d = 0; d < 4; d++) {
      v.push(((i >> d) & 1 ? 0.5 : -0.5) * scale);
    }
    vertices.push(v);
  }

  // Edges at distance sqrt(2)
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

  // Triangular faces (find equilateral triangles)
  const faces = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      for (let k = j + 1; k < vertices.length; k++) {
        // Check if all three edges exist
        const hasIJ = edges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i));
        const hasJK = edges.some(e => (e[0] === j && e[1] === k) || (e[0] === k && e[1] === j));
        const hasIK = edges.some(e => (e[0] === i && e[1] === k) || (e[0] === k && e[1] === i));
        if (hasIJ && hasJK && hasIK) {
          faces.push([i, j, k]);
        }
      }
    }
  }

  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate 120-cell simplified with faces
 */
function generate120CellSimplified() {
  const vertices = [];
  const phi = (1 + Math.sqrt(5)) / 2;

  // Core vertices
  const coords = [
    [2, 2, 0, 0],
    [phi * phi, phi, phi, 1 / phi],
    [phi + 2, 1, phi, 0],
  ];

  for (const base of coords) {
    const perms = permutations4D(base);
    for (const p of perms) {
      const signs = generateSigns(4);
      for (const s of signs) {
        const v = p.map((val, i) => val * s[i]);
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

  // Generate pentagonal faces (120-cell has dodecahedral cells)
  const faces = findPentagonalFaces(vertices, edges);

  return { vertices, edges, faces, faceType: 'pentagon' };
}

/**
 * Generate 600-cell simplified with faces
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

  // Additional golden ratio vertices
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

  // Triangular faces (600-cell has tetrahedral cells)
  const faces = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      for (let k = j + 1; k < vertices.length; k++) {
        const hasIJ = edges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i));
        const hasJK = edges.some(e => (e[0] === j && e[1] === k) || (e[0] === k && e[1] === j));
        const hasIK = edges.some(e => (e[0] === i && e[1] === k) || (e[0] === k && e[1] === i));
        if (hasIJ && hasJK && hasIK) {
          faces.push([i, j, k]);
        }
      }
    }
  }

  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate Clifford torus with faces
 */
function generateCliffordTorus(segments = 20) {
  const vertices = [];
  const edges = [];
  const faces = [];

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
      const nextIJ = ((i + 1) % segments) * segments + ((j + 1) % segments);

      edges.push([idx, nextI]);
      edges.push([idx, nextJ]);

      // Quad faces
      faces.push([idx, nextI, nextIJ, nextJ]);
    }
  }

  return { vertices, edges, faces, faceType: 'quad' };
}

/**
 * Generate duoprism (p,q-duoprism)
 * Product of p-gon and q-gon in 4D
 */
function generateDuoprism(p, q) {
  const vertices = [];
  const edges = [];
  const faces = [];

  // Generate vertices as Cartesian product of two regular polygons
  for (let i = 0; i < p; i++) {
    const theta = (i / p) * Math.PI * 2;
    for (let j = 0; j < q; j++) {
      const phi = (j / q) * Math.PI * 2;
      vertices.push([
        Math.cos(theta),
        Math.sin(theta),
        Math.cos(phi),
        Math.sin(phi)
      ]);
    }
  }

  // Edges within each p-gon (q copies)
  for (let j = 0; j < q; j++) {
    for (let i = 0; i < p; i++) {
      const idx1 = i * q + j;
      const idx2 = ((i + 1) % p) * q + j;
      edges.push([idx1, idx2]);
    }
  }

  // Edges within each q-gon (p copies)
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < q; j++) {
      const idx1 = i * q + j;
      const idx2 = i * q + ((j + 1) % q);
      edges.push([idx1, idx2]);
    }
  }

  // Square faces connecting p-gons to q-gons
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < q; j++) {
      const idx00 = i * q + j;
      const idx10 = ((i + 1) % p) * q + j;
      const idx01 = i * q + ((j + 1) % q);
      const idx11 = ((i + 1) % p) * q + ((j + 1) % q);
      faces.push([idx00, idx10, idx11, idx01]);
    }
  }

  return { vertices, edges, faces, faceType: 'quad', name: `${p},${q}-Duoprism` };
}

/**
 * Generate grand antiprism (4D)
 */
function generateGrandAntiprism() {
  const vertices = [];
  const phi = (1 + Math.sqrt(5)) / 2;

  // 100 vertices of the grand antiprism
  // Simplified: use icosahedral-like arrangement
  const t = phi;

  // Core vertices from icosahedral coordinates extended to 4D
  const baseVerts = [
    [1, 1, 1, 0], [1, 1, -1, 0], [1, -1, 1, 0], [1, -1, -1, 0],
    [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0],
    [0, t, 1/t, 0.5], [0, t, -1/t, 0.5], [0, -t, 1/t, 0.5], [0, -t, -1/t, 0.5],
    [0, t, 1/t, -0.5], [0, t, -1/t, -0.5], [0, -t, 1/t, -0.5], [0, -t, -1/t, -0.5],
    [1/t, 0, t, 0.5], [1/t, 0, -t, 0.5], [-1/t, 0, t, 0.5], [-1/t, 0, -t, 0.5],
    [1/t, 0, t, -0.5], [1/t, 0, -t, -0.5], [-1/t, 0, t, -0.5], [-1/t, 0, -t, -0.5],
    [t, 1/t, 0, 0.5], [t, -1/t, 0, 0.5], [-t, 1/t, 0, 0.5], [-t, -1/t, 0, 0.5],
    [t, 1/t, 0, -0.5], [t, -1/t, 0, -0.5], [-t, 1/t, 0, -0.5], [-t, -1/t, 0, -0.5],
  ];

  for (const v of baseVerts) {
    vertices.push([...v]);
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

  // Find edges by nearest neighbors
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
    if (d.dist < edgeDist * 1.3) {
      edges.push([d.i, d.j]);
    }
  }

  // Triangular faces
  const faces = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      for (let k = j + 1; k < vertices.length; k++) {
        const hasIJ = edges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i));
        const hasJK = edges.some(e => (e[0] === j && e[1] === k) || (e[0] === k && e[1] === j));
        const hasIK = edges.some(e => (e[0] === i && e[1] === k) || (e[0] === k && e[1] === i));
        if (hasIJ && hasJK && hasIK) {
          faces.push([i, j, k]);
        }
      }
    }
  }

  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate rectified tesseract
 */
function generateRectifiedTesseract() {
  const vertices = [];

  // Rectified tesseract vertices are permutations of (0, ±1, ±1, ±1)
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

  // Find edges (distance = sqrt(2))
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

  // Triangular and square faces
  const faces = [];

  // Find triangular faces
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      for (let k = j + 1; k < vertices.length; k++) {
        const hasIJ = edges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i));
        const hasJK = edges.some(e => (e[0] === j && e[1] === k) || (e[0] === k && e[1] === j));
        const hasIK = edges.some(e => (e[0] === i && e[1] === k) || (e[0] === k && e[1] === i));
        if (hasIJ && hasJK && hasIK) {
          faces.push([i, j, k]);
        }
      }
    }
  }

  return { vertices, edges, faces, faceType: 'triangle' };
}

/**
 * Generate Runcinated tesseract (4D)
 */
function generateRuncinatedTesseract() {
  const vertices = [];
  const phi = (1 + Math.sqrt(5)) / 2;

  // Vertices are permutations of (±1, ±1, ±1, ±(1+sqrt(2)))
  const a = 1 + Math.sqrt(2);

  // All permutations with one coordinate being ±a
  for (let aPos = 0; aPos < 4; aPos++) {
    for (let aSign of [-1, 1]) {
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

  // Find triangular faces
  const faces = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      for (let k = j + 1; k < vertices.length; k++) {
        const hasIJ = edges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i));
        const hasJK = edges.some(e => (e[0] === j && e[1] === k) || (e[0] === k && e[1] === j));
        const hasIK = edges.some(e => (e[0] === i && e[1] === k) || (e[0] === k && e[1] === i));
        if (hasIJ && hasJK && hasIK) {
          faces.push([i, j, k]);
        }
      }
    }
  }

  return { vertices, edges, faces, faceType: 'triangle' };
}

// Helper functions
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

function findPentagonalFaces(vertices, edges) {
  // Simplified: return triangular approximations
  const faces = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      for (let k = j + 1; k < vertices.length; k++) {
        const hasIJ = edges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i));
        const hasJK = edges.some(e => (e[0] === j && e[1] === k) || (e[0] === k && e[1] === j));
        const hasIK = edges.some(e => (e[0] === i && e[1] === k) || (e[0] === k && e[1] === i));
        if (hasIJ && hasJK && hasIK) {
          faces.push([i, j, k]);
        }
      }
    }
  }
  return faces;
}

// ============================================================================
// N-DIMENSIONAL ROTATION
// ============================================================================

function createPlaneRotation(n, axis1, axis2, angle) {
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

function applyMatrix(matrix, vector) {
  const result = new Array(vector.length).fill(0);
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < vector.length; j++) {
      result[i] += matrix[i][j] * vector[j];
    }
  }
  return result;
}

function createIsoclinicRotation(angle1, angle2) {
  const m1 = createPlaneRotation(4, 0, 1, angle1);
  const m2 = createPlaneRotation(4, 2, 3, angle2);
  return multiplyMatrices(m1, m2);
}

// ============================================================================
// PROJECTION
// ============================================================================

function projectToND(point, targetDim, viewDistances) {
  let current = [...point];

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
// CSG OPERATIONS
// ============================================================================

/**
 * Union: Combine two shapes (vertices merged, edges merged)
 */
function csgUnion(shape1, shape2, offset = [0, 0, 0, 0]) {
  const vertices = [...shape1.vertices];
  const vOffset = vertices.length;

  // Add shape2 vertices with offset
  for (const v of shape2.vertices) {
    const newV = v.map((c, i) => c + (offset[i] || 0));
    vertices.push(newV);
  }

  // Merge edges
  const edges = [...shape1.edges];
  for (const [a, b] of shape2.edges) {
    edges.push([a + vOffset, b + vOffset]);
  }

  // Merge faces
  const faces = [...(shape1.faces || [])];
  for (const face of (shape2.faces || [])) {
    faces.push(face.map(i => i + vOffset));
  }

  return { vertices, edges, faces, faceType: shape1.faceType || shape2.faceType };
}

/**
 * Intersection approximation: Keep only vertices near both shapes
 */
function csgIntersection(shape1, shape2, threshold = 0.5) {
  const vertices = [];
  const vertexMap = new Map();

  // Find vertices from shape1 that are close to shape2
  for (let i = 0; i < shape1.vertices.length; i++) {
    const v1 = shape1.vertices[i];
    let minDist = Infinity;
    for (const v2 of shape2.vertices) {
      let dist = 0;
      for (let d = 0; d < v1.length; d++) {
        dist += Math.pow(v1[d] - (v2[d] || 0), 2);
      }
      minDist = Math.min(minDist, Math.sqrt(dist));
    }
    if (minDist < threshold) {
      vertexMap.set(i, vertices.length);
      vertices.push([...v1]);
    }
  }

  // Map edges
  const edges = [];
  for (const [a, b] of shape1.edges) {
    if (vertexMap.has(a) && vertexMap.has(b)) {
      edges.push([vertexMap.get(a), vertexMap.get(b)]);
    }
  }

  // Map faces
  const faces = [];
  for (const face of (shape1.faces || [])) {
    if (face.every(i => vertexMap.has(i))) {
      faces.push(face.map(i => vertexMap.get(i)));
    }
  }

  return { vertices, edges, faces, faceType: shape1.faceType };
}

/**
 * Difference: Shape1 minus Shape2 (removes overlapping parts)
 */
function csgDifference(shape1, shape2, threshold = 0.5) {
  const vertices = [];
  const vertexMap = new Map();

  // Keep vertices from shape1 that are far from shape2
  for (let i = 0; i < shape1.vertices.length; i++) {
    const v1 = shape1.vertices[i];
    let minDist = Infinity;
    for (const v2 of shape2.vertices) {
      let dist = 0;
      for (let d = 0; d < v1.length; d++) {
        dist += Math.pow(v1[d] - (v2[d] || 0), 2);
      }
      minDist = Math.min(minDist, Math.sqrt(dist));
    }
    if (minDist >= threshold) {
      vertexMap.set(i, vertices.length);
      vertices.push([...v1]);
    }
  }

  const edges = [];
  for (const [a, b] of shape1.edges) {
    if (vertexMap.has(a) && vertexMap.has(b)) {
      edges.push([vertexMap.get(a), vertexMap.get(b)]);
    }
  }

  const faces = [];
  for (const face of (shape1.faces || [])) {
    if (face.every(i => vertexMap.has(i))) {
      faces.push(face.map(i => vertexMap.get(i)));
    }
  }

  return { vertices, edges, faces, faceType: shape1.faceType };
}

// ============================================================================
// MORPHING
// ============================================================================

function morphShapes(shape1, shape2, t) {
  const v1 = shape1.vertices;
  const v2 = shape2.vertices;
  const n = Math.max(v1.length, v2.length);
  const dim = Math.max(v1[0]?.length || 0, v2[0]?.length || 0);

  const vertices = [];
  for (let i = 0; i < n; i++) {
    const p1 = [...(v1[i % v1.length] || new Array(dim).fill(0))];
    const p2 = [...(v2[i % v2.length] || new Array(dim).fill(0))];

    while (p1.length < dim) p1.push(0);
    while (p2.length < dim) p2.push(0);

    const interpolated = [];
    for (let d = 0; d < dim; d++) {
      interpolated.push(p1[d] * (1 - t) + p2[d] * t);
    }
    vertices.push(interpolated);
  }

  // Interpolate faces based on t
  const faces = t < 0.5 ? (shape1.faces || []) : (shape2.faces || []);
  const edges = [...shape1.edges];
  for (const [a, b] of shape2.edges) {
    const newEdge = [a % n, b % n];
    if (!edges.some(e => (e[0] === newEdge[0] && e[1] === newEdge[1]) ||
                          (e[0] === newEdge[1] && e[1] === newEdge[0]))) {
      edges.push(newEdge);
    }
  }

  return { vertices, edges, faces, faceType: t < 0.5 ? shape1.faceType : shape2.faceType };
}

// ============================================================================
// FEATURES SYSTEM
// ============================================================================

const POLYTOPE_TYPES = {
  hypercube: { name: 'Hypercube', generator: (n) => generateHypercube(n), minDim: 4 },
  simplex: { name: 'Simplex', generator: (n) => generateSimplex(n), minDim: 4 },
  crossPolytope: { name: 'Cross-Polytope', generator: (n) => generateCrossPolytope(n), minDim: 4 },
  cell24: { name: '24-Cell', generator: () => generate24Cell(), fixedDim: 4 },
  cell120: { name: '120-Cell', generator: () => generate120CellSimplified(), fixedDim: 4 },
  cell600: { name: '600-Cell', generator: () => generate600CellSimplified(), fixedDim: 4 },
  cliffordTorus: { name: 'Clifford Torus', generator: () => generateCliffordTorus(20), fixedDim: 4 },
  duoprism33: { name: '3,3-Duoprism', generator: () => generateDuoprism(3, 3), fixedDim: 4 },
  duoprism44: { name: '4,4-Duoprism', generator: () => generateDuoprism(4, 4), fixedDim: 4 },
  duoprism55: { name: '5,5-Duoprism', generator: () => generateDuoprism(5, 5), fixedDim: 4 },
  duoprism66: { name: '6,6-Duoprism', generator: () => generateDuoprism(6, 6), fixedDim: 4 },
  duoprism34: { name: '3,4-Duoprism', generator: () => generateDuoprism(3, 4), fixedDim: 4 },
  duoprism35: { name: '3,5-Duoprism', generator: () => generateDuoprism(3, 5), fixedDim: 4 },
  grandAntiprism: { name: 'Grand Antiprism', generator: () => generateGrandAntiprism(), fixedDim: 4 },
  rectifiedTesseract: { name: 'Rectified Tesseract', generator: () => generateRectifiedTesseract(), fixedDim: 4 },
  runcinatedTesseract: { name: 'Runcinated Tesseract', generator: () => generateRuncinatedTesseract(), fixedDim: 4 }
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

const CSG_TYPES = {
  none: { name: 'None', description: 'Single polytope' },
  union: { name: 'Union', description: 'Two shapes combined' },
  intersection: { name: 'Intersection', description: 'Overlapping region' },
  difference: { name: 'Difference', description: 'One shape minus another' }
};

let features = {};
let originalFeatures = {};
let hasOverrides = false;

function generateFeatures() {
  R = initRandom(hash);

  const dimension = rndInt(4, 6);
  const polytypeRarity = rollRarity(0.4, 0.35, 0.18, 0.07);

  let polytopeType;
  if (polytypeRarity === 'legendary') {
    polytopeType = rndChoice(['cell120', 'cell600', 'grandAntiprism']);
  } else if (polytypeRarity === 'rare') {
    polytopeType = rndChoice(['cell24', 'cliffordTorus', 'rectifiedTesseract', 'runcinatedTesseract']);
  } else if (polytypeRarity === 'uncommon') {
    polytopeType = rndChoice(['crossPolytope', 'simplex', 'duoprism33', 'duoprism44', 'duoprism55', 'duoprism66', 'duoprism34', 'duoprism35']);
  } else {
    polytopeType = 'hypercube';
  }

  const effectiveDim = POLYTOPE_TYPES[polytopeType].fixedDim || dimension;

  const rotationType = rndChoice(Object.keys(ROTATION_TYPES));
  const morphType = rndChoice(Object.keys(MORPH_TYPES));
  const csgType = rndChoice(Object.keys(CSG_TYPES));
  const palette = rndChoice(PALETTE_NAMES);

  // SLOWER rotation speeds (reduced by 3-5x)
  const rotationSpeeds = {};
  for (let i = 0; i < effectiveDim; i++) {
    for (let j = i + 1; j < effectiveDim; j++) {
      const planeName = `${i}${j}`;
      if (rotationType === 'simple') {
        rotationSpeeds[planeName] = i === 0 && j === effectiveDim - 1 ? rnd(0.001, 0.004) : 0;
      } else if (rotationType === 'compound') {
        rotationSpeeds[planeName] = rnd(-0.003, 0.003);
      } else { // isoclinic
        if ((i === 0 && j === 1) || (i === 2 && j === 3)) {
          rotationSpeeds[planeName] = rnd(0.001, 0.003);
        } else {
          rotationSpeeds[planeName] = 0;
        }
      }
    }
  }

  // Secondary polytope for morphing/CSG
  let secondaryPolytope = null;
  if (morphType !== 'none' || csgType !== 'none') {
    const options = Object.keys(POLYTOPE_TYPES).filter(t =>
      POLYTOPE_TYPES[t].fixedDim === effectiveDim ||
      (!POLYTOPE_TYPES[t].fixedDim && POLYTOPE_TYPES[t].minDim <= effectiveDim)
    );
    secondaryPolytope = rndChoice(options.filter(t => t !== polytopeType)) || polytopeType;
  }

  const morphSpeed = rnd(0.0005, 0.002);
  const viewDistance = rnd(2.5, 4);
  const wireOpacity = rnd(0.5, 0.9);
  const faceOpacity = rnd(0.08, 0.25);
  const lineWidth = rnd(1, 2.5);
  const csgOffset = [rnd(-0.3, 0.3), rnd(-0.3, 0.3), rnd(-0.3, 0.3), rnd(-0.3, 0.3)];
  const showWireframe = true;
  const showFaces = true;
  const showVertices = true;

  features = {
    dimension: effectiveDim,
    polytopeType,
    polytypeName: POLYTOPE_TYPES[polytopeType].name,
    rotationType,
    rotationTypeName: ROTATION_TYPES[rotationType].name,
    morphType,
    morphTypeName: MORPH_TYPES[morphType].name,
    csgType,
    csgTypeName: CSG_TYPES[csgType].name,
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
    csgOffset,
    showWireframe,
    showFaces,
    showVertices,
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
// RARITY CURVES
// ============================================================================

const RARITY_CURVES = {
  polytopeType: {
    probabilities: [0.4, 0.35, 0.18, 0.07],
    labels: ['Common (Hypercube)', 'Uncommon (Simplex/Duoprisms)', 'Rare (24-Cell/Rectified)', 'Legendary (120/600/Grand)']
  },
  dimension: {
    probabilities: [0.4, 0.35, 0.25],
    labels: ['4D', '5D', '6D']
  },
  rotationType: {
    probabilities: [0.33, 0.33, 0.34],
    labels: ['Simple', 'Compound', 'Isoclinic']
  },
  csgType: {
    probabilities: [0.4, 0.25, 0.2, 0.15],
    labels: ['None', 'Union', 'Intersection', 'Difference']
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

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.sortObjects = true;
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.autoRotate = false;

  // Grid
  const pal2 = PALETTES[features.palette];
  const gridHelper = new THREE.GridHelper(4, 10, pal2.grid, pal2.grid);
  gridHelper.position.y = -2;
  gridHelper.material.opacity = 0.3;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
  directionalLight2.position.set(-5, -5, 5);
  scene.add(directionalLight2);

  geometryGroup = new THREE.Group();
  scene.add(geometryGroup);

  // Initialize rotation angles
  const n = features.dimension;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      rotationAngles[`${i}${j}`] = 0;
    }
  }

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

  // Apply CSG if applicable
  if (features.csgType !== 'none' && secondaryShape) {
    let csgResult;
    switch (features.csgType) {
      case 'union':
        csgResult = csgUnion(primaryShape, secondaryShape, features.csgOffset);
        break;
      case 'intersection':
        csgResult = csgIntersection(primaryShape, secondaryShape, 1.2);
        break;
      case 'difference':
        csgResult = csgDifference(primaryShape, secondaryShape, 0.4);
        break;
      default:
        csgResult = primaryShape;
    }
    // Fallback to primary shape if CSG resulted in empty geometry
    if (csgResult.vertices.length < 3) {
      console.log('CSG resulted in empty shape, falling back to primary');
      currentShape = primaryShape;
    } else {
      currentShape = csgResult;
    }
  } else {
    currentShape = primaryShape;
  }
}

function updateGeometry() {
  // Clear previous
  while (geometryGroup.children.length > 0) {
    const child = geometryGroup.children[0];
    geometryGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  }

  // Get current shape (with morphing if applicable)
  let shape = currentShape;
  if (features.morphType === 'interpolate' && secondaryShape && features.csgType === 'none') {
    shape = morphShapes(primaryShape, secondaryShape, morphProgress);
  }

  // Build rotation matrix
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

  // View distances for projection
  const viewDistances = {};
  for (let d = 4; d <= features.dimension; d++) {
    viewDistances[d] = features.viewDistance;
  }

  // Project vertices
  const projectedVertices = shape.vertices.map(v => {
    let rotated = [...v];
    while (rotated.length < n) rotated.push(0);
    if (rotationMatrix) {
      rotated = applyMatrix(rotationMatrix, rotated);
    }
    return projectToND(rotated, 3, viewDistances);
  });

  // Get W coordinates for coloring
  const wCoords = shape.vertices.map(v => {
    let rotated = [...v];
    while (rotated.length < n) rotated.push(0);
    if (rotationMatrix) {
      rotated = applyMatrix(rotationMatrix, rotated);
    }
    return rotated[3] || 0;
  });

  const pal = PALETTES[features.palette];

  // RENDER FACES (semi-transparent solid)
  if (features.showFaces && shape.faces && shape.faces.length > 0) {
    const faceGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (const face of shape.faces) {
      if (face.length === 3) {
        // Triangle
        for (const idx of face) {
          if (idx < projectedVertices.length) {
            const v = projectedVertices[idx];
            positions.push(v[0], v[1], v[2]);

            const w = wCoords[idx];
            const colorIndex = Math.floor(((w + 1) / 2) * (pal.colors.length - 1));
            const color = new THREE.Color(pal.colors[Math.max(0, Math.min(colorIndex, pal.colors.length - 1))]);
            colors.push(color.r, color.g, color.b);
          }
        }
      } else if (face.length === 4) {
        // Quad - split into 2 triangles
        const indices = [0, 1, 2, 0, 2, 3];
        for (const i of indices) {
          const idx = face[i];
          if (idx < projectedVertices.length) {
            const v = projectedVertices[idx];
            positions.push(v[0], v[1], v[2]);

            const w = wCoords[idx];
            const colorIndex = Math.floor(((w + 1) / 2) * (pal.colors.length - 1));
            const color = new THREE.Color(pal.colors[Math.max(0, Math.min(colorIndex, pal.colors.length - 1))]);
            colors.push(color.r, color.g, color.b);
          }
        }
      } else if (face.length === 5) {
        // Pentagon - fan triangulation
        for (let i = 1; i < face.length - 1; i++) {
          for (const idx of [face[0], face[i], face[i + 1]]) {
            if (idx < projectedVertices.length) {
              const v = projectedVertices[idx];
              positions.push(v[0], v[1], v[2]);

              const w = wCoords[idx];
              const colorIndex = Math.floor(((w + 1) / 2) * (pal.colors.length - 1));
              const color = new THREE.Color(pal.colors[Math.max(0, Math.min(colorIndex, pal.colors.length - 1))]);
              colors.push(color.r, color.g, color.b);
            }
          }
        }
      }
    }

    faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    faceGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    faceGeometry.computeVertexNormals();

    const faceMaterial = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: features.faceOpacity,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    faceMesh.renderOrder = 0;
    geometryGroup.add(faceMesh);
  }

  // RENDER EDGES (wireframe)
  if (features.showWireframe) {
    for (const [a, b] of shape.edges) {
      if (a < projectedVertices.length && b < projectedVertices.length) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
          projectedVertices[a][0], projectedVertices[a][1], projectedVertices[a][2],
          projectedVertices[b][0], projectedVertices[b][1], projectedVertices[b][2]
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Color based on average W
        const avgW = (wCoords[a] + wCoords[b]) / 2;
        const colorIndex = Math.floor(((avgW + 1) / 2) * (pal.colors.length - 1));
        const lineColor = pal.colors[Math.max(0, Math.min(colorIndex, pal.colors.length - 1))];

        const lineMaterial = new THREE.LineBasicMaterial({
          color: lineColor,
          transparent: true,
          opacity: features.wireOpacity,
          linewidth: features.lineWidth
        });

        const line = new THREE.Line(geometry, lineMaterial);
        line.renderOrder = 1;
        geometryGroup.add(line);
      }
    }
  }

  // RENDER VERTICES (points)
  if (features.showVertices) {
    const pointsGeometry = new THREE.BufferGeometry();
    const pointPositions = new Float32Array(projectedVertices.length * 3);
    const pointColors = new Float32Array(projectedVertices.length * 3);

    for (let i = 0; i < projectedVertices.length; i++) {
      pointPositions[i * 3] = projectedVertices[i][0];
      pointPositions[i * 3 + 1] = projectedVertices[i][1];
      pointPositions[i * 3 + 2] = projectedVertices[i][2];

      const w = wCoords[i];
      const colorIndex = Math.floor(((w + 1) / 2) * (pal.colors.length - 1));
      const color = new THREE.Color(pal.colors[Math.max(0, Math.min(colorIndex, pal.colors.length - 1))]);
      pointColors[i * 3] = color.r;
      pointColors[i * 3 + 1] = color.g;
      pointColors[i * 3 + 2] = color.b;
    }

    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    points.renderOrder = 2;
    geometryGroup.add(points);
  }

  // NESTED shape (if applicable)
  if (features.morphType === 'nested' && secondaryShape && features.csgType === 'none') {
    renderNestedShape(secondaryShape, rotationMatrix, viewDistances, pal, 0.5);
  }
}

function renderNestedShape(shape, rotationMatrix, viewDistances, pal, scale) {
  const n = features.dimension;

  const projectedVertices = shape.vertices.map(v => {
    let rotated = [...v];
    while (rotated.length < n) rotated.push(0);
    if (rotationMatrix) {
      rotated = applyMatrix(rotationMatrix, rotated);
    }
    return projectToND(rotated, 3, viewDistances).map(c => c * scale);
  });

  const wCoords = shape.vertices.map(v => {
    let rotated = [...v];
    while (rotated.length < n) rotated.push(0);
    if (rotationMatrix) {
      rotated = applyMatrix(rotationMatrix, rotated);
    }
    return rotated[3] || 0;
  });

  // Faces
  if (shape.faces && shape.faces.length > 0) {
    const faceGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (const face of shape.faces) {
      if (face.length === 3) {
        for (const idx of face) {
          if (idx < projectedVertices.length) {
            const v = projectedVertices[idx];
            positions.push(v[0], v[1], v[2]);
            const w = wCoords[idx];
            const colorIndex = Math.floor(((w + 1) / 2) * (pal.colors.length - 1));
            const color = new THREE.Color(pal.colors[Math.max(0, Math.min(colorIndex, pal.colors.length - 1))]);
            colors.push(color.r, color.g, color.b);
          }
        }
      } else if (face.length === 4) {
        const indices = [0, 1, 2, 0, 2, 3];
        for (const i of indices) {
          const idx = face[i];
          if (idx < projectedVertices.length) {
            const v = projectedVertices[idx];
            positions.push(v[0], v[1], v[2]);
            const w = wCoords[idx];
            const colorIndex = Math.floor(((w + 1) / 2) * (pal.colors.length - 1));
            const color = new THREE.Color(pal.colors[Math.max(0, Math.min(colorIndex, pal.colors.length - 1))]);
            colors.push(color.r, color.g, color.b);
          }
        }
      }
    }

    faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    faceGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const faceMaterial = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: features.faceOpacity * 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    geometryGroup.add(faceMesh);
  }

  // Edges
  const nestedMaterial = new THREE.LineBasicMaterial({
    color: pal.colors[2],
    transparent: true,
    opacity: features.wireOpacity * 0.6
  });

  for (const [a, b] of shape.edges) {
    if (a < projectedVertices.length && b < projectedVertices.length) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([
        projectedVertices[a][0], projectedVertices[a][1], projectedVertices[a][2],
        projectedVertices[b][0], projectedVertices[b][1], projectedVertices[b][2]
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const line = new THREE.Line(geometry, nestedMaterial);
      geometryGroup.add(line);
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    // Update rotations
    const n = features.dimension;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const planeName = `${i}${j}`;
        const speed = features.rotationSpeeds[planeName] || 0;
        rotationAngles[planeName] = (rotationAngles[planeName] || 0) + speed;
      }
    }

    // Update morph
    if (features.morphType === 'interpolate' && features.csgType === 'none') {
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

  while (geometryGroup.children.length > 0) {
    const child = geometryGroup.children[0];
    geometryGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  }

  rotationAngles = {};
  const n = features.dimension;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      rotationAngles[`${i}${j}`] = 0;
    }
  }

  morphProgress = 0;
  morphDirection = 1;

  const pal = PALETTES[features.palette];
  scene.background = new THREE.Color(pal.background);

  initShapes();

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
