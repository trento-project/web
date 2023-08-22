export const UPDATE_LAST_EXECUTION = 'UPDATE_LAST_EXECUTION';
export const EXECUTION_REQUESTED = 'EXECUTION_REQUESTED';
export const HOST_EXECUTION_REQUESTED = 'HOST_EXECUTION_REQUESTED';

export const updateLastExecution = (groupID) => ({
  type: UPDATE_LAST_EXECUTION,
  payload: { groupID },
});

export const executionRequested = (clusterID, hosts, checks, navigate) => ({
  type: EXECUTION_REQUESTED,
  payload: { clusterID, hosts, checks, navigate },
});

export const hostExecutionRequested = (hostID, checks, navigate) => ({
  type: HOST_EXECUTION_REQUESTED,
  payload: { hostID, checks, navigate },
});
