# Test MCP Servers Configuration
# This script tests if the MCP servers can start properly

Write-Host "Testing MCP Servers Configuration..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test Byterover MCP Server
Write-Host "`n1. Testing Byterover MCP Server..." -ForegroundColor Yellow
try {
    $byteroverCmd = Get-Command byterover-mcp -ErrorAction SilentlyContinue
    if ($byteroverCmd) {
        Write-Host "   ✅ Byterover MCP Server is installed" -ForegroundColor Green
        Write-Host "   📍 Location: $($byteroverCmd.Source)" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Byterover MCP Server not found" -ForegroundColor Red
        Write-Host "   💡 Install with: npm install -g byterover-mcp" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error checking Byterover MCP Server: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Lighthouse MCP Server
Write-Host "`n2. Testing Lighthouse MCP Server..." -ForegroundColor Yellow
try {
    $lighthouseTest = npx lighthouse-mcp --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Lighthouse MCP Server is installed and working" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Lighthouse MCP Server not working" -ForegroundColor Red
        Write-Host "   💡 Install with: npm install -g lighthouse-mcp" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error checking Lighthouse MCP Server: $($_.Exception.Message)" -ForegroundColor Red
}

# Check MCP Configuration
Write-Host "`n3. Checking MCP Configuration..." -ForegroundColor Yellow
$mcpConfigPath = ".cursor/mcp.json"
if (Test-Path $mcpConfigPath) {
    Write-Host "   ✅ MCP configuration file exists: $mcpConfigPath" -ForegroundColor Green
    try {
        $config = Get-Content $mcpConfigPath | ConvertFrom-Json
        Write-Host "   📋 Configured servers:" -ForegroundColor Cyan
        foreach ($server in $config.mcpServers.PSObject.Properties) {
            $status = if ($server.Value.disabled) { "❌ Disabled" } else { "✅ Enabled" }
            Write-Host "      - $($server.Name): $status" -ForegroundColor White
        }
    } catch {
        Write-Host "   ❌ Error reading MCP configuration: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ MCP configuration file not found: $mcpConfigPath" -ForegroundColor Red
    Write-Host "   💡 Create the configuration file for your MCP client" -ForegroundColor Yellow
}

# Check Environment Variables
Write-Host "`n4. Checking Environment Variables..." -ForegroundColor Yellow
$apiKey = $env:BYTEROVER_PUBLIC_API_KEY
$userId = $env:BYTEROVER_USER_ID

if ($apiKey) {
    Write-Host "   ✅ BYTEROVER_PUBLIC_API_KEY is set" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  BYTEROVER_PUBLIC_API_KEY not set (will run in local mode)" -ForegroundColor Yellow
}

if ($userId) {
    Write-Host "   ✅ BYTEROVER_USER_ID is set: $userId" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  BYTEROVER_USER_ID not set (will use default: codex-local)" -ForegroundColor Yellow
}

Write-Host "`n=====================================" -ForegroundColor Green
Write-Host "MCP Servers Test Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Restart your MCP client (Cursor, Claude Desktop, etc.)" -ForegroundColor White
Write-Host "2. Check if the servers show as online in your MCP client" -ForegroundColor White
Write-Host "3. If still offline, check the MCP client logs for errors" -ForegroundColor White

