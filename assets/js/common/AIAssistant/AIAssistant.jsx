// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';

import { useAuiState } from '@assistant-ui/react';
import { v4 as uuidv4 } from 'uuid';

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
  modelNotice = null,
  onDismissModelNotice,
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
        modelNotice={modelNotice}
        onDismissModelNotice={onDismissModelNotice}
      />
    </ModalFrame>
  );
}

function AIAssistant({ userID, aiConfigured = true, open = false }) {
  const [isOpen, setIsOpen] = useState(open);
  const handleClose = () => setIsOpen(false);
  const [threadID, setThreadID] = useState(() => uuidv4());
  const [connectionStatus, setConnectionStatus] = useState(
    CONNECTION_STATUS.DISCONNECTED
  );
  const [configurationStatus, setConfigurationStatus] = useState(
    aiConfigured ? CONFIGURATION_STATUS.OK : CONFIGURATION_STATUS.CLEARED
  );
  const [modelNotice, setModelNotice] = useState(null);

  // The channel stays mounted even when the launcher is disabled, so a "created" event can re-enable this tab
  const startNewThread = () => {
    setThreadID(uuidv4());
    setConfigurationStatus(CONFIGURATION_STATUS.OK);
    setModelNotice(null);
  };

  const handleModelChanged = (payload) => setModelNotice(payload);

  const handleDismissModelNotice = () => setModelNotice(null);

  const handleAIConfigurationCleared = () =>
    setConfigurationStatus(CONFIGURATION_STATUS.CLEARED);

  const handleAIConfigurationCreated = () => {
    // A still-open cleared chat must be explicitly restarted by the user;
    // otherwise (closed launcher) just re-enable and reset the thread so the
    // next open starts fresh.
    if (isOpen) {
      setConfigurationStatus((prev) =>
        isConfigurationCleared(prev) ? CONFIGURATION_STATUS.RESTORED : prev
      );
    } else {
      startNewThread();
    }
  };

  const configurationAvailable = isConfigurationAvailable(configurationStatus);

  return (
    <AssistantChatProvider
      userID={userID}
      threadID={threadID}
      onConnectionChange={setConnectionStatus}
      onAIConfigurationCleared={handleAIConfigurationCleared}
      onAIConfigurationCreated={handleAIConfigurationCreated}
      onModelChanged={handleModelChanged}
    >
      <AssistantUI
        open={isOpen}
        connectionStatus={connectionStatus}
        configurationStatus={configurationStatus}
        onOpenChange={setIsOpen}
        onNewThread={startNewThread}
        handleClose={handleClose}
        modelNotice={modelNotice}
        onDismissModelNotice={handleDismissModelNotice}
        disabled={!configurationAvailable && !isOpen}
      />
    </AssistantChatProvider>
  );
}

export default AIAssistant;
