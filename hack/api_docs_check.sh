#!/usr/bin/env bash

# Copyright 2025 SUSE LLC
# SPDX-License-Identifier: Apache-2.0

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

    # Merge them using redocly
    OPENAPI_FILES=()
    for version in "${VERSIONS[@]}"; do
        OPENAPI_FILES+=("${PROJECT_DIR}/openapi_${version}.json")
    done
    redocly join --without-x-tag-groups  --prefix-components-with-info-prop=version  "${OPENAPI_FILES[@]}" -o "$MERGED_OPENAPI_FILE"

    # Remove prefix added for preventing the merge tool from failing
    VERSION=$(jq -r '.info.version' "$MERGED_OPENAPI_FILE") && sed -i -e "s/\"${VERSION}_/\"/g" -e "s/#\/components\/schemas\/${VERSION}_/#\/components\/schemas\//g" "$MERGED_OPENAPI_FILE"

else
    echo "Skipping API docs generation/merging, just starting linting the spec..."
fi

# Run redocly linter
echo "Running redocly linter..."
redocly lint "$MERGED_OPENAPI_FILE" --extends recommended --format=stylish || true

# Run spectral linter
echo "Running spectral linter..."
spectral lint "$MERGED_OPENAPI_FILE" -r https://unpkg.com/@apisyouwonthate/style-guide/dist/ruleset.js --format=pretty || true

# Run vacuum linter
echo "Running vacuum linter..."
vacuum lint "$MERGED_OPENAPI_FILE" -d || true
