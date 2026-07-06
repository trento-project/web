// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { AbstractAgent } from '@ag-ui/client';
import { Observable } from 'rxjs';
import { isArray, isString, last } from 'lodash';

import { EventType } from '@ag-ui/core';

import { getAccessTokenFromStore, refreshAndStoreAccessToken } from '@lib/auth';
import { handleUnrecoverableAuthError } from '@lib/network';

import { CONNECTION_STATUS } from './connectionStatus';

// Pure helper: collapse a message's content (string or array of parts) to
// the plain text the server expects in `send_message`.
export const extractMessageText = ({ content } = {}) => {
  if (isString(content)) return content;
  if (isArray(content)) {
    return content
      .filter(({ type }) => type === 'text')
      .map(({ text }) => text)
      .join('\n');
  }
  return '';
};

class AbortError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AbortError';
  }
}

const isUnauthorized = (error) => error === 'unauthorized';

// Refresh the access token; on failure, kick off the global "session expired"
// redirect and re-throw
const refreshOrAbort = async () => {
  try {
    await refreshAndStoreAccessToken();
  } catch {
    handleUnrecoverableAuthError();
    throw new Error('Session expired — please log in again');
  }
};

// Run `operation` and, if it rejects with an "unauthorized" wire payload,
// refresh the access token once and retry. Any other rejection from
// `operation` propagates verbatim.
const withRefreshTokenOnUnauthorized = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    if (!isUnauthorized(error)) throw error;
  }
  await refreshOrAbort();
  return operation();
};

// Bridges assistant-ui's AG-UI runtime with Phoenix channels: translates
// AG-UI protocol events to/from channel events for the ai_assistant:{userID}
// topic.
export class WebSocketAIAgent extends AbstractAgent {
  constructor({
    socket,
    userID,
    onConnectionChange,
    onAIConfigurationCleared,
    onAIConfigurationCreated,
    ...options
  }) {
    super(options);

    this.socket = socket;
    this.userID = userID;
    this.channel = null;
    this.onConnectionChange = onConnectionChange;
    this.onAIConfigurationCleared = onAIConfigurationCleared;
    this.onAIConfigurationCreated = onAIConfigurationCreated;
    this._connectionStatus = CONNECTION_STATUS.DISCONNECTED;
    this._activeSubscriber = null;
    this._activeRunId = null;
  }

  // Idempotent async initializer for the channel connection
  async initialize() {
    if (this.channel) return;
    if (!this.socket) throw new Error('No socket available');
    if (!this.userID) throw new Error('No userID available');

    this._setConnectionStatus(CONNECTION_STATUS.CONNECTING);
    try {
      await this._join();
    } catch (error) {
      this._teardown();
      this._setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      throw error;
    }
  }

  // Join the channel, refreshing the access token + retrying once if the
  // server replies 'unauthorized'.
  _join() {
    return withRefreshTokenOnUnauthorized(() => this._doJoin());
  }

  // Build a fresh channel and await its join.
  // On 'unauthorized' the channel reference is dropped so the helper's retry rebuilds
  // with the just-refreshed token in the params callback.
  _doJoin() {
    this.channel = this.socket.channel(`ai_assistant:${this.userID}`, () => ({
      access_token: getAccessTokenFromStore(),
    }));
    this._setupChannelHandlers();
    return new Promise((resolve, reject) => {
      this.channel
        .join()
        .receive('ok', () => {
          this._setConnectionStatus(CONNECTION_STATUS.CONNECTED);
          resolve();
        })
        .receive('error', (resp) => {
          this._teardown();
          reject(resp);
        })
        .receive('timeout', () => {
          this._teardown();
          reject(new Error('Channel join timeout'));
        });
    });
  }

  _setupChannelHandlers() {
    // Keep `this.channel` non-null on transport drops: Phoenix's Socket
    // auto-rejoins the channel when the WS comes back, and the joinPush's
    // existing receive('ok') handler flips status back to CONNECTED.
    // Channel.push also buffers while the socket is down and flushes on
    // rejoin, so preserving the reference makes a "drop → recover → prompt"
    // sequence Just Work.
    const dropConnection = () => {
      this._setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      this._failActiveRun(new Error('AI assistant connection lost'));
    };

    this.channel.on('ag_ui_event', (event) => this._handleAgUiEvent(event));
    this.channel.on('ai_configuration_cleared', () =>
      this._handleAIConfigurationCleared()
    );
    this.channel.on('ai_configuration_created', () =>
      this.onAIConfigurationCreated?.()
    );
    this.channel.onError(dropConnection);
    this.channel.onClose(dropConnection);
  }

  // The user's AI configuration was cleared server-side (this or another tab,
  // or a raw API call). Settle any in-flight run without surfacing an error
  // (AbortError is AbstractAgent's expected-cancel path), then let the UI
  // switch to its read-only / disabled state via the callback.
  _handleAIConfigurationCleared() {
    this._failActiveRun(new AbortError('AI configuration cleared'));
    this.onAIConfigurationCleared?.();
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
  //
  // Active-run state is assigned synchronously before the async IIFE so
  // connection-drop / disconnect handlers can surface errors on the in-flight
  // subscriber immediately (they check _activeSubscriber, not the closure).
  // The send itself is deferred by at most one microtask via `await initialize()`.
  run({ messages, threadId }) {
    return new Observable((subscriber) => {
      const runId = crypto.randomUUID();
      const lastMessage = last(messages);

      if (!lastMessage || lastMessage.role !== 'user') {
        subscriber.error(
          new Error('Cannot start a run without a new user message')
        );
        return undefined;
      }

      this._activeRunId = runId;
      this._activeSubscriber = subscriber;

      const setupRun = async () => {
        try {
          await this.initialize();
          await this._sendMessage({
            message: extractMessageText(lastMessage),
            thread_id: threadId,
            run_id: runId,
          });
        } catch (error) {
          if (this._activeRunId === runId) this._clearActiveRun();
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

  // Send the message, refreshing the access token + retrying once if the
  // server replies 'unauthorized'.
  _sendMessage(payload) {
    return withRefreshTokenOnUnauthorized(() => this._doSendMessage(payload));
  }

  // Raw send: one push, resolves on 'ok', rejects on 'error'. Reads the
  // access token fresh from storage so a retry after refresh naturally picks
  // up the new value.
  _doSendMessage(payload) {
    return new Promise((resolve, reject) => {
      this.channel
        .push('send_message', {
          ...payload,
          access_token: getAccessTokenFromStore(),
        })
        .receive('ok', resolve)
        .receive('error', reject);
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
    this._teardown();
    // Tag the teardown error as an AbortError so AbstractAgent's `onError`
    // treats it as an expected unmount/cancel.
    //
    // (See AbstractAgent.onError's allowlist in @ag-ui/client.)
    this._failActiveRun(new AbortError('AI assistant disconnected'));
    this._setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
  }

  _teardown() {
    // Releases the channel from `socket.channels` so a failed join does not
    // accumulate as a zombie reference
    this.channel?.leave();
    this.channel = null;
  }
}
