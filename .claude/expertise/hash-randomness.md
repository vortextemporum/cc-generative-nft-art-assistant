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

fxhash provides `$fx.rand()` (and legacy `fxrand()`) as a built-in SFC32 PRNG seeded from the Base58 `fxhash` string.

### How the SDK Seeds SFC32

The `@fxhash/project-sdk` (`fxhash.min.js`) performs these steps:
1. Decode the Base58 hash string to a BigInt
2. Extract 4 x 32-bit integer seeds from the BigInt
3. Initialize SFC32 with those 4 seeds

```javascript
// Internal implementation of fxhash SDK PRNG seeding
const alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const b58dec = (str) => [...str].reduce((acc, c) =>
    acc * 58n + BigInt(alphabet.indexOf(c)), 0n);
const fxhashDec = b58dec(fxhash); // fxhash is the 51-char Base58 string

const sfc32 = (a, b, c, d) => {
  return () => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
};

const fxrand = sfc32(
  Number(fxhashDec & 0xFFFFFFFFn),
  Number((fxhashDec >> 32n) & 0xFFFFFFFFn),
  Number((fxhashDec >> 64n) & 0xFFFFFFFFn),
  Number((fxhashDec >> 96n) & 0xFFFFFFFFn)
);
```

### Basic Usage
```javascript
// Modern API (recommended)
const R = $fx.rand;
let value = R();           // Returns [0, 1)
R.reset();                 // Reset PRNG to initial state

// Legacy API (still works)
let value2 = fxrand();     // Same PRNG

// Minter-seeded PRNG (for minter-dependent features)
let minterValue = $fx.randminter();  // Seeded from collector wallet address
$fx.randminter.reset();              // Reset minter PRNG
```

### Helper Functions
```javascript
const R = $fx.rand;

function rnd(min = 0, max = 1) {
    return min + R() * (max - min);
}
function rndInt(min, max) {
    return Math.floor(rnd(min, max + 1));
}
function rndChoice(arr) {
    return arr[Math.floor(R() * arr.length)];
}
function rndBool(probability = 0.5) {
    return R() < probability;
}
function rollRarity(...options) {
    const roll = R();
    let cumulative = 0;
    for (const opt of options) {
        cumulative += opt.prob;
        if (roll < cumulative) return opt.value;
    }
    return options[options.length - 1].value;
}
```

### Feature Declaration
```javascript
// Declare features for fxhash gallery
$fx.features({
    "Background": rndChoice(["Light", "Dark", "Gradient"]),
    "Complexity": rndInt(1, 5),
    "Has Particles": rndBool(0.3)
});

// Call when render is complete for thumbnail capture
$fx.preview();
```

### Open-Form Randomness (Lineage)
```javascript
// For open-form projects with evolution lineage
$fx.lineage     // string[] - array of parent hashes + current hash
$fx.depth       // number - count of parents
$fx.randAt(n)   // PRNG seeded by lineage hash at depth n

// Custom PRNG from any hash
$fx.createFxRandom(hash)  // Returns independent PRNG function
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

let rand1 = createPRNG($fx.hash + "colors");
let rand2 = createPRNG($fx.hash + "shapes");
```

## Best Practices

### Do
- Always use deterministic PRNG, never `Math.random()`
- Use `$fx.rand()` (fxhash) or sfc32 from `tokenData.hash` (Art Blocks)
- Create helper functions (rndInt, rndChoice, etc.)
- Test with multiple hashes to ensure variety
- Document which random calls affect which features
- Call `$fx.features()` once after all features are determined
- Animation can use `noise()` (Perlin) or math functions that don't consume the PRNG

### Don't
- Call random functions in `draw()` for static art (call all in `setup()`)
- Mix PRNG implementations inconsistently
- Use `Math.random()` for any deterministic output
- Modify the fxhash SDK (`fxhash.min.js`)

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

// fxhash: use $fx.rand.reset() to verify
function testFxhashDeterminism() {
    const values1 = [];
    for (let i = 0; i < 100; i++) values1.push($fx.rand());
    $fx.rand.reset();
    for (let i = 0; i < 100; i++) {
        if ($fx.rand() !== values1[i]) {
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
// Art Blocks test hashes
const AB_TEST_HASHES = [
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    "0x8b7df143d91a8d3f8f8a9c0a6a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b",
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
];

// fxhash test hashes (Base58, starts with "oo")
const FX_TEST_HASHES = [
    "ooXnGtQiUMfyKL2AHq6c13E3tg7fxUKx1eTD4UoxFdVWBR1YuE8",
    "oo111111111111111111111111111111111111111111111111111",
    "oozzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
];

// Generate random fxhash for testing
function generateFxhash() {
    const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let hash = 'oo';
    for (let i = 0; i < 49; i++) {
        hash += base58chars[Math.floor(Math.random() * base58chars.length)];
    }
    return hash;
}
```
