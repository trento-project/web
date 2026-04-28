import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

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
    CONNECTION_STATUS: Object.freeze({
      CONNECTED: 'connected',
      CONNECTING: 'connecting',
      DISCONNECTED: 'disconnected',
    }),
    __getInstances: () => instances,
    __resetInstances: () => {
      instances.length = 0;
    },
  };
});

import { useSocket } from '@common/SocketProvider';
import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';
import * as agentModule from '@lib/ai';
import {
  AssistantChatProvider,
  useAIConnectionStatus,
} from './AssistantChatProvider';

const mockStore = configureStore([]);

function StatusProbe() {
  const status = useAIConnectionStatus();
  return <div data-testid="status">{status}</div>;
}

function renderWithProvider(store, children = <StatusProbe />) {
  return render(
    <Provider store={store}>
      <AssistantChatProvider>{children}</AssistantChatProvider>
    </Provider>
  );
}

const lastRuntimeOptions = () =>
  useAgUiRuntime.mock.calls[useAgUiRuntime.mock.calls.length - 1][0];

const userStore = (id = 42) => mockStore({ user: { id } });
const guestStore = () => mockStore({ user: {} });

let runtimeStub;
let fakeSocket;

beforeEach(() => {
  agentModule.__resetInstances();
  jest.clearAllMocks();

  runtimeStub = {
    thread: {
      subscribe: jest.fn(() => jest.fn()),
      getState: jest.fn(() => ({ messages: [] })),
    },
  };
  useAgUiRuntime.mockImplementation(() => runtimeStub);

  fakeSocket = {
    channel: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  };
  useSocket.mockReturnValue(fakeSocket);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AssistantChatProvider', () => {
  it('renders children inside the runtime provider', () => {
    renderWithProvider(userStore(), <div data-testid="child">hi</div>);
    expect(screen.getByTestId('child')).toBeVisible();
  });

  it('does not create the agent when no socket is available', () => {
    useSocket.mockReturnValue(null);
    renderWithProvider(userStore());
    expect(lastRuntimeOptions().agent).toBeNull();
    expect(agentModule.__getInstances()).toHaveLength(0);
  });

  it('does not create the agent when there is no user id', () => {
    renderWithProvider(guestStore());
    expect(lastRuntimeOptions().agent).toBeNull();
    expect(agentModule.__getInstances()).toHaveLength(0);
  });

  it('creates the agent and forwards it to useAgUiRuntime when a user id is present', async () => {
    renderWithProvider(userStore(7));

    await waitFor(() => {
      expect(agentModule.__getInstances()).toHaveLength(1);
    });
    const [agent] = agentModule.__getInstances();
    expect(agent.opts.userId).toBe(7);
    expect(agent.opts.socket).toBe(fakeSocket);
    expect(lastRuntimeOptions().agent).toBe(agent);
  });

  it('initializes the agent after construction', async () => {
    renderWithProvider(userStore());
    await waitFor(() => {
      expect(agentModule.__getInstances()[0].initialize).toHaveBeenCalled();
    });
  });

  it('exposes a "disconnected" connection status to consumers by default', () => {
    renderWithProvider(userStore());
    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
  });

  it('updates the connection status when the agent reports a change', async () => {
    renderWithProvider(userStore());
    await waitFor(() => expect(agentModule.__getInstances()).toHaveLength(1));
    const [agent] = agentModule.__getInstances();

    act(() => agent.opts.onConnectionChange('connected'));
    expect(screen.getByTestId('status')).toHaveTextContent('connected');

    act(() => agent.opts.onConnectionChange('disconnected'));
    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
  });

  describe('thread list adapter', () => {
    it('seeds the initial thread id from crypto.randomUUID', () => {
      jest.spyOn(crypto, 'randomUUID').mockReturnValueOnce('initial-thread');
      renderWithProvider(userStore());
      expect(lastRuntimeOptions().adapters.threadList.threadId).toBe(
        'initial-thread'
      );
    });

    it('mints a fresh id and re-passes the new threadList on switch-to-new-thread', async () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValueOnce('thread-A')
        .mockReturnValueOnce('thread-B');

      renderWithProvider(userStore());
      expect(lastRuntimeOptions().adapters.threadList.threadId).toBe(
        'thread-A'
      );

      await act(async () => {
        await lastRuntimeOptions().adapters.threadList.onSwitchToNewThread();
      });

      expect(lastRuntimeOptions().adapters.threadList.threadId).toBe(
        'thread-B'
      );
    });

    it('returns persisted messages when switching back to a known thread', async () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValueOnce('thread-A')
        .mockReturnValueOnce('thread-B');
      runtimeStub.thread.getState.mockReturnValue({ messages: ['m1', 'm2'] });

      renderWithProvider(userStore());

      const subscribeCallback =
        runtimeStub.thread.subscribe.mock.calls[
          runtimeStub.thread.subscribe.mock.calls.length - 1
        ][0];
      act(() => subscribeCallback());

      await act(async () => {
        await lastRuntimeOptions().adapters.threadList.onSwitchToNewThread();
      });

      let result;
      await act(async () => {
        result =
          await lastRuntimeOptions().adapters.threadList.onSwitchToThread(
            'thread-A'
          );
      });
      expect(result).toEqual({ messages: ['m1', 'm2'] });
    });

    it('rejects when switching to an unknown thread', async () => {
      jest.spyOn(crypto, 'randomUUID').mockReturnValueOnce('thread-A');
      renderWithProvider(userStore());

      await expect(
        lastRuntimeOptions().adapters.threadList.onSwitchToThread('nope')
      ).rejects.toThrow('Thread nope not found');
    });
  });
});
