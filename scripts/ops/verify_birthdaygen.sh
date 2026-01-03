#!/bin/bash
# VERIFICATION SCRIPT
# Enforces the Hybrid Automated System Status.

VIOLATIONS=0
echo ">> [VERIFY] Scanning BirthdayGen System..."

# A. Protocol Split Check
if [ ! -f "CORE_PROTOCOL.md" ]; then
    echo "   [FAIL] CORE_PROTOCOL.md missing (Protocol Split failed)."
    ((VIOLATIONS++))
fi

if [ -f "AGENT_PROTOCOL.md" ]; then
    echo "   [FAIL] AGENT_PROTOCOL.md still exists (Should be renamed to EXTENDED)."
    ((VIOLATIONS++))
fi

# B. Log Hygiene Check
# Check if root has any 2025*__*.md files (should be moved)
ROOT_LOGS=$(find . -maxdepth 1 -name "2025*__*.md" | wc -l)
if [ "$ROOT_LOGS" -gt 0 ]; then
    echo "   [FAIL] Found $ROOT_LOGS unarchived log files in root."
    ((VIOLATIONS++))
fi

# C. Automation Script Check
if [ ! -f "scripts/memory/session-auto.ts" ]; then
    echo "   [FAIL] session-auto.ts missing."
    ((VIOLATIONS++))
fi

# D. Strict Code Check (If package.json exists)
if [ -f "package.json" ]; then
    echo "   -> Running Type Check..."
    if ! npx tsc --noEmit --skipLibCheck; then
        echo "   [FAIL] TypeScript errors detected."
        ((VIOLATIONS++))
    fi
fi

# SUMMARY
if [ "$VIOLATIONS" -eq 0 ]; then
    echo ">> [SUCCESS] BIRTHDAYGEN OPTIMIZED."
    exit 0
else
    echo ">> [FAILURE] $VIOLATIONS VIOLATIONS REMAIN."
    exit 1
fi
