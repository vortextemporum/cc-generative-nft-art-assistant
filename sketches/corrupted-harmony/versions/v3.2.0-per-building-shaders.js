/**
 * CORRUPTED HARMONY v3.2.0
 * True 3D isometric city with PER-BUILDING effects
 * Bringing back the v1.0.0 aesthetic with 3D rotation
 * Built with three.js + custom shader materials
 */

// =============================================================================
// HASH-BASED RANDOMNESS
// =============================================================================

let hash = "0x" + Array(64).fill(0).map(() =>
  "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

if (typeof tokenData !== "undefined" && tokenData.hash) hash = tokenData.hash;
if (typeof fxhash !== "undefined") hash = fxhash;

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
  const h = hashStr.startsWith("0x") ? hashStr.slice(2) : hashStr;
  return sfc32(
    parseInt(h.substr(0, 8), 16),
    parseInt(h.substr(8, 8), 16),
    parseInt(h.substr(16, 8), 16),
    parseInt(h.substr(24, 8), 16)
  );
}

let R;
function rnd(min = 0, max = 1) { return min + R() * (max - min); }
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rndChoice(arr) { return arr[Math.floor(R() * arr.length)]; }
function rndBool(p = 0.5) { return R() < p; }

function rollRarity() {
  const r = R();
  if (r < 0.05) return 'legendary';
  if (r < 0.15) return 'rare';
  if (r < 0.40) return 'uncommon';
  return 'common';
}

// =============================================================================
// CONFIGURATION
// =============================================================================

let features = {};
const GRID_SIZE = 4;
const BLOCK_SIZE = 10;
const ROAD_WIDTH = 2;
const BUILDING_SCALE = 0.8;

const ARCH_STYLES = ['brutalist', 'deco', 'modernist', 'gothic', 'retro', 'geometric', 'organic'];
const EFFECT_TYPES = ['clean', 'dither', 'glitch', 'noise', 'corrupt', 'liquify', 'stencil'];
const DITHER_MODES = ['bayer', 'stipple', 'halftone'];

const PALETTES = {
  muted: {
    bg: 0x3a3a42, ground: 0x2d2d35, road: 0x1f1f25,
    building: [0x4a4a52, 0x5a5a62, 0x6a6a72, 0x7a7a82, 0x8a8a92],
    accent: 0x9a9aa2, grass: 0x3d4a3d, water: 0x2a3a4a,
    window: 0x2d2d2d, windowLit: 0xd4d4d4
  },
  cyber: {
    bg: 0x0d0d1a, ground: 0x0a0a12, road: 0x050508,
    building: [0x1a1a2e, 0x252540, 0x303052, 0x404065, 0x505078],
    accent: 0x00ffaa, grass: 0x0a1a15, water: 0x0a1525,
    window: 0x0a0a1a, windowLit: 0x00ffaa
  },
  cool: {
    bg: 0x2a3a4a, ground: 0x1a2a3a, road: 0x0a1a2a,
    building: [0x3a4a5a, 0x4a5a6a, 0x5a6a7a, 0x6a7a8a, 0x7a8a9a],
    accent: 0x8aaacc, grass: 0x2a4a4a, water: 0x1a3a5a,
    window: 0x1a2a3a, windowLit: 0x9aabba
  },
  warm: {
    bg: 0x4a3a2a, ground: 0x3a2a1a, road: 0x2a1a0a,
    building: [0x5a4a3a, 0x6a5a4a, 0x7a6a5a, 0x8a7a6a, 0x9a8a7a],
    accent: 0xccaa88, grass: 0x4a4a2a, water: 0x3a4a4a,
    window: 0x3a2a1a, windowLit: 0xbaa090
  },
  twilight: {
    bg: 0x2a2a4e, ground: 0x1a1a3e, road: 0x0a0a2e,
    building: [0x3a3a5e, 0x4a4a6e, 0x5a5a7e, 0x6a6a8e, 0x8a8aae],
    accent: 0xaa8acc, grass: 0x2a3a4a, water: 0x1a2a5a,
    window: 0x1a1a2e, windowLit: 0xbabace
  },
  fog: {
    bg: 0xc8c8c8, ground: 0xa0a0a0, road: 0x707070,
    building: [0x909090, 0xa0a0a0, 0xb0b0b0, 0xc0c0c0, 0xd0d0d0],
    accent: 0xe8e8e8, grass: 0x8a9a8a, water: 0x7a8a9a,
    window: 0x505050, windowLit: 0xf0f0f0
  },
  neonBleed: {
    bg: 0x0a0a1a, ground: 0x050510, road: 0x020208,
    building: [0x1a0a2a, 0x2a1a3a, 0x0a1a2a, 0x1a1a3a, 0x2a2a4a],
    accent: 0xff2a6d, grass: 0x0a2a1a, water: 0x0a1a3a,
    window: 0x0a0a0a, windowLit: 0xff2a6d
  }
};

// =============================================================================
// FEATURE GENERATION
// =============================================================================

