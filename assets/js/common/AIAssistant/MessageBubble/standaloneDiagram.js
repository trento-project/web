// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

const SVG_MIME = 'image/svg+xml';

// Revoking right after `window.open` races the new tab's fetch of the URL.
// The blob is a few KB and dies with the document, so a generous delay costs
// nothing and removes the race.
const REVOKE_DELAY_MS = 60_000;

// A browser shows a standalone SVG document at its intrinsic size, and mermaid
// writes the diagram's natural size onto the root element. Percentages hand
// sizing back to the tab, so the diagram fits the window and scales with it.
export function toStandaloneSvg(markup) {
  const parsed = new DOMParser().parseFromString(markup, SVG_MIME);

  if (parsed.getElementsByTagName('parsererror').length > 0) return markup;

  const root = parsed.documentElement;

  root.setAttribute('width', '100%');
  root.setAttribute('height', '100%');
  // mermaid pins `max-width` to the natural width, which would cap the diagram
  // well below the tab it now has to itself.
  root.removeAttribute('style');

  return new XMLSerializer().serializeToString(root);
}

// The markup opened here becomes a top-level document, and a top-level SVG
// document CAN run scripts — unlike one inlined into a page. What keeps that
// safe is mermaid's `securityLevel: 'strict'`, which pushes every
// model-generated label through DOMPurify before we ever see the SVG. Relaxing
// that setting turns this function into a script-injection sink.
export function openDiagramInNewTab(markup) {
  const url = URL.createObjectURL(
    new Blob([toStandaloneSvg(markup)], { type: SVG_MIME })
  );

  window.open(url, '_blank', 'noopener,noreferrer');

  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}
