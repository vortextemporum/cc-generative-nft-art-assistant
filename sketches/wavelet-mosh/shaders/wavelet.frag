// Fragment shader for wavelet-mosh
// Massively expanded version with 10 patterns, 24 palettes, 24 wavelets
// WebGL 1.0 compatible for maximum browser support

precision highp float;

varying vec2 v_uv;

// Uniforms
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_seed;

// Feature uniforms (hash-derived)
uniform int u_patternType;      // 0-9
uniform int u_waveletType;      // 0-23
uniform int u_paletteIndex;     // 0-23
uniform float u_animSpeed;      // 0.1-3.0
uniform int u_decompLevels;     // 1-8
uniform float u_glitchAmount;   // 0.0-1.0

// Constants
#define PI 3.14159265359
#define TAU 6.28318530718

// ============================================
// PRNG & NOISE
// ============================================

float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p, int oct) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) {
        if (i >= oct) break;
        v += a * noise(p);
        p *= 2.0; a *= 0.5;
    }
    return v;
}

// ============================================
// 10 BASE PATTERNS
// ============================================

vec3 pattern0(vec2 uv, float t, float s) { // Blocks
    float gs = 8.0 + s * 16.0;
    vec2 id = floor(uv * gs);
    vec2 gv = fract(uv * gs);
    float h1 = hash(id + s), h2 = hash(id + s + 100.0);
    float shift = sin(t * 0.5 + h1 * TAU) * 0.3;
    float val = h1 + shift + sin(t * (1.0 + h2 * 2.0)) * 0.2 * step(0.7, h2);
    return vec3(val);
}

vec3 pattern1(vec2 uv, float t, float s) { // Noise layers
    vec2 p = uv * 3.0 + s * 10.0;
    return vec3(fbm(p + t * 0.1, 4), fbm(p * 2.0 - t * 0.15, 3), fbm(p * 0.5 + t * 0.05, 5));
}

vec3 pattern2(vec2 uv, float t, float s) { // Circles
    vec3 col = vec3(0.0);
    for (int i = 0; i < 8; i++) {
        float fi = float(i);
        vec2 c = vec2(hash(vec2(fi, s)), hash(vec2(fi + 10.0, s))) * 0.8 + 0.1;
        float r = hash(vec2(fi + 20.0, s)) * 0.2 + 0.05;
        float d = length(uv - c) - r - sin(t * (0.5 + fi * 0.1)) * 0.02;
        col += vec3(smoothstep(0.02, 0.0, abs(d)) * 0.8) * hash(vec2(fi + 30.0, s));
    }
    return clamp(col, 0.0, 1.0);
}

vec3 pattern3(vec2 uv, float t, float s) { // Stripes
    float angle = s * TAU;
    vec2 rot = vec2(cos(angle), sin(angle));
    float stripe = sin(dot(uv, rot) * (20.0 + s * 30.0) + t);
    float stripe2 = sin(dot(uv, vec2(-rot.y, rot.x)) * (15.0 + s * 20.0) - t * 0.7);
    return vec3(stripe * 0.5 + 0.5, stripe2 * 0.5 + 0.5, (stripe + stripe2) * 0.25 + 0.5);
}

vec3 pattern4(vec2 uv, float t, float s) { // Voronoi
    vec2 p = uv * (4.0 + s * 6.0);
    vec2 n = floor(p), f = fract(p);
    float md = 8.0;
    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = vec2(hash(n + g + s), hash(n + g + s + 50.0));
            o = 0.5 + 0.5 * sin(t * 0.5 + TAU * o);
            float d = length(g + o - f);
            md = min(md, d);
        }
    }
    return vec3(md);
}

vec3 pattern5(vec2 uv, float t, float s) { // Plasma
    float v = sin(uv.x * 10.0 + t) + sin(uv.y * 10.0 + t * 0.7);
    v += sin((uv.x + uv.y) * 10.0 + t * 0.5);
    v += sin(length(uv - 0.5) * 20.0 - t);
    v = v * 0.25 + 0.5;
    return vec3(v, sin(v * PI), cos(v * PI) * 0.5 + 0.5);
}

