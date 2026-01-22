# Development Guide

Complete setup and development instructions for the Generative Art Assistant.

## Prerequisites

- Node.js 18+
- npm 9+
- Git
- (Optional) Anthropic API key for assistant features
- (Optional) Puppeteer for renderer service

## Initial Setup

### 1. Clone Repository

```bash
git clone <repo-url>
cd generative-art-assistant
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Fetch Datasets (Optional)

Datasets are large and not included in the repo. Fetch them:

```bash
# Art Blocks (~31MB)
node scripts/artblocks-fetcher.js

# fxhash (~465MB)
node scripts/fxhash-fetcher.js --limit 5000  # Start smaller
```

### 4. Process Data

Generate processed files for search and training:

```bash
node scripts/process-dataset.js data/artblocks-dataset.json
```

## Project Structure

```
generative-art-assistant/
├── scripts/              # Data fetching and processing
├── data/                 # Raw datasets (gitignored)
├── processed/            # Processed data (gitignored)
├── sketches/             # Generative art sketches
├── services/
│   ├── embeddings/       # Semantic search
│   └── renderer/         # Visual rendering
├── mcp-server/           # Claude Desktop integration
├── platform/             # NFT platform builder
├── .claude/
│   ├── commands/         # Slash commands
│   ├── agents/           # Specialized agents
│   ├── expertise/        # Domain knowledge
│   └── state/            # Session tracking
└── docs/                 # Documentation
```

## Development Workflows

### Working with Sketches

**Create new sketch:**
```bash
# Use the slash command (in Claude Code)
/art:new-sketch

# Or manually create structure
mkdir -p sketches/my-sketch/{versions,docs}
```

**Test a sketch:**
```bash
# Open in browser
open sketches/my-sketch/index.html

# Or with local server
cd sketches/my-sketch && python3 -m http.server 8000
```

**Edit existing sketch:**
```bash
# Use the slash command
/art:edit-sketch my-sketch
```

### Working with Data

**Add new data source:**

1. Create fetcher in `scripts/`:
   ```javascript
   // scripts/newplatform-fetcher.js
   const fetch = require('node-fetch');

   async function fetchProjects() {
     // Implement fetching logic
     // Normalize to common schema
     // Save to data/newplatform-dataset.json
   }
   ```

2. Update processing:
   ```bash
   node scripts/process-dataset.js data/newplatform-dataset.json
   ```

### Working with Services

**Embeddings service:**
```bash
# Generate embeddings
npm run embeddings

# Search
npm run search "flow field particles"
```

**Renderer service:**
```bash
# Install puppeteer first
npm install puppeteer

# Capture screenshot
npm run render capture sketches/my-sketch output.png

# Analyze
npm run render analyze sketches/my-sketch

# Generate variations
npm run render variations sketches/my-sketch 10
```

### Working with MCP Server

**Setup for Claude Desktop:**

1. Install dependencies:
   ```bash
   cd mcp-server && npm install
   ```

2. Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "generative-art": {
         "command": "node",
         "args": ["/absolute/path/to/mcp-server/src/index.js"]
       }
     }
   }
   ```

3. Restart Claude Desktop

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | API key for assistant | - |
| `ALCHEMY_API_KEY` | For Highlight fetcher | - |
| `SHADERTOY_API_KEY` | For Shadertoy fetcher | - |
| `EMBEDDING_MODEL` | Transformer model | all-MiniLM-L6-v2 |

Create `.env` file (gitignored):
```bash
ANTHROPIC_API_KEY=sk-...
```

## Testing

### Manual Testing

**Sketch determinism:**
1. Load sketch in browser
2. Note the hash and output
3. Reload with same hash
4. Verify identical output

**Feature distribution:**
```bash
# Generate many variations
npm run render variations sketches/my-sketch 50

# Check feature counts manually or via script
```

### Automated Testing

(Tests to be implemented)

```bash
npm test
```

## Common Tasks

### Update a Sketch Version

1. Archive current: `cp sketch.js versions/v1.0.0-desc.js`
2. Edit sketch.js
3. Update version comment
4. Update CHANGELOG.md
5. Update index.html version display

### Add a New Command

1. Create file in `.claude/commands/{namespace}/`:
   ```markdown
   # /namespace:command-name - Description

   What this command does.

   ## Arguments
   - `$ARGUMENTS` - What arguments it takes

   ## Process
   1. Step one
   2. Step two

   ## Examples
   ```

2. Update CLAUDE.md command table

### Add a New Agent

1. Create file in `.claude/agents/`:
   ```yaml
   ---
   name: agent-name
   description: What this agent does
   tools: Read, Write, Bash
   color: blue
   ---

   <role>...</role>
   <execution_flow>...</execution_flow>
   ```

## Debugging

### Sketch Issues

**Black output:**
- Check console for errors
- Verify canvas creation
- Check if draw() is called

**Non-deterministic:**
- Search for `Math.random()`
- Check for Date/time usage
- Verify PRNG seeding

**Performance issues:**
- Profile with Chrome DevTools
- Check for per-frame allocations
- Reduce particle counts

### Service Issues

**Embeddings:**
```bash
# Check if embeddings exist
ls -la processed/embeddings/

# Regenerate if needed
rm -rf processed/embeddings/
npm run embeddings
```

**Renderer:**
```bash
# Test puppeteer
node -e "require('puppeteer').launch().then(b => { console.log('OK'); b.close(); })"
```

## Performance Tips

### Large Datasets

- Use `--limit` flag when fetching
- Process in chunks if memory issues
- Consider streaming for very large files

### Sketch Performance

- Use `pixelDensity(1)` for faster dev
- Limit particle counts
- Cache expensive calculations
- Use WebGL for heavy graphics

## Useful Commands

```bash
# Check what's taking space
du -sh data/* processed/*

# Find large files
find . -size +10M -type f

# Clean processed data
rm -rf processed/*.json

# Reset embeddings
rm -rf processed/embeddings/

# Check node_modules sizes
du -sh */node_modules 2>/dev/null
```

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- Claude Code (for slash commands)

Settings:
```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "files.trimTrailingWhitespace": true
}
```

## Getting Help

- Check `docs/` for documentation
- Review `.claude/expertise/` for domain knowledge
- Use `/art:inspiration` for technique ideas
- Use Context7 MCP for library documentation
