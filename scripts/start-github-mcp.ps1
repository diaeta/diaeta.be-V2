param(
  [int]$Port = 5181
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command mcp-server-github -ErrorAction SilentlyContinue)) {
  Write-Host "Installing GitHub MCP server globally (npm i -g mcp-server-github)..." -ForegroundColor Yellow
  npm i -g mcp-server-github | Out-Null
}

if (-not $env:GITHUB_TOKEN -or [string]::IsNullOrWhiteSpace($env:GITHUB_TOKEN)) {
  Write-Error "GITHUB_TOKEN is not set. Please set it in your environment before starting the server."
  exit 1
}

Write-Host "Starting GitHub MCP server on port $Port" -ForegroundColor Cyan
& mcp-server-github --port $Port

