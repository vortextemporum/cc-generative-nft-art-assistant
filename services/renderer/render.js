#!/usr/bin/env node

/**
 * Visual Renderer & Analyzer for Generative Art
 *
 * Renders sketches using headless Chrome (Puppeteer) and captures output.
 * Can generate thumbnails, high-res images, and visual analysis.
 *
 * Usage:
 *   node render.js capture <path-to-sketch> [output.png]
 *   node render.js batch <sketches-dir> <output-dir>
 *   node render.js analyze <path-to-sketch>
 *   node render.js server [port]
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 700;
const DEFAULT_TIMEOUT = 10000; // 10 seconds for render
const CAPTURE_DELAY = 2000;    // Wait for animations to settle

// ============================================================================
// RENDERER CLASS
// ============================================================================

class SketchRenderer {
  constructor(options = {}) {
    this.browser = null;
    this.width = options.width || DEFAULT_WIDTH;
    this.height = options.height || DEFAULT_HEIGHT;
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.captureDelay = options.captureDelay || CAPTURE_DELAY;
    this.headless = options.headless !== false;
  }

  async init() {
    if (this.browser) return;

    // Dynamic import for puppeteer
    const puppeteer = await import('puppeteer');
    this.browser = await puppeteer.default.launch({
      headless: this.headless ? 'new' : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security', // Allow local file access
        `--window-size=${this.width},${this.height}`,
      ],
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Render a sketch and capture screenshot
   */
  async capture(sketchPath, options = {}) {
    await this.init();

    const page = await this.browser.newPage();
    await page.setViewport({
      width: options.width || this.width,
      height: options.height || this.height,
      deviceScaleFactor: options.scale || 2, // 2x for retina quality
    });

    try {
      // Determine if it's HTML file or directory
      let htmlPath = sketchPath;
      if (fs.statSync(sketchPath).isDirectory()) {
        htmlPath = path.join(sketchPath, 'index.html');
      }

      if (!fs.existsSync(htmlPath)) {
        throw new Error(`HTML file not found: ${htmlPath}`);
      }

      // Navigate to the sketch
      const fileUrl = `file://${path.resolve(htmlPath)}`;
      await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: this.timeout });

      // Inject custom hash if provided
      if (options.hash) {
        await page.evaluate((hash) => {
          if (typeof window.tokenData !== 'undefined') {
            window.tokenData.hash = hash;
          }
          if (typeof window.fxhash !== 'undefined') {
            window.fxhash = hash;
          }
        }, options.hash);

        // Reload or regenerate
        await page.evaluate(() => {
          if (typeof setup === 'function') setup();
          if (typeof draw === 'function') draw();
        });
      }

      // Wait for render to complete
      await page.waitForTimeout(options.delay || this.captureDelay);

      // Try to trigger fxpreview if available
      await page.evaluate(() => {
        if (typeof fxpreview === 'function') fxpreview();
      }).catch(() => {});

      // Find and capture the canvas
      const canvas = await page.$('canvas');
      if (!canvas) {
        // Fallback to full page screenshot
        return await page.screenshot({ type: 'png' });
      }

      return await canvas.screenshot({ type: 'png' });

    } finally {
      await page.close();
    }
  }

  /**
   * Capture with multiple hashes for variation preview
   */
  async captureVariations(sketchPath, count = 4, options = {}) {
    const variations = [];

    for (let i = 0; i < count; i++) {
      // Generate random hash
      const hash = '0x' + Array(64).fill(0)
        .map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)])
        .join('');

      const screenshot = await this.capture(sketchPath, { ...options, hash });
      variations.push({ hash, screenshot });
    }

    return variations;
  }

  /**
   * Extract visual features from a rendered sketch
   */
  async analyze(sketchPath, options = {}) {
    await this.init();

    const page = await this.browser.newPage();
    await page.setViewport({
      width: options.width || this.width,
      height: options.height || this.height,
    });

    try {
      let htmlPath = sketchPath;
      if (fs.statSync(sketchPath).isDirectory()) {
        htmlPath = path.join(sketchPath, 'index.html');
      }

      const fileUrl = `file://${path.resolve(htmlPath)}`;
      await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: this.timeout });
      await page.waitForTimeout(this.captureDelay);

      // Extract visual analysis
      const analysis = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return { error: 'No canvas found' };

        const ctx = canvas.getContext('2d');
        if (!ctx) return { error: 'Could not get canvas context' };

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Color analysis
        const colorCounts = {};
        const hueHistogram = new Array(36).fill(0); // 10-degree buckets
        let totalBrightness = 0;
        let totalSaturation = 0;
        let pixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a === 0) continue; // Skip transparent

          // Quantize color for counting
          const qr = Math.floor(r / 32) * 32;
          const qg = Math.floor(g / 32) * 32;
          const qb = Math.floor(b / 32) * 32;
          const key = `${qr},${qg},${qb}`;
          colorCounts[key] = (colorCounts[key] || 0) + 1;

          // HSL for hue analysis
          const max = Math.max(r, g, b) / 255;
          const min = Math.min(r, g, b) / 255;
          const l = (max + min) / 2;
          const d = max - min;

          if (d !== 0) {
            const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            let h;
            if (max === r / 255) h = ((g - b) / 255 / d + (g < b ? 6 : 0)) / 6;
            else if (max === g / 255) h = ((b - r) / 255 / d + 2) / 6;
            else h = ((r - g) / 255 / d + 4) / 6;

            hueHistogram[Math.floor(h * 36)] += 1;
            totalSaturation += s;
          }

          totalBrightness += l;
          pixelCount++;
        }

        // Get dominant colors
        const sortedColors = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([color, count]) => ({
            rgb: color.split(',').map(Number),
            percentage: (count / pixelCount * 100).toFixed(1),
          }));

        // Determine color characteristics
        const avgBrightness = totalBrightness / pixelCount;
        const avgSaturation = totalSaturation / pixelCount;

        // Check hue spread
        const activeHues = hueHistogram.filter(h => h > pixelCount * 0.01).length;

        return {
          dimensions: { width: canvas.width, height: canvas.height },
          colorProfile: {
            dominantColors: sortedColors,
            avgBrightness: avgBrightness.toFixed(2),
            avgSaturation: avgSaturation.toFixed(2),
            colorDiversity: activeHues, // How many hue ranges are used
            isMonochrome: avgSaturation < 0.1,
            isDark: avgBrightness < 0.3,
            isLight: avgBrightness > 0.7,
            isPastel: avgSaturation < 0.5 && avgBrightness > 0.6,
            isVibrant: avgSaturation > 0.6,
          },
          uniqueColors: Object.keys(colorCounts).length,
        };
      });

      // Also capture screenshot for reference
      const screenshot = await this.capture(sketchPath, options);

      return {
        ...analysis,
        screenshot,
      };

    } finally {
      await page.close();
    }
  }
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

