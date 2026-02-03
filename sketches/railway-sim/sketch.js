/**
 * Railway Sim - Interactive Railway Simulation
 * Version: 1.0.0
 *
 * A generative top-down railway simulation with procedural track networks,
 * multiple train types, and full interactivity.
 *
 * Controls:
 *   Arrow Keys / WASD - Drive selected train (accelerate/brake/reverse)
 *   Click on train - Select train to drive
 *   Click on switch - Toggle junction direction
 *   N - Dispatch new train
 *   X - Remove selected train
 *   R - Regenerate entire network
 *   S - Save PNG
 *   Space - Pause/resume simulation
 */

// ============================================================================
// HASH & RANDOM
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
  const seeds = [];
  for (let i = 2; i < 66; i += 8) {
    seeds.push(parseInt(hashStr.slice(i, i + 8), 16));
  }
  return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

let R;
function rnd(min = 0, max = 1) {
  if (arguments.length === 1) { max = min; min = 0; }
  return R() * (max - min) + min;
}
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rndChoice(arr) { return arr[Math.floor(R() * arr.length)]; }
function rndBool(p = 0.5) { return R() < p; }
function rollRarity(common, uncommon, rare, legendary) {
  const roll = R();
  if (roll < legendary) return "legendary";
  if (roll < legendary + rare) return "rare";
  if (roll < legendary + rare + uncommon) return "uncommon";
  return "common";
}

// ============================================================================
// FEATURES & STATE
// ============================================================================

let features = {};
let originalFeatures = {};
let hasOverrides = false;

const TRAIN_TYPES = {
  diesel: { speed: 2.5, accel: 0.08, color: null, rarity: "common", icon: "▮▮" },
  electric: { speed: 3.5, accel: 0.12, color: null, rarity: "uncommon", icon: "◼◻" },
  steam: { speed: 2.0, accel: 0.05, color: null, rarity: "rare", icon: "◉●" },
  bullet: { speed: 5.0, accel: 0.15, color: null, rarity: "legendary", icon: "◀▶" },
  freight: { speed: 1.8, accel: 0.04, color: null, rarity: "common", icon: "▭▭" }
};

const ENVIRONMENTS = {
  urban: { trees: false, buildings: true, water: false, rarity: "common" },
  rural: { trees: true, buildings: false, water: false, rarity: "common" },
  coastal: { trees: true, buildings: true, water: true, rarity: "rare" },
  mountain: { trees: true, buildings: false, water: false, mountains: true, rarity: "legendary" },
  industrial: { trees: false, buildings: true, water: false, factories: true, rarity: "uncommon" }
};

function generateFeatures() {
  R = initRandom(hash);

  // Generate color palette
  const baseHue = rnd(360);
  const palette = {
    background: [rnd(20, 40), rnd(10, 25), rnd(85, 95)],
    tracks: [baseHue, rnd(5, 15), rnd(25, 40)],
    lines: []
  };

  // Generate 3-6 line colors
  const lineCount = rndInt(3, 6);
  for (let i = 0; i < lineCount; i++) {
    const hue = (baseHue + (360 / lineCount) * i + rnd(-20, 20)) % 360;
    palette.lines.push([hue, rnd(60, 85), rnd(50, 70)]);
  }

  // Environment
  const envRoll = rollRarity(0.35, 0.25, 0.25, 0.15);
  let environment;
  if (envRoll === "legendary") environment = "mountain";
  else if (envRoll === "rare") environment = "coastal";
  else if (envRoll === "uncommon") environment = "industrial";
  else environment = rndBool() ? "urban" : "rural";

  // Network complexity
  const complexity = rollRarity(0.30, 0.35, 0.25, 0.10);
  let nodeCount, branchProb, loopProb;
  if (complexity === "legendary") {
    nodeCount = rndInt(18, 24);
    branchProb = 0.7;
    loopProb = 0.5;
  } else if (complexity === "rare") {
    nodeCount = rndInt(14, 18);
    branchProb = 0.5;
    loopProb = 0.35;
  } else if (complexity === "uncommon") {
    nodeCount = rndInt(10, 14);
    branchProb = 0.35;
    loopProb = 0.25;
  } else {
    nodeCount = rndInt(6, 10);
    branchProb = 0.2;
    loopProb = 0.15;
  }

  // Initial train count and types
  const trainCount = rndInt(2, 5);
  const trainTypes = [];
  for (let i = 0; i < trainCount; i++) {
    const typeRoll = rollRarity(0.50, 0.28, 0.15, 0.07);
    if (typeRoll === "legendary") trainTypes.push("bullet");
    else if (typeRoll === "rare") trainTypes.push("steam");
    else if (typeRoll === "uncommon") trainTypes.push("electric");
    else trainTypes.push(rndBool(0.6) ? "diesel" : "freight");
  }

  features = {
    palette,
    environment,
    complexity,
    nodeCount,
    branchProb,
    loopProb,
    trainCount,
    trainTypes,
    hasStations: rndBool(0.8),
    stationCount: rndInt(3, 8),
    hasSignals: rndBool(0.6),
    weatherEffect: rndChoice(["none", "none", "none", "rain", "fog", "night"])
  };

  originalFeatures = JSON.parse(JSON.stringify(features));
  return features;
}

