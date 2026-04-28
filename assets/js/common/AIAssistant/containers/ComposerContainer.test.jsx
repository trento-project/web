import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useAIConnectionStatus } from '../AssistantChatProvider';
import { ComposerContainer } from './ComposerContainer';

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

describe('ComposerContainer', () => {
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
      render(<ComposerContainer />);
      expect(screen.getByPlaceholderText(placeholder)).toBeVisible();
    }
  );

  it('disables the input and the send button when not connected', () => {
    useAIConnectionStatus.mockReturnValue('disconnected');
    render(<ComposerContainer />);
    expect(screen.getByLabelText('Message input')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
  });

  it('enables the input and the send button when connected', () => {
    useAIConnectionStatus.mockReturnValue('connected');
    render(<ComposerContainer />);
    expect(screen.getByLabelText('Message input')).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Send message' })
    ).not.toBeDisabled();
  });

  it('hides the send button while the thread is running', () => {
    useAIConnectionStatus.mockReturnValue('connected');
    mockIsRunning = true;
    render(<ComposerContainer />);
    expect(screen.queryByRole('button', { name: 'Send message' })).toBeNull();
  });
});
