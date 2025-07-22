#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SetLevelRequestSchema, CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express, { Request, Response } from 'express';
import { pino } from 'pino';
import { StreamableHTTPServer } from './streamable-http.js';
import { instructions } from './instructions.js';
import { marvelTools, ToolName } from './tools/tools.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

const logger = pino({
    level: process.env.LOG_LEVEL || 'debug',
    transport: { target: 'pino-pretty', options: { colorize: true } },
});

// Logging state
let currentLogLevel: string = 'info';

const app = express();
app.use(express.json());

const mcpServer = new Server(
    {
        name: 'marvel-mcp',
        version: '1.8.1',
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

const server = new StreamableHTTPServer(mcpServer, logger);

// Logging utility function
function sendLogMessage(level: 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency', loggerName: string, data: any) {
  const logLevels = ['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency'];
  const currentLevelIndex = logLevels.indexOf(currentLogLevel);
  const messageLevelIndex = logLevels.indexOf(level);
  
  if (messageLevelIndex >= currentLevelIndex) {
    try {
      mcpServer.notification({
        method: 'notifications/message',
        params: {
          level,
          logger: loggerName,
          data
        }
      });
    } catch (error) {
      // Fallback to pino logger if MCP notification fails
      logger.info(`[MCP-${loggerName}] [${level.toUpperCase()}] ${data.message || JSON.stringify(data)}`);
    }
  }
}

// Override request handlers to add logging
mcpServer.setRequestHandler(SetLevelRequestSchema, async (request) => {
  const { level } = request.params;
  currentLogLevel = level;
  sendLogMessage('info', 'marvel-mcp-http', { message: `Log level set to ${level}` });
  return {};
});

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  sendLogMessage('info', 'marvel-mcp-http', { 
    message: 'Tools list requested',
    timestamp: new Date().toISOString()
  });
  
  return {
    tools: Object.entries(marvelTools).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.schema),
    })),
  };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  sendLogMessage('info', 'marvel-mcp-http', { 
    message: 'Processing tool request', 
    tool: name 
  });

  if (!args) {
    sendLogMessage('error', 'marvel-mcp-http', { 
      message: 'Arguments are required', 
      tool: name 
    });
    throw new Error('Arguments are required');
  }

  if (!(name in marvelTools)) {
    sendLogMessage('error', 'marvel-mcp-http', { 
      message: 'Unknown tool requested', 
      tool: name 
    });
    throw new Error(`Unknown tool: ${name}`);
  }

  const tool = marvelTools[name as ToolName];

  if (!tool) {
    sendLogMessage('error', 'marvel-mcp-http', { 
      message: 'Tool not found', 
      tool: name 
    });
    throw new Error(`Tool not found: ${name}`);
  }

  try {
    const result = await tool.handler(args);
    sendLogMessage('info', 'marvel-mcp-http', { 
      message: 'Completed tool request', 
      tool: name 
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  } catch (error) {
    sendLogMessage('error', 'marvel-mcp-http', { 
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

const router = express.Router();
const MCP_ENDPOINT = '/mcp';

router.get(MCP_ENDPOINT, async (req: Request, res: Response) => {
    await server.handleGetRequest(req, res);
});

router.post(MCP_ENDPOINT, async (req: Request, res: Response) => {
    await server.handlePostRequest(req, res);
});

// Handle session termination
router.delete(MCP_ENDPOINT, async (req: Request, res: Response) => {
    await server.handleDeleteRequest(req, res);
});

app.use('/', router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    logger.info(`🚀 Marvel MCP Streamable HTTP Server`);
    logger.info(`🌐 MCP endpoint: http://localhost:${PORT}${MCP_ENDPOINT}`);
    logger.info(`⌨️ Press Ctrl+C to stop the server`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info(`🛑 Shutting down server...`);
    await server.close();
    process.exit(0);
});