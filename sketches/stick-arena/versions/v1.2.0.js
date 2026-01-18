// Stick Arena v1.2.0 - Larger Than Life Edition
// Hash-based stick figure combat with professional animation

// ============================================================================
// HASH-BASED RANDOM
// ============================================================================

let hash = "0x" + Array(64).fill(0).map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

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

function rnd(min = 0, max = 1) {
  if (arguments.length === 1) { max = min; min = 0; }
  return min + R() * (max - min);
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

function rollRarity(common = 0.55, uncommon = 0.28, rare = 0.14, legendary = 0.03) {
  const roll = R();
  if (roll < legendary) return "legendary";
  if (roll < legendary + rare) return "rare";
  if (roll < legendary + rare + uncommon) return "uncommon";
  return "common";
}

// Easing functions for smooth animation
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}

// ============================================================================
// FEATURES
// ============================================================================

let features = {};

const ENVIRONMENTS = {
  dojo: {
    name: "Dojo",
    bg: { top: [60, 45, 35], bottom: [35, 25, 20] },
    floor: { main: [90, 65, 45], highlight: [110, 80, 55], shadow: [60, 40, 30] },
    accent: [200, 60, 50],
    elements: ["wooden_beams", "paper_walls", "lanterns"],
    particles: "dust",
    ambience: 0.8
  },
  street: {
    name: "Street",
    bg: { top: [15, 20, 35], bottom: [25, 30, 45] },
    floor: { main: [50, 50, 55], highlight: [70, 70, 75], shadow: [30, 30, 35] },
    accent: [255, 180, 50],
    elements: ["buildings", "neon_signs", "steam_vents"],
    particles: "rain",
    ambience: 0.6
  },
  simulation: {
    name: "Simulation",
    bg: { top: [0, 8, 15], bottom: [5, 20, 30] },
    floor: { main: [10, 40, 35], highlight: [20, 80, 60], shadow: [5, 20, 20] },
    accent: [0, 255, 180],
    elements: ["grid_floor", "data_pillars", "code_rain"],
    particles: "data",
    ambience: 0.4
  },
  nature: {
    name: "Nature",
    bg: { top: [180, 220, 255], bottom: [120, 180, 220] },
    floor: { main: [70, 130, 55], highlight: [90, 160, 70], shadow: [45, 90, 35] },
    accent: [255, 220, 150],
    elements: ["mountains", "trees", "clouds"],
    particles: "leaves",
    ambience: 1.0
  },
  chip: {
    name: "Microchip",
    bg: { top: [8, 15, 8], bottom: [15, 30, 18] },
    floor: { main: [25, 50, 30], highlight: [40, 80, 45], shadow: [15, 30, 18] },
    accent: [220, 200, 100],
    elements: ["circuits", "capacitors", "traces"],
    particles: "sparks",
    ambience: 0.5
  },
  program: {
    name: "Inside Program",
    bg: { top: [12, 8, 20], bottom: [20, 15, 35] },
    floor: { main: [30, 25, 50], highlight: [50, 40, 80], shadow: [15, 12, 30] },
    accent: [130, 180, 255],
    elements: ["code_blocks", "brackets", "variables"],
    particles: "syntax",
    ambience: 0.3
  },
  desktop: {
    name: "OS Desktop",
    bg: { top: [0, 80, 160], bottom: [0, 120, 200] },
    floor: { main: [45, 45, 50], highlight: [65, 65, 70], shadow: [25, 25, 30] },
    accent: [255, 255, 255],
    elements: ["windows", "icons", "cursor"],
    particles: "pixels",
    ambience: 0.9
  }
};

const STICK_COLORS = [
  { name: "Shadow", rgb: [20, 20, 25], glow: [60, 60, 80] },
  { name: "Ghost", rgb: [240, 240, 250], glow: [255, 255, 255] },
  { name: "Crimson", rgb: [180, 40, 40], glow: [255, 100, 100] },
  { name: "Azure", rgb: [40, 80, 180], glow: [100, 150, 255] },
  { name: "Jade", rgb: [40, 150, 80], glow: [100, 255, 150] },
  { name: "Gold", rgb: [200, 160, 50], glow: [255, 220, 100] },
  { name: "Violet", rgb: [140, 50, 160], glow: [200, 120, 255] },
  { name: "Ember", rgb: [220, 120, 40], glow: [255, 180, 100] },
];

