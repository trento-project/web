#!/bin/sh
set -e
set -o pipefail

TAG=$( git tag | grep -E "[0-9]\.[0-9]\.[0-9]" | sort -rn | head -n1 )

if [ -n "${TAG}" ]; then
  COMMITS_SINCE_TAG=$(git rev-list "${TAG}".. --count)
  if [ "${COMMITS_SINCE_TAG}" -gt 0 ]; then
    COMMIT_SHA=$(git show -s --format=%ct.%h HEAD)
    SUFFIX="+git.dev${COMMITS_SINCE_TAG}.${COMMIT_SHA}"
  fi
else
  TAG="0"
fi

echo "${TAG}${SUFFIX}"
