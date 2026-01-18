# data-stomp Technical Documentation

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                         index.html                              │
│  - Loads Tone.js from CDN                                       │
│  - Contains canvas element                                      │
│  - Button event listeners                                       │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                          sketch.js                              │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   PRNG System    │  │  Feature Gen     │  │  Audio Init  │  │
│  │   (sfc32)        │──▶│  (generateFeat.) │──▶│  (Tone.js)   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│           │                     │                    │          │
│           ▼                     ▼                    ▼          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Pedal Builder   │  │  Canvas Render   │  │  Sequencer   │  │
│  │  (buildPedals)   │  │  (render loop)   │  │  (Tone.Loop) │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Interaction Layer                      │  │
│  │   mousedown/move/up  touchstart/move/end  keydown        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## PRNG Implementation

Uses sfc32 (Simple Fast Counter) algorithm for high-quality deterministic randomness:

```javascript
function sfc32(a, b, c, d) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
```

Seeded from hash by parsing 4 groups of 8 hex characters as 32-bit integers.

## Shape Generation Algorithms

### Organic (Blob) Shapes

1. Generate N points (6-12) around center
2. For each point, calculate radius with sinusoidal variation:
   ```javascript
   radiusX = baseRadius * (0.85 + sin(angle * 3 + hashOffset) * blobiness * 0.3)
   ```
3. Connect points with bezier curves using Catmull-Rom interpolation

### Geometric Shapes

1. Standard polygon with N sides (3-8)
2. Apply skew transform: `scale(1 + skew, 1 - skew * 0.5)`
3. Apply rotation offset

### Brutalist Shapes

1. Start with rectangle
2. Offset each vertex by hash-derived amount
3. Creates irregular quadrilateral with chunky feel

## Canvas Rendering Pipeline

### Per-Frame (60fps target)

1. **Clear** - Fill with background color
2. **Pedalboard** - Draw textured background + corner screws
3. **For each pedal:**
   - Draw enclosure shape with gradient fill
   - Draw edge highlight stroke
   - Draw pedal name text
   - Draw all knobs (with hover states)
   - Draw all LEDs (with on/off states)
   - Draw scope display (if present)
   - Draw 7-segment display (if present)
   - Draw footswitch
4. **Cables** - Draw decorative patch cables between pedals
5. **Request next frame**

### Knob Rendering

Each knob type has distinct visual:

```javascript
KNOB_TYPES = {
  'chicken-head': { style: 'pointer', size: 1.0 },    // Triangle indicator
  'davies-skirted': { style: 'skirted', size: 1.2 },  // Larger with pointer
  'mxr-hex': { style: 'hex', size: 0.9 },             // Line indicator
  'moog-bakelite': { style: 'bakelite', size: 1.1 },  // Dot indicator
  'backlit-ring': { style: 'led-ring', size: 1.0 },   // LED segments
  '7-segment': { style: 'digital', size: 0.8 }        // Numeric display
}
```

Indicator angle calculated from value (0-1) mapped to -135° to +135° range.

## Audio Engine (Tone.js)

### Signal Chain

```
Voices (Oscillator/Synth/Noise)
    │
    ▼
Filter (Lowpass, 200-8000 Hz)
    │
    ▼
Analyser (Waveform, 128 samples)
    │
    ▼
FeedbackDelay (variable time, 20% feedback)
    │
    ▼
Reverb (2s decay, variable wet)
    │
    ▼
Master Gain (0.7)
    │
    ▼
Destination (speakers)
```

### Voice Configurations

**ikeda-minimal:**
```javascript
sine = new Tone.Oscillator({ type: 'sine', volume: -12 })
noise = new Tone.NoiseSynth({
  noise: { type: 'white' },
  envelope: { attack: 0.001, decay: 0.05, sustain: 0 }
})
```

**alva-noto:**
```javascript
click = new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 2 })
micro = new Tone.Synth({ oscillator: { type: 'sine' } })
```

**bytebeat-glitch:**
```javascript
bitcrusher = new Tone.BitCrusher(4)  // 4-bit crush
square = new Tone.Synth({ oscillator: { type: 'square' } })
glitch = new Tone.NoiseSynth({ noise: { type: 'brown' } })
```

**fm-noise:**
```javascript
fm = new Tone.FMSynth({ harmonicity: 3, modulationIndex: 10 })
noise = new Tone.NoiseSynth({ noise: { type: 'pink' } })
```

### Pattern Generation

Pattern is generated deterministically from hash:

```javascript
function generatePattern() {
  const patternR = initRandom(hash);  // Fresh PRNG instance
  const pattern = [];
  const totalSteps = features.patternLength * 64;  // 512-4096 steps

  for (let i = 0; i < totalSteps; i++) {
    if (patternR() < features.restProbability) {
      pattern.push({ note: null });  // Rest
    } else {
      pattern.push({
        note: notes[randomIndex],
        voice: voiceTypes[randomIndex],
        duration: ['32n', '16n', '8n'][random],
        velocity: isAccent ? 0.9 : 0.5 + random * 0.3
      });
    }
  }
  return pattern;
}
```

### Sequencer

Uses Tone.Loop at 16th note resolution:

```javascript
const seq = new Tone.Loop((time) => {
  const step = pattern[stepIndex % pattern.length];
  if (step.note) {
    voice.synth.triggerAttackRelease(step.note, step.duration, time, step.velocity);
  }
  stepIndex++;
}, '16n');
```

## Interaction System

### Mouse Events

- **mousedown**: Check hit on footswitches and knobs
- **mousemove**: Update drag position, calculate hover states
- **mouseup**: Release drag

### Knob Dragging

```javascript
// Delta from drag start Y position
const delta = (startY - currentY) / 150;
knob.value = clamp(startValue + delta, 0, 1);
```

Vertical drag maps to value change with 150px = full range.

### Hit Detection

Circular hit test for knobs and footswitches:
```javascript
if (Math.hypot(mouseX - elementX, mouseY - elementY) < radius) {
  // Hit!
}
```

## Performance Considerations

1. **Canvas operations minimized** - Single draw call per shape
2. **No DOM manipulation in render loop** - All visual via Canvas API
3. **Scope data throttled** - Updated at 20Hz, not every frame
4. **Gradient caching** - Gradients created once, not per-frame
5. **Audio scheduling** - Tone.js handles timing, not main thread

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may need user gesture for audio)
- **Mobile**: Touch events supported, audio may require tap to start

## Memory Usage

- **Canvas**: ~2MB (700x700 RGBA)
- **Audio buffers**: ~1MB (Tone.js internal)
- **Pattern array**: ~100KB (4096 steps × ~25 bytes)
- **Total**: ~3-4MB typical

## Known Issues

1. **Audio context suspension**: Browser may suspend audio context, requiring user interaction to resume
2. **Scope jitter**: Waveform display may show slight jitter due to requestAnimationFrame timing
3. **High DPI**: Canvas not scaled for retina displays (intentional for performance)
