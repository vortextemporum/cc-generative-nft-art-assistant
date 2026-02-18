# GLIX Wavetable (fxhash Edition) - Changelog

## v1.5.0 (2026-02-18)

### Changed
- **Improved project description** — narrative style for fxhash listing
- **Capture resolution** — 800x800 → 1024x1024
- **Hard Clip rarity** — 40% → 25%
- **Asymmetric Drive rarity** — 40% → 25%

## v1.4.0 (2026-02-14)

### Changed
- **Expanded NFT features from 9 to 18 traits** — collector-friendly tiered classifications
  - Added: Oscillator Family, Fold Intensity, Transform, Signal Chain, DSP Effects, Phase, Texture, Animation Speed, Animation Range, Motion, Resolution
  - Replaced Yes/No toggles with meaningful categorical values
- **Added Resolution trait** to feature metadata

## v1.3.0 (2026-02-14)

### Changed
- **Renamed sketch.js → index.js** — matches fxhash simple template convention, enables `npx fxhash dev`
- **Blockchain set to Ethereum** in .fxhash.json and docs

## v1.2.0 (2026-02-14)

### Fixed
- **p5.js bundled locally** — removed CDN link (fxhash requires no external network requests)
- **Script load order** — fxhash.js now loads before p5.js per SDK requirements
- **Modern SDK API** — `$fx.rand` replaces legacy `fxrand`, `$fx.preview()` replaces `fxpreview()`

## v1.1.0 (2026-02-14)

### Changed
- fx_fold extreme rarity: 1% → 3% (moderate 69% → 67%)
- wave_mirror/invert: 50% → 25% each
- Ripple post-FX: 4% → 2.5%
- Isometric tilt range: 0-86° → 0-180° (full flip)

## v1.0.0 (2026-02-14)

### Initial Release
- Full port from GLIX Wavetable Generator v3.4 (Art Blocks) to fxhash
- **Randomness**: Replaced sfc32/tokenData.hash with fxrand()/fxhash
- **Features**: Registered 9 traits via $fx.features() (Oscillator, Palette, Hue Shift, Fold Mode, Animation, Has Fold, Has Crush, Mirror, Invert)
- **Preview**: fxpreview() triggers after first rendered frame
- **UI**: Removed sidebar controls, kept minimal keyboard shortcuts (S=save, V=view, P=pause, +/-=speed)
- **Canvas**: Full-screen responsive (fills viewport, maintains 1:1 aspect)
- **Engine**: All 20 oscillators, 55 palettes, full DSP chain, 5 animation modes, 10 post-FX effects preserved from original
- **512 editions**
