#!/usr/bin/env bash

# Copyright 2025 SUSE LLC
# SPDX-License-Identifier: Apache-2.0

# ------------------------------------------------------------------------------
# api_docs_check.sh
#
# This script generates and lints OpenAPI documentation for the Trento
# web application. It supports multiple OpenAPI versions and runs various 
# linters (redocly, vacuum, spectral) to ensure API documentation quality
# and compliance.
#
# Usage:
#   ./hack/api_docs_check.sh [OPTIONS]
#
# Options:
#   -h, --help    Show this help message
#
# Requirements:
#   - mix (Elixir build tool)
#   - redocly (npm i -g @redocly/cli@latest)
#   - vacuum (npm i -g @quobix/vacuum@latest)
#   - spectral (npm i -g @stoplight/spectral-cli)
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
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Check API documentation using various linters."
            echo ""
            echo "Options:"
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

VERSIONS=("All" "Unversioned" "V1" "V2")
status=0

for version in "${VERSIONS[@]}"; do
    echo "Generating API docs for '${version}' endpoints..."
    OPENAPI_FILE=$(mktemp "openapi_${version}.XXXXXX.json")
    TEMP_FILES+=("$OPENAPI_FILE")
    mix openapi.spec.json --start-app=false --spec "TrentoWeb.OpenApi.${version}.ApiSpec" --vendor-extensions=false --pretty=true "$OPENAPI_FILE"

    # Run linters and collect exit codes
    # Run redocly linter
    echo "Running redocly linter..."
    redocly lint "$OPENAPI_FILE" --extends recommended --format=stylish --skip-rule=operation-4xx-response || status=1

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

    spectral lint "$OPENAPI_FILE" -r "$SPECTRAL_RULESET_FILE" --verbose --format=text || status=1
    echo ""

    # Run vacuum linter
    echo "Running vacuum linter..."

    # Create a temporary ruleset file to ignore specific rules.
    VACUUM_RULESET_FILE=$(mktemp .vacuum.XXXXXX.yaml)
    TEMP_FILES+=("$VACUUM_RULESET_FILE")
    cat > "$VACUUM_RULESET_FILE" << EOF
extends: [[vacuum:oas, recommended]]
rules:
  paths-kebab-case: false
  description-duplication: false
  camel-case-properties: false
  no-unnecessary-combinator: false
EOF

    vacuum lint "$OPENAPI_FILE" -r "$VACUUM_RULESET_FILE" -d --ignore-array-circle-ref || status=1
done

exit $status
