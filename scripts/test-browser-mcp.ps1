# Test Browser MCP Servers
Write-Host "Testing Browser MCP Servers..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Test Playwright MCP Server
Write-Host "`n1. Testing Playwright MCP Server:" -ForegroundColor Yellow
try {
    $playwrightTest = npx @playwright/mcp --help 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Playwright MCP Server is working" -ForegroundColor Green
        Write-Host "   📋 Features: Browser automation, screenshots, form filling, content extraction" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Playwright MCP Server not working" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error testing Playwright MCP Server: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Browserbase MCP Server
Write-Host "`n2. Testing Browserbase MCP Server:" -ForegroundColor Yellow
try {
    $browserbaseTest = npx @browserbasehq/mcp --help 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Browserbase MCP Server is working" -ForegroundColor Green
        Write-Host "   📋 Features: Cloud browser automation, multi-session management" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Browserbase MCP Server not working" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error testing Browserbase MCP Server: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Browser Tools MCP Server
Write-Host "`n3. Testing Browser Tools MCP Server:" -ForegroundColor Yellow
try {
    $browserToolsTest = npx mcp-browser-tools --help 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Browser Tools MCP Server is working" -ForegroundColor Green
        Write-Host "   📋 Features: 36 development tools, web analysis, Chrome extension integration" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Browser Tools MCP Server not working" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error testing Browser Tools MCP Server: $($_.Exception.Message)" -ForegroundColor Red
}

# Check MCP Configuration
Write-Host "`n4. Checking Browser MCP Configuration:" -ForegroundColor Yellow
$mcpConfigPath = ".cursor/mcp.json"
if (Test-Path $mcpConfigPath) {
    Write-Host "   ✅ MCP configuration file exists: $mcpConfigPath" -ForegroundColor Green
    try {
        $config = Get-Content $mcpConfigPath | ConvertFrom-Json
        Write-Host "   📋 Configured browser servers:" -ForegroundColor Cyan
        foreach ($server in $config.mcpServers.PSObject.Properties) {
            if ($server.Name -match "playwright|browserbase|lighthouse") {
                $status = if ($server.Value.disabled) { "❌ Disabled" } else { "✅ Enabled" }
                Write-Host "      - $($server.Name): $status" -ForegroundColor White
            }
        }
    } catch {
        Write-Host "   ❌ Error reading MCP configuration: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ MCP configuration file not found: $mcpConfigPath" -ForegroundColor Red
}

# Check Browser Installation
Write-Host "`n5. Checking Browser Installation:" -ForegroundColor Yellow
$browsers = @("chrome", "firefox", "msedge")
foreach ($browser in $browsers) {
    $browserPath = Get-Command $browser -ErrorAction SilentlyContinue
    if ($browserPath) {
        Write-Host "   ✅ $browser found at: $($browserPath.Source)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $browser not found in PATH" -ForegroundColor Yellow
    }
}

Write-Host "`n=================================" -ForegroundColor Green
Write-Host "Browser MCP Servers Test Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Restart your MCP client (Cursor, Claude Desktop, etc.)" -ForegroundColor White
Write-Host "2. Check if the browser MCP servers show as online" -ForegroundColor White
Write-Host "3. Test browser automation with simple tasks like:" -ForegroundColor White
Write-Host "   - Navigate to a website" -ForegroundColor Gray
Write-Host "   - Take a screenshot" -ForegroundColor Gray
Write-Host "   - Extract page content" -ForegroundColor Gray
Write-Host "   - Fill forms and click buttons" -ForegroundColor Gray
