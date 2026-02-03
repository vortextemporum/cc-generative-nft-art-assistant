/**
 * METAFORMS v1.0.0
 *
 * Weird 3D blob objects using metaballs and marching cubes.
 * Features: Multiple materials, geometric distortions, surface growths, boolean cuts.
 *
 * Based on 2D bezier blob generator concept, extended to 3D metaball isosurfaces.
 *
 * Controls:
 * - R: Regenerate with new hash
 * - S: Save PNG
 * - Space: Pause/resume rotation
 * - L: Like current output
 * - D: Dislike current output
 */

// ============================================================================
// HASH-BASED RANDOMNESS (Art Blocks compatible)
// ============================================================================

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
function rnd(min = 0, max = 1) {
  if (max === undefined) { max = min; min = 0; }
  return min + R() * (max - min);
}
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rndChoice(arr) { return arr[Math.floor(R() * arr.length)]; }
function rndBool(p = 0.5) { return R() < p; }
function rndGaussian(mean = 0, std = 1) {
  const u1 = R(), u2 = R();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function rollRarity(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = R() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

// ============================================================================
// FEATURE SYSTEM
// ============================================================================

const VERSION = "1.0.0";

// Material types with rarity weights
const MATERIAL_TYPES = [
  { name: "Matte", weight: 30 },
  { name: "Glossy", weight: 25 },
  { name: "Chrome", weight: 15 },
  { name: "Iridescent", weight: 12 },
  { name: "Glass", weight: 10 },
  { name: "Emissive", weight: 5 },
  { name: "Holographic", weight: 3 }
];

// Aesthetic vibes with rarity
const AESTHETICS = [
  { name: "Sculptural", weight: 30 },
  { name: "Organic", weight: 25 },
  { name: "Alien", weight: 20 },
  { name: "Playful", weight: 15 },
  { name: "SciFi", weight: 10 }
];

// Distortion types
const DISTORTION_TYPES = [
  { name: "None", weight: 20 },
  { name: "Twist", weight: 25 },
  { name: "Taper", weight: 20 },
  { name: "Bend", weight: 15 },
  { name: "Bulge", weight: 10 },
  { name: "Wave", weight: 10 }
];

// Growth types
const GROWTH_TYPES = [
  { name: "None", weight: 40 },
  { name: "Spikes", weight: 20 },
  { name: "Tendrils", weight: 15 },
  { name: "Bumps", weight: 15 },
  { name: "Crystals", weight: 10 }
];

// Boolean operations
const BOOLEAN_TYPES = [
  { name: "None", weight: 50 },
  { name: "Sphere Cut", weight: 20 },
  { name: "Box Cut", weight: 15 },
  { name: "Cylinder Cut", weight: 10 },
  { name: "Multi Cut", weight: 5 }
];

// Color palettes - procedurally generated but with base hues
const BASE_HUES = [
  { name: "Warm", hueRange: [0, 60] },
  { name: "Cool", hueRange: [180, 270] },
  { name: "Neon", hueRange: [280, 340] },
  { name: "Earth", hueRange: [20, 50] },
  { name: "Ocean", hueRange: [170, 220] },
  { name: "Void", hueRange: [260, 290] },
  { name: "Fire", hueRange: [0, 30] },
  { name: "Forest", hueRange: [80, 140] }
];

let features = {};
let originalFeatures = {};
let hasOverrides = false;

// Rarity curves for UI display
const RARITY_CURVES = {
  material: {
    labels: MATERIAL_TYPES.map(m => m.name),
    probabilities: MATERIAL_TYPES.map(m => m.weight / MATERIAL_TYPES.reduce((a, b) => a + b.weight, 0))
  },
  aesthetic: {
    labels: AESTHETICS.map(a => a.name),
    probabilities: AESTHETICS.map(a => a.weight / AESTHETICS.reduce((a, b) => a + b.weight, 0))
  },
  distortion: {
    labels: DISTORTION_TYPES.map(d => d.name),
    probabilities: DISTORTION_TYPES.map(d => d.weight / DISTORTION_TYPES.reduce((a, b) => a + b.weight, 0))
  },
  growth: {
    labels: GROWTH_TYPES.map(g => g.name),
    probabilities: GROWTH_TYPES.map(g => g.weight / GROWTH_TYPES.reduce((a, b) => a + b.weight, 0))
  },
  boolean: {
    labels: BOOLEAN_TYPES.map(b => b.name),
    probabilities: BOOLEAN_TYPES.map(b => b.weight / BOOLEAN_TYPES.reduce((a, b) => a + b.weight, 0))
  }
};

function generateFeatures() {
  R = initRandom(hash);

  // Roll for each feature category
  const materialIdx = rollRarity(MATERIAL_TYPES.map(m => m.weight));
  const aestheticIdx = rollRarity(AESTHETICS.map(a => a.weight));
  const distortionIdx = rollRarity(DISTORTION_TYPES.map(d => d.weight));
  const growthIdx = rollRarity(GROWTH_TYPES.map(g => g.weight));
  const booleanIdx = rollRarity(BOOLEAN_TYPES.map(b => b.weight));
  const hueIdx = rndInt(0, BASE_HUES.length - 1);

  // Metaball parameters
  const blobCount = rndInt(3, 7);
  const blobRadius = rnd(0.3, 0.6);
  const blobSpread = rnd(0.5, 1.5);

  // Distortion intensity
  const distortionStrength = rnd(0.3, 1.0);

  // Growth parameters
  const growthCount = growthIdx === 0 ? 0 : rndInt(3, 12);
  const growthSize = rnd(0.1, 0.4);

  // Color generation
  const hueRange = BASE_HUES[hueIdx].hueRange;
  const baseHue = rnd(hueRange[0], hueRange[1]);
  const saturation = rnd(0.5, 1.0);
  const lightness = rnd(0.3, 0.7);

  // Background
  const bgLightness = rnd(0.02, 0.15);

  features = {
    // Categorical features
    material: MATERIAL_TYPES[materialIdx].name,
    materialIdx,
    aesthetic: AESTHETICS[aestheticIdx].name,
    aestheticIdx,
    distortion: DISTORTION_TYPES[distortionIdx].name,
    distortionIdx,
    growth: GROWTH_TYPES[growthIdx].name,
    growthIdx,
    boolean: BOOLEAN_TYPES[booleanIdx].name,
    booleanIdx,
    colorFamily: BASE_HUES[hueIdx].name,
    hueIdx,

    // Numeric features
    blobCount,
    blobRadius,
    blobSpread,
    distortionStrength,
    growthCount,
    growthSize,
    baseHue,
    saturation,
    lightness,
    bgLightness,

    // Derived
    rotationSpeed: rnd(0.001, 0.005),
    cameraDistance: rnd(4, 6)
  };

  originalFeatures = { ...features };
  hasOverrides = false;

  return features;
}

// Dev mode: parameter override functions
function setParameter(name, value) {
  hasOverrides = true;
  features[name] = value;
  return features;
}

function resetToOriginal() {
  features = { ...originalFeatures };
  hasOverrides = false;
  return features;
}

function hasModifications() { return hasOverrides; }

function getRarityCurves() { return RARITY_CURVES; }

// ============================================================================
// FEEDBACK SYSTEM
// ============================================================================

const FEEDBACK_KEY = 'metaforms-feedback';

function loadFeedback() {
  try {
    const data = localStorage.getItem(FEEDBACK_KEY);
    return data ? JSON.parse(data) : { liked: [], disliked: [] };
  } catch (e) {
    return { liked: [], disliked: [] };
  }
}

function saveFeedback(feedback) {
  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
  } catch (e) {
    console.warn('Could not save feedback:', e);
  }
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
  return entry;
}

function getFeedbackStats() {
  const feedback = loadFeedback();
  return {
    totalLiked: feedback.liked.length,
    totalDisliked: feedback.disliked.length,
    ratio: feedback.liked.length / Math.max(1, feedback.liked.length + feedback.disliked.length)
  };
}

function exportFeedback() {
  return loadFeedback();
}

// ============================================================================
// THREE.JS SETUP
// ============================================================================

let scene, camera, renderer, controls;
let metaformMesh, growthMeshes = [];
let isRotating = true;
let clock;

// Marching cubes resolution
const MC_RESOLUTION = 64;

function initThree() {
  // Scene
  scene = new THREE.Scene();
  updateBackground();

  // Camera
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = features.cameraDistance;

  // Renderer
  const container = document.getElementById('sketch-container');
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(700, 700);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = features.rotationSpeed * 500;

  // Lighting - clean studio setup
  setupLighting();

  // Clock for animation
  clock = new THREE.Clock();

  // Generate the metaform
  generateMetaform();
}

function updateBackground() {
  const bgColor = new THREE.Color().setHSL(0, 0, features.bgLightness);
  scene.background = bgColor;
}

function setupLighting() {
  // Remove existing lights
  scene.children = scene.children.filter(c => !(c instanceof THREE.Light));

  // Ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  // Key light
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  // Fill light
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  fillLight.position.set(-5, 0, 5);
  scene.add(fillLight);

  // Rim light
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
  rimLight.position.set(0, -5, -5);
  scene.add(rimLight);

  // Top light for sculptural feel
  const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
  topLight.position.set(0, 10, 0);
  scene.add(topLight);
}

// ============================================================================
// METABALL FIELD & MARCHING CUBES
// ============================================================================

class MetaballField {
  constructor() {
    this.balls = [];
  }

  addBall(x, y, z, radius, strength = 1) {
    this.balls.push({ x, y, z, radius, strength });
  }

  sample(x, y, z) {
    let sum = 0;
    for (const ball of this.balls) {
      const dx = x - ball.x;
      const dy = y - ball.y;
      const dz = z - ball.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < 0.0001) d2 = 0.0001;
      sum += ball.strength * ball.radius * ball.radius / d2;
    }
    return sum;
  }
}

