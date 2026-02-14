# /fxhash_project - Create an fxhash-ready generative art project

Create a complete fxhash-compatible project ready for minting on Ethereum, Tezos, or Base.

## Process

### 1. Discovery Phase

Ask the user about their project using the AskUserQuestion tool (present as interactive questionnaires, 3-4 questions at a time):

**Concept & Vision:**
- Core concept (1-2 sentences)
- Visual style and aesthetic
- Target audience on fxhash

**fxhash-Specific:**
- Edition size? (1, 64, 128, 256, 512, 1024, unlimited)
- Blockchain? (Ethereum, Tezos, Base)
- Price strategy? (Dutch auction, Dutch auction with rebates, fixed, free)
- Will you use fx(params) for collector customization?
- Tags for discovery (max 10)

**Technical:**
- Framework (p5.js recommended, Three.js, vanilla JS, GLSL)
- Animated or static?
- Capture mode: CANVAS or VIEWPORT?
- Capture trigger: FX_PREVIEW (programmatic) or DELAY?
- GPU-intensive? (affects capture settings)

### 2. Create Project Structure

```
sketches/{project-name}/
├── index.html              # Main entry point
├── sketch.js               # Main sketch code
├── fxhash.min.js           # @fxhash/project-sdk (latest from npm)
├── style.css               # Minimal responsive styling
├── CLAUDE.md               # AI guide
├── CHANGELOG.md            # Version history
├── .fxhash.json            # fxhash project config
├── versions/
│   └── .gitkeep
└── docs/
    ├── FEATURES.md         # Trait/rarity documentation
    └── TECHNICAL.md        # Implementation details
```

### 3. File Templates

#### fxhash.min.js - SDK Boilerplate

Use the **official @fxhash/project-sdk**. For projects without npm/bundler, use this standalone boilerplate that replicates the SDK behavior:

```javascript
// fxhash SDK boilerplate - replicates @fxhash/project-sdk behavior
// For production: use `npm i @fxhash/project-sdk` or the official fxhash.min.js

// Hash injection - platform provides this at mint time
// For local dev, generate a random one
if (typeof window.$fx === 'undefined') {
  const alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const fxhash = "oo" + Array(49).fill(0).map(_ =>
    alphabet[Math.floor(Math.random() * alphabet.length)]).join('');

  // SFC32 PRNG - seeded from Base58 hash
  const b58dec = (str) => [...str].reduce((acc, c) =>
    acc * 58n + BigInt(alphabet.indexOf(c)), 0n);
  const fxhashDec = b58dec(fxhash);

  const sfc32 = (a, b, c, d) => {
    const rand = () => {
      a |= 0; b |= 0; c |= 0; d |= 0;
      let t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = c << 21 | c >>> 11;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
    rand.reset = () => {
      // Store initial state for reset
      [a, b, c, d] = rand._initial;
    };
    rand._initial = [a, b, c, d];
    return rand;
  };

  const fxrand = sfc32(
    Number(fxhashDec & 0xFFFFFFFFn),
    Number((fxhashDec >> 32n) & 0xFFFFFFFFn),
    Number((fxhashDec >> 64n) & 0xFFFFFFFFn),
    Number((fxhashDec >> 96n) & 0xFFFFFFFFn)
  );

  // $fx API
  window.$fx = {
    hash: fxhash,
    rand: fxrand,
    minter: "0x0000000000000000000000000000000000000000",
    randminter: fxrand, // Same as rand in dev mode
    context: "standalone",
    iteration: 0,
    isPreview: new URLSearchParams(window.location.search).get('preview') === '1',
    _features: {},
    _params: [],
    features: function(f) {
      if (f) this._features = { ...this._features, ...f };
      return this._features;
    },
    getFeature: function(key) { return this._features[key]; },
    getFeatures: function() { return this._features; },
    preview: function() {
      window.dispatchEvent(new Event('fxhash-preview'));
      console.log("[fxhash] preview triggered");
    },
    params: function(defs) { this._params = defs; },
    getParam: function(id) {
      const def = this._params.find(p => p.id === id);
      return def ? def.default : null;
    },
    getParams: function() {
      const result = {};
      this._params.forEach(p => { result[p.id] = p.default; });
      return result;
    },
    getRawParam: function(id) { return null; },
    getRawParams: function() { return {}; },
    getDefinitions: function() { return this._params; },
    on: function(event, handler) {
      window.addEventListener(event, handler);
      return () => window.removeEventListener(event, handler);
    },
    emit: function(event, data) {
      window.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    // Open-form API (stubs)
    lineage: [],
    depth: 0,
    randAt: function(depth) { return this.rand; }
  };

  // Legacy aliases
  window.fxhash = fxhash;
  window.fxrand = fxrand;
  window.fxpreview = () => window.$fx.preview();
}

console.log("[fxhash] hash:", $fx.hash);
console.log("[fxhash] context:", $fx.context);
```

#### sketch.js Template

