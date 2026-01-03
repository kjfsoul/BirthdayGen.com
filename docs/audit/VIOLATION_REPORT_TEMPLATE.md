# VIOLATION & VALIDATION REPORT

**Task ID:** <INSERT_TASK_ID> **Agent:** <INSERT_AGENT_MODEL_NAME> **Date:**
<ISO_DATE>

## 1. Compliance Checklist (The "Zero-Tolerance" Gate)

_Mark [x] only if true. If [ ], the task is NOT done._

- [ ] **Memory Retrieval:** I checked `docs/knowledge/` and `.beads` before
      writing code.
- [ ] **Zero Stubs:** I ran `grep -r "STUB" src/` (and variants) and found 0
      results.
- [ ] **Type Safety:** I ran `tsc` (or project equivalent) and it passed with 0
      errors.
- [ ] **Lint Safety:** I ran `npm run lint` and it passed with 0 errors.
- [ ] **No Hardcoding:** All dynamic data is fetched from DB/Env/Constants, not
      hardcoded strings.

## 2. Validation Steps Performed

_Prove it works. Paste the exact commands or evidence._

1. **Automated Test:**
   - Command: `npm test src/features/tarot/TarotCard.test.tsx`
   - Result: `PASS (34ms)`

2. **Manual/Browser Verification:**
   - Action: Loaded `/tarot/reading`
   - Observation: Card flipped, animation played at 60fps, no console errors.

3. **Database State (if applicable):**
   - Query: `SELECT * FROM readings WHERE id = '...'`
   - Result: Row existed with correct `user_id`.

## 3. Violation Statement

_I certify that this code introduces NO new hardcoded data, NO compilation
errors, and strictly follows the Ultrathink architecture. I understand that if
this report is found to be false, the session will be rolled back._

**Signed:** <AGENT_SIGNATURE>