// Marching cubes lookup tables (abbreviated - standard MC tables)
const MC_EDGE_TABLE = [
  0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
  0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
  0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
  0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
  0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c,
  0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
  0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac,
  0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
  0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c,
  0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
  0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc,
  0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
  0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c,
  0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
  0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc,
  0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
  0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
  0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
  0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
  0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
  0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
  0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
  0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
  0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
  0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
  0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
  0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
  0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
  0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
  0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
  0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
  0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
];

// Simplified tri table (full implementation would have 256 * 16 entries)
// Using a procedural approach instead for compactness

function marchingCubes(field, resolution, bounds, threshold = 1.0) {
  const vertices = [];
  const step = (bounds.max - bounds.min) / resolution;

  // Sample the field
  const values = new Float32Array((resolution + 1) ** 3);
  for (let z = 0; z <= resolution; z++) {
    for (let y = 0; y <= resolution; y++) {
      for (let x = 0; x <= resolution; x++) {
        const px = bounds.min + x * step;
        const py = bounds.min + y * step;
        const pz = bounds.min + z * step;
        const idx = x + y * (resolution + 1) + z * (resolution + 1) ** 2;
        values[idx] = field.sample(px, py, pz);
      }
    }
  }

  // March through cubes
  for (let z = 0; z < resolution; z++) {
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        // Get corner values
        const corners = [
          values[x + y * (resolution + 1) + z * (resolution + 1) ** 2],
          values[(x + 1) + y * (resolution + 1) + z * (resolution + 1) ** 2],
          values[(x + 1) + (y + 1) * (resolution + 1) + z * (resolution + 1) ** 2],
          values[x + (y + 1) * (resolution + 1) + z * (resolution + 1) ** 2],
          values[x + y * (resolution + 1) + (z + 1) * (resolution + 1) ** 2],
          values[(x + 1) + y * (resolution + 1) + (z + 1) * (resolution + 1) ** 2],
          values[(x + 1) + (y + 1) * (resolution + 1) + (z + 1) * (resolution + 1) ** 2],
          values[x + (y + 1) * (resolution + 1) + (z + 1) * (resolution + 1) ** 2]
        ];

        // Calculate cube index
        let cubeIndex = 0;
        for (let i = 0; i < 8; i++) {
          if (corners[i] >= threshold) cubeIndex |= (1 << i);
        }

        if (MC_EDGE_TABLE[cubeIndex] === 0) continue;

        // Interpolate vertices on edges
        const px = bounds.min + x * step;
        const py = bounds.min + y * step;
        const pz = bounds.min + z * step;

        const edgeVerts = [];
        const edges = [
          [[0, 0, 0], [1, 0, 0], 0, 1],
          [[1, 0, 0], [1, 1, 0], 1, 2],
          [[1, 1, 0], [0, 1, 0], 2, 3],
          [[0, 1, 0], [0, 0, 0], 3, 0],
          [[0, 0, 1], [1, 0, 1], 4, 5],
          [[1, 0, 1], [1, 1, 1], 5, 6],
          [[1, 1, 1], [0, 1, 1], 6, 7],
          [[0, 1, 1], [0, 0, 1], 7, 4],
          [[0, 0, 0], [0, 0, 1], 0, 4],
          [[1, 0, 0], [1, 0, 1], 1, 5],
          [[1, 1, 0], [1, 1, 1], 2, 6],
          [[0, 1, 0], [0, 1, 1], 3, 7]
        ];

        for (let e = 0; e < 12; e++) {
          if (MC_EDGE_TABLE[cubeIndex] & (1 << e)) {
            const [p1, p2, i1, i2] = edges[e];
            const v1 = corners[i1], v2 = corners[i2];
            const t = (threshold - v1) / (v2 - v1 + 0.0001);
            edgeVerts[e] = [
              px + (p1[0] + t * (p2[0] - p1[0])) * step,
              py + (p1[1] + t * (p2[1] - p1[1])) * step,
              pz + (p1[2] + t * (p2[2] - p1[2])) * step
            ];
          }
        }

        // Generate triangles based on cube configuration
        // Using simplified triangle generation
        const tris = getTrianglesForCube(cubeIndex);
        for (const tri of tris) {
          if (edgeVerts[tri[0]] && edgeVerts[tri[1]] && edgeVerts[tri[2]]) {
            vertices.push(...edgeVerts[tri[0]], ...edgeVerts[tri[1]], ...edgeVerts[tri[2]]);
          }
        }
      }
    }
  }

  return vertices;
}

