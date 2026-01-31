# p5.brush Library Reference

p5.brush (by Alejandro Campos Uribe) adds natural media simulation to p5.js. Used in Art Blocks projects like Hatches by Rob Dixon.

## Installation

```html
<script src="https://cdn.jsdelivr.net/npm/p5.brush@1.1/dist/p5.brush.js"></script>
```

Or via npm:
```bash
npm install p5.brush
```

## Basic Setup

```javascript
function setup() {
    createCanvas(700, 700);
    brush.load();  // Required: initialize brush system
}

function draw() {
    brush.set("pencil", "#333333", 1);  // brush type, color, weight
    brush.line(100, 100, 600, 600);
}
```

## Brush Types

| Type | Description | Best For |
|------|-------------|----------|
| `pencil` | Graphite pencil texture | Sketchy lines, shading |
| `pen` | Ink pen, smooth lines | Clean linework |
| `marker` | Felt-tip marker | Bold strokes |
| `spray` | Spray paint effect | Gradients, atmosphere |
| `cpencil` | Colored pencil | Soft colored strokes |

### Custom Brushes
```javascript
brush.add("myBrush", {
    type: "spray",
    weight: 2,
    vibration: 0.5,
    spacing: 0.1,
    blend: true
});
```

## Hatching

Cross-hatching fills shapes with parallel lines.

```javascript
// Enable hatching
brush.hatch(distance, angle, options);
// distance: line spacing in pixels (smaller = denser)
// angle: rotation in radians
// options: { curve: 0-1, rand: 0-1, continuous: bool }

// Draw hatched shapes
brush.rect(x, y, w, h);
brush.circle(x, y, d);
brush.polygon(points);

// Disable hatching
brush.noHatch();
```

### Hatching Options
```javascript
brush.hatch(5, PI/4, {
    curve: 0.3,      // Line curvature (0 = straight, 1 = very curved)
    rand: 0.2,       // Randomness in spacing/angle
    continuous: true // Lines connect across shape
});
```

### Multiple Hatch Passes
```javascript
// Cross-hatch effect
brush.hatch(8, 0);
brush.rect(100, 100, 200, 200);
brush.hatch(8, PI/2);
brush.rect(100, 100, 200, 200);
brush.noHatch();
```

## Watercolor Effects

### Bleed Effect
```javascript
// Pigment bleeds at edges
brush.bleed(amount, direction);
// amount: bleed intensity (0.0001 - 0.001 typical)
// direction: "in" (bleeds inward) or "out" (bleeds outward)

brush.bleed(0.0002, "in");
brush.fill("#3498db", 240);  // color, opacity (0-255)
brush.rect(100, 100, 200, 200);
brush.noBleed();
```

### Fill Texture
```javascript
// Add paper grain texture
brush.fillTexture(amount, intensity);
// amount: texture density (0-1)
// intensity: texture visibility (0-1)

brush.fillTexture(0.2, 0.2);
brush.fill("#e74c3c", 200);
brush.circle(300, 300, 150);
brush.noFillTexture();
```

### Combining Effects
```javascript
// Watercolor wash with texture
brush.bleed(0.0003, "in");
brush.fillTexture(0.3, 0.15);
brush.fill("#2ecc71", 180);
brush.rect(50, 50, 300, 300);

// Clean up
brush.noBleed();
brush.noFillTexture();
```

## Drawing Primitives

```javascript
// Lines
brush.line(x1, y1, x2, y2);
brush.curve(points);  // array of [x, y] points

// Shapes
brush.rect(x, y, w, h);
brush.circle(x, y, diameter);
brush.ellipse(x, y, w, h);
brush.polygon(points);  // array of [x, y] points

// Paths
brush.beginShape();
brush.vertex(x, y);
brush.vertex(x2, y2);
brush.endShape(CLOSE);  // or leave empty for open path
```

## Color Mixing

```javascript
// Set stroke color
brush.stroke(color);
brush.strokeWeight(weight);

// Set fill color
brush.fill(color, opacity);

// No stroke/fill
brush.noStroke();
brush.noFill();
```

## Example: Watercolor Landscape

```javascript
function setup() {
    createCanvas(700, 700);
    brush.load();
    background(245);

    // Sky
    brush.bleed(0.0002, "in");
    brush.fillTexture(0.2, 0.1);
    brush.fill("#87CEEB", 150);
    brush.rect(0, 0, 700, 400);

    // Hills
    brush.fill("#228B22", 180);
    brush.beginShape();
    brush.vertex(0, 400);
    brush.vertex(200, 350);
    brush.vertex(400, 380);
    brush.vertex(600, 340);
    brush.vertex(700, 370);
    brush.vertex(700, 700);
    brush.vertex(0, 700);
    brush.endShape(CLOSE);

    // Trees with hatching
    brush.noBleed();
    brush.noFillTexture();
    brush.set("pencil", "#1a4d1a", 0.5);
    brush.hatch(3, PI/6, { rand: 0.3 });
    brush.circle(150, 380, 80);
    brush.circle(500, 360, 100);
    brush.noHatch();
}
```

## Performance Tips

- Call `brush.load()` only once in setup()
- Use larger hatch distances for better performance
- Limit bleed amount to avoid slow rendering
- For animation, redraw only changed areas if possible

## Spectral Color Mixing

For realistic pigment mixing (blue + yellow = green), use spectral mixing:

```javascript
// Requires spectral.js library
// Mixes colors based on light wavelengths, not RGB values
let mixed = spectral.mix("#0000ff", "#ffff00", 0.5);
// Result is green, not gray like RGB mixing would produce
```

This is especially useful for watercolor effects where pigment mixing should look natural.
