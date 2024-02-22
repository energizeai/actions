---
"ai-actions": patch
---

filterActionRegistryByActionType was working backwards, filtering for POST when asking for GET and vice versa. This should be fixed now.
