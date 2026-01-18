# Training a Generative Art AI Assistant

## Overview

This guide explains how to use the Art Blocks dataset to create an AI assistant that understands generative art code, aesthetics, and techniques.

**Important**: Claude models cannot be fine-tuned in the traditional sense. Instead, we use these approaches:

1. **RAG (Retrieval Augmented Generation)** - Inject relevant context at query time
2. **System Prompts** - Comprehensive knowledge in the system message
3. **Few-shot Learning** - Examples in the conversation
4. **MCP Servers** - Custom tools for Claude Desktop/Code

---

## Quick Start

```bash
# 1. Fetch the dataset (if not done)
node artblocks-fetcher.js --with-scripts

# 2. Process into training formats
node process-artblocks-dataset.js artblocks-dataset.json

# 3. Run the assistant
export ANTHROPIC_API_KEY=your-key
node art-assistant.js "How do I create a flow field in p5.js?"
```

---

## Generated Files

After running `process-artblocks-dataset.js`, you get:

| File | Purpose | Use Case |
|------|---------|----------|
| `training-examples.json` | Instruction-response pairs | Few-shot prompting |
| `rag-documents.json` | Chunked docs for retrieval | RAG with embeddings |
| `system-knowledge.json` | Aggregated statistics | System prompt building |
| `code-examples.json` | Curated scripts | Code reference |
| `system-prompt.md` | Ready-to-use prompt | Direct use with Claude |

---

## Approach 1: System Prompt (Simplest)

Use `system-prompt.md` directly with Claude API:

```python
import anthropic

# Load the generated system prompt
with open('processed/system-prompt.md', 'r') as f:
    system_prompt = f.read()

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    system=system_prompt,
    messages=[
        {"role": "user", "content": "Write p5.js code for a recursive tree"}
    ]
)
print(response.content[0].text)
```

**Pros**: Simple, no infrastructure
**Cons**: Limited context, no dynamic retrieval

---

## Approach 2: RAG with Embeddings (Recommended)

For production, use proper embeddings instead of TF-IDF:

```python
import anthropic
import numpy as np
from sentence_transformers import SentenceTransformer
import json

# Load documents
with open('processed/rag-documents.json', 'r') as f:
    documents = json.load(f)

# Create embeddings
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode([doc['content'] for doc in documents])

# Save for later
np.save('embeddings.npy', embeddings)

# Search function
def search(query, top_k=5):
    query_embedding = model.encode([query])
    similarities = np.dot(embeddings, query_embedding.T).flatten()
    top_indices = np.argsort(similarities)[-top_k:][::-1]
    return [documents[i] for i in top_indices]

# Use with Claude
def ask_art_assistant(question):
    relevant_docs = search(question, top_k=5)
    context = "\n\n".join([doc['content'][:2000] for doc in relevant_docs])
    
    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=f"""You are a generative art expert. Use this context:

{context}

Answer questions about generative art, provide working code, and explain techniques.""",
        messages=[{"role": "user", "content": question}]
    )
    return response.content[0].text
```

**Pros**: Scales to large knowledge base, relevant context
**Cons**: Requires embedding infrastructure

---

## Approach 3: Few-shot Learning

Use examples from `training-examples.json`:

```python
import json
import anthropic

with open('processed/training-examples.json', 'r') as f:
    examples = json.load(f)

# Filter for code analysis examples
code_examples = [e for e in examples if e['type'] == 'code_to_description'][:3]

# Build few-shot messages
messages = []
for ex in code_examples:
    messages.append({"role": "user", "content": ex['instruction']})
    messages.append({"role": "assistant", "content": ex['response']})

# Add the actual question
messages.append({
    "role": "user", 
    "content": "Analyze this code and describe what it creates:\n```javascript\nfunction setup() { createCanvas(800, 800); background(0); noLoop(); }\nfunction draw() { for(let i = 0; i < 1000; i++) { let x = random(width); let y = random(height); let n = noise(x*0.01, y*0.01); stroke(n*255); point(x, y); } }\n```"
})

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=2048,
    messages=messages
)
```

---

## Approach 4: MCP Server for Claude Desktop

Create a Model Context Protocol server for Claude Desktop:

