# Micro-Cosmos

A multi-scale microscopic ecosystem simulation - observe life at the cellular and molecular level through an interactive digital microscope.

## Concept

Micro-Cosmos simulates a living habitat of microorganisms, from bacteria colonies visible at low magnification down to individual proteins at the molecular scale. The simulation features realistic organism behaviors, predator-prey dynamics, and adaptive visual styles that shift based on your zoom level - mimicking different microscopy techniques used in real laboratories.

## Features

### Multi-Scale Zoom System
- **Macro (10x-100x)**: Bacterial colonies, amoebae, paramecia, diatoms
- **Cellular (100x-1000x)**: Individual cells with visible organelles
- **Organelle (1000x-10000x)**: Mitochondria, endoplasmic reticulum, nucleus internals
- **Molecular (10000x+)**: Proteins, DNA helices, amino acids

### Living Organisms
- **Bacteria** - Multiple shapes (rod, cocci, spiral, vibrio) with flagella motion
- **Amoebae** - Active predators with pseudopod extension and phagocytosis
- **Paramecia** - Cilia-driven swimming with realistic wave patterns
- **Diatoms** - Beautiful geometric silica shells
- **Viruses** - Various types including bacteriophages and corona-like particles
- **Eukaryotic Cells** - Complete with nucleus, mitochondria, ER, and Golgi
- **Rotifers** - Complex organisms with rotating wheel organs

### Ecosystem Dynamics
- Predator-prey interactions (amoebae hunting bacteria)
- Viral attachment and infection mechanics
- Population dynamics with natural respawning
- Brownian motion and chemotaxis

### Adaptive Microscopy Styles
- **Phase Contrast** - Classic gray-green lab aesthetic at low magnification
- **Fluorescence** - Dramatic glowing colors at cellular level
- **Dark Field** - High contrast bright-on-black at organelle scale
- **Electron Microscopy** - Grayscale detail at molecular level

## Controls

| Input | Action |
|-------|--------|
| Mouse Wheel | Zoom in/out continuously |
| Click + Drag | Pan the view |
| **R** | Regenerate with new random seed |
| **S** | Save current view as PNG |
| **Space** | Pause/resume simulation |
| **1** | Jump to 10x zoom (macro) |
| **2** | Jump to 50x zoom (cellular) |
| **3** | Jump to 200x zoom (organelle) |
| **4** | Jump to 600x zoom (molecular) |

## Generative Features

Each generation (hash) produces unique:
- **Ecosystem Type**: Pond, blood, soil, or marine environment
- **Activity Level**: Dormant, normal, active, or hyperactive
- **Dominant Species**: Bacteria, amoeba, algae, or mixed
- **Rarity Tier**: Common, uncommon, rare, or legendary
- **Special Organisms**: Rare generations may contain tardigrades or giant amoebae

## Technical Details

- **Framework**: Three.js with WebGL rendering
- **Randomness**: sfc32 PRNG seeded from hash for determinism
- **Performance**: LOD system hides/shows detail based on zoom
- **Compatibility**: Works on desktop and mobile (touch zoom/pan)

## Running

Simply open `index.html` in a modern browser. No build step required.

```bash
open index.html
```

## Version

1.0.0 - Initial release

## License

Creative Commons Attribution 4.0 International (CC BY 4.0)
