# GLIX Wavetable (fxhash Edition) - Changelog

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
