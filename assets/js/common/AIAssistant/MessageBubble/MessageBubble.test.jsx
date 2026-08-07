// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { StoppedRunProvider, useStoppedRun } from '../StoppedRunProvider';
import { UserMessage, AssistantMessage } from './MessageBubble';

// AssistantMessage mounts <AgentProgressIndicator> and <StoppedNotice>, each
// with its own useAuiState selector, so the stub has to run the selector
// against one shared state object. `mock`-prefixed so jest.mock's factory can
// close over it. `thread.messages` is what StoppedRunProvider (rendered for
// real below) reads to decide which message id a stop marks.
let mockAuiState = {
  message: { content: [], isLast: true, id: 'message-1' },
  thread: { messages: [{ id: 'message-1' }] },
};

jest.mock('@assistant-ui/react', () => ({
  ErrorPrimitive: {
    Root: ({ children }) => <div>{children}</div>,
    Message: () => <span>Error message</span>,
  },
  MessagePrimitive: {
    Root: ({ children, ...props }) => <div {...props}>{children}</div>,
    Parts: () => <span>message parts</span>,
    // Real primitive renders its children only when the message carries an
    // error. This stub is unconditional, so the tests below can prove the slot is mounted
    Error: ({ children }) => <div>{children}</div>,
  },
  useAuiState: (selector) => selector(mockAuiState),
}));

jest.mock('@assistant-ui/react-markdown', () => ({
  MarkdownTextPrimitive: () => null,
}));

beforeEach(() => {
  mockAuiState = {
    message: { content: [], isLast: true, id: 'message-1' },
    thread: { messages: [{ id: 'message-1' }] },
  };
});

// Stops the thread's last message through the real provider — the same path
// the composer's Stop button uses. Not a jest.mock of our own module.
function StopButton() {
  const { stopRun } = useStoppedRun();
  return (
    <button type="button" onClick={stopRun}>
      stop
    </button>
  );
}

describe('UserMessage', () => {
  it('renders the user message bubble with the "You" label and parts slot', () => {
    const { container } = render(<UserMessage />);

    expect(container.querySelector('[data-role="user"]')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeVisible();
    expect(screen.getByText('message parts')).toBeVisible();
  });

  it('does not render the assistant-only error slot', () => {
    render(<UserMessage />);
    expect(screen.queryByText('Error message')).not.toBeInTheDocument();
  });
});

describe('AssistantMessage', () => {
  it('renders the assistant message bubble with the parts and error slots', () => {
    const { container } = render(<AssistantMessage />);

    expect(
      container.querySelector('[data-role="assistant"]')
    ).toBeInTheDocument();
    expect(screen.getByText('message parts')).toBeVisible();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('omits the user-only "You" label', () => {
    render(<AssistantMessage />);
    expect(screen.queryByText('You')).toBeNull();
  });

  it('shows the agent progress indicator while a run is in flight', () => {
    render(<AssistantMessage isRunning />);
    expect(screen.getByText('Thinking...')).toBeVisible();
  });

  it('marks an answer the user stopped', async () => {
    const user = userEvent.setup();
    render(
      <StoppedRunProvider onStop={() => true}>
        <StopButton />
        <AssistantMessage />
      </StoppedRunProvider>
    );

    await user.click(screen.getByRole('button', { name: 'stop' }));

    expect(screen.getByText('Response stopped.')).toBeVisible();
  });

  it('does not mark an answer as stopped by default', () => {
    render(<AssistantMessage />);

    expect(screen.queryByText('Response stopped.')).not.toBeInTheDocument();
  });

  it('does not mark a message that was never stopped, even mid-run', () => {
    render(<AssistantMessage isRunning />);

    expect(screen.queryByText('Response stopped.')).not.toBeInTheDocument();
  });
});
