// Stick Arena - Hash-Based Stick Figure Combat
// Art Blocks compatible with tokenData.hash

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

// ============================================================================
// FEATURES
// ============================================================================

let features = {};

const ENVIRONMENTS = {
  dojo: {
    name: "Dojo",
    bgColor: [45, 35, 30],
    floorColor: [80, 60, 45],
    accentColor: [180, 50, 50],
    parallaxLayers: ["wooden_walls", "scrolls", "lanterns"],
    pixelSize: 4,
    lighting: "warm"
  },
  street: {
    name: "Street",
    bgColor: [25, 30, 45],
    floorColor: [60, 60, 65],
    accentColor: [255, 180, 50],
    parallaxLayers: ["buildings", "signs", "trash"],
    pixelSize: 3,
    lighting: "neon"
  },
  simulation: {
    name: "Simulation",
    bgColor: [5, 15, 25],
    floorColor: [20, 80, 60],
    accentColor: [0, 255, 200],
    parallaxLayers: ["grid", "data_streams", "nodes"],
    pixelSize: 2,
    lighting: "matrix"
  },
  nature: {
    name: "Nature",
    bgColor: [135, 180, 220],
    floorColor: [80, 140, 60],
    accentColor: [220, 200, 150],
    parallaxLayers: ["mountains", "trees", "grass"],
    pixelSize: 4,
    lighting: "natural"
  },
  chip: {
    name: "Computer Chip",
    bgColor: [15, 25, 15],
    floorColor: [30, 60, 35],
    accentColor: [200, 180, 100],
    parallaxLayers: ["circuits", "traces", "components"],
    pixelSize: 2,
    lighting: "electric"
  },
  program: {
    name: "Inside Program",
    bgColor: [20, 20, 30],
    floorColor: [40, 40, 60],
    accentColor: [100, 150, 255],
    parallaxLayers: ["code_blocks", "variables", "functions"],
    pixelSize: 3,
    lighting: "code"
  },
  desktop: {
    name: "OS Desktop",
    bgColor: [0, 120, 180],
    floorColor: [50, 50, 50],
    accentColor: [255, 255, 255],
    parallaxLayers: ["windows", "icons", "taskbar"],
    pixelSize: 4,
    lighting: "screen"
  }
};

const FIGHT_STYLES = ["aggressive", "defensive", "balanced", "acrobatic", "technical"];
const STICK_COLORS = [
  [20, 20, 20],      // Black
  [255, 255, 255],   // White
  [200, 50, 50],     // Red
  [50, 100, 200],    // Blue
  [50, 180, 80],     // Green
  [200, 150, 50],    // Gold
  [150, 50, 180],    // Purple
  [255, 150, 50],    // Orange
];

function generateFeatures() {
  R = initRandom(hash);

  // Environment
  const envRarity = rollRarity(0.50, 0.30, 0.15, 0.05);
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

  // Fighter count (legendary: solo training)
  const fighterRarity = rollRarity(0.60, 0.25, 0.12, 0.03);
  let fighterCount;
  if (fighterRarity === "legendary") {
    fighterCount = 1; // Solo training
  } else if (fighterRarity === "rare") {
    fighterCount = rndInt(3, 4);
  } else if (fighterRarity === "uncommon") {
    fighterCount = 3;
  } else {
    fighterCount = 2;
  }

  // Interactive objects
  const objectRarity = rollRarity(0.65, 0.20, 0.12, 0.03);
  let objectCount;
  if (objectRarity === "legendary") {
    objectCount = rndInt(4, 6);
  } else if (objectRarity === "rare") {
    objectCount = rndInt(2, 3);
  } else if (objectRarity === "uncommon") {
    objectCount = 1;
  } else {
    objectCount = 0;
  }

  // Fight intensity
  const intensityRarity = rollRarity(0.50, 0.30, 0.15, 0.05);
  let intensity;
  if (intensityRarity === "legendary") {
    intensity = "chaos";
  } else if (intensityRarity === "rare") {
    intensity = "intense";
  } else if (intensityRarity === "uncommon") {
    intensity = "fast";
  } else {
    intensity = "normal";
  }

  // Special effects
  const fxRarity = rollRarity(0.60, 0.25, 0.12, 0.03);
  let specialFX;
  if (fxRarity === "legendary") {
    specialFX = rndChoice(["trails", "impacts", "auras"]);
  } else if (fxRarity === "rare") {
    specialFX = rndChoice(["trails", "impacts"]);
  } else if (fxRarity === "uncommon") {
    specialFX = "impacts";
  } else {
    specialFX = "none";
  }

  // Choreography style
  const choreoStyle = rndChoice(["cinematic", "arcade", "realistic", "anime"]);

  // Pixel density
  const pixelDensity = rndChoice(["crisp", "normal", "chunky"]);

  features = {
    hash: hash,
    environment: { name: envName, config: ENVIRONMENTS[envName], rarity: envRarity },
    fighters: { count: fighterCount, rarity: fighterRarity },
    objects: { count: objectCount, rarity: objectRarity },
    intensity: { level: intensity, rarity: intensityRarity },
    fx: { type: specialFX, rarity: fxRarity },
    choreo: choreoStyle,
    pixels: pixelDensity,
    soloTraining: fighterCount === 1
  };

  return features;
}

// ============================================================================
// STICK FIGURE CLASS
// ============================================================================

class StickFigure {
  constructor(x, y, color, style, id) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.color = color;
    this.style = style;
    this.facing = id === 0 ? 1 : -1;

    // Body proportions
    this.headSize = 12;
    this.bodyLength = 35;
    this.armLength = 25;
    this.legLength = 30;
    this.thickness = 3;

