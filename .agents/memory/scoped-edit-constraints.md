---
name: Scoped edit constraints
description: Repeated scope restrictions for focused UI and assessment-folder-link changes.
---

For scoped UI and assessment-folder-link fixes, make only the requested edits to index.html. Do not refactor or change the SoW arrays, Firebase, or the auth gate.

**Why:** The user repeatedly specified these restrictions when requesting focused Dashboard, Assessment Schedule, and folder-link edits.

**How to apply:** Keep these fixes separate from data, authentication, storage, and unrelated cleanup changes.