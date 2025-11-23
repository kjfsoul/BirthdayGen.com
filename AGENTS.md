AGENTS.md — BirthdayGen Operating Doctrine

(Unified Memory + Compliance + Beads Discipline System)

🔱 0. Purpose

This document defines exactly how every agent must behave, including:

Memory usage

Session discipline

Beads issue workflow

Compliance requirements

Task selection

Context recovery

Communication style + decision-making rules

This file overrides all others for operational behavior.

Agents must treat this file as LAW.

🔱 1. Mandatory Session Startup

At the beginning of every session:

1.1 Load Triple System Discipline

Read:

MEMORY_PROCEDURES.md

TRIPLE_SYSTEM_SUMMARY.md

BEADS_INTEGRATION.md

1.2 Run the integrated startup script
./scripts/integrated-session-start.sh


This performs:

Memory system initialization

Compliance proof validation

Beads-ready-work check

1.3 Select work ONLY from Beads
bd ready --json


You MUST NOT begin work in any other way.

🔱 2. Beads Is Source of Truth (Primary Work Memory)

Beads governs all tasks.
Agents must obey these rules at all times:

2.1 Selecting work

Only work on ready issues

Never start a blocked issue

Never pick issues outside Beads

2.2 Starting work
bd update <id> --status in_progress --json
bd show <id> --json

2.3 Discovered issues
NEW=$(bd create "Bug: <desc>" -t bug -p 0 --json)
bd dep add $NEW <current-id> --type discovered-from

2.4 Completing work
bd close <id> --reason "<what was done + verification>" --json
bd ready --json

2.5 Context recovery

If context is lost or forgotten:

./scripts/recover-context.sh
bd list --status in_progress --json

🔱 3. Memory Discipline (From MEMORY_PROCEDURES.md)

Agents must:

Use memory/persistent/session-YYYY-MM-DD.json

Update accomplishments

Track current tasks

Maintain today’s session file

Never store tasks in context

Never rely on LLM memory over Beads

Hierarchy of memory access (strict)

Beads (tasks/issues + amnesia-proof)

Session files (daily state)

Project-state.json (high-level system memory)

Supabase (runtime persistent user data)

ByteRover is forbidden.

🔱 4. Compliance Discipline

Agents must enforce:

Protocol adherence

Proof generation

Proof presence in commits

Required commands:
npm run proof
npm run compliance:check


No commit is valid without:

COMPLIANCE_PROOF: <sha256>

🔱 5. Triple System Command Model

The three systems are unified:

Memory → Compliance → Beads → Git

Rules:

Memory stores state

Compliance verifies memory

Beads stores tasks/issues

Git persists all three

Session startup binds them together

Agents must keep all three aligned.

🔱 6. Decision-Making Rules

When choosing how to act:

Beads dictates WHAT to do

Memory dictates WHERE you are in the system

Compliance dictates WHETHER you may proceed

AGENTS.md dictates HOW you work

If in conflict:

AGENTS.md overrides → Beads → Memory → Compliance

🔱 7. Task Execution Principles

Agents must:

Work on ONE issue at a time

Keep descriptions explicit and actionable

Never hide work in conversations

Always file new issues for discoveries

Use semantic reasoning, not superficial cues

Maintain BirthdayGen quality bars

Prioritize system integrity over speed

🔱 8. BirthdayGen-Specific Requirements
8.1 Card Generator Principles

Templates must follow schema rules (no “pink = template”)

No hard-coded aesthetic behavior

JSON-based template definitions

Semantic fields over colors

Must respect tasks:

Template schema (tmpl-schema)

Library (tmpl-library)

QA guardrails (tmpl-qa)

8.2 UX Requirements

Smooth 60fps canvas

Mobile-first parity

Consistent rendering

Fully integrated send/auto-populate flow

8.3 Automation Requirements

n8n integration

Scheduled send workflows

Contacts + personalization pipelines

8.4 Build and Deployment Requirements

CRITICAL: Follow MEMORY_PROCEDURES.md Section 13 (Build Stability Protocol)

Node 20.19.5 (verify with node -v)

Next.js 14.2.15 (NOT Next.js 15.x)

React 18.x (NOT React 19)

swcMinify: false in next.config.mjs

Hard reset on build errors: rm -rf .next node_modules pnpm-lock.yaml

Database migrations:

Follow MEMORY_PROCEDURES.md Section 14 (Supabase Migration Errors)

Use DROP TABLE IF EXISTS in reverse dependency order

Test migrations locally before production

Backup data before destructive migrations

🔱 9. Communication Standards for Agents

Agents must:

Include issue ID when referencing work

Summarize reasoning

Provide step-by-step execution

Keep explanations concise and tactical

Use technical precision

Agents must NOT:

Guess

Skip Beads

Store tasks in context

Change system architecture

🔱 10. Single-Source Commands Summary
Select work:
bd ready --json

Start work:
bd update <id> --status in_progress --json

Discover issue:
bd create "Bug: ..." -t bug -p 0 --json

Close work:
bd close <id> --reason "..." --json

Session recovery:
./scripts/recover-context.sh
