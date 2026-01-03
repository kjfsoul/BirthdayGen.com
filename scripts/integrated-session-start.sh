#!/bin/bash
# 1. Ensure memory directories exist
mkdir -p memory/persistent logs/compliance
# 2. Daily Session Check
TODAY=$(date +%Y-%m-%d)
SESSION_FILE="memory/persistent/session-$TODAY.json"
if [ ! -f "$SESSION_FILE" ]; then
    cp memory/persistent/session-template.json "$SESSION_FILE"
    echo "Created new session file for $TODAY"
fi
# 3. Knowledge Pull
echo "Recent Technical Updates (MEMORY_PROCEDURES.md):"
grep "##" MEMORY_PROCEDURES.md | tail -n 5
# 4. Issue Sync
bd stats || echo "No issue tracker found."