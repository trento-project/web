import React from 'react';

import { noop } from 'lodash';

// Context that exposes a "reset the conversation" callback to any component
// inside the AIAssistant tree. The single-thread provider implements this by
// minting a fresh thread id, which cascades through the agent useMemo and
// rebuilds the websocket-backed runtime. Lives in its own module so leaf
// components (ChatHeader, …) can consume the hook without importing
// AssistantChatProvider — keeps the dep graph one-way (provider → context →
// consumers).
export const ResetThreadContext = React.createContext(noop);

export function useResetThread() {
  return React.useContext(ResetThreadContext);
}
