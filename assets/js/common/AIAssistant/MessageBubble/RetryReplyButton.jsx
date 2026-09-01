// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { ActionBarPrimitive } from '@assistant-ui/react';
import { useActionBarReload } from '@assistant-ui/core/react';
import { EOS_REFRESH_FILLED } from 'eos-icons-react';

// Re-runs the last prompt. Only the last can be retried.
//
// Current response for the last prompts goes away from screen
function RetryReplyButton({ isLast = false }) {
  const { disabled } = useActionBarReload();

  if (disabled || !isLast) return null;

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
