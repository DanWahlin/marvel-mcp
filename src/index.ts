import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { GetCharacterByIdSchema, CharacterDataWrapperSchema, GetCharactersSchema } from './schemas.js';
import { httpRequest } from './utils.js';

const server = new Server(
    {
        name: 'marvel-api',
        version: '0.1.0',
        description: 'An MCP Server to retrieve Marvel character information.',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.log('List tools request received');
    return {
        tools: [
            {
                name: 'get_characters',
                description: 'Fetch Marvel characters with optional filters',
                inputSchema: zodToJsonSchema(GetCharactersSchema),
                outputSchema: zodToJsonSchema(CharacterDataWrapperSchema)
            },
            {
                name: 'get_character_by_id',
                description: 'Fetch a Marvel character by ID',
                inputSchema: zodToJsonSchema(GetCharacterByIdSchema),
                outputSchema: zodToJsonSchema(CharacterDataWrapperSchema)
            },
        ],
    };
});

// Call tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (!request.params.arguments) {
        throw new Error('Arguments are required');
    }
    console.log('Call tool request received');

    switch (request.params.name) {
        case 'get_characters': {
            const args = GetCharactersSchema.parse(request.params.arguments);
            const result = await httpRequest('/characters', args);
            return {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
        }

        case 'get_character_by_id': {
            const args = GetCharacterByIdSchema.parse(request.params.arguments);
            const result = await httpRequest(`/characters/${args.characterId}`);
            return {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
        }

        default:
            throw new Error(`Unknown tool: ${request.params.name}`);
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