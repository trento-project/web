// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { makeMockSocket } from '@lib/test-utils/phoenixDoubles';
import { getAccessTokenFromStore, refreshAndStoreAccessToken } from '@lib/auth';
import { handleUnrecoverableAuthError } from '@lib/network';
import { extractMessageText, WebSocketAIAgent } from './WebSocketAIAgent';

jest.mock('@lib/auth', () => ({
  getAccessTokenFromStore: jest.fn(() => 'TEST_TOKEN'),
  refreshAndStoreAccessToken: jest.fn(() => Promise.resolve()),
}));

jest.mock('@lib/network', () => ({
  handleUnrecoverableAuthError: jest.fn(),
}));

beforeEach(() => {
  getAccessTokenFromStore.mockReset();
  getAccessTokenFromStore.mockReturnValue('TEST_TOKEN');
  refreshAndStoreAccessToken.mockReset();
  // Mirror real behavior: refreshAndStoreAccessToken stores the new token
  // in localStorage, so subsequent getAccessTokenFromStore() reads it back.
  refreshAndStoreAccessToken.mockImplementation(async () => {
    getAccessTokenFromStore.mockReturnValue('NEW_TOKEN');
  });
  handleUnrecoverableAuthError.mockClear();
});

// Wrap socket.channel + each channel.leave with jest.fn so the existing
// `toHaveBeenCalled` / `mockClear` assertions still apply. The shared
// makeMockSocket stays jest-free so stories can use it too.
function makeJestSocket() {
  const socket = makeMockSocket();
  const original = socket.channel;
  socket.channel = jest.fn((topic) => {
    const channel = original(topic);
    if (!jest.isMockFunction(channel.leave)) {
      channel.leave = jest.fn(channel.leave);
    }
    return channel;
  });
  return socket;
}

const flushMicrotasks = async () => {
  for (let i = 0; i < 5; i += 1) await Promise.resolve();
};

const userMessage = (content = 'hi') => ({ role: 'user', content });

// Standard test setup: a fresh agent + socket + channel + onConnectionChange spy.
// `overrides` is spread after the defaults so callers can pass `userId: undefined`
// or `socket: undefined` to exercise the missing-prerequisite branches.
function makeAgent(overrides = {}) {
  const socket = makeJestSocket();
  const onConnectionChange = jest.fn();
  const agent = new WebSocketAIAgent({
    socket,
    userID: 'u',
    onConnectionChange,
    ...overrides,
  });
  const getChannel = () =>
    agent.socket?.channels.get(`ai_assistant:${agent.userID}`);
  return { agent, socket: agent.socket, onConnectionChange, getChannel };
}

// Setup that resolves agent.initialize() by firing 'ok' on the join push.
async function connectedAgent(opts) {
  const ctx = makeAgent(opts);
  const initPromise = ctx.agent.initialize();
  ctx.getChannel().joinPush.fire('ok');
  await initPromise;
  return { ...ctx, channel: ctx.getChannel() };
}

// Subscribe to agent.run and capture next/error/complete in spies.
function runAgent(agent, input = { threadId: 't', messages: [userMessage()] }) {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subscription = agent.run(input).subscribe({ next, error, complete });
  return { subscription, next, error, complete };
}

