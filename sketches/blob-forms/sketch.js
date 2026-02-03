/**
 * BLOB-FORMS v1.0.0
 *
 * Exact 3D version of 2D bezier blob generator using lathe/revolution.
 *
 * The 2D algorithm:
 * 1. Generate points around a ring with randomized radii
 * 2. Add bezier control points perpendicular to radial direction with wobble
 * 3. Connect points with smooth bezier curves
 *
 * 3D extension:
 * - Generate the 2D blob profile using exact algorithm
 * - Sample the bezier curve to get smooth points
 * - Use THREE.LatheGeometry to revolve around Y axis
 * - Result: symmetric but exact blob shape
 *
 * Controls:
 * - R: Regenerate with new hash
 * - S: Save PNG
 * - Space: Pause/resume rotation
 * - L: Like current output
 * - D: Dislike current output
 */

// ============================================================================
// HASH-BASED RANDOMNESS
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
// CONSTANTS
// ============================================================================

const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI / 2;
const VERSION = "1.0.0";

// ============================================================================
// FEATURE SYSTEM
// ============================================================================

const MATERIAL_TYPES = [
  { name: "Matte", weight: 30 },
  { name: "Glossy", weight: 25 },
  { name: "Chrome", weight: 15 },
  { name: "Iridescent", weight: 12 },
  { name: "Glass", weight: 10 },
  { name: "Emissive", weight: 5 },
  { name: "Holographic", weight: 3 }
];

const DISTORTION_TYPES = [
  { name: "None", weight: 30 },
  { name: "Twist", weight: 25 },
  { name: "Taper", weight: 20 },
  { name: "Bend", weight: 15 },
  { name: "Wave", weight: 10 }
];

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

const RARITY_CURVES = {
  material: {
    labels: MATERIAL_TYPES.map(m => m.name),
    probabilities: MATERIAL_TYPES.map(m => m.weight / MATERIAL_TYPES.reduce((a, b) => a + b.weight, 0))
  },
  distortion: {
    labels: DISTORTION_TYPES.map(d => d.name),
    probabilities: DISTORTION_TYPES.map(d => d.weight / DISTORTION_TYPES.reduce((a, b) => a + b.weight, 0))
  }
};

function generateFeatures() {
  R = initRandom(hash);

  const materialIdx = rollRarity(MATERIAL_TYPES.map(m => m.weight));
  const distortionIdx = rollRarity(DISTORTION_TYPES.map(d => d.weight));
  const hueIdx = rndInt(0, BASE_HUES.length - 1);

  // EXACT parameters from original 2D blob generator
  const numPoints = rndInt(6, 14);              // Number of points around the ring
  const baseRadius = rnd(0.8, 1.4);             // Base radius of the blob
  const radiusRandomness = rnd(0.1, 0.35);      // Amount of random variation in radius
  const cpOffsetAngle = rnd(15, 45);            // Control point wobble angle (degrees)
  const cpDistance = rnd(0.3, 0.8);             // Control point distance (as fraction of radius)

  // Lathe parameters
  const latheSegments = rndInt(32, 64);         // Smoothness of revolution
  const profileSamples = rndInt(64, 128);       // Smoothness of bezier sampling

  // Distortion
  const distortionStrength = rnd(0.2, 0.8);

  // Color
  const hueRange = BASE_HUES[hueIdx].hueRange;
  const baseHue = rnd(hueRange[0], hueRange[1]);
  const saturation = rnd(0.5, 1.0);
  const lightness = rnd(0.3, 0.7);
  const bgLightness = rnd(0.02, 0.15);

  features = {
    material: MATERIAL_TYPES[materialIdx].name,
    materialIdx,
    distortion: DISTORTION_TYPES[distortionIdx].name,
    distortionIdx,
    colorFamily: BASE_HUES[hueIdx].name,

    // Blob shape (from original 2D)
    numPoints,
    baseRadius,
    radiusRandomness,
    cpOffsetAngle,
    cpDistance,

    // 3D params
    latheSegments,
    profileSamples,
    distortionStrength,

    // Color
    baseHue,
    saturation,
    lightness,
    bgLightness,

    rotationSpeed: rnd(0.001, 0.005),
    cameraDistance: rnd(3.5, 5.5)
  };

  originalFeatures = { ...features };
  hasOverrides = false;
  return features;
}

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

