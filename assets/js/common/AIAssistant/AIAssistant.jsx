// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { EOS_CHAT_BUBBLE_OUTLINED } from 'eos-icons-react';

import { useAuiState } from '@assistant-ui/react';

import { CONNECTION_STATUS } from '@lib/ai';
import Button from '@common/Button';
import Tooltip from '@common/Tooltip';

import AssistantChatProvider from './AssistantChatProvider';
import AssistantThread from './AssistantThread';
import ModalFrame from './ModalFrame';
import { STATUS } from './status';

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
  status = STATUS.OK,
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
        status={status}
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
  // Driven in real time by AI configuration lifecycle events pushed over the
  // channel (this or another tab / a raw API call). Initial value comes from
  // whether the user was configured at mount.
  const [status, setStatus] = useState(
    aiConfigured ? STATUS.OK : STATUS.CLEARED
  );

  // The channel stays mounted even when the launcher is disabled, so a "created"
  // event can re-enable this tab. Handlers read the latest `isOpen` via a ref
  // since they're memoized once (stable identity keeps the agent from rebuilding).
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const startNewThread = useCallback(() => {
    setThreadID(crypto.randomUUID());
    setStatus(STATUS.OK);
  }, []);

  const handleAIConfigurationCleared = useCallback(
    () => setStatus(STATUS.CLEARED),
    []
  );

  const handleAIConfigurationCreated = useCallback(() => {
    // A still-open cleared chat must be explicitly restarted by the user;
    // otherwise (closed launcher) just re-enable and reset the thread so the
    // next open starts fresh.
    if (isOpenRef.current) {
      setStatus((prev) => (prev === STATUS.CLEARED ? STATUS.RESTORED : prev));
    } else {
      startNewThread();
    }
  }, [startNewThread]);

  const available = status !== STATUS.CLEARED;

  return (
    <AssistantChatProvider
      userID={userID}
      threadID={threadID}
      onConnectionChange={setConnectionStatus}
      onAIConfigurationCleared={handleAIConfigurationCleared}
      onAIConfigurationCreated={handleAIConfigurationCreated}
    >
      {!available && !isOpen ? (
        // Launcher disabled + closed: hover tooltip points to Profile. The
        // provider (and channel) stays mounted so a later "created" event
        // re-enables this tab.
        <DisabledAssistant />
      ) : (
        <AssistantUI
          open={isOpen}
          connectionStatus={connectionStatus}
          onOpenChange={setIsOpen}
          onNewThread={startNewThread}
          handleClose={handleClose}
          status={status}
        />
      )}
    </AssistantChatProvider>
  );
}

export default AIAssistant;
