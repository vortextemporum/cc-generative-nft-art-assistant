/**
 * MICRO-COSMOS II v2.0.0
 * Emergent Particle Life — simple attraction/repulsion rules create
 * self-organizing structures across 5 zoom scales.
 * Just luminous dots. Beauty emerges from collective behavior.
 */

// ============================================================================
// HASH & PRNG
// ============================================================================

let hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
if (typeof tokenData !== "undefined" && tokenData.hash) hash = tokenData.hash;

function sfc32(a, b, c, d) {
    return function() {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        let t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11); d = (d + 1) | 0; t = (t + d) | 0;
        c = (c + t) | 0; return (t >>> 0) / 4294967296;
    };
}

function initRandom(h) {
    const s = h.slice(2);
    const seeds = [];
    for (let i = 0; i < 4; i++) seeds.push(parseInt(s.slice(i * 8, (i + 1) * 8), 16) || 0);
    return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

let R;
function rnd(a = 0, b = 1) { return a + R() * (b - a); }
function rndInt(a, b) { return Math.floor(rnd(a, b + 1)); }
function rndChoice(arr) { return arr[Math.floor(R() * arr.length)]; }
function rndBool(p = 0.5) { return R() < p; }

// ============================================================================
// ZOOM HELPERS
// ============================================================================

function calculateZoomOpacity(zoom, minZ, maxZ) {
    if (zoom < minZ || zoom > maxZ) return 0;
    const range = maxZ - minZ;
    const fadeIn = range * 0.25;
    const fadeOut = range * 0.4;
    let op = 1;
    if (zoom < minZ + fadeIn) op = (zoom - minZ) / fadeIn;
    else if (zoom > maxZ - fadeOut) op = (maxZ - zoom) / fadeOut;
    return Math.max(0, Math.min(1, op));
}

function rollRarity() {
    const r = R();
    if (r < 0.03) return "legendary";
    if (r < 0.15) return "rare";
    if (r < 0.40) return "uncommon";
    return "common";
}

// ============================================================================
// COLOR PALETTES
// ============================================================================

const PALETTES = [
    // --- Cool / Ocean ---
    { name: "Bioluminescent", bg: [0.02, 0.02, 0.06],
      colors: [[0.2,0.9,0.6],[0.1,0.6,1.0],[0.9,0.3,0.8],[0.1,0.9,0.9],[0.6,0.2,1.0],[0.9,0.8,0.2],[0.3,1.0,0.4],[0.8,0.1,0.5]] },
    { name: "Deep Sea", bg: [0.01, 0.02, 0.05],
      colors: [[0.0,0.5,0.9],[0.0,0.8,0.7],[0.3,0.2,0.9],[0.0,0.9,0.4],[0.5,0.3,1.0],[0.1,0.7,0.8],[0.7,0.4,0.9],[0.0,0.6,0.6]] },
    { name: "Frost", bg: [0.03, 0.03, 0.06],
      colors: [[0.6,0.8,1.0],[0.3,0.5,0.9],[0.8,0.9,1.0],[0.2,0.7,0.8],[0.5,0.4,0.9],[0.7,0.6,1.0],[0.4,0.9,0.9],[0.9,0.8,1.0]] },
    { name: "Abyssal", bg: [0.01, 0.01, 0.03],
      colors: [[0.0,0.3,0.7],[0.1,0.5,0.6],[0.0,0.2,0.9],[0.2,0.6,0.8],[0.0,0.4,0.5],[0.3,0.7,0.9],[0.1,0.3,0.6],[0.0,0.8,0.5]] },
    { name: "Arctic", bg: [0.04, 0.04, 0.06],
      colors: [[0.7,0.9,1.0],[0.5,0.7,0.9],[0.9,0.95,1.0],[0.3,0.6,0.8],[0.6,0.8,0.95],[0.4,0.5,0.7],[0.8,0.85,0.9],[0.2,0.4,0.6]] },
    // --- Warm / Fire ---
    { name: "Ember", bg: [0.05, 0.02, 0.01],
      colors: [[1.0,0.3,0.1],[1.0,0.6,0.0],[0.9,0.1,0.3],[1.0,0.8,0.2],[0.8,0.2,0.6],[0.6,0.1,0.1],[1.0,0.5,0.3],[0.9,0.9,0.3]] },
    { name: "Magma", bg: [0.06, 0.01, 0.02],
      colors: [[1.0,0.1,0.0],[1.0,0.5,0.0],[0.8,0.0,0.1],[1.0,0.7,0.1],[0.6,0.0,0.0],[0.9,0.3,0.0],[1.0,0.9,0.2],[0.7,0.1,0.2]] },
    { name: "Sunset", bg: [0.04, 0.02, 0.03],
      colors: [[1.0,0.4,0.2],[0.9,0.2,0.4],[1.0,0.7,0.3],[0.7,0.1,0.5],[1.0,0.5,0.5],[0.8,0.3,0.2],[0.9,0.6,0.1],[1.0,0.8,0.6]] },
    { name: "Amber", bg: [0.04, 0.03, 0.01],
      colors: [[1.0,0.7,0.2],[0.9,0.5,0.1],[0.8,0.6,0.0],[1.0,0.85,0.4],[0.7,0.4,0.1],[0.95,0.8,0.3],[0.6,0.35,0.05],[0.85,0.65,0.15]] },
    // --- Neon / Electric ---
    { name: "Neon", bg: [0.02, 0.01, 0.04],
      colors: [[1.0,0.0,0.4],[0.0,1.0,0.5],[0.3,0.2,1.0],[1.0,0.9,0.0],[0.0,0.8,1.0],[1.0,0.4,0.0],[0.8,0.0,1.0],[0.0,1.0,0.8]] },
    { name: "Plasma", bg: [0.04, 0.01, 0.05],
      colors: [[0.9,0.2,0.9],[0.3,0.1,1.0],[1.0,0.5,0.8],[0.5,0.0,0.8],[0.8,0.3,1.0],[1.0,0.7,0.9],[0.4,0.2,0.7],[0.7,0.1,0.6]] },
    { name: "Cyberpunk", bg: [0.02, 0.01, 0.04],
      colors: [[1.0,0.0,0.6],[0.0,0.9,1.0],[0.9,0.9,0.0],[0.6,0.0,1.0],[0.0,1.0,0.3],[1.0,0.3,0.8],[0.2,0.5,1.0],[0.8,0.0,0.3]] },
    { name: "Synthwave", bg: [0.03, 0.01, 0.05],
      colors: [[1.0,0.2,0.8],[0.2,0.1,0.9],[0.0,0.7,0.9],[0.9,0.4,1.0],[0.5,0.0,0.7],[0.0,0.5,0.8],[1.0,0.6,0.9],[0.3,0.0,0.6]] },
    // --- Nature / Earth ---
    { name: "Algae", bg: [0.01, 0.04, 0.02],
      colors: [[0.2,0.8,0.3],[0.4,0.9,0.2],[0.1,0.6,0.5],[0.6,0.9,0.1],[0.0,0.7,0.4],[0.3,1.0,0.5],[0.5,0.8,0.4],[0.1,0.5,0.3]] },
    { name: "Mineral", bg: [0.03, 0.03, 0.03],
      colors: [[0.5,0.8,0.5],[0.7,0.5,0.3],[0.4,0.6,0.8],[0.8,0.7,0.5],[0.3,0.5,0.4],[0.6,0.4,0.6],[0.9,0.8,0.6],[0.5,0.7,0.7]] },
    { name: "Moss", bg: [0.02, 0.03, 0.01],
      colors: [[0.3,0.6,0.2],[0.5,0.7,0.3],[0.2,0.5,0.1],[0.6,0.8,0.4],[0.4,0.5,0.2],[0.1,0.4,0.3],[0.7,0.9,0.5],[0.3,0.4,0.1]] },
    { name: "Coral", bg: [0.03, 0.02, 0.03],
      colors: [[1.0,0.5,0.4],[0.9,0.3,0.5],[0.3,0.7,0.6],[1.0,0.7,0.5],[0.6,0.2,0.4],[0.2,0.8,0.7],[0.9,0.4,0.3],[0.5,0.9,0.8]] },
    { name: "Tide Pool", bg: [0.02, 0.03, 0.04],
      colors: [[0.1,0.7,0.6],[0.8,0.4,0.2],[0.2,0.5,0.8],[0.6,0.8,0.3],[0.9,0.5,0.4],[0.0,0.6,0.5],[0.7,0.7,0.2],[0.4,0.3,0.7]] },
    // --- Pastel / Soft ---
    { name: "Pastel", bg: [0.04, 0.04, 0.05],
      colors: [[0.8,0.6,0.7],[0.6,0.7,0.9],[0.9,0.8,0.6],[0.6,0.9,0.7],[0.8,0.6,0.9],[0.9,0.7,0.7],[0.7,0.8,0.6],[0.7,0.6,0.8]] },
    { name: "Dawn", bg: [0.04, 0.03, 0.04],
      colors: [[0.9,0.6,0.5],[0.7,0.5,0.7],[1.0,0.8,0.6],[0.5,0.6,0.8],[0.9,0.7,0.8],[0.6,0.4,0.6],[0.8,0.9,0.7],[1.0,0.7,0.5]] },
    // --- Monochrome / Minimal ---
    { name: "Bone", bg: [0.03, 0.03, 0.02],
      colors: [[0.9,0.85,0.7],[0.7,0.65,0.5],[0.8,0.75,0.6],[0.6,0.55,0.4],[0.95,0.9,0.8],[0.5,0.45,0.35],[0.85,0.8,0.65],[0.75,0.7,0.55]] },
    { name: "Silver", bg: [0.03, 0.03, 0.04],
      colors: [[0.7,0.7,0.8],[0.5,0.5,0.6],[0.8,0.8,0.9],[0.4,0.4,0.5],[0.6,0.65,0.75],[0.9,0.9,0.95],[0.55,0.55,0.65],[0.75,0.75,0.85]] },
    { name: "Void", bg: [0.01, 0.01, 0.02],
      colors: [[0.3,0.3,0.5],[0.2,0.2,0.4],[0.4,0.3,0.6],[0.15,0.2,0.35],[0.35,0.25,0.5],[0.25,0.3,0.45],[0.45,0.35,0.55],[0.2,0.15,0.3]] },
    // --- Exotic ---
    { name: "Toxic", bg: [0.02, 0.03, 0.01],
      colors: [[0.4,1.0,0.0],[0.0,0.8,0.2],[0.7,0.9,0.0],[0.2,0.6,0.0],[0.5,1.0,0.3],[0.1,0.9,0.1],[0.8,1.0,0.2],[0.3,0.7,0.1]] },
    { name: "Ultraviolet", bg: [0.03, 0.01, 0.06],
      colors: [[0.5,0.0,1.0],[0.7,0.2,0.9],[0.3,0.0,0.8],[0.9,0.3,1.0],[0.4,0.1,0.7],[0.6,0.0,0.9],[0.8,0.4,1.0],[0.2,0.0,0.6]] },
    { name: "Blood Moon", bg: [0.05, 0.01, 0.01],
      colors: [[0.8,0.0,0.1],[0.6,0.0,0.0],[0.9,0.2,0.1],[0.4,0.0,0.05],[0.7,0.1,0.15],[1.0,0.3,0.2],[0.5,0.05,0.0],[0.85,0.15,0.1]] },
    { name: "Spore", bg: [0.03, 0.02, 0.02],
      colors: [[0.7,0.5,0.2],[0.5,0.7,0.3],[0.8,0.4,0.5],[0.3,0.6,0.4],[0.9,0.6,0.3],[0.4,0.8,0.5],[0.6,0.3,0.4],[0.7,0.8,0.2]] },
];

// ============================================================================
// LAYER DEFINITIONS
// ============================================================================

// Density tuned so each particle has ~25-37 neighbors (sweet spot for emergent structure).
// Too few neighbors = no structure. Too many = forces cancel out = noise.
const LAYER_DEFS = [
    { name: "Macro",     count: 600,  types: 6, minZoom: 0.5,  maxZoom: 5,   pointMin: 3.5, pointMax: 9,  speed: 0.18, spawn: 160, rMin: 3,  rMax: 45 },
    { name: "Cellular",  count: 800,  types: 6, minZoom: 2,    maxZoom: 15,  pointMin: 1.5, pointMax: 4.5, speed: 0.28, spawn: 48,  rMin: 1.2, rMax: 10 },
    { name: "Organelle", count: 500,  types: 6, minZoom: 8,    maxZoom: 40,  pointMin: 1.2, pointMax: 3.0, speed: 0.35, spawn: 13,  rMin: 0.5, rMax: 4 },
    { name: "Molecular", count: 300,  types: 6, minZoom: 20,   maxZoom: 100, pointMin: 0.8, pointMax: 2.0, speed: 0.5,  spawn: 5,   rMin: 0.2, rMax: 1.8 },
    { name: "Atomic",    count: 200,  types: 6, minZoom: 40,   maxZoom: 200, pointMin: 0.5, pointMax: 1.5, speed: 0.7,  spawn: 1.6, rMin: 0.08, rMax: 0.7 },
];

// ============================================================================
// MATRIX ARCHETYPES — role-based interaction templates
// ============================================================================
// Each archetype defines a 6x6 attraction matrix and particle ratios.
// Roles: 0=membrane/wall, 1=interior/body, 2=core/nucleus, 3=organelle, 4=signal, 5=medium/free
// The matrix structure creates emergent biological shapes from pure particles.

const ARCHETYPES = [
    {
        name: "Cellular",
        matrix: [
            [ 0.30,  0.55,  0.20,  0.10, -0.30, -0.60],
            [ 0.35,  0.25,  0.45,  0.30,  0.10, -0.30],
            [ 0.15,  0.35,  0.75,  0.20,  0.00, -0.40],
            [ 0.05,  0.25,  0.25,  0.50, -0.10, -0.25],
            [-0.20,  0.05,  0.00, -0.10, -0.55,  0.00],
            [-0.50, -0.20, -0.35, -0.15,  0.00,  0.12],
        ],
        ratios: [0.25, 0.25, 0.10, 0.12, 0.08, 0.20],
    },
    {
        name: "Bacterial",
        matrix: [
            [ 0.25,  0.60,  0.25, -0.10,  0.05, -0.50],
            [ 0.40,  0.30,  0.50,  0.10,  0.15, -0.25],
            [ 0.15,  0.40,  0.65,  0.30,  0.00, -0.35],
            [-0.05,  0.05,  0.25,  0.20,  0.00,  0.00],
            [ 0.00,  0.10,  0.00,  0.00,  0.35, -0.10],
            [-0.40, -0.15, -0.25,  0.00, -0.05,  0.10],
        ],
        ratios: [0.22, 0.28, 0.12, 0.08, 0.15, 0.15],
    },
    {
        name: "Colonial",
        matrix: [
            [ 0.35,  0.50,  0.15,  0.20, -0.10, -0.45],
            [ 0.30,  0.70,  0.10,  0.05,  0.00, -0.50],
            [ 0.20,  0.15,  0.20,  0.10,  0.05, -0.20],
            [ 0.15,  0.00,  0.10,  0.40,  0.00, -0.30],
            [-0.05,  0.00,  0.05,  0.00,  0.15,  0.00],
            [-0.35, -0.40, -0.15, -0.20,  0.00,  0.08],
        ],
        ratios: [0.22, 0.18, 0.12, 0.15, 0.13, 0.20],
    },
    {
        name: "Vesicular",
        matrix: [
            [ 0.28,  0.50,  0.20,  0.15, -0.05, -0.40],
            [ 0.30,  0.35,  0.10,  0.40,  0.05, -0.25],
            [ 0.25,  0.05,  0.30,  0.00,  0.10, -0.35],
            [ 0.10,  0.30,  0.00,  0.45,  0.00, -0.20],
            [ 0.00,  0.00,  0.10,  0.00,  0.20,  0.00],
            [-0.30, -0.15, -0.25, -0.10,  0.00,  0.10],
        ],
        ratios: [0.25, 0.20, 0.12, 0.13, 0.10, 0.20],
    },
    {
        // Spiral: asymmetric attractions create rotational dynamics
        name: "Spiral",
        matrix: [
            [ 0.10,  0.45, -0.05, -0.20,  0.30, -0.35],
            [-0.15,  0.15,  0.50,  0.10, -0.10, -0.20],
            [ 0.30, -0.10,  0.60,  0.20,  0.05, -0.30],
            [-0.20,  0.30,  0.10,  0.30,  0.15,  0.00],
            [ 0.20, -0.15,  0.00,  0.10, -0.40,  0.00],
            [-0.30, -0.10, -0.20,  0.00,  0.00,  0.10],
        ],
        ratios: [0.20, 0.20, 0.15, 0.15, 0.12, 0.18],
    },
    {
        // Lattice: alternating attraction/repulsion creates crystalline grids
        name: "Lattice",
        matrix: [
            [ 0.55, -0.35,  0.55, -0.35,  0.05, -0.50],
            [-0.35,  0.55, -0.35,  0.55,  0.05, -0.50],
            [ 0.55, -0.35,  0.55, -0.35,  0.05, -0.50],
            [-0.35,  0.55, -0.35,  0.55,  0.05, -0.50],
            [ 0.00,  0.00,  0.00,  0.00,  0.25, -0.10],
            [-0.40, -0.40, -0.40, -0.40, -0.10,  0.10],
        ],
        ratios: [0.20, 0.20, 0.20, 0.20, 0.08, 0.12],
    },
    {
        // Filament: strong mutual chain links form long strands
        name: "Filament",
        matrix: [
            [ 0.15,  0.70,  0.10,  0.05, -0.20, -0.40],
            [ 0.70,  0.15,  0.10,  0.05, -0.20, -0.40],
            [ 0.10,  0.10,  0.50,  0.30,  0.00, -0.25],
            [ 0.05,  0.05,  0.30,  0.40,  0.10, -0.20],
            [-0.15, -0.15,  0.00,  0.10,  0.20,  0.00],
            [-0.30, -0.30, -0.20, -0.15,  0.00,  0.10],
        ],
        ratios: [0.22, 0.22, 0.12, 0.14, 0.10, 0.20],
    },
    {
        // Swarm: leader/follower dynamics create flocking behavior
        name: "Swarm",
        matrix: [
            [ 0.20,  0.10,  0.05, -0.30, -0.10, -0.20],
            [ 0.45,  0.25,  0.15, -0.20,  0.05, -0.15],
            [ 0.35,  0.30,  0.20, -0.15,  0.10, -0.10],
            [-0.40, -0.25, -0.20,  0.40,  0.00,  0.05],
            [-0.10,  0.00,  0.10,  0.00,  0.15,  0.05],
            [-0.15, -0.10, -0.05,  0.05,  0.05,  0.08],
        ],
        ratios: [0.12, 0.25, 0.25, 0.10, 0.10, 0.18],
    },
    {
        // Symbiotic: two organisms nested together
        name: "Symbiotic",
        matrix: [
            [ 0.50,  0.10,  0.35, -0.20,  0.00, -0.40],
            [ 0.00, -0.30,  0.05,  0.60,  0.15, -0.20],
            [ 0.25,  0.20,  0.30,  0.10,  0.05, -0.30],
            [-0.15,  0.50,  0.15,  0.35,  0.00, -0.25],
            [ 0.00,  0.10,  0.05,  0.00,  0.20, -0.10],
            [-0.35, -0.15, -0.25, -0.20, -0.05,  0.10],
        ],
        ratios: [0.20, 0.15, 0.15, 0.18, 0.12, 0.20],
    },
    {
        // Nebula: loose, wispy clouds with dense condensation cores
        name: "Nebula",
        matrix: [
            [ 0.10,  0.25,  0.05,  0.15, -0.05, -0.12],
            [ 0.20,  0.08,  0.30,  0.10,  0.05, -0.10],
            [ 0.05,  0.25,  0.55,  0.10, -0.10, -0.25],
            [ 0.15,  0.10,  0.10,  0.05,  0.00,  0.00],
            [-0.05,  0.05, -0.10,  0.00, -0.20,  0.05],
            [-0.08, -0.05, -0.15,  0.00,  0.05,  0.05],
        ],
        ratios: [0.22, 0.18, 0.10, 0.20, 0.10, 0.20],
    },
    {
        // Predator: chase dynamics between two groups
        name: "Predator",
        matrix: [
            [ 0.30,  0.50,  0.10, -0.60,  0.00, -0.30],
            [ 0.40,  0.25,  0.15, -0.50,  0.05, -0.25],
            [ 0.10,  0.10,  0.45,  0.20,  0.00, -0.20],
            [ 0.50, -0.10,  0.00,  0.20,  0.00, -0.15],
            [ 0.00,  0.05,  0.00,  0.00,  0.15,  0.00],
            [-0.25, -0.15, -0.15, -0.10,  0.00,  0.08],
        ],
        ratios: [0.22, 0.18, 0.10, 0.12, 0.13, 0.25],
    },
    {
        // Mitotic: cell-like but with dividing/splitting tendency
        name: "Mitotic",
        matrix: [
            [ 0.20,  0.40,  0.15,  0.10, -0.40, -0.50],
            [ 0.30,  0.20,  0.35,  0.25,  0.10, -0.30],
            [ 0.10,  0.25,  0.60, -0.50,  0.00, -0.35],
            [ 0.10,  0.20, -0.40,  0.55,  0.05, -0.30],
            [-0.30,  0.05,  0.00,  0.05, -0.50,  0.00],
            [-0.40, -0.20, -0.30, -0.25,  0.00,  0.12],
        ],
        ratios: [0.25, 0.22, 0.12, 0.12, 0.09, 0.20],
    },
];

// ============================================================================
// FEATURE GENERATION
// ============================================================================

let features = {};

function generateFeatures() {
    R = initRandom(hash);

    // Palette
    const paletteIdx = Math.floor(R() * PALETTES.length);
    const palette = PALETTES[paletteIdx];
    features.palette = palette.name;
    features.paletteRarity = rollRarity();

    // Structure — which archetype dominates (macro layer picks, shown as feature)
    const structIdx = Math.floor(R() * ARCHETYPES.length);
    features.structure = ARCHETYPES[structIdx].name;
    features.structureRarity = rollRarity();

    // Friction: lower = more fluid, higher = more stable
    const frictionVal = rnd(0.02, 0.08);
    features.friction = frictionVal;
    features.frictionLabel = frictionVal < 0.035 ? "Fluid" : frictionVal < 0.055 ? "Balanced" : "Viscous";
    features.frictionRarity = rollRarity();

    // Force strength — higher = structures form faster and more distinctly
    const forceVal = rnd(0.6, 1.8);
    features.forceStrength = forceVal;
    features.forceLabel = forceVal < 0.9 ? "Gentle" : forceVal < 1.3 ? "Moderate" : "Intense";
    features.forceRarity = rollRarity();

    // Variation — how much hash noise is added to archetype matrices
    const variationVal = rnd(0.05, 0.25);
    features.variation = variationVal;
    features.variationLabel = variationVal < 0.10 ? "Faithful" : variationVal < 0.18 ? "Varied" : "Mutant";
    features.variationRarity = rollRarity();

    // Density — multiplier on particle counts per layer
    const densityVal = rnd(0.5, 1.8);
    features.density = densityVal;
    features.densityLabel = densityVal < 0.75 ? "Sparse" : densityVal < 1.1 ? "Normal" : densityVal < 1.4 ? "Dense" : "Packed";
    features.densityRarity = rollRarity();

    // Activity — speed multiplier (how energetic the particles are)
    const activityVal = rnd(0.4, 2.0);
    features.activity = activityVal;
    features.activityLabel = activityVal < 0.7 ? "Dormant" : activityVal < 1.2 ? "Active" : "Hyperactive";
    features.activityRarity = rollRarity();

    // Symmetry — how symmetric the attraction matrix is (0 = fully asymmetric, 1 = fully symmetric)
    const symmetryVal = rnd(0.0, 1.0);
    features.symmetry = symmetryVal;
    features.symmetryLabel = symmetryVal < 0.3 ? "Asymmetric" : symmetryVal < 0.7 ? "Mixed" : "Symmetric";
    features.symmetryRarity = rollRarity();

    // Interaction — how much types interact with each other vs self-organize
    const interactionVal = rnd(0.3, 1.5);
    features.interaction = interactionVal;
    features.interactionLabel = interactionVal < 0.6 ? "Isolated" : interactionVal < 1.0 ? "Cooperative" : "Entangled";
    features.interactionRarity = rollRarity();

    // Background
    features.bgColor = palette.bg;

    // Per-layer attraction matrices and color assignments
    features.layers = [];
    for (let l = 0; l < LAYER_DEFS.length; l++) {
        const def = LAYER_DEFS[l];
        const n = def.types; // always 6

        // Each layer picks an archetype (macro layer uses the feature archetype)
        const archIdx = (l === 0) ? structIdx : Math.floor(R() * ARCHETYPES.length);
        const arch = ARCHETYPES[archIdx];

        // Build matrix from archetype + hash variation + symmetry + interaction
        const matrix = [];
        for (let i = 0; i < n; i++) {
            matrix[i] = [];
            for (let j = 0; j < n; j++) {
                const base = arch.matrix[i][j];
                const noise = rnd(-variationVal, variationVal);
                matrix[i][j] = Math.max(-1, Math.min(1, base + noise));
            }
        }

        // Apply symmetry: blend matrix[i][j] with matrix[j][i]
        if (symmetryVal > 0.1) {
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    const avg = (matrix[i][j] + matrix[j][i]) * 0.5;
                    matrix[i][j] = matrix[i][j] * (1 - symmetryVal) + avg * symmetryVal;
                    matrix[j][i] = matrix[j][i] * (1 - symmetryVal) + avg * symmetryVal;
                }
            }
        }

        // Apply interaction: scale off-diagonal relative to diagonal
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    matrix[i][j] *= interactionVal;
                    matrix[i][j] = Math.max(-1, Math.min(1, matrix[i][j]));
                }
            }
        }

        // Ratios from archetype + slight variation
        const ratios = [];
        let sum = 0;
        for (let i = 0; i < n; i++) {
            const r = Math.max(0.02, arch.ratios[i] + rnd(-0.05, 0.05));
            ratios.push(r);
            sum += r;
        }
        for (let i = 0; i < n; i++) ratios[i] /= sum;

        // Assign colors from palette (shuffle subset)
        const colorIndices = [];
        for (let i = 0; i < palette.colors.length; i++) colorIndices.push(i);
        for (let i = colorIndices.length - 1; i > 0; i--) {
            const j = Math.floor(R() * (i + 1));
            [colorIndices[i], colorIndices[j]] = [colorIndices[j], colorIndices[i]];
        }
        const layerColors = [];
        for (let i = 0; i < n; i++) {
            layerColors.push(palette.colors[colorIndices[i % palette.colors.length]]);
        }

        features.layers.push({ matrix, colors: layerColors, ratios, archetype: ARCHETYPES[archIdx].name });
    }

    return features;
}

