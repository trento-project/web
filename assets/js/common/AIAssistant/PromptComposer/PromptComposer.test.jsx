import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useAIConnectionStatus } from '../AssistantChatProvider';
import { PromptComposer, PromptComposerView } from './PromptComposer';

let mockIsRunning = false;

jest.mock('@assistant-ui/react', () => ({
  AuiIf: ({ children, condition }) =>
    condition({ thread: { isRunning: mockIsRunning } }) ? children : null,
  ComposerPrimitive: {
    Root: ({ children, ...props }) => <form {...props}>{children}</form>,
    AttachmentDropzone: ({ children, ...props }) => (
      <div {...props}>{children}</div>
    ),
    Input: ({ disabled, placeholder, ...props }) => (
      <textarea disabled={disabled} placeholder={placeholder} {...props} />
    ),
    Send: ({ children }) => children,
  },
}));

jest.mock('../AssistantChatProvider', () => ({
  useAIConnectionStatus: jest.fn(),
}));

describe('PromptComposerView', () => {
  it('renders the inputSlot inside the input region', () => {
    render(
      <PromptComposerView
        inputSlot={<textarea aria-label="composer-input" />}
        actionSlot={<button type="submit">Send</button>}
      />
    );
    expect(screen.getByLabelText('composer-input')).toBeVisible();
  });

  it('renders the actionSlot in the footer row when provided', () => {
    render(
      <PromptComposerView
        inputSlot={<textarea aria-label="composer-input" />}
        actionSlot={<button type="submit">Send</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Send' })).toBeVisible();
  });

  it('omits the actionSlot when none is provided', () => {
    render(
      <PromptComposerView
        inputSlot={<textarea aria-label="composer-input" />}
      />
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders the default footnote with the documentation link', () => {
    render(
      <PromptComposerView
        inputSlot={<textarea aria-label="composer-input" />}
      />
    );
    expect(screen.getByText(/AI assistants can make mistakes/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute(
      'href',
      expect.stringContaining('documentation.suse.com')
    );
  });

  it('renders a custom footnote when provided', () => {
    render(
      <PromptComposerView
        inputSlot={<textarea aria-label="composer-input" />}
        footnote={<span>Custom note.</span>}
      />
    );
    expect(screen.getByText('Custom note.')).toBeVisible();
    expect(screen.queryByText(/AI assistants can make mistakes/)).toBeNull();
  });
});

describe('PromptComposer', () => {
  beforeEach(() => {
    mockIsRunning = false;
  });

  it.each([
    { status: 'connected', placeholder: 'How can I help you?' },
    { status: 'connecting', placeholder: 'Connecting...' },
    {
      status: 'disconnected',
      placeholder: 'Offline - waiting to reconnect...',
    },
  ])(
    'uses the $placeholder placeholder when status is $status',
    ({ status, placeholder }) => {
      useAIConnectionStatus.mockReturnValue(status);
      render(<PromptComposer />);
      expect(screen.getByPlaceholderText(placeholder)).toBeVisible();
    }
  );

  it('disables the input and the send button when not connected', () => {
    useAIConnectionStatus.mockReturnValue('disconnected');
    render(<PromptComposer />);
    expect(screen.getByLabelText('Message input')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
  });

  it('enables the input and the send button when connected', () => {
    useAIConnectionStatus.mockReturnValue('connected');
    render(<PromptComposer />);
    expect(screen.getByLabelText('Message input')).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Send message' })
    ).not.toBeDisabled();
  });

  it('hides the send button while the thread is running', () => {
    useAIConnectionStatus.mockReturnValue('connected');
    mockIsRunning = true;
    render(<PromptComposer />);
    expect(screen.queryByRole('button', { name: 'Send message' })).toBeNull();
  });
});
