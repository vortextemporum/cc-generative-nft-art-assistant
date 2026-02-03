# Railway Sim - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      sketch.js                          │
├─────────────────────────────────────────────────────────┤
│  Hash & PRNG          │  Features System                │
│  ├── sfc32()          │  ├── generateFeatures()         │
│  ├── initRandom()     │  ├── TRAIN_TYPES                │
│  └── rnd/rndInt/etc   │  └── ENVIRONMENTS               │
├─────────────────────────────────────────────────────────┤
│  Network Layer        │  Train Layer                    │
│  ├── Node class       │  ├── Train class                │
│  ├── Track class      │  ├── update()                   │
│  └── generateNetwork()│  └── transitionToNextTrack()    │
├─────────────────────────────────────────────────────────┤
│  Rendering            │  Input                          │
│  ├── drawTracks()     │  ├── keyPressed()               │
│  ├── drawNodes()      │  ├── mousePressed()             │
│  ├── drawScenery()    │  └── dispatchTrain()            │
│  └── drawWeather()    │                                 │
└─────────────────────────────────────────────────────────┘
```

## Random Number Generation

### sfc32 PRNG

Small Fast Counter generator - cryptographically weak but excellent distribution:

```javascript
function sfc32(a, b, c, d) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
```

### Hash Parsing

64 hex characters split into 4 32-bit seeds:
```javascript
const seeds = [];
for (let i = 2; i < 66; i += 8) {
  seeds.push(parseInt(hashStr.slice(i, i + 8), 16));
}
```

## Network Generation Algorithm

### 1. Node Placement (Relaxation)

Places nodes with minimum distance constraint:

```javascript
for (let attempt = 0; attempt < 50; attempt++) {
  const x = margin + rnd(w);
  const y = margin + rnd(h);

  let minD = Infinity;
  for (const pos of positions) {
    minD = Math.min(minD, dist(x, y, pos.x, pos.y));
  }

  if (minD > bestMinDist) {
    bestMinDist = minD;
    bestPos = { x, y };
  }
}
```

### 2. Minimum Spanning Tree

Ensures all nodes are connected:

```javascript
while (connected.size < nodes.length) {
  let bestEdge = null;
  let bestDist = Infinity;

  for (const i of connected) {
    for (let j = 0; j < nodes.length; j++) {
      if (connected.has(j)) continue;
      const d = dist(nodes[i], nodes[j]);
      if (d < bestDist) {
        bestDist = d;
        bestEdge = [i, j];
      }
    }
  }

  edges.push(bestEdge);
  connected.add(bestEdge[1]);
}
```

### 3. Loop Creation

Adds extra edges based on proximity and probability:

```javascript
if (d < minDist * 2 && rndBool(features.loopProb)) {
  edges.push([i, j]);
}
```

## Train Physics

### Movement Model

```javascript
// Acceleration toward target
if (speed < targetSpeed) {
  speed = min(speed + accel, targetSpeed);
} else if (speed > targetSpeed) {
  speed = max(speed - accel * 2, targetSpeed);  // Brake faster
}

// Position update (normalized to track length)
const moveAmount = (speed * direction) / track.length;
position += moveAmount;
```

### Track Transition

When position exits [0, 1]:

1. Identify current node (nodeA if pos < 0, nodeB if pos > 1)
2. Get connections excluding current track
3. If switch node, use switchState to select exit
4. Determine direction on new track based on which end we entered

```javascript
if (nextTrack.nodeA === currentNode) {
  this.direction = 1;
  this.position = 0;
} else {
  this.direction = -1;
  this.position = 1;
}
```

## Collision Detection

Simple distance-based check every frame:

```javascript
for (let i = 0; i < trains.length; i++) {
  for (let j = i + 1; j < trains.length; j++) {
    const posA = trains[i].getPosition();
    const posB = trains[j].getPosition();

    if (dist(posA.x, posA.y, posB.x, posB.y) < 25) {
      trains[i].crash();
      trains[j].crash();
    }
  }
}
```

## Data Structures

### Node

```javascript
{
  x, y: number,           // Position
  id: number,             // Unique identifier
  connections: [{         // Adjacent nodes
    node: Node,
    lineId: number,
    trackId: number
  }],
  isStation: boolean,
  stationName: string,
  isSwitch: boolean,      // true if connections.length >= 3
  switchState: number     // Active connection index
}
```

### Track

```javascript
{
  id: number,
  nodeA: Node,
  nodeB: Node,
  lineId: number,         // Color line assignment
  length: number,         // Euclidean distance
  angle: number,          // atan2(dy, dx)
  hasSignal: boolean,
  signalState: boolean    // true = green
}
```

### Train

```javascript
{
  id: number,
  type: string,           // 'diesel', 'electric', etc.
  config: TrainTypeConfig,
  track: Track,           // Current track
  position: number,       // 0-1 along track
  direction: number,      // 1 or -1
  speed: number,          // Current speed
  targetSpeed: number,    // Desired speed
  crashed: boolean,
  crashTimer: number,
  length: number,
  selected: boolean
}
```

## Rendering Order

1. Background fill
2. Scenery (behind tracks)
3. Track beds (wide dark lines)
4. Rail lines (colored)
5. Sleepers (perpendicular ticks)
6. Signals
7. Nodes (stations, switches)
8. Trains
9. Weather overlay
10. UI elements (speedometer)

## Performance Considerations

- Node count capped at 24 for complex networks
- Scenery elements skip placement near tracks
- Collision check is O(n²) but n ≤ ~10 trains typical
- No spatial partitioning needed at this scale

## Extension Points

### Adding Track Curves

Would require:
1. Track class storing control points
2. `getPointAt(t)` using bezier interpolation
3. `getAngle(t)` from curve tangent
4. Updated drawing using `bezier()` or `curve()`

### AI Train Behavior

Would require:
1. Destination assignment per train
2. Pathfinding (BFS/Dijkstra on node graph)
3. Switch pre-configuration for routes
4. Speed adjustment for signals

### Multiplayer

Would require:
1. Network state serialization
2. WebSocket or WebRTC connection
3. Train ownership per player
4. Synchronized switch states