// ============================================================================
// SPATIAL HASH GRID
// ============================================================================

class SpatialHashGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.invCell = 1 / cellSize;
        this.cells = new Map();
    }

    clear() {
        this.cells.clear();
    }

    _key(cx, cy) {
        return (cx * 73856093) ^ (cy * 19349663);
    }

    insert(idx, x, y) {
        const cx = Math.floor(x * this.invCell);
        const cy = Math.floor(y * this.invCell);
        const key = this._key(cx, cy);
        let cell = this.cells.get(key);
        if (!cell) {
            cell = [];
            this.cells.set(key, cell);
        }
        cell.push(idx);
    }

    query(x, y, radius) {
        const result = [];
        const minCx = Math.floor((x - radius) * this.invCell);
        const maxCx = Math.floor((x + radius) * this.invCell);
        const minCy = Math.floor((y - radius) * this.invCell);
        const maxCy = Math.floor((y + radius) * this.invCell);
        for (let cx = minCx; cx <= maxCx; cx++) {
            for (let cy = minCy; cy <= maxCy; cy++) {
                const cell = this.cells.get(this._key(cx, cy));
                if (cell) {
                    for (let i = 0; i < cell.length; i++) result.push(cell[i]);
                }
            }
        }
        return result;
    }
}

// ============================================================================
// PARTICLE LAYER
// ============================================================================

