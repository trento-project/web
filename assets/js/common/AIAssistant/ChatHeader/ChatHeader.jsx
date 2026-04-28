import React, { useCallback } from 'react';
import { EOS_CLOSE } from 'eos-icons-react';
import { useAui } from '@assistant-ui/react';

import Button from '@common/Button';

import { useAIConnectionStatus } from '../AssistantChatProvider';

const STATUS_VIEW = {
  connected: { text: 'Online', dot: 'bg-white' },
  connecting: { text: 'Connecting...', dot: 'bg-yellow-300 animate-pulse' },
  disconnected: { text: 'Offline', dot: 'bg-red-400' },
};

const stopPointerDown = (e) => e.stopPropagation();

export function ChatHeaderView({ connectionStatus, onNewChat, onClose }) {
  const { text, dot } =
    STATUS_VIEW[connectionStatus] ?? STATUS_VIEW.disconnected;

  return (
    <div className="drag-handle flex items-center justify-between bg-[#2fb371] px-5 py-4 text-white cursor-move">
      <div className="flex items-center gap-3">
        <div
          className={`w-2.5 h-2.5 rounded-full mt-1 shadow-sm ml-1 ${dot}`}
        />
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-lg">Liz</span>
          <span className="text-sm font-medium opacity-95">{text}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="link"
          size="none"
          onPointerDown={stopPointerDown}
          onClick={onNewChat}
          className="text-sm !text-white hover:!text-white hover:underline"
        >
          New chat
        </Button>
        <Button
          type="icon"
          size="none"
          onPointerDown={stopPointerDown}
          onClick={onClose}
          aria-label="Close"
        >
          <EOS_CLOSE className="h-6 w-6 fill-current" />
        </Button>
      </div>
    </div>
  );
}

export function ChatHeader({ onClose }) {
  const aui = useAui();
  const connectionStatus = useAIConnectionStatus();

  const onNewChat = useCallback(() => {
    aui.threads().switchToNewThread();
  }, [aui]);

  return (
    <ChatHeaderView
      connectionStatus={connectionStatus}
      onNewChat={onNewChat}
      onClose={onClose}
    />
  );
}
