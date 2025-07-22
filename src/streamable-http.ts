import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, JSONRPCError, Notification, JSONRPCNotification, ListToolsRequestSchema, LoggingMessageNotification, isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { Request, Response } from 'express';
import { Logger } from 'pino';
import { randomUUID } from 'node:crypto';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { marvelTools, ToolName } from './tools/tools.js';

const JSON_RPC = '2.0';
const JSON_RPC_ERROR = -32603;

export class StreamableHTTPServer {
    mcpServer: Server;
    logger: Logger;
    // Map to store transports by session ID
    private transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

    constructor(mcpServer: Server, logger: Logger) {
        this.mcpServer = mcpServer;
        this.logger = logger;
    }

    async handleGetRequest(req: Request, res: Response) {
        res.status(405).json(this.createRPCErrorResponse('Method not allowed.'));
        this.logger.info('🚫 Responded to GET with 405 Method Not Allowed');
    }

    async handlePostRequest(req: Request, res: Response) {
        this.logger.info(`📩 POST ${req.originalUrl} - payload received`);

        try {
            // Check for existing session ID
            const sessionId = req.headers['mcp-session-id'] as string | undefined;
            let transport: StreamableHTTPServerTransport;

            if (sessionId && this.transports[sessionId]) {
                // Reuse existing transport
                transport = this.transports[sessionId];
                this.logger.info(`🔄 Reusing existing session: ${sessionId}`);
            } else if (!sessionId && isInitializeRequest(req.body)) {
                // New initialization request
                transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: () => randomUUID(),
                    onsessioninitialized: (sessionId) => {
                        // Store the transport by session ID
                        this.transports[sessionId] = transport;
                        this.logger.info(`🆕 New session initialized: ${sessionId}`);
                        
                        // Session initialized - notifications will be handled by main server
                    }
                });

                // Clean up transport when closed
                transport.onclose = () => {
                    if (transport.sessionId) {
                        delete this.transports[transport.sessionId];
                        this.logger.info(`🗑️ Session removed: ${transport.sessionId}`);
                    }
                };

                // Connect transport to the MCP server
                this.logger.info('🔄 Connecting transport to server...');
                await this.mcpServer.connect(transport);
                this.logger.info('🔗 Transport connected successfully');
            } else {
                // Invalid request
                res.status(400).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Bad Request: No valid session ID provided',
                    },
                    id: null,
                });
                this.logger.error('❌ Invalid request: No valid session ID provided');
                return;
            }

            // Handle the request
            await transport.handleRequest(req, res, req.body);
            this.logger.info(`✅ POST request handled successfully (status=${res.statusCode})`);
        } catch (error) {
            this.logger.error('💥 Error handling MCP request:', error);
            if (!res.headersSent) {
                res
                    .status(500)
                    .json(this.createRPCErrorResponse('Internal server error.'));
                this.logger.error('🔥 Responded with 500 Internal Server Error');
            }
        }
    }

    // Handle DELETE requests for session termination
    async handleDeleteRequest(req: Request, res: Response) {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        if (!sessionId || !this.transports[sessionId]) {
            res.status(400).send('Invalid or missing session ID');
            this.logger.info('🚫 DELETE request rejected: Invalid or missing session ID');
            return;
        }

        const transport = this.transports[sessionId];

        try {
            transport.close();
            delete this.transports[sessionId];
            res.status(200).send('Session terminated successfully');
            this.logger.info(`🔒 Session ${sessionId} terminated successfully`);
        } catch (error) {
            this.logger.error(`💥 Error terminating session ${sessionId}:`, error);
            res.status(500).send('Error terminating session');
        }
    }


    async close() {
        this.logger.info('🛑 Shutting down server...');
        // Close all active transports
        for (const transport of Object.values(this.transports)) {
            try {
                transport.close();
                this.logger.info(`🗑️ Transport closed for session ID: ${transport.sessionId}`);
            } catch (error) {
                this.logger.error('💥 Error closing transport:', error);
            }
        }
        await this.mcpServer.close();
        this.logger.info('👋 Server shutdown complete.');
    }

    private async sendMessages(transport: StreamableHTTPServerTransport) {
        const message: LoggingMessageNotification = {
            method: 'notifications/message',
            params: { 
                level: 'info', 
                logger: 'marvel-mcp-http',
                data: { message: 'SSE Connection established' }
            },
        };
        this.logger.info('📬 Sending SSE connection established notification.');
        this.sendNotification(transport, message);
        this.logger.info('✅ Notification sent successfully.');
    }

    private sendNotification(
        transport: StreamableHTTPServerTransport,
        notification: Notification
    ) {
        const rpcNotification: JSONRPCNotification = {
            ...notification,
            jsonrpc: JSON_RPC,
        };
        this.logger.info(`📢 Sending notification: ${notification.method}`);
        transport.send(rpcNotification).catch(error => {
            this.logger.error('📛 Error sending notification:', error);
        });
    }

    private createRPCErrorResponse(message: string): JSONRPCError {
        return {
            jsonrpc: JSON_RPC,
            error: {
                code: JSON_RPC_ERROR,
                message: message,
            },
            id: randomUUID(),
        };
    }
}