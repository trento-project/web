// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
} from '@assistant-ui/react';

import { renderWithRouter } from '@lib/test-utils';
import { CONNECTED, DISCONNECTED } from '@lib/ai';

import AssistantThread from './AssistantThread';
import { OK, CLEARED, RESTORED } from './status';

// Drives the real ThreadPrimitive off assistant-ui's external store rather
// so the viewport, the message render prop and the composer are all the production ones.
function ThreadWithStubbedProvider({ messages, ...props }) {
  const runtime = useExternalStoreRuntime({
    isRunning: false,
    messages,
    convertMessage: (message) => message,
    onNew: async () => {},
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantThread {...props} />
    </AssistantRuntimeProvider>
  );
}

const renderThread = ({ messages = [], ...props } = {}) =>
  renderWithRouter(
    <ThreadWithStubbedProvider
      connectionStatus={CONNECTED}
      configurationStatus={OK}
      messages={messages}
      {...props}
    />
  );

const composer = () => screen.getByLabelText('Message input');
const newChat = () => screen.getByRole('button', { name: 'New chat' });
const banner = () => screen.queryByRole('alert');

describe('AssistantThread', () => {
  it('greets on an empty thread', () => {
    renderThread({ isEmpty: true });

    expect(screen.getByText("Hi, I'm Liz.")).toBeVisible();
  });

  it('drops the greeting once the thread has messages', () => {
    renderThread({
      isEmpty: false,
      messages: [{ id: 'm1', role: 'user', content: 'ping' }],
    });

    expect(screen.queryByText("Hi, I'm Liz.")).not.toBeInTheDocument();
  });

  it('renders user and assistant turns in their own bubbles', () => {
    renderThread({
      messages: [
        { id: 'm1', role: 'user', content: 'ping' },
        { id: 'm2', role: 'assistant', content: 'pong' },
      ],
    });

    const userBubble = within(document.querySelector('[data-role="user"]'));
    const assistantBubble = within(
      document.querySelector('[data-role="assistant"]')
    );

    expect(userBubble.getByText('ping')).toBeVisible();
    expect(assistantBubble.getByText('pong')).toBeVisible();
    // The "You" label is what tells the two bubble variants apart
    expect(userBubble.getByText('You')).toBeVisible();
    expect(assistantBubble.queryByText('You')).not.toBeInTheDocument();
  });

  it('shows no banner while the configuration is intact', () => {
    renderThread({ configurationStatus: OK });

    expect(banner()).not.toBeInTheDocument();
    expect(composer()).toBeEnabled();
  });

  it('goes read-only behind a Profile link when the configuration was cleared', () => {
    renderThread({ configurationStatus: CLEARED });

    expect(banner()).toHaveTextContent(
      /Your AI settings were cleared\. This conversation is now read-only\./
    );
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'href',
      '/profile'
    );
    expect(composer()).toBeDisabled();
  });

  it('keeps a restored configuration read-only until a new chat is started', () => {
    renderThread({ configurationStatus: RESTORED });

    expect(banner()).toHaveTextContent(
      /A new AI configuration is available\. Start a new chat to continue\./
    );
    expect(composer()).toBeDisabled();
  });

  it('reports a cleared configuration as offline even while the channel is up', () => {
    renderThread({ connectionStatus: CONNECTED, configurationStatus: CLEARED });

    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(newChat()).toBeDisabled();
  });

  it('stays online on a restored configuration so a new chat can be started', () => {
    renderThread({
      connectionStatus: CONNECTED,
      configurationStatus: RESTORED,
    });

    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(newChat()).toBeEnabled();
  });

  it('locks "New chat" while the assistant is answering', () => {
    renderThread({ isRunning: true });

    expect(newChat()).toBeDisabled();
  });

  it('passes the raw connection status through when the configuration is fine', () => {
    renderThread({ connectionStatus: DISCONNECTED, configurationStatus: OK });

    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(composer()).toBeDisabled();
  });

  it('labels the model-change notice with the provider and dismisses it', async () => {
    const user = userEvent.setup();
    const onDismissModelNotice = jest.fn();
    renderThread({
      modelNotice: { provider: 'googleai', model: 'gemini-2.5-pro' },
      onDismissModelNotice,
    });

    expect(banner()).toHaveTextContent(
      'AI model changed to Google Gemini (gemini-2.5-pro) for this conversation.'
    );

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismissModelNotice).toHaveBeenCalled();
  });

  it('wires the header buttons to the thread callbacks', async () => {
    const user = userEvent.setup();
    const onNewThread = jest.fn();
    const onClose = jest.fn();
    renderThread({ onNewThread, onClose });

    await user.click(newChat());
    await user.click(screen.getByLabelText('Close'));

    expect(onNewThread).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
