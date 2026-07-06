// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Link } from 'react-router';
import { EOS_CHAT_BUBBLE_OUTLINED } from 'eos-icons-react';

import { useAuiState } from '@assistant-ui/react';

import { CONNECTION_STATUS } from '@lib/ai';
import Button from '@common/Button';
import Tooltip from '@common/Tooltip';

import AssistantChatProvider from './AssistantChatProvider';
import AssistantThread from './AssistantThread';
import ModalFrame from './ModalFrame';

const disabledTooltipContent = (
  <span className="text-center">
    AI Assistant is disabled. <br />
    Please check{' '}
    <Link
      to="/profile"
      className="underline hover:opacity-75 text-jungle-green-500"
    >
      Profile
    </Link>{' '}
    for Settings.
  </span>
);

// Shown when the current user has no AI settings. Mirrors the fab position of
// `ModalFrame`'s anchor, but the button is disabled and never opens the chat —
// a hover tooltip points the user to their Profile to configure it.
function DisabledAssistant() {
  return (
    <div className="fixed right-6 bottom-20 size-12 z-40">
      <Tooltip
        content={disabledTooltipContent}
        place="left"
        mouseLeaveDelay={0.3}
      >
        <Button
          type="fab"
          size="none"
          className="size-full"
          disabled
          data-testid="ai-assistant-trigger-disabled"
          aria-label="AI Assistant is disabled"
        >
          <EOS_CHAT_BUBBLE_OUTLINED className="fill-white" />
        </Button>
      </Tooltip>
    </div>
  );
}

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

  if (!aiConfigured) {
    return <DisabledAssistant />;
  }

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
      />
    </AssistantChatProvider>
  );
}

export default AIAssistant;