// Simplified triangle lookup - generates valid triangles for each configuration
function getTrianglesForCube(cubeIndex) {
  // This is a simplified version - returns triangles based on edge flags
  const tris = [];
  const edges = MC_EDGE_TABLE[cubeIndex];
  if (edges === 0) return tris;

  // Find active edges
  const activeEdges = [];
  for (let e = 0; e < 12; e++) {
    if (edges & (1 << e)) activeEdges.push(e);
  }

  // Generate triangles from edge loops
  // Simplified: create triangles from groups of 3 active edges
  for (let i = 0; i + 2 < activeEdges.length; i += 3) {
    tris.push([activeEdges[i], activeEdges[i + 1], activeEdges[i + 2]]);
  }

  return tris;
}

// ============================================================================
// METAFORM GENERATION
// ============================================================================

function generateMetaform() {
  // Clear previous
  if (metaformMesh) {
    scene.remove(metaformMesh);
    metaformMesh.geometry.dispose();
    if (metaformMesh.material.dispose) metaformMesh.material.dispose();
  }
  growthMeshes.forEach(m => {
    scene.remove(m);
    m.geometry.dispose();
    if (m.material.dispose) m.material.dispose();
  });
  growthMeshes = [];

  // Create metaball field
  const field = new MetaballField();

  // Re-seed for consistent generation
  R = initRandom(hash);
  // Skip the feature rolls we already did
  for (let i = 0; i < 20; i++) R();

  // Add metaballs based on features
  for (let i = 0; i < features.blobCount; i++) {
    const theta = rnd(0, Math.PI * 2);
    const phi = rnd(-Math.PI / 2, Math.PI / 2);
    const r = rnd(0, features.blobSpread);

    const x = r * Math.cos(phi) * Math.cos(theta);
    const y = r * Math.cos(phi) * Math.sin(theta);
    const z = r * Math.sin(phi);

    const radius = features.blobRadius * rnd(0.5, 1.5);
    const strength = rnd(0.8, 1.2);

    field.addBall(x, y, z, radius, strength);
  }

  // Generate mesh with marching cubes
  const bounds = { min: -2, max: 2 };
  const vertices = marchingCubes(field, MC_RESOLUTION, bounds, 1.0);

  if (vertices.length === 0) {
    // Fallback: create a simple sphere if marching cubes fails
    const geo = new THREE.SphereGeometry(1, 32, 32);
    metaformMesh = new THREE.Mesh(geo, createMaterial());
    scene.add(metaformMesh);
    return;
  }

  // Create geometry from vertices
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();

  // Apply distortions
  applyDistortion(geometry);

  // Apply boolean operations (simulated with vertex displacement)
  applyBooleanEffect(geometry);

  // Create material
  const material = createMaterial();

  // Create mesh
  metaformMesh = new THREE.Mesh(geometry, material);
  scene.add(metaformMesh);

  // Add growths
  if (features.growth !== "None") {
    addGrowths();
  }
}