class ParticleLayer {
    constructor(def, layerFeatures, globalFeatures, scene, lineScene) {
        this.def = def;
        this.features = layerFeatures;
        this.globalFeatures = globalFeatures;
        this.lineScene = lineScene || scene;
        // Apply density feature to particle count
        this.count = Math.round(def.count * (globalFeatures.density || 1));
        this.types = def.types;

        // Flat arrays for performance
        this.x = new Float32Array(this.count);
        this.y = new Float32Array(this.count);
        this.vx = new Float32Array(this.count);
        this.vy = new Float32Array(this.count);
        this.type = new Uint8Array(this.count);

        // Initialize particles
        this._initParticles();

        // Spatial hash
        this.grid = new SpatialHashGrid(def.rMax);

        // THREE.js points
        this._initGeometry(scene);
    }

    _initParticles() {
        const { spawn, types } = this.def;
        const { ratios } = this.features;

        // Build cumulative distribution for type assignment
        const cumRatios = [];
        let cum = 0;
        for (let i = 0; i < types; i++) {
            cum += ratios[i];
            cumRatios.push(cum);
        }

        for (let i = 0; i < this.count; i++) {
            // Position: uniform in spawn area
            this.x[i] = (Math.random() * 2 - 1) * spawn;
            this.y[i] = (Math.random() * 2 - 1) * spawn;
            this.vx[i] = 0;
            this.vy[i] = 0;

            // Assign type based on ratios
            const r = Math.random();
            let t = 0;
            for (let j = 0; j < cumRatios.length; j++) {
                if (r < cumRatios[j]) { t = j; break; }
                t = j;
            }
            this.type[i] = t;
        }
    }

