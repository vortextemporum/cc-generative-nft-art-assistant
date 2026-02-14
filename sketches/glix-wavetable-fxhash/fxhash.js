// fxhash SDK boilerplate - replicates @fxhash/project-sdk behavior
// For production: use `npm i @fxhash/project-sdk` or the official fxhash.min.js
// DO NOT MODIFY - this is the local dev fallback; platform overrides at mint time

// Hash injection - platform provides this at mint time
// For local dev, generate a random one
if (typeof window.$fx === 'undefined') {
  const alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const fxhash = "oo" + Array(49).fill(0).map(_ =>
    alphabet[Math.floor(Math.random() * alphabet.length)]).join('');

  // SFC32 PRNG - seeded from Base58 hash (matches official SDK)
  const b58dec = (str) => [...str].reduce((acc, c) =>
    acc * 58n + BigInt(alphabet.indexOf(c)), 0n);
  const fxhashDec = b58dec(fxhash);

  const sfc32 = (a, b, c, d) => {
    const rand = () => {
      a |= 0; b |= 0; c |= 0; d |= 0;
      let t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = c << 21 | c >>> 11;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
    rand.reset = () => {
      [a, b, c, d] = rand._initial;
    };
    rand._initial = [a, b, c, d];
    return rand;
  };

  const fxrand = sfc32(
    Number(fxhashDec & 0xFFFFFFFFn),
    Number((fxhashDec >> 32n) & 0xFFFFFFFFn),
    Number((fxhashDec >> 64n) & 0xFFFFFFFFn),
    Number((fxhashDec >> 96n) & 0xFFFFFFFFn)
  );

  // $fx API
  window.$fx = {
    hash: fxhash,
    rand: fxrand,
    minter: "0x0000000000000000000000000000000000000000",
    randminter: fxrand, // Use same PRNG for dev
    iteration: 1,
    context: "standalone",
    isPreview: false,
    _features: {},
    _params: [],
    features: function(f) {
      if (f) this._features = { ...this._features, ...f };
      return this._features;
    },
    getFeature: function(key) { return this._features[key]; },
    getFeatures: function() { return this._features; },
    params: function(defs) { this._params = defs; },
    getParam: function(id) {
      const p = this._params.find(d => d.id === id);
      return p ? p.default : null;
    },
    getParams: function() {
      return Object.fromEntries(this._params.map(d => [d.id, d.default]));
    },
    getDefinitions: function() { return this._params; },
    preview: function() {
      window.fxpreview = true;
      console.log("fxpreview triggered");
    },
    on: function(event, handler) {
      return () => {}; // Return unsubscribe (no-op in dev)
    },
    emit: function(event, data) {},
    // Open-form stubs
    lineage: [],
    depth: 0,
    randAt: function(depth) { return this.rand; },
    createFxRandom: function(hash) { return this.rand; }
  };

  // Legacy aliases for compatibility
  window.fxhash = fxhash;
  window.fxrand = fxrand;
  window.fxpreview = function() { window.$fx.preview(); };

  console.log("fxhash:", fxhash);
  console.log("$fx API ready (local dev mode)");
}
