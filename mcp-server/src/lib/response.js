/**
 * Response Formatters for MCP Tools
 *
 * Philosophy: Teach technique first, show code on request
 * These formatters create technique-focused responses that help users
 * understand the "why" behind aesthetic choices, not just the "what".
 */

/**
 * Format a search result for technique-focused response
 * NOTE: Does not include code preview - that's what get_project_code is for
 *
 * @param {Object} searchResult - Raw search result from embedding search
 * @param {Object} enrichedData - Additional project data from rag-documents
 * @returns {Object} Formatted result with technique explanation
 */
export function formatSearchResult(searchResult, enrichedData = {}) {
  const {
    projectId,
    source,
    artist,
    scriptType,
    score
  } = searchResult;

  const {
    patterns = [],
    aesthetics = [],
    description = '',
    name = ''
  } = enrichedData;

  // Build technique explanation from patterns
  const techniqueExplanation = buildTechniqueExplanation(patterns, scriptType);

  // Build platform-specific links
  const links = buildProjectLinks(projectId, source);

  return {
    projectId,
    name: name || `Project ${projectId}`,
    artist: artist || 'Unknown',
    platform: source,
    framework: scriptType || 'unknown',
    score: score ? parseFloat(score.toFixed(4)) : undefined,

    // Technique-focused content
    technique: {
      framework: scriptType || 'unknown',
      patterns,
      aesthetics,
      whyItWorks: techniqueExplanation
    },

    // Brief description (truncated for token efficiency)
    description: description ? description.slice(0, 300) + (description.length > 300 ? '...' : '') : null,

    // Links for reference
    links,

    // Hint for getting full code
    hint: 'Use get_project_code to see full source'
  };
}

/**
 * Format a project for full code response
 *
 * @param {Object} project - Full project data with script
 * @returns {Object} Formatted code result
 */
export function formatCodeResult(project) {
  if (!project) {
    return { error: 'Project not found' };
  }

  const {
    name,
    artist,
    project_id,
    source,
    script_type,
    description,
    patterns,
    script
  } = project;

  return {
    projectId: project_id,
    name,
    artist,
    platform: source,
    framework: script_type,
    description: description || null,
    patterns: patterns || [],

    // Full source code
    script: script || null,
    scriptLength: script ? script.length : 0,

    // Technique hints for understanding the code
    techniqueHints: patterns ? buildTechniqueHints(patterns) : []
  };
}

/**
 * Build technique explanation from detected patterns
 * @private
 */
function buildTechniqueExplanation(patterns, scriptType) {
  if (!patterns || patterns.length === 0) {
    return 'Technique analysis not available';
  }

  const explanations = [];

  // Map patterns to explanations
  const patternExplanations = {
    perlin_noise: 'Uses Perlin noise for organic, natural-looking randomness',
    flow_field: 'Implements flow fields for particle movement along vector fields',
    particle_system: 'Uses a particle system for dynamic element management',
    recursion: 'Applies recursive algorithms for fractal or self-similar patterns',
    voronoi: 'Uses Voronoi diagrams for cellular/organic partitioning',
    trigonometry: 'Leverages trigonometric functions for curves and oscillation',
    nested_loops: 'Uses nested loops for grid or matrix-based compositions',
    color_manipulation: 'Implements custom color manipulation techniques',
    hsl_color: 'Uses HSL color space for intuitive color relationships',
    gradients: 'Creates smooth color gradients for depth or atmosphere',
    transformations: 'Uses geometric transformations (translate, rotate, scale)',
    animation: 'Includes animated/dynamic elements',
    vectors: 'Uses vector math for movement and physics',
    hash_derivation: 'Derives randomness from hash for deterministic output',
    fxhash_derivation: 'Uses fxhash for deterministic randomness on Tezos',
    value_mapping: 'Maps values between ranges for parameterization',
    oop_classes: 'Organized with object-oriented patterns and classes',
    interpolation: 'Uses interpolation for smooth transitions',
    curves: 'Draws bezier or spline curves',
    angles: 'Uses angle calculations for directional elements'
  };

  for (const pattern of patterns.slice(0, 5)) {
    if (patternExplanations[pattern]) {
      explanations.push(patternExplanations[pattern]);
    }
  }

  if (explanations.length === 0) {
    explanations.push(`Uses ${patterns.slice(0, 3).join(', ')} techniques`);
  }

  // Add framework context
  const frameworkContext = {
    p5js: 'Built with p5.js for creative coding',
    threejs: 'Uses Three.js for 3D rendering',
    webgl: 'Direct WebGL for high-performance graphics',
    regl: 'Uses regl for functional WebGL',
    svg: 'Generates SVG for vector output',
    tone: 'Uses Tone.js for audio synthesis'
  };

  if (scriptType && frameworkContext[scriptType]) {
    explanations.unshift(frameworkContext[scriptType]);
  }

  return explanations.join('. ') + '.';
}

/**
 * Build technique hints for understanding code
 * @private
 */
function buildTechniqueHints(patterns) {
  const hints = [];

  if (patterns.includes('hash_derivation') || patterns.includes('fxhash_derivation')) {
    hints.push('Look for seeded PRNG setup near the top (sfc32, mulberry32)');
  }
  if (patterns.includes('perlin_noise')) {
    hints.push('Search for noise() calls or custom noise implementation');
  }
  if (patterns.includes('particle_system')) {
    hints.push('Look for Particle class or particles array with update/draw methods');
  }
  if (patterns.includes('flow_field')) {
    hints.push('Look for vector field or angle grid calculations');
  }
  if (patterns.includes('oop_classes')) {
    hints.push('Code is organized into classes - start with the main class');
  }

  return hints;
}

/**
 * Build platform-specific links
 * @private
 */
function buildProjectLinks(projectId, source) {
  const links = {};

  if (source === 'artblocks') {
    // Art Blocks project ID format varies
    links.artblocks = `https://www.artblocks.io/collections/all/projects/${projectId}`;
  } else if (source === 'fxhash') {
    links.fxhash = `https://www.fxhash.xyz/generative/${projectId}`;
  }

  return Object.keys(links).length > 0 ? links : null;
}
