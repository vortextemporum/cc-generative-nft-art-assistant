# Railway Sim

An interactive top-down railway simulation with procedural track networks, multiple train types, and stylized illustrated aesthetic.

## Features

- **Procedural Networks** - Each hash generates unique track layouts combining metro-style colored lines, branching paths, and loop connections
- **Multiple Train Types** - Steam, diesel, electric, bullet, and freight trains with different speeds and rarities
- **Full Interactivity** - Drive trains with keyboard, click switches to change routes, dispatch new trains
- **Environment Variety** - Urban, rural, coastal, mountain, and industrial settings with appropriate scenery
- **Weather Effects** - Clear, rain, fog, or night conditions
- **Collision System** - Trains crash with visual effect and reset

## Controls

### Train Driving
| Key | Action |
|-----|--------|
| W / ↑ | Accelerate |
| S / ↓ | Brake / Reverse |
| A / ← | Change direction (left) |
| D / → | Change direction (right) |

### General
| Key | Action |
|-----|--------|
| Click train | Select train to drive |
| Click switch | Toggle junction direction |
| N | Dispatch new train |
| X | Remove selected train |
| Space | Pause / Resume |
| R | Regenerate network |
| S | Save PNG |

## Train Types

| Type | Speed | Rarity |
|------|-------|--------|
| Diesel | Medium | Common |
| Freight | Slow | Common |
| Electric | Fast | Uncommon |
| Steam | Slow | Rare |
| Bullet | Very Fast | Legendary |

## Environments

- **Urban** (Common) - Buildings, no trees
- **Rural** (Common) - Trees, open landscape
- **Industrial** (Uncommon) - Factories with smoke
- **Coastal** (Rare) - Water areas, mixed scenery
- **Mountain** (Legendary) - Snow-capped peaks

## How It Works

1. The hash determines all random values for the network
2. Nodes are placed using relaxation for even spacing
3. Minimum spanning tree ensures connectivity
4. Additional edges create loops and complexity
5. Trains follow tracks and transition at nodes
6. Switches determine which exit a train takes

## Technical

- Built with p5.js
- 700x700 canvas
- Hash-based sfc32 PRNG for determinism
- HSB color mode throughout

## Version

1.0.0 - Initial release
