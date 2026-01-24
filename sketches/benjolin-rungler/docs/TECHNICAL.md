# Benjolin Rungler - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      index.html                         │
│  ┌─────────────┐  ┌─────────────────────────────────┐  │
│  │   Canvas    │  │          Sidebar UI              │  │
│  │   700x700   │  │  - Features table               │  │
│  │   WebGL     │  │  - Parameter sliders            │  │
│  └─────────────┘  │  - Feedback buttons             │  │
│                   └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      sketch.js                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │    Hash     │  │   Feature   │  │     WebGL       │ │
│  │   System    │  │  Generator  │  │     Setup       │ │
│  │   (sfc32)   │  │             │  │                 │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  Feedback   │  │  Controls   │  │   Render Loop   │ │
│  │   System    │  │   Handler   │  │                 │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 shaders/benjolin.frag                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  Utilities  │  │ Oscillators │  │   Mode Funcs    │ │
│  │  hash/noise │  │  benjolin() │  │  circuit/scope  │ │
│  │  quantize   │  │             │  │  pixel/hybrid   │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Hash-Based Randomness

### sfc32 PRNG

We use the sfc32 (Simple Fast Counter) algorithm for deterministic randomness:

```javascript
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
```

**Properties:**
- Period: ~2^128
- Passes BigCrush statistical tests
- Fast execution
- Seedable from hash string

### Hash Initialization

```javascript
function initRandom(hashStr) {
    const h = hashStr.slice(2); // Remove "0x" prefix
    const seeds = [];
    for (let i = 0; i < 4; i++) {
        seeds.push(parseInt(h.slice(i * 8, (i + 1) * 8), 16));
    }
    return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}
```

The 64-character hex hash provides 256 bits of entropy, split into four 32-bit seeds.

## WebGL Implementation

### Shader Program Setup

```javascript
// Vertex shader: simple fullscreen quad
const vertexSource = `
    attribute vec2 aPosition;
    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

// Fragment shader loaded from file
const fragmentShader = await fetch('shaders/benjolin.frag');
```

### Fullscreen Quad

```javascript
const positions = new Float32Array([
    -1, -1,   // Bottom-left
     1, -1,   // Bottom-right
    -1,  1,   // Top-left
     1,  1    // Top-right
]);
```

Drawn as `TRIANGLE_STRIP` with 4 vertices.

### Framebuffer Feedback

```javascript
// Create texture for previous frame
feedbackTexture = gl.createTexture();
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

// Create framebuffer
feedbackFBO = gl.createFramebuffer();
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, feedbackTexture, 0);

// Each frame: render, then copy to feedback texture
gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, width, height, 0);
```

## GLSL Shader Details

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uResolution` | vec2 | Canvas dimensions |
| `uTime` | float | Elapsed time in seconds |
| `uFrame` | float | Frame counter |
| `uFeedback` | sampler2D | Previous frame texture |
| `uMode` | int | Visual mode (0-3) |
| `uOscRatio` | float | Oscillator frequency ratio |
| `uRunglerBits` | float | Shift register bit count |
| `uFeedbackAmt` | float | Feedback blend amount |
| `uRgbOffset` | float | RGB channel offset |
| `uSpeed` | float | Animation speed multiplier |

### Oscillator Algorithm

The Benjolin simulation uses coupled oscillators:

```glsl
Oscillators benjolin(float t, vec2 uv) {
    // Base frequencies with spatial variation
    float f1 = 0.7 + 0.3 * sin(uv.x * PI);
    float f2 = f1 * uOscRatio + 0.2 * sin(uv.y * PI);

    // Cross-modulation (FM synthesis concept)
    float mod1 = sin(t * speed * f2 * TAU + uv.y * 4.0);
    float mod2 = sin(t * speed * f1 * TAU + uv.x * 4.0);

    // Oscillators with FM
    float osc1 = sin(t * speed * f1 * TAU + mod2 * 2.0 + uv.x * 3.0);
    float osc2 = sin(t * speed * f2 * TAU * 1.3 + mod1 * 2.5 + uv.y * 3.0);

    // Additional chaos via feedback
    osc1 += 0.3 * sin(osc2 * PI + t * speed * 0.7);
    osc2 += 0.3 * sin(osc1 * PI + t * speed * 0.9);

    // ... Rungler calculation
}
```

