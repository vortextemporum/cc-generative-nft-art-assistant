/**
 * wavelet-mosh v2.0
 * Massively expanded: 10 patterns, 24 wavelets, 24 palettes, 8 decomp levels
 * Foundation for multiple sub-collections
 */

// ============================================
// HASH & PRNG
// ============================================

let hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

if (typeof tokenData !== "undefined" && tokenData.hash) {
    hash = tokenData.hash;
}

function sfc32(a, b, c, d) {
    return function() {
        a |= 0; b |= 0; c |= 0; d |= 0;
        const t = (a + b | 0) + d | 0;
        d = d + 1 | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    };
}

function initRandom(hashStr) {
    const seeds = [];
    for (let i = 2; i < 66; i += 8) {
        seeds.push(parseInt(hashStr.slice(i, i + 8), 16));
    }
    return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

let R;
function rnd(min = 0, max = 1) { return R() * (max - min) + min; }
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }

// ============================================
// EXPANDED CONSTANTS
// ============================================

const PATTERN_TYPES = [
    "blocks", "noise_layers", "circles", "stripes", "voronoi",
    "plasma", "checkerboard", "radial_burst", "gradient_bands", "interference"
];

const WAVELET_TYPES = [
    "haar", "daubechies2", "biorthogonal", "coiflet", "symlet",
    "mexican_hat", "morlet", "shannon", "dct", "gabor",
    "pixel_sort", "glitch_blocks", "scanline", "vhs", "chromatic",
    "displacement", "fractal", "kaleidoscope", "posterize", "ripple",
    "edge_detect", "smear", "tile_shift", "data_bend"
];

const PALETTE_NAMES = [
    // Hard transition (like neon_glitch)
    "neon_glitch", "binary", "rgb_bars", "cyber_bars", "hot_steps",
    "electric", "matrix", "vapor_bars", "sunset_bands", "ice_blocks",
    "fire_steps", "toxic",
    // Gradient
    "thermal", "ocean", "vaporwave", "cyber", "corrupted_film",
    "digital_rot", "monochrome", "infrared", "neon_rainbow", "blood_moon",
    "phosphor", "synthwave"
];

const SPEED_NAMES = ["glacial", "slow", "medium", "fast", "chaotic", "insane"];
const SPEED_VALUES = [0.15, 0.3, 0.7, 1.2, 2.0, 3.0];

// ============================================
// RARITY DISTRIBUTIONS (for display)
// ============================================

const RARITY_CURVES = {
    pattern: {
        // More even distribution
        probabilities: [0.12, 0.12, 0.12, 0.10, 0.10, 0.10, 0.10, 0.08, 0.08, 0.08],
        labels: PATTERN_TYPES
    },
    wavelet: {
        // Even distribution across 24
        probabilities: Array(24).fill(1/24),
        labels: WAVELET_TYPES
    },
    palette: {
        // Hard transition palettes slightly rarer
        probabilities: [
            0.06, 0.03, 0.04, 0.04, 0.04, 0.05, 0.04, 0.05, 0.04, 0.04, 0.04, 0.03, // hard (12)
            0.05, 0.05, 0.06, 0.06, 0.05, 0.04, 0.05, 0.04, 0.05, 0.03, 0.04, 0.04  // gradient (12)
        ],
        labels: PALETTE_NAMES
    },
    speed: {
        probabilities: [0.10, 0.25, 0.30, 0.20, 0.10, 0.05],
        labels: SPEED_NAMES
    },
    decompLevels: {
        probabilities: [0.20, 0.25, 0.20, 0.15, 0.10, 0.05, 0.03, 0.02],
        labels: ["1", "2", "3", "4", "5", "6", "7", "8"]
    },
    glitchAmount: {
        // Continuous distribution shown as buckets
        probabilities: [0.10, 0.15, 0.20, 0.20, 0.15, 0.10, 0.05, 0.03, 0.02],
        labels: ["10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%+"]
    }
};

// ============================================
// FEATURE GENERATION
// ============================================

let features = {};
let originalFeatures = {};
let hasOverrides = false;

function weightedRandom(probabilities) {
    const r = R();
    let cumulative = 0;
    for (let i = 0; i < probabilities.length; i++) {
        cumulative += probabilities[i];
        if (r < cumulative) return i;
    }
    return probabilities.length - 1;
}

