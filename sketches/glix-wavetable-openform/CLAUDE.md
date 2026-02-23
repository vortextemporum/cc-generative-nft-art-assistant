# GLIX Wavetable (Open Form Edition) - Claude Guide

## Project Overview

**Version:** 0.2.0
**Platform:** fxhash (Base blockchain, art coins)
**Framework:** p5.js + WebGL 1.0 GLSL
**Type:** Open Form (evolution-based)
**Based on:** glix-wavetable-fxhash v1.5.0 (long-form)

Open-form version of the GLIX Wavetable synthesizer. Editions evolve through a lineage system where each generation adds visual complexity.

## File Structure

```
glix-wavetable-openform/
├── index.html          # Full-screen viewer
├── index.js            # Main engine (to be refactored for open form)
├── fxhash.min.js       # fxhash SDK (supports open-form APIs)
├── style.css           # Full-screen dark canvas
├── .fxhash.json        # Project config (blockchain: base)
├── CLAUDE.md           # This file
├── CHANGELOG.md        # Version history
├── docs/
│   ├── OPEN-FORM-DESIGN.md   # Full design document (READ THIS FIRST)
│   └── RARITY-TABLE.md       # Complete rarity distributions by depth
├── libraries/
│   └── p5.min.js       # p5.js (bundled locally)
└── versions/           # Historical snapshots
```

## Key Documentation

| Document | What it covers |
|----------|---------------|
| `docs/OPEN-FORM-DESIGN.md` | Full architecture, depth system, evolution mechanics, pseudocode, visual progression, collector experience, implementation checklist |
| `docs/RARITY-TABLE.md` | Complete rarity distributions for every trait at every depth level |

## How Open Form Works (Quick Summary)

1. Root mint (depth 0) → base oscillator, palette, animation — simple/clean
2. Evolution to depth 1 → adds fold, crush, transform, phase mods
3. Evolution to depth 2 → adds DSP effects (ring mod, comb, clip, etc.)
4. Evolution to depth 3+ → adds post-FX textures, resolution upgrades, mutations

Each depth uses `$fx.randAt(depth)` for its own PRNG. Root traits are inherited by all descendants.

## Key APIs

| API | Usage |
|-----|-------|
| `$fx.depth` | Current edition's generation (0 = root) |
| `$fx.lineage` | Array of all ancestor hashes |
| `$fx.randAt(d)` | PRNG seeded by hash at depth d |
| `$fx.rand` | Same as `$fx.randAt($fx.depth)` |

## Implementation Status

- [x] Project structure and docs
- [x] Refactor generateFeatures() for depth-based layering
- [x] useDepth() helper for depth-scoped PRNG
- [x] Depth-gated feature traits in $fx.features()
- [ ] Test with fxlens open-form mode
- [ ] Verify lineage inheritance
- [ ] Final rarity tuning

## Differences from Long-Form

| Aspect | Long Form | Open Form |
|--------|-----------|-----------|
| Blockchain | Ethereum | Base |
| Complexity | All at once | Layered by depth |
| Root mints | Full visual | Clean/simple |
| Art coins | No | Yes |
| Editions | 512 fixed | Dynamic |

