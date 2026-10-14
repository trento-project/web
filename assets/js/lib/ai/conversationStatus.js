// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

export const ACTIVE = 'active';
export const EXPIRED = 'expired';

// Conversation lifecycle states reported by the WebSocketAIAgent, independent of the connection:
//   active  - the server-side agent holds the conversation's context
//   expired - the agent stopped (idle timeout, crash) and the context is gone;
//             the user must start a new chat to resume
export const CONVERSATION_STATUS = Object.freeze({
  ACTIVE,
  EXPIRED,
});

export const isConversationExpired = (conversationStatus) =>
  conversationStatus === CONVERSATION_STATUS.EXPIRED;
