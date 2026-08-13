#!/usr/bin/env bash
# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0
#
# Anchor dynamic-analysis findings to a file in the repository.
#
# Code scanning resolves every SARIF result against the checked-out tree and
# rejects the whole file when a location carries a URL instead of a path:
#
#   SARIF URI scheme "http" did not match the checkout URI scheme "file"
#
# Dynamic analysis has no source file to point at, so rewrite each location to
# the file that configures the scan and move the scanned URL into the message,
# which is where a reader needs it anyway. The original URL is also kept in the
# location's properties so the artifact stays machine-readable.
#
# Anchoring collapses every location onto one line, which would otherwise let
# code scanning treat two findings of the same rule as one alert. An explicit
# partialFingerprints entry, built from the rule, the URL, the attack string
# and the message, keeps them distinct.
#
# Digits are stripped from the message before it enters the fingerprint. ZAP
# embeds timestamps and occurrence counts in its wording, so a fingerprint
# carrying them would change on every run and resurrect alerts that had already
# been dismissed. Stripping them merges the same finding across runs while
# still separating, say, two different patterns matched on one page.
#
# Usage: SARIF_PATH=... ANCHOR_PATH=... anchor-dast-sarif.sh

set -euo pipefail

: "${SARIF_PATH:?SARIF_PATH must be set}"
: "${ANCHOR_PATH:?ANCHOR_PATH must be set}"

if [[ ! -f "$SARIF_PATH" ]]; then
  echo "No SARIF file at ${SARIF_PATH}; nothing to anchor"
  exit 0
fi

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

jq --arg anchor "$ANCHOR_PATH" '
  def is_url: test("^[a-z][a-z0-9+.-]*://");

  # The region is replaced rather than kept: code scanning renders the real
  # content of the anchor file at the reported line, so a scanner snippet left
  # in place would be displayed as if it were text from that file. Keep it as a
  # property instead, where it stays available without being rendered as source.
  def anchor_location:
    ((.physicalLocation.artifactLocation.uri // "") as $url
     | (.physicalLocation.region.snippet.text // "") as $evidence
     | if ($url | is_url)
       then .physicalLocation.artifactLocation.uri = $anchor
          | del(.physicalLocation.artifactLocation.uriBaseId)
          | .physicalLocation.region = {"startLine": 1}
          | .properties = ((.properties // {}) + {"scannedUrl": $url})
          | if $evidence == "" then . else .properties.evidence = $evidence end
       else . end);

  .runs[]?.results[]? |= (
    ([.locations[]?.physicalLocation.artifactLocation.uri // empty]
       | map(select(is_url)) | unique) as $urls
    | ([.locations[]? | (.properties // {}).attack // empty] | join(",")) as $attacks
    | ((.message.text // "") | gsub("[0-9]+"; "N") | .[0:200]) as $shape
    | if ($urls | length) == 0 then .
      else
        .locations = [.locations[]? | anchor_location]
        | .message.text = (($urls | join(", ")) + "\n\n" + (.message.text // ""))
        | .partialFingerprints = ((.partialFingerprints // {}) + {
            "primaryLocationLineHash":
              ((.ruleId // "") + "|" + ($urls | join(","))
               + "|" + $attacks + "|" + $shape)
          })
      end
  )
' "$SARIF_PATH" > "$tmp"

mv "$tmp" "$SARIF_PATH"
trap - EXIT

# Only location URIs are resolved against the checkout, so only those can
# trigger the rejection. A URL anywhere else in the file is legitimate.
remaining="$(jq '[.runs[]?.results[]?.locations[]?.physicalLocation.artifactLocation.uri // empty
                 | select(test("^[a-z][a-z0-9+.-]*://"))] | length' "$SARIF_PATH")"
if [[ "$remaining" != "0" ]]; then
  echo "::error::${remaining} location URIs are still URLs; code scanning would reject this file"
  exit 1
fi

echo "Anchored $(jq '[.runs[]?.results[]?] | length' "$SARIF_PATH") findings to ${ANCHOR_PATH}"
