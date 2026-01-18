# Changelog

All notable changes to Stick Arena will be documented in this file.

## [1.4.0] - 2025-01-17 - Ready Fight Edition

### Added

#### Start Screen & Countdown
- Game now starts frozen on first frame
- Big red "START THE FIGHT" button in center
- Click button, press Space, or Enter to begin
- "READY..." appears for 1 second (yellow, scaling animation)
- "GO!" appears for 1 second (green, scaling animation)
- Fight begins after countdown completes

#### Interactive Objects System
- InteractiveObject class with crate, barrel, and platform types
- Objects render behind fighters
- Crates: 50x50 wooden boxes with grain detail
- Barrels: 40x55 metal containers with bands
- Platforms: 120x15 elevated surfaces with support legs
- Objects spawn based on rarity (0-6 items)

### Fixed

#### Deterministic Background Elements
- Trees now use fixed heights per index (no more size flickering!)
- Added gentle wind sway animation to tree canopies
- Circuit paths use deterministic positions
- Circuit nodes use fixed positions
- Capacitor positions now deterministic
- No more dizzy-inducing random changes per frame

### Technical
- New game states: 'waiting', 'countdown', 'fighting', 'victory'
- countdownTimer and countdownPhase for countdown sequence
- mousePressed() handler for button click
- startCountdown() function
- Objects array populated in initializeGame()

---

## [1.3.0] - 2025-01-17 - Polished Aesthetics Edition

