# Memory Procedures Guide

**Last Updated:** 2025-11-04
**Purpose:** Complete guide to memory/knowledge storage and retrieval procedures

---

## Overview

The BirthdayGen.com project uses a multi-layered memory system for knowledge persistence, session management, and agent coordination. The primary memory system is **Beads** (`.beads`), which solves the agent amnesia problem by storing all tasks, issues, and discoveries outside of context windows.

---

## 1. Beads Memory System (Primary - Task & Issue Memory)

### 1.1 Overview

**Beads** is the primary memory system for the project. It stores:
- All tasks and issues (Git-tracked in `.beads/issues.jsonl`)
- Discovered problems and bugs
- Dependencies between work items
- Project context and status

**Why Beads:**
- ✅ Solves agent amnesia - issues persist across sessions
- ✅ Git-backed - syncs across machines
- ✅ Outside context window - doesn't consume token space
- ✅ Full audit trail - every change logged

---

### 1.2 Mandatory Session Startup Procedures

**Before ANY work, you MUST:**

```bash
# 1. Check available work
bd ready --json

# 2. Review project health
bd stats

# 3. Check blocked issues
bd blocked --json
```

**Full session startup script:**
```bash
./scripts/integrated-session-start.sh
```

---

### 1.3 Starting Work Procedures

**When beginning ANY task:**

1. **If work comes from Beads:**
   ```bash
   # Update status to in_progress
   bd update <id> --status in_progress --json

   # Get full context
   bd show <id> --json
   ```

2. **If work is NEW:**
   ```bash
   # Create issue first
   bd create "Task title" -d "Description" -p 1 -t task --json

   # Then update status
   bd update <id> --status in_progress --json
   ```

---

### 1.4 During Work Procedures

**File issues for discovered problems immediately:**

```bash
# Create issue for discovered bug/problem
bd create "Bug: <description>" -t bug -p 0 --json

# Link to current work
bd dep add <new-id> <parent-id> --type discovered-from

# Add labels for organization
bd label add <id> backend,urgent
```

**Link related work:**
```bash
bd dep add <dep-id> <related-id> --type related
```

---

### 1.5 Completing Work Procedures

**When finishing ANY task:**

```bash
# Close with detailed reason
bd close <id> --reason "Implemented feature X with tests. Verified with npm test. Resolves <id>." --json

# Check for newly unblocked work
bd ready --json
```

---

### 1.6 Memory Recovery Procedures

**When context is lost or forgotten:**

```bash
# Run recovery script
./scripts/recover-context.sh

# OR manually query Beads
bd list --status in_progress --json
bd show <id> --json
```

**Natural language triggers:**
- "I forgot what I was doing"
- "Recover memory"
- "What was I working on?"
- "read recover.md"

---

## 2. Session Memory Procedures

### 2.1 Session Files

**Location:** `memory/persistent/session-YYYY-MM-DD.json`

**Purpose:** Daily session state, accomplishments, context

**Structure:**
```json
{
  "date": "2025-11-04",
  "accomplishments": [],
  "current_work": [],
  "context": {}
}
```

**Procedures:**

1. **Session Start:**
   - Check if session file exists for today
   - Create from template if missing
   - Validate session integrity

2. **During Session:**
   - Update accomplishments as work completes
   - Track current work items
   - Maintain context state

3. **Session End:**
   - Finalize session file
   - Update project state if needed

---

### 2.2 Project State Memory

**Location:** `memory/persistent/project-state.json`

**Purpose:** Overall project state, component status, critical issues

**Procedures:**

- Updated when major milestones reached
- Tracks component completion percentages
- Records critical issues and resolutions

---

## 3. Runtime Memory Provider Order (Strict)

**From `src/lib/mem/createMemoryFabric.ts`:**

1. **LocalJson** (PRIMARY - always first)
   - Local file-based storage (`memory/*.json`)
   - Always enabled
   - Stores session state, component memory

2. **Supabase** (SECONDARY)
   - Database-backed storage
   - Enabled if `supabaseUrl` and `supabaseKey` configured
   - Used for runtime data persistence

**Retrieval Order:** Try providers in order, return first match
**Storage:** Store to all enabled providers (best effort)

**Note:** ByteRover is NOT used. Beads (`.beads`) is the primary memory system for tasks and issues.

---

## 4. Memory Directory Structure

