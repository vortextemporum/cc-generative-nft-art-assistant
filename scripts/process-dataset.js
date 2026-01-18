#!/usr/bin/env node

/**
 * Generative Art Dataset Processor
 *
 * Processes Art Blocks AND fxhash datasets into formats suitable for:
 * 1. RAG (Retrieval Augmented Generation) with embeddings
 * 2. Few-shot learning examples
 * 3. System prompt knowledge base
 *
 * Usage:
 *   node process-dataset.js data/artblocks-dataset.json
 *   node process-dataset.js fxhash-dataset.json
 *   node process-dataset.js data/artblocks-dataset.json fxhash-dataset.json
 *
 * Token-efficient processing:
 *   - Filters out scripts > MAX_SCRIPT_SIZE
 *   - Samples training examples to MAX_TRAINING_PER_PLATFORM
 *   - Uses fxhash tags for aesthetic detection
 */

const fs = require('fs');

// ============================================================================
// CONFIGURATION
// ============================================================================

const OUTPUT_DIR = './processed';

// Token-efficiency settings
const MAX_SCRIPT_SIZE = 50000;        // Skip scripts larger than 50KB for training
const MAX_TRAINING_PER_PLATFORM = 500; // Limit training examples per platform
const MAX_CODE_EXAMPLES = 300;         // Total code examples to keep
const MIN_INVOCATIONS_FOR_NOTABLE = 50; // Minimum mints to be "notable"

// Script type categories for analysis
const SCRIPT_CATEGORIES = {
  'p5js': ['p5', 'p5js', 'p5@1', 'p5.js'],
  'threejs': ['three', 'threejs', 'three.js'],
  'js': ['js', 'javascript', 'vanilla'],
  'paper': ['paper', 'paperjs'],
  'tone': ['tone', 'tonejs'],
  'regl': ['regl'],
  'svg': ['svg'],
  'custom': ['custom']
};

// Aesthetic/style keywords to extract
const AESTHETIC_KEYWORDS = [
  // Visual styles
  'abstract', 'geometric', 'organic', 'minimalist', 'maximalist', 'chaotic',
  'orderly', 'symmetrical', 'asymmetrical', 'fractal', 'recursive',
  // Techniques
  'noise', 'perlin', 'simplex', 'flow field', 'particle', 'generative',
  'algorithmic', 'procedural', 'parametric', 'mathematical',
  // Color
  'monochrome', 'gradient', 'palette', 'vibrant', 'muted', 'pastel',
  'contrast', 'complementary', 'analogous',
  // Form
  'grid', 'pattern', 'tessellation', 'polygon', 'curve', 'line',
  'circle', 'spiral', 'wave', 'mesh', '3d', '2d',
  // Mood/feel
  'serene', 'dynamic', 'static', 'motion', 'rhythm', 'harmony',
  'tension', 'balance', 'composition'
];

// ============================================================================
// MAIN PROCESSING
// ============================================================================

function loadDataset(path) {
  console.log(`Loading dataset from ${path}...`);
  const raw = fs.readFileSync(path, 'utf8');
  const data = JSON.parse(raw);
  const source = detectSource(data);
  console.log(`Loaded ${data.projects?.length || 0} projects from ${source}`);
  return { data, source };
}

function detectSource(data) {
  // Detect if Art Blocks or fxhash based on metadata or project structure
  if (data.metadata?.source === 'fxhash') return 'fxhash';
  if (data.metadata?.source === 'artblocks') return 'artblocks';
  // Fallback: check first project
  const first = data.projects?.[0];
  if (first?.generative_uri || first?.tags) return 'fxhash';
  return 'artblocks';
}

function normalizeProject(project, source) {
  // Normalize to common schema for processing
  const normalized = {
    id: project.id,
    project_id: project.project_id,
    name: project.name,
    artist_name: project.artist_name,
    description: project.description || '',
    script: project.script || '',
    script_type: null,
    invocations: project.invocations || 0,
    max_invocations: project.max_invocations || project.supply || 0,
    source: source,
    tags: [],
    license: project.license || null,
  };

  // Source-specific normalization
  if (source === 'fxhash') {
    normalized.script_type = project.script_type || null;
    normalized.tags = project.tags || [];
    // fxhash scripts often include HTML wrapper - extract just JS if possible
    if (normalized.script && normalized.script.includes('<script')) {
      // Keep as-is for now, but note it's wrapped
      normalized.is_html_wrapped = true;
    }
  } else {
    // Art Blocks
    normalized.script_type = project.script_type_and_version || null;
    normalized.license = project.license;
  }

  return normalized;
}

