# /art_inspiration - Get generative art ideas from the dataset

Query the 28,000+ project knowledge base for inspiration, techniques, and patterns.

## Arguments

- `$ARGUMENTS` - Optional: theme, technique, style, or specific query

## Modes

### 1. Random Discovery (no arguments)

Pull random notable projects and extract:
- Core technique used
- Visual description
- Key code pattern
- What makes it interesting

### 2. Theme-Based (`/art_inspiration {theme}`)

Search for projects matching themes:
- "flow fields"
- "particle systems"
- "geometric patterns"
- "noise landscapes"
- "cellular automata"
- "organic growth"
- "minimalist"
- "glitch art"

### 3. Technique-Based (`/art_inspiration technique:{name}`)

Find projects using specific techniques:
- `technique:voronoi`
- `technique:perlin`
- `technique:physics`
- `technique:recursion`
- `technique:shaders`
- `technique:l-systems`

### 4. Style Mashup (`/art_inspiration mashup`)

Combine 2-3 random techniques/styles for unique concepts:
- "flow field + voronoi + monochrome"
- "particle system + organic growth + vibrant palette"
- "grid-based + physics + minimal"

## Output Format

```markdown
## Inspiration: {concept_name}

### Concept
{2-3 sentence description of the visual concept}

### Technique Breakdown
1. **Primary**: {main_technique}
2. **Secondary**: {supporting_technique}
3. **Color**: {color_approach}

### Code Skeleton
\`\`\`javascript
// Minimal implementation outline
{pseudocode_or_skeleton}
\`\`\`

### Reference Projects
- **{project_1}** by {artist} - {why_relevant}
- **{project_2}** by {artist} - {why_relevant}

### Variations to Explore
- {variation_1}
- {variation_2}
- {variation_3}

### Rarity Ideas
| Feature | Common | Uncommon | Rare | Legendary |
|---------|--------|----------|------|-----------|
| {feature_1} | {val} | {val} | {val} | {val} |
```

## Dataset Queries

The command searches across:
- 908 Art Blocks projects
- 27,430 fxhash projects
- Detected patterns: flow fields, particles, noise, physics, etc.
- Aesthetic tags: abstract, geometric, organic, minimal, etc.
- Framework usage: p5.js, three.js, shaders, vanilla JS

## Examples

```bash
# Random inspiration
/art_inspiration

# Theme-based
/art_inspiration cosmic particles

# Technique-specific
/art_inspiration technique:flowfield

# Style mashup
/art_inspiration mashup

# Framework-specific
/art_inspiration threejs organic

# By aesthetic
/art_inspiration minimal geometric monochrome
```

## Follow-up Actions

After inspiration, offer:
1. **Create sketch**: Generate full project from concept
2. **Deep dive**: Explain technique implementation in detail
3. **Find more**: Search for more similar projects
4. **Combine**: Merge with another technique