```
.beads/                            # PRIMARY MEMORY SYSTEM
├── issues.jsonl                   # Git-tracked issue database
├── beads.db                       # Local SQLite cache (gitignored)
├── config.yaml                    # Beads configuration
└── .gitignore                     # Database files excluded

memory/
├── persistent/
│   ├── project-state.json        # Overall project state
│   ├── session-YYYY-MM-DD.json  # Daily session files
│   └── decisions.md              # Key decisions
├── agents/
│   └── [agent-specific]/         # Agent memory (isolated)
├── sessions/
│   └── [session-specific]/      # Session memory
└── component/
    ├── tarot-memory.json         # Component-specific
    ├── astrology-memory.json
    └── agent-memory.json
```

---

## 5. Memory Health Check

**Command:** `scripts/memory-health-check.sh` or `bd stats`

**Checks:**
- Beads database status (`bd stats`)
- Local JSON files existence
- Supabase environment variables (if configured)
- Session file integrity

**Run:**
```bash
# Check Beads health
bd stats

# Check session memory
node scripts/memory/validate-session.mjs memory/persistent/session-$(date +%Y-%m-%d).json
```

---

## 6. Memory Best Practices

### 6.1 Beads Usage (Primary Memory)

- ✅ **Always query Beads** at session start (`bd ready --json`)
- ✅ **File issues immediately** when problems discovered
- ✅ **Update status** when starting/stopping work
- ✅ **Close with detailed reasons** (becomes future context)
- ✅ **Link related work** with dependencies
- ✅ **Use `--json` flag** for all programmatic access
- ❌ Don't rely on conversation context for important info
- ❌ Don't skip Beads workflow
- ❌ Don't store plans in context - use Beads

### 6.2 Session Memory

- ✅ Check/create session file at session start
- ✅ Update accomplishments as work completes
- ✅ Track current work items
- ✅ Validate session integrity regularly
- ❌ Don't skip session file creation
- ❌ Don't let sessions grow unbounded

### 6.3 Runtime Memory (LocalJson/Supabase)

- ✅ Store component-specific knowledge
- ✅ Maintain project state updates
- ✅ Clean up old sessions periodically
- ❌ Don't store what belongs in Beads (tasks/issues)
- ❌ Don't duplicate information

---

## 7. Memory Tools Available

### Beads (Primary Memory System)

1. **`bd` command** - Beads issue tracker
   - **Purpose:** Task and issue memory (solves amnesia)
   - **Storage:** `.beads/issues.jsonl` (Git-tracked)
   - **When:** Always - at session start, during work, completing work
   - **Commands:**
     - `bd ready --json` - Get available work
     - `bd create "Title" -d "Desc" --json` - Create issue
     - `bd show <id> --json` - Get full context
     - `bd update <id> --status in_progress --json` - Update status
     - `bd close <id> --reason "..." --json` - Close with reason
     - `bd dep add <id1> <id2> --type blocks` - Link dependencies
     - `bd stats` - Project health

### Local Memory Tools

1. **Session Files** (`memory/persistent/session-*.json`)
   - Daily session state
   - Accomplishments tracking
   - Context preservation

2. **Project State** (`memory/persistent/project-state.json`)
   - Component status
   - Critical issues
   - Project milestones

3. **Component Memory** (`memory/component/*.json`)
   - Component-specific knowledge
   - Tarot, Astrology, Agent system memory

---

## 8. Critical Rules

### Mandatory Beads Usage

1. **Session Start:** MUST query `bd ready --json`
2. **Starting Work:** MUST update status to `in_progress`
3. **During Work:** MUST file issues for discovered problems
4. **Completing Work:** MUST close with detailed reason
5. **Always Use `--json`:** Required for programmatic access

### Memory Provider Order (Runtime)

1. **LocalJson** - Always first (primary for runtime data)
2. **Supabase** - Secondary (if configured)

**Note:** Beads (`.beads`) is separate and primary for task/issue memory.

### Session Memory

1. **Session Start:** Check/create session file
2. **During Session:** Update accomplishments
3. **Session End:** Finalize session state

---

## 9. Troubleshooting

### Beads Not Working

1. **"bd: command not found"**
   ```bash
   # Check if bd is in PATH
   which bd
   # Add to PATH if missing
   export PATH="$PATH:$HOME/go/bin"
   ```

2. **"no beads database found"**
   ```bash
   bd init
   ```

3. **Issues not syncing**
   - Verify `.beads/issues.jsonl` is committed to git
   - Check `.beads/.gitignore` excludes `*.db` files
   - Pull latest: `git pull`

### Session File Issues

1. Validate session file exists
2. Check file integrity
3. Create from template if missing
4. Run session validation script: `node scripts/memory/validate-session.mjs <file>`

### Context Loss / Amnesia

1. **Run recovery:**
   ```bash
   ./scripts/recover-context.sh
   ```

