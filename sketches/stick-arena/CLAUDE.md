# Stick Arena - Claude Guide

## Project Overview

Hash-based generative stick figure combat with parallax pixel environments. Art Blocks compatible.

## File Structure

```
stick-arena/
├── index.html          # Viewer with controls
├── sketch.js           # Main p5.js sketch
├── CLAUDE.md           # This file
├── README.md           # Project documentation
├── CHANGELOG.md        # Version history
├── versions/           # Archived versions
│   └── v1.0.0.js
└── docs/
    ├── FEATURES.md     # Feature/rarity docs
    └── TECHNICAL.md    # Technical details
```

## Current Version

**v1.4.0** - Ready Fight Edition

## Key Concepts

### Combat System
- **StickFigure class**: Full skeletal animation with limb IK
- **Move system**: Queue-based choreography with smooth transitions
- **AI decision making**: Distance-based attack/defend choices
- **Damage system**: Health bars, blocking, invincibility frames

### Environments (7 total)
| Environment | Rarity | Theme |
|-------------|--------|-------|
| Dojo | Common | Wooden walls, lanterns |
| Street | Uncommon | Neon signs, buildings |
| Nature | Uncommon | Mountains, trees |
| Simulation | Rare | Matrix-style grid |
| Chip | Rare | Circuit board |
| Program | Legendary | Code blocks |
| Desktop | Legendary | OS windows/icons |

### Fighter Modes
- **2-way battle**: Common (60%)
- **3-way battle**: Uncommon (25%)
- **4-way battle**: Rare (12%)
- **Solo training**: Legendary (3%) - Single fighter practicing kata

### Fight Styles
- aggressive, defensive, balanced, acrobatic, technical

## Quick Commands

```bash
# Open in browser
open index.html

# Local server
python3 -m http.server 8000
```

## Making Changes

### Version Workflow
1. Document changes in CHANGELOG.md
2. Copy `sketch.js` to `versions/vX.X.X.js`
3. Update version in `index.html`

### Adding New Moves
1. Add pose setter method to StickFigure class (`setNewMovePose()`)
2. Add move to `executeMove()` with duration and action
3. Add to appropriate move selection (attack/defense/movement)

### Adding New Environments
1. Add config to `ENVIRONMENTS` object
2. Implement layer rendering in `drawPixelElement()`
3. Add to rarity selection in `generateFeatures()`

### Adding Interactive Objects
1. Define object type in `InteractiveObject` constructor
2. Add rendering in `render()` method
3. Add interaction logic in `update()`

## Animation System

### Pose Interpolation (v1.1.0)
Uses easing functions for fluid motion:
```javascript
// Available: easeOutQuart, easeInOutQuad, easeOutBack, easeOutElastic
const t = this.poseTime / this.poseDuration;
const eased = this.poseEasing(t);
this.pose[key] = lerp(startPose[key], targetPose[key], eased);
```

### Joint Hierarchy
```
head
  └── shoulder (torso top)
        ├── leftArm (upper → lower → hand)
        ├── rightArm (upper → lower → hand)
        └── hip (torso bottom)
              ├── leftLeg (upper → lower → foot)
              └── rightLeg (upper → lower → foot)
```

### Move Queue
Fighters queue moves and execute them sequentially:
```javascript
this.moveQueue.push('punch');
this.moveQueue.push('kick');
// Executes punch, then kick
```

## Collision Detection

### Attack Hitboxes
- Punches: 15px radius at hand position, 8 damage
- Kicks: 20px radius at foot position, 12 damage

### Hit Detection
```javascript
const dist = dist2D(hitbox.x, hitbox.y, target.x, target.y - 40);
if (dist < hitbox.radius + 20) {
  target.takeDamage(hitbox.damage);
}
```

## Victory System

When one fighter remains:
1. Set `gameState = 'victory'`
2. Winner gets random victory pose
3. Animation freezes after 30 frames
4. Victory overlay displays

Victory poses: `fist_pump`, `bow`, `arms_crossed`, `crane`
