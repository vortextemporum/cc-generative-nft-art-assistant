/**
 * MICRO-COSMOS v3.2.0
 * A multi-scale microscopic ecosystem with liquid glass aesthetics
 * Fixed rectangular canvas, zoom-only navigation
 *
 * Scale Hierarchy (spatially distributed by zoom level):
 * - Macro (0.5x-2x): Amoebae, paramecia, rotifers (spread wide)
 * - Cellular (2x-8x): Cells, bacteria, diatoms (medium spread)
 * - Organelle (8x-25x): Viruses, mitochondria (tighter spread)
 * - Molecular (25x-60x): DNA, proteins, ribosomes, ATP (central area)
 * - Atomic (40x+): Atoms, water molecules (small central area)
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
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        d = (d + 1) | 0;
        t = (t + d) | 0;
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    };
}

function initRandom(hashStr) {
    const h = hashStr.slice(2);
    const seeds = [];
    for (let i = 0; i < 4; i++) {
        seeds.push(parseInt(h.slice(i * 8, (i + 1) * 8), 16) || 0);
    }
    return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

let R;
function rnd(min = 0, max = 1) {
    if (max === undefined) { max = min; min = 0; }
    return min + R() * (max - min);
}
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rndChoice(arr) { return arr[Math.floor(R() * arr.length)]; }
function rndBool(p = 0.5) { return R() < p; }
function rndGaussian(mean = 0, std = 1) {
    const u1 = R(), u2 = R();
    return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function smoothNoise(x, y, t) {
    const n1 = Math.sin(x * 0.02 + t) * Math.cos(y * 0.02);
    const n2 = Math.sin((x + y) * 0.015 - t * 0.7) * 0.5;
    const n3 = Math.cos(x * 0.03 - y * 0.02 + t * 0.3) * 0.3;
    return n1 + n2 + n3;
}

// Calculate opacity based on zoom level - fade in/out at boundaries
function calculateZoomOpacity(zoom, minZoom, maxZoom) {
    if (zoom < minZoom || zoom > maxZoom) return 0;

    const range = maxZoom - minZoom;
    const fadeIn = range * 0.25;  // 25% of range for fade in
    const fadeOut = range * 0.4;  // 40% of range for fade out (longer fade out)

    let opacity = 1;

    // Fade in near minZoom
    if (zoom < minZoom + fadeIn) {
        opacity = (zoom - minZoom) / fadeIn;
    }
    // Fade out near maxZoom
    else if (zoom > maxZoom - fadeOut) {
        opacity = (maxZoom - zoom) / fadeOut;
    }

    // Reduce brightness at high zoom levels to compensate for objects filling more screen
    // At zoom 1: full brightness, at zoom 80+: 40% brightness
    const zoomBrightness = Math.max(0.4, 1 - (zoom - 1) * 0.008);
    opacity *= zoomBrightness;

    return Math.max(0, Math.min(1, opacity));
}

function rollRarity() {
    const r = R();
    if (r < 0.03) return 'legendary';
    if (r < 0.15) return 'rare';
    if (r < 0.40) return 'uncommon';
    return 'common';
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

let features = {};
let renderer, scene, camera;
let organisms = [];
let molecularObjects = [];
let atomicObjects = [];
let clock;
let paused = false;
let time = 0;

// Fixed canvas size
const CANVAS_SIZE = 800;

// View state - NO PANNING
const viewX = 0, viewY = 0;
let targetZoom = 1, currentZoom = 1;
let zoomLevel = 'macro';
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 150;

// World bounds - everything spawns in visible area
const WORLD_SIZE = 400; // Smaller world, everything visible

// ============================================================================
// GLASS COLOR PALETTES
// ============================================================================

const GLASS_PALETTES = {
    bioluminescent: {
        primary: ['#00ffaa', '#00aaff', '#aa00ff', '#ff00aa'],
        secondary: ['#44ffcc', '#44ccff', '#cc44ff', '#ff44cc'],
        glow: '#88ffdd',
        background: '#030810'
    },
    deepSea: {
        primary: ['#0088cc', '#00ccaa', '#0066aa', '#44aacc'],
        secondary: ['#22aadd', '#22ddbb', '#2288bb', '#55bbdd'],
        glow: '#66ddff',
        background: '#020608'
    },
    plasma: {
        primary: ['#ff4488', '#ff8844', '#ffaa00', '#ff44aa'],
        secondary: ['#ff6699', '#ffaa66', '#ffcc44', '#ff66bb'],
        glow: '#ffaa88',
        background: '#0a0508'
    },
    aurora: {
        primary: ['#44ff88', '#88ff44', '#44ffcc', '#88ffaa'],
        secondary: ['#66ffaa', '#aaffaa', '#66ffdd', '#aaffcc'],
        glow: '#aaffaa',
        background: '#050a08'
    }
};

// ============================================================================
// FEATURE GENERATION
// ============================================================================

function generateFeatures() {
    R = initRandom(hash);

    const ecosystemType = rndChoice(['pond', 'blood', 'soil', 'marine']);
    const activityLevel = rndChoice(['dormant', 'normal', 'active', 'hyperactive']);
    const dominantSpecies = rndChoice(['bacteria', 'amoeba', 'algae', 'mixed']);
    const rarity = rollRarity();
    const glassPalette = rndChoice(Object.keys(GLASS_PALETTES));

    features = {
        ecosystemType,
        activityLevel,
        dominantSpecies,
        rarity,
        hasRareOrganism: rarity === 'legendary' || rarity === 'rare',
        rareOrganism: rarity === 'legendary' ?
            rndChoice(['tardigrade', 'giant_amoeba']) :
            rndChoice(['bacteriophage_swarm', 'diatom_colony']),
        glassPalette: glassPalette,
        palette: GLASS_PALETTES[glassPalette],
        nutrientLevel: rnd(0.3, 1),
        temperature: rnd(0.5, 1.5),
        glowIntensity: rnd(0.5, 1.2)
    };

    return features;
}

// ============================================================================
// THREE.JS SETUP - FIXED SQUARE CANVAS
// ============================================================================

function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(features.palette.background);

    // Orthographic camera for square view
    const frustumSize = 400;
    camera = new THREE.OrthographicCamera(
        -frustumSize / 2, frustumSize / 2,
        frustumSize / 2, -frustumSize / 2,
        0.1, 10000
    );
    camera.position.z = 1000;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(CANVAS_SIZE, CANVAS_SIZE);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    clock = new THREE.Clock();
}

// ============================================================================
// GLASS MATERIAL FACTORY
// ============================================================================

function createGlassMaterial(color, opacity = 0.6) {
    return new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
}

function createGlowMesh(geometry, color, scale = 1.3, opacity = 0.15) {
    const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide
    });
    glowMat.userData.isGlow = true; // Mark as glow for extra dimming at high zoom
    const glow = new THREE.Mesh(geometry.clone(), glowMat);
    glow.scale.setScalar(scale);
    return glow;
}

// Get extra dimming factor for glow materials at high zoom
function getGlowDimFactor(zoom) {
    // Glows get extra dimming: at zoom 40+ they're significantly reduced
    if (zoom < 10) return 1;
    return Math.max(0.2, 1 - (zoom - 10) * 0.015);
}

// Update blending mode based on zoom - additive at low zoom, normal at high zoom
function updateBlendingForZoom(material, zoom) {
    if (!material) return;

    // Transition from additive to normal blending between zoom 15-30
    const useNormalBlending = zoom > 20;

    if (useNormalBlending && material.blending === THREE.AdditiveBlending) {
        material.blending = THREE.NormalBlending;
        material.needsUpdate = true;
    } else if (!useNormalBlending && material.blending === THREE.NormalBlending && material.userData.wasAdditive) {
        material.blending = THREE.AdditiveBlending;
        material.needsUpdate = true;
    }

    // Track original state
    if (material.userData.wasAdditive === undefined) {
        material.userData.wasAdditive = material.blending === THREE.AdditiveBlending;
    }
}

// ============================================================================
// ORGANISM BASE CLASS
// ============================================================================

class Organism {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = 0;
        this.vy = 0;
        this.angle = rnd(Math.PI * 2);
        this.angularVel = 0;
        this.size = 10;
        this.health = 1;
        this.age = 0;
        this.mesh = null;
        this.glowMesh = null;
        this.minZoomVisible = 0;
        this.maxZoomVisible = Infinity;
        this.pulsePhase = rnd(Math.PI * 2);
    }

    update(dt) {
        if (paused) return;

        this.age += dt;
        this.pulsePhase += dt * 2;

        // Organic noise movement
        const noiseX = smoothNoise(this.x, this.y, time) * 3;
        const noiseY = smoothNoise(this.y, this.x, time * 1.1) * 3;

        this.x += (this.vx + noiseX) * dt * features.temperature;
        this.y += (this.vy + noiseY) * dt * features.temperature;
        this.angle += this.angularVel * dt;

        // Soft boundary - organisms stay in visible area
        const boundary = WORLD_SIZE * 0.48;
        if (Math.abs(this.x) > boundary) {
            this.vx -= Math.sign(this.x) * 5;
            this.x = Math.sign(this.x) * boundary;
        }
        if (Math.abs(this.y) > boundary) {
            this.vy -= Math.sign(this.y) * 5;
            this.y = Math.sign(this.y) * boundary;
        }

        // Brownian motion
        this.vx += rndGaussian(0, 0.5) * dt;
        this.vy += rndGaussian(0, 0.5) * dt;
        this.vx *= 0.98;
        this.vy *= 0.98;

        if (this.mesh) {
            this.mesh.position.x = this.x;
            this.mesh.position.y = this.y;
            this.mesh.rotation.z = this.angle;

            // Calculate zoom-based opacity for smooth transitions
            const zoomOpacity = calculateZoomOpacity(currentZoom, this.minZoomVisible, this.maxZoomVisible);
            const isVisible = zoomOpacity > 0.01 && this.health > 0;
            this.mesh.visible = isVisible;

            // Apply opacity and blending mode to all materials
            if (isVisible) {
                const glowDim = getGlowDimFactor(currentZoom);
                this.mesh.traverse((child) => {
                    if (child.material) {
                        if (child.material.userData.baseOpacity === undefined) {
                            child.material.userData.baseOpacity = child.material.opacity;
                        }
                        // Extra dimming for glow materials
                        const dimFactor = child.material.userData.isGlow ? glowDim : 1;
                        child.material.opacity = child.material.userData.baseOpacity * zoomOpacity * dimFactor;
                        // Switch blending mode at high zoom to prevent white-out
                        updateBlendingForZoom(child.material, currentZoom);
                    }
                });
            }

            if (this.glowMesh) {
                const pulse = 1 + Math.sin(this.pulsePhase) * 0.1;
                this.glowMesh.scale.setScalar(pulse * 1.3);
            }
        }
    }

    isNear(other, dist) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return dx*dx + dy*dy < dist*dist;
    }

    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    die() {
        this.health = 0;
        if (this.mesh) this.mesh.visible = false;
    }

    getBoundingRadius() {
        return this.size;
    }
}

// ============================================================================
// MACRO LEVEL: AMOEBA (0.5x - 3x)
// ============================================================================

class Amoeba extends Organism {
    constructor(x, y, giant = false) {
        super(x, y, 'amoeba');
        this.giant = giant;
        this.size = giant ? rnd(60, 80) : rnd(35, 50);
        this.points = [];
        this.numPoints = 16;
        this.pseudopodTarget = null;
        this.eating = false;
        this.minZoomVisible = 0.3;
        this.maxZoomVisible = giant ? 4 : 5;
        this.color = giant ? '#ff6644' : rndChoice(features.palette.primary);

        for (let i = 0; i < this.numPoints; i++) {
            const angle = (i / this.numPoints) * Math.PI * 2;
            this.points.push({
                baseAngle: angle,
                radius: this.size * (0.8 + rnd(0.4)),
                targetRadius: this.size,
                phase: rnd(Math.PI * 2),
                speed: rnd(0.5, 2)
            });
        }

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();

        const shape = new THREE.Shape();
        this.updateShape(shape);

        const geometry = new THREE.ShapeGeometry(shape);
        const material = createGlassMaterial(this.color, 0.5);
        this.bodyMesh = new THREE.Mesh(geometry, material);
        group.add(this.bodyMesh);

        // Nucleus
        const nucleusGeom = new THREE.CircleGeometry(this.size * 0.2, 16);
        const nucleusMat = createGlassMaterial('#446688', 0.7);
        this.nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);
        this.nucleus.position.z = 1;
        group.add(this.nucleus);

        const nucleusGlow = createGlowMesh(nucleusGeom, '#88aacc', 1.4, 0.2);
        this.nucleus.add(nucleusGlow);

        group.position.set(this.x, this.y, rnd(-5, 5));
        this.mesh = group;
        scene.add(group);
    }

    updateShape(shape) {
        const pts = [];
        for (let i = 0; i <= this.numPoints; i++) {
            const p = this.points[i % this.numPoints];
            const x = Math.cos(p.baseAngle) * p.radius;
            const y = Math.sin(p.baseAngle) * p.radius;
            pts.push(new THREE.Vector2(x, y));
        }

        if (pts.length > 0) {
            shape.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
                const prev = pts[i - 1];
                const curr = pts[i];
                const cpx = (prev.x + curr.x) / 2;
                const cpy = (prev.y + curr.y) / 2;
                shape.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
            }
            shape.closePath();
        }
    }

    update(dt) {
        super.update(dt);

        for (const p of this.points) {
            p.phase += dt * p.speed;
            const noise = Math.sin(p.phase) * 0.2 + Math.sin(p.phase * 2.5) * 0.1;
            p.radius += (p.targetRadius * (1 + noise) - p.radius) * dt * 2;
        }

        if (this.pseudopodTarget) {
            const dx = this.pseudopodTarget.x - this.x;
            const dy = this.pseudopodTarget.y - this.y;
            const targetAngle = Math.atan2(dy, dx);

            for (const p of this.points) {
                const angleDiff = Math.abs(p.baseAngle - targetAngle);
                if (angleDiff < 0.5 || angleDiff > Math.PI * 2 - 0.5) {
                    p.targetRadius = this.size * 1.5;
                } else {
                    p.targetRadius = this.size * 0.85;
                }
            }

            this.vx += dx * 0.003;
            this.vy += dy * 0.003;
        } else {
            for (const p of this.points) {
                p.targetRadius = this.size * (0.85 + rnd(0.3));
            }
            this.angle += rndGaussian(0, 0.1) * dt;
            this.vx += Math.cos(this.angle) * 8 * dt;
            this.vy += Math.sin(this.angle) * 8 * dt;
        }

        if (this.bodyMesh) {
            const shape = new THREE.Shape();
            this.updateShape(shape);
            this.bodyMesh.geometry.dispose();
            this.bodyMesh.geometry = new THREE.ShapeGeometry(shape);
        }

        this.hunt();
    }

    hunt() {
        if (this.eating) return;

        let nearest = null;
        let nearestDist = Infinity;
        const huntRange = this.giant ? 150 : 100;
        const targetTypes = this.giant ? ['paramecium', 'rotifer'] : ['bacteria'];

        for (const org of organisms) {
            if (targetTypes.includes(org.type) && org.health > 0) {
                const dist = this.distanceTo(org);
                if (dist < nearestDist && dist < huntRange) {
                    nearest = org;
                    nearestDist = dist;
                }
            }
        }

        this.pseudopodTarget = nearest;

        if (nearest && nearestDist < this.size * 0.6) {
            this.eating = true;
            nearest.die();
            setTimeout(() => { this.eating = false; }, 800);
        }
    }
}

// ============================================================================
// MACRO LEVEL: PARAMECIUM (0.5x - 4x)
// ============================================================================

class Paramecium extends Organism {
    constructor(x, y) {
        super(x, y, 'paramecium');
        this.size = rnd(25, 40);
        this.ciliaPhase = 0;
        this.minZoomVisible = 0.3;
        this.maxZoomVisible = 5;
        this.color = rndChoice(features.palette.primary);

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();
        const color = new THREE.Color(this.color);

        const bodyShape = new THREE.Shape();
        const w = this.size;
        const h = this.size * 0.4;

        bodyShape.moveTo(-w * 0.5, 0);
        bodyShape.quadraticCurveTo(-w * 0.5, h, -w * 0.3, h);
        bodyShape.quadraticCurveTo(0, h * 0.85, w * 0.35, h * 0.9);
        bodyShape.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.5, 0);
        bodyShape.quadraticCurveTo(w * 0.5, -h * 0.5, w * 0.35, -h * 0.9);
        bodyShape.quadraticCurveTo(0, -h * 0.85, -w * 0.3, -h);
        bodyShape.quadraticCurveTo(-w * 0.5, -h, -w * 0.5, 0);

        const bodyGeom = new THREE.ShapeGeometry(bodyShape);
        const bodyMat = createGlassMaterial(color, 0.45);
        group.add(new THREE.Mesh(bodyGeom, bodyMat));

        // Cilia
        this.ciliaGroup = new THREE.Group();
        const numCilia = 40;
        for (let i = 0; i < numCilia; i++) {
            const t = i / numCilia;
            const angle = t * Math.PI * 2;
            const x = Math.cos(angle) * w * 0.52 * (1 + 0.3 * Math.sin(angle * 2));
            const y = Math.sin(angle) * h * (1 + 0.2 * Math.cos(angle * 3));

            const ciliumGeom = new THREE.BufferGeometry();
            const points = new Float32Array([
                x, y, 0,
                x + Math.cos(angle) * this.size * 0.1, y + Math.sin(angle) * this.size * 0.1, 0
            ]);
            ciliumGeom.setAttribute('position', new THREE.BufferAttribute(points, 3));
            const ciliumMat = new THREE.LineBasicMaterial({
                color: color.clone().offsetHSL(0, -0.2, 0.2),
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            });
            const cilium = new THREE.Line(ciliumGeom, ciliumMat);
            cilium.userData = { baseAngle: angle, baseX: x, baseY: y };
            this.ciliaGroup.add(cilium);
        }
        group.add(this.ciliaGroup);

        group.position.set(this.x, this.y, rnd(-5, 5));
        this.mesh = group;
        scene.add(group);
    }

    update(dt) {
        super.update(dt);

        this.ciliaPhase += dt * 20;
        const speed = 50;
        this.vx += Math.cos(this.angle) * speed * dt;
        this.vy += Math.sin(this.angle) * speed * dt;

        if (this.ciliaGroup) {
            this.ciliaGroup.children.forEach((cilium, i) => {
                const data = cilium.userData;
                const phase = this.ciliaPhase + i * 0.2;
                const wave = Math.sin(phase) * this.size * 0.08;
                const positions = cilium.geometry.attributes.position.array;
                positions[3] = data.baseX + Math.cos(data.baseAngle) * (this.size * 0.1 + wave);
                positions[4] = data.baseY + Math.sin(data.baseAngle) * (this.size * 0.1 + wave);
                cilium.geometry.attributes.position.needsUpdate = true;
            });
        }

        if (rndBool(0.01)) {
            this.angle += rnd(-0.5, 0.5);
        }
    }
}

// ============================================================================
// MACRO LEVEL: ROTIFER (0.5x - 3x)
// ============================================================================

class Rotifer extends Organism {
    constructor(x, y) {
        super(x, y, 'rotifer');
        this.size = rnd(40, 60);
        this.wheelPhase = 0;
        this.minZoomVisible = 0.3;
        this.maxZoomVisible = 4;
        this.color = rndChoice(features.palette.primary);

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();
        const color = new THREE.Color(this.color);

        const bodyShape = new THREE.Shape();
        const w = this.size;
        const h = this.size * 0.35;

        bodyShape.moveTo(-w * 0.4, 0);
        bodyShape.bezierCurveTo(-w * 0.4, h, -w * 0.1, h * 1.2, w * 0.2, h * 0.8);
        bodyShape.bezierCurveTo(w * 0.5, h * 0.4, w * 0.5, -h * 0.4, w * 0.2, -h * 0.8);
        bodyShape.bezierCurveTo(-w * 0.1, -h * 1.2, -w * 0.4, -h, -w * 0.4, 0);

        const bodyGeom = new THREE.ShapeGeometry(bodyShape);
        const bodyMat = createGlassMaterial(color, 0.45);
        group.add(new THREE.Mesh(bodyGeom, bodyMat));

        // Wheel organs
        this.leftWheel = this.createWheel(color);
        this.leftWheel.position.set(-w * 0.35, h * 0.3, 0.1);
        group.add(this.leftWheel);

        this.rightWheel = this.createWheel(color);
        this.rightWheel.position.set(-w * 0.35, -h * 0.3, 0.1);
        group.add(this.rightWheel);

        group.position.set(this.x, this.y, rnd(-5, 5));
        this.mesh = group;
        scene.add(group);
    }

    createWheel(color) {
        const wheelGroup = new THREE.Group();
        const numCilia = 12;

        for (let i = 0; i < numCilia; i++) {
            const angle = (i / numCilia) * Math.PI * 2;
            const ciliaGeom = new THREE.BufferGeometry();
            const r = this.size * 0.1;
            const points = new Float32Array([
                Math.cos(angle) * r * 0.5, Math.sin(angle) * r * 0.5, 0,
                Math.cos(angle) * r, Math.sin(angle) * r, 0
            ]);
            ciliaGeom.setAttribute('position', new THREE.BufferAttribute(points, 3));
            const ciliaMat = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });
            const cilia = new THREE.Line(ciliaGeom, ciliaMat);
            cilia.userData = { baseAngle: angle, r: r };
            wheelGroup.add(cilia);
        }

        return wheelGroup;
    }

    update(dt) {
        super.update(dt);

        this.wheelPhase += dt * 25;

        [this.leftWheel, this.rightWheel].forEach(wheel => {
            wheel.children.forEach((cilia, i) => {
                const data = cilia.userData;
                const offset = Math.sin(this.wheelPhase + i * 0.5) * this.size * 0.03;
                const positions = cilia.geometry.attributes.position.array;
                positions[3] = Math.cos(data.baseAngle) * (data.r + offset);
                positions[4] = Math.sin(data.baseAngle) * (data.r + offset);
                cilia.geometry.attributes.position.needsUpdate = true;
            });
        });

        const speed = 25;
        this.vx += Math.cos(this.angle) * speed * dt;
        this.vy += Math.sin(this.angle) * speed * dt;
    }
}

// ============================================================================
// CELLULAR LEVEL: BACTERIA (2x - 10x)
// ============================================================================

class Bacteria extends Organism {
    constructor(x, y) {
        super(x, y, 'bacteria');
        this.size = rnd(8, 15);
        this.shape = rndChoice(['rod', 'coccus', 'spiral', 'vibrio']);
        this.flagella = this.shape === 'rod' || this.shape === 'vibrio';
        this.flagellaPhase = rnd(Math.PI * 2);
        this.tumbleTimer = 0;
        this.tumbleInterval = rnd(1, 3);
        this.swimming = true;
        this.minZoomVisible = 1.5;
        this.maxZoomVisible = 12;
        this.color = rndChoice(features.palette.primary);

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();
        const color = new THREE.Color(this.color);

        let bodyGeom;
        switch (this.shape) {
            case 'rod':
                bodyGeom = new THREE.CapsuleGeometry(this.size * 0.35, this.size * 0.8, 8, 4);
                break;
            case 'coccus':
                bodyGeom = new THREE.SphereGeometry(this.size * 0.45, 12, 10);
                break;
            case 'spiral':
                bodyGeom = this.createSpiralGeometry();
                break;
            case 'vibrio':
                bodyGeom = this.createVibrioGeometry();
                break;
            default:
                bodyGeom = new THREE.SphereGeometry(this.size * 0.45, 12, 10);
        }

        const bodyMat = createGlassMaterial(color, 0.7);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        group.add(body);

        this.glowMesh = createGlowMesh(bodyGeom, this.color, 1.5, 0.12);
        group.add(this.glowMesh);

        if (this.flagella) {
            const flagGeom = new THREE.BufferGeometry();
            const points = [];
            for (let i = 0; i < 10; i++) {
                const t = i / 9;
                points.push(
                    -this.size * 0.4 - t * this.size * 1.5,
                    Math.sin(t * Math.PI * 3) * this.size * 0.2,
                    0
                );
            }
            flagGeom.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
            const flagMat = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.35,
                blending: THREE.AdditiveBlending
            });
            const flagella = new THREE.Line(flagGeom, flagMat);
            flagella.name = 'flagella';
            group.add(flagella);
        }

        group.position.set(this.x, this.y, rnd(-3, 3));
        this.mesh = group;
        scene.add(group);
    }

    createSpiralGeometry() {
        const points = [];
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const x = (t - 0.5) * this.size * 2;
            const y = Math.sin(t * Math.PI * 4) * this.size * 0.3;
            points.push(new THREE.Vector3(x, y, 0));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        return new THREE.TubeGeometry(curve, 20, this.size * 0.15, 8, false);
    }

    createVibrioGeometry() {
        const points = [];
        for (let i = 0; i <= 10; i++) {
            const t = i / 10;
            const x = (t - 0.5) * this.size * 1.5;
            const y = Math.sin(t * Math.PI) * this.size * 0.4;
            points.push(new THREE.Vector3(x, y, 0));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        return new THREE.TubeGeometry(curve, 10, this.size * 0.18, 8, false);
    }

    update(dt) {
        super.update(dt);

        this.tumbleTimer += dt;
        if (this.tumbleTimer > this.tumbleInterval) {
            this.tumbleTimer = 0;
            this.tumbleInterval = rnd(0.5, 2);
            this.angle += rnd(-Math.PI, Math.PI);
            this.swimming = !this.swimming || rndBool(0.8);
        }

        if (this.swimming) {
            const speed = this.flagella ? 30 : 15;
            this.vx += Math.cos(this.angle) * speed * dt;
            this.vy += Math.sin(this.angle) * speed * dt;
        }

        if (this.mesh && this.flagella) {
            this.flagellaPhase += dt * 12;
            const flag = this.mesh.getObjectByName('flagella');
            if (flag) {
                const positions = flag.geometry.attributes.position.array;
                for (let i = 0; i < 10; i++) {
                    const t = i / 9;
                    positions[i * 3 + 1] = Math.sin(t * Math.PI * 3 + this.flagellaPhase) * this.size * 0.2;
                }
                flag.geometry.attributes.position.needsUpdate = true;
            }
        }
    }
}

// ============================================================================
// CELLULAR LEVEL: DIATOM (1.5x - 8x)
// ============================================================================

class Diatom extends Organism {
    constructor(x, y) {
        super(x, y, 'diatom');
        this.size = rnd(15, 30);
        this.shape = rndChoice(['pennate', 'centric', 'triangular']);
        this.symmetry = this.shape === 'centric' ? rndInt(6, 12) : 2;
        this.minZoomVisible = 1;
        this.maxZoomVisible = 10;
        this.rotationSpeed = rnd(-0.3, 0.3);

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();
        const colors = ['#eeddcc', '#ddccbb', '#ccbbaa', '#ffeedd'];
        const color = new THREE.Color(rndChoice(colors));

        let shellGeom;
        switch (this.shape) {
            case 'centric':
                shellGeom = new THREE.CircleGeometry(this.size, this.symmetry * 2);
                break;
            case 'pennate':
                shellGeom = new THREE.CapsuleGeometry(this.size * 0.3, this.size, 8, 4);
                break;
            case 'triangular':
                shellGeom = new THREE.CircleGeometry(this.size, 3);
                break;
        }

        const shellMat = createGlassMaterial(color, 0.5);
        group.add(new THREE.Mesh(shellGeom, shellMat));

        const innerGlow = createGlowMesh(shellGeom, '#ffffff', 0.85, 0.2);
        group.add(innerGlow);

        this.glowMesh = createGlowMesh(shellGeom, features.palette.glow, 1.3, 0.1);
        group.add(this.glowMesh);

        group.position.set(this.x, this.y, rnd(-3, 3));
        this.mesh = group;
        scene.add(group);
    }

    update(dt) {
        super.update(dt);
        this.angularVel = this.rotationSpeed + rndGaussian(0, 0.05);
    }
}

// ============================================================================
// CELLULAR LEVEL: EUKARYOTIC CELL (1x - 8x)
// ============================================================================

class Cell extends Organism {
    constructor(x, y) {
        super(x, y, 'cell');
        this.size = rnd(50, 80);
        this.organelles = [];
        this.minZoomVisible = 0.8;
        this.maxZoomVisible = 10;
        this.color = rndChoice(features.palette.primary);

        this.createMesh();
        this.createOrganelles();
    }

    createMesh() {
        const group = new THREE.Group();

        const membraneGeom = new THREE.CircleGeometry(this.size, 32);
        const membraneMat = createGlassMaterial(this.color, 0.25);
        group.add(new THREE.Mesh(membraneGeom, membraneMat));

        const membraneGlow = createGlowMesh(membraneGeom, this.color, 1.12, 0.1);
        group.add(membraneGlow);

        const cytoGeom = new THREE.CircleGeometry(this.size * 0.95, 32);
        const cytoMat = createGlassMaterial(features.palette.glow, 0.1);
        group.add(new THREE.Mesh(cytoGeom, cytoMat));

        group.position.set(this.x, this.y, rnd(-10, 10));
        this.mesh = group;
        scene.add(group);
    }

    createOrganelles() {
        // Nucleus
        const nucleusGeom = new THREE.CircleGeometry(this.size * 0.25, 24);
        const nucleusMat = createGlassMaterial('#5588bb', 0.6);
        this.nucleusMesh = new THREE.Mesh(nucleusGeom, nucleusMat);
        this.nucleusMesh.position.set(rnd(-this.size * 0.1, this.size * 0.1), rnd(-this.size * 0.1, this.size * 0.1), 0.2);
        this.mesh.add(this.nucleusMesh);

        const nucleusGlow = createGlowMesh(nucleusGeom, '#88bbff', 1.3, 0.2);
        this.nucleusMesh.add(nucleusGlow);

        // Mitochondria
        const numMito = rndInt(5, 10);
        for (let i = 0; i < numMito; i++) {
            const mitoSize = this.size * rnd(0.06, 0.1);
            const mitoGeom = new THREE.CapsuleGeometry(mitoSize * 0.4, mitoSize, 6, 3);
            const mitoMat = createGlassMaterial('#cc7755', 0.5);
            const mito = new THREE.Mesh(mitoGeom, mitoMat);

            const angle = rnd(Math.PI * 2);
            const dist = rnd(this.size * 0.35, this.size * 0.8);
            mito.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, 0.15);
            mito.rotation.z = rnd(Math.PI * 2);
            this.mesh.add(mito);
            this.organelles.push({ mesh: mito, phase: rnd(Math.PI * 2) });
        }
    }

    update(dt) {
        super.update(dt);

        for (const org of this.organelles) {
            org.phase += dt;
            org.mesh.position.x += Math.sin(org.phase) * 0.05;
            org.mesh.position.y += Math.cos(org.phase * 1.3) * 0.05;
        }
    }
}

// ============================================================================
// ORGANELLE LEVEL: VIRUS (5x - 30x)
// ============================================================================

class Virus extends Organism {
    constructor(x, y) {
        super(x, y, 'virus');
        this.size = rnd(4, 8);
        this.virusType = rndChoice(['icosahedral', 'helical', 'bacteriophage', 'corona']);
        this.minZoomVisible = 4;
        this.maxZoomVisible = 35;
        this.color = rndChoice(features.palette.secondary);

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();
        const color = new THREE.Color(this.color);

        switch (this.virusType) {
            case 'icosahedral':
                this.createIcosahedral(group, color);
                break;
            case 'helical':
                this.createHelical(group, color);
                break;
            case 'bacteriophage':
                this.createBacteriophage(group, color);
                break;
            case 'corona':
                this.createCorona(group, color);
                break;
        }

        group.position.set(this.x, this.y, rnd(-2, 2));
        this.mesh = group;
        scene.add(group);
    }

    createIcosahedral(group, color) {
        const geom = new THREE.IcosahedronGeometry(this.size, 0);
        const mat = createGlassMaterial(color, 0.75);
        group.add(new THREE.Mesh(geom, mat));
        this.glowMesh = createGlowMesh(geom, this.color, 1.5, 0.15);
        group.add(this.glowMesh);
    }

    createHelical(group, color) {
        const points = [];
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            points.push(new THREE.Vector3(
                (t - 0.5) * this.size * 4,
                Math.sin(t * Math.PI * 4) * this.size * 0.3,
                Math.cos(t * Math.PI * 4) * this.size * 0.3
            ));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const geom = new THREE.TubeGeometry(curve, 20, this.size * 0.2, 6, false);
        const mat = createGlassMaterial(color, 0.7);
        group.add(new THREE.Mesh(geom, mat));
    }

    createBacteriophage(group, color) {
        const mat = createGlassMaterial(color, 0.75);

        const headGeom = new THREE.IcosahedronGeometry(this.size, 0);
        const head = new THREE.Mesh(headGeom, mat);
        head.position.y = this.size;
        group.add(head);

        const tailGeom = new THREE.CylinderGeometry(this.size * 0.15, this.size * 0.15, this.size * 2, 6);
        group.add(new THREE.Mesh(tailGeom, mat));

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const legGeom = new THREE.CylinderGeometry(this.size * 0.04, this.size * 0.04, this.size, 4);
            const leg = new THREE.Mesh(legGeom, mat);
            leg.position.set(Math.cos(angle) * this.size * 0.4, -this.size * 0.7, Math.sin(angle) * this.size * 0.4);
            leg.rotation.x = Math.PI / 4;
            leg.rotation.z = angle;
            group.add(leg);
        }
    }

    createCorona(group, color) {
        const mat = createGlassMaterial(color, 0.65);

        const coreGeom = new THREE.SphereGeometry(this.size, 12, 10);
        group.add(new THREE.Mesh(coreGeom, mat));

        this.glowMesh = createGlowMesh(coreGeom, this.color, 1.4, 0.12);
        group.add(this.glowMesh);

        const numSpikes = 16;
        for (let i = 0; i < numSpikes; i++) {
            const phi = Math.acos(1 - 2 * (i + 0.5) / numSpikes);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            const spikeGeom = new THREE.ConeGeometry(this.size * 0.15, this.size * 0.5, 4);
            const spike = new THREE.Mesh(spikeGeom, mat);

            const x = Math.sin(phi) * Math.cos(theta) * this.size;
            const y = Math.sin(phi) * Math.sin(theta) * this.size;
            const z = Math.cos(phi) * this.size;

            spike.position.set(x, y, z);
            spike.lookAt(x * 2, y * 2, z * 2);
            group.add(spike);
        }
    }

    update(dt) {
        super.update(dt);
        this.vx += rndGaussian(0, 2) * dt;
        this.vy += rndGaussian(0, 2) * dt;
    }
}

// ============================================================================
// ORGANELLE LEVEL: MITOCHONDRIA (8x - 30x)
// ============================================================================

class Mitochondria extends Organism {
    constructor(x, y) {
        super(x, y, 'mitochondria');
        this.size = rnd(8, 15);
        this.minZoomVisible = 6;
        this.maxZoomVisible = 35;
        this.cristaePhase = rnd(Math.PI * 2);

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();

        // Outer membrane
        const outerGeom = new THREE.CapsuleGeometry(this.size * 0.4, this.size, 10, 6);
        const outerMat = createGlassMaterial('#cc8866', 0.5);
        group.add(new THREE.Mesh(outerGeom, outerMat));

        this.glowMesh = createGlowMesh(outerGeom, '#ffaa88', 1.4, 0.12);
        group.add(this.glowMesh);

        // Inner membrane folds (cristae)
        for (let i = 0; i < 5; i++) {
            const y = (i / 4 - 0.5) * this.size * 0.8;
            const foldGeom = new THREE.PlaneGeometry(this.size * 0.6, this.size * 0.08);
            const foldMat = createGlassMaterial('#aa6644', 0.4);
            const fold = new THREE.Mesh(foldGeom, foldMat);
            fold.position.set(0, y, 0.1);
            fold.rotation.x = Math.PI / 2;
            group.add(fold);
        }

        group.position.set(this.x, this.y, rnd(-2, 2));
        group.rotation.z = rnd(Math.PI * 2);
        this.mesh = group;
        scene.add(group);
    }

    update(dt) {
        super.update(dt);
        this.cristaePhase += dt;
        this.angularVel = Math.sin(this.cristaePhase * 0.5) * 0.1;
    }
}

// ============================================================================
// MOLECULAR LEVEL: DNA (15x - 80x)
// ============================================================================

class FloatingDNA {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = rnd(12, 25);
        this.rotationSpeed = rnd(0.3, 0.8);
        this.driftAngle = rnd(Math.PI * 2);
        this.driftSpeed = rnd(1, 3);
        this.minZoom = 12;
        this.maxZoom = 55; // Fade out before atomic level

        this.createMesh();
    }

    createMesh() {
        this.group = new THREE.Group();

        const dnaPoints1 = [], dnaPoints2 = [];
        const dnaLength = this.size;
        const dnaRadius = this.size * 0.1;

        for (let i = 0; i <= 50; i++) {
            const t = i / 50;
            const angle = t * Math.PI * 8;
            const y = (t - 0.5) * dnaLength;

            dnaPoints1.push(new THREE.Vector3(Math.cos(angle) * dnaRadius, y, Math.sin(angle) * dnaRadius));
            dnaPoints2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * dnaRadius, y, Math.sin(angle + Math.PI) * dnaRadius));
        }

        const curve1 = new THREE.CatmullRomCurve3(dnaPoints1);
        const curve2 = new THREE.CatmullRomCurve3(dnaPoints2);

        const dnaGeom1 = new THREE.TubeGeometry(curve1, 50, this.size * 0.015, 6, false);
        const dnaGeom2 = new THREE.TubeGeometry(curve2, 50, this.size * 0.015, 6, false);

        const dnaMat1 = createGlassMaterial('#4488ff', 0.85);
        const dnaMat2 = createGlassMaterial('#44ff88', 0.85);

        this.group.add(new THREE.Mesh(dnaGeom1, dnaMat1));
        this.group.add(new THREE.Mesh(dnaGeom2, dnaMat2));

        // Base pairs
        const basePairColors = ['#ff5555', '#55ff55', '#ffff55', '#ff55ff'];
        for (let i = 0; i < 25; i++) {
            const t = i / 24;
            const angle = t * Math.PI * 8;
            const y = (t - 0.5) * dnaLength;

            const rungGeom = new THREE.CylinderGeometry(this.size * 0.008, this.size * 0.008, dnaRadius * 2, 4);
            const rungMat = createGlassMaterial(basePairColors[i % 4], 0.75);
            const rung = new THREE.Mesh(rungGeom, rungMat);
            rung.position.set(0, y, 0);
            rung.rotation.z = Math.PI / 2;
            rung.rotation.y = angle;
            this.group.add(rung);
        }

        this.group.position.set(this.x, this.y, rnd(-3, 3));
        this.group.rotation.x = Math.PI / 2;
        scene.add(this.group);
    }

    update(dt) {
        this.group.rotation.y += this.rotationSpeed * dt;

        this.driftAngle += rndGaussian(0, 0.1) * dt;
        this.x += Math.cos(this.driftAngle) * this.driftSpeed * dt;
        this.y += Math.sin(this.driftAngle) * this.driftSpeed * dt;

        // Keep in bounds
        const boundary = WORLD_SIZE * 0.45;
        if (Math.abs(this.x) > boundary) this.x = Math.sign(this.x) * boundary;
        if (Math.abs(this.y) > boundary) this.y = Math.sign(this.y) * boundary;

        this.group.position.x = this.x;
        this.group.position.y = this.y;

        // Zoom-based opacity fading
        const zoomOpacity = calculateZoomOpacity(currentZoom, this.minZoom, this.maxZoom);
        this.group.visible = zoomOpacity > 0.01;
        if (this.group.visible) {
            const glowDim = getGlowDimFactor(currentZoom);
            this.group.traverse((child) => {
                if (child.material) {
                    if (child.material.userData.baseOpacity === undefined) {
                        child.material.userData.baseOpacity = child.material.opacity;
                    }
                    const dimFactor = child.material.userData.isGlow ? glowDim : 1;
                    child.material.opacity = child.material.userData.baseOpacity * zoomOpacity * dimFactor;
                    updateBlendingForZoom(child.material, currentZoom);
                }
            });
        }
    }
}

// ============================================================================
// MOLECULAR LEVEL: PROTEIN (15x - 80x)
// ============================================================================

class FloatingProtein {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = rnd(6, 14);
        this.rotationSpeed = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize();
        this.minZoom = 12;
        this.maxZoom = 55; // Fade out before atomic level

        this.createMesh();
    }

    createMesh() {
        this.group = new THREE.Group();
        const colors = features.palette.secondary;
        const color = rndChoice(colors);

        const numDomains = rndInt(4, 8);
        let x = 0, y = 0, z = 0;

        for (let i = 0; i < numDomains; i++) {
            const domainSize = this.size * rnd(0.2, 0.4);
            const geom = rndBool(0.5) ?
                new THREE.SphereGeometry(domainSize, 8, 6) :
                new THREE.IcosahedronGeometry(domainSize, 0);

            const mat = createGlassMaterial(color, 0.8);
            const domain = new THREE.Mesh(geom, mat);
            domain.position.set(x, y, z);
            this.group.add(domain);

            x += rnd(-this.size * 0.25, this.size * 0.25);
            y += rnd(-this.size * 0.25, this.size * 0.25);
            z += rnd(-this.size * 0.15, this.size * 0.15);
        }

        this.group.position.set(this.x, this.y, rnd(-3, 3));
        scene.add(this.group);
    }

    update(dt) {
        this.group.rotation.x += this.rotationSpeed.x * dt;
        this.group.rotation.y += this.rotationSpeed.y * dt;
        this.group.rotation.z += this.rotationSpeed.z * dt;

        this.x += rndGaussian(0, 2) * dt;
        this.y += rndGaussian(0, 2) * dt;

        const boundary = WORLD_SIZE * 0.45;
        if (Math.abs(this.x) > boundary) this.x = Math.sign(this.x) * boundary;
        if (Math.abs(this.y) > boundary) this.y = Math.sign(this.y) * boundary;

        this.group.position.x = this.x;
        this.group.position.y = this.y;

        // Zoom-based opacity fading
        const zoomOpacity = calculateZoomOpacity(currentZoom, this.minZoom, this.maxZoom);
        this.group.visible = zoomOpacity > 0.01;
        if (this.group.visible) {
            const glowDim = getGlowDimFactor(currentZoom);
            this.group.traverse((child) => {
                if (child.material) {
                    if (child.material.userData.baseOpacity === undefined) {
                        child.material.userData.baseOpacity = child.material.opacity;
                    }
                    const dimFactor = child.material.userData.isGlow ? glowDim : 1;
                    child.material.opacity = child.material.userData.baseOpacity * zoomOpacity * dimFactor;
                    updateBlendingForZoom(child.material, currentZoom);
                }
            });
        }
    }
}

// ============================================================================
// MOLECULAR LEVEL: ATP (20x - 100x)
// ============================================================================

class FloatingATP {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = rnd(2, 4);
        this.vx = rndGaussian(0, 5);
        this.vy = rndGaussian(0, 5);
        this.minZoom = 18;
        this.maxZoom = 65; // Fade out before atomic level

        this.createMesh();
    }

    createMesh() {
        this.group = new THREE.Group();

        const baseGeom = new THREE.TorusGeometry(this.size * 0.3, this.size * 0.1, 6, 8);
        const baseMat = createGlassMaterial('#44aaff', 0.75);
        this.group.add(new THREE.Mesh(baseGeom, baseMat));

        const phosphateColors = ['#ffaa00', '#ff8800', '#ff6600'];
        for (let i = 0; i < 3; i++) {
            const pGeom = new THREE.SphereGeometry(this.size * 0.18, 6, 5);
            const pMat = createGlassMaterial(phosphateColors[i], 0.85);
            const p = new THREE.Mesh(pGeom, pMat);
            p.position.x = this.size * 0.5 + i * this.size * 0.35;
            this.group.add(p);
        }

        this.group.position.set(this.x, this.y, rnd(-2, 2));
        scene.add(this.group);
    }

    update(dt) {
        this.vx += rndGaussian(0, 10) * dt;
        this.vy += rndGaussian(0, 10) * dt;
        this.vx *= 0.95;
        this.vy *= 0.95;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        const boundary = WORLD_SIZE * 0.45;
        if (Math.abs(this.x) > boundary) { this.x = Math.sign(this.x) * boundary; this.vx *= -0.5; }
        if (Math.abs(this.y) > boundary) { this.y = Math.sign(this.y) * boundary; this.vy *= -0.5; }

        this.group.position.x = this.x;
        this.group.position.y = this.y;
        this.group.rotation.z += dt * 2;

        // Zoom-based opacity fading
        const zoomOpacity = calculateZoomOpacity(currentZoom, this.minZoom, this.maxZoom);
        this.group.visible = zoomOpacity > 0.01;
        if (this.group.visible) {
            const glowDim = getGlowDimFactor(currentZoom);
            this.group.traverse((child) => {
                if (child.material) {
                    if (child.material.userData.baseOpacity === undefined) {
                        child.material.userData.baseOpacity = child.material.opacity;
                    }
                    const dimFactor = child.material.userData.isGlow ? glowDim : 1;
                    child.material.opacity = child.material.userData.baseOpacity * zoomOpacity * dimFactor;
                    updateBlendingForZoom(child.material, currentZoom);
                }
            });
        }
    }
}

// ============================================================================
// MOLECULAR LEVEL: RIBOSOME (20x - 100x)
// ============================================================================

class FloatingRibosome {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = rnd(3, 6);
        this.phase = rnd(Math.PI * 2);
        this.minZoom = 18;
        this.maxZoom = 65; // Fade out before atomic level

        this.createMesh();
    }

    createMesh() {
        this.group = new THREE.Group();

        const largeGeom = new THREE.SphereGeometry(this.size * 0.6, 8, 6);
        const largeMat = createGlassMaterial('#8866cc', 0.75);
        const large = new THREE.Mesh(largeGeom, largeMat);
        large.position.y = this.size * 0.2;
        this.group.add(large);

        const smallGeom = new THREE.SphereGeometry(this.size * 0.4, 8, 6);
        const smallMat = createGlassMaterial('#aa88ee', 0.75);
        const small = new THREE.Mesh(smallGeom, smallMat);
        small.position.y = -this.size * 0.3;
        this.group.add(small);

        this.group.position.set(this.x, this.y, rnd(-2, 2));
        scene.add(this.group);
    }

    update(dt) {
        this.phase += dt;
        this.group.rotation.z = Math.sin(this.phase * 0.5) * 0.2;

        this.x += rndGaussian(0, 0.3) * dt;
        this.y += rndGaussian(0, 0.3) * dt;

        const boundary = WORLD_SIZE * 0.45;
        if (Math.abs(this.x) > boundary) this.x = Math.sign(this.x) * boundary;
        if (Math.abs(this.y) > boundary) this.y = Math.sign(this.y) * boundary;

        this.group.position.x = this.x;
        this.group.position.y = this.y;

        // Zoom-based opacity fading
        const zoomOpacity = calculateZoomOpacity(currentZoom, this.minZoom, this.maxZoom);
        this.group.visible = zoomOpacity > 0.01;
        if (this.group.visible) {
            const glowDim = getGlowDimFactor(currentZoom);
            this.group.traverse((child) => {
                if (child.material) {
                    if (child.material.userData.baseOpacity === undefined) {
                        child.material.userData.baseOpacity = child.material.opacity;
                    }
                    const dimFactor = child.material.userData.isGlow ? glowDim : 1;
                    child.material.opacity = child.material.userData.baseOpacity * zoomOpacity * dimFactor;
                    updateBlendingForZoom(child.material, currentZoom);
                }
            });
        }
    }
}

// ============================================================================
// ATOMIC LEVEL: ATOM (40x+)
// ============================================================================

class Atom {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.element = rndChoice(['C', 'N', 'O', 'H', 'P', 'S']);
        this.size = this.element === 'H' ? rnd(0.8, 1.2) : rnd(1.5, 2.5);
        this.electronPhase = rnd(Math.PI * 2);
        this.minZoom = 40;
        this.maxZoom = 200;

        const colors = {
            C: '#666666', N: '#3344ff', O: '#ff3344',
            H: '#ffffff', P: '#ff8800', S: '#ffff00'
        };
        this.color = colors[this.element];

        this.createMesh();
    }

    createMesh() {
        this.group = new THREE.Group();

        // Nucleus
        const nucleusGeom = new THREE.SphereGeometry(this.size, 10, 8);
        const nucleusMat = createGlassMaterial(this.color, 0.8);
        this.group.add(new THREE.Mesh(nucleusGeom, nucleusMat));

        const glow = createGlowMesh(nucleusGeom, this.color, 1.6, 0.2);
        this.group.add(glow);

        // Electron orbits
        const numOrbits = this.element === 'H' ? 1 : rndInt(1, 3);
        this.electrons = [];

        for (let i = 0; i < numOrbits; i++) {
            const orbitRadius = this.size * (1.8 + i * 0.8);

            // Orbit ring
            const orbitGeom = new THREE.TorusGeometry(orbitRadius, 0.05, 4, 32);
            const orbitMat = new THREE.MeshBasicMaterial({
                color: 0x4488ff,
                transparent: true,
                opacity: 0.15,
                blending: THREE.AdditiveBlending
            });
            const orbit = new THREE.Mesh(orbitGeom, orbitMat);
            orbit.rotation.x = Math.PI / 2 + rnd(-0.3, 0.3);
            orbit.rotation.y = rnd(-0.3, 0.3);
            this.group.add(orbit);

            // Electrons
            const numElectrons = rndInt(1, 2);
            for (let j = 0; j < numElectrons; j++) {
                const electronGeom = new THREE.SphereGeometry(this.size * 0.2, 6, 4);
                const electronMat = createGlassMaterial('#88aaff', 0.9);
                const electron = new THREE.Mesh(electronGeom, electronMat);

                const electronGlow = createGlowMesh(electronGeom, '#aaccff', 2, 0.3);
                electron.add(electronGlow);

                this.group.add(electron);
                this.electrons.push({
                    mesh: electron,
                    orbit: orbitRadius,
                    speed: rnd(2, 4),
                    phase: rnd(Math.PI * 2) + j * Math.PI,
                    tilt: orbit.rotation.x,
                    yaw: orbit.rotation.y
                });
            }
        }

        this.group.position.set(this.x, this.y, rnd(-1, 1));
        scene.add(this.group);
    }

    update(dt) {
        this.electronPhase += dt;

        // Animate electrons
        for (const e of this.electrons) {
            e.phase += e.speed * dt;
            const x = Math.cos(e.phase) * e.orbit;
            const z = Math.sin(e.phase) * e.orbit;
            const y = z * Math.sin(e.tilt);
            e.mesh.position.set(x, y, z * Math.cos(e.tilt));
        }

        // Brownian motion
        this.x += rndGaussian(0, 0.5) * dt;
        this.y += rndGaussian(0, 0.5) * dt;

        // Keep atoms in small viewable area at high zoom
        const boundary = 10;
        if (Math.abs(this.x) > boundary) this.x = Math.sign(this.x) * boundary;
        if (Math.abs(this.y) > boundary) this.y = Math.sign(this.y) * boundary;

        this.group.position.x = this.x;
        this.group.position.y = this.y;

        // Zoom-based opacity fading
        const zoomOpacity = calculateZoomOpacity(currentZoom, this.minZoom, this.maxZoom);
        this.group.visible = zoomOpacity > 0.01;
        if (this.group.visible) {
            const glowDim = getGlowDimFactor(currentZoom);
            this.group.traverse((child) => {
                if (child.material) {
                    if (child.material.userData.baseOpacity === undefined) {
                        child.material.userData.baseOpacity = child.material.opacity;
                    }
                    const dimFactor = child.material.userData.isGlow ? glowDim : 1;
                    child.material.opacity = child.material.userData.baseOpacity * zoomOpacity * dimFactor;
                    updateBlendingForZoom(child.material, currentZoom);
                }
            });
        }
    }
}

// ============================================================================
// ATOMIC LEVEL: WATER MOLECULE (50x+)
// ============================================================================

class WaterMolecule {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = rnd(1.5, 2.5);
        this.vx = rndGaussian(0, 3);
        this.vy = rndGaussian(0, 3);
        this.angle = rnd(Math.PI * 2);
        this.minZoom = 50;
        this.maxZoom = 200;

        this.createMesh();
    }

    createMesh() {
        this.group = new THREE.Group();

        // Oxygen (red, larger)
        const oxygenGeom = new THREE.SphereGeometry(this.size, 8, 6);
        const oxygenMat = createGlassMaterial('#ff4444', 0.75);
        this.group.add(new THREE.Mesh(oxygenGeom, oxygenMat));

        const oxyGlow = createGlowMesh(oxygenGeom, '#ff6666', 1.4, 0.15);
        this.group.add(oxyGlow);

        // Hydrogens (white, smaller, at 104.5 degree angle)
        const bondAngle = 104.5 * Math.PI / 180;
        const bondLength = this.size * 1.5;

        for (let i = 0; i < 2; i++) {
            const angle = (i === 0 ? bondAngle / 2 : -bondAngle / 2);
            const hx = Math.cos(angle) * bondLength;
            const hy = Math.sin(angle) * bondLength;

            const hydrogenGeom = new THREE.SphereGeometry(this.size * 0.6, 6, 5);
            const hydrogenMat = createGlassMaterial('#ffffff', 0.8);
            const hydrogen = new THREE.Mesh(hydrogenGeom, hydrogenMat);
            hydrogen.position.set(hx, hy, 0);
            this.group.add(hydrogen);

            // Bond
            const bondGeom = new THREE.CylinderGeometry(this.size * 0.1, this.size * 0.1, bondLength, 4);
            const bondMat = createGlassMaterial('#aaaaff', 0.4);
            const bond = new THREE.Mesh(bondGeom, bondMat);
            bond.position.set(hx / 2, hy / 2, 0);
            bond.rotation.z = angle - Math.PI / 2;
            this.group.add(bond);
        }

        this.group.position.set(this.x, this.y, rnd(-1, 1));
        this.group.rotation.z = this.angle;
        scene.add(this.group);
    }

    update(dt) {
        this.vx += rndGaussian(0, 8) * dt;
        this.vy += rndGaussian(0, 8) * dt;
        this.vx *= 0.96;
        this.vy *= 0.96;

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.angle += rndGaussian(0, 0.5) * dt;

        // Keep water molecules in small viewable area at high zoom
        const boundary = 10;
        if (Math.abs(this.x) > boundary) { this.x = Math.sign(this.x) * boundary; this.vx *= -0.5; }
        if (Math.abs(this.y) > boundary) { this.y = Math.sign(this.y) * boundary; this.vy *= -0.5; }

        this.group.position.x = this.x;
        this.group.position.y = this.y;
        this.group.rotation.z = this.angle;

        // Zoom-based opacity fading
        const zoomOpacity = calculateZoomOpacity(currentZoom, this.minZoom, this.maxZoom);
        this.group.visible = zoomOpacity > 0.01;
        if (this.group.visible) {
            const glowDim = getGlowDimFactor(currentZoom);
            this.group.traverse((child) => {
                if (child.material) {
                    if (child.material.userData.baseOpacity === undefined) {
                        child.material.userData.baseOpacity = child.material.opacity;
                    }
                    const dimFactor = child.material.userData.isGlow ? glowDim : 1;
                    child.material.opacity = child.material.userData.baseOpacity * zoomOpacity * dimFactor;
                    updateBlendingForZoom(child.material, currentZoom);
                }
            });
        }
    }
}

// ============================================================================
// ECOSYSTEM SPAWNING
// ============================================================================

function spawnOrganisms() {
    organisms = [];
    molecularObjects = [];
    atomicObjects = [];

    // Spawn ranges based on zoom visibility
    // At zoom Z, visible area is ~400/Z units wide, centered at 0
    const macroRange = WORLD_SIZE * 0.4;      // 160 - visible at 1x (400 units visible)
    const cellularRange = WORLD_SIZE * 0.25;  // 100 - visible at 2-4x (100-200 units visible)
    const organelleRange = WORLD_SIZE * 0.12; // 48 - visible at 8-15x (26-50 units visible)
    const molecularRange = WORLD_SIZE * 0.05; // 20 - visible at 15-40x (10-26 units visible)
    const atomicRange = 8;                    // 8 - visible at 50-80x (5-8 units visible)

    // MACRO LEVEL (0.5x - 4x): Large organisms - REDUCED COUNTS
    // Amoebae
    for (let i = 0; i < 4; i++) {
        organisms.push(new Amoeba(
            rnd(-macroRange, macroRange),
            rnd(-macroRange, macroRange)
        ));
    }

    // Paramecia
    for (let i = 0; i < 8; i++) {
        organisms.push(new Paramecium(
            rnd(-macroRange, macroRange),
            rnd(-macroRange, macroRange)
        ));
    }

    // Rotifers
    for (let i = 0; i < 3; i++) {
        organisms.push(new Rotifer(
            rnd(-macroRange, macroRange),
            rnd(-macroRange, macroRange)
        ));
    }

    // CELLULAR LEVEL (2x - 10x): Cells, bacteria, diatoms
    // Bacteria - spread across cellular range
    for (let i = 0; i < 50; i++) {
        organisms.push(new Bacteria(
            rnd(-cellularRange, cellularRange),
            rnd(-cellularRange, cellularRange)
        ));
    }

    // Diatoms
    for (let i = 0; i < 18; i++) {
        organisms.push(new Diatom(
            rnd(-cellularRange, cellularRange),
            rnd(-cellularRange, cellularRange)
        ));
    }

    // Cells
    for (let i = 0; i < 8; i++) {
        organisms.push(new Cell(
            rnd(-cellularRange, cellularRange),
            rnd(-cellularRange, cellularRange)
        ));
    }

    // ORGANELLE LEVEL (8x - 30x): Viruses, mitochondria
    // Viruses - in organelle range
    for (let i = 0; i < 40; i++) {
        organisms.push(new Virus(
            rnd(-organelleRange, organelleRange),
            rnd(-organelleRange, organelleRange)
        ));
    }

    // Mitochondria (free-floating)
    for (let i = 0; i < 30; i++) {
        organisms.push(new Mitochondria(
            rnd(-organelleRange, organelleRange),
            rnd(-organelleRange, organelleRange)
        ));
    }

    // MOLECULAR LEVEL (15x - 80x): DNA, proteins, ATP, ribosomes
    // DNA - in molecular range
    for (let i = 0; i < 20; i++) {
        molecularObjects.push(new FloatingDNA(
            rnd(-molecularRange, molecularRange),
            rnd(-molecularRange, molecularRange)
        ));
    }

    // Proteins
    for (let i = 0; i < 40; i++) {
        molecularObjects.push(new FloatingProtein(
            rnd(-molecularRange, molecularRange),
            rnd(-molecularRange, molecularRange)
        ));
    }

    // ATP
    for (let i = 0; i < 60; i++) {
        molecularObjects.push(new FloatingATP(
            rnd(-molecularRange, molecularRange),
            rnd(-molecularRange, molecularRange)
        ));
    }

    // Ribosomes
    for (let i = 0; i < 35; i++) {
        molecularObjects.push(new FloatingRibosome(
            rnd(-molecularRange, molecularRange),
            rnd(-molecularRange, molecularRange)
        ));
    }

    // ATOMIC LEVEL (50x+): Atoms, water molecules - SMALL RANGE so visible at high zoom
    // Atoms
    for (let i = 0; i < 50; i++) {
        atomicObjects.push(new Atom(
            rnd(-atomicRange, atomicRange),
            rnd(-atomicRange, atomicRange)
        ));
    }

    // Water molecules
    for (let i = 0; i < 80; i++) {
        atomicObjects.push(new WaterMolecule(
            rnd(-atomicRange, atomicRange),
            rnd(-atomicRange, atomicRange)
        ));
    }

    // Rare organisms
    if (features.hasRareOrganism) {
        if (features.rareOrganism === 'giant_amoeba') {
            organisms.push(new Amoeba(
                rnd(-macroRange/2, macroRange/2),
                rnd(-macroRange/2, macroRange/2),
                true
            ));
        }
    }
}

function updateEcosystem(dt) {
    time += dt;

    // Update organisms
    organisms = organisms.filter(org => org.health > 0);
    for (const org of organisms) {
        org.update(dt);
    }

    // Update molecular objects
    for (const mol of molecularObjects) {
        mol.update(dt);
    }

    // Update atomic objects
    for (const atom of atomicObjects) {
        atom.update(dt);
    }
}

// ============================================================================
// ZOOM MANAGEMENT
// ============================================================================

function updateZoomLevel() {
    if (currentZoom < 2) {
        zoomLevel = 'macro';
    } else if (currentZoom < 8) {
        zoomLevel = 'cellular';
    } else if (currentZoom < 25) {
        zoomLevel = 'organelle';
    } else if (currentZoom < 60) {
        zoomLevel = 'molecular';
    } else {
        zoomLevel = 'atomic';
    }

    scene.background = new THREE.Color(features.palette.background);
}

function updateCamera() {
    currentZoom += (targetZoom - currentZoom) * 0.1;

    const frustumSize = 400 / currentZoom;

    camera.left = -frustumSize / 2;
    camera.right = frustumSize / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();

    updateZoomLevel();
}

// ============================================================================
// INPUT HANDLING (ZOOM ONLY)
// ============================================================================

function setupInputHandlers() {
    const container = document.getElementById('canvas-container');

    // Mouse wheel zoom
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.88 : 1.12;
        targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom * zoomFactor));
    }, { passive: false });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.key.toLowerCase()) {
            case 's':
                saveImage();
                break;
            case 'r':
                regenerate();
                break;
            case ' ':
                paused = !paused;
                showStatus(paused ? 'PAUSED' : 'PLAYING');
                setTimeout(hideStatus, 1500);
                e.preventDefault();
                break;
            case '1':
                targetZoom = 1;
                break;
            case '2':
                targetZoom = 4;
                break;
            case '3':
                targetZoom = 15;
                break;
            case '4':
                targetZoom = 40;
                break;
            case '5':
                targetZoom = 80;
                break;
        }
    });

    // Touch pinch zoom
    let lastTouchDist = 0;

    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDist = Math.sqrt(dx*dx + dy*dy);
        }
    });

    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (lastTouchDist > 0) {
                const scale = dist / lastTouchDist;
                targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom * scale));
            }
            lastTouchDist = dist;
        }
    }, { passive: false });

    container.addEventListener('touchend', () => {
        lastTouchDist = 0;
    });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function saveImage() {
    const link = document.createElement('a');
    link.download = `micro-cosmos-${Date.now()}.png`;
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
    showStatus('Image saved!');
    setTimeout(hideStatus, 1500);
}

function regenerate() {
    hash = "0x" + Array(64).fill(0).map(() =>
        "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

    // Clear scene
    for (const org of organisms) {
        if (org.mesh) scene.remove(org.mesh);
    }
    for (const mol of molecularObjects) {
        if (mol.group) scene.remove(mol.group);
    }
    for (const atom of atomicObjects) {
        if (atom.group) scene.remove(atom.group);
    }

    generateFeatures();
    spawnOrganisms();
    updateUI();

    targetZoom = 1;
    time = 0;

    showStatus('New ecosystem!');
    setTimeout(hideStatus, 1500);
}

function showStatus(message) {
    const status = document.getElementById('status');
    if (status) {
        status.textContent = message;
        status.classList.add('visible');
    }
}

function hideStatus() {
    const status = document.getElementById('status');
    if (status) {
        status.classList.remove('visible');
    }
}

function updateUI() {
    const featuresDiv = document.getElementById('features');
    if (featuresDiv) {
        featuresDiv.innerHTML = `
            <div class="feature"><span class="label">Ecosystem:</span> <span class="value">${features.ecosystemType}</span></div>
            <div class="feature"><span class="label">Palette:</span> <span class="value">${features.glassPalette}</span></div>
            <div class="feature"><span class="label">Rarity:</span> <span class="value rarity-${features.rarity}">${features.rarity}</span></div>
        `;
    }

    const hashDiv = document.getElementById('hash-display');
    if (hashDiv) {
        hashDiv.textContent = hash.slice(0, 18) + '...';
    }

    const zoomDiv = document.getElementById('zoom-display');
    if (zoomDiv) {
        const mag = Math.round(currentZoom * 10);
        zoomDiv.textContent = `${mag}x - ${zoomLevel}`;
    }
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.1);

    if (!paused) {
        updateEcosystem(dt);
    }

    updateCamera();
    updateUI();

    renderer.render(scene, camera);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
    generateFeatures();
    console.log('Features:', features);

    initThree();
    spawnOrganisms();
    setupInputHandlers();
    updateUI();

    // Start at low zoom
    targetZoom = 1;
    currentZoom = 1;

    animate();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
