# Changelog

## [3.3] - 2026-02-13

### Added
- 4 new oscillators (20 total):
  - **Ring Mod** (16): carrier × modulator, morph sweeps ratio 2-16, creates interference patterns
  - **Phase Distortion** (17): CZ-style asymmetric phase warp, morph sweeps distortion, PW controls resonance
  - **Shepard** (18): octave-spaced sines with gaussian envelope, morph creates infinite rise illusion
  - **Wavelet** (19): Morlet wavelet (gaussian-windowed cosine), morph controls envelope width, PW controls frequency
- 2 new fold modes: Fracture (triangle ×0.05) and Ripple (triangle ×0.005), bringing total to 11

### Changed
- **Chaos oscillator** redesigned: iterated sine waveshaping `sin(g * sin(g * ...sin(2πφ)))` — morph sweeps iteration depth 1-8, PW controls gain 1.5-5. Produces structured complex harmonics instead of noise
- **Ripple post-FX** speed reduced 50× (nearly static, very slow drift)
- Fold mode labels updated to match GLSL: Harsh (sine ×0.25), Mangle (sine ×1.0), Destroy (sine ×8.0)
- Fold mode randomization expanded from 0-8 to 0-10

## [3.2] - 2026-02-13

### Added
- **Edge Detect** post-FX — gradient magnitude from 4-neighbor sampling, amplified 3x for contour visualization
- **Ripple** post-FX — animated sinusoidal UV warp (sin/cos on X/Y), creates wavy distortion
- Restructured GLSL main() pipeline: UV distortions run before computeColor(), multi-sample effects after
- Both effects have ~4% chance to trigger on randomize (R key)

## [3.1] - 2026-02-13

### Fixed
- **Chaos oscillator** — r range narrowed from 2.5-4.0 to 3.5-4.0 (stays in chaotic regime)
  - Old: bottom half was flat band (fixed point convergence at r < 3), top was pure noise
  - New: uses running average of 16 iterations instead of final value of 24
  - Produces structured patterns across the full wavetable instead of flat→noise

### Changed
- **Removed CPU fallback renderer** — WebGL is now required
  - Removed `renderWavetableCPU()` pixel-by-pixel path
  - Removed `pixelBuffer` graphics buffer and `useWebGL` conditional
  - `setup()` now shows error if WebGL unavailable instead of falling back
  - CPU `generateSample()` retained for isometric 3D heightmap computation

### Added
- **Hash display** in UI footer — shows current 256-bit hash
  - Clickable to copy full hash to clipboard
  - Updates on randomize (R key)

## [3.0] - 2026-02-12

### Added
- **Hash-based deterministic randomness** (Art Blocks compatible):
  - sfc32 PRNG seeded from 256-bit hex hash (`tokenData.hash` or random fallback)
  - `generateFeatures()` consumes R() calls to produce deterministic initial state
  - Same hash always produces identical output (params, palette, animation, post-FX)
  - `window.getFeatures()` exposes key traits (oscillator, palette, foldMode, etc.)
  - `randomizeAll()` (R key) generates new random hash and re-calls `generateFeatures()`
  - Bounce animation phases seeded from hash (no more `Math.random()` at load)
  - Helper functions: `rnd()`, `rndInt()`, `rndChoice()`, `rndBool()`
- 2 new GPU post-processing effects:
  - **Sharpen**: Unsharp mask via 4-neighbor sampling, strength 1.2
  - **Halftone**: Dot-pattern rendering, dot size varies by luminance
- 3 dither algorithms replacing single Dither button, each cycles 1px/2px/4px/8px:
  - **Bayer**: Ordered 4×4 matrix dithering (classic)
  - **Noise**: Random threshold per cell (stipple texture)
  - **Lines**: Horizontal scanline pattern, luminance-weighted
  - All combinable — stack multiple algorithms for complex textures
- Post-FX randomization on R press — each effect has <10% chance to trigger
- Smooth upscale button moved to Post FX panel (uses CSS `image-rendering` toggle)

