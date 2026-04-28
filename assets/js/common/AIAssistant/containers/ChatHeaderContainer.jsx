import React, { useCallback } from 'react';
import { useAui } from '@assistant-ui/react';

import { useAIConnectionStatus } from '../AssistantChatProvider';
import { ChatHeader } from '../components/ChatHeader';

export function ChatHeaderContainer({ onClose }) {
  const aui = useAui();
  const connectionStatus = useAIConnectionStatus();

  const onNewChat = useCallback(() => {
    aui.threads().switchToNewThread();
  }, [aui]);

  return (
    <ChatHeader
      connectionStatus={connectionStatus}
      onNewChat={onNewChat}
      onClose={onClose}
    />
  );
}
