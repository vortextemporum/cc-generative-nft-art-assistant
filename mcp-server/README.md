# Generative Art MCP Server

MCP (Model Context Protocol) server that gives Claude Desktop access to the generative art dataset with semantic search.

## Benefits for Developers

- **Token Efficient**: Returns only relevant chunks, not full 28k+ projects
- **Fast**: Local vector embeddings, no API round-trips
- **Precise**: Semantic search finds conceptually similar projects, not just keyword matches

## Tools Provided

| Tool | Description |
|------|-------------|
| `search_projects` | Semantic search across all projects |
| `search_by_pattern` | Find projects by code pattern (noise, particles, etc.) |
| `get_code_example` | Get full code for a specific project |
| `get_code_by_technique` | Get examples using a technique |
| `get_dataset_stats` | Dataset overview and statistics |
| `get_notable_projects` | Popular/notable projects |

## Installation

### 1. Install dependencies

```bash
cd mcp-server
npm install
```

### 2. Generate embeddings (required for semantic search)

```bash
# From project root
npm install @xenova/transformers
node services/embeddings/embed.js generate
```

This creates `processed/embeddings.json` (~150MB for 28k projects).

### 3. Configure Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "generative-art": {
      "command": "node",
      "args": ["/path/to/generative-art-assistant/mcp-server/src/index.js"]
    }
  }
}
```

### 4. Restart Claude Desktop

The tools will now be available in Claude Desktop conversations.

## Usage Examples

In Claude Desktop, you can now ask:

- "Search for generative art projects using flow fields"
- "Find code examples that use particle systems"
- "Show me notable fxhash projects"
- "Get the full code for Fidenza"
- "What patterns are most common in generative art?"

Claude will automatically use the MCP tools to query the dataset.

## Development

```bash
# Test the server locally
node src/index.js

# The server communicates via stdio (stdin/stdout)
# For testing, you can pipe JSON-RPC requests
```

## Data Files Required

The server reads from `processed/`:
- `embeddings.json` - Vector embeddings for semantic search
- `code-examples.json` - Full code examples (300 projects)
- `system-knowledge.json` - Dataset statistics and knowledge

Generate these with:
```bash
node scripts/process-dataset.js data/artblocks-dataset.json fxhash-dataset.json
node services/embeddings/embed.js generate
```
