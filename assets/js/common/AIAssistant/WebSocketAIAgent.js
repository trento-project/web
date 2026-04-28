import { AbstractAgent } from '@ag-ui/client';
import { Observable } from 'rxjs';

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
    this._connectionStatus = 'disconnected';
    this._activeSubscriber = null;
    this._activeRunId = null;
  }

  async initialize() {
    if (this.channel) return undefined;

    if (!this.socket) {
      this._setConnectionStatus('disconnected');
      throw new Error('No socket available');
    }

    if (!this.userId) {
      this._setConnectionStatus('disconnected');
      throw new Error('No userId available');
    }

    this._setConnectionStatus('connecting');
    this.channel = this.socket.channel(`ai_assistant:${this.userId}`, {});
    this._setupChannelHandlers();

    return new Promise((resolve, reject) => {
      this.channel
        .join()
        .receive('ok', () => {
          this._setConnectionStatus('connected');
          resolve();
        })
        .receive('error', (resp) => {
          this._setConnectionStatus('disconnected');
          reject(new Error(`Failed to join channel: ${JSON.stringify(resp)}`));
        })
        .receive('timeout', () => {
          this._setConnectionStatus('disconnected');
          reject(new Error('Channel join timeout'));
        });
    });
  }

  _setupChannelHandlers() {
    this.channel.on('ag_ui_event', (payload) => this._handleAgUiEvent(payload));
    this.channel.on('agent-execution-cancelled', () =>
      this._handleAgentCancelled()
    );
    this.channel.onError(() => this._setConnectionStatus('disconnected'));
    this.channel.onClose(() => this._setConnectionStatus('disconnected'));
  }

  _handleAgUiEvent(event) {
    const subscriber = this._activeSubscriber;
    if (!subscriber) return;

    subscriber.next(event);

    if (event.type === 'RUN_FINISHED') {
      subscriber.complete();
      this._clearActiveRun();
    } else if (event.type === 'RUN_ERROR') {
      subscriber.error(new Error(event.message || 'Agent execution failed'));
      this._clearActiveRun();
    }
  }

  // Implements AbstractAgent.run — invoked by assistant-ui when the user
  // submits a message. Returns an Observable of AG-UI events.
  run(runAgentInput) {
    return new Observable((subscriber) => {
      const runId = crypto.randomUUID();

      const setupRun = async () => {
        try {
          if (!this.channel || this._connectionStatus !== 'connected') {
            await this.initialize();
          }

          const { messages, threadId } = runAgentInput;
          const lastMessage = messages[messages.length - 1];

          if (!lastMessage || lastMessage.role !== 'user') {
            subscriber.error(new Error('Invalid message format'));
            return;
          }

          this._activeRunId = runId;
          this._activeSubscriber = subscriber;

          this.channel
            .push('send_message', {
              message: this._extractMessageText(lastMessage),
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

  _extractMessageText(message) {
    if (typeof message.content === 'string') return message.content;

    if (Array.isArray(message.content)) {
      return message.content
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('\n');
    }

    return '';
  }

  _handleAgentCancelled() {
    const subscriber = this._activeSubscriber;
    if (!subscriber) return;

    subscriber.error(new Error('Agent execution cancelled'));
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
    if (this.channel) {
      this.channel.leave();
      this.channel = null;
      this._setConnectionStatus('disconnected');
    }
  }
}
