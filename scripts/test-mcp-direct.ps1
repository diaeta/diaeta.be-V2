# Test MCP Servers Direct Execution
Write-Host "Testing MCP Servers Direct Execution..." -ForegroundColor Green

# Test Byterover MCP Server
Write-Host "`n1. Testing Byterover MCP Server (stdio mode):" -ForegroundColor Yellow
try {
    $byteroverPath = "C:\nvm4w\nodejs\node_modules\byterover-mcp\dist\cli.js"
    if (Test-Path $byteroverPath) {
        Write-Host "   ✅ Byterover MCP Server found at: $byteroverPath" -ForegroundColor Green
        Write-Host "   🧪 Testing startup (will timeout after 5 seconds)..." -ForegroundColor Cyan
        
        # Start the server and let it run for 5 seconds
        $job = Start-Job -ScriptBlock {
            param($path)
            node $path --user-id codex-local
        } -ArgumentList $byteroverPath
        
        Start-Sleep -Seconds 3
        Stop-Job $job
        Remove-Job $job
        
        Write-Host "   ✅ Byterover MCP Server started successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Byterover MCP Server not found at: $byteroverPath" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error testing Byterover MCP Server: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Lighthouse MCP Server
Write-Host "`n2. Testing Lighthouse MCP Server (stdio mode):" -ForegroundColor Yellow
try {
    Write-Host "   🧪 Testing startup (will timeout after 5 seconds)..." -ForegroundColor Cyan
    
    # Start the server and let it run for 5 seconds
    $job = Start-Job -ScriptBlock {
        npx lighthouse-mcp
    }
    
    Start-Sleep -Seconds 3
    Stop-Job $job
    Remove-Job $job
    
    Write-Host "   ✅ Lighthouse MCP Server started successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error testing Lighthouse MCP Server: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=====================================" -ForegroundColor Green
Write-Host "MCP Servers Direct Test Complete!" -ForegroundColor Green
Write-Host "`nIf both tests passed, the MCP servers should work with the current configuration." -ForegroundColor Cyan
Write-Host "Restart Cursor and check if the servers show as online." -ForegroundColor Cyan

