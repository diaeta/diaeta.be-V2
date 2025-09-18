# Lighthouse MCP Server Setup

Lighthouse MCP server for performance auditing and web vitals analysis.

## Installation

```bash
npm install -g lighthouse-mcp
```

## Configuration

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lighthouse": {
      "command": "npx",
      "args": ["lighthouse-mcp"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Cursor Configuration

Save as `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "lighthouse": {
      "command": "npx",
      "args": ["lighthouse-mcp"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Codex Configuration

Save as `codex.json`:

```json
{
  "mcpServers": {
    "lighthouse": {
      "command": "npx",
      "args": ["lighthouse-mcp"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Usage

The Lighthouse MCP server provides tools for:
- Running Lighthouse audits on URLs
- Analyzing web performance metrics
- Checking Core Web Vitals
- Generating performance reports

## Requirements

- Node.js 16+ (verified: v20.14.0)
- Chrome/Chromium browser for audits
- Internet connection for remote URL auditing

## Local Development

For local development, you can run the server directly:

```bash
lighthouse-mcp
```

The server will run on stdio and be available to MCP clients.
