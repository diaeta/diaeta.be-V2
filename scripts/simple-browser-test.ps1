# Simple Browser MCP Test
Write-Host "Testing Browser MCP Servers..." -ForegroundColor Green

# Test Playwright
Write-Host "`n1. Playwright MCP Server:" -ForegroundColor Yellow
try {
    npx @playwright/mcp --help 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Working" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Not working" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Browserbase
Write-Host "`n2. Browserbase MCP Server:" -ForegroundColor Yellow
try {
    npx @browserbasehq/mcp --help 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Working" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Not working" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check Config
Write-Host "`n3. MCP Configuration:" -ForegroundColor Yellow
if (Test-Path ".cursor/mcp.json") {
    Write-Host "   ✅ Configuration exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Configuration missing" -ForegroundColor Red
}

Write-Host "`nTest complete!" -ForegroundColor Green
