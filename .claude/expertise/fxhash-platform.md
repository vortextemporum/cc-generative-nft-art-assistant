# fxhash Platform - Complete Technical Reference

> Comprehensive reference for the fxhash generative art platform, based on official documentation at docs.fxhash.xyz (scraped Feb 2026).

## Platform Overview

**fxhash** is an open generative art platform supporting **Ethereum**, **Tezos**, and **Base** blockchains. Artists upload generative art projects (HTML/JS) which are stored on **IPFS** or **ONCHFS** (on-chain file system). Each collector mint generates a unique hash that seeds deterministic randomness, producing a unique artwork.

### Key Differences from Art Blocks

| Aspect | fxhash | Art Blocks |
|--------|--------|------------|
| Blockchains | Tezos + Ethereum + Base | Ethereum only |
| Script storage | IPFS or ONCHFS | On-chain (contract) |
| Hash format | Base58 (starts with "oo", ~51 chars) | 0x + 64 hex chars |
| PRNG | SFC32 via `$fx.rand()` (provided) | Custom per project from `tokenData.hash` |
| Curation | Open platform (anyone can publish) | Curated/Playground/Factory |
| Features | `$fx.features({})` | `tokenData.features = {}` |
| Preview | `$fx.preview()` call | Automatic |
| Params | `$fx.params([])` for collector customization | N/A |
| Entry cost | Lower (Tezos ~$1-5, ETH varies) | Higher (~$100+) |
| Platform fee | 2.5% (Tezos), 10% (Ethereum) | 10% |

---

## Project Setup & Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### CLI Setup

```bash
# Install fxhash CLI globally
npm i -g fxhash

# Or use npx (no install needed)
npx fxhash create
```

### Create New Project

```bash
npx fxhash create
# Prompts for project name and template selection
# Templates: "simple" (recommended) or "ejected" (webpack customizable)
```

### Project Structure (Simple)

```
project-name/
├── index.html          # Entry point (REQUIRED)
├── index.js            # Artwork script
├── fxhash.min.js       # @fxhash/project-sdk (DO NOT MODIFY)
├── style.css           # Optional styling
└── LICENSE             # Optional
```

### Project Structure (Ejected)

```
project-name/
├── package.json
├── webpack.dev.config.js
├── webpack.prod.config.js
└── src/
    ├── index.html
    ├── index.js
    ├── fxhash.min.js
    └── LICENSE
```

### Development Commands

```bash
# Start dev environment (launches fxlens)
npx fxhash dev
# Serves fxlens at http://localhost:3300
# Serves project at http://localhost:3301 (live reload)

# Build for upload
npx fxhash build
# Creates upload.zip ready for fxhash.xyz

# Eject to webpack template (irreversible)
npx fxhash eject

# Update SDK version
npx fxhash update --sdkVersion

# Prevent SDK auto-update on dev
npx fxhash dev --noUpdate
```

### fxlens Development Environment

fxlens is the interactive development environment that provides:
- Hash randomization controls
- Parameter UI (sliders, color pickers, etc.)
- Feature display
- Capture preview
- Multiple iteration testing
- Lineage visualization (for open-form projects)

---

## $fx API Reference

The `@fxhash/project-sdk` (loaded as `fxhash.min.js`) exposes the `$fx` object on `window`.

### Core Properties

| Property | Type | Description |
|----------|------|-------------|
| `$fx.hash` | `string` | Unique 51-char Base58 hash (starts with "oo") |
| `$fx.minter` | `string` | Wallet address of the collector |
| `$fx.context` | `string` | Execution context: `"standalone"`, `"capture"`, `"fast-capture"`, `"minting"` |
| `$fx.iteration` | `number` | Iteration number of collected token |
| `$fx.isPreview` | `boolean` | `true` during capture module execution |

### Random Number Generation

```javascript
// Primary PRNG - SFC32 seeded from $fx.hash
$fx.rand()          // Returns [0, 1) - deterministic from hash
$fx.rand.reset()    // Reset PRNG to initial state (replay sequence)

// Minter-seeded PRNG
$fx.randminter()       // Returns [0, 1) - seeded from minter address
$fx.randminter.reset() // Reset minter PRNG
```

