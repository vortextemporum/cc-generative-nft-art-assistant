# Embeddings Service

Semantic search across 28,000+ generative art projects using vector embeddings.

## Overview

This service generates and searches vector embeddings for the generative art dataset, enabling semantic similarity search that goes beyond keyword matching.

## Files

| File | Description |
|------|-------------|
| `index.js` | Main entry point and CLI |
| `generate.js` | Embedding generation from dataset |
| `search.js` | Semantic search implementation |
| `model.js` | Embedding model loading/inference |
| `chunker.js` | Text chunking for long descriptions |
| `storage.js` | Embedding storage and retrieval |
| `embed.js` | Core embedding utilities |

## Usage

### Generate Embeddings

First-time setup to generate embeddings from the dataset:

```bash
# From project root
npm run embeddings

# Or directly
node services/embeddings/generate.js
```

This creates embedding vectors in `processed/embeddings/`.

### Search

Search the dataset semantically:

```bash
# From project root
npm run search "flow fields with organic movement"
npm run search "minimalist geometric patterns"
npm run search "particle systems with physics"

# Or directly
node services/embeddings/search.js "your query"
```

### Programmatic Usage

```javascript
const { search } = require('./services/embeddings');

// Search for similar projects
const results = await search("flow fields with noise", { limit: 10 });

results.forEach(r => {
  console.log(`${r.name} by ${r.artist} (score: ${r.score})`);
});
```

## Architecture

```
┌─────────────────┐
│  Dataset JSON   │
│  (28k projects) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Chunker      │  Split long descriptions
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Embed Model    │  Generate vectors
│  (Transformer)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Storage      │  Save to disk
│  (JSON/Binary)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Search      │  Cosine similarity
└─────────────────┘
```

## Configuration

Environment variables:
- `EMBEDDING_MODEL` - Model name (default: all-MiniLM-L6-v2)
- `EMBEDDING_DIM` - Vector dimension (default: 384)
- `CHUNK_SIZE` - Characters per chunk (default: 500)

## Dependencies

```json
{
  "@xenova/transformers": "^2.x",
  "faiss-node": "optional - for faster search"
}
```

Install with:
```bash
npm install
```

## Performance

- **Generation**: ~5 minutes for full dataset
- **Search**: <100ms for 28k vectors
- **Storage**: ~50MB for embeddings

## Output

Search results include:
- Project name and artist
- Similarity score (0-1)
- Platform (Art Blocks/fxhash)
- Matched text snippet
- Project metadata

## Troubleshooting

### "Model not found"
Run `npm run embeddings` first to download and cache the model.

### "Out of memory"
Reduce batch size in `generate.js`:
```javascript
const BATCH_SIZE = 32; // Reduce if needed
```

### "Embeddings file not found"
Ensure embeddings have been generated:
```bash
npm run embeddings
```
