# Phase 02: Developer Tools - Research

**Researched:** 2026-01-18
**Domain:** MCP Server (Claude Desktop), Puppeteer Visual Analysis
**Confidence:** HIGH

## Summary

This research covers building developer tools that integrate the generative art knowledge base with Claude Desktop (via MCP server) and enable visual analysis of sketches (via Puppeteer). The phase has two distinct components that share the embedding index from Phase 1.

The **MCP Server** uses `@modelcontextprotocol/sdk` v1.x with the existing `setRequestHandler` pattern. The current codebase already has a working MCP server (`mcp-server/src/index.js`) that needs updating to use the new Phase 1 embedding format (bge-small-en-v1.5, split storage). The SDK v1.25.2 is stable and recommended for production; v2 is in pre-alpha with Q1 2026 stable release anticipated.

The **Visual Renderer** uses Puppeteer to capture canvas output and extract color/composition data. The existing implementation (`services/renderer/render.js`) already handles screenshot capture and basic color analysis. Enhancements needed include subjective impression generation (via Claude Code) and comparison to dataset references.

**Primary recommendation:** Update MCP server to use Phase 1 embedding format with technique-focused responses (not code dumps). Enhance renderer with structured analysis output and Claude-readable metrics. Both tools should support the "teach technique first, code on request" philosophy from CONTEXT.md.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @modelcontextprotocol/sdk | ^1.25.2 | MCP server implementation | Official SDK, v1 recommended for production |
| zod | ^3.25 | Schema validation for MCP tools | Required peer dependency, v3 for SDK v1 compat |
| puppeteer | ^22.0.0 | Headless browser for rendering | Already in optionalDependencies, proven stable |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| color-thief-node | ^1.0.4 | Color palette extraction | Optional - if canvas getImageData proves insufficient |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MCP SDK v1.x | MCP SDK v2 (pre-alpha) | v2 has newer API but not recommended for production until Q1 2026 |
| Puppeteer canvas analysis | color-thief-node | color-thief uses MMCQ, but canvas getImageData already works well |
| StdioServerTransport | Streamable HTTP | stdio is simpler for local-only Claude Desktop use |

**Installation:**
```bash
# MCP server dependencies (mcp-server/package.json)
npm install @modelcontextprotocol/sdk@^1.25.2 zod@^3.25

# Root project (already present)
npm install puppeteer --save-optional
```

**Note:** The current `mcp-server/package.json` has `@modelcontextprotocol/sdk@^0.5.0` - this needs upgrading to v1.25.2 for security fixes.

## Architecture Patterns

### Recommended Project Structure
```
mcp-server/
├── src/
│   ├── index.js              # Server entry, transport setup
│   ├── tools/                # Tool implementations
│   │   ├── search.js         # Semantic search tool
│   │   ├── patterns.js       # Pattern-based search
│   │   ├── code.js           # Get code tool (separate from search)
│   │   ├── stats.js          # Dataset statistics
│   │   └── notable.js        # Notable projects
│   └── lib/
│       ├── embeddings.js     # Load/query Phase 1 index
│       └── response.js       # Format responses (technique focus)
├── package.json
└── README.md

services/
├── renderer/
│   ├── render.js             # Core renderer (existing)
│   ├── analyze.js            # Visual analysis extraction
│   ├── compare.js            # Compare to dataset references
│   └── index.js              # Unified exports
└── embeddings/               # From Phase 1
    └── index.js              # Search API
```

### Pattern 1: MCP Tool Registration (v1.x API)
**What:** Use `setRequestHandler` with request schemas
**When to use:** Always for SDK v1.x servers
**Example:**
```javascript
// Source: modelcontextprotocol.io/docs/develop/build-server
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'generative-art-mcp', version: '2.0.0' },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_projects',
      description: 'Semantic search across 28k+ generative art projects. Returns technique explanations, not full code.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Natural language query' },
          limit: { type: 'number', description: 'Max results', default: 5 },
          platform: { type: 'string', enum: ['artblocks', 'fxhash'] },
          framework: { type: 'string', enum: ['p5js', 'threejs', 'regl', 'tone'] },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_project_code',
      description: 'Get full source code for a specific project. Use after search to dive deeper.',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID from search results' },
        },
        required: ['projectId'],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  // ... tool implementation
});
```

