/**
 * Visual Renderer Module for Generative Art
 *
 * Provides screenshot capture and structured visual analysis
 * for generative art sketches.
 *
 * Usage:
 *   import { captureSketch, analyzeSketch } from './services/renderer/index.js';
 *
 *   // Capture screenshot
 *   const screenshot = await captureSketch('sketches/my-sketch');
 *
 *   // Get structured analysis for Claude
 *   const analysis = await analyzeSketch('sketches/my-sketch');
 */

// Re-export from render.js
export {
  SketchRenderer,
  captureSketch,
  analyzeSketch,
  batchCapture,
  VERSION
} from './render.js';

// Re-export from analyze.js
export {
  analyzeCanvas,
  formatAnalysis
} from './analyze.js';
