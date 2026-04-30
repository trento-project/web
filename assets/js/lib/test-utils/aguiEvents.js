// AG-UI event factories for tests/stories.
//
// Each helper builds a single event payload of the matching AG-UI type
// (sourced from `@ag-ui/core`'s `EventType` enum so the spec stays
// single-source). `buildAssistantTurn` composes a complete RUN_STARTED →
// text streaming → RUN_FINISHED sequence; consumers decide how to emit it
// (sync, with delays, inside an act() wrapper, etc.).

import { EventType } from '@ag-ui/core';

export const aguiEvents = {
  runStarted: ({ threadId, runId }) => ({
    type: EventType.RUN_STARTED,
    threadId,
    runId,
  }),
  runFinished: ({ threadId, runId }) => ({
    type: EventType.RUN_FINISHED,
    threadId,
    runId,
  }),
  runError: ({ message }) => ({ type: EventType.RUN_ERROR, message }),
  textStart: ({ messageId, role = 'assistant' }) => ({
    type: EventType.TEXT_MESSAGE_START,
    messageId,
    role,
  }),
  textContent: ({ messageId, delta }) => ({
    type: EventType.TEXT_MESSAGE_CONTENT,
    messageId,
    delta,
  }),
  textEnd: ({ messageId }) => ({
    type: EventType.TEXT_MESSAGE_END,
    messageId,
  }),
};

export function buildAssistantTurn({ threadId, runId, messageId, deltas }) {
  return [
    aguiEvents.runStarted({ threadId, runId }),
    aguiEvents.textStart({ messageId }),
    ...deltas.map((delta) => aguiEvents.textContent({ messageId, delta })),
    aguiEvents.textEnd({ messageId }),
    aguiEvents.runFinished({ threadId, runId }),
  ];
}
