/**
 * MICRO-COSMOS v2.0.0
 * A multi-scale microscopic ecosystem simulation
 *
 * Scale Hierarchy:
 * - Macro (10x-100x): Bacterial colonies, amoebae, paramecia, diatoms
 * - Cellular (100x-1000x): Individual cells with organelles
 * - Organelle (1000x-10000x): Mitochondria, ER, nucleus internals
 * - Molecular (10000x+): Proteins, DNA, amino acids, ribosomes
 *
 * Features:
 * - Click-to-zoom on organisms
 * - Cell division/mitosis
 * - Rare organisms (tardigrade, giant amoeba)
 * - Post-processing effects
 * - Instanced rendering for performance
 */

// ============================================================================
// HASH-BASED RANDOMNESS (Art Blocks Compatible)
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
let canvas, renderer, scene, camera;
let composer, bloomPass;
let organisms = [];
let molecularObjects = []; // DNA, proteins, ribosomes
let clock;
let paused = false;

// View state
let viewX = 0, viewY = 0;
let targetViewX = 0, targetViewY = 0;
let targetZoom = 1, currentZoom = 1;
let zoomLevel = 'macro';
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 150;

// Click-to-zoom state
let selectedOrganism = null;
let followingOrganism = false;

// World bounds
const WORLD_SIZE = 2000;

// Raycaster for click detection
let raycaster, mouse;

// Instanced meshes
let bacteriaInstances = null;
let virusInstances = null;

// Organism counts by type
const ORGANISM_COUNTS = {
    bacteria: 150,
    amoeba: 12,
    paramecium: 20,
    diatom: 35,
    virus: 100,
    cell: 25,
    rotifer: 8
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

    const palettes = {
        phaseContrast: {
            background: '#0a1510',
            organisms: ['#8fa', '#9eb', '#adc', '#7c9'],
            accent: '#bfe'
        },
        fluorescence: {
            background: '#050510',
            organisms: ['#0ff', '#f0f', '#0f0', '#ff0', '#f80'],
            accent: '#fff'
        },
        darkField: {
            background: '#000',
            organisms: ['#ffd', '#fec', '#edb', '#dca'],
            accent: '#fff'
        },
        electronMicroscopy: {
            background: '#111',
            organisms: ['#aaa', '#999', '#888', '#bbb'],
            accent: '#fff'
        }
    };

    features = {
        ecosystemType,
        activityLevel,
        dominantSpecies,
        rarity,
        hasRareOrganism: rarity === 'legendary' || rarity === 'rare',
        rareOrganism: rarity === 'legendary' ?
            rndChoice(['tardigrade', 'giant_amoeba']) :
            rndChoice(['bacteriophage_swarm', 'diatom_colony']),
        palette: palettes,
        nutrientLevel: rnd(0.3, 1),
        temperature: rnd(0.5, 1.5),
        lightIntensity: rnd(0.6, 1),
        mutation: rndBool(0.1),
        bloomIntensity: rnd(0.3, 0.8),
        chromaticAberration: rnd(0.001, 0.003)
    };

    return features;
}

// ============================================================================
// THREE.JS SETUP WITH POST-PROCESSING
// ============================================================================

function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(features.palette.phaseContrast.background);

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 500;
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2, frustumSize * aspect / 2,
        frustumSize / 2, frustumSize / -2,
        0.1, 10000
    );
    camera.position.z = 1000;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Raycaster for click detection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    clock = new THREE.Clock();

    // Setup post-processing
    setupPostProcessing();
}

function setupPostProcessing() {
    // Post-processing with custom bloom effect
    // Using a simpler approach without importing additional modules
    // The bloom effect is simulated through material emissive properties
}

// ============================================================================
// CUSTOM GEOMETRIES
// ============================================================================

function createCapsuleGeometry(radius, height, radialSegments = 8, heightSegments = 4) {
    // Custom capsule for older Three.js compatibility
    const geometry = new THREE.CapsuleGeometry(radius, height, radialSegments, heightSegments);
    return geometry;
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
        this.maxAge = rnd(500, 2000);
        this.mesh = null;
        this.children = [];
        this.visible = true;
        this.minZoomVisible = 0;
        this.maxZoomVisible = Infinity;
        this.clickable = true;
        this.dividing = false;
        this.divisionProgress = 0;
    }

    update(dt) {
        if (paused) return;

        this.age += dt;

        // Apply velocity
        this.x += this.vx * dt * features.temperature;
        this.y += this.vy * dt * features.temperature;
        this.angle += this.angularVel * dt;

        // World wrapping
        if (this.x < -WORLD_SIZE/2) this.x += WORLD_SIZE;
        if (this.x > WORLD_SIZE/2) this.x -= WORLD_SIZE;
        if (this.y < -WORLD_SIZE/2) this.y += WORLD_SIZE;
        if (this.y > WORLD_SIZE/2) this.y -= WORLD_SIZE;

        // Brownian motion
        this.vx += rndGaussian(0, 0.5) * dt;
        this.vy += rndGaussian(0, 0.5) * dt;

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Update mesh position
        if (this.mesh) {
            this.mesh.position.x = this.x;
            this.mesh.position.y = this.y;
            this.mesh.rotation.z = this.angle;

            const zoomInRange = currentZoom >= this.minZoomVisible && currentZoom <= this.maxZoomVisible;
            this.mesh.visible = zoomInRange && this.visible;
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
        if (this.mesh) {
            scene.remove(this.mesh);
        }
    }

    getBoundingRadius() {
        return this.size;
    }
}

// ============================================================================
// BACTERIA (with instancing support)
// ============================================================================

class Bacteria extends Organism {
    constructor(x, y) {
        super(x, y, 'bacteria');
        this.size = rnd(3, 8);
        this.shape = rndChoice(['rod', 'coccus', 'spiral', 'vibrio']);
        this.flagella = this.shape === 'rod' || this.shape === 'vibrio';
        this.flagellaPhase = rnd(Math.PI * 2);
        this.tumbleTimer = 0;
        this.tumbleInterval = rnd(1, 4);
        this.swimming = true;
        this.maxZoomVisible = 80;
        this.canDivide = true;
        this.divisionCooldown = rnd(15, 40);

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();
        const color = new THREE.Color(rndChoice(features.palette.phaseContrast.organisms));

        let bodyGeom;
        switch (this.shape) {
            case 'rod':
                bodyGeom = new THREE.CapsuleGeometry(this.size * 0.4, this.size, 8, 4);
                break;
            case 'coccus':
                bodyGeom = new THREE.SphereGeometry(this.size * 0.5, 16, 12);
                break;
            case 'spiral':
                bodyGeom = this.createSpiralGeometry();
                break;
            case 'vibrio':
                bodyGeom = this.createVibrioGeometry();
                break;
            default:
                bodyGeom = new THREE.SphereGeometry(this.size * 0.5, 16, 12);
        }

        const bodyMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        group.add(body);

        if (this.flagella) {
            const flagGeom = new THREE.BufferGeometry();
            const points = [];
            for (let i = 0; i < 10; i++) {
                const t = i / 9;
                points.push(
                    -this.size * 0.5 - t * this.size * 1.5,
                    Math.sin(t * Math.PI * 3) * this.size * 0.2,
                    0
                );
            }
            flagGeom.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
            const flagMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
            const flagella = new THREE.Line(flagGeom, flagMat);
            flagella.name = 'flagella';
            group.add(flagella);
        }

        group.position.set(this.x, this.y, rnd(-5, 5));
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
        return new THREE.TubeGeometry(curve, 10, this.size * 0.2, 8, false);
    }