// ============================================================================
// MATERIALS
// ============================================================================

function createMaterial() {
  const color = new THREE.Color().setHSL(
    features.baseHue / 360,
    features.saturation,
    features.lightness
  );

  switch (features.material) {
    case "Matte":
      return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.9,
        metalness: 0.0,
        flatShading: features.aesthetic === "Alien"
      });

    case "Glossy":
      return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.2,
        metalness: 0.1
      });

    case "Chrome":
      return new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.05,
        metalness: 1.0,
        envMapIntensity: 1.5
      });

    case "Iridescent":
      // Simulated with color shift based on normal
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.3,
        metalness: 0.5,
        iridescence: 1.0,
        iridescenceIOR: 1.5,
        iridescenceThicknessRange: [100, 400]
      });

    case "Glass":
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.0,
        metalness: 0.0,
        transmission: 0.9,
        thickness: 0.5,
        ior: 1.5
      });

    case "Emissive":
      return new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.5,
        metalness: 0.0
      });

    case "Holographic":
      return new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.8,
        iridescence: 1.0,
        iridescenceIOR: 2.0,
        iridescenceThicknessRange: [200, 800],
        clearcoat: 1.0
      });

    default:
      return new THREE.MeshStandardMaterial({ color });
  }
}

// ============================================================================
// DISTORTIONS
// ============================================================================

function applyDistortion(geometry) {
  if (features.distortion === "None") return;

  const positions = geometry.attributes.position.array;
  const strength = features.distortionStrength;

  for (let i = 0; i < positions.length; i += 3) {
    let x = positions[i];
    let y = positions[i + 1];
    let z = positions[i + 2];

    switch (features.distortion) {
      case "Twist":
        const twistAngle = y * strength * 2;
        const cosT = Math.cos(twistAngle);
        const sinT = Math.sin(twistAngle);
        positions[i] = x * cosT - z * sinT;
        positions[i + 2] = x * sinT + z * cosT;
        break;

      case "Taper":
        const taperFactor = 1 + y * strength * 0.5;
        positions[i] *= taperFactor;
        positions[i + 2] *= taperFactor;
        break;

      case "Bend":
        const bendAngle = x * strength;
        const bendCos = Math.cos(bendAngle);
        const bendSin = Math.sin(bendAngle);
        positions[i + 1] = y * bendCos - z * bendSin;
        positions[i + 2] = y * bendSin + z * bendCos;
        break;

      case "Bulge":
        const dist = Math.sqrt(x * x + z * z);
        const bulge = 1 + Math.exp(-dist * 2) * strength;
        positions[i] *= bulge;
        positions[i + 2] *= bulge;
        break;

      case "Wave":
        positions[i] += Math.sin(y * 4) * strength * 0.2;
        positions[i + 2] += Math.cos(y * 4) * strength * 0.2;
        break;
    }
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
}

// ============================================================================
// BOOLEAN EFFECTS (Simulated)
// ============================================================================

function applyBooleanEffect(geometry) {
  if (features.boolean === "None") return;

  const positions = geometry.attributes.position.array;

  // Re-seed for consistent cuts
  R = initRandom(hash);
  for (let i = 0; i < 50; i++) R();

  const cutCount = features.boolean === "Multi Cut" ? rndInt(2, 4) : 1;

  for (let c = 0; c < cutCount; c++) {
    const cutPos = {
      x: rnd(-0.5, 0.5),
      y: rnd(-0.5, 0.5),
      z: rnd(-0.5, 0.5)
    };
    const cutSize = rnd(0.3, 0.8);

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i] - cutPos.x;
      const y = positions[i + 1] - cutPos.y;
      const z = positions[i + 2] - cutPos.z;

      let inside = false;

      switch (features.boolean) {
        case "Sphere Cut":
        case "Multi Cut":
          inside = (x * x + y * y + z * z) < cutSize * cutSize;
          break;

        case "Box Cut":
          inside = Math.abs(x) < cutSize && Math.abs(y) < cutSize && Math.abs(z) < cutSize;
          break;

        case "Cylinder Cut":
          inside = (x * x + z * z) < cutSize * cutSize && Math.abs(y) < cutSize;
          break;
      }

      if (inside) {
        // Push vertices outward to create hole effect
        const dist = Math.sqrt(x * x + y * y + z * z) + 0.001;
        const push = (cutSize - dist) * 0.5;
        positions[i] += (x / dist) * push;
        positions[i + 1] += (y / dist) * push;
        positions[i + 2] += (z / dist) * push;
      }
    }
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
}

