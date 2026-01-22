# Sketch Standards

All sketches in `sketches/` follow this standardized structure for consistency and maintainability.

## Directory Structure

```
{sketch-name}/
├── index.html          # Viewer with controls
├── sketch.js           # Main sketch code
├── CLAUDE.md           # AI assistant guide
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions (v1.0.0.js, etc.)
└── docs/
    ├── FEATURES.md     # Feature/rarity documentation
    └── TECHNICAL.md    # Technical implementation details
```

## Requirements

### Canvas & Display
- 700x700 responsive canvas (configurable)
- Dark theme viewer with features table
- Responsive scaling for different screen sizes

### Framework Support
Any of these frameworks are supported:
- p5.js (most common)
- Three.js (3D)
- regl (WebGL)
- Vanilla JS/Canvas API
- GLSL shaders
- tone.js (audio)

### Randomness
- Hash-based sfc32 PRNG (Art Blocks compatible)
- Must be deterministic from hash input
- See `hash-randomness.md` for implementation details

### Feature System
Rarity tiers for features:
- **Common**: 50%+ of outputs
- **Uncommon**: 20-50% of outputs
- **Rare**: 5-20% of outputs
- **Legendary**: <5% of outputs

### Versioning
- SemVer versioning (MAJOR.MINOR.PATCH)
- Archive all versions in `versions/` folder
- Document changes in CHANGELOG.md

### Keyboard Controls (Minimum)
- `R` = Regenerate with new hash
- `S` = Save current output as PNG

### Additional Controls (Optional)
- `P` = Pause/resume animation
- `D` = Toggle debug mode
- `F` = Toggle fullscreen
- Number keys = preset hashes

## File Templates

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sketch Name</title>
    <style>
        body { margin: 0; background: #1a1a1a; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <script src="sketch.js"></script>
</body>
</html>
```

### CLAUDE.md (Per-Sketch)
Each sketch should have its own CLAUDE.md with:
- Current version and status
- Key features and parameters
- Known issues
- Development priorities
- Quick reference for important functions

### CHANGELOG.md
```markdown
# Changelog

## [1.0.0] - YYYY-MM-DD
### Added
- Initial release
- Core feature X
- Feature Y

### Changed
- Updated Z behavior

### Fixed
- Bug in W
```

## Quality Checklist

Before considering a sketch complete:

- [ ] Deterministic output from hash
- [ ] Features documented with rarity percentages
- [ ] All keyboard controls working
- [ ] Responsive canvas sizing
- [ ] Version archived
- [ ] CHANGELOG updated
- [ ] README describes the artwork concept
- [ ] CLAUDE.md has accurate current state
