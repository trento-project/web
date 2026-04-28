import React from 'react';
import { AuiIf, ComposerPrimitive } from '@assistant-ui/react';

import Button from '@common/Button';

import { useAIConnectionStatus } from '../AssistantChatProvider';
import { PromptComposer, PromptInput } from '../PromptComposer';

const PLACEHOLDERS = {
  connected: 'How can I help you?',
  connecting: 'Connecting...',
  disconnected: 'Offline - waiting to reconnect...',
};

function SendButton({ disabled }) {
  return (
    <AuiIf condition={({ thread }) => !thread.isRunning}>
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
    </AuiIf>
  );
}

export function ComposerContainer() {
  const status = useAIConnectionStatus();
  const isConnected = status === 'connected';
  const placeholder = PLACEHOLDERS[status] ?? PLACEHOLDERS.disconnected;

  return (
    <ComposerPrimitive.Root className="relative flex w-full flex-col">
      <PromptComposer
        inputSlot={
          <ComposerPrimitive.AttachmentDropzone className="relative flex w-full flex-col outline-none">
            <PromptInput
              placeholder={placeholder}
              disabled={!isConnected}
              aria-label="Message input"
            />
          </ComposerPrimitive.AttachmentDropzone>
        }
        actionSlot={<SendButton disabled={!isConnected} />}
      />
    </ComposerPrimitive.Root>
  );
}
