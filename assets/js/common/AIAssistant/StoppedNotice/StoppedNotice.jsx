// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useAuiState } from '@assistant-ui/react';

export function StoppedNoticeView({ children }) {
  return <div className="mt-2 text-sm text-gray-400">{children}</div>;
}

// Reads `s.message` from the per-message scope set up by assistant-ui's
// MessageByIndexProvider (one per <MessagePrimitive.Root>), the same way
// AgentProgressIndicator does. The AG-UI run aggregator stamps a cancelled run's
// message with `{type: 'incomplete', reason: 'cancelled'}` — the only signal
// distinguishing "the user hit Stop" from "the answer ended".
//
// `reason: 'error'` is deliberately not covered: MessageError already renders
// that, and two notices under one answer read as two separate failures.
function StoppedNotice() {
  const { status } = useAuiState((s) => s.message);

  if (status?.type !== 'incomplete' || status?.reason !== 'cancelled') {
    return null;
  }

  return <StoppedNoticeView>Response stopped.</StoppedNoticeView>;
}

export default StoppedNotice;
