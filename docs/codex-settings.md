# Codex Settings (Token-Efficient Defaults)

- Model: prefer `gpt-5-codex` for code tasks.
- Context: avoid full-folder context; attach minimal snippets/diffs.
- Prompt caching: keep a stable prefix; small dynamic suffix.
- Caps: set `max_tokens<=1200`; stops: "```", double newline.
- Retrieval: no broad RAG; limit to 3 snippets, each ≤600 tokens; cite path:lines.
- Attachments: summarize first (≤120 tokens), then include only needed excerpts.
- Output: request unified diffs with 3 lines context; no rationale by default.
- Logging: capture per-request usage (prompt/completion/cache).
- Modes: use medium/fast; avoid Max/1M context unless strictly required.
- Sessions: start new chats per task to limit history tokens.
