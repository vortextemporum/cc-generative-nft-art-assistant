/**
 * ORGANICS v1.0.0
 *
 * Weird 3D blob objects using deformed spheres.
 * Vertex displacement based on 2D bezier blob ring logic.
 *
 * The original 2D blob generator creates points around a ring with:
 * - Randomized radii per point
 * - Bezier control points for smooth curves
 * - Angular wobble for organic variation
 *
 * This 3D version extends that concept to a sphere:
 * - Subdivided icosphere as base
 * - Radial displacement using layered noise
 * - "Ring bands" at different latitudes with varying deformation
 * - Smooth interpolation via subdivision
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
// SIMPLEX NOISE (for organic displacement)
// ============================================================================

// Simplex 3D noise implementation
const SimplexNoise = (function() {
  const F3 = 1.0 / 3.0;
  const G3 = 1.0 / 6.0;

  const grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ];

  class SimplexNoise {
    constructor(random = Math.random) {
      this.perm = new Uint8Array(512);
      this.permMod12 = new Uint8Array(512);

      const p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) p[i] = i;

      // Shuffle using provided random
      for (let i = 255; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
      }

      for (let i = 0; i < 512; i++) {
        this.perm[i] = p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
      }
    }

    noise3D(x, y, z) {
      const { perm, permMod12 } = this;

      const s = (x + y + z) * F3;
      const i = Math.floor(x + s);
      const j = Math.floor(y + s);
      const k = Math.floor(z + s);

      const t = (i + j + k) * G3;
      const X0 = i - t, Y0 = j - t, Z0 = k - t;
      const x0 = x - X0, y0 = y - Y0, z0 = z - Z0;

      let i1, j1, k1, i2, j2, k2;
      if (x0 >= y0) {
        if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
        else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
        else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
      } else {
        if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
        else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
        else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
      }

      const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
      const x2 = x0 - i2 + 2*G3, y2 = y0 - j2 + 2*G3, z2 = z0 - k2 + 2*G3;
      const x3 = x0 - 1 + 3*G3, y3 = y0 - 1 + 3*G3, z3 = z0 - 1 + 3*G3;

      const ii = i & 255, jj = j & 255, kk = k & 255;

      const dot = (g, x, y, z) => g[0]*x + g[1]*y + g[2]*z;

      let n0 = 0, n1 = 0, n2 = 0, n3 = 0;

      let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
      if (t0 >= 0) {
        const gi0 = permMod12[ii + perm[jj + perm[kk]]];
        t0 *= t0;
        n0 = t0 * t0 * dot(grad3[gi0], x0, y0, z0);
      }

      let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
      if (t1 >= 0) {
        const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]];
        t1 *= t1;
        n1 = t1 * t1 * dot(grad3[gi1], x1, y1, z1);
      }

      let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
      if (t2 >= 0) {
        const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]];
        t2 *= t2;
        n2 = t2 * t2 * dot(grad3[gi2], x2, y2, z2);
      }

      let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
      if (t3 >= 0) {
        const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]];
        t3 *= t3;
        n3 = t3 * t3 * dot(grad3[gi3], x3, y3, z3);
      }

      return 32 * (n0 + n1 + n2 + n3);
    }
  }

  return SimplexNoise;
})();

let noise;

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

// Base hues for procedural colors
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

  // Initialize noise with this hash's random
  noise = new SimplexNoise(R);

  // Roll for each feature category
  const materialIdx = rollRarity(MATERIAL_TYPES.map(m => m.weight));
  const distortionIdx = rollRarity(DISTORTION_TYPES.map(d => d.weight));
  const growthIdx = rollRarity(GROWTH_TYPES.map(g => g.weight));
  const booleanIdx = rollRarity(BOOLEAN_TYPES.map(b => b.weight));
  const hueIdx = rndInt(0, BASE_HUES.length - 1);

  // Blob parameters (inspired by original 2D script)
  const numPoints = rndInt(6, 14);           // Like numPoints in original
  const baseRadius = rnd(0.8, 1.2);          // Base sphere radius
  const radiusRandomness = rnd(0.15, 0.4);   // Like radiusRandomness in original
  const cpOffsetAngle = rnd(15, 45);         // Control point wobble (degrees)
  const noiseScale = rnd(1.5, 4.0);          // Noise frequency
  const noiseOctaves = rndInt(2, 4);         // Noise detail layers
  const subdivisions = rndInt(3, 5);         // Icosphere detail level

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
    distortion: DISTORTION_TYPES[distortionIdx].name,
    distortionIdx,
    growth: GROWTH_TYPES[growthIdx].name,
    growthIdx,
    boolean: BOOLEAN_TYPES[booleanIdx].name,
    booleanIdx,
    colorFamily: BASE_HUES[hueIdx].name,
    hueIdx,

    // Blob shape parameters (from 2D concept)
    numPoints,
    baseRadius,
    radiusRandomness,
    cpOffsetAngle,
    noiseScale,
    noiseOctaves,
    subdivisions,

    // Other numeric features
    distortionStrength,
    growthCount,
    growthSize,
    baseHue,
    saturation,
    lightness,
    bgLightness,

    // Derived
    rotationSpeed: rnd(0.001, 0.005),
    cameraDistance: rnd(3.5, 5)
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

const FEEDBACK_KEY = 'organics-feedback';

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
let blobMesh, growthMeshes = [];
let isRotating = true;
let clock;

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

  // Generate the blob
  generateBlob();
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
// BLOB GENERATION - Core algorithm inspired by 2D bezier blob
// ============================================================================

function createIcosphere(radius, subdivisions) {
  // Create icosahedron and subdivide
  const geometry = new THREE.IcosahedronGeometry(radius, subdivisions);
  return geometry;
}

function generateBlob() {
  // Clear previous
  if (blobMesh) {
    scene.remove(blobMesh);
    blobMesh.geometry.dispose();
    if (blobMesh.material.dispose) blobMesh.material.dispose();
  }
  growthMeshes.forEach(m => {
    scene.remove(m);
    m.geometry.dispose();
    if (m.material.dispose) m.material.dispose();
  });
  growthMeshes = [];

  // Re-initialize noise with consistent seed
  R = initRandom(hash);
  // Skip feature rolls
  for (let i = 0; i < 30; i++) R();
  noise = new SimplexNoise(R);

  // Create base icosphere
  const geometry = createIcosphere(features.baseRadius, features.subdivisions);

  // Apply blob displacement (the core algorithm)
  applyBlobDisplacement(geometry);

  // Apply additional distortions
  applyDistortion(geometry);

  // Apply boolean effects
  applyBooleanEffect(geometry);

  // Recompute normals after all deformations
  geometry.computeVertexNormals();

  // Create material
  const material = createMaterial();

  // Create mesh
  blobMesh = new THREE.Mesh(geometry, material);
  scene.add(blobMesh);

  // Add growths
  if (features.growth !== "None") {
    addGrowths();
  }
}

/**
 * Core blob displacement algorithm
 *
 * Inspired by the 2D bezier blob generator:
 * - Original creates points around a ring with randomized radii
 * - Uses bezier curves with wobbling control points
 *
 * 3D version:
 * - For each vertex, calculate spherical coordinates (theta, phi)
 * - Use layered noise to create organic radial displacement
 * - The "numPoints" concept becomes noise frequency bands
 * - The "cpOffsetAngle" becomes additional noise perturbation
 */
