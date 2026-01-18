/**
 * data-stomp
 * Generative noise pedals with Ikeda/Noto/bytebeat audio
 * v2.0.0 - Complete rewrite with clean layout
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
  const seed = hashStr.slice(2);
  const seeds = [];
  for (let i = 0; i < 4; i++) {
    seeds.push(parseInt(seed.slice(i * 8, (i + 1) * 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

let R;
function rnd(min = 0, max = 1) { return R() * (max - min) + min; }
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rndChoice(arr) { return arr[Math.floor(R() * arr.length)]; }
function rndBool(p = 0.5) { return R() < p; }

// ============================================================================
// FEATURES
// ============================================================================

let features = {};

const PALETTES = {
  'monochrome': { bg: '#0a0a0a', panel: '#1a1a1a', accent: '#ffffff', knob: '#333', text: '#fff' },
  'warm': { bg: '#0d0908', panel: '#1a1410', accent: '#ff9500', knob: '#2a2015', text: '#ffcc80' },
  'cool': { bg: '#080a0d', panel: '#101418', accent: '#00aaff', knob: '#152025', text: '#80ddff' },
  'matrix': { bg: '#000a00', panel: '#0a140a', accent: '#00ff00', knob: '#0a200a', text: '#00ff00' },
};

const KNOB_STYLES = ['classic', 'minimal', 'led', 'digital'];

function generateFeatures() {
  R = initRandom(hash);

  const paletteNames = Object.keys(PALETTES);
  const paletteName = rndChoice(paletteNames);

  features = {
    palette: paletteName,
    colors: PALETTES[paletteName],
    knobStyle: rndChoice(KNOB_STYLES),
    knobCount: rndChoice([4, 6, 8]),
    hasScope: rndBool(0.6),
    hasDisplay: rndBool(0.4),
    tempo: rndChoice([80, 100, 120, 140]),
    soundType: rndChoice(['sine', 'click', 'noise', 'fm']),
  };

  // Generate knob configs
  features.knobs = [];
  const labels = ['FREQ', 'TONE', 'GAIN', 'RATE', 'MIX', 'DECAY', 'DRIVE', 'DEPTH'];
  for (let i = 0; i < features.knobCount; i++) {
    features.knobs.push({
      label: labels[i % labels.length],
      value: rnd(0.2, 0.8),
      id: i
    });
  }

  return features;
}

// ============================================================================
// CANVAS STATE
// ============================================================================

let canvas, ctx;
let W = 700, H = 700;
let time = 0;
let isPlaying = false;
let audioEngine = null;
let dragKnob = null;
let hoverKnob = null;
let pedalActive = true;

// Pedal layout (computed once)
let pedal = { x: 0, y: 0, w: 0, h: 0 };
let knobPositions = [];
let footswitchPos = { x: 0, y: 0, r: 0 };
let scopePos = { x: 0, y: 0, w: 0, h: 0 };
let displayPos = { x: 0, y: 0, w: 0, h: 0 };

// ============================================================================
// INIT
// ============================================================================

function init() {
  generateFeatures();

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = W;
  canvas.height = H;

  computeLayout();

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseUp);
  document.addEventListener('keydown', onKeyDown);

  render();
  updateUI();
}

function computeLayout() {
  // Pedal dimensions - simple rectangle
  const margin = 60;
  pedal = {
    x: margin,
    y: margin,
    w: W - margin * 2,
    h: H - margin * 2
  };

  // Knob grid
  const cols = features.knobCount <= 4 ? 2 : (features.knobCount <= 6 ? 3 : 4);
  const rows = Math.ceil(features.knobCount / cols);

  const knobAreaTop = pedal.y + 120; // Below title and display
  const knobAreaBottom = pedal.y + pedal.h - 120; // Above footswitch
  const knobAreaHeight = knobAreaBottom - knobAreaTop;

  const knobSpacingX = pedal.w / (cols + 1);
  const knobSpacingY = knobAreaHeight / (rows + 1);
  const knobRadius = Math.min(knobSpacingX, knobSpacingY) * 0.35;

  knobPositions = [];
  for (let i = 0; i < features.knobCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    knobPositions.push({
      x: pedal.x + knobSpacingX * (col + 1),
      y: knobAreaTop + knobSpacingY * (row + 1),
      r: knobRadius,
      knob: features.knobs[i]
    });
  }

  // Footswitch
  footswitchPos = {
    x: pedal.x + pedal.w / 2,
    y: pedal.y + pedal.h - 50,
    r: 30
  };

  // Scope
  if (features.hasScope) {
    scopePos = {
      x: pedal.x + 40,
      y: pedal.y + 50,
      w: features.hasDisplay ? pedal.w * 0.5 - 50 : pedal.w - 80,
      h: 50
    };
  }

  // Display
  if (features.hasDisplay) {
    displayPos = {
      x: features.hasScope ? pedal.x + pedal.w * 0.5 + 10 : pedal.x + pedal.w / 2 - 50,
      y: pedal.y + 50,
      w: 100,
      h: 50
    };
  }
}

// ============================================================================
// RENDER
// ============================================================================

function render() {
  time += 0.016;
  const c = features.colors;

  // Background
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);

  // Pedal body
  drawPedal();

  // Scope
  if (features.hasScope) {
    drawScope();
  }

  // Display
  if (features.hasDisplay) {
    drawDisplay();
  }

  // Knobs
  for (let i = 0; i < knobPositions.length; i++) {
    drawKnob(knobPositions[i], i === hoverKnob || (dragKnob && dragKnob.index === i));
  }

  // Footswitch
  drawFootswitch();

  // LEDs
  drawLEDs();

  requestAnimationFrame(render);
}

function drawPedal() {
  const c = features.colors;
  const { x, y, w, h } = pedal;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, x + 5, y + 5, w, h, 12);
  ctx.fill();

  // Main body
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, lighten(c.panel, 15));
  grad.addColorStop(0.5, c.panel);
  grad.addColorStop(1, darken(c.panel, 10));
  ctx.fillStyle = grad;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();

  // Border
  ctx.strokeStyle = lighten(c.panel, 25);
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 12);
  ctx.stroke();

  // Title
  ctx.fillStyle = c.accent;
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DATA-STOMP', x + w/2, y + 35);
}

function drawKnob(pos, isActive) {
  const c = features.colors;
  const { x, y, r, knob } = pos;
  const angle = -Math.PI * 0.75 + knob.value * Math.PI * 1.5;

  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.beginPath();
  ctx.arc(3, 3, r + 5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fill();

  if (features.knobStyle === 'led') {
    // LED ring style
    drawLEDKnob(r, knob.value, c, isActive);
  } else if (features.knobStyle === 'digital') {
    // Digital readout
    drawDigitalKnob(r, knob.value, c, isActive);
  } else if (features.knobStyle === 'minimal') {
    // Minimal dot indicator
    drawMinimalKnob(r, knob.value, c, isActive);
  } else {
    // Classic pointer
    drawClassicKnob(r, knob.value, c, isActive);
  }

  // Label
  ctx.fillStyle = c.text;
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(knob.label, 0, r + 20);

  ctx.restore();
}

function drawClassicKnob(r, value, c, isActive) {
  const angle = -Math.PI * 0.75 + value * Math.PI * 1.5;

  // Outer ring
  ctx.beginPath();
  ctx.arc(0, 0, r + 5, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();

  // Main body
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(-r*0.3, -r*0.3, 0, 0, 0, r);
  grad.addColorStop(0, '#666');
  grad.addColorStop(0.5, '#333');
  grad.addColorStop(1, '#222');
  ctx.fillStyle = grad;
  ctx.fill();

  if (isActive) {
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Pointer line
  ctx.save();
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.3);
  ctx.lineTo(0, -r * 0.9);
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // Center cap
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
}

function drawMinimalKnob(r, value, c, isActive) {
  const angle = -Math.PI * 0.75 + value * Math.PI * 1.5;

  // Track
  ctx.beginPath();
  ctx.arc(0, 0, r, -Math.PI * 0.75, Math.PI * 0.75);
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Value arc
  ctx.beginPath();
  ctx.arc(0, 0, r, -Math.PI * 0.75, angle);
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = isActive ? c.accent : '#333';
  ctx.fill();

  // Indicator dot
  const dotX = Math.cos(angle) * r * 0.65;
  const dotY = Math.sin(angle) * r * 0.65;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
  ctx.fillStyle = c.accent;
  ctx.fill();
}

function drawLEDKnob(r, value, c, isActive) {
  // Background
  ctx.beginPath();
  ctx.arc(0, 0, r + 5, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();

  // LED segments
  const segments = 11;
  const activeSegs = Math.floor(value * segments);
  const startA = -Math.PI * 0.75;
  const segAngle = (Math.PI * 1.5) / segments;

  for (let i = 0; i < segments; i++) {
    const a1 = startA + i * segAngle + 0.05;
    const a2 = startA + (i + 1) * segAngle - 0.05;

    ctx.beginPath();
    ctx.arc(0, 0, r + 2, a1, a2);
    ctx.arc(0, 0, r * 0.7, a2, a1, true);
    ctx.closePath();

    if (i <= activeSegs) {
      const hue = 120 - (i / segments) * 120;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = '#1a1a1a';
      ctx.shadowBlur = 0;
    }
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Center
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = isActive ? '#333' : '#1a1a1a';
  ctx.fill();
}

function drawDigitalKnob(r, value, c, isActive) {
  const displayVal = Math.floor(value * 99).toString().padStart(2, '0');

  // Housing
  ctx.fillStyle = '#0a0a0a';
  ctx.strokeStyle = isActive ? c.accent : '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  roundRect(ctx, -r * 1.2, -r * 0.6, r * 2.4, r * 1.2, 4);
  ctx.fill();
  ctx.stroke();

  // Value
  ctx.fillStyle = c.accent;
  ctx.font = `bold ${r * 0.9}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = c.accent;
  ctx.shadowBlur = 10;
  ctx.fillText(displayVal, 0, 0);
  ctx.shadowBlur = 0;
}

function drawScope() {
  const c = features.colors;
  const { x, y, w, h } = scopePos;

  // Bezel
  ctx.fillStyle = '#0a0a0a';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 4);
  ctx.fill();
  ctx.stroke();

  // Screen
  ctx.fillStyle = '#050a05';
  ctx.fillRect(x, y, w, h);

  // Grid
  ctx.strokeStyle = '#0a2a0a';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + h * i / 4);
    ctx.lineTo(x + w, y + h * i / 4);
    ctx.stroke();
  }

  // Waveform
  ctx.beginPath();
  ctx.strokeStyle = c.accent;
  ctx.shadowColor = c.accent;
  ctx.shadowBlur = 4;
  ctx.lineWidth = 2;

  for (let i = 0; i < w; i++) {
    const t = time * 5 + i * 0.05;
    const val = Math.sin(t) * 0.3 + Math.sin(t * 2.5) * 0.2;
    const py = y + h / 2 - val * h;
    if (i === 0) ctx.moveTo(x + i, py);
    else ctx.lineTo(x + i, py);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawDisplay() {
  const c = features.colors;
  const { x, y, w, h } = displayPos;

  // Bezel
  ctx.fillStyle = '#0a0a0a';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 4);
  ctx.fill();
  ctx.stroke();

  // Value
  ctx.fillStyle = c.accent;
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = c.accent;
  ctx.shadowBlur = 8;
  ctx.fillText(features.tempo.toString(), x + w/2, y + h/2);
  ctx.shadowBlur = 0;
}

function drawFootswitch() {
  const c = features.colors;
  const { x, y, r } = footswitchPos;
  const isHover = hoverKnob === 'footswitch';

  // Shadow
  ctx.beginPath();
  ctx.arc(x + 3, y + 3, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fill();

  // Housing
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(x - r*0.3, y - r*0.3, 0, x, y, r);
  grad.addColorStop(0, '#555');
  grad.addColorStop(1, '#222');
  ctx.fillStyle = grad;
  ctx.fill();

  // Button top
  ctx.beginPath();
  ctx.arc(x, y, r * 0.75, 0, Math.PI * 2);
  const topGrad = ctx.createRadialGradient(x, y - r*0.2, 0, x, y, r * 0.75);
  if (pedalActive) {
    topGrad.addColorStop(0, lighten(c.accent, 30));
    topGrad.addColorStop(1, c.accent);
  } else {
    topGrad.addColorStop(0, '#444');
    topGrad.addColorStop(1, '#222');
  }
  ctx.fillStyle = topGrad;
  ctx.fill();

  if (isHover) {
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function drawLEDs() {
  const c = features.colors;
  const ledY = pedal.y + pedal.h - 95;
  const ledSpacing = 30;
  const ledCount = 3;
  const startX = pedal.x + pedal.w / 2 - (ledCount - 1) * ledSpacing / 2;

  for (let i = 0; i < ledCount; i++) {
    const lx = startX + i * ledSpacing;
    const isOn = pedalActive && (isPlaying || Math.sin(time * 4 + i * 2) > 0.3);

    // Bezel
    ctx.beginPath();
    ctx.arc(lx, ledY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.fill();

    // LED
    ctx.beginPath();
    ctx.arc(lx, ledY, 4, 0, Math.PI * 2);
    if (isOn) {
      ctx.fillStyle = c.accent;
      ctx.shadowColor = c.accent;
      ctx.shadowBlur = 12;
    } else {
      ctx.fillStyle = darken(c.accent, 70);
      ctx.shadowBlur = 0;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ============================================================================
// INTERACTION
// ============================================================================

function onMouseDown(e) {
  const { x, y } = getMousePos(e);

  // Check footswitch
  const fs = footswitchPos;
  if (Math.hypot(x - fs.x, y - fs.y) < fs.r) {
    pedalActive = !pedalActive;
    return;
  }

  // Check knobs
  for (let i = 0; i < knobPositions.length; i++) {
    const kp = knobPositions[i];
    if (Math.hypot(x - kp.x, y - kp.y) < kp.r + 10) {
      dragKnob = { index: i, startY: y, startValue: kp.knob.value };
      return;
    }
  }
}

function onMouseMove(e) {
  const { x, y } = getMousePos(e);

  if (dragKnob) {
    const delta = (dragKnob.startY - y) / 100;
    const newVal = Math.max(0, Math.min(1, dragKnob.startValue + delta));
    features.knobs[dragKnob.index].value = newVal;
    canvas.style.cursor = 'ns-resize';
    return;
  }

  // Hover detection
  hoverKnob = null;
  canvas.style.cursor = 'default';

  // Check footswitch
  const fs = footswitchPos;
  if (Math.hypot(x - fs.x, y - fs.y) < fs.r) {
    hoverKnob = 'footswitch';
    canvas.style.cursor = 'pointer';
    return;
  }

  // Check knobs
  for (let i = 0; i < knobPositions.length; i++) {
    const kp = knobPositions[i];
    if (Math.hypot(x - kp.x, y - kp.y) < kp.r + 10) {
      hoverKnob = i;
      canvas.style.cursor = 'ns-resize';
      return;
    }
  }
}

function onMouseUp() {
  dragKnob = null;
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function onKeyDown(e) {
  if (e.key === 'r' || e.key === 'R') regenerate();
  else if (e.key === 's' || e.key === 'S') saveImage();
  else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
}

// ============================================================================
// UTILITIES
// ============================================================================

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function lighten(hex, pct) {
  const n = parseInt(hex.replace('#', ''), 16);
  const a = Math.round(2.55 * pct);
  const r = Math.min(255, (n >> 16) + a);
  const g = Math.min(255, ((n >> 8) & 0xFF) + a);
  const b = Math.min(255, (n & 0xFF) + a);
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

function darken(hex, pct) {
  const n = parseInt(hex.replace('#', ''), 16);
  const a = Math.round(2.55 * pct);
  const r = Math.max(0, (n >> 16) - a);
  const g = Math.max(0, ((n >> 8) & 0xFF) - a);
  const b = Math.max(0, (n & 0xFF) - a);
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  generateFeatures();
  computeLayout();
  updateUI();
  if (isPlaying) { stopAudio(); isPlaying = false; updatePlayButton(); }
}

function saveImage() {
  const link = document.createElement('a');
  link.download = `data-stomp-${hash.slice(2, 10)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function updateUI() {
  const table = document.getElementById('features-table');
  if (table) {
    table.innerHTML = `
      <tr><td>Palette</td><td>${features.palette}</td></tr>
      <tr><td>Knob Style</td><td>${features.knobStyle}</td></tr>
      <tr><td>Knobs</td><td>${features.knobCount}</td></tr>
      <tr><td>Sound</td><td>${features.soundType}</td></tr>
      <tr><td>Tempo</td><td>${features.tempo} BPM</td></tr>
    `;
  }
  const hashEl = document.getElementById('hash-display');
  if (hashEl) hashEl.textContent = hash.slice(0, 18) + '...';
}

// ============================================================================
// AUDIO (Tone.js)
// ============================================================================

async function initAudio() {
  if (audioEngine) return;
  await Tone.start();

  const gain = new Tone.Gain(0.5).toDestination();
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).connect(gain);

  let synth;
  if (features.soundType === 'sine') {
    synth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 } }).connect(reverb);
  } else if (features.soundType === 'click') {
    synth = new Tone.MembraneSynth({ pitchDecay: 0.02, octaves: 4 }).connect(reverb);
  } else if (features.soundType === 'noise') {
    synth = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0 } }).connect(reverb);
  } else {
    synth = new Tone.FMSynth({ harmonicity: 3, modulationIndex: 10 }).connect(reverb);
  }

  const notes = ['C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4'];
  let step = 0;

  const seq = new Tone.Loop((time) => {
    if (!pedalActive) return;
    const noteR = initRandom(hash + step);
    if (noteR() > 0.3) {
      const note = notes[Math.floor(noteR() * notes.length)];
      if (synth.triggerAttackRelease) {
        synth.triggerAttackRelease(note, '16n', time);
      } else {
        synth.triggerAttackRelease(time);
      }
    }
    step++;
  }, '8n');

  Tone.Transport.bpm.value = features.tempo;
  audioEngine = { gain, synth, seq };
}

async function togglePlay() {
  if (!audioEngine) await initAudio();

  if (isPlaying) {
    Tone.Transport.stop();
    audioEngine.seq.stop();
    isPlaying = false;
  } else {
    audioEngine.seq.start(0);
    Tone.Transport.start();
    isPlaying = true;
  }
  updatePlayButton();
}

function stopAudio() {
  if (audioEngine) {
    Tone.Transport.stop();
    audioEngine.seq.stop();
  }
}

function updatePlayButton() {
  const btn = document.getElementById('btn-play');
  if (btn) btn.textContent = isPlaying ? 'Stop' : 'Play';
}

// ============================================================================
// EXPORTS
// ============================================================================

window.dataStompSketch = {
  features: () => features,
  regenerate,
  togglePlay,
  isPlaying: () => isPlaying
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