2. **Query Beads for current work:**
   ```bash
   bd list --status in_progress --json
   bd show <id> --json
   ```

3. **Read protocol files:**
   - `.cursor/rules/beads-workflow.mdc`
   - `docs/BEADS_INTEGRATION.md`
   - `docs/CONTEXT_MEMORY_MANAGEMENT.md`

---

## 10. Examples

### Starting Work (Beads)

```bash
# 1. Get ready work
READY=$(bd ready --json | jq -r '.[0]')
ISSUE_ID=$(echo $READY | jq -r '.id')

# 2. Update status
bd update $ISSUE_ID --status in_progress --json

# 3. Get full context
bd show $ISSUE_ID --json | jq
```

### Discovering Bug During Work

```bash
# Create issue immediately
BUG_ID=$(bd create "Auth endpoint returns 500 on invalid token" -t bug -p 0 --json | jq -r '.id')

# Link to current work
CURRENT_ID="bd-42"
bd dep add $BUG_ID $CURRENT_ID --type discovered-from

# Add labels
bd label add $BUG_ID auth,backend,urgent
```

### Completing Work

```bash
# Close with detailed reason
bd close bd-42 --reason "Fixed auth endpoint validation. Added tests in auth.test.ts. Verified with npm test. All tests passing. Resolves bd-42." --json

# Check for newly unblocked work
bd ready --json
```

### Recovering Context

```bash
# Run recovery script
./scripts/recover-context.sh

# OR manually
bd list --status in_progress --json
bd show <id> --json
```

---

## 11. Reference Files

- **Beads Integration:** `docs/BEADS_INTEGRATION.md`
- **Beads Workflow:** `.cursor/rules/beads-workflow.mdc`
- **Context Management:** `docs/CONTEXT_MEMORY_MANAGEMENT.md`
- **Recovery Guide:** `recover.md`
- **Session Startup:** `startup.md`
- **Memory Architecture:** `analysis/memory-architecture-design.md`
- **Memory Strategy:** `analysis/memory-strategy-comprehensive.md`
- **Memory Audit:** `docs/reports/audits/MEMORY_SYSTEM_AUDIT_REPORT.md`

---

## 12. Key Insight

**Beads IS your memory system.**

- ✅ Don't rely on conversation context - query Beads
- ✅ File issues immediately when discovered
- ✅ Reference issue IDs in conversation
- ✅ Close issues with detailed reasons (becomes future context)

**Result:** Agent never truly "forgets" because everything important is in Beads (`.beads/issues.jsonl`), which persists across sessions and context limits.

---

## 13. Build Stability Protocol

### 13.1 The Recurring Build Error

**Error:** `TypeError: Cannot read properties of null (reading 'hash')` with Jest worker crashes

**Root Cause:**
- Next.js 15.x + SWC minifier + React 19 = unstable on Node 20/24
- Next.js 14.2.15 + SWC minifier on Node 24 = unstable
- SWC binary crashes in webpack's chunk hashing phase
- Multiple agents toggling config creates environment inconsistency
- Cache state mismatches between `.next` and `node_modules`

**Why It Keeps Coming Back:**
Different agents run builds in different shell sessions with:
- Different Node versions (Node 20 vs 24)
- Different Next.js versions (14 vs 15)
- Different React versions (18 vs 19)
- Different `NODE_OPTIONS` values (4GB vs 8GB)
- Stale or mismatched `node_modules`
- Conflicting config toggles (`swcMinify` on/off, lint enabled/disabled)

### 13.2 Permanent Fix (Execute Once)

**Step 1: Lock Node Version**
```bash
nvm use 20.19.5
node -v  # MUST show v20.19.5
```

**Step 2: Hard Reset**
```bash
rm -rf .next node_modules pnpm-lock.yaml
pnpm install
pnpm rebuild
```

**Step 3: Lock Next.js and React Versions**
```bash
# Use Next.js 14.2.15 (stable) - NOT Next.js 15.x
pnpm add next@14.2.15 eslint-config-next@14.2.15

# Use React 18 (Next.js 14 requirement)
pnpm add react@^18.2.0 react-dom@^18.2.0 @types/react@^18 @types/react-dom@^18

# Downgrade React Three Fiber/Drei to React 18 compatible versions
pnpm add @react-three/fiber@^8.0.0 @react-three/drei@^9.0.0
```

**Step 4: Set Build Script (DO NOT MODIFY)**
In `package.json`:
```json
"scripts": {
  "build": "NODE_OPTIONS='--max-old-space-size=6144' next build"
}
```
Note: 6GB is sufficient. 8GB masks issues.