    // Limb angles (in radians)
    this.pose = {
      headTilt: 0,
      torsoAngle: 0,
      leftArmUpper: -PI/4,
      leftArmLower: 0,
      rightArmUpper: PI/4,
      rightArmLower: 0,
      leftLegUpper: PI/8,
      leftLegLower: 0,
      rightLegUpper: -PI/8,
      rightLegLower: 0
    };

    // Target pose for interpolation
    this.targetPose = { ...this.pose };

    // Physics
    this.vx = 0;
    this.vy = 0;
    this.grounded = true;

    // Combat
    this.health = 100;
    this.maxHealth = 100;
    this.blocking = false;
    this.attacking = false;
    this.stunned = 0;
    this.invincible = 0;

    // Animation
    this.currentMove = null;
    this.moveTimer = 0;
    this.moveQueue = [];
    this.idleTimer = 0;

    // State
    this.dead = false;
    this.winner = false;
    this.victoryPose = null;
  }

  // Get world position of a joint
  getJointPos(joint) {
    const hipY = this.y;
    const shoulderY = hipY - this.bodyLength;
    const headY = shoulderY - this.headSize;

    switch(joint) {
      case 'head': return { x: this.x, y: headY };
      case 'shoulder': return { x: this.x, y: shoulderY };
      case 'hip': return { x: this.x, y: hipY };
      case 'leftHand': {
        const s = this.getJointPos('shoulder');
        const elbow = {
          x: s.x + cos(this.pose.leftArmUpper) * this.armLength * 0.5 * this.facing,
          y: s.y + sin(this.pose.leftArmUpper) * this.armLength * 0.5
        };
        return {
          x: elbow.x + cos(this.pose.leftArmUpper + this.pose.leftArmLower) * this.armLength * 0.5 * this.facing,
          y: elbow.y + sin(this.pose.leftArmUpper + this.pose.leftArmLower) * this.armLength * 0.5
        };
      }
      case 'rightHand': {
        const s = this.getJointPos('shoulder');
        const elbow = {
          x: s.x + cos(this.pose.rightArmUpper) * this.armLength * 0.5 * this.facing,
          y: s.y + sin(this.pose.rightArmUpper) * this.armLength * 0.5
        };
        return {
          x: elbow.x + cos(this.pose.rightArmUpper + this.pose.rightArmLower) * this.armLength * 0.5 * this.facing,
          y: elbow.y + sin(this.pose.rightArmUpper + this.pose.rightArmLower) * this.armLength * 0.5
        };
      }
      case 'leftFoot': {
        const h = this.getJointPos('hip');
        const knee = {
          x: h.x + cos(this.pose.leftLegUpper) * this.legLength * 0.5 * this.facing,
          y: h.y + sin(this.pose.leftLegUpper) * this.legLength * 0.5
        };
        return {
          x: knee.x + cos(this.pose.leftLegUpper + this.pose.leftLegLower) * this.legLength * 0.5 * this.facing,
          y: knee.y + sin(this.pose.leftLegUpper + this.pose.leftLegLower) * this.legLength * 0.5
        };
      }
      case 'rightFoot': {
        const h = this.getJointPos('hip');
        const knee = {
          x: h.x + cos(this.pose.rightLegUpper) * this.legLength * 0.5 * this.facing,
          y: h.y + sin(this.pose.rightLegUpper) * this.legLength * 0.5
        };
        return {
          x: knee.x + cos(this.pose.rightLegUpper + this.pose.rightLegLower) * this.legLength * 0.5 * this.facing,
          y: knee.y + sin(this.pose.rightLegUpper + this.pose.rightLegLower) * this.legLength * 0.5
        };
      }
    }
    return { x: this.x, y: this.y };
  }

  update(fighters, objects, groundY) {
    if (this.dead || this.winner) return;

    // Physics
    if (!this.grounded) {
      this.vy += 0.5; // Gravity
    }

    this.x += this.vx;
    this.y += this.vy;

    // Ground collision
    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.grounded = true;
    }

    // Friction
    this.vx *= 0.9;

    // Bounds
    this.x = constrain(this.x, 50, width - 50);

    // Update timers
    if (this.stunned > 0) this.stunned--;
    if (this.invincible > 0) this.invincible--;

    // Animation
    this.updateAnimation(fighters);

    // Interpolate pose
    for (let key in this.pose) {
      this.pose[key] = lerp(this.pose[key], this.targetPose[key], 0.2);
    }
  }

  updateAnimation(fighters) {
    this.moveTimer--;

    if (this.moveTimer <= 0 && !this.stunned) {
      // Pick next move
      if (this.moveQueue.length > 0) {
        this.executeMove(this.moveQueue.shift());
      } else {
        this.decideNextMove(fighters);
      }
    }

    // Idle animation
    this.idleTimer++;
    if (!this.currentMove) {
      this.targetPose.leftArmUpper = -PI/4 + sin(this.idleTimer * 0.05) * 0.1;
      this.targetPose.rightArmUpper = PI/4 + sin(this.idleTimer * 0.05 + PI) * 0.1;
    }
  }

  decideNextMove(fighters) {
    const opponent = this.findNearestOpponent(fighters);

    if (!opponent) {
      // Solo training
      this.queueTrainingMove();
      return;
    }

    const dist = abs(this.x - opponent.x);
    const intensityMod = features.intensity.level === "chaos" ? 0.3 :
                         features.intensity.level === "intense" ? 0.5 :
                         features.intensity.level === "fast" ? 0.7 : 1;

    // Face opponent
    this.facing = this.x < opponent.x ? 1 : -1;

    if (dist > 100) {
      // Approach
      this.queueMove(rndChoice(["walk", "dash", "jump_forward"]));
    } else if (dist > 50) {
      // Attack range - mix attacks and positioning
      if (rndBool(0.6)) {
        this.queueAttack();
      } else {
        this.queueMove(rndChoice(["walk", "jump", "dodge_back"]));
      }
    } else {
      // Close range - attack or retreat
      if (opponent.attacking && rndBool(0.4)) {
        this.queueMove(rndChoice(["block", "dodge_back", "dodge_roll"]));
      } else {
        this.queueAttack();
      }
    }

    // Add some style-based variation
    if (this.style === "acrobatic" && rndBool(0.3)) {
      this.moveQueue.unshift(rndChoice(["flip", "aerial_kick"]));
    } else if (this.style === "aggressive" && rndBool(0.4)) {
      this.moveQueue.push(rndChoice(["punch", "kick"]));
    }
  }

  queueTrainingMove() {
    const moves = [
      "punch", "kick", "uppercut", "roundhouse",
      "jump", "flip", "block", "combo1", "kata"
    ];
    this.queueMove(rndChoice(moves));

    // Training combos
    if (rndBool(0.3)) {
      this.moveQueue.push(rndChoice(moves));
      this.moveQueue.push(rndChoice(moves));
    }
  }

  queueAttack() {
    const attacks = ["punch", "kick", "uppercut", "roundhouse", "flying_kick", "combo1"];
    this.queueMove(rndChoice(attacks));
  }

  queueMove(moveName) {
    this.moveQueue.push(moveName);
  }

  executeMove(moveName) {
    this.currentMove = moveName;
    this.attacking = false;
    this.blocking = false;

    const moves = {
      // Movement
      walk: { duration: 20, action: () => { this.vx = this.facing * 2; this.setWalkPose(); }},
      dash: { duration: 15, action: () => { this.vx = this.facing * 5; this.setDashPose(); }},
      jump: { duration: 25, action: () => { if (this.grounded) { this.vy = -12; this.grounded = false; } this.setJumpPose(); }},
      jump_forward: { duration: 30, action: () => { if (this.grounded) { this.vy = -10; this.vx = this.facing * 4; this.grounded = false; } this.setJumpPose(); }},
      dodge_back: { duration: 15, action: () => { this.vx = -this.facing * 4; this.setDodgePose(); this.invincible = 10; }},
      dodge_roll: { duration: 20, action: () => { this.vx = -this.facing * 3; this.setRollPose(); this.invincible = 15; }},

      // Attacks
      punch: { duration: 12, action: () => { this.attacking = true; this.setPunchPose(); }},
      kick: { duration: 15, action: () => { this.attacking = true; this.setKickPose(); }},
      uppercut: { duration: 18, action: () => { this.attacking = true; this.setUppercutPose(); this.vx = this.facing * 2; }},
      roundhouse: { duration: 20, action: () => { this.attacking = true; this.setRoundhousePose(); }},
      flying_kick: { duration: 25, action: () => { this.attacking = true; if (this.grounded) { this.vy = -8; this.grounded = false; } this.vx = this.facing * 6; this.setFlyingKickPose(); }},

      // Defense
      block: { duration: 20, action: () => { this.blocking = true; this.setBlockPose(); }},

      // Acrobatics
      flip: { duration: 30, action: () => { if (this.grounded) { this.vy = -14; this.grounded = false; } this.setFlipPose(); }},
      aerial_kick: { duration: 25, action: () => { this.attacking = true; this.vy = -10; this.grounded = false; this.setAerialKickPose(); }},

      // Combos
      combo1: { duration: 35, action: () => {
        this.attacking = true;
        this.setPunchPose();
        setTimeout(() => this.setKickPose(), 150);
        setTimeout(() => this.setUppercutPose(), 300);
      }},

      // Training
      kata: { duration: 60, action: () => { this.setKataPose(); }}
    };

    const move = moves[moveName];
    if (move) {
      this.moveTimer = move.duration;
      move.action();
    } else {
      this.moveTimer = 20;
      this.setIdlePose();
    }
  }

  // Pose setters
  setIdlePose() {
    this.targetPose = {
      headTilt: 0,
      torsoAngle: 0,
      leftArmUpper: -PI/4,
      leftArmLower: -PI/6,
      rightArmUpper: PI/4,
      rightArmLower: PI/6,
      leftLegUpper: PI/2 - 0.2,
      leftLegLower: 0.2,
      rightLegUpper: PI/2 + 0.2,
      rightLegLower: -0.2
    };
  }

  setWalkPose() {
    const t = this.idleTimer * 0.2;
    this.targetPose = {
      headTilt: 0,
      torsoAngle: sin(t) * 0.05,
      leftArmUpper: -PI/3 + sin(t) * 0.3,
      leftArmLower: -PI/4,
      rightArmUpper: PI/3 + sin(t + PI) * 0.3,
      rightArmLower: PI/4,
      leftLegUpper: PI/2 + sin(t) * 0.4,
      leftLegLower: max(0, sin(t) * 0.5),
      rightLegUpper: PI/2 + sin(t + PI) * 0.4,
      rightLegLower: max(0, sin(t + PI) * 0.5)
    };
  }

  setDashPose() {
    this.targetPose = {
      headTilt: 0.1 * this.facing,
      torsoAngle: 0.3 * this.facing,
      leftArmUpper: -PI/2,
      leftArmLower: -PI/3,
      rightArmUpper: PI * 0.7,
      rightArmLower: PI/4,
      leftLegUpper: PI/2 - 0.5,
      leftLegLower: 0.8,
      rightLegUpper: PI/2 + 0.5,
      rightLegLower: 0
    };
  }

  setJumpPose() {
    this.targetPose = {
      headTilt: -0.1,
      torsoAngle: 0,
      leftArmUpper: -PI/2,
      leftArmLower: 0,
      rightArmUpper: PI/2,
      rightArmLower: 0,
      leftLegUpper: PI/2 - 0.3,
      leftLegLower: 0.6,
      rightLegUpper: PI/2 + 0.3,
      rightLegLower: -0.3
    };
  }

  setDodgePose() {
    this.targetPose = {
      headTilt: -0.2 * this.facing,
      torsoAngle: -0.4 * this.facing,
      leftArmUpper: -PI/3,
      leftArmLower: -PI/2,
      rightArmUpper: PI/3,
      rightArmLower: PI/2,
      leftLegUpper: PI/2,
      leftLegLower: 0.5,
      rightLegUpper: PI/2,
      rightLegLower: 0.3
    };
  }

  setRollPose() {
    const t = this.moveTimer / 20;
    this.targetPose = {
      headTilt: sin(t * PI * 2) * 0.5,
      torsoAngle: t * PI * 2,
      leftArmUpper: -PI/2,
      leftArmLower: -PI/2,
      rightArmUpper: PI/2,
      rightArmLower: PI/2,
      leftLegUpper: PI/2,
      leftLegLower: PI/2,
      rightLegUpper: PI/2,
      rightLegLower: PI/2
    };
  }

  setPunchPose() {
    this.targetPose = {
      headTilt: 0,
      torsoAngle: 0.2 * this.facing,
      leftArmUpper: 0,
      leftArmLower: 0,
      rightArmUpper: PI/2 * this.facing,
      rightArmLower: 0,
      leftLegUpper: PI/2 - 0.2,
      leftLegLower: 0.1,
      rightLegUpper: PI/2 + 0.3,
      rightLegLower: 0
    };
  }

  setKickPose() {
    this.targetPose = {
      headTilt: 0,
      torsoAngle: -0.2 * this.facing,
      leftArmUpper: -PI/3,
      leftArmLower: -PI/4,
      rightArmUpper: PI/3,
      rightArmLower: PI/4,
      leftLegUpper: PI/2,
      leftLegLower: 0.2,
      rightLegUpper: PI/4 * this.facing,
      rightLegLower: 0
    };
  }

  setUppercutPose() {
    this.targetPose = {
      headTilt: -0.2,
      torsoAngle: -0.3 * this.facing,
      leftArmUpper: -PI/2,
      leftArmLower: -PI/3,
      rightArmUpper: -PI/2,
      rightArmLower: -PI/4,
      leftLegUpper: PI/2 + 0.2,
      leftLegLower: 0.3,
      rightLegUpper: PI/2 - 0.3,
      rightLegLower: 0.5
    };
  }

  setRoundhousePose() {
    this.targetPose = {
      headTilt: 0.1 * this.facing,
      torsoAngle: 0.4 * this.facing,
      leftArmUpper: -PI/2,
      leftArmLower: -PI/4,
      rightArmUpper: PI/2,
      rightArmLower: PI/4,
      leftLegUpper: PI/2,
      leftLegLower: 0.2,
      rightLegUpper: 0,
      rightLegLower: PI/4
    };
  }

  setFlyingKickPose() {
    this.targetPose = {
      headTilt: 0.1 * this.facing,
      torsoAngle: 0.5 * this.facing,
      leftArmUpper: -PI * 0.6,
      leftArmLower: 0,
      rightArmUpper: PI * 0.6,
      rightArmLower: 0,
      leftLegUpper: PI/2 + 0.5,
      leftLegLower: 0.3,
      rightLegUpper: 0,
      rightLegLower: 0
    };
  }

  setBlockPose() {
    this.targetPose = {
      headTilt: -0.1,
      torsoAngle: -0.1 * this.facing,
      leftArmUpper: -PI/3,
      leftArmLower: -PI * 0.7,
      rightArmUpper: PI/3,
      rightArmLower: PI * 0.7,
      leftLegUpper: PI/2 - 0.1,
      leftLegLower: 0.2,
      rightLegUpper: PI/2 + 0.1,
      rightLegLower: 0.2
    };
  }

  setFlipPose() {
    const t = 1 - this.moveTimer / 30;
    this.targetPose.torsoAngle = t * PI * 2;
  }

  setAerialKickPose() {
    this.targetPose = {
      headTilt: 0,
      torsoAngle: 0.3 * this.facing,
      leftArmUpper: -PI/2,
      leftArmLower: 0,
      rightArmUpper: PI/2,
      rightArmLower: 0,
      leftLegUpper: PI * 0.6,
      leftLegLower: 0.3,
      rightLegUpper: 0,
      rightLegLower: 0
    };
  }

  setKataPose() {
    const t = this.moveTimer / 60;
    const phase = floor(t * 4);
    const poses = [
      { rightArmUpper: 0, rightArmLower: 0, leftArmUpper: -PI/2, leftArmLower: -PI/4 },
      { rightArmUpper: PI/2, rightArmLower: 0, leftArmUpper: 0, leftArmLower: 0 },
      { rightArmUpper: PI/4, rightArmLower: PI/4, leftArmUpper: -PI/4, leftArmLower: -PI/4 },
      { rightArmUpper: -PI/4, rightArmLower: 0, leftArmUpper: -PI/2, leftArmLower: 0 }
    ];
    Object.assign(this.targetPose, poses[phase % poses.length]);
  }

  setVictoryPose(poseType) {
    this.winner = true;
    this.victoryPose = poseType;

    switch(poseType) {
      case 'fist_pump':
        this.targetPose = {
          headTilt: -0.2,
          torsoAngle: 0,
          leftArmUpper: -PI/4,
          leftArmLower: -PI/3,
          rightArmUpper: -PI * 0.8,
          rightArmLower: -PI/2,
          leftLegUpper: PI/2,
          leftLegLower: 0.1,
          rightLegUpper: PI/2,
          rightLegLower: 0.1
        };
        break;
      case 'bow':
        this.targetPose = {
          headTilt: 0.5,
          torsoAngle: 0.4,
          leftArmUpper: PI/3,
          leftArmLower: 0,
          rightArmUpper: -PI/3,
          rightArmLower: 0,
          leftLegUpper: PI/2,
          leftLegLower: 0,
          rightLegUpper: PI/2,
          rightLegLower: 0
        };
        break;
      case 'arms_crossed':
        this.targetPose = {
          headTilt: 0,
          torsoAngle: 0,
          leftArmUpper: PI/4,
          leftArmLower: PI * 0.6,
          rightArmUpper: -PI/4,
          rightArmLower: -PI * 0.6,
          leftLegUpper: PI/2 - 0.2,
          leftLegLower: 0,
          rightLegUpper: PI/2 + 0.2,
          rightLegLower: 0
        };
        break;
      case 'crane':
        this.targetPose = {
          headTilt: 0,
          torsoAngle: 0,
          leftArmUpper: -PI/2,
          leftArmLower: 0,
          rightArmUpper: PI/2,
          rightArmLower: 0,
          leftLegUpper: PI/2,
          leftLegLower: 0,
          rightLegUpper: 0,
          rightLegLower: PI/2
        };
        break;
    }
  }

  setDeadPose() {
    this.dead = true;
    this.targetPose = {
      headTilt: 0.5,
      torsoAngle: PI/2,
      leftArmUpper: PI/2,
      leftArmLower: PI/4,
      rightArmUpper: PI/3,
      rightArmLower: PI/4,
      leftLegUpper: PI/2 + 0.3,
      leftLegLower: 0.2,
      rightLegUpper: PI/2 - 0.2,
      rightLegLower: 0.3
    };
  }

  findNearestOpponent(fighters) {
    let nearest = null;
    let minDist = Infinity;
    for (let f of fighters) {
      if (f.id !== this.id && !f.dead) {
        const d = abs(this.x - f.x);
        if (d < minDist) {
          minDist = d;
          nearest = f;
        }
      }
    }
    return nearest;
  }

  takeDamage(amount) {
    if (this.invincible > 0 || this.dead) return;
    if (this.blocking) amount *= 0.3;

    this.health -= amount;
    this.stunned = 15;
    this.vx = -this.facing * 3;

    if (this.health <= 0) {
      this.health = 0;
      this.setDeadPose();
    }
  }

  getAttackHitbox() {
    if (!this.attacking) return null;

    const hand = this.getJointPos('rightHand');
    const foot = this.getJointPos('rightFoot');

    // Different attacks have different hitboxes
    if (this.currentMove === 'kick' || this.currentMove === 'roundhouse' ||
        this.currentMove === 'flying_kick' || this.currentMove === 'aerial_kick') {
      return { x: foot.x, y: foot.y, radius: 20, damage: 12 };
    }
    return { x: hand.x, y: hand.y, radius: 15, damage: 8 };
  }

  render() {
    push();
    translate(this.x, this.y);
    scale(this.facing, 1);

    const c = this.color;
    stroke(c[0], c[1], c[2]);
    strokeWeight(this.thickness);
    noFill();

    // Flash when hit
    if (this.stunned > 0 && frameCount % 4 < 2) {
      stroke(255, 100, 100);
    }

    // Flash when invincible
    if (this.invincible > 0 && frameCount % 3 < 1) {
      stroke(100, 100, 255, 150);
    }

    // Dead = faded
    if (this.dead) {
      stroke(c[0], c[1], c[2], 100);
    }

    // Draw body parts
    this.drawHead();
    this.drawBody();
    this.drawArm('left');
    this.drawArm('right');
    this.drawLeg('left');
    this.drawLeg('right');

    pop();

    // Health bar
    if (!features.soloTraining) {
      this.drawHealthBar();
    }
  }

  drawHead() {
    push();
    translate(0, -this.bodyLength - this.headSize);
    rotate(this.pose.headTilt);
    ellipse(0, 0, this.headSize * 2, this.headSize * 2);
    pop();
  }

  drawBody() {
    push();
    rotate(this.pose.torsoAngle);
    line(0, -this.bodyLength, 0, 0);
    pop();
  }

  drawArm(side) {
    const upperAngle = side === 'left' ? this.pose.leftArmUpper : this.pose.rightArmUpper;
    const lowerAngle = side === 'left' ? this.pose.leftArmLower : this.pose.rightArmLower;
    const len = this.armLength * 0.5;

    push();
    translate(0, -this.bodyLength);

    // Upper arm
    rotate(upperAngle);
    line(0, 0, len, 0);

    // Lower arm
    translate(len, 0);
    rotate(lowerAngle);
    line(0, 0, len, 0);

    pop();
  }

  drawLeg(side) {
    const upperAngle = side === 'left' ? this.pose.leftLegUpper : this.pose.rightLegUpper;
    const lowerAngle = side === 'left' ? this.pose.leftLegLower : this.pose.rightLegLower;
    const len = this.legLength * 0.5;

    push();
    // Upper leg
    rotate(upperAngle);
    line(0, 0, len, 0);

    // Lower leg
    translate(len, 0);
    rotate(lowerAngle);
    line(0, 0, len, 0);

    pop();
  }

  drawHealthBar() {
    const barWidth = 50;
    const barHeight = 6;
    const x = this.x - barWidth / 2;
    const y = this.y - this.bodyLength - this.headSize * 2 - 20;

    // Background
    noStroke();
    fill(40, 40, 40);
    rect(x, y, barWidth, barHeight, 2);

    // Health
    const healthWidth = (this.health / this.maxHealth) * barWidth;
    const healthColor = this.health > 60 ? [100, 200, 100] :
                        this.health > 30 ? [200, 200, 100] : [200, 100, 100];
    fill(healthColor[0], healthColor[1], healthColor[2]);
    rect(x, y, healthWidth, barHeight, 2);

    // Border
    noFill();
    stroke(80, 80, 80);
    strokeWeight(1);
    rect(x, y, barWidth, barHeight, 2);
  }
}

