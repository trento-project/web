// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useAuiState } from '@assistant-ui/react';

export function StoppedNoticeView({ children }) {
  return <div className="mt-2 text-sm text-gray-400">{children}</div>;
}

// The stopped state lives on the message itself, so it needs no state of ours
// and it persists for the rest of the conversation for free.
// `AgUiThreadRuntimeCore.cancel()` aborts its own controller after calling
// `agent.abortRun()`, the abort listener dispatches RUN_CANCELLED, and the
// aggregator turns that into `incomplete/cancelled`. Match on `reason` too:
// `incomplete/error` is a failed answer, which MessageError already reports.
function StoppedNotice() {
  const status = useAuiState((s) => s.message.status);

  if (status?.type !== 'incomplete' || status.reason !== 'cancelled') {
    return null;
  }

  return <StoppedNoticeView>Response stopped.</StoppedNoticeView>;
}

export default StoppedNotice;