function setParameter(name, value) {
  hasOverrides = true;
  features[name] = value;
  return features;
}

function resetToOriginal() {
  features = JSON.parse(JSON.stringify(originalFeatures));
  hasOverrides = false;
  return features;
}

// ============================================================================
// TRACK NETWORK
// ============================================================================

class Node {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.connections = []; // { node, lineId, trackId }
    this.isStation = false;
    this.stationName = "";
    this.isSwitch = false;
    this.switchState = 0; // Which connection is active for switches
  }
}

class Track {
  constructor(nodeA, nodeB, lineId, id) {
    this.id = id;
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.lineId = lineId;
    this.length = dist(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
    this.angle = atan2(nodeB.y - nodeA.y, nodeB.x - nodeA.x);
    this.hasSignal = false;
    this.signalState = true; // true = green
  }

  getPointAt(t) {
    return {
      x: lerp(this.nodeA.x, this.nodeB.x, t),
      y: lerp(this.nodeA.y, this.nodeB.y, t)
    };
  }

  getAngle(direction) {
    return direction > 0 ? this.angle : this.angle + PI;
  }
}

let nodes = [];
let tracks = [];
let trains = [];
let selectedTrain = null;
let paused = false;

function generateNetwork() {
  nodes = [];
  tracks = [];

  const margin = 80;
  const w = width - margin * 2;
  const h = height - margin * 2;

  // Generate node positions using relaxation
  const positions = [];
  const minDist = Math.min(w, h) / (Math.sqrt(features.nodeCount) + 1);

  for (let i = 0; i < features.nodeCount; i++) {
    let bestPos = null;
    let bestMinDist = 0;

    for (let attempt = 0; attempt < 50; attempt++) {
      const x = margin + rnd(w);
      const y = margin + rnd(h);

      let minD = Infinity;
      for (const pos of positions) {
        const d = dist(x, y, pos.x, pos.y);
        minD = Math.min(minD, d);
      }

      if (minD > bestMinDist) {
        bestMinDist = minD;
        bestPos = { x, y };
      }

      if (minD > minDist) break;
    }

    if (bestPos) {
      positions.push(bestPos);
      nodes.push(new Node(bestPos.x, bestPos.y, i));
    }
  }

  // Create minimum spanning tree for connectivity
  const connected = new Set([0]);
  const edges = [];

  while (connected.size < nodes.length) {
    let bestEdge = null;
    let bestDist = Infinity;

    for (const i of connected) {
      for (let j = 0; j < nodes.length; j++) {
        if (connected.has(j)) continue;
        const d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
        if (d < bestDist) {
          bestDist = d;
          bestEdge = [i, j];
        }
      }
    }

    if (bestEdge) {
      edges.push(bestEdge);
      connected.add(bestEdge[1]);
    }
  }

  // Add extra connections for loops
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (edges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i))) continue;

      const d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
      if (d < minDist * 2 && rndBool(features.loopProb)) {
        edges.push([i, j]);
      }
    }
  }

  // Assign lines to tracks
  const lineCount = features.palette.lines.length;
  let trackId = 0;

  for (const [i, j] of edges) {
    const lineId = trackId % lineCount;
    const track = new Track(nodes[i], nodes[j], lineId, trackId);
    tracks.push(track);

    nodes[i].connections.push({ node: nodes[j], lineId, trackId });
    nodes[j].connections.push({ node: nodes[i], lineId, trackId });

    trackId++;
  }

  // Mark switches (nodes with 3+ connections)
  for (const node of nodes) {
    if (node.connections.length >= 3) {
      node.isSwitch = true;
      node.switchState = 0;
    }
  }

  // Add stations
  if (features.hasStations) {
    const stationNodes = [...nodes].sort(() => rnd() - 0.5).slice(0, features.stationCount);
    const stationNames = ["Central", "Park", "Harbor", "Heights", "Square", "Junction", "Terminal", "Cross", "Gate", "Bridge", "Valley", "Hill"];

    for (let i = 0; i < stationNodes.length; i++) {
      stationNodes[i].isStation = true;
      stationNodes[i].stationName = rndChoice(stationNames);
    }
  }

  // Add signals
  if (features.hasSignals) {
    for (const track of tracks) {
      if (rndBool(0.4)) {
        track.hasSignal = true;
        track.signalState = rndBool(0.8);
      }
    }
  }

  // Generate trains
  generateTrains();
}

