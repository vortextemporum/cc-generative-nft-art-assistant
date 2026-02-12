# GLIX Wavetable Generator - Claude Guide

## Project Overview

**Version:** 3.0
**Framework:** p5.js + WebGL 1.0 GLSL

A visual wavetable synthesizer based on a GenDSP/Max/Jitter patch. Renders a 2D wavetable where X-axis is phase (0-1) and Y-axis is morph position (scan position). Full DSP signal chain runs on GPU via GLSL fragment shader.

## File Structure

```
glix-wavetable/
├── index.html          # Viewer with controls panel (~600 lines)
├── random.html         # Standalone full-screen random viewer (headless mode)
├── sketch.js           # Main p5.js sketch + GLSL shader (~1850 lines)
├── CLAUDE.md           # This file
└── CHANGELOG.md        # Version history
```

## Origins

Based on "GLIX WAVETABLE GENERATOR v2.2 (Extreme)" - a GenDSP patch for Max/Jitter that generates wavetables with extensive modulation options.

## Oscillators (16 total)

| Index | Name | Formula / Description |
|-------|------|----------------------|
| 0 | Sine | sin(2πφ) |
| 1 | Triangle | 1 - |2φ - 1| × 2 |
| 2 | Sawtooth | 2φ - 1 |
| 3 | Pulse | PW-controlled square wave |
| 4 | HalfRect | Half-rectified sine |
| 5 | Staircase | 4-step quantized sine |
| 6 | Parabolic | 1 - 2t² (rounded triangle) |
| 7 | SuperSaw | 3 detuned saws mixed |
| 8 | Schrödinger | ψ_n(x) = sin(nπx), morph sweeps quantum number 1-8 |
| 9 | Chebyshev | T_n(x) = cos(n·arccos(x)), morph sweeps polynomial order 1-8 |
| 10 | FM | sin(2πφ + index·sin(2π·ratio·φ)), morph sweeps mod depth 0-8, PW controls ratio |
| 11 | Harmonic | Additive partials Σsin(k·2πφ)/k, morph sweeps harmonic count 1-16 |
| 12 | Fractal | Weierstrass Σsin(b^n·πφ)/a^n, morph sweeps octaves 1-12, PW controls freq ratio 2-5 |
| 13 | Chirp | sin(2π·φ^k), morph sweeps exponent k 1-8 |
| 14 | Formant | Gaussian-windowed harmonics, morph sweeps center freq 2-16, PW controls bandwidth |
| 15 | Chaos | Logistic map r·x·(1-x) iterated 24×, morph sweeps r 2.5-4.0 |

## Parameters

### Oscillator
| Parameter | Range | Description |
|-----------|-------|-------------|
| shape | 0-11 | Oscillator type (see table above) |
| pw | 0-1 | Pulse width / phase shift / FM ratio |
| soften | 0.001-50 | Soft saturation (tanh), logarithmic slider |

### Phase FX
| Parameter | Range | Description |
|-----------|-------|-------------|
| y_bend | -0.25 to 1.0 | Warp morph speed (power curve on Y) |
| fx_bend | 0-1000 | X-axis phase warp, logarithmic slider |
| fx_noise | 0-1 | Static noise/dirt on phase |
| fx_quantize | 0-1 | Pixelate/step the phase |

### Post FX
| Parameter | Range | Description |
|-----------|-------|-------------|
| pw_morph | -50 to 50 | Spiraling / PWM shift over Y |
| fx_fold | 0-10000 | Wavefolder intensity, logarithmic slider |
| fold_mode | 0-8 | Sine: 0=Shred (×0.08), 1=Drive (×0.03), 2=Warm (×0.01), 3=Soft (×0.004), 4=Whisper (×0.0015), 7=Destroy (×0.25). Triangle: 5=Crease (×0.02), 6=Ripple (×0.005), 8=Fracture (×0.05) |
| fx_crush | 0-1 | Bitcrush intensity, logarithmic slider |

### Post-Processing (GPU shader, 6 effects)
| Effect | Description |
|--------|-------------|
| Smooth | CSS image-rendering toggle (bilinear upscale) |
| Dither | Ordered Bayer 4×4 dithering, cycles through 1px/2px/4px/8px |
| Posterize | 6-level color quantization |
| Grain | Animated film noise |
| Sharpen | Unsharp mask via 4-neighbor sampling (strength 1.2) |
| Halftone | Dot-pattern rendering, dot size varies by luminance |

Randomization (R press) gives each PP effect <10% chance to trigger.

## Rendering Architecture

- **Primary renderer**: WebGL 1.0 GLSL fragment shader (full DSP chain on GPU)
- **Fallback**: CPU pixel-by-pixel via p5.js pixels[] array
- **Display**: 2048×2048 canvas (CSS-constrained to 700px in index.html), internal render at 128-2048px (default 2048)
- **Headless mode**: `window._GLIX_RANDOM = true` skips UI, auto-randomizes, stubs DOM functions
- **Isometric 3D**: WebGL mesh rendering (VBO/IBO), grid capped at 256, GPU depth testing, 30fps throttle
- **FXAA**: Edge-detection AA in GLSL — `computeColor()` sampled at 5 positions, luminance-based blending

