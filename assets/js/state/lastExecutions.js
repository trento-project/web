import { createSlice } from '@reduxjs/toolkit';

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
    setExecutionRequested: (state, { payload }) => {
      const { clusterID: groupID, hosts, checks } = payload;

      const targets = hosts.map((host) => ({ agent_id: host, checks: checks }));

      const lastExecutionState = {
        ...initialExecutionState,
        data: {
          status: 'running',
          targets: targets,
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
} = lastExecutionsSlice.actions;

export default lastExecutionsSlice.reducer;
