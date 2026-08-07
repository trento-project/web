// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useAuiState } from '@assistant-ui/react';

import { useStoppedRun } from '../StoppedRunProvider';

export function StoppedNoticeView({ children }) {
  return <div className="mt-2 text-sm text-gray-400">{children}</div>;
}

// Can't key off `s.message.status`. The AG-UI subscriber only produces
// `incomplete/cancelled` when the run's Observable errors with an AbortError;
// ours completes instead (see `_settleActiveRun`), so its `onRunFinalized`
// dispatches a synthesized RUN_FINISHED and the status lands on
// `complete/unknown`. The stopped state instead comes from our own
// StoppedRunProvider, keyed by this message's position in the thread — see the
// comment there for why position and not id.
function StoppedNotice() {
  const messageIndex = useAuiState((s) => s.message.index);
  const { isMessageStopped } = useStoppedRun();

  if (!isMessageStopped(messageIndex)) return null;

  return <StoppedNoticeView>Response stopped.</StoppedNoticeView>;
}

export default StoppedNotice;
