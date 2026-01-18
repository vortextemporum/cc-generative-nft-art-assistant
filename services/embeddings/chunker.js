/**
 * Smart Text Chunker for Generative Art Projects
 *
 * Splits project data into semantic chunks suitable for embedding.
 * Keeps chunks under 400 words (~512 tokens) for model context window.
 */

/**
 * Chunk a single project into semantic units
 * @param {Object} project - RAG document with content and metadata
 * @returns {Object[]} Array of chunk objects
 */
export function chunkProject(project) {
  const chunks = [];
  const { id, content, metadata = {} } = project;

  // Extract basic info from metadata
  const projectId = metadata.project_id || id;
  const source = metadata.source || 'unknown';
  const artist = metadata.artist || 'Unknown Artist';
  const scriptType = metadata.script_type || 'unknown';

  // Chunk 1: Metadata (always created)
  // Use the content field which already has a good summary format
  const metadataContent = content
    ? content.slice(0, 1500) // Limit to ~400 words
    : `Project ${projectId} by ${artist}`;

  chunks.push({
    id: `${id}_metadata`,
    type: 'metadata',
    content: metadataContent,
    projectId: id,
    source,
    artist,
    scriptType
  });

  // Chunk 2: Tags (if substantial aesthetics/patterns exist)
  const aesthetics = metadata.aesthetics || [];
  const patterns = metadata.patterns || [];

  if (aesthetics.length > 0 || patterns.length > 0) {
    const tagParts = [];

    if (aesthetics.length > 0) {
      tagParts.push(`Aesthetics: ${aesthetics.join(', ')}`);
    }

    if (patterns.length > 0) {
      tagParts.push(`Patterns: ${patterns.join(', ')}`);
    }

    const tagContent = tagParts.join('. ');

    // Only create tag chunk if it adds meaningful content
    if (tagContent.length > 30) {
      chunks.push({
        id: `${id}_tags`,
        type: 'tags',
        content: tagContent,
        projectId: id,
        source,
        artist,
        scriptType
      });
    }
  }

  return chunks;
}

/**
 * Chunk multiple projects
 * @param {Object[]} projects - Array of RAG documents
 * @returns {Object[]} Flattened array of all chunks
 */
export function chunkProjects(projects) {
  const allChunks = [];

  for (const project of projects) {
    const chunks = chunkProject(project);
    allChunks.push(...chunks);
  }

  return allChunks;
}

/**
 * Get statistics about chunking
 * @param {Object[]} projects - Array of RAG documents
 * @returns {Object} Chunking statistics
 */
export function getChunkingStats(projects) {
  let totalChunks = 0;
  let metadataChunks = 0;
  let tagChunks = 0;

  for (const project of projects) {
    const chunks = chunkProject(project);
    totalChunks += chunks.length;
    metadataChunks += chunks.filter(c => c.type === 'metadata').length;
    tagChunks += chunks.filter(c => c.type === 'tags').length;
  }

  return {
    totalProjects: projects.length,
    totalChunks,
    metadataChunks,
    tagChunks,
    avgChunksPerProject: (totalChunks / projects.length).toFixed(2)
  };
}
