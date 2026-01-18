# Changelog

All notable changes to data-stomp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-01-19

### Changed
- Audio engine rewritten based on SuperCollider Ikeda tutorial reference
- 7 proper Ikeda-style voices matching SC synth definitions:
  - click: Impulse with OnePole filter (500-10kHz), random pan
  - highshort: 10kHz sine, very short envelope
  - bass: Layered 49/98/196 Hz sines (G harmonics)
  - envsine: 1174 Hz sine with reverb
  - highlong: 12544 Hz sine, medium envelope
  - midsine: 3136 Hz sine, clipped, short
  - burst: White noise with envelope
- XOX pattern system matching SC's ~xox notation (x=hit, o=rest)
- Knob labels renamed to meaningful parameters:
  - CLICK → click voice level
  - HIGH → high frequency voices (highshort, highlong, midsine)
  - BASS → bass voice level
  - NOISE → noise burst level
  - SPACE → reverb wet amount
  - RATE → tempo multiplier

### Fixed
- Knob names now directly correspond to audio parameters they control

## [2.1.0] - 2025-01-19

### Added
- SuperCollider-like Pattern class with generators:
  - Pseq: sequential patterns with repeats
  - Prand: random selection from list
  - Pwhite: uniform random in range
  - Pwrand: weighted random selection
  - Pgeom: geometric series
  - Pbjorklund: Euclidean rhythm generator
- 5 Ikeda-style synthesis voices:
  - sineClick: pure sine clicks (main rhythm)
  - sinePing: high sine pings with reverb
  - noiseBurst: white noise texture bursts
  - subBass: sub bass pulses (foundation)
  - fmGlitch: FM synthesis glitch accents
- Ikeda-style frequency set (A/C/D octaves, round kHz, binary values)
- Hash-derived Euclidean rhythms for each voice
- Accent sequencer for drones and data bursts

### Changed
- Complete audio engine rewrite with sophisticated Ryoji Ikeda aesthetics
- Knobs now control audio parameters in real-time:
  - FREQ → master filter cutoff (200-18000 Hz)
  - TONE → frequency multiplier
  - GAIN → velocity
  - RATE → event density
  - MIX → reverb wet
  - DECAY → delay wet/feedback
  - DRIVE → bitcrusher amount/bits
  - DEPTH → FM harmonicity/modulation

### Fixed
- Knobs now affect Tone.js audio dynamically (getKnobValues read each tick)

## [2.0.0] - 2025-01-18

### Changed
- Complete rewrite with clean, minimal design
- Simple rectangular pedal shape (no complex organic/geometric shapes)
- 4 color palettes: monochrome, warm, cool, matrix
- 4 knob styles: classic (pointer), minimal (arc), led (ring), digital (readout)
- Proper grid-based knob layout with computed positions
- Clean separation between layout computation and rendering

### Fixed
- Knobs now properly spaced in grid (no overlapping)
- Knob interaction works correctly (drag up/down changes value)
- Visual feedback on hover and drag
- All knob styles show value changes correctly

### Removed
- Complex shape generators (organic, geometric, brutalist)
- Multiple knob type mixing (now one style per pedal)
- Rarity system (simplified for clarity)

## [1.1.0] - 2025-01-18

### Changed
- Single pedal always (removed multi-pedal option)
- Grid-based knob layout system (2x2, 2x3, 3x2, or 4x2 layouts)
- Each knob type now visually distinct:
  - Chicken-head: classic pointer with white triangle indicator
  - Davies-skirted: large grooved skirt with white line indicator
  - MXR-hex: hexagonal body with notches and colored line
  - Moog-bakelite: brown ribbed body with white dot indicator
  - Backlit-ring: LED segment ring (green-yellow-red gradient)
  - 7-segment: digital display with value and indicator LEDs
- Improved knob interaction with larger hit areas
- More sensitive knob dragging (100px for full range)
- Layout zones: title, display, knobs, LEDs, footswitch

### Fixed
- Knobs no longer overlap or appear outside pedal bounds
- Knob dragging now works correctly
- Hover states properly highlight active knobs

### Added
- roundRect polyfill for browser compatibility

## [1.0.0] - 2025-01-18

### Added
- Initial release
- Pedal shape generators: organic (blob), geometric (polygon), brutalist (chunky), mixed
- Color schemes: black-white (common), industrial (uncommon), dark-brass (rare), colorful-vintage (legendary)
- Vintage knob types: chicken-head, davies-skirted, mxr-hex, moog-bakelite
- Rare control types: backlit-ring LED, 7-segment digital display
- Sound characters: ikeda-minimal, alva-noto, fm-noise, bytebeat-glitch
- Tone.js audio engine with oscillators, noise, FM synthesis, bitcrusher
- Hash-based deterministic sequencer with very long patterns
- Full interactivity: drag knobs, click footswitches
- Oscilloscope waveform displays
- LED status indicators
- Pedalboard background with screw details
- Patch cable decorations between pedals
- Rarity system for all major traits
- Keyboard shortcuts (Space, R, S)
- Responsive canvas (700x700)
- Features table with rarity badges
