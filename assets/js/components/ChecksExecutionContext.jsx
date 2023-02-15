import React, { createContext, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';

import { executionRequested } from '@state/actions/lastExecutions';

export const ChecksExecutionContext = createContext(() => {});

export default function ChecksExecutionContextProvider({
  handleExecutionStart,
}) {
  const dispatch = useDispatch();

  const startExecution =
    typeof handleExecutionStart !== 'undefined'
      ? handleExecutionStart
      : useCallback(
          (clusterId, hostList, selectedChecks) => {
            dispatch(executionRequested(clusterId, hostList, selectedChecks));
          },
          [dispatch]
        );

  return (
    <ChecksExecutionContext.Provider value={startExecution}>
      <Outlet />
    </ChecksExecutionContext.Provider>
  );
}