// ============================================================================
// GROWTHS
// ============================================================================

function addGrowths() {
  // Re-seed for consistent growths
  R = initRandom(hash);
  for (let i = 0; i < 80; i++) R();

  const growthColor = new THREE.Color().setHSL(
    (features.baseHue + 30) / 360,
    features.saturation * 0.8,
    features.lightness * 1.2
  );

  for (let g = 0; g < features.growthCount; g++) {
    // Random position on surface (approximated)
    const theta = rnd(0, Math.PI * 2);
    const phi = rnd(-Math.PI / 2, Math.PI / 2);
    const surfaceR = 1.0 + rnd(-0.3, 0.3);

    const baseX = surfaceR * Math.cos(phi) * Math.cos(theta);
    const baseY = surfaceR * Math.cos(phi) * Math.sin(theta);
    const baseZ = surfaceR * Math.sin(phi);

    let growthGeo;
    const size = features.growthSize * rnd(0.5, 1.5);

    switch (features.growth) {
      case "Spikes":
        growthGeo = new THREE.ConeGeometry(size * 0.2, size * 2, 8);
        break;

      case "Tendrils":
        growthGeo = createTendril(size);
        break;

      case "Bumps":
        growthGeo = new THREE.SphereGeometry(size, 8, 8);
        break;

      case "Crystals":
        growthGeo = new THREE.OctahedronGeometry(size);
        break;

      default:
        continue;
    }

    const growthMat = new THREE.MeshStandardMaterial({
      color: growthColor,
      roughness: 0.6,
      metalness: 0.2
    });

    const growthMesh = new THREE.Mesh(growthGeo, growthMat);
    growthMesh.position.set(baseX, baseY, baseZ);

    // Orient outward
    growthMesh.lookAt(baseX * 2, baseY * 2, baseZ * 2);

    scene.add(growthMesh);
    growthMeshes.push(growthMesh);
  }
}

