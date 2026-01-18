// ==========================================
//   GLIX WAVETABLE GENERATOR - p5.js Visual
//   Based on GenDSP v2.1
// ==========================================

let canvas;
const DISPLAY_SIZE = 700;

// Resolution options (render size, then scale up)
const RESOLUTIONS = [64, 128, 256, 350, 512];
let resolutionIndex = 1; // Default 128
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
  ]
};

let currentPalette = 'thermal';
let paletteNames = Object.keys(palettes);
let pixelBuffer;

function setup() {
  canvas = createCanvas(DISPLAY_SIZE, DISPLAY_SIZE);
  canvas.parent('sketch-holder');
  pixelDensity(1);
  noSmooth(); // Crisp pixel scaling

  createPixelBuffer();
  setupUI();
  updateColorPreview();
  updateResolutionDisplay();
}

function createPixelBuffer() {
  pixelBuffer = createGraphics(renderSize, renderSize);
  pixelBuffer.pixelDensity(1);
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
  image(pixelBuffer, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
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
    // SINE WAVE
    samp = sin(shifted_phase * TWO_PI);
  } else if (sel === 1) {
    // TRIANGLE WAVE
    samp = 1.0 - abs((shifted_phase * 2.0) - 1.0) * 2.0;
  } else if (sel === 2) {
    // SAWTOOTH WAVE
    samp = (shifted_phase * 2.0) - 1.0;
  } else {
    // PULSE WAVE
    let current_width = constrain(params.pw + morph_amt, 0.0, 1.0);
    samp = final_phase < current_width ? 1.0 : -1.0;
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
  pixelBuffer.loadPixels();
  let palette = palettes[currentPalette];
  let size = renderSize;

  for (let y = 0; y < size; y++) {
    let scan_pos = y / size;

    for (let x = 0; x < size; x++) {
      let raw_phase = x / size;
      let sample = generateSample(raw_phase, scan_pos);

      // Map sample (-1 to 1) to color
      let colorVal = (sample + 1) * 0.5; // 0 to 1
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
  targetParams.shape = floor(random(4));
  params.shape = targetParams.shape;
  updateShapeButtons();

  targetParams.pw = random(0.2, 1.0);
  targetParams.soften = random(1, 30);
  targetParams.y_bend = random(-0.25, 1.0);
  targetParams.fx_bend = random(0, 500);
  targetParams.fx_noise = random(0, 0.5);
  targetParams.fx_quantize = random(0, 0.5);
  targetParams.pw_morph = random(-30, 30);
  targetParams.fx_fold = random(50, 3000);
  targetParams.fx_crush = random(0, 1000);
  targetParams.edge_fade = random(0, 0.3);

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
    case '1':
      params.shape = 0;
      targetParams.shape = 0;
      updateShapeButtons();
      needsRender = true;
      break;
    case '2':
      params.shape = 1;
      targetParams.shape = 1;
      updateShapeButtons();
      needsRender = true;
      break;
    case '3':
      params.shape = 2;
      targetParams.shape = 2;
      updateShapeButtons();
      needsRender = true;
      break;
    case '4':
      params.shape = 3;
      targetParams.shape = 3;
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
    case '[':
      cycleResolution(-1);
      break;
    case ']':
      cycleResolution(1);
      break;
  }
}
