import { makeMockSocket } from '@lib/test-utils/phoenixDoubles';
import { extractMessageText, WebSocketAIAgent } from './WebSocketAIAgent';

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
    userId: 'u',
    onConnectionChange,
    ...overrides,
  });
  const getChannel = () =>
    agent.socket?.channels.get(`ai_assistant:${agent.userId}`);
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
    it('joins ai_assistant:{userId} and reports connecting → connected', async () => {
      const { agent, socket, onConnectionChange, getChannel } = makeAgent({
        userId: 'u42',
      });

      const initPromise = agent.initialize();

      expect(socket.channel).toHaveBeenCalledWith('ai_assistant:u42', {});
      expect(onConnectionChange).toHaveBeenNthCalledWith(1, 'connecting');

      getChannel().joinPush.fire('ok');
      await initPromise;

      expect(onConnectionChange).toHaveBeenNthCalledWith(2, 'connected');
    });

    it.each([
      {
        scenario: 'join error',
        receive: 'error',
        payload: { reason: 'boom' },
        rejectsWith: /Failed to join channel/,
      },
      {
        scenario: 'join timeout',
        receive: 'timeout',
        payload: undefined,
        rejectsWith: /Channel join timeout/,
      },
    ])(
      'rejects on $scenario and reports disconnected',
      async ({ receive, payload, rejectsWith }) => {
        const { agent, onConnectionChange, getChannel } = makeAgent();
        const initPromise = agent.initialize();
        getChannel().joinPush.fire(receive, payload);

        await expect(initPromise).rejects.toThrow(rejectsWith);
        expect(onConnectionChange).toHaveBeenLastCalledWith('disconnected');
      }
    );

    it.each([
      {
        missing: 'socket',
        overrides: { socket: undefined },
        error: /No socket available/,
      },
      {
        missing: 'userId',
        overrides: { userId: undefined },
        error: /No userId available/,
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

      expect(channel.pushed).toHaveLength(1);
      expect(channel.pushed[0]).toMatchObject({
        event: 'send_message',
        payload: {
          message: 'hello there',
          thread_id: 'thread-1',
          run_id: agent._activeRunId,
        },
      });
      expect(typeof agent._activeRunId).toBe('string');
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

    it('errors when the last message is not from the user', async () => {
      const { agent } = await connectedAgent();
      const { error } = runAgent(agent, {
        threadId: 't',
        messages: [{ role: 'assistant', content: 'oh' }],
      });

      expect(error).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid message format' })
      );
    });

    it('errors when channel.push receives an error', async () => {
      const { agent, channel } = await connectedAgent();
      const { error } = runAgent(agent);

      channel.pushed[0].push.fire('error', { reason: 'rejected' });

      expect(error).toHaveBeenCalledWith({ reason: 'rejected' });
      expect(agent._activeSubscriber).toBeNull();
    });

    it('initializes the channel lazily when run() is called before initialize()', async () => {
      const { agent, getChannel, onConnectionChange } = makeAgent({
        userId: 'u2',
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

  describe('reconnect', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('schedules a reconnect attempt after a join error', async () => {
      const { agent, getChannel } = makeAgent();
      const initPromise = agent.initialize();
      getChannel().joinPush.fire('error', { reason: 'boom' });
      await expect(initPromise).rejects.toThrow(/Failed to join channel/);

      // First retry uses INITIAL_RECONNECT_DELAY_MS (1s).
      expect(jest.getTimerCount()).toBe(1);

      jest.advanceTimersByTime(1000);
      // The retry called socket.channel(...) again, joining the same topic.
      expect(getChannel().joinPush).toBeDefined();
    });

    it('reconnects after an unexpected channel close', async () => {
      const { agent, channel, socket } = await connectedAgent();
      socket.channel.mockClear();

      channel.triggerClose();
      expect(jest.getTimerCount()).toBe(1);

      jest.advanceTimersByTime(1000);
      expect(socket.channel).toHaveBeenCalledWith(
        `ai_assistant:${agent.userId}`,
        {}
      );
    });

    it('grows backoff between successive failed reconnect attempts and caps it', async () => {
      // Spy on setTimeout to capture the delay the agent asks for at each step.
      const delays = [];
      const realSetTimeout = global.setTimeout;
      jest.spyOn(global, 'setTimeout').mockImplementation((fn, ms) => {
        delays.push(ms);
        return realSetTimeout(fn, ms);
      });

      const { channel, getChannel } = await connectedAgent();
      delays.length = 0; // ignore any timers from setup

      channel.triggerClose();
      // Run the chain: each iteration fires the pending reconnect timer, then
      // fails the resulting join — which schedules the next reconnect.
      for (let i = 0; i < 6; i += 1) {
        jest.runOnlyPendingTimers();
        getChannel().joinPush.fire('error', { reason: 'still down' });
        // Let the rejected _attemptConnect promise's .catch settle.

        await Promise.resolve();
      }

      // Expected delays: 1s, 2s, 4s, 8s, 16s, 30s (cap), 30s (still capped).
      expect(delays).toEqual([1000, 2000, 4000, 8000, 16000, 30000, 30000]);
    });

    it('resets backoff on a successful reconnect', async () => {
      const { agent, channel, getChannel } = await connectedAgent();
      // Force a few failed attempts to inflate the backoff counter.
      channel.triggerClose();
      jest.advanceTimersByTime(1000);
      getChannel().joinPush.fire('error', { reason: 'no' });
      await Promise.resolve();
      expect(agent._reconnectAttempts).toBeGreaterThan(0);

      // Now succeed.
      jest.advanceTimersByTime(2000);
      getChannel().joinPush.fire('ok');
      await Promise.resolve();

      expect(agent._reconnectAttempts).toBe(0);
    });

    it('stops reconnecting after disconnect()', async () => {
      const { agent, channel } = await connectedAgent();
      channel.triggerClose();
      expect(jest.getTimerCount()).toBe(1);

      agent.disconnect();
      expect(jest.getTimerCount()).toBe(0);
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
        expect.objectContaining({ message: 'AI assistant disconnected' })
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
});
