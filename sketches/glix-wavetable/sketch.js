// ==========================================
//   GLIX WAVETABLE GENERATOR - p5.js Visual
//   Based on GenDSP v2.3 - WebGL Shader
// ==========================================

let canvas;
const DISPLAY_SIZE = 700;

// --- WebGL SHADER RENDERER ---
let glCanvas, gl, shaderProgram, quadVAO;
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
const RESOLUTIONS = [64, 128, 256, 512, 1024, 2048];
let resolutionIndex = 3; // Default 512
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
  fx_crush: 0.0,      // Bitcrush (0-10000)
  edge_fade: 0.0      // De-clicker (0-0.5)
};

// Animation targets (for smooth interpolation)
let targetParams = { ...params };
let animSpeed = 0.3;
let driftAmount = 0.5;
let isAnimating = true;
let animTime = 0;

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
  magma: [
    [0, 0, 4],
    [28, 16, 68],
    [79, 18, 123],
    [136, 34, 106],
    [199, 56, 80],
    [243, 117, 75],
    [252, 253, 191]
  ],
  arctic: [
    [10, 20, 40],
    [20, 50, 90],
    [40, 100, 160],
    [100, 180, 220],
    [180, 220, 240],
    [220, 240, 250],
    [245, 250, 255]
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
  solar: [
    [10, 5, 0],
    [50, 20, 0],
    [120, 50, 5],
    [200, 100, 10],
    [255, 180, 30],
    [255, 230, 100],
    [255, 255, 200]
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
  ]
};

