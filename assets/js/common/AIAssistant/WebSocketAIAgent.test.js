import { WebSocketAIAgent } from './WebSocketAIAgent';

function makePush() {
  const handlers = {};
  const push = {
    receive: (event, cb) => {
      handlers[event] = cb;
      return push;
    },
    fire: (event, payload) => {
      if (handlers[event]) handlers[event](payload);
    },
  };
  return push;
}

class MockChannel {
  constructor() {
    this.listeners = new Map();
    this.errorHandlers = [];
    this.closeHandlers = [];
    this.pushed = [];
    this.joinPush = makePush();
    this.leave = jest.fn();
  }

  on(event, cb) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(cb);
  }

  emit(event, payload) {
    (this.listeners.get(event) || []).forEach((cb) => cb(payload));
  }

  push(event, payload) {
    const push = makePush();
    this.pushed.push({ event, payload, push });
    return push;
  }

  join() {
    return this.joinPush;
  }

  onError(cb) {
    this.errorHandlers.push(cb);
  }

  onClose(cb) {
    this.closeHandlers.push(cb);
  }

  triggerError() {
    this.errorHandlers.forEach((cb) => cb());
  }

  triggerClose() {
    this.closeHandlers.forEach((cb) => cb());
  }
}

function makeMockSocket() {
  const channels = new Map();
  return {
    channels,
    channel: jest.fn((topic) => {
      if (!channels.has(topic)) channels.set(topic, new MockChannel());
      return channels.get(topic);
    }),
  };
}

const flush = async () => {
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
  }
};

async function connectedAgent({ userId = 'u', onConnectionChange } = {}) {
  const socket = makeMockSocket();
  const agent = new WebSocketAIAgent({ socket, userId, onConnectionChange });
  const p = agent.initialize();
  const channel = socket.channels.get(`ai_assistant:${userId}`);
  channel.joinPush.fire('ok');
  await p;
  return { agent, channel, socket };
}

