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
  const [stoppedMessageIndexes, setStoppedMessageIndexes] = useState(
    () => new Set()
  );
  // Keyed by position, NOT by message id. assistant-ui streams the answer
  // into an optimistic placeholder (`__optimistic__…`) and swaps in a
  // different, server-generated id once the run settles — so the id read at
  // click time is already dead by the time StoppedNotice renders, and the
  // marker would blink on and vanish. The position survives that swap,
  // because a thread only ever appends.
  const lastMessageIndex = useAuiState((s) => s.thread.messages.length - 1);

  const stopRun = useCallback(() => {
    // Only mark an answer as stopped if a run was actually there to stop —
    // a click landing after RUN_FINISHED but before the composer swaps
    // Stop→Send must not label a completed answer as cut short.
    if (!onStop()) return;
    if (lastMessageIndex < 0) return;
    setStoppedMessageIndexes((previous) =>
      new Set(previous).add(lastMessageIndex)
    );
  }, [onStop, lastMessageIndex]);

  const isMessageStopped = useCallback(
    (messageIndex) => stoppedMessageIndexes.has(messageIndex),
    [stoppedMessageIndexes]
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