vec3 pattern6(vec2 uv, float t, float s) { // Checkerboard warp
    vec2 warp = uv + vec2(sin(uv.y * 10.0 + t), cos(uv.x * 10.0 + t * 0.8)) * 0.05 * s;
    float check = mod(floor(warp.x * (8.0 + s * 8.0)) + floor(warp.y * (8.0 + s * 8.0)), 2.0);
    float n = noise(warp * 20.0 + t);
    return vec3(mix(check, n, 0.3));
}

vec3 pattern7(vec2 uv, float t, float s) { // Radial burst
    vec2 c = uv - 0.5;
    float a = atan(c.y, c.x);
    float r = length(c);
    float rays = sin(a * (8.0 + floor(s * 8.0)) + t) * 0.5 + 0.5;
    float rings = sin(r * 30.0 - t * 2.0) * 0.5 + 0.5;
    return vec3(rays, rings, rays * rings);
}

vec3 pattern8(vec2 uv, float t, float s) { // Gradient bands
    float bands = floor(uv.y * (6.0 + s * 10.0));
    float h = hash(vec2(bands, s));
    float shift = sin(t * (0.5 + h) + h * TAU) * 0.2;
    return vec3(h + shift, fract(h * 2.3 + shift), fract(h * 3.7 + shift));
}

vec3 pattern9(vec2 uv, float t, float s) { // Interference
    float w1 = sin(length(uv - vec2(0.3, 0.3)) * 40.0 - t * 2.0);
    float w2 = sin(length(uv - vec2(0.7, 0.6)) * 35.0 - t * 1.7);
    float w3 = sin(length(uv - vec2(0.5, 0.8)) * 45.0 - t * 2.3);
    return vec3(w1, w2, w3) * 0.5 + 0.5;
}

vec3 getPattern(vec2 uv, float t, float s, int p) {
    if (p == 0) return pattern0(uv, t, s);
    if (p == 1) return pattern1(uv, t, s);
    if (p == 2) return pattern2(uv, t, s);
    if (p == 3) return pattern3(uv, t, s);
    if (p == 4) return pattern4(uv, t, s);
    if (p == 5) return pattern5(uv, t, s);
    if (p == 6) return pattern6(uv, t, s);
    if (p == 7) return pattern7(uv, t, s);
    if (p == 8) return pattern8(uv, t, s);
    return pattern9(uv, t, s);
}

// ============================================
// 24 WAVELETS
// ============================================

vec4 wav0(vec2 uv, vec3 b, float t, float a) { // Haar
    float sc = pow(2.0, floor(a * 3.0) + 1.0);
    vec2 bl = floor(uv * u_resolution / sc) * sc / u_resolution;
    vec2 lc = fract(uv * u_resolution / sc);
    vec3 r = b;
    r = mix(r, b * (1.0 + noise(bl * 10.0 + t) * a), step(0.5, lc.x));
    r = mix(r, b * (1.0 - noise(bl * 10.0 - t) * a), step(0.5, lc.y));
    return vec4(r, 1.0);
}

vec4 wav1(vec2 uv, vec3 b, float t, float a) { // Daubechies2
    float gx = sin(uv.y * 20.0 + t * 0.3) * a * 0.02;
    float gy = cos(uv.x * 20.0 + t * 0.4) * a * 0.02;
    vec3 r = b * (1.0 + gx + gy);
    r = mix(r, b, noise(uv * 5.0 + t * 0.2) * a);
    return vec4(r, 1.0);
}

vec4 wav2(vec2 uv, vec3 b, float t, float a) { // Biorthogonal
    float w = sin(uv.x * 30.0 + t) * sin(uv.y * 30.0 + t * 0.7) * a;
    vec2 bl = floor(uv * (8.0 + a * 16.0));
    float bh = hash(bl + floor(t));
    return vec4(mix(b + w, b - w * 0.5, bh), 1.0);
}

