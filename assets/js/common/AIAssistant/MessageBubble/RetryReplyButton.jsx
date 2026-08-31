// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { ActionBarPrimitive, useAuiState } from '@assistant-ui/react';
import { useActionBarReload } from '@assistant-ui/core/react';
import { EOS_REFRESH_FILLED } from 'eos-icons-react';

// Re-runs the prompt this reply answered.
//
// Offered on the newest reply only: the server keeps the conversation of its
// own, keyed by thread, so re-asking an older question would append it after
// everything that has been said since.
//
// `ActionBarPrimitive.Reload` would render itself disabled while the thread is
// busy. We drop it from the bar instead, the way `CopyReplyButton` does, so
// each action owns when it is offered and the bar never holds a dead button.
function RetryReplyButton() {
  const isLast = useAuiState((s) => s.message.isLast);
  const { disabled } = useActionBarReload();

  if (!isLast || disabled) return null;

  return (
    <ActionBarPrimitive.Reload asChild>
      <button
        aria-label="retry"
        className="hover:bg-gray-100 rounded-full p-2 hover:opacity-60"
      >
        <EOS_REFRESH_FILLED className="p-1 mx-auto" size="25" />
      </button>
    </ActionBarPrimitive.Reload>
  );
}

export default RetryReplyButton;
