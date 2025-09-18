# Simple MCP Servers Test
Write-Host "Testing MCP Servers..." -ForegroundColor Green

# Test Byterover
Write-Host "`n1. Byterover MCP Server:" -ForegroundColor Yellow
$byteroverCmd = Get-Command byterover-mcp -ErrorAction SilentlyContinue
if ($byteroverCmd) {
    Write-Host "   ✅ Installed at: $($byteroverCmd.Source)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Not found" -ForegroundColor Red
}

# Test Lighthouse
Write-Host "`n2. Lighthouse MCP Server:" -ForegroundColor Yellow
try {
    npx lighthouse-mcp --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Working" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Not working" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check MCP Config
Write-Host "`n3. MCP Configuration:" -ForegroundColor Yellow
if (Test-Path ".cursor/mcp.json") {
    Write-Host "   ✅ Configuration file exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Configuration file missing" -ForegroundColor Red
}

Write-Host "`nTest complete!" -ForegroundColor Green

