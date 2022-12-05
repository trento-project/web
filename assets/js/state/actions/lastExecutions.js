export const UPDATE_LAST_EXECUTION = 'UPDATE_LAST_EXECUTION';

export const updateLastExecution = (groupID) => ({
  type: UPDATE_LAST_EXECUTION,
  payload: { groupID },
});
