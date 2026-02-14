# GLIX Wavetable - Testing & Publishing Guide

## Local Testing

### Quick test (just open in browser)

```bash
cd sketches/glix-wavetable-fxhash
# Open index.html directly in browser
open index.html
```

Reload the page multiple times — each reload generates a new random hash, so you'll see different outputs. Verify:
- Different oscillators, palettes, and effects appear across reloads
- Animation runs smoothly
- Press **V** to toggle isometric view
- Press **S** to save a screenshot
- Press **Space** to pause/resume

### Using fxhash CLI (recommended)

```bash
# Install fxhash CLI globally
npm install -g @fxhash/cli

# From the project directory
cd sketches/glix-wavetable-fxhash

# Start local dev server with fxlens (hot reload + hash controls)
npx fxhash dev
```

fxlens gives you:
- Hash input field to test specific hashes
- Iteration controls
- Feature display panel showing registered traits
- Preview capture testing
- Responsive viewport testing

### Testing checklist

- [ ] Reload 20+ times — outputs should be varied but always valid
- [ ] Same hash always produces identical output (determinism)
- [ ] No console errors (open DevTools → Console)
- [ ] Features panel shows all 9 traits (Oscillator, Palette, Hue Shift, Fold Mode, Animation, Has Fold, Has Crush, Mirror, Invert)
- [ ] Preview capture triggers (check console for "fxpreview triggered")
- [ ] Test in Chrome, Firefox, Safari
- [ ] Test at different window sizes (should fill viewport, maintain aspect ratio)
- [ ] Isometric view works (V key), drag to rotate, shift+drag to pan, scroll to zoom
- [ ] No external network requests (DevTools → Network tab should show no remote fetches after load)

## Building for Upload

### Option 1: fxhash CLI (recommended)

```bash
cd sketches/glix-wavetable-fxhash
npx fxhash build
# Creates dist/upload.zip ready for fxhash
```

### Option 2: Manual ZIP

ZIP these files (no extra folders):
```
index.html
sketch.js
fxhash.js
style.css
libraries/p5.min.js
```

Exclude: `CLAUDE.md`, `CHANGELOG.md`, `docs/`, `versions/`, `.fxhash.json` (config is for CLI only).

The ZIP should be under 15 MB (ours is ~1.1 MB mostly from p5.min.js).

## Publishing on fxhash (Ethereum)

### 1. Go to fxhash mint page
https://www.fxhash.xyz/mint-generative

### 2. Upload your ZIP file

### 3. Configure in the sandbox

The sandbox lets you test your project on the platform before publishing. Verify:
- Multiple iterations look correct
- Features register and display properly
- Preview captures work

### 4. Set project details

- **Title**: GLIX Wavetable
- **Description**: Write your artist statement
- **Tags**: wavetable, synthesizer, dsp, webgl, glsl, oscillator, generative, audio-visual, shader, abstract
- **Blockchain**: Ethereum
- **Editions**: 512

### 5. Pricing

Options:
- **Dutch auction**: Starts high, drops over time (recommended for hype launches)
- **Dutch auction with rebates**: Early buyers get refunded the difference
- **Fixed price**: Set a single ETH price
- **Free**: Collectors pay only gas

### 6. Royalties

- Set secondary market royalty (typically 5-10%)
- Platform fee on Ethereum: 10%

### 7. Content labels

Check if applicable:
- [ ] Epileptic (has flashing/strobing) — the ripple effect is subtle, probably no
- [x] Animated — yes, always animated
- [ ] Interactive — keyboard shortcuts exist but are optional
- [ ] Audio — no audio

### 8. Reserves & Allowlists (optional)

You can reserve specific iterations for yourself or set up allowlists for early access.

### 9. Review and publish

Once published, minting begins according to your pricing schedule. Each mint generates a unique hash that produces a deterministic output.

## Post-Publish

- Monitor first few mints for any rendering issues
- Check feature distribution matches expected rarity
- Engage with collectors on fxhash Discord
