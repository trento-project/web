// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

export const CONNECTING = 'connecting';
export const CONNECTED = 'connected';
export const DISCONNECTED = 'disconnected';

// Connection lifecycle states reported by the WebSocketAIAgent and consumed
// by the AssistantChatProvider context. Single source of truth so UI code
// (status indicators, composer placeholders, header dot) doesn't drift from
// what the agent actually emits.
export const CONNECTION_STATUS = Object.freeze({
  CONNECTED,
  CONNECTING,
  DISCONNECTED,
});

export const isOnline = (connectionStatus) =>
  connectionStatus === CONNECTION_STATUS.CONNECTED;