function generateFeatures() {
  R = initRandom(hash);

  const rarity = rollRarity();
  let paletteKey = rarity === 'legendary' ? rndChoice(['neonBleed', 'cyber']) :
                   rarity === 'rare' ? rndChoice(['twilight', 'cool', 'cyber']) :
                   rarity === 'uncommon' ? rndChoice(['cyber', 'cool', 'fog']) :
                   rndChoice(['muted', 'fog', 'warm']);

  const weirdnessLevel = rarity === 'legendary' ? 'reality-collapse' :
                         rarity === 'rare' ? 'chaotic' :
                         rarity === 'uncommon' ? 'moderate' : 'subtle';

  const dominantEffect = rarity === 'legendary' ? rndChoice(['corrupt', 'liquify', 'glitch']) :
                         rarity === 'rare' ? rndChoice(['glitch', 'noise', 'dither']) :
                         rarity === 'uncommon' ? rndChoice(['dither', 'stencil']) :
                         rndChoice(['clean', 'dither']);

  const density = rndChoice(['sparse', 'normal', 'dense', 'packed']);
  const hasRiver = rndBool(0.2);
  const timeOfDay = rndChoice(['day', 'dusk', 'night', 'dawn']);

  features = {
    rarity, palette: paletteKey, weirdnessLevel, dominantEffect,
    density, hasRiver, timeOfDay,
    seed: hash.slice(0, 10)
  };

  return features;
}

// =============================================================================
// SHADER MATERIALS FOR PER-BUILDING EFFECTS
// =============================================================================

