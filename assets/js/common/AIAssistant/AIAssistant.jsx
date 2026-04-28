import React, { useState } from 'react';

import { AssistantChatProvider } from './AssistantChatProvider';
import { AssistantThread } from './AssistantThread';
import { ModalFrame } from './components/ModalFrame';

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <AssistantChatProvider>
      <ModalFrame open={isOpen} onOpenChange={setIsOpen}>
        <AssistantThread onClose={handleClose} />
      </ModalFrame>
    </AssistantChatProvider>
  );
}

export default AIAssistant;