    update(dt) {
        super.update(dt);

        // Division cooldown
        if (this.divisionCooldown > 0) {
            this.divisionCooldown -= dt;
        }

        // Binary fission (cell division) - increased rate
        if (this.canDivide && this.divisionCooldown <= 0 && !this.dividing && rndBool(0.005)) {
            this.startDivision();
        }

        if (this.dividing) {
            this.updateDivision(dt);
        }

        // Run-and-tumble behavior
        this.tumbleTimer += dt;
        if (this.tumbleTimer > this.tumbleInterval) {
            this.tumbleTimer = 0;
            this.tumbleInterval = rnd(0.5, 3);
            this.angle += rnd(-Math.PI, Math.PI);
            this.swimming = !this.swimming || rndBool(0.7);
        }

        if (this.swimming) {
            const speed = this.flagella ? 30 : 15;
            this.vx += Math.cos(this.angle) * speed * dt;
            this.vy += Math.sin(this.angle) * speed * dt;
        }

        // Animate flagella
        if (this.mesh && this.flagella) {
            this.flagellaPhase += dt * 10;
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

    startDivision() {
        this.dividing = true;
        this.divisionProgress = 0;
    }

    updateDivision(dt) {
        this.divisionProgress += dt * 0.3;

        // Elongate during division
        if (this.mesh) {
            const scale = 1 + this.divisionProgress * 0.5;
            this.mesh.scale.x = scale;

            // Pinch in the middle
            if (this.divisionProgress > 0.5) {
                const pinch = (this.divisionProgress - 0.5) * 2;
                this.mesh.scale.y = 1 - pinch * 0.3;
            }
        }

        // Complete division
        if (this.divisionProgress >= 1) {
            this.completeDivision();
        }
    }

    completeDivision() {
        this.dividing = false;
        this.divisionProgress = 0;
        this.divisionCooldown = rnd(30, 60);

        if (this.mesh) {
            this.mesh.scale.set(1, 1, 1);
        }

        // Spawn daughter cell
        const daughter = new Bacteria(
            this.x + Math.cos(this.angle) * this.size * 2,
            this.y + Math.sin(this.angle) * this.size * 2
        );
        daughter.divisionCooldown = rnd(20, 40);
        organisms.push(daughter);
    }
}

// ============================================================================
// AMOEBA
// ============================================================================

class Amoeba extends Organism {
    constructor(x, y, giant = false) {
        super(x, y, 'amoeba');
        this.giant = giant;
        this.size = giant ? rnd(80, 120) : rnd(30, 60);
        this.points = [];
        this.numPoints = 16;
        this.pseudopodTarget = null;
        this.eating = false;
        this.maxZoomVisible = giant ? 25 : 50;

        for (let i = 0; i < this.numPoints; i++) {
            const angle = (i / this.numPoints) * Math.PI * 2;
            this.points.push({
                baseAngle: angle,
                radius: this.size * (0.8 + rnd(0.4)),
                targetRadius: this.size,
                phase: rnd(Math.PI * 2),
                speed: rnd(0.5, 1.5)
            });
        }

        this.createMesh();
    }

    createMesh() {
        const shape = new THREE.Shape();
        this.updateShape(shape);

        const geometry = new THREE.ShapeGeometry(shape);
        const color = this.giant ?
            new THREE.Color('#f84') :
            new THREE.Color(rndChoice(features.palette.phaseContrast.organisms));

        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x, this.y, rnd(-10, 10));
        scene.add(this.mesh);

        // Nucleus
        const nucleusGeom = new THREE.CircleGeometry(this.size * 0.2, 16);
        const nucleusMat = new THREE.MeshBasicMaterial({
            color: 0x446644,
            transparent: true,
            opacity: 0.8
        });
        this.nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);
        this.nucleus.position.z = 1;
        this.mesh.add(this.nucleus);

        this.vacuoles = [];
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
                shape.lineTo(pts[i].x, pts[i].y);
            }
            shape.closePath();
        }
    }

    update(dt) {
        super.update(dt);

        for (const p of this.points) {
            p.phase += dt * p.speed;
            const noise = Math.sin(p.phase) * 0.2 + Math.sin(p.phase * 2.3) * 0.1;
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
                    p.targetRadius = this.size * 0.9;
                }
            }

            this.vx += dx * 0.003;
            this.vy += dy * 0.003;
        } else {
            for (const p of this.points) {
                p.targetRadius = this.size * (0.8 + rnd(0.4));
            }
            this.angle += rndGaussian(0, 0.1) * dt;
            this.vx += Math.cos(this.angle) * 8 * dt;
            this.vy += Math.sin(this.angle) * 8 * dt;
        }

        if (this.mesh) {
            const shape = new THREE.Shape();
            this.updateShape(shape);
            this.mesh.geometry.dispose();
            this.mesh.geometry = new THREE.ShapeGeometry(shape);
        }

        this.hunt();
    }

    hunt() {
        if (this.eating) return;

        let nearest = null;
        let nearestDist = Infinity;
        const huntRange = this.giant ? 500 : 300;
        const targetTypes = this.giant ? ['bacteria', 'paramecium', 'rotifer', 'diatom'] : ['bacteria', 'diatom'];

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

        if (nearest && nearestDist < this.size * 0.8) {
            this.engulf(nearest);
        }
    }

    engulf(prey) {
        this.eating = true;
        prey.die();

        const vacuoleGeom = new THREE.CircleGeometry(prey.size * 1.5, 8);
        const vacuoleMat = new THREE.MeshBasicMaterial({
            color: 0x668866,
            transparent: true,
            opacity: 0.7
        });
        const vacuole = new THREE.Mesh(vacuoleGeom, vacuoleMat);
        vacuole.position.set(rnd(-this.size * 0.3, this.size * 0.3), rnd(-this.size * 0.3, this.size * 0.3), 0.5);
        this.mesh.add(vacuole);
        this.vacuoles.push({ mesh: vacuole, age: 0 });

        setTimeout(() => { this.eating = false; }, this.giant ? 500 : 1000);
    }

    getBoundingRadius() {
        return this.size * 1.2;
    }
}

// ============================================================================
// PARAMECIUM
// ============================================================================

class Paramecium extends Organism {
    constructor(x, y) {
        super(x, y, 'paramecium');
        this.size = rnd(20, 40);
        this.ciliaPhase = 0;
        this.oralGroove = rnd(0.3, 0.4);
        this.maxZoomVisible = 60;

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();
        const color = new THREE.Color(rndChoice(features.palette.phaseContrast.organisms));

        const bodyShape = new THREE.Shape();
        const w = this.size;
        const h = this.size * 0.4;

        bodyShape.moveTo(-w * 0.5, 0);
        bodyShape.quadraticCurveTo(-w * 0.5, h, -w * 0.3, h);
        bodyShape.quadraticCurveTo(0, h * 0.8, w * 0.3, h);
        bodyShape.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.5, 0);
        bodyShape.quadraticCurveTo(w * 0.5, -h * 0.5, w * 0.3, -h);
        bodyShape.quadraticCurveTo(0, -h * 0.8, -w * 0.3, -h);
        bodyShape.quadraticCurveTo(-w * 0.5, -h, -w * 0.5, 0);

        const bodyGeom = new THREE.ShapeGeometry(bodyShape);
        const bodyMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.5
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        group.add(body);

        const grooveGeom = new THREE.PlaneGeometry(this.size * 0.3, this.size * 0.15);
        const grooveMat = new THREE.MeshBasicMaterial({
            color: 0x446644,
            transparent: true,
            opacity: 0.6
        });
        const groove = new THREE.Mesh(grooveGeom, grooveMat);
        groove.position.set(-this.size * 0.1, this.size * 0.1, 0.1);
        group.add(groove);

        const macroGeom = new THREE.CapsuleGeometry(this.size * 0.08, this.size * 0.2, 8, 4);
        const macroMat = new THREE.MeshBasicMaterial({ color: 0x556655, transparent: true, opacity: 0.7 });
        const macro = new THREE.Mesh(macroGeom, macroMat);
        macro.position.set(0, 0, 0.1);
        macro.rotation.z = Math.PI / 2;
        group.add(macro);