Inspired by [Xiao Xiao](https://en.wikipedia.org/wiki/Xiao_Xiao) and [Stick Fight: The Game](https://landfall.se/stickfightthegame)

### Changed

#### Fighter Colors (High Contrast)
- "Shadow" (black) replaced with "Cyan" for visibility
- All colors brightened for better contrast against backgrounds
- Colors: Cyan, White, Crimson, Royal, Jade, Gold, Violet, Ember

#### Background Animations (70% Slower)
- Environment time progression: 1.0 → 0.3 per frame
- Particle speeds reduced dramatically (rain: 8-12 → 2-4 vy)
- Particle counts reduced for cleaner look
- All sin/cos time multipliers reduced by 60-80%
- No more dizzying fast-moving elements

#### Simplified Backgrounds
- Fewer elements per layer (buildings: 6→5, lanterns: 6→5, etc.)
- More subtle alpha values throughout
- Static windows instead of flickering
- Gentler atmospheric effects
- Clouds drift slowly instead of racing

### Added

#### Squash & Stretch Animation
- Vertical velocity affects body proportions
- Jumping up = stretch tall (up to 15%)
- Falling = slight stretch
- Landing impact = squash (90% height, 110% width)
- Attacking = forward stretch
- Blocking = defensive squash
- Volume-preserving calculations

#### Fighter Outline System
- Dark outline (15,15,20) rendered behind main body
- 3px thicker than body stroke for contrast
- Fighters now "pop" against any background
- Inspired by Stick Fight: The Game's visual clarity

### Technical
- renderBody() now accepts isOutline parameter
- Squash/stretch uses sqrt for volume preservation
- Background elements use deterministic values where possible

---

## [1.2.0] - 2025-01-17 - Larger Than Life Edition

### Changed

#### Fighter Proportions (1.6x larger)
- Head size: 10 → 16
- Body length: 32 → 52
- Arm length: 24 → 42
- Leg length: 28 → 48
- Line thickness: 2.5 → 4
- Total fighter height now ~160px (was ~70px)

#### Animation System Overhaul
- Fixed pose interpolation: now properly interpolates from start → target using easing
- Added startPose tracking for smooth transitions
- Fighters now visibly reach their target poses
- Breathing/idle sway only applies when not in a move

#### Fighting Stance Improvements
- Proper guard position with hands up protecting face
- Athletic stance with bent knees and weight distribution
- Distinct front/back leg positioning

#### Move Data Updates
- All velocities scaled ~1.5x for larger fighters
- More extreme poses that read better at scale
- Added windupPose to most moves for anticipation
- Improved punch poses with full body engagement
- Dynamic kick poses with proper wind-up

#### AI Combat Variety
- Scaled engagement distances: 200px (far), 120px (mid), close
- Style-specific approach, evade, and counter move sets
- More combo variety per style (6-7 combos each)
- 30% chance for single power moves in close range

### Fixed
- Hitbox calculations now scale with body proportions
- Ground position adjusted for larger fighters (height - 80)
- Fighter bounds expanded (80px margin)
- Collision detection uses dynamic body center
- Effect positions (impacts, sparks, windups) scale with body
- Health bar size increased (60x6px)

### Technical
- ~2150 lines of code
- groundY: 80px from bottom (was 55px)
- All hardcoded body references replaced with proportional values

---

## [1.1.0] - 2025-01-17 - Matrix Kung Fu Edition

### Added

#### Fluid Animation System
- Easing functions: easeOutQuart, easeInOutQuad, easeOutBack, easeOutElastic
- 3-phase animation (windup, action, recovery) for all moves
- Dynamic pose interpolation speed based on move intensity
- Breathing animation cycle for idle fighters

#### Choreography Styles (4 total)
- **Matrix**: Slow-motion hits, bullet-time dodges, dramatic pauses
- **Wuxia**: Flowing chains, aerial combos, graceful movements
- **Capoeira**: Ground moves, ginga rhythm, spinning kicks
- **Kickboxing**: Quick jabs, powerful hooks, footwork

#### Combo System
- Style-specific combo chains (3-5 move sequences)
- Combo counter with hit tracking
- Increased damage for combo finishers
- Auto-combo triggers based on choreography style

#### Camera Effects
- Dynamic camera shake on heavy impacts
- Slow motion on significant hits (bullet_time intensity)
- Camera tracking of combat action

#### Glitch Trait (2% Legendary)
- RGB color channel offset with chromatic aberration
- Scan line displacement and flickering
- Random block corruption artifacts
- Intensity varies 0.3-1.0 for different glitch severity

#### Enhanced Visual Effects
- Afterimages effect (legendary FX)
- Improved motion trails with color blending
- Fighter aura glow based on color
- Impact sparks with directional spread

#### Refined Environments
- Atmospheric particles per environment (dust, rain, data, leaves, sparks, etc.)
- Improved parallax depth calculation
- Environment-specific lighting and ambience
- More detailed background elements

#### New Moves
- superman_punch: Leaping power punch
- knee_strike: Close-range knee attack
- spin_kick: 360° rotational kick
- palm_strike: Wuxia-style open palm
- flying_kick: Extended aerial kick
- ginga: Capoeira base movement
- martelo: Capoeira roundhouse
- armada: Capoeira spinning back kick

### Changed
- Intensity level "chaos" renamed to "bullet_time"
- Pose interpolation now uses easing functions instead of linear lerp
- Combat AI now considers choreography style for move selection
- Improved hit detection timing to match animation phases

### Technical
- ~2100 lines of code (was ~900)
- Added globalTime for synchronized effects
- slowMotion state object for bullet-time effects
- comboCount tracking per fighter

---

## [1.0.0] - 2025-01-17

### Added

#### Core Systems
- Hash-based deterministic randomness (sfc32 PRNG)
- Art Blocks `tokenData.hash` compatibility
- Feature extraction for `tokenData.features`

#### StickFigure Class
- Full skeletal animation system with 10 joint angles
- Smooth pose interpolation (20% lerp per frame)
- Joint position calculation with forward kinematics
- Health system with damage, blocking, invincibility

#### Move System
- Queue-based move execution
- 15+ unique moves: punch, kick, uppercut, roundhouse, flying_kick, aerial_kick, combo, walk, dash, jump, dodge_back, dodge_roll, block, flip, kata
- Per-move duration and pose setters
- AI decision making based on opponent distance

#### Environments (7 total)
- Dojo (common) - wooden walls, scrolls, lanterns
- Street (uncommon) - buildings, neon signs
- Nature (uncommon) - mountains, trees, grass
- Simulation (rare) - matrix grid, data streams
- Computer Chip (rare) - circuits, traces
- Inside Program (legendary) - code blocks, variables
- OS Desktop (legendary) - windows, icons, taskbar

#### Parallax System
- Multi-layer background rendering
- Per-layer depth-based scrolling
- Pixel art rendering with configurable pixel size
- Environment-specific element generation

#### Combat Features
- Attack hitboxes (hand/foot based)
- Damage calculation with blocking reduction
- Stun and invincibility frames
- Health bar rendering per fighter

#### Interactive Objects
- Crate: climbable, breakable
- Barrel: climbable, rollable
- Platform: elevated standing surface

#### Effects System
- Impact flashes on hit
- Motion trails for attacks (optional)
- Particle manager for effects

#### Victory System
- Last-fighter-standing detection
- 4 victory poses: fist_pump, bow, arms_crossed, crane
- Animation freeze on victory
- Victory overlay with winner display

#### Fight Modes
- 2-way battle (common)
- 3-way battle (uncommon)
- 4-way battle (rare)
- Solo training (legendary)

#### UI/Viewer
- Responsive HTML viewer (molecular-watercolor template)
- Live features table with rarity badges
- Mode indicator (Solo/Battle)
- Fighter and object count stats

### Technical
- 700x700 responsive canvas
- p5.js 1.9.0
- Class-based architecture
- ~900 lines of code

---

## Version Template

```markdown
## [X.X.X] - YYYY-MM-DD

### Added
### Changed
### Fixed
### Removed
```
