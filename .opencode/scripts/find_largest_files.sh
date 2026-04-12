#!/bin/bash
find projects -type f \( -name "*.ts" -o -name "*.html" \) \
    ! -name "*.spec.ts" ! -name "*.e2e.ts" -print0 | \
    while IFS= read -r -d '' file; do
        count=$(wc -l < "$file")
        echo "$count $file"
    done | sort -rn | head -n 5 | awk '{printf "%-70s %s\n", $2, $1}'
