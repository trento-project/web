import { createSelector } from '@reduxjs/toolkit';
import { find, flatMap, get } from 'lodash';

const getRunningOperations = createSelector(
  [(state) => state.runningOperations],
  (runningOperations) => runningOperations
);

export const getRunningOperation = (groupID) =>
  createSelector([getRunningOperations], (runningOperations) =>
    get(runningOperations, groupID, {})
  );

export const getRunningOperationsList = () =>
  createSelector([getRunningOperations], (runningOperations) =>
    flatMap(runningOperations, (value, key) => ({ groupID: key, ...value }))
  );

export const isOperationRunning = (runningOperationsList, groupID, operation) =>
  !!find(runningOperationsList, { groupID, operation });
