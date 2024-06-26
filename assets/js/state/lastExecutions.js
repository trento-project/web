import { createSlice } from '@reduxjs/toolkit';

export const RUNNING_EXECUTION_STATE = 'running';
export const REQUESTED_EXECUTION_STATE = 'requested';
export const COMPLETED_EXECUTION_STATE = 'completed';

export const CLUSTER_EXECUTION_REQUESTED = 'CLUSTER_EXECUTION_REQUESTED';
export const HOST_EXECUTION_REQUESTED = 'HOST_EXECUTION_REQUESTED';
export const UPDATE_LAST_EXECUTION = 'UPDATE_LAST_EXECUTION';

export const executionRequested = (clusterID, hosts, checks) => ({
  type: CLUSTER_EXECUTION_REQUESTED,
  payload: { clusterID, hosts, checks },
});

export const hostExecutionRequested = (host, checks) => ({
  type: HOST_EXECUTION_REQUESTED,
  payload: { host, checks },
});

export const updateLastExecution = (groupID) => ({
  type: UPDATE_LAST_EXECUTION,
  payload: { groupID },
});

export const RUNNING_STATES = [
  RUNNING_EXECUTION_STATE,
  REQUESTED_EXECUTION_STATE,
];

const initialState = {};

const initialExecutionState = {
  data: null,
  loading: false,
  error: null,
};

export const lastExecutionsSlice = createSlice({
  name: 'lastExecutions',
  initialState,
  reducers: {
    setLastExecutionLoading: (state, { payload: groupID }) => {
      const lastExecutionState = {
        ...initialExecutionState,
        loading: true,
      };

      state[groupID] = lastExecutionState;
    },
    setLastExecutionEmpty: (state, { payload: groupID }) => {
      const lastExecutionState = {
        ...initialExecutionState,
      };

      state[groupID] = lastExecutionState;
    },
    setLastExecution: (state, { payload }) => {
      const { group_id: groupID } = payload;

      const lastExecutionState = {
        ...initialExecutionState,
        data: payload,
      };

      state[groupID] = lastExecutionState;
    },
    setLastExecutionError: (state, { payload }) => {
      const { groupID, error } = payload;

      const lastExecutionState = {
        ...initialExecutionState,
        error,
      };

      state[groupID] = lastExecutionState;
    },
    setExecutionStarted: (state, { payload }) => {
      const { groupID, targets } = payload;

      const lastExecutionState = {
        ...initialExecutionState,
        data: {
          status: RUNNING_EXECUTION_STATE,
          targets,
        },
      };
      state[groupID] = lastExecutionState;
    },
    setExecutionRequested: (state, { payload }) => {
      const { clusterID: groupID, hosts, checks } = payload;

      const targets = hosts.map((host) => ({ agent_id: host, checks }));

      const lastExecutionState = {
        ...initialExecutionState,
        data: {
          status: REQUESTED_EXECUTION_STATE,
          targets,
        },
      };

      state[groupID] = lastExecutionState;
    },
    setHostChecksExecutionRequested: (state, { payload }) => {
      const { checks, host } = payload;
      const { id: groupID } = host;
      const targets = [{ agent_id: host, checks }];
      const lastExecutionState = {
        ...initialExecutionState,
        data: {
          status: REQUESTED_EXECUTION_STATE,
          targets,
        },
      };
      state[groupID] = lastExecutionState;
    },
  },
});

export const {
  setLastExecutionLoading,
  setLastExecution,
  setLastExecutionEmpty,
  setLastExecutionError,
  setExecutionRequested,
  setExecutionStarted,
  setHostChecksExecutionRequested,
} = lastExecutionsSlice.actions;

export default lastExecutionsSlice.reducer;
