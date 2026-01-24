// Benjolin Rungler - GLSL Fragment Shader
// Inspired by Rob Hordijk's Benjolin synthesizer
// 4 Visual Modes: Circuit, Scope, Pixel, Hybrid

precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uFrame;
uniform sampler2D uFeedback;

// Hash-derived parameters (set from JS)
uniform int uMode;              // 0=Circuit, 1=Scope, 2=Pixel, 3=Hybrid
uniform float uOscRatio;        // Oscillator frequency ratio (0.1 - 4.0)
uniform float uRunglerBits;     // Shift register length (4-16)
uniform float uFeedbackAmt;     // Feedback intensity (0.0 - 0.95)
uniform float uRgbOffset;       // RGB phase offset (0.0 - 0.1)
uniform float uSpeed;           // Animation speed multiplier (0.5 - 2.0)

// Constants
#define PI 3.14159265359
#define TAU 6.28318530718

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Pseudo-random hash
float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123);
}

// Smooth noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal noise
float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
        if (i >= octaves) break;
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Quantize value to steps
float quantize(float v, float steps) {
    return floor(v * steps) / steps;
}

vec2 quantize2(vec2 v, float steps) {
    return floor(v * steps) / steps;
}

// ============================================
// BENJOLIN OSCILLATORS
// ============================================

// Chaotic oscillator with cross-modulation
// Inspired by Benjolin's dual triangle-core VCOs
struct Oscillators {
    float osc1;
    float osc2;
    float rungler;
};

Oscillators benjolin(float t, vec2 uv) {
    float speed = uSpeed;
    float ratio = uOscRatio;

    // Base frequencies with slight spatial variation
    float f1 = 0.7 + 0.3 * sin(uv.x * PI);
    float f2 = f1 * ratio + 0.2 * sin(uv.y * PI);

    // Cross-modulation (the heart of Benjolin chaos)
    float mod1 = sin(t * speed * f2 * TAU + uv.y * 4.0);
    float mod2 = sin(t * speed * f1 * TAU + uv.x * 4.0);

    // Triangle-ish oscillators with FM
    float osc1 = sin(t * speed * f1 * TAU + mod2 * 2.0 + uv.x * 3.0);
    float osc2 = sin(t * speed * f2 * TAU * 1.3 + mod1 * 2.5 + uv.y * 3.0);

    // Add some chaos via feedback between oscillators
    osc1 += 0.3 * sin(osc2 * PI + t * speed * 0.7);
    osc2 += 0.3 * sin(osc1 * PI + t * speed * 0.9);

    // Rungler: shift register simulation
    // Sample osc1 at osc2's zero crossings (conceptually)
    float runglerClock = step(0.0, osc2) - step(0.0, sin((t - 0.01) * speed * f2 * TAU * 1.3));
    float bits = uRunglerBits;

    // Create stepped random value that updates at clock rate
    float runglerPhase = floor(t * speed * f2 * 2.0);
    float rungler = 0.0;
    for (float i = 0.0; i < 16.0; i++) {
        if (i >= bits) break;
        float bitVal = step(0.5, hash(runglerPhase + i * 0.1 + uv.x * 100.0 + uv.y * 50.0));
        rungler += bitVal * pow(2.0, -i - 1.0);
    }
    rungler = rungler * 2.0 - 0.5; // Center around 0

    return Oscillators(osc1, osc2, rungler);
}

// ============================================
// MODE 0: CIRCUIT BOARD
// ============================================