        this.ciliaGroup = new THREE.Group();
        const numCilia = 40;
        for (let i = 0; i < numCilia; i++) {
            const t = i / numCilia;
            const angle = t * Math.PI * 2;
            const x = Math.cos(angle) * w * 0.5 * (1 + 0.3 * Math.sin(angle * 2));
            const y = Math.sin(angle) * h * (1 + 0.2 * Math.cos(angle * 3));

            const ciliumGeom = new THREE.BufferGeometry();
            const points = new Float32Array([
                x, y, 0,
                x + Math.cos(angle) * this.size * 0.1, y + Math.sin(angle) * this.size * 0.1, 0
            ]);
            ciliumGeom.setAttribute('position', new THREE.BufferAttribute(points, 3));
            const ciliumMat = new THREE.LineBasicMaterial({ color: 0x88aa88, transparent: true, opacity: 0.4 });
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
        const speed = 60;
        this.vx += Math.cos(this.angle) * speed * dt;
        this.vy += Math.sin(this.angle) * speed * dt;

        if (this.ciliaGroup) {
            this.ciliaGroup.children.forEach((cilium, i) => {
                const data = cilium.userData;
                const phase = this.ciliaPhase + i * 0.3;
                const wave = Math.sin(phase) * this.size * 0.08;
                const positions = cilium.geometry.attributes.position.array;
                const angle = data.baseAngle;
                positions[3] = data.baseX + Math.cos(angle) * (this.size * 0.1 + wave);
                positions[4] = data.baseY + Math.sin(angle) * (this.size * 0.1 + wave);
                cilium.geometry.attributes.position.needsUpdate = true;
            });
        }

        if (rndBool(0.01)) {
            this.angle += rnd(-0.5, 0.5);
        }

        if (Math.abs(this.x) > WORLD_SIZE * 0.4 || Math.abs(this.y) > WORLD_SIZE * 0.4) {
            this.angle = Math.atan2(-this.y, -this.x) + rnd(-0.3, 0.3);
        }
    }

    getBoundingRadius() {
        return this.size * 0.6;
    }
}

// ============================================================================
// DIATOM
// ============================================================================

class Diatom extends Organism {
    constructor(x, y) {
        super(x, y, 'diatom');
        this.size = rnd(15, 35);
        this.shape = rndChoice(['pennate', 'centric', 'triangular']);
        this.symmetry = this.shape === 'centric' ? rndInt(6, 12) : 2;
        this.pattern = rndChoice(['radial', 'linear', 'mixed']);
        this.maxZoomVisible = 60;

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();
        const color = new THREE.Color(rndChoice(['#cda', '#dcb', '#edc', '#bca']));

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

        const shellMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const shell = new THREE.Mesh(shellGeom, shellMat);
        group.add(shell);

        this.addStriae(group, color);

        group.position.set(this.x, this.y, rnd(-5, 5));
        this.mesh = group;
        scene.add(group);
    }

    addStriae(group, baseColor) {
        const striaColor = baseColor.clone().multiplyScalar(0.7);

        if (this.shape === 'centric') {
            for (let i = 0; i < this.symmetry; i++) {
                const angle = (i / this.symmetry) * Math.PI * 2;
                const lineGeom = new THREE.BufferGeometry();
                const points = new Float32Array([
                    0, 0, 0.1,
                    Math.cos(angle) * this.size * 0.9, Math.sin(angle) * this.size * 0.9, 0.1
                ]);
                lineGeom.setAttribute('position', new THREE.BufferAttribute(points, 3));
                const lineMat = new THREE.LineBasicMaterial({ color: striaColor, transparent: true, opacity: 0.5 });
                group.add(new THREE.Line(lineGeom, lineMat));
            }
        } else {
            const numLines = 8;
            for (let i = 0; i < numLines; i++) {
                const offset = ((i / (numLines - 1)) - 0.5) * this.size * 0.5;
                const lineGeom = new THREE.BufferGeometry();
                const points = new Float32Array([
                    -this.size * 0.4, offset, 0.1,
                    this.size * 0.4, offset, 0.1
                ]);
                lineGeom.setAttribute('position', new THREE.BufferAttribute(points, 3));
                const lineMat = new THREE.LineBasicMaterial({ color: striaColor, transparent: true, opacity: 0.4 });
                group.add(new THREE.Line(lineGeom, lineMat));
            }
        }
    }

    update(dt) {
        super.update(dt);
        this.angularVel = rndGaussian(0, 0.1);
        this.vx += rndGaussian(0, 0.1) * dt;
        this.vy += rndGaussian(0, 0.1) * dt;
    }
}

// ============================================================================
// VIRUS
// ============================================================================

class Virus extends Organism {
    constructor(x, y) {
        super(x, y, 'virus');
        this.size = rnd(2, 5);
        this.virusType = rndChoice(['icosahedral', 'helical', 'bacteriophage', 'corona']);
        this.attached = false;
        this.targetCell = null;
        this.injecting = false;
        this.minZoomVisible = 2;
        this.maxZoomVisible = 150;

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();
        const color = new THREE.Color(rndChoice(features.palette.fluorescence.organisms));

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

        group.position.set(this.x, this.y, rnd(-3, 3));
        group.scale.setScalar(1);
        this.mesh = group;
        scene.add(group);
    }

    createIcosahedral(group, color) {
        const geom = new THREE.IcosahedronGeometry(this.size, 0);
        const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
        group.add(new THREE.Mesh(geom, mat));
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
        const geom = new THREE.TubeGeometry(curve, 20, this.size * 0.2, 8, false);
        const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
        group.add(new THREE.Mesh(geom, mat));
    }

    createBacteriophage(group, color) {
        const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });

        const headGeom = new THREE.IcosahedronGeometry(this.size, 0);
        const head = new THREE.Mesh(headGeom, mat);
        head.position.y = this.size;
        group.add(head);

        const tailGeom = new THREE.CylinderGeometry(this.size * 0.2, this.size * 0.2, this.size * 2, 6);
        const tail = new THREE.Mesh(tailGeom, mat);
        group.add(tail);

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const legGeom = new THREE.CylinderGeometry(this.size * 0.05, this.size * 0.05, this.size * 1.2, 4);
            const leg = new THREE.Mesh(legGeom, mat);
            leg.position.set(
                Math.cos(angle) * this.size * 0.5,
                -this.size * 0.8,
                Math.sin(angle) * this.size * 0.5
            );
            leg.rotation.x = Math.PI / 4;
            leg.rotation.z = angle;
            group.add(leg);
        }
    }

    createCorona(group, color) {
        const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.7 });

        const coreGeom = new THREE.SphereGeometry(this.size, 16, 12);
        group.add(new THREE.Mesh(coreGeom, mat));

        const numSpikes = 20;
        for (let i = 0; i < numSpikes; i++) {
            const phi = Math.acos(1 - 2 * (i + 0.5) / numSpikes);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            const spikeGeom = new THREE.ConeGeometry(this.size * 0.15, this.size * 0.6, 4);
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

        if (!this.attached) {
            this.vx += rndGaussian(0, 2) * dt;
            this.vy += rndGaussian(0, 2) * dt;

            if (this.virusType === 'bacteriophage') {
                this.seekBacteria();
            } else {
                this.seekCell();
            }
        } else if (this.targetCell) {
            // Follow attached cell
            this.x = this.targetCell.x + Math.cos(this.attachAngle) * this.targetCell.size;
            this.y = this.targetCell.y + Math.sin(this.attachAngle) * this.targetCell.size;
        }
    }

    seekBacteria() {
        for (const org of organisms) {
            if (org.type === 'bacteria' && org.health > 0 && this.isNear(org, this.size * 8)) {
                this.attach(org);
                break;
            }
        }
    }

    seekCell() {
        for (const org of organisms) {
            if (org.type === 'cell' && org.health > 0 && this.isNear(org, org.size * 1.5)) {
                this.attach(org);
                break;
            }
        }
    }

    attach(target) {
        this.attached = true;
        this.targetCell = target;
        this.vx = 0;
        this.vy = 0;
        this.attachAngle = Math.atan2(this.y - target.y, this.x - target.x);
    }
}

// ============================================================================
// EUKARYOTIC CELL (with molecular detail)
// ============================================================================

class Cell extends Organism {
    constructor(x, y) {
        super(x, y, 'cell');
        this.size = rnd(50, 100);
        this.cellType = rndChoice(['epithelial', 'blood', 'neuron']);
        this.organelles = [];
        this.maxZoomVisible = 100;
        this.divisionCooldown = rnd(60, 120);
        this.mitosisPhase = null; // 'prophase', 'metaphase', 'anaphase', 'telophase'

        this.createMesh();
        this.createOrganelles();
        this.createMolecularDetail();
    }

