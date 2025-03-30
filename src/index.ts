#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { GetCharactersSchema, CharacterDataWrapperSchema, GetCharacterByIdSchema, GetComicsForCharacterSchema, ComicDataWrapperSchema } from './schemas.js';
import { httpRequest, serializeQueryParams } from './utils.js';

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
  return {
    tools: [
      {
        name: 'get_characters',
        description: 'Fetch Marvel characters with optional filters',
        inputSchema: zodToJsonSchema(GetCharactersSchema),
        outputSchema: zodToJsonSchema(CharacterDataWrapperSchema),
      },
      {
        name: 'get_character_by_id',
        description: 'Fetch a Marvel character by ID',
        inputSchema: zodToJsonSchema(GetCharacterByIdSchema),
        outputSchema: zodToJsonSchema(CharacterDataWrapperSchema),
      },
      {
        name: 'get_comics_for_character',
        description: 'Fetch comics filtered by character ID and optional filters',
        inputSchema: zodToJsonSchema(GetComicsForCharacterSchema),
        outputSchema: zodToJsonSchema(ComicDataWrapperSchema),
      },
    ],
  };
});

// Call tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!request.params.arguments) {
    throw new Error('Arguments are required');
  }

  switch (request.params.name) {
    case 'get_characters': {
      const args = GetCharactersSchema.parse(request.params.arguments);
      const result = await httpRequest('/characters', serializeQueryParams(args));
      const parsed = CharacterDataWrapperSchema.parse(result);
      return {
        content: [{ type: 'text', text: JSON.stringify(parsed, null, 2) }],
      };
    }

    case 'get_character_by_id': {
      const args = GetCharacterByIdSchema.parse(request.params.arguments);
      const result = await httpRequest(`/characters/${args.characterId}`);
      const parsed = CharacterDataWrapperSchema.parse(result);
      return {
        content: [{ type: 'text', text: JSON.stringify(parsed, null, 2) }],
      };
    }

    case 'get_comics_for_character': {
      const args = GetComicsForCharacterSchema.parse(request.params.arguments);
      const { characterId, ...query } = args;
      const result = await httpRequest(`/characters/${characterId}/comics`, serializeQueryParams(query));
      const parsed = ComicDataWrapperSchema.parse(result);
      return {
        content: [{ type: 'text', text: JSON.stringify(parsed, null, 2) }],
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