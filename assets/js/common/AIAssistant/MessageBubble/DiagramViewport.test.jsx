// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import DiagramViewport from './DiagramViewport';

// Shaped like mermaid's output: a viewBox (d3 reads it to size the zoom
// extent), a natural width and the inline `max-width` mermaid pins to it.
const SVG =
  '<svg id="mermaid-1" viewBox="0 0 100 50" width="100" height="50" style="max-width: 100px;">' +
  '<g class="nodes"><rect width="10" height="10"></rect></g>' +
  '</svg>';

const renderViewport = (props = {}) =>
  render(<DiagramViewport svg={SVG} {...props} />);

// d3 is loaded with a dynamic `import()`, so nothing is wired up until the
// microtask queue drains.
const flushD3 = () =>
  act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });

const surface = () => screen.getByTestId('diagram-surface');
const transformLayer = () => surface().querySelector('svg > g');

const scaleOf = (element) =>
  Number(/scale\(([\d.]+)\)/.exec(element.getAttribute('transform'))[1]);

describe('DiagramViewport', () => {
  it('hands sizing to the viewport and wraps the diagram in a transform layer', async () => {
    renderViewport();
    await flushD3();

    const svgEl = surface().querySelector('svg');

    expect(svgEl).toHaveAttribute('width', '100%');
    expect(svgEl).toHaveAttribute('height', '100%');
    // mermaid's `max-width` would cap the diagram at its natural size.
    expect(svgEl.style.maxWidth).toBe('none');

    // The diagram's own markup is untouched — it just moved one level down,
    // under the group that carries the pan/zoom transform.
    expect(transformLayer().querySelector('g.nodes rect')).toBeInTheDocument();
    expect(transformLayer()).toHaveAttribute('transform');
  });

  it('zooms in and out from the controls', async () => {
    const user = userEvent.setup();

    renderViewport();
    await flushD3();

    expect(scaleOf(transformLayer())).toBeCloseTo(1);

    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(scaleOf(transformLayer())).toBeCloseTo(1.4);

    await user.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(scaleOf(transformLayer())).toBeCloseTo(1);

    await user.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(scaleOf(transformLayer())).toBeCloseTo(1 / 1.4);
  });

  it('returns the diagram to the viewport', async () => {
    const user = userEvent.setup();

    renderViewport();
    await flushD3();

    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    await user.click(screen.getByRole('button', { name: 'Fit diagram' }));

    expect(scaleOf(transformLayer())).toBeCloseTo(1);
  });

  it('zooms on a modified wheel and leaves a plain one to the scroller', async () => {
    renderViewport();
    await flushD3();

    const svgEl = surface().querySelector('svg');
    const wheel = (init) =>
      act(() => {
        svgEl.dispatchEvent(
          new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: 10,
            clientY: 10,
            deltaY: -100,
            ...init,
          })
        );
      });

    // A bare wheel has to keep scrolling the conversation the diagram sits in.
    await wheel({});
    expect(scaleOf(transformLayer())).toBeCloseTo(1);

    await wheel({ ctrlKey: true });
    expect(scaleOf(transformLayer())).toBeGreaterThan(1);

    // macOS reports ⌘ separately, and it is the zoom modifier there.
    await wheel({ metaKey: true });
    expect(scaleOf(transformLayer())).toBeGreaterThan(1);
  });

  it('renders the actions it is given next to the zoom controls', async () => {
    renderViewport({ actions: <button type="button">Expand</button> });
    await flushD3();

    expect(screen.getByRole('button', { name: 'Expand' })).toBeInTheDocument();
  });

  it('takes the diagram back out of the DOM on unmount', async () => {
    const { unmount } = renderViewport();
    await flushD3();

    const container = surface();

    unmount();

    expect(container.innerHTML).toBe('');
  });
});
