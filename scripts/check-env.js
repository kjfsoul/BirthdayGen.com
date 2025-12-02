#!/usr/bin/env node

const requiredVersions = ['v20.19.5', 'v20.19.4', 'v24.11.1'];
const currentVersion = process.version;

if (!requiredVersions.includes(currentVersion)) {
  console.error(`\x1b[31m
  ============================================================
  🚨 CRITICAL ENVIRONMENT ERROR 🚨
  ============================================================

  Required Node.js version: ${requiredVersions.join(' or ')}
  Current Node.js version:  ${currentVersion}

  This project requires strict adherence to Node.js ${requiredVersions.join(' or ')}
  to ensure build stability and prevent "Jest worker" crashes.

  Please run:
  nvm use ${requiredVersions[0]}

  (If you don't have it installed: nvm install ${requiredVersions[0]})

  ============================================================
  \x1b[0m`);
  process.exit(1);
}

console.log(`\x1b[32m✅ Environment Check Passed: Node.js ${currentVersion}\x1b[0m`);
