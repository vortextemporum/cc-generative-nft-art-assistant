# Changelog

## [2.8] - 2026-02-11

### Added
- Animation range selector: Full, 1/10, 1/100, 1/1000
  - Controls interpolation speed — how fast params converge to targets
  - At 1/1000 fold creeps at ~0.05 units/frame instead of jumping
  - Randomization (R) now also randomizes range and lock category
- WebGL-accelerated isometric 3D view
  - Separate shader program with VBO/IBO for mesh rendering
  - GPU depth testing replaces CPU painter's algorithm sorting
  - Single `gl.drawElements()` call replaces ~65k individual p5.js draw calls
  - Grid cap raised from 256 to 512 (262k triangles at 60fps)
  - Vertex color averaging for smooth shading at shared vertices
- 32px resolution option (7 total: 32, 64, 128, 256, 512, 1024, 2048)

### Changed
- Randomization now uses full resolution range (was skipping 64/128)
- 2D GPU renderer rebinds vertex state on each frame (robust after iso→2D switch)
- Skip 2D wavetable rendering when in isometric view mode (saves GPU time)

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
