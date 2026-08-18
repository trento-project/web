// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { UserMessage, AssistantMessage } from './MessageBubble';

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
  // AssistantMessage renders <AgentProgressIndicator> which subscribes via
  // useAuiState((s) => s.message). Default: empty content + no run in flight.
  useAuiState: () => ({ content: [] }),
}));

jest.mock('@assistant-ui/react-markdown', () => ({
  MarkdownTextPrimitive: () => null,
}));

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
});
