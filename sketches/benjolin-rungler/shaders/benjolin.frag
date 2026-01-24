// Benjolin Rungler - GLSL Fragment Shader v2.0.0
// Inspired by Rob Hordijk's Benjolin synthesizer
// 4 Visual Modes: Waveform, Scope, Pixel, Filter

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
// MODE 0: WAVEFORM
// Smooth audio waveform visualization
// ============================================

vec3 modeWaveform(vec2 uv, Oscillators osc, float t) {
    vec3 col = vec3(0.0);

    // Center coordinates
    vec2 p = uv * 2.0 - 1.0;

    // Number of waveform channels based on rungler
    float numChannels = 3.0 + floor(osc.rungler * 3.0);
    float channelHeight = 1.8 / numChannels;

    // Draw multiple waveform channels
    for (float i = 0.0; i < 6.0; i++) {
        if (i >= numChannels) break;

        // Channel vertical position
        float channelY = -0.9 + channelHeight * (i + 0.5);

        // Unique wave parameters per channel
        float freqMult = 1.0 + i * 0.3 * uOscRatio;
        float phaseOffset = i * 0.7 + osc.osc1 * 0.5;
        float ampMod = 0.5 + 0.5 * sin(t * uSpeed * 0.3 + i);

        // Complex waveform from oscillators
        float wave = 0.0;
        wave += sin(p.x * 8.0 * freqMult + t * uSpeed * 2.0 + phaseOffset) * 0.4;
        wave += sin(p.x * 12.0 * freqMult * uOscRatio + t * uSpeed * 3.0 + osc.osc2) * 0.3;
        wave += osc.rungler * sin(p.x * 20.0 + t * uSpeed) * 0.2;

        // Apply amplitude envelope
        wave *= ampMod * channelHeight * 0.4;

        // Waveform line
        float waveY = channelY + wave;
        float dist = abs(p.y - waveY);

        // Glow effect
        float glow = exp(-dist * 40.0) * 0.8;
        float line = exp(-dist * 100.0);

        // Channel color based on index
        vec3 channelColor;
        if (i < 1.5) {
            channelColor = vec3(0.2, 1.0, 0.5); // Green
        } else if (i < 3.5) {
            channelColor = vec3(0.3, 0.7, 1.0); // Cyan
        } else {
            channelColor = vec3(1.0, 0.4, 0.6); // Pink
        }

        col += channelColor * (glow + line);

        // Channel separator line (subtle)
        float sepY = channelY - channelHeight * 0.5;
        float sep = exp(-abs(p.y - sepY) * 200.0) * 0.1;
        col += vec3(0.2, 0.3, 0.4) * sep;
    }

    // Add subtle grid lines
    float gridX = sin(p.x * 30.0) * 0.5 + 0.5;
    gridX = smoothstep(0.98, 1.0, gridX);
    col += vec3(0.05, 0.08, 0.1) * gridX;

    // RGB offset for depth
    vec2 uvR = uv + vec2(uRgbOffset * 0.5, 0.0);
    vec2 uvB = uv - vec2(uRgbOffset * 0.5, 0.0);
    float pR = (uvR.x * 2.0 - 1.0);
    float pB = (uvB.x * 2.0 - 1.0);

    float waveR = sin(pR * 8.0 + t * uSpeed * 2.0) * 0.15;
    float waveB = sin(pB * 8.0 + t * uSpeed * 2.0) * 0.15;

    col.r += exp(-abs(p.y - waveR) * 60.0) * 0.15;
    col.b += exp(-abs(p.y - waveB) * 60.0) * 0.15;

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
// MODE 3: FILTER RESONANCE
// Filter frequency response visualization
// ============================================

vec3 modeFilter(vec2 uv, Oscillators osc, float t) {
    vec3 col = vec3(0.0);

    // Center coordinates
    vec2 p = uv * 2.0 - 1.0;

    // Filter cutoff frequency sweeps based on oscillators
    float cutoff = 0.3 + 0.5 * (0.5 + 0.5 * osc.osc1);
    float resonance = 0.5 + 0.4 * osc.osc2;

    // Frequency axis (x) - log scale feel
    float freq = pow(uv.x, 1.5);

    // Multiple filter sweeps at different cutoffs
    for (float i = 0.0; i < 4.0; i++) {
        // Sweep the cutoff over time
        float sweepPhase = t * uSpeed * 0.5 + i * 0.25 + osc.rungler * 0.3;
        float sweepCutoff = 0.2 + 0.6 * (0.5 + 0.5 * sin(sweepPhase * TAU));

        // Resonant peak response curve
        float freqRatio = freq / sweepCutoff;
        float response;

        if (freqRatio < 1.0) {
            // Below cutoff - mostly flat
            response = 0.9 - 0.1 * pow(1.0 - freqRatio, 2.0);
        } else {
            // Above cutoff - rolloff with resonant peak
            float rolloff = 1.0 / (1.0 + pow(freqRatio - 1.0, 2.0) * 4.0);
            float peak = exp(-pow(freqRatio - 1.0, 2.0) * 20.0) * resonance * 2.0;
            response = rolloff * 0.5 + peak;
        }

        // Map response to y position
        float responseY = -0.8 + response * 1.4;

        // Draw the curve
        float dist = abs(p.y - responseY);
        float age = 1.0 - i * 0.2;
        float glow = exp(-dist * 30.0) * age * 0.6;
        float line = exp(-dist * 80.0) * age;

        // Color based on sweep index
        vec3 sweepColor;
        if (i < 1.0) {
            sweepColor = vec3(0.2, 1.0, 0.6);  // Primary - green
        } else if (i < 2.0) {
            sweepColor = vec3(0.3, 0.8, 1.0);  // Cyan
        } else if (i < 3.0) {
            sweepColor = vec3(1.0, 0.5, 0.3);  // Orange
        } else {
            sweepColor = vec3(0.8, 0.3, 1.0);  // Purple
        }

        col += sweepColor * (glow + line);

        // Resonant peak marker
        float peakX = sweepCutoff;
        float peakDist = length(vec2(uv.x - peakX, p.y - responseY + 0.1));
        float peakGlow = exp(-peakDist * 40.0) * resonance * age;
        col += sweepColor * peakGlow * 0.5;
    }

    // Frequency grid lines (vertical)
    for (float f = 0.1; f < 1.0; f += 0.15) {
        float gridDist = abs(uv.x - f);
        float gridLine = exp(-gridDist * 200.0) * 0.15;
        col += vec3(0.2, 0.25, 0.3) * gridLine;
    }

    // dB grid lines (horizontal)
    for (float db = -0.6; db < 0.8; db += 0.3) {
        float gridDist = abs(p.y - db);
        float gridLine = exp(-gridDist * 200.0) * 0.1;
        col += vec3(0.2, 0.25, 0.3) * gridLine;
    }

    // Zero dB reference line
    float zeroDB = exp(-abs(p.y + 0.2) * 150.0) * 0.2;
    col += vec3(0.4, 0.4, 0.5) * zeroDB;

    // RGB chromatic offset
    vec2 uvR = uv + vec2(uRgbOffset, 0.0);
    vec2 uvB = uv - vec2(uRgbOffset, 0.0);

    float freqR = pow(uvR.x, 1.5) / cutoff;
    float freqB = pow(uvB.x, 1.5) / cutoff;

    float respR = exp(-pow(freqR - 1.0, 2.0) * 20.0) * resonance;
    float respB = exp(-pow(freqB - 1.0, 2.0) * 20.0) * resonance;

    col.r += respR * 0.15;
    col.b += respB * 0.15;

    // Subtle vignette
    float vig = 1.0 - dot(p * 0.3, p * 0.3);
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
        col = modeWaveform(uv, osc, t);
    } else if (uMode == 1) {
        col = modeScope(uv, osc, t);
    } else if (uMode == 2) {
        col = modePixel(uv, osc, t);
    } else {
        col = modeFilter(uv, osc, t);
    }

    // Feedback blend
    vec4 feedback = texture2D(uFeedback, uv);
    col = mix(col, feedback.rgb, uFeedbackAmt * 0.7);

    // Final color adjustments
    col = clamp(col, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
}
