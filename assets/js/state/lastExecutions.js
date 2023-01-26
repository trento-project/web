import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const initialExecutionState = {
  data: null,
  loading: false,
  executionStarted: false,
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
        executionStarted: true,
        data: payload,
      };

      state[groupID] = lastExecutionState;
    },
    setLastExecutionError: (state, { payload }) => {
      const { groupID, error } = payload;

      const lastExecutionState = {
        ...initialExecutionState,
        executionStarted: true,
        error,
      };

      state[groupID] = lastExecutionState;
    },
    setExecutionStarted: (state, { payload }) => {
      const { groupID: clusterID, checks: startedChecks } = payload;

      // The execution started event contains the information
      // about the checks "really" started in the execution
      // this checks could differ from the ones requested
      // because for some reason the checks could be skipped by
      // some conditions
      // we want to make sure that only the real checks executed
      // are present into the state when an execution occur

      // eslint-disable-next-line prefer-destructuring
      const targets = state[clusterID].data.targets;
      const targetsWithCheckUsedInExecution = targets.map((target) => ({
        ...target,
        checks: target.checks.filter((checkID) =>
          startedChecks.includes(checkID)
        ),
      }));

      state[clusterID].data.targets = targetsWithCheckUsedInExecution;
      state[clusterID].executionStarted = true;
      state[clusterID].error = null;
    },
    setExecutionRequested: (state, { payload }) => {
      const { clusterID: groupID, hosts, checks } = payload;

      const targets = hosts.map((host) => ({ agent_id: host, checks }));

      const lastExecutionState = {
        ...initialExecutionState,
        data: {
          status: 'running',
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
