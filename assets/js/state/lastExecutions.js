import { createSlice } from '@reduxjs/toolkit';

export const RUNNING_EXECUTION_STATE = 'running';
export const REQUESTED_EXECUTION_STATE = 'requested';
export const COMPLETED_EXECUTION_STATE = 'completed';

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
      const { groupID: clusterID, targets } = payload;

      const lastExecutionState = {
        ...initialExecutionState,
        data: {
          status: RUNNING_EXECUTION_STATE,
          targets,
        },
      };
      state[clusterID] = lastExecutionState;
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
  },
});

export const UPDATE_LAST_EXECUTION = 'UPDATE_LAST_EXECUTION';
export const EXECUTION_REQUESTED = 'EXECUTION_REQUESTED';

export const updateLastExecution = (groupID) => ({
  type: UPDATE_LAST_EXECUTION,
  payload: { groupID },
});

export const executionRequested = (clusterID, hosts, checks, navigate) => ({
  type: EXECUTION_REQUESTED,
  payload: { clusterID, hosts, checks, navigate },
});

export const {
  setLastExecutionLoading,
  setLastExecution,
  setLastExecutionEmpty,
  setLastExecutionError,
  setExecutionRequested,
  setExecutionStarted,
} = lastExecutionsSlice.actions;

export default lastExecutionsSlice.reducer;
