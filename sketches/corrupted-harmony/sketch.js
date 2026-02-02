/**
 * CORRUPTED HARMONY v4.2.0
 * 3D isometric city with per-building shader effects + parametric design
 * Three.js rendering with dither/glitch/corrupt/liquify/stencil effects
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
const BLOCK_SIZE = 12;
const ROAD_WIDTH = 2;
const BUILDING_MARGIN = 0.3; // Gap between buildings and plot edges

const ARCH_STYLES = ['brutalist', 'deco', 'modernist', 'gothic', 'retro', 'geometric', 'organic', 'parametric', 'twisted', 'voronoi'];
const EFFECT_TYPES = ['clean', 'dither', 'glitch', 'corrupt', 'liquify', 'stencil'];

const PALETTES = {
  muted: {
    bg: 0x3a3a42, ground: 0x2d2d35, road: 0x1f1f25,
    building: [0x4a4a52, 0x5a5a62, 0x6a6a72, 0x7a7a82, 0x8a8a92],
    accent: 0x9a9aa2, grass: 0x3d4a3d, water: 0x2a3a4a,
    window: 0x2d2d2d, windowLit: 0xd4d4d4, sky: [0x4a4a52, 0x3a3a42]
  },
  cyber: {
    bg: 0x0d0d1a, ground: 0x0a0a12, road: 0x050508,
    building: [0x1a1a2e, 0x252540, 0x303052, 0x404065, 0x505078],
    accent: 0x00ffaa, grass: 0x0a1a15, water: 0x0a1525,
    window: 0x0a0a1a, windowLit: 0x00ffaa, sky: [0x0d0d1a, 0x1a1a3e]
  },
  cool: {
    bg: 0x2a3a4a, ground: 0x1a2a3a, road: 0x0a1a2a,
    building: [0x3a4a5a, 0x4a5a6a, 0x5a6a7a, 0x6a7a8a, 0x7a8a9a],
    accent: 0x8aaacc, grass: 0x2a4a4a, water: 0x1a3a5a,
    window: 0x1a2a3a, windowLit: 0x9aabba, sky: [0x4a6a8a, 0x2a3a4a]
  },
  warm: {
    bg: 0x4a3a2a, ground: 0x3a2a1a, road: 0x2a1a0a,
    building: [0x5a4a3a, 0x6a5a4a, 0x7a6a5a, 0x8a7a6a, 0x9a8a7a],
    accent: 0xccaa88, grass: 0x4a4a2a, water: 0x3a4a4a,
    window: 0x3a2a1a, windowLit: 0xbaa090, sky: [0x8a6a4a, 0x4a3a2a]
  },
  twilight: {
    bg: 0x2a2a4e, ground: 0x1a1a3e, road: 0x0a0a2e,
    building: [0x3a3a5e, 0x4a4a6e, 0x5a5a7e, 0x6a6a8e, 0x8a8aae],
    accent: 0xaa8acc, grass: 0x2a3a4a, water: 0x1a2a5a,
    window: 0x1a1a2e, windowLit: 0xbabace, sky: [0x5a3a6e, 0x2a2a4e]
  },
  fog: {
    bg: 0xc8c8c8, ground: 0xa0a0a0, road: 0x707070,
    building: [0x909090, 0xa0a0a0, 0xb0b0b0, 0xc0c0c0, 0xd0d0d0],
    accent: 0xe8e8e8, grass: 0x8a9a8a, water: 0x7a8a9a,
    window: 0x505050, windowLit: 0xf0f0f0, sky: [0xe8e8e8, 0xc8c8c8]
  },
  neonBleed: {
    bg: 0x0a0a1a, ground: 0x050510, road: 0x020208,
    building: [0x1a0a2a, 0x2a1a3a, 0x0a1a2a, 0x1a1a3a, 0x2a2a4a],
    accent: 0xff2a6d, grass: 0x0a2a1a, water: 0x0a1a3a,
    window: 0x0a0a0a, windowLit: 0xff2a6d, sky: [0x1a0a2a, 0x0a0a1a]
  },
  inverted: {
    bg: 0xf0f0f0, ground: 0xd0d0d0, road: 0xa0a0a0,
    building: [0xe0e0e0, 0xc0c0c0, 0xa0a0a0, 0x808080, 0x606060],
    accent: 0x303030, grass: 0xc0d0c0, water: 0xb0c0d0,
    window: 0xf0f0f0, windowLit: 0x202020, sky: [0xf0f0f0, 0xd0d0d0]
  }
};

// =============================================================================
// FEATURE GENERATION
// =============================================================================

function generateFeatures() {
  R = initRandom(hash);

  const rarity = rollRarity();
  let paletteKey = rarity === 'legendary' ? rndChoice(['neonBleed', 'inverted']) :
                   rarity === 'rare' ? rndChoice(['twilight', 'cool', 'cyber']) :
                   rarity === 'uncommon' ? rndChoice(['cyber', 'cool', 'fog']) :
                   rndChoice(['muted', 'fog', 'warm']);

  const weirdnessLevel = rarity === 'legendary' ? 'reality-collapse' :
                         rarity === 'rare' ? 'chaotic' :
                         rarity === 'uncommon' ? 'moderate' : 'subtle';

  const dominantEffect = rarity === 'legendary' ? rndChoice(['corrupt', 'liquify', 'glitch']) :
                         rarity === 'rare' ? rndChoice(['glitch', 'dither', 'liquify']) :
                         rarity === 'uncommon' ? rndChoice(['dither', 'stencil']) :
                         rndChoice(['clean', 'dither']);

  const density = rndChoice(['sparse', 'normal', 'dense', 'packed']);
  const hasRiver = rndBool(0.2);
  const timeOfDay = rndChoice(['day', 'dusk', 'night', 'dawn']);
  const skyMood = rndChoice(['gradient', 'flat', 'textured', 'void']);
  const groundStyle = rndChoice(['solid', 'reflection', 'fade']);
  const special = rarity === 'legendary' ? 'the-anomaly' :
                  rarity === 'rare' ? rndChoice(['portal', 'floating-chunk']) :
                  rarity === 'uncommon' ? rndChoice(['time-echo', 'none']) : 'none';

  features = {
    rarity, palette: paletteKey, weirdnessLevel, dominantEffect,
    density, hasRiver, timeOfDay, skyMood, groundStyle, special,
    seed: hash.slice(0, 10)
  };

  return features;
}

// =============================================================================
// PER-BUILDING SHADER EFFECTS
// =============================================================================

function createDitherMaterial(baseColor, intensity = 0.6) {
  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(baseColor) },
      intensity: { value: intensity }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform float intensity;
      varying vec3 vNormal;

      float bayer(vec2 coord) {
        vec2 c = floor(mod(coord, 4.0));
        int i = int(c.x) + int(c.y) * 4;
        float m[16];
        m[0]=0.0; m[1]=8.0; m[2]=2.0; m[3]=10.0;
        m[4]=12.0; m[5]=4.0; m[6]=14.0; m[7]=6.0;
        m[8]=3.0; m[9]=11.0; m[10]=1.0; m[11]=9.0;
        m[12]=15.0; m[13]=7.0; m[14]=13.0; m[15]=5.0;
        for(int j=0; j<16; j++) { if(j==i) return m[j] / 16.0; }
        return 0.0;
      }

      void main() {
        vec3 light = normalize(vec3(1.0, 1.0, 0.5));
        float diff = max(dot(vNormal, light), 0.3);
        vec3 color = baseColor * diff;
        float threshold = bayer(gl_FragCoord.xy);
        float lum = dot(color, vec3(0.299, 0.587, 0.114));
        vec3 dithered = vec3(step(threshold * intensity, lum));
        gl_FragColor = vec4(mix(color, dithered * baseColor * 1.3, intensity * 0.6), 1.0);
      }
    `
  });
}

function createGlitchMaterial(baseColor, intensity = 0.5, seed = 0.0) {
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
      varying vec3 vPos;

      float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPos = position;
        vec3 pos = position;
        float glitchY = floor(pos.y * 3.0 + seed);
        if (rand(vec2(glitchY, seed + floor(time * 2.0))) > 0.93) {
          pos.x += (rand(vec2(glitchY + 1.0, seed)) - 0.5) * intensity * 1.5;
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
      varying vec3 vPos;

      float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec3 light = normalize(vec3(1.0, 1.0, 0.5));
        float diff = max(dot(vNormal, light), 0.3);
        vec3 color = baseColor * diff;

        float shift = intensity * 0.12;
        float r = color.r * (1.0 + shift * sin(vPos.y * 8.0 + seed));
        float b = color.b * (1.0 - shift * sin(vPos.y * 8.0 + seed + 1.0));
        float scanline = sin(gl_FragCoord.y * 2.0) * 0.04 * intensity;

        vec2 block = floor(gl_FragCoord.xy / 6.0);
        if (rand(block + seed + floor(time)) > 0.97) {
          r = 1.0 - r; color.g = 1.0 - color.g; b = 1.0 - b;
        }
        gl_FragColor = vec4(r - scanline, color.g - scanline, b - scanline, 1.0);
      }
    `
  });
}

function createCorruptMaterial(baseColor, intensity = 0.5, seed = 0.0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(baseColor) },
      intensity: { value: intensity },
      seed: { value: seed }
    },
    vertexShader: `
      uniform float intensity;
      uniform float seed;
      varying vec3 vNormal;

      float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec3 pos = position;
        float blockY = floor(pos.y * 2.0 + seed);
        if (rand(vec2(blockY, seed)) > 0.88) {
          pos.xz += (vec2(rand(vec2(blockY, seed + 1.0)), rand(vec2(blockY, seed + 2.0))) - 0.5) * intensity * 0.4;
        }
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform float intensity;
      uniform float seed;
      varying vec3 vNormal;

      float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec3 light = normalize(vec3(1.0, 1.0, 0.5));
        float diff = max(dot(vNormal, light), 0.3);
        vec3 color = baseColor * diff;

        vec2 block = floor(gl_FragCoord.xy / 6.0);
        float blockRnd = rand(block + seed);
        if (blockRnd > 1.0 - intensity * 0.35) {
          float mode = floor(rand(block + seed + 1.0) * 4.0);
          if (mode < 1.0) color.r = fract(color.r + 0.5);
          else if (mode < 2.0) color = 1.0 - color;
          else if (mode < 3.0) color = vec3(step(0.5, rand(block + seed + 2.0)));
          else color = color.bgr;
        }
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

function createLiquifyMaterial(baseColor, intensity = 0.5, seed = 0.0) {
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
      varying float vDrip;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec3 pos = position;
        float wave = sin(pos.y * 2.0 + seed * 10.0 + time * 0.5) * intensity * 0.25;
        pos.x += wave;
        pos.z += cos(pos.y * 1.5 + seed * 10.0) * intensity * 0.15;
        vDrip = 0.0;
        if (pos.y < 1.0) {
          vDrip = (1.0 - pos.y) * intensity * 0.4;
          pos.y -= vDrip * abs(sin(pos.x * 3.0 + seed));
        }
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform float intensity;
      varying vec3 vNormal;
      varying float vDrip;

      void main() {
        vec3 light = normalize(vec3(1.0, 1.0, 0.5));
        float diff = max(dot(vNormal, light), 0.3);
        vec3 color = baseColor * diff;
        color = mix(color, color * 0.75, vDrip);
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

function createStencilMaterial(baseColor, levels = 4) {
  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(baseColor) },
      levels: { value: levels }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform float levels;
      varying vec3 vNormal;

      void main() {
        vec3 light = normalize(vec3(1.0, 1.0, 0.5));
        float diff = max(dot(vNormal, light), 0.3);
        vec3 color = baseColor * diff;
        float step = 1.0 / (levels - 1.0);
        color = floor(color / step + 0.5) * step;
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

function createEffectMaterial(effect, baseColor, seed, rarity) {
  const intensity = rarity === 'legendary' ? 0.8 :
                    rarity === 'rare' ? 0.6 :
                    rarity === 'uncommon' ? 0.4 : 0.25;

  switch (effect) {
    case 'dither': return createDitherMaterial(baseColor, intensity);
    case 'glitch': return createGlitchMaterial(baseColor, intensity, seed);
    case 'corrupt': return createCorruptMaterial(baseColor, intensity, seed);
    case 'liquify': return createLiquifyMaterial(baseColor, intensity, seed);
    case 'stencil': return createStencilMaterial(baseColor, rndInt(3, 5));
    default: return new THREE.MeshLambertMaterial({ color: baseColor });
  }
}

// =============================================================================
// THREE.JS SETUP
// =============================================================================

let scene, camera, renderer, controls;
let cityGroup;
let clock;
let shaderMaterials = [];

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
  renderer.setPixelRatio(1);
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;
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

  shaderMaterials = [];
  cityGroup = new THREE.Group();

  // Sky gradient background
  scene.background = new THREE.Color(pal.bg);

  // Ground
  const groundSize = GRID_SIZE * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH;
  const groundGeo = new THREE.BoxGeometry(groundSize, 0.5, groundSize);
  const groundMat = new THREE.MeshLambertMaterial({ color: pal.ground });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.set(groundSize/2, -0.25, groundSize/2);
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

  cityGroup.position.set(-groundSize/2, 0, -groundSize/2);
  scene.add(cityGroup);
}

function buildRoads(pal, groundSize) {
  const roadMat = new THREE.MeshLambertMaterial({ color: pal.road });
  const markingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Horizontal roads (running in x direction)
  for (let i = 0; i <= GRID_SIZE; i++) {
    const z = i * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH/2;
    const roadGeo = new THREE.BoxGeometry(groundSize, 0.1, ROAD_WIDTH);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(groundSize/2, 0.05, z);
    cityGroup.add(road);

    // Road markings (dashed center line)
    for (let mx = 0; mx < groundSize; mx += 3) {
      const markGeo = new THREE.BoxGeometry(1.5, 0.02, 0.1);
      const mark = new THREE.Mesh(markGeo, markingMat);
      mark.position.set(mx, 0.12, z);
      cityGroup.add(mark);
    }
  }

  // Vertical roads (running in z direction)
  for (let i = 0; i <= GRID_SIZE; i++) {
    const x = i * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH/2;
    const roadGeo = new THREE.BoxGeometry(ROAD_WIDTH, 0.1, groundSize);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(x, 0.05, groundSize/2);
    cityGroup.add(road);

    // Road markings
    for (let mz = 0; mz < groundSize; mz += 3) {
      const markGeo = new THREE.BoxGeometry(0.1, 0.02, 1.5);
      const mark = new THREE.Mesh(markGeo, markingMat);
      mark.position.set(x, 0.12, mz);
      cityGroup.add(mark);
    }
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
      } else if (rndBool(0.15)) {
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
          const height = rnd(4, 22);
          const weirdness = generateWeirdness();
          const seed = rnd(0, 1000);

          // Building fits within plot with margin on all sides
          const bw = Math.max(1, sub.w - BUILDING_MARGIN * 2);
          const bd = Math.max(1, sub.d - BUILDING_MARGIN * 2);

          // Assign effect: 60% dominant, 40% random
          const effect = rndBool(0.6) ? features.dominantEffect : rndChoice(EFFECT_TYPES);

          block.buildings.push({
            x: blockX + sub.x + sub.w / 2,
            z: blockZ + sub.z + sub.d / 2,
            w: bw,
            d: bd,
            h: height,
            style,
            effect,
            weirdness,
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

function generateWeirdness() {
  const weirdness = [];
  const level = features.weirdnessLevel;
  const chance = level === 'reality-collapse' ? 0.85 :
                 level === 'chaotic' ? 0.6 :
                 level === 'moderate' ? 0.35 : 0.12;

  if (rndBool(chance * 0.7)) {
    weirdness.push({ type: 'float', offset: rnd(0.5, 4) });
  }

  if (rndBool(chance * 0.55)) {
    weirdness.push({
      type: 'tilt',
      x: rnd(-0.2, 0.2),
      z: rnd(-0.2, 0.2)
    });
  }

  if (rndBool(chance * 0.45)) {
    weirdness.push({
      type: 'scale',
      x: rnd(0.65, 1.5),
      y: rnd(0.75, 1.4),
      z: rnd(0.65, 1.5)
    });
  }

  if (rndBool(chance * 0.35)) {
    weirdness.push({ type: 'melt', intensity: rnd(0.3, 1.0) });
  }

  if (rndBool(chance * 0.3)) {
    weirdness.push({
      type: 'echo',
      offset: { x: rnd(-2.5, 2.5), y: rnd(0, 4), z: rnd(-2.5, 2.5) },
      opacity: rnd(0.15, 0.45)
    });
  }

  if (rndBool(chance * 0.25)) {
    weirdness.push({ type: 'fragment', count: rndInt(2, 6) });
  }

  if (level === 'reality-collapse' && rndBool(0.2)) {
    weirdness.push({ type: 'invert' });
  }

  return weirdness;
}

// =============================================================================
// BUILDING CONSTRUCTION
// =============================================================================

function buildBuilding(b, pal) {
  const group = new THREE.Group();

  const colorIndex = rndInt(0, 4);
  const mainColor = pal.building[colorIndex];
  const darkerColor = pal.building[Math.max(0, colorIndex - 1)];

  // Use effect material for this building
  const mainMat = createEffectMaterial(b.effect, mainColor, b.seed, features.rarity);
  const darkerMat = createEffectMaterial(b.effect, darkerColor, b.seed + 10, features.rarity);
  const accentMat = createEffectMaterial(b.effect, pal.accent, b.seed + 20, features.rarity);

  // Track shader materials for time updates
  if (mainMat.uniforms) shaderMaterials.push(mainMat);
  if (darkerMat.uniforms) shaderMaterials.push(darkerMat);
  if (accentMat.uniforms) shaderMaterials.push(accentMat);

  // Check for echo weirdness first
  for (const w of b.weirdness) {
    if (w.type === 'echo') {
      const ghostGroup = new THREE.Group();
      const ghostMat = new THREE.MeshLambertMaterial({
        color: mainColor,
        transparent: true,
        opacity: w.opacity
      });
      buildBuildingGeometry(ghostGroup, b, ghostMat, ghostMat, ghostMat, pal);
      ghostGroup.position.set(w.offset.x, w.offset.y, w.offset.z);
      group.add(ghostGroup);
    }
  }

  // Main building
  buildBuildingGeometry(group, b, mainMat, darkerMat, accentMat, pal);

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
      addFragments(group, b, mainMat, w.count);
    }
    if (w.type === 'melt') {
      addMeltEffect(group, b, mainMat, w.intensity);
    }
  }

  // Add windows
  addWindows(group, b, pal);

  group.position.set(b.x, yOffset, b.z);
  cityGroup.add(group);
}

function buildBuildingGeometry(group, b, mainMat, darkerMat, accentMat, pal) {
  let geometry, mesh;

  switch (b.style) {
    case 'brutalist':
      geometry = new THREE.BoxGeometry(b.w, b.h, b.d);
      mesh = new THREE.Mesh(geometry, mainMat);
      mesh.position.y = b.h / 2;
      group.add(mesh);
      // Concrete ledges at intervals
      const ledgeCount = Math.floor(b.h / 3.5) + 1;
      for (let i = 1; i < ledgeCount; i++) {
        const ledgeY = (b.h / ledgeCount) * i;
        const ledgeGeo = new THREE.BoxGeometry(b.w + 0.5, 0.35, b.d + 0.5);
        const ledge = new THREE.Mesh(ledgeGeo, darkerMat);
        ledge.position.y = ledgeY;
        group.add(ledge);
      }
      // Rooftop mechanical box
      const roofBox = new THREE.BoxGeometry(b.w * 0.35, b.h * 0.12, b.d * 0.35);
      const roofMesh = new THREE.Mesh(roofBox, darkerMat);
      roofMesh.position.set(b.w * 0.15, b.h + b.h * 0.06, b.d * 0.15);
      group.add(roofMesh);
      break;

    case 'deco':
      // Art Deco setbacks with ornate spire
      let currentH = 0, currentW = b.w, currentD = b.d;
      const setbacks = 4;
      for (let i = 0; i < setbacks; i++) {
        const segH = b.h / setbacks;
        const geo = new THREE.BoxGeometry(currentW, segH, currentD);
        const seg = new THREE.Mesh(geo, mainMat);
        seg.position.y = currentH + segH / 2;
        group.add(seg);

        // Decorative trim at each setback
        if (i < setbacks - 1) {
          const trimGeo = new THREE.BoxGeometry(currentW + 0.2, 0.2, currentD + 0.2);
          const trim = new THREE.Mesh(trimGeo, accentMat);
          trim.position.y = currentH + segH;
          group.add(trim);
        }

        currentH += segH;
        currentW *= 0.75;
        currentD *= 0.75;
      }
      // Ornate spire
      const spireGeo = new THREE.ConeGeometry(currentW * 0.35, b.h * 0.4, 4);
      const spire = new THREE.Mesh(spireGeo, accentMat);
      spire.position.y = currentH + b.h * 0.2;
      spire.rotation.y = Math.PI / 4;
      group.add(spire);
      // Antenna tip
      const tipGeo = new THREE.CylinderGeometry(0.03, 0.05, b.h * 0.08, 4);
      const tip = new THREE.Mesh(tipGeo, darkerMat);
      tip.position.y = currentH + b.h * 0.4 + b.h * 0.04;
      group.add(tip);
      break;

    case 'gothic':
      geometry = new THREE.BoxGeometry(b.w, b.h * 0.6, b.d);
      mesh = new THREE.Mesh(geometry, mainMat);
      mesh.position.y = b.h * 0.3;
      group.add(mesh);
      // Pointed roof
      const roofGeo = new THREE.ConeGeometry(Math.max(b.w, b.d) * 0.8, b.h * 0.5, 4);
      const roof = new THREE.Mesh(roofGeo, darkerMat);
      roof.position.y = b.h * 0.6 + b.h * 0.25;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
      // Corner pinnacles
      const pinPositions = [[-1,-1], [1,-1], [-1,1], [1,1]];
      for (const [px, pz] of pinPositions) {
        const pinGeo = new THREE.ConeGeometry(0.25, b.h * 0.18, 4);
        const pin = new THREE.Mesh(pinGeo, accentMat);
        pin.position.set(px * b.w * 0.42, b.h * 0.6 + b.h * 0.09, pz * b.d * 0.42);
        group.add(pin);
      }
      break;

    case 'modernist':
      geometry = new THREE.BoxGeometry(b.w, b.h, b.d);
      const glassMat = new THREE.MeshLambertMaterial({
        color: pal.building[4],
        transparent: true,
        opacity: 0.7
      });
      mesh = new THREE.Mesh(geometry, glassMat);
      mesh.position.y = b.h / 2;
      group.add(mesh);
      // Frame lines
      const edgesGeo = new THREE.EdgesGeometry(geometry);
      const edges = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: darkerMat.color }));
      edges.position.y = b.h / 2;
      group.add(edges);
      // Horizontal mullions
      for (let my = 2; my < b.h; my += 2) {
        const mullionGeo = new THREE.BoxGeometry(b.w + 0.05, 0.08, b.d + 0.05);
        const mullion = new THREE.Mesh(mullionGeo, darkerMat);
        mullion.position.y = my;
        group.add(mullion);
      }
      // Antenna
      const antennaGeo = new THREE.CylinderGeometry(0.04, 0.06, b.h * 0.25, 4);
      const antenna = new THREE.Mesh(antennaGeo, darkerMat);
      antenna.position.y = b.h + b.h * 0.125;
      group.add(antenna);
      break;

    case 'retro':
      // Retro-futurist bulging tower
      const segments = 7;
      for (let i = 0; i < segments; i++) {
        const t = i / (segments - 1);
        const bulge = 1 + Math.sin(t * Math.PI) * 0.4;
        const segH = b.h / segments;
        const geo = new THREE.CylinderGeometry(b.w * 0.5 * bulge, b.w * 0.5 * bulge, segH, 12);
        const seg = new THREE.Mesh(geo, mainMat);
        seg.position.y = i * segH + segH / 2;
        group.add(seg);
      }
      // Layered dome
      for (let d = 0; d < 3; d++) {
        const domeScale = 1 - d * 0.25;
        const domeGeo = new THREE.SphereGeometry(b.w * 0.4 * domeScale, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeo, d === 0 ? mainMat : accentMat);
        dome.position.y = b.h + d * 0.3;
        group.add(dome);
      }
      break;

    case 'geometric':
      // Pure geometric forms
      const baseH = b.h * 0.55;
      geometry = new THREE.BoxGeometry(b.w, baseH, b.d);
      mesh = new THREE.Mesh(geometry, mainMat);
      mesh.position.y = baseH / 2;
      group.add(mesh);
      // Pyramid or crystal top
      if (rndBool(0.5)) {
        const pyrGeo = new THREE.ConeGeometry(Math.max(b.w, b.d) * 0.8, b.h * 0.55, 4);
        const pyr = new THREE.Mesh(pyrGeo, accentMat);
        pyr.position.y = baseH + b.h * 0.275;
        pyr.rotation.y = Math.PI / 4;
        group.add(pyr);
      } else {
        // Crystal cluster
        for (let c = 0; c < 3; c++) {
          const crystalGeo = new THREE.ConeGeometry(b.w * 0.2, b.h * (0.3 + rnd(0, 0.25)), 5);
          const crystal = new THREE.Mesh(crystalGeo, accentMat);
          crystal.position.set((rnd() - 0.5) * b.w * 0.5, baseH + b.h * 0.15, (rnd() - 0.5) * b.d * 0.5);
          crystal.rotation.set(rnd(-0.2, 0.2), rnd(0, Math.PI), rnd(-0.2, 0.2));
          group.add(crystal);
        }
      }
      break;

    case 'organic':
      // Twisted bio-form tower
      const twistSegs = 9;
      for (let i = 0; i < twistSegs; i++) {
        const t = i / twistSegs;
        const segH = b.h / twistSegs;
        const twist = Math.sin(t * Math.PI * 2.5) * 0.7;
        const wobble = 1 + Math.sin(t * Math.PI) * 0.2;
        const geo = new THREE.BoxGeometry(b.w * wobble, segH, b.d * wobble);
        const seg = new THREE.Mesh(geo, mainMat);
        seg.position.y = i * segH + segH / 2;
        seg.position.x = twist;
        seg.rotation.y = t * 0.7;
        group.add(seg);
      }
      // Blob top
      const blobGeo = new THREE.SphereGeometry(b.w * 0.45, 8, 6);
      const blob = new THREE.Mesh(blobGeo, accentMat);
      blob.position.y = b.h + b.w * 0.25;
      blob.scale.set(1, 0.65, 1);
      group.add(blob);
      break;

    case 'parametric':
      // Grasshopper-style parametric tower with attractor-influenced floor plates
      const paramFloors = Math.floor(b.h / 1.2);
      const attractorX = (rnd() - 0.5) * b.w * 3;
      const attractorZ = (rnd() - 0.5) * b.d * 3;
      const attractorY = rnd(0.3, 0.7) * b.h;

      for (let i = 0; i < paramFloors; i++) {
        const t = i / (paramFloors - 1);
        const floorY = t * b.h;
        const floorH = b.h / paramFloors * 0.92;

        // Distance-based deformation from attractor point
        const distY = Math.abs(floorY - attractorY);
        const influence = Math.max(0, 1 - distY / (b.h * 0.5));
        const offsetX = attractorX * influence * 0.15;
        const offsetZ = attractorZ * influence * 0.15;

        // Lofted profile: interpolate between different shapes
        const shapeProgress = Math.sin(t * Math.PI);
        const cornerRadius = shapeProgress * b.w * 0.2;
        const scaleX = 1 + Math.sin(t * Math.PI * 2) * 0.15;
        const scaleZ = 1 + Math.cos(t * Math.PI * 2) * 0.15;

        const floorGeo = new THREE.BoxGeometry(b.w * scaleX, floorH, b.d * scaleZ);
        const floor = new THREE.Mesh(floorGeo, mainMat);
        floor.position.set(offsetX, floorY + floorH / 2, offsetZ);
        floor.rotation.y = t * 0.3 + cornerRadius * 0.1;
        group.add(floor);

        // Parametric panel dividers on facade
        if (i > 0 && i < paramFloors - 1) {
          const panelCount = 4 + Math.floor(shapeProgress * 4);
          for (let p = 0; p < panelCount; p++) {
            const angle = (p / panelCount) * Math.PI * 2;
            const panelGeo = new THREE.BoxGeometry(0.08, floorH * 0.9, 0.08);
            const panel = new THREE.Mesh(panelGeo, darkerMat);
            panel.position.set(
              offsetX + Math.cos(angle) * b.w * scaleX * 0.48,
              floorY + floorH / 2,
              offsetZ + Math.sin(angle) * b.d * scaleZ * 0.48
            );
            group.add(panel);
          }
        }
      }

      // Parametric canopy
      const canopyGeo = new THREE.BoxGeometry(b.w * 1.3, 0.15, b.d * 1.3);
      const canopy = new THREE.Mesh(canopyGeo, accentMat);
      canopy.position.y = b.h + 0.5;
      canopy.rotation.y = Math.PI / 6;
      group.add(canopy);
      break;

    case 'twisted':
      // Turning Torso style - floors rotate progressively
      const twistedFloors = Math.floor(b.h / 1.5);
      const totalTwist = rnd(0.5, 1.5) * Math.PI; // 90-270 degrees total rotation

      for (let i = 0; i < twistedFloors; i++) {
        const t = i / (twistedFloors - 1);
        const floorY = t * b.h;
        const floorH = b.h / twistedFloors * 0.85;
        const rotation = t * totalTwist;

        // Floor plate with tapering
        const taper = 1 - t * 0.2;
        const floorGeo = new THREE.BoxGeometry(b.w * taper, floorH, b.d * taper);
        const floor = new THREE.Mesh(floorGeo, mainMat);
        floor.position.y = floorY + floorH / 2;
        floor.rotation.y = rotation;
        group.add(floor);

        // Structural core
        if (i % 3 === 0) {
          const coreGeo = new THREE.CylinderGeometry(b.w * 0.1, b.w * 0.1, floorH * 3, 8);
          const core = new THREE.Mesh(coreGeo, darkerMat);
          core.position.y = floorY + floorH * 1.5;
          group.add(core);
        }

        // Edge beams connecting floors
        if (i > 0) {
          const prevRotation = ((i - 1) / (twistedFloors - 1)) * totalTwist;
          const prevTaper = 1 - ((i - 1) / (twistedFloors - 1)) * 0.2;
          for (let c = 0; c < 4; c++) {
            const cornerAngle = (c / 4) * Math.PI * 2 + Math.PI / 4;
            const prevX = Math.cos(cornerAngle + prevRotation) * b.w * prevTaper * 0.48;
            const prevZ = Math.sin(cornerAngle + prevRotation) * b.d * prevTaper * 0.48;
            const currX = Math.cos(cornerAngle + rotation) * b.w * taper * 0.48;
            const currZ = Math.sin(cornerAngle + rotation) * b.d * taper * 0.48;

            const beamLen = Math.sqrt(
              Math.pow(currX - prevX, 2) +
              Math.pow(floorH * (b.h / twistedFloors) / 0.85, 2) +
              Math.pow(currZ - prevZ, 2)
            );
            const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, beamLen, 4);
            const beam = new THREE.Mesh(beamGeo, accentMat);
            beam.position.set(
              (prevX + currX) / 2,
              floorY - floorH * 0.5,
              (prevZ + currZ) / 2
            );
            beam.lookAt(currX, floorY + floorH / 2, currZ);
            beam.rotateX(Math.PI / 2);
            group.add(beam);
          }
        }
      }

      // Crown element
      const crownGeo = new THREE.OctahedronGeometry(b.w * 0.3, 0);
      const crown = new THREE.Mesh(crownGeo, accentMat);
      crown.position.y = b.h + b.w * 0.3;
      crown.rotation.y = totalTwist;
      group.add(crown);
      break;

    case 'voronoi':
      // Voronoi-paneled facade building with varied panel types
      const vBaseGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const vBase = new THREE.Mesh(vBaseGeo, mainMat);
      vBase.position.y = b.h / 2;
      group.add(vBase);

      // Panel style for this building (consistent per building)
      const panelStyle = rndChoice(['hexGrid', 'diamonds', 'triangles', 'circles', 'mixed', 'fins', 'louvers']);
      const panelDepth = rnd(0.08, 0.25);

      // Create facade panels based on style
      const createFacadePanel = (x, y, z, rotY, faceW, faceH) => {
        const panelMat = rndBool(0.25) ? accentMat : darkerMat;
        let panel;

        switch (panelStyle) {
          case 'hexGrid':
            // Hexagonal panels in honeycomb pattern
            const hexRadius = rnd(0.3, 0.6);
            const hexGeo = new THREE.CylinderGeometry(hexRadius, hexRadius, panelDepth, 6);
            panel = new THREE.Mesh(hexGeo, panelMat);
            panel.rotation.x = Math.PI / 2;
            panel.rotation.z = Math.PI / 6;
            break;

          case 'diamonds':
            // Diamond/rhombus shaped panels
            const dSize = rnd(0.4, 0.8);
            const diamondGeo = new THREE.BoxGeometry(dSize, dSize, panelDepth);
            panel = new THREE.Mesh(diamondGeo, panelMat);
            panel.rotation.z = Math.PI / 4;
            break;

          case 'triangles':
            // Triangular panels pointing various directions
            const triSize = rnd(0.5, 1.0);
            const triGeo = new THREE.ConeGeometry(triSize * 0.6, triSize, 3);
            panel = new THREE.Mesh(triGeo, panelMat);
            panel.rotation.x = Math.PI / 2;
            panel.rotation.z = rndChoice([0, Math.PI / 3, Math.PI * 2/3, Math.PI]);
            break;

          case 'circles':
            // Circular/disc panels with varying sizes
            const circRadius = rnd(0.25, 0.55);
            const circGeo = new THREE.CylinderGeometry(circRadius, circRadius, panelDepth, 16);
            panel = new THREE.Mesh(circGeo, panelMat);
            panel.rotation.x = Math.PI / 2;
            break;

          case 'fins':
            // Vertical fin elements
            const finH = rnd(0.8, 2.0);
            const finGeo = new THREE.BoxGeometry(0.06, finH, rnd(0.3, 0.6));
            panel = new THREE.Mesh(finGeo, panelMat);
            panel.rotation.y = rnd(-0.3, 0.3);
            break;

          case 'louvers':
            // Horizontal louver slats
            const louverW = rnd(0.6, 1.2);
            const louverGeo = new THREE.BoxGeometry(louverW, 0.05, rnd(0.2, 0.4));
            panel = new THREE.Mesh(louverGeo, panelMat);
            panel.rotation.x = rnd(0.2, 0.6);
            break;

          case 'mixed':
          default:
            // Mix of shapes
            const shapeType = rndInt(0, 4);
            if (shapeType === 0) {
              const mHexGeo = new THREE.CylinderGeometry(rnd(0.2, 0.45), rnd(0.2, 0.45), panelDepth, 6);
              panel = new THREE.Mesh(mHexGeo, panelMat);
              panel.rotation.x = Math.PI / 2;
            } else if (shapeType === 1) {
              const mTriGeo = new THREE.ConeGeometry(rnd(0.3, 0.5), rnd(0.4, 0.7), 3);
              panel = new THREE.Mesh(mTriGeo, panelMat);
              panel.rotation.x = Math.PI / 2;
              panel.rotation.z = rnd(0, Math.PI);
            } else if (shapeType === 2) {
              const mCircGeo = new THREE.TorusGeometry(rnd(0.2, 0.4), 0.05, 8, 16);
              panel = new THREE.Mesh(mCircGeo, panelMat);
            } else if (shapeType === 3) {
              const mOctGeo = new THREE.CylinderGeometry(rnd(0.25, 0.4), rnd(0.25, 0.4), panelDepth, 8);
              panel = new THREE.Mesh(mOctGeo, panelMat);
              panel.rotation.x = Math.PI / 2;
            } else {
              const starGeo = new THREE.ConeGeometry(rnd(0.2, 0.35), rnd(0.3, 0.5), 5);
              panel = new THREE.Mesh(starGeo, panelMat);
              panel.rotation.x = Math.PI / 2;
            }
            break;
        }

        panel.position.set(x, y, z);
        panel.rotation.y += rotY;
        return panel;
      };

      // Generate panels on front and back faces
      const vCellCount = rndInt(12, 28);
      for (let i = 0; i < vCellCount; i++) {
        const cellX = rnd(-0.42, 0.42) * b.w;
        const cellY = rnd(0.08, 0.92) * b.h;

        // Front face
        const frontPanel = createFacadePanel(cellX, cellY, b.d / 2 + panelDepth / 2, 0, b.w, b.h);
        group.add(frontPanel);

        // Back face (fewer panels)
        if (rndBool(0.6)) {
          const backPanel = createFacadePanel(cellX * rnd(0.8, 1.2), cellY * rnd(0.9, 1.1), -b.d / 2 - panelDepth / 2, Math.PI, b.w, b.h);
          group.add(backPanel);
        }
      }

      // Side faces
      for (let i = 0; i < vCellCount / 2; i++) {
        const cellZ = rnd(-0.4, 0.4) * b.d;
        const cellY = rnd(0.1, 0.9) * b.h;

        // Right face
        const rightPanel = createFacadePanel(b.w / 2 + panelDepth / 2, cellY, cellZ, Math.PI / 2, b.d, b.h);
        group.add(rightPanel);

        // Left face
        if (rndBool(0.7)) {
          const leftPanel = createFacadePanel(-b.w / 2 - panelDepth / 2, cellY * rnd(0.9, 1.1), cellZ * rnd(0.8, 1.2), -Math.PI / 2, b.d, b.h);
          group.add(leftPanel);
        }
      }

      // Diagonal bracing/structural lines
      const braceCount = rndInt(2, 5);
      const braceMat = new THREE.LineBasicMaterial({ color: darkerMat.color || 0x333333 });
      for (let i = 0; i < braceCount; i++) {
        const points = [];
        const startY = rnd(0.1, 0.4) * b.h;
        const endY = rnd(0.6, 0.95) * b.h;
        const startX = rnd(-0.4, 0.4) * b.w;
        const endX = rnd(-0.4, 0.4) * b.w;
        points.push(new THREE.Vector3(startX, startY, b.d / 2 + 0.02));
        points.push(new THREE.Vector3(endX, endY, b.d / 2 + 0.02));
        const braceGeo = new THREE.BufferGeometry().setFromPoints(points);
        const brace = new THREE.Line(braceGeo, braceMat);
        group.add(brace);
      }

      // Corner mullions
      const mullionPositions = [
        [-b.w/2, 0, -b.d/2], [b.w/2, 0, -b.d/2],
        [-b.w/2, 0, b.d/2], [b.w/2, 0, b.d/2]
      ];
      for (const [mx, my, mz] of mullionPositions) {
        const mullionGeo = new THREE.CylinderGeometry(0.08, 0.1, b.h, 8);
        const mullion = new THREE.Mesh(mullionGeo, darkerMat);
        mullion.position.set(mx, b.h / 2, mz);
        group.add(mullion);
      }

      // Cantilevered top
      const cantGeo = new THREE.BoxGeometry(b.w * 1.1, 0.4, b.d * 1.1);
      const cant = new THREE.Mesh(cantGeo, accentMat);
      cant.position.y = b.h + 0.2;
      group.add(cant);
      break;

    default:
      // Fallback simple box
      geometry = new THREE.BoxGeometry(b.w, b.h, b.d);
      mesh = new THREE.Mesh(geometry, mainMat);
      mesh.position.y = b.h / 2;
      group.add(mesh);
      break;
  }
}

function addMeltEffect(group, b, material, intensity) {
  // Drips at bottom
  const dripCount = Math.floor(intensity * 10) + 3;
  for (let i = 0; i < dripCount; i++) {
    const dripX = (rnd() - 0.5) * b.w;
    const dripZ = (rnd() - 0.5) * b.d;
    const dripH = rnd(0.6, 2.5) * intensity;
    const dripR = rnd(0.12, 0.35);

    const dripGeo = new THREE.CylinderGeometry(dripR * 0.4, dripR, dripH, 6);
    const drip = new THREE.Mesh(dripGeo, material);
    drip.position.set(dripX, -dripH / 2, dripZ);
    group.add(drip);
  }

  // Drips on building sides
  for (let i = 0; i < dripCount / 2; i++) {
    const side = rndInt(0, 3);
    const dripH = rnd(1.5, 5) * intensity;
    const dripR = rnd(0.18, 0.4);
    const dripGeo = new THREE.CylinderGeometry(dripR * 0.25, dripR, dripH, 6);
    const drip = new THREE.Mesh(dripGeo, material);

    const posY = b.h - dripH / 2 - rnd(0, b.h * 0.35);
    if (side === 0) drip.position.set(b.w/2 + dripR/2, posY, (rnd() - 0.5) * b.d);
    else if (side === 1) drip.position.set(-b.w/2 - dripR/2, posY, (rnd() - 0.5) * b.d);
    else if (side === 2) drip.position.set((rnd() - 0.5) * b.w, posY, b.d/2 + dripR/2);
    else drip.position.set((rnd() - 0.5) * b.w, posY, -b.d/2 - dripR/2);

    group.add(drip);
  }
}

function addFragments(group, b, material, count) {
  for (let i = 0; i < count; i++) {
    const fragW = rnd(0.35, 1.2);
    const fragH = rnd(0.35, 1.8);
    const fragD = rnd(0.35, 1.2);
    const fragGeo = new THREE.BoxGeometry(fragW, fragH, fragD);
    const frag = new THREE.Mesh(fragGeo, material);

    frag.position.set(
      (rnd() - 0.5) * b.w * 2.2,
      b.h * rnd(0.25, 1.3),
      (rnd() - 0.5) * b.d * 2.2
    );
    frag.rotation.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);
    group.add(frag);
  }
}

// =============================================================================
// WINDOWS
// =============================================================================

function addWindows(group, b, pal) {
  // Skip window generation for styles with custom facade patterns
  if (['retro', 'organic', 'parametric', 'twisted', 'voronoi'].includes(b.style)) return;

  const isNight = features.timeOfDay === 'night';
  const isDusk = features.timeOfDay === 'dusk';

  // Window style for this building (consistent per building)
  const windowStyle = rndChoice(['grid', 'horizontal', 'vertical', 'scattered', 'floorToCeiling', 'arched', 'cityLights', 'cityLights', 'cityLights']);

  // Base dimensions vary by style
  let winW, winH, spacingH, spacingW;
  switch (windowStyle) {
    case 'floorToCeiling':
      winW = rnd(0.6, 1.0);
      winH = rnd(1.4, 2.2);
      spacingH = winH + 0.3;
      spacingW = winW + 0.15;
      break;
    case 'horizontal':
      winW = rnd(0.8, 1.5);
      winH = rnd(0.35, 0.5);
      spacingH = rnd(1.0, 1.4);
      spacingW = winW + 0.1;
      break;
    case 'vertical':
      winW = rnd(0.25, 0.4);
      winH = rnd(1.0, 1.6);
      spacingH = winH + 0.4;
      spacingW = rnd(0.6, 0.9);
      break;
    case 'arched':
      winW = rnd(0.35, 0.55);
      winH = rnd(0.7, 1.1);
      spacingH = rnd(1.6, 2.2);
      spacingW = rnd(1.0, 1.4);
      break;
    case 'scattered':
      winW = rnd(0.3, 0.5);
      winH = rnd(0.4, 0.7);
      spacingH = rnd(1.2, 2.0);
      spacingW = rnd(0.8, 1.3);
      break;
    case 'cityLights':
      // Tiny glowing points like distant city at night
      winW = rnd(0.08, 0.18);
      winH = rnd(0.08, 0.18);
      spacingH = rnd(0.4, 0.8);
      spacingW = rnd(0.35, 0.7);
      break;
    default: // grid
      winW = rnd(0.32, 0.45);
      winH = rnd(0.5, 0.7);
      spacingH = rnd(1.6, 2.2);
      spacingW = rnd(1.0, 1.4);
  }

  const margin = 0.45;
  const rows = Math.max(1, Math.floor((b.h - margin * 2) / spacingH));
  const colsW = Math.max(1, Math.floor((b.w - margin * 2) / spacingW));
  const colsD = Math.max(1, Math.floor((b.d - margin * 2) / spacingW));

  // Light color variations
  const lightColors = [
    0xfffaf0, // warm white
    0xfff8dc, // cornsilk
    0xffe4b5, // moccasin (warm)
    0xe6e6fa, // lavender (cool)
    0xb0e0e6, // powder blue
    0xffefd5, // papaya whip
    0xffb347, // pastel orange
    0x87ceeb, // sky blue
  ];

  const createWindow = (x, y, z, rotY) => {
    const windowGroup = new THREE.Group();

    // Determine if window is lit
    const litChance = isNight ? 0.72 : isDusk ? 0.4 : 0.08;
    const isLit = rndBool(litChance);

    // Pick light color
    const lightColor = isLit ? rndChoice(lightColors) : pal.window;

    const winMat = new THREE.MeshBasicMaterial({
      color: isLit ? lightColor : pal.window,
      transparent: !isLit,
      opacity: isLit ? 1 : 0.6
    });

    let winGeo;

    // Create window geometry based on style
    if (windowStyle === 'cityLights') {
      // Tiny glowing spheres like distant city lights at night
      const glowSize = rnd(0.04, 0.12);
      const glowIntensity = isLit ? rnd(0.8, 1.2) : rnd(0.2, 0.4);

      // Emissive sphere for glow effect
      const sphereGeo = new THREE.SphereGeometry(glowSize, 6, 4);
      const glowMat = new THREE.MeshBasicMaterial({
        color: isLit ? lightColor : 0x333344,
        transparent: true,
        opacity: glowIntensity
      });
      const sphere = new THREE.Mesh(sphereGeo, glowMat);
      windowGroup.add(sphere);

      // Add subtle outer glow for lit windows
      if (isLit && rndBool(0.6)) {
        const outerGeo = new THREE.SphereGeometry(glowSize * 2.2, 6, 4);
        const outerMat = new THREE.MeshBasicMaterial({
          color: lightColor,
          transparent: true,
          opacity: 0.15
        });
        const outer = new THREE.Mesh(outerGeo, outerMat);
        windowGroup.add(outer);
      }

      windowGroup.position.set(x, y, z);
      windowGroup.rotation.y = rotY;
      return windowGroup;

    } else if (windowStyle === 'arched') {
      // Arched window: rectangle with semicircle top
      const rectGeo = new THREE.PlaneGeometry(winW, winH * 0.7);
      const rect = new THREE.Mesh(rectGeo, winMat);
      rect.position.y = -winH * 0.15;
      windowGroup.add(rect);

      // Arch top
      const archGeo = new THREE.CircleGeometry(winW / 2, 12, 0, Math.PI);
      const arch = new THREE.Mesh(archGeo, winMat);
      arch.position.y = winH * 0.2;
      windowGroup.add(arch);

    } else if (windowStyle === 'floorToCeiling' && rndBool(0.4)) {
      // Some floor-to-ceiling have mullions
      winGeo = new THREE.PlaneGeometry(winW, winH);
      const win = new THREE.Mesh(winGeo, winMat);
      windowGroup.add(win);

      // Add frame/mullion
      const frameMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
      const hFrame = new THREE.PlaneGeometry(winW + 0.04, 0.03);
      const vFrame = new THREE.PlaneGeometry(0.03, winH + 0.04);

      const topFrame = new THREE.Mesh(hFrame, frameMat);
      topFrame.position.y = winH / 2;
      topFrame.position.z = 0.001;
      windowGroup.add(topFrame);

      const botFrame = new THREE.Mesh(hFrame, frameMat);
      botFrame.position.y = -winH / 2;
      botFrame.position.z = 0.001;
      windowGroup.add(botFrame);

      // Vertical mullion
      if (rndBool(0.5)) {
        const midFrame = new THREE.Mesh(vFrame, frameMat);
        midFrame.position.z = 0.001;
        windowGroup.add(midFrame);
      }

    } else if (windowStyle === 'horizontal' && rndBool(0.3)) {
      // Horizontal bands sometimes have dividers
      winGeo = new THREE.PlaneGeometry(winW, winH);
      const win = new THREE.Mesh(winGeo, winMat);
      windowGroup.add(win);

      const divMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
      const divCount = rndInt(2, 4);
      for (let d = 1; d < divCount; d++) {
        const divGeo = new THREE.PlaneGeometry(0.02, winH);
        const div = new THREE.Mesh(divGeo, divMat);
        div.position.x = -winW/2 + (winW / divCount) * d;
        div.position.z = 0.001;
        windowGroup.add(div);
      }

    } else {
      // Standard rectangular window
      winGeo = new THREE.PlaneGeometry(winW, winH);
      const win = new THREE.Mesh(winGeo, winMat);
      windowGroup.add(win);

      // Occasionally add small details
      if (rndBool(0.15) && isLit) {
        // Curtain/blind effect - partially covered
        const blindH = winH * rnd(0.2, 0.5);
        const blindGeo = new THREE.PlaneGeometry(winW * 0.95, blindH);
        const blindMat = new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.7 });
        const blind = new THREE.Mesh(blindGeo, blindMat);
        blind.position.y = winH/2 - blindH/2;
        blind.position.z = 0.002;
        windowGroup.add(blind);
      }
    }

    // Add small AC unit occasionally (for residential feel)
    if (rndBool(0.06) && b.style !== 'modernist' && b.style !== 'deco') {
      const acGeo = new THREE.BoxGeometry(0.4, 0.25, 0.2);
      const acMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
      const ac = new THREE.Mesh(acGeo, acMat);
      ac.position.y = -winH/2 - 0.15;
      ac.position.z = 0.1;
      windowGroup.add(ac);
    }

    windowGroup.position.set(x, y, z);
    windowGroup.rotation.y = rotY;
    return windowGroup;
  };

  const startY = margin + winH / 2;
  const endY = b.h - margin;

  // Scattered style places windows more randomly
  // City lights: many tiny scattered points like night skyline
  if (windowStyle === 'cityLights') {
    const density = rnd(0.6, 1.2);
    const totalLights = Math.floor(rndInt(25, 60) * density * (b.w * b.h * b.d) / 50);
    for (let i = 0; i < totalLights; i++) {
      const face = rndInt(0, 3);
      const x = rnd(-b.w/2 + 0.1, b.w/2 - 0.1);
      const y = rnd(0.3, b.h - 0.2);
      const z = rnd(-b.d/2 + 0.1, b.d/2 - 0.1);

      if (face === 0) group.add(createWindow(x, y, b.d/2 + 0.02, 0));
      else if (face === 1) group.add(createWindow(x, y, -b.d/2 - 0.02, Math.PI));
      else if (face === 2) group.add(createWindow(b.w/2 + 0.02, y, z, Math.PI/2));
      else group.add(createWindow(-b.w/2 - 0.02, y, z, -Math.PI/2));
    }
    return;
  }

  if (windowStyle === 'scattered') {
    const totalWindows = rndInt(8, 20);
    for (let i = 0; i < totalWindows; i++) {
      const x = rnd(-b.w/2 + margin, b.w/2 - margin);
      const y = rnd(startY, endY);
      const face = rndInt(0, 3);

      if (face === 0) group.add(createWindow(x, y, b.d/2 + 0.01, 0));
      else if (face === 1) group.add(createWindow(x, y, -b.d/2 - 0.01, Math.PI));
      else if (face === 2) group.add(createWindow(b.w/2 + 0.01, y, rnd(-b.d/2 + margin, b.d/2 - margin), Math.PI/2));
      else group.add(createWindow(-b.w/2 - 0.01, y, rnd(-b.d/2 + margin, b.d/2 - margin), -Math.PI/2));
    }
    return;
  }

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
      if (rndBool(0.18)) continue;
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
  const grassGeo = new THREE.BoxGeometry(BLOCK_SIZE, 0.25, BLOCK_SIZE);
  const grassMat = new THREE.MeshLambertMaterial({ color: pal.grass });
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.position.set(block.x + BLOCK_SIZE/2, 0.125, block.z + BLOCK_SIZE/2);
  cityGroup.add(grass);

  // Trees
  const treeCount = rndInt(5, 12);
  for (let i = 0; i < treeCount; i++) {
    const tx = block.x + rnd(1, BLOCK_SIZE - 1);
    const tz = block.z + rnd(1, BLOCK_SIZE - 1);
    const treeH = rnd(1.8, 3.5);

    const trunkGeo = new THREE.CylinderGeometry(0.1, 0.15, treeH * 0.35, 6);
    const trunk = new THREE.Mesh(trunkGeo, new THREE.MeshLambertMaterial({ color: 0x5a4a3a }));
    trunk.position.set(tx, treeH * 0.175, tz);
    cityGroup.add(trunk);

    const foliageGeo = new THREE.SphereGeometry(rnd(0.55, 0.95), 8, 6);
    const foliage = new THREE.Mesh(foliageGeo, new THREE.MeshLambertMaterial({ color: 0x2d5a2d }));
    foliage.position.set(tx, treeH * 0.45 + rnd(0.25, 0.55), tz);
    foliage.scale.y = rnd(0.75, 1.15);
    cityGroup.add(foliage);
  }

  // Benches
  if (rndBool(0.6)) {
    const benchGeo = new THREE.BoxGeometry(1.2, 0.3, 0.4);
    const bench = new THREE.Mesh(benchGeo, new THREE.MeshLambertMaterial({ color: 0x6a5a4a }));
    bench.position.set(block.x + BLOCK_SIZE/2, 0.4, block.z + BLOCK_SIZE/2);
    cityGroup.add(bench);
  }
}

function buildWater(block, pal) {
  const waterGeo = new THREE.BoxGeometry(BLOCK_SIZE, 0.5, BLOCK_SIZE);
  const waterMat = new THREE.MeshLambertMaterial({
    color: pal.water,
    transparent: true,
    opacity: 0.55
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.set(block.x + BLOCK_SIZE/2, -0.1, block.z + BLOCK_SIZE/2);
  cityGroup.add(water);

  // Bridge if adjacent to buildings
  if (rndBool(0.7)) {
    const bridgeGeo = new THREE.BoxGeometry(BLOCK_SIZE * 1.1, 0.3, ROAD_WIDTH);
    const bridgeMat = new THREE.MeshLambertMaterial({ color: pal.road });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(block.x + BLOCK_SIZE/2, 0.25, block.z + BLOCK_SIZE/2);
    cityGroup.add(bridge);
  }
}

// =============================================================================
// ANIMATION
// =============================================================================

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  // Update shader time uniforms
  for (const mat of shaderMaterials) {
    if (mat.uniforms && mat.uniforms.time) {
      mat.uniforms.time.value = elapsed;
    }
  }

  controls.update();
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