vec3 modeCircuit(vec2 uv, Oscillators osc, float t) {
    vec3 col = vec3(0.0);

    // Grid scale based on rungler
    float gridSize = 16.0 + floor(osc.rungler * 8.0) * 4.0;
    vec2 grid = uv * gridSize;
    vec2 gridId = floor(grid);
    vec2 gridUv = fract(grid);

    // Node positions influenced by oscillators
    vec2 nodeOffset = vec2(
        osc.osc1 * 0.3,
        osc.osc2 * 0.3
    );

    // Horizontal traces
    float hTrace = smoothstep(0.48, 0.5, gridUv.y) - smoothstep(0.5, 0.52, gridUv.y);
    float hActive = step(0.3, hash2(gridId + vec2(100.0, 0.0)));
    hActive *= step(0.0, sin(t * uSpeed * 2.0 + gridId.x * 0.5 + osc.osc1 * PI));

    // Vertical traces
    float vTrace = smoothstep(0.48, 0.5, gridUv.x) - smoothstep(0.5, 0.52, gridUv.x);
    float vActive = step(0.3, hash2(gridId + vec2(0.0, 200.0)));
    vActive *= step(0.0, sin(t * uSpeed * 1.7 + gridId.y * 0.5 + osc.osc2 * PI));

    // Combine traces
    float trace = max(hTrace * hActive, vTrace * vActive);

    // Node terminals at intersections
    float terminalChance = hash2(gridId) * 0.7 + 0.3 * osc.rungler;
    vec2 center = vec2(0.5) + nodeOffset * 0.2;
    float dist = length(gridUv - center);
    float terminal = smoothstep(0.15, 0.12, dist) * step(0.6, terminalChance);
    float terminalRing = smoothstep(0.18, 0.15, dist) - smoothstep(0.15, 0.12, dist);
    terminalRing *= step(0.6, terminalChance);

    // Signal flow (moving dots along traces)
    float flowH = fract(gridUv.x - t * uSpeed * 2.0 * sign(osc.osc1));
    float flowV = fract(gridUv.y - t * uSpeed * 1.5 * sign(osc.osc2));
    float signal = smoothstep(0.1, 0.0, abs(flowH - 0.5)) * hTrace * hActive;
    signal += smoothstep(0.1, 0.0, abs(flowV - 0.5)) * vTrace * vActive;

    // RGB channel separation for traces
    float rOffset = uRgbOffset;
    vec2 uvR = uv + vec2(rOffset, 0.0);
    vec2 uvB = uv - vec2(rOffset, 0.0);

    vec2 gridR = uvR * gridSize;
    vec2 gridB = uvB * gridSize;
    float traceR = smoothstep(0.48, 0.5, fract(gridR.y)) - smoothstep(0.5, 0.52, fract(gridR.y));
    float traceB = smoothstep(0.48, 0.5, fract(gridB.y)) - smoothstep(0.5, 0.52, fract(gridB.y));

    // Build color
    col.r = trace * 0.3 + traceR * hActive * 0.4 + signal * 0.8 + terminal * 0.9;
    col.g = trace * 0.8 + signal * 1.0 + terminal * 0.5 + terminalRing * 0.6;
    col.b = trace * 0.3 + traceB * vActive * 0.4 + terminal * 0.9 + terminalRing * 0.3;

    return col;
}

// ============================================
// MODE 1: OSCILLOSCOPE
// ============================================

vec3 modeScope(vec2 uv, Oscillators osc, float t) {
    vec3 col = vec3(0.0);

    // Center coordinates
    vec2 p = uv * 2.0 - 1.0;

    // Multiple Lissajous curves with different phase offsets
    for (float i = 0.0; i < 5.0; i++) {
        float phase = i * 0.2 + osc.rungler * 0.5;
        float freqMult = 1.0 + i * 0.1 * osc.osc1;

        // Lissajous parameters modulated by oscillators
        float a = 3.0 + osc.osc1 * 2.0;
        float b = 2.0 + osc.osc2 * 1.5 * uOscRatio;
        float delta = phase + t * uSpeed * 0.5;

        // Calculate distance to Lissajous curve
        float minDist = 1000.0;
        for (float j = 0.0; j < 100.0; j++) {
            float tj = j / 100.0 * TAU;
            vec2 liss = vec2(
                sin(a * tj + delta) * (0.6 + 0.2 * osc.rungler),
                sin(b * tj) * (0.6 + 0.2 * osc.rungler)
            );
            minDist = min(minDist, length(p - liss));
        }

        // Glow intensity with time-based flicker
        float intensity = exp(-minDist * 30.0) * (0.7 + 0.3 * sin(t * uSpeed * 10.0 + i));
        float age = 1.0 - i * 0.15; // Older traces fade

        // RGB separation on glow
        float rDist = length(p + vec2(uRgbOffset, 0.0));
        float bDist = length(p - vec2(uRgbOffset, 0.0));

        col.r += intensity * age * (0.3 + 0.7 * exp(-minDist * 20.0));
        col.g += intensity * age;
        col.b += intensity * age * (0.3 + 0.7 * exp(-minDist * 20.0));
    }

    // Add waveform trace at bottom (like scope time display)
    float waveY = -0.7;
    float wave1 = sin(p.x * 20.0 + t * uSpeed * 5.0) * 0.1 * osc.osc1;
    float wave2 = sin(p.x * 20.0 * uOscRatio + t * uSpeed * 5.0 * uOscRatio) * 0.1 * osc.osc2;

    float waveDist1 = abs(p.y - waveY - wave1);
    float waveDist2 = abs(p.y - waveY - 0.25 - wave2);

    col.g += exp(-waveDist1 * 50.0) * 0.5;
    col.r += exp(-waveDist2 * 50.0) * 0.4;
    col.b += exp(-waveDist2 * 50.0) * 0.4;

    // Stepped rungler display (like CV meter)
    float runglerBar = step(p.x, osc.rungler * 0.8) * step(-0.95, p.y) * step(p.y, -0.85);
    col += vec3(0.2, 0.5, 0.3) * runglerBar;

    // Smooth glow falloff
    col = pow(col, vec3(0.85));

    return col;
}

