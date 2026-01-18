# Phase 01: Semantic Search - Research

**Researched:** 2026-01-18
**Domain:** Embeddings, Vector Search, Node.js ML
**Confidence:** HIGH

## Summary

This research covers building a semantic search system for 28,338 generative art projects using local embeddings with Transformers.js. The stack is well-established: `@huggingface/transformers` for embeddings, file-based JSON storage for vectors, and custom indexing for the search interface.

The key finding is that **bge-small-en-v1.5 is the optimal model** for this use case. It provides 384-dimensional embeddings with a 512-token context window, outperforming MiniLM-L6-v2 on retrieval benchmarks while maintaining similar speed and model size (~33MB). The existing code in `services/embeddings/embed.js` uses MiniLM-L6-v2 and should be migrated to bge-small-en-v1.5 for better retrieval accuracy.

For 28k projects, the embedding file will be approximately 80-120MB (depending on chunking strategy). With file-based storage and in-memory search, query latency will be sub-10ms after initial load. The system should use a singleton pattern for the model to avoid repeated initialization.

**Primary recommendation:** Use `Xenova/bge-small-en-v1.5` model with smart chunking (metadata + description + code structure separately), file-based vector storage, and a simple cosine similarity search with metadata filtering.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @huggingface/transformers | ^3.x | Local embedding generation | Official HuggingFace library for JS, replaces @xenova/transformers |
| Xenova/bge-small-en-v1.5 | latest | Embedding model | Best retrieval accuracy for size (33M params, 384 dims, MIT license) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vectra | ^1.x | Local vector storage | Optional - if metadata filtering becomes complex |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| bge-small-en-v1.5 | all-MiniLM-L6-v2 | Already in codebase but ~5-8% lower retrieval accuracy |
| bge-small-en-v1.5 | bge-base-en-v1.5 | Higher accuracy but 768 dims = 2x storage, slower |
| Custom JSON storage | Vectra library | Vectra adds metadata filtering but more complexity |
| Custom JSON storage | SQLite + vectors | More robust but adds dependency, overkill for 28k docs |

**Installation:**
```bash
npm install @huggingface/transformers
# Note: @xenova/transformers v2.17.0 is in package.json, should migrate to @huggingface/transformers v3.x
```

**Migration Note:** The project currently has `@xenova/transformers` in package.json. The library has been moved to `@huggingface/transformers` for v3. Both work, but v3 has WebGPU support and is the official path forward. The API is nearly identical - just change the import.

## Architecture Patterns

### Recommended Project Structure
```
services/
├── embeddings/
│   ├── index.js              # Main exports (search, embed, generate)
│   ├── model.js              # Model singleton, initialization
│   ├── chunker.js            # Smart text chunking for long content
│   ├── storage.js            # Vector persistence (JSON file)
│   └── search.js             # Search logic, filtering, ranking
│
├── cli/
│   └── search-cli.js         # CLI interface
│
processed/
├── embeddings/
│   ├── metadata.json         # Index metadata (model, version, counts)
│   ├── vectors-metadata.json # Embeddings for name+desc+tags
│   ├── vectors-code.json     # Embeddings for code structure/patterns
│   └── checksums.json        # For incremental updates
```

### Pattern 1: Model Singleton with Lazy Loading
**What:** Load the embedding model once, reuse for all operations
**When to use:** Always - model initialization takes 2-5 seconds
**Example:**
```javascript
// Source: HuggingFace Transformers.js docs - Node.js tutorial
import { pipeline, env } from '@huggingface/transformers';

class EmbeddingModel {
  static instance = null;
  static MODEL_ID = 'Xenova/bge-small-en-v1.5';

  static async getInstance(progressCallback = null) {
    if (this.instance === null) {
      env.cacheDir = './.cache/models';
      this.instance = await pipeline('feature-extraction', this.MODEL_ID, {
        progress_callback: progressCallback
      });
    }
    return this.instance;
  }
}

// Usage
const extractor = await EmbeddingModel.getInstance();
const output = await extractor(text, { pooling: 'mean', normalize: true });
const embedding = Array.from(output.data);
```

