/**
 * Feynman Strings - p5.brush Edition
 *
 * Hand-drawn aesthetic using p5.brush library.
 * Same generation logic, organic brush strokes.
 *
 * Performance: Uses simple brush types (pen/marker) for speed.
 */

// ============================================================
// BRUSH WRAPPER - Intercept p5 drawing calls
// ============================================================

let useBrush = true;
let currentBrushType = "pen";
let currentBrushWeight = 1;
let currentStrokeColor = "#000000";
let brushReady = false;

// Store original p5 functions
let _line, _ellipse, _circle, _arc, _beginShape, _vertex, _endShape, _bezierVertex, _curveVertex;
let shapeVertices = [];
let inShape = false;

function initBrushWrapper() {
  if (typeof brush === 'undefined') {
    console.warn("p5.brush not loaded, falling back to standard p5");
    useBrush = false;
    return;
  }

  // Initialize brush
  brush.load();
  brushReady = true;

  // Store original functions
  _line = window.line;
  _ellipse = window.ellipse;
  _circle = window.circle;
  _arc = window.arc;
  _beginShape = window.beginShape;
  _vertex = window.vertex;
  _endShape = window.endShape;
  _bezierVertex = window.bezierVertex;
  _curveVertex = window.curveVertex;

  // Override with brush versions
  window.line = brushLine;
  window.ellipse = brushEllipse;
  window.circle = brushCircle;
  window.arc = brushArc;
  window.beginShape = brushBeginShape;
  window.vertex = brushVertex;
  window.endShape = brushEndShape;
  window.bezierVertex = brushBezierVertex;
  window.curveVertex = brushCurveVertex;
}

function setBrushFromStroke() {
  if (!brushReady) return;

  // Get current stroke color and weight
  const ctx = drawingContext;
  currentStrokeColor = ctx.strokeStyle;
  currentBrushWeight = ctx.lineWidth * 0.8; // Slightly thinner for brush

  // Choose brush type based on weight
  if (currentBrushWeight < 1) {
    currentBrushType = "pen";
  } else if (currentBrushWeight < 2) {
    currentBrushType = "marker";
  } else {
    currentBrushType = "marker";
  }

  brush.set(currentBrushType, currentStrokeColor, currentBrushWeight);
}

function brushLine(x1, y1, x2, y2) {
  if (!brushReady || !useBrush) {
    return _line(x1, y1, x2, y2);
  }
  setBrushFromStroke();
  brush.line(x1, y1, x2, y2);
}

function brushEllipse(x, y, w, h) {
  if (!brushReady || !useBrush) {
    return _ellipse(x, y, w, h || w);
  }
  setBrushFromStroke();
  // p5.brush doesn't have ellipse, approximate with polygon
  const segments = Math.max(12, Math.min(36, Math.floor((w + (h || w)) / 4)));
  const points = [];
  for (let i = 0; i < segments; i++) {
    const angle = (TWO_PI / segments) * i;
    points.push([
      x + cos(angle) * w / 2,
      y + sin(angle) * (h || w) / 2
    ]);
  }
  brush.polygon(points);
}

function brushCircle(x, y, d) {
  brushEllipse(x, y, d, d);
}

function brushArc(x, y, w, h, start, stop, mode) {
  if (!brushReady || !useBrush) {
    return _arc(x, y, w, h, start, stop, mode);
  }
  setBrushFromStroke();

  // Draw arc as series of line segments
  const segments = Math.max(8, Math.floor((stop - start) / 0.1));
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const angle = start + (stop - start) * (i / segments);
    points.push([
      x + cos(angle) * w / 2,
      y + sin(angle) * h / 2
    ]);
  }

  // Draw as connected lines
  for (let i = 0; i < points.length - 1; i++) {
    brush.line(points[i][0], points[i][1], points[i+1][0], points[i+1][1]);
  }
}

function brushBeginShape() {
  shapeVertices = [];
  inShape = true;
}

function brushVertex(x, y) {
  if (inShape) {
    shapeVertices.push([x, y]);
  }
}

function brushBezierVertex(cx1, cy1, cx2, cy2, x, y) {
  // Approximate bezier with line segments
  if (!inShape || shapeVertices.length === 0) return;

  const last = shapeVertices[shapeVertices.length - 1];
  const steps = 8;
  for (let t = 1; t <= steps; t++) {
    const tt = t / steps;
    const u = 1 - tt;
    const px = u*u*u*last[0] + 3*u*u*tt*cx1 + 3*u*tt*tt*cx2 + tt*tt*tt*x;
    const py = u*u*u*last[1] + 3*u*u*tt*cy1 + 3*u*tt*tt*cy2 + tt*tt*tt*y;
    shapeVertices.push([px, py]);
  }
}

function brushCurveVertex(x, y) {
  // Just add as regular vertex for simplicity
  if (inShape) {
    shapeVertices.push([x, y]);
  }
}

function brushEndShape(mode) {
  if (!brushReady || !useBrush) {
    _beginShape();
    for (const v of shapeVertices) {
      _vertex(v[0], v[1]);
    }
    _endShape(mode);
    inShape = false;
    return;
  }

  if (shapeVertices.length < 2) {
    inShape = false;
    return;
  }

  setBrushFromStroke();

  // Draw as connected lines
  for (let i = 0; i < shapeVertices.length - 1; i++) {
    brush.line(
      shapeVertices[i][0], shapeVertices[i][1],
      shapeVertices[i+1][0], shapeVertices[i+1][1]
    );
  }

  // Close shape if requested
  if (mode === CLOSE && shapeVertices.length > 2) {
    brush.line(
      shapeVertices[shapeVertices.length-1][0],
      shapeVertices[shapeVertices.length-1][1],
      shapeVertices[0][0],
      shapeVertices[0][1]
    );
  }

  inShape = false;
}

// Toggle brush on/off for performance comparison
function toggleBrush() {
  useBrush = !useBrush;
  console.log("Brush mode:", useBrush ? "ON" : "OFF");
  render();
}

// ============================================================
// Now include the original sketch code
// The brush wrapper will intercept drawing calls
// ============================================================