- 19 new palettes across 6 categories (55 total):
  - **Metallic** (3): Gold, Silver, Copper
  - **Monochromatic colored** (3): Deep Blue, Crimson, Jade
  - **Film/photographic** (3): Sepia, Cyanotype, Cross Process
  - **High contrast/hard step** (3): Red/Blue, Traffic, Stamp
  - **Warm/earthy** (2): Terracotta, Sahara
  - **Inverted** (2): X-Ray (light→dark), Infrared (hot→cold)
  - **Subdued/low chroma** (3): Overcast, Fog, Bruise

### Changed
- Pulse oscillator now uses soft edge transition controlled by soften parameter
  - High soften (default 5.0) = sharp edge like before
  - Low soften = gradual slope, making phase FX and animation visually effective
  - Fixes pulse appearing static during animation

### Removed
- FXAA (Smooth upscale serves similar purpose via CSS interpolation)

## [2.9] - 2026-02-11

### Added
- Standalone `random.html` page — full-screen randomized wavetable on each refresh
  - `_GLIX_RANDOM` flag triggers headless mode: no UI, automatic randomization
  - Scoped getElementById override (temporary, only during randomizeAll) to avoid p5.js init conflict
  - UI update functions stubbed to no-ops so draw loop never touches missing DOM
- Canvas display size raised to 2048px for full-resolution output (CSS constrains visual display)

## [2.8] - 2026-02-11

### Added
- 4 new non-standard oscillators (16 total):
  - Fractal (Weierstrass): self-similar harmonic series, morph sweeps octaves 1-12, PW controls freq ratio
  - Chirp: frequency accelerates across cycle via sin(2πφ^k), morph sweeps exponent 1-8
  - Formant: gaussian-windowed harmonics creating vocal resonances, morph sweeps center freq, PW controls bandwidth
  - Chaos (Logistic map): iterated r*x*(1-x), morph sweeps r from periodic to chaotic (2.5-4.0)
- Waveform Mirror and Invert toggles
  - Mirror: flips phase (1-phase) before waveform generation
  - Invert: flips output (-sample) after waveform generation
  - 4 variations per oscillator (normal, mirror, invert, both)
  - Randomized on R press (50/50 each)
  - Implemented in both GPU (GLSL uniforms) and CPU paths
- Per-parameter animation range: Full, 1/10, 1/100
  - Controls interpolation speed per-param — each param can converge at different rates
  - UI buttons set all params to same range; randomize (R) assigns random per-param mix
  - Removed 1/1000 option (too extreme)
  - Removed Single from Animate lock categories
- WebGL-accelerated isometric 3D view
  - Separate shader program with VBO/IBO for mesh rendering
  - GPU depth testing replaces CPU painter's algorithm sorting
  - Single `gl.drawElements()` call replaces ~65k individual p5.js draw calls
  - Grid cap raised from 256 to 512 (262k triangles at 60fps)
  - Vertex color averaging for smooth shading at shared vertices
- FXAA edge-detection anti-aliasing (replaces SSAA)
  - 5-tap luminance-based edge smoothing in GLSL
  - Refactored color computation into `computeColor()` function for neighbor sampling
  - No canvas resizing needed (unlike SSAA which rendered at 2-4× resolution)

### Changed
- Wavefolder expanded to 9 modes (was 5), renamed with audio-inspired names:
  - Sine: Shred (×0.08), Drive (×0.03), Warm (×0.01), Soft (×0.004), Whisper (×0.0015), Destroy (×0.25)
  - Triangle: Crease (×0.02), Ripple (×0.005), Fracture (×0.05)
  - Each mode's sweet spot spans a wide region of the slider
- Isometric 3D grid cap lowered from 512 to 256 for better performance
- Isometric 3D view throttled to 30fps (was uncapped at 60fps)
- Randomization now uses full resolution range (was skipping 64/128)
- 2D GPU renderer rebinds vertex state on each frame (robust after iso→2D switch)
- Skip 2D wavetable rendering when in isometric view mode (saves GPU time)