function generateFeatures() {
  R = initRandom(hash);

  // Environment
  const envRarity = rollRarity(0.45, 0.32, 0.18, 0.05);
  let envName;
  if (envRarity === "legendary") {
    envName = rndChoice(["desktop", "program"]);
  } else if (envRarity === "rare") {
    envName = rndChoice(["chip", "simulation"]);
  } else if (envRarity === "uncommon") {
    envName = rndChoice(["street", "nature"]);
  } else {
    envName = "dojo";
  }

  // Fighter count
  const fighterRarity = rollRarity(0.58, 0.27, 0.12, 0.03);
  let fighterCount;
  if (fighterRarity === "legendary") {
    fighterCount = 1;
  } else if (fighterRarity === "rare") {
    fighterCount = rndInt(3, 4);
  } else if (fighterRarity === "uncommon") {
    fighterCount = 3;
  } else {
    fighterCount = 2;
  }

  // Objects
  const objectRarity = rollRarity(0.65, 0.22, 0.10, 0.03);
  let objectCount = objectRarity === "legendary" ? rndInt(4, 6) :
                    objectRarity === "rare" ? rndInt(2, 3) :
                    objectRarity === "uncommon" ? 1 : 0;

  // Intensity
  const intensityRarity = rollRarity(0.45, 0.32, 0.18, 0.05);
  let intensity = intensityRarity === "legendary" ? "bullet_time" :
                  intensityRarity === "rare" ? "intense" :
                  intensityRarity === "uncommon" ? "fast" : "cinematic";

  // Effects
  const fxRarity = rollRarity(0.50, 0.30, 0.15, 0.05);
  let specialFX = fxRarity === "legendary" ? rndChoice(["auras", "afterimages"]) :
                  fxRarity === "rare" ? "trails" :
                  fxRarity === "uncommon" ? "impacts" : "minimal";

  // GLITCH TRAIT - Very rare (2%)
  const hasGlitch = R() < 0.02;
  const glitchIntensity = hasGlitch ? rnd(0.3, 1.0) : 0;

  // Choreography
  const choreoStyle = rndChoice(["matrix", "wuxia", "capoeira", "kickboxing"]);

  features = {
    hash: hash,
    environment: { name: envName, config: ENVIRONMENTS[envName], rarity: envRarity },
    fighters: { count: fighterCount, rarity: fighterRarity },
    objects: { count: objectCount, rarity: objectRarity },
    intensity: { level: intensity, rarity: intensityRarity },
    fx: { type: specialFX, rarity: fxRarity },
    glitch: { active: hasGlitch, intensity: glitchIntensity, rarity: hasGlitch ? "legendary" : "common" },
    choreo: choreoStyle,
    soloTraining: fighterCount === 1
  };

  return features;
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

let fighters = [];
let environment;
let objects = [];
let effects;
let camera = { x: 0, y: 0, shake: 0, zoom: 1 };
let slowMotion = { active: false, factor: 1, duration: 0 };
let gameState = 'fighting';
let winner = null;
let victoryTimer = 0;
let globalTime = 0;

// ============================================================================
// STICK FIGURE CLASS - Enhanced Animation
// ============================================================================

class StickFigure {
  constructor(x, y, colorData, id) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.colorData = colorData;
    this.color = colorData.rgb;
    this.glowColor = colorData.glow;
    this.facing = id === 0 ? 1 : -1;

    // Body - larger proportions for visibility
    this.headSize = 16;
    this.bodyLength = 52;
    this.armLength = 42;
    this.legLength = 48;
    this.thickness = 4;

    // Current pose with smooth values
    this.pose = this.getIdlePose();
    this.startPose = { ...this.pose };
    this.targetPose = { ...this.pose };
    this.poseTime = 0;
    this.poseDuration = 1;
    this.poseEasing = easeOutQuart;

    // Physics
    this.vx = 0;
    this.vy = 0;
    this.grounded = true;
    this.airTime = 0;

    // Combat
    this.health = 100;
    this.maxHealth = 100;
    this.blocking = false;
    this.attacking = false;
    this.attackFrame = 0;
    this.stunned = 0;
    this.invincible = 0;
    this.comboCount = 0;
    this.lastHitTime = 0;

    // Animation
    this.currentMove = null;
    this.movePhase = 0; // 0-1 progress through move
    this.moveQueue = [];
    this.breathCycle = rnd(1000);
    this.afterimages = [];

    // State
    this.dead = false;
    this.winner = false;
    this.energy = 100; // For special moves
  }

  getIdlePose() {
    // Proper fighting stance with weight distribution
    return {
      headX: 0, headY: 0, headTilt: 0,
      torsoAngle: -0.1,  // Slight forward lean
      // Guard position - hands up protecting face
      shoulderL: -0.6, elbowL: 1.8,   // Left arm bent, guarding
      shoulderR: 0.5, elbowR: 1.6,    // Right arm bent, ready to strike
      // Athletic stance - knees bent, weight distributed
      hipL: 0.4, kneeL: 0.3,   // Front leg slightly forward
      hipR: -0.25, kneeR: 0.2  // Back leg supporting
    };
  }

  setPose(newPose, duration = 8, easing = easeOutQuart) {
    // Capture current pose as start for interpolation
    this.startPose = { ...this.pose };
    this.targetPose = { ...this.pose, ...newPose };
    this.poseTime = 0;
    this.poseDuration = Math.max(duration, 1);
    this.poseEasing = easing;
  }

  update(fighters, groundY, dt = 1) {
    if (this.dead && !this.winner) {
      this.updateDead(groundY);
      return;
    }
    if (this.winner) {
      this.updateVictory();
      return;
    }

    // Timers
    if (this.stunned > 0) this.stunned -= dt;
    if (this.invincible > 0) this.invincible -= dt;
    this.breathCycle += dt * 0.05;

    // Physics
    if (!this.grounded) {
      this.vy += 0.6 * dt;
      this.airTime += dt;
    } else {
      this.airTime = 0;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Ground
    if (this.y >= groundY) {
      this.y = groundY;
      if (this.vy > 5) {
        camera.shake = Math.min(camera.shake + this.vy * 0.5, 15);
      }
      this.vy = 0;
      this.grounded = true;
    }

    // Friction
    this.vx *= this.grounded ? 0.85 : 0.98;
    if (Math.abs(this.vx) < 0.1) this.vx = 0;

    // Bounds - more room for larger fighters
    this.x = constrain(this.x, 80, width - 80);

    // Animation
    this.updateAnimation(fighters);
    this.updatePose(dt);

    // Afterimages for special FX
    if (features.fx.type === "afterimages" && (this.attacking || Math.abs(this.vx) > 3)) {
      if (frameCount % 2 === 0) {
        this.afterimages.push({
          x: this.x, y: this.y,
          pose: { ...this.pose },
          facing: this.facing,
          alpha: 120
        });
      }
    }

    // Decay afterimages
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].alpha -= 8;
      if (this.afterimages[i].alpha <= 0) {
        this.afterimages.splice(i, 1);
      }
    }
  }

  updatePose(dt) {
    this.poseTime += dt;
    const t = Math.min(this.poseTime / this.poseDuration, 1);
    const eased = this.poseEasing(t);

    // Proper interpolation: lerp from START to TARGET using eased progress
    for (let key in this.targetPose) {
      if (this.startPose[key] !== undefined && this.pose[key] !== undefined) {
        this.pose[key] = this.startPose[key] + (this.targetPose[key] - this.startPose[key]) * eased;
      }
    }

    // Add subtle breathing/sway when idle
    if (!this.attacking && this.grounded && !this.currentMove) {
      const breath = Math.sin(this.breathCycle) * 0.03;
      const sway = Math.sin(this.breathCycle * 0.7) * 0.015;
      this.pose.torsoAngle += breath;
      this.pose.shoulderL += sway;
      this.pose.shoulderR -= sway;
      this.pose.hipL += sway * 0.5;
      this.pose.hipR -= sway * 0.5;
    }
  }

  updateAnimation(fighters) {
    // Progress current move
    if (this.currentMove) {
      this.movePhase += 1 / this.currentMove.duration;

      if (this.movePhase >= 1) {
        this.finishMove();
      } else {
        this.animateMove();
      }
    } else if (this.stunned <= 0) {
      this.decideNextMove(fighters);
    }
  }

  decideNextMove(fighters) {
    const opponent = this.findNearestOpponent(fighters);

    if (!opponent) {
      this.doTrainingMove();
      return;
    }

    const dist = Math.abs(this.x - opponent.x);
    const heightDiff = this.y - opponent.y;

    // Face opponent smoothly
    const targetFacing = this.x < opponent.x ? 1 : -1;
    if (targetFacing !== this.facing && !this.attacking) {
      this.facing = targetFacing;
    }

    // Choreography based on style - scaled distances for larger fighters
    const style = features.choreo;

    if (dist > 200) {
      // Far range - approach with style
      const approaches = {
        matrix: ["superman_dive", "dash", "flip_forward"],
        wuxia: ["flying_approach", "run", "jump_spin"],
        capoeira: ["au", "flip_forward", "macaco"],
        kickboxing: ["dash", "run", "dash"]
      };
      this.startMove(rndChoice(approaches[style] || approaches.matrix));
    } else if (dist > 120) {
      // Mid range - initiate attack or reposition
      if (opponent.attacking && rndBool(0.5)) {
        const evades = {
          matrix: ["dodge_matrix", "backflip", "slide_under"],
          wuxia: ["backflip", "jump_spin", "flying_approach"],
          capoeira: ["esquiva", "au", "macaco"],
          kickboxing: ["duck", "backflip", "slide_under"]
        };
        this.startMove(rndChoice(evades[style] || evades.matrix));
      } else {
        this.startCombo(style);
      }
    } else {
      // Close range - aggressive exchanges
      if (opponent.attacking) {
        // Counter or evade based on style
        if (rndBool(0.6)) {
          const counters = {
            matrix: ["parry", "dodge_matrix", "duck"],
            wuxia: ["parry", "backflip", "crane_stance"],
            capoeira: ["esquiva", "ginga", "au"],
            kickboxing: ["parry", "duck", "slide_under"]
          };
          this.startMove(rndChoice(counters[style] || counters.matrix));
          // Queue powerful counter-attack
          const counterAttacks = ["counter_strike", "uppercut", "knee_strike", "elbow_strike", "spin_kick"];
          this.moveQueue.push(rndChoice(counterAttacks));
        } else {
          this.startMove("backflip");
        }
      } else {
        // Aggressive close combat with varied combos
        if (rndBool(0.7)) {
          this.startCombo(style);
        } else {
          // Single powerful strike
          const powerMoves = ["superman_punch", "flying_kick", "roundhouse", "uppercut", "head_kick"];
          this.startMove(rndChoice(powerMoves));
        }
      }
    }
  }

  startCombo(style) {
    const combos = {
      matrix: [
        ["jab", "jab", "spin_kick"],
        ["superman_punch", "knee_strike"],
        ["dodge_matrix", "counter_strike", "roundhouse"],
        ["flying_knee", "elbow_strike", "sweep"],
        ["jab", "cross", "superman_punch"],
        ["slide_under", "uppercut", "flying_kick"],
        ["parry", "elbow_strike", "spin_kick", "backflip"]
      ],
      wuxia: [
        ["palm_strike", "palm_strike", "flying_kick"],
        ["crane_kick", "spinning_backfist"],
        ["jump_spin", "aerial_kick", "landing_strike"],
        ["chain_punches", "rising_punch"],
        ["crane_stance", "crane_kick", "palm_strike", "flying_kick"],
        ["backflip", "flying_approach", "aerial_kick"]
      ],
      capoeira: [
        ["ginga", "martelo", "armada"],
        ["au", "martelo"],
        ["esquiva", "rasteira", "ponteira"],
        ["macaco", "aerial_kick"],
        ["ginga", "au", "rasteira", "martelo"],
        ["esquiva", "macaco", "spin_kick"]
      ],
      kickboxing: [
        ["jab", "cross", "hook"],
        ["jab", "body_kick"],
        ["leg_kick", "leg_kick", "head_kick"],
        ["clinch", "knee_strike", "knee_strike", "elbow_strike"],
        ["jab", "jab", "cross", "hook", "uppercut"],
        ["leg_kick", "cross", "hook", "body_kick"]
      ]
    };

    const combo = rndChoice(combos[style] || combos.matrix);
    this.startMove(combo[0]);
    for (let i = 1; i < combo.length; i++) {
      this.moveQueue.push(combo[i]);
    }
  }

  doTrainingMove() {
    const katas = [
      ["crane_stance", "crane_kick", "palm_strike"],
      ["meditation", "rising_punch", "spin_kick"],
      ["ginga", "martelo", "armada", "au"],
      ["shadowbox_combo"]
    ];

    const kata = rndChoice(katas);
    kata.forEach((move, i) => {
      if (i === 0) this.startMove(move);
      else this.moveQueue.push(move);
    });
  }

  startMove(moveName) {
    const moves = this.getMoveData();
    const move = moves[moveName];

    if (!move) {
      this.currentMove = null;
      return;
    }

    this.currentMove = { name: moveName, ...move };
    this.movePhase = 0;
    this.attacking = move.isAttack || false;
    this.blocking = move.isBlock || false;
    this.attackFrame = 0;

    // Initial pose with anticipation
    if (move.windupPose) {
      this.setPose(move.windupPose, move.duration * 0.3, easeOutQuart);
    }

    // Movement
    if (move.vx) this.vx = move.vx * this.facing;
    if (move.vy && this.grounded) {
      this.vy = move.vy;
      this.grounded = false;
    }

    // Effects
    if (move.isAttack && features.fx.type !== "minimal") {
      effects.addWindup(this.x + this.facing * 30, this.y - this.bodyLength * 0.7);
    }
  }

  animateMove() {
    const move = this.currentMove;
    if (!move) return;

    const phase = this.movePhase;

    // Three-phase animation: windup (0-0.3), action (0.3-0.7), recovery (0.7-1)
    if (phase < 0.3) {
      // Windup - anticipation
      if (move.windupPose) {
        const t = phase / 0.3;
        this.setPose(move.windupPose, 3, easeOutQuart);
      }
    } else if (phase < 0.7) {
      // Action - main movement
      if (move.actionPose) {
        const t = (phase - 0.3) / 0.4;
        this.setPose(move.actionPose, 2, easeOutBack);
      }

      // Attack hitbox active in middle of action
      if (move.isAttack && phase > 0.4 && phase < 0.6) {
        this.attackFrame++;
      }
    } else {
      // Recovery
      if (move.recoveryPose) {
        this.setPose(move.recoveryPose, 5, easeOutQuart);
      } else {
        this.setPose(this.getIdlePose(), 8, easeOutQuart);
      }
    }

    // Continuous movement during move
    if (move.continuousVx) {
      this.vx = move.continuousVx * this.facing;
    }
  }

  finishMove() {
    this.currentMove = null;
    this.attacking = false;
    this.blocking = false;
    this.attackFrame = 0;
    this.setPose(this.getIdlePose(), 10, easeOutQuart);

    // Execute queued move
    if (this.moveQueue.length > 0) {
      const nextMove = this.moveQueue.shift();
      setTimeout(() => this.startMove(nextMove), 50);
    }
  }

  getMoveData() {
    return {
      // === MOVEMENT === (velocities scaled for larger fighters)
      dash: {
        duration: 15, vx: 12,
        windupPose: { torsoAngle: 0.3, shoulderL: -1.2, shoulderR: 1.0, kneeL: 0.4, kneeR: 0.4 },
        actionPose: { torsoAngle: 0.4, shoulderL: -0.5, elbowL: -0.3, shoulderR: 1.5, elbowR: 0.2, hipL: 0.6, hipR: -0.3 }
      },
      run: {
        duration: 20, continuousVx: 7,
        actionPose: { torsoAngle: 0.25, hipL: 0.9, kneeL: -0.5, hipR: -0.5, kneeR: 0.4, shoulderL: 0.5, shoulderR: -0.3 }
      },
      flip_forward: {
        duration: 25, vx: 9, vy: -16,
        actionPose: { torsoAngle: -3.14, shoulderL: -1.5, shoulderR: 1.5, hipL: -1.2, hipR: 1.2 }
      },
      backflip: {
        duration: 28, vx: -6, vy: -18,
        actionPose: { torsoAngle: 3.14, headTilt: -0.3, hipL: 1.0, hipR: -1.0 }
      },
      dodge_matrix: {
        duration: 20, vx: -3, isBlock: true,
        windupPose: { torsoAngle: -0.8, headTilt: -0.3, kneeL: 1.0, kneeR: 1.0 },
        actionPose: { torsoAngle: -1.4, headTilt: -0.6, shoulderL: 0.6, shoulderR: -0.6, headY: 15 }
      },
      slide_under: {
        duration: 22, vx: 10, isBlock: true,
        actionPose: { torsoAngle: 1.4, hipL: 1.8, hipR: 0.3, headY: 35, kneeL: 0.8 }
      },
      duck: {
        duration: 12, isBlock: true,
        actionPose: { headY: 40, kneeL: 1.5, kneeR: 1.5, torsoAngle: 0.4 }
      },

      // === PUNCHES === (more dynamic poses for larger scale)
      jab: {
        duration: 10, isAttack: true, damage: 5,
        windupPose: { shoulderR: 0.3, elbowR: 1.8, torsoAngle: -0.1 },
        actionPose: { shoulderR: 1.0, elbowR: 0.1, torsoAngle: 0.2, hipL: 0.45, hipR: -0.2 }
      },
      cross: {
        duration: 14, isAttack: true, damage: 8, vx: 3,
        windupPose: { shoulderR: -0.4, elbowR: 2.0, torsoAngle: -0.3 },
        actionPose: { shoulderR: 1.2, elbowR: 0, torsoAngle: 0.4, hipL: 0.5 }
      },
      hook: {
        duration: 16, isAttack: true, damage: 10,
        windupPose: { shoulderR: 1.8, elbowR: 1.8, torsoAngle: -0.4 },
        actionPose: { shoulderR: 0.2, elbowR: 1.5, torsoAngle: 0.5, hipL: 0.3 }
      },
      uppercut: {
        duration: 18, isAttack: true, damage: 12, vy: -5,
        windupPose: { shoulderR: 0.6, elbowR: 2.2, kneeL: 0.6, kneeR: 0.6, headY: 8 },
        actionPose: { shoulderR: -1.5, elbowR: 0.2, torsoAngle: -0.3, headY: -8 }
      },
      superman_punch: {
        duration: 24, isAttack: true, damage: 15, vx: 12, vy: -12,
        windupPose: { shoulderR: -0.6, elbowR: 2.2, hipR: -0.6, kneeR: 0.8 },
        actionPose: { shoulderR: 1.4, elbowR: 0, hipL: 1.0, hipR: -1.2, torsoAngle: 0.4 }
      },
      palm_strike: {
        duration: 14, isAttack: true, damage: 8,
        windupPose: { shoulderR: -0.4, elbowR: 1.2, torsoAngle: -0.2 },
        actionPose: { shoulderR: 1.2, elbowR: 0.4, torsoAngle: 0.3, hipL: 0.4 }
      },
      chain_punches: {
        duration: 20, isAttack: true, damage: 4,
        actionPose: { shoulderL: 1.0, shoulderR: 0.8, elbowL: 0.2, elbowR: 0.2, torsoAngle: 0.15 }
      },
      counter_strike: {
        duration: 12, isAttack: true, damage: 14, vx: 2,
        actionPose: { shoulderR: 1.4, elbowR: 0, torsoAngle: 0.5, hipL: 0.5 }
      },
      elbow_strike: {
        duration: 14, isAttack: true, damage: 11, vx: 4,
        actionPose: { shoulderR: 1.8, elbowR: 2.8, torsoAngle: 0.4, hipL: 0.3 }
      },

      // === KICKS === (scaled for larger fighters)
      spin_kick: {
        duration: 22, isAttack: true, damage: 12, vx: 2,
        windupPose: { torsoAngle: -0.4, hipR: -0.4, kneeR: 0.6 },
        actionPose: { torsoAngle: 1.0, hipR: 1.5, kneeR: 0.2, shoulderL: -0.8, shoulderR: 0.8 }
      },
      roundhouse: {
        duration: 20, isAttack: true, damage: 14, vx: 2,
        windupPose: { hipR: -0.5, torsoAngle: -0.3, kneeR: 0.8 },
        actionPose: { hipR: 1.7, kneeR: 0.2, torsoAngle: 0.6, shoulderL: -1.0 }
      },
      flying_kick: {
        duration: 26, isAttack: true, damage: 16, vx: 14, vy: -14,
        windupPose: { hipL: 0.8, kneeL: 1.0 },
        actionPose: { hipR: 1.6, kneeR: 0, hipL: -0.6, torsoAngle: 0.5, shoulderL: -1.2, shoulderR: 1.2 }
      },
      crane_kick: {
        duration: 24, isAttack: true, damage: 13, vy: -8,
        windupPose: { hipL: 1.2, kneeL: 1.8, shoulderL: -1.4, shoulderR: 1.4 },
        actionPose: { hipR: 1.8, kneeR: 0.2, hipL: 0.4, torsoAngle: 0.2 }
      },
      sweep: {
        duration: 18, isAttack: true, damage: 8,
        windupPose: { kneeL: 0.8, kneeR: 0.8, headY: 10 },
        actionPose: { torsoAngle: 1.0, hipR: 1.8, kneeR: 0.1, headY: 25, kneeL: 1.2 }
      },
      knee_strike: {
        duration: 14, isAttack: true, damage: 10, vx: 3,
        windupPose: { hipR: 1.0, kneeR: 1.5 },
        actionPose: { hipR: 2.2, kneeR: 2.6, torsoAngle: -0.25, shoulderL: 0.4, shoulderR: 0.4 }
      },
      flying_knee: {
        duration: 20, isAttack: true, damage: 13, vy: -12, vx: 6,
        windupPose: { hipR: 1.2, kneeR: 1.8 },
        actionPose: { hipR: 2.4, kneeR: 2.8, torsoAngle: -0.15, shoulderL: 0.5, shoulderR: 0.5 }
      },
      aerial_kick: {
        duration: 22, isAttack: true, damage: 14, vy: -14,
        windupPose: { hipL: 0.5, hipR: -0.3 },
        actionPose: { hipR: 1.9, kneeR: 0, hipL: -1.0, torsoAngle: 0.7, shoulderL: -1.0, shoulderR: 1.0 }
      },
      body_kick: {
        duration: 18, isAttack: true, damage: 11, vx: 2,
        windupPose: { hipR: -0.3, kneeR: 0.6 },
        actionPose: { hipR: 1.2, kneeR: 0.2, torsoAngle: 0.4, shoulderL: -0.6 }
      },
      head_kick: {
        duration: 22, isAttack: true, damage: 15, vx: 2,
        windupPose: { hipR: -0.4, kneeR: 0.8, torsoAngle: -0.2 },
        actionPose: { hipR: 2.0, kneeR: 0.1, torsoAngle: 0.5, shoulderL: -1.0 }
      },
      leg_kick: {
        duration: 14, isAttack: true, damage: 6,
        windupPose: { hipR: -0.2, kneeR: 0.4 },
        actionPose: { hipR: 0.8, kneeR: 0.2, torsoAngle: 0.25 }
      },

      // === CAPOEIRA === (fluid, rhythmic movements)
      ginga: {
        duration: 30,
        windupPose: { hipL: 0.3, hipR: -0.2, shoulderL: -0.3, shoulderR: 0.3 },
        actionPose: { hipL: 0.7, hipR: -0.4, shoulderL: -0.7, shoulderR: 0.7, torsoAngle: 0.15, kneeL: 0.3, kneeR: 0.2 }
      },
      martelo: {
        duration: 22, isAttack: true, damage: 12, vx: 2,
        windupPose: { hipR: -0.3, torsoAngle: -0.2 },
        actionPose: { hipR: 1.6, kneeR: 0.2, torsoAngle: 0.7, shoulderL: -1.2, shoulderR: 0.8 }
      },
      armada: {
        duration: 26, isAttack: true, damage: 14, vx: 3,
        windupPose: { torsoAngle: -0.3, hipR: -0.4 },
        actionPose: { torsoAngle: 1.4, hipR: 1.8, hipL: -0.4, shoulderL: -1.0, shoulderR: 1.0 }
      },
      au: {
        duration: 32, vx: 8, isBlock: true,
        windupPose: { shoulderL: -1.0, shoulderR: 1.0, kneeL: 0.6, kneeR: 0.6 },
        actionPose: { torsoAngle: 1.57, shoulderL: -1.8, shoulderR: 1.8, hipL: 1.0, hipR: -1.0 }
      },
      esquiva: {
        duration: 16, isBlock: true,
        windupPose: { kneeL: 0.8, kneeR: 0.4 },
        actionPose: { kneeL: 1.8, kneeR: 0.7, torsoAngle: 0.5, headY: 30, shoulderL: 0.3, shoulderR: -0.3 }
      },
      rasteira: {
        duration: 20, isAttack: true, damage: 7,
        windupPose: { kneeL: 1.0, kneeR: 1.0, headY: 15 },
        actionPose: { hipR: 1.7, kneeR: 0.1, headY: 35, torsoAngle: 0.8, kneeL: 1.4 }
      },
      ponteira: {
        duration: 18, isAttack: true, damage: 10, vx: 3,
        windupPose: { hipR: -0.3, torsoAngle: -0.15 },
        actionPose: { hipR: 1.9, kneeR: 0, torsoAngle: 0.4, shoulderL: -0.8 }
      },
      macaco: {
        duration: 28, vx: -5, vy: -16, isBlock: true,
        windupPose: { kneeL: 0.8, kneeR: 0.8, shoulderL: -0.6, shoulderR: -0.6 },
        actionPose: { torsoAngle: -2.8, shoulderL: -1.5, shoulderR: -1.5, hipL: 1.2, hipR: 1.2 }
      },

      // === SPECIAL === (dramatic signature moves)
      parry: {
        duration: 10, isBlock: true,
        windupPose: { shoulderR: 0.2, elbowR: 0.8 },
        actionPose: { shoulderR: 0.7, elbowR: 1.5, torsoAngle: -0.15, shoulderL: -0.4 }
      },
      clinch: {
        duration: 15, vx: 2,
        windupPose: { shoulderL: 0.4, shoulderR: 0.4 },
        actionPose: { shoulderL: 1.0, shoulderR: 1.0, elbowL: 1.8, elbowR: 1.8, torsoAngle: 0.1 }
      },
      rising_punch: {
        duration: 20, isAttack: true, damage: 11, vy: -8,
        windupPose: { shoulderR: 0.4, elbowR: 2.0, kneeL: 0.6, kneeR: 0.6 },
        actionPose: { shoulderR: -1.8, elbowR: 0.2, torsoAngle: -0.3, headY: -10 }
      },
      spinning_backfist: {
        duration: 20, isAttack: true, damage: 10, vx: 2,
        windupPose: { torsoAngle: -0.5, shoulderR: -0.3 },
        actionPose: { torsoAngle: 1.8, shoulderR: 1.2, elbowR: 0.3, shoulderL: -0.8 }
      },
      flying_approach: {
        duration: 30, vx: 10, vy: -16,
        windupPose: { hipL: 0.4, shoulderL: -0.8, shoulderR: 0.8 },
        actionPose: { hipL: 0.7, hipR: -0.7, shoulderL: -1.5, shoulderR: 1.5, torsoAngle: 0.2 }
      },
      superman_dive: {
        duration: 28, vx: 16, vy: -10, isAttack: true, damage: 14,
        windupPose: { shoulderL: -0.8, shoulderR: -0.8, hipR: 0.4 },
        actionPose: { shoulderL: -1.8, shoulderR: -1.8, elbowL: 0, elbowR: 0, hipL: 0.5, hipR: 0.5, torsoAngle: 0.5 }
      },
      jump_spin: {
        duration: 26, vy: -18,
        windupPose: { kneeL: 0.6, kneeR: 0.6, shoulderL: -0.5, shoulderR: 0.5 },
        actionPose: { torsoAngle: 6.28, hipL: 0.4, hipR: -0.4 }
      },
      landing_strike: {
        duration: 16, isAttack: true, damage: 12, vy: 8,
        windupPose: { hipL: 0.5, kneeL: 0.5, shoulderR: 0.6 },
        actionPose: { shoulderR: 1.4, elbowR: 0.2, hipL: 1.0, kneeL: 1.0, torsoAngle: 0.3 }
      },

      // === TRAINING === (martial arts forms)
      crane_stance: {
        duration: 40,
        windupPose: { hipL: 0.8, kneeL: 1.2, shoulderL: -1.0, shoulderR: 1.0 },
        actionPose: { hipL: 1.5, kneeL: 2.2, shoulderL: -1.8, shoulderR: 1.8, headTilt: 0.1, elbowL: 0.8, elbowR: -0.8 }
      },
      meditation: {
        duration: 60,
        actionPose: { kneeL: 2.0, kneeR: 2.0, hipL: 0.8, hipR: -0.8, shoulderL: 0.4, shoulderR: -0.4, elbowL: 1.5, elbowR: -1.5, headTilt: 0.25 }
      },
      shadowbox_combo: {
        duration: 50, isAttack: true,
        windupPose: { shoulderR: 0.4, elbowR: 1.5 },
        actionPose: { shoulderR: 1.0, elbowR: 0.2, torsoAngle: 0.25, hipL: 0.4 }
      }
    };
  }

  getAttackHitbox() {
    if (!this.attacking || this.attackFrame === 0) return null;

    const move = this.currentMove;
    if (!move) return null;

    // Determine hitbox position based on move type
    const isKick = move.name.includes('kick') || move.name.includes('knee') ||
                   move.name.includes('sweep') || move.name.includes('martelo') ||
                   move.name.includes('armada') || move.name.includes('rasteira');

    let hx, hy, radius;
    if (isKick) {
      // Foot position - scaled to larger body
      hx = this.x + this.facing * (this.legLength * 0.8 + this.pose.hipR * 30);
      hy = this.y - 10 + this.pose.kneeR * 15;
      radius = 35;
    } else {
      // Hand position - scaled to larger body
      hx = this.x + this.facing * (this.armLength * 0.9 + this.pose.shoulderR * 20);
      hy = this.y - this.bodyLength * 0.8 + this.pose.elbowR * 8;
      radius = 30;
    }

    return {
      x: hx, y: hy, radius: radius,
      damage: move.damage || 8,
      knockback: (move.damage || 8) * 0.4
    };
  }

  takeDamage(amount, knockback, attackerX) {
    if (this.invincible > 0 || this.dead) return false;
    if (this.blocking) {
      amount *= 0.2;
      knockback *= 0.3;
      effects.addBlockSpark(this.x, this.y - this.bodyLength * 0.6);
      return false;
    }

    this.health -= amount;
    this.stunned = Math.min(amount * 2, 30);
    this.invincible = 10;

    // Knockback
    const dir = this.x > attackerX ? 1 : -1;
    this.vx = dir * knockback;
    this.vy = -knockback * 0.5;
    this.grounded = false;

    // Hit effect - scaled to fighter size
    effects.addImpact(this.x, this.y - this.bodyLength * 0.6, amount > 10 ? 'heavy' : 'light');
    camera.shake = Math.min(camera.shake + amount * 0.8, 20);

    // Slow motion on big hits
    if (amount > 12 && features.intensity.level === "bullet_time") {
      slowMotion.active = true;
      slowMotion.factor = 0.3;
      slowMotion.duration = 20;
    }

    // Cancel current move
    this.currentMove = null;
    this.moveQueue = [];
    this.attacking = false;

    // Hit stun pose
    this.setPose({
      torsoAngle: -0.3 * dir,
      headTilt: 0.2 * dir,
      shoulderL: 0.5, shoulderR: -0.5
    }, 5, easeOutElastic);

    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }

    return true;
  }

  die() {
    this.dead = true;
    this.currentMove = null;
    this.moveQueue = [];

    // Death pose
    this.setPose({
      torsoAngle: 0.8,
      headTilt: 0.5,
      shoulderL: 1.2, shoulderR: 0.8,
      elbowL: 0.5, elbowR: 0.5,
      hipL: 0.3, hipR: -0.2,
      kneeL: 0.4, kneeR: 0.3
    }, 30, easeOutQuart);
  }

  updateDead(groundY) {
    // Fall physics
    if (!this.grounded) {
      this.vy += 0.8;
      this.y += this.vy;
      this.x += this.vx;
      this.vx *= 0.95;

      if (this.y >= groundY) {
        this.y = groundY;
        this.vy = 0;
        this.grounded = true;
        camera.shake = 5;
      }
    }

    this.updatePose(1);
  }

  setVictory() {
    this.winner = true;
    this.currentMove = null;
    this.moveQueue = [];

    const poses = [
      { // Fist pump
        shoulderR: -2.5, elbowR: -1.5,
        shoulderL: 0.3, hipL: 0.1, hipR: -0.1,
        headTilt: -0.2
      },
      { // Bow
        torsoAngle: 0.6, headTilt: 0.4,
        shoulderL: 0.5, shoulderR: -0.5,
        hipL: 0.3, hipR: -0.3
      },
      { // Arms crossed
        shoulderL: 0.8, shoulderR: -0.8,
        elbowL: 2.2, elbowR: -2.2,
        headTilt: 0.1
      },
      { // Crane
        hipL: 1.5, kneeL: 2.0,
        shoulderL: -1.5, shoulderR: 1.5,
        elbowL: 0.5, elbowR: -0.5
      }
    ];

    this.setPose(rndChoice(poses), 40, easeOutBack);
  }

  updateVictory() {
    this.updatePose(1);
    // Gentle idle motion
    this.breathCycle += 0.03;
  }

  findNearestOpponent(fighters) {
    let nearest = null;
    let minDist = Infinity;
    for (let f of fighters) {
      if (f.id !== this.id && !f.dead) {
        const d = Math.abs(this.x - f.x);
        if (d < minDist) {
          minDist = d;
          nearest = f;
        }
      }
    }
    return nearest;
  }

  render() {
    // Render afterimages first
    for (let ai of this.afterimages) {
      this.renderBody(ai.x, ai.y, ai.pose, ai.facing, ai.alpha);
    }

    // Render main body
    this.renderBody(this.x, this.y, this.pose, this.facing, 255);
  }

  renderBody(x, y, pose, facing, alpha) {
    push();
    translate(x, y);
    scale(facing, 1);

    // Glow effect
    if (features.fx.type === "auras" && alpha === 255) {
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = `rgba(${this.glowColor[0]},${this.glowColor[1]},${this.glowColor[2]},0.5)`;
    }

    stroke(this.color[0], this.color[1], this.color[2], alpha);
    strokeWeight(this.thickness);
    noFill();

    // Invincibility flash
    if (this.invincible > 0 && frameCount % 4 < 2) {
      stroke(255, 255, 255, alpha * 0.7);
    }

    // Stun effect
    if (this.stunned > 0) {
      stroke(255, 150, 150, alpha);
    }

    // Dead fade
    if (this.dead && !this.winner) {
      stroke(this.color[0], this.color[1], this.color[2], alpha * 0.4);
    }

    const headY = -this.bodyLength - this.headSize + (pose.headY || 0);

    // Head
    push();
    translate(pose.headX || 0, headY);
    rotate(pose.headTilt || 0);
    ellipse(0, 0, this.headSize * 2, this.headSize * 2);
    pop();

    // Torso
    push();
    rotate(pose.torsoAngle || 0);
    line(0, -this.bodyLength, 0, 0);

    // Arms
    const shoulderY = -this.bodyLength;

    // Left arm
    push();
    translate(0, shoulderY);
    rotate(pose.shoulderL || 0);
    line(0, 0, this.armLength * 0.5, 0);
    translate(this.armLength * 0.5, 0);
    rotate(pose.elbowL || 0);
    line(0, 0, this.armLength * 0.5, 0);
    pop();

    // Right arm
    push();
    translate(0, shoulderY);
    rotate(pose.shoulderR || 0);
    line(0, 0, this.armLength * 0.5, 0);
    translate(this.armLength * 0.5, 0);
    rotate(pose.elbowR || 0);
    line(0, 0, this.armLength * 0.5, 0);
    pop();

    pop(); // End torso rotation

    // Legs
    // Left leg
    push();
    rotate(pose.hipL || 0);
    line(0, 0, this.legLength * 0.5, 0);
    translate(this.legLength * 0.5, 0);
    rotate(pose.kneeL || 0);
    line(0, 0, this.legLength * 0.5, 0);
    pop();

    // Right leg
    push();
    rotate(pose.hipR || 0);
    line(0, 0, this.legLength * 0.5, 0);
    translate(this.legLength * 0.5, 0);
    rotate(pose.kneeR || 0);
    line(0, 0, this.legLength * 0.5, 0);
    pop();

    drawingContext.shadowBlur = 0;
    pop();

    // Health bar (if in battle mode)
    if (!features.soloTraining && alpha === 255) {
      this.renderHealthBar(x, y);
    }
  }

  renderHealthBar(x, y) {
    const barW = 60;
    const barH = 6;
    const bx = x - barW / 2;
    const by = y - this.bodyLength - this.headSize * 2 - 20;

    noStroke();
    fill(20, 20, 25, 200);
    rect(bx - 1, by - 1, barW + 2, barH + 2, 2);

    const healthPct = this.health / this.maxHealth;
    const hcolor = healthPct > 0.6 ? [80, 200, 120] :
                   healthPct > 0.3 ? [220, 200, 80] : [220, 80, 80];
    fill(hcolor[0], hcolor[1], hcolor[2]);
    rect(bx, by, barW * healthPct, barH, 1);
  }
}

