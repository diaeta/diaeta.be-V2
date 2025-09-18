# Start Lighthouse MCP Server
# This script starts the Lighthouse MCP server for performance auditing

Write-Host "Starting Lighthouse MCP Server..." -ForegroundColor Green

# Check if lighthouse-mcp is installed
try {
    $null = npx lighthouse-mcp --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Lighthouse MCP Server is installed" -ForegroundColor Green
    } else {
        Write-Host "Lighthouse MCP Server not found. Installing..." -ForegroundColor Yellow
        npm install -g lighthouse-mcp
    }
} catch {
    Write-Host "Installing Lighthouse MCP Server..." -ForegroundColor Yellow
    npm install -g lighthouse-mcp
}

# Start the server
Write-Host "Starting Lighthouse MCP Server on stdio..." -ForegroundColor Green
npx lighthouse-mcp