// Dither shader material - Bayer matrix dithering
function createDitherMaterial(baseColor, intensity = 0.8, seed = 0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(baseColor) },
      intensity: { value: intensity },
      seed: { value: seed },
      time: { value: 0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform float intensity;
      uniform float seed;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;

      float bayer(vec2 coord) {
        vec2 c = floor(mod(coord * 8.0, 4.0));
        int i = int(c.x) + int(c.y) * 4;
        float m[16];
        m[0]=0.0; m[1]=8.0; m[2]=2.0; m[3]=10.0;
        m[4]=12.0; m[5]=4.0; m[6]=14.0; m[7]=6.0;
        m[8]=3.0; m[9]=11.0; m[10]=1.0; m[11]=9.0;
        m[12]=15.0; m[13]=7.0; m[14]=13.0; m[15]=5.0;
        for(int j=0; j<16; j++) {
          if(j==i) return m[j] / 16.0;
        }
        return 0.0;
      }

      void main() {
        // Simple directional lighting
        vec3 light = normalize(vec3(1.0, 1.0, 0.5));
        float diff = max(dot(vNormal, light), 0.3);

        vec3 color = baseColor * diff;

        // Apply Bayer dithering
        float threshold = bayer(gl_FragCoord.xy);
        float luminance = dot(color, vec3(0.299, 0.587, 0.114));

        // Quantize based on threshold
        vec3 dithered = step(threshold, color * intensity + (1.0 - intensity) * 0.5);

        gl_FragColor = vec4(mix(color, dithered * baseColor * 1.2, intensity * 0.7), 1.0);
      }
    `
  });
}

// Glitch shader material - RGB shift and displacement
function createGlitchMaterial(baseColor, intensity = 0.5, seed = 0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(baseColor) },
      intensity: { value: intensity },
      seed: { value: seed },
      time: { value: 0 }
    },
    vertexShader: `
      uniform float intensity;
      uniform float time;
      uniform float seed;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;

        vec3 pos = position;

        // Glitch displacement - varies by seed for each building
        float glitchY = floor(pos.y * 3.0 + seed);
        if (random(vec2(glitchY, seed + floor(time * 2.0))) > 0.92) {
          pos.x += (random(vec2(glitchY + 1.0, seed)) - 0.5) * intensity * 2.0;
        }

        vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform float intensity;
      uniform float seed;
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vec3 light = normalize(vec3(1.0, 1.0, 0.5));
        float diff = max(dot(vNormal, light), 0.3);

        vec3 color = baseColor * diff;

        // RGB shift based on position
        float shift = intensity * 0.15;
        float r = color.r * (1.0 + shift * sin(vWorldPosition.y * 10.0 + seed));
        float g = color.g;
        float b = color.b * (1.0 - shift * sin(vWorldPosition.y * 10.0 + seed + 1.0));

        // Scanlines
        float scanline = sin(gl_FragCoord.y * 2.0) * 0.05 * intensity;

        // Random block corruption
        vec2 blockCoord = floor(gl_FragCoord.xy / 8.0);
        if (random(blockCoord + seed + floor(time)) > 0.97) {
          r = 1.0 - r;
          g = 1.0 - g;
          b = 1.0 - b;
        }

        gl_FragColor = vec4(r - scanline, g - scanline, b - scanline, 1.0);
      }
    `
  });
}

// Corrupt shader material - block artifacts and color shifts
function createCorruptMaterial(baseColor, intensity = 0.5, seed = 0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(baseColor) },
      intensity: { value: intensity },
      seed: { value: seed },
      time: { value: 0 }
    },
    vertexShader: `
      uniform float intensity;
      uniform float seed;
      varying vec3 vNormal;
      varying vec3 vPosition;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;

        vec3 pos = position;

        // Corrupt vertex displacement
        float blockY = floor(pos.y * 2.0 + seed);
        if (random(vec2(blockY, seed)) > 0.85) {
          pos.xz += (vec2(random(vec2(blockY, seed + 1.0)), random(vec2(blockY, seed + 2.0))) - 0.5) * intensity * 0.5;
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform float intensity;
      uniform float seed;
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vPosition;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vec3 light = normalize(vec3(1.0, 1.0, 0.5));
        float diff = max(dot(vNormal, light), 0.3);

        vec3 color = baseColor * diff;

        // Block corruption
        vec2 blockCoord = floor(gl_FragCoord.xy / 8.0);
        float blockRnd = random(blockCoord + seed);

        if (blockRnd > 1.0 - intensity * 0.4) {
          float mode = floor(random(blockCoord + seed + 1.0) * 4.0);

          if (mode < 1.0) {
            // Color shift
            color.r = fract(color.r + 0.5);
          } else if (mode < 2.0) {
            // Invert
            color = 1.0 - color;
          } else if (mode < 3.0) {
            // Solid
            color = vec3(step(0.5, random(blockCoord + seed + 2.0)));
          } else {
            // Channel swap
            color = color.bgr;
          }
        }

        // Data mosh streaks
        float streak = random(vec2(floor(gl_FragCoord.x / 2.0), seed));
        if (streak > 0.98) {
          color = mix(color, vec3(random(vec2(gl_FragCoord.x, seed))), intensity * 0.5);
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

// Liquify shader material - wave distortion
function createLiquifyMaterial(baseColor, intensity = 0.5, seed = 0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(baseColor) },
      intensity: { value: intensity },
      seed: { value: seed },
      time: { value: 0 }
    },
    vertexShader: `
      uniform float intensity;
      uniform float seed;
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDrip;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;

        vec3 pos = position;

        // Liquify wave distortion
        float wave = sin(pos.y * 2.0 + seed * 10.0 + time * 0.5) * intensity * 0.3;
        pos.x += wave;
        pos.z += cos(pos.y * 1.5 + seed * 10.0 + time * 0.3) * intensity * 0.2;

        // Drip effect at bottom
        vDrip = 0.0;
        if (pos.y < 1.0) {
          float drip = (1.0 - pos.y) * intensity * 0.5;
          pos.y -= drip * abs(sin(pos.x * 3.0 + seed));
          vDrip = drip;
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform float intensity;
      uniform float seed;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDrip;

      void main() {
        vec3 light = normalize(vec3(1.0, 1.0, 0.5));
        float diff = max(dot(vNormal, light), 0.3);

        vec3 color = baseColor * diff;

        // Dripping color blend
        color = mix(color, color * 0.7, vDrip);

        // Slight color shift for liquidy feel
        color.r += sin(vPosition.y * 5.0 + seed) * 0.05 * intensity;
        color.b += cos(vPosition.y * 5.0 + seed) * 0.05 * intensity;

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

// Stencil shader material - posterization
function createStencilMaterial(baseColor, levels = 4, seed = 0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(baseColor) },
      levels: { value: levels },
      seed: { value: seed }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform float levels;
      uniform float seed;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vec3 light = normalize(vec3(1.0, 1.0, 0.5));
        float diff = max(dot(vNormal, light), 0.3);

        vec3 color = baseColor * diff;

        // Posterize to limited levels
        float step = 1.0 / (levels - 1.0);
        color = floor(color / step + 0.5) * step;

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

// Noise shader material - film grain and static
function createNoiseMaterial(baseColor, intensity = 0.3, seed = 0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(baseColor) },
      intensity: { value: intensity },
      seed: { value: seed },
      time: { value: 0 }
    },
    vertexShader: `
      uniform float intensity;
      uniform float seed;
      varying vec3 vNormal;
      varying vec3 vPosition;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;

        vec3 pos = position;

        // Subtle vertex noise
        pos += (vec3(
          random(vec2(position.x, seed)),
          random(vec2(position.y, seed + 1.0)),
          random(vec2(position.z, seed + 2.0))
        ) - 0.5) * intensity * 0.2;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform float intensity;
      uniform float seed;
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vPosition;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vec3 light = normalize(vec3(1.0, 1.0, 0.5));
        float diff = max(dot(vNormal, light), 0.3);

        vec3 color = baseColor * diff;

        // Film grain
        float noise = random(gl_FragCoord.xy + time * 100.0 + seed) * intensity;
        color += noise - intensity * 0.5;

        // Static lines
        if (random(vec2(floor(gl_FragCoord.y / 2.0), time + seed)) > 0.995) {
          color = vec3(random(gl_FragCoord.xy + seed));
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

// Clean material - just basic lambert with slight enhancement
function createCleanMaterial(baseColor) {
  return new THREE.MeshLambertMaterial({ color: baseColor });
}

// Create material based on effect type
function createEffectMaterial(effect, baseColor, seed, rarity) {
  const intensity = rarity === 'legendary' ? 0.9 :
                    rarity === 'rare' ? 0.7 :
                    rarity === 'uncommon' ? 0.5 : 0.3;

  switch (effect) {
    case 'dither':
      return createDitherMaterial(baseColor, intensity, seed);
    case 'glitch':
      return createGlitchMaterial(baseColor, intensity, seed);
    case 'corrupt':
      return createCorruptMaterial(baseColor, intensity, seed);
    case 'liquify':
      return createLiquifyMaterial(baseColor, intensity, seed);
    case 'stencil':
      return createStencilMaterial(baseColor, rndInt(3, 6), seed);
    case 'noise':
      return createNoiseMaterial(baseColor, intensity * 0.8, seed);
    case 'clean':
    default:
      return createCleanMaterial(baseColor);
  }
}

// =============================================================================
// THREE.JS SETUP
// =============================================================================

let scene, camera, renderer, controls;
let cityGroup;
let clock;
let buildingMaterials = [];

function init() {
  const container = document.getElementById('sketch-container');
  const width = 700;
  const height = 700;

  clock = new THREE.Clock();

  // Scene
  scene = new THREE.Scene();

  // Camera - isometric-style orthographic
  const aspect = width / height;
  const frustumSize = 50;
  camera = new THREE.OrthographicCamera(
    -frustumSize * aspect / 2, frustumSize * aspect / 2,
    frustumSize / 2, -frustumSize / 2,
    0.1, 1000
  );

  camera.position.set(50, 50, 50);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.minPolarAngle = Math.PI / 6;
  controls.maxPolarAngle = Math.PI / 2.5;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 100, 50);
  scene.add(directionalLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(-30, 50, -30);
  scene.add(backLight);

  // Generate city
  generateFeatures();
  buildCity();

  // Start animation
  animate();

  // Keyboard controls
  document.addEventListener('keydown', onKeyDown);
}

// =============================================================================
// CITY GENERATION
// =============================================================================

function buildCity() {
  const pal = PALETTES[features.palette];

  // Clean up old city
  if (cityGroup) {
    cityGroup.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    scene.remove(cityGroup);
  }

  buildingMaterials = [];
  cityGroup = new THREE.Group();

  scene.background = new THREE.Color(pal.bg);

  // Ground - centered properly
  const groundSize = GRID_SIZE * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH;
  const groundGeo = new THREE.BoxGeometry(groundSize, 0.5, groundSize);
  const groundMat = new THREE.MeshLambertMaterial({ color: pal.ground });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.set(groundSize/2 - ROAD_WIDTH, -0.25, groundSize/2 - ROAD_WIDTH);
  cityGroup.add(ground);

  buildRoads(pal, groundSize);

  const cityData = generateCityData();

  for (const block of cityData.blocks) {
    if (block.type === 'buildings') {
      for (const b of block.buildings) {
        buildBuilding(b, pal);
      }
    } else if (block.type === 'park') {
      buildPark(block, pal);
    } else if (block.type === 'water') {
      buildWater(block, pal);
    }
  }

  cityGroup.position.set(-groundSize/2 + ROAD_WIDTH, 0, -groundSize/2 + ROAD_WIDTH);
  scene.add(cityGroup);
}

function buildRoads(pal, groundSize) {
  const roadMat = new THREE.MeshLambertMaterial({ color: pal.road });

  for (let i = 0; i <= GRID_SIZE; i++) {
    const z = i * (BLOCK_SIZE + ROAD_WIDTH);
    const roadGeo = new THREE.BoxGeometry(groundSize, 0.1, ROAD_WIDTH);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(groundSize/2 - ROAD_WIDTH, 0.05, z);
    cityGroup.add(road);
  }

  for (let i = 0; i <= GRID_SIZE; i++) {
    const x = i * (BLOCK_SIZE + ROAD_WIDTH);
    const roadGeo = new THREE.BoxGeometry(ROAD_WIDTH, 0.1, groundSize);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(x, 0.05, groundSize/2 - ROAD_WIDTH);
    cityGroup.add(road);
  }
}

function generateCityData() {
  const blocks = [];

  for (let gx = 0; gx < GRID_SIZE; gx++) {
    for (let gz = 0; gz < GRID_SIZE; gz++) {
      const blockX = gx * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH;
      const blockZ = gz * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH;

      let type = 'buildings';
      if (features.hasRiver && gx === Math.floor(GRID_SIZE / 2)) {
        type = 'water';
      } else if (rndBool(0.12)) {
        type = 'park';
      }

      const block = { type, x: blockX, z: blockZ, buildings: [] };

      if (type === 'buildings') {
        const buildingCount = features.density === 'packed' ? rndInt(4, 6) :
                              features.density === 'dense' ? rndInt(3, 5) :
                              features.density === 'normal' ? rndInt(2, 4) : rndInt(1, 3);

        const subdivisions = subdivideBlock(BLOCK_SIZE, BLOCK_SIZE, buildingCount);

        for (const sub of subdivisions) {
          const style = rndChoice(ARCH_STYLES);
          const height = rnd(4, 20);
          const weirdness = generateWeirdness();
          const effect = getEffect();
          const seed = rnd(0, 1000);

          block.buildings.push({
            x: blockX + sub.x + sub.w/2,
            z: blockZ + sub.z + sub.d/2,
            w: (sub.w - 0.5) * BUILDING_SCALE,
            d: (sub.d - 0.5) * BUILDING_SCALE,
            h: height,
            style,
            weirdness,
            effect,
            seed
          });
        }
      }

      blocks.push(block);
    }
  }

  return { blocks };
}

function subdivideBlock(w, d, count) {
  if (count <= 1) return [{ x: 0, z: 0, w, d }];

  const plots = [];
  const horizontal = rndBool();

  if (horizontal && count >= 2) {
    const split = rnd(0.3, 0.7);
    const d1 = Math.floor(d * split);
    plots.push(...subdivideBlock(w, d1, Math.ceil(count / 2)));
    plots.push(...subdivideBlock(w, d - d1, Math.floor(count / 2)).map(p => ({ ...p, z: p.z + d1 })));
  } else {
    const split = rnd(0.3, 0.7);
    const w1 = Math.floor(w * split);
    plots.push(...subdivideBlock(w1, d, Math.ceil(count / 2)));
    plots.push(...subdivideBlock(w - w1, d, Math.floor(count / 2)).map(p => ({ ...p, x: p.x + w1 })));
  }

  return plots;
}

function getEffect() {
  if (rndBool(0.6)) return features.dominantEffect;
  return rndChoice(EFFECT_TYPES);
}

function generateWeirdness() {
  const weirdness = [];
  const level = features.weirdnessLevel;
  const chance = level === 'reality-collapse' ? 0.8 :
                 level === 'chaotic' ? 0.6 :
                 level === 'moderate' ? 0.35 : 0.1;

  if (rndBool(chance * 0.7)) {
    weirdness.push({ type: 'float', offset: rnd(0.5, 3) });
  }

  if (rndBool(chance * 0.5)) {
    weirdness.push({
      type: 'tilt',
      x: rnd(-0.15, 0.15),
      z: rnd(-0.15, 0.15)
    });
  }

  if (rndBool(chance * 0.4)) {
    weirdness.push({
      type: 'scale',
      x: rnd(0.7, 1.4),
      y: rnd(0.8, 1.3),
      z: rnd(0.7, 1.4)
    });
  }

  if (rndBool(chance * 0.3)) {
    weirdness.push({ type: 'melt', intensity: rnd(0.3, 1.0) });
  }

  if (rndBool(chance * 0.25)) {
    weirdness.push({
      type: 'echo',
      offset: { x: rnd(-2, 2), y: rnd(0, 3), z: rnd(-2, 2) },
      opacity: rnd(0.2, 0.5)
    });
  }

  if (rndBool(chance * 0.2)) {
    weirdness.push({ type: 'fragment', count: rndInt(2, 5) });
  }

  if (level === 'reality-collapse' && rndBool(0.15)) {
    weirdness.push({ type: 'invert' });
  }

  return weirdness;
}

// =============================================================================
// BUILDING CONSTRUCTION WITH PER-BUILDING EFFECTS
// =============================================================================

function buildBuilding(b, pal) {
  const group = new THREE.Group();

  const colorIndex = rndInt(0, 4);
  const mainColor = pal.building[colorIndex];
  const accentColor = pal.accent;
  const darkerColor = pal.building[Math.max(0, colorIndex - 1)];

  // Create effect material for this building
  const effectMaterial = createEffectMaterial(b.effect, mainColor, b.seed, features.rarity);
  buildingMaterials.push(effectMaterial);

  // Check for echo weirdness first (render ghost behind)
  for (const w of b.weirdness) {
    if (w.type === 'echo') {
      const ghostGroup = new THREE.Group();
      const ghostMat = createEffectMaterial(b.effect, mainColor, b.seed + 100, features.rarity);
      if (ghostMat.uniforms) {
        // For shader materials
        ghostMat.transparent = true;
        ghostMat.opacity = w.opacity;
      } else {
        // For regular materials
        ghostMat.transparent = true;
        ghostMat.opacity = w.opacity;
      }
      buildingMaterials.push(ghostMat);
      buildBuildingGeometry(ghostGroup, b, ghostMat, effectMaterial, darkerColor, pal);
      ghostGroup.position.set(w.offset.x, w.offset.y, w.offset.z);
      group.add(ghostGroup);
    }
  }

  // Main building
  buildBuildingGeometry(group, b, effectMaterial, effectMaterial, darkerColor, pal);

  // Apply weirdness transformations
  let yOffset = 0;
  for (const w of b.weirdness) {
    if (w.type === 'float') yOffset = w.offset;
    if (w.type === 'tilt') {
      group.rotation.x = w.x;
      group.rotation.z = w.z;
    }
    if (w.type === 'scale') {
      group.scale.set(w.x, w.y, w.z);
    }
    if (w.type === 'invert') {
      group.rotation.x = Math.PI;
      yOffset += b.h;
    }
    if (w.type === 'fragment') {
      addFragments(group, b, effectMaterial, w.count);
    }
  }

  // Add windows
  addWindows(group, b, pal);

  // Melt effect - add dripping geometry
  for (const w of b.weirdness) {
    if (w.type === 'melt') {
      addMeltEffect(group, b, effectMaterial, w.intensity);
    }
  }

  group.position.set(b.x, yOffset, b.z);
  cityGroup.add(group);
}

function buildBuildingGeometry(group, b, mainMat, accentMat, darkerColor, pal) {
  let geometry, mesh;
  const darkerMat = createEffectMaterial(b.effect, darkerColor, b.seed + 50, features.rarity);
  buildingMaterials.push(darkerMat);

  switch (b.style) {
    case 'brutalist':
      geometry = new THREE.BoxGeometry(b.w, b.h, b.d);
      mesh = new THREE.Mesh(geometry, mainMat);
      mesh.position.y = b.h / 2;
      group.add(mesh);
      // Ledges
      const ledgeCount = Math.floor(b.h / 4) + 1;
      for (let i = 1; i < ledgeCount; i++) {
        const ledgeY = (b.h / ledgeCount) * i;
        const ledgeGeo = new THREE.BoxGeometry(b.w + 0.4, 0.3, b.d + 0.4);
        const ledge = new THREE.Mesh(ledgeGeo, darkerMat);
        ledge.position.y = ledgeY;
        group.add(ledge);
      }
      // Rooftop box
      const roofBox = new THREE.BoxGeometry(b.w * 0.3, b.h * 0.1, b.d * 0.3);
      const roofMesh = new THREE.Mesh(roofBox, darkerMat);
      roofMesh.position.set(b.w * 0.2, b.h + b.h * 0.05, b.d * 0.2);
      group.add(roofMesh);
      break;

    case 'deco':
      let currentH = 0, currentW = b.w, currentD = b.d;
      const setbacks = 4;
      for (let i = 0; i < setbacks; i++) {
        const segH = b.h / setbacks;
        const geo = new THREE.BoxGeometry(currentW, segH, currentD);
        const seg = new THREE.Mesh(geo, mainMat);
        seg.position.y = currentH + segH / 2;
        group.add(seg);
        currentH += segH;
        currentW *= 0.78;
        currentD *= 0.78;
      }
      // Spire
      const spireGeo = new THREE.ConeGeometry(currentW * 0.4, b.h * 0.35, 4);
      const spireMat = createEffectMaterial(b.effect, pal.accent, b.seed + 30, features.rarity);
      buildingMaterials.push(spireMat);
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.y = currentH + b.h * 0.175;
      spire.rotation.y = Math.PI / 4;
      group.add(spire);
      break;

    case 'gothic':
      geometry = new THREE.BoxGeometry(b.w, b.h * 0.65, b.d);
      mesh = new THREE.Mesh(geometry, mainMat);
      mesh.position.y = b.h * 0.325;
      group.add(mesh);
      // Pointed roof
      const roofGeo = new THREE.ConeGeometry(Math.max(b.w, b.d) * 0.75, b.h * 0.45, 4);
      const roof = new THREE.Mesh(roofGeo, darkerMat);
      roof.position.y = b.h * 0.65 + b.h * 0.225;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
      // Corner pinnacles
      const pinMat = createEffectMaterial(b.effect, pal.accent, b.seed + 40, features.rarity);
      buildingMaterials.push(pinMat);
      const pinPositions = [[-1,-1], [1,-1], [-1,1], [1,1]];
      for (const [px, pz] of pinPositions) {
        const pinGeo = new THREE.ConeGeometry(0.2, b.h * 0.15, 4);
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.set(px * b.w * 0.4, b.h * 0.65 + b.h * 0.075, pz * b.d * 0.4);
        group.add(pin);
      }
      break;

    case 'modernist':
      geometry = new THREE.BoxGeometry(b.w, b.h, b.d);
      const glassMat = mainMat.clone ? mainMat.clone() : mainMat;
      if (glassMat.transparent !== undefined) {
        glassMat.transparent = true;
        glassMat.opacity = 0.75;
      }
      mesh = new THREE.Mesh(geometry, glassMat);
      mesh.position.y = b.h / 2;
      group.add(mesh);
      // Frame lines
      const edgesGeo = new THREE.EdgesGeometry(geometry);
      const edges = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: darkerColor }));
      edges.position.y = b.h / 2;
      group.add(edges);
      // Antenna
      const antennaGeo = new THREE.CylinderGeometry(0.05, 0.05, b.h * 0.2, 4);
      const antenna = new THREE.Mesh(antennaGeo, new THREE.MeshLambertMaterial({ color: darkerColor }));
      antenna.position.y = b.h + b.h * 0.1;
      group.add(antenna);
      break;

    case 'retro':
      const segments = 6;
      for (let i = 0; i < segments; i++) {
        const t = i / (segments - 1);
        const bulge = 1 + Math.sin(t * Math.PI) * 0.35;
        const segH = b.h / segments;
        const geo = new THREE.CylinderGeometry(b.w * 0.5 * bulge, b.w * 0.5 * bulge, segH, 12);
        const seg = new THREE.Mesh(geo, mainMat);
        seg.position.y = i * segH + segH / 2;
        group.add(seg);
      }
      // Dome
      const domeMat = createEffectMaterial(b.effect, pal.accent, b.seed + 25, features.rarity);
      buildingMaterials.push(domeMat);
      const domeGeo = new THREE.SphereGeometry(b.w * 0.45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.y = b.h;
      group.add(dome);
      break;

    case 'geometric':
      const baseH = b.h * 0.6;
      geometry = new THREE.BoxGeometry(b.w, baseH, b.d);
      mesh = new THREE.Mesh(geometry, mainMat);
      mesh.position.y = baseH / 2;
      group.add(mesh);
      // Pyramid
      const pyrMat = createEffectMaterial(b.effect, pal.accent, b.seed + 35, features.rarity);
      buildingMaterials.push(pyrMat);
      const pyrGeo = new THREE.ConeGeometry(Math.max(b.w, b.d) * 0.75, b.h * 0.5, 4);
      const pyr = new THREE.Mesh(pyrGeo, pyrMat);
      pyr.position.y = baseH + b.h * 0.25;
      pyr.rotation.y = Math.PI / 4;
      group.add(pyr);
      break;

    case 'organic':
    default:
      const twistSegs = 8;
      for (let i = 0; i < twistSegs; i++) {
        const t = i / twistSegs;
        const segH = b.h / twistSegs;
        const twist = Math.sin(t * Math.PI * 2) * 0.6;
        const wobble = 1 + Math.sin(t * Math.PI) * 0.15;
        const geo = new THREE.BoxGeometry(b.w * wobble, segH, b.d * wobble);
        const seg = new THREE.Mesh(geo, mainMat);
        seg.position.y = i * segH + segH / 2;
        seg.position.x = twist;
        seg.rotation.y = t * 0.6;
        group.add(seg);
      }
      // Blob top
      const blobMat = createEffectMaterial(b.effect, pal.accent, b.seed + 45, features.rarity);
      buildingMaterials.push(blobMat);
      const blobGeo = new THREE.SphereGeometry(b.w * 0.4, 8, 6);
      const blob = new THREE.Mesh(blobGeo, blobMat);
      blob.position.y = b.h + b.w * 0.2;
      blob.scale.y = 0.6;
      group.add(blob);
      break;
  }
}

