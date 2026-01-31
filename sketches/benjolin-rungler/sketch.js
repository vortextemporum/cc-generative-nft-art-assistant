/**
 * Benjolin Rungler - Unified Chaos Field
 * All signals intersecting and modulating each other
 * No boxes - pure visual interplay
 *
 * Version: 4.0.1
 */

// ============================================
// HASH & RANDOMNESS
// ============================================

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
    const h = hashStr.slice(2);
    const seeds = [];
    for (let i = 0; i < 4; i++) {
        seeds.push(parseInt(h.slice(i * 8, (i + 1) * 8), 16));
    }
    return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

let R;
function rnd(min = 0, max = 1) { return R() * (max - min) + min; }
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rndChoice(arr) { return arr[Math.floor(R() * arr.length)]; }

// ============================================
// FEATURES
// ============================================

// Use window globals so UI controls can access them directly
window.features = {};
window.layers = {
    oscA: true,
    oscB: true,
    runglerA: true,
    runglerB: true,
    resonator: true,
    comparator: true,
    sh: true,
    clock: true
};

// Local references for convenience
let features = window.features;
let layers = window.layers;

const COLOR_SCHEMES = [
    { name: 'Phosphor', bg: [0, 4, 1], fg: [0, 255, 60], accent: [200, 255, 220], warm: [100, 255, 150] },
    { name: 'Amber', bg: [6, 3, 0], fg: [255, 140, 0], accent: [255, 220, 80], warm: [255, 180, 50] },
    { name: 'Blue', bg: [0, 1, 8], fg: [40, 100, 255], accent: [120, 180, 255], warm: [80, 150, 255] },
    { name: 'Matrix', bg: [0, 0, 0], fg: [0, 255, 0], accent: [180, 255, 180], warm: [100, 255, 100] },
    { name: 'Thermal', bg: [4, 0, 5], fg: [255, 20, 80], accent: [255, 180, 40], warm: [255, 100, 60] },
    { name: 'Cyan', bg: [0, 3, 5], fg: [0, 255, 255], accent: [150, 255, 255], warm: [100, 220, 255] }
];

function generateFeatures() {
    R = initRandom(hash);

    // Update properties on existing object (don't reassign)
    // This ensures UI controls continue to work
    let f = window.features;

    // Oscillators
    f.rateA = rnd(0.2, 1.6);
    f.rateB = rnd(0.15, 1.3);
    f.fmAtoB = rnd(0.3, 1.0);
    f.fmBtoA = rnd(0.3, 1.0);

    // Runglers
    f.runglerABits = rndInt(6, 14);
    f.runglerBBits = rndInt(6, 14);

    // Resonator
    f.peak1 = rnd(0.4, 0.98);
    f.peak2 = rnd(0.4, 0.98);

    // Visual
    f.colorScheme = rndChoice(COLOR_SCHEMES);
    f.chaos = rnd(0.5, 1.0);
    f.density = rnd(0.4, 1.0);
    f.speed = rnd(0.6, 1.4);
    f.waveCount = rndInt(3, 7);
    f.spiralTightness = rnd(0.5, 2.0);
    f.intersectionStyle = rndChoice(['additive', 'xor', 'multiply', 'interference']);

    // Update local reference
    features = window.features;

    return features;
}

// ============================================
// BENJOLIN SIMULATION
// ============================================

class Benjolin {
    constructor() {
        this.oscA = 0;
        this.oscB = 0;
        this.phaseA = rnd(0, Math.PI * 2);
        this.phaseB = rnd(0, Math.PI * 2);

        this.runglerA = new Array(16).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
        this.runglerB = new Array(16).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
        this.runglerAOut = 0;
        this.runglerBOut = 0;

        this.shValue = 0;
        this.compOut = 0;
        this.res1 = 0;
        this.res2 = 0;
        this.audioOut = 0;

        this.time = 0;
        this.clockA = false;
        this.clockB = false;

        // Extended histories for wave trails
        this.maxHist = 200;
        this.oscAHist = [];
        this.oscBHist = [];
        this.runglerAHist = [];
        this.runglerBHist = [];
        this.audioHist = [];
        this.compHist = [];
    }