**SFC32 Implementation** (what the SDK uses internally):
```javascript
// The SDK seeds SFC32 from the Base58 hash:
// 1. Decode Base58 hash to BigInt
// 2. Extract 4 × 32-bit seeds
// 3. Initialize SFC32 PRNG
let alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
let b58dec = (str) => [...str].reduce((acc, c) => acc * 58n + BigInt(alphabet.indexOf(c)), 0n);
let fxhashDec = b58dec(fxhash);

let sfc32 = (a, b, c, d) => {
  return () => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
};

let fxrand = sfc32(
  Number(fxhashDec & 0xFFFFFFFFn),
  Number((fxhashDec >> 32n) & 0xFFFFFFFFn),
  Number((fxhashDec >> 64n) & 0xFFFFFFFFn),
  Number((fxhashDec >> 96n) & 0xFFFFFFFFn)
);
```

### Feature Declaration

```javascript
// Declare features for the token (call ONCE after page load)
$fx.features({
  "Palette": "Warm",           // string
  "Density": 0.75,             // number
  "Has Particles": true,       // boolean
  "Complexity": 5              // number
});

// Retrieve features
$fx.getFeature("Palette")      // "Warm"
$fx.getFeatures()              // { Palette: "Warm", Density: 0.75, ... }
```

**Rules:**
- Call `$fx.features()` only **once**
- Must be called **after page load**
- Values must be `string`, `number`, or `boolean`

### Preview / Capture

```javascript
// Trigger image capture for preview thumbnail
$fx.preview()

// Check if running in capture context
if ($fx.isPreview) {
  // Optimize for capture (skip animations, etc.)
}
```

### Execution Contexts

```javascript
// $fx.context values:
// "standalone" - Normal browser viewing (live mode)
// "capture"    - Backend generating preview image/GIF
// "fast-capture" - Quick preliminary preview
// "minting"    - Running inside fxparams minting interface

if ($fx.context === "fast-capture") {
  // Generate quick placeholder preview
  $fx.preview()
} else if ($fx.context === "capture") {
  // Full quality preview generation
  $fx.preview()
} else {
  // Normal browser display (standalone or minting)
}
```

---

## fx(params) - Collector Parameters

fx(params) allows artists to expose parameters that collectors can customize at mint time.

### Parameter Definition

```javascript
$fx.params([
  {
    id: "background_color",
    name: "Background Color",
    type: "color",
    default: "000000ff"
  },
  {
    id: "density",
    name: "Density",
    type: "number",
    default: 50,
    options: { min: 1, max: 100, step: 1 }
  },
  {
    id: "style",
    name: "Style",
    type: "select",
    default: "organic",
    options: { options: ["organic", "geometric", "chaotic"] }
  },
  {
    id: "show_grid",
    name: "Show Grid",
    type: "boolean",
    default: false
  }
])
```

### Parameter Types

| Type | JS Type | Options | Controller |
|------|---------|---------|------------|
| `number` | float64 | `min`, `max`, `step` | Slider + text input |
| `bigint` | BigInt (int64) | `min`, `max` | Slider + text input |
| `boolean` | boolean | none | Checkbox |
| `color` | object (see below) | none | Color picker + text |
| `string` | string | `minLength`, `maxLength` (max 64) | Text input |
| `select` | string | `options: string[]` (max 256) | Dropdown |
| `bytes` | Uint8Array | `length` (required) | Code-driven only |

### Color Parameter Deserialization

```javascript
// Color params deserialize to a rich object:
{
  hex: {
    rgb: "#19069e",
    rgba: "#19069e68"
  },
  obj: {
    rgb: { r: 25, g: 6, b: 158 },
    rgba: { r: 25, g: 6, b: 158, a: 104 }
  },
  arr: {
    rgb: [25, 6, 158],
    rgba: [25, 6, 158, 104]
  }
}
```

### Update Modes

