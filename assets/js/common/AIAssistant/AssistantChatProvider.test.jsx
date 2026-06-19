// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';
import * as agentModule from '@lib/ai';
import { useSocket } from '@common/SocketProvider';
import AssistantChatProvider from './AssistantChatProvider';

jest.mock('@common/SocketProvider', () => ({
  useSocket: jest.fn(),
}));

jest.mock('@assistant-ui/react-ag-ui', () => ({
  useAgUiRuntime: jest.fn(),
}));

jest.mock('@assistant-ui/react', () => ({
  AssistantRuntimeProvider: ({ children }) => <>{children}</>,
  useAui: () => ({}),
}));

jest.mock('@lib/ai', () => {
  const instances = [];
  class WebSocketAIAgent {
    constructor(opts) {
      this.opts = opts;
      this.initialize = jest.fn(() => Promise.resolve());
      this.disconnect = jest.fn();
      instances.push(this);
    }
  }
  return {
    WebSocketAIAgent,
    __getInstances: () => instances,
    __resetInstances: () => {
      instances.length = 0;
    },
  };
});

const lastRuntimeOptions = () =>
  useAgUiRuntime.mock.calls[useAgUiRuntime.mock.calls.length - 1][0];

let fakeSocket;
let runtimeStub;

beforeEach(() => {
  agentModule.__resetInstances();
  jest.clearAllMocks();

  runtimeStub = { thread: { reset: jest.fn() } };
  useAgUiRuntime.mockImplementation(() => runtimeStub);

  fakeSocket = {
    channel: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  };
  useSocket.mockReturnValue(fakeSocket);
});

const renderProvider = (
  props = {},
  children = <div data-testid="child">hi</div>
) =>
  render(
    <AssistantChatProvider userID={42} threadID="thread-1" {...props}>
      {children}
    </AssistantChatProvider>
  );

describe('AssistantChatProvider', () => {
  it('renders children inside the runtime provider', () => {
    renderProvider();
    expect(screen.getByTestId('child')).toBeVisible();
  });

  it('does not create the agent when no socket is available', () => {
    useSocket.mockReturnValue(null);
    renderProvider();
    expect(lastRuntimeOptions().agent).toBeNull();
    expect(agentModule.__getInstances()).toHaveLength(0);
  });

  it('does not create the agent when no userID is provided', () => {
    renderProvider({ userID: undefined });
    expect(lastRuntimeOptions().agent).toBeNull();
    expect(agentModule.__getInstances()).toHaveLength(0);
  });

  it('creates the agent and forwards it to useAgUiRuntime when userID and socket are present', async () => {
    renderProvider({ userID: 7, threadID: 'thread-x' });

    await waitFor(() => {
      expect(agentModule.__getInstances()).toHaveLength(1);
    });
    const [agent] = agentModule.__getInstances();
    expect(agent.opts.userID).toBe(7);
    // threadID is NOT passed at construction — it's a per-message field
    // forwarded inside run({messages, threadId}) at call time.
    expect(agent.opts.threadId).toBeUndefined();
    expect(agent.opts.socket).toBe(fakeSocket);
    expect(lastRuntimeOptions().agent).toBe(agent);
  });

  it('does not pass a threadList adapter to the runtime', () => {
    renderProvider();
    expect(lastRuntimeOptions().adapters).toBeUndefined();
  });

  it('initializes the agent after construction', async () => {
    renderProvider();
    await waitFor(() => {
      expect(agentModule.__getInstances()[0].initialize).toHaveBeenCalled();
    });
  });

  it('disconnects the agent when the provider unmounts', async () => {
    const { unmount } = renderProvider();
    await waitFor(() => expect(agentModule.__getInstances()).toHaveLength(1));
    const [agent] = agentModule.__getInstances();

    unmount();
    expect(agent.disconnect).toHaveBeenCalled();
  });

  it('forwards onConnectionChange to the agent so the parent can observe transitions', async () => {
    const onConnectionChange = jest.fn();
    renderProvider({ onConnectionChange });
    await waitFor(() => expect(agentModule.__getInstances()).toHaveLength(1));
    const [agent] = agentModule.__getInstances();

    expect(agent.opts.onConnectionChange).toBe(onConnectionChange);

    act(() => agent.opts.onConnectionChange('connected'));
    expect(onConnectionChange).toHaveBeenCalledWith('connected');
  });

  it('updates agent.threadId when threadID changes without rebuilding the agent', async () => {
    const { rerender } = render(
      <AssistantChatProvider userID={42} threadID="thread-1">
        <div />
      </AssistantChatProvider>
    );
    await waitFor(() => expect(agentModule.__getInstances()).toHaveLength(1));
    const [agent] = agentModule.__getInstances();
    await waitFor(() => expect(agent.threadId).toBe('thread-1'));

    rerender(
      <AssistantChatProvider userID={42} threadID="thread-2">
        <div />
      </AssistantChatProvider>
    );

    await waitFor(() => expect(agent.threadId).toBe('thread-2'));
    expect(agentModule.__getInstances()).toHaveLength(1);
    expect(agent.disconnect).not.toHaveBeenCalled();
  });

  it('does not reset the runtime on the first mount', () => {
    renderProvider();
    expect(runtimeStub.thread.reset).not.toHaveBeenCalled();
  });

  it('resets the runtime when threadID changes so prior messages are wiped', async () => {
    const { rerender } = render(
      <AssistantChatProvider userID={42} threadID="thread-1">
        <div />
      </AssistantChatProvider>
    );
    expect(runtimeStub.thread.reset).not.toHaveBeenCalled();

    rerender(
      <AssistantChatProvider userID={42} threadID="thread-2">
        <div />
      </AssistantChatProvider>
    );

    await waitFor(() => {
      expect(runtimeStub.thread.reset).toHaveBeenCalledTimes(1);
    });
  });
});