function createTendril(size) {
  const points = [];
  const segments = 8;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const radius = size * 0.15 * (1 - t * 0.8);
    points.push(new THREE.Vector3(
      Math.sin(t * 3) * size * 0.3,
      t * size * 2,
      Math.cos(t * 3) * size * 0.3
    ));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(curve, 16, size * 0.1, 8, false);
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate() {
  requestAnimationFrame(animate);

  if (controls) {
    controls.autoRotate = isRotating;
    controls.update();
  }

  renderer.render(scene, camera);
}

// ============================================================================
// CONTROLS & EVENTS
// ============================================================================

function setupControls() {
  document.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
      case 'r':
        regenerate();
        break;
      case 's':
        saveImage();
        break;
      case ' ':
        e.preventDefault();
        isRotating = !isRotating;
        break;
      case 'l':
        recordFeedback(true);
        showFeedbackNotification('Liked!');
        break;
      case 'd':
        recordFeedback(false);
        showFeedbackNotification('Disliked');
        break;
    }
  });
}

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

  generateFeatures();
  updateUI();
  updateBackground();
  generateMetaform();

  if (controls) {
    controls.autoRotateSpeed = features.rotationSpeed * 500;
  }
}

function saveImage() {
  const link = document.createElement('a');
  link.download = `metaforms-${hash.slice(2, 10)}.png`;
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
}

function showFeedbackNotification(text) {
  const notif = document.createElement('div');
  notif.textContent = text;
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.9);
    color: #000;
    padding: 10px 20px;
    border-radius: 4px;
    font-family: monospace;
    z-index: 1000;
  `;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 1500);
}

// ============================================================================
// UI UPDATE
// ============================================================================

function updateUI() {
  // Update hash display
  const hashEl = document.getElementById('hash-display');
  if (hashEl) hashEl.textContent = hash;

  // Update features table
  const featuresBody = document.getElementById('features-body');
  if (featuresBody) {
    featuresBody.innerHTML = '';

    const displayFeatures = [
      ['Material', features.material, getMaterialRarity(features.material)],
      ['Aesthetic', features.aesthetic, getAestheticRarity(features.aesthetic)],
      ['Distortion', features.distortion, getDistortionRarity(features.distortion)],
      ['Growth', features.growth, getGrowthRarity(features.growth)],
      ['Boolean', features.boolean, getBooleanRarity(features.boolean)],
      ['Color Family', features.colorFamily, 'common'],
      ['Blob Count', features.blobCount, features.blobCount >= 6 ? 'rare' : 'common']
    ];

    displayFeatures.forEach(([name, value, rarity]) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${name}</td>
        <td>${value}</td>
        <td><span class="rarity-badge ${rarity}">${rarity}</span></td>
      `;
      featuresBody.appendChild(row);
    });
  }

  // Update sliders
  updateSliders();
}

function getMaterialRarity(mat) {
  const weights = { Matte: 'common', Glossy: 'common', Chrome: 'uncommon',
                    Iridescent: 'uncommon', Glass: 'rare', Emissive: 'rare',
                    Holographic: 'legendary' };
  return weights[mat] || 'common';
}

function getAestheticRarity(aes) {
  const weights = { Sculptural: 'common', Organic: 'common', Alien: 'uncommon',
                    Playful: 'uncommon', SciFi: 'rare' };
  return weights[aes] || 'common';
}

function getDistortionRarity(dist) {
  const weights = { None: 'common', Twist: 'common', Taper: 'common',
                    Bend: 'uncommon', Bulge: 'rare', Wave: 'rare' };
  return weights[dist] || 'common';
}

function getGrowthRarity(growth) {
  const weights = { None: 'common', Spikes: 'uncommon', Tendrils: 'uncommon',
                    Bumps: 'uncommon', Crystals: 'rare' };
  return weights[growth] || 'common';
}

function getBooleanRarity(bool) {
  const weights = { None: 'common', 'Sphere Cut': 'uncommon', 'Box Cut': 'uncommon',
                    'Cylinder Cut': 'rare', 'Multi Cut': 'legendary' };
  return weights[bool] || 'common';
}

function updateSliders() {
  // Will be connected to UI elements in index.html
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
  generateFeatures();
  initThree();
  setupControls();
  updateUI();
  animate();
}

// Export for UI
window.metaforms = {
  regenerate,
  saveImage,
  recordFeedback,
  getFeedbackStats,
  exportFeedback,
  setParameter,
  resetToOriginal,
  hasModifications,
  getRarityCurves,
  getFeatures: () => features,
  getHash: () => hash,
  VERSION
};

// Start when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
