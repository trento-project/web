import { createSelector } from '@reduxjs/toolkit';
import { get } from 'lodash';

const getRunningOperations = ({ runningOperations }) => runningOperations;

export const getRunningOperation = (groupID) =>
  createSelector([getRunningOperations], (runningOperations) =>
    get(runningOperations, groupID, {})
  );
