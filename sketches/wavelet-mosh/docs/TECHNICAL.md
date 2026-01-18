# Technical Implementation

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   index.html                     │
│  ┌─────────────────────────────────────────────┐│
│  │              sketch.js                       ││
│  │  ┌─────────────────┐ ┌───────────────────┐  ││
│  │  │  Hash/PRNG      │ │  WebGL Setup      │  ││
│  │  │  sfc32 seeded   │ │  Context, buffers │  ││
│  │  └────────┬────────┘ └─────────┬─────────┘  ││
│  │           │                    │             ││
│  │  ┌────────▼────────────────────▼─────────┐  ││
│  │  │         Feature Generation            │  ││
│  │  │  10 patterns, 24 wavelets, 24 palettes││
│  │  │  6 speeds, 8 decomp levels            │  ││
│  │  └────────────────────┬──────────────────┘  ││
│  └───────────────────────┼──────────────────────┘│
│                          │                       │
│  ┌───────────────────────▼──────────────────────┐│
│  │              GLSL Shaders                    ││
│  │  ┌─────────────┐  ┌────────────────────────┐││
│  │  │ wavelet.vert│  │     wavelet.frag       │││
│  │  │ passthrough │  │ patterns + wavelets +  │││
│  │  │             │  │ palettes + animation   │││
│  │  └─────────────┘  └────────────────────────┘││
│  └──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

## WebGL Setup

### Context Configuration
```javascript
{
    alpha: false,        // No transparency needed
    antialias: false,    // Preserve crisp glitch pixels
    depth: false,        // 2D only
    stencil: false,      // Not used
    preserveDrawingBuffer: true  // For PNG export
}
```

### Geometry
Single full-screen quad using triangle strip:
```
(-1,-1) ─── (1,-1)
   │    ╲      │
   │      ╲    │
(-1,1) ─── (1,1)
```

### DPR Handling
Device pixel ratio capped at 2x to prevent performance issues on high-DPI displays while maintaining visual quality.

## Shader Pipeline

### Vertex Shader
Simple passthrough that converts clip space (-1 to 1) to UV space (0 to 1):
```glsl
v_uv = a_position * 0.5 + 0.5;
```

### Fragment Shader Flow

```
┌──────────────────┐
│   Hash Noise     │ ← u_seed
│   (procedural)   │
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Base Pattern    │ ← u_patternType (0-9)
│  10 options      │
└────────┬─────────┘
         │
┌────────▼─────────┐
│ Multi-Level      │ ← u_decompLevels (1-8)
│ Wavelet Transform│ ← u_waveletType (0-23)
│ (up to 8 passes) │ ← u_glitchAmount
└────────┬─────────┘
         │
┌────────▼─────────┐
│ Luminance →      │
│ Palette Mapping  │ ← u_paletteIndex (0-23)
└────────┬─────────┘
         │
┌────────▼─────────┐
│ Post-Effects     │
│ subtle scanlines │
└────────┬─────────┘
         │
         ▼
    gl_FragColor
```

## Pattern Implementations

### pattern0: Blocks
Grid-based blocks with hash-varied animation timing per cell.

### pattern1: Noise Layers
Multi-octave FBM noise with separate RGB channel offsets.

### pattern2: Circles
Overlapping pulsing rings from multiple center points.

### pattern3: Stripes
Rotating line intersections using dot product.

### pattern4: Voronoi
Animated Voronoi cells with time-modulated cell centers.

### pattern5: Plasma
Classic plasma effect using multiple sinusoidal functions.

### pattern6: Checkerboard
Warped checkerboard with UV distortion and noise overlay.

### pattern7: Radial Burst
Combined radial rays and concentric rings.

### pattern8: Gradient Bands
Horizontal bands with hash-determined colors per band.

### pattern9: Interference
Wave interference pattern from multiple source points.

## Wavelet Implementations

### Mathematical Wavelets (0-9)

**Haar (wav0)**: Block-based averaging with noise modulation.

**Daubechies2 (wav1)**: Directional smearing via UV offset.

**Biorthogonal (wav2)**: Block hash mixing with wave modulation.

**Coiflet (wav3)**: UV warping with FBM and time modulation.

**Symlet (wav4)**: Radial symmetry effects using polar coordinates.

**Mexican Hat (wav5)**: Center-weighted Gaussian-like response.

**Morlet (wav6)**: Gaussian envelope with oscillation.

**Shannon (wav7)**: Sinc function approximation.

**DCT (wav8)**: Block-based discrete cosine transform simulation.

**Gabor (wav9)**: Multi-directional Gabor filter responses.

### Glitch Effects (10-23)

**Pixel Sort (wav10)**: Brightness-based sorting simulation.

**Glitch Blocks (wav11)**: Random block displacement and color.

**Scanline (wav12)**: CRT-style horizontal scanlines.

**VHS (wav13)**: VHS tracking artifacts and noise.

**Chromatic (wav14)**: Color channel separation (aberration).

**Displacement (wav15)**: Noise-driven UV displacement.

**Fractal (wav16)**: Mandelbrot-inspired iteration.

