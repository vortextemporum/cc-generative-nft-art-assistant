#!/usr/bin/env node

/**
 * Generative Art MCP Server
 *
 * Provides Claude Desktop with:
 * - Semantic search across 28k+ generative art projects
 * - Code examples by technique/pattern
 * - Project details and statistics
 *
 * Token-efficient: Returns only relevant chunks, not full dataset
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

// ============================================================================
// DATA LOADING
// ============================================================================

let embeddings = null;
let codeExamples = null;
let knowledge = null;
let extractor = null;

function loadData() {
  const embPath = path.join(ROOT, 'processed/embeddings.json');
  const codePath = path.join(ROOT, 'processed/code-examples.json');
  const knowPath = path.join(ROOT, 'processed/system-knowledge.json');

  if (fs.existsSync(embPath)) {
    embeddings = JSON.parse(fs.readFileSync(embPath, 'utf8'));
  }
  if (fs.existsSync(codePath)) {
    codeExamples = JSON.parse(fs.readFileSync(codePath, 'utf8'));
  }
  if (fs.existsSync(knowPath)) {
    knowledge = JSON.parse(fs.readFileSync(knowPath, 'utf8'));
  }
}

// ============================================================================
// EMBEDDING & SEARCH
// ============================================================================

async function initEmbedding() {
  if (extractor) return extractor;
  const { pipeline } = await import('@xenova/transformers');
  extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  return extractor;
}

async function embed(text) {
  const model = await initEmbedding();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

async function semanticSearch(query, topK = 5) {
  if (!embeddings) {
    return { error: 'Embeddings not loaded. Run: npm run build:embeddings' };
  }

  const queryEmb = await embed(query);
  const scored = embeddings.map((doc, idx) => ({
    score: cosineSimilarity(queryEmb, doc.embedding),
    id: doc.id,
    content: doc.content,
    metadata: doc.metadata,
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(r => ({
    score: r.score.toFixed(4),
    project_id: r.metadata.project_id,
    source: r.metadata.source,
    artist: r.metadata.artist,
    script_type: r.metadata.script_type,
    patterns: r.metadata.patterns,
    summary: r.content,
  }));
}

// ============================================================================
// TOOL IMPLEMENTATIONS
// ============================================================================

function searchByPattern(pattern, limit = 10) {
  if (!embeddings) return [];

  const results = embeddings.filter(doc =>
    doc.metadata.patterns?.some(p =>
      p.toLowerCase().includes(pattern.toLowerCase())
    )
  ).slice(0, limit);

  return results.map(r => ({
    project_id: r.metadata.project_id,
    source: r.metadata.source,
    artist: r.metadata.artist,
    patterns: r.metadata.patterns,
    summary: r.content.slice(0, 300),
  }));
}

function getCodeExample(projectId) {
  if (!codeExamples) return null;
  return codeExamples.find(e =>
    e.project_id === projectId ||
    e.name.toLowerCase().includes(projectId.toLowerCase())
  );
}

function getCodeExamplesByTechnique(technique, limit = 5) {
  if (!codeExamples) return [];

  return codeExamples.filter(e =>
    e.patterns?.some(p => p.toLowerCase().includes(technique.toLowerCase())) ||
    e.description?.toLowerCase().includes(technique.toLowerCase())
  ).slice(0, limit).map(e => ({
    name: e.name,
    artist: e.artist,
    source: e.source,
    script_type: e.script_type,
    patterns: e.patterns,
    description: e.description?.slice(0, 200),
    script_preview: e.script?.slice(0, 1000),
    script_length: e.script?.length,
  }));
}

function getStats() {
  if (!knowledge) return null;

  return {
    overview: knowledge.overview,
    platforms: knowledge.platforms,
    script_types: knowledge.script_types,
    top_aesthetics: knowledge.common_aesthetics?.slice(0, 10),
    top_patterns: knowledge.common_patterns?.slice(0, 10),
    top_tags: knowledge.top_tags?.slice(0, 10),
    techniques: knowledge.techniques_guide,
  };
}

function getNotableProjects(source = null, limit = 20) {
  if (!knowledge?.notable_projects) return [];

  let projects = knowledge.notable_projects;
  if (source) {
    projects = projects.filter(p => p.source === source);
  }
  return projects.slice(0, limit);
}

// ============================================================================
// MCP SERVER
// ============================================================================

const server = new Server(
  { name: 'generative-art-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_projects',
      description: 'Semantic search across 28k+ generative art projects. Returns most relevant projects for a query. Use for finding inspiration, similar projects, or techniques.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query (e.g., "flow fields with particles", "minimalist geometric")' },
          limit: { type: 'number', description: 'Max results (default 5)', default: 5 },
        },
        required: ['query'],
      },
    },
    {
      name: 'search_by_pattern',
      description: 'Find projects using a specific code pattern (e.g., "perlin_noise", "particle_system", "flow_field", "voronoi")',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'Pattern name to search for' },
          limit: { type: 'number', description: 'Max results (default 10)', default: 10 },
        },
        required: ['pattern'],
      },
    },
    {
      name: 'get_code_example',
      description: 'Get full code example for a specific project. Returns script, patterns, and metadata.',
      inputSchema: {
        type: 'object',
        properties: {
          project_id: { type: 'string', description: 'Project ID or name to look up' },
        },
        required: ['project_id'],
      },
    },
    {
      name: 'get_code_by_technique',
      description: 'Get code examples that use a specific technique (e.g., "noise", "physics", "shaders")',
      inputSchema: {
        type: 'object',
        properties: {
          technique: { type: 'string', description: 'Technique to search for' },
          limit: { type: 'number', description: 'Max results (default 5)', default: 5 },
        },
        required: ['technique'],
      },
    },
    {
      name: 'get_dataset_stats',
      description: 'Get statistics about the generative art dataset: platforms, techniques, patterns, aesthetics',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_notable_projects',
      description: 'Get notable/popular projects from the dataset',
      inputSchema: {
        type: 'object',
        properties: {
          source: { type: 'string', description: 'Filter by platform: "artblocks" or "fxhash"', enum: ['artblocks', 'fxhash'] },
          limit: { type: 'number', description: 'Max results (default 20)', default: 20 },
        },
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'search_projects':
        result = await semanticSearch(args.query, args.limit || 5);
        break;

      case 'search_by_pattern':
        result = searchByPattern(args.pattern, args.limit || 10);
        break;

      case 'get_code_example':
        result = getCodeExample(args.project_id);
        if (!result) result = { error: `Project "${args.project_id}" not found in code examples` };
        break;

      case 'get_code_by_technique':
        result = getCodeExamplesByTechnique(args.technique, args.limit || 5);
        break;

      case 'get_dataset_stats':
        result = getStats();
        break;

      case 'get_notable_projects':
        result = getNotableProjects(args.source, args.limit || 20);
        break;

      default:
        result = { error: `Unknown tool: ${name}` };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// List resources (dataset stats as a resource)
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'genart://stats',
      name: 'Dataset Statistics',
      description: 'Overview of the generative art dataset',
      mimeType: 'application/json',
    },
    {
      uri: 'genart://techniques',
      name: 'Technique Guide',
      description: 'Guide to common generative art techniques',
      mimeType: 'application/json',
    },
  ],
}));

// Read resources
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'genart://stats') {
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(getStats(), null, 2),
      }],
    };
  }

  if (uri === 'genart://techniques') {
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(knowledge?.techniques_guide || {}, null, 2),
      }],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// ============================================================================
// START SERVER
// ============================================================================

async function main() {
  loadData();

  if (!embeddings) {
    console.error('Warning: Embeddings not found. Semantic search will be unavailable.');
    console.error('Run: cd mcp-server && npm run build:embeddings');
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Generative Art MCP server running on stdio');
}

main().catch(console.error);
