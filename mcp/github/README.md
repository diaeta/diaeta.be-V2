GitHub MCP Server Setup

This repo does not ship a GitHub MCP server, but you can add one using a community package that exposes GitHub APIs (issues, PRs, repos) over MCP.

Installation (global)

- Prerequisites: Node.js + npm
- Install globally (example package): `npm i -g mcp-server-github`
  - If you prefer per-run: `npx mcp-server-github --help` (not required here)

Token and environment

- Set `GITHUB_TOKEN` in your environment with appropriate scopes (repo, read:org if needed).
- Never commit tokens. Use env vars or a local, gitignored `.env` loaded by your host.

Run locally

- Command (typical): `mcp-server-github --port 5181`
- Or use the helper script: `scripts/start-github-mcp.ps1`
- The server reads `GITHUB_TOKEN` from the environment.

Codex host config

- See `mcp/github/codex.example.json` for an example host entry.
- Add it to your Codex MCP host configuration file and adjust the port if changed.

Notes

- Replace the package name/flags if you use a different GitHub MCP server implementation.
- Ensure your firewall allows the chosen localhost port.

