// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { ActionBarPrimitive } from '@assistant-ui/react';
import { useActionBarReload } from '@assistant-ui/core/react';
import { EOS_REFRESH_FILLED } from 'eos-icons-react';

// Re-runs the last prompt.
// - Only the last reply can be retried
// - current response to the last prompt goes away from the screen
// - retrial is available only on active chats
function RetryReplyButton({ isLast = false, isChatActive = false }) {
  const { disabled } = useActionBarReload();

  if (disabled || !isLast || !isChatActive) return null;

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