### Pattern 2: Technique-Focused Response Format
**What:** Return technique explanations before/instead of code
**When to use:** For search_projects and similar discovery tools
**Example:**
```javascript
// Support "learn technique first, see code if needed" workflow
function formatSearchResult(result, includeCode = false) {
  const response = {
    projectId: result.projectId,
    name: result.name,
    artist: result.artist,
    // Technique explanation - always included
    technique: {
      patterns: result.patterns,           // ['flow_field', 'perlin_noise']
      framework: result.scriptType,        // 'p5js'
      keyConceptsUsed: extractConcepts(result),
      whyItWorks: generateTechniqueExplanation(result),
    },
    // Links for manual exploration
    links: {
      artblocks: result.source === 'artblocks'
        ? `https://artblocks.io/collections/curated/projects/${result.projectNum}`
        : null,
      fxhash: result.source === 'fxhash'
        ? `https://www.fxhash.xyz/generative/${result.projectNum}`
        : null,
    },
  };

  // Code only when explicitly requested
  if (includeCode) {
    response.code = {
      preview: result.script?.slice(0, 500),
      fullLength: result.script?.length,
      // Suggest get_project_code tool for full code
    };
  }

  return response;
}
```

### Pattern 3: Canvas Color Analysis via page.evaluate
**What:** Extract pixel data directly from canvas in browser context
**When to use:** For color distribution and composition analysis
**Example:**
```javascript
// Source: MDN Canvas API + Puppeteer docs
async function analyzeCanvas(page) {
  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas found' };

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Color histogram and dominant color extraction
    const colorCounts = new Map();
    const hueHistogram = new Array(36).fill(0);
    let totalBrightness = 0;
    let totalSaturation = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a === 0) continue;

      // Quantize for color counting (reduce to 512 colors)
      const qr = Math.floor(r / 32) * 32;
      const qg = Math.floor(g / 32) * 32;
      const qb = Math.floor(b / 32) * 32;
      const key = `${qr},${qg},${qb}`;
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);

      // HSL conversion for hue analysis
      const max = Math.max(r, g, b) / 255;
      const min = Math.min(r, g, b) / 255;
      const l = (max + min) / 2;
      const d = max - min;

      if (d > 0) {
        const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        let h;
        if (max === r / 255) h = ((g - b) / 255 / d + (g < b ? 6 : 0)) / 6;
        else if (max === g / 255) h = ((b - r) / 255 / d + 2) / 6;
        else h = ((r - g) / 255 / d + 4) / 6;
        hueHistogram[Math.floor(h * 36)]++;
        totalSaturation += s;
      }

      totalBrightness += l;
      pixelCount++;
    }

    // Sort and get top colors
    const sortedColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([rgb, count]) => ({
        rgb: rgb.split(',').map(Number),
        percentage: (count / pixelCount * 100).toFixed(1),
      }));

    return {
      dimensions: { width: canvas.width, height: canvas.height },
      dominantColors: sortedColors,
      avgBrightness: (totalBrightness / pixelCount).toFixed(2),
      avgSaturation: (totalSaturation / pixelCount).toFixed(2),
      colorDiversity: hueHistogram.filter(h => h > pixelCount * 0.01).length,
      isMonochrome: totalSaturation / pixelCount < 0.1,
      isDark: totalBrightness / pixelCount < 0.3,
    };
  });
}
```

### Pattern 4: Structured Visual Analysis Output
**What:** Format analysis for Claude consumption with actionable descriptions
**When to use:** For visual renderer analysis command
**Example:**
```javascript
// Output structure optimized for Claude Code feedback
function formatAnalysis(canvasData, screenshotPath) {
  return {
    // Objective metrics
    metrics: {
      colors: canvasData.dominantColors,
      brightness: canvasData.avgBrightness,
      saturation: canvasData.avgSaturation,
      diversity: canvasData.colorDiversity,
      flags: {
        monochrome: canvasData.isMonochrome,
        dark: canvasData.isDark,
        highContrast: canvasData.avgBrightness > 0.5 && canvasData.dominantColors.length < 5,
      },
    },
    // Composition hints (from density analysis)
    composition: {
      distribution: analyzeDistribution(canvasData),  // 'centered', 'edge-heavy', 'uniform'
      density: analyzeDensity(canvasData),            // 'sparse', 'moderate', 'dense'
    },
    // For subjective analysis by Claude
    screenshotPath: screenshotPath,
    // Reference comparison placeholder
    similarTo: null, // Populated by compare tool
  };
}
```

### Anti-Patterns to Avoid
- **Dumping full code in search results:** Defeats technique-learning workflow; use separate get_code tool
- **Returning raw pixel arrays:** Too much data; aggregate into meaningful metrics
- **Logging to stdout in MCP server:** Corrupts JSON-RPC; use stderr only
- **Loading full dataset in MCP server:** Use index from Phase 1; lazy-load code on demand
- **Synchronous Puppeteer operations:** Always await; browser operations are async

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MCP transport | Custom stdio handling | StdioServerTransport | Handles JSON-RPC framing, error recovery |
| Schema validation | Manual type checking | Zod schemas via SDK | SDK validates automatically, type-safe |
| Color quantization | Custom bucketing | MMCQ/median cut (in color-thief) | Better perceptual clustering, handles edge cases |
| Screenshot capture | Manual Chrome DevTools | Puppeteer screenshot API | Handles timing, canvas detection, scale factors |
| Hash-based rendering | Custom hash injection | Existing sketch pattern | Sketches already support tokenData.hash / fxhash |

**Key insight:** The MCP SDK handles all protocol complexity. Focus effort on tool semantics (what information to return, how to format it) rather than transport mechanics.

## Common Pitfalls

### Pitfall 1: stdout Corruption in MCP Server
**What goes wrong:** Server sends non-JSON-RPC data to stdout, client disconnects
**Why it happens:** Using console.log() instead of console.error() for debugging
**How to avoid:**
- ALL logging must use console.error()
- Never use console.log() in MCP server code
- Test with Claude Desktop to catch issues early
**Warning signs:** "Failed to parse JSON" errors in Claude Desktop

### Pitfall 2: Zod Version Mismatch
**What goes wrong:** Type errors when defining inputSchema, runtime "_parse is not a function"
**Why it happens:** SDK v1.x requires Zod v3.25+; v4 has breaking API changes
**How to avoid:**
- Pin Zod to ^3.25.0 in mcp-server/package.json
- Do NOT upgrade to Zod v4 until SDK v2 is stable
- Use SDK's schema types, not custom Zod objects
**Warning signs:** TypeScript errors about missing ZodType properties

### Pitfall 3: Canvas Not Ready for Screenshot
**What goes wrong:** Screenshot captures blank or partial render
**Why it happens:** p5.js/Three.js still drawing when screenshot taken
**How to avoid:**
- Use waitForTimeout with adequate delay (2-3 seconds default)
- Check for fxpreview() and call it
- For animations, wait for first frame completion
- Consider multiple captures and comparing
**Warning signs:** Inconsistent screenshots, white backgrounds

### Pitfall 4: Memory Issues with Large Index
**What goes wrong:** MCP server crashes or slows on startup
**Why it happens:** Loading all vectors into memory at once
**How to avoid:**
- Use Phase 1 split storage (metadata separate from vectors)
- Lazy-load full project code only when requested
- Consider streaming JSON parse for very large files
**Warning signs:** Slow Claude Desktop startup, high memory usage

### Pitfall 5: Tool Results Too Large
**What goes wrong:** Claude Desktop shows warning, response truncated
**Why it happens:** Returning full code in search results, too many results
**How to avoid:**
- Default to metadata + technique explanation
- Limit search results (5-10 max)
- Use separate get_code tool for full source
- Truncate descriptions (100-200 chars)
**Warning signs:** MAX_MCP_OUTPUT_TOKENS (25k) warning

### Pitfall 6: Puppeteer Process Leak
**What goes wrong:** Browser processes accumulate, system slows
**Why it happens:** Not closing browser instance after operation
**How to avoid:**
- Always use try/finally to close browser
- Implement singleton pattern for repeated operations
- Close pages after each capture
**Warning signs:** Multiple Chrome processes in Activity Monitor

## Code Examples

Verified patterns from official sources:

### MCP Server Initialization
```javascript
// Source: modelcontextprotocol.io/docs/develop/build-server
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'generative-art-mcp', version: '2.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // CRITICAL: Use stderr, not stdout
  console.error('Generative Art MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

### Tool Response Format
```javascript
// Source: MCP SDK types
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await executeToolLogic(name, args);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`,
      }],
      isError: true,
    };
  }
});
```

### Puppeteer Screenshot with Canvas Focus
```javascript
// Source: pptr.dev/guides/screenshots + existing render.js
async function captureSketch(sketchPath, options = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: options.width || 700,
    height: options.height || 700,
    deviceScaleFactor: options.scale || 2,  // Retina quality
  });

  try {
    const htmlPath = path.join(sketchPath, 'index.html');
    await page.goto(`file://${path.resolve(htmlPath)}`, {
      waitUntil: 'networkidle0',
      timeout: 10000,
    });

    // Wait for render to complete
    await page.waitForTimeout(options.delay || 2000);

    // Try to trigger fxpreview for thumbnail timing
    await page.evaluate(() => {
      if (typeof fxpreview === 'function') fxpreview();
    }).catch(() => {});

    // Capture canvas specifically
    const canvas = await page.$('canvas');
    if (canvas) {
      return await canvas.screenshot({ type: 'png' });
    }
    return await page.screenshot({ type: 'png' });

  } finally {
    await page.close();
    await browser.close();
  }
}
```

### Hash Injection for Variations
```javascript
// Source: Art Blocks / fxhash patterns
async function captureWithHash(page, hash) {
  await page.evaluate((h) => {
    // Art Blocks style
    if (typeof window.tokenData !== 'undefined') {
      window.tokenData.hash = h;
    }
    // fxhash style
    if (typeof window.fxhash !== 'undefined') {
      window.fxhash = h;
    }
    // Trigger re-render
    if (typeof setup === 'function') setup();
    if (typeof draw === 'function') draw();
  }, hash);

  await page.waitForTimeout(2000);
}

