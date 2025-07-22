#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, SetLevelRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { marvelTools, ToolName } from './tools/tools.js';
import { instructions } from './instructions.js';

// Logging state
let currentLogLevel: string = 'info';

const server = new Server(
  {
    name: 'marvel-mcp',
    version: '1.7.1',
    description: 'An MCP Server to retrieve Marvel character information.',
  },
  {
    capabilities: {
      tools: {},
      logging: {},
    },
    instructions
  }
);

// Logging utility function
function sendLogMessage(level: string, logger: string, data: any) {
  const logLevels = ['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency'];
  const currentLevelIndex = logLevels.indexOf(currentLogLevel);
  const messageLevelIndex = logLevels.indexOf(level);
  
  if (messageLevelIndex >= currentLevelIndex) {
    server.notification({
      method: 'notifications/message',
      params: {
        level,
        logger,
        data
      }
    });
  }
}

// Set log level handler
server.setRequestHandler(SetLevelRequestSchema, async (request) => {
  const { level } = request.params;
  currentLogLevel = level;
  sendLogMessage('info', 'marvel-mcp', { message: `Log level set to ${level}` });
  return {};
});

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
  sendLogMessage('info', 'marvel-mcp', { 
    message: 'Processing tool request', 
    tool: request.params.name 
  });

  if (!request.params.arguments) {
    sendLogMessage('error', 'marvel-mcp', { 
      message: 'Arguments are required', 
      tool: request.params.name 
    });
    throw new Error('Arguments are required');
  }

  const { name, arguments: args } = request.params;

  if (!(name in marvelTools)) {
    sendLogMessage('error', 'marvel-mcp', { 
      message: 'Unknown tool requested', 
      tool: name 
    });
    throw new Error(`Unknown tool: ${name}`);
  }

  const tool = marvelTools[name as ToolName];

  if (!tool) {
    sendLogMessage('error', 'marvel-mcp', { 
      message: 'Tool not found', 
      tool: name 
    });
    throw new Error(`Tool not found: ${name}`);
  }

  try {
    const result = await tool.handler(args);
    sendLogMessage('info', 'marvel-mcp', { 
      message: 'Completed tool request', 
      tool: name 
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  } catch (error) {
    sendLogMessage('error', 'marvel-mcp', { 
      message: 'Error processing tool', 
      tool: name,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    if (error instanceof Error) {
      throw new Error(`Error processing ${name}: ${error.message}`);
    }
    throw error;
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  sendLogMessage('info', 'marvel-mcp', { message: 'Marvel MCP Server running on stdio' });
}

main().catch((err) => {
  sendLogMessage('critical', 'marvel-mcp', { 
    message: 'Fatal error', 
    error: err instanceof Error ? err.message : String(err) 
  });
  process.exit(1);
});