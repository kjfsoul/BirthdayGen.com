#!/bin/bash

# Configuration
OUTPUT_FILE="complete_codebase.txt"
MAX_FILE_SIZE=100000  # 100KB max per file
EXCLUDE_DIRS=("node_modules" ".git" ".next" "build" "dist" "out")
INCLUDE_EXTS=("js" "jsx" "ts" "tsx" "json" "md" "css" "scss" "html" "yml" "yaml" "config.js" "config.ts")

# Initialize output file
> "$OUTPUT_FILE"

# Add header
echo "=== NEXT.JS CODEBASE EXTRACTION ===" >> "$OUTPUT_FILE"
echo "Generated: $(date)" >> "$OUTPUT_FILE"
echo "Max file size: $MAX_FILE_SIZE bytes" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Function to append file content
append_file() {
    local file="$1"
    local rel_path=${file#./}
    echo "=== FILE: $rel_path ===" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "=== END FILE: $rel_path ===" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
}

# Generate directory structure
echo "=== DIRECTORY STRUCTURE ===" >> "$OUTPUT_FILE"
find . -type d \( -name node_modules -o -name .git -o -name .next -o -name build -o -name dist \) -prune -o -type f -print | grep -vE '\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$' | sort >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Find and process files
find . -type d \( $(printf -- "-o -name %s " "${EXCLUDE_DIRS[@]}") \) -prune -o -type f \( $(printf -- "-o -name *.%s " "${INCLUDE_EXTS[@]}") \) -print | while read -r file; do
    # Skip if in excluded directory
    for exclude_dir in "${EXCLUDE_DIRS[@]}"; do
        if [[ "$file" == *"/$exclude_dir/"* ]]; then
            continue 2
        fi
    done
    
    # Check file size
    file_size=$(wc -c < "$file")
    if [ "$file_size" -le "$MAX_FILE_SIZE" ]; then
        append_file "$file"
    else
        echo "Skipping large file: $file ($file_size bytes)" >&2
    fi
done

echo "Extraction complete! Output saved to: $OUTPUT_FILE"
echo "Total files processed: $(grep -c "=== FILE:" "$OUTPUT_FILE")"
