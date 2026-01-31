/**
 * Benjolin Rungler - GLSL Shader Sketch
 * Inspired by Rob Hordijk's Benjolin synthesizer
 *
 * Visual modes:
 * 0: Waveform - Audio waveform visualization
 * 1: Scope - Oscilloscope Lissajous curves
 * 2: Pixel - Bitcrushed shift register chaos
 * 3: Filter - Filter resonance sweeps
 *
 * Version: 2.0.0
 */

// ============================================
// HASH & RANDOMNESS
// ============================================

let hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

// Art Blocks compatibility
if (typeof tokenData !== "undefined" && tokenData.hash) {
    hash = tokenData.hash;
}

// sfc32 PRNG - deterministic from hash
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
    if (roll < legendary) return "legendary";
    if (roll < legendary + rare) return "rare";
    if (roll < legendary + rare + uncommon) return "uncommon";
    return "common";
}

// ============================================
// FEATURES
// ============================================

let features = {};
let originalFeatures = {};
let hasOverrides = false;

const MODE_NAMES = ["Waveform", "Scope", "Pixel", "Filter"];
const SPEED_NAMES = ["Slow", "Medium", "Fast"];
const FEEDBACK_NAMES = ["Low", "Medium", "High", "Extreme"];
const RGB_OFFSET_NAMES = ["Subtle", "Moderate", "Extreme"];

function generateFeatures() {
    R = initRandom(hash);

    // Mode selection with rarity
    const modeRarity = rollRarity(0.45, 0.30, 0.18, 0.07);
    let mode;
    if (modeRarity === "legendary" || modeRarity === "rare") {
        mode = 3; // Hybrid
    } else if (modeRarity === "uncommon") {
        mode = 2; // Pixel
    } else {
        mode = rndBool() ? 0 : 1; // Circuit or Scope
    }

    // Oscillator ratio - some "golden" ratios are rare
    const goldenRatios = [1.618, 2.0, 1.5, 0.618, 1.414];
    let oscRatio;
    if (R() < 0.1) {
        // 10% chance of golden ratio
        oscRatio = rndChoice(goldenRatios);
    } else {
        oscRatio = rnd(0.5, 3.0);
    }

    // Rungler bits (shift register length)
    const runglerBits = rndInt(4, 16);

    // Feedback intensity
    const feedbackRoll = R();
    let feedbackLevel, feedbackAmt;
    if (feedbackRoll < 0.4) {
        feedbackLevel = 0; // Low
        feedbackAmt = rnd(0.0, 0.3);
    } else if (feedbackRoll < 0.7) {
        feedbackLevel = 1; // Medium
        feedbackAmt = rnd(0.3, 0.5);
    } else if (feedbackRoll < 0.9) {
        feedbackLevel = 2; // High
        feedbackAmt = rnd(0.5, 0.7);
    } else {
        feedbackLevel = 3; // Extreme
        feedbackAmt = rnd(0.7, 0.9);
    }

    // RGB offset
    const rgbRoll = R();
    let rgbOffsetLevel, rgbOffset;
    if (rgbRoll < 0.5) {
        rgbOffsetLevel = 0; // Subtle
        rgbOffset = rnd(0.002, 0.01);
    } else if (rgbRoll < 0.8) {
        rgbOffsetLevel = 1; // Moderate
        rgbOffset = rnd(0.01, 0.03);
    } else {
        rgbOffsetLevel = 2; // Extreme
        rgbOffset = rnd(0.03, 0.08);
    }

    // Animation speed (slowed down)
    const speedRoll = R();
    let speedLevel, speed;
    if (speedRoll < 0.3) {
        speedLevel = 0; // Slow
        speed = rnd(0.02, 0.05);
    } else if (speedRoll < 0.7) {
        speedLevel = 1; // Medium
        speed = rnd(0.05, 0.12);
    } else {
        speedLevel = 2; // Fast
        speed = rnd(0.12, 0.25);
    }

    // Determine overall rarity
    let rarity = "common";
    const isGoldenRatio = goldenRatios.includes(oscRatio);
    if (mode === 3 && feedbackLevel >= 2 && isGoldenRatio) {
        rarity = "legendary";
    } else if (mode === 3 || (isGoldenRatio && feedbackLevel >= 2)) {
        rarity = "rare";
    } else if (mode === 2 || feedbackLevel >= 2 || rgbOffsetLevel === 2) {
        rarity = "uncommon";
    }

    features = {
        mode,
        modeName: MODE_NAMES[mode],
        oscRatio: Math.round(oscRatio * 1000) / 1000,
        isGoldenRatio,
        runglerBits,
        feedbackLevel,
        feedbackName: FEEDBACK_NAMES[feedbackLevel],
        feedbackAmt,
        rgbOffsetLevel,
        rgbOffsetName: RGB_OFFSET_NAMES[rgbOffsetLevel],
        rgbOffset,
        speedLevel,
        speedName: SPEED_NAMES[speedLevel],
        speed,
        rarity
    };

    originalFeatures = { ...features };
    hasOverrides = false;

    return features;
}

