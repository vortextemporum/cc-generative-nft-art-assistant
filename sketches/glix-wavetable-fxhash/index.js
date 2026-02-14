// ==========================================
//   GLIX WAVETABLE GENERATOR - fxhash Edition
//   Based on GenDSP v3.4 - Full Port
//   Version: 1.3.0
// ==========================================

// ============================================================
// RANDOMNESS (fxhash Compatible)
// ============================================================

// R is our deterministic PRNG — backed by $fx.rand()
let R = $fx.rand;

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

// ============================================================

let canvas;
let DISPLAY_SIZE;

// --- WebGL SHADER RENDERER ---
let glCanvas, gl, shaderProgram, vertexBuffer;
let uLocations = {};

// View mode: '2d' or 'iso'
let viewMode = '2d';

// Isometric camera state
let isoRotation = -0.7;
let isoTilt = 0.65;
let isoZoom = 0.85;
let isoPanX = 0;
let isoPanY = 25;
let isoDragging = false;
let isoPanning = false;
let isoDragStartX = 0;
let isoDragStartY = 0;

// Resolution options
const RESOLUTIONS = [128, 256, 512, 1024, 2048];
let resolutionIndex = 4; // Default 2048
let renderSize = RESOLUTIONS[resolutionIndex];

// --- PARAMETERS (matching GenDSP) ---
let params = {
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
  fx_rectify: 0,
  fx_clip: 0.0,
  fx_asym: 0.0,
  fx_ringmod: 0.0,
  fx_comb: 0.0,
  fx_slew: 0.0,
  fx_bitop: 0.0,
  wave_mirror: 0,
  wave_invert: 0
};

// Animation targets (for smooth interpolation)
let targetParams = { ...params };
let animSpeed = 0.3;
let driftAmount = 0.5;

// Parameter locks
const ANIM_PARAMS = ['pw','soften','y_bend','fx_bend','fx_noise','fx_quantize','pw_morph','fx_fold','fx_crush',
                     'fx_clip','fx_asym','fx_ringmod','fx_comb','fx_slew','fx_bitop'];
let paramLocks = {};
for (let k of ANIM_PARAMS) paramLocks[k] = false;

function setTarget(key, val) {
  if (!paramLocks[key]) targetParams[key] = val;
}

// Lock count categories
let lockCategory = 3;
const LOCK_CATEGORIES = [
  { name: 'Couple', count: [2, 4] },
  { name: 'Multiple', count: [5, 8] },
  { name: 'Most', count: [10, 13] },
  { name: 'All', count: 15 }
];

