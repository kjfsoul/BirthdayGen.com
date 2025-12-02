#!/usr/bin/env bash
# Strict lint wrapper - temporarily switches to strict config

set -e

# Backup current config
cp .eslintrc.json .eslintrc.backup.json 2>/dev/null || true

# Use strict config
cp .eslintrc.strict.json .eslintrc.json

# Run lint with strict settings
pnpm exec next lint --dir src --max-warnings 0

# Restore original config
mv .eslintrc.backup.json .eslintrc.json 2>/dev/null || true
