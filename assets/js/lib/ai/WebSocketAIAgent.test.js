// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { makeMockSocket } from '@lib/test-utils/phoenixDoubles';
import { aguiEvents } from '@lib/test-utils/aguiEvents';

import { extractMessageText, WebSocketAIAgent } from './WebSocketAIAgent';
import { CONNECTING, CONNECTED, DISCONNECTED } from './connectionStatus';

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

function makeAuthDoubles() {
  let storedToken = 'TEST_TOKEN';
  return {
    getAccessToken: jest.fn(() => storedToken),
    refreshToken: jest.fn(async () => {
      storedToken = 'NEW_TOKEN';
    }),
    onUnrecoverableAuthError: jest.fn(),
  };
}

// Standard test setup: a fresh agent + socket + channel + onConnectionChange spy.
// `overrides` is spread after the defaults so callers can pass `userId: undefined`
// or `socket: undefined` to exercise the missing-prerequisite branches. The auth
// doubles come last and are returned as handles: a test that needs a failing
// refresh does `refreshToken.mockRejectedValueOnce(...)` on the returned spy.
function makeAgent(overrides = {}) {
  const socket = makeJestSocket();
  const auth = makeAuthDoubles();
  const agent = new WebSocketAIAgent({
    socket,
    userID: 'u',
    ...overrides,
    ...auth,
  }).withCallbacks({ ...overrides });

  const getChannel = () =>
    agent.socket?.channels.get(`ai_assistant:${agent.userID}`);
  return { agent, socket: agent.socket, getChannel, ...auth };
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
      const onConnectionChange = jest.fn();
      const { agent, socket, getChannel } = makeAgent({
        userID: 'u42',
        onConnectionChange,
      });

      const initPromise = agent.initialize();

      expect(socket.channel).toHaveBeenCalledWith(
        'ai_assistant:u42',
        expect.any(Function)
      );
      const [, paramsFn] = socket.channel.mock.calls[0];
      expect(paramsFn()).toEqual({ access_token: 'TEST_TOKEN' });
      expect(onConnectionChange).toHaveBeenNthCalledWith(1, CONNECTING);

      getChannel().joinPush.fire('ok');
      await initPromise;

      expect(onConnectionChange).toHaveBeenNthCalledWith(2, CONNECTED);
    });

    it('rejects on join error and reports disconnected', async () => {
      const onConnectionChange = jest.fn();
      const { agent, getChannel } = makeAgent({ onConnectionChange });
      const initPromise = agent.initialize();
      getChannel().joinPush.fire('error', { reason: 'boom' });

      await expect(initPromise).rejects.toEqual({ reason: 'boom' });
      expect(onConnectionChange).toHaveBeenLastCalledWith(DISCONNECTED);
    });

    it('rejects on join timeout and reports disconnected', async () => {
      const onConnectionChange = jest.fn();
      const { agent, getChannel } = makeAgent({ onConnectionChange });
      const initPromise = agent.initialize();
      getChannel().joinPush.fire('timeout');

      await expect(initPromise).rejects.toThrow(/Channel join timeout/);
      expect(onConnectionChange).toHaveBeenLastCalledWith(DISCONNECTED);
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
        const onConnectionChange = jest.fn();
        const { agent } = makeAgent({ ...overrides, onConnectionChange });
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
      const onConnectionChange = jest.fn();
      const { agent, socket, getChannel, refreshToken } = makeAgent({
        userID: 'u9',
        onConnectionChange,
      });

      const initPromise = agent.initialize();
      const firstChannel = getChannel();

      // First join attempt fails with unauthorized.
      firstChannel.joinPush.fire('error', 'unauthorized');
      await flushMicrotasks();

      // The agent should have requested a refresh and asked for a fresh channel.
      expect(refreshToken).toHaveBeenCalledTimes(1);
      // Second channel created (initialize re-entered after channel was nulled),
      // and its params callback reads the token refreshed in between.
      expect(socket.channel).toHaveBeenCalledTimes(2);
      const [, retryParamsFn] = socket.channel.mock.calls[1];
      expect(retryParamsFn()).toEqual({ access_token: 'NEW_TOKEN' });

      // Second join succeeds — initPromise resolves.
      const secondChannel = getChannel();
      secondChannel.joinPush.fire('ok');
      await initPromise;

      expect(onConnectionChange).toHaveBeenLastCalledWith(CONNECTED);
    });

    it('fails initialize when unauthorized refresh itself errors', async () => {
      const onConnectionChange = jest.fn();
      const { agent, getChannel, refreshToken, onUnrecoverableAuthError } =
        makeAgent({
          userID: 'u10',
          onConnectionChange,
        });
      refreshToken.mockRejectedValueOnce(
        new Error('no refresh token available')
      );
      const initPromise = agent.initialize();

      getChannel().joinPush.fire('error', 'unauthorized');

      await expect(initPromise).rejects.toThrow(
        'Session expired — please log in again'
      );
      expect(onConnectionChange).toHaveBeenLastCalledWith(DISCONNECTED);
      expect(onUnrecoverableAuthError).toHaveBeenCalledTimes(1);
    });
  });

  describe('connection status changes', () => {
    it.each([
      { trigger: 'channel error', method: 'triggerError' },
      { trigger: 'channel close', method: 'triggerClose' },
    ])('reports disconnected on $trigger', async ({ method }) => {
      const onConnectionChange = jest.fn();
      const { channel } = await connectedAgent({ onConnectionChange });

      onConnectionChange.mockClear();

      channel[method]();

      expect(onConnectionChange).toHaveBeenCalledWith(DISCONNECTED);
    });

    it('only invokes onConnectionChange when the status actually changes', () => {
      const onConnectionChange = jest.fn();
      const { agent } = makeAgent({ onConnectionChange });

      agent._setConnectionStatus(DISCONNECTED); // already disconnected
      agent._setConnectionStatus(CONNECTING);
      agent._setConnectionStatus(CONNECTING); // no change

      expect(onConnectionChange.mock.calls).toEqual([[CONNECTING]]);
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

    it('mints a fresh run_id per run while forwarding the same thread_id', async () => {
      const { agent, channel } = await connectedAgent();

      runAgent(agent, {
        threadId: 'thread-1',
        messages: [userMessage('first')],
      });
      await flushMicrotasks();
      runAgent(agent, {
        threadId: 'thread-1',
        messages: [userMessage('second')],
      });
      await flushMicrotasks();

      const [first, second] = channel.pushed;
      // run_id becomes the server's `message_id`, so a repeat would make the
      // second turn's TEXT_MESSAGE_* deltas land on the first turn's message.
      expect(second.payload.run_id).not.toBe(first.payload.run_id);
      expect(second.payload.thread_id).toBe(first.payload.thread_id);
    });

    it('refreshes the token and retries send_message once on unauthorized error', async () => {
      const { agent, channel, refreshToken } = await connectedAgent();
      const { error, next } = runAgent(agent);

      await flushMicrotasks();
      // First push fails with unauthorized.
      channel.pushed[0].push.fire('error', 'unauthorized');
      await flushMicrotasks();

      // The agent refreshed and re-pushed with the new token.
      expect(refreshToken).toHaveBeenCalledTimes(1);
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
      const { agent, channel, refreshToken, onUnrecoverableAuthError } =
        await connectedAgent();
      refreshToken.mockRejectedValueOnce(
        new Error('no refresh token available')
      );
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
      expect(onUnrecoverableAuthError).toHaveBeenCalledTimes(1);
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

      channel.emit(
        'ag_ui_event',
        aguiEvents.runFinished({ threadId: 't', runId: agent._activeRunId })
      );

      expect(complete).toHaveBeenCalledTimes(1);
      expect(agent._activeSubscriber).toBeNull();
      expect(agent._activeRunId).toBeNull();
    });

    it('does not settle the active run on a RUN_FINISHED that names no run', async () => {
      const { agent, channel } = await connectedAgent();
      const { complete } = runAgent(agent);

      // The server stamps run_id on every RUN_FINISHED, so an unstamped one
      // cannot be attributed to the run in flight.
      channel.emit('ag_ui_event', { type: 'RUN_FINISHED' });

      expect(complete).not.toHaveBeenCalled();
      expect(agent._activeRunId).not.toBeNull();
    });

    it('does not settle the active run on a terminal event from a superseded run', async () => {
      const { agent, channel } = await connectedAgent();

      runAgent(agent, { threadId: 't', messages: [userMessage('first')] });
      await flushMicrotasks();
      const staleRunId = channel.pushed[0].payload.run_id;

      const { complete } = runAgent(agent, {
        threadId: 't',
        messages: [userMessage('second')],
      });
      await flushMicrotasks();

      // The first run was abandoned when the second replaced it; its late
      // RUN_FINISHED must not close the run now in flight.
      channel.emit(
        'ag_ui_event',
        aguiEvents.runFinished({ threadId: 't', runId: staleRunId })
      );

      expect(complete).not.toHaveBeenCalled();
      expect(agent._activeRunId).not.toBeNull();
    });

    it.each([
      {
        scenario: 'with explicit message',
        sent: 'oops',
        message: 'oops',
      },
      {
        scenario: 'with default message when none is given',
        sent: undefined,
        message: 'Agent execution failed',
      },
    ])(
      'errors the observable on RUN_ERROR $scenario',
      async ({ sent, message }) => {
        const { agent, channel } = await connectedAgent();
        const { error } = runAgent(agent);

        channel.emit('ag_ui_event', aguiEvents.runError({ message: sent }));

        expect(error).toHaveBeenCalledWith(
          expect.objectContaining({ message })
        );
        expect(agent._activeSubscriber).toBeNull();
      }
    );

    it('errors the observable on a RUN_ERROR that names no run', async () => {
      const { agent, channel } = await connectedAgent();
      const { error } = runAgent(agent);

      // AgUi.Core.Events.RunError has no run_id field: the server cannot stamp
      // one, so a RUN_ERROR must never be filtered out for lacking it.
      channel.emit('ag_ui_event', aguiEvents.runError({ message: 'oops' }));

      expect(error).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'oops' })
      );
      expect(agent._activeSubscriber).toBeNull();
    });

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
      const onConnectionChange = jest.fn();
      const { agent, getChannel } = makeAgent({
        userID: 'u2',
        onConnectionChange,
      });

      runAgent(agent);

      expect(getChannel()).toBeDefined();
      expect(onConnectionChange).toHaveBeenCalledWith(CONNECTING);

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
      const onConnectionChange = jest.fn();
      const { agent, channel } = await connectedAgent({ onConnectionChange });
      channel.triggerClose();
      expect(agent.channel).toBe(channel);

      // Simulate Phoenix's auto-rejoin: same channel, same joinPush, fires 'ok' again.
      channel.joinPush.fire('ok');
      expect(onConnectionChange).toHaveBeenLastCalledWith(CONNECTED);

      runAgent(agent);
      await flushMicrotasks();
      expect(channel.pushed).toContainEqual(
        expect.objectContaining({ event: 'send_message' })
      );
    });
  });

  describe('disconnect', () => {
    it('leaves the channel and reports disconnected', async () => {
      const onConnectionChange = jest.fn();
      const { agent, channel } = await connectedAgent({ onConnectionChange });
      onConnectionChange.mockClear();

      agent.disconnect();

      expect(channel.leave).toHaveBeenCalled();
      expect(agent.channel).toBeNull();
      expect(onConnectionChange).toHaveBeenCalledWith(DISCONNECTED);
    });

    it('completes the active subscriber when disconnected mid-run', async () => {
      const { agent } = await connectedAgent();
      const { error, complete } = runAgent(agent);

      agent.disconnect();

      expect(complete).toHaveBeenCalledTimes(1);
      expect(error).not.toHaveBeenCalled();
      expect(agent._activeSubscriber).toBeNull();
      expect(agent._activeRunId).toBeNull();
    });

    it('is a no-op when never connected', () => {
      const onConnectionChange = jest.fn();
      const { agent } = makeAgent({ onConnectionChange });

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

  describe('configuration changes callbacks', () => {
    const modelPayload = { provider: 'googleai', model: 'gemini-2.5-pro' };

    const forwardedEvents = [
      {
        event: 'ai_configuration_cleared',
        callback: 'onAIConfigurationCleared',
        args: [],
      },
      {
        event: 'ai_configuration_created',
        callback: 'onAIConfigurationCreated',
        args: [],
      },
      {
        event: 'model_changed',
        callback: 'onModelChanged',
        args: [modelPayload],
      },
    ];

    it.each(forwardedEvents)(
      'forwards $event to the attached $callback',
      async ({ event, callback, args }) => {
        const spy = jest.fn();
        const { channel } = await connectedAgent({ [callback]: spy });

        channel.emit(event, ...args);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(...args);
      }
    );

    it('settles the active run on ai_configuration_cleared', async () => {
      const { channel, agent } = await connectedAgent();
      const { error, complete } = runAgent(agent);
      await flushMicrotasks();

      channel.emit('ai_configuration_cleared');

      expect(complete).toHaveBeenCalledTimes(1);
      expect(error).not.toHaveBeenCalled();
      expect(agent._activeSubscriber).toBeNull();
      expect(agent._activeRunId).toBeNull();
    });

    it('resets omitted callback to a noop', async () => {
      const spies = {
        onConnectionChange: jest.fn(),
        onAIConfigurationCleared: jest.fn(),
        onModelChanged: jest.fn(),
      };
      const { agent, channel } = await connectedAgent(spies);

      const calledOnAIConfigurationCreated = jest.fn();

      Object.values(spies).forEach((spy) => spy.mockClear());

      agent.withCallbacks({
        onAIConfigurationCreated: calledOnAIConfigurationCreated,
      });

      expect(() => {
        forwardedEvents.forEach(({ event, args }) =>
          channel.emit(event, ...args)
        );
        channel.triggerClose();
      }).not.toThrow();

      Object.values(spies).forEach((spy) => expect(spy).not.toHaveBeenCalled());
      expect(calledOnAIConfigurationCreated).toHaveBeenCalled();
    });

    it('correctly overrides a callback', async () => {
      const initialCallback = jest.fn();
      const overridingCallback = jest.fn();
      const { agent, channel } = await connectedAgent();

      agent.withCallbacks({ onModelChanged: initialCallback });
      agent.withCallbacks({ onModelChanged: overridingCallback });
      channel.emit('model_changed', modelPayload);

      expect(initialCallback).not.toHaveBeenCalled();
      expect(overridingCallback).toHaveBeenCalledWith(modelPayload);
    });
  });
});