// ============================================================================
// ENVIRONMENT RENDERER
// ============================================================================

class Environment {
  constructor(config) {
    this.config = config;
    this.parallaxLayers = [];
    this.groundY = 0;
    this.generateLayers();
  }

  generateLayers() {
    const layerTypes = this.config.parallaxLayers;

    for (let i = 0; i < layerTypes.length; i++) {
      this.parallaxLayers.push({
        type: layerTypes[i],
        depth: (i + 1) / layerTypes.length,
        elements: this.generateLayerElements(layerTypes[i], i)
      });
    }
  }

  generateLayerElements(type, depth) {
    const elements = [];
    const count = rndInt(3, 8);
    const pixelSize = this.config.pixelSize;

    for (let i = 0; i < count; i++) {
      elements.push({
        x: rnd(width),
        y: rnd(height * 0.3, height * 0.8),
        w: rndInt(20, 80),
        h: rndInt(40, 150),
        seed: rnd(1000),
        variation: rndInt(0, 3)
      });
    }

    return elements;
  }

  render(offsetX = 0) {
    // Sky/Background
    this.drawBackground();

    // Parallax layers (back to front)
    for (let i = this.parallaxLayers.length - 1; i >= 0; i--) {
      const layer = this.parallaxLayers[i];
      const parallaxOffset = offsetX * layer.depth * 0.3;
      this.drawLayer(layer, parallaxOffset);
    }

    // Ground
    this.drawGround();
  }

