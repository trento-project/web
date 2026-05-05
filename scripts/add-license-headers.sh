#!/bin/bash

# Add SPDX license headers to JSX files
# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

HEADER="// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0
"

# Find all .jsx files, excluding vendor and test files
find assets/js -name "*.jsx" \
  ! -path "*/vendor/*" \
  ! -name "*.test.jsx" \
  ! -name "*.stories.jsx" | while read -r file; do

  # Check if file already has the header
  if ! head -2 "$file" | grep -q "SPDX-FileCopyrightText"; then
    echo "Adding header to: $file"
    # Create temp file with header + original content
    echo -e "$HEADER" > "$file.tmp"
    cat "$file" >> "$file.tmp"
    mv "$file.tmp" "$file"
  else
    echo "Skipping (already has header): $file"
  fi
done

echo "Done!"
