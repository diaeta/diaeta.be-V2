MCP Servers Reference

- byterover
  - Command: `byterover-mcp`
  - Start locally: `scripts/start-byterover-mcp.ps1`
  - Config examples: `mcp/byterover/*.example.json`

- filesystem (si dispo)
  - Purpose: browse/read/write files within the workspace
  - Typical id: `filesystem`

- git (si dispo)
  - Purpose: `git status`, diffs, branches, commits
  - Typical id: `git`

- process/shell (si dispo)
  - Purpose: run local shell commands in a sandbox
  - Typical id: `process` or `shell`

- http/fetch (si dispo)
  - Purpose: fetch HTTP resources with caching
  - Typical id: `fetch`

- github (si dispo)
  - Purpose: interact with GitHub API (issues, PRs)
  - Typical id: `github`
  - Install: `npm i -g mcp-server-github`
  - Start: `scripts/start-github-mcp.ps1` (uses `GITHUB_TOKEN`)
  - Codex config example: `mcp/github/codex.example.json`

- lighthouse
  - Purpose: run Lighthouse audits for performance, accessibility, SEO, and best practices
  - Typical id: `lighthouse`
  - Install: `npm i -g lighthouse-mcp`
  - Start: `scripts/start-lighthouse-mcp.ps1`
  - Config examples: `mcp/lighthouse/*.example.json`

- playwright
  - Purpose: browser automation with Playwright framework for web interaction and visualization
  - Typical id: `playwright`
  - Install: `npm i -g @playwright/mcp`
  - Features: navigate pages, take screenshots, fill forms, extract content, run JavaScript
  - Config examples: `mcp/browser/*.example.json`

- browserbase
  - Purpose: cloud-based browser automation with multi-session management
  - Typical id: `browserbase`
  - Install: `npm i -g @browserbasehq/mcp`
  - Features: cloud browser instances, screenshot capture, form automation
  - Config examples: `mcp/browser/*.example.json`

- markdown-lint (si dispo)
  - Purpose: lint Markdown files via style rules
  - Typical id: `markdown-lint`

Host config notes

- Add these servers to your MCP host config (Cursor, Claude Desktop, etc.) alongside `byterover`.
- Keep this list in sync with actual installations on your machine and credentials (e.g., GitHub tokens).
- Environment variables: `BYTEROVER_PUBLIC_API_KEY`, `BYTEROVER_USER_ID` for Byterover.
  - For GitHub: `GITHUB_TOKEN` (do not commit secrets)
