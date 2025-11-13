#!/bin/bash

# Create output file
> codebase_content.txt

# Add header
echo "=== NEXT.JS CODEBASE EXTRACTION ===" >> codebase_content.txt
echo "Generated: $(date)" >> codebase_content.txt
echo "" >> codebase_content.txt

# Function to add a file to the output
add_file() {
    local file="$1"
    local name="$2"
    
    if [ -f "$file" ]; then
        echo "=== $name ===" >> codebase_content.txt
        cat "$file" >> codebase_content.txt
        echo "" >> codebase_content.txt
        echo "=== END $name ===" >> codebase_content.txt
        echo "" >> codebase_content.txt
    else
        echo "=== $name ===" >> codebase_content.txt
        echo "FILE NOT FOUND: $file" >> codebase_content.txt
        echo "" >> codebase_content.txt
    fi
}

# Add configuration files
add_file "package.json" "PACKAGE.JSON"
add_file "next.config.ts" "NEXT.CONFIG.TS"
add_file "tailwind.config.ts" "TAILWIND.CONFIG.TS"
add_file "tsconfig.json" "TSCONFIG.JSON"
add_file "components.json" "COMPONENTS.JSON"

# Add database files
add_file "prisma/schema.prisma" "PRISMA SCHEMA"
add_file "prisma/seed.ts" "PRISMA SEED"
add_file "src/lib/db.ts" "DATABASE LIBRARY"

# Add main app files
add_file "src/app/layout.tsx" "APP LAYOUT"
add_file "src/app/page.tsx" "HOME PAGE"
add_file "src/app/globals.css" "GLOBAL STYLES"

# Add API routes
add_file "src/app/api/cards/route.ts" "CARDS API"
add_file "src/app/api/contacts/route.ts" "CONTACTS API"
add_file "src/app/api/health/route.ts" "HEALTH API"

# Add components
add_file "src/components/AnimatedCard.tsx" "ANIMATED CARD COMPONENT"
add_file "src/components/Navigation.tsx" "NAVIGATION COMPONENT"

# Add utility files
add_file "src/lib/utils.ts" "UTILITIES"
add_file "src/lib/socket.ts" "SOCKET UTILITIES"
add_file "server.ts" "SERVER FILE"

# Add setup files
add_file "scripts/supabase-setup.js" "SUPABASE SETUP SCRIPT"
add_file "SETUP_COMPLETE.md" "SETUP DOCUMENTATION"
add_file "SUPABASE_SETUP.md" "SUPABASE SETUP DOCUMENTATION"

echo "Extraction complete! Output saved to: codebase_content.txt"