    _initGeometry(scene) {
        const positions = new Float32Array(this.count * 3);
        const colors = new Float32Array(this.count * 3);
        const sizes = new Float32Array(this.count);

        const { colors: layerColors } = this.features;
        const avgPtSize = (this.def.pointMin + this.def.pointMax) * 0.5;

        for (let i = 0; i < this.count; i++) {
            positions[i * 3] = this.x[i];
            positions[i * 3 + 1] = this.y[i];
            positions[i * 3 + 2] = 0;

            const c = layerColors[this.type[i]];
            colors[i * 3] = c[0];
            colors[i * 3 + 1] = c[1];
            colors[i * 3 + 2] = c[2];

            sizes[i] = avgPtSize;
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uOpacity: { value: 1.0 },
                uScale: { value: 1.0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uSizeMult: { value: 1.0 },
                uTime: { value: 0.0 },
                // Shape
                uHalo: { value: 0.0 },
                uSoft: { value: 0.0 },
                uStars: { value: 0.0 },
                uRings: { value: 0.0 },
                // Color
                uMono: { value: 0.0 },
                uRainbow: { value: 0.0 },
                uInvert: { value: 0.0 },
                uXRay: { value: 0.0 },
                uHueShift: { value: 0.0 },
                // Animation
                uPulse: { value: 0.0 },
                uFlicker: { value: 0.0 },
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                varying vec2 vWorldPos;
                uniform float uScale;
                uniform float uPixelRatio;
                uniform float uSizeMult;
                uniform float uTime;
                uniform float uHalo;
                uniform float uPulse;
                void main() {
                    vColor = color;
                    vWorldPos = position.xy;
                    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                    float s = size * uSizeMult * (1.0 + uHalo * 1.5) * uScale * uPixelRatio * (300.0 / -mvPos.z);
                    if (uPulse > 0.5) {
                        s *= 1.0 + 0.35 * sin(uTime * 4.0 + position.x * 2.0 + position.y * 2.0);
                    }
                    gl_PointSize = s;
                    gl_Position = projectionMatrix * mvPos;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying vec2 vWorldPos;
                uniform float uOpacity;
                uniform float uTime;
                uniform float uHalo;
                uniform float uSoft;
                uniform float uStars;
                uniform float uRings;
                uniform float uMono;
                uniform float uRainbow;
                uniform float uInvert;
                uniform float uXRay;
                uniform float uHueShift;
                uniform float uFlicker;

                vec3 hueShift(vec3 c, float shift) {
                    float a = shift * 6.2832;
                    vec3 k = vec3(0.57735);
                    float co = cos(a);
                    float si = sin(a);
                    return c * co + cross(k, c) * si + k * dot(k, c) * (1.0 - co);
                }

                vec3 hsv2rgb(float h) {
                    return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
                }

                void main() {
                    vec2 uv = gl_PointCoord - 0.5;
                    float d = length(uv) * 2.0;

                    // --- Shape ---
                    if (uStars > 0.5) {
                        float angle = atan(uv.y, uv.x);
                        float star = 0.5 + 0.5 * cos(angle * 5.0);
                        float thresh = mix(0.35, 1.0, star);
                        if (d > thresh) discard;
                    } else if (uRings < 0.5 && d > 1.0) {
                        discard;
                    }

                    // --- Alpha ---
                    float alpha;
                    if (uRings > 0.5) {
                        float ring = 1.0 - smoothstep(0.0, 0.18, abs(d - 0.78));
                        if (ring < 0.01) discard;
                        alpha = ring * uOpacity;
                    } else if (uSoft > 0.5) {
                        alpha = exp(-d * d * 2.0) * uOpacity;
                    } else if (uHalo > 0.5) {
                        alpha = smoothstep(1.0, 0.0, d) * uOpacity * 0.55;
                    } else if (uStars > 0.5) {
                        alpha = smoothstep(1.0, 0.2, d) * uOpacity;
                    } else {
                        alpha = smoothstep(1.0, 0.3, d) * uOpacity;
                    }

                    // --- Color ---
                    vec3 col = vColor;

                    if (uRainbow > 0.5) {
                        float h = fract(vWorldPos.x * 0.008 + vWorldPos.y * 0.008 + uTime * 0.15);
                        col = hsv2rgb(h) * (0.4 + 0.6 * length(col));
                    }

                    if (uHueShift > 0.001) {
                        col = hueShift(col, uHueShift);
                    }

                    col = mix(col, vec3(1.0), uMono);

                    if (uFlicker > 0.5) {
                        float flick = fract(sin(dot(vWorldPos, vec2(12.9898, 78.233)) + uTime * 8.0) * 43758.5453);
                        alpha *= 0.15 + 0.85 * flick;
                    }

                    if (uXRay > 0.5) {
                        alpha *= 0.18;
                    }

                    if (uInvert > 0.5) {
                        col = vec3(1.0) - col;
                    }

                    gl_FragColor = vec4(col, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.points = new THREE.Points(geom, mat);
        scene.add(this.points);
        this.geometry = geom;
        this.material = mat;

        // Line overlays in separate scene (unaffected by shader color effects)
        this._initConnections(this.lineScene);
        this._initRepulsionLines(this.lineScene);
        this._initVelocityLines(this.lineScene);
    }

    _initConnections(scene) {
        const maxConn = 8000; // max connection line segments
        this.maxConn = maxConn;
        const connPos = new Float32Array(maxConn * 2 * 3); // 2 verts per line
        const connCol = new Float32Array(maxConn * 2 * 3);
        const connGeom = new THREE.BufferGeometry();
        connGeom.setAttribute("position", new THREE.BufferAttribute(connPos, 3));
        connGeom.setAttribute("color", new THREE.BufferAttribute(connCol, 3));
        connGeom.setDrawRange(0, 0); // start hidden

        const connMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.25,
        });

        this.connLines = new THREE.LineSegments(connGeom, connMat);
        this.connLines.visible = false;
        scene.add(this.connLines);
        this.connGeometry = connGeom;
        this.connMaterial = connMat;
    }

    updateConnections(zoom, enabled) {
        if (!enabled) {
            this.connLines.visible = false;
            return;
        }

        const opacity = calculateZoomOpacity(zoom, this.def.minZoom, this.def.maxZoom);
        if (opacity < 0.05) {
            this.connLines.visible = false;
            return;
        }

        this.connLines.visible = true;
        this.connMaterial.opacity = opacity * 0.6;

        const { matrix } = this.features;
        const { rMax } = this.def;
        const connThresh = rMax * 0.8 * visuals.connRadius;
        const positions = this.connGeometry.attributes.position.array;
        const colors = this.connGeometry.attributes.color.array;
        const { colors: layerColors } = this.features;

        let count = 0;
        const maxConn = this.maxConn;

        // Use spatial hash to find nearby pairs efficiently
        for (let i = 0; i < this.count; i++) {
            const xi = this.x[i], yi = this.y[i];
            const ti = this.type[i];
            const neighbors = this.grid.query(xi, yi, connThresh);

            for (let ni = 0; ni < neighbors.length; ni++) {
                const j = neighbors[ni];
                if (j <= i) continue; // avoid duplicates

                const dx = this.x[j] - xi;
                const dy = this.y[j] - yi;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d > connThresh || d < 0.01) continue;

                // Only connect attracted pairs
                const tj = this.type[j];
                const attraction = matrix[ti][tj];
                if (attraction < 0.05) continue;

                if (count >= maxConn) break;
                const base = count * 6;
                positions[base]     = xi;
                positions[base + 1] = yi;
                positions[base + 2] = 0;
                positions[base + 3] = this.x[j];
                positions[base + 4] = this.y[j];
                positions[base + 5] = 0;

                // Color = blend of the two particles' colors, dimmed by distance
                const ci = layerColors[ti], cj = layerColors[tj];
                const fade = 1 - d / connThresh;
                colors[base]     = (ci[0] + cj[0]) * 0.5 * fade;
                colors[base + 1] = (ci[1] + cj[1]) * 0.5 * fade;
                colors[base + 2] = (ci[2] + cj[2]) * 0.5 * fade;
                colors[base + 3] = colors[base];
                colors[base + 4] = colors[base + 1];
                colors[base + 5] = colors[base + 2];

                count++;
            }
            if (count >= maxConn) break;
        }

        this.connGeometry.setDrawRange(0, count * 2);
        this.connGeometry.attributes.position.needsUpdate = true;
        this.connGeometry.attributes.color.needsUpdate = true;
    }

    // --- Repulsion web lines ---
    _initRepulsionLines(scene) {
        const maxConn = 5000;
        this.maxRep = maxConn;
        const pos = new Float32Array(maxConn * 2 * 3);
        const col = new Float32Array(maxConn * 2 * 3);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geom.setAttribute("color", new THREE.BufferAttribute(col, 3));
        geom.setDrawRange(0, 0);
        const mat = new THREE.LineBasicMaterial({
            vertexColors: true, transparent: true,
            blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.3,
        });
        this.repLines = new THREE.LineSegments(geom, mat);
        this.repLines.visible = false;
        scene.add(this.repLines);
        this.repGeometry = geom;
        this.repMaterial = mat;
    }

    updateRepulsionLines(zoom, enabled) {
        if (!enabled) { this.repLines.visible = false; return; }
        const opacity = calculateZoomOpacity(zoom, this.def.minZoom, this.def.maxZoom);
        if (opacity < 0.05) { this.repLines.visible = false; return; }
        this.repLines.visible = true;
        this.repMaterial.opacity = opacity * 0.35;

        const { matrix } = this.features;
        const { rMax } = this.def;
        const repThresh = rMax * 0.8 * visuals.connRadius;
        const positions = this.repGeometry.attributes.position.array;
        const colors = this.repGeometry.attributes.color.array;
        let count = 0;

        for (let i = 0; i < this.count; i++) {
            const xi = this.x[i], yi = this.y[i], ti = this.type[i];
            const neighbors = this.grid.query(xi, yi, repThresh);
            for (let ni = 0; ni < neighbors.length; ni++) {
                const j = neighbors[ni];
                if (j <= i) continue;
                const dx = this.x[j] - xi, dy = this.y[j] - yi;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d > repThresh || d < 0.01) continue;
                const tj = this.type[j];
                if (matrix[ti][tj] > -0.1) continue; // only repelling pairs
                if (count >= this.maxRep) break;
                const base = count * 6;
                const fade = 1 - d / repThresh;
                const intensity = Math.min(1, -matrix[ti][tj]);
                positions[base] = xi; positions[base+1] = yi; positions[base+2] = 0;
                positions[base+3] = this.x[j]; positions[base+4] = this.y[j]; positions[base+5] = 0;
                colors[base]   = 0.8 * intensity * fade; colors[base+1] = 0.15 * fade; colors[base+2] = 0.1 * fade;
                colors[base+3] = colors[base]; colors[base+4] = colors[base+1]; colors[base+5] = colors[base+2];
                count++;
            }
            if (count >= this.maxRep) break;
        }
        this.repGeometry.setDrawRange(0, count * 2);
        this.repGeometry.attributes.position.needsUpdate = true;
        this.repGeometry.attributes.color.needsUpdate = true;
    }

    // --- Velocity lines ---
    _initVelocityLines(scene) {
        const pos = new Float32Array(this.count * 2 * 3);
        const col = new Float32Array(this.count * 2 * 3);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geom.setAttribute("color", new THREE.BufferAttribute(col, 3));
        const mat = new THREE.LineBasicMaterial({
            vertexColors: true, transparent: true,
            blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5,
        });
        this.velLines = new THREE.LineSegments(geom, mat);
        this.velLines.visible = false;
        scene.add(this.velLines);
        this.velGeometry = geom;
        this.velMaterial = mat;
    }

    updateVelocityLines(zoom, enabled) {
        if (!enabled) { this.velLines.visible = false; return; }
        const opacity = calculateZoomOpacity(zoom, this.def.minZoom, this.def.maxZoom);
        if (opacity < 0.05) { this.velLines.visible = false; return; }
        this.velLines.visible = true;
        this.velMaterial.opacity = opacity * 0.5;

        const positions = this.velGeometry.attributes.position.array;
        const colors = this.velGeometry.attributes.color.array;
        const { colors: layerColors } = this.features;
        const velScale = this.def.rMax * 0.4;

        for (let i = 0; i < this.count; i++) {
            const base = i * 6;
            const xi = this.x[i], yi = this.y[i];
            positions[base] = xi; positions[base+1] = yi; positions[base+2] = 0;
            positions[base+3] = xi + this.vx[i] * velScale;
            positions[base+4] = yi + this.vy[i] * velScale;
            positions[base+5] = 0;
            // Color: particle color at origin, brighter at tip for speed
            const speed = Math.sqrt(this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i]);
            const t = Math.min(speed * 25, 1.0);
            const c = layerColors[this.type[i]];
            colors[base] = c[0]; colors[base+1] = c[1]; colors[base+2] = c[2];
            colors[base+3] = c[0] * (1-t) + t; colors[base+4] = c[1] * (1-t) + t * 0.4; colors[base+5] = c[2] * (1-t);
        }
        this.velGeometry.attributes.position.needsUpdate = true;
        this.velGeometry.attributes.color.needsUpdate = true;
    }

