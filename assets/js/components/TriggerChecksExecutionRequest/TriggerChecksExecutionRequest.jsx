import React, { useContext, useEffect } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';

import { ChecksExecutionContext } from '@components/ChecksExecutionContext';
import { useSelector } from 'react-redux';
import { getLastExecution } from '@state/selectors/lastExecutions';
import { REQUESTED_EXECUTION_STATE } from '@state/lastExecutions';

function TriggerChecksExecutionRequest({
  clusterId,
  cssClasses,
  children,
  hosts = [],
  checks = [],
  ...props
}) {
  const navigate = useNavigate();

  const startExecution = useContext(ChecksExecutionContext);

  const lastExecution = useSelector(getLastExecution(clusterId));

  useEffect(() => {
    if (lastExecution?.data?.status === REQUESTED_EXECUTION_STATE) {
      navigate(`/clusters/${clusterId}/executions/last`);
    }
  }, [lastExecution]);

  return (
    <button
      className={classNames(
        'items-center text-sm border-green-500 px-2 text-jungle-green-500 bg-white border border-green hover:opacity-75 focus:outline-none transition ease-in duration-200 text-center font-semibold rounded shadow',
        cssClasses
      )}
      type="button"
      onClick={() => {
        startExecution(clusterId, hosts, checks);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default TriggerChecksExecutionRequest;
