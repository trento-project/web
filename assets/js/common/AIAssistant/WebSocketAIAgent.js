import { AbstractAgent } from '@ag-ui/client';

/**
 * WebSocket-based AI Agent that implements the AG UI protocol over Phoenix channels.
 *
 * This agent bridges assistant-ui's AG UI runtime with Phoenix channels,
 * translating AG UI protocol messages to/from Phoenix channel events.
 */
export class WebSocketAIAgent extends AbstractAgent {
  constructor({ socket, userId, onConnectionChange, ...options }) {
    super(options);

    this.socket = socket;
    this.userId = userId;
    this.channel = null;
    this.onConnectionChange = onConnectionChange;
    this._connectionStatus = 'disconnected'; // 'connected' | 'disconnected' | 'connecting'
    this._messageHandlers = new Map();
    this._activeRunId = null;
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
   * Setup Phoenix channel event handlers
   */
  _setupChannelHandlers() {
    // Handle agent streaming deltas (text chunks)
    this.channel.on('agent_delta', (payload) => {
      this._handleAgentDelta(payload);
    });

    // Handle complete agent messages
    this.channel.on('agent_message', (payload) => {
      this._handleAgentMessage(payload);
    });

    // Handle tool calls
    this.channel.on('tool_call', (payload) => {
      this._handleToolCall(payload);
    });

    // Handle tool results
    this.channel.on('tool_result', (payload) => {
      this._handleToolResult(payload);
    });

    // Handle errors
    this.channel.on('agent_error', (payload) => {
      this._handleAgentError(payload);
    });

    // Handle agent execution completion
    this.channel.on('agent_complete', (payload) => {
      this._handleAgentComplete(payload);
    });

    // Handle agent cancellation
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
   * Implement the AG UI protocol run() method
   * This is called by assistant-ui when user sends a message
   */
  async run(runAgentInput) {
    console.log('[WebSocketAIAgent] run() called with:', runAgentInput);

    // Ensure channel is connected
    if (!this.channel || this._connectionStatus !== 'connected') {
      await this.initialize();
    }

    // Generate a unique run ID for this execution
    this._activeRunId = crypto.randomUUID();

    const { messages, threadId } = runAgentInput;

    // Get the last message (user's latest input)
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== 'user') {
      console.error('[WebSocketAIAgent] Invalid message format');
      return;
    }

    // Extract text content from the message
    const messageText = this._extractMessageText(lastMessage);

    // Send message to Phoenix channel
    return new Promise((resolve, reject) => {
      this._messageHandlers.set(this._activeRunId, { resolve, reject });

      this.channel.push('send_message', {
        message: messageText,
        thread_id: threadId,
        run_id: this._activeRunId,
      })
        .receive('ok', () => {
          console.log('[WebSocketAIAgent] Message sent successfully');
        })
        .receive('error', (error) => {
          console.error('[WebSocketAIAgent] Failed to send message', error);
          this._messageHandlers.delete(this._activeRunId);
          reject(error);
        });
    });
  }

  /**
   * Cancel the current agent execution
   */
  async cancel() {
    if (this.channel && this._activeRunId) {
      this.channel.push('cancel_agent', { run_id: this._activeRunId });
    }
  }

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
   * Handle streaming delta from agent
   */
  _handleAgentDelta(payload) {
    const { delta, run_id } = payload;

    if (run_id !== this._activeRunId) return;

    // Emit AG UI protocol event for streaming text
    this.emit('textDelta', { delta: delta.text || delta });
  }

  /**
   * Handle complete agent message
   */
  _handleAgentMessage(payload) {
    const { message, run_id } = payload;

    if (run_id !== this._activeRunId) return;

    // Emit AG UI protocol event for complete message
    this.emit('message', {
      role: 'assistant',
      content: message,
    });
  }

  /**
   * Handle tool call from agent
   */
  _handleToolCall(payload) {
    const { tool_name, tool_arguments, tool_call_id, run_id } = payload;

    if (run_id !== this._activeRunId) return;

    // Emit AG UI protocol event for tool call
    this.emit('toolCall', {
      toolCallId: tool_call_id,
      toolName: tool_name,
      args: tool_arguments,
    });
  }

  /**
   * Handle tool result
   */
  _handleToolResult(payload) {
    const { tool_call_id, result, run_id } = payload;

    if (run_id !== this._activeRunId) return;

    // Emit AG UI protocol event for tool result
    this.emit('toolResult', {
      toolCallId: tool_call_id,
      result,
    });
  }

  /**
   * Handle agent error
   */
  _handleAgentError(payload) {
    const { error, run_id } = payload;

    if (run_id !== this._activeRunId) return;

    const handler = this._messageHandlers.get(this._activeRunId);
    if (handler) {
      handler.reject(new Error(error));
      this._messageHandlers.delete(this._activeRunId);
    }

    this.emit('error', { error });
  }

  /**
   * Handle agent execution completion
   */
  _handleAgentComplete(payload) {
    const { run_id } = payload;

    if (run_id !== this._activeRunId) return;

    const handler = this._messageHandlers.get(this._activeRunId);
    if (handler) {
      handler.resolve();
      this._messageHandlers.delete(this._activeRunId);
    }

    this.emit('done', {});
    this._activeRunId = null;
  }

  /**
   * Handle agent cancellation
   */
  _handleAgentCancelled() {
    if (!this._activeRunId) return;

    const handler = this._messageHandlers.get(this._activeRunId);
    if (handler) {
      handler.reject(new Error('Agent execution cancelled'));
      this._messageHandlers.delete(this._activeRunId);
    }

    this.emit('cancelled', {});
    this._activeRunId = null;
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