    update(dt) {
        let f = window.features;
        this.time += dt * f.speed;
        this.clockA = false;
        this.clockB = false;

        let chaos = f.chaos;

        // Cross-modulation with rungler influence
        let fmA = this.oscB * f.fmBtoA + this.runglerAOut * chaos * 0.2;
        let fmB = this.oscA * f.fmAtoB + this.runglerBOut * chaos * 0.2;

        let freqA = f.rateA * (1 + fmA * 0.6 + this.shValue * 0.2);
        let freqB = f.rateB * (1 + fmB * 0.6);

        this.phaseA += freqA * dt * 2.5;
        this.phaseB += freqB * dt * 2.5;

        let prevA = this.oscA;
        let prevB = this.oscB;

        // Saturated oscillators
        this.oscA = Math.tanh(Math.sin(this.phaseA * Math.PI * 2) * (1 + chaos * 0.7));
        this.oscB = Math.tanh(Math.sin(this.phaseB * Math.PI * 2) * (1 + chaos * 0.7));

        // Clock detection
        if (prevA < 0 && this.oscA >= 0) {
            this.clockA = true;
            this.updateRungler('A');
        }
        if (prevB < 0 && this.oscB >= 0) {
            this.clockB = true;
            this.updateRungler('B');
            this.shValue = this.compOut * 0.5 + this.runglerAOut * 0.3 + this.runglerBOut * 0.2;
        }

        // Comparator
        this.compOut = (this.oscA > 0) !== (this.oscB > 0) ? 1 : -1;

        // Twin Peak Resonator
        let resInput = this.oscA * 0.25 + this.oscB * 0.25 +
                       this.runglerAOut * 0.3 + this.runglerBOut * 0.3;

        let p1 = f.peak1;
        let p2 = f.peak2;
        this.res1 += (resInput - this.res1 * (1 + p1 * 4)) * (0.08 + p1 * 0.25);
        this.res2 += (resInput - this.res2 * (1 + p2 * 4)) * (0.12 + p2 * 0.2);
        this.audioOut = Math.tanh((this.res1 + this.res2) * 1.5);

        // Store histories
        this.oscAHist.push(this.oscA);
        this.oscBHist.push(this.oscB);
        this.runglerAHist.push(this.runglerAOut);
        this.runglerBHist.push(this.runglerBOut);
        this.audioHist.push(this.audioOut);
        this.compHist.push(this.compOut);

        while (this.oscAHist.length > this.maxHist) {
            this.oscAHist.shift();
            this.oscBHist.shift();
            this.runglerAHist.shift();
            this.runglerBHist.shift();
            this.audioHist.shift();
            this.compHist.shift();
        }

        return this.getState();
    }

    updateRungler(which) {
        let f = window.features;
        let rungler = which === 'A' ? this.runglerA : this.runglerB;
        let bits = which === 'A' ? f.runglerABits : f.runglerBBits;
        let sampledOsc = which === 'A' ? this.oscB : this.oscA;

        rungler.pop();
        let newBit = sampledOsc > 0 ? 1 : 0;

        // XOR feedback
        if (f.chaos > 0.5 && Math.random() < f.chaos * 0.4) {
            newBit ^= rungler[Math.floor(bits / 2)];
        }
        rungler.unshift(newBit);

        let out = 0;
        for (let i = 0; i < bits; i++) {
            out += rungler[i] * Math.pow(2, -i - 1);
        }
        out = out * 2 - 0.5;

        if (which === 'A') this.runglerAOut = out;
        else this.runglerBOut = out;
    }

    getState() {
        return {
            oscA: this.oscA, oscB: this.oscB,
            runglerA: this.runglerAOut, runglerB: this.runglerBOut,
            runglerABits: [...this.runglerA], runglerBBits: [...this.runglerB],
            sh: this.shValue, comp: this.compOut,
            res1: this.res1, res2: this.res2, audio: this.audioOut,
            clockA: this.clockA, clockB: this.clockB, time: this.time,
            oscAHist: this.oscAHist, oscBHist: this.oscBHist,
            runglerAHist: this.runglerAHist, runglerBHist: this.runglerBHist,
            audioHist: this.audioHist, compHist: this.compHist
        };
    }
}

// ============================================
// UNIFIED VISUAL RENDERER
// ============================================