vec4 wav3(vec2 uv, vec3 b, float t, float a) { // Coiflet
    vec2 w = uv + vec2(sin(uv.y * 10.0 + t * 0.4), cos(uv.x * 10.0 + t * 0.5)) * a * 0.05;
    vec3 r = b + vec3(fbm(w * 10.0, 3) - 0.5) * a * 0.5;
    r.r += sin(w.x * 50.0 + t) * a * 0.1;
    r.b += sin(w.y * 50.0 + t) * a * 0.1;
    return vec4(r, 1.0);
}

vec4 wav4(vec2 uv, vec3 b, float t, float a) { // Symlet
    vec2 c = uv - 0.5;
    float rad = sin(length(c) * 20.0 - t * 0.25) * cos(atan(c.y, c.x) * 4.0 + t * 0.1);
    vec3 r = b + vec3(rad * a * 0.3);
    return vec4(r, 1.0);
}

vec4 wav5(vec2 uv, vec3 b, float t, float a) { // Mexican Hat
    vec2 c = uv - 0.5 - vec2(sin(t * 0.3), cos(t * 0.4)) * 0.1;
    float r2 = dot(c, c) * (10.0 + a * 20.0);
    float h = (1.0 - r2) * exp(-r2 * 0.5);
    return vec4(b + vec3(h * a * 0.5), 1.0);
}

vec4 wav6(vec2 uv, vec3 b, float t, float a) { // Morlet
    vec2 p = (uv - 0.5) * 10.0;
    float env = exp(-dot(p, p) * 0.1);
    float osc = cos(p.x * (5.0 + a * 10.0) + t * 0.5);
    return vec4(b + vec3(env * osc * a * 0.4), 1.0);
}

vec4 wav7(vec2 uv, vec3 b, float t, float a) { // Shannon
    vec2 p = (uv - 0.5) * (12.0 + a * 20.0);
    float sx = abs(p.x) < 0.001 ? 1.0 : sin(PI * p.x) / (PI * p.x);
    float sy = abs(p.y) < 0.001 ? 1.0 : sin(PI * p.y) / (PI * p.y);
    float s = sx * sy;
    // Add concentric sinc rings
    float r = length(p);
    float ring = abs(r) < 0.001 ? 1.0 : sin(PI * r * 1.5 - t * 2.0) / (PI * r * 0.5 + 0.1);
    s = s * 0.5 + ring * 0.5;
    // Strong banding effect
    float bands = floor(s * (6.0 + a * 10.0)) / 6.0;
    vec3 result = mix(b, vec3(1.0) - b, bands * a);
    result += vec3(s * 0.3, ring * 0.2, -s * 0.2) * a;
    return vec4(result, 1.0);
}

vec4 wav8(vec2 uv, vec3 b, float t, float a) { // DCT
    float bs = 8.0 + floor(a * 8.0);
    vec2 bl = floor(uv * bs), lc = fract(uv * bs);
    float dct = 0.0;
    for (int u = 0; u < 4; u++) {
        for (int v = 0; v < 4; v++) {
            float c = hash(bl + vec2(float(u), float(v)) + floor(t * 0.5)) - 0.5;
            c = floor(c * (10.0 - a * 8.0)) / 10.0;
            dct += c * cos(PI * float(u) * (lc.x + 0.5) / 4.0) * cos(PI * float(v) * (lc.y + 0.5) / 4.0);
        }
    }
    return vec4(b + vec3(dct * a * 0.5), 1.0);
}

vec4 wav9(vec2 uv, vec3 b, float t, float a) { // Gabor
    vec3 r = b;
    float sg = 0.1 + a * 0.1, fr = 10.0 + a * 20.0;
    for (int i = 0; i < 4; i++) {
        float an = float(i) * PI / 4.0 + t * 0.1;
        vec2 d = vec2(cos(an), sin(an)), p = uv - 0.5;
        float g = exp(-dot(p, p) / (2.0 * sg * sg)) * cos(fr * dot(p, d) + t * 0.4);
        if (i == 0) r.r += g * a * 0.3;
        else if (i == 1) r.g += g * a * 0.3;
        else if (i == 2) r.b += g * a * 0.3;
        else r += vec3(g * a * 0.15);
    }
    return vec4(r, 1.0);
}

