# Pocket City - Features & Rarity System

## Overview

Pocket City generates an isometric city block inhabited by Pokemon-like creatures. Each generation is determined by a hash, creating consistent outputs for the same hash.

## Rarity Tiers

| Tier | Color | Probability | Description |
|------|-------|-------------|-------------|
| Common | Gray | ~60% | Frequently occurring features |
| Uncommon | Cyan | ~25% | Less common variations |
| Rare | Pink | ~12% | Special features |
| Legendary | Gold | ~3% | Extremely rare features |

---

## Feature Categories

### 1. Time of Day (25% each)

Determines sky colors, lighting, and which creatures are visible.

| Time | Sky Palette | Ambient | Creatures Active |
|------|-------------|---------|------------------|
| **Dawn** | Purple → Pink → Orange | Warm orange | Neon Pigeon, Vent Spirit, Ancient Guardian |
| **Day** | Light blue → White | Bright white | Neon Pigeon |
| **Dusk** | Dark purple → Red → Orange | Warm red | Vent Spirit, Rooftop Kitsune, Ancient Guardian |
| **Night** | Black → Dark blue | Cool blue | Trash Panda, Sewer Slime, Alley Yokai, Rooftop Kitsune |

**Note:** Sky Dragon is visible at all times.

---

### 2. Building Palettes

| Palette | Colors | Mood |
|---------|--------|------|
| **Tokyo Neon** | Pink, Magenta, Blue, Cyan, Yellow | Vibrant nightlife |
| **Earthy** | Tan, Sage, Cream, Beige | Natural, calm |
| **Cyberpunk** | Magenta, Cyan, Hot Pink, Purple, Lime | High contrast, electric |
| **Pastel Dream** | Soft pink, lavender, baby blue | Gentle, dreamy |
| **Concrete Jungle** | Grays | Industrial, urban |
| **Sunset Strip** | Orange, cream, navy | Warm coastal |

---

### 3. Building Types

| Type | Height Range | Width | Features |
|------|--------------|-------|----------|
| Apartment | 3-6 floors | 2 tiles | Multiple windows, balconies |
| Shop | 1-2 floors | 1 tile | Signs, awnings |
| Tower | 5-8 floors | 1 tile | Antennas, narrow windows |
| Warehouse | 2-3 floors | 2 tiles | Large, few windows |
| Temple | 2-4 floors | 2 tiles | **Rare (20%)**, special roof |

---

### 4. Building Density

| Density | Building Count | Probability |
|---------|----------------|-------------|
| Sparse | 4 buildings | ~33% |
| Normal | 6 buildings | ~34% |
| Dense | 8 buildings | ~33% |

---

### 5. Roof Styles

Each building randomly gets one of:
- **Flat** (25%) - Simple top surface
- **Peaked** (25%) - Triangle roof
- **Dome** (25%) - Rounded top
- **Antenna** (25%) - Flat with antenna

---

### 6. Weather Effects

| Weather | Probability | Description |
|---------|-------------|-------------|
| None | ~40% | Clear conditions |
| Rain | ~20% | Falling rain streaks |
| Fog | ~20% | Drifting fog clouds |
| Fireflies | ~20% | Glowing particles (best at night) |

---

## Creature Rarity & Spawning

### Common Creatures (~60% spawn rate each)

**Trash Panda**
- Urban ecology creature
- Gray fur with striped tail
- Active: Dusk, Night
- Habitat: Alleys (ground level)

**Neon Pigeon**
- Urban ecology creature
- Iridescent purple/pink feathers
- Active: Dawn, Day
- Habitat: Rooftops

### Uncommon Creatures (~25% spawn rate each)

**Sewer Slime**
- Urban ecology creature
- Glowing green blob
- Active: Night only
- Habitat: Ground level
- Special: Glow effect

**Vent Spirit**
- Mythical creature
- Wispy white ghost
- Active: Dawn, Dusk
- Habitat: Building sides
- Special: Fading transparency

### Rare Creatures (15% base chance)

**Rooftop Kitsune**
- Mythical creature (Japanese fox spirit)
- Orange/gold with 3 tails
- Active: Dusk, Night
- Habitat: Rooftops
- Special: Glowing red eyes

**Alley Yokai**
- Mythical creature (Japanese spirit)
- Purple ethereal form with mask face
- Active: Night only
- Habitat: Alleys
- Special: Floating orbs

### Legendary Creatures (5% base chance)

**Sky Dragon**
- Mythical creature (Eastern dragon)
- Cyan/teal serpentine body
- Active: ALL TIMES
- Habitat: Sky (floating)
- Special: Undulating body, glowing eyes

**Ancient Guardian**
- Mythical creature (stone golem)
- Stone body with golden runes
- Active: Dawn, Dusk
- Habitat: Ground level
- Special: Pulsing glow effect

---

## Feature Combinations

### Probability Examples

| Combination | Approximate Probability |
|-------------|------------------------|
| Night + Rain + Legendary | ~0.25% |
| Dusk + Kitsune visible | ~3.75% |
| Temple + Dense buildings | ~6.7% |
| Day + No creatures visible | 0% (always some active) |
| Fireflies + Night | ~5% |

### Optimal Viewing Times

| To See... | Best Time |
|-----------|-----------|
| Most creatures | Dusk (5 types possible) |
| All legendaries | Dawn or Dusk |
| Glowing effects | Night (neon, slime, fireflies) |
| Building details | Day (brightest lighting) |

---

## Hash Derivation

All features are derived deterministically from the 64-character hex hash using the sfc32 PRNG algorithm:

```javascript
// Seed from hash
const seed = [];
for (let i = 2; i < 66; i += 8) {
  seed.push(parseInt(hash.slice(i, i + 8), 16));
}
const R = sfc32(seed[0], seed[1], seed[2], seed[3]);
```

Same hash always produces identical output.

---

## Collector's Guide

### What to Look For

**High Value Indicators:**
- Legendary creature present (Sky Dragon or Ancient Guardian)
- Temple building
- Night + Fireflies weather
- Cyberpunk or Tokyo Neon palette at night
- Multiple rare creatures in same scene

**Interesting Combinations:**
- Ancient Guardian + Temple (mystical scene)
- Rain + Dusk (moody atmosphere)
- Sky Dragon + Day (rare visibility)
- Kitsune + Yokai (both rare in same night scene)