let benjolin;
let charBuffer = [];
let cols, rows;
let charW = 6;
let charH = 9;

function setup() {
    createCanvas(700, 700);
    generateFeatures();
    cols = Math.floor(width / charW);
    rows = Math.floor(height / charH);

    charBuffer = new Array(rows).fill(null).map(() =>
        new Array(cols).fill(null).map(() => ({ char: ' ', brightness: 0, hue: 0, layer: 0 }))
    );

    benjolin = new Benjolin();
    textFont('Courier New');
    textSize(8);
    textAlign(LEFT, TOP);

    console.log('Benjolin v4.0.1 - Unified Chaos');
    console.log('Intersection:', window.features.intersectionStyle);
    console.log('Features:', window.features);
}

function clearBuffer() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            charBuffer[y][x] = { char: ' ', brightness: 0, hue: 0, layer: 0 };
        }
    }
}

function blendChar(x, y, char, brightness, hue, layer = 1) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= cols || y < 0 || y >= rows) return;

    let cell = charBuffer[y][x];
    let style = window.features.intersectionStyle;

    if (style === 'additive') {
        cell.brightness = Math.min(1, cell.brightness + brightness * 0.7);
        cell.hue = (cell.hue + hue) / 2;
        if (brightness > cell.layer * 0.3) cell.char = char;
        cell.layer = Math.max(cell.layer, layer);
    } else if (style === 'xor') {
        if (cell.brightness > 0.1) {
            cell.brightness = Math.abs(cell.brightness - brightness);
            cell.char = cell.brightness > 0.3 ? '╳' : '·';
        } else {
            cell.brightness = brightness;
            cell.char = char;
        }
        cell.hue = (cell.hue - hue + 1) % 1;
    } else if (style === 'multiply') {
        if (cell.brightness > 0) {
            cell.brightness = Math.min(1, cell.brightness * (1 + brightness));
            cell.char = brightness > 0.5 ? char : cell.char;
        } else {
            cell.brightness = brightness;
            cell.char = char;
        }
        cell.hue = cell.hue * 0.5 + hue * 0.5;
    } else { // interference
        let phase = (cell.brightness + brightness) * Math.PI;
        cell.brightness = Math.abs(Math.sin(phase)) * 0.8 + 0.2 * Math.max(cell.brightness, brightness);
        cell.hue = Math.sin((cell.hue + hue) * Math.PI) * 0.5;
        cell.char = cell.brightness > 0.5 ? char : (cell.char !== ' ' ? cell.char : '·');
    }
}

// Oscillator waves sweeping across the field
function drawOscillatorWaves(state) {
    let centerY = rows / 2;
    let centerX = cols / 2;
    let t = state.time;
    let L = window.layers;

    // OSC A - horizontal waves
    if (L.oscA) {
        for (let wave = 0; wave < window.features.waveCount; wave++) {
            let phaseOffset = wave * (Math.PI * 2 / window.features.waveCount);
            let waveY = centerY + Math.sin(t * 1.5 + phaseOffset) * (rows * 0.3);
            let amplitude = (rows * 0.15) * (1 + state.runglerA * 0.5);

            for (let x = 0; x < cols; x++) {
                let xPhase = x / cols * Math.PI * 4 + t * 2;
                let histIdx = Math.floor((x / cols) * Math.min(state.oscAHist.length - 1, cols));
                let histVal = state.oscAHist[histIdx] || state.oscA;

                let y = waveY + histVal * amplitude + Math.sin(xPhase + state.runglerB * 3) * 5;
                let brightness = 0.3 + Math.abs(histVal) * 0.5;
                let char = histVal > 0.3 ? '█' : histVal > 0 ? '▓' : histVal > -0.3 ? '▒' : '░';

                blendChar(x, y, char, brightness, histVal * 0.4, 1);

                // Vertical extension
                let ext = Math.abs(histVal) * 3;
                for (let dy = 1; dy <= ext; dy++) {
                    blendChar(x, y + dy, '│', brightness * 0.5 / dy, histVal * 0.3, 1);
                    blendChar(x, y - dy, '│', brightness * 0.5 / dy, histVal * 0.3, 1);
                }
            }
        }
    }

    // OSC B - vertical waves
    if (!L.oscB) return;
    for (let wave = 0; wave < window.features.waveCount; wave++) {
        let phaseOffset = wave * (Math.PI * 2 / window.features.waveCount);
        let waveX = centerX + Math.cos(t * 1.2 + phaseOffset) * (cols * 0.3);
        let amplitude = (cols * 0.12) * (1 + state.runglerB * 0.5);

        for (let y = 0; y < rows; y++) {
            let yPhase = y / rows * Math.PI * 4 + t * 1.8;
            let histIdx = Math.floor((y / rows) * Math.min(state.oscBHist.length - 1, rows));
            let histVal = state.oscBHist[histIdx] || state.oscB;

            let x = waveX + histVal * amplitude + Math.cos(yPhase + state.runglerA * 3) * 4;
            let brightness = 0.25 + Math.abs(histVal) * 0.45;
            let char = histVal > 0 ? '○' : '●';

            blendChar(x, y, char, brightness, histVal * -0.4, 2);
        }
    }
}