// ============================================
// MODE 2: PIXEL CHAOS
// ============================================

vec3 modePixel(vec2 uv, Oscillators osc, float t) {
    vec3 col = vec3(0.0);

    // Bitcrushed resolution (changes with rungler)
    float res = 32.0 + floor(osc.rungler * 32.0 + 32.0);
    vec2 pixelUv = floor(uv * res) / res;
    vec2 pixelId = floor(uv * res);

    // Shift register visualization
    // Each row represents a bit in the register
    float bits = uRunglerBits;
    float rowHeight = 1.0 / bits;
    float currentBit = floor(uv.y * bits);

    // Shift animation based on oscillator
    float shiftSpeed = 5.0 * uSpeed;
    float shiftOffset = floor(t * shiftSpeed + osc.osc2 * 2.0);

    // Calculate bit value for this pixel
    float bitPhase = currentBit + shiftOffset + pixelId.x * 0.3;
    float bitValue = step(0.5, hash(bitPhase + floor(osc.osc1 * 10.0)));

    // Quantized color based on position and oscillators
    float hue = quantize(pixelUv.x + osc.osc1 * 0.3 + t * uSpeed * 0.1, 8.0);
    float sat = 0.7 + 0.3 * osc.osc2;
    float val = bitValue * (0.5 + 0.5 * osc.rungler);

    // HSV to RGB
    vec3 c = vec3(hue, sat, val);
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p2 = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    vec3 hsv = c.z * mix(K.xxx, clamp(p2 - K.xxx, 0.0, 1.0), c.y);

    col = hsv;

    // Subtle RGB channel offset (chromatic aberration)
    vec2 uvR = uv + vec2(uRgbOffset * 0.5, 0.0);
    vec2 uvB = uv - vec2(uRgbOffset * 0.5, 0.0);

    float bitR = step(0.5, hash(floor(uvR.y * bits) + shiftOffset + floor(uvR.x * res) * 0.3));
    float bitB = step(0.5, hash(floor(uvB.y * bits) + shiftOffset + floor(uvB.x * res) * 0.3));

    col.r = mix(col.r, bitR, 0.15);
    col.b = mix(col.b, bitB, 0.15);

    return col;
}

// ============================================
// MODE 3: HYBRID LAYERS
// ============================================

vec3 modeHybrid(vec2 uv, Oscillators osc, float t) {
    // Layer 1: Scope (background) - clean Lissajous
    vec3 scopeLayer = modeScope(uv, osc, t) * 0.5;

    // Layer 2: Circuit (foreground)
    vec3 circuitLayer = modeCircuit(uv, osc, t);

    // Blend based on circuit intensity
    float circuitMask = smoothstep(0.0, 0.5, circuitLayer.g + circuitLayer.r);
    vec3 col = mix(scopeLayer, circuitLayer, circuitMask);

    // Subtle RGB offset
    vec2 uvR = uv + vec2(uRgbOffset, 0.0);
    vec2 uvB = uv - vec2(uRgbOffset, 0.0);

    Oscillators oscR = benjolin(t, uvR);
    Oscillators oscB = benjolin(t, uvB);

    vec3 circuitR = modeCircuit(uvR, oscR, t);
    vec3 circuitB = modeCircuit(uvB, oscB, t);

    col.r = mix(col.r, circuitR.r, 0.2);
    col.b = mix(col.b, circuitB.b, 0.2);

    // Soft vignette
    vec2 vigUv = uv * 2.0 - 1.0;
    float vig = 1.0 - dot(vigUv * 0.4, vigUv * 0.4);
    col *= vig;

    return col;
}

// ============================================
// MAIN
// ============================================

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float t = uTime;

    // Calculate oscillators
    Oscillators osc = benjolin(t, uv);

    // Select mode
    vec3 col;
    if (uMode == 0) {
        col = modeCircuit(uv, osc, t);
    } else if (uMode == 1) {
        col = modeScope(uv, osc, t);
    } else if (uMode == 2) {
        col = modePixel(uv, osc, t);
    } else {
        col = modeHybrid(uv, osc, t);
    }

    // Feedback blend
    vec4 feedback = texture2D(uFeedback, uv);
    col = mix(col, feedback.rgb, uFeedbackAmt * 0.7);

    // Final color adjustments
    col = clamp(col, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
}
