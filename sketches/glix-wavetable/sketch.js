// ==========================================
//   GLIX WAVETABLE GENERATOR - p5.js Visual
//   Based on GenDSP v2.8 - WebGL Isometric + Resolution Overhaul
// ==========================================

let canvas;
const DISPLAY_SIZE = 700;

// --- WebGL SHADER RENDERER ---
let glCanvas, gl, shaderProgram, vertexBuffer;
let uLocations = {};

// View mode: '2d' or 'iso'
let viewMode = '2d';

// Isometric camera state
let isoRotation = -0.7;   // rotation around Y axis (radians)
let isoTilt = 0.65;       // tilt angle (0=top-down, PI/2=side)
let isoZoom = 1.0;
let isoPanX = 0;
let isoPanY = 0;
let isoDragging = false;
let isoPanning = false;
let isoDragStartX = 0;
let isoDragStartY = 0;

// Resolution options (GPU-rendered, so higher is fine)
const RESOLUTIONS = [32, 64, 128, 256, 512, 1024, 2048];
let resolutionIndex = 6; // Default 2048
let renderSize = RESOLUTIONS[resolutionIndex];

// --- PARAMETERS (matching GenDSP) ---
let params = {
  shape: 0,           // 0=Sine, 1=Triangle, 2=Sawtooth, 3=Pulse
  pw: 1.0,            // Pulse width / Phase shift (0-1)
  soften: 5.0,        // Soft saturation (0.001-50)
  y_bend: 0.0,        // Warp morph speed (-0.25 to 1.0)
  fx_bend: 0.0,       // X-axis phase warp (-1 to 1000)
  fx_noise: 0.0,      // Static dirt (0-1)
  fx_quantize: 0.0,   // Pixelate (0-1)
  pw_morph: 0.0,      // Spiraling / PWM shift (-50 to 50)
  fx_fold: 100.0,     // Wavefolder (0-10000)
  fold_mode: 0,       // 0=GenDSP (aggressive sine), 1=Gentle (soft sine), 2=Triangle fold
  fx_crush: 0.0,      // Bitcrush (0-1)
  wave_mirror: 0,     // Mirror phase (0 or 1)
  wave_invert: 0      // Invert output (0 or 1)
};

// Animation targets (for smooth interpolation)
let targetParams = { ...params };
let animSpeed = 0.3;
let driftAmount = 0.5;

// Parameter locks — locked params are not updated by animation
const ANIM_PARAMS = ['pw','soften','y_bend','fx_bend','fx_noise','fx_quantize','pw_morph','fx_fold','fx_crush'];
let paramLocks = {};
for (let k of ANIM_PARAMS) paramLocks[k] = false;

// Set target param only if unlocked
function setTarget(key, val) {
  if (!paramLocks[key]) targetParams[key] = val;
}

// Lock count categories: how many params to animate (rest are locked)
// 0=couple(2-3), 1=multiple(4-5), 2=almost all(7-8), 3=all(9)
let lockCategory = 3; // default: all animate
const LOCK_CATEGORIES = [
  { name: 'Couple', count: [2, 3] },
  { name: 'Multiple', count: [4, 5] },
  { name: 'Most', count: [7, 8] },
  { name: 'All', count: 9 }
];

