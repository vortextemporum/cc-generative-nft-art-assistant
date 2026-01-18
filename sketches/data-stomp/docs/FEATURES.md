# data-stomp Features & Rarity

## Overview

All features are deterministically derived from the 64-character hex hash. The same hash always produces identical visual and audio output.

## Visual Features

### Color Scheme

| Value | Rarity | Probability | Description |
|-------|--------|-------------|-------------|
| black-white | Common | 40% | Stark monochrome, Ikeda test pattern aesthetic |
| industrial | Uncommon | 30% | Gray/steel tones with green LED accents |
| dark-brass | Rare | 20% | Warm Soma Terra inspired brass on dark wood |
| colorful-vintage | Legendary | 10% | Classic pedal colors - orange, green, blue |

### Enclosure Shape

| Value | Rarity | Probability | Description |
|-------|--------|-------------|-------------|
| geometric | Common | 35% | Clean polygons (triangles to octagons) with skew |
| brutalist | Uncommon | 30% | Chunky asymmetric blocks, Soviet synth aesthetic |
| organic | Rare | 25% | Blob shapes like Soma Terra's wood slab |
| mixed | Legendary | 10% | Each pedal gets a different random shape type |

### Pedal Count

| Value | Probability | Description |
|-------|-------------|-------------|
| 1 | 30% | Single large complex pedal (like Pulsar-23) |
| 2 | 40% | Pair of pedals |
| 3 | 30% | Trio arrangement |

### Knob Set

| Value | Rarity | Probability | Types Included |
|-------|--------|-------------|----------------|
| vintage-basic | Common | 50% | chicken-head, davies-skirted |
| vintage-pro | Uncommon | 25% | mxr-hex, moog-bakelite |
| hybrid-led | Rare | 15% | davies-skirted, moog-bakelite, backlit-ring |
| digital-deluxe | Legendary | 10% | backlit-ring, 7-segment, moog-bakelite |

### Knob Types Detail

| Type | Style | Visual |
|------|-------|--------|
| chicken-head | Pointer triangle | Classic amp knob |
| davies-skirted | Skirted with pointer | British console style |
| mxr-hex | Hexagonal with line | MXR pedal style |
| moog-bakelite | Notch dot indicator | Vintage Moog |
| backlit-ring | LED segment ring | Modern LED encoder |
| 7-segment | Digital display | Shows numeric value |

## Audio Features

### Sound Character

| Value | Rarity | Probability | Description |
|-------|--------|-------------|-------------|
| ikeda-minimal | Common | 30% | Pure sine tones with silence, stark and sparse |
| alva-noto | Uncommon | 30% | Micro-clicks, pops, granular textures |
| fm-noise | Rare | 25% | FM bell tones mixed with pink noise bursts |
| bytebeat-glitch | Legendary | 15% | Crunchy bitcrushed squares, 8-bit formulas |

### Voice Configuration by Sound Character

**ikeda-minimal:**
- Pure sine oscillator (volume: -12dB)
- White noise synth (attack: 1ms, decay: 50ms)
- Effects: slight reverb or none

**alva-noto:**
- Membrane synth for clicks (pitch decay: 10ms)
- Micro-tone sine synth (decay: 100ms)
- Effects: light bitcrush, delay

**bytebeat-glitch:**
- Square wave through BitCrusher (4-bit)
- Brown noise synth
- Effects: heavy bitcrush, distortion

**fm-noise:**
- FM synth (harmonicity: 3, mod index: 10)
- Pink noise synth
- Effects: filter sweep, reverb

### Tempo

| Range | Description |
|-------|-------------|
| 60-72 BPM | Slow, meditative |
| 80-100 BPM | Moderate |
| 110-140 BPM | Energetic |

Values: 60, 72, 80, 90, 100, 110, 120, 140 (equal probability)

### Scale Type

| Value | Intervals | Probability |
|-------|-----------|-------------|
| chromatic | All 12 semitones | 20% |
| pentatonic | 0,2,4,7,9 | 20% |
| whole-tone | 0,2,4,6,8,10 | 20% |
| diminished | 0,2,3,5,6,8,9,11 | 20% |
| microtonal | 0,1,3,4,6,7,9,10 | 20% |

### Root Note

All 12 notes equally probable: C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B

### Octave Range

| Value | Description |
|-------|-------------|
| [2, 4] | Low-mid range |
| [3, 5] | Mid range |
| [1, 6] | Full range |
| [4, 7] | High range |

### Pattern Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| patternLength | 8-64 | Base pattern (x64 for total) |
| restProbability | 0.1-0.5 | Chance of silence |
| accentProbability | 0.1-0.3 | Chance of loud note |

### Effects

| Parameter | Range | Description |
|-----------|-------|-------------|
| reverbAmount | 0-0.4 | Wet mix |
| delayTime | 0, 8n, 8n., 4n, 16n | Feedback delay |
| filterFreq | 200-8000 Hz | Lowpass cutoff |

## Rarity Calculations

### Probability of Specific Combinations

**Legendary pedal (all legendary traits):**
- Color (legendary) × Shape (legendary) × Knobs (legendary) × Sound (legendary)
- 0.10 × 0.10 × 0.10 × 0.15 = 0.000015 = 0.0015%

**Fully common pedal:**
- 0.40 × 0.35 × 0.50 × 0.30 = 0.021 = 2.1%

**At least one legendary trait:**
- 1 - (0.90 × 0.90 × 0.90 × 0.85) = 1 - 0.6199 = 38.01%

## Display Features

### Oscilloscope

- Present on 60% of pedals
- Shows real-time waveform when playing
- Simulated sine wave when stopped
- Green phosphor aesthetic

### 7-Segment Display

- Only appears with legendary knob set (10% × 50% = 5%)
- Shows current tempo value
- Red/amber LED color

### LED Count

- 2-5 LEDs per pedal
- Primary color from color scheme
- 30% chance of alternate color (red or green)
- Blink pattern synced to playback