| Mode | Source | Behavior |
|------|--------|----------|
| `page-reload` (default) | fxhash UI | Full page refresh on change |
| `sync` | fxhash UI | Sends `params:update` event, no refresh |
| `code-driven` | Code only | Updated via `$fx.emit()` |

### Parameter Events

```javascript
// Listen for parameter updates (sync or code-driven mode)
const unsubscribe = $fx.on("params:update", (params) => {
  // params contains updated values
  redraw()
}, (err) => {
  console.error("Error:", err)
})

// Emit parameter changes (code-driven mode)
$fx.emit("params:update", {
  some_bytes: new Uint8Array([1, 2, 3, 4])
})

// Unsubscribe
unsubscribe()
```

### Accessing Parameter Values

```javascript
// Transformed values (deserialized to native types)
$fx.getParam("density")       // 50 (number)
$fx.getParam("background_color") // { hex: {...}, obj: {...}, arr: {...} }
$fx.getParams()               // All params as key-value object

// Raw values (byte strings, before transformation)
$fx.getRawParam("density")    // raw bytes
$fx.getRawParams()            // all raw values

// Get definitions
$fx.getDefinitions()          // returns the parameter definition array
```

### Important Rules
- Parameter definitions must be **constant** - no randomness in definitions
- Each parameter must have a **unique `id`**
- The SDK generates random values within constraints if no `default` is set
- Setting `default` prevents random initialization

---

## Capture Settings

### Capture Modes

| Mode | Description |
|------|-------------|
| Canvas | Captures a specific `<canvas>` element (specify CSS selector) |
| Viewport | Captures entire browser window (configurable dimensions) |

### Trigger Methods

| Trigger | Description |
|---------|-------------|
| `$fx.preview()` | Programmatic - call when render is complete |
| Delay | Automatic after specified duration (max 300 seconds) |

### Advanced Capture

- **GPU acceleration**: Available for GPU-intensive projects (slow startup)
- **GIF captures**: Records frames at specified intervals; middle frame = thumbnail
- **Fast-capture**: Quick preliminary preview (`$fx.context === "fast-capture"`, max 1 second, no GPU/GIF)

---

## Open-Form Generative Art

Open-form projects receive an array of hashes representing a lineage of evolved tokens.

### API

```javascript
$fx.lineage     // string[] - array of parent hashes + current hash
$fx.depth       // number - count of parents (lineage.length - 1)
$fx.randAt(n)   // PRNG seeded by lineage hash at depth n

// Custom PRNG from any hash
$fx.createFxRandom(hash)  // Returns independent PRNG function
```

### Design Approaches

1. **Depth-based traits**: Visual parameters tied to edition depth
2. **Root randomness**: Index-0 hash defines lineage characteristics
3. **Inherited traits**: Loop through lineage PRNGs to reproduce parent selections
4. **Random mutations**: Algorithmic chance for new traits at specific depths
5. **Completely random**: Use `$fx.randAt($fx.depth)` for current edition's hash

### Restrictions
- `$fx.randminter` and `$fx.params` are NOT compatible with open-form projects
- Avoid conditional blocks assuming specific depth existence

---

## Project Configuration (.fxhash.json)

```json
{
  "name": "Project Name",
  "description": "Project description",
  "tags": ["generative", "abstract", "p5js"],
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

### Capture Modes
- `"CANVAS"` - Capture specific canvas element
- `"VIEWPORT"` - Capture full viewport

### Trigger Modes
- `"FX_PREVIEW"` - Wait for `$fx.preview()` call
- `"DELAY"` - Auto-capture after delay (ms)

---

## Including Libraries

**Critical**: Libraries CANNOT be loaded from CDNs. All resources must be bundled locally.

```html
<!-- CORRECT: local file -->
<script src="./libraries/p5.min.js"></script>