// ============================================================================
// ENVIRONMENT - Refined Backgrounds
// ============================================================================

class Environment {
  constructor(config) {
    this.config = config;
    this.groundY = 0;
    this.time = 0;
    this.particles = [];
    this.generateParticles();
  }

  generateParticles() {
    const type = this.config.particles;
    const count = type === "rain" ? 100 : type === "data" ? 50 : 30;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: rnd(width),
        y: rnd(height),
        vx: rnd(-0.5, 0.5),
        vy: type === "rain" ? rnd(8, 12) : rnd(-1, 1),
        size: rnd(2, 5),
        alpha: rnd(50, 150),
        char: type === "data" ? String.fromCharCode(rndInt(33, 126)) : null
      });
    }
  }

  update() {
    this.time++;

    // Update particles
    for (let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.y > height) { p.y = -10; p.x = rnd(width); }
      if (p.y < -20) { p.y = height + 10; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      // Data particles change characters
      if (p.char && rnd() < 0.02) {
        p.char = String.fromCharCode(rndInt(33, 126));
      }
    }
  }

  render(camX = 0) {
    this.drawBackground();
    this.drawParallaxLayers(camX);
    this.drawParticles();
    this.drawGround();
  }

  drawBackground() {
    const bg = this.config.bg;

    // Gradient background
    for (let y = 0; y < height; y++) {
      const t = y / height;
      const r = lerp(bg.top[0], bg.bottom[0], t);
      const g = lerp(bg.top[1], bg.bottom[1], t);
      const b = lerp(bg.top[2], bg.bottom[2], t);

      stroke(r, g, b);
      line(0, y, width, y);
    }

    // Atmospheric effects based on environment
    this.drawAtmosphere();
  }

  drawAtmosphere() {
    const name = this.config.name;

    if (name === "Dojo") {
      // Warm light rays
      noStroke();
      for (let i = 0; i < 3; i++) {
        const x = width * 0.2 + i * width * 0.3;
        fill(255, 240, 200, 10);
        beginShape();
        vertex(x, 0);
        vertex(x + 100, height * 0.7);
        vertex(x - 50, height * 0.7);
        endShape(CLOSE);
      }
    } else if (name === "Street") {
      // Fog at bottom
      for (let y = height * 0.6; y < height; y++) {
        const t = (y - height * 0.6) / (height * 0.4);
        fill(40, 50, 70, t * 30);
        noStroke();
        rect(0, y, width, 1);
      }
    } else if (name === "Simulation") {
      // Scan lines
      stroke(0, 255, 200, 5);
      for (let y = 0; y < height; y += 3) {
        line(0, y, width, y);
      }
      // Vignette
      this.drawVignette(0.6);
    } else if (name === "Nature") {
      // Sun glow
      noStroke();
      for (let r = 150; r > 0; r -= 10) {
        fill(255, 240, 200, (150 - r) / 150 * 20);
        ellipse(width * 0.8, height * 0.15, r * 2);
      }
    } else if (name === "Microchip") {
      // Electric glow
      this.drawVignette(0.5, [0, 50, 30]);
    } else if (name === "Inside Program") {
      // Code ambience
      this.drawVignette(0.7, [20, 10, 40]);
    } else if (name === "OS Desktop") {
      // Screen glare
      noStroke();
      fill(255, 255, 255, 5);
      ellipse(width * 0.3, height * 0.3, 400, 300);
    }
  }

  drawVignette(strength = 0.5, color = [0, 0, 0]) {
    const cx = width / 2, cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    noStroke();
    for (let i = 0; i < 20; i++) {
      const t = i / 20;
      const alpha = t * t * strength * 100;
      fill(color[0], color[1], color[2], alpha);
      const r = maxDist * (1 - t * 0.5);
      ellipse(cx, cy, r * 2, r * 2);
    }
  }

  drawParallaxLayers(camX) {
    const elements = this.config.elements;

    // Back layer (0.2 parallax)
    this.drawLayer(elements[0], camX * 0.2, 0.5);

    // Mid layer (0.5 parallax)
    this.drawLayer(elements[1], camX * 0.5, 0.7);

    // Front layer (0.8 parallax)
    this.drawLayer(elements[2], camX * 0.8, 0.9);
  }

  drawLayer(type, offsetX, depth) {
    const accent = this.config.accent;
    const alpha = depth * 180;

    push();
    translate(-offsetX % width, 0);

    switch(type) {
      case "wooden_beams":
        stroke(60, 40, 25, alpha);
        strokeWeight(8);
        for (let i = 0; i < 5; i++) {
          const x = i * 180 + 50;
          line(x, 0, x, height * 0.85);
          // Cross beams
          line(x - 30, height * 0.3, x + 30, height * 0.3);
        }
        break;

      case "paper_walls":
        noStroke();
        fill(240, 235, 220, alpha * 0.4);
        for (let i = 0; i < 4; i++) {
          rect(i * 200 + 80, height * 0.1, 120, height * 0.6, 3);
        }
        // Shoji grid
        stroke(80, 60, 40, alpha * 0.3);
        strokeWeight(1);
        for (let i = 0; i < 4; i++) {
          const bx = i * 200 + 80;
          for (let gx = 0; gx < 120; gx += 30) {
            line(bx + gx, height * 0.1, bx + gx, height * 0.7);
          }
          for (let gy = height * 0.1; gy < height * 0.7; gy += 40) {
            line(bx, gy, bx + 120, gy);
          }
        }
        break;

      case "lanterns":
        for (let i = 0; i < 6; i++) {
          const lx = i * 150 + 75;
          const ly = height * 0.25 + Math.sin(this.time * 0.02 + i) * 5;
          // String
          stroke(50, 40, 30, alpha);
          strokeWeight(1);
          line(lx, 0, lx, ly - 20);
          // Lantern glow
          noStroke();
          fill(255, 200, 150, alpha * 0.3);
          ellipse(lx, ly, 40, 50);
          // Lantern body
          fill(200, 50, 30, alpha);
          ellipse(lx, ly, 25, 35);
          fill(255, 220, 180, alpha * 0.8);
          ellipse(lx, ly, 15, 20);
        }
        break;

      case "buildings":
        noStroke();
        for (let i = 0; i < 6; i++) {
          const bx = i * 160;
          const bh = rnd(200, 400);
          fill(25, 30, 45, alpha);
          rect(bx, height - bh - 60, 140, bh);
          // Windows
          fill(accent[0], accent[1], accent[2], alpha * (0.3 + Math.sin(this.time * 0.05 + i) * 0.2));
          for (let wy = height - bh - 40; wy < height - 80; wy += 25) {
            for (let wx = bx + 15; wx < bx + 130; wx += 20) {
              if (rnd() > 0.3) rect(wx, wy, 12, 15);
            }
          }
        }
        break;

      case "neon_signs":
        strokeWeight(3);
        for (let i = 0; i < 4; i++) {
          const sx = i * 200 + 100;
          const sy = height * 0.3 + rnd(50);
          const flicker = Math.sin(this.time * 0.1 + i * 2) > 0.3 ? 1 : 0.3;
          stroke(accent[0], accent[1], accent[2], alpha * flicker);
          // Random kanji-like shapes
          line(sx, sy, sx + 20, sy);
          line(sx + 10, sy, sx + 10, sy + 25);
          line(sx, sy + 25, sx + 20, sy + 25);
        }
        break;

      case "steam_vents":
        noStroke();
        for (let i = 0; i < 5; i++) {
          const vx = i * 180 + 90;
          for (let j = 0; j < 8; j++) {
            const py = height - 80 - j * 15 - Math.sin(this.time * 0.05 + i) * 10;
            const px = vx + Math.sin(this.time * 0.03 + j) * 10;
            fill(200, 200, 210, alpha * 0.2 * (1 - j / 8));
            ellipse(px, py, 20 + j * 3, 15 + j * 2);
          }
        }
        break;

      case "grid_floor":
        stroke(accent[0], accent[1], accent[2], alpha * 0.3);
        strokeWeight(1);
        // Perspective grid
        for (let i = 0; i <= 20; i++) {
          const x = i * width / 20;
          line(x, height * 0.5, width/2 + (x - width/2) * 0.3, height);
        }
        for (let i = 0; i < 10; i++) {
          const y = height * 0.5 + i * (height * 0.5) / 10;
          const squeeze = 1 - (y - height * 0.5) / (height * 0.5) * 0.7;
          line(width/2 - width/2 * squeeze, y, width/2 + width/2 * squeeze, y);
        }
        break;

      case "data_pillars":
        for (let i = 0; i < 8; i++) {
          const px = i * 120 + 60;
          const ph = 150 + Math.sin(this.time * 0.02 + i) * 30;
          // Data stream
          stroke(accent[0], accent[1], accent[2], alpha * 0.4);
          strokeWeight(2);
          for (let y = height - 60; y > height - 60 - ph; y -= 8) {
            if (Math.sin(y * 0.1 + this.time * 0.1 + i) > 0) {
              line(px - 5, y, px + 5, y);
            }
          }
        }
        break;

      case "code_rain":
        textSize(10);
        textFont('monospace');
        fill(accent[0], accent[1], accent[2], alpha * 0.5);
        noStroke();
        for (let i = 0; i < 15; i++) {
          const cx = i * 60 + 30;
          for (let j = 0; j < 12; j++) {
            const cy = ((this.time * 2 + j * 30 + i * 17) % (height + 50)) - 25;
            const char = String.fromCharCode(0x30A0 + ((this.time + i + j) % 96));
            text(char, cx, cy);
          }
        }
        break;

      case "mountains":
        noStroke();
        fill(60, 90, 70, alpha);
        beginShape();
        vertex(0, height * 0.6);
        for (let x = 0; x <= width + 100; x += 50) {
          const h = noise(x * 0.003 + depth) * 200;
          vertex(x, height * 0.6 - h);
        }
        vertex(width + 100, height * 0.6);
        endShape(CLOSE);
        break;

      case "trees":
        for (let i = 0; i < 8; i++) {
          const tx = i * 120 + 40;
          const th = 80 + rnd(60);
          // Trunk
          stroke(60, 45, 30, alpha);
          strokeWeight(6);
          line(tx, height - 60, tx, height - 60 - th * 0.4);
          // Canopy
          noStroke();
          fill(40, 80, 45, alpha);
          ellipse(tx, height - 60 - th * 0.6, th * 0.6, th * 0.8);
          fill(50, 100, 55, alpha * 0.7);
          ellipse(tx - 10, height - 60 - th * 0.5, th * 0.4, th * 0.5);
        }
        break;

      case "clouds":
        noStroke();
        fill(255, 255, 255, alpha * 0.4);
        for (let i = 0; i < 5; i++) {
          const cx = (i * 200 + this.time * 0.2) % (width + 200) - 100;
          const cy = height * 0.15 + i * 20;
          ellipse(cx, cy, 100, 40);
          ellipse(cx + 30, cy - 10, 60, 35);
          ellipse(cx - 25, cy + 5, 50, 30);
        }
        break;

      case "circuits":
        stroke(accent[0], accent[1], accent[2], alpha * 0.4);
        strokeWeight(1);
        for (let i = 0; i < 10; i++) {
          let cx = i * 100;
          let cy = height * 0.3 + rnd(height * 0.4);
          beginShape();
          noFill();
          vertex(cx, cy);
          for (let j = 0; j < 5; j++) {
            cx += rndChoice([20, 20, 0]);
            cy += rndChoice([0, 20, -20]);
            vertex(cx, cy);
          }
          endShape();
        }
        // Nodes
        fill(accent[0], accent[1], accent[2], alpha * 0.6);
        noStroke();
        for (let i = 0; i < 15; i++) {
          ellipse(rnd(width), rnd(height * 0.3, height * 0.7), 4, 4);
        }
        break;

      case "capacitors":
        noStroke();
        for (let i = 0; i < 6; i++) {
          const cx = i * 150 + 50;
          const cy = height * 0.4 + rnd(100);
          fill(40, 40, 50, alpha);
          rect(cx, cy, 20, 40, 3);
          fill(accent[0], accent[1], accent[2], alpha * 0.5);
          rect(cx + 3, cy + 5, 14, 8);
        }
        break;

      case "traces":
        stroke(accent[0], accent[1], accent[2], alpha * 0.3);
        strokeWeight(2);
        for (let y = height * 0.2; y < height * 0.8; y += 30) {
          line(0, y, width, y);
        }
        break;

      case "code_blocks":
        noStroke();
        fill(accent[0], accent[1], accent[2], alpha * 0.15);
        for (let i = 0; i < 8; i++) {
          const bx = i * 120 + 20;
          const by = height * 0.2 + rnd(height * 0.5);
          const bw = 60 + rnd(40);
          rect(bx, by, bw, 20, 3);
          fill(accent[0], accent[1], accent[2], alpha * 0.1);
          rect(bx + 10, by + 25, bw - 20, 15, 2);
        }
        break;

      case "brackets":
        stroke(accent[0], accent[1], accent[2], alpha * 0.4);
        strokeWeight(3);
        noFill();
        for (let i = 0; i < 5; i++) {
          const bx = i * 180 + 50;
          const by = height * 0.3 + rnd(100);
          // Opening bracket
          beginShape();
          vertex(bx + 15, by);
          vertex(bx, by + 20);
          vertex(bx, by + 60);
          vertex(bx + 15, by + 80);
          endShape();
        }
        break;

      case "variables":
        textSize(12);
        textFont('monospace');
        fill(accent[0], accent[1], accent[2], alpha * 0.4);
        noStroke();
        const vars = ['x', 'y', 'i', 'n', 'fn', 'obj', 'arr', 'ptr'];
        for (let i = 0; i < 10; i++) {
          const vx = rnd(width);
          const vy = rnd(height * 0.2, height * 0.7);
          text(rndChoice(vars) + ' = ' + rndInt(0, 255), vx, vy);
        }
        break;

      case "windows":
        noStroke();
        for (let i = 0; i < 4; i++) {
          const wx = i * 200 + 30;
          const wy = height * 0.15 + i * 40;
          const ww = 150;
          const wh = 100;
          // Window shadow
          fill(0, 0, 0, alpha * 0.2);
          rect(wx + 5, wy + 5, ww, wh, 5);
          // Window body
          fill(240, 240, 245, alpha * 0.9);
          rect(wx, wy, ww, wh, 5);
          // Title bar
          fill(0, 100, 200, alpha);
          rect(wx, wy, ww, 20, 5, 5, 0, 0);
          // Buttons
          fill(255, 95, 86, alpha); ellipse(wx + ww - 12, wy + 10, 8, 8);
          fill(255, 189, 46, alpha); ellipse(wx + ww - 25, wy + 10, 8, 8);
          fill(39, 201, 63, alpha); ellipse(wx + ww - 38, wy + 10, 8, 8);
        }
        break;

      case "icons":
        noStroke();
        for (let i = 0; i < 8; i++) {
          const ix = i * 90 + 40;
          const iy = height - 120;
          fill(accent[0], accent[1], accent[2], alpha * 0.8);
          rect(ix, iy, 50, 50, 8);
          fill(255, 255, 255, alpha * 0.9);
          rect(ix + 10, iy + 10, 30, 30, 4);
        }
        break;

      case "cursor":
        const cx = width * 0.6 + Math.sin(this.time * 0.02) * 100;
        const cy = height * 0.4 + Math.cos(this.time * 0.015) * 50;
        fill(255, 255, 255, alpha);
        noStroke();
        beginShape();
        vertex(cx, cy);
        vertex(cx, cy + 18);
        vertex(cx + 5, cy + 14);
        vertex(cx + 9, cy + 22);
        vertex(cx + 12, cy + 21);
        vertex(cx + 8, cy + 13);
        vertex(cx + 13, cy + 13);
        endShape(CLOSE);
        break;
    }

    pop();
  }

  drawParticles() {
    const type = this.config.particles;
    const accent = this.config.accent;

    for (let p of this.particles) {
      if (type === "rain") {
        stroke(180, 200, 220, p.alpha);
        strokeWeight(1);
        line(p.x, p.y, p.x + p.vx * 2, p.y + p.vy * 2);
      } else if (type === "data") {
        fill(accent[0], accent[1], accent[2], p.alpha);
        noStroke();
        textSize(10);
        text(p.char, p.x, p.y);
      } else if (type === "dust" || type === "leaves") {
        noStroke();
        fill(200, 180, 150, p.alpha * 0.5);
        ellipse(p.x, p.y, p.size, p.size);
      } else if (type === "sparks") {
        stroke(accent[0], accent[1], accent[2], p.alpha);
        strokeWeight(2);
        point(p.x, p.y);
      } else if (type === "syntax") {
        fill(accent[0], accent[1], accent[2], p.alpha * 0.6);
        noStroke();
        textSize(8);
        text(rndChoice(['{', '}', '(', ')', ';', '=', '+', '-']), p.x, p.y);
      } else if (type === "pixels") {
        noStroke();
        fill(rnd(200, 255), rnd(200, 255), rnd(200, 255), p.alpha * 0.3);
        rect(p.x, p.y, 4, 4);
      }
    }
  }

  drawGround() {
    const floor = this.config.floor;
    this.groundY = height - 80;  // Room for larger fighters

    noStroke();

    // Main floor
    fill(floor.main[0], floor.main[1], floor.main[2]);
    rect(0, this.groundY, width, height - this.groundY);

    // Floor texture
    for (let x = 0; x < width; x += 8) {
      for (let y = this.groundY; y < height; y += 8) {
        if (noise(x * 0.05, y * 0.05) > 0.5) {
          fill(floor.highlight[0], floor.highlight[1], floor.highlight[2], 50);
          rect(x, y, 6, 6);
        }
      }
    }

    // Ground line highlight
    stroke(floor.highlight[0], floor.highlight[1], floor.highlight[2], 150);
    strokeWeight(2);
    line(0, this.groundY, width, this.groundY);

    // Shadow
    noStroke();
    for (let i = 0; i < 10; i++) {
      fill(floor.shadow[0], floor.shadow[1], floor.shadow[2], 30 - i * 3);
      rect(0, this.groundY + i * 2, width, 2);
    }
  }

  getGroundY() {
    return this.groundY;
  }
}