**Step 5: Lock Next.js Config (DO NOT MODIFY)**
In `next.config.mjs`:
```javascript
const nextConfig = {
  swcMinify: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};
export default nextConfig;
```

**Step 6: Verify Stability**
```bash
pnpm run build
pnpm run build  # Run twice to confirm
```

### 13.3 Critical Rules

**NEVER:**
- ❌ Use Next.js 15.x (unstable with current setup)
- ❌ Use React 19 (incompatible with Next.js 14)
- ❌ Toggle `swcMinify` on/off
- ❌ Change `NODE_OPTIONS` memory value
- ❌ Switch Node versions mid-session
- ❌ Modify build script without full reset
- ❌ Re-enable lint/typecheck until Next.js upgraded

**ALWAYS:**
- ✅ Use Node 20.19.5 (verify with `node -v`)
- ✅ Use Next.js 14.2.15 (stable version)
- ✅ Use React 18.x (not React 19)
- ✅ Keep `swcMinify: false`
- ✅ Use `NODE_OPTIONS='--max-old-space-size=6144'`
- ✅ Clear both `.next` AND `node_modules` when debugging
- ✅ Run `pnpm rebuild` after `pnpm install`

### 13.4 Known Error Patterns

**Pattern 1: Next.js 15 Type Generation Bug**
```
Type error: Cannot find module '../../app/auth/auth-code-error/page.js'
or its corresponding type declarations.
```
**Cause:** Next.js 15 generates type files with `.js` imports for `.tsx` files
**Solution:** Downgrade to Next.js 14.2.15

**Pattern 2: Webpack Hash Crash**
```
TypeError: Cannot read properties of null (reading 'hash')
Next.js build worker exited with code: 1 and signal: null
```
**Cause:** Next.js 15 + React 19 incompatibility, or SWC minifier issues
**Solution:** Downgrade to Next.js 14.2.15 + React 18 + `swcMinify: false`

**Pattern 3: Enum Import Errors**
```
'GiftCategory' cannot be used as a value because it was imported using 'import type'.
```
**Cause:** TypeScript enums imported with `import type` instead of value import
**Solution:** Split imports - use `import { Enum }` for enums, `import type { Interface }` for types

### 13.5 Long-Term Fixes

1. **Wait for Next.js 15 stability** - Monitor Next.js 15.x releases for webpack fixes
2. **Upgrade when stable** - Test Next.js 15 + React 19 in isolated branch first
3. **Re-enable lint/typecheck** after stable on Next 15+
4. **Address `request.url` static error** (unrelated to hash crash)

### 13.6 Agent Coordination

**When multiple agents work on builds:**
- First agent to touch build config MUST document in Beads
- All agents MUST verify Node version before any build work
- All agents MUST verify Next.js version (`next@14.2.15`)
- No config changes without creating Beads issue first
- Link all build-related issues with `discovered-from` dependency

**Recovery Command:**
```bash
./scripts/recover-context.sh
bd list --status in_progress --json
```

---

## 14. Supabase Migration Errors

### 14.1 Foreign Key Type Mismatch

**Error:**
```
ERROR: 42804: foreign key constraint "enriched_data_contact_id_fkey" cannot be implemented
DETAIL: Key columns "contact_id" and "id" are of incompatible types: uuid and integer.
```

**Root Cause:**
- Existing table in Supabase has `id` as `integer` from previous migration
- New migration defines `id` as `UUID`
- Foreign key constraint fails due to type mismatch

**Solution:**
Add `DROP TABLE IF EXISTS` statements at the beginning of migration in **reverse dependency order**:

```sql
-- Drop in reverse dependency order to avoid constraint violations
DROP TABLE IF EXISTS gift_ideas CASCADE;
DROP TABLE IF EXISTS enriched_data CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

-- Then create tables with correct types
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ...
);
```

**Critical Rules:**
- ✅ Always drop dependent tables first (reverse order)
- ✅ Use `CASCADE` to drop dependent objects
- ✅ Use `IF NOT EXISTS` for idempotency
- ⚠️ This deletes existing data - backup before running in production

### 14.2 Migration Best Practices

**For Development:**
- Use `DROP TABLE IF EXISTS ... CASCADE` for clean slate
- Test migrations locally before applying to production

**For Production:**
- Create data migration scripts to preserve existing data
- Use `ALTER TABLE` instead of `DROP/CREATE` when possible
- Backup database before running migrations
- Test migrations on staging environment first

---

**Document Created:** 2025-11-04
**Maintained By:** AI Agents
**Last Validated:** 2025-11-22
**Primary Memory System:** Beads (`.beads`)

