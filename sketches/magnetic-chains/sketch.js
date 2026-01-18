/**
 * MAGNETIC CHAINS
 * 3D generative art with magnetic bead physics
 *
 * Controls:
 *   Drag - Rotate view
 *   Scroll - Zoom in/out
 *   Arrow keys - Pan camera
 *   1-5 - Camera presets (front, top, side, isometric, back)
 *   P - Toggle physics simulation
 *   B - Toggle bounding box
 *   Space - Reset physics
 *   R - Regenerate with new hash
 *   S - Save PNG
 */

// ============ HASH & RANDOM ============
let hash = "0x" + Array(64).fill(0).map(() =>
  "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}

// sfc32 PRNG - high quality, deterministic
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

// ============ NOISE (FBM) ============
function createSeededRNG(seed) {
  let s = Math.abs(seed) || 1;
  return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
}

function fbm(x, seed, octaves = 4) {
  let value = 0, amplitude = 0.5, frequency = 1;
  for (let i = 0; i < octaves; i++) {
    const floor = Math.floor(x * frequency);
    const frac = x * frequency - floor;
    const smooth = frac * frac * (3 - 2 * frac);
    const r1 = createSeededRNG(floor * 127 + seed + i * 1000)();
    const r2 = createSeededRNG((floor + 1) * 127 + seed + i * 1000)();
    value += amplitude * (r1 + smooth * (r2 - r1) - 0.5);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

// ============ PHYSICS ENGINE ============
class MagneticPhysics {
  constructor(numBeads, options = {}) {
    this.numBeads = numBeads;
    this.positions = [];
    this.velocities = [];
    this.orientations = [];

    this.magneticStrength = options.magneticStrength || 1.0;
    this.chainStiffness = options.chainStiffness || 50.0;
    this.damping = options.damping || 0.95;
    this.temperature = options.temperature || 0.01;
    this.restLength = options.restLength || 0.15;
    this.dipoleStrength = options.dipoleStrength || 0.5;

    // Bounding box constraints
    this.boundingBox = options.boundingBox || null; // { min: {x,y,z}, max: {x,y,z} }

    this.initialized = false;
  }

  initFromPoints(points) {
    this.numBeads = points.length;
    this.positions = points.map(p => ({ x: p[0], y: p[1], z: p[2] }));
    this.velocities = points.map(() => ({ x: 0, y: 0, z: 0 }));

    this.orientations = points.map((p, i) => {
      if (i < points.length - 1) {
        const next = points[i + 1];
        const dx = next[0] - p[0], dy = next[1] - p[1], dz = next[2] - p[2];
        const len = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
        return { x: dx/len, y: dy/len, z: dz/len };
      } else {
        const prev = points[i - 1];
        const dx = p[0] - prev[0], dy = p[1] - prev[1], dz = p[2] - prev[2];
        const len = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
        return { x: dx/len, y: dy/len, z: dz/len };
      }
    });

    this.initialized = true;
  }

  setBoundingBox(box) {
    this.boundingBox = box;
  }

  dipoleDipoleForce(pos1, ori1, pos2, ori2) {
    const dx = pos2.x - pos1.x, dy = pos2.y - pos1.y, dz = pos2.z - pos1.z;
    const r2 = dx*dx + dy*dy + dz*dz;
    const r = Math.sqrt(r2);

    if (r < 0.01) return { fx: 0, fy: 0, fz: 0 };

    const r5 = r2 * r2 * r;
    const rx = dx / r, ry = dy / r, rz = dz / r;

    const m1_dot_r = ori1.x * rx + ori1.y * ry + ori1.z * rz;
    const m2_dot_r = ori2.x * rx + ori2.y * ry + ori2.z * rz;
    const m1_dot_m2 = ori1.x * ori2.x + ori1.y * ori2.y + ori1.z * ori2.z;

    const coeff = this.dipoleStrength * 3 / r5;

    return {
      fx: coeff * (m1_dot_r * ori2.x + m2_dot_r * ori1.x + m1_dot_m2 * rx - 5 * m1_dot_r * m2_dot_r * rx),
      fy: coeff * (m1_dot_r * ori2.y + m2_dot_r * ori1.y + m1_dot_m2 * ry - 5 * m1_dot_r * m2_dot_r * ry),
      fz: coeff * (m1_dot_r * ori2.z + m2_dot_r * ori1.z + m1_dot_m2 * rz - 5 * m1_dot_r * m2_dot_r * rz)
    };
  }

  springForce(pos1, pos2, restLength) {
    const dx = pos2.x - pos1.x, dy = pos2.y - pos1.y, dz = pos2.z - pos1.z;
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if (dist < 0.001) return { fx: 0, fy: 0, fz: 0 };

    const stretch = dist - restLength;
    const force = this.chainStiffness * stretch;
    return { fx: force * dx / dist, fy: force * dy / dist, fz: force * dz / dist };
  }

  step(dt = 0.016) {
    if (!this.initialized) return;

    const forces = this.positions.map(() => ({ x: 0, y: 0, z: 0 }));

    // Spring forces between adjacent beads
    for (let i = 0; i < this.numBeads - 1; i++) {
      const spring = this.springForce(this.positions[i], this.positions[i + 1], this.restLength);
      forces[i].x += spring.fx; forces[i].y += spring.fy; forces[i].z += spring.fz;
      forces[i + 1].x -= spring.fx; forces[i + 1].y -= spring.fy; forces[i + 1].z -= spring.fz;
    }

    // Magnetic dipole-dipole forces
    if (this.magneticStrength > 0) {
      for (let i = 0; i < this.numBeads; i++) {
        for (let j = i + 2; j < Math.min(i + 10, this.numBeads); j++) {
          const mag = this.dipoleDipoleForce(
            this.positions[i], this.orientations[i],
            this.positions[j], this.orientations[j]
          );
          const scale = this.magneticStrength;
          forces[i].x += mag.fx * scale; forces[i].y += mag.fy * scale; forces[i].z += mag.fz * scale;
          forces[j].x -= mag.fx * scale; forces[j].y -= mag.fy * scale; forces[j].z -= mag.fz * scale;
        }
      }
    }

    // Thermal noise
    if (this.temperature > 0) {
      for (let i = 0; i < this.numBeads; i++) {
        forces[i].x += (Math.random() - 0.5) * this.temperature;
        forces[i].y += (Math.random() - 0.5) * this.temperature;
        forces[i].z += (Math.random() - 0.5) * this.temperature;
      }
    }

    // Update velocities and positions
    for (let i = 0; i < this.numBeads; i++) {
      this.velocities[i].x = (this.velocities[i].x + forces[i].x * dt) * this.damping;
      this.velocities[i].y = (this.velocities[i].y + forces[i].y * dt) * this.damping;
      this.velocities[i].z = (this.velocities[i].z + forces[i].z * dt) * this.damping;

      // Velocity clamping
      const vMag = Math.sqrt(this.velocities[i].x ** 2 + this.velocities[i].y ** 2 + this.velocities[i].z ** 2);
      if (vMag > 0.5) {
        this.velocities[i].x *= 0.5 / vMag;
        this.velocities[i].y *= 0.5 / vMag;
        this.velocities[i].z *= 0.5 / vMag;
      }

      this.positions[i].x += this.velocities[i].x * dt;
      this.positions[i].y += this.velocities[i].y * dt;
      this.positions[i].z += this.velocities[i].z * dt;

      // Bounding box constraints
      if (this.boundingBox) {
        const bb = this.boundingBox;
        const bounce = 0.5;

        if (this.positions[i].x < bb.min.x) {
          this.positions[i].x = bb.min.x;
          this.velocities[i].x *= -bounce;
        } else if (this.positions[i].x > bb.max.x) {
          this.positions[i].x = bb.max.x;
          this.velocities[i].x *= -bounce;
        }

        if (this.positions[i].y < bb.min.y) {
          this.positions[i].y = bb.min.y;
          this.velocities[i].y *= -bounce;
        } else if (this.positions[i].y > bb.max.y) {
          this.positions[i].y = bb.max.y;
          this.velocities[i].y *= -bounce;
        }

        if (this.positions[i].z < bb.min.z) {
          this.positions[i].z = bb.min.z;
          this.velocities[i].z *= -bounce;
        } else if (this.positions[i].z > bb.max.z) {
          this.positions[i].z = bb.max.z;
          this.velocities[i].z *= -bounce;
        }
      }
    }

    // Update orientations
    for (let i = 0; i < this.numBeads; i++) {
      let tx, ty, tz;
      if (i < this.numBeads - 1) {
        tx = this.positions[i + 1].x - this.positions[i].x;
        ty = this.positions[i + 1].y - this.positions[i].y;
        tz = this.positions[i + 1].z - this.positions[i].z;
      } else {
        tx = this.positions[i].x - this.positions[i - 1].x;
        ty = this.positions[i].y - this.positions[i - 1].y;
        tz = this.positions[i].z - this.positions[i - 1].z;
      }
      const len = Math.sqrt(tx*tx + ty*ty + tz*tz) || 1;

      const blend = 0.2;
      this.orientations[i].x = this.orientations[i].x * (1 - blend) + (tx / len) * blend;
      this.orientations[i].y = this.orientations[i].y * (1 - blend) + (ty / len) * blend;
      this.orientations[i].z = this.orientations[i].z * (1 - blend) + (tz / len) * blend;

      const oLen = Math.sqrt(
        this.orientations[i].x ** 2 +
        this.orientations[i].y ** 2 +
        this.orientations[i].z ** 2
      ) || 1;
      this.orientations[i].x /= oLen;
      this.orientations[i].y /= oLen;
      this.orientations[i].z /= oLen;
    }
  }

  getPoints() {
    return this.positions.map(p => [p.x, p.y, p.z]);
  }

  getOrientations() {
    return this.orientations.map(o => [o.x, o.y, o.z]);
  }
}

// ============ TOPOLOGY GENERATORS ============
const TOPOLOGY_TYPES = {
  circle: {
    name: 'Circle',
    rarity: 'common',
    generate: (n, p, rng) => {
      return Array.from({length: n}, (_, i) => {
        const t = (i / n) * Math.PI * 2;
        return [Math.cos(t) * p.radius, Math.sin(t) * p.radius, 0];
      });
    },
    defaultParams: { radius: 1 }
  },

  helix: {
    name: 'Helix',
    rarity: 'common',
    generate: (n, p, rng) => {
      return Array.from({length: n}, (_, i) => {
        const t = (i / n) * Math.PI * 2 * p.turns;
        return [Math.cos(t) * p.radius, Math.sin(t) * p.radius, (i / n) * p.pitch * p.turns];
      });
    },
    defaultParams: { radius: 0.5, pitch: 2, turns: 3 }
  },

  trefoil: {
    name: 'Trefoil Knot',
    rarity: 'uncommon',
    generate: (n, p, rng) => {
      return Array.from({length: n}, (_, i) => {
        const t = (i / n) * Math.PI * 2;
        return [
          (Math.sin(t) + 2 * Math.sin(2 * t)) * p.scale,
          (Math.cos(t) - 2 * Math.cos(2 * t)) * p.scale,
          -Math.sin(3 * t) * p.scale * p.thickness
        ];
      });
    },
    defaultParams: { scale: 0.4, thickness: 1 }
  },

  torusKnot: {
    name: 'Torus Knot',
    rarity: 'rare',
    generate: (n, params, rng) => {
      return Array.from({length: n}, (_, i) => {
        const t = (i / n) * Math.PI * 2;
        const r = Math.cos(params.q * t) + 2;
        return [
          r * Math.cos(params.p * t) * params.scale,
          r * Math.sin(params.p * t) * params.scale,
          -Math.sin(params.q * t) * params.scale * 1.5
        ];
      });
    },
    defaultParams: { p: 2, q: 3, scale: 0.35 }
  },

  lissajous: {
    name: 'Lissajous',
    rarity: 'uncommon',
    generate: (n, p, rng) => {
      return Array.from({length: n}, (_, i) => {
        const t = (i / n) * Math.PI * 2;
        return [
          Math.sin(p.freqX * t + p.phase),
          Math.sin(p.freqY * t),
          Math.sin(p.freqZ * t) * 0.7
        ];
      });
    },
    defaultParams: { freqX: 3, freqY: 2, freqZ: 5, phase: 0 }
  },

  wave: {
    name: 'Wave',
    rarity: 'common',
    generate: (n, p, rng) => {
      return Array.from({length: n}, (_, i) => {
        const t = i / n;
        return [
          (t - 0.5) * p.length,
          Math.sin(t * Math.PI * p.frequency * 2) * p.amplitude,
          Math.cos(t * Math.PI * p.frequency * 2) * p.amplitude * 0.5
        ];
      });
    },
    defaultParams: { frequency: 3, amplitude: 0.4, length: 3 }
  },

  chain: {
    name: 'Chain',
    rarity: 'common',
    generate: (n, p, rng) => {
      return Array.from({length: n}, (_, i) => {
        const t = i / (n - 1);
        return [
          (t - 0.5) * p.length,
          -Math.sin(t * Math.PI) * p.sag,
          0
        ];
      });
    },
    defaultParams: { length: 3, sag: 0.5 }
  },

  randomWalk: {
    name: 'Random Walk',
    rarity: 'uncommon',
    generate: (n, p, rng) => {
      const pts = [[0, 0, 0]];
      for (let i = 1; i < n; i++) {
        const last = pts[i - 1];
        const theta = rng() * Math.PI * 2;
        const phi = Math.acos(2 * rng() - 1);
        const step = p.stepSize * (0.8 + rng() * 0.4);
        pts.push([
          last[0] + Math.sin(phi) * Math.cos(theta) * step,
          last[1] + Math.sin(phi) * Math.sin(theta) * step,
          last[2] + Math.cos(phi) * step
        ]);
      }
      // Center the walk
      const cx = pts.reduce((s, pt) => s + pt[0], 0) / n;
      const cy = pts.reduce((s, pt) => s + pt[1], 0) / n;
      const cz = pts.reduce((s, pt) => s + pt[2], 0) / n;
      return pts.map(pt => [pt[0] - cx, pt[1] - cy, pt[2] - cz]);
    },
    defaultParams: { stepSize: 0.15 }
  },

  figure8: {
    name: 'Figure-8 Knot',
    rarity: 'rare',
    generate: (n, p, rng) => {
      return Array.from({length: n}, (_, i) => {
        const t = (i / n) * Math.PI * 2;
        return [
          (2 + Math.cos(2 * t)) * Math.cos(3 * t) * p.scale,
          (2 + Math.cos(2 * t)) * Math.sin(3 * t) * p.scale,
          Math.sin(4 * t) * p.scale
        ];
      });
    },
    defaultParams: { scale: 0.35 }
  },

  tangle: {
    name: 'Tangle',
    rarity: 'legendary',
    generate: (n, p, rng) => {
      const seed = Math.floor(rng() * 10000);
      return Array.from({length: n}, (_, i) => {
        const t = (i / n) * Math.PI * 2 * p.coils;
        const r = 0.5 + fbm(t, seed, 3) * p.chaos;
        return [
          Math.cos(t) * r + (rng() - 0.5) * p.chaos * 0.3,
          Math.sin(t) * r + (rng() - 0.5) * p.chaos * 0.3,
          (i / n - 0.5) * 2 + fbm(t * 2, seed + 1000, 2) * p.chaos
        ];
      });
    },
    defaultParams: { coils: 4, chaos: 0.4 }
  },

  lorenz: {
    name: 'Lorenz Attractor',
    rarity: 'legendary',
    generate: (n, p, rng) => {
      const pts = [];
      let x = 0.1 + rng() * 0.1;
      let y = rng() * 0.1;
      let z = rng() * 0.1;
      const dt = 0.005;

      for (let k = 0; k < n * 60; k++) {
        const dx = p.sigma * (y - x);
        const dy = x * (p.rho - z) - y;
        const dz = x * y - p.beta * z;
        x += dx * dt;
        y += dy * dt;
        z += dz * dt;
        if (k % 60 === 0 && k > 100) {
          pts.push([x * p.scale, y * p.scale, (z - 25) * p.scale]);
        }
      }
      return pts.slice(0, n);
    },
    defaultParams: { sigma: 10, rho: 28, beta: 2.667, scale: 0.04 }
  }
};

// ============ BEAD GEOMETRIES ============
const BEAD_GEOMETRIES = {
  sphere: { name: 'Sphere', magnetic: 1.0, rarity: 'common' },
  cube: { name: 'Cube', magnetic: 0.9, rarity: 'common' },
  octahedron: { name: 'Octahedron', magnetic: 1.1, rarity: 'uncommon' },
  dodecahedron: { name: 'Dodecahedron', magnetic: 1.0, rarity: 'rare' },
  icosahedron: { name: 'Icosahedron', magnetic: 1.0, rarity: 'uncommon' },
  torus: { name: 'Torus', magnetic: 0.7, rarity: 'rare' },
  cylinder: { name: 'Cylinder', magnetic: 1.2, rarity: 'uncommon' },
  cone: { name: 'Cone', magnetic: 0.8, rarity: 'uncommon' },
  tetrahedron: { name: 'Tetrahedron', magnetic: 0.85, rarity: 'uncommon' }
};

function createGeometry(type, size) {
  switch(type) {
    case 'sphere': return new THREE.SphereGeometry(size, 24, 24);
    case 'cube': return new THREE.BoxGeometry(size * 1.6, size * 1.6, size * 1.6);
    case 'octahedron': return new THREE.OctahedronGeometry(size * 1.2);
    case 'dodecahedron': return new THREE.DodecahedronGeometry(size * 1.1);
    case 'icosahedron': return new THREE.IcosahedronGeometry(size * 1.1);
    case 'torus': return new THREE.TorusGeometry(size * 0.8, size * 0.3, 12, 24);
    case 'cylinder': return new THREE.CylinderGeometry(size * 0.7, size * 0.7, size * 1.6, 16);
    case 'cone': return new THREE.ConeGeometry(size, size * 2, 16);
    case 'tetrahedron': return new THREE.TetrahedronGeometry(size * 1.3);
    default: return new THREE.SphereGeometry(size, 24, 24);
  }
}

// ============ MATERIALS ============
const MATERIAL_PRESETS = {
  neodymium: {
    name: 'Neodymium',
    props: { metalness: 0.95, roughness: 0.15 },
    magnetic: 3.0,
    color: '#888899',
    rarity: 'uncommon'
  },
  iron: {
    name: 'Iron',
    props: { metalness: 0.85, roughness: 0.35 },
    magnetic: 1.5,
    color: '#666677',
    rarity: 'common'
  },
  ferrite: {
    name: 'Ferrite',
    props: { metalness: 0.1, roughness: 0.7 },
    magnetic: 0.5,
    color: '#333333',
    rarity: 'common'
  },
  chrome: {
    name: 'Chrome',
    props: { metalness: 1, roughness: 0.05 },
    magnetic: 0.8,
    color: '#aaaaaa',
    rarity: 'uncommon'
  },
  cobalt: {
    name: 'Cobalt',
    props: { metalness: 0.9, roughness: 0.2 },
    magnetic: 2.0,
    color: '#6666aa',
    rarity: 'rare'
  },
  gold: {
    name: 'Gold',
    props: { metalness: 1, roughness: 0.15 },
    magnetic: 0.0,
    color: '#ffd700',
    rarity: 'legendary'
  },
  copper: {
    name: 'Copper',
    props: { metalness: 1, roughness: 0.2 },
    magnetic: 0.0,
    color: '#b87333',
    rarity: 'rare'
  },
  plastic: {
    name: 'Plastic',
    props: { metalness: 0.0, roughness: 0.4 },
    magnetic: 0.0,
    color: '#ff6b9d',
    rarity: 'common'
  },
  glass: {
    name: 'Glass',
    props: { metalness: 0.0, roughness: 0.1, transparent: true, opacity: 0.6 },
    magnetic: 0.0,
    color: '#ffffff',
    rarity: 'legendary'
  },
  rubber: {
    name: 'Rubber',
    props: { metalness: 0.0, roughness: 1.0 },
    magnetic: 0.0,
    color: '#222222',
    rarity: 'common'
  }
};

// ============ COLOR PALETTES ============
const COLOR_PALETTES = {
  sunset: { name: 'Sunset', colors: ['#ff6b9d', '#c44569', '#ff8e72'], rarity: 'common' },
  ocean: { name: 'Ocean', colors: ['#6b9dff', '#4a6cf4', '#2d4a8c'], rarity: 'common' },
  forest: { name: 'Forest', colors: ['#9dff6b', '#6bffd9', '#4a8c5c'], rarity: 'common' },
  cosmic: { name: 'Cosmic', colors: ['#d96bff', '#6b6bff', '#ff6bd9'], rarity: 'uncommon' },
  fire: { name: 'Fire', colors: ['#ff6b6b', '#ffd93d', '#ff8c00'], rarity: 'uncommon' },
  ice: { name: 'Ice', colors: ['#6bffd9', '#6bcfff', '#b0e0e6'], rarity: 'uncommon' },
  monochrome: { name: 'Monochrome', colors: ['#ffffff', '#aaaaaa', '#555555'], rarity: 'rare' },
  neon: { name: 'Neon', colors: ['#00ff00', '#ff00ff', '#00ffff'], rarity: 'rare' },
  aurora: { name: 'Aurora', colors: ['#00ff88', '#8800ff', '#ff0088'], rarity: 'legendary' },
  void: { name: 'Void', colors: ['#110011', '#220022', '#330033'], rarity: 'legendary' }
};

// ============ BACKGROUND COLOR GENERATOR ============
// Creates a harmonious, soft background that contrasts with particle colors
function generateBackgroundColor(paletteColors, rng) {
  // Parse the primary color from palette
  const primaryHex = paletteColors[0];
  const r = parseInt(primaryHex.slice(1, 3), 16) / 255;
  const g = parseInt(primaryHex.slice(3, 5), 16) / 255;
  const b = parseInt(primaryHex.slice(5, 7), 16) / 255;

  // Convert to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  // Generate background based on palette characteristics
  const isVeryDark = l < 0.15;
  const isVeryBright = l > 0.8;

  let bgH, bgS, bgL;

  if (isVeryDark) {
    // For dark palettes (like void), use a soft, slightly lighter complementary
    bgH = (h + 0.5 + rng() * 0.1 - 0.05) % 1;
    bgS = 0.15 + rng() * 0.1;
    bgL = 0.08 + rng() * 0.04;
  } else if (isVeryBright) {
    // For very bright palettes, use a muted darker version
    bgH = (h + rng() * 0.1 - 0.05) % 1;
    bgS = 0.2 + rng() * 0.15;
    bgL = 0.06 + rng() * 0.03;
  } else {
    // For normal palettes, create a soft complementary or analogous background
    const hueShift = rng() < 0.5 ? 0.5 : (rng() < 0.5 ? 0.08 : -0.08); // complementary or analogous
    bgH = (h + hueShift + rng() * 0.05) % 1;
    if (bgH < 0) bgH += 1;

    // Soft, muted saturation - "sweet" pastel-ish dark tones
    bgS = 0.25 + rng() * 0.2;

    // Dark but not black - enough to see the tint
    bgL = 0.05 + rng() * 0.06;
  }

  // Convert HSL back to hex
  const hslToRgb = (h, s, l) => {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const [bgR, bgG, bgB] = hslToRgb(bgH, bgS, bgL);
  return '#' + [bgR, bgG, bgB].map(x => x.toString(16).padStart(2, '0')).join('');
}

// ============ FEATURES ============
let features = {};

function generateFeatures() {
  R = initRandom(hash);

  // Topology selection (weighted by rarity)
  const topologyTypes = Object.keys(TOPOLOGY_TYPES);
  const topologyWeights = topologyTypes.map(t => {
    const rarity = TOPOLOGY_TYPES[t].rarity;
    return rarity === 'legendary' ? 0.05 : rarity === 'rare' ? 0.1 : rarity === 'uncommon' ? 0.2 : 0.65;
  });
  const totalWeight = topologyWeights.reduce((a, b) => a + b, 0);
  let roll = R() * totalWeight;
  let topologyType = topologyTypes[0];
  for (let i = 0; i < topologyTypes.length; i++) {
    roll -= topologyWeights[i];
    if (roll <= 0) { topologyType = topologyTypes[i]; break; }
  }

  // Geometry selection
  const geometryTypes = Object.keys(BEAD_GEOMETRIES);
  const geoWeights = geometryTypes.map(g => {
    const rarity = BEAD_GEOMETRIES[g].rarity;
    return rarity === 'rare' ? 0.1 : rarity === 'uncommon' ? 0.25 : 0.65;
  });
  const geoTotal = geoWeights.reduce((a, b) => a + b, 0);
  roll = R() * geoTotal;
  let geometryType = geometryTypes[0];
  for (let i = 0; i < geometryTypes.length; i++) {
    roll -= geoWeights[i];
    if (roll <= 0) { geometryType = geometryTypes[i]; break; }
  }

  // Material selection
  const materialTypes = Object.keys(MATERIAL_PRESETS);
  const matWeights = materialTypes.map(m => {
    const rarity = MATERIAL_PRESETS[m].rarity;
    return rarity === 'legendary' ? 0.03 : rarity === 'rare' ? 0.08 : rarity === 'uncommon' ? 0.2 : 0.69;
  });
  const matTotal = matWeights.reduce((a, b) => a + b, 0);
  roll = R() * matTotal;
  let materialType = materialTypes[0];
  for (let i = 0; i < materialTypes.length; i++) {
    roll -= matWeights[i];
    if (roll <= 0) { materialType = materialTypes[i]; break; }
  }

  // Color palette selection
  const paletteTypes = Object.keys(COLOR_PALETTES);
  const palWeights = paletteTypes.map(p => {
    const rarity = COLOR_PALETTES[p].rarity;
    return rarity === 'legendary' ? 0.03 : rarity === 'rare' ? 0.08 : rarity === 'uncommon' ? 0.2 : 0.69;
  });
  const palTotal = palWeights.reduce((a, b) => a + b, 0);
  roll = R() * palTotal;
  let paletteType = paletteTypes[0];
  for (let i = 0; i < paletteTypes.length; i++) {
    roll -= palWeights[i];
    if (roll <= 0) { paletteType = paletteTypes[i]; break; }
  }

  // Generate harmonious background color based on palette
  const backgroundColor = generateBackgroundColor(COLOR_PALETTES[paletteType].colors, R);

  // Other features
  const beadCount = rndInt(40, 120);
  const beadSize = rnd(0.05, 0.15);
  const useGradient = rndBool(0.7);
  const showConnections = rndBool(0.6);
  const coloredLights = rndBool(0.5);
  const magneticStrength = rnd(0.2, 1.5);
  const temperature = rnd(0.005, 0.05);

  // Generate topology parameters with variation
  const baseParams = { ...TOPOLOGY_TYPES[topologyType].defaultParams };
  const params = {};
  for (const key in baseParams) {
    params[key] = baseParams[key] * rnd(0.8, 1.2);
  }

  // Compute overall rarity score
  const rarityScore = (
    (TOPOLOGY_TYPES[topologyType].rarity === 'legendary' ? 4 :
     TOPOLOGY_TYPES[topologyType].rarity === 'rare' ? 3 :
     TOPOLOGY_TYPES[topologyType].rarity === 'uncommon' ? 2 : 1) +
    (BEAD_GEOMETRIES[geometryType].rarity === 'rare' ? 3 :
     BEAD_GEOMETRIES[geometryType].rarity === 'uncommon' ? 2 : 1) +
    (MATERIAL_PRESETS[materialType].rarity === 'legendary' ? 4 :
     MATERIAL_PRESETS[materialType].rarity === 'rare' ? 3 :
     MATERIAL_PRESETS[materialType].rarity === 'uncommon' ? 2 : 1) +
    (COLOR_PALETTES[paletteType].rarity === 'legendary' ? 4 :
     COLOR_PALETTES[paletteType].rarity === 'rare' ? 3 :
     COLOR_PALETTES[paletteType].rarity === 'uncommon' ? 2 : 1)
  );

  const overallRarity = rarityScore >= 12 ? 'Legendary' :
                        rarityScore >= 9 ? 'Rare' :
                        rarityScore >= 6 ? 'Uncommon' : 'Common';

  features = {
    topology: TOPOLOGY_TYPES[topologyType].name,
    topologyType,
    topologyParams: params,
    geometry: BEAD_GEOMETRIES[geometryType].name,
    geometryType,
    material: MATERIAL_PRESETS[materialType].name,
    materialType,
    palette: COLOR_PALETTES[paletteType].name,
    paletteType,
    backgroundColor,
    beadCount,
    beadSize,
    useGradient,
    showConnections,
    coloredLights,
    magneticStrength,
    temperature,
    effectiveMagnetic: MATERIAL_PRESETS[materialType].magnetic * BEAD_GEOMETRIES[geometryType].magnetic,
    overallRarity,
    rarityScore
  };

  return features;
}

// ============ GLOBALS ============
let scene, camera, renderer;
let chainGroup, boundingBoxMesh;
let physics;
let points = [];
let orientations = [];
let physicsEnabled = true;
let boundingBoxEnabled = false;
let autoRotate = false;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraTarget = { x: 0, y: 0 };

const BOUNDING_BOX_SIZE = 2.5;
const boundingBox = {
  min: { x: -BOUNDING_BOX_SIZE, y: -BOUNDING_BOX_SIZE, z: -BOUNDING_BOX_SIZE },
  max: { x: BOUNDING_BOX_SIZE, y: BOUNDING_BOX_SIZE, z: BOUNDING_BOX_SIZE }
};

// Camera presets
const CAMERA_PRESETS = [
  { name: 'Front', pos: [0, 0, 5], target: [0, 0, 0] },
  { name: 'Top', pos: [0, 5, 0.1], target: [0, 0, 0] },
  { name: 'Side', pos: [5, 0, 0], target: [0, 0, 0] },
  { name: 'Isometric', pos: [3, 3, 3], target: [0, 0, 0] },
  { name: 'Back', pos: [0, 0, -5], target: [0, 0, 0] }
];

// ============ INITIALIZATION ============
function init() {
  generateFeatures();

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(features.backgroundColor);

  // Update HTML body background to match
  document.body.style.background = features.backgroundColor;

  // Camera
  const container = document.getElementById('sketch-holder');
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.z = 5;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  if (features.coloredLights) {
    const palette = COLOR_PALETTES[features.paletteType].colors;
    const p1 = new THREE.PointLight(new THREE.Color(palette[0]), 0.6);
    p1.position.set(-5, 3, 2);
    scene.add(p1);
    const p2 = new THREE.PointLight(new THREE.Color(palette[1] || palette[0]), 0.4);
    p2.position.set(5, -3, 2);
    scene.add(p2);
  }

  // Create chain group
  chainGroup = new THREE.Group();
  scene.add(chainGroup);

  // Create bounding box wireframe (initially invisible)
  // Use palette color for better visibility against dynamic background
  const boxGeo = new THREE.BoxGeometry(BOUNDING_BOX_SIZE * 2, BOUNDING_BOX_SIZE * 2, BOUNDING_BOX_SIZE * 2);
  const palette = COLOR_PALETTES[features.paletteType].colors;
  const boxColor = new THREE.Color(palette[0]).multiplyScalar(0.5);
  const boxMat = new THREE.LineBasicMaterial({ color: boxColor, transparent: true, opacity: 0.4 });
  const edges = new THREE.EdgesGeometry(boxGeo);
  boundingBoxMesh = new THREE.LineSegments(edges, boxMat);
  boundingBoxMesh.visible = boundingBoxEnabled;
  scene.add(boundingBoxMesh);

  // Generate initial chain
  generateChain();

  // Physics setup
  initPhysics();

  // Event listeners
  setupEventListeners();

  // Update features display
  updateFeaturesDisplay();

  // Animation loop
  animate();
}

function generateChain() {
  const topology = TOPOLOGY_TYPES[features.topologyType];
  R = initRandom(hash);
  // Skip past feature generation random calls
  for (let i = 0; i < 50; i++) R();

  points = topology.generate(features.beadCount, features.topologyParams, R);

  // Clear and rebuild chain group
  while (chainGroup.children.length > 0) {
    const child = chainGroup.children[0];
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
    chainGroup.remove(child);
  }

  // Reset transform before rebuilding (prevents drift on regenerate)
  chainGroup.position.set(0, 0, 0);
  chainGroup.scale.set(1, 1, 1);
  chainGroup.rotation.set(0, 0, 0);

  const geometry = createGeometry(features.geometryType, features.beadSize);
  const matPreset = MATERIAL_PRESETS[features.materialType];
  const palette = COLOR_PALETTES[features.paletteType].colors;

  const baseColor = new THREE.Color(palette[0]);
  const hsl = { h: 0, s: 0, l: 0 };
  baseColor.getHSL(hsl);

  points.forEach((pos, i) => {
    const localHue = features.useGradient ? (hsl.h + (i / points.length) * 0.3) % 1 : hsl.h;
    const color = new THREE.Color().setHSL(localHue, hsl.s, hsl.l);

    const mat = new THREE.MeshStandardMaterial({
      color,
      metalness: matPreset.props.metalness ?? 0.8,
      roughness: matPreset.props.roughness ?? 0.2,
      transparent: matPreset.props.transparent || false,
      opacity: matPreset.props.opacity ?? 1
    });

    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    chainGroup.add(mesh);
  });

  if (features.showConnections) {
    const linePoints = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x444466, transparent: true, opacity: 0.4 });
    chainGroup.add(new THREE.Line(lineGeo, lineMat));
  }

  // Center and scale
  const box = new THREE.Box3().setFromObject(chainGroup);
  const center = box.getCenter(new THREE.Vector3());
  // Offset group so center is at origin
  chainGroup.position.set(-center.x, -center.y, -center.z);

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 2.5) {
    const scaleFactor = 2.5 / maxDim;
    chainGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }
}

function initPhysics() {
  physics = new MagneticPhysics(points.length, {
    magneticStrength: features.magneticStrength * features.effectiveMagnetic,
    chainStiffness: 40,
    damping: 0.94,
    temperature: features.temperature,
    dipoleStrength: 0.3 * features.effectiveMagnetic,
    restLength: 0.15
  });

  // Transform points to world space for physics
  const worldPoints = points.map(p => {
    const v = new THREE.Vector3(p[0], p[1], p[2]);
    v.sub(chainGroup.position);
    v.multiplyScalar(chainGroup.scale.x);
    return [v.x, v.y, v.z];
  });

  physics.initFromPoints(worldPoints);
  if (boundingBoxEnabled) {
    physics.setBoundingBox(boundingBox);
  }
}

function updateChainMeshes() {
  const physPoints = physics.getPoints();
  const physOrientations = physics.getOrientations();

  for (let i = 0; i < physPoints.length && i < chainGroup.children.length; i++) {
    const child = chainGroup.children[i];
    if (child instanceof THREE.Mesh) {
      child.position.set(
        physPoints[i][0] / chainGroup.scale.x + chainGroup.position.x,
        physPoints[i][1] / chainGroup.scale.y + chainGroup.position.y,
        physPoints[i][2] / chainGroup.scale.z + chainGroup.position.z
      );

      // Orient non-spherical geometries
      if (features.geometryType !== 'sphere' && physOrientations[i]) {
        const dir = new THREE.Vector3(physOrientations[i][0], physOrientations[i][1], physOrientations[i][2]);
        const up = new THREE.Vector3(0, 1, 0);
        if (dir.length() > 0.001) {
          const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.normalize());
          child.quaternion.copy(quat);
        }
      }
    }
  }

  // Update connection line if present
  const line = chainGroup.children.find(c => c instanceof THREE.Line);
  if (line && features.showConnections) {
    const linePoints = physPoints.map(p => new THREE.Vector3(
      p[0] / chainGroup.scale.x + chainGroup.position.x,
      p[1] / chainGroup.scale.y + chainGroup.position.y,
      p[2] / chainGroup.scale.z + chainGroup.position.z
    ));
    line.geometry.setFromPoints(linePoints);
  }
}

