# ORGANICS - Feature Documentation

## Core Blob Parameters

These parameters are inspired by the original 2D bezier blob generator:

| Parameter | Range | 2D Equivalent | 3D Effect |
|-----------|-------|---------------|-----------|
| numPoints | 6-14 | Points around ring | Noise frequency bands |
| baseRadius | 0.8-1.2 | Ring radius | Sphere base size |
| radiusRandomness | 0.15-0.4 | Radius variation | Displacement amplitude |
| cpOffsetAngle | 15-45 | Control point wobble | Noise perturbation (deg) |
| noiseScale | 1.5-4.0 | N/A | Noise frequency |
| noiseOctaves | 2-4 | N/A | Detail layers |
| subdivisions | 3-5 | N/A | Mesh resolution |

## Rarity System

Features use weighted random selection:
- **Common** (30%+): Frequently appears
- **Uncommon** (15-29%): Less frequent
- **Rare** (5-14%): Infrequent
- **Legendary** (<5%): Very rare

## Materials

| Material | Weight | Rarity |
|----------|--------|--------|
| Matte | 30 | Common |
| Glossy | 25 | Common |
| Chrome | 15 | Uncommon |
| Iridescent | 12 | Uncommon |
| Glass | 10 | Rare |
| Emissive | 5 | Rare |
| Holographic | 3 | Legendary |

## Distortions

| Type | Weight | Rarity |
|------|--------|--------|
| None | 20 | Common |
| Twist | 25 | Common |
| Taper | 20 | Common |
| Bend | 15 | Uncommon |
| Bulge | 10 | Rare |
| Wave | 10 | Rare |

## Growths

| Type | Weight | Rarity |
|------|--------|--------|
| None | 40 | Common |
| Spikes | 20 | Uncommon |
| Tendrils | 15 | Uncommon |
| Bumps | 15 | Uncommon |
| Crystals | 10 | Rare |

## Boolean Operations

| Type | Weight | Rarity |
|------|--------|--------|
| None | 50 | Common |
| Sphere Cut | 20 | Uncommon |
| Box Cut | 15 | Uncommon |
| Cylinder Cut | 10 | Rare |
| Multi Cut | 5 | Legendary |

## Color Families

| Family | Hue Range |
|--------|-----------|
| Warm | 0-60 |
| Cool | 180-270 |
| Neon | 280-340 |
| Earth | 20-50 |
| Ocean | 170-220 |
| Void | 260-290 |
| Fire | 0-30 |
| Forest | 80-140 |