```javascript
// mcp-artblocks-server.js
const { Server } = require('@modelcontextprotocol/sdk/server');
const fs = require('fs');

const ragDocs = JSON.parse(fs.readFileSync('processed/rag-documents.json'));
const codeExamples = JSON.parse(fs.readFileSync('processed/code-examples.json'));

const server = new Server({
  name: 'artblocks-knowledge',
  version: '1.0.0'
});

// Tool: Search Art Blocks projects
server.addTool({
  name: 'search_artblocks',
  description: 'Search Art Blocks projects by keyword, artist, or technique',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' }
    },
    required: ['query']
  },
  handler: async ({ query }) => {
    const results = ragDocs
      .filter(doc => doc.content.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
    return results.map(r => r.content).join('\n\n---\n\n');
  }
});

// Tool: Get code example
server.addTool({
  name: 'get_code_example',
  description: 'Get a generative art code example by project name or technique',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Project name or technique' }
    },
    required: ['name']
  },
  handler: async ({ name }) => {
    const example = codeExamples.find(e => 
      e.name.toLowerCase().includes(name.toLowerCase()) ||
      e.patterns.some(p => p.includes(name.toLowerCase()))
    );
    if (example) {
      return `## ${example.name} by ${example.artist}\n\n${example.description}\n\n\`\`\`javascript\n${example.script.slice(0, 5000)}\n\`\`\``;
    }
    return 'No matching example found';
  }
});

server.listen();
```

Add to Claude Desktop config (`~/.config/claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "artblocks": {
      "command": "node",
      "args": ["/path/to/mcp-artblocks-server.js"]
    }
  }
}
```

---

## Data Schema

### training-examples.json
```json
{
  "type": "code_to_description | aesthetic_analysis | technical_analysis",
  "instruction": "User prompt",
  "response": "Expected assistant response",
  "metadata": { "project_id": "...", "script_type": "p5js" }
}
```

### rag-documents.json
```json
{
  "id": "project_123",
  "type": "project_overview | script",
  "content": "Searchable text content",
  "metadata": {
    "project_id": "123",
    "artist": "Artist Name",
    "script_type": "p5js",
    "patterns": ["noise", "flow_field"]
  }
}
```

### code-examples.json
```json
{
  "name": "Project Name",
  "artist": "Artist Name",
  "script_type": "p5js",
  "patterns": ["perlin_noise", "animation"],
  "description": "Description",
  "script": "Full source code..."
}
```

---

## Enhancing the Dataset

### Add Annotations

Create a script to manually annotate projects:

```javascript
// annotate.js - Add human labels
const projects = require('./processed/code-examples.json');

const annotations = {
  "project_id": {
    "visual_style": "abstract geometric",
    "color_palette": "vibrant gradients",
    "complexity": "high",
    "techniques_used": ["perlin noise", "trigonometry", "color interpolation"],
    "artistic_movement": "computational minimalism",
    "mood": "meditative, flowing"
  }
};

// Merge with projects
const annotated = projects.map(p => ({
  ...p,
  annotations: annotations[p.project_id] || {}
}));
```

### Add More Data Sources

Enhance with:
- **fxhash projects** (when API works)
- **Bright Moments**
- **Prohibition**
- **Artist interviews/statements**
- **Generative art tutorials**
- **Academic papers on algorithmic art**

---

## Best Practices

### 1. Semantic Chunking
Don't just split by character count. Split scripts by:
- Functions
- Visual sections
- Setup vs draw vs helper code

### 2. Metadata Enrichment
Add derived metadata:
- Detected color palettes
- Estimated complexity
- Animation vs static
- 2D vs 3D

### 3. Quality Filtering
Prioritize projects with:
- Complete descriptions
- High edition counts (popular)
- Known artists
- Interesting techniques

### 4. Prompt Engineering
Test different system prompt structures:
- Technical vs artistic focus
- Code-first vs explanation-first
- Specific technique expertise

---

## Example Queries to Test

```bash
# Code generation
node art-assistant.js "Write p5.js code for a generative mountain landscape"

# Technique explanation
node art-assistant.js "How do flow fields work in generative art?"

# Project analysis
node art-assistant.js "What makes Fidenza technically interesting?"

# Style transfer
node art-assistant.js "Create code in the style of Tyler Hobbs"

# Debugging
node art-assistant.js "Why is my noise function creating banding artifacts?"

# Aesthetic discussion
node art-assistant.js "What defines computational minimalism in generative art?"
```

---

## Future Improvements

1. **Visual embeddings**: Use CLIP to embed rendered outputs alongside code
2. **Code-specific embeddings**: Use CodeBERT or similar for better code retrieval
3. **Multi-modal**: Include screenshots/renders in the training data
4. **Interactive**: Let Claude execute code and see results
5. **Evaluation**: Build a test set to measure assistant quality
