import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  MessageBubbleView,
  UserMessage,
  AssistantMessage,
} from './MessageBubble';

jest.mock('@assistant-ui/react', () => ({
  AuiIf: () => null,
  ErrorPrimitive: {
    Root: ({ children }) => <div>{children}</div>,
    Message: () => <span>Error message</span>,
  },
  MessagePrimitive: {
    Root: ({ children, ...props }) => <div {...props}>{children}</div>,
    Parts: () => <span data-testid="parts">parts</span>,
    Error: ({ children }) => <div data-testid="error-slot">{children}</div>,
  },
  useAuiState: () => ({ content: [] }),
}));

jest.mock('@assistant-ui/react-markdown', () => ({
  MarkdownTextPrimitive: () => null,
}));

describe('MessageBubbleView', () => {
  it('renders the "You" label and the user bubble background for the user role', () => {
    const { container } = render(
      <MessageBubbleView variant="user">Hello</MessageBubbleView>
    );
    expect(screen.getByText('You')).toBeVisible();
    expect(container.firstChild).toHaveClass('bg-[#e8f5ef]');
    expect(screen.getByText('Hello')).toBeVisible();
  });

  it('renders the assistant bubble without the "You" label', () => {
    const { container } = render(
      <MessageBubbleView variant="assistant">Sure!</MessageBubbleView>
    );
    expect(screen.queryByText('You')).toBeNull();
    expect(container.firstChild).toHaveClass('bg-white');
    expect(screen.getByText('Sure!')).toBeVisible();
  });

  it('falls back to the assistant style for an unknown role', () => {
    const { container } = render(
      <MessageBubbleView variant="other">x</MessageBubbleView>
    );
    expect(container.firstChild).toHaveClass('bg-white');
    expect(screen.queryByText('You')).toBeNull();
  });

  it('renders rich children inside the bubble', () => {
    render(
      <MessageBubbleView variant="assistant">
        <p>Step 1.</p>
        <p>Step 2.</p>
      </MessageBubbleView>
    );
    expect(screen.getByText('Step 1.')).toBeVisible();
    expect(screen.getByText('Step 2.')).toBeVisible();
  });
});

describe('UserMessage', () => {
  it('renders the user bubble with the parts slot', () => {
    const { container } = render(<UserMessage />);
    expect(container.querySelector('[data-role="user"]')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeVisible();
    expect(screen.getByTestId('parts')).toBeVisible();
  });
});

describe('AssistantMessage', () => {
  it('renders the assistant bubble with the parts and error slots', () => {
    const { container } = render(<AssistantMessage />);
    expect(
      container.querySelector('[data-role="assistant"]')
    ).toBeInTheDocument();
    expect(screen.queryByText('You')).toBeNull();
    expect(screen.getByTestId('parts')).toBeVisible();
    expect(screen.getByTestId('error-slot')).toBeInTheDocument();
  });
});
