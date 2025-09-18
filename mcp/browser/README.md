# Browser MCP Servers Setup

Browser automation MCP servers for AI agent visualization and manipulation in web browsers.

## Installed Servers

### 1. Playwright MCP Server
**Package**: `@playwright/mcp`
**Purpose**: Full browser automation with Playwright framework
**Features**:
- Navigate web pages
- Take screenshots
- Fill forms and click elements
- Extract content and data
- Run JavaScript in browser context
- Handle multiple tabs and windows

**Configuration**:
```json
{
  "command": "npx",
  "args": ["@playwright/mcp", "--headless"]
}
```

**Options**:
- `--headless`: Run browser in headless mode (default: headed)
- `--browser <browser>`: Choose browser (chrome, firefox, webkit, msedge)
- `--device <device>`: Emulate device (e.g., "iPhone 15")
- `--viewport-size <size>`: Set viewport size (e.g., "1280,720")
- `--timeout-action <ms>`: Action timeout (default: 5000ms)
- `--timeout-navigation <ms>`: Navigation timeout (default: 60000ms)

### 2. Browserbase MCP Server
**Package**: `@browserbasehq/mcp`
**Purpose**: Cloud-based browser automation
**Features**:
- Cloud browser instances
- Multi-session management
- Screenshot capture
- Content extraction
- Form automation

**Configuration**:
```json
{
  "command": "npx",
  "args": ["@browserbasehq/mcp"]
}
```

**Environment Variables** (if using cloud features):
- `BROWSERBASE_API_KEY`: Your Browserbase API key
- `BROWSERBASE_PROJECT_ID`: Your Browserbase project ID

### 3. Browser Tools MCP Server
**Package**: `mcp-browser-tools`
**Purpose**: Comprehensive browser development and analysis tools
**Features**:
- 36 development and analysis tools
- Browser automation
- Web application analysis
- Chrome extension integration
- AI-powered debugging

**Configuration**:
```json
{
  "command": "npx",
  "args": ["mcp-browser-tools"]
}
```

## Usage Examples

### Basic Web Navigation
```javascript
// Navigate to a website
await playwright.navigate("https://example.com");

// Take a screenshot
await playwright.screenshot("screenshot.png");

// Extract page content
const content = await playwright.getContent();
```

### Form Interaction
```javascript
// Fill a form field
await playwright.fill("#username", "myusername");

// Click a button
await playwright.click("#submit-button");

// Select from dropdown
await playwright.select("#country", "Belgium");
```

### Content Extraction
```javascript
// Get page title
const title = await playwright.getTitle();

// Get all links
const links = await playwright.getLinks();

// Get page text content
const text = await playwright.getText();
```

## Installation Commands

```bash
# Install all browser MCP servers
npm install -g @playwright/mcp
npm install -g @browserbasehq/mcp
npm install -g mcp-browser-tools
npm install -g @agent-infra/mcp-server-browser
```

## Configuration Files

- **Claude Desktop**: `mcp/browser/claude_desktop.example.json`
- **Cursor**: `mcp/browser/cursor.example.json`
- **Codex**: `mcp/browser/codex.example.json`

## Testing

Run the test script to verify all browser MCP servers:
```bash
powershell -ExecutionPolicy Bypass -File scripts/test-browser-mcp.ps1
```

## Troubleshooting

### Common Issues

1. **Browser not found**: Install Chrome, Firefox, or Edge
2. **Permission errors**: Run with appropriate permissions
3. **Timeout issues**: Increase timeout values in configuration
4. **Headless mode issues**: Try running in headed mode first

### Debug Mode

Run Playwright MCP server in debug mode:
```bash
npx @playwright/mcp --headless=false --timeout-action 10000
```

## Security Considerations

- Be cautious when automating browser actions
- Avoid running on untrusted websites
- Use appropriate timeouts to prevent hanging
- Consider using headless mode for production

## Next Steps

1. Restart your MCP client (Cursor, Claude Desktop, etc.)
2. Test browser automation with simple tasks
3. Explore advanced features like device emulation
4. Set up environment variables for cloud services if needed
