# Genital Forms - Feature Documentation

## Form Types

| Type | Rarity | Weight | Description |
|------|--------|--------|-------------|
| Phallic | Common | 40% | Anatomical shaft with glans, optional testicles |
| Vulvic | Common | 40% | Labia forms with clitoral detail |
| Intersex | Rare | 15% | Blended characteristics between types |
| Ambiguous | Rare | 15% | Organic forms with suggestive bulges |
| Abstract | Legendary | 5% | Surreal twisted parametric forms |
| Morphic | Legendary | 5% | Continuously morphing between types |

### Phallic Variations
- Length: 1.0-1.6 units
- Curvature: -0.15 to +0.15
- Circumcised/uncircumcised
- Vein detail intensity
- Testicle asymmetry

### Vulvic Variations
- Height: 0.8-1.2 units
- Labia prominence: 0.5-1.0
- Clitoral size variation
- Fold complexity

## Materials

### Natural (6 types)
| Material | Rarity | Properties |
|----------|--------|------------|
| Clay | Common | Matte, warm earth tone |
| Ceramic | Common | Slightly glossy, cream white |
| Terracotta | Common | Matte, orange-brown |
| Marble | Uncommon | Semi-glossy, pale with veins |
| Bronze | Uncommon | Metallic, copper-gold |
| Jade | Uncommon | Translucent green |

### Synthetic (5 types)
| Material | Rarity | Properties |
|----------|--------|------------|
| Plastic | Common | Pink, smooth |
| Rubber | Common | Dark, very matte |
| Silicone | Uncommon | Flesh-toned, soft appearance |
| Chrome | Rare | Mirror reflective |
| Neon | Rare | Glowing, emissive |

### Surreal (5 types)
| Material | Rarity | Properties |
|----------|--------|------------|
| Glass | Rare | Transparent, refractive |
| Liquid | Legendary | Blue, fluid appearance |
| Galaxy | Legendary | Dark with cosmic tints |
| Iridescent | Legendary | Color-shifting purple |
| Flesh | Uncommon | Realistic skin tone |

## Render Styles

| Style | Rarity | Effect |
|-------|--------|--------|
| Smooth | Common | High-poly, smooth normals |
| Low Poly | Common | Flat shading, visible facets |
| Wireframe | Uncommon | Lines only, no fill |
| Faceted | Uncommon | Deliberate angular faces |
| Organic | Rare | Noise displacement on surface |

## Backgrounds

| Name | Rarity | Colors |
|------|--------|--------|
| Void | Common | Deep black to charcoal |
| Flesh | Common | Dark warm reds |
| Clinical | Common | Dark teals |
| Warm | Uncommon | Deep oranges |
| Cool | Uncommon | Deep blues |
| Surreal | Rare | Deep purples |
| Neon | Rare | Dark with color hints |
| Cosmic | Legendary | Near-black with subtle color |

## Composition

| Type | Probability | Description |
|------|-------------|-------------|
| Single | 95% | One sculptural form |
| Paired | 5% | Two forms in composition |

Paired compositions automatically add +4 to rarity score, making them effectively legendary.

## Rarity Calculation

Score components:
- Form: Common=1, Rare=3, Legendary=4
- Material: Common=1, Uncommon=2, Rare=3, Legendary=4
- Style: Common=1, Uncommon=2, Rare=3
- Paired: +4

| Score | Overall Rarity |
|-------|----------------|
| 10+ | Legendary |
| 7-9 | Rare |
| 4-6 | Uncommon |
| 1-3 | Common |

## Physics Behavior

Physics auto-enables for soft materials:
- Silicone
- Rubber
- Flesh
- Liquid

Effect: Subtle jiggle, gravity response, wave motion
