import { AbstractAgent } from '@ag-ui/client';
import { Observable } from 'rxjs';

/**
 * WebSocket-based AI Agent that implements the AG UI protocol over Phoenix channels.
 *
 * This agent bridges assistant-ui's AG UI runtime with Phoenix channels,
 * translating AG UI protocol messages to/from Phoenix channel events.
 */
export class WebSocketAIAgent extends AbstractAgent {
  constructor({ socket, userId, onConnectionChange, ...options }) {
    super(options);

    this._agentInstanceId = crypto.randomUUID().substring(0, 8);
    console.log(`[WebSocketAIAgent:${this._agentInstanceId}] 🆕 New agent instance created`);

    this.socket = socket;
    this.userId = userId;
    this.channel = null;
    this.onConnectionChange = onConnectionChange;
    this._connectionStatus = 'disconnected'; // 'connected' | 'disconnected' | 'connecting'
    this._messageHandlers = new Map();
    this._activeRunId = null;
    this._messageStarted = false; // Track if TextMessageStartEvent has been emitted
  }

  /**
   * Initialize the Phoenix channel connection
   */
  async initialize() {
    if (this.channel) {
      console.log('[WebSocketAIAgent] Already initialized, skipping');
      return; // Already initialized
    }

    if (!this.socket) {
      console.error('[WebSocketAIAgent] No socket available!');
      this._setConnectionStatus('disconnected');
      throw new Error('No socket available');
    }

    if (!this.userId) {
      console.error('[WebSocketAIAgent] No userId available!');
      this._setConnectionStatus('disconnected');
      throw new Error('No userId available');
    }

    console.log('[WebSocketAIAgent] Initializing channel for user:', this.userId);
    this._setConnectionStatus('connecting');

    // Create channel for this user
    this.channel = this.socket.channel(`ai_assistant:${this.userId}`, {});

    // Setup channel event handlers
    this._setupChannelHandlers();

    // Join the channel
    return new Promise((resolve, reject) => {
      console.log('[WebSocketAIAgent] Joining channel ai_assistant:' + this.userId);

      this.channel
        .join()
        .receive('ok', (resp) => {
          console.log('[WebSocketAIAgent] ✅ Successfully joined AI assistant channel', resp);
          this._setConnectionStatus('connected');
          resolve();
        })
        .receive('error', (resp) => {
          console.error('[WebSocketAIAgent] ❌ Failed to join channel', resp);
          this._setConnectionStatus('disconnected');
          reject(new Error('Failed to join channel: ' + JSON.stringify(resp)));
        })
        .receive('timeout', () => {
          console.error('[WebSocketAIAgent] ⏱️ Channel join timeout');
          this._setConnectionStatus('disconnected');
          reject(new Error('Channel join timeout'));
        });
    });
  }

  /**
   * Setup Phoenix channel event handlers for AG-UI protocol events
   */
  _setupChannelHandlers() {
    // Listen to the single ag_ui_event and route based on type
    this.channel.on('ag_ui_event', (payload) => {
      console.log('[WebSocketAIAgent] Received ag_ui_event:', payload);
      this._handleAgUiEvent(payload);
    });

    // Handle agent cancellation (custom event, not AG-UI)
    this.channel.on('agent-execution-cancelled', () => {
      this._handleAgentCancelled();
    });

    // Handle channel errors and disconnections
    this.channel.onError(() => {
      console.error('[WebSocketAIAgent] Channel error');
      this._setConnectionStatus('disconnected');
    });

    this.channel.onClose(() => {
      console.log('[WebSocketAIAgent] Channel closed');
      this._setConnectionStatus('disconnected');
    });
  }

  /**
   * Route AG-UI events based on type field
   */
  _handleAgUiEvent(event) {
    console.log(`[WebSocketAIAgent:${this._agentInstanceId}] 🔹 Event received:`, event.type);
    console.log(`[WebSocketAIAgent:${this._agentInstanceId}] 🔹 Active run ID:`, this._activeRunId);
    console.log(`[WebSocketAIAgent:${this._agentInstanceId}] 🔹 Message handlers keys:`, Array.from(this._messageHandlers.keys()));
    console.log(`[WebSocketAIAgent:${this._agentInstanceId}] 🔹 Event runId:`, event.runId);

    const handler = this._messageHandlers.get(this._activeRunId);
    if (!handler || !handler.subscriber) {
      console.warn(`[WebSocketAIAgent:${this._agentInstanceId}] ❌ No handler for event:`, event.type);
      console.warn(`[WebSocketAIAgent:${this._agentInstanceId}] ❌ Handler exists:`, !!handler);
      console.warn(`[WebSocketAIAgent:${this._agentInstanceId}] ❌ Has subscriber:`, handler?.subscriber ? 'yes' : 'no');
      return;
    }

    // Forward the event as-is to the Observable subscriber
    // The AG-UI runtime will process it based on the type field
    console.log(`[WebSocketAIAgent:${this._agentInstanceId}] ✅ Forwarding event to subscriber:`, event.type);
    handler.subscriber.next(event);

    // Handle terminal events (complete or error the stream)
    if (event.type === 'RUN_FINISHED') {
      console.log('[WebSocketAIAgent] Run finished, completing Observable');
      handler.subscriber.complete();
      this._messageHandlers.delete(this._activeRunId);
      this._activeRunId = null;
      this._messageStarted = false;
    } else if (event.type === 'RUN_ERROR') {
      console.error('[WebSocketAIAgent] Run error, erroring Observable');
      handler.subscriber.error(new Error(event.message || 'Agent execution failed'));
      this._messageHandlers.delete(this._activeRunId);
      this._activeRunId = null;
      this._messageStarted = false;
    }
  }

