# BLOB-FORMS Technical Documentation

## Algorithm (Exact Port)

### Original 2D Code
```javascript
// Generate points around ring
for (let p = 0; p < numPoints; p++) {
  let a = p * TWO_PI / numPoints;
  let r = baseRadius + random(-radiusRandomness*baseRadius, radiusRandomness*baseRadius);
  let bp = { x: cos(a)*r, y: sin(a)*r, angle: a, cp: [] };
  blobPoints.push(bp);
}

// Add control points
for (let b = 0; b < blobPoints.length; b++) {
  let thisp = blobPoints[b];
  let randomangle = random(-cpOffsetAngle, cpOffsetAngle);
  let cp1angle = thisp.angle - (HALF_PI + randomangle);
  let cp2angle = thisp.angle + (HALF_PI - randomangle);
  cp1 = { x: thisp.x + cos(cp1angle)*cpDist, y: thisp.y + sin(cp1angle)*cpDist };
  cp2 = { x: thisp.x + cos(cp2angle)*cpDist, y: thisp.y + sin(cp2angle)*cpDist };
  thisp.cp = [cp1, cp2];
}
```

### 3D Extension

1. **buildBlobPoints()** - Exact port of above
2. **sampleBlobProfile()** - Cubic bezier sampling between points
3. **profileToLathePoints()** - Extract right half, convert to Vector2
4. **LatheGeometry** - Revolve around Y axis

## Bezier Sampling

```javascript
function bezierPoint(t, p0, cp0, cp1, p1) {
  const mt = 1 - t;
  return {
    x: mt³*p0.x + 3*mt²*t*cp0.x + 3*mt*t²*cp1.x + t³*p1.x,
    y: mt³*p0.y + 3*mt²*t*cp0.y + 3*mt*t²*cp1.y + t³*p1.y
  };
}
```

## Lathe Conversion

LatheGeometry expects Vector2 array where:
- x = distance from Y axis (radius)
- y = height

We take the right half of the blob profile (x >= 0) and use absolute x as radius.