    update(dt, friction, forceStrength) {
        const { matrix } = this.features;
        const { rMin, rMax, speed } = this.def;
        const halfRMinRMax = (rMin + rMax) * 0.5;
        const rangeHalf = (rMax - rMin) * 0.5;

        // Rebuild spatial hash
        this.grid.clear();
        for (let i = 0; i < this.count; i++) {
            this.grid.insert(i, this.x[i], this.y[i]);
        }

        // Compute forces
        for (let i = 0; i < this.count; i++) {
            let fx = 0, fy = 0;
            const xi = this.x[i], yi = this.y[i];
            const ti = this.type[i];

            const neighbors = this.grid.query(xi, yi, rMax);

            for (let ni = 0; ni < neighbors.length; ni++) {
                const j = neighbors[ni];
                if (j === i) continue;

                const dx = this.x[j] - xi;
                const dy = this.y[j] - yi;
                const d = Math.sqrt(dx * dx + dy * dy);

                if (d < 0.01 || d > rMax) continue;

                const nx = dx / d;
                const ny = dy / d;
                let force = 0;

                if (d < rMin) {
                    // Hard-core repulsion
                    force = (rMin / d - 1);
                } else {
                    // Bell-shaped attraction/repulsion
                    const tj = this.type[j];
                    const attraction = matrix[ti][tj];
                    force = attraction * (1 - Math.abs(2 * d - rMin - rMax) / (rMax - rMin));
                }

                fx += nx * force;
                fy += ny * force;
            }

            // Apply force with global strength and layer speed
            const acc = forceStrength * speed * (this.globalFeatures.activity || 1);
            this.vx[i] += fx * acc * dt;
            this.vy[i] += fy * acc * dt;
        }

        // Integrate and apply friction
        const fric = 1 - friction;
        for (let i = 0; i < this.count; i++) {
            this.vx[i] *= fric;
            this.vy[i] *= fric;
            this.x[i] += this.vx[i] * dt;
            this.y[i] += this.vy[i] * dt;

            // Wrap around spawn boundaries (toroidal)
            const s = this.def.spawn;
            if (this.x[i] > s) this.x[i] -= 2 * s;
            else if (this.x[i] < -s) this.x[i] += 2 * s;
            if (this.y[i] > s) this.y[i] -= 2 * s;
            else if (this.y[i] < -s) this.y[i] += 2 * s;
        }
    }