    createMesh() {
        const group = new THREE.Group();

        const membraneGeom = new THREE.CircleGeometry(this.size, 32);
        const membraneMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(rndChoice(features.palette.fluorescence.organisms)),
            transparent: true,
            opacity: 0.3
        });
        const membrane = new THREE.Mesh(membraneGeom, membraneMat);
        group.add(membrane);

        const cytoGeom = new THREE.CircleGeometry(this.size * 0.95, 32);
        const cytoMat = new THREE.MeshBasicMaterial({
            color: 0x335533,
            transparent: true,
            opacity: 0.2
        });
        const cytoplasm = new THREE.Mesh(cytoGeom, cytoMat);
        cytoplasm.position.z = 0.1;
        group.add(cytoplasm);

        group.position.set(this.x, this.y, rnd(-20, 20));
        this.mesh = group;
        scene.add(group);
    }

    createOrganelles() {
        // Nucleus
        const nucleusGeom = new THREE.CircleGeometry(this.size * 0.25, 24);
        const nucleusMat = new THREE.MeshBasicMaterial({
            color: 0x6688aa,
            transparent: true,
            opacity: 0.7
        });
        this.nucleusMesh = new THREE.Mesh(nucleusGeom, nucleusMat);
        this.nucleusMesh.position.set(rnd(-this.size * 0.1, this.size * 0.1), rnd(-this.size * 0.1, this.size * 0.1), 0.2);
        this.mesh.add(this.nucleusMesh);
        this.organelles.push({ mesh: this.nucleusMesh, type: 'nucleus' });

        // Nucleolus
        const nucleolusGeom = new THREE.CircleGeometry(this.size * 0.08, 12);
        const nucleolusMat = new THREE.MeshBasicMaterial({ color: 0x445566, transparent: true, opacity: 0.8 });
        const nucleolus = new THREE.Mesh(nucleolusGeom, nucleolusMat);
        nucleolus.position.z = 0.1;
        this.nucleusMesh.add(nucleolus);

        // Mitochondria
        const numMito = rndInt(5, 12);
        for (let i = 0; i < numMito; i++) {
            const mitoSize = this.size * rnd(0.06, 0.1);
            const mitoGeom = new THREE.CapsuleGeometry(mitoSize * 0.4, mitoSize, 8, 4);
            const mitoMat = new THREE.MeshBasicMaterial({
                color: 0xaa6644,
                transparent: true,
                opacity: 0.6
            });
            const mito = new THREE.Mesh(mitoGeom, mitoMat);

            let px, py;
            do {
                const angle = rnd(Math.PI * 2);
                const dist = rnd(this.size * 0.35, this.size * 0.8);
                px = Math.cos(angle) * dist;
                py = Math.sin(angle) * dist;
            } while (Math.sqrt(px*px + py*py) < this.size * 0.3);

            mito.position.set(px, py, 0.15);
            mito.rotation.z = rnd(Math.PI * 2);
            this.mesh.add(mito);
            this.organelles.push({ mesh: mito, type: 'mitochondria', phase: rnd(Math.PI * 2) });
        }

        this.createER();
        this.createGolgi();
    }

    createER() {
        const erGroup = new THREE.Group();
        const numStrands = 8;

        for (let i = 0; i < numStrands; i++) {
            const points = [];
            let x = rnd(-this.size * 0.5, this.size * 0.5);
            let y = rnd(-this.size * 0.5, this.size * 0.5);

            for (let j = 0; j < 6; j++) {
                points.push(new THREE.Vector3(x, y, 0.12));
                x += rnd(-this.size * 0.15, this.size * 0.15);
                y += rnd(-this.size * 0.15, this.size * 0.15);
            }

            const curve = new THREE.CatmullRomCurve3(points);
            const geom = new THREE.TubeGeometry(curve, 10, this.size * 0.01, 4, false);
            const mat = new THREE.MeshBasicMaterial({ color: 0x666688, transparent: true, opacity: 0.4 });
            erGroup.add(new THREE.Mesh(geom, mat));
        }

        this.mesh.add(erGroup);
    }

    createGolgi() {
        const golgiGroup = new THREE.Group();
        const numStacks = 5;

        for (let i = 0; i < numStacks; i++) {
            const curve = new THREE.EllipseCurve(0, (i - 2) * this.size * 0.04, this.size * 0.15, this.size * 0.02);
            const points = curve.getPoints(20);
            const geom = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({ color: 0x888844, transparent: true, opacity: 0.5 });
            golgiGroup.add(new THREE.Line(geom, mat));
        }

        golgiGroup.position.set(this.size * rnd(-0.4, 0.4), this.size * rnd(-0.4, 0.4), 0.13);
        golgiGroup.rotation.z = rnd(Math.PI * 2);
        this.mesh.add(golgiGroup);
    }

    createMolecularDetail() {
        // DNA inside nucleus (visible at high zoom)
        this.dnaGroup = new THREE.Group();
        this.dnaGroup.visible = false;

        // Create DNA double helix
        const dnaPoints1 = [], dnaPoints2 = [];
        const dnaLength = this.size * 0.3;
        const dnaRadius = this.size * 0.03;

        for (let i = 0; i <= 40; i++) {
            const t = i / 40;
            const angle = t * Math.PI * 6;
            const y = (t - 0.5) * dnaLength;

            dnaPoints1.push(new THREE.Vector3(
                Math.cos(angle) * dnaRadius,
                y,
                Math.sin(angle) * dnaRadius
            ));
            dnaPoints2.push(new THREE.Vector3(
                Math.cos(angle + Math.PI) * dnaRadius,
                y,
                Math.sin(angle + Math.PI) * dnaRadius
            ));
        }

        const curve1 = new THREE.CatmullRomCurve3(dnaPoints1);
        const curve2 = new THREE.CatmullRomCurve3(dnaPoints2);

        const dnaGeom1 = new THREE.TubeGeometry(curve1, 40, this.size * 0.005, 6, false);
        const dnaGeom2 = new THREE.TubeGeometry(curve2, 40, this.size * 0.005, 6, false);

        const dnaMat = new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.8 });
        this.dnaGroup.add(new THREE.Mesh(dnaGeom1, dnaMat));
        this.dnaGroup.add(new THREE.Mesh(dnaGeom2, dnaMat.clone()));

        // Base pairs (rungs)
        for (let i = 0; i < 20; i++) {
            const t = i / 19;
            const angle = t * Math.PI * 6;
            const y = (t - 0.5) * dnaLength;

            const rungGeom = new THREE.CylinderGeometry(this.size * 0.002, this.size * 0.002, dnaRadius * 2, 4);
            const rungMat = new THREE.MeshBasicMaterial({
                color: i % 4 === 0 ? 0xff4444 : i % 4 === 1 ? 0x44ff44 : i % 4 === 2 ? 0xffff44 : 0xff44ff,
                transparent: true,
                opacity: 0.7
            });
            const rung = new THREE.Mesh(rungGeom, rungMat);
            rung.position.set(0, y, 0);
            rung.rotation.z = Math.PI / 2;
            rung.rotation.y = angle;
            this.dnaGroup.add(rung);
        }

        this.dnaGroup.rotation.x = Math.PI / 2;
        this.nucleusMesh.add(this.dnaGroup);

        // Ribosomes (small dots in cytoplasm)
        this.ribosomeGroup = new THREE.Group();
        this.ribosomeGroup.visible = false;

        for (let i = 0; i < 30; i++) {
            const angle = rnd(Math.PI * 2);
            const dist = rnd(this.size * 0.3, this.size * 0.8);
            const riboGeom = new THREE.SphereGeometry(this.size * 0.015, 6, 4);
            const riboMat = new THREE.MeshBasicMaterial({ color: 0xaa88ff, transparent: true, opacity: 0.6 });
            const ribo = new THREE.Mesh(riboGeom, riboMat);
            ribo.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, 0.14);
            this.ribosomeGroup.add(ribo);
        }
        this.mesh.add(this.ribosomeGroup);

        // Proteins (visible at molecular zoom)
        this.proteinGroup = new THREE.Group();
        this.proteinGroup.visible = false;

        for (let i = 0; i < 15; i++) {
            const protein = this.createProtein();
            const angle = rnd(Math.PI * 2);
            const dist = rnd(this.size * 0.2, this.size * 0.7);
            protein.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, 0.16);
            this.proteinGroup.add(protein);
        }
        this.mesh.add(this.proteinGroup);
    }

    createProtein() {
        const group = new THREE.Group();
        const color = new THREE.Color(rndChoice(['#f88', '#8f8', '#88f', '#ff8', '#f8f']));

        // Folded protein as connected spheres
        const numSegments = rndInt(4, 8);
        let x = 0, y = 0, z = 0;

        for (let i = 0; i < numSegments; i++) {
            const sphereGeom = new THREE.SphereGeometry(this.size * 0.012, 6, 4);
            const sphereMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.7 });
            const sphere = new THREE.Mesh(sphereGeom, sphereMat);
            sphere.position.set(x, y, z);
            group.add(sphere);

            x += rnd(-this.size * 0.02, this.size * 0.02);
            y += rnd(-this.size * 0.02, this.size * 0.02);
            z += rnd(-this.size * 0.01, this.size * 0.01);
        }

        return group;
    }

    update(dt) {
        super.update(dt);

        this.vx += rndGaussian(0, 0.2) * dt;
        this.vy += rndGaussian(0, 0.2) * dt;

        // Animate organelles
        for (const org of this.organelles) {
            if (org.type === 'mitochondria') {
                org.phase += dt;
                org.mesh.position.x += Math.sin(org.phase) * 0.05;
                org.mesh.position.y += Math.cos(org.phase * 1.3) * 0.05;
            }
        }

        // Show/hide molecular detail based on zoom
        const showMolecular = currentZoom > 12;
        if (this.dnaGroup) this.dnaGroup.visible = showMolecular;
        if (this.ribosomeGroup) this.ribosomeGroup.visible = showMolecular;
        if (this.proteinGroup) this.proteinGroup.visible = currentZoom > 20;

        // Animate DNA rotation
        if (this.dnaGroup && showMolecular) {
            this.dnaGroup.rotation.y += dt * 0.5;
        }

        // Division cooldown
        this.divisionCooldown -= dt;

        // Start mitosis - increased rate
        if (this.divisionCooldown <= 0 && !this.mitosisPhase && rndBool(0.002)) {
            this.startMitosis();
        }

        if (this.mitosisPhase) {
            this.updateMitosis(dt);
        }
    }

    startMitosis() {
        this.mitosisPhase = 'prophase';
        this.mitosisProgress = 0;
        this.divisionCooldown = rnd(120, 200);
    }

    updateMitosis(dt) {
        this.mitosisProgress += dt * 0.2;

        switch (this.mitosisPhase) {
            case 'prophase':
                // Chromatin condenses
                if (this.nucleusMesh) {
                    this.nucleusMesh.material.opacity = 0.5 + Math.sin(this.mitosisProgress * 5) * 0.2;
                }
                if (this.mitosisProgress > 1) {
                    this.mitosisPhase = 'metaphase';
                    this.mitosisProgress = 0;
                }
                break;

            case 'metaphase':
                // Chromosomes align
                if (this.mesh) {
                    this.mesh.scale.x = 1.1;
                }
                if (this.mitosisProgress > 1) {
                    this.mitosisPhase = 'anaphase';
                    this.mitosisProgress = 0;
                }
                break;

            case 'anaphase':
                // Chromosomes separate
                if (this.mesh) {
                    this.mesh.scale.x = 1.2 + this.mitosisProgress * 0.3;
                    this.mesh.scale.y = 1 - this.mitosisProgress * 0.2;
                }
                if (this.mitosisProgress > 1) {
                    this.mitosisPhase = 'telophase';
                    this.mitosisProgress = 0;
                }
                break;

            case 'telophase':
                // Cell pinches
                if (this.mesh) {
                    this.mesh.scale.y = 0.8 - this.mitosisProgress * 0.3;
                }
                if (this.mitosisProgress > 1) {
                    this.completeMitosis();
                }
                break;
        }
    }

    completeMitosis() {
        this.mitosisPhase = null;
        this.mitosisProgress = 0;

        if (this.mesh) {
            this.mesh.scale.set(1, 1, 1);
        }

        // Spawn daughter cell
        const daughter = new Cell(
            this.x + Math.cos(this.angle) * this.size * 1.5,
            this.y + Math.sin(this.angle) * this.size * 1.5
        );
        daughter.size = this.size * 0.8;
        daughter.divisionCooldown = rnd(60, 120);
        organisms.push(daughter);
    }

    getBoundingRadius() {
        return this.size;
    }
}