function setupEventListeners() {
  const canvas = renderer.domElement;

  // Mouse drag rotation
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    chainGroup.rotation.y += deltaX * 0.01;
    chainGroup.rotation.x += deltaY * 0.01;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;
    chainGroup.rotation.y += deltaX * 0.01;
    chainGroup.rotation.x += deltaY * 0.01;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Scroll zoom
  canvas.addEventListener('wheel', (e) => {
    camera.position.z = Math.max(2, Math.min(15, camera.position.z + e.deltaY * 0.01));
  });

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    switch (key) {
      case 'r':
        regenerate();
        break;
      case 's':
        saveImage();
        break;
      case 'p':
        physicsEnabled = !physicsEnabled;
        updateStatusDisplay();
        break;
      case 'b':
        boundingBoxEnabled = !boundingBoxEnabled;
        boundingBoxMesh.visible = boundingBoxEnabled;
        if (boundingBoxEnabled) {
          physics.setBoundingBox(boundingBox);
        } else {
          physics.setBoundingBox(null);
        }
        updateStatusDisplay();
        break;
      case 'a':
        autoRotate = !autoRotate;
        updateStatusDisplay();
        break;
      case ' ':
        e.preventDefault();
        initPhysics();
        break;
      case 'arrowleft':
        cameraTarget.x -= 0.1;
        break;
      case 'arrowright':
        cameraTarget.x += 0.1;
        break;
      case 'arrowup':
        cameraTarget.y += 0.1;
        break;
      case 'arrowdown':
        cameraTarget.y -= 0.1;
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        const preset = CAMERA_PRESETS[parseInt(key) - 1];
        camera.position.set(preset.pos[0], preset.pos[1], preset.pos[2]);
        cameraTarget = { x: preset.target[0], y: preset.target[1] };
        break;
    }
  });

  // Window resize
  window.addEventListener('resize', () => {
    const container = document.getElementById('sketch-holder');
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

function updateStatusDisplay() {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    let status = [];
    if (physicsEnabled && features.effectiveMagnetic > 0) {
      status.push(`Physics ON (${features.effectiveMagnetic.toFixed(1)}x)`);
    } else if (physicsEnabled) {
      status.push('Physics ON (non-magnetic)');
    } else {
      status.push('Physics OFF');
    }
    if (boundingBoxEnabled) {
      status.push('Box ON');
    }
    if (autoRotate) {
      status.push('Rotate ON');
    }
    statusEl.textContent = status.join(' | ');
  }
}

function updateFeaturesDisplay() {
  const table = document.getElementById('features-table');
  if (!table) return;

  const rows = [
    ['Topology', features.topology, TOPOLOGY_TYPES[features.topologyType].rarity],
    ['Geometry', features.geometry, BEAD_GEOMETRIES[features.geometryType].rarity],
    ['Material', features.material, MATERIAL_PRESETS[features.materialType].rarity],
    ['Palette', features.palette, COLOR_PALETTES[features.paletteType].rarity],
    ['Beads', features.beadCount.toString(), 'common'],
    ['Gradient', features.useGradient ? 'Yes' : 'No', 'common'],
    ['Magnetic', features.effectiveMagnetic > 0 ? `${features.effectiveMagnetic.toFixed(1)}x` : 'None', features.effectiveMagnetic > 1 ? 'uncommon' : 'common'],
    ['Overall', features.overallRarity, features.overallRarity.toLowerCase()]
  ];

  table.innerHTML = rows.map(([name, value, rarity]) => `
    <tr>
      <td>${name}</td>
      <td>${value}</td>
      <td><span class="rarity-badge rarity-${rarity}">${rarity}</span></td>
    </tr>
  `).join('');

  // Update hash display
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

  // Update background color
  scene.background = new THREE.Color(features.backgroundColor);
  document.body.style.background = features.backgroundColor;

  // Update bounding box color to match new palette
  const palette = COLOR_PALETTES[features.paletteType].colors;
  const boxColor = new THREE.Color(palette[0]).multiplyScalar(0.5);
  boundingBoxMesh.material.color = boxColor;

  generateChain();
  initPhysics();
  updateFeaturesDisplay();

  // Reset camera
  camera.position.set(0, 0, 5);
  cameraTarget = { x: 0, y: 0 };
  chainGroup.rotation.set(0, 0, 0);
}

function saveImage() {
  const link = document.createElement('a');
  link.download = `magnetic-chains-${hash.slice(2, 10)}.png`;
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
}

function animate() {
  requestAnimationFrame(animate);

  // Physics simulation
  if (physicsEnabled) {
    physics.step(0.016);
    updateChainMeshes();
  }

  // Auto rotation
  if (!isDragging && autoRotate) {
    chainGroup.rotation.y += 0.004;
  }

  // Camera pan
  camera.position.x += (cameraTarget.x - camera.position.x) * 0.1;
  camera.position.y += (cameraTarget.y - camera.position.y) * 0.1;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

// ============ EXPOSE FOR HTML ============
window.regenerate = regenerate;
window.saveImage = saveImage;
window.togglePhysics = () => {
  physicsEnabled = !physicsEnabled;
  updateStatusDisplay();
};
window.toggleBoundingBox = () => {
  boundingBoxEnabled = !boundingBoxEnabled;
  boundingBoxMesh.visible = boundingBoxEnabled;
  if (boundingBoxEnabled) {
    physics.setBoundingBox(boundingBox);
  } else {
    physics.setBoundingBox(null);
  }
  updateStatusDisplay();
};
window.toggleAutoRotate = () => {
  autoRotate = !autoRotate;
  updateStatusDisplay();
};
window.resetPhysics = () => {
  initPhysics();
};
window.getFeatures = () => features;
window.getHash = () => hash;

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