function addMeltEffect(group, b, material, intensity) {
  const dripCount = Math.floor(intensity * 8) + 2;
  for (let i = 0; i < dripCount; i++) {
    const dripX = (rnd() - 0.5) * b.w;
    const dripZ = (rnd() - 0.5) * b.d;
    const dripH = rnd(0.5, 2) * intensity;
    const dripR = rnd(0.1, 0.3);

    const dripGeo = new THREE.CylinderGeometry(dripR * 0.5, dripR, dripH, 6);
    const drip = new THREE.Mesh(dripGeo, material);
    drip.position.set(dripX, -dripH / 2, dripZ);
    group.add(drip);
  }

  // Drips on sides
  for (let i = 0; i < dripCount / 2; i++) {
    const side = rndInt(0, 3);
    const dripH = rnd(1, 4) * intensity;
    const dripR = rnd(0.15, 0.35);
    const dripGeo = new THREE.CylinderGeometry(dripR * 0.3, dripR, dripH, 6);
    const drip = new THREE.Mesh(dripGeo, material);

    const posY = b.h - dripH / 2 - rnd(0, b.h * 0.3);
    if (side === 0) drip.position.set(b.w/2 + dripR/2, posY, (rnd() - 0.5) * b.d);
    else if (side === 1) drip.position.set(-b.w/2 - dripR/2, posY, (rnd() - 0.5) * b.d);
    else if (side === 2) drip.position.set((rnd() - 0.5) * b.w, posY, b.d/2 + dripR/2);
    else drip.position.set((rnd() - 0.5) * b.w, posY, -b.d/2 - dripR/2);

    group.add(drip);
  }
}