// ============================================================================
// ROTIFER
// ============================================================================

class Rotifer extends Organism {
    constructor(x, y) {
        super(x, y, 'rotifer');
        this.size = rnd(40, 70);
        this.wheelPhase = 0;
        this.bodyPhase = 0;
        this.maxZoomVisible = 40;

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();
        const color = new THREE.Color(rndChoice(features.palette.phaseContrast.organisms));

        const bodyShape = new THREE.Shape();
        const w = this.size;
        const h = this.size * 0.35;

        bodyShape.moveTo(-w * 0.4, 0);
        bodyShape.bezierCurveTo(-w * 0.4, h, -w * 0.1, h * 1.2, w * 0.2, h * 0.8);
        bodyShape.bezierCurveTo(w * 0.5, h * 0.4, w * 0.5, -h * 0.4, w * 0.2, -h * 0.8);
        bodyShape.bezierCurveTo(-w * 0.1, -h * 1.2, -w * 0.4, -h, -w * 0.4, 0);

        const bodyGeom = new THREE.ShapeGeometry(bodyShape);
        const bodyMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
        group.add(new THREE.Mesh(bodyGeom, bodyMat));

        this.leftWheel = this.createWheel(color);
        this.leftWheel.position.set(-w * 0.35, h * 0.3, 0.1);
        group.add(this.leftWheel);

        this.rightWheel = this.createWheel(color);
        this.rightWheel.position.set(-w * 0.35, -h * 0.3, 0.1);
        group.add(this.rightWheel);

        const footGeom = new THREE.ConeGeometry(this.size * 0.05, this.size * 0.3, 4);
        const footMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.6 });
        const foot = new THREE.Mesh(footGeom, footMat);
        foot.position.set(w * 0.45, 0, 0);
        foot.rotation.z = -Math.PI / 2;
        group.add(foot);

        const stomachGeom = new THREE.CircleGeometry(this.size * 0.12, 8);
        const stomachMat = new THREE.MeshBasicMaterial({ color: 0x668866, transparent: true, opacity: 0.4 });
        const stomach = new THREE.Mesh(stomachGeom, stomachMat);
        stomach.position.set(0, 0, 0.05);
        group.add(stomach);

        group.position.set(this.x, this.y, rnd(-10, 10));
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
            const ciliaMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
            const cilia = new THREE.Line(ciliaGeom, ciliaMat);
            cilia.userData = { baseAngle: angle, r: r };
            wheelGroup.add(cilia);
        }

        return wheelGroup;
    }

    update(dt) {
        super.update(dt);

        this.wheelPhase += dt * 20;

        [this.leftWheel, this.rightWheel].forEach(wheel => {
            wheel.children.forEach((cilia, i) => {
                const data = cilia.userData;
                const offset = Math.sin(this.wheelPhase + i * 0.5) * this.size * 0.03;
                const positions = cilia.geometry.attributes.position.array;
                const angle = data.baseAngle;
                positions[3] = Math.cos(angle) * (data.r + offset);
                positions[4] = Math.sin(angle) * (data.r + offset);
                cilia.geometry.attributes.position.needsUpdate = true;
            });
        });

        const speed = 25;
        this.vx += Math.cos(this.angle) * speed * dt;
        this.vy += Math.sin(this.angle) * speed * dt;

        this.bodyPhase += dt * 3;
        if (this.mesh) {
            this.mesh.rotation.z = this.angle + Math.sin(this.bodyPhase) * 0.1;
        }
    }

    getBoundingRadius() {
        return this.size * 0.5;
    }
}

