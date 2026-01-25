/**
 * Graphical Score v3.22.2
 * A generative graphical score with 14 distinct modes inspired by
 * 20th century avant-garde composers
 *
 * Original Modes: Artikulation, UPIC, Cluster, Graph, Chance, Spectral, Spiral
 * New Modes: Treatise, OpenForm, Bussotti, TextScore, Stripsody, Ankhrasmation, Braxton
 *
 * Features layered hybrid blending system
 *
 * v3.10.0: Major enhancement to Bussotti mode with 16 new elements:
 *          - Gestural marks, curved staves, ink drips, decorative elements
 *          - Text fragments, theatrical marks, swirls, clusters
 *          - Loops, accents, vines, stars, connected gestures
 *          - Decorative dots, waves, dramatic crescendos
 * v3.9.0: Major enhancement to OpenForm (Earle Brown) mode with 16 new elements:
 *         - Mobile arrangements, proportional bars, visual balance
 *         - Trajectories, clusters, vertical stacks, horizontal streams
 *         - Single events, size gradients, sparse/dense arrangements
 *         - Overlapping rectangles, asymmetric balance, contrapuntal
 *         - Loose grids, diagonal arrangements
 * v3.8.0: Major enhancement to Treatise (Cardew) mode with 18 new elements:
 *         - Lifeline, tree structures, dot clouds, parallel lines
 *         - Curved paths, solid shapes, nested shapes, zigzags
 *         - Wedges, scattered dots, grids, angular constructions
 *         - Abstract symbols, dense masses, connectors, brackets
 *         - Small spirals, rectangular blocks
 * v3.7.0: Major enhancement to Spectral (Murail/Grisey) mode with 16 new elements:
 *         - Harmonic partials, inharmonicity, beating patterns
 *         - Spectral interpolation, difference tones, ring modulation
 *         - Spectral compression, filtering curves, envelopes
 *         - Spectral gestures, sonograms, morphing
 *         - Fundamental emphasis, spectral glissando, decay curves
 *         - Additive synthesis visualization
 * v3.6.0: Major enhancement to Cluster (Penderecki) mode with 18 new elements:
 *         - Cluster glissandi, micropolyphony textures, string effect notation
 *         - Quarter-tone marks, aleatory boxes, black notation areas
 *         - Vibrato wiggles, sustained tones, percussive marks
 *         - Dynamic hairpins, tremolo slashes, harmonic diamonds
 *         - Sul tasto, col legno battuto, flautando, spiccato
 *         - Bariolage alternations, ricochet bow patterns
 * v3.5.0: Major enhancement to UPIC (Xenakis) mode with 18 new elements:
 *         - Glissandi bands, density masses, graph paper grid
 *         - Pressure strokes, stochastic points, mathematical curves
 *         - Arborescences (tree structures), polytopes, granular clouds
 *         - Probability bands, angular transforms, wave pages
 *         - Rotational transforms, parallel streams, sifted patterns
 *         - Architectural structures, logistic maps, harmonic series
 * v3.4.0: Major enhancement to Artikulation (Ligeti/Wehinger) mode with 18 new elements:
 *         - Call/response patterns, timbral stripes, glitch patterns
 *         - Speech-like fragments, density clouds, attack/decay envelopes
 *         - Connector lines, crescendo/decrescendo wedges, interrupted fragments
 *         - Overlapping regions, texture gradients, pulsation rhythms
 *         - Morphing shapes, static bursts, timbre legends
 *         - Vertical sync markers, electronic motifs, spatial panning indicators
 * v3.3.0: Major enhancement to Chance (Cage) mode with 20 new elements:
 *         - Fontana Mix grid, transparent overlays, I Ching hexagrams
 *         - Star chart tracings (Atlas Eclipticalis), silence boxes (4'33")
 *         - Mesostic text, Ryoanji tracings, prepared piano symbols
 *         - Time brackets, chance operation marks, circus overlays
 *         - Indeterminacy symbols, event notation, notation types
 *         - Mycological forms, number piece brackets, radio static
 *         - Water walk symbols, Zen circles (Ensō), anarchy symbols
 * v3.2.0: Major enhancement to Graph (Feldman) mode with 18 new elements:
 *         - Ictus marks, register bands, time brackets, proportional grids
 *         - Diamond noteheads, cluster brackets, dynamic gradients
 *         - Sustain lines, tremolo marks, instrument labels, empty boxes
 *         - Connecting lines, soft attack marks, decay trails
 *         - Duration stacks, pedal markings, breath marks, harmonic halos
 * v3.1.1: Fixed empty score bug - raised density floor and added minimum element counts
 * v3.1.0: Major enhancement to Spiral mode with 10 new elements:
 *         - Multiple spiral types (logarithmic, double, arms, Fermat)
 *         - Text along spiral paths (Crumb-style poetic fragments)
 *         - Segmented spirals with rest gaps
 *         - Musical noteheads along spiral curves
 *         - Zodiac/mystical/alchemical symbols
 *         - Mandala-like patterns with rotational symmetry
 *         - Fibonacci/golden ratio spirals
 *         - Spiral sections within wedges
 *         - Eye/circular imagery ("Eye of the Whale")
 *         - Beaming across spiral note groups
 * v3.0.1: Changed canvas to A3 landscape format (√2 aspect ratio)
 * v3.0.0: Added 7 new modes based on research (Cardew, Brown, Bussotti,
 *         Stockhausen/Eno, Berberian, Wadada Leo Smith, Anthony Braxton)
 * v2.2.1: Fixed section markers, ASCII note values, expanded durations
 * v2.2.0: Refined paper aesthetics, fixed header layout, musical metadata
 * v2.1.0: Enhanced Spectral mode with engraved hatching, stippling
 *
 * @version 3.23.0
 */

// ============================================================
// HASH-BASED RANDOMNESS (Art Blocks Compatible)
// ============================================================

let hash = "0x" + Array(64).fill(0).map(() =>
  "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

if (typeof tokenData !== "undefined" && tokenData.hash) {
  hash = tokenData.hash;
}

function sfc32(a, b, c, d) {
  const rng = function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
  // Allow saving/restoring state
  rng.getState = () => ({ a, b, c, d });
  rng.setState = (s) => { a = s.a; b = s.b; c = s.c; d = s.d; };
  return rng;
}

function initRandom(hashStr) {
  const seeds = [];
  for (let i = 2; i < 66; i += 8) {
    seeds.push(parseInt(hashStr.slice(i, i + 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

let R;
let rngInitialState = null;        // Initial PRNG state (right after creation)
let rngStateAfterFeatures = null;  // Saved PRNG state after generateFeatures

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

function rndGaussian(mean = 0, stdDev = 1) {
  const u1 = R();
  const u2 = R();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z * stdDev + mean;
}

// ============================================================
// TIME SIGNATURE INFLUENCE HELPERS
// ============================================================

/**
 * Get the accent weight for a position within the time signature pattern
 * @param {number} position - Position in the sequence (0-based)
 * @returns {number} - Accent weight (0.0 to 1.0)
 */
function getAccentWeight(position) {
  if (!features || !features.accentPattern) return 1.0;
  const pattern = features.accentPattern;
  const cycle = features.groupingCycle || 1;
  const idx = Math.floor(position / cycle) % pattern.length;
  return pattern[idx];
}

/**
 * Get x-positions for beat groupings across a section
 * @param {number} xStart - Start x position
 * @param {number} xEnd - End x position
 * @param {number} count - Number of elements to place
 * @returns {Array} - Array of {x, accent} objects
 */
function getGroupedPositions(xStart, xEnd, count) {
  if (!features || !features.beatGrouping) {
    // Fallback to even spacing
    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push({
        x: xStart + (i / (count - 1 || 1)) * (xEnd - xStart),
        accent: 1.0
      });
    }
    return positions;
  }

  const groupSize = features.beatGrouping;
  const pattern = features.accentPattern;
  const positions = [];

  for (let i = 0; i < count; i++) {
    const normalizedPos = i / (count - 1 || 1);
    const x = xStart + normalizedPos * (xEnd - xStart);
    const beatPos = i % groupSize;
    const accent = pattern[beatPos % pattern.length];

    positions.push({ x, accent, beatPos, isDownbeat: beatPos === 0 });
  }

  return positions;
}

/**
 * Check if a position is on a strong beat (downbeat)
 * @param {number} position - Position in sequence
 * @returns {boolean}
 */
function isStrongBeat(position) {
  if (!features || !features.beatGrouping) return true;
  return (position % features.beatGrouping) === 0;
}

/**
 * Get subdivision count for current time signature
 * @returns {number} - 2 for simple meters, 3 for compound
 */
function getSubdivision() {
  return features?.beatSubdivision || 2;
}

/**
 * Apply grouping-based size variation
 * @param {number} baseSize - Base element size
 * @param {number} position - Position in sequence
 * @returns {number} - Modified size based on accent
 */
function getAccentedSize(baseSize, position) {
  const accent = getAccentWeight(position);
  // Strong beats are larger (up to 1.3x), weak beats smaller (down to 0.7x)
  return baseSize * (0.7 + accent * 0.6);
}

function rollRarity(common, uncommon, rare, legendary) {
  const roll = R();
  if (roll < legendary) return "legendary";
  if (roll < legendary + rare) return "rare";
  if (roll < legendary + rare + uncommon) return "uncommon";
  return "common";
}

function rndWeighted(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = R() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

// ============================================================
// COLOR PALETTES
// ============================================================

const PALETTES = {
  // Archival palettes
  sepia: {
    paper: "#f4efe4", paperDark: "#e8e0cf",
    ink: "#2a1f14", inkLight: "#5c4a3a",
    accent: "#8b4513", faded: "#9c8b7a",
    type: "archival"
  },
  manuscript: {
    paper: "#f5f0e1", paperDark: "#e5dcc8",
    ink: "#1a1a1a", inkLight: "#4a4a4a",
    accent: "#6b3a3a", faded: "#8a8070",
    type: "archival"
  },
  parchment: {
    paper: "#f2e8d5", paperDark: "#e0d4be",
    ink: "#3a2a1a", inkLight: "#6a5a4a",
    accent: "#7a4a2a", faded: "#a09080",
    type: "archival"
  },
  aged: {
    paper: "#ebe3d3", paperDark: "#d8ccb8",
    ink: "#2f2218", inkLight: "#5f5040",
    accent: "#704820", faded: "#907860",
    type: "archival"
  },
  blueprint: {
    paper: "#e8eef4", paperDark: "#d4dde8",
    ink: "#1a2f4a", inkLight: "#4a6080",
    accent: "#2f5070", faded: "#8090a0",
    type: "archival"
  },

  // Mode-authentic palettes
  wehinger: {
    // Artikulation colors from Wehinger's score
    paper: "#f8f6f0", paperDark: "#e8e4d8",
    ink: "#1a1a1a", inkLight: "#4a4a4a",
    accent: "#cc3333", faded: "#888888",
    colors: ["#cc3333", "#3366cc", "#33aa55", "#ffaa00", "#9944aa", "#ff6644", "#44aacc"],
    type: "authentic"
  },
  upicBlue: {
    // UPIC system blue plotting paper
    paper: "#d8e4f0", paperDark: "#c0d0e0",
    ink: "#0a1a3a", inkLight: "#2a4a6a",
    accent: "#1a4488", faded: "#6080a0",
    type: "authentic"
  },
  spectralHeat: {
    // Spectrogram heat colors
    paper: "#0a0a14", paperDark: "#050508",
    ink: "#ffffff", inkLight: "#aaaaaa",
    accent: "#ff4400", faded: "#444455",
    gradient: ["#000022", "#220044", "#440066", "#880044", "#cc2200", "#ff4400", "#ffaa00", "#ffff88"],
    type: "authentic"
  },
  crumbRitual: {
    // George Crumb's mystical scores
    paper: "#1a1820", paperDark: "#100e14",
    ink: "#d4c4a8", inkLight: "#8a7a5a",
    accent: "#8b0000", faded: "#5a4a3a",
    type: "authentic"
  },
  cageTransparent: {
    // Cage's transparent overlay aesthetic
    paper: "#fafafa", paperDark: "#e8e8e8",
    ink: "#1a1a1a", inkLight: "#6a6a6a",
    accent: "#333333", faded: "#aaaaaa",
    type: "authentic"
  },

  // New palettes for expanded modes (v3.0.0)
  treatiseBlack: {
    // Cardew's stark black-on-white geometric
    paper: "#ffffff", paperDark: "#f0f0f0",
    ink: "#000000", inkLight: "#333333",
    accent: "#000000", faded: "#999999",
    type: "authentic"
  },
  brownMobile: {
    // Earle Brown's December 1952 aesthetic
    paper: "#f5f0e6", paperDark: "#e0d8c8",
    ink: "#1a1a1a", inkLight: "#4a4a4a",
    accent: "#2a2a2a", faded: "#8a8a8a",
    type: "authentic"
  },
  bussottiInk: {
    // Bussotti's theatrical calligraphic scores
    paper: "#faf8f0", paperDark: "#e8e4d4",
    ink: "#0a0808", inkLight: "#3a3030",
    accent: "#880000", faded: "#706050",
    type: "authentic"
  },
  textMinimal: {
    // Stockhausen/Eno text score aesthetic
    paper: "#f8f8f8", paperDark: "#e4e4e4",
    ink: "#1a1a1a", inkLight: "#555555",
    accent: "#333333", faded: "#aaaaaa",
    type: "authentic"
  },
  stripsodyPop: {
    // Berberian's comic-inspired colors
    paper: "#fffef5", paperDark: "#f0eee0",
    ink: "#000000", inkLight: "#444444",
    accent: "#dd2222", faded: "#888888",
    colors: ["#dd2222", "#2255cc", "#ffcc00", "#22aa44", "#ff6600", "#9933cc"],
    type: "authentic"
  },
  ankhrasmationColor: {
    // Wadada Leo Smith's colored language scores
    paper: "#f5f5f5", paperDark: "#e0e0e0",
    ink: "#1a1a1a", inkLight: "#505050",
    accent: "#cc3300", faded: "#808080",
    colors: ["#cc3300", "#0066cc", "#ffcc00", "#00aa55", "#9933cc", "#ff6600", "#00cccc"],
    type: "authentic"
  },
  braxtonDiagram: {
    // Anthony Braxton's schematic aesthetic
    paper: "#f8f6f0", paperDark: "#e4e0d8",
    ink: "#0a1420", inkLight: "#3a4a5a",
    accent: "#1a3a5a", faded: "#8090a0",
    type: "authentic"
  },

  // New palettes for expanded modes (v3.23.0)
  mobileSilver: {
    // Haubenstock-Ramati's mobile aesthetic - clean, modern
    paper: "#f4f4f4", paperDark: "#e0e0e0",
    ink: "#1a1a1a", inkLight: "#5a5a5a",
    accent: "#404040", faded: "#a0a0a0",
    type: "authentic"
  }
};

// ============================================================
// MODE DEFINITIONS
// ============================================================

const MODES = {
  artikulation: {
    name: "Artikulation",
    composer: "Ligeti/Wehinger",
    description: "Color-coded timbral blocks, dense clusters, call/response, electronic patterns",
    weight: 0.15,
    elements: [
      "colorBlocks", "timbralClusters", "callResponse", "densityClouds",
      "timbralStripes", "glitchPatterns", "speechFragments", "attackDecay",
      "connectors", "wedges", "interrupted", "overlaps", "textureGradient",
      "pulsation", "morphing", "staticBursts", "timbreLegend", "verticalSync",
      "electronicMotifs", "spatialPanning"
    ],
    prefersPalette: ["wehinger", "manuscript"]
  },
  upic: {
    name: "UPIC",
    composer: "Xenakis",
    description: "Freehand arcs, glissandi, stochastic masses, mathematical curves, architectural structures",
    weight: 0.15,
    elements: [
      "arcs", "glissandi", "ruledLines", "sirenSweeps", "glissandiBands",
      "densityMass", "graphPaper", "pressureStrokes", "stochasticPoints",
      "mathCurves", "arborescences", "polytopes", "granularCloud",
      "probabilityBands", "angularTransforms", "wavePages", "rotations",
      "parallelStreams", "sifted", "architectural", "logisticMap", "harmonicSeries"
    ],
    prefersPalette: ["upicBlue", "blueprint"]
  },
  cluster: {
    name: "Cluster",
    composer: "Penderecki",
    description: "Dense wedge shapes, micropolyphony, extended string techniques, black notation",
    weight: 0.15,
    elements: [
      "wedges", "clusterBands", "extendedSymbols", "quarterTones", "glissandi",
      "micropolyphony", "stringEffects", "aleatoryBox", "blackNotation",
      "vibratoWiggle", "sustainedTones", "percussive", "dynamicHairpin",
      "tremoloSlashes", "harmonicDiamond", "sulTasto", "colLegnoBatt",
      "flautando", "spiccato", "bariolage", "ricochet"
    ],
    prefersPalette: ["manuscript", "sepia"]
  },
  graph: {
    name: "Graph",
    composer: "Feldman",
    description: "Sparse pointillist grid, time brackets, soft attacks, decay trails",
    weight: 0.15,
    elements: [
      "gridBoxes", "sparsePoints", "ictusMarks", "registerBands", "timeBrackets",
      "proportionalGrid", "diamondNotes", "clusterBrackets", "dynamicGradients",
      "sustainLines", "tremoloMarks", "instrumentLabels", "emptyBoxes",
      "connectingLines", "softAttackMarks", "decayTrails", "durationStacks",
      "pedalMarkings", "breathMarks", "harmonicHalos"
    ],
    prefersPalette: ["aged", "manuscript", "parchment"]
  },
  chance: {
    name: "Chance",
    composer: "Cage",
    description: "I Ching operations, star charts, prepared piano, silence, Zen circles",
    weight: 0.15,
    elements: [
      "curvedLines", "dotFields", "intersections", "fontanaMixGrid", "transparentOverlays",
      "iChingHexagrams", "starChartTracings", "silenceBoxes", "mesosticText", "ryoanjiTracings",
      "preparedPianoSymbols", "cageTimeBrackets", "chanceOperationMarks", "circusOverlays",
      "indeterminacySymbols", "eventNotation", "notationTypes", "mycologicalForms",
      "numberPieceBrackets", "radioStaticDots", "waterWalkSymbols", "zenCircles", "anarchySymbols"
    ],
    prefersPalette: ["cageTransparent", "blueprint", "manuscript"]
  },
  spectral: {
    name: "Spectral",
    composer: "Murail/Grisey",
    description: "Frequency bands, overtone analysis, spectral transformations, sonograms",
    weight: 0.15,
    elements: [
      "frequencyBands", "harmonicStacks", "spectralEnvelopes", "partials",
      "waterfall", "formantContours", "attackTransients", "resonanceBells",
      "inharmonicity", "beating", "interpolation", "differenceTones",
      "ringMod", "compression", "filtering", "envelopeTime", "gesture",
      "sonogram", "morphing", "fundamental", "gliss", "decay", "additive"
    ],
    prefersPalette: ["spectralHeat", "blueprint"]
  },
  spiral: {
    name: "Spiral",
    composer: "Crumb",
    description: "Circular/spiral notation, mandalas, eye imagery, mystical symbols",
    weight: 0.12,
    elements: [
      "spiralPaths", "spiralVariants", "spiralText", "segmentedSpiral",
      "spiralNoteheads", "circularNotation", "mysticalSymbols", "mandalaPattern",
      "fibonacciSpiral", "spiralWedges", "crumbEye", "spiralBeaming", "ritualSymbols"
    ],
    prefersPalette: ["crumbRitual", "parchment", "manuscript"]
  },

  // New modes added in v3.0.0
  treatise: {
    name: "Treatise",
    composer: "Cardew",
    description: "Abstract geometric shapes, lifeline, tree structures, grids, angular constructions",
    weight: 0.08,
    elements: [
      "geometricAbstract", "numberSequences", "thickLines", "circleFormations",
      "lifeline", "tree", "clouds", "parallelLines", "curvedPath", "solids",
      "nests", "zigzag", "wedge", "scatteredDots", "grid", "angle",
      "symbols", "mass", "connectors", "brackets", "smallSpiral", "blocks"
    ],
    prefersPalette: ["treatiseBlack", "manuscript"]
  },
  openform: {
    name: "OpenForm",
    composer: "Earle Brown",
    description: "Floating rectangles, mobile arrangements, proportional notation, visual balance",
    weight: 0.08,
    elements: [
      "floatingRects", "spatialFields", "proportionalBlocks", "mobileArrangement",
      "mobile", "proportional", "balance", "trajectory", "clusters",
      "verticalStacks", "horizontalStream", "event", "gradient",
      "sparse", "dense", "overlap", "asymmetric", "contrapuntal",
      "looseGrid", "diagonal"
    ],
    prefersPalette: ["brownMobile", "aged"]
  },
  bussotti: {
    name: "Bussotti",
    composer: "Sylvano Bussotti",
    description: "Ornate calligraphic gestures, theatrical flourishes, artistic notation, curved staves, ink drips",
    weight: 0.07,
    elements: [
      "calligraphicLines", "theatricalGestures", "ornateFlourishes", "inkSplatters",
      "gestural", "curvedStaff", "drips", "decorative", "textFragments",
      "theatrical", "swirls", "clusters", "loops", "accents",
      "vines", "stars", "connected", "decorativeDots", "waves", "crescendo"
    ],
    prefersPalette: ["bussottiInk", "sepia"]
  },
  textscore: {
    name: "TextScore",
    composer: "Stockhausen/Eno",
    description: "Verbal instructions, cryptic phrases, text-based notation, intuitive music, oblique strategies",
    weight: 0.07,
    elements: [
      "textInstructions", "crypticPhrases", "spacedWords", "typographicLayout",
      "poetic", "numbered", "time", "stockhausen", "oblique",
      "prosody", "conceptual", "parenthetical", "quotes", "verbs",
      "layout", "minimal", "questions", "negation", "duration", "whisper"
    ],
    prefersPalette: ["textMinimal", "manuscript"]
  },
  stripsody: {
    name: "Stripsody",
    composer: "Cathy Berberian",
    description: "Comic onomatopoeia, speech bubbles, cartoon visual elements, impact stars, action symbols",
    weight: 0.06,
    elements: [
      "onomatopoeia", "speechBubbles", "comicSymbols", "actionLines",
      "explosions", "stars", "speedLines", "swoosh", "faces",
      "exclamations", "questionMarks", "hearts", "musicNotes", "lightning",
      "spirals", "droplets", "puffs", "impact", "wobble"
    ],
    prefersPalette: ["stripsodyPop", "parchment"]
  },
  ankhrasmation: {
    name: "Ankhrasmation",
    composer: "Wadada Leo Smith",
    description: "Colored duration symbols, rhythmic cells, language score notation, improvisation zones",
    weight: 0.06,
    elements: [
      "durationSymbols", "coloredCells", "rhythmicUnits", "symbolicMarks",
      "colorBars", "diagonals", "cells", "arrows", "gradients",
      "vertical", "rests", "connected", "crescendo", "clusters",
      "waves", "dots", "brackets", "numbers", "parallel", "improvisationZone"
    ],
    prefersPalette: ["ankhrasmationColor", "manuscript"]
  },
  braxton: {
    name: "Braxton",
    composer: "Anthony Braxton",
    description: "Diagrammatic notation, schematic symbols, technical drawing aesthetic, modular structures",
    weight: 0.06,
    elements: [
      "diagramSymbols", "schematicLines", "languageTypes", "technicalMarks",
      "compositionNumber", "connectors", "technical", "flowArrows", "circuit",
      "angleBrackets", "parallel", "containment", "zones", "pathways",
      "modular", "verticalStack", "horizontalSpread", "intersections", "labels", "rotational"
    ],
    prefersPalette: ["braxtonDiagram", "blueprint"]
  },

  // New modes added in v3.23.0
  mobile: {
    name: "Mobile",
    composer: "Haubenstock-Ramati",
    description: "Calder-inspired mobile scores, floating fragments connected by dotted paths, multi-directional reading",
    weight: 0.05,
    elements: [
      "floatingCells", "dottedPaths", "fragmentNotation", "mobileBranches",
      "suspendedShapes", "connectionNodes", "directionalArrows", "cellClusters",
      "navigablePaths", "pivotPoints", "balancedArms", "hangingElements",
      "optionalRoutes", "convergencePoints", "divergencePoints", "rotatingGroups"
    ],
    prefersPalette: ["mobileSilver", "brownMobile", "manuscript"]
  }
};

const MODE_NAMES = Object.keys(MODES);

// ============================================================
// FEATURES SYSTEM
// ============================================================

let features = {};
let originalFeatures = {};
let hasOverrides = false;

const RARITY_CURVES = {
  blendType: {
    probabilities: [0.40, 0.35, 0.25],
    labels: ["dominant", "sectional", "voiceBased"]
  },
  modeCount: {
    probabilities: [0.35, 0.40, 0.20, 0.05],
    labels: ["single", "dual", "triple", "quad"]
  },
  voiceCount: {
    probabilities: [0.50, 0.28, 0.14, 0.08],
    labels: ["ensemble (3-5)", "chamber (6-8)", "solo (1-2)", "orchestra (9-12)"]
  },
  structure: {
    probabilities: [0.24, 0.17, 0.13, 0.10, 0.10, 0.08, 0.07, 0.06, 0.05],
    labels: ["flowing", "sectioned", "mathematical", "fragmentary", "gestural", "modular", "polyphonic", "stacked", "palindrome"]
  },
  density: {
    probabilities: [0.45, 0.28, 0.18, 0.09],
    labels: ["balanced", "dense", "sparse", "extreme"]
  },
  paletteType: {
    probabilities: [0.55, 0.45],
    labels: ["archival", "authentic"]
  }
};

function generateFeatures() {
  R = initRandom(hash);
  rngInitialState = R.getState();  // Save initial state for drawScore

  // Determine active modes
  const modeCountRarity = rollRarity(0.35, 0.40, 0.20, 0.05);
  let modeCount;
  if (modeCountRarity === "common") modeCount = 1;
  else if (modeCountRarity === "uncommon") modeCount = 2;
  else if (modeCountRarity === "rare") modeCount = 3;
  else modeCount = 4;

  // Select modes based on weights
  const modeWeights = MODE_NAMES.map(m => MODES[m].weight);
  let activeModes = [];
  let usedIndices = new Set();

  for (let i = 0; i < modeCount; i++) {
    let attempts = 0;
    let idx;
    do {
      idx = rndWeighted(modeWeights);
      attempts++;
    } while (usedIndices.has(idx) && attempts < 20);
    usedIndices.add(idx);
    activeModes.push(MODE_NAMES[idx]);
  }

  const primaryMode = activeModes[0];
  const secondaryModes = activeModes.slice(1);

  // Blending type
  const blendTypeRarity = rollRarity(0.40, 0.35, 0.25, 0);
  let blendType;
  if (blendTypeRarity === "common") blendType = "dominant";
  else if (blendTypeRarity === "uncommon") blendType = "sectional";
  else blendType = "voiceBased";

  // If single mode, force dominant blend
  if (modeCount === 1) blendType = "dominant";

  // Voice count
  const voiceRarity = rollRarity(0.50, 0.28, 0.14, 0.08);
  let voiceCount;
  if (voiceRarity === "common") voiceCount = rndInt(3, 5);
  else if (voiceRarity === "uncommon") voiceCount = rndInt(6, 8);
  else if (voiceRarity === "rare") voiceCount = rndInt(1, 2);
  else voiceCount = rndInt(9, 12);

  // Structure - 9 types with weighted selection
  const structureRoll = rnd();
  let structure, sectionCount = 1;
  if (structureRoll < 0.24) {
    structure = "flowing";
    sectionCount = 1;
  } else if (structureRoll < 0.41) {
    structure = "sectioned";
    sectionCount = rndInt(2, 5);
  } else if (structureRoll < 0.54) {
    structure = "mathematical";
    sectionCount = rndInt(3, 6);
  } else if (structureRoll < 0.64) {
    structure = "fragmentary";
    sectionCount = rndInt(5, 9);  // More sections, irregular widths
  } else if (structureRoll < 0.74) {
    structure = "gestural";
    sectionCount = rndInt(1, 2);  // Minimal sections, organic curves
  } else if (structureRoll < 0.82) {
    structure = "modular";
    sectionCount = rndInt(4, 8);  // Independent modules/blocks
  } else if (structureRoll < 0.89) {
    structure = "polyphonic";
    sectionCount = rndInt(2, 4);  // Independent voice streams with overlap
  } else if (structureRoll < 0.95) {
    structure = "stacked";
    sectionCount = rndInt(2, 4);  // Vertical layers stacked on top of each other
  } else {
    structure = "palindrome";
    sectionCount = rndInt(3, 7);
  }

  // Variable mirror point for palindrome (0.3-0.7 instead of always 0.5)
  const mirrorPoint = structure === "palindrome" ? rnd(0.3, 0.7) : 0.5;

  const structureRarity = structure === "flowing" ? "common" :
    structure === "sectioned" ? "uncommon" :
    (structure === "palindrome" || structure === "gestural" || structure === "modular" || structure === "polyphonic" || structure === "stacked") ? "legendary" : "rare";

  // Density
  const densityRarity = rollRarity(0.45, 0.28, 0.18, 0.09);
  let density, densityValue;
  if (densityRarity === "common") {
    density = "balanced";
    densityValue = rnd(0.4, 0.6);
  } else if (densityRarity === "uncommon") {
    density = "dense";
    densityValue = rnd(0.7, 0.88);
  } else if (densityRarity === "rare") {
    density = "sparse";
    densityValue = rnd(0.12, 0.28);
  } else {
    density = "extreme";
    // Raised minimum from 0.03 to 0.15 to prevent empty scores
    densityValue = rndBool(0.5) ? rnd(0.15, 0.25) : rnd(0.88, 0.98);
  }

  // Palette selection
  const useAuthentic = rndBool(0.45);
  let paletteName;

  if (useAuthentic) {
    // Use mode-preferred authentic palette
    const preferredPalettes = MODES[primaryMode].prefersPalette;
    paletteName = rndChoice(preferredPalettes);
  } else {
    // Use archival palette
    const archivalPalettes = ["sepia", "manuscript", "parchment", "aged", "blueprint"];
    paletteName = rndChoice(archivalPalettes);
  }

  // Time and tempo aesthetics
  const timeSignatures = ["4/4", "3/4", "5/4", "6/8", "7/8", "5/8", "9/8", "free", "aleatoric"];
  const selectedTimeSignature = rndChoice(timeSignatures);

  // Parse time signature for visual influence
  let beatGrouping = 4;       // Primary grouping unit
  let beatSubdivision = 2;    // How beats subdivide (2 = simple, 3 = compound)
  let accentPattern = [1];    // Relative accent weights per beat
  let isAsymmetric = false;   // Odd meters create irregular patterns
  let groupingCycle = 1;      // How many groups before pattern repeats

  if (selectedTimeSignature === "4/4") {
    beatGrouping = 4;
    beatSubdivision = 2;
    accentPattern = [1.0, 0.4, 0.7, 0.4];  // Strong, weak, medium, weak
    groupingCycle = 1;
  } else if (selectedTimeSignature === "3/4") {
    beatGrouping = 3;
    beatSubdivision = 2;
    accentPattern = [1.0, 0.4, 0.5];  // Waltz: strong, weak, weak
    groupingCycle = 1;
  } else if (selectedTimeSignature === "5/4") {
    beatGrouping = 5;
    beatSubdivision = 2;
    isAsymmetric = true;
    // 5/4 often groups as 3+2 or 2+3
    accentPattern = rndBool(0.5) ? [1.0, 0.4, 0.5, 0.8, 0.4] : [1.0, 0.4, 0.8, 0.4, 0.5];
    groupingCycle = 1;
  } else if (selectedTimeSignature === "6/8") {
    beatGrouping = 2;  // Two main beats
    beatSubdivision = 3;  // Compound - each beat has 3 subdivisions
    accentPattern = [1.0, 0.6];  // Two strong beats
    groupingCycle = 1;
  } else if (selectedTimeSignature === "7/8") {
    beatGrouping = 7;
    beatSubdivision = 2;
    isAsymmetric = true;
    // 7/8 groups as 2+2+3, 3+2+2, or 2+3+2
    const pattern = rndInt(0, 2);
    if (pattern === 0) accentPattern = [1.0, 0.4, 0.7, 0.4, 0.8, 0.4, 0.5];  // 2+2+3
    else if (pattern === 1) accentPattern = [1.0, 0.4, 0.5, 0.7, 0.4, 0.8, 0.4];  // 3+2+2
    else accentPattern = [1.0, 0.4, 0.8, 0.4, 0.5, 0.7, 0.4];  // 2+3+2
    groupingCycle = 1;
  } else if (selectedTimeSignature === "5/8") {
    beatGrouping = 5;
    beatSubdivision = 2;
    isAsymmetric = true;
    accentPattern = rndBool(0.5) ? [1.0, 0.4, 0.8, 0.4, 0.5] : [1.0, 0.4, 0.5, 0.8, 0.4];
    groupingCycle = 1;
  } else if (selectedTimeSignature === "9/8") {
    beatGrouping = 3;  // Three main beats
    beatSubdivision = 3;  // Compound
    accentPattern = [1.0, 0.5, 0.6];
    groupingCycle = 1;
  } else {
    // "free" or "aleatoric" - irregular groupings
    beatGrouping = rndInt(2, 7);
    beatSubdivision = rndChoice([2, 3]);
    isAsymmetric = true;
    accentPattern = Array.from({ length: beatGrouping }, () => rnd(0.3, 1.0));
    accentPattern[0] = 1.0;  // First is always strongest
    groupingCycle = rndInt(1, 3);  // Can have longer cycles
  }

  const tempoMarkings = [
    "Lento", "Adagio", "Andante", "Moderato", "Allegro",
    "Presto", "Senza tempo", "Liberamente", "Rubato"
  ];
  const selectedTempo = rndChoice(tempoMarkings);

  // Tempo affects density and spacing
  // Slow tempos = more space, less density
  // Fast tempos = compressed, denser
  // Free tempos = variable
  let tempoModifier = 1.0;
  let tempoSpacing = 1.0;  // Affects element spacing
  switch (selectedTempo) {
    case "Lento":
      tempoModifier = 0.7;
      tempoSpacing = 1.4;
      break;
    case "Adagio":
      tempoModifier = 0.8;
      tempoSpacing = 1.25;
      break;
    case "Andante":
      tempoModifier = 0.9;
      tempoSpacing = 1.1;
      break;
    case "Moderato":
      tempoModifier = 1.0;
      tempoSpacing = 1.0;
      break;
    case "Allegro":
      tempoModifier = 1.15;
      tempoSpacing = 0.85;
      break;
    case "Presto":
      tempoModifier = 1.3;
      tempoSpacing = 0.7;
      break;
    case "Senza tempo":
    case "Liberamente":
    case "Rubato":
      // Variable - slight random variation
      tempoModifier = rnd(0.85, 1.15);
      tempoSpacing = rnd(0.9, 1.2);
      break;
  }

  // Apply tempo modifier to density
  const effectiveDensityValue = Math.min(0.98, Math.max(0.12, densityValue * tempoModifier));

  // Contrast
  const contrastValue = rnd(0.2, 0.9);

  features = {
    // Mode system
    primaryMode,
    secondaryModes,
    activeModes,
    modeCount,
    modeCountRarity,
    blendType,
    blendTypeLabel: blendType,

    // Composition
    voiceCount,
    voiceRarity,
    structure,
    structureRarity,
    sectionCount,
    mirrorPoint,  // Variable mirror point for palindrome (0.3-0.7)
    density,
    densityRarity,
    densityValue: effectiveDensityValue,  // Tempo-modified density
    baseDensityValue: densityValue,        // Original density before tempo
    contrastValue,

    // Visuals
    paletteName,
    palette: PALETTES[paletteName],
    paletteType: PALETTES[paletteName].type,

    // Musical aesthetics
    timeSignature: selectedTimeSignature,
    tempo: selectedTempo,
    tempoModifier,    // Affects density (0.7-1.3)
    tempoSpacing,     // Affects element spacing (0.7-1.4)

    // Time signature influence on visuals
    beatGrouping,     // Primary grouping unit (2-7)
    beatSubdivision,  // Simple (2) or compound (3)
    accentPattern,    // Relative visual weight per beat position
    isAsymmetric,     // Odd/irregular meter
    groupingCycle,    // How many groups before pattern repeats

    // Technical
    seed: hash.slice(2, 10),
    lineWeight: rnd(0.5, 2.5),
    hasSymmetry: structure === "palindrome",

    // Mode-specific flags
    hasSpiral: activeModes.includes("spiral"),
    hasSpectral: activeModes.includes("spectral"),
    hasChance: activeModes.includes("chance")
  };

  originalFeatures = { ...features };
  // Save PRNG state so setupComposition can be called deterministically
  rngStateAfterFeatures = R.getState();
  return features;
}

function setParameter(name, value) {
  hasOverrides = true;
  features[name] = value;
  return features;
}

function resetToOriginal() {
  features = { ...originalFeatures };
  hasOverrides = false;
  return features;
}

function hasModifications() { return hasOverrides; }
function getRarityCurves() { return RARITY_CURVES; }

// ============================================================
// COMPOSITION CLASSES
// ============================================================

let canvas;
// A3 landscape: 420mm × 297mm (aspect ratio √2 ≈ 1.414)
// Standard: 1587 × 1122 pixels (screen)
// Hi-res: 4961 × 3508 pixels (A3 at 300 DPI for print)
let WIDTH = 1587;
let HEIGHT = 1122;
const MARGIN = 75;  // Scaled proportionally for A3 (was 60 for 1280px)
let hiResMode = false;
let scaleFactor = 1;
let printFriendlyMode = false;  // Clean output for performers

class Voice {
  constructor(index, total, yStart, yEnd) {
    this.index = index;
    this.yStart = yStart;
    this.yEnd = yEnd;
    this.yCenter = (yStart + yEnd) / 2;
    this.height = yEnd - yStart;
    this.register = rnd();
    this.activity = rnd(0.3, 1.0);
    this.density = rnd() * features.densityValue;

    // Gestural curve parameters (set in setupComposition for gestural structure)
    this.hasGesturalCurve = false;
    this.curveAmplitude = 0;
    this.curveFrequency = 0;
    this.curvePhase = 0;

    // For voice-based blending, assign a mode
    if (features.blendType === "voiceBased" && features.activeModes.length > 1) {
      this.assignedMode = rndChoice(features.activeModes);
    } else {
      this.assignedMode = features.primaryMode;
    }
  }

  // Get y-position at given x, accounting for gestural curves
  getYAt(x, baseY) {
    if (!this.hasGesturalCurve) return baseY;
    const normalizedX = (x - MARGIN) / (WIDTH - MARGIN * 2);
    const curveOffset = Math.sin(normalizedX * this.curveFrequency * TWO_PI + this.curvePhase) * this.curveAmplitude;
    return baseY + curveOffset;
  }

  // Get curve offset at position (0-1 normalized)
  getCurveOffset(normalizedX) {
    if (!this.hasGesturalCurve) return 0;
    return Math.sin(normalizedX * this.curveFrequency * TWO_PI + this.curvePhase) * this.curveAmplitude;
  }
}

class Section {
  constructor(index, total, xStart, xEnd) {
    this.index = index;
    this.xStart = xStart;
    this.xEnd = xEnd;
    this.width = xEnd - xStart;
    this.xCenter = (xStart + xEnd) / 2;
    this.intensity = rnd();
    this.densityMod = rnd(0.5, 1.5);
    this.mirrorIndex = total - 1 - index;

    // For sectional blending, assign modes to sections
    if (features.blendType === "sectional" && features.activeModes.length > 1) {
      this.assignedMode = features.activeModes[index % features.activeModes.length];
    } else {
      this.assignedMode = features.primaryMode;
    }
  }
}

let voices = [];
let sections = [];

function setupComposition() {
  voices = [];
  sections = [];

  const voiceHeight = (HEIGHT - MARGIN * 2) / features.voiceCount;
  for (let i = 0; i < features.voiceCount; i++) {
    const yStart = MARGIN + i * voiceHeight;
    const yEnd = yStart + voiceHeight;
    voices.push(new Voice(i, features.voiceCount, yStart, yEnd));
  }

  const scoreWidth = WIDTH - MARGIN * 2;

  if (features.structure === "mathematical") {
    // Golden ratio divisions
    const phi = 1.618033988749;
    let divisions = [0];
    let remaining = 1;
    for (let i = 0; i < features.sectionCount - 1; i++) {
      remaining /= phi;
      divisions.push(1 - remaining);
    }
    divisions.push(1);

    for (let i = 0; i < divisions.length - 1; i++) {
      const xStart = MARGIN + divisions[i] * scoreWidth;
      const xEnd = MARGIN + divisions[i + 1] * scoreWidth;
      sections.push(new Section(i, divisions.length - 1, xStart, xEnd));
    }
  } else if (features.structure === "fragmentary") {
    // Irregular widths - some wide, some very narrow (interruptions)
    let divisions = [0];
    let pos = 0;
    for (let i = 0; i < features.sectionCount - 1; i++) {
      // Alternate between narrow "interruption" sections and wider sections
      const isNarrow = rndBool(0.35);
      const width = isNarrow ? rnd(0.03, 0.08) : rnd(0.10, 0.25);
      pos += width;
      if (pos < 0.95) {
        divisions.push(pos);
      }
    }
    divisions.push(1);

    // Normalize to fill space
    const total = divisions[divisions.length - 1];
    for (let i = 0; i < divisions.length; i++) {
      divisions[i] /= total;
    }

    for (let i = 0; i < divisions.length - 1; i++) {
      const xStart = MARGIN + divisions[i] * scoreWidth;
      const xEnd = MARGIN + divisions[i + 1] * scoreWidth;
      const sec = new Section(i, divisions.length - 1, xStart, xEnd);
      // Mark narrow sections with lower density for sparser content
      sec.isNarrow = (xEnd - xStart) < scoreWidth * 0.08;
      if (sec.isNarrow) sec.densityMod *= 0.5;
      sections.push(sec);
    }
  } else if (features.structure === "gestural") {
    // Gestural: minimal sections with organic flowing curves
    // Voices will have curved paths instead of straight lines
    for (let i = 0; i < features.sectionCount; i++) {
      const xStart = MARGIN + (i / features.sectionCount) * scoreWidth;
      const xEnd = MARGIN + ((i + 1) / features.sectionCount) * scoreWidth;
      sections.push(new Section(i, features.sectionCount, xStart, xEnd));
    }

    // Enable gestural curves for all voices (set after voices are created below)
    // Curve initialization happens after voice creation
  } else if (features.structure === "modular") {
    // Modular: independent blocks with gaps and borders (Earle Brown/open form style)
    // Each module is a self-contained unit that can theoretically be reordered
    const moduleCount = features.sectionCount;
    const gapRatio = 0.03;  // 3% gaps between modules
    const totalGaps = (moduleCount - 1) * gapRatio;
    const usableWidth = 1 - totalGaps;
    const moduleWidths = [];

    // Generate varied widths (modules aren't equal size)
    let totalWidth = 0;
    for (let i = 0; i < moduleCount; i++) {
      const w = rnd(0.08, 0.25);
      moduleWidths.push(w);
      totalWidth += w;
    }
    // Normalize to fill usable space
    for (let i = 0; i < moduleCount; i++) {
      moduleWidths[i] = (moduleWidths[i] / totalWidth) * usableWidth;
    }

    // Create modules with gaps
    let pos = 0;
    for (let i = 0; i < moduleCount; i++) {
      const xStart = MARGIN + pos * scoreWidth;
      const xEnd = MARGIN + (pos + moduleWidths[i]) * scoreWidth;
      const sec = new Section(i, moduleCount, xStart, xEnd);
      sec.isModule = true;  // Flag for special module rendering
      sec.moduleNumber = i + 1;  // Display number (1-indexed)
      sec.hasBorder = true;  // Modules have visible borders
      sections.push(sec);
      pos += moduleWidths[i] + gapRatio;
    }
  } else if (features.structure === "polyphonic") {
    // Polyphonic: independent voice streams with overlapping sections
    // Creates a layered contrapuntal structure where sections can overlap
    const streamCount = features.sectionCount;
    const overlapRatio = rnd(0.15, 0.35);  // How much sections can overlap

    for (let i = 0; i < streamCount; i++) {
      // Each stream has a different starting position
      const baseStart = (i / streamCount) * (1 - overlapRatio);
      const streamWidth = rnd(0.25, 0.50);  // Each stream covers 25-50% of score
      const streamEnd = Math.min(1, baseStart + streamWidth);

      const xStart = MARGIN + baseStart * scoreWidth;
      const xEnd = MARGIN + streamEnd * scoreWidth;

      const sec = new Section(i, streamCount, xStart, xEnd);
      sec.isPolyphonic = true;  // Flag for polyphonic rendering
      sec.streamNumber = i + 1;  // Stream identifier
      sec.overlapsWith = [];  // Track overlapping sections

      // Check for overlaps with previous sections
      for (let j = 0; j < sections.length; j++) {
        const other = sections[j];
        if (other.xStart < xEnd && other.xEnd > xStart) {
          sec.overlapsWith.push(j);
          if (!other.overlapsWith) other.overlapsWith = [];
          other.overlapsWith.push(i);
        }
      }

      sections.push(sec);
    }
  } else if (features.structure === "stacked") {
    // Stacked: vertical layers instead of horizontal sections
    // Creates bands that span the full width but divide vertically
    const stackCount = features.sectionCount;
    const scoreHeight = HEIGHT - MARGIN * 2;
    const gapRatio = 0.02;  // 2% gaps between stacks
    const totalGaps = (stackCount - 1) * gapRatio;
    const usableHeight = 1 - totalGaps;

    // Generate varied heights for each stack
    const stackHeights = [];
    let totalHeight = 0;
    for (let i = 0; i < stackCount; i++) {
      const h = rnd(0.15, 0.40);
      stackHeights.push(h);
      totalHeight += h;
    }
    // Normalize
    for (let i = 0; i < stackCount; i++) {
      stackHeights[i] = (stackHeights[i] / totalHeight) * usableHeight;
    }

    // Create stacked sections (full width, divided vertically)
    let yPos = 0;
    for (let i = 0; i < stackCount; i++) {
      const sec = new Section(i, stackCount, MARGIN, WIDTH - MARGIN);
      sec.isStacked = true;
      sec.stackIndex = i;
      sec.stackYStart = MARGIN + yPos * scoreHeight;
      sec.stackYEnd = MARGIN + (yPos + stackHeights[i]) * scoreHeight;
      sec.stackHeight = stackHeights[i] * scoreHeight;
      sections.push(sec);
      yPos += stackHeights[i] + gapRatio;
    }
  } else if (features.structure === "palindrome") {
    // Palindrome: sections mirror around a variable point (not always center)
    // mirrorPoint is 0.3-0.7 (where 0.5 = center)
    const mp = features.mirrorPoint;
    const leftCount = Math.ceil(features.sectionCount * mp);
    const rightCount = features.sectionCount - leftCount;

    // Create left side sections (before mirror point)
    for (let i = 0; i < leftCount; i++) {
      const leftStart = (i / leftCount) * mp;
      const leftEnd = ((i + 1) / leftCount) * mp;
      const xStart = MARGIN + leftStart * scoreWidth;
      const xEnd = MARGIN + leftEnd * scoreWidth;
      const sec = new Section(i, features.sectionCount, xStart, xEnd);
      sec.mirrorGroup = i;  // For matching mirrored content
      sections.push(sec);
    }

    // Create right side sections (after mirror point, mirrored order)
    for (let i = 0; i < rightCount; i++) {
      const rightStart = mp + (i / rightCount) * (1 - mp);
      const rightEnd = mp + ((i + 1) / rightCount) * (1 - mp);
      const xStart = MARGIN + rightStart * scoreWidth;
      const xEnd = MARGIN + rightEnd * scoreWidth;
      const sec = new Section(leftCount + i, features.sectionCount, xStart, xEnd);
      // Mirror group matches in reverse order
      sec.mirrorGroup = Math.max(0, leftCount - 1 - i);
      sec.isMirrored = true;  // Flag for mirrored content rendering
      sections.push(sec);
    }
  } else {
    // Flowing, sectioned - equal or near-equal divisions
    for (let i = 0; i < features.sectionCount; i++) {
      const variance = features.structure === "flowing" ? 0 : rnd(-0.08, 0.08);
      const xStart = MARGIN + (i / features.sectionCount + variance) * scoreWidth;
      const xEnd = MARGIN + ((i + 1) / features.sectionCount + variance) * scoreWidth;
      sections.push(new Section(i, features.sectionCount,
        Math.max(MARGIN, xStart),
        Math.min(WIDTH - MARGIN, xEnd)));
    }
  }

  // Initialize gestural curves for voices if gestural structure
  if (features.structure === "gestural") {
    for (const voice of voices) {
      voice.hasGesturalCurve = true;
      voice.curveAmplitude = rnd(10, 40) * scaleFactor;  // How much vertical movement
      voice.curveFrequency = rnd(0.5, 2.5);  // How many wave cycles across score
      voice.curvePhase = rnd(0, TWO_PI);  // Phase offset for variety
    }
  }
}

// ============================================================
// DRAWING: COMMON ELEMENTS
// ============================================================

function drawPaper() {
  // Print-friendly mode: clean white background, no effects
  if (printFriendlyMode) {
    background("#ffffff");
    return;
  }

  background(features.palette.paper);

  // Fine fiber texture - horizontal fibers like real paper
  stroke(features.palette.paperDark + "08");
  strokeWeight(0.3 * scaleFactor);
  const fiberCount = hiResMode ? 800 : 300;
  for (let i = 0; i < fiberCount; i++) {
    const y = rnd(0, HEIGHT);
    const x1 = rnd(0, WIDTH * 0.7);
    const len = rnd(20, 120) * scaleFactor;
    // Slight waviness
    const midY = y + rnd(-1, 1) * scaleFactor;
    line(x1, y, x1 + len * 0.5, midY);
    line(x1 + len * 0.5, midY, x1 + len, y + rnd(-0.5, 0.5) * scaleFactor);
  }

  // Subtle grain noise - very fine dots
  noStroke();
  const grainCount = hiResMode ? 6000 : 2000;
  for (let i = 0; i < grainCount; i++) {
    const x = rnd(0, WIDTH);
    const y = rnd(0, HEIGHT);
    fill(features.palette.paperDark + "0a");
    rect(x, y, 0.5 * scaleFactor, 0.5 * scaleFactor);
  }

  // Decorative border frame
  drawDecorativeBorder();

  // Corner ornaments
  drawCornerOrnaments();

  // Subtle foxing (age spots) - more organic shapes
  if (rndBool(0.6)) {
    drawFoxingSpots();
  }
}

function drawDecorativeBorder() {
  const borderStyle = rndInt(0, 3);
  const inset = 15 * scaleFactor;
  const innerInset = 20 * scaleFactor;

  stroke(features.palette.ink + "20");
  strokeWeight(0.5 * scaleFactor);
  noFill();

  switch (borderStyle) {
    case 0: // Double-line frame (classic engraved score)
      rect(inset, inset, WIDTH - inset * 2, HEIGHT - inset * 2);
      rect(innerInset, innerInset, WIDTH - innerInset * 2, HEIGHT - innerInset * 2);
      break;

    case 1: // Ruled margin lines
      // Top rule
      line(inset, inset, WIDTH - inset, inset);
      line(inset, inset + 3 * scaleFactor, WIDTH - inset, inset + 3 * scaleFactor);
      // Bottom rule
      line(inset, HEIGHT - inset, WIDTH - inset, HEIGHT - inset);
      line(inset, HEIGHT - inset - 3 * scaleFactor, WIDTH - inset, HEIGHT - inset - 3 * scaleFactor);
      // Side margins (dashed)
      for (let y = inset; y < HEIGHT - inset; y += 8 * scaleFactor) {
        line(inset, y, inset, min(y + 4 * scaleFactor, HEIGHT - inset));
        line(WIDTH - inset, y, WIDTH - inset, min(y + 4 * scaleFactor, HEIGHT - inset));
      }
      break;

    case 2: // Art nouveau subtle curves
      // Top ornamental line
      beginShape();
      for (let x = inset; x <= WIDTH - inset; x += 5 * scaleFactor) {
        const progress = (x - inset) / (WIDTH - inset * 2);
        const wave = sin(progress * PI * 4) * 2 * scaleFactor;
        vertex(x, inset + wave);
      }
      endShape();
      // Bottom mirror
      beginShape();
      for (let x = inset; x <= WIDTH - inset; x += 5 * scaleFactor) {
        const progress = (x - inset) / (WIDTH - inset * 2);
        const wave = sin(progress * PI * 4) * 2 * scaleFactor;
        vertex(x, HEIGHT - inset - wave);
      }
      endShape();
      break;

    case 3: // Minimal corner brackets
      const bracketLen = 40 * scaleFactor;
      // Top-left
      line(inset, inset, inset + bracketLen, inset);
      line(inset, inset, inset, inset + bracketLen);
      // Top-right
      line(WIDTH - inset, inset, WIDTH - inset - bracketLen, inset);
      line(WIDTH - inset, inset, WIDTH - inset, inset + bracketLen);
      // Bottom-left
      line(inset, HEIGHT - inset, inset + bracketLen, HEIGHT - inset);
      line(inset, HEIGHT - inset, inset, HEIGHT - inset - bracketLen);
      // Bottom-right
      line(WIDTH - inset, HEIGHT - inset, WIDTH - inset - bracketLen, HEIGHT - inset);
      line(WIDTH - inset, HEIGHT - inset, WIDTH - inset, HEIGHT - inset - bracketLen);
      break;
  }
}

function drawCornerOrnaments() {
  if (!rndBool(0.4)) return;

  const ornamentStyle = rndInt(0, 2);
  const corners = [
    { x: 8 * scaleFactor, y: 8 * scaleFactor, rot: 0 },
    { x: WIDTH - 8 * scaleFactor, y: 8 * scaleFactor, rot: HALF_PI },
    { x: WIDTH - 8 * scaleFactor, y: HEIGHT - 8 * scaleFactor, rot: PI },
    { x: 8 * scaleFactor, y: HEIGHT - 8 * scaleFactor, rot: PI + HALF_PI }
  ];

  stroke(features.palette.ink + "18");
  strokeWeight(0.6 * scaleFactor);
  noFill();

  for (const corner of corners) {
    push();
    translate(corner.x, corner.y);
    rotate(corner.rot);

    switch (ornamentStyle) {
      case 0: // Fleuron / leaf
        beginShape();
        vertex(0, 0);
        bezierVertex(4 * scaleFactor, -2 * scaleFactor, 8 * scaleFactor, -4 * scaleFactor, 10 * scaleFactor, 0);
        bezierVertex(8 * scaleFactor, 4 * scaleFactor, 4 * scaleFactor, 2 * scaleFactor, 0, 0);
        endShape();
        break;

      case 1: // Simple crosshatch
        for (let i = 0; i < 3; i++) {
          line(i * 3 * scaleFactor, 0, 0, i * 3 * scaleFactor);
        }
        break;

      case 2: // Spiral flourish
        noFill();
        beginShape();
        for (let a = 0; a < PI; a += 0.2) {
          const r = a * 3 * scaleFactor;
          vertex(cos(a) * r, sin(a) * r);
        }
        endShape();
        break;
    }

    pop();
  }
}

function drawFoxingSpots() {
  // Organic-looking age spots, not cheap circles
  const numSpots = rndInt(3, 12);

  for (let i = 0; i < numSpots; i++) {
    // Spots tend to appear near edges
    const edge = rndBool(0.7);
    let cx, cy;
    if (edge) {
      const side = rndInt(0, 3);
      const edgeDist = rnd(10, 50) * scaleFactor;
      if (side === 0) { cx = rnd(0, WIDTH); cy = edgeDist; }
      else if (side === 1) { cx = rnd(0, WIDTH); cy = HEIGHT - edgeDist; }
      else if (side === 2) { cx = edgeDist; cy = rnd(0, HEIGHT); }
      else { cx = WIDTH - edgeDist; cy = rnd(0, HEIGHT); }
    } else {
      cx = rnd(MARGIN, WIDTH - MARGIN);
      cy = rnd(MARGIN, HEIGHT - MARGIN);
    }

    // Irregular organic shape using multiple overlapping forms
    const baseSize = rnd(4, 15) * scaleFactor;
    const alpha = rnd(8, 18);

    noStroke();
    fill(features.palette.faded + Math.floor(alpha).toString(16).padStart(2, '0'));

    // Main spot with slight irregularity
    push();
    translate(cx, cy);
    rotate(rnd(0, TWO_PI));

    beginShape();
    for (let a = 0; a < TWO_PI; a += 0.3) {
      const r = baseSize * (0.7 + rnd(0, 0.5) + sin(a * 3) * 0.2);
      vertex(cos(a) * r, sin(a) * r);
    }
    endShape(CLOSE);
    pop();

    // Satellite micro-spots
    if (rndBool(0.5)) {
      for (let j = 0; j < rndInt(1, 4); j++) {
        const angle = rnd(0, TWO_PI);
        const dist = rnd(baseSize, baseSize * 2);
        const sx = cx + cos(angle) * dist;
        const sy = cy + sin(angle) * dist;
        const ss = rnd(1, 3) * scaleFactor;
        ellipse(sx, sy, ss, ss * rnd(0.8, 1.2));
      }
    }
  }
}

function drawStaves() {
  stroke(features.palette.faded + "35");
  strokeWeight(0.5 * scaleFactor);

  if (features.structure === "stacked") {
    // For stacked structure, draw staves within each section's vertical bounds
    for (const section of sections) {
      if (!section.isStacked) continue;

      const stackHeight = section.stackYEnd - section.stackYStart;
      const voiceCount = voices.length;

      for (let v = 0; v < voiceCount; v++) {
        // Calculate voice bounds within this stack
        const voiceHeight = stackHeight / voiceCount;
        const voiceYStart = section.stackYStart + v * voiceHeight;
        const staffSpacing = voiceHeight / 6;

        stroke(features.palette.faded + "35");
        strokeWeight(0.5 * scaleFactor);
        for (let i = 1; i <= 5; i++) {
          const y = voiceYStart + i * staffSpacing;
          line(MARGIN, y, WIDTH - MARGIN, y);
        }
      }

      // Draw horizontal dividers between stacked sections
      if (section.stackIndex > 0) {
        stroke(features.palette.ink + "30");
        strokeWeight(1.5 * scaleFactor);
        line(MARGIN, section.stackYStart, WIDTH - MARGIN, section.stackYStart);
      }
    }
  } else {
    // Normal staff drawing for non-stacked structures
    for (const voice of voices) {
      const staffSpacing = voice.height / 6;
      for (let i = 1; i <= 5; i++) {
        const y = voice.yStart + i * staffSpacing;
        line(MARGIN, y, WIDTH - MARGIN, y);
      }
    }

    if (features.structure !== "flowing" && sections.length > 1) {
      for (let i = 1; i < sections.length; i++) {
        const x = sections[i].xStart;
        const sec = sections[i];

        if (features.structure === "fragmentary" && sec.isNarrow) {
          // Solid bold lines for narrow "interruption" sections
          stroke(features.palette.ink + "40");
          strokeWeight(2 * scaleFactor);
          line(x, MARGIN, x, HEIGHT - MARGIN);
        } else {
          // Dashed lines for normal section divisions
          stroke(features.palette.ink + "25");
          strokeWeight(1 * scaleFactor);
          for (let y = MARGIN; y < HEIGHT - MARGIN; y += 10 * scaleFactor) {
            line(x, y, x, y + 5 * scaleFactor);
          }
        }
      }
    }
  }
}

function drawVignette() {
  // Skip vignette in print-friendly mode
  if (printFriendlyMode) return;

  noStroke();
  const vignetteColor = color(features.palette.paperDark);

  for (let i = 0; i < 40; i++) {
    const alpha = map(i, 0, 40, 25, 0);
    fill(red(vignetteColor), green(vignetteColor), blue(vignetteColor), alpha);
    const thickness = scaleFactor;
    rect(0, i * thickness, WIDTH, thickness);
    rect(0, HEIGHT - (i + 1) * thickness, WIDTH, thickness);
    rect(i * thickness, 0, thickness, HEIGHT);
    rect(WIDTH - (i + 1) * thickness, 0, thickness, HEIGHT);
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: ARTIKULATION
// ============================================================

function drawArtikulationColorBlocks(voice, section) {
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55", "#ffaa00", "#9944aa", "#ff6644"];
  const numBlocks = Math.max(1, Math.floor(rnd(3, 10) * features.densityValue * section.densityMod));

  for (let i = 0; i < numBlocks; i++) {
    const c = rndChoice(colors);
    const x = rnd(section.xStart + 5, section.xEnd - 30);
    const y = rnd(voice.yStart + 5, voice.yEnd - 15);
    const w = rnd(15, 60) * scaleFactor;
    const h = rnd(8, 25) * scaleFactor;

    const blockType = rndInt(0, 4);

    fill(c + "cc");
    noStroke();

    if (blockType === 0) {
      // Rectangle
      rect(x, y, w, h, 2 * scaleFactor);
    } else if (blockType === 1) {
      // Rounded blob
      ellipse(x + w/2, y + h/2, w, h);
    } else if (blockType === 2) {
      // Tapered shape
      beginShape();
      vertex(x, y + h/2);
      vertex(x + w * 0.3, y);
      vertex(x + w, y + h * 0.3);
      vertex(x + w, y + h * 0.7);
      vertex(x + w * 0.3, y + h);
      endShape(CLOSE);
    } else if (blockType === 3) {
      // Jagged cluster
      beginShape();
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * TWO_PI;
        const r = (w/3 + rnd(-5, 5)) * scaleFactor;
        vertex(x + w/2 + cos(angle) * r, y + h/2 + sin(angle) * r * 0.6);
      }
      endShape(CLOSE);
    } else {
      // Stacked rectangles
      for (let j = 0; j < 3; j++) {
        rect(x + j * 3, y + j * (h/3), w * 0.7, h/3, 1);
      }
    }
  }
}

function drawArtikulationClusters(voice, section) {
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55", "#ffaa00"];
  const numClusters = Math.floor(rnd(1, 3) * features.densityValue);

  for (let c = 0; c < numClusters; c++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 15, voice.yEnd - 15);
    const numMarks = Math.floor(rnd(15, 50) * features.densityValue);

    // Spread marks with time signature grouping
    const spreadX = 50 * scaleFactor;

    for (let i = 0; i < numMarks; i++) {
      const col = rndChoice(colors);
      // Apply accent-based positioning - stronger beats cluster tighter
      const accent = getAccentWeight(i);
      const spreadMod = 1.5 - accent * 0.8;  // Strong beats = tighter clusters
      const mx = cx + rndGaussian(0, spreadX * spreadMod);
      const my = cy + rndGaussian(0, 12 * scaleFactor);
      // Size influenced by accent pattern
      const baseSize = rnd(2, 8) * scaleFactor;
      const size = getAccentedSize(baseSize, i);

      // Opacity stronger on accented positions
      const opacityHex = Math.floor(0x80 + accent * 0x40).toString(16).padStart(2, '0');
      fill(col + opacityHex);
      noStroke();

      if (rndBool(0.5)) {
        ellipse(mx, my, size, size * 0.7);
      } else {
        rect(mx, my, size, size * 0.5);
      }
    }
  }
}

// New Artikulation functions v3.4.0

function drawArtikulationCallResponse(voice, section) {
  // Call and response patterns between color groups (Wehinger's dialogue structures)
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55", "#ffaa00", "#9944aa", "#ff6644"];
  const numPairs = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  for (let i = 0; i < numPairs; i++) {
    const callColor = rndChoice(colors);
    const responseColor = rndChoice(colors.filter(c => c !== callColor));

    // Call element (left side)
    const callX = rnd(section.xStart + 10, section.xStart + (section.xEnd - section.xStart) * 0.4);
    const callY = rnd(voice.yStart + 10, voice.yEnd - 20);
    const callW = rnd(20, 50) * scaleFactor;
    const callH = rnd(10, 25) * scaleFactor;

    fill(callColor + "cc");
    noStroke();
    beginShape();
    vertex(callX, callY + callH / 2);
    vertex(callX + callW * 0.2, callY);
    vertex(callX + callW, callY + callH * 0.2);
    vertex(callX + callW * 1.1, callY + callH / 2);
    vertex(callX + callW, callY + callH * 0.8);
    vertex(callX + callW * 0.2, callY + callH);
    endShape(CLOSE);

    // Response element (right side, slightly delayed/offset)
    const responseX = callX + callW + rnd(30, 80) * scaleFactor;
    const responseY = callY + rnd(-10, 10) * scaleFactor;
    const responseW = rnd(15, 40) * scaleFactor;
    const responseH = rnd(8, 20) * scaleFactor;

    fill(responseColor + "cc");
    beginShape();
    vertex(responseX, responseY);
    vertex(responseX + responseW, responseY + responseH * 0.3);
    vertex(responseX + responseW * 0.8, responseY + responseH);
    vertex(responseX - responseW * 0.1, responseY + responseH * 0.7);
    endShape(CLOSE);

    // Connecting dotted line
    stroke(features.palette.inkLight || features.palette.ink + "44");
    strokeWeight(0.5 * scaleFactor);
    drawingContext.setLineDash([3 * scaleFactor, 3 * scaleFactor]);
    line(callX + callW * 1.1, callY + callH / 2, responseX, responseY + responseH / 2);
    drawingContext.setLineDash([]);
  }
}

function drawArtikulationTimbralStripes(voice, section) {
  // Horizontal stripes for sustained electronic timbres
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55", "#ffaa00"];
  const numStripes = Math.max(1, Math.floor(rnd(2, 6) * features.densityValue));

  noStroke();
  for (let i = 0; i < numStripes; i++) {
    const col = rndChoice(colors);
    const x = rnd(section.xStart, section.xEnd - 100);
    const y = rnd(voice.yStart + 5, voice.yEnd - 10);
    const w = rnd(60, 180) * scaleFactor;
    const h = rnd(4, 12) * scaleFactor;

    // Gradient stripe
    for (let j = 0; j < w; j += 2 * scaleFactor) {
      const alpha = map(j, 0, w, 0.2, 0.8);
      fill(col + hex(Math.floor(alpha * 255), 2));
      rect(x + j, y, 3 * scaleFactor, h);
    }
  }
}

function drawArtikulationGlitchPatterns(voice, section) {
  // Short stuttering electronic bursts (Ligeti's electronic artifacts)
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#ffaa00"];
  const numBursts = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  for (let i = 0; i < numBursts; i++) {
    const col = rndChoice(colors);
    const x = rnd(section.xStart + 10, section.xEnd - 40);
    const y = rnd(voice.yStart + 5, voice.yEnd - 15);
    const burstWidth = rnd(20, 60) * scaleFactor;
    const numGlitches = rndInt(4, 12);

    for (let j = 0; j < numGlitches; j++) {
      const gx = x + rnd(0, burstWidth);
      const gy = y + rnd(-5, 5) * scaleFactor;
      const gw = rnd(1, 6) * scaleFactor;
      const gh = rnd(3, 15) * scaleFactor;

      fill(col + "bb");
      noStroke();
      rect(gx, gy, gw, gh);
    }
  }
}

function drawArtikulationSpeechFragments(voice, section) {
  // Speech-like contour lines (Ligeti's phonetic influences)
  const numFragments = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1.5 * scaleFactor);
  noFill();

  for (let i = 0; i < numFragments; i++) {
    const startX = rnd(section.xStart + 10, section.xEnd - 80);
    const baseY = rnd(voice.yStart + 15, voice.yEnd - 15);
    const fragmentW = rnd(40, 100) * scaleFactor;

    beginShape();
    const numPoints = rndInt(6, 12);
    for (let j = 0; j <= numPoints; j++) {
      const px = startX + (j / numPoints) * fragmentW;
      // Speech-like ups and downs
      const py = baseY + sin(j * rnd(0.5, 2)) * rnd(5, 15) * scaleFactor;
      curveVertex(px, py);
    }
    endShape();
  }
}

function drawArtikulationDensityClouds(voice, section) {
  // Gaussian density clouds with color mixing
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55", "#ffaa00", "#9944aa"];
  const numClouds = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  for (let c = 0; c < numClouds; c++) {
    const cx = rnd(section.xStart + 40, section.xEnd - 40);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const cloudColors = [rndChoice(colors), rndChoice(colors)];
    const numParticles = Math.floor(rnd(40, 100) * features.densityValue);

    noStroke();
    for (let i = 0; i < numParticles; i++) {
      const col = rndChoice(cloudColors);
      const px = cx + rndGaussian(0, 30 * scaleFactor);
      const py = cy + rndGaussian(0, 15 * scaleFactor);
      const size = rnd(1, 4) * scaleFactor;
      const alpha = rnd(0.3, 0.7);

      fill(col + hex(Math.floor(alpha * 255), 2));
      ellipse(px, py, size, size);
    }
  }
}

function drawArtikulationAttackDecay(voice, section) {
  // Attack/decay envelope shapes
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55", "#ffaa00"];
  const numEnvelopes = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  for (let i = 0; i < numEnvelopes; i++) {
    const col = rndChoice(colors);
    const x = rnd(section.xStart + 10, section.xEnd - 60);
    const y = rnd(voice.yStart + 10, voice.yEnd - 20);
    const w = rnd(30, 80) * scaleFactor;
    const h = rnd(15, 30) * scaleFactor;

    // Attack time (sharp or slow)
    const attackRatio = rnd(0.05, 0.3);

    fill(col + "99");
    noStroke();
    beginShape();
    vertex(x, y + h); // Start at bottom
    vertex(x + w * attackRatio, y); // Attack peak
    // Decay curve
    for (let j = 0; j <= 10; j++) {
      const px = x + w * attackRatio + (w * (1 - attackRatio)) * (j / 10);
      const decay = pow(1 - j / 10, 0.5); // Exponential decay
      vertex(px, y + h * (1 - decay));
    }
    vertex(x + w, y + h);
    endShape(CLOSE);
  }
}

function drawArtikulationConnectors(voice, section) {
  // Lines connecting related sound events
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55"];
  const numConnections = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  for (let i = 0; i < numConnections; i++) {
    const col = rndChoice(colors);
    const x1 = rnd(section.xStart + 20, section.xEnd - 100);
    const y1 = rnd(voice.yStart + 10, voice.yEnd - 10);
    const x2 = x1 + rnd(50, 150) * scaleFactor;
    const y2 = rnd(voice.yStart + 10, voice.yEnd - 10);

    // Small shapes at endpoints
    fill(col + "cc");
    noStroke();
    ellipse(x1, y1, 8 * scaleFactor, 6 * scaleFactor);
    ellipse(x2, y2, 8 * scaleFactor, 6 * scaleFactor);

    // Curved connector
    stroke(col + "88");
    strokeWeight(1 * scaleFactor);
    noFill();
    const midX = (x1 + x2) / 2;
    const midY = Math.min(y1, y2) - rnd(10, 25) * scaleFactor;
    bezier(x1, y1, midX, midY, midX, midY, x2, y2);
  }
}

function drawArtikulationWedges(voice, section) {
  // Crescendo/diminuendo wedges
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#ffaa00"];
  const numWedges = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  for (let i = 0; i < numWedges; i++) {
    const col = rndChoice(colors);
    const x = rnd(section.xStart + 10, section.xEnd - 80);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const w = rnd(40, 100) * scaleFactor;
    const h = rnd(12, 25) * scaleFactor;
    const isCrescendo = rndBool(0.5);

    fill(col + "88");
    noStroke();
    beginShape();
    if (isCrescendo) {
      vertex(x, y);
      vertex(x + w, y - h / 2);
      vertex(x + w, y + h / 2);
    } else {
      vertex(x, y - h / 2);
      vertex(x, y + h / 2);
      vertex(x + w, y);
    }
    endShape(CLOSE);
  }
}

function drawArtikulationInterrupted(voice, section) {
  // Interrupted/fragmented elements (electronic stuttering)
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55", "#ffaa00"];
  const numFragments = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  for (let i = 0; i < numFragments; i++) {
    const col = rndChoice(colors);
    const startX = rnd(section.xStart + 10, section.xEnd - 100);
    const y = rnd(voice.yStart + 10, voice.yEnd - 15);
    const totalW = rnd(60, 120) * scaleFactor;
    const h = rnd(8, 18) * scaleFactor;
    const numSegments = rndInt(3, 7);

    fill(col + "aa");
    noStroke();

    let x = startX;
    for (let j = 0; j < numSegments; j++) {
      const segW = totalW / numSegments * rnd(0.4, 0.8);
      rect(x, y, segW, h, 2 * scaleFactor);
      x += totalW / numSegments;
    }
  }
}

function drawArtikulationOverlaps(voice, section) {
  // Overlapping colored transparent regions
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55", "#ffaa00", "#9944aa"];
  const numOverlaps = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  noStroke();
  for (let i = 0; i < numOverlaps; i++) {
    const col = rndChoice(colors);
    const x = rnd(section.xStart + 10, section.xEnd - 60);
    const y = rnd(voice.yStart + 5, voice.yEnd - 25);
    const w = rnd(40, 100) * scaleFactor;
    const h = rnd(20, 40) * scaleFactor;

    fill(col + "44");
    beginShape();
    const numVertices = rndInt(5, 8);
    for (let j = 0; j < numVertices; j++) {
      const angle = (j / numVertices) * TWO_PI;
      const r = (j % 2 === 0 ? w / 2 : w / 3) + rnd(-5, 5) * scaleFactor;
      vertex(x + w / 2 + cos(angle) * r, y + h / 2 + sin(angle) * r * 0.6);
    }
    endShape(CLOSE);
  }
}

function drawArtikulationTextureGradient(voice, section) {
  // Textural density gradients
  const col = rndChoice(features.palette.colors || ["#cc3333", "#3366cc"]);
  const numGradients = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  for (let g = 0; g < numGradients; g++) {
    const startX = rnd(section.xStart + 10, section.xEnd - 100);
    const y = rnd(voice.yStart + 10, voice.yEnd - 20);
    const w = rnd(80, 150) * scaleFactor;
    const h = rnd(15, 30) * scaleFactor;

    noStroke();
    for (let i = 0; i < 50; i++) {
      const t = i / 50;
      const density = sin(t * PI); // Dense in middle, sparse at edges

      if (rnd(0, 1) < density) {
        const px = startX + t * w;
        const py = y + rnd(-h / 2, h / 2);
        const size = rnd(1, 3) * scaleFactor * density;
        fill(col + hex(Math.floor(density * 200), 2));
        ellipse(px, py, size, size);
      }
    }
  }
}

function drawArtikulationPulsation(voice, section) {
  // Rhythmic pulsing elements
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#ffaa00"];
  const col = rndChoice(colors);
  const numPulses = Math.max(3, Math.floor(rnd(5, 12) * features.densityValue));
  const startX = rnd(section.xStart + 10, section.xEnd - 150);
  const y = rnd(voice.yStart + 15, voice.yEnd - 15);
  const spacing = rnd(10, 20) * scaleFactor;

  noStroke();
  for (let i = 0; i < numPulses; i++) {
    const size = rnd(4, 10) * scaleFactor;
    const alpha = rndBool(0.3) ? 0.9 : rnd(0.4, 0.7); // Some accented
    fill(col + hex(Math.floor(alpha * 255), 2));
    ellipse(startX + i * spacing, y, size, size * 0.8);
  }
}

function drawArtikulationMorphing(voice, section) {
  // Shapes that morph/transform across time
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55"];
  const col = rndChoice(colors);
  const x = rnd(section.xStart + 10, section.xEnd - 120);
  const y = rnd(voice.yStart + 15, voice.yEnd - 15);
  const w = rnd(80, 140) * scaleFactor;
  const h = rnd(15, 30) * scaleFactor;

  fill(col + "77");
  noStroke();
  beginShape();
  // Top edge morphs from angular to smooth
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const px = x + t * w;
    const angularity = 1 - t; // Angular at start, smooth at end
    const py = y - h / 2 + (angularity > 0.5 ? (i % 2) * h * 0.3 : sin(t * PI * 2) * h * 0.2);
    vertex(px, py);
  }
  // Bottom edge
  for (let i = 20; i >= 0; i--) {
    const t = i / 20;
    const px = x + t * w;
    vertex(px, y + h / 2);
  }
  endShape(CLOSE);
}

function drawArtikulationStaticBursts(voice, section) {
  // Radio static / white noise burst patterns
  const numBursts = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));
  const colors = features.palette.colors || ["#333333", "#666666", "#999999"];

  for (let b = 0; b < numBursts; b++) {
    const cx = rnd(section.xStart + 20, section.xEnd - 20);
    const cy = rnd(voice.yStart + 15, voice.yEnd - 15);
    const burstW = rnd(20, 50) * scaleFactor;
    const burstH = rnd(10, 25) * scaleFactor;
    const numDots = rndInt(30, 80);

    noStroke();
    for (let i = 0; i < numDots; i++) {
      const col = rndChoice(colors);
      fill(col + "88");
      const px = cx + rnd(-burstW / 2, burstW / 2);
      const py = cy + rnd(-burstH / 2, burstH / 2);
      const size = rnd(0.5, 2) * scaleFactor;
      rect(px, py, size, size);
    }
  }
}

function drawArtikulationTimbreLegend(voice, section) {
  // Legend-like labels for different timbres (Wehinger's notation key)
  const colors = features.palette.colors ||
    ["#cc3333", "#3366cc", "#33aa55", "#ffaa00"];
  const timbres = ["I", "II", "III", "IV", "A", "B", "α", "β"];

  if (rndBool(0.4)) {
    const x = rnd(section.xStart + 10, section.xEnd - 40);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const col = rndChoice(colors);
    const timbre = rndChoice(timbres);

    // Small colored box with label
    fill(col + "cc");
    noStroke();
    rect(x, y - 5 * scaleFactor, 12 * scaleFactor, 10 * scaleFactor, 2);

    fill(features.palette.ink);
    textSize(6 * scaleFactor);
    textAlign(LEFT, CENTER);
    text(timbre, x + 15 * scaleFactor, y);
  }
}

function drawArtikulationVerticalSync(voice, section) {
  // Vertical alignment markers for simultaneous events
  const numMarkers = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.inkLight || features.palette.ink + "44");
  strokeWeight(0.5 * scaleFactor);
  drawingContext.setLineDash([2 * scaleFactor, 4 * scaleFactor]);

  for (let i = 0; i < numMarkers; i++) {
    const x = rnd(section.xStart + 30, section.xEnd - 30);
    line(x, voice.yStart + 5, x, voice.yEnd - 5);
  }
  drawingContext.setLineDash([]);
}

function drawArtikulationElectronicMotifs(voice, section) {
  // Recurring electronic motif patterns (sine, square, saw waves)
  const numMotifs = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  noFill();

  for (let m = 0; m < numMotifs; m++) {
    const x = rnd(section.xStart + 10, section.xEnd - 80);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const w = rnd(40, 80) * scaleFactor;
    const h = rnd(8, 15) * scaleFactor;
    const waveType = rndInt(0, 3);

    beginShape();
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const px = x + t * w;
      let py;

      if (waveType === 0) {
        // Sine wave
        py = y + sin(t * TWO_PI * 2) * h / 2;
      } else if (waveType === 1) {
        // Square wave
        py = y + ((Math.floor(t * 4) % 2) === 0 ? -h / 2 : h / 2);
      } else {
        // Sawtooth
        py = y + ((t * 4) % 1 - 0.5) * h;
      }
      vertex(px, py);
    }
    endShape();
  }
}

function drawArtikulationSpatialPanning(voice, section) {
  // Left/right spatial panning indicators
  const numIndicators = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));
  const colors = features.palette.colors || ["#cc3333", "#3366cc"];

  for (let i = 0; i < numIndicators; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 60);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const w = rnd(30, 60) * scaleFactor;
    const isLeftToRight = rndBool(0.5);

    // Arrow showing pan direction
    const col = rndChoice(colors);
    stroke(col + "aa");
    strokeWeight(2 * scaleFactor);

    if (isLeftToRight) {
      line(x, y, x + w, y);
      line(x + w - 5 * scaleFactor, y - 4 * scaleFactor, x + w, y);
      line(x + w - 5 * scaleFactor, y + 4 * scaleFactor, x + w, y);
    } else {
      line(x + w, y, x, y);
      line(x + 5 * scaleFactor, y - 4 * scaleFactor, x, y);
      line(x + 5 * scaleFactor, y + 4 * scaleFactor, x, y);
    }

    // L/R labels
    fill(features.palette.ink + "66");
    noStroke();
    textSize(5 * scaleFactor);
    textAlign(CENTER, CENTER);
    text("L", x - 8 * scaleFactor, y);
    text("R", x + w + 8 * scaleFactor, y);
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: UPIC
// ============================================================

function drawUpicArcs(voice, section) {
  const numArcs = Math.max(1, Math.floor(rnd(3, 12) * features.densityValue * section.densityMod));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  for (let i = 0; i < numArcs; i++) {
    const startX = rnd(section.xStart, section.xEnd - 80);
    const endX = rnd(startX + 40, Math.min(startX + 200, section.xEnd));
    const startY = rnd(voice.yStart + 10, voice.yEnd - 10);
    const endY = rnd(voice.yStart + 10, voice.yEnd - 10);

    const arcType = rndInt(0, 3);

    if (arcType === 0) {
      // Horizontal (steady pitch)
      const wobble = rnd(2, 8) * scaleFactor;
      beginShape();
      for (let x = startX; x <= endX; x += 5 * scaleFactor) {
        vertex(x, startY + rndGaussian(0, wobble * 0.3));
      }
      endShape();
    } else if (arcType === 1) {
      // Oblique (glissando)
      line(startX, startY, endX, endY);
    } else if (arcType === 2) {
      // Curved glissando
      const cx1 = rnd(startX, endX);
      const cy1 = rnd(voice.yStart, voice.yEnd);
      const cx2 = rnd(startX, endX);
      const cy2 = rnd(voice.yStart, voice.yEnd);
      bezier(startX, startY, cx1, cy1, cx2, cy2, endX, endY);
    } else {
      // Siren sweep (rapid oscillation)
      beginShape();
      for (let x = startX; x <= endX; x += 3 * scaleFactor) {
        const progress = (x - startX) / (endX - startX);
        const baseY = lerp(startY, endY, progress);
        const osc = sin(progress * TWO_PI * rnd(2, 6)) * 15 * scaleFactor;
        vertex(x, baseY + osc);
      }
      endShape();
    }

    // Parallel lines (Xenakis signature)
    if (rndBool(0.25)) {
      const offset = rnd(4, 10) * scaleFactor;
      stroke(features.palette.ink + "88");
      if (arcType === 1) {
        line(startX, startY + offset, endX, endY + offset);
      }
      stroke(features.palette.ink);
    }
  }
}

function drawUpicRuledLines(voice, section) {
  const numLines = Math.floor(rnd(2, 6) * features.densityValue);

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 1.5 * scaleFactor);

  for (let i = 0; i < numLines; i++) {
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const startX = rnd(section.xStart, section.xStart + section.width * 0.3);
    const endX = rnd(section.xEnd - section.width * 0.3, section.xEnd);

    line(startX, y, endX, y);

    // Add termination marks
    strokeWeight(features.lineWeight * 0.5 * scaleFactor);
    line(startX, y - 5 * scaleFactor, startX, y + 5 * scaleFactor);
    line(endX, y - 5 * scaleFactor, endX, y + 5 * scaleFactor);
    strokeWeight(features.lineWeight * 1.5 * scaleFactor);
  }
}

// New UPIC functions v3.5.0

function drawUpicGlissandiBands(voice, section) {
  // Multiple parallel glissandi (Metastaseis style)
  const numBands = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  for (let b = 0; b < numBands; b++) {
    const startX = rnd(section.xStart + 10, section.xEnd - 120);
    const endX = startX + rnd(80, 150) * scaleFactor;
    const startY = rnd(voice.yStart + 10, voice.yEnd - 40);
    const endY = rnd(voice.yStart + 10, voice.yEnd - 10);
    const numLines = rndInt(3, 8);
    const spread = rnd(15, 35) * scaleFactor;

    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * 0.8 * scaleFactor);
    noFill();

    for (let i = 0; i < numLines; i++) {
      const offset = (i / (numLines - 1) - 0.5) * spread;
      beginShape();
      for (let t = 0; t <= 1; t += 0.05) {
        const x = lerp(startX, endX, t);
        const y = lerp(startY + offset, endY + offset * rnd(0.5, 1.5), t);
        vertex(x, y);
      }
      endShape();
    }
  }
}

function drawUpicDensityMass(voice, section) {
  // Dense texture masses (stochastic clouds like Pithoprakta)
  const numMasses = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  for (let m = 0; m < numMasses; m++) {
    const cx = rnd(section.xStart + 40, section.xEnd - 40);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const massW = rnd(60, 120) * scaleFactor;
    const massH = rnd(30, 50) * scaleFactor;
    const numStrokes = Math.floor(rnd(40, 100) * features.densityValue);

    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * 0.5 * scaleFactor);

    for (let i = 0; i < numStrokes; i++) {
      const x1 = cx + rndGaussian(0, massW / 3);
      const y1 = cy + rndGaussian(0, massH / 3);
      const angle = rnd(0, TWO_PI);
      const len = rnd(3, 15) * scaleFactor;
      line(x1, y1, x1 + cos(angle) * len, y1 + sin(angle) * len);
    }
  }
}

function drawUpicGraphPaper(voice, section) {
  // Grid overlay like original UPIC screen
  stroke(features.palette.ink + "22");
  strokeWeight(0.5 * scaleFactor);

  const gridSize = rnd(15, 25) * scaleFactor;

  // Vertical lines
  for (let x = section.xStart; x <= section.xEnd; x += gridSize) {
    line(x, voice.yStart, x, voice.yEnd);
  }
  // Horizontal lines
  for (let y = voice.yStart; y <= voice.yEnd; y += gridSize) {
    line(section.xStart, y, section.xEnd, y);
  }

  // Thicker lines at intervals
  stroke(features.palette.ink + "44");
  strokeWeight(1 * scaleFactor);
  for (let x = section.xStart; x <= section.xEnd; x += gridSize * 4) {
    line(x, voice.yStart, x, voice.yEnd);
  }
}

function drawUpicPressureStrokes(voice, section) {
  // Variable pressure/thickness strokes
  const numStrokes = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  noFill();

  for (let i = 0; i < numStrokes; i++) {
    const startX = rnd(section.xStart + 10, section.xEnd - 80);
    const endX = startX + rnd(40, 100) * scaleFactor;
    const startY = rnd(voice.yStart + 10, voice.yEnd - 10);
    const endY = rnd(voice.yStart + 10, voice.yEnd - 10);

    // Draw with varying thickness
    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const x = lerp(startX, endX, t);
      const y = lerp(startY, endY, t);
      // Pressure varies along stroke
      const pressure = sin(t * PI) * 3 + 1;
      stroke(features.palette.ink);
      strokeWeight(features.lineWeight * pressure * scaleFactor);
      if (t === 0) {
        beginShape();
        vertex(x, y);
      } else {
        vertex(x, y);
      }
    }
    endShape();
  }
}

function drawUpicStochasticPoints(voice, section) {
  // Probabilistically distributed points (Xenakis stochastic music)
  // Now with time signature influence on density distribution
  const numPoints = Math.floor(rnd(30, 100) * features.densityValue);
  const distribution = rndInt(0, 3); // 0=uniform, 1=gaussian, 2=exponential

  noStroke();

  // Divide section by beat grouping for density modulation
  const beatGrouping = features.beatGrouping || 4;
  const beatWidth = (section.xEnd - section.xStart) / beatGrouping;

  for (let i = 0; i < numPoints; i++) {
    let x, y;

    if (distribution === 0) {
      // Uniform
      x = rnd(section.xStart, section.xEnd);
      y = rnd(voice.yStart, voice.yEnd);
    } else if (distribution === 1) {
      // Gaussian (clustered) - cluster around beat positions
      const beatPos = i % beatGrouping;
      const beatCenter = section.xStart + (beatPos + 0.5) * beatWidth;
      const accent = getAccentWeight(beatPos);
      // Stronger beats have tighter clusters
      const spread = beatWidth * (0.8 - accent * 0.5);
      x = beatCenter + rndGaussian(0, spread);
      const cy = (voice.yStart + voice.yEnd) / 2;
      y = cy + rndGaussian(0, voice.height / 4);
    } else {
      // Exponential (sparse to dense)
      x = section.xStart + pow(rnd(0, 1), 2) * section.width;
      y = rnd(voice.yStart, voice.yEnd);
    }

    // Size influenced by position in beat pattern
    const beatPos = Math.floor((x - section.xStart) / beatWidth) % beatGrouping;
    const accent = getAccentWeight(beatPos);
    const baseSize = rnd(1, 4) * scaleFactor;
    const size = baseSize * (0.6 + accent * 0.6);

    // Opacity follows accent
    const opacityHex = Math.floor(0x60 + accent * 0x60).toString(16).padStart(2, '0');
    fill(features.palette.ink + opacityHex);
    ellipse(x, y, size, size);
  }
}

function drawUpicMathCurves(voice, section) {
  // Mathematical curves (parabolas, hyperbolas, exponentials)
  const numCurves = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  for (let c = 0; c < numCurves; c++) {
    const curveType = rndInt(0, 4);
    const startX = rnd(section.xStart + 10, section.xEnd - 100);
    const w = rnd(60, 120) * scaleFactor;
    const baseY = rnd(voice.yStart + 20, voice.yEnd - 20);
    const amplitude = rnd(15, 35) * scaleFactor;

    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const x = startX + t * w;
      let y;

      if (curveType === 0) {
        // Parabola
        y = baseY - amplitude * 4 * t * (1 - t);
      } else if (curveType === 1) {
        // Exponential growth
        y = baseY - amplitude * (exp(t * 2) - 1) / (exp(2) - 1);
      } else if (curveType === 2) {
        // Logarithmic
        y = baseY - amplitude * log(1 + t * 9) / log(10);
      } else {
        // Hyperbolic
        y = baseY - amplitude / (t + 0.2);
      }

      vertex(x, constrain(y, voice.yStart, voice.yEnd));
    }
    endShape();
  }
}

function drawUpicArborescences(voice, section) {
  // Tree-like branching structures (Xenakis arborescences)
  const numTrees = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let t = 0; t < numTrees; t++) {
    const rootX = rnd(section.xStart + 30, section.xEnd - 30);
    const rootY = rnd(voice.yStart + voice.height * 0.4, voice.yEnd - 10);
    const maxDepth = rndInt(3, 5);

    function drawBranch(x, y, angle, depth, len) {
      if (depth > maxDepth || len < 3) return;

      strokeWeight(features.lineWeight * (1 - depth * 0.15) * scaleFactor);
      const endX = x + cos(angle) * len * scaleFactor;
      const endY = y + sin(angle) * len * scaleFactor;

      line(x, y, endX, endY);

      // Branch splits
      const numBranches = rndInt(2, 3);
      for (let i = 0; i < numBranches; i++) {
        const newAngle = angle + rnd(-PI / 3, PI / 3);
        const newLen = len * rnd(0.5, 0.8);
        drawBranch(endX, endY, newAngle, depth + 1, newLen);
      }
    }

    drawBranch(rootX, rootY, -PI / 2, 0, rnd(20, 40));
  }
}

function drawUpicPolytopes(voice, section) {
  // Geometric spatial structures (inspired by Xenakis Polytopes)
  const numPolytopes = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 0.8 * scaleFactor);
  noFill();

  for (let p = 0; p < numPolytopes; p++) {
    const cx = rnd(section.xStart + 40, section.xEnd - 40);
    const cy = rnd(voice.yStart + 25, voice.yEnd - 25);
    const numVertices = rndInt(4, 8);
    const radius = rnd(20, 40) * scaleFactor;
    const vertices = [];

    // Generate vertices
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * TWO_PI + rnd(-0.2, 0.2);
      const r = radius * rnd(0.7, 1.3);
      vertices.push({
        x: cx + cos(angle) * r,
        y: cy + sin(angle) * r * 0.6
      });
    }

    // Connect all vertices (complete graph style)
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        if (rndBool(0.6)) {
          line(vertices[i].x, vertices[i].y, vertices[j].x, vertices[j].y);
        }
      }
    }
  }
}

function drawUpicGranularCloud(voice, section) {
  // Dense granular synthesis representation
  const cx = rnd(section.xStart + 50, section.xEnd - 50);
  const cy = rnd(voice.yStart + 25, voice.yEnd - 25);
  const cloudW = rnd(80, 150) * scaleFactor;
  const cloudH = rnd(30, 50) * scaleFactor;
  const numGrains = Math.floor(rnd(100, 300) * features.densityValue);

  noStroke();

  for (let i = 0; i < numGrains; i++) {
    const gx = cx + rndGaussian(0, cloudW / 3);
    const gy = cy + rndGaussian(0, cloudH / 3);
    const size = rnd(0.5, 2) * scaleFactor;
    const alpha = rnd(0.3, 0.8);

    fill(features.palette.ink + hex(Math.floor(alpha * 255), 2));
    ellipse(gx, gy, size, size);
  }
}

function drawUpicProbabilityBands(voice, section) {
  // Probability distribution bands
  const numBands = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  for (let b = 0; b < numBands; b++) {
    const startX = rnd(section.xStart + 10, section.xEnd - 100);
    const endX = startX + rnd(60, 120) * scaleFactor;
    const centerY = rnd(voice.yStart + 20, voice.yEnd - 20);
    const maxSpread = rnd(15, 30) * scaleFactor;

    // Draw probability envelope
    noStroke();
    fill(features.palette.ink + "33");

    beginShape();
    // Top edge
    for (let t = 0; t <= 1; t += 0.05) {
      const x = lerp(startX, endX, t);
      const spread = maxSpread * sin(t * PI);
      vertex(x, centerY - spread);
    }
    // Bottom edge (reverse)
    for (let t = 1; t >= 0; t -= 0.05) {
      const x = lerp(startX, endX, t);
      const spread = maxSpread * sin(t * PI);
      vertex(x, centerY + spread);
    }
    endShape(CLOSE);

    // Center line
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * scaleFactor);
    line(startX, centerY, endX, centerY);
  }
}

function drawUpicAngularTransforms(voice, section) {
  // Angular line transformations
  const numTransforms = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 0.8 * scaleFactor);
  noFill();

  for (let t = 0; t < numTransforms; t++) {
    const startX = rnd(section.xStart + 10, section.xEnd - 80);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const numSegments = rndInt(4, 8);
    const segmentLen = rnd(10, 25) * scaleFactor;

    let x = startX;
    let currentY = y;
    let angle = 0;

    beginShape();
    vertex(x, currentY);

    for (let i = 0; i < numSegments; i++) {
      angle += rnd(-PI / 3, PI / 3);
      x += cos(angle) * segmentLen;
      currentY += sin(angle) * segmentLen;
      currentY = constrain(currentY, voice.yStart + 5, voice.yEnd - 5);
      vertex(x, currentY);
    }
    endShape();
  }
}

function drawUpicWavePages(voice, section) {
  // UPIC "page" segments with waveforms
  const numPages = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));
  const pageW = section.width / (numPages + 1);

  for (let p = 0; p < numPages; p++) {
    const x = section.xStart + (p + 0.5) * pageW;
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const w = pageW * 0.6;
    const h = rnd(15, 30) * scaleFactor;

    // Page border
    stroke(features.palette.ink + "44");
    strokeWeight(0.5 * scaleFactor);
    noFill();
    rect(x - w / 2, y - h, w, h * 2, 2 * scaleFactor);

    // Waveform inside
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * scaleFactor);
    beginShape();
    for (let t = 0; t <= 1; t += 0.03) {
      const px = x - w / 2 + t * w;
      const py = y + sin(t * TWO_PI * rnd(2, 5)) * h * 0.7;
      vertex(px, py);
    }
    endShape();
  }
}

function drawUpicRotations(voice, section) {
  // Rotational transformations
  const cx = rnd(section.xStart + 50, section.xEnd - 50);
  const cy = rnd(voice.yStart + 25, voice.yEnd - 25);
  const numRotations = rndInt(3, 6);
  const baseRadius = rnd(20, 35) * scaleFactor;

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 0.7 * scaleFactor);
  noFill();

  // Original shape
  const shapePoints = [];
  const numPoints = rndInt(3, 5);
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * TWO_PI;
    const r = baseRadius * rnd(0.5, 1);
    shapePoints.push({ angle, r });
  }

  // Draw rotated copies
  for (let rot = 0; rot < numRotations; rot++) {
    const rotAngle = (rot / numRotations) * TWO_PI;
    const alpha = 1 - rot * 0.15;
    stroke(features.palette.ink + hex(Math.floor(alpha * 255), 2));

    beginShape();
    for (const pt of shapePoints) {
      const x = cx + cos(pt.angle + rotAngle) * pt.r;
      const y = cy + sin(pt.angle + rotAngle) * pt.r * 0.6;
      vertex(x, y);
    }
    endShape(CLOSE);
  }
}

function drawUpicParallelStreams(voice, section) {
  // Multiple parallel voice streams
  const numStreams = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));
  const streamSpacing = voice.height / (numStreams + 1);

  stroke(features.palette.ink);
  noFill();

  for (let s = 0; s < numStreams; s++) {
    const baseY = voice.yStart + (s + 1) * streamSpacing;
    const startX = rnd(section.xStart + 10, section.xStart + 30);
    const endX = rnd(section.xEnd - 30, section.xEnd - 10);

    strokeWeight(features.lineWeight * rnd(0.5, 1.2) * scaleFactor);

    beginShape();
    for (let x = startX; x <= endX; x += 5 * scaleFactor) {
      const y = baseY + rndGaussian(0, 3 * scaleFactor);
      vertex(x, y);
    }
    endShape();
  }
}

function drawUpicSifted(voice, section) {
  // "Sifted" or randomized note patterns (Xenakis sieves)
  const numElements = Math.floor(rnd(20, 50) * features.densityValue);
  const sievePattern = rndInt(2, 5); // Every nth element emphasized

  noFill();

  for (let i = 0; i < numElements; i++) {
    const x = rnd(section.xStart + 10, section.xEnd - 10);
    const y = rnd(voice.yStart + 5, voice.yEnd - 5);
    const isEmphasized = i % sievePattern === 0;

    if (isEmphasized) {
      stroke(features.palette.ink);
      strokeWeight(features.lineWeight * 1.5 * scaleFactor);
      const size = rnd(4, 8) * scaleFactor;
      ellipse(x, y, size, size);
    } else {
      stroke(features.palette.ink + "66");
      strokeWeight(features.lineWeight * 0.5 * scaleFactor);
      const size = rnd(2, 4) * scaleFactor;
      point(x, y);
    }
  }
}

function drawUpicArchitectural(voice, section) {
  // Architectural/spatial structures (Polytope de Montréal influence)
  const numStructures = Math.max(1, Math.floor(rnd(1, 2) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  for (let s = 0; s < numStructures; s++) {
    const baseX = rnd(section.xStart + 30, section.xEnd - 80);
    const baseY = voice.yEnd - 10;
    const structW = rnd(50, 100) * scaleFactor;
    const structH = rnd(30, 50) * scaleFactor;

    // Architectural frame
    line(baseX, baseY, baseX, baseY - structH);
    line(baseX + structW, baseY, baseX + structW, baseY - structH);
    line(baseX, baseY - structH, baseX + structW / 2, baseY - structH - 15 * scaleFactor);
    line(baseX + structW, baseY - structH, baseX + structW / 2, baseY - structH - 15 * scaleFactor);

    // Interior lines (light beams)
    strokeWeight(features.lineWeight * 0.5 * scaleFactor);
    const numBeams = rndInt(3, 6);
    for (let b = 0; b < numBeams; b++) {
      const bx = baseX + rnd(5, structW - 5);
      line(bx, baseY - structH * 0.2, baseX + structW / 2 + rnd(-10, 10), baseY - structH - 10 * scaleFactor);
    }
  }
}

function drawUpicLogisticMap(voice, section) {
  // Chaos theory curves (logistic map visualization)
  const startX = rnd(section.xStart + 10, section.xEnd - 120);
  const w = rnd(80, 140) * scaleFactor;
  const baseY = rnd(voice.yStart + 20, voice.yEnd - 20);
  const amplitude = rnd(15, 30) * scaleFactor;
  const r = rnd(3.5, 3.9); // Chaotic regime

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 0.8 * scaleFactor);
  noFill();

  let x_n = 0.5;
  beginShape();
  for (let i = 0; i < 100; i++) {
    const px = startX + (i / 100) * w;
    const py = baseY - x_n * amplitude;
    vertex(px, py);
    x_n = r * x_n * (1 - x_n); // Logistic map iteration
  }
  endShape();
}

function drawUpicHarmonicSeries(voice, section) {
  // Overtone series visualization
  const fundamental = rnd(voice.yEnd - 15, voice.yEnd - 5);
  const startX = rnd(section.xStart + 20, section.xEnd - 100);
  const w = rnd(60, 100) * scaleFactor;
  const numPartials = rndInt(5, 10);

  stroke(features.palette.ink);
  noFill();

  for (let p = 1; p <= numPartials; p++) {
    const y = fundamental - (voice.height - 20) * log(p) / log(numPartials + 1);
    const alpha = 1 - (p - 1) * 0.08;
    const thickness = features.lineWeight * (1 - (p - 1) * 0.08);

    stroke(features.palette.ink + hex(Math.floor(alpha * 255), 2));
    strokeWeight(thickness * scaleFactor);
    line(startX, y, startX + w, y);

    // Partial number
    if (p <= 5) {
      noStroke();
      fill(features.palette.ink + "88");
      textSize(5 * scaleFactor);
      textAlign(RIGHT, CENTER);
      text(p.toString(), startX - 5 * scaleFactor, y);
    }
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: CLUSTER (Penderecki)
// ============================================================

function drawClusterWedges(voice, section) {
  const numWedges = Math.max(1, Math.floor(rnd(1, 4) * features.densityValue * section.densityMod));

  for (let i = 0; i < numWedges; i++) {
    const startX = rnd(section.xStart + 10, section.xEnd - 100);
    const endX = rnd(startX + 50, Math.min(startX + 180, section.xEnd - 10));
    const centerY = rnd(voice.yStart + voice.height * 0.3, voice.yEnd - voice.height * 0.3);

    const expanding = rndBool(0.5);
    const startHeight = expanding ? rnd(5, 15) : rnd(30, 60);
    const endHeight = expanding ? rnd(30, 60) : rnd(5, 15);

    fill(features.palette.ink + "70");
    noStroke();

    beginShape();
    vertex(startX, centerY - startHeight * scaleFactor / 2);
    vertex(endX, centerY - endHeight * scaleFactor / 2);
    vertex(endX, centerY + endHeight * scaleFactor / 2);
    vertex(startX, centerY + startHeight * scaleFactor / 2);
    endShape(CLOSE);

    // Quarter-tone lines within wedge
    stroke(features.palette.paper + "60");
    strokeWeight(0.5 * scaleFactor);
    const steps = Math.floor((endX - startX) / (8 * scaleFactor));
    for (let j = 0; j < steps; j++) {
      const x = startX + (j / steps) * (endX - startX);
      const progress = j / steps;
      const h = lerp(startHeight, endHeight, progress) * scaleFactor;
      for (let k = 0; k < 4; k++) {
        const y = centerY - h/2 + (k / 4) * h;
        line(x, y, x + 3 * scaleFactor, y);
      }
    }
  }
}

function drawClusterBands(voice, section) {
  const numBands = Math.floor(rnd(2, 6) * features.densityValue);

  for (let i = 0; i < numBands; i++) {
    const startX = rnd(section.xStart, section.xEnd - 60);
    const bandWidth = rnd(30, 100) * scaleFactor;
    const y = rnd(voice.yStart + 8, voice.yEnd - 20);
    const bandHeight = rnd(10, 30) * scaleFactor;

    // Dense horizontal lines
    stroke(features.palette.ink);
    strokeWeight(0.4 * scaleFactor);

    const lineCount = Math.floor(bandHeight / (2 * scaleFactor));
    for (let j = 0; j < lineCount; j++) {
      const ly = y + (j / lineCount) * bandHeight;
      const offset = rndGaussian(0, 3 * scaleFactor);
      line(startX + offset, ly, startX + bandWidth + offset, ly);
    }
  }
}

function drawExtendedSymbols(voice, section) {
  const symbols = ["sul pont.", "col legno", "pizz.", "arco", "trem.", "harm."];
  const numSymbols = Math.floor(rnd(1, 4) * features.densityValue);

  fill(features.palette.inkLight);
  noStroke();
  textSize(8 * scaleFactor);
  textStyle(ITALIC);

  for (let i = 0; i < numSymbols; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 40);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    text(rndChoice(symbols), x, y);
  }
  textStyle(NORMAL);
}

// New Cluster functions v3.6.0

function drawClusterGlissandi(voice, section) {
  // Cluster glissandi - sliding pitch bands (Threnody style)
  const numGlissandi = Math.max(1, Math.floor(rnd(1, 4) * features.densityValue));

  for (let g = 0; g < numGlissandi; g++) {
    const startX = rnd(section.xStart + 10, section.xEnd - 100);
    const endX = startX + rnd(60, 120) * scaleFactor;
    const startY = rnd(voice.yStart + 20, voice.yEnd - 40);
    const endY = rnd(voice.yStart + 10, voice.yEnd - 10);
    const bandHeight = rnd(15, 35) * scaleFactor;
    const direction = rndBool(0.5) ? 1 : -1; // Ascending or descending

    fill(features.palette.ink + "55");
    noStroke();

    // Filled glissando band
    beginShape();
    vertex(startX, startY - bandHeight / 2);
    vertex(endX, endY - bandHeight / 2 * direction);
    vertex(endX, endY + bandHeight / 2 * direction);
    vertex(startX, startY + bandHeight / 2);
    endShape(CLOSE);

    // Direction arrow
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * scaleFactor);
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    line(midX - 10 * scaleFactor, midY, midX + 10 * scaleFactor, midY + (endY - startY) * 0.3);
  }
}

function drawClusterMicropolyphony(voice, section) {
  // Dense micropolyphonic texture (Ligeti/Penderecki crossover)
  const cx = rnd(section.xStart + 40, section.xEnd - 40);
  const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
  const cloudW = rnd(80, 140) * scaleFactor;
  const cloudH = rnd(25, 45) * scaleFactor;
  const numLines = Math.floor(rnd(30, 80) * features.densityValue);

  stroke(features.palette.ink + "66");
  strokeWeight(0.4 * scaleFactor);

  for (let i = 0; i < numLines; i++) {
    const x1 = cx + rndGaussian(0, cloudW / 3);
    const y1 = cy + rndGaussian(0, cloudH / 3);
    const len = rnd(5, 20) * scaleFactor;
    const angle = rnd(-0.3, 0.3); // Nearly horizontal
    line(x1, y1, x1 + cos(angle) * len, y1 + sin(angle) * len);
  }
}

function drawClusterStringEffects(voice, section) {
  // Visual string effect notation symbols
  const numEffects = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  for (let e = 0; e < numEffects; e++) {
    const x = rnd(section.xStart + 20, section.xEnd - 30);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const effectType = rndInt(0, 4);

    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * scaleFactor);
    noFill();

    if (effectType === 0) {
      // Sul ponticello (near bridge) - zigzag
      beginShape();
      for (let i = 0; i < 5; i++) {
        vertex(x + i * 4 * scaleFactor, y + (i % 2) * 6 * scaleFactor);
      }
      endShape();
    } else if (effectType === 1) {
      // Col legno (with wood) - dotted line with X
      drawingContext.setLineDash([3 * scaleFactor, 2 * scaleFactor]);
      line(x, y, x + 25 * scaleFactor, y);
      drawingContext.setLineDash([]);
      line(x + 28 * scaleFactor, y - 4 * scaleFactor, x + 34 * scaleFactor, y + 4 * scaleFactor);
      line(x + 28 * scaleFactor, y + 4 * scaleFactor, x + 34 * scaleFactor, y - 4 * scaleFactor);
    } else if (effectType === 2) {
      // Tremolo - wavy line
      beginShape();
      for (let i = 0; i <= 20; i++) {
        const px = x + i * 1.5 * scaleFactor;
        const py = y + sin(i * 0.8) * 3 * scaleFactor;
        vertex(px, py);
      }
      endShape();
    } else {
      // Harmonics - diamond
      beginShape();
      vertex(x, y - 5 * scaleFactor);
      vertex(x + 5 * scaleFactor, y);
      vertex(x, y + 5 * scaleFactor);
      vertex(x - 5 * scaleFactor, y);
      endShape(CLOSE);
    }
  }
}

function drawClusterQuarterTones(voice, section) {
  // Quarter-tone accidental marks
  const numMarks = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);

  for (let m = 0; m < numMarks; m++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const type = rndInt(0, 4);

    if (type === 0) {
      // Quarter sharp (single vertical with half horizontal)
      line(x, y - 6 * scaleFactor, x, y + 6 * scaleFactor);
      line(x - 4 * scaleFactor, y - 2 * scaleFactor, x + 2 * scaleFactor, y - 2 * scaleFactor);
    } else if (type === 1) {
      // Three-quarter sharp
      line(x, y - 6 * scaleFactor, x, y + 6 * scaleFactor);
      line(x + 3 * scaleFactor, y - 6 * scaleFactor, x + 3 * scaleFactor, y + 6 * scaleFactor);
      line(x - 2 * scaleFactor, y - 2 * scaleFactor, x + 5 * scaleFactor, y - 3 * scaleFactor);
      line(x - 2 * scaleFactor, y + 2 * scaleFactor, x + 5 * scaleFactor, y + 1 * scaleFactor);
    } else if (type === 2) {
      // Quarter flat (reversed flat)
      arc(x, y, 6 * scaleFactor, 8 * scaleFactor, -PI / 2, PI / 2);
      line(x, y - 8 * scaleFactor, x, y + 4 * scaleFactor);
    } else {
      // Microtone arrow up/down
      line(x, y - 6 * scaleFactor, x, y + 6 * scaleFactor);
      if (rndBool(0.5)) {
        line(x - 3 * scaleFactor, y - 3 * scaleFactor, x, y - 6 * scaleFactor);
        line(x + 3 * scaleFactor, y - 3 * scaleFactor, x, y - 6 * scaleFactor);
      } else {
        line(x - 3 * scaleFactor, y + 3 * scaleFactor, x, y + 6 * scaleFactor);
        line(x + 3 * scaleFactor, y + 3 * scaleFactor, x, y + 6 * scaleFactor);
      }
    }
  }
}

function drawClusterAleatoryBox(voice, section) {
  // Boxed aleatory sections (Penderecki notation)
  const numBoxes = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  for (let b = 0; b < numBoxes; b++) {
    const x = rnd(section.xStart + 20, section.xEnd - 80);
    const y = rnd(voice.yStart + 10, voice.yEnd - 30);
    const w = rnd(40, 80) * scaleFactor;
    const h = rnd(20, 35) * scaleFactor;

    // Box frame
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * 1.2 * scaleFactor);
    noFill();
    rect(x, y, w, h);

    // "ad lib." or similar marking
    fill(features.palette.ink);
    noStroke();
    textSize(6 * scaleFactor);
    textStyle(ITALIC);
    const labels = ["ad lib.", "accel.", "rall.", "rit.", "libero"];
    text(rndChoice(labels), x + 3 * scaleFactor, y - 3 * scaleFactor);
    textStyle(NORMAL);

    // Random marks inside
    stroke(features.palette.ink + "88");
    strokeWeight(0.5 * scaleFactor);
    const numMarks = rndInt(4, 10);
    for (let m = 0; m < numMarks; m++) {
      const mx = x + rnd(5, w - 5);
      const my = y + rnd(5, h - 5);
      const mType = rndInt(0, 3);
      if (mType === 0) point(mx, my);
      else if (mType === 1) line(mx, my, mx + rnd(5, 15) * scaleFactor, my + rnd(-3, 3) * scaleFactor);
      else ellipse(mx, my, 3 * scaleFactor, 3 * scaleFactor);
    }
  }
}

function drawClusterBlackNotation(voice, section) {
  // Dense filled "black notation" areas (Penderecki's dense texture)
  const numAreas = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  for (let a = 0; a < numAreas; a++) {
    const x = rnd(section.xStart + 10, section.xEnd - 60);
    const y = rnd(voice.yStart + 10, voice.yEnd - 25);
    const w = rnd(30, 70) * scaleFactor;
    const h = rnd(15, 30) * scaleFactor;

    // Filled black area with rough edges
    fill(features.palette.ink + "cc");
    noStroke();
    beginShape();
    // Top edge (rough)
    for (let t = 0; t <= 1; t += 0.1) {
      vertex(x + t * w, y + rnd(-3, 3) * scaleFactor);
    }
    // Bottom edge (rough, reversed)
    for (let t = 1; t >= 0; t -= 0.1) {
      vertex(x + t * w, y + h + rnd(-3, 3) * scaleFactor);
    }
    endShape(CLOSE);
  }
}

function drawClusterVibratoWiggle(voice, section) {
  // Vibrato indication wiggles
  const numWiggles = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  for (let w = 0; w < numWiggles; w++) {
    const startX = rnd(section.xStart + 10, section.xEnd - 50);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const wiggleW = rnd(25, 50) * scaleFactor;
    const amplitude = rnd(3, 8) * scaleFactor;
    const frequency = rnd(3, 6);

    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const px = startX + t * wiggleW;
      const py = y + sin(t * TWO_PI * frequency) * amplitude;
      vertex(px, py);
    }
    endShape();
  }
}

function drawClusterSustainedTones(voice, section) {
  // Long sustained cluster tones
  const numTones = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  for (let t = 0; t < numTones; t++) {
    const startX = rnd(section.xStart + 5, section.xStart + section.width * 0.2);
    const endX = rnd(section.xEnd - section.width * 0.2, section.xEnd - 5);
    const y = rnd(voice.yStart + 8, voice.yEnd - 8);
    const thickness = rnd(2, 6) * scaleFactor;

    // Main sustained line
    stroke(features.palette.ink);
    strokeWeight(thickness);
    line(startX, y, endX, y);

    // Attack mark at start
    strokeWeight(features.lineWeight * scaleFactor);
    line(startX, y - 5 * scaleFactor, startX, y + 5 * scaleFactor);
  }
}

function drawClusterPercussive(voice, section) {
  // Percussive effect marks - placed on rhythmic grid
  const numMarks = Math.max(1, Math.floor(rnd(3, 7) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  // Position marks on beat grid
  const positions = getGroupedPositions(section.xStart + 15, section.xEnd - 15, numMarks);

  for (let m = 0; m < numMarks; m++) {
    const pos = positions[m];
    const x = pos.x;
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);

    // Downbeats get accent wedges more often, weak beats get softer marks
    let type;
    if (pos.isDownbeat) {
      type = rndBool(0.6) ? 1 : rndInt(0, 3);  // Accent wedges on downbeats
    } else {
      type = rndInt(0, 4);
    }

    // Size influenced by accent
    const sizeMult = 0.7 + pos.accent * 0.6;
    strokeWeight(features.lineWeight * scaleFactor * sizeMult);

    if (type === 0) {
      // X mark (col legno battuto)
      const s = 4 * scaleFactor * sizeMult;
      line(x - s, y - s, x + s, y + s);
      line(x - s, y + s, x + s, y - s);
    } else if (type === 1) {
      // Accent wedge - larger on strong beats
      const s = 6 * scaleFactor * sizeMult;
      beginShape();
      vertex(x - s, y + s * 0.67);
      vertex(x, y - s * 0.67);
      vertex(x + s, y + s * 0.67);
      endShape();
    } else if (type === 2) {
      // Staccato dots
      fill(features.palette.ink);
      const dotSize = 3 * scaleFactor * sizeMult;
      ellipse(x, y, dotSize, dotSize);
      noFill();
    } else {
      // Tenuto line
      strokeWeight(features.lineWeight * 2 * scaleFactor * sizeMult);
      const lineLen = 5 * scaleFactor * sizeMult;
      line(x - lineLen, y, x + lineLen, y);
    }
  }
}

function drawClusterDynamicHairpin(voice, section) {
  // Hairpin dynamics for clusters
  const numHairpins = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  for (let h = 0; h < numHairpins; h++) {
    const x = rnd(section.xStart + 15, section.xEnd - 60);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const w = rnd(30, 60) * scaleFactor;
    const spread = rnd(6, 12) * scaleFactor;
    const isCrescendo = rndBool(0.5);

    if (isCrescendo) {
      line(x, y, x + w, y - spread);
      line(x, y, x + w, y + spread);
    } else {
      line(x, y - spread, x + w, y);
      line(x, y + spread, x + w, y);
    }
  }
}

function drawClusterTremoloSlashes(voice, section) {
  // Tremolo slashes for sustained clusters
  const numTremolos = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 1.5 * scaleFactor);

  for (let t = 0; t < numTremolos; t++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const numSlashes = rndInt(2, 4);

    for (let s = 0; s < numSlashes; s++) {
      const sx = x + s * 3 * scaleFactor;
      line(sx - 3 * scaleFactor, y + 5 * scaleFactor, sx + 3 * scaleFactor, y - 5 * scaleFactor);
    }
  }
}

function drawClusterHarmonicDiamond(voice, section) {
  // Diamond harmonics notation
  const numDiamonds = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  for (let d = 0; d < numDiamonds; d++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const size = rnd(4, 8) * scaleFactor;

    beginShape();
    vertex(x, y - size);
    vertex(x + size, y);
    vertex(x, y + size);
    vertex(x - size, y);
    endShape(CLOSE);

    // Small "o" above for harmonic
    if (rndBool(0.5)) {
      ellipse(x, y - size - 4 * scaleFactor, 3 * scaleFactor, 3 * scaleFactor);
    }
  }
}

function drawClusterSulTasto(voice, section) {
  // Sul tasto (over fingerboard) indication
  const numMarks = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  for (let m = 0; m < numMarks; m++) {
    const x = rnd(section.xStart + 20, section.xEnd - 50);
    const y = rnd(voice.yStart + 12, voice.yEnd - 12);
    const w = rnd(30, 60) * scaleFactor;

    // Bracket above staff region
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * scaleFactor);
    noFill();

    line(x, y - 8 * scaleFactor, x, y - 3 * scaleFactor);
    line(x, y - 8 * scaleFactor, x + w, y - 8 * scaleFactor);
    line(x + w, y - 8 * scaleFactor, x + w, y - 3 * scaleFactor);

    // Label
    fill(features.palette.ink);
    noStroke();
    textSize(5 * scaleFactor);
    textStyle(ITALIC);
    text("s.t.", x + 2 * scaleFactor, y - 10 * scaleFactor);
    textStyle(NORMAL);
  }
}

function drawClusterColLegnoBatt(voice, section) {
  // Col legno battuto (strike with wood)
  const numMarks = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  for (let m = 0; m < numMarks; m++) {
    const x = rnd(section.xStart + 15, section.xEnd - 25);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);

    // X with stem
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * scaleFactor);

    line(x - 4 * scaleFactor, y - 4 * scaleFactor, x + 4 * scaleFactor, y + 4 * scaleFactor);
    line(x - 4 * scaleFactor, y + 4 * scaleFactor, x + 4 * scaleFactor, y - 4 * scaleFactor);
    line(x, y + 4 * scaleFactor, x, y + 12 * scaleFactor);
  }
}

function drawClusterFlautando(voice, section) {
  // Flautando (flute-like) indication
  const numMarks = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  for (let m = 0; m < numMarks; m++) {
    const x = rnd(section.xStart + 20, section.xEnd - 50);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const w = rnd(25, 50) * scaleFactor;

    // Wavy line (flautando tone)
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * 0.8 * scaleFactor);
    noFill();

    beginShape();
    for (let t = 0; t <= 1; t += 0.03) {
      const px = x + t * w;
      const py = y + sin(t * TWO_PI * 3) * 2 * scaleFactor;
      vertex(px, py);
    }
    endShape();

    // "flaut." label
    fill(features.palette.ink);
    noStroke();
    textSize(5 * scaleFactor);
    textStyle(ITALIC);
    text("flaut.", x, y - 6 * scaleFactor);
    textStyle(NORMAL);
  }
}

function drawClusterSpiccato(voice, section) {
  // Spiccato bouncing bow dots
  const numGroups = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  fill(features.palette.ink);
  noStroke();

  for (let g = 0; g < numGroups; g++) {
    const startX = rnd(section.xStart + 15, section.xEnd - 50);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const numDots = rndInt(4, 8);

    for (let d = 0; d < numDots; d++) {
      const dx = startX + d * rnd(5, 10) * scaleFactor;
      ellipse(dx, y, 3 * scaleFactor, 3 * scaleFactor);
    }
  }
}

function drawClusterBariolage(voice, section) {
  // Rapid alternating strings pattern
  const numPatterns = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  for (let p = 0; p < numPatterns; p++) {
    const startX = rnd(section.xStart + 15, section.xEnd - 60);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const w = rnd(40, 70) * scaleFactor;
    const numOsc = rndInt(4, 8);

    beginShape();
    for (let i = 0; i <= numOsc * 2; i++) {
      const px = startX + (i / (numOsc * 2)) * w;
      const py = y + (i % 2 === 0 ? -8 : 8) * scaleFactor;
      vertex(px, py);
    }
    endShape();
  }
}

function drawClusterRicochet(voice, section) {
  // Ricochet bouncing bow pattern
  const numPatterns = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  for (let p = 0; p < numPatterns; p++) {
    const startX = rnd(section.xStart + 15, section.xEnd - 50);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const numBounces = rndInt(4, 8);

    // Bouncing arc pattern (diminishing)
    beginShape();
    for (let b = 0; b <= numBounces; b++) {
      const t = b / numBounces;
      const px = startX + t * 40 * scaleFactor;
      const bounceHeight = (1 - t) * 15 * scaleFactor; // Decreasing height
      const py = y - abs(sin(b * PI)) * bounceHeight;
      vertex(px, py);
    }
    endShape();

    // "ric." label
    fill(features.palette.ink);
    noStroke();
    textSize(5 * scaleFactor);
    textStyle(ITALIC);
    text("ric.", startX - 2 * scaleFactor, y + 10 * scaleFactor);
    textStyle(NORMAL);
    stroke(features.palette.ink);
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: GRAPH (Feldman)
// ============================================================

function drawGraphBoxes(voice, section) {
  const gridWidth = 20 * scaleFactor;
  const numColumns = Math.floor(section.width / gridWidth);
  const levels = 3; // high, mid, low
  const levelHeight = voice.height / levels;

  stroke(features.palette.ink + "40");
  strokeWeight(0.5 * scaleFactor);
  noFill();

  // Draw grid
  for (let col = 0; col < numColumns; col++) {
    const x = section.xStart + col * gridWidth;
    for (let level = 0; level < levels; level++) {
      const y = voice.yStart + level * levelHeight;
      rect(x, y, gridWidth, levelHeight);
    }
  }

  // Fill some boxes (sparse)
  const fillCount = Math.floor(rnd(2, 8) * features.densityValue * (numColumns / 10));
  fill(features.palette.ink + "60");
  noStroke();

  for (let i = 0; i < fillCount; i++) {
    const col = rndInt(0, numColumns - 1);
    const level = rndInt(0, levels - 1);
    const x = section.xStart + col * gridWidth;
    const y = voice.yStart + level * levelHeight;

    // Different fill styles
    if (rndBool(0.4)) {
      // Filled
      rect(x + 2 * scaleFactor, y + 2 * scaleFactor,
           gridWidth - 4 * scaleFactor, levelHeight - 4 * scaleFactor);
    } else if (rndBool(0.5)) {
      // Dot
      ellipse(x + gridWidth/2, y + levelHeight/2,
              gridWidth * 0.4, levelHeight * 0.4);
    } else {
      // Number (Feldman's numbered cells)
      fill(features.palette.ink);
      textSize(8 * scaleFactor);
      textAlign(CENTER, CENTER);
      text(rndInt(1, 4), x + gridWidth/2, y + levelHeight/2);
      textAlign(LEFT, TOP);
      fill(features.palette.ink + "60");
    }
  }
}

function drawSparsePoints(voice, section) {
  const numPoints = Math.floor(rnd(3, 10) * features.densityValue * 0.5);

  // Use grouped positions for Feldman-style rhythmic placement
  const positions = getGroupedPositions(section.xStart + 20, section.xEnd - 20, numPoints);

  for (let i = 0; i < numPoints; i++) {
    const pos = positions[i];
    const x = pos.x;
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    // Downbeats get larger noteheads
    const baseSize = rnd(3, 8) * scaleFactor;
    const size = getAccentedSize(baseSize, i);

    fill(features.palette.ink);
    noStroke();
    ellipse(x, y, size, size);

    // Duration lines more likely on strong beats, length influenced by subdivision
    const durationProb = pos.isDownbeat ? 0.6 : 0.3;
    if (rndBool(durationProb)) {
      stroke(features.palette.ink + "60");
      strokeWeight(0.5 * scaleFactor);
      // Compound meters (subdivision=3) get longer durations
      const durationMult = getSubdivision() === 3 ? 1.5 : 1.0;
      const duration = rnd(15, 50) * scaleFactor * durationMult * pos.accent;
      line(x + size/2, y, x + size/2 + duration, y);
    }
  }
}

// ============================================================
// ENHANCED GRAPH MODE FUNCTIONS (v3.2.0)
// Inspired by Morton Feldman's Projections & Intersections
// ============================================================

// --- 1. Ictus Marks (attack indicators) ---
function drawIctusMarks(voice, section) {
  const numMarks = Math.max(1, Math.floor(rnd(4, 12) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1.2 * scaleFactor);

  for (let i = 0; i < numMarks; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const height = rnd(8, 18) * scaleFactor;

    // Vertical ictus line
    line(x, y - height/2, x, y + height/2);

    // Sometimes add small notehead
    if (rndBool(0.6)) {
      fill(features.palette.ink);
      noStroke();
      ellipse(x, y, 4 * scaleFactor, 3 * scaleFactor);
      stroke(features.palette.ink);
    }

    // Sometimes add accent mark above
    if (rndBool(0.3)) {
      strokeWeight(1.5 * scaleFactor);
      line(x - 3 * scaleFactor, y - height/2 - 4 * scaleFactor,
           x, y - height/2 - 7 * scaleFactor);
      line(x, y - height/2 - 7 * scaleFactor,
           x + 3 * scaleFactor, y - height/2 - 4 * scaleFactor);
      strokeWeight(1.2 * scaleFactor);
    }
  }
}

// --- 2. Register Bands (high/mid/low zones with labels) ---
function drawRegisterBands(voice, section) {
  const registers = ["H", "M", "L"]; // High, Middle, Low
  const bandHeight = voice.height / 3;

  // Draw horizontal dividing lines
  stroke(features.palette.ink + "30");
  strokeWeight(0.5 * scaleFactor);

  for (let i = 1; i < 3; i++) {
    const y = voice.yStart + i * bandHeight;
    // Dashed line
    for (let x = section.xStart; x < section.xEnd; x += 8 * scaleFactor) {
      line(x, y, Math.min(x + 4 * scaleFactor, section.xEnd), y);
    }
  }

  // Add register labels on left margin
  fill(features.palette.ink + "60");
  noStroke();
  textSize(7 * scaleFactor);
  textAlign(CENTER, CENTER);

  for (let i = 0; i < 3; i++) {
    const y = voice.yStart + i * bandHeight + bandHeight/2;
    text(registers[i], section.xStart - 8 * scaleFactor, y);
  }

  textAlign(LEFT, TOP);
}

// --- 3. Time Brackets [ ] ---
function drawTimeBrackets(voice, section) {
  const numBrackets = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  noFill();

  for (let i = 0; i < numBrackets; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 60);
    const bracketWidth = rnd(30, 80) * scaleFactor;
    const y = rndBool(0.5) ? voice.yStart + 5 * scaleFactor : voice.yEnd - 5 * scaleFactor;
    const bracketHeight = 6 * scaleFactor;
    const direction = y < voice.yCenter ? 1 : -1;

    // Left bracket [
    line(x, y, x, y + bracketHeight * direction);
    line(x, y, x + 4 * scaleFactor, y);

    // Right bracket ]
    line(x + bracketWidth, y, x + bracketWidth, y + bracketHeight * direction);
    line(x + bracketWidth, y, x + bracketWidth - 4 * scaleFactor, y);

    // Optional time indication
    if (rndBool(0.5)) {
      fill(features.palette.ink + "80");
      textSize(6 * scaleFactor);
      textAlign(CENTER, CENTER);
      const timeText = rndChoice(["0'00\"", "1'30\"", "~30\"", "free", "slow", "15\"-20\""]);
      text(timeText, x + bracketWidth/2, y + bracketHeight * direction * 1.5);
      textAlign(LEFT, TOP);
      noFill();
    }
  }
}

// --- 4. Proportional Spacing (variable column widths) ---
function drawProportionalGrid(voice, section) {
  stroke(features.palette.ink + "25");
  strokeWeight(0.5 * scaleFactor);

  let x = section.xStart;
  const columns = [];

  // Generate variable-width columns
  while (x < section.xEnd - 10) {
    const colWidth = rnd(12, 45) * scaleFactor;
    if (x + colWidth <= section.xEnd) {
      columns.push({ x, width: colWidth });
    }
    x += colWidth;
  }

  // Draw columns
  for (const col of columns) {
    line(col.x, voice.yStart, col.x, voice.yEnd);

    // Occasionally add a note or mark in the column
    if (rndBool(0.25 * features.densityValue)) {
      fill(features.palette.ink + "50");
      noStroke();
      const noteY = rnd(voice.yStart + 8, voice.yEnd - 8);
      const noteSize = rnd(3, 6) * scaleFactor;
      ellipse(col.x + col.width/2, noteY, noteSize, noteSize * 0.7);
      stroke(features.palette.ink + "25");
    }
  }
}

// --- 5. Diamond Noteheads (harmonics) ---
function drawDiamondNotes(voice, section) {
  const numDiamonds = Math.max(1, Math.floor(rnd(3, 10) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);

  for (let i = 0; i < numDiamonds; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 12, voice.yEnd - 12);
    const size = rnd(5, 10) * scaleFactor;

    // Diamond shape
    const filled = rndBool(0.3);
    if (filled) {
      fill(features.palette.ink);
    } else {
      noFill();
    }

    quad(x, y - size/2,
         x + size/2, y,
         x, y + size/2,
         x - size/2, y);

    // Optional stem
    if (rndBool(0.5)) {
      const stemDir = rndBool(0.5) ? -1 : 1;
      line(x + size/2 * (stemDir > 0 ? 1 : -1), y,
           x + size/2 * (stemDir > 0 ? 1 : -1), y + stemDir * size * 2.5);
    }

    // Optional "harmonic" indicator (small circle)
    if (rndBool(0.3)) {
      noFill();
      ellipse(x, y - size, 4 * scaleFactor, 4 * scaleFactor);
    }
  }
}

// --- 6. Cluster Brackets (grouping pitches) ---
function drawClusterBrackets(voice, section) {
  const numClusters = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let i = 0; i < numClusters; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const clusterHeight = rnd(15, 40) * scaleFactor;
    const centerY = rnd(voice.yStart + clusterHeight/2 + 5, voice.yEnd - clusterHeight/2 - 5);

    // Curly bracket
    strokeWeight(1.2 * scaleFactor);
    const bracketX = x - 8 * scaleFactor;

    // Top curve
    beginShape();
    noFill();
    vertex(bracketX + 4 * scaleFactor, centerY - clusterHeight/2);
    bezierVertex(
      bracketX, centerY - clusterHeight/2,
      bracketX, centerY - clusterHeight/4,
      bracketX - 2 * scaleFactor, centerY
    );
    endShape();

    // Bottom curve
    beginShape();
    vertex(bracketX - 2 * scaleFactor, centerY);
    bezierVertex(
      bracketX, centerY + clusterHeight/4,
      bracketX, centerY + clusterHeight/2,
      bracketX + 4 * scaleFactor, centerY + clusterHeight/2
    );
    endShape();

    // Notes inside bracket
    fill(features.palette.ink);
    noStroke();
    const numNotes = rndInt(2, 5);
    for (let n = 0; n < numNotes; n++) {
      const noteY = centerY - clusterHeight/2 + (n + 0.5) * (clusterHeight / numNotes);
      ellipse(x, noteY, 5 * scaleFactor, 4 * scaleFactor);
    }
    stroke(features.palette.ink);
  }
}

// --- 7. Dynamic Gradients (hairpins over boxes) ---
function drawDynamicGradients(voice, section) {
  const numHairpins = Math.max(1, Math.floor(rnd(2, 6) * features.densityValue));

  stroke(features.palette.ink + "80");
  strokeWeight(0.8 * scaleFactor);
  noFill();

  for (let i = 0; i < numHairpins; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 60);
    const hairpinWidth = rnd(30, 70) * scaleFactor;
    const y = rnd(voice.yStart + 8, voice.yEnd - 8);
    const hairpinHeight = 4 * scaleFactor;

    const isCrescendo = rndBool(0.5);

    if (isCrescendo) {
      // < crescendo
      line(x, y, x + hairpinWidth, y - hairpinHeight);
      line(x, y, x + hairpinWidth, y + hairpinHeight);
    } else {
      // > decrescendo
      line(x, y - hairpinHeight, x + hairpinWidth, y);
      line(x, y + hairpinHeight, x + hairpinWidth, y);
    }

    // Optional dynamic marking
    if (rndBool(0.4)) {
      fill(features.palette.ink + "70");
      textSize(7 * scaleFactor);
      textAlign(CENTER, CENTER);
      const dynamic = isCrescendo ?
        rndChoice(["pp", "p", "ppp"]) :
        rndChoice(["mp", "mf", "p"]);
      const textX = isCrescendo ? x - 8 * scaleFactor : x + hairpinWidth + 8 * scaleFactor;
      text(dynamic, textX, y);
      textAlign(LEFT, TOP);
      noFill();
    }
  }
}

// --- 8. Sustain Lines (long horizontal ties) ---
function drawSustainLines(voice, section) {
  const numLines = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  for (let i = 0; i < numLines; i++) {
    const x = rnd(section.xStart + 10, section.xEnd - 80);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const lineLength = rnd(40, 120) * scaleFactor;

    // Starting notehead
    fill(features.palette.ink);
    noStroke();
    ellipse(x, y, 5 * scaleFactor, 4 * scaleFactor);

    // Sustain line (slightly wavy or straight)
    stroke(features.palette.ink + "70");
    strokeWeight(0.8 * scaleFactor);
    noFill();

    if (rndBool(0.3)) {
      // Wavy tie
      beginShape();
      for (let t = 0; t <= 1; t += 0.05) {
        const px = x + 3 * scaleFactor + t * lineLength;
        const py = y + sin(t * PI * 2) * 2 * scaleFactor;
        vertex(px, py);
      }
      endShape();
    } else {
      // Straight line with slight curve
      beginShape();
      vertex(x + 3 * scaleFactor, y);
      bezierVertex(
        x + lineLength * 0.3, y - 3 * scaleFactor,
        x + lineLength * 0.7, y - 3 * scaleFactor,
        x + lineLength, y
      );
      endShape();
    }

    // Optional ending notehead
    if (rndBool(0.4)) {
      fill(features.palette.ink + "60");
      noStroke();
      ellipse(x + lineLength, y, 4 * scaleFactor, 3 * scaleFactor);
    }
  }
}

// --- 9. Tremolo Indicators ---
function drawTremoloMarks(voice, section) {
  const numTremolos = Math.max(1, Math.floor(rnd(2, 6) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1.5 * scaleFactor);

  for (let i = 0; i < numTremolos; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);

    // Notehead
    fill(features.palette.ink);
    noStroke();
    ellipse(x, y, 6 * scaleFactor, 5 * scaleFactor);

    // Tremolo slashes on stem
    stroke(features.palette.ink);
    strokeWeight(1.5 * scaleFactor);

    const stemX = x + 3 * scaleFactor;
    const stemTop = y - 15 * scaleFactor;
    line(stemX, y, stemX, stemTop);

    const numSlashes = rndInt(1, 3);
    for (let s = 0; s < numSlashes; s++) {
      const slashY = stemTop + 5 * scaleFactor + s * 4 * scaleFactor;
      line(stemX - 4 * scaleFactor, slashY + 3 * scaleFactor,
           stemX + 4 * scaleFactor, slashY - 3 * scaleFactor);
    }
  }
}

// --- 10. Instrument Labels ---
function drawInstrumentLabels(voice, section) {
  const instruments = [
    "vln.", "vla.", "vc.", "cb.", "fl.", "ob.", "cl.", "bsn.",
    "hn.", "tpt.", "tbn.", "perc.", "pno.", "cel.", "hp.", "vib."
  ];

  fill(features.palette.ink + "70");
  noStroke();
  textSize(7 * scaleFactor);
  textAlign(RIGHT, CENTER);

  // Place instrument label at voice start
  const instrument = rndChoice(instruments);
  text(instrument, section.xStart - 12 * scaleFactor, voice.yCenter);

  // Occasionally add playing technique
  if (rndBool(0.4)) {
    textSize(5 * scaleFactor);
    const technique = rndChoice([
      "pizz.", "arco", "sul pont.", "con sord.", "harm.", "ord.",
      "flz.", "muta", "l.v.", "secco", "dolce", "sotto voce"
    ]);
    text(technique, section.xStart - 12 * scaleFactor, voice.yCenter + 10 * scaleFactor);
  }

  textAlign(LEFT, TOP);
}

// --- 11. Empty Box Emphasis (silence representation) ---
function drawEmptyBoxes(voice, section) {
  const numBoxes = Math.max(1, Math.floor(rnd(2, 6) * features.densityValue * 0.5));

  for (let i = 0; i < numBoxes; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 40);
    const boxWidth = rnd(20, 50) * scaleFactor;
    const boxHeight = rnd(15, 30) * scaleFactor;
    const y = rnd(voice.yStart + 10, voice.yEnd - boxHeight - 10);

    // Empty box with emphasized border
    stroke(features.palette.ink + "50");
    strokeWeight(1.5 * scaleFactor);
    noFill();
    rect(x, y, boxWidth, boxHeight);

    // Inner lighter box
    stroke(features.palette.ink + "20");
    strokeWeight(0.5 * scaleFactor);
    rect(x + 3 * scaleFactor, y + 3 * scaleFactor,
         boxWidth - 6 * scaleFactor, boxHeight - 6 * scaleFactor);

    // Optional "tacet" or rest indicator
    if (rndBool(0.3)) {
      fill(features.palette.ink + "40");
      textSize(6 * scaleFactor);
      textAlign(CENTER, CENTER);
      text(rndChoice(["∅", "tacet", "—", "○"]), x + boxWidth/2, y + boxHeight/2);
      textAlign(LEFT, TOP);
    }
  }
}

// --- 12. Connecting Lines (voice leading) ---
function drawConnectingLines(voice, section) {
  const numConnections = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  // Generate some note positions first
  const notes = [];
  for (let i = 0; i < numConnections + 1; i++) {
    notes.push({
      x: section.xStart + (i + 0.5) * (section.width / (numConnections + 1)),
      y: rnd(voice.yStart + 12, voice.yEnd - 12)
    });
  }

  // Draw noteheads
  fill(features.palette.ink);
  noStroke();
  for (const note of notes) {
    ellipse(note.x, note.y, 5 * scaleFactor, 4 * scaleFactor);
  }

  // Draw connecting lines between consecutive notes
  stroke(features.palette.ink + "40");
  strokeWeight(0.7 * scaleFactor);
  noFill();

  for (let i = 0; i < notes.length - 1; i++) {
    if (rndBool(0.7)) {
      const n1 = notes[i];
      const n2 = notes[i + 1];

      // Slightly curved connecting line
      beginShape();
      vertex(n1.x + 3 * scaleFactor, n1.y);
      const midX = (n1.x + n2.x) / 2;
      const midY = (n1.y + n2.y) / 2 + rnd(-8, 8) * scaleFactor;
      quadraticVertex(midX, midY, n2.x - 3 * scaleFactor, n2.y);
      endShape();
    }
  }
}

// --- 13. Soft Attack Marks (pianissimo indicators) ---
function drawSoftAttackMarks(voice, section) {
  const numMarks = Math.max(1, Math.floor(rnd(4, 12) * features.densityValue));

  for (let i = 0; i < numMarks; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const size = rnd(4, 8) * scaleFactor;

    // Soft attack: open circle (not filled)
    stroke(features.palette.ink + "80");
    strokeWeight(0.8 * scaleFactor);
    noFill();
    ellipse(x, y, size, size * 0.8);

    // Sometimes add very small "o" or "pp" marking
    if (rndBool(0.3)) {
      fill(features.palette.ink + "50");
      noStroke();
      textSize(5 * scaleFactor);
      textAlign(CENTER, CENTER);
      text(rndChoice(["o", "pp", "ppp", "°"]), x, y + size);
      textAlign(LEFT, TOP);
    }
  }
}

// --- 14. Decay Trails (fading resonance) ---
function drawDecayTrails(voice, section) {
  const numTrails = Math.max(1, Math.floor(rnd(3, 7) * features.densityValue));

  for (let i = 0; i < numTrails; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 80);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const trailLength = rnd(40, 100) * scaleFactor;

    // Starting note
    fill(features.palette.ink);
    noStroke();
    ellipse(x, y, 5 * scaleFactor, 4 * scaleFactor);

    // Decay trail with fading opacity
    noFill();
    strokeWeight(1 * scaleFactor);

    const segments = 8;
    for (let s = 0; s < segments; s++) {
      const t1 = s / segments;
      const t2 = (s + 1) / segments;
      const opacity = Math.floor(100 * (1 - t1));
      stroke(features.palette.ink + opacity.toString(16).padStart(2, '0'));

      const x1 = x + 3 * scaleFactor + t1 * trailLength;
      const x2 = x + 3 * scaleFactor + t2 * trailLength;
      const waveY1 = y + sin(t1 * PI * 3) * 2 * scaleFactor * (1 - t1);
      const waveY2 = y + sin(t2 * PI * 3) * 2 * scaleFactor * (1 - t2);

      line(x1, waveY1, x2, waveY2);
    }

    // Dotted end (dying away)
    if (rndBool(0.4)) {
      fill(features.palette.ink + "20");
      noStroke();
      for (let d = 0; d < 3; d++) {
        ellipse(x + trailLength + 5 * scaleFactor + d * 4 * scaleFactor, y,
                2 * scaleFactor, 2 * scaleFactor);
      }
    }
  }
}

// --- 15. Vertical Duration Stacks ---
function drawDurationStacks(voice, section) {
  const numStacks = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  for (let i = 0; i < numStacks; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const stackHeight = voice.height * rnd(0.4, 0.8);
    const centerY = voice.yCenter;
    const numNotes = rndInt(2, 6);

    // Vertical stem
    stroke(features.palette.ink + "60");
    strokeWeight(0.8 * scaleFactor);
    line(x, centerY - stackHeight/2, x, centerY + stackHeight/2);

    // Notes stacked vertically
    fill(features.palette.ink);
    noStroke();

    for (let n = 0; n < numNotes; n++) {
      const noteY = centerY - stackHeight/2 + (n + 0.5) * (stackHeight / numNotes);
      const noteType = rndInt(0, 2);

      if (noteType === 0) {
        // Filled
        ellipse(x, noteY, 5 * scaleFactor, 4 * scaleFactor);
      } else if (noteType === 1) {
        // Open
        stroke(features.palette.ink);
        strokeWeight(1 * scaleFactor);
        noFill();
        ellipse(x, noteY, 5 * scaleFactor, 4 * scaleFactor);
        fill(features.palette.ink);
        noStroke();
      } else {
        // Diamond
        stroke(features.palette.ink);
        strokeWeight(0.8 * scaleFactor);
        noFill();
        quad(x, noteY - 3 * scaleFactor,
             x + 3 * scaleFactor, noteY,
             x, noteY + 3 * scaleFactor,
             x - 3 * scaleFactor, noteY);
        fill(features.palette.ink);
        noStroke();
      }
    }

    // Duration number
    if (rndBool(0.4)) {
      fill(features.palette.ink + "70");
      textSize(6 * scaleFactor);
      textAlign(CENTER, CENTER);
      text(rndInt(1, 8), x, centerY + stackHeight/2 + 8 * scaleFactor);
      textAlign(LEFT, TOP);
    }
  }
}

// --- 16. Pedal Markings ---
function drawPedalMarkings(voice, section) {
  const numPedals = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink + "70");
  strokeWeight(1 * scaleFactor);
  noFill();

  const pedalY = voice.yEnd + 5 * scaleFactor;

  for (let i = 0; i < numPedals; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 60);
    const pedalWidth = rnd(30, 80) * scaleFactor;

    // Ped. marking
    fill(features.palette.ink + "70");
    noStroke();
    textSize(8 * scaleFactor);
    textAlign(LEFT, CENTER);
    text("Ped.", x, pedalY);

    // Pedal line
    stroke(features.palette.ink + "50");
    strokeWeight(0.8 * scaleFactor);
    line(x + 18 * scaleFactor, pedalY, x + pedalWidth, pedalY);

    // Release mark (*)
    noStroke();
    textAlign(CENTER, CENTER);
    text("*", x + pedalWidth + 5 * scaleFactor, pedalY);

    textAlign(LEFT, TOP);
  }
}

// --- 17. Breath/Pause Marks ---
function drawBreathMarks(voice, section) {
  const numMarks = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  fill(features.palette.ink + "80");
  noStroke();
  textSize(14 * scaleFactor);
  textAlign(CENTER, CENTER);

  const breathSymbols = [",", "'", "//", "◦"];

  for (let i = 0; i < numMarks; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rndBool(0.5) ? voice.yStart - 2 * scaleFactor : voice.yEnd + 2 * scaleFactor;

    const symbol = rndChoice(breathSymbols);
    text(symbol, x, y);
  }

  textAlign(LEFT, TOP);
}

// --- 18. Harmonic Halos (overtone visualization) ---
function drawHarmonicHalos(voice, section) {
  const numHalos = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  for (let i = 0; i < numHalos; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const baseSize = rnd(4, 7) * scaleFactor;

    // Central note
    fill(features.palette.ink);
    noStroke();
    ellipse(x, y, baseSize, baseSize * 0.8);

    // Concentric halo rings (fading out)
    noFill();
    const numRings = rndInt(2, 4);

    for (let r = 1; r <= numRings; r++) {
      const ringSize = baseSize + r * 6 * scaleFactor;
      const opacity = Math.floor(60 - r * 15);
      stroke(features.palette.ink + opacity.toString(16).padStart(2, '0'));
      strokeWeight((0.8 - r * 0.15) * scaleFactor);
      ellipse(x, y, ringSize, ringSize * 0.8);
    }

    // Optional partial number
    if (rndBool(0.3)) {
      fill(features.palette.ink + "50");
      noStroke();
      textSize(5 * scaleFactor);
      textAlign(CENTER, CENTER);
      text(rndChoice(["2", "3", "4", "5", "7", "11"]), x, y - baseSize - numRings * 3 * scaleFactor);
      textAlign(LEFT, TOP);
    }
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: CHANCE (Cage)
// ============================================================

function drawChanceCurves(voice, section) {
  const numCurves = Math.max(1, Math.floor(rnd(4, 12) * features.densityValue));

  for (let i = 0; i < numCurves; i++) {
    stroke(features.palette.ink + "50");
    strokeWeight(rnd(0.5, 1.5) * scaleFactor);
    noFill();

    const startX = rnd(section.xStart, section.xEnd);
    const startY = rnd(voice.yStart, voice.yEnd);

    beginShape();
    curveVertex(startX, startY);
    curveVertex(startX, startY);

    let x = startX;
    let y = startY;
    const segments = rndInt(4, 10);

    for (let j = 0; j < segments; j++) {
      x += rnd(-40, 80) * scaleFactor;
      y += rnd(-30, 30) * scaleFactor;
      x = constrain(x, section.xStart, section.xEnd);
      y = constrain(y, voice.yStart, voice.yEnd);
      curveVertex(x, y);
    }

    curveVertex(x, y);
    endShape();
  }
}

function drawChanceDots(voice, section) {
  const numDots = Math.floor(rnd(15, 50) * features.densityValue);

  // Use time signature grouping for rhythmic dot placement
  const positions = getGroupedPositions(section.xStart, section.xEnd, numDots);

  for (let i = 0; i < numDots; i++) {
    const pos = positions[i];
    const x = pos.x + rnd(-15, 15) * scaleFactor;  // Slight randomization
    const y = rnd(voice.yStart, voice.yEnd);
    // Size influenced by accent - downbeats are larger
    const baseSize = rnd(1, 4) * scaleFactor;
    const size = getAccentedSize(baseSize, i);

    // Opacity also affected by accent
    const opacity = Math.floor(0x40 + pos.accent * 0x40).toString(16).padStart(2, '0');
    fill(features.palette.ink + opacity);
    noStroke();
    ellipse(x, y, size, size);
  }
}

function drawChanceIntersections(voice, section) {
  // Draw intersection markers where imaginary curves cross
  const numMarkers = Math.floor(rnd(2, 6) * features.densityValue);

  stroke(features.palette.accent);
  strokeWeight(1 * scaleFactor);

  for (let i = 0; i < numMarkers; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const size = 6 * scaleFactor;

    // Cross mark
    line(x - size, y, x + size, y);
    line(x, y - size, x, y + size);

    // Small circle
    noFill();
    ellipse(x, y, size * 2, size * 2);
  }
}

// ============================================================
// ENHANCED CHANCE MODE FUNCTIONS (v3.3.0)
// Inspired by John Cage's graphic scores and chance operations
// ============================================================

// --- 1. Fontana Mix Grid (measurement overlay) ---
function drawFontanaMixGrid(voice, section) {
  stroke(features.palette.ink + "20");
  strokeWeight(0.5 * scaleFactor);

  // Vertical grid lines with numbers
  const gridSpacing = rnd(25, 45) * scaleFactor;
  let gridNum = 1;

  for (let gx = section.xStart; gx <= section.xEnd; gx += gridSpacing) {
    line(gx, voice.yStart, gx, voice.yEnd);

    // Number at top
    if (rndBool(0.4)) {
      fill(features.palette.ink + "40");
      noStroke();
      textSize(5 * scaleFactor);
      textAlign(CENTER, BOTTOM);
      text(gridNum, gx, voice.yStart - 2 * scaleFactor);
      stroke(features.palette.ink + "20");
    }
    gridNum++;
  }

  // Horizontal grid lines (fewer)
  for (let gy = voice.yStart; gy <= voice.yEnd; gy += gridSpacing * 1.5) {
    line(section.xStart, gy, section.xEnd, gy);
  }

  // Diagonal measurement line (Fontana Mix characteristic)
  if (rndBool(0.5)) {
    stroke(features.palette.ink + "30");
    strokeWeight(0.8 * scaleFactor);
    const diagX1 = rnd(section.xStart, section.xCenter);
    const diagX2 = rnd(section.xCenter, section.xEnd);
    line(diagX1, voice.yEnd, diagX2, voice.yStart);
  }

  textAlign(LEFT, TOP);
}

// --- 2. Transparent Overlays (Variations series) ---
function drawTransparentOverlays(voice, section) {
  const numOverlays = rndInt(2, 5);

  noStroke();

  for (let i = 0; i < numOverlays; i++) {
    // Very transparent fill
    const alpha = rndInt(10, 30);
    fill(features.palette.ink + alpha.toString(16).padStart(2, '0'));

    const shapeType = rndInt(0, 3);
    const ox = rnd(section.xStart, section.xEnd - 50);
    const oy = rnd(voice.yStart, voice.yEnd - 30);
    const ow = rnd(40, 120) * scaleFactor;
    const oh = rnd(25, 60) * scaleFactor;

    switch (shapeType) {
      case 0: // Rectangle
        rect(ox, oy, ow, oh);
        break;
      case 1: // Ellipse
        ellipse(ox + ow/2, oy + oh/2, ow, oh);
        break;
      case 2: // Irregular polygon
        beginShape();
        for (let v = 0; v < 5; v++) {
          vertex(ox + rnd(0, ow), oy + rnd(0, oh));
        }
        endShape(CLOSE);
        break;
      case 3: // Curved blob
        beginShape();
        for (let a = 0; a < TWO_PI; a += PI/4) {
          const br = rnd(0.3, 1) * min(ow, oh) / 2;
          curveVertex(ox + ow/2 + cos(a) * br, oy + oh/2 + sin(a) * br);
        }
        endShape(CLOSE);
        break;
    }
  }
}

// --- 3. I Ching Hexagrams ---
function drawIChingHexagrams(voice, section) {
  const numHexagrams = Math.max(1, Math.floor(rnd(2, 6) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1.5 * scaleFactor);

  for (let i = 0; i < numHexagrams; i++) {
    const hx = rnd(section.xStart + 20, section.xEnd - 30);
    const hy = rnd(voice.yStart + 25, voice.yEnd - 25);
    const lineWidth = 18 * scaleFactor;
    const lineSpacing = 4 * scaleFactor;
    const gapWidth = 4 * scaleFactor;

    // Generate random hexagram (6 lines, each solid or broken)
    for (let ln = 0; ln < 6; ln++) {
      const lineY = hy - (ln - 2.5) * lineSpacing;
      const isBroken = rndBool(0.5);

      if (isBroken) {
        // Broken line (yin) - two segments with gap
        line(hx - lineWidth/2, lineY, hx - gapWidth/2, lineY);
        line(hx + gapWidth/2, lineY, hx + lineWidth/2, lineY);
      } else {
        // Solid line (yang)
        line(hx - lineWidth/2, lineY, hx + lineWidth/2, lineY);
      }
    }

    // Optional hexagram number
    if (rndBool(0.3)) {
      fill(features.palette.ink + "60");
      noStroke();
      textSize(6 * scaleFactor);
      textAlign(CENTER, TOP);
      text(rndInt(1, 64), hx, hy + 15 * scaleFactor);
      stroke(features.palette.ink);
      textAlign(LEFT, TOP);
    }
  }
}

// --- 4. Star Chart Tracings (Atlas Eclipticalis) ---
function drawStarChartTracings(voice, section) {
  // Generate "stars" (dots of varying magnitude)
  const numStars = Math.max(5, Math.floor(rnd(15, 40) * features.densityValue));
  const stars = [];

  fill(features.palette.ink);
  noStroke();

  for (let i = 0; i < numStars; i++) {
    const star = {
      x: rnd(section.xStart + 10, section.xEnd - 10),
      y: rnd(voice.yStart + 10, voice.yEnd - 10),
      magnitude: rnd(1, 5) // Brightness/size
    };
    stars.push(star);

    // Draw star based on magnitude
    const starSize = (6 - star.magnitude) * scaleFactor;
    ellipse(star.x, star.y, starSize, starSize);
  }

  // Connect some stars like constellations
  stroke(features.palette.ink + "30");
  strokeWeight(0.5 * scaleFactor);

  const numConnections = Math.floor(numStars * 0.4);
  for (let i = 0; i < numConnections; i++) {
    const s1 = rndChoice(stars);
    const s2 = rndChoice(stars);
    if (s1 !== s2 && dist(s1.x, s1.y, s2.x, s2.y) < 80 * scaleFactor) {
      line(s1.x, s1.y, s2.x, s2.y);
    }
  }
}

// --- 5. Silence Boxes (4'33" style) ---
function drawSilenceBoxes(voice, section) {
  const numBoxes = Math.max(1, Math.floor(rnd(1, 4) * features.densityValue * 0.5));

  for (let i = 0; i < numBoxes; i++) {
    const bx = rnd(section.xStart + 15, section.xEnd - 60);
    const boxWidth = rnd(35, 80) * scaleFactor;
    const boxHeight = voice.height * rnd(0.4, 0.8);
    const by = voice.yStart + (voice.height - boxHeight) / 2;

    // Empty box with thin border
    stroke(features.palette.ink + "40");
    strokeWeight(0.8 * scaleFactor);
    noFill();
    rect(bx, by, boxWidth, boxHeight);

    // "TACET" or duration marking
    fill(features.palette.ink + "50");
    noStroke();
    textSize(7 * scaleFactor);
    textAlign(CENTER, CENTER);

    const marking = rndChoice(["TACET", "tacet", "silence", "—", "∅", "4'33\""]);
    text(marking, bx + boxWidth/2, by + boxHeight/2);

    // Optional movement number
    if (rndBool(0.4)) {
      textSize(5 * scaleFactor);
      text(rndChoice(["I", "II", "III"]), bx + boxWidth/2, by - 8 * scaleFactor);
    }

    textAlign(LEFT, TOP);
  }
}

// --- 6. Mesostic Text ---
function drawMesosticText(voice, section) {
  const words = [
    "SILENCE", "CHANCE", "MUSIC", "SOUND", "TIME", "SPACE", "LISTEN",
    "NOTHING", "EMPTY", "CAGE", "ZEN", "MUSHROOM", "NATURE"
  ];

  const spineWord = rndChoice(words);
  const mx = rnd(section.xStart + 30, section.xEnd - 50);
  const startY = voice.yStart + 10 * scaleFactor;

  fill(features.palette.ink);
  noStroke();
  textAlign(CENTER, TOP);

  // Draw vertical spine word with horizontal extensions
  for (let i = 0; i < spineWord.length; i++) {
    const charY = startY + i * 12 * scaleFactor;
    if (charY > voice.yEnd - 10) break;

    // Spine letter (bold/larger)
    textSize(9 * scaleFactor);
    textStyle(BOLD);
    text(spineWord[i], mx, charY);

    // Random letters before and after (smaller, lighter)
    textStyle(NORMAL);
    textSize(7 * scaleFactor);
    fill(features.palette.ink + "60");

    const before = rndInt(0, 4);
    const after = rndInt(0, 4);

    for (let b = before; b > 0; b--) {
      const ch = String.fromCharCode(97 + rndInt(0, 25));
      text(ch, mx - b * 8 * scaleFactor, charY);
    }

    for (let a = 1; a <= after; a++) {
      const ch = String.fromCharCode(97 + rndInt(0, 25));
      text(ch, mx + a * 8 * scaleFactor, charY);
    }

    fill(features.palette.ink);
  }

  textStyle(NORMAL);
  textAlign(LEFT, TOP);
}

// --- 7. Ryoanji Tracings (rock outlines) ---
function drawRyoanjiTracings(voice, section) {
  const numRocks = Math.max(1, Math.floor(rnd(2, 6) * features.densityValue));

  stroke(features.palette.ink + "70");
  strokeWeight(0.8 * scaleFactor);
  noFill();

  for (let i = 0; i < numRocks; i++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const baseSize = rnd(15, 40) * scaleFactor;

    // Draw organic rock shape with multiple tracings
    const numTracings = rndInt(2, 5);

    for (let t = 0; t < numTracings; t++) {
      const offset = t * 2 * scaleFactor;

      beginShape();
      const points = rndInt(8, 15);
      for (let p = 0; p <= points; p++) {
        const angle = (p / points) * TWO_PI;
        const r = baseSize * (0.6 + 0.4 * noise(angle * 2 + i * 10 + t));
        curveVertex(cx + cos(angle) * (r + offset), cy + sin(angle) * (r + offset) * 0.7);
      }
      endShape(CLOSE);
    }
  }
}

// --- 8. Prepared Piano Symbols ---
function drawPreparedPianoSymbols(voice, section) {
  const numSymbols = Math.max(1, Math.floor(rnd(4, 10) * features.densityValue));

  const preparations = [
    { symbol: "●—", name: "bolt" },
    { symbol: "◯", name: "rubber" },
    { symbol: "╳", name: "mute" },
    { symbol: "∿", name: "screw" },
    { symbol: "▬", name: "felt" },
    { symbol: "◊", name: "plastic" },
    { symbol: "⊙", name: "coin" }
  ];

  for (let i = 0; i < numSymbols; i++) {
    const px = rnd(section.xStart + 15, section.xEnd - 25);
    const py = rnd(voice.yStart + 12, voice.yEnd - 12);
    const prep = rndChoice(preparations);

    // Draw preparation indicator
    fill(features.palette.ink);
    noStroke();
    textSize(10 * scaleFactor);
    textAlign(CENTER, CENTER);
    text(prep.symbol, px, py);

    // Optional label
    if (rndBool(0.25)) {
      textSize(5 * scaleFactor);
      fill(features.palette.ink + "60");
      text(prep.name, px, py + 10 * scaleFactor);
    }
  }

  textAlign(LEFT, TOP);
}

// --- 9. Cage Time Brackets ---
function drawCageTimeBrackets(voice, section) {
  const numBrackets = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink + "80");
  strokeWeight(1 * scaleFactor);

  for (let i = 0; i < numBrackets; i++) {
    const bx = rnd(section.xStart + 15, section.xEnd - 80);
    const bracketWidth = rnd(40, 100) * scaleFactor;
    const by = rnd(voice.yStart + 15, voice.yEnd - 15);
    const bracketHeight = 8 * scaleFactor;

    // Bracket shape with flexible ends
    noFill();

    // Left bracket with time
    line(bx, by - bracketHeight, bx, by + bracketHeight);
    line(bx, by - bracketHeight, bx + 5 * scaleFactor, by - bracketHeight);
    line(bx, by + bracketHeight, bx + 5 * scaleFactor, by + bracketHeight);

    // Right bracket with time
    line(bx + bracketWidth, by - bracketHeight, bx + bracketWidth, by + bracketHeight);
    line(bx + bracketWidth, by - bracketHeight, bx + bracketWidth - 5 * scaleFactor, by - bracketHeight);
    line(bx + bracketWidth, by + bracketHeight, bx + bracketWidth - 5 * scaleFactor, by + bracketHeight);

    // Time markings
    fill(features.palette.ink + "70");
    noStroke();
    textSize(5 * scaleFactor);
    textAlign(CENTER, CENTER);

    const startMin = rndInt(0, 5);
    const startSec = rndInt(0, 59);
    const endMin = startMin + rndInt(0, 3);
    const endSec = rndInt(0, 59);

    text(`${startMin}'${startSec.toString().padStart(2, '0')}"`, bx, by - bracketHeight - 5 * scaleFactor);
    text(`${endMin}'${endSec.toString().padStart(2, '0')}"`, bx + bracketWidth, by - bracketHeight - 5 * scaleFactor);

    stroke(features.palette.ink + "80");
    textAlign(LEFT, TOP);
  }
}

// --- 10. Chance Operation Marks ---
function drawChanceOperationMarks(voice, section) {
  const numMarks = Math.max(1, Math.floor(rnd(4, 10) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textAlign(CENTER, CENTER);

  const chanceSymbols = [
    "⚀", "⚁", "⚂", "⚃", "⚄", "⚅", // Dice
    "☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷", // Trigrams
    "○●", "●○", // Coin tosses
    "?", "⟳", "↺", "∞" // Choice/random
  ];

  for (let i = 0; i < numMarks; i++) {
    const cx = rnd(section.xStart + 15, section.xEnd - 15);
    const cy = rnd(voice.yStart + 12, voice.yEnd - 12);

    textSize(rnd(10, 16) * scaleFactor);
    text(rndChoice(chanceSymbols), cx, cy);
  }

  textAlign(LEFT, TOP);
}

// --- 11. Circus Overlays (independent parts) ---
function drawCircusOverlays(voice, section) {
  const numParts = rndInt(3, 6);

  // Draw independent, overlapping "parts"
  for (let p = 0; p < numParts; p++) {
    const partX = rnd(section.xStart, section.xEnd - 40);
    const partWidth = rnd(30, 80) * scaleFactor;
    const partY = rnd(voice.yStart + 5, voice.yEnd - 20);
    const partHeight = rnd(15, 40) * scaleFactor;

    // Light boundary
    stroke(features.palette.ink + "25");
    strokeWeight(0.5 * scaleFactor);
    noFill();
    rect(partX, partY, partWidth, partHeight);

    // Content inside part (random symbols/lines)
    const contentType = rndInt(0, 3);

    switch (contentType) {
      case 0: // Dots
        fill(features.palette.ink + "50");
        noStroke();
        for (let d = 0; d < rndInt(3, 8); d++) {
          ellipse(partX + rnd(5, partWidth - 5), partY + rnd(5, partHeight - 5),
                  rnd(2, 4) * scaleFactor, rnd(2, 4) * scaleFactor);
        }
        break;

      case 1: // Lines
        stroke(features.palette.ink + "40");
        for (let l = 0; l < rndInt(2, 5); l++) {
          line(partX + rnd(0, partWidth), partY + rnd(0, partHeight),
               partX + rnd(0, partWidth), partY + rnd(0, partHeight));
        }
        break;

      case 2: // Letter/number
        fill(features.palette.ink + "40");
        noStroke();
        textSize(12 * scaleFactor);
        textAlign(CENTER, CENTER);
        text(String.fromCharCode(65 + p), partX + partWidth/2, partY + partHeight/2);
        textAlign(LEFT, TOP);
        break;

      case 3: // Squiggle
        stroke(features.palette.ink + "35");
        strokeWeight(0.8 * scaleFactor);
        noFill();
        beginShape();
        for (let s = 0; s < 6; s++) {
          curveVertex(partX + rnd(0, partWidth), partY + rnd(0, partHeight));
        }
        endShape();
        break;
    }
  }
}

// --- 12. Indeterminacy Symbols ---
function drawIndeterminacySymbols(voice, section) {
  const numSymbols = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  const indeterminateMarks = [
    "ad lib.", "?", "~", "↔", "⟳", "[ ]", "...", "etc.", "○/●", "±"
  ];

  fill(features.palette.ink + "80");
  noStroke();
  textSize(8 * scaleFactor);
  textAlign(CENTER, CENTER);

  for (let i = 0; i < numSymbols; i++) {
    const ix = rnd(section.xStart + 20, section.xEnd - 20);
    const iy = rnd(voice.yStart + 12, voice.yEnd - 12);
    text(rndChoice(indeterminateMarks), ix, iy);
  }

  textAlign(LEFT, TOP);
}

// --- 13. Event Notation (Happenings) ---
function drawEventNotation(voice, section) {
  const numEvents = Math.max(1, Math.floor(rnd(2, 6) * features.densityValue));

  const events = [
    "open window", "drop object", "walk", "pause", "listen", "breathe",
    "touch", "look", "wait", "move", "stop", "begin", "end", "repeat",
    "any sound", "silence", "speak", "gesture", "observe"
  ];

  for (let i = 0; i < numEvents; i++) {
    const ex = rnd(section.xStart + 25, section.xEnd - 50);
    const ey = rnd(voice.yStart + 15, voice.yEnd - 15);

    // Event box
    stroke(features.palette.ink + "50");
    strokeWeight(0.8 * scaleFactor);
    noFill();

    const event = rndChoice(events);
    textSize(7 * scaleFactor);
    const textW = textWidth(event) + 10 * scaleFactor;
    const boxH = 14 * scaleFactor;

    rect(ex, ey - boxH/2, textW, boxH, 2 * scaleFactor);

    // Event text
    fill(features.palette.ink + "70");
    noStroke();
    textAlign(LEFT, CENTER);
    text(event, ex + 5 * scaleFactor, ey);
  }

  textAlign(LEFT, TOP);
}

// --- 14. Notation Types (Concert for Piano) ---
function drawNotationTypes(voice, section) {
  const numTypes = Math.max(1, Math.floor(rnd(4, 10) * features.densityValue));

  for (let i = 0; i < numTypes; i++) {
    const nx = rnd(section.xStart + 15, section.xEnd - 25);
    const ny = rnd(voice.yStart + 15, voice.yEnd - 15);
    const notationType = rndInt(0, 7);

    stroke(features.palette.ink);
    strokeWeight(1 * scaleFactor);

    switch (notationType) {
      case 0: // Point cluster
        noStroke();
        fill(features.palette.ink);
        for (let p = 0; p < rndInt(3, 7); p++) {
          ellipse(nx + rnd(-8, 8) * scaleFactor, ny + rnd(-8, 8) * scaleFactor,
                  rnd(2, 4) * scaleFactor, rnd(2, 4) * scaleFactor);
        }
        break;

      case 1: // Ascending line
        noFill();
        line(nx, ny + 10 * scaleFactor, nx + 20 * scaleFactor, ny - 10 * scaleFactor);
        break;

      case 2: // Wavy line
        noFill();
        beginShape();
        for (let w = 0; w < 5; w++) {
          vertex(nx + w * 8 * scaleFactor, ny + sin(w * PI) * 5 * scaleFactor);
        }
        endShape();
        break;

      case 3: // Bracket with number
        noFill();
        line(nx, ny - 8 * scaleFactor, nx, ny + 8 * scaleFactor);
        line(nx, ny - 8 * scaleFactor, nx + 3 * scaleFactor, ny - 8 * scaleFactor);
        fill(features.palette.ink);
        noStroke();
        textSize(6 * scaleFactor);
        textAlign(LEFT, CENTER);
        text(rndInt(1, 12), nx + 5 * scaleFactor, ny);
        break;

      case 4: // X with circle
        noFill();
        line(nx - 5 * scaleFactor, ny - 5 * scaleFactor, nx + 5 * scaleFactor, ny + 5 * scaleFactor);
        line(nx - 5 * scaleFactor, ny + 5 * scaleFactor, nx + 5 * scaleFactor, ny - 5 * scaleFactor);
        ellipse(nx, ny, 14 * scaleFactor, 14 * scaleFactor);
        break;

      case 5: // Arrow
        noFill();
        line(nx, ny, nx + 20 * scaleFactor, ny);
        line(nx + 15 * scaleFactor, ny - 4 * scaleFactor, nx + 20 * scaleFactor, ny);
        line(nx + 15 * scaleFactor, ny + 4 * scaleFactor, nx + 20 * scaleFactor, ny);
        break;

      case 6: // Grid cell
        noFill();
        rect(nx, ny - 6 * scaleFactor, 12 * scaleFactor, 12 * scaleFactor);
        if (rndBool(0.5)) {
          fill(features.palette.ink + "50");
          ellipse(nx + 6 * scaleFactor, ny, 4 * scaleFactor, 4 * scaleFactor);
        }
        break;

      case 7: // Stem with flag
        noFill();
        line(nx, ny + 10 * scaleFactor, nx, ny - 10 * scaleFactor);
        line(nx, ny - 10 * scaleFactor, nx + 8 * scaleFactor, ny - 5 * scaleFactor);
        fill(features.palette.ink);
        ellipse(nx, ny + 10 * scaleFactor, 5 * scaleFactor, 4 * scaleFactor);
        break;
    }
  }

  textAlign(LEFT, TOP);
}

// --- 15. Mycological Forms (Cage was a mycologist) ---
function drawMycologicalForms(voice, section) {
  const numMushrooms = Math.max(1, Math.floor(rnd(2, 6) * features.densityValue));

  for (let i = 0; i < numMushrooms; i++) {
    const mx = rnd(section.xStart + 25, section.xEnd - 25);
    const my = rnd(voice.yStart + 25, voice.yEnd - 15);
    const msize = rnd(12, 25) * scaleFactor;

    stroke(features.palette.ink + "70");
    strokeWeight(0.8 * scaleFactor);
    noFill();

    // Mushroom cap (various shapes)
    const capType = rndInt(0, 3);

    switch (capType) {
      case 0: // Dome cap
        arc(mx, my, msize * 2, msize * 1.2, PI, TWO_PI);
        break;
      case 1: // Flat cap
        beginShape();
        vertex(mx - msize, my);
        bezierVertex(mx - msize * 0.5, my - msize * 0.3, mx + msize * 0.5, my - msize * 0.3, mx + msize, my);
        endShape();
        break;
      case 2: // Wavy cap
        beginShape();
        for (let a = PI; a <= TWO_PI; a += PI/8) {
          const wr = msize * (1 + sin(a * 4) * 0.15);
          vertex(mx + cos(a) * wr, my + sin(a) * wr * 0.6);
        }
        endShape();
        break;
      case 3: // Conical cap
        triangle(mx - msize, my, mx, my - msize * 0.8, mx + msize, my);
        break;
    }

    // Stem
    const stemHeight = msize * rnd(0.8, 1.5);
    line(mx - msize * 0.15, my, mx - msize * 0.2, my + stemHeight);
    line(mx + msize * 0.15, my, mx + msize * 0.2, my + stemHeight);

    // Optional gills or dots on cap
    if (rndBool(0.4)) {
      const numDots = rndInt(3, 7);
      fill(features.palette.ink + "40");
      noStroke();
      for (let d = 0; d < numDots; d++) {
        const dotAngle = rnd(PI * 1.2, PI * 1.8);
        const dotR = rnd(0.3, 0.8) * msize;
        ellipse(mx + cos(dotAngle) * dotR, my + sin(dotAngle) * dotR * 0.5,
                2 * scaleFactor, 2 * scaleFactor);
      }
    }
  }
}

// --- 16. Number Piece Brackets ---
function drawNumberPieceBrackets(voice, section) {
  const numBrackets = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  // Floating time windows in the style of Cage's number pieces
  for (let i = 0; i < numBrackets; i++) {
    const bx = rnd(section.xStart + 20, section.xEnd - 70);
    const by = rnd(voice.yStart + 10, voice.yEnd - 20);
    const bracketW = rnd(40, 90) * scaleFactor;
    const bracketH = rnd(15, 30) * scaleFactor;

    // Soft rounded rectangle
    stroke(features.palette.ink + "40");
    strokeWeight(1 * scaleFactor);
    noFill();
    rect(bx, by, bracketW, bracketH, 3 * scaleFactor);

    // Time range notation
    fill(features.palette.ink + "60");
    noStroke();
    textSize(6 * scaleFactor);
    textAlign(LEFT, TOP);

    const t1 = rndInt(0, 10);
    const t2 = t1 + rndInt(1, 5);
    text(`${t1}'—${t2}'`, bx + 3 * scaleFactor, by + 2 * scaleFactor);

    // Sound indication inside
    textAlign(CENTER, CENTER);
    textSize(8 * scaleFactor);
    fill(features.palette.ink + "50");

    const sounds = ["tone", "noise", "—", "○", "any", "held"];
    text(rndChoice(sounds), bx + bracketW/2, by + bracketH/2 + 3 * scaleFactor);
  }

  textAlign(LEFT, TOP);
}

// --- 17. Radio Static Dots (Imaginary Landscape) ---
function drawRadioStaticDots(voice, section) {
  // Dense field of varying-size dots like radio static
  const numDots = Math.max(10, Math.floor(features.densityValue * 80));

  noStroke();

  for (let i = 0; i < numDots; i++) {
    const dx = rnd(section.xStart, section.xEnd);
    const dy = rnd(voice.yStart, voice.yEnd);

    // Varying opacity based on "signal strength"
    const signal = rnd(0, 1);
    const opacity = Math.floor(signal * 60 + 10);
    fill(features.palette.ink + opacity.toString(16).padStart(2, '0'));

    // Size varies with signal
    const dotSize = (0.5 + signal * 2) * scaleFactor;
    ellipse(dx, dy, dotSize, dotSize);
  }

  // Occasional horizontal "scan lines"
  if (rndBool(0.5)) {
    stroke(features.palette.ink + "15");
    strokeWeight(0.5 * scaleFactor);
    const numLines = rndInt(2, 5);
    for (let l = 0; l < numLines; l++) {
      const lineY = rnd(voice.yStart, voice.yEnd);
      line(section.xStart, lineY, section.xEnd, lineY);
    }
  }
}

// --- 18. Water Walk Symbols (action notation) ---
function drawWaterWalkSymbols(voice, section) {
  const numActions = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  const actions = [
    { icon: "♬", label: "piano" },
    { icon: "≋", label: "water" },
    { icon: "◐", label: "radio" },
    { icon: "⏱", label: "timer" },
    { icon: "⍾", label: "bell" },
    { icon: "♨", label: "steam" },
    { icon: "❄", label: "ice" },
    { icon: "→", label: "move" },
    { icon: "⬤", label: "strike" },
    { icon: "∿", label: "pour" }
  ];

  for (let i = 0; i < numActions; i++) {
    const ax = rnd(section.xStart + 20, section.xEnd - 40);
    const ay = rnd(voice.yStart + 15, voice.yEnd - 15);
    const action = rndChoice(actions);

    // Action icon
    fill(features.palette.ink);
    noStroke();
    textSize(12 * scaleFactor);
    textAlign(CENTER, CENTER);
    text(action.icon, ax, ay);

    // Label below
    if (rndBool(0.4)) {
      textSize(5 * scaleFactor);
      fill(features.palette.ink + "60");
      text(action.label, ax, ay + 12 * scaleFactor);
    }

    // Timeline arrow
    if (rndBool(0.5)) {
      stroke(features.palette.ink + "40");
      strokeWeight(0.8 * scaleFactor);
      const arrowLen = rnd(15, 35) * scaleFactor;
      line(ax + 10 * scaleFactor, ay, ax + 10 * scaleFactor + arrowLen, ay);
    }
  }

  textAlign(LEFT, TOP);
}

// --- 19. Zen Circles (Ensō) - Cage's Zen influence ---
function drawZenCircles(voice, section) {
  const numCircles = Math.max(1, Math.floor(rnd(1, 4) * features.densityValue));

  for (let i = 0; i < numCircles; i++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 25, voice.yEnd - 25);
    const radius = rnd(15, 35) * scaleFactor;

    // Ensō - incomplete circle with brush-like stroke
    stroke(features.palette.ink + "80");
    strokeWeight(rnd(2, 5) * scaleFactor);
    noFill();

    // Draw most of circle but leave gap (zen incompleteness)
    const startAngle = rnd(0, TWO_PI);
    const arcLength = rnd(PI * 1.4, PI * 1.9); // Not quite complete

    arc(cx, cy, radius * 2, radius * 2, startAngle, startAngle + arcLength);

    // Brush "tail" effect at end
    if (rndBool(0.6)) {
      const tailAngle = startAngle + arcLength;
      const tailX = cx + cos(tailAngle) * radius;
      const tailY = cy + sin(tailAngle) * radius;
      strokeWeight(rnd(0.5, 1.5) * scaleFactor);
      line(tailX, tailY,
           tailX + cos(tailAngle + 0.3) * 8 * scaleFactor,
           tailY + sin(tailAngle + 0.3) * 8 * scaleFactor);
    }
  }
}

// --- 20. Anarchy/Freedom Symbols (Cage's anarchist influence) ---
function drawAnarchySymbols(voice, section) {
  const numSymbols = Math.max(1, Math.floor(rnd(3, 7) * features.densityValue));

  const freedomMarks = [
    "free", "any", "all", "none", "open", "∞",
    "⊕", "≈", "∴", "∵", "⇌", "⤳"
  ];

  for (let i = 0; i < numSymbols; i++) {
    const fx = rnd(section.xStart + 15, section.xEnd - 20);
    const fy = rnd(voice.yStart + 12, voice.yEnd - 12);

    fill(features.palette.ink + "70");
    noStroke();
    textSize(rnd(7, 11) * scaleFactor);
    textAlign(CENTER, CENTER);
    text(rndChoice(freedomMarks), fx, fy);
  }

  textAlign(LEFT, TOP);
}

// ============================================================
// MODE-SPECIFIC DRAWING: SPECTRAL (Murail/Grisey) - Enhanced
// ============================================================

// Engraving helper: Draw hatching lines within a shape
function drawHatching(x, y, w, h, angle, spacing, intensity) {
  const s = spacing * scaleFactor;
  const len = Math.sqrt(w * w + h * h);
  const cos_a = cos(angle);
  const sin_a = sin(angle);

  stroke(features.palette.ink);
  strokeWeight(0.3 * scaleFactor * intensity);

  for (let i = -len; i < len; i += s) {
    const x1 = x + w/2 + cos_a * i - sin_a * len;
    const y1 = y + h/2 + sin_a * i + cos_a * len;
    const x2 = x + w/2 + cos_a * i + sin_a * len;
    const y2 = y + h/2 + sin_a * i - cos_a * len;

    // Clip to bounding box
    if (x1 >= x - w && x1 <= x + w * 2 && x2 >= x - w && x2 <= x + w * 2) {
      line(
        constrain(x1, x, x + w), constrain(y1, y, y + h),
        constrain(x2, x, x + w), constrain(y2, y, y + h)
      );
    }
  }
}

// Engraving helper: Draw cross-hatching
function drawCrossHatching(x, y, w, h, spacing, intensity) {
  drawHatching(x, y, w, h, PI/4, spacing, intensity);
  drawHatching(x, y, w, h, -PI/4, spacing * 1.2, intensity * 0.7);
}

// Engraving helper: Draw stippling (dots)
function drawStippling(x, y, w, h, density, intensity) {
  const numDots = Math.floor(w * h * density * 0.01 * intensity);
  fill(features.palette.ink);
  noStroke();

  for (let i = 0; i < numDots; i++) {
    const dx = x + rnd(0, w);
    const dy = y + rnd(0, h);
    const size = rnd(0.3, 1.2) * scaleFactor * intensity;
    ellipse(dx, dy, size, size);
  }
}

// Spectral Waterfall - detailed frequency-time spectrogram
function drawSpectralWaterfall(voice, section) {
  const numBins = Math.max(5, Math.floor(rnd(20, 40) * features.densityValue));
  const timeSteps = Math.floor(section.width / (4 * scaleFactor));
  const binHeight = voice.height / numBins;

  stroke(features.palette.ink);

  for (let t = 0; t < timeSteps; t++) {
    const x = section.xStart + (t / timeSteps) * section.width;

    for (let f = 0; f < numBins; f++) {
      const y = voice.yStart + f * binHeight;

      // Simulate spectral energy with noise
      const energy = noise(t * 0.1, f * 0.15) * rnd(0.3, 1);

      if (energy > 0.3) {
        // Fine horizontal lines for each bin
        const lineCount = Math.floor(energy * 4);
        strokeWeight(0.2 * scaleFactor);

        for (let l = 0; l < lineCount; l++) {
          const ly = y + (l / lineCount) * binHeight * 0.8;
          const lineLen = energy * 8 * scaleFactor;
          stroke(features.palette.ink + Math.floor(energy * 200).toString(16).padStart(2, '0'));
          line(x, ly, x + lineLen, ly);
        }
      }
    }
  }
}

// Formant Contours - smooth resonance curves with hatching
function drawFormantContours(voice, section) {
  const numFormants = rndInt(2, 5);

  for (let f = 0; f < numFormants; f++) {
    const centerFreq = rnd(0.2, 0.8); // Normalized frequency
    const bandwidth = rnd(0.05, 0.15);
    const startX = section.xStart + rnd(0, section.width * 0.3);
    const endX = section.xEnd - rnd(0, section.width * 0.3);

    // Draw formant envelope
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * scaleFactor);
    noFill();

    beginShape();
    const points = [];
    for (let t = 0; t <= 30; t++) {
      const progress = t / 30;
      const x = startX + progress * (endX - startX);

      // Formant frequency modulation
      const freqMod = sin(progress * PI * rnd(1, 3)) * 0.1;
      const freq = centerFreq + freqMod;
      const y = voice.yStart + freq * voice.height;

      vertex(x, y);
      points.push({x, y});
    }
    endShape();

    // Add cross-hatching inside formant region
    if (points.length > 2 && rndBool(0.6)) {
      const midIdx = Math.floor(points.length / 2);
      const midX = points[midIdx].x;
      const midY = points[midIdx].y;
      const hatchWidth = rnd(30, 60) * scaleFactor;
      const hatchHeight = bandwidth * voice.height;

      push();
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.ellipse(midX, midY, hatchWidth, hatchHeight, 0, 0, TWO_PI);
      drawingContext.clip();
      drawCrossHatching(midX - hatchWidth, midY - hatchHeight, hatchWidth * 2, hatchHeight * 2, 3, 0.8);
      drawingContext.restore();
      pop();
    }

    // Formant label
    if (rndBool(0.5)) {
      fill(features.palette.inkLight);
      noStroke();
      textSize(7 * scaleFactor);
      text(`F${f + 1}`, startX + 5 * scaleFactor, voice.yStart + centerFreq * voice.height - 5 * scaleFactor);
    }
  }
}

// Attack Transients - sharp vertical spikes with stippling
function drawAttackTransients(voice, section) {
  const numTransients = Math.floor(rnd(3, 10) * features.densityValue);

  for (let i = 0; i < numTransients; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const attackHeight = rnd(0.4, 0.9) * voice.height;
    const attackWidth = rnd(8, 20) * scaleFactor;
    const baseY = voice.yEnd - 5 * scaleFactor;

    // Sharp attack envelope
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * 0.8 * scaleFactor);
    noFill();

    // Attack spike shape
    beginShape();
    vertex(x - attackWidth/2, baseY);
    vertex(x - attackWidth/4, baseY - attackHeight * 0.3);
    vertex(x, baseY - attackHeight); // Peak
    vertex(x + attackWidth/4, baseY - attackHeight * 0.5);
    vertex(x + attackWidth/2, baseY - attackHeight * 0.2);
    vertex(x + attackWidth, baseY);
    endShape();

    // Stippling for energy density
    const intensity = rnd(0.5, 1);
    drawStippling(
      x - attackWidth/2,
      baseY - attackHeight,
      attackWidth * 1.5,
      attackHeight,
      features.densityValue * 2,
      intensity
    );

    // Vertical onset line
    stroke(features.palette.ink + "60");
    strokeWeight(0.5 * scaleFactor);
    for (let y = baseY; y > baseY - attackHeight; y -= 3 * scaleFactor) {
      line(x, y, x, y - 1.5 * scaleFactor);
    }
  }
}

// Resonance Bells - bell-curve frequency response with hatching
function drawResonanceBells(voice, section) {
  const numBells = Math.floor(rnd(2, 6) * features.densityValue);

  for (let b = 0; b < numBells; b++) {
    const centerX = rnd(section.xStart + 40, section.xEnd - 40);
    const centerFreq = rnd(0.2, 0.8);
    const centerY = voice.yStart + centerFreq * voice.height;
    const bellWidth = rnd(40, 100) * scaleFactor;
    const bellHeight = rnd(20, 50) * scaleFactor;
    const q = rnd(0.5, 2); // Q factor affects sharpness

    // Draw bell curve outline
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * scaleFactor);
    noFill();

    beginShape();
    for (let i = -20; i <= 20; i++) {
      const t = i / 20;
      const x = centerX + t * bellWidth;
      // Gaussian/bell curve
      const amplitude = exp(-pow(t * q * 2, 2));
      const y = centerY - amplitude * bellHeight;
      vertex(x, y);
    }
    endShape();

    // Hatching fill based on Q
    const hatchAngle = rnd(0, PI);
    const hatchSpacing = map(q, 0.5, 2, 5, 2);

    push();
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.ellipse(centerX, centerY - bellHeight/2, bellWidth, bellHeight, 0, 0, TWO_PI);
    drawingContext.clip();
    drawHatching(centerX - bellWidth, centerY - bellHeight, bellWidth * 2, bellHeight, hatchAngle, hatchSpacing, 0.6);
    drawingContext.restore();
    pop();

    // Q factor annotation
    if (rndBool(0.4)) {
      fill(features.palette.inkLight);
      noStroke();
      textSize(6 * scaleFactor);
      text(`Q=${q.toFixed(1)}`, centerX + bellWidth/2 + 3 * scaleFactor, centerY);
    }

    // Center frequency marker
    stroke(features.palette.ink + "80");
    strokeWeight(0.5 * scaleFactor);
    line(centerX, centerY, centerX, centerY - bellHeight - 5 * scaleFactor);
  }
}

// Enhanced Harmonic Stacks with engraving
function drawHarmonicStacks(voice, section) {
  const numStacks = Math.floor(rnd(1, 3) * features.densityValue);

  for (let s = 0; s < numStacks; s++) {
    const baseX = rnd(section.xStart + 40, section.xEnd - 40);
    const baseY = voice.yEnd - 10 * scaleFactor;
    const numPartials = rndInt(6, 16);

    // Vertical axis line
    stroke(features.palette.ink + "40");
    strokeWeight(0.5 * scaleFactor);
    line(baseX, baseY, baseX, voice.yStart + 10 * scaleFactor);

    // Draw harmonic partials with varying techniques
    for (let i = 1; i <= numPartials; i++) {
      const y = baseY - (Math.log(i) / Math.log(numPartials + 1)) * voice.height * 0.85;
      const amplitude = rnd(0.3, 1) / sqrt(i); // Decreasing amplitude
      const width = amplitude * 60 * scaleFactor;

      // Main partial line
      stroke(features.palette.ink);
      strokeWeight(features.lineWeight * scaleFactor * (1 - i/numPartials * 0.5));
      line(baseX - width/2, y, baseX + width/2, y);

      // Hatching for strong partials
      if (amplitude > 0.5 && rndBool(0.6)) {
        const hatchH = 6 * scaleFactor;
        drawHatching(baseX - width/2, y - hatchH/2, width, hatchH, 0, 2, amplitude);
      }

      // Stippling for resonance
      if (i <= 4 && rndBool(0.4)) {
        drawStippling(baseX - width/2, y - 4 * scaleFactor, width, 8 * scaleFactor, 0.5, amplitude);
      }

      // Partial number
      if (i <= 8 || i === numPartials) {
        fill(features.palette.inkLight);
        noStroke();
        textSize(5 * scaleFactor);
        textAlign(RIGHT, CENTER);
        text(i.toString(), baseX - width/2 - 3 * scaleFactor, y);
        textAlign(LEFT, TOP);
      }
    }

    // Fundamental marker
    fill(features.palette.ink);
    noStroke();
    ellipse(baseX, baseY, 4 * scaleFactor, 4 * scaleFactor);
  }
}

// Original spectral bands with engraving enhancement
function drawSpectralBands(voice, section) {
  const numBands = Math.max(3, Math.floor(rnd(8, 20) * features.densityValue));

  for (let i = 0; i < numBands; i++) {
    const bandY = voice.yStart + (i / numBands) * voice.height;
    const bandHeight = (voice.height / numBands) * rnd(0.5, 0.9);
    const startX = rnd(section.xStart, section.xStart + section.width * 0.15);
    const endX = rnd(section.xEnd - section.width * 0.15, section.xEnd);
    const intensity = rnd(0.2, 1);

    // Envelope outline
    stroke(features.palette.ink);
    strokeWeight(0.5 * scaleFactor);
    noFill();

    beginShape();
    const topPoints = [];
    const steps = 25;

    for (let j = 0; j <= steps; j++) {
      const x = startX + (j / steps) * (endX - startX);
      const envelope = sin((j / steps) * PI) * intensity;
      const y = bandY + bandHeight * (1 - envelope);
      vertex(x, y);
      topPoints.push({x, y});
    }
    endShape();

    // Bottom line
    line(startX, bandY + bandHeight, endX, bandY + bandHeight);

    // Fill with technique based on intensity
    if (intensity > 0.7) {
      // Dense cross-hatching for high intensity
      drawCrossHatching(startX, bandY, endX - startX, bandHeight, 2.5, intensity);
    } else if (intensity > 0.4) {
      // Regular hatching for medium
      drawHatching(startX, bandY, endX - startX, bandHeight, PI/6, 3, intensity);
    } else {
      // Stippling for low intensity
      drawStippling(startX, bandY, endX - startX, bandHeight, features.densityValue, intensity);
    }
  }
}

// New Spectral functions v3.7.0

function drawSpectralPartials(voice, section) {
  // Individual harmonic partials with varying intensity (Grisey's Partiels)
  const fundamental = rnd(voice.yEnd - 20, voice.yEnd - 10);
  const startX = rnd(section.xStart + 10, section.xEnd - 100);
  const w = rnd(60, 120) * scaleFactor;
  const numPartials = rndInt(8, 16);

  for (let p = 1; p <= numPartials; p++) {
    // Harmonic series: partials at integer multiples
    const y = fundamental - (voice.height - 30) * log(p) / log(numPartials + 2);
    const intensity = 1 / sqrt(p); // Natural harmonic decay

    stroke(features.palette.ink + hex(Math.floor(intensity * 200), 2));
    strokeWeight(features.lineWeight * intensity * 1.5 * scaleFactor);
    line(startX, y, startX + w * intensity, y);

    // Slight vibration on stronger partials
    if (p <= 4 && rndBool(0.5)) {
      strokeWeight(0.3 * scaleFactor);
      for (let t = 0; t < 3; t++) {
        const vy = y + rnd(-2, 2) * scaleFactor;
        line(startX + t * 8 * scaleFactor, vy, startX + (t + 0.5) * 8 * scaleFactor, vy);
      }
    }
  }
}

function drawSpectralInharmonicity(voice, section) {
  // Inharmonic partial spreading (bell/piano string inharmonicity)
  const fundamental = rnd(voice.yEnd - 15, voice.yEnd - 5);
  const startX = rnd(section.xStart + 20, section.xEnd - 80);
  const w = rnd(50, 100) * scaleFactor;
  const numPartials = rndInt(6, 12);
  const inharmonicity = rnd(0.02, 0.08); // Inharmonicity coefficient

  stroke(features.palette.ink);
  noFill();

  for (let p = 1; p <= numPartials; p++) {
    // Inharmonic: f_n = f_1 * n * sqrt(1 + B*n^2)
    const stretch = sqrt(1 + inharmonicity * p * p);
    const idealY = fundamental - (voice.height - 30) * log(p) / log(numPartials + 2);
    const actualY = idealY - (stretch - 1) * 20 * scaleFactor; // Stretch upward

    const intensity = 1 / (p * 0.7);
    strokeWeight(features.lineWeight * intensity * scaleFactor);
    stroke(features.palette.ink + hex(Math.floor(intensity * 200), 2));
    line(startX, actualY, startX + w * intensity, actualY);
  }
}

function drawSpectralBeating(voice, section) {
  // Beating/interference patterns between close frequencies
  const numBeats = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let b = 0; b < numBeats; b++) {
    const startX = rnd(section.xStart + 15, section.xEnd - 100);
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const w = rnd(80, 140) * scaleFactor;
    const beatFreq = rnd(2, 6); // Number of beats

    strokeWeight(features.lineWeight * scaleFactor);

    // Upper frequency
    beginShape();
    for (let t = 0; t <= 1; t += 0.01) {
      const x = startX + t * w;
      const amp = sin(t * TWO_PI * beatFreq) * 0.5 + 0.5; // Amplitude modulation
      const py = y - 8 * scaleFactor + sin(t * TWO_PI * 20) * amp * 4 * scaleFactor;
      vertex(x, py);
    }
    endShape();

    // Lower frequency (slightly different)
    beginShape();
    for (let t = 0; t <= 1; t += 0.01) {
      const x = startX + t * w;
      const amp = sin(t * TWO_PI * beatFreq + PI) * 0.5 + 0.5;
      const py = y + 8 * scaleFactor + sin(t * TWO_PI * 19) * amp * 4 * scaleFactor;
      vertex(x, py);
    }
    endShape();
  }
}

function drawSpectralInterpolation(voice, section) {
  // Spectral interpolation between two spectra
  const startX = rnd(section.xStart + 15, section.xEnd - 120);
  const w = rnd(80, 140) * scaleFactor;
  const numBands = rndInt(5, 10);

  noFill();
  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 0.8 * scaleFactor);

  for (let band = 0; band < numBands; band++) {
    // Start and end Y positions (different spectra)
    const startY = voice.yStart + (band / numBands) * voice.height * 0.8 + rnd(-5, 5) * scaleFactor;
    const endY = voice.yStart + ((numBands - band) / numBands) * voice.height * 0.8 + rnd(-5, 5) * scaleFactor;

    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const x = startX + t * w;
      const y = lerp(startY, endY, t);
      vertex(x, y);
    }
    endShape();
  }

  // Interpolation arrows
  stroke(features.palette.ink + "66");
  const arrowX = startX + w / 2;
  line(arrowX, voice.yEnd - 5, arrowX, voice.yStart + 5);
  line(arrowX - 3 * scaleFactor, voice.yStart + 10, arrowX, voice.yStart + 5);
  line(arrowX + 3 * scaleFactor, voice.yStart + 10, arrowX, voice.yStart + 5);
}

function drawSpectralDifferenceTones(voice, section) {
  // Combination/difference tone visualization
  const startX = rnd(section.xStart + 20, section.xEnd - 80);
  const y1 = rnd(voice.yStart + 15, voice.yStart + voice.height * 0.3);
  const y2 = rnd(voice.yStart + voice.height * 0.4, voice.yStart + voice.height * 0.6);
  const w = rnd(40, 80) * scaleFactor;

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);

  // Two primary tones
  line(startX, y1, startX + w, y1);
  line(startX, y2, startX + w, y2);

  // Difference tone (below)
  const diffY = y2 + (y2 - y1);
  stroke(features.palette.ink + "88");
  strokeWeight(features.lineWeight * 0.7 * scaleFactor);
  drawingContext.setLineDash([3 * scaleFactor, 2 * scaleFactor]);
  line(startX + w * 0.3, diffY, startX + w, diffY);

  // Summation tone (above)
  const sumY = y1 - (y2 - y1) * 0.5;
  if (sumY > voice.yStart + 5) {
    line(startX + w * 0.3, sumY, startX + w, sumY);
  }
  drawingContext.setLineDash([]);

  // Labels
  fill(features.palette.ink + "88");
  noStroke();
  textSize(5 * scaleFactor);
  text("f₁", startX - 10 * scaleFactor, y1);
  text("f₂", startX - 10 * scaleFactor, y2);
  text("f₂-f₁", startX - 15 * scaleFactor, diffY);
}

function drawSpectralRingMod(voice, section) {
  // Ring modulation sidebands visualization
  const startX = rnd(section.xStart + 20, section.xEnd - 80);
  const centerY = rnd(voice.yStart + voice.height * 0.3, voice.yEnd - voice.height * 0.3);
  const w = rnd(50, 90) * scaleFactor;
  const spacing = rnd(15, 25) * scaleFactor;

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);

  // Carrier frequency (center)
  line(startX, centerY, startX + w, centerY);

  // Upper sideband
  stroke(features.palette.ink + "aa");
  line(startX, centerY - spacing, startX + w * 0.8, centerY - spacing);

  // Lower sideband
  line(startX, centerY + spacing, startX + w * 0.8, centerY + spacing);

  // Second-order sidebands (fainter)
  stroke(features.palette.ink + "55");
  strokeWeight(features.lineWeight * 0.6 * scaleFactor);
  if (centerY - spacing * 2 > voice.yStart + 5) {
    line(startX, centerY - spacing * 2, startX + w * 0.5, centerY - spacing * 2);
  }
  if (centerY + spacing * 2 < voice.yEnd - 5) {
    line(startX, centerY + spacing * 2, startX + w * 0.5, centerY + spacing * 2);
  }

  // Label
  fill(features.palette.ink + "66");
  noStroke();
  textSize(5 * scaleFactor);
  text("RM", startX + w + 5 * scaleFactor, centerY);
}

function drawSpectralCompression(voice, section) {
  // Spectral compression/expansion bands
  const startX = rnd(section.xStart + 15, section.xEnd - 100);
  const w = rnd(70, 120) * scaleFactor;
  const numBands = rndInt(6, 12);
  const isCompression = rndBool(0.5);

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 0.8 * scaleFactor);
  noFill();

  for (let band = 0; band < numBands; band++) {
    const normalSpacing = band / numBands;
    let startY, endY;

    if (isCompression) {
      // Compress toward center
      startY = voice.yStart + normalSpacing * voice.height;
      const compressed = 0.3 + normalSpacing * 0.4; // Compress to middle range
      endY = voice.yStart + compressed * voice.height;
    } else {
      // Expand from center
      const compressed = 0.3 + normalSpacing * 0.4;
      startY = voice.yStart + compressed * voice.height;
      endY = voice.yStart + normalSpacing * voice.height;
    }

    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const x = startX + t * w;
      const y = lerp(startY, endY, t);
      vertex(x, y);
    }
    endShape();
  }
}

function drawSpectralFiltering(voice, section) {
  // Spectral filter curves (LP, HP, BP)
  const filterType = rndInt(0, 3);
  const startX = rnd(section.xStart + 20, section.xEnd - 80);
  const w = rnd(50, 90) * scaleFactor;
  const h = voice.height * 0.6;
  const baseY = voice.yStart + voice.height * 0.2;

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 1.2 * scaleFactor);
  noFill();

  beginShape();
  for (let t = 0; t <= 1; t += 0.02) {
    const x = startX + t * w;
    let amplitude;

    if (filterType === 0) {
      // Low-pass filter
      amplitude = 1 / (1 + pow(t * 3, 4));
    } else if (filterType === 1) {
      // High-pass filter
      amplitude = 1 - 1 / (1 + pow(t * 3, 4));
    } else {
      // Band-pass filter
      const center = 0.5;
      amplitude = exp(-pow((t - center) * 5, 2));
    }

    const y = baseY + h * (1 - amplitude);
    vertex(x, y);
  }
  endShape();

  // Filter label
  fill(features.palette.ink + "88");
  noStroke();
  textSize(5 * scaleFactor);
  const labels = ["LP", "HP", "BP"];
  text(labels[filterType], startX + w + 5 * scaleFactor, baseY + h * 0.5);
}

function drawSpectralEnvelopeTime(voice, section) {
  // Spectral amplitude envelope over time
  const startX = rnd(section.xStart + 10, section.xEnd - 100);
  const w = rnd(80, 130) * scaleFactor;
  const numBands = rndInt(4, 8);

  noFill();

  for (let band = 0; band < numBands; band++) {
    const baseY = voice.yStart + (band / numBands) * voice.height * 0.8 + 10;
    const maxAmp = rnd(5, 15) * scaleFactor;
    const phase = rnd(0, TWO_PI);

    stroke(features.palette.ink + hex(Math.floor((1 - band / numBands) * 200), 2));
    strokeWeight(features.lineWeight * 0.8 * scaleFactor);

    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const x = startX + t * w;
      // Time-varying amplitude envelope
      const envelope = sin(t * PI) * sin(t * TWO_PI * 2 + phase) * maxAmp;
      const y = baseY + envelope;
      vertex(x, y);
    }
    endShape();
  }
}

function drawSpectralGesture(voice, section) {
  // Time-varying spectral gesture (Murail-style)
  const startX = rnd(section.xStart + 15, section.xEnd - 120);
  const w = rnd(100, 150) * scaleFactor;

  noFill();
  stroke(features.palette.ink);

  // Multiple traces showing spectral evolution
  const numTraces = rndInt(5, 10);
  for (let trace = 0; trace < numTraces; trace++) {
    const startY = voice.yStart + rnd(10, voice.height - 20);
    const gestureType = rndInt(0, 3);

    strokeWeight(features.lineWeight * rnd(0.5, 1) * scaleFactor);
    stroke(features.palette.ink + hex(Math.floor(rnd(100, 220)), 2));

    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const x = startX + t * w;
      let y = startY;

      if (gestureType === 0) {
        // Rising gesture
        y = startY - t * t * 30 * scaleFactor;
      } else if (gestureType === 1) {
        // Falling gesture
        y = startY + t * t * 30 * scaleFactor;
      } else {
        // Arc gesture
        y = startY - sin(t * PI) * 25 * scaleFactor;
      }

      y = constrain(y, voice.yStart + 5, voice.yEnd - 5);
      vertex(x, y);
    }
    endShape();
  }
}

function drawSpectralSonogram(voice, section) {
  // Sonogram-like dense display
  const numTimeSlices = Math.floor(section.width / (3 * scaleFactor));
  const numFreqBins = rndInt(15, 30);

  noStroke();
  const binHeight = voice.height / numFreqBins;
  const sliceWidth = 2 * scaleFactor;

  for (let t = 0; t < numTimeSlices; t++) {
    const x = section.xStart + t * 3 * scaleFactor;

    for (let f = 0; f < numFreqBins; f++) {
      const y = voice.yStart + f * binHeight;
      const energy = noise(t * 0.08, f * 0.12) * noise(t * 0.02, f * 0.05);

      if (energy > 0.2) {
        fill(features.palette.ink + hex(Math.floor(energy * 255), 2));
        rect(x, y, sliceWidth, binHeight * 0.8);
      }
    }
  }
}

function drawSpectralMorphing(voice, section) {
  // Morphing between spectral states
  const startX = rnd(section.xStart + 15, section.xEnd - 100);
  const w = rnd(70, 110) * scaleFactor;
  const numBands = rndInt(5, 9);

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 0.7 * scaleFactor);
  noFill();

  // Source spectrum (left) and target spectrum (right)
  const sourceFreqs = [];
  const targetFreqs = [];
  for (let i = 0; i < numBands; i++) {
    sourceFreqs.push(voice.yStart + (i / numBands) * voice.height * 0.8 + 10);
    targetFreqs.push(voice.yStart + rnd(0.1, 0.9) * voice.height);
  }

  // Draw morphing paths
  for (let i = 0; i < numBands; i++) {
    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const x = startX + t * w;
      // S-curve interpolation for smooth morphing
      const morph = 0.5 - 0.5 * cos(t * PI);
      const y = lerp(sourceFreqs[i], targetFreqs[i], morph);
      vertex(x, y);
    }
    endShape();
  }
}

function drawSpectralFundamental(voice, section) {
  // Emphasized fundamental with overtones radiating
  const fundamental = rnd(voice.yEnd - 25, voice.yEnd - 10);
  const cx = rnd(section.xStart + 30, section.xEnd - 30);

  // Strong fundamental
  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 2 * scaleFactor);
  fill(features.palette.ink);
  ellipse(cx, fundamental, 8 * scaleFactor, 8 * scaleFactor);

  // Overtones radiating upward
  noFill();
  for (let p = 2; p <= 8; p++) {
    const y = fundamental - (voice.height - 30) * log(p) / log(10);
    const intensity = 1 / p;

    stroke(features.palette.ink + hex(Math.floor(intensity * 200), 2));
    strokeWeight(features.lineWeight * intensity * scaleFactor);

    // Radiating lines
    line(cx, fundamental - 4 * scaleFactor, cx + rnd(-10, 10) * scaleFactor, y);
    ellipse(cx + rnd(-5, 5) * scaleFactor, y, 3 * scaleFactor * intensity, 3 * scaleFactor * intensity);
  }
}

function drawSpectralGliss(voice, section) {
  // Spectral glissando - all partials moving together
  const startX = rnd(section.xStart + 15, section.xEnd - 100);
  const w = rnd(70, 110) * scaleFactor;
  const numPartials = rndInt(5, 10);
  const glissDirection = rndBool(0.5) ? 1 : -1; // Up or down
  const glissAmount = rnd(20, 40) * scaleFactor * glissDirection;

  stroke(features.palette.ink);
  noFill();

  for (let p = 1; p <= numPartials; p++) {
    const startY = voice.yEnd - 10 - (voice.height - 20) * log(p) / log(numPartials + 2);
    const endY = startY - glissAmount;
    const intensity = 1 / sqrt(p);

    strokeWeight(features.lineWeight * intensity * scaleFactor);
    stroke(features.palette.ink + hex(Math.floor(intensity * 220), 2));

    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const x = startX + t * w;
      const y = lerp(startY, endY, t);
      vertex(x, constrain(y, voice.yStart + 5, voice.yEnd - 5));
    }
    endShape();
  }
}

function drawSpectralDecay(voice, section) {
  // Natural spectral decay curves (higher partials decay faster)
  const startX = rnd(section.xStart + 15, section.xEnd - 120);
  const w = rnd(100, 150) * scaleFactor;
  const numPartials = rndInt(6, 12);

  stroke(features.palette.ink);
  noFill();

  for (let p = 1; p <= numPartials; p++) {
    const y = voice.yEnd - 10 - (voice.height - 20) * log(p) / log(numPartials + 2);
    const decayRate = p * 0.5; // Higher partials decay faster

    strokeWeight(features.lineWeight * (1 / sqrt(p)) * scaleFactor);

    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const x = startX + t * w;
      const amplitude = exp(-t * decayRate);
      // Draw as horizontal line with varying alpha
      stroke(features.palette.ink + hex(Math.floor(amplitude * 200), 2));
      vertex(x, y);
    }
    endShape();
  }
}

function drawSpectralAdditive(voice, section) {
  // Additive synthesis visualization (stacked sine components)
  const startX = rnd(section.xStart + 15, section.xEnd - 100);
  const w = rnd(70, 110) * scaleFactor;
  const numComponents = rndInt(4, 8);
  const baseY = (voice.yStart + voice.yEnd) / 2;

  stroke(features.palette.ink);
  noFill();

  // Individual components
  for (let c = 1; c <= numComponents; c++) {
    const amplitude = (10 / c) * scaleFactor;
    const frequency = c;

    strokeWeight(features.lineWeight * 0.5 * scaleFactor);
    stroke(features.palette.ink + "66");

    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const x = startX + t * w;
      const y = baseY - c * 8 * scaleFactor + sin(t * TWO_PI * frequency) * amplitude;
      vertex(x, constrain(y, voice.yStart + 5, voice.yEnd - 5));
    }
    endShape();
  }

  // Sum (composite waveform)
  strokeWeight(features.lineWeight * 1.2 * scaleFactor);
  stroke(features.palette.ink);

  beginShape();
  for (let t = 0; t <= 1; t += 0.01) {
    const x = startX + t * w;
    let sum = 0;
    for (let c = 1; c <= numComponents; c++) {
      sum += sin(t * TWO_PI * c) * (10 / c);
    }
    const y = baseY + sum * scaleFactor * 0.5;
    vertex(x, constrain(y, voice.yStart + 5, voice.yEnd - 5));
  }
  endShape();
}

// ============================================================
// MODE-SPECIFIC DRAWING: SPIRAL (Crumb)
// ============================================================

function drawSpiralPaths(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const maxRadius = Math.min(section.width, voice.height) * 0.4;

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  // Spiral
  beginShape();
  const turns = rnd(1.5, 4);
  const points = 100;

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * turns * TWO_PI;
    const radius = (i / points) * maxRadius;
    const x = centerX + cos(angle) * radius;
    const y = centerY + sin(angle) * radius;
    vertex(x, y);
  }
  endShape();

  // Add note marks along spiral
  const numNotes = Math.floor(rnd(5, 15) * features.densityValue);
  fill(features.palette.ink);
  noStroke();

  for (let i = 0; i < numNotes; i++) {
    const t = rnd(0, 1);
    const angle = t * turns * TWO_PI;
    const radius = t * maxRadius;
    const x = centerX + cos(angle) * radius;
    const y = centerY + sin(angle) * radius;
    const size = rnd(2, 5) * scaleFactor;

    ellipse(x, y, size, size);
  }
}

function drawCircularNotation(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const radius = Math.min(section.width, voice.height) * 0.35;

  // Concentric circles
  stroke(features.palette.ink + "40");
  strokeWeight(0.5 * scaleFactor);
  noFill();

  for (let i = 1; i <= 5; i++) {
    ellipse(centerX, centerY, radius * 2 * (i / 5), radius * 2 * (i / 5));
  }

  // Radial divisions (numerological)
  const divisions = rndChoice([7, 13, 12, 8]); // Crumb's numbers
  for (let i = 0; i < divisions; i++) {
    const angle = (i / divisions) * TWO_PI - HALF_PI;
    const x2 = centerX + cos(angle) * radius;
    const y2 = centerY + sin(angle) * radius;
    line(centerX, centerY, x2, y2);
  }

  // Notes on circle
  fill(features.palette.ink);
  noStroke();
  const numNotes = Math.floor(rnd(5, 12) * features.densityValue);

  for (let i = 0; i < numNotes; i++) {
    const angle = rnd(0, TWO_PI);
    const r = radius * rnd(0.3, 1);
    const x = centerX + cos(angle) * r;
    const y = centerY + sin(angle) * r;
    ellipse(x, y, rnd(3, 7) * scaleFactor, rnd(3, 7) * scaleFactor);
  }
}

function drawRitualSymbols(voice, section) {
  const symbols = ["\u2605", "\u2606", "\u25CB", "\u25CF", "\u2022", "\u2218", "\u2219"];
  const numSymbols = Math.floor(rnd(2, 6) * features.densityValue);

  fill(features.palette.accent || features.palette.ink);
  noStroke();
  textSize(12 * scaleFactor);
  textAlign(CENTER, CENTER);

  for (let i = 0; i < numSymbols; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    text(rndChoice(symbols), x, y);
  }
  textAlign(LEFT, TOP);
}

// ============================================================
// ENHANCED SPIRAL MODE FUNCTIONS (v3.1.0)
// Inspired by George Crumb's circular/spiral notation
// ============================================================

// --- 1. Multiple Spiral Types ---
function drawSpiralVariants(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const maxRadius = Math.min(section.width, voice.height) * 0.4;

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  const spiralType = rndInt(0, 3);

  switch (spiralType) {
    case 0: // Logarithmic spiral (more organic, shell-like)
      beginShape();
      const a = 0.1;
      const b = 0.15;
      const logTurns = rnd(2, 4);
      for (let angle = 0; angle < logTurns * TWO_PI; angle += 0.05) {
        const r = a * Math.exp(b * angle) * maxRadius * 0.3;
        if (r <= maxRadius) {
          vertex(centerX + cos(angle) * r, centerY + sin(angle) * r);
        }
      }
      endShape();
      break;

    case 1: // Double spiral (yin-yang like)
      for (let s = 0; s < 2; s++) {
        beginShape();
        const turns = rnd(1.5, 3);
        const offset = s * PI;
        for (let i = 0; i < 80; i++) {
          const t = i / 80;
          const angle = t * turns * TWO_PI + offset;
          const radius = t * maxRadius;
          vertex(centerX + cos(angle) * radius, centerY + sin(angle) * radius);
        }
        endShape();
      }
      break;

    case 2: // Spiral arms (galaxy-like)
      const numArms = rndInt(3, 6);
      for (let arm = 0; arm < numArms; arm++) {
        beginShape();
        const armOffset = (arm / numArms) * TWO_PI;
        const turns = rnd(0.8, 1.5);
        for (let i = 0; i < 60; i++) {
          const t = i / 60;
          const angle = t * turns * TWO_PI + armOffset;
          const radius = t * maxRadius;
          vertex(centerX + cos(angle) * radius, centerY + sin(angle) * radius);
        }
        endShape();
      }
      break;

    case 3: // Fermat spiral (sunflower pattern)
      const goldenAngle = PI * (3 - Math.sqrt(5));
      const numPoints = Math.floor(rnd(50, 150) * features.densityValue);
      fill(features.palette.ink);
      noStroke();
      for (let i = 1; i < numPoints; i++) {
        const angle = i * goldenAngle;
        const r = Math.sqrt(i) * maxRadius * 0.08;
        if (r <= maxRadius) {
          const size = map(i, 1, numPoints, 2, 5) * scaleFactor;
          ellipse(centerX + cos(angle) * r, centerY + sin(angle) * r, size, size);
        }
      }
      break;
  }
}

// --- 2. Text Along Spiral Path ---
function drawSpiralText(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const maxRadius = Math.min(section.width, voice.height) * 0.38;

  // Crumb-style mystical/poetic text fragments
  const textOptions = [
    "vox balaenae", "night of the electric insects", "spiral galaxy",
    "ancient voices of children", "makrokosmos", "dream sequence",
    "the magic circle", "music of shadows", "dark angels",
    "celestial mechanics", "sea snail", "dream images",
    "primeval sounds", "voices from corona", "eleven echoes of autumn"
  ];

  const syllables = rndChoice(textOptions).split(" ");

  fill(features.palette.ink);
  noStroke();
  textAlign(CENTER, CENTER);

  const turns = rnd(1, 2.5);
  const totalLength = syllables.length;

  for (let i = 0; i < totalLength; i++) {
    const t = (i + 0.5) / totalLength;
    const angle = t * turns * TWO_PI - HALF_PI;
    const radius = (0.2 + t * 0.8) * maxRadius;
    const x = centerX + cos(angle) * radius;
    const y = centerY + sin(angle) * radius;

    push();
    translate(x, y);
    rotate(angle + HALF_PI);
    textSize(rnd(8, 14) * scaleFactor);
    text(syllables[i], 0, 0);
    pop();
  }

  textAlign(LEFT, TOP);
}

// --- 3. Segmented Spirals (with rests/gaps) ---
function drawSegmentedSpiral(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const maxRadius = Math.min(section.width, voice.height) * 0.4;

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * 1.5 * scaleFactor);
  noFill();

  const turns = rnd(2, 4);
  const numSegments = rndInt(5, 12);
  const gapRatio = rnd(0.15, 0.35);

  for (let seg = 0; seg < numSegments; seg++) {
    const segStart = seg / numSegments;
    const segEnd = (seg + 1 - gapRatio) / numSegments;

    beginShape();
    for (let t = segStart; t <= segEnd; t += 0.01) {
      const angle = t * turns * TWO_PI;
      const radius = t * maxRadius;
      vertex(centerX + cos(angle) * radius, centerY + sin(angle) * radius);
    }
    endShape();

    // Add rest symbols in gaps
    if (rndBool(0.5) && seg < numSegments - 1) {
      const gapMid = (segEnd + (seg + 1) / numSegments) / 2;
      const gapAngle = gapMid * turns * TWO_PI;
      const gapRadius = gapMid * maxRadius;
      const gx = centerX + cos(gapAngle) * gapRadius;
      const gy = centerY + sin(gapAngle) * gapRadius;

      // Draw rest symbol (simple slash or squiggle)
      push();
      translate(gx, gy);
      rotate(gapAngle);
      strokeWeight(1.5 * scaleFactor);
      if (rndBool(0.5)) {
        line(-4 * scaleFactor, -4 * scaleFactor, 4 * scaleFactor, 4 * scaleFactor);
      } else {
        noFill();
        arc(0, 0, 8 * scaleFactor, 8 * scaleFactor, 0, PI);
      }
      pop();
    }
  }
}

// --- 4. Musical Noteheads Along Spiral ---
function drawSpiralNoteheads(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const maxRadius = Math.min(section.width, voice.height) * 0.4;

  const turns = rnd(1.5, 3);
  const numNotes = Math.floor(rnd(8, 20) * features.densityValue);

  stroke(features.palette.ink);
  fill(features.palette.ink);

  for (let i = 0; i < numNotes; i++) {
    const t = (i + 0.5) / numNotes;
    const angle = t * turns * TWO_PI;
    const radius = t * maxRadius;
    const x = centerX + cos(angle) * radius;
    const y = centerY + sin(angle) * radius;

    const noteType = rndInt(0, 4);
    const noteSize = rnd(4, 8) * scaleFactor;

    push();
    translate(x, y);
    rotate(angle + HALF_PI);

    switch (noteType) {
      case 0: // Filled notehead (quarter/half)
        ellipse(0, 0, noteSize * 1.3, noteSize);
        break;

      case 1: // Open notehead (whole note)
        noFill();
        strokeWeight(1.2 * scaleFactor);
        ellipse(0, 0, noteSize * 1.4, noteSize);
        break;

      case 2: // Diamond notehead (harmonic)
        noFill();
        strokeWeight(1 * scaleFactor);
        quad(0, -noteSize/2, noteSize/2, 0, 0, noteSize/2, -noteSize/2, 0);
        break;

      case 3: // X notehead (percussion)
        strokeWeight(1.5 * scaleFactor);
        line(-noteSize/2, -noteSize/2, noteSize/2, noteSize/2);
        line(-noteSize/2, noteSize/2, noteSize/2, -noteSize/2);
        break;

      case 4: // Triangle notehead
        noFill();
        strokeWeight(1 * scaleFactor);
        triangle(0, -noteSize/2, -noteSize/2, noteSize/2, noteSize/2, noteSize/2);
        break;
    }

    // Sometimes add a stem
    if (rndBool(0.4) && noteType < 3) {
      strokeWeight(1 * scaleFactor);
      line(noteSize * 0.6, 0, noteSize * 0.6, -noteSize * 2);
    }

    pop();
  }
}

// --- 5. Enhanced Mystical/Zodiac/Alchemical Symbols ---
function drawMysticalSymbols(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const radius = Math.min(section.width, voice.height) * 0.35;

  // Zodiac symbols
  const zodiac = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  // Planetary symbols
  const planets = ["☉", "☽", "☿", "♀", "♂", "♃", "♄", "⛢", "♆", "♇"];
  // Alchemical/mystical
  const alchemy = ["☉", "☽", "🜁", "🜂", "🜃", "🜄", "☿", "♁", "⚶", "⚷"];
  // Crumb-style symbols
  const crumbSymbols = ["✶", "✴", "✵", "✷", "✸", "❋", "✺", "✹", "⊛", "⊕", "⊗", "⊙"];

  const symbolSets = [zodiac, planets, alchemy, crumbSymbols];
  const chosenSet = rndChoice(symbolSets);

  fill(features.palette.accent || features.palette.ink);
  noStroke();
  textAlign(CENTER, CENTER);

  // Arrange symbols in a circle
  const numSymbols = Math.min(chosenSet.length, rndInt(6, 12));
  const useSubset = rndBool(0.5);

  for (let i = 0; i < numSymbols; i++) {
    const angle = (i / numSymbols) * TWO_PI - HALF_PI;
    const r = radius * rnd(0.6, 1);
    const x = centerX + cos(angle) * r;
    const y = centerY + sin(angle) * r;

    textSize(rnd(10, 18) * scaleFactor);
    const sym = useSubset ? rndChoice(chosenSet) : chosenSet[i % chosenSet.length];
    text(sym, x, y);
  }

  // Add center symbol
  if (rndBool(0.6)) {
    textSize(rnd(16, 24) * scaleFactor);
    text(rndChoice(["☉", "⊙", "✴", "◉", "☽"]), centerX, centerY);
  }

  textAlign(LEFT, TOP);
}

// --- 6. Mandala-like Patterns ---
function drawMandalaPattern(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const maxRadius = Math.min(section.width, voice.height) * 0.42;

  stroke(features.palette.ink);
  noFill();

  // Multiple layers of rotational symmetry
  const symmetry = rndChoice([4, 6, 8, 12]);
  const numLayers = rndInt(3, 6);

  for (let layer = 1; layer <= numLayers; layer++) {
    const layerRadius = (layer / numLayers) * maxRadius;
    const layerWeight = map(layer, 1, numLayers, 0.5, 2);
    strokeWeight(layerWeight * scaleFactor);

    // Circular base
    if (rndBool(0.7)) {
      ellipse(centerX, centerY, layerRadius * 2, layerRadius * 2);
    }

    // Symmetric elements
    for (let i = 0; i < symmetry; i++) {
      const angle = (i / symmetry) * TWO_PI;

      push();
      translate(centerX, centerY);
      rotate(angle);

      const elementType = rndInt(0, 4);

      switch (elementType) {
        case 0: // Petal
          beginShape();
          vertex(0, 0);
          bezierVertex(
            layerRadius * 0.3, -layerRadius * 0.2,
            layerRadius * 0.7, -layerRadius * 0.1,
            layerRadius, 0
          );
          bezierVertex(
            layerRadius * 0.7, layerRadius * 0.1,
            layerRadius * 0.3, layerRadius * 0.2,
            0, 0
          );
          endShape();
          break;

        case 1: // Line with dot
          line(layerRadius * 0.3, 0, layerRadius * 0.9, 0);
          fill(features.palette.ink);
          ellipse(layerRadius, 0, 4 * scaleFactor, 4 * scaleFactor);
          noFill();
          break;

        case 2: // Arc
          arc(0, 0, layerRadius * 1.5, layerRadius * 1.5,
              -PI/symmetry * 0.8, PI/symmetry * 0.8);
          break;

        case 3: // Triangle pointing outward
          triangle(
            layerRadius * 0.5, 0,
            layerRadius * 0.8, -layerRadius * 0.15,
            layerRadius * 0.8, layerRadius * 0.15
          );
          break;

        case 4: // Small circles
          ellipse(layerRadius * 0.7, 0, layerRadius * 0.15, layerRadius * 0.15);
          break;
      }

      pop();
    }
  }

  // Center decoration
  fill(features.palette.ink);
  ellipse(centerX, centerY, maxRadius * 0.08, maxRadius * 0.08);
}

// --- 7. Fibonacci/Golden Ratio Spiral ---
function drawFibonacciSpiral(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const maxSize = Math.min(section.width, voice.height) * 0.8;

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  // Fibonacci sequence for box sizes
  const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34];
  const scale = maxSize / (fib[fib.length - 1] * 2.5);
  const numBoxes = rndInt(5, 8);

  let x = centerX;
  let y = centerY;
  let direction = 0; // 0=right, 1=down, 2=left, 3=up

  // Draw fibonacci boxes with quarter-circle arcs
  beginShape();
  let firstPoint = true;

  for (let i = 0; i < numBoxes; i++) {
    const size = fib[i] * scale;

    // Draw the box (light stroke)
    if (rndBool(0.6)) {
      strokeWeight(0.5 * scaleFactor);
      stroke(features.palette.ink + "40");
      rect(x, y, size, size);
    }

    // Draw arc
    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * 1.2 * scaleFactor);

    let arcX, arcY, startAngle, endAngle;

    switch (direction) {
      case 0: arcX = x + size; arcY = y + size; startAngle = PI; endAngle = PI + HALF_PI; break;
      case 1: arcX = x; arcY = y + size; startAngle = PI + HALF_PI; endAngle = TWO_PI; break;
      case 2: arcX = x; arcY = y; startAngle = 0; endAngle = HALF_PI; break;
      case 3: arcX = x + size; arcY = y; startAngle = HALF_PI; endAngle = PI; break;
    }

    arc(arcX, arcY, size * 2, size * 2, startAngle, endAngle);

    // Move to next position
    switch (direction) {
      case 0: x += size; break;
      case 1: y += size; break;
      case 2: x -= fib[i + 1] * scale; break;
      case 3: y -= fib[i + 1] * scale; break;
    }

    direction = (direction + 1) % 4;
  }

  // Add golden ratio annotation
  if (rndBool(0.4)) {
    fill(features.palette.ink + "80");
    noStroke();
    textSize(10 * scaleFactor);
    textAlign(CENTER, CENTER);
    text("φ", centerX, centerY);
    textAlign(LEFT, TOP);
  }
}

// --- 8. Spiral Sections in Wedges ---
function drawSpiralWedges(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const maxRadius = Math.min(section.width, voice.height) * 0.4;

  const numWedges = rndChoice([3, 4, 5, 6, 7, 8]);
  const wedgeAngle = TWO_PI / numWedges;

  stroke(features.palette.ink);
  noFill();

  for (let w = 0; w < numWedges; w++) {
    const startAngle = w * wedgeAngle - HALF_PI;
    const endAngle = startAngle + wedgeAngle;

    // Wedge outline
    strokeWeight(0.8 * scaleFactor);
    stroke(features.palette.ink + "60");
    line(centerX, centerY,
         centerX + cos(startAngle) * maxRadius,
         centerY + sin(startAngle) * maxRadius);

    // Spiral within wedge
    if (rndBool(0.7)) {
      stroke(features.palette.ink);
      strokeWeight(features.lineWeight * scaleFactor);

      beginShape();
      const turns = rnd(0.8, 1.5);
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const angle = startAngle + t * wedgeAngle * 0.9 + wedgeAngle * 0.05;
        const spiralAngle = t * turns * PI;
        const radius = (0.2 + t * 0.7) * maxRadius * (0.8 + 0.2 * sin(spiralAngle * 3));
        vertex(centerX + cos(angle) * radius, centerY + sin(angle) * radius);
      }
      endShape();
    }

    // Add notation marks in wedge
    if (rndBool(0.5)) {
      fill(features.palette.ink);
      noStroke();
      const numMarks = rndInt(2, 5);
      for (let m = 0; m < numMarks; m++) {
        const angle = startAngle + rnd(0.1, 0.9) * wedgeAngle;
        const r = rnd(0.3, 0.85) * maxRadius;
        ellipse(centerX + cos(angle) * r, centerY + sin(angle) * r,
                rnd(2, 4) * scaleFactor, rnd(2, 4) * scaleFactor);
      }
      noFill();
      stroke(features.palette.ink);
    }
  }

  // Outer circle
  strokeWeight(1.5 * scaleFactor);
  stroke(features.palette.ink);
  ellipse(centerX, centerY, maxRadius * 2, maxRadius * 2);
}

// --- 9. Eye/Circular Imagery (Crumb's "Eye of the Whale") ---
function drawCrumbEye(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const eyeWidth = Math.min(section.width, voice.height) * 0.7;
  const eyeHeight = eyeWidth * rnd(0.4, 0.6);

  stroke(features.palette.ink);
  noFill();

  // Outer eye shape
  strokeWeight(features.lineWeight * 1.5 * scaleFactor);
  beginShape();
  for (let a = 0; a <= TWO_PI; a += 0.1) {
    const r = eyeWidth / 2 * (1 - 0.5 * pow(sin(a), 2));
    const x = centerX + cos(a) * r;
    const y = centerY + sin(a) * r * (eyeHeight / eyeWidth * 2);
    vertex(x, y);
  }
  endShape(CLOSE);

  // Iris
  const irisRadius = eyeHeight * 0.6;
  strokeWeight(1 * scaleFactor);
  ellipse(centerX, centerY, irisRadius * 2, irisRadius * 2);

  // Pupil
  fill(features.palette.ink);
  const pupilRadius = irisRadius * 0.4;
  ellipse(centerX, centerY, pupilRadius * 2, pupilRadius * 2);

  // Iris texture (radial lines)
  noFill();
  stroke(features.palette.ink + "80");
  strokeWeight(0.5 * scaleFactor);
  const numRays = rndInt(12, 24);
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * TWO_PI;
    const innerR = pupilRadius * 1.1;
    const outerR = irisRadius * 0.95;
    line(
      centerX + cos(angle) * innerR,
      centerY + sin(angle) * innerR,
      centerX + cos(angle) * outerR,
      centerY + sin(angle) * outerR
    );
  }

  // Musical notation around eye
  fill(features.palette.ink);
  noStroke();
  textAlign(CENTER, CENTER);

  const notationRadius = eyeWidth / 2 * 1.1;
  const numNotes = Math.floor(rnd(6, 12) * features.densityValue);

  for (let i = 0; i < numNotes; i++) {
    const angle = (i / numNotes) * TWO_PI;
    const x = centerX + cos(angle) * notationRadius;
    const y = centerY + sin(angle) * notationRadius * (eyeHeight / eyeWidth * 2) * 1.2;

    // Draw small notehead
    ellipse(x, y, rnd(3, 6) * scaleFactor, rnd(3, 5) * scaleFactor);
  }

  // Eyelid lines (Crumb often adds decorative lines)
  if (rndBool(0.6)) {
    stroke(features.palette.ink + "60");
    strokeWeight(0.8 * scaleFactor);
    noFill();

    // Upper lid lines
    for (let l = 1; l <= 2; l++) {
      beginShape();
      for (let a = PI * 0.15; a <= PI * 0.85; a += 0.1) {
        const r = (eyeWidth / 2 + l * 8 * scaleFactor) * (1 - 0.5 * pow(sin(a), 2));
        vertex(centerX + cos(a + PI) * r, centerY + sin(a + PI) * r * (eyeHeight / eyeWidth * 2));
      }
      endShape();
    }
  }

  textAlign(LEFT, TOP);
}

// --- 10. Beaming Across Spiral ---
function drawSpiralBeaming(voice, section) {
  const centerX = section.xCenter;
  const centerY = voice.yCenter;
  const maxRadius = Math.min(section.width, voice.height) * 0.4;

  const turns = rnd(1.5, 2.5);
  const numBeamGroups = rndInt(3, 6);

  stroke(features.palette.ink);
  fill(features.palette.ink);

  for (let g = 0; g < numBeamGroups; g++) {
    const groupStart = g / numBeamGroups;
    const groupEnd = (g + 0.8) / numBeamGroups;
    const notesInGroup = rndInt(2, 5);

    const notePositions = [];

    // Calculate note positions along spiral
    for (let n = 0; n < notesInGroup; n++) {
      const t = groupStart + (n / (notesInGroup - 1 || 1)) * (groupEnd - groupStart);
      const angle = t * turns * TWO_PI;
      const radius = t * maxRadius;
      notePositions.push({
        x: centerX + cos(angle) * radius,
        y: centerY + sin(angle) * radius,
        angle: angle
      });
    }

    // Draw noteheads
    const noteSize = rnd(4, 7) * scaleFactor;
    const stemLength = noteSize * 3;
    const stemDir = rndBool(0.5) ? -1 : 1; // up or down

    for (let n = 0; n < notePositions.length; n++) {
      const pos = notePositions[n];

      // Notehead
      push();
      translate(pos.x, pos.y);
      rotate(pos.angle + HALF_PI);
      ellipse(0, 0, noteSize * 1.3, noteSize);

      // Stem
      strokeWeight(1.2 * scaleFactor);
      line(noteSize * 0.5, 0, noteSize * 0.5, stemLength * stemDir);
      pop();
    }

    // Draw beam connecting stems
    if (notesInGroup >= 2) {
      strokeWeight(2.5 * scaleFactor);

      // Calculate beam endpoints (at stem tips)
      const beamPoints = notePositions.map((pos, n) => {
        const stemEndX = pos.x + cos(pos.angle + HALF_PI) * noteSize * 0.5 +
                         cos(pos.angle + PI) * stemLength * stemDir;
        const stemEndY = pos.y + sin(pos.angle + HALF_PI) * noteSize * 0.5 +
                         sin(pos.angle + PI) * stemLength * stemDir;
        return { x: stemEndX, y: stemEndY };
      });

      // Draw primary beam
      beginShape();
      noFill();
      for (const pt of beamPoints) {
        vertex(pt.x, pt.y);
      }
      endShape();

      // Sometimes add secondary beam
      if (rndBool(0.4)) {
        strokeWeight(2 * scaleFactor);
        const offset = 4 * scaleFactor * stemDir;
        beginShape();
        for (const pt of beamPoints) {
          vertex(pt.x, pt.y - offset);
        }
        endShape();
      }
    }
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: TREATISE (Cardew)
// ============================================================

function drawTreatiseGeometric(voice, section) {
  // Abstract geometric shapes inspired by Cardew's Treatise
  const numShapes = Math.max(1, Math.floor(rnd(4, 12) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let i = 0; i < numShapes; i++) {
    const shapeType = rndInt(0, 6);
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const size = rnd(15, 60) * scaleFactor;

    strokeWeight(rnd(1, 4) * scaleFactor);

    switch (shapeType) {
      case 0: // Circle
        ellipse(x, y, size, size);
        break;
      case 1: // Thick horizontal line
        line(x - size/2, y, x + size/2, y);
        break;
      case 2: // Vertical line
        line(x, y - size/2, x, y + size/2);
        break;
      case 3: // Triangle
        triangle(x, y - size/2, x - size/2, y + size/2, x + size/2, y + size/2);
        break;
      case 4: // Square
        rect(x - size/2, y - size/2, size, size);
        break;
      case 5: // Arc
        arc(x, y, size, size, rnd(0, PI), rnd(PI, TWO_PI));
        break;
      case 6: // Filled circle
        fill(features.palette.ink);
        ellipse(x, y, size * 0.3, size * 0.3);
        noFill();
        break;
    }
  }
}

function drawTreatiseNumbers(voice, section) {
  // Number sequences like in Treatise
  const numCount = Math.floor(rnd(2, 6) * features.densityValue);

  fill(features.palette.ink);
  noStroke();
  textAlign(CENTER, CENTER);

  for (let i = 0; i < numCount; i++) {
    const x = rnd(section.xStart + 30, section.xEnd - 30);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const size = rnd(10, 24) * scaleFactor;
    textSize(size);

    // Sometimes single digits, sometimes sequences
    if (rndBool(0.5)) {
      text(rndInt(0, 9).toString(), x, y);
    } else {
      const seq = Array.from({length: rndInt(2, 4)}, () => rndInt(0, 9)).join("");
      text(seq, x, y);
    }
  }
  textAlign(LEFT, TOP);
}

function drawTreatiseThickLines(voice, section) {
  // Bold horizontal lines of varying thickness
  const numLines = Math.floor(rnd(2, 5) * features.densityValue);

  stroke(features.palette.ink);

  for (let i = 0; i < numLines; i++) {
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const startX = rnd(section.xStart, section.xStart + section.width * 0.3);
    const endX = rnd(startX + 50 * scaleFactor, section.xEnd);
    const thickness = rnd(3, 12) * scaleFactor;

    strokeWeight(thickness);
    line(startX, y, endX, y);
  }
}

// New Treatise functions v3.8.0

function drawTreatiseLifeline(voice, section) {
  // The central horizontal lifeline (a key Treatise element)
  const y = voice.yStart + voice.height * rnd(0.4, 0.6);

  stroke(features.palette.ink);
  strokeWeight(rnd(1, 3) * scaleFactor);
  line(section.xStart, y, section.xEnd, y);

  // Small marks along the lifeline
  if (rndBool(0.5)) {
    const numMarks = rndInt(3, 8);
    for (let i = 0; i < numMarks; i++) {
      const mx = section.xStart + rnd(0.1, 0.9) * section.width;
      const markType = rndInt(0, 3);

      if (markType === 0) {
        line(mx, y - 5 * scaleFactor, mx, y + 5 * scaleFactor);
      } else if (markType === 1) {
        ellipse(mx, y, 4 * scaleFactor, 4 * scaleFactor);
      } else {
        triangle(mx, y - 5 * scaleFactor, mx - 3 * scaleFactor, y + 3 * scaleFactor, mx + 3 * scaleFactor, y + 3 * scaleFactor);
      }
    }
  }
}

function drawTreatiseTree(voice, section) {
  // Tree/branching structures (common in Treatise)
  const numTrees = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let t = 0; t < numTrees; t++) {
    const rootX = rnd(section.xStart + 30, section.xEnd - 30);
    const rootY = rnd(voice.yStart + voice.height * 0.3, voice.yEnd - 10);
    const treeH = rnd(30, 60) * scaleFactor;
    const isUpward = rndBool(0.5);
    const direction = isUpward ? -1 : 1;

    strokeWeight(rnd(2, 4) * scaleFactor);

    // Main trunk
    line(rootX, rootY, rootX, rootY + direction * treeH);

    // Branches
    const numBranches = rndInt(2, 5);
    for (let b = 0; b < numBranches; b++) {
      const branchY = rootY + direction * (b + 1) * (treeH / (numBranches + 1));
      const branchLen = rnd(15, 40) * scaleFactor;
      const branchDir = rndBool(0.5) ? 1 : -1;

      strokeWeight(rnd(1, 2) * scaleFactor);
      line(rootX, branchY, rootX + branchDir * branchLen, branchY + direction * rnd(-10, 10) * scaleFactor);
    }
  }
}

function drawTreatiseClouds(voice, section) {
  // Dense clusters of small marks
  const numClouds = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  for (let c = 0; c < numClouds; c++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const cloudW = rnd(30, 70) * scaleFactor;
    const cloudH = rnd(20, 40) * scaleFactor;
    const numMarks = rndInt(20, 50);

    stroke(features.palette.ink);
    strokeWeight(features.lineWeight * scaleFactor);

    for (let m = 0; m < numMarks; m++) {
      const mx = cx + rndGaussian(0, cloudW / 3);
      const my = cy + rndGaussian(0, cloudH / 3);
      const markType = rndInt(0, 4);

      if (markType === 0) {
        point(mx, my);
      } else if (markType === 1) {
        line(mx, my, mx + rnd(-3, 3) * scaleFactor, my + rnd(-3, 3) * scaleFactor);
      } else if (markType === 2) {
        noFill();
        ellipse(mx, my, 2 * scaleFactor, 2 * scaleFactor);
      } else {
        line(mx - 2 * scaleFactor, my, mx + 2 * scaleFactor, my);
      }
    }
  }
}

function drawTreatiseParallelLines(voice, section) {
  // Groups of parallel lines (staff-like but not musical)
  const numGroups = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);

  for (let g = 0; g < numGroups; g++) {
    const startX = rnd(section.xStart + 10, section.xEnd - 80);
    const baseY = rnd(voice.yStart + 15, voice.yEnd - 30);
    const groupW = rnd(50, 120) * scaleFactor;
    const numLines = rndInt(3, 7);
    const spacing = rnd(4, 8) * scaleFactor;

    strokeWeight(rnd(0.5, 1.5) * scaleFactor);

    for (let l = 0; l < numLines; l++) {
      const y = baseY + l * spacing;
      line(startX, y, startX + groupW, y);
    }
  }
}

function drawTreatiseCurvedPath(voice, section) {
  // Flowing curved paths
  const numPaths = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let p = 0; p < numPaths; p++) {
    strokeWeight(rnd(1, 4) * scaleFactor);

    const startX = rnd(section.xStart + 10, section.xStart + section.width * 0.3);
    const endX = rnd(section.xEnd - section.width * 0.3, section.xEnd - 10);
    const startY = rnd(voice.yStart + 10, voice.yEnd - 10);
    const endY = rnd(voice.yStart + 10, voice.yEnd - 10);

    const cx1 = rnd(startX, endX);
    const cy1 = rnd(voice.yStart, voice.yEnd);
    const cx2 = rnd(startX, endX);
    const cy2 = rnd(voice.yStart, voice.yEnd);

    bezier(startX, startY, cx1, cy1, cx2, cy2, endX, endY);
  }
}

function drawTreatiseSolids(voice, section) {
  // Solid filled shapes
  const numSolids = Math.max(1, Math.floor(rnd(2, 6) * features.densityValue));

  fill(features.palette.ink);
  noStroke();

  for (let s = 0; s < numSolids; s++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const size = rnd(8, 25) * scaleFactor;
    const shapeType = rndInt(0, 4);

    if (shapeType === 0) {
      ellipse(x, y, size, size);
    } else if (shapeType === 1) {
      rect(x - size / 2, y - size / 2, size, size);
    } else if (shapeType === 2) {
      triangle(x, y - size / 2, x - size / 2, y + size / 2, x + size / 2, y + size / 2);
    } else {
      rect(x - size, y - size / 4, size * 2, size / 2);
    }
  }
}

function drawTreatiseNests(voice, section) {
  // Nested shapes (circles within circles)
  const numNests = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let n = 0; n < numNests; n++) {
    const cx = rnd(section.xStart + 40, section.xEnd - 40);
    const cy = rnd(voice.yStart + 30, voice.yEnd - 30);
    const maxSize = rnd(25, 50) * scaleFactor;
    const numRings = rndInt(2, 5);

    for (let r = 0; r < numRings; r++) {
      const ringSize = maxSize * (1 - r * 0.2);
      strokeWeight(rnd(0.5, 2) * scaleFactor);
      ellipse(cx, cy, ringSize, ringSize * rnd(0.7, 1));
    }
  }
}

function drawTreatiseZigzag(voice, section) {
  // Zigzag patterns
  const numZigzags = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let z = 0; z < numZigzags; z++) {
    strokeWeight(rnd(1, 3) * scaleFactor);

    const startX = rnd(section.xStart + 10, section.xEnd - 80);
    const baseY = rnd(voice.yStart + 20, voice.yEnd - 20);
    const amplitude = rnd(10, 25) * scaleFactor;
    const numPeaks = rndInt(3, 8);
    const segmentW = rnd(10, 20) * scaleFactor;

    beginShape();
    for (let i = 0; i <= numPeaks; i++) {
      const x = startX + i * segmentW;
      const y = baseY + (i % 2 === 0 ? -amplitude : amplitude);
      vertex(x, y);
    }
    endShape();
  }
}

function drawTreatiseWedge(voice, section) {
  // Wedge shapes (triangular)
  const numWedges = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  for (let w = 0; w < numWedges; w++) {
    const x = rnd(section.xStart + 20, section.xEnd - 60);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const wedgeW = rnd(40, 80) * scaleFactor;
    const wedgeH = rnd(15, 35) * scaleFactor;
    const isFilled = rndBool(0.4);
    const pointsLeft = rndBool(0.5);

    if (isFilled) {
      fill(features.palette.ink);
      noStroke();
    } else {
      noFill();
      stroke(features.palette.ink);
      strokeWeight(rnd(1, 2) * scaleFactor);
    }

    beginShape();
    if (pointsLeft) {
      vertex(x, y);
      vertex(x + wedgeW, y - wedgeH / 2);
      vertex(x + wedgeW, y + wedgeH / 2);
    } else {
      vertex(x, y - wedgeH / 2);
      vertex(x, y + wedgeH / 2);
      vertex(x + wedgeW, y);
    }
    endShape(CLOSE);
  }
}

function drawTreatiseScatteredDots(voice, section) {
  // Scattered dots
  const numDots = Math.floor(rnd(15, 50) * features.densityValue);

  fill(features.palette.ink);
  noStroke();

  for (let d = 0; d < numDots; d++) {
    const x = rnd(section.xStart + 5, section.xEnd - 5);
    const y = rnd(voice.yStart + 5, voice.yEnd - 5);
    const size = rnd(1, 4) * scaleFactor;
    ellipse(x, y, size, size);
  }
}

function drawTreatiseGrid(voice, section) {
  // Grid-like patterns
  const x = rnd(section.xStart + 20, section.xEnd - 80);
  const y = rnd(voice.yStart + 15, voice.yEnd - 40);
  const gridW = rnd(40, 80) * scaleFactor;
  const gridH = rnd(25, 45) * scaleFactor;
  const cols = rndInt(3, 6);
  const rows = rndInt(2, 4);

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  const cellW = gridW / cols;
  const cellH = gridH / rows;

  // Draw grid
  for (let c = 0; c <= cols; c++) {
    line(x + c * cellW, y, x + c * cellW, y + gridH);
  }
  for (let r = 0; r <= rows; r++) {
    line(x, y + r * cellH, x + gridW, y + r * cellH);
  }

  // Random marks in some cells
  fill(features.palette.ink);
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (rndBool(0.3)) {
        const cx = x + (c + 0.5) * cellW;
        const cy = y + (r + 0.5) * cellH;
        ellipse(cx, cy, 3 * scaleFactor, 3 * scaleFactor);
      }
    }
  }
}

function drawTreatiseAngle(voice, section) {
  // Angular constructions
  const numAngles = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let a = 0; a < numAngles; a++) {
    strokeWeight(rnd(1, 3) * scaleFactor);

    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const len1 = rnd(15, 40) * scaleFactor;
    const len2 = rnd(15, 40) * scaleFactor;
    const angle1 = rnd(0, TWO_PI);
    const angle2 = angle1 + rnd(PI / 4, PI);

    line(cx, cy, cx + cos(angle1) * len1, cy + sin(angle1) * len1);
    line(cx, cy, cx + cos(angle2) * len2, cy + sin(angle2) * len2);
  }
}

function drawTreatiseSymbols(voice, section) {
  // Small abstract symbols
  const numSymbols = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);

  for (let s = 0; s < numSymbols; s++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const size = rnd(5, 12) * scaleFactor;
    const symbolType = rndInt(0, 6);

    noFill();

    switch (symbolType) {
      case 0: // Plus
        line(x - size, y, x + size, y);
        line(x, y - size, x, y + size);
        break;
      case 1: // X
        line(x - size, y - size, x + size, y + size);
        line(x - size, y + size, x + size, y - size);
        break;
      case 2: // Small arc
        arc(x, y, size * 2, size * 2, 0, PI);
        break;
      case 3: // Asterisk
        for (let i = 0; i < 3; i++) {
          const angle = i * PI / 3;
          line(x + cos(angle) * size, y + sin(angle) * size, x - cos(angle) * size, y - sin(angle) * size);
        }
        break;
      case 4: // Arrow
        line(x - size, y, x + size, y);
        line(x + size * 0.5, y - size * 0.5, x + size, y);
        line(x + size * 0.5, y + size * 0.5, x + size, y);
        break;
      case 5: // Square with dot
        rect(x - size, y - size, size * 2, size * 2);
        fill(features.palette.ink);
        ellipse(x, y, 2 * scaleFactor, 2 * scaleFactor);
        noFill();
        break;
    }
  }
}

function drawTreatiseMass(voice, section) {
  // Dense black mass areas
  const numMasses = Math.max(1, Math.floor(rnd(1, 2) * features.densityValue));

  fill(features.palette.ink);
  noStroke();

  for (let m = 0; m < numMasses; m++) {
    const x = rnd(section.xStart + 20, section.xEnd - 50);
    const y = rnd(voice.yStart + 15, voice.yEnd - 25);
    const w = rnd(25, 60) * scaleFactor;
    const h = rnd(15, 35) * scaleFactor;

    // Irregular shape
    beginShape();
    const numVertices = rndInt(6, 10);
    for (let v = 0; v < numVertices; v++) {
      const angle = (v / numVertices) * TWO_PI;
      const r = (v % 2 === 0 ? w / 2 : w / 3) + rnd(-5, 5) * scaleFactor;
      vertex(x + w / 2 + cos(angle) * r, y + h / 2 + sin(angle) * r * (h / w));
    }
    endShape(CLOSE);
  }
}

function drawTreatiseConnectors(voice, section) {
  // Connecting lines between elements
  const numConnectors = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let c = 0; c < numConnectors; c++) {
    strokeWeight(rnd(0.5, 2) * scaleFactor);

    const x1 = rnd(section.xStart + 10, section.xEnd - 80);
    const y1 = rnd(voice.yStart + 10, voice.yEnd - 10);
    const x2 = x1 + rnd(40, 100) * scaleFactor;
    const y2 = rnd(voice.yStart + 10, voice.yEnd - 10);

    // Straight or curved connector
    if (rndBool(0.5)) {
      line(x1, y1, x2, y2);
    } else {
      const midY = Math.min(y1, y2) - rnd(10, 30) * scaleFactor;
      bezier(x1, y1, x1, midY, x2, midY, x2, y2);
    }

    // End markers
    fill(features.palette.ink);
    ellipse(x1, y1, 4 * scaleFactor, 4 * scaleFactor);
    ellipse(x2, y2, 4 * scaleFactor, 4 * scaleFactor);
  }
}

function drawTreatiseBrackets(voice, section) {
  // Bracket-like shapes
  const numBrackets = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(rnd(1, 3) * scaleFactor);
  noFill();

  for (let b = 0; b < numBrackets; b++) {
    const x = rnd(section.xStart + 20, section.xEnd - 40);
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const h = rnd(20, 50) * scaleFactor;
    const hookW = rnd(8, 15) * scaleFactor;
    const isLeft = rndBool(0.5);

    // Bracket shape [ or ]
    if (isLeft) {
      line(x + hookW, y - h / 2, x, y - h / 2);
      line(x, y - h / 2, x, y + h / 2);
      line(x, y + h / 2, x + hookW, y + h / 2);
    } else {
      line(x, y - h / 2, x + hookW, y - h / 2);
      line(x + hookW, y - h / 2, x + hookW, y + h / 2);
      line(x + hookW, y + h / 2, x, y + h / 2);
    }
  }
}

function drawTreatiseSmallSpiral(voice, section) {
  // Small spiral elements
  const numSpirals = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  for (let s = 0; s < numSpirals; s++) {
    const cx = rnd(section.xStart + 20, section.xEnd - 20);
    const cy = rnd(voice.yStart + 15, voice.yEnd - 15);
    const maxR = rnd(8, 18) * scaleFactor;
    const turns = rnd(1.5, 3);

    beginShape();
    for (let a = 0; a <= turns * TWO_PI; a += 0.1) {
      const r = (a / (turns * TWO_PI)) * maxR;
      vertex(cx + cos(a) * r, cy + sin(a) * r);
    }
    endShape();
  }
}

function drawTreatiseBlocks(voice, section) {
  // Rectangular blocks (like December 1952)
  const numBlocks = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  fill(features.palette.ink);
  noStroke();

  for (let b = 0; b < numBlocks; b++) {
    const x = rnd(section.xStart + 10, section.xEnd - 30);
    const y = rnd(voice.yStart + 5, voice.yEnd - 15);
    const w = rnd(5, 30) * scaleFactor;
    const h = rnd(3, 15) * scaleFactor;

    rect(x, y, w, h);
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: OPENFORM (Earle Brown)
// ============================================================

function drawOpenFormRects(voice, section) {
  // Floating rectangles inspired by December 1952
  const numRects = Math.max(1, Math.floor(rnd(5, 15) * features.densityValue));

  fill(features.palette.ink);
  noStroke();

  for (let i = 0; i < numRects; i++) {
    const x = rnd(section.xStart + 10, section.xEnd - 40);
    const y = rnd(voice.yStart + 5, voice.yEnd - 15);

    // Rectangles are either horizontal or vertical, varying thickness
    if (rndBool(0.6)) {
      // Horizontal bar
      const w = rnd(20, 100) * scaleFactor;
      const h = rnd(2, 12) * scaleFactor;
      rect(x, y, w, h);
    } else {
      // Vertical bar
      const w = rnd(2, 8) * scaleFactor;
      const h = rnd(15, 50) * scaleFactor;
      rect(x, y, w, h);
    }
  }
}

function drawOpenFormSpatial(voice, section) {
  // Spatial arrangement - connected elements
  stroke(features.palette.ink + "60");
  strokeWeight(0.5 * scaleFactor);

  const points = [];
  const numPoints = rndInt(3, 8);

  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: rnd(section.xStart + 20, section.xEnd - 20),
      y: rnd(voice.yStart + 10, voice.yEnd - 10)
    });
  }

  // Light connecting lines
  for (let i = 0; i < points.length - 1; i++) {
    if (rndBool(0.4)) {
      line(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
    }
  }
}

// New OpenForm functions v3.9.0

function drawOpenFormMobile(voice, section) {
  // Mobile-like floating arrangement (Available Forms)
  const numElements = Math.max(3, Math.floor(rnd(4, 10) * features.densityValue));

  fill(features.palette.ink);
  noStroke();

  // Create a balanced mobile-like distribution
  for (let i = 0; i < numElements; i++) {
    const x = section.xStart + (i / numElements) * section.width * 0.8 + rnd(0, section.width * 0.15);
    const y = voice.yStart + sin(i * 0.7) * voice.height * 0.3 + voice.height * 0.5 + rnd(-10, 10) * scaleFactor;
    const w = rnd(15, 60) * scaleFactor;
    const h = rnd(3, 12) * scaleFactor;

    rect(x, y, w, h);
  }

  // Light connecting structure (like mobile wires)
  stroke(features.palette.ink + "33");
  strokeWeight(0.5 * scaleFactor);
  const pivotX = section.xCenter;
  const pivotY = voice.yStart + 10 * scaleFactor;
  line(pivotX - section.width * 0.3, pivotY, pivotX + section.width * 0.3, pivotY);
}

function drawOpenFormProportional(voice, section) {
  // Proportional time-space bars
  const numBars = Math.max(3, Math.floor(rnd(5, 12) * features.densityValue));

  fill(features.palette.ink);
  noStroke();

  for (let i = 0; i < numBars; i++) {
    const startX = section.xStart + (i / numBars) * section.width;
    const duration = rnd(0.5, 2); // Proportional length
    const w = (section.width / numBars) * duration * 0.7;
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const h = rnd(2, 8) * scaleFactor;

    rect(startX, y - h / 2, w, h);
  }
}

function drawOpenFormBalance(voice, section) {
  // Visual weight and balance composition
  // Heavy element on one side, lighter elements on other
  const heavyOnLeft = rndBool(0.5);

  fill(features.palette.ink);
  noStroke();

  if (heavyOnLeft) {
    // Large element on left
    const x = section.xStart + rnd(20, 50) * scaleFactor;
    const y = voice.yStart + voice.height * 0.4;
    const w = rnd(40, 80) * scaleFactor;
    const h = rnd(20, 40) * scaleFactor;
    rect(x, y, w, h);

    // Multiple small elements on right
    for (let i = 0; i < 5; i++) {
      const sx = section.xEnd - rnd(30, 120) * scaleFactor;
      const sy = rnd(voice.yStart + 15, voice.yEnd - 15);
      const sw = rnd(10, 30) * scaleFactor;
      const sh = rnd(2, 6) * scaleFactor;
      rect(sx, sy, sw, sh);
    }
  } else {
    // Large element on right
    const x = section.xEnd - rnd(60, 100) * scaleFactor;
    const y = voice.yStart + voice.height * 0.4;
    const w = rnd(40, 80) * scaleFactor;
    const h = rnd(20, 40) * scaleFactor;
    rect(x, y, w, h);

    // Multiple small elements on left
    for (let i = 0; i < 5; i++) {
      const sx = section.xStart + rnd(10, 80) * scaleFactor;
      const sy = rnd(voice.yStart + 15, voice.yEnd - 15);
      const sw = rnd(10, 30) * scaleFactor;
      const sh = rnd(2, 6) * scaleFactor;
      rect(sx, sy, sw, sh);
    }
  }
}

function drawOpenFormTrajectory(voice, section) {
  // Possible paths through material (arrows suggesting movement)
  const numArrows = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  stroke(features.palette.ink + "66");
  strokeWeight(features.lineWeight * 0.8 * scaleFactor);
  noFill();

  for (let a = 0; a < numArrows; a++) {
    const x1 = rnd(section.xStart + 20, section.xEnd - 80);
    const y1 = rnd(voice.yStart + 15, voice.yEnd - 15);
    const x2 = x1 + rnd(40, 100) * scaleFactor;
    const y2 = rnd(voice.yStart + 15, voice.yEnd - 15);

    // Curved arrow
    bezier(x1, y1, x1 + 20 * scaleFactor, y1 - 15 * scaleFactor, x2 - 20 * scaleFactor, y2 - 15 * scaleFactor, x2, y2);

    // Arrow head
    const angle = atan2(y2 - (y2 - 15 * scaleFactor), x2 - (x2 - 20 * scaleFactor));
    line(x2, y2, x2 - 8 * scaleFactor * cos(angle - 0.4), y2 - 8 * scaleFactor * sin(angle - 0.4));
    line(x2, y2, x2 - 8 * scaleFactor * cos(angle + 0.4), y2 - 8 * scaleFactor * sin(angle + 0.4));
  }
}

function drawOpenFormClusters(voice, section) {
  // Grouped rectangles
  const numClusters = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  fill(features.palette.ink);
  noStroke();

  for (let c = 0; c < numClusters; c++) {
    const cx = rnd(section.xStart + 40, section.xEnd - 40);
    const cy = rnd(voice.yStart + 25, voice.yEnd - 25);
    const numRects = rndInt(3, 7);

    for (let r = 0; r < numRects; r++) {
      const rx = cx + rndGaussian(0, 20 * scaleFactor);
      const ry = cy + rndGaussian(0, 15 * scaleFactor);
      const rw = rnd(10, 40) * scaleFactor;
      const rh = rnd(2, 8) * scaleFactor;
      rect(rx, ry, rw, rh);
    }
  }
}

function drawOpenFormVerticalStacks(voice, section) {
  // Stacked vertical bars
  const numStacks = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  fill(features.palette.ink);
  noStroke();

  for (let s = 0; s < numStacks; s++) {
    const x = rnd(section.xStart + 20, section.xEnd - 30);
    const numBars = rndInt(2, 5);

    for (let b = 0; b < numBars; b++) {
      const y = voice.yStart + (b / numBars) * voice.height * 0.8 + 10 * scaleFactor;
      const w = rnd(3, 8) * scaleFactor;
      const h = rnd(10, 30) * scaleFactor;
      rect(x + rnd(-5, 5) * scaleFactor, y, w, h);
    }
  }
}

function drawOpenFormHorizontalStream(voice, section) {
  // Horizontal bar streams
  const y = rnd(voice.yStart + 15, voice.yEnd - 15);
  const numBars = Math.max(3, Math.floor(rnd(5, 12) * features.densityValue));

  fill(features.palette.ink);
  noStroke();

  let x = section.xStart + 10 * scaleFactor;
  for (let b = 0; b < numBars; b++) {
    const w = rnd(15, 60) * scaleFactor;
    const h = rnd(3, 10) * scaleFactor;
    const gap = rnd(5, 25) * scaleFactor;

    rect(x, y + rnd(-5, 5) * scaleFactor, w, h);
    x += w + gap;

    if (x > section.xEnd - 20) break;
  }
}

function drawOpenFormEvent(voice, section) {
  // Single prominent event
  const x = rnd(section.xStart + 40, section.xEnd - 80);
  const y = rnd(voice.yStart + 20, voice.yEnd - 20);
  const w = rnd(60, 120) * scaleFactor;
  const h = rnd(15, 35) * scaleFactor;

  fill(features.palette.ink);
  noStroke();
  rect(x, y - h / 2, w, h);
}

function drawOpenFormGradient(voice, section) {
  // Size gradient arrangements (small to large or vice versa)
  const numBars = Math.max(4, Math.floor(rnd(5, 10) * features.densityValue));
  const ascending = rndBool(0.5);

  fill(features.palette.ink);
  noStroke();

  for (let i = 0; i < numBars; i++) {
    const t = i / (numBars - 1);
    const sizeFactor = ascending ? t : 1 - t;
    const x = section.xStart + t * section.width * 0.85 + 10 * scaleFactor;
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const w = (15 + sizeFactor * 50) * scaleFactor;
    const h = (2 + sizeFactor * 10) * scaleFactor;

    rect(x, y, w, h);
  }
}

function drawOpenFormSparse(voice, section) {
  // Minimal sparse arrangement
  const numElements = rndInt(2, 4);

  fill(features.palette.ink);
  noStroke();

  for (let i = 0; i < numElements; i++) {
    const x = rnd(section.xStart + 30, section.xEnd - 50);
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const w = rnd(25, 70) * scaleFactor;
    const h = rnd(4, 12) * scaleFactor;

    rect(x, y, w, h);
  }
}

function drawOpenFormDense(voice, section) {
  // Dense accumulation
  const numElements = Math.floor(rnd(15, 30) * features.densityValue);

  fill(features.palette.ink);
  noStroke();

  for (let i = 0; i < numElements; i++) {
    const x = rnd(section.xStart + 10, section.xEnd - 30);
    const y = rnd(voice.yStart + 5, voice.yEnd - 10);
    const w = rnd(10, 40) * scaleFactor;
    const h = rnd(2, 6) * scaleFactor;

    rect(x, y, w, h);
  }
}

function drawOpenFormOverlap(voice, section) {
  // Overlapping transparent rectangles
  const numRects = Math.max(3, Math.floor(rnd(4, 8) * features.densityValue));

  noStroke();

  for (let i = 0; i < numRects; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 60);
    const y = rnd(voice.yStart + 10, voice.yEnd - 30);
    const w = rnd(40, 100) * scaleFactor;
    const h = rnd(15, 40) * scaleFactor;

    fill(features.palette.ink + "55");
    rect(x, y, w, h);
  }
}

function drawOpenFormAsymmetric(voice, section) {
  // Asymmetric balance (different types on each side)
  fill(features.palette.ink);
  noStroke();

  // Left side: vertical bars
  for (let i = 0; i < 3; i++) {
    const x = section.xStart + 20 + i * 15 * scaleFactor;
    const y = rnd(voice.yStart + 10, voice.yStart + voice.height * 0.4);
    const w = rnd(3, 6) * scaleFactor;
    const h = rnd(20, 50) * scaleFactor;
    rect(x, y, w, h);
  }

  // Right side: horizontal bars
  for (let i = 0; i < 4; i++) {
    const x = section.xEnd - rnd(50, 120) * scaleFactor;
    const y = voice.yEnd - 30 * scaleFactor - i * 12 * scaleFactor;
    const w = rnd(30, 80) * scaleFactor;
    const h = rnd(3, 8) * scaleFactor;
    rect(x, y, w, h);
  }
}

function drawOpenFormContrapuntal(voice, section) {
  // Two-voice contrapuntal arrangement
  fill(features.palette.ink);
  noStroke();

  // Upper voice
  const upperY = voice.yStart + voice.height * 0.25;
  for (let i = 0; i < 5; i++) {
    const x = section.xStart + (i / 4) * section.width * 0.8 + 20 * scaleFactor;
    const w = rnd(20, 50) * scaleFactor;
    const h = rnd(3, 8) * scaleFactor;
    rect(x, upperY + rnd(-8, 8) * scaleFactor, w, h);
  }

  // Lower voice
  const lowerY = voice.yStart + voice.height * 0.75;
  for (let i = 0; i < 5; i++) {
    const x = section.xStart + ((i + 0.5) / 4) * section.width * 0.8 + 20 * scaleFactor;
    const w = rnd(20, 50) * scaleFactor;
    const h = rnd(3, 8) * scaleFactor;
    rect(x, lowerY + rnd(-8, 8) * scaleFactor, w, h);
  }
}

function drawOpenFormLooseGrid(voice, section) {
  // Loose grid arrangement
  const cols = rndInt(3, 6);
  const rows = rndInt(2, 4);

  fill(features.palette.ink);
  noStroke();

  const cellW = section.width / cols;
  const cellH = voice.height / rows;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (rndBool(0.6)) { // Not every cell filled
        const x = section.xStart + c * cellW + rnd(10, 30) * scaleFactor;
        const y = voice.yStart + r * cellH + rnd(5, 15) * scaleFactor;
        const w = rnd(15, cellW * 0.6) * scaleFactor;
        const h = rnd(3, 10) * scaleFactor;
        rect(x, y, w, h);
      }
    }
  }
}

function drawOpenFormDiagonal(voice, section) {
  // Diagonal arrangement
  const numBars = Math.max(4, Math.floor(rnd(5, 10) * features.densityValue));
  const ascending = rndBool(0.5);

  fill(features.palette.ink);
  noStroke();

  for (let i = 0; i < numBars; i++) {
    const t = i / (numBars - 1);
    const x = section.xStart + t * section.width * 0.8 + 20 * scaleFactor;
    const y = ascending
      ? voice.yEnd - 20 * scaleFactor - t * voice.height * 0.6
      : voice.yStart + 20 * scaleFactor + t * voice.height * 0.6;
    const w = rnd(20, 50) * scaleFactor;
    const h = rnd(3, 8) * scaleFactor;

    rect(x, y, w, h);
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: BUSSOTTI
// ============================================================

function drawBussottiCalligraphic(voice, section) {
  // Ornate calligraphic lines
  const numStrokes = Math.max(1, Math.floor(rnd(3, 8) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let i = 0; i < numStrokes; i++) {
    const startX = rnd(section.xStart + 20, section.xEnd - 60);
    const startY = rnd(voice.yStart + 15, voice.yEnd - 15);
    const curveLength = rnd(40, 120) * scaleFactor;

    // Variable stroke weight for calligraphic feel
    strokeWeight(rnd(0.5, 3) * scaleFactor);

    beginShape();
    vertex(startX, startY);

    // Flowing curves with control points
    const cp1x = startX + curveLength * 0.3 + rnd(-20, 20) * scaleFactor;
    const cp1y = startY + rnd(-30, 30) * scaleFactor;
    const cp2x = startX + curveLength * 0.7 + rnd(-20, 20) * scaleFactor;
    const cp2y = startY + rnd(-30, 30) * scaleFactor;
    const endX = startX + curveLength;
    const endY = startY + rnd(-20, 20) * scaleFactor;

    bezierVertex(cp1x, cp1y, cp2x, cp2y, endX, endY);
    endShape();

    // Occasional flourish at end
    if (rndBool(0.3)) {
      const flourishSize = rnd(5, 15) * scaleFactor;
      arc(endX, endY, flourishSize, flourishSize, 0, PI + rnd(0, HALF_PI));
    }
  }
}

function drawBussottiFlourishes(voice, section) {
  // Theatrical gesture marks
  const numFlourishes = Math.floor(rnd(2, 5) * features.densityValue);

  stroke(features.palette.ink);

  for (let i = 0; i < numFlourishes; i++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const size = rnd(20, 50) * scaleFactor;

    strokeWeight(rnd(0.5, 2) * scaleFactor);
    noFill();

    // Spiral flourish
    beginShape();
    for (let a = 0; a < TWO_PI * 1.5; a += 0.2) {
      const r = (a / (TWO_PI * 1.5)) * size;
      const x = cx + cos(a) * r;
      const y = cy + sin(a) * r;
      vertex(x, y);
    }
    endShape();
  }
}

function drawBussottiSplatters(voice, section) {
  // Ink splatter effects
  const numSplatters = Math.floor(rnd(1, 4) * features.densityValue);

  fill(features.palette.ink);
  noStroke();

  for (let s = 0; s < numSplatters; s++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const numDrops = rndInt(5, 15);

    for (let i = 0; i < numDrops; i++) {
      const angle = rnd(0, TWO_PI);
      const dist = rnd(0, 20) * scaleFactor;
      const x = cx + cos(angle) * dist;
      const y = cy + sin(angle) * dist;
      const size = rnd(1, 4) * scaleFactor;
      ellipse(x, y, size, size * rnd(0.8, 1.2));
    }
  }
}

// New Bussotti functions v3.10.0

function drawBussottiGestural(voice, section) {
  // Large gestural marks
  const numGestures = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let g = 0; g < numGestures; g++) {
    strokeWeight(rnd(1, 4) * scaleFactor);
    const startX = rnd(section.xStart + 20, section.xEnd - 80);
    const startY = rnd(voice.yStart + 20, voice.yEnd - 20);

    beginShape();
    vertex(startX, startY);
    const numPoints = rndInt(4, 8);
    for (let p = 0; p < numPoints; p++) {
      const px = startX + (p + 1) * rnd(15, 30) * scaleFactor;
      const py = startY + rnd(-40, 40) * scaleFactor;
      curveVertex(px, constrain(py, voice.yStart + 5, voice.yEnd - 5));
    }
    endShape();
  }
}

function drawBussottiCurvedStaff(voice, section) {
  // Curved musical staves that break and reform
  const numStaves = Math.max(1, Math.floor(rnd(1, 2) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(0.5 * scaleFactor);
  noFill();

  for (let s = 0; s < numStaves; s++) {
    const baseY = rnd(voice.yStart + 20, voice.yEnd - 30);
    const numLines = rndInt(3, 5);
    const spacing = rnd(4, 8) * scaleFactor;

    for (let l = 0; l < numLines; l++) {
      const y = baseY + l * spacing;
      beginShape();
      for (let t = 0; t <= 1; t += 0.02) {
        const x = section.xStart + t * section.width;
        const curve = sin(t * PI * rnd(1, 3)) * rnd(5, 15) * scaleFactor;
        // Break the staff occasionally
        if (rnd(0, 1) > 0.02) {
          vertex(x, y + curve);
        }
      }
      endShape();
    }
  }
}

function drawBussottiDrips(voice, section) {
  // Ink drip effects
  const numDrips = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  fill(features.palette.ink);
  noStroke();

  for (let d = 0; d < numDrips; d++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const startY = rnd(voice.yStart + 10, voice.yStart + voice.height * 0.4);
    const dripLen = rnd(20, 60) * scaleFactor;

    // Drip body (elongated ellipse)
    beginShape();
    for (let t = 0; t <= 1; t += 0.05) {
      const y = startY + t * dripLen;
      const width = (1 - t) * rnd(3, 6) * scaleFactor;
      vertex(x - width / 2, y);
    }
    for (let t = 1; t >= 0; t -= 0.05) {
      const y = startY + t * dripLen;
      const width = (1 - t) * rnd(3, 6) * scaleFactor;
      vertex(x + width / 2, y);
    }
    endShape(CLOSE);

    // Drip end (teardrop)
    ellipse(x, startY + dripLen + 3 * scaleFactor, 4 * scaleFactor, 6 * scaleFactor);
  }
}

function drawBussottiDecorative(voice, section) {
  // Decorative ornamental elements
  const numOrnaments = Math.max(1, Math.floor(rnd(3, 7) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let o = 0; o < numOrnaments; o++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const size = rnd(8, 20) * scaleFactor;
    const type = rndInt(0, 4);

    strokeWeight(features.lineWeight * scaleFactor);

    if (type === 0) {
      // Treble clef-like curl
      arc(x, y, size, size, PI, TWO_PI);
      arc(x, y + size * 0.5, size * 0.6, size * 0.6, 0, PI);
    } else if (type === 1) {
      // Trill mark
      for (let i = 0; i < 4; i++) {
        arc(x + i * size * 0.3, y, size * 0.3, size * 0.4, 0, PI);
      }
    } else if (type === 2) {
      // Fermata-like
      arc(x, y, size, size * 0.6, PI, TWO_PI);
      fill(features.palette.ink);
      ellipse(x, y - 2 * scaleFactor, 3 * scaleFactor, 3 * scaleFactor);
      noFill();
    } else {
      // Mordent
      beginShape();
      vertex(x - size, y);
      vertex(x - size * 0.5, y - size * 0.4);
      vertex(x, y);
      vertex(x + size * 0.5, y - size * 0.4);
      vertex(x + size, y);
      endShape();
    }
  }
}

function drawBussottiTextFragments(voice, section) {
  // Poetic text fragments
  const fragments = ["sospiro", "dolce", "agitato", "lento", "morendo",
                     "con fuoco", "piano", "forte", "subito", "sempre"];
  const numFragments = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textStyle(ITALIC);

  for (let f = 0; f < numFragments; f++) {
    const x = rnd(section.xStart + 30, section.xEnd - 60);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    textSize(rnd(7, 12) * scaleFactor);
    text(rndChoice(fragments), x, y);
  }
  textStyle(NORMAL);
}

function drawBussottiTheatrical(voice, section) {
  // Theatrical performance marks
  const numMarks = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);

  for (let m = 0; m < numMarks; m++) {
    const x = rnd(section.xStart + 25, section.xEnd - 25);
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const type = rndInt(0, 4);

    strokeWeight(features.lineWeight * scaleFactor);
    noFill();

    if (type === 0) {
      // Stage direction arrow
      line(x, y, x + 25 * scaleFactor, y);
      line(x + 20 * scaleFactor, y - 5 * scaleFactor, x + 25 * scaleFactor, y);
      line(x + 20 * scaleFactor, y + 5 * scaleFactor, x + 25 * scaleFactor, y);
    } else if (type === 1) {
      // Pause/breath mark
      arc(x, y, 15 * scaleFactor, 20 * scaleFactor, -HALF_PI, HALF_PI);
    } else if (type === 2) {
      // Gesture bracket
      beginShape();
      vertex(x, y - 10 * scaleFactor);
      bezierVertex(x - 10 * scaleFactor, y, x - 10 * scaleFactor, y, x, y + 10 * scaleFactor);
      endShape();
    } else {
      // Eye symbol (watching)
      ellipse(x, y, 15 * scaleFactor, 8 * scaleFactor);
      fill(features.palette.ink);
      ellipse(x, y, 4 * scaleFactor, 4 * scaleFactor);
      noFill();
    }
  }
}

function drawBussottiSwirls(voice, section) {
  // Swirling ink patterns
  const numSwirls = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let s = 0; s < numSwirls; s++) {
    strokeWeight(rnd(0.5, 2) * scaleFactor);
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 25, voice.yEnd - 25);
    const turns = rnd(1.5, 3);
    const maxR = rnd(15, 35) * scaleFactor;

    beginShape();
    for (let a = 0; a <= turns * TWO_PI; a += 0.1) {
      const r = (a / (turns * TWO_PI)) * maxR;
      const wobble = sin(a * 3) * r * 0.1;
      vertex(cx + cos(a) * (r + wobble), cy + sin(a) * (r + wobble));
    }
    endShape();
  }
}

function drawBussottiClusters(voice, section) {
  // Dense gestural clusters
  const numClusters = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let c = 0; c < numClusters; c++) {
    const cx = rnd(section.xStart + 40, section.xEnd - 40);
    const cy = rnd(voice.yStart + 25, voice.yEnd - 25);
    const numStrokes = rndInt(8, 20);

    for (let s = 0; s < numStrokes; s++) {
      strokeWeight(rnd(0.3, 1.5) * scaleFactor);
      const angle = rnd(0, TWO_PI);
      const len = rnd(10, 30) * scaleFactor;
      const startDist = rnd(0, 10) * scaleFactor;

      const x1 = cx + cos(angle) * startDist;
      const y1 = cy + sin(angle) * startDist;
      const x2 = cx + cos(angle) * (startDist + len);
      const y2 = cy + sin(angle) * (startDist + len);

      line(x1, y1, x2, y2);
    }
  }
}

function drawBussottiLoops(voice, section) {
  // Looping calligraphic lines
  const numLoops = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(rnd(1, 2) * scaleFactor);
  noFill();

  for (let l = 0; l < numLoops; l++) {
    const startX = rnd(section.xStart + 20, section.xEnd - 80);
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const numCurves = rndInt(2, 4);
    const loopSize = rnd(10, 20) * scaleFactor;

    beginShape();
    vertex(startX, y);
    for (let c = 0; c < numCurves; c++) {
      const cx = startX + (c + 1) * loopSize * 2;
      bezierVertex(cx - loopSize, y - loopSize, cx + loopSize, y - loopSize, cx, y);
    }
    endShape();
  }
}

function drawBussottiAccents(voice, section) {
  // Dramatic accent marks
  const numAccents = Math.max(2, Math.floor(rnd(4, 10) * features.densityValue));

  stroke(features.palette.ink);
  fill(features.palette.ink);

  for (let a = 0; a < numAccents; a++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const type = rndInt(0, 4);
    const size = rnd(5, 12) * scaleFactor;

    strokeWeight(features.lineWeight * scaleFactor);

    if (type === 0) {
      // Sforzando wedge
      noFill();
      beginShape();
      vertex(x - size, y);
      vertex(x, y - size * 0.6);
      vertex(x + size, y);
      endShape();
    } else if (type === 1) {
      // Accent mark >
      noFill();
      line(x - size, y - size * 0.4, x, y);
      line(x, y, x - size, y + size * 0.4);
    } else if (type === 2) {
      // Staccatissimo
      noStroke();
      triangle(x, y - size, x - size * 0.3, y, x + size * 0.3, y);
      stroke(features.palette.ink);
    } else {
      // Marcato
      noFill();
      line(x - size * 0.5, y + size * 0.5, x, y - size * 0.5);
      line(x, y - size * 0.5, x + size * 0.5, y + size * 0.5);
    }
  }
}

function drawBussottiVines(voice, section) {
  // Vine-like decorative lines
  const numVines = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);
  noFill();

  for (let v = 0; v < numVines; v++) {
    const startX = rnd(section.xStart + 10, section.xEnd - 100);
    const startY = rnd(voice.yStart + 15, voice.yEnd - 15);
    const vineLen = rnd(60, 120) * scaleFactor;

    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const x = startX + t * vineLen;
      const y = startY + sin(t * TWO_PI * 2) * 10 * scaleFactor;
      vertex(x, y);

      // Small leaves/tendrils
      if (rnd(0, 1) < 0.1) {
        const leafAngle = rnd(-HALF_PI, HALF_PI);
        const leafLen = rnd(5, 10) * scaleFactor;
        line(x, y, x + cos(leafAngle) * leafLen, y + sin(leafAngle) * leafLen);
      }
    }
    endShape();
  }
}

function drawBussottiStars(voice, section) {
  // Star/asterisk decorations
  const numStars = Math.max(2, Math.floor(rnd(3, 8) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);

  for (let s = 0; s < numStars; s++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const size = rnd(4, 10) * scaleFactor;
    const numRays = rndInt(4, 8);

    for (let r = 0; r < numRays; r++) {
      const angle = (r / numRays) * TWO_PI;
      line(x, y, x + cos(angle) * size, y + sin(angle) * size);
    }
  }
}

function drawBussottiConnected(voice, section) {
  // Connected flowing gestures
  const numConnections = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(rnd(1, 2) * scaleFactor);
  noFill();

  let prevX = rnd(section.xStart + 20, section.xStart + 50);
  let prevY = rnd(voice.yStart + 20, voice.yEnd - 20);

  for (let c = 0; c < numConnections; c++) {
    const nextX = prevX + rnd(30, 80) * scaleFactor;
    const nextY = rnd(voice.yStart + 15, voice.yEnd - 15);

    if (nextX < section.xEnd - 20) {
      const cx1 = prevX + (nextX - prevX) * 0.3;
      const cy1 = prevY + rnd(-20, 20) * scaleFactor;
      const cx2 = prevX + (nextX - prevX) * 0.7;
      const cy2 = nextY + rnd(-20, 20) * scaleFactor;

      bezier(prevX, prevY, cx1, cy1, cx2, cy2, nextX, nextY);

      // Small mark at connection point
      fill(features.palette.ink);
      ellipse(nextX, nextY, 3 * scaleFactor, 3 * scaleFactor);
      noFill();

      prevX = nextX;
      prevY = nextY;
    }
  }
}

function drawBussottiDecorativeDots(voice, section) {
  // Decorative dot patterns
  const numPatterns = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  fill(features.palette.ink);
  noStroke();

  for (let p = 0; p < numPatterns; p++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const patternType = rndInt(0, 3);

    if (patternType === 0) {
      // Circle of dots
      const numDots = rndInt(5, 10);
      const radius = rnd(10, 20) * scaleFactor;
      for (let d = 0; d < numDots; d++) {
        const angle = (d / numDots) * TWO_PI;
        ellipse(cx + cos(angle) * radius, cy + sin(angle) * radius, 3 * scaleFactor, 3 * scaleFactor);
      }
    } else if (patternType === 1) {
      // Diagonal line of dots
      for (let d = 0; d < 5; d++) {
        ellipse(cx + d * 8 * scaleFactor, cy + d * 5 * scaleFactor, 3 * scaleFactor, 3 * scaleFactor);
      }
    } else {
      // Cluster of dots
      for (let d = 0; d < 8; d++) {
        ellipse(cx + rndGaussian(0, 10 * scaleFactor), cy + rndGaussian(0, 8 * scaleFactor), 2 * scaleFactor, 2 * scaleFactor);
      }
    }
  }
}

function drawBussottiWaves(voice, section) {
  // Wavy gestural lines
  const numWaves = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let w = 0; w < numWaves; w++) {
    strokeWeight(rnd(0.5, 2) * scaleFactor);
    const startX = rnd(section.xStart + 15, section.xEnd - 80);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const waveLen = rnd(50, 100) * scaleFactor;
    const amplitude = rnd(8, 20) * scaleFactor;
    const frequency = rnd(2, 5);

    beginShape();
    for (let t = 0; t <= 1; t += 0.02) {
      const x = startX + t * waveLen;
      const yOffset = sin(t * TWO_PI * frequency) * amplitude * (1 - t * 0.5);
      vertex(x, y + yOffset);
    }
    endShape();
  }
}

function drawBussottiCrescendo(voice, section) {
  // Dramatic crescendo shapes
  const numCrescendos = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  fill(features.palette.ink + "44");
  stroke(features.palette.ink);
  strokeWeight(features.lineWeight * scaleFactor);

  for (let c = 0; c < numCrescendos; c++) {
    const x = rnd(section.xStart + 20, section.xEnd - 80);
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const w = rnd(50, 100) * scaleFactor;
    const h = rnd(15, 30) * scaleFactor;
    const isGrowing = rndBool(0.5);

    beginShape();
    if (isGrowing) {
      vertex(x, y);
      vertex(x + w, y - h);
      vertex(x + w, y + h);
    } else {
      vertex(x, y - h);
      vertex(x, y + h);
      vertex(x + w, y);
    }
    endShape(CLOSE);
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: TEXTSCORE (Stockhausen/Eno)
// ============================================================

function drawTextInstructions(voice, section) {
  // Text-based instructions
  const instructions = [
    "listen", "wait", "breathe", "silence", "repeat",
    "slowly", "faster", "hold", "release", "echo",
    "imagine", "remember", "forget", "begin", "end",
    "soft", "loud", "fade", "grow", "diminish",
    "once", "twice", "many", "few", "none",
    "high", "low", "middle", "between", "beyond"
  ];

  const numTexts = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("serif");

  for (let i = 0; i < numTexts; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 80);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const size = rnd(8, 14) * scaleFactor;

    textSize(size);
    textStyle(rndBool(0.3) ? ITALIC : NORMAL);
    text(rndChoice(instructions), x, y);
  }
  textStyle(NORMAL);
}

function drawTextCryptic(voice, section) {
  // Cryptic phrases and symbols
  const phrases = [
    "...", "—", "?", "!", "~",
    "(   )", "[   ]", "{   }", "< >",
    "1.", "2.", "3.", "→", "←", "↑", "↓",
    "or", "and", "not", "if", "then",
    "*", "°", "§", "¶", "†"
  ];

  const numPhrases = Math.floor(rnd(3, 8) * features.densityValue);

  fill(features.palette.inkLight);
  noStroke();

  for (let i = 0; i < numPhrases; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 30);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const size = rnd(10, 18) * scaleFactor;

    textSize(size);
    text(rndChoice(phrases), x, y);
  }
}

function drawTextScorePoetic(voice, section) {
  // Spaced poetic phrases (Stockhausen's "Aus den sieben Tagen" style)
  const phrases = [
    "in the rhythm of the universe",
    "vibration in the rhythm of dreaming",
    "think nothing",
    "let it stream through you",
    "play a sound",
    "with certainty that you are creating miracles",
    "between yourself and the infinite",
    "until you reach the silence",
    "a sound that is only your own",
    "beyond the surface of the sound"
  ];

  const numPhrases = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("serif");
  textStyle(ITALIC);

  for (let i = 0; i < numPhrases; i++) {
    const phrase = rndChoice(phrases);
    const words = phrase.split(" ");
    let x = rnd(section.xStart + 20, section.xStart + 100);
    const baseY = rnd(voice.yStart + 15, voice.yEnd - 15);
    const size = rnd(9, 12) * scaleFactor;
    textSize(size);

    // Space words across the section
    const spacing = (section.xEnd - x - 50) / words.length;
    for (const word of words) {
      const yOffset = rnd(-8, 8) * scaleFactor;
      text(word, x, baseY + yOffset);
      x += spacing + rnd(-10, 10);
    }
  }
  textStyle(NORMAL);
}

function drawTextScoreNumbered(voice, section) {
  // Numbered instruction lists
  const instructions = [
    "begin at any point",
    "continue until satisfied",
    "repeat if necessary",
    "observe your breathing",
    "listen to others",
    "wait for a sign",
    "proceed slowly"
  ];

  const numItems = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));
  const startX = rnd(section.xStart + 20, section.xStart + 100);
  const startY = rnd(voice.yStart + 15, voice.yEnd - 40);
  const lineHeight = 12 * scaleFactor;

  fill(features.palette.ink);
  noStroke();
  textFont("serif");
  textSize(10 * scaleFactor);

  for (let i = 0; i < numItems; i++) {
    const y = startY + i * lineHeight;
    if (y < voice.yEnd - 10) {
      text(`${i + 1}. ${rndChoice(instructions)}`, startX, y);
    }
  }
}

function drawTextScoreTime(voice, section) {
  // Time-based instructions
  const times = [
    "15 seconds", "30 seconds", "1 minute", "2 minutes",
    "until silence", "until change", "until ready",
    "as long as possible", "briefly", "at length",
    "ca. 10\"", "ca. 20\"", "ca. 30\"", "ca. 1'",
    "freely", "in your own time"
  ];

  const numTimes = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("serif");

  for (let i = 0; i < numTimes; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 80);
    const y = rnd(voice.yStart + 12, voice.yEnd - 12);
    const size = rnd(8, 12) * scaleFactor;
    textSize(size);
    textStyle(NORMAL);

    // Draw time with brackets or parentheses
    const timeText = rndChoice(times);
    const format = rndInt(0, 2);
    if (format === 0) text(`(${timeText})`, x, y);
    else if (format === 1) text(`[${timeText}]`, x, y);
    else text(timeText, x, y);
  }
}

function drawTextScoreStockhausen(voice, section) {
  // Intuitive music text instructions (Stockhausen style)
  const intuitive = [
    "play a vibration in the rhythm of dreaming",
    "play a sound with certainty",
    "think NOTHING",
    "do not think",
    "play a tone for so long until you hear its individual vibrations",
    "play a vibration in the rhythm of your body",
    "play a vibration in the rhythm of the universe",
    "play or do not play",
    "let it stream through you",
    "synchronize yourself"
  ];

  const numTexts = Math.max(1, Math.floor(rnd(1, 2) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("serif");
  textSize(11 * scaleFactor);
  textStyle(ITALIC);
  textAlign(CENTER);

  for (let i = 0; i < numTexts; i++) {
    const x = (section.xStart + section.xEnd) / 2;
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    text(rndChoice(intuitive), x, y);
  }

  textAlign(LEFT);
  textStyle(NORMAL);
}

function drawTextScoreOblique(voice, section) {
  // Oblique Strategies style (Eno/Schmidt)
  const strategies = [
    "Honor thy error as a hidden intention",
    "What would your closest friend do?",
    "Use an old idea",
    "State the problem as clearly as possible",
    "Make a blank valuable by putting it in an exquisite frame",
    "What is the reality of the situation?",
    "Turn it upside down",
    "Don't be afraid of things because they're easy to do",
    "Remove specifics and convert to ambiguities",
    "Go slowly all the way round the outside"
  ];

  const numStrategies = Math.max(1, Math.floor(rnd(1, 2) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("sans-serif");
  textSize(10 * scaleFactor);

  for (let i = 0; i < numStrategies; i++) {
    const x = rnd(section.xStart + 15, section.xStart + 80);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);

    // Draw in a box-like frame
    const strat = rndChoice(strategies);
    const tw = textWidth(strat) + 10 * scaleFactor;
    const th = 18 * scaleFactor;

    stroke(features.palette.inkLight);
    strokeWeight(0.5 * scaleFactor);
    noFill();
    rect(x - 5 * scaleFactor, y - 12 * scaleFactor, tw, th);

    noStroke();
    fill(features.palette.ink);
    text(strat, x, y);
  }
}

function drawTextScoreProsody(voice, section) {
  // Prosodic stress marks
  const numGroups = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  noFill();

  for (let g = 0; g < numGroups; g++) {
    const x = rnd(section.xStart + 30, section.xEnd - 100);
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const numSyllables = rndInt(4, 8);
    const spacing = 15 * scaleFactor;

    for (let i = 0; i < numSyllables; i++) {
      const sx = x + i * spacing;
      const stressed = rndBool(0.4);

      if (stressed) {
        // Stressed syllable: accent mark
        line(sx, y - 8 * scaleFactor, sx + 6 * scaleFactor, y - 8 * scaleFactor);
        line(sx + 3 * scaleFactor, y - 12 * scaleFactor, sx + 3 * scaleFactor, y - 4 * scaleFactor);
      } else {
        // Unstressed: small circle
        ellipse(sx + 3 * scaleFactor, y - 8 * scaleFactor, 4 * scaleFactor, 4 * scaleFactor);
      }

      // Baseline mark
      line(sx, y, sx + 8 * scaleFactor, y);
    }
  }
}

function drawTextScoreConceptual(voice, section) {
  // Conceptual art-style instructions (Fluxus, Yoko Ono)
  const concepts = [
    "This piece is invisible.",
    "Listen to the sound of the earth turning.",
    "Imagine the sound.",
    "A piece for imaginary instruments.",
    "The score is the performance.",
    "Observe your own observation.",
    "This is not a score.",
    "Play what you will not hear.",
    "The silence between these words is the music."
  ];

  const numConcepts = Math.max(1, Math.floor(rnd(1, 2) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("serif");
  textSize(10 * scaleFactor);
  textStyle(ITALIC);

  for (let i = 0; i < numConcepts; i++) {
    const x = rnd(section.xStart + 20, section.xStart + 100);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    text(rndChoice(concepts), x, y);
  }
  textStyle(NORMAL);
}

function drawTextScoreParenthetical(voice, section) {
  // Parenthetical annotations
  const annotations = [
    "(optional)", "(ad libitum)", "(freely)", "(senza tempo)",
    "(or not)", "(perhaps)", "(in any order)", "(tacet)",
    "(inaudible)", "(barely audible)", "(as if from afar)",
    "(without vibrato)", "(with mute)", "(natural harmonics)"
  ];

  const numAnnotations = Math.max(2, Math.floor(rnd(3, 7) * features.densityValue));

  fill(features.palette.inkLight);
  noStroke();
  textFont("serif");
  textStyle(ITALIC);
  textSize(8 * scaleFactor);

  for (let i = 0; i < numAnnotations; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 60);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    text(rndChoice(annotations), x, y);
  }
  textStyle(NORMAL);
}

function drawTextScoreQuotes(voice, section) {
  // Quoted fragments
  const quotes = [
    "\"sound\"", "\"silence\"", "\"time\"", "\"space\"",
    "\"begin\"", "\"end\"", "\"nothing\"", "\"everything\"",
    "\"here\"", "\"now\"", "\"listen\"", "\"imagine\""
  ];

  const numQuotes = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("serif");

  for (let i = 0; i < numQuotes; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 50);
    const y = rnd(voice.yStart + 12, voice.yEnd - 12);
    const size = rnd(10, 16) * scaleFactor;
    textSize(size);
    text(rndChoice(quotes), x, y);
  }
}

function drawTextScoreVerbs(voice, section) {
  // Scattered action verbs
  const verbs = [
    "LISTEN", "WAIT", "BREATHE", "HOLD", "RELEASE",
    "BEGIN", "END", "CONTINUE", "STOP", "PAUSE",
    "THINK", "FEEL", "OBSERVE", "REMEMBER", "FORGET",
    "PLAY", "SING", "SPEAK", "WHISPER", "SHOUT"
  ];

  const numVerbs = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("sans-serif");

  for (let i = 0; i < numVerbs; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 60);
    const y = rnd(voice.yStart + 12, voice.yEnd - 12);
    const size = rnd(8, 14) * scaleFactor;
    textSize(size);
    textStyle(rndBool(0.5) ? BOLD : NORMAL);
    text(rndChoice(verbs), x, y);
  }
  textStyle(NORMAL);
}

function drawTextScoreLayout(voice, section) {
  // Typographic spatial layout (scattered letters/words)
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const numLetters = Math.max(3, Math.floor(rnd(5, 12) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("serif");

  for (let i = 0; i < numLetters; i++) {
    const x = rnd(section.xStart + 10, section.xEnd - 20);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const size = rnd(10, 24) * scaleFactor;
    textSize(size);

    // Rotate some letters
    push();
    translate(x, y);
    rotate(rnd(-0.3, 0.3));
    text(rndChoice(letters), 0, 0);
    pop();
  }
}

function drawTextScoreMinimal(voice, section) {
  // Minimal single words, large and sparse
  const words = [
    "silence", "sound", "air", "space", "time",
    "now", "then", "here", "there", "one"
  ];

  const numWords = Math.max(1, Math.floor(rnd(1, 2) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("serif");
  textSize(18 * scaleFactor);
  textStyle(NORMAL);

  for (let i = 0; i < numWords; i++) {
    const x = rnd(section.xStart + 30, section.xEnd - 80);
    const y = rnd(voice.yStart + 25, voice.yEnd - 25);
    text(rndChoice(words), x, y);
  }
}

function drawTextScoreQuestions(voice, section) {
  // Question-based instructions
  const questions = [
    "What do you hear?",
    "Where is the sound?",
    "How long is silence?",
    "Who is listening?",
    "When does music begin?",
    "Why this note?",
    "Is this music?"
  ];

  const numQuestions = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("serif");
  textStyle(ITALIC);
  textSize(10 * scaleFactor);

  for (let i = 0; i < numQuestions; i++) {
    const x = rnd(section.xStart + 15, section.xStart + 80);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    text(rndChoice(questions), x, y);
  }
  textStyle(NORMAL);
}

function drawTextScoreNegation(voice, section) {
  // Negation-based instructions (conceptual)
  const negations = [
    "do not play", "not this", "without sound",
    "no rhythm", "no melody", "nothing",
    "silence only", "absence", "void",
    "neither", "nor", "un-", "non-", "anti-"
  ];

  const numNegations = Math.max(2, Math.floor(rnd(2, 5) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("serif");

  for (let i = 0; i < numNegations; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 50);
    const y = rnd(voice.yStart + 12, voice.yEnd - 12);
    textSize(rnd(9, 13) * scaleFactor);
    text(rndChoice(negations), x, y);
  }
}

function drawTextScoreDuration(voice, section) {
  // Duration indicators (lines with text)
  const numDurations = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  fill(features.palette.ink);
  textFont("serif");
  textSize(8 * scaleFactor);

  for (let i = 0; i < numDurations; i++) {
    const x1 = rnd(section.xStart + 20, section.xStart + 100);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const len = rnd(50, 150) * scaleFactor;
    const x2 = Math.min(x1 + len, section.xEnd - 20);

    // Horizontal duration line
    line(x1, y, x2, y);

    // End markers
    line(x1, y - 5 * scaleFactor, x1, y + 5 * scaleFactor);
    line(x2, y - 5 * scaleFactor, x2, y + 5 * scaleFactor);

    // Optional duration text above
    if (rndBool(0.5)) {
      noStroke();
      const duration = rndChoice(["long", "short", "held", "sustained", "brief"]);
      text(duration, (x1 + x2) / 2 - 15, y - 8 * scaleFactor);
      stroke(features.palette.ink);
    }
  }
}

function drawTextScoreWhisper(voice, section) {
  // Small, quiet text (whispered instructions)
  const whispers = [
    "barely", "almost", "scarcely", "just",
    "softly", "gently", "delicately", "lightly",
    "fading", "disappearing", "vanishing", "dissolving"
  ];

  const numWhispers = Math.max(2, Math.floor(rnd(3, 7) * features.densityValue));

  fill(features.palette.inkLight);
  noStroke();
  textFont("serif");
  textStyle(ITALIC);

  for (let i = 0; i < numWhispers; i++) {
    const x = rnd(section.xStart + 10, section.xEnd - 40);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    textSize(rnd(6, 9) * scaleFactor);
    text(rndChoice(whispers), x, y);
  }
  textStyle(NORMAL);
}

// ============================================================
// MODE-SPECIFIC DRAWING: STRIPSODY (Berberian)
// ============================================================

function drawStripsodyOnomatopoeia(voice, section) {
  // Comic book sound words
  const sounds = [
    "BANG!", "POW!", "ZAP!", "BOOM!", "CRASH!",
    "ZING!", "WHOOSH!", "SPLAT!", "THUD!", "CRACK!",
    "POP!", "FIZZ!", "BUZZ!", "HISS!", "ROAR!",
    "SNAP!", "CRACKLE!", "SIZZLE!", "WHIRR!", "CLANG!",
    "shh...", "psst!", "ahem", "hmm", "zzz"
  ];

  const colors = features.palette.colors ||
    ["#dd2222", "#2255cc", "#ffcc00", "#22aa44"];

  const numSounds = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  noStroke();

  for (let i = 0; i < numSounds; i++) {
    const x = rnd(section.xStart + 30, section.xEnd - 60);
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const size = rnd(10, 20) * scaleFactor;
    const sound = rndChoice(sounds);

    // Colorful text
    fill(rndChoice(colors));
    textSize(size);
    textStyle(BOLD);
    text(sound, x, y);
  }
  textStyle(NORMAL);
}

function drawStripsodyBubbles(voice, section) {
  // Speech/thought bubbles
  const numBubbles = Math.floor(rnd(1, 3) * features.densityValue);

  for (let i = 0; i < numBubbles; i++) {
    const cx = rnd(section.xStart + 40, section.xEnd - 40);
    const cy = rnd(voice.yStart + 25, voice.yEnd - 25);
    const w = rnd(30, 70) * scaleFactor;
    const h = rnd(20, 40) * scaleFactor;

    stroke(features.palette.ink);
    strokeWeight(1.5 * scaleFactor);
    fill(features.palette.paper);

    // Bubble shape
    ellipse(cx, cy, w, h);

    // Tail
    const tailDir = rndBool(0.5) ? 1 : -1;
    beginShape();
    vertex(cx + tailDir * w * 0.2, cy + h * 0.4);
    vertex(cx + tailDir * w * 0.5, cy + h * 0.7);
    vertex(cx + tailDir * w * 0.35, cy + h * 0.35);
    endShape(CLOSE);

    // Content (small marks inside)
    fill(features.palette.ink);
    noStroke();
    for (let j = 0; j < 3; j++) {
      const mx = cx + rnd(-w * 0.25, w * 0.25);
      const my = cy + rnd(-h * 0.2, h * 0.2);
      ellipse(mx, my, 3 * scaleFactor, 3 * scaleFactor);
    }
  }
}

function drawStripsodyActionLines(voice, section) {
  // Action/motion lines
  const numGroups = Math.floor(rnd(2, 5) * features.densityValue);

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);

  for (let g = 0; g < numGroups; g++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 15, voice.yEnd - 15);
    const numLines = rndInt(3, 6);
    const spread = rnd(10, 30) * scaleFactor;

    for (let i = 0; i < numLines; i++) {
      const angle = rnd(-0.5, 0.5);
      const len = rnd(15, 40) * scaleFactor;
      const offset = (i - numLines/2) * (spread / numLines);

      const x1 = cx;
      const y1 = cy + offset;
      const x2 = cx + cos(angle) * len;
      const y2 = y1 + sin(angle) * len;

      line(x1, y1, x2, y2);
    }
  }
}

function drawStripsodyExplosions(voice, section) {
  // Explosion burst shapes (comic book style)
  const colors = features.palette.colors || ["#dd2222", "#ff8800", "#ffcc00"];
  const numExplosions = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  for (let i = 0; i < numExplosions; i++) {
    const cx = rnd(section.xStart + 40, section.xEnd - 40);
    const cy = rnd(voice.yStart + 25, voice.yEnd - 25);
    const size = rnd(20, 45) * scaleFactor;
    const points = rndInt(8, 14);

    fill(rndChoice(colors));
    stroke(features.palette.ink);
    strokeWeight(1.5 * scaleFactor);

    beginShape();
    for (let p = 0; p < points * 2; p++) {
      const angle = (p / (points * 2)) * TWO_PI;
      const r = p % 2 === 0 ? size : size * rnd(0.4, 0.6);
      vertex(cx + cos(angle) * r, cy + sin(angle) * r);
    }
    endShape(CLOSE);
  }
}

function drawStripsodyStars(voice, section) {
  // Impact stars (4-8 pointed stars)
  const colors = features.palette.colors || ["#ffcc00", "#ffffff", "#ff6600"];
  const numStars = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  for (let i = 0; i < numStars; i++) {
    const cx = rnd(section.xStart + 20, section.xEnd - 20);
    const cy = rnd(voice.yStart + 15, voice.yEnd - 15);
    const size = rnd(8, 20) * scaleFactor;
    const points = rndInt(4, 8);

    fill(rndChoice(colors));
    noStroke();

    beginShape();
    for (let p = 0; p < points * 2; p++) {
      const angle = (p / (points * 2)) * TWO_PI - PI / 2;
      const r = p % 2 === 0 ? size : size * 0.4;
      vertex(cx + cos(angle) * r, cy + sin(angle) * r);
    }
    endShape(CLOSE);
  }
}

function drawStripsodySpeedLines(voice, section) {
  // Speed/motion lines (horizontal streaks)
  const numGroups = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let g = 0; g < numGroups; g++) {
    const cx = rnd(section.xStart + 50, section.xEnd - 30);
    const cy = rnd(voice.yStart + 15, voice.yEnd - 15);
    const numLines = rndInt(4, 8);
    const spread = rnd(15, 30) * scaleFactor;

    for (let i = 0; i < numLines; i++) {
      const y = cy + (i - numLines / 2) * (spread / numLines);
      const len = rnd(30, 80) * scaleFactor;
      strokeWeight(rnd(0.5, 2) * scaleFactor);
      line(cx - len, y, cx, y);
    }
  }
}

function drawStripsodySwoosh(voice, section) {
  // Swoosh curves (movement arcs)
  const numSwoosh = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(2 * scaleFactor);
  noFill();

  for (let i = 0; i < numSwoosh; i++) {
    const x1 = rnd(section.xStart + 20, section.xStart + 80);
    const y1 = rnd(voice.yStart + 20, voice.yEnd - 20);
    const x2 = x1 + rnd(50, 120) * scaleFactor;
    const y2 = y1 + rnd(-30, 30) * scaleFactor;
    const cx = (x1 + x2) / 2;
    const cy = y1 + rnd(-40, 40) * scaleFactor;

    beginShape();
    vertex(x1, y1);
    quadraticVertex(cx, cy, x2, y2);
    endShape();

    // Arrow head at end
    const angle = atan2(y2 - cy, x2 - cx);
    const arrowSize = 8 * scaleFactor;
    line(x2, y2, x2 - cos(angle - 0.4) * arrowSize, y2 - sin(angle - 0.4) * arrowSize);
    line(x2, y2, x2 - cos(angle + 0.4) * arrowSize, y2 - sin(angle + 0.4) * arrowSize);
  }
}

function drawStripsodyFaces(voice, section) {
  // Simple expressive faces (emoticons)
  const numFaces = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1.5 * scaleFactor);

  for (let i = 0; i < numFaces; i++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const size = rnd(15, 30) * scaleFactor;

    // Face circle
    noFill();
    ellipse(cx, cy, size, size);

    // Eyes
    const eyeY = cy - size * 0.15;
    const eyeSpacing = size * 0.2;
    fill(features.palette.ink);
    ellipse(cx - eyeSpacing, eyeY, size * 0.12, size * 0.12);
    ellipse(cx + eyeSpacing, eyeY, size * 0.12, size * 0.12);

    // Mouth (random expression)
    noFill();
    const mouthType = rndInt(0, 3);
    const mouthY = cy + size * 0.2;
    if (mouthType === 0) {
      // Happy
      arc(cx, mouthY, size * 0.4, size * 0.3, 0, PI);
    } else if (mouthType === 1) {
      // Surprised
      ellipse(cx, mouthY, size * 0.2, size * 0.25);
    } else if (mouthType === 2) {
      // Sad
      arc(cx, mouthY + size * 0.1, size * 0.4, size * 0.3, PI, TWO_PI);
    } else {
      // Straight
      line(cx - size * 0.15, mouthY, cx + size * 0.15, mouthY);
    }
  }
}

function drawStripsodyExclamations(voice, section) {
  // Exclamation marks (varying sizes)
  const colors = features.palette.colors || ["#dd2222", "#ff6600", "#000000"];
  const numMarks = Math.max(2, Math.floor(rnd(3, 7) * features.densityValue));

  noStroke();

  for (let i = 0; i < numMarks; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const size = rnd(12, 25) * scaleFactor;

    fill(rndChoice(colors));

    // Exclamation body (tapered rectangle)
    beginShape();
    vertex(x - size * 0.15, y - size * 0.5);
    vertex(x + size * 0.15, y - size * 0.5);
    vertex(x + size * 0.08, y + size * 0.25);
    vertex(x - size * 0.08, y + size * 0.25);
    endShape(CLOSE);

    // Dot
    ellipse(x, y + size * 0.42, size * 0.18, size * 0.18);
  }
}

function drawStripsodyQuestionMarks(voice, section) {
  // Question marks
  const colors = features.palette.colors || ["#2255cc", "#9933cc", "#000000"];
  const numMarks = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  for (let i = 0; i < numMarks; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const size = rnd(12, 22) * scaleFactor;

    stroke(rndChoice(colors));
    strokeWeight(size * 0.15);
    noFill();

    // Question curve
    arc(x, y - size * 0.2, size * 0.5, size * 0.5, PI + 0.3, TWO_PI + 0.5);
    line(x + size * 0.15, y - size * 0.1, x, y + size * 0.15);

    // Dot
    noStroke();
    fill(stroke());
    ellipse(x, y + size * 0.35, size * 0.15, size * 0.15);
  }
}

function drawStripsodyHearts(voice, section) {
  // Heart shapes
  const colors = features.palette.colors || ["#dd2222", "#ff6699", "#cc0066"];
  const numHearts = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  noStroke();

  for (let i = 0; i < numHearts; i++) {
    const cx = rnd(section.xStart + 20, section.xEnd - 20);
    const cy = rnd(voice.yStart + 15, voice.yEnd - 15);
    const size = rnd(8, 18) * scaleFactor;

    fill(rndChoice(colors));

    beginShape();
    vertex(cx, cy + size * 0.3);
    bezierVertex(cx - size * 0.5, cy - size * 0.1, cx - size * 0.5, cy - size * 0.5, cx, cy - size * 0.2);
    bezierVertex(cx + size * 0.5, cy - size * 0.5, cx + size * 0.5, cy - size * 0.1, cx, cy + size * 0.3);
    endShape(CLOSE);
  }
}

function drawStripsodyMusicNotes(voice, section) {
  // Floating music notes
  const numNotes = Math.max(2, Math.floor(rnd(3, 7) * features.densityValue));

  fill(features.palette.ink);
  stroke(features.palette.ink);
  strokeWeight(1.5 * scaleFactor);

  for (let i = 0; i < numNotes; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 20, voice.yEnd - 15);
    const size = rnd(8, 15) * scaleFactor;

    // Note head (filled ellipse)
    noStroke();
    push();
    translate(x, y);
    rotate(-0.3);
    ellipse(0, 0, size, size * 0.7);
    pop();

    // Stem
    stroke(features.palette.ink);
    line(x + size * 0.45, y - size * 0.2, x + size * 0.45, y - size * 1.5);

    // Flag (optional)
    if (rndBool(0.5)) {
      noFill();
      beginShape();
      vertex(x + size * 0.45, y - size * 1.5);
      quadraticVertex(x + size * 0.9, y - size * 1.2, x + size * 0.6, y - size * 0.8);
      endShape();
    }
  }
}

function drawStripsodyLightning(voice, section) {
  // Lightning bolt shapes
  const colors = features.palette.colors || ["#ffcc00", "#ff6600", "#ffffff"];
  const numBolts = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  for (let i = 0; i < numBolts; i++) {
    const x = rnd(section.xStart + 25, section.xEnd - 25);
    const y = rnd(voice.yStart + 10, voice.yEnd - 25);
    const size = rnd(15, 30) * scaleFactor;

    fill(rndChoice(colors));
    stroke(features.palette.ink);
    strokeWeight(1 * scaleFactor);

    beginShape();
    vertex(x, y);
    vertex(x + size * 0.3, y + size * 0.4);
    vertex(x + size * 0.1, y + size * 0.4);
    vertex(x + size * 0.4, y + size);
    vertex(x + size * 0.05, y + size * 0.55);
    vertex(x + size * 0.25, y + size * 0.55);
    endShape(CLOSE);
  }
}

function drawStripsodySpirals(voice, section) {
  // Dizzy spiral marks
  const numSpirals = Math.max(2, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1.5 * scaleFactor);
  noFill();

  for (let i = 0; i < numSpirals; i++) {
    const cx = rnd(section.xStart + 20, section.xEnd - 20);
    const cy = rnd(voice.yStart + 15, voice.yEnd - 15);
    const maxR = rnd(8, 18) * scaleFactor;
    const turns = rnd(2, 4);

    beginShape();
    for (let t = 0; t < turns * TWO_PI; t += 0.2) {
      const r = (t / (turns * TWO_PI)) * maxR;
      vertex(cx + cos(t) * r, cy + sin(t) * r);
    }
    endShape();
  }
}

function drawStripsodyDroplets(voice, section) {
  // Sweat/water droplets
  const colors = features.palette.colors || ["#66ccff", "#3399ff", "#99ddff"];
  const numDrops = Math.max(2, Math.floor(rnd(3, 7) * features.densityValue));

  noStroke();

  for (let i = 0; i < numDrops; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const size = rnd(5, 12) * scaleFactor;

    fill(rndChoice(colors));

    beginShape();
    vertex(x, y - size * 0.5);
    bezierVertex(x - size * 0.4, y, x - size * 0.4, y + size * 0.4, x, y + size * 0.5);
    bezierVertex(x + size * 0.4, y + size * 0.4, x + size * 0.4, y, x, y - size * 0.5);
    endShape(CLOSE);
  }
}

function drawStripsodyPuffs(voice, section) {
  // Smoke/cloud puffs
  const numPuffs = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.inkLight);
  strokeWeight(1 * scaleFactor);
  noFill();

  for (let p = 0; p < numPuffs; p++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const size = rnd(15, 30) * scaleFactor;

    // Cloud made of overlapping circles
    const numCircles = rndInt(4, 7);
    for (let i = 0; i < numCircles; i++) {
      const angle = (i / numCircles) * TWO_PI;
      const r = size * 0.4;
      const ox = cx + cos(angle) * r * 0.5;
      const oy = cy + sin(angle) * r * 0.3;
      const circleSize = rnd(size * 0.4, size * 0.6);
      ellipse(ox, oy, circleSize, circleSize * 0.8);
    }
  }
}

function drawStripsodyImpact(voice, section) {
  // Impact radiating lines (from central point)
  const numImpacts = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);

  for (let i = 0; i < numImpacts; i++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const numRays = rndInt(8, 16);
    const innerR = rnd(5, 10) * scaleFactor;
    const outerR = rnd(20, 40) * scaleFactor;

    for (let r = 0; r < numRays; r++) {
      const angle = (r / numRays) * TWO_PI + rnd(-0.1, 0.1);
      strokeWeight(rnd(0.5, 2) * scaleFactor);
      line(
        cx + cos(angle) * innerR,
        cy + sin(angle) * innerR,
        cx + cos(angle) * outerR * rnd(0.7, 1),
        cy + sin(angle) * outerR * rnd(0.7, 1)
      );
    }
  }
}

function drawStripsodyWobble(voice, section) {
  // Wobble/vibration marks (wavy lines around objects)
  const numWobbles = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  noFill();

  for (let w = 0; w < numWobbles; w++) {
    const cx = rnd(section.xStart + 25, section.xEnd - 25);
    const cy = rnd(voice.yStart + 15, voice.yEnd - 15);
    const size = rnd(10, 25) * scaleFactor;

    // Draw 2-3 concentric wavy arcs
    for (let layer = 0; layer < rndInt(2, 4); layer++) {
      const r = size * (0.5 + layer * 0.25);
      const startAngle = rnd(0, PI);

      beginShape();
      for (let a = startAngle; a < startAngle + PI * 0.8; a += 0.15) {
        const wobbleR = r + sin(a * 8) * (3 * scaleFactor);
        vertex(cx + cos(a) * wobbleR, cy + sin(a) * wobbleR);
      }
      endShape();
    }
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: ANKHRASMATION (Wadada Leo Smith)
// ============================================================

function drawAnkhrasmationDurations(voice, section) {
  // Duration symbols - colored bars of varying lengths
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#ffcc00", "#00aa55", "#9933cc"];

  const numUnits = Math.max(1, Math.floor(rnd(4, 10) * features.densityValue));

  noStroke();

  for (let i = 0; i < numUnits; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 40);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);

    // Duration represented by length
    const duration = rndInt(1, 6);
    const w = duration * 12 * scaleFactor;
    const h = rnd(4, 10) * scaleFactor;

    fill(rndChoice(colors));
    rect(x, y, w, h);

    // Occasional dot modifier
    if (rndBool(0.3)) {
      ellipse(x + w + 5 * scaleFactor, y + h/2, 4 * scaleFactor, 4 * scaleFactor);
    }
  }
}

function drawAnkhrasmationSymbols(voice, section) {
  // Symbolic marks from the Ankhrasmation language
  const numSymbols = Math.floor(rnd(3, 7) * features.densityValue);

  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#ffcc00"];

  for (let i = 0; i < numSymbols; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const size = rnd(8, 20) * scaleFactor;
    const symbolType = rndInt(0, 5);

    const c = rndChoice(colors);
    stroke(c);
    strokeWeight(2 * scaleFactor);

    switch (symbolType) {
      case 0: // Vertical line (short sound)
        line(x, y - size/2, x, y + size/2);
        break;
      case 1: // Horizontal line (long sound)
        line(x - size, y, x + size, y);
        break;
      case 2: // Angled line (movement)
        line(x - size/2, y + size/3, x + size/2, y - size/3);
        break;
      case 3: // Circle (held tone)
        noFill();
        ellipse(x, y, size, size);
        break;
      case 4: // Filled circle (accent)
        fill(c);
        noStroke();
        ellipse(x, y, size * 0.5, size * 0.5);
        break;
      case 5: // Triangle (attack)
        noFill();
        triangle(x, y - size/2, x - size/2, y + size/2, x + size/2, y + size/2);
        break;
    }
  }
}

function drawAnkhrasmationColorBars(voice, section) {
  // Colored horizontal bars in sequence (like sentences)
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#ffcc00", "#00aa55", "#9933cc", "#ff6699"];

  const numSequences = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  noStroke();

  for (let s = 0; s < numSequences; s++) {
    let x = rnd(section.xStart + 15, section.xStart + 60);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const h = rnd(6, 12) * scaleFactor;
    const numBars = rndInt(4, 8);

    for (let i = 0; i < numBars; i++) {
      const w = rnd(15, 50) * scaleFactor;
      fill(rndChoice(colors));
      rect(x, y, w, h);
      x += w + rnd(3, 8) * scaleFactor;
      if (x > section.xEnd - 20) break;
    }
  }
}

function drawAnkhrasmationDiagonals(voice, section) {
  // Diagonal direction indicators
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#ffcc00"];

  const numDiagonals = Math.max(2, Math.floor(rnd(3, 7) * features.densityValue));

  strokeWeight(3 * scaleFactor);

  for (let i = 0; i < numDiagonals; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 30);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const len = rnd(15, 35) * scaleFactor;
    const dir = rndBool(0.5) ? 1 : -1;  // Up or down

    stroke(rndChoice(colors));
    line(x, y, x + len, y + dir * len * 0.5);
  }
}

function drawAnkhrasmationCells(voice, section) {
  // Rhythmic unit cells (boxed color regions)
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#ffcc00", "#00aa55"];

  const numCells = Math.max(2, Math.floor(rnd(2, 5) * features.densityValue));

  for (let i = 0; i < numCells; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 50);
    const y = rnd(voice.yStart + 10, voice.yEnd - 25);
    const w = rnd(20, 45) * scaleFactor;
    const h = rnd(15, 25) * scaleFactor;

    // Box outline
    stroke(features.palette.ink);
    strokeWeight(1 * scaleFactor);
    noFill();
    rect(x, y, w, h);

    // Inner color marks
    noStroke();
    const numInner = rndInt(2, 4);
    for (let j = 0; j < numInner; j++) {
      fill(rndChoice(colors));
      const ix = x + rnd(3, w - 8) * scaleFactor;
      const iy = y + rnd(3, h - 5) * scaleFactor;
      const iw = rnd(5, 12) * scaleFactor;
      const ih = rnd(3, 6) * scaleFactor;
      rect(ix, iy, iw, ih);
    }
  }
}

function drawAnkhrasmationArrows(voice, section) {
  // Direction arrows (movement indicators)
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#00aa55"];

  const numArrows = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  for (let i = 0; i < numArrows; i++) {
    const x = rnd(section.xStart + 25, section.xEnd - 40);
    const y = rnd(voice.yStart + 12, voice.yEnd - 12);
    const len = rnd(20, 50) * scaleFactor;
    const angle = rnd(-0.4, 0.4);

    const c = rndChoice(colors);
    stroke(c);
    strokeWeight(2.5 * scaleFactor);

    // Arrow line
    const x2 = x + cos(angle) * len;
    const y2 = y + sin(angle) * len;
    line(x, y, x2, y2);

    // Arrow head
    const headSize = 8 * scaleFactor;
    fill(c);
    beginShape();
    vertex(x2, y2);
    vertex(x2 - cos(angle - 0.5) * headSize, y2 - sin(angle - 0.5) * headSize);
    vertex(x2 - cos(angle + 0.5) * headSize, y2 - sin(angle + 0.5) * headSize);
    endShape(CLOSE);
  }
}

function drawAnkhrasmationGradients(voice, section) {
  // Color gradient bars (intensity change)
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#ffcc00"];

  const numGradients = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  noStroke();

  for (let g = 0; g < numGradients; g++) {
    const x = rnd(section.xStart + 20, section.xStart + 80);
    const y = rnd(voice.yStart + 12, voice.yEnd - 18);
    const totalW = rnd(60, 120) * scaleFactor;
    const h = rnd(8, 14) * scaleFactor;
    const c = rndChoice(colors);

    // Draw gradient as segments
    const segments = 10;
    const segW = totalW / segments;
    for (let s = 0; s < segments; s++) {
      const alpha = rndBool(0.5) ?
        map(s, 0, segments - 1, 50, 255) :
        map(s, 0, segments - 1, 255, 50);
      fill(red(color(c)), green(color(c)), blue(color(c)), alpha);
      rect(x + s * segW, y, segW + 1, h);
    }
  }
}

function drawAnkhrasmationVertical(voice, section) {
  // Vertical accent marks
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#9933cc"];

  const numMarks = Math.max(3, Math.floor(rnd(4, 9) * features.densityValue));

  for (let i = 0; i < numMarks; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 15);
    const y = rnd(voice.yStart + 10, voice.yEnd - 20);
    const h = rnd(10, 30) * scaleFactor;
    const w = rnd(3, 8) * scaleFactor;

    noStroke();
    fill(rndChoice(colors));
    rect(x, y, w, h);
  }
}

function drawAnkhrasmationRests(voice, section) {
  // Rest/silence indicators (empty spaces with marks)
  const numRests = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.inkLight);
  strokeWeight(1 * scaleFactor);
  noFill();

  for (let i = 0; i < numRests; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 40);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const w = rnd(15, 35) * scaleFactor;

    // Rest bracket
    line(x, y - 5 * scaleFactor, x, y + 5 * scaleFactor);
    line(x, y, x + w, y);
    line(x + w, y - 5 * scaleFactor, x + w, y + 5 * scaleFactor);

    // Optional center mark
    if (rndBool(0.5)) {
      ellipse(x + w / 2, y, 4 * scaleFactor, 4 * scaleFactor);
    }
  }
}

function drawAnkhrasmationConnected(voice, section) {
  // Connected color sequences (phrases)
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#ffcc00", "#00aa55"];

  const numSequences = Math.max(1, Math.floor(rnd(1, 2) * features.densityValue));

  for (let s = 0; s < numSequences; s++) {
    let x = rnd(section.xStart + 15, section.xStart + 50);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const numElements = rndInt(4, 8);

    stroke(features.palette.ink);
    strokeWeight(1 * scaleFactor);

    for (let i = 0; i < numElements; i++) {
      const w = rnd(10, 25) * scaleFactor;
      const h = rnd(6, 12) * scaleFactor;

      // Colored element
      fill(rndChoice(colors));
      rect(x, y - h / 2, w, h);

      // Connecting line
      if (i < numElements - 1) {
        const nextX = x + w + rnd(5, 15) * scaleFactor;
        if (nextX < section.xEnd - 30) {
          line(x + w, y, nextX, y);
          x = nextX;
        } else break;
      }
    }
  }
}

function drawAnkhrasmationCrescendo(voice, section) {
  // Growing intensity wedge marks
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#ffcc00"];

  const numWedges = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  noStroke();

  for (let i = 0; i < numWedges; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 60);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const len = rnd(30, 60) * scaleFactor;
    const maxH = rnd(12, 22) * scaleFactor;
    const growing = rndBool(0.5);

    fill(rndChoice(colors));
    beginShape();
    if (growing) {
      // Crescendo (gets taller)
      vertex(x, y);
      vertex(x + len, y - maxH / 2);
      vertex(x + len, y + maxH / 2);
    } else {
      // Decrescendo (gets shorter)
      vertex(x, y - maxH / 2);
      vertex(x, y + maxH / 2);
      vertex(x + len, y);
    }
    endShape(CLOSE);
  }
}

function drawAnkhrasmationClusters(voice, section) {
  // Grouped multi-color mark clusters
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#ffcc00", "#00aa55", "#9933cc"];

  const numClusters = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  noStroke();

  for (let c = 0; c < numClusters; c++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const numMarks = rndInt(4, 8);

    for (let i = 0; i < numMarks; i++) {
      const ox = cx + rnd(-20, 20) * scaleFactor;
      const oy = cy + rnd(-12, 12) * scaleFactor;
      const w = rnd(5, 15) * scaleFactor;
      const h = rnd(3, 8) * scaleFactor;

      fill(rndChoice(colors));
      rect(ox, oy, w, h);
    }
  }
}

function drawAnkhrasmationWaves(voice, section) {
  // Wave-form duration indicators
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#00aa55"];

  const numWaves = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  strokeWeight(3 * scaleFactor);
  noFill();

  for (let w = 0; w < numWaves; w++) {
    const x = rnd(section.xStart + 15, section.xStart + 60);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const len = rnd(60, 120) * scaleFactor;
    const amp = rnd(5, 12) * scaleFactor;

    stroke(rndChoice(colors));
    beginShape();
    for (let px = 0; px < len; px += 3) {
      const py = y + sin(px * 0.15) * amp;
      vertex(x + px, py);
    }
    endShape();
  }
}

function drawAnkhrasmationDots(voice, section) {
  // Dot patterns (rhythmic accents) - now influenced by time signature
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#ffcc00", "#9933cc"];

  const numGroups = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  noStroke();

  // Use beat grouping to determine dots per group
  const beatsPerGroup = features.beatGrouping || 4;

  for (let g = 0; g < numGroups; g++) {
    const x = rnd(section.xStart + 20, section.xEnd - 50);
    const y = rnd(voice.yStart + 12, voice.yEnd - 12);
    // Number of dots follows beat grouping (or subdivision)
    const numDots = features.isAsymmetric ? rndInt(2, beatsPerGroup) : beatsPerGroup;
    const spacing = rnd(8, 15) * scaleFactor;
    const baseDotSize = rnd(4, 9) * scaleFactor;
    const c = rndChoice(colors);

    for (let d = 0; d < numDots; d++) {
      // Size follows accent pattern - downbeats larger
      const accent = getAccentWeight(d);
      const dotSize = baseDotSize * (0.6 + accent * 0.6);
      // Opacity also follows accent
      const opacityHex = Math.floor(0x99 + accent * 0x66).toString(16).padStart(2, '0');
      fill(c.slice(0, 7) + opacityHex);
      ellipse(x + d * spacing, y, dotSize, dotSize);
    }
  }
}

function drawAnkhrasmationBrackets(voice, section) {
  // Grouping brackets
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc"];

  const numBrackets = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  strokeWeight(2 * scaleFactor);
  noFill();

  for (let b = 0; b < numBrackets; b++) {
    const x = rnd(section.xStart + 20, section.xEnd - 60);
    const y = rnd(voice.yStart + 10, voice.yEnd - 20);
    const w = rnd(30, 70) * scaleFactor;
    const h = rnd(15, 25) * scaleFactor;

    stroke(rndChoice(colors));

    // Left bracket
    line(x + 5 * scaleFactor, y, x, y);
    line(x, y, x, y + h);
    line(x, y + h, x + 5 * scaleFactor, y + h);

    // Right bracket
    line(x + w - 5 * scaleFactor, y, x + w, y);
    line(x + w, y, x + w, y + h);
    line(x + w, y + h, x + w - 5 * scaleFactor, y + h);
  }
}

function drawAnkhrasmationNumbers(voice, section) {
  // Numerical indicators (unit counts)
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#00aa55"];

  const numNumbers = Math.max(2, Math.floor(rnd(2, 5) * features.densityValue));

  textFont("sans-serif");

  for (let i = 0; i < numNumbers; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 20);
    const y = rnd(voice.yStart + 15, voice.yEnd - 10);
    const num = rndInt(1, 9);
    const size = rnd(10, 18) * scaleFactor;

    fill(rndChoice(colors));
    noStroke();
    textSize(size);
    textStyle(BOLD);
    text(num.toString(), x, y);
  }
  textStyle(NORMAL);
}

function drawAnkhrasmationParallel(voice, section) {
  // Parallel color lines (simultaneous events)
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#ffcc00", "#00aa55"];

  const numGroups = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  noStroke();

  for (let g = 0; g < numGroups; g++) {
    const x = rnd(section.xStart + 20, section.xStart + 80);
    const baseY = rnd(voice.yStart + 20, voice.yEnd - 30);
    const numLines = rndInt(2, 4);
    const spacing = rnd(6, 10) * scaleFactor;
    const len = rnd(40, 90) * scaleFactor;
    const h = rnd(3, 6) * scaleFactor;

    for (let l = 0; l < numLines; l++) {
      fill(colors[l % colors.length]);
      rect(x, baseY + l * spacing, len, h);
    }
  }
}

function drawAnkhrasmationImprovisationZone(voice, section) {
  // Free improvisation zone (outlined area with color)
  const colors = features.palette.colors ||
    ["#cc3300", "#0066cc", "#ffcc00"];

  const numZones = Math.max(1, Math.floor(rnd(1, 2) * features.densityValue));

  for (let z = 0; z < numZones; z++) {
    const x = rnd(section.xStart + 15, section.xEnd - 80);
    const y = rnd(voice.yStart + 10, voice.yEnd - 30);
    const w = rnd(40, 80) * scaleFactor;
    const h = rnd(20, 35) * scaleFactor;

    // Dashed outline
    stroke(features.palette.ink);
    strokeWeight(1 * scaleFactor);
    noFill();

    // Draw dashed rectangle
    const dashLen = 5 * scaleFactor;
    for (let dx = 0; dx < w; dx += dashLen * 2) {
      line(x + dx, y, x + Math.min(dx + dashLen, w), y);
      line(x + dx, y + h, x + Math.min(dx + dashLen, w), y + h);
    }
    for (let dy = 0; dy < h; dy += dashLen * 2) {
      line(x, y + dy, x, y + Math.min(dy + dashLen, h));
      line(x + w, y + dy, x + w, y + Math.min(dy + dashLen, h));
    }

    // Light color fill
    noStroke();
    const c = color(rndChoice(colors));
    fill(red(c), green(c), blue(c), 50);
    rect(x, y, w, h);

    // "FREE" or similar text
    if (rndBool(0.4)) {
      fill(features.palette.inkLight);
      textSize(8 * scaleFactor);
      textFont("sans-serif");
      text("FREE", x + 5 * scaleFactor, y + h / 2 + 3 * scaleFactor);
    }
  }
}

// ============================================================
// MODE-SPECIFIC DRAWING: BRAXTON (Anthony Braxton)
// ============================================================

function drawBraxtonDiagrams(voice, section) {
  // Diagrammatic/schematic notation
  const numDiagrams = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  noFill();

  for (let i = 0; i < numDiagrams; i++) {
    const cx = rnd(section.xStart + 40, section.xEnd - 40);
    const cy = rnd(voice.yStart + 25, voice.yEnd - 25);
    const size = rnd(25, 50) * scaleFactor;
    const diagramType = rndInt(0, 5);

    switch (diagramType) {
      case 0: // Connected boxes (language type)
        rect(cx - size/2, cy - size/4, size * 0.4, size/2);
        rect(cx + size * 0.1, cy - size/4, size * 0.4, size/2);
        line(cx - size * 0.1, cy, cx + size * 0.1, cy);
        break;

      case 1: // Arrow sequence
        line(cx - size/2, cy, cx + size/2, cy);
        line(cx + size/2 - 5 * scaleFactor, cy - 5 * scaleFactor, cx + size/2, cy);
        line(cx + size/2 - 5 * scaleFactor, cy + 5 * scaleFactor, cx + size/2, cy);
        break;

      case 2: // Branching structure
        line(cx, cy - size/2, cx, cy);
        line(cx, cy, cx - size/3, cy + size/2);
        line(cx, cy, cx + size/3, cy + size/2);
        break;

      case 3: // Nested shapes
        rect(cx - size/2, cy - size/2, size, size);
        ellipse(cx, cy, size * 0.6, size * 0.6);
        break;

      case 4: // Grid pattern
        for (let gx = 0; gx < 3; gx++) {
          for (let gy = 0; gy < 2; gy++) {
            rect(cx - size/2 + gx * size/3, cy - size/3 + gy * size/3, size/3 - 2, size/3 - 2);
          }
        }
        break;

      case 5: // Circular diagram
        ellipse(cx, cy, size, size);
        line(cx - size/2, cy, cx + size/2, cy);
        line(cx, cy - size/2, cx, cy + size/2);
        break;
    }
  }
}

function drawBraxtonLanguageTypes(voice, section) {
  // Language type symbols (lines representing sound types)
  const numTypes = Math.floor(rnd(4, 10) * features.densityValue);

  stroke(features.palette.ink);

  for (let i = 0; i < numTypes; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 50);
    const y = rnd(voice.yStart + 10, voice.yEnd - 10);
    const len = rnd(20, 60) * scaleFactor;
    const typeNum = rndInt(0, 5);

    strokeWeight(1.5 * scaleFactor);

    switch (typeNum) {
      case 0: // Long sound (straight line)
        line(x, y, x + len, y);
        break;
      case 1: // Staccato (dashed line)
        for (let dx = 0; dx < len; dx += 8 * scaleFactor) {
          line(x + dx, y, x + dx + 4 * scaleFactor, y);
        }
        break;
      case 2: // Trill/oscillation (wavy line)
        beginShape();
        for (let dx = 0; dx <= len; dx += 4 * scaleFactor) {
          const wy = y + sin(dx * 0.3) * 4 * scaleFactor;
          vertex(x + dx, wy);
        }
        endShape();
        break;
      case 3: // Accent (thick short)
        strokeWeight(4 * scaleFactor);
        line(x, y, x + len * 0.3, y);
        break;
      case 4: // Glissando (diagonal)
        line(x, y, x + len, y - 15 * scaleFactor);
        break;
      case 5: // Multiphonic (parallel lines)
        line(x, y - 3 * scaleFactor, x + len, y - 3 * scaleFactor);
        line(x, y + 3 * scaleFactor, x + len, y + 3 * scaleFactor);
        break;
    }
  }
}

function drawBraxtonCompositionNumber(voice, section) {
  // Composition number titles (like Braxton's opus numbering)
  const numNumbers = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("monospace");
  textSize(12 * scaleFactor);
  textStyle(BOLD);

  for (let i = 0; i < numNumbers; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 60);
    const y = rnd(voice.yStart + 15, voice.yEnd - 10);

    // Generate composition number format
    const num = rndInt(1, 500);
    const letter = String.fromCharCode(65 + rndInt(0, 25));
    const format = rndInt(0, 3);

    let compositionNum;
    if (format === 0) compositionNum = `No. ${num}`;
    else if (format === 1) compositionNum = `${num}${letter}`;
    else if (format === 2) compositionNum = `(${num})`;
    else compositionNum = `Comp. ${num}`;

    text(compositionNum, x, y);
  }
  textStyle(NORMAL);
}

function drawBraxtonConnectors(voice, section) {
  // Connection lines between elements
  const numConnectors = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);

  for (let i = 0; i < numConnectors; i++) {
    const x1 = rnd(section.xStart + 20, section.xEnd - 80);
    const y1 = rnd(voice.yStart + 15, voice.yEnd - 15);
    const len = rnd(40, 80) * scaleFactor;
    const angle = rnd(-0.3, 0.3);

    const x2 = x1 + cos(angle) * len;
    const y2 = y1 + sin(angle) * len;

    // Line with end marks
    line(x1, y1, x2, y2);

    // Small circles at ends
    noFill();
    ellipse(x1, y1, 5 * scaleFactor, 5 * scaleFactor);
    ellipse(x2, y2, 5 * scaleFactor, 5 * scaleFactor);
  }
}

function drawBraxtonTechnicalMarks(voice, section) {
  // Technical drawing marks (dimensions, angles)
  const numMarks = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(0.75 * scaleFactor);
  noFill();

  for (let i = 0; i < numMarks; i++) {
    const x = rnd(section.xStart + 25, section.xEnd - 60);
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const size = rnd(25, 50) * scaleFactor;

    // Dimension line with extensions
    line(x, y, x + size, y);
    line(x, y - 8 * scaleFactor, x, y + 8 * scaleFactor);
    line(x + size, y - 8 * scaleFactor, x + size, y + 8 * scaleFactor);

    // Small arrows
    const arrowSize = 3 * scaleFactor;
    line(x, y, x + arrowSize, y - arrowSize);
    line(x, y, x + arrowSize, y + arrowSize);
    line(x + size, y, x + size - arrowSize, y - arrowSize);
    line(x + size, y, x + size - arrowSize, y + arrowSize);
  }
}

function drawBraxtonFlowArrows(voice, section) {
  // Flow/direction arrows
  const numArrows = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1.5 * scaleFactor);

  for (let i = 0; i < numArrows; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 40);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const len = rnd(20, 40) * scaleFactor;
    const direction = rndInt(0, 3); // right, down, left, up

    let dx = 0, dy = 0;
    if (direction === 0) dx = len;
    else if (direction === 1) dy = len;
    else if (direction === 2) dx = -len;
    else dy = -len;

    // Arrow shaft
    line(x, y, x + dx, y + dy);

    // Arrow head
    const headSize = 6 * scaleFactor;
    if (direction === 0) {
      line(x + dx, y + dy, x + dx - headSize, y + dy - headSize / 2);
      line(x + dx, y + dy, x + dx - headSize, y + dy + headSize / 2);
    } else if (direction === 1) {
      line(x + dx, y + dy, x + dx - headSize / 2, y + dy - headSize);
      line(x + dx, y + dy, x + dx + headSize / 2, y + dy - headSize);
    } else if (direction === 2) {
      line(x + dx, y + dy, x + dx + headSize, y + dy - headSize / 2);
      line(x + dx, y + dy, x + dx + headSize, y + dy + headSize / 2);
    } else {
      line(x + dx, y + dy, x + dx - headSize / 2, y + dy + headSize);
      line(x + dx, y + dy, x + dx + headSize / 2, y + dy + headSize);
    }
  }
}

function drawBraxtonCircuitElements(voice, section) {
  // Circuit-like schematic symbols
  const numElements = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  noFill();

  for (let i = 0; i < numElements; i++) {
    const x = rnd(section.xStart + 30, section.xEnd - 40);
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const size = rnd(15, 30) * scaleFactor;
    const elemType = rndInt(0, 4);

    switch (elemType) {
      case 0: // Resistor zigzag
        beginShape();
        vertex(x, y);
        for (let j = 0; j < 5; j++) {
          vertex(x + (j + 0.5) * size / 5, y + (j % 2 === 0 ? -5 : 5) * scaleFactor);
        }
        vertex(x + size, y);
        endShape();
        break;
      case 1: // Capacitor
        line(x, y, x + size * 0.4, y);
        line(x + size * 0.4, y - 8 * scaleFactor, x + size * 0.4, y + 8 * scaleFactor);
        line(x + size * 0.6, y - 8 * scaleFactor, x + size * 0.6, y + 8 * scaleFactor);
        line(x + size * 0.6, y, x + size, y);
        break;
      case 2: // Inductor coils
        for (let j = 0; j < 4; j++) {
          arc(x + j * size / 4 + size / 8, y, size / 4, size / 2, PI, 0);
        }
        break;
      case 3: // Ground symbol
        line(x + size / 2, y - 10 * scaleFactor, x + size / 2, y);
        line(x + size / 2 - 10 * scaleFactor, y, x + size / 2 + 10 * scaleFactor, y);
        line(x + size / 2 - 6 * scaleFactor, y + 4 * scaleFactor, x + size / 2 + 6 * scaleFactor, y + 4 * scaleFactor);
        line(x + size / 2 - 3 * scaleFactor, y + 8 * scaleFactor, x + size / 2 + 3 * scaleFactor, y + 8 * scaleFactor);
        break;
      case 4: // Op-amp triangle
        triangle(x, y - 10 * scaleFactor, x, y + 10 * scaleFactor, x + size, y);
        break;
    }
  }
}

function drawBraxtonAngleBrackets(voice, section) {
  // Angle bracket structures
  const numBrackets = Math.max(2, Math.floor(rnd(2, 5) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1.5 * scaleFactor);
  noFill();

  for (let i = 0; i < numBrackets; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 30);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const size = rnd(10, 25) * scaleFactor;
    const type = rndInt(0, 2);

    if (type === 0) { // < bracket
      line(x + size, y - size, x, y);
      line(x, y, x + size, y + size);
    } else if (type === 1) { // > bracket
      line(x, y - size, x + size, y);
      line(x + size, y, x, y + size);
    } else { // ^ bracket
      line(x, y + size / 2, x + size / 2, y - size / 2);
      line(x + size / 2, y - size / 2, x + size, y + size / 2);
    }
  }
}

function drawBraxtonParallelStructures(voice, section) {
  // Parallel structural lines
  const numGroups = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);

  for (let g = 0; g < numGroups; g++) {
    const x = rnd(section.xStart + 15, section.xEnd - 60);
    const y = rnd(voice.yStart + 20, voice.yEnd - 30);
    const len = rnd(40, 80) * scaleFactor;
    const numLines = rndInt(3, 6);
    const spacing = rnd(4, 8) * scaleFactor;

    for (let l = 0; l < numLines; l++) {
      line(x, y + l * spacing, x + len, y + l * spacing);
    }

    // Vertical connectors at ends
    line(x, y, x, y + (numLines - 1) * spacing);
    line(x + len, y, x + len, y + (numLines - 1) * spacing);
  }
}

function drawBraxtonContainment(voice, section) {
  // Containment shapes (brackets, boxes, circles)
  const numShapes = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  noFill();

  for (let i = 0; i < numShapes; i++) {
    const x = rnd(section.xStart + 25, section.xEnd - 50);
    const y = rnd(voice.yStart + 20, voice.yEnd - 25);
    const w = rnd(25, 50) * scaleFactor;
    const h = rnd(20, 35) * scaleFactor;
    const type = rndInt(0, 3);

    switch (type) {
      case 0: // Rectangle
        rect(x, y, w, h);
        break;
      case 1: // Ellipse
        ellipse(x + w / 2, y + h / 2, w, h);
        break;
      case 2: // Square brackets [ ]
        line(x, y, x + 8 * scaleFactor, y);
        line(x, y, x, y + h);
        line(x, y + h, x + 8 * scaleFactor, y + h);
        line(x + w, y, x + w - 8 * scaleFactor, y);
        line(x + w, y, x + w, y + h);
        line(x + w, y + h, x + w - 8 * scaleFactor, y + h);
        break;
      case 3: // Rounded rect
        rect(x, y, w, h, 5 * scaleFactor);
        break;
    }
  }
}

function drawBraxtonZones(voice, section) {
  // Zone/region markers with labels
  const numZones = Math.max(1, Math.floor(rnd(1, 2) * features.densityValue));

  for (let z = 0; z < numZones; z++) {
    const x = rnd(section.xStart + 20, section.xEnd - 80);
    const y = rnd(voice.yStart + 15, voice.yEnd - 35);
    const w = rnd(50, 100) * scaleFactor;
    const h = rnd(25, 40) * scaleFactor;

    // Dashed outline
    stroke(features.palette.ink);
    strokeWeight(0.75 * scaleFactor);
    noFill();

    const dashLen = 4 * scaleFactor;
    for (let dx = 0; dx < w; dx += dashLen * 2) {
      line(x + dx, y, x + Math.min(dx + dashLen, w), y);
      line(x + dx, y + h, x + Math.min(dx + dashLen, w), y + h);
    }
    for (let dy = 0; dy < h; dy += dashLen * 2) {
      line(x, y + dy, x, y + Math.min(dy + dashLen, h));
      line(x + w, y + dy, x + w, y + Math.min(dy + dashLen, h));
    }

    // Zone label
    fill(features.palette.ink);
    noStroke();
    textFont("monospace");
    textSize(8 * scaleFactor);
    text(`ZONE ${String.fromCharCode(65 + z)}`, x + 5 * scaleFactor, y + 12 * scaleFactor);
  }
}

function drawBraxtonPathways(voice, section) {
  // Pathway/route indicators
  const numPaths = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1.5 * scaleFactor);
  noFill();

  for (let p = 0; p < numPaths; p++) {
    const x1 = rnd(section.xStart + 20, section.xStart + 60);
    const y1 = rnd(voice.yStart + 15, voice.yEnd - 15);
    const x2 = x1 + rnd(50, 100) * scaleFactor;
    const y2 = y1 + rnd(-20, 20) * scaleFactor;

    // Curved path
    const cx = (x1 + x2) / 2;
    const cy = y1 + rnd(-25, 25) * scaleFactor;

    beginShape();
    vertex(x1, y1);
    quadraticVertex(cx, cy, x2, y2);
    endShape();

    // Start/end markers
    fill(features.palette.ink);
    ellipse(x1, y1, 6 * scaleFactor, 6 * scaleFactor);
    noFill();
    ellipse(x2, y2, 6 * scaleFactor, 6 * scaleFactor);
  }
}

function drawBraxtonModular(voice, section) {
  // Modular building block shapes
  const numBlocks = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);

  for (let i = 0; i < numBlocks; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 35);
    const y = rnd(voice.yStart + 15, voice.yEnd - 25);
    const size = rnd(12, 25) * scaleFactor;
    const type = rndInt(0, 4);

    noFill();
    switch (type) {
      case 0: // Square
        rect(x, y, size, size);
        break;
      case 1: // Circle
        ellipse(x + size / 2, y + size / 2, size, size);
        break;
      case 2: // Triangle
        triangle(x + size / 2, y, x, y + size, x + size, y + size);
        break;
      case 3: // Diamond
        beginShape();
        vertex(x + size / 2, y);
        vertex(x + size, y + size / 2);
        vertex(x + size / 2, y + size);
        vertex(x, y + size / 2);
        endShape(CLOSE);
        break;
      case 4: // Hexagon
        beginShape();
        for (let a = 0; a < 6; a++) {
          const angle = a * TWO_PI / 6 - PI / 6;
          vertex(x + size / 2 + cos(angle) * size / 2, y + size / 2 + sin(angle) * size / 2);
        }
        endShape(CLOSE);
        break;
    }
  }
}

function drawBraxtonVerticalStack(voice, section) {
  // Vertical stack structures
  const numStacks = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  noFill();

  for (let s = 0; s < numStacks; s++) {
    const x = rnd(section.xStart + 25, section.xEnd - 40);
    const baseY = rnd(voice.yStart + 10, voice.yStart + 20);
    const numLevels = rndInt(3, 6);
    const w = rnd(20, 35) * scaleFactor;
    const h = rnd(8, 14) * scaleFactor;

    for (let l = 0; l < numLevels; l++) {
      const y = baseY + l * h;
      if (y + h > voice.yEnd - 5) break;
      rect(x, y, w, h);
    }
  }
}

function drawBraxtonHorizontalSpread(voice, section) {
  // Horizontal spread patterns
  const numSpreads = Math.max(1, Math.floor(rnd(1, 2) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  noFill();

  for (let s = 0; s < numSpreads; s++) {
    const startX = rnd(section.xStart + 20, section.xStart + 60);
    const y = rnd(voice.yStart + 20, voice.yEnd - 20);
    const numElements = rndInt(4, 8);
    const spacing = rnd(15, 25) * scaleFactor;
    const size = rnd(10, 18) * scaleFactor;

    for (let i = 0; i < numElements; i++) {
      const x = startX + i * spacing;
      if (x + size > section.xEnd - 10) break;
      ellipse(x + size / 2, y, size, size);
    }

    // Connecting line
    line(startX, y, startX + (numElements - 1) * spacing + size, y);
  }
}

function drawBraxtonIntersections(voice, section) {
  // Intersection/crossing marks
  const numIntersections = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);

  for (let i = 0; i < numIntersections; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const y = rnd(voice.yStart + 15, voice.yEnd - 15);
    const size = rnd(8, 18) * scaleFactor;
    const type = rndInt(0, 2);

    if (type === 0) { // X cross
      line(x - size / 2, y - size / 2, x + size / 2, y + size / 2);
      line(x - size / 2, y + size / 2, x + size / 2, y - size / 2);
    } else if (type === 1) { // + cross
      line(x - size / 2, y, x + size / 2, y);
      line(x, y - size / 2, x, y + size / 2);
    } else { // * star
      line(x - size / 2, y, x + size / 2, y);
      line(x, y - size / 2, x, y + size / 2);
      line(x - size / 3, y - size / 3, x + size / 3, y + size / 3);
      line(x - size / 3, y + size / 3, x + size / 3, y - size / 3);
    }
  }
}

function drawBraxtonLabels(voice, section) {
  // Text labels and identifiers
  const labels = ["A", "B", "C", "D", "I", "II", "III", "IV", "α", "β", "γ", "δ", "X", "Y", "Z"];
  const numLabels = Math.max(2, Math.floor(rnd(3, 7) * features.densityValue));

  fill(features.palette.ink);
  noStroke();
  textFont("monospace");
  textSize(10 * scaleFactor);
  textStyle(BOLD);

  for (let i = 0; i < numLabels; i++) {
    const x = rnd(section.xStart + 15, section.xEnd - 20);
    const y = rnd(voice.yStart + 15, voice.yEnd - 10);
    text(rndChoice(labels), x, y);
  }
  textStyle(NORMAL);
}

function drawBraxtonRotational(voice, section) {
  // Rotational symmetry elements
  const numElements = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  noFill();

  for (let e = 0; e < numElements; e++) {
    const cx = rnd(section.xStart + 40, section.xEnd - 40);
    const cy = rnd(voice.yStart + 25, voice.yEnd - 25);
    const size = rnd(20, 40) * scaleFactor;
    const numArms = rndInt(3, 6);

    for (let a = 0; a < numArms; a++) {
      const angle = (a / numArms) * TWO_PI;
      const x2 = cx + cos(angle) * size;
      const y2 = cy + sin(angle) * size;
      line(cx, cy, x2, y2);

      // Small mark at end
      const markSize = 4 * scaleFactor;
      if (rndBool(0.5)) {
        ellipse(x2, y2, markSize, markSize);
      } else {
        rect(x2 - markSize / 2, y2 - markSize / 2, markSize, markSize);
      }
    }
  }
}

// ============================================================
// MOBILE MODE FUNCTIONS (v3.23.0)
// Inspired by Roman Haubenstock-Ramati's mobile scores
// ============================================================

function drawMobileFloatingCells(voice, section) {
  // Floating musical fragments/cells like Calder mobiles
  const numCells = Math.max(2, Math.floor(rnd(3, 7) * features.densityValue));

  for (let i = 0; i < numCells; i++) {
    const cx = rnd(section.xStart + 30, section.xEnd - 30);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);
    const w = rnd(30, 80) * scaleFactor;
    const h = rnd(15, 35) * scaleFactor;

    // Cell boundary (rounded rectangle or ellipse)
    stroke(features.palette.ink);
    strokeWeight(1 * scaleFactor);
    noFill();

    if (rndBool(0.6)) {
      rect(cx - w / 2, cy - h / 2, w, h, 4 * scaleFactor);
    } else {
      ellipse(cx, cy, w, h);
    }

    // Contents: small notation fragments
    fill(features.palette.ink);
    noStroke();
    const numMarks = rndInt(2, 5);
    for (let m = 0; m < numMarks; m++) {
      const mx = cx - w / 3 + (m / numMarks) * (w * 0.6);
      const my = cy + rnd(-h / 4, h / 4);
      const markType = rndInt(0, 3);

      if (markType === 0) {
        // Notehead
        ellipse(mx, my, 4 * scaleFactor, 3 * scaleFactor);
      } else if (markType === 1) {
        // Stem
        stroke(features.palette.ink);
        strokeWeight(0.8 * scaleFactor);
        line(mx, my - 6 * scaleFactor, mx, my + 6 * scaleFactor);
        noStroke();
      } else {
        // Dot
        ellipse(mx, my, 2 * scaleFactor, 2 * scaleFactor);
      }
    }
  }
}

function drawMobileDottedPaths(voice, section) {
  // Dotted connecting lines between cells (navigation paths)
  const numPaths = Math.max(2, Math.floor(rnd(3, 8) * features.densityValue));

  stroke(features.palette.ink + "80");
  strokeWeight(1 * scaleFactor);

  for (let i = 0; i < numPaths; i++) {
    const x1 = rnd(section.xStart + 20, section.xEnd - 20);
    const y1 = rnd(voice.yStart + 15, voice.yEnd - 15);
    const x2 = rnd(section.xStart + 20, section.xEnd - 20);
    const y2 = rnd(voice.yStart + 15, voice.yEnd - 15);

    // Draw dotted line
    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const numDots = Math.floor(dist / (6 * scaleFactor));
    noStroke();
    fill(features.palette.ink + "70");

    for (let d = 0; d < numDots; d++) {
      const t = d / numDots;
      const dx = x1 + t * (x2 - x1);
      const dy = y1 + t * (y2 - y1);
      ellipse(dx, dy, 2 * scaleFactor, 2 * scaleFactor);
    }
  }
}

function drawMobileFragmentNotation(voice, section) {
  // Small musical notation fragments floating free
  const numFragments = Math.max(1, Math.floor(rnd(2, 5) * features.densityValue));

  for (let i = 0; i < numFragments; i++) {
    const fx = rnd(section.xStart + 20, section.xEnd - 40);
    const fy = rnd(voice.yStart + 15, voice.yEnd - 15);

    stroke(features.palette.ink);
    strokeWeight(0.5 * scaleFactor);

    // Small staff fragment (2-3 lines)
    const staffLen = rnd(20, 50) * scaleFactor;
    const staffLines = rndInt(2, 4);
    const staffSpacing = 4 * scaleFactor;

    for (let s = 0; s < staffLines; s++) {
      const sy = fy + s * staffSpacing;
      line(fx, sy, fx + staffLen, sy);
    }

    // Add a few noteheads
    fill(features.palette.ink);
    noStroke();
    const numNotes = rndInt(1, 4);
    for (let n = 0; n < numNotes; n++) {
      const nx = fx + rnd(5, staffLen - 5);
      const ny = fy + rndInt(0, staffLines - 1) * staffSpacing;
      ellipse(nx, ny, 4 * scaleFactor, 3 * scaleFactor);
    }
  }
}

function drawMobileBranches(voice, section) {
  // Branching mobile arm structures
  const numBranches = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let i = 0; i < numBranches; i++) {
    const startX = rnd(section.xStart + 30, section.xEnd - 30);
    const startY = rnd(voice.yStart + 20, voice.yEnd - 20);

    strokeWeight(1.5 * scaleFactor);

    // Main arm
    const armLen = rnd(40, 80) * scaleFactor;
    const armAngle = rnd(-PI / 4, PI / 4);
    const endX = startX + cos(armAngle) * armLen;
    const endY = startY + sin(armAngle) * armLen;
    line(startX, startY, endX, endY);

    // Sub-branches
    const numSubs = rndInt(2, 4);
    strokeWeight(0.8 * scaleFactor);

    for (let s = 0; s < numSubs; s++) {
      const branchT = rnd(0.3, 0.9);
      const bx = startX + branchT * (endX - startX);
      const by = startY + branchT * (endY - startY);
      const subAngle = armAngle + rnd(-PI / 3, PI / 3);
      const subLen = rnd(15, 35) * scaleFactor;
      line(bx, by, bx + cos(subAngle) * subLen, by + sin(subAngle) * subLen);

      // Terminal node
      fill(features.palette.ink);
      ellipse(bx + cos(subAngle) * subLen, by + sin(subAngle) * subLen, 5 * scaleFactor, 5 * scaleFactor);
      noFill();
    }

    // Pivot point
    fill(features.palette.ink);
    ellipse(startX, startY, 6 * scaleFactor, 6 * scaleFactor);
    noFill();
  }
}

function drawMobileSuspendedShapes(voice, section) {
  // Shapes appearing to hang from lines (mobile aesthetic)
  const numShapes = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  for (let i = 0; i < numShapes; i++) {
    const hx = rnd(section.xStart + 30, section.xEnd - 30);
    const topY = rnd(voice.yStart, voice.yStart + voice.height * 0.3);
    const hangLen = rnd(20, 50) * scaleFactor;
    const shapeY = topY + hangLen;

    // Hanging line
    stroke(features.palette.ink + "80");
    strokeWeight(0.5 * scaleFactor);
    line(hx, topY, hx, shapeY);

    // Suspended shape
    stroke(features.palette.ink);
    strokeWeight(1 * scaleFactor);
    noFill();

    const shapeType = rndInt(0, 4);
    const shapeSize = rnd(15, 30) * scaleFactor;

    if (shapeType === 0) {
      ellipse(hx, shapeY + shapeSize / 2, shapeSize, shapeSize);
    } else if (shapeType === 1) {
      rect(hx - shapeSize / 2, shapeY, shapeSize, shapeSize * 0.7);
    } else if (shapeType === 2) {
      // Triangle pointing down
      triangle(hx, shapeY + shapeSize, hx - shapeSize / 2, shapeY, hx + shapeSize / 2, shapeY);
    } else {
      // Diamond
      beginShape();
      vertex(hx, shapeY);
      vertex(hx + shapeSize / 2, shapeY + shapeSize / 2);
      vertex(hx, shapeY + shapeSize);
      vertex(hx - shapeSize / 2, shapeY + shapeSize / 2);
      endShape(CLOSE);
    }
  }
}

function drawMobileConnectionNodes(voice, section) {
  // Nodes where multiple paths converge/diverge
  const numNodes = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  for (let i = 0; i < numNodes; i++) {
    const nx = rnd(section.xStart + 40, section.xEnd - 40);
    const ny = rnd(voice.yStart + 25, voice.yEnd - 25);
    const nodeSize = rnd(8, 15) * scaleFactor;

    // Node circle
    stroke(features.palette.ink);
    strokeWeight(1.5 * scaleFactor);
    noFill();
    ellipse(nx, ny, nodeSize * 2, nodeSize * 2);

    // Radiating dotted lines
    const numRays = rndInt(3, 6);
    strokeWeight(0.8 * scaleFactor);

    for (let r = 0; r < numRays; r++) {
      const angle = (r / numRays) * TWO_PI + rnd(-0.2, 0.2);
      const rayLen = rnd(25, 50) * scaleFactor;
      const endX = nx + cos(angle) * rayLen;
      const endY = ny + sin(angle) * rayLen;

      // Dotted ray
      const steps = Math.floor(rayLen / (5 * scaleFactor));
      for (let s = 0; s < steps; s++) {
        const t = (s + 1) / steps;
        const px = nx + cos(angle) * (nodeSize + t * (rayLen - nodeSize));
        const py = ny + sin(angle) * (nodeSize + t * (rayLen - nodeSize));
        point(px, py);
      }
    }
  }
}

function drawMobileDirectionalArrows(voice, section) {
  // Arrows indicating possible reading directions
  const numArrows = Math.max(2, Math.floor(rnd(3, 7) * features.densityValue));

  stroke(features.palette.ink);
  fill(features.palette.ink);

  for (let i = 0; i < numArrows; i++) {
    const ax = rnd(section.xStart + 30, section.xEnd - 30);
    const ay = rnd(voice.yStart + 15, voice.yEnd - 15);
    const arrowLen = rnd(20, 40) * scaleFactor;
    const angle = rnd(0, TWO_PI);

    const endX = ax + cos(angle) * arrowLen;
    const endY = ay + sin(angle) * arrowLen;

    // Arrow shaft
    strokeWeight(1 * scaleFactor);
    line(ax, ay, endX, endY);

    // Arrowhead
    const headSize = 5 * scaleFactor;
    const headAngle1 = angle + PI - PI / 6;
    const headAngle2 = angle + PI + PI / 6;
    noStroke();
    triangle(
      endX, endY,
      endX + cos(headAngle1) * headSize, endY + sin(headAngle1) * headSize,
      endX + cos(headAngle2) * headSize, endY + sin(headAngle2) * headSize
    );
  }
}

function drawMobileCellClusters(voice, section) {
  // Groups of cells clustered together
  const numClusters = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  for (let c = 0; c < numClusters; c++) {
    const clusterX = rnd(section.xStart + 50, section.xEnd - 50);
    const clusterY = rnd(voice.yStart + 30, voice.yEnd - 30);
    const numInCluster = rndInt(3, 6);

    for (let i = 0; i < numInCluster; i++) {
      const offsetX = rndGaussian(0, 25) * scaleFactor;
      const offsetY = rndGaussian(0, 15) * scaleFactor;
      const cellW = rnd(20, 40) * scaleFactor;
      const cellH = rnd(10, 20) * scaleFactor;

      stroke(features.palette.ink);
      strokeWeight(0.8 * scaleFactor);
      noFill();
      rect(clusterX + offsetX - cellW / 2, clusterY + offsetY - cellH / 2, cellW, cellH, 2 * scaleFactor);

      // Small marks inside
      fill(features.palette.ink);
      noStroke();
      const numDots = rndInt(1, 3);
      for (let d = 0; d < numDots; d++) {
        const dx = clusterX + offsetX + rnd(-cellW / 3, cellW / 3);
        const dy = clusterY + offsetY + rnd(-cellH / 4, cellH / 4);
        ellipse(dx, dy, 2 * scaleFactor, 2 * scaleFactor);
      }
    }
  }
}

function drawMobileNavigablePaths(voice, section) {
  // Curved paths showing possible navigation routes
  const numPaths = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink + "60");
  strokeWeight(1.5 * scaleFactor);
  noFill();

  for (let p = 0; p < numPaths; p++) {
    const startX = rnd(section.xStart + 20, section.xStart + section.width * 0.3);
    const startY = rnd(voice.yStart + 15, voice.yEnd - 15);
    const endX = rnd(section.xEnd - section.width * 0.3, section.xEnd - 20);
    const endY = rnd(voice.yStart + 15, voice.yEnd - 15);

    // Control points for bezier
    const cp1x = startX + section.width * 0.3;
    const cp1y = startY + rnd(-40, 40) * scaleFactor;
    const cp2x = endX - section.width * 0.3;
    const cp2y = endY + rnd(-40, 40) * scaleFactor;

    bezier(startX, startY, cp1x, cp1y, cp2x, cp2y, endX, endY);

    // Path markers (small circles along path)
    fill(features.palette.ink + "40");
    noStroke();
    for (let t = 0.2; t <= 0.8; t += 0.2) {
      const px = bezierPoint(startX, cp1x, cp2x, endX, t);
      const py = bezierPoint(startY, cp1y, cp2y, endY, t);
      ellipse(px, py, 4 * scaleFactor, 4 * scaleFactor);
    }
  }
}

function drawMobilePivotPoints(voice, section) {
  // Central pivot points with radiating elements
  const numPivots = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  for (let i = 0; i < numPivots; i++) {
    const px = rnd(section.xStart + 40, section.xEnd - 40);
    const py = rnd(voice.yStart + 25, voice.yEnd - 25);
    const pivotSize = rnd(6, 12) * scaleFactor;

    // Central pivot
    stroke(features.palette.ink);
    strokeWeight(2 * scaleFactor);
    fill(features.palette.paper);
    ellipse(px, py, pivotSize * 2, pivotSize * 2);

    // Balanced arms
    strokeWeight(1 * scaleFactor);
    const numArms = rndInt(2, 4);

    for (let a = 0; a < numArms; a++) {
      const angle = (a / numArms) * TWO_PI + rnd(-0.3, 0.3);
      const armLen = rnd(30, 60) * scaleFactor;
      const endX = px + cos(angle) * armLen;
      const endY = py + sin(angle) * armLen;

      line(px, py, endX, endY);

      // Weight at end
      noFill();
      const weightSize = rnd(10, 20) * scaleFactor;
      if (rndBool(0.5)) {
        ellipse(endX, endY, weightSize, weightSize);
      } else {
        rect(endX - weightSize / 2, endY - weightSize / 2, weightSize, weightSize * 0.6);
      }
    }
  }
}

function drawMobileBalancedArms(voice, section) {
  // Horizontal balanced arm structures
  const numArms = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  stroke(features.palette.ink);
  noFill();

  for (let i = 0; i < numArms; i++) {
    const cx = rnd(section.xStart + 60, section.xEnd - 60);
    const cy = rnd(voice.yStart + 20, voice.yEnd - 20);

    // Horizontal bar
    strokeWeight(2 * scaleFactor);
    const barLen = rnd(60, 120) * scaleFactor;
    line(cx - barLen / 2, cy, cx + barLen / 2, cy);

    // Fulcrum
    fill(features.palette.ink);
    triangle(cx, cy, cx - 4 * scaleFactor, cy + 8 * scaleFactor, cx + 4 * scaleFactor, cy + 8 * scaleFactor);
    noFill();

    // Hanging elements on each side
    strokeWeight(0.8 * scaleFactor);
    const leftX = cx - barLen / 2 + rnd(10, 30) * scaleFactor;
    const rightX = cx + barLen / 2 - rnd(10, 30) * scaleFactor;
    const leftHang = rnd(15, 35) * scaleFactor;
    const rightHang = rnd(15, 35) * scaleFactor;

    // Left element
    line(leftX, cy, leftX, cy + leftHang);
    ellipse(leftX, cy + leftHang + 8 * scaleFactor, 16 * scaleFactor, 16 * scaleFactor);

    // Right element
    line(rightX, cy, rightX, cy + rightHang);
    rect(rightX - 10 * scaleFactor, cy + rightHang, 20 * scaleFactor, 12 * scaleFactor);
  }
}

function drawMobileHangingElements(voice, section) {
  // Various shapes hanging from lines
  const numElements = Math.max(3, Math.floor(rnd(4, 8) * features.densityValue));

  for (let i = 0; i < numElements; i++) {
    const x = rnd(section.xStart + 20, section.xEnd - 20);
    const topY = rnd(voice.yStart, voice.yStart + voice.height * 0.2);
    const stringLen = rnd(15, 45) * scaleFactor;

    // String
    stroke(features.palette.ink + "70");
    strokeWeight(0.5 * scaleFactor);
    line(x, topY, x, topY + stringLen);

    // Hanging shape
    stroke(features.palette.ink);
    strokeWeight(1 * scaleFactor);
    noFill();

    const shapeY = topY + stringLen;
    const shapeSize = rnd(8, 18) * scaleFactor;
    const shapeType = rndInt(0, 5);

    switch (shapeType) {
      case 0: ellipse(x, shapeY + shapeSize / 2, shapeSize, shapeSize); break;
      case 1: rect(x - shapeSize / 2, shapeY, shapeSize, shapeSize); break;
      case 2: triangle(x, shapeY + shapeSize, x - shapeSize / 2, shapeY, x + shapeSize / 2, shapeY); break;
      case 3:
        // Line
        line(x - shapeSize / 2, shapeY + shapeSize / 2, x + shapeSize / 2, shapeY + shapeSize / 2);
        break;
      case 4:
        // Small cluster of dots
        fill(features.palette.ink);
        for (let d = 0; d < 3; d++) {
          ellipse(x + rnd(-5, 5) * scaleFactor, shapeY + rnd(2, 10) * scaleFactor, 3 * scaleFactor, 3 * scaleFactor);
        }
        noFill();
        break;
    }
  }
}

function drawMobileOptionalRoutes(voice, section) {
  // Dashed lines indicating optional paths
  const numRoutes = Math.max(2, Math.floor(rnd(3, 6) * features.densityValue));

  stroke(features.palette.ink + "50");
  strokeWeight(1 * scaleFactor);

  for (let i = 0; i < numRoutes; i++) {
    const x1 = rnd(section.xStart + 20, section.xEnd - 20);
    const y1 = rnd(voice.yStart + 10, voice.yEnd - 10);
    const x2 = rnd(section.xStart + 20, section.xEnd - 20);
    const y2 = rnd(voice.yStart + 10, voice.yEnd - 10);

    // Dashed line
    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const dashLen = 6 * scaleFactor;
    const numDashes = Math.floor(dist / (dashLen * 2));

    for (let d = 0; d < numDashes; d++) {
      const t1 = (d * 2) / (numDashes * 2);
      const t2 = (d * 2 + 1) / (numDashes * 2);
      const dx1 = x1 + t1 * (x2 - x1);
      const dy1 = y1 + t1 * (y2 - y1);
      const dx2 = x1 + t2 * (x2 - x1);
      const dy2 = y1 + t2 * (y2 - y1);
      line(dx1, dy1, dx2, dy2);
    }

    // "?" at one end
    noStroke();
    fill(features.palette.ink + "60");
    textSize(8 * scaleFactor);
    text("?", x2, y2);
  }
}

function drawMobileConvergencePoints(voice, section) {
  // Points where multiple paths meet
  const numPoints = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  for (let i = 0; i < numPoints; i++) {
    const px = rnd(section.xStart + 50, section.xEnd - 50);
    const py = rnd(voice.yStart + 30, voice.yEnd - 30);

    // Converging lines
    stroke(features.palette.ink + "70");
    strokeWeight(0.8 * scaleFactor);

    const numLines = rndInt(3, 6);
    for (let l = 0; l < numLines; l++) {
      const angle = (l / numLines) * TWO_PI;
      const startDist = rnd(30, 60) * scaleFactor;
      const sx = px + cos(angle) * startDist;
      const sy = py + sin(angle) * startDist;
      line(sx, sy, px, py);
    }

    // Central mark
    stroke(features.palette.ink);
    strokeWeight(2 * scaleFactor);
    fill(features.palette.ink);
    ellipse(px, py, 8 * scaleFactor, 8 * scaleFactor);
  }
}

function drawMobileDivergencePoints(voice, section) {
  // Points where path splits into multiple options
  const numPoints = Math.max(1, Math.floor(rnd(2, 4) * features.densityValue));

  for (let i = 0; i < numPoints; i++) {
    const px = rnd(section.xStart + 50, section.xEnd - 50);
    const py = rnd(voice.yStart + 30, voice.yEnd - 30);

    // Incoming line
    stroke(features.palette.ink);
    strokeWeight(1.5 * scaleFactor);
    const inAngle = rnd(PI * 0.6, PI * 1.4);
    const inLen = rnd(25, 40) * scaleFactor;
    line(px + cos(inAngle) * inLen, py + sin(inAngle) * inLen, px, py);

    // Diverging options
    strokeWeight(1 * scaleFactor);
    const numOptions = rndInt(2, 4);
    const spreadAngle = PI * 0.6;
    const baseAngle = inAngle + PI;

    for (let o = 0; o < numOptions; o++) {
      const optAngle = baseAngle - spreadAngle / 2 + (o / (numOptions - 1 || 1)) * spreadAngle;
      const optLen = rnd(20, 45) * scaleFactor;
      line(px, py, px + cos(optAngle) * optLen, py + sin(optAngle) * optLen);

      // Small marker at end
      noFill();
      ellipse(px + cos(optAngle) * optLen, py + sin(optAngle) * optLen, 6 * scaleFactor, 6 * scaleFactor);
    }

    // Central point
    fill(features.palette.ink);
    noStroke();
    ellipse(px, py, 6 * scaleFactor, 6 * scaleFactor);
  }
}

function drawMobileRotatingGroups(voice, section) {
  // Groups of elements that could rotate around a central axis
  const numGroups = Math.max(1, Math.floor(rnd(1, 3) * features.densityValue));

  for (let g = 0; g < numGroups; g++) {
    const cx = rnd(section.xStart + 50, section.xEnd - 50);
    const cy = rnd(voice.yStart + 35, voice.yEnd - 35);
    const radius = rnd(25, 50) * scaleFactor;
    const numElements = rndInt(3, 6);

    // Central axis indication
    stroke(features.palette.ink + "40");
    strokeWeight(0.5 * scaleFactor);
    noFill();
    ellipse(cx, cy, radius * 2, radius * 2);

    // Rotation arrow
    stroke(features.palette.ink + "60");
    arc(cx, cy, radius * 2.2, radius * 2.2, 0, PI / 2);

    // Elements around the circle
    for (let e = 0; e < numElements; e++) {
      const angle = (e / numElements) * TWO_PI;
      const ex = cx + cos(angle) * radius;
      const ey = cy + sin(angle) * radius;

      stroke(features.palette.ink);
      strokeWeight(1 * scaleFactor);
      noFill();

      const elemSize = rnd(12, 22) * scaleFactor;
      if (rndBool(0.5)) {
        rect(ex - elemSize / 2, ey - elemSize / 3, elemSize, elemSize * 0.6, 2 * scaleFactor);
      } else {
        ellipse(ex, ey, elemSize, elemSize * 0.7);
      }
    }
  }
}

// ============================================================
// MODE DISPATCHER
// ============================================================

function drawModeElements(mode, voice, section) {
  switch (mode) {
    case "artikulation":
      // Enhanced Artikulation mode v3.4.0 - Ligeti/Wehinger visual listening score
      // Primary structural element (choose one)
      const artikPrimary = rndInt(0, 5);
      switch (artikPrimary) {
        case 0: drawArtikulationColorBlocks(voice, section); break;
        case 1: drawArtikulationClusters(voice, section); break;
        case 2: drawArtikulationDensityClouds(voice, section); break;
        case 3: drawArtikulationOverlaps(voice, section); break;
        case 4: drawArtikulationMorphing(voice, section); break;
      }
      // Secondary elements (probabilistic layering)
      if (rndBool(0.5)) drawArtikulationCallResponse(voice, section);
      if (rndBool(0.45)) drawArtikulationTimbralStripes(voice, section);
      if (rndBool(0.4)) drawArtikulationGlitchPatterns(voice, section);
      if (rndBool(0.35)) drawArtikulationSpeechFragments(voice, section);
      if (rndBool(0.4)) drawArtikulationAttackDecay(voice, section);
      if (rndBool(0.35)) drawArtikulationConnectors(voice, section);
      if (rndBool(0.3)) drawArtikulationWedges(voice, section);
      if (rndBool(0.35)) drawArtikulationInterrupted(voice, section);
      if (rndBool(0.3)) drawArtikulationTextureGradient(voice, section);
      if (rndBool(0.35)) drawArtikulationPulsation(voice, section);
      if (rndBool(0.3)) drawArtikulationStaticBursts(voice, section);
      if (rndBool(0.2)) drawArtikulationTimbreLegend(voice, section);
      if (rndBool(0.25)) drawArtikulationVerticalSync(voice, section);
      if (rndBool(0.35)) drawArtikulationElectronicMotifs(voice, section);
      if (rndBool(0.25)) drawArtikulationSpatialPanning(voice, section);
      break;

    case "upic":
      // Enhanced UPIC mode v3.5.0 - Xenakis stochastic/architectural notation
      // Primary structural element (choose one)
      const upicPrimary = rndInt(0, 6);
      switch (upicPrimary) {
        case 0: drawUpicArcs(voice, section); break;
        case 1: drawUpicDensityMass(voice, section); break;
        case 2: drawUpicGlissandiBands(voice, section); break;
        case 3: drawUpicPolytopes(voice, section); break;
        case 4: drawUpicGranularCloud(voice, section); break;
        case 5: drawUpicMathCurves(voice, section); break;
      }
      // Secondary elements (probabilistic layering)
      if (rndBool(0.4)) drawUpicRuledLines(voice, section);
      if (rndBool(0.25)) drawUpicGraphPaper(voice, section);
      if (rndBool(0.4)) drawUpicPressureStrokes(voice, section);
      if (rndBool(0.35)) drawUpicStochasticPoints(voice, section);
      if (rndBool(0.3)) drawUpicArborescences(voice, section);
      if (rndBool(0.35)) drawUpicProbabilityBands(voice, section);
      if (rndBool(0.3)) drawUpicAngularTransforms(voice, section);
      if (rndBool(0.25)) drawUpicWavePages(voice, section);
      if (rndBool(0.25)) drawUpicRotations(voice, section);
      if (rndBool(0.35)) drawUpicParallelStreams(voice, section);
      if (rndBool(0.3)) drawUpicSifted(voice, section);
      if (rndBool(0.2)) drawUpicArchitectural(voice, section);
      if (rndBool(0.25)) drawUpicLogisticMap(voice, section);
      if (rndBool(0.2)) drawUpicHarmonicSeries(voice, section);
      break;

    case "cluster":
      // Enhanced Cluster mode v3.6.0 - Penderecki extended techniques
      // Primary structural element (choose one)
      const clusterPrimary = rndInt(0, 6);
      switch (clusterPrimary) {
        case 0: drawClusterWedges(voice, section); break;
        case 1: drawClusterBands(voice, section); break;
        case 2: drawClusterGlissandi(voice, section); break;
        case 3: drawClusterMicropolyphony(voice, section); break;
        case 4: drawClusterBlackNotation(voice, section); break;
        case 5: drawClusterSustainedTones(voice, section); break;
      }
      // Secondary elements (probabilistic layering)
      if (rndBool(0.4)) drawExtendedSymbols(voice, section);
      if (rndBool(0.35)) drawClusterStringEffects(voice, section);
      if (rndBool(0.35)) drawClusterQuarterTones(voice, section);
      if (rndBool(0.25)) drawClusterAleatoryBox(voice, section);
      if (rndBool(0.35)) drawClusterVibratoWiggle(voice, section);
      if (rndBool(0.35)) drawClusterPercussive(voice, section);
      if (rndBool(0.3)) drawClusterDynamicHairpin(voice, section);
      if (rndBool(0.3)) drawClusterTremoloSlashes(voice, section);
      if (rndBool(0.25)) drawClusterHarmonicDiamond(voice, section);
      if (rndBool(0.2)) drawClusterSulTasto(voice, section);
      if (rndBool(0.25)) drawClusterColLegnoBatt(voice, section);
      if (rndBool(0.2)) drawClusterFlautando(voice, section);
      if (rndBool(0.3)) drawClusterSpiccato(voice, section);
      if (rndBool(0.25)) drawClusterBariolage(voice, section);
      if (rndBool(0.2)) drawClusterRicochet(voice, section);
      break;

    case "graph":
      // Enhanced Graph mode v3.2.0 - Feldman's Projections/Intersections
      // Primary structural element (choose one)
      const graphPrimary = rndInt(0, 4);
      switch (graphPrimary) {
        case 0: drawGraphBoxes(voice, section); break;
        case 1: drawProportionalGrid(voice, section); break;
        case 2: drawDurationStacks(voice, section); break;
        case 3: drawConnectingLines(voice, section); break;
        case 4: drawEmptyBoxes(voice, section); break;
      }

      // Note types (probabilistic, soft Feldman aesthetic)
      if (rndBool(0.5)) drawSparsePoints(voice, section);
      if (rndBool(0.35)) drawDiamondNotes(voice, section);
      if (rndBool(0.3)) drawSoftAttackMarks(voice, section);
      if (rndBool(0.25)) drawHarmonicHalos(voice, section);

      // Duration/timing elements
      if (rndBool(0.35)) drawTimeBrackets(voice, section);
      if (rndBool(0.3)) drawSustainLines(voice, section);
      if (rndBool(0.25)) drawDecayTrails(voice, section);

      // Dynamics and articulation
      if (rndBool(0.3)) drawDynamicGradients(voice, section);
      if (rndBool(0.25)) drawIctusMarks(voice, section);
      if (rndBool(0.2)) drawTremoloMarks(voice, section);
      if (rndBool(0.2)) drawClusterBrackets(voice, section);

      // Structural/contextual elements
      if (rndBool(0.3)) drawRegisterBands(voice, section);
      if (rndBool(0.25)) drawBreathMarks(voice, section);
      if (rndBool(0.15)) drawInstrumentLabels(voice, section);
      if (rndBool(0.15)) drawPedalMarkings(voice, section);
      break;

    case "chance":
      // Enhanced Chance mode v3.3.0 - John Cage's graphic scores
      // Primary structural element (choose one)
      const chancePrimary = rndInt(0, 6);
      switch (chancePrimary) {
        case 0: drawChanceCurves(voice, section); break;
        case 1: drawFontanaMixGrid(voice, section); break;
        case 2: drawStarChartTracings(voice, section); break;
        case 3: drawCircusOverlays(voice, section); break;
        case 4: drawTransparentOverlays(voice, section); break;
        case 5: drawNotationTypes(voice, section); break;
        case 6: drawRadioStaticDots(voice, section); break;
      }

      // Dot/point elements (Cage loved scattered points)
      if (rndBool(0.5)) drawChanceDots(voice, section);
      if (rndBool(0.3)) drawChanceIntersections(voice, section);

      // Cage's systems and operations
      if (rndBool(0.3)) drawIChingHexagrams(voice, section);
      if (rndBool(0.25)) drawChanceOperationMarks(voice, section);
      if (rndBool(0.25)) drawCageTimeBrackets(voice, section);
      if (rndBool(0.2)) drawNumberPieceBrackets(voice, section);

      // Silence and indeterminacy
      if (rndBool(0.25)) drawSilenceBoxes(voice, section);
      if (rndBool(0.25)) drawIndeterminacySymbols(voice, section);
      if (rndBool(0.2)) drawEventNotation(voice, section);

      // Specific Cage works
      if (rndBool(0.2)) drawRyoanjiTracings(voice, section);
      if (rndBool(0.2)) drawPreparedPianoSymbols(voice, section);
      if (rndBool(0.15)) drawWaterWalkSymbols(voice, section);

      // Cage's interests and influences
      if (rndBool(0.2)) drawMycologicalForms(voice, section);
      if (rndBool(0.2)) drawZenCircles(voice, section);
      if (rndBool(0.15)) drawMesosticText(voice, section);
      if (rndBool(0.15)) drawAnarchySymbols(voice, section);
      break;

    case "spectral":
      // Enhanced Spectral mode v3.7.0 - Murail/Grisey spectral analysis
      // Primary structural element (choose one)
      const spectralPrimary = rndInt(0, 8);
      switch (spectralPrimary) {
        case 0: drawSpectralBands(voice, section); break;
        case 1: drawSpectralWaterfall(voice, section); break;
        case 2: drawFormantContours(voice, section); break;
        case 3: drawSpectralPartials(voice, section); break;
        case 4: drawSpectralSonogram(voice, section); break;
        case 5: drawSpectralGesture(voice, section); break;
        case 6: drawSpectralFundamental(voice, section); break;
        case 7: drawSpectralAdditive(voice, section); break;
      }
      // Secondary elements (probabilistic layering)
      if (rndBool(0.45)) drawHarmonicStacks(voice, section);
      if (rndBool(0.35)) drawAttackTransients(voice, section);
      if (rndBool(0.3)) drawResonanceBells(voice, section);
      if (rndBool(0.3)) drawSpectralInharmonicity(voice, section);
      if (rndBool(0.25)) drawSpectralBeating(voice, section);
      if (rndBool(0.25)) drawSpectralInterpolation(voice, section);
      if (rndBool(0.2)) drawSpectralDifferenceTones(voice, section);
      if (rndBool(0.2)) drawSpectralRingMod(voice, section);
      if (rndBool(0.25)) drawSpectralCompression(voice, section);
      if (rndBool(0.25)) drawSpectralFiltering(voice, section);
      if (rndBool(0.3)) drawSpectralEnvelopeTime(voice, section);
      if (rndBool(0.25)) drawSpectralMorphing(voice, section);
      if (rndBool(0.3)) drawSpectralGliss(voice, section);
      if (rndBool(0.25)) drawSpectralDecay(voice, section);
      break;

    case "spiral":
      // Enhanced spiral mode v3.1.0 - Crumb-inspired circular notation
      // Primary element: choose one main spiral/circular structure
      const spiralPrimary = rndInt(0, 5);
      switch (spiralPrimary) {
        case 0: drawSpiralPaths(voice, section); break;
        case 1: drawSpiralVariants(voice, section); break;
        case 2: drawCircularNotation(voice, section); break;
        case 3: drawMandalaPattern(voice, section); break;
        case 4: drawCrumbEye(voice, section); break;
        case 5: drawFibonacciSpiral(voice, section); break;
      }

      // Secondary elements (probabilistic layering)
      if (rndBool(0.35)) drawSegmentedSpiral(voice, section);
      if (rndBool(0.3)) drawSpiralNoteheads(voice, section);
      if (rndBool(0.25)) drawSpiralText(voice, section);
      if (rndBool(0.25)) drawSpiralWedges(voice, section);
      if (rndBool(0.3)) drawSpiralBeaming(voice, section);

      // Decorative symbols (choose one type)
      if (rndBool(0.5)) {
        rndBool(0.6) ? drawMysticalSymbols(voice, section) : drawRitualSymbols(voice, section);
      }
      break;

    // New modes (v3.0.0)
    case "treatise":
      // Enhanced Treatise mode v3.8.0 - Cardew's 193-page graphic score
      // Primary structural element (choose one)
      const treatisePrimary = rndInt(0, 6);
      switch (treatisePrimary) {
        case 0: drawTreatiseGeometric(voice, section); break;
        case 1: drawTreatiseThickLines(voice, section); break;
        case 2: drawTreatiseLifeline(voice, section); break;
        case 3: drawTreatiseTree(voice, section); break;
        case 4: drawTreatiseMass(voice, section); break;
        case 5: drawTreatiseBlocks(voice, section); break;
      }
      // Secondary elements (probabilistic layering)
      if (rndBool(0.4)) drawTreatiseNumbers(voice, section);
      if (rndBool(0.35)) drawTreatiseClouds(voice, section);
      if (rndBool(0.3)) drawTreatiseParallelLines(voice, section);
      if (rndBool(0.3)) drawTreatiseCurvedPath(voice, section);
      if (rndBool(0.35)) drawTreatiseSolids(voice, section);
      if (rndBool(0.25)) drawTreatiseNests(voice, section);
      if (rndBool(0.3)) drawTreatiseZigzag(voice, section);
      if (rndBool(0.25)) drawTreatiseWedge(voice, section);
      if (rndBool(0.35)) drawTreatiseScatteredDots(voice, section);
      if (rndBool(0.25)) drawTreatiseGrid(voice, section);
      if (rndBool(0.3)) drawTreatiseAngle(voice, section);
      if (rndBool(0.35)) drawTreatiseSymbols(voice, section);
      if (rndBool(0.3)) drawTreatiseConnectors(voice, section);
      if (rndBool(0.25)) drawTreatiseBrackets(voice, section);
      if (rndBool(0.3)) drawTreatiseSmallSpiral(voice, section);
      break;

    case "openform":
      // Enhanced OpenForm mode v3.9.0 - Earle Brown's mobile notation
      // Primary structural element (choose one)
      const openformPrimary = rndInt(0, 7);
      switch (openformPrimary) {
        case 0: drawOpenFormRects(voice, section); break;
        case 1: drawOpenFormMobile(voice, section); break;
        case 2: drawOpenFormBalance(voice, section); break;
        case 3: drawOpenFormClusters(voice, section); break;
        case 4: drawOpenFormEvent(voice, section); break;
        case 5: drawOpenFormDense(voice, section); break;
        case 6: drawOpenFormSparse(voice, section); break;
      }
      // Secondary elements (probabilistic layering)
      if (rndBool(0.4)) drawOpenFormSpatial(voice, section);
      if (rndBool(0.35)) drawOpenFormProportional(voice, section);
      if (rndBool(0.3)) drawOpenFormTrajectory(voice, section);
      if (rndBool(0.3)) drawOpenFormVerticalStacks(voice, section);
      if (rndBool(0.35)) drawOpenFormHorizontalStream(voice, section);
      if (rndBool(0.3)) drawOpenFormGradient(voice, section);
      if (rndBool(0.25)) drawOpenFormOverlap(voice, section);
      if (rndBool(0.25)) drawOpenFormAsymmetric(voice, section);
      if (rndBool(0.25)) drawOpenFormContrapuntal(voice, section);
      if (rndBool(0.25)) drawOpenFormLooseGrid(voice, section);
      if (rndBool(0.25)) drawOpenFormDiagonal(voice, section);
      break;

    case "bussotti":
      // Enhanced Bussotti mode v3.10.0 - Sylvano Bussotti's theatrical notation
      // Primary structural element (choose one)
      const bussottiPrimary = rndInt(0, 6);
      switch (bussottiPrimary) {
        case 0: drawBussottiCalligraphic(voice, section); break;
        case 1: drawBussottiGestural(voice, section); break;
        case 2: drawBussottiCurvedStaff(voice, section); break;
        case 3: drawBussottiSwirls(voice, section); break;
        case 4: drawBussottiConnected(voice, section); break;
        case 5: drawBussottiLoops(voice, section); break;
        case 6: drawBussottiTheatrical(voice, section); break;
      }
      // Secondary elements (probabilistic layering)
      if (rndBool(0.45)) drawBussottiFlourishes(voice, section);
      if (rndBool(0.40)) drawBussottiDecorative(voice, section);
      if (rndBool(0.35)) drawBussottiDrips(voice, section);
      if (rndBool(0.35)) drawBussottiAccents(voice, section);
      if (rndBool(0.30)) drawBussottiSplatters(voice, section);
      if (rndBool(0.30)) drawBussottiClusters(voice, section);
      if (rndBool(0.28)) drawBussottiVines(voice, section);
      if (rndBool(0.25)) drawBussottiWaves(voice, section);
      if (rndBool(0.25)) drawBussottiStars(voice, section);
      if (rndBool(0.22)) drawBussottiDecorativeDots(voice, section);
      if (rndBool(0.20)) drawBussottiTextFragments(voice, section);
      if (rndBool(0.18)) drawBussottiCrescendo(voice, section);
      break;

    case "textscore":
      // Enhanced TextScore mode v3.11.0 - Stockhausen/Eno text notation
      // Primary structural element (choose one)
      const textscorePrimary = rndInt(0, 6);
      switch (textscorePrimary) {
        case 0: drawTextInstructions(voice, section); break;
        case 1: drawTextScorePoetic(voice, section); break;
        case 2: drawTextScoreStockhausen(voice, section); break;
        case 3: drawTextScoreOblique(voice, section); break;
        case 4: drawTextScoreConceptual(voice, section); break;
        case 5: drawTextScoreMinimal(voice, section); break;
        case 6: drawTextScoreNumbered(voice, section); break;
      }
      // Secondary elements (probabilistic layering)
      if (rndBool(0.45)) drawTextCryptic(voice, section);
      if (rndBool(0.40)) drawTextScoreParenthetical(voice, section);
      if (rndBool(0.35)) drawTextScoreTime(voice, section);
      if (rndBool(0.35)) drawTextScoreQuotes(voice, section);
      if (rndBool(0.30)) drawTextScoreVerbs(voice, section);
      if (rndBool(0.28)) drawTextScoreWhisper(voice, section);
      if (rndBool(0.25)) drawTextScoreDuration(voice, section);
      if (rndBool(0.25)) drawTextScoreProsody(voice, section);
      if (rndBool(0.22)) drawTextScoreLayout(voice, section);
      if (rndBool(0.20)) drawTextScoreQuestions(voice, section);
      if (rndBool(0.18)) drawTextScoreNegation(voice, section);
      break;

    case "stripsody":
      // Enhanced Stripsody mode v3.12.0 - Cathy Berberian's comic vocal score
      // Primary structural element (choose one)
      const stripsodyPrimary = rndInt(0, 6);
      switch (stripsodyPrimary) {
        case 0: drawStripsodyOnomatopoeia(voice, section); break;
        case 1: drawStripsodyBubbles(voice, section); break;
        case 2: drawStripsodyExplosions(voice, section); break;
        case 3: drawStripsodyFaces(voice, section); break;
        case 4: drawStripsodyImpact(voice, section); break;
        case 5: drawStripsodyLightning(voice, section); break;
        case 6: drawStripsodyStars(voice, section); break;
      }
      // Secondary elements (probabilistic layering)
      if (rndBool(0.45)) drawStripsodyActionLines(voice, section);
      if (rndBool(0.40)) drawStripsodyExclamations(voice, section);
      if (rndBool(0.35)) drawStripsodySpeedLines(voice, section);
      if (rndBool(0.35)) drawStripsodySpirals(voice, section);
      if (rndBool(0.30)) drawStripsodySwoosh(voice, section);
      if (rndBool(0.28)) drawStripsodyMusicNotes(voice, section);
      if (rndBool(0.25)) drawStripsodyQuestionMarks(voice, section);
      if (rndBool(0.25)) drawStripsodyHearts(voice, section);
      if (rndBool(0.22)) drawStripsodyDroplets(voice, section);
      if (rndBool(0.20)) drawStripsodyPuffs(voice, section);
      if (rndBool(0.18)) drawStripsodyWobble(voice, section);
      break;

    case "ankhrasmation":
      // Enhanced Ankhrasmation mode v3.13.0 - Wadada Leo Smith's notation
      // Primary structural element (choose one)
      const ankhrasmationPrimary = rndInt(0, 6);
      switch (ankhrasmationPrimary) {
        case 0: drawAnkhrasmationDurations(voice, section); break;
        case 1: drawAnkhrasmationColorBars(voice, section); break;
        case 2: drawAnkhrasmationConnected(voice, section); break;
        case 3: drawAnkhrasmationCells(voice, section); break;
        case 4: drawAnkhrasmationParallel(voice, section); break;
        case 5: drawAnkhrasmationWaves(voice, section); break;
        case 6: drawAnkhrasmationGradients(voice, section); break;
      }
      // Secondary elements (probabilistic layering)
      if (rndBool(0.45)) drawAnkhrasmationSymbols(voice, section);
      if (rndBool(0.40)) drawAnkhrasmationDots(voice, section);
      if (rndBool(0.35)) drawAnkhrasmationVertical(voice, section);
      if (rndBool(0.35)) drawAnkhrasmationArrows(voice, section);
      if (rndBool(0.30)) drawAnkhrasmationDiagonals(voice, section);
      if (rndBool(0.28)) drawAnkhrasmationCrescendo(voice, section);
      if (rndBool(0.25)) drawAnkhrasmationClusters(voice, section);
      if (rndBool(0.22)) drawAnkhrasmationRests(voice, section);
      if (rndBool(0.20)) drawAnkhrasmationBrackets(voice, section);
      if (rndBool(0.18)) drawAnkhrasmationNumbers(voice, section);
      if (rndBool(0.15)) drawAnkhrasmationImprovisationZone(voice, section);
      break;

    case "braxton":
      // Enhanced Braxton mode v3.14.0 - Anthony Braxton's diagrammatic notation
      // Primary structural element (choose one)
      const braxtonPrimary = rndInt(0, 6);
      switch (braxtonPrimary) {
        case 0: drawBraxtonDiagrams(voice, section); break;
        case 1: drawBraxtonCircuitElements(voice, section); break;
        case 2: drawBraxtonParallelStructures(voice, section); break;
        case 3: drawBraxtonContainment(voice, section); break;
        case 4: drawBraxtonModular(voice, section); break;
        case 5: drawBraxtonVerticalStack(voice, section); break;
        case 6: drawBraxtonRotational(voice, section); break;
      }
      // Secondary elements (probabilistic layering)
      if (rndBool(0.45)) drawBraxtonLanguageTypes(voice, section);
      if (rndBool(0.40)) drawBraxtonConnectors(voice, section);
      if (rndBool(0.35)) drawBraxtonLabels(voice, section);
      if (rndBool(0.35)) drawBraxtonFlowArrows(voice, section);
      if (rndBool(0.30)) drawBraxtonAngleBrackets(voice, section);
      if (rndBool(0.28)) drawBraxtonIntersections(voice, section);
      if (rndBool(0.25)) drawBraxtonTechnicalMarks(voice, section);
      if (rndBool(0.22)) drawBraxtonZones(voice, section);
      if (rndBool(0.20)) drawBraxtonPathways(voice, section);
      if (rndBool(0.18)) drawBraxtonHorizontalSpread(voice, section);
      if (rndBool(0.15)) drawBraxtonCompositionNumber(voice, section);
      break;

    case "mobile":
      // Mobile mode v3.23.0 - Haubenstock-Ramati's Calder-inspired mobile scores
      // Primary structural element (choose one)
      const mobilePrimary = rndInt(0, 5);
      switch (mobilePrimary) {
        case 0: drawMobileFloatingCells(voice, section); break;
        case 1: drawMobileBranches(voice, section); break;
        case 2: drawMobilePivotPoints(voice, section); break;
        case 3: drawMobileCellClusters(voice, section); break;
        case 4: drawMobileBalancedArms(voice, section); break;
        case 5: drawMobileRotatingGroups(voice, section); break;
      }
      // Secondary elements (probabilistic layering)
      if (rndBool(0.50)) drawMobileDottedPaths(voice, section);
      if (rndBool(0.45)) drawMobileConnectionNodes(voice, section);
      if (rndBool(0.40)) drawMobileFragmentNotation(voice, section);
      if (rndBool(0.35)) drawMobileSuspendedShapes(voice, section);
      if (rndBool(0.32)) drawMobileNavigablePaths(voice, section);
      if (rndBool(0.30)) drawMobileDirectionalArrows(voice, section);
      if (rndBool(0.28)) drawMobileHangingElements(voice, section);
      if (rndBool(0.25)) drawMobileOptionalRoutes(voice, section);
      if (rndBool(0.20)) drawMobileConvergencePoints(voice, section);
      if (rndBool(0.18)) drawMobileDivergencePoints(voice, section);
      break;
  }
}

function drawVoice(voice, section) {
  let activeMode;

  if (features.blendType === "voiceBased") {
    activeMode = voice.assignedMode;
  } else if (features.blendType === "sectional") {
    activeMode = section.assignedMode;
  } else {
    // Dominant blend: primary mode with secondary accents
    activeMode = features.primaryMode;
  }

  // For stacked structure, create a modified voice with y-bounds mapped to section's vertical slice
  let effectiveVoice = voice;
  if (section.isStacked) {
    // Map voice's proportional position into the section's vertical space
    const totalVoiceHeight = HEIGHT - MARGIN * 2;
    const voiceTopRatio = (voice.yStart - MARGIN) / totalVoiceHeight;
    const voiceBottomRatio = (voice.yEnd - MARGIN) / totalVoiceHeight;

    const stackHeight = section.stackYEnd - section.stackYStart;
    const mappedYStart = section.stackYStart + voiceTopRatio * stackHeight;
    const mappedYEnd = section.stackYStart + voiceBottomRatio * stackHeight;

    // Create a modified voice object with adjusted y-bounds
    effectiveVoice = {
      ...voice,
      yStart: mappedYStart,
      yEnd: mappedYEnd,
      yCenter: (mappedYStart + mappedYEnd) / 2,
      height: mappedYEnd - mappedYStart
    };
  }

  // Draw primary mode
  drawModeElements(activeMode, effectiveVoice, section);

  // Add secondary mode accents (for dominant blend)
  if (features.blendType === "dominant" && features.secondaryModes.length > 0) {
    const accentChance = 0.3;
    for (const secondaryMode of features.secondaryModes) {
      if (rndBool(accentChance * features.densityValue)) {
        drawModeElements(secondaryMode, effectiveVoice, section);
      }
    }
  }
}

// ============================================================
// NOTATION MARKS
// ============================================================

function drawNotationMarks() {
  textFont("serif");
  textAlign(LEFT, TOP);

  // === TOP LEFT: Title area (above the score) ===
  // Opus/work number or dedication - more musical than "mode names"
  const titleY = 12 * scaleFactor;
  fill(features.palette.ink);
  noStroke();

  // Generate musical title
  // const opusNum = rndInt(1, 99);
  // const workTitles = [
  //   `Op. ${opusNum}`,
  //   `No. ${rndInt(1, 999)}`,
  //   `Study ${rndChoice(["I", "II", "III", "IV", "V"])}`,
  //   `Fragment ${rndInt(1, 999)}`,
  //   `Étude`,
  //   `Notation ${rndChoice(["α", "β", "γ", "δ"])}`,
  //   `Score ${rndInt(1, 50)}`
  // ];
  // textSize(16 * scaleFactor);
  // text(rndChoice(workTitles), MARGIN, titleY);

  // Dedication or instrumentation (right side, top)
  // const dedications = [
  //   "for ensemble",
  //   "for any instruments",
  //   "for variable forces",
  //   `for ${rndInt(2, 8)} players`,
  //   "für Orchester",
  //   "pour orchestre",
  //   "per ensemble",
  //   ""  // sometimes none
  // ];
  // const dedication = rndChoice(dedications);
  // if (dedication) {
  //   textStyle(ITALIC);
  //   textSize(14 * scaleFactor);
  //   fill(features.palette.inkLight);
  //   textAlign(RIGHT, TOP);
  //   text(dedication, WIDTH - MARGIN, titleY);
  //   textAlign(LEFT, TOP);
  //   textStyle(NORMAL);
  // }

  // === HEADER: Tempo marking (commented out - tempo influences visuals but isn't displayed) ===
  // const headerY = MARGIN - 22 * scaleFactor;
  // fill(features.palette.ink);
  // textStyle(ITALIC);
  // textSize(14 * scaleFactor);
  // text(features.tempo, MARGIN, headerY);
  // textStyle(NORMAL);

  // === SECTION MARKERS: Always show, positioned in score margin area ===
  if (features.sectionCount > 1) {
    const boxSize = 14 * scaleFactor;

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const letter = String.fromCharCode(65 + i);

      let x, y;
      if (sec.isStacked) {
        // For stacked structure: place markers at left edge of each vertical band
        x = MARGIN - boxSize - 5 * scaleFactor;  // In left margin
        y = sec.stackYStart + 8 * scaleFactor;   // Top of each stack
      } else {
        // For horizontal structures: place at top of each section
        x = sec.xStart + 5 * scaleFactor;
        y = MARGIN + 8 * scaleFactor;
      }

      // Draw box
      stroke(features.palette.ink);
      strokeWeight(1 * scaleFactor);
      noFill();
      rect(x, y, boxSize, boxSize);

      // Draw centered letter
      fill(features.palette.ink);
      noStroke();
      textSize(10 * scaleFactor);
      textAlign(CENTER, CENTER);
      text(letter, x + boxSize / 2, y + boxSize / 2);
      textAlign(LEFT, TOP);  // Reset
    }
  }

  // === DYNAMIC MARKINGS: Scattered in score area ===
  const dynamics = [
    "ppp", "pp", "p", "mp", "mf", "f", "ff", "fff",
    "sfz", "sfp", "sfpp", "fp", "fz", "rf", "rfz",
    "cresc.", "decresc.", "dim.", "morendo", "smorzando",
    "più f", "più p", "poco f", "poco p", "sub. p", "sub. f"
  ];
  textStyle(ITALIC);

  const numDynamics = Math.floor(rndInt(5, 12) * features.densityValue);
  for (let i = 0; i < numDynamics; i++) {
    const x = rnd(MARGIN + 40, WIDTH - MARGIN - 40);
    const y = rnd(MARGIN + 30, HEIGHT - MARGIN - 20);
    const size = rnd(8, 16) * scaleFactor;
    textSize(size);
    fill(features.palette.inkLight + (size > 12 ? "" : "bb"));
    text(rndChoice(dynamics), x, y);
  }
  textStyle(NORMAL);

  // Expression/technique markings
  drawExpressionMarks();

  // Articulation symbols
  drawArticulationSymbols();

  // Performance instructions
  drawPerformanceInstructions();

  // Footer: copyright/date style notation
  // drawFooter();
}

function drawExpressionMarks() {
  const expressions = [
    // Italian expression terms
    "dolce", "cantabile", "espressivo", "con moto", "con fuoco",
    "agitato", "tranquillo", "appassionato", "brillante", "grazioso",
    "maestoso", "misterioso", "pesante", "leggiero", "marcato",
    "sostenuto", "tenuto", "staccato", "legato", "portato",
    // Character
    "con anima", "con brio", "con forza", "con spirito", "senza vibrato",
    "molto vibrato", "sul tasto", "sul ponticello", "ordinario",
    // Avant-garde terms
    "aleatorio", "cluster", "indeterminato", "spaziale", "timbrico"
  ];

  textStyle(ITALIC);
  const numExpressions = Math.floor(rndInt(2, 6) * features.densityValue);

  for (let i = 0; i < numExpressions; i++) {
    const x = rnd(MARGIN + 30, WIDTH - MARGIN - 80);
    const y = rnd(MARGIN, HEIGHT - MARGIN);
    const size = rnd(7, 12) * scaleFactor;
    textSize(size);
    fill(features.palette.inkLight);
    text(rndChoice(expressions), x, y);
  }
  textStyle(NORMAL);
}

function drawArticulationSymbols() {
  // Draw various articulation marks as symbols
  const numSymbols = Math.floor(rndInt(8, 20) * features.densityValue);

  for (let i = 0; i < numSymbols; i++) {
    const x = rnd(MARGIN + 20, WIDTH - MARGIN - 20);
    const y = rnd(MARGIN + 30, HEIGHT - MARGIN - 30);
    const size = rnd(4, 12) * scaleFactor;
    const symbolType = rndInt(0, 9);

    stroke(features.palette.ink);
    strokeWeight(0.8 * scaleFactor);
    noFill();

    push();
    translate(x, y);

    switch (symbolType) {
      case 0: // Accent (>)
        line(-size/2, 0, size/2, -size/3);
        line(-size/2, 0, size/2, size/3);
        break;
      case 1: // Staccato (dot)
        fill(features.palette.ink);
        noStroke();
        ellipse(0, 0, size/2, size/2);
        break;
      case 2: // Tenuto (line)
        line(-size/2, 0, size/2, 0);
        break;
      case 3: // Fermata
        arc(0, 0, size, size * 0.7, PI, TWO_PI);
        fill(features.palette.ink);
        ellipse(0, -size * 0.1, size * 0.2, size * 0.2);
        break;
      case 4: // Marcato (^)
        line(-size/3, size/4, 0, -size/3);
        line(0, -size/3, size/3, size/4);
        break;
      case 5: // Trill (tr with wavy)
        textSize(size);
        fill(features.palette.ink);
        noStroke();
        text("tr", 0, 0);
        stroke(features.palette.ink);
        for (let w = 0; w < 4; w++) {
          const wx = size/2 + w * 3 * scaleFactor;
          arc(wx, 0, 3 * scaleFactor, 2 * scaleFactor, 0, PI);
          arc(wx + 1.5 * scaleFactor, 0, 3 * scaleFactor, 2 * scaleFactor, PI, TWO_PI);
        }
        break;
      case 6: // Caesura (//)
        strokeWeight(1.2 * scaleFactor);
        line(-size/4, -size/2, size/4, size/2);
        line(0, -size/2, size/2, size/2);
        break;
      case 7: // Breath mark (')
        strokeWeight(1.5 * scaleFactor);
        arc(0, 0, size/2, size, -PI/2, PI/2);
        break;
      case 8: // Glissando wavy
        beginShape();
        for (let g = 0; g < 6; g++) {
          const gx = g * size/3;
          const gy = sin(g * PI) * size/4;
          vertex(gx, gy);
        }
        endShape();
        break;
      case 9: // Harmonic (diamond)
        beginShape();
        vertex(0, -size/2);
        vertex(size/3, 0);
        vertex(0, size/2);
        vertex(-size/3, 0);
        endShape(CLOSE);
        break;
    }

    pop();
  }
}

function drawPerformanceInstructions() {
  const instructions = [
    // Playing techniques
    "arco", "pizz.", "col legno", "col legno battuto", "col legno tratto",
    "spiccato", "sautillé", "ricochet", "jeté", "tremolo",
    "flautando", "harmonics", "sul G", "sul D", "sul A", "sul E",
    "mute", "senza sord.", "con sord.",
    // Woodwind/brass
    "flutter", "slap tongue", "multiphonic", "whistle tone", "key clicks",
    "half-valve", "stopped", "open", "cuivré", "bouché",
    // Extended techniques
    "overpressure", "scratch tone", "circular bowing", "behind the bridge",
    "on the bridge", "on the tailpiece", "bisbigliando",
    // Spatial/temporal
    "ad lib.", "a piacere", "senza misura", "freely", "attacca",
    "tacet", "G.P.", "lunga", "l.v.", "laissez vibrer"
  ];

  textFont("serif");
  const numInstructions = Math.floor(rndInt(2, 5) * features.densityValue);

  for (let i = 0; i < numInstructions; i++) {
    const x = rnd(MARGIN + 20, WIDTH - MARGIN - 100);
    const y = rnd(MARGIN, HEIGHT - MARGIN);
    const size = rnd(6, 11) * scaleFactor;
    textSize(size);
    textStyle(rndBool(0.5) ? ITALIC : NORMAL);
    fill(features.palette.ink + "bb");
    text(rndChoice(instructions), x, y);
  }
  textStyle(NORMAL);
}

function drawMetronomeMarks() {
  // Metronome marking - hand-drawn note symbol
  const noteTypes = ["quarter", "half", "eighth", "dotted"];
  const bpm = rndInt(40, 180);
  const noteType = rndChoice(noteTypes);

  // Position at left margin
  const metroX = MARGIN;

  // Note positioning - head at bottom, stem goes up
  const noteHeadY = MARGIN - 12 * scaleFactor;  // Note head position (lower)
  const noteSize = 4 * scaleFactor;
  const stemHeight = 14 * scaleFactor;

  // Note head (filled oval, tilted)
  fill(features.palette.ink);
  noStroke();
  push();
  translate(metroX, noteHeadY);
  rotate(-0.35);  // Slight tilt like engraved notes
  if (noteType === "half") {
    // Half note: hollow
    stroke(features.palette.ink);
    strokeWeight(1 * scaleFactor);
    noFill();
    ellipse(0, 0, noteSize * 1.5, noteSize);
  } else {
    // Quarter/eighth: filled
    ellipse(0, 0, noteSize * 1.5, noteSize);
  }
  pop();

  // Stem (goes up from right side of note head)
  stroke(features.palette.ink);
  strokeWeight(1 * scaleFactor);
  const stemX = metroX + noteSize * 0.5;
  line(stemX, noteHeadY - noteSize * 0.3, stemX, noteHeadY - stemHeight);

  // Flag for eighth note
  if (noteType === "eighth") {
    noFill();
    stroke(features.palette.ink);
    strokeWeight(1 * scaleFactor);
    beginShape();
    vertex(stemX, noteHeadY - stemHeight);
    bezierVertex(
      stemX + noteSize * 1.5, noteHeadY - stemHeight + noteSize,
      stemX + noteSize * 1.5, noteHeadY - stemHeight + noteSize * 2.5,
      stemX + noteSize * 0.5, noteHeadY - stemHeight + noteSize * 3.5
    );
    endShape();
  }

  // Dot for dotted notes
  if (noteType === "dotted") {
    fill(features.palette.ink);
    noStroke();
    ellipse(metroX + noteSize * 1.3, noteHeadY, noteSize * 0.4, noteSize * 0.4);
  }

  // "= BPM" text aligned with note head
  noStroke();
  fill(features.palette.ink);
  textSize(11 * scaleFactor);
  textAlign(LEFT, CENTER);
  text(` = ${bpm}`, metroX + noteSize * 2, noteHeadY);
  textAlign(LEFT, TOP);  // Reset
}

function drawFooter() {
  // Musical score footer - duration and year
  const footerY = HEIGHT - 16 * scaleFactor;

  textSize(18 * scaleFactor);
  fill(features.palette.inkLight);

  // Right side: year
  textAlign(RIGHT, BOTTOM);
  const year = rndInt(1950, 2024);
  text(year.toString(), WIDTH - MARGIN, footerY);

  // Center/Left: duration indication - more variants
  textAlign(CENTER, BOTTOM);
  const durations = [
    "ca. 2'",
    "ca. 3'",
    "ca. 4'",
    "ca. 5'",
    "ca. 6'",
    "ca. 7–10'",
    "ca. 8–12'",
    "ca. 10–15'",
    "ca. 12'",
    "~2'30\"",
    "~3'45\"",
    "~4'30\"",
    "~5'00\"",
    "~6'20\"",
    "~8'00\"",
    "duration: variable",
    "duration: indeterminate",
    "duration: open",
    "duration: flexible",
    "approx. 4 min.",
    "approx. 6 min.",
    "approx. 8 min.",
    "3–5 minutes",
    "5–8 minutes",
    "7–12 minutes",
    "performance duration varies"
  ];
  const duration = rndChoice(durations);
  text(duration, WIDTH / 2, footerY);

  textAlign(LEFT, TOP);  // Reset
}

function applyPalindromeSymmetry() {
  if (!features.hasSymmetry) return;

  const img = get(Math.floor(WIDTH/2), 0, Math.floor(WIDTH/2), HEIGHT);
  push();
  translate(WIDTH/2, 0);
  scale(-1, 1);
  image(img, 0, 0);
  pop();

  stroke(features.palette.accent + "50");
  strokeWeight(2 * scaleFactor);
  for (let y = MARGIN; y < HEIGHT - MARGIN; y += 18 * scaleFactor) {
    line(WIDTH/2, y, WIDTH/2, y + 9 * scaleFactor);
  }
}

// ============================================================
// MAIN
// ============================================================

function setup() {
  canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("sketch-holder");

  generateFeatures();
  setupComposition();
  noLoop();
  drawScore();

  if (typeof window !== "undefined") {
    window.getFeatures = () => features;
    window.getHash = () => hash;
    window.regenerate = regenerate;
    window.setParameter = setParameter;
    window.resetToOriginal = resetToOriginal;
    window.hasModifications = hasModifications;
    window.getRarityCurves = getRarityCurves;
    window.setHiRes = setHiRes;
    window.savePrintFriendly = savePrintFriendly;
    window.getModes = () => MODES;
  }
}

function drawScore() {
  // Reset PRNG to initial state (don't create new R, preserve state methods)
  R.setState(rngInitialState);

  drawPaper();
  drawStaves();

  for (const section of sections) {
    for (const voice of voices) {
      drawVoice(voice, section);
    }
  }

  if (features.hasSymmetry) {
    applyPalindromeSymmetry();
  }

  drawNotationMarks();
  drawVignette();
}

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

  hasOverrides = false;
  generateFeatures();
  setupComposition();
  drawScore();

  window.dispatchEvent(new CustomEvent("featuresUpdated", { detail: features }));
}

function setHiRes(enabled) {
  hiResMode = enabled;
  scaleFactor = enabled ? 3.13 : 1;  // 4961/1587 ≈ 3.13
  // A3 at 300 DPI for print, or standard screen size
  WIDTH = enabled ? 4961 : 1587;
  HEIGHT = enabled ? 3508 : 1122;

  resizeCanvas(WIDTH, HEIGHT);
  // Restore PRNG state to ensure consistent composition
  R.setState(rngStateAfterFeatures);
  setupComposition();
  drawScore();
}

function savePrintFriendly() {
  // Save current state
  const wasHiRes = hiResMode;

  // Set to hi-res print-friendly mode (keeps same features, just clean render)
  printFriendlyMode = true;
  hiResMode = true;
  scaleFactor = 3.13;
  WIDTH = 4961;
  HEIGHT = 3508;

  resizeCanvas(WIDTH, HEIGHT);
  // Restore PRNG state to ensure consistent composition
  R.setState(rngStateAfterFeatures);
  setupComposition();
  drawScore();

  // Save the clean version
  saveCanvas(`graphical-score-${features.seed}-print`, "png");

  // Restore previous state
  printFriendlyMode = false;
  hiResMode = wasHiRes;
  scaleFactor = wasHiRes ? 3.13 : 1;
  WIDTH = wasHiRes ? 4961 : 1587;
  HEIGHT = wasHiRes ? 3508 : 1122;

  resizeCanvas(WIDTH, HEIGHT);
  // Restore PRNG state again for consistent restoration
  R.setState(rngStateAfterFeatures);
  setupComposition();
  drawScore();
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas(`graphical-score-${features.seed}`, "png");
  }
  if (key === "r" || key === "R") {
    regenerate();
  }
  if (key === "h" || key === "H") {
    setHiRes(!hiResMode);
  }
  if (key === "p" || key === "P") {
    savePrintFriendly();
  }
}

if (typeof module !== "undefined") {
  module.exports = { generateFeatures, features, hash, MODES };
}