function applyBlobDisplacement(geometry) {
  const positions = geometry.attributes.position.array;
  const vertex = new THREE.Vector3();

  // Parameters from features (inspired by 2D blob)
  const baseR = features.baseRadius;
  const randomness = features.radiusRandomness;
  const noiseFreq = features.noiseScale;
  const octaves = features.noiseOctaves;
  const wobble = features.cpOffsetAngle / 180 * Math.PI; // Convert to radians

  for (let i = 0; i < positions.length; i += 3) {
    vertex.set(positions[i], positions[i + 1], positions[i + 2]);

    // Get spherical coordinates
    const r = vertex.length();
    const theta = Math.atan2(vertex.y, vertex.x);  // Azimuthal angle
    const phi = Math.acos(vertex.z / r);            // Polar angle

    // Multi-octave noise for organic displacement
    // This mimics the randomized radii in the 2D blob
    let displacement = 0;
    let amplitude = 1;
    let frequency = noiseFreq;
    let maxAmp = 0;

    for (let o = 0; o < octaves; o++) {
      // Sample noise using spherical coordinates
      // Add wobble offset (like cpOffsetAngle in original)
      const wobbleOffset = noise.noise3D(
        theta * 0.5 + o,
        phi * 0.5 + o,
        o * 10
      ) * wobble;

      const n = noise.noise3D(
        Math.cos(theta + wobbleOffset) * frequency,
        Math.sin(theta + wobbleOffset) * frequency,
        Math.cos(phi) * frequency
      );

      displacement += n * amplitude;
      maxAmp += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    // Normalize and scale displacement
    displacement = displacement / maxAmp;
    displacement = displacement * randomness * baseR;

    // Apply radial displacement
    const newR = r + displacement;
    vertex.normalize().multiplyScalar(newR);

    positions[i] = vertex.x;
    positions[i + 1] = vertex.y;
    positions[i + 2] = vertex.z;
  }

  geometry.attributes.position.needsUpdate = true;
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
        metalness: 0.0
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
      x: rnd(-0.3, 0.3),
      y: rnd(-0.3, 0.3),
      z: rnd(-0.3, 0.3)
    };
    const cutSize = rnd(0.2, 0.5);

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

  // Get blob surface positions for placing growths
  const blobPositions = blobMesh.geometry.attributes.position.array;
  const vertexCount = blobPositions.length / 3;

  for (let g = 0; g < features.growthCount; g++) {
    // Pick a random vertex from the blob surface
    const vertIdx = Math.floor(R() * vertexCount) * 3;
    const baseX = blobPositions[vertIdx];
    const baseY = blobPositions[vertIdx + 1];
    const baseZ = blobPositions[vertIdx + 2];

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

    // Orient outward from center
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
  generateBlob();

  if (controls) {
    controls.autoRotateSpeed = features.rotationSpeed * 500;
  }
}

function saveImage() {
  const link = document.createElement('a');
  link.download = `organics-${hash.slice(2, 10)}.png`;
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
      ['Distortion', features.distortion, getDistortionRarity(features.distortion)],
      ['Growth', features.growth, getGrowthRarity(features.growth)],
      ['Boolean', features.boolean, getBooleanRarity(features.boolean)],
      ['Color Family', features.colorFamily, 'common'],
      ['Points', features.numPoints, features.numPoints >= 12 ? 'rare' : 'common'],
      ['Subdivisions', features.subdivisions, features.subdivisions >= 5 ? 'rare' : 'common']
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
  // Connected to UI elements in index.html
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
window.organics = {
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
