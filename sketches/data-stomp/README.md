# data-stomp

Generative noise pedals with Ikeda/Noto/bytebeat audio.

## Description

**data-stomp** renders unconventional noise pedal enclosures inspired by [Soma Laboratory](https://somasynths.com/) instruments (Pulsar-23, Terra, Lyra-8). Each pedal generates minimal electronic music in the style of [Ryoji Ikeda](https://www.ryojiikeda.com/) and [Alva Noto](https://alvanoto.com/).

The pedals feature:
- Organic, geometric, or brutalist enclosure shapes
- Vintage-style knobs (chicken head, Davies, MXR, Moog)
- Rare LED-ring and 7-segment digital displays
- Oscilloscope waveform displays
- Blinking LEDs synced to the music
- Fully interactive controls

The audio is generative and hash-locked - the same hash produces the same visual and musical output. Patterns are extremely long before repeating.

## Usage

```bash
# Open in browser (audio requires HTTPS or localhost)
open index.html

# Or with local server
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Controls

| Control | Action |
|---------|--------|
| **Play button** | Start/stop audio |
| **Footswitch** | Click to toggle pedal on/off |
| **Knobs** | Drag up/down to adjust value |
| **Space** | Play/stop |
| **R** | Regenerate with new hash |
| **S** | Save PNG |

## Features

### Visual Traits (with rarity)

| Trait | Common | Uncommon | Rare | Legendary |
|-------|--------|----------|------|-----------|
| Color | Black/white | Industrial | Dark brass | Colorful vintage |
| Shape | Geometric | Brutalist | Organic | Mixed |
| Knobs | Chicken head, Davies | MXR, Moog | + Backlit | + 7-segment |

### Audio Traits (with rarity)

| Trait | Common | Uncommon | Rare | Legendary |
|-------|--------|----------|------|-----------|
| Sound | Ikeda minimal | Alva Noto | FM + noise | Bytebeat glitch |

### Musical Parameters

All hash-derived:
- Tempo (60-140 BPM)
- Scale (chromatic, pentatonic, whole-tone, diminished, microtonal)
- Root note
- Pattern length
- Rest probability
- Effects (reverb, delay, filter)

## Technical

- **Framework**: Vanilla Canvas 2D + Tone.js
- **Resolution**: 700x700 (responsive)
- **Randomness**: sfc32 PRNG seeded from hash (Art Blocks compatible)

## Inspirations

- [Soma Laboratory Pulsar-23](https://somasynths.com/pulsar-23/) - Organismic drum machine
- [Soma Laboratory Terra](https://somasynths.com/terra/) - Touch synthesizer
- [Ryoji Ikeda - test pattern](https://www.ryojiikeda.com/project/testpattern/) - Data-driven audio-visual
- [Alva Noto](https://alvanoto.com/) - Minimal electronic textures

## Version

v1.0.0

## License

MIT
