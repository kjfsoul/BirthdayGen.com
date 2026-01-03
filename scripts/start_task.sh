#!/bin/bash
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== 🎂 BIRTHDAYGEN: MISSION CONTROL ===${NC}"

# 1. Check for Beads
if ! command -v bd &> /dev/null; then
    echo -e "${RED}❌ Error: 'bd' command not found.${NC}"
    exit 1
fi

# 2. Show Ready Work
echo -e "\n${YELLOW}--- READY WORK ---${NC}"
bd ready --json | jq -r '.[] | "[\(.id)] \(.title) (P\(.priority))"'

# 3. INTERACTIVE PROMPT
echo -e "\n${GREEN}Select your focus:${NC}"
read -p ">> Enter Task ID: " TASK_ID

if [ -z "$TASK_ID" ]; then echo "Exiting."; exit 0; fi

# 4. EXECUTE
echo -e "\n${BLUE}>> Activating Task: $TASK_ID...${NC}"
bd update "$TASK_ID" --status in_progress --json > /dev/null
echo "✅ Beads status updated"

# 5. LOGGING
if [ ! -f docs/PENDING_CHANGES.md ]; then
    echo "# Pending Changes Log" > docs/PENDING_CHANGES.md
    echo "- [ ] Task $TASK_ID started..." >> docs/PENDING_CHANGES.md
fi

# 6. MEMORY UPDATE
TODAY=$(date +%Y-%m-%d)
SESSION_FILE="memory/persistent/session-$TODAY.json"
if [ ! -f "$SESSION_FILE" ]; then 
    echo "{ \"date\": \"$TODAY\", \"current_work\": [] }" > "$SESSION_FILE"
fi
jq --arg id "$TASK_ID" '.current_work = [$id]' "$SESSION_FILE" > "${SESSION_FILE}.tmp" && mv "${SESSION_FILE}.tmp" "$SESSION_FILE"
echo "✅ Session memory updated"

# 7. CONTEXT
echo -e "\n${YELLOW}--- MISSION BRIEF ---${NC}"
bd show "$TASK_ID" --json | jq -r '"TITLE: \(.title)\n\nDESCRIPTION:\n\(.description)"'
echo -e "\n${BLUE}=== 🚀 AGENT ACTIVATED ===${NC}"
