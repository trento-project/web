// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { PromptComposer } from './PromptComposer';

jest.mock('@assistant-ui/react', () => ({
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

describe('PromptComposer', () => {
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
      render(<PromptComposer connectionStatus={status} />);
      expect(screen.getByPlaceholderText(placeholder)).toBeVisible();
    }
  );

  it('disables the input and the send button when not connected', () => {
    render(<PromptComposer connectionStatus="disconnected" />);
    expect(screen.getByLabelText('Message input')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
  });

  it('enables the input and the send button when connected', () => {
    render(<PromptComposer connectionStatus="connected" />);
    expect(screen.getByLabelText('Message input')).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Send message' })
    ).not.toBeDisabled();
  });

  it('hides the send button while the thread is running', () => {
    render(<PromptComposer connectionStatus="connected" isRunning />);
    expect(screen.queryByRole('button', { name: 'Send message' })).toBeNull();
  });

  it('renders the footnote with the documentation link', () => {
    render(<PromptComposer connectionStatus="connected" />);
    expect(screen.getByText(/AI assistants can make mistakes/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute(
      'href',
      expect.stringContaining('documentation.suse.com')
    );
  });
});