function generateTrains() {
  trains = [];

  for (let i = 0; i < features.trainTypes.length; i++) {
    const type = features.trainTypes[i];
    const track = tracks[rndInt(0, tracks.length - 1)];
    const train = new Train(type, track, rnd(), rndBool() ? 1 : -1, i);
    trains.push(train);
  }

  if (trains.length > 0) {
    selectedTrain = trains[0];
  }
}

// ============================================================================
// TRAINS
// ============================================================================

class Train {
  constructor(type, track, position, direction, id) {
    this.id = id;
    this.type = type;
    this.config = TRAIN_TYPES[type];
    this.track = track;
    this.position = position; // 0-1 along track
    this.direction = direction; // 1 or -1
    this.speed = 0;
    this.targetSpeed = 0;
    this.crashed = false;
    this.crashTimer = 0;
    this.length = 20;
    this.selected = false;
  }

  update() {
    if (this.crashed) {
      this.crashTimer--;
      if (this.crashTimer <= 0) {
        this.crashed = false;
        this.speed = 0;
        this.position = rnd();
      }
      return;
    }

    // Accelerate/decelerate toward target
    if (this.speed < this.targetSpeed) {
      this.speed = Math.min(this.speed + this.config.accel, this.targetSpeed);
    } else if (this.speed > this.targetSpeed) {
      this.speed = Math.max(this.speed - this.config.accel * 2, this.targetSpeed);
    }

    // Move along track
    const moveAmount = (this.speed * this.direction) / this.track.length;
    this.position += moveAmount;

    // Handle track transitions
    if (this.position > 1 || this.position < 0) {
      this.transitionToNextTrack();
    }
  }

  transitionToNextTrack() {
    const currentNode = this.position > 1 ? this.track.nodeB : this.track.nodeA;
    const connections = currentNode.connections.filter(c => c.trackId !== this.track.id);

    if (connections.length === 0) {
      // Dead end - reverse
      this.direction *= -1;
      this.position = constrain(this.position, 0, 1);
      return;
    }

    // Use switch state if applicable
    let nextConn;
    if (currentNode.isSwitch && connections.length > 1) {
      const idx = currentNode.switchState % connections.length;
      nextConn = connections[idx];
    } else {
      nextConn = connections[0];
    }

    const nextTrack = tracks[nextConn.trackId];

    // Determine direction on new track
    if (nextTrack.nodeA === currentNode) {
      this.direction = 1;
      this.position = 0;
    } else {
      this.direction = -1;
      this.position = 1;
    }

    this.track = nextTrack;
  }

  getPosition() {
    return this.track.getPointAt(this.position);
  }

  getAngle() {
    return this.track.getAngle(this.direction);
  }

  crash() {
    this.crashed = true;
    this.crashTimer = 120;
    this.speed = 0;
    this.targetSpeed = 0;
  }

