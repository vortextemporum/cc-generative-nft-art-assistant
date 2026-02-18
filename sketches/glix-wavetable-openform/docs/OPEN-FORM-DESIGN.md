# GLIX Wavetable Open Form - Design Document

## What is Open Form?

Open form is fxhash's evolution system. Unlike long-form (one hash → one fixed output), open form lets collectors **evolve** their editions:

1. Collector mints a **root edition** (depth 0) — works like a normal mint
2. Collector **locks** their edition as a "seed" (costs art coins)
3. Anyone can **evolve** from that seed → creates a child edition (depth 1)
4. Children can also be locked → creating grandchildren (depth 2), and so on

Each evolved edition inherits the full chain of ancestor hashes (the "lineage").

## Why Open Form for Wavetables?

The wavetable synth has ~30 independent parameters. Open form lets us split these across depth levels, so:
- **Root mints are simpler** — the "DNA" of the instrument
- **Each evolution layers complexity** — new effects, textures, mutations
- **Deep lineages are rare and rich** — the most complex pieces require multiple generations

This creates a natural economy: root editions are the foundation, evolved editions are the art.

---

## SDK API Reference

These are the fxhash APIs we use for open form:

| API | Type | Description |
|-----|------|-------------|
| `$fx.depth` | Number | How many ancestors this edition has. Root = 0, first child = 1, etc. |
| `$fx.lineage` | Array | All hashes in the lineage: `[rootHash, child1Hash, ..., thisHash]` |
| `$fx.rand` | Function | PRNG seeded by THIS edition's hash (same as `$fx.randAt($fx.depth)`) |
| `$fx.randAt(d)` | Function | PRNG seeded by the hash at depth `d`. Throws if `d > $fx.depth` |
| `$fx.hash` | String | This edition's own hash |
| `$fx.isPreview` | Boolean | True when running in capture environment |

**Key rule**: `$fx.randAt(0)` always gives the same sequence for all editions in the same lineage. This is how children inherit parent traits.

---

## Evolution Architecture

### Depth 0 — Root (The Instrument)

Determined by `$fx.randAt(0)`:

| Parameter | Description |
|-----------|-------------|
| Oscillator | Which of the 20 waveforms (Sine → Wavelet) |
| Oscillator Family | Classic / Waveform / Mathematical / Exotic / Synthesis |
| Palette | One of 55 color palettes |
| Hue Shift | 0-359 degree rotation |
| Base Fold Mode | Which folding algorithm |
| Animation Mode | Drift / LFO / Chaos / Sequencer / Bounce |
| Animation Speed | How fast parameters animate |
| Animation Range | How far parameters drift |
| Resolution | 256 / 384 / 512 / 768 / 1024 |

**These traits are INHERITED** — every edition in the same lineage shares these.

### Depth 1 — First Evolution (Add Effects)

Determined by `$fx.randAt(1)`:

| Parameter | Description |
|-----------|-------------|
| Fold Intensity | How much wave folding (Light → Extreme) |
| Crush | Whether bitcrushing is active |
| Transform | Normal / Mirror / Invert / Mirror + Invert |
| Phase Mods | Bend, Noise, Quantize activation + amounts |

**Visual change**: The base waveform gets its first distortion layer.

### Depth 2 — Second Evolution (DSP Chain)

Determined by `$fx.randAt(2)`:

| Parameter | Description |
|-----------|-------------|
| Hard Clip | Clipping distortion |
| Asymmetric Drive | Uneven saturation |
| Ring Mod | Ring modulation amount |
| Comb Filter | Comb filtering delay |
| Slew Limit | Parameter smoothing |
| Bit Ops | Bitwise operations |
| Rectify | Full-wave / Half-wave rectification |

**Visual change**: The signal chain gets complex. Mangled pieces emerge here.

### Depth 3+ — Deep Evolution (Textures & Mutations)

Determined by `$fx.randAt(3)` and beyond:

| Parameter | Description |
|-----------|-------------|
| Post-FX | Bayer, Noise Dither, Scanlines, Posterize, Grain, Sharpen, Halftone, Edge Detect, Ripple |
| Resolution Upgrade | Each depth can bump resolution one tier up |
| Mutations | Small random variations on inherited traits |

**Visual change**: Surface textures appear. Deep lineages have the richest visual output.

---

## Feature Traits by Depth

| Trait | Appears at | Inherited from |
|-------|-----------|----------------|
| Oscillator | Depth 0 | Root |
| Oscillator Family | Depth 0 | Root |
| Palette | Depth 0 | Root |
| Hue Shift | Depth 0 | Root |
| Animation Mode | Depth 0 | Root |
| Animation Speed | Depth 0 | Root |
| Animation Range | Depth 0 | Root |
| Fold Mode | Depth 0 | Root |
| Resolution | Depth 0 (upgradeable) | Root + evolutions |
| Fold Intensity | Depth 1+ | Self |
| Crush | Depth 1+ | Self |
| Transform | Depth 1+ | Self |
| Phase | Depth 1+ | Self |
| DSP Effects | Depth 2+ | Self |
| Signal Chain | Depth 2+ | Self (computed) |
| Motion | Depth 2+ | Self |
| Texture | Depth 3+ | Self |
| Depth | All | Computed |
| Lineage Length | All | Computed |

