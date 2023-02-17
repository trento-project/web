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
      state[groupID] = initialExecutionState;
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

      if (typeof state[clusterID] === 'undefined') {
        state[clusterID] = initialExecutionState;
      }

      if (state[clusterID].data === null) {
        state[clusterID].data = {};
      }

      state[clusterID].data.targets = targets;
      state[clusterID].data.status = RUNNING_EXECUTION_STATE;
      state[clusterID].error = null;
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

export const {
  setLastExecutionLoading,
  setLastExecution,
  setLastExecutionEmpty,
  setLastExecutionError,
  setExecutionRequested,
  setExecutionStarted,
} = lastExecutionsSlice.actions;

export default lastExecutionsSlice.reducer;
