#!/usr/bin/env node

/**
 * Generative Art MCP Server v2.0.0
 *
 * Provides Claude Desktop with:
 * - Semantic search across 28k+ generative art projects (using Phase 1 embedding API)
 * - Code examples by technique/pattern
 * - Project details and statistics
 *
 * Philosophy: Teach technique first, show code on request
 * Token-efficient: Returns technique explanations, not full code dumps
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tool handlers
import { searchProjects, searchByPattern } from './tools/search.js';
import { getProjectCode } from './tools/code.js';
import { getStats, getNotableProjects } from './tools/stats.js';

// ============================================================================
// MCP SERVER
// ============================================================================

const server = new Server(
  { name: 'generative-art-mcp', version: '2.0.0' },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_projects',
      description: 'Semantic search across 28k+ generative art projects. Returns technique explanations and key concepts - use get_project_code to see full source. Great for finding inspiration, learning techniques, or discovering similar projects.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Natural language search query (e.g., "flow fields with particles", "minimalist geometric patterns", "noise-based animation")'
          },
          limit: {
            type: 'number',
            description: 'Max results to return (default 5, max 20)',
            default: 5
          },
          platform: {
            type: 'string',
            description: 'Filter by platform: "artblocks" or "fxhash"',
            enum: ['artblocks', 'fxhash']
          },
          framework: {
            type: 'string',
            description: 'Filter by framework: "p5js", "threejs", "js", "regl", "tone"',
            enum: ['p5js', 'threejs', 'js', 'regl', 'tone', 'webgl', 'svg']
          }
        },
        required: ['query'],
      },
    },
    {
      name: 'search_by_pattern',
      description: 'Find projects using a specific code pattern. Returns projects that use techniques like perlin_noise, particle_system, flow_field, voronoi, recursion, etc.',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'Pattern name to search for (e.g., "perlin_noise", "particle_system", "flow_field", "voronoi", "recursion", "trigonometry")'
          },
          limit: {
            type: 'number',
            description: 'Max results (default 10)',
            default: 10
          },
        },
        required: ['pattern'],
      },
    },
    {
      name: 'get_project_code',
      description: 'Get full source code for a specific project. Use after search when you want to study implementation details. Returns complete script with metadata.',
      inputSchema: {
        type: 'object',
        properties: {
          project_id: {
            type: 'string',
            description: 'Project ID to look up (e.g., "artblocks_123", "fxhash_456", or just "123" for Art Blocks)'
          },
        },
        required: ['project_id'],
      },
    },
    {
      name: 'get_dataset_stats',
      description: 'Get statistics about the generative art dataset: platforms, techniques, patterns, aesthetics, and framework usage.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_notable_projects',
      description: 'Get notable/popular projects from the dataset. Great for finding well-known examples to reference or learn from.',
      inputSchema: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            description: 'Filter by platform: "artblocks" or "fxhash"',
            enum: ['artblocks', 'fxhash']
          },
          limit: {
            type: 'number',
            description: 'Max results (default 20)',
            default: 20
          },
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
        result = await searchProjects(args);
        break;

      case 'search_by_pattern':
        result = await searchByPattern(args);
        break;

      case 'get_project_code':
        result = await getProjectCode(args);
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
    // CRITICAL: Use console.error for all logging to avoid stdout corruption
    console.error(`Tool error (${name}):`, error.message);
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// ============================================================================
// START SERVER
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // CRITICAL: All logging must use console.error to avoid stdout corruption
  console.error('Generative Art MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
