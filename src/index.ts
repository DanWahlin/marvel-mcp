#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { marvelTools, ToolName } from './tools/tools.js';
import { instructions } from './instructions.js';

const server = new Server(
  {
    name: 'marvel-mcp',
    version: '1.6.2',
    description: 'An MCP Server to retrieve Marvel character information.',
  },
  {
    capabilities: {
      tools: {},
    },
    instructions
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.entries(marvelTools).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.schema),
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`Processing tool request: ${request.params.name}`);

  if (!request.params.arguments) {
    throw new Error('Arguments are required');
  }

  const { name, arguments: args } = request.params;

  if (!(name in marvelTools)) {
    throw new Error(`Unknown tool: ${name}`);
  }

  const tool = marvelTools[name as ToolName];

  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }

  try {
    const result = await tool.handler(args);
    console.error(`Completed tool request: ${name}`);

    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error processing ${name}: ${error.message}`);
    }
    throw error;
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Marvel MCP Server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});