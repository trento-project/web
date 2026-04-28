import React from 'react';
import { AuiIf, ComposerPrimitive } from '@assistant-ui/react';

import { useAIConnectionStatus } from '../AssistantChatProvider';
import {
  ComposerChrome,
  COMPOSER_INPUT_CLASS_NAME,
  COMPOSER_SEND_BUTTON_CLASS_NAME,
} from '../components/ComposerChrome';

const PLACEHOLDERS = {
  connected: 'How can I help you?',
  connecting: 'Connecting...',
  disconnected: 'Offline - waiting to reconnect...',
};

function SendButton({ disabled }) {
  return (
    <AuiIf condition={({ thread }) => !thread.isRunning}>
      <ComposerPrimitive.Send asChild>
        <button
          type="submit"
          disabled={disabled}
          className={COMPOSER_SEND_BUTTON_CLASS_NAME}
          aria-label="Send message"
          title={disabled ? 'Waiting for connection...' : 'Send message'}
        >
          Send
        </button>
      </ComposerPrimitive.Send>
    </AuiIf>
  );
}

export function ComposerContainer() {
  const status = useAIConnectionStatus();
  const isConnected = status === 'connected';
  const placeholder = PLACEHOLDERS[status] ?? PLACEHOLDERS.disconnected;

  return (
    <ComposerPrimitive.Root className="relative flex w-full flex-col">
      <ComposerChrome
        inputSlot={
          <ComposerPrimitive.AttachmentDropzone className="relative flex w-full flex-col outline-none">
            <ComposerPrimitive.Input
              placeholder={placeholder}
              disabled={!isConnected}
              className={COMPOSER_INPUT_CLASS_NAME}
              aria-label="Message input"
            />
          </ComposerPrimitive.AttachmentDropzone>
        }
        actionSlot={<SendButton disabled={!isConnected} />}
      />
    </ComposerPrimitive.Root>
  );
}