const FEEDBACK_KEY = 'blob-forms-feedback';

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
  } catch (e) {}
}

function recordFeedback(isLike) {
  const feedback = loadFeedback();
  const entry = { timestamp: Date.now(), hash, features: { ...features }, hadOverrides: hasOverrides };
  if (isLike) feedback.liked.push(entry);
  else feedback.disliked.push(entry);
  saveFeedback(feedback);
  console.log(isLike ? 'LIKED:' : 'DISLIKED:', entry);
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

function exportFeedback() { return loadFeedback(); }

// ============================================================================
// 2D BLOB GENERATOR - EXACT PORT FROM ORIGINAL
// ============================================================================

/**
 * Build blob points - EXACT algorithm from original p5.js code
 * Creates points around a ring with randomized radii and bezier control points
 */
function buildBlobPoints() {
  const blobPoints = [];

  const numPoints = features.numPoints;
  const baseRadius = features.baseRadius;
  const radiusRandomness = features.radiusRandomness;
  const cpOffsetAngle = features.cpOffsetAngle * (Math.PI / 180); // Convert to radians
  const cpDist = features.cpDistance * baseRadius;

  // Generate points around a ring - EXACT from original
  for (let p = 0; p < numPoints; p++) {
    const a = p * TWO_PI / numPoints; // Angle of this point
    const r = baseRadius + rnd(-radiusRandomness * baseRadius, radiusRandomness * baseRadius);

    const bp = {
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      angle: a,
      cp: []
    };
    blobPoints.push(bp);
  }

  // Add control points - EXACT from original
  for (let b = 0; b < blobPoints.length; b++) {
    const thisp = blobPoints[b];
    const randomAngle = rnd(-cpOffsetAngle, cpOffsetAngle);

    const cp1angle = thisp.angle - (HALF_PI + randomAngle);
    const cp2angle = thisp.angle + (HALF_PI - randomAngle);

    const cp1 = {
      x: thisp.x + Math.cos(cp1angle) * cpDist,
      y: thisp.y + Math.sin(cp1angle) * cpDist
    };
    const cp2 = {
      x: thisp.x + Math.cos(cp2angle) * cpDist,
      y: thisp.y + Math.sin(cp2angle) * cpDist
    };

    thisp.cp = [cp1, cp2];
  }

  return blobPoints;
}

/**
 * Cubic bezier interpolation
 */
function bezierPoint(t, p0, cp0, cp1, p1) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * cp0.x + 3 * mt * t2 * cp1.x + t3 * p1.x,
    y: mt3 * p0.y + 3 * mt2 * t * cp0.y + 3 * mt * t2 * cp1.y + t3 * p1.y
  };
}

/**
 * Sample the blob bezier curve to get smooth profile points
 */
function sampleBlobProfile(blobPoints, samplesPerSegment = 16) {
  const profilePoints = [];

  for (let b = 0; b < blobPoints.length; b++) {
    const curr = blobPoints[b];
    const next = blobPoints[(b + 1) % blobPoints.length];

    // Bezier: curr -> curr.cp[1] -> next.cp[0] -> next
    for (let s = 0; s < samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const pt = bezierPoint(t, curr, curr.cp[1], next.cp[0], next);
      profilePoints.push(pt);
    }
  }

  return profilePoints;
}

/**
 * Convert 2D profile to 3D lathe profile (for THREE.LatheGeometry)
 * LatheGeometry expects points as [Vector2] where x = radius, y = height
 * We'll use the blob's x as radius and y as height
 */
