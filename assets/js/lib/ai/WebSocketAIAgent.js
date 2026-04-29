import { AbstractAgent } from '@ag-ui/client';
import { Observable } from 'rxjs';
import { isArray, isString } from 'lodash';

import { EventType } from '@ag-ui/core';

import { CONNECTION_STATUS } from './connectionStatus';

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;

// Pure helper: collapse a message's content (string or array of parts) to
// the plain text the server expects in `send_message`.
export function extractMessageText({ content } = {}) {
  if (isString(content)) return content;
  if (isArray(content)) {
    return content
      .filter(({ type }) => type === 'text')
      .map(({ text }) => text)
      .join('\n');
  }
  return '';
}

// Bridges assistant-ui's AG-UI runtime with Phoenix channels: translates
// AG-UI protocol events to/from channel events for the ai_assistant:{userId}
// topic.
export class WebSocketAIAgent extends AbstractAgent {
  constructor({ socket, userId, onConnectionChange, ...options }) {
    super(options);

    this.socket = socket;
    this.userId = userId;
    this.channel = null;
    this.onConnectionChange = onConnectionChange;
    this._connectionStatus = CONNECTION_STATUS.DISCONNECTED;
    this._activeSubscriber = null;
    this._activeRunId = null;
    this._reconnectAttempts = 0;
    this._reconnectTimer = null;
    this._intentionallyDisconnected = false;
  }

  // Idempotent. Kicks off the connect loop; on transport drops the agent
  // will retry with exponential backoff until disconnect() is called. The
  // returned promise resolves/rejects on the first attempt only — callers
  // don't need to await subsequent reconnects.
  async initialize() {
    this._intentionallyDisconnected = false;
    if (this.channel) return undefined;
    return this._attemptConnect();
  }

  async _attemptConnect() {
    if (this.channel) return undefined;

    if (!this.socket) {
      this._setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      throw new Error('No socket available');
    }
    if (!this.userId) {
      this._setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      throw new Error('No userId available');
    }

    this._setConnectionStatus(CONNECTION_STATUS.CONNECTING);
    this.channel = this.socket.channel(`ai_assistant:${this.userId}`, {});
    this._setupChannelHandlers();

    return new Promise((resolve, reject) => {
      const fail = (message) => {
        this.channel = null;
        this._setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
        this._scheduleReconnect();
        reject(new Error(message));
      };

      this.channel
        .join()
        .receive('ok', () => {
          this._reconnectAttempts = 0;
          this._setConnectionStatus(CONNECTION_STATUS.CONNECTED);
          resolve();
        })
        .receive('error', (resp) => {
          fail(`Failed to join channel: ${JSON.stringify(resp)}`);
        })
        .receive('timeout', () => {
          fail('Channel join timeout');
        });
    });
  }

  _scheduleReconnect() {
    if (this._intentionallyDisconnected) return;
    if (this._reconnectTimer) return;

    const delay = Math.min(
      INITIAL_RECONNECT_DELAY_MS * 2 ** this._reconnectAttempts,
      MAX_RECONNECT_DELAY_MS
    );
    this._reconnectAttempts += 1;
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      this._attemptConnect().catch(() => {
        // _attemptConnect already scheduled the next retry on failure.
      });
    }, delay);
  }

  _setupChannelHandlers() {
    const dropConnection = () => {
      this._setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      this._failActiveRun(new Error('AI assistant connection lost'));
      this.channel = null;
      this._scheduleReconnect();
    };

    this.channel.on('ag_ui_event', (event) => this._handleAgUiEvent(event));
    this.channel.on('agent-execution-cancelled', () =>
      this._handleAgentCancelled()
    );
    this.channel.onError(dropConnection);
    this.channel.onClose(dropConnection);
  }

  _handleAgUiEvent(event) {
    const subscriber = this._activeSubscriber;
    if (!subscriber) return;

    subscriber.next(event);

    if (event.type === EventType.RUN_FINISHED) {
      subscriber.complete();
      this._clearActiveRun();
    } else if (event.type === EventType.RUN_ERROR) {
      subscriber.error(new Error(event.message || 'Agent execution failed'));
      this._clearActiveRun();
    }
  }

  // Implements AbstractAgent.run — invoked by assistant-ui when the user
  // submits a message. Returns an Observable of AG-UI events.
  run({ messages, threadId }) {
    return new Observable((subscriber) => {
      const runId = crypto.randomUUID();

      const setupRun = async () => {
        try {
          if (
            !this.channel ||
            this._connectionStatus !== CONNECTION_STATUS.CONNECTED
          ) {
            await this.initialize();
          }

          const lastMessage = messages[messages.length - 1];
          if (!lastMessage || lastMessage.role !== 'user') {
            subscriber.error(new Error('Invalid message format'));
            return;
          }

          this._activeRunId = runId;
          this._activeSubscriber = subscriber;

          this.channel
            .push('send_message', {
              message: extractMessageText(lastMessage),
              thread_id: threadId,
              run_id: runId,
            })
            .receive('error', (error) => {
              if (this._activeRunId === runId) this._clearActiveRun();
              subscriber.error(error);
            });
        } catch (error) {
          subscriber.error(error);
        }
      };

      setupRun();

      // Guard against clearing a newer run when an older subscription
      // is torn down out of order.
      return () => {
        if (this._activeRunId === runId) this._clearActiveRun();
      };
    });
  }

  // The assistant-ui runtime calls `runAgent(input, subscriber, { signal })`
  // and aborts that signal when the user cancels. AbstractAgent ignores the
  // third arg, so we need to wire the signal to abortRun ourselves.
  async runAgent(parameters, subscriber, opts) {
    const signal = opts?.signal;
    if (!signal) return super.runAgent(parameters, subscriber);
    if (signal.aborted) return undefined;

    const onAbort = () => this.abortRun();
    signal.addEventListener('abort', onAbort, { once: true });
    try {
      return await super.runAgent(parameters, subscriber);
    } finally {
      signal.removeEventListener('abort', onAbort);
    }
  }

  abortRun() {
    if (!this._activeRunId) return;
    const runId = this._activeRunId;
    this.channel?.push('cancel_agent', { run_id: runId });
    this._failActiveRun(new Error('Agent execution cancelled'));
  }

  _handleAgentCancelled() {
    this._failActiveRun(new Error('Agent execution cancelled'));
  }

  _failActiveRun(error) {
    const subscriber = this._activeSubscriber;
    if (!subscriber) return;
    subscriber.error(error);
    this._clearActiveRun();
  }

  _clearActiveRun() {
    this._activeSubscriber = null;
    this._activeRunId = null;
  }

  _setConnectionStatus(status) {
    if (this._connectionStatus === status) return;
    this._connectionStatus = status;
    this.onConnectionChange?.(status);
  }

  disconnect() {
    this._intentionallyDisconnected = true;
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    if (!this.channel) return;
    this.channel.leave();
    this.channel = null;
    this._failActiveRun(new Error('AI assistant disconnected'));
    this._setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
  }
}