vec4 wav10(vec2 uv, vec3 b, float t, float a) { // Pixel Sort
    float l = dot(b, vec3(0.299, 0.587, 0.114));
    float th = 0.3 + sin(t * 0.5) * 0.2;
    float sr = step(th, l);
    float disp = l * a * 0.1 * sr * (sin(uv.y * 50.0 + t) > 0.0 ? 1.0 : -1.0);
    float st = noise(vec2((uv.x + disp) * 100.0, floor(uv.y * (50.0 + a * 50.0))));
    return vec4(mix(b, vec3(st), sr * a * 0.5), 1.0);
}

vec4 wav11(vec2 uv, vec3 b, float t, float a) { // Glitch blocks
    vec2 bl = floor(uv * (10.0 + a * 20.0));
    float h = hash(bl + floor(t * 3.0));
    float glitch = step(0.8 - a * 0.3, h);
    vec2 off = (vec2(hash(bl + 100.0), hash(bl + 200.0)) - 0.5) * 0.1 * glitch;
    return vec4(mix(b, vec3(hash(bl + t)), glitch * a), 1.0);
}

vec4 wav12(vec2 uv, vec3 b, float t, float a) { // Scanline
    float scan = sin(uv.y * u_resolution.y * 0.5 + t * 10.0);
    float bands = step(0.0, scan) * 0.3 * a;
    vec3 r = b - bands;
    float jit = (hash(vec2(floor(uv.y * 100.0), floor(t * 5.0))) - 0.5) * a * 0.02;
    r = mix(r, b, step(0.95, hash(vec2(uv.y * 50.0, t))));
    return vec4(r, 1.0);
}

vec4 wav13(vec2 uv, vec3 b, float t, float a) { // VHS
    float n = (hash(uv + t) - 0.5) * a * 0.3;
    vec3 r = b + n;
    float tr = sin(uv.y * 3.0 + t * 0.1) * a * 0.1;
    r.r = mix(r.r, b.r, step(fract(uv.y * 20.0 + t), 0.1) * a);
    return vec4(r + tr, 1.0);
}

vec4 wav14(vec2 uv, vec3 b, float t, float a) { // Chromatic aberration
    float d = length(uv - 0.5) * a * 0.03;
    vec2 dir = normalize(uv - 0.5);
    vec3 r;
    r.r = dot(b, vec3(1.0, 0.0, 0.0));
    r.g = dot(b, vec3(0.0, 1.0, 0.0)) * (1.0 + d);
    r.b = dot(b, vec3(0.0, 0.0, 1.0)) * (1.0 + d * 2.0);
    return vec4(r, 1.0);
}

vec4 wav15(vec2 uv, vec3 b, float t, float a) { // Displacement
    vec2 d = vec2(noise(uv * 10.0 + t) - 0.5, noise(uv * 10.0 + t + 100.0) - 0.5) * a * 0.1;
    vec2 nuv = uv + d;
    float nv = noise(nuv * 20.0);
    return vec4(mix(b, vec3(nv), a * 0.5), 1.0);
}

vec4 wav16(vec2 uv, vec3 b, float t, float a) { // Fractal
    vec2 z = (uv - 0.5) * 3.0;
    float iter = 0.0;
    for (int i = 0; i < 10; i++) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + vec2(sin(t * 0.1), cos(t * 0.1)) * 0.5;
        if (dot(z, z) > 4.0) break;
        iter += 1.0;
    }
    return vec4(b + vec3(iter * 0.1 * a), 1.0);
}

vec4 wav17(vec2 uv, vec3 b, float t, float a) { // Kaleidoscope
    vec2 c = uv - 0.5;
    float ang = atan(c.y, c.x);
    float seg = TAU / (4.0 + floor(a * 8.0));
    ang = mod(ang, seg);
    ang = min(ang, seg - ang);
    vec2 k = vec2(cos(ang), sin(ang)) * length(c) + 0.5;
    return vec4(mix(b, vec3(noise(k * 10.0 + t)), a * 0.5), 1.0);
}

