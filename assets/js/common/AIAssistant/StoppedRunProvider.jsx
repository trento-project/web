// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { noop } from 'lodash';

import { useAuiState } from '@assistant-ui/react';

// Default value lets a consumer render in a per-component unit spec without
// wrapping it in the provider: stopRun is a no-op and no message is ever
// reported as stopped.
const StoppedRunContext = createContext({
  stopRun: noop,
  isMessageStopped: () => false,
});

export function useStoppedRun() {
  return useContext(StoppedRunContext);
}

// Must be rendered inside AssistantRuntimeProvider — it reads thread state
// via useAuiState.
export function StoppedRunProvider({ onStop = noop, children }) {
  const [stoppedMessageIds, setStoppedMessageIds] = useState(() => new Set());
  const lastMessageId = useAuiState((s) => s.thread.messages.at(-1)?.id);

  const stopRun = useCallback(() => {
    // Only mark an answer as stopped if a run was actually there to stop —
    // a click landing after RUN_FINISHED but before the composer swaps
    // Stop→Send must not label a completed answer as cut short.
    if (!onStop()) return;
    if (!lastMessageId) return;
    setStoppedMessageIds((previous) => new Set(previous).add(lastMessageId));
  }, [onStop, lastMessageId]);

  const isMessageStopped = useCallback(
    (messageId) => stoppedMessageIds.has(messageId),
    [stoppedMessageIds]
  );

  const value = useMemo(
    () => ({ stopRun, isMessageStopped }),
    [stopRun, isMessageStopped]
  );

  return (
    <StoppedRunContext.Provider value={value}>
      {children}
    </StoppedRunContext.Provider>
  );
}

export default StoppedRunProvider;
