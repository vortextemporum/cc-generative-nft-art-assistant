# Benjolin Rungler

A GLSL shader visualization inspired by Rob Hordijk's Benjolin synthesizer and its chaotic Rungler circuit.

![Benjolin Rungler](https://via.placeholder.com/700x350/0d0d14/00ff88?text=Benjolin+Rungler)

## About

The Benjolin is a unique analog synthesizer that creates unpredictable but deterministic patterns through:
- **Two oscillators** that cross-modulate each other
- **A Rungler** - a shift register that samples oscillator states, creating stepped semi-random voltages

This sketch translates these concepts into visual form across four distinct modes:

| Mode | Description |
|------|-------------|
| **Circuit** | PCB-style traces with animated signal flow |
| **Scope** | Oscilloscope Lissajous curves with phosphor glow |
| **Pixel** | Bitcrushed shift register visualization |
| **Hybrid** | All three layers combined |

## Features

- **RGB Synthesis** - Separate channel offsets create chromatic aberration
- **Edge of Chaos** - Patterns emerge and dissolve unpredictably
- **Framebuffer Feedback** - Visual persistence and trail effects
- **Hash-Derived Parameters** - Every mint is unique and deterministic

## Quick Start

```bash
# From the sketch directory
python -m http.server 8000
# Open http://localhost:8000

# Or with Node
npx serve .
```

## Controls

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save PNG |
| Space | Pause/resume |
| 1-4 | Force visual mode |
| L | Like current output |
| D | Dislike current output |

## Technical

- **Framework:** Pure WebGL + GLSL
- **Resolution:** 700x700
- **Dependencies:** None

## Files

```
benjolin-rungler/
├── index.html      # Viewer with dev controls
├── sketch.js       # WebGL setup and features
├── shaders/
│   └── benjolin.frag   # GLSL fragment shader
└── docs/
    ├── FEATURES.md     # Rarity documentation
    └── TECHNICAL.md    # Implementation details
```

## Credits

Inspired by [Rob Hordijk's Benjolin](https://www.youtube.com/watch?v=7w2kxYrlSjI) - a beautiful piece of electronic instrument design.

## License

MIT
