export const getLastExecution =
  (groupID) =>
  ({ lastExecutions }) => {
    return lastExecutions[groupID];
  };
