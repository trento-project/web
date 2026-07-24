// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useAuiState } from '@assistant-ui/react';

import { CONNECTION_STATUS } from '@lib/ai';

import AssistantChatProvider from './AssistantChatProvider';
import AssistantThread from './AssistantThread';
import ModalFrame from './ModalFrame';
import { STATUS } from './status';

export function AssistantUI({
  open,
  connectionStatus,
  onOpenChange,
  onNewThread,
  handleClose,
  disabled = false,
  status = STATUS.OK,
  modelNotice = null,
  onDismissModelNotice,
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
        status={status}
        modelNotice={modelNotice}
        onDismissModelNotice={onDismissModelNotice}
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
  // `:event` model-change-notice strategy — latest {provider, model} pushed via
  // the dedicated channel event, rendered as a distinct banner.
  const [modelNotice, setModelNotice] = useState(null);

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
    setModelNotice(null);
  }, []);

  const handleModelChanged = useCallback(
    (payload) => setModelNotice(payload),
    []
  );

  const handleDismissModelNotice = useCallback(() => setModelNotice(null), []);

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
      onModelChanged={handleModelChanged}
    >
      <AssistantUI
        open={isOpen}
        connectionStatus={connectionStatus}
        onOpenChange={setIsOpen}
        onNewThread={startNewThread}
        handleClose={handleClose}
        status={status}
        modelNotice={modelNotice}
        onDismissModelNotice={handleDismissModelNotice}
        // Only present the disabled launcher when the chat is closed; if it's
        // open when the config disappears, keep the modal (read-only banner).
        disabled={!available && !isOpen}
      />
    </AssistantChatProvider>
  );
}

export default AIAssistant;
