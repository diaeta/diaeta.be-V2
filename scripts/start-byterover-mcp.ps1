param(
  [int]$Port = 5174,
  [string]$UserId = $env:BYTEROVER_USER_ID,
  [string]$ApiKey = $env:BYTEROVER_PUBLIC_API_KEY
)

if (-not $UserId -or $UserId.Trim().Length -eq 0) { $UserId = 'codex-local' }

$cmd = Get-Command byterover-mcp -ErrorAction SilentlyContinue
if (-not $cmd) {
  Write-Error "byterover-mcp is not installed or not in PATH. Install with: npm i -g byterover-mcp"
  exit 1
}

$argList = @('--port', $Port, '--user-id', $UserId)
if ($ApiKey -and $ApiKey.Trim().Length -gt 0) {
  $argList += @('--byterover-public-api-key', $ApiKey)
}

Write-Host "Starting byterover-mcp for user '$UserId'..." -ForegroundColor Green
if ($ApiKey -and $ApiKey.Trim().Length -gt 0) {
  Write-Host "Using API key authentication" -ForegroundColor Green
} else {
  Write-Host "Running in local mode (no API key)" -ForegroundColor Yellow
}

# Start byterover-mcp directly for MCP stdio communication
& byterover-mcp @argList

