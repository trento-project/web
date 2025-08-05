#!/usr/bin/env bash

# Copyright 2025 SUSE LLC
# SPDX-License-Identifier: Apache-2.0

# ------------------------------------------------------------------------------
# api_docs_check.sh
#
# This script generates, merges, and lints OpenAPI documentation for the Trento
# web application. It supports multiple OpenAPI versions, merges them into a
# single spec, and runs various linters (redocly, vacuum, spectral) to ensure
# API documentation quality and compliance.
#
# Usage:
#   ./hack/api_docs_check.sh [OPTIONS]
#
# Options:
#   -s, --skip    Skip API docs generation and merging (lint only)
#   -h, --help    Show this help message
#
# Requirements:
#   - mix (Elixir build tool)
#   - redocly (npm i -g @redocly/cli@latest)
#   - vacuum (npm i -g @quobix/vacuum@latest)
#   - spectral (npm i -g @stoplight/spectral-cli)
#   - jq, sed (for merging and post-processing)
#
# ------------------------------------------------------------------------------

set -euo pipefail

# Array to hold all temporary files for cleanup
TEMP_FILES=()
trap 'rm -f "${TEMP_FILES[@]}"' EXIT

# Parse command line arguments
SKIP_GENERATION=false

for arg in "$@"; do
    case $arg in
        -s|--skip)
            SKIP_GENERATION=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Check API documentation using various linters."
            echo ""
            echo "Options:"
            echo "  -s, --skip    Skip API docs generation and merging"
            echo "  -h, --help    Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $arg"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

command -v mix >/dev/null 2>&1 || {
    echo "mix must be installed"
    exit 1
}

command -v jq >/dev/null 2>&1 || {
    echo "jq must be installed"
    exit 1
}

command -v redocly >/dev/null 2>&1 || {
    echo "redocly must be installed -> run 'npm i -g @redocly/cli@latest'"
    exit 1
}

command -v vacuum >/dev/null 2>&1 || {
    echo "vacuum must be installed -> run 'npm i -g @quobix/vacuum@latest"
    exit 1
}

command -v spectral >/dev/null 2>&1 || {
    echo "spectral must be installed -> run 'npm i -g @stoplight/spectral-cli'"
    exit 1
}

PROJECT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null && pwd)
MERGED_OPENAPI_FILE="openapi.json"
VERSIONS=("Unversioned" "V1" "V2")

if [ "$SKIP_GENERATION" = false ]; then
    # Generate the API docs into temporary files
    OPENAPI_FILES=()
    for version in "${VERSIONS[@]}"; do
        echo "Generating API docs for '${version}' endpoints..."
        TMP_FILE=$(mktemp "openapi_${version}.XXXXXX.json")
        OPENAPI_FILES+=("$TMP_FILE")
        TEMP_FILES+=("$TMP_FILE")
        mix openapi.spec.json --start-app=false --spec "TrentoWeb.OpenApi.${version}.ApiSpec" --vendor-extensions=false --pretty=true "$TMP_FILE"
    done

    # Join the API specs, prefixing the components with the version (ex: 2.5.0-V_)
    redocly join --without-x-tag-groups --prefix-components-with-info-prop=version "${OPENAPI_FILES[@]}" -o "$MERGED_OPENAPI_FILE"

    # Set the version back to x.y.z (ex: 2.5.0)
    jq '.info.version |= split("-")[0]' "$MERGED_OPENAPI_FILE" > "$MERGED_OPENAPI_FILE.tmp" && mv "$MERGED_OPENAPI_FILE.tmp" "$MERGED_OPENAPI_FILE"

    # Clean up component names and references - remove version prefixes
    jq '
      # Clean up schema names: remove version prefixes from component names
      .components.schemas = (.components.schemas | with_entries(
        .key = (.key |
          # Remove "x.y.z-unversioned_" prefix (e.g., "1.5.0-unversioned_Health" -> "Health")
          sub("^[0-9.]+-unversioned_"; "") |
          # Remove "x.y.z-vX_" prefix (e.g., "1.5.0-v1_Target" -> "v1_Target")
          sub("^[0-9.]+-"; "")
        )
      )) |

      # Walk through entire document and fix $ref references
      walk(if type == "object" and has("$ref") then
        ."$ref" = (."$ref" |
          # Fix schema references
          sub("#/components/schemas/[0-9.]+-unversioned_"; "#/components/schemas/") |
          sub("#/components/schemas/[0-9.]+-"; "#/components/schemas/")
        )
      else . end)
    ' "$MERGED_OPENAPI_FILE" > "$MERGED_OPENAPI_FILE.tmp" && mv "$MERGED_OPENAPI_FILE.tmp" "$MERGED_OPENAPI_FILE"

    # Clean up security schemes and references - make everything use "authorization"
    jq '
      # First, clean up security schemes - keep only "authorization"
      .components.securitySchemes = {"authorization": (.components.securitySchemes | to_entries | map(select(.key | test("authorization"))) | first | .value)} |

      # Then walk through the entire document and replace any versioned authorization references
      walk(if type == "object" and has("security") then
        .security = (.security | map(if type == "object" then
          with_entries(if .key | test(".*authorization") then .key = "authorization" else . end)
        else . end))
      else . end)
    ' "$MERGED_OPENAPI_FILE" > "$MERGED_OPENAPI_FILE.tmp" && mv "$MERGED_OPENAPI_FILE.tmp" "$MERGED_OPENAPI_FILE"

