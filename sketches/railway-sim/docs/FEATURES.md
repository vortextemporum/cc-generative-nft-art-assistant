# Railway Sim - Features & Rarity

## Rarity Tiers

| Tier | Probability | Color |
|------|-------------|-------|
| Common | ~50% | Gray |
| Uncommon | ~28% | Green |
| Rare | ~15% | Blue |
| Legendary | ~7% | Gold |

## Train Types

| Type | Speed | Acceleration | Rarity | Visual |
|------|-------|--------------|--------|--------|
| Diesel | 2.5 | 0.08 | Common (30%) | Standard rectangular |
| Freight | 1.8 | 0.04 | Common (20%) | With cargo boxes |
| Electric | 3.5 | 0.12 | Uncommon (28%) | Pantograph on top |
| Steam | 2.0 | 0.05 | Rare (15%) | Smokestack with puffs |
| Bullet | 5.0 | 0.15 | Legendary (7%) | Aerodynamic nose cones |

## Environments

| Environment | Trees | Buildings | Special | Rarity |
|-------------|-------|-----------|---------|--------|
| Rural | Yes | No | Open fields | Common |
| Urban | No | Yes | City blocks | Common |
| Industrial | No | Yes | Factories with smoke | Uncommon |
| Coastal | Yes | Yes | Water areas | Rare |
| Mountain | Yes | No | Snow-capped peaks | Legendary |

## Network Complexity

| Level | Nodes | Branch Prob | Loop Prob | Rarity |
|-------|-------|-------------|-----------|--------|
| Simple | 6-10 | 20% | 15% | Common (30%) |
| Moderate | 10-14 | 35% | 25% | Uncommon (35%) |
| Complex | 14-18 | 50% | 35% | Rare (25%) |
| Intricate | 18-24 | 70% | 50% | Legendary (10%) |

## Weather Effects

| Effect | Probability | Visual |
|--------|-------------|--------|
| Clear | 50% | No overlay |
| Rain | ~17% | Diagonal streaks |
| Fog | ~17% | Translucent clouds |
| Night | ~17% | Dark overlay with stars |

## Color Palettes

Each hash generates a unique palette:
- **Base hue**: Random 0-360
- **Background**: Muted HSB derived from base
- **Track bed**: Dark neutral
- **Line colors**: 3-6 colors evenly distributed around color wheel from base

## Stations

- **Probability**: 80% chance of having stations
- **Count**: 3-8 stations when present
- **Placement**: Random node selection
- **Names**: Random from predefined list

## Signals

- **Probability**: 60% chance of having signals
- **Placement**: 40% of tracks have signals
- **State**: 80% green, 20% red (decorative only)

## Hash Derivation

All features are deterministically derived from the 64-character hex hash using sfc32 PRNG:

1. Hash parsed into 4 seed values (8 hex chars each)
2. sfc32 initialized with seeds
3. Features generated in fixed order
4. Same hash always produces identical network

## Feature Combination Examples

**Common Setup** (~25% of generations):
- Rural or Urban environment
- Simple network (6-10 nodes)
- 2-3 diesel/freight trains
- Clear weather

**Rare Setup** (~5% of generations):
- Coastal environment
- Complex network (14-18 nodes)
- Mix including steam train
- Fog or rain weather

**Legendary Setup** (<1% of generations):
- Mountain environment
- Intricate network (18-24 nodes)
- Bullet train present
- Night weather
