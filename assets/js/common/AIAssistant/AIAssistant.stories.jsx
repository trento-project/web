import React from 'react';
import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { AIAssistantModal } from './AIAssistant';

export default {
  title: 'Common/AIAssistant',
  component: AIAssistantModal,
};

function MockProvider({ children, initialMessages = [] }) {
  const runtime = useLocalRuntime({
    initialMessages,
  });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

export function Default() {
  return (
    <MockProvider>
      <div className="h-[800px] w-full bg-gray-100 p-8">
        <AIAssistantModal />
      </div>
    </MockProvider>
  );
}

export function WithMessages() {
  return (
    <MockProvider
      initialMessages={[
        {
          id: '1',
          role: 'user',
          content: [
            { type: 'text', text: 'Hello, what is the status of the cluster?' },
          ],
        },
        {
          id: '2',
          role: 'assistant',
          content: [{ type: 'text', text: 'The cluster is running smoothly.' }],
        },
      ]}
    >
      <div className="h-[800px] w-full bg-gray-100 p-8">
        <AIAssistantModal />
      </div>
    </MockProvider>
  );
}