// ============================================================================
// EFFECTS MANAGER
// ============================================================================

class EffectsManager {
  constructor() {
    this.impacts = [];
    this.trails = [];
    this.windups = [];
    this.blockSparks = [];
  }

  addImpact(x, y, type = 'light') {
    const size = type === 'heavy' ? 60 : 35;
    this.impacts.push({
      x, y, type,
      radius: 5,
      maxRadius: size,
      alpha: 255,
      rays: type === 'heavy' ? 8 : 5
    });
  }

  addWindup(x, y) {
    this.windups.push({
      x, y,
      radius: 20,
      alpha: 100
    });
  }

  addBlockSpark(x, y) {
    for (let i = 0; i < 5; i++) {
      this.blockSparks.push({
        x, y,
        vx: rnd(-3, 3),
        vy: rnd(-5, -2),
        alpha: 255,
        size: rnd(2, 5)
      });
    }
  }

  addTrail(x, y, color) {
    this.trails.push({
      x, y, color,
      alpha: 150,
      size: 12
    });
  }

  update() {
    // Impacts
    for (let i = this.impacts.length - 1; i >= 0; i--) {
      const imp = this.impacts[i];
      imp.radius += (imp.maxRadius - imp.radius) * 0.3;
      imp.alpha -= 20;
      if (imp.alpha <= 0) this.impacts.splice(i, 1);
    }

    // Windups
    for (let i = this.windups.length - 1; i >= 0; i--) {
      const w = this.windups[i];
      w.radius -= 2;
      w.alpha -= 15;
      if (w.alpha <= 0 || w.radius <= 0) this.windups.splice(i, 1);
    }

    // Block sparks
    for (let i = this.blockSparks.length - 1; i >= 0; i--) {
      const s = this.blockSparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.3;
      s.alpha -= 15;
      if (s.alpha <= 0) this.blockSparks.splice(i, 1);
    }

    // Trails
    for (let i = this.trails.length - 1; i >= 0; i--) {
      const t = this.trails[i];
      t.alpha -= 12;
      t.size *= 0.9;
      if (t.alpha <= 0) this.trails.splice(i, 1);
    }
  }

