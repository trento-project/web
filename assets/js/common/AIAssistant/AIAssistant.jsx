import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

import { EOS_CHAT_BUBBLE_OUTLINED } from 'eos-icons-react';

import { AssistantModalPrimitive } from '@assistant-ui/react';
import { AssistantChatProvider } from './AssistantChatProvider';
import { AssistantThread } from './AssistantThread';

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AssistantChatProvider>
      <AssistantModalPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <AssistantModalPrimitive.Anchor className="fixed right-6 bottom-20 size-12 z-40">
          <AssistantModalPrimitive.Trigger asChild>
            <button
              className="size-full rounded-full bg-jungle-green-500 hover:bg-jungle-green-600 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90"
              aria-label="Open AI Assistant"
            >
              <EOS_CHAT_BUBBLE_OUTLINED className="fill-white" />
            </button>
          </AssistantModalPrimitive.Trigger>
        </AssistantModalPrimitive.Anchor>

        <AssistantModalPrimitive.Content
          sideOffset={16}
          className="z-[101] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <Rnd
            bounds="window"
            default={{
              width: 384,
              height: 650,
              x: -400,
              y: -650,
            }}
            minWidth={300}
            minHeight={400}
            maxWidth={window.innerWidth - 100}
            maxHeight={window.innerHeight - 200}
            dragHandleClassName="drag-handle"
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-2xl flex flex-col overflow-hidden"
          >
            <AssistantThread onClose={() => setIsOpen(false)} />
          </Rnd>
        </AssistantModalPrimitive.Content>
      </AssistantModalPrimitive.Root>
    </AssistantChatProvider>
  );
}

export default AIAssistant;
