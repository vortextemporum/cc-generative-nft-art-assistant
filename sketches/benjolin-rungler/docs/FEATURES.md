# Benjolin Rungler - Features & Rarity

## Overview

This document describes all generative features, their possible values, and rarity distributions.

## Visual Modes

The primary visual differentiation between pieces.

| Mode | Name | Probability | Description |
|------|------|-------------|-------------|
| 0 | Circuit | ~22.5% | PCB-style grid with traces, terminal nodes, and animated signal flow |
| 1 | Scope | ~22.5% | Oscilloscope display with Lissajous curves and waveform traces |
| 2 | Pixel | ~30% | Bitcrushed shift register visualization with glitch effects |
| 3 | Hybrid | ~25% | All three layers combined with oscillator-driven masking |

### Mode Details

#### Circuit (Mode 0)
- Grid-based layout with configurable cell size
- Horizontal and vertical traces activated by oscillator states
- Terminal nodes at intersections
- Animated signal dots flowing along active traces
- Background sub-grid for depth

#### Scope (Mode 1)
- Multiple Lissajous curves with phase offsets
- Curves modulated by Benjolin oscillators
- Waveform trace display at bottom
- Rungler CV meter bar
- Phosphor glow and scanline effects
- CRT-style aesthetics

#### Pixel (Mode 2)
- Shift register bits visualized as pixel rows
- Resolution varies with Rungler output (32-96 pixels)
- Glitch rows with horizontal displacement
- HSV color derived from position and oscillators
- Scanline darkening on alternating rows

#### Hybrid (Mode 3)
- Scope layer as background (40% opacity)
- Circuit layer as midground (50% opacity)
- Pixel layer masked by FBM noise pattern
- Mask intensity modulated by Rungler
- Triple RGB offset for maximum chromatic effect
- Vignette applied

## Oscillator Ratio

The frequency relationship between the two chaotic oscillators.

| Category | Range | Probability | Notes |
|----------|-------|-------------|-------|
| Golden Ratios | 0.618, 1.414, 1.5, 1.618, 2.0 | 10% | Creates harmonic visual relationships |
| Random | 0.5 - 3.0 | 90% | Continuous distribution |

Golden ratios create more stable, visually pleasing patterns. They are considered "legendary" features.

## Rungler Bits

The bit depth of the simulated shift register (4-16 bits).

| Range | Visual Effect | Probability |
|-------|---------------|-------------|
| 4-7 | Coarse stepping, obvious quantization | ~25% |
| 8-11 | Medium resolution, balanced | ~50% |
| 12-16 | Fine stepping, smooth transitions | ~25% |

Higher bit counts create more complex, less obviously quantized patterns.

## Feedback Intensity

How much of the previous frame bleeds into the current frame.

| Level | Name | Amount | Probability | Visual Effect |
|-------|------|--------|-------------|---------------|
| 0 | Low | 0.0-0.3 | 40% | Clean, crisp output |
| 1 | Medium | 0.3-0.5 | 30% | Subtle trails and persistence |
| 2 | High | 0.5-0.7 | 20% | Prominent ghosting, motion blur |
| 3 | Extreme | 0.7-0.9 | 10% | Heavy feedback, pattern buildup |

Extreme feedback creates hypnotic, evolving patterns but can become visually dense.

## RGB Offset

The amount of chromatic aberration (channel separation).

| Level | Name | Offset | Probability | Visual Effect |
|-------|------|--------|-------------|---------------|
| 0 | Subtle | 0.002-0.01 | 50% | Barely perceptible color fringing |
| 1 | Moderate | 0.01-0.03 | 30% | Visible RGB separation |
| 2 | Extreme | 0.03-0.08 | 20% | Heavy chromatic aberration |

## Animation Speed

Overall tempo of the animation.

| Level | Name | Multiplier | Probability |
|-------|------|------------|-------------|
| 0 | Slow | 0.3-0.6x | 30% |
| 1 | Medium | 0.6-1.2x | 40% |
| 2 | Fast | 1.2-2.0x | 30% |

## Overall Rarity Calculation

The final rarity is determined by feature combinations:

### Legendary (7%)
- Mode: Hybrid (3)
- Feedback: High or Extreme (2-3)
- Oscillator Ratio: Golden ratio

### Rare (18%)
- Mode: Hybrid (3), OR
- Golden ratio + High/Extreme feedback

### Uncommon (30%)
- Mode: Pixel (2), OR
- Feedback: High or Extreme (2-3), OR
- RGB Offset: Extreme (2)

### Common (45%)
- Everything else

## Probability Combinations

For collectors interested in specific traits:

### Most Rare Combinations
1. Hybrid + Golden Ratio (1.618) + Extreme Feedback + Extreme RGB: ~0.07%
2. Hybrid + Golden Ratio + High Feedback: ~0.7%
3. Hybrid + Extreme Feedback + 16-bit Rungler: ~0.3%

### Most Common Combinations
1. Circuit + Low Feedback + Subtle RGB: ~4%
2. Scope + Medium Feedback + Subtle RGB: ~3%
3. Circuit + Medium Feedback + Moderate RGB: ~2%

## Feature Independence

Most features are independently determined, but some have implicit correlations:

- Golden ratios are checked independently of other features
- Mode affects overall rarity calculation
- Feedback and RGB offset have compound effects on rarity
- Rungler bits don't affect rarity tier but affect visual complexity