    updateVisuals(zoom) {
        const opacity = calculateZoomOpacity(zoom, this.def.minZoom, this.def.maxZoom);
        const u = this.material.uniforms;
        u.uOpacity.value = opacity;
        u.uSizeMult.value = visuals.sizeMult;
        u.uTime.value = animTime;
        // Shape
        u.uHalo.value = visuals.halos ? 1.0 : 0.0;
        u.uSoft.value = visuals.soft ? 1.0 : 0.0;
        u.uStars.value = visuals.stars ? 1.0 : 0.0;
        u.uRings.value = visuals.rings ? 1.0 : 0.0;
        // Color
        u.uMono.value = visuals.mono ? 1.0 : 0.0;
        u.uRainbow.value = visuals.rainbow ? 1.0 : 0.0;
        u.uInvert.value = visuals.invert ? 1.0 : 0.0;
        u.uXRay.value = visuals.xray ? 1.0 : 0.0;
        u.uHueShift.value = visuals.hueShift;
        // Animation
        u.uPulse.value = visuals.pulse ? 1.0 : 0.0;
        u.uFlicker.value = visuals.flicker ? 1.0 : 0.0;
        // Blending mode: normal when inverted, additive otherwise
        this.material.blending = visuals.invert ? THREE.NormalBlending : THREE.AdditiveBlending;
        this.points.visible = opacity > 0.01;

        if (!this.points.visible) return;

        // Update point size based on zoom
        const ptSize = this.def.pointMin + (this.def.pointMax - this.def.pointMin) * Math.max(0, 1 - zoom / this.def.maxZoom);
        const positions = this.geometry.attributes.position.array;
        const sizeAttr = this.geometry.attributes.size;

        for (let i = 0; i < this.count; i++) {
            positions[i * 3] = this.x[i];
            positions[i * 3 + 1] = this.y[i];
            sizeAttr.array[i] = ptSize;
        }

        this.geometry.attributes.position.needsUpdate = true;
        sizeAttr.needsUpdate = true;

        // Line overlays
        this.updateConnections(zoom, visuals.connections);
        this.updateRepulsionLines(zoom, visuals.repulsion);
        this.updateVelocityLines(zoom, visuals.velocity);
    }

    dispose(scene) {
        scene.remove(this.points);
        this.geometry.dispose();
        this.material.dispose();
        const linesets = [
            [this.connLines, this.connGeometry, this.connMaterial],
            [this.repLines, this.repGeometry, this.repMaterial],
            [this.velLines, this.velGeometry, this.velMaterial],
        ];
        for (const [lines, geom, mat] of linesets) {
            if (lines) { this.lineScene.remove(lines); geom.dispose(); mat.dispose(); }
        }
    }
}

// ============================================================================
// MAIN SIMULATION
// ============================================================================

let renderer, scene, camera;
let lineScene; // separate scene for line overlays
let layers = [];
let fadeScene, fadeCamera, fadeMat; // trails system
let trailRT, blitScene, blitCamera, blitMat; // float render target for stain-free trails

// Visual overlay state — purely cosmetic, doesn't affect simulation
let visuals = {
    // Network
    connections: false,
    repulsion: false,
    velocity: false,
    trails: false,
    // Shape
    halos: false,
    soft: false,
    stars: false,
    rings: false,
    // Color
    mono: false,
    rainbow: false,
    invert: false,
    xray: false,
    // Animation
    pulse: false,
    flicker: false,
    // Sliders
    sizeMult: 1.0,
    connRadius: 1.0,
    trailFade: 1.0,   // 0.2 (long trails) to 3.0 (short trails)
    hueShift: 0.0,    // 0.0 to 1.0 (full hue rotation)
};
let animTime = 0;

function warmupSimulation() {
    const friction = features.friction;
    const forceStrength = features.forceStrength;
    // Run 200 simulation steps so all layers self-organize before first render
    for (let step = 0; step < 200; step++) {
        for (let i = 0; i < layers.length; i++) {
            layers[i].update(1.0, friction, forceStrength);
        }
    }
    // Sync visuals after warmup
    for (let i = 0; i < layers.length; i++) {
        layers[i].updateVisuals(1);
    }
}

