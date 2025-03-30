<div align="center">

<img src="./images/captain-america.jpg" alt="" align="center" height="96" />

# Marvel MCP Server

[![Open project in GitHub Codespaces](https://img.shields.io/badge/Codespaces-Open-blue?style=flat-square&logo=github)](https://codespaces.new/danwahlin/marvel-mcp?hide_repo_select=true&ref=main&quickstart=true)
![Node version](https://img.shields.io/badge/Node.js->=20-3c873a?style=flat-square)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

⭐ If you like this project, star it on GitHub!

[Features](#features) • [Tools](#tools) • [Setup](#setup) • [Configuring an MCP Host](#configuring-an-mcp-host)

</div>

MCP Server for the [Marvel Developer API](https://developer.marvel.com/documentation/getting_started), enabling interaction with characters and comics data.

> **Note**: All data from this MCP server is fetched from the [official Marvel API](https://developer.marvel.com/documentation/getting_started) and owned by Marvel. This project is not affiliated with Marvel in any way.

<a name="features"></a>
## 🔧 Features

- **List Marvel Characters**: Supports filters like `nameStartsWith`, `limit`, `comics`, `series`, etc.
- **Fetch a Marvel Character by ID**: Get detailed info on any character using their `characterId`.
- **Fetch Comics for a Character**: Get a list of comics featuring a specific character, with various filters like `format`, `dateRange`, etc.
- **Tool-based MCP integration**: Register this server with Model Context Protocol (MCP) tools (VS Code, Claude, etc.).
- **Environment Configuration**: Use `.env` file to manage environment variables like `MARVEL_PUBLIC_KEY`, `MARVEL_PRIVATE_KEY` and `MARVEL_API_BASE`.

<a name="tools"></a>
## 🧰 Tools

### 1. `get_characters` 🔍🦸‍♂️
- Description: Fetch Marvel characters with optional filters
- Inputs:
  - `name` (optional string): Full character name
  - `nameStartsWith` (optional string): Characters whose names start with the string
  - `modifiedSince` (optional string): ISO date
  - `comics`, `series`, `events`, `stories` (optional string): Comma-separated IDs
  - `orderBy` (optional string): Fields like `name`, `-modified`
  - `limit` (optional number): Max results (1–100)
  - `offset` (optional number): Pagination offset
- Returns: JSON response with matching characters. See `CharacterDataWrapperSchema` in `src/schemas.ts` for details.

### 2. `get_character_by_id` 🆔🧑‍🎤
- Description: Fetch a character by ID
- Input:
  - `characterId` (number): The unique ID of the character
- Returns: Character details. See `CharacterDataWrapperSchema` in `src/schemas.ts` for details.

### 3. `get_comics_for_character` 📚🎭
- Description: Fetch comics filtered by character ID and optional filters
- Inputs:
  - `characterId` (number): The unique ID of the character
  - Optional filters:
    - `format`, `formatType` (string): Comic format (e.g., `comic`, `hardcover`)
    - `noVariants`, `hasDigitalIssue` (boolean): Flags to exclude variants or include only digital issues
    - `dateDescriptor` (string): Predefined ranges like `thisWeek`, `nextWeek`
    - `dateRange` (string): Custom date range (e.g., `2023-01-01,2023-12-31`)
    - `title`, `titleStartsWith` (string): Filter by title or title prefix
    - `startYear`, `issueNumber`, `digitalId` (number): Numeric filters
    - `diamondCode`, `upc`, `isbn`, `ean`, `issn` (string): Identifier filters
    - `creators`, `series`, `events`, `stories`, `sharedAppearances`, `collaborators` (string): Comma-separated IDs
    - `orderBy` (string): Fields like `title`, `-modified`
    - `limit`, `offset` (number): Pagination options
- Returns: JSON response with comics containing the character. See `ComicDataWrapperSchema` in `src/schemas.ts` for details (it simply points to `CharacterDataWrapperSchema`).

<a name="setup"></a>
## 🛠️ Setup

1. Sign up for a [Marvel Developer API](https://developer.marvel.com/documentation/getting_started) account and get your public and private API keys.

1. Clone this repository:

    ```bash
    git clone https://github.com/DanWahlin/marvel-mcp-server
    ```

1. Rename `.env.template ` to `.env`.

1. Add your Marvel API public and private keys to the `.env` file.

    ```bash
    MARVEL_PUBLIC_KEY=YOUR_PUBLIC_KEY
    MARVEL_PRIVATE_KEY=YOUR_PRIVATE_KEY
    MARVEL_API_BASE=https://gateway.marvel.com/v1/public
    ```
1. Install the required dependencies and build the project.

    ```bash
    npm install
    npm run build
    ```

1. (Optional) To try out the server using MCP Inspector run the following command:

    ```bash
    # Start the MCP Inspector
    npx @modelcontextprotocol/inspector node build/index.js
    ```

    Visit the MCP Inspector URL shown in the console in your browser. Change `Arguments` to `dist/index.js` and select `Connect`. Select `List Tools` to see the available tools.

<a name="configuring-an-mcp-host"></a>
## Configuring an MCP Host

### Use with Claude Desktop

Add the following to your claude_desktop_config.json:

```json
{
  "mcpServers": {
    "marvel-mcp": {
      "type": "stdio",
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

### Use with GitHub Copilot

> **Note**: If you already have the MCP server enabled with Claude Desktop, add `chat.mcp.discovery.enabled: true` in your VS Code settings and it will discover existing MCP server lists.

If you want to associate the MCP server with a specific repo, create a `.vscode/mcp.json` file with this content:

   ```json
   {
     "inputs": [],
     "servers": {
        "marvel-mcp": {
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

If you want to associate the MCP server with all repos, add the following to your VS Code User Settings JSON:

   ```json
  "mcp": {
    "servers": {
        "marvel-mcp": {
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

### Using Tools in GitHub Copilot

1. Now that the mcp server is discoverable, open GitHub Copilot and select the `Agent` mode (not `Chat` or `Edits`).
2. Select the "refresh" button in the Copilot chat text field to refresh the server list.
3. Select the "🛠️" button to see all the possible tools, including the ones from this repo.
4. Put a question in the chat that would naturally invoke one of the tools, for example: 

    ```
    Get a list of Marvel characters and output as a bulleted list.

    What comics is Wolverine in?
    
    Which characters appear in the Avengers comics?
    ```
