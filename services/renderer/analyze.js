/**
 * Visual Analysis Module for Generative Art
 *
 * Extracts structured visual metrics from rendered canvases:
 * - Color distribution (dominant colors, diversity, saturation)
 * - Composition analysis (distribution pattern, density)
 * - Interpretation strings for Claude Code consumption
 *
 * Usage:
 *   const canvasData = await analyzeCanvas(page);
 *   const analysis = formatAnalysis(canvasData, screenshotPath);
 */

// ============================================================================
// CANVAS ANALYSIS
// ============================================================================

/**
 * Extract raw visual data from a Puppeteer page with canvas
 * @param {Object} page - Puppeteer page object
 * @returns {Promise<Object>} Raw canvas analysis data
 */
export async function analyzeCanvas(page) {
  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas found' };

    const ctx = canvas.getContext('2d');
    if (!ctx) return { error: 'Could not get canvas context' };

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // ========================================
    // COLOR ANALYSIS
    // ========================================

    const colorCounts = {};
    const hueHistogram = new Array(36).fill(0); // 10-degree buckets
    let totalBrightness = 0;
    let totalSaturation = 0;
    let coloredPixels = 0;
    let totalPixels = 0;
    let nonBackgroundPixels = 0;

    // Background detection: sample corners to estimate background color
    const corners = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1]
    ];

    let bgR = 0, bgG = 0, bgB = 0;
    for (const [cx, cy] of corners) {
      const idx = (cy * width + cx) * 4;
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
    }
    bgR = Math.round(bgR / 4);
    bgG = Math.round(bgG / 4);
    bgB = Math.round(bgB / 4);

    // 3x3 grid for composition analysis
    const gridCells = new Array(9).fill(0);
    const cellWidth = width / 3;
    const cellHeight = height / 3;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue; // Skip transparent
        totalPixels++;

        // Check if pixel differs from background
        const bgDiff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        if (bgDiff > 30) {
          nonBackgroundPixels++;

          // Grid cell assignment
          const cellX = Math.min(2, Math.floor(x / cellWidth));
          const cellY = Math.min(2, Math.floor(y / cellHeight));
          gridCells[cellY * 3 + cellX]++;
        }

        // Quantize color for counting (32-level quantization)
        const qr = Math.floor(r / 32) * 32;
        const qg = Math.floor(g / 32) * 32;
        const qb = Math.floor(b / 32) * 32;
        const key = `${qr},${qg},${qb}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;

        // HSL calculation for hue analysis
        const max = Math.max(r, g, b) / 255;
        const min = Math.min(r, g, b) / 255;
        const l = (max + min) / 2;
        const d = max - min;

        if (d > 0.01) { // Has saturation
          const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          let h;
          const rNorm = r / 255;
          const gNorm = g / 255;
          const bNorm = b / 255;

          if (max === rNorm) {
            h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
          } else if (max === gNorm) {
            h = ((bNorm - rNorm) / d + 2) / 6;
          } else {
            h = ((rNorm - gNorm) / d + 4) / 6;
          }

          hueHistogram[Math.floor(h * 35.99)]++;
          totalSaturation += s;
          coloredPixels++;
        }

        totalBrightness += l;
      }
    }

    // ========================================
    // DERIVED METRICS
    // ========================================

    // Dominant colors (top 10)
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([color, count]) => {
        const [r, g, b] = color.split(',').map(Number);
        return {
          rgb: [r, g, b],
          hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
          percentage: totalPixels > 0 ? parseFloat((count / totalPixels * 100).toFixed(1)) : 0
        };
      });

    // Color metrics
    const avgBrightness = totalPixels > 0 ? totalBrightness / totalPixels : 0;
    const avgSaturation = coloredPixels > 0 ? totalSaturation / coloredPixels : 0;

    // Color diversity: count hue buckets with > 1% of colored pixels
    const activeHues = hueHistogram.filter(h => coloredPixels > 0 && h > coloredPixels * 0.01).length;

    // Contrast detection: check if there's wide brightness range in dominant colors
    let minDomBrightness = 1, maxDomBrightness = 0;
    for (const color of sortedColors.slice(0, 5)) {
      const [r, g, b] = color.rgb;
      const br = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      minDomBrightness = Math.min(minDomBrightness, br);
      maxDomBrightness = Math.max(maxDomBrightness, br);
    }
    const hasHighContrast = (maxDomBrightness - minDomBrightness) > 0.5;

    // ========================================
    // COMPOSITION ANALYSIS
    // ========================================

    // Normalize grid weights to percentages
    const gridTotal = gridCells.reduce((a, b) => a + b, 0) || 1;
    const gridWeights = gridCells.map(c => parseFloat((c / gridTotal * 100).toFixed(1)));

    // Distribution pattern detection
    const center = gridWeights[4]; // Center cell
    const edges = [gridWeights[1], gridWeights[3], gridWeights[5], gridWeights[7]]; // Top, left, right, bottom
    const corners_wt = [gridWeights[0], gridWeights[2], gridWeights[6], gridWeights[8]];

    const avgEdge = edges.reduce((a, b) => a + b, 0) / 4;
    const avgCorner = corners_wt.reduce((a, b) => a + b, 0) / 4;

    let distribution;
    const variance = gridWeights.reduce((acc, w) => acc + Math.pow(w - 100/9, 2), 0) / 9;

    if (variance < 15) {
      distribution = 'uniform';
    } else if (center > avgEdge * 1.5 && center > avgCorner * 1.5) {
      distribution = 'centered';
    } else if (avgEdge > center * 1.3 || avgCorner > center * 1.3) {
      distribution = 'edge-heavy';
    } else if (avgCorner > avgEdge * 1.3) {
      distribution = 'corner-weighted';
    } else {
      distribution = 'balanced';
    }

    // Density calculation
    const densityRatio = totalPixels > 0 ? nonBackgroundPixels / totalPixels : 0;
    let density;
    if (densityRatio < 0.15) {
      density = 'sparse';
    } else if (densityRatio < 0.5) {
      density = 'moderate';
    } else {
      density = 'dense';
    }

    // ========================================
    // RETURN RAW DATA
    // ========================================

    return {
      dimensions: { width, height },
      colorData: {
        dominantColors: sortedColors,
        avgBrightness: parseFloat(avgBrightness.toFixed(3)),
        avgSaturation: parseFloat(avgSaturation.toFixed(3)),
        colorDiversity: activeHues,
        uniqueQuantizedColors: Object.keys(colorCounts).length,
        hueHistogram
      },
      flags: {
        isMonochrome: avgSaturation < 0.1,
        isDark: avgBrightness < 0.3,
        isLight: avgBrightness > 0.7,
        isPastel: avgSaturation > 0.1 && avgSaturation < 0.5 && avgBrightness > 0.6,
        isVibrant: avgSaturation > 0.6,
        hasHighContrast
      },
      compositionData: {
        distribution,
        density,
        densityRatio: parseFloat(densityRatio.toFixed(3)),
        gridWeights,
        background: { r: bgR, g: bgG, b: bgB }
      }
    };
  });
}

// ============================================================================
// INTERPRETATION GENERATION
// ============================================================================

/**
 * Generate human-readable color description
 */
function generateColorDescription(colorData, flags) {
  const parts = [];

  // Brightness descriptor
  if (flags.isDark) {
    parts.push('dark');
  } else if (flags.isLight) {
    parts.push('light');
  }

  // Saturation/style descriptor
  if (flags.isMonochrome) {
    parts.push('monochromatic');
  } else if (flags.isPastel) {
    parts.push('pastel');
  } else if (flags.isVibrant) {
    parts.push('vibrant');
  } else if (colorData.avgSaturation > 0.3) {
    parts.push('saturated');
  } else {
    parts.push('muted');
  }

  // Diversity descriptor
  if (colorData.colorDiversity <= 3) {
    parts.push('limited palette');
  } else if (colorData.colorDiversity >= 12) {
    parts.push('full spectrum');
  } else if (colorData.colorDiversity >= 8) {
    parts.push('varied palette');
  }

  // Dominant hue analysis
  const dominant = colorData.dominantColors[0];
  if (dominant && !flags.isMonochrome) {
    const [r, g, b] = dominant.rgb;
    const hue = getHueName(r, g, b);
    if (hue) {
      parts.push(`with ${hue} dominance`);
    }
  }

  // Contrast
  if (flags.hasHighContrast) {
    parts.push('high contrast');
  }

  return capitalizeFirst(parts.join(', '));
}

/**
 * Get hue name from RGB
 */
function getHueName(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // Check if it's grayscale
  if (max - min < 30) {
    if (max > 200) return 'white';
    if (max < 55) return 'black';
    return 'gray';
  }

  // Calculate hue
  let h;
  const d = max - min;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  // Map hue to color name
  const hue360 = h * 360;
  if (hue360 < 15 || hue360 >= 345) return 'red';
  if (hue360 < 45) return 'orange';
  if (hue360 < 75) return 'yellow';
  if (hue360 < 150) return 'green';
  if (hue360 < 195) return 'cyan';
  if (hue360 < 255) return 'blue';
  if (hue360 < 285) return 'purple';
  if (hue360 < 345) return 'magenta';
  return null;
}

/**
 * Generate human-readable composition description
 */
function generateCompositionDescription(compositionData) {
  const parts = [];

  // Distribution
  switch (compositionData.distribution) {
    case 'centered':
      parts.push('center-focused composition');
      break;
    case 'edge-heavy':
      parts.push('edge-weighted composition');
      break;
    case 'corner-weighted':
      parts.push('corner-weighted composition');
      break;
    case 'uniform':
      parts.push('uniformly distributed');
      break;
    default:
      parts.push('balanced composition');
  }

  // Density
  switch (compositionData.density) {
    case 'sparse':
      parts.push('with minimal elements');
      break;
    case 'moderate':
      parts.push('with moderate density');
      break;
    case 'dense':
      parts.push('with high density');
      break;
  }

  return capitalizeFirst(parts.join(' '));
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// FORMAT ANALYSIS
// ============================================================================

/**
 * Format raw canvas data into Claude-readable structured analysis
 * @param {Object} canvasData - Raw data from analyzeCanvas
 * @param {string|null} screenshotPath - Path to screenshot file (optional)
 * @returns {Object} Structured analysis for Claude Code
 */
export function formatAnalysis(canvasData, screenshotPath = null) {
  if (canvasData.error) {
    return {
      error: canvasData.error,
      metrics: null,
      composition: null,
      interpretation: null
    };
  }

  const { colorData, flags, compositionData, dimensions } = canvasData;

  return {
    dimensions,
    metrics: {
      colors: {
        dominant: colorData.dominantColors,
        diversity: colorData.colorDiversity,
        avgBrightness: colorData.avgBrightness,
        avgSaturation: colorData.avgSaturation,
        uniqueColors: colorData.uniqueQuantizedColors
      },
      flags: {
        monochrome: flags.isMonochrome,
        dark: flags.isDark,
        light: flags.isLight,
        pastel: flags.isPastel,
        vibrant: flags.isVibrant,
        highContrast: flags.hasHighContrast
      }
    },
    composition: {
      distribution: compositionData.distribution,
      density: compositionData.density,
      densityRatio: compositionData.densityRatio,
      gridWeights: compositionData.gridWeights,
      background: compositionData.background
    },
    interpretation: {
      colorDescription: generateColorDescription(colorData, flags),
      compositionDescription: generateCompositionDescription(compositionData),
      summary: `${generateColorDescription(colorData, flags)}. ${generateCompositionDescription(compositionData)}.`
    },
    screenshotPath
  };
}
