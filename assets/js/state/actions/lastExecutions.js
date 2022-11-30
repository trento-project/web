export const updateLastExecutionAction = 'UPDATE_LAST_EXECUTION';

export const updateLastExecution = (groupID) => {
  return {
    type: updateLastExecutionAction,
    payload: { groupID: groupID },
  };
};
