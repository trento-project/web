// AG-UI event factories for tests/stories.
//
// Each helper builds a single event payload of the matching AG-UI type.
// `buildAssistantTurn` composes a complete RUN_STARTED → text streaming →
// RUN_FINISHED sequence; consumers decide how to emit it (sync, with delays,
// inside an act() wrapper, etc.).

export const aguiEvents = {
  runStarted: ({ threadId, runId }) => ({
    type: 'RUN_STARTED',
    threadId,
    runId,
  }),
  runFinished: ({ threadId, runId }) => ({
    type: 'RUN_FINISHED',
    threadId,
    runId,
  }),
  runError: ({ message }) => ({ type: 'RUN_ERROR', message }),
  textStart: ({ messageId, role = 'assistant' }) => ({
    type: 'TEXT_MESSAGE_START',
    messageId,
    role,
  }),
  textContent: ({ messageId, delta }) => ({
    type: 'TEXT_MESSAGE_CONTENT',
    messageId,
    delta,
  }),
  textEnd: ({ messageId }) => ({ type: 'TEXT_MESSAGE_END', messageId }),
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
