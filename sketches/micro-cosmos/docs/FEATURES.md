# Micro-Cosmos Features

## Generative Features

All features are derived deterministically from the hash, ensuring the same hash always produces the same ecosystem.

### Ecosystem Type

| Type | Description | Probability |
|------|-------------|-------------|
| Pond | Freshwater life - diverse, green tones | 25% |
| Blood | Circulatory system - red blood cells, white blood cells | 25% |
| Soil | Underground microbiome - bacteria-heavy | 25% |
| Marine | Ocean microorganisms - diatoms, algae | 25% |

### Activity Level

| Level | Speed Modifier | Probability |
|-------|---------------|-------------|
| Dormant | 0.5x | 15% |
| Normal | 1.0x | 45% |
| Active | 1.3x | 30% |
| Hyperactive | 1.8x | 10% |

### Dominant Species

| Species | Population Boost | Probability |
|---------|-----------------|-------------|
| Bacteria | +50% bacteria | 30% |
| Amoeba | +30% amoeba | 20% |
| Algae | +40% diatoms | 20% |
| Mixed | Balanced | 30% |

### Rarity Tier

| Tier | Special Features | Probability |
|------|-----------------|-------------|
| Common | Standard ecosystem | 60% |
| Uncommon | Enhanced colors | 25% |
| Rare | Rare organism present | 12% |
| Legendary | Unique rare + mutations | 3% |

### Rare Organisms (Rare/Legendary only)

| Organism | Description | Appears in |
|----------|-------------|------------|
| Tardigrade | "Water bear" - iconic micro-animal | Legendary |
| Bacteriophage Swarm | Multiple phages attacking bacteria | Rare |
| Diatom Colony | Connected chain of diatoms | Rare |
| Giant Amoeba | 2x normal size, more aggressive | Legendary |

### Mutation Trait

10% of all generations have the "mutation" trait, causing:
- Unusual color variations
- Slightly altered organism shapes
- More varied organelle positions

## Organism Breakdown

### Bacteria (60 per ecosystem)

**Shape Variants:**
| Shape | Description | Probability |
|-------|-------------|-------------|
| Rod | Capsule-shaped, often with flagella | 35% |
| Cocci | Spherical | 30% |
| Spiral | Corkscrew shape | 20% |
| Vibrio | Curved comma shape | 15% |

**Features:**
- Flagella: Rod and Vibrio types have animated flagella
- Run-and-tumble: Random direction changes while swimming
- Size: 3-8 units

### Amoeba (8 per ecosystem)

**Features:**
- Deformable blob shape with 16 control points
- Pseudopod extension toward prey
- Phagocytosis animation (engulfing bacteria)
- Food vacuoles visible after eating
- Nucleus visible when zoomed
- Size: 30-60 units

### Paramecium (12 per ecosystem)

**Features:**
- Slipper-shaped body
- 40 animated cilia around perimeter
- Oral groove for feeding
- Macronucleus visible
- Size: 20-40 units

### Diatom (20 per ecosystem)

**Shape Variants:**
| Shape | Symmetry | Probability |
|-------|----------|-------------|
| Centric | Radial (6-12 fold) | 40% |
| Pennate | Bilateral | 40% |
| Triangular | 3-fold | 20% |

**Features:**
- Intricate silica shell patterns
- Striae (internal lines) visible
- Passive drifting movement
- Size: 15-35 units

### Virus (40 per ecosystem)

**Type Variants:**
| Type | Description | Probability |
|------|-------------|-------------|
| Icosahedral | 20-sided geometric | 30% |
| Helical | Spiral/rod shape | 25% |
| Bacteriophage | Spider-like with legs | 25% |
| Corona | Sphere with spike proteins | 20% |

**Features:**
- Brownian motion movement
- Seeks and attaches to target cells
- Very small (2-5 units), visible at higher zoom
- Different targets (phages → bacteria, others → cells)

### Eukaryotic Cell (15 per ecosystem)

**Cell Types:**
| Type | Characteristics | Probability |
|------|-----------------|-------------|
| Epithelial | Round, standard organelles | 50% |
| Blood (WBC) | Immune cell appearance | 30% |
| Neuron | Extended processes | 20% |

**Organelles:**
- Nucleus with nucleolus
- 5-12 mitochondria (animated movement)
- Endoplasmic reticulum network
- Golgi apparatus stacks
- Size: 50-100 units

### Rotifer (5 per ecosystem)

**Features:**
- Elongated sac-shaped body
- Two wheel organs (corona) with animated cilia
- Retractable foot
- Stomach visible
- Complex swimming motion
- Size: 40-70 units

## Visual Styles by Zoom Level

### Macro (0.5x - 3x)
- **Style:** Phase Contrast
- **Background:** Dark green-gray (#0a1510)
- **Organisms:** Green/teal translucent
- **Feel:** Classic laboratory microscope

### Cellular (3x - 15x)
- **Style:** Fluorescence
- **Background:** Near black (#050510)
- **Organisms:** Bright glowing colors (cyan, magenta, green, yellow)
- **Feel:** Dramatic, scientific imaging

### Organelle (15x - 50x)
- **Style:** Dark Field
- **Background:** Pure black (#000)
- **Organisms:** Bright white/cream
- **Feel:** High contrast, elegant

### Molecular (50x+)
- **Style:** Electron Microscopy
- **Background:** Dark gray (#111)
- **Organisms:** Grayscale with high detail
- **Feel:** Scientific, detailed

## Combination Rarity

The rarity of a specific output depends on the combination of features:

**Common Outputs (~75%):**
- Any ecosystem type
- Normal or active activity
- Mixed or bacteria dominant
- Common rarity tier

**Uncommon Outputs (~20%):**
- Specific ecosystem + species match (e.g., marine + algae dominant)
- Hyperactive or dormant
- Uncommon rarity tier

**Rare Outputs (~4.5%):**
- Rare rarity tier with special organism
- Mutation trait active
- Unusual feature combinations

**Legendary Outputs (~0.5%):**
- Legendary rarity tier
- Mutation trait
- Hyperactive activity
- Rare organism (tardigrade or giant amoeba)
