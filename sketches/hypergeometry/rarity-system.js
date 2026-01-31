/**
 * HYPERGEOMETRY - Rarity System
 *
 * This file contains the original rarity-weighted selection system.
 * Kept for future use when implementing drops/collections with rarity tiers.
 *
 * Currently NOT used - sketch.js uses uniform random selection.
 */

// ============================================================================
// RARITY TIERS
// ============================================================================

export const RARITY_TIERS = {
  common: { weight: 0.40, color: '#888888', badge: '#2a2a3e' },
  uncommon: { weight: 0.35, color: '#4ade80', badge: '#1a3a2e' },
  rare: { weight: 0.18, color: '#60a5fa', badge: '#1a2a4e' },
  legendary: { weight: 0.07, color: '#fbbf24', badge: '#3a2a1a' }
};

// ============================================================================
// POLYTOPE RARITY ASSIGNMENTS
// ============================================================================

export const POLYTOPE_RARITY = {
  // Common (40%)
  hypercube: 'common',

  // Uncommon (35%)
  simplex: 'uncommon',
  crossPolytope: 'uncommon',
  duoprism33: 'uncommon',
  duoprism44: 'uncommon',
  duoprism55: 'uncommon',
  duoprism66: 'uncommon',
  duoprism34: 'uncommon',
  duoprism35: 'uncommon',

  // Rare (18%)
  cell24: 'rare',
  cliffordTorus: 'rare',
  rectifiedTesseract: 'rare',
  runcinatedTesseract: 'rare',

  // Legendary (7%)
  cell120: 'legendary',
  cell600: 'legendary',
  grandAntiprism: 'legendary'
};

// ============================================================================
// RARITY CURVES FOR UI VISUALIZATION
// ============================================================================

export const RARITY_CURVES = {
  polytopeType: {
    probabilities: [0.40, 0.35, 0.18, 0.07],
    labels: ['Common (Hypercube)', 'Uncommon (Simplex/Duoprisms)', 'Rare (24-Cell/Rectified)', 'Legendary (120/600/Grand)']
  },
  rotationType: {
    probabilities: [0.33, 0.33, 0.34],
    labels: ['Simple', 'Compound', 'Isoclinic']
  },
  morphType: {
    probabilities: [0.40, 0.35, 0.25],
    labels: ['Static', 'Interpolate', 'Nested']
  },
  csgType: {
    probabilities: [0.40, 0.25, 0.20, 0.15],
    labels: ['None', 'Union', 'Intersection', 'Difference']
  }
};

// ============================================================================
// RARITY-WEIGHTED SELECTION FUNCTIONS
// ============================================================================

/**
 * Roll a rarity tier based on weights
 * @param {Function} rnd - Random function (0-1)
 * @returns {string} Rarity tier name
 */
export function rollRarity(rnd) {
  const roll = rnd();
  const { legendary, rare, uncommon } = RARITY_TIERS;

  if (roll < legendary.weight) return 'legendary';
  if (roll < legendary.weight + rare.weight) return 'rare';
  if (roll < legendary.weight + rare.weight + uncommon.weight) return 'uncommon';
  return 'common';
}

/**
 * Select a polytope based on rarity-weighted distribution
 * @param {Function} rnd - Random function (0-1)
 * @param {Function} rndChoice - Random choice from array function
 * @returns {string} Polytope type key
 */
export function selectPolytopeByRarity(rnd, rndChoice) {
  const rarity = rollRarity(rnd);

  const byRarity = {
    common: ['hypercube'],
    uncommon: ['simplex', 'crossPolytope', 'duoprism33', 'duoprism44', 'duoprism55', 'duoprism66', 'duoprism34', 'duoprism35'],
    rare: ['cell24', 'cliffordTorus', 'rectifiedTesseract', 'runcinatedTesseract'],
    legendary: ['cell120', 'cell600', 'grandAntiprism']
  };

  return rndChoice(byRarity[rarity]);
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
// To use rarity-weighted selection:

import { selectPolytopeByRarity, POLYTOPE_RARITY, RARITY_CURVES } from './rarity-system.js';

// In generateFeatures():
const polytopeType = selectPolytopeByRarity(R, rndChoice);
const rarity = POLYTOPE_RARITY[polytopeType];

// For UI rarity curves display:
const curves = RARITY_CURVES;
*/
