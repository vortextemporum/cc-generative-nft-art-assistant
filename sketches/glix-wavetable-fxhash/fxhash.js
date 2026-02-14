// fxhash boilerplate - DO NOT MODIFY
// Provides fxrand(), fxhash, $fx, and feature registration

// The fxhash string is injected by the platform
// For local dev, we generate a random one
if (typeof fxhash === 'undefined') {
  var alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  var fxhash = "oo" + Array(49).fill(0).map(_ =>
    alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

// fxrand() - deterministic PRNG seeded by fxhash
// Returns value in [0, 1)
var fxrand = (function() {
  var s = [...fxhash].reduce((a, c) => {
    a = ((a << 5) - a) + c.charCodeAt(0);
    return a & a;
  }, 0) >>> 0;
  return function() {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >>> 17)) >>> 0;
    s = (s ^ (s << 5)) >>> 0;
    return s / 4294967296;
  };
})();

// Feature registration
var $fx = {
  _features: {},
  features: function(f) {
    if (f) this._features = { ...this._features, ...f };
    return this._features;
  },
  getFeature: function(key) {
    return this._features[key];
  },
  getFeatures: function() {
    return this._features;
  },
  rand: fxrand,
  hash: fxhash,
  preview: function() {
    window.fxpreview = true;
    console.log("fxpreview triggered");
  },
  isPreview: false,
  context: "standalone"
};

// Alias
function fxpreview() {
  $fx.preview();
}

// Console info for development
console.log("fxhash:", fxhash);