function generateRandomHash() {
  return '0x' + Array(64).fill(0)
    .map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)])
    .join('');
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @modelcontextprotocol/sdk ^0.5.0 | @modelcontextprotocol/sdk ^1.25.2 | 2025 | Security fixes, stable API |
| @xenova/transformers | @huggingface/transformers | 2024 | Official package, WebGPU support |
| Full code in search results | Technique + code-on-request | CONTEXT.md decision | Better learning experience |
| Manual JSON-RPC | SDK transport classes | 2024 | Reliable message framing |

**Deprecated/outdated:**
- SDK versions < 1.25.2: Security vulnerability, upgrade required
- Zod v4 with SDK v1.x: API incompatibility, use v3.25+
- SDK v2 for production: Pre-alpha, wait for Q1 2026 stable

## Open Questions

Things that couldn't be fully resolved:

1. **Subjective impression generation**
   - What we know: CONTEXT.md wants "aesthetic response, feels chaotic, has tension"
   - What's unclear: How to generate this - Claude sees screenshot? Keywords from metrics?
   - Recommendation: Output metrics + screenshot path; let Claude Code interpret

2. **Reference comparison scope**
   - What we know: Compare sketch output to dataset references
   - What's unclear: Compare to all 28k? Top-N similar? By technique?
   - Recommendation: Compare by detected technique/patterns; limit to top 5 similar

