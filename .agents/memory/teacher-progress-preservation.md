---
name: Teacher progress preservation
description: Why reference-data updates must preserve teachers' own records, including removed lessons.
---

For scheme-of-work reference updates, never reset, rewrite, delete, re-seed, or clean up existing teacher statuses, timestamps, or attribution. Retain progress for lessons removed from the revised scheme. Legacy mapping may fill an unmarked target lesson but must never overwrite an already marked target.

**Why:** The user states that teacher progress is the teachers' own record and the only app data that cannot be regenerated; reference rows can be regenerated. Removed-lesson statuses remain the only record of what was marked against the previous structure.

**How to apply:** Keep reference updates separate from progress storage changes. Verify preservation with read-only before/after comparisons and guard browser verification against real writes. If an update appears to require rewriting stored progress, stop and report instead.