  draw() {
    const pos = this.getPosition();
    const angle = this.getAngle();

    push();
    translate(pos.x, pos.y);
    rotate(angle);

    if (this.crashed) {
      // Crash effect
      const flash = (this.crashTimer % 10) < 5;
      fill(flash ? color(0, 100, 60) : color(40, 100, 50));
      noStroke();
      for (let i = 0; i < 8; i++) {
        const a = (TWO_PI / 8) * i + this.crashTimer * 0.1;
        const r = 15 + sin(this.crashTimer * 0.3) * 10;
        ellipse(cos(a) * r, sin(a) * r, 8, 8);
      }
    } else {
      // Train body
      const lineColor = features.palette.lines[this.track.lineId];

      // Shadow
      noStroke();
      fill(0, 0, 0, 0.2);
      rect(-this.length/2 + 2, 4, this.length, 12, 3);

      // Body
      const bodyColor = color(lineColor[0], lineColor[1] * 0.8, lineColor[2] * 0.9);
      fill(bodyColor);
      stroke(0, 0, 20);
      strokeWeight(1);
      rect(-this.length/2, -6, this.length, 12, 3);

      // Type-specific details
      noStroke();
      fill(0, 0, 100);
      if (this.type === "bullet") {
        // Aerodynamic nose
        triangle(-this.length/2, -4, -this.length/2, 4, -this.length/2 - 8, 0);
        triangle(this.length/2, -4, this.length/2, 4, this.length/2 + 8, 0);
      } else if (this.type === "steam") {
        // Smokestack
        fill(0, 0, 30);
        rect(-this.length/4, -10, 6, 4, 1);
        // Smoke puffs
        if (!paused && frameCount % 8 < 4) {
          fill(0, 0, 80, 0.6);
          ellipse(-this.length/4 + 3, -14, 8, 6);
        }
      } else if (this.type === "electric") {
        // Pantograph
        stroke(0, 0, 40);
        strokeWeight(2);
        line(0, -6, 0, -14);
        line(-4, -14, 4, -14);
      } else if (this.type === "freight") {
        // Cargo boxes
        fill(0, 0, 40);
        rect(-6, -8, 12, 4, 1);
      }

      // Windows
      fill(200, 30, 90, 0.8);
      noStroke();
      for (let i = -2; i <= 2; i++) {
        if (this.type !== "freight") {
          rect(i * 4 - 1.5, -4, 3, 3, 1);
        }
      }

      // Selection indicator
      if (this.selected || this === selectedTrain) {
        noFill();
        stroke(60, 100, 100);
        strokeWeight(2);
        rect(-this.length/2 - 4, -10, this.length + 8, 20, 5);
      }
    }

    pop();
  }
}

// ============================================================================
// SCENERY
// ============================================================================

let sceneryElements = [];

function generateScenery() {
  sceneryElements = [];
  const env = ENVIRONMENTS[features.environment];

  // Generate based on environment type
  for (let i = 0; i < 50; i++) {
    const x = rnd(width);
    const y = rnd(height);

    // Check distance from tracks
    let nearTrack = false;
    for (const track of tracks) {
      const tp = track.getPointAt(0.5);
      if (dist(x, y, tp.x, tp.y) < 40) {
        nearTrack = true;
        break;
      }
    }
    if (nearTrack) continue;

    if (env.trees && rndBool(0.6)) {
      sceneryElements.push({ type: "tree", x, y, size: rnd(8, 16), variant: rndInt(0, 2) });
    } else if (env.buildings && rndBool(0.4)) {
      sceneryElements.push({ type: "building", x, y, w: rnd(15, 30), h: rnd(15, 25), floors: rndInt(2, 5) });
    } else if (env.factories && rndBool(0.3)) {
      sceneryElements.push({ type: "factory", x, y, size: rnd(25, 40) });
    } else if (env.mountains && rndBool(0.2)) {
      sceneryElements.push({ type: "mountain", x, y, size: rnd(40, 80) });
    }
  }

  // Water areas for coastal
  if (env.water) {
    const waterSide = rndBool() ? "bottom" : "right";
    sceneryElements.push({ type: "water", side: waterSide });
  }
}