  drawBackground() {
    const bg = this.config.bgColor;
    const lighting = this.config.lighting;

    // Base gradient
    for (let y = 0; y < height; y++) {
      const t = y / height;
      let r = bg[0];
      let g = bg[1];
      let b = bg[2];

      if (lighting === "warm") {
        r += (1 - t) * 20;
        g += (1 - t) * 10;
      } else if (lighting === "neon") {
        r += sin(y * 0.02) * 10;
        b += (1 - t) * 30;
      } else if (lighting === "matrix") {
        g += (1 - t) * 20;
      } else if (lighting === "natural") {
        r += (1 - t) * 50;
        g += (1 - t) * 30;
        b += (1 - t) * -20;
      } else if (lighting === "electric") {
        g += sin(y * 0.05 + frameCount * 0.1) * 15;
      } else if (lighting === "code") {
        b += (1 - t) * 40;
      } else if (lighting === "screen") {
        r += (1 - t) * 30;
        g += (1 - t) * 40;
        b += (1 - t) * 50;
      }

      stroke(r, g, b);
      line(0, y, width, y);
    }
  }

  drawLayer(layer, offsetX) {
    const ps = this.config.pixelSize;

    for (let el of layer.elements) {
      const x = (el.x + offsetX) % width;

      push();
      translate(x, el.y);

      // Draw pixelated shapes based on layer type
      this.drawPixelElement(layer.type, el, ps);

      pop();
    }
  }