async function batchCapture(sketchesDir, outputDir, options = {}) {
  const renderer = new SketchRenderer(options);

  try {
    await renderer.init();

    const sketches = fs.readdirSync(sketchesDir)
      .filter(f => fs.statSync(path.join(sketchesDir, f)).isDirectory());

    console.log(`Processing ${sketches.length} sketches...`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const sketch of sketches) {
      const sketchPath = path.join(sketchesDir, sketch);
      const outputPath = path.join(outputDir, `${sketch}.png`);

      try {
        console.log(`  Rendering ${sketch}...`);
        const screenshot = await renderer.capture(sketchPath);
        fs.writeFileSync(outputPath, screenshot);
        console.log(`    Saved to ${outputPath}`);
      } catch (error) {
        console.error(`    Error: ${error.message}`);
      }
    }

  } finally {
    await renderer.close();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  SketchRenderer,
  batchCapture,
};

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command) {
    console.log(`
Visual Renderer for Generative Art Sketches

Commands:
  capture <sketch-path> [output.png]   Capture screenshot of a sketch
  batch <sketches-dir> <output-dir>    Batch capture all sketches
  analyze <sketch-path>                Analyze visual properties
  variations <sketch-path> [count]     Capture multiple hash variations

Options:
  --width=N       Canvas width (default: 700)
  --height=N      Canvas height (default: 700)
  --scale=N       Screenshot scale (default: 2)
  --delay=N       Capture delay in ms (default: 2000)

Examples:
  node render.js capture sketches/flow-fields
  node render.js capture sketches/flow-fields output.png --scale=4
  node render.js batch sketches/ thumbnails/
  node render.js analyze sketches/flow-fields
  node render.js variations sketches/flow-fields 6
`);
    return;
  }

  // Parse options
  const options = {};
  const positionalArgs = [];
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value ? Number(value) : true;
    } else {
      positionalArgs.push(arg);
    }
  }

  const renderer = new SketchRenderer(options);

  try {
    switch (command) {
      case 'capture': {
        const [sketchPath, outputPath = 'output.png'] = positionalArgs;
        if (!sketchPath) {
          console.error('Usage: node render.js capture <sketch-path> [output.png]');
          process.exit(1);
        }
        const screenshot = await renderer.capture(sketchPath, options);
        fs.writeFileSync(outputPath, screenshot);
        console.log(`Saved to ${outputPath}`);
        break;
      }

      case 'batch': {
        const [sketchesDir, outputDir] = positionalArgs;
        if (!sketchesDir || !outputDir) {
          console.error('Usage: node render.js batch <sketches-dir> <output-dir>');
          process.exit(1);
        }
        await batchCapture(sketchesDir, outputDir, options);
        break;
      }

      case 'analyze': {
        const [sketchPath] = positionalArgs;
        if (!sketchPath) {
          console.error('Usage: node render.js analyze <sketch-path>');
          process.exit(1);
        }
        const analysis = await renderer.analyze(sketchPath, options);
        console.log(JSON.stringify(analysis, null, 2));
        break;
      }

      case 'variations': {
        const [sketchPath, countStr = '4'] = positionalArgs;
        if (!sketchPath) {
          console.error('Usage: node render.js variations <sketch-path> [count]');
          process.exit(1);
        }
        const count = parseInt(countStr, 10);
        const variations = await renderer.captureVariations(sketchPath, count, options);
        for (let i = 0; i < variations.length; i++) {
          const filename = `variation-${i + 1}.png`;
          fs.writeFileSync(filename, variations[i].screenshot);
          console.log(`Saved ${filename} (hash: ${variations[i].hash.slice(0, 18)}...)`);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } finally {
    await renderer.close();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
