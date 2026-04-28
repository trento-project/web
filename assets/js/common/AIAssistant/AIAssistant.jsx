import React, { useCallback, useState } from 'react';

import { AssistantChatProvider } from './AssistantChatProvider';
import { AssistantThread } from './AssistantThread';
import { ModalFrame } from './components/ModalFrame';

export function AIAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <ModalFrame open={isOpen} onOpenChange={setIsOpen}>
      <AssistantThread onClose={handleClose} />
    </ModalFrame>
  );
}

function AIAssistant() {
  return (
    <AssistantChatProvider>
      <AIAssistantModal />
    </AssistantChatProvider>
  );
}

export default AIAssistant;
