import React from 'react';
import { AuiIf, useAuiState } from '@assistant-ui/react';

import { StatusIndicator } from '../StatusIndicator';

export function deriveStatusLabel(content) {
  const toolCalls = content.filter((part) => part.type === 'tool-call');

  if (toolCalls.length > 0) {
    const latestTool = toolCalls[toolCalls.length - 1];
    const toolName = latestTool.toolName || 'tool';
    return `Calling ${toolName}...`;
  }
  if (toolCalls.some((tc) => tc.result !== undefined)) {
    return 'Preparing response...';
  }
  return 'Thinking...';
}

export function StatusIndicatorContainer() {
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
      <StatusIndicator label={deriveStatusLabel(message.content)} />
    </AuiIf>
  );
}
