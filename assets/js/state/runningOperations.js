import { createSlice } from '@reduxjs/toolkit';

export const OPERATION_COMPLETED = 'OPERATION_COMPLETED';
export const OPERATION_REQUESTED = 'OPERATION_REQUESTED';

export const operationCompleted = ({
  operationID,
  groupID,
  operation,
  result,
}) => ({
  type: OPERATION_COMPLETED,
  payload: { operationID, groupID, operation, result },
});

export const operationRequested = ({ groupID, operation, params }) => ({
  type: OPERATION_REQUESTED,
  payload: { groupID, operation, params },
});

const initialState = {};

const initialOperationState = {
  operation: null,
};

export const runningOperationsSlice = createSlice({
  name: 'runningOperations',
  initialState,
  reducers: {
    removeRunningOperation: (state, { payload }) => {
      const { groupID } = payload;

      delete state[groupID];
    },
    setRunningOperation: (state, { payload }) => {
      const { groupID, operation } = payload;

      state[groupID] = {
        ...initialOperationState,
        operation,
      };
    },
  },
});

export const { removeRunningOperation, setRunningOperation } =
  runningOperationsSlice.actions;

export default runningOperationsSlice.reducer;