### Pattern 2: Smart Chunking for Generative Art Projects
**What:** Split project data into semantic units that fit model context
**When to use:** For projects with long descriptions or code
**Example:**
```javascript
// Chunk types for generative art projects
function chunkProject(project) {
  const chunks = [];

  // Chunk 1: Metadata (always fits in 512 tokens)
  chunks.push({
    type: 'metadata',
    content: `${project.name} by ${project.artist_name}. ${project.description?.slice(0, 400) || ''}`,
    projectId: project.id
  });

  // Chunk 2: Tags and aesthetics
  if (project.tags?.length || project.aesthetics?.length) {
    chunks.push({
      type: 'tags',
      content: `Tags: ${[...project.tags, ...project.aesthetics].join(', ')}`,
      projectId: project.id
    });
  }

  // Chunk 3+: Code structure (if script exists and is substantial)
  if (project.script && project.script.length > 500) {
    // Extract patterns, not full code
    const codeSignature = extractCodeSignature(project.script);
    chunks.push({
      type: 'code',
      content: codeSignature,
      projectId: project.id
    });
  }

  return chunks;
}
```

### Pattern 3: Cosine Similarity Search with Pre-normalized Vectors
**What:** Pre-normalize embeddings so similarity = dot product
**When to use:** Always - faster search, same results
**Example:**
```javascript
// Vectors are already normalized (normalize: true in pipeline options)
function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot; // Works because vectors are unit length
}

function search(queryEmbedding, documents, options = {}) {
  const { topK = 10, filters = {} } = options;

  // Score all documents
  let results = documents.map(doc => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding)
  }));

  // Apply filters
  if (filters.platform) {
    results = results.filter(r => r.metadata.source === filters.platform);
  }
  if (filters.framework) {
    results = results.filter(r => r.metadata.script_type === filters.framework);
  }

  // Sort and return top K
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
```

### Pattern 4: Incremental Embedding Updates
**What:** Track which projects have been embedded, only process new/changed ones
**When to use:** Dataset updates, adding local sketches
**Example:**
```javascript
// Store checksums to detect changes
function generateChecksum(project) {
  const content = `${project.name}|${project.description}|${project.script?.length}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

