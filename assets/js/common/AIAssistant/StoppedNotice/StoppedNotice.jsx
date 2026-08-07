// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useAuiState } from '@assistant-ui/react';

import { useStoppedRun } from '../StoppedRunProvider';

export function StoppedNoticeView({ children }) {
  return <div className="mt-2 text-sm text-gray-400">{children}</div>;
}

// Can't key off `s.message.status`: the AG-UI subscriber dispatches a
// synthesized RUN_FINISHED whenever the run settles — including on
// cancel — which overwrites `incomplete/cancelled` with `complete/unknown`
// before this could ever read it (confirmed @assistant-ui/react-ag-ui
// defect). The stopped state instead comes from our own StoppedRunProvider,
// keyed by this message's own id.
function StoppedNotice() {
  const messageId = useAuiState((s) => s.message.id);
  const { isMessageStopped } = useStoppedRun();

  if (!isMessageStopped(messageId)) return null;

  return <StoppedNoticeView>Response stopped.</StoppedNoticeView>;
}

export default StoppedNotice;
