# AGENTS Guide (Slim)

- Keep context minimal and explicit. Prefer unified diffs and small code snippets over full files or broad RAG.
- For Byterover workflows, follow the slim rule in `.cursor/rules/byterover-rules.mdc` (scoped; not always attached).
- Use short, task‑scoped instructions. Avoid global “always apply” prompts.
- When editing MCP configs or `BYTEROVER.md`, use onboarding/planning sequences succinctly and persist plan progress.
- Reference long playbooks from `docs/` and `rules/extracted/` instead of inlining them here.

Pointers

- Token optimization: see `docs/LLM Token Optimization Report.md`.
- Byterover handbook: `BYTEROVER.md`.
- Brand/content guides: `rules/_attachments` and `rules/extracted`.

Output discipline

- No chain‑of‑thought; return code or diffs.
- Set `max_tokens` and stop sequences for API calls; use stable cached prefixes.

Scope

- This file is intentionally brief (<800 tokens) to reduce persistent context load.

[byterover-mcp]

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase
