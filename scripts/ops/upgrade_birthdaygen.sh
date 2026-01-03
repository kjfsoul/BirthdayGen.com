#!/bin/bash
set -e
echo ">> [UPGRADE] executing Migration Strategy..."

# A. Consolidate "Rotting JSON" (Archive Legacy)
if [ -d "memory/component_memory" ]; then
    echo "   -> Archiving legacy component memory..."
    mv memory/component_memory/* memory/archive/ 2>/dev/null || true
    rmdir memory/component_memory 2>/dev/null || true
fi

# B. Deprecate Root-Level Timestamp Logs
# Moves 2025XXXX__*.md to docs/logs/
echo "   -> Cleaning root directory..."
find . -maxdepth 1 -name "2025*__*.md" -exec mv {} docs/logs/ \;
echo "   -> Moved daily logs to docs/logs/"

# C. Protocol Split (Context Awareness)
# 1. Rename old heavy protocol to EXTENDED
if [ -f "AGENT_PROTOCOL.md" ]; then
    mv AGENT_PROTOCOL.md EXTENDED_PROTOCOL.md
    echo "   -> Renamed AGENT_PROTOCOL to EXTENDED_PROTOCOL."
fi

# 2. Create lightweight CORE_PROTOCOL
cat > CORE_PROTOCOL.md << 'PROTOCOL'
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
PROTOCOL

echo ">> [UPGRADE] Migration Complete."
