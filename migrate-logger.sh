#!/bin/bash
# Bulk migrate console.log to logger

files=(
  "lib/email-service.ts"
  "app/api/document/process/route.ts"
  "app/api/chat/feedback/route.ts"
  "app/api/admin/blog/route.ts"
  "app/api/email/test/route.ts"
  "app/api/admin/email/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Check if logger import exists
    if ! grep -q "import.*logger.*from.*@/lib/logger" "$file"; then
      # Add import after the first import statement
      sed -i.bak '1,/^import/ s/^\(import.*\)$/\1\nimport { logger } from "@\/lib\/logger";/' "$file"
    fi
    
    # Replace console calls
    sed -i '' 's/console\.log(/logger.info(/g' "$file"
    sed -i '' 's/console\.error(/logger.error(/g' "$file"
    sed -i '' 's/console\.warn(/logger.warn(/g' "$file"
    sed -i '' 's/console\.debug(/logger.debug(/g' "$file"
    
    echo "  ✓ Done"
  else
    echo "  ⚠ File not found: $file"
  fi
done

echo "Migration complete!"
