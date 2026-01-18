# data-stomp - AI Assistant Guide

## Project Overview

**data-stomp** is a generative audio-visual artwork featuring unconventional noise pedals inspired by [Soma Laboratory](https://somasynths.com/) instruments (Pulsar-23, Terra, Lyra-8). The pedals produce [Ryoji Ikeda](https://www.ryojiikeda.com/) / [Alva Noto](https://alvanoto.com/) inspired minimal electronic music using Tone.js.

### Core Concept
- Guitar pedal enclosures in unconventional shapes (organic blobs, geometric, brutalist)
- Vintage-style knobs (chicken head, Davies, MXR, Moog) with rare LED/digital variants
- Generative, hash-locked audio sequences that don't loop for very long periods
- Full interactivity: drag knobs, stomp footswitches, affects audio in real-time

## File Structure

```
data-stomp/
├── index.html          # Viewer with Tone.js, controls, features table
├── sketch.js           # Main sketch - visuals + audio engine
├── CLAUDE.md           # This file
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
│   └── .gitkeep
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation
```

## Current Version

**v1.0.0** - Initial release

## Key Concepts

### Feature System (sketch.js)

Features are derived deterministically from the hash:

```javascript
features = {
  // Visual
  colorScheme: 'black-white' | 'dark-brass' | 'industrial' | 'colorful-vintage',
  shape: 'organic' | 'geometric' | 'brutalist' | 'mixed',
  pedalCount: 1 | 2 | 3,
  knobSet: ['chicken-head', 'davies-skirted', ...],

  // Audio
  soundCharacter: 'ikeda-minimal' | 'alva-noto' | 'bytebeat-glitch' | 'fm-noise',
  tempo: 60-140 BPM,
  scale: 'chromatic' | 'pentatonic' | 'whole-tone' | etc.,
  rootNote: 'C' - 'B',
  patternLength: 8-64 (multiplied by 64 for total steps),
  ...
}
```

### Rarity Tiers

| Tier | Probability | Color |
|------|-------------|-------|
| Common | 30-50% | Gray |
| Uncommon | 25-30% | Blue |
| Rare | 15-25% | Gold |
| Legendary | 10-15% | Red |

### Shape Generators

1. **Organic** - Blob shapes using bezier curves with variable "blobiness"
2. **Geometric** - Polygons (3-8 sides) with skew and rotation
3. **Brutalist** - Chunky asymmetric rectangles
4. **Mixed** - Random combination per pedal

### Audio Engine (Tone.js)

Four sound character presets:
- **ikeda-minimal**: Pure sine oscillators + white noise bursts
- **alva-noto**: Click/membrane synth + micro-tones
- **bytebeat-glitch**: Bitcrushed square waves + brown noise
- **fm-noise**: FM synthesis + pink noise bursts

### Interactivity

- **Knobs**: Drag up/down to adjust value (0-1)
- **Footswitches**: Click to toggle pedal active/inactive
- **Keyboard**: Space = play/stop, R = regenerate, S = save

## Quick Commands

```bash
# Open in browser
open sketches/data-stomp/index.html

# Or with local server (for audio)
cd sketches/data-stomp && python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Making Changes

### Before Any Changes
```bash
# Archive current version
cp sketch.js versions/v1.0.0-sketch.js
```

### Version Numbering
- **Major** (2.0.0): Different visual/audio output for same hash
- **Minor** (1.1.0): New features, backward compatible
- **Patch** (1.0.1): Bug fixes, no output changes

### After Changes
1. Update version in sketch.js header comment
2. Update CHANGELOG.md
3. Update version in index.html
4. Test with multiple hashes

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      index.html                          │
│  ┌─────────────────┐  ┌─────────────────────────────┐   │
│  │     Canvas      │  │         Sidebar             │   │
│  │   (visuals)     │  │  - Controls (Play/Regen)    │   │
│  │                 │  │  - Features table           │   │
│  └────────┬────────┘  │  - Hash display             │   │
│           │           └─────────────────────────────┘   │
└───────────┼─────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────┐
│                      sketch.js                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Features   │  │   Renderer   │  │ Audio Engine │   │
│  │  Generator   │  │   (Canvas)   │  │  (Tone.js)   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │           │
│         └────────┬────────┴────────┬────────┘           │
│                  │                 │                    │
│         ┌────────▼─────┐   ┌───────▼────────┐           │
│         │ Pedal Objects│   │ Pattern/Seq    │           │
│         └──────────────┘   └────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

## Color Schemes

| Scheme | Background | Accent | Rarity |
|--------|------------|--------|--------|
| black-white | #0a0a0a | #ffffff | Common |
| industrial | #121416 | #7a8288 | Uncommon |
| dark-brass | #0d0b08 | #c9a227 | Rare |
| colorful-vintage | #1a1612 | #ffd700 | Legendary |

## Knob Types

| Type | Style | Rarity Tier |
|------|-------|-------------|
| chicken-head | Pointer indicator | Common |
| davies-skirted | Skirted with pointer | Common |
| mxr-hex | Hexagonal with line | Uncommon |
| moog-bakelite | Notch indicator | Uncommon/Rare |
| backlit-ring | LED ring display | Rare/Legendary |
| 7-segment | Digital readout | Legendary |

## Dependencies

- **Tone.js v14.8.49** (CDN) - Web Audio framework
- **Vanilla Canvas 2D** - No additional visual libraries

## Known Limitations

1. Audio requires user interaction to start (browser policy)
2. Scope visualization is simulated when not playing
3. Pattern very long but technically finite (~4096 steps default)
