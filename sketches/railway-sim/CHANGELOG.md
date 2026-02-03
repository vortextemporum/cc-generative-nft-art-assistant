# Changelog

All notable changes to Railway Sim will be documented in this file.

## [1.0.0] - 2026-02-03

### Added

**Core Simulation**
- Procedural track network generation with relaxation-based node placement
- Minimum spanning tree connectivity with configurable loop probability
- Multi-line support with distinct colors per line

**Train System**
- 5 train types: diesel, electric, steam, bullet, freight
- Arcade-style physics with configurable speed/acceleration per type
- Track following with automatic junction transitions
- Collision detection with crash effects and auto-reset

**Interactivity**
- Full keyboard controls for driving selected train (WASD/Arrows)
- Click to select trains
- Click switches to toggle junction direction
- Dispatch new trains (N key)
- Remove selected train (X key)
- Pause/resume simulation (Space)
- Regenerate network (R)
- Save PNG (S)

**Environment System**
- 5 environment types: urban, rural, coastal, mountain, industrial
- Scenery elements: trees, buildings, factories, mountains, water
- Weather effects: clear, rain, fog, night

**Visual Features**
- Hash-derived color palettes
- Stylized illustrated aesthetic
- Station indicators with names
- Switch direction arrows
- Signal posts (decorative)
- Train type-specific details (smoke, pantographs, cargo)

**Rarity System**
- Train types with common → legendary distribution
- Environment rarity tiers
- Network complexity levels

**UI**
- Dark theme control panel
- Feature display with rarity badges
- Train status with speed indicator
- Control buttons mirroring keyboard shortcuts
- Pause indicator overlay
