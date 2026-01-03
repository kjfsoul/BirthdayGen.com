# MEMORY PROCEDURES SOP [v2025.12]
# REQUIRED READING FOR ALL AGENTS

## THE TRIPLE-TIER CONTEXT CHECK
Before accepting a task, you must load the state of the project by checking these three sources in order:

### 1. HOT TIER (Immediate Context)
* **Source:** `memory/persistent/session-current.md` (or `_audit/active_session.md`)
* **Action:** Read the last 5 entries to know what happened *today*.
* **If Missing:** Check the file modification times (`ls -lt src/`) to infer recent activity.

### 2. WARM TIER (Active Tasks)
* **Source:** `.beads/` directory or `_audit/task_log.md`
* **Action:** Identify the **Current Sprint** and **Blocking Issues**.
* **Rule:** If a task is marked "Pending" in the docs but the code exists in `src/`, TRUST THE CODE. Update the docs.

### 3. COLD TIER (Semantic Knowledge)
* **Source:** `docs/knowledge/*.md`
* **Action:** Retrieve specific implementation details (e.g., `tarot-engine.md`, `supabase-schema.md`).
* **Rule:** Do not hallucinate API signatures. Use the signatures defined here.

## PERSISTENCE PROTOCOL
After completing your task, you must:
1.  **Update** the `Hot Tier` file with a 1-line summary of your changes.
2.  **Mark** the task complete in the `Warm Tier`.
3.  **If you learned a new pattern**, add it to the `Cold Tier`.

**YOU ARE NOW READY TO EXECUTE.**