function generateFeatures() {
    R = initRandom(hash);

    const patternType = weightedRandom(RARITY_CURVES.pattern.probabilities);
    const waveletType = rndInt(0, WAVELET_TYPES.length - 1);
    const paletteIndex = weightedRandom(RARITY_CURVES.palette.probabilities);
    const speedIndex = weightedRandom(RARITY_CURVES.speed.probabilities);
    const decompLevels = weightedRandom(RARITY_CURVES.decompLevels.probabilities) + 1;
    const glitchAmount = rnd(0.1, 1.0);
    const seed = R();

    features = {
        patternType,
        patternName: PATTERN_TYPES[patternType],
        waveletType,
        waveletName: WAVELET_TYPES[waveletType],
        paletteIndex,
        paletteName: PALETTE_NAMES[paletteIndex],
        speedIndex,
        speedName: SPEED_NAMES[speedIndex],
        animSpeed: SPEED_VALUES[speedIndex],
        decompLevels,
        glitchAmount: Math.round(glitchAmount * 100) / 100,
        seed
    };

    originalFeatures = { ...features };
    hasOverrides = false;
    return features;
}

function setParameter(name, value) {
    hasOverrides = true;
    switch (name) {
        case 'patternType':
            features.patternType = value;
            features.patternName = PATTERN_TYPES[value];
            break;
        case 'waveletType':
            features.waveletType = value;
            features.waveletName = WAVELET_TYPES[value];
            break;
        case 'paletteIndex':
            features.paletteIndex = value;
            features.paletteName = PALETTE_NAMES[value];
            break;
        case 'animSpeed':
            features.animSpeed = value;
            let closestIdx = 0, closestDiff = Math.abs(SPEED_VALUES[0] - value);
            for (let i = 1; i < SPEED_VALUES.length; i++) {
                const diff = Math.abs(SPEED_VALUES[i] - value);
                if (diff < closestDiff) { closestDiff = diff; closestIdx = i; }
            }
            features.speedIndex = closestIdx;
            features.speedName = SPEED_NAMES[closestIdx];
            break;
        case 'decompLevels':
            features.decompLevels = value;
            break;
        case 'glitchAmount':
            features.glitchAmount = Math.round(value * 100) / 100;
            break;
        case 'seed':
            features.seed = value;
            break;
    }
    return features;
}

function resetToOriginal() {
    features = { ...originalFeatures };
    hasOverrides = false;
    return features;
}

function hasModifications() { return hasOverrides; }

// ============================================
// FEEDBACK SYSTEM
// ============================================

const FEEDBACK_KEY = 'wavelet-mosh-feedback-v2';

function loadFeedback() {
    try {
        return JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || { liked: [], disliked: [] };
    } catch (e) { return { liked: [], disliked: [] }; }
}

function saveFeedback(feedback) {
    try { localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback)); }
    catch (e) { console.warn('Could not save feedback'); }
}

function recordFeedback(isLike) {
    const feedback = loadFeedback();
    const entry = {
        timestamp: Date.now(),
        hash,
        features: { ...features },
        hadOverrides: hasOverrides,
        // Store all current slider/select values
        currentState: {
            patternType: features.patternType,
            waveletType: features.waveletType,
            paletteIndex: features.paletteIndex,
            animSpeed: features.animSpeed,
            decompLevels: features.decompLevels,
            glitchAmount: features.glitchAmount,
            seed: features.seed
        }
    };

    if (isLike) {
        feedback.liked.push(entry);
        console.log('LIKED:', entry);
    } else {
        feedback.disliked.push(entry);
        console.log('DISLIKED:', entry);
    }

    saveFeedback(feedback);
    return entry;
}

function getFeedbackStats() {
    const feedback = loadFeedback();
    const stats = {
        totalLiked: feedback.liked.length,
        totalDisliked: feedback.disliked.length,
        likedWavelets: {}, dislikedWavelets: {},
        likedPalettes: {}, dislikedPalettes: {},
        likedPatterns: {}, dislikedPatterns: {},
        avgLikedGlitch: 0, avgDislikedGlitch: 0,
        avgLikedDecomp: 0, avgDislikedDecomp: 0
    };

    feedback.liked.forEach(e => {
        stats.likedWavelets[e.features.waveletName] = (stats.likedWavelets[e.features.waveletName] || 0) + 1;
        stats.likedPalettes[e.features.paletteName] = (stats.likedPalettes[e.features.paletteName] || 0) + 1;
        stats.likedPatterns[e.features.patternName] = (stats.likedPatterns[e.features.patternName] || 0) + 1;
        stats.avgLikedGlitch += e.features.glitchAmount;
        stats.avgLikedDecomp += e.features.decompLevels;
    });

    feedback.disliked.forEach(e => {
        stats.dislikedWavelets[e.features.waveletName] = (stats.dislikedWavelets[e.features.waveletName] || 0) + 1;
        stats.dislikedPalettes[e.features.paletteName] = (stats.dislikedPalettes[e.features.paletteName] || 0) + 1;
        stats.dislikedPatterns[e.features.patternName] = (stats.dislikedPatterns[e.features.patternName] || 0) + 1;
        stats.avgDislikedGlitch += e.features.glitchAmount;
        stats.avgDislikedDecomp += e.features.decompLevels;
    });

    if (stats.totalLiked > 0) {
        stats.avgLikedGlitch /= stats.totalLiked;
        stats.avgLikedDecomp /= stats.totalLiked;
    }
    if (stats.totalDisliked > 0) {
        stats.avgDislikedGlitch /= stats.totalDisliked;
        stats.avgDislikedDecomp /= stats.totalDisliked;
    }

    return stats;
}

