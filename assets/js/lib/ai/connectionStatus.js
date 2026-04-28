// Connection lifecycle states reported by the WebSocketAIAgent and consumed
// by the AssistantChatProvider context. Single source of truth so UI code
// (status indicators, composer placeholders, header dot) doesn't drift from
// what the agent actually emits.
export const CONNECTION_STATUS = Object.freeze({
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  DISCONNECTED: 'disconnected',
});