function drawScenery() {
  const pal = features.palette;

  for (const el of sceneryElements) {
    push();

    if (el.type === "tree") {
      translate(el.x, el.y);
      // Trunk
      fill(30, 50, 35);
      noStroke();
      rect(-2, 0, 4, el.size * 0.6);
      // Foliage
      fill(120 + el.variant * 20, 60, 45);
      if (el.variant === 0) {
        ellipse(0, -el.size * 0.3, el.size, el.size * 1.2);
      } else if (el.variant === 1) {
        triangle(-el.size/2, 0, el.size/2, 0, 0, -el.size);
      } else {
        ellipse(0, -el.size * 0.2, el.size * 1.2, el.size * 0.8);
      }
    }

    else if (el.type === "building") {
      translate(el.x, el.y);
      // Shadow
      fill(0, 0, 0, 0.15);
      rect(3, 3, el.w, el.h);
      // Building
      fill(pal.background[0], pal.background[1] * 0.5, pal.background[2] * 0.7);
      stroke(0, 0, 30);
      strokeWeight(1);
      rect(0, 0, el.w, el.h);
      // Windows
      fill(200, 20, 85);
      noStroke();
      const windowSize = 3;
      const cols = Math.floor(el.w / 6);
      const rows = el.floors;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const wx = 3 + c * 6;
          const wy = 3 + r * (el.h / rows);
          rect(wx, wy, windowSize, windowSize);
        }
      }
    }

    else if (el.type === "factory") {
      translate(el.x, el.y);
      fill(0, 0, 40);
      stroke(0, 0, 25);
      strokeWeight(1);
      rect(0, 0, el.size, el.size * 0.6);
      // Smokestacks
      fill(0, 0, 50);
      rect(el.size * 0.2, -el.size * 0.4, 6, el.size * 0.4);
      rect(el.size * 0.6, -el.size * 0.5, 6, el.size * 0.5);
      // Smoke
      if (!paused) {
        fill(0, 0, 70, 0.4);
        noStroke();
        const t = frameCount * 0.02;
        ellipse(el.size * 0.23, -el.size * 0.5 - sin(t) * 10, 12, 8);
        ellipse(el.size * 0.63, -el.size * 0.6 - sin(t + 1) * 12, 15, 10);
      }
    }

    else if (el.type === "mountain") {
      translate(el.x, el.y);
      // Mountain
      fill(220, 15, 45);
      noStroke();
      triangle(-el.size/2, el.size * 0.3, el.size/2, el.size * 0.3, 0, -el.size * 0.5);
      // Snow cap
      fill(0, 0, 95);
      triangle(-el.size * 0.15, -el.size * 0.2, el.size * 0.15, -el.size * 0.2, 0, -el.size * 0.5);
    }

    else if (el.type === "water") {
      noStroke();
      fill(210, 60, 60, 0.5);
      if (el.side === "bottom") {
        rect(0, height * 0.75, width, height * 0.25);
        // Waves
        for (let i = 0; i < 10; i++) {
          const wx = (i / 10) * width + (frameCount * 0.5) % (width / 10);
          const wy = height * 0.76 + sin(frameCount * 0.05 + i) * 3;
          fill(210, 50, 75, 0.6);
          ellipse(wx, wy, 30, 5);
        }
      } else {
        rect(width * 0.8, 0, width * 0.2, height);
      }
    }

    pop();
  }
}

// ============================================================================
// WEATHER EFFECTS
// ============================================================================

function drawWeather() {
  if (features.weatherEffect === "none") return;

  if (features.weatherEffect === "rain") {
    stroke(210, 30, 70, 0.4);
    strokeWeight(1);
    for (let i = 0; i < 100; i++) {
      const x = (i * 17 + frameCount * 3) % width;
      const y = (i * 23 + frameCount * 8) % height;
      line(x, y, x + 2, y + 8);
    }
  }

  else if (features.weatherEffect === "fog") {
    noStroke();
    fill(0, 0, 90, 0.3);
    for (let i = 0; i < 20; i++) {
      const x = (i * 100 + sin(frameCount * 0.01 + i) * 50) % (width + 100) - 50;
      const y = (i * 80) % height;
      ellipse(x, y, 150, 60);
    }
  }

  else if (features.weatherEffect === "night") {
    // Darken overlay
    fill(240, 50, 10, 0.4);
    noStroke();
    rect(0, 0, width, height);
    // Stars
    fill(60, 80, 100);
    for (let i = 0; i < 30; i++) {
      const x = (i * 37) % width;
      const y = (i * 29) % (height * 0.4);
      const twinkle = sin(frameCount * 0.1 + i) * 0.5 + 0.5;
      ellipse(x, y, 2 * twinkle, 2 * twinkle);
    }
  }
}