let simSpeed = 1.0; // animation speed multiplier (0.1 - 3.0)
let currentZoom = 1;
let targetZoom = 1;
let paused = false;
let panX = 0, panY = 0;
let targetPanX = 0, targetPanY = 0;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let panStartX = 0, panStartY = 0;
let lastTime = 0;

function init() {
    generateFeatures();

    // Renderer
    const container = document.getElementById("canvas-container");
    const size = 800;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const bg = features.bgColor;
    renderer.setClearColor(new THREE.Color(bg[0], bg[1], bg[2]), 1);
    container.insertBefore(renderer.domElement, container.firstChild);

    // Camera — orthographic for 2D
    const frustum = 200;
    camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0.1, 1000);
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    // Scene
    scene = new THREE.Scene();
    lineScene = new THREE.Scene(); // separate scene for line overlays

    // Trails fade overlay — a fullscreen quad that darkens previous frames
    fadeScene = new THREE.Scene();
    fadeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    fadeCamera.position.z = 1;
    fadeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(bg[0], bg[1], bg[2]),
        transparent: true,
        opacity: 0.045,
        depthWrite: false,
        depthTest: false,
    });
    const fadeQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fadeMat);
    fadeScene.add(fadeQuad);

    // Float render target for trail accumulation (16-bit avoids 8-bit quantization stains)
    const pr = Math.min(window.devicePixelRatio, 2);
    trailRT = new THREE.WebGLRenderTarget(Math.round(800 * pr), Math.round(800 * pr), {
        type: THREE.HalfFloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
    });
    // Initialize RT with background color
    renderer.setRenderTarget(trailRT);
    renderer.clear();
    renderer.setRenderTarget(null);

    blitScene = new THREE.Scene();
    blitCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    blitCamera.position.z = 1;
    blitMat = new THREE.MeshBasicMaterial({ map: trailRT.texture });
    blitScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blitMat));

    // Create particle layers
    for (let i = 0; i < LAYER_DEFS.length; i++) {
        layers.push(new ParticleLayer(LAYER_DEFS[i], features.layers[i], features, scene, lineScene));
    }

    // Warmup — pre-simulate all layers so structures form before first render
    warmupSimulation();

    // UI
    updateFeaturesPanel();
    updateZoomDisplay();

    // Input handlers
    setupInput();

    // Start loop
    lastTime = performance.now();
    requestAnimationFrame(animate);
}

