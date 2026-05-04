import { AbstractAgent } from '@ag-ui/client';
import { Observable } from 'rxjs';
import { isArray, isString, last } from 'lodash';

import { EventType } from '@ag-ui/core';

import { CONNECTION_STATUS } from './connectionStatus';

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

class AbortError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AbortError';
  }
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
  }

  async initialize() {
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
        reject(new Error(message));
      };

      this.channel
        .join()
        .receive('ok', () => {
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

  _setupChannelHandlers() {
    // Keep `this.channel` non-null on transport drops: Phoenix's Socket
    // auto-rejoins the channel when the WS comes back, and the joinPush's
    // existing receive('ok') handler will flip status back to CONNECTED.
    // Channel.push also buffers while the socket is down and flushes on
    // rejoin, so preserving the reference makes a "drop → recover → prompt"
    // sequence Just Work.
    const dropConnection = () => {
      this._setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      this._failActiveRun(new Error('AI assistant connection lost'));
    };

    this.channel.on('ag_ui_event', (event) => this._handleAgUiEvent(event));
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

          const lastMessage = last(messages);
          if (!lastMessage || lastMessage.role !== 'user') {
            subscriber.error(
              new Error('Cannot start a run without a new user message')
            );
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
    if (!this.channel) return;
    this.channel.leave();
    this.channel = null;
    // Tag the teardown error as an AbortError so AbstractAgent's `onError`
    // treats it as an expected unmount/cancel.
    //
    // (See AbstractAgent.onError's allowlist in @ag-ui/client.)
    this._failActiveRun(new AbortError('AI assistant disconnected'));
    this._setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
  }
}