function addFragments(group, b, material, count) {
  for (let i = 0; i < count; i++) {
    const fragW = rnd(0.3, 1);
    const fragH = rnd(0.3, 1.5);
    const fragD = rnd(0.3, 1);
    const fragGeo = new THREE.BoxGeometry(fragW, fragH, fragD);
    const frag = new THREE.Mesh(fragGeo, material);

    frag.position.set(
      (rnd() - 0.5) * b.w * 2,
      b.h * rnd(0.3, 1.2),
      (rnd() - 0.5) * b.d * 2
    );
    frag.rotation.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);
    group.add(frag);
  }
}

// =============================================================================
// WINDOWS
// =============================================================================

function addWindows(group, b, pal) {
  if (b.style === 'retro' || b.style === 'organic') return;

  const isNight = features.timeOfDay === 'night';
  const windowColor = isNight ? pal.accent : pal.window;
  const litColor = pal.windowLit;

  const winW = 0.35;
  const winH = 0.55;
  const spacingH = 1.8;
  const spacingW = 1.2;
  const margin = 0.4;

  const rows = Math.max(1, Math.floor((b.h - margin * 2) / spacingH));
  const colsW = Math.max(1, Math.floor((b.w - margin * 2) / spacingW));
  const colsD = Math.max(1, Math.floor((b.d - margin * 2) / spacingW));

  const createWindow = (x, y, z, rotY) => {
    const isLit = isNight ? rndBool(0.7) : rndBool(0.15);
    const winMat = new THREE.MeshBasicMaterial({
      color: isLit ? litColor : windowColor,
      transparent: !isLit,
      opacity: isLit ? 1 : 0.8
    });
    const winGeo = new THREE.PlaneGeometry(winW, winH);
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(x, y, z);
    win.rotation.y = rotY;
    return win;
  };

  const startY = margin + winH / 2;
  const endY = b.h - margin;

  // All 4 faces
  for (let row = 0; row < rows; row++) {
    const y = startY + row * spacingH;
    if (y > endY) break;

    // Front
    for (let col = 0; col < colsW; col++) {
      if (rndBool(0.15)) continue;
      const x = -b.w/2 + margin + col * spacingW + spacingW/2;
      if (Math.abs(x) > b.w/2 - margin) continue;
      group.add(createWindow(x, y, b.d/2 + 0.01, 0));
    }

    // Back
    for (let col = 0; col < colsW; col++) {
      if (rndBool(0.15)) continue;
      const x = -b.w/2 + margin + col * spacingW + spacingW/2;
      if (Math.abs(x) > b.w/2 - margin) continue;
      group.add(createWindow(x, y, -b.d/2 - 0.01, Math.PI));
    }

    // Right
    for (let col = 0; col < colsD; col++) {
      if (rndBool(0.15)) continue;
      const z = -b.d/2 + margin + col * spacingW + spacingW/2;
      if (Math.abs(z) > b.d/2 - margin) continue;
      group.add(createWindow(b.w/2 + 0.01, y, z, Math.PI/2));
    }

    // Left
    for (let col = 0; col < colsD; col++) {
      if (rndBool(0.15)) continue;
      const z = -b.d/2 + margin + col * spacingW + spacingW/2;
      if (Math.abs(z) > b.d/2 - margin) continue;
      group.add(createWindow(-b.w/2 - 0.01, y, z, -Math.PI/2));
    }
  }
}

