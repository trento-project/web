// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useAuiState } from '@assistant-ui/react';
import { filter, isUndefined, last } from 'lodash';

import Spinner from '@common/Spinner';

export function deriveProgressLabel(content) {
  const lastToolCall = last(filter(content, { type: 'tool-call' }));
  if (lastToolCall && isUndefined(lastToolCall.result))
    return `Calling ${lastToolCall.toolName || 'tool'}...`;
  return 'Thinking...';
}

export function AgentProgressIndicatorView({ spinner = true, children }) {
  return (
    <div role="status" className="flex items-center gap-2 text-gray-600 mt-2">
      {spinner && <Spinner />}
      <span className="text-sm">{children}</span>
    </div>
  );
}

const wasStopped = (status) =>
  status?.type === 'incomplete' && status.reason === 'cancelled';

const hasStreamedText = (content) =>
  content.some((part) => part.type === 'text' && part.text?.trim().length > 0);

const deriveNotice = ({ isRunning, message }) => {
  const { status, content, isLast } = message;

  if (wasStopped(status)) return { label: 'Response stopped.', spinner: false };

  if (isRunning && isLast && !hasStreamedText(content))
    return { label: deriveProgressLabel(content), spinner: true };

  return null;
};

// Reads `s.message` from the per-message scope set up by assistant-ui's
// MessageByIndexProvider (one per <MessagePrimitive.Root>). Subscribing
// directly here keeps the indicator reactive to streaming tool-call
// updates
function AgentProgressIndicator({ isRunning }) {
  const message = useAuiState((s) => s.message);
  const notice = deriveNotice({ isRunning, message });

  if (!notice) return null;

  return (
    <AgentProgressIndicatorView spinner={notice.spinner}>
      {notice.label}
    </AgentProgressIndicatorView>
  );
}

export default AgentProgressIndicator;
