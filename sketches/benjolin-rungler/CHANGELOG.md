# Changelog

All notable changes to Benjolin Rungler will be documented in this file.

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