```javascript
// {PROJECT_NAME} - fxhash generative art
// Author: {AUTHOR}
// Version: 1.0.0

// ============================================================================
// RANDOMNESS - Derive all from $fx.rand()
// ============================================================================

const R = $fx.rand;

function rnd(min = 0, max = 1) {
  return min + R() * (max - min);
}
function rndInt(min, max) {
  return Math.floor(rnd(min, max + 1));
}
function rndChoice(arr) {
  return arr[Math.floor(R() * arr.length)];
}
function rndBool(probability = 0.5) {
  return R() < probability;
}
function rollRarity(...options) {
  const roll = R();
  let cumulative = 0;
  for (const opt of options) {
    cumulative += opt.prob;
    if (roll < cumulative) return opt.value;
  }
  return options[options.length - 1].value;
}

// ============================================================================
// FEATURES - Called once in setup()
// ============================================================================

let features = {};

function generateFeatures() {
  features = {
    palette: rollRarity(
      { value: "Mono", prob: 0.5 },
      { value: "Duo", prob: 0.3 },
      { value: "Tri", prob: 0.15 },
      { value: "Rainbow", prob: 0.05 }
    ),
    complexity: rndInt(1, 5),
    animated: rndBool(0.3),
  };

  // Register features with fxhash platform
  $fx.features(features);
  return features;
}

// ============================================================================
// P5.JS SKETCH
// ============================================================================

function setup() {
  // Generate features FIRST (before any other R() calls)
  generateFeatures();

  createCanvas(windowWidth, windowHeight);
  pixelDensity(2);

  // Your setup code here

  if (!features.animated) {
    noLoop();
  }
}

function draw() {
  background(20);

  // Your draw code here

  // Trigger preview capture after first frame
  if (frameCount === 1) {
    $fx.preview();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ============================================================================
// CONTROLS
// ============================================================================

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas(`${$fx.hash.slice(0, 12)}`, 'png');
  }
}
```

#### index.html Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{PROJECT_NAME}</title>
  <link rel="stylesheet" href="style.css">
  <!-- fxhash SDK must load FIRST -->
  <script src="fxhash.min.js"></script>
  <!-- Libraries bundled locally (NO CDN links) -->
  <script src="./libraries/p5.min.js"></script>
</head>
<body>
  <script src="sketch.js"></script>
</body>
</html>
```

#### style.css Template

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  background: #0d0d14;
  overflow: hidden;
}

canvas {
  display: block;
}
```

#### .fxhash.json - Project Configuration

```json
{
  "name": "{PROJECT_NAME}",
  "description": "{DESCRIPTION}",
  "tags": [],
  "capture": {
    "mode": "CANVAS",
    "triggerMode": "FX_PREVIEW",
    "canvasSelector": "canvas",
    "delay": 2000
  },
  "settings": {
    "exploration": {
      "preMint": { "enabled": true },
      "postMint": { "enabled": false }
    }
  }
}
```

### 4. Deployment Checklist

```markdown
## fxhash Deployment Checklist

### Pre-Upload
- [ ] Test with multiple hashes (reload 20+ times)
- [ ] Verify $fx.preview() triggers correctly
- [ ] Check all features register with $fx.features()
- [ ] Test at different viewport sizes (responsive)
- [ ] Ensure no console errors
- [ ] No external network requests (all resources local)
- [ ] All file paths are relative (./path/to/file)
- [ ] ZIP file under 15 MB
- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] Verify determinism: same hash = same output every time

### Build & Upload
1. `npx fxhash build` (creates upload.zip)
   - OR manually zip project folder (exclude node_modules, .git)
2. Go to https://www.fxhash.xyz/mint-generative
3. Upload zip file
4. Configure:
   - Edition size
   - Blockchain (Ethereum, Tezos, or Base)
   - Price (Dutch auction recommended)
   - Royalties (0-25%, typically 10-15%)
   - Tags (10 max)
   - Reserves/allowlists (if any)
   - Content labels (epileptic, sexual, animated, audio, interactive)
5. Test in sandbox mode
6. Verify features appear correctly
7. Publish!

### Post-Publish
- [ ] Verify first mints look correct
- [ ] Check feature distribution
- [ ] Monitor for rendering issues
- [ ] Engage with collectors on Discord
```

## fxhash vs Art Blocks Quick Reference

| Aspect | fxhash | Art Blocks |
|--------|--------|------------|
| Blockchains | Tezos + Ethereum + Base | Ethereum |
| Randomness | `$fx.rand()` (provided by SDK) | Implement from `tokenData.hash` |
| Features | `$fx.features({})` | `tokenData.features = {}` |
| Preview | `$fx.preview()` call | Automatic |
| Storage | IPFS or ONCHFS | On-chain script |
| Platform fee | 2.5% (Tezos), 10% (ETH) | 10% |
| Curation | Open | Curated |
| Params | `$fx.params([])` collector customization | N/A |
| CLI | `npx fxhash create/dev/build` | N/A |
| SDK | `@fxhash/project-sdk` | N/A |
