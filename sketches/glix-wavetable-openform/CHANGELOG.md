# GLIX Wavetable (Open Form Edition) - Changelog

## v0.2.0 (2026-02-18)

### Changed
- **Refactored generateFeatures() for depth-based layering**
  - Depth 0 (root): oscillator, palette, hue shift, fold mode, animation — clean output
  - Depth 1: fold intensity, crush, transform, phase mods (bend, noise, quantize, spiral)
  - Depth 2: DSP effects (rectify, clip, drive, ring mod, comb, slew, bit ops)
  - Depth 3+: post-FX textures with per-depth rolls, resolution upgrades, param mutations
- **Added `useDepth(d)` helper** — swaps global R to `$fx.randAt(d)` for depth-scoped randomness
- **Feature traits are depth-gated** — NFT metadata only shows traits relevant to the edition's depth
- **Added "Depth" trait** — "Root" or "Generation N" for filtering
- **Mutations at depth 3+** — fold/crush drift ±20%, hue shift drifts ±30°

## v0.1.0 (2026-02-18)

### Initial Setup
- Created project structure from glix-wavetable-fxhash v1.5.0
- Blockchain set to Base (required for art coins / open form)
- postMint exploration enabled
- Full design documentation in docs/OPEN-FORM-DESIGN.md
- Complete rarity tables in docs/RARITY-TABLE.md
- Code not yet refactored — still runs as long-form
