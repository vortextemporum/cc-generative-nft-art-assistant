# /analyze_artwork - Analyze generative art code

Analyze generative art code to identify techniques, patterns, aesthetics, and provide improvement suggestions.

## Arguments

- `$ARGUMENTS` - Path to a sketch file, URL to Art Blocks/fxhash project, or paste code directly

## Process

### 1. Input Detection

Determine the input type:
- **File path**: Read the file directly
- **URL**: Extract project ID and fetch from dataset or web
- **Pasted code**: Analyze directly

### 2. Technical Analysis

Identify and report on:

#### Framework Detection
- p5.js (setup/draw, createCanvas)
- Three.js (Scene, Camera, Renderer)
- Vanilla Canvas (getContext('2d'))
- WebGL/GLSL (gl context, shaders)
- SVG (createElementNS, d3)
- Regl (regl({...}))

#### Randomness Pattern
- Art Blocks style (tokenData.hash → sfc32/mulberry32)
- fxhash style (fxrand(), fxhash string)
- Math.random() (NOT deterministic - flag as issue)
- Custom PRNG implementation

#### Code Patterns Detected
Scan for these patterns and explain each found:

```javascript
const PATTERNS = {
  // Noise & Flow
  "perlin_noise": /noise\s*\(/,
  "simplex_noise": /simplex|snoise/i,
  "flow_field": /flow|field|angle.*noise/i,

  // Geometry
  "voronoi": /voronoi|delaunay/i,
  "l_system": /l-system|lindenmayer|axiom.*rule/i,
  "fractal": /fractal|mandelbrot|julia|recursive.*draw/i,
  "cellular_automata": /cell|automata|conway|neighbor/i,

  // Physics
  "particle_system": /particle|emitter|velocity.*position/i,
  "physics_simulation": /force|gravity|collision|spring/i,
  "flocking": /boid|flock|separation.*alignment.*cohesion/i,

  // Visual
  "color_manipulation": /hsl|hsb|lerp.*color|palette/i,
  "gradients": /gradient|lerp.*fill|colorMode.*HSB/i,
  "blending": /blendMode|globalCompositeOperation/i,

  // Structure
  "grid_based": /grid|rows.*cols|for.*for/,
  "recursion": /function.*\w+\s*\([^)]*\)\s*{[^}]*\1\s*\(/,
  "oop_classes": /class\s+\w+/,

  // Animation
  "easing": /ease|lerp|smooth/i,
  "oscillation": /sin.*time|cos.*frameCount/,

  // Advanced
  "shaders": /gl_Position|gl_FragColor|uniform|varying/,
  "instancing": /instancedMesh|drawInstanced/i,
};
```

#### Complexity Metrics
- Lines of code
- Number of functions/classes
- Nesting depth
- Cyclomatic complexity estimate

### 3. Aesthetic Analysis

Based on code structure and detected patterns:

#### Style Classification
- **Minimal**: Low element count, limited palette, clean shapes
- **Organic**: Noise-based, flowing, natural forms
- **Geometric**: Grid, shapes, mathematical precision
- **Chaotic**: High density, complex layering, entropy
- **Textured**: Stippling, hatching, noise overlays

#### Color Strategy
- Monochrome
- Complementary
- Analogous
- Triadic
- Generative/algorithmic palette

#### Motion Quality (if animated)
- Static
- Slow/meditative
- Energetic
- Chaotic
- Rhythmic/pulsing

### 4. Feature System Analysis

If features/traits are declared:
- List all feature categories
- Calculate rarity distribution
- Identify potential issues (impossible combinations, skewed probabilities)
- Compare to dataset norms

### 5. Performance Analysis

Flag potential issues:
- Nested loops with high iteration counts
- Per-frame allocations (new Array, new Object in draw)
- Unoptimized particle systems
- Missing requestAnimationFrame
- Heavy DOM manipulation
- Large texture/image loading

### 6. Platform Compatibility

Check compatibility with:
- Art Blocks (tokenData.hash, on-chain constraints)
- fxhash (fxrand, $fx.features, fxpreview)
- Standalone (local development)

### 7. Output Report

Generate a structured analysis:

```markdown
## Artwork Analysis: {name}

### Overview
- **Framework**: {detected_framework}
- **Lines of Code**: {loc}
- **Complexity**: {low/medium/high}
- **Platform**: {artblocks/fxhash/standalone}

### Techniques Detected
| Technique | Confidence | Notes |
|-----------|------------|-------|
| {technique} | {high/medium/low} | {details} |

### Aesthetic Profile
- **Style**: {classification}
- **Color**: {strategy}
- **Motion**: {quality}
- **Density**: {sparse/balanced/dense}

### Feature System
{table of features with rarities}

### Strengths
- {strength_1}
- {strength_2}

### Potential Improvements
- {suggestion_1}
- {suggestion_2}

### Similar Projects in Dataset
- {similar_project_1} by {artist} - {similarity_reason}
- {similar_project_2} by {artist} - {similarity_reason}

### Code Quality
- [ ] Deterministic randomness
- [ ] Feature registration
- [ ] Preview trigger
- [ ] Error handling
- [ ] Performance optimized
```

### 8. Follow-up Options

After analysis, offer:
1. **Deep dive**: Explain specific techniques in detail
2. **Refactor**: Suggest code improvements
3. **Extend**: Add new features/variations
4. **Compare**: Find similar projects in dataset
5. **Port**: Convert between platforms (Art Blocks ↔ fxhash)

## Examples

```bash
# Analyze a local sketch
/analyze_artwork sketches/flow-fields/sketch.js

# Analyze by Art Blocks project ID
/analyze_artwork artblocks:78

# Analyze fxhash project
/analyze_artwork fxhash:12345

# Analyze pasted code (just paste after command)
/analyze_artwork
```
