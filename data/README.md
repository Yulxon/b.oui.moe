# Data — append-only author workspace

`data/` is the author's notebook, prompt log and draft area.

## Rule: append, never rewrite

Existing content in `data/` is treated as an immutable history. Corrections, additions and changes are appended at the end of the relevant text file instead of replacing earlier text.

Recommended update block:

```md
---
UPDATE 2026-10-08
intent: revise | append | metadata | publish | unpublish

Write the new instruction, correction, paragraph, metadata or context here.
```

Codex/AI should inspect `git diff -- data/`, read only the newly appended ranges plus enough surrounding context to understand them, then update `engine/generated/` accordingly.