describe('WebSocketAIAgent', () => {
  describe('initialize', () => {
    it('joins ai_assistant:{userId} and reports connecting → connected', async () => {
      const onConnectionChange = jest.fn();
      const socket = makeMockSocket();
      const agent = new WebSocketAIAgent({
        socket,
        userId: 'u42',
        onConnectionChange,
      });

      const p = agent.initialize();

      expect(socket.channel).toHaveBeenCalledWith('ai_assistant:u42', {});
      expect(onConnectionChange).toHaveBeenNthCalledWith(1, 'connecting');

      const channel = socket.channels.get('ai_assistant:u42');
      channel.joinPush.fire('ok');
      await p;

      expect(onConnectionChange).toHaveBeenNthCalledWith(2, 'connected');
    });

    it('rejects on join error and reports disconnected', async () => {
      const onConnectionChange = jest.fn();
      const socket = makeMockSocket();
      const agent = new WebSocketAIAgent({
        socket,
        userId: 'u',
        onConnectionChange,
      });
      const p = agent.initialize();

      socket.channels
        .get('ai_assistant:u')
        .joinPush.fire('error', { reason: 'boom' });

      await expect(p).rejects.toThrow(/Failed to join channel/);
      expect(onConnectionChange).toHaveBeenLastCalledWith('disconnected');
    });

    it('rejects on join timeout and reports disconnected', async () => {
      const onConnectionChange = jest.fn();
      const socket = makeMockSocket();
      const agent = new WebSocketAIAgent({
        socket,
        userId: 'u',
        onConnectionChange,
      });
      const p = agent.initialize();

      socket.channels.get('ai_assistant:u').joinPush.fire('timeout');

      await expect(p).rejects.toThrow(/Channel join timeout/);
      expect(onConnectionChange).toHaveBeenLastCalledWith('disconnected');
    });

    it('throws when no socket is provided and never reports a status change', async () => {
      const onConnectionChange = jest.fn();
      const agent = new WebSocketAIAgent({
        socket: undefined,
        userId: 'u',
        onConnectionChange,
      });
      await expect(agent.initialize()).rejects.toThrow(/No socket available/);
      expect(onConnectionChange).not.toHaveBeenCalled();
    });

    it('throws when no userId is provided', async () => {
      const agent = new WebSocketAIAgent({
        socket: makeMockSocket(),
        userId: undefined,
      });
      await expect(agent.initialize()).rejects.toThrow(/No userId available/);
    });

    it('is idempotent when channel is already initialized', async () => {
      const { agent, socket } = await connectedAgent();

      socket.channel.mockClear();
      await agent.initialize();

      expect(socket.channel).not.toHaveBeenCalled();
    });
  });

  describe('connection status changes', () => {
    it('reports disconnected on channel error', async () => {
      const onConnectionChange = jest.fn();
      const { channel } = await connectedAgent({ onConnectionChange });
      onConnectionChange.mockClear();

      channel.triggerError();

      expect(onConnectionChange).toHaveBeenCalledWith('disconnected');
    });

    it('reports disconnected on channel close', async () => {
      const onConnectionChange = jest.fn();
      const { channel } = await connectedAgent({ onConnectionChange });
      onConnectionChange.mockClear();

      channel.triggerClose();

      expect(onConnectionChange).toHaveBeenCalledWith('disconnected');
    });

    it('only invokes onConnectionChange when the status actually changes', () => {
      const onConnectionChange = jest.fn();
      const agent = new WebSocketAIAgent({
        socket: makeMockSocket(),
        userId: 'u',
        onConnectionChange,
      });

      agent._setConnectionStatus('disconnected');
      expect(onConnectionChange).not.toHaveBeenCalled();

      agent._setConnectionStatus('connecting');
      expect(onConnectionChange).toHaveBeenCalledTimes(1);

      agent._setConnectionStatus('connecting');
      expect(onConnectionChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('run', () => {
    it('pushes send_message with text, thread_id, and a generated run_id', async () => {
      const { agent, channel } = await connectedAgent();

      agent
        .run({
          threadId: 'thread-1',
          messages: [{ role: 'user', content: 'hello there' }],
        })
        .subscribe({ next: () => {}, error: () => {} });

      expect(channel.pushed).toHaveLength(1);
      expect(channel.pushed[0].event).toBe('send_message');
      expect(channel.pushed[0].payload.message).toBe('hello there');
      expect(channel.pushed[0].payload.thread_id).toBe('thread-1');
      expect(typeof channel.pushed[0].payload.run_id).toBe('string');
      expect(channel.pushed[0].payload.run_id).toBe(agent._activeRunId);
    });

    it('forwards ag_ui_event payloads to the active subscriber', async () => {
      const { agent, channel } = await connectedAgent();
      const events = [];

      agent
        .run({
          threadId: 't',
          messages: [{ role: 'user', content: 'hi' }],
        })
        .subscribe({ next: (e) => events.push(e) });

      const evt = { type: 'TEXT_MESSAGE_CONTENT', delta: 'hello' };
      channel.emit('ag_ui_event', evt);

      expect(events).toEqual([evt]);
    });

    it('completes the observable on RUN_FINISHED and clears active run state', async () => {
      const { agent, channel } = await connectedAgent();
      const onComplete = jest.fn();

      agent
        .run({
          threadId: 't',
          messages: [{ role: 'user', content: 'hi' }],
        })
        .subscribe({ next: () => {}, complete: onComplete });

      channel.emit('ag_ui_event', { type: 'RUN_FINISHED' });

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(agent._activeSubscriber).toBeNull();
      expect(agent._activeRunId).toBeNull();
    });

    it('errors the observable on RUN_ERROR and clears active run state', async () => {
      const { agent, channel } = await connectedAgent();
      const onError = jest.fn();

      agent
        .run({
          threadId: 't',
          messages: [{ role: 'user', content: 'hi' }],
        })
        .subscribe({ next: () => {}, error: onError });

      channel.emit('ag_ui_event', { type: 'RUN_ERROR', message: 'oops' });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'oops' })
      );
      expect(agent._activeSubscriber).toBeNull();
    });

    it('falls back to a default error message when RUN_ERROR has none', async () => {
      const { agent, channel } = await connectedAgent();
      const onError = jest.fn();

      agent
        .run({
          threadId: 't',
          messages: [{ role: 'user', content: 'hi' }],
        })
        .subscribe({ next: () => {}, error: onError });

      channel.emit('ag_ui_event', { type: 'RUN_ERROR' });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Agent execution failed' })
      );
    });

    it('errors when the last message is not from the user', async () => {
      const { agent } = await connectedAgent();
      const onError = jest.fn();

      agent
        .run({
          threadId: 't',
          messages: [{ role: 'assistant', content: 'oh' }],
        })
        .subscribe({ next: () => {}, error: onError });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid message format' })
      );
    });

    it('errors when channel.push receives an error', async () => {
      const { agent, channel } = await connectedAgent();
      const onError = jest.fn();

      agent
        .run({
          threadId: 't',
          messages: [{ role: 'user', content: 'hi' }],
        })
        .subscribe({ next: () => {}, error: onError });

      channel.pushed[0].push.fire('error', { reason: 'rejected' });

      expect(onError).toHaveBeenCalledWith({ reason: 'rejected' });
      expect(agent._activeSubscriber).toBeNull();
    });

    it('initializes the channel lazily when run() is called before initialize()', async () => {
      const onConnectionChange = jest.fn();
      const socket = makeMockSocket();
      const agent = new WebSocketAIAgent({
        socket,
        userId: 'u2',
        onConnectionChange,
      });

      agent
        .run({
          threadId: 't',
          messages: [{ role: 'user', content: 'hi' }],
        })
        .subscribe({ next: () => {}, error: () => {} });

      const channel = socket.channels.get('ai_assistant:u2');
      expect(channel).toBeDefined();
      expect(onConnectionChange).toHaveBeenCalledWith('connecting');

      channel.joinPush.fire('ok');
      await flush();

      expect(channel.pushed).toHaveLength(1);
      expect(channel.pushed[0].event).toBe('send_message');
    });

    it('clears active run state when the subscription is unsubscribed', async () => {
      const { agent } = await connectedAgent();

      const sub = agent
        .run({
          threadId: 't',
          messages: [{ role: 'user', content: 'hi' }],
        })
        .subscribe({ next: () => {} });

      expect(agent._activeSubscriber).not.toBeNull();

      sub.unsubscribe();

      expect(agent._activeSubscriber).toBeNull();
      expect(agent._activeRunId).toBeNull();
    });
  });

  describe('agent-execution-cancelled', () => {
    it('errors the active subscriber with a cancellation message', async () => {
      const { agent, channel } = await connectedAgent();
      const onError = jest.fn();

      agent
        .run({
          threadId: 't',
          messages: [{ role: 'user', content: 'hi' }],
        })
        .subscribe({ next: () => {}, error: onError });

      channel.emit('agent-execution-cancelled');

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Agent execution cancelled' })
      );
      expect(agent._activeSubscriber).toBeNull();
      expect(agent._activeRunId).toBeNull();
    });

    it('is a no-op when no run is active', async () => {
      const { channel } = await connectedAgent();
      expect(() => channel.emit('agent-execution-cancelled')).not.toThrow();
    });
  });

  describe('_extractMessageText', () => {
    let agent;
    beforeEach(() => {
      agent = new WebSocketAIAgent({ socket: makeMockSocket(), userId: 'u' });
    });

    it('returns string content as-is', () => {
      expect(agent._extractMessageText({ content: 'hello' })).toBe('hello');
    });

    it('joins text parts of array content with newlines and skips non-text parts', () => {
      const parts = [
        { type: 'text', text: 'one' },
        { type: 'image', url: 'x' },
        { type: 'text', text: 'two' },
      ];
      expect(agent._extractMessageText({ content: parts })).toBe('one\ntwo');
    });

    it.each([
      ['missing content', {}],
      ['null content', { content: null }],
      ['number content', { content: 42 }],
    ])('returns an empty string for %s', (_label, message) => {
      expect(agent._extractMessageText(message)).toBe('');
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
      expect(onConnectionChange).toHaveBeenCalledWith('disconnected');
    });

    it('is a no-op when never connected', () => {
      const onConnectionChange = jest.fn();
      const agent = new WebSocketAIAgent({
        socket: makeMockSocket(),
        userId: 'u',
        onConnectionChange,
      });
      expect(() => agent.disconnect()).not.toThrow();
      expect(onConnectionChange).not.toHaveBeenCalled();
    });
  });
});
