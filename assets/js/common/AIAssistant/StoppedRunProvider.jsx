// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { noop } from 'lodash';

import { useAuiState } from '@assistant-ui/react';

// Default value lets a consumer render in a per-component unit spec without
// wrapping it in the provider: stopRun is a no-op and isStopped is always
// false.
const StoppedRunContext = createContext({ stopRun: noop, isStopped: false });

export function useStoppedRun() {
  return useContext(StoppedRunContext);
}

// Must be rendered inside AssistantRuntimeProvider — it reads thread state
// via useAuiState.
export function StoppedRunProvider({ onStop = noop, children }) {
  const [isStopped, setIsStopped] = useState(false);
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const wasRunningRef = useRef(isRunning);

  // A stop belongs to exactly one run. Clear the flag when the next run
  // starts, not when this one ends — the marker has to outlive its own run.
  useEffect(() => {
    const runStarted = isRunning && !wasRunningRef.current;
    wasRunningRef.current = isRunning;
    if (runStarted) setIsStopped(false);
  }, [isRunning]);

  const stopRun = useCallback(() => {
    onStop();
    setIsStopped(true);
  }, [onStop]);

  const value = useMemo(() => ({ stopRun, isStopped }), [stopRun, isStopped]);

  return (
    <StoppedRunContext.Provider value={value}>
      {children}
    </StoppedRunContext.Provider>
  );
}

export default StoppedRunProvider;
