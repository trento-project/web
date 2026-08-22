#!/bin/bash

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

# Retry a command with configurable attempts and timeout
# Usage: retry "command to run" "test name for logging" max_attempts timeout_seconds
retry() {
  local cmd="$1"
  local test_name="${2:-Test}"
  local max_attempts="${3:-2}"
  local timeout_seconds="${4:-1800}"

  for attempt in $(seq 1 "$max_attempts"); do
    echo "Attempt $attempt/$max_attempts"

    if timeout "$timeout_seconds" bash -c "$cmd"; then
      echo "$test_name passed on attempt $attempt"
      return 0
    fi

    if [ "$attempt" -lt "$max_attempts" ]; then
      echo "::warning::$test_name failed on attempt $attempt, retrying..."
      sleep 5
    else
      echo "::error::$test_name failed after $max_attempts attempts"
      return 1
    fi
  done
}

# If script is executed (not sourced), run the retry function with args
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  retry "$@"
fi
