// AG-UI event factories for tests/stories.
//
// Each helper builds a single event payload of the matching AG-UI type
// (sourced from `@lib/ai`'s EVENT_TYPES so the spec stays single-source).
// `buildAssistantTurn` composes a complete RUN_STARTED → text streaming →
// RUN_FINISHED sequence; consumers decide how to emit it (sync, with delays,
// inside an act() wrapper, etc.).

import { EVENT_TYPES } from '@lib/ai';

export const aguiEvents = {
  runStarted: ({ threadId, runId }) => ({
    type: EVENT_TYPES.RUN_STARTED,
    threadId,
    runId,
  }),
  runFinished: ({ threadId, runId }) => ({
    type: EVENT_TYPES.RUN_FINISHED,
    threadId,
    runId,
  }),
  runError: ({ message }) => ({ type: EVENT_TYPES.RUN_ERROR, message }),
  textStart: ({ messageId, role = 'assistant' }) => ({
    type: EVENT_TYPES.TEXT_MESSAGE_START,
    messageId,
    role,
  }),
  textContent: ({ messageId, delta }) => ({
    type: EVENT_TYPES.TEXT_MESSAGE_CONTENT,
    messageId,
    delta,
  }),
  textEnd: ({ messageId }) => ({
    type: EVENT_TYPES.TEXT_MESSAGE_END,
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