// =============================================================================
// PARKS & WATER
// =============================================================================

function buildPark(block, pal) {
  const grassGeo = new THREE.BoxGeometry(BLOCK_SIZE, 0.2, BLOCK_SIZE);
  const grassMat = new THREE.MeshLambertMaterial({ color: pal.grass });
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.position.set(block.x + BLOCK_SIZE/2, 0.1, block.z + BLOCK_SIZE/2);
  cityGroup.add(grass);

  const treeCount = rndInt(4, 10);
  for (let i = 0; i < treeCount; i++) {
    const tx = block.x + rnd(1, BLOCK_SIZE - 1);
    const tz = block.z + rnd(1, BLOCK_SIZE - 1);
    const treeH = rnd(1.5, 3);

    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, treeH * 0.4, 6);
    const trunk = new THREE.Mesh(trunkGeo, new THREE.MeshLambertMaterial({ color: 0x4a3a2a }));
    trunk.position.set(tx, treeH * 0.2, tz);
    cityGroup.add(trunk);

    const foliageGeo = new THREE.SphereGeometry(rnd(0.6, 1.0), 8, 6);
    const foliage = new THREE.Mesh(foliageGeo, new THREE.MeshLambertMaterial({ color: 0x2d5a2d }));
    foliage.position.set(tx, treeH * 0.5 + rnd(0.3, 0.6), tz);
    foliage.scale.y = rnd(0.8, 1.2);
    cityGroup.add(foliage);
  }
}