vec4 wav18(vec2 uv, vec3 b, float t, float a) { // Posterize
    float levels = 2.0 + floor((1.0 - a) * 8.0);
    vec3 r = floor(b * levels) / levels;
    float edge = length(fract(b * levels) - 0.5);
    r = mix(r, vec3(1.0) - r, step(0.4, edge) * a * 0.3);
    return vec4(r, 1.0);
}

vec4 wav19(vec2 uv, vec3 b, float t, float a) { // Ripple
    vec2 c = uv - 0.5;
    float r = length(c);
    float rip = sin(r * 30.0 - t * 3.0) * a * 0.1;
    vec2 nuv = uv + normalize(c) * rip;
    return vec4(b * (1.0 + sin(r * 40.0 - t * 4.0) * a * 0.2), 1.0);
}

vec4 wav20(vec2 uv, vec3 b, float t, float a) { // Edge detect
    float lum = dot(b, vec3(0.299, 0.587, 0.114));
    float dx = noise(uv * 50.0 + vec2(0.01, 0.0)) - noise(uv * 50.0 - vec2(0.01, 0.0));
    float dy = noise(uv * 50.0 + vec2(0.0, 0.01)) - noise(uv * 50.0 - vec2(0.0, 0.01));
    float edge = length(vec2(dx, dy)) * 20.0;
    return vec4(mix(b, vec3(edge), a), 1.0);
}

vec4 wav21(vec2 uv, vec3 b, float t, float a) { // Smear
    float dir = hash(vec2(floor(uv.y * 30.0), floor(t))) * 2.0 - 1.0;
    float sm = dir * a * 0.1 * step(0.7, hash(vec2(uv.y * 20.0, t * 2.0)));
    float streak = noise(vec2(uv.x + sm, uv.y) * 30.0);
    return vec4(mix(b, vec3(streak), abs(sm) * 5.0), 1.0);
}

vec4 wav22(vec2 uv, vec3 b, float t, float a) { // Tile shift
    vec2 tile = floor(uv * (6.0 + a * 6.0));
    vec2 off = (vec2(hash(tile + floor(t)), hash(tile + floor(t) + 50.0)) - 0.5) * a * 0.2;
    off *= step(0.6, hash(tile + 100.0));
    vec2 nuv = fract(uv * (6.0 + a * 6.0)) + off;
    return vec4(b * (0.8 + hash(tile) * 0.4), 1.0);
}

vec4 wav23(vec2 uv, vec3 b, float t, float a) { // Data bend
    float row = floor(uv.y * 50.0);
    float bend = sin(row * 0.5 + t * 2.0) * step(0.8, hash(vec2(row, floor(t * 3.0))));
    float shift = bend * a * 0.2;
    vec2 nuv = vec2(fract(uv.x + shift), uv.y);
    float data = step(0.5, fract((nuv.x + nuv.y) * 50.0 + t));
    return vec4(mix(b, vec3(data), abs(bend) * a), 1.0);
}

vec4 applyWavelet(vec2 uv, vec3 b, float t, float a, int w) {
    if (w == 0) return wav0(uv, b, t, a);
    if (w == 1) return wav1(uv, b, t, a);
    if (w == 2) return wav2(uv, b, t, a);
    if (w == 3) return wav3(uv, b, t, a);
    if (w == 4) return wav4(uv, b, t, a);
    if (w == 5) return wav5(uv, b, t, a);
    if (w == 6) return wav6(uv, b, t, a);
    if (w == 7) return wav7(uv, b, t, a);
    if (w == 8) return wav8(uv, b, t, a);
    if (w == 9) return wav9(uv, b, t, a);
    if (w == 10) return wav10(uv, b, t, a);
    if (w == 11) return wav11(uv, b, t, a);
    if (w == 12) return wav12(uv, b, t, a);
    if (w == 13) return wav13(uv, b, t, a);
    if (w == 14) return wav14(uv, b, t, a);
    if (w == 15) return wav15(uv, b, t, a);
    if (w == 16) return wav16(uv, b, t, a);
    if (w == 17) return wav17(uv, b, t, a);
    if (w == 18) return wav18(uv, b, t, a);
    if (w == 19) return wav19(uv, b, t, a);
    if (w == 20) return wav20(uv, b, t, a);
    if (w == 21) return wav21(uv, b, t, a);
    if (w == 22) return wav22(uv, b, t, a);
    return wav23(uv, b, t, a);
}

