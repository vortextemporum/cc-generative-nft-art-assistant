# Features & Rarity Documentation

## Overview

Each battle is determined by a 64-character hexadecimal hash. All features are derived deterministically using sfc32 PRNG.

## Rarity Tiers

| Tier | Probability | Color |
|------|-------------|-------|
| Common | ~55-60% | Gray |
| Uncommon | ~25-30% | Green |
| Rare | ~10-15% | Blue |
| Legendary | ~3-5% | Gold |

---

## Feature Categories

### 1. Environment / Arena

| Arena | Rarity | Background | Floor | Accent | Lighting |
|-------|--------|------------|-------|--------|----------|
| Dojo | Common | Dark brown | Wood | Red | Warm |
| Street | Uncommon | Dark blue | Gray | Yellow | Neon |
| Nature | Uncommon | Sky blue | Green | Tan | Natural |
| Simulation | Rare | Dark teal | Green | Cyan | Matrix |
| Computer Chip | Rare | Dark green | PCB green | Gold | Electric |
| Inside Program | Legendary | Dark purple | Dark gray | Blue | Code |
| OS Desktop | Legendary | Win blue | Gray | White | Screen |

### 2. Fighter Count

| Mode | Rarity | Count | Description |
|------|--------|-------|-------------|
| Standard | Common | 2 | Classic 1v1 duel |
| Triple Threat | Uncommon | 3 | Three-way battle |
| Fatal Four | Rare | 3-4 | Multi-fighter chaos |
| Solo Training | Legendary | 1 | Single fighter kata |

### 3. Fight Intensity

| Level | Rarity | Speed | Aggression |
|-------|--------|-------|------------|
| Cinematic | Common | 1x | Dramatic pauses |
| Fast | Uncommon | 1.3x | More attacks |
| Intense | Rare | 1.6x | Aggressive |
| Bullet Time | Legendary | Variable | Slow-mo on hits |

### 4. Interactive Objects

| Count | Rarity | Items |
|-------|--------|-------|
| None | Common | 0 |
| Few | Uncommon | 1 |
| Some | Rare | 2-3 |
| Many | Legendary | 4-6 |

**Object Types:**
- Crate (40%): Climbable wooden box
- Barrel (40%): Rollable container
- Platform (20%): Elevated surface

### 5. Special Effects

| Effect | Rarity | Description |
|--------|--------|-------------|
| Minimal | Common | Clean visuals |
| Impacts | Uncommon | Hit flash effects |
| Trails | Rare | Motion trails on attacks |
| Auras / Afterimages | Legendary | Fighter energy auras or motion ghosts |

### 6. Choreography Style (v1.1.0)

| Style | Probability | Characteristics | Signature Moves |
|-------|-------------|-----------------|-----------------|
| Matrix | 25% | Slow-mo hits, bullet-time dodges | superman_punch, spin_kick |
| Wuxia | 25% | Flowing chains, aerial grace | palm_strike, flying_kick |
| Capoeira | 25% | Ground rhythm, spinning kicks | ginga, martelo, armada |
| Kickboxing | 25% | Quick jabs, powerful hooks | jab, cross, hook, uppercut |

*Note: No rarity variation - all styles equally likely.*

**Style-Specific Combos:**
- Matrix: [jab, jab, spin_kick], [superman_punch, knee_strike]
- Wuxia: [palm_strike, palm_strike, flying_kick], [uppercut, flying_kick]
- Capoeira: [ginga, martelo, armada], [flip, spin_kick]
- Kickboxing: [jab, cross, hook], [jab, jab, uppercut]

### 7. Glitch Trait (v1.1.0)

| State | Probability | Rarity | Description |
|-------|-------------|--------|-------------|
| None | 98% | Common | Normal rendering |
| Active | 2% | Legendary | Visual corruption effects |

**Glitch Effects (when active):**
- RGB color channel offset (chromatic aberration)
- Scan line displacement and flickering
- Random block corruption artifacts
- Intensity varies 0.3-1.0

---

## Fighter Attributes

### Colors (8 total)
- Black (default for Fighter 1)
- White (default for Fighter 2)
- Red, Blue, Green, Gold, Purple, Orange

### Fight Styles (5 total)
- **Aggressive**: More attacks, less defense
- **Defensive**: More blocks, careful approach
- **Balanced**: Mixed tactics
- **Acrobatic**: Flips, aerial moves
- **Technical**: Precise, calculated

---

## Probability Calculations

| Combination | Approximate Odds |
|-------------|------------------|
| Solo Training | ~3% |
| Glitch Active | ~2% |
| Desktop + Solo | ~0.15% |
| Glitch + Solo Training | ~0.06% |
| 4 Fighters + Bullet Time + Many Objects | ~0.002% |
| All Legendary Features + Glitch | ~0.0000002% |

---

## Victory Poses

When a fighter wins, they receive a random pose:

| Pose | Description |
|------|-------------|
| Fist Pump | Raised fist celebration |
| Bow | Respectful martial arts bow |
| Arms Crossed | Confident standing pose |
| Crane | One-leg balance pose |
