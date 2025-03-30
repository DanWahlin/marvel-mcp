# Marvel MCP Server

MCP Server for the [Marvel Developer API](https://developer.marvel.com/), enabling interaction with characters and comics data.

## 🔧 Features

- **List Marvel Characters**: Supports filters like `nameStartsWith`, `limit`, `comics`, `series`, etc.
- **Fetch a Marvel Character by ID**: Get detailed info on any character using their `characterId`
- **Tool-based MCP integration**: Register this server with Model Context Protocol (MCP) tools (VS Code, Claude, etc.)
- **Environment Configuration**: Use `.env` file to manage environment variables like `MARVEL_API_KEY` and `MARVEL_API_BASE`

## 🧰 Tools

### 1. `get_characters`
- Description: Fetch Marvel characters with optional filters
- Inputs:
  - `name` (optional string): Full character name
  - `nameStartsWith` (optional string): Characters whose names start with the string
  - `modifiedSince` (optional string): ISO date
  - `comics`, `series`, `events`, `stories` (optional string): Comma-separated IDs
  - `orderBy` (optional string): Fields like `name`, `-modified`
  - `limit` (optional number): Max results (1–100)
  - `offset` (optional number): Pagination offset
- Returns: JSON response with matching characters

### 2. `get_character_by_id`
- Description: Fetch a character by ID
- Input:
  - `characterId` (number): The unique ID of the character
- Returns: Character details

## 🛠️ Setup

### 📦 Install

```bash
npm install
npm run build
```

### Using MCP Inspector

```bash
# Start the MCP server
npm run dev

# Start the MCP Inspector
npx @modelcontextprotocol/inspector node build/index.js
```

Visit the MCP Inspector URL shown in the console. Change `Arguments` to `dist/index.js` and select `Connect`. Select `List Tools` to see the available tools.

### If you already installed in Claude Desktop

Enable `chat.mcp.discovery.enabled: true` in your settings and VS Code will discover existing MCP server lists, and proceed to [use the tool in GitHub Copilot Agent mode](#using-tools-in-copilot).

### If you did not install in Claude Desktop

If you want to associate the MCP server with a specific repo, create a `.vscode/mcp.json` file with this content:

   ```json
   {
     "inputs": [],
     "servers": {
        "marvel-api": {
            "command": "node",
            "args": [
                "/PATH/TO/marvel-mcp-server/dist/index.js"
            ],
            "env": {
                "MARVEL_PUBLIC_KEY": "",
                "MARVEL_PRIVATE_KEY": "",
                "MARVEL_API_BASE": "https://gateway.marvel.com/v1/public"
            }
        }
     }
   }
   ```

If you want to associate the MCP server with all repos, add to your VS Code User Settings JSON:

   ```json
  "mcp": {
    "servers": {
        "marvel-api": {
            "command": "node",
            "args": [
                "/PATH/TO/marvel-mcp-server/dist/index.js"
            ],
            "env": {
                "MARVEL_PUBLIC_KEY": "",
                "MARVEL_PRIVATE_KEY": "",
                "MARVEL_API_BASE": "https://gateway.marvel.com/v1/public"
            }
        },
    }
  },
  "chat.mcp.discovery.enabled": true,
   ```

## Using tools in Copilot

1. Now that the mcp server is discoverable, open GitHub Copilot and select the `Agent` mode (not `Chat` or `Edits`).
2. Select the "refresh" button in the Copilot chat text field to refresh the server list.
3. Select the "🛠️" button to see all the possible tools, including the ones from this repo.
4. Put a question in the chat that would naturally invoke one of the tools, for example: 

    ```
    Get a list of Marvel characters and output as a bulleted list.

    What comics is Wolverine in?
    
    Which characters appear in the Avengers comics?
    ```