<!-- WRONG: CDN link (will fail) -->
<script src="https://cdn.jsdelivr.net/npm/p5"></script>
```

### Popular Libraries
- **p5.js** - Most popular on fxhash (Canvas API wrapper)
- **Three.js** - 3D graphics
- **Paper.js** - Vector graphics
- **chroma.js** - Color manipulation
- **Spectral.js** - Spectral color mixing
- **p5.brush** - Brush/painting effects

### p5.js with Bundlers (fxlens)

Global mode may fail in bundlers. Use instance mode:

```javascript
const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(400, 400);
    p.background(220);
  };
  p.draw = () => {
    p.ellipse(p.mouseX, p.mouseY, 50, 50);
  };
};
new p5(sketch);
```

Or manual binding:
```javascript
window.setup = function() { createCanvas(400, 400); };
window.draw = function() { ellipse(mouseX, mouseY, 50, 50); };
```

---

## Responsive Design

Projects should adapt to any viewport size. fxhash captures at various resolutions.

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
canvas { display: block; }
```

```javascript
// p5.js responsive
function setup() {
  createCanvas(windowWidth, windowHeight);
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
```

---

## Publishing Workflow

### Pre-Upload Checklist
- [ ] Test with multiple hashes (reload many times)
- [ ] Verify `$fx.preview()` triggers correctly
- [ ] Check `$fx.features()` registers all traits
- [ ] Test at different viewport sizes
- [ ] No console errors
- [ ] All resources bundled locally (no CDN links)
- [ ] No network requests
- [ ] ZIP under 15 MB
- [ ] All paths relative (`./path/to/file`)
- [ ] Responsive to viewport resize events
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### Upload Process
1. Build: `npx fxhash build` (creates `upload.zip`)
2. Go to https://www.fxhash.xyz/mint-generative
3. Upload zip file
4. Configure: editions, pricing, royalties, tags, reserves
5. Test in sandbox
6. Verify features display correctly
7. Mint/publish

### Pricing Models
- **Fixed price**: Constant throughout sale
- **Dutch auction**: Decreasing price over time to minimum
- **Dutch auction with rebates**: Early buyers refunded difference to final price

### Revenue Splits
- **Tezos**: 2.5% platform fee
- **Ethereum/Base**: 10% platform fee
- **Royalties**: 0-25% on secondary sales (artist-determined)

---

## Deterministic Randomness Rules

1. **Always** use `$fx.rand()` (or `fxrand()`) - never `Math.random()`
2. Same hash must **always** produce identical output
3. Call all random functions in `setup()` for static art, not in `draw()`
4. Animation can use `noise()` (Perlin) or math functions that don't consume `$fx.rand()`
5. Test determinism: reload with same hash, verify identical output

### Helper Functions Pattern

```javascript
// Common helpers wrapping $fx.rand()
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
```

---

## Artist Code of Conduct (Key Points)

- Work must use **deterministic randomness** via `$fx.rand()`
- Projects producing different results from the same hash will be **moderated**
- Projects must be **unique** in design and code (not copies)
- Inspired work must be **transformative** enough
- Layered PNG artworks must describe methodology in description
- Rescheduling allowed only for launch issues (not for visibility boosting)

---

## ONCHFS (On-Chain File System)

ONCHFS is a permissionless content-addressable file system fully stored on-chain. It provides an alternative to IPFS for projects that want true on-chain storage. Files are chunked and stored in smart contract storage.

---

## Key URLs & Resources

- **Website**: https://www.fxhash.xyz
- **Documentation**: https://docs.fxhash.xyz
- **GitHub**: https://github.com/fxhash
- **Boilerplate**: https://github.com/fxhash/fxhash-boilerplate
- **Params Boilerplate**: https://github.com/fxhash/params-boilerplate
- **SDK (npm)**: `@fxhash/project-sdk`
- **CLI (npm)**: `@fxhash/cli`
- **Discord**: https://discord.gg/fxhash

### API Endpoints
- **GraphQL**: https://api.fxhash.xyz/graphql
- **IPFS Gateway**: https://gateway.fxhash.xyz/ipfs/{CID}

### Tezos Contracts
| Contract | Address | Purpose |
|----------|---------|---------|
| Issuer V2 | `KT1BJC12dG17CVvPKJ1VYaNnaT5mzfnUTwXv` | Current issuer |
