# /util:dataset-query - Query the generative art dataset directly

Search and query the 28,000+ project knowledge base for specific information.

## Arguments

- `$ARGUMENTS` - Query string: artist name, project name, technique, or advanced query

## Query Types

### 1. Simple Search (keyword)

```bash
/util:dataset-query flow fields
/util:dataset-query Tyler Hobbs
/util:dataset-query particle system
```

### 2. Artist Lookup

```bash
/util:dataset-query artist:Snowfro
/util:dataset-query artist:"Tyler Hobbs"
```

Returns:
- All projects by artist
- Techniques they commonly use
- Statistics (editions, platforms)

### 3. Project Lookup

```bash
/util:dataset-query project:Fidenza
/util:dataset-query project:"Chromie Squiggle"
```

Returns:
- Project metadata
- Description
- Detected techniques
- Code patterns (if script available)

### 4. Technique Search

```bash
/util:dataset-query technique:voronoi
/util:dataset-query technique:flowfield
/util:dataset-query technique:physics
```

Returns:
- Projects using the technique
- Common implementations
- Code examples

### 5. Statistics Queries

```bash
/util:dataset-query stats:platforms     # Platform breakdown
/util:dataset-query stats:frameworks    # Framework usage
/util:dataset-query stats:techniques    # Technique popularity
/util:dataset-query stats:tags          # Tag frequency
```

### 6. Advanced Filters

```bash
# Platform-specific
/util:dataset-query platform:artblocks noise
/util:dataset-query platform:fxhash minimal

# Framework-specific
/util:dataset-query framework:threejs particles
/util:dataset-query framework:p5js generative

# Combined filters
/util:dataset-query platform:fxhash framework:p5js technique:flowfield
```

## Output Format

### Project Result

```markdown
## {Project Name} by {Artist}

**Platform:** Art Blocks / fxhash
**Editions:** {count} / {max}
**Framework:** {detected_framework}

### Description
{project_description}

### Detected Techniques
- {technique_1}
- {technique_2}

### Tags
{tag_1}, {tag_2}, {tag_3}

### Code Sample (if available)
\`\`\`javascript
// Key code excerpt
\`\`\`
```

### Statistics Result

```markdown
## Dataset Statistics: {category}

| Item | Count | Percentage |
|------|-------|------------|
| {item_1} | {count} | {pct}% |
| {item_2} | {count} | {pct}% |
```

## Data Sources

This command queries:
- `data/artblocks-dataset.json` - 908 Art Blocks projects
- `data/fxhash-dataset.json` - 27,430 fxhash projects
- `processed/rag-documents.json` - Searchable document chunks
- `processed/system-knowledge.json` - Aggregated statistics

## Examples

```bash
# Find projects using perlin noise
/util:dataset-query perlin noise

# Look up specific artist
/util:dataset-query artist:"Dmitri Cherniak"

# Find three.js projects with physics
/util:dataset-query framework:threejs physics simulation

# Get framework statistics
/util:dataset-query stats:frameworks

# Search fxhash for minimal geometric work
/util:dataset-query platform:fxhash minimal geometric
```

## Follow-up Actions

After query results, offer:
1. **Deep dive**: More details on a specific project
2. **Code analysis**: Analyze detected patterns
3. **Create similar**: Generate sketch inspired by results
4. **Export**: Save results to file
