# BirthdayGen Beads Playbook

## Session Start (REQUIRED)

Before doing ANY work on BirthdayGen.com:

1. Check ready issues:
   ```bash
   bd ready --json
Review project health:

2. bd stats


3. Check blocked issues:

bd blocked --json


Pick work ONLY from ready issues. Never start a blocked issue.

Working on an Issue

1. Mark the issue in progress:

bd update <ISSUE_ID> --status in_progress --json


2. Get full context:

bd show <ISSUE_ID> --json


3. If you discover new problems, file them:

NEW_ISSUE=$(bd create "Bug: <short description>" -t bug -p 0 --json)
# Optionally link to the current work:
bd dep add "$NEW_ISSUE" <CURRENT_ISSUE_ID> --type discovered-from

Completing Work

1. Close the issue with a reason:

bd close <ISSUE_ID> --reason "What changed + how you verified it" --json


2. Check for newly unblocked work:

bd ready --json
Optional: Using tasklist.md

BirthdayGen supports an OPTIONAL tasklist pipeline:

Generate a task list from goals/features:

./scripts/analyze-project-goals.sh


This creates tasklist.md with unchecked tasks.

Show tasks for human review:

./scripts/verify-tasks.sh tasklist.md


After approval, convert tasks to Beads issues:

./scripts/tasklist-to-beads.sh tasklist.md


Existing Beads issues are NOT duplicated — the script skips items that already exist.


That file alone makes the system “obvious” to any agent or collaborator.

---

## 4. Concrete “code to run” that follows Beads rules

Here’s a safe sequence you (or agents) can run right now without touching structure or risking corruption:

```bash
# 1. Backup current Beads issues (safety first)
cp .beads/issues.jsonl .beads/issues-backup-$(date +%Y%m%d-%H%M%S).jsonl

# 2. Check project health
bd stats

# 3. See what work is ready
bd ready --json

# 4. List all high-priority open work (P0/P1)
bd list --status open --json | jq '[.[] | select(.priority <= 1)]'


If you do want to start using tasklist.md for future regeneration (not required, just nice), you can run:

# Generate tasklist from your goals/features docs
./scripts/analyze-project-goals.sh

# Review (human eyes) before committing to new issues
./scripts/verify-tasks.sh tasklist.md


Then only when you’re happy with it:

./scripts/tasklist-to-beads.sh tasklist.md
bd list --json | jq 'length'   # sanity check