  render() {
    // Windups
    for (let w of this.windups) {
      noFill();
      stroke(255, 255, 255, w.alpha);
      strokeWeight(2);
      ellipse(w.x, w.y, w.radius * 2);
    }

    // Trails
    noStroke();
    for (let t of this.trails) {
      fill(t.color[0], t.color[1], t.color[2], t.alpha);
      ellipse(t.x, t.y, t.size);
    }

    // Impacts
    for (let imp of this.impacts) {
      push();
      translate(imp.x, imp.y);

      // Central flash
      noStroke();
      fill(255, 255, 220, imp.alpha * 0.8);
      ellipse(0, 0, imp.radius * 0.5);

      // Rays
      stroke(255, 255, 200, imp.alpha * 0.6);
      strokeWeight(2);
      for (let i = 0; i < imp.rays; i++) {
        const angle = (i / imp.rays) * TWO_PI + imp.radius * 0.05;
        const len = imp.radius * (imp.type === 'heavy' ? 1.2 : 0.8);
        line(0, 0, cos(angle) * len, sin(angle) * len);
      }

      // Ring
      noFill();
      stroke(255, 255, 255, imp.alpha * 0.4);
      strokeWeight(3);
      ellipse(0, 0, imp.radius * 2);

      pop();
    }

    // Block sparks
    noStroke();
    for (let s of this.blockSparks) {
      fill(255, 255, 200, s.alpha);
      ellipse(s.x, s.y, s.size);
    }
  }
}

