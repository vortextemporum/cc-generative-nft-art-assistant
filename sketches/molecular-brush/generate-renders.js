#!/usr/bin/env node

/**
 * Generate 100 renders of molecular-brush v2.6.0
 * Saves to renders/ directory with proper naming
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic import for puppeteer
const puppeteer = await import('puppeteer');

const RENDER_COUNT = 100;
const RENDER_DELAY = 4000; // 4 seconds for p5.brush
const OUTPUT_DIR = path.join(__dirname, 'renders');

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateHash() {
  return '0x' + Array(64).fill(0)
    .map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)])
    .join('');
}

async function main() {
  console.log(`Generating ${RENDER_COUNT} renders of molecular-brush v2.6.0...`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Render delay: ${RENDER_DELAY}ms (for p5.brush)\n`);

  const browser = await puppeteer.default.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=700,700',
    ],
  });

  const htmlPath = path.join(__dirname, 'index.html');
  const fileUrl = `file://${htmlPath}`;

  for (let i = 1; i <= RENDER_COUNT; i++) {
    const hash = await generateHash();
    const page = await browser.newPage();

    try {
      await page.setViewport({
        width: 700,
        height: 700,
        deviceScaleFactor: 2, // 2x for retina quality
      });

      await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

      // Set the hash and regenerate
      await page.evaluate((h) => {
        if (typeof window.setHash === 'function') {
          window.setHash(h);
        }
      }, hash);

      // Wait for p5.brush to render
      await new Promise(resolve => setTimeout(resolve, RENDER_DELAY));

      // Wait for rendering to complete
      await page.evaluate(() => {
        return new Promise((resolve) => {
          const checkRendering = () => {
            if (typeof window.isRendering === 'function' && !window.isRendering()) {
              resolve();
            } else {
              setTimeout(checkRendering, 100);
            }
          };
          checkRendering();
        });
      }).catch(() => {});

      // Extra buffer for p5.brush reDraw
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the canvas
      const canvas = await page.$('canvas');
      if (canvas) {
        const screenshot = await canvas.screenshot({ type: 'png' });
        const filename = `render-${String(i).padStart(3, '0')}-${hash.slice(2, 10)}.png`;
        const outputPath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(outputPath, screenshot);
        console.log(`[${i}/${RENDER_COUNT}] Saved ${filename}`);
      } else {
        console.log(`[${i}/${RENDER_COUNT}] Warning: No canvas found`);
      }

    } catch (error) {
      console.error(`[${i}/${RENDER_COUNT}] Error: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(`\nDone! Generated ${RENDER_COUNT} renders in ${OUTPUT_DIR}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
