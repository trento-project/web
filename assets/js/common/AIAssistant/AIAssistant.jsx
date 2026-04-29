import React, { useState } from 'react';

import { SocketProvider } from '@common/SocketProvider';

import { AssistantChatProvider } from './AssistantChatProvider';
import { AssistantThread } from './AssistantThread';
import { ModalFrame } from './ModalFrame';

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <SocketProvider>
      <AssistantChatProvider>
        <ModalFrame open={isOpen} onOpenChange={setIsOpen}>
          <AssistantThread onClose={handleClose} />
        </ModalFrame>
      </AssistantChatProvider>
    </SocketProvider>
  );
}

export default AIAssistant;
