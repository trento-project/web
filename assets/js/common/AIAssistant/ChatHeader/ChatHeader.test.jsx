// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ChatHeader from './ChatHeader';

const defaults = {
  connectionStatus: 'connected',
  onNewChat: () => {},
  onClose: () => {},
};

describe('ChatHeader', () => {
  it.each([
    { status: 'connected', text: 'Online' },
    { status: 'connecting', text: 'Connecting...' },
    { status: 'disconnected', text: 'Offline' },
  ])('renders the $text label for $status', ({ status, text }) => {
    render(<ChatHeader {...defaults} connectionStatus={status} />);
    expect(screen.getByText(text)).toBeVisible();
    expect(screen.getByText('Liz')).toBeVisible();
  });

  it('falls back to the disconnected label for an unknown status', () => {
    render(<ChatHeader {...defaults} connectionStatus="unknown" />);
    expect(screen.getByText('Offline')).toBeVisible();
  });

  it('shows Liz as Offline when the AI configuration was cleared, even while connected', () => {
    render(
      <ChatHeader {...defaults} connectionStatus="connected" status="cleared" />
    );
    expect(screen.getByText('Offline')).toBeVisible();
  });

  it.each([
    { status: 'ok', text: 'Online' },
    { status: 'restored', text: 'Online' },
  ])(
    'follows the connection status ($text) when the configuration is $status',
    ({ status, text }) => {
      render(
        <ChatHeader
          {...defaults}
          connectionStatus="connected"
          status={status}
        />
      );
      expect(screen.getByText(text)).toBeVisible();
    }
  );

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

  it('stops pointer-down propagation on the buttons so the drag handle does not trigger', () => {
    const user = userEvent.setup();
    const parentPointerDown = jest.fn();
    render(
      <div onPointerDown={parentPointerDown}>
        <ChatHeader {...defaults} />
      </div>
    );

    user.click(screen.getByRole('button', { name: 'New chat' }));
    user.click(screen.getByRole('button', { name: 'Close' }));

    expect(parentPointerDown).not.toHaveBeenCalled();
  });

  it('marks the bar as a drag handle so the surrounding modal can be dragged', () => {
    const { container } = render(<ChatHeader {...defaults} />);
    expect(container.firstChild).toHaveClass('drag-handle');
  });
});