function applyRandomLocks() {
  let cat = LOCK_CATEGORIES[lockCategory];
  let animCount;
  if (Array.isArray(cat.count)) {
    animCount = cat.count[0] + floor(random(cat.count[1] - cat.count[0] + 1));
  } else {
    animCount = cat.count;
  }
  // Shuffle param list and pick which ones to animate
  let shuffled = [...ANIM_PARAMS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  for (let i = 0; i < ANIM_PARAMS.length; i++) {
    paramLocks[shuffled[i]] = i >= animCount;
  }
}
let isAnimating = true;
let animTime = 0;

// Animation modes: 'drift', 'lfo', 'chaos', 'sequencer', 'bounce'
let animMode = 'drift';

// Animation range: per-param interpolation speed multiplier
const ANIM_RANGES = [1.0, 0.1, 0.01];
const ANIM_RANGE_LABELS = ['Full', '1/10', '1/100'];
let animRangeIndex = 0; // for UI button state
let paramRanges = {};
for (let k of ['pw','soften','y_bend','fx_bend','fx_noise','fx_quantize','pw_morph','fx_fold','fx_crush']) paramRanges[k] = 1.0;
const ANIM_MODES = ['drift', 'lfo', 'chaos', 'sequencer', 'bounce'];

// Exponential mapping for large-range params (more resolution at low end)
const EXP_K = 4;
const EXP_DENOM = Math.exp(EXP_K) - 1;
function expMap(t, mn, mx) {
  t = Math.max(0, Math.min(1, t));
  return mn + (mx - mn) * (Math.exp(EXP_K * t) - 1) / EXP_DENOM;
}
function logMap(val, mn, mx) {
  let t = Math.max(0, Math.min(1, (val - mn) / (mx - mn)));
  return Math.log(1 + t * EXP_DENOM) / EXP_K;
}

// Chaos (Lorenz attractor state)
let lorenzX = 1.0, lorenzY = 1.0, lorenzZ = 1.0;

// Sequencer state
let seqStep = 0;
let seqTimer = 0;
const SEQ_PRESETS = [
  { shape:0, pw:0.5, soften:5, y_bend:0, fx_bend:0, fx_noise:0, fx_quantize:0, pw_morph:0, fx_fold:100, fx_crush:0 },
  { shape:0, pw:0.5, soften:3, y_bend:0.5, fx_bend:200, fx_noise:0, fx_quantize:0, pw_morph:10, fx_fold:500, fx_crush:0 },
  { shape:2, pw:0.3, soften:8, y_bend:0.2, fx_bend:0, fx_noise:0.3, fx_quantize:0.4, pw_morph:-20, fx_fold:2000, fx_crush:0 },
  { shape:7, pw:0.8, soften:15, y_bend:-0.1, fx_bend:400, fx_noise:0, fx_quantize:0, pw_morph:30, fx_fold:100, fx_crush:0.6 },
  { shape:1, pw:0.6, soften:2, y_bend:0.8, fx_bend:100, fx_noise:0.1, fx_quantize:0.2, pw_morph:-15, fx_fold:4000, fx_crush:0 },
  { shape:4, pw:0.4, soften:25, y_bend:0, fx_bend:600, fx_noise:0, fx_quantize:0, pw_morph:0, fx_fold:800, fx_crush:0.8 },
  { shape:6, pw:0.9, soften:1, y_bend:0.3, fx_bend:0, fx_noise:0.5, fx_quantize:0.6, pw_morph:40, fx_fold:6000, fx_crush:0 },
  { shape:5, pw:0.2, soften:40, y_bend:-0.2, fx_bend:800, fx_noise:0, fx_quantize:0, pw_morph:-40, fx_fold:200, fx_crush:0.9 },
];

// Bounce state
let bouncePhases = {};
(function() {
  let keys = ['pw','soften','y_bend','fx_bend','fx_noise','fx_quantize','pw_morph','fx_fold','fx_crush'];
  for (let k of keys) bouncePhases[k] = Math.random() * Math.PI * 2;
})();

// Post-processing flags
let ppDither = false;    // Ordered Bayer dithering
let ppDitherScale = 1;   // Dither cell size: 0=fine(1px), 1=medium(2px), 2=coarse(4px), 3=chunky(8px)
let ppScanlines = false; // CRT scanlines
let ppPosterize = false; // Reduce color depth
let ppGrain = false;     // Film grain
let ppSuperSample = false; // 2x supersampling AA

// Rendering throttle (30fps max for wavetable)
const TARGET_UPDATE_FPS = 30;
let lastRenderTime = 0;
let needsRender = true;

// Color palettes
const palettes = {
  thermal: [
    [0, 0, 0],
    [40, 0, 80],
    [120, 0, 120],
    [200, 50, 50],
    [255, 150, 0],
    [255, 255, 100],
    [255, 255, 255]
  ],
  ocean: [
    [10, 10, 30],
    [20, 40, 80],
    [30, 80, 120],
    [50, 150, 180],
    [100, 200, 220],
    [180, 240, 255],
    [255, 255, 255]
  ],
  neon: [
    [10, 0, 20],
    [80, 0, 120],
    [255, 0, 150],
    [0, 255, 200],
    [255, 255, 0],
    [255, 100, 255],
    [255, 255, 255]
  ],
  sunset: [
    [20, 10, 30],
    [60, 20, 60],
    [120, 40, 80],
    [200, 80, 60],
    [255, 150, 50],
    [255, 200, 100],
    [255, 240, 200]
  ],
  monochrome: [
    [0, 0, 0],
    [30, 30, 35],
    [60, 60, 70],
    [100, 100, 110],
    [150, 150, 160],
    [200, 200, 210],
    [255, 255, 255]
  ],
  plasma: [
    [10, 0, 30],
    [50, 0, 100],
    [150, 0, 200],
    [255, 50, 150],
    [255, 150, 100],
    [255, 220, 150],
    [255, 255, 255]
  ],
  rainbow: [
    [100, 0, 150],
    [0, 0, 255],
    [0, 200, 255],
    [0, 255, 100],
    [255, 255, 0],
    [255, 150, 0],
    [255, 50, 50]
  ],
  // --- NEW PALETTES ---
  inferno: [
    [0, 0, 4],
    [40, 11, 84],
    [101, 21, 110],
    [159, 42, 99],
    [212, 72, 66],
    [245, 125, 21],
    [252, 255, 164]
  ],
  viridis: [
    [68, 1, 84],
    [72, 35, 116],
    [49, 104, 142],
    [33, 145, 140],
    [53, 183, 121],
    [144, 215, 67],
    [253, 231, 37]
  ],
  ember: [
    [20, 5, 0],
    [60, 10, 0],
    [140, 30, 0],
    [200, 60, 0],
    [255, 120, 20],
    [255, 200, 60],
    [255, 240, 180]
  ],
  toxic: [
    [5, 10, 5],
    [10, 40, 10],
    [20, 80, 15],
    [40, 140, 20],
    [80, 200, 30],
    [160, 240, 60],
    [220, 255, 150]
  ],
  cyberpunk: [
    [10, 0, 20],
    [30, 0, 60],
    [80, 0, 160],
    [180, 0, 255],
    [255, 0, 200],
    [255, 80, 120],
    [255, 200, 220]
  ],
  forest: [
    [10, 15, 8],
    [20, 40, 15],
    [35, 70, 25],
    [55, 110, 40],
    [80, 150, 55],
    [130, 190, 80],
    [200, 230, 150]
  ],
  lavender: [
    [15, 10, 25],
    [40, 20, 70],
    [80, 50, 130],
    [130, 90, 180],
    [170, 130, 210],
    [210, 180, 235],
    [240, 225, 255]
  ],
  rust: [
    [20, 10, 5],
    [60, 25, 10],
    [120, 50, 20],
    [170, 80, 30],
    [200, 120, 50],
    [220, 170, 100],
    [240, 220, 180]
  ],
  ice: [
    [240, 250, 255],
    [200, 230, 255],
    [150, 200, 240],
    [100, 160, 220],
    [60, 120, 200],
    [30, 70, 160],
    [10, 30, 80]
  ],
  bloodmoon: [
    [5, 0, 0],
    [40, 0, 5],
    [100, 5, 10],
    [160, 15, 20],
    [200, 40, 30],
    [230, 100, 60],
    [255, 200, 150]
  ],
  mint: [
    [10, 20, 20],
    [20, 60, 55],
    [40, 110, 100],
    [80, 170, 150],
    [140, 210, 190],
    [200, 240, 220],
    [240, 255, 245]
  ],
  noir: [
    [0, 0, 0],
    [15, 15, 20],
    [35, 30, 40],
    [60, 50, 65],
    [90, 75, 95],
    [130, 110, 140],
    [180, 170, 190]
  ],
  // --- CHAOTIC / NON-GRADIENT PALETTES ---
  glitch: [
    [255, 0, 0],
    [0, 0, 0],
    [0, 255, 255],
    [255, 255, 255],
    [255, 0, 255],
    [0, 0, 0],
    [0, 255, 0]
  ],
  vhs: [
    [20, 20, 200],
    [200, 200, 50],
    [10, 10, 10],
    [200, 30, 30],
    [50, 200, 200],
    [180, 20, 180],
    [240, 240, 240]
  ],
  pop: [
    [255, 50, 50],
    [255, 220, 0],
    [50, 50, 255],
    [255, 50, 50],
    [0, 200, 100],
    [255, 220, 0],
    [50, 50, 255]
  ],
  zebra: [
    [0, 0, 0],
    [255, 255, 255],
    [0, 0, 0],
    [255, 255, 255],
    [0, 0, 0],
    [255, 255, 255],
    [0, 0, 0]
  ],
  acidhouse: [
    [0, 0, 0],
    [0, 255, 0],
    [255, 255, 0],
    [0, 0, 0],
    [255, 0, 255],
    [0, 255, 0],
    [255, 255, 0]
  ],
  bubblegum: [
    [255, 100, 200],
    [100, 200, 255],
    [255, 220, 100],
    [200, 100, 255],
    [100, 255, 180],
    [255, 100, 100],
    [100, 200, 255]
  ],
  terminal: [
    [0, 0, 0],
    [0, 40, 0],
    [0, 255, 0],
    [0, 0, 0],
    [0, 180, 0],
    [0, 255, 0],
    [200, 255, 200]
  ],
  neotokyo: [
    [5, 5, 20],
    [255, 0, 80],
    [0, 200, 255],
    [20, 10, 40],
    [255, 200, 0],
    [0, 255, 120],
    [255, 0, 80]
  ],
  heatmap: [
    [0, 0, 80],
    [0, 0, 255],
    [0, 255, 0],
    [255, 255, 0],
    [255, 0, 0],
    [255, 0, 0],
    [255, 255, 255]
  ],
  candy: [
    [255, 255, 255],
    [255, 80, 120],
    [255, 255, 255],
    [120, 200, 255],
    [255, 255, 255],
    [255, 200, 80],
    [255, 255, 255]
  ],
  // --- STRUCTURALLY UNIQUE PALETTES ---
  duotone: [
    [15, 10, 50],
    [15, 10, 50],
    [15, 10, 50],
    [220, 90, 40],
    [220, 90, 40],
    [220, 90, 40],
    [220, 90, 40]
  ],
  banded: [
    [10, 10, 30],
    [200, 180, 255],
    [20, 15, 40],
    [255, 200, 100],
    [10, 10, 30],
    [180, 255, 200],
    [20, 15, 40]
  ],
  coal: [
    [8, 5, 5],
    [18, 12, 10],
    [30, 18, 14],
    [42, 25, 18],
    [55, 32, 22],
    [65, 40, 28],
    [80, 50, 35]
  ],
  neonline: [
    [0, 0, 0],
    [0, 0, 5],
    [0, 255, 255],
    [255, 255, 255],
    [255, 0, 200],
    [5, 0, 5],
    [0, 0, 0]
  ],
  pastel: [
    [210, 130, 155],
    [130, 150, 210],
    [140, 200, 130],
    [220, 170, 120],
    [120, 195, 195],
    [200, 140, 190],
    [160, 155, 215]
  ],
  split: [
    [0, 20, 80],
    [0, 60, 160],
    [0, 120, 220],
    [255, 255, 255],
    [220, 40, 0],
    [160, 20, 0],
    [80, 10, 0]
  ],
  prism: [
    [120, 0, 0],
    [200, 80, 0],
    [220, 200, 0],
    [0, 180, 40],
    [0, 100, 200],
    [80, 0, 180],
    [140, 0, 120]
  ]
};

let currentPalette = 'thermal';
let paletteNames = Object.keys(palettes);
let hueShift = 0; // 0-360 degrees
let pixelBuffer;

// Hue shift via Rodrigues rotation (CPU-side)
function hueShiftRGB(r, g, b, deg) {
  if (Math.abs(deg) < 0.5) return [r, g, b];
  let angle = deg * 0.01745329252;
  let cosA = Math.cos(angle), sinA = Math.sin(angle);
  let k = 0.57735026919;
  let nr = r * cosA + (k * b - k * g) * sinA + k * (k * r + k * g + k * b) * (1 - cosA);
  let ng = g * cosA + (k * r - k * b) * sinA + k * (k * r + k * g + k * b) * (1 - cosA);
  // correction: use proper cross product
  // cross((k,k,k), (r,g,b)) = (k*b - k*g, k*r - k*b, k*g - k*r)
  let nb = b * cosA + (k * g - k * r) * sinA + k * (k * r + k * g + k * b) * (1 - cosA);
  return [constrain(nr, 0, 255), constrain(ng, 0, 255), constrain(nb, 0, 255)];
}

// --- GLSL SHADER SOURCE ---
const VERT_SRC = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG_SRC = `
precision highp float;
varying vec2 v_uv;

uniform float u_shape;
uniform float u_pw;
uniform float u_soften;
uniform float u_y_bend;
uniform float u_fx_bend;
uniform float u_fx_noise;
uniform float u_fx_quantize;
uniform float u_pw_morph;
uniform float u_fx_fold;
uniform float u_fold_mode;
uniform float u_fx_crush;
uniform float u_size;
uniform float u_pp_dither;
uniform float u_pp_dither_scale;
uniform float u_pp_scanlines;
uniform float u_pp_posterize;
uniform float u_pp_grain;
uniform float u_time;
uniform float u_canvas_size;
uniform vec3 u_palette[7];
uniform float u_hue_shift;
uniform float u_wave_mirror;
uniform float u_wave_invert;

float fract2(float x) { return x - floor(x); }

float tanh_approx(float x) {
  if (x > 3.0) return 1.0;
  if (x < -3.0) return -1.0;
  float x2 = x * x;
  return x * (27.0 + x2) / (27.0 + 9.0 * x2);
}

float smoothstep2(float edge0, float edge1, float x) {
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

float generateSample(float raw_phase, float scan_pos) {
  // Y-WARP
  if (abs(u_y_bend) > 0.001) {
    float power = pow(2.0, u_y_bend * -2.5);
    scan_pos = pow(scan_pos, power);
  }

  // STATIC NOISE
  float noisy_phase = raw_phase;
  if (u_fx_noise > 0.0) {
    float hash = fract2(sin(raw_phase * 12.9898) * 43758.5453);
    float dirt = (hash * 2.0 - 1.0) * (u_fx_noise * 0.1);
    noisy_phase = raw_phase + dirt;
  }

  // QUANTIZE
  float quant_phase = noisy_phase;
  if (u_fx_quantize > 0.0) {
    float q_val = pow(u_fx_quantize, 0.5);
    float steps = 2.0 + (1.0 - q_val) * 100.0;
    quant_phase = floor(noisy_phase * steps) / steps;
  }

  // PHASE BEND
  float current_bend = u_fx_bend * scan_pos;
  float final_phase = quant_phase;
  if (abs(current_bend) > 0.001) {
    float bend_fact = 1.0 - (current_bend * 0.01);
    float safe_phase = clamp(quant_phase, 0.0001, 0.9999);
    if (safe_phase < 0.5) {
      final_phase = pow(safe_phase * 2.0, bend_fact) * 0.5;
    } else {
      final_phase = 1.0 - pow((1.0 - safe_phase) * 2.0, bend_fact) * 0.5;
    }
  }

  // MIRROR (flip phase)
  if (u_wave_mirror > 0.5) final_phase = 1.0 - final_phase;

  // WAVEFORM
  float morph_amt = u_pw_morph * scan_pos * 0.1;
  float shift_val = (u_pw - 0.5) + morph_amt;
  float shifted_phase = fract2(final_phase + shift_val);
  int sel = int(floor(u_shape));
  float samp = 0.0;

  if (sel == 0) {
    samp = sin(shifted_phase * 6.28318530718);
  } else if (sel == 1) {
    samp = 1.0 - abs((shifted_phase * 2.0) - 1.0) * 2.0;
  } else if (sel == 2) {
    samp = (shifted_phase * 2.0) - 1.0;
  } else if (sel == 3) {
    float cw = clamp(u_pw + morph_amt, 0.0, 1.0);
    samp = final_phase < cw ? 1.0 : -1.0;
  } else if (sel == 4) {
    samp = sin(shifted_phase * 6.28318530718);
    samp = samp > 0.0 ? samp * 2.0 - 1.0 : -1.0;
  } else if (sel == 5) {
    samp = sin(shifted_phase * 6.28318530718);
    samp = floor(samp * 4.0) / 4.0;
  } else if (sel == 6) {
    float t = shifted_phase * 2.0 - 1.0;
    samp = 1.0 - 2.0 * t * t;
  } else if (sel == 7) {
    float s1 = fract2(shifted_phase) * 2.0 - 1.0;
    float s2 = fract2(shifted_phase * 1.006 + 0.1) * 2.0 - 1.0;
    float s3 = fract2(shifted_phase * 0.994 + 0.2) * 2.0 - 1.0;
    samp = (s1 + s2 + s3) / 3.0;
  } else if (sel == 8) {
    // Schrodinger: 1D quantum wavefunction
    float n = 1.0 + scan_pos * 7.0;
    float n_lo = floor(n);
    float n_hi = n_lo + 1.0;
    float frac_n = n - n_lo;
    float psi_lo = sin(n_lo * 3.14159265 * shifted_phase);
    float psi_hi = sin(n_hi * 3.14159265 * shifted_phase);
    samp = psi_lo * (1.0 - frac_n) + psi_hi * frac_n;
  } else if (sel == 9) {
    // Chebyshev: T_n(x) = cos(n * acos(x))
    float x = shifted_phase * 2.0 - 1.0;
    x = clamp(x, -0.999, 0.999);
    float n = 1.0 + scan_pos * 7.0;
    float n_lo = floor(n);
    float n_hi = n_lo + 1.0;
    float frac_n = n - n_lo;
    float t_lo = cos(n_lo * acos(x));
    float t_hi = cos(n_hi * acos(x));
    samp = t_lo * (1.0 - frac_n) + t_hi * frac_n;
  } else if (sel == 10) {
    // FM Synthesis: sin(2πφ + index * sin(2π * ratio * φ))
    float mod_index = scan_pos * 8.0;
    float ratio = 2.0 + (u_pw - 0.5) * 2.0;
    samp = sin(6.28318530718 * shifted_phase + mod_index * sin(6.28318530718 * ratio * shifted_phase));
  } else if (sel == 11) {
    // Harmonic Series: sum sin(k*2πφ)/k
    float num_h = 1.0 + scan_pos * 15.0;
    float n_lo_h = floor(num_h);
    float frac_h = num_h - n_lo_h;
    samp = 0.0;
    for (int k = 1; k <= 16; k++) {
      float fk = float(k);
      if (fk > n_lo_h + 1.0) break;
      float amp = fk <= n_lo_h ? 1.0 : frac_h;
      samp += amp * sin(fk * 6.28318530718 * shifted_phase) / fk;
    }
    samp *= 0.63;
  } else if (sel == 12) {
    // Fractal (Weierstrass): sum sin(b^n * π * φ) / a^n
    // Morph sweeps octave count 1-12, PW controls frequency ratio b
    float b = 2.0 + u_pw * 3.0; // freq ratio 2-5
    float a = 1.5; // amplitude decay
    float num_oct = 1.0 + scan_pos * 11.0;
    float n_lo_f = floor(num_oct);
    float frac_f = num_oct - n_lo_f;
    samp = 0.0;
    float bn = 1.0; // b^n
    float an = 1.0; // a^n
    for (int n = 0; n < 12; n++) {
      float fn = float(n);
      if (fn > n_lo_f + 1.0) break;
      float amp = fn <= n_lo_f ? 1.0 : frac_f;
      samp += amp * sin(bn * 3.14159265 * shifted_phase) / an;
      bn *= b;
      an *= a;
    }
    samp *= 0.5; // normalize
  } else if (sel == 13) {
    // Chirp: sin(2π * φ^k), frequency accelerates across cycle
    // Morph sweeps exponent k from 1-8
    float k = 1.0 + scan_pos * 7.0;
    float chirp_phase = pow(clamp(shifted_phase, 0.001, 0.999), k);
    samp = sin(chirp_phase * 6.28318530718);
  } else if (sel == 14) {
    // Formant: gaussian-windowed harmonics (vocal resonance)
    // Morph sweeps formant frequency, PW controls bandwidth
    float formant_freq = 2.0 + scan_pos * 14.0; // center harmonic 2-16
    float bw = 0.3 + u_pw * 1.2; // bandwidth 0.3-1.5
    samp = 0.0;
    for (int k = 1; k <= 16; k++) {
      float fk = float(k);
      float dist = (fk - formant_freq) / bw;
      float env = exp(-0.5 * dist * dist); // gaussian window
      samp += env * sin(fk * 6.28318530718 * shifted_phase);
    }
    samp *= 0.4; // normalize
  } else if (sel == 15) {
    // Chaos (Logistic map): x = r*x*(1-x) iterated
    // Phase → initial x, morph → r parameter (2.5-4.0)
    float r = 2.5 + scan_pos * 1.5;
    float x = clamp(shifted_phase, 0.01, 0.99);
    // Iterate 24 times, use last value
    for (int i = 0; i < 24; i++) {
      x = r * x * (1.0 - x);
    }
    samp = x * 2.0 - 1.0; // map 0-1 to -1..1
  }

  // INVERT (flip output)
  if (u_wave_invert > 0.5) samp = -samp;

  // SOFT SATURATION
  samp = tanh_approx(samp * u_soften);

  // BITCRUSH
  float current_crush = u_fx_crush * scan_pos;
  if (current_crush > 0.0) {
    float c_steps = max(1.0, 2.0 + (1.0 - current_crush) * 50.0);
    samp = floor(samp * c_steps) / c_steps;
  }

  // WAVEFOLDER
  float current_fold = u_fx_fold * scan_pos;
  if (current_fold > 0.0) {
    int fm = int(u_fold_mode);
    if (fm == 0) {
      // GenDSP original: aggressive sine drive
      float drive = 1.0 + (current_fold * 8.0);
      float safe_in = clamp(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm == 1) {
      // Gentle: soft sine drive
      float drive = 1.0 + (current_fold * 0.008);
      float safe_in = clamp(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm == 2) {
      // Gentle: soft sine drive
      float drive = 1.0 + (current_fold * 0.1);
      float safe_in = clamp(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm == 3) {
      // Gentle: soft sine drive
      float drive = 1.0 + (current_fold * 1.0);
      float safe_in = clamp(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else {
      // Triangle fold: linear fold-back
      float drive = 1.0 + (current_fold * 2.0);
      float folded = samp * drive;
      folded = folded - 4.0 * floor((folded + 1.0) / 4.0);
      if (abs(folded) > 1.0) {
        folded = folded > 0.0 ? 2.0 - folded : -2.0 - folded;
      }
      samp = clamp(folded, -1.0, 1.0);
    }
  }

  return clamp(samp, -1.0, 1.0);
}

vec3 paletteAt(int i) {
  if (i <= 0) return u_palette[0];
  if (i == 1) return u_palette[1];
  if (i == 2) return u_palette[2];
  if (i == 3) return u_palette[3];
  if (i == 4) return u_palette[4];
  if (i == 5) return u_palette[5];
  return u_palette[6];
}

vec3 getPaletteColor(float t) {
  t = clamp(t, 0.0, 1.0);
  float scaledT = t * 6.0;
  int idx = int(floor(scaledT));
  float f = scaledT - floor(scaledT);
  return mix(paletteAt(idx), paletteAt(idx + 1), f);
}

// 4x4 Bayer dithering matrix
float bayerMatrix(vec2 pos) {
  int x = int(mod(pos.x, 4.0));
  int y = int(mod(pos.y, 4.0));
  int idx = x + y * 4;
  // Unrolled Bayer 4x4
  if (idx == 0) return 0.0/16.0;    if (idx == 1) return 8.0/16.0;
  if (idx == 2) return 2.0/16.0;    if (idx == 3) return 10.0/16.0;
  if (idx == 4) return 12.0/16.0;   if (idx == 5) return 4.0/16.0;
  if (idx == 6) return 14.0/16.0;   if (idx == 7) return 6.0/16.0;
  if (idx == 8) return 3.0/16.0;    if (idx == 9) return 11.0/16.0;
  if (idx == 10) return 1.0/16.0;   if (idx == 11) return 9.0/16.0;
  if (idx == 12) return 15.0/16.0;  if (idx == 13) return 7.0/16.0;
  if (idx == 14) return 13.0/16.0;
  return 5.0/16.0;
}

void main() {
  float raw_phase = (v_uv.x * u_size + 1.0) / (u_size + 1.0);
  float scan_pos = (v_uv.y * u_size + 1.0) / (u_size + 1.0);
  float sample_val = generateSample(raw_phase, scan_pos);
  float colorVal = (sample_val + 1.0) * 0.5;
  vec3 col = getPaletteColor(colorVal);

  // Hue shift via Rodrigues rotation around (1,1,1)/sqrt(3) axis in RGB space
  if (abs(u_hue_shift) > 0.5) {
    float angle = u_hue_shift * 0.01745329252; // deg to rad
    float cosA = cos(angle);
    float sinA = sin(angle);
    float k = 0.57735026919; // 1/sqrt(3)
    vec3 kv = vec3(k);
    col = col * cosA + cross(kv, col) * sinA + kv * dot(kv, col) * (1.0 - cosA);
    col = clamp(col, 0.0, 1.0);
  }

  vec2 pixCoord = v_uv * u_canvas_size;

  // Ordered dithering (scaled cell size)
  if (u_pp_dither > 0.5) {
    vec2 ditherCoord = floor(pixCoord / u_pp_dither_scale);
    float dith = bayerMatrix(ditherCoord) - 0.5;
    col += dith * (0.06 + u_pp_dither_scale * 0.015);
  }

  // Posterize (reduce to N color levels)
  if (u_pp_posterize > 0.5) {
    float levels = 6.0;
    col = floor(col * levels + 0.5) / levels;
  }

  // Scanlines
  if (u_pp_scanlines > 0.5) {
    float line = mod(pixCoord.y, 3.0);
    if (line < 1.0) col *= 0.7;
  }

  // Film grain
  if (u_pp_grain > 0.5) {
    float grain = fract2(sin(dot(pixCoord + u_time, vec2(12.9898, 78.233))) * 43758.5453);
    col += (grain - 0.5) * 0.12;
  }

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

// --- ISOMETRIC 3D WEBGL SHADER ---
const ISO_VERT_SRC = `
attribute vec2 a_pos;
attribute float a_depth;
attribute vec3 a_color;
varying vec3 v_color;
void main() {
  v_color = a_color;
  gl_Position = vec4(a_pos, a_depth, 1.0);
}`;

const ISO_FRAG_SRC = `
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`;

// Isometric WebGL resources
let isoShaderProgram = null;
let isoVBO = null, isoIBO = null;
let isoAttrLocs = {};
const ISO_MAX_GRID = 512;
const ISO_STRIDE = 6; // floats per vertex: x, y, depth, r, g, b
let isoUintExt = null;

function initIsoWebGL() {
  if (!gl) return false;

  // Compile isometric shaders
  let vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, ISO_VERT_SRC);
  gl.compileShader(vs);
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    console.error('Iso Vertex:', gl.getShaderInfoLog(vs));
    return false;
  }

  let fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, ISO_FRAG_SRC);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error('Iso Fragment:', gl.getShaderInfoLog(fs));
    return false;
  }

  isoShaderProgram = gl.createProgram();
  gl.attachShader(isoShaderProgram, vs);
  gl.attachShader(isoShaderProgram, fs);
  gl.linkProgram(isoShaderProgram);
  if (!gl.getProgramParameter(isoShaderProgram, gl.LINK_STATUS)) {
    console.error('Iso Link:', gl.getProgramInfoLog(isoShaderProgram));
    return false;
  }

  isoAttrLocs.a_pos = gl.getAttribLocation(isoShaderProgram, 'a_pos');
  isoAttrLocs.a_depth = gl.getAttribLocation(isoShaderProgram, 'a_depth');
  isoAttrLocs.a_color = gl.getAttribLocation(isoShaderProgram, 'a_color');

  // OES_element_index_uint for >65k vertices
  isoUintExt = gl.getExtension('OES_element_index_uint');

  // Pre-allocate VBO and IBO at max size
  let maxVerts = (ISO_MAX_GRID + 1) * (ISO_MAX_GRID + 1);
  let maxIndices = ISO_MAX_GRID * ISO_MAX_GRID * 6; // 2 triangles * 3 indices per cell

  isoVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, isoVBO);
  gl.bufferData(gl.ARRAY_BUFFER, maxVerts * ISO_STRIDE * 4, gl.DYNAMIC_DRAW);

  isoIBO = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, isoIBO);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, maxIndices * 4, gl.DYNAMIC_DRAW);

  return true;
}

function initWebGL() {
  glCanvas = document.createElement('canvas');
  glCanvas.width = renderSize;
  glCanvas.height = renderSize;
  gl = glCanvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) {
    console.warn('WebGL not available, falling back to CPU');
    return false;
  }

  // Compile shaders
  let vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, VERT_SRC);
  gl.compileShader(vs);
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    console.error('Vertex:', gl.getShaderInfoLog(vs));
    return false;
  }

  let fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, FRAG_SRC);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error('Fragment:', gl.getShaderInfoLog(fs));
    return false;
  }

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vs);
  gl.attachShader(shaderProgram, fs);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Link:', gl.getProgramInfoLog(shaderProgram));
    return false;
  }
  gl.useProgram(shaderProgram);

  // Fullscreen quad
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  let aPos = gl.getAttribLocation(shaderProgram, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Cache uniform locations
  let names = ['u_shape','u_pw','u_soften','u_y_bend','u_fx_bend','u_fx_noise',
               'u_fx_quantize','u_pw_morph','u_fx_fold','u_fold_mode','u_fx_crush','u_size',
               'u_pp_dither','u_pp_dither_scale','u_pp_scanlines','u_pp_posterize','u_pp_grain','u_time','u_canvas_size','u_hue_shift',
               'u_wave_mirror','u_wave_invert'];
  for (let n of names) uLocations[n] = gl.getUniformLocation(shaderProgram, n);
  for (let i = 0; i < 7; i++) {
    uLocations['u_palette_' + i] = gl.getUniformLocation(shaderProgram, 'u_palette[' + i + ']');
  }

  return true;
}

function resizeGLCanvas() {
  if (!gl) return;
  let sz = ppSuperSample ? renderSize * 2 : renderSize;
  glCanvas.width = sz;
  glCanvas.height = sz;
  gl.viewport(0, 0, sz, sz);
  // Rebind after resize (canvas resize resets GL state)
  gl.useProgram(shaderProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  let aPos = gl.getAttribLocation(shaderProgram, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
}

let useWebGL = false;

function setup() {
  canvas = createCanvas(DISPLAY_SIZE, DISPLAY_SIZE);
  canvas.parent('sketch-holder');
  pixelDensity(1);
  noSmooth();

  useWebGL = initWebGL();
  if (useWebGL) initIsoWebGL();
  if (!useWebGL) createPixelBuffer();
  setupUI();
  updateColorPreview();
  updateResolutionDisplay();

  // Show renderer info
  let ri = document.getElementById('renderer-indicator');
  if (ri) ri.textContent = useWebGL ? 'GPU (WebGL)' : 'CPU (fallback)';
}

function createPixelBuffer() {
  pixelBuffer = createGraphics(renderSize, renderSize);
  pixelBuffer.pixelDensity(1);
  if (useWebGL) resizeGLCanvas();
  needsRender = true;
}

function draw() {
  let currentTime = millis();
  animTime += deltaTime * 0.001;

  if (isAnimating) {
    updateAnimation();
    interpolateParams();
    needsRender = true;
  }

  // Throttle rendering to TARGET_UPDATE_FPS
  let timeSinceRender = currentTime - lastRenderTime;
  if (needsRender && timeSinceRender >= 1000 / TARGET_UPDATE_FPS) {
    if (viewMode === '2d') {
      renderWavetable();
    }
    lastRenderTime = currentTime;
    needsRender = false;
  }

  // Draw
  if (viewMode === '2d') {
    if (useWebGL) {
      drawingContext.imageSmoothingEnabled = smoothUpscale;
      drawingContext.drawImage(glCanvas, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
    } else {
      drawingContext.imageSmoothingEnabled = !smoothUpscale ? false : true;
      image(pixelBuffer, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
    }
  } else {
    // Isometric always re-renders (camera may be dragging)
    renderIsometric();
  }
}

// --- ANIMATION SYSTEM ---
function updateAnimation() {
  switch (animMode) {
    case 'drift': animDrift(); break;
    case 'lfo': animLFO(); break;
    case 'chaos': animChaos(); break;
    case 'sequencer': animSequencer(); break;
    case 'bounce': animBounce(); break;
  }
}

// MODE: Perlin noise drift (original)
function animDrift() {
  let drift = driftAmount;
  let speed = animSpeed * 0.1;
  setTarget('y_bend', map(noise(animTime * speed * 0.3), 0, 1, -0.25, 1.0) * drift);
  setTarget('fx_bend', expMap(noise(animTime * speed * 0.2 + 100), 0, 500) * drift);
  setTarget('pw_morph', map(noise(animTime * speed * 0.4 + 200), 0, 1, -25, 25) * drift);
  setTarget('fx_fold', expMap(noise(animTime * speed * 0.15 + 300), 0, 2000) * drift + 100 * (1 - drift));
  setTarget('pw', map(noise(animTime * speed * 0.5 + 400), 0, 1, 0.2, 1.0));
  setTarget('fx_noise', map(noise(animTime * speed * 0.25 + 500), 0, 1, 0, 0.3) * drift);
  setTarget('fx_quantize', map(noise(animTime * speed * 0.2 + 600), 0, 1, 0, 0.5) * drift);
  setTarget('soften', map(noise(animTime * speed * 0.35 + 700), 0, 1, 1, 20));
}

// MODE: Synced LFO oscillation (rhythmic, musical)
function animLFO() {
  let t = animTime * animSpeed * 0.5;
  let d = driftAmount;
  setTarget('pw', 0.5 + Math.sin(t * 0.7) * 0.4 * d);
  setTarget('soften', 10 + Math.sin(t * 0.3) * 9 * d);
  setTarget('y_bend', Math.sin(t * 0.2) * 0.5 * d);
  setTarget('fx_bend', expMap(Math.sin(t * 0.15) * 0.5 + 0.5, 0, 400) * d);
  setTarget('pw_morph', Math.sin(t * 0.4) * 30 * d);
  setTarget('fx_fold', expMap(Math.sin(t * 0.1) * 0.5 + 0.5, 0, 3000) * d + 100 * (1 - d));
  setTarget('fx_noise', (Math.sin(t * 0.6) * 0.5 + 0.5) * 0.3 * d);
  setTarget('fx_quantize', (Math.sin(t * 0.25) * 0.5 + 0.5) * 0.4 * d);
  setTarget('fx_crush', expMap(Math.sin(t * 0.08) * 0.5 + 0.5, 0, 1) * d);
}

// MODE: Lorenz attractor (chaotic, unpredictable but structured)
function animChaos() {
  let dt = 0.005 * animSpeed;
  let sigma = 10, rho = 28, beta = 8/3;
  let d = driftAmount;
  let dx = sigma * (lorenzY - lorenzX) * dt;
  let dy = (lorenzX * (rho - lorenzZ) - lorenzY) * dt;
  let dz = (lorenzX * lorenzY - beta * lorenzZ) * dt;
  lorenzX += dx; lorenzY += dy; lorenzZ += dz;
  let nx = lorenzX / 20, ny = lorenzY / 25, nz = (lorenzZ - 25) / 20;
  setTarget('pw', 0.5 + nx * 0.4 * d);
  setTarget('soften', 10 + ny * 15 * d);
  setTarget('y_bend', nx * 0.5 * d);
  setTarget('fx_bend', expMap((nz + 1) * 0.5, 0, 500) * d);
  setTarget('pw_morph', ny * 30 * d);
  setTarget('fx_fold', expMap(Math.abs(nz), 0, 4000) * d + 100 * (1 - d));
  setTarget('fx_noise', Math.abs(nx) * 0.3 * d);
  setTarget('fx_quantize', Math.abs(ny) * 0.4 * d);
  setTarget('fx_crush', expMap(Math.abs(nz), 0, 1) * d);
}

// MODE: Step sequencer (morph between presets)
function animSequencer() {
  let stepDur = 4.0 / animSpeed;
  seqTimer += deltaTime * 0.001;
  if (seqTimer >= stepDur) {
    seqTimer -= stepDur;
    seqStep = (seqStep + 1) % SEQ_PRESETS.length;
    // Only change shape on step transitions
    let preset = SEQ_PRESETS[seqStep];
    targetParams.shape = preset.shape;
    params.shape = preset.shape;
    updateShapeButtons();
  }
  let preset = SEQ_PRESETS[seqStep];
  let nextPreset = SEQ_PRESETS[(seqStep + 1) % SEQ_PRESETS.length];
  let t = seqTimer / stepDur;
  t = t * t * (3 - 2 * t); // smoothstep ease
  let d = driftAmount;
  setTarget('pw', lerp(preset.pw, nextPreset.pw, t * d));
  setTarget('soften', lerp(preset.soften, nextPreset.soften, t * d));
  setTarget('y_bend', lerp(preset.y_bend, nextPreset.y_bend, t * d));
  setTarget('fx_bend', lerp(preset.fx_bend, nextPreset.fx_bend, t * d));
  setTarget('fx_noise', lerp(preset.fx_noise, nextPreset.fx_noise, t * d));
  setTarget('fx_quantize', lerp(preset.fx_quantize, nextPreset.fx_quantize, t * d));
  setTarget('pw_morph', lerp(preset.pw_morph, nextPreset.pw_morph, t * d));
  setTarget('fx_fold', lerp(preset.fx_fold, nextPreset.fx_fold, t * d));
  setTarget('fx_crush', lerp(preset.fx_crush, nextPreset.fx_crush, t * d));
}

// MODE: Bounce (params ping-pong at different prime-ratio rates)
function animBounce() {
  let t = animTime * animSpeed * 0.3;
  let d = driftAmount;
  setTarget('pw', map(Math.abs(Math.sin(t * 1.0 + bouncePhases.pw)), 0, 1, 0.1, 0.95) * d + 0.5 * (1 - d));
  setTarget('soften', map(Math.abs(Math.sin(t * 0.7 + bouncePhases.soften)), 0, 1, 1, 40));
  setTarget('y_bend', Math.sin(t * 0.3 + bouncePhases.y_bend) * 0.6 * d);
  setTarget('fx_bend', expMap(Math.abs(Math.sin(t * 0.2 + bouncePhases.fx_bend)), 0, 700) * d);
  setTarget('fx_noise', Math.abs(Math.sin(t * 1.3 + bouncePhases.fx_noise)) * 0.3 * d);
  setTarget('fx_quantize', Math.abs(Math.sin(t * 0.9 + bouncePhases.fx_quantize)) * 0.35 * d);
  setTarget('pw_morph', Math.sin(t * 0.5 + bouncePhases.pw_morph) * 40 * d);
  setTarget('fx_fold', expMap(Math.abs(Math.sin(t * 0.13 + bouncePhases.fx_fold)), 0, 8000) * d + 50);
  setTarget('fx_crush', expMap(Math.abs(Math.sin(t * 0.17 + bouncePhases.fx_crush)), 0, 1) * d);
}

function interpolateParams() {
  let dt = deltaTime * 0.001;
  let base = dt * animSpeed * 2;
  for (let k of ANIM_PARAMS) {
    let spd = 1.0 - pow(0.5, base * paramRanges[k]);
    params[k] = lerp(params[k], targetParams[k], spd);
  }
  updateUIValues();
}

// --- WAVETABLE GENERATOR (from GenDSP) ---
function generateSample(raw_phase, scan_pos) {
  // Y-WARP (Time Bending)
  let y_bend = params.y_bend;
  if (abs(y_bend) > 0.001) {
    let power = pow(2.0, y_bend * -2.5);
    scan_pos = pow(scan_pos, power);
  }

  // A. STATIC NOISE (Hash)
  let noisy_phase = raw_phase;
  if (params.fx_noise > 0.0) {
    let hash = fract(sin(raw_phase * 12.9898) * 43758.5453);
    let dirt = (hash * 2.0 - 1.0) * (params.fx_noise * 0.1);
    noisy_phase = raw_phase + dirt;
  }

  // B. QUANTIZE (Pixelate)
  let quant_phase = noisy_phase;
  if (params.fx_quantize > 0.0) {
    let q_val = pow(params.fx_quantize, 0.5);
    let steps = 2.0 + (1.0 - q_val) * 100.0;
    quant_phase = floor(noisy_phase * steps) / steps;
  }

  // C. PHASE BEND (Stretch)
  let current_bend = params.fx_bend * scan_pos;
  let final_phase = quant_phase;

  if (abs(current_bend) > 0.001) {
    let bend_fact = 1.0 - (current_bend * 0.01);
    let safe_phase = constrain(quant_phase, 0.0001, 0.9999);

    if (safe_phase < 0.5) {
      final_phase = pow(safe_phase * 2.0, bend_fact) * 0.5;
    } else {
      final_phase = 1.0 - pow((1.0 - safe_phase) * 2.0, bend_fact) * 0.5;
    }
  }

  // MIRROR (flip phase)
  if (params.wave_mirror) final_phase = 1.0 - final_phase;

  // WAVEFORM GENERATOR
  let morph_amt = params.pw_morph * scan_pos * 0.1;
  let shift_val = (params.pw - 0.5) + morph_amt;
  let shifted_phase = fract(final_phase + shift_val);

  let sel = floor(params.shape);
  let samp = 0.0;

  if (sel === 0) {
    // SINE
    samp = sin(shifted_phase * TWO_PI);
  } else if (sel === 1) {
    // TRIANGLE
    samp = 1.0 - abs((shifted_phase * 2.0) - 1.0) * 2.0;
  } else if (sel === 2) {
    // SAWTOOTH
    samp = (shifted_phase * 2.0) - 1.0;
  } else if (sel === 3) {
    // PULSE
    let current_width = constrain(params.pw + morph_amt, 0.0, 1.0);
    samp = final_phase < current_width ? 1.0 : -1.0;
  } else if (sel === 4) {
    // HALF-RECTIFIED SINE
    samp = sin(shifted_phase * TWO_PI);
    samp = samp > 0 ? samp * 2.0 - 1.0 : -1.0;
  } else if (sel === 5) {
    // STAIRCASE (4-step quantized sine)
    samp = sin(shifted_phase * TWO_PI);
    samp = floor(samp * 4.0) / 4.0;
  } else if (sel === 6) {
    // PARABOLIC (rounded triangle)
    let t = shifted_phase * 2.0 - 1.0;
    samp = 1.0 - 2.0 * t * t;
  } else if (sel === 7) {
    // SUPERSAW (3 detuned saws mixed)
    let s1 = fract(shifted_phase) * 2.0 - 1.0;
    let s2 = fract(shifted_phase * 1.006 + 0.1) * 2.0 - 1.0;
    let s3 = fract(shifted_phase * 0.994 + 0.2) * 2.0 - 1.0;
    samp = (s1 + s2 + s3) / 3.0;
  } else if (sel === 8) {
    // SCHRÖDINGER (1D quantum wavefunction)
    let n = 1.0 + scan_pos * 7.0;
    let n_lo = floor(n);
    let n_hi = n_lo + 1;
    let frac_n = n - n_lo;
    let psi_lo = sin(n_lo * PI * shifted_phase);
    let psi_hi = sin(n_hi * PI * shifted_phase);
    samp = psi_lo * (1.0 - frac_n) + psi_hi * frac_n;
  } else if (sel === 9) {
    // CHEBYSHEV (polynomial waveshaping)
    // T_n(x) = cos(n * arccos(x)), morph sweeps order 1→8
    let x = shifted_phase * 2.0 - 1.0;
    x = constrain(x, -0.999, 0.999);
    let n = 1.0 + scan_pos * 7.0;
    let n_lo = floor(n);
    let n_hi = n_lo + 1;
    let frac_n = n - n_lo;
    let t_lo = cos(n_lo * acos(x));
    let t_hi = cos(n_hi * acos(x));
    samp = t_lo * (1.0 - frac_n) + t_hi * frac_n;
  } else if (sel === 10) {
    // FM SYNTHESIS
    // sin(2πφ + index * sin(2π * ratio * φ)), morph sweeps index 0→8
    let mod_index = scan_pos * 8.0;
    let ratio = 2.0 + (params.pw - 0.5) * 2.0; // pw controls FM ratio (1-3)
    samp = sin(TWO_PI * shifted_phase + mod_index * sin(TWO_PI * ratio * shifted_phase));
  } else if (sel === 11) {
    // HARMONIC SERIES (additive synthesis)
    // Sum of sin(k*2πφ)/k, morph sweeps number of harmonics 1→16
    let num_h = 1.0 + scan_pos * 15.0;
    let n_lo_h = floor(num_h);
    let frac_h = num_h - n_lo_h;
    samp = 0.0;
    for (let k = 1; k <= 16; k++) {
      if (k > n_lo_h + 1) break;
      let amp = k <= n_lo_h ? 1.0 : frac_h;
      samp += amp * sin(k * TWO_PI * shifted_phase) / k;
    }
    samp *= 0.63; // normalize (harmonic series sum ≈ 1.59 at 16 terms)
  } else if (sel === 12) {
    // FRACTAL (Weierstrass): sum sin(b^n * π * φ) / a^n
    let b = 2.0 + params.pw * 3.0;
    let a = 1.5;
    let num_oct = 1.0 + scan_pos * 11.0;
    let n_lo_f = floor(num_oct);
    let frac_f = num_oct - n_lo_f;
    samp = 0.0;
    let bn = 1.0, an = 1.0;
    for (let n = 0; n < 12; n++) {
      if (n > n_lo_f + 1) break;
      let amp = n <= n_lo_f ? 1.0 : frac_f;
      samp += amp * sin(bn * PI * shifted_phase) / an;
      bn *= b;
      an *= a;
    }
    samp *= 0.5;
  } else if (sel === 13) {
    // CHIRP: sin(2π * φ^k), frequency accelerates across cycle
    let k = 1.0 + scan_pos * 7.0;
    let chirp_phase = pow(constrain(shifted_phase, 0.001, 0.999), k);
    samp = sin(chirp_phase * TWO_PI);
  } else if (sel === 14) {
    // FORMANT: gaussian-windowed harmonics (vocal resonance)
    let formant_freq = 2.0 + scan_pos * 14.0;
    let bw = 0.3 + params.pw * 1.2;
    samp = 0.0;
    for (let k = 1; k <= 16; k++) {
      let dist = (k - formant_freq) / bw;
      let env = exp(-0.5 * dist * dist);
      samp += env * sin(k * TWO_PI * shifted_phase);
    }
    samp *= 0.4;
  } else if (sel === 15) {
    // CHAOS (Logistic map): x = r*x*(1-x) iterated
    let r = 2.5 + scan_pos * 1.5;
    let x = constrain(shifted_phase, 0.01, 0.99);
    for (let i = 0; i < 24; i++) {
      x = r * x * (1.0 - x);
    }
    samp = x * 2.0 - 1.0;
  }

  // INVERT (flip output)
  if (params.wave_invert) samp = -samp;

  // Soft Saturation
  samp = tanh_approx(samp * params.soften);

  // BITCRUSH
  let current_crush = params.fx_crush * scan_pos;
  if (current_crush > 0.0) {
    let c_steps = max(1.0, 2.0 + (1.0 - current_crush) * 50.0);
    samp = floor(samp * c_steps) / c_steps;
  }

  // WAVEFOLDER
  let current_fold = params.fx_fold * scan_pos;
  if (current_fold > 0.0) {
    let fm = floor(params.fold_mode);
    if (fm === 0) {
      // GenDSP original: aggressive sine drive (multiplier 8.0)
      let drive = 1.0 + (current_fold * 8.0);
      let safe_in = constrain(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm === 1) {
      // Gentle: soft sine drive (multiplier 0.008)
      let drive = 1.0 + (current_fold * 0.008);
      let safe_in = constrain(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm === 2) {
      // Less Gentle: soft sine drive (multiplier 0.008)
      let drive = 1.0 + (current_fold * 0.1);
      let safe_in = constrain(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm === 3) {
      // Less Gentle: soft sine drive (multiplier 0.008)
      let drive = 1.0 + (current_fold * 1);
      let safe_in = constrain(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else {
      // Triangle fold: linear fold-back at ±1 boundaries
      let drive = 1.0 + (current_fold * 2.0);
      let folded = samp * drive;
      folded = folded - 4.0 * floor((folded + 1.0) / 4.0);
      samp = abs(folded) <= 1.0 ? folded : (folded > 0.0 ? 2.0 - folded : -2.0 - folded);
      samp = constrain(samp, -1.0, 1.0);
    }
  }

  // NaN check
  if (isNaN(samp)) samp = 0.0;

  return constrain(samp, -1.0, 1.0);
}

// --- RENDERING ---
function renderWavetable() {
  if (useWebGL) {
    renderWavetableGPU();
  } else {
    renderWavetableCPU();
  }
}

function renderWavetableGPU() {
  let palette = palettes[currentPalette];
  let canvasSize = ppSuperSample ? renderSize * 2 : renderSize;
  // Ensure canvas is correct size for 2D
  if (glCanvas.width !== canvasSize || glCanvas.height !== canvasSize) {
    glCanvas.width = canvasSize;
    glCanvas.height = canvasSize;
  }
  gl.viewport(0, 0, canvasSize, canvasSize);
  gl.useProgram(shaderProgram);

  // Rebind 2D fullscreen quad (may have been unbound by iso render)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  let aPos = gl.getAttribLocation(shaderProgram, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Set params
  gl.uniform1f(uLocations.u_shape, params.shape);
  gl.uniform1f(uLocations.u_pw, params.pw);
  gl.uniform1f(uLocations.u_soften, params.soften);
  gl.uniform1f(uLocations.u_y_bend, params.y_bend);
  gl.uniform1f(uLocations.u_fx_bend, params.fx_bend);
  gl.uniform1f(uLocations.u_fx_noise, params.fx_noise);
  gl.uniform1f(uLocations.u_fx_quantize, params.fx_quantize);
  gl.uniform1f(uLocations.u_pw_morph, params.pw_morph);
  gl.uniform1f(uLocations.u_fx_fold, params.fx_fold);
  gl.uniform1f(uLocations.u_fold_mode, params.fold_mode);
  gl.uniform1f(uLocations.u_fx_crush, params.fx_crush);
  gl.uniform1f(uLocations.u_size, renderSize);
  gl.uniform1f(uLocations.u_pp_dither, ppDither ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_pp_dither_scale, [1, 2, 4, 8][ppDitherScale]);
  gl.uniform1f(uLocations.u_pp_scanlines, ppScanlines ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_pp_posterize, ppPosterize ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_pp_grain, ppGrain ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_time, animTime * 100.0);
  gl.uniform1f(uLocations.u_canvas_size, canvasSize);

  // Set palette colors (normalized 0-1)
  for (let i = 0; i < 7; i++) {
    let c = palette[i] || palette[palette.length - 1];
    gl.uniform3f(uLocations['u_palette_' + i], c[0]/255, c[1]/255, c[2]/255);
  }
  gl.uniform1f(uLocations.u_hue_shift, hueShift);
  gl.uniform1f(uLocations.u_wave_mirror, params.wave_mirror);
  gl.uniform1f(uLocations.u_wave_invert, params.wave_invert);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function renderWavetableCPU() {
  pixelBuffer.loadPixels();
  let palette = palettes[currentPalette];
  let size = renderSize;

  for (let y = 0; y < size; y++) {
    let scan_pos = (y + 1) / (size + 1);

    for (let x = 0; x < size; x++) {
      let raw_phase = (x + 1) / (size + 1);
      let sample = generateSample(raw_phase, scan_pos);

      let colorVal = (sample + 1) * 0.5;
      let col = getColorFromPalette(colorVal, palette);
      if (Math.abs(hueShift) > 0.5) col = hueShiftRGB(col[0], col[1], col[2], hueShift);

      let idx = (y * size + x) * 4;
      pixelBuffer.pixels[idx] = col[0];
      pixelBuffer.pixels[idx + 1] = col[1];
      pixelBuffer.pixels[idx + 2] = col[2];
      pixelBuffer.pixels[idx + 3] = 255;
    }
  }

  pixelBuffer.updatePixels();
}

function getColorFromPalette(t, palette) {
  t = constrain(t, 0, 1);
  let scaledT = t * (palette.length - 1);
  let idx = floor(scaledT);
  let frac = scaledT - idx;

  if (idx >= palette.length - 1) {
    return palette[palette.length - 1];
  }

  let c1 = palette[idx];
  let c2 = palette[idx + 1];

  return [
    lerp(c1[0], c2[0], frac),
    lerp(c1[1], c2[1], frac),
    lerp(c1[2], c2[2], frac)
  ];
}

// --- ISOMETRIC HEIGHTMAP VIEW ---
function projectPoint(nx, ny, nz) {
  // nx, ny, nz are normalized (-0.5 to 0.5) centered coordinates
  // Rotate around Y axis
  let cosR = Math.cos(isoRotation);
  let sinR = Math.sin(isoRotation);
  let rx = nx * cosR - ny * sinR;
  let ry = nx * sinR + ny * cosR;
  let rz = nz;

  // Tilt (rotate around X axis)
  let cosT = Math.cos(isoTilt);
  let sinT = Math.sin(isoTilt);
  let ty = ry * cosT - rz * sinT;
  let tz = ry * sinT + rz * cosT;

  // Project to screen with zoom + pan
  let scale = DISPLAY_SIZE * 0.75 * isoZoom;
  let sx = DISPLAY_SIZE * 0.5 + rx * scale + isoPanX;
  let sy = DISPLAY_SIZE * 0.5 + ty * scale + isoPanY;

  return { x: sx, y: sy, z: tz };
}

function renderIsometric() {
  let palette = palettes[currentPalette];
  let gridRes = min(renderSize, ISO_MAX_GRID);
  let heightAmt = 0.3;

  // Use WebGL path if available
  if (isoShaderProgram) {
    renderIsometricWebGL(palette, gridRes, heightAmt);
    return;
  }

  // CPU fallback (p5.js drawing)
  background(10, 10, 15);
  let grid = [];
  let projected = [];
  for (let gy = 0; gy <= gridRes; gy++) {
    let row = [];
    let projRow = [];
    for (let gx = 0; gx <= gridRes; gx++) {
      let phase = (gx + 1) / (gridRes + 2);
      let scan = (gy + 1) / (gridRes + 2);
      let sample = generateSample(phase, scan);
      row.push(sample);
      let nx = (gx / gridRes) - 0.5;
      let ny = (gy / gridRes) - 0.5;
      let nz = ((sample + 1) * 0.5) * heightAmt;
      projRow.push(projectPoint(nx, ny, nz));
    }
    grid.push(row);
    projected.push(projRow);
  }

  let quads = [];
  for (let gy = 0; gy < gridRes; gy++) {
    for (let gx = 0; gx < gridRes; gx++) {
      let avgZ = (projected[gy][gx].z + projected[gy][gx+1].z +
                  projected[gy+1][gx].z + projected[gy+1][gx+1].z) * 0.25;
      quads.push({ gx, gy, z: avgZ });
    }
  }
  quads.sort((a, b) => a.z - b.z);

  push();
  strokeWeight(0.5);
  for (let q of quads) {
    let gx = q.gx, gy = q.gy;
    let s00 = grid[gy][gx], s10 = grid[gy][gx+1], s01 = grid[gy+1][gx], s11 = grid[gy+1][gx+1];
    let avgSample = (s00 + s10 + s01 + s11) * 0.25;
    let colorVal = (avgSample + 1) * 0.5;
    let col = getColorFromPalette(colorVal, palette);
    if (Math.abs(hueShift) > 0.5) col = hueShiftRGB(col[0], col[1], col[2], hueShift);
    let p00 = projected[gy][gx], p10 = projected[gy][gx+1], p01 = projected[gy+1][gx], p11 = projected[gy+1][gx+1];
    let dx = (s10 - s00 + s11 - s01) * 0.5;
    let dy = (s01 - s00 + s11 - s10) * 0.5;
    let lightX = Math.cos(isoRotation + 0.8), lightY = Math.sin(isoRotation + 0.8);
    let shade = constrain(0.85 + (dx * lightX + dy * lightY) * 0.5, 0.35, 1.5);
    fill(constrain(col[0]*shade,0,255), constrain(col[1]*shade,0,255), constrain(col[2]*shade,0,255));
    stroke(constrain(col[0]*shade*0.5,0,255), constrain(col[1]*shade*0.5,0,255), constrain(col[2]*shade*0.5,0,255), 60);
    beginShape();
    vertex(p00.x, p00.y); vertex(p10.x, p10.y); vertex(p11.x, p11.y); vertex(p01.x, p01.y);
    endShape(CLOSE);
  }
  pop();
}

function renderIsometricWebGL(palette, gridRes, heightAmt) {
  let numVerts = (gridRes + 1) * (gridRes + 1);
  let numCells = gridRes * gridRes;
  let vertData = new Float32Array(numVerts * ISO_STRIDE);
  let indexData = isoUintExt ? new Uint32Array(numCells * 6) : new Uint16Array(numCells * 6);

  // Pre-compute lighting direction
  let lightX = Math.cos(isoRotation + 0.8);
  let lightY = Math.sin(isoRotation + 0.8);

  // Build sample grid (flat arrays for speed)
  let samples = new Float32Array(numVerts);
  for (let gy = 0; gy <= gridRes; gy++) {
    for (let gx = 0; gx <= gridRes; gx++) {
      let phase = (gx + 1) / (gridRes + 2);
      let scan = (gy + 1) / (gridRes + 2);
      samples[gy * (gridRes + 1) + gx] = generateSample(phase, scan);
    }
  }

  // Build vertex data: project each vertex, store clip coords + base color
  let cosR = Math.cos(isoRotation), sinR = Math.sin(isoRotation);
  let cosT = Math.cos(isoTilt), sinT = Math.sin(isoTilt);
  let scale = DISPLAY_SIZE * 0.75 * isoZoom;
  let cx = DISPLAY_SIZE * 0.5 + isoPanX;
  let cy = DISPLAY_SIZE * 0.5 + isoPanY;
  let invDS = 1.0 / DISPLAY_SIZE;

  for (let gy = 0; gy <= gridRes; gy++) {
    for (let gx = 0; gx <= gridRes; gx++) {
      let vi = gy * (gridRes + 1) + gx;
      let s = samples[vi];
      let nx = (gx / gridRes) - 0.5;
      let ny = (gy / gridRes) - 0.5;
      let nz = ((s + 1) * 0.5) * heightAmt;

      // Projection (inline for speed)
      let rx = nx * cosR - ny * sinR;
      let ry = nx * sinR + ny * cosR;
      let ty = ry * cosT - nz * sinT;
      let tz = ry * sinT + nz * cosT;
      let sx = cx + rx * scale;
      let sy = cy + ty * scale;

      // Convert to clip space (-1 to 1)
      let clipX = sx * invDS * 2.0 - 1.0;
      let clipY = 1.0 - sy * invDS * 2.0;
      // Depth: map tz to 0-1 range for depth buffer
      let depth = (tz + 1.0) * 0.5;

      let off = vi * ISO_STRIDE;
      vertData[off] = clipX;
      vertData[off + 1] = clipY;
      vertData[off + 2] = depth;
      // Color will be filled per-cell below (placeholder)
      vertData[off + 3] = 0;
      vertData[off + 4] = 0;
      vertData[off + 5] = 0;
    }
  }

  // Per-cell: compute color with lighting, write to all 4 corner vertices
  // Since each vertex is shared by up to 4 cells, we accumulate and average
  let colorAccum = new Float32Array(numVerts * 3);
  let colorCount = new Uint8Array(numVerts);

  for (let gy = 0; gy < gridRes; gy++) {
    for (let gx = 0; gx < gridRes; gx++) {
      let i00 = gy * (gridRes + 1) + gx;
      let i10 = i00 + 1;
      let i01 = i00 + (gridRes + 1);
      let i11 = i01 + 1;

      let s00 = samples[i00], s10 = samples[i10], s01 = samples[i01], s11 = samples[i11];
      let avgSample = (s00 + s10 + s01 + s11) * 0.25;
      let colorVal = (avgSample + 1) * 0.5;
      let col = getColorFromPalette(colorVal, palette);
      if (Math.abs(hueShift) > 0.5) col = hueShiftRGB(col[0], col[1], col[2], hueShift);

      // Surface normal lighting
      let dx = (s10 - s00 + s11 - s01) * 0.5;
      let dy = (s01 - s00 + s11 - s10) * 0.5;
      let shade = 0.85 + (dx * lightX + dy * lightY) * 0.5;
      if (shade < 0.35) shade = 0.35;
      if (shade > 1.5) shade = 1.5;

      let r = Math.min(col[0] * shade, 255) / 255;
      let g = Math.min(col[1] * shade, 255) / 255;
      let b = Math.min(col[2] * shade, 255) / 255;

      // Accumulate color to shared vertices
      let corners = [i00, i10, i01, i11];
      for (let c = 0; c < 4; c++) {
        let ci = corners[c];
        colorAccum[ci * 3] += r;
        colorAccum[ci * 3 + 1] += g;
        colorAccum[ci * 3 + 2] += b;
        colorCount[ci]++;
      }

      // Build index buffer: two triangles per cell
      let cellIdx = (gy * gridRes + gx) * 6;
      indexData[cellIdx] = i00;
      indexData[cellIdx + 1] = i10;
      indexData[cellIdx + 2] = i11;
      indexData[cellIdx + 3] = i00;
      indexData[cellIdx + 4] = i11;
      indexData[cellIdx + 5] = i01;
    }
  }

  // Average accumulated colors and write to vertex data
  for (let i = 0; i < numVerts; i++) {
    let cnt = colorCount[i];
    if (cnt > 0) {
      let off = i * ISO_STRIDE;
      vertData[off + 3] = colorAccum[i * 3] / cnt;
      vertData[off + 4] = colorAccum[i * 3 + 1] / cnt;
      vertData[off + 5] = colorAccum[i * 3 + 2] / cnt;
    }
  }

  // --- WebGL draw ---
  // Ensure glCanvas is at display size for 3D
  if (glCanvas.width !== DISPLAY_SIZE || glCanvas.height !== DISPLAY_SIZE) {
    glCanvas.width = DISPLAY_SIZE;
    glCanvas.height = DISPLAY_SIZE;
  }
  gl.viewport(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);

  // Clear with background color
  gl.clearColor(10/255, 10/255, 15/255, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Bind isometric shader
  gl.useProgram(isoShaderProgram);

  // Upload vertex data
  gl.bindBuffer(gl.ARRAY_BUFFER, isoVBO);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertData);

  // Set attribute pointers
  let stride = ISO_STRIDE * 4; // bytes
  gl.enableVertexAttribArray(isoAttrLocs.a_pos);
  gl.vertexAttribPointer(isoAttrLocs.a_pos, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(isoAttrLocs.a_depth);
  gl.vertexAttribPointer(isoAttrLocs.a_depth, 1, gl.FLOAT, false, stride, 8);
  gl.enableVertexAttribArray(isoAttrLocs.a_color);
  gl.vertexAttribPointer(isoAttrLocs.a_color, 3, gl.FLOAT, false, stride, 12);

  // Upload index data and draw
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, isoIBO);
  gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, indexData);

  let indexType = isoUintExt ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
  gl.drawElements(gl.TRIANGLES, numCells * 6, indexType, 0);

  // Disable depth test (not needed for 2D view)
  gl.disable(gl.DEPTH_TEST);

  // Disable iso attributes so they don't interfere with 2D shader
  gl.disableVertexAttribArray(isoAttrLocs.a_pos);
  gl.disableVertexAttribArray(isoAttrLocs.a_depth);
  gl.disableVertexAttribArray(isoAttrLocs.a_color);

  // Copy glCanvas to p5.js canvas
  drawingContext.drawImage(glCanvas, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
}

// --- MOUSE CONTROLS FOR ISO VIEW ---
function mousePressed() {
  if (viewMode !== 'iso') return;
  if (mouseX < 0 || mouseX > DISPLAY_SIZE || mouseY < 0 || mouseY > DISPLAY_SIZE) return;

  if (keyIsPressed && keyCode === SHIFT) {
    isoPanning = true;
  } else {
    isoDragging = true;
  }
  isoDragStartX = mouseX;
  isoDragStartY = mouseY;
}

function mouseDragged() {
  if (viewMode !== 'iso') return;

  let dx = mouseX - isoDragStartX;
  let dy = mouseY - isoDragStartY;
  isoDragStartX = mouseX;
  isoDragStartY = mouseY;

  if (isoPanning) {
    isoPanX += dx;
    isoPanY += dy;
  } else if (isoDragging) {
    isoRotation += dx * 0.008;
    isoTilt = constrain(isoTilt + dy * 0.006, 0.1, PI * 0.48);
  }
  needsRender = true;
}

function mouseReleased() {
  isoDragging = false;
  isoPanning = false;
}

function mouseWheel(event) {
  if (viewMode !== 'iso') return;
  if (mouseX < 0 || mouseX > DISPLAY_SIZE || mouseY < 0 || mouseY > DISPLAY_SIZE) return;

  isoZoom = constrain(isoZoom - event.delta * 0.001, 0.3, 3.0);
  needsRender = true;
  return false; // prevent page scroll
}

// --- UTILITY FUNCTIONS ---
function fract(x) {
  return x - floor(x);
}

function tanh_approx(x) {
  // Fast tanh approximation
  if (x > 3) return 1;
  if (x < -3) return -1;
  let x2 = x * x;
  return x * (27 + x2) / (27 + 9 * x2);
}

function smoothstep(edge0, edge1, x) {
  let t = constrain((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

// --- UI SETUP ---
function setupUI() {
  // Shape buttons
  document.querySelectorAll('.shape-btn[data-shape]').forEach(btn => {
    btn.addEventListener('click', () => {
      params.shape = parseInt(btn.dataset.shape);
      targetParams.shape = params.shape;
      updateShapeButtons();
      needsRender = true;
    });
  });

  // Fold mode buttons
  document.querySelectorAll('.shape-btn[data-foldmode]').forEach(btn => {
    btn.addEventListener('click', () => {
      params.fold_mode = parseInt(btn.dataset.foldmode);
      targetParams.fold_mode = params.fold_mode;
      updateFoldButtons();
      needsRender = true;
    });
  });

  // Lock category buttons
  document.querySelectorAll('.lock-btn[data-lockcat]').forEach(btn => {
    btn.addEventListener('click', () => {
      lockCategory = parseInt(btn.dataset.lockcat);
      document.querySelectorAll('.lock-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.lockcat) === lockCategory);
      });
      applyRandomLocks();
      needsRender = true;
    });
  });

  // Sliders
  setupSlider('pw', 0, 1000, v => {
    params.pw = v / 1000;
    targetParams.pw = params.pw;
  }, v => (v / 1000).toFixed(3));

  setupSlider('soften', 0, 1000, v => {
    params.soften = expMap(v / 1000, 0.001, 50);
    targetParams.soften = params.soften;
  }, v => expMap(v / 1000, 0.001, 50).toFixed(3));

  setupSlider('ybend', 0, 1000, v => {
    params.y_bend = map(v, 0, 1000, -0.25, 1.0);
    targetParams.y_bend = params.y_bend;
  }, v => map(v, 0, 1000, -0.25, 1.0).toFixed(3));

  setupSlider('fxbend', 0, 1000, v => {
    params.fx_bend = expMap(v / 1000, 0, 1000);
    targetParams.fx_bend = params.fx_bend;
  }, v => expMap(v / 1000, 0, 1000).toFixed(1));

  setupSlider('fxnoise', 0, 1000, v => {
    params.fx_noise = v / 1000;
    targetParams.fx_noise = params.fx_noise;
  }, v => (v / 1000).toFixed(3));

  setupSlider('fxquant', 0, 1000, v => {
    params.fx_quantize = v / 1000;
    targetParams.fx_quantize = params.fx_quantize;
  }, v => (v / 1000).toFixed(3));

  setupSlider('pwmorph', 0, 1000, v => {
    params.pw_morph = map(v, 0, 1000, -50, 50);
    targetParams.pw_morph = params.pw_morph;
  }, v => map(v, 0, 1000, -50, 50).toFixed(1));

  setupSlider('fold', 0, 1000, v => {
    params.fx_fold = expMap(v / 1000, 0, 10000);
    targetParams.fx_fold = params.fx_fold;
  }, v => expMap(v / 1000, 0, 10000).toFixed(0));

  setupSlider('crush', 0, 1000, v => {
    params.fx_crush = expMap(v / 1000, 0, 1);
    targetParams.fx_crush = params.fx_crush;
  }, v => expMap(v / 1000, 0, 1).toFixed(3));

  setupSlider('speed', 1, 100, v => {
    animSpeed = v / 100;
  }, v => (v / 100).toFixed(2));

  setupSlider('drift', 0, 100, v => {
    driftAmount = v / 100;
  }, v => (v / 100).toFixed(2));

  // Palette select
  document.getElementById('palette-select').addEventListener('change', e => {
    currentPalette = e.target.value;
    updateColorPreview();
    needsRender = true;
  });

  // Hue shift slider
  setupSlider('hueshift', 0, 360, v => {
    hueShift = v;
    needsRender = true;
  }, v => v + '°');
}

function setupSlider(id, min, max, onChange, formatValue) {
  let slider = document.getElementById('param-' + id);
  let valueDisplay = document.getElementById('val-' + id);

  slider.min = min;
  slider.max = max;

  slider.addEventListener('input', () => {
    let v = parseFloat(slider.value);
    onChange(v);
    valueDisplay.textContent = formatValue(v);
    needsRender = true;
  });
}

function updateShapeButtons() {
  document.querySelectorAll('.shape-btn[data-shape]').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.shape) === params.shape);
  });
}

function updateFoldButtons() {
  document.querySelectorAll('.shape-btn[data-foldmode]').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.foldmode) === params.fold_mode);
  });
}

window.toggleWaveMirror = function() {
  params.wave_mirror = params.wave_mirror ? 0 : 1;
  targetParams.wave_mirror = params.wave_mirror;
  updateWaveModButtons();
  needsRender = true;
};

window.toggleWaveInvert = function() {
  params.wave_invert = params.wave_invert ? 0 : 1;
  targetParams.wave_invert = params.wave_invert;
  updateWaveModButtons();
  needsRender = true;
};

function updateWaveModButtons() {
  let mirBtn = document.getElementById('wave-mirror-btn');
  let invBtn = document.getElementById('wave-invert-btn');
  if (mirBtn) mirBtn.classList.toggle('active', params.wave_mirror === 1);
  if (invBtn) invBtn.classList.toggle('active', params.wave_invert === 1);
}

function updateUIValues() {
  document.getElementById('param-pw').value = params.pw * 1000;
  document.getElementById('val-pw').textContent = params.pw.toFixed(3);

  document.getElementById('param-soften').value = logMap(params.soften, 0.001, 50) * 1000;
  document.getElementById('val-soften').textContent = params.soften.toFixed(3);

  let ybendVal = map(params.y_bend, -0.25, 1.0, 0, 1000);
  document.getElementById('param-ybend').value = ybendVal;
  document.getElementById('val-ybend').textContent = params.y_bend.toFixed(3);

  let fxbendVal = logMap(params.fx_bend, 0, 1000) * 1000;
  document.getElementById('param-fxbend').value = fxbendVal;
  document.getElementById('val-fxbend').textContent = params.fx_bend.toFixed(1);

  document.getElementById('param-fxnoise').value = params.fx_noise * 1000;
  document.getElementById('val-fxnoise').textContent = params.fx_noise.toFixed(3);

  document.getElementById('param-fxquant').value = params.fx_quantize * 1000;
  document.getElementById('val-fxquant').textContent = params.fx_quantize.toFixed(3);

  let pwmorphVal = map(params.pw_morph, -50, 50, 0, 1000);
  document.getElementById('param-pwmorph').value = pwmorphVal;
  document.getElementById('val-pwmorph').textContent = params.pw_morph.toFixed(1);

  let foldVal = logMap(params.fx_fold, 0, 10000) * 1000;
  document.getElementById('param-fold').value = foldVal;
  document.getElementById('val-fold').textContent = params.fx_fold.toFixed(0);

  let crushVal = logMap(params.fx_crush, 0, 1) * 1000;
  document.getElementById('param-crush').value = crushVal;
  document.getElementById('val-crush').textContent = params.fx_crush.toFixed(3);

}

function updateColorPreview() {
  let palette = palettes[currentPalette];
  let gradient = palette.map((c, i) => {
    let pct = (i / (palette.length - 1)) * 100;
    return `rgb(${c[0]}, ${c[1]}, ${c[2]}) ${pct}%`;
  }).join(', ');
  document.getElementById('color-preview').style.background = `linear-gradient(90deg, ${gradient})`;
}

// --- GLOBAL FUNCTIONS ---
window.randomizeAll = function() {
  params.shape = floor(random(16));
  params.pw = random(0.0, 1.0);
  params.soften = expMap(random(), 0.001, 50);
  params.y_bend = random(-0.25, 1.0);
  // fx_bend: 30% chance of zero, otherwise exp-biased
  params.fx_bend = random() < 0.3 ? 0 : expMap(pow(random(), 1.5), 0, 1000);
  // fx_noise: 40% zero, rest biased low (power curve)
  params.fx_noise = random() < 0.4 ? 0 : pow(random(), 3) * 0.8;
  // fx_quantize: 40% zero, rest biased low
  params.fx_quantize = random() < 0.4 ? 0 : pow(random(), 3) * 0.7;
  // pw_morph: biased toward center
  params.pw_morph = pow(random(), 1.5) * 50 * (random() < 0.5 ? -1 : 1);
  // fx_fold: 20% very low (<50), rest exp-biased
  params.fx_fold = random() < 0.2 ? random(0, 50) : expMap(pow(random(), 1.3), 0, 10000);
  params.fold_mode = floor(random(5));
  // fx_crush: 35% zero, rest exp-biased (0-1)
  params.fx_crush = random() < 0.35 ? 0 : expMap(pow(random(), 1.5), 0, 1);
  // Wave mirror/invert: randomly pick a variation
  params.wave_mirror = random() < 0.5 ? 1 : 0;
  params.wave_invert = random() < 0.5 ? 1 : 0;
  // Snap targets to match (no slow interpolation)
  targetParams = { ...params };
  updateShapeButtons();
  updateFoldButtons();
  updateWaveModButtons();

  updateUIValues();

  // Random palette + hue shift
  currentPalette = random(paletteNames);
  hueShift = floor(random(360));
  document.getElementById('palette-select').value = currentPalette;
  document.getElementById('param-hueshift').value = hueShift;
  document.getElementById('val-hueshift').textContent = hueShift + '°';
  updateColorPreview();

  // Random animation mode
  let newMode = random(ANIM_MODES);
  setAnimMode(newMode);

  // Random resolution (full range)
  setResolution(floor(random(RESOLUTIONS.length)));

  // Random per-param animation ranges
  randomizeParamRanges();

  // Random lock category
  lockCategory = floor(random(LOCK_CATEGORIES.length));
  document.querySelectorAll('.lock-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.lockcat) === lockCategory);
  });

  // Apply param locks based on category
  applyRandomLocks();

  needsRender = true;
};

window.resetParams = function() {
  params = {
    shape: 0,
    pw: 1.0,
    soften: 5.0,
    y_bend: 0.0,
    fx_bend: 0.0,
    fx_noise: 0.0,
    fx_quantize: 0.0,
    pw_morph: 0.0,
    fx_fold: 100.0,
    fold_mode: 0,
    fx_crush: 0.0,
    wave_mirror: 0,
    wave_invert: 0
  };
  targetParams = { ...params };
  updateShapeButtons();
  updateFoldButtons();

  updateUIValues();

  currentPalette = 'thermal';
  hueShift = 0;
  document.getElementById('palette-select').value = currentPalette;
  document.getElementById('param-hueshift').value = 0;
  document.getElementById('val-hueshift').textContent = '0°';
  updateColorPreview();
  needsRender = true;
};

window.toggleAnimation = function() {
  isAnimating = !isAnimating;
  document.getElementById('anim-btn-text').textContent = isAnimating ? 'Pause' : 'Play';
  document.getElementById('anim-status').textContent = isAnimating ? 'Running' : 'Paused';
};

window.saveImage = function() {
  let timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  saveCanvas('glix-wavetable-' + timestamp, 'png');
};

window.toggleView = function() {
  viewMode = viewMode === '2d' ? 'iso' : '2d';
  let btn = document.getElementById('view-btn-text');
  if (btn) btn.textContent = viewMode === '2d' ? '3D View' : '2D View';
  let indicator = document.getElementById('view-indicator');
  if (indicator) indicator.textContent = viewMode === '2d' ? '2D Color' : 'Isometric';
  needsRender = true;
};

window.resetCamera = function() {
  isoRotation = -0.7;
  isoTilt = 0.65;
  isoZoom = 1.0;
  isoPanX = 0;
  isoPanY = 0;
  needsRender = true;
};

window.setAnimMode = function(mode) {
  animMode = mode;
  if (animMode === 'chaos') { lorenzX = 1; lorenzY = 1; lorenzZ = 1; }
  if (animMode === 'sequencer') { seqStep = 0; seqTimer = 0; }
  let el = document.getElementById('anim-mode-display');
  if (el) el.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
  // Update button active states
  let btns = document.querySelectorAll('.panel .shape-buttons button');
  // Find the animation mode buttons by parent context
  let animPanel = el ? el.closest('.panel') : null;
  if (animPanel) {
    animPanel.querySelectorAll('.shape-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.toLowerCase() === mode ||
        (mode === 'sequencer' && btn.textContent === 'Seq'));
    });
  }
  needsRender = true;
};

window.cycleAnimMode = function() {
  let idx = ANIM_MODES.indexOf(animMode);
  idx = (idx + 1) % ANIM_MODES.length;
  animMode = ANIM_MODES[idx];
  // Reset chaos attractor on switch
  if (animMode === 'chaos') { lorenzX = 1; lorenzY = 1; lorenzZ = 1; }
  if (animMode === 'sequencer') { seqStep = 0; seqTimer = 0; }
  let el = document.getElementById('anim-mode-display');
  if (el) el.textContent = animMode.charAt(0).toUpperCase() + animMode.slice(1);
  needsRender = true;
};

window.setAnimRange = function(idx) {
  animRangeIndex = constrain(idx, 0, ANIM_RANGES.length - 1);
  let val = ANIM_RANGES[animRangeIndex];
  for (let k of ANIM_PARAMS) paramRanges[k] = val;
  document.querySelectorAll('.range-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.range) === animRangeIndex);
  });
};

function randomizeParamRanges() {
  for (let k of ANIM_PARAMS) {
    paramRanges[k] = ANIM_RANGES[floor(random(ANIM_RANGES.length))];
  }
  // Clear button active states (mixed mode)
  animRangeIndex = -1;
  document.querySelectorAll('.range-btn').forEach(btn => btn.classList.remove('active'));
}

let smoothUpscale = false;
window.toggleSmooth = function() {
  smoothUpscale = !smoothUpscale;
  let el = document.getElementById('smooth-btn');
  if (el) el.textContent = smoothUpscale ? 'Smooth: On' : 'Smooth: Off';
  needsRender = true;
};

function togglePP(name) {
  if (name === 'dither') {
    if (!ppDither) {
      ppDither = true;
      ppDitherScale = 0; // start at fine
    } else {
      ppDitherScale++;
      if (ppDitherScale > 3) {
        ppDither = false;
        ppDitherScale = 0;
      }
    }
  }
  else if (name === 'scanlines') ppScanlines = !ppScanlines;
  else if (name === 'posterize') ppPosterize = !ppPosterize;
  else if (name === 'grain') ppGrain = !ppGrain;
  else if (name === 'ssaa') {
    ppSuperSample = !ppSuperSample;
    resizeGLCanvas();
  }
  // Update button states
  let ditherLabels = ['1px', '2px', '4px', '8px'];
  document.querySelectorAll('.pp-btn').forEach(btn => {
    let pp = btn.dataset.pp;
    let on = (pp === 'dither' && ppDither) || (pp === 'scanlines' && ppScanlines) ||
             (pp === 'posterize' && ppPosterize) || (pp === 'grain' && ppGrain) ||
             (pp === 'ssaa' && ppSuperSample);
    btn.classList.toggle('active', on);
    if (pp === 'dither') {
      btn.textContent = ppDither ? 'Dither ' + ditherLabels[ppDitherScale] : 'Dither';
    }
  });
  needsRender = true;
}
window.togglePP = togglePP;

function nextPalette() {
  let idx = paletteNames.indexOf(currentPalette);
  idx = (idx + 1) % paletteNames.length;
  currentPalette = paletteNames[idx];
  document.getElementById('palette-select').value = currentPalette;
  updateColorPreview();
  needsRender = true;
}

function setResolution(idx) {
  resolutionIndex = constrain(idx, 0, RESOLUTIONS.length - 1);
  renderSize = RESOLUTIONS[resolutionIndex];
  createPixelBuffer();
  updateResolutionDisplay();
}

function cycleResolution(dir) {
  setResolution(resolutionIndex + dir);
}

function updateResolutionDisplay() {
  let el = document.getElementById('res-display');
  if (el) {
    el.textContent = renderSize + 'px';
  }
  // Update buttons
  document.querySelectorAll('.res-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.res) === resolutionIndex);
  });
}

// --- KEYBOARD CONTROLS ---
function keyPressed() {
  // Ignore if typing in input
  if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
    return;
  }

  switch (key) {
    case ' ':
      toggleAnimation();
      return false;
    case 'r':
    case 'R':
      randomizeAll();
      break;
    case 's':
    case 'S':
      saveImage();
      break;
    case '0':
      resetParams();
      break;
    case '1': case '2': case '3': case '4':
    case '5': case '6': case '7': case '8': case '9':
      params.shape = parseInt(key) - 1;
      targetParams.shape = params.shape;
      updateShapeButtons();
      needsRender = true;
      break;
    case 'c':
    case 'C':
      nextPalette();
      break;
    case 'm':
    case 'M':
      cycleAnimMode();
      break;
    case '=':
    case '+':
      animSpeed = min(1.0, animSpeed + 0.1);
      document.getElementById('param-speed').value = animSpeed * 100;
      document.getElementById('val-speed').textContent = animSpeed.toFixed(2);
      break;
    case '-':
    case '_':
      animSpeed = max(0.01, animSpeed - 0.1);
      document.getElementById('param-speed').value = animSpeed * 100;
      document.getElementById('val-speed').textContent = animSpeed.toFixed(2);
      break;
    case 'f':
    case 'F':
      targetParams.fx_fold = min(10000, params.fx_fold + 500);
      needsRender = true;
      break;
    case 'v':
    case 'V':
      toggleView();
      break;
    case '[':
      cycleResolution(-1);
      break;
    case ']':
      cycleResolution(1);
      break;
  }
}