  drawPixelElement(type, el, ps) {
    const accent = this.config.accentColor;
    const bg = this.config.bgColor;

    noStroke();

    switch(type) {
      case 'wooden_walls':
        fill(80, 50, 30, 100);
        for (let y = 0; y < el.h; y += ps) {
          for (let x = 0; x < el.w; x += ps) {
            if (noise(el.seed + x * 0.1, y * 0.1) > 0.3) {
              rect(x, y, ps, ps);
            }
          }
        }
        break;

      case 'buildings':
        fill(30, 35, 50, 150);
        rect(0, 0, el.w, el.h);
        // Windows
        fill(accent[0], accent[1], accent[2], rnd(50, 150));
        for (let wy = ps * 2; wy < el.h - ps * 2; wy += ps * 4) {
          for (let wx = ps * 2; wx < el.w - ps * 2; wx += ps * 3) {
            if (rndBool(0.7)) {
              rect(wx, wy, ps * 2, ps * 2);
            }
          }
        }
        break;

      case 'grid':
        stroke(accent[0], accent[1], accent[2], 30);
        strokeWeight(1);
        for (let x = 0; x < el.w; x += ps * 4) {
          line(x, 0, x, el.h);
        }
        for (let y = 0; y < el.h; y += ps * 4) {
          line(0, y, el.w, y);
        }
        break;

      case 'data_streams':
        fill(accent[0], accent[1], accent[2], 50);
        for (let y = 0; y < el.h; y += ps) {
          if (noise(el.seed, y * 0.1 + frameCount * 0.02) > 0.5) {
            rect(0, y, el.w * noise(el.seed + 1, y * 0.1), ps);
          }
        }
        break;

      case 'mountains':
        fill(60, 80, 60, 100);
        beginShape();
        vertex(0, el.h);
        for (let x = 0; x < el.w; x += ps) {
          const h = noise(el.seed + x * 0.02) * el.h;
          vertex(x, el.h - h);
        }
        vertex(el.w, el.h);
        endShape(CLOSE);
        break;

      case 'trees':
        fill(40, 80, 40, 120);
        // Trunk
        rect(el.w/2 - ps, el.h * 0.6, ps * 2, el.h * 0.4);
        // Canopy
        ellipse(el.w/2, el.h * 0.4, el.w * 0.8, el.h * 0.6);
        break;

      case 'circuits':
        stroke(accent[0], accent[1], accent[2], 60);
        strokeWeight(ps / 2);
        noFill();
        // Random circuit paths
        let cx = 0, cy = el.h / 2;
        beginShape();
        vertex(cx, cy);
        while (cx < el.w) {
          cx += ps * rndInt(2, 4);
          cy += (rndBool() ? 1 : -1) * ps * rndInt(0, 3);
          cy = constrain(cy, 0, el.h);
          vertex(cx, cy);
        }
        endShape();
        break;

      case 'code_blocks':
        fill(accent[0], accent[1], accent[2], 40);
        // Code-like rectangles
        for (let y = 0; y < el.h; y += ps * 2) {
          const lineWidth = rnd(0.3, 1) * el.w;
          rect(0, y, lineWidth, ps);
        }
        break;

      case 'windows':
        fill(240, 240, 245);
        rect(0, 0, el.w, el.h, ps);
        // Title bar
        fill(0, 100, 200);
        rect(0, 0, el.w, ps * 3, ps, ps, 0, 0);
        // Close button
        fill(255, 80, 80);
        rect(el.w - ps * 3, ps/2, ps * 2, ps * 2, ps/2);
        break;

      case 'icons':
        fill(accent[0], accent[1], accent[2], 150);
        rect(0, 0, el.w, el.w, ps);
        break;

      default:
        fill(accent[0], accent[1], accent[2], 50);
        rect(0, 0, el.w, el.h);
    }
  }

