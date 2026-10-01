---
name: Progress activity attribution
description: Why historical lesson timestamps must stay separate from teacher-specific progress activity.
---

Do not attribute a new edit to the teacher assigned to a class merely because that class's lesson timestamp changed. Assigned teacher and actual editor can differ. Historical lesson times do not identify their editors; co-teacher histories cannot be reconstructed reliably.

**Why:** Using the latest mutable lesson timestamp as a historical fallback falsely credits the assigned teacher when somebody else edits their class. Freezing a historical baseline separates earlier inferred single-teacher history from new actor-attributed events. A client-only baseline check is insufficient: a stale browser can overwrite the frozen baseline on the shared document.

**How to apply:** When extending progress activity tracking, retain explicit editor attribution for new events. Establish any legacy baseline from the current shared document inside the same transaction as the progress write, preserve it thereafter, and leave unattributable historical co-teacher events unknown. Failed or unchanged progress writes must not become successful activity history.