# Generative Art MCP Server

MCP (Model Context Protocol) server that gives Claude Desktop access to the 28k+ generative art project knowledge base with semantic search.

## Philosophy: Technique First

This MCP server is designed around a **teaching-first approach**:

- **Search returns technique explanations**, not full code
- **Patterns and aesthetics** are highlighted to help understand the "why"
- **Full code is available on request** via `get_project_code`

This supports learning generative art techniques rather than copy-paste coding.

## Tools Provided

| Tool | Description |
|------|-------------|
| `search_projects` | Semantic search - returns technique explanations and key concepts |
| `search_by_pattern` | Find projects by code pattern (noise, particles, flow_field, etc.) |
| `get_project_code` | Get full source code for a specific project |
| `get_dataset_stats` | Dataset overview and statistics |
| `get_notable_projects` | Popular/notable projects by platform |

## Installation

### 1. Generate Embeddings (Required)

The semantic search requires embeddings to be generated first:

```bash
# From project root
npm run embeddings
```

This creates the embedding index in `processed/embeddings/` (~485MB for 28k+ projects).

### 2. Install MCP Dependencies

```bash
cd mcp-server
npm install
```

### 3. Configure Claude Desktop

Add to your Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "generative-art": {
      "command": "node",
      "args": ["/absolute/path/to/generative-art-assistant/mcp-server/src/index.js"]
    }
  }
}
```

### 4. Restart Claude Desktop

The tools will now be available in Claude Desktop conversations.

## Usage Examples

In Claude Desktop, you can ask:

**Semantic Search:**
- "Search for projects using flow fields with organic movement"
- "Find generative art with minimalist geometric patterns"
- "Search for particle systems with physics simulation"

**Pattern Search:**
- "Find projects that use Perlin noise"
- "Show me examples with recursion"
- "What projects use voronoi diagrams?"

**Code Retrieval:**
- "Get the full code for Fidenza"
- "Show me the source code for project 78"
- "Get the code for that flow field project you found"

**Statistics:**
- "What patterns are most common in generative art?"
- "Show me dataset statistics"
- "What are the most notable Art Blocks projects?"

## Technical Details

### SDK Version

Uses MCP SDK v1.25.2 with the v1.x API patterns.

### Data Sources

The server reads from:
- `services/embeddings/` - Phase 1 embedding search API
- `processed/rag-documents.json` - Project metadata for enrichment
- `processed/code-examples.json` - Curated code examples
- `processed/system-knowledge.json` - Dataset statistics
- `data/artblocks-dataset.json` - Full Art Blocks dataset
- `data/fxhash-dataset.json` - Full fxhash dataset

### Filters

Search supports filtering by:
- **Platform:** `artblocks`, `fxhash`
- **Framework:** `p5js`, `threejs`, `js`, `regl`, `tone`, `webgl`, `svg`

## Development

```bash
# Test the server locally
node src/index.js

# The server communicates via stdio (stdin/stdout)
# It will print "Generative Art MCP server running on stdio" to stderr
```

### Important Notes

- All logging uses `console.error()` to avoid stdout corruption (stdout is for MCP protocol)
- The server is designed to be token-efficient - search results don't include full code
- Use `get_project_code` when you need to see actual implementation

## Version History

- **v2.0.0** (Current) - Upgraded to SDK v1.25.2, uses Phase 1 embedding API, technique-first responses
- **v1.0.0** - Original version with @xenova/transformers embeddings

## Troubleshooting

**"Embeddings not found" error:**
```bash
npm run embeddings
```

**"RAG documents not loaded" error:**
```bash
node scripts/process-dataset.js data/artblocks-dataset.json data/fxhash-dataset.json
```

**Server won't start:**
- Check that all dependencies are installed: `cd mcp-server && npm install`
- Verify the path in claude_desktop_config.json is correct
- Check Claude Desktop logs for errors
