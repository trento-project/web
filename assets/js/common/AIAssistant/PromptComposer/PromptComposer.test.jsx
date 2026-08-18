// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CONNECTED, CONNECTING, DISCONNECTED } from '@lib/ai';

import { OK, CLEARED, RESTORED } from '../status';
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
    { status: CONNECTED, placeholder: 'How can I help you?' },
    { status: CONNECTING, placeholder: 'Connecting...' },
    {
      status: DISCONNECTED,
      placeholder: 'Offline - waiting to reconnect...',
    },
    { status: 'unknown', placeholder: 'Offline - waiting to reconnect...' },
  ])(
    'uses the $placeholder placeholder when status is $status',
    ({ status, placeholder }) => {
      render(<PromptComposer connectionStatus={status} />);
      expect(screen.getByPlaceholderText(placeholder)).toBeVisible();
    }
  );

  it.each([
    { configurationStatus: CLEARED, placeholder: 'AI Assistant is disabled' },
    {
      configurationStatus: RESTORED,
      placeholder: 'Start a new chat to continue',
    },
    {
      configurationStatus: 'unknown',
      placeholder: 'AI Assistant is disabled',
    },
  ])(
    'uses the $placeholder placeholder when the configuration is $configurationStatus',
    ({ configurationStatus, placeholder }) => {
      render(
        <PromptComposer
          connectionStatus={CONNECTED}
          configurationStatus={configurationStatus}
        />
      );
      expect(screen.getByPlaceholderText(placeholder)).toBeVisible();
    }
  );

  it.each([
    { connectionStatus: CONNECTING, configurationStatus: OK },
    { connectionStatus: DISCONNECTED, configurationStatus: OK },
    // Online, but there is nothing configured to answer with.
    { connectionStatus: CONNECTED, configurationStatus: CLEARED },
    // Online and configured, but this thread belongs to the old configuration.
    { connectionStatus: CONNECTED, configurationStatus: RESTORED },
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
    render(<PromptComposer connectionStatus={CONNECTED} />);
    expect(screen.getByLabelText('Message input')).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Send message' })
    ).not.toBeDisabled();
  });

  it.each([
    {
      connectionStatus: DISCONNECTED,
      configurationStatus: OK,
      title: 'Offline - waiting to reconnect...',
    },
    {
      connectionStatus: CONNECTED,
      configurationStatus: CLEARED,
      title: 'AI Assistant is disabled',
    },
    {
      connectionStatus: CONNECTED,
      configurationStatus: RESTORED,
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
    render(<PromptComposer connectionStatus={CONNECTED} isRunning />);
    expect(screen.queryByRole('button', { name: 'Send message' })).toBeNull();
  });

  it('renders the footnote with the documentation link', () => {
    render(<PromptComposer connectionStatus={CONNECTED} />);
    expect(screen.getByText(/AI assistants can make mistakes/)).toBeVisible();

    const learnMoreLink = screen.getByRole('link', { name: 'Learn more' });

    expect(learnMoreLink).toHaveAttribute(
      'href',
      expect.stringContaining('documentation.suse.com')
    );
    expect(learnMoreLink).toHaveAttribute('target', '_blank');
  });
});