// ============================================================================
// GLITCH EFFECTS
// ============================================================================

function applyGlitchEffects() {
  if (!features.glitch.active) return;

  const intensity = features.glitch.intensity;

  // Random glitch triggers
  if (rnd() < 0.05 * intensity) {
    // Color channel shift
    push();
    blendMode(ADD);
    tint(255, 0, 0, 30 * intensity);
    copy(canvas, rndInt(-10, 10) * intensity, 0, width, height, 0, 0, width, height);
    tint(0, 255, 0, 30 * intensity);
    copy(canvas, rndInt(-10, 10) * intensity, 0, width, height, 0, 0, width, height);
    pop();
  }

  if (rnd() < 0.03 * intensity) {
    // Scan line displacement
    const y = rndInt(0, height);
    const h = rndInt(5, 30) * intensity;
    copy(canvas, 0, y, width, h, rndInt(-20, 20) * intensity, y, width, h);
  }

  if (rnd() < 0.02 * intensity) {
    // Block corruption
    const bx = rndInt(0, width - 50);
    const by = rndInt(0, height - 50);
    const bw = rndInt(20, 80);
    const bh = rndInt(10, 40);
    copy(canvas, rndInt(0, width), rndInt(0, height), bw, bh, bx, by, bw, bh);
  }

  if (rnd() < 0.01 * intensity) {
    // Full frame tear
    const tearY = rndInt(height * 0.3, height * 0.7);
    copy(canvas, 0, tearY, width, height - tearY, rndInt(-30, 30) * intensity, tearY, width, height - tearY);
  }

  // Persistent noise overlay
  if (rnd() < 0.1) {
    loadPixels();
    for (let i = 0; i < pixels.length; i += 4 * rndInt(50, 200)) {
      if (rnd() < 0.3 * intensity) {
        pixels[i] = rndInt(0, 255);
        pixels[i + 1] = rndInt(0, 255);
        pixels[i + 2] = rndInt(0, 255);
      }
    }
    updatePixels();
  }
}

