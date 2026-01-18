# Stick Arena

Hash-based generative stick figure combat with parallax pixel art environments.

## Preview

Each unique hash generates a different battle with varying:
- Fighter count (2-4 fighters, or rare solo training)
- Arena environment (dojo, street, nature, simulation, chip, program, desktop)
- Fight intensity and choreography style
- Interactive objects (crates, barrels, platforms)
- Special effects (trails, impacts, auras)

## Features

### Combat System
- Smooth skeletal animation with inverse kinematics
- Queue-based move choreography
- AI-driven fight decisions based on distance and opponent state
- Health bars with damage states
- Blocking and invincibility frames
- Victory poses and freeze frames

### Environments
| Arena | Rarity | Description |
|-------|--------|-------------|
| Dojo | Common | Traditional wooden dojo with lanterns |
| Street | Uncommon | Urban alley with neon signs |
| Nature | Uncommon | Outdoor with mountains and trees |
| Simulation | Rare | Matrix-style digital grid |
| Computer Chip | Rare | Microscopic circuit board |
| Inside Program | Legendary | Abstract code environment |
| OS Desktop | Legendary | Meta desktop with windows |

### Fighter Modes
- **2-Way Battle** (60%): Classic 1v1 combat
- **3-Way Battle** (25%): Three-way free-for-all
- **4-Way Battle** (12%): Four fighters chaos
- **Solo Training** (3%): Single fighter kata practice

### Moves
**Attacks**: punch, kick, uppercut, roundhouse, flying_kick, aerial_kick, combo
**Movement**: walk, dash, jump, jump_forward, dodge_back, dodge_roll
**Defense**: block
**Acrobatics**: flip, kata (training only)

### Interactive Objects
- **Crate**: Climbable, breakable wooden crate
- **Barrel**: Rollable barrel
- **Platform**: Elevated standing platform

## Running Locally

```bash
# Simple
open index.html

# Recommended (with local server)
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Controls

| Key/Button | Action |
|------------|--------|
| **New Fight** | Generate new random battle |
| **Save** | Download current frame |
| `R` | Regenerate with new hash |
| `S` | Save image |

## Rarity System

| Tier | Probability | Examples |
|------|-------------|----------|
| Common | ~55-60% | Dojo, 2 fighters, normal intensity |
| Uncommon | ~25-30% | Street/nature, 3 fighters, fast |
| Rare | ~10-15% | Simulation/chip, 4 fighters, intense |
| Legendary | ~3-5% | Desktop/program, solo training, chaos |

## Technical Details

- **Framework**: p5.js 1.9.0
- **Canvas**: 700x700px (responsive)
- **Animation**: 60fps with pose interpolation
- **PRNG**: sfc32 seeded from hash

## Version

Current: **v1.0.0**

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT
