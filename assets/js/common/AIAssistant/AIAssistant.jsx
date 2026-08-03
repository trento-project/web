// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useAuiState } from '@assistant-ui/react';

import { CONNECTION_STATUS } from '@lib/ai';

import AssistantChatProvider from './AssistantChatProvider';
import AssistantThread from './AssistantThread';
import ModalFrame from './ModalFrame';
import {
  CONFIGURATION_STATUS,
  isConfigurationCleared,
  isConfigurationAvailable,
} from './status';

function AssistantUI({
  open,
  connectionStatus,
  configurationStatus,
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
        configurationStatus={configurationStatus}
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
  const [configurationStatus, setConfigurationStatus] = useState(
    aiConfigured ? CONFIGURATION_STATUS.OK : CONFIGURATION_STATUS.CLEARED
  );

  // The channel stays mounted even when the launcher is disabled, so a "created" event can re-enable this tab
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const startNewThread = useCallback(() => {
    setThreadID(crypto.randomUUID());
    setConfigurationStatus(CONFIGURATION_STATUS.OK);
  }, []);

  const handleAIConfigurationCleared = useCallback(
    () => setConfigurationStatus(CONFIGURATION_STATUS.CLEARED),
    []
  );

  const handleAIConfigurationCreated = useCallback(() => {
    // A still-open cleared chat must be explicitly restarted by the user;
    // otherwise (closed launcher) just re-enable and reset the thread so the
    // next open starts fresh.
    if (isOpenRef.current) {
      setConfigurationStatus((prev) =>
        isConfigurationCleared(prev) ? CONFIGURATION_STATUS.RESTORED : prev
      );
    } else {
      startNewThread();
    }
  }, [startNewThread]);

  const configurationAvailable = isConfigurationAvailable(configurationStatus);

  return (
    <AssistantChatProvider
      userID={userID}
      threadID={threadID}
      onConnectionChange={setConnectionStatus}
      onAIConfigurationCleared={handleAIConfigurationCleared}
      onAIConfigurationCreated={handleAIConfigurationCreated}
    >
      <AssistantUI
        open={isOpen}
        connectionStatus={connectionStatus}
        configurationStatus={configurationStatus}
        onOpenChange={setIsOpen}
        onNewThread={startNewThread}
        handleClose={handleClose}
        disabled={!configurationAvailable && !isOpen}
      />
    </AssistantChatProvider>
  );
}

export default AIAssistant;