// ============================================================================
// MAIN GAME
// ============================================================================

function setup() {
  const holder = document.getElementById('sketch-holder');
  const size = holder ? holder.offsetWidth : 700;

  let cnv = createCanvas(size, size);
  if (holder) {
    cnv.parent('sketch-holder');
  }

  pixelDensity(1); // Keep at 1 for glitch effects to work

  generateFeatures();

  if (window.onFeaturesGenerated) {
    window.onFeaturesGenerated(features);
  }

  initializeGame();
}

function initializeGame() {
  R = initRandom(hash);
  for (let i = 0; i < 50; i++) R();

  // Create environment
  environment = new Environment(features.environment.config);

  // Create fighters
  fighters = [];
  const groundY = height - 80;  // More room for larger fighters
  const spacing = width / (features.fighters.count + 1);

  for (let i = 0; i < features.fighters.count; i++) {
    const x = spacing * (i + 1);
    const colorData = STICK_COLORS[i % STICK_COLORS.length];
    fighters.push(new StickFigure(x, groundY, colorData, i));
  }

  // Effects
  effects = new EffectsManager();

  // Reset state
  camera = { x: 0, y: 0, shake: 0, zoom: 1 };
  slowMotion = { active: false, factor: 1, duration: 0 };
  gameState = 'fighting';
  winner = null;
  victoryTimer = 0;
  globalTime = 0;
}

