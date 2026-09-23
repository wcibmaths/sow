---
name: SharePoint link validation
description: Interpreting anonymous responses while checking school-only assessment links.
---

Do not treat an unauthenticated HTTP 403 from the school's SharePoint as proof that an assessment folder is broken or missing.

**Why:** Both an existing link and a proposed replacement returned 403 without a school session. The response reflects access control and does not distinguish a valid private folder from an invalid path.

**How to apply:** For conditional link replacements, verify while signed in with appropriate school access or rely on confirmed folder inventory. Report anonymous-only checks as inconclusive rather than silently repointing URLs.