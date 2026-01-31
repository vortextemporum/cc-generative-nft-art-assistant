# Changelog

All notable changes to Benjolin Rungler will be documented in this file.

## [4.0.1] - 2026-01-27

### Added
- **Layer Toggle UI**: Individual on/off checkboxes for each visual layer
  - OSC A (Horizontal), OSC B (Vertical)
  - Rungler A, Rungler B
  - Resonator, Comparator, S&H Particles, Clock Pulses
- **Parameter Controls**: Real-time sliders and dropdown
  - Intersection style selector (additive/xor/multiply/interference)
  - Wave count slider (1-12)
  - Speed slider (0.1-3.0)
  - Density slider (0.1-1.5)
  - Spiral tightness slider (0.1-4.0)
  - Chaos slider (0-1)
- Controls auto-sync with hash-derived values on regenerate
- Cyan color scheme button added to UI

## [4.0.0] - 2026-01-27

### Changed
- **BREAKING**: Complete visual redesign - unified chaos field instead of separate panels
- All signals now intersect and modulate each other across the entire canvas
- No more boxes/panels - pure visual interplay

### Added
- **Intersection Styles** (hash-derived):
  - `additive` - signals accumulate brightness
  - `xor` - signals cancel out at intersections (creates ╳ patterns)
  - `multiply` - overlapping signals boost each other
  - `interference` - wave interference patterns (uses sin phase)
- **Visual Layers**:
  - OSC A: Horizontal waves sweeping with vertical extensions
  - OSC B: Vertical waves with ○/● characters
  - Rungler A: Diagonal bands from top-left (bit patterns)
  - Rungler B: Diagonal bands from top-right
  - Resonator: Expanding spiral rings from center
  - Comparator: Grid of ┼ or ╳ based on XOR state
  - S&H: Floating particles with trails
  - Clock: Expanding rings and vertical pulse lines
- New `blendChar()` function handles all intersection math
- `waveCount` feature (3-7 parallel waves per oscillator)
- `spiralTightness` for resonator spiral shape
- `density` for S&H particle count
- Cyan color scheme added
- Warm tint for higher layer elements

### Removed
- All box/panel structure
- Separate module displays
- Status bar (minimal title only)

## [3.3.0] - 2026-01-27

### Changed
- Full Benjolin architecture matching reference block diagram
- Dual Runglers (A and B) with independent bit counts
- Twin Peak Resonator instead of simple VCF
- More chaotic signal routing and cross-modulation

### Added
- RUNGLER A & RUNGLER B - dual shift registers with stepped CV output
- S&H (Sample & Hold) module clocked by OSC B
- COMPARATOR with XOR polarity output (▲/▼)
- TWIN PEAK RESONATOR with two resonant peaks (P1, P2)
- Cross-FM modulation indicators (FM A→B, FM B→A percentages)
- Full-width AUDIO OUTPUT visualization at bottom
- Chaos background particles influenced by all signals
- Clock flash effects (╪/╫) on shift register updates
- Animated signal flow connections between modules
- Grid layout: OSC|RUNGLER pairs stacked, S&H+COMP|RESONATOR, AUDIO OUT

### Removed
- Single modulation panel (replaced with full dual-rungler architecture)
- Single filter (replaced with twin peak resonator)

## [3.2.0] - 2026-01-27

### Changed
- Removed modulation panel per user feedback
- Expanded rungler visualization with larger CV display
- Increased overall chaos level

### Added
- Background chaos field with floating particles
- Glitch scanlines and row displacement effects
- Secondary rungler output (CV2) from alternate taps
- XOR feedback in rungler when chaos > 0.5
- Clock pulse visual flash across canvas
- Waveform distortion via tanh saturation
- CRT scanline overlay

## [3.1.0] - 2026-01-27

### Changed
- Redesigned layout to fit properly in 700x700 canvas
- Smaller character size for higher resolution display

### Added
- Large animated waveform displays with trailing history
- Stepped CV visualization in RUNGLER panel

## [3.0.0] - 2026-01-27

### Changed
- **BREAKING**: Complete rewrite as ASCII art visualization using p5.js
- Replaced WebGL/GLSL shader with character-based rendering

### Added
- 5 color schemes: Phosphor, Amber, Blue, Matrix, Thermal
- Real-time oscillator simulation with cross-modulation
- Hash-derived features: oscillator frequencies, mod depths, rungler bits, filter params
- Rarity system based on loopEnabled, runglerBits, modDepth combinations

### Removed
- WebGL rendering and fragment shaders
- Framebuffer feedback system
- Old visual modes (Waveform, Scope, Pixel, Filter as GLSL)

### Note
This is a major version bump because the rendering approach changed completely.
Previous WebGL version archived as v2.0.0-webgl.js.

## [2.0.0] - 2025-01-22

### Changed
- **BREAKING**: Replaced Circuit mode (0) with **Waveform** - smooth multi-channel audio waveform visualization
- **BREAKING**: Replaced Hybrid mode (3) with **Filter** - filter resonance frequency response curves
- Significantly slower animation speeds for more contemplative visuals:
  - Slow: 0.02-0.05 (was 0.08-0.15)
  - Medium: 0.05-0.12 (was 0.15-0.3)
  - Fast: 0.12-0.25 (was 0.3-0.5)
- All parameters now fully playable via sliders (oscRatio, runglerBits)

### Note
This is a major version bump because the same hash will produce different visual output.
Modes 1 (Scope) and 2 (Pixel) remain unchanged from v1.0.0.

## [1.0.0] - 2025-01-22

### Added
- Initial release
- GLSL fragment shader with 4 visual modes:
  - **Circuit**: PCB-style traces with signal flow animation
  - **Scope**: Oscilloscope Lissajous curves with phosphor glow
  - **Pixel**: Bitcrushed shift register visualization with glitch rows
  - **Hybrid**: Layered composite of all three modes
- Benjolin-inspired dual chaotic oscillators with cross-modulation
- Simulated Rungler shift register (4-16 bits)
- Framebuffer feedback for visual persistence/trails
- RGB channel separation (chromatic aberration)
- Hash-based deterministic randomness (Art Blocks compatible)
- Comprehensive rarity system:
  - Common (45%): Circuit/Scope modes
  - Uncommon (30%): Pixel mode
  - Rare (18%): Hybrid mode
  - Legendary (7%): Hybrid + golden ratio oscillators + extreme feedback
- Dev mode features:
  - Real-time parameter sliders
  - Like/Dislike feedback system with localStorage
  - Parameter override tracking
  - Console API for exploration
- Keyboard controls (R/S/Space/L/D/1-4)
- Responsive viewer with dark theme