  /**
   * Implement the AG UI protocol run() method
   * This is called by assistant-ui when user sends a message
   * @returns {Observable<BaseEvent>} Observable stream of AG UI events
   */
  run(runAgentInput) {
    console.log(`[WebSocketAIAgent:${this._agentInstanceId}] run() called with:`, runAgentInput);

    return new Observable((subscriber) => {
      console.log(`[WebSocketAIAgent:${this._agentInstanceId}] Creating new Observable for run`);

      // Setup the run
      const setupRun = async () => {
        try {
          // Ensure channel is connected
          if (!this.channel || this._connectionStatus !== 'connected') {
            console.log('[WebSocketAIAgent] Channel not connected, initializing...');
            await this.initialize();
          }

          // Generate a unique run ID for this execution
          this._activeRunId = crypto.randomUUID();
          this._messageStarted = false; // Reset message started flag

          console.log(`[WebSocketAIAgent:${this._agentInstanceId}] 🚀 Starting run with ID:`, this._activeRunId);

          const { messages, threadId } = runAgentInput;

          // Get the last message (user's latest input)
          const lastMessage = messages[messages.length - 1];

          if (!lastMessage || lastMessage.role !== 'user') {
            console.error(`[WebSocketAIAgent:${this._agentInstanceId}] Invalid message format`);
            subscriber.error(new Error('Invalid message format'));
            return;
          }

          // Extract text content from the message
          const messageText = this._extractMessageText(lastMessage);

          console.log(`[WebSocketAIAgent:${this._agentInstanceId}] 📝 Message text:`, messageText);
          console.log(`[WebSocketAIAgent:${this._agentInstanceId}] 🧵 Thread ID:`, threadId);

          // Store the subscriber for this run so we can emit events to it
          this._messageHandlers.set(this._activeRunId, { subscriber });
          console.log(`[WebSocketAIAgent:${this._agentInstanceId}] 💾 Subscriber stored for run ID:`, this._activeRunId);

          // Send message to Phoenix channel (server will emit RunStarted event)
          this.channel.push('send_message', {
            message: messageText,
            thread_id: threadId,
            run_id: this._activeRunId,
          })
            .receive('ok', () => {
              console.log('[WebSocketAIAgent] ✅ Message sent successfully to server');
            })
            .receive('error', (error) => {
              console.error('[WebSocketAIAgent] ❌ Failed to send message', error);
              this._messageHandlers.delete(this._activeRunId);
              subscriber.error(error);
            });

        } catch (error) {
          console.error('[WebSocketAIAgent] Error in run setup:', error);
          subscriber.error(error);
        }
      };

      setupRun();

      // Cleanup function when Observable is unsubscribed
      return () => {
        console.log('[WebSocketAIAgent] Observable unsubscribed for run:', this._activeRunId);
        this._messageHandlers.delete(this._activeRunId);
      };
    });
  }

  /**
   * Cancel the current agent execution
   */
  // async cancel() {
  //   if (this.channel && this._activeRunId) {
  //     this.channel.push('cancel_agent', { run_id: this._activeRunId });
  //   }
  // }

  /**
   * Extract text content from AG UI message format
   */
  _extractMessageText(message) {
    if (typeof message.content === 'string') {
      return message.content;
    }

    if (Array.isArray(message.content)) {
      // Handle multi-part content (text + attachments)
      const textParts = message.content
        .filter(part => part.type === 'text')
        .map(part => part.text);
      return textParts.join('\n');
    }

    return '';
  }

  /**
   * Handle agent cancellation
   */
  _handleAgentCancelled() {
    if (!this._activeRunId) return;

    const handler = this._messageHandlers.get(this._activeRunId);
    if (!handler || !handler.subscriber) return;

    // Error the observable with cancellation
    handler.subscriber.error(new Error('Agent execution cancelled'));
    this._messageHandlers.delete(this._activeRunId);
    this._activeRunId = null;
    this._messageStarted = false;
  }

  /**
   * Set connection status and notify listeners
   */
  _setConnectionStatus(status) {
    if (this._connectionStatus === status) return;

    this._connectionStatus = status;

    if (this.onConnectionChange) {
      this.onConnectionChange(status);
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus() {
    return this._connectionStatus;
  }

  /**
   * Check if agent is connected
   */
  isConnected() {
    return this._connectionStatus === 'connected';
  }

  /**
   * Disconnect from channel
   */
  disconnect() {
    if (this.channel) {
      this.channel.leave();
      this.channel = null;
      this._setConnectionStatus('disconnected');
    }
  }
}