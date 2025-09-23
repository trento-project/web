import { createSelector } from '@reduxjs/toolkit';
import { get, } from 'lodash';

export const getPreflightOperation = (groupID, operation) =>
  createSelector(
    ({ preflightOperations }) => preflightOperations,
    (preflightOperations) =>
      get(preflightOperations, `${groupID}-${operation}`, null)
  );