async function incrementalUpdate(projects, existingIndex) {
  const checksums = existingIndex.checksums || {};
  const toEmbed = [];
  const newChecksums = {};

  for (const project of projects) {
    const checksum = generateChecksum(project);
    newChecksums[project.id] = checksum;

    if (checksums[project.id] !== checksum) {
      toEmbed.push(project);
    }
  }

  console.log(`${toEmbed.length} projects need embedding (${projects.length - toEmbed.length} cached)`);

  // Embed only changed projects
  const newEmbeddings = await embedBatch(toEmbed);

  // Merge with existing
  return {
    embeddings: { ...existingIndex.embeddings, ...newEmbeddings },
    checksums: newChecksums
  };
}
```

### Anti-Patterns to Avoid
- **Loading model per request:** Model init takes seconds; use singleton
- **Embedding full scripts:** Scripts can be 50KB+; 512 token limit; chunk intelligently
- **Storing full scripts in index:** Bloats vector file; store only what's needed for display
- **Re-embedding unchanged projects:** Use checksums for incremental updates
- **Blocking on model download:** First run downloads ~50MB; show progress, cache in project

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text embeddings | Custom neural net | Xenova/bge-small-en-v1.5 | Trained on billions of examples, MTEB benchmarked |
| Tokenization | String splitting | Model's built-in tokenizer | Model-specific, handles edge cases |
| Vector math | Manual loops for all operations | Keep simple dot product for search | Cosine sim is trivial; anything more complex use a library |
| Query prefix handling | Hardcoded strings | Model-recommended prefix | bge models can work without prefix for v1.5 |
| Progress tracking | Custom loading bars | transformers.js progress_callback | Built-in, handles all stages |

**Key insight:** The heavy lifting (embeddings, tokenization) is solved by transformers.js. Focus engineering effort on chunking strategy, incremental updates, and CLI/API design.

## Common Pitfalls

### Pitfall 1: Model Download on First Run
**What goes wrong:** First user invocation downloads 50MB model, times out or confuses user
**Why it happens:** Transformers.js downloads models from HuggingFace on first use
**How to avoid:**
- Add explicit "initializing" message with progress callback
- Consider npm postinstall script to pre-download
- Document first-run behavior
**Warning signs:** Hanging CLI on first run, "no such file" errors

### Pitfall 2: Token Limit Exceeded
**What goes wrong:** Long text gets truncated, loses important information at end
**Why it happens:** bge-small-en-v1.5 has 512 token limit (~400 words)
**How to avoid:**
- Smart chunking that keeps semantic units together
- Prioritize important content (name, description) in first chunk
- For code: embed patterns/signatures, not full source
**Warning signs:** Search misses obviously relevant projects with long descriptions

### Pitfall 3: Embedding File Size Explosion
**What goes wrong:** Embeddings file becomes hundreds of MB, slow to load
**Why it happens:** Storing full content alongside embeddings, or too many chunks per project
**How to avoid:**
- Store minimal metadata in embeddings file
- Keep full project data separate (reference by ID)
- Aim for 1-3 chunks per project max
**Warning signs:** Load time > 5 seconds, file > 150MB

### Pitfall 4: Memory Issues with Large Batches
**What goes wrong:** OOM errors when embedding all 28k projects at once
**Why it happens:** Keeping all tensors in memory
**How to avoid:**
- Process in batches of 50-100
- Write to disk periodically during generation
- Clear references after batch processing
**Warning signs:** Node process > 2GB memory, system slowdown

### Pitfall 5: Package Import Issues (ESM vs CommonJS)
**What goes wrong:** "Cannot use import statement" or "require() of ES Module"
**Why it happens:** @huggingface/transformers is ESM-only, mixing with CommonJS code
**How to avoid:**
- Use `"type": "module"` in package.json (already set in this project)
- Use dynamic `import()` if needed from CommonJS context
- Existing embed.js uses require - will need migration to ESM
**Warning signs:** Module resolution errors at runtime

## Code Examples

Verified patterns from official sources:

### Basic Embedding Generation
```javascript
// Source: HuggingFace Transformers.js documentation
import { pipeline, env } from '@huggingface/transformers';

// Configure cache location
env.cacheDir = './.cache/models';

// Create pipeline (downloads model on first run)
const extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');

// Single text
const output = await extractor('What is generative art?', {
  pooling: 'mean',
  normalize: true
});
const embedding = Array.from(output.data); // Float32Array -> Array

// Batch processing
const texts = ['flow fields', 'particle systems', 'noise functions'];
const outputs = await Promise.all(
  texts.map(t => extractor(t, { pooling: 'mean', normalize: true }))
);
const embeddings = outputs.map(o => Array.from(o.data));
```

### Progress Callback for CLI
```javascript
// Source: HuggingFace Transformers.js Node tutorial
const extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5', {
  progress_callback: (progress) => {
    if (progress.status === 'downloading') {
      const pct = ((progress.loaded / progress.total) * 100).toFixed(1);
      process.stdout.write(`\rDownloading model: ${pct}%`);
    } else if (progress.status === 'ready') {
      console.log('\nModel ready!');
    }
  }
});
```

### Query Prefix for BGE Models (Optional)
```javascript
// Source: BAAI/bge-small-en-v1.5 model card
// Note: For v1.5 models, prefix is optional with minimal performance impact

// For strict retrieval accuracy, use prefix on queries:
const QUERY_PREFIX = 'Represent this sentence for searching relevant passages: ';

async function searchWithPrefix(query) {
  const prefixedQuery = QUERY_PREFIX + query;
  const embedding = await embed(prefixedQuery);
  return search(embedding, documents);
}

// For simplicity, can skip prefix (v1.5 handles this well):
async function searchSimple(query) {
  const embedding = await embed(query);
  return search(embedding, documents);
}
```

### File-Based Vector Storage
```javascript
// Simple JSON storage - works well for 28k vectors
import { readFileSync, writeFileSync, existsSync } from 'fs';

