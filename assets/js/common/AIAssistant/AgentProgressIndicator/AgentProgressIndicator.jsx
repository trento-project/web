// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useAuiState } from '@assistant-ui/react';
import { filter, isUndefined, last } from 'lodash';

import Spinner from '@common/Spinner';

export function deriveProgressLabel(content) {
  const lastToolCall = last(filter(content, { type: 'tool-call' }));
  if (lastToolCall && isUndefined(lastToolCall.result)) {
    return `Calling ${lastToolCall.toolName || 'tool'}...`;
  }
  console.log('Thinking...');
  return 'Thinking...';
}

export function AgentProgressIndicatorView({ children }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground mt-2">
      <Spinner />
      <span className="text-sm">{children}</span>
    </div>
  );
}

// Reads `s.message` from the per-message scope set up by assistant-ui's
// MessageByIndexProvider (one per <MessagePrimitive.Root>). Subscribing
// directly here keeps the indicator reactive to streaming tool-call
// updates
function AgentProgressIndicator({ isRunning }) {
  const message = useAuiState((s) => s.message);

  if (!isRunning) return null;
  if (
    message.content.some(
      (part) => part.type === 'text' && part.text?.trim().length > 0
    )
  ) {
    return null;
  }

  return (
    <AgentProgressIndicatorView>
      {deriveProgressLabel(message.content)}
    </AgentProgressIndicatorView>
  );
}

export default AgentProgressIndicator;
