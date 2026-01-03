/**
 * scripts/memory/session-auto.ts
 * Automates the "Hot Memory" logging to reduce agent friction.
 */
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

function getGitSummary() {
    try {
        return execSync('git diff --stat HEAD').toString().trim();
    } catch {
        return "No git changes detected.";
    }
}

function main() {
    const today = new Date().toISOString().split('T')[0];
    const sessionFile = `memory/persistent/session-${today}.json`;
    
    console.log(`>> [AUTO-LOGGER] Updating ${sessionFile}...`);
    
    // 1. Gather Context
    const gitStats = getGitSummary();
    const timestamp = new Date().toISOString();
    
    // 2. Load or Create Session JSON
    let sessionData = { log: [] };
    if (fs.existsSync(sessionFile)) {
        sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
    }

    // 3. Append Auto-Log
    const entry = {
        timestamp,
        type: "AUTO_SUMMARY",
        git_stats: gitStats,
        note: "Session context automatically captured via script."
    };
    
    // @ts-ignore - Simple JSON structure
    sessionData.log.push(entry);

    // 4. Write
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
    console.log("   -> Session Log Updated Successfully.");
}

main();
