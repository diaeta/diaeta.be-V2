# Micro-Prompts Library

## Diff-Only
"Return a unified diff (3 lines context) for the required changes. No explanation, no surrounding prose."

## RAG Limiter
"Use only explicitly provided snippets. Do not retrieve from the codebase index. If retrieval is unavoidable: top_k<=5, chunk<=500 tokens, cite file:line."

## Attachment Summary
"Before using attachments, list each file with size and intended relevance in one line per file. Then proceed using only the smallest necessary snippets."

## No-Rationale Suffix
"No rationale; code/diff only. Set max_tokens<=1200 and stop at ``` or double newline."