function loadAndMergeDatasets(paths) {
  const allProjects = [];
  const sources = {};

  for (const path of paths) {
    if (!fs.existsSync(path)) {
      console.warn(`Warning: ${path} not found, skipping`);
      continue;
    }
    const { data, source } = loadDataset(path);
    const projects = data.projects || [];

    // Normalize and add source tracking
    for (const p of projects) {
      allProjects.push(normalizeProject(p, source));
    }

    sources[source] = (sources[source] || 0) + projects.length;
  }

  console.log(`\nTotal: ${allProjects.length} projects from ${Object.keys(sources).length} sources`);
  for (const [src, count] of Object.entries(sources)) {
    console.log(`  - ${src}: ${count} projects`);
  }

  return { projects: allProjects, sources };
}

function detectScriptType(project) {
  // Use pre-detected script_type from normalized project
  const scriptType = (project.script_type || '').toLowerCase();
  const scriptInfo = (project.script_type_and_version || '').toLowerCase();
  const dependency = (project.dependency || '').toLowerCase();
  const script = (project.script || '').toLowerCase();

  // Check direct script_type first (from fxhash)
  for (const [category, keywords] of Object.entries(SCRIPT_CATEGORIES)) {
    for (const kw of keywords) {
      if (scriptType.includes(kw) || scriptInfo.includes(kw) || dependency.includes(kw)) {
        return category;
      }
    }
  }

  // Detect from script content
  if (script.includes('createcanvas') || script.includes('setup()')) return 'p5js';
  if (script.includes('three.') || script.includes('scene.add')) return 'threejs';
  if (script.includes('paper.')) return 'paper';
  if (script.includes('regl(') || script.includes('regl.')) return 'regl';
  if (script.includes('webgl') || script.includes('gl.bindBuffer')) return 'webgl';
  if (script.includes('<svg') || script.includes('createElementNS')) return 'svg';

  return 'unknown';
}

function extractAesthetics(project) {
  const text = [
    project.name || '',
    project.description || '',
    project.script || ''
  ].join(' ').toLowerCase();

  // Start with keyword matches from text
  const aesthetics = new Set(
    AESTHETIC_KEYWORDS.filter(kw => text.includes(kw.toLowerCase()))
  );

  // Add fxhash tags that match aesthetic keywords (normalized)
  if (project.tags && Array.isArray(project.tags)) {
    for (const tag of project.tags) {
      const normalizedTag = tag.toLowerCase().replace(/[_-]/g, ' ');
      // Check if tag is or contains an aesthetic keyword
      for (const kw of AESTHETIC_KEYWORDS) {
        if (normalizedTag.includes(kw.toLowerCase()) || kw.toLowerCase().includes(normalizedTag)) {
          aesthetics.add(kw);
        }
      }
      // Also add common fxhash tags as aesthetics if relevant
      if (['generative', 'abstract', 'geometric', 'noise', 'animation', 'colorful', 'minimalist'].includes(normalizedTag)) {
        aesthetics.add(normalizedTag);
      }
    }
  }

  return Array.from(aesthetics);
}

