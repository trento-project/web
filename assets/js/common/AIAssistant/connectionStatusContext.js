// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { CONNECTION_STATUS } from '@lib/ai';

// Context that surfaces the current AI assistant connection status to any
// component inside the AIAssistant tree. Lives in its own module so leaf
// components (PromptComposer, ChatHeader, …) can consume the hook without
// importing AssistantChatProvider — keeps the dep graph one-way (provider
// → context → consumers)
export const ConnectionStatusContext = React.createContext(
  CONNECTION_STATUS.DISCONNECTED
);

export function useAIConnectionStatus() {
  return React.useContext(ConnectionStatusContext);
}
