# Codex Micro-Prompts

## Diff-Only Generator
"Return a unified diff (3 lines context) for the required changes. No explanation, no surrounding prose."

## RAG Limiter (Codex)
"Use only explicitly provided snippets. Do not retrieve from external indexes. If retrieval is unavoidable: limit to 3 snippets, each ≤600 tokens, cite path:lines."

## Attachment Summary (Codex)
"Before using attachments, list each file’s purpose and key exports in ≤120 tokens total. Then proceed with only minimal necessary snippets."

## No-Rationale Suffix
"No rationale; code/diff only. Set max_tokens≤1200 and stop at ``` or a double newline."

## Test-First Patch
"First, return a failing unit-test diff exercising the change. Wait. Then return the minimal fix diff."

