// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { EOS_CLOSE } from 'eos-icons-react';

import Button from '@common/Button';
import { CONNECTION_STATUS } from '@lib/ai';

import { STATUS } from '../status';

const STATUS_VIEW = {
  [CONNECTION_STATUS.CONNECTED]: { text: 'Online', dot: 'bg-white' },
  [CONNECTION_STATUS.CONNECTING]: {
    text: 'Connecting...',
    dot: 'bg-yellow-300 animate-pulse',
  },
  [CONNECTION_STATUS.DISCONNECTED]: { text: 'Offline', dot: 'bg-red-400' },
};

const stopPointerDown = (e) => e.stopPropagation();

function ChatHeader({
  connectionStatus,
  status = STATUS.OK,
  onNewChat,
  onClose,
  disabled = false,
}) {
  // A cleared AI configuration takes Liz offline regardless of the socket state;
  // a restored/ok configuration falls back to the live connection status.
  const { text, dot } =
    status === STATUS.CLEARED
      ? STATUS_VIEW[CONNECTION_STATUS.DISCONNECTED]
      : (STATUS_VIEW[connectionStatus] ??
         STATUS_VIEW[CONNECTION_STATUS.DISCONNECTED]);

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
          disabled={disabled}
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

export default ChatHeader;