function clearFeedback() { localStorage.removeItem(FEEDBACK_KEY); }
function exportFeedback() { return loadFeedback(); }

// ============================================
// WEBGL
// ============================================

let gl, program, animationId, startTime;
let isPaused = false, pauseTime = 0;
const canvas = document.createElement("canvas");
canvas.id = "sketch-canvas";

function initWebGL() {
    gl = canvas.getContext("webgl", {
        alpha: false, antialias: false, depth: false,
        stencil: false, preserveDrawingBuffer: true
    }) || canvas.getContext("experimental-webgl");
    return !!gl;
}

function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function createProgram(vert, frag) {
    const vs = compileShader(vert, gl.VERTEX_SHADER);
    const fs = compileShader(frag, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error("Link error:", gl.getProgramInfoLog(prog));
        return null;
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return prog;
}

function setupGeometry() {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
}

let uniforms = {};
function cacheUniforms() {
    ["u_time", "u_resolution", "u_seed", "u_patternType", "u_waveletType",
     "u_paletteIndex", "u_animSpeed", "u_decompLevels", "u_glitchAmount"
    ].forEach(n => uniforms[n] = gl.getUniformLocation(program, n));
}

function setUniforms(time) {
    gl.uniform1f(uniforms.u_time, time);
    gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.u_seed, features.seed);
    gl.uniform1i(uniforms.u_patternType, features.patternType);
    gl.uniform1i(uniforms.u_waveletType, features.waveletType);
    gl.uniform1i(uniforms.u_paletteIndex, features.paletteIndex);
    gl.uniform1f(uniforms.u_animSpeed, features.animSpeed);
    gl.uniform1i(uniforms.u_decompLevels, features.decompLevels);
    gl.uniform1f(uniforms.u_glitchAmount, features.glitchAmount);
}

function render(ts) {
    if (!startTime) startTime = ts;
    let elapsed = isPaused ? pauseTime : (ts - startTime) / 1000;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);
    setUniforms(elapsed);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animationId = requestAnimationFrame(render);
}

// ============================================
// PUBLIC API
// ============================================

async function loadShaders() {
    try {
        const [vr, fr] = await Promise.all([
            fetch("shaders/wavelet.vert"), fetch("shaders/wavelet.frag")
        ]);
        return { vertSource: await vr.text(), fragSource: await fr.text() };
    } catch (e) { return null; }
}

async function setup(container, size = 700) {
    generateFeatures();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    if (container) container.appendChild(canvas);
    if (!initWebGL()) throw new Error("WebGL init failed");
    const shaders = await loadShaders();
    if (!shaders) throw new Error("Shader load failed");
    program = createProgram(shaders.vertSource, shaders.fragSource);
    if (!program) throw new Error("Shader compile failed");
    gl.useProgram(program);
    setupGeometry();
    cacheUniforms();
    startTime = null;
    render(performance.now());
    return features;
}

function regenerate() {
    hash = "0x" + Array(64).fill(0).map(() =>
        "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    generateFeatures();
    startTime = null;
    isPaused = false;
    pauseTime = 0;
    return features;
}

function togglePause() {
    if (isPaused) {
        startTime = performance.now() - pauseTime * 1000;
        isPaused = false;
    } else {
        pauseTime = (performance.now() - startTime) / 1000;
        isPaused = true;
    }
    return isPaused;
}

function save(filename = "wavelet-mosh") {
    const link = document.createElement("a");
    link.download = `${filename}-${hash.slice(2, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

function resize(size) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
}

function getHash() { return hash; }
function getFeatures() { return { ...features }; }
function setHash(h) {
    hash = h;
    generateFeatures();
    startTime = null;
    isPaused = false;
    pauseTime = 0;
    return features;
}

function getConstants() {
    return { PATTERN_TYPES, WAVELET_TYPES, PALETTE_NAMES, SPEED_NAMES, SPEED_VALUES };
}

function getRarityCurves() { return RARITY_CURVES; }

if (typeof window !== "undefined") {
    window.WaveletMosh = {
        setup, regenerate, togglePause, save, resize,
        getHash, getFeatures, setHash, canvas,
        setParameter, resetToOriginal, hasModifications,
        recordFeedback, getFeedbackStats, clearFeedback, exportFeedback,
        getConstants, getRarityCurves
    };
}