---

## How Traits are Computed (Pseudocode)

```
function generateFeatures():
  // STEP 1: Root traits (always from depth 0 PRNG)
  R0 = $fx.randAt(0)
  oscillator = pickOscillator(R0)
  palette = pickPalette(R0)
  hueShift = pickHueShift(R0)
  foldMode = pickFoldMode(R0)
  animMode = pickAnimMode(R0)
  resolution = pickResolution(R0)
  animSpeed = pickSpeed(R0)
  animRange = pickRange(R0)

  // STEP 2: First evolution layer (if depth >= 1)
  if $fx.depth >= 1:
    R1 = $fx.randAt(1)
    foldIntensity = pickFoldIntensity(R1)  // was random before, now layered
    crush = pickCrush(R1)
    transform = pickTransform(R1)
    phaseMods = pickPhaseMods(R1)
  else:
    foldIntensity = "None"
    crush = false
    transform = "Normal"
    phaseMods = "Clean"

  // STEP 3: DSP chain (if depth >= 2)
  if $fx.depth >= 2:
    R2 = $fx.randAt(2)
    dspEffects = pickDSPEffects(R2)
  else:
    dspEffects = []

  // STEP 4: Textures and mutations (if depth >= 3)
  if $fx.depth >= 3:
    for d = 3 to $fx.depth:
      Rd = $fx.randAt(d)
      addPostFX(Rd)
      maybeUpgradeResolution(Rd)
      applyMutation(Rd)  // small tweaks to inherited params

  // Register all features with $fx.features()
```

---

## Visual Progression

```
Depth 0:  Clean waveform + palette + animation
          ┌─────────────────────────┐
          │  Pure oscillator shape   │
          │  Base colors             │
          │  Animation mode active   │
          └─────────────────────────┘

Depth 1:  + Fold + Crush + Transform + Phase
          ┌─────────────────────────┐
          │  Distorted waveform     │
          │  Mirrored/inverted      │
          │  Phase modulation       │
          └─────────────────────────┘

Depth 2:  + Ring Mod + Comb + Clip + Drive
          ┌─────────────────────────┐
          │  Complex signal chain   │
          │  Multiple DSP effects   │
          │  Rich harmonic content  │
          └─────────────────────────┘

Depth 3+: + Bayer + Grain + Halftone + Edge
          ┌─────────────────────────┐
          │  Textured surface       │
          │  Post-FX layers         │
          │  Maximum visual density │
          └─────────────────────────┘
```

---

## Collector Experience

### Minting a Root (Depth 0)
- You get a clean, animated waveform with a palette
- Simple but foundational — this is the "seed" of a potential lineage
- Traits: Oscillator, Palette, Hue Shift, Fold Mode, Animation

### Evolving to Depth 1
- Lock your root (costs art coins)
- Mint an evolution → gets wave folding, crush, transforms
- The base oscillator and palette are inherited from the root
- New traits appear: Fold Intensity, Crush, Transform, Phase

### Evolving to Depth 2
- Lock your depth-1 edition
- Mint → gets DSP effects layered on top
- Still has the root's oscillator/palette + depth-1's folding
- New traits: full DSP chain (Ring Mod, Comb, etc.)

### Deep Evolution (3+)
- Each new depth adds post-FX textures
- Resolution can upgrade
- Small mutations keep each branch unique
- The deepest pieces are the most complex and rarest

---

## Rarity Economics

| Depth | Expected Rarity | Visual Complexity |
|-------|----------------|-------------------|
| 0 | Common (most mints) | Clean, simple |
| 1 | Uncommon | Distorted |
| 2 | Rare | Complex |
| 3 | Very Rare | Textured |
| 4+ | Ultra Rare | Maximum density |

Root editions that produce interesting lineages become valuable as seeds.
Deep lineages with coherent visual progression are the most collectible.

---

## Differences from Long-Form Version

| Aspect | Long Form (v1.5.0) | Open Form |
|--------|-------------------|-----------|
| Blockchain | Ethereum | Base (required for art coins) |
| All params at once | Yes | No — layered by depth |
| Root editions | Full complexity | Simple/clean |
| Evolution | N/A | Lock → evolve → deeper |
| Art coins | N/A | Yes (required for open form) |
| Editions | 512 fixed | Dynamic (root + evolutions) |
| postMint exploration | Disabled | Enabled |
| Feature count at mint | All 18 | Grows with depth |

---

## Implementation Status

- [x] Project structure created
- [x] Long-form code copied as starting point
- [ ] Refactor `generateFeatures()` to use depth-based layering
- [ ] Replace all `R()` calls with `$fx.randAt(depth)` calls
- [ ] Add `$fx.depth` feature trait
- [ ] Add "Lineage Length" feature trait
- [ ] Test with fxlens open-form mode
- [ ] Verify root editions look good standalone
- [ ] Verify depth 1-3 evolutions layer correctly
- [ ] Verify inherited traits match across lineage
- [ ] Update $fx.features() to only show traits for current depth
