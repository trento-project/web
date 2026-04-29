import React, { useState } from 'react';

import { AssistantChatProvider } from './AssistantChatProvider';
import { AssistantThread } from './AssistantThread';
import { ModalFrame } from './ModalFrame';

function AIAssistant({ open = false }) {
  const [isOpen, setIsOpen] = useState(open);
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