// Rungler stepped patterns as diagonal bands
function drawRunglerBands(state) {
    let t = state.time;
    let L = window.layers;

    // Rungler A - diagonal bands from top-left
    if (L.runglerA) {
        for (let i = 0; i < window.features.runglerABits; i++) {
            let bit = state.runglerABits[i];
            let offset = i * (cols / window.features.runglerABits);
            let bandWidth = cols / window.features.runglerABits * 0.8;

            for (let d = 0; d < cols + rows; d++) {
                let x = d + offset + Math.sin(t * 2) * 5 - rows / 2;
                let y = d - offset - Math.sin(t * 2) * 5;

                if (x >= 0 && x < cols && y >= 0 && y < rows) {
                    let brightness = bit ? 0.35 : 0.1;
                    let wave = Math.sin(d * 0.1 + t * 3 + state.runglerA * 5);
                    brightness += wave * 0.15;

                    let char = bit ? (wave > 0.3 ? '▓' : '▒') : '·';
                    blendChar(x, y, char, brightness, state.runglerA * 0.5, 3);
                }
            }
        }
    }

    // Rungler B - diagonal bands from top-right
    if (!L.runglerB) return;
    for (let i = 0; i < window.features.runglerBBits; i++) {
        let bit = state.runglerBBits[i];
        let offset = i * (cols / window.features.runglerBBits);

        for (let d = 0; d < cols + rows; d++) {
            let x = cols - d - offset + Math.cos(t * 1.8) * 5 + rows / 2;
            let y = d - offset - Math.cos(t * 1.8) * 5;

            if (x >= 0 && x < cols && y >= 0 && y < rows) {
                let brightness = bit ? 0.3 : 0.08;
                let wave = Math.cos(d * 0.12 + t * 2.5 + state.runglerB * 5);
                brightness += wave * 0.12;

                let char = bit ? (wave > 0.3 ? '░' : '·') : ' ';
                if (char !== ' ') blendChar(x, y, char, brightness, state.runglerB * -0.5, 3);
            }
        }
    }
}

// Resonator creates circular/spiral interference
function drawResonatorField(state) {
    let centerX = cols / 2;
    let centerY = rows / 2;
    let t = state.time;

    let numRings = Math.floor(10 + window.features.peak1 * 15);
    let spiralFactor = window.features.spiralTightness;

    for (let ring = 0; ring < numRings; ring++) {
        let baseRadius = ring * 4 + Math.sin(t * 2 + ring * 0.5) * 3;
        let histIdx = Math.floor((ring / numRings) * (state.audioHist.length - 1));
        let audioVal = state.audioHist[histIdx] || state.audio;

        let radius = baseRadius * (1 + audioVal * 0.3);

        let circumference = Math.PI * 2 * radius;
        let steps = Math.max(10, Math.floor(circumference / 2));

        for (let i = 0; i < steps; i++) {
            let angle = (i / steps) * Math.PI * 2 + t * (0.5 + state.res1 * 0.5);
            angle += ring * spiralFactor * 0.1; // Spiral offset

            let r = radius + Math.sin(angle * 3 + t * 4) * state.res2 * 5;
            let x = centerX + Math.cos(angle) * r * 0.9;
            let y = centerY + Math.sin(angle) * r * 0.6;

            let brightness = 0.15 + Math.abs(audioVal) * 0.4;
            brightness *= (1 - ring / numRings * 0.5);

            let char = audioVal > 0.3 ? '◆' : audioVal > 0 ? '◇' : audioVal > -0.3 ? '·' : '∘';

            blendChar(x, y, char, brightness, audioVal * 0.3, 4);
        }
    }
}

