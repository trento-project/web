// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { CONNECTING, CONNECTED, DISCONNECTED } from '@lib/ai';

import ChatHeader from './ChatHeader';

const defaults = {
  connectionStatus: CONNECTED,
  onNewChat: () => {},
  onClose: () => {},
};

describe('ChatHeader', () => {
  it.each([
    { status: CONNECTED, text: 'Online' },
    { status: CONNECTING, text: 'Connecting...' },
    { status: DISCONNECTED, text: 'Offline' },
  ])('renders the $text label for $status', ({ status, text }) => {
    render(<ChatHeader {...defaults} connectionStatus={status} />);
    expect(screen.getByText(text)).toBeVisible();
    expect(screen.getByText('Liz')).toBeVisible();
  });

  it('falls back to the disconnected label for an unknown status', () => {
    render(<ChatHeader {...defaults} connectionStatus="unknown" />);
    expect(screen.getByText('Offline')).toBeVisible();
  });

  it.each([CONNECTING, DISCONNECTED, 'unknown'])(
    'disables the "New chat" button when %s',
    (connectionStatus) => {
      render(<ChatHeader {...defaults} connectionStatus={connectionStatus} />);
      expect(screen.getByRole('button', { name: 'New chat' })).toBeDisabled();
    }
  );

  it('enables the "New chat" button when connected', () => {
    render(<ChatHeader {...defaults} connectionStatus={CONNECTED} />);
    expect(screen.getByRole('button', { name: 'New chat' })).not.toBeDisabled();
  });

  it('disables the "New chat" button while a run is in flight', () => {
    render(<ChatHeader {...defaults} connectionStatus={CONNECTED} isRunning />);
    expect(screen.getByRole('button', { name: 'New chat' })).toBeDisabled();
  });

  it('invokes onNewChat when the "New chat" button is clicked', async () => {
    const user = userEvent.setup();
    const onNewChat = jest.fn();
    render(<ChatHeader {...defaults} onNewChat={onNewChat} />);

    await user.click(screen.getByRole('button', { name: 'New chat' }));

    expect(onNewChat).toHaveBeenCalledTimes(1);
  });

  it('invokes onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ChatHeader {...defaults} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stops pointer-down propagation on the buttons so the drag handle does not trigger', async () => {
    const user = userEvent.setup();
    const parentPointerDown = jest.fn();
    render(
      <div onPointerDown={parentPointerDown}>
        <ChatHeader {...defaults} />
      </div>
    );

    await user.click(screen.getByRole('button', { name: 'New chat' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(parentPointerDown).not.toHaveBeenCalled();
  });

  it('marks the bar as a drag handle so the surrounding modal can be dragged', () => {
    const { container } = render(<ChatHeader {...defaults} />);
    expect(container.firstChild).toHaveClass('drag-handle');
  });
});
