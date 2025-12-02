#!/usr/bin/env node

const requiredVersions = ['v20.19.5', 'v20.19.4'];
const currentVersion = process.version;

if (!requiredVersions.includes(currentVersion)) {
  console.error(`\x1b[31m
  ============================================================
  🚨 CRITICAL ENVIRONMENT ERROR 🚨
  ============================================================

  Required Node.js version: ${requiredVersion}
  Current Node.js version:  ${currentVersion}

  This project requires strict adherence to Node.js ${requiredVersion}
  to ensure build stability and prevent "Jest worker" crashes.

  Please run:
  nvm use ${requiredVersion}

  (If you don't have it installed: nvm install ${requiredVersion})

  ============================================================
  \x1b[0m`);
  process.exit(1);
}

console.log(`\x1b[32m✅ Environment Check Passed: Node.js ${currentVersion}\x1b[0m`);
