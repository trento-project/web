// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useAuiState } from '@assistant-ui/react';
import { useActionBarCopy, useActionBarReload } from '@assistant-ui/core/react';
import { UserMessage, AssistantMessage } from './MessageBubble';

jest.mock('copy-to-clipboard', () => jest.fn());

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
  ActionBarPrimitive: {
    Root: ({ children, ...props }) => <div {...props}>{children}</div>,
    Reload: ({ children }) => children,
  },
  useAuiState: jest.fn(),
}));

jest.mock('@assistant-ui/core/react', () => ({
  useActionBarCopy: jest.fn(),
  useActionBarReload: jest.fn(),
}));

jest.mock('@assistant-ui/react-markdown', () => ({
  MarkdownTextPrimitive: () => null,
}));

const mockAssistantMessage = (overrides = {}) => {
  const message = {
    content: [],
    id: 'message-1',
    isLast: true,
    status: { type: 'complete', reason: 'unknown' },
    ...overrides,
  };
  useAuiState.mockImplementation((selector) => selector({ message }));
};

const mockCopyableReply = (copyable) => {
  useActionBarCopy.mockReturnValue({
    copy: jest.fn(),
    disabled: !copyable,
    isCopied: false,
  });
};

const copyButton = () =>
  screen.queryByRole('button', { name: 'copy to clipboard' });

const retryButton = () => screen.queryByRole('button', { name: 'retry' });

const mockReloadableReply = (reloadable) => {
  useActionBarReload.mockReturnValue({
    reload: jest.fn(),
    disabled: !reloadable,
  });
};

beforeEach(() => {
  mockCopyableReply(false);
  mockReloadableReply(true);
});

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

  it('does not allow copying user messages', () => {
    mockCopyableReply(true);

    render(<UserMessage />);

    expect(copyButton()).not.toBeInTheDocument();
  });
});

describe('AssistantMessage', () => {
  beforeEach(() => mockAssistantMessage());

  it('renders the assistant message bubble with the parts and error slots', () => {
    const { container } = render(<AssistantMessage />);

    expect(
      container.querySelector('[data-role="assistant"]')
    ).toBeInTheDocument();
    expect(screen.getByText('message parts')).toBeVisible();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('omits the user-only "You" label', () => {
    render(<AssistantMessage />);
    expect(screen.queryByText('You')).toBeNull();
  });

  it('shows the agent progress indicator while a run is in flight', () => {
    render(<AssistantMessage isRunning />);
    expect(screen.getByRole('status')).toHaveTextContent('Thinking...');
  });

  it('names the tool the agent is calling', () => {
    mockAssistantMessage({
      content: [{ type: 'tool-call', toolName: 'get_hosts' }],
    });

    render(<AssistantMessage isRunning />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Calling get_hosts...'
    );
  });

  it('marks an answer the user stopped', () => {
    mockAssistantMessage({
      status: { type: 'incomplete', reason: 'cancelled' },
    });

    render(<AssistantMessage />);

    expect(screen.getByRole('status')).toHaveTextContent('Response stopped.');
  });

  it('allows copying an assistant reply', () => {
    mockCopyableReply(true);

    render(<AssistantMessage />);

    expect(copyButton()).toBeVisible();
  });

  it('keeps the copy action out of the way while the reply is still coming', () => {
    render(<AssistantMessage isRunning />);

    expect(copyButton()).not.toBeInTheDocument();
  });

  it('allows retrying the latest assistant reply', () => {
    render(<AssistantMessage />);

    expect(retryButton()).toBeVisible();
  });

  it('does not allow retrying an earlier reply', () => {
    mockAssistantMessage({ isLast: false });

    render(<AssistantMessage />);

    expect(retryButton()).not.toBeInTheDocument();
  });
});
