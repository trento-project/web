// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { AbstractAgent } from '@ag-ui/client';
import { Observable } from 'rxjs';
import { isArray, isString, last, noop, each } from 'lodash';

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

const isUnauthorized = (error) => error === 'unauthorized';

// Bridges assistant-ui's AG-UI runtime with Phoenix channels: translates
// AG-UI protocol events to/from channel events for the ai_assistant:{userID}
// topic.
export class WebSocketAIAgent extends AbstractAgent {
  #callbacks = {};

  constructor({
    socket,
    userID,
    getAccessToken = getAccessTokenFromStore,
    refreshToken = refreshAndStoreAccessToken,
    onUnrecoverableAuthError = handleUnrecoverableAuthError,
    ...options
  }) {
    super(options);

    this.socket = socket;
    this.userID = userID;
    this.channel = null;
    this._connectionStatus = CONNECTION_STATUS.DISCONNECTED;
    this._activeSubscriber = null;
    this._activeRunId = null;
    this._activeThreadId = null;
    this._getAccessToken = getAccessToken;
    this._refreshToken = refreshToken;
    this._onUnrecoverableAuthError = onUnrecoverableAuthError;
    this.withCallbacks();
  }

  withCallbacks({
    onConnectionChange = noop,
    onAIConfigurationCleared = noop,
    onAIConfigurationCreated = noop,
    onModelChanged = noop,
  } = {}) {
    this.#callbacks = {
      onConnectionChange,
      onAIConfigurationCleared,
      onAIConfigurationCreated,
      onModelChanged,
    };
    return this;
  }

  // Idempotent async initializer for the channel connection
  async initialize() {
    if (this.channel) return;
    if (!this.socket) throw new Error('No socket available');
    if (!this.userID) throw new Error('No userID available');

    this._setConnectionStatus(CONNECTION_STATUS.CONNECTING);
    try {
      await this._withRefreshTokenOnUnauthorized(() => this._join());
    } catch (error) {
      this._teardown();
      this._setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      throw error;
    }
  }

  // Run `operation` and, if it rejects with an "unauthorized" wire payload,
  // refresh the access token once and retry. Any other rejection from
  // `operation` propagates verbatim.
  async _withRefreshTokenOnUnauthorized(operation) {
    try {
      return await operation();
    } catch (error) {
      if (!isUnauthorized(error)) throw error;
    }
    await this._refreshOrAbort();
    return operation();
  }

  // Refresh the access token; on failure, kick off the global "session expired"
  // redirect and re-throw
  async _refreshOrAbort() {
    try {
      await this._refreshToken();
    } catch {
      this._onUnrecoverableAuthError();
      throw new Error('Session expired — please log in again');
    }
  }

  // Build a fresh channel and await its join.
  // On 'unauthorized' the channel reference is dropped so the helper's retry rebuilds
  // with the just-refreshed token in the params callback.
  _join() {
    this.channel = this.socket.channel(`ai_assistant:${this.userID}`, () => ({
      access_token: this._getAccessToken(),
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
      this._settleActiveRun(new Error('AI assistant connection lost'));
    };

    const messageHandlerMap = [
      ['ag_ui_event', (event) => this._handleAgUiEvent(event)],
      ['ai_configuration_cleared', () => this._handleAIConfigurationCleared()],
      [
        'ai_configuration_created',
        () => this.#callbacks.onAIConfigurationCreated(),
      ],
      ['model_changed', (payload) => this.#callbacks.onModelChanged(payload)],
    ];

    each(messageHandlerMap, ([eventName, handler]) =>
      this.channel.on(eventName, handler)
    );
    this.channel.onError(dropConnection);
    this.channel.onClose(dropConnection);
  }

  // User's AI configuration was cleared server-side.
  // Settle any in-flight run without surfacing an error
  // and let the UI switch to its read-only / disabled state via the callback.
  _handleAIConfigurationCleared() {
    this._settleActiveRun();
    this.#callbacks.onAIConfigurationCleared();
  }

  // The events the server stamps with a run id — AgUi.Core.Events.RunStarted
  // and RunFinished both enforce one. RUN_ERROR is deliberately absent:
  // AgUi.Core.Events.RunError has no run_id field at all, so filtering it on
  // one would drop every error. Everything else the channel pushes
  // (TEXT_MESSAGE_*, TOOL_CALL_*) belongs to whichever run is subscribed.
  static RUN_SCOPED_EVENTS = [EventType.RUN_STARTED, EventType.RUN_FINISHED];

  // A run-scoped event naming a run other than the active one is the tail of a
  // run that was cancelled or superseded; letting it through would settle — or
  // restart — the run that replaced it.
  _isStaleRunEvent({ type, runId }) {
    return (
      WebSocketAIAgent.RUN_SCOPED_EVENTS.includes(type) &&
      runId !== this._activeRunId
    );
  }

  _handleAgUiEvent(event) {
    const subscriber = this._activeSubscriber;
    if (!subscriber) return;
    if (this._isStaleRunEvent(event)) return;

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
      // Pinned per run: `this.threadId` is mutated the moment the user starts
      // a new chat, so it no longer names the run being cancelled.
      this._activeThreadId = threadId;
      this._activeSubscriber = subscriber;

      const setupRun = async () => {
        try {
          await this.initialize();
          await this._withRefreshTokenOnUnauthorized(() =>
            this._sendMessage({
              message: extractMessageText(lastMessage),
              thread_id: threadId,
              run_id: runId,
            })
          );
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

  // Raw send: one push, resolves on 'ok', rejects on 'error'. Reads the
  // access token fresh from storage so a retry after refresh naturally picks
  // up the new value.
  _sendMessage(payload) {
    return new Promise((resolve, reject) => {
      this.channel
        .push('send_message', {
          ...payload,
          access_token: this._getAccessToken(),
        })
        .receive('ok', resolve)
        .receive('error', reject);
    });
  }

  // Settle the in-flight run, with an error only when the user needs to see one.
  //
  // Beware of the error path: @assistant-ui/react-ag-ui turns it into an
  // unhandled promise rejection. AgUiThreadRuntimeCore.startRun re-throws
  // whatever the subscriber errored with, and ExternalThread's
  // `onNew?.(message)` neither awaits nor catches the result. There is no seam
  // on our side — only pass an error when it is genuinely the user's business.
  _settleActiveRun(maybeError) {
    const subscriber = this._activeSubscriber;
    if (!subscriber) return;
    maybeError ? subscriber.error(maybeError) : subscriber.complete();
    this._clearActiveRun();
  }

  // Stop, from the composer. Reached through the runtime's `onCancel` once the
  // run's abort signal has fired. The ids are the ones pinned when the run
  // started, not the live ones.
  cancelActiveRun() {
    if (!this._activeSubscriber) return;

    this.channel?.push('cancel_run', {
      run_id: this._activeRunId,
      thread_id: this._activeThreadId,
    });

    this._settleActiveRun();
  }

  // "New chat". The thread's server-side agent outlives its runs and would
  // otherwise hold the whole conversation until the sagents inactivity
  // timeout, so the server has to be told the thread is gone. There is never
  // a run to settle here — "New chat" is locked while one is in flight.
  //
  // The payload is empty because there are no correlation ids worth sending:
  // `_activeThreadId` is null by construction, and `this.threadId` has already
  // been mutated to the *new* id (the provider's threadId effect is declared
  // above the swap effect), so logging it would be actively misleading. The
  // server abandons the thread in its own assigns.
  abandonThread() {
    this.channel?.push('abandon_thread', {});
  }

  _clearActiveRun() {
    this._activeSubscriber = null;
    this._activeRunId = null;
    this._activeThreadId = null;
  }

  _setConnectionStatus(status) {
    if (this._connectionStatus === status) return;
    this._connectionStatus = status;
    this.#callbacks.onConnectionChange(status);
  }

  disconnect() {
    if (!this.channel) return;
    this._teardown();
    this._settleActiveRun();
    this._setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
  }

  _teardown() {
    // Releases the channel from `socket.channels` so a failed join does not
    // accumulate as a zombie reference
    this.channel?.leave();
    this.channel = null;
  }
}
