// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// `mocks/mermaid.js` — see `moduleNameMapper`. The real package is ESM-only
// and needs a layout engine jsdom doesn't have.
import mermaid from 'mermaid';

import MermaidDiagram, { RENDER_DEBOUNCE_MS } from './MermaidDiagram';

// Stand-ins for the `Pre`/`Code` overrides `MarkdownTextPrimitive` hands to a
// `SyntaxHighlighter` component — bare elements that forward every prop.
const COMPONENTS = {
  Pre: (props) => <pre data-testid="pre" {...props} />,

  Code: (props) => <code data-testid="code" {...props} />,
};

const SOURCE = 'graph TD;\n  A-->B;';

// Shaped like mermaid's output — the viewport reads the viewBox to size the
// zoom extent.
const RENDERED_SVG = '<svg data-name="rendered" viewBox="0 0 100 50"></svg>';

const renderDiagram = (code) =>
  render(<MermaidDiagram components={COMPONENTS} code={code} />);

// The effect chains load → parse → render behind the debounce. Draining
// microtasks inside `act` settles the whole chain and the state update it ends
// with.
const advanceBy = async (ms) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

describe('MermaidDiagram', () => {
  beforeEach(() => {
    jest.useFakeTimers();

    // `clearMocks` wipes calls but keeps implementations, and the mock module
    // is shared by every test in this file — restate both defaults per test.
    mermaid.parse.mockResolvedValue(true);
    mermaid.render.mockResolvedValue({ svg: RENDERED_SVG });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the source as a plain fence until the debounce elapses', async () => {
    const { getByTestId } = renderDiagram(`${SOURCE}\n`);

    await advanceBy(RENDER_DEBOUNCE_MS - 1);

    expect(mermaid.parse).not.toHaveBeenCalled();
    // The trailing fence newline is dropped on this path too.
    expect(getByTestId('pre').textContent).toBe(SOURCE);
  });

  it('replaces the fence with the rendered diagram', async () => {
    const { getByTestId, queryByTestId } = renderDiagram(`${SOURCE}\n`);

    await advanceBy(RENDER_DEBOUNCE_MS);

    // mermaid uses the id as a CSS selector, so it must survive `useId`'s colons.
    expect(mermaid.render).toHaveBeenCalledWith(
      expect.not.stringContaining(':'),
      SOURCE
    );
    expect(
      getByTestId('diagram-surface').querySelector('svg[data-name="rendered"]')
    ).toBeInTheDocument();
    expect(queryByTestId('pre')).not.toBeInTheDocument();
  });

  it('opens the diagram over the page and in its own tab', async () => {
    URL.createObjectURL = jest.fn().mockReturnValue('blob:diagram');
    URL.revokeObjectURL = jest.fn();
    window.open = jest.fn();

    renderDiagram(SOURCE);

    await advanceBy(RENDER_DEBOUNCE_MS);

    // One diagram on screen, and no dialog until it is asked for.
    expect(screen.getAllByTestId('diagram-viewport')).toHaveLength(1);

    await act(async () => {
      screen.getByRole('button', { name: 'Expand diagram' }).click();
    });

    // The modal hosts a second viewport, over the chat window.
    expect(screen.getAllByTestId('diagram-viewport')).toHaveLength(2);

    await act(async () => {
      screen.getByRole('button', { name: 'Close diagram' }).click();
    });

    expect(screen.getAllByTestId('diagram-viewport')).toHaveLength(1);

    await act(async () => {
      screen.getByRole('button', { name: 'Open diagram in a new tab' }).click();
    });

    expect(window.open).toHaveBeenCalledWith(
      'blob:diagram',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('initializes mermaid with the strict security level', async () => {
    renderDiagram(SOURCE);

    await advanceBy(RENDER_DEBOUNCE_MS);

    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ securityLevel: 'strict', startOnLoad: false })
    );
  });

  it('keeps the plain fence when the source does not parse', async () => {
    // What `parse` answers for a half-streamed fence.
    mermaid.parse.mockResolvedValue(false);

    const { getByTestId } = renderDiagram('graph TD; A--');

    await advanceBy(RENDER_DEBOUNCE_MS);

    expect(mermaid.render).not.toHaveBeenCalled();
    expect(getByTestId('pre')).toHaveTextContent('graph TD; A--');
  });

  it('keeps the plain fence when a parseable diagram fails to lay out', async () => {
    mermaid.render.mockRejectedValue(new Error('layout failed'));

    const { getByTestId } = renderDiagram(SOURCE);

    await advanceBy(RENDER_DEBOUNCE_MS);

    expect(getByTestId('pre')).toHaveTextContent('graph TD;');
  });

  it('does not reach mermaid when unmounted mid-debounce', async () => {
    const { unmount } = renderDiagram(SOURCE);

    unmount();

    await advanceBy(RENDER_DEBOUNCE_MS);

    expect(mermaid.parse).not.toHaveBeenCalled();
  });
});
