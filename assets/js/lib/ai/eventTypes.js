// AG-UI event type identifiers used by the WebSocketAIAgent and the test
// fixtures that replay agent traffic. Mirrors the set defined by
// `@ag-ui/core`'s `EventType` enum — kept here so production code that only
// needs the type strings doesn't pull in the full ag-ui package.
export const EVENT_TYPES = Object.freeze({
  RUN_STARTED: 'RUN_STARTED',
  RUN_FINISHED: 'RUN_FINISHED',
  RUN_ERROR: 'RUN_ERROR',
  TEXT_MESSAGE_START: 'TEXT_MESSAGE_START',
  TEXT_MESSAGE_CONTENT: 'TEXT_MESSAGE_CONTENT',
  TEXT_MESSAGE_END: 'TEXT_MESSAGE_END',
});