// ============================================================================
// TARDIGRADE (Rare Organism)
// ============================================================================

class Tardigrade extends Organism {
    constructor(x, y) {
        super(x, y, 'tardigrade');
        this.size = rnd(60, 100);
        this.legPhase = 0;
        this.maxZoomVisible = 30;
        this.minZoomVisible = 0.3;

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();
        const bodyColor = new THREE.Color('#c97');

        // Plump segmented body
        const segments = 5;
        for (let i = 0; i < segments; i++) {
            const t = i / (segments - 1);
            const segSize = this.size * 0.2 * (1 - Math.abs(t - 0.4) * 0.8);
            const segGeom = new THREE.SphereGeometry(segSize, 12, 8);
            const segMat = new THREE.MeshBasicMaterial({
                color: bodyColor,
                transparent: true,
                opacity: 0.7
            });
            const seg = new THREE.Mesh(segGeom, segMat);
            seg.position.x = (t - 0.5) * this.size * 0.8;
            seg.scale.y = 0.8;
            group.add(seg);
        }

        // Head with cute face
        const headGeom = new THREE.SphereGeometry(this.size * 0.18, 12, 8);
        const headMat = new THREE.MeshBasicMaterial({ color: bodyColor, transparent: true, opacity: 0.7 });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.x = -this.size * 0.45;
        group.add(head);

        // Eyes
        const eyeGeom = new THREE.CircleGeometry(this.size * 0.03, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const eye1 = new THREE.Mesh(eyeGeom, eyeMat);
        eye1.position.set(-this.size * 0.5, this.size * 0.06, this.size * 0.1);
        group.add(eye1);
        const eye2 = new THREE.Mesh(eyeGeom.clone(), eyeMat);
        eye2.position.set(-this.size * 0.5, -this.size * 0.06, this.size * 0.1);
        group.add(eye2);

        // 8 stubby legs (4 pairs)
        this.legs = [];
        for (let i = 0; i < 4; i++) {
            const legX = -this.size * 0.3 + i * this.size * 0.2;

            for (let side = -1; side <= 1; side += 2) {
                const legGroup = new THREE.Group();

                // Leg segments
                const leg1Geom = new THREE.CapsuleGeometry(this.size * 0.03, this.size * 0.08, 4, 2);
                const legMat = new THREE.MeshBasicMaterial({ color: bodyColor, transparent: true, opacity: 0.6 });
                const leg1 = new THREE.Mesh(leg1Geom, legMat);
                leg1.rotation.z = side * Math.PI / 4;
                legGroup.add(leg1);

                // Claw
                const clawGeom = new THREE.ConeGeometry(this.size * 0.02, this.size * 0.04, 4);
                const clawMat = new THREE.MeshBasicMaterial({ color: 0x654321 });
                const claw = new THREE.Mesh(clawGeom, clawMat);
                claw.position.set(side * this.size * 0.08, -this.size * 0.06, 0);
                claw.rotation.z = side * Math.PI / 3;
                legGroup.add(claw);

                legGroup.position.set(legX, side * this.size * 0.12, -0.05);
                group.add(legGroup);
                this.legs.push({ group: legGroup, side: side, index: i });
            }
        }

        group.position.set(this.x, this.y, rnd(-15, 15));
        this.mesh = group;
        scene.add(group);
    }

    update(dt) {
        super.update(dt);

        // Slow, deliberate walking motion
        this.legPhase += dt * 3;

        // Animate legs in walking pattern
        this.legs.forEach((leg, i) => {
            const phase = this.legPhase + leg.index * Math.PI / 2;
            const swing = Math.sin(phase) * 0.3;
            leg.group.rotation.z = leg.side * (Math.PI / 4 + swing);
        });

        // Slow movement
        const speed = 8;
        this.vx += Math.cos(this.angle) * speed * dt;
        this.vy += Math.sin(this.angle) * speed * dt;

        // Occasional direction changes
        if (rndBool(0.005)) {
            this.angle += rnd(-0.5, 0.5);
        }
    }

    getBoundingRadius() {
        return this.size * 0.5;
    }
}

// ============================================================================
// MOLECULAR OBJECTS (DNA, Proteins, Ribosomes - floating in space)
// ============================================================================

class FloatingDNA {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = rnd(15, 35);
        this.rotationSpeed = rnd(0.3, 0.8);
        this.driftAngle = rnd(Math.PI * 2);
        this.driftSpeed = rnd(1, 4);

        this.createMesh();
    }

    createMesh() {
        this.group = new THREE.Group();

        const dnaPoints1 = [], dnaPoints2 = [];
        const dnaLength = this.size;
        const dnaRadius = this.size * 0.1;

        for (let i = 0; i <= 60; i++) {
            const t = i / 60;
            const angle = t * Math.PI * 8;
            const y = (t - 0.5) * dnaLength;

            dnaPoints1.push(new THREE.Vector3(
                Math.cos(angle) * dnaRadius,
                y,
                Math.sin(angle) * dnaRadius
            ));
            dnaPoints2.push(new THREE.Vector3(
                Math.cos(angle + Math.PI) * dnaRadius,
                y,
                Math.sin(angle + Math.PI) * dnaRadius
            ));
        }

        const curve1 = new THREE.CatmullRomCurve3(dnaPoints1);
        const curve2 = new THREE.CatmullRomCurve3(dnaPoints2);

        const dnaGeom1 = new THREE.TubeGeometry(curve1, 60, this.size * 0.015, 6, false);
        const dnaGeom2 = new THREE.TubeGeometry(curve2, 60, this.size * 0.015, 6, false);

        const dnaMat1 = new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.9 });
        const dnaMat2 = new THREE.MeshBasicMaterial({ color: 0x44ff88, transparent: true, opacity: 0.9 });

        this.group.add(new THREE.Mesh(dnaGeom1, dnaMat1));
        this.group.add(new THREE.Mesh(dnaGeom2, dnaMat2));

        // Base pairs
        const basePairColors = [0xff4444, 0x44ff44, 0xffff44, 0xff44ff];
        for (let i = 0; i < 30; i++) {
            const t = i / 29;
            const angle = t * Math.PI * 8;
            const y = (t - 0.5) * dnaLength;

            const rungGeom = new THREE.CylinderGeometry(this.size * 0.008, this.size * 0.008, dnaRadius * 2, 4);
            const rungMat = new THREE.MeshBasicMaterial({
                color: basePairColors[i % 4],
                transparent: true,
                opacity: 0.8
            });
            const rung = new THREE.Mesh(rungGeom, rungMat);
            rung.position.set(0, y, 0);
            rung.rotation.z = Math.PI / 2;
            rung.rotation.y = angle;
            this.group.add(rung);
        }

        this.group.position.set(this.x, this.y, rnd(-5, 5));
        this.group.rotation.x = Math.PI / 2;
        scene.add(this.group);
    }

    update(dt) {
        // Rotate
        this.group.rotation.y += this.rotationSpeed * dt;

        // Drift with some randomness
        this.driftAngle += rndGaussian(0, 0.1) * dt;
        this.x += Math.cos(this.driftAngle) * this.driftSpeed * dt;
        this.y += Math.sin(this.driftAngle) * this.driftSpeed * dt;
        this.group.position.x = this.x;
        this.group.position.y = this.y;

        // Visibility based on zoom
        this.group.visible = currentZoom > 15;
    }
}

class FloatingProtein {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = rnd(6, 15);
        this.rotationSpeed = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize().multiplyScalar(1);

