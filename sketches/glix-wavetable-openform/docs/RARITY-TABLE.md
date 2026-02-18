# GLIX Wavetable Open Form - Rarity Table

## Depth 0 (Root) — All Editions Get These

### Oscillator (20 types, equal 5% each)
| Oscillator | Family | Probability |
|---|---|---|
| Sine | Classic | 5% |
| Triangle | Classic | 5% |
| Sawtooth | Classic | 5% |
| Pulse | Classic | 5% |
| HalfRect | Waveform | 5% |
| Staircase | Waveform | 5% |
| Parabolic | Waveform | 5% |
| SuperSaw | Waveform | 5% |
| Schrodinger | Mathematical | 5% |
| Chebyshev | Mathematical | 5% |
| FM | Mathematical | 5% |
| Harmonic | Mathematical | 5% |
| Fractal | Exotic | 5% |
| Chirp | Exotic | 5% |
| Formant | Exotic | 5% |
| Chaos | Exotic | 5% |
| RingMod | Synthesis | 5% |
| PhaseDist | Synthesis | 5% |
| Shepard | Synthesis | 5% |
| Wavelet | Synthesis | 5% |

### Oscillator Family
| Family | Probability |
|---|---|
| Classic | 20% |
| Waveform | 20% |
| Mathematical | 20% |
| Exotic | 20% |
| Synthesis | 20% |

### Palette (55 palettes, equal ~1.8% each)
Uniform distribution across all 55 palettes.

### Hue Shift
| Value | Probability |
|---|---|
| None (0) | ~0.3% |
| 1-359 degrees | ~99.7% (uniform) |

### Fold Mode (11 modes, equal ~9% each)
| Mode | Probability |
|---|---|
| Shred | ~9.1% |
| Drive | ~9.1% |
| Warm | ~9.1% |
| Soft | ~9.1% |
| Whisper | ~9.1% |
| Crease | ~9.1% |
| Harsh | ~9.1% |
| Mangle | ~9.1% |
| Destroy | ~9.1% |
| Fracture | ~9.1% |
| Ripple | ~9.1% |

### Animation Mode (5 modes, equal 20% each)
| Mode | Probability |
|---|---|
| Drift | 20% |
| LFO | 20% |
| Chaos | 20% |
| Sequencer | 20% |
| Bounce | 20% |

### Animation Speed
| Tier | Range | Probability |
|---|---|---|
| Glacial | < 0.25 | ~27% |
| Moderate | 0.25 - 0.4 | ~33% |
| Fast | > 0.4 | ~40% |

### Animation Range
| Tier | Range | Probability |
|---|---|---|
| Subtle | < 0.35 | ~25% |
| Medium | 0.35 - 0.6 | ~42% |
| Wild | > 0.6 | ~33% |

### Resolution
| Size | Probability |
|---|---|
| 256px | 20% |
| 384px | 20% |
| 512px | 20% |
| 768px | 20% |
| 1024px | 20% |

---

## Depth 1 (First Evolution) — Added Traits

### Fold Intensity
| Tier | fx_fold Range | Probability |
|---|---|---|
| None | 0 - 5 | ~15% |
| Light | 5 - 50 | ~15% |
| Moderate | 50 - 500 | ~40% |
| Heavy | 500 - 5000 | ~25% |
| Extreme | 5000 - 10000 | ~5% |

### Crush
| Value | Probability |
|---|---|
| Yes | 35% |
| No | 65% |

### Transform
| Value | Probability |
|---|---|
| Normal | ~56.25% |
| Mirror | ~18.75% |
| Invert | ~18.75% |
| Mirror + Invert | ~6.25% |

### Phase Modulation
| Effect | Chance Active |
|---|---|
| Phase Bend | 70% |
| Phase Noise | 60% |
| Phase Quantize | 60% |
| Spiral (pw_morph) | ~50% |

---

## Depth 2 (Second Evolution) — Added Traits

### DSP Effects (each independent)
| Effect | Chance Active |
|---|---|
| Rectify | 30% |
| Hard Clip | 25% |
| Asymmetric Drive | 25% |
| Ring Mod | 30% |
| Comb Filter | 30% |
| Slew Limit | 20% |
| Bit Ops | 20% |

### Signal Chain (derived from effect count)
| Tier | Active Effects | Approx. % |
|---|---|---|
| Pure | 0 | ~10% |
| Light | 1-2 | ~35% |
| Processed | 3-4 | ~40% |
| Mangled | 5+ | ~15% |

---

## Depth 3+ (Deep Evolution) — Added Traits

### Post-FX Textures (each independent, per depth level)
| Effect | Chance per Depth |
|---|---|
| Film Grain | 15% |
| Bayer Dither | 14% |
| Posterize | 12% |
| Sharpen | 12% |
| Noise Dither | 10% |
| Scanlines | 10% |
| Halftone | 10% |
| Edge Detect | 8% |
| Ripple | 5% |

Note: Chances are higher per-depth than long-form because each depth level is an additional roll. A depth-5 edition gets 3 rolls (depths 3, 4, 5).

### Resolution Upgrade
| Event | Chance per Depth |
|---|---|
| Resolution +1 tier | 25% per depth level beyond 3 |

---

## Computed Traits (All Depths)

### Motion (depends on animation lock pattern)
| Tier | Description |
|---|---|
| Frozen | No animated parameters |
| Minimal | 1-2 params animate |
| Flowing | 3-5 params animate |
| Turbulent | 6-10 params animate |
| Chaotic | 11+ params animate |

### Depth
| Value | Description |
|---|---|
| 0 | Root edition |
| 1 | First evolution |
| 2 | Second evolution |
| 3+ | Deep evolution |

### Lineage Length
Same as depth, shown as "Generation N" for display.
