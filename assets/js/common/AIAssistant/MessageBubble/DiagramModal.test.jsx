// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import DiagramModal from './DiagramModal';

const SVG = '<svg viewBox="0 0 100 50"><g class="nodes"></g></svg>';

const renderModal = async (props = {}) => {
  const result = render(
    <DiagramModal open svg={SVG} onClose={jest.fn()} {...props} />
  );

  // The viewport wires itself up behind a dynamic `import()`.
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });

  return result;
};

describe('DiagramModal', () => {
  it('stays out of the way until it is opened', () => {
    render(<DiagramModal open={false} svg={SVG} onClose={jest.fn()} />);

    expect(screen.queryByTestId('diagram-viewport')).not.toBeInTheDocument();
  });

  it('shows the diagram over the page', async () => {
    await renderModal();

    expect(
      screen.getByTestId('diagram-surface').querySelector('g.nodes')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open diagram in a new tab' })
    ).toBeInTheDocument();
  });

  it('closes from the toolbar', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();

    await renderModal({ onClose });

    await user.click(screen.getByRole('button', { name: 'Close diagram' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('keeps Escape from reaching the chat window behind it', async () => {
    const onClose = jest.fn();
    const documentEscape = jest.fn();
    const user = userEvent.setup();

    document.addEventListener('keydown', documentEscape);

    await renderModal({ onClose });

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
    // The chat window's popover dismisses itself from a document listener.
    expect(documentEscape).not.toHaveBeenCalled();

    document.removeEventListener('keydown', documentEscape);
  });
});