### Signal Flow (in GLSL)
1. Y-warp (time bending via power function)
2. Phase noise (hash-based static)
3. Phase quantize (stepped/pixelated)
4. Phase bend (S-curve stretch)
5. Waveform generation (12 oscillator types)
6. Morph/shift application
7. Soft saturation (tanh)
8. Bitcrush (amplitude quantize)
9. Wavefolder (9 modes: 6 sine drive intensities + 3 triangle)
10. Post-processing (sharpen, dither, posterize, grain, halftone)

## Animation System

5 modes (cycled with M key or UI buttons):
- **Drift**: Perlin noise — smooth organic movement
- **LFO**: Sine oscillators — rhythmic, musical
- **Chaos**: Lorenz attractor — unpredictable but structured
- **Sequencer**: Step presets with smoothstep interpolation
- **Bounce**: Prime-ratio sine ping-pong

### Animation Range (per-parameter)
- `paramRanges` object: per-param interpolation speed multiplier (1.0, 0.1, 0.01)
- UI buttons set all params to same value; `randomizeParamRanges()` assigns random per-param mix
- `interpolateParams()` uses `paramRanges[k]` for each param's lerp speed
- On randomize (R), each param independently gets Full/1/10/1/100

### Parameter Lock System
- Lock categories control how many params animate: Couple(2-3), Multiple(4-5), Most(7-8), All(9)
- `paramLocks` object tracks per-param lock state
- `setTarget(key, val)` respects locks — animation functions use this instead of direct assignment
- `applyRandomLocks()` shuffles which params are locked based on category

### Randomization Distribution
- `fx_noise` / `fx_quantize`: 40% chance of zero, rest biased low via power curve
- `fx_fold` / `fx_crush` / `fx_bend`: chance of zero + power-biased exponential mapping
- `pw_morph`: biased toward center
- Designed to preserve clean outputs while allowing occasional dirty ones

## Color Palettes

36 base palettes × continuous hue shift (0-360°):
- 7 original gradients, 9 scientific/themed gradients, 10 chaotic, 7 structurally unique (duotone, banded, coal, neonline, pastel, split, prism)
- Hue shift: Rodrigues rotation around (1,1,1) axis in RGB space (GPU + CPU)

## View Modes

1. **2D Color** (default): Top-down wavetable, X=phase, Y=morph, color=amplitude
2. **Isometric Heightmap**: 3D terrain with drag-to-rotate, shift+drag pan, scroll zoom
   - **WebGL-accelerated**: Uses separate shader program (`isoShaderProgram`) with VBO/IBO
   - CPU computes samples + projection, GPU handles depth-tested triangle rendering
   - Grid capped at 512×512 (vs old 256 CPU limit), uses `OES_element_index_uint` for >65k vertices
   - Single `gl.drawElements()` call replaces ~65k individual p5.js draw calls

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Pause/resume animation |
| R | Randomize all parameters |
| 0 | Reset to defaults |
| S | Save image (PNG) |
| 1-9 | Select oscillator 0-8 |
| C | Cycle color palette |
| V | Toggle 2D/Isometric view |
| M | Cycle animation mode |
| +/- | Adjust animation speed |

## Key Implementation Notes

- **expMap/logMap**: Exponential mapping (k=4) for logarithmic slider curves on large-range params
- **vertexBuffer**: Stored globally for rebinding after WebGL canvas resize
- **u_size vs u_canvas_size**: u_size = wavetable grid resolution, u_canvas_size = actual pixel dimensions (for post-FX)
- **WebGL 1.0 constraints**: No dynamic array indexing, loops need constant bounds, use if/else chains for oscillator selection

## Common Tasks

### Add a new oscillator
1. Add CPU implementation in `generateSample()` (if/else chain by `sel`)
2. Add GLSL implementation in fragment shader (matching if/else chain)
3. Add button to `#shape-buttons` in index.html with `data-shape="N"`
4. Update `randomizeAll()` shape range: `floor(random(N+1))`

### Add a new palette
1. Add color array to `palettes` object in sketch.js
2. Add option to `palette-select` dropdown in index.html
3. Colors are [R, G, B] arrays (0-255)

### Add a post-processing effect
1. Add uniform declaration in GLSL shader
2. Add effect code after color mapping, before `gl_FragColor`
3. Add uniform upload in `renderWavetableGPU()`
4. Add toggle button in Post FX panel in index.html
5. Add state variable and toggle logic in `togglePP()`


<claude-mem-context>
# Recent Activity

<!-- This section is auto-generated by claude-mem. Edit content outside the tags. -->

*No recent activity*
</claude-mem-context>