// ============================================================================
// DRAWING
// ============================================================================

function drawTracks() {
  const pal = features.palette;

  // Draw track beds
  stroke(pal.tracks[0], pal.tracks[1], pal.tracks[2] * 0.7);
  strokeWeight(12);
  for (const track of tracks) {
    line(track.nodeA.x, track.nodeA.y, track.nodeB.x, track.nodeB.y);
  }

  // Draw rails
  for (const track of tracks) {
    const lineColor = pal.lines[track.lineId];
    stroke(lineColor[0], lineColor[1], lineColor[2]);
    strokeWeight(4);
    line(track.nodeA.x, track.nodeA.y, track.nodeB.x, track.nodeB.y);

    // Sleepers
    stroke(pal.tracks[0], pal.tracks[1], pal.tracks[2]);
    strokeWeight(2);
    const steps = Math.floor(track.length / 15);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = track.getPointAt(t);
      const perpAngle = track.angle + HALF_PI;
      const dx = cos(perpAngle) * 6;
      const dy = sin(perpAngle) * 6;
      line(p.x - dx, p.y - dy, p.x + dx, p.y + dy);
    }

    // Signals
    if (track.hasSignal) {
      const signalPos = track.getPointAt(0.8);
      fill(track.signalState ? color(120, 80, 60) : color(0, 80, 60));
      noStroke();
      ellipse(signalPos.x, signalPos.y - 10, 8, 8);
      fill(0, 0, 30);
      rect(signalPos.x - 2, signalPos.y - 8, 4, 12);
    }
  }
}

function drawNodes() {
  for (const node of nodes) {
    if (node.isStation) {
      // Station
      fill(0, 0, 95);
      stroke(0, 0, 30);
      strokeWeight(2);
      rectMode(CENTER);
      rect(node.x, node.y, 30, 20, 4);
      rectMode(CORNER);

      // Station name
      fill(0, 0, 20);
      noStroke();
      textAlign(CENTER, TOP);
      textSize(9);
      text(node.stationName, node.x, node.y + 14);
    } else if (node.isSwitch) {
      // Switch indicator
      const activeConn = node.connections[node.switchState % node.connections.length];
      const angle = atan2(activeConn.node.y - node.y, activeConn.node.x - node.x);

      fill(50, 80, 70);
      noStroke();
      push();
      translate(node.x, node.y);
      rotate(angle);
      triangle(8, 0, -4, -5, -4, 5);
      pop();

      // Click target
      noFill();
      stroke(50, 60, 60);
      strokeWeight(1);
      ellipse(node.x, node.y, 16, 16);
    }
  }
}

function checkCollisions() {
  for (let i = 0; i < trains.length; i++) {
    if (trains[i].crashed) continue;

    for (let j = i + 1; j < trains.length; j++) {
      if (trains[j].crashed) continue;

      const posA = trains[i].getPosition();
      const posB = trains[j].getPosition();

      if (dist(posA.x, posA.y, posB.x, posB.y) < 25) {
        trains[i].crash();
        trains[j].crash();
      }
    }
  }
}

// ============================================================================
// INPUT HANDLING
// ============================================================================

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas(`railway-sim-${hash.slice(2, 10)}`, 'png');
    return false;
  }

  if (key === 'r' || key === 'R') {
    regenerate();
    return false;
  }

  if (key === ' ') {
    paused = !paused;
    return false;
  }

  if (key === 'n' || key === 'N') {
    dispatchTrain();
    return false;
  }

  if (key === 'x' || key === 'X') {
    if (selectedTrain) {
      const idx = trains.indexOf(selectedTrain);
      if (idx > -1) {
        trains.splice(idx, 1);
        selectedTrain = trains.length > 0 ? trains[0] : null;
      }
    }
    return false;
  }

  // Train controls
  if (selectedTrain && !selectedTrain.crashed) {
    if (keyCode === UP_ARROW || key === 'w' || key === 'W') {
      selectedTrain.targetSpeed = Math.min(selectedTrain.targetSpeed + 0.5, selectedTrain.config.speed);
    }
    if (keyCode === DOWN_ARROW || key === 's' || key === 'S') {
      selectedTrain.targetSpeed = Math.max(selectedTrain.targetSpeed - 0.5, -selectedTrain.config.speed * 0.5);
    }
    if (keyCode === LEFT_ARROW || key === 'a' || key === 'A') {
      selectedTrain.direction = -1;
    }
    if (keyCode === RIGHT_ARROW || key === 'd' || key === 'D') {
      selectedTrain.direction = 1;
    }
  }

  return true;
}

