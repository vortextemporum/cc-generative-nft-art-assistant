# /fxhash_project - Create an fxhash-ready generative art project

Create a complete fxhash-compatible project ready for minting on Tezos.

## Process

### 1. Discovery Phase

Ask the user about their project (same as /new_sketch but with fxhash specifics):

**Concept & Vision:**
- Core concept (1-2 sentences)
- Visual style and aesthetic
- Target audience on fxhash

**fxhash-Specific:**
- Edition size? (1, 64, 128, 256, 512, 1024, unlimited)
- Price strategy? (Dutch auction, fixed, free)
- Reserves for team/collaborators?
- Tags for discovery (max 10)
- Will you use fx(params) for collector customization?

**Technical:**
- Framework (p5.js recommended for fxhash)
- Will it be animated or static?
- Capture mode: CANVAS, VIEWPORT, or CUSTOM?
- Capture trigger: FX_PREVIEW, DELAY, or FN_TRIGGER?
- GPU-intensive? (affects pricing/accessibility)

### 2. Create Project Structure

```
sketches/{project-name}/
├── index.html              # Main entry point
├── sketch.js               # Main sketch code
├── fxhash.js               # fxhash boilerplate (fxrand, features, preview)
├── style.css               # Minimal styling
├── CLAUDE.md               # AI guide
├── README.md               # Project docs
├── CHANGELOG.md            # Version history
├── .fxhash.json            # fxhash project config
├── versions/
│   └── .gitkeep
└── docs/
    ├── FEATURES.md         # Trait/rarity documentation
    └── TECHNICAL.md        # Implementation details
```

### 3. File Templates

#### fxhash.js - Required Boilerplate

```javascript
// fxhash boilerplate - DO NOT MODIFY
// This provides fxrand(), fxhash, and feature registration

// The fxhash string is injected by the platform
// For local dev, we generate a random one
if (typeof fxhash === 'undefined') {
  var alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  var fxhash = "oo" + Array(49).fill(0).map(_ => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

// fxrand() - deterministic PRNG seeded by fxhash
// Returns value in [0, 1)
var fxrand = (function() {
  var s = [...fxhash].reduce((a, c) => {
    a = ((a << 5) - a) + c.charCodeAt(0);
    return a & a;
  }, 0) >>> 0;
  return function() {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >>> 17)) >>> 0;
    s = (s ^ (s << 5)) >>> 0;
    return s / 4294967296;
  };
})();

// Feature registration
// Call $fx.features({ "Trait": value }) to register traits
var $fx = {
  _features: {},
  features: function(f) {
    if (f) this._features = { ...this._features, ...f };
    return this._features;
  },
  getFeature: function(key) {
    return this._features[key];
  },
  getFeatures: function() {
    return this._features;
  },
  rand: fxrand,
  hash: fxhash,
  preview: function() {
    window.fxpreview = true;
    console.log("fxpreview triggered");
  },
  isPreview: false,
  context: "standalone",
  params: function(def) {
    // fx(params) support - returns default values in standalone mode
    return def.map(p => p.default);
  },
  getParam: function(id) {
    return null; // Override in production
  },
  on: function(event, handler, options) {
    // Event handlers for params updates
  },
  emit: function(id, value) {
    // Emit param changes
  }
};

// Alias for convenience
function fxpreview() {
  $fx.preview();
}

// Console info for development
console.log("fxhash:", fxhash);
console.log("Use fxrand() for deterministic randomness");
console.log("Call $fx.features({...}) to register traits");
console.log("Call fxpreview() when ready for thumbnail capture");
```

#### sketch.js Template

```javascript
// {PROJECT_NAME} - fxhash generative art
// Author: {AUTHOR}
// Version: 1.0.0

// ============================================================================
// FEATURES - Derive all randomness from fxrand()
// ============================================================================

let features = {};

function generateFeatures() {
  features = {
    // Example feature with rarity tiers
    palette: rollRarity(
      { value: "Mono", prob: 0.5 },      // 50% common
      { value: "Duo", prob: 0.3 },        // 30% uncommon
      { value: "Tri", prob: 0.15 },       // 15% rare
      { value: "Rainbow", prob: 0.05 }    // 5% legendary
    ),

    // Numeric feature
    complexity: Math.floor(fxrand() * 5) + 1,

    // Boolean feature
    animated: fxrand() < 0.3,
  };

  // Register features with fxhash
  $fx.features(features);

  return features;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Random in range
function rnd(min = 0, max = 1) {
  return min + fxrand() * (max - min);
}

// Random integer
function rndInt(min, max) {
  return Math.floor(rnd(min, max + 1));
}

// Random choice from array
function rndChoice(arr) {
  return arr[Math.floor(fxrand() * arr.length)];
}

// Weighted rarity roll
function rollRarity(...options) {
  const roll = fxrand();
  let cumulative = 0;
  for (const opt of options) {
    cumulative += opt.prob;
    if (roll < cumulative) return opt.value;
  }
  return options[options.length - 1].value;
}

// ============================================================================
// P5.JS SKETCH
// ============================================================================

function setup() {
  // Generate features FIRST (before any other fxrand calls)
  generateFeatures();

  createCanvas(700, 700);
  pixelDensity(2);

  // Your setup code here

  // If static artwork, trigger preview after drawing
  if (!features.animated) {
    noLoop();
  }
}

function draw() {
  background(20);

  // Your draw code here

  // Trigger preview capture after first frame (adjust timing as needed)
  if (frameCount === 1) {
    fxpreview();
  }
}

// ============================================================================
// CONTROLS
// ============================================================================

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas(`${fxhash.slice(0, 12)}`, 'png');
  }
  if (key === 'r' || key === 'R') {
    // Regenerate (dev only)
    location.reload();
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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
  <script src="fxhash.js"></script>
</head>
<body>
  <main id="sketch-container"></main>
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

main {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
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

After project is created, provide this checklist:

```markdown
## fxhash Deployment Checklist

### Pre-upload
- [ ] Test with multiple hashes (reload several times)
- [ ] Verify fxpreview() triggers correctly
- [ ] Check all features register with $fx.features()
- [ ] Test at different viewport sizes
- [ ] Ensure no console errors
- [ ] Remove any dev-only code (console.logs, etc.)

### Upload to fxhash
1. Zip the project folder (exclude node_modules, .git)
2. Go to https://www.fxhash.xyz/mint-generative
3. Upload zip file
4. Configure:
   - Edition size
   - Price (Dutch auction recommended)
   - Royalties (10-15% typical)
   - Tags (10 max)
   - Reserves (if any)
5. Test in sandbox mode
6. Verify features appear correctly
7. Mint!

### Post-mint
- [ ] Verify first mints look correct
- [ ] Check feature distribution
- [ ] Monitor for issues
- [ ] Engage with collectors
```

## fxhash vs Art Blocks Differences

| Aspect | fxhash | Art Blocks |
|--------|--------|------------|
| Blockchain | Tezos | Ethereum |
| Randomness | `fxrand()` provided | Implement from `tokenData.hash` |
| Features | `$fx.features({})` | `tokenData.features = {}` |
| Preview | `fxpreview()` call | Automatic |
| Storage | IPFS | On-chain script |
| Entry cost | Lower (~$1-5) | Higher (~$100+) |
| Curation | Open | Curated |
