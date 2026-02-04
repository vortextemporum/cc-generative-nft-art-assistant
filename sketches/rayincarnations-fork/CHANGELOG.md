# Changelog

## [1.1.0] - 2026-02-04

### Added

**Dev Mode**
- Full parameter control panel with dropdowns and sliders
- Parameter override system with original state preservation
- Reset to original hash-derived values functionality
- Modified indicator showing when parameters differ from hash

**Feedback System**
- Like/Dislike buttons (keyboard: L/D)
- localStorage-based persistence across sessions
- Session and total feedback counts
- Export feedback to JSON for analysis
- Clear all feedback data option

**Rarity Curves**
- Visual probability distribution for all discrete parameters
- Current value highlighting in red
- Structure, Process, Interaction, Color, Density, Complexity curves

**UI Enhancements**
- Collapsible panels for better organization
- Toast notifications for user actions
- Real-time slider value display
- Apply & Regenerate workflow

**Window API (window.rayincarnationsFork)**
- getFeatures() / getOriginalFeatures()
- setParameter() / resetToOriginal()
- hasModifications()
- recordFeedback() / getFeedbackStats()
- exportFeedback() / clearFeedback()
- getRarityCurves()

**Keyboard Shortcuts**
- Space: Pause/resume rendering
- L: Like current output
- D: Dislike current output

## [1.0.0] - 2026-02-04

### Added

**Core Concept**
- Two-layer system: hidden structures + visible processes
- Interaction modes connecting the layers

**Hidden Structures**
- Radial emanation points with concentric rings
- Flow field (Perlin noise based)
- Hidden grid with offset and rotation
- Spiral attractors with configurable tightness
- Voronoi seed points

**Visible Processes**
- Organic blob forms with curve vertex outlines
- Linear strokes with structure-influenced bending
- Dot clusters with brightness variation
- Wave lines with vertical displacement
- Tendrils that follow structure forces

**Interaction Modes**
- Reveal: structure appears through form density
- Distort: forms bend according to structure vectors
- Attract: forms pulled toward structure centers
- Repel: forms pushed away creating negative space
- Layer: visual blending of both layers

**Visual Style (Volatile Moods inspired)**
- Paper texture with noise grain
- Monochrome and sepia color modes
- Multiple stroke passes for painterly texture
- Dot accumulation for tonal gradients
- Subtle imperfections and jitter

**Technical**
- fxhash compatible PRNG (sfc32)
- Responsive canvas with aspect preservation
- Hi-res export (0-8 keys, 4k-20k pixels)
- Feature export for fxhash metadata