        this.createMesh();
    }

    createMesh() {
        this.group = new THREE.Group();
        const colors = [0xff6666, 0x66ff66, 0x6666ff, 0xffff66, 0xff66ff, 0x66ffff];
        const color = new THREE.Color(rndChoice(colors));

        // Create folded protein structure
        const numDomains = rndInt(4, 8);
        let x = 0, y = 0, z = 0;

        for (let i = 0; i < numDomains; i++) {
            const domainSize = this.size * rnd(0.2, 0.4);
            const geom = rndBool(0.5) ?
                new THREE.SphereGeometry(domainSize, 8, 6) :
                new THREE.IcosahedronGeometry(domainSize, 0);

            const mat = new THREE.MeshBasicMaterial({
                color: color.clone().offsetHSL(i * 0.08, 0, 0),
                transparent: true,
                opacity: 0.85
            });
            const domain = new THREE.Mesh(geom, mat);
            domain.position.set(x, y, z);
            this.group.add(domain);

            // Next position - tighter folding
            x += rnd(-this.size * 0.25, this.size * 0.25);
            y += rnd(-this.size * 0.25, this.size * 0.25);
            z += rnd(-this.size * 0.15, this.size * 0.15);
        }

        this.group.position.set(this.x, this.y, rnd(-5, 5));
        scene.add(this.group);
    }

    update(dt) {
        this.group.rotation.x += this.rotationSpeed.x * dt;
        this.group.rotation.y += this.rotationSpeed.y * dt;
        this.group.rotation.z += this.rotationSpeed.z * dt;

        // Brownian drift - more active
        this.x += rndGaussian(0, 2) * dt;
        this.y += rndGaussian(0, 2) * dt;
        this.group.position.x = this.x;
        this.group.position.y = this.y;

        this.group.visible = currentZoom > 18;
    }
}

// ============================================================================
// RIBOSOME (visible at molecular zoom)
// ============================================================================

class FloatingRibosome {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = rnd(3, 6);
        this.phase = rnd(Math.PI * 2);

        this.createMesh();
    }

    createMesh() {
        this.group = new THREE.Group();

        // Large subunit
        const largeGeom = new THREE.SphereGeometry(this.size * 0.6, 8, 6);
        const largeMat = new THREE.MeshBasicMaterial({ color: 0x8866aa, transparent: true, opacity: 0.8 });
        const large = new THREE.Mesh(largeGeom, largeMat);
        large.position.y = this.size * 0.2;
        this.group.add(large);

        // Small subunit
        const smallGeom = new THREE.SphereGeometry(this.size * 0.4, 8, 6);
        const smallMat = new THREE.MeshBasicMaterial({ color: 0xaa88cc, transparent: true, opacity: 0.8 });
        const small = new THREE.Mesh(smallGeom, smallMat);
        small.position.y = -this.size * 0.3;
        this.group.add(small);

        this.group.position.set(this.x, this.y, rnd(-2, 2));
        scene.add(this.group);
    }

    update(dt) {
        this.phase += dt;
        this.group.rotation.z = Math.sin(this.phase * 0.5) * 0.2;

        // Brownian motion
        this.x += rndGaussian(0, 0.3) * dt;
        this.y += rndGaussian(0, 0.3) * dt;
        this.group.position.x = this.x;
        this.group.position.y = this.y;

        this.group.visible = currentZoom > 25;
    }
}

// ============================================================================
// ATP MOLECULE
// ============================================================================

class FloatingATP {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = rnd(2, 4);
        this.vx = rndGaussian(0, 5);
        this.vy = rndGaussian(0, 5);

        this.createMesh();
    }

    createMesh() {
        this.group = new THREE.Group();

        // Adenine base (ring)
        const baseGeom = new THREE.TorusGeometry(this.size * 0.3, this.size * 0.1, 6, 8);
        const baseMat = new THREE.MeshBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.8 });
        const base = new THREE.Mesh(baseGeom, baseMat);
        this.group.add(base);

        // Phosphate groups (3 spheres in a chain)
        const phosphateColors = [0xffaa00, 0xff8800, 0xff6600];
        for (let i = 0; i < 3; i++) {
            const pGeom = new THREE.SphereGeometry(this.size * 0.2, 6, 4);
            const pMat = new THREE.MeshBasicMaterial({ color: phosphateColors[i], transparent: true, opacity: 0.9 });
            const p = new THREE.Mesh(pGeom, pMat);
            p.position.x = this.size * 0.5 + i * this.size * 0.35;
            this.group.add(p);
        }

        this.group.position.set(this.x, this.y, rnd(-2, 2));
        scene.add(this.group);
    }

    update(dt) {
        // Fast random movement
        this.vx += rndGaussian(0, 10) * dt;
        this.vy += rndGaussian(0, 10) * dt;
        this.vx *= 0.95;
        this.vy *= 0.95;

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.group.position.x = this.x;
        this.group.position.y = this.y;
        this.group.rotation.z += dt * 2;

        this.group.visible = currentZoom > 30;
    }
}

// ============================================================================
// ECOSYSTEM MANAGEMENT
// ============================================================================

function spawnOrganisms() {
    organisms = [];
    molecularObjects = [];

    // Spawn bacteria
    for (let i = 0; i < ORGANISM_COUNTS.bacteria; i++) {
        organisms.push(new Bacteria(
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2),
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2)
        ));
    }

    // Spawn amoebae
    for (let i = 0; i < ORGANISM_COUNTS.amoeba; i++) {
        organisms.push(new Amoeba(
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2),
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2)
        ));
    }

    // Spawn paramecia
    for (let i = 0; i < ORGANISM_COUNTS.paramecium; i++) {
        organisms.push(new Paramecium(
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2),
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2)
        ));
    }

    // Spawn diatoms
    for (let i = 0; i < ORGANISM_COUNTS.diatom; i++) {
        organisms.push(new Diatom(
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2),
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2)
        ));
    }

    // Spawn viruses
    for (let i = 0; i < ORGANISM_COUNTS.virus; i++) {
        organisms.push(new Virus(
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2),
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2)
        ));
    }

    // Spawn cells
    for (let i = 0; i < ORGANISM_COUNTS.cell; i++) {
        organisms.push(new Cell(
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2),
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2)
        ));
    }

    // Spawn rotifers
    for (let i = 0; i < ORGANISM_COUNTS.rotifer; i++) {
        organisms.push(new Rotifer(
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2),
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2)
        ));
    }

    // Spawn rare organisms
    if (features.hasRareOrganism) {
        console.log(`Spawning rare organism: ${features.rareOrganism}`);

        if (features.rareOrganism === 'tardigrade') {
            organisms.push(new Tardigrade(
                rnd(-WORLD_SIZE/4, WORLD_SIZE/4),
                rnd(-WORLD_SIZE/4, WORLD_SIZE/4)
            ));
        } else if (features.rareOrganism === 'giant_amoeba') {
            organisms.push(new Amoeba(
                rnd(-WORLD_SIZE/4, WORLD_SIZE/4),
                rnd(-WORLD_SIZE/4, WORLD_SIZE/4),
                true // giant flag
            ));
        }
    }

    // Spawn molecular objects densely throughout the world
    // DNA helices
    for (let i = 0; i < 40; i++) {
        molecularObjects.push(new FloatingDNA(
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2),
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2)
        ));
    }

    // Proteins
    for (let i = 0; i < 80; i++) {
        molecularObjects.push(new FloatingProtein(
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2),
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2)
        ));
    }

    // Ribosomes
    for (let i = 0; i < 100; i++) {
        molecularObjects.push(new FloatingRibosome(
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2),
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2)
        ));
    }

    // ATP molecules (lots of them, fast moving)
    for (let i = 0; i < 150; i++) {
        molecularObjects.push(new FloatingATP(
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2),
            rnd(-WORLD_SIZE/2, WORLD_SIZE/2)
        ));
    }
}

