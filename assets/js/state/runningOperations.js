import { createSlice } from '@reduxjs/toolkit';

export const OPERATION_COMPLETED = 'OPERATION_COMPLETED';
export const OPERATION_REQUESTED = 'OPERATION_REQUESTED';
export const UPDATE_RUNNING_OPERATION = 'UPDATE_RUNNING_OPERATION';

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

export const updateRunningOperation = (groupID) => ({
  type: UPDATE_RUNNING_OPERATION,
  payload: { groupID },
});

const initialState = {};

const initialOperationState = {
  operation: null,
  forbidden: false,
  errors: [],
};

export const runningOperationsSlice = createSlice({
  name: 'runningOperations',
  initialState,
  reducers: {
    removeRunningOperation: (state, { payload }) => {
      const { groupID } = payload;

      delete state[groupID];
    },
    setForbiddenOperation: (state, { payload }) => {
      const { groupID, operation, errors } = payload;

      state[groupID] = {
        ...initialOperationState,
        operation,
        forbidden: true,
        errors,
      };
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

export const {
  removeRunningOperation,
  setForbiddenOperation,
  setRunningOperation,
} = runningOperationsSlice.actions;

export default runningOperationsSlice.reducer;
