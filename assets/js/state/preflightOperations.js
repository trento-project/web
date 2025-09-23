import { createSlice } from '@reduxjs/toolkit';

export const OPERATION_PREFLIGHT_REQUESTED = 'OPERATION_PREFLIGHT_REQUESTED';

const operationKey = (groupID, operation) => `${groupID}-${operation}`;

const initialState = {};

const initialOperationState = {
  operation: null,
  allowed: false,
  errors: [],
  metadata: {},
};

export const requestOperationPreflight = ({ groupID, operation }) => ({
  type: OPERATION_PREFLIGHT_REQUESTED,
  payload: { groupID, operation },
});


export const preflightOperationsSlice = createSlice({
  name: 'preflightOperations',
  initialState,
  reducers: {
    removePreflightOperation: (state, { payload }) => {
      const { groupID, operation } = payload;
      const key = operationKey(groupID, operation);
      delete state[key];
    },
    setPreflightOperation: (state, { payload }) => {
      const { groupID, operation, errors } = payload;
      const allowed = errors && errors.length === 0;
      const key = operationKey(groupID, operation);

      state[key] = {
        ...initialOperationState,
        operation,
        allowed,
        errors,
      };
    },
  },
});


export const {
  removePreflightOperation,
  setPreflightOperation,
} = preflightOperationsSlice.actions;

export default preflightOperationsSlice.reducer;
