# Exquisite Corpse - Features & Rarity

## Edge Matching
Each piece derives its edges from hashes:
- **Left edge** = `deriveEdgeProfile(leftHash)` - matches right edge of neighbor
- **Right edge** = `deriveEdgeProfile(ownHash)` - defines seam for next piece
- First piece uses a default flat profile (origin piece)

## Technique Weights
Each piece has 5 technique weights (0-100%) derived from its hash:

| Technique | Range | Description |
|-----------|-------|-------------|
| Contours | 20-100% | Topographic iso-lines |
| Flow Threads | 20-100% | Flowing curves following field |
| Hatching | 0-80% | Parallel line groups |
| Stipple | 10-70% | Dot patterns |
| Ink Wash | 0-50% | Soft tonal areas |

## Density Tiers
Based on average anchor density:

| Tier | Range | Rarity |
|------|-------|--------|
| Sparse | < 35% | ~25% |
| Balanced | 35-55% | ~30% |
| Dense | 55-72% | ~30% |
| Saturated | > 72% | ~15% |

## Position Types
| Type | Description |
|------|-------------|
| Origin | First piece in chain (no left neighbor) |
| Continuation | Connected to previous piece |

## Dominant Technique
The technique with highest weight becomes the dominant feature. Distribution is roughly uniform since all weights are independently random.