// ============================================
// MULTI-LEVEL DECOMPOSITION (up to 8 levels)
// ============================================

vec3 multiLevel(vec2 uv, vec3 b, float t, int lv, int w, float a) {
    vec3 r = b;
    float la = a;
    for (int i = 0; i < 8; i++) {
        if (i >= lv) break;
        float sc = pow(2.0, float(i));
        r = mix(r, applyWavelet(fract(uv * sc), r, t + float(i), la, w).rgb, 0.5);
        la *= 0.7;
    }
    return r;
}

// ============================================
// 24 COLOR PALETTES
// ============================================

// Hard transition palettes (like neon_glitch)
vec3 pal0(float t) { // Neon Glitch (original)
    return vec3(step(0.5, fract(t * 3.0)), step(0.5, fract(t * 5.0 + 0.33)), step(0.5, fract(t * 4.0 + 0.66))) * 0.8 + 0.2;
}

vec3 pal1(float t) { // Binary
    return vec3(step(0.5, fract(t * 8.0)));
}

vec3 pal2(float t) { // RGB Bars
    float s = floor(t * 3.0);
    return vec3(step(0.5, s), step(1.5, s), step(2.5, s)) + vec3(step(s, 0.5), 0.0, 0.0);
}

vec3 pal3(float t) { // Cyber Bars
    float b = step(0.5, fract(t * 6.0));
    return vec3(0.0, b * 0.8, b * 0.4 + 0.2);
}

vec3 pal4(float t) { // Hot Steps
    float s = floor(t * 4.0) / 4.0;
    return vec3(s + 0.2, s * 0.3, 0.1);
}

vec3 pal5(float t) { // Electric
    return vec3(
        step(0.5, fract(t * 7.0 + 0.1)),
        step(0.5, fract(t * 11.0 + 0.3)) * 0.8,
        step(0.5, fract(t * 5.0)) * 0.6 + 0.4
    );
}

vec3 pal6(float t) { // Matrix
    float g = step(0.3, fract(t * 10.0)) * (0.5 + t * 0.5);
    return vec3(0.0, g, g * 0.3);
}

vec3 pal7(float t) { // Vapor Bars
    return vec3(
        step(0.5, fract(t * 4.0)) * 0.8 + 0.2,
        step(0.5, fract(t * 3.0 + 0.5)) * 0.3 + 0.2,
        step(0.5, fract(t * 5.0 + 0.25)) * 0.6 + 0.4
    );
}

vec3 pal8(float t) { // Sunset Bands
    float b = floor(t * 5.0) / 5.0;
    return vec3(0.9 - b * 0.3, 0.4 - b * 0.3, 0.2 + b * 0.5);
}

vec3 pal9(float t) { // Ice Blocks
    float b = step(0.5, fract(t * 6.0));
    return vec3(0.7 + b * 0.3, 0.85 + b * 0.15, 1.0);
}

vec3 pal10(float t) { // Fire Steps
    float s = floor(t * 5.0) / 5.0;
    return vec3(1.0, s * 0.8, s * s * 0.3);
}

vec3 pal11(float t) { // Toxic
    return vec3(
        step(0.5, fract(t * 4.0)) * 0.4,
        step(0.5, fract(t * 6.0 + 0.2)) * 0.9 + 0.1,
        step(0.5, fract(t * 3.0)) * 0.3
    );
}

// Gradient palettes
vec3 pal12(float t) { // Thermal
    if (t < 0.33) return mix(vec3(0.0, 0.0, 0.2), vec3(0.8, 0.0, 0.2), t * 3.0);
    if (t < 0.66) return mix(vec3(0.8, 0.0, 0.2), vec3(1.0, 0.8, 0.0), (t - 0.33) * 3.0);
    return mix(vec3(1.0, 0.8, 0.0), vec3(1.0, 1.0, 0.9), (t - 0.66) * 3.0);
}

