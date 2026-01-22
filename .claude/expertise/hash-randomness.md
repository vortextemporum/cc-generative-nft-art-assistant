# Hash-Based Randomness

Deterministic randomness is critical for generative art platforms. Each token must produce the same output every time from its unique hash.

## Art Blocks Implementation

Art Blocks projects use `tokenData.hash` (a 64-character hex string) to seed deterministic randomness.

### Hash Parsing
```javascript
// tokenData.hash is a 64-char hex string like:
// "0x8b7df143d91a8d3f8f8a9c0a6a7b6c5d4e3f2a1b..."

// Parse hex pairs as values 0-255
function parseHash(hash) {
    const values = [];
    for (let i = 2; i < hash.length; i += 2) {
        values.push(parseInt(hash.slice(i, i + 2), 16));
    }
    return values;
}
```

### sfc32 PRNG (Recommended)
```javascript
// sfc32 - Small Fast Counter PRNG
function sfc32(a, b, c, d) {
    return function() {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        d = (d + 1) | 0;
        t = (t + d) | 0;
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    };
}

// Seed from Art Blocks hash
function seedFromHash(hash) {
    const h = hash.slice(2); // Remove "0x"
    const seeds = [];
    for (let i = 0; i < 4; i++) {
        seeds.push(parseInt(h.slice(i * 8, (i + 1) * 8), 16));
    }
    return sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
}

// Usage
let rand = seedFromHash(tokenData.hash);
let value = rand(); // Returns 0-1
```

### mulberry32 (Simpler Alternative)
```javascript
function mulberry32(a) {
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
```

## fxhash Implementation

fxhash provides `fxrand()` as a built-in deterministic random function seeded from the `fxhash` string.

### Basic Usage
```javascript
// fxrand() returns 0-1, already seeded from fxhash
let value = fxrand();

// Helper functions
function randInt(min, max) {
    return Math.floor(fxrand() * (max - min + 1)) + min;
}

function randChoice(arr) {
    return arr[Math.floor(fxrand() * arr.length)];
}

function randBool(probability = 0.5) {
    return fxrand() < probability;
}
```

### Feature Declaration
```javascript
// Declare features for fxhash gallery
$fx.features({
    "Background": randChoice(["Light", "Dark", "Gradient"]),
    "Complexity": randInt(1, 5),
    "Has Particles": randBool(0.3)
});

// Call when render is complete for thumbnail capture
$fx.preview();
```

### Custom PRNG (if needed)
```javascript
// If you need multiple independent random streams
function createPRNG(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return mulberry32(h);
}

let rand1 = createPRNG(fxhash + "colors");
let rand2 = createPRNG(fxhash + "shapes");
```

## Best Practices

### Do
- Always use deterministic PRNG, never `Math.random()`
- Create helper functions (randInt, randChoice, etc.)
- Test with multiple hashes to ensure variety
- Document which random calls affect which features

### Don't
- Call random functions in draw() for static art (call all in setup())
- Mix PRNG implementations inconsistently
- Assume hash distribution is uniform (it is, but verify your mapping)

## Testing Determinism

```javascript
// Test that same hash produces same output
function testDeterminism(hash) {
    const rand1 = seedFromHash(hash);
    const rand2 = seedFromHash(hash);

    for (let i = 0; i < 100; i++) {
        if (rand1() !== rand2()) {
            console.error("Non-deterministic at iteration", i);
            return false;
        }
    }
    console.log("Determinism verified");
    return true;
}
```

## Common Hash Values for Testing

```javascript
const TEST_HASHES = [
    "0x0000000000000000000000000000000000000000000000000000000000000000", // All zeros
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // All ones
    "0x8b7df143d91a8d3f8f8a9c0a6a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b", // Random
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // Sequential
];
```
