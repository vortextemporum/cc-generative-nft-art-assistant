# METAFORMS - Feature Documentation

## Rarity System

Features use weighted random selection. Weights determine probability:
- **Common** (30%+): Frequently appears
- **Uncommon** (15-29%): Less frequent
- **Rare** (5-14%): Infrequent
- **Legendary** (<5%): Very rare

## Materials

| Material | Weight | Rarity | Description |
|----------|--------|--------|-------------|
| Matte | 30 | Common | Soft diffuse surface, clay-like appearance |
| Glossy | 25 | Common | Smooth shiny surface with subtle reflections |
| Chrome | 15 | Uncommon | Full metallic mirror finish |
| Iridescent | 12 | Uncommon | Rainbow color-shifting based on view angle |
| Glass | 10 | Rare | Transparent with refraction and transmission |
| Emissive | 5 | Rare | Self-illuminating, glowing surface |
| Holographic | 3 | Legendary | Rainbow metallic with clearcoat |

## Aesthetics

| Aesthetic | Weight | Rarity | Visual Characteristics |
|-----------|--------|--------|------------------------|
| Sculptural | 30 | Common | Museum-quality, serious art object feel |
| Organic | 25 | Common | Natural, biological appearance |
| Alien | 20 | Uncommon | Unsettling, otherworldly, Giger-esque |
| Playful | 15 | Uncommon | Friendly, toylike, candy colors |
| SciFi | 10 | Rare | Futuristic, technological, sleek |

## Distortions

| Type | Weight | Rarity | Effect |
|------|--------|--------|--------|
| None | 20 | Common | Pure metaball shape, no deformation |
| Twist | 25 | Common | Spiral rotation along Y axis |
| Taper | 20 | Common | Scale increases/decreases along Y |
| Bend | 15 | Uncommon | Curved deformation along X axis |
| Bulge | 10 | Rare | Center expands outward radially |
| Wave | 10 | Rare | Sinusoidal displacement on X/Z |

**Distortion Strength**: 0.3 to 1.0 (continuous)

## Growths

| Type | Weight | Rarity | Geometry |
|------|--------|--------|----------|
| None | 40 | Common | Clean surface, no protrusions |
| Spikes | 20 | Uncommon | Conical points (ConeGeometry) |
| Tendrils | 15 | Uncommon | Curved tubes (TubeGeometry) |
| Bumps | 15 | Uncommon | Spherical bulges (SphereGeometry) |
| Crystals | 10 | Rare | Octahedral gems (OctahedronGeometry) |

**Growth Count**: 3-12 when growth type is not None
**Growth Size**: 0.1 to 0.4 (continuous)

## Boolean Operations

| Type | Weight | Rarity | Shape |
|------|--------|--------|-------|
| None | 50 | Common | Solid form, no cuts |
| Sphere Cut | 20 | Uncommon | Single spherical void |
| Box Cut | 15 | Uncommon | Single cubic void |
| Cylinder Cut | 10 | Rare | Single tubular void |
| Multi Cut | 5 | Legendary | 2-4 overlapping voids |

## Color Families

| Family | Hue Range | Description |
|--------|-----------|-------------|
| Warm | 0-60 | Reds, oranges, yellows |
| Cool | 180-270 | Blues, cyans, purples |
| Neon | 280-340 | Magentas, pinks |
| Earth | 20-50 | Browns, ochres |
| Ocean | 170-220 | Teals, aquas |
| Void | 260-290 | Deep purples |
| Fire | 0-30 | Deep reds, flames |
| Forest | 80-140 | Greens, olives |

**Saturation**: 0.5 to 1.0
**Lightness**: 0.3 to 0.7

## Numeric Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| blobCount | 3-7 | Number of metaballs |
| blobRadius | 0.3-0.6 | Base radius of metaballs |
| blobSpread | 0.5-1.5 | How far balls spread from center |
| distortionStrength | 0.3-1.0 | Intensity of distortion effect |
| growthCount | 3-12 | Number of surface growths |
| growthSize | 0.1-0.4 | Scale of each growth |
| rotationSpeed | 0.001-0.005 | Auto-rotation speed |
| cameraDistance | 4-6 | Initial camera Z position |
| bgLightness | 0.02-0.15 | Background brightness |

## Rarity Combinations

The rarest possible combination:
- Material: Holographic (3%)
- Distortion: Bulge or Wave (10%)
- Growth: Crystals (10%)
- Boolean: Multi Cut (5%)

Combined probability: ~0.0015% (1 in ~67,000)

Common combination:
- Material: Matte (30%)
- Distortion: Twist (25%)
- Growth: None (40%)
- Boolean: None (50%)

Combined probability: ~1.5% (1 in ~67)