  drawGround() {
    const floor = this.config.floorColor;
    const ps = this.config.pixelSize;

    this.groundY = height - 60;

    // Main ground
    noStroke();
    fill(floor[0], floor[1], floor[2]);
    rect(0, this.groundY, width, height - this.groundY);

    // Pixel texture on ground
    fill(floor[0] + 10, floor[1] + 10, floor[2] + 10, 100);
    for (let x = 0; x < width; x += ps * 2) {
      for (let y = this.groundY; y < height; y += ps * 2) {
        if (noise(x * 0.05, y * 0.05) > 0.5) {
          rect(x, y, ps, ps);
        }
      }
    }

    // Ground line
    stroke(floor[0] + 30, floor[1] + 30, floor[2] + 30);
    strokeWeight(2);
    line(0, this.groundY, width, this.groundY);
  }

  getGroundY() {
    return this.groundY;
  }
}

// ============================================================================
// INTERACTIVE OBJECTS
// ============================================================================

class InteractiveObject {
  constructor(x, groundY, type) {
    this.x = x;
    this.type = type;
    this.groundY = groundY;

    // Set properties based on type
    switch(type) {
      case 'crate':
        this.w = 40;
        this.h = 40;
        this.y = groundY - this.h;
        this.climbable = true;
        this.breakable = true;
        this.health = 30;
        break;
      case 'barrel':
        this.w = 30;
        this.h = 45;
        this.y = groundY - this.h;
        this.climbable = true;
        this.rollable = true;
        this.vx = 0;
        break;
      case 'platform':
        this.w = 80;
        this.h = 15;
        this.y = groundY - 80;
        this.climbable = true;
        break;
      case 'weapon_rack':
        this.w = 50;
        this.h = 60;
        this.y = groundY - this.h;
        this.usable = true;
        break;
    }

    this.destroyed = false;
  }

