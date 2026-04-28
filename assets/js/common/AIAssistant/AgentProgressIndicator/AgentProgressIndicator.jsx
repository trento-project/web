import React from 'react';
import { AuiIf, useAuiState } from '@assistant-ui/react';

import Spinner from '@common/Spinner';

export function AgentProgressIndicatorView({ label }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground mt-2">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function deriveProgressLabel(content) {
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
      <AgentProgressIndicatorView
        label={deriveProgressLabel(message.content)}
      />
    </AuiIf>
  );
}
