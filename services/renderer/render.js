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
 *   node render.js analyze <sketch-path>
 *   node render.js analyze-json <sketch-path>
 *   node render.js variations <sketch-path> [count]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 700;
const DEFAULT_TIMEOUT = 10000; // 10 seconds for render
const CAPTURE_DELAY = 2000;    // Wait for animations to settle

export const VERSION = '2.0.0';

// Helper for delays (Puppeteer v22+ deprecated page.waitForTimeout)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// RENDERER CLASS
// ============================================================================

export class SketchRenderer {
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
      await sleep(options.delay || this.captureDelay);

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
   * Returns structured analysis with metrics, composition, and interpretation
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
      await sleep(this.captureDelay);

      // Import and use analyzeCanvas from analyze.js
      const { analyzeCanvas, formatAnalysis } = await import('./analyze.js');
      const canvasData = await analyzeCanvas(page);

      // Capture screenshot for reference
      const screenshot = await this.capture(sketchPath, options);

      // Get formatted analysis
      const analysis = formatAnalysis(canvasData, null);

      return {
        ...analysis,
        screenshot,
      };

    } finally {
      await page.close();
    }
  }

  /**
   * Analyze sketch and return only structured JSON (no screenshot)
   */
  async analyzeJson(sketchPath, options = {}) {
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
      await sleep(this.captureDelay);

      // Import and use analyzeCanvas from analyze.js
      const { analyzeCanvas, formatAnalysis } = await import('./analyze.js');
      const canvasData = await analyzeCanvas(page);

      return formatAnalysis(canvasData, null);

    } finally {
      await page.close();
    }
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Capture a single sketch screenshot
 * @param {string} sketchPath - Path to sketch directory or HTML file
 * @param {Object} options - Capture options
 * @returns {Promise<Buffer>} Screenshot buffer
 */
export async function captureSketch(sketchPath, options = {}) {
  const renderer = new SketchRenderer(options);
  try {
    return await renderer.capture(sketchPath, options);
  } finally {
    await renderer.close();
  }
}

/**
 * Analyze a sketch and return structured analysis
 * @param {string} sketchPath - Path to sketch directory or HTML file
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Structured analysis with metrics, composition, interpretation
 */
export async function analyzeSketch(sketchPath, options = {}) {
  const renderer = new SketchRenderer(options);
  try {
    return await renderer.analyzeJson(sketchPath, options);
  } finally {
    await renderer.close();
  }
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Batch capture screenshots for all sketches in a directory
 * @param {string} sketchesDir - Directory containing sketch subdirectories
 * @param {string} outputDir - Directory to save screenshots
 * @param {Object} options - Capture options, including --analyze flag
 */
export async function batchCapture(sketchesDir, outputDir, options = {}) {
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

        // If --analyze flag is set, also save analysis JSON
        if (options.analyze) {
          const analysisPath = path.join(outputDir, `${sketch}-analysis.json`);
          const analysis = await renderer.analyzeJson(sketchPath, options);
          fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
          console.log(`    Analysis saved to ${analysisPath}`);
        }
      } catch (error) {
        console.error(`    Error: ${error.message}`);
      }
    }

  } finally {
    await renderer.close();
  }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command) {
    console.log(`
Visual Renderer for Generative Art Sketches (v${VERSION})

Commands:
  capture <sketch-path> [output.png]   Capture screenshot of a sketch
  batch <sketches-dir> <output-dir>    Batch capture all sketches
  analyze <sketch-path>                Analyze visual properties (includes screenshot)
  analyze-json <sketch-path>           Analyze and output only structured JSON
  variations <sketch-path> [count]     Capture multiple hash variations

Options:
  --width=N       Canvas width (default: 700)
  --height=N      Canvas height (default: 700)
  --scale=N       Screenshot scale (default: 2)
  --delay=N       Capture delay in ms (default: 2000)
  --analyze       For batch: also output analysis JSON for each sketch

Examples:
  node render.js capture sketches/flow-fields
  node render.js capture sketches/flow-fields output.png --scale=4
  node render.js batch sketches/ thumbnails/
  node render.js batch sketches/ thumbnails/ --analyze
  node render.js analyze sketches/flow-fields
  node render.js analyze-json sketches/flow-fields
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
        // Remove screenshot from output (binary data)
        const { screenshot, ...jsonAnalysis } = analysis;
        console.log(JSON.stringify(jsonAnalysis, null, 2));
        break;
      }

      case 'analyze-json': {
        const [sketchPath] = positionalArgs;
        if (!sketchPath) {
          console.error('Usage: node render.js analyze-json <sketch-path>');
          process.exit(1);
        }
        const analysis = await renderer.analyzeJson(sketchPath, options);
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

// ESM main detection
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
