// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import PromptComposer from './PromptComposer';

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

  it.each([
    { configurationStatus: 'cleared', placeholder: 'AI Assistant is disabled' },
    {
      configurationStatus: 'restored',
      placeholder: 'Start a new chat to continue',
    },
  ])(
    'uses the $placeholder placeholder when the configuration is $configurationStatus',
    ({ configurationStatus, placeholder }) => {
      render(
        <PromptComposer
          connectionStatus="connected"
          configurationStatus={configurationStatus}
        />
      );
      expect(screen.getByPlaceholderText(placeholder)).toBeVisible();
    }
  );

  it.each([
    { connectionStatus: 'connecting', configurationStatus: 'ok' },
    { connectionStatus: 'disconnected', configurationStatus: 'ok' },
    // Online, but there is nothing configured to answer with.
    { connectionStatus: 'connected', configurationStatus: 'cleared' },
    // Online and configured, but this thread belongs to the old configuration.
    { connectionStatus: 'connected', configurationStatus: 'restored' },
  ])(
    'disables the input and the send button when $connectionStatus and the configuration is $configurationStatus',
    ({ connectionStatus, configurationStatus }) => {
      render(
        <PromptComposer
          connectionStatus={connectionStatus}
          configurationStatus={configurationStatus}
        />
      );
      expect(screen.getByLabelText('Message input')).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Send message' })
      ).toBeDisabled();
    }
  );

  it('enables the input and the send button when connected with an ok configuration', () => {
    render(<PromptComposer connectionStatus="connected" />);
    expect(screen.getByLabelText('Message input')).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Send message' })
    ).not.toBeDisabled();
  });

  it.each([
    {
      connectionStatus: 'disconnected',
      configurationStatus: 'ok',
      title: 'Offline - waiting to reconnect...',
    },
    {
      connectionStatus: 'connected',
      configurationStatus: 'cleared',
      title: 'AI Assistant is disabled',
    },
    {
      connectionStatus: 'connected',
      configurationStatus: 'restored',
      title: 'Start a new chat to continue',
    },
  ])(
    'explains why sending is off with "$title"',
    ({ connectionStatus, configurationStatus, title }) => {
      render(
        <PromptComposer
          connectionStatus={connectionStatus}
          configurationStatus={configurationStatus}
        />
      );
      expect(
        screen.getByRole('button', { name: 'Send message' })
      ).toHaveAttribute('title', title);
    }
  );

  it('hides the send button while the thread is running', () => {
    render(<PromptComposer connectionStatus="connected" isRunning />);
    expect(screen.queryByRole('button', { name: 'Send message' })).toBeNull();
  });

  it('renders the footnote with the documentation link', () => {
    render(<PromptComposer connectionStatus="connected" />);
    expect(screen.getByText(/AI assistants can make mistakes/)).toBeVisible();

    const learnMoreLink = screen.getByRole('link', { name: 'Learn more' });

    expect(learnMoreLink).toHaveAttribute(
      'href',
      expect.stringContaining('documentation.suse.com')
    );
    expect(learnMoreLink).toHaveAttribute('target', '_blank');
  });
});