vec3 pal13(float t) { // Ocean
    return mix(vec3(0.0, 0.1, 0.3), vec3(0.0, 0.8, 0.9), t);
}

vec3 pal14(float t) { // Vaporwave (improved)
    vec3 a = vec3(1.0, 0.4, 0.8);
    vec3 b = vec3(0.3, 0.8, 1.0);
    vec3 c = vec3(0.9, 0.6, 1.0);
    if (t < 0.5) return mix(a, b, t * 2.0);
    return mix(b, c, (t - 0.5) * 2.0);
}

vec3 pal15(float t) { // Cyber (improved)
    vec3 a = vec3(0.0, 0.1, 0.1);
    vec3 b = vec3(0.0, 1.0, 0.5);
    vec3 c = vec3(0.0, 0.3, 0.8);
    if (t < 0.5) return mix(a, b, t * 2.0);
    return mix(b, c, (t - 0.5) * 2.0);
}

vec3 pal16(float t) { // Corrupted Film
    return mix(vec3(0.1, 0.05, 0.15), vec3(0.9, 0.85, 0.7), t);
}

vec3 pal17(float t) { // Digital Rot
    return vec3(0.1 + 0.4 * t, 0.5 * t * t, 0.2 + 0.3 * sin(t * PI));
}

vec3 pal18(float t) { // Monochrome
    return vec3(t);
}

vec3 pal19(float t) { // Infrared
    return vec3(t * 0.8 + 0.2, t * 0.2, 0.5 - t * 0.3);
}

vec3 pal20(float t) { // Neon Rainbow
    return 0.5 + 0.5 * cos(TAU * (t + vec3(0.0, 0.33, 0.67)));
}

vec3 pal21(float t) { // Blood Moon
    return mix(vec3(0.1, 0.0, 0.0), vec3(0.9, 0.2, 0.1), t);
}

vec3 pal22(float t) { // Phosphor
    float g = t * 0.9 + 0.1;
    return vec3(g * 0.2, g, g * 0.3);
}

vec3 pal23(float t) { // Synthwave
    vec3 a = vec3(0.1, 0.0, 0.2);
    vec3 b = vec3(1.0, 0.0, 0.5);
    vec3 c = vec3(0.0, 0.8, 1.0);
    if (t < 0.5) return mix(a, b, t * 2.0);
    return mix(b, c, (t - 0.5) * 2.0);
}

vec3 applyPalette(float t, int p) {
    t = clamp(t, 0.0, 1.0);
    if (p == 0) return pal0(t);
    if (p == 1) return pal1(t);
    if (p == 2) return pal2(t);
    if (p == 3) return pal3(t);
    if (p == 4) return pal4(t);
    if (p == 5) return pal5(t);
    if (p == 6) return pal6(t);
    if (p == 7) return pal7(t);
    if (p == 8) return pal8(t);
    if (p == 9) return pal9(t);
    if (p == 10) return pal10(t);
    if (p == 11) return pal11(t);
    if (p == 12) return pal12(t);
    if (p == 13) return pal13(t);
    if (p == 14) return pal14(t);
    if (p == 15) return pal15(t);
    if (p == 16) return pal16(t);
    if (p == 17) return pal17(t);
    if (p == 18) return pal18(t);
    if (p == 19) return pal19(t);
    if (p == 20) return pal20(t);
    if (p == 21) return pal21(t);
    if (p == 22) return pal22(t);
    return pal23(t);
}

// ============================================
// MAIN
// ============================================

void main() {
    vec2 uv = v_uv;
    float time = u_time * u_animSpeed;

    vec3 base = getPattern(uv, time, u_seed, u_patternType);
    vec3 transformed = multiLevel(uv, base, time, u_decompLevels, u_waveletType, u_glitchAmount);
    float luma = dot(transformed, vec3(0.299, 0.587, 0.114));
    vec3 colored = applyPalette(luma, u_paletteIndex);

    // Subtle scanlines
    colored -= sin(uv.y * u_resolution.y * 2.0) * 0.015;

    gl_FragColor = vec4(colored, 1.0);
}