function profileToLathePoints(profilePoints) {
  // Find the rightmost point (max x) - this will be at the equator
  // LatheGeometry revolves around Y axis, so we need radius (distance from Y) and height (y coord)

  const lathePoints = [];

  // Sort profile by angle to ensure correct ordering
  // Actually, the profile is already ordered. We need to convert:
  // - The profile is a 2D closed curve
  // - For lathe, we take half of it (one side) and revolve

  // Strategy: Take the profile points, use their distance from center as radius
  // and map them along the Y axis based on their angle

  // Better approach: use the profile directly
  // The blob profile is in XY plane. For lathe:
  // - x coordinate of profile -> radius from Y axis
  // - y coordinate of profile -> height along Y axis

  // We need the profile to be open (half the blob) for proper lathe
  // Take points from bottom to top on one side

  // Find min and max Y
  let minY = Infinity, maxY = -Infinity;
  profilePoints.forEach(p => {
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });

  // Sort by Y for lathe (bottom to top)
  // Take only points with x >= 0 (right half)
  const rightHalf = profilePoints.filter(p => p.x >= 0);

  // Sort by angle from bottom
  rightHalf.sort((a, b) => {
    const angleA = Math.atan2(a.y, a.x);
    const angleB = Math.atan2(b.y, b.x);
    return angleA - angleB;
  });

  // Convert to Vector2 for LatheGeometry
  // LatheGeometry: x = distance from axis (radius), y = height
  rightHalf.forEach(p => {
    // Use absolute x as radius, y as height
    lathePoints.push(new THREE.Vector2(Math.abs(p.x), p.y));
  });

  // Ensure the profile is closed at top and bottom for smooth surface
  // Add points at the axis if needed
  if (lathePoints.length > 0) {
    // Add closing points
    const first = lathePoints[0];
    const last = lathePoints[lathePoints.length - 1];

    // If first point isn't at axis, add one
    if (first.x > 0.01) {
      lathePoints.unshift(new THREE.Vector2(0, first.y - 0.1));
    }
    if (last.x > 0.01) {
      lathePoints.push(new THREE.Vector2(0, last.y + 0.1));
    }
  }

  return lathePoints;
}

// ============================================================================
// THREE.JS SETUP
// ============================================================================

let scene, camera, renderer, controls;
let blobMesh;
let isRotating = true;

function initThree() {
  scene = new THREE.Scene();
  updateBackground();

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = features.cameraDistance;

  const container = document.getElementById('sketch-container');
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(700, 700);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = features.rotationSpeed * 500;

  setupLighting();
  generateBlob();
}

function updateBackground() {
  scene.background = new THREE.Color().setHSL(0, 0, features.bgLightness);
}

