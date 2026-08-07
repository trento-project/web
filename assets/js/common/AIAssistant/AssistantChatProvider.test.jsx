// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { CONNECTING, CONNECTED } from '@lib/ai/connectionStatus';

import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';
import { WebSocketAIAgent } from '@lib/ai';
import { makeMockSocket } from '@lib/test-utils/phoenixDoubles';
import { SocketContext } from '@common/SocketProvider';
import AssistantChatProvider from './AssistantChatProvider';
import { useStoppedRun } from './StoppedRunProvider';

jest.mock('@assistant-ui/react-ag-ui', () => ({
  useAgUiRuntime: jest.fn(),
}));

// StoppedRunProvider (our own module, rendered for real below) reads the
// thread's last message id off this — that is the answer a stop marks.
// `mock`-prefixed so jest.mock's factory can close over it.
const mockAuiState = { thread: { messages: [{ id: 'message-1' }] } };

jest.mock('@assistant-ui/react', () => ({
  AssistantRuntimeProvider: ({ children }) => <>{children}</>,
  useAui: () => ({}),
  useAuiState: (selector) => selector(mockAuiState),
}));

const modelPayload = { provider: 'googleai', model: 'gemini-2.5-pro' };

// Mounted alongside the tree's children so a test can reach the stopRun
// the provider hands down through StoppedRunProvider, without jest.mock-ing
// our own module. The readout makes the other half of the contract visible:
// whether the stop actually marked the thread's last answer, which is driven
// by what the provider's stop handler returns from the transport.
function StopTrigger() {
  const { stopRun, isMessageStopped } = useStoppedRun();
  return (
    <>
      <button type="button" onClick={stopRun}>
        stop
      </button>
      <span>{isMessageStopped('message-1') ? 'marked' : 'not marked'}</span>
    </>
  );
}

function renderProvider({ socket = makeMockSocket(), ...props } = {}) {
  const runtime = {
    thread: {
      import: jest.fn(),
      cancelRun: jest.fn(),
    },
  };
  useAgUiRuntime.mockImplementation(() => runtime);

  const initialProps = { userID: 42, threadID: 'thread-1', ...props };

  const tree = (nextProps) => (
    <SocketContext.Provider value={socket}>
      <AssistantChatProvider {...nextProps}>
        <div>hi</div>
        <StopTrigger />
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

  it('does not create the agent when no socket is available', () => {
    const { agent } = renderProvider({ socket: null });
    expect(agent()).toBeNull();
  });

  it('does not create the agent when no userID is provided', () => {
    const { socket, agent } = renderProvider({ userID: undefined });
    expect(agent()).toBeNull();
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

  it('clears the runtime when threadID changes so prior messages are wiped', async () => {
    const { rerender, runtime } = renderProvider();
    expect(runtime.thread.import).not.toHaveBeenCalled();

    rerender({ threadID: 'thread-2' });

    await waitFor(() => {
      expect(runtime.thread.import).toHaveBeenCalledWith({ messages: [] });
    });
    // The provider never reaches for the runtime's cancelRun — that path is
    // a confirmed library defect (see StoppedRunProvider). Stop goes through
    // StoppedRunProvider's onStop instead.
    expect(runtime.thread.cancelRun).not.toHaveBeenCalled();
  });

  it('abandons the previous thread on the transport', async () => {
    const { rerender, channel, agent } = renderProvider();
    await waitFor(() => expect(channel()).toBeDefined());
    const abandonThread = jest.spyOn(agent(), 'abandonThread');
    const cancelActiveRun = jest.spyOn(agent(), 'cancelActiveRun');

    rerender({ threadID: 'thread-2' });

    // "New chat" is locked while a run is in flight, so there is never a run
    // to cancel here — but the thread's server-side agent still holds the
    // abandoned conversation, and the transport has to say so.
    await waitFor(() => expect(abandonThread).toHaveBeenCalledTimes(1));
    expect(cancelActiveRun).not.toHaveBeenCalled();
  });

  it('does not give the runtime an onCancel — that path is a confirmed library defect', async () => {
    const { channel, runtimeOptions } = renderProvider();
    await waitFor(() => expect(channel()).toBeDefined());

    expect(runtimeOptions().onCancel).toBeUndefined();
  });

  it('routes Stop through StoppedRunProvider to tear the run down on the transport', async () => {
    const { channel, agent } = renderProvider();
    await waitFor(() => expect(channel()).toBeDefined());
    const cancelActiveRun = jest.spyOn(agent(), 'cancelActiveRun');

    fireEvent.click(screen.getByRole('button', { name: 'stop' }));

    expect(cancelActiveRun).toHaveBeenCalledTimes(1);
  });

  it('marks the answer when the transport reports it tore a run down', async () => {
    const { channel, agent } = renderProvider();
    await waitFor(() => expect(channel()).toBeDefined());
    jest.spyOn(agent(), 'cancelActiveRun').mockReturnValue(true);

    fireEvent.click(screen.getByRole('button', { name: 'stop' }));

    expect(screen.getByText('marked')).toBeVisible();
  });

  it('marks nothing when the transport reports no run was in flight', async () => {
    const { channel, agent } = renderProvider();
    await waitFor(() => expect(channel()).toBeDefined());
    jest.spyOn(agent(), 'cancelActiveRun').mockReturnValue(false);

    fireEvent.click(screen.getByRole('button', { name: 'stop' }));

    expect(screen.getByText('not marked')).toBeVisible();
  });
});