### Removed
- SSAA (supersampling anti-aliasing) — replaced by FXAA
- Scanlines post-processing effect
- 32px and 64px resolution options (now 128-2048)

## [2.7] - 2026-02-11

### Added
- Hue shift parameter (0-360°) — Rodrigues rotation in RGB space
  - Slider in Color panel, randomized on R, applied in both GPU and CPU renderers
  - 36 base palettes × 360 hue angles = massive variety
- 7 structurally unique palettes:
  - Duotone (hard 2-color transition), Banded (contour bands), Coal (narrow dark range)
  - Neon Line (bright band through black), Pastel (soft desaturated), Split (diverging blue→red)
  - Prism (spectral ROYGBIV)

### Removed
- 3 redundant palettes: Magma (≈Inferno), Arctic (≈Ocean), Solar (≈Ember)
  - Recreatable via hue shift on their parent palettes

### Changed
- 36 base palettes total (was 32)

## [2.6] - 2026-02-11

### Added
- 3 new oscillators (12 total):
  - Chebyshev polynomial waveshaping T_n(x) = cos(n·arccos(x)), order 1-8
  - FM synthesis sin(2πφ + index·sin(2π·ratio·φ)), PW controls ratio
  - Harmonic series: additive partials with morph controlling harmonic count 1-16

### Changed
- Randomization biased toward cleaner outputs:
  - fx_noise: 40% chance of zero, rest power-curved (max ~0.8)
  - fx_quantize: 40% chance of zero, rest power-curved (max ~0.7)
  - fx_fold/crush/bend: probability of zero + power-biased exponential
  - pw_morph: biased toward center values
- Bounce animation: reduced noise/quantize caps for cleaner motion

## [2.5] - 2026-02-11

### Added
- Schrödinger quantum wavefunction oscillator (9th shape)
  - 1D particle-in-a-box ψ_n(x) = sin(nπx)
  - Morph axis interpolates quantum number 1-8
- 3 wavefolder modes: GenDSP (aggressive, original), Gentle (soft), Triangle (linear fold-back)
- 2 bitcrush ranges: Extreme (0-10000) and Classic (0-1)
- Logarithmic slider curves for fold, crush, bend, soften parameters
- Soften minimum extended to 0.001

### Fixed
- Wavefolder drive multiplier corrected to match original GenDSP (8.0, was 0.008)

## [2.4] - 2026-02-11

### Added
- 5 animation modes: Drift (Perlin), LFO (sine), Chaos (Lorenz), Sequencer (presets), Bounce (prime-ratio)
- Animation mode randomization in Randomize function
- Image smoothing toggle (crisp vs bilinear upscaling)
- M key to cycle animation modes

### Removed
- edge_fade parameter (audio-only, no visual purpose)

## [2.3] - 2026-02-11

### Added
- WebGL GPU-accelerated rendering via GLSL fragment shader
- Full DSP signal chain ported to GLSL (all oscillators, phase FX, post FX)
- GPU/CPU renderer indicator in footer
- 1024 and 2048 resolution options
- 15 gradient palettes + 10 chaotic non-gradient palettes (32 total)
- 4 new oscillator types: HalfRect, Staircase, Parabolic, SuperSaw (8 total)
- Version display in UI

## [2.2] - 2026-02-11

### Added
- Isometric heightmap view mode (press V or click "3D View" button)
- Interactive 3D camera: drag to rotate, shift+drag to pan, scroll to zoom
- Depth-sorted quad rendering with rotation-aware lighting
- Scan range shifted to (y+1)/(size+1) to avoid zero-row issue

### Fixed
- First row rendering (scan_pos=0 zeroed all modulated effects)

## [2.1] - Initial

### Added
- Full wavetable generator based on GenDSP v2.1
- 4 waveform shapes (sine, triangle, sawtooth, pulse)
- Phase FX: Y bend, X bend, noise, quantize
- Post FX: PW morph, wavefolder, bitcrush, edge fade
- 7 color palettes
- Smooth animation with Perlin noise drift
- Resolution switching (64-512px)
- Keyboard shortcuts and interactive controls
