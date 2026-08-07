// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useAuiState } from '@assistant-ui/react';

export function StoppedNoticeView({ children }) {
  return <div className="mt-2 text-sm text-gray-400">{children}</div>;
}

// Can't key off `s.message.status`: the AG-UI subscriber dispatches a
// synthesized RUN_FINISHED whenever the run settles — including on
// cancel — which overwrites `incomplete/cancelled` with `complete/unknown`
// before this could ever read it (confirmed @assistant-ui/react-ag-ui
// defect). `isStopped` instead comes from our own StoppedRunProvider state.
//
// The `isLast` guard is load-bearing: `isStopped` outlives the run it
// belongs to, so without it every earlier assistant message in the thread
// would render the marker too.
function StoppedNotice({ isStopped = false }) {
  const isLast = useAuiState((s) => s.message.isLast);

  if (!isStopped || !isLast) return null;

  return <StoppedNoticeView>Response stopped.</StoppedNoticeView>;
}

export default StoppedNotice;
