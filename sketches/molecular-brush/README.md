# Molecular Brush

A generative art piece combining molecular physics simulation with p5.brush's natural watercolor rendering.

## Overview

Molecules move according to various physics modes (molecular forces, flocking, vortex, etc.) while leaving trails rendered with authentic watercolor brushes, bleed effects, and optional hatching patterns.

## Features

- **Hash-based determinism**: Same hash = same artwork (Art Blocks compatible)
- **8 Physics modes**: Molecular, Brownian, Flocking, Waves, Orbital, Magnetic, Vortex, Explosion
- **10+ Brush types**: Pencil, pen, marker, spray, charcoal, and more
- **Watercolor effects**: Bleed, texture, pigment settling
- **Hatching system**: Optional cross-hatch patterns
- **7 Color palettes**: Watercolor, Ocean, Autumn, Forest, Sunset, Monochrome, Neon
- **Rarity system**: Common, Uncommon, Rare, Legendary traits

## Quick Start

```bash
# Open directly (may have CORS issues)
open index.html

# Better: use local server
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Controls

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save as PNG |

## Dependencies

- [p5.js](https://p5js.org/) v1.11.0+
- [p5.brush](https://github.com/acamposuribe/p5.brush) v1.1.2

Both loaded via CDN in index.html.

## Art Blocks Deployment

This sketch is compatible with Art Blocks. To deploy:

1. Minify sketch.js
2. The sketch will automatically use `tokenData.hash` when available
3. Test thoroughly with different hash values

## Credits

- Physics simulation based on [molecular-watercolor](../molecular-watercolor/)
- Watercolor rendering powered by [p5.brush](https://github.com/acamposuribe/p5.brush) by Alejandro Campos Uribe

## License

MIT
