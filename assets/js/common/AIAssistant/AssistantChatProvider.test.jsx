import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { useAgUiRuntime } from '@assistant-ui/react-ag-ui';
import * as agentModule from '@lib/ai';
import { useSocket } from '@common/SocketProvider';
import { AssistantChatProvider } from './AssistantChatProvider';
import { useAIConnectionStatus } from './connectionStatusContext';
import { useResetThread } from './resetThreadContext';

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

const mockStore = configureStore([]);

function StatusProbe() {
  const status = useAIConnectionStatus();
  return <div data-testid="status">{status}</div>;
}

function ResetProbe() {
  const resetThread = useResetThread();
  return (
    <button type="button" onClick={resetThread}>
      reset
    </button>
  );
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

let fakeSocket;

beforeEach(() => {
  agentModule.__resetInstances();
  jest.clearAllMocks();

  useAgUiRuntime.mockImplementation(() => ({}));

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

  it('seeds the agent with a freshly minted thread id', async () => {
    jest.spyOn(crypto, 'randomUUID').mockReturnValueOnce('initial-thread');
    renderWithProvider(userStore());

    await waitFor(() => {
      expect(agentModule.__getInstances()).toHaveLength(1);
    });
    expect(agentModule.__getInstances()[0].opts.threadId).toBe(
      'initial-thread'
    );
  });

  it('does not pass a threadList adapter to the runtime', () => {
    renderWithProvider(userStore());
    expect(lastRuntimeOptions().adapters).toBeUndefined();
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

  it('rebuilds the agent with a new thread id and disconnects the old one when reset', async () => {
    jest
      .spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('thread-1')
      .mockReturnValueOnce('thread-2');

    renderWithProvider(userStore(), <ResetProbe />);
    await waitFor(() => expect(agentModule.__getInstances()).toHaveLength(1));
    const [first] = agentModule.__getInstances();
    expect(first.opts.threadId).toBe('thread-1');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'reset' }));

    await waitFor(() => expect(agentModule.__getInstances()).toHaveLength(2));
    const [, second] = agentModule.__getInstances();
    expect(second.opts.threadId).toBe('thread-2');
    expect(first.disconnect).toHaveBeenCalled();
  });
});