// ============================================
// DEV MODE: Parameter Overrides
// ============================================

function setParameter(name, value) {
    hasOverrides = true;
    features[name] = value;

    // Update dependent values
    if (name === 'mode') {
        features.modeName = MODE_NAMES[value];
    } else if (name === 'feedbackLevel') {
        features.feedbackName = FEEDBACK_NAMES[value];
        features.feedbackAmt = [0.15, 0.4, 0.6, 0.8][value];
    } else if (name === 'rgbOffsetLevel') {
        features.rgbOffsetName = RGB_OFFSET_NAMES[value];
        features.rgbOffset = [0.005, 0.02, 0.05][value];
    } else if (name === 'speedLevel') {
        features.speedName = SPEED_NAMES[value];
        features.speed = [0.035, 0.085, 0.18][value];
    } else if (name === 'oscRatio') {
        features.oscRatio = value;
    } else if (name === 'runglerBits') {
        features.runglerBits = value;
    }

    return features;
}

function resetToOriginal() {
    features = { ...originalFeatures };
    hasOverrides = false;
    return features;
}

function hasModifications() {
    return hasOverrides;
}

// ============================================
// FEEDBACK SYSTEM
// ============================================

const FEEDBACK_KEY = 'benjolin-rungler-feedback';

function loadFeedback() {
    try {
        const data = localStorage.getItem(FEEDBACK_KEY);
        return data ? JSON.parse(data) : { liked: [], disliked: [] };
    } catch {
        return { liked: [], disliked: [] };
    }
}

function saveFeedback(feedback) {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
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
    return feedback;
}

function getFeedbackStats() {
    const feedback = loadFeedback();
    return {
        totalLiked: feedback.liked.length,
        totalDisliked: feedback.disliked.length,
        likedModes: feedback.liked.reduce((acc, f) => {
            acc[f.features.modeName] = (acc[f.features.modeName] || 0) + 1;
            return acc;
        }, {}),
        dislikedModes: feedback.disliked.reduce((acc, f) => {
            acc[f.features.modeName] = (acc[f.features.modeName] || 0) + 1;
            return acc;
        }, {})
    };
}

function exportFeedback() {
    return loadFeedback();
}

// ============================================
// RARITY CURVES
// ============================================

const RARITY_CURVES = {
    mode: {
        labels: MODE_NAMES,
        probabilities: [0.225, 0.225, 0.30, 0.25] // Approx from rollRarity logic
    },
    feedback: {
        labels: FEEDBACK_NAMES,
        probabilities: [0.4, 0.3, 0.2, 0.1]
    },
    rgbOffset: {
        labels: RGB_OFFSET_NAMES,
        probabilities: [0.5, 0.3, 0.2]
    },
    speed: {
        labels: SPEED_NAMES,
        probabilities: [0.3, 0.4, 0.3]
    }
};

function getRarityCurves() {
    return RARITY_CURVES;
}