// Comparator creates grid modulation
function drawComparatorGrid(state) {
    let t = state.time;
    let gridSize = 8 + Math.floor(state.comp * 3);

    for (let gy = 0; gy < rows; gy += gridSize) {
        for (let gx = 0; gx < cols; gx += gridSize) {
            let histIdx = Math.floor(((gx + gy) / (cols + rows)) * (state.compHist.length - 1));
            let compVal = state.compHist[histIdx] || state.comp;

            if (compVal > 0) {
                // Draw cross
                for (let i = -2; i <= 2; i++) {
                    blendChar(gx + i, gy, '─', 0.2, 0.2, 5);
                    blendChar(gx, gy + i, '│', 0.2, 0.2, 5);
                }
                blendChar(gx, gy, '┼', 0.3, 0.3, 5);
            } else {
                // Draw X
                for (let i = -2; i <= 2; i++) {
                    blendChar(gx + i, gy + i, '╲', 0.15, -0.2, 5);
                    blendChar(gx + i, gy - i, '╱', 0.15, -0.2, 5);
                }
                blendChar(gx, gy, '╳', 0.25, -0.3, 5);
            }
        }
    }
}

// S&H creates floating particles
function drawSHParticles(state) {
    let t = state.time;
    let numParticles = Math.floor(20 + window.features.density * 40);

    for (let i = 0; i < numParticles; i++) {
        let seed = i * 1.618;
        let px = (Math.sin(seed * 12.9898 + t * 0.3) * 0.5 + 0.5) * cols;
        let py = (Math.cos(seed * 78.233 + t * 0.25 + state.sh * 2) * 0.5 + 0.5) * rows;

        // Particles attracted to signal peaks
        px += state.oscA * 10;
        py += state.oscB * 8;

        let brightness = 0.1 + Math.abs(state.sh) * 0.3 + Math.sin(t + i) * 0.1;
        let chars = ['·', '∘', '°', '•', '◦', '∙', '⋅'];
        let char = chars[i % chars.length];

        blendChar(px, py, char, brightness, state.sh * 0.4, 6);

        // Trail
        for (let trail = 1; trail <= 3; trail++) {
            let tx = px - Math.sin(seed + t * 0.3) * trail * 2;
            let ty = py - Math.cos(seed + t * 0.25) * trail * 2;
            blendChar(tx, ty, '·', brightness * 0.3 / trail, state.sh * 0.2, 6);
        }
    }
}

// Clock pulses create expanding rings
function drawClockPulses(state) {
    if (!state.clockA && !state.clockB) return;

    let centerX = cols / 2;
    let centerY = rows / 2;

    if (state.clockA) {
        // Expanding ring from center
        let radius = 5 + (benjolin.time % 1) * 30;
        let steps = Math.floor(radius * 4);
        for (let i = 0; i < steps; i++) {
            let angle = (i / steps) * Math.PI * 2;
            let x = centerX + Math.cos(angle) * radius * 0.9;
            let y = centerY + Math.sin(angle) * radius * 0.6;
            blendChar(x, y, '○', 0.4, 0.5, 7);
        }
    }

    if (state.clockB) {
        // Vertical pulse lines
        for (let x = 0; x < cols; x += 10) {
            for (let y = 0; y < rows; y++) {
                if ((y + Math.floor(benjolin.time * 20)) % 5 === 0) {
                    blendChar(x, y, '│', 0.2, -0.3, 7);
                }
            }
        }
    }
}