function setupLighting() {
  scene.children = scene.children.filter(c => !(c instanceof THREE.Light));

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  fillLight.position.set(-5, 0, 5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
  rimLight.position.set(0, -5, -5);
  scene.add(rimLight);

  const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
  topLight.position.set(0, 10, 0);
  scene.add(topLight);
}

// ============================================================================
// BLOB GENERATION
// ============================================================================

function generateBlob() {
  if (blobMesh) {
    scene.remove(blobMesh);
    blobMesh.geometry.dispose();
    if (blobMesh.material.dispose) blobMesh.material.dispose();
  }

  // Re-seed for consistent generation
  R = initRandom(hash);
  // Skip feature rolls
  for (let i = 0; i < 20; i++) R();

  // Build 2D blob using EXACT original algorithm
  const blobPoints = buildBlobPoints();

  // Sample the bezier curve for smooth profile
  const samplesPerSegment = Math.ceil(features.profileSamples / features.numPoints);
  const profilePoints = sampleBlobProfile(blobPoints, samplesPerSegment);

  // Convert to lathe profile
  const latheProfile = profileToLathePoints(profilePoints);

  if (latheProfile.length < 3) {
    // Fallback
    const geo = new THREE.SphereGeometry(1, 32, 32);
    blobMesh = new THREE.Mesh(geo, createMaterial());
    scene.add(blobMesh);
    return;
  }

  // Create lathe geometry - smooth revolution
  const geometry = new THREE.LatheGeometry(
    latheProfile,
    features.latheSegments,  // Radial segments for smoothness
    0,                        // Start angle
    TWO_PI                    // Full revolution
  );

  // Apply distortion
  applyDistortion(geometry);

  // Ensure smooth normals
  geometry.computeVertexNormals();

  // Create material
  const material = createMaterial();

  blobMesh = new THREE.Mesh(geometry, material);
  scene.add(blobMesh);
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
        metalness: 1.0
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
        roughness: 0.5
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
        positions[i] = x * Math.cos(twistAngle) - z * Math.sin(twistAngle);
        positions[i + 2] = x * Math.sin(twistAngle) + z * Math.cos(twistAngle);
        break;

      case "Taper":
        const taperFactor = 1 + y * strength * 0.5;
        positions[i] *= taperFactor;
        positions[i + 2] *= taperFactor;
        break;

      case "Bend":
        const bendAngle = x * strength;
        positions[i + 1] = y * Math.cos(bendAngle) - z * Math.sin(bendAngle);
        positions[i + 2] = y * Math.sin(bendAngle) + z * Math.cos(bendAngle);
        break;

      case "Wave":
        positions[i] += Math.sin(y * 4) * strength * 0.15;
        positions[i + 2] += Math.cos(y * 4) * strength * 0.15;
        break;
    }
  }

  geometry.attributes.position.needsUpdate = true;
}

// ============================================================================
// ANIMATION
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
// CONTROLS
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
        showNotification('Liked!');
        break;
      case 'd':
        recordFeedback(false);
        showNotification('Disliked');
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
  link.download = `blob-forms-${hash.slice(2, 10)}.png`;
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
}

function showNotification(text) {
  const notif = document.createElement('div');
  notif.textContent = text;
  notif.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: rgba(255,255,255,0.9); color: #000; padding: 10px 20px;
    border-radius: 4px; font-family: monospace; z-index: 1000;
  `;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 1500);
}

// ============================================================================
// UI
// ============================================================================

function updateUI() {
  const hashEl = document.getElementById('hash-display');
  if (hashEl) hashEl.textContent = hash;

  const featuresBody = document.getElementById('features-body');
  if (featuresBody) {
    featuresBody.innerHTML = '';
    const displayFeatures = [
      ['Material', features.material, getRarity('material', features.material)],
      ['Distortion', features.distortion, getRarity('distortion', features.distortion)],
      ['Color', features.colorFamily, 'common'],
      ['Points', features.numPoints, features.numPoints >= 12 ? 'rare' : 'common'],
      ['Radius Var', (features.radiusRandomness * 100).toFixed(0) + '%', features.radiusRandomness > 0.3 ? 'rare' : 'common']
    ];

    displayFeatures.forEach(([name, value, rarity]) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${name}</td><td>${value}</td><td><span class="rarity-badge ${rarity}">${rarity}</span></td>`;
      featuresBody.appendChild(row);
    });
  }
}

function getRarity(type, value) {
  const rarities = {
    material: { Matte: 'common', Glossy: 'common', Chrome: 'uncommon', Iridescent: 'uncommon', Glass: 'rare', Emissive: 'rare', Holographic: 'legendary' },
    distortion: { None: 'common', Twist: 'common', Taper: 'common', Bend: 'uncommon', Wave: 'rare' }
  };
  return rarities[type]?.[value] || 'common';
}

// ============================================================================
// INIT
// ============================================================================

function init() {
  generateFeatures();
  initThree();
  setupControls();
  updateUI();
  animate();
}

window.blobforms = {
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