  update(fighters) {
    if (this.destroyed) return;

    // Rolling physics for barrels
    if (this.rollable && this.vx !== 0) {
      this.x += this.vx;
      this.vx *= 0.98;
      if (abs(this.vx) < 0.1) this.vx = 0;
    }
  }

  render() {
    if (this.destroyed) return;

    push();
    translate(this.x, this.y);

    switch(this.type) {
      case 'crate':
        fill(120, 80, 50);
        stroke(80, 50, 30);
        strokeWeight(2);
        rect(0, 0, this.w, this.h);
        // Wood grain
        line(this.w * 0.3, 0, this.w * 0.3, this.h);
        line(this.w * 0.6, 0, this.w * 0.6, this.h);
        line(0, this.h * 0.5, this.w, this.h * 0.5);
        break;

      case 'barrel':
        fill(100, 70, 45);
        stroke(70, 45, 25);
        strokeWeight(2);
        ellipse(this.w/2, this.h * 0.1, this.w, this.h * 0.2);
        rect(0, this.h * 0.1, this.w, this.h * 0.8);
        ellipse(this.w/2, this.h * 0.9, this.w, this.h * 0.2);
        // Bands
        stroke(60, 60, 60);
        line(0, this.h * 0.25, this.w, this.h * 0.25);
        line(0, this.h * 0.75, this.w, this.h * 0.75);
        break;

      case 'platform':
        fill(80, 80, 90);
        stroke(60, 60, 70);
        strokeWeight(2);
        rect(0, 0, this.w, this.h, 3);
        break;

      case 'weapon_rack':
        fill(70, 50, 35);
        stroke(50, 35, 20);
        strokeWeight(2);
        rect(0, 0, this.w, this.h);
        // Weapons
        stroke(150, 150, 160);
        strokeWeight(3);
        line(10, 10, 10, this.h - 10);
        line(25, 15, 25, this.h - 15);
        line(40, 10, 40, this.h - 10);
        break;
    }

    pop();
  }

  getTop() {
    return this.y;
  }

  contains(x, y) {
    return x >= this.x && x <= this.x + this.w &&
           y >= this.y && y <= this.y + this.h;
  }
}

// ============================================================================
// EFFECTS
// ============================================================================

class EffectsManager {
  constructor() {
    this.particles = [];
    this.trails = [];
    this.impacts = [];
  }