**Kaleidoscope (wav17)**: Angular symmetry reflection.

**Posterize (wav18)**: Color quantization with edge detection.

**Ripple (wav19)**: Radial wave distortion.

**Edge Detect (wav20)**: Derivative-based edge enhancement.

**Smear (wav21)**: Horizontal streak artifacts.

**Tile Shift (wav22)**: Random tile offsetting.

**Data Bend (wav23)**: Simulated data corruption with row shifting.

## Multi-Level Decomposition

Up to 8 levels of wavelet decomposition:

```glsl
vec3 multiLevel(vec2 uv, vec3 b, float t, int lv, int w, float a) {
    vec3 r = b;
    float la = a;
    for (int i = 0; i < 8; i++) {
        if (i >= lv) break;
        float sc = pow(2.0, float(i));  // Scale doubles each level
        r = mix(r, applyWavelet(fract(uv * sc), r, t + float(i), la, w).rgb, 0.5);
        la *= 0.7;  // Reduce intensity at higher levels
    }
    return r;
}
```

## Palette System

### Hard Transition Palettes (0-11)
Use `step()` and `floor()` functions for hard color boundaries.

Example (neon_glitch):
```glsl
vec3(step(0.5, fract(t * 3.0)),
     step(0.5, fract(t * 5.0 + 0.33)),
     step(0.5, fract(t * 4.0 + 0.66))) * 0.8 + 0.2;
```

### Gradient Palettes (12-23)
Use `mix()` for smooth color transitions.

Example (synthwave):
```glsl
if (t < 0.5) return mix(vec3(0.1, 0.0, 0.2), vec3(1.0, 0.0, 0.5), t * 2.0);
return mix(vec3(1.0, 0.0, 0.5), vec3(0.0, 0.8, 1.0), (t - 0.5) * 2.0);
```

## Performance Optimizations

### Shader Optimizations
1. **Avoid branching**: Use `mix()` and `step()` instead of `if/else`
2. **Fixed loop iterations**: `for` loops have compile-time known bounds
3. **Precision**: Use `highp` for time/position, could optimize others
4. **No textures**: All effects are procedural

### JavaScript Optimizations
1. **Uniform caching**: Location lookup done once at init
2. **Minimal allocations**: Reuse typed arrays
3. **RAF throttling**: Single animation frame loop
4. **Lazy shader loading**: Async fetch with error handling

### Memory
- No textures (all procedural)
- Single 8-vertex buffer
- 9 uniforms total

## Browser Compatibility

### WebGL 1.0 Constraints
- No `texelFetch()` - use `texture2D()`
- No integer uniforms in vertex shader
- No `gl_FragDepth`
- 16-bit float precision minimum
- Fixed loop iterations required

### Tested Browsers
| Browser | Status |
|---------|--------|
| Chrome 90+ | ✓ |
| Firefox 88+ | ✓ |
| Safari 14+ | ✓ |
| Edge 90+ | ✓ |
| iOS Safari | ✓ |
| Chrome Android | ✓ |

### Fallbacks
- WebGL 1.0 context with `experimental-webgl` fallback
- Error display if WebGL unavailable
- Graceful degradation on shader compile failure

## File Sizes

| File | Size | Purpose |
|------|------|---------|
| sketch.js | ~12KB | WebGL setup, features, API |
| wavelet.frag | ~18KB | All visual effects (24 wavelets, 24 palettes, 10 patterns) |
| wavelet.vert | ~200B | Passthrough |
| index.html | ~12KB | Viewer UI with rarity curves |

Total: ~42KB (no dependencies)

## API Reference

```javascript
// Core
WaveletMosh.setup(container, size)  // Initialize
WaveletMosh.regenerate()            // New random hash
WaveletMosh.togglePause()           // Pause/resume animation
WaveletMosh.save(filename)          // Export PNG
WaveletMosh.resize(size)            // Resize canvas

// State
WaveletMosh.getHash()               // Current hash
WaveletMosh.setHash(hash)           // Set specific hash
WaveletMosh.getFeatures()           // Current feature values
WaveletMosh.setParameter(name, val) // Override parameter
WaveletMosh.resetToOriginal()       // Reset to hash-derived values
WaveletMosh.hasModifications()      // Check if modified

// Feedback
WaveletMosh.recordFeedback(isLike)  // Record like/dislike
WaveletMosh.getFeedbackStats()      // Get aggregated stats
WaveletMosh.exportFeedback()        // Get raw feedback data
WaveletMosh.clearFeedback()         // Clear all feedback

// Constants
WaveletMosh.getConstants()          // Get feature arrays
WaveletMosh.getRarityCurves()       // Get probability distributions
```

## Future Optimizations

Potential improvements if needed:
1. **Compute shaders** (WebGL 2.0): Faster multi-pass transforms
2. **Texture-based wavelets**: Pre-computed filter banks
3. **Worker-based PRNG**: Offload feature generation
4. **Instanced rendering**: Multiple outputs simultaneously
5. **LOD system**: Reduce complexity at smaller sizes
