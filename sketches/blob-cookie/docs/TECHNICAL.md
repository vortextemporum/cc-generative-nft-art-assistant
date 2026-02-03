# Technical

## Shape Creation

```javascript
const shape = new THREE.Shape();
shape.moveTo(blobPoints[0].x, blobPoints[0].y);

for (let b = 0; b < blobPoints.length; b++) {
  const curr = blobPoints[b];
  const next = blobPoints[(b + 1) % blobPoints.length];

  shape.bezierCurveTo(
    curr.cp[1].x, curr.cp[1].y,  // Outgoing control point
    next.cp[0].x, next.cp[0].y,  // Incoming control point
    next.x, next.y               // End point
  );
}
```

## Extrusion

```javascript
const extrudeSettings = {
  depth: features.depth,
  bevelEnabled: true,
  bevelThickness: features.bevelSize,
  bevelSize: features.bevelSize,
  bevelSegments: features.bevelSegments
};

const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
```

## Why Extrusion Preserves Negative Space

- LatheGeometry revolves around axis, filling concave areas
- ExtrudeGeometry just adds depth to the exact 2D shape
- Result: concave parts remain concave in 3D
