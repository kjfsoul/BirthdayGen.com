#!/usr/bin/env node

import fs from "fs";

const today = new Date().toISOString().split("T")[0];

const f = `memory/persistent/session-${today}.json`;



const need = ["date","branch","commits_today","areas","statuses","next","compliance"];

let err = 0;



if (!fs.existsSync(f)) {

  console.error(`❌ Missing ${f}`);

  process.exit(1);

}



const raw = fs.readFileSync(f, "utf8");

let j;

try { j = JSON.parse(raw); }

catch(e){ console.error("❌ Invalid JSON:", e.message); process.exit(1); }



for (const k of need) {

  if (!(k in j)) { console.error(`❌ Missing field: ${k}`); err++; }

}

// ByteRover is not used - removed validation check

if (err) process.exit(1);

console.log("✅ session file valid");