const INDEX_PATH = './processed/embeddings/index.json';

function saveIndex(data) {
  writeFileSync(INDEX_PATH, JSON.stringify(data));
}

function loadIndex() {
  if (!existsSync(INDEX_PATH)) return null;
  return JSON.parse(readFileSync(INDEX_PATH, 'utf8'));
}

// Index structure
const index = {
  metadata: {
    model: 'Xenova/bge-small-en-v1.5',
    dimensions: 384,
    created: new Date().toISOString(),
    projectCount: 28338,
    chunkCount: 42000 // ~1.5 chunks per project average
  },
  vectors: [
    {
      id: 'artblocks_123_metadata',
      projectId: 'artblocks_123',
      type: 'metadata',
      embedding: [0.023, -0.156, ...], // 384 floats
      // Minimal inline metadata for filtering
      source: 'artblocks',
      scriptType: 'p5js',
      artist: 'Tyler Hobbs'
    },
    // ...
  ]
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @xenova/transformers | @huggingface/transformers | 2024 | Official package, v3 with WebGPU |
| all-MiniLM-L6-v2 | bge-small-en-v1.5 | 2023-2024 | 5-8% better retrieval accuracy |
| Fixed chunk size | Semantic chunking | 2024 | Better retrieval for long documents |
| CPU only | WebGPU optional | 2024 | 2-4x faster inference (not needed here) |

**Deprecated/outdated:**
- `sentence-transformers` in JS: Use transformers.js instead
- `@xenova/transformers` v2: Still works but migrate to `@huggingface/transformers` v3
- OpenAI embeddings API: Local models now competitive quality, zero cost

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal chunk count per project**
   - What we know: 1-3 chunks is reasonable; more = better coverage but larger index
   - What's unclear: Whether code embeddings add enough value vs. metadata-only
   - Recommendation: Start with metadata+tags (2 chunks), add code if search quality insufficient

2. **Query prefix impact for v1.5**
   - What we know: v1.5 models work without prefix, slight accuracy gain with prefix
   - What's unclear: Exact impact for generative art domain queries
   - Recommendation: Implement without prefix initially; add as optional enhancement

3. **Memory usage for 28k vectors in-memory**
   - What we know: 28k vectors * 384 dims * 4 bytes = ~43MB base
   - What's unclear: V8 object overhead, JSON parse memory spike
   - Recommendation: Test with full dataset; consider streaming load if issues

## Sources

### Primary (HIGH confidence)
- [HuggingFace Transformers.js Documentation](https://huggingface.co/docs/transformers.js/en/index) - Pipeline API, Node.js usage, caching
- [HuggingFace Transformers.js Node Tutorial](https://huggingface.co/docs/transformers.js/en/tutorials/node) - Server-side setup, ESM/CommonJS
- [BAAI/bge-small-en-v1.5 Model Card](https://huggingface.co/BAAI/bge-small-en-v1.5) - Model specs, benchmarks, usage
- [Xenova/bge-small-en-v1.5 Model Card](https://huggingface.co/Xenova/bge-small-en-v1.5) - ONNX conversion, JS usage

### Secondary (MEDIUM confidence)
- [Transformers.js v3 Announcement](https://huggingface.co/blog/transformersjs-v3) - Package migration from @xenova
- [Vectra GitHub](https://github.com/Stevenic/vectra) - Local vector DB alternative
- [Pinecone Chunking Strategies](https://www.pinecone.io/learn/chunking-strategies/) - Chunking best practices

### Tertiary (LOW confidence)
- WebSearch results on embedding model comparisons - General guidance, not domain-specific
- Community discussions on model selection - Anecdotal, varying use cases

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Transformers.js is well-documented, bge-small proven
- Architecture: HIGH - Patterns from official docs and established projects
- Pitfalls: MEDIUM - Some extrapolated from general ML/Node.js experience
- Chunking strategy: MEDIUM - Domain-specific, may need iteration

**Research date:** 2026-01-18
**Valid until:** 2026-03-18 (60 days - transformers.js stable, models don't change often)
