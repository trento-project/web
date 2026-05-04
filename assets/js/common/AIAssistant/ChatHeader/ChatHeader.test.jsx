// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { useAIConnectionStatus } from '../connectionStatusContext';
import { useResetThread } from '../resetThreadContext';
import { ChatHeader, ChatHeaderView } from './ChatHeader';

jest.mock('../connectionStatusContext', () => ({
  useAIConnectionStatus: jest.fn(),
}));

jest.mock('../resetThreadContext', () => ({
  useResetThread: jest.fn(),
}));

const viewDefaults = {
  connectionStatus: 'connected',
  onNewChat: () => {},
  onClose: () => {},
};

describe('ChatHeaderView', () => {
  it.each([
    { status: 'connected', text: 'Online' },
    { status: 'connecting', text: 'Connecting...' },
    { status: 'disconnected', text: 'Offline' },
  ])('renders the $text label for $status', ({ status, text }) => {
    render(<ChatHeaderView {...viewDefaults} connectionStatus={status} />);
    expect(screen.getByText(text)).toBeVisible();
    expect(screen.getByText('Liz')).toBeVisible();
  });

  it('falls back to the disconnected label for an unknown status', () => {
    render(<ChatHeaderView {...viewDefaults} connectionStatus="unknown" />);
    expect(screen.getByText('Offline')).toBeVisible();
  });

  it('invokes onNewChat when the "New chat" button is clicked', async () => {
    const user = userEvent.setup();
    const onNewChat = jest.fn();
    render(<ChatHeaderView {...viewDefaults} onNewChat={onNewChat} />);

    await user.click(screen.getByRole('button', { name: 'New chat' }));

    expect(onNewChat).toHaveBeenCalledTimes(1);
  });

  it('invokes onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ChatHeaderView {...viewDefaults} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stops pointer-down propagation on the buttons so the drag handle does not trigger', () => {
    const user = userEvent.setup();
    const parentPointerDown = jest.fn();
    render(
      <div onPointerDown={parentPointerDown}>
        <ChatHeaderView {...viewDefaults} />
      </div>
    );

    user.click(screen.getByRole('button', { name: 'New chat' }));
    user.click(screen.getByRole('button', { name: 'Close' }));

    expect(parentPointerDown).not.toHaveBeenCalled();
  });

  it('marks the bar as a drag handle so the surrounding modal can be dragged', () => {
    const { container } = render(<ChatHeaderView {...viewDefaults} />);
    expect(container.firstChild).toHaveClass('drag-handle');
  });
});

describe('ChatHeader', () => {
  it('passes the current connection status to the view', () => {
    useResetThread.mockReturnValue(jest.fn());
    useAIConnectionStatus.mockReturnValue('connecting');

    render(<ChatHeader onClose={() => {}} />);

    expect(screen.getByText('Connecting...')).toBeVisible();
  });

  it('calls resetThread when "New chat" is clicked', async () => {
    const resetThread = jest.fn();
    useResetThread.mockReturnValue(resetThread);
    useAIConnectionStatus.mockReturnValue('connected');
    const user = userEvent.setup();

    render(<ChatHeader onClose={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'New chat' }));

    expect(resetThread).toHaveBeenCalledTimes(1);
  });

  it('forwards onClose to the close button', async () => {
    useResetThread.mockReturnValue(jest.fn());
    useAIConnectionStatus.mockReturnValue('connected');
    const onClose = jest.fn();
    const user = userEvent.setup();

    render(<ChatHeader onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
