import { createSelector } from '@reduxjs/toolkit';
import { pipe, find } from 'lodash/fp';
import { flatMap, get, has } from 'lodash';

const getRunningOperations = ({ runningOperations }) => runningOperations;

export const getRunningOperation = (groupID) =>
  createSelector(getRunningOperations, (runningOperations) =>
    get(runningOperations, groupID, null)
  );

export const getRunningOperationsList = createSelector(
  getRunningOperations,
  (runningOperations) =>
    flatMap(runningOperations, (value, key) => ({ groupID: key, ...value }))
);

const defaultMatcher = (_) => true;

export const isOperationRunning = (
  runningOperationsList,
  groupID,
  operation,
  matcher = defaultMatcher
) =>
  pipe(
    find({ groupID, operation }),
    (foundItem) => !!foundItem && matcher(foundItem)
  )(runningOperationsList);

export const getLocalOrTargetParams = (metadata) =>
  has(metadata, 'targets')
    ? get(metadata, 'targets[0].arguments', {})
    : get(metadata, 'params', {});
