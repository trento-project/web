import { createAction, createSlice } from '@reduxjs/toolkit';
import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';

const SAVING = 'SAVING';
const SUCCESSFULLY_SAVED = 'SUCCESSFULLY_SAVED';
const SAVING_FAILED = 'SAVING_FAILED';

const supportsTarget = (target) =>
  [TARGET_CLUSTER, TARGET_HOST].includes(target);

const initialState = {
  [TARGET_HOST]: {},
  [TARGET_CLUSTER]: {},
};

const updateTargetState = (state, targetType, targetID, newState) => {
  if (supportsTarget(targetType)) {
    state[targetType] = {
      ...state[targetType],
      [targetID]: newState,
    };
  }
};

export const checksSelectionSlice = createSlice({
  name: 'checksSelection',
  initialState,
  reducers: {
    startSavingChecksSelection: (
      state,
      { payload: { targetID, targetType } }
    ) => {
      updateTargetState(state, targetType, targetID, {
        status: SAVING,
      });
    },
    setSavingSuccessful: (state, { payload: { targetID, targetType } }) => {
      updateTargetState(state, targetType, targetID, {
        status: SUCCESSFULLY_SAVED,
      });
    },
    setSavingFailed: (state, { payload: { targetID, targetType } }) => {
      updateTargetState(state, targetType, targetID, {
        status: SAVING_FAILED,
      });
    },
  },
});

export const HOST_CHECKS_SELECTED = 'HOST_CHECKS_SELECTED';
export const hostChecksSelected = createAction(HOST_CHECKS_SELECTED);

export const CLUSTER_CHECKS_SELECTED = 'CLUSTER_CHECKS_SELECTED';
export const clusterChecksSelected = createAction(CLUSTER_CHECKS_SELECTED);

export const {
  startSavingChecksSelection,
  setSavingSuccessful,
  setSavingFailed,
} = checksSelectionSlice.actions;

export default checksSelectionSlice.reducer;
