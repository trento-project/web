// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { get } from 'lodash';
import { ComposerPrimitive } from '@assistant-ui/react';

import Button from '@common/Button';
import { CONNECTION_STATUS } from '@lib/ai';

import {
  CONFIGURATION_STATUS,
  canSendMessage,
  isChatReadOnly,
} from '../status';

const COMPOSER_INPUT_CLASS_NAME =
  'w-full border border-gray-300 rounded-lg p-4 text-gray-700 resize-none h-[130px] focus:outline-none focus:border-[#2fb371] focus:ring-1 focus:ring-[#2fb371] placeholder-gray-400 text-lg font-medium bg-white shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed';

const PLACEHOLDERS = {
  [CONNECTION_STATUS.CONNECTED]: 'How can I help you?',
  [CONNECTION_STATUS.CONNECTING]: 'Connecting...',
  [CONNECTION_STATUS.DISCONNECTED]: 'Offline - waiting to reconnect...',
};

// Read-only has two causes that need different wording:
// - CLEARED means there is nothing left to answer with
// - RESTORED means a configuration is back but a new chat needs to be started
const READ_ONLY_PLACEHOLDERS = {
  [CONFIGURATION_STATUS.CLEARED]: 'AI Assistant is disabled',
  [CONFIGURATION_STATUS.RESTORED]: 'Start a new chat to continue',
};

const footnote = (
  <>
    AI assistants can make mistakes.
    <br />
    <a
      href="https://documentation.suse.com/sles-sap/trento/html/SLES-SAP-trento/index.html"
      className="underline hover:text-gray-500"
      target="_blank"
      rel="noopener noreferrer"
    >
      Learn more
    </a>
  </>
);

function SendButton({ disabled, isRunning, reason }) {
  if (isRunning) return null;
  return (
    <ComposerPrimitive.Send asChild>
      <Button
        asSubmit
        type="default-fit"
        disabled={disabled}
        aria-label="Send message"
        title={disabled ? reason : 'Send message'}
      >
        Send
      </Button>
    </ComposerPrimitive.Send>
  );
}

function PromptComposer({
  connectionStatus,
  configurationStatus = CONFIGURATION_STATUS.OK,
  isRunning = false,
}) {
  const inputDisabled = !canSendMessage(connectionStatus, configurationStatus);
  const placeholder = isChatReadOnly(configurationStatus)
    ? get(
        READ_ONLY_PLACEHOLDERS,
        configurationStatus,
        READ_ONLY_PLACEHOLDERS[CONFIGURATION_STATUS.CLEARED]
      )
    : get(
        PLACEHOLDERS,
        connectionStatus,
        PLACEHOLDERS[CONNECTION_STATUS.DISCONNECTED]
      );

  return (
    <ComposerPrimitive.Root className="relative flex w-full flex-col">
      <div className="relative flex w-full flex-col outline-none">
        <ComposerPrimitive.AttachmentDropzone className="relative flex w-full flex-col outline-none">
          <ComposerPrimitive.Input
            className={COMPOSER_INPUT_CLASS_NAME}
            placeholder={placeholder}
            disabled={inputDisabled}
            aria-label="Message input"
          />
        </ComposerPrimitive.AttachmentDropzone>
      </div>
      <div className="flex justify-between items-center w-full mt-4">
        <div className="text-sm text-gray-400 leading-tight">{footnote}</div>
        <SendButton
          disabled={inputDisabled}
          isRunning={isRunning}
          reason={placeholder}
        />
      </div>
    </ComposerPrimitive.Root>
  );
}

export default PromptComposer;
