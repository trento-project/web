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
    Parts: () => <span data-testid="parts">parts</span>,
    Error: ({ children }) => <div data-testid="error-slot">{children}</div>,
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
    expect(screen.getByTestId('parts')).toBeVisible();
  });

  it('does not render the assistant-only error slot', () => {
    render(<UserMessage />);
    expect(screen.queryByTestId('error-slot')).not.toBeInTheDocument();
  });
});

describe('AssistantMessage', () => {
  it('renders the assistant message bubble with the parts and error slots', () => {
    const { container } = render(<AssistantMessage />);

    expect(
      container.querySelector('[data-role="assistant"]')
    ).toBeInTheDocument();
    expect(screen.getByTestId('parts')).toBeVisible();
    expect(screen.getByTestId('error-slot')).toBeInTheDocument();
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