3. **MCP tool discovery vs explicit use**
   - What we know: Claude Desktop auto-discovers tools via ListTools
   - What's unclear: Best granularity - few broad tools vs many specific ones
   - Recommendation: Start with 4-6 focused tools; expand based on usage patterns

4. **Animation handling in screenshots**
   - What we know: Sketches may be animated; single frame may not represent
   - What's unclear: Capture multiple frames? Which frame is "representative"?
   - Recommendation: Capture at 2s delay (default); add multi-frame option for animations

## Sources

### Primary (HIGH confidence)
- [MCP Server Build Guide](https://modelcontextprotocol.io/docs/develop/build-server) - Official tutorial, v1.x patterns
- [MCP TypeScript SDK v1.x](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x) - v1.25.2 stable
- [Puppeteer Screenshots Guide](https://pptr.dev/guides/screenshots) - Official screenshot API
- [MDN Canvas Pixel Manipulation](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas) - getImageData reference

### Secondary (MEDIUM confidence)
- [Claude Desktop MCP Setup](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop) - Configuration guide
- [MCP Features Guide](https://workos.com/blog/mcp-features-guide) - Tools/Resources/Prompts overview
- [Color Thief](https://lokeshdhakar.com/projects/color-thief/) - MMCQ algorithm reference
- Existing codebase: `mcp-server/src/index.js`, `services/renderer/render.js`

### Tertiary (LOW confidence)
- WebSearch results on visual regression testing - General patterns, not domain-specific
- Community discussions on Zod/SDK compatibility - Anecdotal, version-specific

## Metadata

**Confidence breakdown:**
- MCP SDK patterns: HIGH - Official docs, existing working code in codebase
- Puppeteer rendering: HIGH - Official docs, existing working code
- Color analysis: MEDIUM - Basic approach works, advanced features need validation
- Subjective analysis: LOW - Architecture decision, needs experimentation

**Research date:** 2026-01-18
**Valid until:** 2026-03-18 (60 days - SDK v1 stable, Puppeteer stable)