describe('WebSocketAIAgent', () => {
  describe('initialize', () => {
    it('joins ai_assistant:{userID} and reports connecting → connected', async () => {
      const { agent, socket, onConnectionChange, getChannel } = makeAgent({
        userID: 'u42',
      });

      const initPromise = agent.initialize();

      expect(socket.channel).toHaveBeenCalledWith(
        'ai_assistant:u42',
        expect.any(Function)
      );
      const [, paramsFn] = socket.channel.mock.calls[0];
      expect(paramsFn()).toEqual({ access_token: 'TEST_TOKEN' });
      expect(onConnectionChange).toHaveBeenNthCalledWith(1, 'connecting');

      getChannel().joinPush.fire('ok');
      await initPromise;

      expect(onConnectionChange).toHaveBeenNthCalledWith(2, 'connected');
    });

    it('rejects on join error and reports disconnected', async () => {
      const { agent, onConnectionChange, getChannel } = makeAgent();
      const initPromise = agent.initialize();
      getChannel().joinPush.fire('error', { reason: 'boom' });

      await expect(initPromise).rejects.toEqual({ reason: 'boom' });
      expect(onConnectionChange).toHaveBeenLastCalledWith('disconnected');
    });

    it('rejects on join timeout and reports disconnected', async () => {
      const { agent, onConnectionChange, getChannel } = makeAgent();
      const initPromise = agent.initialize();
      getChannel().joinPush.fire('timeout');

      await expect(initPromise).rejects.toThrow(/Channel join timeout/);
      expect(onConnectionChange).toHaveBeenLastCalledWith('disconnected');
    });

    it.each([
      {
        missing: 'socket',
        overrides: { socket: undefined },
        error: /No socket available/,
      },
      {
        missing: 'userID',
        overrides: { userID: undefined },
        error: /No userID available/,
      },
    ])(
      'throws when no $missing is provided and never reports a status change',
      async ({ overrides, error }) => {
        const { agent, onConnectionChange } = makeAgent(overrides);
        await expect(agent.initialize()).rejects.toThrow(error);
        expect(onConnectionChange).not.toHaveBeenCalled();
      }
    );

    it('is idempotent when channel is already initialized', async () => {
      const { agent, socket } = await connectedAgent();

      socket.channel.mockClear();
      await agent.initialize();

      expect(socket.channel).not.toHaveBeenCalled();
    });

    it('refreshes and rejoins on join error with reason "unauthorized"', async () => {
      const { agent, socket, getChannel } = makeAgent({ userID: 'u9' });

      const initPromise = agent.initialize();
      const firstChannel = getChannel();

      // First join attempt fails with unauthorized.
      firstChannel.joinPush.fire('error', 'unauthorized');
      await flushMicrotasks();

      // The agent should have requested a refresh and asked for a fresh channel.
      expect(refreshAndStoreAccessToken).toHaveBeenCalledTimes(1);
      // Second channel created (initialize re-entered after channel was nulled).
      expect(socket.channel).toHaveBeenCalledTimes(2);

      // Second join succeeds — initPromise resolves.
      const secondChannel = getChannel();
      secondChannel.joinPush.fire('ok');
      await initPromise;

      expect(agent._connectionStatus).toBe('connected');
    });

    it('fails initialize when unauthorized refresh itself errors', async () => {
      refreshAndStoreAccessToken.mockRejectedValueOnce(
        new Error('no refresh token available')
      );

      const { agent, getChannel } = makeAgent({ userID: 'u10' });
      const initPromise = agent.initialize();

      getChannel().joinPush.fire('error', 'unauthorized');

      await expect(initPromise).rejects.toThrow(
        'Session expired — please log in again'
      );
      expect(agent._connectionStatus).toBe('disconnected');
      expect(handleUnrecoverableAuthError).toHaveBeenCalledTimes(1);
    });
  });

  describe('connection status changes', () => {
    it.each([
      { trigger: 'channel error', method: 'triggerError' },
      { trigger: 'channel close', method: 'triggerClose' },
    ])('reports disconnected on $trigger', async ({ method }) => {
      const { channel, onConnectionChange } = await connectedAgent();
      onConnectionChange.mockClear();

      channel[method]();

      expect(onConnectionChange).toHaveBeenCalledWith('disconnected');
    });

    it('only invokes onConnectionChange when the status actually changes', () => {
      const { agent, onConnectionChange } = makeAgent();

      agent._setConnectionStatus('disconnected'); // already disconnected
      agent._setConnectionStatus('connecting');
      agent._setConnectionStatus('connecting'); // no change

      expect(onConnectionChange.mock.calls).toEqual([['connecting']]);
    });
  });

  describe('run', () => {
    it('pushes send_message with text, thread_id, and a generated run_id', async () => {
      const { agent, channel } = await connectedAgent();

      runAgent(agent, {
        threadId: 'thread-1',
        messages: [userMessage('hello there')],
      });

      await flushMicrotasks();
      expect(channel.pushed).toHaveLength(1);
      expect(channel.pushed[0]).toMatchObject({
        event: 'send_message',
        payload: {
          message: 'hello there',
          thread_id: 'thread-1',
          run_id: agent._activeRunId,
          access_token: 'TEST_TOKEN',
        },
      });
      expect(typeof agent._activeRunId).toBe('string');
    });

    it('refreshes the token and retries send_message once on unauthorized error', async () => {
      const { agent, channel } = await connectedAgent();
      const { error, next } = runAgent(agent);

      await flushMicrotasks();
      // First push fails with unauthorized.
      channel.pushed[0].push.fire('error', 'unauthorized');
      await flushMicrotasks();

      // The agent refreshed and re-pushed with the new token.
      expect(refreshAndStoreAccessToken).toHaveBeenCalledTimes(1);
      expect(channel.pushed).toHaveLength(2);
      expect(channel.pushed[1].payload.access_token).toBe('NEW_TOKEN');

      // The retried push then succeeds (no error fired on it). Simulate an
      // upstream event to confirm the subscriber is still alive.
      channel.emit('ag_ui_event', {
        type: 'TEXT_MESSAGE_CONTENT',
        delta: 'ok',
      });

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith({
        type: 'TEXT_MESSAGE_CONTENT',
        delta: 'ok',
      });
    });

    it('errors the subscriber when the refresh itself fails', async () => {
      refreshAndStoreAccessToken.mockRejectedValueOnce(
        new Error('no refresh token available')
      );

      const { agent, channel } = await connectedAgent();
      const { error } = runAgent(agent);

      await flushMicrotasks();
      channel.pushed[0].push.fire('error', 'unauthorized');
      await flushMicrotasks();
      await flushMicrotasks();

      expect(error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Session expired — please log in again',
        })
      );
      expect(agent._activeSubscriber).toBeNull();
      expect(handleUnrecoverableAuthError).toHaveBeenCalledTimes(1);
    });

    it('errors the subscriber when the retried push also fails', async () => {
      const { agent, channel } = await connectedAgent();
      const { error } = runAgent(agent);

      await flushMicrotasks();
      channel.pushed[0].push.fire('error', 'unauthorized');
      await flushMicrotasks();

      // Retried push fails for some other reason.
      channel.pushed[1].push.fire('error', { reason: 'still broken' });
      await flushMicrotasks();

      expect(error).toHaveBeenCalledWith({ reason: 'still broken' });
      expect(agent._activeSubscriber).toBeNull();
    });

    it('forwards ag_ui_event payloads to the active subscriber', async () => {
      const { agent, channel } = await connectedAgent();
      const { next } = runAgent(agent);

      const event = { type: 'TEXT_MESSAGE_CONTENT', delta: 'hello' };
      channel.emit('ag_ui_event', event);

      expect(next).toHaveBeenCalledWith(event);
    });

    it('completes the observable on RUN_FINISHED and clears active run state', async () => {
      const { agent, channel } = await connectedAgent();
      const { complete } = runAgent(agent);

      channel.emit('ag_ui_event', { type: 'RUN_FINISHED' });

      expect(complete).toHaveBeenCalledTimes(1);
      expect(agent._activeSubscriber).toBeNull();
      expect(agent._activeRunId).toBeNull();
    });

    it.each([
      {
        scenario: 'with explicit message',
        event: { type: 'RUN_ERROR', message: 'oops' },
        message: 'oops',
      },
      {
        scenario: 'with default message when none is given',
        event: { type: 'RUN_ERROR' },
        message: 'Agent execution failed',
      },
    ])(
      'errors the observable on RUN_ERROR $scenario',
      async ({ event, message }) => {
        const { agent, channel } = await connectedAgent();
        const { error } = runAgent(agent);

        channel.emit('ag_ui_event', event);

        expect(error).toHaveBeenCalledWith(
          expect.objectContaining({ message })
        );
        expect(agent._activeSubscriber).toBeNull();
      }
    );

    it('errors when there is no new user message to start the run with', async () => {
      const { agent } = await connectedAgent();
      const { error } = runAgent(agent, {
        threadId: 't',
        messages: [{ role: 'assistant', content: 'oh' }],
      });

      expect(error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cannot start a run without a new user message',
        })
      );
    });

    it('errors when channel.push receives an error', async () => {
      const { agent, channel } = await connectedAgent();
      const { error } = runAgent(agent);

      await flushMicrotasks();
      channel.pushed[0].push.fire('error', { reason: 'rejected' });
      await flushMicrotasks();
      await flushMicrotasks();

      expect(error).toHaveBeenCalledWith({ reason: 'rejected' });
      expect(agent._activeSubscriber).toBeNull();
    });

    it('initializes the channel lazily when run() is called before initialize()', async () => {
      const { agent, getChannel, onConnectionChange } = makeAgent({
        userID: 'u2',
      });

      runAgent(agent);

      expect(getChannel()).toBeDefined();
      expect(onConnectionChange).toHaveBeenCalledWith('connecting');

      getChannel().joinPush.fire('ok');
      await flushMicrotasks();

      expect(getChannel().pushed).toHaveLength(1);
      expect(getChannel().pushed[0].event).toBe('send_message');
    });

    it('clears active run state when the subscription is unsubscribed', async () => {
      const { agent } = await connectedAgent();
      const { subscription } = runAgent(agent);

      expect(agent._activeSubscriber).not.toBeNull();

      subscription.unsubscribe();

      expect(agent._activeSubscriber).toBeNull();
      expect(agent._activeRunId).toBeNull();
    });
  });

  describe('connection drops during an active run', () => {
    it.each([
      { trigger: 'channel error', method: 'triggerError' },
      { trigger: 'channel close', method: 'triggerClose' },
    ])('errors the active subscriber on $trigger', async ({ method }) => {
      const { agent, channel } = await connectedAgent();
      const { error } = runAgent(agent);

      channel[method]();

      expect(error).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'AI assistant connection lost' })
      );
      expect(agent._activeSubscriber).toBeNull();
      expect(agent._activeRunId).toBeNull();
    });

    it('keeps the channel reference after a drop so a later push does not throw', async () => {
      const { agent, channel } = await connectedAgent();
      channel.triggerClose();
      expect(agent.channel).toBe(channel);

      // Simulate Phoenix's auto-rejoin: same channel, same joinPush, fires 'ok' again.
      channel.joinPush.fire('ok');
      expect(agent._connectionStatus).toBe('connected');

      runAgent(agent);
      await flushMicrotasks();
      expect(channel.pushed).toContainEqual(
        expect.objectContaining({ event: 'send_message' })
      );
    });
  });

  describe('disconnect', () => {
    it('leaves the channel and reports disconnected', async () => {
      const { agent, channel, onConnectionChange } = await connectedAgent();
      onConnectionChange.mockClear();

      agent.disconnect();

      expect(channel.leave).toHaveBeenCalled();
      expect(agent.channel).toBeNull();
      expect(onConnectionChange).toHaveBeenCalledWith('disconnected');
    });

    it('errors the active subscriber when disconnected mid-run', async () => {
      const { agent } = await connectedAgent();
      const { error } = runAgent(agent);

      agent.disconnect();

      expect(error).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'AbortError',
          message: 'AI assistant disconnected',
        })
      );
      expect(agent._activeSubscriber).toBeNull();
      expect(agent._activeRunId).toBeNull();
    });

    it('is a no-op when never connected', () => {
      const { agent, onConnectionChange } = makeAgent();

      expect(() => agent.disconnect()).not.toThrow();
      expect(onConnectionChange).not.toHaveBeenCalled();
    });
  });

  describe('extractMessageText', () => {
    it('returns string content as-is', () => {
      expect(extractMessageText({ content: 'hello' })).toBe('hello');
    });

    it('joins text parts with newlines and skips non-text parts', () => {
      expect(
        extractMessageText({
          content: [
            { type: 'text', text: 'one' },
            { type: 'image', url: 'x' },
            { type: 'text', text: 'two' },
          ],
        })
      ).toBe('one\ntwo');
    });

    it.each([
      ['missing message', undefined],
      ['missing content', {}],
      ['null content', { content: null }],
      ['number content', { content: 42 }],
    ])('returns an empty string for %s', (_label, message) => {
      expect(extractMessageText(message)).toBe('');
    });
  });

  describe('ai_configuration_cleared', () => {
    it('settles the active run (AbortError) and invokes the callback', async () => {
      const onAIConfigurationCleared = jest.fn();
      const { channel, agent } = await connectedAgent({
        onAIConfigurationCleared,
      });
      const { error } = runAgent(agent);
      await flushMicrotasks();

      channel.emit('ai_configuration_cleared');

      expect(onAIConfigurationCleared).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].name).toBe('AbortError');
    });

    it('invokes the callback even when no run is active', async () => {
      const onAIConfigurationCleared = jest.fn();
      const { channel } = await connectedAgent({ onAIConfigurationCleared });

      channel.emit('ai_configuration_cleared');

      expect(onAIConfigurationCleared).toHaveBeenCalledTimes(1);
    });
  });

  describe('ai_configuration_created', () => {
    it('invokes onAIConfigurationCreated', async () => {
      const onAIConfigurationCreated = jest.fn();
      const { channel } = await connectedAgent({ onAIConfigurationCreated });

      channel.emit('ai_configuration_created');

      expect(onAIConfigurationCreated).toHaveBeenCalledTimes(1);
    });
  });

  describe('model_changed', () => {
    it('invokes onModelChanged with the event payload', async () => {
      const onModelChanged = jest.fn();
      const { channel } = await connectedAgent({ onModelChanged });

      channel.emit('model_changed', { provider: 'googleai', model: 'gemini-2.5-pro' });

      expect(onModelChanged).toHaveBeenCalledWith({
        provider: 'googleai',
        model: 'gemini-2.5-pro',
      });
    });
  });
});
