// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CONNECTING, CONNECTED } from '@lib/ai/connectionStatus';

import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';
import { WebSocketAIAgent } from '@lib/ai';
import { makeMockSocket } from '@lib/test-utils/phoenixDoubles';
import { SocketContext } from '@common/SocketProvider';
import AssistantChatProvider from './AssistantChatProvider';

jest.mock('@assistant-ui/react-ag-ui', () => ({
  useAgUiRuntime: jest.fn(),
}));

jest.mock('@assistant-ui/react', () => ({
  AssistantRuntimeProvider: ({ children }) => <>{children}</>,
  useAui: () => ({}),
}));

const modelPayload = { provider: 'googleai', model: 'gemini-2.5-pro' };

function renderProvider({ socket = makeMockSocket(), ...props } = {}) {
  const runtime = { thread: { reset: jest.fn() } };
  useAgUiRuntime.mockImplementation(() => runtime);

  const initialProps = { userID: 42, threadID: 'thread-1', ...props };

  const tree = (nextProps) => (
    <SocketContext.Provider value={socket}>
      <AssistantChatProvider {...nextProps}>
        <div>hi</div>
      </AssistantChatProvider>
    </SocketContext.Provider>
  );

  const view = render(tree(initialProps));

  // runtimeOptions, agent, channel are lazy on purpose:
  // Snapshotting any of them to a value would invalidate the post-rerender identity assertions.
  const runtimeOptions = () => useAgUiRuntime.mock.calls.at(-1)[0];

  return {
    ...view,
    socket,
    runtime,
    runtimeOptions,
    agent: () => runtimeOptions().agent,
    channel: (userID = initialProps.userID) =>
      socket.channels.get(`ai_assistant:${userID}`),
    rerender: (nextProps) =>
      view.rerender(tree({ ...initialProps, ...nextProps })),
  };
}

describe('AssistantChatProvider', () => {
  it('renders children inside the runtime provider', () => {
    renderProvider();
    expect(screen.getByText('hi')).toBeVisible();
  });

  it('opens no channel when no socket is available', () => {
    const { agent } = renderProvider({ socket: null });
    expect(agent()).toBeInstanceOf(WebSocketAIAgent);
    expect(agent().channel).toBeNull();
  });

  it('opens no channel when no userID is provided', () => {
    const { socket, agent } = renderProvider({ userID: undefined });
    expect(agent()).toBeInstanceOf(WebSocketAIAgent);
    expect(agent().channel).toBeNull();
    expect(socket.channels.size).toBe(0);
  });

  it('creates the agent, initializes it, and forwards it to useAgUiRuntime', async () => {
    const { socket, agent } = renderProvider({
      userID: 7,
      threadID: 'thread-x',
    });

    await waitFor(() => {
      expect(socket.channels.has('ai_assistant:7')).toBe(true);
    });
    expect(agent()).toBeInstanceOf(WebSocketAIAgent);
    expect(agent().socket).toBe(socket);
  });

  it('disconnects the agent when the provider unmounts', async () => {
    const { unmount, channel, agent } = renderProvider();
    await waitFor(() => expect(channel()).toBeDefined());
    const disconnect = jest.spyOn(agent(), 'disconnect');

    unmount();

    expect(disconnect).toHaveBeenCalled();
  });

  it('forwards onConnectionChange to the agent so the parent can observe transitions', async () => {
    const onConnectionChange = jest.fn();
    const { channel } = renderProvider({ onConnectionChange });
    await waitFor(() => expect(channel()).toBeDefined());

    await act(async () => {
      channel().joinPush.fire('ok');
    });

    expect(onConnectionChange).toHaveBeenCalledWith(CONNECTED);
  });

  it('attaches the callbacks before initializing, so the first transition is not lost', async () => {
    const onConnectionChange = jest.fn();
    const { channel } = renderProvider({ onConnectionChange });

    await waitFor(() => expect(channel()).toBeDefined());

    expect(onConnectionChange).toHaveBeenCalledWith(CONNECTING);
  });

  it('forwards the AI configuration lifecycle callbacks to the agent', async () => {
    const onAIConfigurationCleared = jest.fn();
    const onAIConfigurationCreated = jest.fn();
    const onModelChanged = jest.fn();

    const { channel } = renderProvider({
      onAIConfigurationCleared,
      onAIConfigurationCreated,
      onModelChanged,
    });
    await waitFor(() => expect(channel()).toBeDefined());

    await act(async () => {
      channel().emit('ai_configuration_cleared');
      channel().emit('ai_configuration_created');
      channel().emit('model_changed', modelPayload);
    });

    expect(onAIConfigurationCleared).toHaveBeenCalled();
    expect(onAIConfigurationCreated).toHaveBeenCalled();
    expect(onModelChanged).toHaveBeenCalledWith(modelPayload);
  });

  it('keeps the same agent when the callback identities change', async () => {
    const firstOnModelChanged = jest.fn();
    const secondOnModelChanged = jest.fn();

    const { rerender, channel, agent } = renderProvider({
      onModelChanged: firstOnModelChanged,
    });
    await waitFor(() => expect(channel()).toBeDefined());
    const initialAgent = agent();
    const disconnect = jest.spyOn(initialAgent, 'disconnect');

    rerender({ onModelChanged: secondOnModelChanged });

    expect(agent()).toBe(initialAgent);
    expect(disconnect).not.toHaveBeenCalled();

    // Same agent, but it now routes to the latest closure rather than a stale
    // one.
    await act(async () => {
      channel().emit('model_changed', modelPayload);
    });
    expect(secondOnModelChanged).toHaveBeenCalledWith(modelPayload);
    expect(firstOnModelChanged).not.toHaveBeenCalled();
  });

  it('rebuilds the agent when the socket or userID changes', async () => {
    const { rerender, socket, channel, agent } = renderProvider();
    await waitFor(() => expect(channel()).toBeDefined());
    const firstAgent = agent();
    const disconnect = jest.spyOn(firstAgent, 'disconnect');

    rerender({ userID: 43 });

    await waitFor(() => expect(agent()).not.toBe(firstAgent));
    expect(disconnect).toHaveBeenCalled();
    expect(socket.channels.has('ai_assistant:43')).toBe(true);
  });

  it('updates agent.threadId when threadID changes without rebuilding the agent', async () => {
    const { rerender, agent } = renderProvider();
    await waitFor(() => expect(agent()?.threadId).toBe('thread-1'));
    const initialAgent = agent();

    rerender({ threadID: 'thread-2' });

    await waitFor(() => expect(agent().threadId).toBe('thread-2'));
    expect(agent()).toBe(initialAgent);
  });

  it('resets the runtime when threadID changes so prior messages are wiped', async () => {
    const { rerender, runtime } = renderProvider();
    expect(runtime.thread.reset).not.toHaveBeenCalled();

    rerender({ threadID: 'thread-2' });

    await waitFor(() => {
      expect(runtime.thread.reset).toHaveBeenCalledTimes(1);
    });
  });
});