function setupInput() {
    const container = document.getElementById("canvas-container");

    // Scroll zoom
    container.addEventListener("wheel", (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.85 : 1.18;
        targetZoom = Math.max(0.5, Math.min(200, targetZoom * zoomFactor));
    }, { passive: false });

    // Pan
    container.addEventListener("mousedown", (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        panStartX = targetPanX;
        panStartY = targetPanY;
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        const scale = (camera.right - camera.left) / 800;
        targetPanX = panStartX - dx * scale;
        targetPanY = panStartY + dy * scale;
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    // Touch support
    let lastTouchDist = 0;
    container.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
            panStartX = targetPanX;
            panStartY = targetPanY;
        } else if (e.touches.length === 2) {
            isDragging = false;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDist = Math.sqrt(dx * dx + dy * dy);
        }
        e.preventDefault();
    }, { passive: false });

    container.addEventListener("touchmove", (e) => {
        if (e.touches.length === 1 && isDragging) {
            const dx = e.touches[0].clientX - dragStartX;
            const dy = e.touches[0].clientY - dragStartY;
            const scale = (camera.right - camera.left) / 800;
            targetPanX = panStartX - dx * scale;
            targetPanY = panStartY + dy * scale;
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (lastTouchDist > 0) {
                const ratio = dist / lastTouchDist;
                targetZoom = Math.max(0.5, Math.min(200, targetZoom * ratio));
            }
            lastTouchDist = dist;
        }
        e.preventDefault();
    }, { passive: false });

    container.addEventListener("touchend", () => {
        isDragging = false;
        lastTouchDist = 0;
    });

    // Keyboard
    window.addEventListener("keydown", (e) => {
        switch (e.key.toLowerCase()) {
            case "r": regenerate(); break;
            case "d": devRandomize(); break;
            case "s": saveImage(); break;
            case "f": toggleFullscreen(); break;
            case " ": e.preventDefault(); paused = !paused; break;
            // Network
            case "c": toggleVisual("connections"); break;
            case "w": toggleVisual("repulsion"); break;
            case "v": toggleVisual("velocity"); break;
            case "t": toggleVisual("trails"); break;
            // Shape
            case "h": toggleVisual("halos"); break;
            case "g": toggleVisual("soft"); break;
            case "j": toggleVisual("stars"); break;
            case "o": toggleVisual("rings"); break;
            // Color
            case "m": toggleVisual("mono"); break;
            case "n": toggleVisual("rainbow"); break;
            case "i": toggleVisual("invert"); break;
            case "x": toggleVisual("xray"); break;
            // Animation
            case "p": toggleVisual("pulse"); break;
            case "k": toggleVisual("flicker"); break;
            case "1": targetZoom = 1; break;
            case "2": targetZoom = 4; break;
            case "3": targetZoom = 15; break;
            case "4": targetZoom = 40; break;
            case "5": targetZoom = 120; break;
        }
    });
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(time) {
    requestAnimationFrame(animate);

    const dt = Math.min((time - lastTime) / 1000, 0.05); // cap at 50ms
    lastTime = time;
    animTime += dt;

    // Smooth zoom interpolation
    currentZoom += (targetZoom - currentZoom) * 0.08;

    // Smooth pan interpolation
    panX += (targetPanX - panX) * 0.1;
    panY += (targetPanY - panY) * 0.1;

    // Update camera
    const halfSize = 200 / currentZoom;
    camera.left = -halfSize + panX;
    camera.right = halfSize + panX;
    camera.top = halfSize + panY;
    camera.bottom = -halfSize + panY;
    camera.updateProjectionMatrix();

    // Update simulation — all layers always simulate so structures stay formed
    // simSpeed scales the physics dt, not frame rate, so motion stays smooth at all speeds
    if (!paused) {
        const friction = features.friction;
        const forceStrength = features.forceStrength;
        const simDt = dt * 60 * simSpeed;

        for (let i = 0; i < layers.length; i++) {
            layers[i].update(simDt, friction, forceStrength);
        }
    }

    // Update visuals
    for (let i = 0; i < layers.length; i++) {
        layers[i].updateVisuals(currentZoom);
    }

    // Update zoom display
    updateZoomDisplay();

    // Handle invert: swap background color
    const bg = features.bgColor;
    if (visuals.invert) {
        renderer.setClearColor(new THREE.Color(1 - bg[0], 1 - bg[1], 1 - bg[2]), 1);
        if (fadeMat) fadeMat.color.setRGB(1 - bg[0], 1 - bg[1], 1 - bg[2]);
    } else {
        renderer.setClearColor(new THREE.Color(bg[0], bg[1], bg[2]), 1);
        if (fadeMat) fadeMat.color.setRGB(bg[0], bg[1], bg[2]);
    }

    // Trail fade speed from slider
    if (fadeMat) fadeMat.opacity = 0.09 * visuals.trailFade;

    // Update line material blending: Normal for invert (visible on bright bg), Additive otherwise
    const lineBlend = visuals.invert ? THREE.NormalBlending : THREE.AdditiveBlending;
    for (const layer of layers) {
        if (layer.connMaterial) layer.connMaterial.blending = lineBlend;
        if (layer.repMaterial) layer.repMaterial.blending = lineBlend;
        if (layer.velMaterial) layer.velMaterial.blending = lineBlend;
    }

    // Render
    const hasLines = visuals.connections || visuals.repulsion || visuals.velocity;
    if (visuals.trails) {
        // Render into HalfFloat render target — 16-bit precision avoids 8-bit quantization stains
        renderer.setRenderTarget(trailRT);
        renderer.autoClear = false;
        renderer.render(fadeScene, fadeCamera);
        renderer.clearDepth();
        renderer.render(scene, camera);
        if (hasLines) {
            renderer.clearDepth();
            renderer.render(lineScene, camera);
        }
        renderer.setRenderTarget(null);
        // Blit accumulated trail texture to screen
        renderer.autoClear = true;
        renderer.render(blitScene, blitCamera);
    } else {
        renderer.autoClear = true;
        renderer.render(scene, camera);
        // Line overlays in a separate pass
        if (hasLines) {
            renderer.autoClear = false;
            renderer.clearDepth();
            renderer.render(lineScene, camera);
            renderer.autoClear = true;
        }
    }
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateZoomDisplay() {
    const el = document.getElementById("zoom-display");
    if (!el) return;

    let label = "macro";
    if (currentZoom >= 60) label = "atomic";
    else if (currentZoom >= 20) label = "molecular";
    else if (currentZoom >= 8) label = "organelle";
    else if (currentZoom >= 2) label = "cellular";

    el.textContent = `${currentZoom.toFixed(1)}x — ${label}`;
}

function updateFeaturesPanel() {
    const el = document.getElementById("features");
    if (!el) return;

    const featureList = [
        { label: "Palette", value: features.palette, rarity: features.paletteRarity },
        { label: "Structure", value: features.structure, rarity: features.structureRarity },
        { label: "Viscosity", value: features.frictionLabel, rarity: features.frictionRarity },
        { label: "Force", value: features.forceLabel, rarity: features.forceRarity },
        { label: "Mutation", value: features.variationLabel, rarity: features.variationRarity },
        { label: "Density", value: features.densityLabel, rarity: features.densityRarity },
        { label: "Activity", value: features.activityLabel, rarity: features.activityRarity },
        { label: "Symmetry", value: features.symmetryLabel, rarity: features.symmetryRarity },
        { label: "Interaction", value: features.interactionLabel, rarity: features.interactionRarity },
    ];

    el.innerHTML = featureList.map(f =>
        `<div class="feature">
            <span class="label">${f.label}</span>
            <span class="value rarity-${f.rarity}">${f.value}</span>
        </div>`
    ).join("");

    const hashEl = document.getElementById("hash-display");
    if (hashEl) hashEl.textContent = hash.slice(0, 18) + "...";
}

// ============================================================================
// GLOBAL ACTIONS
// ============================================================================

function regenerate() {
    // Generate new random hash
    hash = "0x" + Array(64).fill(0).map(() =>
        "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

    // Dispose old layers
    for (const layer of layers) layer.dispose(scene);
    layers = [];

    // Regenerate
    generateFeatures();
    const bg = features.bgColor;
    renderer.setClearColor(new THREE.Color(bg[0], bg[1], bg[2]), 1);
    if (fadeMat) fadeMat.color.setRGB(bg[0], bg[1], bg[2]);

    for (let i = 0; i < LAYER_DEFS.length; i++) {
        layers.push(new ParticleLayer(LAYER_DEFS[i], features.layers[i], features, scene, lineScene));
    }

    warmupSimulation();
    updateFeaturesPanel();

    const status = document.getElementById("status");
    if (status) {
        status.textContent = "Regenerated";
        status.classList.add("visible");
        setTimeout(() => status.classList.remove("visible"), 800);
    }
}

function saveImage() {
    // Re-render current frame to screen for capture
    if (visuals.trails && trailRT) {
        renderer.autoClear = true;
        renderer.render(blitScene, blitCamera);
    } else {
        renderer.autoClear = true;
        renderer.render(scene, camera);
        const hasLines = visuals.connections || visuals.repulsion || visuals.velocity;
        if (hasLines) {
            renderer.autoClear = false;
            renderer.clearDepth();
            renderer.render(lineScene, camera);
            renderer.autoClear = true;
        }
    }
    const link = document.createElement("a");
    link.download = `micro-cosmos-ii-${hash.slice(2, 10)}.png`;
    link.href = renderer.domElement.toDataURL("image/png");
    link.click();

    const status = document.getElementById("status");
    if (status) {
        status.textContent = "Saved";
        status.classList.add("visible");
        setTimeout(() => status.classList.remove("visible"), 800);
    }
}

function devRandomize() {
    // Uniform randomization — no rarity weighting, pure uniform distribution
    hash = "0x" + Array(64).fill(0).map(() =>
        "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

    for (const layer of layers) layer.dispose(scene);
    layers = [];

    generateFeatures();

    // Override rarities to "common" — dev mode doesn't care about rarity
    features.paletteRarity = "common";
    features.structureRarity = "common";
    features.frictionRarity = "common";
    features.forceRarity = "common";
    features.variationRarity = "common";
    features.densityRarity = "common";
    features.activityRarity = "common";
    features.symmetryRarity = "common";
    features.interactionRarity = "common";

    const bg = features.bgColor;
    renderer.setClearColor(new THREE.Color(bg[0], bg[1], bg[2]), 1);
    if (fadeMat) fadeMat.color.setRGB(bg[0], bg[1], bg[2]);

    for (let i = 0; i < LAYER_DEFS.length; i++) {
        layers.push(new ParticleLayer(LAYER_DEFS[i], features.layers[i], features, scene, lineScene));
    }

    warmupSimulation();
    updateFeaturesPanel();

    const status = document.getElementById("status");
    if (status) {
        status.textContent = "Dev Randomized";
        status.classList.add("visible");
        setTimeout(() => status.classList.remove("visible"), 800);
    }
}

function toggleFullscreen() {
    const container = document.getElementById("canvas-container");
    if (!document.fullscreenElement) {
        (container.requestFullscreen || container.webkitRequestFullscreen || function(){}).call(container).catch(() => {});
    } else {
        document.exitFullscreen();
    }
}

// Resize renderer when fullscreen changes
document.addEventListener("fullscreenchange", () => {
    const container = document.getElementById("canvas-container");
    let size;
    if (document.fullscreenElement) {
        const w = window.innerWidth, h = window.innerHeight;
        size = Math.min(w, h);
    } else {
        size = 800;
    }
    renderer.setSize(size, size);
    // Resize trail render target to match
    if (trailRT) {
        const pr = Math.min(window.devicePixelRatio, 2);
        trailRT.setSize(Math.round(size * pr), Math.round(size * pr));
    }
});

function setSimSpeed(val) {
    simSpeed = parseFloat(val);
    const label = document.getElementById("speed-label");
    if (label) label.textContent = simSpeed.toFixed(2) + "x";
}

// Visual overlay toggles
const ALL_TOGGLES = [
    "connections", "repulsion", "velocity", "trails",
    "halos", "soft", "stars", "rings",
    "mono", "rainbow", "invert", "xray",
    "pulse", "flicker",
];

function toggleVisual(key) {
    visuals[key] = !visuals[key];
    // Mutually exclusive shape modes: stars and rings
    if (key === "stars" && visuals.stars) visuals.rings = false;
    if (key === "rings" && visuals.rings) visuals.stars = false;
    // When toggling trails, initialize or clear the float render target
    if (key === "trails") {
        if (visuals.trails && trailRT) {
            // Initialize RT with current background so trails start clean
            renderer.setRenderTarget(trailRT);
            renderer.clear();
            renderer.setRenderTarget(null);
        } else {
            renderer.autoClear = true;
        }
    }
    updateVisualButtons();
}

function setVisualSize(val) {
    visuals.sizeMult = parseFloat(val);
    const label = document.getElementById("size-label");
    if (label) label.textContent = visuals.sizeMult.toFixed(1) + "x";
}

function setConnRadius(val) {
    visuals.connRadius = parseFloat(val);
    const label = document.getElementById("conn-label");
    if (label) label.textContent = visuals.connRadius.toFixed(1) + "x";
}

function setTrailFade(val) {
    visuals.trailFade = parseFloat(val);
    const label = document.getElementById("trail-label");
    if (label) label.textContent = visuals.trailFade.toFixed(1) + "x";
}

function setHueShift(val) {
    visuals.hueShift = parseFloat(val);
    const label = document.getElementById("hue-label");
    if (label) label.textContent = Math.round(visuals.hueShift * 360) + "\u00B0";
}

function updateVisualButtons() {
    for (const k of ALL_TOGGLES) {
        const btn = document.getElementById("vis-" + k);
        if (btn) btn.classList.toggle("active", visuals[k]);
    }
}

// Platform integration
window.getFeatures = function() {
    return {
        Palette: features.palette,
        Structure: features.structure,
        Viscosity: features.frictionLabel,
        Force: features.forceLabel,
        Mutation: features.variationLabel,
        Density: features.densityLabel,
        Activity: features.activityLabel,
        Symmetry: features.symmetryLabel,
        Interaction: features.interactionLabel,
    };
};

// ============================================================================
// INIT
// ============================================================================

init();
