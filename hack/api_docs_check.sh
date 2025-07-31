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
MERGED_OPENAPI_FILE="merged-openapi.json"
VERSIONS=("Unversioned" "V1" "V2")

if [ "$SKIP_GENERATION" = false ]; then
    # Generate the API docs
    for version in "${VERSIONS[@]}"; do
        echo "Generating API docs for '${version}' endpoints..."
        mix openapi.spec.json --start-app=false --spec "TrentoWeb.OpenApi.${version}.ApiSpec" --vendor-extensions=false --pretty=true "${PROJECT_DIR}/openapi_${version}.json"
    done

    # Get the file names of the API specs for later
    OPENAPI_FILES=()
    for version in "${VERSIONS[@]}"; do
        OPENAPI_FILES+=("${PROJECT_DIR}/openapi_${version}.json")
    done

    # Join the API specs, prefixing the components with the version (ex: 2.5.0-V_)
    redocly join --without-x-tag-groups  --prefix-components-with-info-prop=version  "${OPENAPI_FILES[@]}" -o "$MERGED_OPENAPI_FILE"

    # Set the version back to x.y.z (ex: 2.5.0)
    jq '.info.version |= split("-")[0]' "$MERGED_OPENAPI_FILE" > "$MERGED_OPENAPI_FILE.tmp" && mv "$MERGED_OPENAPI_FILE.tmp" "$MERGED_OPENAPI_FILE"

    # Remove the x.y.z from the components, just use VX_ (ex: V1_)
    sed -i -E 's/"[0-9.]+-(v[0-9]+)_/"\1_/g; s/#\/components\/schemas\/[0-9.]+-(v[0-9]+)_/#\/components\/schemas\/\1_/g' "$MERGED_OPENAPI_FILE"

else
    echo "Skipping API docs generation/merging, just starting linting the spec..."
fi

# Run redocly linter
echo "Running redocly linter..."
redocly lint "$MERGED_OPENAPI_FILE" --extends recommended --format=stylish --skip-rule=operation-4xx-response || true

# Run spectral linter
# echo "Running spectral linter..."
# spectral lint "$MERGED_OPENAPI_FILE" -r https://unpkg.com/@apisyouwonthate/style-guide/dist/ruleset.js --format=text || true
# spectral lint "$MERGED_OPENAPI_FILE" -r https://unpkg.com/@stoplight/spectral-documentation/dist/ruleset.mjs --format=text || true
# spectral lint "$MERGED_OPENAPI_FILE" -r https://unpkg.com/@rhoas/spectral-ruleset --format=text || true
# spectral lint "$MERGED_OPENAPI_FILE" -r https://raw.githubusercontent.com/SchwarzIT/api-linter-rules/refs/heads/main/spectral.yml --format=text || true

# # Run vacuum linter
# echo "Running vacuum linter..."
# vacuum lint "$MERGED_OPENAPI_FILE" -d  || true
