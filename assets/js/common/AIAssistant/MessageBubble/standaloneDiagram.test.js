// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { openDiagramInNewTab, toStandaloneSvg } from './standaloneDiagram';

const SVG =
  '<svg id="mermaid-1" viewBox="0 0 100 50" width="100" height="50" style="max-width: 100px;">' +
  '<g class="nodes"></g>' +
  '</svg>';

describe('toStandaloneSvg', () => {
  it('lets the tab decide how big the diagram is', () => {
    const standalone = toStandaloneSvg(SVG);

    expect(standalone).toContain('width="100%"');
    expect(standalone).toContain('height="100%"');
    // mermaid's inline `max-width` would cap the diagram at its natural size
    // in a tab that has room for far more.
    expect(standalone).not.toContain('max-width');
    // Everything that draws the diagram survives.
    expect(standalone).toContain('viewBox="0 0 100 50"');
    expect(standalone).toContain('<g class="nodes"/>');
  });

  it('hands back markup it cannot parse', () => {
    expect(toStandaloneSvg('<svg><g></svg>')).toBe('<svg><g></svg>');
  });
});

describe('openDiagramInNewTab', () => {
  const createObjectURL = jest.fn().mockReturnValue('blob:diagram');
  const revokeObjectURL = jest.fn();
  const NativeBlob = global.Blob;

  // jsdom's Blob exposes no way to read its contents back, so record what the
  // constructor was handed.
  class RecordingBlob {
    constructor(parts, { type }) {
      this.parts = parts;
      this.type = type;
    }
  }

  beforeEach(() => {
    jest.useFakeTimers();

    global.Blob = RecordingBlob;
    // jsdom implements neither half of the object-URL API.
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    window.open = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    global.Blob = NativeBlob;
  });

  it('opens the diagram as its own document', () => {
    openDiagramInNewTab(SVG);

    const [blob] = createObjectURL.mock.calls[0];

    expect(blob.type).toBe('image/svg+xml');
    // The tab gets the resized markup, not mermaid's own.
    expect(blob.parts[0]).toContain('width="100%"');

    expect(window.open).toHaveBeenCalledWith(
      'blob:diagram',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('releases the object URL once the tab has had time to load it', () => {
    openDiagramInNewTab(SVG);

    // Revoking synchronously would race the new tab's own fetch of the URL.
    expect(revokeObjectURL).not.toHaveBeenCalled();

    jest.runAllTimers();

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:diagram');
  });
});
