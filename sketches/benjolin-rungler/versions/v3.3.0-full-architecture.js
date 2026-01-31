/**
 * Benjolin Rungler - ASCII Art Visualization
 * Full Benjolin architecture with dual Runglers
 *
 * Modules:
 * - OSC A & B with cross-FM
 * - RUNGLER A & B (dual shift registers)
 * - S&H (Sample & Hold)
 * - COMPARATOR
 * - TWIN PEAK RESONATOR
 *
 * Version: 3.3.0
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
function rndBool(p = 0.5) { return R() < p; }

// ============================================
// FEATURES
// ============================================

let features = {};

const COLOR_SCHEMES = [
    { name: 'Phosphor', bg: [0, 6, 2], fg: [0, 255, 70], accent: [200, 255, 220], dim: [0, 50, 25] },
    { name: 'Amber', bg: [8, 5, 0], fg: [255, 150, 0], accent: [255, 220, 100], dim: [70, 35, 0] },
    { name: 'Blue', bg: [0, 2, 10], fg: [50, 110, 255], accent: [140, 190, 255], dim: [15, 35, 70] },
    { name: 'Matrix', bg: [0, 0, 0], fg: [0, 255, 0], accent: [180, 255, 180], dim: [0, 40, 0] },
    { name: 'Thermal', bg: [5, 0, 6], fg: [255, 30, 90], accent: [255, 190, 50], dim: [50, 10, 25] }
];

function generateFeatures() {
    R = initRandom(hash);

    features = {
        // Oscillators
        rateA: rnd(0.3, 1.8),
        rateB: rnd(0.2, 1.5),
        fmAtoB: rnd(0.2, 0.9),
        fmBtoA: rnd(0.2, 0.9),

        // Runglers
        runglerABits: rndInt(6, 12),
        runglerBBits: rndInt(6, 12),
        runglerAtoRes: rnd(0.1, 0.8),
        runglerBtoRes: rnd(0.1, 0.8),

        // S&H
        shToRateA: rnd(0.0, 0.6),
        shToRes: rnd(0.1, 0.7),

        // Resonator
        peak1: rnd(0.3, 0.95),
        peak2: rnd(0.3, 0.95),

        // Visual
        colorScheme: rndChoice(COLOR_SCHEMES),
        chaos: rnd(0.4, 1.0),
        glitch: rnd(0.1, 0.5),
        speed: rnd(0.6, 1.3)
    };

    return features;
}

// ============================================
// FULL BENJOLIN SIMULATION
// ============================================

class Benjolin {
    constructor() {
        // Oscillators
        this.oscA = 0;
        this.oscB = 0;
        this.phaseA = 0;
        this.phaseB = 0;

        // Runglers (shift registers)
        this.runglerA = new Array(16).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
        this.runglerB = new Array(16).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
        this.runglerAOut = 0;
        this.runglerBOut = 0;

        // S&H
        this.shValue = 0;
        this.shTrigger = false;

        // Comparator
        this.compOut = 0;

        // Twin Peak Resonator
        this.res1 = 0;
        this.res2 = 0;
        this.audioOut = 0;

        this.time = 0;
        this.clockA = false;
        this.clockB = false;

        // Histories
        this.oscAHist = [];
        this.oscBHist = [];
        this.runglerAHist = [];
        this.runglerBHist = [];
        this.shHist = [];
        this.audioHist = [];
    }

    update(dt) {
        this.time += dt * features.speed;
        this.clockA = false;
        this.clockB = false;

        let chaos = features.chaos;

        // FM Cross-modulation
        let fmA = this.oscB * features.fmBtoA + this.runglerAOut * chaos * 0.15;
        let fmB = this.oscA * features.fmAtoB + this.runglerBOut * chaos * 0.15;

        // Rate modulation from S&H
        let rateModA = this.shValue * features.shToRateA;

        let freqA = features.rateA * (1 + fmA * 0.5 + rateModA * 0.3);
        let freqB = features.rateB * (1 + fmB * 0.5);

        this.phaseA += freqA * dt * 2;
        this.phaseB += freqB * dt * 2;

        let prevOscA = this.oscA;
        let prevOscB = this.oscB;

        // Oscillator waveforms with saturation
        this.oscA = Math.tanh(Math.sin(this.phaseA * Math.PI * 2) * (1 + chaos * 0.5));
        this.oscB = Math.tanh(Math.sin(this.phaseB * Math.PI * 2) * (1 + chaos * 0.5));

        // Clock detection (zero crossings)
        if (prevOscA < 0 && this.oscA >= 0) {
            this.clockA = true;
            this.updateRungler('A');
        }
        if (prevOscB < 0 && this.oscB >= 0) {
            this.clockB = true;
            this.updateRungler('B');
            this.updateSH();
        }

        // Comparator - XOR of oscillator polarities
        this.compOut = (this.oscA > 0) !== (this.oscB > 0) ? 1 : -1;

        // Twin Peak Resonator
        let resInput = this.oscA * 0.3 + this.oscB * 0.3 +
                       this.runglerAOut * features.runglerAtoRes +
                       this.runglerBOut * features.runglerBtoRes +
                       this.shValue * features.shToRes;

        // Two resonant filters at different frequencies
        let p1 = features.peak1;
        let p2 = features.peak2;
        this.res1 += (resInput - this.res1 * (1 + p1 * 3)) * (0.1 + p1 * 0.3);
        this.res2 += (resInput - this.res2 * (1 + p2 * 3)) * (0.15 + p2 * 0.25);

        this.audioOut = (this.res1 + this.res2) * 0.5;

        // Store histories
        this.oscAHist.push(this.oscA);
        this.oscBHist.push(this.oscB);
        this.runglerAHist.push(this.runglerAOut);
        this.runglerBHist.push(this.runglerBOut);
        this.shHist.push(this.shValue);
        this.audioHist.push(this.audioOut);

        const maxHist = 120;
        if (this.oscAHist.length > maxHist) {
            this.oscAHist.shift();
            this.oscBHist.shift();
            this.runglerAHist.shift();
            this.runglerBHist.shift();
            this.shHist.shift();
            this.audioHist.shift();
        }

        return this.getState();
    }

    updateRungler(which) {
        let rungler = which === 'A' ? this.runglerA : this.runglerB;
        let bits = which === 'A' ? features.runglerABits : features.runglerBBits;
        let sampledOsc = which === 'A' ? this.oscB : this.oscA; // Cross-sample

        rungler.pop();
        let newBit = sampledOsc > 0 ? 1 : 0;

        // XOR feedback for more chaos
        if (features.chaos > 0.5 && Math.random() < features.chaos * 0.3) {
            let tapBit = rungler[Math.floor(bits / 2)];
            newBit = newBit ^ tapBit;
        }
        rungler.unshift(newBit);

        // DAC conversion
        let out = 0;
        for (let i = 0; i < bits; i++) {
            out += rungler[i] * Math.pow(2, -i - 1);
        }
        out = out * 2 - 0.5;

        if (which === 'A') {
            this.runglerAOut = out;
        } else {
            this.runglerBOut = out;
        }
    }

    updateSH() {
        // Sample & Hold samples the comparator output
        this.shValue = this.compOut * 0.5 + this.runglerAOut * 0.3 + this.runglerBOut * 0.2;
        this.shTrigger = true;
    }

    getState() {
        return {
            oscA: this.oscA,
            oscB: this.oscB,
            runglerA: this.runglerAOut,
            runglerB: this.runglerBOut,
            runglerABits: [...this.runglerA],
            runglerBBits: [...this.runglerB],
            sh: this.shValue,
            comp: this.compOut,
            res1: this.res1,
            res2: this.res2,
            audio: this.audioOut,
            clockA: this.clockA,
            clockB: this.clockB,
            time: this.time,
            oscAHist: this.oscAHist,
            oscBHist: this.oscBHist,
            runglerAHist: this.runglerAHist,
            runglerBHist: this.runglerBHist,
            shHist: this.shHist,
            audioHist: this.audioHist
        };
    }
}

// ============================================
// ASCII RENDERER
// ============================================

let benjolin;
let charBuffer = [];
let cols, rows;
let charW = 7;
let charH = 10;

function setup() {
    createCanvas(700, 700);
    generateFeatures();
    cols = Math.floor(width / charW);
    rows = Math.floor(height / charH);

    charBuffer = new Array(rows).fill(null).map(() =>
        new Array(cols).fill(null).map(() => ({ char: ' ', brightness: 0, hue: 0 }))
    );

    benjolin = new Benjolin();
    textFont('Courier New');
    textSize(9);
    textAlign(LEFT, TOP);

    console.log('Benjolin v3.3.0 - Full Architecture');
    console.log('Features:', features);
}

function clearBuffer() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            charBuffer[y][x] = { char: ' ', brightness: 0, hue: 0 };
        }
    }
}

function setChar(x, y, char, brightness = 1, hue = 0) {
    x = Math.floor(x); y = Math.floor(y);
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
        if (charBuffer[y][x].brightness < brightness) {
            charBuffer[y][x] = { char, brightness, hue };
        }
    }
}

function addChar(x, y, char, brightness = 1, hue = 0) {
    x = Math.floor(x); y = Math.floor(y);
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
        let existing = charBuffer[y][x];
        let newB = Math.min(1, existing.brightness + brightness * 0.6);
        charBuffer[y][x] = { char, brightness: newB, hue: (existing.hue + hue) / 2 };
    }
}

function drawText(x, y, text, brightness = 1, hue = 0) {
    for (let i = 0; i < text.length; i++) {
        setChar(x + i, y, text[i], brightness, hue);
    }
}

// Draw waveform with history
function drawWave(x, y, w, h, history, label, currentVal, style = 'solid') {
    // Border
    setChar(x, y, '┌', 0.4); setChar(x + w - 1, y, '┐', 0.4);
    setChar(x, y + h - 1, '└', 0.4); setChar(x + w - 1, y + h - 1, '┘', 0.4);
    for (let i = 1; i < w - 1; i++) {
        setChar(x + i, y, '─', 0.3); setChar(x + i, y + h - 1, '─', 0.3);
    }
    for (let i = 1; i < h - 1; i++) {
        setChar(x, y + i, '│', 0.3); setChar(x + w - 1, y + i, '│', 0.3);
    }

    if (label) drawText(x + 1, y, label, 0.8);

    let centerY = y + Math.floor(h / 2);
    let amplitude = (h - 3) / 2;
    let len = Math.min(history.length, w - 2);
    let start = history.length - len;

    for (let i = 0; i < len; i++) {
        let val = history[start + i];
        let wy = Math.round(centerY - val * amplitude);
        let age = i / len;
        let brightness = 0.2 + age * 0.8;

        let char;
        if (style === 'stepped') {
            char = val > 0.3 ? '█' : val > 0 ? '▓' : val > -0.3 ? '▒' : '░';
        } else if (style === 'dots') {
            char = val > 0 ? '●' : '○';
        } else {
            char = '█';
        }

        // Draw vertical fill for more presence
        let fromY = centerY;
        let toY = wy;
        if (toY > fromY) [fromY, toY] = [toY, fromY];

        for (let fy = toY; fy <= fromY; fy++) {
            let dist = Math.abs(fy - wy);
            let c = dist === 0 ? char : dist === 1 ? '▓' : '░';
            let b = brightness * (1 - dist * 0.25);
            if (b > 0.15) setChar(x + 1 + i, fy, c, b, val * 0.4);
        }
    }

    // Current value
    let valStr = currentVal.toFixed(2);
    drawText(x + w - valStr.length - 1, y + h - 1, valStr, 0.6, currentVal);
}

// Draw shift register
function drawRungler(x, y, w, h, bits, numBits, history, label, currentVal, clock) {
    setChar(x, y, '┌', 0.4); setChar(x + w - 1, y, '┐', 0.4);
    setChar(x, y + h - 1, '└', 0.4); setChar(x + w - 1, y + h - 1, '┘', 0.4);
    for (let i = 1; i < w - 1; i++) {
        setChar(x + i, y, '─', 0.3); setChar(x + i, y + h - 1, '─', 0.3);
    }
    for (let i = 1; i < h - 1; i++) {
        setChar(x, y + i, '│', 0.3); setChar(x + w - 1, y + i, '│', 0.3);
    }

    if (label) drawText(x + 1, y, label, 0.8);

    // Bit display
    let bitY = y + 1;
    for (let i = 0; i < Math.min(numBits, w - 2); i++) {
        let bit = bits[i];
        let char = bit ? '█' : '░';
        let brightness = bit ? 0.9 : 0.2;
        if (clock && i === 0) brightness = 1;
        let wave = Math.sin(benjolin.time * 4 + i * 0.4) * 0.1;
        setChar(x + 1 + i, bitY, char, brightness + wave, bit ? 0.5 : -0.3);
    }

    // Stepped output visualization
    let cvY = y + 3;
    let cvH = h - 5;
    let len = Math.min(history.length, w - 2);
    let start = history.length - len;

    for (let i = 0; i < len; i++) {
        let val = history[start + i];
        let normalized = (val + 0.5);
        let barH = Math.round(normalized * cvH);
        let age = i / len;

        for (let by = 0; by < barH; by++) {
            let brightness = 0.15 + age * 0.5 + (by / cvH) * 0.3;
            let chars = ['░', '▒', '▓', '█'];
            let ci = Math.min(3, Math.floor(by / cvH * 4));
            setChar(x + 1 + i, cvY + cvH - 1 - by, chars[ci], brightness, val * 0.5);
        }
    }

    let valStr = currentVal.toFixed(2);
    drawText(x + w - valStr.length - 1, y + h - 1, valStr, 0.6, currentVal);
}

// Chaos field background
function drawChaos(state) {
    let t = state.time;
    let chaos = features.chaos;

    // Floating particles influenced by all signals
    let numP = Math.floor(chaos * 40);
    for (let i = 0; i < numP; i++) {
        let px = Math.floor((Math.sin(t * 0.5 + i * 1.1 + state.runglerA * 2) * 0.5 + 0.5) * cols);
        let py = Math.floor((Math.cos(t * 0.4 + i * 1.4 + state.runglerB * 2) * 0.5 + 0.5) * rows);
        let char = ['·', '∘', '°', '•', '◦', '∙'][i % 6];
        let brightness = 0.08 + Math.sin(t * 2 + i * 0.7) * 0.05;
        addChar(px, py, char, brightness, state.audio * 0.3);
    }

    // Glitch scanlines
    if (features.glitch > 0.25) {
        for (let i = 0; i < Math.floor(features.glitch * 4); i++) {
            if (Math.random() < features.glitch * 0.4) {
                let gy = Math.floor(Math.random() * rows);
                let gx = Math.floor(Math.random() * (cols - 15));
                let gLen = Math.floor(Math.random() * 12) + 3;
                for (let gi = 0; gi < gLen; gi++) {
                    addChar(gx + gi, gy, '─', 0.1 + Math.random() * 0.08);
                }
            }
        }
    }

    // Clock flash on rungler clock
    if (state.clockA || state.clockB) {
        let flashChar = state.clockA ? '╪' : '╫';
        for (let i = 0; i < 5; i++) {
            let fx = Math.floor(Math.random() * cols);
            let fy = Math.floor(Math.random() * rows);
            addChar(fx, fy, flashChar, 0.15);
        }
    }
}

// Signal flow connections
function drawConnections(state) {
    let t = state.time;

    // Animated signal particles between modules
    // OSC A -> RUNGLER A
    for (let i = 0; i < 3; i++) {
        let progress = ((t * 3 + i * 0.3) % 1);
        let px = Math.floor(lerp(18, 28, progress));
        if (state.oscA > 0) {
            addChar(px, 8, '→', 0.3 + progress * 0.3, state.oscA);
        }
    }

    // OSC B -> RUNGLER B
    for (let i = 0; i < 3; i++) {
        let progress = ((t * 2.5 + i * 0.3) % 1);
        let px = Math.floor(lerp(18, 28, progress));
        if (state.oscB > 0) {
            addChar(px, 30, '→', 0.3 + progress * 0.3, state.oscB);
        }
    }

    // Cross-FM indicators
    let fmIntensity = Math.abs(state.oscA * state.oscB);
    if (fmIntensity > 0.3) {
        addChar(10, 18, '↕', 0.3 + fmIntensity * 0.4);
        addChar(10, 19, '↕', 0.3 + fmIntensity * 0.4);
    }

    // Rungler to Resonator
    for (let i = 0; i < 4; i++) {
        let progress = ((t * 4 + i * 0.25) % 1);
        let px = Math.floor(lerp(55, 70, progress));
        let active = Math.abs(state.runglerA) > 0.2 || Math.abs(state.runglerB) > 0.2;
        if (active) {
            addChar(px, 19, '·', 0.2 + progress * 0.2);
        }
    }
}

function drawVisualization(state) {
    drawChaos(state);
    drawConnections(state);

    const m = 1; // margin

    // Header
    let glitchTitle = Math.random() < features.glitch * 0.3;
    let title = glitchTitle ? 'BENJ0L1N' : 'BENJOLIN';
    drawText(m, 0, title + ' CHAOTIC CORE', 1);
    drawText(cols - features.colorScheme.name.length - m, 0, features.colorScheme.name, 0.4);

    // Layout: 4 rows
    // Row 1: OSC A | RUNGLER A
    // Row 2: OSC B | RUNGLER B
    // Row 3: S&H + COMPARATOR | TWIN PEAK RESONATOR
    // Row 4: AUDIO OUTPUT (full width)

    let colW = Math.floor((cols - 3) / 2);
    let rowH = Math.floor((rows - 6) / 4);

    // OSC A
    drawWave(m, 2, colW, rowH, state.oscAHist, 'OSC A', state.oscA, 'solid');

    // RUNGLER A
    drawRungler(m + colW + 1, 2, colW, rowH, state.runglerABits, features.runglerABits,
                state.runglerAHist, 'RUNGLER A', state.runglerA, state.clockA);

    // OSC B
    drawWave(m, 2 + rowH + 1, colW, rowH, state.oscBHist, 'OSC B', state.oscB, 'solid');

    // RUNGLER B
    drawRungler(m + colW + 1, 2 + rowH + 1, colW, rowH, state.runglerBBits, features.runglerBBits,
                state.runglerBHist, 'RUNGLER B', state.runglerB, state.clockB);

    // S&H + COMPARATOR (smaller)
    let row3Y = 2 + (rowH + 1) * 2;
    let smallW = Math.floor(colW * 0.6);
    drawWave(m, row3Y, smallW, rowH, state.shHist, 'S&H', state.sh, 'stepped');

    // Comparator indicator
    let compX = m + smallW + 2;
    drawText(compX, row3Y, '┌COMP┐', 0.5);
    let compChar = state.comp > 0 ? '▲' : '▼';
    setChar(compX + 2, row3Y + 2, compChar, 0.8, state.comp);
    drawText(compX, row3Y + 4, `${state.comp > 0 ? '+' : '-'}`, 0.5);

    // TWIN PEAK RESONATOR
    let resX = m + colW + 1;
    let resW = colW;
    drawWave(resX, row3Y, resW, rowH, state.audioHist, 'TWIN PEAK RES', state.audio, 'solid');

    // Peak indicators
    let peakChars = '○◔◑◕●';
    let p1Idx = Math.floor(features.peak1 * 4.99);
    let p2Idx = Math.floor(features.peak2 * 4.99);
    drawText(resX + resW - 10, row3Y, `P1:${peakChars[p1Idx]}`, 0.5);
    drawText(resX + resW - 5, row3Y, `P2:${peakChars[p2Idx]}`, 0.5);

    // AUDIO OUTPUT (full width)
    let row4Y = row3Y + rowH + 1;
    let outH = rows - row4Y - 2;
    drawWave(m, row4Y, cols - m * 2, outH, state.audioHist, 'AUDIO OUT', state.audio, 'solid');

    // Status bar
    let statusY = rows - 1;
    let chaosLvl = features.chaos > 0.75 ? 'EXTREME' : features.chaos > 0.5 ? 'HIGH' : 'MODERATE';
    drawText(m, statusY, `CHAOS:${chaosLvl}`, 0.4);
    drawText(m + 15, statusY, `FM:${(features.fmAtoB * 100).toFixed(0)}%↔${(features.fmBtoA * 100).toFixed(0)}%`, 0.35);

    let rarity = features.peak1 > 0.85 && features.peak2 > 0.85 ? 'LEGENDARY' :
                 features.chaos > 0.8 || features.runglerABits > 10 ? 'RARE' :
                 features.fmAtoB > 0.7 ? 'UNCOMMON' : 'COMMON';
    drawText(cols - rarity.length - m, statusY, rarity, rarity === 'LEGENDARY' ? 1 : 0.45);
}

function draw() {
    let state = benjolin.update(deltaTime / 1000);
    clearBuffer();
    drawVisualization(state);

    // Render
    let scheme = features.colorScheme;
    background(scheme.bg[0], scheme.bg[1], scheme.bg[2]);

    // CRT scanlines
    if (features.glitch > 0.2) {
        stroke(0, 8);
        for (let sy = 0; sy < height; sy += 2) line(0, sy, width, sy);
        noStroke();
    }

    for (let y = 0; y < rows; y++) {
        let rowGlitch = Math.random() < features.glitch * 0.015 ? Math.floor(Math.random() * 3) - 1 : 0;

        for (let x = 0; x < cols; x++) {
            let cell = charBuffer[y][x];
            if (cell.char !== ' ') {
                let b = cell.brightness;
                let h = cell.hue;

                let r = lerp(scheme.fg[0], scheme.accent[0], Math.max(0, h)) * b;
                let g = lerp(scheme.fg[1], scheme.accent[1], 0.4 + Math.abs(h) * 0.2) * b;
                let bl = lerp(scheme.fg[2], scheme.accent[2], Math.max(0, -h)) * b;

                // Glow
                if (b > 0.55) {
                    fill(r * 0.2, g * 0.2, bl * 0.2, 70);
                    noStroke();
                    ellipse((x + rowGlitch) * charW + charW / 2, y * charH + charH / 2, charW * 1.8, charH * 1.8);
                }

                fill(r, g, bl);
                text(cell.char, (x + rowGlitch) * charW + 1, y * charH);
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
        saveCanvas(`benjolin-${hash.slice(2, 10)}`, 'png');
    }
}

window.benjolin = {
    features: () => features,
    regenerate: () => {
        hash = "0x" + Array(64).fill(0).map(() =>
            "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
        generateFeatures();
        benjolin = new Benjolin();
    },
    setColorScheme: (idx) => {
        features.colorScheme = COLOR_SCHEMES[idx % COLOR_SCHEMES.length];
    }
};
