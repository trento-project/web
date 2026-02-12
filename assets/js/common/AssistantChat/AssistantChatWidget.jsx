import React from 'react';
import { AssistantModalPrimitive, useAssistantTool } from '@assistant-ui/react';
import { MessageCircle } from 'lucide-react';
import { AssistantChatProvider } from './AssistantChatProvider';
import { AssistantThread } from './AssistantThread';

export function AssistantChatWidget() {
  return (
    <AssistantChatProvider>
      <AssistantModalPrimitive.Root>
        <AssistantModalPrimitive.Anchor className="fixed right-6 bottom-20 size-12 z-40">
          <AssistantModalPrimitive.Trigger asChild>
            <button
              className="size-full rounded-full bg-jungle-green-500 hover:bg-jungle-green-600 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90"
              aria-label="Open AI Assistant"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </AssistantModalPrimitive.Trigger>
        </AssistantModalPrimitive.Anchor>

        <AssistantModalPrimitive.Content
          sideOffset={16}
          className="h-[450px] w-96 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <AssistantThread />
        </AssistantModalPrimitive.Content>
      </AssistantModalPrimitive.Root>
      {/* <BrowserAlertTool /> */}
    </AssistantChatProvider>
  );
}



// function BrowserAlertTool() {
//   useAssistantTool({
//     toolName: 'frontend_tool_browser_alert',
//     description: 'Display a native browser alert dialog to the user.',
//     parameters: {
//       type: 'object',
//       properties: {
//         message: {
//           type: 'string',
//           description: 'Text to display inside the alert dialog.',
//         },
//       },
//       required: ['message'],
//     },
//     execute: async ({ message }) => {
//       console.log('Executing browser alert with message:', message);
//       alert(message);
//       return { status: 'shown' };
//     },
//     render: ({ args, result }) => (
//       <div className="mt-3 w-full max-w-[var(--thread-max-width)] rounded-lg border px-4 py-3 text-sm">
//         <p className="font-semibold text-muted-foreground">frontend_tool_browser_alert</p>
//         <p className="mt-1">
//           Requested alert with message:
//           <span className="ml-1 font-mono text-foreground">
//             {JSON.stringify(args.message)}
//           </span>
//         </p>
//         {result?.status === 'shown' && (
//           <p className="mt-2 text-foreground/70 text-xs">
//             Alert displayed in this tab.
//           </p>
//         )}
//       </div>
//     ),
//   });

//   return null;
// }