  addImpact(x, y, type = 'hit') {
    this.impacts.push({
      x, y,
      radius: 5,
      maxRadius: type === 'hit' ? 30 : 50,
      alpha: 255,
      color: type === 'hit' ? [255, 255, 200] : [255, 100, 100]
    });
  }

  addTrail(x, y, color) {
    this.trails.push({
      x, y,
      alpha: 150,
      size: 8,
      color: color
    });
  }

  update() {
    // Update impacts
    for (let i = this.impacts.length - 1; i >= 0; i--) {
      const imp = this.impacts[i];
      imp.radius += 3;
      imp.alpha -= 20;
      if (imp.alpha <= 0) {
        this.impacts.splice(i, 1);
      }
    }

    // Update trails
    for (let i = this.trails.length - 1; i >= 0; i--) {
      const t = this.trails[i];
      t.alpha -= 10;
      t.size *= 0.95;
      if (t.alpha <= 0) {
        this.trails.splice(i, 1);
      }
    }
  }

  render() {
    // Draw trails
    noStroke();
    for (let t of this.trails) {
      fill(t.color[0], t.color[1], t.color[2], t.alpha);
      ellipse(t.x, t.y, t.size);
    }

    // Draw impacts
    for (let imp of this.impacts) {
      noFill();
      stroke(imp.color[0], imp.color[1], imp.color[2], imp.alpha);
      strokeWeight(2);
      ellipse(imp.x, imp.y, imp.radius * 2);
    }
  }
}

// ============================================================================
// MAIN GAME
// ============================================================================

let fighters = [];
let environment;
let objects = [];
let effects;
let gameState = 'fighting'; // 'fighting', 'victory'
let winner = null;
let victoryTimer = 0;

function setup() {
  const holder = document.getElementById('sketch-holder');
  const size = holder ? holder.offsetWidth : 700;

  let cnv = createCanvas(size, size);
  if (holder) {
    cnv.parent('sketch-holder');
  }

  pixelDensity(min(2, window.devicePixelRatio || 1));

  generateFeatures();

  if (window.onFeaturesGenerated) {
    window.onFeaturesGenerated(features);
  }

  initializeGame();
}

function initializeGame() {
  R = initRandom(hash);
  // Burn randoms used by feature generation
  for (let i = 0; i < 50; i++) R();

  // Create environment
  environment = new Environment(features.environment.config);

  // Create fighters
  fighters = [];
  const groundY = height - 60;
  const fighterSpacing = width / (features.fighters.count + 1);

  for (let i = 0; i < features.fighters.count; i++) {
    const x = fighterSpacing * (i + 1);
    const color = STICK_COLORS[i % STICK_COLORS.length];
    const style = rndChoice(FIGHT_STYLES);
    fighters.push(new StickFigure(x, groundY, color, style, i));
  }

  // Create objects
  objects = [];
  for (let i = 0; i < features.objects.count; i++) {
    const type = rndChoice(['crate', 'barrel', 'platform']);
    const x = rnd(100, width - 100);
    objects.push(new InteractiveObject(x, groundY, type));
  }

  // Effects manager
  effects = new EffectsManager();

  gameState = 'fighting';
  winner = null;
  victoryTimer = 0;
}

function draw() {
  // Render environment
  environment.render(frameCount * 0.5);

  // Update and render objects
  for (let obj of objects) {
    obj.update(fighters);
    obj.render();
  }

  // Update fighters
  const groundY = environment.getGroundY();

  if (gameState === 'fighting') {
    // Check for collisions between attacks
    for (let f of fighters) {
      const hitbox = f.getAttackHitbox();
      if (hitbox) {
        for (let other of fighters) {
          if (other.id !== f.id && !other.dead) {
            const dist = dist2D(hitbox.x, hitbox.y, other.x, other.y - 40);
            if (dist < hitbox.radius + 20) {
              other.takeDamage(hitbox.damage);
              effects.addImpact(hitbox.x, hitbox.y, 'hit');
              f.attacking = false; // Prevent multi-hit
            }
          }
        }
      }
    }

    // Update fighters
    for (let f of fighters) {
      f.update(fighters, objects, groundY);

      // Add trails if enabled
      if (features.fx.type === 'trails' && f.attacking) {
        const hand = f.getJointPos('rightHand');
        effects.addTrail(hand.x, hand.y, f.color);
      }
    }

    // Check for victory
    const alive = fighters.filter(f => !f.dead);
    if (alive.length === 1 && features.fighters.count > 1) {
      winner = alive[0];
      const poses = ['fist_pump', 'bow', 'arms_crossed', 'crane'];
      winner.setVictoryPose(rndChoice(poses));
      gameState = 'victory';
      victoryTimer = 0;
    } else if (alive.length === 0 && features.fighters.count > 1) {
      // Draw - no winner
      gameState = 'victory';
    }
  } else {
    // Victory state - just animate winner
    if (winner) {
      winner.update(fighters, objects, groundY);
      victoryTimer++;
    }
  }

  // Update effects
  effects.update();

  // Render fighters
  for (let f of fighters) {
    f.render();
  }

  // Render effects on top
  effects.render();

  // Victory text
  if (gameState === 'victory' && victoryTimer > 30) {
    drawVictoryScreen();
  }
}

function drawVictoryScreen() {
  // Darken background
  fill(0, 0, 0, 100);
  rect(0, 0, width, height);

  // Victory text
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);
  noStroke();

  if (winner) {
    text("VICTORY", width/2, height/2 - 50);
    textSize(18);
    fill(winner.color[0], winner.color[1], winner.color[2]);
    text(`Fighter ${winner.id + 1} Wins!`, width/2, height/2);
  } else {
    text("DRAW", width/2, height/2);
  }
}

function dist2D(x1, y1, x2, y2) {
  return sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
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
