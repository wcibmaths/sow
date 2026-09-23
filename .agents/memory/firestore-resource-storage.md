---
name: Firestore resource storage permissions
description: Why shared lesson resources live alongside progress rather than in a separate Firestore document.
---

Store shared lesson resources in a distinct field of the existing permitted progress document, and preserve that field during progress resets.

**Why:** On 23 September 2026, the live Firestore rules permitted reading the existing progress document but rejected a new resources document with “Missing or insufficient permissions.” A separate document would leave the link feature unusable without a rules deployment.

**How to apply:** If adding more fields to this document, keep reset operations scoped to progress or preserve unrelated fields transactionally. Never silently replace Firestore persistence with local-only link storage. Authenticated writes to the new nested resource field have not been verified; show write failures explicitly.