function applyRandomLocks() {
  let cat = LOCK_CATEGORIES[lockCategory];
  let animCount;
  if (Array.isArray(cat.count)) {
    animCount = cat.count[0] + rndInt(0, cat.count[1] - cat.count[0]);
  } else {
    animCount = cat.count;
  }
  let shuffled = [...ANIM_PARAMS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = Math.floor(R() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  for (let i = 0; i < ANIM_PARAMS.length; i++) {
    paramLocks[shuffled[i]] = i >= animCount;
  }
}

let isAnimating = true;
let animTime = 0;

// Animation modes
let animMode = 'drift';
const ANIM_RANGES = [1.0, 0.1, 0.01];
let animRangeIndex = 0;
let paramRanges = {};
for (let k of ANIM_PARAMS) paramRanges[k] = 1.0;
const ANIM_MODES = ['drift', 'lfo', 'chaos', 'sequencer', 'bounce'];

// Exponential mapping for large-range params
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

// Post-processing flags
let ppDitherBayer = false;
let ppDitherBayerScale = 0;
let ppDitherNoise = false;
let ppDitherNoiseScale = 0;
let ppDitherLines = false;
let ppDitherLinesScale = 0;
let ppPosterize = false;
let ppGrain = false;
let ppSharpen = false;
let ppHalftone = false;
let ppHalftoneScale = 0;
let ppEdgeDetect = false;
let ppRipple = false;
let smoothUpscale = false;

// Rendering throttle
const TARGET_UPDATE_FPS = 30;
let lastRenderTime = 0;
let needsRender = true;

// ============================================================
// COLOR PALETTES (55 total)
// ============================================================

const palettes = {
  thermal: [[0,0,0],[40,0,80],[120,0,120],[200,50,50],[255,150,0],[255,255,100],[255,255,255]],
  ocean: [[10,10,30],[20,40,80],[30,80,120],[50,150,180],[100,200,220],[180,240,255],[255,255,255]],
  neon: [[10,0,20],[80,0,120],[255,0,150],[0,255,200],[255,255,0],[255,100,255],[255,255,255]],
  sunset: [[20,10,30],[60,20,60],[120,40,80],[200,80,60],[255,150,50],[255,200,100],[255,240,200]],
  monochrome: [[0,0,0],[30,30,35],[60,60,70],[100,100,110],[150,150,160],[200,200,210],[255,255,255]],
  plasma: [[10,0,30],[50,0,100],[150,0,200],[255,50,150],[255,150,100],[255,220,150],[255,255,255]],
  rainbow: [[100,0,150],[0,0,255],[0,200,255],[0,255,100],[255,255,0],[255,150,0],[255,50,50]],
  inferno: [[0,0,4],[40,11,84],[101,21,110],[159,42,99],[212,72,66],[245,125,21],[252,255,164]],
  viridis: [[68,1,84],[72,35,116],[49,104,142],[33,145,140],[53,183,121],[144,215,67],[253,231,37]],
  ember: [[20,5,0],[60,10,0],[140,30,0],[200,60,0],[255,120,20],[255,200,60],[255,240,180]],
  toxic: [[5,10,5],[10,40,10],[20,80,15],[40,140,20],[80,200,30],[160,240,60],[220,255,150]],
  cyberpunk: [[10,0,20],[30,0,60],[80,0,160],[180,0,255],[255,0,200],[255,80,120],[255,200,220]],
  forest: [[10,15,8],[20,40,15],[35,70,25],[55,110,40],[80,150,55],[130,190,80],[200,230,150]],
  lavender: [[15,10,25],[40,20,70],[80,50,130],[130,90,180],[170,130,210],[210,180,235],[240,225,255]],
  rust: [[20,10,5],[60,25,10],[120,50,20],[170,80,30],[200,120,50],[220,170,100],[240,220,180]],
  ice: [[240,250,255],[200,230,255],[150,200,240],[100,160,220],[60,120,200],[30,70,160],[10,30,80]],
  bloodmoon: [[5,0,0],[40,0,5],[100,5,10],[160,15,20],[200,40,30],[230,100,60],[255,200,150]],
  mint: [[10,20,20],[20,60,55],[40,110,100],[80,170,150],[140,210,190],[200,240,220],[240,255,245]],
  noir: [[0,0,0],[15,15,20],[35,30,40],[60,50,65],[90,75,95],[130,110,140],[180,170,190]],
  glitch: [[255,0,0],[0,0,0],[0,255,255],[255,255,255],[255,0,255],[0,0,0],[0,255,0]],
  vhs: [[20,20,200],[200,200,50],[10,10,10],[200,30,30],[50,200,200],[180,20,180],[240,240,240]],
  pop: [[255,50,50],[255,220,0],[50,50,255],[255,50,50],[0,200,100],[255,220,0],[50,50,255]],
  zebra: [[0,0,0],[255,255,255],[0,0,0],[255,255,255],[0,0,0],[255,255,255],[0,0,0]],
  acidhouse: [[0,0,0],[0,255,0],[255,255,0],[0,0,0],[255,0,255],[0,255,0],[255,255,0]],
  bubblegum: [[255,100,200],[100,200,255],[255,220,100],[200,100,255],[100,255,180],[255,100,100],[100,200,255]],
  terminal: [[0,0,0],[0,40,0],[0,255,0],[0,0,0],[0,180,0],[0,255,0],[200,255,200]],
  neotokyo: [[5,5,20],[255,0,80],[0,200,255],[20,10,40],[255,200,0],[0,255,120],[255,0,80]],
  heatmap: [[0,0,80],[0,0,255],[0,255,0],[255,255,0],[255,0,0],[255,0,0],[255,255,255]],
  candy: [[255,255,255],[255,80,120],[255,255,255],[120,200,255],[255,255,255],[255,200,80],[255,255,255]],
  duotone: [[15,10,50],[15,10,50],[15,10,50],[220,90,40],[220,90,40],[220,90,40],[220,90,40]],
  banded: [[10,10,30],[200,180,255],[20,15,40],[255,200,100],[10,10,30],[180,255,200],[20,15,40]],
  coal: [[8,5,5],[18,12,10],[30,18,14],[42,25,18],[55,32,22],[65,40,28],[80,50,35]],
  neonline: [[0,0,0],[0,0,5],[0,255,255],[255,255,255],[255,0,200],[5,0,5],[0,0,0]],
  pastel: [[210,130,155],[130,150,210],[140,200,130],[220,170,120],[120,195,195],[200,140,190],[160,155,215]],
  split: [[0,20,80],[0,60,160],[0,120,220],[255,255,255],[220,40,0],[160,20,0],[80,10,0]],
  prism: [[120,0,0],[200,80,0],[220,200,0],[0,180,40],[0,100,200],[80,0,180],[140,0,120]],
  gold: [[30,15,0],[80,50,5],[160,110,20],[220,180,50],[255,220,100],[255,240,170],[255,250,230]],
  silver: [[20,20,25],[60,65,75],[110,115,130],[160,165,175],[195,200,210],[225,228,235],[250,252,255]],
  copper: [[15,5,0],[60,20,10],[120,55,30],[180,90,50],[210,130,80],[230,175,130],[245,220,200]],
  deepblue: [[0,0,10],[0,5,35],[5,15,70],[15,35,120],[30,65,170],[60,110,210],[120,170,245]],
  crimson: [[15,0,0],[50,0,5],[100,5,15],[155,15,25],[200,35,40],[230,75,70],[255,140,130]],
  jade: [[0,10,5],[0,35,20],[5,70,40],[10,115,65],[30,160,95],[70,200,135],[140,235,185]],
  sepia: [[20,15,10],[50,35,22],[90,65,40],[135,100,65],[180,145,100],[215,190,150],[245,235,215]],
  cyanotype: [[5,10,30],[10,25,70],[20,50,120],[40,90,165],[80,140,200],[150,200,230],[230,240,250]],
  crossprocess: [[0,20,30],[10,60,40],[40,130,50],[120,180,40],[200,200,60],[240,180,100],[255,220,200]],
  redblue: [[0,0,180],[0,0,180],[0,0,180],[240,240,240],[200,0,0],[200,0,0],[200,0,0]],
  traffic: [[200,0,0],[200,0,0],[255,200,0],[255,200,0],[0,160,0],[0,160,0],[0,160,0]],
  stamp: [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[255,255,255],[255,255,255],[255,255,255]],
  terracotta: [[25,12,8],[70,30,15],[130,60,30],[180,95,55],[210,135,85],[230,180,140],[245,225,200]],
  sahara: [[40,25,10],[90,65,30],[150,115,60],[195,165,100],[220,200,145],[240,225,185],[250,245,225]],
  xray: [[255,255,255],[180,200,220],[120,140,180],[60,70,120],[30,30,70],[10,10,30],[0,0,0]],
  infrared: [[255,255,200],[255,200,50],[255,100,0],[200,0,50],[120,0,80],[50,0,60],[10,0,20]],
  overcast: [[30,35,40],[55,60,70],[85,90,100],[120,125,135],[160,165,170],[195,198,200],[225,228,230]],
  fog: [[40,45,55],[80,90,100],[110,125,135],[145,155,165],[180,185,190],[210,215,218],[235,238,240]],
  bruise: [[10,5,15],[30,15,45],[60,30,65],[90,55,75],[130,85,80],[170,130,100],[210,190,160]]
};

let currentPalette = 'thermal';
let paletteNames = Object.keys(palettes);
let hueShift = 0;

// Hue shift via Rodrigues rotation (CPU-side)
function hueShiftRGB(r, g, b, deg) {
  if (Math.abs(deg) < 0.5) return [r, g, b];
  let angle = deg * 0.01745329252;
  let cosA = Math.cos(angle), sinA = Math.sin(angle);
  let k = 0.57735026919;
  let nr = r * cosA + (k * b - k * g) * sinA + k * (k * r + k * g + k * b) * (1 - cosA);
  let ng = g * cosA + (k * r - k * b) * sinA + k * (k * r + k * g + k * b) * (1 - cosA);
  let nb = b * cosA + (k * g - k * r) * sinA + k * (k * r + k * g + k * b) * (1 - cosA);
  return [constrain(nr, 0, 255), constrain(ng, 0, 255), constrain(nb, 0, 255)];
}

// ============================================================
// GLSL SHADERS
// ============================================================

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
uniform float u_fx_rectify;
uniform float u_fx_clip;
uniform float u_fx_asym;
uniform float u_fx_ringmod;
uniform float u_fx_comb;
uniform float u_fx_slew;
uniform float u_fx_bitop;
uniform float u_size;
uniform float u_pp_dither_bayer;
uniform float u_pp_dither_bayer_scale;
uniform float u_pp_dither_noise;
uniform float u_pp_dither_noise_scale;
uniform float u_pp_dither_lines;
uniform float u_pp_dither_lines_scale;
uniform float u_pp_posterize;
uniform float u_pp_grain;
uniform float u_pp_sharpen;
uniform float u_pp_halftone;
uniform float u_pp_halftone_scale;
uniform float u_pp_edge_detect;
uniform float u_pp_ripple;
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

  // MIRROR
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
    float edge = max(0.001, 0.5 / u_soften);
    samp = smoothstep2(cw - edge, cw + edge, final_phase) * -2.0 + 1.0;
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
    float n = 1.0 + scan_pos * 7.0;
    float n_lo = floor(n);
    float n_hi = n_lo + 1.0;
    float frac_n = n - n_lo;
    float psi_lo = sin(n_lo * 3.14159265 * shifted_phase);
    float psi_hi = sin(n_hi * 3.14159265 * shifted_phase);
    samp = psi_lo * (1.0 - frac_n) + psi_hi * frac_n;
  } else if (sel == 9) {
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
    float mod_index = scan_pos * 8.0;
    float ratio = 2.0 + (u_pw - 0.5) * 2.0;
    samp = sin(6.28318530718 * shifted_phase + mod_index * sin(6.28318530718 * ratio * shifted_phase));
  } else if (sel == 11) {
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
    float b = 2.0 + u_pw * 3.0;
    float a = 1.5;
    float num_oct = 1.0 + scan_pos * 11.0;
    float n_lo_f = floor(num_oct);
    float frac_f = num_oct - n_lo_f;
    samp = 0.0;
    float bn = 1.0;
    float an = 1.0;
    for (int n = 0; n < 12; n++) {
      float fn = float(n);
      if (fn > n_lo_f + 1.0) break;
      float amp = fn <= n_lo_f ? 1.0 : frac_f;
      samp += amp * sin(bn * 3.14159265 * shifted_phase) / an;
      bn *= b;
      an *= a;
    }
    samp *= 0.5;
  } else if (sel == 13) {
    float k = 1.0 + scan_pos * 7.0;
    float chirp_phase = pow(clamp(shifted_phase, 0.001, 0.999), k);
    samp = sin(chirp_phase * 6.28318530718);
  } else if (sel == 14) {
    float formant_freq = 2.0 + scan_pos * 14.0;
    float bw = 0.3 + u_pw * 1.2;
    samp = 0.0;
    for (int k = 1; k <= 16; k++) {
      float fk = float(k);
      float dist = (fk - formant_freq) / bw;
      float env = exp(-0.5 * dist * dist);
      samp += env * sin(fk * 6.28318530718 * shifted_phase);
    }
    samp *= 0.4;
  } else if (sel == 15) {
    float gain = 1.5 + u_pw * 3.5;
    float n = 1.0 + scan_pos * 7.0;
    float n_lo = floor(n);
    float frac_n = n - n_lo;
    float x = sin(shifted_phase * 6.28318530718);
    float x_prev = x;
    for (int i = 0; i < 8; i++) {
      if (float(i) >= n_lo + 1.0) break;
      x_prev = x;
      x = sin(gain * x);
    }
    samp = mix(x_prev, x, frac_n);
  } else if (sel == 16) {
    float ratio = 2.0 + scan_pos * 14.0;
    float r_lo = floor(ratio);
    float r_hi = r_lo + 1.0;
    float frac_r = ratio - r_lo;
    float carrier = sin(shifted_phase * 6.28318530718);
    float mod_lo = sin(r_lo * shifted_phase * 6.28318530718);
    float mod_hi = sin(r_hi * shifted_phase * 6.28318530718);
    float modulator = mod_lo * (1.0 - frac_r) + mod_hi * frac_r;
    samp = carrier * modulator;
  } else if (sel == 17) {
    float pd_amount = scan_pos * 1.8;
    float dp = shifted_phase;
    if (shifted_phase < 0.5) {
      dp = shifted_phase * (1.0 + pd_amount);
      dp = min(dp, 1.0);
    } else {
      float remaining = 1.0 - 0.5 * (1.0 + pd_amount);
      remaining = max(remaining, 0.001);
      dp = 0.5 * (1.0 + pd_amount) + (shifted_phase - 0.5) / 0.5 * remaining;
      dp = min(dp, 1.0);
    }
    float resonance = 1.0 + u_pw * 3.0;
    samp = sin(dp * resonance * 6.28318530718);
  } else if (sel == 18) {
    float offset = scan_pos;
    float density = 1.0 + u_pw * 2.0;
    samp = 0.0;
    for (int i = 0; i < 6; i++) {
      float freq = pow(2.0, float(i));
      float op = fract2(shifted_phase * freq * 0.5 + offset);
      float amp = sin(op * 3.14159265);
      samp += sin(op * density * 6.28318530718) * amp;
    }
    samp *= 0.25;
  } else if (sel == 19) {
    float sigma = 0.08 + scan_pos * 0.35;
    float freq = 3.0 + u_pw * 12.0;
    float t = shifted_phase - 0.5;
    float envelope = exp(-t * t / (2.0 * sigma * sigma));
    samp = envelope * cos(freq * 6.28318530718 * t);
  }

  // INVERT
  if (u_wave_invert > 0.5) samp = -samp;

  // RECTIFY
  if (u_fx_rectify > 0.5) {
    if (u_fx_rectify > 1.5) {
      samp = samp > 0.0 ? samp * 2.0 - 1.0 : -1.0;
    } else {
      samp = abs(samp) * 2.0 - 1.0;
    }
  }

  // RING MOD Y
  if (u_fx_ringmod > 0.01) {
    samp *= sin(scan_pos * u_fx_ringmod * 6.28318530718);
  }

  // SOFT SATURATION
  samp = tanh_approx(samp * u_soften);

  // ASYMMETRIC DRIVE
  if (abs(u_fx_asym) > 0.01) {
    float pos_drive = 1.0 + max(u_fx_asym, 0.0) * 5.0;
    float neg_drive = 1.0 + max(-u_fx_asym, 0.0) * 5.0;
    if (samp >= 0.0) samp = tanh_approx(samp * pos_drive);
    else samp = tanh_approx(samp * neg_drive);
  }

  // HARD CLIP
  if (u_fx_clip > 0.001) {
    float clip_drive = 1.0 + u_fx_clip * 20.0;
    samp = clamp(samp * clip_drive, -1.0, 1.0);
  }

  // BITCRUSH
  float current_crush = u_fx_crush * scan_pos;
  if (current_crush > 0.0) {
    float c_steps = max(1.0, 2.0 + (1.0 - current_crush) * 50.0);
    samp = floor(samp * c_steps) / c_steps;
  }

  // BIT OPS
  if (u_fx_bitop > 0.01) {
    float q = floor((samp * 0.5 + 0.5) * 255.0);
    float pattern = floor(shifted_phase * 255.0);
    float a = q; float b = floor(pattern * u_fx_bitop);
    float result = 0.0; float bit = 128.0;
    for (int i = 0; i < 8; i++) {
      float ba = step(bit, a); a -= ba * bit;
      float bb = step(bit, b); b -= bb * bit;
      result += abs(ba - bb) * bit;
      bit *= 0.5;
    }
    samp = result / 255.0 * 2.0 - 1.0;
  }

  // WAVEFOLDER
  float current_fold = u_fx_fold * scan_pos;
  if (current_fold > 0.0) {
    int fm = int(u_fold_mode);
    if (fm == 0) {
      float drive = 1.0 + (current_fold * 0.08);
      float safe_in = clamp(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm == 1) {
      float drive = 1.0 + (current_fold * 0.03);
      float safe_in = clamp(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm == 2) {
      float drive = 1.0 + (current_fold * 0.01);
      float safe_in = clamp(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm == 3) {
      float drive = 1.0 + (current_fold * 0.004);
      float safe_in = clamp(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm == 4) {
      float drive = 1.0 + (current_fold * 0.0015);
      float safe_in = clamp(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm == 5) {
      float drive = 1.0 + (current_fold * 0.02);
      float folded = samp * drive;
      folded = folded - 4.0 * floor((folded + 1.0) / 4.0);
      if (abs(folded) > 1.0) {
        folded = folded > 0.0 ? 2.0 - folded : -2.0 - folded;
      }
      samp = clamp(folded, -1.0, 1.0);
    } else if (fm == 6) {
      float drive = 1.0 + (current_fold * 0.25);
      float safe_in = clamp(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm == 7) {
      float drive = 1.0 + (current_fold * 1.0);
      float safe_in = clamp(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm == 8) {
      float drive = 1.0 + (current_fold * 8.0);
      float safe_in = clamp(samp * drive, -100000.0, 100000.0);
      samp = sin(safe_in);
    } else if (fm == 9) {
      float drive = 1.0 + (current_fold * 0.05);
      float folded = samp * drive;
      folded = folded - 4.0 * floor((folded + 1.0) / 4.0);
      if (abs(folded) > 1.0) {
        folded = folded > 0.0 ? 2.0 - folded : -2.0 - folded;
      }
      samp = clamp(folded, -1.0, 1.0);
    } else {
      float drive = 1.0 + (current_fold * 0.005);
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

float bayerMatrix(vec2 pos) {
  int x = int(mod(pos.x, 4.0));
  int y = int(mod(pos.y, 4.0));
  int idx = x + y * 4;
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

vec3 computeColor(vec2 uv) {
  float raw_phase = (uv.x * u_size + 1.0) / (u_size + 1.0);
  float scan_pos = (uv.y * u_size + 1.0) / (u_size + 1.0);
  float sample_val = generateSample(raw_phase, scan_pos);

  // COMB FILTER
  if (u_fx_comb > 0.001) {
    float comb_samp = generateSample(raw_phase - u_fx_comb, scan_pos);
    sample_val = (sample_val + comb_samp) * 0.5;
  }

  // SLEW LIMIT
  if (u_fx_slew > 0.01) {
    float delta = 1.0 / u_size;
    float left_samp = generateSample(raw_phase - delta, scan_pos);
    float right_samp = generateSample(raw_phase + delta, scan_pos);
    float smoothed = (left_samp + sample_val + right_samp) / 3.0;
    sample_val = mix(sample_val, smoothed, u_fx_slew);
  }

  float colorVal = (sample_val + 1.0) * 0.5;
  vec3 col = getPaletteColor(colorVal);

  // Hue shift via Rodrigues rotation
  if (abs(u_hue_shift) > 0.5) {
    float angle = u_hue_shift * 0.01745329252;
    float cosA = cos(angle);
    float sinA = sin(angle);
    float k = 0.57735026919;
    vec3 kv = vec3(k);
    col = col * cosA + cross(kv, col) * sinA + kv * dot(kv, col) * (1.0 - cosA);
    col = clamp(col, 0.0, 1.0);
  }

  return col;
}

void main() {
  vec2 uv = v_uv;

  // Ripple
  if (u_pp_ripple > 0.5) {
    uv.x += sin(uv.y * 20.0 + u_time * 0.04) * 0.02;
    uv.y += cos(uv.x * 20.0 + u_time * 0.04) * 0.02;
    uv = clamp(uv, 0.0, 1.0);
  }

  vec3 col = computeColor(uv);

  // Sharpen
  if (u_pp_sharpen > 0.5) {
    vec2 texel = vec2(1.0 / u_canvas_size);
    vec3 cN = computeColor(uv + vec2(0.0, texel.y));
    vec3 cS = computeColor(uv - vec2(0.0, texel.y));
    vec3 cE = computeColor(uv + vec2(texel.x, 0.0));
    vec3 cW = computeColor(uv - vec2(texel.x, 0.0));
    vec3 blur = (cN + cS + cE + cW) * 0.25;
    col = col + (col - blur) * 1.2;
  }

  // Edge detect
  if (u_pp_edge_detect > 0.5) {
    vec2 texel = vec2(1.0 / u_canvas_size);
    vec3 cN = computeColor(uv + vec2(0.0, texel.y));
    vec3 cS = computeColor(uv - vec2(0.0, texel.y));
    vec3 cE = computeColor(uv + vec2(texel.x, 0.0));
    vec3 cW = computeColor(uv - vec2(texel.x, 0.0));
    vec3 edgeH = abs(cE - cW);
    vec3 edgeV = abs(cN - cS);
    col = sqrt(edgeH * edgeH + edgeV * edgeV) * 3.0;
  }

  vec2 pixCoord = uv * u_canvas_size;

  // Bayer dithering
  if (u_pp_dither_bayer > 0.5) {
    vec2 ditherCoord = floor(pixCoord / u_pp_dither_bayer_scale);
    float dith = bayerMatrix(ditherCoord) - 0.5;
    col += dith * (0.06 + u_pp_dither_bayer_scale * 0.015);
  }

  // Noise dithering
  if (u_pp_dither_noise > 0.5) {
    vec2 cell = floor(pixCoord / u_pp_dither_noise_scale);
    float noise = fract2(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    col += noise * (0.08 + u_pp_dither_noise_scale * 0.012);
  }

  // Line dithering
  if (u_pp_dither_lines > 0.5) {
    float row = floor(pixCoord.y / u_pp_dither_lines_scale);
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    float pattern = mod(row, 2.0);
    float strength = 0.06 + u_pp_dither_lines_scale * 0.02;
    col += (pattern - 0.5) * strength * (1.0 - lum * 0.5);
  }

  // Posterize
  if (u_pp_posterize > 0.5) {
    float levels = 6.0;
    col = floor(col * levels + 0.5) / levels;
  }

  // Film grain
  if (u_pp_grain > 0.5) {
    float grain = fract2(sin(dot(pixCoord + u_time, vec2(12.9898, 78.233))) * 43758.5453);
    col += (grain - 0.5) * 0.12;
  }

  // Halftone
  if (u_pp_halftone > 0.5) {
    float dotSize = u_pp_halftone_scale;
    vec2 cell = floor(pixCoord / dotSize) * dotSize + dotSize * 0.5;
    float dist = length(pixCoord - cell) / (dotSize * 0.5);
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(0.0), col, step(dist, lum));
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
const ISO_MAX_GRID = 256;
const ISO_STRIDE = 6;
let isoUintExt = null;

// ============================================================
// WEBGL INITIALIZATION
// ============================================================

function initIsoWebGL() {
  if (!gl) return false;
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
  isoUintExt = gl.getExtension('OES_element_index_uint');
  let maxVerts = (ISO_MAX_GRID + 1) * (ISO_MAX_GRID + 1);
  let maxIndices = ISO_MAX_GRID * ISO_MAX_GRID * 6;
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
    console.warn('WebGL not available');
    return false;
  }

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

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  let aPos = gl.getAttribLocation(shaderProgram, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  let names = ['u_shape','u_pw','u_soften','u_y_bend','u_fx_bend','u_fx_noise',
               'u_fx_quantize','u_pw_morph','u_fx_fold','u_fold_mode','u_fx_crush',
               'u_fx_rectify','u_fx_clip','u_fx_asym','u_fx_ringmod',
               'u_fx_comb','u_fx_slew','u_fx_bitop','u_size',
               'u_pp_dither_bayer','u_pp_dither_bayer_scale',
               'u_pp_dither_noise','u_pp_dither_noise_scale',
               'u_pp_dither_lines','u_pp_dither_lines_scale',
               'u_pp_posterize','u_pp_grain',
               'u_pp_sharpen','u_pp_halftone','u_pp_halftone_scale',
               'u_pp_edge_detect','u_pp_ripple',
               'u_time','u_canvas_size','u_hue_shift',
               'u_wave_mirror','u_wave_invert'];
  for (let n of names) uLocations[n] = gl.getUniformLocation(shaderProgram, n);
  for (let i = 0; i < 7; i++) {
    uLocations['u_palette_' + i] = gl.getUniformLocation(shaderProgram, 'u_palette[' + i + ']');
  }
  return true;
}

function resizeGLCanvas() {
  if (!gl) return;
  glCanvas.width = renderSize;
  glCanvas.height = renderSize;
  gl.viewport(0, 0, renderSize, renderSize);
  gl.useProgram(shaderProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  let aPos = gl.getAttribLocation(shaderProgram, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
}

// ============================================================
// P5.JS SETUP & DRAW
// ============================================================

function setup() {
  // Size canvas to fill viewport (square)
  DISPLAY_SIZE = Math.min(windowWidth, windowHeight);
  canvas = createCanvas(DISPLAY_SIZE, DISPLAY_SIZE);
  canvas.parent('sketch-container');
  pixelDensity(1);
  noSmooth();

  if (!initWebGL()) {
    console.error('WebGL required but not available');
    return;
  }
  initIsoWebGL();

  // Generate deterministic initial state from fxhash
  generateFeatures();
}

function windowResized() {
  DISPLAY_SIZE = Math.min(windowWidth, windowHeight);
  resizeCanvas(DISPLAY_SIZE, DISPLAY_SIZE);
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

  let timeSinceRender = currentTime - lastRenderTime;
  if (needsRender && timeSinceRender >= 1000 / TARGET_UPDATE_FPS) {
    if (viewMode === '2d') {
      renderWavetable();
    } else {
      renderIsometric();
    }
    lastRenderTime = currentTime;
    needsRender = false;
  }

  if (viewMode === '2d') {
    drawingContext.imageSmoothingEnabled = smoothUpscale;
    drawingContext.drawImage(glCanvas, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
  }

  // Trigger fxhash preview after first rendered frame
  if (frameCount === 1) {
    $fx.preview();
  }
}

// ============================================================
// ANIMATION SYSTEM
// ============================================================

function updateAnimation() {
  switch (animMode) {
    case 'drift': animDrift(); break;
    case 'lfo': animLFO(); break;
    case 'chaos': animChaos(); break;
    case 'sequencer': animSequencer(); break;
    case 'bounce': animBounce(); break;
  }
}

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
  setTarget('fx_clip', map(noise(animTime * speed * 0.22 + 800), 0, 1, 0, 0.6) * drift);
  setTarget('fx_asym', map(noise(animTime * speed * 0.18 + 900), 0, 1, -0.8, 0.8) * drift);
  setTarget('fx_ringmod', map(noise(animTime * speed * 0.12 + 1000), 0, 1, 0, 15) * drift);
  setTarget('fx_comb', map(noise(animTime * speed * 0.28 + 1100), 0, 1, 0, 0.3) * drift);
  setTarget('fx_slew', map(noise(animTime * speed * 0.16 + 1200), 0, 1, 0, 0.4) * drift);
  setTarget('fx_bitop', map(noise(animTime * speed * 0.14 + 1300), 0, 1, 0, 0.5) * drift);
}

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
  setTarget('fx_clip', Math.abs(Math.sin(t * 0.22)) * 0.5 * d);
  setTarget('fx_asym', Math.sin(t * 0.18) * 0.7 * d);
  setTarget('fx_ringmod', Math.abs(Math.sin(t * 0.12)) * 12 * d);
  setTarget('fx_comb', Math.abs(Math.sin(t * 0.28)) * 0.25 * d);
  setTarget('fx_slew', Math.abs(Math.sin(t * 0.16)) * 0.4 * d);
  setTarget('fx_bitop', Math.abs(Math.sin(t * 0.14)) * 0.4 * d);
}

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
  setTarget('fx_clip', Math.abs(nx) * 0.5 * d);
  setTarget('fx_asym', ny * 0.7 * d);
  setTarget('fx_ringmod', Math.abs(nz) * 12 * d);
  setTarget('fx_comb', Math.abs(nx) * 0.25 * d);
  setTarget('fx_slew', Math.abs(ny) * 0.4 * d);
  setTarget('fx_bitop', Math.abs(nz) * 0.4 * d);
}

function animSequencer() {
  let stepDur = 4.0 / animSpeed;
  seqTimer += deltaTime * 0.001;
  if (seqTimer >= stepDur) {
    seqTimer -= stepDur;
    seqStep = (seqStep + 1) % SEQ_PRESETS.length;
    let preset = SEQ_PRESETS[seqStep];
    targetParams.shape = preset.shape;
    params.shape = preset.shape;
  }
  let preset = SEQ_PRESETS[seqStep];
  let nextPreset = SEQ_PRESETS[(seqStep + 1) % SEQ_PRESETS.length];
  let t = seqTimer / stepDur;
  t = t * t * (3 - 2 * t);
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
  let st = animTime * animSpeed * 0.3;
  setTarget('fx_clip', Math.abs(Math.sin(st * 0.23)) * 0.5 * d);
  setTarget('fx_asym', Math.sin(st * 0.19) * 0.7 * d);
  setTarget('fx_ringmod', Math.abs(Math.sin(st * 0.11)) * 12 * d);
  setTarget('fx_comb', Math.abs(Math.sin(st * 0.29)) * 0.25 * d);
  setTarget('fx_slew', Math.abs(Math.sin(st * 0.37)) * 0.4 * d);
  setTarget('fx_bitop', Math.abs(Math.sin(st * 0.31)) * 0.4 * d);
}

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
  setTarget('fx_clip', Math.abs(Math.sin(t * 0.23 + bouncePhases.fx_clip)) * 0.6 * d);
  setTarget('fx_asym', Math.sin(t * 0.19 + bouncePhases.fx_asym) * 0.8 * d);
  setTarget('fx_ringmod', Math.abs(Math.sin(t * 0.11 + bouncePhases.fx_ringmod)) * 15 * d);
  setTarget('fx_comb', Math.abs(Math.sin(t * 0.29 + bouncePhases.fx_comb)) * 0.3 * d);
  setTarget('fx_slew', Math.abs(Math.sin(t * 0.37 + bouncePhases.fx_slew)) * 0.4 * d);
  setTarget('fx_bitop', Math.abs(Math.sin(t * 0.31 + bouncePhases.fx_bitop)) * 0.5 * d);
}

function interpolateParams() {
  let dt = deltaTime * 0.001;
  let base = dt * animSpeed * 2;
  for (let k of ANIM_PARAMS) {
    let spd = 1.0 - pow(0.5, base * paramRanges[k]);
    params[k] = lerp(params[k], targetParams[k], spd);
  }
}

// ============================================================
// CPU SAMPLE GENERATOR (for isometric 3D view)
// ============================================================

function generateSampleCPU(raw_phase, scan_pos) {
  let y_bend = params.y_bend;
  if (abs(y_bend) > 0.001) {
    let power = pow(2.0, y_bend * -2.5);
    scan_pos = pow(scan_pos, power);
  }

  let noisy_phase = raw_phase;
  if (params.fx_noise > 0.0) {
    let h = fract(sin(raw_phase * 12.9898) * 43758.5453);
    let dirt = (h * 2.0 - 1.0) * (params.fx_noise * 0.1);
    noisy_phase = raw_phase + dirt;
  }

  let quant_phase = noisy_phase;
  if (params.fx_quantize > 0.0) {
    let q_val = pow(params.fx_quantize, 0.5);
    let steps = 2.0 + (1.0 - q_val) * 100.0;
    quant_phase = floor(noisy_phase * steps) / steps;
  }

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

  if (params.wave_mirror) final_phase = 1.0 - final_phase;

  let morph_amt = params.pw_morph * scan_pos * 0.1;
  let shift_val = (params.pw - 0.5) + morph_amt;
  let shifted_phase = fract(final_phase + shift_val);
  let sel = floor(params.shape);
  let samp = 0.0;

  if (sel === 0) {
    samp = sin(shifted_phase * TWO_PI);
  } else if (sel === 1) {
    samp = 1.0 - abs((shifted_phase * 2.0) - 1.0) * 2.0;
  } else if (sel === 2) {
    samp = (shifted_phase * 2.0) - 1.0;
  } else if (sel === 3) {
    let current_width = constrain(params.pw + morph_amt, 0.0, 1.0);
    let edge = Math.max(0.001, 0.5 / params.soften);
    let t = constrain((final_phase - (current_width - edge)) / (2 * edge), 0, 1);
    samp = 1.0 - t * t * (3 - 2 * t) * 2.0;
  } else if (sel === 4) {
    samp = sin(shifted_phase * TWO_PI);
    samp = samp > 0 ? samp * 2.0 - 1.0 : -1.0;
  } else if (sel === 5) {
    samp = sin(shifted_phase * TWO_PI);
    samp = floor(samp * 4.0) / 4.0;
  } else if (sel === 6) {
    let t = shifted_phase * 2.0 - 1.0;
    samp = 1.0 - 2.0 * t * t;
  } else if (sel === 7) {
    let s1 = fract(shifted_phase) * 2.0 - 1.0;
    let s2 = fract(shifted_phase * 1.006 + 0.1) * 2.0 - 1.0;
    let s3 = fract(shifted_phase * 0.994 + 0.2) * 2.0 - 1.0;
    samp = (s1 + s2 + s3) / 3.0;
  } else if (sel === 8) {
    let n = 1.0 + scan_pos * 7.0;
    let n_lo = floor(n);
    let n_hi = n_lo + 1;
    let frac_n = n - n_lo;
    samp = sin(n_lo * PI * shifted_phase) * (1.0 - frac_n) + sin(n_hi * PI * shifted_phase) * frac_n;
  } else if (sel === 9) {
    let x = shifted_phase * 2.0 - 1.0;
    x = constrain(x, -0.999, 0.999);
    let n = 1.0 + scan_pos * 7.0;
    let n_lo = floor(n);
    let frac_n = n - n_lo;
    samp = cos(n_lo * acos(x)) * (1.0 - frac_n) + cos((n_lo + 1) * acos(x)) * frac_n;
  } else if (sel === 10) {
    let mod_index = scan_pos * 8.0;
    let ratio = 2.0 + (params.pw - 0.5) * 2.0;
    samp = sin(TWO_PI * shifted_phase + mod_index * sin(TWO_PI * ratio * shifted_phase));
  } else if (sel === 11) {
    let num_h = 1.0 + scan_pos * 15.0;
    let n_lo_h = floor(num_h);
    let frac_h = num_h - n_lo_h;
    samp = 0.0;
    for (let k = 1; k <= 16; k++) {
      if (k > n_lo_h + 1) break;
      let amp = k <= n_lo_h ? 1.0 : frac_h;
      samp += amp * sin(k * TWO_PI * shifted_phase) / k;
    }
    samp *= 0.63;
  } else if (sel === 12) {
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
      bn *= b; an *= a;
    }
    samp *= 0.5;
  } else if (sel === 13) {
    let k = 1.0 + scan_pos * 7.0;
    samp = sin(pow(constrain(shifted_phase, 0.001, 0.999), k) * TWO_PI);
  } else if (sel === 14) {
    let formant_freq = 2.0 + scan_pos * 14.0;
    let bw = 0.3 + params.pw * 1.2;
    samp = 0.0;
    for (let k = 1; k <= 16; k++) {
      let dist = (k - formant_freq) / bw;
      samp += exp(-0.5 * dist * dist) * sin(k * TWO_PI * shifted_phase);
    }
    samp *= 0.4;
  } else if (sel === 15) {
    let gain = 1.5 + params.pw * 3.5;
    let n = 1.0 + scan_pos * 7.0;
    let n_lo = floor(n);
    let frac_n = n - n_lo;
    let x = sin(shifted_phase * TWO_PI);
    let x_prev = x;
    for (let i = 0; i < 8; i++) {
      if (i >= n_lo + 1) break;
      x_prev = x; x = sin(gain * x);
    }
    samp = x_prev * (1.0 - frac_n) + x * frac_n;
  } else if (sel === 16) {
    let ratio = 2.0 + scan_pos * 14.0;
    let r_lo = floor(ratio);
    let frac_r = ratio - r_lo;
    let carrier = sin(shifted_phase * TWO_PI);
    samp = carrier * (sin(r_lo * shifted_phase * TWO_PI) * (1.0 - frac_r) + sin((r_lo + 1) * shifted_phase * TWO_PI) * frac_r);
  } else if (sel === 17) {
    let pd_amount = scan_pos * 1.8;
    let dp = shifted_phase;
    if (shifted_phase < 0.5) {
      dp = Math.min(shifted_phase * (1.0 + pd_amount), 1.0);
    } else {
      let remaining = Math.max(1.0 - 0.5 * (1.0 + pd_amount), 0.001);
      dp = Math.min(0.5 * (1.0 + pd_amount) + (shifted_phase - 0.5) / 0.5 * remaining, 1.0);
    }
    samp = sin(dp * (1.0 + params.pw * 3.0) * TWO_PI);
  } else if (sel === 18) {
    let offset = scan_pos;
    let density = 1.0 + params.pw * 2.0;
    samp = 0.0;
    for (let i = 0; i < 6; i++) {
      let freq = pow(2.0, i);
      let op = (shifted_phase * freq * 0.5 + offset) % 1.0;
      samp += sin(op * density * TWO_PI) * sin(op * PI);
    }
    samp *= 0.25;
  } else if (sel === 19) {
    let sigma = 0.08 + scan_pos * 0.35;
    let freq = 3.0 + params.pw * 12.0;
    let t = shifted_phase - 0.5;
    samp = exp(-t * t / (2.0 * sigma * sigma)) * cos(freq * TWO_PI * t);
  }

  if (params.wave_invert) samp = -samp;

  if (params.fx_rectify > 0) {
    if (params.fx_rectify > 1) samp = samp > 0 ? samp * 2.0 - 1.0 : -1.0;
    else samp = abs(samp) * 2.0 - 1.0;
  }

  if (params.fx_ringmod > 0.01) samp *= sin(scan_pos * params.fx_ringmod * TWO_PI);

  samp = tanh_approx_cpu(samp * params.soften);

  if (abs(params.fx_asym) > 0.01) {
    let pos_drive = 1.0 + Math.max(params.fx_asym, 0.0) * 5.0;
    let neg_drive = 1.0 + Math.max(-params.fx_asym, 0.0) * 5.0;
    samp = samp >= 0 ? tanh_approx_cpu(samp * pos_drive) : tanh_approx_cpu(samp * neg_drive);
  }

  if (params.fx_clip > 0.001) {
    samp = constrain(samp * (1.0 + params.fx_clip * 20.0), -1.0, 1.0);
  }

  let current_crush = params.fx_crush * scan_pos;
  if (current_crush > 0.0) {
    let c_steps = max(1.0, 2.0 + (1.0 - current_crush) * 50.0);
    samp = floor(samp * c_steps) / c_steps;
  }

  if (params.fx_bitop > 0.01) {
    let q = Math.floor((samp * 0.5 + 0.5) * 255);
    let pattern = Math.floor(shifted_phase * 255);
    let b = Math.floor(pattern * params.fx_bitop);
    samp = ((q ^ b) & 255) / 255.0 * 2.0 - 1.0;
  }

  let current_fold = params.fx_fold * scan_pos;
  if (current_fold > 0.0) {
    let fm = floor(params.fold_mode);
    let drive;
    if (fm === 5 || fm === 9 || fm === 10) {
      // Triangle fold modes
      let rates = [0, 0, 0, 0, 0, 0.02, 0, 0, 0, 0.05, 0.005];
      drive = 1.0 + (current_fold * rates[fm]);
      let folded = samp * drive;
      folded = folded - 4.0 * floor((folded + 1.0) / 4.0);
      samp = abs(folded) <= 1.0 ? folded : (folded > 0.0 ? 2.0 - folded : -2.0 - folded);
      samp = constrain(samp, -1.0, 1.0);
    } else {
      let rates = [0.08, 0.03, 0.01, 0.004, 0.0015, 0, 0.25, 1.0, 8.0];
      drive = 1.0 + (current_fold * rates[fm]);
      samp = sin(constrain(samp * drive, -100000.0, 100000.0));
    }
  }

  if (isNaN(samp)) samp = 0.0;
  return constrain(samp, -1.0, 1.0);
}

// ============================================================
// RENDERING
// ============================================================

function renderWavetable() {
  let palette = palettes[currentPalette];
  if (glCanvas.width !== renderSize || glCanvas.height !== renderSize) {
    glCanvas.width = renderSize;
    glCanvas.height = renderSize;
  }
  gl.viewport(0, 0, renderSize, renderSize);
  gl.useProgram(shaderProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  let aPos = gl.getAttribLocation(shaderProgram, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

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
  gl.uniform1f(uLocations.u_fx_rectify, params.fx_rectify);
  gl.uniform1f(uLocations.u_fx_clip, params.fx_clip);
  gl.uniform1f(uLocations.u_fx_asym, params.fx_asym);
  gl.uniform1f(uLocations.u_fx_ringmod, params.fx_ringmod);
  gl.uniform1f(uLocations.u_fx_comb, params.fx_comb);
  gl.uniform1f(uLocations.u_fx_slew, params.fx_slew);
  gl.uniform1f(uLocations.u_fx_bitop, params.fx_bitop);
  gl.uniform1f(uLocations.u_size, renderSize);
  gl.uniform1f(uLocations.u_pp_dither_bayer, ppDitherBayer ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_pp_dither_bayer_scale, [1, 2, 4, 8][ppDitherBayerScale]);
  gl.uniform1f(uLocations.u_pp_dither_noise, ppDitherNoise ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_pp_dither_noise_scale, [1, 2, 4, 8][ppDitherNoiseScale]);
  gl.uniform1f(uLocations.u_pp_dither_lines, ppDitherLines ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_pp_dither_lines_scale, [1, 2, 4, 8][ppDitherLinesScale]);
  gl.uniform1f(uLocations.u_pp_posterize, ppPosterize ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_pp_grain, ppGrain ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_pp_sharpen, ppSharpen ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_pp_halftone, ppHalftone ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_pp_halftone_scale, [4, 6, 10, 16][ppHalftoneScale]);
  gl.uniform1f(uLocations.u_pp_edge_detect, ppEdgeDetect ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_pp_ripple, ppRipple ? 1.0 : 0.0);
  gl.uniform1f(uLocations.u_time, animTime * 100.0);
  gl.uniform1f(uLocations.u_canvas_size, renderSize);

  for (let i = 0; i < 7; i++) {
    let c = palette[i] || palette[palette.length - 1];
    gl.uniform3f(uLocations['u_palette_' + i], c[0]/255, c[1]/255, c[2]/255);
  }
  gl.uniform1f(uLocations.u_hue_shift, hueShift);
  gl.uniform1f(uLocations.u_wave_mirror, params.wave_mirror);
  gl.uniform1f(uLocations.u_wave_invert, params.wave_invert);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function getColorFromPalette(t, palette) {
  t = constrain(t, 0, 1);
  let scaledT = t * (palette.length - 1);
  let idx = floor(scaledT);
  let frac = scaledT - idx;
  if (idx >= palette.length - 1) return palette[palette.length - 1];
  let c1 = palette[idx];
  let c2 = palette[idx + 1];
  return [lerp(c1[0], c2[0], frac), lerp(c1[1], c2[1], frac), lerp(c1[2], c2[2], frac)];
}

// ============================================================
// ISOMETRIC HEIGHTMAP VIEW
// ============================================================

function projectPoint(nx, ny, nz) {
  let cosR = Math.cos(isoRotation), sinR = Math.sin(isoRotation);
  let rx = nx * cosR - ny * sinR;
  let ry = -(nx * sinR + ny * cosR);
  let cosT = Math.cos(isoTilt), sinT = Math.sin(isoTilt);
  let ty = ry * cosT - nz * sinT;
  let tz = ry * sinT + nz * cosT;
  let scale = DISPLAY_SIZE * 0.75 * isoZoom;
  let sx = DISPLAY_SIZE * 0.5 + rx * scale + isoPanX;
  let sy = DISPLAY_SIZE * 0.5 + ty * scale + isoPanY;
  return { x: sx, y: sy, z: tz };
}

function getIsoBg(palette) {
  let avg = 0;
  for (let c of palette) avg += (c[0] + c[1] + c[2]) / 3;
  avg /= palette.length;
  return avg > 128 ? [15, 15, 20] : [230, 228, 222];
}

function renderIsometric() {
  let palette = palettes[currentPalette];
  let gridRes = min(renderSize, ISO_MAX_GRID);
  let heightAmt = 0.3;

  if (isoShaderProgram) {
    renderIsometricWebGL(palette, gridRes, heightAmt);
    return;
  }

  // CPU fallback
  let bg = getIsoBg(palette);
  background(bg[0], bg[1], bg[2]);
  let grid = [];
  let projected = [];
  for (let gy = 0; gy <= gridRes; gy++) {
    let row = [];
    let projRow = [];
    for (let gx = 0; gx <= gridRes; gx++) {
      let phase = (gx + 1) / (gridRes + 2);
      let scan = (gy + 1) / (gridRes + 2);
      let sample = generateSampleCPU(phase, scan);
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

  let lightX = Math.cos(isoRotation + 0.8);
  let lightY = Math.sin(isoRotation + 0.8);

  let samples = new Float32Array(numVerts);
  for (let gy = 0; gy <= gridRes; gy++) {
    for (let gx = 0; gx <= gridRes; gx++) {
      let phase = (gx + 1) / (gridRes + 2);
      let scan = (gy + 1) / (gridRes + 2);
      samples[gy * (gridRes + 1) + gx] = generateSampleCPU(phase, scan);
    }
  }

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
      let rx = nx * cosR - ny * sinR;
      let ry = -(nx * sinR + ny * cosR);
      let ty = ry * cosT - nz * sinT;
      let tz = ry * sinT + nz * cosT;
      let sx = cx + rx * scale;
      let sy = cy + ty * scale;
      let clipX = sx * invDS * 2.0 - 1.0;
      let clipY = 1.0 - sy * invDS * 2.0;
      let depth = (1.0 - tz) * 0.5;
      let off = vi * ISO_STRIDE;
      vertData[off] = clipX;
      vertData[off + 1] = clipY;
      vertData[off + 2] = depth;
      vertData[off + 3] = 0;
      vertData[off + 4] = 0;
      vertData[off + 5] = 0;
    }
  }

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
      let dx = (s10 - s00 + s11 - s01) * 0.5;
      let dy = (s01 - s00 + s11 - s10) * 0.5;
      let shade = 0.85 + (dx * lightX + dy * lightY) * 0.5;
      if (shade < 0.35) shade = 0.35;
      if (shade > 1.5) shade = 1.5;
      let r = Math.min(col[0] * shade, 255) / 255;
      let g = Math.min(col[1] * shade, 255) / 255;
      let b = Math.min(col[2] * shade, 255) / 255;
      let corners = [i00, i10, i01, i11];
      for (let c = 0; c < 4; c++) {
        let ci = corners[c];
        colorAccum[ci * 3] += r;
        colorAccum[ci * 3 + 1] += g;
        colorAccum[ci * 3 + 2] += b;
        colorCount[ci]++;
      }
      let cellIdx = (gy * gridRes + gx) * 6;
      indexData[cellIdx] = i00;
      indexData[cellIdx + 1] = i10;
      indexData[cellIdx + 2] = i11;
      indexData[cellIdx + 3] = i00;
      indexData[cellIdx + 4] = i11;
      indexData[cellIdx + 5] = i01;
    }
  }

  for (let i = 0; i < numVerts; i++) {
    let cnt = colorCount[i];
    if (cnt > 0) {
      let off = i * ISO_STRIDE;
      vertData[off + 3] = colorAccum[i * 3] / cnt;
      vertData[off + 4] = colorAccum[i * 3 + 1] / cnt;
      vertData[off + 5] = colorAccum[i * 3 + 2] / cnt;
    }
  }

  if (glCanvas.width !== DISPLAY_SIZE || glCanvas.height !== DISPLAY_SIZE) {
    glCanvas.width = DISPLAY_SIZE;
    glCanvas.height = DISPLAY_SIZE;
  }
  gl.viewport(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
  let bg = getIsoBg(palette);
  gl.clearColor(bg[0]/255, bg[1]/255, bg[2]/255, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(isoShaderProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, isoVBO);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertData);
  let stride = ISO_STRIDE * 4;
  gl.enableVertexAttribArray(isoAttrLocs.a_pos);
  gl.vertexAttribPointer(isoAttrLocs.a_pos, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(isoAttrLocs.a_depth);
  gl.vertexAttribPointer(isoAttrLocs.a_depth, 1, gl.FLOAT, false, stride, 8);
  gl.enableVertexAttribArray(isoAttrLocs.a_color);
  gl.vertexAttribPointer(isoAttrLocs.a_color, 3, gl.FLOAT, false, stride, 12);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, isoIBO);
  gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, indexData);
  let indexType = isoUintExt ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
  gl.drawElements(gl.TRIANGLES, numCells * 6, indexType, 0);
  gl.disable(gl.DEPTH_TEST);
  gl.disableVertexAttribArray(isoAttrLocs.a_pos);
  gl.disableVertexAttribArray(isoAttrLocs.a_depth);
  gl.disableVertexAttribArray(isoAttrLocs.a_color);
  drawingContext.drawImage(glCanvas, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
}

// ============================================================
// MOUSE CONTROLS FOR ISO VIEW
// ============================================================

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
    isoTilt = constrain(isoTilt + dy * 0.006, 0.0, PI);
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
  return false;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function fract(x) {
  return x - floor(x);
}

function tanh_approx_cpu(x) {
  if (x > 3) return 1;
  if (x < -3) return -1;
  let x2 = x * x;
  return x * (27 + x2) / (27 + 9 * x2);
}

// ============================================================
// DETERMINISTIC FEATURE GENERATION (fxhash-seeded)
// ============================================================

let features = {};

function generateFeatures() {
  // --- Oscillator ---
  params.shape = rndInt(0, 19);
  params.pw = rnd();
  params.soften = expMap(R(), 0.001, 50);
  params.y_bend = rnd(-0.25, 1.0);

  params.fx_bend = rndBool(0.3) ? 0 : expMap(Math.pow(R(), 1.5), 0, 1000);
  params.fx_noise = rndBool(0.4) ? 0 : Math.pow(R(), 3) * 0.8;
  params.fx_quantize = rndBool(0.4) ? 0 : Math.pow(R(), 3) * 0.7;
  params.pw_morph = Math.pow(R(), 1.5) * 50 * (rndBool() ? -1 : 1);

  // fx_fold: 30% zero/low, 67% moderate, 3% extreme
  let foldRoll = R();
  if (foldRoll < 0.3) params.fx_fold = rnd(0, 50);
  else if (foldRoll < 0.97) params.fx_fold = expMap(Math.pow(R(), 1.5), 0, 2000);
  else params.fx_fold = expMap(R(), 5000, 10000);
  params.fold_mode = rndInt(0, 10);

  params.fx_crush = rndBool(0.35) ? 0 : expMap(Math.pow(R(), 1.5), 0, 1);

  let rectRoll = R();
  params.fx_rectify = rectRoll < 0.7 ? 0 : (rectRoll < 0.85 ? 1 : 2);
  params.fx_clip = rndBool(0.6) ? 0 : Math.pow(R(), 2) * 0.8;
  params.fx_asym = rndBool(0.6) ? 0 : (R() - 0.5) * 1.6;
  params.fx_ringmod = rndBool(0.7) ? 0 : 1 + R() * 19;
  params.fx_comb = rndBool(0.7) ? 0 : 0.01 + R() * 0.29;
  params.fx_slew = rndBool(0.8) ? 0 : R() * 0.5;
  params.fx_bitop = rndBool(0.8) ? 0 : Math.pow(R(), 2);

  // Wave mirror/invert (25% each)
  params.wave_mirror = rndBool(0.25) ? 1 : 0;
  params.wave_invert = rndBool(0.25) ? 1 : 0;

  // --- Palette + hue shift ---
  currentPalette = rndChoice(paletteNames);
  hueShift = rndInt(0, 359);

  // --- Animation ---
  let animModeChoice = rndChoice(ANIM_MODES);
  let resChoice = rndInt(0, RESOLUTIONS.length - 1);
  lockCategory = rndInt(0, LOCK_CATEGORIES.length - 1);

  randomizeParamRanges();
  applyRandomLocks();

  // Bounce phases (deterministic from hash)
  let bKeys = ['pw','soften','y_bend','fx_bend','fx_noise','fx_quantize','pw_morph','fx_fold','fx_crush',
               'fx_clip','fx_asym','fx_ringmod','fx_comb','fx_slew','fx_bitop'];
  for (let k of bKeys) bouncePhases[k] = R() * Math.PI * 2;

  let aSpd = rnd(0.15, 0.6);
  let aDrift = rnd(0.2, 0.8);

  // Ensure visible animation
  let unlocked = ANIM_PARAMS.filter(k => !paramLocks[k]);
  let visualParams = ['fx_fold','fx_bend','pw_morph','y_bend','fx_noise','fx_quantize'];
  let unlockedVisual = unlocked.filter(k => visualParams.includes(k));
  if (unlocked.length > 0 && !unlocked.some(k => paramRanges[k] >= 1.0)) {
    let pick = unlockedVisual.length > 0 ? unlockedVisual : unlocked;
    paramRanges[rndChoice(pick)] = 1.0;
  }

  // Post-FX: each has <10% chance to trigger
  ppDitherBayer = rndBool(0.07);
  ppDitherBayerScale = rndInt(0, 3);
  ppDitherNoise = rndBool(0.05);
  ppDitherNoiseScale = rndInt(0, 3);
  ppDitherLines = rndBool(0.05);
  ppDitherLinesScale = rndInt(0, 3);
  ppPosterize = rndBool(0.06);
  ppGrain = rndBool(0.08);
  ppSharpen = rndBool(0.06);
  ppHalftone = rndBool(0.05);
  ppHalftoneScale = rndInt(0, 3);
  ppEdgeDetect = rndBool(0.04);
  ppRipple = rndBool(0.025);

  // Oscillator names for features
  const OSC_NAMES = ['Sine','Triangle','Sawtooth','Pulse','HalfRect','Staircase',
    'Parabolic','SuperSaw','Schrodinger','Chebyshev','FM','Harmonic',
    'Fractal','Chirp','Formant','Chaos','RingMod','PhaseDist','Shepard','Wavelet'];

  const FOLD_NAMES = ['Shred','Drive','Warm','Soft','Whisper','Crease',
    'Harsh','Mangle','Destroy','Fracture','Ripple'];

  // Store features
  features = {
    oscillator: OSC_NAMES[params.shape],
    palette: currentPalette,
    hueShift: hueShift,
    foldMode: FOLD_NAMES[params.fold_mode],
    animMode: animModeChoice,
    hasFold: params.fx_fold > 50,
    hasCrush: params.fx_crush > 0,
    mirror: params.wave_mirror === 1,
    invert: params.wave_invert === 1
  };

  // Register features with fxhash
  $fx.features({
    "Oscillator": features.oscillator,
    "Palette": features.palette.charAt(0).toUpperCase() + features.palette.slice(1),
    "Hue Shift": hueShift > 0 ? hueShift + "°" : "None",
    "Fold Mode": features.foldMode,
    "Animation": animModeChoice.charAt(0).toUpperCase() + animModeChoice.slice(1),
    "Has Fold": features.hasFold ? "Yes" : "No",
    "Has Crush": features.hasCrush ? "Yes" : "No",
    "Mirror": features.mirror ? "Yes" : "No",
    "Invert": features.invert ? "Yes" : "No"
  });

  // Apply to state
  targetParams = { ...params };
  animSpeed = aSpd;
  driftAmount = aDrift;
  animMode = animModeChoice;
  if (animMode === 'chaos') { lorenzX = 1; lorenzY = 1; lorenzZ = 1; }
  if (animMode === 'sequencer') { seqStep = 0; seqTimer = 0; }

  // Set resolution
  resolutionIndex = constrain(resChoice, 0, RESOLUTIONS.length - 1);
  renderSize = RESOLUTIONS[resolutionIndex];
  if (gl) resizeGLCanvas();

  needsRender = true;
}

window.getFeatures = function() { return features; };

function randomizeParamRanges() {
  for (let k of ANIM_PARAMS) {
    paramRanges[k] = rndChoice(ANIM_RANGES);
  }
}

// ============================================================
// KEYBOARD CONTROLS (minimal for fxhash)
// ============================================================

function keyPressed() {
  switch (key) {
    case 's':
    case 'S':
      saveCanvas(fxhash.slice(0, 12), 'png');
      break;
    case 'v':
    case 'V':
      viewMode = viewMode === '2d' ? 'iso' : '2d';
      needsRender = true;
      break;
    case 'p':
    case 'P':
    case ' ':
      isAnimating = !isAnimating;
      break;
    case '=':
    case '+':
      animSpeed = min(1.0, animSpeed + 0.1);
      break;
    case '-':
    case '_':
      animSpeed = max(0.01, animSpeed - 0.1);
      break;
  }
}

// Expose p5.js lifecycle functions to global scope
// (required when bundled by fxhash CLI webpack)
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.mousePressed = mousePressed;
window.mouseDragged = mouseDragged;
window.mouseReleased = mouseReleased;
window.mouseWheel = mouseWheel;
window.keyPressed = keyPressed;
