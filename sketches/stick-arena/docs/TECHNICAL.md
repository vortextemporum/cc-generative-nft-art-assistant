# Technical Documentation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Hash Input                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Feature Generation                         │
│    Environment, Fighters, Objects, Intensity, FX            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Game Initialization                      │
│      Create Environment, Fighters, Objects, Effects         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Game Loop                              │
│  Environment → Objects → AI → Physics → Combat → Render     │
└─────────────────────────────────────────────────────────────┘
```

---

## Class Hierarchy

### StickFigure
Main fighter class handling animation, AI, and combat.

```javascript
class StickFigure {
  // Identity
  id, x, y, color, style, facing

  // Body proportions
  headSize, bodyLength, armLength, legLength, thickness

  // Animation (10 angles)
  pose: {
    headTilt, torsoAngle,
    leftArmUpper, leftArmLower,
    rightArmUpper, rightArmLower,
    leftLegUpper, leftLegLower,
    rightLegUpper, rightLegLower
  }

  // Combat
  health, maxHealth, blocking, attacking, stunned, invincible

  // State
  currentMove, moveTimer, moveQueue, dead, winner
}
```

### Environment
Handles parallax background rendering.

```javascript
class Environment {
  config         // Colors, lighting, pixel size
  parallaxLayers // Array of layer objects
  groundY        // Y position of floor

  render(offsetX)    // Draw all layers with parallax
  drawBackground()   // Gradient sky
  drawLayer()        // Individual parallax layer
  drawPixelElement() // Per-element pixel art
  drawGround()       // Floor with texture
}
```

### InteractiveObject
Props that fighters can interact with.

```javascript
class InteractiveObject {
  x, y, w, h, type
  climbable, breakable, rollable, usable
  health, vx, destroyed
}
```

### EffectsManager
Visual effects for combat.

```javascript
class EffectsManager {
  particles, trails, impacts

  addImpact(x, y, type)  // Hit flash
  addTrail(x, y, color)  // Motion blur
  update()               // Animate effects
  render()               // Draw effects
}
```

---

## Animation System

### Pose Representation
Each pose is a set of 10 angles (radians):

```javascript
{
  headTilt: 0,           // Head rotation
  torsoAngle: 0,         // Body lean
  leftArmUpper: -PI/4,   // Shoulder angle
  leftArmLower: 0,       // Elbow angle
  rightArmUpper: PI/4,
  rightArmLower: 0,
  leftLegUpper: PI/2,    // Hip angle
  leftLegLower: 0,       // Knee angle
  rightLegUpper: PI/2,
  rightLegLower: 0
}
```

### Forward Kinematics
Joint positions calculated from root:

```javascript
getJointPos('rightHand') {
  shoulder = (x, y - bodyLength)
  elbow = shoulder + rotate(armLength/2, rightArmUpper)
  hand = elbow + rotate(armLength/2, rightArmUpper + rightArmLower)
  return hand
}
```

### Pose Interpolation
Smooth transitions at 20% per frame:

```javascript
for (key in pose) {
  pose[key] = lerp(pose[key], targetPose[key], 0.2);
}
```

---

## AI System

### Decision Flow
```
1. Find nearest opponent
2. Calculate distance
3. If dist > 100: approach (walk/dash/jump)
4. If dist > 50: mix attacks and positioning
5. If dist < 50: attack or defend based on opponent state
6. Add style-specific moves to queue
```

### Move Queue
```javascript
// Moves execute sequentially
moveQueue = ['dash', 'punch', 'kick'];

// Each frame:
if (moveTimer <= 0 && moveQueue.length > 0) {
  executeMove(moveQueue.shift());
}
```

### Solo Training Mode
When alone, fighter performs kata sequences:
```javascript
queueTrainingMove() {
  const moves = ['punch', 'kick', 'uppercut', 'flip', 'kata'];
  queueMove(rndChoice(moves));

  // Random combos
  if (rndBool(0.3)) {
    moveQueue.push(rndChoice(moves));
    moveQueue.push(rndChoice(moves));
  }
}
```

---

## Combat System

### Hitbox Detection
```javascript
// Attack creates hitbox at hand/foot
getAttackHitbox() {
  if (kick move) {
    return { x: foot.x, y: foot.y, radius: 20, damage: 12 };
  }
  return { x: hand.x, y: hand.y, radius: 15, damage: 8 };
}

// Check collision with opponents
for (opponent of fighters) {
  dist = distance(hitbox, opponent.center);
  if (dist < hitbox.radius + 20) {
    opponent.takeDamage(hitbox.damage);
  }
}
```

### Damage Calculation
```javascript
takeDamage(amount) {
  if (invincible > 0) return;
  if (blocking) amount *= 0.3;  // 70% reduction

  health -= amount;
  stunned = 15;          // Stun frames
  vx = -facing * 3;      // Knockback

  if (health <= 0) {
    setDeadPose();
  }
}
```

---

## Parallax Rendering

### Layer Depth
```javascript
// 3 layers with increasing depth (0-1)
parallaxLayers = [
  { type: 'back', depth: 0.33 },
  { type: 'mid', depth: 0.66 },
  { type: 'front', depth: 1.0 }
];

// Render with offset based on depth
for (layer of parallaxLayers) {
  parallaxOffset = cameraX * layer.depth * 0.3;
  drawLayer(layer, parallaxOffset);
}
```

### Pixel Art Elements
Each environment defines element types:
- `wooden_walls`: Noise-based wood texture
- `buildings`: Rectangles with lit windows
- `grid`: Line-based matrix pattern
- `mountains`: Noise-based terrain
- `circuits`: Random path generation

---

## Performance Notes

### Optimization
- Fighter count capped at 4
- Hitbox checks skip dead fighters
- Effects auto-cleanup when alpha reaches 0
- Parallax elements pre-generated

### Memory
- ~10KB per fighter (pose data + trail)
- ~5KB per environment layer
- Effects cleared each frame

---

## Art Blocks Deployment

### Checklist
1. [ ] Remove `window.onFeaturesGenerated`
2. [ ] Remove HTML-specific code
3. [ ] Minify JavaScript
4. [ ] Test determinism with fixed hash
5. [ ] Verify all features extract correctly
