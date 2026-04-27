import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AIAssistant from './AIAssistant';
import { HttpAgent } from '@ag-ui/client';

const mockRun = jest.fn().mockReturnValue({
  subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
});

jest.mock('@ag-ui/client', () => ({
  HttpAgent: jest.fn().mockImplementation(() => ({
    run: mockRun,
    subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
  })),
}));

jest.mock('react-rnd', () => ({
  Rnd: ({ children }) => <div data-testid="rnd-mock">{children}</div>,
}));

describe('AIAssistant', () => {
  beforeEach(() => {
    HttpAgent.mockClear();
    mockRun.mockClear();
  });

  const setupAndOpen = async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    const trigger = screen.getByTestId('ai-assistant-trigger');
    await user.click(trigger);
    return { user, trigger };
  };

  it('clicking on the trigger opens/closes the ai assistant modal', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);

    // initially not open
    expect(screen.queryByText('Liz')).not.toBeInTheDocument();

    // click trigger to open
    const trigger = screen.getByTestId('ai-assistant-trigger');
    await user.click(trigger);
    expect(screen.getByText('Liz')).toBeInTheDocument();

    // click trigger again to close
    await user.click(trigger);
    await waitFor(() => {
      expect(screen.queryByText('Liz')).not.toBeInTheDocument();
    });
  });

  it('clicking on the close icon closes the ai assistant modal', async () => {
    const { user } = await setupAndOpen();

    // modal is open
    expect(screen.getByText('Liz')).toBeInTheDocument();

    // click close icon
    const closeBtn = screen.getByLabelText('Close');
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Liz')).not.toBeInTheDocument();
    });
  });

  it('when the thread is empty, the send button should be disabled', async () => {
    await setupAndOpen();

    const sendBtn = screen.getByLabelText('Send message');
    expect(sendBtn).toBeDisabled();
  });

  it('writing a prompt should enable the send button and clicking that button triggers a function call', async () => {
    const { user } = await setupAndOpen();

    const sendBtn = screen.getByLabelText('Send message');
    expect(sendBtn).toBeDisabled();

    // Type a prompt
    const input = screen.getByLabelText('Message input');
    await user.type(input, 'Hello AI');

    expect(sendBtn).not.toBeDisabled();

    // Click send
    await user.click(sendBtn);

    // Verify it triggers HttpAgent run mock
    await waitFor(() => {
      expect(mockRun).toHaveBeenCalled();
    });

    const runArgs = mockRun.mock.calls[0][0];
    expect(runArgs.messages[0].content[0].text).toBe('Hello AI');
  });

  it('clicking on "New chat" starts a new chat', async () => {
    const { user } = await setupAndOpen();

    // Type and send a message to make it a non-empty thread
    const input = screen.getByLabelText('Message input');
    await user.type(input, 'This is an existing chat');
    const sendBtn = screen.getByLabelText('Send message');
    await user.click(sendBtn);

    // Thread is not empty anymore (sendBtn is enabled/not disabled when we type, but then it clears or disables on send)
    await waitFor(() => {
      expect(mockRun).toHaveBeenCalled();
    });

    // Mock HttpAgent receives the new thread ID when a new instance is created
    const originalThreadId = HttpAgent.mock.calls[0][0].threadId;

    // Click "New chat"
    const newChatBtn = screen.getByText('New chat');
    await user.click(newChatBtn);

    // Verify a new HttpAgent instance is created with a different threadId
    await waitFor(() => {
      expect(HttpAgent.mock.calls.length).toBeGreaterThan(1);
    });

    const newThreadId =
      HttpAgent.mock.calls[HttpAgent.mock.calls.length - 1][0].threadId;
    expect(newThreadId).not.toBe(originalThreadId);

    // Check if send button is disabled again (empty thread state)
    const newSendBtn = screen.getByLabelText('Send message');
    expect(newSendBtn).toBeDisabled();
  });
});