function buildWater(block, pal) {
  const waterGeo = new THREE.BoxGeometry(BLOCK_SIZE, 0.4, BLOCK_SIZE);
  const waterMat = new THREE.MeshLambertMaterial({
    color: pal.water,
    transparent: true,
    opacity: 0.6
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.set(block.x + BLOCK_SIZE/2, -0.15, block.z + BLOCK_SIZE/2);
  cityGroup.add(water);
}

// =============================================================================
// ANIMATION
// =============================================================================

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  controls.update();

  // Update shader uniforms for animated effects
  for (const mat of buildingMaterials) {
    if (mat.uniforms && mat.uniforms.time) {
      mat.uniforms.time.value = time;
    }
  }

  renderer.render(scene, camera);
}

// =============================================================================
// CONTROLS
// =============================================================================

function onKeyDown(e) {
  if (e.key === 's' || e.key === 'S') {
    renderer.render(scene, camera);
    const link = document.createElement('a');
    link.download = 'corrupted-harmony-' + hash.slice(2, 10) + '.png';
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
  }
  if (e.key === 'r' || e.key === 'R') {
    hash = "0x" + Array(64).fill(0).map(() =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    generateFeatures();
    buildCity();
    if (typeof updateFeaturesDisplay === 'function') updateFeaturesDisplay();
  }
  if (e.key === ' ') {
    controls.autoRotate = !controls.autoRotate;
  }
}

// =============================================================================
// API
// =============================================================================

window.sketchAPI = {
  getFeatures: () => features,
  getHash: () => hash,
  regenerate: () => {
    hash = "0x" + Array(64).fill(0).map(() =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    generateFeatures();
    buildCity();
  }
};

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