// ============================================
// WEBGL SETUP
// ============================================

let canvas, gl;
let program;
let feedbackTexture, feedbackFBO;
let frameCount = 0;
let startTime;
let isRunning = true;
let shaderSource = null;

async function loadShader() {
    const response = await fetch('shaders/benjolin.frag');
    shaderSource = await response.text();
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

function initWebGL() {
    canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        alert('WebGL not supported');
        return false;
    }

    // Vertex shader (simple fullscreen quad)
    const vertexSource = `
        attribute vec2 aPosition;
        void main() {
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaderSource);

    if (!vertexShader || !fragmentShader) return false;

    program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;

    // Create fullscreen quad
    const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Create feedback texture and FBO
    feedbackTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, feedbackTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    feedbackFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, feedbackFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, feedbackTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    startTime = performance.now();
    return true;
}

function render() {
    if (!isRunning) {
        requestAnimationFrame(render);
        return;
    }

    const time = (performance.now() - startTime) / 1000;

    gl.useProgram(program);

    // Set uniforms
    gl.uniform2f(gl.getUniformLocation(program, 'uResolution'), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, 'uTime'), time);
    gl.uniform1f(gl.getUniformLocation(program, 'uFrame'), frameCount);

    gl.uniform1i(gl.getUniformLocation(program, 'uMode'), features.mode);
    gl.uniform1f(gl.getUniformLocation(program, 'uOscRatio'), features.oscRatio);
    gl.uniform1f(gl.getUniformLocation(program, 'uRunglerBits'), features.runglerBits);
    gl.uniform1f(gl.getUniformLocation(program, 'uFeedbackAmt'), features.feedbackAmt);
    gl.uniform1f(gl.getUniformLocation(program, 'uRgbOffset'), features.rgbOffset);
    gl.uniform1f(gl.getUniformLocation(program, 'uSpeed'), features.speed);

    // Bind feedback texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, feedbackTexture);
    gl.uniform1i(gl.getUniformLocation(program, 'uFeedback'), 0);

    // Render to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Copy to feedback texture
    gl.bindTexture(gl.TEXTURE_2D, feedbackTexture);
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, canvas.width, canvas.height, 0);

    frameCount++;
    requestAnimationFrame(render);
}

// ============================================
// CONTROLS & UI
// ============================================

function regenerate() {
    hash = "0x" + Array(64).fill(0).map(() =>
        "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    generateFeatures();
    updateUI();
    startTime = performance.now();
    frameCount = 0;
}

function saveImage() {
    const link = document.createElement('a');
    link.download = `benjolin-rungler-${hash.slice(2, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function togglePause() {
    isRunning = !isRunning;
    document.getElementById('pause-indicator').style.display = isRunning ? 'none' : 'block';
}

function updateUI() {
    // Update hash display
    document.getElementById('hash-display').textContent = hash;

    // Update features table
    const featuresBody = document.getElementById('features-body');
    featuresBody.innerHTML = '';

    const displayFeatures = [
        { name: 'Mode', value: features.modeName, rarity: features.mode === 3 ? 'rare' : 'common' },
        { name: 'Osc Ratio', value: features.oscRatio.toFixed(3), rarity: features.isGoldenRatio ? 'legendary' : 'common' },
        { name: 'Rungler Bits', value: features.runglerBits, rarity: features.runglerBits >= 14 ? 'uncommon' : 'common' },
        { name: 'Feedback', value: features.feedbackName, rarity: features.feedbackLevel >= 3 ? 'rare' : features.feedbackLevel >= 2 ? 'uncommon' : 'common' },
        { name: 'RGB Offset', value: features.rgbOffsetName, rarity: features.rgbOffsetLevel >= 2 ? 'uncommon' : 'common' },
        { name: 'Speed', value: features.speedName, rarity: 'common' },
        { name: 'Overall', value: features.rarity.toUpperCase(), rarity: features.rarity }
    ];

    displayFeatures.forEach(f => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${f.name}</td>
            <td>${f.value}</td>
            <td><span class="rarity-badge ${f.rarity}">${f.rarity}</span></td>
        `;
        featuresBody.appendChild(row);
    });

    // Update sliders to match current features
    if (document.getElementById('slider-mode')) {
        document.getElementById('slider-mode').value = features.mode;
        document.getElementById('slider-oscRatio').value = features.oscRatio;
        document.getElementById('slider-runglerBits').value = features.runglerBits;
        document.getElementById('slider-feedbackLevel').value = features.feedbackLevel;
        document.getElementById('slider-rgbOffsetLevel').value = features.rgbOffsetLevel;
        document.getElementById('slider-speedLevel').value = features.speedLevel;
    }

    // Update override indicator
    const overrideIndicator = document.getElementById('override-indicator');
    if (overrideIndicator) {
        overrideIndicator.style.display = hasOverrides ? 'block' : 'none';
    }
}

function setupControls() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.key.toLowerCase()) {
            case 'r':
                if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    regenerate();
                }
                break;
            case 's':
                if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    saveImage();
                }
                break;
            case ' ':
                e.preventDefault();
                togglePause();
                break;
            case 'l':
                recordFeedback(true);
                showFeedbackNotification('Liked!');
                break;
            case 'd':
                if (!e.metaKey && !e.ctrlKey) {
                    recordFeedback(false);
                    showFeedbackNotification('Disliked');
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                // Force mode override
                setParameter('mode', parseInt(e.key) - 1);
                updateUI();
                break;
        }
    });

    // Button controls
    document.getElementById('btn-regenerate')?.addEventListener('click', regenerate);
    document.getElementById('btn-save')?.addEventListener('click', saveImage);
    document.getElementById('btn-pause')?.addEventListener('click', togglePause);
    document.getElementById('btn-reset')?.addEventListener('click', () => {
        resetToOriginal();
        updateUI();
    });

    // Slider controls
    document.getElementById('slider-mode')?.addEventListener('input', (e) => {
        setParameter('mode', parseInt(e.target.value));
        updateUI();
    });

    document.getElementById('slider-oscRatio')?.addEventListener('input', (e) => {
        setParameter('oscRatio', parseFloat(e.target.value));
        updateUI();
    });

    document.getElementById('slider-runglerBits')?.addEventListener('input', (e) => {
        setParameter('runglerBits', parseInt(e.target.value));
        updateUI();
    });

    document.getElementById('slider-feedbackLevel')?.addEventListener('input', (e) => {
        setParameter('feedbackLevel', parseInt(e.target.value));
        updateUI();
    });

    document.getElementById('slider-rgbOffsetLevel')?.addEventListener('input', (e) => {
        setParameter('rgbOffsetLevel', parseInt(e.target.value));
        updateUI();
    });

    document.getElementById('slider-speedLevel')?.addEventListener('input', (e) => {
        setParameter('speedLevel', parseInt(e.target.value));
        updateUI();
    });

    // Feedback buttons
    document.getElementById('btn-like')?.addEventListener('click', () => {
        recordFeedback(true);
        showFeedbackNotification('Liked!');
    });

    document.getElementById('btn-dislike')?.addEventListener('click', () => {
        recordFeedback(false);
        showFeedbackNotification('Disliked');
    });

    document.getElementById('btn-export-feedback')?.addEventListener('click', () => {
        const data = exportFeedback();
        console.log('Feedback Export:', data);
        console.log('Stats:', getFeedbackStats());
    });
}

function showFeedbackNotification(text) {
    const notification = document.createElement('div');
    notification.className = 'feedback-notification';
    notification.textContent = text;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 1000);
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    await loadShader();
    generateFeatures();

    if (initWebGL()) {
        updateUI();
        setupControls();
        render();
    }
}

// Start when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for console access
window.benjolin = {
    features: () => features,
    regenerate,
    setParameter,
    resetToOriginal,
    getFeedbackStats,
    exportFeedback,
    getRarityCurves
};
