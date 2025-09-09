#!/usr/bin/env bash
# extract_backend_here.sh
# Writes backend_code.txt **in the current directory only** (no auto root-walk).
# Usage:
#   bash extract_backend_here.sh
#   bash extract_backend_here.sh --out ./my_bundle.txt

set +e  # be forgiving
OUT_FILE="./backend_code.txt"

# ---- args ----
while [[ $# -gt 0 ]]; do
  case "$1" in
    --out)
      shift
      [[ $# -gt 0 ]] || { echo "Missing value for --out"; exit 1; }
      OUT_FILE="$1"
      shift
      ;;
    *)
      echo "Unknown arg: $1"
      exit 1
      ;;
  esac
done

ROOT="$(pwd)"
timestamp(){ date +"%Y-%m-%d %H:%M:%S %z"; }

append(){ printf "%s\n" "$*" >> "$OUT_FILE"; }
append_section(){ append "=== $1 ==="; append ""; }
append_file(){
  local label="$1" rel="$2" abs="$ROOT/$rel"
  append "--- $label: $rel ---"
  if [[ -f "$abs" ]]; then cat "$abs" >> "$OUT_FILE"; else append "File not found: $rel"; fi
  append ""
}
append_tree(){
  local title="$1" rel="$2" abs="$ROOT/$rel"
  append_section "$title (tree)"
  if [[ -d "$abs" ]]; then (find "$rel" -print) >> "$OUT_FILE" 2>/dev/null
  else append "Directory not found: $rel"; fi
  append ""
}
append_glob_find(){
  local title="$1" base="$2" pattern="$3" abs="$ROOT/$base" found=0
  append_section "$title"
  if [[ ! -d "$abs" ]]; then append "Directory not found: $base"; append ""; return; fi
  while IFS= read -r -d '' f; do
    found=1; rel="${f#$ROOT/}"; append_file "$title file" "$rel"
  done < <(find "$abs" -type f -name "$pattern" -print0 2>/dev/null)
  [[ $found -eq 1 ]] || { append "No files matched: $base | pattern: $pattern"; append ""; }
}
append_masked_env(){
  local title="$1" rel="$2" abs="$ROOT/$rel"
  append "--- ${title}: ${rel} (values masked) ---"
  if [[ -f "$abs" ]]; then
    awk 'BEGIN{FS="=";OFS="="}
         /^[[:space:]]*#/ {print;next}
         NF>=2 { $2="<REDACTED>"; for(i=3;i<=NF;i++) $2=$2"="$i; print; next }
         {print}' "$abs" >> "$OUT_FILE"
  else append "File not found: $rel"; fi
  append ""
}
presence_report(){
  append_section "FILE PRESENCE REPORT"
  for rel in "$@"; do
    [[ -e "$ROOT/$rel" ]] && append "[OK]   $rel" || append "[MISS] $rel"
  done; append ""
}

# ---- begin ----
: > "$OUT_FILE"
append "BirthdayGen Backend Bundle — generated $(timestamp)"
append "Write-here-only mode. Current dir: $ROOT"
append ""

# Prisma
append_section "PRISMA"
append_file "Prisma schema" "prisma/schema.prisma"
append_file "Prisma seed"   "prisma/seed.ts"
append_glob_find "Prisma migrations" "prisma/migrations" "migration.sql"

# Supabase clients/types in src
append_section "SUPABASE CLIENTS (App)"
append_file "Supabase client (browser)" "src/lib/supabase/browser.ts"
append_file "Supabase client (server)"  "src/lib/supabase/server.ts"
append_file "Supabase utils"            "src/lib/supabase.ts"
append_file "Database types (src)"      "src/types/database.types.ts"
append_file "Supabase types (src)"      "src/types/supabase.ts"
append_file "Root types_db.ts"          "types_db.ts"

# Supabase project dir
append_tree "SUPABASE DIRECTORY" "supabase"
append_file "Supabase config" "supabase/config.toml"
append_glob_find "Supabase migrations (.sql)" "supabase/migrations" "*.sql"
append_glob_find "Supabase policies/rules"    "supabase"            "*policy*.sql"
append_glob_find "Supabase storage policies"  "supabase"            "*storage*.sql"
append_glob_find "Supabase seed scripts"      "supabase"            "*seed*.sql"

# Edge Functions
append_tree "Supabase Edge Functions" "supabase/functions"
append_glob_find "Edge Functions source" "supabase/functions" "index.*"
append_glob_find "Edge Functions ts"     "supabase/functions" "*.ts"
append_glob_find "Edge Functions js"     "supabase/functions" "*.js"
append_glob_find "Edge Functions config" "supabase/functions" "*.*"

# Next API routes (common)
append_section "NEXT API ROUTES"
append_file "Cards API"     "src/app/api/cards/route.ts"
append_file "Contacts API"  "src/app/api/contacts/route.ts"
append_file "Health API"    "src/app/api/health/route.ts"
append_file "Notify API"    "src/app/api/notify/route.ts"
append_file "Auth Hook"     "src/app/api/auth/route.ts"

# Sockets & server entry
append_section "REALTIME / SOCKETS"
append_file "Socket utilities" "src/lib/socket.ts"

append_section "SERVER ENTRY"
append_file "server.ts" "server.ts"

# Env + deps
append_section "ENVIRONMENT (masked) & DEPENDENCIES"
append_masked_env ".env"               ".env"
append_masked_env ".env.local"         ".env.local"
append_masked_env ".env.development"   ".env.development"
append_masked_env ".env.production"    ".env.production"
append_file       "package.json"       "package.json"

# Presence report
presence_report \
  "prisma/schema.prisma" \
  "prisma/seed.ts" \
  "prisma/migrations" \
  "src/lib/supabase/browser.ts" \
  "src/lib/supabase/server.ts" \
  "src/lib/supabase.ts" \
  "src/types/database.types.ts" \
  "src/types/supabase.ts" \
  "types_db.ts" \
  "supabase/config.toml" \
  "supabase/migrations" \
  "supabase/functions" \
  "src/app/api/cards/route.ts" \
  "src/app/api/contacts/route.ts" \
  "src/app/api/health/route.ts" \
  "src/app/api/notify/route.ts" \
  "src/app/api/auth/route.ts" \
  "src/lib/socket.ts" \
  "server.ts" \
  "package.json" \
  ".env" ".env.local" ".env.development" ".env.production"

echo "Done. Wrote: $OUT_FILE"
