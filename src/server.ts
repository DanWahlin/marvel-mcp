#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import express, { Request, Response } from 'express';
import { pino } from 'pino';
import { StreamableHTTPServer } from './streamable-http.js';
import { instructions } from './instructions.js';

const logger = pino({
    level: process.env.LOG_LEVEL || 'debug',
    transport: { target: 'pino-pretty', options: { colorize: true } },
});

const app = express();
app.use(express.json());

const server = new StreamableHTTPServer(
    new Server(
        {
            name: 'marvel-mcp',
            version: '1.6.4',
            description: 'An MCP Server to retrieve Marvel character information.',
        },
        {
            capabilities: {
                tools: {},
            },
            instructions
        }
    ),
    logger
);

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