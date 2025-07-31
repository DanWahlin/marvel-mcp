# Marvel MCP Server Development Guide

## Project Overview
This is a Model Context Protocol (MCP) server that provides AI tools access to the Marvel Comics API. The server exposes 6 main tools for fetching Marvel characters and comics data through a standardized MCP interface.

## Architecture

### Core Components
- **Entry Point**: `src/index.ts` - MCP server setup with stdio transport
- **Tools Registry**: `src/tools/tools.ts` - Centralized tool exports
- **HTTP Client**: `src/utils.ts` - Marvel API authentication and request handling
- **Schema Definitions**: `src/tools/schemas.ts` - Shared Zod schemas for Marvel API responses

### Tool Pattern
Each tool follows a consistent structure in `src/tools/{tool_name}/`:
```
get_characters/
├── index.ts      # Tool definition with handler
└── schemas.ts    # Input validation schema
```

Tool implementation pattern:
```typescript
export const get_characters = {
    description: `Fetch Marvel characters with optional filters.`,
    schema: GetCharactersSchema,
    handler: async (args: any) => {
        const argsParsed = GetCharactersSchema.parse(args);
        const res = await httpRequest('/characters', serializeQueryParams(argsParsed));
        return CharacterDataWrapperSchema.parse(res);
    }
};
```

## Development Workflows

### Build and Test
```bash
npm run build          # TypeScript compilation to dist/
npm run watch          # Watch mode compilation
npm run dev            # Build + watch with nodemon
npm run inspect        # Test with MCP Inspector
```

### Local Development
- Use `npm run inspect` to test tools with MCP Inspector web interface
- Environment variables loaded from `.env` file (copy from `.env.template`)
- Server runs in stdio mode for MCP hosts or HTTP mode for direct testing

### Adding New Tools
1. Create tool directory: `src/tools/new_tool/`
2. Define input schema in `schemas.ts` using Zod
3. Implement tool in `index.ts` following the pattern above
4. Export from `src/tools/tools.ts`
5. Update response schemas in `src/tools/schemas.ts` if needed

## Marvel API Integration

### Authentication
Uses MD5 hash authentication: `hash = md5(timestamp + privateKey + publicKey)`
Handled automatically in `createAuthParams()` function.

### Request Pattern
All API calls go through `httpRequest()` in `utils.ts`:
- Adds authentication parameters
- Handles query parameter serialization
- Returns parsed JSON response

### Environment Variables
Required for API access:
- `MARVEL_PUBLIC_KEY` - Marvel developer public key
- `MARVEL_PRIVATE_KEY` - Marvel developer private key  
- `MARVEL_API_BASE` - API base URL (https://gateway.marvel.com/v1/public)

## MCP Configuration

### VS Code Setup
Configure in `.vscode/mcp.json` or global settings:
```json
{
  "servers": {
    "marvel-mcp": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "MARVEL_PUBLIC_KEY": "${input:marvel-public-api-key}",
        "MARVEL_PRIVATE_KEY": "${input:marvel-private-api-key}"
      }
    }
  }
}
```

### Claude Desktop Setup
Add to `claude_desktop_config.json` with direct API keys in env block.

## Key Conventions

### Schema Validation
- All tool inputs validated with Zod schemas
- API responses validated against Marvel schema definitions
- Use `serializeQueryParams()` for boolean/undefined handling

### Error Handling
- Missing environment variables throw at startup
- API errors propagated through MCP error responses
- Logging levels configurable via MCP SetLevel requests

### HTML Generation
Tools can generate formatted HTML pages using template in `src/instructions.ts`:
- Dynamic styling based on character/comic theme
- Image URLs as clickable hyperlinks (never `<img>` tags)
- Output to `marvel-content.html` in project root
