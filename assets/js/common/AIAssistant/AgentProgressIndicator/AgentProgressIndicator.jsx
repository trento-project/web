// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { AuiIf, useAuiState } from '@assistant-ui/react';
import { filter, isUndefined, last } from 'lodash';

import Spinner from '@common/Spinner';

export function AgentProgressIndicatorView({ children }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground mt-2">
      <Spinner />
      <span className="text-sm">{children}</span>
    </div>
  );
}

export function deriveProgressLabel(content) {
  const lastToolCall = last(filter(content, { type: 'tool-call' }));
  if (lastToolCall && isUndefined(lastToolCall.result))
    return `Calling ${lastToolCall.toolName || 'tool'}...`;
  return 'Thinking...';
}

export function AgentProgressIndicator() {
  const message = useAuiState((s) => s.message);

  return (
    <AuiIf
      condition={({ thread }) => {
        if (!thread.isRunning) return false;
        return !message.content.some(
          (part) => part.type === 'text' && part.text?.trim().length > 0
        );
      }}
    >
      <AgentProgressIndicatorView>
        {deriveProgressLabel(message.content)}
      </AgentProgressIndicatorView>
    </AuiIf>
  );
}
