import React from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  getClusterHostIDs,
  getClusterSelectedChecks,
} from '@state/selectors/cluster';
import { executionRequested } from '@state/actions/lastExecutions';

function TriggerChecksExecutionRequest({
  clusterId,
  cssClasses,
  usingNewChecksEngine = false,
  children,
  ...props
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hosts = useSelector(getClusterHostIDs(clusterId));
  const checks = useSelector(getClusterSelectedChecks(clusterId));

  return (
    <button
      className={classNames(
        'items-center text-sm border-green-500 px-2 text-jungle-green-500 bg-white border border-green hover:opacity-75 focus:outline-none transition ease-in duration-200 text-center font-semibold rounded shadow',
        cssClasses
      )}
      type="button"
      onClick={() => {
        dispatch(executionRequested(clusterId, hosts, checks));
        navigate(
          usingNewChecksEngine
            ? `/clusters_new/${clusterId}/executions/last`
            : `/clusters/${clusterId}/checks/results`
        );
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default TriggerChecksExecutionRequest;