else
    echo "Skipping API docs generation/merging, just starting linting the spec..."
fi

# Run redocly linter
echo "Running redocly linter..."
redocly lint "$MERGED_OPENAPI_FILE" --extends recommended --format=stylish --skip-rule=operation-4xx-response || true

# Run spectral linter
echo "Running spectral linter..."

# Create a temporary ruleset file to combine all spectral rulesets and ignore specific rules.
SPECTRAL_RULESET_FILE=$(mktemp .spectral.XXXXXX.yaml)
TEMP_FILES+=("$SPECTRAL_RULESET_FILE")
cat > "$SPECTRAL_RULESET_FILE" << EOF
extends:
  - "https://unpkg.com/@apisyouwonthate/style-guide/dist/ruleset.js"
  - "https://unpkg.com/@rhoas/spectral-ruleset"
  - "https://raw.githubusercontent.com/SchwarzIT/api-linter-rules/refs/heads/main/spectral.yml"
  - "https://unpkg.com/@stoplight/spectral-documentation/dist/ruleset.mjs"
rules:
  api-health: "off"
  api-home: "off"
  common-responses-unauthorized: "off"
  no-numeric-ids: "off"
  no-unknown-error-format: "off"
  path-must-match-api-standards: "off"
  path-must-match-api-standards: "off"
  paths-kebab-case: "off"
  rhoas-error-schema: "off"
  rhoas-list-schema: "off"
  rhoas-object-schema: "off"
  rhoas-path-regexp: "off"
  rhoas-schema-name-pascal-case: "off"
  rhoas-servers-config: "off"
  servers-must-match-api-standards: "off"
EOF

spectral lint "$MERGED_OPENAPI_FILE" -r "$SPECTRAL_RULESET_FILE" --verbose --format=text || true
echo ""

# Run vacuum linter
echo "Running vacuum linter..."

# Create a temporary ruleset file to ignore the description-duplication rule.
VACUUM_RULESET_FILE=$(mktemp .vacuum.XXXXXX.yaml)
TEMP_FILES+=("$VACUUM_RULESET_FILE")
cat > "$VACUUM_RULESET_FILE" << EOF
extends:
  - vacuum:recommended
rules:
  paths-kebab-case: false
  description-duplication: false
EOF

vacuum lint "$MERGED_OPENAPI_FILE" -r "$VACUUM_RULESET_FILE" -d --ignore-array-circle-ref || true