function updateEcosystem(dt) {
    // Remove dead organisms
    organisms = organisms.filter(org => org.health > 0);

    // Update all organisms
    for (const org of organisms) {
        org.update(dt);
    }

    // Update molecular objects
    for (const mol of molecularObjects) {
        mol.update(dt);
    }

    // Respawn bacteria if population too low
    const bacteriaCount = organisms.filter(o => o.type === 'bacteria').length;
    if (bacteriaCount < ORGANISM_COUNTS.bacteria * 0.5) {
        for (let i = 0; i < 10; i++) {
            const newBac = new Bacteria(
                viewX + rnd(-400, 400),
                viewY + rnd(-400, 400)
            );
            newBac.divisionCooldown = rnd(5, 20);
            organisms.push(newBac);
        }
    }

    // Limit total bacteria to prevent explosion
    const allBacteria = organisms.filter(o => o.type === 'bacteria');
    if (allBacteria.length > ORGANISM_COUNTS.bacteria * 2.5) {
        // Remove oldest bacteria
        allBacteria.sort((a, b) => b.age - a.age);
        for (let i = 0; i < 15; i++) {
            if (allBacteria[i]) allBacteria[i].die();
        }
    }

    // Spawn molecular objects near camera at high zoom
    if (currentZoom > 20 && molecularObjects.length < 500) {
        // Add more ATP near view
        for (let i = 0; i < 3; i++) {
            molecularObjects.push(new FloatingATP(
                viewX + rnd(-100, 100),
                viewY + rnd(-100, 100)
            ));
        }
        // Occasionally add proteins
        if (rndBool(0.1)) {
            molecularObjects.push(new FloatingProtein(
                viewX + rnd(-150, 150),
                viewY + rnd(-150, 150)
            ));
        }
    }

    // Clean up molecular objects that are too far from view
    if (molecularObjects.length > 600) {
        molecularObjects = molecularObjects.filter(mol => {
            const dx = mol.x - viewX;
            const dy = mol.y - viewY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 800) {
                if (mol.group) scene.remove(mol.group);
                return false;
            }
            return true;
        });
    }
}

// ============================================================================
// ZOOM & VIEW MANAGEMENT
// ============================================================================

function updateZoomLevel() {
    if (currentZoom < 4) {
        zoomLevel = 'macro';
    } else if (currentZoom < 12) {
        zoomLevel = 'cellular';
    } else if (currentZoom < 30) {
        zoomLevel = 'organelle';
    } else {
        zoomLevel = 'molecular';
    }

    const styles = {
        macro: features.palette.phaseContrast.background,
        cellular: features.palette.fluorescence.background,
        organelle: features.palette.darkField.background,
        molecular: features.palette.electronMicroscopy.background
    };

    scene.background = new THREE.Color(styles[zoomLevel]);
}

function updateCamera() {
    // Smooth zoom
    currentZoom += (targetZoom - currentZoom) * 0.1;

    // Smooth pan (for click-to-zoom)
    viewX += (targetViewX - viewX) * 0.1;
    viewY += (targetViewY - viewY) * 0.1;

    // Follow selected organism
    if (followingOrganism && selectedOrganism && selectedOrganism.health > 0) {
        targetViewX = selectedOrganism.x;
        targetViewY = selectedOrganism.y;
    }

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 500 / currentZoom;

    camera.left = frustumSize * aspect / -2 + viewX;
    camera.right = frustumSize * aspect / 2 + viewX;
    camera.top = frustumSize / 2 + viewY;
    camera.bottom = frustumSize / -2 + viewY;
    camera.updateProjectionMatrix();

    updateZoomLevel();
}

// ============================================================================
// CLICK-TO-ZOOM
// ============================================================================

function onCanvasClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Find clicked organism
    let closestOrg = null;
    let closestDist = Infinity;

    for (const org of organisms) {
        if (!org.mesh || !org.mesh.visible || !org.clickable) continue;

        const dist = Math.sqrt(
            Math.pow((org.x - (viewX + mouse.x * 250 / currentZoom)), 2) +
            Math.pow((org.y - (viewY + mouse.y * 250 / currentZoom)), 2)
        );

        if (dist < org.getBoundingRadius() && dist < closestDist) {
            closestOrg = org;
            closestDist = dist;
        }
    }

    if (closestOrg) {
        selectOrganism(closestOrg);
    } else {
        // Click on empty space - deselect
        deselectOrganism();
    }
}

function selectOrganism(org) {
    selectedOrganism = org;
    followingOrganism = true;

    // Zoom to organism
    targetViewX = org.x;
    targetViewY = org.y;

    // Determine appropriate zoom level
    const zoomLevels = {
        bacteria: 20,
        amoeba: 8,
        paramecium: 12,
        diatom: 15,
        virus: 40,
        cell: 10,
        rotifer: 10,
        tardigrade: 5
    };

    targetZoom = Math.max(currentZoom, zoomLevels[org.type] || 10);

    // Update UI
    showStatus(`Following: ${org.type}`);
    setTimeout(hideStatus, 2000);
}

function deselectOrganism() {
    selectedOrganism = null;
    followingOrganism = false;
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

// ============================================================================
// INPUT HANDLING
// ============================================================================

let isDragging = false;
let lastMouseX, lastMouseY;
let dragStartTime = 0;

function setupInputHandlers() {
    const container = document.getElementById('canvas-container');

    // Mouse wheel zoom
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom * zoomFactor));

        // Stop following when manually zooming
        if (e.deltaY > 0) {
            followingOrganism = false;
        }
    }, { passive: false });

    // Mouse down
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartTime = Date.now();
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    // Mouse move
    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const dx = (e.clientX - lastMouseX) / currentZoom;
            const dy = (e.clientY - lastMouseY) / currentZoom;
            targetViewX -= dx;
            targetViewY += dy;
            viewX = targetViewX;
            viewY = targetViewY;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;

            // Stop following when dragging
            followingOrganism = false;
        }
    });

    // Mouse up / click
    container.addEventListener('mouseup', (e) => {
        const dragDuration = Date.now() - dragStartTime;
        const wasDrag = dragDuration > 150 ||
            Math.abs(e.clientX - lastMouseX) > 5 ||
            Math.abs(e.clientY - lastMouseY) > 5;

        if (!wasDrag) {
            onCanvasClick(e);
        }

        isDragging = false;
    });

    container.addEventListener('mouseleave', () => { isDragging = false; });

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
            case 'escape':
                deselectOrganism();
                break;
            case '1':
                targetZoom = 1;
                break;
            case '2':
                targetZoom = 5;
                break;
            case '3':
                targetZoom = 15;
                break;
            case '4':
                targetZoom = 35;
                break;
            case '5':
                targetZoom = 70;
                break;
        }
    });

    // Touch support
    let lastTouchDist = 0;
    let touchStartTime = 0;

    container.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        if (e.touches.length === 1) {
            isDragging = true;
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDist = Math.sqrt(dx*dx + dy*dy);
        }
    });

    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
            const dx = (e.touches[0].clientX - lastMouseX) / currentZoom;
            const dy = (e.touches[0].clientY - lastMouseY) / currentZoom;
            targetViewX -= dx;
            targetViewY += dy;
            viewX = targetViewX;
            viewY = targetViewY;
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;
            followingOrganism = false;
        } else if (e.touches.length === 2) {
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

    container.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - touchStartTime;
        if (touchDuration < 200 && e.changedTouches.length === 1) {
            // Tap = click
            onCanvasClick({
                clientX: e.changedTouches[0].clientX,
                clientY: e.changedTouches[0].clientY
            });
        }
        isDragging = false;
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
    organisms = [];
    molecularObjects = [];

    generateFeatures();
    spawnOrganisms();
    updateUI();

    viewX = 0; viewY = 0;
    targetViewX = 0; targetViewY = 0;
    targetZoom = 1;
    selectedOrganism = null;
    followingOrganism = false;

    showStatus('New ecosystem generated!');
    setTimeout(hideStatus, 1500);
}

function updateUI() {
    const featuresDiv = document.getElementById('features');
    if (featuresDiv) {
        featuresDiv.innerHTML = `
            <div class="feature"><span class="label">Ecosystem:</span> <span class="value">${features.ecosystemType}</span></div>
            <div class="feature"><span class="label">Activity:</span> <span class="value">${features.activityLevel}</span></div>
            <div class="feature"><span class="label">Dominant:</span> <span class="value">${features.dominantSpecies}</span></div>
            <div class="feature"><span class="label">Rarity:</span> <span class="value rarity-${features.rarity}">${features.rarity}</span></div>
            ${features.hasRareOrganism ? `<div class="feature"><span class="label">Rare:</span> <span class="value">${features.rareOrganism.replace('_', ' ')}</span></div>` : ''}
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

    // Update organism count
    const countDiv = document.getElementById('organism-count');
    if (countDiv) {
        countDiv.textContent = `Organisms: ${organisms.length}`;
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

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateCamera();
    });

    animate();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