function mousePressed() {
  // Check for train selection
  for (const train of trains) {
    const pos = train.getPosition();
    if (dist(mouseX, mouseY, pos.x, pos.y) < 20) {
      selectedTrain = train;
      return;
    }
  }

  // Check for switch toggle
  for (const node of nodes) {
    if (node.isSwitch && dist(mouseX, mouseY, node.x, node.y) < 15) {
      node.switchState = (node.switchState + 1) % node.connections.length;
      return;
    }
  }
}

function dispatchTrain() {
  const typeRoll = rollRarity(0.50, 0.28, 0.15, 0.07);
  let type;
  if (typeRoll === "legendary") type = "bullet";
  else if (typeRoll === "rare") type = "steam";
  else if (typeRoll === "uncommon") type = "electric";
  else type = rndBool(0.6) ? "diesel" : "freight";

  const track = tracks[rndInt(0, tracks.length - 1)];
  const train = new Train(type, track, rnd(), rndBool() ? 1 : -1, trains.length);
  trains.push(train);
  selectedTrain = train;
}

function regenerate() {
  hash = "0x" + Array(64).fill(0).map(() =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  generateFeatures();
  generateNetwork();
  generateScenery();

  if (typeof window.syncUI === 'function') {
    window.syncUI();
  }
}

// ============================================================================
// P5 LIFECYCLE
// ============================================================================

function setup() {
  createCanvas(700, 700);
  colorMode(HSB, 360, 100, 100, 1);

  generateFeatures();
  generateNetwork();
  generateScenery();
}

function draw() {
  // Background
  const bg = features.palette.background;
  background(bg[0], bg[1], bg[2]);

  // Scenery (behind tracks)
  drawScenery();

  // Tracks and nodes
  drawTracks();
  drawNodes();

  // Update and draw trains
  if (!paused) {
    for (const train of trains) {
      train.update();
    }
    checkCollisions();
  }

  for (const train of trains) {
    train.draw();
  }

  // Weather overlay
  drawWeather();

  // Speed indicator for selected train
  if (selectedTrain) {
    drawSpeedometer();
  }
}

function drawSpeedometer() {
  const x = 60;
  const y = height - 50;

  push();
  fill(0, 0, 20, 0.7);
  noStroke();
  rect(x - 50, y - 30, 100, 50, 8);

  fill(0, 0, 90);
  textAlign(CENTER, CENTER);
  textSize(11);
  text(selectedTrain.type.toUpperCase(), x, y - 18);

  // Speed bar
  const maxSpeed = selectedTrain.config.speed;
  const speedPct = Math.abs(selectedTrain.speed) / maxSpeed;
  const targetPct = Math.abs(selectedTrain.targetSpeed) / maxSpeed;

  fill(0, 0, 40);
  rect(x - 40, y, 80, 12, 3);

  fill(selectedTrain.speed >= 0 ? 120 : 0, 70, 70);
  rect(x - 40, y, 80 * speedPct, 12, 3);

  stroke(60, 100, 100);
  strokeWeight(2);
  line(x - 40 + 80 * targetPct, y - 2, x - 40 + 80 * targetPct, y + 14);

  pop();
}

// ============================================================================
// EXPORTS FOR UI
// ============================================================================

window.railwaySim = {
  getFeatures: () => features,
  getHash: () => hash,
  regenerate,
  dispatchTrain,
  setParameter,
  resetToOriginal,
  hasModifications: () => hasOverrides,
  getTrains: () => trains,
  getSelectedTrain: () => selectedTrain,
  togglePause: () => { paused = !paused; return paused; }
};
