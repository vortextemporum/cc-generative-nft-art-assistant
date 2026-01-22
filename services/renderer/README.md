# Renderer Service

Server-side rendering and visual analysis for generative art sketches using Puppeteer.

## Overview

This service captures screenshots of generative art sketches and analyzes their visual properties. It enables automated testing, thumbnail generation, and quality assessment.

## Files

| File | Description |
|------|-------------|
| `index.js` | Main entry point and CLI |
| `render.js` | Puppeteer-based rendering |
| `analyze.js` | Visual analysis algorithms |

## Usage

### Prerequisites

Install Puppeteer:
```bash
npm install puppeteer
```

### Capture Screenshot

Render a sketch to an image:

```bash
# From project root
npm run render capture sketches/my-sketch output.png

# With custom hash
npm run render capture sketches/my-sketch output.png --hash "0x1234..."

# With custom resolution
npm run render capture sketches/my-sketch output.png --width 1400 --height 1400
```

### Analyze Visual Properties

Get visual analysis of a sketch:

```bash
npm run render analyze sketches/my-sketch
```

Output includes:
- Dominant colors
- Color palette extraction
- Composition analysis
- Complexity metrics

### Generate Variations

Create multiple outputs with different hashes:

```bash
# Generate 6 variations
npm run render variations sketches/my-sketch 6

# Generate 20 variations for feature testing
npm run render variations sketches/my-sketch 20 --output renders/
```

### Programmatic Usage

```javascript
const { capture, analyze, variations } = require('./services/renderer');

// Capture single screenshot
await capture('sketches/flow-field', 'output.png', {
  width: 700,
  height: 700,
  hash: '0x1234...'
});

// Analyze visual properties
const analysis = await analyze('sketches/flow-field');
console.log(analysis.dominantColors);
console.log(analysis.complexity);

// Generate variations
await variations('sketches/flow-field', 10, 'renders/');
```

## Architecture

```
┌─────────────────┐
│  Sketch Files   │
│  (HTML + JS)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Puppeteer    │  Launch headless browser
│   (Chromium)    │
└────────┬────────┘
         │
         ├──────────────────┐
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│    Capture      │  │    Analyze      │
│  (Screenshot)   │  │  (Pixel data)   │
└─────────────────┘  └─────────────────┘
```

## Commands

| Command | Description |
|---------|-------------|
| `capture <sketch> <output>` | Render sketch to PNG |
| `analyze <sketch>` | Visual analysis report |
| `variations <sketch> <count>` | Generate multiple renders |
| `batch <sketches-dir>` | Process multiple sketches |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `--width` | 700 | Canvas width |
| `--height` | 700 | Canvas height |
| `--hash` | random | Specific hash to use |
| `--delay` | 2000 | Wait time before capture (ms) |
| `--output` | current dir | Output directory |
| `--quality` | 90 | PNG quality (1-100) |

## Visual Analysis

The `analyze` command extracts:

### Color Analysis
- **Dominant colors**: Top 5 colors by area
- **Palette type**: Monochrome, complementary, analogous, etc.
- **Color count**: Unique colors detected
- **Saturation**: Average and range

### Composition
- **Balance**: Weight distribution (centered, asymmetric)
- **Density**: Fill percentage
- **Focal points**: Areas of visual interest
- **Edge activity**: Complexity at canvas edges

### Complexity Metrics
- **Structural complexity**: Based on edge detection
- **Color complexity**: Based on color variation
- **Pattern repetition**: Detected repeating elements

## Output Formats

### Screenshot (PNG)
High-quality PNG with transparency support.

### Analysis (JSON)
```json
{
  "dominantColors": ["#1a1a1a", "#f5f5f5", "#3498db"],
  "colorCount": 1247,
  "palette": "complementary",
  "complexity": 0.73,
  "density": 0.45,
  "balance": "centered"
}
```

## Performance

- **Single capture**: ~2-3 seconds
- **Analysis**: ~1 second additional
- **Batch (10 variations)**: ~25 seconds

## GPU Acceleration

For GPU-accelerated rendering (faster, smoother):

```bash
# macOS
puppeteer.launch({ headless: 'new', args: ['--enable-gpu'] });

# Linux with NVIDIA
puppeteer.launch({ args: ['--enable-gpu', '--use-gl=egl'] });
```

## Troubleshooting

### "Browser not found"
```bash
npx puppeteer browsers install chrome
```

### "Timeout waiting for render"
Increase delay:
```bash
npm run render capture sketch output.png --delay 5000
```

### "Black screenshot"
Ensure sketch calls `fxpreview()` or equivalent:
```javascript
function draw() {
  // ... render code
  if (frameCount === 1) fxpreview();
}
```

### "WebGL not supported"
Enable WebGL in Puppeteer:
```javascript
puppeteer.launch({
  args: ['--enable-webgl', '--ignore-gpu-blocklist']
});
```

## Integration with Agents

The `visual-reviewer` agent uses this service:

```bash
# Generate test renders
npm run render variations sketches/my-sketch 20

# Review outputs
# Agent analyzes renders in renders/ folder
```
