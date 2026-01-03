# CORE PROTOCOL (Mandatory)
**Status:** ACTIVE | **Overhead:** LOW

## 1. The Golden Rule
* **Read-First:** Agents must check `docs/knowledge` and `.beads` before coding.
* **Write-Last:** Run `npx tsx scripts/memory/session-auto.ts` before exiting.

## 2. Strictly Ordered Retrieval Protocol (SORP)
1. **Tier 1 (Tasks):** `bd ready --json` (What am I doing?)
2. **Tier 2 (Context):** `grep -r "Concept" docs/knowledge/` (How does it work?)
3. **Tier 3 (History):** `find docs/logs/ -name "*YYYYMMDD*"` (What happened recently?)

## 3. Operations
* **No Manual JSON:** Use the auto-logger script.
* **No Root Logs:** Create documentation in `docs/logs/` or `docs/knowledge/`.