let currentPalette = 'thermal';
let paletteNames = Object.keys(palettes);
let pixelBuffer;

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
uniform float u_fx_crush;
uniform float u_edge_fade;
uniform float u_size;
uniform vec3 u_palette[7];

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
  }

  // SOFT SATURATION
  samp = tanh_approx(samp * u_soften);

  // BITCRUSH
  float current_crush = u_fx_crush * scan_pos;
  if (current_crush > 0.0) {
    float safe_crush = clamp(current_crush, 0.0, 1.0);
    float c_steps = 2.0 + (1.0 - safe_crush) * 50.0;
    if (current_crush > 1.0) c_steps = 1.0;
    samp = floor(samp * c_steps) / c_steps;
  }

  // WAVEFOLDER
  float current_fold = u_fx_fold * scan_pos;
  if (current_fold > 0.0) {
    float drive = 1.0 + (current_fold * 0.008);
    float safe_in = clamp(samp * drive, -100000.0, 100000.0);
    samp = sin(safe_in);
  }

  // EDGE FADE
  if (u_edge_fade > 0.0) {
    float f_in = smoothstep2(0.0, u_edge_fade, raw_phase);
    float f_out = smoothstep2(1.0, 1.0 - u_edge_fade, raw_phase);
    samp = samp * f_in * f_out;
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

void main() {
  float raw_phase = (v_uv.x * u_size + 1.0) / (u_size + 1.0);
  float scan_pos = (v_uv.y * u_size + 1.0) / (u_size + 1.0);
  float sample = generateSample(raw_phase, scan_pos);
  float colorVal = (sample + 1.0) * 0.5;
  vec3 col = getPaletteColor(colorVal);
  gl_FragColor = vec4(col, 1.0);
}`;

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
  let buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  let aPos = gl.getAttribLocation(shaderProgram, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Cache uniform locations
  let names = ['u_shape','u_pw','u_soften','u_y_bend','u_fx_bend','u_fx_noise',
               'u_fx_quantize','u_pw_morph','u_fx_fold','u_fx_crush','u_edge_fade','u_size'];
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
}

let useWebGL = false;

function setup() {
  canvas = createCanvas(DISPLAY_SIZE, DISPLAY_SIZE);
  canvas.parent('sketch-holder');
  pixelDensity(1);
  noSmooth();

  useWebGL = initWebGL();
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
    renderWavetable();
    lastRenderTime = currentTime;
    needsRender = false;
  }

  // Always draw the buffer (scaled up)
  if (viewMode === '2d') {
    if (useWebGL) {
      // Draw WebGL canvas onto p5 canvas (crisp upscale)
      drawingContext.imageSmoothingEnabled = false;
      drawingContext.drawImage(glCanvas, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
    } else {
      image(pixelBuffer, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
    }
  } else {
    renderIsometric();
  }
}

// --- ANIMATION SYSTEM ---
function updateAnimation() {
  // Slowly drift target parameters using noise
  let drift = driftAmount;
  let speed = animSpeed * 0.1;

  // Different parameters drift at different rates
  targetParams.y_bend = map(noise(animTime * speed * 0.3), 0, 1, -0.25, 1.0) * drift + params.y_bend * (1 - drift * 0.01);
  targetParams.fx_bend = map(noise(animTime * speed * 0.2 + 100), 0, 1, 0, 500) * drift;
  targetParams.pw_morph = map(noise(animTime * speed * 0.4 + 200), 0, 1, -25, 25) * drift;
  targetParams.fx_fold = map(noise(animTime * speed * 0.15 + 300), 0, 1, 50, 2000) * drift + 100 * (1 - drift);
  targetParams.pw = map(noise(animTime * speed * 0.5 + 400), 0, 1, 0.2, 1.0);
  targetParams.fx_noise = map(noise(animTime * speed * 0.25 + 500), 0, 1, 0, 0.3) * drift;
  targetParams.fx_quantize = map(noise(animTime * speed * 0.2 + 600), 0, 1, 0, 0.5) * drift;
  targetParams.soften = map(noise(animTime * speed * 0.35 + 700), 0, 1, 1, 20);
  targetParams.edge_fade = map(noise(animTime * speed * 0.1 + 800), 0, 1, 0, 0.2) * drift;
}

function interpolateParams() {
  // Very gradual interpolation for smooth 30fps updates
  // Using frame-rate independent lerp factor
  let dt = deltaTime * 0.001; // seconds
  let lerp_speed = 1.0 - pow(0.5, dt * animSpeed * 2);

  params.y_bend = lerp(params.y_bend, targetParams.y_bend, lerp_speed);
  params.fx_bend = lerp(params.fx_bend, targetParams.fx_bend, lerp_speed);
  params.pw_morph = lerp(params.pw_morph, targetParams.pw_morph, lerp_speed);
  params.fx_fold = lerp(params.fx_fold, targetParams.fx_fold, lerp_speed);
  params.pw = lerp(params.pw, targetParams.pw, lerp_speed);
  params.fx_noise = lerp(params.fx_noise, targetParams.fx_noise, lerp_speed);
  params.fx_quantize = lerp(params.fx_quantize, targetParams.fx_quantize, lerp_speed);
  params.soften = lerp(params.soften, targetParams.soften, lerp_speed);
  params.edge_fade = lerp(params.edge_fade, targetParams.edge_fade, lerp_speed);

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
  }

  // Soft Saturation
  samp = tanh_approx(samp * params.soften);

  // BITCRUSH
  let current_crush = params.fx_crush * scan_pos;
  if (current_crush > 0.0) {
    let safe_crush = constrain(current_crush, 0.0, 1.0);
    let c_steps = 2.0 + (1.0 - safe_crush) * 50.0;
    if (current_crush > 1.0) {
      c_steps = 1.0;
    }
    samp = floor(samp * c_steps) / c_steps;
  }

  // WAVEFOLDER
  let current_fold = params.fx_fold * scan_pos;
  if (current_fold > 0.0) {
    let drive = 1.0 + (current_fold * 0.008);
    let safe_in = constrain(samp * drive, -100000.0, 100000.0);
    samp = sin(safe_in);
  }

  // EDGE FADE (DE-CLICKER)
  if (params.edge_fade > 0.0) {
    let f_in = smoothstep(0.0, params.edge_fade, raw_phase);
    let f_out = smoothstep(1.0, 1.0 - params.edge_fade, raw_phase);
    samp = samp * f_in * f_out;
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
  gl.viewport(0, 0, renderSize, renderSize);
  gl.useProgram(shaderProgram);

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
  gl.uniform1f(uLocations.u_fx_crush, params.fx_crush);
  gl.uniform1f(uLocations.u_edge_fade, params.edge_fade);
  gl.uniform1f(uLocations.u_size, renderSize);

  // Set palette colors (normalized 0-1)
  for (let i = 0; i < 7; i++) {
    let c = palette[i] || palette[palette.length - 1];
    gl.uniform3f(uLocations['u_palette_' + i], c[0]/255, c[1]/255, c[2]/255);
  }

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
  background(10, 10, 15);

  let palette = palettes[currentPalette];
  let gridRes = min(renderSize, 128); // cap grid for perf
  let heightAmt = 0.3; // height relative to grid size

  // Pre-compute the sample grid + projected points
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

      // Map grid to centered normalized coords
      let nx = (gx / gridRes) - 0.5;
      let ny = (gy / gridRes) - 0.5;
      let nz = ((sample + 1) * 0.5) * heightAmt;
      projRow.push(projectPoint(nx, ny, nz));
    }
    grid.push(row);
    projected.push(projRow);
  }

  // Determine draw order: sort quads by average depth (z), back to front
  let quads = [];
  for (let gy = 0; gy < gridRes; gy++) {
    for (let gx = 0; gx < gridRes; gx++) {
      let avgZ = (projected[gy][gx].z + projected[gy][gx+1].z +
                  projected[gy+1][gx].z + projected[gy+1][gx+1].z) * 0.25;
      quads.push({ gx, gy, z: avgZ });
    }
  }
  quads.sort((a, b) => a.z - b.z); // back to front

  // Draw quads
  push();
  strokeWeight(0.5);

  for (let q of quads) {
    let gx = q.gx;
    let gy = q.gy;

    let s00 = grid[gy][gx];
    let s10 = grid[gy][gx + 1];
    let s01 = grid[gy + 1][gx];
    let s11 = grid[gy + 1][gx + 1];

    let avgSample = (s00 + s10 + s01 + s11) * 0.25;
    let colorVal = (avgSample + 1) * 0.5;
    let col = getColorFromPalette(colorVal, palette);

    let p00 = projected[gy][gx];
    let p10 = projected[gy][gx + 1];
    let p01 = projected[gy + 1][gx];
    let p11 = projected[gy + 1][gx + 1];

    // Shading from surface normal approximation
    let dx = (s10 - s00 + s11 - s01) * 0.5;
    let dy = (s01 - s00 + s11 - s10) * 0.5;
    // Light direction affected by rotation
    let lightX = Math.cos(isoRotation + 0.8);
    let lightY = Math.sin(isoRotation + 0.8);
    let shade = 0.85 + (dx * lightX + dy * lightY) * 0.5;
    shade = constrain(shade, 0.35, 1.5);

    fill(
      constrain(col[0] * shade, 0, 255),
      constrain(col[1] * shade, 0, 255),
      constrain(col[2] * shade, 0, 255)
    );
    stroke(
      constrain(col[0] * shade * 0.5, 0, 255),
      constrain(col[1] * shade * 0.5, 0, 255),
      constrain(col[2] * shade * 0.5, 0, 255),
      60
    );

    beginShape();
    vertex(p00.x, p00.y);
    vertex(p10.x, p10.y);
    vertex(p11.x, p11.y);
    vertex(p01.x, p01.y);
    endShape(CLOSE);
  }

  pop();
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

  // Sliders
  setupSlider('pw', 0, 100, v => {
    params.pw = v / 100;
    targetParams.pw = params.pw;
  }, v => (v / 100).toFixed(2));

  setupSlider('soften', 1, 500, v => {
    params.soften = v / 10;
    targetParams.soften = params.soften;
  }, v => (v / 10).toFixed(2));

  setupSlider('ybend', 0, 100, v => {
    params.y_bend = map(v, 0, 100, -0.25, 1.0);
    targetParams.y_bend = params.y_bend;
  }, v => map(v, 0, 100, -0.25, 1.0).toFixed(2));

  setupSlider('fxbend', 0, 100, v => {
    params.fx_bend = map(v, 0, 100, 0, 1000);
    targetParams.fx_bend = params.fx_bend;
  }, v => map(v, 0, 100, 0, 1000).toFixed(0));

  setupSlider('fxnoise', 0, 100, v => {
    params.fx_noise = v / 100;
    targetParams.fx_noise = params.fx_noise;
  }, v => (v / 100).toFixed(2));

  setupSlider('fxquant', 0, 100, v => {
    params.fx_quantize = v / 100;
    targetParams.fx_quantize = params.fx_quantize;
  }, v => (v / 100).toFixed(2));

  setupSlider('pwmorph', 0, 100, v => {
    params.pw_morph = map(v, 0, 100, -50, 50);
    targetParams.pw_morph = params.pw_morph;
  }, v => map(v, 0, 100, -50, 50).toFixed(1));

  setupSlider('fold', 0, 100, v => {
    params.fx_fold = map(v, 0, 100, 0, 10000);
    targetParams.fx_fold = params.fx_fold;
  }, v => map(v, 0, 100, 0, 10000).toFixed(0));

  setupSlider('crush', 0, 100, v => {
    params.fx_crush = map(v, 0, 100, 0, 10000);
    targetParams.fx_crush = params.fx_crush;
  }, v => map(v, 0, 100, 0, 10000).toFixed(0));

  setupSlider('edge', 0, 100, v => {
    params.edge_fade = v / 200;
    targetParams.edge_fade = params.edge_fade;
  }, v => (v / 200).toFixed(2));

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

function updateUIValues() {
  document.getElementById('param-pw').value = params.pw * 100;
  document.getElementById('val-pw').textContent = params.pw.toFixed(2);

  document.getElementById('param-soften').value = params.soften * 10;
  document.getElementById('val-soften').textContent = params.soften.toFixed(2);

  let ybendVal = map(params.y_bend, -0.25, 1.0, 0, 100);
  document.getElementById('param-ybend').value = ybendVal;
  document.getElementById('val-ybend').textContent = params.y_bend.toFixed(2);

  let fxbendVal = map(params.fx_bend, 0, 1000, 0, 100);
  document.getElementById('param-fxbend').value = fxbendVal;
  document.getElementById('val-fxbend').textContent = params.fx_bend.toFixed(0);

  document.getElementById('param-fxnoise').value = params.fx_noise * 100;
  document.getElementById('val-fxnoise').textContent = params.fx_noise.toFixed(2);

  document.getElementById('param-fxquant').value = params.fx_quantize * 100;
  document.getElementById('val-fxquant').textContent = params.fx_quantize.toFixed(2);

  let pwmorphVal = map(params.pw_morph, -50, 50, 0, 100);
  document.getElementById('param-pwmorph').value = pwmorphVal;
  document.getElementById('val-pwmorph').textContent = params.pw_morph.toFixed(1);

  let foldVal = map(params.fx_fold, 0, 10000, 0, 100);
  document.getElementById('param-fold').value = foldVal;
  document.getElementById('val-fold').textContent = params.fx_fold.toFixed(0);

  let crushVal = map(params.fx_crush, 0, 10000, 0, 100);
  document.getElementById('param-crush').value = crushVal;
  document.getElementById('val-crush').textContent = params.fx_crush.toFixed(0);

  document.getElementById('param-edge').value = params.edge_fade * 200;
  document.getElementById('val-edge').textContent = params.edge_fade.toFixed(2);
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
  params.shape = floor(random(8));
  params.pw = random(0.0, 1.0);
  params.soften = random(0.5, 50);
  params.y_bend = random(-0.25, 1.0);
  params.fx_bend = random(-1, 1000);
  params.fx_noise = random(0, 1.0);
  params.fx_quantize = random(0, 1.0);
  params.pw_morph = random(-50, 50);
  params.fx_fold = random(0, 10000);
  params.fx_crush = random(0, 10000);
  params.edge_fade = random(0, 0.5);

  // Snap targets to match (no slow interpolation)
  targetParams = { ...params };
  updateShapeButtons();
  updateUIValues();

  // Random palette
  currentPalette = random(paletteNames);
  document.getElementById('palette-select').value = currentPalette;
  updateColorPreview();
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
    fx_crush: 0.0,
    edge_fade: 0.0
  };
  targetParams = { ...params };
  updateShapeButtons();
  updateUIValues();

  currentPalette = 'thermal';
  document.getElementById('palette-select').value = currentPalette;
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
    case '5': case '6': case '7': case '8':
      params.shape = parseInt(key) - 1;
      targetParams.shape = params.shape;
      updateShapeButtons();
      needsRender = true;
      break;
    case 'c':
    case 'C':
      nextPalette();
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
