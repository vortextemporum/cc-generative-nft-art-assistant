# Generative Art Knowledge Base

> Auto-generated from Art Blocks + fxhash datasets (28,338 projects, 5,040 artists)

## Platform Statistics

### Overview
- **Art Blocks (Ethereum)**: 908 projects by 447 artists
- **fxhash (Tezos)**: 27,430 projects by 4,593 artists
- **Total**: 28,338 projects with 27,966 having scripts

### Script Technologies
- **p5js**: 9,407 projects (33%)
- **unknown/custom**: 17,028 projects (60%)
- **threejs**: 814 projects
- **svg**: 460 projects
- **webgl**: 288 projects
- **js**: 253 projects
- **regl**: 30 projects

### Common Aesthetic Themes
- generative (12,033 projects)
- line (6,389 projects)
- abstract (6,040 projects)
- particle (4,627 projects)
- palette (3,370 projects)
- 2d (3,253 projects)
- noise (3,208 projects)
- pattern (3,076 projects)
- composition (2,656 projects)
- circle (2,604 projects)
- 3d (2,384 projects)
- grid (2,127 projects)
- geometric (1,777 projects)
- minimalist (1,574 projects)
- gradient (1,513 projects)

### Technical Patterns Detected
- hash_derivation: 27,952 projects
- fxhash_derivation: 27,052 projects
- value_mapping: 26,202 projects
- math_functions: 4,943 projects
- color_manipulation: 4,381 projects
- nested_loops: 4,344 projects
- randomness: 3,653 projects
- fx_features: 2,917 projects
- transformations: 1,729 projects
- animation: 1,676 projects
- trigonometry: 1,405 projects
- vectors: 1,087 projects

### Popular Tags (fxhash)
- generative (6,047)
- p5js (5,043)
- abstract (4,333)
- art (3,604)
- color (1,707)
- generativeart (1,475)
- colors (1,452)
- colorful (1,312)
- noise (1,103)
- animation (1,058)

## Notable Projects

### Art Blocks
| Project | Artist | Type | Editions |
|---------|--------|------|----------|
| Friendship Bracelets | Alexis Andre | js | 38,965 |
| Chromie Squiggle | Snowfro | p5js | 10,000 |
| Trademark | Jack Butcher | p5js | 10,000 |
| send/receive | Snowfro | custom | 8,968 |
| Flowers | RVig | p5js | 6,158 |
| Fidenza | Tyler Hobbs | p5js | 999 |
| Ringers | Dmitri Cherniak | p5js | 1,000 |
| Archetype | Kjetil Golid | p5js | 600 |

### fxhash
| Project | Artist | Editions |
|---------|--------|----------|
| GEN XYZ Das Occult | GEN XYZ | 10,000 |
| Unicorn | Unknown | 10,000 |
| Annum | Landlines Art | 8,710 |
| fx_doughs | Butternut Deluxe | 8,008 |
| Mooncakes | Mooncakes | 4,647 |
| SynDevice | Synreal Labs | 3,366 |
| FX_D3M0NS | PIXELBUDDYJAM | 3,333 |

## Key Techniques

### p5.js Structure
p5.js projects typically have setup() for initialization and draw() for rendering. Use createCanvas(), background(), fill(), stroke(), rect(), ellipse(), line(), etc.

### Three.js Structure
Three.js projects create a Scene, Camera, Renderer, and add Meshes with Geometries and Materials. Use requestAnimationFrame for animation.

### Feature Declaration
Art Blocks: tokenData.features object. fxhash: $fx.features({ name: value }) call (once, after page load). Features determine rarity and visual properties.

### fxhash Specifics
fxhash is multichain (Tezos + Ethereum + Base). Projects stored on IPFS or ONCHFS (on-chain file system). Use `$fx.rand()` for randomness (SFC32 seeded from Base58 hash). Call `$fx.preview()` when ready for thumbnail capture. `$fx.params([])` enables collector customization. SDK: `@fxhash/project-sdk`. CLI: `npx fxhash create/dev/build`. See `.claude/expertise/fxhash-platform.md` for complete reference.

### Spectral Color Mixing
Physically-based color mixing using spectral reflectance curves instead of RGB blending. Produces realistic pigment behavior (blue + yellow = green, not gray). Implemented via WebGL shaders. Used in projects like Hatches for watercolor blending effects.

## Generative Art Capabilities

When helping with generative art:
1. **Analyze Code**: Explain what code does visually and technically
2. **Generate Code**: Write scripts in p5.js, Three.js, or vanilla JS
3. **Explain Techniques**: Teach noise, fractals, particle systems, etc.
4. **Debug**: Fix issues in generative art code
5. **Platform Integration**: Implement deterministic randomness for Art Blocks (tokenData.hash) or fxhash (fxrand)
6. **Feature Systems**: Design rarity/trait systems using platform-specific feature declarations

Use correct terminology (vertices, transforms, noise, etc.) and reference Art Blocks or fxhash projects when helpful.