### Rungler Simulation

The Rungler creates stepped random values that update at oscillator zero-crossings:

```glsl
float runglerPhase = floor(t * speed * f2 * 2.0);
float rungler = 0.0;
for (float i = 0.0; i < 16.0; i++) {
    if (i >= bits) break;
    float bitVal = step(0.5, hash(runglerPhase + i * 0.1 + uv.x * 100.0 + uv.y * 50.0));
    rungler += bitVal * pow(2.0, -i - 1.0);
}
rungler = rungler * 2.0 - 0.5; // Center around 0
```

### Noise Functions

```glsl
// Simple hash
float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // Smoothstep
    // Bilinear interpolation of hashed corners
}

// Fractal Brownian Motion
float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < octaves; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
```

## Performance Considerations

### GPU Load

| Mode | Relative Cost | Notes |
|------|---------------|-------|
| Circuit | Low | Simple grid calculations |
| Scope | Medium | Lissajous loop (100 iterations) |
| Pixel | Low-Medium | Bit manipulation, no loops |
| Hybrid | High | All three modes + extra RGB passes |

### Optimization Strategies

1. **Reduce Lissajous samples:** Lower the loop count in `modeScope()`
2. **Simplify Hybrid:** Remove one layer or reduce RGB passes
3. **Lower resolution:** Reduce canvas size for mobile
4. **Reduce FBM octaves:** 4 instead of 6 for faster noise

### Memory Usage

- Feedback texture: 700x700x4 = ~1.96MB
- No additional textures required
- All computation is per-pixel in shader

## Browser Compatibility

### Required WebGL Features

- WebGL 1.0 (widely supported)
- `OES_texture_float` not required (uses UNSIGNED_BYTE)
- `WEBGL_draw_buffers` not required

### Tested Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Known Issues

- Safari may have different precision for trigonometric functions
- Mobile browsers may have lower framerate
- Some integrated GPUs struggle with Hybrid mode

## File Size Analysis

| File | Size | Purpose |
|------|------|---------|
| index.html | ~8KB | Viewer UI and styles |
| sketch.js | ~12KB | WebGL setup, features, controls |
| benjolin.frag | ~10KB | GLSL shader with all modes |
| **Total** | **~30KB** | Complete sketch (no dependencies) |

No external dependencies required - fully self-contained.

## Development Tools

### Console API

```javascript
// Get current features
benjolin.features()

// Change parameter
benjolin.setParameter('mode', 2)

// Reset overrides
benjolin.resetToOriginal()

// Feedback analysis
benjolin.getFeedbackStats()
benjolin.exportFeedback()

// Rarity info
benjolin.getRarityCurves()
```

### LocalStorage

Feedback data stored in `benjolin-rungler-feedback`:

```javascript
{
    liked: [
        { timestamp, hash, features, hadOverrides }
    ],
    disliked: [...]
}
```

## Extending the Sketch

### Adding a New Mode

1. Create mode function in shader:
```glsl
vec3 modeNewMode(vec2 uv, Oscillators osc, float t) {
    vec3 col = vec3(0.0);
    // Your implementation
    return col;
}
```

2. Add case in `main()`:
```glsl
else if (uMode == 4) {
    col = modeNewMode(uv, osc, t);
}
```

3. Update JavaScript:
```javascript
const MODE_NAMES = ["Circuit", "Scope", "Pixel", "Hybrid", "NewMode"];
```

4. Update HTML slider max value

### Adding a New Feature

1. Add uniform to shader
2. Add to `generateFeatures()` in sketch.js
3. Add slider in index.html
4. Update `setParameter()` if needed
5. Document in FEATURES.md