function drawVisualization(state) {
    // Layer everything together (respecting visibility toggles)
    let L = window.layers;
    if (L.comparator) drawComparatorGrid(state);
    if (L.runglerA || L.runglerB) drawRunglerBands(state);
    if (L.oscA || L.oscB) drawOscillatorWaves(state);
    if (L.resonator) drawResonatorField(state);
    if (L.sh) drawSHParticles(state);
    if (L.clock) drawClockPulses(state);

    // Title (subtle, in corner)
    let title = 'BENJOLIN';
    for (let i = 0; i < title.length; i++) {
        charBuffer[0][1 + i] = { char: title[i], brightness: 0.6, hue: 0, layer: 10 };
    }

    // Stats in other corner
    let stats = `${window.features.intersectionStyle.toUpperCase()}`;
    for (let i = 0; i < stats.length; i++) {
        charBuffer[0][cols - stats.length - 1 + i] = { char: stats[i], brightness: 0.4, hue: 0, layer: 10 };
    }
}

function draw() {
    let state = benjolin.update(deltaTime / 1000);
    clearBuffer();
    drawVisualization(state);

    // Render
    let scheme = window.features.colorScheme;
    background(scheme.bg[0], scheme.bg[1], scheme.bg[2]);

    // Subtle scanlines
    stroke(0, 6);
    for (let sy = 0; sy < height; sy += 2) line(0, sy, width, sy);
    noStroke();

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let cell = charBuffer[y][x];
            if (cell.char !== ' ' && cell.brightness > 0.02) {
                let b = cell.brightness;
                let h = cell.hue;

                // Color from scheme with hue modulation
                let r = lerp(scheme.fg[0], scheme.accent[0], Math.max(0, h)) * b;
                let g = lerp(scheme.fg[1], scheme.accent[1], 0.5 + h * 0.3) * b;
                let bl = lerp(scheme.fg[2], scheme.accent[2], Math.max(0, -h)) * b;

                // Warm tint based on layer
                if (cell.layer > 3) {
                    r = lerp(r, scheme.warm[0] * b, 0.2);
                    g = lerp(g, scheme.warm[1] * b, 0.2);
                    bl = lerp(bl, scheme.warm[2] * b, 0.2);
                }

                // Glow for bright cells
                if (b > 0.4) {
                    fill(r * 0.15, g * 0.15, bl * 0.15, 50);
                    noStroke();
                    ellipse(x * charW + charW / 2, y * charH + charH / 2, charW * 2, charH * 2);
                }

                fill(r, g, bl);
                text(cell.char, x * charW + 1, y * charH);
            }
        }
    }
}

// ============================================
// CONTROLS
// ============================================

function keyPressed() {
    if (key === 'r' || key === 'R') {
        hash = "0x" + Array(64).fill(0).map(() =>
            "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
        generateFeatures();
        benjolin = new Benjolin();
    }
    if (key === 's' || key === 'S') {
        saveCanvas(`benjolin-unified-${hash.slice(2, 10)}`, 'png');
    }
}

window.benjolin = {
    features: () => window.features,
    layers: () => window.layers,
    regenerate: () => {
        hash = "0x" + Array(64).fill(0).map(() =>
            "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
        generateFeatures();
        benjolin = new Benjolin();
    },
    setColorScheme: (idx) => {
        window.features.colorScheme = COLOR_SCHEMES[idx % COLOR_SCHEMES.length];
    },
    toggleLayer: (layerName) => {
        if (layerName in window.layers) {
            window.layers[layerName] = !window.layers[layerName];
            return window.layers[layerName];
        }
        return null;
    },
    setLayer: (layerName, value) => {
        if (layerName in window.layers) {
            window.layers[layerName] = !!value; // Ensure boolean
        }
    },
    setIntersectionStyle: (style) => {
        if (['additive', 'xor', 'multiply', 'interference'].includes(style)) {
            window.features.intersectionStyle = style;
        }
    },
    setWaveCount: (count) => {
        window.features.waveCount = Math.max(1, Math.min(12, Math.floor(Number(count))));
    },
    setSpeed: (speed) => {
        window.features.speed = Math.max(0.1, Math.min(3, Number(speed)));
    },
    setDensity: (density) => {
        window.features.density = Math.max(0.1, Math.min(1.5, Number(density)));
    },
    setSpiralTightness: (tightness) => {
        window.features.spiralTightness = Math.max(0.1, Math.min(4, Number(tightness)));
    },
    setChaos: (chaos) => {
        window.features.chaos = Math.max(0, Math.min(1, Number(chaos)));
    }
};
