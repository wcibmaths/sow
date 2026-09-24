---
name: Private notes rule contract
description: External Firebase rule expectation for private reminders, which is not stored in this repository.
---

Private reminder documents must use the signed-in teacher's authorized code as their document ID. Do not change them to email-address IDs without changing and publishing the corresponding Firestore rule.

**Why:** The externally published rule grants access by teacher code. Email-address document IDs produced a permissions error; the user confirmed that saving and reloading worked after switching to code IDs. Client-side owner checks are not a substitute for the rule.

**How to apply:** For reminder changes, keep the authenticated email-to-teacher-code lookup and the code-based document path aligned with the deployed rule. Verify live access with two different teachers before removing a pending privacy warning or asserting cross-account isolation.