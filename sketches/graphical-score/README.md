# Graphical Score

A generative graphical score inspired by György Ligeti and Iannis Xenakis, producing semi-performable manuscripts with archival aesthetics.

## Concept

This piece generates unique graphical scores that blend:

- **Ligeti's micropolyphony** - Dense clusters of marks, pointillist textures, cloud-like masses
- **Xenakis's architectural approach** - Ruled lines (glissandi), geometric shapes, mathematical structures

Each generation creates a score that could theoretically be interpreted by musicians, with clear time flow (left to right) and vertical pitch space, while maintaining the aesthetic freedom of graphic notation.

## Visual Language

### Elements

- **Ruled Lines** - Straight and curved paths suggesting pitch trajectories
- **Density Clouds** - Clusters of small marks creating textural masses
- **Pointillist Dots** - Individual note events with various shapes
- **Geometric Forms** - Triangles, arcs, polygons suggesting sustained sounds or envelopes

### Palettes

All outputs use muted archival tones evoking aged manuscripts:
- Sepia (warm browns on cream)
- Manuscript (black ink on aged white)
- Parchment (earth tones)
- Blueprint (faded technical blue)

## Features & Rarity

| Feature | Common | Uncommon | Rare | Legendary |
|---------|--------|----------|------|-----------|
| **Style** | Hybrid | Ligeti-leaning | Xenakis-leaning | Pure style |
| **Voices** | 3-5 (ensemble) | 6-8 (chamber) | 1-2 (solo) | 9-12 (orchestra) |
| **Structure** | Flowing | Sectioned | Mathematical | Palindrome |
| **Density** | Balanced | Dense | Sparse | Extreme |
| **Contrast** | Moderate | High | Low | Extreme swings |

### Special Features

- **Palindrome Structure** - Score mirrors itself around center axis
- **Pure Ligeti/Xenakis** - Exclusively uses one composer's visual vocabulary
- **Extreme Density** - Either very sparse or overwhelmingly dense

## Controls

| Key | Action |
|-----|--------|
| R | Regenerate with new hash |
| S | Save as PNG |
| L | Like (stores in localStorage) |
| D | Dislike (stores in localStorage) |

## Technical

- **Framework:** p5.js
- **Resolution:** 1280x720 (16:9)
- **Randomness:** Hash-based sfc32 PRNG (Art Blocks compatible)

## Running

Open `index.html` in a browser, or for best results:

```bash
python -m http.server 8000
# Visit http://localhost:8000
```

## Version

1.0.0 - Initial release

## Inspiration

- György Ligeti - *Artikulation*, *Volumina*, micropolyphonic techniques
- Iannis Xenakis - *Metastaseis*, *Mycenae Alpha*, UPIC system, stochastic music
- The tradition of graphic notation in 20th century avant-garde music
