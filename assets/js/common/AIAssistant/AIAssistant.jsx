// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';

import { useAuiState } from '@assistant-ui/react';

import { CONNECTION_STATUS } from '@lib/ai';

import AssistantChatProvider from './AssistantChatProvider';
import AssistantThread from './AssistantThread';
import ModalFrame from './ModalFrame';

export function AssistantUI({
  open,
  connectionStatus,
  onOpenChange,
  onNewThread,
  handleClose,
  disabled = false,
}) {
  const isEmpty = useAuiState((s) => s.thread.isEmpty);
  const isRunning = useAuiState((s) => s.thread.isRunning);

  return (
    <ModalFrame open={open} onOpenChange={onOpenChange} disabled={disabled}>
      <AssistantThread
        connectionStatus={connectionStatus}
        onClose={handleClose}
        onNewThread={onNewThread}
        isEmpty={isEmpty}
        isRunning={isRunning}
      />
    </ModalFrame>
  );
}

function AIAssistant({
  userID,
  aiConfigured = true,
  open = false,
  initialConnectionStatus = CONNECTION_STATUS.DISCONNECTED,
}) {
  const [isOpen, setIsOpen] = useState(open);
  const handleClose = () => setIsOpen(false);
  const [threadID, setThreadID] = useState(() => crypto.randomUUID());
  const [connectionStatus, setConnectionStatus] = useState(
    initialConnectionStatus
  );

  const onNewThread = () => setThreadID(crypto.randomUUID());

  return (
    <AssistantChatProvider
      userID={userID}
      threadID={threadID}
      onConnectionChange={setConnectionStatus}
    >
      <AssistantUI
        open={isOpen}
        connectionStatus={connectionStatus}
        onOpenChange={setIsOpen}
        onNewThread={onNewThread}
        handleClose={handleClose}
        disabled={!aiConfigured && !isOpen}
      />
    </AssistantChatProvider>
  );
}

export default AIAssistant;
