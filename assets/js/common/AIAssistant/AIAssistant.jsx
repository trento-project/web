import React, { useState } from 'react';

import { useAuiState } from '@assistant-ui/react';

import { CONNECTION_STATUS } from '@lib/ai';

import AssistantChatProvider from './AssistantChatProvider';
import AssistantThread from './AssistantThread';
import { ModalFrame } from './ModalFrame';

export function AssistantUI({
  open,
  connectionStatus,
  onOpenChange,
  onNewThread,
  handleClose,
}) {
  const isEmpty = useAuiState((s) => s.thread.isEmpty);
  const isRunning = useAuiState((s) => s.thread.isRunning);

  return (
    <ModalFrame open={open} onOpenChange={onOpenChange}>
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
  open = false,
  initialConnectionStatus = CONNECTION_STATUS.DISCONNECTED,
}) {
  const [isOpen, setIsOpen] = useState(open);
  const handleClose = () => setIsOpen(false);
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());
  const [connectionStatus, setConnectionStatus] = useState(
    initialConnectionStatus
  );

  const onNewThread = () => setThreadId(crypto.randomUUID());

  return (
    <AssistantChatProvider
      userID={userID}
      threadId={threadId}
      onConnectionChange={setConnectionStatus}
    >
      <AssistantUI
        open={isOpen}
        connectionStatus={connectionStatus}
        onOpenChange={setIsOpen}
        onNewThread={onNewThread}
        handleClose={handleClose}
      />
    </AssistantChatProvider>
  );
}

export default AIAssistant;