function extractCodePatterns(script) {
  if (!script) return [];
  
  const patterns = [];
  
  // Detect common generative art patterns
  if (/noise\s*\(/.test(script)) patterns.push('perlin_noise');
  if (/random\s*\(/.test(script)) patterns.push('randomness');
  if (/for\s*\([^)]*;\s*[^)]*<[^)]*;\s*[^)]*\+\+\s*\)\s*\{[\s\S]*for\s*\(/.test(script)) patterns.push('nested_loops');
  if (/lerp\s*\(/.test(script)) patterns.push('interpolation');
  if (/map\s*\(/.test(script)) patterns.push('value_mapping');
  if (/sin\s*\(|cos\s*\(/.test(script)) patterns.push('trigonometry');
  if (/atan2?\s*\(/.test(script)) patterns.push('angles');
  if (/sqrt\s*\(|pow\s*\(/.test(script)) patterns.push('math_functions');
  if (/class\s+\w+/.test(script)) patterns.push('oop_classes');
  if (/push\s*\(\s*\)|pop\s*\(\s*\)/.test(script)) patterns.push('transform_stack');
  if (/translate\s*\(|rotate\s*\(|scale\s*\(/.test(script)) patterns.push('transformations');
  if (/bezier|curve/.test(script)) patterns.push('curves');
  if (/vertex\s*\(|beginShape/.test(script)) patterns.push('custom_shapes');
  if (/color\s*\(|fill\s*\(|stroke\s*\(/.test(script)) patterns.push('color_manipulation');
  if (/hsl|hsb|hsv/i.test(script)) patterns.push('hsl_color');
  if (/gradient/i.test(script)) patterns.push('gradients');
  if (/particle|system/i.test(script)) patterns.push('particle_system');
  if (/vector|vec2|vec3/i.test(script)) patterns.push('vectors');
  if (/recursive|self\s*\(/.test(script)) patterns.push('recursion');
  if (/requestAnimationFrame|draw\s*\(\s*\)\s*\{/.test(script)) patterns.push('animation');
  if (/tokenData|hash/i.test(script)) patterns.push('hash_derivation');
  // fxhash-specific patterns
  if (/fxrand\s*\(/.test(script)) patterns.push('fxhash_random');
  if (/fxhash/i.test(script)) patterns.push('fxhash_derivation');
  if (/\$fx\./.test(script)) patterns.push('fx_features');

  return patterns;
}

function analyzeScript(script) {
  if (!script) return null;
  
  return {
    length: script.length,
    lines: script.split('\n').length,
    has_setup: /function\s+setup|setup\s*[=:]/.test(script),
    has_draw: /function\s+draw|draw\s*[=:]/.test(script),
    uses_hash: /tokenData|hash/i.test(script),
    patterns: extractCodePatterns(script),
    // Complexity indicators
    function_count: (script.match(/function\s+\w+/g) || []).length,
    class_count: (script.match(/class\s+\w+/g) || []).length,
    loop_count: (script.match(/for\s*\(|while\s*\(/g) || []).length,
  };
}

// ============================================================================
// OUTPUT GENERATORS
// ============================================================================

function generateTrainingExamples(projects, sources) {
  /**
   * Create instruction-response pairs for few-shot learning
   * Token-efficient: filters large scripts and samples per platform
   */
  const examplesBySource = {};

  // Initialize per-source buckets
  for (const source of Object.keys(sources)) {
    examplesBySource[source] = [];
  }

  // Sort by invocations (most popular first) to prioritize quality examples
  const sortedProjects = [...projects]
    .filter(p => p.script && p.description && p.script.length <= MAX_SCRIPT_SIZE)
    .sort((a, b) => (b.invocations || 0) - (a.invocations || 0));

  for (const p of sortedProjects) {
    const source = p.source || 'unknown';
    if (!examplesBySource[source]) examplesBySource[source] = [];

    // Skip if we've hit the limit for this source
    if (examplesBySource[source].length >= MAX_TRAINING_PER_PLATFORM * 3) continue;

    const scriptType = detectScriptType(p);
    const aesthetics = extractAesthetics(p);
    const analysis = analyzeScript(p.script);

    // Example 1: Describe what code does
    examplesBySource[source].push({
      type: 'code_to_description',
      instruction: `Analyze this generative art code and describe what it creates visually:\n\n\`\`\`javascript\n${p.script.slice(0, 2000)}\n\`\`\``,
      response: `This is "${p.name}" by ${p.artist_name}. ${p.description}`,
      metadata: { project_id: p.project_id, script_type: scriptType, source }
    });

    // Example 2: Describe aesthetics
    if (aesthetics.length > 0) {
      examplesBySource[source].push({
        type: 'aesthetic_analysis',
        instruction: `What aesthetic qualities and visual style does this generative art project embody? Project: "${p.name}" by ${p.artist_name}`,
        response: `The aesthetic qualities include: ${aesthetics.join(', ')}. ${p.description}`,
        metadata: { project_id: p.project_id, aesthetics, source }
      });
    }

    // Example 3: Technical breakdown
    if (analysis && analysis.patterns.length > 0) {
      examplesBySource[source].push({
        type: 'technical_analysis',
        instruction: `What programming techniques and patterns are used in this generative art?\n\nProject: "${p.name}"\nScript type: ${scriptType}`,
        response: `This ${scriptType} project uses the following techniques: ${analysis.patterns.join(', ')}. The code is ${analysis.lines} lines with ${analysis.function_count} functions and ${analysis.class_count} classes.`,
        metadata: { project_id: p.project_id, analysis, source }
      });
    }
  }

  // Combine and log stats
  const allExamples = [];
  for (const [source, examples] of Object.entries(examplesBySource)) {
    const limited = examples.slice(0, MAX_TRAINING_PER_PLATFORM * 3);
    console.log(`     ${source}: ${limited.length} examples`);
    allExamples.push(...limited);
  }

  return allExamples;
}

function generateRAGDocuments(projects) {
  /**
   * Create documents optimized for retrieval/embedding
   * Token-efficient: only includes project overviews, NOT full scripts
   * (Full scripts are in code-examples.json for the most notable projects)
   */
  const documents = [];

  for (const p of projects) {
    const scriptType = detectScriptType(p);
    const aesthetics = extractAesthetics(p);
    const analysis = analyzeScript(p.script);
    const source = p.source || 'unknown';

    // Main project document (metadata only - no full scripts to save tokens)
    documents.push({
      id: `${source}_project_${p.project_id}`,
      type: 'project_overview',
      content: [
        `Project: ${p.name}`,
        `Artist: ${p.artist_name}`,
        `Platform: ${source}`,
        `Description: ${p.description || 'No description'}`,
        `Script Type: ${scriptType}`,
        `Aesthetics: ${aesthetics.join(', ') || 'Not analyzed'}`,
        `Tags: ${(p.tags || []).join(', ') || 'None'}`,
        `Invocations: ${p.invocations}/${p.max_invocations}`,
        analysis ? `Patterns: ${analysis.patterns.join(', ')}` : '',
      ].filter(Boolean).join('\n'),
      metadata: {
        project_id: p.project_id,
        artist: p.artist_name,
        script_type: scriptType,
        aesthetics,
        source,
        has_script: !!p.script,
        script_length: p.script?.length || 0,
        patterns: analysis?.patterns || []
      }
    });
  }

  return documents;
}

function generateSystemPromptKnowledge(projects, sources) {
  /**
   * Distill dataset into knowledge for system prompts
   * Handles multiple platforms (Art Blocks, fxhash, etc.)
   */

  // Aggregate statistics per source and combined
  const stats = {
    total_projects: projects.length,
    with_scripts: projects.filter(p => p.script).length,
    script_types: {},
    all_aesthetics: {},
    all_patterns: {},
    all_tags: {},  // fxhash tags
    artists: new Set(),
    by_source: {},
  };

  // Initialize per-source stats
  for (const source of Object.keys(sources)) {
    stats.by_source[source] = {
      total: 0,
      with_scripts: 0,
      artists: new Set(),
      script_types: {},
    };
  }

  const topProjects = [];

  for (const p of projects) {
    const source = p.source || 'unknown';
    const scriptType = detectScriptType(p);
    const aesthetics = extractAesthetics(p);
    const patterns = extractCodePatterns(p.script);

    // Combined stats
    stats.script_types[scriptType] = (stats.script_types[scriptType] || 0) + 1;
    stats.artists.add(p.artist_name);

    for (const a of aesthetics) {
      stats.all_aesthetics[a] = (stats.all_aesthetics[a] || 0) + 1;
    }
    for (const pat of patterns) {
      stats.all_patterns[pat] = (stats.all_patterns[pat] || 0) + 1;
    }
    // Track fxhash tags
    for (const tag of (p.tags || [])) {
      stats.all_tags[tag] = (stats.all_tags[tag] || 0) + 1;
    }

    // Per-source stats
    if (stats.by_source[source]) {
      stats.by_source[source].total++;
      if (p.script) stats.by_source[source].with_scripts++;
      stats.by_source[source].artists.add(p.artist_name);
      stats.by_source[source].script_types[scriptType] =
        (stats.by_source[source].script_types[scriptType] || 0) + 1;
    }

    // Collect notable projects (lower threshold for fxhash due to different scales)
    const threshold = source === 'fxhash' ? MIN_INVOCATIONS_FOR_NOTABLE : 500;
    if (p.invocations > threshold && p.description) {
      topProjects.push({
        name: p.name,
        artist: p.artist_name,
        description: p.description?.slice(0, 300),
        script_type: scriptType,
        invocations: p.invocations,
        source
      });
    }
  }

  stats.artists = stats.artists.size;

  // Convert artist sets to counts
  for (const source of Object.keys(stats.by_source)) {
    stats.by_source[source].artists = stats.by_source[source].artists.size;
  }

  // Sort and limit
  topProjects.sort((a, b) => b.invocations - a.invocations);
  const topProjectsList = topProjects.slice(0, 100); // More since we have 2 platforms

  // Generate knowledge document
  const platformOverviews = [];
  if (stats.by_source.artblocks) {
    const ab = stats.by_source.artblocks;
    platformOverviews.push(`Art Blocks (Ethereum): ${ab.total} projects by ${ab.artists} artists`);
  }
  if (stats.by_source.fxhash) {
    const fx = stats.by_source.fxhash;
    platformOverviews.push(`fxhash (Tezos): ${fx.total} projects by ${fx.artists} artists`);
  }

  const knowledge = {
    overview: `Combined generative art knowledge from ${Object.keys(sources).length} platforms: ${platformOverviews.join('; ')}. Total: ${stats.total_projects} projects, ${stats.with_scripts} with scripts.`,

    platforms: stats.by_source,

    script_types: stats.script_types,

    common_aesthetics: Object.entries(stats.all_aesthetics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([k, v]) => ({ term: k, count: v })),

    common_patterns: Object.entries(stats.all_patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([k, v]) => ({ pattern: k, count: v })),

    top_tags: Object.entries(stats.all_tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([k, v]) => ({ tag: k, count: v })),

    notable_projects: topProjectsList,

    techniques_guide: {
      artblocks_hash: "Art Blocks projects use tokenData.hash (a 64-char hex string) to seed deterministic randomness. Common approach: parse hex pairs as values 0-255, or use a seeded PRNG like sfc32.",

      fxhash_random: "fxhash projects use fxrand() for deterministic randomness, seeded from the fxhash string. The $fx object provides fxrand(), fxpreview(), and $fx.features() for feature declaration.",

      common_prng: "Both platforms commonly use mulberry32 or sfc32 algorithms. Art Blocks seeds from tokenData.hash, fxhash from the fxhash string.",

      p5js_structure: "p5.js projects typically have setup() for initialization and draw() for rendering. Use createCanvas(), background(), fill(), stroke(), rect(), ellipse(), line(), etc.",

      threejs_structure: "Three.js projects create a Scene, Camera, Renderer, and add Meshes with Geometries and Materials. Use requestAnimationFrame for animation.",

      feature_declaration: "Art Blocks: tokenData.features object. fxhash: $fx.features({ name: value }) call. Features determine rarity and visual properties.",

      fxhash_specifics: "fxhash projects are stored on IPFS. Scripts may include HTML wrapper. Call fxpreview() when ready for thumbnail capture."
    }
  };

  return knowledge;
}

function generateCodeExamples(projects) {
  /**
   * Extract clean, annotated code examples
   * Token-efficient: limits script size and total count
   */
  const examples = [];

  for (const p of projects) {
    // Skip if no script, too small, or too large
    if (!p.script || p.script.length < 500 || p.script.length > MAX_SCRIPT_SIZE) continue;

    const scriptType = detectScriptType(p);
    const patterns = extractCodePatterns(p.script);
    const source = p.source || 'unknown';

    // Only include well-documented or notable projects
    const threshold = source === 'fxhash' ? 20 : 100;
    if (p.invocations > threshold || p.description?.length > 100) {
      examples.push({
        name: p.name,
        artist: p.artist_name,
        project_id: p.project_id,
        source,
        script_type: scriptType,
        description: p.description,
        patterns: patterns,
        script: p.script,
        script_length: p.script.length,
        invocations: p.invocations
      });
    }
  }

  // Sort by invocations (popularity)
  examples.sort((a, b) => (b.invocations || 0) - (a.invocations || 0));

  // Limit total and show distribution
  const limited = examples.slice(0, MAX_CODE_EXAMPLES);
  const bySource = {};
  for (const ex of limited) {
    bySource[ex.source] = (bySource[ex.source] || 0) + 1;
  }
  console.log(`     Distribution: ${Object.entries(bySource).map(([s,c]) => `${s}:${c}`).join(', ')}`);

  return limited;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  // Support multiple dataset files as arguments
  const args = process.argv.slice(2);
  const inputPaths = args.length > 0 ? args : ['data/artblocks-dataset.json', 'fxhash-dataset.json'];

  // Check at least one file exists
  const existingPaths = inputPaths.filter(p => fs.existsSync(p));
  if (existingPaths.length === 0) {
    console.error('No dataset files found. Tried:', inputPaths.join(', '));
    console.error('Usage: node process-dataset.js [dataset1.json] [dataset2.json] ...');
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load and merge datasets
  console.log("\n" + "=".repeat(60));
  console.log("PROCESSING DATASETS FOR AI TRAINING");
  console.log("=".repeat(60) + "\n");

  const { projects, sources } = loadAndMergeDatasets(existingPaths);

  console.log("\n" + "-".repeat(40));
  console.log(`Token-efficient settings:`);
  console.log(`  Max script size: ${MAX_SCRIPT_SIZE} bytes`);
  console.log(`  Max training examples per platform: ${MAX_TRAINING_PER_PLATFORM * 3}`);
  console.log(`  Max code examples total: ${MAX_CODE_EXAMPLES}`);
  console.log("-".repeat(40) + "\n");

  // 1. Generate training examples
  console.log("1. Generating training examples...");
  const examples = generateTrainingExamples(projects, sources);
  fs.writeFileSync(
    `${OUTPUT_DIR}/training-examples.json`,
    JSON.stringify(examples, null, 2)
  );
  console.log(`   Total: ${examples.length} examples\n`);

  // 2. Generate RAG documents (metadata only, no scripts)
  console.log("2. Generating RAG documents (metadata only)...");
  const ragDocs = generateRAGDocuments(projects);
  fs.writeFileSync(
    `${OUTPUT_DIR}/rag-documents.json`,
    JSON.stringify(ragDocs, null, 2)
  );
  console.log(`   Created ${ragDocs.length} documents\n`);

  // 3. Generate system prompt knowledge
  console.log("3. Generating system prompt knowledge...");
  const knowledge = generateSystemPromptKnowledge(projects, sources);
  fs.writeFileSync(
    `${OUTPUT_DIR}/system-knowledge.json`,
    JSON.stringify(knowledge, null, 2)
  );
  console.log(`   Created knowledge base\n`);

  // 4. Generate code examples
  console.log("4. Extracting code examples...");
  const codeExamples = generateCodeExamples(projects);
  fs.writeFileSync(
    `${OUTPUT_DIR}/code-examples.json`,
    JSON.stringify(codeExamples, null, 2)
  );
  console.log(`   Extracted ${codeExamples.length} code examples\n`);

  // 5. Generate a ready-to-use system prompt
  console.log("5. Generating system prompt...");
  const systemPrompt = generateSystemPrompt(knowledge, codeExamples.slice(0, 10));
  fs.writeFileSync(
    `${OUTPUT_DIR}/system-prompt.md`,
    systemPrompt
  );
  console.log(`   Created system prompt`);

  // Calculate output sizes
  const outputSizes = {};
  for (const file of ['training-examples.json', 'rag-documents.json', 'system-knowledge.json', 'code-examples.json', 'system-prompt.md']) {
    const path = `${OUTPUT_DIR}/${file}`;
    if (fs.existsSync(path)) {
      outputSizes[file] = (fs.statSync(path).size / 1024 / 1024).toFixed(2) + ' MB';
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("COMPLETE");
  console.log("=".repeat(60));
  console.log(`\nOutput files in ${OUTPUT_DIR}/:`);
  console.log(`  - training-examples.json  ${outputSizes['training-examples.json'] || ''}`);
  console.log(`  - rag-documents.json      ${outputSizes['rag-documents.json'] || ''}`);
  console.log(`  - system-knowledge.json   ${outputSizes['system-knowledge.json'] || ''}`);
  console.log(`  - code-examples.json      ${outputSizes['code-examples.json'] || ''}`);
  console.log(`  - system-prompt.md        ${outputSizes['system-prompt.md'] || ''}`);
}

function generateSystemPrompt(knowledge, exampleProjects) {
  // Build platform-specific sections
  const platformSections = [];
  if (knowledge.platforms?.artblocks) {
    const ab = knowledge.platforms.artblocks;
    platformSections.push(`**Art Blocks (Ethereum)**: ${ab.total} projects by ${ab.artists} artists`);
  }
  if (knowledge.platforms?.fxhash) {
    const fx = knowledge.platforms.fxhash;
    platformSections.push(`**fxhash (Tezos)**: ${fx.total} projects by ${fx.artists} artists`);
  }

  // Notable projects grouped by platform
  const artblocksProjects = knowledge.notable_projects.filter(p => p.source === 'artblocks').slice(0, 10);
  const fxhashProjects = knowledge.notable_projects.filter(p => p.source === 'fxhash').slice(0, 10);

  return `# Generative Art Assistant

You are an expert generative art assistant trained on data from Art Blocks and fxhash, the premier platforms for on-chain generative art. You understand code, aesthetics, and the creative process behind algorithmic art.

## Your Knowledge

### Platform Overview
${knowledge.overview}

${platformSections.map(s => `- ${s}`).join('\n')}

### Script Technologies
The most common frameworks used:
${Object.entries(knowledge.script_types)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .map(([type, count]) => `- **${type}**: ${count} projects`)
  .join('\n')}

### Common Aesthetic Themes
${knowledge.common_aesthetics.slice(0, 15).map(a => `- ${a.term} (${a.count} projects)`).join('\n')}

### Technical Patterns
${knowledge.common_patterns.slice(0, 12).map(p => `- ${p.pattern}: used in ${p.count} projects`).join('\n')}

${knowledge.top_tags ? `### Popular Tags (fxhash)
${knowledge.top_tags.slice(0, 15).map(t => `- ${t.tag} (${t.count})`).join('\n')}
` : ''}

## Key Techniques

### Art Blocks Hash-Based Randomness
${knowledge.techniques_guide.artblocks_hash}

### fxhash Randomness
${knowledge.techniques_guide.fxhash_random}

### Common PRNG Implementation
${knowledge.techniques_guide.common_prng}

### p5.js Structure
${knowledge.techniques_guide.p5js_structure}

### Three.js Structure
${knowledge.techniques_guide.threejs_structure}

### Feature Declaration
${knowledge.techniques_guide.feature_declaration}

### fxhash Specifics
${knowledge.techniques_guide.fxhash_specifics}

## Notable Projects

### Art Blocks
${artblocksProjects.map(p =>
  `**${p.name}** by ${p.artist} (${p.invocations} editions) - ${p.script_type}`
).join('\n')}

### fxhash
${fxhashProjects.map(p =>
  `**${p.name}** by ${p.artist} (${p.invocations} editions) - ${p.script_type}`
).join('\n')}

## Your Capabilities

1. **Analyze Code**: Explain what generative art code does visually and technically
2. **Generate Code**: Write new generative art scripts in p5.js, Three.js, or vanilla JS
3. **Explain Techniques**: Teach noise functions, fractals, particle systems, etc.
4. **Debug**: Help fix issues in generative art code
5. **Platform Integration**: Implement deterministic randomness for Art Blocks (tokenData.hash) or fxhash (fxrand)
6. **Feature Systems**: Design rarity/trait systems using platform-specific feature declarations

## Response Style

- Be precise about technical details
- Use correct terminology (vertices, transforms, noise, etc.)
- Provide working code examples when relevant
- Explain the "why" behind aesthetic choices
- Reference relevant projects from both Art Blocks and fxhash when helpful
`;
}

main().catch(console.error);
