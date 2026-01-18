# Generative Art AI Assistant

An AI assistant specialized in generative art, built on Art Blocks data. Understands code, aesthetics, and techniques for algorithmic art creation.

## Features

- 🎨 **Art Blocks Dataset Fetcher** - Download all 700+ projects with metadata & scripts
- 🔍 **RAG-based Assistant** - Retrieval-augmented generation for relevant context
- 📊 **Training Data Processor** - Transform raw data into AI-ready formats
- 🖼️ **Browser Explorer** - Visual tool to browse and preview projects

## Quick Start

```bash
# 1. Fetch the dataset
npm run fetch              # Metadata only (~5MB, fast)
npm run fetch:full         # With scripts (~100MB, slow)

# 2. Process into training formats
npm run process

# 3. Generate embeddings for semantic search (optional, ~5 min)
npm run embeddings

# 4. Run the assistant
export ANTHROPIC_API_KEY=sk-ant-...
npm run assistant "How do I create a flow field in p5.js?"
```

## Project Structure

```
├── scripts/
│   ├── artblocks-fetcher.js    # Fetch from Art Blocks API
│   ├── process-dataset.js      # Process into training formats
│   └── art-assistant.js        # CLI assistant with RAG
├── data/                       # Raw datasets
├── processed/                  # Processed training data
├── tools/                      # Browser-based tools
└── docs/                       # Documentation
```

## Output Formats

After processing, you get:

| File | Purpose |
|------|---------|
| `training-examples.json` | Instruction-response pairs for few-shot |
| `rag-documents.json` | Searchable chunks for retrieval |
| `system-knowledge.json` | Aggregated stats and patterns |
| `code-examples.json` | Curated high-quality scripts |
| `system-prompt.md` | Ready-to-use Claude system prompt |
| `embeddings/` | Vector embeddings for semantic search (~500MB, generated locally) |

## Using with Claude

### Option 1: System Prompt
Use `processed/system-prompt.md` directly as your system message.

### Option 2: RAG (Recommended)
The assistant uses TF-IDF retrieval. For production, upgrade to embeddings:

```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(documents)
```

### Option 3: Few-shot
Use examples from `training-examples.json` in your conversation.

## Example Queries

```bash
# Code generation
npm run assistant "Write p5.js code for a particle system"

# Technique explanation  
npm run assistant "How does Perlin noise work?"

# Project analysis
npm run assistant "What makes Fidenza technically interesting?"

# Style guidance
npm run assistant "Create code in the style of Tyler Hobbs"
```

## Art Blocks API

The fetcher uses Art Blocks' public Hasura API:
- Endpoint: `https://data.artblocks.io/v1/graphql`
- No authentication required
- ~700 projects with full metadata

## Adding Data Sources

To add fxhash, Bright Moments, etc:
1. Create a fetcher in `scripts/`
2. Normalize to the same schema
3. Merge datasets
4. Re-run processing

## License

MIT
