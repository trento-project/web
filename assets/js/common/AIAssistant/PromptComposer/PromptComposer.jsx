// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { ComposerPrimitive } from '@assistant-ui/react';

import Button from '@common/Button';
import { CONNECTION_STATUS } from '@lib/ai';

const COMPOSER_INPUT_CLASS_NAME =
  'w-full border border-gray-300 rounded-lg p-4 text-gray-700 resize-none h-[130px] focus:outline-none focus:border-[#2fb371] focus:ring-1 focus:ring-[#2fb371] placeholder-gray-400 text-lg font-medium bg-white shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed';

const PLACEHOLDERS = {
  [CONNECTION_STATUS.CONNECTED]: 'How can I help you?',
  [CONNECTION_STATUS.CONNECTING]: 'Connecting...',
  [CONNECTION_STATUS.DISCONNECTED]: 'Offline - waiting to reconnect...',
};

const footnote = (
  <>
    AI assistants can make mistakes.
    <br />
    <a
      href="https://documentation.suse.com/sles-sap/trento/html/SLES-SAP-trento/index.html"
      className="underline hover:text-gray-500"
    >
      Learn more
    </a>
  </>
);

function SendButton({ disabled, isRunning }) {
  if (isRunning) return null;
  return (
    <ComposerPrimitive.Send asChild>
      <Button
        asSubmit
        type="default-fit"
        disabled={disabled}
        aria-label="Send message"
        title={disabled ? 'Waiting for connection...' : 'Send message'}
      >
        Send
      </Button>
    </ComposerPrimitive.Send>
  );
}

export function PromptComposer({ connectionStatus, isRunning = false }) {
  const isConnected = connectionStatus === CONNECTION_STATUS.CONNECTED;
  const placeholder =
    PLACEHOLDERS[connectionStatus] ??
    PLACEHOLDERS[CONNECTION_STATUS.DISCONNECTED];

  return (
    <ComposerPrimitive.Root className="relative flex w-full flex-col">
      <div className="relative flex w-full flex-col outline-none">
        <ComposerPrimitive.AttachmentDropzone className="relative flex w-full flex-col outline-none">
          <ComposerPrimitive.Input
            className={COMPOSER_INPUT_CLASS_NAME}
            placeholder={placeholder}
            disabled={!isConnected}
            aria-label="Message input"
          />
        </ComposerPrimitive.AttachmentDropzone>
      </div>
      <div className="flex justify-between items-center w-full mt-4">
        <div className="text-sm text-gray-400 leading-tight">{footnote}</div>
        <SendButton disabled={!isConnected} isRunning={isRunning} />
      </div>
    </ComposerPrimitive.Root>
  );
}
