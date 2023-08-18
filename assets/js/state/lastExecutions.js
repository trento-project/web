import { createSlice } from '@reduxjs/toolkit';

export const RUNNING_EXECUTION_STATE = 'running';
export const REQUESTED_EXECUTION_STATE = 'requested';
export const COMPLETED_EXECUTION_STATE = 'completed';

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
      console.log('setExecutionRequested');
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
      const { hostID, checks, resourceType } = payload;
      console.log(payload);
      console.log('HostExecution Slice was activated');
      console.log(hostID, checks, resourceType);

      const lastExecutionState = {
        ...initialExecutionState,
      };
      console.log(state[hostID])
      state[hostID] = lastExecutionState;
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