function draw() {
  globalTime++;

  // Time scale
  let dt = 1;
  if (slowMotion.active) {
    dt = slowMotion.factor;
    slowMotion.duration--;
    if (slowMotion.duration <= 0) {
      slowMotion.active = false;
      slowMotion.factor = 1;
    }
  }

  // Camera shake decay
  camera.shake *= 0.9;

  // Apply camera
  push();
  translate(width / 2, height / 2);
  if (camera.shake > 0.5) {
    translate(rnd(-camera.shake, camera.shake), rnd(-camera.shake, camera.shake));
  }
  translate(-width / 2, -height / 2);

  // Update & render environment
  environment.update();
  environment.render(camera.x);

  const groundY = environment.getGroundY();

  if (gameState === 'fighting') {
    // Combat collision detection
    for (let f of fighters) {
      const hitbox = f.getAttackHitbox();
      if (hitbox) {
        for (let other of fighters) {
          if (other.id !== f.id && !other.dead) {
            // Body center offset scales with fighter size
            const bodyCenterY = other.y - other.bodyLength * 0.6;
            const dx = hitbox.x - other.x;
            const dy = hitbox.y - bodyCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hitbox.radius + 25) {
              const hit = other.takeDamage(hitbox.damage, hitbox.knockback, f.x);
              if (hit) {
                f.attackFrame = 0; // Prevent multi-hit
                f.comboCount++;

                // Add trail effect on hit
                if (features.fx.type === "trails") {
                  effects.addTrail(hitbox.x, hitbox.y, f.color);
                }
              }
            }
          }
        }
      }
    }

    // Update fighters
    for (let f of fighters) {
      f.update(fighters, groundY, dt);
    }

    // Check victory
    const alive = fighters.filter(f => !f.dead);
    if (alive.length === 1 && features.fighters.count > 1) {
      winner = alive[0];
      winner.setVictory();
      gameState = 'victory';
      victoryTimer = 0;
    } else if (alive.length === 0 && features.fighters.count > 1) {
      gameState = 'victory';
    }
  } else {
    // Victory state
    for (let f of fighters) {
      f.update(fighters, groundY, dt);
    }
    victoryTimer++;
  }

  // Update effects
  effects.update();

  // Render fighters
  for (let f of fighters) {
    f.render();
  }

  // Render effects
  effects.render();

  pop(); // End camera transform

  // Glitch effects (after camera)
  applyGlitchEffects();

  // Victory overlay
  if (gameState === 'victory' && victoryTimer > 60) {
    drawVictoryOverlay();
  }
}

function drawVictoryOverlay() {
  // Darken
  noStroke();
  fill(0, 0, 0, min(victoryTimer - 60, 120));
  rect(0, 0, width, height);

  // Text
  textAlign(CENTER, CENTER);
  fill(255, 255, 255, min((victoryTimer - 60) * 4, 255));

  if (winner) {
    textSize(36);
    text("VICTORY", width / 2, height / 2 - 40);
    textSize(16);
    fill(winner.color[0], winner.color[1], winner.color[2]);
    text(winner.colorData.name + " Wins", width / 2, height / 2 + 10);
  } else {
    textSize(36);
    text("DRAW", width / 2, height / 2);
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('stick-arena-' + hash.slice(2, 10), 'png');
  }
  if (key === 'r' || key === 'R') {
    regenerate();
  }
}

function setHash(newHash) {
  hash = newHash;
  generateFeatures();
  initializeGame();
  if (window.onFeaturesGenerated) {
    window.onFeaturesGenerated(features);
  }
}

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  setHash(hash);
}

window.setHash = setHash;
window.regenerate = regenerate;
window.getFeatures = () => features;
