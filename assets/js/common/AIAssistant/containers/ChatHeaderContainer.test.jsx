import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { useAui } from '@assistant-ui/react';

import { useAIConnectionStatus } from '../AssistantChatProvider';
import { ChatHeaderContainer } from './ChatHeaderContainer';

jest.mock('@assistant-ui/react', () => ({
  useAui: jest.fn(),
}));

jest.mock('../AssistantChatProvider', () => ({
  useAIConnectionStatus: jest.fn(),
}));

describe('ChatHeaderContainer', () => {
  it('passes the current connection status to the header', () => {
    useAui.mockReturnValue({
      threads: () => ({ switchToNewThread: jest.fn() }),
    });
    useAIConnectionStatus.mockReturnValue('connecting');

    render(<ChatHeaderContainer onClose={() => {}} />);

    expect(screen.getByText('Connecting...')).toBeVisible();
  });

  it('calls aui.threads().switchToNewThread when the "New chat" button is clicked', async () => {
    const switchToNewThread = jest.fn();
    useAui.mockReturnValue({ threads: () => ({ switchToNewThread }) });
    useAIConnectionStatus.mockReturnValue('connected');
    const user = userEvent.setup();

    render(<ChatHeaderContainer onClose={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'New chat' }));

    expect(switchToNewThread).toHaveBeenCalledTimes(1);
  });

  it('forwards onClose to the close button', async () => {
    useAui.mockReturnValue({
      threads: () => ({ switchToNewThread: jest.fn() }),
    });
    useAIConnectionStatus.mockReturnValue('connected');
    const onClose = jest.fn();
    const user = userEvent.setup();

    render(<ChatHeaderContainer onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
